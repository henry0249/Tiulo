<template>
	<div class="page">
		<mt-header fixed title="认证机构">
			<mt-button icon="back" slot="left" @click="back('/companyList')"></mt-button>
        </mt-header>
		<div class="container-top">
			<div class="companyItem" v-for="row in companyData" bdId="{{ row.bdId }}">
				<!-- 公司头像 -->
				<div class="companyIcon">
					<!-- bdLogo -->
					<img :src="imgUrl + row.bdLogo" onerror="javascript:this.src='http://tiulo-dbcon.oss-cn-hangzhou.aliyuncs.com/company/default.png'">
				</div>
				<!-- 公司名 -->
				<div class="companyName">
					{{ row.bdName }}
				</div>
			</div>
			<div class="checkBtn">
				<!-- 企业认证 -->
				<button @click.stop="go('/companyCheck', companyId)" type="button" class="companyCheck mint-button">企业认证</button>
				<!-- 个人认证 -->
				<button @click.stop="go('/personCheck', companyId)" type="button" class="personCheck mint-button">个人认证</button>
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
				companyId: "",//公司id
				fromPage: "",//来自哪个页面
				imgUrl: "http://tiulo-dbcon.oss-cn-hangzhou.aliyuncs.com/company/",//图片前缀
				companyData: [],//公司信息
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
						self.companyData = data.dataset.rows;//数据rows
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
	        data ({ from, to, next }) {
	        	var self = this;
	        	//from.path 获取从哪个页面过来的
	        	self.fromPage = from.path;
	        	//得到公司id
	        	self.companyId = self.$route.params.companyId;
	        	//得到公司信息(写在这里每次进页面都会加载一次)
				this.getCompanyData();
				
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
	.page{
		font-family: "微软雅黑";
	}
	.companyItem{
		width: 100%;
		height: 2.5rem;
		line-height: 2.5rem;
		background: #fff;
		padding-left: 0.5rem;
		padding-right: 0.5rem;
		margin-top: 0.75rem;
	}
	.companyItem div{
		float: left;
	}
	.companyItem .companyIcon{
		width: 1.5rem;
		height: 1.5rem;
		margin-top: 0.5rem;
	}
	.companyItem .companyIcon img{
		width: 1.5rem;
		border-radius: 50%;
	}
	.companyItem .companyName{
		max-width: 65%;
		margin-left: 0.5rem;
		font-size: 0.75rem;
		white-space:nowrap; 
		overflow:hidden; 
		text-overflow:ellipsis;
	}

	.checkBtn{
		padding: 0.5rem 0 0.5rem 0;
	}
	.checkBtn .mint-button{
		height: 2rem;
		width: 43%;
		background: #353535;
		color: #FFE91B;
		font-family: "微软雅黑";
		font-size: 0.75rem;
	}
	.checkBtn .companyCheck{
		float: left;
		margin-left: 5%;
	}
	.checkBtn .personCheck{
		float: right;
		margin-right: 5%;
	}
</style>





