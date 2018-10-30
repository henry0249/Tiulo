<template>
	<div class="page">
		<mt-header fixed :title="pageTitle">
			<!-- 审核提醒 和 收付款提醒 -->
            <mt-button icon="back" slot="left" @click="back('/tiulo')"></mt-button>
        </mt-header>
        <div class="container-top" v-infinite-scroll="loadMore()" infinite-scroll-immediate-check="false" infinite-scroll-disabled="loading" infinite-scroll-distance="200">
       		<mypulldown style="margin-top:0rem">
		        <div slot= "pullList" :style = "{minHeight:listViewH + 'px'}">
					<div class="accountList" >
						<div class="accountItem" v-for="row in accountList">
							<!-- 时间 -->
							<div class="createTime">
								<span>{{ row.fachCreateDate }}</span>
							</div>
							<!-- SH审核提醒 跳转到审核管理, SF收付款提醒 跳转到财务管理 -->
							<div class="accountItem_content" @click.stop="goPage(row.fachId, row.fachType)">
								<!-- 账单号 -->
								<div class="codeAndTime">
									<div class="isNewOrder">
										<!-- <span style="background:#aaa;"></span> -->
										<!-- 0未读-黄点 -->
										<span v-if="row.tiuloStatus=='0'" style="background:#FFD400;"></span>
										<!-- 1已读-灰点 -->
										<span v-if="row.tiuloStatus=='1'" style="background:#aaa;"></span>
									</div>
									<div class="account_code">
										账单号: <span>{{ row.fachId }}</span>
									</div>
								</div>
								<div class="account_content">
									<!-- 申请人 -->
									<div class="applicant">
										申请人: <span>{{ row.fachCreateUser }}</span>
									</div>
									<!-- 收款人 -->
									<div class="payee">
										{{row.fachInOut}}人: <span>{{ row.payerOrPayeeName }}</span>
										<span v-if="row.fachMark!=''" class="rowMark">{{row.fachMark}}</span>
									</div>
									<!-- 申请时间 -->
									<div v-if="row.fachType=='OP'" class="cycle">
										申请时间: <span>{{row.fachCreateDate}}</span>
									</div>
									<!-- 账单周期 -->
									<div v-if="row.fachType!='OP'" class="cycle">
										账单周期: <span>{{row.fachFromDate}}至{{row.fachToDate}}</span>
									</div>
									<!-- 账单金额 -->
									<div class="amount">
										账单金额: <span v-if="row.fachAmtIsRes=='0'">￥{{ row.fachAmt }}</span><span v-if="row.fachAmtIsRes=='1'" style="color:red;">￥{{ row.fachAmt }}</span>
									</div>
									<!-- 付款方式 -->
									<div class="payMode">
										付款方式: <span>{{ row.fachPayMode }}</span>
									</div>
									<!-- 账单类型 -->
									<div v-if="row.fachType!='OP'" class="billType">
										账单类型: <span>{{ fachTypeTitle[row.fachType] }}</span>
									</div>
									<!-- 费用类型 -->
									<div v-if="row.fachType=='OP'" class="billType">
										费用类型: <span>佣金</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</mypulldown>
				<!-- 已全部加载 提示 -->
				<div class="noData">{{noData}}</div>
				<!-- 加载指示器 -->
                <div class="sw-spinner" v-if="showLoadMore">
                    <mt-spinner type="snake" color="#FFD91E"></mt-spinner>
                </div>
			</div>
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
				userId: "",//用户id
				subSystem: "",//版本
				fachType: "",//对账类型(OP经营财务,ZD-KF站点与客户,ZD-SJ站点与司机,ZD-ZD1站点间,ZD-ZD2卖单)
				accountList: [],//账单List
				//OP经营财务,ZD-KF站点与客户,ZD-SJ 站点与司机,ZD-ZD1站点间,ZD-ZD2卖单
				fachTypeTitle: {
					"ZD-KF": "站点与客户",
					"ZD-SJ": "站点与司机",
					"ZD-ZD1": "站点间",
					"ZD-ZD2": "卖单"
				},

				noData: '',//没有数据
	            currPage: 1,//当前页面
	            loadMax: false,//是否加载到最大条数
	            showLoadMore: false,//加载指示器
	            loading: false,//是否在无限加载

	            operation: "",//是审核管理还是收付款管理
	            pageTitle: "审核管理",//页面名字

	            listViewH: 0,//下拉刷新框的最小高度
	            isLoadId: null,//用来存储下拉刷新时带过来的id,初始设置为null,在数据加载完成后清除加载指示时
			}
		},
		//打开网页执行的方法(只执行一次)
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
	                self.currPage = 1;
	                self.noData = "";
	                self.loading = false;
	                self.loadMax = false;
	                self.showLoadMore = false;
	                self.getAccountList();//获取列表数据
	            }, 1000);
	        },
		},
		//内容改变时调用
		watch: {

		},
		//方法
		methods: {
			//点击账单跳转页面
			goPage(fachId,fachType){
				var self = this;
				//列表若有点击跳转事件，在下拉时阻止点击跳转
	            if(isXLorClick()){
	                return;
	            }

				if(self.operation == "SH"){//审核提醒
					Tokens.save("fachId",'');
		            Tokens.save("fachId", fachId);
		            Tokens.save("fachType",'');
		            Tokens.save("fachType", fachType);
					self.$transfer.go(self, '/billOrderKF', fachId);
				}else if(self.operation == "SF"){//收付款提醒
					Tokens.save("fachId",'');
		            Tokens.save("fachId", fachId);
		            Tokens.save("fachType",'');
		            Tokens.save("fachType", fachType);
		            self.$transfer.go(self, '/billDetail');
				}
			},
			//无限加载更多
			loadMore () {
	            let self = this;
	            if(self.loading){
	                return;
	            }else{
	                if(self.loadMax){
	                    return;                               
	                }else{
	                    self.loading = true;
	                    self.currPage++;
	                    self.showLoadMore = true;
	                    self.getAccountList();       
	                }
	            }
	        },
			//获取所有账单
			getAccountList(){
				var self = this;
				var jsonData = {
					action: "/finAccountHead/query",
					pageSize: 10,
					pageIndex: self.currPage,//当前页
				};

				if(self.operation == "SH"){//审核提醒
					//"{"fachPayerId":"ORG1609014","accountSH":"sh","fachStatus":"01","isTiulo":"1","tiuloZDRecvUserId":"00094","tiuloSubSystem":"TMS","tiuloRecvOrgId":"ORG1609014"}"
					jsonData.params = {
						fachPayerId: Tokens.fetch('token')['orgId'],//fachPayeeId
						accountSH: "sh",//判断审核数据这个值随意给不能为空
						fachStatus: "01",
						isTiulo: "1",
						tiuloZDRecvUserId: self.userId,
						tiuloSubSystem: self.subSystem,
						tiuloRecvOrgId: Tokens.fetch('token')['orgId'],
					}
				}else if(self.operation == "SF"){//收付款提醒
					//"{"isMsgInOut":"1","isTiulo":"1","tiuloZDRecvUserId":"00094","tiuloSubSystem":"TMS","tiuloRecvOrgId":"ORG1609014"}"
					jsonData.params = {
						isMsgInOut: "1",
						isTiulo: "1",
						tiuloZDRecvUserId: self.userId,
						tiuloSubSystem: self.subSystem,
						tiuloRecvOrgId: Tokens.fetch('token')['orgId'],
					}
				}

				doAjaxQuery(jsonData, function(data){
					//consoleShow(JSON.stringify(data, null, 4));
					if(data.status == 1){
						var obj = data.dataset.rows;
						if(obj && obj.length > 0){
							obj.forEach(function(item, index){
	                            item.fachCreateDate = item.fachCreateDate.substr(0, 20);//去掉毫秒数
	                            item.fachFromDate = item.fachFromDate.substr(0, 10);
	                            if(item.fachToDate){
	                            	item.fachToDate = item.fachFromDate.substr(0, 10);
	                            }
	                            //收款人是否是当前站点
	                            if(item.fachPayerId == Tokens.fetch('token')['orgId']){
	                            	item.payerOrPayeeName = (item.payeeCompanyName == '*' ? item.fachPayeeName : (item.payeeCompanyName+'-'+item.fachPayeeName));
	                            	//金额为红色负数
	                            	item.fachAmt = "-" + item.fachAmt.toFixed(2);
	                            	item.fachAmtIsRes = "1";//显示红色
	                            }else{
	                            	item.payerOrPayeeName = (item.payerCompanyName == '*' ? item.fachPayerName : (item.payerCompanyName+'-'+item.fachPayerName));
	                            	item.fachAmt = item.fachAmt.toFixed(2);
	                            	item.fachAmtIsRes = "0";
	                            }
	                        });
	                        //console.log(JSON.stringify(obj, null, 4));
	                        //判断是替换还是增加
	                        if(self.currPage == 1){
	                            self.accountList = obj;
	                        }else{
	                            self.accountList = self.accountList.concat(obj);
	                        } 
	                        //判断当前页是否是最后一页  
	                        let maxRecord = parseInt(data.dataset.allRowCount);
	                        if(self.accountList.length >= maxRecord){
	                            self.loadMax = true;
	                            self.noData = '已全部加载';
	                        }
						}else{
							self.accountList = [];
                        	self.noData = "没有相关数据";
						}

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
					self.$Indicator.close();
	                self.showLoadMore = false;
	                self.loading = false;
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
	        	//进入页面时token不存在
	            if(!localStorage.getItem("token")){
	                self.$transfer.backLogin(self, {info:'token没有值'});
	                return;
	            }
	        	
	        	var token = Tokens.fetch('token');
	        	self.userId = token['userId'];
	        	self.subSystem = token['subSystem'];

	        	//如果是从billDetail过来的
	        	if(from.path && (from.path.indexOf('billDetail') != -1)){
	        		if(self.accountList == "" || self.accountList.length <= 0){
	        			self.operation = self.$route.params.operation;
	        			self.getAccountList();
	        		}
	        		//取出跳转前的页面位置并设置
	                self.$nextTick(()=>{
	                    $('.container-top').animate({scrollTop: Tokens.fetch("accountMsgList_pageLocation")},0); 
	                });
	        	}else{//重新加载页面
	        		self.accountList = [];//列表
	                self.noData = '';//没有数据
	                self.currPage = 1;//当前页面
	                self.loadMax = false;//是否加载到最大条数
	                self.showLoadMore = false;//加载指示器
	                self.loading = false;//是否在无限加载
	                //审核管理还是收付款管理
	                self.operation = self.$route.params.operation;
	                if(self.operation == "SH"){//审核提醒
	                	self.pageTitle = "审核提醒";
	                }else if(self.operation == "SF"){//收付款提醒
	                	self.pageTitle = "收付款提醒";
	                }

	                self.getAccountList();
	        	}
	            next();
	        },
	        deactivate ({ next }) {
	        	//存储页面的位置
                Tokens.save("accountMsgList_pageLocation", $(".container-top").scrollTop());
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
	.accountList{
		padding: 0 0.5rem 0.5rem 0.5rem;
	}
	.accountItem{
		
	}
	.createTime{
		text-align: center;
		padding: 0.75rem 0 0.75rem 0;
	}
	.createTime span{
		background: #BEBEBE;
		border-radius: 5px;
		padding: 0.15rem 0.35rem 0.15rem 0.35rem;
		color: #F6F6F6;
	}
	.accountItem_content{
		background: #fff;
		padding: 0.35rem 0.25rem 0.35rem 0.25rem;
		border-radius: 5px;
	}
	.codeAndTime{

	}
	.account_code{
		padding-left: 1.1rem;
		font-size: 0.8rem;
	}
	.accountItem .isNewOrder span{
		width: 0.8rem;
		height: 0.8rem;
		margin-top: 0.2rem;
		border-radius: 50%;
		display: block;
		float: left;
	}
	.account_content{
		padding-left:1.1rem;
		font-size:0.75rem;
	}
	.account_content div{
		/*overflow:hidden;
	    white-space:nowrap;
	    text-overflow:ellipsis;*/
	}
	.rowMark{
		background:#333;
		color:#fff;
		border-radius:3px;
		padding:0 3px 0 3px;
		display:inline-block;
		font-size: 14px;
	}

</style>


