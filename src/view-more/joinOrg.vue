<template>
	<div class="page">
		<mt-header fixed title="加入机构">
            <mt-button icon="back" slot="left" @click="back('/noOrg')"></mt-button>
        </mt-header>
        <div class="container-search" id="searchBox"> 
            <mysearch
              :value.sync="searchVal"
              placeholder="请输入关键字查询">
            </mysearch>
        </div>
        <div class="container-top">
	        <div class="companyList" style="margin-top:2.8rem">
	        	<div class="item" v-for="row in orgsArr">
		        	<div class="company">
		        		<div class="companyLogo">
		        			<img :src="row.companyLogo" onerror="javascript:this.src='http://tiulo.oss-cn-hangzhou.aliyuncs.com/company/default.png'">
		        		</div>
						<div class="companyName">
							<span class="lf">{{ row.companyName }}</span>
							<span class="rg">{{ row.subSystem2 }}</span>
						</div>
						<div class="certification" v-if="row.companyStatus=='y'">
							<img src="../img/register.png">
						</div>
			        </div>
			        <!-- 默认站点 -->
				    <div class="org" v-if="row.mrorg.length!=0" @click="joinOrg(row.mrorg[0])">
				    	<div class="dot"></div>
			        	<div class="orgName">
			        		<span class="lf">{{ row.mrorg[0].bdName }}</span>
			        		<span class="rg">{{row.mrorg[0].bdSubSystem2}}</span>
			        	</div>
			        </div>
			        <!-- 普通站点 -->
			        <div class="org" v-for="org in row.orgs" @click="joinOrg(org)">
				    	<div class="dot"></div>
			        	<div class="orgName">
			        		<span class="lf">{{ org.bdName }}</span>
			        		<span class="rg">{{ org.bdSubSystem2 }}</span>
			        	</div>
			        </div>
		        </div>
	        </div>
		</div>
	</div>
</template>

<script>
	import Tokens from '../token';
	import Mysearch  from '../components/mysearch';
	export default {
		components: {
	        Mysearch
	    },
		//数据
		data() {
			return{
				searchVal: "",//查询的value
				timer: false,//是否执行搜索的定时器
				beforeScrollTop: 0,//存储页面当前scrollTop

            	orgsArr: [],//处理后的数据
            	OrgChange:'',
            	// noOrgVersion:'',
			}
		},
		//内容改变时调用
		watch: {
			//搜索内容改变执行此方法
	        'searchVal': function(){
	            let self = this;
	            //设置延迟执行
	            if(!self.timer){
	                self.timer = true;
	                setTimeout(function(){
	                	self.orgsArr = [];
	                    self.$Indicator.open();
	                    //查询方法
						self.getOrgs();
	                    self.timer = false;
	                }, 500);
	            }
	        }
		},
		ready() {
			let self = this;

			//列表滚动时搜索框的显示和隐藏
	        searchBoxIsShow('.container-top','#searchBox',self.beforeScrollTop,function(top){
	            self.beforeScrollTop = top;
	        });
		},
		//方法
		methods: {
			//加入机构
			joinOrg: function(row){
				let self = this;
				self.$MessageBox.confirm('您确定申请加入"'+ row.bdName +'"吗？').then(action => {
					let jsonData = {
						action: "/cmsTiulo/save",
						params: {
							applyJoinOrg: "1",
							home_selectSystem: Tokens.fetch('token')['subSystem']
						},
						//数据
						datasets: {
							dsData: {
								rows: [{
									tiuloTitle: Tokens.fetch('token')['userName'] + " 申请加入 " + row.bdName,
									tiuloBillId: row.bdId,
									state: "i",
								}]
							}
						},
					};
					doAjaxUpdate(jsonData, function(data){
						//console.log(JSON.stringify(data, null, 4));
						if(data.status == "1"){//如果执行成功
							self.$transfer.showToast(self, "请求已发送, 待对方同意后重新登录即可使用相关功能", "center", 5000);
							setTimeout(function(){
								self.go('/noOrg');
							}, 5000);
						}
					});
				});
			},
			getOrgs(){
				let self = this;
				let jsonData;
				if(self.OrgChange.indexOf('changeVersion') == 1){
					let noOrgVersion = Tokens.fetch("noOrgVersion");
					jsonData = {
						action: "/dealer/query",
						params: {
							bdSubSystem2:noOrgVersion,
						},
					};
				}else{
					jsonData = {
						action: "/org/query",
						params: {
							hideOrg: "*",
							webType: "fd",
							findString: self.searchVal
						},
					};
				}
				doAjaxQuery(jsonData, function(data){
					if(data.status == 1){//执行成功
						console.log(data)
						let rows = data.dataset.rows;
						if(rows && rows.length > 0){
							let companyId = "";//公司id
							let companyLogo = "";//公司logo
							let companyName = "";//公司名字
							let companyStatus = "";//是否认证
							let companyIdsArr = [];//公司id数组, 用于判断是否已经存在
							let subSystem2 = "";//版本
							rows.forEach(function(item, index){
								companyId = item.bdParent;
								if(companyIdsArr.indexOf(companyId) == -1){//不存在于数组中
									companyIdsArr.push(companyId);
									companyLogo = getImgURL() + "company/" + item.bdLogo;
									let ImgObj = new Image(); 
		                            ImgObj.src = companyLogo; 
		                            ImgObj.onerror = function(){
		                                companyLogo = getImgURL() + 'company/default.png';
		                            }
									companyName = item.bdCompanyName;
									companyStatus = item.bdCompanyStatus;
									subSystem2 = item.bdSubSystem2;
									let obj = new Object();//创建一个对象
									obj.companyId = companyId;
									obj.companyName = companyName;
									obj.companyLogo = companyLogo;
									obj.companyStatus = companyStatus;
									obj.subSystem2 = subSystem2;
									obj.orgs = [];//普通站点
									obj.mrorg = [];//默认站点
									if(item.bdId == item.bdParent+"MR"){//如果是默认站点
										obj.mrorg.push(item);
									}else{//如果不是默认站点
										obj.orgs.push(item);
									}
									self.orgsArr.push(obj);
								}else{//存在于数组中
									console.log(222)
									//找到对应的对象
									self.orgsArr.forEach(function(row, index){
										if(row.companyId == companyId){
											if(item.bdId == item.bdParent+"MR"){//如果是默认站点
												row.mrorg.push(item);
											}else{//如果不是默认站点
												row.orgs.push(item);
											}
										}
									});
								}
							});
							console.log(self.orgsArr)
							self.$Indicator.close();
							//console.log(JSON.stringify(self.orgsArr, null, 4));//处理好的数据
						}
					}else if(data.status == 0){
						console.log(11111)
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
			//方法在这里执行, 每次打开页面都会执行一次
	        data ({ from, to, next }) {
	        	let self = this;
	        	self.orgsArr = [];
	        	self.OrgChange = Tokens.fetch('registerPathWay');
	        	self.getOrgs();

	            next();
	        },
	        deactivate ({ next }) {
	        	let self = this;

	        	//隐藏搜索框时 退出页面再进 会导致进入之后看不到搜索框的问题
                $("#searchBox").slideDown();

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
	.lf{float:left;}
	.rg{float:right;}
	.container-top{
		padding-bottom: 2.5rem;
	}
	.item{
		padding: 0 0.5rem 0.05rem 0.5rem;
		background: #fff;
	}
	.company{
		height: 2.55rem;
		border-bottom: 0.05rem solid #eee;
		width:100%;
	}
	.company .companyLogo img{
		margin-top: 0.25rem;
		height: 2rem;
		border-radius: 50%;
	}
	.companyLogo{
		float: left;
		margin-right: 0.5rem;
		width:15%;
	}
	.companyName{
		width:75%;
		line-height: 2.5rem;
		float: left;
	}
	.certification{
		float: right;
	}
	.certification img{
		margin-top: 0.5rem;
		height: 1.5rem;
	}
	.org{
		height: 1.55rem;
		line-height: 1.5rem;
		padding-left: 2.5rem;
	}
	.dot{
		height: 0.5rem;
		width: 0.5rem;
		float: left;
		margin-top: 0.5rem;
		margin-right: 0.5rem;
		border-radius: 50%;
		background: #FFD91E;
	}
	.orgName{
		border-bottom: 0.05rem solid #eee;
		overflow: hidden;
    	padding-right: 1.2rem;
	}
</style>


