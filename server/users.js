class Users {
  constructor() {
    this.users = [];
    this.groups = new Set();
  }

  addUser(obj) {
    const {name} = obj;
    for (const user of this.users) {
      // если пользователь с таким именем уже есть вернуть false
      if (user.name === name) {
        return false;
      }
    }
    // если все ок, добавляем пользователя
    this.users.push({...obj, groups: new Set()}); // {id, name, groups}
    return true;
  }

  getUser(id) {
    return this.users.find(user => {
      return user.id === id;
    });
  }

  getUsersList(group) {
    const usersObjArr = this.users.filter(user => {
      return user.groups.has(group);
    });
    if (usersObjArr.length === 0) {
      return [];
    }
    return usersObjArr.map(user => {
      return user.name;
    })
  }

  removeUser(id) {
    const user = this.getUser(id);
    if (user) {
      // Узнать в каких группах был пользователь
      const userRooms = Array.from(user.groups);
      for (const group of userRooms) {
        this.leaveGroup(id, group);
      }
      // Удалить пользователя из активных пользователей чата
      this.users.splice(this.users.indexOf(user), 1);

    }
  }

  leaveGroup(id, group) {
    const user = this.getUser(id);
    if (user) {
      user.groups.delete(group);
      // Если в группе где был пользователь больше нет никого, удалить саму группу
      const remainingUsersInRoom = this.getUsersList(group).length;
      if (remainingUsersInRoom === 0) {
        this.groups.delete(group);
      }
    }
  }

  joinGroup(id, group) {
    const user = this.getUser(id);
    if (user) {
      user.groups.add(group);
      this.createGroup(group);
    }
  }

  isUserInTheGroup(id, group) {
    const user = this.getUser(id);
    return user.groups.has(group);
  }

  getGroups() {
    return Array.from(this.groups);
  }

  createGroup(group) {
    this.groups.add(group);
  }

  getChatInfo() {
    const groups = this.getGroups();
    let infoArray = [];
    for (let group of groups) {
      const userList = this.getUsersList(group);
      const infoObj = {
        group,
        userList
      };
      infoArray.push(infoObj);
    }
    return infoArray;
  }
}

module.exports.Users = Users;
