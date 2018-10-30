<template>
	<div class="page">
		<mt-header fixed :title="message">
            <mt-button icon="back" slot="left" @click="back('/group_sort')"></mt-button>
            <mt-button class="save" v-show="saveShow" slot="right" @click="saveipt()">保存</mt-button>
        </mt-header>
        <div class="container-top">
            <div class="write_text">
                <input class="write_ipt" type="text" :placeholder="message" v-model="inputValue">
            </div>
        </div>
	</div>
</template>
<script>
import Tokens from '../token'
export default {
    data () {
        return {
            from_path:'',//进入的路径
            token:Tokens.fetch("token"),//读取本地的token
            dast:Tokens.fetch('newGroup'),//读取本地的新分组信息
            message:'',//分组名称
            saveShow:false,//修改保存状态
            inputValue:''
        }
    },
    watch:{
        'inputValue': function(e){
            let self = this;
            if(e!=''){
                self.saveShow = true;
            }else{
                self.saveShow = false;
            }
        }
    },
    ready(){
        let self = this;
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
        saveipt(){
            let self = this;
            let myDate = new Date();
            if(self.message == self.inputValue){
                // self.$transfer.showToast(self, "与原有名称一致！");
                // return;
                self.back('/group_sort') 
            }else{
                let clickGroup = Tokens.fetch('clickGroup')
                let s = {action:'/cmsFriendGroup/save',commandType:"Update"}
                s.datasets = {dsData:{rows:[{rowId:"",state:"u",cfgId:clickGroup.cfgId,cfgName:self.inputValue,cfgModifyDate:clickGroup.cfgModifyDate}]}}
                doAjaxUpdate(s,function(data) {
                    if(data.status == 0){
                        self.$transfer.backLogin(self, data);
                    }else if(data.status == 1){
                        consoleShow(data)
                        self.saveShow = false;
                        clickGroup.cfgName = self.inputValue;
                        Tokens.save('clickGroup',clickGroup)
                        self.back('/group_sort')                        
                    }
                })
            }
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
            self.from_path = from.path;
            self.message = self.$route.params.nameId;
            self.inputValue = self.message;
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
    .save{
        color:#FFD91E;
    }
    .write_text{
        margin-top: .5rem;
    }
    .write_ipt{
        display: block;
        width:100%;
        padding:.6rem;
    }
</style>