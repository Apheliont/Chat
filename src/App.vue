<template>
  <div class="wrapper">
    <div class="chat rounded px-3 pb-3 pt-2">
      <app-tabs class="chat__tabs"></app-tabs>
      <app-chat class="chat__messageWindow"></app-chat>
    </div>
    <app-preferences class="preferences"></app-preferences>
  </div>
</template>

<script>
  import Chat from './components/Chat';
  import Preferences from './components/Preferences/Preferences';
  import Tabs from './components/Tabs/Tabs';

  export default {
    components: {
      appChat: Chat,
      appPreferences: Preferences,
      appTabs: Tabs
    },
    methods: {
      // Функция устанавливает иконку на табе приложения
      changeTabIcon(iconUrl) {
        let iconElement = document.head.querySelector('#favicon');
        if (!iconElement) {
          iconElement = document.createElement('link');
          iconElement.setAttribute('id', 'favicon');
          iconElement.setAttribute('rel', 'icon');
          iconElement.setAttribute('href', iconUrl);
          document.head.appendChild(iconElement);
        } else {
          iconElement.setAttribute('href', iconUrl);
        }
      }
    },
    created() {
      // Устанавливаем лого таба первый раз
      this.changeTabIcon('src/assets/favicon.png');
      // Подписываемся для отслеживания мутаций и если происходит прием нового сообщения проверяем активный ли наш таб
      this.$store.subscribe((mutation, state) => {
        if (mutation.type === 'SOCKET_MESSAGEFROMSERVER' && document.hidden) {
          if (mutation.payload.messageSource) {
            this.changeTabIcon('src/assets/favicon-new-message.png');
          }
        }
        if (mutation.type === 'SOCKET_CONNECT') {
          this.changeTabIcon('src/assets/favicon.png');
        }
      });
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
          this.changeTabIcon('src/assets/favicon.png');
        }
      });
    }
  }
</script>

<style scoped lang="scss">
  .chat {
    display: flex;
    flex-flow: column;
    position: relative;
    margin: 0;
    grid-area: chat;
    box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.4);
    max-width: 800px;
  }

  .chat:after {
    content: "";
    @include background_1();
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    position: absolute;
    z-index: -1;
    border-radius: 5px;
  }

  .chat__tabs {
    padding: 10px 20px 0 20px;
  }

  .preferences {
    position: relative;
    grid-area: preferences;
    box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.4);
  }

  .preferences:after {
    content: "";
    @include background_1();
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    position: absolute;
    z-index: -1;
    border-radius: 5px;
  }

  .wrapper {
    display: grid;
    grid-row-gap: 20px;
    margin-top: 10px;
    justify-items: stretch;
    justify-content: center;
    grid-template-columns: 320px;
    grid-template-rows: auto 416px;
    grid-template-areas: "chat" "preferences";
    background-color: transparent;

    @include breakpoint(desktop) {
      grid-template-columns: 1fr 1fr 810px 270px 1fr;
      grid-template-areas: ". . chat preferences .";
      margin-top: 100px;
    }
  }
</style>
