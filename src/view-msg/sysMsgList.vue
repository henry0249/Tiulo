<template>
	<div class="page">
		<mt-header fixed title="系统提醒">
			<mt-button icon="back" slot="left" @click="back('/tiulo')"></mt-button>
            <!-- <mt-button slot="left" @click="back('/tiulo')">
                <span class="iconfont leftIcon">&#xe663;</span>
            </mt-button> -->
        </mt-header>
        <div class="container-top" v-infinite-scroll="loadMore()" infinite-scroll-immediate-check="false" infinite-scroll-disabled="loading" infinite-scroll-distance="200">
        	<mypulldown style="margin-top:0rem">
	        	<div slot= "pullList" :style = "{minHeight:listViewH + 'px'}">
					<div class="systemList">
						<div class="systemItem" v-for="row in systemList">
							<!-- 左滑删除 -->
							<div class="left_slider" @click.stop="deleteItem($index, row.tiuloId)">删除</div>
							<div class="left_lateral">
								<div class="dot">
									<!-- 0未读-黄点 -->
									<span v-if="row.tiuloStatus=='0'&&row.tiuloBillType=='*'" style="background:#FFD400;"></span>
									<!-- 1已读-灰点 -->
									<span v-if="row.tiuloStatus=='1'&&row.tiuloBillType=='*'" style="background:#aaa;"></span>
									<!-- *
										如果是创建站点, 点击打开站点详情页
									 -->
									<!-- tiuloBillType=="newOrg"绿点 -->
									<span v-if="row.tiuloStatus=='0'&&row.tiuloBillType=='newOrg'" style="background:green;"></span>
								</div>
								<div class="icon">
									<img :src="row.tiuloSendUserLogo" onerror="javascript:this.src='http://tiulo-dbcon.oss-cn-hangzhou.aliyuncs.com/user/default.png'">
								</div>
								<div class="name_time">
									<div class="sendName">
										<span>{{row.tiuloSendUserName}}</span>
									</div>
									<div class="time">
										<span>{{ row.tiuloSendDate }}</span>
									</div>
								</div> 
								<div class="content">
									<span>{{row.tiuloTitle}}</span>
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
				systemList: [],
				noData: '',//没有数据
	            currPage: 1,//当前页面
	            loadMax: false,//是否加载到最大条数
	            showLoadMore: false,//加载指示器
	            loading: false,//是否在无限加载
	            subSystem: "",//版本

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
	                self.getSystemList();//获取列表数据
	            }, 1000);
	        },
		},
		//内容改变时调用
		watch: {
			
		},
		//方法
		methods: {
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
	                    self.getSystemList();       
	                }
	            }
	        },
			//删除
			deleteItem(index, id){
				var self = this;
				var jsonData = {
					action: "/cmsTiulo/del/" + id,
					saveQueryAction: "query",
					pageSize: 15,
					pageIndex: self.currPage,//当前页
					params: {
						tiuloType: "XT",//系统信息
						tiuloSubSystem: self.subSystem,//版本
					}
				};
				doAjaxUpdate(jsonData, function(data){
					if(data.status == 1){
						self.systemList.splice(index, 1);
						//删除成功后，后台补回一条数据
                        let obj = data.retRows;
                        if(obj && obj.length > 0){
                        	obj.forEach(function(item, index){
								item.tiuloSendUserLogo = getImgURL() + "user/" + item.tiuloSendUserLogo;
								item.tiuloSendDate = self.processingDate(item.tiuloSendDate);
							});
							//console.log(JSON.stringify(obj, null, 4));
							self.systemList = self.systemList.concat(obj);

							// 判断当前页是否是最后一页  
                            let maxRecord = parseInt(data.retAllRowCount);
                            if(self.systemList.length == maxRecord){
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
			},
			//获取数据
			getSystemList(){
				var self = this;
				var jsonData = {
					action: "/cmsTiulo/query",
					pageSize: 15,
					pageIndex: self.currPage,//当前页
					params: {
						tiuloType: "XT",//系统信息
						tiuloSubSystem: self.subSystem,//版本
					}
				};
				doAjaxQuery(jsonData, function(data){
					//console.log(JSON.stringify(data, null, 4));
					if(data.status == 1){
						var obj = data.dataset.rows;
						if(obj && obj.length > 0){
							obj.forEach(function(item, index){
								item.tiuloSendUserLogo = getImgURL() + "user/" + item.tiuloSendUserLogo;
								item.tiuloSendDate = self.processingDate(item.tiuloSendDate);
							});

							//判断是替换还是增加
	                        if(self.currPage == 1){
	                            self.systemList = obj;
	                        }else{
	                            self.systemList = self.systemList.concat(obj);
	                        } 
	                        //判断当前页是否是最后一页  
	                        let maxRecord = parseInt(data.dataset.allRowCount);
	                        if(self.systemList.length >= maxRecord || obj.length == 0){
	                            self.loadMax = true;
	                            self.noData = '已全部加载';
	                        }
						}else{
                        	self.loadMax = true;
	                        if(self.currPage == 1){
	                            self.systemList = [];
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
	            
	        	var token = Tokens.fetch('token');
	        	self.subSystem = token['subSystem'];


	        	self.getSystemList();
	            next();
	        },
	        deactivate ({ next }) {
	        	let as = document.querySelectorAll('.left_slider');
                Array.from(as).forEach(function(item,index){
                    item.style.WebkitTransform = "translateX(" + 0 + "px)";
                });
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
	.systemList{
		padding-bottom: 2rem;
	}
	.systemItem{
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
		margin-top: 0.8rem;
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

