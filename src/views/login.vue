<template>
  <div class="page" id="loginPage">  
    <div class="container">
        <!-- LOGO -->
        <div class="Logo_box">
            <img src="../img/T_icon.png">  
            <p>推流 Tiulo</p>
        </div> 
        <!-- LOGIN -->
        <div class="Login_box">
            <!-- 版本 -->
            <!-- <mt-navbar class="page-part" :selected.sync="subSystem2">
                <mt-tab-item id="TP">TP</mt-tab-item>
                <mt-tab-item id="OSP">OSP</mt-tab-item>
                <mt-tab-item id="BSP">BSP</mt-tab-item>
                <mt-tab-item id="EP">EP</mt-tab-item>
                <mt-tab-item id="SJ">SJ</mt-tab-item>
            </mt-navbar> -->

            <div class="user_row">
                <span slot="icon" class="iconfont inputIcon">&#x344b;</span> 
                <input type="text" autocomplete="off" v-model="user" placeholder="请输入推流号/手机号">
            </div>
            <div class="user_row">
                <span slot="icon" class="iconfont inputIcon">&#xe61e;</span>
                <input @focus="checkUser()" type="password" autocomplete="off" v-model="pwd" placeholder="请输入登录密码">
            </div>
            <div class="rememberBtn">
                <div style="position:relative;">
                    <span @click="orRememberPwd()" class="circle" :class="{ 'circleCheck': rememberPWD}"></span>
                    <span style="display:inline-block;margin-left:1.5rem;">记住密码</span>
                </div>
              
                <span @click="go('/forget_pwd')">忘记密码？</span>            
            </div>
            <!-- LOGIN—BTN -->
            <div class="login_type">
                <mt-button class="login_btn" size="large" @click="loginClick()">{{loginText}}</mt-button>
                <p style="font-size:0.8rem;margin-top:0.5rem" @click="register()">新用户注册</p>
                <ul class="orText">
                    <li class="liner"></li>
                    <li>或者</li>
                    <li class="liner"></li>
                </ul>
                <ul class="other_login">
                    <li style="display:none;">
                        <span @click="QQLogin()" style="color:#1A94FF;" slot="icon" class="iconfont">&#xe616;</span>
                        <p>QQ</p>
                        <span id="qqLoginBtn" style="display:none;"></span>
                    </li>
                    <li>
                        <span @click="wxLogin()" style="color:#00D278;" slot="icon" class="iconfont">&#xe636;</span>
                        <span>微信</span>
                    </li>
                </ul>
              <!-- copyright -->
              <!-- <p class="copyright" style="text-align:center;">浙ICP备16030749号 Copyright© 2015-2016 杭州微流有限公司. All rights reserved.</p> -->
            </div>


        </div>
    </div>
  </div>
</template>

<script>
import Tokens from '../token'
export default {
    data () {
        return {
            subSystem2:'',//版本
            subSystem:'',
            sessionId:'',
            user:'',
            pwd:'',
            rememberPWD:false,
            wxCode:'',//微信code
            wxOpenId:'',//微信的openId
            wxHeadimgurl:'',//微信头像
            loginText:'登录',//登录按钮的默认文字
            wxBind:false,//是否绑定微信

            userQQopenId:'',
            userQQAccessToken:'',
            loginType:'',//登录类型
            isDriver:'',//是否是司机
            // hasVersion:'',
        }
    },
    ready(){
        let self = this;
        //保存屏幕的内容高度
        let contentH = document.getElementById('loginPage').offsetHeight;
        Tokens.save("contentHeight",contentH);
        //保存屏幕的宽度
        let contentW = document.getElementById('loginPage').offsetWidth;
        Tokens.save("contentWidth",contentW);
    },
    watch:{
        'subSystem2': function(newVal){
            let self = this;
            localStorage.setItem("subSystem2",newVal);
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
        orRememberPwd(){
            let self = this;
            self.rememberPWD = !self.rememberPWD;
        },
        checkUser(){//核对用户是否存在
            let self = this;
            if(!self.user){
                self.$transfer.showToast(self, "请输入推流号/手机");
            }else{
                let s = {action:"/user/userInfo",params:{"suoUserId":self.user}};
                console.log(JSON.stringify(s));
                doAjaxQuery(s,function(data) {
                    if(data.status == 0){
                        self.$Indicator.close();
                        self.$transfer.showToast(self, data.info);
                    }else if(data.status == 1){
                        console.log(data)
                        self.sessionId = data.sessionId;
                        if(self.isDriver == 1){//是司机
                            self.subSystem2 = 'SJ';
                        }else if(self.isDriver == 0){
                            let hasVersion = data.dataset.rows[0].subSystem1;
                            let prevOrg = data.dataset.rows[0].user[0];
                            if((hasVersion && hasVersion.indexOf("TP") != -1 && prevOrg.suDefaultVersion == 'TP') || (hasVersion && hasVersion.indexOf("OSP") != -1 && prevOrg.suDefaultVersion == 'OSP') || (hasVersion && hasVersion.indexOf("BSP") != -1 && prevOrg.suDefaultVersion == 'BSP') || (hasVersion && hasVersion.indexOf("EP") != -1 && prevOrg.suDefaultVersion == 'EP')){
                                self.subSystem2 = prevOrg.suDefaultVersion;
                            }else if(hasVersion.length > 0){
                                self.subSystem2 = hasVersion[0];
                            }else{
                                self.subSystem2 = 'TP';
                            }
                            console.log(self.subSystem2)

                        }
                        
                    }
                });
            }
        },
        login(s){//真正的登录请求
            let self = this;
            //登录之前清空sessionId和token, 不然另一个用户登录会报错
            localStorage.setItem("userMobile",'');
            localStorage.setItem("token",'');
            localStorage.setItem("sessionId",'');
            localStorage.setItem("subSystem",'');
            
           console.log(JSON.stringify(s)) 
            doAjaxQuery(s,function(data) {
                self.$Indicator.open();
                if(data.status == 0){
                    self.$Indicator.close();
                    self.$transfer.showToast(self, data.info);
                }else if(data.status == 1){
                   
                    let token = data.dataset.rows[0];
                    // token.hasVersion = self.hasVersion;
                     console.log(token)
                    if(self.loginType == 'weixin'){
                        token.wxHeadPicUrl = token.userId + "_wx.gif";
                    }
                    
                    localStorage.setItem("userMobile",token.userMobile);
                    localStorage.setItem("subSystem",token.subSystem);
                    localStorage.setItem("token",JSON.stringify(token));
                    localStorage.setItem("sessionId",data.sessionId);
                    localStorage.setItem("tiuloUserName",self.user);
                    
                    //是否记住密码
                    if(self.rememberPWD){
                        localStorage.setItem("tiuloUserPwd",self.pwd);
                        localStorage.setItem("tiuloIsRememberPwd",1);
                    }else{
                        localStorage.setItem("tiuloUserPwd",'');
                        localStorage.setItem("tiuloIsRememberPwd",0);
                    }

                    //获取机构
                    if(self.subSystem == "SJ"){ 
 
                        // 登录获取的信息 传给android  window.这个方法不行。
                        if(browserType != "weixin"){
                            // alertShow("安卓")
                            try{

                                window.JSToAndroid.getPhone(localStorage.getItem("userMobile"));
                                window.JSToAndroid.getToken(localStorage.getItem("token"));
                            }catch(e){

                            } 
                        }
                        //判断是哪种浏览器
                        if (browserType=="weixin") {
                             initWechatJssdk(function(){
                                self.go('/tiulo'); 
                                self.$Indicator.close();
                             });
                        }else{
                            self.go('/tiulo'); 
                            self.$Indicator.close();
                        }

                    }else if(self.subSystem == "KF" || self.subSystem == "TMS"){
                        let s = {action:"/userOrg/query",params:{suoSubSystem:token.subSystem,suoUserId:token.userId,suoSubSystem2:self.subSystem2}};
                        doAjaxQuery(s,function(data) {
                            if(data.status == 0){
                                self.$Indicator.close();
                                self.$transfer.showToast(self, data.info);
                            }else if(data.status == 1){
                                console.log(data)
                                let orgs = data.dataset.rows; 
                                if(orgs && orgs.length>0){
                                    let currOrg = orgs[0];
                                    orgs.forEach(function(item, index){
                                        if(item.suoIsDefault == 1){
                                            currOrg = item;  
                                        }
                                    })
                                    self.setcurrOrg(currOrg);
                                }else{
                                    self.$Indicator.close();
                                    self.$transfer.showToast(self, "您还没有机构，请先创建机构！",'',2000);
                                    setTimeout(function(){
                                        // self.go('/companyAdd','add');
                                        self.go('/noOrg')
                                    },2000)
                                }
                            }
                        });
                    }else{
                        self.$Indicator.close(); 
                    }
                }
            }); 
        },
        setcurrOrg(currOrg){//如果是企业版 设置默认机构
            let self = this;
            let s = {action:"/userOrg/query"};
                s.params = {suoSubSystem:currOrg.suoSubSystem,
                            suoSubSystem2:localStorage.getItem("subSystem2"),
                            suoDistrictName:currOrg.suoDistrictName,
                            suoDistrictId:currOrg.suoDistrictId,
                            suoOrgId:currOrg.suoOrgId,
                            suoId:currOrg.suoId,
                            suoOrgName:currOrg.suoOrgName,
                            suoCompanyId:currOrg.suoCompanyId,
                            suoCompanyName:currOrg.suoCompanyName,
                            opType:"orgChange",
                            clicksubSystem:localStorage.getItem("subSystem2")
                            };

            consoleShow(JSON.stringify(s));
            // alertShow(JSON.stringify(s));
            doAjaxQuery(s,function(data) {
                if(data.status == 0){
                    self.$Indicator.close();
                    self.$transfer.showToast(self, data.info);
                }else if(data.status == 1){
                    //重新设置本地存储中的token值
                    let localToken = Tokens.fetch("token");
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
                    if(self.loginType == "weixin"){
                        localToken["wxHeadPicUrl"] = currOrg.suoUserId + "_wx.gif";
                    }
                    localStorage.setItem("token","");
                    localStorage.setItem("token",JSON.stringify(localToken));

                    // 登录获取的信息 传给android  window.这个方法不行。
                    if(browserType != "weixin"){
                        // alertShow("安卓")
                        try{
                            window.JSToAndroid.getPhone(localStorage.getItem("userMobile"));
                            window.JSToAndroid.getToken(localStorage.getItem("token"));
                        }catch(e){

                        } 
                    }
                    //判断是哪种浏览器
                    if (browserType=="weixin") {
                         initWechatJssdk(function(){
                            self.go('/tiulo'); 
                            self.$Indicator.close();
                         });
                    }else{
                        self.go('/tiulo'); 
                        self.$Indicator.close();
                    }
                }
            });

        },
        loginClick (){//登录按钮点击时
            let self = this;
            if(!self.user){
                self.$transfer.showToast(self, "请输入推流号/手机号");
                return;
            }else if(!self.pwd){
                self.$transfer.showToast(self, "请输入密码");
                return;
            }else{
                let s = {};
                self.subSystem = (self.subSystem2=="TP" || self.subSystem2=="OSP") ? "TMS" :
                                 (self.subSystem2=="BSP" || self.subSystem2=="EP") ? "KF" :
                                                             self.subSystem2=="SJ" ? "SJ":"";
                if(self.loginText == '登录'){
                    s = {action:"/user/login",params:{subSystem2:self.subSystem2,subSystem:self.subSystem,userId:self.user,userPWD:self.pwd}}; 
                }else if(self.loginText == '绑定并登录'){
                    s = {action:"/user/login",params:{subSystem2:self.subSystem2,subSystem:self.subSystem,wxBindId:self.wxOpenId,wxHeadPicUrl:encodeURIComponent(self.wxHeadimgurl),userId:self.user,userPWD:self.pwd}};
                }
                self.login(s);
            }
        },

        QQLogin (){//QQ登录
            let self = this;
            //alertShow("QQ登录")
            // $('#qqLoginBtn').find('a').unbind("click").click();   
        },

        setInfo(code){
            alertShow(code+"login--");
        },

        wxLogin (){//微信登录
            let self = this;
            // alertShow("微信登录")
            self.loginType = "weixin";
            self.wxCode = getUrlParameters('code');
            $.ajax({
                type:"post",
                dataType:"json",
                url:getRootURL() + "/rest/jssdk/getWeChatUserInfo",
                data:{code:self.wxCode},
                success:function (wxData) {
                    if(wxData.errcode){
                        self.wxOpenId = Tokens.fetch("wxOpenId");
                        self.wxHeadimgurl = '';
                    }else{
                        self.wxOpenId = wxData.openid;
                        Tokens.save("wxOpenId","");
                        Tokens.save("wxOpenId",wxData.openid);
                        self.wxHeadimgurl = wxData.headimgurl;
                    }
                    let s = {action:"/user/userQuery",params:{"wxOpenId":self.wxOpenId}};
                    doAjaxQuery(s,function(data) {
                        if(data.status == 0){
                            self.$Indicator.close();
                            self.$transfer.showToast(self, data.info);
                        }else if(data.status == 1){
                            if(data.outParams.result==0){//帐号未绑定推流号
                                self.$MessageBox.confirm('您的帐号没有绑定的推流帐号，是否现在绑定？')
                                    .then(action => { 
                                        self.loginText = '绑定并登录';
                                    }).catch(function(){
                                    })          
                            }else if(data.outParams.result==1){//已绑定账号 
                                self.subSystem = (self.subSystem2=="TP" || self.subSystem2=="OSP") ? "TMS" :
                                                (self.subSystem2=="BSP" || self.subSystem2=="EP") ? "KF" :
                                                                            self.subSystem2=="SJ" ? "SJ":"";
                                let s = {action:"/user/login",sessionId:self.sessionId,params:{subSystem2:self.subSystem2,subSystem:self.subSystem,wxOpenId:self.wxOpenId,wxHeadPicUrl:encodeURIComponent(self.wxHeadimgurl)}} 
                                self.login(s); 
                            }
                        }
                    });
                },      
                error:function(data){
                    // alertShow(JSON.stringify(data))
                }                                        
            });
        },
        register(){//注册
            let self = this;
            self.go('/register',self.isDriver)
        },

    },
    route: {
        data ({ from, to, next }) {
            let self = this; 

            //判断从哪个版本进来
            let hash = window.location.hash;
            if(hash.indexOf("#!") != -1){
                hash = hash.substring(2,hash.length)
            }
            localStorage.setItem("loginUrl",'');
            localStorage.setItem("loginUrl",hash);

            let pathStr = window.location.href.replace(/\s/g, "");
            let num = pathStr.indexOf('isDriver')
            if(num != -1){
                let pathStr2 = pathStr.substr(num,10);
                self.isDriver = pathStr2.split("=")[1];
                localStorage.setItem("isDriver",self.isDriver);
            }else{
                // self.$transfer.showToast(self, "请带上参数，是否是司机版？",'',2000);
                self.isDriver = localStorage.getItem("isDriver");
            }   

            let tiuloUserName = localStorage.getItem("tiuloUserName")
            let tiuloUserPwd = localStorage.getItem("tiuloUserPwd")
            let tiuloIsRememberPwd = localStorage.getItem("tiuloIsRememberPwd")
            
            if(tiuloUserName){
                self.user = tiuloUserName;
            }else{
                self.user = '';
            }
            if(tiuloUserPwd){
                self.pwd = tiuloUserPwd;
            }else{
                self.pwd = '';
            }
            if(tiuloIsRememberPwd == 1){
                self.rememberPWD = true;
            }else{
                self.rememberPWD = false;
            }
            self.loginText = "登录";
            self.loginType = "";
   
            //如果是从tiulo
            if(from.path && from.path.indexOf("tiulo") != -1){
                    localStorage.setItem("token",'');
                    return;     
            }
            //判断是否是登录过的，自动登录
            let token = localStorage.getItem("token");
            if(token){
                //检测用户是否存在 获取当前版本
                let s = {action:"/user/userInfo",params:{"suoUserId":self.user}};
                console.log(JSON.stringify(s));
                doAjaxQuery(s,function(data) {
                    if(data.status == 0){
                        self.$Indicator.close();
                        self.$transfer.showToast(self, data.info);
                    }else if(data.status == 1){
                        console.log(data)
                        self.sessionId = data.sessionId;
                        if(self.isDriver == 1){//是司机
                            self.subSystem2 = 'SJ';
                        }else if(self.isDriver == 0){

                            let hasVersion = data.dataset.rows[0].subSystem1;
                            let prevOrg = data.dataset.rows[0].user[0];
                            if((hasVersion && hasVersion.indexOf("TP") != -1 && prevOrg.suDefaultVersion == 'TP') || (hasVersion && hasVersion.indexOf("OSP") != -1 && prevOrg.suDefaultVersion == 'OSP') || (hasVersion && hasVersion.indexOf("BSP") != -1 && prevOrg.suDefaultVersion == 'BSP') || (hasVersion && hasVersion.indexOf("EP") != -1 && prevOrg.suDefaultVersion == 'EP')){
                                self.subSystem2 = prevOrg.suDefaultVersion;
                            }else if(hasVersion){
                                self.subSystem2 = hasVersion[0];
                            }else{
                                self.subSystem2 = 'TP';
                            }
                            console.log(self.subSystem2)
                        }

                        //执行登录
                        let currsubSystem = (self.subSystem2=="TP" || self.subSystem2=="OSP") ? "TMS" :
                                 (self.subSystem2=="BSP" || self.subSystem2=="EP") ? "KF" :
                                                             self.subSystem2=="SJ" ? "SJ":"";
                        token = JSON.parse(token);
                        let s = {action:"/user/login",params:{subSystem:currsubSystem,subSystem2:self.subSystem2,userId:token['userId'],userPWD:token['userPWD']}}; 
                        console.log(JSON.stringify(s))
                        self.login(s)
                    }
                });

                
            }
            next()
        },
 
        deactivate ({ next }) {
            //Triggers when component destroys
            next()
        },
        canDeactivate ({ next, to, abort }) {
            //Triggers when component destroys
            let self = this;
            self.$parent.$data.taskPageDefalut = "/TMStaskList"
            next()
        },
        activate({to, from, next}) {
            let self = this
            self.$parent.$data.showBar = false;
            next()
        } 
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    .container{
        margin:0 auto; 
        width:100%;
        padding:0 0.75rem;
        max-width: 25rem;
        text-align: center;
    }
    .Logo_box{
        margin-top: 2rem;
        overflow: hidden;
    }
    .Logo_box img{
        width:4rem;
    }
    .Login_box{
        margin-top: 0.5rem;
        overflow: hidden;
    }
    .mint-navbar{
        background: transparent;
    }
    .Login_box p{
        font-family: "微软雅黑";
    }
    .user_row{
        width:100%;
        position: relative;
        margin-top: 0.75rem;
        border: 1px solid #e5e5e5;
        border-radius: 0.3rem;
        background: #fff;
    }
    .user_row .inputIcon{
        position: absolute;
        width:2.5rem;
        border-right: 1px solid #e5e5e5;
        top:0.36rem;
    }
    .user_row>input{
        width:76%;
        padding:0.6rem 0;
        padding-left:20%;
        padding-right:3%;
        border-radius: 0.3rem;
        font-family: "微软雅黑";
    }
    .rememberBtn{
        margin-top:0.5rem;
        overflow: hidden;
    }
    .rememberBtn>div{
        float:left;
    }
    .rememberBtn>span{
        float:right;
    }
    .Login_box .circle{
        display:inline-block;width:1rem;height:1rem;border:1px solid #e5e5e5;border-radius:0.5rem;position:absolute;top:0;left:0;
    }
    .Login_box .circleCheck{
        background:#FFD91E;
    }
    .login_btn{
        background: #FFD91E;
        color:#fff;
        margin-top:1.5rem;
        height:2.2rem;
        line-height: 2.2rem;
        font-family: "微软雅黑";
        color:#000;
    }
    .orText{
        overflow: hidden;
        height:1.5rem;
        line-height:1.5rem;
    }
    .orText li{
        float:left;
        width:20%;
    }
    .orText li.liner{
        width:40%;
        border-bottom:1px solid #e5e5e5;
        margin-top:0.75rem;
    }
    .other_login{
        overflow: hidden;
        margin-bottom: 1rem;
        padding:0 2rem;
    }
    .other_login li{
        float:left;
        width:50%;
        position: relative;
        height:2rem;
        line-height: 2rem;
        padding-left:2.5rem;
        text-align: left;
    }
    .other_login .iconfont{
        font-size: 2rem;
        position: absolute;
        top:0.1rem;
        left:0;
    }
    .copyright{
        margin-top:1rem;
        max-width: 25rem;
    }

</style>
