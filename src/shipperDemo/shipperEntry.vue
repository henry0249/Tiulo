<template>
	<div class="page">
		<mt-header fixed title="承运人详情">
            <mt-button icon="back" slot="left" @click="back('/shipper')"></mt-button>
        </mt-header>
        <div class="container">
	        <div class="container-top">
	        	<div id="shipperLists">
					<div class="m10b shipperList">
						<div class="detail">
							<!--名称-->
							<div class="companyName">
								承运人：{{shipperName}}
							</div>
							<div class="companyName">
								详细地址：{{shipperAddress}}
							</div>
							<div class="companyName">
								联系方式：{{shipperTel}}
							</div>
							<div class="price">合约价格</div>
							<div class="companyName">
								始发地：{{faStartDistrictName}}
							</div>
							<div class="companyName">
								目的地：{{faEndDistrictName}}
							</div>
							<div class="companyName">
								发货人：{{faOwnerName}}
							</div>
							<div class="companyName">
								货物名称：{{faMaterialName}}
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
				shipperName: "",//承运人
				shipperAddress:"",//详细地址
				shipperTel:"",//联系方式
				faStartDistrictName:"",//始发地
				faEndDistrictName:"",
				faOwnerName:"",
				faMaterialName:""
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
			//获取承运人详情
			getShipperEntry(){
				var self = this;
				var jsonData = new Object();
				jsonData={
					action: "/carrierOrg/query",
					pageSize: 20,
					params: {
						"bcoCarrierId": self.$route.params.shipperId, //承运人id
						"bcoOrgId1":Tokens.fetch("token")["orgId"]//站点id
					}
				}
				doAjaxQuery(jsonData,function(data){
					console.log(data);
					self.shipperName = data.dataset.rows[0].bdName;
					self.shipperAddress = data.dataset.rows[0].bdAddress;
					self.shipperTel = data.dataset.rows[0].bdContactTel;
				})
				
			},
			//获取价格信息
			getShipperPrice(){
				var self = this;
				var jsonData = new Object();
				jsonData={
					action: "/finAgreement/query",
					pageSize: 20,
					params: {
						"faCarrierId": self.$route.params.shipperId, //承运人id
						"faOrgId":Tokens.fetch("token")["orgId"]//站点id
					}
				}
				doAjaxQuery(jsonData,function(data){
					console.log(data);
					self.faStartDistrictName = data.dataset.rows[0].faStartDistrictName;
					self.faEndDistrictName = data.dataset.rows[0].faEndDistrictName;
					self.faOwnerName = data.dataset.rows[0].faOwnerName;
					self.faMaterialName = data.dataset.rows[0].faMaterialName;
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
				self.getShipperEntry();
				self.getShipperPrice();
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
	/*.shipperList div{
		float: left;
	}*/
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
	.price{
		font-size: 1rem;
		font-weight: bold;
		text-align: center;
	}
</style>





