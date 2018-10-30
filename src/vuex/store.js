import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

/* @params
 * trucklist:车辆列表
 * 
 */

const state = {
    tokenValue:{},
    truckList: [],
    truckExList:[],
    address:{
      provinceNum:'',
      cityNum:'',
      countyNum:'',
      province:'',
      city:'',
      county:'',
    },
    provinceList:[],
    cityList:[],
    countyList:[]
}

const mutations = {

    //修改
    ['SET_USER_STORE_INFO'] (state, data) {
        state.user_info = data
    },
    ['SET_USER_MEANS_INFO'] (state, key,value) {
        state.user_info[key]= value;
    },
    // 地址
    ['SET_ADD_INFO'] (state, key,value) {
        state.address[key]= value;
    },
    ['SET_ADD_LIST'] (state, key, arr) {
        state[key] = arr;
    },
    //车辆管理
    ['SET_LIST'] (state, key, arr) {  
        state[key] = arr;
    },
    ['ADD_LIST'] (state, key, arr) {
        let newArr = state[key].concat(arr)
        state[key] = newArr;
    },
    ['ADDB_LIST'] (state, key, arr) {
        let newArr = arr.concat(state[key])
        state[key] = newArr;
    },
    ['DELETE_LIST'] (state, key, index) {
        state[key].splice(index, 1);
    },
    ['UPDATE_LIST'] (state, key, index,status) {
        state[key][index].status = status;
    },
   ['UPDATEALL_LIST'] (state, key, index,val) {//修改车次异常列表
        state[key] = state[key].concat(val);
        state[key][index] = state[key][state[key].length-1];
        state[key].pop();
        console.log(state[key][index])
    },
    
     //设置全局数据   
    ['SET_TOKEN_VALUE'] (state, key,val) {    
       state[key] = val;
    } 
}

export default new Vuex.Store({
    state,
    mutations,
    strict: true
})
