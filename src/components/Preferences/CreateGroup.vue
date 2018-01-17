<template>
  <form>
    <label for="group" class="create-group__title">Создать группу:</label>
    <div class="d-flex flex-row flex-nowrap justify-content-between">
      <div class="mr-2">
        <input type="text" id="group" class="form-control" ref="group" v-model="group"
               @keydown.enter.prevent="enterGroup"
               autocomplete="off">
      </div>
      <div>
        <button class="btn btn-success" @click.prevent="enterGroup" :disabled="!group">Создать</button>
      </div>
    </div>
  </form>
</template>

<script>
  import {appBus} from '../../main';

  export default {
    data() {
      return {
        group: '',
      }
    },
    methods: {
      enterGroup() {
        if (this.group.length === 0) {
          this.group = '';
          this.$refs.group.placeholder = 'Введите группу';
        } else if (this.group.length > 20) {
          alert('Имя группы не должно превышать 20 символов');
        } else {
          this.$socket.emit('createGroup', this.group, (err) => {
            if (err) {
              alert(err);
            } else {
              this.$store.dispatch('addGroup', this.group);
              this.$store.dispatch('setCurrentGroup', this.group);
              this.group = '';
              appBus.$emit('focusOnChatArea');
            }
          });
        }
      }
    },
    mounted() {
      appBus.$on('focusOnCreateGroup', () => {
        this.$refs.group.focus();
      });
    }
  }
</script>

<style scoped>
.create-group__title {
  margin-bottom: 5px;
}
</style>
