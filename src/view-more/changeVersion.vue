<template>
    <div class="page"> 
        <mt-header fixed title="切换版本">
            <mt-button icon="back" slot="left" @click="back('/more')"></mt-button>
        </mt-header> 
        <div class="container-top"> 
            <ul class="versionList">
                <li v-for="version in versionList" @click = "getAllOrgs(version.val)">
                    <span slot="icon" class="iconfont">{{{version.icon}}}</span>
                    {{version.name}}
                    <div class="versionCircle" :class="subSystem2 == version.val?'checkedVersion' :''"></div>
                </li>
            </ul>

        </div> 
    </div>
</template>

<script>
// Ajax request module, return a Promise
import Tokens from '../token'
export default {
    data () {
        return {
            userId:'',
            subSystem2:'',
            hasVersion:'',
            versionList:[   {name:'TP运力',val:'TP',icon:'&#xe675;'},
                            {name:'OSP执行管理',val:'OSP',icon:'&#xe676;'},
                            {name:'BSP业务代理',val:'BSP',icon:'&#xe674;'},
                            {name:'EP企业',val:'EP',icon:'&#xe671;'}
                        ]
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
        getAllOrgs(version){//获取所有机构
            let self = this;
            let s = {action:"/user/userInfo",params:{"suoUserId":self.userId}};
            console.log(JSON.stringify(s));
            doAjaxQuery(s,function(data) {
                if(data.status == 0){
                    self.$Indicator.close();
                    self.$transfer.showToast(self, data.info);
                }else if(data.status == 1){
                    console.log(data)
                    let hasVersion = data.dataset.rows[0].subSystem1;
                    console.log(hasVersion)
                    let obj = data.dataset.rows[0].org;
                    console.log(obj)
                    let currOrg = {};
                    let noMrNth = 0;
                    if(hasVersion && hasVersion.indexOf(version) != -1){
                        if(obj && obj.length>0){
                            obj.forEach(function(item, index){
                                if(item.suoSubSystem2 == version && noMrNth == 0){
                                    currOrg = item;
                                    console.log("++++++++++++++++++++" + index)
                                    noMrNth++;
                                }
                                if(item.suoSubSystem2 == version && item.suoIsDefault == 1){
                                    currOrg = item;
                                    noMrNth++;
                                    console.log("-------------------" + index);
                                    return;
                                }
                                if(item.suoOrgName == '丽水站'){
                                    console.log("===========" + item.suoIsDefault)
                                }

                            })
                            self.changeVersion(version,currOrg);
                        }
                    }else{
                        self.$MessageBox.confirm('您切换的'+version+'角色未开通，是否立即申请?')
                        .then(action => {
                            Tokens.save("noOrgVersion",version);  
                            self.go('/noOrg')  
                        }).catch(function(){})

                    }
                }
            });

        },
        changeVersion(version,currOrg){//切换版本
            let self = this;
            console.log(currOrg)
            let currsubSystem = (version=="TP" || version=="OSP") ? "TMS" :
                                 (version=="BSP" || version=="EP") ? "KF" : "";
            let s = {action:"/userOrg/query"};
                s.params = {suoSubSystem:currsubSystem,
                            suoSubSystem2:version,
                            suoDistrictName:currOrg.suoDistrictName,
                            suoDistrictId:currOrg.suoDistrictId,
                            suoOrgId:currOrg.suoOrgId,
                            suoId:currOrg.suoId,
                            suoOrgName:currOrg.suoOrgName,
                            suoCompanyId:currOrg.suoCompanyId,
                            suoCompanyName:currOrg.suoCompanyName,
                            opType:"orgChange",
                            clicksubSystem:version
                            };
            // console.log(JSON.stringify(s))
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
                    localToken["companyName"] = currOrg.suoOrgName;
                    localToken["companyLogo"] = currOrg.suoCompanyLogo;
                    localToken["isAdmin2"] = currOrg.suoIsAdmin;
                    localToken["isQuery"] = currOrg.suoIsQuery;
                    localToken["isModify"] = currOrg.suoIsModify;
                    localToken["districtId"] = currOrg.suoDistrictId;
                    localToken["districtName"] = currOrg.suoDistrictName;
                    localToken["suoId"] = currOrg.suoId;
                    localToken["subSystem"] = currsubSystem;
                    localToken["subSystem2"] = version;
                    localStorage.setItem("token","");
                    localStorage.setItem("token",JSON.stringify(localToken));
                    //设置页面中的值的变化
                    self.subSystem2 = version;
                    localStorage.setItem("subSystem2",version);
                    localStorage.setItem("subSystem",currsubSystem);
                    self.$parent.$data.taskPageDefalut = "/TMStaskList";
                    self.back('/more')
                }
            });
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
            self.sessionId = token["sessionId"];
            self.hasVersion = token["hasVersion"];

            self.subSystem = localStorage.getItem("subSystem");
            self.subSystem2 = localStorage.getItem("subSystem2");

            next()
        },
        deactivate ({ next }) {
            //Triggers when component destroys
            next()
        },
        canDeactivate ({ next, to, abort }) {
            //Triggers when component destroys
            const self = this
            next()
        }
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.versionList{
    background: #fff;
    padding:0 0.5rem;
}
.versionList li{
    height:2.5rem;
    line-height: 2.5rem;
    position: relative;
    padding-left:2.8rem;
    padding-right:2rem;
}
.versionList li:not(:last-child){
    border-bottom:1px solid #e5e5e5;
}
.versionList li .iconfont{
    font-size: 1.5rem;
    position: absolute;
    left:0;
    color:#666;
}
.versionCircle{
    position: absolute;
    right:0.5rem;
    top:0.75rem;
    width:1rem;
    height:1rem;
    border: 1px solid #999;
    border-radius: 0.5rem;
}
.checkedVersion{
    background: #FFD91E;
}
</style>
