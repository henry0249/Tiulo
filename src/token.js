
export default {
	fetch(key){
		if(window.localStorage.getItem(key)){
			return JSON.parse(window.localStorage.getItem(key))
		}
		return 	[]	
	},
	save (key,val){
		window.localStorage.setItem(key,JSON.stringify(val))
	}
}