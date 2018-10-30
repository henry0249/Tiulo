<template>
    <div class="page" id="taskDetailPage"> 
        <mt-header fixed title="任务详情">
            <mt-button icon="back" slot="left" @click="backPage()"></mt-button>
        </mt-header> 
        <div class="container-top" id="taskDetailContainer" v-infinite-scroll="orderloadMore()" infinite-scroll-immediate-check="false" infinite-scroll-disabled="loading" infinite-scroll-distance="50"> 
            <mypulldown>
                <div slot= "pullList" :style = "{minHeight:listViewH + 'px'}">
                    <!-- driver -->
                    <myorderdriver :options="xqTaskList" title="xq"></myorderdriver>
                    <!-- 车次异常 -->
                    <div @click="truckExBoxShow()" class="togTruckShow">
                        该车次<span style="font-size:0.9rem;color:#FFD91E;padding:0.3rem;">{{truckExList.length}}</span>条异常
                        <span style="color:#666;" slot="icon" class="iconfont">{{{truckExIcon}}}</span>
                    </div>
                    <div class="truckEx_box" id="truckEx_box" style="display: none">
                        <div class="yc_box" v-for="truckEx in truckExList" @click="openTruckExDetail($index)">
                            <div style="position:absolute;top:0.5rem;left:0.5rem;"  v-if="truckEx.backPic.length > 0">
                                <img v-for="exImg in truckEx.backPic | limitBy 2" track-by="$index" class="yc_img" :src="exImg">
                            </div>
                            <div style="position:absolute;top:0.5rem;left:0.5rem;"  v-if="truckEx.backPic.length == 0">
                                <img class="yc_img" src="../img/noPic.jpg">
                            </div>
                            <p class="yc_content">{{truckEx.texText}}</p>
                        </div>
                    </div>

                    <!-- 该车次的订单 -->
                    <myorderlist :options="orderList"></myorderlist>
                    <div class="noData">{{noOrderData}}</div>

                    <!-- 加载指示器 -->
                    <div class="sw-spinner" v-if="orderLoadMore">
                        <mt-spinner type="snake" color="#FFD91E"></mt-spinner>
                    </div>
                </div>
            </mypulldown>
            
              
        </div>

        <!-- 导航 -->
        <mt-popup class="maxPop" :visible.sync="mapShow" position="bottom">
            <ul class="mapTypeBox"> 
               <li @click="chooseMapType('baidu')">
                   <img src="../img/baidu.jpg">
                   <p>百度地图</p>
               </li>
               <li @click="chooseMapType('gaode')">
                   <img src="../img/gaode.jpg">
                   <p>高德地图</p>
               </li> 
               <li @click="chooseMapType('tengxun')">
                   <img src="../img/tengxun.jpg">
                   <p>腾讯地图</p>
               </li>      
            </ul>
            <div style="border-top:1px solid #e5e5e5;text-align: center;" @click="mapShow=false">
                <p style="padding:0.5rem;" @click="mapShow=false">取消</p>
            </div>
        </mt-popup>

        <!-- 地址 -->
        <mt-popup class="maxPop" :visible.sync="addressShow" position="bottom">
            <div class="addressBoxTitle">
                <span style="float:left;">请确定地址</span>
                <span style="float:right;" @click="addressShow = false">取消</span>
            </div>
            <div class="addressBox" style="padding:0.5rem">
                <div class="addressOne">
                    <p>发货地址：</p>
                    <div class="addressLine">
                        <input style="width:40%" class="smallVal" v-model="startCity" type="text" placeholder="城市">
                        <input style="width:58%" class="smallVal" v-model="startRoad" type="text" placeholder="区、街道/路">
                        <mt-button class="goGPSBtn" size="small" @click="openGPS(startCity,startRoad)" >前往</mt-button> 
                    </div>
                    
                </div>
                <div class="addressOne">
                    <p>收货地址：</p>
                    <div class="addressLine">
                        <input style="width:40%" class="smallVal" v-model="endCity" type="text" placeholder="城市">
                        <input style="width:58%" class="smallVal" v-model="endRoad" type="text" placeholder="区、街道/路">
                        <mt-button class="goGPSBtn" size="small" @click="openGPS(endCity,endRoad)" >前往</mt-button>
                    </div>
                    
                </div>                
            </div>
        </mt-popup>

        <!-- 分享 -->
        <mt-popup class="maxPop" :visible.sync="shareShow" position="bottom">
            <ul class="mapTypeBox"> 
               <li @click="chooseShareType('weChat')">
                   <span slot="icon" class="iconfont" style="font-size: 1.8rem;color:#00D278;">&#xe636;</span>
                   <p>微信好友</p>
               </li>
               <li id="onMenuShareTimeline">
                   <span slot="icon" class="iconfont" style="font-size: 1.8rem;color:#7ed200;">&#xe888;</span>
                   <p>朋友圈</p>
               </li> 
               <li @click="chooseShareType('QQ')">
                   <span slot="icon" class="iconfont" style="font-size:1.8rem;color:#1A94FF;">&#xe616;</span>
                   <p>QQ好友</p>
               </li>      
            </ul>
            <div style="border-top:1px solid #e5e5e5;text-align: center;" @click="shareShow=false">
                <p style="padding:0.5rem;" @click="mapShow=false">取消</p>
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
import  Myorderlist from '../components/myorderlist'
import  Myorderdriver from '../components/myorderdriver'
import  Mypulldown from '../components/mypulldown'//引入下拉刷新的组件
export default {
    components: {
        Myorderlist,
        Myorderdriver,
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
            ttdriverId:'',//driverId
            sessionId:'',
            truckEOk:false,
            orderOK:false,
            xqTaskList:[],//任务详情数据
            ttId:'',//车次ID 
            truckExList:[],//车次异常列表
            truckExShow:false,//是否展开车次异常  
            truckExIcon:'&#xe611;',//是否展开车次异常的icon

            orderList:[],
            orderCurrPage:1,
            orderLoadMore:false,
            orderLoadMax:false,
            orderloading:false,
            noOrderData:'',

            orderData:'',//订单数据
            truckExDetail:{},//车次异常详情
            truckExIndex:'',//车次异常角标
            
            tchOrderId:'',
            exIndex:'',//订单异常的角标
            // ExBack:'',//是否从异常修改后回来

            startCity:'',//开始位置的城市
            startRoad:'',//开始位置的区、街道、路
            endCity:'',//终点位置的城市
            endRoad:'',//终点位置的区、街道、路
            mapType:'',//打开导航的地图类型

            shareOrder:'',//分享的订单详情

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
            self.listViewH = $("#taskDetailContainer").height() -10;
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
                self.ttId = Tokens.fetch("taskDetailId");
                self.ttdriverId = Tokens.fetch("tdDriverId")
                self.truckEOk = false;
                self.orderOK = false;
                // 重置车次异常及列表
                self.truckExList = [];
                self.getTruckDetail();
                self.getTruckEx();
                //进入任务详情页面后，重置该车次的订单列表
                // self.orderList = [];
                self.orderCurrPage = 1;
                self.orderLoadMore = false;
                self.orderLoadMax = false;
                self.orderloading = false;
                self.noOrderData = '';
                self.getOrderList ();
            }, 1000);
        },
        wxgetPic(tohId){//微信调图
            let self = this;
            if(browserType=="android"){
                window.Photo.selectPictures();
                self.$nextTick(() =>{
                    setTimeout(function(){
                        let imgData = window.Photo.getPics();
                        let imgArr = JSON.parse(imgData).imgs;
                        let imagesArr = [];
                        for(let k=0;k<imgArr.length;k++){
                            let imgStr = "data:image/jpg;base64," + imgArr[k].img;
                            imagesArr.push(imgStr)
                        }
                        doAjaxUpload(
                            "multiple",
                            {
                                imgparams : imagesArr.join("@"),
                                mode : "order",
                                id : tohId,
                                type : "sign"
                            },
                            function(data){
                                self.$transfer.showToast(self, "回单上传成功");
                            }
                        )
                    },500)
                })
            }else{
                weChatChooseImage(function(localIds){//通过微信方法获取图片
                    self.$Indicator.open();
                    weChatUploadImg(localIds,function(result){//将本地图片上传到微信服务器
                        let _data = {
                            media_ids_arr:result.join("@"),
                            mode:"order",
                            id:tohId,
                            type:"sign"
                        };
                        doWxAjaxUpload(_data,function(data){//将图片上传到数据库
                            self.$Indicator.close();
                            self.$transfer.showToast(self, "回单上传成功");
                        })
                    })
                })
            }
            let as = document.querySelectorAll('.orderList');
            Array.from(as).forEach(function(item,index){
                item.style.WebkitTransform = "translateX(" + 0 + "px)";
            })
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
        shareOrder(order){//分享
            let self = this;
            let isStop = isXLorClick();
            if(isStop){ 
                $(".myorderlist").removeClass("active_border");
                return;
            }
            self.shareOrder = order;
             //  需要做android 原生分享。
            // alertShow("微信朋友分享");
            window.JSToAndroid.shareText();
        },
        goNavigator(order){//去导航，判断发货地址和收货地址
            // 发货人地址   tohStartDistrictName      tohStartAddress
            // 始发站地址   tohStartOrgDistrictName   tohStartOrgAddress
            // 收货人地址   tohEndDistrictName        tohEndAddress
            // 目的站地址   tohEndOrgDistrictName     tohEndOrgAddress        
            let self = this;
            let isStop = isXLorClick();
            if(isStop){ 
                $(".myorderlist").removeClass("active_border");
                return;
            }
            if(order.tchStage=='TH'){//提货：发货人和始发站
                self.startCity = order.tohStartDistrictName.replace("-",'');
                self.startRoad = order.tohStartAddress;
                self.endCity = order.tohStartOrgDistrictName.replace("-",'');
                self.endRoad = order.tohStartOrgAddress;
            }else if(order.tchStage=='SH'){//送货：目的站和收货人
                self.startCity = order.tohEndOrgDistrictName.replace("-",'');
                self.startRoad = order.tohEndOrgAddress;
                self.endCity = order.tohEndDistrictName.replace("-",'');
                self.endRoad = order.tohEndAddress;

            }else if(order.tchStage=='ZC'){//整车：发货人和收货人
                self.startCity = order.tohStartDistrictName.replace("-",'');
                self.startRoad = order.tohStartAddress;
                self.endCity = order.tohEndDistrictName.replace("-",'');
                self.endRoad = order.tohEndAddress;
                
            }else if(order.tchStage=='GX'){//干线：如果是tohType1=MM或MZ，始发站，否则发货人，如果是tohType1=MM或ZM，目的站，否则收货人
                if(order.tohType1== 'MM' || order.tohType1== 'MZ'){
                    self.startCity = order.tohStartOrgDistrictName.replace("-",'');
                    self.startRoad = order.tohStartOrgAddress;
                }else{
                    self.startCity = order.tohStartDistrictName.replace("-",'');
                    self.startRoad = order.tohStartAddress;
                }

                if(order.tohType1== 'MM' || order.tohType1== 'ZM'){
                    self.endCity = order.tohEndOrgDistrictName.replace("-",'');
                    self.endRoad = order.tohEndOrgAddress;
                }else{
                    self.endCity = order.tohEndDistrictName.replace("-",'');
                    self.endRoad = order.tohEndAddress;
                }     
            }
            self.mapShow = true;  
        },
        truckAddExtremelyShow (ttId){
            let self = this;
            let isStop = isXLorClick();
            if(isStop){ return;}
            let params = self.ttId + '-add'
            self.go('/taskTruckAddExtremely',params);
        },
        orderDetailShow (index){//显示订单详情页面
            let self = this;
            let isStop = isXLorClick();
            if(isStop){ 
                $(".myorderlist").removeClass("active_border");
                return;
            }
            self.$Indicator.open();
            self.orderData = self.orderList[index];
            Tokens.save("orderData",self.orderData);
            self.go('/taskOrderDetail'); 
            self.$Indicator.close();
        },
        extremelyShow (index,tohExId){//显示订单异常发起页面
            let self = this;
            let isStop = isXLorClick();
            if(isStop){ 
                $(".myorderlist").removeClass("active_border");
                return;
            }
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
        modifiedShow (index,tchId,tohId){//查看修改记录
            let self = this;
            let isStop = isXLorClick();
            if(isStop){ 
                $(".myorderlist").removeClass("active_border");
                return;
            }
            let keyId = tchId ? tchId : tohId;
            self.go('/taskOrderModified' ,keyId); 
        },
        ConfirmBtn (index,text,sd){//确认还是取消按钮 
            let self = this;
            let isStop = isXLorClick(); 
            if(isStop){ 
                $(".myorderlist").removeClass("active_border");  
                return;
            }
            let doText = text;
            self.$MessageBox.confirm('确定要操作'+doText+'?')
            .then(action => {    
                let type = self.orderList[index].ttStage;
                let status = self.orderList[index].tchStatus;
                let tchId = self.orderList[index].tchId;
                let tchLoadUserId = self.orderList[index].tchLoadUserId;
                let tchModifyDate = self.orderList[index].tchModifyDate;
                let cargoStatus = '';
                let opType = '';
                let btnText = '';
                if(sd){//从送达按钮过来会带参数sd，执行确认送达操作
                    cargoStatus = 20 ;
                    opType = 'transfer';
                }else{
                    if(type == 'SH'){
                        if(status == '01' || status == 10){
                            cargoStatus = 20 ;
                            opType = 'transfer';
                        }else{
                            if(tchLoadUserId == '*'){
                               cargoStatus = '01' ; 
                            }else{
                                cargoStatus = 10 ;
                            }   
                            opType = 'cancel_transfer';
                        }

                    }else if(type == 'ZC'){
                        if(status == '01'){
                            cargoStatus = 10 ;
                            opType = 'transfer';
                        }else if(status == 10){
                            cargoStatus = '01' ;
                            opType = 'cancel_transfer';
                        }else if(status == 20){
                            if(tchLoadUserId == '*'){
                               cargoStatus = '01' ; 
                            }else{
                                cargoStatus = 10 ;
                            }
                            opType = 'cancel_transfer';
                        }

                    }else{
                        if(status == '01'){
                            cargoStatus = 10 ;
                            opType = 'transfer';
                        }else if(status == 10){
                            cargoStatus = '01' ;
                            opType = 'cancel_transfer';
                        }else{
                            self.$transfer.showToast(self, "已送达，不可取消");
                            return;
                        }

                    }
                }
                

                let s = {   action:"/tmTask/execute",
                            params:{data:{cargo:[{'tchId':tchId,'tchModifyDate':tchModifyDate}]},
                            opType:opType,
                            jjbtn:'',
                            cargoStatus:cargoStatus}
                        };
 
                self.$Indicator.open();
                // 执行修改订单状态
                doAjaxUpdate(s,function(data) {
                    if(data.status == 0){
                        self.$transfer.backLogin(self, data);
                    }else if(data.status == 1){
                        // 状态修改成功后重新调整页面的数据显示
                        self.orderList[index].tchStatus = cargoStatus;
                        self.orderList[index].btnText = self.CheckBtnText(type,cargoStatus);
                        if(sd){
                            self.orderList[index].tchLoadUserId = '1';
                        }

                        // 根据按钮的宽度调整左滑的位置
                        self.$nextTick(()=>{
                            setTimeout(function(){
                                // 重置页面的计数
                                self.xqTaskList[0].ttCount = data.outParams.rows[0].ttCount;
                                self.xqTaskList[0].ttLoadCount = data.outParams.rows[0].ttLoadCount;
                                self.xqTaskList[0].ttUnloadCount = data.outParams.rows[0].ttUnloadCount;
                                let orderList = document.getElementById("orderList"+index);
                                let tranWidth = $("#cardBox" + index).width();
                                orderList.style.WebkitTransform = "translateX(" + -tranWidth + "px)";
                            });
                        }); 
                        
                    }
                    self.$Indicator.close();
                }); 
            }).catch(function(){})

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
        backPage(){//返回哪个页面
            let self = this;
            let backPath = Tokens.fetch("taskDetailBackPath");
            if(backPath.indexOf('/taskList')!= -1 && self.subSystem == 'SJ'){
                let allJoinSJ = 'YES';
                for(var i=0;i<self.orderList.length;i++){
                    if(self.orderList[i].tchStatus < 20){
                        allJoinSJ = 'NO';
                    }
                }
                Tokens.save("allJoinSJ",allJoinSJ);
            }
            self.back(backPath);
        },
        truckExBoxShow(){//是否显示车次异常
            let self = this;
            let isStop = isXLorClick();
            if(isStop){ 
                $(".myorderlist").removeClass("active_border");
                return;
            }
            if(self.truckExIcon == '&#xe611;'){
                self.truckExIcon = '&#xe66b;'

                $("#truckEx_box").slideDown();
            }else{
                self.truckExIcon = '&#xe611;'
                $("#truckEx_box").slideUp();
                
            }
        },
        getTruckDetail(){//获取车次的司机信息
            let self = this;
            let s = {   action:"/tmTask/query",
                        params:{ttId:self.ttId}
                    };
            if(self.ttdriverId != '*'){
                s.params.ttDriverId = self.ttdriverId;
            }
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
                        self.xqTaskList = obj;  
                    }else{
                        self.xqTaskList = [];
                    }
                }

             });

        },
        getTruckEx(){//获取车次异常
            let self = this;
            if(!self.ttId){
                self.$Indicator.close();
                self.$transfer.showToast(self, "信息丢失!");
                return;
            }
            let s = {   action:"/tmEx/query2",
                        sessionId:self.sessionId,
                        params:{"texTaskId":self.ttId}
                    };
            self.truckExList = [];
            doAjaxQuery(s,function(data) {
                if(data.status == 0){
                    self.$transfer.backLogin(self, data);
                }else if(data.status == 1){
                    let obj = data.dataset.rows;
                    if(obj && obj.length > 0){
                        obj.forEach(function(item, index){
                            item.backPic = [];
                            if(item.texPic && (item.texPic !='*') && (item.texPic !='[]')){
                                item.texPic = item.texPic.split(',');
                                item.texPic.forEach(function(itemPic, index){
                                    if(itemPic != ''){
                                        itemPic = getImgURL() + 'tmEx/' + itemPic;
                                        item.backPic.push(itemPic);
                                    }
                                })
                            }
                        })  
                    }

                    self.truckExList = obj;
                    
                }
                self.truckEOk = true;
                if(self.truckEOk && self.orderOK){
                    self.$Indicator.close();
                }
            });

        },
        openTruckExDetail (index){//进入车次异常详情
            let self = this;
            let isStop = isXLorClick();
            if(isStop){ 
                $(".myorderlist").removeClass("active_border");
                return;
            }
            self.truckExDetail = self.truckExList[index];
            Tokens.save("truckExDetail",self.truckExDetail);
            let params = self.ttId + '-detail'
            self.$transfer.go(self, '/taskTruckAddExtremely',params);
        },
        orderloadMore () {//任务详情页订单是否加载更多
            let self = this;
            let isStop = isXLorClick();
            if(isStop){return;}
            if(!self.orderloading  && !self.orderLoadMax && self.orderCurrPage >1 ){
                self.orderloading = true;
                self.orderLoadMore = true;
                setTimeout(function(){
                    self.getOrderList(self.ttId);
                },1000)
                       
            }else{
                return;
            }

        },
        getOrderList () {//获取任务订单
            let self = this;
            let s = {   action:"/tmCargoHead/query1",
                        sessionId:self.sessionId, 
                        pageIndex:self.orderCurrPage,
                        pageSize:10,
                        params:{"tchTaskId":self.ttId}
                    };
            self.orderLoadMax = false;
            self.noOrderData = "";
            doAjaxQuery(s,function(data) {
                if(data.status == 0){
                    self.$transfer.backLogin(self, data);
                }else if(data.status == 1){
                    let obj = data.dataset.rows;
                    console.log(obj)
                    if(obj && obj.length>0){
                        obj.forEach(function(item, index){
                                item.subSystem = self.subSystem;
                                item.browserType = browserType;
                                if(!item.tohOrderNo ||item.tohOrderNo == '*' || item.tohId == item.tohOrderNo){
                                    item.tohOrderShow = item.tohId;
                                }else{
                                    item.tohOrderShow = item.tohId+ '/' +item.tohOrderNo;
                                }

                                item.tchStatus = parseInt(item.tchStatus);

                                //收发详细地址
                                item.StartAddress = item.tohStartProvinceName+item.tohStartDistrictName+item.tohStartAddress;
                                item.EndAddress = item.tohEndProvinceName+item.tohEndDistrictName+item.tohEndAddress;
                                //收发区域
                                item.startArea = item.tohStartDistrictName.split('-')[0];
                                if(item.startArea && item.startArea.length > 4){ item.startArea = item.startArea.substring(0, 4) ;}

                                item.endArea = item.tohEndDistrictName.split('-')[0];
                                if(item.endArea && item.endArea.length > 4){ item.endArea = item.endArea.substring(0, 4) ;}
  
                                //左滑按钮的文字显示
                                item.btnText = self.CheckBtnText(item.tchStage , item.tchStatus);
                                item.tchDetail = JSON.parse(item.tchDetail);

                                //订单状态条
                                item.tchStatusTitle = tchStatusTitle[item.tchStage].split('-');
                        });

                        //判断是替换还是增加
                        if(self.orderCurrPage == 1){
                            self.orderList = obj;
                        }else{
                            self.orderList = self.orderList.concat(obj);
                        }   
                        // 设置左滑效果
                        self.$nextTick(()=>{
                            setTimeout(function(){
                               self.$transfer.translationConfirm(".orderList","cardBox");
                            },1000)
                        }); 

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
                    if(self.isLoadId){
                        self.$nextTick(()=>{
                            self.$broadcast('onTopLoaded', self.isLoadId); 
                            self.isLoadId = null;
                        }) 
                    }
                }
                self.orderOK = true;
                if(self.truckEOk && self.orderOK){
                    self.$Indicator.close();
                }

                self.orderLoadMore = false;
                self.orderloading = false;

             });
        },
        CheckBtnText(type , status){//判断左滑按钮上显示的文字
            let btnText = '';
            if(type == 'TH'){
                btnText = status == '01' ? '提货确认' :
                          status == '10' ? '取消提货' :
                                           '收货完成';
            }else if(type == 'ZC'){
                btnText = status == '01' ? '提货确认' :
                          status == '10' ? '取消提货' :
                                            '取消送达';
            }else if(type == 'SH'){
                btnText = (status == '01' || status == '10') ? '送达' :
                                                             '取消送达';
            }
            return btnText;

        },
        chooseMapType(type){
            let self = this;
            self.mapShow = false;
            self.addressShow = true;
            self.mapType = type;
        },
        openGPS(city,road){
            let self = this;
            self.addressShow = false;
          
            if(self.mapType == 'tengxun'){//腾讯
                localStorage.setItem("city1",city+road);   
                if (browserType=="weixin") { 
                    let mapUrl='http://apis.map.qq.com/uri/v1/search?keyword='+city+'&region='+road+'&referer=myapp'
                    Tokens.save("mapUrl",mapUrl);
                    self.go('/showMap');
                    return;
                }
                var address= localStorage.getItem("city1");
                window.AndroidMap.openSosoMap(address);   

            }else if(self.mapType == 'baidu'){//百度
                localStorage.setItem("city",city+road);       
                if (browserType=="weixin") {
                    let mapUrl ='http://api.map.baidu.com/geocoder?address=' + city + road +'&output=html&src=yourCompanyName|yourAppName';
                    Tokens.save("mapUrl",mapUrl);
                    self.go('/showMap');
                    return;
                };
                var add= localStorage.getItem("city");
                window.AndroidMap.openBaiDuMap(add);
            }else if(self.mapType == 'gaode'){//高德
                localStorage.setItem("address",city+road);
                if (browserType=="weixin") {
                    let mapUrl='http://uri.amap.com/search?keyword=' + city + road + '&view=map&src=mypage';
                    Tokens.save("mapUrl",mapUrl);
                    self.go('/showMap');
                    return;
                };
                var  address= localStorage.getItem("address");
                window.AndroidMap.openGaoDeMap(address);
            }
        },
        chooseShareType(type){
            let self = this;
            // self.shareShow = false;
            // if(type == 'weChat'){//微信
            //     wxOnMenuShareAppMessage("测试11",'推流分享测试88888','http://www.baidu.com','http://tiulo-dbcon.oss-cn-hangzhou.aliyuncs.com/user/00094_161215185441109S3829R7516_head.gif')
            // }else if(type == 'friends'){//朋友圈
            //     wxOnMenuShareTimeline("测试11",'推流分享测试88888','http://www.baidu.com','http://tiulo-dbcon.oss-cn-hangzhou.aliyuncs.com/user/00094_161215185441109S3829R7516_head.gif');
            // }else if(type == 'QQ'){//QQ
            //     wxOnMenuShareQQ("测试11",'推流分享测试88888','http://www.baidu.com','http://tiulo-dbcon.oss-cn-hangzhou.aliyuncs.com/user/00094_161215185441109S3829R7516_head.gif')
            // }

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
                    self.orderList = [];
                    self.orderCurrPage = 1;
                    self.orderLoadMore = false;
                    self.orderLoadMax = false;
                    self.orderloading = false;
                    self.noOrderData = '';
                    self.getOrderList ();
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
            self.isLoadId = null;
            //从上一级页面进来或后一级页面刷新过了或本页刷新，重新获取数据
            if( !from.path || (from.path.indexOf('taskList') != -1)|| (from.path.indexOf('traceList') != -1)|| (from.path.indexOf('opMsgList') != -1) || (from.path.indexOf('taskList')== -1 && from.path.indexOf('traceList') == -1 && from.path.indexOf('opMsgList') == -1 && self.xqTaskList.length == 0 && self.orderList.length == 0)){
                self.ttId = Tokens.fetch("taskDetailId");
                self.ttdriverId = Tokens.fetch("tdDriverId")
                self.truckEOk = false;
                self.orderOK = false;
                // 重置车次异常及列表
                self.truckExList = [];
                self.$Indicator.open();
                self.getTruckDetail();
                self.getTruckEx();
                //进入任务详情页面后，重置该车次的订单列表
                self.orderList = [];
                self.orderCurrPage = 1;
                self.orderLoadMore = false;
                self.orderLoadMax = false;
                self.orderloading = false;
                self.noOrderData = '';
                self.getOrderList ();
                self.$nextTick(()=>{
                    $('#taskDetailContainer').animate({scrollTop:0},0);   
                })

            }else if(from.path.indexOf('taskTruckAddExtremely')!= -1){
                    // 如果是从车次异常回来重置车次异常及列表
                    self.truckEOk = false;
                    self.$Indicator.open();
                    self.getTruckEx();

            }else if((from.path.indexOf('taskOrderAddExtremely')!= -1) || (from.path.indexOf('taskOrderExtremely')!= -1)){
                // 如果是从订单异常回来重置'异'字的背景色 
                self.orderList = Tokens.fetch('taskOrderList');

                // 重置scrollTop
                let preSrollTop = Tokens.fetch("taskDetailContainer");
                self.$nextTick(()=>{
                    $('#taskDetailContainer').animate({scrollTop:preSrollTop},0); 
                })
            }else{
                // 重置scrollTop
                let preSrollTop = Tokens.fetch("taskDetailContainer");
                self.$nextTick(()=>{
                    $('#taskDetailContainer').animate({scrollTop:preSrollTop},0);   
                })

            }
            //需要返回的路径
            if(from.path && ((from.path.indexOf('taskList')!= -1) || (from.path.indexOf('traceList')!= -1) || (from.path.indexOf('opMsgList')!= -1))){
                Tokens.save("taskDetailBackPath",'');
                Tokens.save("taskDetailBackPath",from.path);
            }
            next()
        },
        deactivate ({ next }) {
            //Triggers when component destroys
            let self = this;
            let as = document.querySelectorAll('.orderList');
            Array.from(as).forEach(function(item,index){
                item.style.WebkitTransform = "translateX(" + 0 + "px)";
            })
            next()
        },
        canDeactivate({to, from, next}) {
            let self = this;
            if(to.path.indexOf('taskList') != -1){
                $("#truckEx_box").slideUp();
                self.truckExIcon = '&#xe611;';
            }     
            let scrollTop = $("#taskDetailContainer").scrollTop();
            Tokens.save("taskDetailContainer",scrollTop);

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
.mapTypeBox{
    width:100%;background:#fff;
    padding:0.5rem;
    z-index:1200;
    box-sizing: border-box;
}
.mapTypeBox li{
    display: inline-block;
    width:32%;
    text-align: center;
}
.mapTypeBox li img{
    width:2rem;
    margin:0.4rem 0;
}
.mapTypeBox li p{
    font-size:0.6rem;
}
.addressBoxTitle{
    height:2rem;
    line-height:2rem;
    overflow: hidden;
    padding:0 0.5rem;
    border-bottom:1px solid #e5e5e5;
}
.addressBox{
    padding:0.5rem;
    box-sizing: border-box;
}
.addressLine{
    box-sizing: border-box;
    position: relative;
    padding-right:3rem;
}
.goGPSBtn{
    background:#353535;
    color:#FFD91E;
    height:1.6rem;
    position: absolute;
    right:0;
    top:0;
}
.addressBox .smallVal{
    display: inline-block;
    -webkit-appearance:none;
    padding: 0.4rem 0.5rem;
    box-sizing: border-box;
    border:1px solid #e5e5e5;
    border-radius: 0.3rem;
    font-size:0.65rem;
}
.addressBox .addressOne{
    margin-bottom:0.7rem;
}
.addressBox .addressOne p{
    padding:0.2rem 0.5rem;
}
/*车次异常*/
.yc_box{
    padding:0.5rem 0.5rem 0.5rem 7.5rem;
    position:relative;
    overflow:hidden;
    height:4rem;
    border-bottom:1px solid #e5e5e5;
    background: #fff;
}

.yc_img{
    width:3rem;height:3rem;margin-right:0.5rem;border:1px solid #e5e5e5;border-radius:0.3rem;
}
.yc_content{
    padding-top:0.2rem;
    line-height:1.3rem;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
}
.togTruckShow{
    height:2.2rem;
    line-height: 2.2rem;
    background: #fff;
    text-align: center;
    border-bottom:1px solid #e5e5e5;
}

</style>
