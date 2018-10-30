<template>
    <div v-for="(key,option) in options" class="ordersign">       
        <div class="codeLine">
            <div class="signcircle" :id="'signcircle'+ key" @click.stop="clickOrder(key,option,$event)"></div> 
            订单号：{{option.tohId}}
            <div class="time">{{option.tohDate}}</div>
        </div>
    
        <div class="order_content" @click="goOrderDetail(option,$event)">
            <div class="shoufa">
                <p>发货人：{{option.tohOwnerName}}</p>
                <p>收货人：{{option.tohEndName}}</p>
                <div class="yyi" :class="option.tohExId != '*' ? 'hasYi' : ''" @click.stop="extremelyShow($index,option.tohExId,$event)">异</div>
                <div class="xxiu" @click.stop="modifiedShow(option.tchId,option.tohId,$event)">修</div>
            </div>
            <div class="allotMan" v-if="option.allotMan">分单人：{{option.allotMan}}</div>
            <div class="allotMan" v-if="option.tohRecvMan">承运人：{{option.tohRecvMan}}</div>
            <div class="allotMan">合　计：数量{{option.tohQty}}　体积{{option.tohWeight}}　重量{{option.tohCubage}}</div> 
        </div>
        <div class="signPic">
            <div class="exImgBox" v-for="(index,picId) in option.signPic" id="{{key}}old{{index}}" track-by="$index">
                <img  class="ex_img" :src="picId" @click.stop="showBigPic(key,index,picId)">
                <span id="{{key}}del{{index}}" class="iconfont delPicIcon" slot="icon" @click.stop="deletePic(key,index,picId)">&#xe6cf;</span>
            </div> 

            <div class="exImgBox">
                <img class="ex_img" src="../../../img/camera.jpg" @click="addSignPic(key)">
            </div> 
        </div> 
        
    </div>


</template>

<script>
// import XCell from '../../cell/index.js';

export default {
    name: 'myordersign',

    props: {
        options: {
          type: Array,
          required: true,
        },
        title:String,
        value: Array,
        value2: Array
    },

    data() {
        return {
        };
    },
    methods: {

        goOrderDetail(order,e){//订单详情
            let self = this;
            this.$dispatch('goOrderDetail',order,e)  
        },
        extremelyShow(index,tohExId,e){
            let self = this;
            this.$dispatch('extremelyShow',index,tohExId,e)
        },
        modifiedShow(tchId,tohId,e){
            let self = this;
            this.$dispatch('modifiedShow',tchId,tohId,e)
        },
        clickOrder(index,currOption,e){
            let self = this;
            if($("#signcircle" + index).hasClass("sesigncircle")){
              $("#signcircle" + index).removeClass("sesigncircle");
              for(var i=0;i<self.value.length;i++){
                if(self.value[i] == currOption.value){
                  self.value.splice(i,1);
                  self.value2.splice(i,1);
                }
              }
            }else{
              $("#signcircle" + index).addClass("sesigncircle")
              self.value.push(currOption.value)
              self.value2.push(currOption.value2)
            }
            self.$dispatch('chooseValue',self.value,self.value2) ;
                 
        },
        showBigPic(key,index,picId){//查看回单图片大图
            let self = this;
            self.$dispatch('showBigPic',key,index,picId) ;

        },
        deletePic(key,index,picId){//删除回单图片
            let self = this;
            self.$dispatch('deletePic',key,index,picId) ;
        },
        addSignPic (key){//添加异常图片
            let self = this;
            self.$dispatch('addSignPic',key);
        }
    }
};
</script>

<style lang="less">
    @import "../../srcc/style/var.css";
    @import "../../srcc/style/border.css";

.ordersign{
    border-top:1px solid #e5e5e5;
    border-bottom:1px solid #e5e5e5;
    margin-bottom:0.3rem;
    overflow:hidden;
    background: #fff;
}
.ordersign .codeLine{
    position: relative;
    overflow:hidden;
    white-space:nowrap;
    text-overflow:ellipsis;
    padding:0 5rem 0 2rem;
    height:2rem;
    line-height: 2rem;
    border-bottom:1px solid #e5e5e5;
}
.time{
    position: absolute;
    right:0.5rem;
    top:0;
}
.yyi,.xxiu{
    position: absolute;
    width: 1.2rem;
    height: 1.2rem;
    line-height: 1.2rem;
    top:0;
    right:0;
    text-align: center;
    border-radius: 0.2rem;
    background: #666;
    color:#fff;
    margin:0.4rem 0.5rem;
}
.yyi{
    right:2.2rem;
}


.ordersign .order_content{
    padding:0.5rem;
    padding-bottom:0;
}
.ordersign .order_content .allotMan{
    height:1.3rem;
    line-height:1.3rem;
    overflow:hidden;
    white-space:nowrap;
    text-overflow:ellipsis;
}
.ordersign .shoufa{
    position: relative;
    padding-right:4.5rem;
}
.ordersign .shoufa p{ 
    height:1.2rem;
    line-height: 1.2rem;
    overflow:hidden;
    white-space:nowrap;
    text-overflow:ellipsis; 
}
.hasYi{
    background:#FFD91E;
}
.signcircle{
    position: absolute;
    width:1rem;
    height:1rem;
    background: #fff;
    border-radius: 0.5rem;
    border:1px solid #999;
    top:0;
    left:0;
    margin:0.5rem;
}

.sesigncircle{
    background: #FFD91E;
    border: 1px solid #FFD91E;
}
.signPic{
    padding: 0 0.5rem 0.5rem 0.5rem;
}
.ordersign .exImgBox{
    display: inline-block;
    position:relative;
    padding:0.6rem 0.6rem 0 0;
    width:14.5vw;
    height:14.5vw;
    max-width: 5rem;
    max-height: 5rem;
    box-sizing: border-box;
}
.ordersign .ex_img{
    display:inline-block;
    width:100%;
    height:100%;
    border:1px solid #e5e5e5;
    border-radius:0.3rem;
    text-align:center;
}
.ordersign .delPicIcon{
    display: none;
    color:#f00;
    position: absolute;
    top:-0.25rem;
    right:0;
}
</style>
