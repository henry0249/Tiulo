<template>
	<div v-for="item in Letters">
		<div class="city_letter" v-if="item == '★'">{{item}} 热门城市</div>
		<div class="city_letter" v-if="item != '★'">{{item}}</div>
	</div>
</template>
<script>
export default {
	data () {
	    return {
	    	Letters:['★','A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
	    }
	},
	ready(){
		
	},
}
</script>
<style scoped>
	.city_letter{
		height:2rem;
		line-height: 2rem;
		padding-left:.8rem;
		font-size:.75rem;
		background-color: #ededed;
		color: #777;
	}
</style>