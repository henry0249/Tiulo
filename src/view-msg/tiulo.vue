<template>
    <div class="page" @click="listShow = false">
        <div class="mint-header">
            <div class="hcontent mint-header-title">
                <span style="padding:0.5rem">
                    推流
                </span>       
            </div>
            <div class="hright" @click.stop="listShow = !listShow" style="display:none;">
                <span slot="icon" class="iconfont">&#xe65c;</span>
            </div>
        </div>
        <div class="container-top" style="margin-bottom:3rem;">
            <mypulldown>
                <div slot= "pullList" :style = "{minHeight:listViewH + 'px'}">
                    <!-- 异常信息 -->
                    <div class="plate " @click="go('/exceptionList')"> 
                        <div class="pic_box" style="background:;">
                            <span style="font-size:2.2rem;line-height:3.3rem;" slot="icon" class="iconfont">&#xe80e;</span>
                            <span v-if="yc_badge>0&&yc_badge<=99" class="badge">{{ yc_badge }}</span>
                            <span v-if="yc_badge>99" class="badge">99+</span>
                        </div>
                        <div class="titleAndTime">
                            <span class="plate_title" style="font-size:0.8rem;color:#000;">异常信息</span>
                            <span class="time_box">{{ yc_date }}</span>
                        </div>
                        <div class="content_box">
                            <p>{{ yc_content }}</p>
                        </div>
                    </div> 
                    <!-- 业务提醒 -->
                    <div class="plate " @click="go('/opMsgList')" id="opMsgList">
                        <div class="pic_box">
                            <span style="font-size:2.2rem;" slot="icon" class="iconfont">&#xe639;</span>
                            <span v-if="yw_badge>0&&yw_badge<=99" class="badge">{{ yw_badge }}</span>
                            <span v-if="yw_badge>99" class="badge">99+</span>
                        </div>
                        <div class="titleAndTime">
                            <span class="plate_title" style="font-size:0.8rem;color:#000;">业务提醒</span>
                            <span class="time_box">{{ yw_date }}</span>
                        </div>
                        <div class="content_box">
                            <p>{{ yw_content }}</p>
                        </div>
                    </div> 
                    <!-- 收付款提醒(运力版和司机版显示) -->
                    <div v-if="subSystem=='TMS'||subSystem=='SJ'" class="plate" @click="go('/accountMsgList', 'SF')"> 
                        <div class="pic_box">
                            <span style="font-size:2.2rem;" slot="icon" class="iconfont">&#xe63a;</span>
                            <span v-if="zd_badge>0&&zd_badge<=99" class="badge">{{ zd_badge }}</span>
                            <span v-if="zd_badge>99" class="badge">99+</span>
                        </div>
                        <div class="titleAndTime">
                            <span class="plate_title" style="font-size:0.8rem;color:#000;">收付款提醒</span>
                            <span class="time_box">{{ zd_date }}</span>
                        </div>
                        <div class="content_box">
                            <p>{{ zd_content }}</p>
                        </div>
                    </div>
                    <!-- 审核提醒(运力版和企业版显示) -->
                    <div v-if="subSystem=='TMS'||subSystem=='KF'" class="plate" @click="go('/accountMsgList', 'SH')">
                        <div class="pic_box">
                            <span style="font-size:2.2rem;" slot="icon" class="iconfont">&#xe665;</span>
                            <span v-if="sh_badge>0&&sh_badge<=99" class="badge">{{ sh_badge }}</span>
                            <span v-if="sh_badge>99" class="badge">99+</span>
                        </div>
                        <div class="titleAndTime">
                            <span class="plate_title" style="font-size:0.8rem;color:#000;">审核提醒</span>
                            <span class="time_box">{{ sh_date }}</span>
                        </div>
                        <div class="content_box">
                            <p>{{ sh_content }}</p>
                        </div>
                    </div>
                    <!-- 系统提醒 -->
                    <div class="plate " @click="go('/sysMsgList')"> 
                        <div class="pic_box">
                            <span style="font-size:2.2rem;" slot="icon" class="iconfont">&#xe72f;</span>
                            <span v-if="xt_badge>0&&xt_badge<=99" class="badge">{{ xt_badge }}</span>
                            <span v-if="xt_badge>99" class="badge">99+</span>
                        </div>
                        <div class="titleAndTime">
                            <span class="plate_title" style="font-size:0.8rem;color:#000;">系统提醒</span>
                            <span class="time_box">{{ xt_date }}</span>
                        </div>
                        <div class="content_box">
                            <p>{{ xt_content }}</p>
                        </div>
                    </div>

                    <!-- 公告 -->
                    <div class="plate " @click="go('/noticeList')"> 
                        <div class="pic_box">
                            <span style="font-size:2.2rem;" slot="icon" class="iconfont">&#xe651;</span>
                            <span v-if="gg_badge>0&&gg_badge<=99" class="badge">{{ gg_badge }}</span>
                            <span v-if="gg_badge>99" class="badge">99+</span>
                        </div>
                        <div class="titleAndTime">
                            <span class="plate_title" style="font-size:0.8rem;color:#000;">公告</span>
                            <span class="time_box">{{ gg_date }}</span>
                        </div>
                        <div class="content_box">
                            <p>{{ gg_content }}</p>
                        </div>
                    </div>

                    <div class="list_box" v-show = "listShow">
                        <ul>
                            <li><span style="padding-right:0.5rem;" slot="icon" class="iconfont">&#xe618;</span>异常发起</li>
                        </ul>
                        <div class="qrcode_box">
                            <span style="padding-right:0.5rem;" slot="icon" class="iconfont">&#xe606;</span>
                            <span>扫一扫</span>
                        </div>
                    </div>
                    <div class="jiantou" v-show = "listShow"></div>  
                </div>
            </mypulldown>
        </div>
    </div>
</template>

<script>
import * as actions from '../vuex/actions';
import Tokens from '../token';
import  Mypulldown from '../components/mypulldown'//引入下拉刷新的组件
export default {
    vuex: {
        actions: {
            setTokenValue: actions.setTokenValue,
        },
        getters: {
            getTokenValue: state => state.tokenValue,
        }
    },
    components: {
        Mypulldown
    },
	data () {
        return {
            listShow: false,//左上角选择框
            userId: "",//用户id
            sessionId: "",
            subSystem: "",//版本
            orgId: "",//站点id
            curr_key:'',//dbconSJ00384
            curr_user_url:'',//exchange/infoExchange/dbconSJ00384

            listViewH: 0,//下拉刷新框的最小高度
            isLoadId: null,//用来存储下拉刷新时带过来的id,初始设置为null,在数据加载完成后清除加载指示时

            yc_content: "",//异常信息的内容
            yc_date: "",//异常信息的时间
            yc_badge: 0,//异常信息的未读消息数量
            ycNoMsgCount: 0,//未读消息的数量
            ycNewYcCount: 0,//新异常的数量

            yw_content: "",//业务提醒的内容
            yw_date: "",//业务提醒的时间
            yw_badge: 0,//业务提醒的未读消息数量

            zd_content: "",//收付款提醒的内容
            zd_date: "",//收付款提醒的时间
            zd_badge: 0,//收付款提醒的未读消息数量

            sh_content: "",//审核提醒的内容
            sh_date: "",//审核提醒的时间
            sh_badge: 0,//审核提醒的未读消息数量

            xt_content: "",//系统提醒的内容
            xt_date: "",//系统提醒的时间
            xt_badge: 0,//系统提醒的未读消息数量

            gg_content: "",//公告的内容
            gg_date: "",//公告的时间
            gg_badge: 0,//公告的未读消息数量

            tiulo_timeout: 0,//定时器
            suIsYesNo10: 0,//是否开启播放声音(0为开启,1为关闭)
            suIsYesNo12: 0,//是否开启夜间免打扰

            ws: null,//SockJS对象
            changeSubsystem: false,//是否切换了版本, 或者重新登录

        }
    },
    //页面加载完之后调用
    ready(){
        let self = this;
        //避免关掉页面在打开会导致消息双倍提示问题
        if(isNull(self.ws)){
            self.socketOpen();//建立WebSocket连接
        }
        self.getTotalCount();//统计中条数

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
                if(isNull(self.ws)){
                    self.socketOpen();
                }else{
                    //告知后台，接收本人未阅读的信息
                    var orgId = self.subSystem == "SJ" ? Tokens.fetch('token')['userId'] : Tokens.fetch('token')['orgId'];
                    $.ajax({
                        type : "POST",
                        dataType: "text",
                        jsonp: "jsonp_data",//跨域专用
                        url : getRootURL() + '/rest/rabbit/noReadInfo/' + self.curr_key,
                        data : {
                            "subsystem": self.subSystem,
                            "orgId": orgId
                        },
                        success: function(){
                            //隐藏下拉刷新的进度条
                            if(self.isLoadId){
                                self.$nextTick(()=>{
                                    self.$broadcast('onTopLoaded', self.isLoadId); 
                                    self.isLoadId = null;
                                });
                            }
                        },
                        error: function(){
                            self.$transfer.showToast(self, "刷新失败, 请重试!", "center", 3000);
                            //隐藏下拉刷新的进度条
                            if(self.isLoadId){
                                self.$nextTick(()=>{
                                    self.$broadcast('onTopLoaded', self.isLoadId); 
                                    self.isLoadId = null;
                                });
                            }
                        },
                    });
                }
                self.getTotalCount();
            }, 1000);
        },
    },
    methods: {
        getTotalCount(){
            var self = this;
            //self.$parent.$data.tiulo_badge为app.vue的变量tiulo_badge
            self.$parent.$data.tiulo_badge = parseInt(self.yc_badge) + parseInt(self.yw_badge) + parseInt(self.zd_badge) + parseInt(self.sh_badge) + parseInt(self.xt_badge) + parseInt(self.gg_badge);
        },
        //建立WebSocket连接
        socketOpen(){
            var self = this;
            //创建socket对象
            self.ws = new SockJS('http://120.27.145.36:15674/stomp');
            //创建STOMP客户端对象
            var client = Stomp.over(self.ws);
            client.heartbeat.incoming = 0;//接收频率
            client.heartbeat.outgoing = 0;//发送频率
            //连接服务端
            var on_connect = function() {
                //STOMP客户端必须先订阅一个目的地destination, 用subscribe()去订阅
                //subscribe有两个参数: 目的地(destination)，回调函数(callback)
                client.subscribe(self.curr_user_url, function(d){
                    //console.log("headers: " + JSON.stringify(d.headers, null, 4));
                    //console.log("suIsYesNo10: " + self.suIsYesNo10);
                    //console.log("suIsYesNo12: " + self.suIsYesNo12);
                    clearTimeout(self.tiulo_timeout);
                    self.tiulo_timeout = setTimeout(function(){
                        if(self.suIsYesNo10 == '0'){//开启播放声音
                            if(self.suIsYesNo12 == '1'){//开启夜间免打扰
                                if(!checkTime(new Date())){//是否在免打扰之内
                                    //console.log("不在免打扰时间之内");
                                    console.log("声音");
                                    playMsgSound();
                                }
                            }else{//关闭夜间免打扰
                                console.log("声音");
                                playMsgSound();
                            }
                        }
                    }, 1000);
                    if(d.headers.type != "" || d.headers.type != undefined){
                        if(d.headers.type == "YC"){//异常信息
                            console.log("headers: " + JSON.stringify(d.headers, null, 4));
                            //alert(window.location.href);
                            //解决聊天消息和异常消息的问题
                            //ycCount为未读的总消息数, ycNoMsgCount为未读的总异常聊天消息数
                            if(d.headers.flag && d.headers.flag=="history"){//总未读消息记录
                                //self.yc_content = d.headers.title;//异常信息内容
                                self.ycNoMsgCount = d.headers.ycNoMsgCount;//未读消息条数
                                self.ycNewYcCount = d.headers.ycCount==0 ? 0 : (d.headers.ycCount-d.headers.ycNoMsgCount);//新异常条数
                                self.yc_date = self.formatDate(d.headers.date);//异常时间
                                self.yc_badge = Number(d.headers.ycCount) ? d.headers.ycCount : d.headers.ycNoMsgCount;//未读的信息总数量
                                Tokens.save("ycMsgCount", parseInt(self.yc_badge));//修改token里面的异常消息数量
                            }else{
                                //如果不是在异常聊天页面才执行加1操作
                                if(window.location.href.indexOf('taskOrderExDetail') == -1){
                                    if(d.headers.noCount){//异常聊天消息(有noCount的消息)
                                        self.yc_badge++;//异常内容数量
                                        //没有时间
                                        self.ycNoMsgCount++;
                                        Tokens.save("ycMsgCount", parseInt(Tokens.fetch("ycMsgCount")) + 1);//修改token里面的异常消息数量
                                    }else if(typeof(d.headers.noCount) == "undefined"){//发起的异常数量
                                        self.yc_date = self.formatDate(d.headers.date);//异常时间
                                        self.yc_badge++;//异常内容数量
                                        self.ycNewYcCount++;
                                        Tokens.save("ycMsgCount", parseInt(Tokens.fetch("ycMsgCount")) + 1);//修改token里面的异常消息数量
                                    }
                                }
                            }
                            // console.log("新异常: " + self.ycNewYcCount);
                            // console.log("新消息: " + self.ycNoMsgCount);
                            self.changeYcMsg();
                        }else if(d.headers.type == "YW"){//业务提醒
                            console.log("headers: " + JSON.stringify(d.headers, null, 4));
                            self.yw_content = d.headers.title;//业务内容
                            self.yw_date = self.formatDate(d.headers.date);//业务时间
                            if(d.headers.flag && d.headers.flag == "history"){//总未读消息记录(刚上线就接收)
                                self.yw_badge = d.headers.ywCount;//未读的信息总数量
                            }else if(typeof d.headers.manyNum != "undefined"){//新接收到的消息
                                self.yw_badge++;
                            }
                        }else if(d.headers.type == "ZD"){//收付款提醒
                            console.log("headers: " + JSON.stringify(d.headers, null, 4));
                            if(d.headers.flag && d.headers.flag=="history"){//离线消息
                                self.zd_badge = Number(d.headers.zdCount);//数量
                            }else if(typeof d.headers.manyNum !="undefined"){//在线接收消息
                                self.zd_badge += Number(d.headers.manyNum);
                            }else{
                                self.zd_badge++;
                            }
                            self.zd_content = d.headers.title;//内容
                            self.zd_date = self.formatDate(d.headers.date);//时间
                        }else if(d.headers.type == "SH"){//审核提醒
                            console.log("headers: " + JSON.stringify(d.headers, null, 4));
                            if(d.headers.flag && d.headers.flag=="history"){//离线消息
                                self.sh_badge = Number(d.headers.shCount);//数量
                            }else if(typeof d.headers.manyNum !="undefined"){//在线即时消息
                                self.sh_badge += Number(d.headers.manyNum);
                            }else{
                                self.sh_badge++;
                            }
                            self.sh_content = d.headers.title;//内容
                            self.sh_date = self.formatDate(d.headers.date);//时间
                        }else if(d.headers.type == "XT"){//系统提醒
                            console.log("headers: " + JSON.stringify(d.headers, null, 4));
                            if(d.headers.flag && d.headers.flag=="history"){
                                self.xt_badge = d.headers.xtCount;//数量
                            }else{
                                self.xt_badge++;//数量
                            }
                            self.xt_content = d.headers.title;//内容
                            self.xt_date = self.formatDate(d.headers.date);//时间
                        }else if(d.headers.type == "GG"){//公告
                            console.log("headers: " + JSON.stringify(d.headers, null, 4));
                            if(d.headers.flag && d.headers.flag=="history"){
                                self.gg_badge = d.headers.ggCount;//数量
                            }else{
                                self.gg_badge++;//数量
                            }
                            self.gg_content = d.headers.title;//内容
                            self.gg_date = self.formatDate(d.headers.date);//时间
                        }
                        //计算总消息条数
                        self.getTotalCount();
                    }
                });
                //用户在线
                client.subscribe(self.curr_user_url + "." + self.sessionId, function(d){});
                //告知后台，接收本人未阅读的信息
                var orgId = self.subSystem == "SJ" ? Tokens.fetch('token')['userId'] : Tokens.fetch('token')['orgId'];
                $.ajax({
                    type : "POST",
                    dataType: "text",
                    jsonp: "jsonp_data",//跨域专用
                    url : getRootURL() + '/rest/rabbit/noReadInfo/' + self.curr_key,
                    data : {
                        "subsystem": self.subSystem,
                        "orgId": orgId
                    },
                });
            };
           
            //连接错误执行
            var on_error = function(){
                //console.log("连接失败!");
                if(!self.changeSubsystem){
                    //alert("on_error");
                    setTimeout(function(){
                        self.socketOpen();//连接失败，10秒后再次连接
                    }, 10000);
                }else{
                    self.changeSubsystem = false;
                }
            };
            //连接
            client.connect('user', 'user', on_connect, on_error, '/');

            //隐藏下拉刷新的进度条
            if(self.isLoadId){
                self.$nextTick(()=>{
                    self.$broadcast('onTopLoaded', self.isLoadId); 
                    self.isLoadId = null;
                });
            }
        },
        //数量提醒的显示隐藏
        isShowBadge(node){
            if(node.html() == "" || node.html() == "0"){
                node.hide();
            }else{
                node.show();
            }
        },
        //转换日期
        formatDate(headersDate){
            if(headersDate == "" || headersDate == undefined){
                headersDate = new Date();
            }
            return initDate(getDateTimeForDate(new Date(parseInt(headersDate))));
        },
        //改变异常消息提示
        changeYcMsg(){
            var self = this;
            //异常信息内容
            if(self.ycNewYcCount > 0 && self.ycNoMsgCount > 0){
                self.yc_content = "您有" +  self.ycNewYcCount + "条新异常, " + self.ycNoMsgCount + "条未读消息";
            }else if(self.ycNewYcCount > 0 && self.ycNoMsgCount <= 0){
                self.yc_content = "您有" +  self.ycNewYcCount + "条新异常";
            }else if(self.ycNewYcCount <= 0 && self.ycNoMsgCount > 0){
                self.yc_content = "您有" + self.ycNoMsgCount + "条未读消息";
            }
        },
        go (link, param) {
            let self = this;
            //列表若有点击跳转事件，在下拉时阻止点击跳转
            if(isXLorClick()){
                return;
            }
        
            var tiuloType;
            //点击之后消息提示为0
            if(link == "/opMsgList"){//业务提醒
                self.$parent.$data.tiulo_badge -= parseInt(self.yw_badge);//总消息条数减去业务提醒的条数
                self.yw_badge = 0;
                self.yw_date = "";
                self.yw_content = "";
                tiuloType = "YW";
            }else if(link == "/exceptionList"){//异常信息
                Tokens.save("ycMsgCount", parseInt(Tokens.fetch("ycMsgCount")) - parseInt(self.ycNewYcCount));//修改token里面的异常消息数量
                self.$parent.$data.tiulo_badge -= parseInt(self.ycNewYcCount);
                self.yc_badge = self.ycNoMsgCount;
                self.ycNewYcCount = 0,//新异常的数量
                self.changeYcMsg();//改变异常消息提示
                tiuloType = "YC";
            }else if(link == "/accountMsgList"){//审核提醒和收付款提醒
                if(param == "SF"){//收付款提醒
                    self.$parent.$data.tiulo_badge -= parseInt(self.zd_badge);
                    self.zd_badge = 0;
                    self.zd_date = "";
                    self.zd_content = "";
                    tiuloType = "ZD";
                }else if(param == "SH"){//审核提醒
                    self.$parent.$data.tiulo_badge -= parseInt(self.sh_badge);
                    self.sh_badge = 0;
                    self.sh_date = "";
                    self.sh_content = "";
                    tiuloType = "SH";
                }
            }else if(link == "/sysMsgList"){//系统提醒
                self.$parent.$data.tiulo_badge -= parseInt(self.xt_badge);
                self.xt_badge = 0;
                self.xt_content = "";
                self.xt_date = "";
                tiuloType = "XT";
            }else if(link == "/noticeList"){//公告
                self.$parent.$data.tiulo_badge -= parseInt(self.gg_badge);
                self.gg_badge = 0;
                self.gg_content = "";
                self.gg_date = "";
                tiuloType = "GG";
            }
            //console.log("tiuloType; " + tiuloType);
            //参数
            var params = {
                "tiuloType": tiuloType,
                "userId": Tokens.fetch('token')['userId'],
                "subSystem": Tokens.fetch('token')['subSystem'],
                "orgId": Tokens.fetch('token')['orgId']
            };
            //console.log("params: " + JSON.stringify(params));
            //延迟2秒后标记该类型信息已读
            window.setTimeout(function(){//延迟2秒后标记该类型信息已读
                $.ajax({
                    type : "POST",
                    url : getRootURL() + '/rest/rabbit/removeAllNoReadByType',
                    data : {
                        "params": JSON.stringify(params)
                    },
                    //dataType: "jsonp",//允许请求跨域
                    success: function(){
                        console.log("设置已读成功");
                    },
                    error: function(){
                        console.log("设置已读失败");
                    }
                });
            }, 2000);
            self.$transfer.go(self, link, param);
        },
        back (link, param) {
            let self = this;
            self.$transfer.back(self, link, param);
        }
    },
    route: {
        data ({ from, to, next }) {
            var self = this;
            //进入页面时token不存在
            if(!localStorage.getItem("token")){
                self.$transfer.backLogin(self, {info:'token没有值'});
                return;
            }

            //重新登录要先关闭webSocket, 不然会出现多倍信息问题
            if(from.path && (from.path.indexOf("login") != -1)){
                if(!isNull(self.ws)){
                    self.ws.close();
                    self.changeSubsystem = true;
                }
            }

            var token = Tokens.fetch('token');
            self.userId = token['userId'];
            self.sessionId = token['sessionId'];
            self.subSystem = token['subSystem'];
            self.orgId = token['orgId'];
            self.suIsYesNo10 = token['suIsYesNo10'];
            self.suIsYesNo12 = token['suIsYesNo12'];
            self.curr_key = token['datasource'] + token['subSystem'] + token['userId']//当前用户的key
            self.curr_user_url = "/exchange/infoExchange/" + self.curr_key;
            //将异常信息的聊天信息条数存到token里面
            if(Tokens.fetch("ycMsgCount") == undefined){
                localStorage.setItem("ycMsgCount", 0);
            }else{//如果token里面存在ycMsgCount, 就取出来并设置显示
                //如果是从登录页面过来的, 就把localStorage的异常消息条数设置为0
                if(from.path && (from.path.indexOf("login") != -1)){
                    Tokens.save("ycMsgCount", 0);
                    self.socketOpen();//重新获取信息
                }
                self.yc_badge = parseInt(Tokens.fetch("ycMsgCount"));
                if(Tokens.fetch("ycMsgCount") == 0){//如果信息条数为0, 则清除时间和内容
                    self.yc_date = "";
                    self.yc_content = "";
                }
                //如果是从异常信息页面返回回来的
                if(from.path && (from.path.indexOf("exceptionList") != -1)){
                    self.ycNoMsgCount = parseInt(Tokens.fetch("ycMsgCount"));
                }
                self.getTotalCount();//计算总消息条数
                self.changeYcMsg();//改变异常消息的内容
            }
            next();
        },
        deactivate ({ next }) {
          //Triggers when component destroys
          let self = this;
          self.listShow = false;
          next();
        },
        canDeactivate({to, from, next}) {
            let self = this;  
            self.$parent.$data.showBar = false;
            next();           
        },
        activate({to, from, next}) {
            let self = this;
            let subSystem = localStorage.getItem("subSystem");
            if(subSystem){
                self.$parent.$data.subSystem = subSystem;
            }
            self.$parent.$data.showBar = true;
            self.$parent.$data.MainSelect = "tiulo";
            next();
        }  
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    .plate{
        box-sizing: border-box;
        height: 3.5rem;
        width:100%;
        padding:0.5rem 0.45rem 0.5rem 3rem;
        position: relative;
        background: #fff;
        font-size: 0.65rem;
        color:#666;
        border-bottom:1px solid #e5e5e5;
    }
    .plate .pic_box{
        position: absolute;
        top:0.2rem;
        left:0.5rem;
    }
    .badge{
        min-width: 1rem;
        min-height: 1rem;
        line-height: 1rem;
        border-radius: 0.5rem;
        background: red;
        color:#fff;
        position: absolute;
        top:0.25rem;
        right:-0.25rem;
        font-size: 0.5rem;
        text-align: center;
    }
    .plate .titleAndTime{
        margin-top: 0.1rem;
    }
    .plate .content_box{
        width: 100%;
    }
    .plate .content_box p{
        height:1.25rem;
        line-height: 1.25rem;
        overflow:hidden;
        white-space:nowrap;
        text-overflow:ellipsis; 
    }
    .plate .time_box{
        height: 1.2rem;
        line-height: 1.2rem;
        position: absolute;
        top:0.6rem;
        right:0.5rem;
    }

    .list_box{
        width:50%;
        position: absolute;
        top:0.5rem;
        right:0.5rem;
        background:#383a40;
        color:#fff;
        font-size: 0.65rem;
        border-radius: 0.3rem;
        word-wrap: break-word;
        break-word:break-all;
        overflow: scroll;
    }
    .jiantou{
        width:2rem;
        height:0.05rem;
        position: absolute;
        top:0;
        right:0.5rem;
    }
    .jiantou:before{
        content: "";
        position: absolute;
        border-style:dashed dashed solid dashed;
        line-height: 1;
        display: inline-block;
        right: 0.5rem;
        border-color: transparent transparent #383a40;
        border-width: 10px; 
        bottom:-0.55rem; 
        z-index:20000
    }
    .list_box ul li{
        padding:0 1rem;
        color:#FFD91E;
        border-bottom:1px solid rgba(255,255,255,0.4);
        height:1.8rem;
        line-height: 1.8rem;
    }
    .qrcode_box{
        padding:0 1rem;
        color:#FFD91E;
        height:1.8rem;
        line-height: 1.8rem;
    }


</style>
