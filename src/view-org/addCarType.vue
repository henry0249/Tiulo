<template>
	<div class="page">
		<mt-header fixed :title="title">
            <mt-button icon="back" slot="left" @click="backLast()"></mt-button>
            <mt-button slot="right" @click="additionCar()">添加</mt-button>
        </mt-header>
        <div class="container-top" id="carType">
            <div v-if="!noAnyCar" style="margin-top:1rem;">
                <div v-for="item in cars" class="car_infor">{{item.name}}-{{item.type}}</div>
            </div> 
            <div class="noCar" v-if="noAnyCar" :style="{height:noCarHeight+'px',lineHeight:noCarHeight+'px'}">还没有车辆类型,请添加</div>
            <div class="creat_box">
                <button class="creat_finish" @click.stop="creatFinish()">完成</button>
            </div>
        </div>
        <mt-popup position="bottom" :visible.sync="addCarShow" :modal="true" popup-transition="popup-slide" id="cargo_type">
            <mt-header fixed>
                <button slot="left" class="cancel" @click.stop="cancel()">取消</button>
                <button slot="right" class="confirm" @click.stop="confirm()">确定</button>
            </mt-header>
            <div class="container-top">
                <mt-picker :slots="addCarSlots" track-by="$index" @change="onAddCarChange" :visible-item-count="7"></mt-picker>
            </div>
        </mt-popup>
    </div>
</template>
<script>
import Tokens from '../token'
export default {
    data () {
        return{
        	toke:'',//本地token的值
        	pathWay:'',//路径的保存
            title:'',//头部信息
            versions:'',//当前是哪个版本
            versionTP:false,
            versionOSP:false,
            versionEP:false,
            versionBSP:false,
            noCarHeight:0,//没有车辆信息的字样
            noAnyCar:true,//有没有车辆信息显示状况
            // 添加车辆pop
            addCarShow:false,//pop框的显示与隐藏
            addCarSlots:[{
                    flex: 1,
                    values: ['请选择车辆类型','面包车','平板','高栏','箱式','集装箱','危险品','冷藏','保温','其他'],
                    className: 'slot1',
                    textAlign: 'center',
                }, {
                    flex: 1,
                    values: ['请选择车辆长度','4.2米','5.0米','6.2米','6.8米','7.2米','7.7米','7.8米','8.2米','8.7米','9.6米','12.5米','13.0米','15.0米','16.0米','17.5米',],
                    className: 'slot2',
                    textAlign: 'center',
                }
            ],
            cars:[],//生成的车辆信息
            arr:[],//暂时保存的车辆信息
        }
    },
    watch:{
        'cars':function(e){
            let self = this;
            if(e.length == 0){
                self.noAnyCar = true;
            }else{
                self.noAnyCar = false;
            }
        }
    },
    ready(){
        let self = this;
        //列表框的最小高度
        self.$nextTick(()=>{
            self.noCarHeight = $("#carType").height() - 40;
        })
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
        backLast(){//返回页面
            let self = this;
            self.back(self.pathWay)
        },
        additionCar(){//添加车辆按钮
            let self = this;
            self.addCarShow = true;
        },
        onAddCarChange(picker, values){
            let self = this;
            self.arr = values;
        },
        //pop取消与确认按钮
        cancel(){//取消框
            let self = this;
            self.addCarShow = false;
        },
        confirm(){//确定框
            let self = this;
            if(self.arr && self.arr.length>0){
                if(self.arr[0] == '请选择车辆类型'){
                    self.$transfer.showToast(self, "请选择车辆类型", "center", 1500);
                    return;
                }else if(self.arr[1] == '请选择车辆长度'){
                    self.$transfer.showToast(self, "请选择车辆长度", "center", 1500);
                    return;
                }else{
                    let obj = {name:self.arr[0],type:self.arr[1]};
                    self.cars.push(obj)
                    self.addCarShow = false;
                }
            }else{
                self.$transfer.showToast(self, "请选择车辆信息", "center", 1500);
                return;
            }
        },
        creatFinish(){//完成按钮
            let self = this;
            Tokens.save('carTypeData',self.cars)
            self.back(self.pathWay)
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
            self.toke = localStorage.getItem("token");
            self.version = Tokens.fetch("bdSubSystem2");//当前版本号
            // 版本号判断
            if(self.version == 'TP'){
                self.versionTP = true;
            }else if(self.version == 'OSP'){
                self.versionOSP = false;
            }else if(self.version == 'EP'){
                self.versionEP = true;
            }else if(self.version == 'BSP'){
                self.versionBSP = false;
            }
            if(from.path){//判断进入路径
                Tokens.save('perfectInforPath',from.path);
                self.pathWay = from.path;
            }else{
                self.pathWay = Tokens.fetch('perfectInforPath');
            }
            if(self.pathWay.indexOf('perfectInformation') == 1){
                self.title = "添加车辆类型";
                let cars = Tokens.fetch('carTypeData');
                if(cars.length == 0){
                    self.cars = [];
                }else{
                    self.cars = cars
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
        width: 100%;height: 50%;background: #f1f1f1;z-index: 2;
    }
    .creat_box{
        width:70%;
        position: fixed;
        bottom:2rem;
        left:15%;
        text-align:center;
    }
    .creat_finish{
        width:100%;
        height:2.3rem;
        border:none;
        font-size:0.7rem;
        background-color: #3d3d3d;
        color:#FFD91E;
        border-radius: .2rem;
    }
    .noCar{
        width: 100%;
        text-align: center;
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
    .car_infor{
        width:100%;height:2.5rem;
        line-height: 2.5rem;
        font-size:.8rem;
        padding-left:1rem;
        background-color: #fff;
        border-bottom:1px solid #cdcdcd;
    }
</style>