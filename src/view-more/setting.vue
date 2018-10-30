<template>
    <div class="page"> 
        <mt-header fixed title="设置">
            <mt-button icon="back" slot="left" @click="back('/more')"></mt-button> 
        </mt-header> 
        <div class="container-top" id="safety">
            <mt-cell title="账号与安全" style="background-color: #efefef;"></mt-cell>
            <mt-cell title="账号绑定" @click="go('/bind_account')" is-link></mt-cell>
            <mt-cell title="修改密码" @click="changepwd()" is-link></mt-cell>
            <mt-cell title="消息通知" @click="giveAdvices()" is-link></mt-cell>
            <mt-cell title="支持" style="background-color: #efefef;"></mt-cell>
            <mt-cell title="意见反馈" @click="feedback()" is-link></mt-cell>
            <mt-cell title="把推流告诉好友" @click="share()" is-link></mt-cell>
            <mt-cell title="给推流打分" is-link></mt-cell>
            <mt-button class="payModel_text" :class="{'quit':quiter}" v-show="showConfirm" @click="exit()">退出登录</mt-button>
        </div>
        <!-- 消息通知 -->
        <mt-popup position="right" :visible.sync="pro_plus" :modal="false" popup-transition="popup-slide">
            <mt-header fixed :title="message">
                <mt-button icon="back" slot="left" @click="close_pop()"></mt-button>             
            </mt-header>
            <div class="container-top" id="change_show">
                <mt-cell title="声音"  class="interval">
                    <mt-switch :value.sync="changeVoice"></mt-switch>
                </mt-cell>
                <mt-cell title="振动">
                    <mt-switch :value.sync="changeVibrate"></mt-switch>
                </mt-cell>
                <mt-cell title="夜间免打扰（24:00-8:00）">
                    <mt-switch :value.sync="changeTrouble"></mt-switch>
                </mt-cell>
                <span class='prompt_font'>功能消息免打扰</span>
                <mt-cell title="异常消息">
                    <mt-switch :value.sync="changeAbnormal"></mt-switch>
                </mt-cell>
                <mt-cell title="业务提醒">
                    <mt-switch :value.sync="changeBusiness"></mt-switch>
                </mt-cell>
                <mt-cell v-if="subSystem!='KF'" title="收付款提醒">
                    <mt-switch :value.sync="changePayments"></mt-switch>
                </mt-cell>
                <mt-cell title="账单提醒">
                    <mt-switch :value.sync="changeAudit"></mt-switch>
                </mt-cell>
                <mt-cell title="报表提醒">
                    <mt-switch :value.sync="changeReport"></mt-switch>
                </mt-cell>
                <!-- <mt-cell title="账单提醒">
                    <mt-switch :value.sync="changeBill"></mt-switch>
                </mt-cell> -->
                <mt-cell title="系统提醒">
                    <mt-switch :value.sync="changeSystem"></mt-switch>
                </mt-cell>
                <mt-cell title="公告">
                    <mt-switch :value.sync="changeNotice"></mt-switch>
                </mt-cell>
            </div>
        </mt-popup>
        <!-- 修改密码 -->
        <mt-popup position="right" :visible.sync="change_password" :modal="false" popup-transition="popup-slide">
            <mt-header fixed :title="message">
                <mt-button icon="back" slot="left" @click="close_pop()"></mt-button>
                <mt-button slot="right" @click="savepwd()" class="save">保存</mt-button>              
            </mt-header>
            <div class="container-top" id="pwd">
                <span class='prompt_font'>旧密码</span>
                <div class="parent_box">
                    <span class="daughter_icon iconfont">&#xe61e;</span>
                    <input class="daughter_ipt" v-model="oldpwdValue" type="text" placeholder="请输入旧密码" maxlength="16">
                </div>
                <span class='prompt_font'>新密码</span>
                <div class="parent_box">
                    <span class="daughter_icon iconfont">&#xe61e;</span>
                    <input class="daughter_ipt" v-model="newpwdValue" type="text" placeholder="请输入新密码" maxlength="16">
                </div>
                <span class='prompt_font'>确认密码</span>
                <div class="parent_box">
                    <span class="daughter_icon iconfont">&#xe61e;</span>
                    <input class="daughter_ipt" v-model="repeatpwdValue" type="text" placeholder="请再次输入新密码" maxlength="16">
                </div>
                <span class='prompt_font'></span>
                <mt-cell title="忘记密码" is-link @click.stop="forgetPwd()"></mt-cell>
            </div>
        </mt-popup>
        <!-- 意见反馈 -->
        <mt-popup position="right" :visible.sync="opinion_show" :modal="false" popup-transition="popup-slide" id="idear">
            <mt-header fixed :title="message">
                <mt-button icon="back" slot="left" @click="close_pop()"></mt-button>
                <mt-button slot="right" @click="transmit()" class="save">发 送</mt-button>  
            </mt-header>
            <div class="container-top idea_container" id="idea">
                <div class="multi_box">
                    <div class="multi_div">
                        <textarea class="multi_line" placeholder="请您在这里填写对推流的意见，我们将不断改进，谢谢支持！" v-model="userText"></textarea>
                    </div>
                </div>
                <div class="write_text1">
                    <span class="iconfont prefix" style="width:15%;background-color:transparent;">&#xe6fb;</span>
                    <input class="write_ipt" style="padding-left:15%;" type="text" placeholder="邮箱选填，以使我们回复您" v-model="touch_email">
                </div>
            </div>
        </mt-popup>
        <!-- 分享 -->
        <mt-popup :visible.sync="shareVisible" position="bottom" :modal="false" class="head_portrait" popup-transition="popup-fade">
            <div class="sub_content">
                <div class="shared">分享到</div>
                <div class="share_container">
                    <div class="piece_share" style="margin-left: 14%;">
                        <span class="iconfont">&#xe65f;</span>
                        <b>微信好友</b>
                    </div>
                    <div class="piece_share">
                        <span class="iconfont friendster" style="color:#16B750;">&#xe685;</span>
                        <b>微信朋友圈</b>
                    </div>
                    <div class="piece_share">
                        <span class="iconfont" style="font-size:2.1rem;color:#2C96FE;">&#xe61f;</span>
                        <b>QQ</b>
                    </div>
                </div>
                <div class="select_head" style="margin-top:.3rem;" @click="cancel()">取消</div>
            </div>            
        </mt-popup>
        <!-- 忘记密码 -->
        <mt-popup :visible.sync="forgetpwdVisible" position="right" :modal="false" popup-transition="popup-slide">
            <mt-header fixed title="忘记密码">
                <mt-button icon="back" slot="left" @click="back_pop()"></mt-button>
                <mt-button slot="right" @click.stop="savenewpwd()" class="save">保存</mt-button>              
            </mt-header>
            <div class="container-top" id="forget_pwd">
                <div class="write_text1">
                    <div class="prefix">手机号</div>
                    <input class="write_ipt" type="tel" placeholder="请输入手机号" v-model="telphones" maxlength="11">
                    <button class="code" @click.stop="send_code()" :disabled="disabled">{{auth_code}}</button>
                </div>
                <div class="write_text1">
                    <div class="prefix">验证码</div>
                    <input class="write_ipt" type="tel" placeholder="请输入验证码" v-model="codeNum" maxlength="6">
                </div>
                <div class="write_text1">
                    <div class="prefix">设置新密码</div>
                    <input class="write_ipt pwd_ipt" type="text" placeholder="请输入新密码" v-model="newpwdNum">
                </div>
            </div>
        </mt-popup>
    </div>
</template>

<script>
import { MessageBox } from 'mint-ui';
import Tokens from '../token'
// Ajax request module, return a Promise
export default {
    data () {
        return {
            token:'',//token值
            user_info:'',
            codeNUmber:'验证码',
            newNum:'设置新密码',
            showConfirm:true,
            message: '',
            messages:'您的意见已经提交，感谢您对推流的支持！',
            title:'意见反馈',
            change_password: false,//修改密码页面
            pro_plus: false,//消息通知页面
            changeVoice: false,//声音的切换
            changeVibrate: false,//振动的切换
            changeTrouble: false,//免打扰的切换
            changeAbnormal: false,//异常消息的切换
            changeBusiness: false,//业务提醒的切换
            changePayments: false,//收付款提醒的切换
            changeAudit: false,//审核提醒的切换
            changeReport: false,//报表提醒的切换
            changeBill: false,//账单提醒的切换
            changeSystem: false,//系统提醒的切换
            changeNotice: false,//公告的切换
            opinion_show: false,//反馈意见页面

            shareVisible:false,//分享

            oldpwdValue:'',//旧密码
            newpwdValue:'',//新密码
            repeatpwdValue:'',//重复密码
            userText:'',//反馈意见内容
            touch_email:'',//联系邮箱
            quiter: false,//
            forgetpwdVisible:false,//忘记密码页面
            telphones:'',//输入的手机号码
            disabled: false,//获取验证码字样点击事件
            timer: null,//计时器
            auth_code: '获取验证码',
            codeNum:'',//书写验证码
            newpwdNum:'',//设置新密码

            subSystem: "",//版本
        }
    },
    watch:{
        'changeVoice': function(e){//声音
            let self = this;
            let c = "suIsYesNo10";
            if(e){
                self.save(c,1);
            }else{
                self.save(c,0);
            }            
        },
        'changeVibrate': function(e){//振动
            let self = this;
            let c = "suIsYesNo11";
            if(e){
                self.save(c,1);
            }else{
                self.save(c,0);
            }            
        },
        'changeTrouble': function(e){//夜间免打扰
            let self = this;
            let c = "suIsYesNo12";
            if(e){
                self.save(c,1);
            }else{
                self.save(c,0);
            }            
        },
        'changeAbnormal': function(e){//异常消息
            let self = this;
            let c = "suIsYesNo02";
            if(e){
                self.save(c,1);
            }else{
                self.save(c,0);
            }            
        },
        'changeBusiness': function(e){//业务提醒
            let self = this;
            let c = "suIsYesNo13";
            if(e){
                self.save(c,1);
            }else{
                self.save(c,0);
            }            
        },
        'changePayments': function(e){//收付款提醒
            let self = this;
            let c = "suIsYesNo14";
            if(e){
                self.save(c,1);
            }else{
                self.save(c,0);
            }            
        },
        'changeAudit': function(e){//审核提醒
            let self = this;
            let c = "suIsYesNo15";
            if(e){
                self.save(c,1);
            }else{
                self.save(c,0);
            }            
        },
        'changeReport': function(e){//报表提醒
            let self = this;
            let c = "suIsYesNo16";
            if(e){
                self.save(c,1);
            }else{
                self.save(c,0);
            }            
        },
        // 'changeBill': function(e){//账单提醒
        //     let self = this;
        //     // if(e){
        //     //     self.set_message('suIsYesNo10',1);
        //     //     self.save('suIsYesNo10',1);
        //     // }else{
        //     //     self.set_message('suIsYesNo10',0);
        //     //     self.save('suIsYesNo10',0);
        //     // }            
        // },
        'changeSystem': function(e){//系统提醒
            let self = this;
            let c = "suIsYesNo17";
            if(e){
                self.save(c,1);
            }else{
                self.save(c,0);
            }    
        },
        'changeNotice': function(e){//公告
            let self = this;
            let c = "suIsYesNo18";
            if(e){
                self.save(c,1);
            }else{
                self.save(c,0);
            }            
        },
    },
    ready(){
        let self = this;
        //声音
        if(self.user_info.suIsYesNo10 == 1){
            self.changeVoice = true;
        }else{
            self.changeVocie = false
        }
        // 震动
        if(self.user_info.suIsYesNo11 == 1){
            self.changeVibrate = true;
        }else{
            self.changeVibrate = false
        }
        //夜间免打扰
        if(self.user_info.suIsYesNo12 == 1){
            self.changeTrouble = true;
        }else{
            self.changeTrouble = false
        }
        //异常消息
        if(self.user_info.suIsYesNo02 == 1){
            self.changeAbnormal = true;
        }else{
            self.changeAbnormal = false
        }
        //业务提醒
        if(self.user_info.suIsYesNo13 == 1){
            self.changeBusiness = true;
        }else{
            self.changeBusiness = false
        }
        //收付款提醒
        if(self.user_info.suIsYesNo14 == 1){
            self.changePayments = true;
        }else{
            self.changePayments = false
        }
        //审核提醒
        if(self.user_info.suIsYesNo15 == 1){
            self.changeAudit = true;
        }else{
            self.changeAudit = false
        }
        //报表提醒
        if(self.user_info.suIsYesNo16 == 1){
            self.changeReport = true;
        }else{
            self.changeReport = false
        }
        //账单提醒
        // if(self.user_info.suIsYesNo10 == 1){
        //     self.changeBill = true;
        // }else{
        //     self.changeBill = false
        // }
        //系统提醒
        if(self.user_info.suIsYesNo17 == 1){
            self.changeSystem = true;
        }else{
            self.changeSystem = false
        }
        //公告
        if(self.user_info.suIsYesNo18 == 1){
            self.changeNotice = true;
        }else{
            self.changeNotice = false
        }
    },
    methods: {
        save(key,val){
            let self = this;
            let myDate = new Date();
            let s = {action:"/user/save",commandType:"Update",rowId:self.user_info.rowId};
            s.datasets = {dsData:{rows:[{rowId:self.user_info.rowId,"state":'u',"suId":self.user_info.suId,"suModifyDate":myDate}]}};
            // s.datasets.rows[0] = key;
            s.datasets.dsData.rows[0][key] = val;
            doAjaxUpdate(s,function(data) {
                if(data.status == 0){
                    self.$transfer.backLogin(self, data);
                }else if(data.status == 1){
                    if(key == "suIsYesNo10" || key == "suIsYesNo12"){
                        self.token[key] = val;
                        Tokens.save("token",self.token)
                    }
                    self.user_info[key] = val;
                    Tokens.save("user_info",self.user_info);
                }
            })
        },
        go (link, param) {
            let self = this
            self.$transfer.go(self, link, param)
        },
        back (link, param) {
            let self = this
            self.$transfer.back(self, link, param);
        },
        close_pop(){
            let self = this;
            self.pro_plus = false;
            self.change_password = false;
            self.opinion_show = false;
            self.userText = '';
            self.touch_email = '';
        },
        cancel(){//推流到好友
            let self = this;
            self.shareVisible = false;
        },
        back_pop(){//返回修改密码页面
            let self = this;
            self.forgetpwdVisible = false;
            self.telphones = '';
            self.codeNum = '';
            self.newpwdNum = '';
            if (self.timer) {
                clearInterval(self.timer);
                self.auth_code = '发送验证码';
                self.disabled = false;
                self.timer = null;
            }
        },
        exit(){//退出登录
            let self = this;
            let s = {"id":"dsData","name":"out_dsData","action":"/user/exit","showLoading":false};
            MessageBox.confirm('您是否确认退出系统？').then(action => {
                doAjaxQuery(s,function(data) {
                    if(data.status == 0){
                        self.$transfer.backLogin(self, data);
                    }else if(data.status == 1){
                        consoleShow(data)
                        localStorage.setItem("tiuloUserPwd",'');
                        localStorage.setItem("token",'');
                        localStorage.setItem("tiuloIsRememberPwd",0);
                        // self.back('/login');
                        self.$transfer.back(self,localStorage.getItem("loginUrl")); 
                    }
                })
            }); 
        },
        changepwd(){//修改密码
            let self = this;
            self.change_password = true;
            self.message = '修改密码';
        },
        forgetPwd(){//忘记密码
            let self = this;
            self.forgetpwdVisible = true;
        },
        send_code(){//发送验证码
            let self = this;
            let reg = /^(13[0-9]|14[0-9]|15[0-9]|18[0-9])\d{8}$/i;
            if(self.telphones == ''){
                self.$transfer.showToast(self, "请输入您的手机号码");
                return;
            }else{
                // 提交手机号码
                let s = {action:"user/checkMobile/"+self.telphones,commandType:"Query",id:"dsData",showFields:{suMobile:self.telphones}};
                let t = {action:"/user/msg/"+self.telphones,commandType:"Query",showFields:{suMobile:self.telphones}};
                consoleShow(JSON.stringify(s));
                doAjaxQuery(s,function(data){
                    console.log(data)
                    if(data.status == 0){
                        self.$transfer.backLogin(self, data);
                    }else if(data.status == 1){
                        console.log(data)
                        if(data.dataset.allRowCount > 0){
                            doAjaxQuery(t,function(date){
                                if(date.status == 0){
                                    self.$transfer.backLogin(self, data);
                                }else if(date.status == 1){
                                    consoleShow(date)
                                    self.$nextTick(()=>{
                                        let time = 60;
                                        self.disabled = true;
                                        self.timer = setInterval(function () {
                                          time--;
                                          self.auth_code = time + '秒后重新获取';
                                          if (time == 0) {
                                            clearInterval(self.timer);
                                            self.auth_code = '重新获取';
                                            self.disabled = false;
                                          }
                                        }, 1000);
                                    })   
                                }
                            })
                        }else{
                            self.$transfer.showToast(self, "您输入的不是绑定的手机号");
                            return;
                        }                    
                    }
                });
            }
        },
        savenewpwd(){//提交新密码
            let self = this;
            let reg = /^(13[0-9]|14[0-9]|15[0-9]|18[0-9])\d{8}$/i;
            let myDate = new Date();
            // let s = {action:"/user/save",commandType:"Update",rowId:self.user_info.rowId};
            // s.datasets = {dsData:{rows:[{rowId:self.user_info.rowId,"state":'u',"suId":self.user_info.plugOriginal,"suPWD":self.newpwdValue,"suModifyDate":myDate}]}};
            let s = {action:"/user/checkCode/"+self.telphones+'/'+self.codeNum,commandType:"Query"}
            if(self.telphones == ''){
                self.$transfer.showToast(self, "请输入您的手机号码");
                return;
            }else if(!reg.test(self.telphones)){
                self.$transfer.showToast(self, "您输入的手机号码格式不正确");
                return;
            }else if(self.telphones !== self.user_info.suMobile){
                self.$transfer.showToast(self, "请输入您绑定的手机号");
                return
            }else if(self.newpwdNum === self.user_info.suPWD){
                self.$transfer.showToast(self, "新密码与旧密码相同");
                return
            }else if(self.codeNum == ''){
                self.$transfer.showToast(self, "请输入验证码");
                return
            }else{
                doAjaxQuery(s,function(data){
                    if(data.status == 0){
                        self.$transfer.backLogin(self, data);
                    }else if(data.status == 1){
                        consoleShow(data)
                        if(data.outParams.msg==false){
                            self.$transfer.showToast(self, "验证码有错");
                            self.codeNum = '';
                            return
                        }else{
                            self.$Indicator.open();
                            let myDate = new Date();
                            let t = {action:"/user/save",commandType:"Update",rowId:self.user_info.rowId};
                            t.datasets = {dsData:{rows:[{rowId:self.user_info.rowId,"state":'u',"suId":self.user_info.suId,"suPWD":self.newpwdNum,"suModifyDate":myDate}]}};
                            doAjaxUpdate(t,function(data) {
                                if(data.status == 0){
                                    self.$transfer.backLogin(self, data);
                                }else if(data.status == 1){
                                    consoleShow(data)
                                    self.user_info.suPWD = self.newpwdNum;
                                    Tokens.save("user_info",self.user_info);
                                    self.newpwdNum = '';
                                    self.codeNum = '';
                                    self.telphones = '';
                                    if (self.timer) {
                                      clearInterval(self.timer);
                                      self.auth_code = '获取验证码';
                                      self.disabled = false;
                                      self.timer = null;
                                    };
                                    self.forgetpwdVisible = false;
                                }
                                self.$Indicator.close();
                            })
                        }
                    }
                })
            }
        },
        savepwd(){//保存密码
            let self = this;
            let myDate = new Date();
            let s = {action:"/user/save",commandType:"Update",rowId:self.user_info.rowId};
            s.datasets = {dsData:{rows:[{rowId:self.user_info.rowId,"state":'u',"suId":self.user_info.suId,"suPWD":self.newpwdValue,"suModifyDate":myDate}]}};
            if(self.oldpwdValue == null || self.oldpwdValue == ''){
                self.$transfer.showToast(self, "旧密码不能为空");
                return
            }else if(self.oldpwdValue != self.user_info.suPWD){
                self.$transfer.showToast(self, "您输入的旧密码不正确");
                return
            }else if(self.newpwdValue == null || self.newpwdValue == ''){
                self.$transfer.showToast(self, "新密码不能为空");
                return
            }else if(self.oldpwdValue == self.newpwdValue){
                self.$transfer.showToast(self, "您输的新密码和旧密码相同");
                return
            }else if(self.newpwdValue.length < 6){
                self.$transfer.showToast(self, "您输入的密码不能少于6位");
                return
            }else if(self.newpwdValue.length > 16){
                self.$transfer.showToast(self, "您输入的密码不能多于16位");
                return
            }else if(self.repeatpwdValue == null || self.repeatpwdValue == ''){
                self.$transfer.showToast(self, "请您输入确认密码");
                return
            }else if(self.repeatpwdValue != self.newpwdValue){
                self.$transfer.showToast(self, "您输入的密码不一致");
                return
            }else{
                doAjaxUpdate(s,function(data) {
                if(data.status == 0){
                    self.$transfer.backLogin(self, data);
                }else if(data.status == 1){
                    consoleShow(data)
                    self.user_info.suPWD = self.newpwdValue;
                    Tokens.save("user_info",self.user_info);
                    self.change_password = false;
                    self.oldpwdValue = '';
                    self.newpwdValue = '';
                    self.repeatpwdValue = '';
                }
            });
            }
        },
        giveAdvices(){//消息通知
            let self = this;
            self.pro_plus = true;
            self.message = '消息中心';
        },
        feedback(){//意见反馈
            let self = this;
            self.opinion_show = true;
            self.message = '意见反馈';
        },
        transmit(){//意见反馈提交按钮
            let self = this;
            //进入页面时token不存在
            if(!localStorage.getItem("token")){
                self.$transfer.backLogin(self, {info:'token没有值'});
                return;
            }
            let emailReg=/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
            let s = {action:"/cmsInfo/save",commandType:"Update",rowId:self.user_info.rowId};
            s.datasets = {dsData:{rows:[{"state":'i',"cinfText":self.userText,"cinfStr1":self.touch_email,"cinfSendUserId":self.user_info.suId,"cinfTitle":self.message}]}};
            if(self.touch_email){
                if(!emailReg.test(self.touch_email)){
                    self.$transfer.showToast(self, "您输入的邮箱格式不正确");
                    return
                }
            }
            if(self.userText.length < 10){
                self.$transfer.showToast(self, "内容不可少于10个字！");
                return
            }else{
                doAjaxUpdate(s,function(data) {
                    if(data.status == 0){
                        self.$transfer.backLogin(self, data);
                    }else if(data.status == 1){
                        consoleShow(data)
                        MessageBox.alert('您的意见已经提交，感谢您对推流的支持！','感谢反馈',{'confirmButtonClass':'verify','confirmButtonText':"确 定"}).then(action => {
                            self.opinion_show = false;
                            self.userText = '';
                            self.touch_email = '';
                        }); 
                    }
                });
            }     
        },
        share(){//分享好友
            let self = this;
            // self.shareVisible = true;
            if(browserType == 'weixin'){
                alert('weixin')
            }else{
                alert('Android')
             
                window.JSToAndroid.shareText();
            }
            window.JSToAndroid.shareText(); 
        }
    },
    route: {
        data ({ to, next }) {
            let self = this;
            if(Tokens.fetch("token") == ''){
                self.$transfer.back(self, '/login');
            }else{
                let user = Tokens.fetch("user_info");
                self.token = Tokens.fetch("token");
                self.user_info = user;
                self.subSystem = Tokens.fetch('token')['subSystem'];
            }
            
            next();
        },
        deactivate ({ next }) {
            //Triggers when component destroys
            next()
        },
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    .quit{display: none;}
    .mint-popup{
        width: 100%;height: 100%; background: #f1f1f1;z-index: 2;
    }
    .interval{
        margin-top: .6rem;
    }
    .save{
        color:#FFD91E;
        padding: 0;
        font-size: .6rem;
    }
    .prompt_font{
        display: block;
        width:100%;
        height:1.5rem;line-height: 1.5rem;
        margin-top:.5rem;margin-left: .5rem;
    }
    .payModel_text{
        text-align:center;
        width:100%;
        height:2.5rem;
        line-height:2.5rem;
        font-size:1rem;
        background-color: #333;
        color:#fff;
        margin-bottom:0;
        position:fixed;
        bottom:0;
        border-radius: 0;
    }
    #change_show .mint-cell{
        padding:0;
    }
    /*意见反馈*/
    .idea_container{
        padding:1rem;
    }
    .multi_box{
        width:100%;
        height:10rem;
        background-color: #fff;
        margin: 0 auto;
        margin-bottom:.5rem;
        border-radius: .5rem;
        overflow: hidden;
    }
    .reply_email{
        float:left;
        width:12%;
        padding:2px 0;
        line-height: 2rem;
        text-align: center;
    }
    .multi_div{
        width:100%;
        height:100%;
        padding:2%;
        border-radius: .5rem;
    }
    .multi_line{
        padding: 0;margin:0;
        display: block;
        width:100%;
        font-size: .7rem;
        height:100%;
        resize: none;
        border:none;
    }
    .bind_email{
        float:left;
        width:88%;
        margin: 0 auto;
        padding:4px 0;
    }
    #idear .iconfont{
        font-size: 1rem;
    }
    /*分享好友*/
    .head_portrait{
        width:100%;
        height:9rem;
        /*background-color: #fff;*/
    }
    .sub_content{
        width:100%;
        position: fixed;
        left:0;bottom:0;
    }
    .select_head{
        width:100%;height:2.5rem;
        line-height: 2.5rem;
        background-color: #fff;
        text-align: center;
        font-size: .9rem;
        border-top: 1px solid #eee;
    }
    .shared{
        width:100%;height:2rem;
        line-height: 2rem;
        padding:.3rem .5rem;
        background-color: #fff;
    }
    .share_container{
        width:100%;
        overflow: hidden;
        background-color: #fff;
    }
    .piece_share{
        float:left;
        margin: 0 6%;
        padding:.3rem 0;
        text-align: center;
    }
    .piece_share>span{
        font-size: 2rem;
        color:#09C911;
        line-height: 2.5rem
    }
    .piece_share>b{
        display: block;
    }
    .piece_share>.friendster{
        display: block;
        font-size: 2.2rem;
        margin-top: -0.15rem;
        margin-bottom: 0.15rem;
    }
    /*修改密码*/
    .parent_box{
        position: relative;
        background-color: #fff;
        overflow: hidden;
    }
    .daughter_icon{
        position: absolute;
        top:0;left:0;
        display: block;
        width:15%;
        height:2.3rem;line-height: 2.3rem;
        text-align: center;
    }
    .daughter_ipt{
        width:100%;
        float: left;
        /*padding:0.6rem 0;*/
        padding:0;
        height:2.3rem;
        line-height: .9rem;
        padding-left: 15%;
    }
    /*忘记密码*/
    .chunk{
        width:100%;
        height:2.3rem;
        line-height: 2.3rem;
        background-color: #fff;
        vertical-align: middle;
        position: relative;
    }
    .chunk span{
        display: inline-block;
        width:20%;
        font-size: .7rem;
        text-align: center;
    }
    .chunk input{
        width:38%;
    }
    .code{
        position: absolute;
        top:.25rem;right:.5rem;
        height:1.5rem;line-height: 1.5rem;
        background-color: #FFD91E;
        border:none;
        border-radius: 4px;
    }

    .write_text1{
        position: relative;
        width:100%;
        margin:0 auto;
        margin-top: .5rem;
        overflow: hidden;
        background-color: #fff;
    }
    .write_ipt{
        display: block;
        float:left;
        width:100%;
        padding:0;
        padding-left: 25%;
        height:2rem;
        /*margin-top: -2px;*/
    }
    .prefix{
        position: absolute;
        top:0;left:0;
        width:25%;
        height:2rem;line-height: 2rem;
        background-color: #fff;
        text-align: center;
    }
</style>
<style>
    .mint-switch-input:checked + .mint-switch-core{
        background-color: #FFD91E;
        border-color:#FFD91E;
    }
    #change_show .mint-cell-value{
        width:46px;display:inline-flex;
    }
    #change_show .mint-cell-value .mint-switch-core{
        width:46px;height:26px;border-radius: 13px;
    }
    #change_show .mint-cell-value .mint-switch-core:before{
        width:44px;height:24px;
    }
    #change_show .mint-cell-value .mint-switch-core:after{
        width:24px;height:24px;
    }
    /*意见反馈--邮箱格式*/
    #idea .mint-field .mint-cell{
        padding:4px 0;
        border-radius: 5px;
    }
    #idea .mint-field .mint-cell-title{
        width:0;
    }
    .affirm{
        width:40%;
        height:1.5rem;
        line-height: 1.5rem;
        color:#333;
        border-radius: 6px;
        background-color: #FFD91E;
        margin:20% auto;
    }
    /*忘记密码页面*/
    #forget_pwd .mint-cell{
        padding: .5rem 0;
        text-align: center;
    }
    #forget_pwd .mint-cell-title{
        width:20%;
    }
</style>
