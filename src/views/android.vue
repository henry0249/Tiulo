<template>
    <div class="page">
        <!-- Header -->
        <mt-header fixed title="导航">
            <mt-button icon="back" slot="left" @click="back('/more')"></mt-button>
            <!-- <mt-button slot="left" @click="back('/more')">
                <span class="iconfont leftIcon">&#xe663;</span>
            </mt-button> -->
            <mt-button slot="right" @click="go('/android2')">
                <span >安卓2</span>
            </mt-button>
        </mt-header>

        <div class="container-top">
            <div style="margin-bottom:2rem">
                <p>按名称导航</p>
                 <input type="text" name="" v-model="endName">
                 <input type="text" name="" v-model="reg">
                 <button @click="byName()">百度导航</button>
                 <button @click="byName1()">高德导航</button>
                  <button @click="byName2()">腾讯导航</button>
                 
            </div>
            <div>
                <p>按经纬度导航</p>
                <input type="text" name="" v-model="lon">
                <input type="text" name="" v-model="lat">
                <button @click="byLat()">高德导航</button>
                <button @click="byLat1()">百度导航</button>
                <button @click="byLat2()">腾讯导航</button>
            </div>


			   <div id="content" @click="getContacts();">Js读取联系人</div>
         <div id="phone" @click="getLocalStroage();">Js读取联localStroage</div>   
          
              <!-- <img id="iv" :src="imgs" class="pic"> -->
            <button @click="openMap();">打开手机地图</button> </br>
            <button @click="openBaiDu();">打开百度</button></br>
             <button @click="openGaoDe();">打开高德</button></br>
             <button @click="openContacts();">获取手机联系人</button></br> 
             <button @click="callPhone();"> 打电话</button></br>
             <button @click="jump();">跳转原生页面</button></br>
             <button @click="share();">原生微信朋友分享</button></br>
             <button @click="takephoto();">原生相机拍照上传</button></br>

              <button @click="takephoto1();">原生相机拍照上传</button></br>
            <button @click="scan();">二维码扫描</button></br>
            <button @click="test1();">测试Java传值</button></br>
             <button @click="selectPic();">测试多张图片选择上传</button></br>
             <p id="code">扫描的结果</p>
             <span id="s" style="font-size: 30px;">aaa</span>
            <p id="pics"> 获取的图片结果</p>

            <input id="ipt_btns" type="file" accept="image/*" @change="onFileChange">
            <img :src="imgs" width="100%">
        </div>
       
          
     
    </div>
</template>

<script>
// Ajax request module, return a Promise
import Tokens from '../token'
export default {


       
    data () {
        return {
            // 腾讯地图 搜索需要多加一个 输入框关键字
            endName:'',//终点名称
            reg:'',// 省市名称
            lon:'',//经度
            lat:'',//纬度
            imgSrc:'',//图片路径
            

            imgs:'',
         //   isheadpic:false,
        }
    },
    methods: {
        go (link, param) {
            let self = this
            self.$transfer.go(self, link, param)
        },
        back (link, param) {
            let self = this
            self.$transfer.back(self, link, param);
        },
        onFileChange(e) {
          let self = this;
            var files = e.target.files || e.dataTransfer.files;
            console.log(e.target.value)
            console.log(files)
            if (!files.length)return;
            // self.imgs = e.target.value;
            this.createImage(files);
        },
        createImage(file) {
            let self = this;
            if(typeof FileReader==='undefined'){
                alert('您的浏览器不支持图片上传，请升级您的浏览器');
                return false;
            }
            let image = new Image();
            let leng=file.length;
            for(var i=0;i<leng;i++){
                var reader = new FileReader();
                reader.readAsDataURL(file[i]); 
                reader.onload =function(e){
                  console.log(e.target.result)
                    self.imgs = e.target.result;
                    console.log(self.imgs)
            //         Tokens.save("img_path",self.image);
            //         self.go('/clip_img')                              
                };                 
            }                        
        },
 
     

       
        byName(){
            // 监听 重新的方法
            let self = this;
            alertShow("按名称导航"+self.endName)
            // http://api.map.baidu.com/geocoder?address=北京市海淀区上地信息路9号奎科科技大厦&output=html&src=yourCompanyName|yourAppName
            // http://api.map.baidu.com/geocoder?address=杭州市半山森林公园&output=html&src=yourCompanyName|yourAppName
		//	window.location.href='http://api.map.baidu.com/line?region=杭州&name=下沙天元公寓&output=html&src=yourCompanyName|yourAppName';
			let mapUrl ='http://api.map.baidu.com/geocoder?address='+self.endName+'&output=html&src=yourCompanyName|yourAppName';
            Tokens.save("mapUrl",mapUrl);
            self.$transfer.go(self, '/showMap');
			self.endName = '';


        },

           // 启用 高德url
         byName1(){
            // 监听 重新的方法
            let self = this;
            alertShow("按名称导航"+self.endName)
            // http://api.map.baidu.com/geocoder?address=北京市海淀区上地信息路9号奎科科技大厦&output=html&src=yourCompanyName|yourAppName
            // http://api.map.baidu.com/geocoder?address=杭州市半山森林公园&output=html&src=yourCompanyName|yourAppName
        //  window.location.href='http://api.map.baidu.com/line?region=杭州&name=下沙天元公寓&output=html&src=yourCompanyName|yourAppName';
        //  http://uri.amap.com/search?keyword=美食&view=map&src=mypage
           // let mapUrl ='http://uri.amap.com/search?query='+self.endName;
            let mapUrl='http://uri.amap.com/search?keyword='+self.endName+'&view=map&src=mypage';
            Tokens.save("mapUrl",mapUrl);
            self.$transfer.go(self, '/showMap');
            self.endName = '';


        },
           // 启用腾讯url  微信中需要传入 关键字key 和 region 参数。
         byName2(){
            // 监听 重新的方法
            let self = this;
            alertShow("按名称导航"+self.endName)
            // http://api.map.baidu.com/geocoder?address=北京市海淀区上地信息路9号奎科科技大厦&output=html&src=yourCompanyName|yourAppName
            // http://api.map.baidu.com/geocoder?address=杭州市半山森林公园&output=html&src=yourCompanyName|yourAppName
        //  window.location.href='http://api.map.baidu.com/line?region=杭州&name=下沙天元公寓&output=html&src=yourCompanyName|yourAppName';
        //  http://uri.amap.com/search?keyword=美食&view=map&src=mypage
           // let mapUrl ='http://uri.amap.com/search?query='+self.endName;
            let mapUrl='http://apis.map.qq.com/uri/v1/search?keyword='+self.endName+'&region='+self.reg+'&referer=myapp';
           Tokens.save("mapUrl",mapUrl);
           self.$transfer.go(self, '/showMap');
         //   self.endName = '';
//

        },
        // 调用高德穿经纬度 定位
        byLat(){
             // 监听 重新的方法
            let self = this;

            alertShow("经度"+self.lon )
            alertShow("纬度"+self.lat )

             let mapUrl='http://uri.amap.com/marker?position='+self.lon+','+self.lat +'&name=目的地&src=mypage&coordinate=gaode';
            Tokens.save("mapUrl",mapUrl);
            self.$transfer.go(self, '/showMap');
            self.endName = '';

           //返回后清空数据
           self.lon='';
           self.lat='';
           
        },
      
      // 调用百度传经纬度  如果用户没有 安装过百度 高德类似的地图软件，只能嵌入web形式的地图。
      //  就下载。
       byLat1(){
             // 监听 重新的方法
            let self = this;
            
            alertShow("经度"+self.lon )
            alertShow("纬度"+self.lat )
             let mapUrl ='http://api.map.baidu.com/geocoder?location='+self.lat+','+self.lon+'&coord_type=gcj02&output=html&src=yourCompanyName|yourAppName';
          //  let mapUrl='http://api.map.baidu.com/marker?location='+self.lon+','+self.lat+'&title=我的位置&output=html'; 
           //  let mapUrl='http://uri.amap.com/marker?position='+self.lon+','+self.lat +'&name=目的地&src=mypage&coordinate=gaode';
            Tokens.save("mapUrl",mapUrl);
          
             self.$transfer.go(self, '/showMap');
            self.endName = '';

           //返回后清空数据
          self.lon='';
           self.lat='';
           
        },
    
    // 调用腾讯 逆向地址解析
    // http://apis.map.qq.com/uri/v1/geocoder?coord=39.904956,116.389449&referer=myapp
    byLat2(){
           let self = this;
            alertShow("经度"+self.lon )
            alertShow("纬度"+self.lat )
           let mapUrl ='http://apis.map.qq.com/uri/v1/geocoder?coord='+self.lat+','+self.lon+'&referer=myapp';
          //  let mapUrl='http://api.map.baidu.com/marker?location='+self.lon+','+self.lat+'&title=我的位置&output=html'; 
           //  let mapUrl='http://uri.amap.com/marker?position='+self.lon+','+self.lat +'&name=目的地&src=mypage&coordinate=gaode';
        Tokens.save("mapUrl",mapUrl);
          
        self.$transfer.go(self, '/showMap');
 
           //返回后清空数据
         //  self.lon='';
         //  self.lat='';
    },
      
    /*  getAddress(){
           let self =this;
            let mapUrl ='http://api.map.baidu.com/geocoder?location=32.990912172420714,120.32715863448607&coord_type=gcj02&output=html&src=yourCompanyName|yourAppName';
           Tokens.save("mapUrl",mapUrl);
            self.$transfer.go(self, '/showMap');
         
      },*/
             

       // 打开手机地图
       openMap(){
         // Js 调用原生的方法。
           window.AndroidMap.open();
       },
   

       openBaiDu(){
        window.AndroidMap.openBaiDuMap();
       },
          // 读取手机联系人。
          // 
        openGaoDe(){
           window.AndroidMap.openGaoDeMap();
        },

        getContacts(){
     
        var str = window.AndroidWebView.showInfoFromJs();
     
        document.getElementById("content").innerHTML =str;
           
         },
  
     

         getLocalStroage(){
         
           var session=  localStorage.getItem("sessionId");
           var userMobile =localStorage.getItem("userMobile");
            window.JSToAndroid.getPhone(userMobile);
           document.getElementById("phone").innerHTML +=userMobile;
          

            
           
         },

       callPhone(){
        alertShow("打电话");
     
         window.Phone.call("135647567");
       },
       
       jump(){
        alertShow("跳转原生页面");
        window.JSToAndroid.jump();
       }
       ,
       share(){
         alertShow("微信朋友分享");
        window.JSToAndroid.shareText();
       } ,
       takephoto(){
        let self =this;
          alertShow("相机拍照上传");
         
          window.Photo.getPicture();
           
           self.$nextTick(()=>{
             setTimeout(function(){
               var path= window.Photo.getPicPath();
               alert(path);
               self.imgs = path;
                  // document.getElementById("iv").src=path;
             },500)
           }
            )

       },

        takephoto1(){
        let self =this;
          alertShow("相机拍照上传");
          window.Photo.getPic();
           
           self.$nextTick(()=>{
             setTimeout(function(){
               var base64= window.Photo.getPicInfo1();
               alert(base64);
      
             },500)
           }
            )

       },

       setInfo(code){
     
             document.getElementById("code").innerHTML=code;
        },
       test1(){
         window.Photo.testJs();
       },

       toke(str){
        alertShow(str);

       }
       ,
       scan(){
        let self = this;
        window.Photo.scanCode1();
         //  调用两个java接口  有问题。 
         //  web加载是一个 异步加载的过程，需要把本地数据保存再传过来。
           
          
      //  self.setInfo(str);
          self.$nextTick(() =>{
                setTimeout(function(){
                   alertShow("定时延迟1秒执行");   
                   var str= window.Photo.getInfoCode();
                   document.getElementById("code").innerHTML=str;
                },1000)
              }) 
       },
      
      selectPic(){
        let self =this;
        window.Photo.selectPictures();

         self.$nextTick(() =>{
                setTimeout(function(){
                    alertShow("定时延迟1秒执行");   
                    var str= window.Photo.getPics();
                          
                },100)
              }) 
      }

    },
    route: {
        data ({ to, next }) {
            let self = this;
        //   self.isheadpic =isheadpic;
             next()
        },
        deactivate ({ next }) {

            next()
        },
        canDeactivate({to, from, next}) {
            let self = this;
            next()
        },
        activate({to, from, next}) {
            let self = this
            next()
        }
    },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
   div{
        width:100%;
        padding:0 0.5rem;
        box-sizing: border-box;
   }
   p{
        margin-bottom:0.5rem;
   }
   input{
        width:80%;
        height:1.3rem;
        line-height: 1.3rem;
        border:1px solid #e5e5e5;
        border-radius: 0.3rem;
        background: #fff;
        margin-bottom:0.5rem;
   }
   button{
        padding:0.3rem 0.75rem;
        border-radius: 0.3rem;
        margin-bottom:0.5rem;
   }
</style>
