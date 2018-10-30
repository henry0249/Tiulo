<template>
    <div class="myorderallot" v-for="order in options">
        <div class="codeLine">
            <div :id="'alCircle'+$index " class="ALBcircle" @click.stop="clickOrder($index,order.value,$event)"></div> 
            订单号：{{order.tohOrderShow}}
            <div class="time">{{order.tohDate}}</div>
        </div>
    
        <div class="order_content"  @click="goOrderDetail(order,$event)">
            <div class="shoufa">
                <p>发货人：{{order.tohOwnerName}}</p>
                <p>收货人：{{order.tohEndName}}</p>
                <div class="yyi" :class="order.tohExId != '*' ? 'hasYi' : ''" @click.stop="extremelyShow($index,order.tohExId,$event)">异</div>
                <div class="xxiu" @click.stop="modifiedShow(order.tchId,order.tohId,$event)">修</div>
            </div>
            <div class="allotMan" v-if="order.allotMan">分单人：{{order.allotMan}}</div>
            <div class="allotMan" v-if="order.tohRecvMan">承运人：{{order.tohRecvMan}}</div>
            <div class="allotMan">合　计：数量{{order.tohQty}}　体积{{order.tohWeight}}　重量{{order.tohCubage}}</div>

            <div class="picBox">
                <div style="width:1rem;left:0" class="area">{{order.startArea}}</div>
                <div class="line_box" style="width:100%">
                    <div class="line_box1" :class="parseInt(order.tohStatus) >= 20 ? 'colorBorder' : ''">
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
    name: 'myorderallot',

    props: {
        options: {
          type: Array,
          required: true,
        },
        title:String,
        value: Array
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
        },
        clickOrder(index,currVal,e){
            let self = this;

            if($("#alCircle" + index).hasClass("seALBcircle")){
              $("#alCircle" + index).removeClass("seALBcircle");
              for(var i=0;i<self.value.length;i++){
                if(self.value[i] == currVal){
                  self.value.splice(i,1)
                }
              }
            }else{
              $("#alCircle" + index).addClass("seALBcircle")
              self.value.push(currVal)
            }
            self.$dispatch('chooseValue',self.value) ;
            
          }
        }
};
</script>

<style lang="less">
    @import "../../srcc/style/var.css";
    @import "../../srcc/style/border.css";
.myorderallot{
    border-bottom:1px solid #e5e5e5;
    border-top:1px solid #e5e5e5;
    margin-bottom: 0.3rem;
    background: #fff;
}
.myorderallot .codeLine{
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


.myorderallot .order_content{
    padding:0.5rem;
}
.myorderallot .order_content .allotMan{
    height:1.3rem;
    line-height:1.3rem;
    overflow:hidden;
    white-space:nowrap;
    text-overflow:ellipsis;
}
.myorderallot .shoufa{
    position: relative;
    padding-right:4.5rem;
}
.myorderallot .shoufa p{ 
    height:1.2rem;
    line-height: 1.2rem;
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
.ALBcircle{
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
.seALBcircle{
background: #FFD91E;
border: 1px solid #FFD91E;
}

</style>
