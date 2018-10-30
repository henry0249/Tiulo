<template>
    <div class="page">
        <div class="container">
            <!-- logo -->
            <div class="logo_box">
                <img src="../img/T_icon.png">
                <p>推流 Tiulo</p>
            </div>
            <div class="register_title">
                <p>注册账号</p>
            </div>
            <!--<form id="form_register" method="get">-->
            <div class="version_hint">
                <p>请选择版本</p>
            </div>
            <div class="c_version">
                <div class="tms c_version_selected" @click="version_tms">
                    <p>运力版</p>
                </div>
                <div class="kf" @click="version_kf">
                    <p>企业版</p>
                </div>
            </div>
            <!-- 用户名 -->
            <div class="user_row">
                <span slot="icon" class="iconfont inputIcon">&#x344b;</span>
                <input type="text" v-model="userName" @change="validateUsername" id="userName" name="userName" placeholder="用户名支持汉字, 数字, 字母, -和_">
            </div>
            <div class="errorMes" id="errorUsername"></div>

            <!-- 性别 -->
            <div class="user_row_sex">
                <div class="sex_icon">
                    <span slot="icon" class="iconfont inputIcon">&#xe60c;</span>
                </div>
                <div class="sex_input" id="userSex">
                    <span class="circle sex sex_man _selected" @click="sex_man" name="sex" value="男"></span>
                    <span style="display:inline-block;margin-left:1.2rem;" @click="sex_man">男</span>
                    <span class="circle sex sex_woman" @click="sex_woman" name="sex" value="女" style="margin-left:0.5rem;"></span>
                    <span style="display:inline-block;margin-left:1.6rem;" @click="sex_woman">女</span>
                </div>
            </div>

            <!-- 手机号 -->
            <div class="user_row" id="user_row_mobile">
                <span slot="icon" class="iconfont inputIcon" style="font-size:0.7rem;font-family:'微软雅黑';">+86</span>
                <input type="text" v-model="userPhone" @change="validatePhone" id="userPhone" name="userPhone" placeholder="设置登录的手机号">
            </div>
            <div class="errorMes" id="errorMobile"></div>

            <!-- 登录密码 -->
            <div class="user_row">
                <span slot="icon" class="iconfont inputIcon">&#xe61e;</span>
                <input type="password" v-model="userPWD" id="userPWD" name="userPWD" @change="userPassword" placeholder="登录密码(6-16个字符, 区分大小写)">
            </div>
            <div class="errorMes" id="errorPassword"></div>

            <!-- 验证码 -->
            <div class="user_row">
                <span slot="icon" class="iconfont inputIcon">&#xe647;</span>
                <input class="yz_code_inp" v-model="PINcode" @change="validatePINcode" type="text" name="PINcode" id="PINcode" placeholder="请输入6位验证码" style="width:45%;">
                <div class="yz_code">
                    <button type="button" class="yz_code_btn" id="send_PIN_code" @click="sendPINCode">发送验证码</button>
                </div>
            </div>
            <div class="errorMes" id="errorPINcode"></div>

            <!-- 注册按钮 -->
            <div>
                <mt-button class="login_btn" id="btn_register" size="large" @click="register">同意以下协议并注册</mt-button>
                <p class="user_protocol">推流用户协议</p>
            </div>
            <div style="margin-top:0.5rem;font-size:1rem;">
                <p @click="back('/login')">返回登录</p>
            </div>
            <!--</form>-->

        </div>
    </div>
</template>

<script>

    export default {
        data() {
            return {
				subSystem: "TMS",//版本
                userName: "",//用户名
                sex: "男",//性别
                userPhone: "",//手机号码
                userPWD: "",//密码
                PINcode: "",//验证码
                datasource: "dbcon",//dbtms正式库, dbtest测试库, dbcon开发库
                isLogin: "",//是否自动登录成功
            }
        },
        //内容改变时调用
        watch: {
            //验证用户名
            "userName": function(){
              this.validateUsername();
            },
            //验证手机号
            "userPhone": function(){
                this.validatePhone();
            },
            //验证密码
            "userPWD": function(){
                this.userPassword();
            },
            "PINcode": function(){
                this.validatePINcode();
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
            //点击注册按钮
            register(){
                let self = this;
                //验证
                this.validateAll();
                //验证不通过不能注册
                if(!(this.validateUsername() && this.validatePhone() && this.userPassword() && this.validatePINcode())){
                    return;
                }
                var jsonData = {
                    action: "/user/register",
                    params: {
                        "userName": $('#userName').val(),
                        "sex": $('#userSex').find("._selected").attr("value"),
                        "mobile": $('#userPhone').val(),
                        "password": $('#userPWD').val(),
                        "code": $('#PINcode').val(),
                        "subSystem": this.subSystem,
                        "invitationCode": "*",
                        "datasource": self.datasource//dbtms正式库, dbtest测试库, dbcon开发库
                    },
                    showError: function(error){
                        if(typeof error != "undefined"){
                           self.$Toast({//显示错误提示
                                message: error,
                                position: "bottom",
                                duration: 5000
                           });
							$("#errorPINcode").text(error);
                        }
                    },
                };
                //注册
                doAjaxQuery(jsonData, function(data){
                    //consoleShow("注册");
                    //consoleShow(JSON.stringify(data, null, 4));
                    if(data.status == 1){//注册成功
                        self.$Toast({//显示提示
                            message: "注册成功",
                            position: 'center',
                            duration: 1500
                        });

                        //注册成功后自动登录
                        var actionData1 = {
                            action:"/user/login",
                            params:{
                                userId: self.userPhone,
                                userPWD: self.userPWD,
                                datasource: self.datasource,
                                subSystem: self.subSystem,
                            }
                        };

                        //登录之前清空sessionId, 不然另一个用户登录会报错
                        localStorage.setItem("sessionId", "");
                        //登录
                        doAjaxQuery(actionData1, function(data) {
                            //consoleShow("登录");
                            //consoleShow(JSON.stringify(data, null, 4));
                            if(data.status == 1){//登录成功
								//保存sessionId
                                localStorage.setItem("sessionId", data.sessionId);
                                localStorage.setItem(data.sessionId, JSON.stringify(data.dataset.rows[0]));
                                //关闭提示框
                                //self.$Toast.close();
                                setTimeout(function(){
                                    self.$Indicator.open({
                                        text: '自动登录中...',
                                        spinnerType: 'fading-circle'
                                    });
                                }, 1500);
                                //跳转到主页
                                setTimeout(function(){
                                    self.$Indicator.close();
                                    self.go("/home");
                                }, 3000);

                            }
                        });

                    }
                });

            },
            //注册成功之后 自动登录
            login(){
                let self = this;
                var actionData = {
                    action:"/user/login",
                    params:{
                        userId: self.userPhone,
                        userPWD: self.userPWD,
                        datasource: self.datasource
                    }
                };
                doAjaxQuery(actionData, function(data) {
                    consoleShow(JSON.stringify(data, null, 4));
                    if(data.status == 1){//登录成功
                        self.isLogin = true;
                    }
                });
            },
            //发送验证码
            sendPINCode(){
                //检验手机号合法性
                this.validatePhone();
                if(!this.validatePhone()){
                    return;//手机号不合法终止代码
                }
                //请求数据
                var jsonData = {action: "/user/checkMobile/" + $('#userPhone').val() + "/" + this.subSystem};
                doAjaxQuery(jsonData, function(data){
                    var rows = data.dataset.rows;//后台返回的Json数据
                    if(rows.length == 1){//手机号已经注册
                        $("#errorMobile").text("该手机号已经注册");//错误提示
                    }else if(rows.length == 0){//手机号没有注册
                        //发送验证码
                        var actionQuery = {action: "/user/msg/" + $('#userPhone').val()};
                        doAjaxQuery(actionQuery, function(data){
                            //consoleShow(JSON.stringify(data, null, 4));
                            //发送验证码短信倒计时
                            var countNum = 30;//倒计时时间
                            //$('#send_PIN_code').attr("disabled","disabled");//按钮禁用
                            //$('#send_PIN_code').css("background", "#767676");//按钮背景色
                            //$('#send_PIN_code').css("color", "#E8DA95");//按钮字体
                            var repeatSend = setInterval(function(){
                                if (countNum > 0) {
                                    if(countNum == 30){
                                        $('#send_PIN_code').attr("disabled","disabled");//按钮禁用
                                        $('#send_PIN_code').css("background", "#767676");//按钮背景色
                                        $('#send_PIN_code').css("color", "#E8DA95");//按钮字体
                                    }
                                    $('#send_PIN_code').html("重新发送(" + (countNum--) + "秒)");
                                } else {
                                    $('#send_PIN_code').removeAttr('disabled');
                                    $('#send_PIN_code').css("background", "rgb(53,53,53)");//按钮背景色
                                    $('#send_PIN_code').css("color", "rgb(255,217,30)");//按钮字体
                                    $('#send_PIN_code').html('发送验证码');
                                    clearInterval(repeatSend);//退出计时器
                                }
                            }, 1000);
                        });
                    }
                });

            },
            validateAll(){
                this.validateUsername();
                this.validatePhone();
                this.userPassword();
                this.validatePINcode();
            },
            //验证用户名
            validateUsername(){
                //用户输入的username的值
                var username = $.trim($("#userName").val());
                var account = /^[\u4e00-\u9fa50-9a-zA-Z-_]{2,16}$/;
                //判断长度是否合法
                if(username.length == 0 || username.length == ''){
                    $("#errorUsername").text("请输入用户名");
                    return false;
                }else{
                    $("#errorUsername").text("");
                }
                //判断长度是否合法
                if(username.length > 16 || username.length < 2){
                    $("#errorUsername").text("用户名不能小于2个字符且不能超过16个字符");
                    return false;
                }else{
                    $("#errorUsername").text("");
                }
                //判断字符是否合法
                if(!account.test(username)){
                    $("#errorUsername").text("用户名仅支持汉字, 数字, 字母, -和_");
                    return false;
                }else{
                    $("#errorUsername").text("");
                }
                return true;
            },
            //验证手机号码
            validatePhone(){
                var telphoneNum = $.trim($("#userPhone").val());
                var tel = /^((1[3,5,8][0-9])|(14[5,7])|(17[0,6,7,8]))\d{8}$/;
                if(telphoneNum == "" || telphoneNum.length <= 0){
                    $("#errorMobile").text("请输入手机号");
                    return false;
                }else{
                    $("#errorMobile").text("");
                }
                if(!tel.test(telphoneNum)){
                    $("#errorMobile").text("手机号不合法: 必须是11为数字");
                    return false;
                }else{
                     $("#errorMobile").text("");
                }
                return true;
            },
            //密码
            userPassword(){
                var password = $.trim($("#userPWD").val());
                if(password.length == 0 || password == ""){
                    $("#errorPassword").text("请输入密码");
                    return false;
                }else{
                    $("#errorPassword").text("");
                }
                if(password.length > 16 || password.length < 6){
                    $("#errorPassword").text("密码不能小于6个字符且不能超过16个字符");
                    return false;
                }else{
                    $("#errorPassword").text("");
                }
                return true;
            },
            //验证码
            validatePINcode(){
                var PINcode = $.trim($("#PINcode").val());
                if(PINcode == '' || PINcode.length == 0){
                    $("#errorPINcode").text("请输入验证码");
                    return false;
                }else{
                     $("#errorPINcode").text("");
                }
                if(PINcode.length > 6){
                    $("#errorPINcode").text("验证码是6位数字");
                    return false;
                }else{
                     $("#errorPINcode").text("");
                }
                return true;
            },
            //选择版本加样式
            version_tms(){
                let self = this;
                self.subSystem = "TMS";
                $(".tms").addClass("c_version_selected");
                $(".kf").removeClass("c_version_selected");
            },
            version_kf(){
                let self = this;
                self.subSystem = "KF";
                $(".kf").addClass("c_version_selected");
                $(".tms").removeClass("c_version_selected");
            },
            //选择性别加样式
            sex_man(){
                $(".sex_man").css("background", "#FFD91E");
                $(".sex_woman").css("background", "#fff");
                $(".sex_man").addClass("_selected");
                $(".sex_woman").removeClass("_selected");
            },
            sex_woman(){
                $(".sex_woman").css("background", "#FFD91E");
                $(".sex_man").css("background", "#fff");
                $(".sex_woman").addClass("_selected");
                $(".sex_man").removeClass("_selected");
            }

        }
    }
</script>

<style scoped>
    .errorMes{
        width:auto;
        height: 1.25rem;
        line-height:1.25rem;
        text-align:center;
        color:red;
        font-weight: bold ;
        padding-left:0;
    }

    .container{
        margin:0 auto;
        width:100%;
        height: 100%;
        padding:0 0.75rem;
        max-width: 25rem;
        text-align: center;
        font-family: '微软雅黑';
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
    }
    .register_title p{
        font-size: 1.25rem;
        color: #111;
    }
    .version_hint{
        text-align: left;
    }
    .c_version{
        height: 2.5rem;
        margin-bottom:0.75rem;
    }
    .c_version div{
        height: 2.5rem;
        width: 50%;
        float: left;
        line-height: 2.5rem;
        font-size: 1.25rem;
        padding-bottom: 0.5rem;
    }
    .c_version div:hover{
        color: #000;
    }
    .c_version_selected{
        color: #000;
        border-bottom: 0.15rem solid #FFD91E;
    }
    .user_row{
        width: 100%;
        height: 2.4rem;
        margin-top:0.05rem;
        background:#fff;
        border-radius: 0.3rem;
        border:0.05rem solid #e5e5e5;
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
    .user_row_sex{
        width: 100%;
        height: 2.4rem;
        background:#fff;
        border-radius: 0.3rem;
        border:0.05rem solid #e5e5e5;
        margin-bottom: 1.25rem;
    }
    .sex_icon{
        width: 20%;
        line-height: 2.4rem;
        float: left;
    }
    .sex_input{
        width:75%;
        height: 100%;
        line-height:2.4rem;
        float: left;
        text-align:left;
        padding-left:0.5rem;
        border-left: 0.05rem solid #e5e5e5;
    }
    .sex_man{
        background:#FFD91E;
    }
    .circle{
        margin-top:0.7rem;
        display:inline-block;
        width:1rem;
        height:1rem;
        border:0.05rem solid #e5e5e5;
        border-radius:0.5rem;
        position:absolute;
    }
    .yz_code_inp{
        width:40%;
    }
    .yz_code button{
        width:31%;
        height:2.3rem;
        float:right;
        border:none;
        border-radius: 0 0.3rem 0.3rem 0;
        background:rgb(53,53,53);
        color:rgb(255,217,30);
        font-family:'微软雅黑';
    }

    .login_btn{
        background: #FFD91E;
        color:#333;
        height:2.2rem;
        line-height: 2.2rem;
        font-family:'微软雅黑';
    }
    .user_protocol{
        text-decoration: underline;
        margin-top: 0.25rem;
        color: blue;
    }

</style>