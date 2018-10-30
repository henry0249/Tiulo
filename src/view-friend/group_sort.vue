<template>
    <div class="page" id="page_name" @click="listshow = false">
    	<!-- Header -->
        <mt-header fixed :title="group_detail.cfgName">
            <mt-button icon="back" slot="left" @click="getback()"></mt-button>
            <mt-button slot="right" style="width:45px;" @click.stop="goes()">
                <span class="iconfont" v-show="!addicon">&#xe630;</span>
                <span class="iconfont" v-show="addicon">&#xe65c;</span>             
            </mt-button>
        </mt-header>
        <div id="groupSortSearch" class="container-search">
            <mysearch :value.sync="searchVal" placeholder="手机号、姓名、推流号"></mysearch>
        </div>
        <div class="container-top topEnt" id="groupSortList">
            <mypulldown style="margin-top:2.8rem;">
                <div slot= "pullList" :style = "{minHeight:listViewH + 'px'}">  	
                    <div class="mainBody">
                        <my-commun-list :details="arr2" :uptop="uptop" :nodata="browserType"></my-commun-list>
                        <div class="nodata">{{nodata}}</div>
                    </div>
                </div>
            </mypulldown>
            <!-- 右上角选择框 -->
            <div  v-show = "listshow" class="listPOP_box">
                <div class="list_pop">
                    <ul>
                        <li @click="amendGroup()"><span style="padding-right:0.5rem;" slot="icon" class="iconfont">&#xe618;</span>修改组名</li>
                        <li @click="godoes()"><span style="padding-right:0.5rem;" slot="icon" class="iconfont">&#xe618;</span>添加成员</li>
                    </ul>
                </div>
                <div class="jiantou"></div> 
            </div>
            <!-- <div class="select_box" v-show="listshow">
                <ul>
                    
                </ul>
            </div>
            <div class="jiantou" v-show = "listshow"></div> -->
            <my-letter-index :uptop="uptop"></my-letter-index>
        </div>
    </div>
</template>

<script>
import  Mysearch  from '../components/mysearch'
import  MyCommunList  from '../components/mycommunlist'
import  MyLetterIndex  from '../components/myletterindex'
import { MessageBox } from 'mint-ui';
import Tokens from '../token'
import  Mypulldown from '../components/mypulldown'//引入下拉刷新的组件

export default {
	components: {
        Mysearch,MyCommunList,MyLetterIndex,Mypulldown
    },
	data(){
		return{
            listViewH:0,//下拉刷新框的最小高度
            isLoadId:null,//用来存储下拉刷新时带过来的id,初始设置为null,在数据加载完成后清除加载指示时

            listshow:false,//下弹框显示状态
            group_detail:'',
            token:'',
            // groupName:'',//此页面的分组名称
			// groupType:'',//此页面的分组简称
            pathWay:'',//上一页面的路径
            //搜索框
			searchVal:'',//搜索框的值
            timer:false,//是否执行搜索的定时器
            truckList:[],//列表数据
            currPage:1,//当前页面
            nodata:'',//加载没有数据
            loading:false,//可以无限加载
            loadMax:false,//已全部加载
            showloadmore:false,//显示加载标示

            arr:[],
            arr2:[],
            uptop:100,//上边距离
            addicon:true,//显示图标
            sheetVisible:false,//修改框

            groupIds:[],
            browserType:'',//微信版本或者Android

            beforeScrollTop:0,//存储页面当前scrollTop
            searchNum:0,
		}
	},
    ready(){
        let self = this;
        let pageH = Tokens.fetch('contentHeight');
        let hei = $("#search").height();
        self.uptop = 44 + hei;
        self.browserType = browserType;
        //列表框的最小高度
        self.$nextTick(()=>{
            self.listViewH = $("#groupSortList").height() - $("#groupSortSearch").height()-10;
        })
        searchBoxIsShow('#groupSortList','#groupSortSearch',self.beforeScrollTop,function(top){
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
            self.timer = setTimeout(function(){
                self.truckList = [];
                self.currPage = 1;
                self.nodata = '';
                self.loading = false;
                self.loadMax = false;
                self.showloadmore = false;
                self.calldata();
            },500);
        }
    },
    events:{
        deleteGroup(index1,index2,item){//删除成员
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
                        self.calldata();
                    }
                })
            }).catch(function(){
                let as = document.querySelectorAll('.updata');
                Array.from(as).forEach(function(item,index){
                    item.style.WebkitTransform = "translateX(" + 0 + "px)";
                })
            });
        },
        choiceimg(index1,index2,item){//点击电话按钮
            let self = this;
            let as = document.querySelectorAll('.updata');
            Array.from(as).forEach(function(val,index){
                val.style.WebkitTransform = "translateX(" + 0 + "px)";
            })
        },
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
                self.calldata();
            }, 1000);
        },
    },
	methods:{
		go (link, param) {
            let self = this;
            self.$transfer.go(self, link, param)
        },
        back (link, param) {
            let self = this;
            self.$transfer.back(self, link, param);
        },
        goes(){//跳往添加成员页面
            let self = this;
            if(self.addicon){
                self.listshow = !self.listshow;
            }else{
                //清楚删除按钮状态
                let as = document.querySelectorAll('.updata');
                Array.from(as).forEach(function(val,index){
                    val.style.WebkitTransform = "translateX(" + 0 + "px)";
                })
                Tokens.save('groupIds',self.groupIds);
                self.currPage = 1;
                self.nodata = '';
                self.loading = false;
                self.loadMax = false;
                self.showloadmore = false;
                self.searchVal = '';
                let obj = self.group_detail.cfgName+'|'+self.group_detail.cfgId;
                self.go('/add_member',obj)
            }      
        },
        godoes(){//自建分组添加成员
            let self = this;
            let as = document.querySelectorAll('.updata');
            Array.from(as).forEach(function(val,index){
                val.style.WebkitTransform = "translateX(" + 0 + "px)";
            })
            self.currPage = 1;
            self.nodata = '';
            self.loading = false;
            self.loadMax = false;
            self.showloadmore = false;
            self.searchVal = '';
            Tokens.save('groupIds',self.groupIds);
            let obj = self.group_detail.cfgName+'|'+self.group_detail.cfgId;
            self.go('/add_member',obj)
        },
        amendGroup(){
            let self = this;
            self.go('/amend_group',self.group_detail.cfgName)
        },
        getback(){
            let self = this;
            let as = document.querySelectorAll('.updata');
            Array.from(as).forEach(function(val,index){
                val.style.WebkitTransform = "translateX(" + 0 + "px)";
            })
            self.showloadmore = true;
            self.loadMax = false;
            self.currPage = 1;
            self.nodata = "";
            self.searchVal = '';
            self.loading = false;
            self.arr2 = [];
            self.back('/friends')
        },
        calldata(){//加载所有数据
            let self = this;
            self.searchNum++;
            let s = {action:"/cmsMyFriends/query",params:{findString:self.searchVal,"cmfUserId1":self.token.userId,"cmfGroupId":self.group_detail.cfgId}};
            self.showloadmore = true;
            self.loadMax = false;
            self.nodata = "";
            doAjaxQuery(s,function(data) {
                if(data.status == 0){
                    self.$transfer.backLogin(self, data);
                }else if(data.status == 1){
                    consoleShow(data)
                    let arr = data.dataset.rows;
                    if(arr && arr.length > 0){
                        arr.forEach(function(item, index){
                            item.suLogo = getImgURL() +'user/' +item.suLogo;
                            var ImgObj = new Image(); 
                            ImgObj.src = item.suLogo; 
                            ImgObj.onerror = function(){
                                item.suLogo = getImgURL() + 'user/default.png';
                            }
                        })
                        self.arr2 = friendSortList(arr,self.arr2)
                        self.nodata = '已全部加载';
                        self.$nextTick(()=>{
                            setTimeout(function(){
                                self.$transfer.translationDel(".updata");
                            },1000)
                        })              
                    }else{
                        self.arr2 = [];
                        self.nodata = '没有相关数据';
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
        // getTruckData(){//获取人员列表信息
        //     let self = this;
        //     let clickGroup = Tokens.fetch('clickGroup');
        //     let s = {action:"/cmsMyFriends/query",params:{findString:self.searchVal,cmfUserId1:self.token.userId,cmfGroupId:clickGroup.cfgId}};
        //     consoleShow(JSON.stringify(s))
        //     self.showloadmore = true;
        //     self.loadMax = false;
        //     self.nodata = "";
        //     self.arr2 = [];
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
        //                 })
        //                 self.arr2 = friendSortList(arr,self.arr2)
        //                 self.nodata = '已全部加载';
        //                 self.$nextTick(()=>{
        //                     setTimeout(function(){
        //                         self.$transfer.translationDel(".updata");
        //                     },1000)
        //                 })              
        //             }else{
        //                 self.nodata = '没有相关数据';
        //             }
                        
        //         }
        //         self.showloadmore = false;
        //         self.loading = false;
        //     })
        // },
	},
	route: {
        data ({ from, to, next }) {
            let self = this;
            //进入页面时token不存在
            if(!localStorage.getItem("token")){
                self.$transfer.backLogin(self, {info:'token没有值'});
                return;
            }
            self.pathWay = from.path;
            self.token = Tokens.fetch("token");
            self.group_detail = Tokens.fetch("clickGroup");
            if(self.group_detail.cfgName == '同事' || self.group_detail.cfgName == '客户' || self.group_detail.cfgName == '司机' || self.group_detail.cfgName == '同行' || self.group_detail.cfgName == '承运人'){
                self.addicon = false;
            }else{
                self.addicon = true;
            }
            self.$nextTick(()=>{
                setTimeout(function(){
                    self.$transfer.translationDel(".updata");
                },1000)
            });
            self.searchNum = 0;
            self.searchVal = '';
            self.$Indicator.open();
            self.calldata();
            next();
        },
        canDeactivate({to, from, next}) {
            let self = this;
            $('#groupSortSearch').slideDown();
            next();
        },
        deactivate ({ next }) {
            let self = this;
            next();
        },
	}
}
</script>

<style scoped>
    .nodata{
        text-align:center;margin:0.5rem 0;
    }
  	@component-namespace page {
        @component indexlist {
            @descendent desc {
                text-align: center;
                color: #666;
                padding-bottom: 5px;
            }
            @descendent wrapper {
                width: 100%;
                border-top: solid 1px #ddd;
            }
        }
    }
  
</style>