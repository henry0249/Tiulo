<template>
    <div class="page" id="truckPage">
        <!-- Header -->
        <mt-header fixed title="车辆管理">
            <mt-button icon="back" slot="left" @click="back('/more')"></mt-button>
            <mt-button slot="right" @click="addtruck()">  
                <span >新增</span>
            </mt-button>
        </mt-header>
        <div class="container-search" id="truckMysearchBox"> 
            <mysearch
              :value.sync="searchVal"
              placeholder="请输入司机姓名/车牌号/手机号">
            </mysearch>   
        </div>
        <!-- truckList -->
        <div class="container-top" id="truckListContainer" v-infinite-scroll="loadMore()" infinite-scroll-immediate-check="false" infinite-scroll-disabled="loading" infinite-scroll-distance="50">
            <!-- 车辆列表 -->
            <mypulldown style="margin-top:2.8rem">
                <div slot= "pullList" :style = "{minHeight:listViewH + 'px'}">
                    <div style="position:relative;height:4rem;" v-for="Truck in truckList">
                        <div class="deleteCard" @click.stop="deleteTruck($index)">删除</div>
                        <div class="truck" @click.stop="truckDetail($event,$index)">
                            <img class="headPic" :src="Truck.trkLogo">
                            <div class="truck_content">
                                <div>
                                    {{Truck.trkDriverName}}
                                    <span v-if="Truck.trkDriverSex == '男'" style="color:#81ADFC" slot="icon" class="iconfont">&#xe60b;</span>
                                    <span v-if="Truck.trkDriverSex == '女'" style="color:#FD626E" slot="icon" class="iconfont">&#xe60d;</span>
                                </div>
                                <ul class="cAndm">
                                    <li>{{Truck.trkCode}}</li>
                                    <li>
                                        <div><span style="color:#FFD91E" slot="icon" class="iconfont">&#xe60e;</span>{{Truck.trkDriverMobile}}</div>
                                    </li>
                                </ul>

                            </div>

                        </div>
                    </div>
                    <div class="noData">{{noData}}</div>                               
                    <!-- 加载指示器 -->
                    <div class="sw-spinner" v-if="showLoadMore">
                        <mt-spinner type="snake" color="#999"></mt-spinner>
                    </div>
                </div>
            </mypulldown>
        </div>

    </div>
</template>

<script>
// Ajax request module, return a Promise
import Tokens from '../token'
import * as actions from '../vuex/actions'
import  Mysearch  from '../components/mysearch'
import  Mypulldown from '../components/mypulldown'//引入下拉刷新的组件
export default {
    vuex: {
        actions: {
            setList: actions.setList,
            addList: actions.addList,
            deleteList: actions.deleteList,
        },
        getters: {
            truckList: state => state.truckList,
        }
    },
    components: {
        Mysearch,
        Mypulldown
    },
    data () {
        return {
            isLoadId:null,  
            listViewH:0,//下拉刷新框的最小高度
            ttdriverId:'',
            sessionId:'',
            trkOrgId:'',
            subSystem:'',
            searchTimer: false,//是否执行搜索的定时器
            searchVal:'',//查询的val
            // truckList:[],//列表数据
            currPage:1,//当前页面
            noData:'',//加载没有数据 
            loading:false,//可以无限加载
            loadMax:false,//已全部加载
            showLoadMore:false,//显示加载标示
            beforeScrollTop:0,//存储页面当前scrollTop
        }
    },
    ready (){
        let self = this;
        //列表框的最小高度
        self.$nextTick(()=>{
            self.listViewH = $("#truckListContainer").height() - $("#truckMysearchBox").height() - 10;
        })
        searchBoxIsShow('#truckListContainer','#truckMysearchBox',self.beforeScrollTop,function(top){
            self.beforeScrollTop = top;  
        })
    },
    events:{
        refreshList(id,topStatus){//下拉刷新时重置列表数据
            let self = this;
            self.isLoadId = id;
            setTimeout(() => {
                self.currPage = 1;
                self.noData = '';
                self.loading = false;
                self.loadMax = false;
                self.showLoadMore = false;
                self.getTruckData();
            }, 1000);
    
        },
    },
    watch:{
        //搜索内容改变执行此方法
        'searchVal': function(){
            let self = this;
            if(self.searchNum == 0){//刚进来重置searchVal不执行搜索
                self.searchNum++;
                return;
            } 
            //设置延迟执行
            clearInterval(self.searchTimer);
            self.searchTimer = setTimeout(function(){
                // self.truckList = [];
                self.currPage = 1;
                self.noData = '';
                self.loading = false;
                self.loadMax = false;
                self.showLoadMore = false;
                self.getTruckData();
            },1000);

        }
    },
    methods: {
        go(link, param) {
            let self = this
            self.$transfer.go(self, link, param)
        },
        back(link, param) {
            let self = this
            self.$transfer.back(self, link, param);
        },
        loadMore(){//无限加载更多
            let self = this;
            let isStop = isXLorClick();
            if(isStop){return;}
            if(self.loading || self.loadMax || self.currPage <= 1){
                return;                               
            }else{
                self.loading = true;
                self.showLoadMore = true;
                setTimeout(function(){
                    self.getTruckData();
                },1000)
                       
            }       
        },
        searchFun(){//查询
            let self = this;
            self.currPage = 1;
            self.getTruckData();
        },
        getTruckData(){//获取车辆列表信息
            let self = this;
            let s = {   action:"/truck/query",
                        pageIndex:self.currPage,
                        pageSize:10,
                        params:{trkOrgId:self.trkOrgId,findString:self.searchVal}
                    };
            if(self.subSystem== 'SJ'){
                s.params.trkDriverId = self.ttdriverId;
            }
            s.showFiles = 'rowId,trkCode, ttDriverLogo,trkDriverMobile,trkDriverName,trkDriverSex,trkId,trkLength,trkLogo,trkModifyDate';
            self.loadMax = false;
            self.noData = "";

            doAjaxQuery(s,function(data) {
                if(data.status == 0){
                    self.$transfer.backLogin(self, data);
                }else if(data.status == 1){
                    let obj = data.dataset.rows;
                    if(obj && obj.length>0){
                        obj.forEach(function(item, index){
                            item.trkLogo = getImgURL() +'user/' +item.trkLogo;
                            var ImgObj = new Image(); 
                            ImgObj.src = item.trkLogo; 
                            ImgObj.onerror = function(){
                                item.trkLogo = getImgURL() + 'user/default.png';
                            }
                            
                        });
                        if(self.currPage == 1){
                            // self.truckList = obj;
                            self.setList("truckList",obj);
                        }else{
                            // self.truckList = self.truckList.concat(obj);
                            self.addList("truckList",obj);
                        }       

                        self.$nextTick(()=>{
                            setTimeout(function(){
                               self.$transfer.translationDel(".truck");
                            },1000)
                        });
                        // 判断当前页是否是最后一页  
                        let maxRecord = parseInt(data.dataset.allRowCount);
                        if(self.truckList.length == maxRecord){
                            self.loadMax = true;
                            self.noData = '已全部加载';
                        }
                        self.currPage++;

                    }else{
                        self.loadMax = true;
                        if(self.currPage == 1){
                            self.setList("truckList",[]);
                            self.noData = "没有相关数据"
                        }else{
                            self.noData = '已全部加载';
                        }
                    }
                    self.$Indicator.close();
                    if(self.isLoadId){
                        self.$nextTick(()=>{
                            self.$broadcast('onTopLoaded', self.isLoadId); 
                            self.isLoadId = null;
                        }) 
                    }
                }

                self.showLoadMore = false;
                self.loading = false;

            });
        },
        deleteTruck(key){//删除车辆
            let self = this;
            let trkId = self.truckList[key].trkId;
            let currPage = self.currPage - 1;
            let s = {action:'/truck/del/'+trkId,
                     pageIndex:currPage,
                     pageSize:10,
                     saveQueryAction:"query",
                     params:{trkOrgId:self.trkOrgId,findString:self.searchVal}
                    };
            if(self.subSystem== 'SJ'){
                s.params.trkDriverId = self.ttdriverId;
            }
            self.$Indicator.open();
            doAjaxUpdate(s,function(data) {
                if(data.status == 0){
                    self.$transfer.backLogin(self, data);
                }else if(data.status == 1){
                    self.deleteList("truckList",key)
                    console.log(data)
                    let obj = data.retRows;
                    if(obj && obj.length>0){
                        obj.forEach(function(item, index){
                            item.trkLogo = getImgURL() +'user/' +item.trkLogo;
                            var ImgObj = new Image(); 
                            ImgObj.src = item.trkLogo; 
                            ImgObj.onerror = function(){
                                item.trkLogo = getImgURL() + 'user/default.png';
                            }
                            
                        });

                        self.addList("truckList",obj);
                        self.$nextTick(()=>{
                            setTimeout(function(){
                               self.$transfer.translationDel(".truck");
                            },1000)
                        });
                        //判断当前页是否是最后一页  
                        let maxRecord = parseInt(data.retAllRowCount);
                        if(self.truckList.length == maxRecord){
                            self.loadMax = true;
                            self.noData = '已全部加载';
                        }

                    }else{
                        self.noData = '已全部加载';
                    }

                    let as = document.querySelectorAll('.truck');
                    Array.from(as).forEach(function(item,index){
                        item.style.WebkitTransform = "translateX(" + 0 + "px)";
                    })

                }

                self.$Indicator.close(); 
               
            });
        },
        addtruck(){//去新增车辆
            let self = this;
            $(".truck").removeClass("active_border");
            Tokens.save("truckDetailData",'')
            self.go("/truckDetail")
        },
        truckDetail(e,index){//查看车辆详情
            let self = this;
            //防止页面滑动时跳转到详情页
            let isStop = isXLorClick();
            if(isStop){return;}
            //跳转
            let el = e.target;
            let truck = $(el).hasClass("truck") ? $(el) : $(el).parents('.truck');

            $(".truck").removeClass("active_border");
            truck.addClass("active_border");
            self.truckList[index].trkIndex = index;
            Tokens.save("truckDetailData",self.truckList[index]);
            self.go("/truckDetail")
        }
    },
    route: {
        data ({from, to, next }) {
            let self = this;
            //进入页面时token不存在
            if(!localStorage.getItem("token")){
                self.$transfer.backLogin(self, {info:'token没有值'});
                return;
            }
            let token = Tokens.fetch("token");
            self.ttdriverId = token["userId"];
            self.sessionId = token["sessionId"];
            self.trkOrgId = token["orgId"];
            self.subSystem = token["subSystem"];
            self.isLoadId = null;
            if(!from.path || from.path.indexOf('/more') != -1 || (from.path.indexOf('/truckDetail') != -1 && self.truckList.length == 0) || (from.path.indexOf('/truckDetail') != -1 && Tokens.fetch("isAddTruck")=='YES')){ 
                self.beforeScrollTop = 0;//初始进入页面时scroll的值为0
                self.currPage = 1;//当前页面
                self.noData = '';//加载没有数据 
                self.loading = false;//可以无限加载
                self.loadMax = false;//已全部加载
                self.showLoadMore = false;//显示加载标示 
                self.searchVal = '';
                self.searchNum = 0; 
                self.$Indicator.open();  
                self.getTruckData();
                self.$nextTick(()=>{
                    $('#truckListContainer').animate({scrollTop:0},0); 
                }) 
            }else{
                let preSrollTop = Tokens.fetch("truckListContainer");
                self.beforeScrollTop = preSrollTop;
                self.$nextTick(()=>{
                    $('#truckListContainer').animate({scrollTop:preSrollTop},0); 
                }) 
            }
            self.$nextTick(()=>{
                setTimeout(function(){
                   self.$transfer.translationDel(".truck");
                },1000)
            }); 
            next()
        },
        deactivate ({ next }) {
            let as = document.querySelectorAll('.truck');
            Array.from(as).forEach(function(item,index){
                item.style.WebkitTransform = "translateX(" + 0 + "px)";
            })
            next()
        },
        canDeactivate({to, from, next}) {
            let self = this;
            let scrollTop = $("#truckListContainer").scrollTop();
            Tokens.save("truckListContainer",scrollTop);
            $('#truckMysearchBox').slideDown();
            next()
        },
        activate({to, from, next}) {
            let self = this
            next()
        }
    }
}


</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
/*.truckList{
    border-top:1px solid #e5e5e5;
}*/
.truck{
    overflow: hidden;
    padding:0.5rem 0.5rem 0.5rem 4.5rem;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4rem;
    border-bottom: 1px solid #e5e5e5;
    background: #fff;
}
.truck .headPic{
    position: absolute;
    top:0.5rem;
    left:0.5rem;
    width:3rem;
    height:3rem;
    display: block;
    border-radius: 0.3rem;
}
.truck .iconfont{
    font-size:0.75rem;
    padding:0.3rem;
}
.cAndm li{
    float:left;
    width:50%;
}
.deleteCard{
    color: #FFD91E;
    background: #353535;
    position: absolute;
    top: 0.05rem;
    right: 1px;
    text-align: center;
    width: 100px;
    height:3.9rem;
    line-height: 3.9rem;
} 
.truck_content {
    line-height: 1.5rem;
}
.active_border{
    border-top:1px solid #FFD91E;
    border-bottom:1px solid #FFD91E;
}
</style>

