<template>
	<div class="page">
		<mt-header fixed title="定位数据查询">
			<mt-button icon="back" slot="left" @click="back('/more')"></mt-button>
            <mt-button slot="right" @click="refresh()">
                <span style="color:#FFD91E;">刷新</span>
            </mt-button>
        </mt-header>
        <!-- <div class="container-search" id="searchBox"> 
            <mysearch
              :value.sync="searchVal"
              placeholder="根据地址进行查询">
            </mysearch>
        </div> -->
        <!--style="margin-top:2.8rem;"-->
        <div class="container-top">
			<div class="locationList" v-infinite-scroll="loadMore()" infinite-scroll-immediate-check="false" infinite-scroll-disabled="loading" infinite-scroll-distance="200">
				<div class="locationItem" v-for="row in locationList">
					<!-- 左滑删除 -->
					<div class="left_slider" @click.stop="delLocation($index, row.tgiId)">删除</div>
					<div class="left_lateral ">
						<!-- 时间 -->
						<div class="time_box">
							时间: {{ row.tgiCreateDate }}
						</div>
						<!-- 经纬度 -->
						<div class="longitudeAndlatitude">
							经度: <span>{{ row.tgiLongitude }}</span>&nbsp;&nbsp;
							纬度: <span>{{ row.tgiLatitude }}</span>
						</div>
						<!-- 地址 -->
						<div class="address_box">
							地址: <span>{{ row.tgiAddress }}</span>
						</div>
					</div>
				</div>
				<!-- 已全部加载 提示 -->
				<div style="text-align:center;margin:0.5rem 0;">{{noData}}</div>
				<!-- 加载指示器 -->
                <div class="sw-spinner" v-if="showLoadMore">
                    <mt-spinner type="snake" color="#FFD91E"></mt-spinner>
                </div>
			</div>
        </div>
	</div>
</template>

<script>
	import  Mysearch  from '../components/mysearch';
	import Tokens from '../token';
	export default {
		components: {
	        Mysearch
	    },
		//数据
		data() {
			return{
				//searchVal: "",//查询的value
				//timer: false,//是否执行搜索的定时器
				beforeScrollTop: 0,//存储页面当前scrollTop
            	scrollTimer: false,//是否执行滚动定时器

				locationList: [],//定位数据
	            noData: '',//没有数据
	            currPage: 1,//当前页面
	            loadMax: false,//是否加载到最大条数
	            showLoadMore: false,//加载指示器
	            loading: false,//是否在无限加载

	            interval: "",//setInterVal()
			}
		},
		//打开网页执行的方法(只执行一次)
		ready() {
			var self = this;
			//监控页面滚动时searchBox显示和隐藏
	        // $('.container-top').on('scroll',function(){
	        //     if(!self.scrollTimer){
	        //         self.scrollTimer = true;
	        //         setTimeout(function(){
	        //             let afterScrollTop = $('.container-top').scrollTop();
	        //             let distance = afterScrollTop - self.beforeScrollTop;
	        //             if(distance > 56){
	        //                 $('#searchBox').slideUp(150);
	        //                 $('.container-top').animate({marginTop:0},0);
	        //             }else if(distance < -50){
	        //                 $('#searchBox').slideDown(150);
	        //                 $('.container-top').animate({marginTop:56},0);
	        //             }
	        //             self.beforeScrollTop = afterScrollTop;
	        //             self.scrollTimer = false;
	        //         },500);
	        //     }
	        // }); 
		},
		//内容改变时调用
		watch: {
			//搜索内容改变执行此方法
	        // 'searchVal': function(){
	        //     let self = this;
	        //     //设置延迟执行
	        //     if(!self.timer){
	        //         self.timer = true;
	        //         setTimeout(function(){
	        //         	self.locationList = [];
	        //             self.currPage = 1;
	        //             self.loadMax = false;
	        //             self.noData = '';
	        //             self.$Indicator.open();
	        //             //查询方法
	        //             self.getLocationData();
	        //             self.timer = false;
	        //         }, 500);
	        //     }
	        // }
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
	                    self.getLocationData();       
	                }
	            }
	        },
			//刷新
			refresh(){
				var self = this;
				self.locationList = [];
                self.noData = '';
                self.currPage = 1;
                self.loadMax = false;
                self.showLoadMore = false;
                self.loading = false;
				self.getLocationData();
			},
			//删除
			delLocation(index, id){
				var self = this;
				var jsonData = { action: "/tmGpsInfo/del/" + id };
				doAjaxUpdate(jsonData, function(data){
					if(data.status == 1){
						//数据库删除之后, 删除页面上的数据
	                    self.locationList.splice(index, 1);
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
			//获取定位数据
			getLocationData(){
				var self = this;
				self.$Indicator.open();
				var jsonData = {
					action: "/tmGpsInfo/query",
					pageSize: 15,
					pageIndex: self.currPage,//当前页
					params: {
						tgiMobile: Tokens.fetch('token')['userMobile'],//手机号
						//tgiMobile: '13971571628',
						//findString: self.searchVal,
					}
				};
				doAjaxQuery(jsonData, function(data){
					//console.log(JSON.stringify(data, null, 4));
					if(data.status == 1){//如果执行成功
						var obj = data.dataset.rows;
						if(obj && obj.length > 0){
							obj.forEach(function(item, index){
	                            item.tgiCreateDate = item.tgiCreateDate.substr(0, 20);//去掉毫秒数
	                        });

							//判断是替换还是增加
	                        if(self.currPage == 1){
	                            self.locationList = obj;
	                        }else{
	                            self.locationList = self.locationList.concat(obj);
	                        } 
	                        //判断当前页是否是最后一页  
	                        let maxRecord = parseInt(data.dataset.allRowCount);
	                        if(self.locationList.length >= maxRecord){
	                            self.loadMax = true;
	                            self.noData = '已全部加载';
	                        }
						}else{//没有数据
							self.locationList = [];
                        	self.noData = "没有相关数据";
						}

                        //断网时退出页面关闭加载提示框
						setTimeout(function(){
							self.$Indicator.close();
						}, 500);

						//item左滑功能
                        self.$nextTick(()=>{
                            setTimeout(function(){
                               self.$transfer.translationDel(".left_lateral");
                            },1000)
                        });
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
	            self.$Indicator.close();
	            window.clearInterval(self.interval);
	            self.$transfer.back(self, link, param);
	        }
		},
		route: {
			//方法在这里执行, 每次打开页面都会执行一次
	        data ({ from, to, next }) {
	        	var self = this;
	        	self.locationList = [];//列表
                self.noData = '';//没有数据
                self.currPage = 1;//当前页面
                self.loadMax = false;//是否加载到最大条数
                self.showLoadMore = false;//加载指示器
                self.loading = false;//是否在无限加载

	        	//得到所有定位数据
	        	self.getLocationData();

	        	self.interval = setInterval(function(){
	            	self.refresh();
	            }, 25000);

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
	.locationList{
		padding-bottom: 2.5rem;
	}
	.locationItem{
		width: 100%;
		height: 3.8rem;
		background: #fff;
	}
	.left_slider{
        width: 5rem;
        height: 3.75rem;
        line-height: 3.75rem;
        text-align: center;
        background: #DD524D;
        color: #fff;
        position: absolute;
        right: 0;
    }
    .left_lateral{
        width: 100%;
        height: 3.8rem;
        padding-left: 0.5rem;
		padding-right: 0.5rem;
        position: absolute;
        left: 0;
        background: #fff;
        border-bottom: 1px solid #ddd;
    }
	.locationItem .longitudeAndlatitude{
		height: 1.25rem;
		/*background: #ccc;*/
	}
	.locationItem .time_box{
		height: 1.25rem;
		/*background: #bbb;*/
	}
	.locationItem .address_box{
		height: 1.25rem;
		/*background: #aaa;*/
		overflow:hidden;
        white-space:nowrap;
        text-overflow:ellipsis;
	}
</style>

