<template>
    <div class="page"> 
        <mt-header fixed title="账户绑定">
            <mt-button icon="back" slot="left" @click="back('/setting')"></mt-button>
            <!-- <mt-button slot="right" @click="getPosition()">测试</mt-button>  -->
        </mt-header> 
        <div class="container-top" id="bind_wx">
            <mt-cell class="interval revamp" :title="phoneNum">
                <mt-button @click="amend()">修 改</mt-button>
            </mt-cell>
            <span class='prompt_font'>社区账号绑定</span>
            <!-- <mt-cell title="QQ" class="revamp">
                <mt-button class="qqbind" @click="bound()">绑 定</mt-button>
                <span slot="icon" class="iconfont icon_blue">&#xe61f;</span>
            </mt-cell> -->
            <mt-cell title="微信" class="revamp change_revamp" v-show="user_info.suWeiXin == ''">
                <mt-button class="wxbind" @click="wxBind()">绑 定</mt-button>
                <img src="../img/wxtb.png" slot="icon" width="38">
            </mt-cell>
            <mt-cell title="微信" class="revamp change_revamp" v-show="user_info.suWeiXin != ''">
                <mt-button class="relieve" @click="wxRelieveBind()">解 绑</mt-button>
                <img :src="wxHeadimgurl" slot="icon" width="38">
            </mt-cell>
        </div>
        <!-- 更换手机号 -->
        <mt-popup position="right" :visible.sync="popupVisible" :modal="false" popup-transition="popup-slide">
            <mt-header fixed :title="message">
                <mt-button icon="back" slot="left" @click="close_pop()"></mt-button>         
                <mt-button slot="right" @click="next_step()" class="save">下一步</mt-button>      
            </mt-header>
            <div class="container-top" id="note_code">
                <div class="hint_text">
                    <p style="text-align:center;">跟换手机号后，下次登录可以使用新手机号登录。</p>
                    <p>当前手机号：{{user_info.suMobile}}</p>
                </div>
                <div class="write_text">
                    <div class="prefix">+86</div>
                    <input class="write_ipt" type="tel" placeholder="请输入新手机号" v-model="telNum" maxlength="11">
                </div>
            </div>
        </mt-popup>
        <!-- 填写验证码 -->
        <mt-popup position="right" :visible.sync="codeVisible" :modal="false" popup-transition="popup-slide">
            <mt-header fixed :title="message">
                <mt-button icon="back" slot="left" @click="close_popuop()"></mt-button>             
            </mt-header>
            <div class="container-top">
                <div class="hint_text">
                    <p>短信验证码已发送，请填写验证码</p>
                </div>
                <div class="write_text">
                    <div class="prefix">手机号</div>
                    <input class="write_ipt" type="text" readonly="readonly" :placeholder="placeholderNum">
                </div>
                <div class="write_text" style="margin-bottom:1rem;">
                    <div class="prefix">验证码</div>
                    <input class="write_ipt" type="tel" placeholder="请输入验证码" v-model="codeNum" maxlength="6">
                </div>
                <mt-button class="submit" @click="commit()">提交</mt-button>
                <div class="hint_text" @click="anew_send()"><p style="color:#00CED1;">未收到验证码?</p></div>
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
            user_info:'',
            phoneNum:'',//显示标题
            telNumber: '',
            popupVisible: false,//更换手机号
            codeVisible:false,//验证码页面
            message: '',
            telNum:'',//输入的手机号
            codeNum: '',
            readonly:true,
            placeholderNum:'',//默认状态号码
            subSystem:'',
            statues:'',

            wxBindCode:'',//微信code
            wxBindOpenId:'',//微信的openId
            wxHeadimgurl:'',//微信头像路径
            wxBindName:'',//微信名称
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
        close_pop(){//更换手机号返回
            let self = this;
            self.popupVisible = false;
            self.telNum = '';
        },
        close_popuop(){
            let self = this;
            self.codeVisible = false;
            self.telNum = '';
        },
        wxBind(){//绑定微信
            let self = this;
            self.wxBindCode = getUrlParameters('code');
            $.ajax({
                type:"post",
                dataType:"json",
                url:getRootURL() + "/rest/jssdk/getWeChatUserInfo",
                data:{code:self.wxBindCode},
                success:function (wxData) {
                    if(wxData.errcode){
                        self.wxBindOpenId = Tokens.fetch("wxBindOpenId");
                        self.wxHeadimgurl = Tokens.fetch("wxHeadimgurl");
                        // self.wxBindName = Tokens.fetch("wxBindName");
                    }else{
                        self.wxBindOpenId = wxData.openid;
                        self.wxHeadimgurl = wxData.headimgurl;
                        self.wxBindName = wxData.nickname;
                        Tokens.save("wxBindOpenId",wxData.openid);
                        Tokens.save("wxHeadimgurl",wxData.headimgurl);
                        // Tokens.save("wxBindName",wxData.nickname);
                    }
                    MessageBox.confirm('您确定绑定当前微信账号吗?')
                    .then(action => { 
                        let myDate = new Date();
                        let t = {imgparams:encodeURIComponent(wxData.headimgurl),mode:"user",id:self.user_info.suId,type:"weChatLogo"};
                        doAjaxUpload("single",t, function(data){
                            self.wxHeadimgurl = data.vispath;
                            Tokens.save("wxHeadimgurl",self.wxHeadimgurl);
                        })
                        let s = {action:"/user/save",commandType:"Update",rowId:self.user_info.rowId};
                        s.datasets = {dsData:{rows:[{rowId:self.user_info.rowId,"state":'u',"suId":self.user_info.suId,"suWeiXin":self.wxBindOpenId,"suModifyDate":myDate}]}};
                        doAjaxUpdate(s,function(data) {
                            if(data.status == 0){
                                self.$transfer.backLogin(self, data);
                            }else if(data.status == 1){
                                consoleShow(data)
                                self.user_info.suWeiXin = self.wxBindOpenId;
                                Tokens.save("user_info",self.user_info);
                                self.$transfer.showToast(self, "绑定成功");
                            }
                        })
                    })
                    
                },
                error:function(data){
                    consoleShow(data)
                }
            })
        },
        wxRelieveBind(){//解除绑定微信
            let self = this;
            MessageBox.confirm('您确定要解除绑定微信账号吗?')
            .then(action => { 
                let myDate = new Date();
                let s = {action:"/user/save",commandType:"Update",rowId:self.user_info.rowId};
                s.datasets = {dsData:{rows:[{rowId:self.user_info.rowId,"state":'u',"suId":self.user_info.suId,"suWeiXin":'',"suModifyDate":myDate}]}};
                doAjaxUpdate(s,function(data) {
                    if(data.status == 0){
                        self.$transfer.backLogin(self, data);
                    }else if(data.status == 1){
                        consoleShow(data)
                        self.user_info.suWeiXin = '';
                        Tokens.save("user_info",self.user_info)
                        self.$transfer.showToast(self, "解绑成功");
                    }
                })
            })
        },
        amend(){//手机号码修改
            let self = this;
            self.popupVisible = true;
            self.message = '更换手机号';
        },
        anew_send(){//未收到验证码,再次发送验证码
            let self = this;
            self.statues = 2;
            let s = {action:"user/checkMobile/"+self.telNum,commandType:"Query",id:"dsData",showFields:{suMobile:self.telNum}};
            let t = {action:"/user/msg/"+self.telNum,commandType:"Query",showFields:{suMobile:self.telNum}};
            let w = self.statues;
            self.resend_code(s,t,w);
            self.$nextTick(()=>{
                self.codeNum = '';
                self.$transfer.showToast(self, "已重新发送验证码到你的手机");
            })
        },
        resend_code(s,t,index){
            let self = this;
            doAjaxQuery(s,function(data){
                if(data.status == 0){
                    self.$transfer.backLogin(self, data);
                }else if(data.status == 1){
                    console.log(data)
                    if(data.dataset.allRowCount == 1){
                        doAjaxQuery(t,function(date){
                            if(date.status == 0){
                                self.$transfer.backLogin(self, data);
                            }else if(date.status == 1){
                                consoleShow(date)
                                self.codeVisible = true;   
                            }
                        })
                    }else{
                        self.$transfer.showToast(self, "手机号已经注册");
                        return;
                    }                    
                }
            });
        },
        next_step(){//修改手机号下一步
            let self = this;
            self.statues = 1;
            let reg = /^(13[0-9]|14[0-9]|15[0-9]|18[0-9])\d{8}$/i;
            //判断手机号码格式与原号码是否一样
            console.log(self.telNum)
            console.log(self.user_info)
            if(self.telNum == self.user_info.suMobile){
                self.$transfer.showToast(self, "当前手机号已绑定");
                return;
            }else if(self.telNum == null || self.telNum == ''){
                self.$transfer.showToast(self, "新手机号码不能为空");
                return;
            }else if(!reg.test(self.telNum)){
                self.$transfer.showToast(self, "您输入的手机号码格式不正确");
                return
            }else{
                MessageBox.confirm(
                    '我们将发送验证码到您的手机：<br>'+'+86'+self.telNum,
                ).then(action =>{
                    // 提交手机号码
                    let s = {action:"user/checkMobile/"+self.user_info.suMobile+'/'+self.subSystem,commandType:"Query",id:"dsData",showFields:{suMobile:self.user_info.suMobile}};
                    let t = {action:"/user/msg/"+self.telNum,commandType:"Query",showFields:{suMobile:self.user_info.suMobile}};
                    let w = self.statues;
                    self.resend_code(s,t,w);
                    consoleShow(JSON.stringify(s))
                    self.$nextTick(()=>{
                        self.placeholderNum = self.telNum;
                        self.message = '填写验证码';
                    })
                });
            }
        },
        commit(){//提交验证码
            let self = this;
            let s = {action:"/user/checkCode/"+self.placeholderNum+'/'+self.codeNum,commandType:"Query"}
            doAjaxQuery(s,function(data){
                if(data.status == 0){
                    self.$transfer.backLogin(self, data);
                }else if(data.status == 1){
                    if(data.outParams.msg==false){
                        self.$transfer.showToast(self, "验证码有错");
                        self.codeNum = '';
                        return
                    }else{
                        let myDate = new Date();
                        let t = {action:"/user/save",commandType:"Update",rowId:self.user_info.rowId};
                        t.datasets = {dsData:{rows:[{rowId:self.user_info.rowId,"state":'u',"suId":self.user_info.suId,"suMobile":self.placeholderNum,"suModifyDate":myDate}]}};
                        doAjaxUpdate(t,function(data) {
                            if(data.status == 0){
                                self.$transfer.backLogin(self, data);
                            }else if(data.status == 1){
                                self.user_info.suMobile = self.placeholderNum;
                                self.phoneNum =self.phoneNum = '手机号码: '+self.placeholderNum;
                                Tokens.save('user_info',self.user_info);
                                self.codeVisible = false;
                                self.telNum = '';
                            }
                        })
                    }
                }
            })
            // self.codeVisible = false;
        },
        // getPosition(){
        //     //用ajax请求
        //     $.ajax({
        //         url: "/wechat/jssdk",//请求地址
        //         type: 'post',//post请求
        //         dataType: 'json',
        //         contentType: "application/x-www-form-urlencoded; charset=utf-8",
        //         data: {
        //             'url': location.href.split('#')[0]//将第一个#号前的地址传递
        //         },
        //         //请求成功的函数
        //         success: function (data) {
        //             alert("data=="+JSON.stringify(data))
        //             wx.config({
        //                 // debug: true,
        //                 appId: data.data.appId,
        //                 timestamp: data.data.timestamp,
        //                 nonceStr: data.data.nonceStr,
        //                 signature: data.data.signature,
        //                 jsApiList: ['checkJsApi', 'getLocation']
        //             });
        //             wx.ready(function () {
        //                 wx.getLocation({
        //                     //获得定位成功
        //                     success: function (res) {
        //                         alert("res=="+JSON.stringify(res))
        //                         //这是微信返回的真正经纬度
        //                         let oldLat = res.latitude; // 纬度，浮点数，范围为90 ~ -90
        //                         let oldLng = res.longitude; // 经度，浮点数，范围为180 ~ -180。
        //                         /*下面是为了将获得的真正经纬度转换为对应的百度经纬度，因为是利用百度地图的经纬度去查询数据的，数据库中存的也是百度的经纬度*/
        //                         //创建一个百度地图的点
        //                         let customerPoint = new BMap.Point(oldLng, oldLat);
        //                         let convertor = new BMap.Convertor();
 
        //                         let pointArr = [];//创建一个数组
        //                         pointArr.push(customerPoint);//将刚才的点放进去
        //                         convertor.translate(pointArr, 1, 5, initMap); //转换坐标
        //                         function initMap(data) {
        //                             alert("data2==="+JSON.stringify(data))
        //                             if (data.status === 0) {//转换成功
        //                                 let point = data.points[0];//得到后的点
        //                                 let lng = point.lng;//获得转换后的经度
        //                                 let lat = point.lat;//获得转换后的纬度
        //                                 toDoFunction(lng, lat);//将经纬度传入到要运用的函数中
        //                             } else {
        //                                 //下面两行是默认定位到西湖的经纬度
        //                                 let lng = 120.141375;
        //                                 let lat = 30.257806;
        //                                 toDoFunction(lng, lat);//将经纬度传入到要运用的函数中
        //                             }
        //                         }
        //                     },
        //                     //取消定位
        //                     cancel: function () {
        //                         //下面两行是默认定位到西湖的经纬度
        //                         let lng = 120.141375;
        //                         let lat = 30.257806;
        //                         toDoFunction(lng, lat);//将经纬度传入到要运用的函数中
        //                     },
        //                     //定位失败
        //                     fail: function () {
        //                         //下面两行是默认定位到西湖的经纬度
        //                         let lng = 120.141375;
        //                         let lat = 30.257806;
        //                         toDoFunction(lng, lat);//将经纬度传入到要运用的函数中
        //                     }
        //                 });
        //                 //定位发生错误
        //                 wx.error(function () {
        //                     //下面两行是默认定位到西湖的经纬度
        //                     let lng = 120.141375;
        //                     let lat = 30.257806;
        //                     toDoFunction(lng, lat);//将经纬度传入到要运用的函数中
        //                 });
        //             });
        //         }
        //     });
        // },
    },
    route: {
        data ({ to, next }) {
            let self = this;
            //进入页面时token不存在
            if(!localStorage.getItem("token")){
                self.$transfer.backLogin(self, {info:'token没有值'});
                return;
            }
            self.user_info = Tokens.fetch("user_info");
            self.phoneNum = '手机号码: '+self.user_info.suMobile;
            let timer = new Date().getTime();
            if(self.user_info.suWeiXin != ''){
                self.wxHeadimgurl = getImgURL() + '/user/' + self.user_info.suId + "_wx.gif" +'?'+ timer;
                // self.wxBindName = Tokens.fetch("wxBindName")
            }
            next()
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
    .mint-popup{
        width: 100%;height: 100%; background: #f1f1f1;z-index: 2;
    }
    .interval{
        margin-top: .6rem;
    }
    .save{
        color:#FFD91E;
        padding:0;
        font-size: .6rem;
    }
    .prompt_font{
        display: block;
        width:100%;
        height:2rem;line-height: 2rem;
        margin-top:.5rem;margin-left: .5rem;
    }
    .revamp .mint-button{
        width: 2.5rem;
        height:1.2rem;
        font-size: .7rem;
        padding:0;
    }
    /*.change_revamp .mint-button{
        background-color: #eee;
        color:#000;
    }*/
    /*修改手机号码*/
    .hint_text{
        width:90%;
        margin: .5rem auto;
        font-size: .65rem;
    }
    .hint_text p{
        text-align: center;
    }
    .submit{
        width:70%;
        margin: 0 15%;
        color: #FFD91E;
        background-color: #333;
    }
    .icon_blue{color:#06f;display: block;float:left;margin-right: .5rem}
    .icon_green{color:#0d0;display: block;float:left;margin-right: .5rem}
    /*更换filed*/
    .write_text{
        position: relative;
        width:90%;
        margin:0 auto;
        margin-top: .5rem;
        overflow: hidden;
    }
    .write_ipt{
        display: block;
        width:76%;
        border-radius: 5px;
        /*padding:0.5rem 0;*/
        padding:0;
        height:2rem;
        padding-left: 24%;
    }
    .prefix{
        position: absolute;
        top:0;left:0;
        width:20%;
        height:2rem;line-height: 2rem;
        background-color: #FFD91E;
        text-align: center;
        border-radius: 5px 0 0 5px;
    }
    .wxbind,.qqbind{
        background-color: #000;
        color:#FFD91E;
    }
    .relieve{
        color:#FFD91E;
        background-color: #fff;
    }
</style>
<style>
    #bind_wx .mint-cell-text{
        height:1rem;line-height: 1rem;
    }
    #bind_wx .revamp .mint-cell-text{
        padding-left:.3rem;
    }
    
    #bind_wx .mint-cell-title{
        width: 80%;
    }
    #bind_wx .mint-cell-value{
        width: 20%;
    }
</style>
