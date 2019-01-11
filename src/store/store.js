import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export const store = new Vuex.Store({
  state: {
    chatMessages: [], //name, group, message, date, messageSource
    joinedGroups: [],
    currentGroup: "",
    serverGroupsInfo: [],
    userName: "",
    inputText: ""
  },
  getters: {
    getGroups(state) {
      return state.joinedGroups;
    },
    getCurrentGroup(state) {
      return state.currentGroup;
    },
    canUserSendMessage(state, getters) {
      return getters.getGroups.length > 0 && getters.getInputText.length > 0;
    },
    getMessagesForCurrentGroup(state, getters) {
      const currentGroup = getters.getCurrentGroup;
      return state.chatMessages.filter(message => {
        return message.group === currentGroup || message.group === "";
      });
    },
    getUserName(state) {
      return state.userName;
    },
    getServerGroupsInfo(state) {
      return state.serverGroupsInfo;
    },
    getInputText(state) {
      return state.inputText;
    }
  },
  mutations: {
    updateJoinedGroups(state, payload) {
      state.joinedGroups = payload;
    },
    addGroup(state, payload) {
      if (state.joinedGroups.indexOf(payload) < 0) {
        state.joinedGroups.push(payload);
      }
    },
    leaveGroup(state, payload) {
      // Удаляем все сообщения
      state.chatMessages = state.chatMessages.filter(message => {
        return message.group !== payload;
      });
      const index = state.joinedGroups.indexOf(payload);
      const lastIndex = state.joinedGroups.length - 1;
      state.joinedGroups.splice(index, 1);
      // если таб который мы зыкрыли также был активным табом, нужно выбрать новый активный таб
      if (payload === state.currentGroup) {
        // если там был последним в списке табов, то новый активный будет предыдущий элемент
        if (index === lastIndex) {
          // если это была вообще самая последняя вкладка то убрать активный таб совсем
          if (lastIndex === -1) {
            state.currentGroup = "";
          } else {
            state.currentGroup = state.joinedGroups[index - 1];
          }
        } else {
          state.currentGroup = state.joinedGroups[index];
        }
      }
    },
    setInputText(state, payload) {
      state.inputText = payload;
    },
    setCurrentGroup(state, payload) {
      state.currentGroup = payload;
    },
    leaveAllGroups(state) {
      state.joinedGroups = [];
    },
    saveMessage(state, payload) {
      state.chatMessages.push(payload);
    },
    setUserName(state, payload) {
      state.userName = payload;
    },
    SOCKET_CONNECT(state) {
      const message = {
        name: "",
        group: "",
        message: "Соединение установлено :)",
        date: `wohoo!`,
        messageSource: 0
      };
      state.chatMessages.push(message);
    },
    SOCKET_MESSAGEFROMSERVER(state, message) {
      if (Array.isArray(message)) {
        for (let mes of message.reverse()) {
          state.chatMessages.push(JSON.parse(mes));
        }
      } else {
        state.chatMessages.push(message);
      }
    },
    SOCKET_DISCONNECT(state) {
      const message = {
        name: "",
        group: "",
        message: "Соединение разорвано :(",
        date: `fuck`,
        messageSource: 0
      };
      state.joinedGroups = [];
      state.chatMessages.push(message);
      state.currentGroup = "";
      state.serverGroupsInfo = [];
      state.userName = "";
    },
    SOCKET_GROUPINFOUPDATE(state, payload) {
      state.serverGroupsInfo = payload;
    }
  },

  actions: {
    setUserName({ commit }, payload) {
      commit("setUserName", payload);
    },
    setCurrentGroup({ commit }, payload) {
      commit("setCurrentGroup", payload);
    },
    addGroup({ commit }, payload) {
      commit("addGroup", payload);
    }
  }
});
