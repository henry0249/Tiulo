<template>
    <div class="page">
        <div class="container">
            <div class="logo_box">
                <img src="../img/T_icon.png">
                <p>推流 Tiulo</p>
            </div>
            <div class="register_title">注册账号</div>
            <!-- 手机号 -->
            <div class="user_row">
                <span class="inputIcon" style="font-size:0.7rem;">+86</span>
                <input class="user_phone" autocomplete="off" type="text" v-model="userPhone" placeholder="设置登录的手机号">
            </div>
            <!-- 登录密码 -->
            <div class="user_row">
                <span class="iconfont inputIcon">&#xe61e;</span>
                <input class="user_phone" autocomplete="off" type="password" v-model="userPWD" placeholder="登录密码(6-16个字符, 区分大小写)">
            </div>
            <!-- 验证码 -->
            <div class="user_row">
                <span class="iconfont inputIcon">&#xe647;</span>
                <input class="user_phone yz_code_inp" v-model="PINcode" type="text" placeholder="请输入6位验证码" maxlength="6">
                <div class="yz_code">
                    <button type="button" class="yz_code_btn" :class="{disabled_code:codeClass}" :disabled="codeClass" @click="sendPINCode()">{{codeName}}</button>
                </div>
            </div>
            <mt-button class="login_btn" size="large" @click="register()">同意以下协议并注册</mt-button>
            <div class="user_protocol">推流用户协议</div>
            <div class="backlogin" @click="backWay()">返回登录</p></div>
        </div>
    </div>
</template>

<script>
import Tokens from '../token';
export default {
    data() {
        return {
			// subSystem: "TMS",//版本(司机版)
            // userName: "",//用户名
            // sex: "男",//性别
            userPhone: "",//手机号码
            userPWD: "",//密码
            PINcode: "",//验证码
            codeClass:false,
            codeName:"发送验证码",
            disShowText:false,
            timer:false,//是否执行倒计时的定时器
            isDriver:'',//是否是司机
        }
    },
    methods: {
        go (link, param) {
            let self = this;
            self.$transfer.go(self, link, param)
        },
        back (link, param) {
            let self = this;
            self.$transfer.back(self, link, param);
        },
        // 返回登陆
        backWay(){
            let self = this;
            self.userPhone = '';
            self.userPWD = '';
            self.PINcode = '';
            clearInterval(self.timer);//退出计时器
            self.codeName = "发送验证码";
            self.codeClass = false;
            // self.back('/login');
            self.$transfer.back(self,localStorage.getItem("loginUrl")); 
        },
        //发送验证码
        sendPINCode(){
            let self = this;
            let tel = /^((1[3,5,8][0-9])|(14[5,7])|(17[0,6,7,8]))\d{8}$/;
            if(self.userPhone == "" || self.userPhone.length <= 0){
                self.$transfer.showToast(self, "请输入手机号", "center", 1500);
                return;
            }else if(!tel.test(self.userPhone)){
                self.$transfer.showToast(self, "手机号不合法", "center", 1500);
                return;
            }else{
                //请求数据
                let s = {action: "/user/checkMobile/" + self.userPhone};
                doAjaxQuery(s, function(data){
                    if(data.status == 0){
                       self.$transfer.backLogin(self, data);
                    }else if(data.status == 1){
                        console.log(data)
                        let rows = data.dataset.rows;//后台返回的Json数据
                        if(rows.length == 1){//手机号已经注册
                            self.$transfer.showToast(self, "该手机号已经注册", "center", 1500);//错误提示
                            return;
                        }else if(rows.length == 0){//手机号没有注册
                            //发送验证码
                            let t = {action: "/user/msg/" + self.userPhone};
                            doAjaxQuery(t, function(date){
                                if(date.status == 0){
                                   self.$transfer.backLogin(self, date);
                                }else if(date.status == 1){
                                    console.log(date)
                                    //发送验证码短信倒计时
                                    let countNum = 30;//倒计时时间
                                    // self.timer = true;
                                    self.timer = setInterval(function(){
                                        if (countNum > 0) {
                                            if(countNum >= 30){
                                                self.codeClass = true;
                                            }
                                            self.codeName = "重新发送(" + (countNum--) + "秒)"
                                        } else {
                                            self.codeClass = false;
                                            self.codeName = "发送验证码";
                                            clearInterval(self.timer);//退出计时器
                                        }
                                    }, 1000);
                                }
                            })
                        }
                    }
                })
            }
        },
        //点击注册按钮
        register(){
            let self = this;
            let tel = /^((1[3,5,8][0-9])|(14[5,7])|(17[0,6,7,8]))\d{8}$/;
            if(self.userPhone == "" || self.userPhone.length <= 0){
                self.$transfer.showToast(self, "请输入手机号", "center", 1500);
                return;
            }else if(!tel.test(self.userPhone)){
                self.$transfer.showToast(self, "手机号不合法: 必须是11为数字", "center", 1500);
                return;
            }else if(self.userPWD == "" || self.userPWD.length <= 0){
                self.$transfer.showToast(self, "请输入密码", "center", 1500);
                return;
            }else if(self.userPWD.length > 16 || self.userPWD.length < 6){
                self.$transfer.showToast(self, "密码不能小于6个字符且不能超过16个字符", "center", 1500);
                return;
            }else if(self.PINcode == '' || self.PINcode.length <= 0){
                self.$transfer.showToast(self, "请输入验证码", "center", 1500);
                return;
            }else if(self.PINcode.length < 6){
                self.$transfer.showToast(self, "验证码是6位数字", "center", 1500);
                return;
            }else{
                let s;
                if(self.isDriver == 0){
                    s = {
                        action: "/user/register",
                        params: {
                            "mobile": self.userPhone,
                            "password": self.userPWD,
                            "code": self.PINcode,
                            "invitationCode": "*",
                            "datasource": dbType,
                        },
                    };
                }else{
                    s = {
                        action: "/user/register",
                        params: {
                            "mobile": self.userPhone,
                            "password": self.userPWD,
                            "code": self.PINcode,
                            "invitationCode": "*",
                            "datasource": dbType,
                            subSystem2:"SJ",
                            subSystem:"SJ",
                        },
                    };
                }
                    
                console.log(JSON.stringify(s))
                //注册
                doAjaxQuery(s, function(data){
                    if(data.status == 0){
                       self.$transfer.backLogin(self, data);
                    }else if(data.status == 1){
                        console.log(data)
                        let obj = data.dataset.rows[0];
                        self.$transfer.showToast(self, "注册成功", "center", 1500);
                        localStorage.setItem("tiuloUserName",self.userPhone)
                        localStorage.setItem("tiuloUserPwd",self.userPWD)
                        localStorage.setItem("registerUserData",obj.suId)
                        // self.$nextTick(()=>{
                        //     self.userPhone = '';
                        //     self.userPWD = '';
                        //     self.PINcode = '';
                        //     clearInterval(self.timer);//退出计时器
                        //     self.codeName = "发送验证码";
                        //     self.codeClass = false;
                        //     self.go('/noOrg')
                        // })
                        // 注册成功后自动登录
                        let t;
                        if(self.isDriver == 0){
                            t = {
                                action:"/user/login",
                                params:{
                                    userPhone:self.userPhone,
                                    PINcode:self.PINcode,
                                    datasource:dbType,
                                    userId:obj.suId,
                                    userPWD:self.userPWD,
                                }
                            };
                            console.log(JSON.stringify(t))
                        }else{
                            t = {
                                action:"/user/login",
                                params:{
                                    userPhone:self.userPhone,
                                    PINcode:self.PINcode,
                                    datasource:dbType,
                                    userId:obj.suId,
                                    userPWD:self.userPWD,
                                    subSystem2:"SJ",
                                    subSystem:"SJ",
                                }
                            };
                            console.log(JSON.stringify(t))
                        }
                        
                        
                        self.login(t)
                    }
                })
            }
        },
        login(s){
            let self = this;
            //登录之前清空sessionId和token, 不然另一个用户登录会报错
            localStorage.setItem("userMobile",'');
            localStorage.setItem("token",'');
            localStorage.setItem("sessionId",'');
            localStorage.setItem("subSystem",'');
            doAjaxQuery(s,function(data) {
                // console.log(data.status)
                // self.$Indicator.open();
                if(data.status == 0){
                    // self.$Indicator.close();
                    self.$transfer.showToast(self, data.info);
                }else if(data.status == 1){
                    console.log(data)
                    let token = data.dataset.rows[0];
                    //设置token值
                    localStorage.setItem("userMobile",token.userMobile);
                    // localStorage.setItem("subSystem",token.subSystem);
                    
                    localStorage.setItem("sessionId",data.sessionId);
                    localStorage.setItem("tiuloUserName",self.userPhone);
                    // console.log(Tokens.fetch("token"))
                    setTimeout(function(){
                        self.$Indicator.open({
                            text: '自动登录中...',
                            spinnerType: 'fading-circle'
                        });
                    }, 1500);
                    //注册成功跳至创建机构页面
                    setTimeout(function(){
                        self.$Indicator.close();
                        self.userPhone = '';
                        self.userPWD = '';
                        self.PINcode = '';
                        clearInterval(self.timer);//退出计时器
                        self.codeName = "发送验证码";
                        self.codeClass = false;
                        if(self.isDriver == 0){
                            localStorage.setItem("token",JSON.stringify(token));
                            self.go('/noOrg')
                        }else{
                            token.subSystem = "SJ";
                            localStorage.setItem("token",JSON.stringify(token));
                            localStorage.setItem('subSystem',"SJ")
                            localStorage.setItem('subSystem2',"SJ")
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
                    }, 3000);
                }
            })
        },
    },
    route: {
        data ({ from, to, next }) {
            let self = this;
            self.isDriver = localStorage.getItem("isDriver");
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
            next()
        }
    }
}
</script>

<style scoped>
    .container{
        margin:0 auto;
        width:100%;
        height: 100%;
        padding:0 0.75rem;
        max-width: 25rem;
        text-align: center;
        padding-bottom: 2.5rem;
    }
    .logo_box{
        padding-top: 0.5rem;
    }
    .logo_box img{
        width: 3rem;
    }
    .register_title{
        padding: 0.5rem;
        font-size: 1.25rem;
        color: #111;
    }
    /*手机号*/
    .user_row{
        width: 100%;
        height: 2.4rem;
        margin-top:0.05rem;
        background:#fff;
        border-radius: 0.3rem;
        border:0.05rem solid #e5e5e5;
        margin-bottom: 1.25rem;
    }
    .inputIcon{
        width: 20%;
        line-height: 2.35rem;
        float: left;
        border-right: 0.05rem solid #e5e5e5;
    }
    .user_phone{
        width:72%;
        float: left;
        text-align:left;
        padding: 0.65rem 0 0.6rem 0.5rem;
    }
    .yz_code_inp{
        width:40%;
    }
    .yz_code_btn{
        width:31%;
        height:2.3rem;
        float:right;
        border:none;
        border-radius: 0 0.3rem 0.3rem 0;
        background:rgb(53,53,53);
        color:rgb(255,217,30);
    }
    .login_btn{
        background: #FFD91E;
        color:#333;
        height:2.2rem;
        line-height: 2.2rem;
    }
    .user_protocol{
        text-decoration: underline;
        margin-top: 0.5rem;
        color: blue;
    }
    .backlogin{
        margin-top:0.5rem;font-size:1rem;
    }
    .disabled_code{
        background-color: #767676;
        color:#E8DA95;
    }
</style>