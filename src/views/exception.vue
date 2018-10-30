<template>
    <div class="page" id="exceptionPage">
        <!-- 网页头 -->
        <mt-header fixed title="异常">
            <mt-button icon="back" slot="left" @click.stop="back('/home')"></mt-button>
            <mt-button slot="right">
                <span style="color:#FFD91E;" @click.stop="addException" class="addException">异常发起</span>
            </mt-button>
        </mt-header>

        <div class="container-top">
            <!-- 搜索框 -->
            <mysearch :value.sync="searchVal" placeholder="输入关键字查询"></mysearch>

            <!--标签页-->
            <div class="tabbar">
                <mt-navbar class="page-part" :selected.sync="selected">
                    <mt-tab-item id="all" class="">全部</mt-tab-item>
                    <mt-tab-item id="untreated">未处理</mt-tab-item>
                    <mt-tab-item id="treated">已处理</mt-tab-item>
                </mt-navbar>
            </div>

            <!--页面主体-->
            <div class="tabbar_content exception_items">
                <div class="exception_item" v-for="exItem in exceptionList" texId="{{exItem.texId}}" @click.stop="exceptionEntry_Modal" style="position:relative;">
                    <!-- 左滑删除 -->
                    <div class="left_slider" @click.stop="delExItem($index, exItem.texId)">删除</div>
                    <div class="left_lateral">
                        <div class="item_top">
                            <div class="item_top_dot">
                                <div v-if="exItem.texStatus == '0'" class="item_top_dot_circle"></div>
                                <div v-if="exItem.texStatus != '0'" class="item_top_dot_circle" style="background:#aaa;"></div>
                            </div>
                            <div class="item_top_head">
                                <img v-if="exItem.createUserLogo == '*'" src="http://tiulo-dbcon.oss-cn-hangzhou.aliyuncs.com/user/default.png" />
                                <img v-if="exItem.createUserLogo != '*'" :src="imgUrl + exItem.createUserLogo" />
                            </div>
                            <div class="item_top_name">
                                <p>{{ exItem.texCreateUser }}</p>
                            </div>
                            <div class="item_top_mark" style="float:right;">
                                <span v-if="exItem.texStatus == '0'" class="item_top_mark_cricle" style="background:#FFD91E;">未处理</span>
                                <span v-if="exItem.texStatus != '0'" class="item_top_mark_cricle">已处理</span>
                            </div>
                        </div>
                        <div class="item_center">
                            <div>主题: <span>{{ exItem.texTitle }}</span></div>
                            <div>订单号: <span>{{ exItem.texOrderIds }}</span></div>
                            <div>异常描述: <span>{{ exItem.texText }}</span></div>
                        </div>
                        <div class="item_bottom">
                            <p>{{ exItem.texCreateDate }}</p>
                        </div>
                    </div>
                </div>

            </div>

            <div class="noData">{{noData}}</div>
            <!-- 加载指示器 -->
            <div class="sw-spinner" v-if="showLoadMore">
                <mt-spinner type="snake" color="#FFD91E"></mt-spinner>
            </div>
        </div>

    </div>
</template>

<script>
    import  Mysearch  from '../components/mysearch'

    export default {
        components: {
            Mysearch
        },
        data(){
            return{
                exceptionList: [],//请求返回的数据
                searchVal: '',//搜索框的值
                selected: "all",//选中的标签页
                texStatus: "",//异常是否已经处理标识
                imgUrl: "http://tiulo-dbcon.oss-cn-hangzhou.aliyuncs.com/user/",//图片前缀
                timer: false,//是否执行定时器


            }
        },
        ready(){
            let self = this;
            //打开页面先查询所有数据
            self.queryException();
        },
        watch: {
            'selected':function(argument){
                //执行查询操作
                this.queryException();
            },
            //搜索, 内容改变就执行此方法
            'searchVal': function(){
                let self = this;
                //设置延迟执行
                if(!self.timer){
                    self.timer = true;
                    setTimeout(function(){
                        self.queryException();
                        self.timer = false;
                    },1000);
                }
            }
        },
        methods: {

             //异常发起
            addException(){
                this.$Toast("异常发起");


            },
            //点击显示异常详情页面
            exceptionEntry_Modal(){
               this.$Toast("异常详情");


            },
            //全部异常
            queryException(){
                let self = this;
                var _params;//参数变量
                //根据点击的标签传入相应的参数
                if(self.selected == "all"){//所有异常
                    _params = {findString: self.searchVal};
                }else if(self.selected == "untreated"){//未处理异常
                    _params = {"texStatus": "0", findString: self.searchVal};//0表示未处理异常
                }else if(self.selected == "treated"){//已处理异常
                    _params = {"texStatusOr": "close,summed", findString: self.searchVal};//close或summed标识已处理异常
                }

                //请求的数据参数
                var jsonData = {
                    action: "/tmEx/query",
                    params: _params,
                    showError: function(error){
                        if(typeof error != "undefined"){
                           self.$Toast({//显示错误提示
                                message: error,
                                position: "bottom",
                                duration: 5000
                           });
                        }
                    },
                };

                //查询数据
                doAjaxQuery(jsonData, function(data){
                    //consoleShow(JSON.stringify(data, null, 4));
                    if(data.status == 1){//如果后台执行成功
                        //后台返回的数据
                        var obj = data.dataset.rows;
                        //处理创建时间texCreateDate字段
                        obj.forEach(function(item, index){
                            item.texCreateDate = self.texCreateDate(item.texCreateDate);//计算过后的texCreateDate;
                        });
                        //将后台返回的数据保存到exceptionList里面
                        self.exceptionList = obj;

                        //item左滑功能
                        self.$nextTick(()=>{
                            setTimeout(function(){
                               self.$transfer.translationDel(".left_lateral");
                            },1000)
                        });

                    }
                });
            },
            //删除一条异常数据
            delExItem(key, delId){
                let self = this;
                //点击删除按钮不再打开 异常详情 页面
                event.stopPropagation();
                //弹出确认对话框
                self.$MessageBox.confirm('您确定删除该条数据吗?').then(action => {//点击对话框的"确认"执行的代码
                    //请求的数据
                    var jsonData = {
                        action: "/tmEx/del/" + delId,
                        showError: function(error){
                            if(typeof error != "undefined"){
                               self.$Toast("操作失败");
                            }
                        },
                    };
                    //执行删除数据操作
                    doAjaxUpdate(jsonData, function(data){
                        //consoleShow(JSON.stringify(data, null, 4));
                        if(data.status == 1){
                            //数据库删除之后, 删除页面上的数据
                            self.exceptionList.splice(key, 1);
                        }
                    });

                });
            },
            //处理创建异常的时间(即右下角的时间)
            texCreateDate(_date){//_date格式2016-12-02 10:34:51 426
                var createDate = new Date(_date.replace(/-/g,"/").substring(0,19));
	   			return initDate(getDateTimeForDate(createDate));
            },
            go (link, param) {
                let self = this;
                self.$transfer.go(self, link, param);
            },
            back (link, param) {
                let self = this;
                self.$transfer.back(self, link, param);
            }
        },
        route: {
            deactivate ({ next }) {
                let as = document.querySelectorAll('.left_slider');
                Array.from(as).forEach(function(item,index){
                    item.style.WebkitTransform = "translateX(" + 0 + "px)";
                })
                next()
            },
        }
    }

</script>

<style scoped>
    .left_slider{
        width: 5rem;
        height: 5.95rem;
        line-height: 5.95rem;
        text-align: center;
        background: #DD524D;
        color: #fff;
        position: absolute;
        right: 0.05rem;
    }
    .left_lateral{
        width: 100%;
        position: absolute;
        top: 0;
        left: 0;
        background: #fff;
        z-index: 999;
    }

    /* font-family:"微软雅黑"; */
    *{
        font-family:'微软雅黑';
    }
    .addException{
        padding: 0.25rem 0.5rem;
        background: #353535;
        border-radius: 5px;
        color: #FFD91E;
    }
    .noData{
        text-align:center;
        padding: 0.5rem 0;
        font-family:'微软雅黑';
    }
    /*标签体*/
    .tabbar_content{
        width: 100%;
        height: auto;
        padding-top: 0.75rem;
        /*margin-top: 5rem;*/
    }
    .exception_item{
        width: 100%;
        height: 7rem;
        border-bottom: 1px solid #ccc;
        background: #fff;
    }
    .exception_item:last-child{
        border-bottom: 0px;
    }
    .item_top{
        width: auto;
        height: 2.5rem;
    }
    .item_top > div{
        height: 2.5rem;
        float: left;
    }
    .item_top_dot{
        width: 2rem;
        line-height: 2.5rem;
    }
    .item_top_dot_circle{
        height: 0.9rem;
        width: 0.9rem;
        background: #FFD91E;
        border-radius:50%;
        margin-top: 0.75rem;
        margin-left: 0.5rem;
    }
    .item_top_head{
        width: 2.1rem;
        line-height: 2.5rem;
        text-align: center;
    }
    .item_top_head img{
        width: 1.9rem;
        margin-top: 0.3rem;
    }
    .item_top_name{
        width: 45%;
        text-align:top;
        padding-top: 0.25rem;
    }
    .item_top_mark{
        width: 3rem;
        text-align:right;
        padding-right: 0.25rem;
        padding-top: 1.25rem;
    }
    .item_top_mark_cricle{
        height:1.5rem;
        background: #f0f0f0;
        padding: 0.15rem 0.25rem;
        border-radius: 4px;
        font-size: 0.65rem;
    }
    .item_center{
        font-family:'微软雅黑';
        padding-left: 0.75rem;
        padding-right: 0.25rem;
        padding-top: 0.15rem;
        padding-bottom: 0.15rem;
    }
    .item_center > div{
        overflow: hidden;
        text-overflow:ellipsis;
        white-space: nowrap;
    }
    .item_center_delBtn{
        text-align: right;
    }
    .item_center_delete{
        width: 2.5rem;
        text-align: center;
        display: inline-block;
        background: #353535;
        border-radius: 5px;
        color: #FFD91E;
    }

    .item_bottom{
        text-align: right;
        padding-right: 0.5rem;
        font-family:'微软雅黑';
        font-size: 0.6rem;
        color: #777;
    }

    /*标签页*/
    .tabbar{
        width: 100%;
        height: 2.2rem;
        border-bottom: 1px solid #ccc;
    }

    /*搜索框*/
    .searchBox{
        box-sizing:border-box;
        padding: 0.5rem;
        position: relative;
    }
    .searchInput{
        box-sizing:border-box;
        width:100%;
        padding:0 0.5rem;
        padding-right:4.5rem;
        border: 1px solid #e5e5e5;
        border-radius: 0.3rem;
        height:2rem;
        line-height: 2rem;
        font-family:"微软雅黑";
    }
    .searchBtn{
        position: absolute;
        right:0.5rem;
        top:0.5rem;
        width:4rem;
        text-align: center;
        height:2rem;
        line-height: 2rem;
        background: #383a40;
        border-radius: 0 0.3rem 0.3rem 0;
    }



</style>





