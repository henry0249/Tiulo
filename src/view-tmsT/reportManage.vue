<template>
    <div class="page" id="reportManagePage">   
        <div class="mint-header">
            <div class="hleft" @click="back('/TMStaskList')"> 
                <span slot="icon" class="iconfont">&#xe605;</span>
            </div>
            <div class="hcontent mint-header-title">
                <div class="hcontentTitle" @click="openChartType()">
                    <div class="typeTitle">
                        {{chartTitle}}   
                    </div>
                    <span slot="icon" class="iconfont hcontentIcon">{{{iconShow}}}</span>  
                </div>
            </div>
            <div class="hright"></div>
        </div>
        <div class="container-top" style="margin-bottom:3rem;" id="chartManageContainer">
            <!-- navbar -->
            <div class="orgBox" @click="orgShow = true">
                <img :src="companyLogo">
                    {{showName}}
            </div>
            
            <div class="type_box">
                <mt-navbar v-if="chartType == 'yw'" class="page-part" :selected.sync="chartSelected">
                    <mt-tab-item id="HL" @click="chartSelectedChange('HL')">货量</mt-tab-item>
                    <mt-tab-item id="YC" @click="chartSelectedChange('YC')">异常</mt-tab-item>
                    <mt-tab-item id="CC" @click="chartSelectedChange('CC')">车次</mt-tab-item>
                    <mt-tab-item id="PK" @click="chartSelectedChange('PK')">赔款</mt-tab-item>
                    <mt-tab-item id="YYE" @click="chartSelectedChange('YYE')">营业额</mt-tab-item>
                    <mt-tab-item id="KPI" @click="chartSelectedChange('KPI')">KPI</mt-tab-item>
                </mt-navbar>
                <mt-navbar v-if="chartType == 'cw'" class="page-part" :selected.sync="chartSelected">
                    <mt-tab-item id="SR" @click="chartSelectedChange('SR')">收入</mt-tab-item>
                    <mt-tab-item id="CB" @click="chartSelectedChange('CB')">成本</mt-tab-item>
                    <mt-tab-item id="ML" @click="chartSelectedChange('ML')">毛利</mt-tab-item>
                    <mt-tab-item id="JL" @click="chartSelectedChange('JL')">净利</mt-tab-item>
                </mt-navbar>
            </div>
             <div class="customerBox">
                <div @click="reportChange('KH')" v-if="(chartType == 'yw' && chartSelected != 'CC') || (chartType == 'cw' && chartSelected == 'ML') || (chartType == 'cw' && chartSelected == 'JL')">{{customerName}}</div> 
                <div @click="reportChange('LX')" v-if="chartType == 'cw'">{{trOrgName}}</div> 
                <div @click="reportChange('SJ')" v-if="chartType == 'cw' && chartSelected == 'CB'">{{trkDriverName}}</div>
            </div>

            <div class="datePicker">
                <input type="date" v-model="startDate" :value="startDate">
                <input type="date" v-model="endDate" :value="endDate">
            </div>
            <div id="chartPic" :style="{height:chartH + 'px'}"></div>
            <div style="display: none;" id="waiting">正在努力中，即将上线……</div>
            <div class="noData">{{noReportData}}</div>

        </div>

        <!-- 交接类型选择框 -->
        <mt-popup class="chartTypeBox" :visible.sync="chartTypeShow" popup-transition="popup-fade" @click="closeChartTypePop()">
            <div class="container-top" style="margin-bottom:3rem;">
                <ul class="chartType">
                    <li v-for="type in typeData" @click="chooseChartType(type)">
                        <span slot="icon" class="iconfont" :class="chartType == type.val ? 'currChartCircle' : ''">&#xe618;</span>{{type.label}}
                    </li>
                </ul>
            </div>
        </mt-popup> 

        <!-- 机构选择框 -->
        <mt-popup class="orgList" :visible.sync="orgShow" popup-transition="popup-fade">
            <mt-header fixed title="选择机构">
                <mt-button icon="back" slot="left"  @click="orgShow = false"></mt-button>
            </mt-header>
            <div class="container-top">
                <ul class="organization">
                    <li class="orgOne" v-for="station in stationList" @click.stop ='changeStation(station.MRorg)'>
                        <div class="stationDiv">
                            <img :src="station.orgs[0].suoCompanyLogo">
                            <span class="stationLine">{{station.companyName}}</span> 
                        </div>
                        <ul v-if="subSystem == 'TMS'" style="padding-left:2rem;">
                            <li v-for="org in station.orgs">
                                <div v-if="subSystem == 'TMS' && (org.suoOrgId != org.suoCompanyId + 'MR')" @click.stop = "changeStation(org)">
                                   <span slot="icon" class="iconfont" style="color:#FFD91E;">&#xe618;</span>
                                    {{org.suoOrgName}} 
                                </div>  
                            </li>
                        </ul>
                    </li>
                    <li v-if="noOrgData" class="orgOne" style="text-align:center;padding:0.5rem">没有可选择机构</li>
                </ul>
            </div>
        </mt-popup>

        <!-- 客户、司机、路线选择框 -->
        <mt-popup class="chooseBox" :visible.sync="chooseShow" popup-transition="popup-fade">
            <mt-header fixed :title="chooseTitle">
                <mt-button icon="back" slot="left" @click="chooseShow = false">
                </mt-button>
                <mt-button slot="right" @click="chooseAll()">全部</mt-button>
            </mt-header> 
                    <!-- 搜索框 -->
            <div v-if="chooseType != 'LX'" class="container-search" id="reportChooseMysearchBox"> 
                <mysearch
                  :value.sync="searchVal"
                  :placeholder="placeholder">
                </mysearch>       
            </div>
            <div class="container-top" id="reportChooseContainer" v-infinite-scroll="loadMore()" infinite-scroll-immediate-check="false" infinite-scroll-disabled="loading" infinite-scroll-distance="50">
                <!-- 客户 -->
                <div v-if="chooseType == 'KH'" style="margin-top:2.8rem" >  
                    <div v-for="data in dataList" class="oneData" @click="changeData(data)">
                        <img :src="data.bdLogo">
                        <p>{{data.bdName}}</p>
                        <p>{{data.bdContactMobile}}</p>
                    </div>
                </div>

                <!-- 司机 -->
                <div v-if="chooseType == 'SJ'" style="margin-top:2.8rem">  
                    <div v-for="data in dataList" class="oneData" @click="changeData(data)">
                        <img :src="data.trkLogo" style="border-radius: 0.3rem">
                        <p>
                            <span>
                                {{data.showDriverName}}
                            </span>
                            <span v-if="data.trkDriverSex == '男'" style="color:#81ADFC" slot="icon" class="iconfont">&#xe60b;</span>
                            <span v-if="data.trkDriverSex == '女'" style="color:#FD626E" slot="icon" class="iconfont">&#xe60d;</span>
                            <span>
                                {{data.trkDriverMobile}}
                            </span>
                        </p>
                        <p>{{data.trkCode}}</p>
                    </div>
                </div>
                <!-- 优势路线 -->
                <div v-if="chooseType == 'LX'" class="yslx">  
                    <ul class="organization">
                        <li class="orgOne">
                            <div class="stationDiv">
                                <img :src="companyLogo">
                                <span class="stationLine">{{companyName}}</span> 
                            </div>
                            <ul class="reportLine">
                                <li  v-for="data in dataList" @click="changeData(data)">
                                   <span slot="icon" class="iconfont" style="color:#FFD91E;">&#xe618;</span>
                                    {{data.trStartOrgName}} - {{data.trEndOrgName}} 
                                </li>
                            </ul>
                        </li>
                    </ul>
                </div>
                <div class="noData">{{noData}}</div>                     
                <!-- 加载指示器 -->
                <div class="sw-spinner" v-if="showLoadMore">
                    <mt-spinner type="snake" color="#FFD91E"></mt-spinner>
                </div>
                       
            </div>
        </mt-popup>

    </div>
</template>

<script>
// Ajax request module, return a Promise
import Tokens from '../token'
import  Mysearch  from '../components/mysearch'
// import  Datepicker  from '../components/vue-date-picker'

export default {
    components:{
        Mysearch
    },
    data () {
        return {
            userId:'',
            subSystem:'',
            companyId:'',
            currCompanyId:'',
            orgId:'',
            companyName:'',
            orgName:'',
            companyLogo:'',
            showName:'',
            chartType:'yw',//类型
            chartTitle:'业务报表',
            iconShow:'&#xe611;',//上下箭头 &#xe66b;
            chartSelected:'HL',
            noReportData:'',//没有数据

            stationList:[],//机构列表
            orgShow:false,

            chartTypeShow:false,
            typeData:[  {label:'业务报表',val:'yw'},
                        {label:'财务报表',val:'cw'}],
            startDate:'',//开始时间
            endDate:'',//结束时间
            dataSearch:0,//首次进入是否搜索

            //客户、司机、线路选择
            searchVal:'',
            dataList:[],
            dataCurrPage:1,//当前页数
            loadMax:false,//是否加载到最大
            noData:'',//没有数据或是加载完成的提示
            loading:false,//是否已在进行无限加载
            showLoadMore:false,//是否显示加载指示器

            chooseShow:false,
            chooseType:'',
            chooseTitle:'',
            placeholder:'',  
            customerName:'全部客户',
            trkId:'',
            trkDriverName:'全部司机',
            trStartOrgId:'',
            trEndOrgId:'',
            trOrgName:'全部路线',

            chartH:'',//图表的高度
            option:{},
        }
    },
    ready (){
        let self = this; 
        let chartW = document.getElementById('chartPic').offsetWidth;
        self.chartH = parseFloat(chartW)*0.6;  

        //获取当前时间
        let date = new Date(); 
        let mon = date.getMonth() + 1;
        let day = date.getDate();
        self.endDate = date.getFullYear() + "-" + (mon<10?"0"+mon:mon) + "-" +(day<10?"0"+day:day);
        //一周前的时间
        let prevDate = new Date(date.getTime() - 6 * 24 * 3600 * 1000);
        let prevMonth = prevDate.getMonth() + 1;
        let prevDay = prevDate.getDate();
        self.startDate = prevDate.getFullYear() + "-" + (prevMonth<10?"0"+prevMonth:prevMonth) + "-" +(prevDay<10?"0"+prevDay:prevDay);

        let token = Tokens.fetch("token");
        self.userId = token["userId"];
        self.subSystem = token["subSystem"]; 
        self.orgId = token["orgId"];
        self.companyId = token["companyId"];
        self.companyLogo = token["companyLogo"];
        self.companyName = token["companyName"];
        self.orgName = token["orgName"];
        if(self.companyName != self.orgName){
            self.showName = self.companyName + '-' + self.orgName;
        }else{
            self.showName = self.companyName;
        }
        self.$nextTick(()=>{
            $("#chart").css( 'width', $("#chart").width());
        })
        self.getStationData();
        self.getData();
    },
    watch:{
        //搜索内容改变执行此方法
        'searchVal': function(){
            let self = this;
            if(self.searchNum == 0){//刚进来重置searchVal不执行搜索
                self.searchNum++;
                return;
            }  
            //设置延迟执行
            clearInterval(self.searchTimer);
            self.searchTimer = setTimeout(function(){
                self.dataCurrPage = 1;
                self.loadMax = false;
                self.noData = '';
                self.$Indicator.open();
                self.chooseData(self.chooseType); 
            },1000);
        },
        'startDate':function (newVal){
            let self = this
            if(self.dataSearch != 0){
               self.$Indicator.open();
                self.getData(); 
            }
            
        },
        'endDate':function (newVal){
            let self = this
            if(self.dataSearch != 0){
               self.$Indicator.open();
                self.getData(); 
            }
        },
        'chartSelected':function (newVal){
            let self = this
            if( newVal == 'PK' || newVal == 'KPI'){
                $("#waiting").show();
            }else{
                $("#waiting").hide();
            }
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
        openChartType(){//打开选择type框
            let self = this;
            if(self.chartTypeShow){
                self.iconShow = '&#xe611;'
            }else{
                self.iconShow = '&#xe66b;'
            }
            self.chartTypeShow = !self.chartTypeShow;
        },
        closeChartTypePop(){//关闭选择type框
            let self = this;
            self.chartTypeShow = false;
            self.iconShow = '&#xe611;'
        },
        chooseChartType(type){//选择交接类型
            let self = this;
            if(self.chartType == type.val){
                return;
            }else{
                self.chartType = type.val;
                self.chartTitle = type.label;
                if(type.val == 'yw'){
                    self.chartSelected = 'HL';
                }else if(type.val == 'cw'){
                    self.chartSelected = 'SR';
                }
                self.$Indicator.open();
                self.getData(); 
            }     
        },
        
        chartSelectedChange(selected){//切换选择类型
            let self = this;
            if(selected == 'PK' || selected == 'KPI'){
                $("#chartPic").hide();
                self.noReportData = '';
                return;
            }
            self.chartSelected = selected;  
            self.$Indicator.open();
            self.getData(); 
        },
        getStationData(){//获取所有机构
            let self = this;
            let s = {   action:"/userOrg/query",
                        params:{suoSubSystem:self.subSystem,suoUserId:self.userId}
                    };
            self.noOrgData = false;
            doAjaxQuery(s,function(data) {
                if(data.status == 0){
                    self.$transfer.backLogin(self, data);
                }else if(data.status == 1){
                    let obj = data.dataset.rows; 
                    if(obj && obj.length>0){

                        //将站点列表转为树形结构
                        let orgArr = [];
                        obj.forEach(function(item, index){
                            item.suoCompanyLogo = getImgURL() +'company/' +item.suoCompanyLogo;
                            var ImgObj = new Image(); 
                            ImgObj.src = item.suoCompanyLogo; 
                            ImgObj.onerror = function(){
                                item.suoCompanyLogo = getImgURL() + 'company/default.png';
                            }

                            let keyVal = JSON.stringify({'companyId':item.suoCompanyId});
                            let keyVal2 = keyVal.substring(1,keyVal.length-1);
                            if(JSON.stringify(orgArr).indexOf(keyVal2) == -1){
                                let newCompany = {  'companyId':item.suoCompanyId,
                                                    'companyName':item.suoCompanyName,
                                                    // 'companyLogo':item.suoCompanyLogo,
                                                    'orgs':[item]};
                                //存储默认机构
                                if(self.subSystem == 'TMS' && (item.suoOrgId == item.suoCompanyId + 'MR')){
                                    newCompany.MRorg = item;
                                }
                                orgArr.push(newCompany);
                            }else{                   
                                for(var j=0;j<orgArr.length;j++){
                                    if(orgArr[j].companyId == item.suoCompanyId){
                                        orgArr[j].orgs.push(item)
                                        //存储默认机构
                                        if(self.subSystem == 'TMS' && (item.suoOrgId == item.suoCompanyId + 'MR')){
                                            orgArr[j].MRorg = item;
                                        }
                                    }
                                }
                            } 
                            
                        })
                        self.stationList = orgArr;   
                    }
                    
                }
            });
        },
        changeStation(station){//切换机构
            let self = this;
            console.log(station.suoCompanyId)
            if(station){
                self.orgId = station.suoOrgId;
                self.companyName = station.suoCompanyName;
                self.currCompanyId = station.suoCompanyId;
                self.orgName = station.suoOrgName;
                self.companyLogo = station.suoCompanyLogo;
                if(self.companyName != self.orgName){
                    self.showName = self.companyName + '-' + self.orgName;
                }else{
                    self.showName = self.companyName;
                }
                self.customerName = '全部客户';
                self.trkId = '';
                self.trkDriverName = '全部司机';
                self.trStartOrgId = '';
                self.trEndOrgId = '';
                self.trOrgName = '全部路线';
                if(self.dataSearch != 0 && self.chartSelected != 'PK' && self.chartSelected != 'KPI'){
                   self.$Indicator.open();
                    self.getData(); 
                } 
            }
            self.orgShow = false;

        },
        reportChange(type){//切换客户，司机，线路
            let self = this;
            self.chooseType = type;
            self.chooseShow = true;
            self.searchVal = '';
            if(type =='KH'){
                self.chooseTitle = "选择客户";
                self.placeholder = "客户名、联系电话";
            }else if(type == 'LX'){
                self.chooseTitle = "选择路线";
            }else if(type == 'SJ'){
                self.chooseTitle = "选择司机";
                self.placeholder = "车牌号、姓名、手机号";
            }
            self.dataList = [];
            self.dataCurrPage = 1;
            self.loadMax = false;
            self.noData = '';
            self.$Indicator.open();
            self.chooseData(type);
        },
        loadMore () {//无限加载更多
            let self = this;
            if(self.loading || self.loadMax || self.dataCurrPage <= 1){
                return;
            }else{
                self.loading = true;
                self.showLoadMore = true;
                setTimeout(function(){
                    self.chooseData(self.chooseType);
                },1000)
                
            }
      
        },
        chooseData(type){//判断获取哪种信息
            let self = this;
            let s = {};
            if(type == 'KH'){
                s = {   action:"/owner/query1",
                        pageIndex:self.dataCurrPage,
                        pageSize:10,
                        params:{findString:self.searchVal}
                    };
                if(self.chartType == 'yw'){
                    if(self.orgId == (self.currCompanyId + 'MR')){
                        s.params.reportCompany = self.currCompanyId;
                    }else{
                        s.params.reportCondition = self.orgId;
                    }
                }else if(self.chartType == 'cw'){
                    s.params.tmreport = '1';
                }
                
            }else if(type == 'LX'){
                s = {   action:"/truckRoute/query",
                        pageIndex:self.dataCurrPage,
                        pageSize:10,
                        params:{}};
                if(self.orgId == (self.currCompanyId + 'MR')){
                    s.params.bdStartCompanyId = self.currCompanyId;
                }else{
                    s.params.trStartOrgId = self.orgId;
                }

            }else if(type == 'SJ'){
                s = {   action:"/truck/query4",
                        pageIndex:self.dataCurrPage,
                        pageSize:10,
                        params:{trkOrgId:self.currCompanyId,findString:self.searchVal}
                    };
                if(self.orgId == (self.currCompanyId + 'MR')){
                    s.params.reportCompany = self.currCompanyId;
                }else{
                    s.params.reportCondition = self.orgId;
                }

            }

            console.log(JSON.stringify(s))
            doAjaxQuery(s,function(data) {
                if(data.status == 0){
                    self.$transfer.backLogin(self, data);
                }else if(data.status == 1){
                    let obj = data.dataset.rows;
                    console.log(data)
                    if(obj && obj.length>0){
                        if(self.chooseType == 'KH'){
                            obj.forEach(function(item, index){
                                item.bdLogo = getImgURL() +'company/' +item.bdLogo;
                                var ImgObj = new Image(); 
                                ImgObj.src = item.bdLogo; 
                                ImgObj.onerror = function(){
                                    item.bdLogo = getImgURL() + 'company/default.png';
                                }
                            })  
                        }
                        if(self.chooseType == 'SJ'){
                            obj.forEach(function(item, index){
                                item.trkLogo = getImgURL() +'user/' +item.trkLogo;
                                var ImgObj = new Image(); 
                                ImgObj.src = item.trkLogo; 
                                ImgObj.onerror = function(){
                                    item.trkLogo = getImgURL() + 'user/default.png';
                                }
                                item.showDriverName = item.trkDriverName.length > 8 ? item.trkDriverName.substring(0,8) : item.trkDriverName;
                            })  
                        }
                        //判断是替换还是增加
                        if(self.dataCurrPage == 1){
                            self.dataList = obj;
                        }else{
                            self.dataList = self.dataList.concat(obj);
                        }    
                        //判断当前页是否是最后一页  
                        let maxRecord = parseInt(data.dataset.allRowCount);
                        if(self.dataList.length == maxRecord){
                            self.loadMax = true;
                            self.noData = '已全部加载';
                        }
                        self.dataCurrPage++;

                    }else{
                                           
                        if(self.taskCurrPage == 1){
                            self.dataList = obj;
                            self.noData = '没有相关数据';
                        }else{
                            self.noData = '已全部加载';
                            self.loadMax = true;
                        }
                    }
                    self.$Indicator.close();
                    self.showLoadMore = false;
                    self.loading = false; 
                }
            });
        },
        changeData(data){//选择数据
            let self = this;

            if(self.chooseType == 'KH'){
                self.customerName = data.bdName;
            }else if(self.chooseType == 'LX'){
                self.trStartOrgId = data.trStartOrgId;
                self.trEndOrgId = data.trEndOrgId;
                self.trOrgName = data.trStartOrgName +'-'+ data.trEndOrgName;
            }else if(self.chooseType == 'SJ'){
                self.trkId = data.trkId;
                self.trkDriverName = data.trkDriverName;
            }
            self.chooseShow = false;
            self.$Indicator.open();
            self.getData(); 
        },
        chooseAll(){//选择全部
            let self = this;
            if(self.chooseType == 'KH'){
                self.customerName = '全部客户';
            }else if(self.chooseType == 'LX'){
                self.trStartOrgId = '';
                self.trEndOrgId = '';
                self.trOrgName = '全部路线';
            }else if(self.chooseType == 'SJ'){
                self.trkId = '';
                self.trkDriverName = '全部司机';
            }
            self.chooseShow = false;
            self.$Indicator.open();
            self.getData();

        },
        getData(){
            let self = this;
            let s = {}; 
            if(self.chartSelected == 'HL'){//货量
                s = {   action:"/orderReport/query",
                        params:{xCount:"2",
                                tohCreateDate_From:self.startDate,
                                tohCreateDate_To:self.endDate
                                }
                    };
                if(self.customerName != "全部客户"){
                    s.params.tohOwnerName = self.customerName;
                }
                if(self.orgId == (self.currCompanyId + 'MR')){
                    s.params.reportCompany = self.currCompanyId;
                }else{
                    s.params.reportCondition = self.orgId;
                }
            }else if(self.chartSelected == 'YC'){//异常
                s = {   action:"/orderReport/query2",
                        params:{tohDate_From:self.startDate,
                                tohDate_To:self.endDate
                                }
                    };
                if(self.customerName != "全部客户"){
                    s.params.tohOwnerName = self.customerName;
                }
                if(self.orgId == (self.currCompanyId + 'MR')){
                    s.params.reportCompany = self.currCompanyId;
                }else{
                    s.params.reportCondition = self.orgId;
                }

            }else if(self.chartSelected == 'CC'){//车次
                s = {   action:"/orderReport/query1",
                        params:{xCount:"7",
                                ttCreateDate_From:self.startDate,
                                ttCreateDate_To:self.endDate,
                                }
                    };
                if(self.orgId == (self.currCompanyId + 'MR')){
                    s.params.tohStarCompanyId = self.currCompanyId;
                }else{
                    s.params.ttStartOrgId = self.orgId;
                }

            }else if(self.chartSelected == 'PK'){//赔款
                // self.$transfer.showToast(self, "正在努力中，即将上线……","",2000);
                return;
            }else if(self.chartSelected == 'YYE'){//营业额
                s = {   action:"/finAccountReport/query",
                        params:{xCount:"7",
                                trDate_From:self.startDate,
                                trDate_To:self.endDate
                                }
                    };
                if(self.customerName != "全部客户"){
                    s.params.tohOwnerName = self.customerName;
                }
                if(self.orgId == (self.currCompanyId + 'MR')){
                    s.params.trPayeeCompanyId = self.currCompanyId;
                }else{
                    s.params.trPayeeId = self.orgId;
                }
            }else if(self.chartSelected == 'KPI'){//KPI
                // self.$transfer.showToast(self, "正在努力中，即将上线……","",2000);
                return;
            }else if(self.chartSelected == 'SR'){//收入
                s = {   action:"/finAccountReport/query",
                        params:{xCount:"3",
                                opType:self.chartSelected,
                                trDate_From:self.startDate,
                                trDate_To:self.endDate
                                }
                    };
                if(self.trStartOrgId != ""){
                    s.params.trTaskStartOrgId = self.trStartOrgId;
                }
                if(self.trEndOrgId != ""){
                    s.params.trTaskEndOrgId = self.trEndOrgId;
                }
                if(self.orgId == (self.currCompanyId + 'MR')){
                    s.params.trPayeeCompanyId = self.currCompanyId;
                }else{
                    s.params.trPayeeId = self.orgId;
                }

            }else if(self.chartSelected == 'CB'){//成本
                s = {   action:"/finAccountReport/query1",
                        params:{xCount:"3",
                                opType:self.chartSelected,
                                trDate_From:self.startDate,
                                trDate_To:self.endDate
                                }
                    };
                if(self.trStartOrgId != ""){
                    s.params.trTaskStartOrgId = self.trStartOrgId;
                }
                if(self.trEndOrgId != ""){
                    s.params.trTaskEndOrgId = self.trEndOrgId;
                }
                if(self.trkId != ""){
                    s.params.trDriverId = self.trkId;
                }
                if(self.orgId == (self.currCompanyId + 'MR')){
                    s.params.trPayerCompanyId = self.currCompanyId;
                }else{
                    s.params.trPayerId = self.orgId;
                }

            }else if(self.chartSelected == 'ML' || self.chartSelected == 'JL'){//毛利、净利
                s = {   action:"/finAccountReport/query2",
                        params:{xCount:"4",
                                opType:self.chartSelected,
                                trDate_From:self.startDate,
                                trDate_To:self.endDate
                                }
                    };
                if(self.customerName != "全部客户"){
                    s.params.tohOwnerName = self.customerName;
                }
                if(self.trStartOrgId != ""){
                    s.params.trTaskStartOrgId = self.trStartOrgId;
                }
                if(self.trEndOrgId != ""){
                    s.params.trTaskEndOrgId = self.trEndOrgId;
                }
                if(self.orgId == (self.currCompanyId + 'MR')){
                    s.params.trPayerCompanyId1 = self.currCompanyId;
                    s.params.trPayeeCompanyId1 = self.currCompanyId;
                }else{
                    s.params.trPayerId1 = self.orgId;
                    s.params.trPayeeId1 = self.orgId;
                }

            }
            doAjaxQuery(s,function(data) {
                if(data.status == 0){
                    self.$transfer.backLogin(self, data);
                }else if(data.status == 1){
                    self.dataSearch++;
                    let obj = data.dataset.rows;
                    // console.log(obj)
                    if(obj && obj.length>0){
                        self.noReportData = "";
                        $("#chartPic").show();
                        let xAxisData = [];//类目
                        let tohQty = [];//订单数
                        let tohCubage = [];//体积
                        let tohWeight = [];//重量
                        let trainsTimes = [];//车次
                        let yyeAmt = [];//营业额
                        let ywAmt = [];//业务收入
                        let jyAmt = [];//经营收入
                        let ywCB = [];//业务收入
                        let jyCB = [];//经营收入
                        let maoLi = [];//毛利
                        let jingLi = [];//净利
                        obj.forEach(function(item, index){
                            if(self.chartSelected == 'HL'){
                                xAxisData.push(item.tohCreateDate)
                                tohQty.push(item.tohQty)
                                tohCubage.push(item.tohCubage)
                                tohWeight.push(item.tohWeight)
                            }else if(self.chartSelected == 'CC'){
                                xAxisData.push(item.tohCreateDate)
                                trainsTimes.push(item.trainsTimes)
                            }else if(self.chartSelected == 'YYE'){
                                xAxisData.push(item.fachCreateDate)
                                yyeAmt.push(item.YWAmt)
                            }else if(self.chartSelected == 'SR'){
                                xAxisData.push(item.fachCreateDate)
                                ywAmt.push(item.YWAmt)
                                jyAmt.push(item.JYAmt)
                            }else if(self.chartSelected == 'CB'){
                                xAxisData.push(item.fachCreateDate)
                                ywCB.push(item.YWAmt)
                                jyCB.push(item.JYAmt)
                            }else if(self.chartSelected == 'ML'){
                                xAxisData.push(item.fachCreateDate)
                                maoLi.push(item.maoli)
                            }else if(self.chartSelected == 'JL'){
                                xAxisData.push(item.fachCreateDate)
                                jingLi.push(item.jingli)
                            }
                        });
                        let legendData = [];
                        if(self.chartSelected == 'HL'){
                            self.creatChart(xAxisData,['订单数','重量','体积'],[tohQty,tohWeight,tohCubage])

                        }else if(self.chartSelected == 'YC'){
                            let ycData = obj[0];
                            let allYc = ycData.allCount;
                            let yclYc = ycData.count2;
                            let wclYc = ycData.count1;
                            let wYc = allYc -yclYc- wclYc;
                            let yclZ = (yclYc/allYc*100).toFixed(2) + '%';
                            let wclZ = (wclYc/allYc*100).toFixed(2) + '%';
                            let wlZ = (wYc/allYc*100).toFixed(2) + '%';
                            self.option = {
                                title : {
                                    text: '异常图表',
                                    x:'center'
                                },
                                tooltip : {
                                    trigger: 'item',
                                    formatter: "{a} <br/>{b} : {c} ({d}%)"
                                },
                                calculable : true,
                                series : [
                                    {   name:'异常比例',
                                        type:'pie',
                                        radius : '55%',
                                        center: ['50%', '60%'],
                                        data:[
                                            {value:yclYc, name:'已处理'},
                                            {value:wclYc, name:'未处理'},
                                            {value:wYc, name:'无异常'}
                                        ]
                                    }
                                ]
                            };
                            // 基于准备好的dom，初始化echarts实例
                            let myChart = self.$Echarts.init(document.getElementById('chartPic'));
                            // 绘制图表
                            myChart.setOption(self.option);
                        }else if(self.chartSelected == 'CC'){
                            self.creatChart(xAxisData,['车次'],[trainsTimes])

                        }else if(self.chartSelected == 'YYE'){
                            self.creatChart(xAxisData,['营业额'],[yyeAmt])

                        }else if(self.chartSelected == 'SR'){
                            self.creatChart(xAxisData,['业务收入','经营收入'],[ywAmt,jyAmt]) 

                        }else if(self.chartSelected == 'CB'){
                            self.creatChart(xAxisData,['业务成本','经营成本'],[ywCB,jyCB]) 

                        }else if(self.chartSelected == 'ML'){
                            self.creatChart(xAxisData,['毛利'],[maoLi]) 

                        }else if(self.chartSelected == 'JL'){
                            self.creatChart(xAxisData,['净利'],[jingLi]) 
                        }
                             
                    }else{ 
                        $("#chartPic").hide();
                        self.noReportData = "没有相关数据"  
                    }
                    self.$Indicator.close();
                }
                
            });

        },
        creatChart(xAxisData,legendData,seriesData){//创建图表
            let self = this;
            self.option = {
                            tooltip : { trigger: 'axis'},
                            legend: {  data:legendData},
                            calculable : true,
                            label:{ 
                                normal:{ 
                                show: true, 
                                position: 'top'} 
                            },
                            grid:{
                                x:50,
                                y:50,
                                x2:50,
                                y2:30
                            },
                            xAxis : {   type : 'category',
                                        data : xAxisData,
                                    },
                            yAxis : {   type : 'value',
                                        axisLabel:{
                                            formatter:function(value){
                                                if(value>=100000000 || value<= -100000000){
                                                    value = parseInt(value/100000000) + "亿"
                                                }else if(value>=1000000 || value<= -1000000){
                                                    value = parseInt(value/1000000) + "百万"
                                                }else if(value>=10000 || value<= -10000){
                                                    value = (value/10000).toFixed(1) + "万"
                                                } 
                                                return value
                                            }
                                        }
                                    } 
                            // yAxis.axisLabel.formatter
                        }
            self.option.series = [];
            for(var i=0;i<legendData.length;i++){
                self.option.series.push(
                    {   name:legendData[i],
                        type:'bar',
                        data:seriesData[i],
                        markLine : {
                            data : [
                                {type : 'average', name : '平均值'}
                            ]
                        }
                    }
                )
            }

            // 基于准备好的dom，初始化echarts实例
            let myChart = self.$Echarts.init(document.getElementById('chartPic'));
            // 绘制图表
            myChart.setOption(self.option);
            //用于使chart自适应高度和宽度
            window.onresize = function () {
                //重置容器高宽
                // resizeWorldMapContainer();
                myChart.resize();
            };

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
            next()
        },
        deactivate ({ next }) {
            //Triggers when component destroys
            next()
        },
        canDeactivate({to, from, next}) {
            let self = this;
            self.$parent.$data.showBar = false;
            self.$parent.$data.taskPageDefalut = "/reportManage"
            next()
        },
        activate({to, from, next}) {
            let self = this;
            let subSystem = localStorage.getItem("subSystem");
            if(subSystem){
                self.$parent.$data.subSystem = subSystem;
            }
            self.$parent.$data.showBar = true;
            self.$parent.$data.MainSelect = "TMStaskList";
            next()
        }  
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#waiting{
    width:65%;
    margin:2rem auto;
    padding:1rem 0.5rem;
    text-align: center;
    background: #353535;
    color:#FFD91E;
    border-radius: 0.5rem;
}
.chooseBox{
    width:100%;
    height:100%;
    background: #ededed;
}
.typeTitle{
    display:inline-block;
    max-width: 80%;
    overflow: hidden;
    text-overflow:ellipsis;
    white-space: nowrap;
}
.datePicker{
    padding: 0 0.5rem;  
    overflow: hidden;
}
.datePicker input{
    border: 1px solid #e5e5e5;
    border-radius: 0.25rem;
    -webkit-appearance:none;
    width:48%;
    box-sizing: border-box;
}
/*图表*/
#chartPic{
    width:100%;
    padding:0.5rem;
    margin-top:0.5rem;
}  
/*切换类型pop*/
.chartTypeBox{
    width: 100%;
    height:100%;
    background: transparent;
}
.chartType{
    background: #fff;
}
.chartType li{
    height:2.2rem;
    line-height: 2.2rem;
    border-bottom:1px solid #e5e5e5;
    padding:0 0.5rem;
}
.chartType li .iconfont{
    padding-right:0.5rem;  
    color:#999; 
}
.currChartCircle{
    color:#FFD91E !important; 
}
/*选择机构*/
.orgList{
    width: 100%;
    height:100%;
    background: #fff;
}
.stationDiv{
    position: relative;
    padding-left:2.5rem;
    height:2rem;
    line-height: 2rem;
}
.organization{
    width:100%;
    min-height: 100%;
    background: #FFF;
}
.orgOne{
    padding:0.5rem;
    border-bottom:1px solid #e5e5e5;
}
.orgOne img{
    position: absolute;
    top:0;
    left:0;
    width:2rem;
    height:2rem;
    border-radius: 1rem;
    border:1px solid #e5e5e5;
}
/*机构显示框*/
.orgBox{
    height:2rem;
    line-height: 2rem;
    padding:0 0.5rem 0 2.6rem;
    background: #fff;
    position: relative;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap; 
    box-sizing: border-box;
    margin:0.3rem 0;
}
.orgBox img{
    position: absolute;
    top:0.2rem;
    left:0.5rem;
    width:1.6rem;
    height:1.6rem;
    border-radius: 0.8rem;
}
.customerBox{
    padding:0 0.5rem;
    margin-top:0.3rem;
}
.customerBox>div{
    min-width:48%;
    max-width:100%;
    display: inline-block;
    height:1.8rem;
    line-height: 1.8rem;
    border: 1px solid #e5e5e5;
    border-radius: 0.25rem;
    background: #fff;
    padding:0 0.5rem;   
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.oneData{
    margin:0 0.5rem 0.5rem 0.5rem;
    border:1px solid #e5e5e5;
    background: #fff;
    border-radius: 0.3rem;
    padding:0.5rem 0.5rem 0.5rem 3rem;
    position: relative;
    height:3.1rem;
}
.oneData img{
    position: absolute;
    width:2rem;
    border-radius: 1rem;
    left:0.5rem;
    top:0.6rem;
}
.oneData p{
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.oneData p span{
    margin-right:0.5rem;
}
.oneData p .iconfont{
    font-size: 0.7rem;
}
/*优势路线*/
.yslx .stationDiv{
    position: relative;
    padding: 0.3rem 0 0.3rem 2.5rem;
    height:2.6rem;
    line-height: 2rem;
    border-bottom:1px solid #e5e5e5;
}
.yslx .orgOne img{
    top:0.3rem;
}
.yslx .reportLine{
    padding-left:1.5rem;
}
.yslx .reportLine li{
    height:2rem;
    line-height: 2rem;
}
.yslx .reportLine li:not(:last-child){
    border-bottom:1px solid #e5e5e5;
}

</style>
