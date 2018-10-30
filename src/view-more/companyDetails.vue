<template>
	<div class="page">
		<mt-header fixed :title="pageTitle">
			<mt-button icon="back" slot="left" @click="back('/companyList')"></mt-button>
            <mt-button @click.stop="updateCompany()" slot="right" class="addCompany"><span>保存</span></mt-button>
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
					<span><img :src="bdLogo" style="width:2rem;border-radius:50%;margin-top:0.25rem;" onerror="javascript:this.src='http://tiulo-dbcon.oss-cn-hangzhou.aliyuncs.com/company/default.png'"></span>
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
        	<div class="item item-last">
				<span>详细地址&nbsp;:</span>
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
				<input type="text" name="bdBank" v-model="bdBank" placeholder="开户银行" >
        	</div>
        	<div class="item item-last">
				<span>开户账号&nbsp;:</span>
				<input type="text" name="bdBankNo" v-model="bdBankNo" placeholder="开户账号" >
        	</div>
        	<!-- 个人证件 -->
        	<div v-if="bdType=='GR'">
        		<div class="item-title">
	        		<span>个人证件</span>
	        	</div>
	        	<div class="item-lg">
					<div class="voucherName">
						<span>身份证正面</span>
					</div>
					<div class="voucherPhoto">
						<img src="../img/camera_off.png">
					</div>
				</div>
				<div class="item-lg">
					<div class="voucherName">
						<span>身份证反面</span>
					</div>
					<div class="voucherPhoto">
						<img src="../img/camera_off.png">
					</div>
				</div>
        	</div>
        	<!-- 企业证件 -->
        	<div v-if="bdType=='QY1' || bdType=='QY4'">
				<div class="item-title">
	        		<span>企业证件</span>
	        	</div>
	        	<div class="item-lg">
					<div class="voucherName">
						<span>营业执照</span>
					</div>
					<div class="voucherPhoto">
						<img src="../img/camera_off.png">
					</div>
				</div>
        	</div>
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
				bdContactMobile: "",//手机号
				bdContactTel: "",//固定电话
				bdBankUser: "",//开户名
				bdBank: "",//开户银行
				bdBankNo: "",//开户账号
				bdDistrictId: "",//地区
				bdLogo: "",//头像
				bdType: "",//GR个人；QY1企业(一张认证图片)；QY4:企业(4张); *: 没认证

				pageTitle: "机构详情",//页面标题

				companyId: "",//公司id
				fromPage: "",//来自哪个页面
				companyData: [],//公司数据

				sheetVisible: false,//是否显示底部弹窗
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
					console.log(JSON.stringify(data, null, 4));
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
						console.log("self.bdLogo: " + self.bdLogo);
						//console.log(self.companyData.bdType);
						if(self.companyData.bdType == "*" || self.companyData.bdType == ""){
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
			//保存
			updateCompany(){
				var self = this;
				//验证必填信息是否为空
				if(self.bdName == ""){
                    self.$transfer.showToast(self, "机构名称为必填信息", "center", 3000);
					return;
				}
				//设置数据
				self.companyData.bdName = self.bdName;//机构名称
				self.companyData.bdAddress = self.bdAddress;//详细地址
				self.companyData.bdContact = self.bdContact;//联系人
				self.companyData.bdContactMobile = self.bdContactMobile;//手机号
				self.companyData.bdContactTel = self.bdContactTel;//固定电话
				self.companyData.bdBankUser = self.bdBankUser;//开户名
				self.companyData.bdBank = self.bdBank;//开户银行
				self.companyData.bdBankNo = self.bdBankNo;//开户账号
				self.companyData.bdDistrictId = self.bdDistrictId;//地区
				self.companyData.state = "u";//*修改为update状态

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
				doAjaxUpdate(jsonData, function(data){
					if(data.status == "1"){//如果执行成功
		      			self.$Toast({//显示错误提示
                            message: "保存成功",
                            position: "bottom",
                            duration: 3000
                        });
                        //跳转到机构列表
                        self.go('/companyList');
					}else if(data.status == 0){
						self.$transfer.backLogin(self, data);
					}
				});
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
	        	self.subSystem = tokens["subSystem"];
	        	//from.path 获取从哪个页面过来的
	        	self.fromPage = from.path;
	        	//得到公司id
	        	self.companyId = self.$route.params.companyId;
	        	//得到公司数据
	        	self.getCompanyData();

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
	/*证件信息*/
    .item-lg{
		width: 100%;
		height: 4.5rem;
		line-height: 4.5rem;
		background: #fff;
		padding-left: 0.5rem;
		padding-right: 0.5rem;
		border-bottom: 0.05rem #eee solid;
	}
	.item-lg .voucherName{
		float: left;
	}
	.item-lg .voucherPhoto{
		height: 4.5rem;
		float: right;
	}
	.item-lg .voucherPhoto img{
		margin-top: 0.5rem;
		width: 3.5rem;
	}
	.item-last{
		border: 0;
	}
</style>

