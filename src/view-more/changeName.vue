<template>
    <div class="page"> 
        <mt-header fixed :title="message">
            <mt-button icon="back" slot="left" @click="close()"></mt-button>        
            <mt-button slot="right" @click="preserve()" v-show="saveShow" class="save">保存</mt-button>      
        </mt-header>
        <div class="container-top">
            <div v-show="!cantactDetails">
                <!-- 姓名 -->
                <div class="write_text" v-show="plugId">
                    <input class="write_ipt" type="text" :placeholder="typeface" v-model="inputValue">
                </div>
                <!-- 推流号 -->
                <div class="write_text" v-show="!plugId">
                    <input class="write_ipt" type="text" :placeholder="typeface" v-model="inputValue" :class="{'disabled_state':disabledState}" >
                    <div class="hint">*推流号是账号的唯一凭证，系统为您默认生成一个，只能修改一次，伙伴们也可以通过推流号找到你</div>
                </div>
            </div>
            <!-- 联系方式 -->
            <div v-show="cantactDetails">
                <div class="write_text">
                    <input class="write_ipt" id="ipt" type="tel" :placeholder="user_info.suMobile1 || '联系电话'" v-model="telValue" maxlength="11">
                </div>
                <div class="write_email">
                    <input class="write_ipt" id="ipt" type="tel" :placeholder="user_info.suTel1 || '固定电话'" v-model="fixedTel">
                </div>
                <div class="write_email">
                    <input class="write_ipt" type="emali" :placeholder="user_info.suMail || '邮箱'" v-model="emailValue">
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import Tokens from '../token'
export default {
    data(){
        return{
            user_info:'',//个人信息资料
            message:'',//标题
            from_path:'',//路径
            inputValue:'',//输入框的内容
            typeface:'',//默认内容
            plugId:false,//推流id显示
            cantactDetails:false,//联系方式显示
            disabledState:false,//推流ID是否是第一次默认ID
            saveShow:true,//保存按钮显示
            telValue:'',//电话输入框
            emailValue:'',//邮箱输入框
            status:'',//显示状态码
            fixedTel:'',//固定电话
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
        close(){
            let self = this;
            self.inputValue = '';
            self.telValue = '';
            self.emailValue = '';
            self.back('/my_information');
        },
        preserve(){//保存按钮
            let self = this;
            let pattern = /\ud83c[\udf00-\udfff]|\ud83d[\udc00-\ude4f]|\ud83d[\ude80-\udeff]|[&=%]/i;//名字不含特殊字符
            let tuilo = /^[A-Za-z0-9]+$/;//推流号为数字或字母
            let reg = /^(0|86|17951)?(1[3|4|5|7|8]\d{9})$/;//手机号码判断
            let fixedTelReg = /^(\(\d{3,4}\)|\d{3,4}-)?\d{7,8}$/;//固定电话判断
            let emailReg=/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;//邮箱格式判断
            let s;
            if(self.status == 1){
                if(self.inputValue == null || self.inputValue == ""){
                    self.$transfer.showToast(self, "请输入的您的名字");
                    return;
                }else if(self.inputValue == self.user_info.suName){
                    // self.$transfer.showToast(self, "您输入的名称已存在");
                    self.back('/my_information')
                    return;
                }else if(pattern.test(self.inputValue) && self.inputValue){
                    self.$transfer.showToast(self, "不能输入特殊字符");
                    return;
                }else if(self.inputValue.length > 12){
                    self.$transfer.showToast(self, "名称不得超过12个字符");
                    return;
                }else{
                    self.$Indicator.open();
                    let myDate = new Date();
                    let s = {action:"/user/save",commandType:"Update",rowId:self.user_info.rowId};
                    s.datasets = {dsData:{rows:[{rowId:self.user_info.rowId,"state":'u',"suId":self.user_info.suId,"suName":self.inputValue,"suModifyDate":myDate}]}};                
                    consoleShow(JSON.stringify(s));
                    self.common_use(s,'suName',self.inputValue); 
                }
            }else if(self.status == 2){
                if(!tuilo.test(self.inputValue)){
                    self.$transfer.showToast(self, "只能使用数字和字母");
                    return;
                }else{
                    self.$Indicator.open();
                    let myDate = new Date();
                    let s = {action:"/user/save",commandType:"Update",rowId:self.user_info.rowId};
                    s.datasets = {dsData:{rows:[{rowId:self.user_info.rowId,"state":'u',"suId":self.user_info.suId,"suCode":self.inputValue,"suModifyDate":myDate}]}};                
                    consoleShow(JSON.stringify(s));
                    self.common_use(s,'suCode',self.inputValue);
                }
            }else if(self.status == 3){
                if(self.telValue == self.user_info.suMobile1 && self.fixedTel == self.user_info.suTel1 && self.emailValue == self.user_info.suMail){//电话号码,固定电话,邮箱都没有改变
                    self.back('/my_information');
                    return;
                }else if(!reg.test(self.telValue) && self.telValue != ""){
                    self.$transfer.showToast(self, "您输入的手机号码格式不正确");
                    return;
                }else if(!fixedTelReg.test(self.fixedTel) && self.fixedTel != ""){
                    self.$transfer.showToast(self, "您输入的固定电话格式不正确");
                    return;
                }else if(!emailReg.test(self.emailValue) && self.emailValue != ""){
                    self.$transfer.showToast(self, "您输入的邮箱格式不正确");
                    return;
                }else{
                    self.$Indicator.open();
                    let myDate = new Date();
                    let s = {action:"/user/save",commandType:"Update",rowId:self.user_info.rowId};
                    s.datasets = {dsData:{rows:[{rowId:self.user_info.rowId,"state":'u',"suId":self.user_info.suId,"suMobile1":self.telValue,'suTel1':self.fixedTel,"suMail":self.emailValue,"suModifyDate":myDate}]}};                   
                    consoleShow(JSON.stringify(s));
                    self.common_use(s,'suMobile1',self.telValue,'suTel1',self.fixedTel,'suMail',self.emailValue);
                }
            }
        },
        common_use(s,key1,val1,key2,val2,key3,val3){
            let self = this;
            doAjaxUpdate(s,function(data) {
                if(data.status == 0){
                    self.$transfer.backLogin(self, data);
                }else if(data.status == 1){
                    if(key2 != ''){
                        self.user_info[key1] = val1;
                        self.user_info[key2] = val2;
                        self.user_info[key3] = val3;
                        Tokens.save("user_info",self.user_info);
                    }else{
                        self.user_info[key1] = val1;
                        Tokens.save("user_info",self.user_info);
                    }
                    // self.inputValue = '';
                    // self.telValue = '';
                    // self.emailValue = '';
                    self.back('/my_information');
                }
                self.$Indicator.close();
            })
        }
    },
    route: {
        data ({ from, to, next }) {
            let self = this;
            //进入页面时token不存在
            if(!localStorage.getItem("token")){
                self.$transfer.backLogin(self, {info:'token没有值'});
                return;
            }
            self.user_info = Tokens.fetch("user_info");
            self.from_path = from.path;
            let nameId = self.$route.params.nameId;
            self.message = nameId;
            if(self.message == '姓名'){
                self.cantactDetails = false;
                self.plugId = true;
                self.inputValue = self.user_info.suName;
                self.typeface = self.user_info.suName;
                self.status = 1;
                self.saveShow = true;//可以进阶为更改input后再显示保存按钮
            }else if(self.message == '推流号'){
                self.cantactDetails = false;
                self.plugId = false;
                self.inputValue = self.user_info.suCode;
                self.typeface = self.user_info.suCode;
                self.status = 2;
                if(self.user_info.suId !== self.user_info.suCode){
                    self.disabledState = true;
                    self.saveShow = false;
                }else{
                    self.disabledState = false;
                    self.saveShow = true;
                }
            }else if(self.message == '联系方式'){
                self.cantactDetails = true;
                self.telValue = self.user_info.suMobile1;
                self.fixedTel = self.user_info.suTel1;
                self.emailValue = self.user_info.suMail;
                self.status = 3;
                self.saveShow = true;//可以进阶为更改input后再显示保存按钮
            }
           
            next()
        }
    }

}
</script>
<style scoped>
    .write_text{
        margin-top: .5rem;
    }
    .write_ipt{
        display: block;
        width:100%;
        height:100%;
        padding:.6rem;
    }
    #field_label{
        background-color: #dfdfdf;
    }
    .save{
        color:#FFD91E;
        padding: 0;
    }   
    .hint{       
        width:80%;
        margin: .8rem auto;
        font-size: .6rem;
    }
    .disabled_state{
        pointer-events: none;
        background-color: #ccc;
    }
    .write_email{
        border-top:1px solid #eee;
    }
</style>