<template>
    <div class="page">
    	<mt-header fixed title="个人详情">
            <mt-button icon="back" slot="left" @click="getback()"></mt-button>
            <mt-button class="save" slot="right" @click="saveName()" v-show="grouped">保存</mt-button>
        </mt-header>
        <div class="container-top">
        	<div class="header_detail">
        		<div class="imgLogo">
                    <img :src="user_info.suLogo" style="width:2rem;vertical-align:middle;">
                </div>
        		<div class="parent_box">
        			<div class="itemize">
        				<div class="lf">{{user_info.suName}}</div>
        				<div class="iconfont icon_sexM lf" v-show="user_info.suSex=='男'">&#xe60b;</div>
	                    <div class="iconfont icon_sexG lf" v-show="user_info.suSex=='女'">&#xe60d;</div>
	                    <div class="iconSet lf" v-show="user_info.suIsDriver == 1">企</div>
	                    <div class="iconSet lf" v-show="user_info.suIsTMS == 1">运</div>
	                    <div class="iconSet lf" v-show="user_info.suIsCustomer == 1">车</div>
        			</div>
        			<div class="itemize"><span class="liu_text">推流号：</span><span class="liu_code">{{user_info.suCode}}</span></div>
        		</div>
        	</div>
        	<div class="current_message" v-show="grouped">
        		<div class="remark">
        			<div class="remark_title lf">备注名</div>
                    <input @focus="iptFocus($event)" @blur="iptBlur($event)" type="text" v-model="remarkName" class="remark_input lf">
        		</div>
        		<div class="remark" style="border:none;">
        			<div class="remark_title lf">分组1</div>
        			<!-- 待改正(含有点击事件) -->
        			<div class="grouping lf" @click="changeGroup()">{{groupStr}}</div>
        		</div>
        	</div>
            <div class="current_message" v-show="!grouped">
                <div class="remark">
                    <div class="remark_title lf">备注名</div>
                    <input type="text" v-model="user_info.suName" class="remark_input lf connive" disabled="disabled">
                </div>
                <div class="remark" style="border:none;">
                    <div class="remark_title lf">分组2</div>
                    <!-- 待改正(含有点击事件) -->
                    <div class="grouping lf connive">{{groupStr}}</div>
                </div>
            </div>
        	<div class="contant_way">
        		<div class="remark">
        			<div class="remark_title lf">地区</div>
        			<div class="remark_content lf">{{user_info.suProvinceName}} &nbsp;&nbsp;&nbsp;{{user_info.suDistrictName}}</div>
        		</div>
        		<div class="remark">
        			<div class="remark_title lf">邮箱</div>
        			<div class="remark_content lf">{{user_info.suMail}}</div>
        			<div class="rg">
        				<span class="iconfont iconstyle">&#xe6fb;</span>
        			</div>
        		</div>
        		<div class="remark" style="border:none;">
        			<div class="remark_title lf">手机号</div>
        			<div class="remark_content lf">{{user_info.suMobile}}</div>
        			<div class="rg">
        				<span class="iconfont iconstyle">&#xe60e;</span>
        			</div>
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
            toke:'',//本地token
			friendDetail:'',//个人信息详情
			pathWay:'',//路径
            from_path:'',//具体路径保存
			user_info:'',//当前个人信息
			remarkName:'',//备注名称
			groupes:[],//所有分组集合
			groupStr:'',//显示的分组名称
            grouped:true,
		}
	},
	methods:{
		go (link, param) {
            let self = this;
            self.$transfer.go(self, link, param)
        },
        back (link, param) {
            let self = this;
            self.$transfer.back(self, link, param);
        },
        getback(){//返回原来页面
        	let self = this;
        	self.back(self.from_path)
        	self.$nextTick(()=>{
        		Tokens.save('fromPath','')
        	})
        },
        first_blood(){//进入页面加载的消息
        	let self = this;
        	let s = {action:'/user/query',params:{suId:self.friendDetail.suId}};
        	s.showFields = "suId,suName,suCode,suSex,suLogo,suProvinceName,suDistrictName,suMobile,suMail,suIsTMS,suIsCustomer,suIsDriver,suIsEmployee,rowId";
        	doAjaxQuery(s, function(data){
                if(data.status == 0){
                    self.$transfer.backLogin(self, data);
                }else if(data.status == 1){
                	consoleShow(data)
                	let arr = data.dataset.rows;
                	arr.forEach(function(item, index){
                        item.suLogo = getImgURL() +'user/' +item.suLogo;
                        var ImgObj = new Image(); 
                        ImgObj.src = item.suLogo; 
                        ImgObj.onerror = function(){
                            item.suLogo = getImgURL() + 'user/default.png';
                        }
                    })
                    self.user_info = arr[0];
                }
            })
        },
        double_kill(){//加载所有分组信息(group_sort页面读取)
        	let self = this;
        	let s = {
                action:'/cmsMyFriends/query',
                params:{
                    cmfUserId1:self.friendDetail.cmfUserId1,
                    cmfUserId2:self.friendDetail.cmfUserId2,
                    cmfSubSystem:self.friendDetail.cmfSubSystem
                }
            };
        	s.showFields = "cmfId,cmfGroupName,cmfGroupId,cmfModifyDate,cmfNickName,rowId"
        	doAjaxQuery(s, function(data){
                if(data.status == 0){
                    self.$transfer.backLogin(self, data);
                }else if(data.status == 1){
                	consoleShow(data)
                	let arr = data.dataset.rows;
                	// let str = '';
                	// arr.forEach(function(item,index){
                	// 	str = str + item.cmfGroupName + ';';
                	// })
                	self.groupes = arr;
                	self.groupStr = arr[0].cmfGroupName;
                }
            })
        },
        triple_kill(){//加载所有分组信息(tel_friends页面读取)
            let self = this;
            let s = {action:'/cmsMyFriends/query',params:{cmfUserId1:self.toke.userId,cmfUserId2:self.friendDetail.suId}};
            s.showFields = "cmfId,cmfGroupName,cmfGroupId,cmfModifyDate,cmfNickName,rowId";
            doAjaxQuery(s, function(data){
                if(data.status == 0){
                    self.$transfer.backLogin(self, data);
                }else if(data.status == 1){
                    consoleShow(data)
                    let arr = data.dataset.rows;
                    // let str = '';
                    // arr.forEach(function(item,index){
                    //     str = str + item.cmfGroupName + ';';
                    // })
                    self.groupes = arr;
                    self.groupStr = arr[0].cmfGroupName;
                }
            })
        },
        iptFocus(e){//修改备注名触发事件
        	let self = this;
        	let current = e.target;
        	$(current).css('border','1px solid #ccc')
        	$(current).css('color','#333')
        },
        iptBlur(e){//修改备注名失去焦点触发事件
        	let self = this;
        	let current = e.target;
        	$(current).css('border','1px solid #ededed')
        	$(current).css('color','#666')
            //alert(self.remarkName);
        },
        saveName(){//保存按钮点击事件
        	let self = this;
        	if(self.remarkName == self.friendDetail.suName){
        		self.back(self.from_path)
        	}else{
        		let rows = [];
        		self.groupes.forEach(function(item,index){
                    let row = {rowId:item.rowId,state:'u',cmfId:item.cmfId,cmfModifyDate:item.cmfModifyDate,cmfNickName:self.remarkName};
                    rows.push(row);
                })
        		let s = {action:"/cmsMyFriends/save",params:{cmfUserId1:self.toke.userId,cmfUserId2:self.friendDetail.suId,cmfSubSystem:self.toke.subSystem}};
        		s.datasets = {dsData:{rows:rows}};
        		doAjaxUpdate(s,function(data) {
                    if(data.status == 0){
                        self.$transfer.backLogin(self, data);
                    }else if(data.status == 1){
                    	consoleShow(data)
                        self.friendDetail.suName = self.remarkName;
                        Tokens.save('friendDetail',self.friendDetail)
                        self.$transfer.showToast(self, "修改成功");
                        setTimeout(function(){
                            self.back(self.from_path)
                        },1000)
                    }
                })
        	}
        },
        changeGroup(){//进入分组页面
        	let self = this;
            Tokens.save('groupRemarlName',self.remarkName)
            Tokens.save('changeGroupData',self.groupes)
        	self.go('/select_group')
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
            self.friendDetail = Tokens.fetch('friendDetail')
            self.first_blood();

            if(from.path){//判断进入路径
                if(from.path.indexOf('select_group')==1){
                    self.pathWay = from.path;
                }else{
                    Tokens.save('fromDetailPath',from.path);
                    self.pathWay = from.path;
                }  
            }else{//本页面刷新拿取路径
                self.pathWay = Tokens.fetch('fromDetailPath');
            }
            if(self.pathWay.indexOf('group_sort')==1){//如果是从分组进入详情的
                self.from_path = '/group_sort';
                self.double_kill();
                self.remarkName = self.friendDetail.cmfNickName2;
                self.grouped = true;
            }else if(self.pathWay.indexOf('tel_friends')==1){//如果是从全部信息进入详情的
                self.from_path = '/tel_friends';
                if(self.friendDetail.suIsFriend == 'true' || self.friendDetail.suIsFriend == 'self'){
                    self.grouped = true;
                    self.triple_kill();
                    self.remarkName = self.friendDetail.suName;
                }else{
                    self.grouped = false;
                }
            }else if(self.pathWay.indexOf('select_group')==1){//如果是从添加分组中返回的
                self.pathWay = Tokens.fetch('fromDetailPath');
                Tokens.save('fromDetailPath',self.pathWay);
                if(self.pathWay.indexOf('group_sort')==1){
                    self.from_path = '/group_sort';
                    self.double_kill();
                    self.grouped = true;
                }else if(self.pathWay.indexOf('tel_friends')==1){
                    self.from_path = '/tel_friends';
                    if(self.friendDetail.suIsFriend == 'true' || self.friendDetail.suIsFriend == 'self'){
                        self.grouped = true;
                        self.triple_kill();
                    }else{
                        self.grouped = false;
                    }
                }else if(self.pathWay.indexOf('friends') == 1){
                    self.from_path = '/friends';
                    self.double_kill();
                    self.grouped = true;
                }
                let remarkName = Tokens.fetch('groupRemarlName');
                if(remarkName != ''){
                    self.remarkName = remarkName;
                }
            }else if(self.pathWay.indexOf('noticeDetails') == 1){//公告详情
                self.from_path = self.pathWay;
                self.grouped = false;
                if(self.friendDetail.isFriend == undefined){
                    self.double_kill();
                    self.remarkName = self.friendDetail.cmfNickName2;
                }else if(self.friendDetail.isFriend == false){
                    self.groupStr = "";
                }
            }else if(self.pathWay.indexOf('friends') == 1){//如果是从未分组进入详情的
                self.from_path = '/friends';
                self.double_kill();
                self.remarkName = self.friendDetail.cmfNickName2;
            }
            next();
        },
        deactivate ({ next }) {
            let self = this;
            next();
        },
	}
}
</script>
<style scoped>
	.save{
        color:#FFD91E;
    }
	.lf{float:left;}
	.rg{float:right;}
	.header_detail{
		width:100%;
		height:3rem;
		background-color: #fff;
		padding:.5rem;
		box-sizing: border-box;	
		position: relative;
		margin-bottom: .5rem;
	}
	.imgLogo{
        display: table-cell;
        position: absolute;
        top:0.5rem;left:0.5rem;
        height:2rem;line-height: 2rem;
        border-radius: 4px;
    }
	.parent_box{
		width:100%;
		padding-left: 2.5rem;
	}
	.itemize{
		width:100%;
		height:1rem;
		font-size: .65rem;
			
	}
	.liu_text,.liu_code{
		display: inline-block;
		height:1rem;
		line-height: 1rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.liu_text{
		width:22%;
	}
	.liu_code{		
		width:78%;		
	}
	.icon_sexM,.icon_sexG{
		font-size: .9rem;
		height:1rem;
		line-height: 1rem;
		margin-left: .5rem;
	}
	.icon_sexM{color:#1B93FF;}
	.icon_sexG{color:#FD626E;}
	.iconSet{
        background-color: #000;
        color:#fff;
        width:1rem;height:1rem;
        line-height: 1rem;
        text-align: center;
        border-radius: 4px;
        margin-left: .4rem;
        font-size: .7rem;
    }
    /*当前信息*/
    .current_message{
    	width: 100%;
    	background-color: #fff;
    	margin-bottom: .5rem;
    }
    .remark{
    	height: 2rem;
    	line-height: 2rem;
    	margin:0 .5rem;
    	border-bottom:1px solid #efefef;
    }
    .remark_title{
    	/*display: inline-block;*/
    	width:25%;    	
    }
    .remark_input{
    	-webkit-appearance:none;
    	box-sizing: border-box;	
    	width:50%;
    	border-radius: .15rem;
    	border:1px solid #ededed;
    	color:#666;
    	padding-left: .5rem;
    	margin-top: .25rem;
    }
    .remark_btn{
    	/*display: inline-block;*/
    	width:15%;
    	height:1.4rem;
    	line-height: 1.4rem;
    	text-align: center;
    	margin-right: .5rem;
    	border:none;
    	border-radius: .15rem;
    	background-color: #353535;
    	color:#FFD91E;
    	margin-top: .25rem;
    }
    .remark_content{
    	display: inline-block;
    	width:60%;
    }
    .grouping{
    	display: inline-block;
    	width:70%;
    	height:1.5rem;
    	line-height: 1.5rem;
    	border: 1px solid #ededed;
    	border-radius: .15rem;	
    	padding-left: .5rem;
    	margin-top: .25rem;
    }
    /*地址信息*/
    .contant_way{
    	background-color: #fff;
    }
    .iconstyle{
    	margin-right: .5rem;
    	font-size:.7rem;
    	color:#FFD91E;
    	height:1.5rem;
    	line-height: 1.5rem;
    }

    .connive{
        background-color: #ccc;
    }
</style>