<template>
    <div class="page"> 
        <mt-header fixed :title="joinTitle">
            <mt-button icon="back" slot="left" @click="back('/joinManage')"></mt-button>
            
            <mt-button slot="right" @click="joinOrder()">
                {{joinSelected == 'wjj' ? '交接' : '撤销'}}  
            </mt-button>
        </mt-header> 
        <div class="container-top" id="joinTruckDetailContainer" v-infinite-scroll="orderloadMore()" infinite-scroll-immediate-check="false" infinite-scroll-disabled="loading" infinite-scroll-distance="50"> 
            <mypulldown>
                <div slot= "pullList" :style = "{minHeight:listViewH + 'px'}">
                    <!-- driver -->
                    <myorderjoin :value.sync="value" :value2.sync="value2" :options="xqTaskList" title="truck"></myorderjoin>
                    <!-- 该车次的订单 -->
                    <myorderjoin :value.sync="value" :value2.sync="value2" :options="orderList" title="order"></myorderjoin>
                    <div class="noData">{{noOrderData}}</div>

                    <!-- 加载指示器 -->
                    <div class="sw-spinner" v-if="orderLoadMore">
                        <mt-spinner type="snake" color="#FFD91E"></mt-spinner>
                    </div>
                </div>
            </mypulldown>        
        </div>

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
import  Myorderjoin from '../components/myorderjoin'
import  Mypulldown from '../components/mypulldown'//引入下拉刷新的组件
export default {
    components: {
        Myorderjoin,
        Mypulldown
    },
    data () {
        return {
            isLoadId:null, 
            listViewH:0,//下拉刷新框的最小高度
            mapShow:false,  //导航类型pop
            addressShow:false,//导航的地址
            shareShow:false,//分享类型选择框
            userId:'',
            companyId:'',
            ttdriverId:'',//driverId
            joinTitle:'',
            joinSelected:'',
            joinType:'',
            sessionId:'',
            truckEOk:false,
            orderOK:false,
            xqTaskList:[],//任务详情数据
            ttId:'',//车次ID 
            value:[],
            value2:[],
            orderList:[],
            orderCurrPage:1,
            orderLoadMore:false,
            orderLoadMax:false,
            orderloading:false,
            noOrderData:'',

            qrCodeShow:false,//二维码显示框
            qrCodeUrl:'',//二维码链接

            //二维码被扫描的事件监听
            closeSocket:false,
            currTtId:'',
            datasource:'',
            subSystem:'',
            userId:'',
            publicHome_url:'',
            orgAdmin_url:'',
            curr_user_url:'',

        }
    },
    ready (){
        let self = this; 
        //列表框的最小高度
        self.$nextTick(()=>{
            self.listViewH = $("#joinTruckDetailContainer").height() -10;
        })

    },
    watch:{
        orderList:{
            handler: function (newVal) {
                        Tokens.save('taskOrderList',newVal)
                     },
            deep: true
        }
    },
    events:{
        refreshList(id,topStatus){//下拉刷新时重置列表数据
            let self = this;
            self.isLoadId = id;
            setTimeout(() => { 
                self.value = [];
                self.value2 = [];
                self.orderCurrPage = 1;
                self.orderLoadMore = false;
                self.orderLoadMax = false;
                self.orderloading = false;
                self.noOrderData = '';
                self.getTruckDetail();
            }, 1000);
        },
        chooseValue(arr,arr2){//订单单选
            let self = this;
            self.value = arr;
            self.value2 = arr2;
            if(self.value.length < self.orderList.length || self.orderList.length == 0){
               $("#joincircle0truck") .removeClass("sejoincircle")
            }else{
               $("#joincircle0truck") .addClass("sejoincircle") 
            }
        },
        chooseAllValue(index,title){//按车次全选
            let self = this;
            if($("#joincircle" + index + title).hasClass("sejoincircle")){
                $(".joincircle").removeClass("sejoincircle");
                self.value = [];
                self.value2 = [];
                
            }else{
                self.$transfer.showToast(self, "全选当前加载的" + self.orderList.length +"个订单");
                self.value = [];
                self.value2 = [];
                $(".joincircle").addClass("sejoincircle")
                for(var i=0;i<self.orderList.length;i++){
                    self.value.push(self.orderList[i].value)
                    self.value2.push(self.orderList[i].tchId2)
                }         
            }
        },
        showQRcode(ttId){//显示二维码
            let self = this;
            let isStop = isXLorClick();
            if(isStop){ return;}
            self.currTtId = ttId;
            let root = getRootURL();
            let text = 'transfer|'+ ttId;
            text = encodeURIComponent(text);
            self.qrCodeUrl = root+'/rest/Qrcode/query?text=' + text + '&width=' + 140;
            self.qrCodeShow = true;
            self.closeSocket = false;
            exEntry_ws = null;
            self.exChatOpen();       

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
            oneOrder.addClass("active_border");
            Tokens.save("orderData",order);
            self.$transfer.go(self, '/taskOrderDetail'); 
            self.$Indicator.close();
        },
        extremelyShow (index,tohExId,e){//显示订单异常发起页面
            let self = this;
            let isStop = isXLorClick();
            if(isStop){ 
                $(".myorderlist").removeClass("active_border");
                return;
            }
            //当前选中元素的变色
            let el = e.target;
            let oneOrder = $(el).hasClass("orderjoin") ? $(el) : $(el).parents('.orderjoin');
            $(".orderjoin").removeClass("active_border");
            $(".Truckjoin").removeClass("active_border");
            oneOrder.addClass("active_border");
            self.tchOrderId = self.orderList[index].tchOrderId;

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
                $(".myorderlist").removeClass("active_border");
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
        getTruckDetail(){//获取车次信息
            let self = this;
            let s = {   action:"/tmCargoHead/query1",
                        secString:'zc,cz,sh,xh',
                        params:{from:"list",mobile:'1',type:"cargo",status:self.joinSelected,btn:self.joinType,tchTaskId:self.ttId}
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

                            //收发详细地址
                            item.StartAddress = item.tohStartProvinceName+item.tohStartDistrictName+item.tohStartAddress;
                            item.EndAddress = item.tohEndProvinceName+item.tohEndDistrictName+item.tohEndAddress;
                            //收发区域
                            item.startArea = item.tohStartDistrictName.split('-')[0];
                            if(item.startArea && item.startArea.length > 3){ item.startArea = item.startArea.substring(0, 3) ;}

                            item.endArea = item.tohEndDistrictName.split('-')[0];
                            if(item.endArea && item.endArea.length > 3){ item.endArea = item.endArea.substring(0, 3) ;}

                            //物料明细 
                            item.tchDetail = eval('(' + item.tchDetail + ')')

                            //订单状态条
                            item.tchStatusTitle = tchStatusTitle[item.tchStage].split('-');

                            //封装交接要传的数据
                            item.tchId2 = [{tchId:item.tchId,
                                            tchModifyDate:item.tchModifyDate,
                                            tchTaskId:item.tchTaskId,
                                            tohId:item.tohId,
                                            tchStatus:item.tchStatus
                                            }];

                        });

                        //判断是替换还是增加
                        if(self.orderCurrPage == 1){
                            self.orderList = obj;
                            self.xqTaskList = [obj[0]];
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
                            self.xqTaskList = [];
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
                
            });

        },
        orderloadMore () {//任务详情页订单是否加载更多
            let self = this;
            let isStop = isXLorClick();
            if(isStop){return;}
            if(!self.orderloading  && !self.orderLoadMax){
                self.orderloading = true;
                self.orderCurrPage++;
                self.orderLoadMore = true;
                setTimeout(function(){
                    self.getTruckDetail();
                },1000)
                       
            }else{
                return;
            }

        },
        joinOrder(){//分单或撤销
            let self = this;
            if(self.value.length == 0){
                self.$transfer.showToast(self, "请先选择车次或订单");
                return;
            }
            let joinData = [];
            for(var i=0;i<self.value2.length;i++){
                joinData = joinData.concat(self.value2[i]);
            }
            if(self.joinSelected == 'wjj'){//执行交接操作        
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
                        Tokens.save("isJoin",'YES');
                        self.$Indicator.close();
                        
                        if(self.value2.length < self.orderList.length){
                            self.$transfer.showToast(self, "交接成功");
                            setTimeout(() => {
                                self.value = [];
                                self.value2 = [];
                                self.checkAll = false;
                                self.orderCurrPage = 1;
                                self.orderLoadMax = false;
                                self.noOrderData = '';
                                self.$Indicator.open();
                                self.getTruckDetail();     
                            }, 1000);

                        }else{
                            self.$transfer.showToast(self, "已全部交接");
                            setTimeout(() => {
                                self.back("/joinManage")     
                            }, 1000);
                        }
                        
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
                        Tokens.save("isJoin",'YES');
                        self.$Indicator.close();

                        if(self.value2.length < self.orderList.length){
                            self.$transfer.showToast(self, "撤销成功");
                            setTimeout(() => {
                                self.value = [];
                                self.value2 = [];
                                self.checkAll = false;
                                self.orderCurrPage = 1;
                                self.orderLoadMax = false;
                                self.noOrderData = '';
                                self.$Indicator.open();
                                self.getTruckDetail();     
                            }, 1000);

                        }else{
                            self.$transfer.showToast(self, "已全部撤销");
                            setTimeout(() => {
                                self.back("/joinManage")     
                            }, 1000);
                        }

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
                    self.$transfer.showToast(self, "扫码成功");
                    //重置该车次的订单列表
                    self.orderCurrPage = 1;
                    self.orderLoadMore = false;
                    self.orderLoadMax = false;
                    self.orderloading = false;
                    self.noOrderData = '';
                    self.getTruckDetail();
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
        data ({ from , to, next }) {
            let self = this ;
            //进入页面时token不存在
            if(!localStorage.getItem("token")){
                self.$transfer.backLogin(self, {info:'token没有值'});
                return;
            }

            let token = Tokens.fetch('token');
            self.userId = token["userId"];
            self.sessionId = token["sessionId"];
            self.datasource = token['datasource'];
            self.subSystem = token['subSystem'];
            self.companyId = token["companyId"];
            self.isLoadId = null;
            //从上一级页面进来或后一级页面刷新过了或本页刷新，重新获取数据
            if( !from.path || (from.path.indexOf('joinManage') != -1) || (from.path.indexOf('joinManage')== -1&& self.xqTaskList.length == 0 && self.orderList.length == 0)){

                self.ttId = Tokens.fetch("joinTruckId");
                self.ttdriverId = Tokens.fetch("joinDriverId")
                self.joinType = Tokens.fetch("joinType");
                self.joinSelected = Tokens.fetch("joinSelected")
                self.joinTitle = self.joinType == 'sh' ? '收货交接详情' :
                                 self.joinType == 'zc' ? '装车交接详情' :
                                 self.joinType == 'xh' ? '卸货交接详情' :
                                 self.joinType == 'cz' ? '出站交接详情' : '';  

                //进入任务详情页面后，重置该车次的订单列表
                self.value = [];
                self.value2 = [];
                self.orderList = [];
                self.orderCurrPage = 1;
                self.orderLoadMore = false;
                self.orderLoadMax = false;
                self.orderloading = false;
                self.noOrderData = '';
                self.$Indicator.open();
                self.getTruckDetail();
                self.$nextTick(()=>{
                    $('#joinTruckDetailContainer').animate({scrollTop:0},0);   
                })

            }else if((from.path.indexOf('taskOrderAddExtremely')!= -1) || (from.path.indexOf('taskOrderExtremely')!= -1)){
                // 如果是从订单异常回来重置'异'字的背景色 
                self.orderList = Tokens.fetch('taskOrderList');

                // 重置scrollTop
                let preSrollTop = Tokens.fetch("joinTruckDetailContainer");
                self.$nextTick(()=>{
                    $('#joinTruckDetailContainer').animate({scrollTop:preSrollTop},0); 
                })
            }else{
                // 重置scrollTop
                let preSrollTop = Tokens.fetch("joinTruckDetailContainer");
                self.$nextTick(()=>{
                    $('#joinTruckDetailContainer').animate({scrollTop:preSrollTop},0);   
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
            let scrollTop = $("#joinTruckDetailContainer").scrollTop();
            Tokens.save("joinTruckDetailContainer",scrollTop);

            if(exEntry_ws != null){ 
                self.closeSocket=true;
                exEntry_ws.close();
            } 
            next()
        },
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.maxPop{
    width:100%;
}
.qrPop{
    padding:1rem;
    background: #fff;
    border-radius: 0.2rem;
}
.qrPop .qrImg{
    width:9rem;
    display: block;
}

</style>
