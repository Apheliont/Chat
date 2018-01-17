<template>
  <li class="list-group-item py-1 px-2" @dblclick="enterGroup(groupInfo.group)"
      @selectstart.prevent>
    <p>
      <button class="list-group__expand-btn" @click="openState = !openState">{{btnSign}}</button>
      <span class="list-group__group">{{groupInfo.group}}</span>
      <span class="ml-2 badge-warning badge-pill float-right" v-if="groupInfo.userList">{{groupInfo.userList.length}}</span>
    </p>
    <ul class="user-list" v-show="openState">
      <li class="user-list__item" v-for="(user, index) in groupInfo.userList" :key="index">{{index + 1}}. {{user}}</li>
    </ul>
  </li>
</template>

<script>
  export default {
    data() {
      return {
        openState: false
      }
    },
    props: ['groupInfo'],
    computed: {
      btnSign() {
        return this.openState ? '-' : '+';
      }
    },
    methods: {
      enterGroup(group) {
        this.$socket.emit('join', group, (err) => {
          if (err) {
            this.$store.commit('setCurrentGroup', group);
          } else {
            this.$store.commit('addGroup', group);
            this.$store.commit('setCurrentGroup', group);
          }
        });
      }
    }
  }
</script>

<style scoped lang="scss">
  .list-group__expand-btn {
    float: left;
    margin-right: 8px;
    width: 15px;
    background-color: transparent;
    border: none;
    padding: 0;
    outline: none;
  }
  .list-group__group {
    float: left;
    max-width: 130px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .list-group-item:hover {
    cursor: pointer;
    background-color: $group-item-hover-bg;
  }

  .list-group-item {

  }

  .user-list__item {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .user-list {
    padding: 5px 8px;
    margin-top: 30px;
    background-color: #fff !important;
  }
</style>
