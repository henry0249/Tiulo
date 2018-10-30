<template>
	<div class="page">
		<mt-header fixed title="请选择创建或加入机构">
			<mt-button icon="back" slot="left" @click="backlogin()"></mt-button>
        </mt-header>
        <div class="container-top" id="ccc">
        	<div style="height:100%;padding:0.8rem 0.5rem 0 0.5rem;">
        		<div class="org_box" :class="{select_box:addOrgShow}" @click.stop="setUpOrg()">
        			<div class="create">我要创建</div>
        			<!-- <span class="ico_img"><span class="iconfont onceicon">&#xe88a;</span></span> -->
                    <div style="padding:.5rem 0;">
                        <img src="../img/create.png" style="width:25%;">
                    </div>
        			<div class="join_com">创建你的公司/团队</div>
        			<div class="join_team">Create Your Company / Team</div>
        		</div>
        		<div class="org_box" :class="{select_box:joinOrgShow}" @click.stop="joinOrg()">
        			<div class="create">我要加入</div>
        			<!-- <span class="ico_img"><span class="iconfont onceicon">&#xe680;</span></span> -->
                    <div style="padding:.5rem 0;">
                        <img src="../img/join.png" style="width:25%;">
                    </div>
        			<div class="join_com">加入已有的公司/团队</div>
        			<div class="join_team">Join A Company / Team</div>
        		</div>
        	</div>
        </div>
	</div>
</template>

<script>
import Tokens from '../token';
export default {
	data() {
		return{
			pathWay:'',//进入的路径
			addOrgShow:false,//创建机构框
			joinOrgShow:false,//加入机构
		}
	},
	methods: {
		go: function(link, param) {
            let self = this;
            self.$transfer.go(self, link, param);
        },
        back: function(link, param) {
            let self = this;
            self.$transfer.back(self, link, param);
        },
        backlogin(){
        	let self = this;
            // if(self.pathWay.indexOf('changeVersion') == 1){
            //     Tokens.save('registerPathWay','')
            //     self.back(self.pathWay)
            // }else{
            //     localStorage.setItem('token','')
            //     self.$transfer.back(self,localStorage.getItem("loginUrl")); 
            // }
            if(self.pathWay.indexOf('login') == 1 || self.pathWay.indexOf('register') == 1){
                localStorage.setItem('token','');
                self.$transfer.back(self,localStorage.getItem("loginUrl")); 
                // self.back('/login')
            }else{

                self.back('/changeVersion')
            }
            	
        },
        setUpOrg(){
        	let self = this;
        	self.addOrgShow = !self.addOrgShow;
        	self.joinOrgShow = false;
        	self.go('/selectRole')
        },
        joinOrg(){
        	let self = this;
        	self.joinOrgShow = !self.joinOrgShow;
        	self.addOrgShow = false;
        	self.go('/joinOrg')
        },
	},
	route: {
		//方法在这里执行, 每次打开页面都会执行一次
        data ({ from, to, next }) {
        	let self = this;
        	if(from.path){//判断进入路径
        		if(from.path.indexOf('selectRole') == 1 || from.path.indexOf('joinOrg') == 1){
        			self.pathWay = Tokens.fetch('registerPathWay');
        		}else{
        			Tokens.save('registerPathWay',from.path);
                	self.pathWay = from.path;
            	}
            }else{
                self.pathWay = Tokens.fetch('registerPathWay');
            }
            console.log(Tokens.fetch('registerPathWay'))
            self.addOrgShow = false;
            self.joinOrgShow = false;
            next();
        },
        deactivate ({ next }) {
        	let self = this;

            next();
        },
        canDeactivate ({ next, to, abort }) {
            let self = this;
            
            next();
        }
    }
}
</script>

<style scoped>
	.org_box{
		width:100%;
		height:46%;
		background-color: #fff;
		margin-bottom: 5%;
		border:2px solid transparent;
		border-radius: 5px;
		padding:1rem;
		text-align: center;
		overflow: hidden;
	}
	.select_box{
		border-color:#FFD91E;
	}
	.create{
		width:100%;
		text-align: center;
		font-size: 1rem;
	}
	.ico_img{
        display: block;
        width:3.5rem;height:3.5rem;
        line-height: 3.5rem;
        text-align: center;
        background-color: #E2C253;
        border-radius: 3.5rem;
        margin:1rem auto;
    }
    .onceicon{
        font-size:2rem;
        color:#fff;
    }
    .join_com{
    	height: 2rem;
    	line-height: 2rem;
    }
    .join_team{
    	height: 2rem;
    	line-height: 2rem;
    }
</style>

