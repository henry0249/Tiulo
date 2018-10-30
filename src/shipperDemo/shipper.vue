<template>
	<div class="page">
		<mt-header fixed title="承运人管理">
            <mt-button icon="back" slot="left" @click="back('')"></mt-button>
            <mt-button icon="add" slot="right">
				<span @click="goAdd()" style="color:#eee;font-size:0.8rem;" slot="icon" class="iconfont">&#xe63e;</span>
            </mt-button>
        </mt-header>
        <div class="container">
	        <div class="container-top">
	        	<div id="shipperLists">
					<div class="m10b shipperList" @click.stop="goPage(row.bcoCarrierId)"  v-for="row in shippers">
						<!-- 左滑删除 -->
						<div class="left_slider" @click.stop="delShipper($index, row.bcoId)">删除</div>
						<div class="detail">
							<!--头像-->
							<div class="companyIcon">
								<img class="pic _m fl m10r" :src="imgUrl+row.bcoLogo" onerror="javascript:this.src='http://tiulo-dbcon.oss-cn-hangzhou.aliyuncs.com/company/default.png'">
							</div>
							<!--名称-->
							<div class="companyName">
								{{row.bdName}}
							</div>
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
				shippers: [],//请求返回的数据
				defaultImg: getImgURL() + 'company/default.png',//默认图片
				subSystem: "",//版本
				imgUrl: getImgURL() + "company/",//图片地址
				orgNum: new Number(),//机构数量
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
			//获取所有承运人信息
			getAllShippers(){
				var self = this;
				var jsonData = new Object();
				jsonData={
					action: "/carrierOrg/query",
					pageSize: 20,
					params: {
						"bcoOrgId1": Tokens.fetch("token")["orgId"]
					}
				}
				doAjaxQuery(jsonData,function(data){
					console.log(data);
					self.shippers = data.dataset.rows;
					self.$nextTick(()=>{
                        setTimeout(function(){
                           self.$transfer.translationDel(".detail");
                        },1000);
                    });
				})
				
			},
			//删除
			delShipper(index,id){
				var self = this;
				event.stopPropagation();//阻止事件冒泡
				self.$MessageBox.confirm('确认删除承运人信息？').then(action=>{ //点击‘确认’执行的代码
					var jsonData = new Object();
					jsonData={
						action: "/carrierOrg/del/" + id,
						params: {
							"bcoOrgId1": Tokens.fetch("token")["orgId"]
						}
					};
					doAjaxUpdate(jsonData,function(data){
						if(data.status == 1){
							self.getAllShippers();
						}
					})
				})
				
			},
			//添加
			goAdd(){
				let self = this;
				self.go('/shipperAdd');
			},
			//详情
			goPage(shipperId){
				var self = this;
				
				self.go('/shipperEntry',shipperId);
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
	        	
	        	//获取所有公司(每次进页面都查询一次)
				self.getAllShippers();
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
	.page{
		font-family: '微软雅黑';
	}
	#shipperLists{
		margin-top: 0.75rem;
	}
	.shipperList{
		width: 100%;
		height: 2.5rem;
		line-height: 2.5rem;
		background: #fff;
		padding-left: 0.5rem;
		padding-right: 0.5rem;
		margin-top: 0.05rem;
	}
	.shipperList .left_slider{
        width: 5rem;
        height: 2.5rem;
        line-height: 2.5rem;
        text-align: center;
        background: #DD524D;
        color: #fff;
        position: absolute;
        right: 0.05rem;
    }
    .shipperList .detail{
        width: 100%;
        padding-left: 0.5rem;
		padding-right: 0.5rem;
        position: absolute;
        left: 0;
        background: #fff;
    }
	.shipperList div{
		float: left;
	}
	.shipperList .companyIcon{
		width: 1.5rem;
		height: 1.5rem;
		margin-top: 0.5rem;
	}
	.shipperList .companyIcon img{
		width: 1.5rem;
		border-radius: 50%;
	}
	.shipperList .companyName{
		max-width: 65%;
		margin-left: 0.5rem;
		font-size: 0.75rem;
		white-space:nowrap; 
		overflow:hidden; 
		text-overflow:ellipsis;
	}
	.shipperList .isCertification{
		height:2.5rem;
		float: right;
	}
	.shipperList .isCertification img{
		width: 1.5rem;
		margin-top: 0.65rem;
	}
	.shipperList .isCertification span{
		height: 1rem;
		border: 1px solid #ccc;
		padding: 0.2rem 0.4rem 0.2rem 0.4rem;
		border-radius: 0.15rem;
		font-size: 0.65rem;
		color: #FD6053;
	}
	.shipperList .isCertification .cancelCertification{
		height: 1rem;
		border: 1px solid #353535;
		background: #353535;
		padding: 0.2rem 0.4rem 0.2rem 0.4rem;
		border-radius: 0.15rem;
		font-size: 0.65rem;
		color: #FFD91E;
	}

</style>





