<template>
    <div class="page" id="TMSillPage"> 
        <!-- Header -->
        <mt-header fixed title="账单详情">
            <mt-button icon="back" slot="left" @click="backPage()"></mt-button>
        </mt-header>

        <div id="TMSBillDetailContainer" class="container-top" v-infinite-scroll="driverloadMore()" infinite-scroll-immediate-check="false" infinite-scroll-disabled="loading" infinite-scroll-distance="50">
           
            <mypulldown>
                <div slot= "pullList" :style = "{minHeight:listViewH + 'px'}">
                    <myorderdriver :options="driverList" title="bill" ></myorderdriver> 
                    <div class="noData">{{noDriverData}}</div>
                    <!-- 加载指示器 -->
                    <div class="sw-spinner" v-if="driverLoadMore">
                        <mt-spinner type="snake" color="#FFD91E"></mt-spinner>
                    </div>
                </div>
            </mypulldown>
        </div>
    </div>
</template>

<script>
// Ajax request module, return a Promise
import Tokens from '../token'
import  Myorderdriver from '../components/myorderdriver'
import  Mypulldown from '../components/mypulldown'//引入下拉刷新的组件
export default {
    components:{
        Myorderdriver,
        Mypulldown
    },
    data () {
        return {
            isLoadId:null,  
            listViewH:0,//下拉刷新框的最小高度
            userId:'',
            sessionId:'',
            subSystem:'',

            fachId:'',//账单Id
            fachType:'',//对账对象类型
            TMSfinType:'',
            driverList:[],//车次列表
            noDriverData:'',//没有车次数据
            driverCurrPage:1,//车次当前页面
            driverLoadMax:false,//车次是否加载到最大条数
            driverLoadMore:false,//车次加载指示器
            driverloading:false,//车次是否在无限加载

        }
    },
    ready (){
        let self = this; 
        //列表框的最小高度
        self.$nextTick(()=>{
            self.listViewH = $("#TMSBillDetailContainer").height() - 10;
        })

    },
    events:{
        refreshList(id,topStatus){//下拉刷新时重置列表数据
            let self = this;
            self.isLoadId = id;
            setTimeout(() => {
                // self.driverList = [];//车次列表
                self.noDriverData = '';//没有车次数据
                self.driverCurrPage = 1;//车次当前页面
                self.driverLoadMax = false;//车次是否加载到最大条数
                self.getDriverData();
            }, 1000);
    
        },
        taskDetailShow(index,value,ttId){//显示任务详情页面
            let self = this;
            if(self.subSystem == "KF"){
                return;
            }
            let isStop = isXLorClick();
            if(isStop){
                //这里可以加入你阻止点击时的其它操作
                $(".myorderdriver").removeClass("active_border");
                return;
            }
            self.currDriverList = [];
            self.currDriverList.push(self.driverList[index]);
            Tokens.save("currDriverList",self.currDriverList);
            self.go('/TMSBillOrderList', ttId); 
        },
    },
    methods: {
        backPage(){
            let self = this;
            let backPath = Tokens.fetch("TMSBillDetailBackPath");
            self.back(backPath);
        },
        go (link, param) {
            let self = this
            self.$transfer.go(self, link, param)
        },
        back (link, param) {
            let self = this
            self.$transfer.back(self, link, param);
        },
        driverloadMore(){//车次加载更多
            let self = this;
            let isStop = isXLorClick();
            if(isStop){ return;}
            if(self.driverloading || self.driverLoadMax || self.driverCurrPage <= 1){
                return;
            }else{
                self.driverloading = true;
                self.driverLoadMore = true;
                setTimeout(function(){
                    self.getDriverData(); 
                },1000)

            }
        },
        getDriverData(){//查看一个账单详情
            let self = this;
            let s = {};
            if(self.fachType=="ZD-ZD1" || self.fachType=="ZD-ZD2"){//与站点
                s = {   action:"/tmTask/query",
                        pageIndex:self.driverCurrPage,
                        pageSize:10,
                        params:{"ttOrgAccountId":self.fachId}
                    };
            }else if(self.fachType=="ZD-SJ"){//账单提醒
                s = {   action:"/tmTask/query",
                        pageIndex:self.driverCurrPage,
                        pageSize:10,
                        params:{"ttCarrierAccountId":self.fachId}
                    };
            }else if(self.fachType=="ZD-KF"){//收付款提醒
                s = {   action:"/tmOrderHead/query1",
                        pageIndex:self.driverCurrPage,
                        pageSize:10,
                        params:{"tohAccountId":self.fachId}
                    };
            }

            s.showFiles = "rowId,fachId,ttId,ttDriverLogo,ttStartOrgName,ttStartCompanyName,ttStage,ttDriver,ttDriverMobile,ttCarrierAmt,ttCarrierInputMode,ttTruckCode,ttDepartDate,ttCount,ttLoadCount,ttUnloadCount";
            
            doAjaxQuery(s,function(data) {
                if(data.status == 0){
                    self.$transfer.backLogin(self, data);
                }else if(data.status == 1){
                    let obj = data.dataset.rows;
                    if(obj && obj.length > 0){
                       obj.forEach(function(item, index){
                            item.ttDriverLogo = getImgURL() +'user/' +item.ttDriverLogo;
                            var ImgObj = new Image(); 
                            ImgObj.src = item.ttDriverLogo; 
                            ImgObj.onerror = function(){
                                item.ttDriverLogo = getImgURL() + 'user/default.png';
                            }
                            
                            item.ttStartOrgName = item.ttStartCompanyName+"-"+item.ttStartOrgName + '　委派';
                            item.ttStage = item.ttStage == 'ZC'?'整':item.ttStage == 'TH'?'提':item.ttStage == 'GX'?'干':item.ttStage == 'SH'?'送':'';
                            if(self.TMSfinType == "report-yf" || self.TMSfinType == "yw-cb" || self.TMSfinType == "dz-zf" || self.TMSfinType == "sh-cb"){
                                if(self.fachType == "ZD-SJ"){
                                    item.showAmt = (item.ttCarrierAmt&&item.ttCarrierAmt>0) ? "-" + item.ttCarrierAmt.toFixed(2) : item.ttCarrierAmt;
                                }else{
                                    item.showAmt = (item.ttOrgAmt&&item.ttOrgAmt>0) ? "-" + item.ttOrgAmt.toFixed(2) : item.ttOrgAmt;
                                }
                            }else if(self.TMSfinType == "report-ys"  || self.TMSfinType == "yw-sr"){

                                item.showAmt = (item.ttOrgAmt&&item.ttOrgAmt>0) ? item.ttOrgAmt.toFixed(2) : item.ttOrgAmt;
                            }
                            
 
                        })
                        //判断是替换还是增加
                        if(self.driverCurrPage == 1){
                            self.driverList = obj;
                        }else{
                            self.driverList = self.driverList.concat(obj);
                        } 

                        //判断当前页是否是最后一页  
                        let maxRecord = parseInt(data.dataset.allRowCount);
                        if(self.driverList.length == maxRecord){
                            self.driverLoadMax = true;
                            self.noDriverData = '已全部加载';
                        }
                        self.driverCurrPage++;
                    }else{
                        self.driverLoadMax = true;
                        if(self.driverCurrPage == 1){
                            self.driverList = [];
                            self.noDriverData = "没有相关数据"
                        }else{
                            self.noDriverData = '已全部加载';
                        }
                    }
                    if(self.isLoadId){
                        self.$nextTick(()=>{
                            self.$broadcast('onTopLoaded', self.isLoadId); 
                            self.isLoadId = null;
                        }) 
                    }

                }

                self.$Indicator.close();
                self.driverLoadMore = false;
                self.driverloading = false;
            })

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
            let token = Tokens.fetch("token");
            self.userId = token["userId"];
            self.sessionId = token["sessionId"];
            self.subSystem = token["subSystem"];
            self.isLoadId = null;
            if(from.path && from.path.indexOf('TMSBillOrderList')!= -1 && self.driverList.length != 0){     
                let preSrollTop = Tokens.fetch("TMSBillDetailContainer");
                self.$nextTick(()=>{
                    $('#TMSBillDetailContainer').animate({scrollTop:preSrollTop},0); 
                })
            }else{
                self.fachId = Tokens.fetch("fachId");
                self.fachType = Tokens.fetch("fachType");
                self.TMSfinType = Tokens.fetch("TMSfinType");

                self.driverList = [];//车次列表
                self.noDriverData = '';//没有车次数据
                self.driverCurrPage = 1;//车次当前页面
                self.driverLoadMax = false;//车次是否加载到最大条数
                self.driverLoadMore = false;//车次加载指示器
                self.driverloading = false;//车次是否在无限加载
                self.$Indicator.open();
                self.getDriverData();
                self.$nextTick(()=>{
                    $('#TMSBillDetailContainer').animate({scrollTop:0},0); 
                })
            }

            //需要返回的路径
            if(from.path && (from.path.indexOf('oughtBill')!= -1 || from.path.indexOf('financeAffirm')!= -1 || from.path.indexOf('accountManage')!= -1  || from.path.indexOf('accountCheckManage')!= -1)){
                Tokens.save("TMSBillDetailBackPath",'');
                Tokens.save("TMSBillDetailBackPath",from.path);
            }
            next();
        },
        deactivate ({ next }) {
            //Triggers when component destroys
            next()
        },
        canDeactivate({to, from, next}) {
            let self = this;
            let scrollTop = $("#TMSBillDetailContainer").scrollTop();
            Tokens.save("TMSBillDetailContainer",scrollTop);
            next()
        },
        activate({to, from, next}) {
            let self = this
            next()
        } 
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
