<template>
    <div class="page" id="exDetailPage">  
        <mt-header fixed :title="exDetailData.texTitle">
            <mt-button icon="back" slot="left" @click="goBack()"></mt-button>
            
            <mt-button v-if="texStatus == 0" slot="right" @click.stop="listShow = !listShow">
                <span slot="icon" class="iconfont">&#xe65c;</span>
            </mt-button>
        </mt-header>

        <div class="container-top" :class="texStatus == '0' ? 'hasBottom' : 'noBottom'" id="recordBox"> 
            <div id="exContentBox">
                <div class="orderCell">
                    <span style="position: absolute;top:0.5rem;left:0.5rem">订单号</span>
                    <div style="width:100%">{{texOrderIdT}}</div>  
                    <span style="position: absolute;top:0.5rem;right:0.5rem;text-align:right;">{{texCreateDate}}</span>
                </div>
                <ul class="participant">
                    <li class="faqiMan">
                        <p>发起者</p>
                        <ul>
                            <li class="userImgLi" :style="{width:userImgW + 'px'}">
                                <div class="tex_user">
                                    <img class="userPic" :src="exDetailData.createUserLogo">   
                                </div>
                                <p class="userName" style="padding:0 0.5rem;">{{exDetailData.texCreateUser}}</p> 
                            </li>
                        </ul>
                    </li>
                    <li class="canyuMan">
                        <p>参与者</p>
                        <ul id="addUserBox" style="overflow: hidden">
                            <li class="userImgLi" v-for="texUser in texUsers"  @click.stop="showDelIcon($index)">
                                <div v-if="texUser.suId != exDetailData.texCreateUserId" :style="{width:userImgW + 'px'}" style="max-width: 3.5rem;">
                                    <div class="tex_user">
                                        <img class="userPic" :src="texUser.suLogo">   
                                    </div>
                                    <p class="userName">{{texUser.suName}}</p>
                                </div>
                                <span id="uDel-{{$index}}" class="iconfont userDelIcon" slot="icon" @click.stop="deleteExUser($index,texUser.suId)">&#xe6cf;</span>
                            </li>
                            <!--添加参与者 -->
                            <li v-if="texStatus == 0  && (userId== exDetailData.texCreateUserId  || isAdmin=='1' || isAdmin2=='1' || adminOrgIds.indexOf(exDetailData.texOrgId) >0)">                                                             
                                <div style="display: inline-block;border:none">
                                    <div :style="{width:userImgW + 'px'}" style="padding:0.5rem;max-width: 3.5rem;" class="userAddBox" @click="goAddExUser()">
                                       <img class="userPic" src="../img/add.png"> 
                                    </div>
                                    <p>&nbsp;</p>  
                                </div>
                            </li>
                        </ul>
                    </li>
                </ul>
                <!-- 异常详情 -->
                <div @click="showOrHide('exDelIcon','exConBox')" class="exLineTitle">
                    <span>详情</span>
                    <span slot="icon" class="iconfont">{{{exDelIcon}}}</span>
                </div>
                <div class="exConBox">
                    <p style="line-height: 1.3rem;padding:0.5rem;">{{exDetailData.texText}}</p>
                    <div class="exImgBox" v-for="oldI in oldImages" id="old-{{$index}}" track-by="$index">
                        <img  class="ex_img" :src="oldI" @click.stop="showBigPic('old',$index,oldI)">   
                        <span v-if="texStatus == 0 && (userId== exDetailData.texCreateUserId  || isAdmin=='1' || isAdmin2=='1' || adminOrgIds.indexOf(exDetailData.texOrgId) >0)" id="oDel-{{$index}}" class="iconfont delPicIcon" slot="icon" @click.stop="deletePic('old',$index,oldI)">&#xe6cf;</span>
                    </div> 
                    <div class="exImgBox" v-if="texStatus == 0 && (userId== exDetailData.texCreateUserId  || isAdmin=='1' || isAdmin2=='1' || adminOrgIds.indexOf(exDetailData.texOrgId) >0)">
                        <img class="ex_img" src="../img/camera.jpg" @click="addExPic()">
                    </div> 
                </div>

                <!-- 异常总结 -->
                <div class="exSummedBox" v-show="texStatus == 'summed'">
                    <div class="exLineTitle" @click="showOrHide('exSumCIcon','exSummedContent')">
                        <span>异常总结</span>
                        <span slot="icon" class="iconfont">{{{exSumCIcon}}}</span>
                    </div>
                    <div class="exSummedContent">
                        <p style="line-height: 1.3rem;padding:0.5rem;">{{summedText}}</p>
                    </div>
                    <div class="exLineTitle" @click="showOrHide('exSumLIcon','exSummedList')">
                        <span>处理意见详情</span>
                        <span slot="icon" class="iconfont">{{{exSumLIcon}}}</span>
                    </div>
                    <div class="exSummedList" style="display: none;">
                        <div class="sumUserLi" v-for="YJ in yjList">
                            <img class="sumUserLogo" :src="YJ.showLogo">
                            <div class="sumUserName">{{YJ.showName}}</div>
                            <div class="sumUserSay">{{YJ.terText}}</div>
                            <div class="sumUserTotal">{{YJ.showTerAmt}}</div>
                            <div class="sumUserMoney" v-show="YJ.terAmt1 != 0">{{YJ.showTerAmt1}}</div>
                        </div>
                    </div>
                </div>
                <!-- 聊天记录 -->
                <div v-show="texStatus != 0" @click="showOrHide('exChatIcon','dialogBox')" class="exLineTitle">
                    <span>聊天记录<i style="font-size: 0.55rem;color:red" v-if="chattRecords.length == 0">（没有聊天记录）</i></span>
                    <span slot="icon" class="iconfont">{{{exChatIcon}}}</span>
                </div>
            </div> 
            <!-- 展开异常信息 -->
            <div @click="exDetailShow = true" v-show="!exDetailShow" class="exDetailBtn">
                展开异常信息
                <span style="color:#666;" slot="icon" class="iconfont">&#xe611;</span>
            </div> 

            <!-- 聊天框 -->
            <div class="dialogBox">
                <div v-for="(key,record) in chattRecords">
                    <div class="dialogLeft" v-if="!record.isMeSend">
                        <img class="dialogLeftImg" :src="record.sendLogo">
                        <div class="dialogText dialogLeftText">
                            <p class="dialogTime">{{record.temModifyDate}}</p>
                            <p v-if="record.temType == 'chat'">{{record.temText}}</p>
                            <img v-if="record.temType == 'pic'" style="width:4rem;" :src="record.temText">
                            <div  @click="showBigAndDel(key,$event)" cType="{{record.temType}}" cUrl="{{record.temText}}" class="dialogCover" style="width:100%;height:100%;position: absolute;top:0;left:0;"></div>
                        </div>
                        <div class="dialogaLeftArrow"></div>
                    </div>
                    <div class="dialogRight" v-if="record.isMeSend">
                        <img class="dialogRightImg" :src="record.sendLogo">
                        <div class="dialogText dialogRightText">
                            <p class="dialogTime">{{record.temModifyDate}}</p>
                            <p v-if="record.temType == 'chat'">{{record.temText}}</p>
                            <img v-if="record.temType == 'pic'" style="width:4rem;" :src="record.temText">
                            <div @click="showBigAndDel(key,$event)" cType="{{record.temType}}" cUrl="{{record.temText}}" class="dialogCover" style="width:100%;height:100%;position: absolute;top:0;left:0;"></div>
                        </div>
                        <div class="dialogaRightArrow"></div>
                    </div>
                </div>

            </div>

            <!-- 右上角选择框 -->
            <div  v-show = "listShow" class="listPOP_box">
                <div class="list_pop">
                    <ul>
                        <li @click="exSummary()">
                            <span style="padding-right:0.5rem;" slot="icon" class="iconfont">&#xe618;</span>异常总结
                        </li>
                        <li @click="exHandle()">
                            <span style="padding-right:0.5rem;" slot="icon" class="iconfont">&#xe618;</span>关闭/处理
                        </li>
                    </ul>
                </div>
                <div class="jiantou"></div> 
            </div>        
  
        </div>
        <!-- 聊天输入框 -->
        <div class="dialogImport" v-show="texStatus == 0">
           <!-- <span style="left:0.5rem;font-size:1rem" slot="icon" class="iconfont">&#xe62f;</span> -->
           <div class="dialogInput_box">
                <input @focus="beginInput()" v-model="sendValue" class="dialogInput" type="text">    
           </div>
           <span id="sendPic" v-show="sendValue == ''" style="right:0.5rem;font-size:1.35rem" slot="icon" class="iconfont">&#xe62e;</span>
           <mt-button v-show="sendValue != ''" size="small" id="sendContent">发送</mt-button>
        </div> 

        <!-- 撤消按钮 -->
        <mt-popup :visible.sync="cancelSendBtn" @click="cancelSendBtn = false">
            <div class="cancelBtn" :style="{top:cancelBtnTop +'px',left:cancelBtnLeft +'px'}">
                <span>撤消</span>
                <div class="cancelArrow"></div>
            </div>
        </mt-popup>
        <mt-popup :visible.sync="bigImgShow" position="center" class="popup_box" popup-transition="popup-fade">
            <div class="img_box" :style="{height:maxH+'px',lineHeight:maxH+'px'}">
                <img :src="bigImg" width="100%" class="imgC" :style="{maxHeight:maxH+'px'}">
            </div>
            <div class="close_img" @click.stop="close_img_pop()" :style="{left:contentWidth+'px'}">
                <!-- <span class="iconfont" style="font-size:2rem;color:#fff;">&#xe660;</span> -->
                <img src="../img/cha.png" width="40">
            </div>
        </mt-popup>      
    </div>
</template>

<script>
// Ajax request module, return a Promise
import Tokens from '../token'
export default {
    data () {
        return {
            token:'',
            adminOrgIds:'',
            isAdmin:'',
            isAdmin2:'',
            listShow:false,
            userId:'',//driverId 默认为userId
            subSystem:'', 
            sessionId:'',
            tchOrderId:'',//返回异常列表的Id
            oldImages:'',//异常图片
            chatPic:[],//聊天的图片
            texUsers:[],//异常参与者
            texOrderIdT:'',
            texCreateDate:'',//异常发起的时间
            texId:'',//异常Id
            exDetailData:'',//异常详情数据 
            exDelIcon:'&#xe611;',//详情下拉箭头
            exSumCIcon:'&#xe611;',//总结下拉箭头
            exSumLIcon:'&#xe611;',//处理意见下拉箭头
            exChatIcon:'&#xe611;',//聊天下拉箭头
            exDetailShow:true,//显示异常信息
            texStatus:'',//该异常的状态

            sendValue:'',//聊天需要发送的内容
            chattRecords:[],//聊天记录

            curr_key1:'',
            curr_user_url:'',
            publicHome_url:'',
            orgAdmin_url:'',
            closeSocket:false,
            sendTime:0,

            cancelSendBtn:false,//撤销按钮的popup
            cancelBtnTop:0, //按钮上边距
            cancelBtnLeft:0,  //按钮的下边距
            cancelIndex:'',  //做取消的角标 

            userImgW:'',//参与者图片的宽度
            userImgH:'',//参与者图片的高度

            fromPage: "",//来自哪个页面
            updateTime:'',//重新获取聊天数据的定时器

            hasJurisdiction:false,//是否拥有总结的权限
            summedText:'',//总结的内容
            yjList:[],//意见列表
            bigImgShow:false,//Android显示大图
            bigImg:'',//大图路径
            imgTop:0,
            maxH:0,
            contentWidth:0,
        }
    },
    ready(){
        let self = this;
        $("#exDetailPage").off().on("click",function(){
            $(".delPicIcon").hide();
            $(".userDelIcon").hide();
            self.listShow = false;
        });
        // self.imgTop = ($('.popup_box').height() - 44 - $('.imgC').height())/2;//预览图片居中
        self.contentWidth = Tokens.fetch("contentWidth")/2-22;
        console.log(self.contentWidth)
        self.maxH = $('.popup_box').height() - 44;
        let imgBoxW = document.getElementById('addUserBox').offsetWidth;
        self.userImgW = parseInt(imgBoxW)/5*0.95;
        // self.$nextTick(()=>{
        //     self.imgTop = ($('.popup_box').height() - 44 - $('.imgC').height())/2;//预览图片居中
        // // console.log($('.popup_box').height())
        //     console.log($('.imgC').height())
        // })
    },
    watch:{
        'exDetailShow': function(argument){//切换订单异常显示和隐藏
            let self = this;
            if(argument){
               $("#exContentBox").show(); 
           }else{
            $("#exContentBox").hide();
           }
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
        //根据进来页面的不同, 返回不同的上一级页面
        goBack(){
            let self = this;
            let backPath = Tokens.fetch("taskOrderExDetailBackPath");
            if(backPath.indexOf('exManage') != -1){
                Tokens.save("exManageChange",self.texId + '|' +self.texStatus)
            }
            self.back(backPath);  
        },
        close_img_pop(){//android查看大图后返回
            let self = this;
            self.bigImgShow = false;
            self.bigImg = "";
        },
        beginInput(){
            let self = this;
            self.exDetailShow = false;
            let recordBox = document.getElementById('recordBox');
            $('#recordBox').animate({scrollTop:recordBox.scrollHeight},0);
        },
        getTexUser(){//获取异常参与者
            let self = this;
            let s = {   action:'/tmExUser/query',
                        params:{"teuExId":self.texId,"delCreateUser":self.exDetailData.startExUserId}
                    };
            doAjaxQuery(s,function(data) {
                if(data.status == 0){ 
                    self.$transfer.backLogin(self, data);
                }else if(data.status == 1){
                    let obj = data.dataset.rows; 
                    if(obj && obj.length>0){
                        obj.forEach(function(item, index){
                            let ImgObj = new Image();
                            item.suLogo = getImgURL() + 'user/' + item.suLogo;
                            ImgObj.src =  item.suLogo;
                            ImgObj.onerror = function(){
                                item.suLogo = getImgURL() + 'user/default.png';
                            }
                            item.suName = item.suName.length > 3 ? item.suName.substring(0,3) : item.suName;
   
                        })
                        self.texUsers = obj;
                    }
                    self.$Indicator.close();
                }
               
            });

        },
        goAddExUser(){//去添加参与者
            let self = this;
            let hiddenUserIds = [];
            let includeNotFriends = [];
            for(let i = 0;i<self.texUsers.length;i++){
                hiddenUserIds.push(self.texUsers[i].suId);
                if(self.texUsers[i].suId != self.exDetailData.texCreateUserId){
                    includeNotFriends.push(self.texUsers[i].suId);
                }
            }
            let params = {cmfUserId1:self.userId,cmfSubSystem:self.subSystem,hidden_userIds:hiddenUserIds.join(","),isFilterAdd:"true",include_notFriends:includeNotFriends.join(",")};
            Tokens.save("addExUserParams",params);
            let argument = '添加参与者' + '|'+self.texId;
            self.go('/add_member',argument);

        },
        addExUserList(){//从添加参与者回来  将新加的参与者保存到数据库和页面上
            let self = this;
            let addExUser = Tokens.fetch("exUserAddList");
            if(addExUser.length > 0){
                let newExUser = [];
                addExUser.forEach(function(item, index){
                    item.suName = item.suName.length > 3 ? item.suName.substring(0,3) : item.suName;
                    let oneUser = { rowId:index,state:"i",
                                    teuRecvUserId:item.suId,
                                    teuExId:self.texId,
                                    teuRecvOrgIds:"*",
                                    teuRecvSubSystem:"*"
                                  };
                    newExUser.push(oneUser)
                })
                let s = {   action:"/tmExUser/save",
                            commandType:"Update",
                            params:{teuExId:self.texId,teuRecvUserIdHidden:self.exDetailData.texCreateUserId}
                        };
                s.datasets = {dsData:{rows:newExUser}};
                
                self.$Indicator.open();
                doAjaxUpdate(s,function(data) {
                    if(data.status == 0){
                        self.$transfer.backLogin(self, data);
                    }else if(data.status == 1){
                        self.texUsers = self.texUsers.concat(addExUser);
                        self.$Indicator.close();
                    }
                     
                });
                
                
            } 

        },
        showDelIcon(index){//显示删除参与者按钮
            let self = this;
            if(self.texStatus == 0 && (self.userId== self.exDetailData.texCreateUserId  || self.isAdmin=='1' || self.isAdmin2=='1' || self.adminOrgIds.indexOf(self.exDetailData.texOrgId) >0)){
                $(".userDelIcon").hide();
                $("#uDel-"+index).show();
            }else{
                return;
            }
            
        },
        deleteExUser(index,suId){//删除异常参与者
            let self = this;
            let s = {   action:"/tmExUser/execute",
                        commandType:"Update",
                        params:{teuExId:self.texId,texId:self.texId,texUserId:suId,opType:"deleteTeu"}
                    };
            self.$Indicator.open();
            doAjaxUpdate(s,function(data) {
                if(data.status == 0){
                    self.$transfer.backLogin(self, data);
                }else if(data.status == 1){
                    self.texUsers.splice(index,1);
                    self.$Indicator.close();
                }
                 
            });
        },
        showOrHide(icon,box){//切换订单异常详情页面的详情显示和隐藏
            let  self = this;
            if(self[icon] == "&#xe611;"){
               self[icon] = "&#xe66b;" 
               $("." + box).slideDown();
               let currScrollTop = $("#recordBox").scrollTop();
               $('#recordBox').animate({scrollTop:parseFloat(currScrollTop) + 100},0);

            }else{
                let currScrollTop = $("#recordBox").scrollTop();
               $('#recordBox').animate({scrollTop:parseFloat(currScrollTop) - 100},0);
                self[icon] = "&#xe611;"
                $("." + box).slideUp();
            }

        },
        showBigAndDel(key,event){//异常图片显示大图和删除按钮
            let self = this;
            let el = $(event.target);
            if(self.chattRecords[key].temType == 'pic'){
                let currUrl = self.chattRecords[key].temText;
                let currUrl2 = currUrl.replace("chat", "chat_big");    
                let bigImg = [];//查看大图
                if(self.chatPic.length > 0){
                    self.chatPic.forEach(function(item, index){
                         item = item.replace("chat", "chat_big");
                         bigImg.push(item);
                    });
                }
                weChatPreviewImg(currUrl2,bigImg);
            }
            let width = el.width();
            let height = el.height();
            let left = el.offset().left;
            let top = el.offset().top; 
            //是否是自己发送的消息
            if(self.chattRecords[key].isMeSend && (self.chattRecords[key].temIsDelete == 1 || self.chattRecords[key].getType)){
                self.cancelSendBtn = true;
                self.cancelBtnTop = top - 40;
                self.cancelBtnLeft = left + width/2;
                self.cancelIndex = key;
            }
        },
        addExPic(){//添加异常图片
            let self = this;
            // android 原生选择上传图片
            if (browserType=="android") {
                window.Photo.selectPictures();
                self.$nextTick(() =>{
                    setTimeout(function(){
                        let imgData = window.Photo.getPics();
                        let imgArr = JSON.parse(imgData).imgs;
                        let imgArrs = [];
                        for(let k=0;k<imgArr.length;k++){
                            let imgStr = "data:image/jpg;base64," + imgArr[k].img;
                            imgArrs.push(imgStr)
                        }
                        doAjaxUpload(
                            "multiple",
                            {
                                imgparams : imgArrs.join("@"),
                                mode : "tmEx",
                                id : self.texId,//异常id
                                type : "ex"
                            },
                            function(data){
                                self.oldImages = self.oldImages.concat(data.vispath);
                                if(self.exDetailData.texPic && self.exDetailData.texPic.length < 5 ){
                                   self.exDetailData.texPic = ''; 
                                }
                                for(var i=0;i<data.vispath.length;i++){
                                    let PicPath = data.vispath[i].split("tmEx/")[1];
                                    self.exDetailData.texPic += PicPath +',';
                                }
                                self.$Indicator.close();
                            }
                        ) 
                    },500)
                })
            }else{
                weChatChooseImage(function(localIds){//通过微信方法获取图片
                    self.$Indicator.open();
                    weChatUploadImg(localIds,function(result){//将本地图片上传到微信服务器
                        let _data = {
                               media_ids_arr: result.join("@"),
                               mode : "tmEx",
                               id : self.texId,//异常id
                               type : "ex"
                        };
                        doWxAjaxUpload(_data,function(data){//将图片上传到数据库
                            self.oldImages = self.oldImages.concat(data.vispath);
                            if(self.exDetailData.texPic && self.exDetailData.texPic.length < 5 ){
                               self.exDetailData.texPic = ''; 
                            }
                            for(var i=0;i<data.vispath.length;i++){
                                let PicPath = data.vispath[i].split("tmEx/")[1];
                                self.exDetailData.texPic += PicPath +',';
                            }
                            self.$Indicator.close();      
                        })
                    })
                })
            }
                
        },
        showBigPic(type,Index,currUrl){//异常图片看大图和删除
            let self = this;
            let currUrl2 = currUrl;
            $(".delPicIcon").hide();
            if(type == "old"){
                $("#oDel-"+Index).show();
                currUrl2 = currUrl.replace("ex", "ex_big");
            }     
            let bigImg = [];//查看大图
            if(self.oldImages.length > 0){
                self.oldImages.forEach(function(item, index){
                     item = item.replace("ex", "ex_big");
                     bigImg.push(item);
                });
            }
            if(browserType=="android"){
                self.bigImgShow = true;
                self.bigImg = currUrl2;
            }else{
                weChatPreviewImg(currUrl2, bigImg);//预览图片
            }
            // weChatPreviewImg(currUrl2,bigImg);
        },
        deletePic(type,index,url){//删除异常图片
            let self = this;
            self.$MessageBox.confirm('确定要删除这张图片?')
            .then(action => { 
                $(".delPicIcon").hide();
                if(type=="old"){
                    //删除数据库的数据
                    let urlPath = url.split("tmEx/")[1];
                    let imgs = self.exDetailData.texPic.split(",");
                    imgs.pop();
                    imgs.splice(index,1);
                    let newDBpath = imgs.join(',')+",";
                    self.exDetailData.texPic = newDBpath;
                    doAjaxDelete(
                        "other",
                        {
                            delpath:urlPath,
                            mode:"tmEx",
                            id:self.texId,
                            type:"ex",
                            newDBpath:newDBpath
                        },
                        function(data){
                            if(data.status == 0){
                                self.$transfer.backLogin(self, data);
                            }else if(data.status == 1){
                                self.oldImages.splice(index,1);//删除页面上的数据
                            }
                        }
                    ) 
                }
            }).catch(function(){})        
            
        },
        exChatOpen (){//建立Sock连接
            let self = this;
            exEntry_ws = new SockJS('http://120.27.145.36:15674/stomp');//建立连接
            client = Stomp.over(exEntry_ws);
            client.heartbeat.outgoing = 0;
            client.heartbeat.incoming = 0;
            self.subscribe = true;
            let on_connect = function(x) {
                let id = client.subscribe(self.curr_user_url, function(d) {
                    console.log("headers: " + JSON.stringify(d.headers, null, 4));
                    if(d.headers.isHistory && d.headers.realRece!= self.curr_key1){
                        return;
                    }else if(d.headers.delMsg == 0 && d.headers.realRece!= self.curr_key1){
                        let delTemRemark = d.headers.temRemark;
                        for(var i=0;i<self.chattRecords.length;i++){
                            if(self.chattRecords[i].temRemark == delTemRemark){
                                self.chattRecords.splice(i,1);
                                break;
                            }
                        }
                        return;
                    }else{
                        let msgText = decodeURIComponent(d.body);
                        let isMe = d.headers.fromuserId == self.userId ? true : false;
                        let userLogo = getImgURL() +'user/' +d.headers.sendLogo;

                        let ImgObj = new Image(); 
                            ImgObj.src = userLogo; 
                            ImgObj.onerror = function(){
                                userLogo = getImgURL() + 'user/default.png';
                            }
                        if(d.headers.temType == 'pic'){
                            self.chatPic.push(msgText);
                        }

                        let msgData = { temType:d.headers.temType,
                                        temSendUserId:d.headers.sendMan,
                                        temModifyDate:d.headers.sendTime.replace(/tt/gi,":"),
                                        temText:msgText ,
                                        isMeSend:isMe,
                                        temRemark:d.headers.temRemark,
                                        getType:'online',
                                        sendLogo:userLogo
                                    };
                        self.chattRecords.push(msgData);

                        //发送消息后页面跳到最底部
                        self.$nextTick(()=>{
                            let recordBox = document.getElementById('recordBox');
                            $('#recordBox').animate({scrollTop:recordBox.scrollHeight},0); 
                        }) 
                    }

                    let update_Time=3000;
                    let longString=new Date().getTime();
                        clearInterval(self.updateTime)
                        self.updateTime = setInterval(function(){
                            self.updateMsgNum(); 
                            if(new Date().getTime()-longString>9000){//最后一次接收时间9s内进行更新
                                clearInterval(self.updateTime);  
                            }
                        },update_Time);

                    
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

            $('#sendContent').off("click").on("click",function(event){
                //{}中传递消息的附属信息 
                let temType = "chat";//暂用 chat
                // self.sendTime = newDate;
                let time2 = newDate.getFullYear()+"-"+((newDate.getMonth() + 1)< 10 ? "0" : "")+ (newDate.getMonth()+1)+"-"+(newDate.getDate()< 10 ? "0" : "")+newDate.getDate();
                let time3 = (newDate.getHours()< 10 ? "0" : "")+ newDate.getHours() + ":"+(newDate.getMinutes()< 10 ? "0" : "")+newDate.getMinutes()+":"+(newDate.getSeconds()< 10 ? "0" : "")+newDate.getSeconds();
                let newTemRemark = new Date().getTime();

                let headers1 = {//发送信息给所有关心该异常的人
                                    temType:temType,
                                    texId:self.texId,
                                    fromuser:self.userId,
                                    fromuserId:self.userId,
                                    fromUserName:self.token["userName"],
                                    sendLogo:self.token["userLogo"],
                                    sendTime:(time2+" "+time3).replace(/:/gi,"tt"),
                                    temRemark:newTemRemark
                                };
                let data = encodeURIComponent(self.sendValue);
                
                client.send(self.orgAdmin_url, headers1,data);//发送信息给所有关心该异常的人

                //记录到数据库中关于本异常的信息，方便查询
                let RowId = parseInt(Math.random()*1000);
                let newContent = {  temExId:self.texId,//异常Id
                                    temSendUserId:self.userId,//发送者ID
                                    temText:self.sendValue,//内容
                                    temType:temType,//类型
                                    temRemark:newTemRemark,//备注关键字
                                    state:'i'
                                    };
          
                let s =  {action:"/tmExMsg/save","sessionId":self.sessionId,commandType:"Update",rowId:RowId};
                    s.datasets = {dsData:{rows:[newContent]}} ;

                doAjaxUpdate(s,function(data) {
                    if(data.status == 0){
                        self.$transfer.backLogin(self, data);
                    }else if(data.status == 1){
                        //把未读消息推送到推流消息
                        setTimeout(function(){
                            //更新后台标记
                              $.ajax({  
                                    type : "POST",  
                                    dataType:"jsonp",
                                    jsonp:"jsonp_data",   
                                    url: getRootURL()+'/rest/tmExMsg/updateNoMsg',
                                    data:{  
                                          tmexId:self.texId,
                                          temRecvUserId:self.userId,
                                         } ,
                                    success:function(d){
                                    },
                                    error:function(d){
                                    }
                                }); 
                         },1000);
                    }
                });

                self.sendValue = '';
            });

            //发送图片
            $('#sendPic').off("click").on("click",function(event){
                weChatChooseImage(function(localIds){//通过微信方法获取图片
                    self.$Indicator.open();
                    weChatUploadImg(localIds,function(result){//将本地图片上传到微信服务器
                        let _data = {
                               media_ids_arr: result.join("@"),
                               mode : "tmEx",
                               id : self.texId,//异常id
                               type : "chat"
                        };
                        doWxAjaxUpload(_data,function(data){//将图片上传到数据库 
                            let chatPic = data.vispath;
                            for(var i=0;i<chatPic.length;i++){
                                let temType = "pic";//图片
                            let time2 = newDate.getFullYear()+"-"+((newDate.getMonth() + 1)< 10 ? "0" : "")+ (newDate.getMonth()+1)+"-"+(newDate.getDate()< 10 ? "0" : "")+newDate.getDate();
                            let time3 = (newDate.getHours()< 10 ? "0" : "")+ newDate.getHours() + ":"+(newDate.getMinutes()< 10 ? "0" : "")+newDate.getMinutes()+":"+(newDate.getSeconds()< 10 ? "0" : "")+newDate.getSeconds();
                                let newTemRemark = new Date().getTime();
                                let headers1 = {//发送信息给所有关心该异常的人
                                        'temType':temType,
                                        'texId':self.texId,
                                        'fromuser':self.userId,
                                        'fromuserId':self.userId,
                                        'fromUserName':self.token["userName"],
                                        'sendLogo':self.token["userLogo"],
                                        'sendTime':(time2+" "+time3).replace(/:/gi,"tt"),
                                        'temRemark':newTemRemark
                                };
                                
                                client.send(self.orgAdmin_url, headers1,encodeURIComponent(chatPic[i]));//发送信息给所有关心该异常的人

                                //记录到数据库中关于本异常的信息，方便查询
                                let RowId = parseInt(Math.random()*1000);
                                let newContent = {  temExId:self.texId,//异常Id
                                                    temSendUserId:self.userId,//发送者ID
                                                    temText:chatPic[i],//内容
                                                    temType:temType,//类型
                                                    temRemark:newTemRemark,//备注关键字
                                                    state:'i'
                                                    };
           
                                let s = {   action:"/tmExMsg/save",
                                            sessionId:self.sessionId,
                                            commandType:"Update",
                                            rowId:RowId
                                        };
                                s.datasets = {dsData:{rows:[newContent]}} ;
                                doAjaxUpdate(s,function(data) {
                                    if(data.status == 0){
                                        self.$transfer.backLogin(self, data);
                                    }else if(data.status == 1){
                                        //把未读消息推送到推流消息
                                        setTimeout(function(){
                                            //更新后台标记
                                              $.ajax({  
                                                    type : "POST",  
                                                    dataType:"jsonp",
                                                    jsonp:"jsonp_data",   
                                                    url: getRootURL()+'/rest/tmExMsg/updateNoMsg',
                                                    data:{  
                                                          tmexId:self.texId,
                                                          temRecvUserId:self.userId,
                                                        } ,
                                                    success:function(d){
                                                    },
                                                    error:function(d){
                                                    }
                                                }); 
                                         },1000);
                                    }
                                });
                                
                            }
                            self.$Indicator.close();  

                        })
                    })
                })
            })
            

            //撤消聊天记录发送
            $(".cancelBtn").off("click").on("click",function(event){
                self.$MessageBox.confirm('确定要撤消这条消息?')
                .then(action => { 
                    let Code = self.chattRecords[self.cancelIndex].temMsgCode ? self.chattRecords[self.cancelIndex].temMsgCode : '';
                    let RemRemark = self.chattRecords[self.cancelIndex].temRemark ? self.chattRecords[self.cancelIndex].temRemark: '';

                    let s = {   action:'/tmExMsg/delMsg',
                                sessionId:self.sessionId,
                                params:{code:Code,temRemark:RemRemark},commandType:"Update"
                            };

                    doAjaxUpdate(s,function(data) {
                        if(data.status == 0){
                            self.$transfer.backLogin(self, data);
                        }else if(data.status == 1){
                            self.chattRecords.splice(self.cancelIndex,1);
                            var headers2 = {//发送信息给所有关心该异常的人
                                                texId:self.texId,
                                                fromuser:self.userId,
                                                fromuserId:self.userId,
                                                sendLogo:self.token["userLogo"],
                                                temRemark:RemRemark,
                                                delMsg:'0'
                                            };
                            client.send(self.orgAdmin_url, headers2,'');//发送信息给所有关心该异常的人
                        }
                    });
                }).catch(function(){})
            });
        },
        getSocketData (){//获取历史聊天记录
            let self = this;
            let s = {   action:'/tmExMsg/query',
                        params:{"temExId":self.texId,"temSendRecv":self.userId}
                    };
            s.showFields="temId,temExId,temMsgCode,temSendUserId,temRecvUserId,temSendUserName,temText,temPic,temType,temStatus,temRemark,temCreateUserId,temCreateUser,temCreateDate,temModifyUser,temModifyDate,sendLogo";

            self.$Indicator.open();
            doAjaxQuery(s,function(data) {
                if(data.status == 0){ 
                    self.$transfer.backLogin(self, data);
                }else if(data.status == 1){
                    let obj = data.dataset.rows;
                    if(obj && obj.length>0){
                        obj.forEach(function(item, index){
                            item.sendLogo = getImgURL() +'user/' +item.sendLogo;
                            let ImgObj = new Image(); 
                                ImgObj.src = item.sendLogo; 
                                ImgObj.onerror = function(){
                                    item.sendLogo = getImgURL() + 'user/default.png';
                                }
                            item.isMeSend = item.temSendUserId == self.userId ? true : false;
                            item.temModifyDate = item.temModifyDate.substring(0,19);
                            if(item.temType == 'pic'){
                                self.chatPic.push(item.temText);
                                
                            }
                        })
                        self.chattRecords = obj;
                    }
                    self.$nextTick(()=>{
                        if(window.WebSocket){ 
                            self.exChatOpen();
                        }//-------if  结束      
                    })
                }

                self.$Indicator.close(); 
               
            });

        },
        getYJList(){//获取意见列表
            let self = this;
            let s = {   action:"/tmExResult/query",
                        params:{"terExId":self.texId,terType:"YJ"}
                    };
            doAjaxQuery(s,function(data) {
                if(data.status == 0){ 
                    self.$transfer.backLogin(self, data);
                }else if(data.status == 1){
                    let obj = data.dataset.rows; 
                    if(obj && obj.length>0){
                        obj.forEach(function(item, index){ 
                            item.showLogo = getImgURL() + 'user/' + item.terUserLogo;
                            let ImgObj = new Image();
                            ImgObj.src =  item.showLogo;
                            ImgObj.onerror = function(){
                                item.showLogo = getImgURL() + 'user/default.png';
                            }
                            item.showName = item.terPayerName.length > 3 ? item.terPayerName.substring(0,3) : item.terPayerName;
                            item.showTerAmt = item.terAmt ? '承担：￥' + parseFloat(item.terAmt).toFixed(2) : '';
                            item.showTerAmt1 = item.terAmt1 ? '意见：￥' + parseFloat(item.terAmt1).toFixed(2) : '';
   
                        })
                        self.yjList = obj;
                    }
                }
               
            });

        },
        getExDetail(){//获取异常详情
            let self = this;
            let s = {   action:"/tmEx/query",
                        params:{texId:self.texId}
                    };
            self.$Indicator.open();
            doAjaxQuery(s,function(data) {
                if(data.status == 0){ 
                    self.$transfer.backLogin(self, data);
                }else if(data.status == 1){
                    let obj = data.dataset.rows[0]; 
                    obj.createUserLogo = getImgURL() +'user/' +obj.createUserLogo;
                    let ImgObj = new Image(); 
                        ImgObj.src = obj.createUserLogo; 
                        ImgObj.onerror = function(){
                            obj.createUserLogo = getImgURL() + 'user/default.png';
                        }
                    self.texStatus = obj.texStatus;
                    self.texOrderIdT = obj.texOrderIds;
                    self.texCreateDate = obj.texCreateDate ? obj.texCreateDate.substring(0,10) : '';
                    self.exDetailData = obj;
                    if(self.texStatus == 0){
                        $(".dialogBox").show();
                    }
                    if(self.texStatus == 'summed'){
                        self.summedText = obj.texSummedText;
                        self.getYJList();
                    }
                    
                    //判断是否是管理员，站点管理员，异常发起者
                    let temp = false;
                    if(self.adminOrgIds && (self.adminOrgIds != '*')){
                        let adminOrgIdsArr = self.adminOrgIds.split(",");
                        for(var i=0;i<adminOrgIdsArr.length;i++){
                            if(adminOrgIdsArr[i] == self.exDetailData.texOrgId){
                                temp = true;
                                break;
                            }
                        }
                    }
                    if(self.userId==self.exDetailData.texCreateUserId || self.isAdmin=="1" || temp){
                        self.hasJurisdiction = true;
                    }else{
                        self.hasJurisdiction = false;
                    }

                    //获取异常图片
                    if(obj.texPic && obj.texPic != '*' && obj.texPic != '[]'){
                        let texPic = obj.texPic.split(",");
                        texPic.forEach(function(item, index){
                           if(item != ''){
                                item = getImgURL() + 'tmEx/' + item;
                                self.oldImages.push(item);
                            } 
                        })
                    }

                    //获取异常参与者
                    self.getTexUser();
                }
               
            });
            self.updateMsgNum();     
        },
        updateMsgNum(){//更新未读数据
            let self = this;
            $.ajax({  
                type : "POST",  
                dataType:"jsonp",
                jsonp:"jsonp_data", 
                url: getRootURL()+'/rest/tmExMsg/updateMsg',
                data : {  
                  "temRecvUserId":self.userId,
                  'tmexId':self.texId
                } ,
                success:function(){
                }
            });

        },
        exSummary(){//去做异常总结
            let self = this;
            // self.summedPOPShow = true;
            let param;
            //判断是总结还是意见
            if(self.hasJurisdiction){
                param = self.texId + 'andZJ';
            }else{
                param = self.texId + 'andYJ';
            }
            Tokens.save("texIsSummed",'');
            self.go('/taskOrderExSummed',param);
        },
        exHandle(){//异常关闭
            let self = this;
            self.$MessageBox.confirm('确定要关闭/处理?')
            .then(action => { 
                let s = {   action:"/tmEx/save",
                            commandType:"Update",
                            rowId:1
                        };
                    s.datasets = {dsData:{rows:[{texId:self.texId,texStatus:"close",state:'u',texModifyDate:self.exDetailData.texModifyDate}]}} ;
                self.$Indicator.open();
                doAjaxUpdate(s,function(data) {
                    if(data.status == 0){
                        self.$transfer.backLogin(self, data);
                    }else if(data.status == 1){
                        self.$Indicator.close();
                        self.texStatus = "close";    
                    }
                });

            }).catch(function(){})

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
            self.token = Tokens.fetch("token");
            self.tchOrderId = Tokens.fetch('tchOrderId');
            self.userId = self.token["userId"];
            self.sessionId = self.token["sessionId"];
            self.subSystem = self.token["subSystem"];
            self.adminOrgIds = self.token["adminOrgIds"];
            self.isAdmin = self.token["isAdmin"];
            self.isAdmin2 = self.token["isAdmin2"];
            
            let datasource = self.token['datasource'];
            self.curr_key1 = datasource + self.token['subSystem'] + self.token['userId']//当前用户的key1
            if(datasource=="dbcon"){//开发版
                self.publicHome_url = "/queue/publicqueue1_kf";
                self.orgAdmin_url = "/exchange/publicexchange_kf/"+self.texId;
            }else if(datasource=="dbtest"){
                self.publicHome_url = "/queue/publicqueue1_test";//测试版
                self.orgAdmin_url = "/exchange/publicexchange_test/"+self.texId;
            }else if(datasource=="dbtms"){
                self.publicHome_url = "/queue/publicqueue1";//正式版
                self.orgAdmin_url = "/exchange/publicexchange/"+self.texId;
            }
            self.curr_user_url = self.orgAdmin_url;

            //需要返回的路径
            if(from.path && ((from.path.indexOf('exceptionList')!= -1) || (from.path.indexOf('taskOrderExtremely')!= -1) || (from.path.indexOf('exManage')!= -1))){
                Tokens.save("taskOrderExDetailBackPath",'');
                Tokens.save("taskOrderExDetailBackPath",from.path);
            }

            if(from.path && from.path.indexOf('add_member')!= -1 && self.exDetailData != ''){
                self.addExUserList();       
            }else if(from.path && from.path.indexOf('taskOrderExSummed')!= -1 && self.exDetailData != ''){
                //从异常总结回来 是否需要当前页面的texStatus   
                let isSummed = Tokens.fetch("texIsSummed"); 
                if(isSummed){
                    self.texStatus = 'summed';
                    self.summedText = isSummed; 
                    self.$nextTick(()=>{
                        $(".dialogBox").hide(); 
                        self.getYJList();
                    }) 
                }
            }else{
                self.texId = self.$route.params.texId;
                self.exDetailData = '';//异常详情数据 
                self.exDelIcon = '&#xe611;';//详情下拉箭头 
                self.exSumCIcon = '&#xe611;';//总结下拉箭头
                self.exSumLIcon = '&#xe611;';//处理意见下拉箭头  
                self.exChatIcon = '&#xe611;';//聊天记录下拉箭头 
                self.$nextTick(()=>{
                    $(".dialogBox").hide(); 
                }) 
                self.sendValue = '';//聊天需要发送的内容
                self.chattRecords = [];//聊天记录
                self.oldImages = [];//异常图片
                self.chatPic = [];//聊天发送的图片
                self.texUsers = [];//异常参与者
                self.yjList = [];//意见列表
                self.summedText = '';
                //获取异常详情
                self.getExDetail();
                //获取聊天数据
                self.closeSocket = false;
                exEntry_ws = null;
                self.getSocketData();
            }

            next()
        },
        deactivate ({ next }) {
            //Triggers when component tchOrderId
            next()
        },
        canDeactivate ({ next, to, abort }) {
            //Triggers when component destroys
            let self = this;
            $(".exConBox").slideUp(); 
            $(".exSummedContent").slideUp(); 
            $(".exSummedList").slideUp();
            if(exEntry_ws != null){ 
                self.closeSocket=true;
                exEntry_ws.close();
            } 
            next()
        },
        activate({to, from, next}) {
            let self = this
            self.exDetailShow = true;
            next()
        } 
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.hasBottom{
    margin-bottom:2.5rem;
}
.noBottom{
    margin-bottom:0;
}
.exSummedContent{
    border-top:1px solid #e5e5e5;
    display: none;
}
.sumUserLi{
   border-top:1px solid #e5e5e5; 
   position: relative;
   height:6rem;
   padding:0.5rem 0.5rem 0.5rem 3rem;
}
.sumUserLi>div{
    display: inline-block;
    vertical-align: top;
}
.sumUserLogo{
    width:2rem;
    height:2rem;
    border-radius: 0.3rem;
    border:1px solid #e5e5e5;
    position: absolute;
    top:1.5rem;
    left:0.5rem;
}
.sumUserName{
    /*font-size:0.6rem;*/
    position: absolute;
    top:3.7rem;
    left:0.5rem; 
    width:2rem;
    text-align: center;
}
.sumUserSay{
    width:100%;
    border:1px solid #e5e5e5;
    padding:0.3rem 0.5rem;
    height: 4rem;
    background: #fff;
    border-radius: 0.3rem;
    overflow: scroll;
}
.sumUserTotal,.sumUserMoney{
    width:48%;
    text-align: left;
    padding:0.2rem;
    color:#f00;
}

/*撤回*/
.mint-popup{
    width:100%;height:100%;background:transparent;z-index:10820;
}
#exContentBox{
    border-bottom: 1px solid #e5e5e5;
}
.orderCell{
    padding:0.5rem 5rem 0.5rem 3.5rem;
    overflow: hidden;
    background:#fff;
    border-bottom:1px solid #e5e5e5;
    position: relative;
}
/*.orderCell li{
    float:left;
    padding:0.5rem;
    overflow:hidden;
    white-space:nowrap;
    text-overflow:ellipsis;
}*/
.dialogText {
    position: relative;
}
.cancelBtn{
    width:3rem;
    height:1.6rem;
    line-height: 1.6rem;
    margin-left:-1.5rem;
    color:#FFD91E;
    text-align: center;
    border-radius: 0.3rem;
    background: #353535;
    position:relative;
}
.cancelArrow{
    position: absolute;
    top:1.55rem;
    left:1.5rem;
    margin-left:-4px;
}
.cancelArrow:before{
    content: "";
    position: absolute;
    border-style:dashed dashed solid dashed;
    line-height: 1;
    display: inline-block;
    border-color: #353535 transparent transparent transparent;
    border-width: 8px; 
    margin-left:-4px;
}

.participant{
    position: relative;
    background: #fff;
    overflow: hidden;
    padding:0 0 0 3rem;
}
.userImgLi{
    max-width: 3.5rem;
    position: relative;
}
.participant>li{
    padding:0;
}
.participant>li.faqiMan{
    position: absolute;
    height: 100%;
    top:0;
    left:0;
    border-right:1px solid #e5e5e5;
}
.participant>li>p{
    padding-left:0.5rem;
    height:1.5rem;
    line-height: 1.5rem;
}
.participant .tex_user{
    padding:0.5rem 0.5rem 0 0.5rem;
}
.participant .userPic{
    width:100%;
    display:block;
    text-align: center;
    border-radius:0.3rem;
}
.participant .userName{
    width:100%;
    height:1.3rem;
    line-height: 1.3rem;
    text-align: center;
    /*font-size: 0.55rem;*/
}
.participant .canyuMan li{
    float:left;
}

.exImgBox{
    display: inline-block;
    position:relative;
    padding:0.5rem;
    width:19.5vw;
    height:19.5vw;
    max-width: 5rem;
    max-height: 5rem;
    box-sizing: border-box;
}
.delPicIcon,.userDelIcon{
    display: none;
    color:#f00;
    position: absolute;
    top:-0.25rem;
    right:0;
}
.exConBox .ex_img{
    display:inline-block;
    width:100%;
    height:100%;
    border:1px solid #e5e5e5;
    border-radius:0.3rem;
    text-align:center;
}


/*聊天对话框*/
.dialogContent{
    padding:0.5rem;
}
.dialogTime{
    font-size: 0.5rem;
    color:#999;
    min-height:1rem;
}
.dialogLeft{
    /*background: #fff;*/
    padding:0.5rem 0.5rem 0.5rem 3.5rem;
    position: relative;
    min-height: 3rem;
    overflow: hidden;
}
.dialogLeftImg{
    position: absolute;
    top:0.5rem;
    left:0.5rem;
    width:2rem;
    height:2rem;
    border:1px solid #e5e5e5;
    border-radius: 0.3rem;
    display: block;
}
.dialogLeftText{
    float:left;
    border:1px solid #e5e5e5;
    border-radius: 0.5rem;
    padding:0.2rem 0.5rem 0.5rem 0.5rem;
    line-height: 1rem;
    background: #fff;
    max-width: 80%;
}
.dialogaLeftArrow{
    position: absolute;
    top:1rem;
    left:3rem;
}
.dialogaLeftArrow:before,.dialogaLeftArrow:after{
    content: "";
    position: absolute;
    border-style:dashed dashed solid dashed;
    line-height: 1;
    display: inline-block;
}
.dialogaLeftArrow:after{
    border-color: transparent #e5e5e5 transparent transparent;
    border-width: 8px;
    left:-6px;
    z-index:666
}
.dialogaLeftArrow:before{
    border-color: transparent #FFF transparent transparent;
    border-width: 8px; 
    left:-4px;
    z-index:667
}

.dialogRight{
    /*background: #fff;*/
    padding:0.5rem 3.5rem 0.5rem 0.5rem;
    position: relative;
    min-height: 3rem;
    overflow: hidden;
}
.dialogRightImg{
    position: absolute;
    top:0.5rem;
    right:0.5rem;
    width:2rem;
    height:2rem;
    border:1px solid #e5e5e5;
    border-radius: 0.3rem;
    display: block;
}
.dialogRightText{
    float:right;
    border:1px solid #e5e5e5;
    border-radius: 0.5rem;
    padding:0.2rem 0.5rem 0.5rem 0.5rem;
    line-height: 1rem;
    background: #FFD91E;
    max-width: 80%;
}
.dialogaRightArrow{
    position: absolute;
    top:1rem;
    right:3rem;
}
.dialogaRightArrow:before,.dialogaRightArrow:after{
    content: "";
    position: absolute;
    border-style:dashed dashed solid dashed;
    line-height: 1;
    display: inline-block;
}
.dialogaRightArrow:after{
    border-color: transparent transparent transparent #e5e5e5;
    border-width: 8px;
    right:-6px;
    z-index:666
}
.dialogaRightArrow:before{
    border-color: transparent transparent transparent #FFD91E;
    border-width: 8px; 
    right:-4px;
    z-index:667
}
.dialogImport{
    border-top:1px solid #e5e5e5;
    background: #fff;
    position: absolute;
    bottom:0;
    height:2.5rem;
    line-height: 2.5rem;
    padding:0.35rem 2.5rem 0.35rem 0.5rem;
    width:100%;
}
.dialogImport>div{
    height:1.8rem;
    line-height: 1.8rem;
}

.dialogImport .iconfont{
    display: inline-block;
    height:1.65rem;
    line-height: 1.65rem;
    position: absolute;
    bottom:0.35rem;
    color:#666;

}
.dialogImport #sendContent{
    display: inline-block;
    height:1.65rem;
    line-height: 1.65rem;
    position: absolute;
    background:#26a2ff;
    right:0.5rem;
    bottom:0.35rem;
    color:#FFF;
    font-size:0.5rem;
    padding:0 0.4rem;
}
.dialogInput{
    box-sizing: border-box;
    width:100%;
    height:1.8rem;
    line-height: 0.8rem;
    padding:0.5rem;
    -webkit-appearance:none;
    border: 1px solid #e5e5e5;
    border-radius: 0.3rem;
}
.exDetailBtn{
    height:1.8rem;
    line-height: 1.8rem;
    background: #fff;
    padding:0 0.5rem;
    text-align: center;
    border-bottom:1px solid #e5e5e5;
}
.exConBox{
    display:none;
    border-top:1px solid #e5e5e5;
}
.exLineTitle{
    padding:0.5rem;
    background:#fff;
    border-top:1px solid #e5e5e5;
}
.exLineTitle .iconfont{
    color:#999;
    float:right;
    margin-top:-0.25rem;
}
.popup_box{
    /*width:100%;height:100%;*/
    margin-top: 2.2rem;
    background-color: rgba(0,0,0,0.3);
}
.img_box{
    /*position: relative;*/
}
.imgC{
    /*display: block;*/
    vertical-align: middle;
}
.close_img{
    position: absolute;
    bottom:3.2rem;left: 50%;
    height:2rem;
    line-height: 2rem;
}
</style>
