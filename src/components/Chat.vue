<template>
  <div class="rounded m-0">
    <transition-group name="chatWindow" class="chatWindow rounded d-flex flex-column" ref="chatWindow"
                      tag="div">
      <blockquote v-for="(data, index) in getMessagesForCurrentGroup"
                  :class="calculateClass(data.messageSource)"
                  :key="index">
        <span v-if="data.messageSource !== 0" class="chatWindow__username">{{data.name}}: </span>
        <span v-if="data.messageSource === 0" class="chatWindow__username-info">{{data.name}} </span>
        <span :inner-html.prop="data.message | makeLink"></span>
        <span class="chatWindow__date">
            {{data.date}}
          </span>
      </blockquote>
    </transition-group>
    <form class="mt-3 d-flex input-form">
      <div class="w-100 mr-3 input-form__wrapper">
        <div ref="userName" class="userName" v-if="getUserName">{{getUserName}} :></div>
        <textarea
          ref="chatArea"
          class="form-control input-form__text-area"
          id="chatArea" rows="1"
          v-model="inputText"
          @keypress.enter="sendMessage"
        >
          </textarea>
      </div>
      <div class="align-self-center input-form__send-btn-container">
        <button class="btn btn-success" @click.prevent="sendMessage" :disabled="!canUserSendMessage">Отправить</button>
      </div>
    </form>
  </div>
</template>

<script>
  import {appBus} from '../main';
  import {mapGetters} from 'vuex';

  export default {
    computed: {
      ...mapGetters([
        'getCurrentGroup',
        'canUserSendMessage',
        'getMessagesForCurrentGroup',
        'getUserName'
      ]),
      inputText: {
        get() {
          return this.$store.getters.getInputText;
        },
        set(value) {
          this.$store.commit('setInputText', value);
        }
      },
    },
    filters: {
      makeLink(value) {
        return value.replace(/https?:\/\/(w{3}\.)?\S+|\bw{3}\.\S+|\b\w+?(?:\.ru|\.com|\.net|\.org|\.su|\.edu|\.gov|\.info|\.de|.uk)\b/ig, function(match) {
          return match.search(/https?:\/\//) === -1 ?
            `<a href="http://${match}" style="color: rgb(107,255,98)" target="_blank">${match}</a>` :
            `<a href="${match}" style="color: rgb(107,255,98)" target="_blank">${match}</a>`
        });
      }
    },
    watch: {
      getCurrentGroup() {
        this.scrollChatWindowDown();
      },
      getMessagesForCurrentGroup() {
        this.scrollChatWindowDown();
      },
      getUserName() {
        this.$nextTick(() => {
          if (this.$refs.userName) {
            this.$refs.chatArea.style.paddingLeft = this.$refs.userName.clientWidth + 10 + 'px';
          }
        });
      }
    },
    methods: {
      calculateClass(source) {
        switch (source) {
          case 0:
            return 'chatWindow__infoMessage';
          case 1:
            return 'chatWindow__selfMessage';
          case 2:
            return 'chatWindow__userMessage';
        }
      },
      sendMessage(e) {
        if (!this.canUserSendMessage) {
          e.preventDefault();
          return false;
        }

        const myMessage = {
          name: 'Я',
          group: this.getCurrentGroup,
          date: `unsent`,
          messageSource: 1
        };
        this.$socket.emit('messageToServer', {message: this.inputText, group: this.getCurrentGroup}, ({date, message}) => {
          myMessage.date = date;
          myMessage.message = message;
          this.saveMessage(myMessage);
          this.inputText = '';
        });
      },

      saveMessage(data) {
        this.$store.commit('saveMessage', data);
      },

      scrollChatWindowDown() {
        setTimeout(() => {
          this.$refs.chatWindow.$el.scrollTop = this.$refs.chatWindow.$el.scrollHeight;
        }, 0);
      }
    },
    mounted() {
      appBus.$on('focusOnChatArea', () => {
        this.$refs.chatArea.focus();
      });
    }
  }
</script>

<style scoped lang="scss">
  .chatWindow {
    resize: vertical;
    height: 300px;
    padding: 10px;
    background-color: $chat-window-bg;
    overflow-y: scroll;
    overflow-x: hidden;
  }

  .chatWindow::-webkit-scrollbar-thumb {
    border-radius: 0 6px 6px 0;
    background-color: $chat-window-scroll-thumb;
  }

  .chatWindow::-webkit-scrollbar {
    width: 12px;
  }

  .input-form__text-area {
    resize: vertical;
    min-height: 80px;
    outline: none;
    box-shadow: none !important;
    border: 1px solid #ccc !important;

    @include breakpoint(desktop) {
      min-height: 38px;
    }
  }

  .input-form {
    flex-flow: column wrap;
    @include breakpoint(desktop) {
      flex-flow: row nowrap;
    }
  }

  .input-form__wrapper {
    position: relative;
  }

  .input-form__send-btn-container {
    margin-top: 15px;
    @include breakpoint(desktop) {
      margin-top: 0;
    }
  }

  .userName {
    position: absolute;
    left: 10px;
    top: 7px;
    width: auto;
  }

  .chatWindow__userMessage {
    align-self: flex-start;
    position: relative;
    background-color: $chat-user-message-bg;
    color: $chat-user-message;
    border-radius: 5px;
    padding: 5px 10px 15px 10px;
    min-width: 60px;
  }

  .chatWindow__userMessage:after {
    position: absolute;
    content: "";
    display: block;
    width: 10px;
    height: 15px;
    top: 5px;
    left: -9px;
    background-color: $chat-user-message-bg;
    clip-path: polygon(0 0, 100% 0, 100% 55%);
  }

  .chatWindow__selfMessage {
    position: relative;
    background-color: $chat-self-message-bg;
    color: $chat-self-message;
    align-self: flex-end;
    border-radius: 5px;
    padding: 5px 10px 15px 10px;
    min-width: 60px;
  }

  .chatWindow__selfMessage:after {
    position: absolute;
    content: "";
    display: block;
    width: 10px;
    height: 15px;
    top: 5px;
    right: -9px;
    background-color: $chat-self-message-bg;
    clip-path: polygon(100% 0, 0 0, 0 55%);
  }

  .chatWindow__infoMessage {
    position: relative;
    background-color: $chat-info-message-bg;
    color: $chat-info-message;
    align-self: center;
    border-radius: 5px;
    padding: 5px 10px 15px 10px;
    min-width: 60px;
  }


  a {

     }

  a:hover {
    color: rgba(255, 164, 0, 0.67);
  }

  .chatWindow__username {
    color: $chat-user-name;
  }

  .chatWindow__username-info {
    color: $chat-user-name;
  }

  .chatWindow__date {
    position: absolute;
    bottom: 3px;
    right: 11px;
    font: bold italic 10px sans-serif;
    color: $chat-time-stamp;
  }

  .chatWindow-enter {
    opacity: 0;
    transform: translateX(-50px);
  }

  .chatWindow-enter-active {
    transition-duration: 0.4s;
  }

  .chatWindow-leave {

  }

  .chatWindow-leave-active {

  }
</style>
