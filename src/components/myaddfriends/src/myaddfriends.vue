<template>
	<div class="content-box">
		<div v-for="(index,detail) in details">
			<div class="single" :id="detail.cmfEN==='#'?'TS':detail.cmfEN">{{detail.cmfEN}}</div>
			<div class="cont-name" v-for="val in detail.name" track-by="$index" @click.stop="selectFriend(index,$index,val)">
				<div class="selct" :id="index+'-'+$index" :class="{selcted:val.show == 0?true:false}"></div>
				<img :src="val.suLogo" class="logoimg">
				<div style="float:left;">
					<div class="user_name">{{val.suName}}</div>
					<div class="user_group">{{val.cfgNames}}</div>
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
    	pitchup:Array,
  	},
	data () {
	    return {

	    }
	},
	methods:{
		selectFriend(key1,key2,item){
			let self = this;
			if($("#"+key1+'-'+key2).is('.selcted')){
	    		$("#"+key1+'-'+key2).removeClass('selcted');
	    		item.show = 1;
	    		// console.log(item)
	    		// self.pitchup.splice($.inArray(item,self.pitchup),1);
	    		for(let k=0;k<self.pitchup.length;k++){
	    			if(item.suId == self.pitchup[k].suId){
	    				self.pitchup.splice(k,1);
	    			}
	    		}
	    		console.log(self.pitchup)
	    	}else{
	    		$("#"+key1+'-'+key2).addClass('selcted');
	    		item.show = 0;
	    		self.pitchup.push(item)
	    	}
	    	this.$dispatch('selectFriend',key1,key2,item,self.pitchup)
		}
	},
}
</script>
<style scoped>
	.single{/*单个字母*/
		height:1rem;
		line-height: 1rem;
	}
	.single,.cont-name{
		padding:0 .5rem;
		/*margin:0 .5rem;*/
	}
	.cont-name{
		height:2.5rem;
		background-color: #fff;
		border-bottom:1px solid #eee;
	}
	.selct{
		float: left;
		margin-top: .8rem;
		margin-right:.5rem;
		width:.9rem;height:.9rem;
		border-radius: .9rem;
		border:2px solid #aaa;
	}
	.selcted{
		background-color: #FFD91E;
	}
	.logoimg{
		float:left;
		height:2rem;
		margin-top: .25rem;
		border-radius: 4px;
		margin-right:.5rem;
	}
	/*.user_name,.user_group{
		
		line-height: 1.25rem;
	}*/
	.user_name{
		font-size:.7rem;
		height:1.5rem;
		line-height: 1.5rem;
	}
	.user_group{
		font-size:.55rem;
		height:1rem;
		line-height: .5rem;
		color:#999;
	}
</style>