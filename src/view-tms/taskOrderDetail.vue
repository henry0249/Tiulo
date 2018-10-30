<template>
    <div class="page"> 
        <mt-header fixed title="订单详情">
            <mt-button icon="back" slot="left" @click="backPage()"></mt-button>
        </mt-header> 
        <div class="container-top"> 
            <div id="myorderdetail">
                <div class="cellLine">
                    <div class="cellBox" style="border:none">
                        <span class="cellTitle">订单号</span>
                        <span class="cellContent">{{orderData.tohOrderShow}}</span>
                    </div>
                </div>
                <div class="cellLine">
                    <div class="cellBox">
                        <span class="cellTitle typeTitle">发货人</span>
                    </div>
                    <div class="cellBox">
                        <span class="cellTitle">名称</span>
                        <span class="cellContent">{{orderData.tohOwnerName}}</span>
                    </div>
                    <div class="cellBox">
                        <span class="cellTitle">联系人</span>
                        <span class="cellContent">{{orderData.tohStartContact}}</span>
                    </div>
                    <div class="cellBox">
                        <span class="cellTitle">联系电话</span>
                        <span class="cellContent">{{orderData.tohStartContactMobile}}</span>
                    </div>
                    <div class="cellBox" style="border:none">
                        <span class="cellTitle">地址</span>
                        <span class="cellContent">{{orderData.StartAddress}}</span>
                    </div>
                </div>
                <div class="cellLine">
                    <div class="cellBox">
                        <span class="cellTitle typeTitle">收货人</span>
                    </div>
                    <div class="cellBox">
                        <span class="cellTitle">名称</span>
                        <span class="cellContent">{{orderData.tohEndName}}</span>
                    </div>
                    <div class="cellBox">
                        <span class="cellTitle">联系人</span>
                        <span class="cellContent">{{orderData.tohEndContact}}</span>
                    </div>
                    <div class="cellBox">
                        <span class="cellTitle">联系电话</span>
                        <span class="cellContent">{{orderData.tohEndContactMobile}}</span>
                    </div>
                    <div class="cellBox" style="border:none">
                        <span class="cellTitle">地址</span>
                        <span class="cellContent">{{orderData.EndAddress}}</span>
                    </div>
                </div> 
                <div class="cellLine">
                    <div class="cellBox">
                        <span class="cellTitle typeTitle">货物信息</span>
                    </div>
                    <ul class="goods">
                        <li class="goods_title">
                            <div style="width:20%">商品名称</div>
                            <div style="width:14%">包装</div>
                            <div style="width:14%">数量</div>
                            <div style="width:23%">重量kg</div>
                            <div style="width:23%">体积m³</div>
                        </li>
                        <li class="goods_title" track-by="$index" v-for="product in orderData.tchDetail">
                            <div style="width:20%">{{product.todMaterialName}}</div>
                            <div style="width:14%">{{product.todMaterialCase}}</div>
                            <div style="width:14%">{{product.todQty}}</div>
                            <div style="width:23%">{{product.todWeight}}</div>
                            <div style="width:23%">{{product.todCubage}}</div>
                        </li>
                    </ul> 
                </div>
                <div class="cellLine">
                    <div class="cellBox">
                        <span class="cellTitle typeTitle">服务类型</span>
                    </div>
                    <ul class="serviceType">
                        <li>{{orderData.tohType1 == 'ZC' ? "整车直送" :orderData.tohType1 == 'MM' ? "门到门" :orderData.tohType1 == 'MZ' ? "门到站" :orderData.tohType1 == 'ZM' ? "站到门" :orderData.tohType1 == 'ZZ' ? "站到站" :''}}</li>
                    </ul> 
                </div>
                <div class="cellLine">
                    <div class="cellBox">
                        <span class="cellTitle typeTitle">服务费用</span>
                    </div>
                    <ul class="serviceTotal">
                        <li><span>代收货款总额：￥{{orderData.tohCollectionAmt}}</span><span>结算方式：{{orderData.tohBalanceMode == '1000' ? "现付" : orderData.tohBalanceMode == '0100' ? "到付" : orderData.tohBalanceMode == '0010' ? "回付" : orderData.tohBalanceMode == '0001' ? "月结" :""}}</span></li>
                        <li v-if="subSystem != 'SJ'">合计：￥{{orderData.tohAmt}}</li>
                    </ul>
                </div> 
                <div class="cellLine">
                    <div class="cellBox">
                        <span class="cellTitle typeTitle">订单要求</span>
                    </div>
                    <div class="cellBox">
                        <span class="cellTitle">要求提货时间</span>
                        <span class="cellContent">{{orderData.tohExpectDepartDate}}</span>
                    </div>
                    <div class="cellBox">
                        <span class="cellTitle">要求发货时间</span>
                        <span class="cellContent">{{orderData.tohExpectArriveDate}}</span>
                    </div>
                    <div class="cellBox" style="border:none;">
                        <span class="cellTitle">回单要求</span>
                        <span class="cellContent">{{orderData.tohSignType}}</span>
                    </div>
                </div>   
                <div class="cellLine" style="background:#fff;padding:0.5rem;border-bottom:1px solid #e5e5e5;">备注：{{orderData.tohRemark}}</div>
                          
            </div> 
        </div> 
    </div>
</template>

<script>
// Ajax request module, return a Promise
import Tokens from '../token'
export default {
    data () {
        return {
            ttdriverId:'',//driverId 默认为userId 
            sessionId:'',
            orderData:'',//订单数据
            subSystem:'',//版本
        }
    },
    methods: {
        go (link, param) {
            let self = this
            self.$transfer.go(self, link, param)
        },
        back (link, param) {
            let self = this
            self.$transfer.back(self, link, param);
        },
        backPage(){//返回哪个页面
            let self = this;
            let backPath = Tokens.fetch("taskOrderDetailBackPath");
            self.back(backPath);
        }
    },
    route: {
        data ({from, to, next }) {
            let self = this ;
            //进入页面时token不存在
            if(!localStorage.getItem("token")){
                self.$transfer.backLogin(self, {info:'token没有值'});
                return;
            }
            let token = Tokens.fetch("token");
            self.ttdriverId = token["userId"];
            self.sessionId = token["sessionId"];
            self.subSystem = token["subSystem"]; 
            self.orderData = Tokens.fetch("orderData");
            //需要返回的路径
            if(from.path && ((from.path.indexOf('taskDetail')!= -1) || (from.path.indexOf('traceList')!= -1) || (from.path.indexOf('orderManage')!= -1) || (from.path.indexOf('joinManage')!= -1) || (from.path.indexOf('joinTruckDetail')!= -1) || (from.path.indexOf('signManage')!= -1))){
                Tokens.save("taskOrderDetailBackPath",'');
                Tokens.save("taskOrderDetailBackPath",from.path);
            }
            next()
        },
        deactivate ({ next }) {
            //Triggers when component destroys
            next()
        },
        canDeactivate ({ next, to, abort }) {
            //Triggers when component destroys
            const self = this
            next()
        }
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#myorderdetail{
    padding-bottom:1rem;
    /*font-size:0.65rem;*/
}

.cellLine{
    padding:0 0 0 0.5rem;
    background: #fff;
    border-top: 1px solid #e5e5e5;
    border-bottom: 1px solid #e5e5e5;
    margin-bottom:0.3rem;
}
.cellBox{
    position: relative;
    border-bottom:1px solid #e5e5e5;
    overflow: hidden;
    padding:0.5rem 0.5rem 0.5rem 4.5rem;
    min-height:2rem;

}
.cellBox span{
    display: block;
}
.cellBox .cellTitle{
    position: absolute;
    top:0.5rem;
    left:0;
    color:#333;
}
.cellBox .cellContent{
    width:100%;
    float:right;
    text-align: right;
    color:#666;
}
.goods{
    padding:0.5rem 0.5rem;
    background: #fff;
    box-sizing: border-box;
}
.goods .goods_title div{
    display: inline-block;
    width:17%;
    height:1.3rem;
    line-height: 1.3rem;
    overflow:hidden;
    white-space:nowrap;
    text-overflow:ellipsis;   
    word-break: nowrap;
}
.serviceType{
    background: #fff;
    padding:0 0.5rem;
    overflow: hidden;
}
.serviceType li{
    float:left;
    width:30%;
    height:1.8rem;
    line-height: 1.8rem;
    overflow:hidden;
    white-space:nowrap;
    text-overflow:ellipsis; 
}
.serviceTotal{
    padding:0.5rem;
    background: #fff;
}
.serviceTotal li{
    height:1.3rem;
    line-height: 1.3rem;
}
.serviceTotal li span{
    display: inline-block;
    width: 50%;
    overflow:hidden;
    word-wrap:break-word;
    text-overflow:ellipsis; 

}
.cellBox .typeTitle{
    /*font-size: 0.7rem;*/
    color:#000;
}

</style>
