<template>
	<div class="page">
		<mt-header fixed :title="title">
            <mt-button icon="back" slot="left" @click="backLast()"></mt-button>
        </mt-header>
        <div id="addFriendSearch" class="container-search">
            <mysearch :value.sync="searchVal" placeholder="手机号、姓名、推流号"></mysearch>
        </div>
        <div class="container-top topEnt" id="addFriend">
            <mypulldown style="margin-top:2.8rem;">
                <div slot= "pullList" :style = "{minHeight:listViewH + 'px'}">
                    <div v-if="TiuloFriendShow">
                        <my-add-friends :details="friendlist" :pitchup="pitchUpList"></my-add-friends>
                        <div class="nodata">{{nodata}}</div>
                    </div>
                    <div v-if="telFriendShow">
                        <my-tel-friends :details="mobileList"></my-tel-friends>
                    </div>
                </div>
            </mypulldown>
            <my-letter-index :uptop="uptop"></my-letter-index>
            <div class="select_box" v-show="sureShow">
                <span class="people_num">已选择: {{listLenght}} 人</span>
                <div class="btn_box">
                    <button class="make_sure" @click.stop="makeSure()">确定</button>
                </div>
            </div>  
        </div>
	</div>
</template>
<script>
import Tokens from '../token'
import  Mysearch  from '../components/mysearch'
import  Mypulldown from '../components/mypulldown'//引入下拉刷新的组件 
import  MyLetterIndex  from '../components/myletterindex'
import  MyAddFriends  from '../components/myaddfriends'
import  MyTelFriends  from '../components/mytelfriends'
import PinYin from '../pinyin'
export default {
    components: {
        Mysearch,Mypulldown,MyLetterIndex,MyAddFriends,MyTelFriends
    },
	data () {      
        return{
        	// 公共属性
            listViewH:0,//下拉刷新框的最小高度
            isLoadId:null,//用来存储下拉刷新时带过来的id,初始设置为null,在数据加载完成后清除加载指示时
            toke:'',//本地token的值
            version:'',//当前是哪个版本
            pathWay:'',//路径的保存
            title:'',//头部
            beforeScrollTop:0,//存储页面当前scrollTop
            // 推流好友
            TiuloFriendShow:false,//推流好友显示
            friendlist:[],//最终拿到的朋友列表数组
            uptop:100,
            pitchUpList:[],//选中的所有信息
            listLenght:0,//选中的长度
            sureShow:false,//确认框
            //手机通讯录
            telFriendShow:false,//手机通讯录显示
            mobileList:[],//手机通讯录上的列表
            arr:[{name:'老王',phone:'18537072262'},{name:'马汉',phone:'18537072260'},{name:'张黎',phone:'18537072261'},{name:'王再阳',phone:'18537072263'},{name:'李小标',phone:'18537072264'},{name:'冯姐',phone:'18626867929'}],//手机通讯录上的列表

            //搜索框
            searchVal:'',//搜索框的值
            timer:false,//是否执行搜索的定时器
            nodata:'',//加载没有数据
        }
    },
    ready(){
        let self = this;
        //列表框的最小高度
        self.$nextTick(()=>{
            self.listViewH = $("#addFriend").height() - $("#addFriendSearch").height()-10;
        })
        searchBoxIsShow('#addFriend','#addFriendSearch',self.beforeScrollTop,function(top){
            self.beforeScrollTop = top;
        })
    },
    watch:{
        'pitchUpList':function(e){
            let self = this;
            if(e.length == 0){
                self.sureShow = false;
            }else{
                self.listLenght = e.length;
                self.sureShow = true;
            }
        },
        //搜索内容改变执行此方法
        'searchVal': function(e){
            let self = this;
            // if(self.searchNum == 0){//刚进来重置searchVal不执行搜索
            //     self.searchNum++;
            //     return;
            // } 
            //设置延迟执行
            clearInterval(self.timer);
            if(!self.timer){
                self.timer = true;
                setTimeout(function(){
                    self.nodata = '';
                    self.first_blood();
                    self.timer = false;
                },500);
            }
        }
    },
    events:{
        selectFriend(a,index,item,list){
            let self = this;
            console.log(list)
            console.log(self.pitchUpList)
            self.pitchUpList = list;
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
        // 返回上一页面
        backLast(){
        	let self = this;
        	self.back(self.pathWay)
        },
        // 推流好友
        first_blood(){
            let self = this;
            let s = {action:"/cmsMyFriends/query1",params:{findString:self.searchVal,cmfUserId1:self.toke.userId,hidden_userIds:"",isFilterAdd:"true",include_notFriends:""}};
            // self.friendlist = [];
            doAjaxQuery(s,function(data) {
                if(data.status == 0){
                   self.$transfer.backLogin(self, data);
                }else if(data.status == 1){
                    console.log(data)
                    let arr = data.dataset.rows;
                    if(arr && arr.length>0){
                        arr.forEach(function(item, index){
                            item.suLogo = getImgURL() +'user/' +item.suLogo;
                            var ImgObj = new Image(); 
                            ImgObj.src = item.suLogo; 
                            ImgObj.onerror = function(){
                                item.suLogo = getImgURL() + 'user/default.png';
                            }
                            item.show = 1;
                        })
                        if(self.pitchUpList.length != 0){
                            for(let k=0;k<self.pitchUpList.length;k++){
                                for(let i=0;i<arr.length;i++){
                                    if(self.pitchUpList[k].suId == arr[i].suId){
                                        arr[i].show = 0;
                                    }
                                }
                            }
                        }
                        console.log(self.pitchUpList)
                        self.friendlist = friendSortList(arr,self.friendlist)
                        self.nodata = '已全部加载';
                    }else{
                        self.nodata = "没有相关数据"
                    }
                }
            })
        },
        //手机通讯录
        double_kill(){
            let self = this;
            let str = Tokens.fetch('cellPhoneNumber')
            // str = self.arr;
            if(str.length == 0){
                self.$transfer.showToast(self, "通讯录没有名单!");
                return;
            }else{
                str.forEach(function(item, index){
                    item.pinyin = PinYin.ConvertPinyin(item.name);//汉字转换为拼音
                    item.cmfEN = PinYin.ConvertPinyin(item.name).substring(0,1);//拼音首字母
                    item.suName = item.name;//把键值name改为suName，值还是name的值
                    item.suMobile = item.phone;//把键值phone改为suMobile，值还是phone的值
                    item.showInvite = 0;//邀请,添加,已添加状态的判断.   0-->邀请,1-->添加/已添加
                    item.suIsFriend = "false";//添加与已添加的状态判断.    false-->添加,true-->已添加

                    delete item.name;
                    delete item.phone;
                });
                self.mobileList = friendSortList(str,self.mobileList)
                alert(JSON.stringify(str))
            }
        },
        //确认添加
        makeSure(){
            let self = this;
            Tokens.save('pitchUpFriendsList',self.pitchUpList)
            self.back('/addfriends')
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
            self.toke = Tokens.fetch("token");
            self.version = Tokens.fetch("bdSubSystem2");//当前版本号
            let pitchup = Tokens.fetch("pitchUpFriendsList");//是否已经有选中的成员
            // let pitchon = Tokens.fetch("optForFriendsList");//是否已经有选中的成员
            console.log(pitchup)
            let title = self.$route.params.friendID;
            if(from.path){//判断进入路径
                Tokens.save('addFriendsPathFrom',from.path);
                self.pathWay = from.path;
            }else{
                self.pathWay = Tokens.fetch('addFriendsPathFrom');
            }
            if(self.pathWay.indexOf('addfriends') == 1){
                if(pitchup && pitchup.length>0){
                    self.pitchUpList = pitchup;
                }else{
                    self.pitchUpList = [];
                }
                if(title == "tiulo"){
                    self.title = '推流好友';
                    self.TiuloFriendShow = true;
                    self.telFriendShow = false;
                    self.first_blood();
                }else if(title == "phone"){
                    self.title = '通讯录';
                    self.TiuloFriendShow = false;
                    self.telFriendShow = true;
                    if(browserType == "android"){
                        self.double_kill();
                    }
                }
            }
            next()
        },
        canDeactivate({to, from, next}) {
            let self = this;

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
    .selct{
        float: left;
        margin-top: .55rem;
        margin-right:.5rem;
        width:.9rem;height:.9rem;
        border-radius: .9rem;
        border:2px solid #aaa;
    }
    .selcted{
        background-color: #FFD91E;
    }
    .select_box{
        position: fixed;
        bottom:0;
        left:0;
        z-index: 100;
        width:100%;
        height:3rem;
        background-color: #fff;
    }
    .people_num{
        display: inline-block;
        width:70%;
        height:3rem;
        line-height: 3rem;
        padding-left:5%;
    }
    .btn_box{
        display:inline-block;
        width:18%;height:3rem;
        line-height:3rem;
        margin:0 3.5%;
    }
    .make_sure{
        width:100%;
        height:1.5rem;
        border:none;
        background-color: #353535;
        color:#FFD91E;
        border-radius: 5px;
    }
    .nodata{
        text-align:center;
    }
</style>