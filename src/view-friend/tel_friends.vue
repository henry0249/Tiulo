<template>
	<div class="page">
		<mt-header fixed title="添加新伙伴">
            <mt-button icon="back" slot="left" @click="back('/addtel_friend')"></mt-button>
        </mt-header>
        <div id="telFriendSearch" class="container-search">
            <mysearch :value.sync="searchVal" placeholder="手机号、姓名、推流号"></mysearch>
        </div>
        <div class="container-top" id="new_group" v-infinite-scroll="loadMore()" infinite-scroll-immediate-check="false" infinite-scroll-disabled="loading" infinite-scroll-distance="200">
            <mypulldown style="margin-top:2.8rem;">
                <div slot= "pullList" :style = "{minHeight:listViewH + 'px'}">
                    <div style="overflow:hidden;">
                        <div class="contents" v-for="detail in details" track-by="$index">
                            <div style="width:100%;height:2rem;border-bottom:1px solid #ededed;" @click="friend_detail($index,detail)">
                                <!-- <img :src="detail.suLogo" class="logoimg"> -->
                                <div class="logoimg">
                                    <img :src="detail.suLogo" style="width:1.5rem;vertical-align:middle;">
                                </div>
                                <div class="matter">{{detail.suName}}</div>
                                <div v-show = "detail.state == 'PC'" class="big_box">
                                    <span class="iconfont icon_sexM" v-show="detail.suSex=='男'">&#xe60b;</span>
                                    <span class="iconfont icon_sexG" style="color:#FD626E;" v-show="detail.suSex=='女'">&#xe60d;</span>
                                    <div class="icon_sexG" style="width:1rem;height:2rem;" v-show="detail.suSex=='*'"></div>
                                    <span class="iconSet" v-show="detail.suIsCustomer == 1">企</span>
                                    <span class="iconSet" v-show="detail.suIsTMS == 1">运</span>
                                    <span class="iconSet" v-show="detail.suIsDriver == 1">车</span>
                                </div>
                                <div v-show = "detail.state == 'TEL'" class="big_box">
                                    <span class="iconfont telphone">&#xe60e;</span>
                                    <span class="tel">{{detail.suMobile}}</span>
                                </div>
                                <div class="rg invite" v-show = "detail.showInvite == 0" @click.stop="inviteFriend($index,detail)">邀请</div>
                                <div v-show = "detail.showInvite == 1" class="addBtn">
                                    <div class="rg rg_2" v-show="detail.suIsFriend == 'self'"></div>
                                    <div class="rg" @click.stop="add_click($index,detail)" v-show="detail.suIsFriend == 'false'">添加</div>
                                    <div class="rg rg_2" v-show="detail.suIsFriend == 'true'">已添加</div>
                                </div>
                                
                            </div>                    
                        </div>
                        <div class="nodata">{{nodata}}</div>
                        <!-- 加载指示器 -->
                        <div class="sw-spinner" v-if="showloadmore">
                            <mt-spinner type="snake" color="#FFD91E"></mt-spinner>
                        </div>
                    </div>
                </div>
            </mypulldown>
        </div>
	</div>
</template>
<script>
import Tokens from '../token'
import  Mysearch  from '../components/mysearch'
import  Mypulldown from '../components/mypulldown'//引入下拉刷新的组件 

export default {
	components: {
        Mysearch,Mypulldown
    },
	data () {
    	return {
            listViewH:0,//下拉刷新框的最小高度
            isLoadId:null,//用来存储下拉刷新时带过来的id,初始设置为null,在数据加载完成后清除加载指示时

            toke:'',
            //搜索框
            searchVal:'',//搜索框的值
            timer:false,//是否执行搜索的定时器
            truckList:[],//列表数据
            // currPage:1,//当前页面
            nodata:'',//加载没有数据
            // loading:false,//可以无限加载
            // loadMax:false,//已全部加载
            // showloadmore:false,//显示加载标示

            details:[],//获取推流所有联系人列表
            mobiles:[],//获取手机的联系人信息
            marginTop1:'',//获取搜索框以及手机联系人的高度

            beforeScrollTop:0,//存储页面当前scrollTop
            searchNum:0,
    	}
    },
    ready(){
        let self = this;
        //列表框的最小高度
        self.$nextTick(()=>{
            self.listViewH = $("#new_group").height() - $("#telFriendSearch").height()-10;
        })
        searchBoxIsShow('#new_group','#telFriendSearch',self.beforeScrollTop,function(top){
            self.beforeScrollTop = top;
        })
    },
    watch:{
        //搜索内容改变执行此方法
        'searchVal': function(e){
            let self = this;
            if(self.searchNum == 0){//刚进来重置searchVal不执行搜索
                self.searchNum++;
                return;
            } 
            //设置延迟执行
            clearInterval(self.timer);
            if(!self.timer){
                self.timer = true;
                setTimeout(function(){
                    self.truckList = [];
                    self.currPage = 1;
                    self.nodata = '';
                    self.loading = false;
                    self.loadMax = false;
                    self.showloadmore = false;
                    self.first_load();
                    self.timer = false;
                },500);
            }
        },
    },
    events:{
        //下拉刷新时重置列表数据
        refreshList(id,topStatus){
            let self = this;
            self.isLoadId = id;
            setTimeout(() => {
                self.truckList = [];
                self.currPage = 1;
                self.loadMax = false;
                self.nodata = '';
                self.first_load();

                self.$nextTick(()=>{
                    self.$broadcast('onTopLoaded', id);
                }) 
            }, 1000);
        },
    },
    methods:{
    	go (link, param) {
            let self = this;
            self.$transfer.go(self, link, param)
        },
        back (link, param) {
            let self = this
            self.$transfer.back(self, link, param);
        },
        loadMore () {//无限加载更多
            let self = this;
            if(self.loading || self.loadMax){
                return;
            }else{
                self.loading = true;
                self.currPage++;
                self.showloadmore = true;
                setTimeout(function(){
                    self.first_load();
                },1000);
                
            }
        },
        // android_friends(arr){//如果是安卓
        //     let self = this;
        //     let str = Tokens.fetch('MobilePhone')
        //     if(str.length == 0){
        //         self.$transfer.showToast(self, "通讯录没有名单!");
        //         return arr;
        //     }else{
        //         str.forEach(function(item, index){
        //             item.suLogo = getImgURL() + 'user/default.png';//添加默认图片
        //             item.suName = item.name;//把键值name改为suName，值还是name的值
        //             item.suMobile = item.phone;//把键值phone改为suMobile，值还是phone的值
        //             item.state = 'TEL';//添加类型'TEL'-->代表手机类型,'PC'代表推流用户端
        //             item.showInvite = 0;//邀请,添加,已添加状态的判断.0-->邀请,1-->添加/已添加
        //             item.suIsFriend = "false";//添加与已添加的状态判断.false-->添加,true-->已添加
        //             delete item.name;
        //             delete item.phone;
        //         })
        //         self.mobiles = str;
        //         for(let key in arr){
        //             for(let val in self.mobiles){
        //                 if(arr[key].suMobile == self.mobiles[val].suMobile){//判断此号码是否已经存在
        //                     self.mobiles[val].showInvite = 1;//已存在不显示邀请按钮，1-->不显示
        //                     self.mobiles[val].suIsFriend = arr[key].suIsFriend;//把推流收否添加状态复制
        //                 }
        //             }
        //         }
        //         Tokens.save('phones',self.mobiles)
        //         let details = self.mobiles.concat(arr)  
        //         arr = details;
        //         return arr;
        //     }
        // },
        first_load(){//进入页面加载数据
            let self = this;
            let s = {action:"/user/query1",params:{findString:self.searchVal}};     
            self.loadMax = false;
            self.noTaskData = "";   
            doAjaxQuery(s,function(data) {
                if(data.status == 0){
                   self.$transfer.backLogin(self, data);
                }else if(data.status == 1){
                    consoleShow(data)
                    let arr = data.dataset.rows;
                    // self.details = arr;
                    if(arr && arr.length>0){
                        arr.forEach(function(item, index){
                            item.suLogo = getImgURL() +'user/' +item.suLogo;
                            var ImgObj = new Image(); 
                            ImgObj.src = item.suLogo; 
                            ImgObj.onerror = function(){
                                item.suLogo = getImgURL() + 'user/default.png';
                            }
                            item.state = 'PC';
                            item.showInvite = 1;
                        })
                        let details = arr;
                        if(browserType == "android"){
                            // let str = window.AndroidWebView.showInfoFromJs();//获得通讯录只有name和phone
                            let str = Tokens.fetch('MobilePhone')
                            if(str.length == 0){
                                self.$transfer.showToast(self, "通讯录没有名单!");
                                return;
                            }else{
                                str.forEach(function(item, index){
                                    item.suLogo = getImgURL() + 'user/default.png';//添加默认图片
                                    item.suName = item.name;//把键值name改为suName，值还是name的值
                                    item.suMobile = item.phone;//把键值phone改为suMobile，值还是phone的值
                                    item.state = 'TEL';//添加类型'TEL'-->代表手机类型,'PC'代表推流用户端
                                    item.showInvite = 0;//邀请,添加,已添加状态的判断.0-->邀请,1-->添加/已添加
                                    item.suIsFriend = "false";//添加与已添加的状态判断.false-->添加,true-->已添加
                                    delete item.name;
                                    delete item.phone;
                                })
                                self.mobiles = str;
                                for(let key in details){
                                    for(let val in self.mobiles){
                                        if(details[key].suMobile == self.mobiles[val].suMobile){//判断此号码是否已经存在
                                            self.mobiles[val].showInvite = 1;//已存在不显示邀请按钮，1-->不显示
                                            self.mobiles[val].suIsFriend = details[key].suIsFriend;//把推流收否添加状态复制
                                        }
                                    }
                                }
                                Tokens.save('phones',self.mobiles)
                                let arr1 = self.mobiles.concat(details)  
                                details  = arr1;
                            }
                        }
                        // if(self.currPage == 1){
                        //     self.truckList = details;
                        // }else{
                        //     self.truckList = self.truckList.concat(details);
                        // }
                        //// 判断当前页是否是最后一页  
                        // let maxRecord = parseInt(data.dataset.allRowCount);
                        // if(self.truckList.length == maxRecord){
                            // self.loadMax = true;
                            self.nodata = '已全部加载';
                        // }
                        self.$nextTick(()=>{
                            self.details = details;
                        })
                    }else{
                        // self.loadMax = true;
                        // self.truckList = [];
                        self.nodata = "没有相关数据"
                    }
                    if(self.isLoadId){
                        self.$nextTick(()=>{
                            self.$broadcast('onTopLoaded', self.isLoadId); 
                            self.isLoadId = null;
                        }) 
                    }
                }
                // self.showloadmore = false;
                // self.loading = false;
                self.$Indicator.close();
            })
        },
        add_click(key,val){
            let self = this;
            Tokens.save('select_group',val)
            self.go('/select_group')
        },
        // getTruckData(){//获取人员列表信息
        //     let self = this;
        //     let clickGroup = Tokens.fetch('clickGroup');
        //     let s = {action:"/user/query1",pageIndex:self.currPage,"pageSize":15,params:{findString:self.searchVal}};
        //     consoleShow(JSON.stringify(s))
        //     self.showloadmore = true;
        //     self.loadMax = false;
        //     self.nodata = "";
        //     self.details = [];
        //     doAjaxQuery(s,function(data) {
        //         if(data.status == 0){
        //             self.$transfer.backLogin(self, data);
        //         }else if(data.status == 1){
        //             consoleShow(data)
        //             let arr = data.dataset.rows;
        //             if(arr && arr.length > 0){
        //                 arr.forEach(function(item, index){
        //                     item.suLogo = getImgURL() +'user/' +item.suLogo;
        //                     var ImgObj = new Image(); 
        //                     ImgObj.src = item.suLogo; 
        //                     ImgObj.onerror = function(){
        //                         item.suLogo = getImgURL() + 'user/default.png';
        //                     }
        //                     item.state = 'PC';
        //                     item.showInvite = 1;
        //                 })
        //                 let details = arr;
        //                 if(self.currPage == 1){
        //                     self.truckList = details;
        //                 }else{
        //                     self.truckList = self.truckList.concat(details);
        //                 }
        //                 //判断当前页是否是最后一页  
        //                 let maxRecord = parseInt(data.dataset.allRowCount);
        //                 if(self.truckList.length == maxRecord){
        //                     self.loadMax = true;
        //                     self.nodata = '已全部加载';
        //                 }
        //                 self.$nextTick(()=>{
        //                     self.details = self.truckList;
        //                 })
        //             }else{
        //                 self.truckList = [];
        //                 self.nodata = "没有相关数据"
        //             }
        //         }
        //         self.showloadmore = false;
        //         self.loading = false;
        //     })
        // },
        inviteFriend(key,item){//邀请好友按钮
            let self = this;
            let s = {action:"/user/execute"}
            s.params = {mobiles:item.suMobile}
            doAjaxQuery(s,function(data){
                if(data.outParams.state){
                    self.$transfer.showToast(self, "消息发送成功");
                }else{
                    self.$transfer.showToast(self, data.info);
                }
            })
        },
        friend_detail(key,val){
            let self = this;
            //列表若有点击跳转事件，在下拉时阻止点击跳转
            let isStop = isXLorClick();
            if(isStop){
                return;
            }
            if(val.state == "PC"){
                let s = {action:"/user/query",params:{suId:val.suId}};
                s.showFields = "suId,suName,suCode,suSex,suLogo,suProvinceName,suDistrictName,suMobile,suMail,suIsTMS,suIsCustomer,suIsDriver,suIsEmployee";
                doAjaxQuery(s, function(data){
                    if(data.status == 0){
                        self.$transfer.backLogin(self, data);
                    }else if(data.status == 1){
                        consoleShow(data)
                    }
                })
                Tokens.save('friendDetail',val)
                self.go('/friend_detail')
            }
        },
    },
    route: {
        data ({ from, to, next }) {
            let self = this;
            //进入页面时token不存在
            if(!localStorage.getItem("token")){
                self.$transfer.backLogin(self, {info:'token没有值'});
                return;
            }
            let from_path = from.path;
            self.toke = Tokens.fetch("token");
            if(from_path){
                if(from_path.indexOf('add_group')==1){
                    self.addGroup = true;
                }
            }

            self.$nextTick(()=>{
                let top1 = $('#telFriendSearch').height();
                self.marginTop1 = top1;
                self.$Indicator.open();
                self.first_load();
            })
            
            next()
        },
        canDeactivate({to, from, next}) {
            let self = this;
            $('#telFriendSearch').slideDown();
            next();
        },
        deactivate ({ next }) {
            //Triggers when component destroys
            next()
        },
    }
}
</script>
<style scoped>
    /*#search{
        width:100%;
        position: fixed;
        top:44px;
        left:0;
        z-index: 5;
    }*/
    .tel_body{
        margin-top: 56px;
        /*margin-bottom: 2.5rem;*/
        /*position: absolute;
        top: 56px;
        left:0;*/
    }
    .nodata{
        text-align:center;margin:0.5rem 0;
    }
    /*内容部分*/
    .contents{
        width:100%;
        height:2rem;
        padding-left:0.5rem;
        background-color: #fff;
        line-height: 2rem;
    }
    .logoimg{
        float:left;
        height:1.5rem;
    }
    .matter{
        box-sizing: border-box;
        float:left;
        width:25%;
        height:2rem;
        line-height: 2rem;
        padding-left:.5rem;
        white-space:nowrap; 
        text-overflow:ellipsis; 
        overflow: hidden;
    }
    .big_box{
        float:left;
        width:45%;
    }
    /*性别*/
    .icon_sexM,.icon_sexG,.telphone{
        float:left;
        margin-left: .5rem;
        height:2rem;
        line-height: 2rem;
    }
    .telphone{color:#FFD91E;}
    .icon_sexM{color:#1B93FF;}
    .icon_sexG{color:#FD626E;}
    /*企运车*/
    .iconSet{
        float:left;
        background-color: #666;
        color:#fff;
        width:1rem;height:1rem;
        line-height: 1rem;
        text-align: center;
        border-radius: 4px;
        margin-left: .4rem;
        margin-top:.5rem;
    }
    .rg,.rg_2{
        float:right;
        width:2.5rem;
        /*height:1.2rem;*/
        line-height: 1.2rem;
        margin-top: .4rem;
        text-align: center;
        border:none;
        border-radius: 5px;
        font-size: .55rem;
    }
    .rg{
        margin-right: .5rem;
        background-color: #333;
        color:#FFD91E;
    }
    .rg_2{
        background-color: #fff;
        color:#aaa ;
        /*border:1px solid #aaa;*/
    }
    /*手机联系人信息*/
    .tel{
        float:left;
        max-width: 70%;
        height: 2rem;
        line-height: 2rem;
        margin-left: .5rem;
        white-space:nowrap; 
        text-overflow:ellipsis; 
        overflow: hidden;
    }
    .addBtn{
        width:15%;
        float:right;
    }
    .invite{
        width:15%;
        float:right;
        background-color: #444;
        color:#fff;
    }
</style>