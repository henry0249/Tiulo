<template>
	<div class="page" @click="listShow = false">
		<mt-header fixed title="添加成员">
            <mt-button icon="back" slot="left" @click="backLast()"></mt-button>
            <mt-button slot="right" style="width:45px;">
                <span style="font-weight:bold;" class="iconfont" @click.stop="addfriendtype()">&#xe677;</span>
            </mt-button>
        </mt-header>
        <div class="container-top">
            <div v-if="addedShow">
                <div class="head_hint">已添加成员</div>
                <div>
                    <div v-for="item in pitchup" class="pitch_box">
                        <img :src="item.suLogo" class="pitch_img">
                        <div class="pitch_cont">
                            <div class="cont_suname">{{item.suName}}</div>
                            <div class="cont_cfgname">{{item.cfgNames}}</div>
                        </div>
                    </div>
                </div>
                <div style="width:100%;text-align:center;">
                    <button class="mack_confirm" @click.stop="mackConfirm()">确定</button>
                </div>
            </div>
            <div v-if="!addedShow">
                <img class="blank_img" src="../img/blank.png">
                <div class="blank_content">暂时还没有成员,请添加</div>
            </div>	
        	<!-- 右上角选择框 -->
            <div  v-show = "listShow" class="listPOP_box" style="width:40%;text-align:left;">
                <div class="list_pop">
                    <ul>
                        <li @click.stop="tiuloFriend()" v-show="registerShow">
                        	<span style="padding-right:0.5rem;" slot="icon" class="iconfont mapColor">&#xe642;</span>
                        	<span>从好友</span>
                        </li>
                        <li @click.stop="telFriend()" v-show="addressBookShow">
                        	<span style="padding-right:0.5rem;" slot="icon" class="iconfont mapColor">&#xe687;</span>
                        	<span>从通讯录</span>
                        </li>
                        <li @click.stop="iptPhone()">
                        	<span style="padding-right:0.5rem;" slot="icon" class="iconfont mapColor">&#xe678;</span>
                        	<span>输入手机</span>
                        </li>
                    </ul>
                </div>
                <div class="jiantou"></div> 
            </div>
        </div>
        <mt-popup position="center" class="bounced_box" :visible.sync="iptPhoneShow" :modal="true" popup-transition="popup-slide">
            <div class="bounced_box_head">
                <span class="bounced_box_title">添加成员</span>
                <div class="close_btn">
                    <span class="iconfont" @click="closeTel()">&#xe679;</span>
                </div>
            </div>
            <div class="content_box">
                <div class="content_ipt_box">
                    <span class="iconfont content_img">&#xe678;</span>
                    <input type="tel" class="content_ipt" placeholder="请输入手机号" maxlength="11" v-model="telInput">
                </div>
                <div class="content_text">系统将给未注册的成员发送短信</div>
            </div>
            <div class="footer">
                <div class="footer-btn" @click="accomplishBtn()">保存</div>
                <div class="footer-btn footer-add" @click="accomplishAdd()">保存并继续添加</div>
            </div>
        </mt-popup>
	</div>
</template>
<script>
import Tokens from '../token'
export default {
	data () {      
        return{
        	// 公共属性
            toke:'',//本地token的值
            version:'',//当前是哪个版本
            pathWay:'',//路径的保存
            listShow:false,//下弹框显示隐藏
            pitchup:[],//选中的朋友
            registerShow:true,//推流好友显示
            addressBookShow:true,//通讯录显示
            addedShow:false,//已经添加好友显示的
            iptPhoneShow:false,//输入手机号显示
            telInput:'',//输入的手机号码

        }
    },
    watch:{
        'pitchup':function(e){
            let self = this;
            if(e.length == 0){
                self.addedShow = false;
            }else{
                self.addedShow = true;
            }
        }
    },
    methods:{
    	go (link, param) {
            let self = this;
            self.$transfer.go(self, link, param)
        },
        back (link, param) {
            let self = this
            self.$transfer.back(self, link, param);
        },
        // 返回上一页面
        backLast(){
        	let self = this;
            let optfor =  Tokens.fetch("optForFriendsList")
            Tokens.save("pitchUpFriendsList",optfor)
        	self.back('/foundOrg')
        },
        // 添加成员按钮
        addfriendtype(){
        	let self = this;
        	self.listShow = !self.listShow;
        },
        // 添加推流好友
        tiuloFriend(){
        	let self = this;
        	let friendID = 'tiulo';
            self.listShow = false;
        	self.go('/newAddFriend',friendID)
        },
        // 添加手机通讯录好友
        telFriend(){
        	let self = this;
            let friendID = "phone";
            self.listShow = false;
            if(browserType == "android"){
                let str = window.AndroidWebView.showInfoFromJs();//获得通讯录只有name和phone
                let strs = JSON.parse(str);//JSON字符串转化为数组
                Tokens.save('cellPhoneNumber',strs)

                self.go('/newAddFriend',friendID)
            }
            // self.go('/newAddFriend',friendID)
        },
        // 输入手机号码
        iptPhone(){
        	let self = this;
            self.listShow = false;
            self.iptPhoneShow = true;
        },
        closeTel(){//关闭手机
            let self = this;
            self.iptPhoneShow = false;
            self.telInput = '';
        },
        judgeTel(e,f){//判断手机号码
            let self = this;
            let tel = /^((1[3,5,8][0-9])|(14[5,7])|(17[0,6,7,8]))\d{8}$/;
            if(e == "" || e.length<0){
                self.$transfer.showToast(self, "请输入手机号", "center", 1500);
                return;
            }else if(!tel.test(e)){
                self.$transfer.showToast(self, "您输入的手机号码格式不正确", "center", 1500);
                return;
            }else{
                let s = {action:"/user/execute"}
                s.params = {mobiles:e}
                doAjaxQuery(s,function(data){
                    console.log(data)
                    if(data.outParams.state){
                        self.$transfer.showToast(self, "消息发送成功");
                        self.telInput = '';
                        if(f == "a"){
                            self.iptPhoneShow = false;
                        }
                    }else{
                        self.$transfer.showToast(self, data.info);
                    }
                })
                
                // let url =getRootURL() + "/rest/user/sendMobileMsg/" + e;
                // $.ajax({
                //     url: url,
                //     type:"GET",
                //     dataType:"jsonp",
                //     jsonp:"jsonp_data",
                //     data:e,
                //     success: function(data){
                //         console.log(data)
                //     },
                //     error:function(data){
                //         console.log(data)
                //     }
                // });
                // let s = {action: "/user/sendMobileMsg/" +e}/restd
                // doAjaxQuery(s, function(data){
                //     console.log(data)
                // })
            }
        },
        accomplishBtn(){//保存
            let self = this;
            self.judgeTel(self.telInput,"a");
        },
        accomplishAdd(){//保存并添加
            let self = this;
            self.judgeTel(self.telInput,"b")
        },
        mackConfirm(){//确定选中成员
            let self = this;
            console.log(self.pitchup)
            Tokens.save("optForFriendsList",self.pitchup);
            self.back('/foundOrg')
        },
    },
    route: {
        data ({ from, to, next }) {
            let self = this;
            //进入页面时token不存在
            if(!localStorage.getItem("token")){
                self.$transfer.backLogin(self, {info:'token没有值'});
                return;
            }
            self.toke = Tokens.fetch("token");
            self.version = Tokens.fetch("bdSubSystem2");//当前版本号
            let pitchup = Tokens.fetch("pitchUpFriendsList");//是否已经有选中的成员
            let pitchon = Tokens.fetch("optForFriendsList");//是否已经有选中的成员
            if(from.path){//判断进入路径
                Tokens.save('addFriendsPathFrom',from.path);
                self.pathWay = from.path;
            }else{
                self.pathWay = Tokens.fetch('addFriendsPathFrom');
            }
            let pathStatus = Tokens.fetch('selectPath');
            // if(pathStatus.indexOf('companyList') == 1){
            //     self.registerShow = true;
            // }else{
            //     self.registerShow = false;
            // }
            if(browserType == "android"){
                self.addressBookShow = true;
            }else{
                self.addressBookShow = false;
            }
            // if(pitchup && pitchup.length>0){
            //     self.pitchup = pitchup;
            // }else{
            //     self.pitchup = [];
            // }
            if(self.pathWay.indexOf('newAddFriend') == 1){
                if(pitchup && pitchup.length>0){
                    self.pitchup = pitchup;
                }else{
                    self.pitchup = [];
                }
            }else if(self.pathWay.indexOf('foundOrg') == 1){
                if(pitchon && pitchon.length>0){
                    self.pitchup = pitchon;
                }else{
                    self.pitchup = [];
                }
            }
            next()
        },
        canDeactivate({to, from, next}) {
            let self = this;

            next();
        },
        deactivate ({ next }) {
            //Triggers when component destroys
            next()
        },
    }
}
</script>
<style>
    /*.mint-popup{
        width: 80%;height: 30%; background: #f1f1f1;z-index: 2;
    }*/
	.head_hint{
        width:100%;height:1.5rem;
        line-height: 1.5rem;
        padding-left:.5rem;
        background-color: #ededed;
    }
    .pitch_box{
        width:100%;
        height:3rem;
        padding:.5rem;
        background-color: #fff;
        border-bottom: 1px solid #ddd;
    }
    .pitch_img{
        float:left;
        height: 2rem;
    }
    .pitch_cont{
        float:left;
        margin-left: .5rem;
    }
    .cont_suname{
        height:1rem;
        line-height:1rem;
        font-size:0.8rem;
    }
    .cont_cfgname{
        height:1rem;
        line-height:1rem;
        font-size:0.65rem;
        color:#999;
    }
    .mack_confirm{
        position: fixed;
        bottom:2rem;
        left:10%;
        padding:0;
        width:80%;
        height:2.3rem;
        line-height: 2.5rem;
        background-color: #3d3d3d;
        color: #FFD91E;
        border:none;
        border-radius: 4px;
        font-size:0.7rem;
    }
    .blank_img{
        display: block;
        width:50%;
        margin:2rem auto;
        margin-top: 10rem;
    }
    .blank_content{
        height:1.5rem;
        line-height: 1.5rem;
        text-align: center;
        color:#aaa;
        font-size:.8rem;
    }
    .bounced_box{
        width: 80%;height: 28%;
        background: #fff;z-index: 2;
        border-radius: 0.5rem;
        overflow: hidden;
    }
    .bounced_box_head{
        /*background-color: #fff;*/
        width:100%;
        height:2.5rem;
        line-height: 2.5rem;
        text-align: center;
        color:#333;
        position: relative;
    }
    .bounced_box_title{
        display: block;
        font-size: 0.9rem;
        text-align: center;
    }
    .close_btn{
        position: absolute;
        top:0rem;
        right:0.8rem;
        color:#333;
    }
    /*.content_box{margin-top: .5rem;}*/
    .content_ipt_box{
        width:80%;
        border:1px solid #FFD91E;
        border-radius: 5px;
        margin:0 auto;
        overflow: hidden;
        position: relative;
    }
    .content_img{
        position: absolute;
        top:0.25rem;left: 0.5rem;
        text-align: center;
        color:#FFD91E;
    }
    .content_ipt{
        width:80%;
        height:1.5rem;
        padding-left:2rem;
    }
    .content_text{
        width:100%;
        height:2rem;
        line-height: 2rem;
        padding-left:10%;
        color:#ccc;
    }
    .footer{
        /*position: absolute;*/
        width:100%;
        /*bottom:0;*/
        /*left: 0;*/
        overflow: hidden;
        border-top:1px solid #FFD91E;
        font-size: .8rem;
    }
    .footer-btn{
        float: left;
        width:50%;
        height:2.5rem;
        line-height: 2.5rem;
        text-align: center;
        border-right:1px solid #FFD91E;
        background-color: #f1f1f1;
    }
    .footer-add{
        border:none;
        background-color: #fff;
    }
</style>