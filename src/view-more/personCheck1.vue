<template>
	<div class="page">
		<mt-header fixed title="个人认证">
		<mt-button icon="back" slot="left" @click="back('/orgCheck', companyId)"></mt-button>
            <mt-button @click.stop="" slot="right" class="submitCheck"><span>提交</span></mt-button>
        </mt-header>
        <div class="container-top">
        	<!-- 企业名称 -->
        	<div class="item-title">
        		<span>个人资料</span>
        	</div>
        	<div class="item" >
				<!-- 姓名 -->
				<div class="personName">
					<input type="text" name="" placeholder="个人真实姓名" >
				</div>
			</div>
			<div class="item item-last" >
				<!-- 身份证 -->
				<div class="personIDCard">
					<input type="text" name="" placeholder="身份证号码(15位或18位)" >
				</div>
			</div>
			<!-- 个人证件 -->
			<div class="item-title">
        		<span>个人证件</span>
        	</div>
        	<div class="item-lg">
				<div class="voucherName">
					<span>身份证正面</span>
				</div>
				<div class="voucherPhoto" style="background:;">
					<img id="card_zm_img" type="zm" :src="imgUrl+companyId+'_zm.gif'" @click.stop="uploadImage($event)" onerror="javascript:this.src='/static/img/camera_off.f20be15.png';">
					<input id="card_zm" style="display:none;" type="file" multiple accept="image/*;capture=camera">
				</div>
			</div>
			<div class="item-lg">
				<div class="voucherName">
					<span>身份证反面</span>
				</div>
				<div class="voucherPhoto">
					<img id="card_fm_img" type="fm" :src="imgUrl+companyId+'_fm.gif'" @click.stop="uploadImage($event)" onerror="javascript:this.src='/static/img/camera_off.f20be15.png';">
					<input id="card_fm" style="display:none;" type="file" multiple accept="image/*;capture=camera">
				</div>
			</div>
			<div class="hint">
        		<p>1、以上资料仅供推流认证使用；</p>
        		<p>2、认证通过后将无法修改；</p>
        	</div>
        </div>
	</div>
</template>

<script>
	export default {
		//数据
		data() {
			return{
				companyId: "",//公司id
				fromPage: "",//来自哪个页面
				bigImgSrcArr: "",//图片
				//"http://tiulo-dbcon.oss-cn-hangzhou.aliyuncs.com/company/OWR1612061_zm.gif"
				imgUrl: getImgURL()+"company/",//图片路径


			}
		},
		//打开网页执行的方法(只执行一次)
		ready() {
			
		},
		//内容改变时调用
		watch: {
			
		},
		//方法
		methods: {

			//添加图片
			uploadImage(event) {//$(event.currentTarget)当前节点
				var self = this;
				//当前节点
				var $thisNode = $(event.currentTarget);
				//正面还是反面
				var _type = $thisNode.attr("type");

				//如果当前图片为默认图片, 执行图片上传功能
				if($thisNode.attr("src") == "/static/img/camera_off.f20be15.png"){
					//打开图片选择框
					$thisNode.parent().find("input").click();
			    	//上传图片
			        uploadMultipleImg(
			        	$("#card_"+_type),//input节点
			        	function(fileLen){

			        	},
			        	function(url){
			       			doAjaxUpload(
					    		"multiple",
					    		{
					    			'imgparams': url,
									'mode': "company",
									'id': self.companyId,
									'type': _type
					    		},
					    		function(data){
					    			if(data.status == "1"){//上传成功
					    				console.log("data: " + JSON.stringify(data));
					    				//图片路径data.vispath[0]
					    				$thisNode.attr("src", data.vispath[0]);
					    				//点击input不再打开选择图片框
					    				$thisNode.parent().find("input").attr("type", "text");
					    				//打开图片预览
					    				
					    			}
					    		}
					    	);
			       		}
			       	);
				}else{//如果当前图片不是默认图片, 执行图片预览操作
					//禁用打开图片框操作
					$thisNode.parent().find("input").attr("type", "text");
					//打开图片预览

					//删除图片
					var delpath = self.companyId+"_"+_type+".gif";//图片名(OWR1612085_zm.gif)
					doAjaxDelete(
						 "other",
						 {
							delpath: delpath,
							mode: "company",
							id: self.companyId,
							type: _type
						 },
						 function(data){
						 	console.log(JSON.stringify(data, null, 4));
						 	if(data.status == "1"){//删除成功
						 		//图片改为原始图片
						 		$thisNode.attr("src", "/static/img/camera_off.f20be15.png");
						 		//点击打开图片预览框
						 		$thisNode.parent().find("input").attr("type", "file");
						 	}
						 }
					);


				}
				
			},
			//var reg=/^[1-9]{1}[0-9]{14}$|^[1-9]{1}[0-9]{16}([0-9]|[xX]$)/;//验证身份证
			go: function(link, param) {
	            let self = this;
	            self.$transfer.go(self, link, param);
	        },
	        back: function(link, param) {
	            let self = this;
	            self.$transfer.back(self, link, param);
	        }
		},
		route: {
			//方法在这里执行, 每次打开页面都会执行一次
	        data ({ from, to, next }) {
	        	var self = this;
	        	//from.path 获取从哪个页面过来的
	        	self.fromPage = from.path;
	        	//得到公司id
	        	self.companyId = self.$route.params.companyId;

	            next();
	        },
	        deactivate ({ next }) {
	            next();
	        },
	        canDeactivate ({ next, to, abort }) {
	            const self = this;
	            next();
	        }
	    }

	}
</script>

<style scoped>
	.container-top{
		padding-bottom: 2.5rem;
	}
	.submitCheck{
		color: #FFE91B;
		font-family: "微软雅黑";
		font-size: 0.75rem;
	}
	.item{
		width: 100%;
		height: 2.5rem;
		line-height: 2.5rem;
		background: #fff;
		padding-left: 0.5rem;
		padding-right: 0.5rem;
		margin-top: 0.05rem;
	}
	.item-title{
		width: 100%;
		height: 1.5rem;
		line-height: 1.5rem;
		padding-left: 0.5rem;
		color: #999;
		margin-top: 0.4rem;
	}
	.item .personName input{
		width: 100%;
		height: 1.9rem;
		font-family: "微软雅黑";
		background: ;
	}
	.item .personIDCard input{
		width: 100%;
		height: 1.9rem;
		font-family: "微软雅黑";
		background: ;
	}
	.item-lg{
		width: 100%;
		height: 4.5rem;
		line-height: 4.5rem;
		background: #fff;
		padding-left: 0.5rem;
		padding-right: 0.5rem;
		border-bottom: 0.05rem #eee solid;
	}
	.item-last{
		border: 0;
	}
	.item-lg .voucherName{
		float: left;
	}
	.item-lg .voucherPhoto{
		height: 4.5rem;
		float: right;
	}
	.item-lg .voucherPhoto img{
		margin-top: 0.5rem;
		height: 3.5rem;
	}
	.hint{
		width: 100%;
		padding-top: 0.25rem;
	}
	.hint p{
		text-align: center;
		color: #888;
	}
</style>

