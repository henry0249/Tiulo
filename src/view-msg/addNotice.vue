<template>
	<div class="page">
		<mt-header fixed title="公告发起">
            <mt-button icon="back" slot="left" @click="back('/noticeList')"></mt-button>
            <mt-button slot="right" @click="save()">保存</mt-button>
        </mt-header>
        <div class="container-top">
        	<div class="sponsor">
        		<p class="titleWidth">发起人</p>
        		<div class="person">
        			<img :src="sponsorLogo" onerror="javascript:this.src='http://tiulo-dbcon.oss-cn-hangzhou.aliyuncs.com/user/default.png'">
        			<span>{{ sponsorName }}</span>
        		</div>
        	</div>
        	<div class="subject">
        		<p class="titleWidth">主&nbsp;&nbsp;&nbsp;题</p>
        		<input type="text" name="" v-model="subject" placeholder="请输入主题">
        	</div>
        	<div class="receiver">
        		<p>接收者</p>
        		<div class="personList">
	        		<div class="person" v-for="item in receivers">
	        			<img :src="item.suLogo">
	        			<span>{{ item.suName }}</span>
	        			<p class="iconfont deleteButton" slot="icon" @click.stop="deleteReceiver($index)">&#xe6cf;</p>
	        		</div>
					<div class="addReceiver">
		    			<!-- <span @click="addReceiver()" style="font-size:2.5rem;" slot="icon" class="iconfont">&#xe6ea;</span> -->
		    			<img src="../img/add.png" @click="addReceiver()">
		    		</div>
        		</div>
        	</div>
        	<div class="cotentAndImgs">
        		<div class="content">
					<textarea v-model="content" placeholder="根据这几天的观察和了解，我发现..."></textarea>
	        	</div>
	        	<div class="images">
	        		<p>图&nbsp;&nbsp;&nbsp;片</p>
	        		<div class="imgList">
	        			<div class="image" v-for="image in images">
	        				<!-- http://tiulo-dbcon.oss-cn-hangzhou.aliyuncs.com/user/00094_170207160333694S0760R307_head.gif -->
	        				<img :src="image" @click.stop="showBigPic(image)">
	        				<p class="iconfont deleteImage" slot="icon" @click.stop="deleteImage($index)">&#xe6cf;</p>
	        			</div>
	        			<div class="addImgs" @click.stop="addImage()">
	        				<img src="../img/camera_off.png">
	        			</div>
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
				subSystem: Tokens.fetch('token')['subSystem'],
				sponsorId: Tokens.fetch('token')['userId'],//发起人userId
				sponsorName: Tokens.fetch('token')['userName'],//发起人姓名
				sponsorLogo: getImgURL() + "user/" + Tokens.fetch('token')['userLogo'],//发起人头像
				subject: "",//主题
				receivers: [],//接收者
				content: "",//内容
				images: [],//图片
                
                browserType: '', //Android或者微信判断
			}
		},
		created(){
			var self = this;

		},
		//打开网页执行的方法(只执行一次)
		ready() {
			var self = this;
			

		},
		//内容改变时调用
		watch: {
			
		},
		//方法
		methods: {
			//预览图片
			showBigPic: function(currUrl){
				var self = this;
				//图片预览
				weChatPreviewImg(currUrl, self.images);
			},
			//删除图片
			deleteImage: function(index){
				var self = this;
				//这是删除的只是数组中的图片, 并不是微信服务器上的图片
				self.images.splice(index, 1);
			},
			//添加图片
			addImage: function(){
				var self = this;
				//微信选择图片 加入原生几个BrowserType的判断。
			//	weChatChooseImage(function(localids){
			//		self.images = self.images.concat(localids);
			//	});

          	if(browserType == "android") {
					alertShow("选择图片");
					window.Photo.selectPictures();
					self.$nextTick(() => {
						setTimeout(function() {
							/* alertShow("定时延迟1秒执行"); */
							var str = window.Photo.getPics();
							/*alert(str);*/
						}, 100)
					})
				} else {
					weChatChooseImage(function(localids){
					self.images = self.images.concat(localids);
				});
					
				}

			},
			//删除接收者
			deleteReceiver: function(index){
				var self = this;
				self.receivers.splice(index, 1);
				//console.log(JSON.stringify(self.receivers, null, 4));
			},
			//添加接收者
			addReceiver: function(){
				var self = this;
				var hiddenUserIds = [];//需要隐藏的好友的id
				for(var i = 0; i < self.receivers.length; i++){
					hiddenUserIds.push(self.receivers[i].suId);
				}
				var params = {
					cmfUserId1: self.sponsorId,
					cmfSubSystem: self.subSystem,
					hidden_userIds: hiddenUserIds.join(","),
					isFilterAdd: "true",
					include_notFriends: ""
				};
				Tokens.save("addExUserParams", params);
				self.go("/add_member", "选择接收者");

			},
			//保存
			save: function(){
				var self = this;
				//如果没有接收者则不能提交
				if(self.receivers.length == 0){
					self.$transfer.showToast(self, "至少有一名接收者","center", "3000");
					return;
				}

				var receiverIds = [];//接收者的id数组
				self.receivers.forEach(function(item, index){
					receiverIds.push(item.suId);
				});
				
				var jsonData = {
					action: "/cmsInfo/save",
					params: {
						"cinfType1" : "GG",
						"noticeFind" : self.sponsorId,//自己发送的公告
						"tiuloMsgStatus" : "1",//标记告知后台查询本公告是否未读，有值表示已读
					},
					datasets: {
						dsData: {
							rows: [{
								"id" : "",
    							"cinfModifyDate" : "",
								"cinfType1": "GG",
								"cinfTitle": self.subject,//主题
								"cinfText": self.content,//内容
								"cinfSendUserId": self.sponsorId,//发起人id
								"cinfRecvUserIds": receiverIds.join(","),//接收者id
								"state": "i",//修改状态为新增(必须, 不然会报空指针异常)
							}]
						}
					},
				};
				doAjaxUpdate(jsonData, function(data){
					//console.log(JSON.stringify(data, null, 4));
					if(data.status == 1){//执行成功
						if(self.images.length > 0){//
							self.$Indicator.open();//打开进度条
							var cinfId = data.datasets.dsData.rows[0].cinfId;
							//将图片上传到微信服务器
							weChatUploadImg(self.images,function(result){
								var _data = {//数据
	                               media_ids_arr: result.join("@"),
	                               mode : "notice",
	                               id : cinfId,//公告id
	                               type : "*"
	                            };
	                            //上传图片
	                            doWxAjaxUpload(_data,function(data){
	                            	if(data.status == 1){//执行成功
	                            		self.$Indicator.close();
	                            		self.$transfer.showToast(self, "公告发起成功","center", "1500");
										setTimeout(function(){
											self.go("/noticeList");
										}, 1500);
	                            	}else{
	                            		self.$Indicator.close();
	                            		self.$transfer.showToast(self, "图片上传失败","center", "1500");
	                            		setTimeout(function(){
											self.go("/noticeList");
										}, 1500);
	                            	}
	                            });
							});
						}else{
							self.$transfer.showToast(self, "公告发起成功","center", "1500");
							setTimeout(function(){
								self.go("/noticeList");
							}, 1500);
						}
					}else if(data.status == 0){//执行失败
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
	            self.$transfer.back(self, link, param);
	        }
		},
		route: {
			//如果方法在这里执行, 每次打开页面都会执行一次
	        data ({ from, to, next }) {
	        	var self = this;

	        	self.browserType = browserType;
	        	//进入页面时token不存在
	            if(!localStorage.getItem("token")){
	                self.$transfer.backLogin(self, {info:'token没有值'});
	                return;
	            }

	            //选择成员回来
	            if(from.path && from.path.indexOf('add_member') != -1){
	            	var userList = Tokens.fetch("exUserAddList");
	            	if(userList.length > 0){
	            		self.receivers = self.receivers.concat(userList);
	            	}
	            	//console.log(JSON.stringify(self.receivers, null, 4));
	            }else{
	            	self.subject = "";
					self.receivers = [];
					self.content = "";
					self.images = [];
	            }
	        	
	            next();
	        },
	        deactivate ({ next }) {
	        	var self = this;

	            next();
	        },
	        canDeactivate ({ next, to, abort }) {
	            var self = this;
	            
	            next();
	        }
	    }

	}

</script>

<style scoped>
	.person{
		width: 2.65rem;
		height: 3.3rem;
		text-align: center;
		margin-top: 0.35rem;
		margin-right: 0.25rem;
		position: relative;
		float: left;
	}
	.person img{
		width: 2.25rem;
		height: 2.25rem;
		border-radius: 0.25rem;
		margin-left: 0.2rem;
		float: left;
	}
	.person span{
		width: 2.65rem;
		height: 1rem;
		line-height: 1rem;
		display: block;
		font-size: 0.65rem;
		text-align: center;
		float: left;
		white-space:nowrap; 
		overflow:hidden; 
		text-overflow:ellipsis;
	}
	.titleWidth{
		width: 2.5rem;
		float: left;
	}
	.sponsor{
		height: 4rem;
		line-height: 4rem;
		background: #fff;
		margin-bottom: 0.5rem;
		padding: 0 0.25rem 0 0.25rem;
	}
	.subject{
		height: 2.5rem;
		line-height: 2.5rem;
		background: #fff;
		margin-bottom: 0.5rem;
		padding: 0 0.25rem 0 0.25rem;
	}
	.subject input{
		width: 78%;
		border: 0.05rem solid #e5e6e7;
		border-radius: 0.15rem;
		font-family: '微软雅黑';
	}
	.receiver{
		min-height: 4rem;
		background: #fff;
		position: relative;
	}
	.receiver > p{
		width: 2.5rem;
		margin-left: 0.25rem;
		line-height: 2.5rem;
		float: left;
		position: absolute;
	}
	.deleteButton{
		font-size: 0.8rem;
	    color: #f00;
	    display: block;
	    position: absolute;
	    right: -0.2rem;
	    top: -0.6rem;
	}
	.personList{
		min-height: 4rem;
		padding-left: 2.5rem;
		float: left;
		background: #fff;
	}
	.addReceiver{
		height: 4rem;
		float: left;
		line-height: 3.25rem;
	}
	.addReceiver span{
		color: #777;
		display: inline-block;
	}
	.addReceiver img{
		height: 2.25rem;
		margin-top: 0.35rem;
	}
	.cotentAndImgs{
		width: 100%;
		float: left;
	}
	.content{
		height: 4rem;
		line-height: 4rem;
		background: #fff;
		margin-bottom: 0.05rem;
		margin-top: 0.5rem;
		padding: 0 1rem 0 0.5rem;
	}
	.content textarea{
		width: 100%;
		height: 2.75rem;
		padding: 0.25rem;
		margin-top: 0.35rem;
		border: 0.05rem solid #e5e6e7;
		border-radius: 0.15rem;
		font-family: '微软雅黑';
	}
	.images{
		min-height: 3rem;
		line-height: 3rem;
		background: #fff;
		margin-bottom: 2.5rem;
	}
	.images>p{
		width: 2.5rem;
		margin-left: 0.25rem;
		line-height: 3rem;
		float: left;
		position: absolute;
	}
	.imgList .image{
		float: left;
		position: relative;
	}
	.imgList{
		min-height: 3rem;
		padding-left: 2.5rem;
		float: left;
		background: #fff;
		padding-bottom: 0.3rem;
	}
	.imgList .image img{
		height: 2.4rem;
		width: 2.4rem;
		margin-right: 0.5rem;
		margin-top: 0.3rem;
		background: red;
		float: left;
	}
	.deleteImage{
		height: 0;
		width: 0;
		font-size: 0.8rem;
	    color: #f00;
	    position: absolute;
	    right: 1rem;
	    top: -1.1rem;
	    background: #ccc;
	}
	.addImgs{
		width: 2.4rem;
		height: 2.4rem;
		float: left;
		margin-top: 0.3rem;
	}
	.addImgs img{
		width: 2.4rem;
		height: 2.4rem;
	}
</style>











