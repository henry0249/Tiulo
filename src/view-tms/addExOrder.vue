<template>
    <div class="page"> 
        <mt-header fixed title="选择订单">
            <mt-button icon="back" slot="left" @click="backPage()"></mt-button>
            <mt-button slot="right" @click="addOrder()">完成</mt-button>
        </mt-header>
        <!-- 搜索框 -->
        <div class="container-search" id="chooseOrderMysearchBox"> 
            <mysearch
              :value.sync="searchVal"
              placeholder="订单号、收/发货人、始发地、目的地">
            </mysearch>
        </div> 
        <div class="container-top" id="chooseOrderContainer"> 
            <mypulldown style="margin-top:2.8rem">
                <div slot= "pullList" :style = "{minHeight:listViewH + 'px'}">
                    <Mychooseorder
                        :value.sync="value"
                        :options="orderList">
                    </Mychooseorder>
                    <div class="noData">{{noOrderData}}</div>
                </div>
            </mypulldown>
            
        </div> 
    </div>
</template>

<script>
// Ajax request module, return a Promise
import Tokens from '../token'
import  Mysearch  from '../components/mysearch'
import  Mychooseorder  from '../components/mychooseorder'
import  Mypulldown from '../components/mypulldown'//引入下拉刷新的组件
export default {
    components: {
        Mysearch,
        Mychooseorder,
        Mypulldown
    },
    data () {
        return {
            listViewH:0,//下拉刷新框的最小高度
            isLoadId:null,//用来存储下拉刷新时带过来的id,初始设置为null,在数据加载完成后清除加载指示时
            searchTimer:null,
            searchVal:'',
            userId:'',//driverId 默认为userId 
            subSystem:'',//版本
            sessionId:'',
            noOrderData:'',
            companyId:'',
            orgId:'',
            orderList:[],
            value:[],
            beforeScrollTop:0,//存储页面当前scrollTop
        }
    },
    ready () {
        let self = this;
        //列表框的最小高度
        self.$nextTick(()=>{
            self.listViewH = $("#chooseOrderContainer").height() - $("#chooseOrderMysearchBox").height() -10;
        }) 
        searchBoxIsShow('#chooseOrderContainer','#chooseOrderMysearchBox',self.beforeScrollTop,function(top){
            self.beforeScrollTop = top;  
        })
    },
    watch:{
        // 'value':function valueChange(argument) {
        //     let self = this;
        // },
        'searchVal': function(){//搜索内容改变执行此方法
            let self = this;
            if(self.searchNum == 0){//刚进来重置searchVal不执行搜索
                self.searchNum++;
                return;
            } 
            clearInterval(self.searchTimer);//清除上一次的定时器  防止效果叠加
            self.searchTimer = setTimeout(function(){
                self.noOrderData = "";
                self.value = [];
                self.getOrderData();
            },1000);
        }
    },
    events:{
        refreshList(id,topStatus){//下拉刷新时重置列表数据
            let self = this;
            self.isLoadId = id;
            setTimeout(() => {
                self.noOrderData = "";
                self.value = [];
                self.getOrderData();
            }, 1000);
    
        },
        chooseValue(arr){
            let self = this;
            self.value = arr;
        },
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
        backPage(){//返回哪个页面
            let self = this;
            let backPath = Tokens.fetch("addExOrderBackPath");
            self.back(backPath);
        },
        addOrder(){//保存选择了的订单
            let self = this;
            let alertText;
            if(self.value.length == 0){
                alertText = "您没有选择订单！"
            }else{
                alertText = '确定添加'+self.value.length+'个异常订单?';
            }
            self.$MessageBox.confirm(alertText)
            .then(action => { 
                Tokens.save("chooseExOrder",'');
                Tokens.save("chooseExOrder",self.value);
                Tokens.save("isChooseExOrder","YES");
                self.value = [];
                $(".TBBcircle").removeClass("seTBBcircle");
                self.backPage();
            }).catch(function(){}) 

        },
        getOrderData(){//获取可选择的订单
            let self = this;
            let s = {   action:"/tmOrderHead/query1",
                        _sessionId:self.sessionId,
                        params:{"opType":"query","endOrg":"1",findString:self.searchVal}
                    };
            doAjaxQuery(s,function(data) {
                if(data.status == 0){
                    self.$transfer.backLogin(self, data);
                }else if(data.status == 1){
                    self.noOrderData = '';
                    let obj = data.dataset.rows;
                    if(obj && obj.length>0){
                        obj.forEach(function(item, index){
                            if(!item.tohOrderNo ||item.tohOrderNo == '*' || item.tohId == item.tohOrderNo){
                                item.tohOrderShow = item.tohId;
                            }else{
                                item.tohOrderShow = item.tohId+ '/' +item.tohOrderNo;
                            }
                            //承运人显示逻辑
                            if(self.subSystem=='KF' && item.tohOrgId!='*' && item.tohOrgId != self.orgId){
                                //显示 tohCompanyName  tohOrgName
                                item.tohRecvMan = item.tohCompanyName +'-'+ item.tohOrgName;
                            }else if(self.subSystem=='TMS' && item.tohRecvCompanyId!='*' &&item.tohRecvCompanyId!=self.companyId){
                                // 显示 tohRecvCompanyName
                                item.tohRecvMan = item.tohRecvCompanyName;
                                if(item.tohStartOrgId != '*'){
                                    item.tohRecvMan = item.tohRecvCompanyName +'-'+ item.tohStartOrgName;
                                } 
                            }
                            item.tohTypeG = item.tohType1;

                            //物料明细 
                            item.tchDetail = JSON.parse(item.tohDetail);
                            item.value = item.tohId;
                            item.label = '订单号：'+item.tohOrderShow;

                        });
                        self.orderList = obj;

                    }else{
                        self.orderList = [];
                        self.noOrderData = "没有相关订单"
                    }
                    self.$Indicator.close();
                    if(self.isLoadId){
                        self.$nextTick(()=>{
                            self.$broadcast('onTopLoaded', self.isLoadId); 
                            self.isLoadId = null;
                        }) 
                    }
                }
            })
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
            self.sessionId = token["sessionId"];
            self.orgId = token["orgId"];
            self.companyId = token["companyId"];
            self.searchNum = 0;
            self.beforeScrollTop = 0;
            self.value = [];
            self.isLoadId = null;
            self.noOrderData = "";
            //需要返回的路径
            if(from.path && from.path.indexOf('taskOrderAddExtremely')!= -1){
                Tokens.save("addExOrderBackPath",'');
                Tokens.save("addExOrderBackPath",from.path);
            }
            self.getOrderData();
            next()
        },
        deactivate ({ next }) {
            //Triggers when component destroys
            next()
        },
        canDeactivate ({ next, to, abort }) {
            //Triggers when component destroys
            const self = this
            $('#chooseOrderMysearchBox').slideDown();
            next()
        }
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.order{
    border-bottom:1px solid #e5e5e5;
    border-top:1px solid #e5e5e5;
    margin-bottom: 0.3rem;
    background: #fff;
}
.order .codeLine{
    overflow:hidden;
    padding:0 0 0 0.5rem;
    border-bottom:1px solid #e5e5e5;
}
.order .codeLine li{
    float:left;
    height:2rem;
    line-height: 2rem;
    overflow:hidden;
    white-space:nowrap;
    text-overflow:ellipsis; 
}
.order_content{
    padding:0.5rem;
}
.shoufa{
    overflow: hidden;
}
.shoufa li{ 
    float:left;
    width:100%;
    height:1.3rem;
    line-height: 1.3rem;
    overflow:hidden;
    white-space:nowrap;
    text-overflow:ellipsis; 
}

</style>
