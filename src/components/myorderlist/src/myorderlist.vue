<template>
    <div class="myorderlist" v-for="order in options"> 
        
        <div v-show="order.subSystem == 'SJ'" class="cardBox" :id="'cardBox'+$index ">
            <div v-show="order.ttStage != 'GX'" class="affirmCard" @click.stop="ConfirmBtn($index,order.btnText)">{{order.btnText}}</div> 
            <div v-show="order.ttStage == 'ZC' && order.tchStatus == 10 " class="updateCard" @click.stop="ConfirmBtn($index,'整车送达',1)">整车送达</div> 
            <div v-show="order.ttStage != 'GX' && order.tchStatus == 20 " class="updateCard">
                <p @click = wxgetPic(order.tohId)>回单上传</p>
            </div>     
        </div>
        <div class="orderList" :id="'orderList'+$index"> 
            <ul class="codeLine"> 
                <li style="width:50%;">{{order.tohId}}</li>
                <li v-if="title != 'bill'" style="width:50%;text-align:right;position: relative;">
                    <span style="color:#f00;font-size: 1.2rem" @click.stop="goNavigator($event,order)" slot="icon" class="iconfont titleIcon">&#xe61c;</span>
                    <div class="yi titleIcon" :class="order.tohExId != '*' ? 'hasYi' : ''" @click.stop="extremelyShow($event,$index,order.tohExId)">异</div>
                    <div class="xiu titleIcon" @click.stop="modifiedShow($event,$index,order.tchId,order.tohId)">修</div>
                    <span v-if="order.browserType!='weixin'" style="font-size: 1.2rem" slot="icon" class="iconfont titleIcon" @click="shareOrder($event,order)">&#xe61b;</span>
                </li>
                <li v-if="title == 'bill'" style="width:50%;text-align:right;">
                    <span style="padding:0.3rem;color:#f00;">￥ {{ order.showAmt}}</span>
                </li>
            </ul>
        
            <div class="order_content" @click="orderDetailShow($event,$index)">
                <ul class="shoufa">
                    <li style="padding-right:0.5rem;">发货人：{{order.tohOwnerName}}</li>
                    <li>收货人：{{order.tohEndName}}</li>
                </ul>
                <div style="height:1.3rem;line-height:1.3rem;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">合　计：数量{{order.tohQty}} 体积{{order.tohWeight}} 重量{{order.tohCubage}}</div>
                <div class="picBox">
                    <div style="left:0" class="area">{{order.startArea}}</div>    
                    <div class="line_box" style="width:100%">
                        <div class="DorderL">
                            <p>{{order.tchStatusTitle[0]}}</p>
                            <span class="DorderC" :class="order.tchStatus >= 01 ? 'DorderCircle' : ''"></span>
                            <img v-if="parseInt(order.tchStatus) == 01" class="statusCar" src="../../../img/car.jpg">
                        </div>
                        <div class="DorderL" :class="order.tchStatus >= 10 ? 'DorderLine' : ''">
                            <p>{{order.tchStatusTitle[1]}}</p>
                            <span class="DorderC" :class="order.tchStatus >= 10 ? 'DorderCircle' : ''"></span>
                            <img v-if="parseInt(order.tchStatus) == 10" class="statusCar" src="../../../img/car.jpg">
                        </div>
                        <div class="DorderL" :class="order.tchStatus >= 20 ? 'DorderLine' : ''">
                            <p>{{order.tchStatusTitle[2]}}</p>
                            <span class="DorderC"  :class="order.tchStatus >= 20 ? 'DorderCircle' : ''"></span>
                            <img v-if="parseInt(order.tchStatus) == 20" class="statusCar" src="../../../img/car.jpg">
                        </div>
                    </div>
                    <div style="right:0" class="area">{{order.endArea}}</div>
                    
                </div>  
            </div>
        
            
        </div>
    </div>

</template>

<script>
// import XCell from '../../cell/index.js';

export default {
    name: 'myorderlist',

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
        wxgetPic(tohId){
            let self = this;
            this.$dispatch('wxgetPic',tohId) ; 
        },
        orderDetailShow (e,index) {//详情
            let self = this;
            if(self.title == 'bill'){
                return;
            }else{
                let el = e.target;
                let myorderlist = $(el).parents('.myorderlist');
                $(".myorderlist").removeClass("active_border");
                myorderlist.addClass("active_border");
               this.$dispatch('orderDetailShow',index) ;             
            }
        },
        extremelyShow (e,index,tohExId){//异常
            let self = this;
            let el = e.target;
            let myorderlist = $(el).parents('.myorderlist');
            $(".myorderlist").removeClass("active_border");
            myorderlist.addClass("active_border");

            this.$dispatch('extremelyShow',index,tohExId) ;
        },
        modifiedShow (e,index,tchId,tohId){//修改
            let self = this;
            let el = e.target;
            let myorderlist = $(el).parents('.myorderlist');
            $(".myorderlist").removeClass("active_border");
            myorderlist.addClass("active_border");

            this.$dispatch('modifiedShow',index,tchId,tohId) ;
        },
        ConfirmBtn (index,text,sd){//操作按钮
            let self = this;
            this.$dispatch('ConfirmBtn',index,text,sd) ;
        },
        goNavigator(e,order){//导航
            let self = this;
            let el = e.target;
            let myorderlist = $(el).parents('.myorderlist');
            $(".myorderlist").removeClass("active_border");
            myorderlist.addClass("active_border");    
            this.$dispatch('goNavigator',order) ;
        },
        shareOrder(e,order){
            let self = this;
            let el = e.target;
            let myorderlist = $(el).parents('.myorderlist');
            $(".myorderlist").removeClass("active_border");
            myorderlist.addClass("active_border");

            this.$dispatch('shareOrder',order) ;
        }
    }
};
</script>

<style lang="less">
    @import "../../srcc/style/var.css";
    @import "../../srcc/style/border.css";
    .myorderlist{
        position:relative;
        border-top:1px solid #e5e5e5;
        border-bottom:1px solid #e5e5e5;
        margin-top: 0.25rem;
        overflow:hidden;
        height:8.3rem;
        .cardBox{
            position:absolute;
            top:1px;
            right:1px;
            overflow:hidden;
        }
        .cardBox>div{
            float:right;
            width:80px;
            height:8.25rem;
            line-height:8.25rem;
            text-align:center;
            color:#FFD91E;
        }
        .cardBox .updateCard{
            background:#A2A2A2;  
        }
        .cardBox .affirmCard{
            background:#353535;
        }
        .orderList{
            position:absolute;
            top:0;
            left:0;
            width:100%;
            height:8.3rem;
            background: #fff;
        }
        .codeLine{
            overflow:hidden;
            padding:0 0.5rem;
            border-bottom:1px solid #e5e5e5;
        }
        .yi,.xiu{
            display: inline-block;
            width: 1.2rem;
            height: 1.2rem;
            line-height: 1.2rem;
            vertical-align:top;
            text-align: center;
            border-radius: 0.2rem;
            background: #666;
            color:#fff;
            /*font-size:0.55rem;*/
            margin:0.4rem 0 0.4rem 0.5rem;
        }
        .codeLine li{
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
            float:left;
            width:50%;
            height:1.3rem;
            line-height: 1.3rem;
            overflow:hidden;
            white-space:nowrap;
            text-overflow:ellipsis; 
        }
        .picBox{
           overflow:hidden;
           padding:0 3rem;
           position: relative;
        }
        .picBox>div{
            /*float:left;*/
            display: inline-block;
        }
        .line_box{
            padding:0.75rem 0.2rem;
            /*position: relative;*/
        }

        .line_box>div>p{
            width:3rem;
            position: absolute;
            top:-1.6rem;
            right:-1.5rem;
            text-align: center;
        }
        .line_box>div:first-child{
            border-top:none;
            width:20%;

        }
        .area{
            position: absolute;
            padding:0.1rem;
            margin-top:0.6rem;
            border:1px solid #e5e5e5;
            text-align: center;
            border-radius: 0.2rem;
            width:3rem;

        }
        .hasYi{
            background:#FFD91E;
        }
        .titleIcon{
            /*position: absolute;*/
            margin-left:0.5rem;
            /*margin-right:0;*/
        }

    }
.DorderC{
    display: inline-block;
    position: absolute;
    top:-0.3rem;
    right:-0.3rem;
    width:0.6rem;
    height:0.6rem;
    background: #e5e5e5;
    border-radius: 0.3rem;
    z-index:2;
}

.DorderCircle{
    background:#888;
}
.DorderL{
    display: inline-block;
    width:30%;
    border-top:1px solid #e5e5e5;
    position: relative;
}
.DorderLine{
    border-top:1px solid #888;
}
.sejoincircle{
    background: #FFD91E;
    border: 1px solid #FFD91E;
}
.statusCar{
    display: inline-block;
    position: absolute;
    width: 1.2rem;
    border-radius: 0.6rem;
    top: -0.6rem;
    right: -0.6rem;
    z-index: 2;
    background: #fff;
    padding: 0;
}

</style>
