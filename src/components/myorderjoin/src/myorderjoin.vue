<template>
    <div class="myorderjoin" v-for="option in options">

        <!-- 车次交接 -->
        <div class="Truckjoin" v-if="option.tchTaskId != '*' && option.tchTaskId != '**' && title != 'order'" @click="taskDetailShow($event,$index,title,option.ttId,option.ttDriverId)">
            <div class="driverBox">
                <div :id="'joincircle'+$index + title " @click.stop="clickOrder($index,title,option)" class="joincircle" style="top:0.5rem"></div>
                <img :src="option.ttDriverLogo"> 
                <p>
                    <span>{{option.ttDriver.length > 3 ? option.ttDriver.substring(0,3) :option.ttDriver }}</span>
                    <span style="margin-left:0.5rem">{{option.ttTruckCode}}</span>
                </p>
                <p>
                    <span class="iconfont" style="font-size:0.75rem;color:#FFD91E">&#xe60e;</span>
                    {{option.ttDriverMobile}}
                </p>
                <div class="duanci">{{option.ttStage == 'ZC'?'整':option.ttStage == 'TH'?'提':option.ttStage == 'GX'?'干':option.ttStage == 'SH'?'送':''}}</div>
                   
            </div>
            <ul class="timeBox">
                <li class="tz">调度时间：{{option.ttDepartDate}}</li>
                <li class="tz">{{option.ttStartOrgName}}</li>
                <li class="qrcode"  @click.stop = "showQRcode(option.ttId,$event)">
                    <span style="color:#666" slot="icon" class="iconfont">&#xe602;</span>
                </li>
                <li class="pdf" v-if="option.ttStage == 'GX'" @click.stop="openPDF(option.ttId,'trucklist')">
                    <span style="color:#666" slot="icon" class="iconfont" >&#xe61d;</span>
                </li>
            </ul>

            <div class="driverState">
                <ul class="stateLine">
                    <li class="pic_box">
                        <span slot="icon" class="iconfont">&#xe626;</span>
                        <span class="badge">{{option.ttCount}}</span>
                        <p>{{option.taskTitle[0]}}</p>
                    </li>
                    <li class="pic_box">
                        <span slot="icon" class="iconfont">&#xe62a;</span>
                        <span class="badge">{{option.ttCount-option.ttLoadCount}}</span>
                        <p>{{option.taskTitle[1]}}</p>
                    </li>
                    <li class="pic_box">
                        <span slot="icon" class="iconfont">&#xe628;</span>
                        <span v-if="option.ttStage!='TH'" class="badge">{{option.ttCount-option.ttUnloadCount}}</span>
                        <span v-if="option.ttStage=='TH'" class="badge">{{option.ttUnloadCount}}</span>
                        <p>{{option.taskTitle[2]}}</p>
                    </li>
                </ul>

                <div class="zAndt" style="display: inline-block;">
                    <p><span>{{parseFloat(option.ttWeight).toFixed(2)}}</span> kg</p>
                    <p><span>{{parseFloat(option.ttCubage).toFixed(2)}}</span> m³</p>
                </div>
            </div>
        </div>

        <!-- 订单交接 -->
        <div class="orderjoin" v-if="option.tchTaskId == '*' || option.tchTaskId == '**' || title =='order'">       
            <div class="codeLine">
                <div class="joincircle" :id="'joincircle'+$index + title " @click.stop="clickOrder($index,title,option)"></div> 
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
                <div class="picBox">
                    <div style="left:0" class="area">{{option.startArea}}</div>  
                    <div class="line_box" style="width:100%">
                        <div class="DorderL">
                            <p>{{option.tchStatusTitle[0]}}</p>
                            <span class="DorderC" :class="option.tchStatus >= 01 ? 'DorderCircle' : ''"></span>
                            <img v-if="parseInt(option.tchStatus) == 01" class="statusCar" src="../../../img/car.jpg">
                        </div>
                        <div class="DorderL" :class="option.tchStatus >= 10 ? 'DorderLine' : ''">
                            <p>{{option.tchStatusTitle[1]}}</p>
                            <span class="DorderC" :class="option.tchStatus >= 10 ? 'DorderCircle' : ''"></span>
                            <img v-if="parseInt(option.tchStatus) == 10" class="statusCar" src="../../../img/car.jpg">
                        </div>
                        <div class="DorderL" :class="option.tchStatus >= 20 ? 'DorderLine' : ''">
                            <p>{{option.tchStatusTitle[2]}}</p>
                            <span class="DorderC"  :class="option.tchStatus >= 20 ? 'DorderCircle' : ''"></span>
                            <img v-if="parseInt(option.tchStatus) == 20" class="statusCar" src="../../../img/car.jpg">
                        </div>
                    </div>
                    <div style="right:0" class="area">{{option.endArea}}</div>
                    
                </div>  
            </div>
            
        </div>

    </div>

</template>

<script>
// import XCell from '../../cell/index.js';

export default {
    name: 'myorderjoin',

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
        taskDetailShow(e,index,title,ttId,ttDriverId){//车次详情
            let self = this;
            if(title == 'truck'){
                return;
            }else{
                //当前选中元素的变色
                let el = e.target;
                let Truckjoin = $(el).hasClass("Truckjoin") ? $(el) : $(el).parents('.Truckjoin');
                $(".orderjoin").removeClass("active_border");
                $(".Truckjoin").removeClass("active_border");
                Truckjoin.addClass("active_border");
                this.$dispatch('taskDetailShow',ttId,ttDriverId)  
            }

        },
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
        clickOrder(index,title,currOption){
            let self = this;
            if(title =='truck'){
                self.$dispatch('chooseAllValue',index,title) ;
            }else{
                if($("#joincircle" + index + title).hasClass("sejoincircle")){
                  $("#joincircle" + index + title).removeClass("sejoincircle");
                  for(var i=0;i<self.value.length;i++){
                    if(self.value[i] == currOption.value){
                      self.value.splice(i,1);
                      self.value2.splice(i,1)
                    }
                  }
                }else{
                  $("#joincircle" + index + title).addClass("sejoincircle")
                  self.value.push(currOption.value)
                  self.value2.push(currOption.tchId2)
                }
                console.log(self.value)
                console.log(self.value2)
                self.$dispatch('chooseValue',self.value,self.value2) ;
            }
                 
        },
        showQRcode(ttId,e){
            let self = this;
            self.$dispatch('showQRcode',ttId,e) ;
        }
    }
};
</script>

<style lang="less">
    @import "../../srcc/style/var.css";
    @import "../../srcc/style/border.css";
.Truckjoin{
    border-top:1px solid #e5e5e5;
    border-bottom:1px solid #e5e5e5;
    margin-bottom:0.3rem;
    background:#fff;
}

.Truckjoin .driverBox{
    position: relative;
    overflow: hidden;
    height:3rem;
    padding:0.3rem 2.5rem 0.3rem 5rem;

}
.joincircle{
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
.Truckjoin .driverBox img{
    position: absolute;
    top:0.4rem;
    left:2rem;
    width:2.3rem;
    height:2.3rem;
    border-radius:0.3rem;
}
.Truckjoin .driverBox>p{
    height:1.2rem;
    line-height: 1.2rem;
}
.Truckjoin .duanci{
    position: absolute;
    width:1.3rem;
    height:1.3rem;
    line-height:1.3rem;
    top:0.8rem;
    right:0.5rem;
    text-align:center;
    border-radius:0.3rem;
    background:rgba(0,0,0,0.6);
    color:#fff;
}
.Truckjoin .timeBox{
    position: relative;
    padding:0 4.3rem 0.2rem 0.5rem;
}
.Truckjoin .timeBox .tz{
    overflow: hidden;
    height: 1.2rem;
    line-height: 1.2rem;
    overflow:hidden;
    white-space:nowrap;
    text-overflow:ellipsis;
}
.Truckjoin .timeBox .qrcode,.Truckjoin .timeBox .pdf{
    position: absolute;
    top:0.4rem;
}
.Truckjoin .timeBox .iconfont{
    font-size:1.2rem;
}
.Truckjoin .timeBox .qrcode{
    right:0.5rem;
}
.Truckjoin .timeBox .pdf{
    right:2.4rem;
}

.Truckjoin .driverState{
    padding:0.3rem 0;
    overflow: hidden;
    border-top: 1px solid #e5e5e5;
}
.Truckjoin .driverState .stateLine{
    float:left;
    width:60%;
}

.Truckjoin .stateLine li{
    float:left;
    position: relative;
}

.Truckjoin .pic_box{
    width:33%;
    position: relative;
    text-align:center;
}
.Truckjoin .pic_box .iconfont{
    font-size:1.2rem;
    color:#666;
}

.Truckjoin .pic_box .badge{
    min-width: 1rem;
    min-height: 1rem;
    line-height: 1rem;
    border-radius: 0.5rem;
    background: #F00;
    color:#fff;
    position: absolute;
    top:0;
    left:50%;
    font-size: 0.5rem;
    text-align: center;
}

.Truckjoin .driverState .zAndt{
    float:right;
    vertical-align: top;
    width: 40%;
    padding-right:0.5rem;
}
.Truckjoin .driverState .zAndt p{
    height:1.4rem;
    line-height: 1.4rem;
    text-align: right;
}
.Truckjoin .driverState .zAndt p span{
    color:#f00;
}
.orderjoin{
    border-top:1px solid #e5e5e5;
    border-bottom:1px solid #e5e5e5;
    margin-bottom:0.3rem;
    overflow:hidden;
    background: #fff;
}
.orderjoin .codeLine{
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


.orderjoin .order_content{
    padding:0.5rem;
}
.orderjoin .order_content .allotMan{
    height:1.3rem;
    line-height:1.3rem;
    overflow:hidden;
    white-space:nowrap;
    text-overflow:ellipsis;
}
.orderjoin .shoufa{
    position: relative;
    padding-right:4.5rem;
}
.orderjoin .shoufa p{ 
    height:1.2rem;
    line-height: 1.2rem;
    overflow:hidden;
    white-space:nowrap;
    text-overflow:ellipsis; 
}
.orderjoin .picBox{
   overflow:hidden;
   padding:0 3rem;
   position: relative;
}
.orderjoin .picBox>div{
    /*float:left;*/
    display: inline-block;
}
.orderjoin .line_box{
    padding:0.75rem 0.2rem;
    width:100%;
}

.orderjoin .line_box>div>p{
    width:3rem;
    position: absolute;
    top:-1.6rem;
    right:-1.5rem;
    text-align: center;
}
.orderjoin .line_box>div:first-child{
    border-top:none;
    width:20%;

}
.orderjoin .area{
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
