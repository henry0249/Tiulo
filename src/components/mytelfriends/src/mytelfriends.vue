<template>
	<div class="content-box">
		<div class="contents" v-for="(index,detail) in details">
			<div class="single" :id="detail.cmfEN==='#'?'TS':detail.cmfEN">{{detail.cmfEN}}</div>
			<div class="cont-name" v-for="val in detail.name">
				<div class="cont_suname">{{val.suName}}</div>
				<div class="cont_sumobile">{{val.suMobile}}</div>
				<div class="cont_btn">
					<button class="btn_push1" v-if="val.showInvite == 0" @click.stop="inviteFriend($index,val)">邀请</button>
					<button class="btn_push1" v-if="val.showInvite == 1 && val.suIsFriend == 'false'">添加</button>
					<button class="btn_push2" v-if="val.showInvite == 1 && val.suIsFriend == 'true'">已添加</button>
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
  	},
  	data () {
	    return {

	    }
	},
	ready(){
		let self = this;
	},
	methods:{
		inviteFriend(key,val){//邀请按钮
			let self = this;
			let s = {action:"/user/execute"}
            s.params = {mobiles:val.suMobile}
            doAjaxQuery(s,function(data){
                if(data.outParams.state){
                    self.$transfer.showToast(self, "消息发送成功");
                    val.showInvite = 1;
                    val.suIsFriend = 'false';
                }else{
                	alert(111)
                    self.$transfer.showToast(self, data.info);
                }
            })
		},
	}
}
</script>
<style scoped>
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
		height:2.5rem;
		background-color: #fff;
		margin-bottom: 1px;
		/*border-bottom: 1px solid #e5e5e5;*/
		overflow: hidden;
	}
	.cont_suname{
		height:1.5rem;
		line-height:1.5rem;
		font-size:0.8rem;
	}
	.cont_sumobile{
		height:1rem;
		line-height:0.65rem;
		font-size:0.65rem;
		color:#999;
	}
	.cont_btn{
		position: absolute;
		top:0.5rem;
		right:1rem;
	}
	.btn_push1{
		border:none;
		padding:0;
		width:2rem;
		height:1.5rem;
		background-color: #353535;
		color:#FFD91E;
		border-radius: 4px;
	}
	.btn_push2{
		border:none;
		padding:0;
		width:2rem;
		height:1.5rem;
		background-color: #fff;
		color:#999;
	}
</style>