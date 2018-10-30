<template>
	<div class="page">
		<mt-header fixed title="业务提醒">
			<mt-button icon="back" slot="left" @click="back('/tiulo')"></mt-button>
            <!-- <mt-button slot="left" @click="back('/tiulo')">
                <span class="iconfont leftIcon">&#xe663;</span>
            </mt-button> -->
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
					<div class="msgList">
						<div class="msgItem" v-for="row in allOrders" orderId="{{row.tiuloId}}">
							<!-- 左滑删除 -->
							<div class="left_slider" @click.stop="delOrder($index, row.tiuloId)">删除</div>
							<div class="left_lateral" @click.stop="goTaskDetail(row.ttId)">
								<div class="msgItem_top">
									<!-- 点 -->
									<div class="isNewOrder">
										<!-- 0未读-黄点 -->
										<span v-if="row.tiuloStatus=='0'" style="background:#FFD400;"></span>
										<!-- 1已读-灰点 -->
										<span v-if="row.tiuloStatus=='1'" style="background:#aaa;"></span>
									</div>
									<!-- 时间 -->
									<div class="orderDate">
										<p>{{ row.tiuloCreateDate }}</p>
									</div>
									<!-- 内容 -->
									<div class="mesgItem_content">
										<p>{{{ row.tiuloTitle }}}</p>
									</div>
								</div>
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
		    </mypulldown>
        </div>
	</div>
</template>

<script>
	import  Mysearch  from '../components/mysearch';
	import  Mypulldown from '../components/mypulldown'//引入下拉刷新的组件
	import Tokens from '../token';
	export default {
		components: {
	        Mysearch,
	        Mypulldown
	    },
		//数据
		data() {
			return{
				searchVal: "",//查询的val
				timer: false,//是否执行搜索的定时器
				beforeScrollTop: 0,//存储页面当前scrollTop
            	scrollTimer: false,//是否执行滚动定时器

				allOrders: [],//所有的业务订单
				noData: '',//没有数据
	            currPage: 1,//当前页面
	            loadMax: false,//是否加载到最大条数
	            showLoadMore: false,//加载指示器
	            loading: false,//是否在无限加载

	            userId: "",//用户id

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
	                self.getAllOrders();//获取列表数据
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
	                	self.allOrders = [];
	                    self.currPage = 1;
	                    self.loadMax = false;
	                    self.noData = '';
	                    self.$Indicator.open();
	                    self.getAllOrders();
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
	            if(self.loading){
	                return;
	            }else{
	                if(self.loadMax){
	                    return;                       
	                }else{
	                    self.loading = true;
	                    self.currPage++;
	                    self.showLoadMore = true;
	                    self.getAllOrders();  
	                }
	            }
	        },
	        goTaskDetail(ttId){//查看任务详情
	        	//ttId是tiuloTaskId, ttDriverId是tiuloRecvOrgId
	        	let self = this;
	        	//列表若有点击跳转事件，在下拉时阻止点击跳转
	            if(isXLorClick()){
	                return;
	            }
	        	// alert("ttId: " + ttId);
	        	if(ttId && ttId !='*' && ttId !='**'){
	        		Tokens.save("taskDetailId",'');
		            Tokens.save("taskDetailId",ttId);
		            Tokens.save("tdDriverId",'');
            		Tokens.save("tdDriverId",'*');
		            self.$transfer.go(self, '/taskDetail');
	        	}  
	        },
			//删除
			delOrder(index, id){
				var self = this;
				self.$MessageBox.confirm('您确定删除这条记录吗？',{title: "操作提示"}).then(action => {
					var jsonData = { 
						action: "/cmsTiulo/del/"+id,
						saveQueryAction: "query",
						pageSize: 30,
						pageIndex: self.currPage,//当前页
						params: {
							tiuloRecvUserId: self.userId,
							tiuloSubSystem: Tokens.fetch('token')['subSystem'],
							opType: "YWTX",
							tiuloRecvOrgId: Tokens.fetch('token')['orgId'],
							findString: self.searchVal
						}
					};
					doAjaxUpdate(jsonData, function(data){
						//console.log(JSON.stringify(data, null, 4));
						if(data.status == 1){
							//数据库删除之后, 删除页面上的数据
	                        self.allOrders.splice(index, 1);
	                        //删除成功后，后台补回一条数据
                        	let obj = data.retRows;
                        	if(obj && obj.length > 0){
                        		obj.forEach(function(item, index){
		                            item.tiuloCreateDate = item.tiuloCreateDate.substring(0, 19);//计算过后的时间
	                            	item.ttId = item.tiuloTaskId;
		                        });
		                        self.allOrders = self.allOrders.concat(obj);
                        	}
						}else if(data.status == 0){
							self.$transfer.backLogin(self, data);
						}
					});
				});
			},
			//获取所有订单信息
			getAllOrders(){
				var self = this;
				var jsonData = {
					action: "/cmsTiulo/query",
					pageSize: 30,
					pageIndex: self.currPage,//当前页
					//"{"opType":"YWTX","tiuloRecvUserId":"00094","tiuloSubSystem":"TMS","tiuloRecvOrgId":"ZBMR"}"
					params: {
						tiuloRecvUserId: self.userId,
						tiuloSubSystem: Tokens.fetch('token')['subSystem'],
						opType: "YWTX",
						tiuloRecvOrgId: Tokens.fetch('token')['orgId'],
						findString: self.searchVal
					}
				};
				//console.log("params: " + JSON.stringify(jsonData.params));
				doAjaxQuery(jsonData, function(data){
					//console.log(JSON.stringify(data, null, 4));
					//console.log(JSON.stringify(data.dataset.rows, null, 4));
					if(data.status == "1"){
						var obj = data.dataset.rows;
						//console.log(obj)
						if(obj && obj.length > 0){
							//处理创建时间
	                        obj.forEach(function(item, index){
	                            item.tiuloCreateDate = item.tiuloCreateDate.substring(0, 19);//计算过后的时间
                            	item.ttId = item.tiuloTaskId;
	                        });
	                        //判断是替换还是增加
	                        if(self.currPage == 1){
	                            self.allOrders = obj;
	                        }else{
	                            self.allOrders = self.allOrders.concat(obj);
	                        } 
	                        //判断当前页是否是最后一页  
	                        let maxRecord = parseInt(data.dataset.allRowCount);
	                        if(self.allOrders.length >= maxRecord){
	                        //if(self.allOrders.length >= maxRecord || data.dataset.rows.length == 0){
	                            self.loadMax = true;
	                            self.noData = '已全部加载';
	                        }

						}else{
                        	self.loadMax = true;
	                        if(self.currPage == 1){
	                            self.allOrders = [];
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
            orderCreateDate(_date){//_date格式2016-12-02 10:34:51 426
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
	            
	        	var tokens = Tokens.fetch('token');
	        	self.userId = tokens['userId'];

	        	if(from.path && (from.path.indexOf('taskDetail') != -1)){
	        		//取出跳转前的页面位置并设置
	                self.beforeScrollTop = Tokens.fetch("opMsgList_pageLocation");
	                self.$nextTick(()=>{
	                    $('.container-top').animate({scrollTop: self.beforeScrollTop},0); 
	                });
	        	}else{
	        		self.allOrders = [];//列表
	                self.noData = '';//没有数据
	                self.currPage = 1;//当前页面
	                self.loadMax = false;//是否加载到最大条数
	                self.showLoadMore = false;//加载指示器
	                self.loading = false;//是否在无限加载
	                self.beforeScrollTop = 0;//初始进入页面时scroll的值为0

		        	self.getAllOrders();
	        	}

	            next();
	        },
	        deactivate ({ next }) {
	        	let as = document.querySelectorAll('.left_slider');
                Array.from(as).forEach(function(item,index){
                    item.style.WebkitTransform = "translateX(" + 0 + "px)";
                });

                //存储页面的位置
                Tokens.save("opMsgList_pageLocation", $(".container-top").scrollTop());
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
	.msgItem{
		width: 100%;
		border-bottom: 1px solid #ddd;
		height: 71px;
	}
	.msgItem .left_slider{
        width: 5rem;
        height: 70px;
        line-height: 70px;
        text-align: center;
        background: #DD524D;
        color: #fff;
        position: absolute;
        right: 0;
    }
    .msgItem .left_lateral{
        width: 100%;
        height: 70px;
        padding-left: 0.5rem;
		padding-right: 0.5rem;
		padding-bottom: 0.15rem;
        position: absolute;
        left: 0;
        background: #fff;
    }
	.msgItem:last-child{
		/*border-bottom: 0;*/
	}
	.msgItem_top{
		height: 2.5rem;
		padding-top: 0.2rem;
	}
	.msgItem_top div{
		float: left;
	}
	.msgItem_top .isNewOrder{
		/*background: #ccc;*/
	}
	.msgItem_top .isNewOrder span{
		width: 0.8rem;
		height: 0.8rem;
		margin-top: 1.1rem;
		border-radius: 50%;
		display: block;
	}
	.orderDate{
		height: 1.05rem;
		width: 92%;
		margin-left: 0.25rem;
	}
	.orderDate p{
		overflow:hidden;
	    white-space:nowrap;
	    text-overflow:ellipsis;
	}
	.msgItem_top .mesgItem_content{
		width: 92%;
		height: 42px;
		margin-left: 0.25rem;
	    text-align: left;
	    overflow:hidden;
	    /*background: #ccc;*/
	}
	.msgItem_top .mesgItem_content p{
		/*overflow:hidden;
	    white-space:nowrap;
	    text-overflow:ellipsis;*/
	}

</style>


