<template>
    <div class="page" id="oughtAffirmPage">    
        <mt-header fixed :title="oughtTitle">
            <mt-button icon="back" slot="left"  @click="back('/financeManage')"></mt-button>
        </mt-header> 
        <div class="container-search" id="oughtAffirmMysearchBox" style="height:7.5rem"> 
            <mysearch
              :value.sync="searchVal"
              :placeholder="placeholder">
            </mysearch>
            <div class="orgBox" @click="orgShow = true">
                <img :src="companyLogo">
                {{companyName}}-{{orgName}}
            </div>
            <!-- navbar -->
            <div class="ordetType_box">
                <mt-navbar class="page-part" :selected.sync="oughtSelected">
                    <mt-tab-item v-if="oughtType == 'report-ys'" id="KF" @click="oughtChange('KF')">客户</mt-tab-item>
                    <mt-tab-item v-if="oughtType == 'report-yf'" id="SJ" @click="oughtChange('SJ')">司机</mt-tab-item>
                    <mt-tab-item id="ZD" @click="oughtChange('ZD')">站点</mt-tab-item>
                </mt-navbar>
            </div>
        </div>
        <div class="container-top" id="oughtAffirmContainer" v-infinite-scroll="loadMore()" infinite-scroll-immediate-check="false" infinite-scroll-disabled="loading" infinite-scroll-distance="50">
            
            <mypulldown style="margin-top:7.6rem">
                <div slot= "pullList" :style = "{minHeight:listViewH + 'px'}">
                    <div class="order_box">
                        <div v-if="oughtType == 'report-ys'">
                            <ul v-for="bill in billList" class="bill_content"  @click="goBillList(bill,$event)">
                                <li>付款方：{{bill.fachPayerName}}</li>
                                <li>应收金额：￥{{bill.fachAmt>0 ? bill.fachAmt.toFixed(2):bill.fachAmt}}</li> 
                                <li>已收金额：￥{{bill.fachUsedAmt>0 ? bill.fachUsedAmt.toFixed(2):bill.fachUsedAmt}}　未收金额：￥{{bill.noAmt>0 ? bill.noAmt.toFixed(2):bill.noAmt}}</li>   
                            </ul>
                        </div>
                        <div v-if="oughtType == 'report-yf'">
                            <ul v-for="bill in billList" class="bill_content"  @click="goBillList(bill,$event)">
                                <li>收款方：{{bill.fachPayeeName}}</li> 
                                <li>应付金额：￥{{bill.fachAmt>0 ? '-' + bill.fachAmt.toFixed(2):bill.fachAmt}}</li> 
                                <li>已付金额：￥{{bill.fachUsedAmt>0 ? '-' + bill.fachUsedAmt.toFixed(2):bill.fachUsedAmt}}　未付金额：￥{{bill.noAmt>0 ? '-' + bill.noAmt.toFixed(2):bill.noAmt}}</li>     
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

        <!-- 机构选择框 -->
        <mt-popup class="orgList" :visible.sync="orgShow" popup-transition="popup-fade">
            <mt-header fixed title="选择机构">
                <mt-button icon="back" slot="left"  @click="orgShow = false"></mt-button>
            </mt-header>
            <div class="container-top">
                <ul class="organization">
                    <li class="orgOne" v-for="station in stationList" @click.stop ='changeStation(station.MRorg)'>
                        <div class="stationDiv">
                            <img :src="station.orgs[0].suoCompanyLogo">
                            <span class="stationLine">{{station.companyName}}</span> 
                        </div>
                        <ul v-if="subSystem == 'TMS'" style="padding-left:2rem;">
                            <li v-for="org in station.orgs">
                                <div v-if="subSystem == 'TMS' && (org.suoOrgId != org.suoCompanyId + 'MR')" @click.stop = "changeStation(org)">
                                   <span slot="icon" class="iconfont" style="color:#FFD91E;">&#xe618;</span>
                                    {{org.suoOrgName}} 
                                </div>  
                            </li>
                        </ul>
                    </li>
                    <li v-if="noOrgData" class="orgOne" style="text-align:center;padding:0.5rem">没有可选择机构</li>
                </ul>
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
            oughtTitle:'应收款汇总',
            placeholder:"请输入付款方",
            oughtType:'',
            companyLogo:'',
            companyName:'',
            orgName:'',
            orgId:'',
            orgShow:false,
            dXorgId:'',

            oughtSelected:'',
            billList:[],//订单列表
            billCurrPage:1,//当前页数
            noBillData:'',//没有订单
            billLoadMax:false,//是否加载到最大条数
            billLoadMore:false,//显示无限加载指示器

            stationList:[],

        }
    },
    ready (){
        let self = this;
        
        searchBoxIsShow('#oughtAffirmContainer','#oughtAffirmMysearchBox',self.beforeScrollTop,function(top){
            self.beforeScrollTop = top;  
        })
        //列表框的最小高度
        self.$nextTick(()=>{
            self.listViewH = $("#oughtAffirmContainer").height() - $("#oughtAffirmMysearchBox").height() -10;
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
        changeOrg(){//打开切换Org的pop
            let self = this;
            self.go('/allotStation');//选择机构
        },
        oughtChange(type){//切换选择类型
            let self = this;
            self.oughtSelected = type;  
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
        getStationData(){//获取所有机构
            let self = this;
            let s = {   action:"/userOrg/query",
                        params:{suoSubSystem:self.subSystem,suoUserId:self.userId}
                    };
            self.noOrgData = false;
            doAjaxQuery(s,function(data) {
                if(data.status == 0){
                    self.$transfer.backLogin(self, data);
                }else if(data.status == 1){
                    let obj = data.dataset.rows; 
                    if(obj && obj.length>0){

                        //将站点列表转为树形结构
                        let orgArr = [];
                        obj.forEach(function(item, index){
                            item.suoCompanyLogo = getImgURL() +'company/' +item.suoCompanyLogo;
                            var ImgObj = new Image(); 
                            ImgObj.src = item.suoCompanyLogo; 
                            ImgObj.onerror = function(){
                                item.suoCompanyLogo = getImgURL() + 'company/default.png';
                            }

                            let keyVal = JSON.stringify({'companyId':item.suoCompanyId});
                            let keyVal2 = keyVal.substring(1,keyVal.length-1);
                            if(JSON.stringify(orgArr).indexOf(keyVal2) == -1){
                                let newCompany = {  'companyId':item.suoCompanyId,
                                                    'companyName':item.suoCompanyName,
                                                    // 'companyLogo':item.suoCompanyLogo,
                                                    'orgs':[item]};
                                //存储默认机构
                                if(self.subSystem == 'TMS' && (item.suoOrgId == item.suoCompanyId + 'MR')){
                                    newCompany.MRorg = item;
                                }
                                orgArr.push(newCompany);
                            }else{                   
                                for(var j=0;j<orgArr.length;j++){
                                    if(orgArr[j].companyId == item.suoCompanyId){
                                        orgArr[j].orgs.push(item)
                                        //存储默认机构
                                        if(self.subSystem == 'TMS' && (item.suoOrgId == item.suoCompanyId + 'MR')){
                                            orgArr[j].MRorg = item;
                                        }
                                    }
                                }
                            } 
                            
                        })
                        self.stationList = orgArr;   
                    }
                    
                }
            });
        },
        changeStation(station){//切换机构
            let self = this;
            if(station){
                self.orgId = station.suoOrgId;
                self.companyName = station.suoCompanyName;
                self.orgName = station.suoOrgName;
                self.companyLogo = station.suoCompanyLogo;
                self.billCurrPage = 1;
                self.billLoadMax = false;
                self.noBillData = '';
                self.$Indicator.open();
                self.getBillData(); 
            }
            self.orgShow = false;

        },
        getBillData(){
            let self = this;
            let s={};
            if(self.oughtType =='report-ys'){
                s =  {  action:"/finAccountHead/query4",
                        secString:'yw-cb,yw-sr,jy-cb,jy-sr,report-ys,report-yf,gdzc',
                        pageIndex:self.billCurrPage,
                        pageSize:10,
                        params:{fachPayeeId:self.orgId,findString:self.searchVal}
                    };
                if(self.oughtSelected == "KF"){
                    s.params.fachType = "ZD-KF";
                }else if(self.oughtSelected == "ZD"){
                    s.params.fachTypeOr = "ZD-ZD1,ZD-ZD2";
                }
            }else if(self.oughtType =='report-yf'){
                s = {   action:"/finAccountHead/query3",
                        secString:'yw-cb,yw-sr,jy-cb,jy-sr,report-ys,report-yf,gdzc',
                        pageIndex:self.billCurrPage,
                        pageSize:10,
                        params:{fachPayerId:self.orgId,findString:self.searchVal}
                    };
                if(self.oughtSelected == "SJ"){
                    s.params.fachType = "ZD-SJ";
                }else if(self.oughtSelected == "ZD"){
                    s.params.fachTypeOr = "ZD-ZD1,ZD-ZD2";
                }
            }
            doAjaxQuery(s,function(data) {
                if(data.status == 0){
                    self.$transfer.backLogin(self, data);
                }else if(data.status == 1){            
                    let obj = data.dataset.rows;
                    if(obj && obj.length>0){

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
        goBillList(bill,e){//查看订单详情
            let self = this;
            let isStop = isXLorClick();
            if(isStop){
                $(".bill_content").removeClass("active_border");
                return;
            }
            self.$Indicator.open();
            //当前选中元素的变色
            let el = e.target;
            let bill_content = $(el).hasClass("bill_content") ? $(el) : $(el).parents('.bill_content');
            $(".bill_content").removeClass("active_border");
            bill_content.addClass("active_border");
            let dxOrgId = self.oughtType == "report-ys" ? bill.fachPayerId :
                          self.oughtType == "report-yf" ? bill.fachPayeeId : ''; 
            Tokens.save("oughtSelected",self.oughtSelected);
            Tokens.save("ownOrgId",self.orgId);
            Tokens.save("dxOrgId",dxOrgId);
            self.go("/oughtBill")
            self.$Indicator.close();
        },


    },
    route: {
        data ({from, to, next }) {
            let self = this ;
            //进入页面时token不存在
            if(!localStorage.getItem("token")){
                self.$transfer.backLogin(self, {info:'token没有值'});
                return;
            }
            
            if(from.path && from.path.indexOf('oughtBill')!= -1 && self.billList.length != 0){
                let preSrollTop = Tokens.fetch("oughtAffirmContainer");
                self.$nextTick(()=>{
                    $('#oughtAffirmContainer').animate({scrollTop:preSrollTop},0); 
                })
            }else{
                let token = Tokens.fetch("token");
                self.userId = token["userId"];
                self.subSystem = token["subSystem"]; 
                self.oughtType = Tokens.fetch("TMSfinType");
                self.oughtTitle = self.oughtType== "report-ys" ? "应收款汇总" :
                                  self.oughtType== "report-yf" ? "应付款汇总" : "";
                self.oughtSelected = self.oughtType== "report-ys" ? "KF" :
                                     self.oughtType== "report-yf" ? "SJ" : "";
                self.placeholder = self.oughtType== "report-ys" ? "请输入付款方" :
                                   self.oughtType== "report-yf" ? "请输入收款方" : "";
                self.companyLogo = token["companyLogo"];
                self.companyName = token["companyName"];
                self.orgName = token["orgName"];
                self.orgId = token["orgId"];
                self.preSrollTop = 0;
                self.searchVal = '';
                self.searchNum = 0;
                self.billList = [];
                self.billCurrPage = 1;
                self.billLoadMax = false;
                self.noBillData = '';
                self.$Indicator.open();
                self.getBillData(); 
                self.getStationData();
                  
                self.$nextTick(()=>{
                    $('#oughtAffirmContainer').animate({scrollTop:0},0); 
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
            $('#oughtAffirmMysearchBox').slideDown();
            let scrollTop = $("#oughtAffirmContainer").scrollTop();
            Tokens.save("oughtAffirmContainer",scrollTop);
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
.orgList{
    width: 100%;
    height:100%;
    background: #fff;
}
.stationDiv{
    position: relative;
    padding-left:2.5rem;
    height:2rem;
    line-height: 2rem;
}
.organization{
    width:100%;
    min-height: 100%;
    background: #FFF;
}
.orgOne{
    padding:0.5rem;
    border-bottom:1px solid #e5e5e5;
}
.orgOne img{
    position: absolute;
    top:0;
    left:0;
    width:2rem;
    height:2rem;
    border-radius: 1rem;
    border:1px solid #e5e5e5;
}

.orgBox{
    height:2rem;
    line-height: 2rem;
    padding:0 0.5rem 0 2.6rem;
    background: #fff;
    margin-bottom:0.3rem;
    position: relative;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap; 
}
.orgBox img{
    position: absolute;
    top:0.2rem;
    left:0.2rem;
    width:1.6rem;
    height:1.6rem;
}
.bill_content{
    background: #fff;
    padding:0.2rem 0.5rem;
    margin-bottom:0.3rem;
}
.bill_content li{
    height:1.3rem;
    line-height: 1.3rem;
}

</style>
