<template>
	<div class="page">
		<mt-header fixed :title="message">
            <mt-button icon="back" slot="left" @click="backPath()"></mt-button>
            <mt-button class="save" slot="right" @click="achieved()">完成</mt-button>
        </mt-header>
        <div id="addMemberSearch" class="container-search">
            <mysearch :value.sync="searchVal" placeholder="手机号、姓名、推流号"></mysearch>
        </div>
        <div class="container-top topEnt" id="new_group">
            <mypulldown style="margin-top:2.8rem;">
                <div slot= "pullList" :style = "{minHeight:listViewH + 'px'}">
                    <div style="margin-bottom:2.5rem;">
                    	<my-new-friend :details="arr2" :nums="nums" :pitchup="pitchUp"></my-new-friend>
                    	<div class="nodata">{{nodata}}</div>
                    </div>
                </div>
            </mypulldown>
            <my-letter-index :uptop="uptop"></my-letter-index>    
        </div>
    </div>
</template>
<script>
import Tokens from '../token'
import  Mysearch  from '../components/mysearch'
import  MyNewFriend  from '../components/mynewfriend'
import  MyLetterIndex  from '../components/myletterindex'
import  Mypulldown from '../components/mypulldown'//引入下拉刷新的组件
export default {
	components: {
        Mysearch,MyNewFriend,MyLetterIndex,Mypulldown
    },
	data () {
        return {
            listViewH:0,//下拉刷新框的最小高度
            isLoadId:null,//用来存储下拉刷新时带过来的id,初始设置为null,在数据加载完成后清除加载指示时

            backMemberPath:'',//判断路径
        	token:'',//token值
        	message:'',//头标题
        	groupId:'',//分组ID
        	form_path:'',//进入路径
        	arr2:[],//传入的数组列表
        	pitchUpList:[],//选中的所有信息
            uptop:100,

        	//搜索框
            searchVal:'',//搜索框的值
            timer:false,//是否执行搜索的定时器
            truckList:[],//列表数据
            currPage:1,//当前页面
            nodata:'',//加载没有数据
            loading:false,//可以无限加载
            loadMax:false,//已全部加载
            showloadmore:false,//显示加载标示

            members:'',//传入的id
            userparams:{},//存在本地的

            pitchUp:[],
            beforeScrollTop:0,//存储页面当前scrollTop
            searchNum:0,
        }
    },
    events:{
        optfor(a,index,item,list){
            let self = this;
            self.pitchUpList = list;
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
                self.first_blood();
            }, 1000);
        },
    },
    ready(){
        let self = this;
        //列表框的最小高度
        self.$nextTick(()=>{
            self.listViewH = $("#new_group").height() - $("#addMemberSearch").height()-10;
        })
        searchBoxIsShow('#new_group','#addMemberSearch',self.beforeScrollTop,function(top){
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
                    self.first_blood();
                    self.timer = false;
                },500);
            }
        }
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
        backPath(){//返回上一页面
        	let self = this;
        	self.pitchUpList = [];
            self.arr2 = [];
            self.truckList = [];
            self.currPage = 1;
            self.nodata = '';
            self.loading = false;
            self.loadMax = false;
            self.showloadmore = false;
            self.searchVal = '';
            self.defaultimg = true;
            Tokens.save('exUserAddList','')
            Tokens.save("addMemberBackPath",'');
            self.back(self.from_path)
        },
        first_blood(){//页面进入每一次加载的数据
        	let self = this;
            self.searchNum++;
            let cfgId = self.token.userId +"-*";
            let s;
            if(self.backMemberPath == '/group_sort'){
                s = {action:"/cmsMyFriends/query"};
                s.params = {findString:self.searchVal,filterGroupId:self.groupId,"cmfUserId1":self.token.userId,cmfGroupId: cfgId,isFilterAdd:"true"};
            }else if((self.backMemberPath == '/taskOrderAddExtremely') || (self.backMemberPath == '/taskOrderExDetail') || (self.backMemberPath == '/taskOrderExSummed') || (self.backMemberPath == '/addNotice')){
                s = {action:"/cmsMyFriends/query1"};
                s.params = self.userparams;
                s.params.findString = self.searchVal;
            }else if(self.backMemberPath == '/add_group'){
                s = {action:"/cmsMyFriends/query"};
                s.params = {findString:self.searchVal,filterGroupId:self.groupId,"cmfUserId1":self.token.userId,cmfGroupId: cfgId};
            }

        	doAjaxQuery(s,function(data) {
                if(data.status == 0){
                    self.$transfer.backLogin(self, data);
                }else if(data.status == 1){
                    consoleShow(data)
                    let arr = data.dataset.rows;
                    if(arr && arr.length>= 0){
                        if(self.pitchUpList.length != 0){
                            for(let k = 0;k<self.pitchUpList.length;k++){
                                for(let a = 0;a<arr.length;a++){
                                    if(self.pitchUpList[k].suId == arr[a].suId){
                                        arr[a].show = '0';
                                    }
                                }
                            }
                        }
                        self.loadMax = true;
                        self.nodata = '已全部加载';
                        self.$nextTick(()=>{
                            arr.forEach(function(item, index){
                                item.suLogo = getImgURL() +'user/' +item.suLogo;
                                var ImgObj = new Image(); 
                                ImgObj.src = item.suLogo; 
                                ImgObj.onerror = function(){
                                    item.suLogo = getImgURL() + 'user/default.png';
                                }
                                item.show = '1';
                            })
                            self.arr2 = friendSortList(arr,self.arr2)
                        }) 
                    }else{
                        self.arr2 = [];
                        self.nodata = '没有可添加的成员'
                    }
                    if(self.isLoadId){
                        self.$nextTick(()=>{
                            self.$broadcast('onTopLoaded', self.isLoadId); 
                            self.isLoadId = null;
                        }) 
                    }
                }
                self.showloadmore = false;
                self.loading = false;
                self.$Indicator.close();
            })
        },
        database(s){//提交数据
            let self = this;
            doAjaxUpdate(s,function(data) {
                if(data.status == 0){
                    self.$transfer.backLogin(self, data);
                }else if(data.status == 1){
                    consoleShow(data)
                    self.currPage = 1;
                    self.nodata = '';
                    self.loading = false;
                    self.loadMax = false;
                    self.showloadmore = false;
                    self.searchVal = '';
                    self.defaultimg = true;
                    self.arr2 = [];
                    self.pitchUpList = [];
                    self.truckList = [];
                    Tokens.save("from_path",'');
                    if(self.backMemberPath == '/add_group'){
                        self.back('/friends')
                    }else{
                        self.back(self.from_path)
                    } 
                }
                self.$Indicator.close();
            })
        },
        achieved(){//完成提交选中的成员
        	let self = this;
        	if(self.pitchUpList.length == 0){
                self.$transfer.showToast(self, "您还没有添加新成员");
                return;
            }else{
                let rows = [] ;
                let member = [];
                let s = {action:'/cmsMyFriends/save',commandType:"Update"};
                if(self.backMemberPath == '/add_group'){
                    self.$Indicator.open();
                    self.pitchUpList.forEach(function(item,index){
                        let row = {cmfId:'',cmfUserId1:item.cmfUserId1,cmfUserId2:item.cmfUserId2,cmfGroupId:self.groupId,cmfModifyDate:'',cmfNickName2:item.cmfNickName2,state:'i'};
                        rows.push(row);
                        member.push(item.suId);
                    })
                    s.params = {userId2s:self.members};
                    s.datasets = {dsData:{rows:rows}};
                    self.database(s);
                }else if(self.backMemberPath == '/group_sort'){
                    self.$Indicator.open();
                    self.pitchUpList.forEach(function(item,index){
                        let row = {cmfId:'',cmfUserId1:item.cmfUserId1,cmfUserId2:item.cmfUserId2,cmfNickName:item.cmfNickName,cmfGroupId:self.groupId,cmfModifyDate:'',cmfNickName2:item.cmfNickName2,rowId:'',state:'i'};
                        rows.push(row);
                        member.push(item.suId);
                    })
                    self.members = member.join(",");
                    s.params = {cmfUserId1:self.token.userId,cmfGroupId:self.groupId,userId2s:self.members};
                    s.datasets = {dsData:{rows:rows}}
                    self.database(s);
                }else if((self.backMemberPath == '/taskOrderAddExtremely') || (self.backMemberPath == '/taskOrderExDetail') || (self.backMemberPath == '/taskOrderExSummed') || (self.backMemberPath == '/addNotice')){
                    Tokens.save('exUserAddList',self.pitchUpList)
                    self.currPage = 1;
                    self.nodata = '';
                    self.loading = false;
                    self.loadMax = false;
                    self.showloadmore = false;
                    self.searchVal = '';
                    self.defaultimg = true;
                    self.arr2 = [];
                    self.pitchUpList = [];
                    self.truckList = [];
                    Tokens.save("from_path",'');
                    self.back(self.from_path)
                }               
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
            self.token = Tokens.fetch("token");
            Tokens.save('exUserAddList','')
            self.arr2 = [];
            self.pitchUpList = [];
            self.pitchUp = [];
            self.searchVal = '';
            self.searchNum = 0;
            if(self.$route.params.nameId.indexOf("|") != -1){
                let obj = self.$route.params.nameId.split('|');
                self.message = obj[0];
                self.groupId = obj[1];
            }else{//tms-公告发起
                self.message = self.$route.params.nameId;
            }
            
            if(from.path){
            	Tokens.save("addMemberBackPath",from.path);
            	self.from_path = from.path;
            }else{
            	self.from_path = Tokens.fetch("addMemberBackPath");
            }
            self.$nextTick(()=>{
                if(self.from_path.indexOf('group_sort')==1){
                    self.backMemberPath = '/group_sort';
                }else if(self.from_path.indexOf('add_group')==1){
                    self.backMemberPath = '/add_group';
                }else if(self.from_path.indexOf('taskOrderAddExtremely')==1){
                    self.userparams = Tokens.fetch("addExUserParams");
                    self.backMemberPath = '/taskOrderAddExtremely';
                }else if(self.from_path.indexOf('taskOrderExDetail')==1){
                    self.userparams = Tokens.fetch("addExUserParams");
                    self.backMemberPath = '/taskOrderExDetail';
                }else if(self.from_path.indexOf('taskOrderExSummed')==1){
                    self.userparams = Tokens.fetch("addExUserParams");
                    self.backMemberPath = '/taskOrderExSummed';
                }else if(self.from_path.indexOf('addNotice')==1){//tms-公告发起
                    self.userparams = Tokens.fetch("addExUserParams");
                    self.backMemberPath = '/addNotice';
                }
                self.$Indicator.open();
                self.first_blood()
            })
            next()
        },
        deactivate ({ next }) {
            //Triggers when component destroys
            next()
        },
    }
}
</script>
<style scoped>
	.save{
        color:#FFD91E;
    }
    .nodata{
      text-align:center;margin:0.5rem 0;
    }
</style>