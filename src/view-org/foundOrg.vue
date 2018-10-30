<template>
	<div class="page" id="foundOrg">
		<mt-header fixed title="创建机构">
            <mt-button icon="back" slot="left" @click="backLast()"></mt-button>
        </mt-header>
        <div class="container-top" id="foundOrgPage">
            <div id="foundOrgHead">
                <div class="head_hint">*为必填/选项</div>
                <mt-cell title="*机构/组织名称">
                    <span class="ipt_name">
                        <input type="input" v-model="bdName" placeholder="填写机构/组织名称">
                    </span>
                </mt-cell>
                <mt-cell title="*所在地区" @click.stop="select_add()">
                    <span class="add_style">{{address}}</span>
                    <span class="iconfont fr rt_arrow" style="margin-left:.5rem;">&#xe645;</span>
                </mt-cell>
                <mt-cell title="*联系方式">
                    <span class="ipt_name">
                        <input type="input" v-model="contactTel" placeholder="请输入手机号码">
                    </span>
                </mt-cell>
            </div>
            <div class="head_hint"></div>
            <!-- index TP or OSP -->
            <div v-if="version == 'TP' || version == 'OSP'" id="selectType">
                <mt-cell title="*运力类型" @click.stop="select_ability()" v-show="capacity">
                    <span>{{abilityType}}</span>
                    <span class="iconfont fr rt_arrow" style="margin-left:.5rem;">&#xe645;</span>
                </mt-cell>
                <mt-cell title="*服务对象" @click.stop="select_serve()">
                    <span>{{serveObj}}</span>
                    <span class="iconfont fr rt_arrow" style="margin-left:.5rem;">&#xe645;</span>
                </mt-cell>
                <mt-cell title="*优势线路" @click.stop="optimize_way()">
                    <span>{{optimizeList}}</span>
                    <span class="iconfont fr rt_arrow" style="margin-left:.5rem;">&#xe645;</span>
                </mt-cell>
                <mt-cell title="&nbsp;&nbsp;添加成员" @click.stop="addFriend()">
                    <!-- <span>{{addFriends}}</span> -->
                    <span class="iconfont fr rt_arrow" style="margin-left:.5rem;">&#xe645;</span>
                </mt-cell>
            </div>
            <!-- index EP or BSP -->
            <div v-if="version == 'EP' || version == 'BSP'" id="selectType">
                <mt-cell title="*所在行业" @click.stop="select_industry()" v-show="enterprise">
                    <span>{{industryType}}</span>
                    <span class="iconfont fr rt_arrow" style="margin-left:.5rem;">&#xe645;</span>
                </mt-cell>
                <mt-cell title="*货物类型" @click.stop="select_cargo()">
                    <span>{{cargoType}}</span>
                    <span class="iconfont fr rt_arrow" style="margin-left:.5rem;">&#xe645;</span>
                </mt-cell>
                <mt-cell title="*发货地" @click.stop="select_dispatch_place()">
                    <span>{{dispatchPlace}}</span>
                    <span class="iconfont fr rt_arrow" style="margin-left:.5rem;">&#xe645;</span>
                </mt-cell>
                <mt-cell title="&nbsp;&nbsp;添加成员" @click.stop="addFriend()">
                    <!-- <span>{{addFriends}}</span> -->
                    <span class="iconfont fr rt_arrow" style="margin-left:.5rem;">&#xe645;</span>
                </mt-cell>
            </div>
            <div style="width:100%;text-align:center;">
                <button class="next_step" @click.stop="nextStep()">下一步</button>
            </div>
            <!-- 地址 -->
            <mt-popup position="bottom" class="head_portrait" :visible.sync="selectAddress" :modal="true" popup-transition="popup-slide" id="cargo_type">
                <mt-header fixed>
                    <button slot="left" class="cancel" @click.stop="cancel()">取消</button>
                    <button slot="right" class="confirm" @click.stop="confirm()">确定</button>
                </mt-header>
                <div class="container-top">
                    <div class="cargo_content" style="background:#fff;">
                        <mt-picker id="pickshow" :slots="addressSlots" track-by="$index" @change="onAddressChange" :visible-item-count="7" v-if="threeLevel"></mt-picker>
                        <mt-picker id="pickshow" :slots="citySlots" track-by="$index" @change="onCityChange" :visible-item-count="7" v-if="!threeLevel"></mt-picker>
                    </div>
                </div>
            </mt-popup>
            <!-- 所在行业 -->
            <mt-popup position="bottom" class="head_portrait" :visible.sync="selectGuild" :modal="true" popup-transition="popup-slide" id="cargo_type">
                <mt-header fixed>
                    <button slot="left" class="cancel" @click.stop="cancel()">取消</button>
                    <button slot="right" class="confirm" @click.stop="confirm()">确定</button>
                </mt-header>
                <div class="container-top">
                    <div class="cargo_content" style="background:#fff;">
                        <mt-picker :slots="guildSlot" @change="onGuildChange" :visible-item-count="7"></mt-picker>
                    </div>
                </div>
            </mt-popup>
        </div>
        <!-- 货物类型 -->
        <mt-popup position="bottom" class="cargo_box" :visible.sync="checkCargo" :modal="true" popup-transition="popup-slide" id="cargo_type">
            <mt-header fixed>
                <button slot="left" class="cancel" @click.stop="cancel()">取消</button>
                <button slot="right" class="confirm" @click.stop="confirm()">确定</button>
            </mt-header>
            <div class="container-top">
                <div class="cargo_content" style="background:#fff;">
                    <div v-for="item in cargoes" :id="'cargo'+'-'+$index" class="cargo" @click.stop="selectCargoType($index,item)" :class="{selcted:item.status == 1?true:false}">
                        <span>{{item.name}}</span>
                    </div>
                </div>
            </div>
        </mt-popup>
	</div>
</template>
<script>
import Tokens from '../token'
import Addresses from '../address'
import { pid_pName, cid_cName , zid_zName , pid_cIds, cid_zIds , cid_pid , zid_cid } from '../assets/pcz'
import myMoreSelect from '../components/mymoreselect'
import { MessageBox } from 'mint-ui';
export default {
	data () {
        var addre = Addresses.address(Tokens.fetch('companyAddress')) || Addresses.address('1193')
        return{
            // 公共属性
            toke:'',//本地token的值
            version:'',//当前是哪个版本
            capacity:false,//运力版的显示隐藏(TP/OSP)
            enterprise:false,//企业版的显示隐藏(TP/OSP)
            pathWay:'',//路径的保存
            registerObj:{},
            bdName:'',//企业名称
            address:'浙江省 杭州市 西湖区',//显示的地址
            contactTel:'',//手机号码
            enterStatus:0,//进入的状态路径
            // 所在地址
            userAddress:addre,
            selectAddress: false,//地址popup是否显示
            countyIds:'1193',//3区域的Id
            province:'',
            city:'',
            county:'',
            threeLevel:true,//三级联动
            // TP || OSP
            // 运力类型
            abilityType:'请选择',//运力类型
            // 服务对象
            serveObj:'请选择',//服务对象
            // 优势线路
            optimizeArea:[],//优化区域
            optimizeWay:[],//优化线路
            optimizeList:"",//优势区域选择
            // 添加成员
            addFriends:[],//添加的好友
            // EP || BSP
            //所在行业
            industryType:'请选择',//所在行业
            selectGuild:false,//行业popup是否显示
            guildSlot: [{
                flex: 1,
                values: ["通信设备/电子产品/仪器仪表","原材料(橡胶类、能源类等)","机械/设备/重工","汽车及零配件","化工类","医药/医用设备","印刷/包装/造纸","建材/装饰材料","家具/家电","服装/纺织/皮革","玩具/礼品","快速消费品(食品、饮料、日化等)","农副产品","自定义"],
                className: 'slot1',
            }],
            //货物类型
            cargoType:'请选择',//货物类型
            checkCargo:false,//货物pop是否显示
            cargoes:[{name:"重货",status:0},{name:"抛货",status:0},{name:"重抛货",status:0},{name:"自定义",status:0}],
            commodity:[],//暂时保存选中的货物类型
            // 发货地
            dispatchPlace:'请选择',//发货地
        }
    },
    computed:{
        addressSlots:function(e){//地址三级联动显示的数据
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
        citySlots:function(e){//地址二级联动显示的数据
            let self = this;
            let citySlots = [
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
            return citySlots
        },
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
        backLast(){//返回上一个页面
        	let self = this;
            self.industryType = '请选择';
            self.cargoes = [];
            self.commodity = [];
            self.back('/selectRole')
        },
        // 所在地址
        select_add(){//选择所在地址
            let self = this;
            self.status = 1;
            self.selectAddress = true;
            self.threeLevel = true;
        },
        onAddressChange(picker, values) {//地址切换效果
            let self = this;
            let cid_CName = [];//市区数组
            let zid_ZName = [];//县城数组
            let zid_Zid = [];
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
            //由省转到市      
            for(let key = 0;key < pName.length; key++){
                if(pName[key] == picker.getValues()[0]){//picker.getValues()[0]是当前选中的省份,pName是遍历pid_pName里面的值
                    for(let l = 0;l < cIdsNum.length; l++){
                        if(cIdsNum[l] == pNum[key]){//pNum[key]是当前位数的键
                            let cId = cIds[l].split(',');//把字符串转换为数组
                            cId.splice(cId.length-1,1)//删除最后一个空元素
                            for(let c = 0;c < cId.length; c++){
                                cid_CName.push(cid_cName[cId[c]])
                            }
                            picker.setSlotValues(1, cid_CName);
                        }
                    }
                }
            };
            //由市转到县
            for(let k = 0;k < cName.length; k++){
                if(cName[k] == picker.getValues()[1]){
                    for(let e = 0;e < zIdsNum.length; e++){
                        if(zIdsNum[e] == cNum[k]){
                            let zId = zIds[e].split(',');
                            zId.pop();
                            for(let y = 0;y < zId.length; y++){
                                zid_ZName.push(zid_zName[zId[y]])
                                zid_Zid.push(zId[y])
                            }
                            picker.setSlotValues(2, zid_ZName);
                            for(let a in zid_ZName){
                                if(zid_ZName[a] == picker.getValues()[2]){
                                    self.countyIds = zid_Zid[a];
                                }
                            }
                        }
                    }        
                }  
            }
            let province = picker.getValues()[0];
            let city = picker.getValues()[1];
            let county = picker.getValues()[2];
            self.changeAdd(province,city,county,self.countyIds)
            for(let c in pid_pName){
                if(pid_pName[c] == province){
                    self.provinceId = c;
                }
            }
        },
        changeAdd(province,city,county,countyId){
            let self = this;
            self.city = city;
            self.county = county;
            self.province = province;
            self.countyIds = countyId;
            self.address = province+' '+city+' '+county;
        },
        // 运力类型
        select_ability(){//选择运力类型
            let self = this;
            let capacity = {
                name:"YL",
                values:self.abilityType
            }
            Tokens.save("moreSelectType",capacity)
            self.go('/moreselect')
        },
        //所在行业
        select_industry(){//所在行业
            let self = this;
            self.status = 2;
            self.selectGuild = true;
        },
        onGuildChange(picker, values) {//所在行业切换
            let self = this;
            self.industryType = values[0];
        },
        //货物类型
        select_cargo(){//货物类型
            let self = this;
            self.status = 3;
            self.checkCargo = true;
        },
        selectCargoType(key,val){//选择货物类型
            let self = this;
            if(val.name == "自定义"){
                MessageBox.prompt(' ','自定义货物类型').then(({ value, action }) => {
                    if(value == ""){
                        self.$transfer.showToast(self, "货物类型不能添加空值", "center", 1500);
                        return;
                    }else{
                        for(let key=0;key<self.cargoes.length;key++){
                            if(self.cargoes[key].name == value){
                                self.$transfer.showToast(self, "货物类型不能重复", "center", 1500);
                                return;
                            }
                        }
                        let obj = {name:value,status:1}
                        let obj2;
                        self.cargoes.push(obj)
                        for(let k=0;k<self.cargoes.length;k++){
                            if(self.cargoes[k].name == "自定义"){
                                obj2 = self.cargoes[k];
                                self.cargoes.splice(k,1)
                            }
                        }
                        self.cargoes.push(obj2)
                        self.commodity.push(obj)
                        Tokens.save('carGoesList',self.cargoes)
                    } 
                });
            }else{
                if($("#cargo"+'-'+key).is('.selcted')){
                    val.status = 0;
                    self.commodity.splice($.inArray(val,self.commodity),1);
                }else{
                    val.status = 1;
                    self.commodity.push(val)
                }
            }
        },
        // 发货地
        select_dispatch_place(){//发货地
            let self = this;
            self.status = 4;
            self.selectAddress = true;
            self.threeLevel = false;
        },
        onCityChange(picker, values) {//地址切换效果
            let self = this;
            let cid_CName = [];//市区数组
            let zid_ZName = [];//县城数组
            let zid_Zid = [];
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
            //由省转到市      
            for(let key = 0;key < pName.length; key++){
                if(pName[key] == picker.getValues()[0]){//picker.getValues()[0]是当前选中的省份,pName是遍历pid_pName里面的值
                    for(let l = 0;l < cIdsNum.length; l++){
                        if(cIdsNum[l] == pNum[key]){//pNum[key]是当前位数的键
                            let cId = cIds[l].split(',');//把字符串转换为数组
                            cId.splice(cId.length-1,1)//删除最后一个空元素
                            for(let c = 0;c < cId.length; c++){
                                cid_CName.push(cid_cName[cId[c]])
                            }
                            picker.setSlotValues(1, cid_CName);
                        }
                    }
                }
            };
            let province = picker.getValues()[0];
            let city = picker.getValues()[1];
            self.dispatchPlace = province+' '+city;
        },
        //服务类型
        select_serve(){//选择服务对象
            let self = this;
            let capacity = {
                name:"FW",
                values:self.serveObj
            }
            Tokens.save("moreSelectType",capacity)
            self.go('/moreselect')
        },
        // 优势线路
        optimize_way(){//优化路线
            let self = this;
            self.go("/optimizeWay");
        },
        // 添加好友
        addFriend(){
            let self = this;
            self.go('/addfriends')
        },

        // pop框取消与确定
        cancel(){//取消框
            let self = this;
            if(self.status == 1){
                self.selectAddress = false;
            }else if(self.status == 2){
                self.selectGuild = false;
            }else if(self.status == 3){
                self.checkCargo = false;
            }else if(self.status == 4){
                self.selectAddress = false;
            }
        },
        confirm(){//确定框
            let self = this;
            if(self.status == 1){
                self.selectAddress = false;
            }else if(self.status == 2){
                self.selectGuild = false;
                setTimeout(function(){
                    if(self.industryType == "请选择"){
                        self.industryType = self.guildSlot[0].values[0];
                    }else if(self.industryType == "自定义"){
                        MessageBox.prompt(' ','自定义服务对象').then(({ value, action }) => {
                            if(value == ""){
                                self.$transfer.showToast(self, "服务对象不能为空", "center", 1500);
                                return;
                            }else{
                                self.industryType = value;
                                self.guildSlot[0].values.push(value)
                                for(let key in self.guildSlot[0].values){
                                    if(self.guildSlot[0].values[key] == "自定义"){
                                        self.guildSlot[0].values.splice(key,1)
                                    }
                                }
                                self.guildSlot[0].values.push("自定义")
                            }
                                
                        }).catch(function(){//取消

                        });
                    }
                },200);
            }else if(self.status == 3){
                let arr = [];
                if(self.commodity && self.commodity.length>0){
                    for(let k=0;k<self.commodity.length;k++){
                        arr.push(self.commodity[k].name)
                    }
                    self.cargoType = arr.join(',');
                }
                self.checkCargo = false;
            }else if(self.status == 4){
                if(self.dispatchPlace == "请选择"){
                    self.dispatchPlace = self.userAddress.province +' '+self.userAddress.city;
                }
                self.selectAddress = false;
            }
        },
        nextStep(){//下一步
            let self = this;
            let pitchup = Tokens.fetch("optForFriendsList");
            console.log(self.toke)
            let rows = [];
            let obj = {};
            for(let key in zid_zName){
                if(zid_zName[key] == self.county){
                    self.countyIds = key;
                }
            }
            let reg = /^(13[0-9]|14[0-9]|15[0-9]|18[0-9])\d{8}$/i;
            if(self.bdName == ""){
                self.$transfer.showToast(self, "请输入机构名称", "center", 1500);
                return;
            }else if(self.contactTel == ""){
                self.$transfer.showToast(self, "请输入手机号码", "center", 1500);
                return;
            }else if(!reg.test(self.contactTel)){
                self.$transfer.showToast(self, "您输入的手机号码格式不正确",1500);
                return;
            }
            // 版本号判断
            if(self.version == 'TP' || self.version == 'OSP'){
                if(self.version == 'TP'){
                    if(self.abilityType == "请选择"){
                        self.$transfer.showToast(self, "请选择运力类型", "center", 1500);
                        return;
                    }
                }
                if(self.serveObj == "请选择"){
                    self.$transfer.showToast(self, "请选择服务对象", "center", 1500);
                    return;
                }else if(self.optimizeArea.length == 0 && self.optimizeWay.length == 0){
                    self.$transfer.showToast(self, "优势区域或者优势线路至少选择一个", "center", 1500);
                    return;
                }else{
                    let row = [{
                        bdContactMobile:self.contactTel,
                        bdName:self.bdName,
                        bdDistrictId:self.countyIds,
                        bdStr02:self.optimizeWay,
                        bdStr04:self.optimizeArea,
                        bdType3:self.abilityType,
                        bdType4:self.serveObj,
                    }];
                    if(pitchup && pitchup.length>0){
                        for(let k=0;k<pitchup.length;k++){
                            let obj = {};
                            obj.suoSubSystem = self.version;
                            obj.state = 'i';
                            obj.suoUserId = pitchup[k].suId;
                            obj.rowId = pitchup[k].rowId;
                            rows.push(obj)
                        }
                        Tokens.save("foundOrgFriendArray",rows)
                    }
                    Tokens.save("foundOrgArrayData",row)
                    self.go('/perfectInformation')
                    console.log(row)
                }
            }else if(self.version == 'EP' || self.version == 'BSP'){
                if(self.version == 'EP'){
                    if(self.industryType == "请选择"){
                        self.$transfer.showToast(self, "请选择所在行业", "center", 1500);
                        return;
                    }
                }
                if(self.cargoType == "请选择"){
                    self.$transfer.showToast(self, "请选择货物类型", "center", 1500);
                    return;
                }else if(self.dispatchPlace == "请选择"){
                    self.$transfer.showToast(self, "请选择发货地", "center", 1500);
                    return;
                }else{
                    if(self.industryType == "请选择"){
                        self.industryType = "";
                    }
                    let row = [{
                        bdName:self.bdName,//名字
                        bdContactMobile:self.contactTel,//手机号
                        bdDistrictId:self.countyIds,//地址
                        bdStr01:self.dispatchPlace,//发货地
                        bdType2:self.cargoType,//货物类型
                        bdIndustry:self.industryType,//所在行业
                    }];
                    if(pitchup && pitchup.length>0){
                        for(let k=0;k<pitchup.length;k++){
                            let obj = {};
                            obj.suoSubSystem = self.version;
                            obj.state = 'i';
                            obj.suoUserId = pitchup[k].suId;
                            obj.rowId = pitchup[k].rowId;
                            rows.push(obj)
                        }
                        Tokens.save("foundOrgFriendArray",rows)
                    }
                    Tokens.save("foundOrgArrayData",row)
                    self.go('/perfectInformation')
                    console.log(row)
                }
            }
        },
        dataList(){//清空数据
            let self = this;
            // YL、FW、YS
            Tokens.save("moreSelectType",'');
            // 运力类型数据清空
            self.abilityType = '请选择';
            Tokens.save("selectCapacityType",'')
            Tokens.save("capacityTypeData",'')
            // 服务对象数据清空
            self.serveObj = '请选择';
            Tokens.save("selectServesType","")
            Tokens.save("servesTypeData",'')
            // 区域与地址
            Tokens.save("checkArea",'');
            Tokens.save("checkAreaFinish",'');//区域清空
            Tokens.save("superCircuitFinish",'');//线路清空
            Tokens.save('superCircuitList','');
            // 成员清空
            Tokens.save("pitchUpFriendsList",'');
            Tokens.save("optForFriendsList",'');
            //运输需求
            // Tokens.save("moreSelectType",'')
            // 车辆类型
            Tokens.save('carTypeData','')
            //货物类型
            Tokens.save('carGoesList','')
            self.cargoType = '请选择';
            self.commodity = [];
            //所在行业
            self.industryType = '请选择';
            //发货地
            self.dispatchPlace = '请选择';
        }
    },
    route: {
        data ({ from, to, next }) {
            let self = this;
            //进入页面时token不存在
            if(!localStorage.getItem("token")){
                self.$transfer.backLogin(self, {info:'token没有值'});
                return;
            }
            self.toke = Tokens.fetch("token");//本地token
            self.version = Tokens.fetch("bdSubSystem2");//当前版本号
            // self.addFriends = Tokens.fetch("pitchUpFriendsList");//通讯录列表
            if(from.path){//判断进入路径
                Tokens.save('registerOrgPath',from.path);
                self.pathWay = from.path;
            }else{
                self.pathWay = Tokens.fetch('registerOrgPath');
                self.dataList();
            }
            // 版本号判断
            if(self.version == 'TP'){
                self.capacity = true;
            }else if(self.version == 'OSP'){
                self.capacity = false;
            }else if(self.version == 'EP'){
                self.enterprise = true;
            }else if(self.version == 'BSP'){
                self.enterprise = false;
            }
            if(self.pathWay.indexOf('selectRole') == 1){//从选择版本页面进入
                self.dataList();
                self.cargoType = '请选择';
                self.bdName = '';
                self.contactTel = '';
                self.cargoes = [{name:"重货",status:0},{name:"抛货",status:0},{name:"重抛货",status:0},{name:"自定义",status:0}];
            }else if(self.pathWay.indexOf('moreselect') == 1){
                let types = Tokens.fetch("moreSelectType");
                if(types.name == 'YL'){
                    let ability = Tokens.fetch("selectCapacityType");
                    self.abilityType = '';
                    if(ability == '请选择' || ability.length == 0){
                        self.abilityType = '请选择';
                    }else{
                        let arr = [];
                        for(let key=0;key<ability.length;key++){
                            arr.push(ability[key].name)
                        }
                        self.abilityType = arr.join(',');
                    }
                }else if(types.name == "FW"){
                    let serve = Tokens.fetch("selectServesType");
                    self.serveObj = '';
                    if(serve == '请选择' || serve.length == 0){
                        self.serveObj = '请选择';
                    }else{
                        let arr = [];
                        for(let key in serve){
                            arr.push(serve[key].name);
                        }
                        self.serveObj = arr.join(',');
                    }
                }   
            }else if(self.pathWay.indexOf('optimizeWay') == 1){
                self.optimizeArea = Tokens.fetch("checkAreaFinish");
                console.log(self.optimizeArea)
                let optimizeWay = Tokens.fetch("superCircuitFinish");
                self.optimizeWay = [];
                self.optimizeList = "";
                for(let key=0;key<optimizeWay.length;key++){
                    let obj = {name:optimizeWay[key]};
                    self.optimizeWay.push(obj)
                }
                if(self.optimizeArea.length != 0){
                    self.optimizeList = self.optimizeArea.join(',');
                }else if(self.optimizeArea.length == 0 && optimizeWay.length != 0){
                    self.optimizeList = self.optimizeWay[0].name;
                }else{
                    self.optimizeList = "";
                }
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
    .mint-popup{
        width: 100%;height: 100%; background: #f1f1f1;z-index: 2;
    }
    /*.v-model{
        background-color: rgba(255,255,255,0);
    }*/
    .cargo_box{
        height:50%;
    }
    .cargo_content{
        width:100%;
        height: 100%;
        overflow: scroll;
    }
    .head_hint{
        width:100%;height:1.5rem;
        line-height: 1.5rem;
        padding-left:.5rem;
        background-color: #ededed;
    }
    .ipt_name{
        display: inline-block;
    }
    .ipt_name input{
        padding:0.6rem 0;
    }
    .add_style{
        display: inline-block;
        width:80%;
        color:#333;
        white-space:nowrap; 
        overflow:hidden; 
        text-overflow:ellipsis;
    }
    .next_step{
        margin-top:2rem;
       /* position: fixed;
        bottom:2rem;
        left:15%;*/
        width:70%;
        height:2.3rem;
        border:none;
        font-size:0.7rem;
        background-color: #3d3d3d;
        color:#FFD91E;
        border-radius: .2rem;
    }
    .head_portrait{
        width:100%;
        max-height:44%;
        background: rgba(255,255,255,0);
        overflow: scroll;
    }
    .confirm_btn{
        width:100%;
        height:2rem;
        line-height: 2rem;
        background-color: #ededed;
    }
    .cancel,.confirm{
        width:2rem;height:1.3rem;
        background-color: #3d3d3d;
        border:none;
        border-radius: 5px;
    }
    .cancel{
        float:left;
        color:#fff;
        margin-left: 1rem;
    }
    .confirm{
        float: right;
        color: #FFD91E;
        margin-right: 1rem;
    }
    .sub_content{
        width:100%;
        position: fixed;
        left:0;
        bottom:0;
    }
    .cargo{
        width:100%;height:2rem;
        line-height: 2rem;
        text-align: center;
        font-size:.8rem;
    }
    /*.selct{
        display: inline-block;
        margin-top: .55rem;
        margin-right:.5rem;
        width:.9rem;height:.9rem;
        border-radius: .9rem;
        border:2px solid #aaa;
    }*/
    .selcted{
        background-color: #353535;
        color:#FFD91E;
        border-bottom: 1px solid #fff;
    }
</style>