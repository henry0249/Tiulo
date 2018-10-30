<template>
    <div class="order" v-for="order in options" @click="goOrderDetail(order,$event)">
        <ul class="codeLine"> 
            <li style="width:60%;">订单号：{{order.tohOrderShow}}</li>
            <li style="width:40%;text-align:right;">
                <span class="yi" :class="order.tohExId != '*' ? 'hasYi' : ''" @click.stop = "extremelyShow($index,order.tohExId,$event)">异</span>
                <span class="xiu" @click.stop = "modifiedShow(order.tchId,order.tohId,$event)">修</span>
            </li>
        </ul>
    
        <div class="order_content">
            <ul class="shoufa"> 
                <li>发货人：{{order.tohOwnerName}}</li>
                <li>收货人：{{order.tohEndName}}</li>
                <li>时　间：{{order.tohDate}}</li>
                <li v-if="order.tohRecvMan">承运人：{{order.tohRecvMan}}</li>
            </ul>
            <div style="Height:1.3rem;line-height:1.3rem;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">合　计： 数量{{order.tohQty}} 体积{{order.tohWeight}} 重量{{order.tohCubage}}</div>
            <div class="picBox">
                <div style="width:1rem;left:0" class="area">{{order.startArea}}</div>
                <div class="line_box" style="width:100%">
                    <div class="line_box1" :class="parseInt(order.tohStatus)>= 20 ? 'colorBorder' : ''">
                        <p>提货</p>
                        <img v-if="parseInt(order.tohStatus) < 20" class="circle" src="../../../img/orderStatus/20-1.png">
                        <img v-if="parseInt(order.tohStatus) == 20" class="circle" src="../../../img/orderStatus/20-2.png">
                        <img v-if="parseInt(order.tohStatus) > 20" class="circle" src="../../../img/orderStatus/20-3.png">
                    </div>
                    <div class="line_box1" :class="parseInt(order.tohStatus) >= 25 ? 'colorBorder' : ''">
                        <p>装车</p>
                        <img v-if="parseInt(order.tohStatus) < 25" class="circle" src="../../../img/orderStatus/25-1.png">
                        <img v-if="parseInt(order.tohStatus) == 25" class="circle" src="../../../img/orderStatus/25-2.png">
                        <img v-if="parseInt(order.tohStatus) > 25" class="circle" src="../../../img/orderStatus/25-3.png">
                    </div>
                    <div class="line_box1" :class="parseInt(order.tohStatus) >= 30 ? 'colorBorder' : ''">
                        <p>在途</p>
                        <img v-if="parseInt(order.tohStatus) < 30" class="circle" src="../../../img/orderStatus/30-1.png">
                        <img v-if="parseInt(order.tohStatus) == 30" class="circle" src="../../../img/orderStatus/30-2.png">
                        <img v-if="parseInt(order.tohStatus) > 30" class="circle" src="../../../img/orderStatus/30-3.png">
                    </div>
                    <div v-if="order.tohTypeG != 'ZC'" class="line_box1" :class="parseInt(order.tohStatus) >= 40? 'colorBorder' : ''">
                        <p>卸车</p>
                        <img v-if="parseInt(order.tohStatus) < 40" class="circle" src="../../../img/orderStatus/40-1.png">
                        <img v-if="(parseInt(order.tohStatus) == 40) || (parseInt(order.tohStatus) == 41)" class="circle" src="../../../img/orderStatus/40-2.png">
                        <img v-if="parseInt(order.tohStatus) > 41" class="circle" src="../../../img/orderStatus/40-3.png">
                    </div>
                    <div v-if="(order.tohTypeG != 'ZC') && (order.tohTypeG != 'MZ') &&(order.tohTypeG != 'ZZ') " class="line_box1" :class="parseInt(order.tohStatus) >= 50 ? 'colorBorder' : ''">
                        <p>配送</p>
                        <img v-if="parseInt(order.tohStatus) < 50" class="circle" src="../../../img/orderStatus/50-1.png">
                        <img v-if="parseInt(order.tohStatus) == 50" class="circle" src="../../../img/orderStatus/50-2.png">
                        <img v-if="parseInt(order.tohStatus) > 50" class="circle" src="../../../img/orderStatus/50-3.png">
                    </div>
                    <div class="line_box1" :class="parseInt(order.tohStatus) >= 60 ? 'colorBorder' : ''">
                        <p>签收</p>
                        <img v-if="parseInt(order.tohStatus) < 60" class="circle" src="../../../img/orderStatus/60-1.png">
                        <img v-if="parseInt(order.tohStatus) == 60" class="circle" src="../../../img/orderStatus/60-2.png">
                        <img v-if="parseInt(order.tohStatus) > 60" class="circle" src="../../../img/orderStatus/60-3.png">
                    </div>
                    
                </div>
                <div style="width:1rem;right:0" class="area">{{order.endArea}}</div>
                
            </div>
            
        </div>
    </div>

</template>

<script>
// import XCell from '../../cell/index.js';

export default {
    name: 'myorderline',

    props: {
        options: {
          type: Array,
          required: true,
        },
        title:String
    },

    data() {
        return {
        };
    },
    methods: {
        goOrderDetail(order,e){
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
        }
    }
};
</script>

<style lang="less">
    @import "../../srcc/style/var.css";
    @import "../../srcc/style/border.css";
.order{
    border-bottom:1px solid #e5e5e5;
    border-top:1px solid #e5e5e5;
    margin-bottom: 0.3rem;
    background: #fff;
}
.order .codeLine{
    overflow:hidden;
    padding:0 0 0 0.5rem;
    border-bottom:1px solid #e5e5e5;
}
.yi,.xiu{
    display: inline-block;
    width: 1.2rem;
    height: 1.2rem;
    line-height: 1.2rem;
    text-align: center;
    border-radius: 0.2rem;
    background: #666;
    color:#fff;
    margin:0.3rem 0.5rem 0.3rem 0;
}
.order .codeLine li{
    float:left;
    height:2rem;
    line-height: 2rem;
    overflow:hidden;
    white-space:nowrap;
    text-overflow:ellipsis; 
}
.order_content{
    padding:0.5rem;
}
.shoufa{
    overflow: hidden;
}
.shoufa li{ 
    width:100%;
    height:1.3rem;
    line-height: 1.3rem;
    overflow:hidden;
    white-space:nowrap;
    text-overflow:ellipsis; 
}
.picBox{
   overflow:hidden;
   position: relative;
   padding:0.2rem 1rem;
}
.line_box{
    padding:0 5%;
    padding-bottom:1.8rem;
    position: relative;
}
.line_box1{
    display: inline-block;
    width:17%;
    border-top:2px dotted #e5e5e5;
    position: relative;
}
.circle{
    display: inline-block;
    position: absolute;
    width:1.6rem;
    border-radius: 0.8rem;
    top:-0.8rem;
    right:-0.8rem;
    z-index: 2;
    background: #fff;
    padding:0.2rem;
}

.line_box>div>p{
    font-size: 0.6rem;
    width:2.4rem;
    position: absolute;
    bottom:-1.8rem;
    right:-1.2rem;
    text-align: center;
}
.line_box>div:first-child{
    border-top:none;
    width:5%;
}
.area{
    padding:0.1rem;
    font-size:0.6rem;
    border:1px solid #e5e5e5;
    text-align: center;
    border-radius: 0.2rem;
    position: absolute;
    top:0.2rem;
}
.obtn{
    border:1px solid #e5e5e5;
    font-size: 0.65rem;
}
.colorBorder{
    border-top:2px dotted #333;
}
.hasYi{
    background:#FFD91E;
}

</style>
