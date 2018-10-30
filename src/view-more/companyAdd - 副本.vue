<template>
	<div class="page">
		<mt-header fixed :title="pageTitle">
			<mt-button v-if="operation!='noCompany'" icon="back" slot="left" @click="goBack()"></mt-button>
            <mt-button v-if="true" @click.stop="saveCompany()" slot="right" class="addCompany"><span>保存</span></mt-button>
        </mt-header>
        <div class="container-top">
        	<!-- 必填信息 -->
        	<div class="item" @click="popupBox">
				<span>头像</span>
				<div class="headIcon">
					<span><img src="../img/arrow_bg_right.png" style="width:0.5rem;margin-left:0.5rem;"></span>
				</div>
				<!-- 头像 -->
				<div class="headIcon">
					<span><img src="../img/head.png" style="width:2rem;border-radius:50%;margin-top:0.25rem;"></span>
				</div>
        	</div>
        	<!-- 头像选择弹窗 -->
        	<mt-popup :visible.sync="sheetVisible" position="bottom" class="head_portrait" popup-transition="popup-fade">
	            <div class="sub_content">
	                <div class="select_head">拍照</div>
	                <div class="select_head">从手机相册选取</div>
	                <div class="select_head" style="margin-top:0.25rem;" @click="hidePopup()">取消</div>
	            </div>
	        </mt-popup>
        	<div class="item">
				<span style="color:red;">机构名称&nbsp;:</span>
				<input type="text" name="bdName" v-model="bdName" placeholder="*必填信息">
        	</div>
        	<div class="item">
				<span style="display:block;float:left;">省&nbsp;市&nbsp;区&nbsp;&nbsp;:</span>
				<div @click.stop="showAddressBox()" class="addressBox" style="float:left;width:75%;padding-left:0.5rem;background:;">
					<span>地址</span>
				</div>
        	</div>
        	<div class="item item-last">
				<span style="display:block;float:left;">详细地址&nbsp;:</span>
				<input type="text" name="bdAddress" v-model="bdAddress" placeholder="详细地址">
        	</div>
			<!-- 联系方式 -->
        	<div class="item-title">
        		<span>联系方式</span>
        	</div>
        	<div class="item">
				<span>联&nbsp;系&nbsp;人&nbsp;&nbsp;:</span>
				<input type="text" name="bdContact" v-model="bdContact" placeholder="联系人">
        	</div>
        	<div class="item">
				<span>手&nbsp;机&nbsp;号&nbsp;&nbsp;:</span>
				<input type="text" name="bdContactMobile" v-model="bdContactMobile" placeholder="手机号">
        	</div>
        	<div class="item item-last">
				<span>固定电话&nbsp;:</span>
				<input type="text" name="bdContactTel" v-model="bdContactTel" placeholder="固定电话">
        	</div>
			<!-- 银行账号信息 -->
        	<div class="item-title">
        		<span>银行账号信息</span>
        	</div>
        	<div class="item">
				<span>开&nbsp;户&nbsp;名&nbsp;&nbsp;:</span>
				<input type="text" name="bdBankUser" v-model="bdBankUser" placeholder="开户名">
        	</div>
        	<div class="item">
				<span>开户银行&nbsp;:</span>
				<input type="text" name="bdBank" v-model="bdBank" placeholder="开户银行">
        	</div>
        	<div class="item item-last">
				<span>开户账号&nbsp;:</span>
				<input type="text" name="bdBankNo" v-model="bdBankNo" placeholder="开户账号">
        	</div>
        	<mt-popup :visible.sync="isShowAddressBox" position="bottom" class="head_portrait" popup-transition="popup-fade">
	            <div class="sub_content" style="background:#fff;">
	               <!-- <my-address :useraddress.sync="userAddress"></my-address> -->
                	<!-- <mt-picker :slots="addressSlots" track-by="$index" @change="onAddressChange" :visible-item-count="9"></mt-picker> -->
	            </div>
	        </mt-popup>
        </div>
	</div>
</template>

<script>
	import Tokens from '../token';
	export default {
		//数据
		data() {
			return{
				subSystem: "",//版本
				bdName: "",//机构名称
				bdAddress: "",//详细地址
				bdContact: "",//联系人
				bdContactMobile: Tokens.fetch("token")['userMobile'],//手机号
				bdContactTel: "",//固定电话
				bdBankUser: "",//开户名
				bdBank: "",//开户银行
				bdBankNo: "",//开户账号
				bdCreateUserId: Tokens.fetch("token")['userId'],//创建人
				bdOrgId: "*",//站点id
				bdLogo: "default.png",//公司logo
				bdType: "",//GR个人；QY1企业(一张认证图片)；QY4:企业(4张); *: 没认证
				bdDistrictId: "",//地区

				fromPage: "",//来自哪个页面
				operation: "",//操作(add为添加, noCompany为没有机构, 其他为机构详情)
				pageTitle: "",//页面标题
				companyId: "",//公司id, 用于查询机构详情
				companyData: [],//公司数据

				sheetVisible: false,//是否显示头像弹窗
				isShowAddressBox: false,//地址选择框

			}
		}, 
		//打开网页执行的方法
		ready() {
			
		},
		//内容改变时调用
		watch: {
			
		},
		//方法
		methods: {
			//返回键, 根据不同页面返回
			goBack(){
				var self = this;
				if(self.fromPage == 'noOrg'){
					self.back('/noOrg');
				}else if(self.fromPage == 'companyList'){
					self.back('/companyList');
				}else{
					self.back('/login');
				}
			},
			
			//控制保存
			saveCompany(){
				var self = this;
				if(self.operation == "add"){//新增机构的保存
					//alert("新增");
					self.insertCompany();
				}else{
					//alert("修改");
					self.updateCompany();//机构详情的保存
				}
			},
			//新增公司的保存
			insertCompany(){
				var self = this;
				//验证必填信息是否为空
				if(self.bdName == ""){
                    self.$transfer.showToast(self, "机构名称为必填信息", "center", 3000);
					return;
				}
				var jsonData = new Object();
				if(self.subSystem == "TMS"){//运力版
					jsonData = {
						action: "/company/save",
						//数据
						datasets: {
							dsData: {
								rows: [{
									"state": "i",//必须, 不然会报空指针异常
									"bdName": self.bdName,
									"bdAddress": self.bdAddress,
									"bdContact": self.bdContact,
									"bdContactMobile": self.bdContactMobile,
									"bdContactTel": self.bdContactTel,
									"bdBankUser": self.bdBankUser,
									"bdBank": self.bdBank,
									"bdBankNo": self.bdBankNo,
									"bdCreateUserId": self.bdCreateUserId,
									"bdOrgId": self.bdOrgId,
									"bdLogo": self.bdLogo
								}]
							}
						},
					};
				}else{
					jsonData = {
						action: "/owner/save",
						//数据
						datasets: {
							dsData: {
								rows: [{
									"state": "i",//必须, 不然会报空指针异常
									"bdName": self.bdName,
									"bdAddress": self.bdAddress,
									"bdContact": self.bdContact,
									"bdContactMobile": self.bdContactMobile,
									"bdContactTel": self.bdContactTel,
									"bdBankUser": self.bdBankUser,
									"bdBank": self.bdBank,
									"bdBankNo": self.bdBankNo,
									"bdCreateUserId": self.bdCreateUserId,
									"bdOrgId": self.bdOrgId,
									"bdLogo": self.bdLogo,
									"bdIsConsigner": "1"
								}]
							}
						},
					};
				}
				doAjaxUpdate(jsonData, function(data){
					//console.log(JSON.stringify(data, null, 4));
					if(data.status == "1"){//如果执行成功
		      			self.$MessageBox.confirm('认证机构可以获得更多权限', {
			      				"title": "新增机构成功, 是否认证?",
			      				"confirmButtonText": "立即认证",
			      				"cancelButtonText": "下次再说"
			      			}).then(action => {//立即认证
			                	self.go('/orgCheck', data.datasets.dsData.rows[0].bdId);//跳转到认证页面
			            	}).catch(function(){//下次再说
		            			self.go('/companyList');//跳转到机构与认证管理页面
		            	});
					}else if(data.status == 0){
						self.$transfer.backLogin(self, data);
					}
				});
			},
			//机构详情的保存
			updateCompany(){
				var self = this;
				//验证必填信息是否为空
				if(self.bdName == ""){
                    self.$transfer.showToast(self, "机构名称为必填信息", "center", 3000);
					return;
				}
				//设置数据
				self.companyData.state = "u";//必须把状态修改为update状态
				self.companyData.bdName = self.bdName;//机构名称
				self.companyData.bdAddress = self.bdAddress;//详细地址
				self.companyData.bdContact = self.bdContact;//联系人
				self.companyData.bdContactMobile = self.bdContactMobile;//手机号
				self.companyData.bdContactTel = self.bdContactTel;//固定电话
				self.companyData.bdBankUser = self.bdBankUser;//开户名
				self.companyData.bdBank = self.bdBank;//开户银行
				self.companyData.bdBankNo = self.bdBankNo;//开户账号
				self.companyData.bdDistrictId = self.bdDistrictId;//地区

				var jsonData = new Object();
				if(self.subSystem == "TMS"){//运力版
					jsonData = {
						action: "/company/save",
						//数据
						datasets: {
							dsData: {
								rows: [self.companyData]
							}
						},
					};
				}else{
					jsonData = {
						action: "/owner/save",
						//数据
						datasets: {
							dsData: {
								rows: [self.companyData]
							}
						},
					};
				}
				//console.log("jsonData: " + JSON.stringify(jsonData, null, 4));
				doAjaxUpdate(jsonData, function(data){
					//console.log("data: " + JSON.stringify(data, null, 4));
					if(data.status == "1"){//如果执行成功
                        self.$transfer.showToast(self, "保存成功", "bottom", 3000);
                        //跳转到机构列表
                        self.go('/companyList');
					}else if(data.status == 0){
						self.$transfer.backLogin(self, data);
					}
				});
			},
			//得到公司数据
			getCompanyData() {
				var self = this;
				var jsonData = new Object();
				if(self.subSystem == "TMS"){
					jsonData = {
						action: "/company/query1",
						params: {
							"bdId": self.companyId
						}
					};
				}else{
					jsonData = {
						action: "/owner/query",
						params: {
							"bdId": self.companyId,
							"bdIsConsigner": '1'
						}
					};
				}
				doAjaxQuery(jsonData, function(data){
					//console.log(JSON.stringify(data, null, 4));
					if(data.status == "1"){//如果后台执行成功
						//console.log(JSON.stringify(data.dataset.rows[0], null, 4));
						self.companyData = data.dataset.rows[0];//数据rows
						//设置数据
						self.bdName = self.companyData.bdName;//机构名称
						self.bdAddress = self.companyData.bdAddress;//详细地址
						self.bdContact = self.companyData.bdContact;//联系人
						self.bdContactMobile = self.companyData.bdContactMobile,//手机号
						self.bdContactTel = self.companyData.bdContactTel;//固定电话
						self.bdBankUser = self.companyData.bdBankUser;//开户名
						self.bdBank = self.companyData.bdBank;//开户银行
						self.bdBankNo = self.companyData.bdBankNo;//开户账号
						self.bdDistrictId = self.companyData.bdDistrictId;//地区
						self.bdType = self.companyData.bdType;//个人还是企业
						self.bdLogo = getImgURL() + "company/" + self.companyData.bdLogo;//头像
						// console.log(self.companyData.bdType);
						if(self.companyData.bdType == "" || self.companyData.bdType == "*"){
							self.pageTitle = "机构详情";
						}else if(self.companyData.bdType == "GR"){
							self.pageTitle = "个人详情";
						}else if(self.companyData.bdType == "QY1" || self.companyData.bdType == "QY4"){
							self.pageTitle = "企业详情";
						}
					}else if(data.status == 0){
						self.$transfer.backLogin(self, data);
					}
				});
			},
			//显示地址选择框
			showAddressBox(){
				var self = this;
				self.isShowAddressBox = true;
			},
			//显示底部弹窗
			popupBox(){
				var self = this;
				self.sheetVisible = true;
			},
			//隐藏底部弹窗
			hidePopup(){
				var self = this;
				self.sheetVisible = false;
			},
			go: function(link, param) {
	            let self = this;
	            self.$transfer.go(self, link, param);
	        },
	        back: function(link, param) {
	            let self = this;
	            self.$transfer.back(self, link, param);
	        }
		},
		route: {
	        data ({ from, to, next }) {
	        	var self = this;
	        	var tokens = Tokens.fetch('token');
	        	self.subSystem = tokens["subSystem"];//版本
	        	//还原页面数据
	        	self.bdName = "";//机构名称
				self.bdAddress = "";//详细地址
				self.bdContact = tokens['userName'];//联系人
				self.bdContactMobile = tokens['userMobile'];//手机号
				self.bdContactTel = "";//固定电话
				self.bdBankUser = "";//开户名
				self.bdBank = "";//开户银行
				self.bdBankNo = "";//开户账号
				self.bdCreateUserId = tokens['userId'];//创建人
				self.bdOrgId = "*";//站点id
				self.bdLogo = "default.png";//公司logo
				self.sheetVisible = false;//是否显示底部弹窗

				self.operation = self.$route.params.operation;//参数
				if(self.operation == "add"){//新增机构
					//alert("新增机构");
					self.pageTitle = "新增机构";
				}else{//机构详情
					//alert("机构详情");
					self.companyId = self.operation;  
					//得到公司数据
	        		self.getCompanyData();
				}

				self.fromPage = "";
				if(from.path && (from.path.indexOf('noOrg') != -1)){//如果noOrg页面过来的
					self.fromPage = "noOrg";
				}else if(from.path && (from.path.indexOf('companyList') != -1)){//companyList
					self.fromPage = "companyList";
				}

	            next();
	        },
	        deactivate ({ next }) {
	            next();
	        },
	        canDeactivate ({ next, to, abort }) {
	            const self = this;
	            next();
	        }
	    }

	}

</script>

<style scoped>
	.addCompany{
		color: #FFE91B;
		font-family: "微软雅黑";
		font-size: 0.75rem;
	}
	.container-top{
		padding-top: 0.75rem;
		padding-bottom: 2.5rem;

	}
	.item{
		width: 100%;
		height: 2.5rem;
		line-height: 2.5rem;
		padding: 0 0.5rem 0 0.5rem;
		background: #fff;
		font-family: '微软雅黑';
		border-bottom: 1px #eee solid;
	}
	.item input{
		width: 70%;
		padding-left: 0.5rem;
		font-family: '微软雅黑';
		background: ;
	}
	.item-last{
		border: 0;
	}
	.item-title{
		width: 100%;
		height: 1.5rem;
		line-height: 1.5rem;
		padding-left: 0.5rem;
		color: #666;
	}
	/* 头像 */
	.headIcon{
		height: 2.5rem;
		line-height: 2.85rem;
		float: right;
	}
	/* 弹窗 */
	.head_portrait{
        width:100%;
        height:7.5rem;
        background: #D1D1D1;
    }
	.sub_content{
        width:100%;
        position: fixed;
        left:0;
        bottom:0;
    }
    .select_head{
        width:100%;height:2.5rem;
        line-height: 2.5rem;
        background-color: #fff;
        text-align: center;
        font-size: .9rem;
        border-top: 1px solid #eee;
    }
</style>

