<template>
	<div class="page">
		<mt-header fixed title="企业认证">
			<mt-button icon="back" slot="left" @click="back('/orgCheck', companyId)"></mt-button>
            <mt-button @click.stop="commitCheck()" slot="right" class="submitCheck"><span>提交</span></mt-button>
        </mt-header>
        <div class="container-top">
        	<!-- 企业名称 -->
        	<div class="item-title">
        		<span>企业全称</span>
        	</div>
        	<div class="item">
				<!-- 公司名 -->
				<div class="companyName">
					<input type="text" name="bdName" placeholder="请输入企业全称" value="" v-model="bdName">
					<!-- <span>{{ bdName }}</span> -->
				</div>
			</div>
			<!-- 企业证件 -->
			<div class="item-title">
        		<span>企业证件</span>
        	</div>
        	<!-- 证件合一, 证件分离 -->
        	<div class="licenseTab">
        		<mt-navbar class="page-part" :selected.sync="license">
	                <mt-tab-item id="licenseOne">
	                    <span style="font-size:15px;color:#000;">证件合一</span>
	                </mt-tab-item>
	                <mt-tab-item id="licenseFour">
	                    <span style="font-size:15px;color:#000;">证件分离</span>
	                </mt-tab-item>
	            </mt-navbar>
        	</div>
        	<div class="item-lg" id="out_business">
				<div class="voucherName">
					<span>营业执照</span>
				</div>
				<div class="voucherPhoto">
					<img v-if="isExist_business" :src="pic_business" style="height:60px;" @click="showBigPic(pic_business, 'business')">
					<span v-if="!isExist_business" class="iconfont" style="font-size:2.5rem;color:#707070;" type="business" @click="uploadImage($event)">&#xe652;</span>
					<span v-if="isExist_business" class="iconfont deleteButton" slot="icon" @click.stop="deleteImage('business')">&#xe6cf;</span>
				</div>
			</div>
			<div class="item-lg" id="out_road">
				<div class="voucherName">
					<span>道路运输许可证</span>
				</div>
				<div class="voucherPhoto">
					<img v-if="isExist_road" :src="pic_road" style="height:60px;" @click="showBigPic(pic_road, 'road')">
					<span v-if="!isExist_road" class="iconfont" style="font-size:2.5rem;color:#707070;" type="road" @click="uploadImage($event)">&#xe652;</span>
					<span v-if="isExist_road" class="iconfont deleteButton" slot="icon" @click.stop="deleteImage('road')">&#xe6cf;</span>
				</div>
			</div>
			<div class="item-lg" id="out_tax">
				<div class="voucherName">
					<span>税务登记证</span>
				</div>
				<div class="voucherPhoto">
					<img v-if="isExist_tax" :src="pic_tax" style="height:60px;" @click="showBigPic(pic_tax, 'tax')">
					<span v-if="!isExist_tax" class="iconfont" style="font-size:2.5rem;color:#707070;" type="tax" @click="uploadImage($event)">&#xe652;</span>
					<span v-if="isExist_tax" class="iconfont deleteButton" slot="icon" @click.stop="deleteImage('tax')">&#xe6cf;</span>
				</div>
			</div>
			<div class="item-lg" id="out_code">
				<div class="voucherName">
					<span>组织机构代码证</span>
				</div>
				<div class="voucherPhoto">
					<img v-if="isExist_code" :src="pic_code" style="height:60px;" @click="showBigPic(pic_code, 'code')">
					<span v-if="!isExist_code" class="iconfont" style="font-size:2.5rem;color:#707070;" type="code" @click="uploadImage($event)">&#xe652;</span>
					<span v-if="isExist_code" class="iconfont deleteButton" slot="icon" @click.stop="deleteImage('code')">&#xe6cf;</span>
				</div>
			</div>
			<div class="hint">
        		<p>1、以上资料仅供推流认证使用；</p>
        		<p>2、认证通过后将无法修改；</p>
        	</div>
        </div>
        <mt-popup :visible.sync="bigImgShow" position="center" class="popup_box" popup-transition="popup-fade">
    		<img :src="bigImg" width="100%">
            <div class="close_img" @click.stop="close_img_pop()">
                <!-- <span class="iconfont" style="font-size:2rem;color:#fff;">&#xe623;</span> -->
                <img src="../img/cha.png" width="40">
            </div>
        </mt-popup>
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
				bdName: "",//公司名称

				license: "licenseOne",//证件合一或者证件分离
				newImages: [],//要上传的图片数组

				pic_business: "",//营业执照
				pic_road: "",//道路运输许可证
				pic_tax: "",//税务登记证
				pic_code: "",//组织机构代码证

				isExist_business: false,//是否上传了营业执照
				isExist_road: false,//是否上传了道路运输许可证
				isExist_tax: false,//是否上传了税务登记证
				isExist_code: false,//是否上传了组织机构代码证

			    browserType:'',

			    bigImgShow:false,//Android显示大图
            	bigImg:'',//大图路径

			}
		},
		//打开网页执行的方法(只执行一次)
		ready() {
			var self = this;
			self.isShowTaxAndCode(self.license);
		},
		//内容改变时调用
		watch: {
			"license": function(){
				var self = this;
				//如果self.license==licenseOne, 就隐藏后面两个div
				self.isShowTaxAndCode(self.license);
			}	
		},
		//方法
		methods: {
			//显示隐藏税务登记证和组织机构代码证
			isShowTaxAndCode(license){
				if(license == "licenseOne"){
					$("#out_tax").hide();
					$("#out_code").hide();
				}else if(license == "licenseFour"){
					$("#out_tax").show();
					$("#out_code").show();
				}
			},
			//图片预览
			showBigPic(currentImgUrl, type){
				let self = this;
				let bigPic = [];
				let imgs = getImgURL() + "company/" + self.companyId + '_' + type + '_big.gif?' + new Date().getTime();//大图
				if(browserType=="android"){
	                self.bigImgShow = true;
	                self.bigImg = imgs;
	            }else{
	            	bigPic.push(imgs);
	            	weChatPreviewImg(currentImgUrl, bigPic);//预览图片
	            }
			},
			close_img_pop(){//查看大图后返回
	            let self = this;
	            self.bigImgShow = false;
	            self.bigImg = "";
	        },
			//删除图片
			deleteImage(type){
				let self = this;
				alert(self.companyId)
				alert(self.companyId + '_' + type + '.gif')
				doAjaxDelete(
				 	"other",
                    {
                        delpath: self.companyId + '_' + type + '.gif',
                        mode: "company",
                        id: self.companyId,
                        type: type,
                    },
                    function(data){
                    	//console.log(JSON.stringify(data, null, 4));
                    	if(data.status == 1){
                    		if(type == 'business'){//营业执照
								self.pic_business = "";
								self.isExist_business = false;
                    		}else if(type == "road"){//道路运输许可证
                    			self.pic_road = "";
								self.isExist_road = false;
                    		}else if(type == "tax"){//税务登记证
                    			self.pic_tax = "";
								self.isExist_tax = false;
                    		}else if(type == "code"){//组织机构代码证
                    			self.pic_code = "";
								self.isExist_code = false;
                    		}
                    	}
                    }
				);
			},
			//上传图片
			uploadImage(event){
				var self = this;
				var $node = $(event.currentTarget);//当前lable节点
				var _type = $node.attr("type");

				// android 原生选择上传图片
				if (browserType=="android") {
               	//	window.Photo.getPicture();
               	// 修改后 去掉裁剪的
               		window.Photo.getPic();
                	self.$nextTick(()=>{
                 		setTimeout(function(){
                   			// let imgData= window.Photo.getPicInfo();
                   			// 修改后 去掉裁剪方法。
                   			let imgData= window.Photo.getPicInfo1();
	                        doAjaxUpload(
	                            "single",
	                            {
	                                imgparams:imgData,
	                                mode:"company",
	                                id:self.companyId,
	                                type:_type
	                            },
	                            function(data){
	                            	if(_type == "business"){//营业执照
			                        	// self.pic_business = data.vispath[0] + "?" + new Date().getTime();
			                        	self.pic_business = data.vispath;
			                        	self.isExist_business = true;
			                        }else if(_type == "road"){//道路运输许可证
			                        	// self.pic_road = data.vispath[0] + "?" + new Date().getTime();
			                        	self.pic_road = data.vispath;
			                        	self.isExist_road = true;
		                    		}else if(_type == "tax"){//税务登记证
		                    			// self.pic_tax = data.vispath[0] + "?" + new Date().getTime();
		                    			self.pic_tax = data.vispath;
			                        	self.isExist_tax = true;
		                    		}else if(_type == "code"){//组织机构代码证
		                    			// self.pic_code = data.vispath[0] + "?" + new Date().getTime();
		                    			self.pic_code = data.vispath;
			                        	self.isExist_code = true;
		                    		}
			                        self.newImages = [];
	                            }
	                        )
                   		},500)
                     })
				}else{
					//微信选择图片
					weChatChooseOneImage(function(localids){
						self.newImages = self.newImages.concat(localids);
						//alert("self.newImages: " + self.newImages);
						if(self.newImages.length > 0){
							self.$Indicator.open();
							//将本地图片上传到微信服务器
							weChatUploadImg(self.newImages,function(result){
								//alert("result: " + result);
								let _data = {
	                               media_ids_arr: result.join("@"),
	                               mode : "company",
	                               id : self.companyId,
	                               type : _type
	                            };
	                            doWxAjaxUpload(_data,function(data){//将图片上传到数据库
	                            	if(data.status == 1){//执行成功
	                            		if(_type == "business"){//营业执照
				                        	self.pic_business = data.vispath[0] + "?" + new Date().getTime();
				                        	self.isExist_business = true;
				                        }else if(_type == "road"){//道路运输许可证
				                        	self.pic_road = data.vispath[0] + "?" + new Date().getTime();
				                        	self.isExist_road = true;
			                    		}else if(_type == "tax"){//税务登记证
			                    			self.pic_tax = data.vispath[0] + "?" + new Date().getTime();
				                        	self.isExist_tax = true;
			                    		}else if(_type == "code"){//组织机构代码证
			                    			self.pic_code = data.vispath[0] + "?" + new Date().getTime();
				                        	self.isExist_code = true;
			                    		}
				                        self.newImages = [];
	                            	}
	                            	self.$Indicator.close();
	                            });
							});
						}
					});
				}
			},
			//提交验证
	        commitCheck(){
	        	var self = this;
	        	//验证公司名称
	        	if($(".companyName").find("input").val() == ""){
                    self.$transfer.showToast(self, "公司名称不能为空", "bottom", 2000);
                    return;
	        	}
	        	//是否上传了营业执照
	        	if(!self.isExist_business){
	        		self.$transfer.showToast(self, "请上传营业执照", "bottom", 2000);
	        		return;
	        	}
	        	//是否上传了道路运输许可证
	        	if(!self.isExist_road){
	        		self.$transfer.showToast(self, "请上传道路运输许可证", "bottom", 2000);
	        		return;
	        	}
	        	//是否是证件分离
	        	if(self.license == "licenseFour"){
	        		//是否上传了税务登记证
		        	if(!self.isExist_tax){
		        		self.$transfer.showToast(self, "请上传税务登记证", "bottom", 2000);
		        		return;
		        	}
		        	//是否上传了组织机构代码证
		        	if(!self.isExist_code){
		        		self.$transfer.showToast(self, "请上传组织机构代码证", "bottom", 2000);
		        		return;
		        	}
	        	}

	        	self.companyData.bdName = self.bdName;//公司名称
	        	if(self.license == "licenseOne"){
	        		self.companyData.bdType = "QY1";//GR个人；QY1企业(一张认证图片)；QY4:企业(4张); *: 没认证
	        	}else if(self.license == "licenseFour"){
	        		self.companyData.bdType = "QY4";//GR个人；QY1企业(一张认证图片)；QY4:企业(4张); *: 没认证
	        	}
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
					params:{"opType":"TJ"},
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
				console.log(jsonData)
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
						self.bdName = data.dataset.rows[0].bdName;//设置公司名称
					}
				});
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
			//方法在这里执行, 每次打开页面都会执行一次
	        data ({ from, to, next }) {
	        	var self = this;
	        	//from.path 获取从哪个页面过来的
	        	self.fromPage = from.path;
	        	//得到公司id
	        	self.companyId = self.$route.params.companyId;
	        	//得到数据
				self.getCompanyData();
                // 
                self.browserType =browserType;
				//营业执照
				self.pic_business = getImgURL() + "company/" + self.companyId + '_business.gif?' + new Date().getTime();
	        	self.isExist_business = true;
	        	var ImgObj_business = new Image(); 
                ImgObj_business.src = self.pic_business;
                ImgObj_business.onerror = function(){
                    self.isExist_business = false;
                }
                //道路运输许可证
                self.pic_road = getImgURL() + "company/" + self.companyId + '_road.gif?' + new Date().getTime();
	        	self.isExist_road = true;
	        	var ImgObj_road = new Image(); 
                ImgObj_road.src = self.pic_road;
                ImgObj_road.onerror = function(){
                    self.isExist_road = false;
                }
                //税务登记证
                self.pic_tax = getImgURL() + "company/" + self.companyId + '_tax.gif?' + new Date().getTime();
	        	self.isExist_tax = true;
	        	var ImgObj_tax = new Image(); 
                ImgObj_tax.src = self.pic_tax;
                ImgObj_tax.onerror = function(){
                    self.isExist_tax = false;
                }

				//组织机构代码证
				self.pic_code = getImgURL() + "company/" + self.companyId + '_code.gif?' + new Date().getTime();
	        	self.isExist_code = true;
	        	var ImgObj_code = new Image(); 
                ImgObj_code.src = self.pic_code;
                ImgObj_code.onerror = function(){
                    self.isExist_code = false;
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
	.licenseTab{
		height: 41px;
		line-height: 41px;
		background: #fff;
		margin-bottom: 10px;
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
	}
	.item-title{
		width: 100%;
		height: 1.5rem;
		line-height: 1.5rem;
		padding-left: 0.5rem;
		color: #999;
		margin-top: 0.4rem;
	}
	.item .companyName input{
		width: 100%;
		height: 1.9rem;
		font-family: "微软雅黑";
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
	.item-lg-last{
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
	.mint-popup{
	    width:100%;height:100%;background: #f1f1f1;z-index: 2;
	}
	.popup_box{
	    margin-top: 2.2rem;
	}
	.close_img{
	    position: absolute;
	    top:1rem;right:1rem;
	    /*width:2rem;height:2rem;
	    line-height: 2rem;
	    text-align: center;
	    border-radius: 2rem;
	    background-color: #fff;
	    color:#999;
	    font-size: 1rem;*/
	}
</style>
