<template>
    <div class="page" id="financeManagePage">
        <!-- Header -->
        <mt-header fixed title="财务管理">
            <mt-button slot="left" @click="back('/TMStaskList')">
                <span slot="icon" class="iconfont">&#xe605;</span> 
            </mt-button>
        </mt-header> 
        <div class="container-top" style="margin-bottom:3rem;" id="financeManageContainer" v-infinite-scroll="loadMore()" infinite-scroll-immediate-check="false" infinite-scroll-disabled="loading" infinite-scroll-distance="50">    

            <ul class="financeBox">
                <li v-for="finance in financeList">
                    <div @click="chooseFinanceType(finance.val)">
                        <span class="icon_set lf">{{finance.label}}</span>
                        <span class="iconfont fr rt_arrow">&#xe645;</span> 
                    </div>
                    
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
            token:'',
            userId:'',//driverId 默认为userId 
            sessionId:'',
            subSystem:'',
            companyId:'',
            orgId:'',
            financeList:[{label:'业务成本支付确认',val:'yw-cb'},
                        {label:'业务收入确认',val:'yw-sr'},
                        // {label:'经营财务支付确认',val:'jy-cb'},
                        // {label:'经营财务收入确认',val:'jy-sr'},
                        {label:'应收款汇总',val:'report-ys'},
                        {label:'应付款汇总',val:'report-yf'},
                        {label:'固定资产管理',val:'gdzc'}],
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
        chooseFinanceType(type){//财务类型
            let self = this;

            Tokens.save("TMSfinType",'');
            Tokens.save("TMSfinType",type);

            if(type == "yw-cb" || type == "yw-sr" || type == "jy-cb" || type == "jy-sr"){
                self.go("financeAffirm")

            }else if(type == "report-ys" || type == "report-yf"){
                self.go("oughtAffirm")

            }else if(type == "gdzc"){
                self.go("propertyAffirm")
            }
        }

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
            self.subSystem = self.token["subSystem"];

            next()
        },
        deactivate ({ next }) {
            next()
        },
        canDeactivate({to, from, next}) {
            let self = this;
            self.$parent.$data.showBar = false;
            self.$parent.$data.taskPageDefalut = "/financeManage"
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
.financeBox{
    background: #fff;
    padding-left:0.5rem;
    border-bottom:1px solid #e5e5e5;
}
.financeBox li>div{
    padding:0.6rem 0.5rem;

}
.financeBox li:not(:last-child)>div{
    border-bottom:1px solid #e5e5e5;
}

</style>

