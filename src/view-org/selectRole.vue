<template>
	<div class="page">
		<mt-header fixed title="选择角色">
            <mt-button icon="back" slot="left" @click="backLast()"></mt-button>
        </mt-header>
        <div class="container-top" id="select_role">
            <div class="head_hint">请根据业务选择所要创建的机构类型</div>
            <div class="version_box" :style="{height:selRoleH+'px'}">
                <div class="version" v-show="EPShow" :style="{height:oneRoleH+'px'}" @click.stop="createInstitutions('EP')">
                    <!-- <span class="ico_img"><span class="iconfont onceicon">&#xe671;</span></span> -->
                    <div style="padding:.5rem 0;">
                        <img src="../img/EP.png" style="display:block;width:40%;margin:0 auto;">
                    </div>
                    <div class="once_name">EP</div>
                    <div class="infor_name">Enterprise partner</div>
                    <div class="box_title">拥有起始货源的机构或组织</div>
                    <div class="box_content">如：通讯设备、电子产品、仪器仪表、原材料、化工类等</div>
                </div>
                <div class="version" v-show="BSPShow" :style="{height:oneRoleH+'px'}" @click.stop="createInstitutions('BSP')">
                    <!-- <span class="ico_img"><span class="iconfont onceicon">&#xe674;</span></span> -->
                    <div style="padding:.5rem 0;">
                        <img src="../img/BSP.png" style="display:block;width:40%;margin:0 auto;">
                    </div>
                    <div class="once_name">BSP</div>
                    <div class="infor_name">Business service partner</div>
                    <div class="box_title box_two">有货源但非企业的机构或组织</div>
                    <div class="box_content">如：货运代理、联运站、有业务资源的机构或个人</div>
                </div>
                <div class="version" v-show="OSPShow" :style="{height:oneRoleH+'px'}" @click.stop="createInstitutions('OSP')">
                    <!-- <span class="ico_img"><span class="iconfont onceicon">&#xe676;</span></span> -->
                    <div style="padding:.5rem 0;">
                        <img src="../img/OSP.png" style="display:block;width:40%;margin:0 auto;">
                    </div>
                    <div class="once_name">OSP</div>
                    <div class="infor_name">Operation service partner</div>
                    <div class="box_title box_three"><span>有能力协调管理零散运力的组织或个人,但没有自己的直接运力</span></div>
                    <div class="box_content">如：小型三方物流公司、外包供应商等</div>
                </div>
                <div class="version" v-show="TPShow" :style="{height:oneRoleH+'px'}" @click.stop="createInstitutions('TP')">
                    <!-- <span class="ico_img"><span class="iconfont onceicon">&#xe675;</span></span> -->
                    <div style="padding:.5rem 0;">
                        <img src="../img/TP.png" style="display:block;width:40%;margin:0 auto;">
                    </div>
                    <div class="once_name">TP</div>
                    <div class="infor_name">Transport partner</div>
                    <div class="box_title">拥有直接运力的机构或组织</div>
                    <div class="box_content">如：物流公司、大型第三方物流公司、货运公司、运输车队等</div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import Tokens from '../token'
export default {
    data () {
        return{
        	toke:'',//本地token的值
        	pathWay:'',//路径的保存
            versions:['TP','OSP','EP','BSP'],//版本
            selRoleH:0,//整个的高度
            oneRoleH:0,//单独一个块的高度
            subSystem:'',
            datasource: "dbcon",//dbtms正式库, dbtest测试库, dbcon开发库
            EPShow:false,
            BSPShow:false,
            OSPShow:false,
            TPShow:false,
        }
    },
    ready(){
        let self = this;
        self.$nextTick(()=>{
            self.selRoleH = $("#select_role").height() - $(".head_hint").height()-20;
            self.oneRoleH = (self.selRoleH-20)/2;
        })
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
        backLast(){//返回页面
            let self = this;
            self.back(self.pathWay)
        },
        createInstitutions(val){//点击跳转创建机构页面
            let self = this;
            Tokens.save('bdSubSystem2',val);
            
            // if(self.pathWay.indexOf('noOrg') == 1){
            //     self.subSystem = (val=="TP" || val=="OSP") ? "TMS" :
            //                      (val=="BSP" || val=="EP") ? "KF" :
            //                      val=="SJ" ? "SJ":"";
            //     self.toke.subSystem = self.subSystem;
            //     console.log(self.toke)
            //     Tokens.save('token',self.toke)
            //     localStorage.setItem('subSystem',self.subSystem);
            //     // localStorage.setItem('subSystem2',val);                 
            // }
            self.go('/foundOrg')
        },
    },
    route: {
        data ({ from, to, next }) {
            let self = this;
            // 进入页面时token不存在
            if(!localStorage.getItem("token")){
                self.$transfer.backLogin(self, {info:'token没有值'});
                return;
            }
            self.toke = Tokens.fetch("token");
            if(from.path){//判断进入路径
                if(from.path.indexOf('foundOrg') == -1){
                    Tokens.save('selectPath',from.path);
                    self.pathWay = from.path;
                }else{
                    self.pathWay = Tokens.fetch('selectPath');
                } 
            }else{
                self.pathWay = Tokens.fetch('selectPath');
            }
            let register = Tokens.fetch('registerPathWay');//判断进入创建、加入机构页面的路径
            if(self.pathWay.indexOf('companyList') == 1){//新增
                let subSystem2 = localStorage.getItem("subSystem2");
                self.EPShow = false;
                self.BSPShow = false;
                self.OSPShow = false;
                self.TPShow = false;
                if(subSystem2 == "EP"){
                    self.EPShow = true;
                }else if(subSystem2 == "BSP"){
                    self.BSPShow = true;
                }else if(subSystem2 == "OSP"){
                    self.OSPShow = true;
                }else if(subSystem2 == "TP"){
                    self.TPShow = true;
                }
            }else if(self.pathWay.indexOf('noOrg') == 1){
                if(register.indexOf('login') == 1 || register.indexOf('register') == 1){
                    self.EPShow = true;
                    self.BSPShow = true;
                    self.OSPShow = true;
                    self.TPShow = true;
                }else if(register.indexOf('changeVersion') == 1 || register.indexOf('companyList') == 1){
                    let noOrgVersion;
                    if(register.indexOf('changeVersion') == 1){
                        noOrgVersion = Tokens.fetch("noOrgVersion");
                    }else if(register.indexOf('companyList') == 1){
                        noOrgVersion = localStorage.getItem("subSystem2");
                    }
                    self.EPShow = false;
                    self.BSPShow = false;
                    self.OSPShow = false;
                    self.TPShow = false;
                    if(noOrgVersion == "EP"){
                        self.EPShow = true;
                    }else if(noOrgVersion == "BSP"){
                        self.BSPShow = true;
                    }else if(noOrgVersion == "OSP"){
                        self.OSPShow = true;
                    }else if(noOrgVersion == "TP"){
                        self.TPShow = true;
                    }
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
<style scoped>
    .head_hint{
        width:94%;height:1.8rem;
        line-height: 1.8rem;
        margin:.5rem 3%;
        text-align: center;
        background-color: #fff;
        /*border:1px solid #aeaeae;*/
        background-color:#E2C253;
        border-radius: 3px;
    }
    .version{
        float:left;
        width:48.5%;
        margin-bottom: .5rem;
        background-color: #fff;
        border-radius: 5px;
        overflow: hidden;
    }
    .version:nth-child(1),.version:nth-child(3){
        margin-right: 3%
    }
    .version_box{
        overflow:hidden;
        margin:0 3%;
    }
    /*.leftcom{
        margin:0 3%;
    }*/
    /*.top_box{
        margin-bottom: .5rem;
    }*/
    .ico_img{
        display: block;
        width:3.5rem;height:3.5rem;
        line-height: 3.5rem;
        text-align: center;
        background-color: #E2C253;
        border-radius: 3.5rem;
        margin:0.5rem auto;
    }
    .onceicon{
        font-size:2rem;
        color:#fff;
    }
    .once_name{
        /*font-size:1rem;*/
        height:1rem;
        text-align: center;
    }
    .box_title{
        max-height:3rem;
        /*line-height: 1.5rem;*/
        text-align: center;
        font-size: .6rem;
        color:#000;
        padding:.3rem .5rem;
    }
    /*.box_three{
        height:3rem;
        line-height: 1rem;
    }*/
    /*.box_two{
        height:2rem;
        line-height: 1rem;
    }*/
    .box_content{
        max-height: 3rem;
        padding:0 .5rem;
        font-size:.6rem;
        color:#aaa;
    }
    .infor_name{
        text-align: center;
        font-size: .6rem;
        color:#FAD86C;
    }
</style>