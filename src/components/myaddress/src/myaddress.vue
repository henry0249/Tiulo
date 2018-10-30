<template>
  <mt-picker :slots="addressSlots" track-by="$index" @change="onAddressChange" :visible-item-count="9"></mt-picker>
</template>
<script>
import { pid_pName, cid_cName , zid_zName , pid_cIds, cid_zIds , cid_pid , zid_cid } from '../../../assets/pcz'
import Tokens from '../../../token'
export default {
  props: {
    useraddress:Object,
  },
	data () {
		return {
      countyId:'',//区域的Id
      provinceId:'',//省份的Id
      pitchA:'',
      pitchB:'',
      pitchC:'',

		}
	},
	ready(){
		let self = this;
	},
  computed:{
    addressSlots:function(e){
      let self = this;
      console.log(self.useraddress.provinces)
      console.log(self.useraddress.citys)
      console.log(self.useraddress.countyes)
      let add = [
        {
          flex: 1,
          values: Object.values(self.useraddress.provinces),
          className: 'slot1',
          textAlign: 'center',
          defaultIndex: self.useraddress.provinceNum
        }, {
          flex: 1,
          values: Object.values(self.useraddress.citys),
          className: 'slot2',
          textAlign: 'center',
          defaultIndex: self.useraddress.cityNum
        }, {
          flex: 1,
          values: Object.values(self.useraddress.countyes),
          className: 'slot3',
          textAlign: 'center',
          defaultIndex: self.useraddress.countyNum
        }
      ]
      console.log(add)
      return add
    }
  },
	methods:{
    onAddressChange(picker, values) {
      let self = this;
      console.log(values)
      let cid_CName = [];//市区数组
      let zid_ZName = [];//县城数组
      let zid_Zid = [];
      let pNum = Object.keys(pid_pName);//pid_pName中的键，一个数组
      let pName = Object.values(pid_pName);//pid_pName中的值，一个数组
      let cIdsNum = Object.keys(pid_cIds);//pid_cIds中的键，一个数组
      let cIds = Object.values(pid_cIds);//pid_cIds中的值，一个数组
      let cNum = Object.keys(cid_cName);//cid_cName中的键，一个数组

      let cName = Object.values(cid_cName);//cid_cName中的值，一个数组
      let zNum = Object.keys(zid_zName);//zid_zName中的键，一个数组
      let zName = Object.values(zid_zName);//zid_zName中的值，一个数组
      let zIdsNum = Object.keys(cid_zIds);//cid_zIds中的键，一个数组
      let zIds = Object.values(cid_zIds);//cid_zIds中的值，一个数组
      //由省转到市
      for(let key in pName){
          if(pName[key] == picker.getValues()[0]){//picker.getValues()[0]是当前选中的省份,pName是遍历pid_pName里面的值
              for(let l in cIdsNum){
                  if(cIdsNum[l] == pNum[key]){//pNum[key]是当前位数的键
                      // console.log(cIds[l]);
                      let cId = cIds[l].split(',');//把字符串转换为数组
                      console.log(cId)
                      // cId.pop();//删除最后一个空元素
                      cId.splice(cId.length-1,1)
                      console.log("===========================================")
                      alert(cId)                            
                      console.log("===========================================")
                      for(let c in cId){
                          cid_CName.push(cid_cName[cId[c]])
                      }
                      picker.setSlotValues(1, cid_CName);
                      alert(cid_CName)
                  }
              }
          }
      };
      //由市转到县
      for(let k in cName){
          if(cName[k] == picker.getValues()[1]){
              for(let e in zIdsNum){
                  if(zIdsNum[e] == cNum[k]){
                      let zId = zIds[e].split(',');
                      zId.pop();
                      for(let y in zId){
                          zid_ZName.push(zid_zName[zId[y]])
                          zid_Zid.push(zId[y])
                      }
                      picker.setSlotValues(2, zid_ZName);
                      for(let a in zid_ZName){
                          if(zid_ZName[a] == picker.getValues()[2]){
                              self.countyId = zid_Zid[a];
                          }
                      }
                  }
              }        
          }  
      }

      let province = picker.getValues()[0];
      let city = picker.getValues()[1];
      let county = picker.getValues()[2];
      // alert()
      self.changeAdd(province,city,county,self.countyId)
      for(let c in pid_pName){
          if(pid_pName[c] == province){
              self.provinceId = c;
          }
      }
    },
    changeAdd(province,city,county,countyId){
      this.$dispatch('changeAdd',province,city,county,countyId)
    }

	},
}
</script>
<style scoped>
</style>