<template>
	<div class="page"> 
        <mt-header fixed title="裁剪">
            <mt-button icon="back" slot="left" @click="close_clip()"></mt-button>              
            <mt-button slot="right" @click="preserve()">保存</mt-button>             
        </mt-header>
        <div class="container-top" id="content">
            <div class="htmleaf-container">
                <div class="container">
                    <div class="row">
                        <div class="col-md-9">
                            <!-- 图片容器 -->
                            <div class="img-container" :style="{height:page_height + 'px',maxHeight:page_height + 'px'}">
                                <img :src="img_path" alt="Picture">
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-9 docs-buttons">
                            <div class="btn-group btn-group-crop btn-box">
                                <button id="for1" class="btn btn-primary" data-method="getCroppedCanvas" data-option="{ &quot;width&quot;: 160, &quot;height&quot;: 90 }" type="button" style="display: none;">
                                    <span class="docs-tooltip" data-toggle="tooltip" title="$().cropper(&quot;getCroppedCanvas&quot;, { &quot;width&quot;: 160, &quot;height&quot;: 90 })">160 &times; 90</span>
                                </button>
                            </div>
                            <!-- Show the cropped image in modal -->
                            <div class="modal fade docs-cropped" id="getCroppedCanvasModal" aria-hidden="true" aria-labelledby="getCroppedCanvasTitle" role="dialog" tabindex="-1">
                                <div class="modal-dialog">
                                    <div class="modal-content">
                                        <div id="canvas_img" class="modal-body" style="display:none;"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>                    
                </div>                
            </div>
        </div>
    </div>
</template>
<script>
import Tokens from '../token'
export default {
    data () {
        return {
        	img_path:'',
            from_path:'',//进入路径的整体保存
            user_info:'',
            page_height:'',
            backPageFromPath:'',//返回的页面路径
            wayParameter:'',//路径参数
            clipImgId:'',
        }
    },
    methods:{
    	go (link, param) {
            let self = this;
            self.$transfer.go(self, link, param)
        },
        back (link, param) {
            let self = this
            self.$transfer.back(self, link, param);
        },
        close_clip(){
            let self = this;
            Tokens.save("img_path",'');
            // self.back('/my_information');
            if(self.wayParameter){
                self.back(self.backPageFromPath,self.wayParameter)
                self.wayParameter = '';
            }else{
                self.back(self.backPageFromPath);
            }
        },
        preserve(){
            let self = this;
            $('#for1').click();
            let clip_img = $('#tupian>img').attr('src');
            let cav = $('.modal-body').attr('src');
            let canvas= $("canvas")[0];//拿到剪裁后的数据
            let img = canvas.toDataURL("image/png");
            let myDate = new Date();
            let imgData = {};
            imgData.originalURL = self.img_path;
            imgData.newURL = img;
            if(self.backPageFromPath == '/my_information'){
                doAjaxUpload(
                    "single",
                    {
                        imgparams:JSON.stringify(imgData),
                        mode:"user",
                        id:self.user_info.suId,
                        type:"head"
                    },
                    function(data){
                        consoleShow(data)
                        self.user_info.suLogo = data.vispath;  
                        Tokens.save("user_info",self.user_info);
                        Tokens.save("img_path",'');
                        self.back('/my_information');
                    }
                ) 
            }else{
                Tokens.save("companyAddClipImg",imgData);
                self.back(self.backPageFromPath,self.wayParameter);
            }
        },
    },
    route: {
        data ({ from, to, next }) {
            let self = this;
            //进入页面时token不存在
            if(!localStorage.getItem("token")){
                self.$transfer.backLogin(self, {info:'token没有值'});
                return;
            }
            let user = Tokens.fetch("user_info");
            self.user_info = user;
            let path = Tokens.fetch("img_path");
            self.img_path = path;
            let page_height = Tokens.fetch("contentHeight")-44;
            self.page_height = page_height;
            // let from_path = from.path;
            if(from.path){
                Tokens.save("clipImgFromPath",self.from_path)
                self.from_path = from.path;
            }else{
                self.from_path = Tokens.fetch("clipImgFromPath");
                self.wayParameter = Tokens.fetch("wayParameter");
                self.backPageFromPath = Tokens.fetch("backPageFromPath")
                self.clipImgId = Tokens.fetch("clipImgOperation");
            }
            if(self.from_path.indexOf('my_information')==1){
                self.backPageFromPath = '/my_information';
                Tokens.save("backPageFromPath",self.backPageFromPath)
                self.$nextTick(()=>{
                    window.location.reload();
                })
            }else if(self.from_path.indexOf('companyAdd')==1){
                self.backPageFromPath = '/companyAdd';
                Tokens.save("backPageFromPath",self.backPageFromPath)
                let path = decodeURIComponent(self.from_path);//编码
                let way = path.split('/');
                self.wayParameter = way[way.length-1];
                Tokens.save('wayParameter',self.wayParameter)
                self.$nextTick(()=>{
                    window.location.reload();
                })
            }
            next()
        },
        deactivate ({ next }) {
            //Triggers when component destroys
            next()
        },
    }
}
</script>
<style scoped>
    /*@import "../assets/bootstrap.min.css";*/
	.img_content{
		width:100%;
	}
    .clearfix{
        overflow: hidden
    }
    .modal{
        margin-bottom:2.5rem;
        margin-top:1rem;
    }
    .btn-primary{
        height:1.5rem;
        border:none;
        border-radius: 4px;
        background-color: #353535;
        color:#FFD91E;
    }
    .btn-box{
        margin-right:.5rem!important;
    }
    .ipt-updown{
        float:right;
        width:3rem;
    }
    .img-container{
        position: absolute;
        top:0;left:0;
    }
</style>