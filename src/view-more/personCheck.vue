<template>
	<div class="page">
		<mt-header fixed title="个人认证">
			<mt-button icon="back" slot="left" @click="back('/orgCheck', companyId)"></mt-button>
            <mt-button @click.stop="commitCheck()" slot="right" class="submitCheck"><span>提交</span></mt-button>
        </mt-header>
        <div class="container-top">
        	<!-- 企业名称 -->
        	<div class="item-title">
        		<span>个人资料</span>
        	</div>
        	<div class="item" >
				<!-- 姓名 -->
				<div class="personName">
					<input type="text" name="bdName" v-model="bdName" placeholder="个人真实姓名" >
				</div>
			</div>
			<div class="item item-last" >
				<!-- 身份证 -->
				<div class="personIDCard">
					<input type="text" name="bdContactIdCard" v-model="bdContactIdCard" placeholder="身份证号码(15位或18位)" >
				</div>
			</div>
			<!-- 个人证件 -->
			<div class="item-title">
        		<span>个人证件</span>
        	</div>
        	<div class="item-lg">
				<div class="voucherName">
					<span>身份证正面</span>
				</div>
	        	<div class="voucherPhoto">
	        		<img v-if="isExist_zm" :src="images_zm" class="images_fmzm" style="height:60px;" @click="showBigPic(images_zm, 'zm')">
	            	<span v-if="isExist_zm" class="iconfont deleteButton" slot="icon" @click.stop="deleteImage('zm')">&#xe6cf;</span>
	            	<span v-if="!isExist_zm" class="iconfont" style="font-size:2.5rem;color:#707070;" type="zm" @click="uploadImage($event)">&#xe652;</span>
	        	</div>
			</div>
			<div class="item-lg">
				<div class="voucherName">
					<span>身份证反面</span>
				</div>
	        	<div class="voucherPhoto">
	        		<img v-if="isExist_fm" :src="images_fm" class="images_fmzm" style="height:60px;" @click="showBigPic(images_fm, 'fm')">
	            	<span v-if="isExist_fm" class="iconfont deleteButton" slot="icon" @click.stop="deleteImage('fm')">&#xe6cf;</span>
	            	<span v-if="!isExist_fm" class="iconfont" style="font-size:2.5rem;color:#707070;" type="fm" @click="uploadImage($event)">&#xe652;</span>
	        	</div>
			</div>
			<div class="hint">
        		<p>1、以上资料仅供推流认证使用；</p>
        		<p>2、认证通过后将无法修改；</p>
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
				subSystem: Tokens.fetch('token')['subSystem'],//版本
				companyId: "",//公司id
				fromPage: "",//来自哪个页面
				companyData: [],//公司数据
				bdName: "",//真实姓名
				bdContactIdCard: "",//身份证号码
				//"http://tiulo-dbcon.oss-cn-hangzhou.aliyuncs.com/company/OWR1612061_zm.gif"
				imgUrl: getImgURL()+"company/",//图片路径
				newImages: [],//新加图片
				images_zm: "",//身份证正面
				images_fm: "",//身份证反面
				isExist_zm: false,//身份证正面照是否上传
				isExist_fm: false,//身份证反面照是否上传

                browserType:'',
			}
		},
		//打开网页执行的方法(只执行一次)
		ready() {
			
		},
		//内容改变时调用
		watch: {
			
		},
		//方法
		methods: {
			//图片预览
			showBigPic(currentImgUrl, type){
				var self = this;
				//alert("currentImgUrl: " + currentImgUrl);
				//alert("type: " + type);
				//http://tiulo-dbtest.oss-cn-hangzhou.aliyuncs.com/company/OWR1701014_zm_big.gif
				var bigPic = [];
				bigPic.push(getImgURL() + "company/" + self.companyId + '_' + type + '_big.gif?' + new Date().getTime());//大图
				//alert("bigPic: " + bigPic);
				weChatPreviewImg(currentImgUrl, bigPic);//预览图片
			},
			//删除上传的图片
			deleteImage(type){
				var self = this;
				doAjaxDelete(
				 	"other",
                    {
                        delpath: self.companyId + '_' + type + '.gif',
                        mode: "company",
                        id: self.companyId,
                        type: type,
                    },
                    function(data){
                    	alert(JSON.stringify(data, null, 4));
                    	if(data.status == 1){
                    		if(type == 'zm'){
								self.images_zm = "";
								self.isExist_zm = false;
                    		}else if(type == 'fm'){
								self.images_fm = "";
								self.isExist_fm = false;
                    		}
                    	}
                    }
				);
			},
			//上传图片
			uploadImage(event) {//$(event.currentTarget)当前节点
				var self = this;
				var $node = $(event.currentTarget);//当前lable节点
				var _type = $node.attr("type");
				//alert("_type: " + _type);
				// 调用原生android 选择图片 方法没问题。
				if (browserType=="android") {
				 alert("原生选择图片");
               	window.Photo.getPicture();
                self.$nextTick(()=>{
                 setTimeout(function(){
                   var base64= window.Photo.getPicInfo();
                    alertShow(base64);
                   },500)

                      }
                	)
				}else{
				//微信选择图片
				weChatChooseOneImage(function(localids){
					self.newImages = self.newImages.concat(localids);
					//alert("self.newImages: " + self.newImages);
					if(self.newImages.length > 0){
						//将本地图片上传到微信服务器
						self.$Indicator.open();
						weChatUploadImg(self.newImages,function(result){
							//alert("result: " + result);
							let _data = {
                                   media_ids_arr: result.join("@"),
                                   mode : "company",
                                   id : self.companyId,
                                   type : _type
                            };
                            doWxAjaxUpload(_data,function(data){//将图片上传到数据库
                            	//alert(JSON.stringify(data, null, 4));
                            	if(data.status == 1){//执行成功
			                        //alert("data.vispath[0]: " + data.vispath[0]);
			                        if(_type == "zm"){
			                        	self.images_zm = data.vispath[0] + "?" + new Date().getTime();
			                        	self.isExist_zm = true;
			                        }else if(_type == "fm"){
			                        	self.images_fm = data.vispath[0] + "?" + new Date().getTime();
			                        	self.isExist_fm = true;
			                        }
			                        self.newImages = [];
                            	}
                            	self.$Indicator.close();
		                    });
		                    self.$Indicator.close();
						});
					}
				});
			}
			},
			//提交验证
	        commitCheck(){
	        	var self = this;
	        	//验证姓名
	        	if($(".personName").find("input").val() == ""){
                    self.$transfer.showToast(self, "真实姓名不能为空", "bottom", 2000);
                    return;
	        	}
	        	//验证身份证信息
	        	var reg=/^[1-9]{1}[0-9]{14}$|^[1-9]{1}[0-9]{16}([0-9]|[xX]$)/;//身份证验证规则
	        	if(!reg.test($(".personIDCard").find("input").val())){
                    self.$transfer.showToast(self, "身份证格式不正确", "bottom", 2000);
                    return;
	        	}
	        	//是否上传了身份证正面照
	        	if(!self.isExist_zm){
                    self.$transfer.showToast(self, "请上传身份证正面照", "bottom", 2000);
	        		return;
	        	}
	        	//是否上传了身份证反面照
	        	if(!self.isExist_fm){
                    self.$transfer.showToast(self, "请上传身份证反面照", "bottom", 2000);
	        		return;
	        	}

	        	self.companyData.bdName = self.bdName;//真实姓名
	        	self.companyData.bdContactIdCard = self.bdContactIdCard;//身份证
	        	self.companyData.bdType = "GR";//GR个人；QY1企业(一张认证图片)；QY4:企业(4张); *: 没认证
	        	self.companyData.bdStatus2 = "1";//bdStatus2: 认证状态(0/初始 1已提交  y审核通过  n不通过)
	        	self.companyData.state = "u";//*修改为update状态

	        	//全部验证成功之后提交数据
	        	var jsonData = {
					//数据
					datasets: {
						dsData: {
							rows: [self.companyData]
						}
					},
					showError: function(error){
                        if(typeof error != "undefined"){
                           self.$Toast({//显示错误提示
                                message: error,
                                position: "bottom",
                                duration: 3000
                           });
                        }
                    },
				};
	        	if(self.subSystem == "TMS"){
	        		jsonData.action = "/company/save";
	        	}else{
	        		jsonData.action = "/owner/save";
	        	}
				doAjaxUpdate(jsonData, function(data){
					if(data.status == "1"){//如果执行成功
                        self.$MessageBox.confirm("您需要认证的资料已提交成功，我们将在1-3个工作日完成认证审核!", {
		      				"title": "操作提示",
		      				"confirmButtonText": "确定",
		      				"showCancelButton": false
		      			}).then(action => {//确定
		                	//跳转到机构列表
                    		self.go('/companyList');
		            	});
					}else if(data.status == 0){
						self.$transfer.backLogin(self, data);
					}
				});

	        },
			//得到公司信息
			getCompanyData() {
				var self = this;
				var jsonData = new Object();
				if(Tokens.fetch('token')['subSystem'] == "TMS"){
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
					if(data.status == 1){//如果后台执行成功
						//console.log("rows:" + JSON.stringify(data.dataset.rows, null, 4));
						self.companyData = data.dataset.rows[0];//数据rows
						self.bdName = "";//设置名字
						self.bdContactIdCard = "";
					}else if(data.status == 0){
						self.$transfer.backLogin(self, data);
					}
				});
			},
			go: function(link, param) {
	            let self = this;
	            self.$transfer.go(self, link, param);
	        },
	        back: function(link, param) {
	            let self = this;
	            self.$Indicator.close();
	            self.$transfer.back(self, link, param);
	        }
		},
		route: {
			//方法在这里执行, 每次打开页面都会执行一次
	        data ({ from, to, next }) {
	        	var self = this;
	        	//from.path 获取从哪个页面过来的
	        	self.fromPage = from.path;
	        	//得到公司id
	        	self.companyId = self.$route.params.companyId;
	        	//得到公司信息
	        	self.getCompanyData();

	        	self.images_zm = getImgURL() + "company/" + self.companyId + '_zm.gif?' + new Date().getTime();//身份证正面照
	        	self.images_fm = getImgURL() + "company/" + self.companyId + '_fm.gif?' + new Date().getTime();//身份证反面照
	        	//console.log("self.images_zm: " + self.images_zm);
	        	// 浏览器 类型
	        	self.browserType =browserType;
	        	//身份证正面照是否存在
	        	self.isExist_zm = true;
	        	var ImgObj = new Image(); 
                ImgObj.src = self.images_zm;
                ImgObj.onerror = function(){
                    self.isExist_zm = false;
                }
				//身份证反面照是否存在
                self.isExist_fm = true;
                var ImgObj_fm = new Image(); 
                ImgObj_fm.src = self.images_fm;
                ImgObj_fm.onerror = function(){
                    self.isExist_fm = false;
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
	.container-top{
		padding-bottom: 2.5rem;
	}
	.submitCheck{
		color: #FFE91B;
		font-family: "微软雅黑";
		font-size: 0.75rem;
	}
	.item{
		width: 100%;
		height: 2.5rem;
		line-height: 2.5rem;
		background: #fff;
		padding-left: 0.5rem;
		padding-right: 0.5rem;
		margin-top: 0.05rem;
	}
	.item-title{
		width: 100%;
		height: 1.5rem;
		line-height: 1.5rem;
		padding-left: 0.5rem;
		color: #999;
		margin-top: 0.4rem;
	}
	.item .personName input{
		width: 100%;
		height: 1.9rem;
		font-family: "微软雅黑";
		background: ;
	}
	.item .personIDCard input{
		width: 100%;
		height: 1.9rem;
		font-family: "微软雅黑";
		background: ;
	}
	.item-lg{
		width: 100%;
		height: 4.5rem;
		line-height: 4.5rem;
		background: #fff;
		padding-left: 0.5rem;
		padding-right: 0.5rem;
		border-bottom: 0.05rem #eee solid;
	}
	.item-last{
		border: 0;
	}
	.item-lg .voucherName{
		float: left;
	}
	.item-lg .voucherPhoto{
		height: 4.5rem;
		float: right;
		position: relative;
	}
	.item-lg .deleteButton{
		width: 1rem;
		height: 1rem;
		line-height: 1rem;
	    color: #f00;
	    position: absolute;
	    right: -0.2rem;
	    top: 0.2rem;
	}
	.item-lg .voucherPhoto img{
		margin-top: 0.5rem;
		height: 3.5rem;
		margin-top: 0.7rem;
	}
	.hint{
		width: 100%;
		padding-top: 0.25rem;
	}
	.hint p{
		text-align: center;
		color: #888;
	}
</style>

