<template>
	<div class="page">
		<mt-header fixed title="机构与认证管理">
			<mt-button icon="back" slot="left" @click="back('/more')"></mt-button>
            <mt-button icon="add" slot="right">
				<span @click="newOrg()" style="color:#eee;font-size:0.8rem;" slot="icon" class="iconfont">&#xe63e;</span>
            </mt-button>
        </mt-header>
		<div class="container-top">
			<mypulldown style="margin-top:0rem">
	        	<div slot= "pullList" :style = "{minHeight:listViewH + 'px'}">
					<!-- 公司 -->
					<div class="companyItems">
						<!-- companyDetails -->
						<div @click="goPage($index,'details', row.bdId)" class="companyItem" v-for="row in allCompany" bdId="{{ row.bdId }}">
							<!-- 左滑删除 -->
							<div class="left_slider" @click.stop="delCompany($index, row.bdId)">删除</div>
							<div class="left_lateral">
								<!-- 公司头像 -->
								<div class="companyIcon">
									<!-- bdLogo -->
									<img :src="imgUrl+row.bdLogo" alt="" onerror="javascript:this.src='defaultImg'">
								</div>
								<!-- 公司名 -->
								<div class="companyName">
									{{ row.bdName }}
								</div>
								<!-- 是否认证 -->
								<!-- bdStatus2: 认证状态(0/初始 1已提交  y审核通过  n不通过) -->
								<div class="isCertification">
									<!-- 已认证成功 -->
									<img v-if="row.bdStatus2=='y'" src="../img/register.png" alt="">
									<!-- 去认证 -->
									<span @click.stop="go('/orgCheck', row.bdId)" v-if="row.bdStatus2=='0'" style="margin-bottom:1.5rem;">去认证</span>
									<!-- 撤销认证 -->
									<span @click.stop="cancelCertification(row)" class="cancelCertification" v-if="row.bdStatus2=='1'" style="margin-bottom:1.5rem;">撤销认证</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</mypulldown>
		</div>
	</div>
</template>

<script>
	import Tokens from '../token';
	import  Mypulldown from '../components/mypulldown'//引入下拉刷新的组件
	export default {
		components: {
	        Mypulldown
	    },
		//数据
		data() {
			return{
				allCompany: [],//请求返回的数据
				defaultImg: getImgURL() + 'company/default.png',//默认图片
				subSystem: "",//版本
				imgUrl: getImgURL() + "company/",//图片地址

				listViewH: 0,//下拉刷新框的最小高度
				isLoadId: null,//用来存储下拉刷新时带过来的id,初始设置为null,在数据加载完成后清除加载指示时

				orgNum: new Number(),//机构数量
			}
		},
		//打开网页执行的方法
		ready() {
			var self = this;
			//列表框的最小高度
	        self.$nextTick(()=>{
	            self.listViewH = $(".container-top").height() - 10;
	        });
		},
		events: {
			refreshList(id){//下拉刷新时重置列表数据
	            let self = this;
	            self.isLoadId = id;
	            setTimeout(() => {
	                self.getAllCompany();//获取列表数据
	            }, 1000);
	        },
		},
		//内容改变时调用
		watch: {

		},
		//方法
		methods: {
			goPage(index,type, id){
				let self = this;
				//列表若有点击跳转事件，在下拉时阻止点击跳转
	            if(isXLorClick()){
	                return;
	            }
				//console.log(self.allCompany[index].bdDistrictId)
				let address = self.allCompany[index].bdDistrictId;
				Tokens.save('companyAddress',address)
				if(type == "details"){
					Tokens.save("companyType", "details");
					self.go('/companyAdd', id);
				}
			},
			goAdd(type){//添加
				let self = this;
				Tokens.save("companyType", "add");
				self.go('/companyAdd', 'add');
			},
			//获取所有公司
			getAllCompany(){
				var self = this;
				var jsonData = new Object();
				console.log(Tokens.fetch("token"))
				if(self.subSystem == "TMS"){
					jsonData = {
						action: "/company/query1",
						pageSize: 20,
						params: {
							"bdCreateUserId": Tokens.fetch("token")["userId"],
							"bdSubSystem2":localStorage.getItem("subSystem2")
						}
					};
				}else{
					jsonData = {
						action: "/owner/query",
						pageSize: 20,
						params: {
							"bdCreateUserId": Tokens.fetch("token")["userId"],
							"bdIsConsigner": "1",
							"bdSubSystem2":localStorage.getItem("subSystem2")
						}
					};
				}
				
				doAjaxQuery(jsonData, function(data){
					console.log(data)
					//console.log(JSON.stringify(data, null, 4))
					if(data.status == 1){//如果后台执行成功
						self.orgNum = parseInt(data.dataset.allRowCount);//机构数量
						self.allCompany = data.dataset.rows;
						self.$nextTick(()=>{
                            setTimeout(function(){
                               self.$transfer.translationDel(".left_lateral");
                            },1000);
                        });
						//隐藏下拉刷新的进度条
                        if(self.isLoadId){
	                        self.$nextTick(()=>{
	                            self.$broadcast('onTopLoaded', self.isLoadId); 
	                            self.isLoadId = null;
	                        });
	                    }
					}else if(data.status == 0){
						self.$transfer.backLogin(self, data);
					}
				});
			},
			//删除
			delCompany(index, id){
				var self = this;
				event.stopPropagation();//阻止事件冒泡
				//弹出确认对话框
                self.$MessageBox.confirm('删除机构的同时，将删除该机构内所有数据与记录。是否确认删除？').then(action => {//点击对话框的"确认"执行的代码
					var jsonData = new Object();
					if(self.subSystem == "TMS"){
						jsonData = {
							action: "/company/del/" + id,
							params: {
								bdCreateUserId: Tokens.fetch("token")['userId'],
							}
						};
					}else{
						jsonData = {
							action: "/owner/del/" + id,
							params: {
								bdCreateUserId: Tokens.fetch("token")['userId'],
								bdIsConsigner: "1"
							}
						};
					}
					doAjaxUpdate(jsonData, function(data){
						//console.log(JSON.stringify(data, null, 4));
                        if(data.status == 1){
                            //数据库删除之后, 删除页面上的数据
                            //self.allCompany.splice(index, 1);
                            self.getAllCompany();//查询机构, 得到机构的数量
                            console.log("机构数量: " + parseInt(self.orgNum-1));
                            //如果机构数量为0, 就跳转到companyAdd页面, 并不能到其他页面去
                            if(parseInt(self.orgNum-1) <= 0){
                            	self.go('/noOrg');
                            }
                        }else if(data.status == 0){
                        	self.$transfer.backLogin(self, data);
                        }
					});
            	});
			},
			//撤销认证
			cancelCertification(row){
				var self = this;
				self.$MessageBox.confirm('您确定撤销认证吗?', {
						"title": "操作提示"
					}).then(action => {//撤销认证
						row.bdStatus2 = "0";//将认证状态改为0
						row.state = "u";//修改为update状态
						row.bdType = "";//修改认证类型
						var jsonData = new Object();
						if(self.subSystem == "TMS"){
							jsonData = {
								action: "/company/save",
								params: {
									bdCreateUserId: Tokens.fetch("token")['userId'],
								},
								//数据
								datasets: {
									dsData: {
										rows: [row]
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
			                    }
							};
						}else{
							jsonData = {
								action: "/owner/save",
								params: {
									bdCreateUserId: Tokens.fetch("token")['userId'],
									bdIsConsigner: "1"
								},
								//数据
								datasets: {
									dsData: {
										rows: [row]
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
			                    }
							};
						}
						doAjaxUpdate(jsonData, function(data){
							//console.log(JSON.stringify(data, null, 4));
							if(data.status == "1"){
			                    self.$transfer.showToast(self, "撤销认证成功", "bottom", 3000);
							}else if(data.status == 0){
								self.$transfer.backLogin(self, data);
							}
						});
				});
			},
			go: function(link, param) {
	            let self = this;
	            self.$transfer.go(self, link, param);
	        },
	        back: function(link, param) {
	            let self = this;
	            self.$transfer.back(self, link, param);
	        },
	        newOrg(){
	        	let self = this;
	        	// if(dbType == "other"){
	        		self.go("/selectRole")
	        	// }else{
	        	// 	self.goAdd('add')
	        	// }
	        },
		},
		route: {
	        data ({ from, to, next }) {
	        	var self = this;
	        	self.subSystem = Tokens.fetch("token")['subSystem'];//版本

	        	//获取所有公司(每次进页面都查询一次)
				self.getAllCompany();
	            next();
	        },
	        deactivate ({ next }) {
	            next();
	        },
	        canDeactivate ({ next, to, abort }) {
	            const self = this;
	            next();
	        },
	        deactivate ({ next }) {
                let as = document.querySelectorAll('.left_slider');
                Array.from(as).forEach(function(item,index){
                    item.style.WebkitTransform = "translateX(" + 0 + "px)";
                })
                next();
            },
	    }

	}

</script>

<style scoped>
	.page{
		font-family: '微软雅黑';
	}
	.companyItems{
		height: 100%;
		margin-top: 0.75rem;
	}
	.companyItem{
		width: 100%;
		height: 2.5rem;
		line-height: 2.5rem;
		background: #fff;
		padding-left: 0.5rem;
		padding-right: 0.5rem;
		margin-top: 0.05rem;
	}
	.companyItem .left_slider{
        width: 5rem;
        height: 2.5rem;
        line-height: 2.5rem;
        text-align: center;
        background: #DD524D;
        color: #fff;
        position: absolute;
        right: 0.05rem;
    }
    .companyItem .left_lateral{
        width: 100%;
        padding-left: 0.5rem;
		padding-right: 0.5rem;
        position: absolute;
        left: 0;
        background: #fff;
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
	.companyItem .isCertification{
		height:2.5rem;
		float: right;
	}
	.companyItem .isCertification img{
		width: 1.5rem;
		margin-top: 0.65rem;
	}
	.companyItem .isCertification span{
		height: 1rem;
		border: 1px solid #ccc;
		padding: 0.2rem 0.4rem 0.2rem 0.4rem;
		border-radius: 0.15rem;
		font-size: 0.65rem;
		color: #FD6053;
	}
	.companyItem .isCertification .cancelCertification{
		height: 1rem;
		border: 1px solid #353535;
		background: #353535;
		padding: 0.2rem 0.4rem 0.2rem 0.4rem;
		border-radius: 0.15rem;
		font-size: 0.65rem;
		color: #FFD91E;
	}

</style>


