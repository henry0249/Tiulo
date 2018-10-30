<template>
    <div class="page" id="accountCheckManagePage">   
        <div class="mint-header">
            <div class="hleft" @click="back('/TMStaskList')"> 
                <span slot="icon" class="iconfont">&#xe605;</span>
            </div>
            <div class="hcontent mint-header-title">
                <!-- <div class="hcontentTitle" @click="openCheckType()">
                    <div class="stationTitle">
                        {{checkTitle}}   
                    </div>
                    <span slot="icon" class="iconfont hcontentIcon">{{{iconShow}}}</span>  
                </div> -->
                <div class="hcontentTitle" >
                    <div class="stationTitle">
                        业务成本审核   
                    </div> 
                </div>
            </div>
            <div class="hright" @click="checkOrder()">{{checkSelected == 'wsh' ? '通过' : '撤销'}}</div>
        </div>
        <div class="container-search" id="accountCheckMysearchBox" style="height:5.2rem"> 
            <mysearch
              :value.sync="searchVal"
              placeholder= "输入账单号">
            </mysearch>
            <!-- navbar -->
            <div class="ordetType_box">
                <div @click = "isCheckAll()" class="AllBcircle" :class = "checkAll ? 'selAllBcircle' : '' "></div>
                <mt-navbar class="page-part" :selected.sync="checkSelected">
                    <mt-tab-item id="wsh" @click="selectChange('wsh')">未审核</mt-tab-item>
                    <mt-tab-item id="ysh" @click="selectChange('ysh')">已审核</mt-tab-item>
                </mt-navbar>
            </div>
        </div>
        <div class="container-top" style="margin-bottom:3rem;" id="accountCheckContainer" v-infinite-scroll="loadMore()" infinite-scroll-immediate-check="false" infinite-scroll-disabled="loading" infinite-scroll-distance="50">
            
            <mypulldown style="margin-top:5.3rem">
                <div slot= "pullList" :style = "{minHeight:listViewH + 'px'}">
                    <div class="order_box">
                        <mybillcheck :value.sync="value" :options="billList" :title = "checkType"></mybillcheck>
                        <div class="noData">{{noBillData}}</div>                               
                        <!-- 加载指示器 -->
                        <div class="sw-spinner" v-if="billLoadMore">
                            <mt-spinner type="snake" color="#FFD91E"></mt-spinner>  
                        </div>
                        
                    </div>
                </div>
            </mypulldown>

        </div>

        <!-- 交接类型选择框 -->
        <mt-popup class="checkTypeBox" :visible.sync="checkTypeShow" popup-transition="popup-fade" @click="closeCheckTypePop()">
            <div class="container-top" style="margin-bottom:3rem;">
                <ul class="checkType">
                    <li v-for="type in typeData" @click="chooseCheckType(type)">
                        <span slot="icon" class="iconfont" :class="checkType == type.val ? 'currCheckCircle' : ''">&#xe618;</span>{{type.label}}
                    </li>
                </ul>
            </div>
        </mt-popup>

        <!-- PDF文件 -->
        <mt-popup class="pdfPop" position="right" :visible.sync="pdfShow" :modal="false" popup-transition="popup-slide">
            <mt-header fixed title="账单">
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
import  Mybillcheck  from '../components/mybillcheck'
import  Mypulldown from '../components/mypulldown'//引入下拉刷新的组件
export default {
    components: {
        Mysearch,
        Mybillcheck,
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
            checkType:'yw',//交接类型
            checkTitle:'业务成本审核',
            iconShow:'&#xe611;',//上下箭头 &#xe66b;
            checkSelected:'wsh',//
            value:[],//选中的订单
            billList:[],//订单列表
            billCurrPage:1,//当前页数
            noBillData:'',//没有订单
            billLoadMax:false,//是否加载到最大条数
            billLoadMore:false,//显示无限加载指示器
            checkAll:false,//是否是全选

            checkTypeShow:false,
            typeData:[  {label:'业务成本审核',val:'yw'},
                        {label:'经营成本审核',val:'jy'}],

            pdfShow:false,//是否显示PDF文件
            pdfUrl:'',

        }
    },
    ready (){
        let self = this;   
        searchBoxIsShow('#accountCheckContainer','#accountCheckMysearchBox',self.beforeScrollTop,function(top){
            self.beforeScrollTop = top;  
        })
        //列表框的最小高度
        self.$nextTick(()=>{
            self.listViewH = $("#accountCheckContainer").height() - $("#accountCheckMysearchBox").height() -10;
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
    
        },
        chooseValue(arr){
            let self = this;
            self.value = arr;
        },
        goBillDetail(bill){//去账单详情
            let self = this;
            //列表若有点击跳转事件，在下拉时阻止点击跳转
            let isStop = isXLorClick();
            if(isStop){
                $(".mybillcheck").removeClass("active_border");
                return;
            }
            Tokens.save("TMSfinType",'');
            Tokens.save("TMSfinType",'sh-cb');
            Tokens.save("fachId",bill.fachId);
            Tokens.save("fachType",bill.fachType);
            if(self.checkType == 'yw'){
                if(bill.fachType == 'ZD-SJ' || bill.fachType == 'ZD-ZD1'){
                    self.go('/TMSBillDetail');
                }else if(bill.fachType == 'ZD-ZD2'){
                    self.go('/billOrderKF', bill.fachId);
                }
            }else if(self.checkType == 'jy'){

            }
            
        },
        lookBill(fachId){//查看账单
            let self = this;
            //列表若有点击跳转事件，在下拉时阻止点击跳转
            let isStop = isXLorClick();
            if(isStop){
                $(".mybillcheck").removeClass("active_border");
                return;
            }
            let root = getRootURL();
            self.pdfUrl = root+'/rest/print/businessbill?finId=' + fachId;
            self.pdfShow = true;
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
        isCheckAll(){//是否全选
            let self = this;
            $(".mybillcheck").removeClass("active_border");
            if(self.checkAll){
                self.value = [];
                $(".checkCircle").removeClass("secheckCircle")
            }else{
                if(self.billList.length > 0){
                    self.$transfer.showToast(self, "全选当前加载的" + self.billList.length +"条记录");
                }   
                self.value = [];
                for(var i = 0; i<self.billList.length; i++){
                    self.value.push(self.billList[i].value);
                }
                $(".checkCircle").addClass("secheckCircle")
            }                       

        },
        selectChange(type){//切换选择类型
            let self = this;
            if(self.loading){return}
            self.value = [];
            self.checkAll = false;
            self.checkSelected = type;
            self.billList = [];
            self.billCurrPage = 1;
            self.billLoadMax = false;
            self.noBillData = '';
            self.$Indicator.open();
            self.getBillData();
        },
        openCheckType(){//打开选择交接类型
            let self = this;
            if(self.checkTypeShow){
                self.iconShow = '&#xe611;'
            }else{
                self.iconShow = '&#xe66b;'
            }
            self.checkTypeShow = !self.checkTypeShow;
        },
        closeCheckTypePop(){//关闭切换机构框
            let self = this;
            self.checkTypeShow = false;
            self.iconShow = '&#xe611;'
        },
        chooseCheckType (type){//选择审核类型
            let self = this;
            if(self.checkType == type.val){
                return;
            }else{
                self.checkType = type.val;
                self.checkTitle = type.label;
                self.billList = [];
                self.billCurrPage = 1;
                self.billLoadMax = false;
                self.noBillData = '';
                self.noData = '';
                self.$Indicator.open();
                self.getBillData() 
            }
            
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
            let fStatus;
            let s = {   action:"/finAccountHead/query2",
                        secString:'yw,jy',
                        pageIndex:self.billCurrPage,
                        pageSize:10,
                        params:{fachPayerId:self.orgId,findString:self.searchVal}
                    };

            if(self.checkType =='yw'){
                s.params.fachTypeHidden = "OP,ZD-KF";  
                if(self.checkSelected == "wsh"){
                    s.params.fachStatusOr = "01,10,20";
                }else if(self.checkSelected == "ysh"){
                    s.params.fachStatusOr = "30,40";
                }
            }else if(self.checkType =='jy'){
                s.params.fachType = "OP";
                if(self.checkSelected == "wsh"){
                    s.params.fachStatus = "01";
                }else if(self.checkSelected == "ysh"){
                    s.params.fachStatusOr = "30,40";
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
                            item.value = {
                                fachModifyDate:item.fachModifyDate,
                                fachId:item.fachId,
                                rowId:item.rowId,
                                fachAmt:item.fachAmt
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
        checkOrder(){//通过审核或撤销审核
            let self = this;
            if(self.value.length == 0){
                self.$transfer.showToast(self, "请先选择账单");
                return;
            }

            if(self.checkSelected == 'wsh'){//执行通过审核  
                let shNum = 0;
                let nSHNum = 0;
                for(var i=self.value.length-1;i>=0;i--){
                    if(!self.value[i].fachAmt || self.value[i].fachAmt == 0){
                        self.value.splice(i,1);
                        nSHNum++;
                    }else{
                        self.value[i].state = "u";
                        self.value[i].opType = "30TG";
                        shNum++;
                    }
                }
                self.checkAll = false;
                $(".checkCircle").removeClass("secheckCircle");

                if(nSHNum >0){
                   self.$transfer.showToast(self, "您选择的账单中,有"+nSHNum+"个账单金额为0，不能通过审核",'',2000); 
                } 

                if(shNum > 0) {
                    let s = {   action:"/finAccountHead/save",
                                secString:'yw,jy',
                                params:{fachPayerId:self.orgId}
                            };
                    s.datasets = {dsData:{rows:self.value}} ;
                    if(self.checkType =='yw'){
                        s.params.fachTypeHidden = "OP,ZD-KF";
                        s.params.fachStatusOr = "01,10,20";
                    }else if(self.checkType =='jy'){
                        s.params.fachType = "OP";
                        s.params.fachStatus = "01";
                    }
                    doAjaxUpdate(s,function(data) {
                        if(data.status == 0){
                            self.$transfer.backLogin(self, data);
                            self.value = [];
                            $(".checkCircle").removeClass("secheckCircle")
                            
                        }else if(data.status == 1){
                            self.$Indicator.close();
                            self.$transfer.showToast(self, "通过审核");
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
                        
                    }); 
                }    
                
            }else if(self.checkSelected == 'ysh'){//执行撤销审核
                let cxNum = 0;
                let nCXNum = 0;
                for(var i=self.value.length-1;i>=0;i--){
                    if(self.value[i].fachStatus > 30){
                        self.value.splice(i,1);
                        nCXNum++;
                    }else{
                        self.value[i].state = "u";
                        self.value[i].opType = "30CX";
                        cxNum++;
                    }
                }
                self.checkAll = false;
                $(".checkCircle").removeClass("secheckCircle");

                if(nCXNum >0){
                   self.$transfer.showToast(self, "您选择的账单中,有"+nCXNum+"个已结算不能撤销",'',2000); 
                }

                if(cxNum > 0){
                    let s = {   action:"/finAccountHead/save",
                                secString:'yw,jy',
                                params:{fachPayerId:self.orgId,fachStatusOr:'30,40'}
                            };
                    s.datasets = {dsData:{rows:self.value}} ;
                    if(self.checkType =='yw'){
                        s.params.fachTypeHidden = "OP,ZD-KF";
                    }else if(self.checkType =='jy'){
                        s.params.fachType = "OP";
                    }

                    doAjaxUpdate(s,function(data) {
                        if(data.status == 0){
                            self.$transfer.backLogin(self, data);
                            self.value = [];
                            $(".checkCircle").removeClass("secheckCircle")
                        }else if(data.status == 1){
                            self.$Indicator.close();
                            self.$transfer.showToast(self, "撤销审核");
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
                        
                    });
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
            self.orgId = token["orgId"];
            self.companyId = token["companyId"];
            if(from.path && (from.path.indexOf('billOrderKF')!= -1 || from.path.indexOf('TMSBillDetail')!= -1 ) && self.billList.length != 0){
                let preSrollTop = Tokens.fetch("accountCheckContainer");
                self.$nextTick(()=>{
                    $('#accountCheckContainer').animate({scrollTop:preSrollTop},0); 
                })
            }else{
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
                    $('#accountCheckContainer').animate({scrollTop:0},0); 
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
            self.$parent.$data.taskPageDefalut = "/accountCheckManage"
            $('#accountCheckMysearchBox').slideDown();
            let scrollTop = $("#accountCheckContainer").scrollTop();
            Tokens.save("accountCheckContainer",scrollTop);
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

.stationTitle{
    display:inline-block;
    max-width: 80%;
    overflow: hidden;
    text-overflow:ellipsis;
    white-space: nowrap;
}
.checkTypeBox{
    width: 100%;
    height:100%;
    background: transparent;
}
.checkType{
    background: #fff;
}
.checkType li{
    height:2.2rem;
    line-height: 2.2rem;
    border-bottom:1px solid #e5e5e5;
    padding:0 0.5rem;
}
.checkType li .iconfont{
    padding-right:0.5rem;  
    color:#999; 
}
.currCheckCircle{
    color:#FFD91E !important; 
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
