<template>
    <div class="search_box" id="mysearch">
        <input @blur="inputBlur()" class="searchInput" type="search"
        v-model="value" :placeholder="placeholder">
        <span slot="icon" class="iconfont smallSearch">&#xe60f;</span>
        <div v-text="cancelText" class="searchBtn" @click="visible = false,cancel()">
        
        </div>
        <div v-show="!visible" class="searchCover">
            <div @click="visible = true,showInput()">
                <span style="font-size: 0.75rem;" slot="icon" class="iconfont">&#xe60f;</span>
                <span>{{placeholder}}</span> 
            </div>
        </div>
    </div>
</template>

<script>
import XCell from '../../cell/index.js';

export default {
    name: 'mysearch',
    props: {
        value: String,
        cancelText: {
            default: '取消'
        },
        placeholder: {
            default: '搜索'
        }
    },

    data() {
        return {
            visible: false
        };
    },
    components: {
        XCell
    },
    methods: {
        showInput(){
            let self = this;
            let input = document.querySelectorAll('.searchInput')[0];
            input.focus();
        },
        cancel: function () {
            let self = this;
            self.value = '';
        },
        inputBlur(){
            let self = this;
            let currVal = $('.searchInput').val();
            if(currVal == ''){
                self.visible = false;
            } 
        }
    }
};
</script>

<style lang="css">
    @import "../../srcc/style/var.css";
    @import "../../srcc/style/border.css";

#mysearch{
    width:100vw;
    font-size:0.65rem;
    color:#999;
    background:#ededed;
    box-sizing:border-box;
    padding: 0.5rem;
    position: relative;
    font-family: '微软雅黑';
} 
#mysearch .searchInput,#mysearch .searchCover>div{
    box-sizing:border-box;
    width:100%;
    padding:0 3.5rem 0 1.5rem;
    border: 1px solid #e5e5e5;
    border-radius: 0.2rem;
    -webkit-appearance:none;
    height:1.8rem;
    line-height: 1.8rem;
    background: #fff;
    font-size:0.65rem;
}
#mysearch .searchInput{
    padding:0.5rem 3.5rem 0.5rem 1.5rem;
    line-height: 0.8rem;
}
#mysearch .smallSearch{
  font-size:0.7rem;
  position:absolute;
  top:0.8rem;
  left:0.9rem;

}
#mysearch .searchBtn{
    position: absolute;
    right:0.55rem;
    top:0.55rem;
    width:3rem;
    color:#fff;
    text-align: center;
    height:1.7rem;
    line-height: 1.7rem;
    background: #383a40;
    border-radius: 0 0.2rem 0.2rem 0;
}
#mysearch .searchCover{
    padding:0.5rem;
    width:100%;
    text-align: center;
    color:#999;
    position:absolute;
    top:0;
    left:0;
    font-size: 0.65rem;
}
#mysearch .searchCover>div{
    padding:0 0.5rem;
}
</style>
