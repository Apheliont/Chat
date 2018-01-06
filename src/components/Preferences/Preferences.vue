<template>
  <div class="rounded p-3 d-flex flex-column">
    <app-authentication v-if="!getUserName"></app-authentication>
    <transition mode="out-in" :duration="{ enter: 800, leave: 500 }" leave-to-class="flipOutY animated" enter-active-class="flipInY animated">
      <div class="p-0 m-0" v-if="getUserName && !isUserListShown">
        <app-create-group></app-create-group>
        <app-groups></app-groups>
      </div>
    <app-user-list v-if="isUserListShown && getCurrentGroup"></app-user-list>
    </transition>
    <button class="btn btn-success align-content-center mt-auto" v-if="getUserName && getCurrentGroup" @click="isUserListShown = !isUserListShown">{{isUserListShown ? 'К списку групп' : 'К списку пользователей'}}</button>
  </div>
</template>

<script>
  import Groups from './Groups';
  import {mapGetters} from 'vuex';
  import Authentication from './Authentication';
  import CreateGroup from './CreateGroup';
  import UserList from './UserList';

  export default {
    data() {
      return {
        isUserListShown: false
      }
    },
    computed: {
      ...mapGetters(['getUserName', 'getCurrentGroup'])
    },
    watch: {
      getCurrentGroup(value) {
        if (!value) {
          this.isUserListShown = false;
        }
      }
    },
    components: {
      appGroups: Groups,
      appAuthentication: Authentication,
      appCreateGroup: CreateGroup,
      appUserList: UserList
    },
    mounted() {
      this.$store.subscribe((mutation, payload) => {
        if (mutation.type === 'SOCKET_DISCONNECT') {
          this.isUserListShown = false;
        }
      });
    }
  }
</script>

<style scoped>

  .preferences-enter {
    /*transform: rotateY(180deg);*/
    /*backface-visibility: hidden;*/

    /*position: absolute;*/
    /*top: 0;*/
    /*left: 0;*/
  }

  .preferences-enter-active {
    /*transition-duration: 0.2s;*/
    /*transition-timing-function: ease-in-out;*/
  }

  .preferences-leave {

  }

  .preferences-leave-active {
    /*!*transform: scaleX(0);*!*/
    /*transform: rotateY(180deg);*/
    /*!*transition-duration: 0.2s;*!*/
    /*transition-timing-function: ease-in-out;*/
  }
</style>
