<template>
    <div class="page" id="truckPage">
        <!-- Header -->
        <mt-header fixed title="车辆信息"> 
            <mt-button icon="back" slot="left" @click="back('/truckList')"></mt-button>
            <mt-button slot="right" @click="doTruck()">
                <span>保存</span>
            </mt-button>
        </mt-header>

        <div class="container-top"> 
            <ul class="tru_detail">   
                <li>
                    <span>司机姓名</span> 
                    <input v-model="trkDriverName" class="tru_sub noChange" type="text" placeholder="请输入姓名" maxlength='5'/>
                </li>
                <li>
                    <span>手机号</span> 
                    <input v-model="trkDriverMobile" class="tru_sub noChange" type="number" placeholder="请输入手机号" />
                </li>
                <li>
                    <span>车牌号</span> 
                    <div style="position: relative;padding-left:2rem">
                        <input v-model="carArea" class="tru_sub carAreaBox" type="text" placeholder="区域" />
                        <div style="padding:0;height:2.2rem" class="tru_sub carAreaBox" @click="chooseCarArea()"></div>
                        <input v-model="carCode" class="tru_sub" type="text" placeholder="车牌号后5位" maxlength="5" />
                    </div>
                    
                </li>
                <li>
                    <span>性别</span>
                    <div class="radioBox">
                        <div class="radioOne">
                            <div class="radioShow" :class="trkDriverSex == '男' ? 'radioCheck' : ''">
                                <input id="sexMan" type="radio" v-model="trkDriverSex" name="trkSex" value="男">
                            </div> 
                            <label class="radioText" for='sexMan'>男</label>
                        </div>
                        <div class="radioOne">
                            <div class="radioShow" :class="trkDriverSex == '女' ? 'radioCheck' : ''">
                                <input id="sexWoman" type="radio" v-model="trkDriverSex" name="trkSex" value="女">
                            </div>
                            <label class="radioText" for="sexWoman">女</label>
                        </div>
                    </div>            
                </li>
                <li>
                    <span>车辆所属</span>
                    <div class="radioBox">
                        <div class="radioOne">
                            <div class="radioShow" :class="trkAttrib == '自有' ? 'radioCheck' : ''">
                                <input id="ownHas" type="radio" v-model="trkAttrib" name="trkOwn" value="自有">
                            </div>
                            <label class="radioText" for="ownHas">自有</label>
                        </div>
                        <div class="radioOne">
                            <div class="radioShow" :class="trkAttrib == '非自有' ? 'radioCheck' : ''">
                                <input id="ownNoHas" type="radio" v-model="trkAttrib" name="trkOwn" value="非自有">
                            </div>
                            <label class="radioText" for="ownNoHas">非自有</label>
                        </div>
                        
                        
                    </div>
                </li>
                <li>
                    <span>车型</span> 
                    <select id="trkModelSel">
                        <option value="平板">平板</option>
                        <option value="箱体">箱体</option>
                        <option value="敞篷">敞篷</option>
                    </select>
                </li>
                <li style="border:none">
                    <span>车长 </span>
                    <select id="trkLengthSel">
                        <option value="2.5">2.5</option>
                        <option value="4.5">4.5</option>
                        <option value="6.8">6.8</option>
                        <option value="9">9</option>
                        <option value="9.6">9.6</option>
                        <option value="10">10</option>
                        <option value="12">12</option>
                        <option value="13">13</option>
                        <option value="13.5">13.5</option>
                        <option value="16">16</option>
                        <option value="17.5">17.5</option>
                    </select>米
                </li>
            </ul> 
            
        </div> 

        <!-- 选择区域 -->
        <mt-popup style="width:100%;" :visible.sync="areaShow" position="bottom">
            <mt-picker :slots="slots" @change="onChange" :visible-item-count="7"></mt-picker>
        </mt-popup>


        
    </div>
</template>

<script>
// Ajax request module, return a Promise
import Tokens from '../token'
import * as actions from '../vuex/actions'
import  Mysearch  from '../components/mysearch'  
export default {
    vuex: {
        actions: {
            addBList: actions.addBList,
            updateAllList: actions.updateAllList,
        }
    },
    components: {
        Mysearch
    },
    data () {
        return { 
            ttdriverId:'',
            sessionId:'',
            trkOrgId:'',
            truckDetailData:'',//详情页数据 
            trkDriverName:'',//姓名
            trkDriverId:'',//司机Id
            trkDriverMobile:'',//联系电话
            trkDriverSex:'*',//性别
            trkAttrib:'自有',//是否是自有
            trkCode:'',//车牌号
            trkLength:'',//车长
            trkType:'',//车型
            trkIndex:'',//如果是从详情过来的角标
            newOrupdate:'',//是执行新增还是修改
            carArea:'浙A',//车辆区域
            carCode:'',//后5位
            areaShow:false,
            slots: [
                    {
                      flex: 1,
                      // defaultIndex:10,
                      values: ['京','津','沪','渝','冀','晋','辽','吉','黑','苏','浙','皖','闽','赣','鲁','豫','鄂','湘','粤','琼','川','黔','云','陕','甘','青','藏','桂','蒙','宁','新' ],

                      textAlign: 'center'
                    }, {
                      flex: 1,
                      // defaultIndex:0,
                      values: ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'],
                      textAlign: 'center'
                    }
                  ]
        }       
    },
    watch:{
        "sexValue":function(val){
            alert(val)
        }
    },
    methods: {
        onChange(picker,values){
            let self = this;
            self.carArea = picker.getValues().join('');
        },
        chooseCarArea(){
            let self = this;
            self.areaShow = !self.areaShow;
        },
        go:function(link, param) {
            let self = this
            self.$transfer.go(self, link, param)
        },
        back:function(link, param) {
            let self = this
            self.$transfer.back(self, link, param);
        },
        doTruck(){//执行修改还是保存
            let self = this; 

            // let regTel = /(^(\d{3,4}-)?\d{7,8})$|^(0|86|17951)?(1[3|4|5|7|8]\d{9})$/;
            // let regPlate = /^[\u4e00-\u9fa5]{1}[A-Z]{1}[A-Z_0-9]{5}$/;

            if( self.carArea=="" || self.carCode==""){
                self.$transfer.showToast(self, "请填写车牌号");
                return
            }else{//执行新增及保存操作
                let rowId,truckState,trkModifyDate,trkId;
                if(self.newOrupdate == "new"){
                    rowId = parseInt(Math.random()*1000);
                    truckState = "i";
                    trkModifyDate = '';
                    trkId = "";
                }else if(self.newOrupdate == "update"){
                    rowId = self.truckDetailData.rowId;
                    truckState = "u";
                    trkModifyDate = self.truckDetailData.trkModifyDate;
                    trkId = self.truckDetailData.trkId;
                }
                let newTruck = {    trkOrgId:self.trkOrgId,
                                    trkDriverMobile:self.trkDriverMobile,
                                    trkDriverName:self.trkDriverName,
                                    trkDriverId:self.trkDriverId,
                                    trkLogo:self.trkLogo,
                                    trkCode:self.carArea + self.carCode,
                                    trkDriverSex:self.trkDriverSex,
                                    trkAttrib:self.trkAttrib,
                                    trkType:$("#trkModelSel").val(),
                                    trkLength:$("#trkLengthSel").val(),
                                    rowId:rowId,
                                    trkId:trkId,
                                    state:truckState,
                                    trkModifyDate:trkModifyDate
                                }

                let s = {   action:"/truck/save",
                            commandType:"Update",
                            rowId:rowId
                        };
                s.datasets = {dsData:{rows:[newTruck]}} ;
                self.$Indicator.open();
                doAjaxUpdate(s,function(data) {
                    if(data.status == 0){
                        self.$transfer.backLogin(self, data);
                    }else if(data.status == 1){
                        let obj = data.datasets.dsData.rows[0];      
                        if(self.newOrupdate == "new"){
                            newTruck.trkLogo = getImgURL() +'user/' +self.trkLogo;
                            newTruck.trkId = obj.trkId;
                            newTruck.trkModifyDate = obj.trkModifyDate;
                            Tokens.save("truckListContainer",0);
                            Tokens.save("isAddTruck",'YES');
                            self.addBList("truckList",[newTruck]);
                        }else if(self.newOrupdate == "update"){
                            newTruck.trkModifyDate = obj.trkModifyDate;
                            self.updateAllList("truckList",self.trkIndex,[newTruck]);
                        }
                        self.$Indicator.close();
                        self.$transfer.showToast(self, "保存成功！");
                        self.back("/truckList")

                    }
                    
                   
                }); 
                
            }            


        }
    },
    route: {
        data ({ to, next }) {
            let self = this;
            //进入页面时token不存在
            if(!localStorage.getItem("token")){
                self.$transfer.backLogin(self, {info:'token没有值'});
                return;
            }
            let token = Tokens.fetch("token");
            self.ttdriverId = token["userId"];
            self.sessionId = token["sessionId"];
            self.trkOrgId = token["orgId"];
            self.subSystem = token["subSystem"];
            let truckDetailData = Tokens.fetch("truckDetailData");
            self.truckDetailData = truckDetailData;
            self.areaShow = false;
            Tokens.save("isAddTruck",'');
            //如果是司机版同，司机姓名和电话不可改
            if(self.truckDetailData){//如果是查看详情
                self.trkDriverName = truckDetailData.trkDriverName;//姓名
                self.trkDriverMobile = truckDetailData.trkDriverMobile;//联系电话
                self.trkDriverId = truckDetailData.trkDriverId;//司机Id 
                self.trkCode = truckDetailData.trkCode;//车牌号
                self.trkDriverSex = truckDetailData.trkDriverSex;//性别
                self.trkAttrib = truckDetailData.trkAttrib;//是否自有
                self.trkLogo = truckDetailData.trkLogo;//车主头像
                self.carArea = self.trkCode.substring(0,2);
                self.carCode = self.trkCode.substring(2,7);
                self.$nextTick(()=>{
                    $("#trkModelSel").val(truckDetailData.trkType);
                    $("#trkLengthSel").val(truckDetailData.trkLength);
                });
                self.trkIndex = truckDetailData.trkIndex;
                self.newOrupdate = "update";
            }else{//是新增车辆
                self.trkDriverMobile = token["userMobile"];
                self.trkDriverName = token["userName"];
                self.trkDriverId = token["userId"];
                self.trkLogo = token["userLogo"];
                self.trkCode = '';
                self.carArea = '浙A';
                self.carCode = '';
                self.trkDriverSex = '*';
                self.trkAttrib = '自有';
                self.$nextTick(()=>{
                    $("#trkModelSel").val("平板");
                    $("#trkLengthSel").val("2.5");
                });
                self.trkIndex = '';
                self.newOrupdate = "new";
            }
            self.$nextTick(()=>{
                if(self.subSystem == 'SJ'){
                    $(".noChange").attr("disabled",true);
                }
            });

            next()
        },
        deactivate ({ next }) {
            next()
        },
        canDeactivate({to, from, next}) {
            let self = this;
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
.tru_detail{
    /*padding:0.5rem;*/
    background:#fff;
    padding:0 0.5rem;
    border-top:1px solid #d9d9d9;
    border-bottom:1px solid #d9d9d9;
}
.tru_detail li{
    position: relative;
    padding-left:4rem;
    overflow: hidden;
    border-bottom:1px solid #d9d9d9;
    min-height: 2.2rem;
}
.tru_detail li span{
    position: absolute;
    display: inline-block;  
    top:0.6rem;
    left:0;
}
.tru_detail .tru_sub{
    width:100%;
    display: inline-block;
    word-wrap: break-word;
    padding:0.6rem 0;
    height:1rem;
    line-height: 1rem;
} 
.tru_detail .tru_sub:disabled{
    background: #fff;
}
.tru_detail .carAreaBox{
    width:2rem;position: absolute;left:0;top:0
}
.radioBox{
    /*padding:0.5rem 0;*/
    height:2.2rem;
}
.radioOne{
    display: inline-block;
    margin-right:1rem;
    height:2.2rem;
}
.radioOne>div{
    display: inline-block;
}
.radioShow{
    width:0.9rem;
    height:0.9rem;
    border-radius: 0.45rem;
    border:1px solid #aaa;
    vertical-align: top;
    margin-top: 0.6rem;
}
.radioShow input{
    opacity: 0;
    width:100%;
    height:100%;
    margin:0;
}
.radioText{
    display: inline-block;
    height:2.2rem;
    line-height: 2.2rem;
    padding:0 0.2rem;
}
.radioCheck{
    background: #FFD91E;
}
#trkModelSel,#trkLengthSel{
    height:1.6rem;  
    line-height: 1.6rem;
    margin-top:0.3rem;
    margin-right:0.5rem;
    border:1px solid #ccc;
    border-radius: 0.3rem;
    padding:0 0.5rem;
}
</style>

