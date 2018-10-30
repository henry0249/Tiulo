<template>
    <div class="page">
        <mt-header fixed :title="header">
            <mt-button icon="back" slot="left" @click="close_add()"></mt-button>           
            <mt-button class="save" slot="right" @click="ensure()">保存</mt-button>             
        </mt-header>
        <div class="container-top" id="place">
            <span class='prompt_font'>定位到的位置</span>
            <div class="seat">
                <span slot="icon" class="iconfont location" v-show="linkageShow" @click="Location()">&#xe700;</span>
                <span slot="icon" class="iconfont location" v-show="!linkageShow">&#xe700;</span>
                <div class="information" v-show="linkageShow">{{addRess}}</div>
                <div class="information" v-show="inceptShow">{{addTwoRess}}</div>
                <div class="information" v-show="purposeShow">{{addThreeRess}}</div>
            </div>
            <div class="address_box" id="add_select">
                <mt-picker id="pickshow" v-show="linkageShow" :slots="addressSlots" track-by="$index" @change="onAddressChange1" :visible-item-count="9"></mt-picker>
                <mt-picker id="pickshow" v-show="inceptShow" :slots="addressTwoCutSlots" track-by="$index" @change="onAddressChange2" :visible-item-count="9"></mt-picker>
                <mt-picker id="pickshow" v-show="purposeShow" :slots="addressTwoGoalSlots" track-by="$index" @change="onAddressChange3" :visible-item-count="9"></mt-picker>
            </div>
        </div>
    </div>
</template>
<script>
import Tokens from '../token'
import Addresses from '../address'
import { Picker } from 'mint-ui';
import { pid_pName, cid_cName , zid_zName , pid_cIds, cid_zIds , cid_pid , zid_cid } from '../assets/pcz'
export default {
    data () {
        return{
            //公共数据
            header:'',//标题
            pathWay:'',//进入页面路径
            countyId:'',//区域的Id
            cityId:'',//城市的Id
            provinceId:'',//省份的Id
            // 个人中心地址选择
            user_info:'',
            linkageShow:false,//个人中心-三级联动
            userAddress:{},//地址全部信息
            addRess:'',//地址
            province:'',//开始省份
            city:'',//开始城市
            county:'',//开始县区
            //起始地
            inceptShow:false,//优势线路-二级联动
            addTwoRess:'',//二级联动的地址
            // 目的地
            purposeShow:false,//优势线路-二级联动
            addThreeRess:'',//二级联动的地址
        }
    },
    created(){
        let self = this;
        self.userAddress = Tokens.fetch("userAddress");
        self.province = self.userAddress.province;
        self.city = self.userAddress.city;
        self.county = self.userAddress.county;
        self.addRess = self.userAddress.province +' '+ self.userAddress.city +' '+self.userAddress.county;
        self.addTwoRess = self.userAddress.province +' '+ self.userAddress.city;
        self.addThreeRess = self.userAddress.province +' '+ self.userAddress.city;
    },
    computed:{
        addressSlots:function(e){
            let self = this;
            let addressSlots = [
                {
                    flex: 1,
                    values: Object.values(self.userAddress.provinces),
                    className: 'slot1',
                    textAlign: 'center',
                    defaultIndex: self.userAddress.provinceNum
                }, {
                    flex: 1,
                    values: Object.values(self.userAddress.citys),
                    className: 'slot2',
                    textAlign: 'center',
                    defaultIndex: self.userAddress.cityNum
                }, {
                    flex: 1,
                    values: Object.values(self.userAddress.countyes),
                    className: 'slot3',
                    textAlign: 'center',
                    defaultIndex: self.userAddress.countyNum
                }
            ]
            return addressSlots
        },
        addressTwoCutSlots:function(e){
            let self = this;
            let addressSlots = [
                {
                    flex: 1,
                    values: Object.values(self.userAddress.provinces),
                    className: 'slot1',
                    textAlign: 'center',
                    defaultIndex: self.userAddress.provinceNum
                }, {
                    flex: 1,
                    values: Object.values(self.userAddress.citys),
                    className: 'slot2',
                    textAlign: 'center',
                    defaultIndex: self.userAddress.cityNum
                },
            ]
            return addressSlots
        },
        addressTwoGoalSlots:function(e){
            let self = this;
            let addressSlots = [
                {
                    flex: 1,
                    values: Object.values(self.userAddress.provinces),
                    className: 'slot1',
                    textAlign: 'center',
                    defaultIndex: self.userAddress.provinceNum
                }, {
                    flex: 1,
                    values: Object.values(self.userAddress.citys),
                    className: 'slot2',
                    textAlign: 'center',
                    defaultIndex: self.userAddress.cityNum
                },
            ]
            return addressSlots
        }
    },
    methods: {
        go (link, param) {
            let self = this;
            self.$transfer.go(self, link, param)
        },
        back (link, param) {
            let self = this
            self.$transfer.back(self, link, param);
        },
        close_add(){//返回
            let self = this;        
            self.city = '';
            self.county = '';
            self.province = '';
            self.lastcounty = '';
            // if(self.pathWay.indexOf('optimizeWay') == 1){
            //     let startAddress = Tokens.fetch("startAddress")
            //     if(startAddress != (self.header + '(省市区)')){
            //         console.log(111)
            //     }else{
            //         console.log(222)
            //     }
            //     // let header = self.header + '(省市区)'
            //     // Tokens.save("startAddress",header)
            // }
            self.back(self.pathWay)
        },
        ensure(){//地址确定选择按钮
            let self = this;
            if(self.pathWay.indexOf('optimizeWay') == 1){
                if(self.header == '起始地'){
                    Tokens.save("startAddress1",self.addTwoRess)
                }else if(self.header == '目的地'){
                    Tokens.save("startAddress2",self.addThreeRess)
                }
                self.back(self.pathWay)
            }else if(self.pathWay.indexOf('my_information') == 1){
                let myDate = new Date();
                let default_address = self.userAddress.province+' '+self.userAddress.city+' '+self.userAddress.county;
                if(default_address == self.addRess){
                    self.$transfer.showToast(self, "您的地址未发生改变");
                    return
                }else{
                    let ress = self.addRess.split(' ');
                    console.log(ress)
                    let s = {action:"/user/save"};
                    s.params = {"suId":Tokens.fetch('token').userId}
                    s.datasets = {dsData:{rows:[{rowId:Tokens.fetch('token').rowId,"state":'u',"suId":Tokens.fetch('token').userId,"suDistrictName":ress[2],"suProvinceName":ress[0],"suProvinceId":self.provinceId,"suDistrictId":self.countyId,"suModifyDate":myDate}]}};
                    doAjaxUpdate(s,function(data) {
                        if(data.status == 0){
                            self.$transfer.backLogin(self, data);
                        }else if(data.status == 1){
                            consoleShow(data)
                            self.user_info.suDistrictId = self.countyId;
                            let address;
                            if(self.lastcounty == ''){
                                address = Addresses.address(self.county);
                            }else{
                                address = Addresses.address(self.lastcounty);
                            }
                            self.$nextTick(()=>{
                                Tokens.save('userAddress',address)
                                console.log(address)
                                console.log(self.user_info)
                                Tokens.save("user_info",self.user_info)
                                // self.addRess = '';
                                self.lastcounty = '';
                                self.back('/my_information')
                            })  
                        }
                    })
                }
            }       
        },
        Location(){//定位
            let self = this;
            wx.getLocation({
                    type: 'wgs84', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
                    success: function (res) {
                        let latitude = res.latitude; // 纬度，浮点数，范围为90 ~ -90
                        let longitude = res.longitude; // 经度，浮点数，范围为180 ~ -180。
                        let speed = res.speed; // 速度，以米/每秒计
                        let accuracy = res.accuracy; // 位置精度
                    let url = "http://api.map.baidu.com/geocoder/v2/?callback=renderReverse&coordtype=wgs84ll  &location=30.305817,120.36627&output=json&pois=1&ak=QcXGQBp8w0KCEbXnducNTCvOkmYeTWd1";
                    $.ajax({
                        url : url,
                        type : 'get',
                        dataType : 'jsonp',
                        success: function(data){
                            if(data.status == 0){
                                let arr = data.result.addressComponent;
                                self.lastcounty = arr.district;
                                let address = Addresses.address(self.lastcounty)
                                self.addRess = address.province +' '+address.city +' '+address.county;
                                self.addTwoRess = address.province +' '+address.city;
                                for(let key in pid_pName){
                                    if(pid_pName[key] == address.province){
                                        self.provinceId = key;
                                    }
                                }
                                for(let bond in zid_zName){
                                    if(zid_zName[bond] == address.county){
                                        self.countyIds = bond;
                                    }
                                }
                            }
                        },
                        error: function(){
                            alert("请求失败");
                        }
                    });
                }
            });
        },
        changeCut(item,index){
            let self = this;
            self.lastcounty = '';
            let cid_CName = [];//市区数组
            let zid_ZName = [];//县城数组
            let zid_Zid = [];
            let cid_Cid = [];
            let pNum = Object.keys(pid_pName);//pid_pName中的键，一个数组
            let pName = Object.values(pid_pName);//pid_pName中的值，一个数组
            let cIdsNum = Object.keys(pid_cIds);//pid_cIds中的键，一个数组
            let cIds = Object.values(pid_cIds);//pid_cIds中的值，一个数组
            let cNum = Object.keys(cid_cName);//cid_cName中的键，一个数组

            let cName = Object.values(cid_cName);//cid_cName中的值，一个数组
            let zNum = Object.keys(zid_zName);//zid_zName中的键，一个数组
            let zName = Object.values(zid_zName);//zid_zName中的值，一个数组
            let zIdsNum = Object.keys(cid_zIds);//cid_zIds中的键，一个数组
            let zIds = Object.values(cid_zIds);//cid_zIds中的值，一个数组
            for(let p in pid_pName){
                if(pid_pName[p] == item.getValues()[0]){
                    self.provinceId = p;
                }
            }
            //由省转到市      
            for(let key = 0;key < pName.length; key++){
                if(pName[key] == item.getValues()[0]){//picker.getValues()[0]是当前选中的省份,pName是遍历pid_pName里面的值
                    for(let l = 0;l < cIdsNum.length; l++){
                        if(cIdsNum[l] == pNum[key]){//pNum[key]是当前位数的键
                            let cId = cIds[l].split(',');//把字符串转换为数组
                            cId.splice(cId.length-1,1)//删除最后一个空元素
                            for(let c = 0;c < cId.length; c++){
                                cid_CName.push(cid_cName[cId[c]]);
                                cid_Cid.push(cId[c])
                            }
                            item.setSlotValues(1, cid_CName);
                            for(let e in cid_CName){
                                if(cid_CName[e] == item.getValues()[1]){
                                    self.cityId = cid_Cid[e];
                                }
                            }
                        }
                    }
                }
            };
            //由市转到县
            for(let k = 0;k < cName.length; k++){
                if(cName[k] == item.getValues()[1]){
                    for(let e = 0;e < zIdsNum.length; e++){
                        if(zIdsNum[e] == cNum[k]){
                            let zId = zIds[e].split(',');
                            zId.pop();
                            for(let y = 0;y < zId.length; y++){
                                zid_ZName.push(zid_zName[zId[y]])
                                zid_Zid.push(zId[y])
                            }
                            item.setSlotValues(2, zid_ZName);
                            for(let a in zid_ZName){
                                if(zid_ZName[a] == item.getValues()[2]){
                                    self.countyId = zid_Zid[a];
                                }
                            }
                        }
                    }        
                }  
            }
        },
        onAddressChange1(picker, values) {
            let self = this;
            self.changeCut(picker, values)
            let province = picker.getValues()[0];
            let city = picker.getValues()[1];
            let county = picker.getValues()[2];
            self.changeAdd(province,city,county,self.countyId)
        },
        onAddressChange2(picker, values) {
            let self = this;
            self.changeCut(picker, values)
            let province = picker.getValues()[0];
            let city = picker.getValues()[1];
            self.changeAdd(province,city,'',self.cityId);
        },
        onAddressChange3(picker, values) {
            let self = this;
            self.changeCut(picker, values)
            let province = picker.getValues()[0];
            let city = picker.getValues()[1];
            self.changeAdd(province,city,'',self.cityId);
        },
        changeAdd(province,city,county,countyId){
            let self = this;
            self.city = city;
            self.county = county;
            self.province = province;
            self.countyId = countyId;
            if(self.header == "地区"){
                self.addRess = province+' '+city+' '+county;
            }else if(self.header == "起始地"){
                self.addTwoRess = province +' '+city;
            }else if(self.header == "目的地"){
                self.addThreeRess = province+' '+city;
            }
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
            if(from.path){//判断进入路径
                Tokens.save('addressPagePath',from.path);
                self.pathWay = from.path;
            }else{
                self.pathWay = Tokens.fetch('addressPagePath');
            }
            console.log(self.pathWay)
            if(self.pathWay.indexOf('optimizeWay') == 1){
                self.header = Tokens.fetch("status");
                self.linkageShow = false;
                self.inceptShow = false;
                self.purposeShow = false;
                console.log(self.header)
                if(self.header == "起始地"){
                    self.inceptShow = true;
                }else{
                    self.purposeShow = true;
                }
            }else if(self.pathWay.indexOf('my_information') == 1){
                self.header = "地区";
                self.linkageShow = true;
                self.inceptShow = false;
                self.purposeShow = false;
                self.user_info = Tokens.fetch("user_info");
            }
            next()
        },
        deactivate ({ next }) {
            //Triggers when component destroys
            next()
        },
    }
}
</script>
<style scoped>
    .save{
        color:#FFD91E;
        padding: 0;
    }
    /*地址*/
    .prompt_font{
        display: block;
        width:100%;
        height:2rem;line-height: 2rem;
        margin-top:.5rem;margin-left: .5rem;
    }
    .address_box{
        background-color: rgba(0,0,0,.2);
        margin-top: 2rem;
        border:1px solid #ccc;
        position: fixed;
        bottom:0;
        left:0;
        width:100%;
    } 
    .location{
        color:#FFD91E;
        float:left;
        height:2rem;
        line-height: 2rem;
        padding: 0 7%;
        width:20%;
    }
    .seat{
        overflow: hidden;
        background-color: #fff;
    }
    .information{
        float:left;
        width:80%;
        height:2rem;
        line-height:2rem;
        white-space:nowrap;
        text-overflow:ellipsis;
        overflow: hidden;
    }
</style>