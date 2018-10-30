<template>
	<div class="page">
		<mt-header fixed title="新建分组">
            <mt-button icon="back" slot="left" @click="back_next()"></mt-button>
        </mt-header>
        <div class="container-top" id="new_group">
    		<input class="new_group" type="text" v-model="group_name" placeholder="请输入分组名称">
        	<mt-button class="next" @click="next_step()">下一步</mt-button>
        </div>
	</div>
</template>
<script>
import { MessageBox } from 'mint-ui';
import Tokens from '../token'
import  Mysearch  from '../components/mysearch'  

export default {
	components: {
        Mysearch
    },
	data () {
    	return {
            toke:'',//本地token值
    		group_name:'',
            from_path:'',
            backAddGroupPath:'',//返回路径保存
            back_name:'',//返回对比的值
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
        closes(){
        	let self = this;
        	self.addCrew = false;
        },
        back_next(){
            let self = this;
            self.group_name = '';
            self.back('/friends')
        },
        next_step(){
            let self = this;
            if(self.backAddGroupPath == '/add_member'){
                if(self.group_name == self.back_name){
                    let obj = self.group_name+'|'+Tokens.fetch("clickGroup")['cfgId'];
                    self.go('/add_member',obj)
                }else{
                    self.accFriend();
                }
            }else{
                self.accFriend();
            }   
        },
        accFriend(){
            let self = this;
            if(self.group_name == ''){
                self.$transfer.showToast(self, "组名不能为空");
                return
            }else{
                let token = Tokens.fetch("token");
                let s = {action:"/cmsFriendGroup/save",commandType:"Update"};
                s.datasets = {dsData:{rows:[{rowId:token.rowId,"state":"i","cfgName":self.group_name,"cfgUserId":token.userId,cfgSubSystem:token.subSystem}]}}
                consoleShow(JSON.stringify(s))
                doAjaxUpdate(s,function(data) {
                    if(data.status == 0){
                        self.$transfer.backLogin(self, data);
                    }else if(data.status == 1){
                        consoleShow(data)
                        let s = data.datasets.dsData.rows;
                        Tokens.save('newGroup',s);
                        MessageBox.confirm(
                        '新分组创建成功,是否立刻添加成员?',
                        {'showCancelButton': true,'cancelButtonClass':'cancelbtn','cancelButtonText':"否",'confirmButtonClass':'verify','confirmButtonText':"是"}
                        ).then(action => {
                            let obj = self.group_name+'|'+s[0].cfgId;
                            self.go('/add_member',obj)
                            // self.go('/add_member',self.group_name)
                        }).catch(function(){
                            self.back('/friends')
                        });                                               
                    }
                })
            } 
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
            self.toke = Tokens.fetch('token');
            if(from.path){
                Tokens.save('addGroupFromPath',from.path)
                self.from_path = from.path;
            }else{
                self.from_path = Tokens.fetch('addGroupFromPath');
            }
            if(self.from_path.indexOf('friends') == 1){
                self.backAddGroupPath = '/friends';
                self.group_name = '';
            }else if(self.from_path.indexOf('add_member') == 1){
                self.backAddGroupPath = '/add_member';
                let path = decodeURIComponent(self.from_path);//编码
                let way = path.split('/');
                self.group_name = way[way.length-1].split('|')[0];
                self.back_name = self.group_name;
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
<style scoped>
	.mint-popup{
        width: 100%;height: 100%; background: #f1f1f1;
    }
	.new_group{
        -webkit-appearance:none;
        width:100%;
		padding:.8rem .5rem;
		margin: .5rem 0 1rem;
		border-top:1px solid #e5e5e5;
		border-bottom:1px solid #e5e5e5;
        background-color: #fff;
        overflow: hidden;
	}
	.next{
        display: block;
        background-color: #353535;
        color:#ffd91e;
        width:70%;
        margin:0 auto;
        border-radius: .25rem;
	}
</style>
<style>

</style>