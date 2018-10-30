<template>
    <div class="page" id="billPage"> 
        <!-- Header -->
        <mt-header fixed title="账单详情">
            <mt-button icon="back" slot="left" @click="backPage()"></mt-button>
        </mt-header>

        <div class="container-top" v-infinite-scroll="orderloadMore()" infinite-scroll-immediate-check="false" infinite-scroll-disabled="loading" infinite-scroll-distance="50">
            
            <mypulldown>
                <div slot= "pullList" :style = "{minHeight:listViewH + 'px'}">
                    <div class="order" v-for="order in orderList"> 
                        <ul class="codeLine"> 
                            <li style="width:60%;">订单号：{{order.tohId}}</li>
                            <li style="width:40%;text-align:right;">
                                <span style="padding:0.3rem;color:#f00;">￥{{order.tohAmtShow}}</span>
                            </li>
                        </ul>
                        <div class="order_content">
                            <ul class="shoufa">
                                <li style="padding-right:0.5rem;">发货人：{{order.tohOwnerName}}</li>
                                <li>收货人：{{order.tohEndName}}</li>
                                <li v-if="order.tohRecvman">承运人：{{order.tohRecvMan}}</li>
                                <li v-if="subSystem != 'KF' && order.tohAllotMan">分单人：{{order.tohAllotMan}}</li>
                            </ul>
                            <div style="height:1.3rem;line-height:1.3rem;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">合计 数量{{order.tohQty}} 体积{{order.tohWeight}} 重量{{order.tohCubage}}</div> 
                        </div>
                    </div>
                    <div class="noData">{{noOrderData}}</div>
                    <!-- 加载指示器 -->
                    <div class="sw-spinner" v-if="orderLoadMore">
                        <mt-spinner type="snake" color="#FFD91E"></mt-spinner>
                    </div>
                </div>
            </mypulldown>
        </div> 
    </div>
</template>

<script>
// Ajax request module, return a Promise
import Tokens from '../token'
import  Myorderdriver from '../components/myorderdriver'
import  Myorderlist from '../components/myorderlist'
import  Mypulldown from '../components/mypulldown'//引入下拉刷新的组件    
export default {
    components:{
        Myorderdriver,
        Myorderlist,
        Mypulldown
    },
    data () {
        return {
            isLoadId:null, 
            listViewH:0,//下拉刷新框的最小高度
            userId:'',
            sessionId:'',
            subSystem:'',
            orgId:'',
            companyId:'',
            fachId:'',//账单Id
            fachType:'',//对账类型
            currDriverList:[],//当前点击的司机信息

            billOrderVisible:false,//订单列表页面显示
            orderList:[],//订单列表
            noOrderData:'',//没有订单数据
            orderCurrPage:1,//订单当前页面
            orderLoadMax:false,//订单是否加载到最大条数
            orderLoadMore:false,//订单加载指示器
            orderloading:false,//订单是否在无限加载

        }
    },
    ready (){
        let self = this; 
        //列表框的最小高度
        self.$nextTick(()=>{
            self.listViewH = $(".container-top").height() - 10;
        })

    },
    events:{
        refreshList(id,topStatus){//下拉刷新时重置列表数据
            let self = this;
            self.isLoadId = id;
            setTimeout(() => {
                // self.orderList = [];
                self.noOrderData = '';//没有订单数据
                self.orderCurrPage = 1;//订单当前页面
                self.orderLoadMax = false;//订单是否加载到最大条数
                self.getOrderList();
            }, 1000);
    
        },
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
        backPage(){
            let self = this;
            let backPath = Tokens.fetch("billOrderKFBackPath");
            self.back(backPath);
        },
        orderloadMore(){//订单加载更多
            let self = this;
            let isStop = isXLorClick();
            if(isStop){ return;}
            if(!self.orderloading  && !self.orderLoadMax && self.orderCurrPage >1){
                self.orderloading = true;
                self.orderLoadMore = true;
                setTimeout(function(){
                    self.getOrderList(self.fachId); 
                },1000)
                      
            }else{
                return;  
            }
        },
        getOrderList () {//获取任务订单
            let self = this;

            let s = {   action:"/tmOrderHead/query1",
                        pageIndex:self.driverCurrPage,
                        pageSize:10
                    };
            if(self.fachType == "ZD-ZD2"){
                s.params = {tohRecvbStatus:"1",tohCostAccountId:self.fachId};
            }else{
                s.params = {tohAccountId:self.fachId};
            }

            doAjaxQuery(s,function(data) {
                if(data.status == 0){
                    self.$transfer.backLogin(self, data);
                }else if(data.status == 1){
                    let obj = data.dataset.rows;
                    if(obj && obj.length>0){
                        obj.forEach(function(item, index){
                                if(self.fachType == 'ZD-ZD2'){//tohCostAmt 分单对账   tohAmt客户对账
                                    item.tohAmtShow = (item.tohCostAmt && parseFloat(item.tohCostAmt)>0) ? "-" + item.tohCostAmt : item.tohCostAmt;
                                }else if(self.subSystem == 'TMS' && self.fachType == 'ZD-KF'){  
                                    item.tohAmtShow = (item.tohAmt && parseFloat(item.tohAmt)>0) ? item.tohAmt : item.tohAmt;
                                }else{
                                    item.tohAmtShow = (item.tohAmt && parseFloat(item.tohAmt)>0) ? "-" + item.tohAmt : item.tohAmt;
                                }
                                
                                if((item.tohId != '*') && (item.tohCode1 != '*')){
                                    item.tohId = item.tohId + '/' +item.tohCode1; 
                                }else if((item.tohId != '*') && (item.tohCode1 = '*')){
                                    item.tohId = item.tohId;
                                }else if((item.tohId = '*') && (item.tohCode1 = !'*')){
                                    item.tohId = item.tohCode1;
                                }else{
                                    item.tohId = '';
                                }
                                // item.tchStatus = parseInt(item.tchStatus);
                                //承运人显示逻辑
                                if(self.subSystem=='KF' && item.tohOrgId!='*' && item.tohOrgId != self.orgId){
                                    //显示 tohCompanyName  tohOrgName
                                    item.tohRecvMan = item.tohCompanyName +'-'+ item.tohOrgName;
                                }else if(self.subSystem=='TMS' && item.tohRecvCompanyId!='*' &&item.tohRecvCompanyId!=self.companyId){
                                    // 显示 tohRecvCompanyName
                                    item.tohRecvMan = item.tohRecvCompanyName;
                                    if(item.tohStartOrgId != '*'){
                                        item.tohRecvMan = item.tohRecvCompanyName +'-'+ item.tohStartOrgName;
                                    } 
                                }
                                 
                                //分单人显示逻辑
                                // if(subSystem==’KF’ ){不显示}
                                if(self.subSystem=='TMS' && item.tohCompanyId!='*' && item.tohCompanyId!=self.companyId){
                                    // 显示 tohCompanyName   tohOrgName
                                    item.tohAllotMan = item.tohCompanyName +'-'+ item.tohOrgName;
                                }
                                
                        });  

                        //判断是替换还是增加
                        if(self.orderCurrPage == 1){
                            self.orderList = obj;
                        }else{
                            self.orderList = self.orderList.concat(obj);
                        }   

                        //判断当前页是否是最后一页  
                        let maxRecord = parseInt(data.dataset.allRowCount);
                        if(self.orderList.length == maxRecord){
                            self.orderLoadMax = true;
                            self.noOrderData = '已全部加载';
                        }
                        self.orderCurrPage++;

                    }else{
                        
                        self.orderLoadMax = true;
                        if(self.orderCurrPage == 1){
                            self.orderList = [];
                            self.noOrderData = "没有相关数据"
                        }else{
                            self.noOrderData = '已全部加载';
                        }
                    }
                    if(self.isLoadId){
                        self.$nextTick(()=>{
                            self.$broadcast('onTopLoaded', self.isLoadId); 
                            self.isLoadId = null;
                        }) 
                    }
                }

                self.$Indicator.close();
                self.orderLoadMore = false;
                self.orderloading = false;
             });
        }

    },
    route: {
        data ({ from, to, next }) {
            let self = this
            //进入页面时token不存在
            if(!localStorage.getItem("token")){
                self.$transfer.backLogin(self, {info:'token没有值'});
                return;
            }
            let token = Tokens.fetch("token");
            self.userId = token["userId"];
            self.sessionId = token["sessionId"];
            self.subSystem = token["subSystem"];
            self.companyId = token["companyId"];
            self.orgId = token["orgId"];
            self.fachId = Tokens.fetch("fachId");
            self.fachType = Tokens.fetch("fachType");
            self.isLoadId = null;
            //需要返回的路径
            if(from.path && ((from.path.indexOf('accountMsgList')!= -1) || (from.path.indexOf('accountIndex')!= -1) || (from.path.indexOf('accountCheckManage')!= -1) || (from.path.indexOf('accountManage')!= -1) || (from.path.indexOf('financeAffirm')!= -1)|| (from.path.indexOf('oughtBill')!= -1))){
                Tokens.save("billOrderKFBackPath",'');
                Tokens.save("billOrderKFBackPath",from.path);
            }
            self.orderList = [];
            self.noOrderData = '';//没有订单数据
            self.orderCurrPage = 1;//订单当前页面
            self.orderLoadMax = false;//订单是否加载到最大条数
            self.orderLoadMore = false;//订单加载指示器
            self.orderloading = false;//订单是否在无限加载
            self.$Indicator.open();
            self.getOrderList();
            next()
        },
        deactivate ({ next }) {
            //Triggers when component destroys
            next()
        },
        canDeactivate({to, from, next}) {
            let self = this;
            next()
        },
        activate({to, from, next}) {
            let self = this
            next()
        } 
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.mint-popup{
    width: 100%;height: 100%; background: #f7f7f7;z-index:2;
}
.order{
    margin-bottom:0.3rem;
    border-top:1px solid #e5e5e5;
    border-bottom:1px solid #e5e5e5;
}
.codeLine{
    overflow:hidden;
    padding:0 0.5rem;
    background: #fff;
    border-bottom:1px solid #e5e5e5;
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
    background: #fff;
    padding:0.5rem;
}
.shoufa li{ 
    height:1.3rem;
    line-height: 1.3rem;
    overflow:hidden;
    white-space:nowrap;
    text-overflow:ellipsis; 
}
</style>
