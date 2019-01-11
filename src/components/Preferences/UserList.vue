<template>
  <div>
    <p class="user-list__title">Участники группы:</p>
    <transition-group
      class="list-group user-list__group"
      name="user-list__group"
      tag="ul"
      mode="out-in"
      leave-active-class="zoomOut animated"
    >
      <li class="list-group-item py-1 px-3" v-for="(user) in getUserList" :key="user">{{user}}</li>
    </transition-group>
  </div>
</template>

<script>
  import {mapGetters} from 'vuex';

  export default {
    computed: {
      ...mapGetters(['getServerGroupsInfo', 'getCurrentGroup']),
      getUserList() {
        return this.getServerGroupsInfo.find(infoObj => {
          return infoObj.group === this.getCurrentGroup
        }).userList;
      }
    }
  }
</script>

<style scoped lang="scss">

  .user-list__group {
    max-height: 300px;
    overflow-y: scroll;
    overflow-x: hidden;
  }

  .user-list__group::-webkit-scrollbar {
    width: 8px;
    border-radius: 0 6px 6px 0;
  }

  .user-list__group::-webkit-scrollbar-thumb {
    border-radius: 0 6px 6px 0;
    background-color: $group-scroll-thumb;
  }

  .user-list__group-enter {
    opacity: 0;
    transform: translateY(30px);
  }

  .user-list__group-enter-active {
    transition-duration: 0.4s;
  }

  .user-list__title {
    margin-bottom: 6px;
  }
</style>
