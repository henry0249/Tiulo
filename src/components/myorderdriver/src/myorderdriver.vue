<template>
    <div class="myorderdriver" v-for="task in options" @click="taskDetailShow($event,$index,title,task.ttId,task.ttDriverId)">  
        <div class="companyNameDiv">
            <p>{{task.ttStartOrgName}}</p>
            <span class="duanci" style="float:right;">{{task.ttStage}}</span>
        </div>
        <ul class="picBox">
            <li>
               <img style="width:2rem;height:2rem;border-radius:0.3rem;" :src="task.ttDriverLogo"> 
            </li>
            <li style="margin-left:0.5rem;">{{task.ttDriver}}</li>
            <li>
                <span v-if="task.ttDriverSex == '男'" style="color:#81ADFC" slot="icon" class="iconfont">&#xe60b;</span>
                <span v-if="task.ttDriverSex == '女'" style="color:#FD626E" slot="icon" class="iconfont">&#xe60d;</span>    
            </li>
            <li class="qrcode" v-if="title != 'bill'&& title != 'billO'&& task.subSystem == 'SJ'" @click.stop = "showQRcode(task.ttId,$event)">
                <span style="color:#666" slot="icon" class="iconfont">&#xe602;</span>
            </li>
            <li class="pdf" v-if="task.ttStage == '干' && title != 'bill' && title != 'billO'" @click.stop="openPDF(task.ttId,'trucklist')">
                <span style="color:#666" slot="icon" class="iconfont" >&#xe61d;</span>
            </li>
            
        </ul>
        <ul class="telBox">
            <li>
                <p>手机 {{task.ttDriverMobile}}</p>
                <span v-if="title != 'bill'&& title != 'billO'">￥{{task.ttCarrierAmt}}</span>
                <span v-if="title == 'bill' || title == 'billO'" style="color:#f00">{{task.ttCarrierInputMode}} ￥ {{task.showAmt}}</span>
            </li>
            <li>
                <p>{{task.ttTruckCode}}</p>
                <span>{{task.ttDepartDate}}</span>
                
            </li>

        </ul>
        <div class="driverState" v-if="title == 'xq'">
            <ul class="stateLine">
                <li class="pic_box">
                    <span slot="icon" class="iconfont">&#xe626;</span>
                    <span class="badge">{{task.ttCount}}</span>
                    <p>{{task.taskTitle[0]}}</p>
                </li>
                <li class="pic_box">
                    <span slot="icon" class="iconfont">&#xe62a;</span>
                    <span class="badge">{{task.ttCount-task.ttLoadCount}}</span>
                    <p>{{task.taskTitle[1]}}</p>
                </li>
                <li class="pic_box">
                    <span slot="icon" class="iconfont">&#xe628;</span>
                    <span v-if="task.ttStage!='提'" class="badge">{{task.ttCount-task.ttUnloadCount}}</span>
                    <span v-if="task.ttStage=='提'" class="badge">{{task.ttUnloadCount}}</span>
                    <p>{{task.taskTitle[2]}}</p>
                </li>
            </ul>
            
            <div v-if="task.subSystem == 'SJ'" class="yichangBtn">
                <mt-button class="yc_btn" size="small" @click="truckAddExtremelyShow(task.ttId)" >车次异常</mt-button>
            </div>
        </div>

        
    </div> 
  

</template>

<script>
import XCell from '../../cell/index.js';

export default {
    name: 'myorderdriver',

    props: {
        options: {
          type: Array,
          required: true
        },
        title:String
    },

    data() {
        return {


        };
    },
    methods: {
        taskDetailShow (e,index,value,ttId,ttDriverId) {  
            let self = this;
            if(value == 'xq' || value == 'billO'){
                return;
            }else{
                //当前选中元素的变色
                let el = e.target;
                let myorderdriver = $(el).hasClass("myorderdriver") ? $(el) : $(el).parents('.myorderdriver');
                $(".myorderdriver").removeClass("active_border");
                myorderdriver.addClass("active_border");
                
                this.$dispatch('taskDetailShow',index,value,ttId,ttDriverId)  
            }
        },
        truckAddExtremelyShow (ttId){
            let self = this;
            this.$dispatch('truckAddExtremelyShow',ttId)
        },
        openPDF(ttId,trucklist){
            let self = this;
            this.$dispatch('openPDF',ttId,trucklist)
        },
        showQRcode(ttId,e){
            let self = this;
            //当前选中元素的变色
            if(self.title != 'xq'){
                let el = e.target;
                let myorderdriver = $(el).hasClass("myorderdriver") ? $(el) : $(el).parents('.myorderdriver');
                $(".myorderdriver").removeClass("active_border");
                myorderdriver.addClass("active_border"); 
            }
                
            this.$dispatch('showQRcode',ttId)
        },

    },

    components: {
        XCell
    },

};
</script>

<style lang="less">
    @import "../../srcc/style/var.css";
    @import "../../srcc/style/border.css";


.myorderdriver{
    border-top:1px solid #e5e5e5;
    border-bottom:1px solid #e5e5e5;
    /*font-size: 0.65rem;*/
    margin-bottom:0.3rem;
    background:#fff;
}
.myorderdriver .companyNameDiv{
    height:1.8rem;
    line-height: 1.8rem;
    border-bottom:1px solid #e5e5e5;
    padding:0 2.3rem 0 0.5rem;
    position: relative;
}
.myorderdriver .companyNameDiv p{
    width:100%;
    overflow:hidden;
    white-space:nowrap;
    text-overflow:ellipsis; 
}
.myorderdriver .duanci{
    position: absolute;
    width:1.3rem;
    height:1.3rem;
    line-height:1.3rem;
    top:0.2rem;
    right:0.5rem;
    text-align:center;
    border-radius:0.3rem;
    background:rgba(0,0,0,0.6);
    color:#fff;
}
.myorderdriver .picBox{
    overflow: hidden;
    padding:0.3rem 0.5rem;
}
.myorderdriver .picBox li{
    float:left;
    height:2rem;
    line-height: 2rem;
}
.myorderdriver .picBox li span{
    padding:0.5rem;
}
.myorderdriver .picBox li.qrcode,.myorderdriver .picBox li.pdf{
    float:right;
}
.myorderdriver .telBox{
    padding:0 0.5rem 0.3rem 0.5rem;
    overflow:hidden;
}
.myorderdriver .telBox li{
    overflow: hidden;
}
.myorderdriver .telBox li p,.myorderdriver .telBox li span{
    display: inline-block;
    width:50%;
    height:1.3rem;
    line-height: 1.3rem;
    float:left;
    overflow:hidden;
    white-space:nowrap;
    text-overflow:ellipsis; 
}
.myorderdriver .telBox li span{
    float:right;
    text-align:right;
}
.myorderdriver .driverState{
    padding-top:0.3rem;
    overflow: hidden;
    border-top: 1px solid #e5e5e5;
}
.myorderdriver .driverState .stateLine{
    display: inline-block;
    width:70%;
    padding:0 0.5rem;
}
.myorderdriver .driverState .yichangBtn{
    display: inline-block;
    width:28%; 
    float:right;
}
.myorderdriver .stateLine li{
    float:left;
    position: relative;
}

.myorderdriver .driverC{
    display: inline-block;
    position: absolute;
    top:-0.25rem;
    right:-0.25rem;
    width:0.5rem;
    height:0.5rem;
    background: #e5e5e5;
    border-radius: 0.25rem;
    z-index:2;
}

.myorderdriver .driverCircle{
    background:#FFD91E;
}
.myorderdriver .driverL{
    width:40%;
    border-top:1px solid #e5e5e5;
}
.myorderdriver .driverLine{
    border-top:1px solid #FFD91E;
}
.myorderdriver .yc_btn{
    float:right;
    background:#353535;
    color:#FFD91E;
    margin-top:0.4rem;
    margin-right: 0.5rem;
    /*font-size:0.55rem;*/
}

.myorderdriver .pic_box{
    width:33%;
    position: relative;
    text-align:center;
}
.myorderdriver .pic_box .iconfont{
    font-size:1.2rem;
    color:#666;
}

.myorderdriver .pic_box .badge{
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

</style>
