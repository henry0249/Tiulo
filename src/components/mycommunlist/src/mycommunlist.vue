<template>
	<div class="content-box">
		<div v-if="state == 'xs'">
			<div class="contents" v-for="(index,detail) in details">
				<div class="single" :id="detail.cmfEN==='#'?'TS':detail.cmfEN">{{detail.cmfEN}}</div>
				<div class="cont-name" v-for="val in detail.name" track-by="$index">
					<div class="deleteCard" @click.stop="deleteGroup($index,val)">删除</div>
					<div @click.stop="particulars(index,$index,val)">
						<!-- <img :src="val.suLogo" class="logoimg"> -->
						<div class="logoimg">
		                    <img :src="val.suLogo" style="width:1.5rem;vertical-align:middle;">
		                </div>
						<div class="matter">{{val.cmfNickName2}}</div>
						<div class="iconfont icon_sexM" v-show="val.suSex=='男'">&#xe60b;</div>
	                    <div class="iconfont icon_sexG" style="color:#FD626E;" v-show="val.suSex=='女'">&#xe60d;</div>
	                    <div class="icon_sexG" style="width:1rem;height:2rem;" v-show="val.suSex=='*'"></div>
	                    <div class="iconSet" v-show="val.suIsCustomer == 1">企</div>
	                    <div class="iconSet" v-show="val.suIsTMS == 1">运</div>
	                    <div class="iconSet" v-show="val.suIsDriver == 1">车</div>
						<div class="rg" @click.stop="choiceimg(index,$index,val)" v-if="nodata == 'android'">
	                    	<div @click.stop="phoneTel(val.suMobile)" class="lf"><span class="mobile">{{val.suMobile}}</span></div>
	                    	<div class="rg"><span class="iconfont" :style="{marginRight:letterW + 'px'}">&#xe60e;</span></div>
	                    </div>
	                    <div class="rg" @click.stop="choiceimg(index,$index,val)" v-else="nodata != 'android'">
	                    	<a class="mobile" :href="'tel:'+val.suMobile">{{val.suMobile}}</a>
	                    	<span class="iconfont" :style="{marginRight:letterW + 'px'}">&#xe60e;</span>
	                    </div>
					</div>
						
				</div>
			</div>
		</div>
		
		<!-- 第一个 -->
		<div>
			<div class="contents" v-for="(index,detail) in details">				
				<div class="single" :id="detail.cmfEN==='#'?'TS':detail.cmfEN">{{detail.cmfEN}}</div>
				<div class="cont-name" v-for="val in detail.name" track-by="$index">
					<div class="deleteCard" @click.stop="deleteGroup(index,$index,val)">删除</div>
					<div class="updata"  @click.stop="particulars(index,$index,val)">
						<!-- <img :src="val.suLogo" class="logoimg"> -->
						<div class="logoimg">
		                    <img :src="val.suLogo" style="width:1.5rem;vertical-align:middle;">
		                </div>
						<div class="matter">{{val.cmfNickName2}}</div>
						<div class="iconfont icon_sexM" v-show="val.suSex=='男'">&#xe60b;</div>
	                    <div class="iconfont icon_sexG" style="color:#FD626E;" v-show="val.suSex=='女'">&#xe60d;</div>
	                    <div class="icon_sexG" style="width:1rem;height:2rem;" v-show="val.suSex=='*'"></div>
	                    <div class="iconSet" v-show="val.suIsCustomer == 1">企</div>
	                    <div class="iconSet" v-show="val.suIsTMS == 1">运</div>
	                    <div class="iconSet" v-show="val.suIsDriver == 1">车</div>
	                    <div class="rg" @click.stop="choiceimg(index,$index,val)" v-if="nodata == 'android'">
	                    	<div @click.stop="phoneTel(val.suMobile)" class="lf"><span class="mobile">{{val.suMobile}}</span></div>
	                    	<div class="rg"><span class="iconfont" :style="{marginRight:letterW + 'px'}">&#xe60e;</span></div>
	                    </div>
						<div class="rg" @click.stop="choiceimg(index,$index,val)" v-else="nodata != 'android'">
	                    	<a class="mobile" :href="'tel:'+val.suMobile">{{val.suMobile}}</a>
	                    	<span class="iconfont" :style="{marginRight:letterW + 'px'}">&#xe60e;</span>
	                    </div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
import Tokens from '../../../token'
import { Toast } from 'mint-ui'
export default {
	props: {
    	details:Array,
    	// arr:Array,//初始信息
    	// showloadmore:Boolean,
    	nodata:String,
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
		let letterH = Tokens.fetch('contentHeight')-100-57;//字母模块的高度
		let contW = Tokens.fetch('contentWidth');//屏幕的宽度
		self.letterH = letterH;
		self.letterW = parseFloat(letterH/27);//每个字母的宽高
		self.contW = contW - self.letterW;//除去字母的宽度所剩下的宽度
	},
	methods:{
	    choiceimg(index1,index2,item){
	    	let self = this;
	    	this.$dispatch('choiceimg',index1,index2,item)
	    },
	    deleteGroup(index1,index2,val){
	    	this.$dispatch('deleteGroup',index1,index2,val);
	    },
	    particulars(index1,index2,item){
	    	this.$dispatch('particulars',index1,index2,item);
	    },
	    phoneTel(val){
	    	window.Phone.call(val);
	    },
	}
}
</script>
<style scoped>
	.lf{float:left;}
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
		position: relative;
		padding:0 .5rem;
		/*margin:0 .5rem;*/
	}
	.cont-name{
		width:100%;
		height:2rem;
		line-height: 2rem;
		background-color: #fff;
		margin-bottom: 1px;
		/*border-bottom: 1px solid #e5e5e5;*/
		overflow: hidden;
	}
	.matter{
		float:left;
		margin-left: .2rem;
		width:15%;
		white-space:nowrap; 
		text-overflow:ellipsis; 
		overflow: hidden;
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
	.logoimg{
		float:left;
		height:1.5rem;
	}
	.icon_sexM,.icon_sexG{
		float:left;
		margin-left: .3rem;
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
    .deleteCard{
        color: #fff;
        background: #f00;
        position: absolute;
        top: 0.05rem;
        right: 1px;
        text-align: center;
        width: 100px;
        height:1.9rem;
        line-height: 1.9rem;
    }
    .updata{
    	overflow: hidden;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        border-bottom: 1px solid #e5e5e5;
        background: #fff;
        padding-left:0.5rem;
    }
    .mobile{
    	text-decoration:none;
    	margin-right: .3rem;
    	color:blue;
    }
</style>