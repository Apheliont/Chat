const path = require('path');
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const {Users} = require('./users');
const {generateMessage} = require('./messageTemplate');
const sanitizeHtml = require('sanitize-html');

const app = express();
const vuePath = path.join(__dirname, '..');
const port = process.env.port || 80;
const server = http.createServer(app);
const io = socketIO(server);
//---------------------------------------------
// (function () {
//
//   // Step 1: Create & configure a webpack compiler
//   const webpack = require('webpack');
//   const webpackConfig = require(process.env.WEBPACK_CONFIG ? process.env.WEBPACK_CONFIG : '../webpack.config');
//   const compiler = webpack(webpackConfig);
//
//   // Step 2: Attach the dev middleware to the compiler & the server
//   app.use(require("webpack-dev-middleware")(compiler, {
//     noInfo: true, publicPath: webpackConfig.output.publicPath
//   }));
//
//   // Step 3: Attach the hot middleware to the compiler & the server
//   app.use(require("webpack-hot-middleware")(compiler, {
//     log: console.log, path: '/__webpack_hmr', heartbeat: 10 * 1000
//   }));
// })();
//---------------------------------


app.use(express.static(vuePath));
const users = new Users();


io.on('connection', (socket) => {
  // Попытка ввода имени пользователя
  socket.on('enterName', (name = 'Anonimous', callback) => {
    const result = users.addUser({id: socket.id, name});
    if (!result) {
      callback('Имя уже занято');
    } else {
      // Проапдейтить инфу на клиента о существующих чат румах
      socket.emit('groupInfoUpdate', users.getChatInfo());
      callback();
    }
  });

  socket.on('join', (group, callback) => {
    const user = users.getUser(socket.id);
    if (!user) {
      socket.emit('messageFromServer', generateMessage({message: 'Пожалуйста обновите страницу'}));
      return false;
    }
    const name = user.name;
    if (users.isUserInTheGroup(socket.id, group)) {
      callback('Пользователь уже в группе');
    } else {
      socket.join(group);
      users.joinGroup(socket.id, group);

      socket.emit('messageFromServer', generateMessage({group, message: `Добро пожаловать в группу ${group}`}));
      socket.to(group).emit('messageFromServer', generateMessage({name, group, message: `присоединил(ась)ся к группе`}));
      io.emit('groupInfoUpdate', users.getChatInfo());
      callback();
    }
  });

  socket.on('createGroup', (group, callback) => {
    const user = users.getUser(socket.id);
    if (!user) {
      socket.emit('messageFromServer', generateMessage({message: 'Пожалуйста обновите страницу'}));
      return false;
    }
    const name = user.name;
    const lowerCaseGroups = users.getGroups().map(groupEntity => groupEntity.toLowerCase());
    const duplicatedGroup = lowerCaseGroups.indexOf(group.toLowerCase());
    if (group.trim().length === 0) {
      callback('Пожалуйста заполните все поля');
    } else if (duplicatedGroup !== -1) {
      callback('Такая группа уже есть');
    } else {
      socket.join(group);
      users.joinGroup(socket.id, group);

      io.emit('messageFromServer', generateMessage({name, message: `создал(а) группу ${group}`}));
      io.emit('groupInfoUpdate', users.getChatInfo());
      callback();
    }
  });

  socket.on('leave', (group, callback) => {
    const name = users.getUser(socket.id).name;
    users.leaveGroup(socket.id, group);
    socket.leave(group);
    io.in(group).emit('messageFromServer', generateMessage({name, group, message: `покинул(а) группу`}));
    io.emit('groupInfoUpdate', users.getChatInfo());
    callback();
  });

  socket.on('messageToServer', (data, callback) => {
    const {message, group} = data;
    const currentDate = new Date();
    const user = users.getUser(socket.id);
    if (user) {
      const {name} = user;
      const cleanMessage = sanitizeHtml(message);
      socket.to(group).emit('messageFromServer', generateMessage({name, group, message: cleanMessage, messageSource: 2}));
      callback({date:`${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}`, message: cleanMessage});
    }
  });

  socket.on('disconnect', () => {
    const user = users.getUser(socket.id);
    if (user) {
      const name = user.name;
      for (const group of user.groups) {
        socket.to(group).emit('messageFromServer', generateMessage({name, group, message: `покинул(а) чат`}));
      }
      users.removeUser(socket.id);
      io.emit('groupInfoUpdate', users.getChatInfo());
    }
  });
});


server.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});

