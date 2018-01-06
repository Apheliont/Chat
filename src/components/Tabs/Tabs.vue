<template>
  <div class="p-0 m-0 tabs-container">
    <button class="tab-list__scroll-btn tab-list__scroll-btn--left align-self-stretch" v-if="isLeftArrowNeed"
            @click="scrollLeft"></button>
    <draggable class="draggable-wrapper" v-model="getGroups">
      <transition-group class="tab-list" tag="ul" name="tabs" ref="tabList">
        <app-tab-item v-for="(group, index) in getGroups" :key="index" :group="group"></app-tab-item>
      </transition-group>
    </draggable>
    <button class="tab-list__scroll-btn tab-list__scroll-btn--right ml-auto align-self-stretch" v-if="isRightArrowNeed"
            @click="scrollRight"></button>
  </div>
</template>

<script>


  import draggable from 'vuedraggable';
  import TabItem from './TabItem';

  export default {
    data() {
      return {
        isScrollNeed: false,
        isLeftArrowNeed: false,
        isRightArrowNeed: false
      }
    },
    components: {
      draggable,
      appTabItem: TabItem
    },
    computed: {
      getGroups: {
        get() {
          return this.$store.getters.getGroups;
        },
        set(value) {
          this.$store.commit('updateJoinedGroups', value);
        }
      }
    },
    watch: {
      getGroups() {
        this.$nextTick(() => {
          const tabList = this.$refs.tabList;
          this.isRightArrowNeed = !!(tabList.$el.scrollWidth - tabList.$el.clientWidth);
        });
      }
    },
    methods: {
      calculateArrows() {
        const tabList = this.$refs.tabList;
        this.isRightArrowNeed = tabList.$el.scrollLeft + tabList.$el.clientWidth < tabList.$el.scrollWidth;
        this.isLeftArrowNeed = !!tabList.$el.scrollLeft;
      },
      scrollLeft() {
        let animationId;
        const scrollTo = this.$refs.tabList.$el.scrollLeft - 300 > 0 ? this.$refs.tabList.$el.scrollLeft - 300 : 0;
        const animate = () => {
          if (this.$refs.tabList.$el.scrollLeft - 15 > scrollTo) {
            this.$refs.tabList.$el.scrollLeft -= 15;
            animationId = window.requestAnimationFrame(animate);
          } else {
            this.$refs.tabList.$el.scrollLeft = scrollTo;
            cancelAnimationFrame(animationId);
          }
        };
        animate();
      },
      scrollRight() {
        let animationId;
        const scrollTo =
          this.$refs.tabList.$el.scrollLeft + 300 < this.$refs.tabList.$el.scrollWidth - this.$refs.tabList.$el.clientWidth ?
            this.$refs.tabList.$el.scrollLeft + 300 : this.$refs.tabList.$el.scrollWidth - this.$refs.tabList.$el.clientWidth;
        const animate = () => {
          if (this.$refs.tabList.$el.scrollLeft + 15 < scrollTo) {
            this.$refs.tabList.$el.scrollLeft += 15;
            animationId = window.requestAnimationFrame(animate);
          } else {
            this.$refs.tabList.$el.scrollLeft = scrollTo;
            cancelAnimationFrame(animationId);
          }
        };
        animate();
      }
    },
    mounted() {
      this.$refs.tabList.$el.addEventListener('scroll', this.calculateArrows);
    },
    beforeDestroy() {
      this.$refs.tabList.$el.removeEventListener('scroll', this.calculateArrows);
    }
  }
</script>

<style scoped lang="scss">
  .tabs-container {
    position: relative;
  }

  .tab-list {
    list-style: none;
    display: flex;
    align-items: flex-end;
    flex-flow: row nowrap;
    overflow: hidden;
    padding: 0 5px 0 10px;
    margin: 0 25px;
    height: 38px;
  }

  .tabs-enter {
    opacity: 0;
    transform: translateY(10px);
  }

  .tabs-enter-active {
    transition-duration: 0.4s;
  }

  .tabs-leave {

  }

  .tabs-move {
    transition-duration: 1s;
  }

  .tabs-leave-active {
    transform: translateY(20px);
    opacity: 0;
    transition-duration: 1s;
    position: absolute;
  }

  .tab-list__scroll-btn {
    position: absolute;
    border: solid $tab-scroll-arrow-bg;
    border-width: 0 3px 3px 0;
    display: inline-block;
    padding: 3px;
    background-color: transparent;
    outline: none;
    height: 15px;
    bottom: 10px;
    width: 15px;
  }

  .tab-list__scroll-btn:active {
    border-color: #eb793c;
  }

  .tab-list__scroll-btn--left {
    left: 5px;
    /*clip-path: polygon(0% 51%, 60% 0, 82% 20%, 47% 51%, 83% 80%, 60% 100%);*/
    transform: rotate(135deg);
  }

  .tab-list__scroll-btn--right {
    right: 5px;
    /*clip-path: polygon(100% 50%, 20% 0, 0 15%, 60% 50%, 0 85%, 20% 100%);*/
    transform: rotate(-45deg);
  }
</style>
