<template>
	<div class="box">
		<div class="single_box" v-for="item in arrdata" @click.stop="optfor($index,item)">
			<div class="selct" :id="'check'+'-'+$index" :class="{selcted:item.status == 1?true:false}"></div>
			<span>{{item.name}}</span>
		</div>
	</div>
		
</template>
<script>
import Tokens from '../../../token'
import { MessageBox } from 'mint-ui';
export default {
	props: {
    	arrdata:Array,//传来的数组
    	pitchup:Array,//选中的数组
  	},
	data () {
        return{
        }
    },
    methods:{
    	optfor(index,item){
	    	let self = this;
	    	if(item.name == "自定义"){
	    		MessageBox.prompt(' ','自定义服务对象').then(({ value, action }) => {
                    if(value == ""){
                        self.$transfer.showToast(self, "服务对象不能为空", "center", 1500);
                        return;
                    }else{
                        let obj = {name:value,status:1}
                        let obj2;
                        self.arrdata.push(obj)
                        for(let key in self.arrdata){
                        	if(self.arrdata[key].name == "自定义"){
                                obj2 = self.arrdata[key];
                                self.arrdata.splice(key,1)
                            }
                        }
	                    self.arrdata.push(obj2)
	                    self.pitchup.push(obj)
                    } 
                });
	    	}else{
	    		if($("#check"+'-'+index).is('.selcted')){
		    		item.status = 0;
		    		// $("#check"+'-'+index).removeClass('selcted');
		    		// self.pitchup.splice($.inArray(item,self.pitchup),1);
		    		for(let key in self.pitchup){
		    			if(self.pitchup[key].name == item.name){
		    				self.pitchup.splice(key,1)
		    			}
		    		}
		    	}else{
		    		// $("#check"+'-'+index).addClass('selcted');
		    		item.status = 1;
		    		self.pitchup.push(item)
		    	}
		    	this.$dispatch('optfor',index,item,self.pitchup,self.arrdata)
	    	}
		    	
	    },
    },
}
</script>
<style scoped>
	.box{
		margin-top: 1rem;
	}
	.single_box{
		width: 100%;
		height: 2rem;
		line-height: 2rem;
		background-color: #fff;
		padding-left:.5rem;
		border-bottom: 1px solid #efefef;
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
</style>