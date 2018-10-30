<style>
  .v-link-active {

  }

  [v-cloak] {
    display: none; 
  }

  .tiuloBadge{
        min-width: 1rem;
        min-height: 1rem;
        line-height: 1rem;
        border-radius: 50%;
        background: red;
        color:#fff;
        font-size: 0.5rem;
        text-align: center;
        display: inline-block;
        position: absolute;
        top: -0.25rem;
        left: 0.75rem;
        z-index: 999;
    }
</style>

<template>
    <div>
        <router-view :transition="transfer" keep-alive></router-view>
        <div class="home-mask" v-show="mask"></div>
        <mt-tabbar :selected.sync="MainSelect" v-if="showBar">
            <mt-tab-item id="tiulo" @click="go('/tiulo')">
                <span slot="icon" class="iconfont barIcon" style="position:relative;">
                  &#xe621;
                  <span class="tiuloBadge"  v-if="tiulo_badge>0&&tiulo_badge<=99">{{ tiulo_badge }}</span>
                  <span class="tiuloBadge"  v-if="tiulo_badge>99">99+</span>
                </span>
                推流
            </mt-tab-item>
            <mt-tab-item id="friends" @click="go('/friends')">
                <span slot="icon" class="iconfont barIcon">&#xe614;</span>
                通讯录
            </mt-tab-item>
            <mt-tab-item v-if="subSystem == 'SJ'" id="taskList" @click="go('/taskList')">
                <span slot="icon" class="iconfont barIcon">&#xe619;</span>
                任务
            </mt-tab-item>
            <mt-tab-item v-if="subSystem == 'TMS'" id="TMStaskList" @click="go(taskPageDefalut)">
                <span slot="icon" class="iconfont barIcon">&#xe619;</span>
                任务
            </mt-tab-item>
            <mt-tab-item v-if="(subSystem == 'KF') || (subSystem == 'TMS')" id="traceList" @click="go('/traceList')">
                <span slot="icon" class="iconfont barIcon">&#xe8a4;</span>
                跟踪
            </mt-tab-item>
            <mt-tab-item v-if="(subSystem == 'KF') || (subSystem == 'SJ')" id="accountIndex" @click="go('/accountIndex')">
                <span slot="icon" class="iconfont barIcon">&#xe604;</span>
                账单
            </mt-tab-item>
            <mt-tab-item id="more" @click="go('/more')">
                <span slot="icon" class="iconfont barIcon">&#xe620;</span>
                更多
            </mt-tab-item>
        </mt-tabbar>
    </div>
</template>

<script>
  import store from './vuex/store'
  export default {
    store: store,
    data () {
      return {
        mask: false,
        transfer: 'slide',
        MainSelect: "tiulo",
        showBar: false,
        subSystem:'',
        tiulo_badge: 0,//tiulo消息总条数
        taskPageDefalut:'/TMStaskList',//企业版首次进入页面时的默认选择机构页面
      }
    },
    methods: {
      go (link, param) {
        let self = this
        self.$dispatch('transfer', 'faded')
        self.$route.router.go(link)
      },
      back (link, param) {
        let self = this
        self.$dispatch('transfer', 'faded')
        self.$route.router.go(link)
      },
    },
    events: {
      transfer (type) {
        this.transfer = type
      }
    }
  }
</script>
