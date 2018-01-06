<template>
  <form>
    <label for="name" class="authentication__title">Как вас зовут?</label>
    <div class="d-flex flex-row flex-nowrap justify-content-between">
      <div class="mr-2">
        <input type="text" id="name" class="form-control" @keydown.enter.prevent="enterName"
               v-model="userName" ref="name"
               autocomplete="off"
               autofocus>
      </div>
      <div>
        <button class="btn btn-success" @click.prevent="enterName" :disabled="!userName">Готово</button>
      </div>
    </div>
  </form>
</template>

<script>
  import {appBus} from '../../main';

  export default {
    data() {
      return {
        userName: ''
      }
    },
    methods: {
      enterName() {
        if (this.userName.trim().length === 0) {
          this.userName = '';
          this.$refs.name.placeholder = 'Введите ваше имя';
        } else if (this.userName.length > 20) {
          alert('Имя не может быть больше 20 символов');
        } else {
          this.$socket.emit('enterName', this.userName, (err) => {
            if (err) {
              this.userName = '';
              this.$refs.name.placeholder = err;
            } else {
              this.saveUserName();
              this.$refs.name.placeholder = '';
              this.$store.commit('setUserName', this.userName);
              this.$nextTick(() => {
                appBus.$emit('focusOnCreateGroup');
              })
            }
          });
        }
      },
      saveUserName() {
        const objToSave = {};
        objToSave.userName = this.userName;
        window.localStorage.setItem('intraChat',JSON.stringify(objToSave));
      }
    },
    mounted() {
      const data = window.localStorage.getItem('intraChat');
      if (data) {
        this.userName = JSON.parse(data).userName;
      }
    }
  }
</script>

<style scoped lang="scss">
  .authentication__title {
    margin-bottom: 5px;
  }
</style>
