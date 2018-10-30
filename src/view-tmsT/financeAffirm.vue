<template>
    <div class="page" id="financeManagePage">   
        <mt-header fixed :title="financeTitle">
            <mt-button icon="back" slot="left"  @click="back('/financeManage')"></mt-button>
            <mt-button slot="right">
                <span slot="icon" class="iconfont" style="font-size: 0.7rem;" @click="billPay()">{{financeSelected == 'wf' ? '确认' : '撤销'}}</span>
            </mt-button>
        </mt-header>
        <div class="container-search" id="financeAffirmMysearchBox" style="height:5.2rem"> 
            <mysearch
              :value.sync="searchVal"
              :placeholder= "placeholder">
            </mysearch>
            <!-- navbar -->
            <div class="ordetType_box">
                <div @click = "isCheckAll()" class="AllBcircle" :class = "checkAll ? 'selAllBcircle' : '' "></div>
                <mt-navbar class="page-part" :selected.sync="financeSelected">
                    <mt-tab-item id="wf" @click="selectChange('wf')">未付</mt-tab-item>
                    <mt-tab-item id="yf" @click="selectChange('yf')">已付</mt-tab-item>
                </mt-navbar>
            </div>
        </div>
        <div class="container-top" id="financeAffirmContainer" v-infinite-scroll="loadMore()" infinite-scroll-immediate-check="false" infinite-scroll-disabled="loading" infinite-scroll-distance="50">
            
            <mypulldown style="margin-top:5.3rem">
                <div slot= "pullList" :style = "{minHeight:listViewH + 'px'}">
                    <div class="order_box">

                        <div v-if="financeType == 'yw-cb' || financeType == 'yw-sr'">
                            <div class="myfinanceaffirm" v-for="option in billList">
                                <div class="codeLine">
                                    <div :id="'finCircle'+$index " class="finCircle" @click.stop="clickOrder($index,option.value)"></div> 
                                    账单号：{{option.fachId}}
                                    <div class="time">{{option.fachCreateDate?option.fachCreateDate.substring(0,10):""}}</div>
                                </div>
                            
                                <ul class="order_content"  @click="goBillDetail(option,$event)">
                                    <li v-if="financeType == 'yw-cb'">对账对象：{{option.payeeCompanyName}}-{{option.fachPayeeName}}</li>
                                    <li  v-if="financeType == 'yw-sr'">对账对象：{{option.payerCompanyName}}-{{option.fachPayerName}}</li> 
                                    <li>对账类型：{{option.fachType == "ZD-SJ"?"站点-司机":option.fachType == "ZD-KF"?"站点-客户":option.fachType == "ZD-ZD1"?"站点-站点":option.fachType == "ZD-ZD2"?"分单":""}}</li> 
                                    <li>车牌号码：{{option.fachTruckCode}}</li> 
                                    <li>账单周期：{{option.fromDate}} ~ {{option.toDate}}</li> 
                                    <li v-if="financeType == 'yw-cb'">账单金额：￥{{option.fachAmt>0 ? '-'+ option.fachAmt.toFixed(2):option.fachAmt}}　已付：￥{{option.fachPayerAmt>0 ? '-'+ option.fachPayerAmt.toFixed(2):option.fachPayerAmt}}</li> 
                                    <li v-if="financeType == 'yw-sr'">账单金额：￥{{option.fachAmt>0 ? option.fachAmt.toFixed(2):option.fachAmt}}　已收：￥{{option.fachPayerAmt>0 ?  option.fachPayerAmt.toFixed(2):option.fachPayerAmt}}</li>  
                                    <li><img @click.stop="lookBill(option.fachId)" src="../img/xiazai.png"></li>      
                                </ul>
                                <div class="payBox" v-if="financeSelected == 'wf'"> 
                                    <span v-if="financeType == 'yw-cb'">本次支付：￥</span> 
                                    <span v-if="financeType == 'yw-sr'">本次收入：￥</span>   
                                    <input @blur="inputBlur($index)" class="payTotal" type="number" v-model="option.timeAmt">  
                                </div>
                                <div class="payBox"  v-if="financeSelected != 'wf'">       
                                    <span v-if="financeType == 'yw-cb'">支付时间：{{option.payTime}}</span> 
                                    <span v-if="financeType == 'yw-sr'">收入时间：{{option.payTime}}</span> 
                                </div>
                            </div>
                            
                        </div>

                        <div v-if="financeType == 'jy-cb' || financeType == 'jy-sr'">
                            <div class="myfinanceaffirm" v-for="option in billList">
                                <div class="codeLine">
                                    <div :id="'finCircle'+$index " class="finCircle" @click.stop="clickOrder($index,option.value)"></div> 
                                    账单号：{{option.fachId}}
                                    <div class="time">申请人：{{option.fachCreateUser}}</div>
                                </div>
                            
                                <ul class="order_content"  @click="goBillDetail(option,$event)">
                                    <li v-if="financeType == 'jy-cb'">收款人：{{option.payeeCompanyName}}-{{option.fachPayeeName}}</li> 
                                    <li v-if="financeType == 'jy-sr'">付款人：{{option.payerCompanyName}}-{{option.fachPayerName}}</li>
                                    <li>费用类型：{{option.fachChargeName}}</li> 
                                    <li>申请时间：{{option.fachCreateDate}}</li> 
                                    <li>支付类型：{{option.fachPayMode}}</li> 
                                    <li v-if="financeType == 'jy-cb'">账单金额：￥{{option.fachAmt>0 ? '-'+ option.fachAmt.toFixed(2):option.fachAmt}}　已付：￥{{option.fachPayerAmt>0 ? '-'+ option.fachPayerAmt.toFixed(2):option.fachPayerAmt}}</li> 
                                    <li v-if="financeType == 'jy-sr'">账单金额：￥{{option.fachAmt>0 ? option.fachAmt.toFixed(2):option.fachAmt}}　已收：￥{{option.fachPayerAmt>0 ? option.fachPayerAmt.toFixed(2):option.fachPayerAmt}}</li>
                                    <li><img @click.stop="lookBill(option.fachId)" src="../img/xiazai.png"></li>      
                                </ul>
                                <div class="payBox" v-if="financeSelected == 'wf'"> 
                                    <span v-if="financeType == 'jy-cb'">本次支付：￥</span> 
                                    <span v-if="financeType == 'jy-sr'">本次收入：￥</span> 
                                    <input @blur="inputBlur($index)" class="payTotal" type="number" v-model="option.timeAmt">  
                                </div>
                                <div class="payBox"  v-if="financeSelected != 'wf'">
                                    <span v-if="financeType == 'jy-cb'">支付时间：{{option.payTime}}</span> 
                                    <span v-if="financeType == 'jy-sr'">收入时间：{{option.payTime}}</span>
                                </div>
                            </div>
                            
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
            subSystem:'',
            companyId:'',
            orgId:'',
            financeType:'',//财务类型
            financeTitle:'',
            placeholder:'',

            financeSelected:'wf',//
            value:[],//选中的订单
            billList:[],//订单列表
            billCurrPage:1,//当前页数
            noBillData:'',//没有订单
            billLoadMax:false,//是否加载到最大条数
            billLoadMore:false,//显示无限加载指示器
            checkAll:false,//是否是全选

            pdfShow:false,//是否显示PDF文件
            pdfUrl:'',

        }
    },
    ready (){
        let self = this;   
        searchBoxIsShow('#financeAffirmContainer','#financeAffirmMysearchBox',self.beforeScrollTop,function(top){
            self.beforeScrollTop = top;  
        })
        //列表框的最小高度
        self.$nextTick(()=>{
            self.listViewH = $("#financeAffirmContainer").height() - $("#financeAffirmMysearchBox").height() -10;
        })

    },
    watch:{
        'value':function(newval){//监听被选中的订单值的变化
            let self = this;
            if(newval.length < self.billList.length || self.billList.length == 0){
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
                self.billCurrPage = 1;
                self.billLoadMax = false;
                self.noBillData = '';
                self.getBillData(); 
            },1000);
        },

    },
    events:{
        refreshList(id,topStatus){//下拉刷新时重置列表数据
            let self = this;
            self.isLoadId = id;
            setTimeout(() => {
                self.value = [];
                self.checkAll = false;
                self.billCurrPage = 1;
                self.billLoadMax = false;
                self.noBillrData = '';
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
        clickOrder(index,currVal){
            let self = this;
            if($("#finCircle" + index).hasClass("sefinCircle")){
              $("#finCircle" + index).removeClass("sefinCircle");
              for(var i=0;i<self.value.length;i++){
                if(self.value[i] == currVal){
                  self.value.splice(i,1)
                }
              }
            }else{
              $("#finCircle" + index).addClass("sefinCircle")
              self.value.push(currVal)
            }

        },
        inputBlur(index){//input失去焦点
            let self = this;
            if(self.financeType == "yw-cb" || self.financeType == "jy-cb"){
                if(self.billList[index].timeAmt > 0 ){  
                    self.billList[index].timeAmt = -self.billList[index].timeAmt;
                    self.billList[index].timeAmt = parseFloat(self.billList[index].timeAmt).toFixed(2);
                }
            }else if(self.financeType == "yw-sr" || self.financeType == "jy-sr"){
                if(self.billList[index].timeAmt < 0 ){
                    self.billList[index].timeAmt = -self.billList[index].timeAmt;
                    self.billList[index].timeAmt = parseFloat(self.billList[index].timeAmt).toFixed(2);
                }
            }

        },
        lookBill(fachId){//查看账单
            let self = this;
            //列表若有点击跳转事件，在下拉时阻止点击跳转
            let isStop = isXLorClick();
            if(isStop){
                $(".myfinanceaffirm").removeClass("active_border");
                return;
            }
            let root = getRootURL();
            self.pdfUrl = root+'/rest/print/businessbill?finId=' + fachId;
            self.pdfShow = true;
        },
        goBillDetail(bill,e){//查看订单详情
            let self = this;
            let isStop = isXLorClick();
            if(isStop){
                $(".myfinanceaffirm").removeClass("active_border");
                return;
            }
            self.$Indicator.open();
            //当前选中元素的变色
            let el = e.target;
            let myfinanceaffirm = $(el).hasClass("myfinanceaffirm") ? $(el) : $(el).parents('.myfinanceaffirm');
            $(".myfinanceaffirm").removeClass("active_border");
            myfinanceaffirm.addClass("active_border");

            Tokens.save("fachId",bill.fachId);
            Tokens.save("fachType",bill.fachType);

            if(self.financeType == 'yw-cb'){
                if(bill.fachType =='ZD-ZD2'){
                    self.go('/billOrderKF', bill.fachId);
                }else{
                    self.go('/TMSBillDetail');
                }
                
            }else if(self.financeType == 'yw-sr'){
                if(bill.fachType =='ZD-ZD1'){
                    self.go('/TMSBillDetail'); 
                }else{
                    self.go('/billOrderKF', bill.fachId);
                }
                
            }else if(self.financeType == 'jy-cb' ||self.financeType == 'jy-sr'){
                //经营成本和收入暂时未做
                return;
            }
            self.$Indicator.close();
        },
        isCheckAll(){//是否全选
            let self = this;
            $(".myfinanceaffirm").removeClass("active_border");
            if(self.checkAll){
                self.value = [];
                $(".finCircle").removeClass("sefinCircle")
            }else{
                if(self.billList.length > 0){
                    self.$transfer.showToast(self, "全选当前加载的" + self.billList.length +"条记录");
                }   
                self.value = [];
                for(var i = 0; i<self.billList.length; i++){
                    self.value.push(self.billList[i].value);
                }
                $(".finCircle").addClass("sefinCircle")
            }                       

        },
        selectChange(type){//切换选择类型
            let self = this;
            if(self.loading || self.financeSelected == type){return}
            self.value = [];
            self.checkAll = false;
            self.financeSelected = type;
            self.billList = [];
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
                    self.checkAll = false;
                    self.getBillData(); 
                },1000)          
            } 
       
        },
        getBillData(){
            let self = this;
            let s = {   action:"/finAccountHead/query2",
                        secString:'yw-cb,yw-sr,jy-cb,jy-sr,report-ys,report-yf,gdzc',
                        pageIndex:self.billCurrPage,
                        pageSize:10
                    };

            if(self.financeType =='yw-cb'){
                s.params = {fachPayerStatus:self.financeSelected =='wf' ? "0" : "1" ,fachTypeHidden:"OP,ZD-KF",fachPayerId:self.orgId,findString:self.searchVal};
            }else if(self.financeType =='yw-sr'){
                s.params = {fachPayeeStatus:self.financeSelected =='wf' ? "0" : "1" ,fachTypeHidden:"OP,ZD-SJ",fachPayeeId:self.orgId,findString:self.searchVal};
            }else if(self.financeType =='jy-cb'){
                s.params = {fachPayerStatus:self.financeSelected =='wf' ? "0" : "1" ,fachType:"OP",fachPayerId:self.orgId,findString:self.searchVal};
            }else if(self.financeType =='jy-sr'){
                s.params = {fachPayeeStatus:self.financeSelected =='wf' ? "0" : "1" ,fachType:"OP",fachPayeeId:self.orgId,findString:self.searchVal};
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
                            item.payTime = item.fachModifyDate ? item.fachModifyDate.substring(0,19) :'';

                            item.value = {
                                fachModifyDate:item.fachModifyDate,
                                fachId:item.fachId,
                                rowId:item.rowId,
                                timeAmt:item.timeAmt
                            }

                        });

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
                self.billCurrPage++;
                self.billLoadMore = false;
                self.loading = false;
                
            });

        },
        billPay(){//确认支付或撤销支付
            let self = this;
            if(self.value.length == 0){
                self.$transfer.showToast(self, "请先选择账单");
                return;
            }
            let qrNum = 0;
            let nQRNum = 0;
            for(var i=self.value.length-1;i>=0;i--){
                if(self.financeSelected == "wf" && (!self.value[i].timeAmt || self.value[i].timeAmt == 0)){
                    self.value.splice(i,1);
                    nQRNum++;
                }else{
                    self.value[i].state = "u";
                    if(self.financeSelected == "wf"){
                        self.value[i].opType = "40QR";
                    }else if(self.financeSelected == "yf"){
                        self.value[i].opType = "40CX";
                    }  
                    qrNum++;
                }
            }
            self.checkAll = false;
            $(".finCircle").removeClass("sefinCircle");

            self.$MessageBox.confirm('您选择的账单中'+'<br/>'+qrNum+'个可操作,继续操作？')
            .then(action => {
                if(qrNum > 0) {
                    let s = {   action:"/finAccountHead/save",
                                secString:'yw-cb,yw-sr,jy-cb,jy-sr,report-ys,report-yf,gdzc'
                            };
                    s.datasets = {dsData:{rows:self.value}} ;

                    if(self.financeType == "yw-cb"){
                        s.params = {fachTypeHidden:"OP,ZD-KF",fachPayerId:self.orgId};
                        if(self.financeSelected == "wf"){
                            s.params.fachPayerStatus = "0";
                        }else if(self.financeSelected == "yf"){
                            s.params.fachPayerStatus = "1";
                        }

                    }else if(self.financeType == "yw-sr"){
                        s.params = {fachTypeHidden:"OP,ZD-KF",fachPayeeId:self.orgId};
                        if(self.financeSelected == "wf"){
                            s.params.fachPayeeStatus = "0";
                        }else if(self.financeSelected == "yf"){
                            s.params.fachPayeeStatus = "1";
                        }

                    }else if(self.financeType == "jy-cb"){
                        s.params = {fachType:"OP",fachPayerId:self.orgId};
                        if(self.financeSelected == "wf"){
                            s.params.fachPayerStatus = "0";
                        }else if(self.financeSelected == "yf"){
                            s.params.fachPayerStatus = "1";
                        }

                    }else if(self.financeType == "jy-sr"){
                        s.params = {fachType:"OP",fachPayeeId:self.orgId};
                        if(self.financeSelected == "wf"){
                            s.params.fachPayeeStatus = "0";
                        }else if(self.financeSelected == "yf"){
                            s.params.fachPayeeStatus = "1";
                        }

                    }

                    doAjaxUpdate(s,function(data) {
                        if(data.status == 0){
                            self.$transfer.backLogin(self, data);
                            self.value = [];
                            $(".finCircle").removeClass("sefinCircle")
                        }else if(data.status == 1){
                            self.$Indicator.close();
                            self.$transfer.showToast(self, "操作成功");
                            setTimeout(() => {
                                self.value = [];
                                self.checkAll = false;
                                self.billCurrPage = 1;
                                self.billLoadMax = false;
                                self.noBillData = '';
                                self.$Indicator.open();
                                self.getBillData();     
                            }, 1000);

                        }
                    })
                }

            }).catch(function(){})       

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
            
            if(from.path && (from.path.indexOf('billOrderKF')!= -1 || from.path.indexOf('TMSBillDetail')!= -1 ) && self.billList.length != 0){
                let preSrollTop = Tokens.fetch("financeAffirmContainer");
                self.$nextTick(()=>{
                    $('#financeAffirmContainer').animate({scrollTop:preSrollTop},0); 
                })
            }else{
                let token = Tokens.fetch("token");
                self.userId = token["userId"];
                self.subSystem = token["subSystem"]; 
                self.orgId = token["orgId"];
                self.companyId = token["companyId"];
                self.financeType = Tokens.fetch("TMSfinType");
                self.financeTitle = self.financeType == 'yw-cb' ? '业务成本支付确认':
                                    self.financeType == 'yw-sr' ? '业务收入确认':
                                    self.financeType == 'jy-cb' ? '经营财务支付确认':
                                    self.financeType == 'jy-sr' ? '经营财务收入确认': '';
                self.placeholder = self.financeType == 'yw-cb' ? '账单号、收款人姓名':
                                    self.financeType == 'yw-sr' ? '账单号、付款人姓名':
                                    self.financeType == 'jy-cb' ? '账单号、收款人姓名':
                                    self.financeType == 'jy-sr' ? '账单号、付款人姓名': '';

                self.checkAll = false;
                self.value = [];
                self.preSrollTop = 0;
                self.searchVal = '';
                self.searchNum = 0;
                self.billList = [];
                self.billCurrPage = 1;
                self.billLoadMax = false;
                self.noBillData = '';
                self.$Indicator.open();
                self.getBillData(); 
                  
                self.$nextTick(()=>{
                    $('#financeAffirmContainer').animate({scrollTop:0},0); 
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
            $('#financeAffirmMysearchBox').slideDown();
            let scrollTop = $("#financeAffirmContainer").scrollTop();
            Tokens.save("financeAffirmContainer",scrollTop);
            next()
        },
        activate({to, from, next}) {
            let self = this;
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
.myfinanceaffirm{
    border-bottom:1px solid #e5e5e5;
    border-top:1px solid #e5e5e5;
    margin-bottom: 0.3rem;
    background: #fff;
}
.myfinanceaffirm .codeLine{
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
.myfinanceaffirm .order_content{
    position: relative;
    padding:0.3rem 3rem 0.3rem 0.5rem;
}
.myfinanceaffirm li:not(:last-child){
    height:1.3rem;
    line-height:1.3rem;
    overflow:hidden;
    white-space:nowrap;
    text-overflow:ellipsis;
}
.myfinanceaffirm li:last-child{
    position: absolute;
    right:0.5rem;
    top:1.6rem;
}
.myfinanceaffirm li:last-child img{
    width:2rem;
    height:2rem;
}
.myfinanceaffirm .payBox{
    padding:0 0.5rem;
    height:2.2rem;
    line-height: 2.2rem;
    border-top:1px solid #e5e5e5;
    text-align: right;
}
.myfinanceaffirm .payBox>div{
    display: inline-block;
}
.myfinanceaffirm .payBox .payTotal{
    width:5rem;
    padding:0.3rem;
    border:1px solid #e5e5e5;
    height:1rem;
    line-height: 1rem;
    border-radius: 0.3rem;
    text-align: right;
}
.finCircle{
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
.sefinCircle{
    background: #FFD91E;
    border: 1px solid #FFD91E;
}
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
