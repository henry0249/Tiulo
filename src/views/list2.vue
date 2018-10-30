<template>
    <div class="page">
        <!-- Header -->
        <mt-header fixed title="购物车">
            <mt-button icon="back" slot="left" @click="back('/orderList')"></mt-button>
            <mt-button slot="right">
                <span @click="addlist()">新增</span>
            </mt-button>
        </mt-header>

        <div class="container-top" style="padding-bottom:3.5rem;">
            <!-- <a class="media" href="http://localhost:7000/_wl/fin/finpdf.html?orderIds=TGX1612230010&type=trucklist">PDF File</a>  -->
            <div>
                <checkshop
                    :value.sync="value"
                    :options="options">
                </checkshop>
            </div>
        </div>
        <div class="sub_box">        
            <div class="allcircle {{isCheck == true ?'bg-yellow':'bg-white'}}" @click="clickAll()">
            </div><span style="margin-left:1.5rem;">全选</span>
            <p class="subBtn" size="small">去结算（{{checkNum}}）</p>
            <p style="float:right;">实付额：{{factTotal}}元</p>
        </div>
    </div>
</template>

<script>
// Ajax request module, return a Promise
import Tokens from '../token'
import * as actions from '../vuex/actions'
import  Checkshop  from '../components/checkshop'
export default {
    data () {
        return {
            value:[],
            isCheck:false,
            factTotal:0,
            checkNum:0,
            options:[
                  {
                    proId:"0",proudutName:'洗车宝自动洗',size:"小号",price:"260.00",number:"1",imgShow:true
                  },
                  {
                    proId:"1",proudutName:'洗车宝自动洗',size:"小号",price:"260.00",number:"1",imgShow:false
                  },        
                  
                ],
            addData:{
                    proId:"0",proudutName:'洗车宝自动洗',size:"小号",price:"260.00",number:"1",imgShow:true
                    }

        }
    },
    ready(){
        let self = this;

        $('a.media').media({width:Tokens.fetch("contentWidth"), height:Tokens.fetch("contentHeight")}); 
 
        self.$nextTick(()=>{
            self.translationDel();
            
        })

    },
    watch:{
        'value':function valueChange(argument) {
            let self = this;
            if(argument.length == self.options.length && argument.length!=0){
                self.isCheck = true;
            }else{
                self.isCheck = false;
            }
            self.computedTotal();

        }
    },
    events:{
        'deleteCard':function(key){
            let self = this
            this.options.splice(key, 1);
            let as = document.querySelectorAll('.product_box');
            Array.from(as).forEach(function(item,index){
                item.style.WebkitTransform = "translateX(" + 0 + "px)";
            })
            self.computedTotal();
        },
        'minusNumber':function(key){
            let self = this;
            let num = parseInt(this.options[key].number);
            if(num>1){
                this.options[key].number --;
            }else{
                return;
            }
            self.computedTotal();

        },
        'plusNumber':function(key){
            let self = this
            let num = parseInt(this.options[key].number);
            if(num<999){
                this.options[key].number ++;
            }else{
                return;
            }
            self.computedTotal();
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
        clickAll(){//全选
            let self = this;
            if(!self.isCheck){
                self.isCheck = true;
                self.value = self.options.filter(function(argument) {
                    return true
                });
            }else{
                self.isCheck = false;
                self.value = [];
            }
            consoleShow(self.value);
        },
        addlist(){
            let self = this;
            self.options.push(self.addData);
            self.$nextTick(()=>{
                self.translationDel();
                
            })

        },
        computedTotal(){
            let self = this;
            self.checkNum = self.value.length;
            let sTotal = 0;
            for(var i=0;i<self.value.length;i++){
                let price = parseFloat(self.value[i].price);
                let num = parseFloat(self.value[i].number);
                let valTotal = price*num;
                sTotal += valTotal;
                consoleShow();
            }
            self.factTotal = sTotal.toFixed(2);
        },
        translationDel(){
            var startPos = '';
            var endPos = '';
            var isScrolling ='';//这个参数判断是垂直滚动还是水平滚动
            var index = ''; //索引

            var initX; //触摸位置
            var moveX; //滑动时的位置
            var X = 0; //移动距离
            var objX = 0; //目标对象位置
            var left;
            var as = document.querySelectorAll('.product_box');
            Array.from(as).forEach(function(item,index){
                item.addEventListener("touchstart",function(event){
                    var touch = event.targetTouches[0];     //touches数组对象获得屏幕上所有的touch，取第一个touch
                    startPos = {x:touch.pageX,y:touch.pageY,time:+new Date};    //取第一个touch的坐标值
                    left= (this.style.WebkitTransform.replace(/translateX\(/g, "").replace(/px\)/g, "")) * 1;
                    initX = event.targetTouches[0].pageX;
                    isScrolling = 0;   //这个参数判断是垂直滚动还是水平滚动
                });
                item.addEventListener("touchmove",function(event){
                    //当屏幕有多个touch或者页面被缩放过，就不执行move操作
                    if(event.targetTouches.length > 1 || event.scale && event.scale !== 1) return;

                     Array.from(as).forEach(function(item,i){
                        if(index != i){
                            item.style.WebkitTransform = "translateX(" + 0 + "px)";
                        }
                     })
                    var touch = event.targetTouches[0];
                    endPos = {x:touch.pageX - startPos.x,y:touch.pageY - startPos.y};
                    isScrolling = Math.abs(endPos.x) < Math.abs(endPos.y) ? 1:0;    //isScrolling为1时，表示纵向滑动，0为横向滑动
                    if(isScrolling === 0){
                        event.preventDefault();
                        if (left == 0) {
                            moveX = event.targetTouches[0].pageX;
                            X = moveX - initX;
                            if (X >= 0) {
                                this.style.WebkitTransform = "translateX(" + 0 + "px)";
                            } else if (X < 0) {
                                var l = Math.abs(X);
                                this.style.WebkitTransform = "translateX(" + -l + "px)";
                                if (l > 100) {
                                    l = 100;
                                    this.style.WebkitTransform = "translateX(" + -l + "px)";
                                }
                            }
                        }else if (left < 0) {
                            moveX = event.targetTouches[0].pageX;
                            X = moveX - initX;
                            if (X >= 0) {
                                var r = -100 + Math.abs(X);
                                this.style.WebkitTransform = "translateX(" + r + "px)";
                                if (r > 0) {
                                    r = 0;
                                    this.style.WebkitTransform = "translateX(" + r + "px)";
                                }
                            } else { //向左滑动
                                this.style.WebkitTransform = "translateX(" + -100 + "px)";
                            }
                        }
                    }
                });
                item.addEventListener("touchend",function(event){
                    left = (this.style.WebkitTransform.replace(/translateX\(/g, "").replace(/px\)/g, "")) * 1;
                    if (left > -50) {
                        this.style.WebkitTransform = "translateX(" + 0 + "px)";
                        left = 0;
                    } else {
                        this.style.WebkitTransform = "translateX(" + -100 + "px)";
                        left = -100;
                    }
                });
            }) 
        }
    },
    route: {
        data ({ to, next }) {
            let self = this;

            next()
        },
        deactivate ({ next }) {
            let as = document.querySelectorAll('.product_box');
            Array.from(as).forEach(function(item,index){
                item.style.WebkitTransform = "translateX(" + 0 + "px)";
            })
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
    },
    components: {
        Checkshop
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    .product{
        padding:0.5rem;
        background:#fff;
        overflow:hidden;
        border-bottom:1px solid #e5e5e5;
    }
    .product_content{
        width:50%;float:left;
    }
    .product_content li{
        height:1.3rem;
        line-height: 1.3rem;
        overflow:hidden;
        white-space:nowrap;
        text-overflow:ellipsis; 
    }
    .caigou.mint-button--default{
        margin-top:1.2rem;color:#ff8827;border:1px solid #ff8827;
        box-shadow: none;
    }
.sub_box{
    position:absolute;
    bottom:0;
    width:100%;
    font-size: 0.7rem;
    background: #fff;
    padding-left:0.5rem;
    height:2.5rem;
    line-height: 2.5rem;
    color:#666;
}
.subBtn{
    float:right;
    background:#ff8827;
    border:none;
    color:#fff;
    margin-left:0.8rem;
    padding:0 0.5rem;
}
.bg-yellow{
    background:#f60;
    border:1px solid #f60;
}
.bg-white{
    background:#fff;
    border:1px solid #999;
}
.allcircle{
    width:1rem;height:1rem;border:1px solid #ff8827;border-radius:0.5rem;position:absolute;top:0.75rem;
}
</style>
