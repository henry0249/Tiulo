<template>
    <div class="page" id="addExpage"> 
        <mt-header fixed :title="ttTitle">
            <mt-button icon="back" slot="left" @click="goBack()"></mt-button>
            <!-- <mt-button icon="back" slot="left" @click="back('/taskDetail')"></mt-button> -->
        </mt-header>

        <div class="container-top"> 
            <ul class="ex_start">
                <li style="position: relative;">
                    <span class="ex_title">主题</span> 
                    <input class="ex_input" v-model="texTitle" placeholder="请输入主题（限20个字）" maxlength="20" /> 
                </li>

                <li class="ex_li2">
                    <textarea v-model="texText" rows="6" style="padding:0;resize: none;width:100%;border:none;" placeholder="请输入异常描述"></textarea>
                </li>             
            </ul>
            <div>
                <div class="exImgBox" v-for="oldI in oldImages" id="old-{{$index}}" track-by="$index">
                    <img  class="ex_img" :src="oldI" @click.stop="showBigPic('old',$index,oldI)">
                    <span id="oDel-{{$index}}" class="iconfont delPicIcon" slot="icon" @click.stop="deletePic('old',$index,oldI)">&#xe6cf;</span>
                </div> 
                <div class="exImgBox" v-for="newI in newImages" id="new-{{$index}}" track-by="$index">
                    <img class="ex_img" :src="newI" @click.stop="showBigPic('new',$index,newI)">
                    <span id="nDel-{{$index}}" class="iconfont delPicIcon" slot="icon" @click.stop="deletePic('new',$index,newI)">&#xe6cf;</span>
                </div> 
                <div class="exImgBox">
                    <img class="ex_img" src="../img/camera.jpg" @click="addExPic()">
                </div> 
            </div> 
            <div style="padding:0.5rem;text-align:right;">
                <mt-button size="small" style="background:#353535;color:#FFD91E;" @click="addTruckEx()">保存</mt-button>
                <mt-button v-if="ttType == 'detail'" size="small" style="background:#aaa;color:#FFD91E;" @click="delTruckEx()">删除</mt-button>
            </div> 
        </div>
        <mt-popup :visible.sync="bigImgShow" position="center" class="popup_box" popup-transition="popup-fade">
            <img :src="bigImg" width="100%">
            <div class="close_img" @click.stop="close_img_pop()">
                <!-- <span class="iconfont" style="font-size:2rem;color:#fff;">&#xe660;</span> -->
                <img src="../img/cha.png" width="40">
            </div>
        </mt-popup>  
    </div>
</template>

<script>
// Ajax request module, return a Promise
import Tokens from '../token'
import * as actions from '../vuex/actions'
export default {
    vuex: {
        actions: {
            addBList: actions.addBList,
            deleteList:actions.deleteList,
            updateExList:actions.updateAllList,
        },
        getters: {
            truckExList: state => state.truckExList,
        }
    },
    data () {
        return {
            ttdriverId:'',//driverId 默认为userId 
            sessionId:'',
            ttId:'',//车次Id
            ttType:'',//本页是显示详情还是新增
            ttTitle:'',//页面的title

            truckExDetail:'',//车次异常详情数据
            truckExIndex:'',//异常的角标
            texText:'',//异常描述
            texTitle:'',//异常文字
            newImages:[],//新加的异常图片
            oldImages:[],//以前的异常图片
            browserType:'',//Android或者微信判断

            bigImgShow:false,//Android显示大图
            bigImg:'',//大图路径
        }
    },
    ready(){
        let self = this;
        $("#addExpage").off().on("click",function(){
            $(".delPicIcon").hide();
        });

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
        goBack(){
            let self = this;
            let backPath = Tokens.fetch("taskTruckAddExBackPath");
            self.back(backPath);
        },
        addExPic(){
            let self = this;
            if (browserType=="android") {
                 // window.Photo.getPicture();
                window.Photo.selectPictures();
                self.$nextTick(() =>{
                    setTimeout(function(){
                        let imgData = window.Photo.getPics();
                        let imgArr = JSON.parse(imgData).imgs;
                        for(let k=0;k<imgArr.length;k++){
                            let imgStr = "data:image/jpg;base64," + imgArr[k].img;
                            self.newImages.push(imgStr)
                        }
                    },500)
                })
            }else{
                weChatChooseImage(function(localIds){//通过微信方法获取图片
                    self.newImages = self.newImages.concat(localIds);
                })
            }
        },
        showBigPic(type,Index,currUrl){
            let self = this;
            let currUrl2 = currUrl;
            $(".delPicIcon").hide();
            if(type == "new"){
                $("#nDel-"+Index).show();
            }else if(type == "old"){
                $("#oDel-"+Index).show();
                currUrl2 = currUrl.replace("ex", "ex_big");
            }     
            let bigImg = [];//查看大图
            if(self.oldImages.length > 0){
                self.oldImages.forEach(function(item, index){
                     item = item.replace("ex", "ex_big");
                     bigImg.push(item);
                });
            }
            if(browserType=="android"){
                self.bigImgShow = true;
                self.bigImg = currUrl2;
            }else{
                let allImages = bigImg.concat(self.newImages);
                weChatPreviewImg(currUrl2,allImages);
            }
        },
        close_img_pop(){//查看大图后返回
            let self = this;
            self.bigImgShow = false;
            self.bigImg = "";
        },
        deletePic(type,index,url){//删除异常图片
            let self = this;
            self.$MessageBox.confirm('确定要删除这张图片?')
                .then(action => { 
                    $(".delPicIcon").hide();
                    if(type=="new"){
                        self.newImages.splice(index,1);
                    }else if(type=="old"){
                        //删除数据库的数据
                        let urlPath = url.split("tmEx/")[1];
                        self.truckExDetail.texPic.pop();
                        self.truckExDetail.texPic.splice(index,1);
                        let newDBpath = self.truckExDetail.texPic.join(',')+",";
                        doAjaxDelete(
                            "other",
                            {
                                delpath:urlPath,
                                mode:"tmEx",
                                id:self.truckExDetail.texId,
                                type:"ex",
                                newDBpath:newDBpath
                            },
                            function(data){
                                if(data.status == 0){
                                    self.$transfer.backLogin(self, data);
                                }else if(data.status == 1){
                                    self.oldImages.splice(index,1);//删除页面上的数据
                                    Tokens.save("truckExDetail",self.truckExDetail);
                                }
                            }
                        )
                        
                    }

                }).catch(function(){})
            
            
        },
        addTruckEx(){//新增车次异常
            let self = this;
            if(!self.texTitle){
                self.$transfer.showToast(self, "请输入异常主题");
                return;
            }else if(!self.texText){
                self.$transfer.showToast(self, "请输入异常描述");  
                return;
            }else{
                self.$MessageBox.confirm('确定保存?')
                .then(action => {
                    let newRowId,newState,newTexId,newTexModifyDate,newBackPic;
                    if(self.ttType == "add"){
                        newRowId = parseInt(Math.random()*1000);
                        newState = "i";
                        newTexId = '';
                        newTexModifyDate = '';
                        newBackPic = [];

                    }else if(self.ttType == "detail"){
                        newRowId = self.truckExDetail.rowId;
                        newState = "u";
                        newTexId = self.truckExDetail.texId;
                        newTexModifyDate = self.truckExDetail.texModifyDate;
                        newBackPic = self.truckExDetail.backPic;
                    }
                    let newEx = {   texTaskId:self.ttId,
                                    rowId:newRowId,
                                    state:newState,
                                    texId:newTexId,
                                    texModifyDate:newTexModifyDate,
                                    texStatus:'0',
                                    texTitle:self.texTitle,
                                    texText:self.texText,
                                };

                    let s =  {action:"/tmEx/save","sessionId":self.sessionId,commandType:"Update",rowId:1};
                        s.datasets = {dsData:{rows:[newEx]}} ;
                        s.datasets.dsLine2 = {rows:[{ rowId:1,
                                                    state:"i",
                                                    teuRecvUserId:'*',
                                                    teuRecvOrgIds:'*',
                                                    teuRecvSubSystem:'*'
                                                  }]
                                             };

                    self.$Indicator.open();
                    doAjaxUpdate(s,function(data) {
                        if(data.status == 0){
                            self.$transfer.backLogin(self, data);
                        }else if(data.status == 1){
                            let obj = data.datasets.dsData.rows[0];
                            let backTexId = obj.texId;
                            let newExData = [{  texTitle:self.texTitle,
                                                texText:self.texText,
                                                texId:backTexId,
                                                texModifyDate:obj.texModifyDate,
                                                backPic:newBackPic
                                            }]
                            if(self.newImages.length>0){
                                if(browserType=="android"){
                                    doAjaxUpload(
                                        "multiple",
                                        {
                                            imgparams : self.newImages.join("@"),
                                            mode : "tmEx",
                                            id : backTexId,//异常id
                                            type : "ex"
                                        },
                                        function(data){
                                            self.$Indicator.close();
                                            self.$transfer.showToast(self, "异常保存成功"); 
                                            setTimeout(function(){  
                                                self.goBack();
                                                self.newImages = [];
                                            },1000)
                                        }
                                    ) 
                                }else{
                                    weChatUploadImg(self.newImages,function(result){//将本地图片上传到微信服务器
                                        let _data = {
                                               media_ids_arr: result.join("@"),
                                               mode : "tmEx",
                                               id : backTexId,//异常id
                                               type : "ex"
                                        };
                                        doWxAjaxUpload(_data,function(data){//将图片上传到数据库
                                            self.$Indicator.close();
                                            self.$transfer.showToast(self, "异常保存成功"); 
                                            setTimeout(function(){  
                                                self.goBack();
                                                self.newImages = [];
                                            },1000)
                                        })
                                    })
                                }   
                            }else{ 
                                self.$Indicator.close();
                                self.$transfer.showToast(self, "异常保存成功");                     
                                setTimeout(function(){   
                                    self.goBack();          
                                },1000)    
                            }
                            if(self.ttType == "add"){
                                self.addBList("truckExList",newExData)
                            }else if(self.ttType == "detail"){
                                self.updateExList("truckExList",self.truckExIndex,newExData)
                            }
                            
                        }
                        
                    });
                }).catch(function(){})

            }

            

        },
        delTruckEx(){//删除车次异常
            let self = this;
            let texId = self.truckExDetail.texId;

            self.$MessageBox.confirm('确定要删除这条车次异常?')
            .then(action => {
                let s = {   action:'/tmEx/del/'+texId,
                            commandType:"Update"
                        };
                self.$Indicator.open();
                doAjaxUpdate(s,function(data) {
                    if(data.status == 0){
                        self.$transfer.backLogin(self, data);
                    }else if(data.status == 1){   
                        
                        self.deleteList("truckExList",self.truckExIndex);
                        self.$Indicator.close();
                        self.$transfer.showToast(self, "删除成功");  
                        setTimeout(function(){
                           self.goBack();
                        },1000)
                    }   
                           
                });           
            }).catch(function(){})

        },
        getData(){
            let self = this;
            if(self.ttType == "add"){//如果是新增
                self.ttTitle = '新增记录';
                self.texTitle = '';
                self.texText = '';
            }else if(self.ttType == "detail"){//如果是到详情
                self.ttTitle = '记录';
                let TEDetail = Tokens.fetch("truckExDetail");
                self.truckExIndex = Tokens.fetch("truckExIndex");

                self.texTitle = TEDetail.texTitle;
                self.texText = TEDetail.texText;
                if(TEDetail.texPic == '*' || !TEDetail.texPic){
                    self.oldImages = [];
                }else{
                    self.oldImages = TEDetail.backPic;
                }
                self.truckExDetail = TEDetail;      
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
            let idType= self.$route.params.ttId.split('-');
            self.ttdriverId = Tokens.fetch("token")["userId"];
            self.sessionId = Tokens.fetch("token")["sessionId"];
            self.ttId = idType[0];
            self.ttType = idType[1];
            self.newImages = [];
            self.oldImages = [];
            self.getData();

             self.browserType = browserType;
            //需要返回的路径
            if(from.path && ((from.path.indexOf('taskDetail')!= -1) || (from.path.indexOf('exceptionList')!= -1))){
                Tokens.save("taskTruckAddExBackPath",'');
                Tokens.save("taskTruckAddExBackPath",from.path);
            }


            next()
        },
        deactivate ({ next }) {
            //Triggers when component tchOrderId
            next()
        },
        canDeactivate ({ next, to, abort }) {
            //Triggers when component destroys
            let self = this
            next()
        }
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.mint-popup{
    background: #f1f1f1;z-index: 2;
}
.popup_box{
    width:100%;height:100%;
    margin-top: 2.2rem;
}
.close_img{
    position: absolute;
    top:1rem;right:1rem;
}
.ex_start{
    background: #fff;
    padding: 0 0.5rem 0.5rem 0.5rem;
}
.ex_start li{
    padding:0.5rem 0;
}
.ex_start .ex_li2{
    box-sizing:border-box;border:1px solid #e5e5e5;border-radius:0.3rem;padding:0.3rem;
}
.ex_start .ex_title{
    position: absolute;
    top:0.5rem;
    left:0.5rem;
}
.ex_start .ex_input{
    width:100%;
    box-sizing: border-box;
    padding: 0 0.5rem;
    padding-left: 3rem;
    height: 1.1rem;
    line-height: 1.1rem;
    /*font-size: 0.65rem;*/
}
.exImgBox{
    display: inline-block;
    position:relative;
    padding:0.5rem;
    width:19.5vw;
    height:19.5vw;
    max-width: 5rem;
    max-height: 5rem;
    box-sizing: border-box;
}
.ex_img{
    display:inline-block;
    width:100%;
    height:100%;
    border:1px solid #e5e5e5;
    border-radius:0.3rem;
    text-align:center;
}
.delPicIcon{
    display: none;
    color:#f00;
    position: absolute;
    top:-0.25rem;
    right:0;
}
</style>
