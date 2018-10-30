<template>
	<div class="page">
		<mt-header fixed title="公告">
			<mt-button icon="back" slot="left" @click="back('/tiulo')"></mt-button>
            <!-- <mt-button slot="left" @click="back('/tiulo')">
                <span class="iconfont leftIcon">&#xe663;</span>
            </mt-button> -->
            <mt-button slot="right" @click="go('/addNotice')">公告发起</mt-button>
        </mt-header>
        <div class="container-top" v-infinite-scroll="loadMore()" infinite-scroll-immediate-check="false" infinite-scroll-disabled="loading" infinite-scroll-distance="200">
	        <mypulldown style="margin-top:0rem">
	        	<div slot= "pullList" :style = "{minHeight:listViewH + 'px'}">
		        	<div class="noticeList">
		        		<div class="noticeItem" v-for="row in dataList" @click.stop="goto(row.cinfId)">
		        			<!-- 左滑删除 -->
							<div class="left_slider" @click.stop="deleteItem($index, row.cinfId, row.isSend)">删除</div>
							<div class="left_lateral">
								<div class="dot">
									<!-- 0未读-黄点 -->
									<span v-if="row.tiuloStatus=='0'&&typeof row.tiuloStatus!='undefined'" style="background:#FFD400;"></span>
									<!-- 1已读-灰点 -->
									<span v-if="row.tiuloStatus=='1'||typeof row.tiuloStatus=='undefined'" style="background:#aaa;"></span>
								</div>
								<div class="icon">
									<img :src="row.cinfSendUserLogo" onerror="javascript:this.src='http://tiulo-dbcon.oss-cn-hangzhou.aliyuncs.com/user/default.png'">
								</div>
								<div class="name_time">
									<div class="sendName">
										<span>{{row.cinfSendUserName}}</span>
									</div>
									<div class="time">
										<span>{{ row.cinfCreateDate }}</span>
									</div>
								</div> 
								<div class="content">
									<span>{{row.cinfTitle}}</span>
								</div>
							</div>
		        		</div>
		        		<!-- 已全部加载 提示 -->
						<div class="noData">{{noData}}</div>
						<!-- 加载指示器 -->
			            <div class="sw-spinner" v-if="showLoadMore">
			                <mt-spinner type="snake" color="#FFD91E"></mt-spinner>
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
				dataList: [],
				noData: '',//没有数据
	            currPage: 1,//当前页面
	            loadMax: false,//是否加载到最大条数
	            showLoadMore: false,//加载指示器
	            loading: false,//是否在无限加载
	            beforeScrollTop: 0,//存储页面当前scrollTop

	            listViewH: 0,//下拉刷新框的最小高度
	            isLoadId: null,//用来存储下拉刷新时带过来的id,初始设置为null,在数据加载完成后清除加载指示时

	            defaultImg: getImgURL() + "user/default.png",//默认图片(如果图片不存在)
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
	                self.getDataList();//获取列表数据
	            }, 1000);
	        },
		},
		//内容改变时调用
		watch: {
			
		},
		//方法
		methods: {
			
			goto: function(cinfId){
				var self = this;
				//列表若有点击跳转事件，在下拉时阻止点击跳转
	            if(isXLorClick()){
	                return;
	            }
				self.go('/noticeDetails', cinfId);
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
	                    self.getDataList();       
	                }
	            }
	        },
			//删除
			//接收者直接删除, 创建者提示删除
			deleteItem(index, id, isSend){
				var self = this;
				var jsonData = {
					action: "/cmsInfo/del/" + id,
					saveQueryAction: "query",
					pageSize: 15,
					pageIndex: self.currPage,//当前页
					params: {
						cinfType1: "GG",//系统信息
						noticeFind: Tokens.fetch('token')['userId'],
						tiuloMsgStatus: 1,
					},
				};
				if(isSend != undefined && isSend == 1){//如果是公告创建者
					self.$MessageBox.confirm('您将彻底删除本公告，确定删除吗？',{title: "操作提示"}).then(action => {
						doAjaxUpdate(jsonData, function(data){
							if(data.status == 1){
								self.dataList.splice(index, 1);
								//删除成功后，后台补回一条数据
	                        	let obj = data.retRows;
	                        	if(obj && obj.length > 0){
									obj.forEach(function(item, index){
										item.cinfSendUserLogo = getImgURL() + "user/" + item.cinfSendUserLogo;
										item.cinfCreateDate = self.processingDate(item.cinfCreateDate);
									});
									self.dataList = self.dataList.concat(obj);

									// 判断当前页是否是最后一页  
		                            let maxRecord = parseInt(data.retAllRowCount);
		                            if(self.dataList.length == maxRecord){
		                                self.loadMax = true;
		                                self.noData = '已全部加载';
		                            }
								}
								//删除提示
			                    self.$Toast({//显示错误提示
		                            message: "删除成功",
		                            position: "bottom",
		                            duration: 3000
		                        });
							}else if(data.status == 0){
								self.$transfer.backLogin(self, data);
							}
						});
					});
				}else{//如果是公告接收者
					jsonData.params.recvUserDelete = 1;
					doAjaxUpdate(jsonData, function(data){
						if(data.status == 1){
							self.dataList.splice(index, 1);
							//删除提示
		                    self.$Toast({//显示错误提示
	                            message: "删除成功",
	                            position: "bottom",
	                            duration: 3000
	                        });
						}else if(data.status == 0){
							self.$transfer.backLogin(self, data);
						}
					});
				}
			},
			//获取数据
			getDataList(){
				var self = this;
				var jsonData = {
					action: "/cmsInfo/query1",
					pageSize: 15,
					pageIndex: self.currPage,//当前页
					params: {
						cinfType1: "GG",//系统信息
						noticeFind: Tokens.fetch('token')['userId'],
						tiuloMsgStatus: 1,
					},
					showFields: "cinfId,cinfSendUserId,cinfSendUserName,cinfSendUserLogo,cinfCreateDate,isSend,tiuloStatus,cinfTitle",
				};
				doAjaxQuery(jsonData, function(data){
					//console.log(JSON.stringify(data, null, 4));
					if(data.status == 1){
						var obj = data.dataset.rows;
						if(obj && obj.length > 0){
							obj.forEach(function(item, index){
								item.cinfSendUserLogo = getImgURL() + "user/" + item.cinfSendUserLogo;
								item.cinfCreateDate = self.processingDate(item.cinfCreateDate);
							});
							//console.log(JSON.stringify(obj, null, 4));

							//判断是替换还是增加
	                        if(self.currPage == 1){
	                            self.dataList = obj;
	                        }else{
	                            self.dataList = self.dataList.concat(obj);
	                        } 
	                        //判断当前页是否是最后一页  
	                        let maxRecord = parseInt(data.dataset.allRowCount);
	                        if(self.dataList.length >= maxRecord){
	                            self.loadMax = true;
	                            self.noData = '已全部加载';
	                        }
						}else{
                        	self.loadMax = true;
	                        if(self.currPage == 1){
	                            self.dataList = [];
	                            self.noData = "没有相关数据";
	                        }else{
	                            self.noData = '已全部加载';
	                        }
						}
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
					self.$Indicator.close();
	                self.showLoadMore = false;
	                self.loading = false;
				});
			},
			//处理时间
            processingDate(_date){//_date格式2016-12-02 10:34:51 426
                var createDate = new Date(_date.replace(/-/g,"/").substring(0,19));
	   			return initDate(getDateTimeForDate(createDate));
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

	            if(from.path && from.path.indexOf("noticeDetails") != -1){//从公告详情页回来
	            	if(self.dataList == "" || self.dataList.length == 0){
	        			self.getDataList();
	        		}
					//取出跳转前的页面位置并设置
	                self.beforeScrollTop = Tokens.fetch("pageLocation");
	                self.$nextTick(()=>{
	                    $('.container-top').animate({scrollTop: self.beforeScrollTop},0); 
	                });
	            }else{
	            	self.dataList = [];
		            self.noData = '';//没有数据
	                self.currPage = 1;//当前页面
	                self.loadMax = false;//是否加载到最大条数
	                self.showLoadMore = false;//加载指示器
	                self.loading = false;//是否在无限加载
	                self.beforeScrollTop = 0;//初始进入页面时scroll的值为0
		        	self.getDataList();
	            }
	            next();
	        },
	        deactivate ({ next }) {
	        	let as = document.querySelectorAll('.left_slider');
                Array.from(as).forEach(function(item,index){
                    item.style.WebkitTransform = "translateX(" + 0 + "px)";
                });

                //存储页面的位置
                Tokens.save("pageLocation", $(".container-top").scrollTop());
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
	.noticeList{
		padding-bottom: 2rem;
	}
	.noticeItem{
		height: 3.05rem;
		background: #fff;
		padding: 0 0.5rem 0 0.5rem;
		border-bottom: 1px solid #ddd;
	}
	.dot{
		height: 2.5rem;
		width: 1rem;
		float: left;
	}
	.dot span{
		width: 0.8rem;
		height: 0.8rem;
		margin-top: 0.75rem;
		border-radius: 50%;
		display: block;
	}
	.name_time{
		height: 1.25rem;
		line-height: 1.25rem;
	}
	.icon{
		height: 2.5rem;
		width: 2.5rem;
		float: left;
		text-align: center;
		margin-top: 0.1rem;
		/*background: #ccc;*/
	}
	.icon img{
		border-radius: 5px;
		width: 2.3rem;
	}
	.sendName{
		height: 1.25rem;
		float: left;
		margin-left: 0.25rem;
		font-size: 0.8rem;
		color: #000;
	}
	.time{
		height: 1.25rem;
		float: right;
	}
	.content{
		height: 1.25rem;
		line-height: 1.25rem;
		overflow:hidden;
	    white-space:nowrap;
	    text-overflow:ellipsis;
	}
	.content span{
		margin-left: 0.25rem;
	}
	.left_slider{
        width: 5rem;
        height: 3rem;
        line-height: 3rem;
        text-align: center;
        background: #DD524D;
        color: #fff;
        position: absolute;
        right: 0;
    }
    .left_lateral{
        width: 100%;
        height: 3rem;
        padding-left: 0.5rem;
		padding-right: 0.5rem;
		padding-bottom: 0.25rem;
		padding-top: 0.25rem;
        position: absolute;
        left: 0;
        background: #fff;
    }
</style>

