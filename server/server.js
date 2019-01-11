const path = require("path");
const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const { Users } = require("./users");
const { generateMessage } = require("./messageTemplate");
const sanitizeHtml = require("sanitize-html");
require("dotenv").config({ path: "variables.env" });
const db = require("./database");

const app = express();
const publicContent = path.join(__dirname, "..", "public");
const port = process.env.port || 80;
const server = http.createServer(app);
const io = socketIO(server);

const ActiveDirectory = require("activedirectory");
const config = {
  url: process.env.AD_SERVER,
  baseDN: process.env.AD_BASEDN,
  username: process.env.AD_USER,
  password: process.env.AD_PASSWORD
};
const ad = new ActiveDirectory(config);

app.use(express.static(publicContent));
const users = new Users();

// socket.io
io.on("connection", socket => {
  // Попытка ввода имени пользователя
  socket.on("enterName", (name = "Anonimous", callback) => {
    const sAMAccountName = name;
    let result = null;
    // Если в AD найден пользователь с указанным sAMAccountName то подставляется его Имя + Фамилия, в противном случае введеный sAMAccountName
    // будет указан как NickName
    ad.findUser(sAMAccountName, function(err, user) {
      if (err) {
        console.log(err);
      }

      if (!user || user.length === 0) {
        result = users.addUser({ id: socket.id, name: `*${name}` });
      } else {
        name = JSON.stringify(user.displayName)
          .replace(/\"/g, "")
          .split(" ")
          .slice(0, 2)
          .join(" ");
        result = users.addUser({ id: socket.id, name });
      }

      if (!result) {
        callback("Имя уже занято");
      } else {
        console.log(`${name} connected`);
        // Проапдейтить инфу на клиента о существующих чат румах
        socket.emit("groupInfoUpdate", users.getChatInfo());
        callback();
      }
    });
  });

  socket.on("join", (group, callback) => {
    const user = users.getUser(socket.id);
    if (!user) {
      socket.emit(
        "messageFromServer",
        generateMessage({ message: "Пожалуйста обновите страницу" })
      );
      return false;
    }
    const name = user.name;
    if (users.isUserInTheGroup(socket.id, group)) {
      callback("Пользователь уже в группе");
    } else {
      socket.join(group);
      users.joinGroup(socket.id, group);
      // вставить сюда мессаджи из чата
      db.getMessages(group).then(res => {
        socket.emit("messageFromServer", res);
        socket.emit(
          "messageFromServer",
          generateMessage({
            group,
            message: `Добро пожаловать в группу ${group}`
          })
        );
        socket.to(group).emit(
          "messageFromServer",
          generateMessage({
            name,
            group,
            message: `присоединил(ась)ся к группе`
          })
        );
        io.emit("groupInfoUpdate", users.getChatInfo());
        callback();
      });
    }
  });

  socket.on("createGroup", (group, callback) => {
    const user = users.getUser(socket.id);
    if (!user) {
      socket.emit(
        "messageFromServer",
        generateMessage({ message: "Пожалуйста обновите страницу" })
      );
      return false;
    }
    const name = user.name;
    const lowerCaseGroups = users
      .getGroups()
      .map(groupEntity => groupEntity.toLowerCase());
    const duplicatedGroup = lowerCaseGroups.indexOf(group.toLowerCase());
    if (group.trim().length === 0) {
      callback("Пожалуйста заполните все поля");
    } else if (duplicatedGroup !== -1) {
      callback("Такая группа уже есть");
    } else {
      socket.join(group);
      users.joinGroup(socket.id, group);

      io.emit(
        "messageFromServer",
        generateMessage({ name, message: `создал(а) группу ${group}` })
      );
      io.emit("groupInfoUpdate", users.getChatInfo());
      callback();
    }
  });

  socket.on("leave", (group, callback) => {
    const name = users.getUser(socket.id).name;
    users.leaveGroup(socket.id, group);
    socket.leave(group);
    io.in(group).emit(
      "messageFromServer",
      generateMessage({ name, group, message: `покинул(а) группу` })
    );
    io.emit("groupInfoUpdate", users.getChatInfo());
    callback();
  });

  socket.on("messageToServer", (data, callback) => {
    const { message, group } = data;
    const currentDate = new Date();
    const user = users.getUser(socket.id);
    if (user) {
      const { name } = user;
      const cleanMessage = sanitizeHtml(message, {
        allowedTags: ["a"],
        allowedAttributes: {
          a: ["href", "target", "style"]
        }
      });
      const generatedMessage = generateMessage({
        name,
        group,
        message: cleanMessage,
        messageSource: 2
      });
      // запихнуть сообщение в базу
      db.saveMessage(group, generatedMessage);

      socket.to(group).emit("messageFromServer", generatedMessage);
      callback({
        date: `${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}`,
        message: cleanMessage
      });
    }
  });

  socket.on("disconnect", () => {
    const user = users.getUser(socket.id);
    if (user) {
      const name = user.name;
      console.log(`${name} disconnected`);
      for (const group of user.groups) {
        socket
          .to(group)
          .emit(
            "messageFromServer",
            generateMessage({ name, group, message: `покинул(а) чат` })
          );
      }
      users.removeUser(socket.id);
      io.emit("groupInfoUpdate", users.getChatInfo());
    }
  });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
