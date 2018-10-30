<template>
    <div class="page" id="orderManagePage">   
        <div class="mint-header">
            <div class="hleft" @click="back('/TMStaskList')"> 
                <span slot="icon" class="iconfont">&#xe605;</span>
            </div>
            <div class="hcontent mint-header-title">
                <div class="hcontentTitle" @click="openJoinType()">
                    <div class="stationTitle">
                        {{joinTitle}}   
                    </div>
                    <span slot="icon" class="iconfont hcontentIcon">{{{iconShow}}}</span>  
                </div>
            </div>
            <div class="hright" @click="joinOrder()">{{orderSelected == 'wjj' ? '交接' : '撤销'}}</div>
        </div>
        <div class="container-search" id="joinManageMysearchBox" style="height:5.2rem"> 
            <mysearch
              :value.sync="searchVal"
              :placeholder= "placeholder">
            </mysearch>
            <!-- navbar -->
            <div class="ordetType_box">
                <div @click = "isCheckAll()" class="AllBcircle" :class = "checkAll ? 'selAllBcircle' : '' "></div>
                <mt-navbar class="page-part" :selected.sync="orderSelected">
                    <mt-tab-item id="wjj" @click="orderSelectChange('wjj')">未交接</mt-tab-item>
                    <mt-tab-item id="yjj" @click="orderSelectChange('yjj')">已交接</mt-tab-item>
                </mt-navbar>
            </div>
        </div>
        <div class="container-top" style="margin-bottom:3rem;" id="joinManageContainer" v-infinite-scroll="loadMore()" infinite-scroll-immediate-check="false" infinite-scroll-disabled="loading" infinite-scroll-distance="50">
            
            <mypulldown style="margin-top:5.3rem">
                <div slot= "pullList" :style = "{minHeight:listViewH + 'px'}">
                    <div class="order_box">
                        <myorderjoin :value.sync="value" :value2.sync="value2" :options="orderList" title="all"></myorderjoin>
                        <div class="noData">{{noOrderData}}</div>                               
                        <!-- 加载指示器 -->
                        <div class="sw-spinner" v-if="orderLoadMore">
                            <mt-spinner type="snake" color="#FFD91E"></mt-spinner>
                        </div>
                        
                    </div>
                </div>
            </mypulldown>

        </div>

        <!-- 交接类型选择框 -->
        <mt-popup class="joinTypeBox" :visible.sync="joinTypeShow" popup-transition="popup-fade" @click="closeJoinTypePop()">
            <div class="container-top" style="margin-bottom:3rem;">
                <ul class="joinType">
                    <li v-for="type in typeData" @click="chooseJoinType(type)">
                        <span slot="icon" class="iconfont" :class="joinType == type.val ? 'currJoinCircle' : ''">&#xe618;</span>{{type.label}}
                    </li>
                </ul>
            </div>
        </mt-popup> 

        <!-- 二维码弹出框 -->
        <mt-popup class="qrPop" :visible.sync="qrCodeShow">
            <div class="qrImgBox">
                <img class="qrImg" :src="qrCodeUrl"/>
            </div>   
        </mt-popup> 
    </div>
</template>

<script>
// Ajax request module, return a Promise
import Tokens from '../token'
import  Mysearch  from '../components/mysearch'
import  Myorderjoin  from '../components/myorderjoin'
import  Mypulldown from '../components/mypulldown'//引入下拉刷新的组件
export default {
    components: {
        Mysearch,
        Myorderjoin,
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
            placeholder:'订单号、收/发货人、始发/目的地',
            userId:'',
            subSystem:'',
            companyId:'',
            orgId:'',
            joinType:'sh',//交接类型
            joinTitle:'收货交接',
            iconShow:'&#xe611;',//上下箭头 &#xe66b;
            orderSelected:'wjj',//
            value:[],//选中的订单
            value2:[],//选中的订单明细
            orderList:[],//订单列表
            orderCurrPage:1,//当前页数
            noOrderData:'',//没有订单
            orderLoadMax:false,//是否加载到最大条数
            orderLoadMore:false,//显示无限加载指示器
            checkAll:false,//是否是全选

            joinTypeShow:false,
            typeData:[  {label:'收货交接',val:'sh'},
                        {label:'装车交接',val:'zc'},
                        {label:'卸货交接',val:'xh'},
                        {label:'出站交接',val:'cz'}],

            qrCodeShow:false,//二维码显示框
            qrCodeUrl:'',//二维码链接

            closeSocket:false,
            currTtId:'',
            datasource:'',
            publicHome_url:'',
            orgAdmin_url:'',
            curr_user_url:'',
        }
    },
    ready (){
        let self = this;   
        searchBoxIsShow('#joinManageContainer','#joinManageMysearchBox',self.beforeScrollTop,function(top){
            self.beforeScrollTop = top;  
        })
        //列表框的最小高度
        self.$nextTick(()=>{
            self.listViewH = $("#joinManageContainer").height() - $("#joinManageMysearchBox").height() -10;
        })

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
                self.value2 = [];
                self.checkAll = false;
                self.orderCurrPage = 1;
                self.orderLoadMax = false;
                self.noOrderData = '';
                self.getOrderData();     
            }, 1000);
    
        },
        chooseValue(arr,arr2){
            let self = this;
            self.value = arr;
            self.value2 = arr2;
        },
        taskDetailShow(ttId,ttDriverId){//显示任务详情页面
            let self = this;

            //列表若有点击跳转事件，在下拉时阻止点击跳转
            let isStop = isXLorClick();
            if(isStop){
                //这里可以加入你阻止点击时的其它操作
                $(".Truckjoin").removeClass("active_border");
                return;
            }
            //进入任务详情页面后，重置司机的信息  
            Tokens.save("joinTruckId",ttId);
            Tokens.save("joinDriverId",ttDriverId);
            Tokens.save("joinType",self.joinType);
            Tokens.save("joinSelected",self.orderSelected);
            Tokens.save("isJoin",'');
            self.go('/joinTruckDetail'); 
        },
        goOrderDetail(order,e){//查看订单详情
            let self = this;
            let isStop = isXLorClick();
            if(isStop){
                $(".orderjoin").removeClass("active_border");
                return;
            }
            self.$Indicator.open();
            //当前选中元素的变色
            let el = e.target;
            let oneOrder = $(el).hasClass("orderjoin") ? $(el) : $(el).parents('.orderjoin');
            $(".orderjoin").removeClass("active_border");
            $(".Truckjoin").removeClass("active_border");
            oneOrder.addClass("active_border");
            Tokens.save("orderData",order);
            self.$transfer.go(self, '/taskOrderDetail'); 
            self.$Indicator.close();
        },
        extremelyShow (index,tohExId,e){//显示订单异常发起页面
            let self = this;
            let isStop = isXLorClick();
            if(isStop){
                $(".orderjoin").removeClass("active_border");
                return;
            }
            //当前选中元素的变色
            let el = e.target;
            let oneOrder = $(el).hasClass("orderjoin") ? $(el) : $(el).parents('.orderjoin');
            $(".orderjoin").removeClass("active_border");
            $(".Truckjoin").removeClass("active_border");
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
                $(".orderjoin").removeClass("active_border");
                return;
            }
            //当前选中元素的变色
            let el = e.target;
            let oneOrder = $(el).hasClass("orderjoin") ? $(el) : $(el).parents('.orderjoin');
            $(".orderjoin").removeClass("active_border");
            $(".Truckjoin").removeClass("active_border");
            oneOrder.addClass("active_border");

            let keyId = tchId ? tchId : tohId;
            self.go('/taskOrderModified' ,keyId); 
        },
        showQRcode(ttId,e){//显示二维码
            let self = this;
            let isStop = isXLorClick();
            if(isStop){
                $(".Truckjoin").removeClass("active_border");
                return;
            }
            //当前选中元素的变色
            let el = e.target;
            let Truckjoin = $(el).hasClass("Truckjoin") ? $(el) : $(el).parents('.Truckjoin');
            $(".orderjoin").removeClass("active_border");
            $(".Truckjoin").removeClass("active_border");
            Truckjoin.addClass("active_border");

            self.currTtId = ttId;
            let root = getRootURL();
            let text = 'transfer|'+ ttId;
            text = encodeURIComponent(text);
            self.qrCodeUrl = root+'/rest/Qrcode/query?text=' + text + '&width=' + 140;
            self.qrCodeShow = true;
            self.closeSocket = false;
            exEntry_ws = null;
            self.exChatOpen();       
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
            $(".orderjoin").removeClass("active_border");
            $(".Truckjoin").removeClass("active_border");
            if(self.checkAll){
                self.value = [];
                self.value2 = [];
                $(".joincircle").removeClass("sejoincircle")
            }else{
                if(self.orderList.length > 0){
                    self.$transfer.showToast(self, "全选当前加载的" + self.orderList.length +"条记录");
                } 
                
                self.value = [];
                self.value2 = [];
                for(var i = 0; i<self.orderList.length; i++){
                    self.value.push(self.orderList[i].value);
                    self.value2.push(self.orderList[i].tchId2)
                }
                $(".joincircle").addClass("sejoincircle")
            }                       

        },
        orderSelectChange(type){//切换选择类型
            let self = this;
            if(self.loading){return}
            self.value = [];
            self.value2 = [];
            self.checkAll = false;
            self.orderSelected = type;
            self.orderList = [];
            self.orderCurrPage = 1;
            self.orderLoadMax = false;
            self.noOrderData = '';
            self.$Indicator.open();
            self.getOrderData();
        },
        openJoinType(){//打开选择交接类型
            let self = this;
            if(self.joinTypeShow){
                self.iconShow = '&#xe611;'
            }else{
                self.iconShow = '&#xe66b;'
            }
            self.joinTypeShow = !self.joinTypeShow;
        },
        closeJoinTypePop(){//关闭切换机构框
            let self = this;
            self.joinTypeShow = false;
            self.iconShow = '&#xe611;'
        },
        chooseJoinType(type){//选择交接类型
            let self = this;
            if(type.val == "zc" || type.val == "xh"){
                self.placeholder = "司机姓名、车牌号、手机号";
            }else{
                self.placeholder = "订单号、收/发货人、始发/目的地";
            }
            if(self.joinType == type.val){
                return;
            }else{
                self.joinType = type.val;
                self.joinTitle = type.label;
                // self.orderSelected = 'wjj';
                self.orderList = [];
                self.orderCurrPage = 1;
                self.orderLoadMax = false;
                self.noOrderData = '';
                self.noData = '';
                self.$Indicator.open();
                self.getOrderData() 
            }
            
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
            let s = {   action:"/tmCargoHead/query2",
                        secString:'zc,cz,sh,xh',
                        pageIndex:self.orderCurrPage,
                        pageSize:10,
                        params:{mobile:'1',status:self.orderSelected,type:"cargo",btn:self.joinType,findString:self.searchVal}
                    }; 
            doAjaxQuery(s,function(data) {
                if(data.status == 0){
                    self.$transfer.backLogin(self, data);
                }else if(data.status == 1){
                    let obj = data.dataset.rows;
                    if(obj && obj.length>0){
                        obj.forEach(function(item, index){
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

                            if(!item.tohOrderNo ||item.tohOrderNo == '*' || item.tohId == item.tohOrderNo){
                                item.tohOrderShow = item.tohId;
                            }else{
                                item.tohOrderShow = item.tohId+ '/' +item.tohOrderNo;
                            }
                            item.value = item.tchId;
                            //承运人显示逻辑
                            //订单tohCompanyId与当前公司做比较，如果不相等并且不是企业版就显示分单人，
                            // tohRecvCompanyId 和当前公司 如果不相等就显示承运人

                            if(self.subSystem=='KF' && item.tohOrgId!='*' && item.tohOrgId != self.orgId){
                                //显示 tohCompanyName  tohOrgName
                                item.tohRecvMan = item.tohCompanyName +'-'+ item.tohOrgName;
                            }else if(self.subSystem=='TMS' && item.tohRecvCompanyId!='*' && item.tohRecvCompanyId != self.companyId){
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

                            if(item.tchTaskId == "*" || item.tchTaskId == "**" ){
                                //封装交接要传的数据
                                item.tchId2 = [{tchId:item.tchId,
                                                tchModifyDate:item.tchModifyDate,
                                                tchTaskId:item.tchTaskId,
                                                tohId:item.tohId,
                                                tchStatus:item.tchStatus
                                                }];
                               //收发详细地址
                                item.StartAddress = item.tohStartProvinceName+item.tohStartDistrictName+item.tohStartAddress;
                                item.EndAddress = item.tohEndProvinceName+item.tohEndDistrictName+item.tohEndAddress;
                                //收发区域
                                item.startArea = item.tohStartDistrictName.split('-')[0];
                                if(item.startArea && item.startArea.length > 3){ item.startArea = item.startArea.substring(0, 3) ;}

                                item.endArea = item.tohEndDistrictName.split('-')[0];
                                if(item.endArea && item.endArea.length > 3){ item.endArea = item.endArea.substring(0, 3) ;}

                                //订单状态条
                                item.tchStatusTitle = tchStatusTitle[item.tchStage].split('-');
                                //物料明细 
                                item.tchDetail = eval('(' + item.tchDetail + ')')
                            }else{
                                item.tchId2Show = item.tchId2 ? item.tchId2.split(",") : "";
                                item.tchId2 = [];
                                for(var i=0;i< item.tchId2Show.length;i++){
                                    let oneData = item.tchId2Show[i].split("|");
                                    item.tchId2.push({  tchId:oneData[0],
                                                        tohId:oneData[1],
                                                        tchStatus:oneData[2],
                                                        tchModifyDate:oneData[3],
                                                        tchTaskId:oneData[4]
                                                        })

                                }
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
                self.orderCurrPage++;
                self.orderLoadMore = false;
                self.loading = false;
                
            });

        },
        joinOrder(){//交接或撤销
            let self = this;
            if(self.value.length == 0){
                self.$transfer.showToast(self, "请先选择车次或订单");
                return;
            }
            let joinData = [];
            for(var i=0;i<self.value2.length;i++){
                joinData = joinData.concat(self.value2[i]);
            }
            if(self.orderSelected == 'wjj'){//执行交接操作        
                let s = {   action:"/tmTask/execute",
                            secString:'zc,cz,sh,xh',
                            params:{count:1,jjbtn:self.joinType,opType:"transfer"}
                        };
                        s.params.data = {cargo:joinData};

                doAjaxQuery(s,function(data) {
                    if(data.status == 0){
                        self.$transfer.backLogin(self, data);
                        self.value = [];
                        self.value2 = [];
                        $(".joincircle").removeClass("sejoincircle")
                    }else if(data.status == 1){
                        self.$Indicator.close();
                        self.$transfer.showToast(self, "交接成功");
                        setTimeout(() => {
                            self.value = [];
                            self.value2 = [];
                            self.checkAll = false;
                            self.orderCurrPage = 1;
                            self.orderLoadMax = false;
                            self.noOrderData = '';
                            self.$Indicator.open();
                            self.getOrderData();     
                        }, 1000);

                    }
                    
                });
            }else{//执行撤销交接操作
                let s = {   action:"/tmTask/execute",
                            secString:'zc,cz,sh,xh',
                            params:{count:1,jjbtn:self.joinType,opType:"cancel_transfer"}
                        };
                        s.params.data = {cargo:joinData};

                doAjaxQuery(s,function(data) {
                    if(data.status == 0){
                        self.$transfer.backLogin(self, data);
                        self.value = [];
                        self.value2 = [];
                        $(".joincircle").removeClass("sejoincircle")
                    }else if(data.status == 1){
                        self.$Indicator.close();
                        self.$transfer.showToast(self, "撤销成功");
                        setTimeout(() => {
                            self.value = [];
                            self.value2 = [];
                            self.checkAll = false;
                            self.orderCurrPage = 1;
                            self.orderLoadMax = false;
                            self.noOrderData = '';
                            self.$Indicator.open();
                            self.getOrderData();     
                        }, 1000);

                    }
                    
                });
            }
        

        },
        exChatOpen (){//建立Sock连接 监听二维码被扫描
            let self = this;
            self.curr_key1 = self.datasource + self.subSystem + self.userId;//当前用户的key1
            if(self.datasource=="dbcon"){//开发版
                self.publicHome_url = "/queue/publicqueue1_kf";
                self.orgAdmin_url = "/exchange/publicexchange_kf/"+self.currTtId;
            }else if(self.datasource=="dbtest"){
                self.publicHome_url = "/queue/publicqueue1_test";//测试版
                self.orgAdmin_url = "/exchange/publicexchange_test/"+self.currTtId;
            }else if(self.datasource=="dbtms"){
                self.publicHome_url = "/queue/publicqueue1";//正式版
                self.orgAdmin_url = "/exchange/publicexchange/"+self.currTtId;
            }
            self.curr_user_url = self.orgAdmin_url;

            exEntry_ws = new SockJS('http://120.27.145.36:15674/stomp');//建立连接
            client = Stomp.over(exEntry_ws);
            client.heartbeat.outgoing = 0;
            client.heartbeat.incoming = 0;
            self.subscribe = true;
            let on_connect = function(x) {
                let id = client.subscribe(self.curr_user_url, function(d) {
                    self.qrCodeShow = false;
                    self.$transfer.showToast(self, "扫码成功！");
                    //重置该车次的订单列表
                    self.orderCurrPage = 1;
                    self.orderLoadMore = false;
                    self.orderLoadMax = false;
                    self.orderloading = false;
                    self.noOrderData = '';
                    self.getOrderData();
                })    
            };//var on_connect   -----end
            let on_error =  function() {
                if(self.closeSocket==false){
                    window.setTimeout(function(){
                        self.exChatOpen();//连接失败，20秒后再次连接
                        }, 20000);
                }
            };
            client.connect('user', 'user', on_connect, on_error, '/'); 
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
            if(from.path && (from.path.indexOf('taskOrderAddExtremely')!= -1 || from.path.indexOf('taskOrderExtremely')!= -1) && self.orderList.length != 0){
                // 如果是从订单异常回来重置'异'字的背景色 
                self.orderList = Tokens.fetch('taskOrderList');
                
                let preSrollTop = Tokens.fetch("joinManageContainer");
                self.$nextTick(()=>{
                    $('#joinManageContainer').animate({scrollTop:preSrollTop},0); 
                })
            }else if(from.path && (from.path.indexOf('taskOrderModified')!= -1 || from.path.indexOf('taskOrderDetail')!= -1 || (from.path.indexOf('joinTruckDetail')!= -1 && Tokens.fetch('isJoin') != 'YES')) && self.orderList.length != 0){
                let preSrollTop = Tokens.fetch("joinManageContainer");
                self.$nextTick(()=>{
                    $('#joinManageContainer').animate({scrollTop:preSrollTop},0); 
                })
            }else{
                self.placeholder = "订单号、收/发货人、始发/目的地"
                self.checkAll = false;
                self.value = [];
                self.value2 = [];
                self.preSrollTop = 0;
                self.searchVal = '';
                self.searchNum = 0;
                // self.orderSelected = 'wjj';
                self.orderList = [];
                self.orderCurrPage = 1;
                self.orderLoadMax = false;
                self.noOrderData = '';
                self.$Indicator.open();
                self.getOrderData(); 
                  
                self.$nextTick(()=>{
                    $('#joinManageContainer').animate({scrollTop:0},0); 
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
            self.$parent.$data.taskPageDefalut = "/joinManage"
            $('#joinManageMysearchBox').slideDown();
            let scrollTop = $("#joinManageContainer").scrollTop();
            Tokens.save("joinManageContainer",scrollTop);
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
.qrPop{
    padding:1rem;
    background: #fff;
    border-radius: 0.2rem;
}
.qrPop .qrImg{
    width:9rem;
    display: block;
}
.stationTitle{
    display:inline-block;
    max-width: 80%;
    overflow: hidden;
    text-overflow:ellipsis;
    white-space: nowrap;
}
.joinTypeBox{
    width: 100%;
    height:100%;
    background: transparent;
}
.joinType{
    background: #fff;
}
.joinType li{
    height:2.2rem;
    line-height: 2.2rem;
    border-bottom:1px solid #e5e5e5;
    padding:0 0.5rem;
}
.joinType li .iconfont{
    padding-right:0.5rem;  
    color:#999; 
}
.currJoinCircle{
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
