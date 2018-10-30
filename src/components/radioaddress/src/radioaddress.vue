<template>
  <div class="mint-radiolist">
    <label class="mint-radiolist-title" v-text="title"></label>
    <x-cell v-for="option in options">
      <label slot="title">
          <span
            :class="{'is-right': align === 'right'}"
            class="mint-radio"
            @click="showhook($index)"
            >
            <input
              class="mint-checkbox-core"
              :id = "'radio-address' + option.value"
              type="radio"
              v-model="value"
              :disabled="option.disabled"
              :checked="option.checked"
              :value="option.value || option">
          </span>
          <div class="mint-radio-label mint-radiocard-title">
            <ul class="address_content">
              <li class="address_name">{{option.addName}}</li>
              <li class="address_phone">{{option.addphone}}</li>
              <li class="address">
                <b class="address_default" v-show="option.ifshow">{{option.default}}</b>
                {{option.address}}
              </li>
            </ul>
          </div>
      </label>
      <slot name="one">
        <span slot="icon" @click="compile_message($index)" class="iconfont compile">&#xe626;</span>
      </slot>
    </x-cell>
  </div>
</template>

<script>
import XCell from '../../cell/index.js';
import { Toast } from 'mint-ui'
/**
 * mt-radio
 * @module components/radio
 * @desc 单选框列表，依赖 cell 组件
 *
 * @param {string[], object[]} options - 选项数组，可以传入 [{label: 'label', value: 'value', disabled: true}] 或者 ['ab', 'cd', 'ef']
 * @param {string} value - 选中值
 * @param {string} title - 标题
 * @param {string} [align=left] - checkbox 对齐位置，`left`, `right`
 * @param {string} icon - iconfont unicode 字符(可选)
 * @param {string} icon_color - icon颜色(可选)
 *
 * @example
 * <mt-radio :value.sync="value" :options="['a', 'b', 'c']"></mt-radio>
 */
export default {
  name: 'radio-address',
  props: {
    title: String,
    align: String,
    options: {
      type: Array,
      required: true
    },
    value: String
  },
  data(){
    return {
      noshow:false,
    }
  },
  methods: {
    showhook(key){
      let self = this;
      // if(self.options[key].checked == ''){
      //   self.options.forEach(function(item){
      //     item.checked = '';
      //     item.default = '';
      //     item.ifshow = false;
      //   })
      //   self.options[key].checked = "checked";
      //   self.options[key].default = "默认";
      //   self.options[key].ifshow = true;
      //   Toast('默认地址设置成功')
      // }
    },
    compile_message(key){
      let self = this;
      console.log(self.options[key])
    },
    go (link, param) {
      let self = this
      self.$transfer.go(self, link, param)
    },
  },
  components: {
    XCell
  }
};
</script>

<style scoped lang="css">
  .mint-checkbox-core{
    border:1px solid #ff8827;
  }
/*  .mint-checkbox-core:after{
    top:4px; left:7px;
  }*/
  .mint-radiocard-title{
    display: inline-block;
  }
  .address_name,.address_phone{
    display: inline-block;
    margin-right: .5rem;
  }
  .conceal{
    display: none;
  }
  .show{
    display: inline-block;
  }
  .address{
    margin-top:.5rem;
  }
  .address_default{
    display: inline-block;
    padding:.1rem .4rem;
    border-radius: .2rem;
    margin-right:.5rem;
    text-align: center;
    background-color: red;
    font-size: .5rem;
    color:#fff;
  }
  .compile{
    border-left:1px solid #e1e1e1;font-size:1.5rem;padding:0.5rem .8rem;
  }
  .mint-cell-value{
    color:#ccc;
  }
</style>