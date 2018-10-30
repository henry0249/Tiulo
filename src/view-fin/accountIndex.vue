<template>
    <div class="page" id="billPage"> 
        <mt-header fixed title="账单"></mt-header>
        <!-- 搜索框 -->
        <div class="container-search" id="billMysearchBox"> 
            <mysearch
              :value.sync="searchVal"
              placeholder="账单号/账单对象/时间">
            </mysearch>
        </div>
        <div class="container-top" style="margin-bottom:3rem;" id="billListContainer" v-infinite-scroll="loadMore()" infinite-scroll-immediate-check="false" infinite-scroll-disabled="loading" infinite-scroll-distance="50">
            <mypulldown style="margin-top:2.8rem">
                <div slot= "pullList" :style = "{minHeight:listViewH + 'px'}">
                    <div class="bill" v-for="bill in billList" @click="goBillDetail($event,bill.fachId,bill.fachType)">
                        <div class="billContent">
                            <div class="billTitle">
                                <span style="float:left;">账单号：{{bill.fachId }}</span>
                                <span v-if="subSystem != 'SJ'" style="float:right;color:#F00;">{{bill.fachStatus}}</span>
                            </div>
                            <ul class="billText">
                                <li>对账对象：{{bill.fachMan}}</li>
                                <li>账单周期：{{bill.fachFromDate}} 至 {{bill.fachToDate}}</li>
                                <li>账单金额：
                                    <span class="fachAmtRed">￥{{bill.fachAmtShow}}</span>
                                </li>
                                <li>创建时间：{{bill.fachCreateDate}}</li>
                            </ul>
                        </div>
                    </div>
                    <div class="noData">{{noBillData}}</div>
                    <!-- 加载指示器 -->
                    <div class="sw-spinner" v-if="showLoadMore">
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
import  Mysearch  from '../components/mysearch'
import  Mypulldown from '../components/mypulldown'//引入下拉刷新的组件

export default {
    components:{
        Mysearch,
        Mypulldown
    },
    data () {
        return {
            listViewH:0,//下拉刷新框的最小高度
            isLoadId:null, 
            searchTimer: null,//执行搜索的定时器
            searchVal:'',//搜索的值
            userId:'',
            sessionId:'',
            subSystem:'',
            orgId:'',
            searchNum:0,

            billList:[],//账单列表
            noBillData:'',//没有账单数据
            billCurrPage:1,//账单当前页面
            billLoadMax:false,//账单是否加载到最大条数
            showLoadMore:false,//账单加载指示器
            loading:false,//账单是否在无限加载

            beforeScrollTop:0,//存储页面当前scrollTop

        }
    },
    ready (){
        let self = this;
        //列表框的最小高度
        self.$nextTick(()=>{
            self.listViewH = $("#billListContainer").height() - $("#billMysearchBox").height() -10;
        })
        //四个参数分别是：1.列表内容的容器Id,2.搜索框容器的Id,
        //3.页面滚动前的top值(data里面定义一个变量beforeScrollTop),
        //4.callBack,用来更新data里面的beforeScrollTop
        searchBoxIsShow('#billListContainer','#billMysearchBox',self.beforeScrollTop,function(top){
            self.beforeScrollTop = top;  
        })
    },
    watch:{
        //搜索内容改变执行此方法
        'searchVal': function(){//本方法里用到两个data里的变量：searchNum，searchTimer
            let self = this;
            if(self.searchNum == 0){//刚页面时清空searchVal，不执行搜索
                self.searchNum++;
                return;
            } 
            clearInterval(self.searchTimer);//清除上一次的定时器  防止效果叠加
            self.searchTimer = setTimeout(function(){
                self.billList = [];
                self.billCurrPage = 1;
                self.billLoadMax = false;
                self.noBillData = '';
                self.$Indicator.open();
                self.getbillData();
            },1000);
        },
    },
    events:{
        refreshList(id,topStatus){//下拉刷新时重置列表数据
            let self = this;
            self.isLoadId = id;
            setTimeout(() => {
                // self.billList = [];
                self.billCurrPage = 1;
                self.billLoadMax = false;
                self.noBillData = '';
                self.getbillData();
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
        goBillDetail(e,fachId,fachType){//去账单详情
            let self = this;
            //列表若有点击跳转事件，在下拉时阻止点击跳转
            let isStop = isXLorClick();
            if(isStop){
                $(".bill").removeClass("active_border");
                return;
            }
            //当前选中元素的变色
            let el = e.target;
            let bill = $(el).hasClass("bill") ? $(el) : $(el).parents('.bill');
            $(".bill").removeClass("active_border");
            bill.addClass("active_border");

            Tokens.save("fachId",fachId);
            Tokens.save("fachType",fachType);
            if(self.subSystem == "SJ"){
                self.go('/billDetail');
            }else if(self.subSystem == "KF"){
                // alertShow("显示订单详情")
                self.go('/billOrderKF', fachId); 
            }
            
        },
        loadMore () {//账单无限加载更多
            let self = this;
            let isStop = isXLorClick();
            if(isStop){ return;}
            if(self.loading || self.billLoadMax || self.billList.length == 0 || self.billCurrPage <= 1){
                return;
            }else{
                self.loading = true;
                self.showLoadMore = true;
                setTimeout(function(){
                    self.getbillData(); 
                },1000)

            }
      
        },
        getbillData(){//获取账单列表数据
            let self = this;
            let s = {   action:"/finAccountHead/query",
                        pageIndex:self.billCurrPage,
                        pageSize:10,
                        params:{fachPayChange:self.orgId,findString:self.searchVal}
                    };
            if(self.subSystem == "SJ"){
                s.params.fachPayeeId = self.userId;
            }else if(self.subSystem == "KF"){
                s.params.fachPayerId = self.orgId;
            }
            s.showFiles = "fachId,newDate,fachCreateDate,fachAmt,fachUsedAmt,fachOrgId,payeebdIsCompany,payerbdIsCompany,fachType,fachFromDate,fachTruckCode,fachToDate,fachPayerId,fachPayerName,fachPayeeId,fachStatus,status1,fachPayeeName,payeeCompanyName,payerCompanyName,fachPayMode,fachBank,fachBankUser,fachBankNo,rowId,nameType";
            
            doAjaxQuery(s,function(data) {
                if(data.status == 0){
                    self.$transfer.backLogin(self, data);
                }else if(data.status == 1){
                    let obj = data.dataset.rows;
                    if(obj && obj.length>0){

                        obj.forEach(function(item, index){
                            item.fachFromDate = item.fachFromDate.substring(0,10);
                            if(item.fachToDate != undefined && item.fachToDate != ""){
                                item.fachToDate = item.fachToDate.substring(0,10);
                            }
                            item.fachCreateDate = item.fachCreateDate.substring(0,19);
                            item.fachMan = '';
                            if(item.fachPayerId == self.orgId){
                                item.fachStatus = fachStatusTitle[item.fachStatus];
                                item.fachAmtShow = (item.fachAmt && item.fachAmt >0) ? '-' + item.fachAmt.toFixed(2) : item.fachAmt;
                                item.fachMan = item.payeeCompanyName=='*'?item.fachPayeeName:(item.payeeCompanyName +'-'+ item.fachPayeeName);
                            }else{
                                item.fachMan = item.payerCompanyName=='*'?item.fachPayerName:(item.payerCompanyName +'-'+ item.fachPayerName);
                                item.fachStatus = item.fachPayeeStatus == 1 ?"已收款":
                                                  item.fachPayeeStatus == 0 ?"未收款":'';
                                item.fachAmtShow = (item.fachAmt && item.fachAmt >0) ? item.fachAmt.toFixed(2) : item.fachAmt;
                            }
                        })
                        //判断是替换还是增加
                        if(self.billCurrPage == 1){
                            self.billList = obj;
                        }else{
                            self.billList = self.billList.concat(obj);
                        } 

                        //判断当前页是否是最后一页  
                        let maxRecord = parseInt(data.dataset.allRowCount);
                        if(self.billList.length == maxRecord){
                            self.billLoadMax = true;
                            self.noBillData = '已全部加载';
                        }
                        self.billCurrPage++;

                    }else{
                        self.billLoadMax = true;
                        if(self.billCurrPage == 1){
                            self.billList = [];
                            self.noBillData = "没有相关数据"
                        }else{
                            self.noBillData = '已全部加载';
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
                self.showLoadMore = false;
                self.loading = false;
            })

        },

    },
    route: {
        data ({ from, to, next }) {
            let self = this;
            //进入页面时token不存在
            if(!localStorage.getItem("token")){
                self.$transfer.backLogin(self, {info:'token没有值'});
                return;
            }
            
            let token = Tokens.fetch("token");
            self.userId = token["userId"];
            self.sessionId = token["sessionId"];
            self.subSystem = token["subSystem"];
            
            self.orgId = token["orgId"];
            self.isLoadId = null;

            if(from.path && (from.path.indexOf('billDetail')!= -1 || from.path.indexOf('billOrderKF')!= -1) && self.billList.length != 0){     
                let preSrollTop = Tokens.fetch("billListContainer");
                self.beforeScrollTop = preSrollTop;
                self.$nextTick(()=>{
                    $('#billListContainer').animate({scrollTop:preSrollTop},0); 
                })
            }else{
                self.searchNum = 0;
                self.beforeScrollTop = 0;//初始进入页面时scroll的值为0
                self.billList = [];//账单列表
                self.noBillData = '';//没有账单数据
                self.billCurrPage = 1;//账单当前页面
                self.billLoadMax = false;//账单是否加载到最大条数
                self.showLoadMore = false;//账单加载指示器
                self.loading = false;//账单是否在无限加载
                self.searchVal = '';
                self.$Indicator.open();
                self.getbillData();
                self.$nextTick(()=>{
                    $('#billListContainer').animate({scrollTop:0},0); 
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
            let scrollTop = $("#billListContainer").scrollTop();
            Tokens.save("billListContainer",scrollTop);
            $('#billMysearchBox').slideDown();
            next()
        },
        activate({to, from, next}) {
            let self = this
            let subSystem = localStorage.getItem("subSystem");
            if(subSystem){
                self.$parent.$data.subSystem = subSystem;
            }
            self.$parent.$data.showBar = true;
            self.$parent.$data.MainSelect = "accountIndex";
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
.bill{
    background: #fff;
    padding:0 0.5rem 0.3rem 0.5rem;
    position: relative;
    border-top:1px solid #e5e5e5;
    border-bottom:1px solid #e5e5e5;
    /*font-size: 0.65rem;*/
    margin-bottom:0.3rem;
}
.bill .circle{
    position: absolute;
    display: inline-block;
    width:0.8rem;
    height:0.8rem;
    border:1px solid #353535;
    background: #FFD91E;
    border-radius: 0.4rem;
    top:50%;
    margin-top:-0.4rem;
    left:0.6rem;
}
.bill .billTitle{
    height: 2rem;
    line-height: 2rem;
    border-bottom:1px solid #e5e5e5;
    overflow:hidden;
}
.bill .billText li{
    height: 1.3rem;
    line-height: 1.3rem;
    overflow:hidden;
    white-space:nowrap;
    text-overflow:ellipsis; 
}
.fachAmtRed{
    color:#f00;
}


</style>
