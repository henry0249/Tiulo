<template>
    <div class="page" id="tracePage">
        <!-- Header -->
        <div class="mint-header">
            <div class="hleft">
                <img :src="orgLogo">
            </div>
            <div class="hcontent mint-header-title">
                <div class="hcontentTitle" @click="chooseStation()">
                    <div class="stationTitle">
                        {{orgTitle}}   
                    </div>
                    <span slot="icon" class="iconfont hcontentIcon">{{{iconShow}}}</span>  
                </div>
            </div>
            <div class="hright">
                <span v-if="subSystem == 'KF'" slot="icon" class="iconfont" @click="getQRCode()">&#xe606;</span>
            </div>
        </div>
        <div class="container-search" id="traceMysearchBox" style="height:5.2rem"> 
            <mysearch
              :value.sync="searchVal"
              :placeholder="searchPlaceholder">
            </mysearch>
            <!-- navbar -->
            <div class="ordetType_box" style="position:relative;">
                <div class="orderType">
                    <mt-navbar v-if="by=='order'" class="page-part" :selected.sync="orderSelected">
                        <mt-tab-item id="ex" @click="orderSelectChange('ex')">异常</mt-tab-item>
                        <mt-tab-item id="unstart" @click="orderSelectChange('unstart')">未发货</mt-tab-item>
                        <mt-tab-item id="ontheway" @click="orderSelectChange('ontheway')">在途</mt-tab-item>
                        <mt-tab-item id="pickup" @click="orderSelectChange('pickup')">签收</mt-tab-item>
                        <mt-tab-item id="main_rounte" @click="orderSelectChange('main_rounte')">回单</mt-tab-item>
                    </mt-navbar>
                    <mt-navbar v-if="by=='truck'" class="page-part" :selected.sync="truckSelected">
                        <mt-tab-item id="TH" @click="truckSelectChange('TH')">提货</mt-tab-item>
                        <mt-tab-item id="GX" @click="truckSelectChange('GX')">干线</mt-tab-item>
                        <mt-tab-item id="SH" @click="truckSelectChange('SH')">送货</mt-tab-item>
                        <mt-tab-item id="ZC" @click="truckSelectChange('ZC')">整车</mt-tab-item>
                    </mt-navbar>
                </div>
                <span v-if="subSystem == 'KF'" @click="typeChoose()" slot="icon" class="iconfont">{{{typeIcon}}}</span>
                <span v-if="subSystem == 'TMS'" @click="byChoose()" slot="icon" class="iconfont">{{{byIcon}}}</span>
            </div>
        </div>
        <div class="container-top" style="margin-bottom:3rem;" id="traceListContainer" v-infinite-scroll="loadMore()" infinite-scroll-immediate-check="false" infinite-scroll-disabled="loading" infinite-scroll-distance="50">
            
            <mypulldown style="margin-top:5.3rem">
                <div slot= "pullList" :style = "{minHeight:listViewH + 'px'}">
                    <div class="order_box" v-if="by=='order'">
                        
                        <myorderline :options="orderList"></myorderline>
                        <div class="noData">{{noOrderData}}</div>                               
                        <!-- 加载指示器 -->
                        <div class="sw-spinner" v-if="orderLoadMore">
                            <mt-spinner type="snake" color="#FFD91E"></mt-spinner>
                        </div>
                        
                    </div>

                    <div class="truckList"  v-if="by=='truck'">
                        <myorderdriver :options="truckList" title="trace" ></myorderdriver>
                        <div class="noData">{{noTruckData}}</div>
                        <!-- 加载指示器 -->
                        <div class="sw-spinner" v-if="truckLoadMore">
                            <mt-spinner type="snake" color="#FFD91E"></mt-spinner>
                        </div>
                    </div>
                </div>
            </mypulldown>

        </div>
        <!-- 机构选择框 -->
        <mt-popup class="stationBox" :visible.sync="stationShow" popup-transition="popup-fade" @click="closeStationPop()">
            <div class="container-top" style="margin-bottom:3rem;">
                <ul class="organization">
                    <li class="orgOne" v-for="station in stationList" @click.stop ='goChangeStation(station)'>
                        <div class="stationDiv">
                            <img :src="station.orgs[0].suoCompanyLogo">
                            <span class="stationLine">{{station.companyName}}</span> 
                        </div>
                        <ul v-if="subSystem == 'TMS'" style="padding-left:2rem;">
                            <li v-for="org in station.orgs">
                                <div v-if="subSystem == 'TMS' && (org.suoOrgId != org.suoCompanyId + 'MR')" @click.stop = "changeStation(org,$event)">
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
import  Myorderdriver from '../components/myorderdriver'
import  Myorderline from '../components/myorderline'
import  Mypulldown from '../components/mypulldown'//引入下拉刷新的组件
export default {
    components: {
        Mysearch,
        Myorderdriver,
        Myorderline,
        Mypulldown
    },
    data () {
        return {
            isLoadId:null,
            listViewH:0,//下拉刷新框的最小高度
            beforeScrollTop:0,//存储页面当前scrollTop
            searchTimer: null,//是否执行搜索的定时器
            token:'',
            userId:'',//driverId 默认为userId 
            sessionId:'',
            subSystem:'',
            subSystem2:'',
            companyId:'',
            orgId:'',
            searchVal:'',//搜索查询值
            searchNum:0,
            iconShow:'&#xe611;',//上下箭头 &#xe66b;
            stationShow:false,//站点选择框
            typeIcon:'&#xe648;',//搜索类型的图标 &#xe612;
            typeVal:1,//收发货人切换  1收货 2发货
            orderSelected:'all',//订单navbar选择的类型
            stationList:[],//机构列表
            noOrgData:false,//没有机构
            orgTitle:'',//机构名称
            orgLogo:'',//机构Logo
            loading:false,//是否正在加载
            searchPlaceholder:'请输入订单号、始发/目的地',
            xqTaskList:[],


            orderList:[],//订单列表
            orderCurrPage:1,//当前页数
            noOrderData:'',//没有订单
            orderLoadMax:false,//是否加载到最大条数
            orderLoadMore:false,//显示无限加载指示器
            tchOrderId:'',//当前点击的异常的订单
            // fromQRScan:'',

            byIcon:'&#xe60a;',//按订单还是按车次查询的图标 &#xe612;
            by:'order',//按订单还是按车次查询 truck;
            truckSelected:'all',//车次navbar选择的类型
            truckList:[],
            truckCurrPage:1,
            turckLoadMax:false,
            noTruckData:'',
            truckLoadMore:false,

             browserType:'',

        }
    },
    ready (){
        let self = this;
        
        searchBoxIsShow('#traceListContainer','#traceMysearchBox',self.beforeScrollTop,function(top){
            self.beforeScrollTop = top;  
        })

        //列表框的最小高度
        self.$nextTick(()=>{
            $('#traceListContainer').animate({scrollTop:0},0); 
            self.listViewH = $("#traceListContainer").height() - $("#traceMysearchBox").height() -10;
        })

    },
    events:{
        refreshList(id,topStatus){//下拉刷新时重置列表数据
            let self = this;
            self.isLoadId = id;
            setTimeout(() => {
                if(self.by == 'order'){
                    self.orderList = [];
                    self.orderCurrPage = 1;
                    self.orderLoadMax = false;
                    self.noOrderData = '';
                    self.getOrderData();

                }else if(self.by == 'truck'){
                    self.truckList = [];
                    self.truckCurrPage = 1;
                    self.turckLoadMax = false;
                    self.noTruckData = '';
                    self.getTruckData();

                }
                    
            }, 1000);
    
        },
        taskDetailShow(index,value,ttId,ttDriverId){//显示任务详情页面
            let self = this;
            let isStop = isXLorClick();
            if(isStop){
                $(".myorderdriver").removeClass("active_border");
                return;
            }
            //进入任务详情页面后，重置司机的信息  
            Tokens.save("taskDetailId",'');
            Tokens.save("taskDetailId",ttId);
            Tokens.save("tdDriverId",'');
            Tokens.save("tdDriverId",ttDriverId);
            self.go('/taskDetail'); 
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
            let oneOrder = $(el).hasClass("order") ? $(el) : $(el).parents('.order');
            $(".order").removeClass("active_border");
            oneOrder.addClass("active_border");
            Tokens.save("orderData",order);
            self.go('/taskOrderDetail'); 
            self.$Indicator.close();
        },
        extremelyShow (index,tohExId,e){//显示订单异常发起页面
            let self = this;
            let isStop = isXLorClick();
            if(isStop){
                $(".order").removeClass("active_border");
                return;
            }
            //当前选中元素的变色
            let el = e.target;
            let oneOrder = $(el).hasClass("order") ? $(el) : $(el).parents('.order');
            $(".order").removeClass("active_border");
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
                $(".order").removeClass("active_border");
                return;
            }
            //当前选中元素的变色
            let el = e.target;
            let oneOrder = $(el).hasClass("order") ? $(el) : $(el).parents('.order');
            $(".order").removeClass("active_border");
            oneOrder.addClass("active_border");

            let keyId = tchId ? tchId : tohId;
            self.go('/taskOrderModified' ,keyId); 
        },
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
                if(self.by == 'order'){
                    self.chageGetOrder();
                }else if(self.by == 'truck'){
                    self.chageGetTruck();
                } 
            },1000);
        },
        'stationShow':function(newval){
            if(!newval){
                $('#traceMysearchBox').slideDown();
            }
        },
        'orderList':{
            handler: function (newVal) {
                        Tokens.save('taskOrderList',newVal)
                     },
            deep: true
        }
    },
    methods: {
        go(link, param) {
            let self = this
            self.$transfer.go(self, link, param)
        },
        back(link, param) {
            let self = this
            self.$transfer.back(self, link, param);
        },
        chooseStation(){//打开切换机构框
            let self = this;
            if(self.stationShow){
                self.iconShow = '&#xe611;'
            }else{
                self.iconShow = '&#xe66b;'
            }
            self.stationShow = !self.stationShow;
        },
        closeStationPop(){//关闭切换机构框
            let self = this;
            self.stationShow = false;
            self.iconShow = '&#xe611;'
        },
        orderSelectChange(orderSelect){
            let self = this;
            self.orderSelected = orderSelect;
            self.chageGetOrder();
        },
        truckSelectChange(truckSelect){
            let self = this;
            self.truckSelected = truckSelect;
            self.chageGetTruck();
        },
        typeChoose(){//切换收货和发货人
            let self = this;
            if(self.typeIcon == '&#xe648;'){
                self.typeVal = 2;
                self.typeIcon = '&#xe646;';
                self.$transfer.showToast(self, "按收货人查询");
            }else if(self.typeIcon == '&#xe646;'){
                self.typeVal = 1;
                self.typeIcon = '&#xe648;';
                self.$transfer.showToast(self, "按发货人查询");
            }
            self.chageGetOrder();
        },
        byChoose(){//切换按车次还是按订单搜索
            let self = this;
            if(self.byIcon == '&#xe60a;'){
                self.by = 'truck';
                self.byIcon = '&#xe612;';
                self.truckSelected = 'all';
                self.$transfer.showToast(self, "按车次查询");
                self.searchPlaceholder ='请输入司机姓名/车牌号/手机号';
                self.chageGetTruck();
            }else if(self.byIcon == '&#xe612;'){
                self.by = 'order';
                self.byIcon = '&#xe60a;';
                self.orderSelected = 'all';
                self.$transfer.showToast(self, "按订单查询");
                self.searchPlaceholder ='请输入订单号、始发/目的地';
                self.chageGetOrder();
            }
            
        },
        getQRCode(){//扫描二维码
            let self = this;

            if (browserType == "android") {     
            window.Photo.scanCode1();
           self.$nextTick(() =>{
                setTimeout(function(){    
                   var str= window.Photo.getInfoCode();
                   alertShow(str);

                  self.$MessageBox.confirm('确定要交接?')
                  .then(action => { 
                    let ttId = str.split("|")[1];
                    let s = {action:"/tmTask/execute",params:{client:self.orgId,data:{ttId:ttId},opType:'scan_transfer'}};
                    doAjaxQuery(s,function(data) {
                        if(data.status == 0){
                            self.$transfer.backLogin(self, data);
                        }else if(data.status == 1){
                            let searchOrder = data.outParams.orders;
                            self.$transfer.showToast(self, "扫码成功！");
                            self.typeVal = 'all';
                            self.orderSelected = 'all';
                            $(".searchCover").hide();
                            self.searchVal = searchOrder;//返回的变化了的Id
                            // self.chageGetOrder();
                        }
                    });

                }).catch(function(){})
                },100)
              })  
            }else{

               wxScanQRCode(function(data){
                self.$MessageBox.confirm('确定要交接?')
                .then(action => { 
                    let ttId = data.resultStr.split("|")[1];
                    let s = {action:"/tmTask/execute",params:{client:self.orgId,data:{ttId:ttId},opType:'scan_transfer'}};
                    doAjaxQuery(s,function(data) {
                        if(data.status == 0){
                            self.$transfer.backLogin(self, data);
                        }else if(data.status == 1){
                            let searchOrder = data.outParams.orders;
                            self.$transfer.showToast(self, "扫码成功！");
                            self.typeVal = 'all';
                            self.orderSelected = 'all';
                            $(".searchCover").hide();
                            self.searchVal = searchOrder;//返回的变化了的Id
                        }
                    });

                }).catch(function(){})
            })
            }
        },
        getStationData(){//获取所有机构
            let self = this;
            let s = {   action:"/userOrg/query",
                        params:{suoSubSystem:self.subSystem,suoSubSystem2:localStorage.getItem("subSystem2"),suoUserId:self.userId}
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
                        let hasSuoDefault = false;
                        let defaultItem = obj[0];
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
                            if(item.suoIsDefault == 1){
                                hasSuoDefault = true;
                                defaultItem = item;
                            }  
                            
                        })
                        setTimeout(function(){
                            if(hasSuoDefault){
                                self.orgTitle = defaultItem.suoOrgName; 
                                self.orgLogo = defaultItem.suoCompanyLogo;
                                self.companyId = defaultItem.suoCompanyId;
                                self.orgId = defaultItem.suoOrgId;
                                self.changeStation(defaultItem)
                                // alert(self.companyId )
                            }else{
                                self.orgTitle = obj[0].suoOrgName;
                                self.orgLogo = getImgURL() + 'company/default.png';
                                self.companyId = obj[0].suoCompanyId;
                                self.orgId = obj[0].suoOrgId;
                                self.changeStation(defaultItem)
                            }
                        },100)
                        self.stationList = orgArr;
                        
                    }else{
                        self.noOrgData = true;
                        self.stationList = obj;
                        self.$transfer.showToast(self, "您还没有机构，请先创建机构！",'',2000);
                        setTimeout(function(){
                            // self.go('/companyAdd','add');
                            self.go('/noOrg')
                        },2000)
                    }
                    
                }
            });
        },
        goChangeStation(station){//如果企业版点击公司名称可以切换机构,如果是动力版点击公司名称切换到默认的站点
            let self = this;
            
            if(self.subSystem == 'KF'){
                self.$Indicator.open();
                self.changeStation(station.orgs[0])
            }else if(self.subSystem == 'TMS'){
                if(station.MRorg){
                    self.$Indicator.open();
                    self.changeStation(station.MRorg)
                }else{
                    return;
                }   
            }
        },
        changeStation(currOrg,e){//切换当前机构
            let self = this;
            self.$Indicator.open();
            let localToken = Tokens.fetch("token");
            if(self.subSystem == "KF"){//如果是客户版 跟踪里面允许改变全局的机构
                let s = {action:"/userOrg/query"};
                    s.params = {suoSubSystem:currOrg.suoSubSystem,
                                suoSubSystem2:self.subSystem2,
                                suoDistrictName:currOrg.suoDistrictName,
                                suoDistrictId:currOrg.suoDistrictId,
                                suoOrgId:currOrg.suoOrgId,
                                suoId:currOrg.suoId,
                                suoOrgName:currOrg.suoOrgName,
                                suoCompanyId:currOrg.suoCompanyId,
                                suoCompanyName:currOrg.suoCompanyName,
                                opType:"orgChange",
                                clicksubSystem:self.subSystem2,
                                };
                doAjaxQuery(s,function(data) {
                    if(data.status == 0){
                        self.$transfer.backLogin(self, data);
                    }else if(data.status == 1){
                        //重新设置本地存储中的token值
                        
                        localToken["orgId"] = currOrg.suoOrgId;
                        localToken["orgName"] = currOrg.suoOrgName;
                        localToken["orgDistrictId"] = currOrg.suoOrgDistrictId;
                        localToken["orgDistrictName"] = currOrg.suoOrgDistrictName;
                        localToken["districtId2"] = currOrg.suoOrgDistrictId;
                        localToken["provinceId"] = currOrg.suoOrgProvinceId;
                        localToken["companyId"] = currOrg.suoCompanyId;
                        localToken["companyName"] = currOrg.suoOrgName;
                        localToken["companyLogo"] = currOrg.suoCompanyLogo;
                        localToken["isAdmin2"] = currOrg.suoIsAdmin;
                        localToken["isQuery"] = currOrg.suoIsQuery;
                        localToken["isModify"] = currOrg.suoIsModify;
                        localToken["districtId"] = currOrg.suoDistrictId;
                        localToken["districtName"] = currOrg.suoDistrictName;
                        localToken["suoId"] = currOrg.suoId;
                        localStorage.setItem("token","");
                        localStorage.setItem("token",JSON.stringify(localToken));
                    }
                                    
                });
            }else if(localStorage.getItem("isTMSTrace") == 'YES'){
                localStorage.setItem("chooseOrgId",currOrg.suoOrgId);
            }
            //设置页面中的值的变化
            self.stationShow = false;
            self.iconShow = '&#xe611;';
            self.orgTitle = currOrg.suoOrgName;
            self.orgLogo = currOrg.suoCompanyLogo;
            self.orgId = currOrg.suoOrgId;
            self.companyId = currOrg.suoCompanyId;
            if(self.by=="order"){
                self.chageGetOrder();
            }else if(self.by == "truck"){
                self.chageGetTruck();
            }
        },
        loadMore(){//无限加载更多
            let self = this;
            let isStop = isXLorClick();
            if(isStop){ return;}
            if(self.by == "order"){
               if(self.loading || self.orderLoadMax || self.orderCurrPage <= 1){
                    return;                               
                }else{
                    self.loading = true;
                    self.orderLoadMore = true;
                    setTimeout(function(){
                        self.getOrderData(); 
                    },1000)
                          
                } 
            }else if(self.by == "truck"){
               if(self.loading || self.truckLoadMax || self.truckCurrPage <= 1){
                    return;                               
                }else{
                    self.loading = true;
                    self.truckLoadMore = true;
                    setTimeout(function(){
                        self.getTruckData(); 
                    },1000)
                           
                } 
            }
       
        },
        chageGetOrder(){
            let self = this;
            self.orderList = [];
            self.orderCurrPage = 1;
            self.orderLoadMax = false;
            self.noOrderData = '';
            self.$Indicator.open();
            self.getOrderData();
        },
        chageGetTruck(){
            let self = this;
            self.truckList = [];
            self.truckCurrPage = 1;
            self.turckLoadMax = false;
            self.noTruckData = '';
            self.$Indicator.open();
            self.getTruckData();
        },
        getOrderData(){
            let self = this;
            let s = {};
            if(self.subSystem == "KF"){
                s = {  action:"/tmOrderHead/query1",
                       pageIndex:self.orderCurrPage,
                       pageSize:10,
                       params:{type:"query",
                               by:"order",
                               status:self.orderSelected,
                               query_type:self.typeVal,
                               query_company:self.companyId,
                               query_org:self.orgId,
                               findString:self.searchVal
                            }
                   }; 
            }else if(self.subSystem == "TMS"){
                s = {   action:"/tmOrderHead/query1",
                        pageIndex:self.orderCurrPage,
                        pageSize:10,
                        params:{type:"query",by:"order",status:self.orderSelected,query_type:1,query_company:self.companyId,query_org:self.orgId,findString:self.searchVal}
                    };
            }

            doAjaxQuery(s,function(data) {
                if(data.status == 0){
                    self.$transfer.backLogin(self, data);
                }else if(data.status == 1){
                    let obj = data.dataset.rows;
                    if(obj && obj.length>0){
                        obj.forEach(function(item, index){
                            if(!item.tohOrderNo ||item.tohOrderNo == '*'){
                                item.tohOrderShow = item.tohId;
                            }else{
                                item.tohOrderShow = item.tohId+ '/' +item.tohOrderNo;
                            }
                            //承运人显示逻辑
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
                    self.$Indicator.close();
                    if(self.isLoadId){
                        self.$nextTick(()=>{
                            self.$broadcast('onTopLoaded', self.isLoadId);
                            $('#traceListContainer').animate({scrollTop:0},0); 
                            self.isLoadId = null;
                        }) 
                    }
                }
                
                self.orderLoadMore = false;
                self.loading = false;
                
            });

        },
        getTruckData(){//按车次获取信息
            let self = this;
            let s = {   action:"/tmCargoHead/query1",
                        pageIndex:self.truckCurrPage,
                        pageSize:10,
                        params:{type:"query",tchStage:self.truckSelected,query_org:self.orgId,query_company:self.companyId,by:"truck",findString:self.searchVal}
                    };
            self.truckLoadMax = false;
            self.noTruckData = "";
      
            doAjaxQuery(s,function(data) {
                if(data.status == 0){
                    self.$transfer.backLogin(self, data);
                }else if(data.status == 1){  
                    let obj = data.dataset.rows;
                    if(obj && obj.length>0){
                        obj.forEach(function(item, index){
                            item.subSystem = self.subSystem;
                            item.ttDriverLogo = getImgURL() +'user/' +item.ttDriverLogo;
                            var ImgObj = new Image(); 
                            ImgObj.src = item.ttDriverLogo; 
                            ImgObj.onerror = function(){
                                item.ttDriverLogo = getImgURL() + 'user/default.png';
                            }
                            // 任务计数标题
                            if(item.ttStage == 'TH'){
                                item.taskTitle = ['全部','待提货','返回送达'];
                            }else if(item.ttStage == 'GX'){
                                item.taskTitle = ['全部','待装车','待卸车'];
                            }else{
                                item.taskTitle = ['全部','待装车','待送达'];
                            }

                            item.ttStartOrgName = item.ttStartCompanyName+"-"+item.ttStartOrgName + '　委派';
                            item.ttStage = item.ttStage == 'ZC'?'整':item.ttStage == 'TH'?'提':item.ttStage == 'GX'?'干':item.ttStage == 'SH'?'送':'';
                            item.ttStatus == parseInt(item.ttStatus);

                            if((item.tohId != '*') && (item.tohCode1 != '*')){
                                item.tohId = item.tohId + '/' +item.tohCode1; 
                            }else if((item.tohId != '*') && (item.tohCode1 = '*')){
                                item.tohId = item.tohId;
                            }else if((item.tohId = '*') && (item.tohCode1 = !'*')){
                                item.tohId = item.tohCode1;
                            }else{
                                item.tohId = '';
                            }

                            item.sdNum = '';

                        });

                        //判断是替换还是增加
                        if(self.truckCurrPage == 1){
                            self.truckList = obj;
                        }else{
                            self.truckList = self.truckList.concat(obj);
                        }    
                        //判断当前页是否是最后一页  
                        let maxRecord = parseInt(data.dataset.allRowCount);
                        if(self.truckList.length == maxRecord){
                            self.truckLoadMax = true;
                            self.noTruckData = '已全部加载';
                        }
                        self.truckCurrPage++;
                    }else{
                        self.truckLoadMax = true;
                        if(self.truckCurrPage == 1){
                            self.truckList = [];
                        self.noTruckData = "没有相关数据"
                        }else{
                            self.noTruckData = '已全部加载';
                        }
                    }
                    if(self.isLoadId){
                        self.$nextTick(()=>{
                            self.$broadcast('onTopLoaded', self.isLoadId);
                            $('#traceListContainer').animate({scrollTop:0},0); 
                            self.isLoadId = null;
                        }) 
                    }
                }

                self.$Indicator.close();
                self.truckLoadMore = false;
                self.loading = false;

             });
        }

    },
    route: {
        data ({ from,to, next }) {  
            let self = this;
            //进入页面时token不存在
            if(!localStorage.getItem("token")){
                self.$transfer.backLogin(self, {info:'token没有值'});
                return;
            }
            self.token = Tokens.fetch("token")
            self.userId = self.token["userId"];
            self.sessionId = self.token["sessionId"];
            self.orgId = self.token["orgId"];
            self.companyId = self.token["companyId"];
            self.subSystem = self.token["subSystem"];
            self.isLoadId = null;

            self.browserType=browserType;
            if(self.subSystem == 'TMS'){
                localStorage.setItem("isTMSTrace","YES");
            }
            if(from.path && (from.path.indexOf('taskOrderAddExtremely')!= -1 || from.path.indexOf('taskOrderExtremely')!= -1) && self.orderList.length != 0){
                // 如果是从订单异常回来重置'异'字的背景色 
                self.orderList = Tokens.fetch('taskOrderList');
                
                let preSrollTop = Tokens.fetch("traceListContainer");
                self.$nextTick(()=>{
                    $('#traceListContainer').animate({scrollTop:preSrollTop},0); 
                })
            }else if( from.path && (((from.path.indexOf('taskOrderModified')!= -1 || from.path.indexOf('taskOrderExtremely')!= -1 || from.path.indexOf('taskOrderAddExtremely')!= -1 || from.path.indexOf('taskOrderDetail')!= -1) && self.orderList.length != 0) || (from.path.indexOf('taskDetail')!= -1 && self.truckList.length != 0))){//如果是从修改记录回来
                let preSrollTop = Tokens.fetch("traceListContainer");
                self.$nextTick(()=>{
                    $('#traceListContainer').animate({scrollTop:preSrollTop},0); 
                })  
                
            }else{//其它路径或本页刷新
                if(!localStorage.getItem("isTraceReload") || (self.subSystem2 != localStorage.getItem("subSystem2"))){
                    localStorage.setItem("isTraceReload",'YES')
                    self.subSystem = localStorage.getItem("subSystem");
                    self.subSystem2 = localStorage.getItem("subSystem2");
                    self.beforeScrollTop = 0;//初始进入页面时scroll的值为0
                    self.orgTitle = '';
                    self.orgLogo = getImgURL() + 'company/default.png';
                    self.by = 'order';
                    self.byIcon = '&#xe60a;';
                    self.typeVal = 1;
                    self.typeIcon = '&#xe648;';
                    self.orderSelected = 'all';
                    self.truckSelected = 'all';
                    self.searchVal = '';
                    self.searchNum = 0;
                    self.getStationData();
                    self.$nextTick(()=>{
                        $('#traceListContainer').animate({scrollTop:0},0); 
                    }) 
                } 
                
            }

            next()
        },
        deactivate ({ next }) {
            next()
        },
        canDeactivate({to, from, next}) {
            let self = this;
            self.$parent.$data.showBar = false;
            let scrollTop = $("#traceListContainer").scrollTop();
            Tokens.save("traceListContainer",scrollTop);
            $('#traceMysearchBox').slideDown();

            if (to.path.indexOf('/tiulo')!= -1 || to.path.indexOf('/friends')!= -1 || to.path.indexOf('/taskList')!= -1 || to.path.indexOf('/accountIndex')!= -1 || to.path.indexOf('/TMStaskList')!= -1 || to.path.indexOf('/more')!= -1) {
                localStorage.setItem("isTMSTrace",'');
            }
            next()
        },
        activate({to, from, next}) {
            let self = this;
            let subSystem = localStorage.getItem("subSystem");
            if(subSystem){
                self.$parent.$data.subSystem = subSystem;
            }
            self.$parent.$data.showBar = true;
            self.$parent.$data.MainSelect = "traceList";
            next()
        } 
    }
}


</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.stationTitle{
    display:inline-block;
    max-width: 80%;
    overflow: hidden;
    text-overflow:ellipsis;
    white-space: nowrap;
}
.stationLine{
    display: inline-block;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap; 
    font-size: 0.75rem;
    font-weight: 900;

}
.stationBox{
    width: 100%;
    height:100%;
    background: transparent;
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
.orderType{
    box-sizing: border-box;
    padding:0.15rem 0.5rem 0 2.5rem;
    background: #fff;
    border-top:1px solid #e5e5e5;
    border-bottom:1px solid #e5e5e5;
    margin-bottom:0.25rem;
    height:2.3rem;
    line-height: 2.2rem;
}
.ordetType_box .iconfont{
    position: absolute;
    top:0.2rem;
    left:0.5rem;
    height:2rem;
    line-height: 2rem;
    font-size: 1.4rem;
    color:#666;
}
/*.order_box,.truckList{
    margin-top:5.3rem;
}*/


</style>

