<template>
    <div class="page" id="oughtBillPage"> 
        <mt-header fixed title="应收款汇总">
            <mt-button icon="back" slot="left"  @click="backPage()"></mt-button>
        </mt-header>

        <div class="container-top" id="oughtBillContainer" v-infinite-scroll="loadMore()" infinite-scroll-immediate-check="false" infinite-scroll-disabled="loading" infinite-scroll-distance="50">
            <mypulldown>
                <div slot= "pullList" :style = "{minHeight:listViewH + 'px'}">

                    <div class="myoughtBill" v-for="bill in billList" @click="goBillDetail(bill,$event)">
                        <div class="codeLine">
                            账单号：{{bill.fachId}}
                            <div class="time">{{bill.fachCreateDate?bill.fachCreateDate.substring(0,10):""}}</div>
                        </div>
                    
                        <ul class="order_content">
                            <li>对账对象：{{bill.fachPayeeName}}</li> 
                            <li>对账类型：{{bill.fachType == "ZD-KF" ? "站点-客户" : bill.fachType == "ZD-SJ"?"站点-司机":bill.fachType == "ZD-ZD1"?"站点-站点":bill.fachType == "ZD-ZD2"?"分单":""}}</li> 
                            <li>账单周期：{{bill.fromDate}} ~ {{bill.toDate}}</li> 
                            <li v-if="billType =='report-ys'">账单金额：￥{{bill.fachAmt>0 ? bill.fachAmt.toFixed(2):bill.fachAmt}}　已付：￥{{bill.fachPayerAmt>0 ? bill.fachPayerAmt.toFixed(2):bill.fachPayerAmt}}</li>
                            <li v-if="billType =='report-yf'">账单金额：￥{{bill.fachAmt>0 ? '-' + bill.fachAmt.toFixed(2):bill.fachAmt}}　已付：￥{{bill.fachPayerAmt>0 ? '-' + bill.fachPayerAmt.toFixed(2):bill.fachPayerAmt}}</li>   
                            <li><span slot="icon" class="iconfont">&#xe672;</span></li>      
                        </ul>
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
            searchNum:0,
            orgId:'',
            billType:'',
            billSelected:'',
            billOrgId:'',//对账本身的orgId
            dxOrgId:'',//对账对象的orgId

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
            self.listViewH = $("#oughtBillContainer").height()-10;
        })
    },
    events:{
        refreshList(id,topStatus){//下拉刷新时重置列表数据
            let self = this;
            self.isLoadId = id;
            setTimeout(() => {
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
        backPage(){
            let self = this;
            let backPath = Tokens.fetch("oughtBillBackPath");
            self.back(backPath);
        },
        goBillDetail(bill,e){//去账单详情
            let self = this;
            //列表若有点击跳转事件，在下拉时阻止点击跳转
            let isStop = isXLorClick();
            if(isStop){
                $(".myoughtBill").removeClass("active_border");
                return;
            }
            //当前选中元素的变色
            let el = e.target;
            let myoughtBill = $(el).hasClass("myoughtBill") ? $(el) : $(el).parents('.myoughtBill');
            $(".myoughtBill").removeClass("active_border");
            myoughtBill.addClass("active_border");

            Tokens.save("fachId",bill.fachId);
            Tokens.save("fachType",bill.fachType);

            if((self.billType == 'report-ys' && self.billSelected == "ZD") || self.billType == 'report-yf' && self.billSelected == "SJ"){
                self.go('/TMSBillDetail');
            }else if((self.billType == 'report-ys' && self.billSelected == "KF") || self.billType == 'report-yf' && self.billSelected == "ZD"){
                self.go('/billOrderKF', bill.fachId); 
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
                    };

            if(self.billType == "report-ys"){
                if(self.billSelected == "KF"){
                    s.params = {fachPayeeId:self.billOrgId,fachType:"ZD-KF",fachPayerId:self.dxOrgId};
                }else if(self.billSelected == "ZD"){
                    s.params = {fachPayeeId:self.billOrgId,fachTypeOr:"ZD-ZD1,ZD-ZD2",fachPayerId:self.dxOrgId}
                }   
            }else if(self.billType == "report-yf"){
                if(self.billSelected == "SJ"){
                    s.params = {fachPayerId:self.billOrgId,fachType:"ZD-SJ",fachPayeeId:self.dxOrgId};
                }else if(self.billSelected == "ZD"){
                    s.params = {fachPayerId:self.billOrgId,fachTypeOr:"ZD-ZD1,ZD-ZD2",fachPayeeId:self.dxOrgId}
                }
                
            }
            
            doAjaxQuery(s,function(data) {
                if(data.status == 0){
                    self.$transfer.backLogin(self, data);
                }else if(data.status == 1){
                    let obj = data.dataset.rows;
                    if(obj && obj.length>0){

                        obj.forEach(function(item, index){
                            item.fromDate = item.fachFromDate ? item.fachFromDate.substring(0,10) :'';
                            item.toDate = item.fachToDate ? item.fachToDate.substring(0,10) :'';
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

            if(from.path && (from.path.indexOf('TMSBillDetail')!= -1 || from.path.indexOf('billOrderKF')!= -1) && self.billList.length != 0){     
                let preSrollTop = Tokens.fetch("oughtBillContainer");
                self.beforeScrollTop = preSrollTop;
                self.$nextTick(()=>{
                    $('#oughtBillContainer').animate({scrollTop:preSrollTop},0); 
                })
            }else{
                self.billType = Tokens.fetch("TMSfinType");
                self.billSelected = Tokens.fetch("oughtSelected");
                self.billOrgId = Tokens.fetch("ownOrgId");
                self.dxOrgId = Tokens.fetch("dxOrgId");
                self.searchNum = 0;
                self.beforeScrollTop = 0;//初始进入页面时scroll的值为0
                self.dXList = [];//账单列表
                self.noBillData = '';//没有账单数据
                self.billCurrPage = 1;//账单当前页面
                self.billLoadMax = false;//账单是否加载到最大条数
                self.showLoadMore = false;//账单加载指示器
                self.loading = false;//账单是否在无限加载
                self.searchVal = '';
                self.$Indicator.open();
                self.getbillData();
                self.$nextTick(()=>{
                    $('#oughtBillContainer').animate({scrollTop:0},0); 
                })
            }
            //需要返回的路径
            if(from.path && (from.path.indexOf('oughtAffirm')!= -1)){
                Tokens.save("oughtBillBackPath",'');
                Tokens.save("oughtBillBackPath",from.path);
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
            let scrollTop = $("#oughtBillContainer").scrollTop();
            Tokens.save("oughtBillContainer",scrollTop);
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
.myoughtBill{
    border-bottom:1px solid #e5e5e5;
    border-top:1px solid #e5e5e5;
    margin-bottom: 0.3rem;
    background: #fff;
}
.myoughtBill .codeLine{
    position: relative;
    overflow:hidden;
    white-space:nowrap;
    text-overflow:ellipsis;
    padding:0 6rem 0 0.5rem;
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
.myoughtBill .order_content{
    position: relative;
    padding:0.3rem 3rem 0.3rem 0.5rem;
}
.myoughtBill li:not(:last-child){
    height:1.3rem;
    line-height:1.3rem;
    overflow:hidden;
    white-space:nowrap;
    text-overflow:ellipsis;
}
.myoughtBill li:last-child{
    position: absolute;
    width:2rem;
    height:2rem;
    line-height: 2rem;
    text-align: center;
    right:0.5rem;
    top:1.55rem;
    border:2px solid #F00;
    border-radius: 1.5rem
}
.myoughtBill li:last-child .iconfont{
    font-size: 1.4rem;
    color:#F00;
}


</style>
