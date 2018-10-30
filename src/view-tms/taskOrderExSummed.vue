<template>
    <div class="page"> 
        <mt-header fixed :title="summedTitle">
            <mt-button icon="back" slot="left" @click="back('/taskOrderExDetail',texId)"></mt-button>
            <mt-button slot="right" @click="addSummed()">{{btnText}}</mt-button>
        </mt-header>  
        <div class="container-top">
            <div style="padding:0.5rem;">
                <textarea class="summedtext" v-model="summedText" rows="8" :placeholder="areaPlaceholder"></textarea>
            </div>
            <p style="padding:0 0.5rem;height:1.8rem;line-height: 1.8rem;">费用承担 <span v-if="summedType == 'YJ'">（本人）</span> </p>
            <div class="sumUserUl">
                <div class="sumUserLi" v-for="summed in summedList" track-by="$index">
                    <div v-if="summed.isDel" id="userDel{{$index}}" class="user_delete" @click.stop="deleteUser($index)">删除</div>
                    <div class="user_inner" :class="summed.isDel ? 'userInner' : ''">
                        <img class="sumUserLogo" :src="summed.showLogo">
                        <div class="sumUserName">{{summed.showName}}</div>
                        <input @blur="toNum($event)" id="total-{{$index}}" class="sumUserTotal" name="" placeholder="0" type="tel" :value="summed.showTotal ? parseFloat(summed.showTotal).toFixed(2) :''" />
                        <div class="sumUserMoney" v-show="(summedType == 'ZJ')&&(summed.terType == 'YJ')">{{summed.terAmt1 ? parseFloat(summed.terAmt1).toFixed(2):''}}</div>
                        <div @click="showSummedDetail($index)" class="sumUserSay" v-show="(summedType == 'ZJ')&&(summed.terType == 'YJ')">详情</div>
                    </div>
                </div>
                <div v-if="summedType == 'ZJ'" class="sumUserLi">
                    <img  @click="goAddExUser()" style="border:none;" class="sumUserLogo" src="../img/add.png">
                    <div  @click="goAddExUser()" class="sumUserName" style="width:3.5rem">添加成员</div>
                </div>
            </div>
        </div>

        <mt-popup class="summedPop" position="right" :visible.sync="summedPopShow" :modal="false" popup-transition="popup-slide">
            <mt-header fixed title="异常意见">
                <mt-button icon="back" slot="left" @click="summedPopShow = false"></mt-button>             
            </mt-header>
            <div class="container-top">
                <div class="summedYJtext">{{currSummed.terText}}</div>
                <p style="padding:0 0.5rem;height:1.8rem;line-height: 1.8rem;">费用承担</p>
                <ul class="sumUserUl">
                    <li class="sumUserLi">
                        <img class="sumUserLogo" :src="currSummed.showLogo">
                        <div class="sumUserName">{{currSummed.showName}}</div>
                        <div class="YJUserMoney">{{currSummed.terAmt ? parseFloat(currSummed.terAmt).toFixed(2):''}}</div>
                    </li>
                </ul>
            </div>
        </mt-popup>  
    </div>
</template>

<script>
// Ajax request module, return a Promise
import Tokens from '../token'
export default {
    data () {
        return {
            token:'',
            userId:'',//driverId 默认为userId 
            userName:'',
            sessionId:'',
            subSystem:'',
            texId:'',
            summedText:'',//描述
            exDetailData:'',//异常详情
            summedType:'',//是总结还是意见
            summedTitle:'',//页面标题
            areaPlaceholder:'',//textarea的提示
            summedList:[],//总结数据
            isSubmit:false,//自己是否已经发表过意见
            btnText:'完成',//默认完成，如果已发表过意见就显示修改
            texUsers:'',//异常的参与者
            currSummed:{},
            summedPopShow:false,
        }
    },
    ready(){
        let self = this;
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
        toNum(e){//判断金额类型是否正确  并转为两位小数类型
            let self = this;
            let el = e.target;
            if($(el).val() == ''){
                return;
            }else{
                let inputVal = parseFloat($(el).val());
                if(!inputVal){
                    self.$transfer.showToast(self, "请输入数字类型的金额",'',2000);
                    $(el).val('').focus();
                }else{
                    $(el).val(inputVal.toFixed(2));
                }
            }  
        },
        deleteUser(index){//删除承担者
            let self = this;
            self.summedList.splice(index,1);
            let as = document.querySelectorAll('.userInner');
            Array.from(as).forEach(function(item,index){
                item.style.WebkitTransform = "translateX(" + 0 + "px)";
            })
        },
        goAddExUser(){//去添加承担者
            let self = this;
            let hiddenUserIds = [];
            let includeNotFriends = [];
            for(let j=0;j<self.summedList.length;j++){
                hiddenUserIds.push(self.summedList[j].terPayerId);
            }
            if(self.texUsers != '*'){
                for(let i = 0;i<self.texUsers.length;i++){
                    if(self.texUsers[i].suId != self.exDetailData.texCreateUserId){
                        includeNotFriends.push(self.texUsers[i].suId);
                    }
                }
            }
            let params = {  cmfUserId1:self.userId,
                            cmfSubSystem:self.subSystem,
                            hidden_userIds:hiddenUserIds.join(","),
                            isFilterAdd:"true",
                            include_notFriends:includeNotFriends.join(",")
                        };
            Tokens.save("addExUserParams",params);
            let argument = '添加成员' + '|'+self.texId + 'and' +self.summedType;
            self.go('/add_member',argument);
        },
        addExUserList(){//从添加成员回来  将新加的成员加到summedList
            let self = this;
            let addExUser = Tokens.fetch("exUserAddList");
            if(addExUser.length > 0){
                addExUser.forEach(function(item, index){
                    item.suName = item.suName.length > 3 ? item.suName.substring(0,3) : item.suName;
                    let oneUser = {
                            terPayerId:item.cmfUserId2,
                            terPayerName:item.cmfNickName2, 
                            showName:item.cmfNickName2.length > 3 ? item.cmfNickName2.substring(0,3) : item.cmfNickName2,
                            terUserLogo:item.suLogo ? item.suLogo.split('/user')[0] :'',
                            showLogo:item.suLogo,
                            terAmt:'',
                            terAmt1:'',
                            isDel:true,
                        };
                    self.summedList.unshift(oneUser);
                })               
            } 
            // 设置左滑效果
            self.$nextTick(()=>{
                setTimeout(function(){
                   self.$transfer.translationConfirm(".userInner","userDel");
                },1000)
            }); 

        },
        addSummed(){//提交总结或意见
            let self = this;
            if(!self.summedText){
                self.$transfer.showToast(self, "请输入"+self.summedTitle);
                return;
            }else{
                self.$MessageBox.confirm('确定提交?')
                .then(action => { 
                    let newYJ = {   terType:"YJ",
                                    terExId:self.texId,
                                    terPayerId:self.userId,
                                    terPayerName:self.userName,
                                    terText:self.summedText,
                                    terAmt:$("#total-0").val(),
                                    terAmt1:$("#total-0").val()
                                };
                    if(self.summedType == 'YJ'){//如果是发表意见
                        if(!self.isSubmit){//没有发表过
                            newYJ.rowId = "1";
                            newYJ.state = "i";
                        }else{//修改发表
                            let oldYJ = self.summedList[0];
                            newYJ.state = "u";
                            newYJ.rowId = oldYJ.rowId;
                            newYJ.terTitle = oldYJ.terTitle;
                            newYJ.terId = oldYJ.terId;
                            newYJ.terCreateUser = oldYJ.terCreateUser;
                            newYJ.terCreateUserId = oldYJ.terCreateUserId;
                            newYJ.terModifyUser = oldYJ.terModifyUser;
                            newYJ.terModifyDate = oldYJ.terModifyDate;
                            newYJ.terCreateDate = oldYJ.terCreateDate;
                        }
                        let s = {   action:"/tmExResult/save",
                                    params:{texId:self.texId,terCreateUserId:self.userId},
                                    datasets:{dsData:{rows:[newYJ]}}
                                };
                        self.$Indicator.open();
                        doAjaxUpdate(s,function(data) {
                            if(data.status == 0){ 
                                self.$transfer.backLogin(self, data);
                            }else if(data.status == 1){
                                self.$Indicator.close();
                                self.$transfer.showToast(self, "意见提交成功");
                                setTimeout(function(){
                                   self.back('/taskOrderExDetail',self.texId)
                                },1000)
                            } 
                        });
                    }else if(self.summedType == 'ZJ'){//如果是总结
                        let summedTime = getDateTimeForDate();
                        let newZJ = self.exDetailData;
                        newZJ.state = "u";
                        newZJ.texStatus = "summed";
                        newZJ.texSummedUser = self.usrName;
                        newZJ.texSummedText = self.summedText;
                        newZJ.texSummedDate = summedTime;
                        let newZJUser = [];

                        for(var i=0;i<self.summedList.length;i++){
                            newZJUser.push(self.summedList[i]);
                            let oneSummedUser = newZJUser[i];
                            oneSummedUser.terAmt = $('#total-'+i).val();
                            if(oneSummedUser.terType == 'YJ'){
                                oneSummedUser.state = 'u';
                            }else{
                                oneSummedUser.state = 'i';
                            }
                        }

                        let s = {   action:"/tmEx/save",
                                    params:{texId:self.texId,recvIdsLogo:'1'},
                                    datasets:{dsData:{rows:[newZJ]}}
                                };
                        s.datasets.dsLine1 = {rows:newZJUser}
                        self.$Indicator.open();
                        doAjaxUpdate(s,function(data) {
                            if(data.status == 0){ 
                                self.$transfer.backLogin(self, data);
                            }else if(data.status == 1){
                                self.$Indicator.close();
                                self.$transfer.showToast(self, "成功总结");
                                Tokens.save("texIsSummed",self.summedText)
                                setTimeout(function(){
                                   self.back('/taskOrderExDetail',self.texId)
                                },1000)
                            } 
                        });

                    }

                }).catch(function(){}) 
            }
        },
        getExDetail(){//获取异常详情
            let self = this;
            let s = {   action:"/tmEx/query",
                        params:{texId:self.texId}
                    };
            self.$Indicator.open();
            doAjaxQuery(s,function(data) {
                if(data.status == 0){ 
                    self.$transfer.backLogin(self, data);
                }else if(data.status == 1){
                    let obj = data.dataset.rows[0]; 
                    obj.showUserLogo = getImgURL() +'user/' +obj.createUserLogo;
                    let ImgObj = new Image(); 
                        ImgObj.src = obj.showUserLogo; 
                        ImgObj.onerror = function(){
                            obj.showUserLogo = getImgURL() + 'user/default.png';
                        }
                    self.exDetailData = obj;

                    //获取意见列表
                    self.getIdeaList();
                    self.getTexUser();

                    self.$Indicator.close();
                } 
            });
        },
        getTexUser(){//获取异常参与者
            let self = this;
            let s = {   action:'/tmExUser/query',
                        params:{"teuExId":self.texId,"delCreateUser":self.exDetailData.startExUserId}
                    };
            doAjaxQuery(s,function(data) {
                if(data.status == 0){ 
                    self.$transfer.backLogin(self, data);
                }else if(data.status == 1){
                    let obj = data.dataset.rows; 
                    if(obj && obj.length>0){
                        self.texUsers = obj;
                    }else{
                        self.texUsers = "*";
                    }
                }
               
            });

        },
        getIdeaList(){
            let self = this;
            let s = {   action:"/tmExResult/query",
                        params:{terExId:self.texId}
                    };
            if(self.summedType == 'YJ'){
                s.params.terCreateUserId = self.userId;
            }
            self.$Indicator.open();
            doAjaxQuery(s,function(data) {
                if(data.status == 0){ 
                    self.$transfer.backLogin(self, data);
                }else if(data.status == 1){
                    let obj = data.dataset.rows;
                    self.isSubmit = false;
                    if(obj && obj.length>0){
                        obj.forEach(function(item, index){
                            item.showLogo = getImgURL() +'user/' +item.terUserLogo;
                            let ImgObj = new Image(); 
                                ImgObj.src = item.showLogo; 
                                ImgObj.onerror = function(){
                                    item.showLogo = getImgURL() + 'user/default.png';
                                }
                            item.showName = item.terPayerName.length > 3 ? item.terPayerName.substring(0,3) : item.terPayerName;
                            if(item.terPayerId == self.userId){
                                self.isSubmit = true;
                            }
                            item.showTotal = item.terAmt;

                        })
                        self.summedList = obj;
                    }
                    // 默认显示发起者还是本人
                    let defaultUser = {};
                    if(self.summedType == 'ZJ'){
                        let zjUserName = self.exDetailData.texCreateUser;
                        defaultUser = {
                            terPayerId:self.exDetailData.texCreateUserId,
                            terPayerName:zjUserName, 
                            showName:zjUserName.length > 3 ? zjUserName.substring(0,3) : zjUserName,
                            terUserLogo:self.exDetailData.createUserLogo,
                            showLogo:self.exDetailData.showUserLogo,
                            terAmt:'',
                            terAmt1:'',
                            isDel:true,
                        };
                        self.summedList.unshift(defaultUser);
                        // 设置左滑效果
                        self.$nextTick(()=>{
                            setTimeout(function(){
                               self.$transfer.translationConfirm(".userInner","userDel");
                            },1000)
                        }); 
                    }else if(self.summedType == 'YJ'){
                        // self.summedList = [];
                        let yjTotal,userLogo1;
                        if(self.isSubmit){//设置金额和意见 
                            yjTotal = obj[0].terAmt;
                            self.summedText = obj[0].terText;
                            self.btnText = "修改";
                            defaultUser = self.summedList[0];
                        }else{
                            yjTotal = '';
                            self.summedText = '';
                            let yjUserName = self.token['userName'];
                            let userLogo = self.token['userLogo'];
                            userLogo1 = getImgURL() +'user/' +userLogo;
                            let userImgObj = new Image(); 
                                userImgObj.src = userLogo1; 
                                userImgObj.onerror = function(){
                                    userLogo1 = getImgURL() + 'user/default.png';
                                }
                            defaultUser = {
                                terPayerId:self.token['userId'],
                                terPayerName:yjUserName,
                                showName:yjUserName.length > 3 ? yjUserName.substring(0,3) : yjUserName,
                                terUserLogo:userLogo,
                                showLogo:userLogo1,
                                terAmt:yjTotal,
                                terAmt1:'',
                                isDel:true,
                            };
                        }
                        self.summedList = [];
                        self.summedList.unshift(defaultUser);
                    }
                }
            })
        },
        showSummedDetail(index){//显示意见详情
            let self = this;
            self.currSummed = self.summedList[index];
            self.summedPopShow = true;
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
            self.token = Tokens.fetch("token");
            self.userId = self.token["userId"];
            self.userName = self.token["userName"];
            self.sessionId = self.token["sessionId"];
            self.subSystem = self.token["subSystem"];
            self.summedPopShow = false;
            if(from.path && from.path.indexOf('add_member')!= -1 && self.exDetailData != ''){
                self.addExUserList();       
            }else{
                let idType= self.$route.params.texId.split('and');
                self.texId = idType[0];
                self.summedType = idType[1];
                self.summedText = '';
                self.summedList = [];
                self.btnText = "完成";
                if(self.summedType == 'YJ'){
                    self.summedTitle = "异常意见";
                    self.areaPlaceholder = "异常意见";
                }else if(self.summedType == 'ZJ'){
                    self.summedTitle = "异常总结";
                    self.areaPlaceholder = "异常总结";
                }
                self.getExDetail();
            }


            next()
        },
        deactivate ({ next }) {
            //Triggers when component tchOrderId
            next()
        },
        canDeactivate({to, from, next}) {
            let self = this;
            let as = document.querySelectorAll('.userInner');
            Array.from(as).forEach(function(item,index){
                item.style.WebkitTransform = "translateX(" + 0 + "px)";
            })
            next()
        },
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.summedPop{
    width:100%;
    height:100%;
    background: #ededed;
    z-index:2;
}
/*总结*/
.summedtext{
    resize: none;
    border:1px solid #e5e5e5;
    padding:0.5rem;
    border-radius:0.3rem;
    width:100%;
    box-sizing: border-box;
}
.sumUserUl{
    background: #fff;
    border-top:1px solid #e5e5e5;
}
.sumUserLi{
   border-bottom:1px solid #e5e5e5; 
   position: relative;
   height:3rem;
}
.sumUserLogo{
    width:2rem;
    height:2rem;
    border-radius: 0.3rem;
    border:1px solid #e5e5e5;
    position: absolute;
    top:0.5rem;
    left:0.5rem;
}
.sumUserName{
    /*font-size:0.6rem;*/
    position: absolute;
    width:2rem;
    top:1.05rem;
    left:2.65rem; 
}
.sumUserTotal{
    display: inline-block;
    box-sizing: border-box;
    text-align: right;
    width:45%;
    padding:0.6rem 0.4rem;
    height:2rem;
    line-height: 0.8rem;
    border:1px solid #e5e5e5;
    border-radius: 0.3rem;
    -webkit-appearance:none;
}
.sumUserMoney{
    text-align:center;
}
.sumUserMoney,.sumUserSay{
    display: inline-block;
    box-sizing: border-box; 
    width:30%;
    height:2rem;
    line-height: 2rem;
}
.sumUserSay{
    text-align: right;
    width:20%;
    text-decoration: underline;
    color:#FFD91E;
}
.summedYJtext{
    margin:0.5rem;
    padding:0.5rem;
    border:1px solid #e5e5e5;
    border-radius: 0.3rem;
    background: #fff;
    min-height: 8rem;
    overflow: scroll;
}
.YJUserMoney{
    position: absolute;
    top:0.5rem;
    left:5rem;
    box-sizing: border-box; 
    width:50%;
    height:2rem;
    line-height: 2rem;
    text-align: right;
    border:1px solid #e5e5e5;
    border-radius: 0.3rem;
    padding:0 0.3rem;
}
.user_delete{
    width:100px;
    position:absolute;
    top:0;
    right:0;
    height:2.9rem;
    line-height:2.9rem;
    text-align:center;
    background:#353535;
    color:#FFD91E;
}
.user_inner{
    width:100%;
    position: absolute;
    top:0;
    left:0;
    height:2.9rem;
    padding:0.5rem 0.5rem 0.5rem 5rem;
    background: #fff;
}
</style>
