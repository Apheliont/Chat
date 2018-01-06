<template>
  <div v-show="getServerGroupsInfo.length > 0">
    <p class="my-2">Активные группы:</p>
    <transition-group class="list-group group-list"
                      name="group-list"
                      mode="out-in"
                      leave-active-class="zoomOut animated"

    >
      <app-group-item :groupInfo="groupInfo" v-for="(groupInfo, index) in getServerGroupsInfo"
                      :key="index"></app-group-item>
    </transition-group>
  </div>
</template>

<script>
  import {mapGetters} from 'vuex';
  import GroupItem from './GroupItem';

  export default {
    components: {
      appGroupItem: GroupItem
    },
    computed: {
      ...mapGetters(['getServerGroupsInfo'])
    },
  }
</script>

<style scoped lang="scss">
  .group-list {
    max-height: 223px;
    overflow-y: scroll;
    overflow-x: hidden;
  }

  .group-list::-webkit-scrollbar {
    width: 8px;
    border-radius: 0 6px 6px 0;
  }

  .group-list::-webkit-scrollbar-thumb {
    border-radius: 0 6px 6px 0;
    background-color: $group-scroll-thumb;
  }

  .group-list-enter {
    opacity: 0;
    transform: translateY(30px);
  }

  .group-list-enter-active {
    transition-duration: 0.4s;
  }

  .group-list-leave-active {
    /*transform: scaleY(0);*/
    /*position: absolute;*/
    /*transition-duration: 0.6s;*/
  }
</style>
