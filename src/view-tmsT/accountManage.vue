<template>
    <div class="page" id="accountManagePage">    
        <mt-header fixed title="对账管理">
            <mt-button slot="left" @click="back('/TMStaskList')">
                <span slot="icon" class="iconfont">&#xe605;</span> 
            </mt-button>

        </mt-header> 
        <div class="container-search" id="accountManageMysearchBox" style="height:5.2rem"> 
            <mysearch
              :value.sync="searchVal"
              :placeholder="placeholder">
            </mysearch>
            <!-- navbar -->
            <div class="ordetType_box">
                <mt-navbar class="page-part" :selected.sync="checkSelected">
                    <mt-tab-item id="ZD-KF" @click="checkSelectChange('ZD-KF')">客户对账</mt-tab-item>
                    <mt-tab-item id="ZD-SJ" @click="checkSelectChange('ZD-SJ')">司机对账</mt-tab-item>
                    <mt-tab-item id="ZD-ZD1" @click="checkSelectChange('ZD-ZD1')">站点对账</mt-tab-item>
                    <mt-tab-item id="ZD-ZD2" @click="checkSelectChange('ZD-ZD2')">分单对账</mt-tab-item>
                </mt-navbar>
            </div>
        </div>
        <div class="container-top" style="margin-bottom:3rem;" id="accountManageContainer" v-infinite-scroll="loadMore()" infinite-scroll-immediate-check="false" infinite-scroll-disabled="loading" infinite-scroll-distance="50">
            
            <mypulldown style="margin-top:5.3rem">
                <div slot= "pullList" :style = "{minHeight:listViewH + 'px'}">
                    <div class="order_box">
                        <div class="myAccount" v-for="bill in billList">
                            <div class="codeLine">
                                单号：{{bill.fachId}}  
                                <span v-if="checkSelected != 'ZD-KF'" style="color:#F00;">{{bill.fachStatusShow}}</span>
                                <div class="time">{{bill.fachCreateDate?bill.fachCreateDate.substring(0,10):""}}</div>
                            </div>
                        
                            <ul class="order_content"  @click="goBillDetail(bill,$event)">
                                <li v-if="checkSelected == 'ZD-KF'">付款方：{{bill.payerCompanyName}}-{{bill.fachPayerName}}</li>
                                <li v-if="checkSelected != 'ZD-KF'">收款方：{{bill.payeeCompanyName}}-{{bill.fachPayeeName}}</li>
                                <li>申请人：{{bill.fachCreateUser}}</li> 
                                <li>账单周期：{{bill.fromDate}} ~ {{bill.toDate}}</li>
                                <li>支付方式：{{bill.fachPayMode}}</li> 
                                <li style="color:#f00" v-if="checkSelected != 'ZD-KF'">账单金额：￥{{bill.fachAmtShow}}　已付：￥{{bill.fachPayerAmtShow}}</li> 
                                <li style="color:#f00" v-if="checkSelected == 'ZD-KF'">账单金额：￥{{bill.fachAmtShow}}　已收：￥{{bill.fachPayerAmtShow}}</li>
                                     
                                <li><img @click.stop="lookBill(bill.fachId)" src="../img/xiazai.png"></li>     
                            </ul>
                        </div>
                        <div class="noData">{{noBillData}}</div>                               
                        <!-- 加载指示器 -->
                        <div class="sw-spinner" v-if="billLoadMore">
                            <mt-spinner type="snake" color="#FFD91E"></mt-spinner>
                        </div>
                        
                    </div>
                </div>
            </mypulldown>
        </div> 

        <!-- PDF文件 -->
        <mt-popup class="pdfPop" position="right" :visible.sync="pdfShow" :modal="false" popup-transition="popup-slide">
            <mt-header fixed title="业务类账单">
                <mt-button icon="back" slot="left" @click="pdfShow = false"></mt-button>            
            </mt-header>
            <div class="container-top" id='pdfBox' style="overflow-x: auto;"> 
                <img style="width:200%" :src="pdfUrl"/>    
            </div>
        </mt-popup> 

    </div>
</template>

<script>
// Ajax request module, return a Promise
import Tokens from '../token'
import  Mysearch  from '../components/mysearch'
import  Mypulldown from '../components/mypulldown'//引入下拉刷新的组件
export default {
    components: {
        Mysearch,
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
            orgId:'',
            subSystem:'',
            checkSelected:'ZD-KF',//
            placeholder:"输入客户名称或时间",
            billList:[],//订单列表
            billCurrPage:1,//当前页数
            noBillData:'',//没有订单
            billLoadMax:false,//是否加载到最大条数
            billLoadMore:false,//显示无限加载指示器

            pdfShow:false,//是否显示PDF文件
            pdfUrl:'',

        }
    },
    ready (){
        let self = this;
        
        searchBoxIsShow('#accountrManageContainer','#accountManageMysearchBox',self.beforeScrollTop,function(top){
            self.beforeScrollTop = top;  
        })
        //列表框的最小高度
        self.$nextTick(()=>{
            self.listViewH = $("#accountrManageContainer").height() - $("#accountManageMysearchBox").height() -10;
        })

    },
    watch:{
        'searchVal': function(){//搜索内容改变执行此方法
            let self = this;
            if(self.searchNum == 0){//刚进来重置searchVal不执行搜索
                self.searchNum++;
                return;
            } 
            //设置延迟执行
            clearInterval(self.searchTimer);
            self.searchTimer = setTimeout(function(){
                self.billCurrPage = 1;
                self.billLoadMax = false;
                self.noBillData = '';
                self.getBillData(); 
            },1000);
        }

    },
    events:{
        refreshList(id,topStatus){//下拉刷新时重置列表数据
            let self = this;
            self.isLoadId = id;
            setTimeout(() => {
                self.billCurrPage = 1;
                self.billLoadMax = false;
                self.noBillData = '';
                self.getBillData();     
            }, 1000);
    
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
        checkSelectChange(type){//切换选择类型
            let self = this;
            self.checkSelected = type;
            self.placeholder = type == "ZD-KF" ? "输入客户名称或时间" :
                               type == "ZD-SJ" ? "输入司机名称或时间" :
                               type == "ZD-ZD1" ? "输入站点名称或时间" :
                               type == "ZD-ZD2" ? "输入分单名称或时间" : "";
            self.billCurrPage = 1;
            self.billLoadMax = false;
            self.noBillData = '';
            self.$Indicator.open();
            self.getBillData();
        },
        loadMore(){//无限加载更多
            let self = this;
            let isStop = isXLorClick();
            if(isStop){ return;}
            if(self.loading || self.billLoadMax || self.billCurrPage <= 1){
                return;                               
            }else{
                self.loading = true;
                self.billLoadMore = true;
                setTimeout(function(){
                    self.getBillData(); 
                },1000)          
            } 
       
        },
        getBillData(){
            let self = this;
            let s = {   action:"/finAccountHead/query",
                        secString:'kh,sj,zd,fd',
                        pageIndex:self.billCurrPage,
                        pageSize:10,
                        params:{fachType:self.checkSelected,fachPayChange:self.orgId,findString:self.searchVal}
                    }; 
        
            doAjaxQuery(s,function(data) {
                if(data.status == 0){
                    self.$transfer.backLogin(self, data);
                }else if(data.status == 1){
                    let obj = data.dataset.rows;
                    if(obj && obj.length>0){
                        obj.forEach(function(item, index){
                            item.fachStatusShow = fachStatusTitle[item.fachStatus];
                            if(self.checkSelected != "ZD-KF"){
                                item.fachAmtShow = item.fachAmt && item.fachAmt>0 ? '-'+ item.fachAmt.toFixed(2): item.fachAmt;
                                item.fachPayerAmtShow = item.fachPayerAmt && item.fachPayerAmt>0 ? '-'+ item.fachPayerAmt.toFixed(2): item.fachPayerAmt;
                            }else{
                                item.fachAmtShow = item.fachAmt && item.fachAmt>0 ? item.fachAmt.toFixed(2): item.fachAmt;
                                item.fachPayerAmtShow = item.fachPayerAmt && item.fachPayerAmt>0 ? item.fachPayerAmt.toFixed(2): item.fachPayerAmt;
                             
                            }
                            item.fromDate = item.fachFromDate ? item.fachFromDate.substring(0,10) :'';
                            item.toDate = item.fachToDate ? item.fachToDate.substring(0,10) :'';


                        });

                        //判断是替换还是增加
                        if(self.billCurrPage == 1){
                            self.billList = obj;
                        }else{
                            self.billList = self.billList.concat(obj);
                        } 
                        self.billCurrPage++;  

                        //判断当前页是否是最后一页  
                        let maxRecord = parseInt(data.dataset.allRowCount);
                        if(self.billList.length == maxRecord){
                            self.billLoadMax = true;
                            self.noBillData = '已全部加载';
                        }

                    }else{
                        self.billLoadMax = true;
                        if(self.billCurrPage == 1){
                            self.billList = [];
                            self.noBillData = "没有相关数据"
                        }else{
                            self.noBillData = '已全部加载';
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
                self.billLoadMore = false;
                self.loading = false;
                
            });

        },
        goBillDetail(bill,e){//查看订单详情
            let self = this;
            let isStop = isXLorClick();
            if(isStop){
                $(".myAccount").removeClass("active_border");
                return;
            }
            self.$Indicator.open();
            //当前选中元素的变色
            let el = e.target;
            let myAccount = $(el).hasClass("myAccount") ? $(el) : $(el).parents('.myAccount');
            $(".myAccount").removeClass("active_border");
            myAccount.addClass("active_border");

            Tokens.save("TMSfinType",'');
            Tokens.save("TMSfinType",'dz-zf');
            Tokens.save("fachId",bill.fachId);
            Tokens.save("fachType",bill.fachType);

            if(self.checkSelected == 'ZD-SJ' || self.checkSelected == 'ZD-ZD1'){
                self.go('/TMSBillDetail');
            }else if(self.checkSelected == 'ZD-ZD2' || self.checkSelected == 'ZD-KF'){
                self.go('/billOrderKF', bill.fachId);
            }
            self.$Indicator.close();
        },
        lookBill(fachId){//查看账单
            let self = this;
            //列表若有点击跳转事件，在下拉时阻止点击跳转
            let isStop = isXLorClick();
            if(isStop){
                $(".myAccount").removeClass("active_border");
                return;
            }
            let root = getRootURL();
            self.pdfUrl = root+'/rest/print/businessbill?finId=' + fachId;
            self.pdfShow = true;
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
            self.orgId = token["orgId"];
            if(from.path && (from.path.indexOf('TMSBillDetail')!= -1 || from.path.indexOf('billOrderKF')!= -1) && self.billList.length != 0){
                let preSrollTop = Tokens.fetch("accountManageContainer");
                self.$nextTick(()=>{
                    $('#accountManageContainer').animate({scrollTop:preSrollTop},0); 
                })
            }else{
                self.preSrollTop = 0;
                self.searchVal = '';
                self.searchNum = 0;
                self.checkSelected = 'ZD-KF';
                self.placeholder = "输入客户名称或时间";
                self.billList = [];
                self.billCurrPage = 1;
                self.billLoadMax = false;
                self.noBillrData = '';
                self.$Indicator.open();
                self.getBillData(); 
                  
                self.$nextTick(()=>{
                    $('#accountManageContainer').animate({scrollTop:0},0); 
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
            self.$parent.$data.taskPageDefalut = "/accountManage"
            $('#accountManageMysearchBox').slideDown();
            let scrollTop = $("#accountManageContainer").scrollTop();
            Tokens.save("accountManageContainer",scrollTop);
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
.pdfPop{
    width: 100%;height: 100%; background: #f7f7f7;z-index:18888;
}

.myAccount{
    border-bottom:1px solid #e5e5e5;
    border-top:1px solid #e5e5e5;
    margin-bottom: 0.3rem;
    background: #fff;
}
.myAccount .codeLine{
    position: relative;
    overflow:hidden;
    white-space:nowrap;
    text-overflow:ellipsis;
    padding:0 4.5rem 0 0.5rem;
    height:2rem;
    line-height: 2rem;
    border-bottom:1px solid #e5e5e5;
}
.myAccount .time{
    position: absolute;
    right:0.5rem;
    top:0;
    max-width: 4rem;
    overflow:hidden;
    white-space:nowrap;
    text-overflow:ellipsis;

}
.myAccount .order_content{
    position: relative;
    padding:0.3rem 3rem 0.3rem 0.5rem;
}
.myAccount li:not(:last-child){
    height:1.3rem;
    line-height:1.3rem;
    overflow:hidden;
    white-space:nowrap;
    text-overflow:ellipsis;
}
.myAccount li:last-child{
    position: absolute;
    right:0.5rem;
    top:1.6rem;
}
.myAccount li:last-child img{
    width:2rem;
    height:2rem;
}

</style>
