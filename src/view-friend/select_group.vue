<template>
    <div class="page">
        <mt-header fixed title="加入到分组">
            <mt-button icon="back" slot="left" @click="backClose()"></mt-button>    
            <mt-button slot="right" class="save" @click="saveBtn()">保存</mt-button>         
        </mt-header>
        <div id="selectGroupSearch" class="container-search">
            <mysearch :value.sync="searchVal" placeholder="组名"></mysearch>
        </div>
        <div class="container-top" id="newGroupList">
            <div class="newGroup">
                <img class="newImg lf" src="../img/friends/a_newgrouping_on.png"/>
                <input @focus="iptFocus($event)" @blur="iptBlur($event)" class="lf nameIpt" type="text" v-model="new_name">
                <button class="rg ensure" @click="makeSure()">确定</button>
            </div>
            <div class="userGroup" :style="{marginTop:marginTop + 'px'}" id="groupLists">
                <mypulldown style="margin-top:2.8rem;">
                    <div slot= "pullList" :style = "{minHeight:listViewH + 'px'}" style="padding-bottom:2rem;">
                        <div style="position:relative;height:2.2rem;" v-for="(index,userGroup) in userGroups">
                            <div class="ugroup" @click.stop="group_details(index,userGroup)">
                                <div class="selct" :class="{selcted:userGroup.show == 0?true:false}" :id="index"></div>
                                <span class="iconfont font" :style="{backgroundColor:userGroup.bgc}">{{{userGroup.logo}}}</span>
                                <span class="groupName">{{userGroup.cfgName}}</span>
                            </div>
                        </div>
                        <div class="nodata">{{nodata}}</div>
                    </div>
                </mypulldown>
            </div>
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

            //搜索框
            searchVal:'',//搜索框的值
            timer:false,//是否执行搜索的定时器
            truckList:[],//列表数据
            currPage:1,//当前页面
            nodata:'',//加载没有数据
            loading:false,//可以无限加载
            loadMax:false,//已全部加载
            showloadmore:false,//显示加载标示

            //正常数据
            toke:'',//本地token
            items:'',//进入页面时当前伙伴的信息
            from_path:'',//进入的路径以及返回的路径

            new_name:'',//新建分组名称
            marginTop:'',//分组列表marginTop
            userGroups:[],//分组的数组
            groupList:[],//选中分组列表(改为只能有一个)
            selctedShow:false,//选中状态
            datalist:'',//暂时保存数据

            //分组信息切换
            obj:[],//由分组详情进入的信息资料
            str:{},//详细资料

            beforeScrollTop:0,//存储页面当前scrollTop
            searchNum:0,

            statusNum:0,//开始进入状态码
            noGroupList:{},//未分组信息
        }
    },
    ready(){
        let self = this;
        //列表框的最小高度
        self.$nextTick(()=>{
            self.listViewH = $("#newGroupList").height() - $("#selectGroupSearch").height()-10;
        })
        searchBoxIsShow('#newGroupList','#selectGroupSearch',self.beforeScrollTop,function(top){
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
                    self.userGroups = [];
                    self.currPage = 1;
                    self.nodata = '';
                    self.loading = false;
                    self.loadMax = false;
                    self.showloadmore = false;
                    self.getGroupdata();
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
                self.groupList = [];
                self.statusNum = 0;
                self.searchVal = '';
                self.userGroups = [];
                self.searchNum = 0;
                self.getGroupdata();
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
        backClose(){//返回按钮点击
            let self = this;
            self.new_name = '';
            self.currPage = 1;
            self.nodata = '';
            self.loading = false;
            self.loadMax = false;
            self.showloadmore = false;
            self.searchVal = '';
            self.userGroups = [];
            Tokens.save('selectGroupPath','');//清空进入路径
            self.back(self.from_path);
        },
        compare(property){//排序
            return function(a,b){
                let value1 = a[property];
                let value2 = b[property];
                return value1 - value2;
            }
        },
        loopFind(){//循环查找是不是选中状态
            let self = this;
            for(let x=0;x<self.userGroups.length;x++){
                if(self.userGroups[x].show == 0){
                    self.userGroups[x].show = 1;
                }
            }
        },
        getGroupdata(){//获取分组列表信息
            let self = this;
            self.statusNum++;
            self.searchNum++;
            let s = {action: "/cmsFriendGroup/query1",params: {"userIdMobileCode":self.toke.userId,"cfgSubSystem":self.toke.subSystem,"indexSearch":"1",findString:self.searchVal}};
            s.showFields= "cfg_person_num,cfgName,cfgId,cfgSort,cfgModifyDate,cfgType,cfgSubSystem,rowId,ifcurrRow,icon"
            doAjaxQuery(s,function(data) {
                if(data.status == 0){
                    self.$transfer.backLogin(self, data);
                }else if(data.status == 1){
                    consoleShow(data)
                    let arr = data.dataset.rows;
                    if(arr && arr.length > 0){
                        if(self.statusNum == 1){
                            if(self.from_path == '/friend_detail'){
                                for(let key in arr){
                                    if(arr[key].cfgName == self.obj[0].cmfGroupName){
                                        arr[key].show = 0;
                                        arr[key].cfgSort = 100;
                                        self.groupList.push(arr[key])
                                    }else{
                                        arr[key].show = 1;
                                    }
                                    if(arr[key].cfgName == '未分组'){
                                        self.noGroupList = arr[key]
                                    }
                                }
                            }else{
                                if(self.groupList.length == 0){//第一次加载的时候
                                    for(let key in arr){
                                        if(arr[key].cfgName == '未分组'){
                                            arr[key].show = 0;
                                            arr[key].cfgSort = 100;
                                            self.noGroupList = arr[key];
                                            self.groupList.push(arr[key])
                                        }else{
                                            arr[key].show = 1;
                                        }
                                    }
                                }
                            }
                        }else{
                            for(let key in arr){
                                if(arr[key].cfgName == self.groupList[0].cfgName){
                                    arr[key].show = 0;
                                }else{
                                    arr[key].show = 1;
                                }
                            }
                        }
                        arr.sort(self.compare('cfgSort'));//按照cfgSort排序   
                        arr.forEach(function(item, index){
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
                        self.userGroups = arr;
                        self.nodata = '已全部加载';
                    }else{
                        self.userGroups = [];
                        self.nodata = "没有相关数据"
                    }
                    if(self.isLoadId){
                        self.$nextTick(()=>{
                            self.$broadcast('onTopLoaded', self.isLoadId); 
                            self.isLoadId = null;
                        }) 
                    }  
                }
                self.$Indicator.close();
            })
        },
        group_details(key,val){//点击选中事件
            let self = this;
            //列表若有点击跳转事件，在下拉时阻止点击跳转
            let isStop = isXLorClick();
            if(isStop){
                return;
            }
            if(val.cfgName != "未分组"){
                if($("#"+key).is('.selcted')){//是已经选中状态
                    val.show = 1;
                    self.groupList = [];
                    self.noGroupList.show = 0;
                    self.groupList.push(self.noGroupList)
                    for(let key in self.userGroups){
                        if(self.userGroups[key].cfgName == self.noGroupList.cfgName){
                            self.userGroups[key].show = 0;
                        }
                    }
                }else{//不是已经选中状态
                    val.show = 0;
                    self.groupList = [];
                    self.groupList.push(val);
                    self.loopFind();
                    self.userGroups[key].show = 0;
                }
            }else{//点击的是未分组
                if(self.groupList[0].cfgName != '未分组'){
                    self.groupList = [];
                    val.show = 1;
                    self.groupList.push(val);
                    self.loopFind();
                    self.userGroups[key].show = 0;
                }
            }
        },
        iptFocus(e){//获得焦点触发事件
            let self = this;
            let current = e.target;
            $(current).css('border','1px solid #ccc')
        },
        iptBlur(e){//失去焦点触发事件
            let self = this;
            let current = e.target;
            $(current).css('border','1px solid #ededed')
        },
        makeSure(){//添加分组确定按钮
            let self = this;
            if(self.new_name == ''){
                self.$transfer.showToast(self, "组名不能为空");
                return
            }else{
                let s = {action:"/cmsFriendGroup/save",commandType:"Update"};
                s.datasets = {dsData:{rows:[{rowId:self.toke.rowId,"state":"i","cfgName":self.new_name,"cfgUserId":self.toke.userId,cfgSubSystem:self.toke.subSystem}]}}
                doAjaxUpdate(s,function(data) {
                    if(data.status == 0){
                        self.$transfer.backLogin(self, data);
                    }else if(data.status == 1){
                        consoleShow(data)
                        let obj = data.datasets.dsData.rows[0];
                        obj.logo = '&#xe643;';
                        obj.bgc = '#ffd91e';
                        obj.class = 'ungroup';
                        obj.show = 0;
                        obj.cfgName = self.new_name;
                        self.loopFind();
                        self.userGroups.unshift(obj)
                        self.groupList = [];
                        self.groupList.push(obj)
                        self.new_name = '';
                    }
                })
            }
        },
        saveBtn(){//点击保存按钮
            let self = this;
            // self.$Indicator.open();
            let row = [];
            let s;
            if(self.from_path == '/friend_detail'){
                let s = {action:'/cmsMyFriends/del/'+self.obj[0].cmfId,params:{cmfUserId1:self.toke.userId,cmfGroupId:self.obj[0].cmfGroupId}};
                doAjaxUpdate(s,function(data){
                    if(data.status == 0){
                        self.$transfer.backLogin(self, data);
                    }else if(data.status == 1){
                        consoleShow(data)
                        self.groupList.forEach(function(item,index){
                            let t = {rowId:item.rowId,cmfId:'',cmfUserId1:self.toke.userId,cmfUserId2:self.str.suId,cmfNickName:self.str.suName,cmfGroupId:item.cfgId,cmfModifyDate:'',state:'i'}
                            row.push(t);
                        })
                        s = {action:'/cmsMyFriends/save',params:{"firstAdd":"1"}};
                        s.datasets = {dsData:{rows:row}}
                        self.saveBtnMeans(s)
                    }
                })
            }else{
                self.groupList.forEach(function(item,index){
                    console.log(item)
                    let t = {rowId:item.rowId,cmfId:'',cmfUserId1:self.toke.userId,cmfUserId2:self.items.suId,cmfNickName:self.items.suName,cmfGroupId:item.cfgId,cmfModifyDate:'',state:'i'}
                    row.push(t);
                })
                s = {action:'/cmsMyFriends/save',params:{"firstAdd":"1"}};
                s.datasets = {dsData:{rows:row}}
                self.saveBtnMeans(s)
            }
        },
        saveBtnMeans(s){
            let self = this;
            doAjaxUpdate(s,function(data) {
                if(data.status == 0){
                    self.$transfer.backLogin(self, data);
                }else if(data.status == 1){
                    self.new_name = '';
                    self.currPage = 1;
                    self.nodata = '';
                    self.loading = false;
                    self.loadMax = false;
                    self.showloadmore = false;
                    self.searchVal = '';
                    self.userGroups = [];
                    self.groupList = [];
                    self.back(self.from_path)
                }
                self.$Indicator.close();
            })
        },
        // getNewGroup(){//搜索分组
        //     let self = this;
        //     let s = {action:"/cmsFriendGroup/query",params:{cfgUserId:self.toke.userId,cfgSubSystem:self.toke.subSystem,findString:self.searchVal}};
        //     consoleShow(JSON.stringify(s))
        //     self.showloadmore = true;
        //     self.loadMax = false;
        //     self.nodata = "";
        //     self.userGroups = [];
        //     doAjaxQuery(s,function(data) {
        //         if(data.status == 0){
        //             self.$transfer.backLogin(self, data);
        //         }else if(data.status == 1){
        //             consoleShow(data);
        //             let arr = data.dataset.rows;
        //             arr.sort(self.compare('cfgSort'));//按照cfgSort排序
        //             if(arr.length != 0){
        //                 arr.forEach(function(item, index){
        //                     if(item.cfgName == '司机'){
        //                         item.logo = '&#xe63f;';
        //                         item.bgc = '#333';
        //                         item.show = 1;
        //                     }else if(item.cfgName == '客户'){
        //                         item.logo = '&#xe65d;';
        //                         item.bgc = '#333';
        //                         item.show = 1;
        //                     }else if(item.cfgName == '同事'){
        //                         item.logo = '&#xe642;';
        //                         item.bgc = '#333';
        //                         item.show = 1;
        //                     }else if(item.cfgName == '同行'){
        //                         item.logo = '&#xe707;';
        //                         item.bgc = '#333';
        //                         item.show = 1;
        //                     }else if(item.cfgName == '承运人'){
        //                         item.logo = '&#xe707;';
        //                         item.bgc = '#333';
        //                         item.show = 1;
        //                     }else{
        //                         item.logo = '&#xe643;';
        //                         item.bgc = '#ffd91e';
        //                         item.class = 'ungroup';
        //                         item.show = 1;
        //                     }
        //                 })
        //                 for(let key in arr){
        //                     if(arr[key].cfgName == self.groupList[0].cfgName){
        //                         arr[key].show = 0;
        //                     }
        //                 }
        //             }
        //             self.$nextTick(()=>{
        //                 self.userGroups = arr;
        //                 if(self.userGroups.length == 0){
        //                     self.nodata = "没有相关数据"
        //                 }else{
        //                     self.nodata = '已全部加载';
        //                 }
        //             });
        //         }
        //         self.showloadmore = false;
        //         self.loading = false;
        //     })
        // }
    },
    route: {
        data ({ from, to, next }) {
            let self = this;
            //进入页面时token不存在
            if(!localStorage.getItem("token")){
                self.$transfer.backLogin(self, {info:'token没有值'});
                return;
            }
            //防止页面刷新路径的消失
            if(from.path){
                Tokens.save('selectGroupPath',from.path)
                self.from_path = from.path;
            }else{
                self.from_path = Tokens.fetch('selectGroupPath');
            }
            //数据清空
            self.statusNum = 0;
            self.searchNum = 0;
            self.searchVal = '';
            self.groupList = [];
            self.toke = Tokens.fetch('token');
            if(self.from_path.indexOf('friend_detail') == 1){
                self.obj = Tokens.fetch('changeGroupData');
                self.str = Tokens.fetch('friendDetail');
            }else{
                self.items = Tokens.fetch('select_group');
            }
            
            self.$nextTick(()=>{
                let newGroup = $(".newGroup").height();
                let selmen = $("#selectGroupSearch").height();
                self.marginTop = newGroup + selmen + 10;

                self.$Indicator.open();
                self.getGroupdata();
            })
            next()
        },
        canDeactivate({to, from, next}) {
            let self = this;
            $('#selectGroupSearch').slideDown();
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
    .lf{float:left;}
    .rg{float: right;}
    .save{/*保存*/
        color:#FFD91E;
    }
    /*搜索框*/
    /*#search{
        width:100%;
        position: fixed;
        top:44px;
        left:0;
        z-index: 5;
    }*/
    /*新建分组*/
    .newGroup{
        width:100%;
        height:2rem;
        line-height: 2rem;
        position: absolute;
        top:2.8rem;
        left:0;
        z-index:5;
        background-color: #fff;
    }
    .newImg{
        margin:0.25rem .5rem;
        display: block;
        width:1.5rem;
    }
    .nameIpt{
        -webkit-appearance:none;
        width:55%;
        height:.5rem;
        line-height: .5rem;
        margin-top: .25rem;
        padding:.5rem;
        border:1px solid #ededed;
        border-radius: .15rem;
    }
    .ensure{
        width:15%;
        height:1.5rem;
        line-height: 1.5rem;
        margin-top: .25rem;
        margin-right: .5rem;
        border:none;
        border-radius: .15rem;
        background-color: #353535;
        color:#FFD91E;
    }
    /*分组列表*/
    .userGroup{
        margin-bottom:2.5rem;
    }
    .ugroup{
        overflow: hidden;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height:2.2rem;
        padding:0 .5rem;
        border-bottom: 1px solid #e5e5e5;
        background-color: #fff;
    }
    .font{
        font-size:1.5rem;
        color:#fff;
        border-radius: 5px;
        margin:0 .2rem 0 0;
    }
    .selct{
        float: left;
        margin-top: .7rem;
        margin-right:.5rem;
        width:.8rem;height:.8rem;
        border-radius: .8rem;
        border:2px solid #aaa;
    }
    .groupName{
        position:absolute;
        top:.6rem;
        left:3.7rem;
    }
    .selcted{
        background-color: #FFD91E;
    }
    .nodata{
        text-align:center;margin:0.5rem 0;
    }
</style>