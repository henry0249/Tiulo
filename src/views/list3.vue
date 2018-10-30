<template>
    <div class="page">
        <!-- Header -->
        <mt-header fixed title="测试图表">
            <mt-button icon="back" slot="left" @click="back('TMStaskList')"></mt-button>
        </mt-header>

        <div class="container-top" style="padding-bottom:3.5rem;">
          <div id="main" style="width:100%;height:16rem;padding:0.5rem"></div>

        </div>
    </div>
</template>

<script>
// Ajax request module, return a Promise  
import Tokens from '../token'
export default {
    data () {
        return {


        }
    },
    ready(){
        let self = this;
        // 基于准备好的dom，初始化echarts实例
        let myChart = self.$Echarts.init(document.getElementById('main'));
        // // 绘制图表
        myChart.setOption({
            // title : {
            //     text: '某地区蒸发量和降水量',
            //     subtext: '纯属虚构'
            // },
            tooltip : {
                trigger: 'axis'
            },
            legend: {
                data:['订单数','重量','体积']
            },
            toolbox: {
                show : true,
                feature : {
                    mark : {show: true},
                    dataView : {show: true, readOnly: false},
                    magicType : {show: true, type: ['line', 'bar']},
                    restore : {show: true},
                    saveAsImage : {show: true}
                }
            },
            calculable : true,
            xAxis : [
                {
                    type : 'category',
                    data : ['1月','2月','3月','4月','5月','6月']
                }
            ],
            yAxis : [
                {
                    type : 'value'
                }
            ],
            //每一栏的数据
            series : [
                {
                    name:'订单数',
                    type:'bar',
                    data:[2.0, 4.9, 7.0, 23.2, 25.6, 76.7],
                    markPoint : {
                        data : [
                            {type : 'max', name: '最大值'},
                            {type : 'min', name: '最小值'}
                        ]
                    },
                    markLine : {
                        data : [
                            {type : 'average', name: '平均值'}
                        ]
                    }
                },
                {
                    name:'重量',
                    type:'bar',
                    data:[2.6, 5.9, 9.0, 26.4, 28.7, 70.7],
                    markPoint : {
                        data : [
                            {name : '年最高', value : 182.2, xAxis: 7, yAxis: 183, symbolSize:18},
                            {name : '年最低', value : 2.3, xAxis: 11, yAxis: 3}
                        ]
                    },
                    markLine : {
                        data : [
                            {type : 'average', name : '平均值'}
                        ]
                    }
                },
                {
                    name:'体积',
                    type:'bar',
                    data:[2.6, 5.9, 9.0, 26.4, 28.7, 70.7],
                    markPoint : {
                        data : [
                            {name : '年最高', value : 182.2, xAxis: 7, yAxis: 183, symbolSize:18},
                            {name : '年最低', value : 2.3, xAxis: 11, yAxis: 3}
                        ]
                    },
                    markLine : {
                        data : [
                            {type : 'average', name : '平均值'}
                        ]
                    }
                }
            ],
            //控制边距　
            // grid: {
            //         left: '5%',
            //         right:'10%',
            //         containLabel: true,
            // },
        });

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
            let self = this;
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

</style>
