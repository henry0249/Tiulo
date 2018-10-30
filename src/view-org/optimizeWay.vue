<template>
	<div class="page" @click="clickPage()">
		<mt-header fixed title="优势线路">
            <mt-button icon="back" slot="left" @click.stop="backLast()"></mt-button>
            <mt-button slot="right" style="width:45px;">
                <span style="font-weight:bold;" class="iconfont" @click.stop="addSuper()">&#xe63e;</span>
            </mt-button>
        </mt-header>
        <div class="container-top">
            <div style="margin-bottom:5rem;">
                <div class="head_hint">优势区域</div>
                <div class="select_area_box1" v-if="areaShows" @click.stop="addArea()">
                    <div class="select_area" v-for="area in checkArea" track-by="$index">{{area}}</div>
                </div>
                <div class="select_area_box" v-if="!areaShows" @click.stop="addArea()">
                    <div>暂无</div>
                </div>
                <div class="head_hint" style="margin-top:1rem;">优势线路</div>
                <div v-if="circuitShow">
                    <div class="select_way" v-for="item in superCircuit" track-by="$index"> 
                        <div class="deleteCard" @click.stop="deleteGroup($index,item)">删除</div> 
                        <div class="car_way">
                            <span class="course">路线{{$index+1}}：</span>
                            <span class="course">{{item}}</span>
                        </div>
                    </div>
                </div>
                <div class="select_area_box" v-if="!circuitShow" @click.stop="addCircuit()">
                    <div>暂无</div>
                </div>
                <div style="width:100%;text-align:center;" class="accomplish_box" @click.stop="circuitFinish()">
                    <button class="accomplish">完成</button>
                </div> 
            </div>
            <!-- 右上角选择框 -->
            <div  v-show = "listShow" class="listPOP_box" style="width:40%;text-align:center;">
                <div class="list_pop">
                    <ul>
                        <li @click.stop="addArea()">添加优势区域</li>
                        <li @click.stop="addCircuit()">添加优势线路</li>
                    </ul>
                </div>
                <div class="jiantou"></div> 
            </div>
            <!-- 优势区域 -->
            <div>
                <div v-show = "arealist" class="areaPOP_box" :style = "{minHeight:matginTopH + 'px'}">
                    <div class="area_head">请选择优势区域</div>
                    <div class="area_content">
                        <div class="content_lump" :id="'area-'+$index" v-for="item in superAreas" @click.stop="selectRegion($index,item)">{{item}}</div>
                    </div>
                    <div class="area_footer_box">
                        <div class="footer_lump footer_cancel" @click.stop="cancelArea()">取消</div>
                        <div class="footer_lump" @click.stop="completeArea()">完成</div>
                    </div>
                </div>
            </div>                
            <!-- 优势线路 -->
            <div v-show = "circuitlist" class="areaPOP_box" :style = "{minHeight:matginTopH + 'px'}">
                <div class="area_head">请选择优势线路</div>
                <div class="circuit_content">
                    <div class="origin" @click.stop="selectOrigin()">{{theOrigin}}</div>
                    <div class="origin" @click.stop="selectDestination()">{{destination}}</div>
                    <div class="position_change">
                        <div class="position_top"></div>
                    </div>
                </div>
                <div class="area_footer_box">
                    <div class="footer_lump footer_cancel" @click.stop="cancelCircuit()">取消</div>
                    <div class="footer_lump" @click.stop="completeCircuit()">完成</div>
                </div>
            </div>
        </div>
	</div>
</template>
<script>
import Tokens from '../token'
import Addresses from '../address'
export default {
    data () {
        return{
            matginTopH:10000,//选择框的最小高度
            toke:'',//本地token的值
            pathWay:'',//路径的保存
            superAreas:["西北","华北","东北","西南","华中","华东","华南"],//优势区域所有的地区
            checkArea:[],//选中的优势区域
            temporaryList:[],//暂时保存的
            areaShows:false,//暂无显示状态
            listShow:false,//下弹框显示隐藏
            arealist:false,//优势区域块的显示隐藏
            areashow:false,//用于显示隐藏区域模块的选中状态

            circuitlist:false,//优势线路块的显示隐藏
            superCircuit:[],//优势线路所有的路线
            circuitShow:false,//暂无显示状态
            // superCircuit:[],
            theOrigin:"起始地(省市)",//起始地址
            destination:"目的地(省市)",//目的地址
        }
    },
    watch:{
        'checkArea':function(e){
            let self = this;
            if(e.length == 0){
                self.areaShows = false;
            }else{
                self.areaShows = true;
            }
        },
        'superCircuit':function(e){
            let self = this;
            if(e.length == 0){
               self.circuitShow = false; 
            }else{
                self.circuitShow = true;
                self.$nextTick(()=>{
                    setTimeout(function(){
                       self.$transfer.translationDel(".car_way");
                    },1000);
                });
            }
        }
    },
    methods:{
        go (link, param) {
            let self = this;
            self.$transfer.go(self, link, param)
        },
        back (link, param) {
            let self = this
            self.$transfer.back(self, link, param);
        },
        clickPage(){//点击页面区域页面  隐藏弹框
            let self = this;
            if(self.arealist || self.circuitlist){
                return; 
            }else{
                self.listShow = false;
                self.arealist = false;
                self.circuitlist = false;
                self.theOrigin = "起始地(省市)";
                self.destination = "目的地(省市)";
                Tokens.save("startAddress1",'')
                Tokens.save("startAddress2",'')
            }
                
        },
        backLast(){//返回上一个页面
            let self = this;
            let superCircuit = Tokens.fetch("superCircuitFinish");
            if(superCircuit.length == 0){
                self.$MessageBox.confirm('您的优势路线还未选好,你确定返回吗?'
                    ).then(action => {
                        $(".content_lump").removeClass("selcted");
                        Tokens.save("checkArea",'');//区域清空
                        Tokens.save("superCircuitList",'');//线路清空
                        Tokens.save("status",'');
                        self.back('/foundOrg')
                    }).catch(function(){  
                });
            }else{
                self.back('/foundOrg')  
            }
        },
        addSuper(){//点击添加按钮
            let self = this;
            if(self.arealist || self.circuitlist){
                self.listShow = false;
            }else{
                self.listShow = !self.listShow;
            } 
        },
        addArea(){//添加优势区域
            let self = this;
            self.listShow = false;
            self.temporaryList = [];
            if(self.checkArea.length>0){//优势区域已经存在  显示为选中状态
                for(let i=0;i<self.checkArea.length;i++){
                    let key = $.inArray(self.checkArea[i],self.superAreas);
                    if(key!= -1){
                        $("#area-"+key).addClass("selcted")
                    }
                }
                self.temporaryList = self.checkArea;
                self.arealist = true;
            }else{
                self.arealist = true;
            }
        },
        selectRegion(key,val){//点击区域选中
            let self = this;
            if($("#area-"+key).is('.selcted')){//当前点击的已经是选中状态
                $("#area-"+key).removeClass("selcted")
                self.temporaryList.splice($.inArray(val,self.temporaryList),1);
            }else{//当前点击的不是选中状态
                $("#area-"+key).addClass("selcted")
                self.temporaryList.push(val)
            }
        },
        cancelArea(){//区域取消点击选中
            let self = this;
            let checkArea = Tokens.fetch("checkArea");
            console.log(Tokens.fetch("checkAreaFinish"))
            console.log(checkArea)
            self.checkArea = checkArea;
            self.temporaryList = [];
            self.arealist = false;
            $("div").removeClass("selcted");
        },
        completeArea(){//区域完成选中
            let self = this;
            self.checkArea = self.temporaryList;
            $("div").removeClass("selcted");
            Tokens.save("checkArea",self.checkArea)
            self.arealist = false;
        },
        addCircuit(){//添加优势线路
            let self = this;
            self.listShow = false;
            self.circuitlist = true;
            Tokens.save("startAddress1",'');
            Tokens.save("startAddress2",'');
        },
        cancelCircuit(){//路线取消点击选中
            let self = this;
            self.theOrigin = "起始地(省市)";
            self.destination = "目的地(省市)";
            Tokens.save("startAddress1",'')
            Tokens.save("startAddress2",'')
            self.circuitlist = false;
        },
        completeCircuit(){//路线完成选中
            let self = this;
            let circuitList = Tokens.fetch('superCircuitList')
            if(self.theOrigin == "起始地(省市)"){
                self.$transfer.showToast(self, "请输入您的起始地",'center',1500);
                return;
            }else if(self.destination == "目的地(省市)"){
                self.$transfer.showToast(self, "请输入您的目的地",'center',1500);
                return;
            }else if(self.destination == self.theOrigin){
                self.$transfer.showToast(self, "您输入的起始地与目的地相同",'center',1500);
                return;
            }else{
                let origin = self.theOrigin.split(" ")[1]+"-"+self.destination.split(" ")[1];
                if(self.superCircuit && self.superCircuit.length>0){
                    for(let k=0;k<self.superCircuit.length;k++){
                        if(self.superCircuit[k] == origin){
                            self.$transfer.showToast(self, "优势线路已经存在",'center',1500);
                            self.circuitlist = false;
                            self.theOrigin = "起始地(省市)";
                            self.destination = "目的地(省市)";
                            return;
                        }else{
                            if(k == self.superCircuit.length-1){
                                self.superCircuit.push(origin)
                                Tokens.save('superCircuitList',self.superCircuit)
                                self.circuitlist = false;
                                self.theOrigin = "起始地(省市)";
                                self.destination = "目的地(省市)";
                                return; 
                            }
                        }
                    }
                }else{
                    self.superCircuit.push(origin)
                    Tokens.save('superCircuitList',self.superCircuit)
                    self.theOrigin = "起始地(省市)";
                    self.destination = "目的地(省市)";
                    self.circuitlist = false;
                }
            }
        },
        selectOrigin(){//选择起始地
            let self = this;
            Tokens.save("status",'起始地');
            let userAddress = Addresses.address('87');
            Tokens.save("userAddress",userAddress)
            console.log(userAddress)
            self.go('/address')
        },
        selectDestination(){//选择目的地
            let self = this;
            Tokens.save("status",'目的地');
            let userAddress = Addresses.address('87');
            Tokens.save("userAddress",userAddress)
            self.go('/address')
        },
        deleteGroup(key,val){
            let self = this;
            console.log(key)
            console.log(val)
            console.log(self.superCircuit)
            self.superCircuit.splice(key,1)
            Tokens.save('superCircuitList',self.superCircuit)
            let as = document.querySelectorAll('.car_way');
            Array.from(as).forEach(function(item,index){
                item.style.WebkitTransform = "translateX(" + 0 + "px)";
            })
        },
        circuitFinish(){//完成
            let self = this;
            if(self.checkArea.length == 0 && self.superCircuit.length == 0){
                self.$transfer.showToast(self, "优势区域或者优势线路至少选择一个",'center',1500);
                return;
            }else{
                Tokens.save("checkAreaFinish",self.checkArea)
                Tokens.save("superCircuitFinish",self.superCircuit)
                self.back('/foundOrg')
            }
        },
        // selectArea(){//点击选择的优势区域
        //     let self = this;
        //     self.listShow = false;
        //     self.temporaryList = [];
        //     if(self.checkArea.length>0){//优势区域已经存在  显示为选中状态
        //         for(let i=0;i<self.checkArea.length;i++){
        //             let key = $.inArray(self.checkArea[i],self.superAreas);
        //             if(key!= -1){
        //                 $("#area-"+key).addClass("selcted")
        //             }
        //         }
        //         self.temporaryList = self.checkArea;
        //         self.arealist = true;
        //     }else{
        //         self.arealist = true;
        //     }
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
            self.toke = Tokens.fetch("token");
            self.listShow = false;
            self.arealist = false;
            self.areashow = false;
            self.circuitlist = false;
            self.theOrigin = "起始地(省市)";
            self.destination = "目的地(省市)";
            self.temporaryList = [];
            self.checkArea = [];
            self.superCircuit = [];
            if(from.path){//判断进入路径
                Tokens.save('optimizePath',from.path);
                self.pathWay = from.path;
                if(self.pathWay.indexOf('address') == 1){
                    self.circuitlist = true;
                } 
            }else{
                self.pathWay = Tokens.fetch('optimizePath');
                if(self.pathWay.indexOf('address') == 1){
                    self.circuitlist = false;
                } 
            }
            if(self.pathWay.indexOf('address') == 1){
                let checkArea = Tokens.fetch("checkArea");
                let startAddress1 = Tokens.fetch("startAddress1");
                let startAddress2 = Tokens.fetch("startAddress2");
                let superCircuit = Tokens.fetch("superCircuitList")
                if(checkArea.length != 0){
                    self.checkArea = checkArea;
                    self.temporaryList = checkArea;
                }
                if(superCircuit.length != 0){
                    self.superCircuit = superCircuit;
                }
                if(Tokens.fetch("startAddress1").length == 0){
                    self.theOrigin = "起始地(省市)";
                }else{
                    self.theOrigin = Tokens.fetch("startAddress1");
                }
                if(Tokens.fetch("startAddress2").length == 0){
                    self.destination = "目的地(省市)";
                }else{
                    self.destination = Tokens.fetch("startAddress2");
                }
            }
            let checkArea = Tokens.fetch("checkAreaFinish");
            let superCircuit = Tokens.fetch("superCircuitFinish")
            if(checkArea.length != 0){
                self.checkArea = checkArea;
                // self.temporaryList = checkArea;
            }else{
                $(".content_lump").removeClass("selcted");
            }
            if(superCircuit.length != 0){
                self.superCircuit = superCircuit;

            }
            next()
        },
        canDeactivate({to, from, next}) {
            let self = this;

            next();
        },
        deactivate ({ next }) {
            //Triggers when component destroys
            next()
        },
    }
}
</script>
<style scoped>
    .head_hint{
        width:100%;height:1.5rem;
        line-height: 1.5rem;
        padding-left:.5rem;
        background-color: #ededed;
    }
    .accomplish_box{
        position: fixed;
        left:0;
        bottom:2rem;
    }
    .accomplish{
        width:70%;
        height:2.3rem;
        border:none;
        background-color: #3d3d3d;
        color:#FFD91E;
        border-radius: .2rem;
    }
    /*优势区域*/
    .select_area_box1{
        width: 100%;
        background-color: #fff;
        overflow: hidden;
        padding-top: .5rem;
    }
    .select_area_box{
        width: 100%;
        background-color: #fff;
        overflow: hidden;
        padding:1rem;
    }
    .select_area{
        float: left;
        width:20%;
        height:1.8rem;
        line-height: 1.8rem;
        text-align: center;
        border:1px solid #FFD91E;
        margin:0 1.5%;
        border-radius: 5px;
        margin-bottom: .5rem; 
    }
    .areaPOP_box{
        width:100%;
        position: fixed;
        top:2.2rem;
        right:0rem;
        background:rgba(0,0,0,0.5);
        word-wrap: break-word;
        break-word:break-all;
        overflow: hidden;
        /*z-index: 8000;*/
    }
    .area_head{
        width:100%;height:2rem;
        line-height: 2rem;
        /*text-align: center;*/
        background-color: #fff;
        padding-left:1.25rem;
    }
    .area_content,.area_footer{
        width:100%;
        overflow: hidden;
        background-color: #fff;
        padding: 1rem;
        padding-top:0; 
    }
    .area_content{padding-bottom:.5rem;}
    .area_footer{padding:0rem 1rem 1rem;}
    .area_footer_box{
        width:100%;
        overflow: hidden;
        background-color: #fff;
    }
    .footer_lump{
        float:left;
        width:50%;
        height:2.5rem;
        line-height: 2.5rem;
        text-align: center;
        border-top:1px solid #FFD91E;
        color:#FFD91E;
        font-size: .8rem;
    }
    .footer_cancel{
        border-right:1px solid #FFD91E;
    }
    .content_lump{
        float:left;
        width:30%;
        height:2rem;
        line-height: 2rem;
        text-align: center;
        border:1px solid #D5D5D5;
        color:#666;
        margin:0 1.5%;
        margin-bottom: .5rem;
        border-radius: 5px;
    }
    .area_footer,.circuit_footer{
        width:100%;
        overflow: hidden;
        background-color: #fff;

    }
    .circuit_footer{padding:.5rem 0;}
    .area_footer .cancel,.circuit_footer .cancel{
        margin-bottom: 0;
    }
    .area_footer .complete,.circuit_footer .complete{
        margin-bottom: 0;
        float:right;
    }
    .area_content .selcted{
        background-color: #F7ECCE;
        color:#000;
    }
    /*优势线路*/
    .select_way{
        width: 100%;
        height:2.2rem;
        line-height:2.15rem;
        background-color: #fff;
        font-size:0.8rem;
        border-bottom:1px solid #efefef;
        position: relative;
    }
    .course{float: left;margin-left: .5rem;}
    .circuit_content{
        width:100%;
        overflow: hidden;
        background-color: #fff;
        padding: 1rem;
        position: relative;
        padding-top:0;
    }
    .origin{
        width: 80%;
        height: 2.5rem;
        line-height: 2.5rem;
        text-align: center;
        margin:0 auto;
        background-color: #F7ECCE;
        border:1px solid #ECE09F;
        margin-bottom:.5rem;
        overflow: hidden;
    }
    .position_change{
        width:1rem;
        height:3rem;
        border:1px dotted #FFD91E;
        border-right: none;
        position: absolute;
        top:1.25rem;
        left:9%;
    }
    .position_top{
        /*width:0.5rem;height:0.5rem;*/
        /*background: #FFD91E;*/
        border:0.25rem solid #FFD91E;
        border-top-color:#fff;
        border-bottom-color:#fff;
        border-right: none;
        position: absolute;
        bottom:-0.25rem;right:0;
    }
    .car_way{
        width:100%;
        overflow: hidden;
        background-color: #fff;
        position: absolute;
        left:0;top:0;
        border-bottom:1px solid #efefef;
    }
    .deleteCard{
        color: #fff;
        background: #f00;
        position: absolute;
        top: 0.1rem;
        right: 1px;
        text-align: center;
        width: 100px;
        height:1.9rem;
        line-height: 1.9rem;
    }
</style>