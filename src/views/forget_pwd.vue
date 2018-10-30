<template>
    <div class="page"> 
        <mt-header fixed title="忘记密码">
            <mt-button icon="back" slot="left" @click="backlogin()"></mt-button>
        </mt-header>
        <div class="container-top">
            <div class="Logo_box">
                <img src="../img/T_icon.png">
                <p>推流 Tiulo</p>
            </div>
            <div class="_title">
                <p>重置密码</p>
            </div>
            <!-- 手机号 -->
            <div class="user_row">
                <span slot="icon" class="iconfont inputIcon" style="font-size:0.7rem;font-family:'微软雅黑';">+86</span>
                <input type="text" v-model="userPhone" placeholder="设置登录的手机号">
            </div>
            <!-- 验证码 -->
            <div class="user_row">
                <span slot="icon" class="iconfont inputIcon">&#xe647;</span>
                <input class="yz_code_inp" v-model="PINcode" type="text" placeholder="请输入6位验证码" style="width:45%;">
                <div class="yz_code">
                    <button type="button" :class="{disableds:disabled}" class="yz_code_btn" :disabled="disabled" @click="sendPINCodes()">{{sendPINCode}}</button>
                </div>
            </div>
            <!-- 登录密码 -->
            <div class="user_row">
                <span slot="icon" class="iconfont inputIcon">&#xe61e;</span>
                <input type="password" v-model="userPWD" placeholder="登录密码(6-16个字符, 区分大小写)">
            </div>
            <!--重置按钮-->
            <div class="user_row" style="margin-top:0.25rem;">
                <mt-button class="reset_btn" size="large" @click="resetPWD()">重 置</mt-button>
            </div>
            <!--返回登录页面-->
            <div class="goback">
                <p @click="backlogin()">返回登录</p>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    data () {
        return {
            userPhone:"",//输入的手机号码
            PINcode:"",//输入的验证码
            userPWD:"",//输入的密码
            sendPINCode:"发送验证码",//发送验证码字体
            timer:false,//发送验证码定时器
            disabled: false,//获取验证码字样点击事件
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
        backlogin(){
            let self = this;
            self.userPhone = "";
            self.PINcode = "";
            self.userPWD = "";
            clearInterval(self.timer);
            self.timer = false;
            self.sendPINCode = '发送验证码';
            self.disabled = false;
            // $('.yz_code_btn').removeAttr('disabled');
            localStorage.setItem('token','');
            // self.back('/login');
            self.$transfer.back(self,localStorage.getItem("loginUrl")); 
        },
        sendPINCodes(){//发送验证码
            let self = this;
            let tel = /^((1[3,5,8][0-9])|(14[5,7])|(17[0,6,7,8]))\d{8}$/;
            if(self.userPhone == "" || self.userPhone.length <= 0){
                self.$transfer.showToast(self, "请输入11位手机号",1500);
                return;
            }else if(!tel.test(self.userPhone)){
                self.$transfer.showToast(self, "请输入正确的11位手机号",1500);
                return;
            }else{
                //请求数据
                let jsonData = {action: "/user/queryUserId/" + self.userPhone};
                doAjaxQuery(jsonData, function(data){
                    if(data.status == 0){//手机号尚未注册
                        self.$transfer.showToast(self, "该手机号尚未注册",1500);
                        return;
                    }else if(data.status == 1){//手机号已经注册, 可以找回密码
                        //发送验证码
                        let s = {action: "/user/msg/" + self.userPhone};
                        doAjaxQuery(s, function(data){
                            console.log(data)
                            if(data.status == 0){
                                self.$transfer.backLogin(self, data);
                            }else if(data.status == 1){
                                let time = 30;
                                self.disabled = true;
                                // $(".yz_code_btn").attr("disabled","disabled");//按钮禁用
                                self.timer = setInterval(function () {
                                    time--;
                                    self.sendPINCode = '重新发送('+ time + '秒)';
                                    if (time == 0) {
                                        clearInterval(self.timer);
                                        self.timer = false;
                                        self.sendPINCode = '重新发送';
                                        // $('.yz_code_btn').removeAttr('disabled');
                                        self.disabled = false;
                                    }
                                },1000)
                            }
                        })
                    }
                })
            }
        },
        resetPWD(){//重置
            let self = this;
            let tel = /^((1[3,5,8][0-9])|(14[5,7])|(17[0,6,7,8]))\d{8}$/;
            if(self.userPhone == "" || self.userPhone.length <= 0){
                self.$transfer.showToast(self, "请输入11位手机号",1500);
                return;
            }else if(!tel.test(self.userPhone)){
                self.$transfer.showToast(self, "请输入正确的11位手机号",1500);
                return;
            }else if(self.userPWD == "" || self.userPWD.length <=0){
                self.$transfer.showToast(self, "重置密码不能为空",1500);
                return;
            }else if(self.userPWD.length > 16 || self.userPWD.length < 6){
                self.$transfer.showToast(self, "密码不能小于6个字符且不能超过16个字符",1500);
                return;
            }else if(self.PINcode == '' || self.PINcode.length == 0){
                self.$transfer.showToast(self, "请输入验证码",1500);
                return;
            }else if(self.PINcode.length > 6){
                self.$transfer.showToast(self, "验证码是6位数字",1500);
                return;
            }else{
                let s = {action: "/user/queryUserId/" + self.userPhone}
                //验证手机号是否已经注册
                doAjaxQuery(s, function(data){
                    if(data.status == 0){//手机号尚未注册
                        self.$transfer.showToast(self, "该手机号尚未注册",1500);
                        return;
                    }else if(data.status == 1){//手机号已经注册
                        //执行修改密码操作
                        let t = {action: "/user/modifyPWD/" + self.userPhone + "/" + self.PINcode + "/" + dbType + "/" + self.userPWD};
                        //重置密码
                        doAjaxQuery(t, function(data){
                            if(data.status == 0){
                                self.$transfer.showToast(self, "验证码错误或已失效",1500);
                                return;
                            }else if(data.status == 1){//修改成功
                                self.$transfer.showToast(self, "密码修改成功! 即将返回登录页面...", "center", 3000);
                                setTimeout(function(){
                                    localStorage.setItem('token','');
                                    self.userPhone = "";
                                    self.userPWD = "";
                                    self.PINcode = "";
                                    clearInterval(self.timer);//退出计时器
                                    self.sendPINCode = '发送验证码';
                                    // self.back('/login');
                                    self.$transfer.back(self,localStorage.getItem("loginUrl")); 
                                }, 3000) 
                            }
                        });
                    }
                })
            }
        },
    },
    route: {
        data ({ to, next }) {
            //this.getProjectData();
             next()
        },
        deactivate ({ next }) {
            //Triggers when component destroys
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
<style scoped>
    .container-top{
        margin:0 auto; 
        width:100%;
        padding:0 0.75rem;
        max-width: 25rem;
        text-align: center;
    }
    .Logo_box{
        margin-top: 0.75rem;
        overflow: hidden;
        font-family: "微软雅黑";
    }
    .Logo_box img{
        width:4rem;
    }
    .Login_box{
        margin-top: 0.5rem;
        overflow: hidden;
    }
    ._title p{
        font-family: "微软雅黑";
        font-size:1.15rem;
        margin-top: 0.75rem;
        margin-bottom:0.75rem;
    }
    .user_row{
        width: 100%;
        height: 2.4rem;
        margin-top: 0.05rem;
        background:#fff;
        border-radius: 0.3rem;
        border: 0.05rem solid #e5e5e5;
        margin-bottom: 1.25rem;
    }
    .user_row .inputIcon{
        width: 20%;
        line-height: 2.35rem;
        float: left;
        border-right: 0.05rem solid #e5e5e5;
    }
    .user_row input{
        height: 2.3rem;
        width:75%;
        line-height:2.4rem;
        float: left;
        text-align:left;
        padding:0;
        padding-left:0.5rem;
        font-family:'微软雅黑';
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
        font-family:'微软雅黑';
    }
    .reset_btn{
        background: #FFD91E;
        color:#fff;
        margin-bottom: 0.5rem;
        height:2.3rem;
        line-height: 2.2rem;
        font-family: "微软雅黑";
        color: #000;
    }
    .goback{
        margin-top: 0.25rem;
    }
    .goback p{
        font-family: "微软雅黑";
        color: #000;
        font-size:0.85rem;
        text-decoration:underline;
    }
    .disableds{
        color:#E8DA95;
        background-color: #767676;
    }
</style>