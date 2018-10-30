<template>
    <div class="page"> 
        <mt-header fixed title="选择站点">
            <mt-button icon="back" slot="left" @click="back('/orderManage')">
            </mt-button>
        </mt-header> 
                <!-- 搜索框 -->
        <div class="container-search" id="allotStationMysearchBox"> 
            <mysearch
              :value.sync="searchVal"
              placeholder="机构名称/站点名">
            </mysearch>
        </div>
        <div class="container-top" id="allotStationContainer">
            <mypulldown style="margin-top:2.8rem">
                <div slot= "pullList" :style = "{minHeight:listViewH + 'px'}">
                    
                    <ul class="organization">
                        <li class="orgOne" v-for="station in stationList" @click.stop ="chooseStation(station,'company')">
                            <div class="stationDiv">
                                <img :src="station.orgs[0].bdLogo">
                                <span class="stationLine">{{station.companyName}}</span> 
                            </div>
                            <ul v-if="subSystem == 'TMS'" style="padding-left:2rem;">
                                <li v-for="org in station.orgs">
                                    <div v-if="subSystem == 'TMS' && (org.bdId != org.bdParent + 'MR') && (org.bdCreateUserId == userId || org.bdParent == companyId)" @click.stop = "chooseStation(org,'station')">
                                       <span slot="icon" class="iconfont" style="color:#FFD91E;">&#xe618;</span>
                                        {{org.bdName}} 
                                    </div>  
                                </li>
                            </ul>
                        </li>
                        <li v-if="noOrgData" class="orgOne" style="text-align:center;padding:0.5rem">没有可选择机构</li>
                    </ul>
                </div>
            </mypulldown>        
  
        </div>
    </div>
</template>

<script>
// Ajax request module, return a Promise
import Tokens from '../token'
import  Mysearch  from '../components/mysearch'
import  Mypulldown from '../components/mypulldown'//引入下拉刷新的组件
export default {
    components:{
        Mysearch,
        Mypulldown
    },
    data () {
        return {
            listViewH:0,//下拉刷新框的最小高度
            isLoadId:null, 
            searchTimer: null,//执行搜索的定时器
            searchVal:'',
            noOrgData:false,//没有站点
            stationList:[],//站点列表
            subSystem:'',
            userId:'',
            companyId:'',
            orgId:'',
            beforeScrollTop:0,
            searchNum:0,

        }
    },
    ready (){
        let self = this;
        //列表框的最小高度
        self.$nextTick(()=>{
            self.listViewH = $("#allotStationContainer").height() - $("#allotStationMysearchBox").height() -10;
        })
        searchBoxIsShow('#allotStationContainer','#allotStationMysearchBox',self.beforeScrollTop,function(top){
            self.beforeScrollTop = top;  
        })
    },
    watch:{
        'searchVal': function(){//搜索内容改变执行此方法
            let self = this;
            if(self.searchNum == 0){//刚进来重置searchVal不执行搜索
                self.searchNum++;
                return;
            } 
            //设置延迟执行
            clearInterval(self.searchTimer);
            self.searchTimer = setTimeout(function(){
                self.noOrgData = false;
                self.getStationData(); 
            },1000);
        }
    },
    events:{
        refreshList(id,topStatus){//下拉刷新时重置列表数据
            let self = this;
            self.isLoadId = id;
            setTimeout(() => {
                self.noOrgData = false;
                self.getStationData();     
            }, 1000);
    
        }
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
        getStationData(){//获取站点信息
            let self = this;
            //选择分配站点
            let s = {   action:"/org/query",
                        params:{hideOrg:self.orgId,webType:'fd',findString:self.searchVal}
                    };
            doAjaxQuery(s,function(data) {
                if(data.status == 0){
                    self.$transfer.backLogin(self, data);
                }else if(data.status == 1){
                    let obj = data.dataset.rows;
                    if(obj && obj.length>0){
                        //将站点列表转为树形结构
                        let orgArr = [];
                        obj.forEach(function(item, index){
                            item.bdLogo = getImgURL() +'company/' +item.bdLogo;
                            var ImgObj = new Image(); 
                            ImgObj.src = item.bdLogo; 
                            ImgObj.onerror = function(){
                                item.bdLogo = getImgURL() + 'company/default.png';
                            }

                            let keyVal = JSON.stringify({'companyId':item.bdParent});
                            let keyVal2 = keyVal.substring(1,keyVal.length-1);
                            if(JSON.stringify(orgArr).indexOf(keyVal2) == -1){
                                let newCompany = {  'companyId':item.bdParent,
                                                    'companyName':item.bdCompanyName,
                                                    // 'companyLogo':item.bdLogo,
                                                    'orgs':[item]};
                                //存储默认机构
                                if(self.subSystem == 'TMS' && (item.bdId == item.bdParent + 'MR')){
                                    newCompany.MRorg = item;
                                }
                                orgArr.push(newCompany);
                            }else{                   
                                for(var j=0;j<orgArr.length;j++){
                                    if(orgArr[j].companyId == item.bdParent){
                                        orgArr[j].orgs.push(item)
                                        //存储默认机构
                                        if(self.subSystem == 'TMS' && (item.bdId == item.bdParent + 'MR')){
                                            orgArr[j].MRorg = item;
                                        }
                                    }
                                }
                            }
                            
                        })

                        self.stationList = orgArr;
                        self.noOrgData = false;
                        
                    }else{
                        self.stationList = obj;
                        self.noOrgData = true;
                    }
                    if(self.isLoadId){
                        self.$nextTick(()=>{
                            self.$broadcast('onTopLoaded', self.isLoadId); 
                            self.isLoadId = null;
                        }) 
                    }
                    
                }
            });

        },
        chooseStation(data,type){//将订单分配给该站点
            let self = this;
            let isStop = isXLorClick();
            if(isStop){ return;}
            let bdName = '*';
            let bdId = '*';
            let bdCompanyName = '*';
            let bdCompanyId = '*';
            if(type == "company"){
                bdCompanyName = data.MRorg.bdCompanyName;
                bdName = data.MRorg.bdName;
                bdId = data.MRorg.bdId;
                bdCompanyId = data.MRorg.bdParent;

            }else if(type == "station"){
                bdCompanyName = data.bdCompanyName;
                bdName = data.bdName;
                bdId = data.bdId;
                bdCompanyId = data.bdParent;
            }
            let allotOrder = Tokens.fetch("allotOrder");
            if(allotOrder && allotOrder.length>0){
                self.$MessageBox.confirm('将订单分配给<br/>'+bdName +'?')
                .then(action => {
                        allotOrder.forEach(function(item, index){
                            item.tohStartOrgId2 = bdId;
                            item.tohStartOrgName2 = bdName;
                            item.tohRecvCompanyId2 = bdCompanyId;
                            item.tohRecvCompanyName2 = bdCompanyName;
                            item.state = 'u';
                        })
                    
                    let s = {   action:"/tmOrderHead/save",
                                commandType:"Update",
                                params:{opType:"fd"}
                            };
                    s.datasets = {dsData:{rows:allotOrder}} ;

                    doAjaxUpdate(s,function(data) {
                        if(data.status == 0){
                            self.$transfer.backLogin(self, data);
                        }else if(data.status == 1){
                            self.$Indicator.close();
                            self.$transfer.showToast(self, "分单成功");
                            setTimeout(function(){
                               self.back('/orderManage');
                            },1000)

                        }
                    })
                }).catch(function(){})
            }else{
                self.$transfer.showToast(self, "请选选择订单");
                setTimeout(function(){
                   self.back('/orderManage');
                },1000)
            }
        }
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
            self.userId = token["userId"];
            self.subSystem = token["subSystem"]; 
            self.orgId = token["orgId"];
            self.companyId = token["companyId"];

            self.searchVal = '';
            self.noOrgData = false;//没有站点
            self.stationList = [];//站点列表
            self.beforeScrollTop = 0;
            self.searchNum = 0;
            self.getStationData();

            next()
        },
        deactivate ({ next }) {
            //Triggers when component destroys
            next()
        },
        canDeactivate({to, from, next}) {
            let self = this;
            $("#allotStationMysearchBox").slideDown();
            Tokens.save("allotOrder",[]);
            next()
        },
        activate({to, from, next}) {
            let self = this;
            next()
        } 
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.organization{
    background: #fff;
}
.orgOne{
    padding:0.5rem;
    border-bottom:1px solid #e5e5e5;
}
.stationDiv{
    position: relative;
    padding-left:2.5rem;
    height:2rem;
    line-height: 2rem;
}
.orgOne img{
    position: absolute;
    top:0;
    left:0;
    width:2rem;
    height:2rem;
    border-radius: 1rem;
    border:1px solid #e5e5e5;
}
.orderType{
    box-sizing: border-box;
    padding:0.15rem 0.5rem 0 2.5rem;
    background: #fff;
    border-top:1px solid #e5e5e5;
    border-bottom:1px solid #e5e5e5;
    margin-bottom:0.25rem;
    height:2.3rem;
    line-height: 2.2rem;
}
.ordetType_box .iconfont{
    position: absolute;
    top:0.2rem;
    left:0.5rem;
    height:2rem;
    line-height: 2rem;
    font-size: 1.4rem;
    color:#666;
}

</style>
