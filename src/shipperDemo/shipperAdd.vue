<template>
	<div class="page">
		<mt-header fixed title="选择承运人">
            <mt-button icon="back" slot="left" @click="back('/shipper')"></mt-button>
        </mt-header>
        <div class="container">
	        <div class="container-top">
	        	<div id="shipperAdd" class="shipperList" v-for='row in shipperSelect'>
		        	<div class="detail" @click.stop='saveShipper($index,row.bdId)'>
						<!--头像-->
						<div class="companyIcon">
							<img class="pic _m fl m10r" :src="imgUrl+row.bdLogo" onerror="javascript:this.src='http://tiulo-dbcon.oss-cn-hangzhou.aliyuncs.com/company/default.png'">
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
</template>

<script>
	import Tokens from '../token';
	export default {
		//数据
		data() {
			return{
				shipperSelect:[],
				defaultImg: getImgURL() + 'company/default.png',//默认图片
				imgUrl: getImgURL() + "company/"//图片地址
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
			//获取承运人选择列表
			selectAllShippers(){
				var self = this;
				var jsonData = new Object();
				jsonData = {
					action: "/company/query2",
					pageSize: 20,
					params: {
						"bdCreateUserIdHidden": Tokens.fetch("token")["userId"],
						"opType":"findCarrier"
					}
				};
				doAjaxQuery(jsonData,function(data){
					console.log(data);
					self.shipperSelect = data.dataset.rows;
//					self.$nextTick(()=>{
//                      setTimeout(function(){
//                         self.$transfer.translationDel(".detail");
//                      },1000);
//                  });
				})
			},
			//点击选择承运人
			saveShipper(index,id){
				var self = this;
				var jsonData = new Object();
				jsonData = {
					action: "/carrierOrg/save",
					//数据
					datasets: {
						dsData: {
							rows: [{
								"state": "i",//必须, 不然会报空指针异常
								"bcoOrgId1": Tokens.fetch('token')['orgId'],//站点id
								"bcoCarrierId": id//承运人id
							}]
						}
					}
				};
				doAjaxUpdate(jsonData,function(data){
					console.log(data);
                    self.go('/shipper');//跳转到机构与认证管理页面
				})
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
				self.selectAllShippers();
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





