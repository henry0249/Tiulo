<template>
    <div class="page"> 
        <mt-header fixed title="异常管理">
            <mt-button icon="back" slot="left" @click="backPage()"></mt-button>
        </mt-header>  
        <div class="container-top" id="orderExtremelyContainer" v-infinite-scroll="loadMore()" infinite-scroll-immediate-check="false" infinite-scroll-disabled="loading" infinite-scroll-distance="50">
            
            <mypulldown>
                <div slot= "pullList" :style = "{minHeight:listViewH + 'px'}">
                    <div class="exList_box_title">
                        <span style="float:left;">异常列表</span>
                        <mt-button size= "small" style="margin-top:0.3rem;float:right;background:#353535;color:#FFD91E;" @click = "listFqEx()">异常发起</mt-button>
                    </div>
                    <div class="ex_list">
                        <div class="ex_one" v-for="extremely in extremelyList">
                            <div class="ex_delete" @click.stop="deleteEx($index,extremely.texId)">删除</div>
                            <div class="ex_inner"  @click="openExDetail(extremely.texId)">
                                <!-- <span slot="icon" class="iconfont circle">&#xe618;</span> -->
                                <img class="ex_img" :src="extremely.createUserLogo">
                                <span v-if="extremely.teuNoReadCount > 0 && extremely.teuNoReadCount <= 99" class="badge">{{extremely.teuNoReadCount}}</span>
                                <span v-if="extremely.teuNoReadCount > 99" class="badge">99+</span>
                                <ul class="ex_content">
                                    <li><span>{{extremely.texCreateUser}}</span>  <span style="padding:0.2rem;border-radius:0.2rem;background:#eee;color:red;">{{extremely.texStatus == '0' ? '未处理' :extremely.texStatus == 'close' ? '已关闭' :extremely.texStatus == 'summed' ? '已总结' : '';}}</span></li>
                                    <li>主题：{{extremely.texTitle}}</li>
                                    <li>订单号：{{extremely.texOrderIds}}</li>
                                    <li>异常描述：{{extremely.texText}}</li>   
                                </ul>
                            </div>
                        </div>
                        <div class="noData">{{noExData}}</div> 
                        <!-- 加载指示器 -->
                        <div class="sw-spinner" v-if="showLoadMore">
                            <mt-spinner type="snake" color="#999"></mt-spinner>
                        </div>
                    </div>
                </div>
            </mypulldown>
        </div>    
    </div>
</template>

<script>
// Ajax request module, return a Promise
import Tokens from '../token'
import  Mypulldown from '../components/mypulldown'//引入下拉刷新的组件
export default {
    components: {
        Mypulldown
    },
    data () {
        return {
            isLoadId:null,
            listViewH:0,//下拉刷新框的最小高度
            ttdriverId:'',//driverId 默认为userId 
            sessionId:'',
            subSystem:'',
            tchOrderId:'',//异常的订单Id
            extremelyList:[],//异常列表
            currPage:1,//当前页面
            loading:false,//可以无限加载
            loadMax:false,//已全部加载
            showLoadMore:false,//显示加载标示
            exDetailData:[],//异常详情的数据 
            noExData:'',

        }
    },
    ready (){
        let self = this; 
        //列表框的最小高度
        self.$nextTick(()=>{
            self.listViewH = $("#orderExtremelyContainer").height() -10;
        })

    },
    events:{
        refreshList(id,topStatus){//下拉刷新时重置列表数据
            let self = this;
            self.isLoadId = id;
            setTimeout(() => {
                self.currPage = 1;
                self.loading = false;
                self.loadMax = false;
                self.showLoadMore = false;
                self.noExData = '';
                self.getExtremelyData();
            }, 1000);
    
        },
    },
    methods: {
        go (link, param) {
            let self = this
            self.$transfer.go(self, link, param)
        },
        back (link, param) {
            let self = this
            self.$transfer.back(self, link, param);
        },
        backPage(){//返回哪个页面
            let self = this;
            let backPath = Tokens.fetch("taskOrdertremelyBackPath");
            self.back(backPath);
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
                    self.getExtremelyData();
                },1000)
                       
            }       
        },
        getExtremelyData(){
            let self = this;
            let s = {   action:"/tmEx/query",
                        pageIndex:self.currPage,
                        pageSize:10,
                        params:{"texOrderIds":self.tchOrderId}
                    };
            doAjaxQuery(s,function(data) {
                if(data.status == 0){
                    self.$transfer.backLogin(self, data);
                }else if(data.status == 1){
                    let obj = data.dataset.rows;
                    if(obj && obj.length>0){
                        obj.forEach(function(item, index){
                            item.createUserLogo = getImgURL() +'user/' +item.createUserLogo;
                            var ImgObj = new Image(); 
                            ImgObj.src = item.createUserLogo; 
                            ImgObj.onerror = function(){
                                item.createUserLogo = getImgURL() + 'user/default.png';
                            }

                        });
                        if(self.currPage == 1){
                            self.extremelyList = obj;
                        }else{
                            self.extremelyList = self.extremelyList.concat(obj);
                        }
                        self.currPage++;

                        // 设置左滑效果
                        self.$nextTick(()=>{
                            setTimeout(function(){
                               self.$transfer.translationDel(".ex_inner");
                            },1000)
                        });
                        // 判断当前页是否是最后一页  
                        let maxRecord = parseInt(data.dataset.allRowCount);
                        if(self.extremelyList.length == maxRecord){
                            self.loadMax = true;
                            self.noExData = '已全部加载';
                        }

                    }else{
                        self.loadMax = true;
                        if(self.currPage == 1){
                            self.extremelyList = [];
                            self.noExData = "没有相关数据"
                        }else{
                            self.noExData = '已全部加载';
                        }
                    }
                    if(self.isLoadId){
                        self.$nextTick(()=>{
                            self.$broadcast('onTopLoaded', self.isLoadId); 
                            self.isLoadId = null;
                        }) 
                    }

                }
                self.$Indicator.close();
                self.showLoadMore = false;
                self.loading = false;
            });
        },
        listFqEx(){//异常管理页再发起异常
            let self = this;
            let isStop = isXLorClick();
            if(isStop){return;}
            self.$transfer.go(self, '/taskOrderAddExtremely',self.tchOrderId);
        },
        deleteEx(index,texId){//删除订单异常
            let self = this;
            let isStop = isXLorClick();
            if(isStop){return;}
            let orderIdsArr = self.extremelyList[index].texOrderIds.split(',');
            let orderList = Tokens.fetch("taskOrderList");

            self.$MessageBox.confirm('确定要删除这条异常?')
            .then(action => {
                let currPage = self.currPage - 1;
                let s = {action:'/tmEx/del/'+texId,
                         pageIndex:currPage,pageSize:10,saveQueryAction:"query",
                         params:{"texOrderIds":self.tchOrderId}
                        };
                self.$Indicator.open();
                doAjaxUpdate(s,function(data) {
                    if(data.status == 0){
                        self.$transfer.backLogin(self, data);
                    }else if(data.status == 1){
                        self.extremelyList.splice(index, 1);
                        //删除成功后，后台补回一条数据
                        let obj = data.retRows;
                        if(obj && obj.length>0){
                            obj.forEach(function(item, index){
                                item.createUserLogo = getImgURL() +'user/' +item.createUserLogo;
                                var ImgObj = new Image(); 
                                ImgObj.src = item.createUserLogo; 
                                ImgObj.onerror = function(){
                                    item.createUserLogo = getImgURL() + 'user/default.png';
                                }

                            });

                            self.extremelyList = self.extremelyList.concat(obj);
                            self.$nextTick(()=>{
                                setTimeout(function(){
                                   self.$transfer.translationDel(".ex_inner");
                                },1000)
                            });
                            // 判断当前页是否是最后一页  
                            let maxRecord = parseInt(data.retAllRowCount);
                            if(self.extremelyList.length == maxRecord){
                                self.loadMax = true;
                                self.noExData = '已全部加载';
                            }

                        }else{
                            self.noExData = '已全部加载';
                        }
                        let as = document.querySelectorAll('.ex_inner');
                        Array.from(as).forEach(function(item,index){
                            item.style.WebkitTransform = "translateX(" + 0 + "px)";
                        })
                        //是从订单列表页面进来  需要处理异常变色
                        for(var i=0;i<orderIdsArr.length;i++){
                            for(var k=0;k<orderList.length;k++){
                                if(orderIdsArr[i] == orderList[k].tohId){
                                    orderList[k].tohExId = orderList[k].tohExId.replace(texId+',','')
                                    if(!orderList[k].tohExId){
                                        orderList[k].tohExId = '*';
                                    }
                                    Tokens.save('taskOrderList',orderList);
                                }
                            }
                        }

                        if(self.extremelyList.length == 0){
                            self.$transfer.showToast(self, "没有异常记录");
                            setTimeout(function(){
                               self.backPage();
                            },1000)
                        }    
                    }
                    self.$Indicator.close(); 
                });              
            }).catch(function(){})  
        },
        openExDetail(texId){//查看异常详情
            let self = this;
            let isStop = isXLorClick();
            if(isStop){return;}
            self.$transfer.go(self, '/taskOrderExDetail',texId);  
        },

    },
    route: {
        data ({from, to, next }) {
            let self = this ;
            //进入页面时token不存在
            if(!localStorage.getItem("token")){
                self.$transfer.backLogin(self, {info:'token没有值'});
                return;
            }
            let token = Tokens.fetch("token");
            self.ttdriverId = token["userId"];
            self.sessionId = token["sessionId"];
            self.tchOrderId = Tokens.fetch("tchOrderId");
            self.subSystem = token["subSystem"];;
            self.noExData = '';
            self.extremelyList = [];//异常列表
            self.isLoadId = null;
            //需要返回的路径
            if(from.path && ((from.path.indexOf('taskDetail')!= -1) || (from.path.indexOf('traceList')!= -1) || (from.path.indexOf('orderManage')!= -1) || (from.path.indexOf('joinManage')!= -1) || (from.path.indexOf('joinTruckDetail')!= -1) || (from.path.indexOf('signManage')!= -1))){
                Tokens.save("taskOrdertremelyBackPath",'');
                Tokens.save("taskOrdertremelyBackPath",from.path);
            }
            self.$Indicator.open();
            self.currPage = 1;
            self.loading = false;
            self.loadMax = false;
            self.showLoadMore = false;
            self.noExData = '';
            self.getExtremelyData();

            next()
        },
        deactivate ({ next }) {
            //Triggers when component tchOrderId
            let as = document.querySelectorAll('.ex_inner');
            Array.from(as).forEach(function(item,index){
                item.style.WebkitTransform = "translateX(" + 0 + "px)";
            })
            next()
        },
        canDeactivate({to, from, next}) {
            let self = this;
            next()
        },
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.ex_list .ex_delete{
    width:100px;
    position:absolute;
    top:0.05rem;
    right:0.05rem;
    height:5rem;
    line-height:5rem;
    text-align:center;
    background:#353535;
    color:#FFD91E;
}
.ex_list .ex_inner{
    width:100%;
    background: #fff;
    padding:0.5rem 0.5rem 0.5rem 4.5rem;
    position: absolute;  
    top:0;
    left:0;
    height:5.2rem;
}
.ex_list .ex_img{
    position: absolute;
    top:1.05rem;
    left:0.5rem; 
    width:3rem;
    height:3rem; 
    border-radius: 0.5rem;
}
.ex_list .ex_content li{
    overflow:hidden;
    white-space:nowrap;
    text-overflow:ellipsis; 
}
.exList_box_title{
    padding:0 0.5rem;
    overflow:hidden;
    height:2.2rem;
    line-height:2.2rem;

}
.badge{
    min-width: 1rem;
    min-height: 1rem;
    line-height: 1rem;
    border-radius: 0.5rem;
    background: red;
    color:#fff;
    position: absolute;
    top:0.65rem;
    left:3rem;
    font-size: 0.5rem;
    text-align: center;
}

.ex_one{
   position: relative;
   height:5.2rem; 
   border-top:1px solid #e5e5e5;
   border-bottom:1px solid #e5e5e5;
   margin-bottom:0.3rem;
   overflow:hidden;
}

</style>
