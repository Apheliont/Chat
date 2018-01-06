<template>
  <li class="tab__item" :class="{
  'tab__item--active': getCurrentGroup === group,
  'tab__item--unreadMessage': unreadMessage
  }">
    <div class="tab__container">
      <button class="tab__link" @click="setCurrentGroup(group)">{{group}}</button>
      <button class="tab__leave-group" @click.prevent="leaveGroup(group)"></button>
    </div>
  </li>
</template>

<script>
  import {mapGetters} from 'vuex';

  export default {
    data() {
      return {
        unreadMessage: false
      }
    },
    props: ['group'],
    computed: {
      ...mapGetters(['getCurrentGroup'])
    },
    methods: {
      leaveGroup(groupToLeave) {
        this.$socket.emit('leave', groupToLeave, (err) => {
          if (err) {
            console.log(err);
          } else {
            this.$store.commit('leaveGroup', groupToLeave);
          }
        });
      },
      setCurrentGroup(group) {
        this.$store.commit('setCurrentGroup', group);
        this.unreadMessage = false;
      }
    },
    created() {
      this.$store.subscribe((mutation, state) => {
        if (mutation.type === 'SOCKET_MESSAGEFROMSERVER'
          && mutation.payload.group === this.group &&
          mutation.payload.messageSource &&
          this.getCurrentGroup !== this.group) {
          this.unreadMessage = true;
        }
      });
    }
  }
</script>

<style scoped lang="scss">
  .tab__item {
    position: relative;
    border-radius: 5px 5px 0 0;
    padding: 5px 10px;
    background-color: $tab-item-bg;
    opacity: 0.9;
    margin-right: 5px;
    transition-duration: 0.2s;
    height: 34px;
  }

  .tab__item--unreadMessage:before {
    position: absolute;
    content: " ";
    width: 10px;
    height: 10px;
    top: 0;
    left: 0;
    background-color: #00ff00;
    clip-path: circle(50% at 50% 50%);
  }

  .tab__container {
    position: relative;
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
  }

  .tab__item:hover {
    height: 38px;
    box-shadow: 3px 3px 5px rgba(128, 128, 128, 0.63);
    opacity: 1;
  }

  .tab__item:active {
    background-color: $tab-item-clicked;
  }

  .tab__link {
    border: none;
    background-color: transparent;
    padding: 0;
    outline: none;
    color: $tab-link;
    max-width: 130px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tab__link:hover {
    text-decoration: none;
  }

  .tab__leave-group {
    position: relative;
    width: 13px;
    height: 13px;
    padding: 2px;
    margin-top: 7px;
    background-color: transparent;
    border: none;
    outline: none;
    margin-left: 10px;
  }

  .tab__leave-group:before, .tab__leave-group:after {
    position: absolute;
    left: 5px;
    top: 0;
    content: ' ';
    height: 13px;
    width: 3px;
    background-color: $tab-leave-group-button;
  }
  .tab__leave-group:before {
    transform: rotate(45deg);
  }
  .tab__leave-group:after {
    transform: rotate(-45deg);
  }

  .tab__item--active {
    background-color: $tab-item-active-bg;
    transform: scale(1.1);
    box-shadow: 2px 2px 5px rgba(128, 128, 128, 0.63);
    opacity: 1;
  }

  .tab__item--active:hover {
    height: 34px;
  }

</style>
