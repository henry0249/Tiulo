<template>
  <div class="mint-checklist checkshop" :class="{ 'is-limit': max <= value.length }">
    <label class="mint-checklist-title" v-text="title"></label>
    <div style="height:5rem;position:relative;" v-for="(key,option) in options">
      <div class="deleteCard" v-on:click="notify(option.proId,$index)">删除</div>
      <div class="product_box">
        <div slot="title">
          <label style="display:block;overflow:hidden;">
            <span class="dian_box"
              :class="{'is-right': align === 'right'}"
              class="mint-checkbox">
              <input style="border:1px solid #ff8827;margin-left:0.5rem;"
                class="mint-checkbox-core"
                type="checkbox"
                v-model="value"
                :disabled="option.disabled"
                :value="option">     
            </span>
            <div class="mint-checkbox-label">
              <!-- <div v-text="option.label.name || option"></div> -->
              <div style="width:35%;float:left;">
                <img class="product_img">
              </div>
              <ul class="product_content">
                <li style="margin-bottom:0.2rem">{{option.proudutName}}</li>
                <li style="color:#999;">规格：{{option.size}}</li>
                <li style="color:#ff8827;">
                  <ul>
                    <li style="float:left;">{{option.price?"￥"+option.price:"未知"}}</li>
                    <li style="float:right;">
                      <ul class="product_NumBox">
                        <li @click="minusNum(key)"><span slot="icon" class="iconfont">&#xe635;</span></li>
                        <li class="proNum">
                          <span >{{option.number}}</span>
                        </li>
                        <li @click="plusNum(key)"><span slot="icon" class="iconfont">&#xe636;</span></li>
                      </ul>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>

          </label>
        </div>
      </div>
      
    </div>
  </div>
</template>

<script>
import XCell from '../../cell/index.js';

/**
 * mt-checklist
 * @module components/checklist
 * @desc 复选框列表，依赖 cell 组件
 *
 * @param {(string[]|object[])} options - 选项数组，可以传入 [{label: 'label', value: 'value', disabled: true}] 或者 ['ab', 'cd', 'ef']
 * @param {string[]} value - 选中值的数组
 * @param {string} title - 标题
 * @param {number} [max] - 最多可选的个数
 * @param {string} [align=left] - checkbox 对齐位置，`left`, `right`
 *
 *
 * @example
 * <mt-checklist :value.sync="value" :options="['a', 'b', 'c']"></mt-checklist>
 */
export default {
  data () {
    return {
      productNum:'',//默认显示页面
    }
  },
  name: 'checkshop',
  props: {
    max: Number,
    title: String,
    align: String,
    options: {
      type: Array,
      required: true
    },
    value: Array
  },
  components: {
    XCell
  },
  computed: {
    limit() {
      return this.max < this.value.length;
    }
  },
  methods:{
    minusNum(key){
        alert(key);
    },
    plusNum(key){
        alert(key);
    },
    notify: function (carId,index) {
      this.$dispatch('deleteCard',carId,index)
    }

  },
  watch: {
    value() {
      if (this.limit) {
        this.value.pop();
      }
    }
  }
};
</script>

<style lang="css">
  @import "../../srcc/style/var.css";
  @component-namespace mint {
    @component checklist {
      .mint-cell {
        padding: 0;
      }
      .mint-cell-title {
        padding: 16px 10px;
      }
      @descendent title {
        color: $checklist-title-color;
        display: block;
        font-size: 12px;
      }
      @when limit {
        .mint-checkbox-core:not(:checked) {
          background-color: $color-grey;
          border-color: $color-grey;
        }
      }
    }
    @component checkbox {
      @when right {
        float: right;
      }
      @descendent label {
        vertical-align: middle;
        margin-left: 6px;
      }
      @descendent core {
        appearance: none;
        outline: 0;
        background-color: $color-white;
        border-radius: 100%;
        border: 1px solid #ccc;
        position: relative;
        size: 20px;
        vertical-align: middle;
        &::after {
          border: 2px solid transparent;
          border-left: 0;
          border-top: 0;
          content: " ";
          position: absolute 3px * * 6px;
          size: 4px 8px;
          transform: rotate(45deg);
        }
        &:checked {
          background-color: $color-blue;
          border-color: $color-blue;
          &::after {
            border-color: $color-white;
          }
        }
        &[disabled] {
          background-color: $color-grey;
          border-color: #ccc;
        }
      }
    }
  }
</style>
<style>
  .checkshop .product_box{
    position:absolute;top:0;left:0;width:100%;height:5rem;border-bottom:1px solid #e5e5e5;background: #fff;
  }
  .checkshop .dian_box{
    display: inline-block;
    width:10%;
    height:5rem;
    line-height: 5rem;
  }
  .checkshop .mint-checkbox-label{
    display:inline-block;width:85%;margin-left:0;
  }
  .checkshop .product_img{
    width:4rem;height:4rem;background:#11b911;border-radius:0.5rem;
  }
  .checkshop .product_content{
    float:left;
    width:65%;
  }
  .checkshop .product_content li{
    height:1.3rem;
    line-height: 1.3rem;
  }
  .checkshop .product_NumBox{
    text-align:right;
    border:1px solid #e5e5e5;
    overflow: hidden;
  }
  .checkshop .product_NumBox li{
    float:left;text-align:center;width:1.3rem;height:1.3rem;line-height:1.3rem;
  }
  .checkshop .product_NumBox li .iconfont{
    font-size: 1rem;color:#666;
  }
  .checkshop .product_NumBox li.proNum{
    width:2rem;border-left:1px solid #e5e5e5;border-right:1px solid #e5e5e5;color:#666;
  }
  .deleteCard{
      color: #fff;
      background: #f00;
      position: absolute;
      top: 0;
      right: 0px;
      text-align: center;
      color: #fff;
      width: 100px;
      height:99.9%;
      /*z-index: -1;*/
      line-height: 5rem;
  }
</style>
