<template>
	<div class="content-box">
		<!-- 第一个 -->
		<div>
			<div class="contents" v-for="(index,detail) in details">
				<div class="single" :id="detail.cmfEN==='#'?'TS':detail.cmfEN">{{detail.cmfEN}}</div>
				<div class="cont-name" v-for="val in detail.name" track-by="$index" @click.stop="optfor(index,$index,val)">
					<div class="selct" :id="index+'-'+$index" :class="{selcted:val.show == 0?true:false}"></div>
					<img :src="val.suLogo" class="logoimg">
					<div class="matter">{{val.suName}}</div>
					<div class="iconfont icon_sexM" v-show="val.suSex=='男'">&#xe60b;</div>
                    <div class="iconfont icon_sexG" style="color:#FD626E;" v-show="val.suSex=='女'">&#xe60d;</div>
                    <div class="icon_sexG" style="width:1rem;height:2rem;" v-show="val.suSex=='*'"></div>
                    <div class="iconSet" v-show="val.suIsCustomer == 1">企</div>
                    <div class="iconSet" v-show="val.suIsTMS == 1">运</div>
                    <div class="iconSet" v-show="val.suIsDriver == 1">车</div>
					<span class="rg iconfont" :style="{marginRight:letterW + 'px'}">&#xe60e;</span>
				</div>
			</div>
		</div>
		<!-- <div class="letters" :class="{bgcolor:bgcolor}" :style="{height:letterH + 'px',width:letterW + 'px'}">
			<span class="touches" :style="{height:letterW + 'px',width:letterW + 'px'}" v-for="item in Letters">{{item}}</span>
		</div> -->
	</div>
</template>
<script>
import Tokens from '../../../token'
import { Toast } from 'mint-ui'
export default {
	props: {
    	details:{
    		type:Array,
    		required: true,
    	},
    	pitchup:Array,
    	uptop:Number,//距离头部的高度
  	},
	data () {
	    return {
	    	letterH:'',
	    	letterW:'',
	    	contW:'',
	    }
	},
	ready(){
		let self = this;
		console.log(self.uptop)
		let letterH = Tokens.fetch('contentHeight')-100-57;//字母模块的高度
		let contW = Tokens.fetch('contentWidth');//屏幕的宽度
		self.letterH = letterH;
		self.letterW = parseFloat(letterH/27);//每个字母的宽高
		self.contW = contW - self.letterW;//除去字母的宽度所剩下的宽度
	},
	methods:{
	    choiceimg(index,item){
	    	console.log(item)

	    	this.$dispatch('choiceimg',item.suLogo,item.cmfNickName2)
	    },
	    optfor(a,index,item){
	    	let self = this;
	    	//列表若有点击跳转事件，在下拉时阻止点击跳转
            let isStop = isXLorClick();
            if(isStop){
                return;
            }
	    	if($("#"+a+'-'+index).is('.selcted')){
	    		$("#"+a+'-'+index).removeClass('selcted');
	    		item.show = 1;
	    		self.pitchup.splice($.inArray(item,self.pitchup),1);
	    	}else{
	    		$("#"+a+'-'+index).addClass('selcted');
	    		item.show = 0;
	    		self.pitchup.push(item)
	    		console.log(item)
	    	}
	    	console.log(self.pitchup)
	    	this.$dispatch('optfor',a,index,item,self.pitchup)
	    },
	}
}
</script>
<style scoped>
	.content-box{
		position: relative;
	}
	.nodata{
	    text-align:center;margin:0.5rem 0;
	}
	/*内容部分*/
	.contents{
		width:100%;
	}
	.single{/*单个字母*/
		height:1rem;
		line-height: 1rem;
	}
	.single,.cont-name{
		padding:0 .5rem;
		/*margin:0 .5rem;*/
	}
	.cont-name{
		height:2rem;
		line-height: 2rem;
		background-color: #fff;
		margin-bottom: .25rem;
	}
	.matter{
		float:left;
		margin-left: .5rem;
		width:20%;
		white-space:nowrap; 
		text-overflow:ellipsis; 
		overflow: hidden;
	}
	/*字母部分*/
	.letters{
		position: fixed;
		top:100px;
		right:0;
		z-index: 10;
		border-radius: .4rem;
	}
	.letters span{
		display: block;
		text-align: center;
		font-size:.5rem;
	}
	.rg{
		float:right;
		color:#FFD91E;
	}
	.current{
		width:2rem;
		height:2rem;
		border-radius: 5px;
		background-color: #333;
	}
	.touches{
		background-color: transparent;
	}
	.bgcolor{
		background-color: #aaa;
	}
	.logoimg{
		float:left;
		height:1.5rem;
		margin-top: .25rem;
	}

	.selct{
		float: left;
		margin-top: .55rem;
		margin-right:.5rem;
		width:.9rem;height:.9rem;
		border-radius: .9rem;
		border:2px solid #aaa;
	}
	.selcted{
		background-color: #FFD91E;
	}
	.icon_sexM,.icon_sexG{
		float:left;
		margin-left: .5rem;
	}
	.icon_sexM{color:#1B93FF;}
	.icon_sexG{color:#FD626E;}
	.iconSet{
        float:left;
        background-color: #000;
        color:#fff;
        width:1rem;height:1rem;
        line-height: 1rem;
        text-align: center;
        border-radius: 4px;
        margin-left: .4rem;
        margin-top:.5rem;
    }
</style>