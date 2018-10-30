<template>
  <div class="chooseOrderlist">
    <div style="margin-bottom:0.5rem;background: #fff;" v-for="option in options">
      <div class="titleBox" @click="clickOrder($index,option.value)">
          <div :id="'coCircle'+$index " class="TBBcircle"></div>
          {{option.label}}
      </div>
      <ul class="orderDet">
          <li>发货人：{{option.tohOwnerName}}</li>
          <li>收货人：{{option.tohEndName}}</li>
          <li>时　间：{{option.tohDate}}</li>
          <li v-if="option.tohRecvMan">承运人：{{option.tohRecvMan}}</li>
          <li style="font-weight:700;">货物信息</li>
          <li v-for="detail in option.tchDetail"> 
            <div style="width:28%">{{detail.todMaterialName}}</div>
            <div style="width:14%">{{detail.todMaterialCase}}</div>
            <div style="width:14%">{{detail.todQty}}</div>
            <div style="width:23%">{{detail.todWeight}}kg</div>
            <div style="width:23%">{{detail.todCubage}}m³</div>
          </li>
      </ul>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'mychooseorder',
    props: {
      max: Number,
      title: String,
      align: String,
      options: {
        type: Array,
        required: true
      },
      value: Array  
    },
    methods: {
      clickOrder(index,currVal){
        let self = this;
        if($("#coCircle" + index).hasClass("seTBBcircle")){
          $("#coCircle" + index).removeClass("seTBBcircle");
          for(var i=0;i<self.value.length;i++){
            if(self.value[i] == currVal){
              self.value.splice(i,1)
            }
          }
        }else{
          $("#coCircle" + index).addClass("seTBBcircle")
          self.value.push(currVal)
        }
        self.$dispatch('chooseValue',self.value) ;
        
      }
    },
    route: {
      data ({ from , to, next }) {
          let self = this ;
          self.chooseList = [];
          next()
      },
      deactivate ({ next }) {
          //Triggers when component destroys
          next()
      },
      canDeactivate({to, from, next}) {
          let self = this;
          next()
      },
    }
  };
</script>

<style lang="css">
  .titleBox{
    position: relative;
    padding:0.5rem 0.5rem 0.5rem 2rem;
    border-top:1px solid #e5e5e5;
    border-bottom:1px solid #e5e5e5;
    min-height: 2rem;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .TBBcircle{
    position: absolute;
    width:1rem;
    height:1rem;
    background: #fff;
    border-radius: 0.5rem;
    border:1px solid #999;
    left:0.5rem;
    top:0.5rem;
  }
  .orderDet{
    padding:0.4rem 0.5rem;
    overflow: hidden;
    border-bottom:1px solid #e5e5e5;
  }
  .orderDet li{
    width: 100%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .orderDet li div{
    display: inline-block;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .seTBBcircle{
    background: #FFD91E;
    border: 1px solid #FFD91E;
  }
</style>
