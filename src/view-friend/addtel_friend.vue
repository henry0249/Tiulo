<template>
	<div class="page">
		<mt-header fixed title="添加伙伴">
            <mt-button icon="back" slot="left" @click="back('/friends')"></mt-button>
        </mt-header>
        <div id="addtelFriendSearch" class="container-search">
            <mysearch :value.sync="searchVal" placeholder="手机号、姓名、推流号"></mysearch>
        </div>
        <div class="container-top" id="add_linkman">
        	<div style="text-align: center;margin-bottom: .5rem;margin-top:2.8rem;" v-if="browserType == 'android'">
                <span style="display:inline-block;">我的手机号：</span>
                <span style="display:inline-block;margin-right:.5rem;" class="mobile" @click="makeCallTel()">{{userId}}</span>
                <span style="display:inline-block;" class="iconfont" style="display: inline-block;margin-left: .5rem;" @click="code_page()">&#xe602;</span>
            </div>
            <div style="text-align: center;margin-bottom: .5rem;margin-top:2.8rem;" v-else="browserType != 'android'">
                <span>我的手机号：<a class="mobile" :href="'tel:'+userId">{{userId}}</a></span>
                <span class="iconfont" style="display: inline-block;margin-left: .5rem;" @click="code_page()">&#xe602;</span>
            </div>
            <div class="plate" style="border-top: 1px solid #e5e5e5;" @click="jumpSkip()">
                <span style="font-size:2rem;height:2rem;line-height: 2rem;" slot="icon" class="iconfont pic_box">&#xe644;</span>
                <ul class="content_box">
                    <li style="font-size:0.8rem;">手机添加</li>
                    <li>添加或邀请通讯录的朋友</li>
                </ul>
                <div class="time_box">
                    <span class="iconfont">&#xe688;</span>
                </div>
            </div>
            <div class="plate" @click="scanCode()">
                <span style="font-size:2rem;height:2rem;line-height: 2rem;" slot="icon" class="iconfont pic_box">&#xe80d;</span>
                <ul class="content_box">
                    <li style="font-size:0.8rem;">扫一扫</li>
                    <li>扫描二维码名片</li>
                </ul>
                <div class="time_box">
                    <span class="iconfont">&#xe688;</span>
                </div>
            </div>
        </div>
        <mt-popup :visible.sync="codePage" class="middle">
            <div class="qrimg">
                <img :src="ewCodeUrl" style="width:9rem;">
            </div>
        </mt-popup>
	</div>
</template>

<script>
import Tokens from '../token'
import  Mysearch  from '../components/mysearch'
import { MessageBox } from 'mint-ui';

export default {
	components: {
        Mysearch
    },
    data () {
    	return {
            userId:'',
            pathWay:'',
            codePage:false,//二维码显示隐藏
            ewCodeUrl:'',//二维码路径
            browserType:'',
            beforeScrollTop:0,//存储页面当前scrollTop
    	}
    },
    ready(){
        let self = this;
        searchBoxIsShow('#add_linkman','#addtelFriendSearch',self.beforeScrollTop,function(top){
            self.beforeScrollTop = top;
        })
    },
    methods: {
    	go (link, param) {
            let self = this;
            self.$transfer.go(self, link, param)
        },
        back (link, param) {
            let self = this
            self.$transfer.back(self, link, param);
        },
        code_page(){
            let self = this;
            let token = Tokens.fetch("token");
            let root = getRootURL();
            let text = 'transfer|'+ token.userMobile;
            text = encodeURIComponent(text);
            self.ewCodeUrl = root+'/rest/Qrcode/query?text=' + text + '&width=' + 140;
            self.codePage = true;
        },
        jumpSkip(){
            let self = this;
            self.$nextTick(()=>{
                self.go('/tel_friends')
            })
            
        },
        // 调用原生手机 扫二维码 scanCode
        scanCode(){
            let self =this;
            alert("扫描二维码名片");
            if(browserType == "android"){
                window.Photo.scanCode1(); 
                self.$nextTick(() =>{
                    setTimeout(function(){
                       alertShow("定时延迟1秒执行");   
                       var str= window.Photo.getInfoCode();
                       document.getElementById("resultCode").innerHTML=str;
                    },1000)
                })  
            }else if(browserType == "weixin"){
                wx.scanQRCode({
                    needResult: 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
                    scanType: ["qrCode","barCode"], // 可以指定扫二维码还是一维码，默认二者都有
                    success: function (res) {
                        let result = res.resultStr; // 当needResult 为 1 时，扫码返回的结果
                        let tel = result.split('|')[1];
                        MessageBox.confirm('您确定添加'+tel+'此好友吗?',{'showCancelButton': true,'cancelButtonClass':'cancelbtn','confirmButtonClass':'verify','confirmButtonText':"确 定"}).
                        then(action => {
                            let s = {action:"/user/sendMobileMsg/"+tel}
                            // s.params = {mobiles:tel}
                            doAjaxQuery(s,function(data){
                                alert(JSON.stringify(data))
                                if(data.status == 1){
                                    self.$transfer.showToast(self, "我们已将消息发至"+tel);
                                }else{
                                    self.$transfer.showToast(self, data.info);
                                }
                            })
                        }).catch(function(){
                            
                        });
                    }
                });
            } 
        },
        makeCallTel(){
            let self = this;
            window.Phone.call(self.userId);
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
            self.userId = Tokens.fetch("token")['userMobile'];
            self.browserType = browserType;
            next()
        },
        deactivate ({ next }) {
            //Triggers when component destroys
            next()
        },
    }
}	
</script>

<style scoped>
    .mint-popup{
        background: #f1f1f1;z-index: 2;
    }
    .plate{
        box-sizing: border-box;
        width:100%;
        padding:0.3rem 4rem 0.3rem 2.3rem;
        position: relative;
        background: #fff;
        font-size: 0.65rem;
        color:#666;
        border-bottom:1px solid #e5e5e5;
    }
    .plate .pic_box{
        position: absolute;
        top:50%;
        left:0.5rem;
        margin-top: -1rem;  
    }
    .plate .pic_box .badge{
        min-width: 1rem;
        min-height: 1rem;
        line-height: 1rem;
        border-radius: 0.5rem;
        background: red;
        color:#fff;
        position: absolute;
        top:0.25rem;
        right:-0.25rem;
        font-size: 0.5rem;
        text-align: center;
    }
    .plate .content_box{
        padding:0 0.3rem;
    }
    .plate .content_box li{
        padding:0 0.3rem;
        height:1rem;
        line-height: 1rem;
        overflow:hidden;
        white-space:nowrap;
        text-overflow:ellipsis; 
    }
    .plate .time_box{
        position: absolute;
        top:0.5rem;
        right:0.5rem;
    }
    .middle{
        padding:.5rem;
        border-radius: .5rem;
    }
    .mobile{
        text-decoration:none;
        color:blue;
    }
</style>
<style>
    #add_linkman .mint-cell-title{
        flex:none;
    }
</style>