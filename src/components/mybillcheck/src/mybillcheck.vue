<template>
    <div v-if="title =='yw'">
        <div class="mybillcheck" v-for="option in options">
            <div class="codeLine">
                <div :id="'checkCircle'+$index " class="checkCircle" @click.stop="clickOrder($index,option.value)"></div> 
                账单号：{{option.fachId}}
                <div class="time">{{option.fachCreateDate?option.fachCreateDate.substring(0,10):""}}</div>
            </div>
        
            <ul class="order_content"  @click="goBillDetail(option,$event)">
                <li>对账对象：{{option.fachPayeeName}}</li> 
                <li>对账类型：{{option.fachType == "ZD-SJ"?"站点-司机":option.fachType == "ZD-ZD1"?"站点-站点":option.fachType == "ZD-ZD2"?"分单":""}}</li> 
                <li>车牌号码：{{option.fachTruckCode}}</li> 
                <li>账单周期：{{option.fromDate}} ~ {{option.toDate}}</li> 
                <li style="color:#f00">账单金额：￥{{option.fachAmt>0 ? '-'+ option.fachAmt.toFixed(2):option.fachAmt}}　已付：￥{{option.fachPayerAmt>0 ? '-'+ option.fachPayerAmt.toFixed(2):option.fachPayerAmt}}</li>  
                <li><img @click.stop="lookBill(option.fachId)" src="../../../img/xiazai.png"></li>      
            </ul>
        </div>
        
    </div>
    <div v-if="title =='jy'">
        <div class="mybillcheck" v-for="option in options">
            <div class="codeLine">
                <div :id="'checkCircle'+$index " class="checkCircle" @click.stop="clickOrder($index,option.value)"></div> 
                账单号：{{option.fachId}}
                <div class="time">申请人：{{option.fachCreateUser}}</div>
            </div>
        
            <ul class="order_content"  @click="goBillDetail(option,$event)">
                <li>收款人：{{option.fachPayeeName}}</li> 
                <li>费用类型：{{option.fachChargeName}}</li> 
                <li>申请时间：{{option.fachCreateDate}}</li> 
                <li>支付类型：{{option.fachPayMode}}</li> 
                <li style="color:#f00">账单金额：￥{{option.fachAmt>0 ? '-'+ option.fachAmt.toFixed(2):option.fachAmt}}　已付：￥{{option.fachPayerAmt>0 ? '-'+ option.fachPayerAmt.toFixed(2):option.fachPayerAmt}}</li> 
                <li><img @click.stop="lookBill(option.fachId)" src="../../../img/xiazai.png"></li>      
            </ul>
        </div>
    </div>

</template>

<script>
// import XCell from '../../cell/index.js';

export default {
    name: 'mybillcheck',

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
        goBillDetail(bill,e){
            let self = this;
            //当前选中元素的变色
            let el = e.target;
            let mybillcheck = $(el).hasClass("mybillcheck") ? $(el) : $(el).parents('.mybillcheck');
            $(".mybillcheck").removeClass("active_border");
            mybillcheck.addClass("active_border");
            this.$dispatch('goBillDetail',bill)
        },
        clickOrder(index,currVal){
            let self = this;
            if($("#checkCircle" + index).hasClass("secheckCircle")){
              $("#checkCircle" + index).removeClass("secheckCircle");    
              for(var i=0;i<self.value.length;i++){
                if(self.value[i] == currVal){
                  self.value.splice(i,1)
                }
              }
            }else{
              $("#checkCircle" + index).addClass("secheckCircle")
              self.value.push(currVal)
            }
            self.$dispatch('chooseValue',self.value) ;
        },
        lookBill(fachId){//查看账单
            let self = this;
            self.$dispatch('lookBill',fachId) ;

        }
    }
};
</script>

<style lang="less">
    @import "../../srcc/style/var.css";
    @import "../../srcc/style/border.css";
.mybillcheck{
    border-bottom:1px solid #e5e5e5;
    border-top:1px solid #e5e5e5;
    margin-bottom: 0.3rem;
    background: #fff;
}
.mybillcheck .codeLine{
    position: relative;
    overflow:hidden;
    white-space:nowrap;
    text-overflow:ellipsis;
    padding:0 6rem 0 2rem;
    height:2rem;
    line-height: 2rem;
    border-bottom:1px solid #e5e5e5;
}
.time{
    position: absolute;
    right:0.5rem;
    top:0;
    max-width: 5.5rem;
    overflow:hidden;
    white-space:nowrap;
    text-overflow:ellipsis;

}
.mybillcheck .order_content{
    position: relative;
    padding:0.3rem 3rem 0.3rem 0.5rem;
}
.mybillcheck li:not(:last-child){
    height:1.3rem;
    line-height:1.3rem;
    overflow:hidden;
    white-space:nowrap;
    text-overflow:ellipsis;
}
.mybillcheck li:last-child{
    position: absolute;
    right:0.5rem;
    top:1.6rem;
}
.mybillcheck li:last-child img{
    width:2rem;
    height:2rem;
}
.checkCircle{
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
.secheckCircle{
    background: #FFD91E;
    border: 1px solid #FFD91E;
}

</style>
