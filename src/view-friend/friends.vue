<template>
    <div class="page">
        <!-- Header -->
        <mt-header fixed title="通讯录">
            <mt-button slot="right" style="width:45px;">
                <span class="iconfont" @click="goes()">&#xe630;</span>
            </mt-button>
        </mt-header>
        <!-- 搜索框 -->
        <div id="groupMysearch" class="container-search">
            <mysearch :value.sync="searchVal" placeholder="输入关键字查询"></mysearch>
        </div>
        <div class="container-top topEnt" id="commun">
            <mypulldown style="margin-top:2.8rem;">
                <div slot= "pullList" :style = "{minHeight:listViewH + 'px'}" style="padding-bottom:2rem;">
                    <!-- 分组 -->
                    <div class="group" v-show="group_show">
                        <!-- 新建分组 -->
                        <div class="newGroup">
                            <mt-cell title="新建分组" @click="add_group_list()">
                                <img slot="icon" src="../img/friends/a_newgrouping_on.png"/>
                            </mt-cell>
                        </div>
                        <!-- 用户分组 -->
                        <div class="userGroup">
                            <div style="position:relative;height:2.3rem;border-bottom:1px solid #e5e5e5;" v-for="(index,userGroup) in userGroups">
                                <div class="deleteCard" @click.stop="deleteGroup(index)">删除</div>
                                <div class="ugroup" :class="{ungroup:userGroup.class}" @click.stop="group_details(userGroup)">
                                    <span class="iconfont font" :style="{backgroundColor:userGroup.bgc}">{{{userGroup.logo}}}</span>
                                    <span style="position:absolute;top:.6rem;left:2.4rem;">{{userGroup.cfgName}}</span>
                                    <span style="position:absolute;top:.6rem;right:2rem;">{{userGroup.cfg_person_num}}人</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- 未分组列表 -->
                    <div class="ungrouped" style="margin-bottom:40px;">
                        <div class="ungrouped_title">
                            <p>未分组列表</p>
                        </div>
                        <div class="ungrouped_user">
                            <my-commun-list :details="arr2" :uptop="uptop" :nodata="browserType"></my-commun-list>
                            <div class="nodata">{{nodata}}</div>
                        </div>
                    </div>
                </div>
            </mypulldown>  
            <my-letter-index :uptop="uptop"></my-letter-index>             
        </div>
    </div>
</template>

<script>

import { MessageBox } from 'mint-ui';
import  Mysearch  from '../components/mysearch'
import  MyCommunList  from '../components/mycommunlist'
import  MyLetterIndex  from '../components/myletterindex'
import Tokens from '../token'
import  Mypulldown from '../components/mypulldown'//引入下拉刷新的组件

export default {
    components: {
        Mysearch,MyCommunList,Mypulldown,MyLetterIndex
    },
    data () {
        return {
            listViewH:0,//下拉刷新框的最小高度
            isLoadId:null,

            token:'',//读取本地的token
            user_info:'',//获取user_info
            sessionId:'',//开始Id

            userId:'',//用户Id
            userGroups: [],//用户的分组数据
            unGroupeds: [],//未分组列表数据
            //搜索框
            searchVal:'',//搜索框的值
            timer:false,//是否执行搜索的定时器
            truckList:[],//列表数据
            currPage:1,//当前页面
            nodata:'',//加载没有数据
            loading:false,//可以无限加载
            loadMax:false,//已全部加载
            showloadmore:false,//显示加载标示

            arr2:[],
            uptop:100,
            shanchu:true,
            logo:'',
            ungroup:false,
            group_show:true,//分组隐藏
            // uptops:0,//未分组模块动态margin-top值

            groupShow1:false,//分组的加载状态
            groupShow2:false,//未分组的家在状态

            wfzId:'',//未分组Id
            browserType:'',
            beforeScrollTop:0,//存储页面当前scrollTop
            searchNum:0,

        }
    },
    watch:{
        //搜索内容改变执行此方法
        'searchVal': function(e){
            let self = this;
            if(self.searchNum == 0){//刚进来重置searchVal不执行搜索
                self.searchNum++;
                self.group_show = true;
                return;
            }
            self.group_show = false; 
            //设置延迟执行
            clearInterval(self.searchTimer);
            if(!self.timer){
                self.timer = true;
                setTimeout(function(){
                    self.truckList = [];
                    self.currPage = 1;
                    self.nodata = '';
                    self.loading = false;
                    self.loadMax = false;
                    self.showloadmore = false;
                    self.getUngroupeds();
                    self.timer = false;
                },500);
            }
        }
    },
    ready(){
        let self = this;
        let sessionId = Tokens.fetch('token')['sessionId'];
        self.sessionId = sessionId;
        self.browserType = browserType;
        //列表框的最小高度
        self.$nextTick(()=>{
            self.listViewH = $("#commun").height() - $("#groupMysearch").height()-10;
        })

        searchBoxIsShow('#commun','#groupMysearch',self.beforeScrollTop,function(top){
            self.beforeScrollTop = top;
        })
    },
    events:{
        //删除成员
        deleteGroup(index1,index2,item){
            let self = this;
            let userId = Tokens.fetch('token')['userId'];
            let ifcurrRow = self.arr2[index1].name[index2];
            MessageBox.confirm('您确定删除此好友吗?',{'showCancelButton': true,'cancelButtonClass':'cancelbtn','confirmButtonClass':'verify','confirmButtonText':"确 定"}).
            then(action => {
                let s = {action:'/cmsMyFriends/del/'+ifcurrRow.cmfId,params:{cmfUserId1:ifcurrRow.cmfUserId1,cmfGroupId:ifcurrRow.cmfGroupId}};
                doAjaxUpdate(s,function(data){
                    if(data.status == 0){
                        self.$transfer.backLogin(self, data);
                    }else if(data.status == 1){
                        consoleShow(data)
                        self.arr2[index1].name.splice(index2,1);
                        if(self.arr2[index1].name.length == 0){
                            self.arr2.splice(index1,1);
                        }
                    }
                })
            }).catch(function(){
                let as = document.querySelectorAll('.updata');
                Array.from(as).forEach(function(item,index){
                    item.style.WebkitTransform = "translateX(" + 0 + "px)";
                })
            });
        },
        //点击进入详情
        particulars(index1,index2,item){
            let self = this;
            //列表若有点击跳转事件，在下拉时阻止点击跳转
            let isStop = isXLorClick();
            if(isStop){
                return;
            }
            Tokens.save('friendDetail',item)
            self.go('/friend_detail')
        },
        //下拉刷新时重置列表数据
        refreshList(id,topStatus){
            let self = this;
            self.isLoadId = id;
            setTimeout(() => {
                self.truckList = [];
                self.currPage = 1;
                self.loadMax = false;
                self.nodata = '';
                self.getUserGroups();
                self.getUngroupeds();
            }, 1000);
        },
    },
    methods: {
        go (link, param) {
            let self = this;
            self.$transfer.go(self, link, param)
        },
        back (link, param) {
            let self = this;
            self.$transfer.back(self, link, param);
        },
        goes(){
            let self = this;
            self.currPage = 1;
            self.nodata = '';
            self.loading = false;
            self.loadMax = false;
            self.showloadmore = false;
            self.searchVal = '';
            self.go('/addtel_friend');
        },
        compare(property){//排序
            return function(a,b){
                let value1 = a[property];
                let value2 = b[property];
                return value1 - value2;
            }
        },
        //点击跳转添加分组页面
        add_group_list(){
            let self = this;
            //列表若有点击跳转事件，在下拉时阻止点击跳转
            let isStop = isXLorClick();
            if(isStop){
                return;
            }
            self.go('/add_group');
        },
        //点击跳转分组详情
        group_details(userGroup){
            let self = this;
            //列表若有点击跳转事件，在下拉时阻止点击跳转
            let isStop = isXLorClick();
            if(isStop){
                return;
            }
            self.currPage = 1;
            self.nodata = '';
            self.loading = false;
            self.loadMax = false;
            self.showloadmore = false;
            self.searchVal = '';
            Tokens.save("clickGroup",userGroup);
            self.go('/group_sort');
        },
        //得到用户分组
        getUserGroups(){
            let self = this;
            let s = {action: "/cmsFriendGroup/query1",params: {"userIdMobileCode":Tokens.fetch('token')['userId'],"cfgSubSystem":Tokens.fetch('token')['subSystem'],"indexSearch":"1",}};
            s.showFields= "cfg_person_num,cfgName,cfgId,cfgSort,cfgModifyDate,cfgType,cfgSubSystem,rowId,ifcurrRow,icon"
            doAjaxQuery(s, function(data){
                if(data.status == 0){
                    self.$transfer.backLogin(self, data);
                }else if(data.status == 1){
                    self.userGroups = data.dataset.rows;
                    self.userGroups.sort(self.compare('cfgSort'));//按照cfgSort排序
                    for(let key in self.userGroups){
                        if(self.userGroups[key].cfgName == '未分组'){
                            self.wfzId = self.userGroups[key].cfgId;
                            self.userGroups.splice(key,1)
                        }
                    }
                    self.userGroups.forEach(function(item, index){
                        if(item.cfgName == '司机'){
                            item.logo = '&#xe63f;';
                            item.bgc = '#333';
                        }else if(item.cfgName == '客户'){
                            item.logo = '&#xe65d;';
                            item.bgc = '#333';
                        }else if(item.cfgName == '同事'){
                            item.logo = '&#xe642;';
                            item.bgc = '#333';
                        }else if(item.cfgName == '同行'){
                            item.logo = '&#xe707;';
                            item.bgc = '#333';
                        }else if(item.cfgName == '承运人'){
                            item.logo = '&#xe707;';
                            item.bgc = '#333';
                        }else{
                            item.logo = '&#xe643;';
                            item.bgc = '#ffd91e';
                            item.class = 'ungroup';
                        }
                    })
                    self.$nextTick(()=>{
                        self.getUngroupeds();
                        setTimeout(function(){
                           self.$transfer.translationDel(".ungroup");
                        },1000)
                    });
                    
                    //把获取的分组信息保存在本地
                    Tokens.save("peopleGroup",self.userGroups);
                    setTimeout(function(){
                        self.$transfer.translationDel(".updata");
                    },1000)
                }
                self.groupShow1 = true;
                if(self.groupShow1 == true && self.groupShow2 == true){
                    self.$Indicator.close();
                }
            });
        },
        //得到未分组用户列表
        getUngroupeds(){
            let self = this;
            //用户Id
            self.searchNum ++;
            self.userId = self.token.userId;
            let cfgId = self.token.userId +"-*";
            if(self.wfzId == ''){
                self.wfzId = cfgId;
            }
            let s = {action: "/cmsMyFriends/query",params: {cmfUserId1: self.userId,cmfGroupId: self.wfzId,findString:self.searchVal,}}
            doAjaxQuery(s, function(data){
                if(data.status == 0){
                    self.$transfer.backLogin(self, data);
                }else if(data.status == 1){
                    consoleShow(data)         
                    let unGroupeds = data.dataset.rows;
                    if(unGroupeds && unGroupeds.length > 0){
                        unGroupeds.forEach(function(item, index){
                            item.suLogo = getImgURL() +'user/' +item.suLogo;
                            var ImgObj = new Image(); 
                            ImgObj.src = item.suLogo; 
                            ImgObj.onerror = function(){
                                item.suLogo = getImgURL() + 'user/default.png';
                            }
                        })
                        self.arr2 = friendSortList(unGroupeds,self.arr2)
                        self.nodata = '已全部加载'
                        setTimeout(function(){
                            self.$transfer.translationDel(".updata");
                        },1000)
                    }else{
                        self.arr2 = [];
                        self.nodata = '没有相关数据'
                    }
                    if(self.isLoadId){
                        self.$nextTick(()=>{
                            self.$broadcast('onTopLoaded', self.isLoadId); 
                            self.isLoadId = null;
                        }) 
                    } 
                }
                self.groupShow2 = true;
                if(self.groupShow1 == true && self.groupShow2 == true){
                    self.$Indicator.close();
                }
            });
        },
        deleteGroup(index){//删除分组
            let self = this;
            let userId = Tokens.fetch('token')['userId'];
            let ifcurrRow = self.userGroups[index];
            if(ifcurrRow.cfg_person_num == 0){
                MessageBox.confirm(
                '这是一个空分组,确定删除?',
                {'showCancelButton': true,'cancelButtonClass':'cancelbtn','confirmButtonText':"取 消",'confirmButtonClass':'verify','confirmButtonText':"确 定"}
                ).then(action => {
                    self.$Indicator.open();
                    let s = {action:'/cmsFriendGroup/save',params:{userIdMobileCode:userId,indexSearch:1}};
                    s.datasets = {"dsData":{"rows":[{"rowId":ifcurrRow.cfgId,"cfgId":ifcurrRow.cfgId,"cfgModifyDate":ifcurrRow.cfgModifyDate,"state":"d"}]}}
                    doAjaxUpdate(s,function(data){
                        if(data.status == 0){
                            self.$transfer.backLogin(self, data);
                        }else if(data.status == 1){
                            consoleShow(data)
                            self.userGroups.splice(index,1);
                        }
                        self.$Indicator.close();
                    })
                }).catch(function(){
                    let as = document.querySelectorAll('.ungroup');
                    Array.from(as).forEach(function(item,index){
                        item.style.WebkitTransform = "translateX(" + 0 + "px)";
                    })
                });
            }else{
                MessageBox.confirm(
                '该分组下还有伙伴存在,删除后伙伴回到默认分组!',
                {'showCancelButton': true,'cancelButtonClass':'cancelbtn','confirmButtonClass':'verify','confirmButtonText':"确 定"}
                ).then(action => {
                    self.$Indicator.open();
                    let s = {action:'/cmsFriendGroup/save',params:{userIdMobileCode:userId,indexSearch:1}};
                    s.datasets = {"dsData":{"rows":[{"rowId":ifcurrRow.cfgId,"cfgId":ifcurrRow.cfgId,"cfgModifyDate":ifcurrRow.cfgModifyDate,"state":"d"}]}}
                    doAjaxUpdate(s,function(data){
                        if(data.status == 0){
                            self.$transfer.backLogin(self, data);
                        }else if(data.status == 1){
                            consoleShow(data)
                            self.userGroups.splice(index,1);
                        }
                        self.$Indicator.close();
                    })
                }).catch(function(){
                    let as = document.querySelectorAll('.ungroup');
                    Array.from(as).forEach(function(item,index){
                        item.style.WebkitTransform = "translateX(" + 0 + "px)";
                    })
                });
            }
        },
        // getTruckData(){//获取人员列表信息
            //     let self = this;
            //     let s = {action:"/cmsMyFriends/query",params:{findString:self.searchVal,cmfUserId1:self.token.userId,cmfGroupId:self.wfzId}};
            //     // consoleShow(JSON.stringify(s))
            //     self.showloadmore = true;
            //     self.loadMax = false;
            //     self.nodata = "";
            //     self.arr2 = [];
            //     doAjaxQuery(s,function(data) {
            //         if(data.status == 0){
            //             self.$transfer.backLogin(self, data);
            //         }else if(data.status == 1){
            //             // consoleShow(data)
            //             let arr = data.dataset.rows;
            //             arr.forEach(function(item, index){
            //                 item.suLogo = getImgURL() +'user/' +item.suLogo;
            //                 var ImgObj = new Image(); 
            //                 ImgObj.src = item.suLogo; 
            //                 ImgObj.onerror = function(){
            //                     item.suLogo = getImgURL() + 'user/default.png';
            //                 }
            //             })
            //             self.arr2 = friendSortList(arr,self.arr2)
            //             if(self.arr2.length == 0){
            //                 self.nodata = '没有相关数据'
            //             }
            //             setTimeout(function(){
            //                 self.$transfer.translationDel(".updata");
            //             },1000)
            //         }
            //         self.showloadmore = false;
            //         self.loading = false;
            //     })
        // },
    },
    route: {
        data ({ to, next }) {
            let self = this;
            //进入页面时token不存在
            if(!localStorage.getItem("token")){
                self.$transfer.backLogin(self, {info:'token没有值'});
                return;
            }
            self.searchNum = 0;
            self.searchVal = '';
            self.token = Tokens.fetch("token");
            self.$Indicator.open();
            //得到用户分组
            self.getUserGroups();
            self.$nextTick(()=>{
                setTimeout(function(){
                    self.$transfer.translationDel(".updata");
                },1000)
                if(browserType == "android"){
                    let str = window.AndroidWebView.showInfoFromJs();//获得通讯录只有name和phone
                    let strs = JSON.parse(str);//JSON字符串转化为数组
                    Tokens.save('MobilePhone',strs)
                }
            })
                
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
            $('#groupMysearch').slideDown();
            next();
        },
        activate({to, from, next}) {
            let self = this;
            let subSystem = localStorage.getItem("subSystem");
            if(subSystem){
                self.$parent.$data.subSystem = subSystem;
            }
            self.$parent.$data.showBar = true;
            self.$parent.$data.MainSelect = "friends";
            next();
        }  
    }
}
</script>

<style scoped>
    .ugroup{
        overflow: hidden;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height:2.25rem;
        /*border-bottom: 1px solid #e5e5e5;*/
        background: #fff;
    }
    .deleteCard{
        color: #fff;
        background: #f00;
        position: absolute;
        top: 0.05rem;
        right: 1px;
        text-align: center;
        width: 100px;
        height:2.15rem;
        line-height: 2.15rem;
    }
    .ungrouped_title{
        height: 25px;
        line-height: 25px;
        padding-left: 15px;
        padding-right: 15px;
        font-size: 14px;
        color: #777;
    }
    .groupItem{
        height: 51px;
        padding-left: 15px;
        padding-right: 15px;
        background: #fff;
        line-height: 50px;
        border-bottom: 1px solid #ededed;
    }
    .groupItem > img{
        width: 35px;
        margin-top: 7.5px;
        display: block;
        float: left;
    }
    .groupItem > span{
        margin-left: 10px;
        display: block;
        float: left;

    }
    /*添加分组样式*/
    .newGroup img{
        width:1.5rem;
        margin-right:.25rem;
    }
     
    .font{
        font-size:1.5rem;
        color:#fff;
        border-radius: 5px;
        margin:0 .2rem 0 .5rem;
    }
    
    .fonts{
        background-color: #ffd91e;
    }
    .nodata{
        text-align:center;margin:0.5rem 0;
    }
</style>

