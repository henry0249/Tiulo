<template>
    <div class="page" id="propertyPage">    
        <mt-header fixed title="固定资产">
            <mt-button icon="back" slot="left"  @click="back('/financeManage')"></mt-button>
        </mt-header> 

        <div class="container-top" id="propertyAffirmContainer" v-infinite-scroll="loadMore()" infinite-scroll-immediate-check="false" infinite-scroll-disabled="loading" infinite-scroll-distance="50">
            
            <mypulldown>
                <div slot= "pullList" :style = "{minHeight:listViewH + 'px'}">
                    <div class="property_box">
                        <div class="property" v-for="property in propertyList">
                            <div class="fl iconBox">
                                <span slot="icon" class="iconfont iconPic">{{{property.showIcon}}}</span> 
                            </div>
                            <div class="fl">{{property.faiName}}</div> 
                            <div class="fr chageBox">
                                {{property.faiQty > 99999 ? '99999+' : property.faiQty}}
                                <span @click.stop ="changeProperty('add',$index,property)" style="left:0" slot="icon" class="iconfont fl">&#xe6c9;</span> 
                                <span @click.stop ="changeProperty('minus',$index,property)" style="right:0" slot="icon" class="iconfont fr">&#xe67a;</span>   
                                  
                            </div>
                        </div>
                        <div class="noData">{{noPropertyData}}</div>                                          
                    </div>
                </div>
            </mypulldown>

        </div> 
    </div>
</template>

<script>
// Ajax request module, return a Promise
import Tokens from '../token'
import  Mypulldown from '../components/mypulldown'//引入下拉刷新的组件
export default {
    components: {
        Mypulldown
    },
    data () {
        return {
            isLoadId:null,
            listViewH:0,//下拉刷新框的最小高度
            userId:'',
            subSystem:'',
            propertyList:[],//资产列表
            noPropertyData:'',//没有资产
        }
    },
    ready (){
        let self = this;
        
        //列表框的最小高度
        self.$nextTick(()=>{
            self.listViewH = $("#propertyAffirmContainer").height() -10;
        })

    },
    events:{
        refreshList(id,topStatus){//下拉刷新时重置列表数据
            let self = this;
            self.isLoadId = id;
            setTimeout(() => {
                self.noPropertyData = '';
                self.getPropertyData();     
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
        getPropertyData(){
            let self = this;
            let s = {   action:"/finAssetsInfo/query",
                        params:{}
                    }; 
            doAjaxQuery(s,function(data) {
                if(data.status == 0){
                    self.$transfer.backLogin(self, data);
                }else if(data.status == 1){
                    let obj = data.dataset.rows;
                    if(obj && obj.length>0){
                        obj.forEach(function(item, index){
                            item.showIcon = item.faiName == '货车' ? '&#xe67d;' :
                                            item.faiName == '叉车' ? '&#xe6ef;' :
                                            item.faiName == '地牛' ? '&#xe67b;' :
                                            item.faiName == '托盘' ? '&#xe67c;' :
                                            item.faiName == '办公用品' ? '&#xe67f;' : '&#xe67e;';
              
                        })
                        self.propertyList = obj;

                    }else{
                        self.propertyList = [];
                        self.noPropertyData = "没有相关资产"
                    }
                    self.$Indicator.close();
                    if(self.isLoadId){
                        self.$nextTick(()=>{
                            self.$broadcast('onTopLoaded', self.isLoadId);
                            self.isLoadId = null;
                        }) 
                    }
                }

            });

        },
        changeProperty(type,index,property){//修改固定资产
            let self = this;
            if(type == 'add'){
                self.propertyList[index].faiQty ++ ;
            }else if(type == 'minus' &&　self.propertyList[index].faiQty >= 1){
                self.propertyList[index].faiQty -- ;
            }else{
                return;
            }

            let changeData = property;
                changeData.state = 'u';
            let s = {   action:"/finAssetsInfo/save",
                        datasets:{dsData:{rows:[changeData]}},
                        params:{}
                    }; 
            doAjaxUpdate(s,function(data) {
                if(data.status == 0){
                    self.$transfer.backLogin(self, data);
                }else if(data.status == 1){
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
            self.subSystem = token["subSystem"]; 
            self.noPropertyData = '';
            self.$Indicator.open();
            self.getPropertyData(); 
   
            next()
        },
        deactivate ({ next }) {
            //Triggers when component destroys
            next()
        },
        canDeactivate({to, from, next}) {
            let self = this;
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
.property{
    background: #fff;
    padding:0.5rem;
    height:3rem;
    line-height: 2rem;
    border-bottom:1px solid #e5e5e5;
}
.property>div{
    display: inline-block;
}
.property .iconBox{
    width:2rem;
    height:2rem;
    background: #353535;
    border-radius: 0.3rem;
    text-align: center;
    margin-right:0.5rem;
}
.property .iconPic{
    font-size: 1.2rem;
    color:#fff;
}
.property .chageBox{
    position: relative;
    width:45%;
    padding:0 1.8rem;
    text-align: right;
}
.chageBox .iconfont{
    position: absolute;
    top:0;
    font-size: 1.5rem;
    color: #FFD91E;
}



</style>
