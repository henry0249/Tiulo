<template>
    <div class="page" id="billPage"> 
        <!-- Header -->
        <mt-header fixed title="订单列表">
            <mt-button icon="back" slot="left" @click="back('/billDetail')"></mt-button>
        </mt-header>

        <div class="container-top" v-infinite-scroll="orderloadMore()" infinite-scroll-immediate-check="false" infinite-scroll-disabled="loading" infinite-scroll-distance="50">
            <mypulldown>
                <div slot= "pullList" :style = "{minHeight:listViewH + 'px'}">
                    <myorderdriver v-if ="subSystem =='SJ'" :options="currDriverList" title="billO" ></myorderdriver> 
                    <myorderlist :options="orderList" title="bill"></myorderlist>
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
            keyId:'',
            fachId:'',//账单Id
            fachType:'',//对账类型
            ttId:'',//车次Id
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
            $(".myorderlist").removeClass("active_border");
            setTimeout(() => {
                self.orderList = [];
                self.noOrderData = '';//没有订单数据
                self.orderCurrPage = 1;//订单当前页面
                self.orderLoadMax = false;//订单是否加载到最大条数;
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
        orderloadMore(){//订单加载更多
            let self = this;
            let isStop = isXLorClick();
            if(isStop){ return;}
            if(!self.orderloading  && !self.orderLoadMax && self.orderCurrPage > 1){
                self.orderloading = true;
                self.orderLoadMore = true;
                setTimeout(function(){
                    self.getOrderList(self.ttId);
                },1000)
                      
            }else{
                return;  
            }
        },
        getOrderList () {//获取任务订单
            let self = this;
            let s = {};
            if(self.fachType=="ZD-SJ" || self.fachType=="ZD-ZD1"){
                s = {   action:"/tmCargoHead/query1",
                        pageIndex:self.orderCurrPage,
                        pageSize:10,
                        params:{"tchTaskId":self.ttId}
                    };
            }else if(self.fachType=="ZD-KF"){
                s = {   action:"/tmOrderHead/query1",
                        pageIndex:self.orderCurrPage,
                        pageSize:10,
                        params:{"tohAccountId":self.fachId}
                    };
            }

            doAjaxQuery(s,function(data) {
                if(data.status == 0){
                    self.$transfer.backLogin(self, data);
                }else if(data.status == 1){
                    let obj = data.dataset.rows;
                    if(obj && obj.length>0){
                        obj.forEach(function(item, index){
                                item.subSystem = self.subSystem;
                                if((item.tohId != '*') && (item.tohCode1 != '*')){
                                    item.tohId = item.tohId + '/' +item.tohCode1; 
                                }else if((item.tohId != '*') && (item.tohCode1 = '*')){
                                    item.tohId = item.tohId;
                                }else if((item.tohId = '*') && (item.tohCode1 = !'*')){
                                    item.tohId = item.tohCode1;
                                }else{
                                    item.tohId = '';
                                }
                                item.tchStatus = parseInt(item.tchStatus);

                                //收发区域
                                item.startArea = item.tohStartDistrictName.split('-')[0];
                                if(item.startArea && item.startArea.length > 4){ 
                                    item.startArea = item.startArea.substring(0, 4) ;
                                }

                                item.endArea = item.tohEndDistrictName.split('-')[0];
                                if(item.endArea && item.endArea.length > 4){ 
                                    item.endArea = item.endArea.substring(0, 4) ;
                                }

                                //订单状态条
                                item.tchStatusTitle = tchStatusTitle[item.tchStage].split('-');

                                if(self.subSystem == "TMS"){
                                    if(self.fachType == "ZD-SJ"){
                                        item.showAmt = (item.tchCarrierAmt&&item.tchCarrierAmt>0) ? "-" + item.tchCarrierAmt.toFixed(2) : item.tchCarrierAmt;
                                    }else if(self.fachType == "ZD-ZD1"){
                                        item.showAmt = (item.tchOrgAmt&&item.tchOrgAmt>0) ? "-" + item.tchOrgAmt.toFixed(2) : item.tchOrgAmt;
                                    }
                                    
                                }else{
                                    item.showAmt = (item.tchCarrierAmt&&item.tchCarrierAmt>0) ? item.tchCarrierAmt.toFixed(2) : item.tchCarrierAmt;
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
            let self = this;
            //进入页面时token不存在
            if(!localStorage.getItem("token")){
                self.$transfer.backLogin(self, {info:'token没有值'});
                return;
            }
            self.ttId = self.$route.params.ttId;
            let token = Tokens.fetch("token");
            self.userId = token["userId"];
            self.sessionId = token["sessionId"];
            self.subSystem = token["subSystem"];
            self.isLoadId = null;

            self.currDriverList = Tokens.fetch("currDriverList");
            self.fachId = Tokens.fetch("fachId");
            self.fachType = Tokens.fetch("fachType");
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
</style>
