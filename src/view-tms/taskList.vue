taskDetailShow<template>
    <div class="page" id="taskPage">
        <!-- Header -->
        <mt-header fixed title="任务列表"></mt-header>
        <div class="container-search" id="taskMysearchBox" style="height:5rem"> 
            <mysearch id="taskMysearchBox"
              :value.sync="searchVal"
              placeholder="请输入司机姓名/车牌号/手机号">
            </mysearch>
            <mt-navbar class="page-part" :selected.sync="selected">
                <mt-tab-item @click="changeType('wwc')" id="wwc">未完成</mt-tab-item>
                <mt-tab-item @click="changeType('ywc')" id="ywc">已完成</mt-tab-item>  
            </mt-navbar>
        </div>
        <div class="container-top" style="margin-bottom:3rem" id="taskListContainer"   v-infinite-scroll="loadMore()" infinite-scroll-immediate-check="false" infinite-scroll-disabled="loading" infinite-scroll-distance="50">

            <!-- taskList 下拉刷新组件 -->
            <mypulldown style="margin-top:5rem">
                <div slot= "pullList" :style = "{minHeight:listViewH + 'px'}">
                    <myorderdriver :options="taskList" title="task" ></myorderdriver>
                    <div class="noData">{{noTaskData}}</div>                     
                    <!-- 加载指示器 -->
                    <div class="sw-spinner" v-if="showLoadMore">
                        <mt-spinner type="snake" color="#FFD91E"></mt-spinner>
                    </div>
                </div>
            </mypulldown>
            
        </div>
        <!-- PDF文件 -->
        <mt-popup class="pdfPop" position="right" :visible.sync="pdfShow" :modal="false" popup-transition="popup-slide">
            <mt-header fixed title="装车清单">
                <mt-button icon="back" slot="left" @click="pdfShow = false"></mt-button>            
            </mt-header>
            <div class="container-top" id='pdfBox' style="overflow-x: auto;"> 
                <img style="width:200%" :src="pdfUrl"/>    
            </div>
        </mt-popup>

        <!-- 二维码弹出框 -->
        <mt-popup class="qrPop" :visible.sync="qrCodeShow">
            <div class="qrImgBox">
                <img class="qrImg" :src="qrCodeUrl"/>
            </div>   
        </mt-popup>

    </div>
</template>

<script>
// Ajax request module, return a Promise
import Tokens from '../token'
import  Mysearch  from '../components/mysearch'
import  Myorderdriver from '../components/myorderdriver'
import  Mypulldown from '../components/mypulldown'//引入下拉刷新的组件

export default {
    components: {
        Mysearch,
        Myorderdriver,
        Mypulldown
    },
    data () {
        return {
            listViewH:0,//下拉刷新框的最小高度
            isLoadId:null,//用来存储下拉刷新时带过来的id,初始设置为null,在数据加载完成后清除加载指示时

            beforeScrollTop:0,//存储页面当前scrollTop
            searchTimer:null,//搜索定时器
            userId:'',//driverId 默认为userId 
            sessionId:'',
            searchVal:'',//搜索框的值
            selected:'wwc', //被选中的tab标签
            searchNum:0,

            taskCurrPage:1,//任务列表当前页数
            loadMax:false,//任务列表是否加载到最大
            noTaskData:'',//任务列表没有数据或是加载完成的提示
            taskList:[],//任务列表
            loading:false,//任务列表是否已在进行无限加载
            showLoadMore:false,//任务列表是否显示加载指示器

            xqTaskList:[],//点击的任务详情数据
            pdfShow:false,//是否显示PDF文件
            pdfUrl:'',
            imgWidth:"100%",

            qrCodeShow:false,//二维码显示框
            qrCodeUrl:'',//二维码链接

            closeSocket:false,
            currTtId:'',
            datasource:'',
            subSystem:'',
            userId:'',
            publicHome_url:'',
            orgAdmin_url:'',
            curr_user_url:'',


        }
    },
    ready (){
        let self = this; 
        //列表框的最小高度
        self.$nextTick(()=>{
            self.listViewH = $("#taskListContainer").height() - $("#taskMysearchBox").height() -10;
        })
        //列表滚动时搜索框的显示和隐藏
        searchBoxIsShow('#taskListContainer','#taskMysearchBox',self.beforeScrollTop,function(top){
            self.beforeScrollTop = top;  
        });

    },
    events:{
        refreshList(id,topStatus){//下拉刷新时重置列表数据
            let self = this;
            self.isLoadId = id;
            setTimeout(() => {
                // self.taskList = [];
                self.taskCurrPage = 1;
                self.loadMax = false;
                self.noTaskData = '';
                self.getTaskList();
            }, 1000);
    
        },
        taskDetailShow(index,value,ttId,ttDriverId){//显示任务详情页面
            let self = this;

            //列表若有点击跳转事件，在下拉时阻止点击跳转
            let isStop = isXLorClick();
            if(isStop){
                //这里可以加入你阻止点击时的其它操作
                $(".myorderdriver").removeClass("active_border");
                return;
            }
            //设置到详情页面需要用的数据
            // Tokens.save("joinIndex",index);
            Tokens.save("allJoinSJ",'');

            Tokens.save("taskDetailId",'');
            Tokens.save("taskDetailId",ttId);
            Tokens.save("tdDriverId",'');
            Tokens.save("tdDriverId",ttDriverId);
            self.go('/taskDetail'); 
        },
        openPDF(ttId,trucklist){//PDF文件
            let self = this;
            //列表若有点击跳转事件，在下拉时阻止点击跳转
            let isStop = isXLorClick();
            if(isStop){
                $(".myorderdriver").removeClass("active_border");
                return;
            }
            let root = getRootURL();
            self.pdfUrl = root+'/rest/print/trucklist?ttId=' + ttId;
            self.pdfShow = true;
        },
        showQRcode(ttId){//显示二维码
            let self = this;
            let isStop = isXLorClick();
            if(isStop){
                $(".myorderdriver").removeClass("active_border");
                return;
            }
            self.currTtId = ttId;
            let root = getRootURL();
            let text = 'transfer|'+ ttId;
            text = encodeURIComponent(text);
            self.qrCodeUrl = root+'/rest/Qrcode/query?text=' + text + '&width=' + 140;
            self.qrCodeShow = true;
            self.closeSocket = false;
            exEntry_ws = null;
            self.exChatOpen();       
        }
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
                self.taskList = [];
                self.taskCurrPage = 1;
                self.loadMax = false;
                self.noTaskData = '';
                self.$Indicator.open();
                self.getTaskList(); 
            },1000);
        },

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
        imgSmallOrBig(){//放大或缩小清单图片
            let self = this;
            alert(self.imgWidth)
            if(self.imgWidth == '100%'){
               self.imgWidth = '200%'; 
            }else if(self.imgWidth == '200%'){
                self.imgWidth = '100%';
            }
        },
        changeType(type){  
            let self = this;
            self.selected = type;
            self.taskList = [];
            self.taskCurrPage = 1;
            self.loadMax = false;
            self.noTaskData = '';
            self.$Indicator.open();
            self.getTaskList();
        },
        loadMore () {//无限加载更多
            let self = this;
            let isStop = isXLorClick();
            if(isStop){return;}
            if(self.loading || self.loadMax || self.taskCurrPage <= 1){
                return;
            }else{
                self.loading = true;
                self.showLoadMore = true;
                setTimeout(function(){
                    self.getTaskList();
                },1000)
                
            }
      
        },
        getTaskList () {//获取任务
            let self = this;
            let s = {   action:"/tmTask/query",
                        sessionId:self.sessionId,
                        _secString:"gx,zc,th,sh,bxgm",
                        pageIndex:self.taskCurrPage,
                        pageSize:10,
                        params:{"ttDriverId":self.userId,btn:self.selected,findString:self.searchVal}
                    };
            self.loadMax = false;
            self.noTaskData = "";
            doAjaxQuery(s,function(data) {
                if(data.status == 0){
                    self.$transfer.backLogin(self, data);
                }else if(data.status == 1){  
                    let obj = data.dataset.rows;
                    if(obj && obj.length>0){
                        obj.forEach(function(item, index){
                            item.ttDriverLogo = getImgURL() +'user/' +item.ttDriverLogo;
                            var ImgObj = new Image(); 
                            ImgObj.src = item.ttDriverLogo; 
                            ImgObj.onerror = function(){
                                item.ttDriverLogo = getImgURL() + 'user/default.png';
                            }

                            item.subSystem = self.subSystem;
                            // 任务计数标题
                            if(item.ttStage == 'TH'){
                                item.taskTitle = ['全部','待提货','返回送达'];
                            }else if(item.ttStage == 'GX'){
                                item.taskTitle = ['全部','待装车','待卸车'];
                            }else{
                                item.taskTitle = ['全部','待装车','待送达'];
                            }

                            item.ttStartOrgName = item.ttStartCompanyName+"-"+item.ttStartOrgName + '　委派';
                            item.ttStage = item.ttStage == 'ZC'?'整':item.ttStage == 'TH'?'提':item.ttStage == 'GX'?'干':item.ttStage == 'SH'?'送':'';
                            item.ttStatus == parseInt(item.ttStatus);

                            if((item.tohId != '*') && (item.tohCode1 != '*')){
                                item.tohId = item.tohId + '/' +item.tohCode1; 
                            }else if((item.tohId != '*') && (item.tohCode1 = '*')){
                                item.tohId = item.tohId;
                            }else if((item.tohId = '*') && (item.tohCode1 = !'*')){
                                item.tohId = item.tohCode1;
                            }else{
                                item.tohId = '';
                            }

                            item.sdNum = '';

                        });

                        //判断是替换还是增加
                        if(self.taskCurrPage == 1){
                            self.taskList = obj;
                        }else{
                            self.taskList = self.taskList.concat(obj);
                        }    
                        //判断当前页是否是最后一页  
                        let maxRecord = parseInt(data.dataset.allRowCount);
                        if(self.taskList.length == maxRecord){
                            self.loadMax = true;
                            self.noTaskData = '已全部加载';
                        }
                        self.taskCurrPage++;

                    }else{
                        
                        self.loadMax = true;
                        if(self.taskCurrPage == 1){
                            self.taskList = [];
                            self.noTaskData = "没有相关数据"
                        }else{
                            self.noTaskData = '已全部加载';
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
        exChatOpen (){//建立Sock连接 监听二维码被扫描
            let self = this;
            self.curr_key1 = self.datasource + self.subSystem + self.userId;//当前用户的key1
            if(self.datasource=="dbcon"){//开发版
                self.publicHome_url = "/queue/publicqueue1_kf";
                self.orgAdmin_url = "/exchange/publicexchange_kf/"+self.currTtId;
            }else if(self.datasource=="dbtest"){
                self.publicHome_url = "/queue/publicqueue1_test";//测试版
                self.orgAdmin_url = "/exchange/publicexchange_test/"+self.currTtId;
            }else if(self.datasource=="dbtms"){
                self.publicHome_url = "/queue/publicqueue1";//正式版
                self.orgAdmin_url = "/exchange/publicexchange/"+self.currTtId;
            }
            self.curr_user_url = self.orgAdmin_url;

            exEntry_ws = new SockJS('http://120.27.145.36:15674/stomp');//建立连接
            client = Stomp.over(exEntry_ws);
            client.heartbeat.outgoing = 0;
            client.heartbeat.incoming = 0;
            self.subscribe = true;
            let on_connect = function(x) {
                let id = client.subscribe(self.curr_user_url, function(d) {
                    self.qrCodeShow = false;
                    self.$transfer.showToast(self, "扫码成功！");
                })    
            };//var on_connect   -----end
            let on_error =  function() {
                if(self.closeSocket==false){
                    window.setTimeout(function(){
                        self.exChatOpen();//连接失败，20秒后再次连接
                        }, 20000);
                }
            };
            client.connect('user', 'user', on_connect, on_error, '/'); 
        }

    },
    route: {
        data ({ from,to, next }) {  
            let self = this;
            //进入页面时token不存在
            if(!localStorage.getItem("token")){
                self.$transfer.backLogin(self, {info:'token没有值'});
                return;
            }
            
            let token = Tokens.fetch('token');
            self.sessionId = token["sessionId"];
            self.datasource = token['datasource'];
            self.subSystem = token['subSystem'];
            self.userId = token['userId'];
            self.isLoadId = null;

                        //判断从哪个页面进来重置数据

            if(from.path && from.path.indexOf('taskDetail') != -1 && self.taskList.length != 0){
                //查看是否执行了交接操作，判断是否要重更改列表数据
                    let allJoinSJ = Tokens.fetch("allJoinSJ");
                    if(self.subSystem == 'SJ' && ((self.selected=='wwc' && allJoinSJ=='YES') || (self.selected=='ywc' && allJoinSJ=='NO'))){
                        self.beforeScrollTop = 0;//初始进入页面时scroll的值为0
                        self.loading = false;//任务列表是否已在进行无限加载
                        self.showLoadMore = false;//任务列表是否显示加载指示器
                        self.taskCurrPage = 1;
                        self.loadMax = false;
                        self.noTaskData = '';
                        self.$Indicator.open(); 
                        self.getTaskList();
                        self.$nextTick(()=>{
                            $('#taskListContainer').animate({scrollTop:0},0); 
                        }) 
                    }else{
                        let preSrollTop = Tokens.fetch("taskListContainer");
                        self.beforeScrollTop = preSrollTop;
                        self.$nextTick(()=>{
                            $('#taskListContainer').animate({scrollTop:preSrollTop},0); 
                        })
                    }     
            }else{ 
                self.beforeScrollTop = 0;//初始进入页面时scroll的值为0
                self.searchNum = 0;
                self.searchVal = '';//搜索框的值
                self.selected = 'wwc'; //被选中的tab标签
                self.loading = false;//任务列表是否已在进行无限加载
                self.showLoadMore = false;//任务列表是否显示加载指示器
                self.taskList = [];
                self.taskCurrPage = 1;
                self.loadMax = false;
                self.noTaskData = '';
                self.$Indicator.open(); 
                self.getTaskList();
                self.$nextTick(()=>{
                    $('#taskListContainer').animate({scrollTop:0},0); 
                })  

            } 
            next()
        },
        deactivate ({ next }) {
            next()
        },
        canDeactivate({to, from, next}) {
            let self = this;
            self.$parent.$data.showBar = false;
            let scrollTop = $("#taskListContainer").scrollTop();
            Tokens.save("taskListContainer",scrollTop);
            if(exEntry_ws != null){ 
                self.closeSocket=true;
                exEntry_ws.close();
            } 
            $('#taskMysearchBox').slideDown();
            next();
        },
        activate({to, from, next}) {
            let self = this;
            let subSystem = localStorage.getItem("subSystem");
            if(subSystem){
                self.$parent.$data.subSystem = subSystem;
            }
            self.$parent.$data.showBar = true;
            self.$parent.$data.MainSelect = "taskList";
            next()
        } 
    }
}


</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    .pdfPop{
        width: 100%;height: 100%; background: #f7f7f7;z-index:18888;
    }
    .page-part{
        border-top:1px solid #e5e5e5;
        border-bottom:1px solid #e5e5e5;
    }
    .qrPop{
        padding:1rem;
        background: #fff;
        border-radius: 0.2rem;
    }
    .qrPop .qrImg{
        width:9rem;
        display: block;
    }

</style>

