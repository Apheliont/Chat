<template>
  <li class="list-group-item py-1 px-3" @dblclick="enterGroup(groupInfo.group)"
      @selectstart.prevent>
    <p>
      <button class="list-group__expand-btn" @click="openState = !openState">{{btnSign}}</button>
      <span class="list-group__group">{{groupInfo.group}}</span>
      <span class="ml-2 badge-warning badge-pill float-right" v-if="groupInfo.userList">{{groupInfo.userList.length}}</span>
    </p>
    <ol class="user-list" v-show="openState">
      <li v-for="(user, index) in groupInfo.userList" :key="index">{{user}}</li>
    </ol>
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

  .user-list {
    margin-top: 30px;
    background-color: #fff !important;
  }
</style>
