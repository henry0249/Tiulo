<template>
    <div class="page" id="orderManagePage">    
        <mt-header fixed title="订单管理">
            <mt-button slot="left" @click="back('/TMStaskList')">
                <span slot="icon" class="iconfont">&#xe605;</span> 
            </mt-button>
            <mt-button slot="right" @click="allotOrder()">{{orderSelected == 'fd' ?'撤销' : '分单'}}</mt-button>
            <!-- <mt-button slot="right" @click.stop="listShow = !listShow">
                <span slot="icon" class="iconfont">&#xe65c;</span>
            </mt-button> -->
        </mt-header> 
        <div class="container-search" id="orderManageMysearchBox" style="height:5.2rem"> 
            <mysearch
              :value.sync="searchVal"
              placeholder="请输入订单号、始发/目的地">
            </mysearch>
            <!-- navbar -->
            <div class="ordetType_box">
                <div @click = "isCheckAll()" class="AllBcircle" :class = "checkAll ? 'selAllBcircle' : '' "></div>
                <mt-navbar class="page-part" :selected.sync="orderSelected">
                    <mt-tab-item id="mySelf" @click="orderSelectChange('mySelf')">我的</mt-tab-item>
                    <mt-tab-item id="fd" @click="orderSelectChange('fd')">已分</mt-tab-item>
                    <mt-tab-item id="pp" @click="orderSelectChange('pp')">未匹配</mt-tab-item>
                </mt-navbar>
            </div>
        </div>
        <div class="container-top" style="margin-bottom:3rem;" id="orderManageContainer" v-infinite-scroll="loadMore()" infinite-scroll-immediate-check="false" infinite-scroll-disabled="loading" infinite-scroll-distance="50">
            
            <mypulldown style="margin-top:5.3rem">
                <div slot= "pullList" :style = "{minHeight:listViewH + 'px'}">
                    <div class="order_box">
                        <myorderallot :value.sync="value" :options="orderList"></myorderallot>
                        <div class="noData">{{noOrderData}}</div>                               
                        <!-- 加载指示器 -->
                        <div class="sw-spinner" v-if="orderLoadMore">
                            <mt-spinner type="snake" color="#FFD91E"></mt-spinner>
                        </div>
                        
                    </div>
                </div>
            </mypulldown>
            <!-- 右上角选择框 -->
            <div  v-show = "listShow" class="listPOP_box">
                <div class="list_pop">
                    <ul>
                        <li @click="allotOrder()">
                            <span style="padding-right:0.5rem;" slot="icon" class="iconfont">&#xe618;</span>分单
                        </li>
                    </ul>
                </div>
                <div class="jiantou"></div> 
            </div>

        </div> 
    </div>
</template>

<script>
// Ajax request module, return a Promise
import Tokens from '../token'
import  Mysearch  from '../components/mysearch'
import  Myorderallot from '../components/myorderallot'
import  Mypulldown from '../components/mypulldown'//引入下拉刷新的组件
export default {
    components: {
        Mysearch,
        Myorderallot,
        Mypulldown
    },
    data () {
        return {
            isLoadId:null,
            listViewH:0,//下拉刷新框的最小高度
            beforeScrollTop:0,//存储页面当前scrollTop
            searchTimer: null,//是否执行搜索的定时器
            searchNum:'',
            searchVal:'',
            userId:'',
            companyId:'',
            subSystem:'',
            orderSelected:'mySelf',//
            value:[],//选中的订单
            orderList:[],//订单列表
            orderCurrPage:1,//当前页数
            noOrderData:'',//没有订单
            orderLoadMax:false,//是否加载到最大条数
            orderLoadMore:false,//显示无限加载指示器
            checkAll:false,//是否是全选

            listShow:false,

        }
    },
    ready (){
        let self = this;
        
        searchBoxIsShow('#orderManageContainer','#orderManageMysearchBox',self.beforeScrollTop,function(top){
            self.beforeScrollTop = top;  
        })
        //列表框的最小高度
        self.$nextTick(()=>{
            self.listViewH = $("#orderManageContainer").height() - $("#orderManageMysearchBox").height() -10;
        })

        $("#orderManagePage").off().on("click",function(){
            self.listShow = false;
        });

    },
    watch:{
        'value':function(newval){//监听被选中的订单值的变化
            let self = this;
            if(newval.length < self.orderList.length || self.orderList.length == 0){
                self.checkAll = false;
            }else{
                self.checkAll = true;
            }

        },
        'searchVal': function(){//搜索内容改变执行此方法
            let self = this;
            if(self.searchNum == 0){//刚进来重置searchVal不执行搜索
                self.searchNum++;
                return;
            } 
            //设置延迟执行
            clearInterval(self.searchTimer);
            self.searchTimer = setTimeout(function(){
                self.value = [];
                self.checkAll = false;
                self.orderCurrPage = 1;
                self.orderLoadMax = false;
                self.noOrderData = '';
                self.getOrderData(); 
            },1000);
        },
        orderList:{
            handler: function (newVal) {
                        Tokens.save('taskOrderList',newVal)
                     },
            deep: true
        },

    },
    events:{
        refreshList(id,topStatus){//下拉刷新时重置列表数据
            let self = this;
            self.isLoadId = id;
            setTimeout(() => {
                self.value = [];
                self.checkAll = false;
                self.orderCurrPage = 1;
                self.orderLoadMax = false;
                self.noOrderData = '';
                self.getOrderData();     
            }, 1000);
    
        },
        chooseValue(arr){
            let self = this;
            self.value = arr;
        },
        goOrderDetail(order,e){//查看订单详情
            let self = this;
            let isStop = isXLorClick();
            if(isStop){
                $(".order").removeClass("active_border");
                return;
            }
            self.$Indicator.open();
            //当前选中元素的变色
            let el = e.target;
            let oneOrder = $(el).hasClass("myorderallot") ? $(el) : $(el).parents('.myorderallot');
            $(".myorderallot").removeClass("active_border");
            oneOrder.addClass("active_border");
            Tokens.save("orderData",order);
            self.$transfer.go(self, '/taskOrderDetail'); 
            self.$Indicator.close();
        },
        extremelyShow (index,tohExId,e){//显示订单异常发起页面
            let self = this;
            let isStop = isXLorClick();
            if(isStop){
                $(".myorderallot").removeClass("active_border");
                return;
            }
            //当前选中元素的变色
            let el = e.target;
            let oneOrder = $(el).hasClass("myorderallot") ? $(el) : $(el).parents('.myorderallot');
            $(".myorderallot").removeClass("active_border");
            oneOrder.addClass("active_border");

            self.tchOrderId = self.orderList[index].tohId;
            Tokens.save("tchOrderId",self.tchOrderId);
            let exOrderOrgId = [self.orderList[index].tohStartOrgId,
                                self.orderList[index].tohOrgId,
                                self.orderList[index].tohEndOrgId];
            Tokens.save("exOrderOrgId",exOrderOrgId);

            if(tohExId == '*'){//订单还没有异常
                self.go('/taskOrderAddExtremely',self.tchOrderId);
            }else{//有异常 获取异常列表 
                self.go('/taskOrderExtremely',self.tchOrderId);
            }
            
        } ,
        modifiedShow (tchId,tohId,e){//查看修改记录
            let self = this;
            let isStop = isXLorClick();
            if(isStop){
                $(".myorderallot").removeClass("active_border");
                return;
            }
            //当前选中元素的变色
            let el = e.target;
            let oneOrder = $(el).hasClass("myorderallot") ? $(el) : $(el).parents('.myorderallot');
            $(".myorderallot").removeClass("active_border");
            oneOrder.addClass("active_border");

            let keyId = tchId ? tchId : tohId;
            self.go('/taskOrderModified' ,keyId);  
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
        isCheckAll(){//是否全选
            let self = this;
            $(".myorderallot").removeClass("active_border");
            if(self.checkAll){
                self.value = [];
                $(".ALBcircle").removeClass("seALBcircle")
            }else{
                if(self.orderList.length > 0){
                    self.$transfer.showToast(self, "全选当前加载的" + self.orderList.length +"个订单");
                } 
                
                self.value = [];
                for(var i = 0; i<self.orderList.length; i++){
                    self.value.push(self.orderList[i].value)
                }
                $(".ALBcircle").addClass("seALBcircle")
            }                       

        },
        orderSelectChange(type){//切换选择类型
            let self = this;
            self.value = [];
            self.checkAll = false;
            self.orderSelected = type;  
            self.orderList = [];
            self.orderCurrPage = 1;
            self.orderLoadMax = false;
            self.noOrderData = '';
            self.$Indicator.open();
            self.getOrderData();
        },
        loadMore(){//无限加载更多
            let self = this;
            let isStop = isXLorClick();
            if(isStop){ return;}
            if(self.loading || self.orderLoadMax || self.orderCurrPage <= 1){
                return;                               
            }else{
                self.loading = true;
                self.orderLoadMore = true;
                setTimeout(function(){
                    self.checkAll = false;
                    self.getOrderData(); 
                },1000)          
            } 
       
        },
        getOrderData(){
            let self = this;
            let s = {   action:"/tmOrderHead/query1",
                        pageIndex:self.orderCurrPage,
                        pageSize:10,params:{status:self.orderSelected,findString:self.searchVal}
                    }; 
            doAjaxQuery(s,function(data) {
                if(data.status == 0){
                    self.$transfer.backLogin(self, data);
                }else if(data.status == 1){
                    let obj = data.dataset.rows;
                    if(obj && obj.length>0){
                        obj.forEach(function(item, index){
                            if(!item.tohOrderNo ||item.tohOrderNo == '*' || item.tohId == item.tohOrderNo){
                                item.tohOrderShow = item.tohId;
                            }else{
                                item.tohOrderShow = item.tohId+ '/' +item.tohOrderNo;
                            }
                            item.value = item.tohId;

                            //订单tohCompanyId与当前公司做比较，如果不相等并且不是企业版就显示分单人，
                            //tohRecvCompanyId 和当前公司 如果不相等就显示承运人

                            if(self.subSystem=='KF' && item.tohOrgId!='*' && item.tohOrgId != self.orgId){
                                //显示 tohCompanyName  tohOrgName
                                item.tohRecvMan = item.tohCompanyName +'-'+ item.tohOrgName;
                            }else if(self.subSystem=='TMS' && item.tohRecvCompanyId!='*' &&item.tohRecvCompanyId!=self.companyId){
                                // 显示 tohRecvCompanyName
                                item.tohRecvMan = item.tohRecvCompanyName;
                                if(item.tohStartOrgId != '*'){
                                    item.tohRecvMan = item.tohRecvCompanyName +'-'+ item.tohStartOrgName;
                                    if(item.tohRecvCompanyName == item.tohStartOrgName){
                                        item.tohRecvMan = item.tohRecvCompanyName;
                                    }
                                } 
                            }
                            if(self.subSystem !='KF' && item.tohCompanyId != self.companyId){
                                item.allotMan = item.tohCompanyName;
                                if(item.tohOrgName != '*'){
                                    item.allotMan = item.tohCompanyName +'-'+ item.tohOrgName;
                                } 
                            }

                            item.tohTypeG = item.tohType1;

                            //收发详细地址
                            item.StartAddress = item.tohStartProvinceName+item.tohStartDistrictName+item.tohStartAddress;
                            item.EndAddress = item.tohEndProvinceName+item.tohEndDistrictName+item.tohEndAddress;
                            //收发区域
                            item.startArea = item.tohStartDistrictName.split('-')[0];
                            if(item.startArea && item.startArea.length > 3){ item.startArea = item.startArea.substring(0, 3) ;}

                            item.endArea = item.tohEndDistrictName.split('-')[0];
                            if(item.endArea && item.endArea.length > 3){ item.endArea = item.endArea.substring(0, 3) ;}

                            //物料明细 
                            item.tchDetail = JSON.parse(item.tohDetail);
                        //     //订单状态条
                        //     // item.tchStatusTitle = tchStatusTitle[item.tchStage].split('-');

                        });

                        //判断是替换还是增加
                        if(self.orderCurrPage == 1){
                            self.orderList = obj;
                        }else{
                            self.orderList = self.orderList.concat(obj);
                        } 
                        self.orderCurrPage++;  

                        //判断当前页是否是最后一页  
                        let maxRecord = parseInt(data.dataset.allRowCount);
                        if(self.orderList.length == maxRecord){
                            self.orderLoadMax = true;
                            self.noOrderData = '已全部加载';
                        }

                    }else{
                        self.orderLoadMax = true;
                        if(self.orderCurrPage == 1){
                            self.orderList = [];
                            self.noOrderData = "没有相关数据"
                        }else{
                            self.noOrderData = '已全部加载';
                        }
                    }
                    self.$Indicator.close();
                    if(self.isLoadId){
                        self.$nextTick(()=>{
                            self.$broadcast('onTopLoaded', self.isLoadId);
                            self.isLoadId = null;
                        }) 
                    }
                }
                self.orderLoadMore = false;
                self.loading = false;
                
            });

        },
        allotOrder(){//分单或撤销
            let self = this;
            if(self.value.length == 0){
                self.$transfer.showToast(self, "请先选择订单");
                return;
            }else{
                let chooseNum = self.value.length;
                let chooseVal = [];//可以选中的订单
                let errorVal = [];//不可以分单的订单
                let allotVal = [];//可以分单的订单的详情
                $(".ALBcircle").removeClass("seALBcircle")
                self.value.forEach(function(item, index){
                    for(var i=0;i<self.orderList.length;i++){
                        if(item == self.orderList[i].value){
                            let taskId = self.orderList[i].tohTaskId;
                            if (taskId && (taskId.indexOf("ZC")!=-1 || taskId.indexOf("GX")!=-1 || taskId.indexOf("SH")!=-1)) {
                                errorVal.push(self.orderList[i].value)
                            }else{
                                chooseVal.push(self.orderList[i].value)
                                allotVal.push({tohId:self.orderList[i].tohId,tohModifyDate:self.orderList[i].tohModifyDate})
                                $("#alCircle" + i).addClass("seALBcircle")
                            }
                        }
                    }
                })
                self.value = chooseVal;

                if(self.value.length == 0){
                    self.$transfer.showToast(self, "您选择的订单已经调度或不是本站点订单");
                    return;
                }else{
                    if(self.orderSelected == 'fd'){
                        
                        self.$MessageBox.confirm('共选择'+chooseNum+'个订单'+'<br/>'+'其中'+errorVal.length+'个已经调度或不是本站点订单，'+chooseVal.length+'个可撤销'+'<br/>'+'继续操作？')
                        .then(action => {
                            for(var i= 0 ;i<allotVal.length;i++){
                                allotVal[i].state = 'u';
                            }
                            let s = {   action:"/tmOrderHead/save",
                                        commandType:"Update",
                                        params:{opType:"cxfd"}
                                    };
                            s.datasets = {dsData:{rows:allotVal}} ;
                            doAjaxUpdate(s,function(data) {
                                if(data.status == 0){
                                    self.$transfer.backLogin(self, data);
                                    $(".ALBcircle").removeClass("seALBcircle")
                                    self.value = [];

                                }else if(data.status == 1){
                                    self.$transfer.showToast(self, "撤销成功");
                                    self.value = [];
                                    self.checkAll = false;
                                    self.orderList = [];
                                    self.orderCurrPage = 1;
                                    self.orderLoadMax = false;
                                    self.noOrderData = '';
                                    self.$Indicator.open();
                                    self.getOrderData();

                                }
                            })


                        }).catch(function(){})
                    }else{
                        self.$MessageBox.confirm('共选择'+chooseNum+'个订单'+'<br/>'+'其中'+errorVal.length+'个已经调度，'+chooseVal.length+'个可分单'+'<br/>'+'继续操作？')
                        .then(action => {
                            
                            Tokens.save("allotOrder",allotVal);
                            self.go('/allotStation');

                        }).catch(function(){})
                               
                    }
                }

            }

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
            self.userId = token["userId"];
            self.subSystem = token["subSystem"]; 
            self.companyId = token["companyId"];
            if(from.path && (from.path.indexOf('taskOrderAddExtremely')!= -1 || from.path.indexOf('taskOrderExtremely')!= -1) && self.orderList.length != 0){
                // 如果是从订单异常回来重置'异'字的背景色 
                self.orderList = Tokens.fetch('taskOrderList');
                
                let preSrollTop = Tokens.fetch("orderManageContainer");
                self.$nextTick(()=>{
                    $('#orderManageContainer').animate({scrollTop:preSrollTop},0); 
                })
            }else if(from.path && (from.path.indexOf('taskOrderModified')!= -1 || from.path.indexOf('taskOrderDetail')!= -1) && self.orderList.length != 0){
                let preSrollTop = Tokens.fetch("orderManageContainer");
                self.$nextTick(()=>{
                    $('#orderManageContainer').animate({scrollTop:preSrollTop},0); 
                })
            }else{
                self.checkAll = false;
                self.value = [];
                self.preSrollTop = 0;
                self.searchVal = '';
                self.searchNum = 0;
                self.orderSelected = 'mySelf';
                self.orderList = [];
                self.orderCurrPage = 1;
                self.orderLoadMax = false;
                self.noOrderData = '';
                self.$Indicator.open();
                self.getOrderData(); 
                  
                self.$nextTick(()=>{
                    $('#orderManageContainer').animate({scrollTop:0},0); 
                })
            }

             
            next()
        },
        deactivate ({ next }) {
            //Triggers when component destroys
            next()
        },
        canDeactivate({to, from, next}) {
            let self = this;
            self.$parent.$data.showBar = false;
            self.$parent.$data.taskPageDefalut = "/orderManage"
            $('#orderManageMysearchBox').slideDown();
            let scrollTop = $("#orderManageContainer").scrollTop();
            Tokens.save("orderManageContainer",scrollTop);
            next()
        },
        activate({to, from, next}) {
            let self = this;
            let subSystem = localStorage.getItem("subSystem");
            if(subSystem){
                self.$parent.$data.subSystem = subSystem;
            }
            self.$parent.$data.showBar = true;
            self.$parent.$data.MainSelect = "TMStaskList";
            next()
        } 
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.ordetType_box{
    position: relative;
    padding-left:2rem;
    background: #fff;
}
.AllBcircle{
    position: absolute;
    width:1rem;
    height:1rem;
    background: #fff;
    border-radius: 0.5rem;
    border:1px solid #999;
    left:0;
    top:0;
    margin:0.5rem;
}
.selAllBcircle{
    background: #FFD91E;
    border: 1px solid #FFD91E;
}


</style>
