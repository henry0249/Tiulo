<template>
    <div class="page"> 
        <mt-header fixed title="修改记录">
            <mt-button icon="back" slot="left" @click="backPage()"></mt-button>
        </mt-header> 
        <div class="container-top"> 
            <mypulldown>
                <div slot= "pullList" :style = "{minHeight:listViewH + 'px'}">
                    <div class="modifiedOne" v-for="modified in modifiedList">
                        <img class="modified_img" :src="modified.suLogo">
                        <ul>
                            <li>{{modified.sulUserName}} {{modified.sulOrgName}}</li>
                            <li v-for = "mText in modified.sulText" v-html="mText"></li>
                        </ul>
                        <span slot="icon" class="iconfont modifiedDelBtn" @click="modifiedDel($index,modified.sulId)">&#xe65b;</span>
                    </div> 
                    <div class="noData">{{noModifiedData}}</div> 
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
            ttdriverId:'',//driverId 默认为userId 
            sessionId:'',
            subSystem:'',
            keyId:'',//修改记录的keyId
            modifiedList:[],//订单修改的数据
            noModifiedData:'',//没有修改数据
        }
    },
    ready (){
        let self = this; 
        //列表框的最小高度
        self.$nextTick(()=>{
            self.listViewH = $(".container-top").height()-10;
        })

    },
    events:{
        refreshList(id,topStatus){//下拉刷新时重置列表数据
            let self = this;
            self.isLoadId = id;
            setTimeout(() => {
                // self.modifiedList = [];//订单修改的数据
                self.noModifiedData = '';//没有修改数据
                self.getModifiedData();
            }, 1000);
    
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
            let backPath = Tokens.fetch("taskOrderModifiedBackPath");
            self.back(backPath);
        },
        getModifiedData(){//获取订单修改记录
            let self = this;
            let s = {   action:"/secUserLog/query",
                        sessionId:self.sessionId,
                        params:{"keyId":self.keyId}
                    };
            self.$Indicator.open();
            doAjaxQuery(s,function(data) {
                if(data.status == 0){
                    self.$transfer.backLogin(self, data);
                }else if(data.status == 1){
                    let obj = data.dataset.rows;
                    if(obj.length>0){
                        obj.forEach(function(item, index){
                            item.suLogo = getImgURL() +'user/' +item.suLogo;
                            var ImgObj = new Image(); 
                            ImgObj.src = item.suLogo; 
                            ImgObj.onerror = function(){
                                item.suLogo = getImgURL() + 'user/default.png';
                            }
                            if(item.sulText ){
                                item.sulText =  item.sulText.split('，')
                            }
                               
                        });
                        self.modifiedList = obj;
                        self.noModifiedData = '已全部加载';

                    }else{
                        self.noModifiedData = '没有修改记录';
                    }
                    if(self.isLoadId){
                        self.$nextTick(()=>{
                            self.$broadcast('onTopLoaded', self.isLoadId); 
                            self.isLoadId = null;
                        }) 
                    }

                }
                self.$Indicator.close();
            });
        },
        modifiedDel(index,sulId){//删除修改记录
            let self = this;
            let isStop = isXLorClick();
            if(isStop){return;}
            self.$MessageBox.confirm('确定要删除这条修改记录?')
            .then(action => {
                let s = {   action:'/secUserLog/execute',
                            sessionId:self.sessionId,
                            params:{"keyId":sulId,"opType":"delete"}
                        };

                self.$Indicator.open();
                doAjaxUpdate(s,function(data) {
                    if(data.status == 0){
                        self.$transfer.backLogin(self, data);
                    }else if(data.status == 1){
                        self.modifiedList.splice(index, 1);
                        self.$transfer.showToast(self, "删除成功");
                    }
                    self.$Indicator.close();    
                });             
            }).catch(function(){})
        },
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
            self.ttdriverId = token["userId"];
            self.sessionId = token["sessionId"];
            self.subSystem = token["subSystem"];
            self.keyId = self.$route.params.keyId;
            self.modifiedList = [];//订单修改的数据
            self.noModifiedData = '';//没有修改数据
            self.isLoadId = null;
            //需要返回的路径
            if(from.path && ((from.path.indexOf('taskDetail')!= -1) || (from.path.indexOf('traceList')!= -1) || (from.path.indexOf('orderManage')!= -1)  || (from.path.indexOf('joinManage')!= -1) || (from.path.indexOf('joinTruckDetail')!= -1) || (from.path.indexOf('signManage')!= -1))){
                Tokens.save("taskOrderModifiedBackPath",'');
                Tokens.save("taskOrderModifiedBackPath",from.path);
            }
            self.getModifiedData();
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
.modifiedOne{
    border-top:1px solid #e5e5e5;
    border-bottom:1px solid #e5e5e5;
    margin-bottom:0.3rem;
    overflow: hidden;
    box-sizing: border-box;
    background: #fff;
    padding:0.5rem 2.5rem 0.5rem 4rem;
    position: relative;
    min-height: 4rem;
}
.modified_img{
    width:3rem;
    height:3rem;
    position: absolute;
    top:0.5rem;
    left:0.5rem;
    border:1px solid #e5e5e5;
    border-radius: 0.3rem;
}
.modified ul{
    padding:0.5rem;
}
.modified ul li{
    line-height: 1rem;
}
.modifiedDelBtn{
    position: absolute;
    top:0;
    right:0;
    padding:0.5rem;
    font-size:1.2rem;
    color:#999;
}

</style>
