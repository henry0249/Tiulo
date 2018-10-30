<template>
	<div class="page">
		<mt-header fixed :title="pageTitle">
			<mt-button v-if="operation!='noCompany'" icon="back" slot="left" @click="goBack()"></mt-button>
            <mt-button v-if="true" @click.stop="saveCompany()" slot="right" class="addCompany"><span>保存</span></mt-button>
        </mt-header>
        <div class="container-top">
        	<!-- 必填信息 -->
        	<!-- 微信端调用方法 -->
        	<div class="item" @click="popupBox()" v-show="isWeixinShow">
				<span>头像1</span>
				<div class="headIcon">
					<span><img src="../img/arrow_bg_right.png" style="width:0.5rem;margin-left:0.5rem;"></span>
				</div>
				<!-- 头像 -->
				<div class="headIcon">
					<span><img :src="bdLogo" style="width:2rem;border-radius:50%;margin-top:0.25rem;"></span>
				</div>
        	</div>
        	<!-- 其他用户端调用图片方法 -->
        	<input id="ipt_none" style="display: none;" type="file" accept="image/*" @change="onFileChange">
        	<label for="ipt_none" v-show="!isWeixinShow" class="item imghead">
				<span>头像2</span>
				<div class="headIcon">
					<span><img src="../img/arrow_bg_right.png" style="width:0.5rem;margin-left:0.5rem;"></span>
				</div>
				<!-- 头像 -->
				<div class="headIcon">
					<span><img :src="bdLogo" style="width:2rem;border-radius:50%;margin-top:0.25rem;"></span>
				</div>
        	</label>
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
				<div @click.stop="showAddressBox()" class="addressBox" style="">
					<span>{{addRess}}</span>
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
        	<!-- 证件 -->
        	<div class="item-title">
        		<span v-if="bdType=='GR'">个人证件</span>
        		<span v-if="bdType=='QY1'||bdType=='QY4'">企业证件</span>
        	</div>
        	<!-- 个人证件 -->
        	<div v-if="bdType=='GR'">
        		<div class="voucher_item">
	        		<div class="voucherName">
	        			<span>身份证正面照</span>
	        		</div>
	        		<div class="voucherPic">
	        			<img :src="images_zm" @click="showBigPic(images_zm, 'zm')">
	        		</div>
	        	</div>
	        	<div class="voucher_item">
	        		<div class="voucherName">
	        			<span>身份证反面照</span>
	        		</div>
	        		<div class="voucherPic">
	        			<img :src="images_fm" @click="showBigPic(images_fm, 'fm')">
	        		</div>
	        	</div>
        	</div>
        	<!-- 企业证件 -->
        	<div v-if="bdType=='QY1'||bdType=='QY4'">
        		<div v-if="bdType=='QY1'||bdType=='QY4'" class="voucher_item">
	        		<div class="voucherName">
	        			<span>营业执照</span>
	        		</div>
	        		<div class="voucherPic">
	        			<img :src="pic_business" @click="showBigPic(pic_business, 'business')">
	        		</div>
	        	</div>
	        	<div v-if="bdType=='QY1'||bdType=='QY4'" class="voucher_item">
	        		<div class="voucherName">
	        			<span>道路运输许可证</span>
	        		</div>
	        		<div class="voucherPic">
	        			<img :src="pic_road" @click="showBigPic(pic_road, 'road')">
	        		</div>
	        	</div>
	        	<div v-if="bdType=='QY4'" class="voucher_item">
	        		<div class="voucherName">
	        			<span>税务登记证</span>
	        		</div>
	        		<div class="voucherPic">
	        			<img :src="pic_tax" @click="showBigPic(pic_tax, 'tax')">
	        		</div>
	        	</div>
	        	<div v-if="bdType=='QY4'" class="voucher_item">
	        		<div class="voucherName">
	        			<span>组织机构代码证</span>
	        		</div>
	        		<div class="voucherPic">
	        			<img :src="pic_code" @click="showBigPic(pic_code, 'code')">
	        		</div>
	        	</div>
        	</div>
        	<mt-popup :visible.sync="isShowAddressBox" position="bottom" class="head_portrait" popup-transition="popup-fade">
	            <div class="sub_content" style="background:#fff;" id="add_select">
	               <mt-picker id="pickshow" :slots="addressSlots" track-by="$index" @change="onAddressChange" :visible-item-count="9" v-if="istrue"></mt-picker>
	            </div>
	        </mt-popup>
	        <mt-popup :visible.sync="bigImgShow" position="center" class="popup_box" popup-transition="popup-fade">
	    		<img :src="bigImg" width="100%">
	            <div class="close_img" @click.stop="close_img_pop()">
	                <!-- <span class="iconfont" style="font-size:2rem;color:#fff;">&#xe623;</span> -->
	                <img src="../img/cha.png" width="40">
	            </div>
	        </mt-popup>
        </div>
	</div>
</template>

<script>
	import Addresses from '../address'
	import { pid_pName, cid_cName , zid_zName , pid_cIds, cid_zIds , cid_pid , zid_cid } from '../assets/pcz'
	import Tokens from '../token';
	export default {
		//数据
		data() {
			var addre = Addresses.address(Tokens.fetch('companyAddress')) || Addresses.address('1193')
			console.log(addre)
			console.log(Tokens.fetch('companyAddress'))
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
				bdLogo: "",//公司logo
				bdType: "",//GR个人；QY1企业(一张认证图片)；QY4:企业(4张); *: 没认证
				bdDistrictId: "1193",//地区

				fromPage: "",//来自哪个页面
				operation: "",//操作(add为添加, noCompany为没有机构, 其他为机构详情)
				pageTitle: "",//页面标题
				companyId: "",//公司id, 用于查询机构详情
				companyData: [],//公司数据

				sheetVisible: false,//是否显示头像弹窗
				isShowAddressBox: false,//地址选择框

				pic_business: "",//营业执照
				pic_road: "",//道路运输许可证
				pic_tax: "",//税务登记证
				pic_code: "",//组织机构代码证
				images_zm: "",//身份证正面
				images_fm: "",//身份证反面

				// 地址信息数据
				userAddress:addre,//地址全部信息(1193为杭州西湖区)
				countyIds:'1193',//3区域的Id
				provinceId:'P11',//1省份的Id
				province:'浙江省',//开始省份
				city:'杭州市',//开始城市
				county:'西湖区',//开始县区
				addRess:'浙江省 杭州市 西湖区',//地址

				//图片剪切数据
				isWeixinShow:true,//判断是不是微信登陆的
				image:'',//图片存储地址

				count:'1193',
				adds:'',
				// addressSlots:[],
				istrue:true,
				bigImgShow:false,//Android显示大图
            	bigImg:'',//大图路径
			}
		}, 
		//打开网页执行的方法
		ready() {
			
		},
		//内容改变时调用
		watch: {
			
		},
		computed:{
	        addressSlots:function(e){//默认显示的数据
	            let self = this;
	            let addressSlots = [
	                {
	                    flex: 1,
	                    values: Object.values(self.userAddress.provinces),
	                    className: 'slot1',
	                    textAlign: 'center',
	                    defaultIndex: self.userAddress.provinceNum
	                }, {
	                    flex: 1,
	                    values: Object.values(self.userAddress.citys),
	                    className: 'slot2',
	                    textAlign: 'center',
	                    defaultIndex: self.userAddress.cityNum
	                }, {
	                    flex: 1,
	                    values: Object.values(self.userAddress.countyes),
	                    className: 'slot3',
	                    textAlign: 'center',
	                    defaultIndex: self.userAddress.countyNum
	                }
	            ]
	            return addressSlots
	        }
	    },
		//方法
		methods: {
			onFileChange(e) {
	            var files = e.target.files || e.dataTransfer.files;
	            if (!files.length)return;
	            this.createImage(files);
	       	},
	       	takePhoto(){
	       		let self =this;
               	alert("测试手机上传图片");
               	window.Photo.getPicture();
                self.$nextTick(()=>{
               setTimeout(function(){
                   var base64= window.Photo.getPicInfo();
                    alertShow(base64);
                   },500)

                }
                	)
	       	},
	        createImage(file) {
	            let self = this;
	            if(typeof FileReader==='undefined'){
	                alert('您的浏览器不支持图片上传，请升级您的浏览器');
	                return false;
	            }
	            let image = new Image();         
	            // let self = this;
	            let leng=file.length;
	            for(var i=0;i<leng;i++){
	                var reader = new FileReader();
	                reader.readAsDataURL(file[i]); 
	                reader.onload =function(e){
	                    self.image = e.target.result;
	                    Tokens.save("img_path",self.image);
	                    self.go('/clip_img')                              
	                };                 
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
			//返回键, 根据不同页面返回
			goBack(){
				var self = this;
				Tokens.save("companyAddClipImg","")
				if(self.fromPage == 'noOrg'){
					self.back('/noOrg');
				}else if(self.fromPage == 'companyList'){
					self.back('/companyList');
				}else{
					var _path = Tokens.fetch('companyAddFromPath');
					self.back(_path);
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
				console.log("新增")
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
									"bdDistrictId": self.bdDistrictId
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
									"bdDistrictId": self.bdDistrictId,
									"bdIsConsigner": "1"
								}]
							}
						},
					};
				}
				doAjaxUpdate(jsonData, function(data){
					//console.log(JSON.stringify(data, null, 4));
					if(data.status == "1"){//如果执行成功
						self.companyId = data.datasets.dsData.rows[0].bdId;
						if(self.bdLogo){
							var imgObj = Tokens.fetch("companyAddClipImg");
							doAjaxUpload(
		                        "single",
		                        {
		                            imgparams:JSON.stringify(imgObj),
		                            mode:"company",
		                            id:self.companyId,
		                            type:"logo"
		                        },
		                        function(data){
		                            Tokens.save("companyAddClipImg","")
		                            Tokens.save("companyCurrentId","")
		                        }
		                    )
						}
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
				self.$nextTick(()=>{

                    
                })
			},
			//机构详情的保存
			updateCompany(){
				var self = this;
				//验证必填信息是否为空
				if(self.bdName == ""){
                    self.$transfer.showToast(self, "机构名称为必填信息", "center", 3000);
					return;
				}
				console.log(self.companyData)
				// console.log(self.bdLogo)
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
				self.$Indicator.open();
				//console.log("jsonData: " + JSON.stringify(jsonData, null, 4));
				doAjaxUpdate(jsonData, function(data){
					// console.log("保存的data: " + JSON.stringify(data, null, 4));
					if(data.status == "1"){//如果执行成功
						var imgObj = Tokens.fetch("companyAddClipImg");
						doAjaxUpload(
	                        "single",
	                        {
	                            imgparams:JSON.stringify(imgObj),
	                            mode:"company",
	                            id:self.companyId,
	                            type:"logo"
	                        },
	                        function(data){
	                            Tokens.save("companyAddClipImg","");
	                            Tokens.save("companyCurrentId","");
	                            self.$Indicator.close();
	                            self.$transfer.showToast(self, "保存成功", "middle", 1000);
	                            setTimeout(function(){
	                            	self.go('/companyList');
	                            },1000);
	                        }
	                    );
	                    if(!imgObj){//如果没有上传图片
	                    	self.$transfer.showToast(self, "保存成功", "middle", 1000);
	                    	setTimeout(function(){
                            	self.go('/companyList');
                            },1000);
	                    }
                        
                        //跳转到机构列表
                        // self.go('/companyList');
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
					// console.log(JSON.stringify(data, null, 4));
					if(data.status == "1"){//如果后台执行成功
						console.log(JSON.stringify(data.dataset.rows[0], null, 4));
						self.companyData = data.dataset.rows[0];//数据rows
						console.log(data)
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
						// self.bdLogo = getImgURL() + "company/" + self.companyData.bdLogo;//头像
						self.bdLogo = getImgURL() + "company/" + self.companyData.bdLogo;
						Tokens.save("companyCurrentId",self.companyId)
						// 机构详情图片
						let imgSrc = Tokens.fetch("companyAddClipImg");
						Tokens.save('companyAddress','');//新增机构去掉已有的地址
						if(imgSrc){
							self.bdLogo = imgSrc.newURL;
						}else{
							self.bdLogo = getImgURL() + "company/" + self.companyData.bdLogo;
						}


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
			//微信調取圖片
			popupBox(){
				let self = this;
				if(browserType == "android"){
					window.Photo.getPicture();
	                self.$nextTick(
	                    setTimeout(function(){
	                        let imgData= window.Photo.getPicInfo();
	                        imgData = JSON.parse(imgData)
	                        Tokens.save("companyAddClipImg",imgData);
	                        self.bdLogo = imgData.newURL;
	                    },500)
	                )
				}else if(browserType == "weixin"){
					weChatChooseImage(function(localIds){//通过微信获取图片
		                let localId = [];
		                localId.push(localIds[0])
		                weChatUploadImg(localId,function(result){//传给微信服务器返回服务器图片ID
		                    getBase64Coder(result,function(path){
		                        Tokens.save("img_path",path);
		                        self.go('/clip_img'); 
		                    })
		                })               
		            })
				}
			},
			//隐藏底部弹窗
			hidePopup(){
				var self = this;
				self.sheetVisible = false;
			},
			go(link, param) {
	            let self = this;
	            self.$transfer.go(self, link, param);
	        },
	        back(link, param) {
	            let self = this;
	            self.$transfer.back(self, link, param);
	        },
	        onAddressChange(picker, values) {//地址切换效果
	            let self = this;
	            self.lastcounty = '';
	            let cid_CName = [];//市区数组
	            let zid_ZName = [];//县城数组
	            let zid_Zid = [];
	            let pNum = Object.keys(pid_pName);//pid_pName中的键，一个数组
	            let pName = Object.values(pid_pName);//pid_pName中的值，一个数组
	            let cIdsNum = Object.keys(pid_cIds);//pid_cIds中的键，一个数组
	            let cIds = Object.values(pid_cIds);//pid_cIds中的值，一个数组
	            let cNum = Object.keys(cid_cName);//cid_cName中的键，一个数组

	            let cName = Object.values(cid_cName);//cid_cName中的值，一个数组
	            let zNum = Object.keys(zid_zName);//zid_zName中的键，一个数组
	            let zName = Object.values(zid_zName);//zid_zName中的值，一个数组
	            let zIdsNum = Object.keys(cid_zIds);//cid_zIds中的键，一个数组
	            let zIds = Object.values(cid_zIds);//cid_zIds中的值，一个数组
	            //由省转到市      
	            for(let key = 0;key < pName.length; key++){
	                if(pName[key] == picker.getValues()[0]){//picker.getValues()[0]是当前选中的省份,pName是遍历pid_pName里面的值
	                    for(let l = 0;l < cIdsNum.length; l++){
	                        if(cIdsNum[l] == pNum[key]){//pNum[key]是当前位数的键
	                            let cId = cIds[l].split(',');//把字符串转换为数组
	                            cId.splice(cId.length-1,1)//删除最后一个空元素
	                            for(let c = 0;c < cId.length; c++){
	                                cid_CName.push(cid_cName[cId[c]])
	                            }
	                            picker.setSlotValues(1, cid_CName);
	                        }
	                    }
	                }
	            };
	            //由市转到县
	            for(let k = 0;k < cName.length; k++){
	                if(cName[k] == picker.getValues()[1]){
	                    for(let e = 0;e < zIdsNum.length; e++){
	                        if(zIdsNum[e] == cNum[k]){
	                            let zId = zIds[e].split(',');
	                            zId.pop();
	                            for(let y = 0;y < zId.length; y++){
	                                zid_ZName.push(zid_zName[zId[y]])
	                                zid_Zid.push(zId[y])
	                            }
	                            picker.setSlotValues(2, zid_ZName);
	                            for(let a in zid_ZName){
	                                if(zid_ZName[a] == picker.getValues()[2]){
	                                    self.countyIds = zid_Zid[a];
	                                }
	                            }
	                        }
	                    }        
	                }  
	            }
	            let province = picker.getValues()[0];
	            let city = picker.getValues()[1];
	            let county = picker.getValues()[2];
	            self.changeAdd(province,city,county,self.countyIds)
	            for(let c in pid_pName){
	                if(pid_pName[c] == province){
	                    self.provinceId = c;
	                }
	            }
	        },
	        changeAdd(province,city,county,countyId){
	            let self = this;
	            self.city = city;
	            self.county = county;
	            self.province = province;
	            self.countyIds = countyId;
	            self.addRess = province+' '+city+' '+county;

	            self.bdDistrictId = self.countyIds;//保存到数据库的字段
	            // console.log("self.city: " + self.city);
	            // console.log("self.county: " + self.county);
	            // console.log("self.province: " + self.province);
	            // console.log("self.countyIds: " + self.countyIds);
	            // console.log("self.provinceId: " + self.provinceId);
	            // console.log("self.addRess: " + self.addRess);
	            // console.log("self.bdDistrictId: " + self.bdDistrictId);

	        }
		},
		route: {
	        data ({ from, to, next }) {
	        	var self = this;
	        	self.istrue = true;
	        	if(from.path){
                    if(from.path.indexOf('companyList')==1){
                        self.$nextTick(()=>{
                            // window.location.reload();
                        })
                    }
                }
	        	console.log(self.userAddress)
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
				// self.bdLogo = "default.png";//公司logo
				self.sheetVisible = false;//是否显示底部弹窗
				self.bdDistrictId = "1193";//地区

				self.operation = self.$route.params.operation;//参数
				if(self.operation == "add"){//新增机构
					//alert("新增机构");
					self.pageTitle = "新增机构";
					Tokens.save("clipImgOperation",self.operation)
					console.log(Tokens.fetch("companyAddClipImg"))
					let imgSrc = Tokens.fetch("companyAddClipImg");
					Tokens.save('companyAddress','');//新增机构去掉已有的地址
					if(imgSrc != ''){
						self.bdLogo = imgSrc.newURL;
					}else{
						self.bdLogo = getImgURL() + "company/default.png";
					}
				}else{//机构详情
					// alert("机构详情");
					self.companyId = self.operation;
					//得到公司数据
	        		self.getCompanyData();
				}

				self.fromPage = "";
				if(from.path && (from.path.indexOf('noOrg') != -1)){//如果noOrg页面过来的
					self.fromPage = "noOrg";
					Tokens.save('companyAddFromPath', from.path);
				}else if(from.path && (from.path.indexOf('companyList') != -1)){//companyList
					self.fromPage = "companyList";
					Tokens.save('companyAddFromPath', from.path);
				}
				console.log(Tokens.fetch("companyAddFromPath"))
				var companyImgPrefix = getImgURL() + "company/" + self.companyId;//图片路径前缀
				if(self.companyId != ""){
					self.images_zm = companyImgPrefix + "_zm.gif?" + new Date().getTime();//身份证正面照
					self.images_fm = companyImgPrefix + "_fm.gif?" + new Date().getTime();//身份证反面照

					self.pic_business = companyImgPrefix + '_business.gif?' + new Date().getTime();//营业执照
					self.pic_road = companyImgPrefix + '_road.gif?' + new Date().getTime();//道路运输许可证
					self.pic_tax = companyImgPrefix + '_tax.gif?' + new Date().getTime();//税务登记证
					self.pic_code = companyImgPrefix + '_code.gif?' + new Date().getTime();//组织机构代码证
				}

				//地址
				self.$nextTick(()=>{
                    self.addRess = self.userAddress.province+' '+self.userAddress.city+' '+self.userAddress.county;
                });
				
				//图片显示
				if(browserType == "weixin" || browserType == "android"){
	                self.isWeixinShow = true;
	            }else{
	                self.isWeixinShow = false;
	            }
	            next();
	        },
	        deactivate ({ next }) {
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
	.addressBox{
		width: 79%;
		float:left;
		padding-left:0.5rem;
		overflow:hidden;
		white-space:nowrap; 
		overflow:hidden; 
		text-overflow:ellipsis;
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

    .voucher_item{
    	height: 91px;
    	line-height: 90px;
    	padding: 0 10px 0 10px;
    	background: #fff;
    	border-bottom: 1px solid #eee;
    }
    .voucher_item .voucherName{
		float: left;
    }
    .voucher_item .voucherPic{
    	height: 90px;
    	line-height: 90px;
    	padding-top: 15px;
		float: right;
    }
    .voucher_item .voucherPic img{
    	height:60px;
    }
    /* 图片剪切 */
    .imghead{
    	display: block;
    	width:100%;height: 2.5rem;
    	background-color: #fff;
    }
    .mint-popup{
	    background: #f1f1f1;z-index: 2;
	}
	.popup_box{
		width:100%;height:100%;
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

