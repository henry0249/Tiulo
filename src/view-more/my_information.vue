<template>
    <div class="page"> 
        <mt-header fixed title="个人中心">
            <mt-button icon="back" slot="left" @click="back('/more')"></mt-button> 
        </mt-header> 
        <div class="container-top" id="information">
            <mypulldown style="margin-top:0rem">
                <div slot= "pullList" :style = "{minHeight:listViewH + 'px'}">
                    <!-- 组件剪切 -->
                    <div class="head" @click="clip_head()" v-show="isheader">
                        <span style="float:left;height:3rem;line-height: 3rem;">头像</span>
                        <div style="float:right;height:3rem;line-height: 3rem;text-align: right;overflow: hidden;">
                            <span class="iconfont" style="float:right;height:3rem;line-height: 3rem;color:#c8c8cd;font-size:1.1rem;">&#xe71c;</span>
                            <img id="p" style="float: right;margin-top: .75rem;" :src="user_info.suLogo" slot="icon" alt="" width="35" height="35">
                        </div>
                    </div>
                    <input id="ipt_btns" style="display: none;" type="file" accept="image/*" @change="onFileChange">
                    <label for="ipt_btns" class="head iptHead" v-show="!isheader">
                        <span style="float:left;height:3rem;line-height: 3rem;">头像</span>
                        <div style="float:right;height:3rem;line-height: 3rem;text-align: right;overflow: hidden;">
                            <span class="iconfont" style="float:right;height:3rem;line-height: 3rem;color:#c8c8cd;font-size:1.1rem;">&#xe71c;</span>
                            <img id="p" style="float: right;margin-top: .75rem;" :src="user_info.suLogo" slot="icon" alt="" width="35" height="35">
                        </div>
                    </label>                
                    <mt-cell title="名字" :value="user_info.suName" @click="amend()" is-link></mt-cell>
                    <mt-cell title="推流号" :value="user_info.suCode" @click="push_show()" is-link></mt-cell>
                    <mt-cell title="二维码" @click="code_page()" is-link>
                        <span class="iconfont">&#xe602;</span>
                    </mt-cell>
                    <mt-cell title="性别" :value="user_info.suSex" @click="change_sex()" is-link></mt-cell>
                    <mt-cell title="地区" :value="addRess" @click="addressChange()" is-link></mt-cell>
                    <mt-cell title="联系方式" :value="user_info.suMobile1" @click.stop="contact()" v-if="browserType == 'android'" is-link>
                        <span style="float:right;color:blue;" @click.stop="androidMobile(user_info.suMobile1)">{{user_info.suMobile1}}</span>
                        <span class="iconfont" style="float:right;color:#FFD91E;margin-top:.1rem;margin-right:.3rem;">&#xe60e;</span>
                    </mt-cell>
                    <mt-cell title="联系方式" :value="user_info.suMobile1" @click.stop="contact()" v-else="browserType != 'android' " is-link>
                        <a class="mobile" style="float:right;" :href="'tel:'+user_info.suMobile1">{{user_info.suMobile1}}</a>
                        <span class="iconfont" style="float:right;color:#FFD91E;margin-top:.1rem;margin-right:.3rem;">&#xe60e;</span>
                    </mt-cell>  
                </div>
            </mypulldown>        
        </div>
        <!--二维码-->
        <mt-popup :visible.sync="codePage" class="middle">
            <div class="qrimg">
                <img :src="ewCodeUrl" style="width:9rem;">
            </div>
        </mt-popup>
        <!-- 性别 -->
        <mt-popup class="popup_box" position="right" :visible.sync="gender" :modal="false" popup-transition="popup-slide">
            <mt-header fixed :title="message">
                <mt-button icon="back" slot="left" @click="close_pop()"></mt-button>             
            </mt-header>
            <div class="container-top" id="sex">
                <mt-radio
                    align="right"
                    class="page-part"
                    :options="options"
                    :value.sync="sexValue">
                </mt-radio>
            </div>
        </mt-popup>
    </div>
</template>

<script>
import { Field } from 'mint-ui';
import * as actions from '../vuex/actions'
import { pid_pName, cid_cName , zid_zName , pid_cIds, cid_zIds , cid_pid , zid_cid } from '../assets/pcz'
import Tokens from '../token'
import Addresses from '../address'
import MyAddress from '../components/myaddress'
import  Mypulldown from '../components/mypulldown'//引入下拉刷新的组件
// Ajax request module, return a Promise
export default {
    components: {
        MyAddress,Mypulldown
    },
    data () {
        return {
            listViewH: 0,//下拉刷新框的最小高度
            isLoadId: null,//用来存储下拉刷新时带过来的id,初始设置为null,在数据加载完成后清除加载指示时

            user_info:'',
            sheetVisible:false,//下弹框
            first_text:'',//第一行
            second_text:'',//第二行
            message: '',
            codePage:false,//二维码页面显示
            ewCodeUrl:'',//二维码链接
            gender:false,//更换性别 
            options:['男','女','保密'],
            sexValue:'保密',
            address:false,//地址显示
            image:'',//图片显示路径


            userAddress:{},
            addRess:'',//显示地址
            showadd:'',
            province:'',//省
            city:'',//市
            county:'',//区
            user_change:'',//跳转修改页面传入的参数

            isheader:true,
            browserType:'',//Android或者微信判断

          //  isHeadCut:false,
        }
    },
    ready(){
        let self = this;
        //列表框的最小高度
        self.$nextTick(()=>{
            self.listViewH = $("#information").height() - 10;
            console.log(self.listViewH)
        });
    },
    events:{
        //下拉刷新时重置列表数据
        refreshList(id,topStatus){
            let self = this;
            self.isLoadId = id;
            setTimeout(() => {
                self.user_info = Tokens.fetch("user_info");
                if(self.isLoadId){
                    self.$nextTick(()=>{
                        self.$broadcast('onTopLoaded', self.isLoadId); 
                        self.isLoadId = null;
                    }) 
                }
            }, 1000);
        },
    },
    watch: {
        'sexValue': function valueChange(e){//性别
            let self = this;
            if(self.sexValue !== self.user_info.suSex){
                let myDate = new Date();
                let suSex
                if(self.sexValue == '保密'){
                    suSex = '*';
                }else{
                    suSex = self.sexValue;
                }
                let s = {action:"/user/save",commandType:"Update",rowId:self.user_info.rowId};
                s.datasets = {dsData:{rows:[{rowId:self.user_info.rowId,"state":'u',"suId":self.user_info.suId,"suSex":suSex,"suModifyDate":myDate}]}};
                doAjaxUpdate(s,function(data) {
                    if(data.status == 0){
                       self.$transfer.backLogin(self, data);
                    }else if(data.status == 1){
                        // self.set_user('suSex',self.sexValue);
                        self.user_info.suSex = self.sexValue;
                        Tokens.save("user_info",self.user_info);
                        self.$transfer.showToast(self, "修改成功");
                        //性别
                        self.gender = false;

                    }
                }); 
            }            
        }
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
        close_add(){
            let self = this;
            self.address = false;
            self.addRess = self.showadd;
        },
        close_pop(){
            let self = this;
            //二维码
            self.codePage = false;
            //性别
            self.gender = false;
        },
        onFileChange(e) {
            //列表若有点击跳转事件，在下拉时阻止点击跳转
            let isStop = isXLorClick();
            if(isStop){
                return;
            }
            var files = e.target.files || e.dataTransfer.files;
            if (!files.length)return;
            this.createImage(files);
        },
        createImage(file) {
            let self = this;
            if(typeof FileReader==='undefined'){
                alert('您的浏览器不支持图片上传，请升级您的浏览器');
                return false;
            }
            let image = new Image();         
            // let self = this;
            let leng=file.length;
            for(var i=0;i<leng;i++){
                var reader = new FileReader();
                reader.readAsDataURL(file[i]); 
                reader.onload =function(e){
                    self.image = e.target.result;
                    Tokens.save("img_path",self.image);
                    self.go('/clip_img')                              
                };                 
            }                        
        },
        clip_head(){
            let self = this;
            //列表若有点击跳转事件，在下拉时阻止点击跳转
            let isStop = isXLorClick();
            if(isStop){
                return;
            }
            if(browserType == "android"){
                // 修改之后 把图片裁剪之后的Base64传递过来。
                window.Photo.getPicture();
                self.$nextTick(
                    setTimeout(function(){
                        let imgData= window.Photo.getPicInfo();
                        doAjaxUpload(
                            "single",
                            {
                                imgparams:imgData,
                                mode:"user",
                                id:self.user_info.suId,
                                type:"head"
                            },
                            function(data){
                                consoleShow(JSON.stringify(data))
                                self.user_info.suLogo = data.vispath;
                                Tokens.save("user_info",self.user_info);
                            }
                        )
                    },500)
                )
            }else{
                weChatChooseImage(function(localIds){//通过微信获取图片
                    let localId = [];
                    localId.push(localIds[0])
                    weChatUploadImg(localId,function(result){//传给微信服务器返回服务器图片ID
                        getBase64Coder(result,function(path){
                            Tokens.save("img_path",path);
                            self.go('/clip_img'); 
                        })
                    })              
                })
            }
        },
        amend(){//姓名
            let self = this;
            //列表若有点击跳转事件，在下拉时阻止点击跳转
            let isStop = isXLorClick();
            if(isStop){
                return;
            }
            self.user_change = '姓名';
            self.go('/changeName',self.user_change)
        },
        push_show(){//进入推流号
            let self = this;
            //列表若有点击跳转事件，在下拉时阻止点击跳转
            let isStop = isXLorClick();
            if(isStop){
                return;
            }
            self.user_change = '推流号';
            self.go('/changeName',self.user_change)
        },
        code_page(){//进入二维码页面
            let self = this;
            //列表若有点击跳转事件，在下拉时阻止点击跳转
            let isStop = isXLorClick();
            if(isStop){
                return;
            }
            let root = getRootURL();
            let text = 'transfer|'+ self.user_info.suId;
            text = encodeURIComponent(text);
            self.ewCodeUrl = root+'/rest/Qrcode/query?text=' + text + '&width=' + 140;
            self.codePage = true;
        },
        change_sex(){//进入更改性别页面
            let self = this;
            //列表若有点击跳转事件，在下拉时阻止点击跳转
            let isStop = isXLorClick();
            if(isStop){
                return;
            }
            self.gender = true;
            self.message = '性别';
            self.sexValue = self.user_info.suSex;
        },
        addressChange(){//进入修改地址页面
            let self = this;
            //列表若有点击跳转事件，在下拉时阻止点击跳转
            let isStop = isXLorClick();
            if(isStop){
                return;
            }
            self.go('/address')
            // self.$nextTick(()=>{
            //     window.location.reload();
            // })
        },
        contact(){//联系方式
            let self = this;
            //列表若有点击跳转事件，在下拉时阻止点击跳转
            let isStop = isXLorClick();
            if(isStop){
                return;
            }
            self.user_change = '联系方式';
            self.go('/changeName',self.user_change)
        },
        androidMobile(val){//手机安卓号码拨号
            let self= this;
            window.Phone.call(val);
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
            let from_path = from.path;
            self.browserType = browserType;

          //  self.isHeadCut=isHeadCut;
            self.user_info = Tokens.fetch("user_info");
            console.log(self.user_info)
            if(self.user_info.suSex == '*'){
                self.user_info.suSex = '保密'
            }
            let county = Tokens.fetch("user_info").suDistrictId;
            let userAddress = Addresses.address(county);
            self.userAddress = userAddress;
            Tokens.save("userAddress",self.userAddress)
            self.addRess = self.userAddress.province +' '+ self.userAddress.city +' '+self.userAddress.county;
            if(from_path){
                // if(from_path.indexOf('clip_img')==1 || from_path.indexOf('address')==1){
                //     self.$nextTick(()=>{
                //         // window.location.reload();
                //         // window.location.href=window.location.href;
                //     })
                // }
                if(browserType == "weixin"){
                    if(from_path.indexOf('address')==1){
                        self.$nextTick(()=>{
                            window.location.reload();
                        })
                    }else if(from_path.indexOf('clip_img')==1){
                        self.$nextTick(()=>{
                            window.location.reload();
                        })
                    }
                }
                
            }
            if(browserType == "weixin" || browserType == "android"){
                self.isheader = true;
            }else{
                self.isheader = false;
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
        background: #f1f1f1;z-index: 2;
    }
    .popup_box{
        width:100%;height:100%;
    }
    img{display: block;}
    .interval{
        margin-top: .6rem;
    }
    .page-radio .page-part {/*性别选项*/
        margin-top: .5rem;
    }

    .head_portrait{
        width:100%;
        height:7.5rem;
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
    .ares{
        width:100%;height:2.3rem;line-height:2.3rem;
        background-color:#fff;padding:0 .5rem;
    }
    /*地址选择按钮*/
    .address_box{
        background-color: rgba(0,0,0,.2);
        margin-top: 2rem;
        border:1px solid #ccc;
        position: fixed;
        bottom:0;
        left:0;
        width:100%;
    }
    .middle{
        padding:.5rem;
        border-radius: .5rem;
    }
    .head{
        width:100%;height:3rem;
        padding:0 .6rem;background-color: #fff;
    }
    .iptHead{display: block;}
    #information .mint-cell::before,#information .mint-cell::after{
        border:none;
    }
    #information .mint-cell,.head,.iptHead{
        border-bottom: 1px solid #ededed;
    }
    .mobile{
        text-decoration:none;
        line-height: 1.1rem;
    }
</style>