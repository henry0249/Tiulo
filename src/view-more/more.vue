<template>
    <div class="page"> 
        <mt-header fixed title="更多">
        </mt-header>
        <div class="container-top" id="more_set" v-show="upload">
            <mypulldown style="margin-top:0rem">
                <div slot= "pullList" :style = "{minHeight:listViewH + 'px'}">
                    <div class="first_box" @click.stop="information()">
                        <img :src="user_info.suLogo">
                        <div class="message">
                            <span>
                                <span class="name">{{user_info.suName}}&emsp;</span>
                                <b class="iconfont icon_sexM" v-show="user_info.suSex=='男'">&#xe6fe;</b>
                                <b class="iconfont icon_sexG" style="color:#FD626E;" v-show="user_info.suSex=='女'">&#xe6fd;</b>
                                <b class="iconSet" v-show="user_info.suIsCustomer == 1">企</b>
                                <b class="iconSet" v-show="user_info.suIsTMS == 1">运</b>
                                <b class="iconSet" v-show="user_info.suIsDriver == 1">车</b>
                            </span>
                            <span>推流号: {{user_info.suCode}}</span>
                        </div>
                        <div class="skip">
                            <span class="iconfont fr rt_arrow" style="margin-left:.25rem;">&#xe645;</span>
                            <span class="iconfont fr">&#xe602;</span>    
                        </div>  
                    </div>
                    <div class="strip" @click.stop="settingCenter()">
                        <span slot="icon" class="iconfont lf ico">&#xe653;</span>
                        <span class="icon_set lf">设置</span>
                        <span class="iconfont fr rt_arrow" style="margin-left:.25rem;">&#xe645;</span>
                    </div>
                    <div class="strip" v-if="subsystem=='SJ'" @click.stop="carManage()">
                        <span slot="icon" class="iconfont lf ico">&#xe654;</span>
                        <span class="icon_set lf">车辆管理</span>
                        <span class="iconfont fr rt_arrow" style="margin-left:.25rem;">&#xe645;</span>
                    </div>
                    <div class="strip" v-if="subsystem=='KF'||subsystem=='TMS'" @click.stop="companyManage()">
                        <span slot="icon" class="iconfont lf ico">&#xe8dd;</span>
                        <span class="icon_set lf">机构管理</span>
                        <span class="iconfont fr rt_arrow" style="margin-left:.25rem;">&#xe645;</span>
                    </div>
                    <!-- <div class="strip" @click.stop="companyManage()">
                        <span slot="icon" class="iconfont lf ico">&#xe8dd;</span>
                        <span class="icon_set lf">机构管理</span>
                        <span class="iconfont fr rt_arrow" style="margin-left:.25rem;">&#xe645;</span>
                    </div> -->
                    <div class="strip" v-if="subsystem=='KF'||subsystem=='TMS'" @click.stop="changeversion()">
                        <span slot="icon" class="iconfont lf ico">&#xe682;</span>
                        <span class="icon_set lf">切换版本</span>
                        <span class="iconfont fr rt_arrow" style="margin-left:.25rem;">&#xe645;</span>
                        <span class="fr" style="margin-left:.25rem;">{{subSystem2}}</span>
                    </div>
                    <div class="strip" v-if="subsystem=='SJ'" @click.stop="locationQuery()">
                        <span slot="icon" class="iconfont lf ico">&#xe729;</span>
                        <span class="icon_set lf">定位数据查询</span>
                        <span class="iconfont fr rt_arrow" style="margin-left:.25rem;">&#xe645;</span>
                    </div>
                    <div class="strip" v-if="datasource=='dbtest'||userId=='00094'||userId=='00384'" @click.stop="portDemo()">
                        <span slot="icon" class="iconfont lf ico">&#xe734;</span>
                        <span class="icon_set lf">接口Demo</span>
                        <span class="iconfont fr rt_arrow" style="margin-left:.25rem;">&#xe645;</span>
                    </div>
                </div>
            </mypulldown>
        </div>
    </div>
</template>

<script>
import * as actions from '../vuex/actions'
import Tokens from '../token'
import Addresses from '../address'
import  Mypulldown from '../components/mypulldown'//引入下拉刷新的组件
// Ajax request module, return a Promise
export default {
    components: {
        Mypulldown
    },
    data () {
        return {
            user_info:'',
            isMan:false,
            upload:false,
            county:'',
            userId:'',
            orderId:'1',
            image:'',
            isTMS:true,//运图标显示状态
            isCustomer:true,//企图标显示状态
            isDriver:true,//车图标显示状态
            userAddress:{},
            subsystem: "",//版本
            subSystem2:"",
            datasource: "",//版本(dbtms正式库, dbtest测试库, dbcon开发库)

            listViewH: 0,//下拉刷新框的最小高度
            isLoadId: null,//用来存储下拉刷新时带过来的id,初始设置为null,在数据加载完成后清除加载指示时
        }
    },
    ready(){
        let self = this;
        //列表框的最小高度
        self.$nextTick(()=>{
            self.listViewH = $("#more_set").height() - 10;
            console.log(self.listViewH)
        });
    },
    events:{
        //下拉刷新时重置列表数据
        refreshList(id,topStatus){
            let self = this;
            self.isLoadId = id;
            setTimeout(() => {
                self.ajaxUser();
            }, 1000);
        },
    },
    methods: {
        onFileChange(e) {
            var files = e.target.files || e.dataTransfer.files;
            if (!files.length)return; 
            this.createImage(files);
        },
        createImage(file) {
            if(typeof FileReader==='undefined'){
                alert('您的浏览器不支持图片上传，请升级您的浏览器');
                return false;
            }
            var image = new Image();         
            var vm = this;
            var leng=file.length;
            for(var i=0;i<leng;i++){
                var reader = new FileReader();
                reader.readAsDataURL(file[i]); 
                reader.onload =function(e){
                // vm.images.push(e.target.result);
                vm.image = e.target.result                                
                };                 
            }                        
        },
        go (link, param) {
            let self = this
            self.$transfer.go(self, link, param)
        },
        back (link, param) {
            let self = this
            self.$transfer.back(self, link, param);
        },
        information(){//进入个人中心页面
            let self = this;
            //列表若有点击跳转事件，在下拉时阻止点击跳转
            let isStop = isXLorClick();
            if(isStop){
                return;
            }
            self.go('/my_information');
        },
        settingCenter(){//进入设置页面
            let self = this;
            //列表若有点击跳转事件，在下拉时阻止点击跳转
            let isStop = isXLorClick();
            if(isStop){
                return;
            }
            self.go('/setting');
        },
        carManage(){//进入车辆管理页面
            let self = this;
            //列表若有点击跳转事件，在下拉时阻止点击跳转
            let isStop = isXLorClick();
            if(isStop){
                return;
            }
            self.go('/truckList');
        },
        companyManage(){//进入机构管理页面
            let self = this;
            //列表若有点击跳转事件，在下拉时阻止点击跳转
            let isStop = isXLorClick();
            if(isStop){
                return;
            }
            self.go('/companyList');
        },
        changeversion(){//进入切换版本页面
            let self = this;
            //列表若有点击跳转事件，在下拉时阻止点击跳转
            let isStop = isXLorClick();
            if(isStop){
                return;
            }
            self.go('/changeVersion');
        },
        locationQuery(){//进入定位查询页面
            let self = this;
            //列表若有点击跳转事件，在下拉时阻止点击跳转
            let isStop = isXLorClick();
            if(isStop){
                return;
            }
            self.go('/locationData');
        },
        portDemo(){//进入机构管理页面
            let self = this;
            //列表若有点击跳转事件，在下拉时阻止点击跳转
            let isStop = isXLorClick();
            if(isStop){
                return;
            }
            self.go('/android');
        },
        ajaxUser(){
            let self = this;
            let s = {action:"/user/query",params:{"suId":self.userId}};
            consoleShow(JSON.stringify(s));
            doAjaxQuery(s,function(data) {
                if(data.status == 0){
                    self.$transfer.backLogin(self, data);
                }else if(data.status == 1){
                    consoleShow(data)
                    console.log(data)
                    let obj = data.dataset.rows[0];
                    obj.suLogo = getImgURL() +'user/' +obj.suLogo;
                    let ImgObj = new Image();
                    ImgObj.src = obj.suLogo;
                    Tokens.save("user_info",obj);
                    ImgObj.onerror = function(){
                        obj.suLogo = getImgURL() + 'user/default.png';
                        Tokens.save("user_info",obj);
                    }
                    self.upload = true;        
                    self.user_info = obj;
                    if(self.isLoadId){
                        self.$nextTick(()=>{
                            self.$broadcast('onTopLoaded', self.isLoadId); 
                            self.isLoadId = null;
                        }) 
                    } 
                }
                self.$Indicator.close();
            });
        },
    },
    route: {
        data ({ to, next }) {
            let self = this;
            //进入页面时token不存在
            if(!localStorage.getItem("token")){
                self.$transfer.backLogin(self, {info:'token没有值'});
                return;
            }
            //token
            var token = Tokens.fetch('token');
            //版本
            self.subSystem2 = localStorage.getItem("subSystem2");
            self.subsystem = token['subSystem'];
            self.userId = Tokens.fetch('token')['userId'];
            self.datasource = Tokens.fetch('token')['datasource'];
            self.$Indicator.open();
            self.ajaxUser();
            // let user = Addresses.address('123');
            // let tokenvalue = Tokens.fetch('token');
            // self.userId = tokenvalue["userId"];
            // self.user_info = user;
        },
        deactivate ({ next }) {
            //Triggers when component destroys
            next()
        },
        canDeactivate ({ next, to, abort }) {
            //Triggers when component destroys
            let self = this;
            self.$parent.$data.showBar = false;
            next()
        },
        activate({to, from, next}) {
            let self = this
            let subSystem = localStorage.getItem("subSystem");
            if(subSystem){
                self.$parent.$data.subSystem = subSystem;
            }
            self.$parent.$data.showBar = true;
            self.$parent.$data.MainSelect = "more";
            next()
        } 
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    .fr{float:right;}
    .lf{float:left;}
    .Man{display: none;}
    .first_box{
        width: 100%;
        height: 4rem;
        background-color: #fff;
        margin-top: .5rem;
        padding:.25rem .5rem;
        border-bottom: 1px solid rgba(217,217,217,.4);
    }
    .first_box img{
        float:left;
        width:3rem;
        height:3rem;
        /*border:1px solid #aaa;*/
        border-radius: 5px;
    }
    .iconSet{
        display: inline-block;
        background-color: #666;
        color:#fff;
        width:0.7rem;height:0.7rem;
        line-height: 0.7rem;
        text-align: center;
        border-radius: 4px;
    }
    .message{
        float: left;
        width: 55%;
        height: 3rem;
        margin-left: .5rem;
        padding-top:.5rem;

    }
    .message span{
        display: block;
        overflow: hidden;
    }
    .message span>b{
        float: left;
        width:1rem;
        height:1rem;
        margin:0 .1rem;
        line-height: 1rem;
        text-align: center;
    }
    .message .name{
        white-space:nowrap; 
        overflow:hidden; 
        text-overflow:ellipsis;
        width:30%;
        float:left;
    }
    .skip{
        float:right;
        width:20%;
        height:3rem;
        line-height: 3rem;
    }
    .interval .mint-cell-text{
        font-size: .7rem;
    }
    .icon_sexM{color:#1B93FF;}
    .icon_sexG{color:#FD626E;}
    .icon_car{color:#000;}
    

    .strip{
        background-color: #fff;
        width:100%;height:2.5rem;line-height: 2.5rem;
        padding: 0 .5rem;
        border-bottom: 1px solid rgba(217,217,217,.4);
    }
    .strip_top{
        border-top: 1px solid rgba(217,217,217,.4);
    }
    .ico{
        font-size: 1.5rem;
    }
    .icon_set{
        margin-left: .3rem;
    }
</style>
<style>
    #more_set .mint-cell-text{
        font-size: .7rem;
        vertical-align: text-top;
    }
</style>
