<template>
    <div class="page" id="tracePage">
        <!-- Header -->
        <div class="mint-header">
            <div class="hleft">
                <img :src="orgLogo">
            </div>
            <div class="hcontent mint-header-title">
                <div class="hcontentTitle" @click="chooseStation()">
                    <div class="stationTitle">
                        {{orgTitle}}   
                    </div>
                    <span slot="icon" class="iconfont hcontentIcon">{{{iconShow}}}</span>  
                </div>
            </div>
            <div class="hright"></div>
        </div>
        <div class="container-top" style="margin-bottom:3rem;" id="TMStraceListContainer" v-infinite-scroll="loadMore()" infinite-scroll-immediate-check="false" infinite-scroll-disabled="loading" infinite-scroll-distance="50">    
            <!-- <mypulldown>
                <div slot= "pullList" :style = "{minHeight:listViewH + 'px'}"> -->
                    <ul class="manageBox">
                        <li v-for="manage in manageList">
                            <div class="oneManage" @click="go(manage.pageUrl)">
                                <span slot="icon" class="iconfont listIcon" :class="manage.pageUrl != '' ? 'iconColor' : '' ">&#xe889;</span>
                                <span class="icon_set lf">{{manage.spName || manage.supProgramName}}</span>
                                <span class="iconfont fr rt_arrow">&#xe645;</span> 
                            </div>
                            
                        </li>
                    </ul>
                    
               <!--  </div>       
            </mypulldown> -->

        </div>
        <!-- 机构选择框 -->
        <mt-popup class="stationBox" :visible.sync="stationShow" popup-transition="popup-fade" @click="closeStationPop()">
            <div class="container-top" style="margin-bottom:3rem;">
                <ul class="organization">
                    <li class="orgOne" v-for="station in stationList" @click.stop ='goChangeStation(station)'>
                        <div class="stationDiv">
                            <img :src="station.orgs[0].suoCompanyLogo">
                            <span class="stationLine">{{station.companyName}}</span> 
                        </div>
                        <ul v-if="subSystem == 'TMS'" style="padding-left:2rem;">
                            <li v-for="org in station.orgs">
                                <div v-if="subSystem == 'TMS' && (org.suoOrgId != org.suoCompanyId + 'MR')" @click.stop = "changeStation(org,$event)">
                                   <span slot="icon" class="iconfont" style="color:#FFD91E;">&#xe618;</span>
                                    {{org.suoOrgName}} 
                                </div>  
                            </li>
                        </ul>
                    </li>
                    <li v-if="noOrgData" class="orgOne" style="text-align:center;padding:0.5rem">没有可选择机构</li>
                </ul>
            </div>
        </mt-popup> 

    </div>
</template>

<script>
// Ajax request module, return a Promise
import Tokens from '../token'
// import  Mypulldown from '../components/mypulldown'//引入下拉刷新的组件
export default {
    components: {
         // Mypulldown
    },
    data () {
        return {
            isLoadId:null,
            listViewH:0,//下拉刷新框的最小高度
            token:'',
            userId:'',//driverId 默认为userId 
            sessionId:'',
            subSystem:'',
            subSystem2:'',
            companyId:'',
            orgId:'',
            iconShow:'&#xe611;',//上下箭头 &#xe66b;
            stationShow:false,//站点选择框
            stationList:[],//机构列表
            noOrgData:false,//没有机构
            orgTitle:'',//机构名称
            orgLogo:'',//机构Logo

            manageList:[],//管理列表
        }
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
        chooseStation(){//打开切换机构框
            let self = this;
            if(self.stationShow){
                self.iconShow = '&#xe611;'
            }else{
                self.iconShow = '&#xe66b;'
            }
            self.stationShow = !self.stationShow;
        },
        closeStationPop(){//关闭切换机构框
            let self = this;
            self.stationShow = false;
            self.iconShow = '&#xe611;'
        },
        chageData(auth){//转换管理列表的数据
            for(var i = auth.length-1;i>=0; i--){
                auth[i].spId = auth[i].spId ? auth[i].spId : auth[i].supProgramId;
                auth[i].spName = auth[i].spName ? auth[i].spName : auth[i].supProgramName;
                auth[i].pageUrl = auth[i].spId == "SP0000001" ? "/orderManage" ://订单管理 111
                                    auth[i].spId == "SP0000003" ? "/joinManage" ://交接管理 111
                                    auth[i].spId == "SP0000010" ? "/financeManage" ://财务管理111
                                    auth[i].spId == "SP0000005" ? "/signManage" ://回单管理
                                    auth[i].spId == "SP0000012" ? "/exManage" ://异常管理
                                    auth[i].spId == "SP0000008" ? "/accountCheckManage" ://审核管理111
                                    auth[i].spId == "SP0000009" ? "/accountManage" ://对账管理 111
                                    auth[i].spId == "SP0000011" ? "/reportManage" ://报表管理111 
                                                                                "";

                                    // auth[i].spId == "SP0000002" ? "/taskManage" : //调度管理
                                    // auth[i].spId == "SP0000004" ? "/recvManage" ://签收管理
                                    // auth[i].spId == "SP0000006" ? "/chargeManage" ://费用管理
                                    // auth[i].spId == "SP0000007" ? "/chargeOpManage" ://经营财务
                                    // auth[i].spId == "SP0000013" ? "/insrcBuyManage" ://保险管理
                                    // auth[i].spId == "SP0000014" ? "/locationManage" ://站点管理
                                    // auth[i].spId == "SP0000015" ? "/mapManage" ://线路管理
                                    // auth[i].spId == "SP0000016" ? "/keyManage" ://权限管理
                                    // auth[i].spId == "SP0000017" ? "/slidersManage" ://模块管理
                                    // auth[i].spId == "SP0000018" ? "/hornorManage" ://机构与认证管理
                                    // auth[i].spId == "SP0000019" ? "/customerManage" ://客户管理
                                    // auth[i].spId == "SP0000020" ? "/employeeManage" ://员工管理
                                    // auth[i].spId == "SP0000021" ? "/cartManage" ://承运人管理
                                    // auth[i].spId == "SP0000022" ? "/ownerManage" ://货主管理
                                    // auth[i].spId == "SP0000023" ? "/consignorManage" ://发货人商品
                                    // auth[i].spId == "SP0000024" ? "/truckManage" //车辆管理

                if(auth[i].pageUrl == ''){
                    auth.splice(i,1);
                }
            }
            return auth;
        },
        getStationData(){//获取所有机构
            let self = this;
            let s = {   action:"/user/userInfo",
                        params:{suoSubSystem:self.subSystem,suoSubSystem2:self.subSystem2,suoUserId:self.userId}
                    };
            self.noOrgData = false;
            doAjaxQuery(s,function(data) {
                if(data.status == 0){
                    self.$transfer.backLogin(self, data);
                }else if(data.status == 1){
                    console.log(data)
                    let isAdmin = Tokens.fetch('token')['isAdmin'];
                    let isAdmin2 = Tokens.fetch('token')['isAdmin2'];
                    let allData = data.dataset.rows;
                    let MRManage = allData[0].auth; 
                    let obj = allData[0].org;
                    if(obj && obj.length>0){
                        //将站点列表转为树形结构
                        let orgArr = [];
                        let hasSuoDefault = false;
                        let defaultItem = obj[0];
                        obj.forEach(function(item, index){
                            item.suoCompanyLogo = getImgURL() +'company/' +item.suoCompanyLogo;
                            var ImgObj = new Image(); 
                            ImgObj.src = item.suoCompanyLogo; 
                            ImgObj.onerror = function(){
                                item.suoCompanyLogo = getImgURL() + 'company/default.png';
                            }

                            if(isAdmin == 1 || item.auth == 'all'){
                               item.auth = MRManage;
                            }    

                            let keyVal = JSON.stringify({'companyId':item.suoCompanyId});
                            let keyVal2 = keyVal.substring(1,keyVal.length-1);
                            if(JSON.stringify(orgArr).indexOf(keyVal2) == -1){
                                let newCompany = {  'companyId':item.suoCompanyId,
                                                    'companyName':item.suoCompanyName,
                                                    // 'companyLogo':item.suoCompanyLogo,
                                                    'orgs':[item]};
                                //存储默认机构
                                if(self.subSystem == 'TMS' && (item.suoOrgId == item.suoCompanyId + 'MR')){
                                    newCompany.MRorg = item;
                                }
                                orgArr.push(newCompany);
                            }else{                   
                                for(var j=0;j<orgArr.length;j++){
                                    if(orgArr[j].companyId == item.suoCompanyId){
                                        orgArr[j].orgs.push(item)
                                        //存储默认机构
                                        if(self.subSystem == 'TMS' && (item.suoOrgId == item.suoCompanyId + 'MR')){
                                            orgArr[j].MRorg = item;
                                        }
                                    }
                                }
                            }
                           if(item.suoIsDefault == 1){
                                hasSuoDefault = true;
                                defaultItem = item;
                            }  
                            
                        })
                        setTimeout(function(){
                            if(hasSuoDefault){
                                self.orgTitle = defaultItem.suoOrgName; 
                                self.orgLogo = defaultItem.suoCompanyLogo;
                                self.companyId = defaultItem.suoCompanyId;
                                self.orgId = defaultItem.suoOrgId;
                                self.changeStation(defaultItem)
                                // alert(self.companyId )
                            }else{
                                self.orgTitle = obj[0].suoOrgName;
                                self.orgLogo = getImgURL() + 'company/default.png';
                                self.companyId = obj[0].suoCompanyId;
                                self.orgId = obj[0].suoOrgId;
                                self.changeStation(defaultItem)
                            }
                        },100)
                        self.stationList = orgArr;
                        
                    }else{
                        self.noOrgData = true;
                        self.stationList = obj;
                        self.$transfer.showToast(self, "您还没有机构，请先创建机构！",'',2000);
                        setTimeout(function(){
                            // self.go('/companyAdd','add');
                            self.go('/noOrg')
                        },2000)
                    }
                    
                }
            });
        },
        goChangeStation(station){//如果企业版点击公司名称可以切换机构,如果是动力版点击公司名称切换到默认的站点
            let self = this;
            if(self.subSystem == 'KF'){
                self.$Indicator.open();
                self.changeStation(station.orgs[0])
            }else if(self.subSystem == 'TMS'){
                if(station.MRorg){
                    self.$Indicator.open();
                    self.changeStation(station.MRorg)
                }else{
                    return;
                }   
            }
        },
        changeStation(currOrg,e){//切换当前机构
            let self = this;
            self.$Indicator.open();
            let s = {action:"/userOrg/query"};
                s.params = {suoSubSystem:currOrg.suoSubSystem,
                            suoSubSystem2:self.subSystem2,
                            suoDistrictName:currOrg.suoDistrictName,
                            suoDistrictId:currOrg.suoDistrictId,
                            suoOrgId:currOrg.suoOrgId,
                            suoId:currOrg.suoId,
                            suoOrgName:currOrg.suoOrgName,
                            suoCompanyId:currOrg.suoCompanyId,
                            suoCompanyName:currOrg.suoCompanyName,
                            opType:"orgChange",
                            clicksubSystem:self.subSystem2
                            };
                            console.log(JSON.stringify(s))

            doAjaxQuery(s,function(data) {
                if(data.status == 0){
                    self.$transfer.backLogin(self, data);
                }else if(data.status == 1){
                    console.log(data)

                    //重新设置本地存储中的token值
                    let localToken = Tokens.fetch("token");
                        localToken["orgId"] = currOrg.suoOrgId;
                        localToken["orgName"] = currOrg.suoOrgName;
                        localToken["orgDistrictId"] = currOrg.suoOrgDistrictId;
                        localToken["orgDistrictName"] = currOrg.suoOrgDistrictName;
                        localToken["districtId2"] = currOrg.suoOrgDistrictId;
                        localToken["provinceId"] = currOrg.suoOrgProvinceId;
                        localToken["companyId"] = currOrg.suoCompanyId;
                        localToken["companyName"] = currOrg.suoCompanyName;
                        localToken["companyLogo"] = currOrg.suoCompanyLogo;
                        localToken["isAdmin2"] = currOrg.suoIsAdmin;
                        localToken["isQuery"] = currOrg.suoIsQuery;
                        localToken["isModify"] = currOrg.suoIsModify;
                        localToken["districtId"] = currOrg.suoDistrictId;
                        localToken["districtName"] = currOrg.suoDistrictName;
                        localToken["suoId"] = currOrg.suoId;
                    localStorage.setItem("token","");
                    localStorage.setItem("token",JSON.stringify(localToken));
                    //设置页面中的值的变化
                    self.stationShow = false;
                    self.iconShow = '&#xe611;';
                    self.orgTitle = localToken["orgName"];
                    self.orgLogo = localToken["companyLogo"]
                    self.orgId = localToken["orgId"];
                    self.companyId = localToken["companyId"];

                    currOrg.auth = self.chageData(currOrg.auth);
                    self.showManageList(currOrg.auth);  
                }
            });
        },
        showManageList(auth){//获取管理列表
            let self = this;
            self.manageList = auth;
            self.$Indicator.close();
        },

    },
    route: {
        data ({ from,to, next }) {  
            let self = this;
            //进入页面时token不存在
            if(!localStorage.getItem("token")){
                self.$transfer.backLogin(self, {info:'token没有值'});
                return;
            }

            self.token = Tokens.fetch("token")
            self.userId = self.token["userId"];
            self.sessionId = self.token["sessionId"];
            self.orgId = self.token["orgId"];
            self.companyId = self.token["companyId"];
            
            self.isLoadId = null;

            if(!localStorage.getItem("isTMSTaskReload") || (self.subSystem2 != localStorage.getItem("subSystem2"))){
                //第一次进入页面获取数据
                self.subSystem = localStorage.getItem("subSystem");
                self.subSystem2 = localStorage.getItem("subSystem2");
                localStorage.setItem("isTMSTaskReload","YES");
                self.orgTitle = '';
                self.orgLogo = getImgURL() + 'company/default.png';
                self.getStationData();
            }  

            next()
        },
        deactivate ({ next }) {
            next()
        },
        canDeactivate({to, from, next}) {
            let self = this;
            self.$parent.$data.showBar = false;
            self.$parent.$data.taskPageDefalut = "/TMStaskList"
            next()
        },
        activate({to, from, next}) {
            let self = this;
            let subSystem = localStorage.getItem("subSystem");
            if(subSystem){
                self.$parent.$data.subSystem = subSystem;
            }
            self.$parent.$data.showBar = true;
            self.$parent.$data.MainSelect = "TMStaskList";
            next()
        } 
    }
}


</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.manageBox{
    background: #fff;
    padding-left:0.5rem;
}
.manageBox li .oneManage{
    padding:0.7rem 0.5rem 0.7rem 1.5rem;
    position: relative;
    border-bottom:1px solid #e5e5e5;
}
.manageBox li:last-child .oneManage{
    border-bottom:none;
}

.iconColor{
    color:#FFD91E !important;
}
.listIcon{
    position: absolute;
    left:0;
    top:0.4rem;
    color:#999;
}
.stationTitle{
    display:inline-block;
    max-width: 80%;
    overflow: hidden;
    text-overflow:ellipsis;
    white-space: nowrap;
}
.stationLine{
    display: inline-block;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap; 
    font-size: 0.75rem;
    font-weight: 900;

}
.stationBox{
    width: 100%;
    height:100%;
    background: transparent;
}
.stationDiv{
    position: relative;
    padding-left:2.5rem;
    height:2rem;
    line-height: 2rem;
}
.organization{
    width:100%;
    min-height: 100%;
    background: #FFF;
}
.orgOne{
    padding:0.5rem;
    border-bottom:1px solid #e5e5e5;
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

