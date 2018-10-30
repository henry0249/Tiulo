<template>
    <div class="page">
        <!-- Header -->
        <mt-header fixed title="Tiulo">
            <div slot="right" @click="go('/')">
            <span style="padding:0.4rem" slot="icon" class="iconfont">&#xe602;</span>
            </div>
        </mt-header>
        <div class="container-top" style="padding-bottom:3.5rem">

            <!-- 功能模块 -->
            <div class="plate_box" id="plate_box">

                <div :style="{width:plateW + 'px',height:plateH + 'px',paddingTop:plateCTop + 'px'}" v-for="project in projectLists" class="plate" @click="go(project.accessUrl)">
                    <div style="height:3.5rem;"><i class='iconfont' :style="{color:project.color}">{{{project.icoFont}}}</i>
                    <p>{{project.title}}</p>
                    </div>
                    
                </div>
                
            </div>          
        </div>
    </div>
</template>

<script>
// Ajax request module, return a Promise
import * as actions from '../vuex/actions'

export default {

	data () {
        return {
            projectLists:[
                        {"title":"车辆管理","icoFont":"&#xe607;","accessUrl":"/truckList","color":"#FBC168"},
                        {"title":"订单分单","icoFont":"&#xe622;","accessUrl":"/orderList","color":"#56B897"},
                        {"title":"订单跟踪","icoFont":"&#xe60a;","accessUrl":"/order_track","color":"#81ADFC"},
                        {"title":"对帐管理","icoFont":"&#xe604;","accessUrl":"/tiulo","color":"#DE203C"},
                        {"title":"扫码","icoFont":"&#xe606;","accessUrl":"/more","color":"#FBC168"},
                        {"title":"异常","icoFont":"&#xe608;","accessUrl":"/exception","color":"#DE203C"}
                        ],
            plateW:"",//项目模块的宽
            plateH:"",//项目模块的高
            plateCTop:"",//内容的top值
            helpShow:false, //是否显示帮助    
        }
    },
    ready(){
        let self = this;
        //设置一些初始宽高
        //let width = window.screen.width;
        let width = document.getElementById("plate_box").offsetWidth;
        self.plateW = parseFloat(width)*0.84/3;
        self.plateH = self.plateW;
        self.plateCTop = (self.plateH - 72)/2;  

    },
    methods: {
        go (link, param) {
            let self = this
            self.$transfer.go(self, link, param)
        },
        back (link, param) {
            let self = this
            self.$transfer.back(self, link, param);
        }
    },
    route: {
        data ({ to, next }) {
            let self = this;
            next()
        },
        deactivate ({ next }) {
          //Triggers when component destroys
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

.plate_box{
    padding-left:4%;
    padding-top:0.5rem;
    padding-bottom:3.5rem;
    overflow: hidden;
}
.plate{
    float:left;
    text-align: center;
    margin-right:4%;
    margin-bottom:0.5rem;
    background:#fff;
    font-size: 0.6rem;
    border:1px solid #e8e8e8;
    border-radius: 0.3rem;
    box-shadow:2px 2px #EEE;
}
.plate .iconfont{
    font-size: 1.5rem;
}
</style>
