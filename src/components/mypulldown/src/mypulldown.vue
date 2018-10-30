<template>
  <div class="page-loadmore">
    <div class="page-loadmore-wrapper" v-el:wrapper>
      <Myloadmore :top-method="loadTop" :top-status.sync="topStatus">
        <slot name="pullList"></slot>
        <div slot="top" class="mint-loadmore-top" style="padding-top:0.5rem">
          <span v-show="topStatus !== 'loading'" style="color:#FFD91E;" slot="icon" class="iconfont">{{{jtIcon}}}</span>
          <div v-show="topStatus === 'loading'" class="spinnerBox">
            <mt-spinner type="snake" color="#FFD91E"></mt-spinner>
          </div>
        </div>
      </Myloadmore>
    </div>
  </div>
</template>

<script>
  import  Myloadmore  from '../../../components/myloadmore'
  export default {
    name: 'mypulldown',
    components: {
        Myloadmore
    },
    data() {
      return {
        list: [],
        topStatus: '',
        wrapperHeight: 0,
        jtIcon:'&#xe669;',
      };
    },
    watch:{
        'topStatus':function(newVal){
            let self = this;
            if(newVal == 'drop'){
               self.jtIcon = '&#xe66a;';
            }else{
                self.jtIcon = '&#xe669;';
            }
        }
    },
    methods: {
      loadTop(id) {
        let self = this;
        self.$dispatch('refreshList',id,self.topStatus) ;
      }
    },
    ready() {
      this.wrapperHeight = document.documentElement.clientHeight - this.$els.wrapper.getBoundingClientRect().top;
    }
  };
</script>

<style>
  @component-namespace page {
    @component loadmore {
      @descendent desc {
        text-align: center;
        color: #666;
        padding-bottom: 5px;
        &:last-of-type {
          border-bottom: solid 1px #eee;
        }
      }
      @descendent listitem {
        height: 50px;
        line-height: 50px;
        border-bottom: solid 1px #eee;
        text-align: center;
        &:first-child {
          border-top: solid 1px #eee;
        }
      }
      @descendent wrapper {
        margin-top: -1px;
        overflow: scroll;
      }
      .mint-spinner {
        display: inline-block;
        vertical-align: middle;
      }
    }
  }
  @component mint-loadmore-top {
    span {
      display: inline-block;
      transition: .2s linear;
      vertical-align: middle;
      @when rotate {
        transform: rotate(180deg);
      }
    }
  }
  .spinnerBox>span{
    display: block;
  }
  .spinnerBox>span>div{
    margin:0 auto;
  }
  .is-rotate{
    -webkit-transform: rotateZ(180deg);
    -moz-transform: rotateZ(180deg);
    -o-transform: rotateZ(180deg);
    -ms-transform: rotateZ(180deg);
    transform: rotateZ(180deg);
  }
</style>