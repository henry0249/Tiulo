<template>
	<div class="page">
		<mt-header fixed title="公告详情">
            <mt-button icon="back" slot="left" @click="back('/noticeList')"></mt-button>
        </mt-header>
        <div class="container-top">
        	<div class="sponsor item">
        		<p class="titleWidth">发起人:</p>
        		<img :src="sponsorLogo">
        		<span>{{ noticeDetails.cinfCreateUser }}</span>
        	</div>
        	<!-- 主题, 时间, 接收者 -->
        	<div style="margin-bottom: 0.5rem;">
        		<div class="subject item">
	        		<p class="titleWidth">主&nbsp;&nbsp;&nbsp;题:</p>
	        		<span>{{ noticeDetails.cinfTitle }}</span>
	        	</div>
	        	<div class="time item">
	        		<p class="titleWidth">时&nbsp;&nbsp;&nbsp;间:</p>
	        		<span>{{ noticeDetails.cinfCreateDate }}</span>
	        	</div>
	        	<div class="receiver">
	        		<p class="titleWidth">接收者:</p>
	        		<div class="personList">
		        		<div class="person" v-for="receiver in receivers" @click.stop="goUserDetail(receiver.recvId)">
		        			<img :src="receiver.recvLogo" onerror="javascript:this.src='http://tiulo-dbtest.oss-cn-hangzhou.aliyuncs.com/user/default.png'">
		        			<span>{{ receiver.recvName }}</span>
		        		</div>
	        		</div>
		        </div>
        	</div>
        	<!-- 内容和图片 -->
        	<div style="float:left;width:100%;">
        		<!-- v-if="noticeDetails.cinfText!=''" -->
        		<div class="content" v-if="noticeDetails.cinfText!=''">
        			<p>{{ noticeDetails.cinfText }}</p>
        		</div>
        		<!-- v-if="images.length!=0" -->
        		<div class="images" v-if="images.length!=0">
	        		<div class="imgList">
	        			<div class="image" v-for="image in images">
	        				<img :src="image" @click.stop="previewImg(image)">
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
				sponsorLogo: "",//发起人头像
				cinfId: "",//公告id
				noticeDetails: {},//公告详情
				receivers: [],//接收者
				cinfSendUserId: "",//发起人
				images: [],//图片
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

			//微信预览图片
			previewImg: function(currUrl){
				var self = this;
				//图片预览
				weChatPreviewImg(currUrl, self.images);
			},
			//进入接收者详情页
			goUserDetail: function(recvId){
				var self = this;
				var jsonData = {
					action: "/cmsMyFriends/query",
					params: {
						//"cmfUserId1": self.sponsorId,//self.cinfSendUserId
						"cmfUserId1": self.cinfSendUserId,
						"cmfUserId2": recvId
					}
				};
				doAjaxQuery(jsonData, function(data){
					//console.log(JSON.stringify(data, null, 4));
					if(data.status == 1){
						if(data.dataset.rows.length != 0){
							Tokens.save('friendDetail', data.dataset.rows[0]);
						}else{
							var obj = new Object();
							obj.suId = recvId;
							obj.isFriend = false;//不是好友, 不显示组名
							Tokens.save('friendDetail', obj);
						}
						self.go('/friend_detail');//好友详情页
					}
				});
			},
			//得到公告详情数据
			getNoticeDetails: function(){
				var self = this;
				var jsonData = {
					action: "/cmsInfo/query",
					//"{"cinfId":"170214173549112S0569R950","cinfRecvUserIds_Names":"1"}"
					params: {
						cinfId: self.cinfId,
						cinfRecvUserIds_Names: "1"
					},
				};
				doAjaxQuery(jsonData, function(data){
					//console.log(JSON.stringify(data, null, 4));
					if(data.status == 1){//执行成功
						//发起人头像
						self.sponsorLogo = getImgURL() + "user/" + data.dataset.rows[0].cinfSendUserLogo;

						//公告图片
						if(data.dataset.rows[0].cinfPic != undefined && data.dataset.rows[0].cinfPic != ""){
							self.images = data.dataset.rows[0].cinfPic.split(",");
							self.images.splice(self.images.length-1, 1);//去掉数组中最后一个元素(最后一个元素为空字符串)
							for(var i = 0; i < self.images.length; i++){//给图片加上前缀
								self.images[i] = getImgURL() + "notice/" + self.images[i].substring(0, self.images[i].length-4) + "_big.gif";
							}
						}
						//console.log(self.images);

						var obj = data.dataset.rows;
						obj.forEach(function(item, index){
							item.cinfCreateDate = item.cinfCreateDate.substring(0, 16);
						});
						var recvNames = obj[0].recvNames.split(",");//接收者姓名数组
						var recvLogos = obj[0].recvLogos.split(",");//接收者头像数组
						var recvIds = obj[0].recvIds.split(",");//接收者ids
						recvNames.forEach(function(item, index){
							var receiver = new Object();
							receiver.recvName = recvNames[index];
							receiver.recvLogo = getImgURL() + "user/" + recvLogos[index];
							receiver.recvId = recvIds[index];
							self.receivers.push(receiver);
						});
						//console.log("receivers: " + JSON.stringify(self.receivers, null, 4));
						//console.log(JSON.stringify(obj[0], null, 4));
						self.cinfSendUserId = obj[0].cinfSendUserId;
						self.noticeDetails = obj[0];
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
	            self.$transfer.back(self, link, param);
	        }
		},
		route: {
			//如果方法在这里执行, 每次打开页面都会执行一次
	        data ({ from, to, next }) {
	        	var self = this;
	        	//进入页面时token不存在
	            if(!localStorage.getItem("token")){
	                self.$transfer.backLogin(self, {info:'token没有值'});
	                return;
	            }
	            //不是个人详情页过来的就不用再请求一次, 详情页刷新要再请求一次
	            if(from.path == undefined || from.path.indexOf('friend_detail') == -1 || isEmptyObject(self.noticeDetails)){
            		self.noticeDetails = {};
		        	self.receivers = [];
		        	self.images = [];
		        	self.cinfId = self.$route.params.cinfId;//参数
	        		self.getNoticeDetails();
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
	.titleWidth{
		width: 2.5rem;
		float: left;
	}
	.item{
		height: 2.5rem;
		line-height: 2.5rem;
		background: #fff;
		padding: 0 0.5rem 0 0.5rem;
	}
	.sponsor{
		margin-bottom: 0.5rem;
	}
	.sponsor img{
		height: 2rem;
		width: 2rem;
		margin-top: 0.25rem;
		border-radius: 0.25rem;
		float: left;
	}
	.sponsor span{
		display: block;
		margin-left: 0.25rem;
		float: left;
	}
	.subject{
		margin-bottom: 0.05rem;
	}
	.time{
		margin-bottom: 0.05rem;
	}
	.receiver{
		min-height: 4rem;
		background: #fff;
		position: relative;
	}
	.receiver > p{
		width: 2.5rem;
		margin-left: 0.5rem;
		line-height: 3rem;
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
		padding-left: 3rem;
		float: left;
		background: #fff;
		margin-bottom: 0.5rem;
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
	.content{
		min-height: 1.25rem;
		line-height: 1.25rem;
		background: #fff;
		padding: 0 0.5rem 0 0.5rem;
		margin-bottom: 0.05rem;
	}
	.images{
		min-height: 3rem;
		line-height: 3rem;
		background: #fff;
		margin-bottom: 2.5rem;
	}
	.imgList .image{
		float: left;
		position: relative;
	}
	.imgList{
		min-height: 3rem;
		float: left;
		background: #fff;
		padding: 0 0.5rem 0.3rem 0.5rem;
	}
	.imgList .image img{
		height: 2.4rem;
		width: 2.4rem;
		margin-right: 0.5rem;
		margin-top: 0.3rem;
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
</style>

