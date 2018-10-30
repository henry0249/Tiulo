<template>
	<div class="page">
		<mt-header fixed title="异常信息">
			<mt-button icon="back" slot="left" @click="back('/tiulo')"></mt-button>
            <!-- <mt-button slot="left" @click="back('/tiulo')">
                <span class="iconfont leftIcon">&#xe663;</span>
            </mt-button> -->
            <mt-button slot="right" @click="newEx()">
                <span style="color:#FFD91E;">异常发起</span>
            </mt-button>
        </mt-header>
        <div class="container-search" id="searchBox"> 
            <mysearch
              :value.sync="searchVal"
              placeholder="请输入关键字查询">
            </mysearch>
        </div>
        <div class="container-top" v-infinite-scroll="loadMore()" infinite-scroll-immediate-check="false" infinite-scroll-disabled="loading" infinite-scroll-distance="200">
        	<mypulldown style="margin-top:2.8rem">
	            <div slot= "pullList" :style = "{minHeight:listViewH + 'px'}">
        			<div class="exceptionList" >
        		
			    		<!-- taskOrderExDetail/EX161228005 texId-->
			    		<div class="exceptionItem" v-for="row in allException" @click.stop="openExDetail($index, row.texId, row)">
			        		<!-- 左滑删除 -->
							<div class="left_slider" @click.stop="delException($index, row.texId)">删除</div>
							<div class="left_lateral">
							 	<!-- 点 -->
								<div class="dot" style="float:left;">
									<!-- 0初始   close已关闭  summed已总结 -->
									<!-- 未解决 -->
									<span v-if="row.texStatus=='0'" style="background:#FFD400;"></span>
									<!-- 已解决 -->
									<span v-if="row.texStatus=='close'||row.texStatus=='summed'" style="background:#aaa;"></span>
								</div>
								<div>
									<div class="msg">
										<div class="item_icon">
					        				<img :src="row.createUserLogo" onerror="javascript:this.src='http://tiulo-dbcon.oss-cn-hangzhou.aliyuncs.com/user/default.png'" />
					        				<span v-if="row.teuNoReadCount>0&&row.teuNoReadCount<=99" class="badge">{{row.teuNoReadCount}}</span>
					        				<span v-if="row.teuNoReadCount>99" class="badge">99+</span>
					        			</div>
					        			<div class="item_titleAndTime">
					        				<p class="item_name">{{ row.texCreateUser }}</p>
					        				<span v-if="row.suSex=='男'" class="iconfont" style="font-size:0.85rem;color:#163af7;">&#xe657;</span>
					        				<span v-if="row.suSex=='女'" class="iconfont" style="font-size:0.9rem;color:#d4237a;">&#xe658;</span>
					        				<span v-if="row.suIsTMS=='1'" class="small_icon">运</span>
					        				<span v-if="row.suIsCustomer=='1'" class="small_icon">企</span>
					        				<span v-if="row.suIsDriver=='1'" class="small_icon">车</span>
					        				<div style="float:right;">
					        					<span style="color:#999;">{{ row.texCreateDate }}</span>
					        				</div>
					        			</div>
					        			<div class="item_content" style="">
					        				<!-- 手机号 -->
					        				<span class="iconfont" style="font-size:0.7rem;color:#FFD400;">&#xe656;</span><span>{{row.suMobile}}</span>
					        				<!-- 订单异常-显示订单号 -->
					        				<span v-if="row.texTaskId=='*'" style="display:block;float:right;">{{row.texOrderIds}}</span>
					        				<!-- 车次异常-显示车牌 -->
					        				<span v-if="row.texTaskId!='*'" style="display:block;float:right;">{{row.ttTruckCode}}</span>
					        			</div>
									</div>
									<div class="content" style="font-size:0.75rem;">
										<div style="width:2rem;margin-right:0.5rem;float:left;">主&nbsp;题:</div>
										<span>{{ row.texTitle }}</span>
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
	import Mysearch  from '../components/mysearch';
	import Tokens from '../token';
	import  Mypulldown from '../components/mypulldown'//引入下拉刷新的组件
	export default {
		components: {
	        Mysearch,
	        Mypulldown
	    },
		//数据
		data() {
			return{
				/* 搜索框 */
				searchVal: "",//查询的value
				timer: false,//是否执行搜索的定时器
				beforeScrollTop: 0,//存储页面当前scrollTop
            	scrollTimer: false,//是否执行滚动定时器

				allException: [],//请求返回的数据
				noData: '',//没有数据
	            currPage: 1,//当前页面
	            loadMax: false,//是否加载到最大条数
	            showLoadMore: false,//加载指示器
	            loading: false,//是否在无限加载

	            listViewH: 0,//下拉刷新框的最小高度
	            isLoadId: null,//用来存储下拉刷新时带过来的id,初始设置为null,在数据加载完成后清除加载指示时
			}
		},
		//打开网页执行的方法(只执行一次)
		ready() {
			var self = this;
			//列表框的最小高度
	        self.$nextTick(()=>{
	            self.listViewH = $(".container-top").height() - $("#searchBox").height() - 10;
	        });
			//列表滚动时搜索框的显示和隐藏
	        searchBoxIsShow('.container-top','#searchBox',self.beforeScrollTop,function(top){
	            self.beforeScrollTop = top; 
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
	                self.getAllException();//获取列表数据
	            }, 1000);
	        },
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
	                	self.allException = [];  
	                    self.currPage = 1;
	                    self.loadMax = false;
	                    self.noData = '';
	                    self.$Indicator.open();
	                    //查询方法
						self.getAllException();
	                    self.timer = false;
	                }, 500);
	            }
	        }
		},
		//方法
		methods: {
			//无限加载更多
			loadMore () {
	            let self = this;
	            if(self.loading || self.loadMax){
	                return;
	            }else{
	                self.loading = true;
	                self.currPage++;
	                self.showLoadMore = true;
	                self.getAllException();       
	            } 
	        },
			openExDetail(index, id, row){//查看异常详情
	            let self = this;
	            //列表若有点击跳转事件，在下拉时阻止点击跳转
	            if(isXLorClick()){
	                return;
	            }
	            //console.log(JSON.stringify(row, null, 4));
	            //取出token中的ycMsgCount(异常聊天数量)
	            Tokens.save("ycMsgCount", parseInt(Tokens.fetch("ycMsgCount")) - parseInt(row.teuNoReadCount));
	            
	            if(row.texTaskId == "*"){//异常详情
	            	Tokens.save("exDetailData","");
		            Tokens.save("exDetailData", self.allException[index]);
		            //消息数量设置为0
		            self.allException[index].teuNoReadCount = 0;
		            self.$transfer.go(self, '/taskOrderExDetail', id);
	            }else{//车次异常
	            	Tokens.save("truckExDetail", row);
	            	var params = row.texTaskId + '-detail';
	            	self.$transfer.go(self, '/taskTruckAddExtremely', params);
	            }
	            
	        },
			//删除一条异常记录
			delException(index, id){
				var self = this;
				self.$MessageBox.confirm('您确定删除这条记录吗？',{title: "操作提示"}).then(action => {
					var jsonData = {
						action: "/tmEx/del/" + id,
						pageIndex: self.currPage,
						pageSize: 15,
						saveQueryAction: "query",
						params: {
	                    	exUserId: Tokens.fetch("token")['userId'],
	                    	tiuloExRecvUserId: Tokens.fetch("token")['userId'],
	                    	isTiulo: "1",
	                    	findString: self.searchVal//查询
	                    }
					};
					doAjaxUpdate(jsonData, function(data){
						if(data.status == 1){//操作成功
							//数据库删除之后, 删除页面上的数据
	                        self.allException.splice(index, 1);
	                        //删除成功后，后台补回一条数据
                        	let obj = data.retRows;
                        	if(obj && obj.length > 0){
                        		obj.forEach(function(item, index){
		                            item.texCreateDate = self.formatDate(item.texCreateDate);//计算过后的texCreateDate;
		                            item.createUserLogo = getImgURL() + "user/" + item.createUserLogo;
		                            item.ttTruckCode = item.ttTruckCode + "";
		                        });
	                        	//console.log(JSON.stringify(obj, null, 4));
	                        	self.allException = self.allException.concat(obj);
	                        	//console.log(self.allException.length);

	                        	// 判断当前页是否是最后一页  
	                            let maxRecord = parseInt(data.retAllRowCount);
	                            if(self.allException.length == maxRecord){
	                                self.loadMax = true;
	                                self.noData = '已全部加载';
	                            }
                        	}
						}else if(data.status == 0){
							self.$transfer.backLogin(self, data);
						}
					});
				});
			},
			//获取所有异常信息
			getAllException(){
				var self = this;
				//请求的数据参数
                var jsonData = {
                    action: "/tmEx/query",
                    pageSize: 15,
					pageIndex: self.currPage,//当前页
                    params: {
                    	exUserId: Tokens.fetch("token")['userId'],
                    	tiuloExRecvUserId: Tokens.fetch("token")['userId'],
                    	isTiulo: "1",
                    	findString: self.searchVal//查询
                    },
                    showError: function(error){
                        if(typeof error != "undefined"){
                           self.$Toast({//显示错误提示
                                message: error,
                                position: "bottom",
                                duration: 5000
                           });
                        }
                    },
                };
                //查询数据
                doAjaxQuery(jsonData, function(data){
                   	//console.log(JSON.stringify(data, null, 4));
                    if(data.status == 1){//如果后台执行成功
                        //后台返回的数据
                        var obj = data.dataset.rows;
                        if(obj && obj.length > 0){
                        	//处理创建时间texCreateDate字段
	                        obj.forEach(function(item, index){
	                            item.texCreateDate = self.formatDate(item.texCreateDate);//计算过后的texCreateDate;
	                            item.createUserLogo = getImgURL() + "user/" + item.createUserLogo;
	                            item.ttTruckCode = item.ttTruckCode + "";
	                        });

	                        //判断是替换还是增加
	                        if(self.currPage == 1){
	                            self.allException = obj;
	                        }else{
	                            self.allException = self.allException.concat(obj);
	                        } 
	                        //判断当前页是否是最后一页  
	                        let maxRecord = parseInt(data.dataset.allRowCount);
	                        if(self.allException.length >= maxRecord){
	                            self.loadMax = true;
	                            self.noData = '已全部加载';
	                        }
                        }else{
                        	self.loadMax = true;
	                        if(self.currPage == 1){
	                            self.allException = [];
	                            self.noData = "没有相关数据";
	                        }else{
	                            self.noData = '已全部加载';
	                        }
                        }

                        //item左滑功能
                        self.$nextTick(()=>{
                            setTimeout(function(){
                               self.$transfer.translationDel(".left_lateral");
                            },1000)
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
            formatDate(_date){//_date格式为: 2016-12-02 10:34:51 426
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
	        },
	        newEx(){//发起异常
	        	let self = this;
	        	self.go('/taskOrderAddExtremely','id1');
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

	        	//如果是从taskOrderExDetail过来的
	        	if(from.path && (from.path.indexOf('taskOrderExDetail') != -1 || from.path.indexOf('taskTruckAddExtremely') != -1)){
	        		{//如果在taskOrderExDetail页面刷新了, 返回回来数据会丢失, 所以重新请求一次
	        		if(self.allException == "" || self.allException.length <= 0)
	        			self.getAllException();
	        		}
	        		//取出跳转前的页面位置并设置
	                self.beforeScrollTop = Tokens.fetch("exceptionList_pageLocation");
	                self.$nextTick(()=>{
	                    $('.container-top').animate({scrollTop: self.beforeScrollTop},0); 
	                });
	        	}else{
	        		self.allException = [];//列表
	                self.noData = '';//没有数据
	                self.currPage = 1;//当前页面
	                self.loadMax = false;//是否加载到最大条数
	                self.showLoadMore = false;//加载指示器
	                self.loading = false;//是否在无限加载
	                self.beforeScrollTop = 0;//初始进入页面时scroll的值为0

	                self.getAllException();
	        	}
	        	
	            next();
	        },
	        deactivate ({ next }) {
	        	let as = document.querySelectorAll('.left_slider');
                Array.from(as).forEach(function(item,index){
                    item.style.WebkitTransform = "translateX(" + 0 + "px)";
                });

                //存储页面的位置
                Tokens.save("exceptionList_pageLocation", $(".container-top").scrollTop());
                //隐藏搜索框时 退出页面再进 会导致进入之后看不到搜索框的问题
                $("#searchBox").slideDown();

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
	.badge{
        min-width: 1rem;
        min-height: 1rem;
        line-height: 1rem;
        border-radius: 0.5rem;
        background: red;
        color:#fff;
        position: absolute;
        top:0.25rem;
        left:3rem;
        font-size: 0.5rem;
        text-align: center;
    }
	.exceptionList{
		font-family: '微软雅黑';
	}
	.exceptionItem{
		height: 4.2rem;
		/*line-height: 3rem;*/
		padding: 0 0.5rem 0 0.5rem;
		background: #fff;
		border-bottom: 1px solid #eee;
	}
	.left_slider{
        width: 5rem;
        height: 4.15rem;
        line-height: 4.15rem;
        text-align: center;
        background: #DD524D;
        color: #fff;
        position: absolute;
        right: 0.05rem;
    }
    .left_lateral{
        width: 100%;
        height: 4.15rem;
        padding-left: 0.5rem;
		padding-right: 0.5rem;
		padding-top: 0.25rem;
        position: absolute;
        left: 0;
        background: #fff;
    }
    .dot{
    	width:1.1rem;
    	height: 3.5rem;
    }
    .dot span{
		width: 0.8rem;
		height: 0.8rem;
		margin-top: 0.25rem;
		border-radius: 50%;
		display: block;
    }
    .content{
    	height: 1rem;
    	overflow:hidden;
        white-space:nowrap;
        text-overflow:ellipsis;
    }
	.item_icon{
		width: 2.5rem;
		height: 2.5rem;
		float: left;
	}
	.item_icon img{
		height: 2rem;
		margin-top: 0.25rem;
		border-radius: 3px;
	}
	.item_titleAndTime{
		height: 1.25rem;
		line-height: 1.25rem;
	}
	/*.item_titleAndTime .small_icon{
		width: 0.85rem;
		height: 0.85rem;
		line-height: 0.85rem;
		text-align: center;
		color: #fff;
		display: inline-block;
		background: #252525;
		margin-top: 0.25rem;
	}*/
	.item_titleAndTime .small_icon{
		display: inline-block;
        color:#fff;
        width:0.9rem;
        height:0.9rem;
        /* 手机端行高比高度大才能居中 */
        line-height: 1rem;
        text-align: center;
        border-radius: 3px;
        background: #252525;
	}
	.item_titleAndTime .item_name{
		max-width: 3.05rem;
		height: 1.25rem;
		font-size: 0.75rem;
		color:#000;
		float:left;
		margin-right: 0.15rem;
		overflow:hidden;
        white-space:nowrap;
        text-overflow:ellipsis;
	}
	.item_content{
		height: 1.25rem;
		line-height: 1.25rem;
		overflow:hidden;
        white-space:nowrap;
        text-overflow:ellipsis;
	}
	.item_content span{
		font-size: 0.65rem;
	}

</style>


