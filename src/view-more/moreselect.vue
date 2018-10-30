<template>
	<div class="page">
		<mt-header fixed :title="headline">
            <mt-button icon="back" slot="left" @click="backLast()"></mt-button>
            <mt-button slot="right" @click="pleteSub()">完成</mt-button>
        </mt-header>
        <div class="container-top">
            <my-more-select :arrdata.sync="arrData" :pitchup="subData"></my-more-select>
        </div>
    </div>
</template>
<script>
import Tokens from '../token'
import myMoreSelect from '../components/mymoreselect'
export default {
    components: {
        myMoreSelect
    },
    data () {
        return{
        	toke:'',//本地token的值
        	pathWay:'',//路径的保存
            header:{},//传递的数据
            headline:'',//头部标题
            arrData:[],//传输的数组
            subData:[],//提交的数组
            showData:[],

            ability:["专线","城配","快运","快递","车队","3PL","O2O","冷驾车","危险品","特殊",],//运力类型
            serves:["通信设备/电子产品/仪器仪表","原材料(橡胶类、能源类等)","机械/设备/重工","汽车及零配件","化工类","医药/医用设备","印刷/包装/造纸","建材/装饰材料","家具/家电","服装/纺织/皮革","玩具/礼品","快速消费品(食品、饮料、日化等)","农副产品","自定义"],//服务类型
        }
    },
    watch:{
        arrData:function(e){
            console.log(e)
        }
    },
    events:{
        optfor(key,val,arr,list){
            let self = this;
            self.subData = arr;
            self.arrData = list;
            console.log(JSON.stringify(arr))
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
            self.subData = [];
            console.log(self.header)
            if(self.header.name == "YL"){
                Tokens.save("selectCapacityType","请选择")
            }else if(self.header.name == "FW"){
                Tokens.save("selectServesType","请选择")
            }
            self.back(self.pathWay);
        },
        pleteSub(){//完成提交
            let self = this;
            if(self.header.name == "YL"){
                console.log(self.subData)
                console.log(self.arrData)
                // Tokens.save("selectCapacityType",self.subData)
                Tokens.save("capacityTypeData",self.arrData)
            }else if(self.header.name == "FW"){
                console.log(self.subData)
                Tokens.save("selectServesType",self.subData)
            }
            // self.back(self.pathWay);
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
            self.arrData = [];
            self.subData = [];
            self.header = Tokens.fetch("moreSelectType")
            if(self.header.name == "YL"){//运力类型
                self.headline = "选择运力类型";
                for(let key in self.ability){
                    let list = {name:self.ability[key],status:0}
                    self.arrData.push(list)
                }
            }else if(self.header.name == "FW"){//服务类型
                self.headline = "选择服务对象";
                let addPitch = Tokens.fetch("addPitchArray")
                for(var key in self.serves){
                    let list = {name:self.serves[key],status:0}
                    self.arrData.push(list)
                }
                if(addPitch.length != 0){
                    for(let k=0;k<addPitch.length;k++){
                        self.arrData.splice(self.arrData.length-1, 0, addPitch[k])
                    }
                }
                if(self.header.values == '请选择'){
                    Tokens.save("selectServesType",'')
                }else{
                    let arr = self.header.values.split(',')
                    arr.pop();
                    for(let key in arr){
                        for(let i=0;i<self.arrData.length;i++){
                            if(arr[key] == self.arrData[i].name){
                                self.arrData[i].status = 1;
                            }
                        }
                    }
                }
            }
            if(from.path){//判断进入路径
                Tokens.save('moreSelectPath',from.path);
                self.pathWay = from.path;
            }else{
                self.pathWay = Tokens.fetch('moreSelectPath');
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
</style>