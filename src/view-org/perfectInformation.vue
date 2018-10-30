<template>
	<div class="page">
		<mt-header fixed title="完善资料">
            <mt-button icon="back" slot="left" @click="backLast()"></mt-button>
            <mt-button slot="right" @click="directSkip()">直接跳过</mt-button>
        </mt-header>
        <div class="container-top" id="thorough_information">
            <div id="account_information">
                <div class="head_hint"></div>
                <mt-cell title="开户资料" @click.stop="accountInfor()">
                    <span class="add_style">便于未来对公打款,建议完善</span>
                    <span class="iconfont fr rt_arrow" style="margin-left:.5rem;">&#xe645;</span>
                </mt-cell>
                <!-- TP || OSP -->
                <div v-if="version == 'TP' || version == 'OSP'">
                    <mt-cell title="结算方式" @click.stop="selectClearFrom()">
                        <span class="add_style">{{clearingForm}}</span>
                        <span class="iconfont fr rt_arrow" style="margin-left:.5rem;">&#xe645;</span>
                    </mt-cell>
                    <mt-cell title="车辆类型" @click.stop="selectCarFrom()" v-if="capacity">
                        <span class="add_style">{{carForm}}</span>
                        <span class="iconfont fr rt_arrow" style="margin-left:.5rem;">&#xe645;</span>
                    </mt-cell>
                </div>
                <!-- EP || BSP -->
                <div v-if="version == 'EP' || version == 'BSP'">
                    <mt-cell title="支付方式" @click.stop="selectPayment()">
                        <span class="add_style">{{paymentWay}}</span>
                        <span class="iconfont fr rt_arrow" style="margin-left:.5rem;">&#xe645;</span>
                    </mt-cell>
                </div>
            </div>
            <div class="head_hint"></div>
            <!-- TP || OSP -->
            <div v-if="version == 'TP' || version == 'OSP'" id="typeTransition">
                <mt-cell title="系统办公" v-if="!capacity">
                    <mt-switch class="transition" :value.sync="changeSystemOffice"></mt-switch>
                </mt-cell>
                <mt-cell title="定位能力">
                    <mt-switch class="transition" :value.sync="changeLocation"></mt-switch>
                </mt-cell>
                <mt-cell title="开票能力">
                    <mt-switch class="transition" :value.sync="changeInvoice"></mt-switch>
                </mt-cell>
                <mt-cell title="风控能力(保险)">
                    <mt-switch class="transition" :value.sync="changeRiskControl"></mt-switch>
                </mt-cell>
            </div>
            <!-- EP || BSP -->
            <div v-if="version == 'EP' || version == 'BSP'">
                <mt-cell title="业务模式" @click.stop="selectBusiness()" v-if="enterprise">
                    <span class="add_style">{{business}}</span>
                    <span class="iconfont fr rt_arrow" style="margin-left:.5rem;">&#xe645;</span>
                </mt-cell>
                <mt-cell title="运输需求" @click.stop="selectTransportation()" v-if="!enterprise">
                    <span class="add_style">{{transportation}}</span>
                    <span class="iconfont fr rt_arrow" style="margin-left:.5rem;">&#xe645;</span>
                </mt-cell>
            </div>
            <mt-cell title="服务过的企业" @click.stop="selectServeFirm()">
                <span class="add_style">{{serveFirm}}</span>
                <span class="iconfont fr rt_arrow" style="margin-left:.5rem;">&#xe645;</span>
            </mt-cell>
            <div style="width:100%;text-align:center;">
                <button class="creat_finish" @click.stop="creatFinish()">创建完成</button>
            </div>

            <!-- 开户资料 -->
            <mt-popup position="right" :visible.sync="openAccount" :modal="false" popup-transition="popup-slide">
                <mt-header fixed title="开户资料">
                    <mt-button icon="back" slot="left" @click="accountLast()"></mt-button>
                    <!-- <mt-button slot="right" @click="accountFinish()">完成</mt-button> -->
                </mt-header>
                <div class="container-top">
                    <div class="head_hint"></div>
                    <mt-cell title="开户银行">
                        <span class="ipt_name">
                            <input v-model="accountBank" type="input" placeholder="填写开户的银行">
                        </span>
                    </mt-cell>
                    <mt-cell title="开户名称">
                        <span class="ipt_name">
                            <input v-model="accountName" type="input" placeholder="填写开户的名称">
                        </span>
                    </mt-cell>
                    <mt-cell title="银行账户">
                        <span class="ipt_name">
                            <input v-model="bankAccount" type="input" placeholder="填写银行卡号">
                        </span>
                    </mt-cell>
                    <mt-button class="bank_finish" @click="accountFinish()">完成</mt-button>
                </div>
            </mt-popup>
            <!-- 结算方式(3.4  单选变为多选 "整体改") -->
            <mt-popup position="bottom" class="cargo_box" :visible.sync="selectClear" :modal="true" popup-transition="popup-slide" id="cargo_type">
                <mt-header fixed>
                    <button slot="left" class="cancel" @click.stop="cancel()">取消</button>
                    <button slot="right" class="confirm" @click.stop="confirm()">确定</button>
                </mt-header>
                <div class="container-top">
                    <div class="cargo_content" style="background:#fff;">
                        <div v-for="item in clearingList" :id="'clear'+'-'+$index" class="cargo" @click.stop="selectClearType($index,item)" :class="{selcted:item.status == 1?true:false}">
                            <span>{{item.name}}</span>
                        </div>
                    </div>
                </div>
            </mt-popup>
            <!-- 车辆类型(半屏单选) -->
            <mt-popup position="bottom" class="head_portrait" :visible.sync="selectCars" :modal="true" popup-transition="popup-slide">
                <div class="sub_content" style="background:#fff;" id="add_select">
                    <div class="confirm_btn">
                        <button class="cancel" @click.stop="cancel()">取消</button>
                        <button class="confirm" @click.stop="confirm()">确定</button>
                    </div>
                    <mt-picker :slots="carsSlots" track-by="$index" @change="onCarsChange" :visible-item-count="5"></mt-picker>
                </div>
            </mt-popup>
            <!-- 服务过的企业 -->
            <mt-popup position="right" :visible.sync="serviceEnterprise" :modal="false" popup-transition="popup-slide">
                <mt-header fixed title="服务过的企业">
                    <mt-button icon="back" slot="left" @click="serviceLast()"></mt-button>
                    <mt-button slot="right" @click="serviceFinish()">继续添加</mt-button>
                </mt-header>
                <div class="container-top">
                    <div class="head_hint"></div>
                    <div class="only-box" v-for="item in company" track-by="$index">
                        <mt-cell :title="'企业'+($index+1)">
                            <span class="ipt_name">
                                <input v-model="item.name" type="input" placeholder="请输入企业名称">
                            </span>
                        </mt-cell>
                    </div>
                    <div style="width:100%;text-align:center;margin-bottom:2rem;">
                        <button class="creat_finish" @click.stop="firmFinish()">完成</button>
                    </div>
                </div>
            </mt-popup>
            <!-- 业务模式 -->
            <mt-popup position="bottom" class="cargo_box" :visible.sync="selectBusPattern" :modal="true" popup-transition="popup-slide" id="cargo_type">
                <mt-header fixed>
                    <button slot="left" class="cancel" @click.stop="cancel()">取消</button>
                    <button slot="right" class="confirm" @click.stop="confirm()">确定</button>
                </mt-header>
                <div class="container-top">
                    <mt-picker :slots="businessSlots" track-by="$index" @change="onbusinessChange" :visible-item-count="5"></mt-picker>
                </div>
            </mt-popup>
            <!-- 月结 -->
            <mt-popup position="bottom" class="cargo_box" :visible.sync="monthlyShow" :modal="true" popup-transition="popup-slide" id="cargo_type">
                <mt-header fixed title="请选择月结周期">
                </mt-header>
                <div class="container-top">
                    <div class="cargo_content" style="background:#fff;">
                        <div v-for="item in monthlies" :id="'month'+'-'+$index" class="cargo" @click.stop="selectMonthly($index,item)" :class="{selcted:item.status == 1?true:false}">
                            <span>{{item.name}}</span>
                        </div>
                    </div>
                </div>
            </mt-popup>
        </div>
    </div>
</template>
<script>
import Tokens from '../token'
export default {
    data () {
        return{
        	toke:'',//本地token的值
        	pathWay:'',//路径的保存
            version:'',//当前是哪个版本
            bdId:'',//当前bdId
            capacity:false,//运力版的显示隐藏(TP/OSP)
            enterprise:false,//企业版的显示隐藏(EP/BSP)
            OrgData:[],// 已经填写的数据
            friendsData:[],//朋友
            // 开户资料
            openAccount:false,//开户选择框显示隐藏
            accountBank:'',//开户的银行
            accountName:'',//开户的名称
            bankAccount:'',//开户的银行卡号
            // 服务过的企业
            serveFirm:'',//服务过的企业选择的值
            serviceEnterprise:false,//服务过的企业pop框的显示隐藏
            company:[{name:""}],//所有服务过的企业
            // TP || OSP
            // 结算方式
            clearingForm:'请选择',//结算方式选择的值
            clearingList:[{name:'现付',status:0},{name:'回付',status:0},{name:'到付',status:0},{name:'月结',status:0}],//结算的方式
            selectClear:false,//结算方式的显示与隐藏
            clearSlot:[],//暂时保存选中的结算方式
            monthlyShow:false,//月结
            monthlies:[{name:'1月',status:0},{name:'2月',status:0},{name:'3月',status:0},{name:'4月',status:0},{name:'5月',status:0},{name:'6月',status:0}],//月份
            monthSlot:[],//暂时保存的月份周期
            // 车辆类型
            carForm:'请选择',//车辆类型选择的值
            carArr:[],//储存的值
            selectCars:false,//车辆类型选择框显示隐藏

            changeLocation:false,//定位能力选择的值
            changeInvoice:false,//开票能力选择的值
            changeRiskControl:false,//风控能力选择的值
            changeSystemOffice:false,//系统办公选择的值
            // EP || BSP
            //支付方式
            paymentWay:'请选择',//支付方式选择的值
            //业务模式
            business:'请选择',//业务模式选择的值
            selectBusPattern:false,//业务模式选择框显示隐藏
            //运输需求
            transportation:'请选择',//运输需求选择的值
        }
    },
    watch:{
        'changeSystemOffice':function(e){//系统办公
            let self = this;
            console.log(e)
        },
        'changeLocation':function(e){//定位能力
            let self = this;
            console.log(e)
        },
        'changeInvoice':function(e){//开票能力
            let self = this;
            console.log(e)
        },
        'changeRiskControl':function(e){//风控能力(保险)
            let self = this;
            console.log(e)
        },
    },
    computed:{
        carsSlots:function(e){//默认显示的数据
            let self = this;
            let carsSlots = [
                {
                    flex: 1,
                    values: ['小型','中型','大型'],
                    className: 'slot1',
                    textAlign: 'center',
                    defaultIndex: 0
                }
            ]
            return carsSlots
        },
        businessSlots:function(e){//业务模式默认显示的数据
            let self = this;
            let businessSlots = [
                {
                    flex: 1,
                    values: ['B2B','B2C','B2B2C','O2O'],
                    className: 'slot1',
                    textAlign: 'center',
                    defaultIndex: 0
                }
            ]
            return businessSlots
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
        backLast(){//返回上一页面
            let self = this;
            // Tokens.save("moreSelectType",'')
            self.back('/foundOrg');
        },
        directSkip(){//直接跳过
            let self = this;
            let paramFrom = Tokens.fetch('selectPath');
            if(paramFrom.indexOf('companyList') == 1){
                self.back(paramFrom)
            }else{
                self.creatFinish();
                // self.go('/tiulo')
            }
        },
        // 开户资料
        accountInfor(){//点击开户资料
            let self = this;
            self.openAccount = true;
        },
        accountLast(){//开户资料取消按钮
            let self = this;
            self.openAccount = false;
        },
        accountFinish(){//开户资料完成按钮
            let self = this;
            self.openAccount = false;
        },
        // 服务过的企业
        selectServeFirm(){//点击
            let self = this;
            self.serviceEnterprise = true;
        },
        serviceLast(){//关闭添加企业页面
            let self = this;
            self.serviceEnterprise = false;
        },
        serviceFinish(){//继续添加服务过的企业
            let self = this;
            let companyShow = true;
            for(let k=0;k<self.company.length;k++){
                if(self.company[k].name == ''){
                    self.$transfer.showToast(self, "请您填写服务企业再添加",1500);
                    companyShow = false;
                    return;
                }
            }
            if(companyShow){
                let obj = {name:""};
                self.company.push(obj);
            }
        },
        firmFinish(){//添加企业完成
            let self = this;
            // for(let k=0;k<self.company.length;k++){
            //     if(self.company[k].name == ''){
            //         self.company.splice(k,1)
            //     }
            // }
            self.serviceEnterprise = false;
        },
        // TP || OSP
        //结算方式
        selectClearFrom(){//点击
            let self = this;
            self.selectClear = true;
            self.status = 1;
        },
        selectClearType(key,val){//选择结算方式
            let self = this;
            if($("#clear"+'-'+key).is('.selcted')){
                val.status = 0;
                self.clearSlot.splice($.inArray(val,self.clearSlot),1);
            }else{
                // val.status = 1;
                // self.clearSlot.push(val)
                if(val.name == '月结'){
                    for(let key in self.clearSlot){
                        if(self.clearSlot[key].name == val.name){
                            self.clearSlot.splice(key,1)
                        }
                    }
                    self.clearSlot.push(val)
                    self.monthlyShow = true;
                }else{
                    val.status = 1;
                    self.clearSlot.push(val)
                }
            }   
        },
        // 月结
        selectMonthly(key,val){//月结
            let self = this;
            if($("#month"+'-'+key).is('.selcted')){
                val.status = 0;
                for(let key in self.monthSlot){
                    if(self.monthSlot[key].name == val.name){
                        self.monthSlot.splice(key,1)
                    }
                }
            }else{
                for(let key in self.monthSlot){
                    self.monthSlot[key].status = 0;
                }
                self.monthSlot = [];
                val.status = 1;
                self.monthSlot.push(val);
                self.monthlyShow = false;
            }
        },
        //车辆类型
        selectCarFrom(){//点击
            let self = this;
            // self.selectCars = true;
            // self.status = 2;
            self.go('/addCarType')
        },
        onCarsChange(picker, values){//切换车辆类型
            let self = this;
            self.carForm = values[0];
        },
        // EP || BSP
        //支付方式
        selectPayment(){//点击
            let self =this;
            self.selectClear = true;
            self.status = 2;
        },
        //业务模式
        selectBusiness(){//点击
            let self = this;
            self.status = 3;
            self.selectBusPattern = true;
        },
        onbusinessChange(picker, values){//切换业务模式
            let self = this;
            self.business = values[0];
        },
        //运输需求
        selectTransportation(){//点击
            let self = this;
            let capacity = {
                name:"YS",
                values:self.transportation
            }
            Tokens.save("moreSelectType",capacity)
            self.go('/moreselect')
        },
        // pop框取消与确定
        cancel(){//取消框
            let self = this;
            if(self.status == 1){
                self.selectClear = false;
            }else if(self.status == 2){
                self.selectClear = false;
            }else if(self.status == 3){
                self.selectBusPattern = false;
            }
        },
        confirm(){//确定框
            let self = this;
            if(self.status == 1){
                let clearingForm=[];
                if(self.clearSlot && self.clearSlot.length>0){
                    for(let i=0;i<self.clearSlot.length;i++){
                        clearingForm.push(self.clearSlot[i].name);
                    }
                    self.clearingForm = clearingForm.join(',')
                }
                self.selectClear = false;
            }else if(self.status == 2){
                let paymentWay = [];
                if(self.clearSlot && self.clearSlot.length>0){
                    for(let i=0;i<self.clearSlot.length;i++){
                        paymentWay.push(self.clearSlot[i].name);
                    }
                    self.paymentWay = paymentWay.join(',')
                }
                self.selectClear = false;
            }else if(self.status == 3){
                if(self.business == '请选择'){
                    self.business = self.businessSlots[0].values[0]
                }
                self.selectBusPattern = false;
            }
        },
        creatFinish(){//完成按钮
            let self = this;
            let company = [];//服务企业
            for(let key=0;key<self.company.length;key++){
                company[key] = self.company[key]
                if(self.company[key].name == ''){
                    company.splice(key,1)
                }
            }
            let period = "";//支付周期
            if(self.monthSlot.length == 1){
                period = self.monthSlot[0].name;
            }
            let arrCarFrom = [];
            if(self.carForm == "请选择"){
                arrCarFrom = [];
            }else{
                console.log(arrCarFrom)
            }
            let s = {};
            if(self.version == 'TP' || self.version == 'OSP'){//运力版
                s = {action: "/company/save"};
            }else if(self.version == 'EP' || self.version == 'BSP'){
                s = {action: "/owner/save"};
            }
            if(self.version == 'TP' || self.version == 'OSP'){
                let clearSlot = self.clearingForm == '请选择'?[]:self.clearingForm.split(',');//结算方式
                self.OrgData[0].rowId = 1;
                self.OrgData[0].state = "i";
                self.OrgData[0].bdOrgId = '*';
                self.OrgData[0].bdIsConsigner = "1";
                self.OrgData[0].bdSubSystem2 = self.version;
                self.OrgData[0].bdCreateUserId = self.toke.userId;
                self.OrgData[0].bdBank = self.accountBank;//银行
                self.OrgData[0].bdBankUser = self.accountName;//银行名称
                self.OrgData[0].bdBankNo = self.bankAccount;//银行卡号
                self.OrgData[0].bdFinMode = clearSlot;//结算方式
                self.OrgData[0].bdStr07 = arrCarFrom;//车辆类型
                self.OrgData[0].bdStr03 = period;//支付周期
                self.OrgData[0].bdIsYesNo1 = self.changeSystemOffice?1:0;//系统办公
                self.OrgData[0].bdIsYesNo2 = self.changeLocation?1:0;//定位能力
                self.OrgData[0].bdIsYesNo3 = self.changeInvoice?1:0;//开票能力
                self.OrgData[0].bdIsYesNo4 = self.changeRiskControl?1:0;//风控能力
                self.OrgData[0].bdStr08 = company;//服务企业
                
                s.datasets = {dsData:{rows:self.OrgData}}
                s.datasets.dsLine1 = {rows:self.friendsData}
                // s.datasets.dsLine1 = {rows:self.OrgData[1]};
                // s.datasets.dsData.rows = self.OrgData
            }else if(self.version == 'EP' || self.version == 'BSP'){
                let clearSlot = self.paymentWay == '请选择'?[]:self.paymentWay.split(',');//支付方式
                console.log(self.transportation)
                let business = "";
                let transportation = "";
                if(self.business == '请选择'){
                    business = "";
                }else{
                    business = self.business;
                }
                if(self.transportation == '请选择'){
                    transportation = "";
                }else{
                    transportation = self.transportation;
                }
                console.log(clearSlot)
                self.OrgData[0].rowId = 1;
                self.OrgData[0].state = "i";
                self.OrgData[0].bdOrgId = '*';
                self.OrgData[0].bdIsConsigner = "1";
                self.OrgData[0].bdSubSystem2 = self.version;
                self.OrgData[0].bdCreateUserId = self.toke.userId;
                self.OrgData[0].bdBank = self.accountBank;//银行
                self.OrgData[0].bdBankUser = self.accountName;//银行名称
                self.OrgData[0].bdBankNo = self.bankAccount;//银行卡号
                self.OrgData[0].bdFinMode = clearSlot;//支付方式
                self.OrgData[0].bdStr08 = company;//服务企业
                self.OrgData[0].bdStr03 = period;//支付周期
                self.OrgData[0].bdStr06 = business;//业务模式
                self.OrgData[0].bdStr05 = transportation;//运输需求
                console.log(self.OrgData)
                s.datasets = {dsData:{rows:self.OrgData}};
                s.datasets.dsLine1 = {rows:self.friendsData}
                // s.datasets.dsLine1 = {rows:self.OrgData[1]};
            }
            console.log(s)
            self.submitData(s);
        },
        submitData(s){//提交数据
            let self = this;
            s.params = {"home_selectSystem":self.version}
            self.$Indicator.open();
            console.log(JSON.stringify(s))
            doAjaxUpdate(s, function(data){
                if(data.status == 0){
                   self.$transfer.backLogin(self, data);
                }else if(data.status == 1){
                    console.log(data)
                    let paramFrom = Tokens.fetch('selectPath');
                    if(paramFrom.indexOf('companyList') == 1){
                        self.delectData();
                        self.back(paramFrom)
                    }else{
                        let subSystem = "";
                        if(self.version == "TP" || self.version == "OSP"){
                            subSystem = "TMS";
                        }else if(self.version == "EP" || self.version == "BSP"){
                            subSystem = "KF";
                        }
                        let t = {action:"/userOrg/query",params:{suoSubSystem:subSystem,suoUserId:self.toke.userId,suoSubSystem2:self.version}};
                        doAjaxQuery(t,function(data) {
                            if(data.status == 0){
                                self.$transfer.showToast(self, data.info);
                            }else if(data.status == 1){
                                console.log(data)
                                let orgs = data.dataset.rows; 
                                let currOrg = orgs[0];
                                orgs.forEach(function(item, index){
                                    if(item.suoIsDefault == 1){
                                        currOrg = item;  
                                    }
                                })
                                self.setcurrOrg(currOrg);
                            }
                        })
                    }
                }
                self.$Indicator.close();
            })
        },
        setcurrOrg(currOrg){//如果是企业版 设置默认机构
            console.log(currOrg)
            let self = this;
            let s = {action:"/userOrg/query"};
            console.log()
            s.params = {
                suoSubSystem2:self.version,
                suoSubSystem:currOrg.suoSubSystem,
                suoDistrictName:currOrg.suoDistrictName,
                suoDistrictId:currOrg.suoDistrictId,
                suoOrgId:currOrg.suoOrgId,
                suoId:currOrg.suoId,    
                suoOrgName:currOrg.suoOrgName,
                suoCompanyId:currOrg.suoCompanyId,
                suoCompanyName:currOrg.suoCompanyName,
                opType:"orgChange",
                clicksubSystem:self.version
            };
            consoleShow(JSON.stringify(s));
            doAjaxQuery(s,function(data) {
                if(data.status == 0){
                    self.$Indicator.close();
                    self.$transfer.showToast(self, data.info);
                }else if(data.status == 1){
                    console.log(data)
                    //重新设置本地存储中的token值
                    let localToken = Tokens.fetch("token");
                    localToken["orgId"] = currOrg.suoOrgId;
                    localToken["orgName"] = currOrg.suoOrgName;
                    localToken["orgDistrictId"] = currOrg.suoOrgDistrictId;
                    localToken["orgDistrictName"] = currOrg.suoOrgDistrictName;
                    localToken["districtId2"] = currOrg.suoOrgDistrictId;
                    localToken["provinceId"] = currOrg.suoOrgProvinceId;
                    localToken["companyId"] = currOrg.suoCompanyId;
                    localToken["companyName"] = currOrg.suoOrgName;
                    localToken["companyLogo"] = currOrg.suoCompanyLogo;
                    localToken["isAdmin2"] = currOrg.suoIsAdmin;
                    localToken["isQuery"] = currOrg.suoIsQuery;
                    localToken["isModify"] = currOrg.suoIsModify;
                    localToken["districtId"] = currOrg.suoDistrictId;
                    localToken["districtName"] = currOrg.suoDistrictName;
                    localToken["subSystem"] = currOrg.suoSubSystem;
                    if(self.loginType == "weixin"){
                        localToken["wxHeadPicUrl"] = currOrg.suoUserId + "_wx.gif";
                    }
                    localStorage.setItem("token","");
                    localStorage.setItem("token",JSON.stringify(localToken));
                    // 登录获取的信息 传给android  window.这个方法不行。
                    if(browserType != "weixin"){
                        // alertShow("安卓")
                        try{
                            window.JSToAndroid.getPhone(localStorage.getItem("userMobile"));
                            window.JSToAndroid.getToken(localStorage.getItem("token"));
                        }catch(e){

                        } 
                    }
                    localStorage.setItem("subSystem",localToken.subSystem)
                    let sub =  Tokens.fetch("bdSubSystem2")
                    localStorage.setItem('subSystem2',sub);
                    console.log(localToken.subSystem)
                    console.log(sub)

                    let register = Tokens.fetch('registerPathWay');
                    if(register.indexOf('changeVersion') == 1){
                        Tokens.save('registerPathWay','')
                        self.delectData();
                        self.back('/more')
                    }else{
                        self.delectData();
                        //判断是哪种浏览器
                        if (browserType=="weixin") {
                             initWechatJssdk(function(){
                                self.go('/tiulo'); 
                                self.$Indicator.close();
                             },function(){
                                alertShow("微信签名失败");
                             });
                        }else{
                            self.go('/tiulo'); 
                            self.$Indicator.close();
                        }
                    }
                    self.$Indicator.close();
                }
            })
        },
        delectData(){//清除数据
            let self = this;
            self.accountBank = "";//银行
            self.accountName = "";//银行名称
            self.bankAccount = "";//银行卡号
            self.clearingForm == '请选择';//结算方式
            self.paymentWay == '请选择';//支付方式
            self.monthSlot = [];//支付周期
            self.changeLocation = false;//定位能力
            self.changeInvoice = false;//开票能力
            self.changeRiskControl = false;//风控能力
            self.changeSystemOffice = false;//系统办公
            self.business = '请选择';//业务模式
            Tokens.save("transportNeedType",'');
            Tokens.save("selectNeedType",'');
            $('.cargo').removeClass("selcted");
            self.company = [{name:""}];//服务过的行业
            Tokens.save('foundOrgArrayData','')
            Tokens.save("foundOrgFriendArray",'');
            //foundOrg
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
            self.toke = Tokens.fetch("token");
            self.version = Tokens.fetch("bdSubSystem2");//当前版本号
            self.bdId = Tokens.fetch("companyBdId");//当前Id

            if(from.path){//判断进入路径
                Tokens.save('perfectPath',from.path);
                self.pathWay = from.path;
            }else{
                self.pathWay = Tokens.fetch('perfectPath');
                Tokens.save("transportNeedType",'');
                Tokens.save("selectNeedType",'');
                if(self.pathWay.indexOf('addCarType') == 1){
                    Tokens.save('carTypeData','')
                }
            }
            self.OrgData = Tokens.fetch('foundOrgArrayData');
            let friendsData = Tokens.fetch("foundOrgFriendArray");
            if(friendsData.length == 0){
                self.friendsData = [];
            }else{
                self.friendsData = friendsData;
            }
            console.log(self.OrgData)
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
            // 路径判断以及数据的变化
            if(self.pathWay.indexOf('addCarType') == 1){
                let car = Tokens.fetch('carTypeData');
                if(car && car.length>0){
                    let arr=[];
                    for(let i=0;i<car.length;i++){
                        let obj = {'name':car[i].name+'-'+car[i].type};
                        let str = car[i].name+'-'+car[i].type;
                        self.carArr.push(obj)
                        arr.push(str);
                    }
                    self.carForm = arr.join(',');
                }else{
                    self.carForm = '请选择';
                    self.carArr = [];
                }
            }else if(self.pathWay.indexOf('moreselect') == 1){
                let types = Tokens.fetch("moreSelectType");
                if(types.name == 'YS'){
                    let transport = Tokens.fetch("selectNeedType");
                    self.transportation = '';
                    if(transport == '请选择' || transport.length == 0){
                        self.transportation = '请选择';
                    }else{
                        let arr = [];
                        for(let key=0;key<transport.length;key++){
                            arr.push(transport[key].name)
                        }
                        self.transportation = arr.join(',');
                    }
                }
            }else if(self.pathWay.indexOf('foundOrg') == 1){
                // let self.friendsData = Tokens.fetch("foundOrgFriendArray");
                Tokens.save("transportNeedType",'');
                Tokens.save("selectNeedType",'');
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
        width: 100%;height: 100%;background: #f1f1f1;z-index: 2;
    }
    .cargo_box{
        height:40%;
    }
    .cargo_content{
        width:100%;
        height: 100%;
        overflow: scroll;
    }
    .cargo{
        width:100%;height:2.5rem;
        line-height: 2.5rem;
        text-align: center;
        font-size:.8rem;
    }
    .selcted{
        background-color: #353535;
        color:#FFD91E;
        border-bottom: 1px solid #fff;
    }
    .head_portrait{
        width:100%;
        height:7.5rem;
        background: #D1D1D1;
    }
	.head_hint{
        width:100%;height:1rem;
        line-height: 1rem;
        padding-left:.5rem;
        background-color: #ededed;
    }
    .add_style{
        display: inline-block;
        width:80%;
        white-space:nowrap; 
        overflow:hidden; 
        text-overflow:ellipsis;
    }
    .transition{float:right;}
    .creat_finish{
        margin-top:2rem;
        width:70%;
        height:2.3rem;
        border:none;
        font-size:0.7rem;
        background-color: #3d3d3d;
        color:#FFD91E;
        border-radius: .2rem;
    }
    .ipt_name{
        display: inline-block;
    }
    .ipt_name input{
        padding:0.6rem 0;
    }
    .sub_content{
        width:100%;
        position: fixed;
        left:0;
        bottom:0;
    }
    .confirm_btn{
        width:100%;
        height:2rem;
        line-height: 2rem;
        background-color: #afafaf;
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
    .bank_finish{
        width: 70%;
        display: block;
        margin: 2rem auto;
        background: #FFD91E;
        color: #000;
        border: none;
    }
</style>