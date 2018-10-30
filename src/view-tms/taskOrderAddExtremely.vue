<template>
    <div class="page" id="addOrdExpage"> 
        <mt-header fixed title="发起异常">
            <mt-button icon="back" slot="left" @click="backWhere()"></mt-button>
            <mt-button slot="right" @click = "addEx()">保存</mt-button>
        </mt-header>  
        <div class="container-top">
            <div class="sxStart_box">
                <ul class="ex_start">
                    <li v-if="!showAddOrder" style="padding:0.5rem 0.5rem 0.5rem 3rem;">
                        <span class="ex_title">订单号</span> 
                        <div class="ex_content">{{tchOrderId}}</div>
                    </li>
                    <li v-if="showAddOrder" style="padding:0.5rem 2.2rem 0.5rem 3rem;min-height: 3rem">
                        <span class="ex_title">订单号</span> 
                        <div class="ex_content">{{tchOrderId}}</div>
                        <!--添加异常订单 -->
                        <div style="width:2rem;position:absolute;right:0;top:0.5rem; " @click="addExOrder()">
                           <img class="ex_userLogo" src="../img/add.png"> 
                        </div>
                    </li>
                    <li style="padding:0 0 0.5rem 2.5rem;min-height: 2rem;">
                        <span class="ex_title">参与者</span> 
                        <div class="ex_content">
                            <div  class="oneUser" v-for="exUser in exUserList" track-by="$index" @click.stop="showDelIcon($index)">
                                <div :style="{width:userImgW + 'px',height:userImgW + 'px'}" class="userBox">
                                   <img class="ex_userLogo" :src="exUser.suLogo"> 
                                </div>
                                <p style="width:100%;text-align:center;">{{exUser.userName}}</p> 
                                <span id="uDel-{{$index}}" class="iconfont userDelIcon" slot="icon" @click.stop="deleteExUser($index)">&#xe6cf;</span> 
                            </div>
                            <!--添加参与者 -->
                            <div style="display: inline-block;border:none;vertical-align: top;">
                                <div :style="{width:userImgW + 'px'}" class="userAddBox" @click="addExUser()">
                                   <img class="ex_userLogo" src="../img/add.png"> 
                                </div>  
                            </div>
                        </div>
                    </li>
                    <li>
                        <span class="ex_title">主题</span> 
                        <input class="ex_content ex_input" v-model="teTitle" type="text" placeholder="请输入主题（限20个字）" maxlength="20"> 
                    </li>
                    <li style="padding:0 0 0 2.5rem">
                        <span class="ex_title">图片</span> 
                        <div class="ex_content" id="addImgBox">
                            <div :style="{width:exImgW + 'px',height:exImgH + 'px'}" class="exImgBox" v-for="newI in newImages" id="new-{{$index}}" track-by="$index">
                                <img class="ex_img" :src="newI" @click.stop="showBigPic('new',$index,newI)">
                                <span id="nDel-{{$index}}" class="iconfont delPicIcon" slot="icon" @click.stop="deletePic($index)">&#xe6cf;</span>
                            </div> 
                            <div :style="{width:exImgW + 'px',height:exImgH + 'px'}" class="exImgBox">
                                <img class="ex_img" src="../img/camera.jpg" @click="addExPic()">
                            </div> 
                        </div>
                    </li>
                    <li style="border:none;">
                        <span class="ex_title">异常描述</span> 
                        <div class="ex_content" style="border:1px solid #e5e5e5;border-radius: 0.3rem;padding:0.5rem;">
                            <textarea v-model="teText" rows="6" style="resize: none;border:none;padding:0;width:100%;" placeholder="请输入异常描述"></textarea>
                        </div>
                        
                    </li>
                        
                </ul>     
            </div>
        </div>
        <mt-popup :visible.sync="bigImgShow" position="center" class="popup_box" popup-transition="popup-fade">
            <img :src="bigImg" width="100%">
            <div class="close_img" @click.stop="close_img_pop()">
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
            currExOrderId:'',
            userId:'',//driverId 默认为userId 
            sessionId:'',
            subSystem:'',
            orgId:'',//机构ID
            tchOrderId:[],//异常的订单Id
            exOrderOrgId:[],//异常参与者的orgId
            exUserList:[],//异常参与者

            teTitle:'',//异常标题
            teText:'',//异常内容
            // tePic:[],//异常图片 
            newImages:[],//新添加的异常图片
            exImgW:'',//异常图片的宽度
            exImgH:'',//异常图片的高度

            userImgW:'',//参与者图片的宽度
            userImgH:'',//参与者图片的高度
            showAddOrder: false,//是否显示添加订单
			
			browserType: '', //Android或者微信判断

            bigImgShow:false,//Android显示大图
            bigImg:'',//大图路径
        }
    },
    ready(){
        let self = this;
        $("#addOrdExpage").off().on("click",function(){
            $(".delPicIcon").hide();
            $(".userDelIcon").hide();
        });
        let imgBoxW = document.getElementById('addImgBox').offsetWidth;
        self.exImgW = parseInt(imgBoxW)/4*0.95;
        self.exImgH = parseInt(imgBoxW)/4*0.95;
        self.userImgW = parseInt(imgBoxW)/5*0.95;
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
        backWhere(){
            let self = this;
            let backPath = Tokens.fetch("orderAddExBackPath");
            self.back(backPath);
        },
        addExOrder(){//添加异常订单
            let self = this;
            Tokens.save("isChooseExOrder","");
            self.go('/addExOrder');
        },
        getExUser(){
            let self = this;
            let s = {   name:"dsOrder_exAdd",
                        action:"/tmEx/query1",
                        sessionId:self.sessionId,
                        params:{"supOrgIds":self.exOrderOrgId.join(","),"tohIdOr":self.tchOrderId.join(",")}
                    };

            doAjaxQuery(s,function(data) {
                if(data.status == 0){
                    self.$transfer.backLogin(self, data);
                }else if(data.status == 1){
                    let obj = data.dataset.rows;
                    if(obj && obj.length>0){
                        obj.forEach(function(item, index){
                            item.suLogo = getImgURL() +'user/' +item.suLogo;
                            var ImgObj = new Image(); 
                            ImgObj.src = item.suLogo; 
                            ImgObj.onerror = function(){
                                item.suLogo = getImgURL() + 'user/default.png';
                            }
                            item.userName = item.userName.length > 3 ? item.userName.substring(0,3) : item.userName;
                        })
                        self.exUserList = obj;
                    }
                }

            })
        },
        addExUser(){//添加异常参与者 
            let self = this;
            let hiddenUserIds = [];
            let includeNotFriends = [];
            for(let i = 0;i<self.exUserList.length;i++){
                hiddenUserIds.push(self.exUserList[i].userId);
                if(self.exUserList[i].userId != self.userId){
                    includeNotFriends.push(self.exUserList[i].userId);
                }
            }
            let params = {  cmfUserId1:self.userId,
                            cmfSubSystem:self.subSystem,
                            hidden_userIds:hiddenUserIds.join(","),
                            isFilterAdd:"true",
                            include_notFriends:includeNotFriends.join(",")
                        };
            Tokens.save("addExUserParams",params);

            let argument = '添加参与者' + '|'+self.tchOrderId.join(",");
            self.go('/add_member',argument);
        },
        showDelIcon(index){//显示删除参与者按钮
            let self = this;
            $(".userDelIcon").hide();
            $("#uDel-"+index).show();
        },
        deleteExUser(index){//删除异常参与者
            let self = this;
            self.exUserList.splice(index,1);
            $(".userDelIcon").hide();
        },
        addExPic(){//添加异常图片
            let self = this;
            //weChatChooseImage(function(localIds){//通过微信方法获取图片
            //    self.newImages = self.newImages.concat(localIds);
            //    self.$nextTick(()=>{
            //        self.longTouchPic();
            //    })
            //})
			
			if(browserType == "android") {
				window.Photo.selectPictures();
                self.$nextTick(() =>{
                    setTimeout(function(){
                        let imgData = window.Photo.getPics();
                        let imgArr = JSON.parse(imgData).imgs;
                        for(let k=0;k<imgArr.length;k++){
                            let imgStr = "data:image/jpg;base64," + imgArr[k].img;
                            self.newImages.push(imgStr)
                        }
                    },500)
                })
			} else {
				weChatChooseImage(function(localIds) { //通过微信方法获取图片
        			self.newImages = self.newImages.concat(localIds);
        			self.$nextTick(() => {
        				self.longTouchPic();
        			})
        		})
			}
        },
        showBigPic(type,Index,currUrl){
            let self = this;
            $(".delPicIcon").hide();
            $("#nDel-"+Index).show();
            if(browserType=="android"){
                self.bigImgShow = true;
                self.bigImg = currUrl2;
            }else{
                weChatPreviewImg(currUrl,self.newImages);
            }
        },
        close_img_pop(){//android查看大图后返回
            let self = this;
            self.bigImgShow = false;
            self.bigImg = "";
        },
        deletePic(index){//删除异常图片
            let self = this;
            self.$MessageBox.confirm('确定要删除这张图片?')
            .then(action => { 
                $(".delPicIcon").hide();
                self.newImages.splice(index,1); 
            }).catch(function(){})
        },
        addEx(){//新增订单异常 任务详情“异”字的变色
            let self = this;
            if(!self.teTitle){
                self.$transfer.showToast(self, "请输入主题");
                return;
            }else if(!self.teText){
                self.$transfer.showToast(self, "请输入异常内容");
                return;
            }else{
                let RowId = parseInt(Math.random()*1000);
                let teUserId = [],teUserName = [],teExUser = [];
                for(var i=0;i<self.exUserList.length;i++){
                    teUserId.push(self.exUserList[i].userId);
                    teUserName.push(self.exUserList[i].userName);
                    teExUser.push({ rowId:i,
                                    state:"i",
                                    teuRecvUserId:self.exUserList[i].userId,
                                    teuRecvOrgIds:self.exUserList[i].orgId,
                                    teuRecvSubSystem:self.exUserList[i].subSystem
                                  })    
                }

                let newEx = {   texOrderIds:self.tchOrderId.join(","),
                                texOrgId:self.orgId,
                                rowId:RowId,
                                state:"i",
                                texStatus:'0',
                                texTitle:self.teTitle,
                                texText:self.teText,
                                texUserId:teUserId.join(","),
                                texUserName:teUserName.join(",")
                            };
             
                let s = {  action:"/tmEx/save",
                            sessionId:self.sessionId,
                            commandType:"Update",
                            rowId:1
                        };
                    s.datasets = {dsData:{rows:[newEx]}} ;
                    s.datasets.dsLine2 = {rows:teExUser};

                self.$Indicator.open();
                doAjaxUpdate(s,function(data) {
                    if(data.status == 0){
                        self.$transfer.backLogin(self, data);
                    }else if(data.status == 1){
                        let backTexId = data.datasets.dsData.rows[0].texId;
                        let fromPath = Tokens.fetch("orderAddExBackPath");
                        //如果是从订单列表页面进来  需要处理异常变色
                        if(fromPath.indexOf('exceptionList') == -1){
                            let orderList = Tokens.fetch('taskOrderList');
                            for(var k=0;k<orderList.length;k++){
                                if(self.tchOrderId[0] == orderList[k].tohId){

                                    orderList[k].tohExId = orderList[k].tohExId == '*' ? backTexId + ',' :
                                                            orderList[k].tohExId + backTexId + ',';
                                }
                                Tokens.save('taskOrderList',orderList);
                            }
                        }
                        

                        if(self.newImages.length>0){
                            if(browserType=="android"){
                                doAjaxUpload(
                                    "multiple",
                                    {
                                        imgparams : self.newImages.join("@"),
                                        mode : "tmEx",
                                        id : backTexId,//异常id
                                        type : "ex"
                                    },
                                    function(data){
                                        self.$Indicator.close();
                                        self.$transfer.showToast(self, "异常保存成功"); 
                                        setTimeout(function(){  
                                            self.backWhere();
                                            self.newImages = [];
                                        },1000)
                                    }
                                ) 
                            }else{
                                weChatUploadImg(self.newImages,function(result){//将本地图片上传到微信服务器
                                    let _data = {
                                           media_ids_arr: result.join("@"),
                                           mode : "tmEx",
                                           id : backTexId,//异常id
                                           type : "ex"
                                    };
                                    doWxAjaxUpload(_data,function(data){//将图片上传到数据库 
                                        // Tokens.save("ExBack",'add');
                                        self.$Indicator.close();
                                        self.$transfer.showToast(self, "异常保存成功");
                                        setTimeout(function(){
                                           self.backWhere();
                                           self.newImages = [];
                                        },1000)
                                        
                                    })
                                })
                            }   
                        }else{
                            // Tokens.save("ExBack",'add'); 
                            self.$Indicator.close();
                            self.$transfer.showToast(self, "异常保存成功");
                            setTimeout(function(){
                               self.backWhere();
                            },1000)
                            
                        }
                    }
                });

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
            self.sessionId = token["sessionId"];
            self.subSystem = token["subSystem"];
            self.showAddOrder = false;
            
			self.browserType = browserType;
            //需要返回的路径
            if(from.path && ((from.path.indexOf('taskOrderExtremely')!= -1) || (from.path.indexOf('taskDetail')!= -1)|| (from.path.indexOf('traceList')!= -1) || (from.path.indexOf('exceptionList')!= -1) || (from.path.indexOf('orderManage')!= -1) || (from.path.indexOf('joinManage')!= -1) || (from.path.indexOf('exManage')!= -1) || (from.path.indexOf('joinTruckDetail')!= -1)  || (from.path.indexOf('signManage')!= -1))){
                Tokens.save("orderAddExBackPath",'');
                Tokens.save("orderAddExBackPath",from.path);
            }

            if(from.path && from.path.indexOf('add_member')!= -1 && self.orgId !=''){//增加加参与者回来
                let addExUser = Tokens.fetch("exUserAddList");
                if(addExUser.length > 0){
                    addExUser.forEach(function(item, index){
                        item.userName = item.suName.length > 3 ? item.suName.substring(0,3) : item.suName;
                        item.userId = item.suId;
                    })
                    self.exUserList = self.exUserList.concat(addExUser);
                }        

            }else if(from.path && from.path.indexOf('addExOrder')!= -1){//增加订单回来
                let isChoose = Tokens.fetch("isChooseExOrder");
                if(isChoose == 'YES'){
                    let addOrderIds =  Tokens.fetch("chooseExOrder");
                    if(addOrderIds.length > 0){
                        let arr;
                        if(self.currExOrderId == ''){
                            arr = [];
                        }else{
                            arr = [self.currExOrderId];
                        }
                        for(var i=0;i<addOrderIds.length;i++){
                            if(addOrderIds[i] != self.currExOrderId){
                                arr.push(addOrderIds[i]);
                            }
                        }
                        self.tchOrderId = arr;
                        self.getExUser();
                    }

                }

            }else if((from.path && (from.path.indexOf('exceptionList')!= -1 || from.path.indexOf('exManage')!= -1)) || (!from.path && (Tokens.fetch("orderAddExBackPath").indexOf('exceptionList')!= -1 || Tokens.fetch("orderAddExBackPath").indexOf('exManage')!= -1))){//如果是推流过来或者刷新 
                self.exUserList = [];
                self.tchOrderId = [];
                self.currExOrderId = '';
                self.tchOrderId = [];
                self.teTitle = '';//异常标题
                self.teText = '';//异常内容
                self.newImages = [];//异常图片
                self.exOrderOrgId = [];//异常参与者的orgId
                self.exUserList = [];//参与者
                if(localStorage.getItem("isTMSTrace") == 'YES'){
                    self.orgId = localStorage.getItem("chooseOrgId");
                }else{
                    self.orgId = Tokens.fetch("token")["orgId"];
                }
                
            }else{
                self.currExOrderId = self.$route.params.tchOrderId;
                if(self.currExOrderId == 'id1'){
                   self.currExOrderId = '';
                   self.tchOrderId = []; 
                }else{
                    self.tchOrderId = [self.currExOrderId];
                }
                self.tchOrderId = [self.currExOrderId];
                self.teTitle = '';//异常标题
                self.teText = '';//异常内容
                self.newImages = [];//异常图片
                self.exOrderOrgId = [];//异常参与者的orgId
                self.exUserList = [];//参与者
                if(localStorage.getItem("isTMSTrace") == 'YES'){
                    self.orgId = localStorage.getItem("chooseOrgId");
                }else{
                    self.orgId = Tokens.fetch("token")["orgId"];
                }
                self.exOrderOrgId = Tokens.fetch("exOrderOrgId");
                self.getExUser();
            }
            //显示添加订单按钮
            if(Tokens.fetch("orderAddExBackPath").indexOf('exceptionList')!= -1 || Tokens.fetch("orderAddExBackPath").indexOf('exManage')!= -1){
                self.showAddOrder = true;
            }

            next()
        },
        deactivate ({ next }) {
            //Triggers when component tchOrderId
            next()
        },
        canDeactivate ({ next, to, abort }) {
            //Triggers when component destroys
            const self = this
            next()
        }
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.mint-popup{
    background: #f1f1f1;z-index: 2;
}
.popup_box{
    width:100%;height:100%;
    margin-top: 2.2rem;
}
.close_img{
    position: absolute;
    top:1rem;right:1rem;
}
.ex_start{
    background: #fff;
    padding: 0 0.5rem;
}
.ex_start li{
    padding:0.5rem 0 0.5rem 3rem;
    border-bottom:1px solid #e5e5e5;
    position: relative;
}
.ex_start li>span,.ex_start li>.ex_content{
    display: inline-block;
    vertical-align: top;
    box-sizing: border-box;
}
.ex_start li .ex_title{
    position: absolute;
    top:0.5rem;
    left:0;
}
.ex_start li>.ex_content{
    width:100%;
    padding:0;
    /*font-size:0.65rem;*/
}
.ex_start .ex_input{
    padding:0;
    width:100%;
    height:1rem;
    line-height: 1rem;
}
.ex_start .ex_userLogo{
    display:inline-block;
    width:100%;
    /*border:1px solid #e5e5e5;*/
    border-radius:0.3rem;
    text-align:center;
}
.ex_start .userBox,.ex_start .userAddBox{
    display:inline-block;
    padding:0.5rem 0.5rem 0 0.5rem;
    max-width: 4rem;
    max-height:4rem;
}

.ex_start .exImgBox{
    display: inline-block;
    position:relative;
    padding:0.5rem;
    max-width: 5rem;
    max-height: 5rem;
    box-sizing: border-box;
}
.ex_start .ex_img{
    display:inline-block;
    width:100%;
    height:100%;
    border:1px solid #e5e5e5;
    border-radius:0.3rem;
    text-align:center;

}
.oneUser{
    display: inline-block;
    position: relative;
}
.ex_start .delPicIcon,.userDelIcon{
    display: none;
    color:#f00;
    position: absolute;
    top:-0.25rem;
    right:0;
}

</style>
