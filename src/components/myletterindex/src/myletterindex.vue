<template>
	<div class="letters" :class="{bgcolor:bgcolor}" :style="{height:letterH + 'px',width:letterW + 'px'}">
		<span class="touches" :style="{height:letterW + 'px',width:letterW + 'px'}" v-for="item in Letters">{{item}}</span>
	</div>
</template>
<script>
import Tokens from '../../../token'
import { Toast } from 'mint-ui'
export default {
	props: {
    	uptop:Number,//距离头部的高度
  	},
	data () {
	    return {
	    	Letters:['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z','#'],
			letterH:'',
			letterW:'',
			contW:'',
			evtWidth:'',
			evtHeight:'',
			evtTop:'',
			evtLeft:'',
			eleinner:'',
			bgcolor:false,
	    }
	},
	ready(){
		let self = this;
		let letterH = Tokens.fetch('contentHeight')-100-57;//字母模块的高度
		let contW = Tokens.fetch('contentWidth');//屏幕的宽度
		self.letterH = letterH;
		self.letterW = parseFloat(letterH/27);//每个字母的宽高
		self.contW = contW - self.letterW;//除去字母的宽度所剩下的宽度
		self.touchOperation()
	},
	methods:{
		touchOperation(){
	      	let self = this;
	      	let el = document.querySelectorAll(".touches");
	      	Array.from(el).forEach(function(item,index){
	      		let timeOutEvent = 0;
	      		let show = $(item).html();
	      		$(item).off("touchstart").on("touchstart",function(e){
	      			Toast({
						message: show,
						duration: 500,
						className: 'current',
					});
	      			self.bgcolor = true;
	      			timeOutEvent = setTimeout(function(){
                        timeOutEvent = 0; 
                       	self.evtWidth = $(item).width();
			            self.evtHeight = $(item).height();
			            self.evtLeft = $(item).offset().left;
			            self.evtTop = $(item).offset().top;
                    },500)
                    let endX = e.originalEvent.changedTouches[0].pageX;
    				let endY = e.originalEvent.changedTouches[0].pageY;
                    let element = document.elementFromPoint(endX, endY).innerHTML;
                    let inner;
                    if(element == '#'){
						inner = 'TS';
					}else{
						inner = element;
					}
					if($('#'+inner).html() !== undefined){
						let innerTop = $('#'+inner).offset().top-self.uptop + $('.topEnt').scrollTop();
						$('.topEnt').scrollTop(innerTop)
						self.eleinner = inner;
					}else{
						return false
					}
	      			e.preventDefault();
	      		});
	      		$(item).off("touchmove").on("touchmove",function(e){
	      			let endX = e.originalEvent.changedTouches[0].pageX;
    				let endY = e.originalEvent.changedTouches[0].pageY;
    				if(endX < self.evtLeft || endX > (self.evtLeft + self.evtWidth) || endY < self.uptop || endY > (self.letterH + self.uptop)){//超出A~Z块的最外范围
    					return false;
    				}else if(endY > self.uptop && endY < (self.letterH + self.uptop)){
    					let element = document.elementFromPoint(endX, endY).innerHTML;
    					let inner;//找到对应id
    					Toast({
							message: element,
							duration: 500,
							className: 'current',
						});
    					if(element == '#'){
    						inner = 'TS';
    					}else{
    						inner = element;
    					}
    					if($('#'+inner).html() !== undefined){
    						if(self.eleinner == inner){
    							return false
    						}else{
    							let innerTop = $('#'+inner).offset().top-self.uptop + $('.topEnt').scrollTop();
    							$('.topEnt').scrollTop(innerTop)
    							self.eleinner = inner;
    						}
    					}else{
    						return false
    					}
    				}
	      		});
	      		$(item).off("touchend").on("touchend",function(e){
	      			self.bgcolor = false;
                });
	      	})
	    },
	}
}
</script>
<style scoped>
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
	.touches{
		background-color: transparent;
	}
	.bgcolor{
		background-color: #aaa;
	}
</style>