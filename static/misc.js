var swipeX,swipeY,startPos;//控制上下或左右滑动
var canSwipeY = true;
var token;
var dbType;
var newDate;
var browserType;
var browserType1;
var exEntry_ws = null;
var client = null;
var tchStatusTitle={"TH":"提货中-提货确认-返回送达","GX":"装车等待-在途-卸货完成","SH":"装车等待-在途-已签收","ZC":"装车等待-在途-已签收"};
var ttStatusTitle={"TH":"全部-待提货-返回送达","GX":"全部-待装车-待卸车","SH":"全部-待装车-待送达","ZC":"全部-待装车-待送达"};
var fachStatusTitle={"00":"已删除","01":"初始","10":"已发送","20":"已确认","30":"已审核","40":"已付款"};
var fachTypeTitle={"OP":"经营财务","ZD-KF":"站点与客户","ZD-SJ":"站点与司机","ZD-ZD1":"站点间","ZD-ZD2":"分单"};
localStorage.setItem("isTMSTaskReload","");//任务页面是否重新加载机构
localStorage.setItem("isTraceReload","");//跟踪页面是否重新加载机构
localStorage.setItem("isTMSTrace","");
function showTiuloTitle(){
	if(document.location.href.indexOf('dbtms')>0){
		document.title = '推流Tiulo';
		dbType = "dbtms";
	}else if(document.location.href.indexOf('dbtest')>0){
		document.title = '推流Tiulo测试库';
		dbType = "dbtest";
	}else{
		document.title = 'Tiulo';
		dbType = "dbcon";
	}
}
showTiuloTitle();

//如果是正式库不alert和console
function alertShow(msg){
	if(dbType == "dbtms"){
		return;
	}else{
		alert(msg);
	}
};
function consoleShow(msg){
	if(dbType == "dbtms"){
		return;
	}else{
		console.log(msg);
	}
};
// var rootImgUrl=getImgURL();
function getImgURL() {
	if(document.location.href.indexOf('dbtms')>0){
		return "http://tiulo.oss-cn-hangzhou.aliyuncs.com/";
	}else if(document.location.href.indexOf('dbtest')>0){
		return "http://tiulo-dbtest.oss-cn-hangzhou.aliyuncs.com/";
	}else if(document.location.href.indexOf(':70000')>0 || document.location.href.indexOf(':8080')>0){
		return "http://tiulo-dbcon.oss-cn-hangzhou.aliyuncs.com/"
	}else{
		return 'http://' + document.location.host+"/";
	}
}

function CheckImgExists(imgurl) { //判断图片是否存在  这个方法不用
 	var ImgObj = new Image(); 
    ImgObj.src = imgurl;
    //图片不存在
    ImgObj.onerror = function(){
        //return false;
        consoleShow("@@@onerror");
        return false;
    }
    //图片存在
    ImgObj.onload = function(){
    	alertShow(3);
    	consoleShow("@@@onload");
    	return true;
    }
}

function CheckImgExists1(imgurl) {  
    var ImgObj = new Image(); //判断图片是否存在  
    ImgObj.src = imgurl;  
    //没有图片，则返回-1  
    if (ImgObj.fileSize > 0 || (ImgObj.width > 0 && ImgObj.height > 0)) {  
        return true;  
    } else {  
        return false;
    }
} 

function getRootURL() {
	//luojp modified 2016-12-09
	var ajaxURL;
	// return 'http://120.27.145.36:81';
	if (document.location.port==8090){
		//说明是本机运行，开发人员模式,返回本机地址+7000端口
		ajaxURL='http://'+document.location.hostname+':7000';

	}else{
		ajaxURL='http://' + document.location.host;
		if (document.location.href.indexOf('dbtms')>0) ajaxURL='http://120.27.145.36:81';
		else if (document.location.href.indexOf('dbtest')>0) ajaxURL='http://120.27.145.36:60';
	}
	// console.debug('ajaxURL='+ajaxURL);
	return ajaxURL;
}
function round(number1,dec){
  return dec>=1?parseFloat(number1.toFixed(dec)):parseInt(number1.toFixed(dec));
}

//获取url参数值
var usrParametesValue=null;
function getUrlParameters( name ){
		name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
		var regexS = "[\\?&]"+name+"=([^&#]*)";
		var regex = new RegExp( regexS );
		usrParametesValue=regex.exec(window.location.href );
	if( usrParametesValue == null )    return "";  else {
		var a=decodeURI(usrParametesValue[1]);
		var array=a.split("'");
		return array[0];
	}
}

function isNull(obj){
	   if(obj==undefined)return true;if(typeof(obj)=="undefined")return true;if (obj == null) return true;if (typeof(obj)=="number"&&obj==0)return false;if (obj == '') return true;
	   return false;
}
function setTokenValue(key,value) {
	var _session=localStorage.getItem('token');
	if (isNull(_session)){
		//console.debug("用户登录信息Token已经丢失，不能setTokenValue。key="+key+"  value="+value);
		alertShow("用户登录信息Token已经丢失，不能setTokenValue。key="+key+"  value="+value);
		return;
	}
	_session=JSON.parse(_session);
	_session[key]=value;
	localStorage.setItem('token',JSON.stringify(_session));
}
function getTokenValue(key){
	var _session=localStorage.getItem('token');
	if (isNull(_session)){
		return null;
	}
	_session=JSON.parse(_session);
	return _session[key];
}

function  getCommand(arg,commandType){
	//if(!isNull(misc_admin_changeLogin_sessionId))pageInfo._sessionId = misc_admin_changeLogin_sessionId;
	//if(isNull(pageInfo._sessionId))pageInfo._sessionId=arg._sessionId;
	var action   =arg.action;
	var datasets =arg.datasets;
	var pageIndex=arg.pageIndex;
	var pageSize =arg.pageSize;
	var queryId  =arg.queryId;
	var executeId=arg.executeId;
	var params   =arg.params;
	var printJson=arg.printJson;
	//var token    =action.indexOf("/login")==-1?getTokenValue("token"):null;//拿到加密过的 token;//拿到加密过的 token
	var showFields =arg.showFields;
	var fields =arg.fields;
	var showLoading=typeof(arg.showLoading)=="undefined"?true:arg.showLoading;
	var showError=typeof(arg.showError)=="function"?arg.showError:null;
	var rowId=typeof(arg.rowId) =='undefined' || isNaN(arg.rowId)?1:arg.rowId;
	var limit = arg.limit;

	datasets  =typeof(datasets) =='undefined'?{}:datasets;
	pageIndex =typeof(pageIndex)=='undefined' || isNaN(pageIndex)? 1 :pageIndex;
	pageSize  =typeof(pageSize) =='undefined' || isNaN(pageSize) ?100:pageSize;
	params    =typeof(params)   =='undefined'?{}:params;
	showFields=typeof(showFields)=='undefined'?"":showFields;
	limit     =typeof(limit)=='undefined'?"":limit;
	fields    =typeof(fields)=='undefined'?{}:fields;
	printJson =typeof(printJson)=='undefined'?true:printJson;

	if ((pageIndex+'').indexOf('\'')>0 || (pageIndex+'').indexOf('\"')>0 || (pageIndex+'').indexOf('’')>0){
		alertShow('非法值  pageIndex=' + pageIndex);
	}
	if ((pageSize+'').indexOf('\'')>0 || (pageSize+'').indexOf('\"')>0 || (pageSize+'').indexOf('’')>0){
		alertShow('非法值  pageSize=' + pageSize);
	}

	if(action!=null && action.charAt(0)!='/'){
		action='/'+action;
	}

	if (token=="undefined" || token==null ) token="";
	//作废的Keys: "token":token,"fields":JSON.stringify(fields),"showLoading":showLoading,"printJson":printJson,
	var ret= {"action":action,"commandType":commandType,
		 "executeId":executeId, "queryId":queryId,"rowId":rowId,"showError":showError,"_sessionId":getTokenValue('sessionId')}

	if (typeof(params)!='undefined'){
		ret['params']=JSON.stringify(params);
	}

	if (commandType=="Query"){
		if(limit){
			ret.limit = limit;
		}else{
			ret.pageIndex =pageIndex;ret.pageSize  =pageSize;
		}
	     ret.showFields=showFields;
	    
	}else if (commandType=="Update"){
	    ret.datasets  =JSON.stringify(datasets);
	    if (typeof(arg.saveQueryAction) !='undefined'){//删除x条数据，类库自动返回x条下一页的数据，补齐 //////////////2017-02-24
            if(limit){
				ret.limit = limit;
			}else{
				ret.pageIndex =pageIndex;ret.pageSize  =pageSize;
			}
            ret.showFields=showFields;
            ret.saveQueryAction=arg.saveQueryAction; 
        }
	}else{
		alertShow("getCommand 参数commandType 值传入错误，只能是Query Update,当前值是 "+commandType);
	}
	ret["showLoading"]=showLoading;
	ret["onFailure"]=arg.onFailure;
	console.log(ret);
	return ret;
}

function doAjaxQuery(arg,evt){
	var command=getCommand(arg,"Query");
	doAjaxExecute(command,evt);
}

function doAjaxUpdate(arg,evt){
	var command=getCommand(arg,"Update");
	doAjaxExecute(command,evt);
}

function doAjaxExecute(command,evt){
	// consoleShow(command);
	// command._sessionId = "161108035104L065ZMJ482";
	//可能需要重写
	// command = {"action":"/truck/query","commandType":"Query","executeId":1478602090565,"rowId":100,"_sessionId":"161108035104L065ZMJ482","_programId":"","_pageTitle":"车辆管理","_pageURL":"hint/truckList.html","params":"{}","pageIndex":1,"pageSize":100}
	var isShowLoading=command.showLoading;
	var showError=command.showError;
	var onFailure=command.onFailure;
	delete command["showLoading"];
	delete command["onFailure"];
	delete command["showError"];
	if(isNull(command.showFields))delete command["showFields"];
	if(isShowLoading){}//显示进度条
	var url=getRootURL() + "/rest"+command.action;
	// consoleShow("url",url);
	console.log("param",command);
	var pstr=$.param(command);
	var type=command.commandType=="Query"&&pstr.length<2000?"GET":"POST";
		$.ajax({
			url: url,
			cache: false,
			type: type,
			dataType:"text",//jsonp 跨域专用
			timeout:12*1000,//单位毫秒 设置为2分钟 调试程序用
			async:true,
			data: pstr,
			success: function(data){
				data=eval("("+data+")");//跨域删除
				try{
					if(data.status=='0'){//后台出错，显示消息
						if(typeof(onFailure)=="function")onFailure();
						if(!isNull(data.info) && data.info.indexOf("用户信息丢失")!=-1) {
							consoleShow("用户数据丢失，需要重新登录");
						}else if(!isNull(data.info) && data.info.indexOf("用户不存在")!=-1) {
							consoleShow(data.info);
						}else{
							if(typeof(showError)=="function"){
								showError(data.info);
							}else{
								consoleShow(data.info+"\n"+data.error);
							}
						}
					}
				}finally{
					if(isShowLoading){}//关闭进度条
				};
				if(typeof(evt)!="undefined")evt(data);
			},error:function(XMLHttpRequest, textStatus, errorThrown){
				if(typeof(onFailure)=="function")onFailure();
				if(isShowLoading){}//关闭进度条
				if (typeof(XMLHttpRequest.status)=="number"){
					if (XMLHttpRequest.status==404 && errorThrown==""){
						errorThrown="服务器可能没有开启";
					}else if (XMLHttpRequest.status==0 && errorThrown==""){
						errorThrown="请求未初始化";
					}
				}
				if(typeof(showError)=="function"){
					showError(JSON.stringify(errorThrown));
				}else{
					 console.log(errorThrown);
				}
				var errorData = {status:0,info:'请求失败'};
				if(typeof(evt)!="undefined")evt(errorData);
			}
		});

}


function initDate(date,isFormat){
	if (typeof(date)=="undefined") return "";
	if (isFormat==true){
		return date.substr(0,16);
	}
	var oldDateStr = date;//从后台获取的日期字符串  2016-01-25 10:21:56 168
	var str=date.length<19?date.replace(/-/g,"/"):oldDateStr.replace(/-/g,"/").substring(0,19);
	var oldDate =new Date(str);//将获取的字符串格式转成日期格式
	var oldYear = oldDate.getFullYear();//获取的年份  2016
	var oldMonth = oldDate.getMonth()+1;//获取月份(0-11,0代表1月)
	var oldDay = oldDate.getDate();//获取日期(1-31)
	var oldHours = oldDate.getHours();//获取小时数(0-23)
	var oldMinutes = oldDate.getMinutes();//获取分钟数(0-59)
	var oldSeconds = oldDate.getSeconds();//获取秒数(0-59)

	//对当前日期惊醒操作
	var newDate = new Date();//当前日期
	//newDate.setTime(getTokenValue("createDate"));   
	var newYear = newDate.getFullYear();//当前日期年份
	var newMonth = newDate.getMonth()+1;//当前月份
	var newDay = newDate.getDate();//当前月份
	var str="";
	//判断日期显示格式
	if(newYear>oldYear){//如果不是本年份，则显示为   xxxx年 xx月 xx日
		if(oldMonth > 9 && oldDay <= 9){
			str=oldYear+"/"+oldMonth+"/0"+oldDay;
		}else if(oldMonth <= 9 && oldDay > 9){
			str=oldYear+"/0"+oldMonth+"/"+oldDay;
		}else if(oldMonth <= 9 && oldDay <= 9){
			str=oldYear+"/0"+oldMonth+"/0"+oldDay;
		}else{
			str=oldYear+"/"+oldMonth+"/"+oldDay;
		}
	}else if(newMonth>oldMonth){
		str=oldMonth+"月"+oldDay+"日";
	}else if((newDay-oldDay)>3){
		str=(oldMonth)+"月"+oldDay+"日";
	}else if((newDay-oldDay)==3){
		str="3天前";
	}else if((newDay-oldDay)==2){
		str="2天前";
	}else if((newDay-oldDay)==1){
		str="1天前";
	}else if(newDay==oldDay){
		if(oldMinutes>=0 && oldMinutes<=9){
			str=oldHours+":0"+oldMinutes;
		}else{
			str=oldHours+":"+oldMinutes;
		}
		
	}
	return str;
}

function getDateTimeForDate(date){
	var d,s,t;d=new Date();
	if(typeof date !="undefined"){d=date;}
	s=d.getFullYear().toString(10)+"-";t=d.getMonth()+1;s+=(t>9?"":"0")+t+"-";
	t=d.getDate();
	s+=(t>9?"":"0")+t+" ";t=d.getHours();s+=(t>9?"":"0")+t+":";t=d.getMinutes();s+=(t>9?"":"0")+t+":";t=d.getSeconds();s+=(t>9?"":"0")+t;
	return s;
}

//获取登录的终端类型
function getBrowserType(){
    //判断访问终端
	var browser={
	    versions:function(){
	        var u = navigator.userAgent, app = navigator.appVersion;
	        return {
	            trident: u.indexOf('Trident') > -1, //IE内核
	            presto: u.indexOf('Presto') > -1, //opera内核
	            webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
	            gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1,//火狐内核
	            mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否为移动终端
	            ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
	            android: u.indexOf('Android') > -1 || u.indexOf('Adr') > -1, //android终端
	            iPhone: u.indexOf('iPhone') > -1 , //是否为iPhone或者QQHD浏览器
	            iPad: u.indexOf('iPad') > -1, //是否iPad
	            webApp: u.indexOf('Safari') == -1, //是否web应该程序，没有头部与底部
	            weixin: u.indexOf('MicroMessenger') > -1, //是否微信 （2015-01-22新增）
	            qq: u.match(/\sQQ/i) == " qq" //是否QQ
	        };
	    }(),
	    language:(navigator.browserLanguage || navigator.language).toLowerCase()
	}
	//判断是哪种浏览器
	if(browser.versions.weixin){
		browserType = "weixin";
		// initWechatJssdk();//放到登录后跳转到tiulo页面前调取
	}
	if(!browser.versions.weixin && browser.versions.mobile && browser.versions.android){  
	    browserType = "android";        
	}
}
getBrowserType()

//初始化微信js应用
function initWechatJssdk(evt){
	// alertShow("调取微信请求")       
	var _url = location.href;
	if(location.href.split('#').length>2){
		_url = location.href.split('#')[0]+'#'+location.href.split('#')[1];
	}
	//alertShow(_url)
	$.ajax({
		type:"get",
		url:'http://120.27.145.36:80/rest/jssdk/smInvoking',
		data:{"url":encodeURIComponent(_url)},
		success: function (data) {
			if(typeof(data) == "string"){
				data = eval('('+data+')')
			};
			wx.config({
			    debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
			    appId: 'wx2928486a4d849c73', // 必填，公众号的唯一标识
			    timestamp:data.timestamp , // 必填，生成签名的时间戳
			    nonceStr: data.nonceStr, // 必填，生成签名的随机串
			    signature: data.signature,// 必填，签名，见附录1
			    jsApiList: ["scanQRCode","chooseImage","previewImage","uploadImage","downloadImage","openLocation","getLocation","onMenuShareTimeline","onMenuShareAppMessage","onMenuShareQQ"] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
			});
			
			wx.ready(function(){
			   if(typeof evt == "function"){
				   evt();
			   }
			});
			
			wx.error(function(res){
	    	// config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
				// alertShow("weChat init error：",res);
				initWechatJssdk(evt);//重新调用一次
			}); 
			
		},
		error: function (result, status) {
			// alertShow("signature_error")
			consoleShow("weChat signature error:",result);
		}
	});		
	
	
}

// //朋友圈
// function wxOnMenuShareTimeline(shareTitle,shareNote,shareLink,shareImg){
//     wx.onMenuShareTimeline({
//           title: shareTitle, // 分享标题
//           link: shareLink, // 分享链接
//           imgUrl: shareImg, // 分享图标
//           success: function () { 
//               // 用户确认分享后执行的回调函数
//           },
//           cancel: function () { 
//               // 用户取消分享后执行的回调函数
//           }
//     });
// }

//   //朋友
// function wxOnMenuShareAppMessage(shareTitle,shareNote,shareLink,shareImg){
//     wx.onMenuShareAppMessage({
//         title: shareTitle, // 分享标题
//         desc: shareNote, // 分享描述
//         link: shareLink, // 分享链接
//         imgUrl: shareImg, // 分享图标
//         type: '', // 分享类型,music、video或link，不填默认为link
//         dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
//         success: function () { 
//             // 用户确认分享后执行的回调函数     
//         },
//         cancel: function () { 
//             // 用户取消分享后执行的回调函数  
//         }
//     });
// }
//   //qq
// function wxOnMenuShareQQ(shareTitle,shareNote,shareLink,shareImg){
//     wx.onMenuShareQQ({
//         title: shareTitle, // 分享标题
//         desc: shareNote, // 分享描述
//         link: shareLink, // 分享链接
//         imgUrl: shareImg, // 分享图标
//         success: function () { 
//            // 用户确认分享后执行的回调函数
//         },
//         cancel: function () { 
//            // 用户取消分享后执行的回调函数
//         }
//     });
// }
//微信扫一扫
function wxScanQRCode(evt){
    wx.scanQRCode({
      	needResult: 1,
      	desc: 'scanQRCode desc',
      	success: function (res) {
        	// alertShow(JSON.stringify(res));
        	if(typeof evt == "function"){
	        	// alertShow("成功选择")
			    evt(res);
		    }
      	}
    });
}

//微信选择图片
function weChatChooseImage(evt){
	// alertShow("选择图片")
	wx.chooseImage({
	    count: 9, // 默认9
	    sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
	    sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
	    success: function (res) {
	        var localIds = res.localIds; // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
	        if(typeof evt == "function"){
	        	// alertShow("成功选择")
			    evt(localIds);
		    }
	    },
	    error: function(){
	    	alertShow("选择失败!");
	    }
	});
}

//微信选择单张图片
function weChatChooseOneImage(evt){
	// alertShow("选择图片")
	wx.chooseImage({
	    count: 1, // 默认9
	    sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
	    sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
	    success: function (res) {
	        var localIds = res.localIds; // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
	        if(typeof evt == "function"){
	        	//alertShow("成功选择")
			    evt(localIds);
		    }
	    },
	    error: function(){
	    	alertShow("选择失败!");
	    }
	});
}

//微信预览图片
function weChatPreviewImg(currentUrl,urlArr){
	wx.previewImage({
	    current: currentUrl, // 当前显示图片的http链接
	    urls: urlArr // 需要预览的图片http链接列表
	});
}

//上传图片到微信服务器(公共调用)
function weChatUploadImg(localIdsArr,evt){
	var i=0,media_id_arr = [];
	wxUploadImg(i,localIdsArr,media_id_arr,function(result){
		if(typeof evt == "function"){
			evt(result);
		}
	});
	//return media_id_arr;
}

//上传图片
function wxUploadImg(i,localIdsArr,media_id_arr,evt){
	wx.uploadImage({
	    localId: localIdsArr[i], // 需要上传的图片的本地ID，由chooseImage接口获得
	    isShowProgressTips: 0, // 默认为1，显示进度提示
	    success: function (res) {
	    	var media_id = res.serverId; // 返回图片的服务器端ID
	    	// $("#media_ids").append('<input tyle="text" value="'+media_id+'" style="width:100%;height:80px;" />');
	    	media_id_arr.push(media_id);
	    	i++;
	    	if(i<localIdsArr.length){
	    		wxUploadImg(i,localIdsArr,media_id_arr,evt);
	    	}else if(i==localIdsArr.length){
	    		if(typeof evt == "function"){
	    			evt(media_id_arr);
		    	}
	    	}
	    }
	});
}

//通过微信选择的图片转成base64位
function getBase64Coder(media_id,evt){
	// alertShow(getRootURL()+"/rest/upload/getBaseCoder")
	$.ajax({
		type:"post",
		url:getRootURL()+"/rest/upload/getBaseCoder",
		cache:false,
		data:{media_id:media_id+""},
		success:function(data){
			if(typeof data == "object"){
				data = JSON.stringify(data);  
			}
			if(typeof evt == "function"){
				evt(data);
		    }
		 },
		 error: function(error){
		 	alertShow("获取错误："+JSON.stringify(error))
		 }
	}); 
}






//删除图片的方法
function doAjaxDelete(arg,_data,evt){
	_data.token = getTokenValue("token");
	var url = "";
	if(arg == "sign"){
		url = getRootURL()+"/rest/upload/delSignPic";
	}else if(arg == "other"){
		url = getRootURL()+"/rest/upload/delpic";
	}
	$.ajax({
		  type:"post",
		  url:url,
		  cache:false,
		  data:_data,
		  dataType:"jsonp",
		  jsonp:"jsonp_data",
		  error:function(error){
			  alertShow("删除图片失败");
		  },
		  success:function(data){
			  if(typeof data == "string"){
				  data = eval('('+data+')');  
			  }
			  if(typeof evt == "function"){
				  // if(data.status == "1"){
					  evt(data);
					// }
				  // }else{
					 //  error(data.info,data.error);
				  // }
			  }
		  }
	  }); 
}    

//封装图片上传方法（微信专用）
function doWxAjaxUpload(_data,evt){
	_data.token = getTokenValue("token");
	$.ajax({
		  type:"post",
		  url:getRootURL()+"/rest/upload/wxUploadMultipleImg",
		  cache:false,
		  data:_data,
		  dataType:"json",
		  onerror:function(){
			  alertShow("上传图片失败！");
		  },
		  success:function(data){
			  if(typeof data == "string"){
				  data = eval('('+data+')');  
			  }
			  if(typeof evt == "function"){
				  evt(data)
			  }
		  }
	});
}

//封装图片上传方法（剪切图片用）
function doAjaxUpload(arg,_data,evt){
	_data.token = getTokenValue("token");
	var _url = "";
	if(arg=="single"){//上传单个图片
		_url = getRootURL()+"/rest/upload/uploadpic";
	}else if(arg=="multiple"){//上传多个图片
		_url = getRootURL()+"/rest/upload/uploadMultipleImg";
	}
	$.ajax({
		  type:"post",
		  url:_url,
		  cache:false,
		  data:_data,
		  dataType:"json",
		  onerror:function(){
			  alertShow("上传图片失败！");
		  },
		  success:function(data){
			  if(typeof data == "string"){
				  data = eval('('+data+')');  
			  }
			  if(typeof evt == "function"){
				  if(data.status == "1"){
					  evt(data);
				  }else{
					  error(data.info,data.error);
				  }
			  }
		  }
	});
}


//上传多个图片
var _dropZoneArr = [];
var _imgDataArr = [];
var _processingThumbnail = false;
function uploadMultipleImg(obj,callback1,callback2,callback3){
	if (window.FileReader){
		obj.unbind("change").change(function(e){
			_imgDataArr = [];
			//myTip.show();
			var files = this.files,file;
			if (!files.length){
				return;
			}
			for(var i=0;i<files.length;i++){
				file = files[i];
				if (/^image\/\w+$/.test(file.type)){
					_dropZoneArr.push(file);
				}else{
					alertShow("请选择图片文件（支持PNG、GIF、JPG、BMP）");
					//myTip.close();
					return false;
				}
			}
			if(typeof callback1 =="function"){
				callback1(files.length,obj);
			}
			setTimeout(function(){
				fileQueue(callback2,callback3);
			},0);
		});
	}else{
		obj.addClass("hide");
	}
}

function readFiles(file,callback){
	var reader = new FileReader();  
    reader.onload = (function(_file) {
        return function(_this) {
        	if(typeof callback =="function"){
    			callback(_this.target.result);
			}
        };  
    })(file);  
    //读取文件内容  
    reader.readAsDataURL(file);
}

function fileQueue(callback2,callback3){
	if (_processingThumbnail || _dropZoneArr.length === 0) {
		if(typeof callback3 == "function"){
			callback3(_imgDataArr);
		}
		
		setTimeout(function(){
			//myTip.close();
		},50);
		//清除input中存在的文件，否则下次选择同样的文件不会触发change事件
		$("input[type='file']").val("");
        return;
    }
	_processingThumbnail = true;
	readFiles(_dropZoneArr.shift(),function(url){
		url = imageCompressAll(url,1024)
		_imgDataArr.push(url);
		if(typeof callback2 =="function"){
			callback2(url);
		}
		_processingThumbnail = false;
		fileQueue(callback2,callback3);
	});
}

//压缩图片为指定尺寸(maxSize为指定款高，默认宽高一样）
function imageCompressAll(url,maxSize) {
	//var time1 = new Date().getTime();
	var image = new Image();
	image.src = url;
	var compressURL = "";
	if (image.width > maxSize) {
		if (image.height > maxSize) {
			if(image.width/image.height > maxSize/maxSize){
				$("#preview").width(maxSize);
				compressURL = resizeImageAll(image,maxSize, image.height*maxSize/image.width);
			}else {
				$("#preview").height(maxSize);
				compressURL = resizeImageAll(image,image.width*maxSize/image.height, maxSize);
			}
		}else {
			$("#preview").width(maxSize);
			compressURL = resizeImageAll(image,maxSize, image.height*maxSize/image.width);
		}
	}else if (image.height > maxSize) {
		$("#preview").height(maxSize);
		compressURL = resizeImageAll(image,image.width*maxSize/image.height, maxSize);
	}else{
		compressURL = url;
	}
	//var time2 = new Date().getTime();
	//window.open(compressURL)
	return compressURL;
}

//转成64位
function resizeImageAll(image,width,height){
	var resize_canvas = document.createElement('canvas');
	resize_canvas.width = width;
	resize_canvas.height = height;
	resize_canvas.getContext('2d').drawImage(image, 0, 0, width, height);
	//toDataURL(type,arg),只有当type是image/jpeg，才能有第二个参数：arg，为图片质量
	var url = resize_canvas.toDataURL("image/jpeg",0.9);
	return url;
}

//数组去重
function arrUnique(arr){
	var res = [];
	var json = {};
	for(var i = 0; i < arr.length; i++){
		if(arr[i] != "*"){
			if(!json[arr[i].id]){
				res.push(arr[i]);
				json[arr[i].id] = 1;
			}
		}
	}
	return res;
}

//获取服务器时间
function getDateTime(){
    //时钟————begin
 	$.ajax({
		url:getRootURL()+'/rest/user/getSystime',
		type : "POST",
		dataType:"jsonp",
		jsonp:"jsonp_data",	
	    data:{},
		success:function(d){
			var datetime=parseInt(d.outParams.date);
			if(document.location.host.indexOf("127.0.0")>=0) {
				 $(".clock").show();
			}else{
				 $(".clock").hide()
			}
            var monthNames = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
            newDate = new Date(datetime);

            $("#date").html(newDate.getFullYear() + '年' + monthNames[newDate.getMonth()] + newDate.getDate() + '日');
            setInterval(function () {
            	  datetime=datetime+1000;
            	  newDate = new Date(datetime);
                var seconds = newDate.getSeconds();
                $("#sec").html((seconds < 10 ? "0" : "") + seconds);
            }, 1000);
            setInterval(function () {
                var minutes = newDate.getMinutes();
                $("#min").html((minutes < 10 ? "0" : "") + minutes);
            }, 1000);
            setInterval(function () {
                var hours =newDate.getHours();
                $("#hours").html((hours < 10 ? "0" : "") + hours);
            }, 1000);
			
			
		},
		error:function(e){
			consoleShow(e)
		}
	});
//时钟————end
}
getDateTime();

// 朋友列表排序
function friendSortList(arr,arr2){
	arr2 = [];
	if(arr.length>1){
		arr.sort(function(a, b) {
			if(!a.cmfNickName2){
				a.cmfNickName2 = a.suName;
			}
			if(!a.cmfEN && a.suEN){
	    		a.cmfEN = a.suEN;
			}else if(!a.cmfEN && !a.suEN){
				a.cmfEN = "#";
			}
			if(!b.cmfNickName2){
				b.cmfNickName2 = b.suName;
			}
			if(!b.cmfEN && b.suEN){
	    		b.cmfEN = b.suEN;
			}else if(!b.cmfEN && !b.suEN){
				b.cmfEN = "#";
			}
			if(a.cmfHintCode < b.cmfHintCode){
	    		return -1;
	    	}else if(a.cmfHintCode > b.cmfHintCode){
	    		return 1;
	    	}else{
	    		return 0;
	    	}
			// return a.cmfNickName2.localeCompare(b.cmfNickName2);	
		})
	}
	for(var k = 0;k<arr.length;k++){
        var reg= /^[A-Za-z]+$/;
        if(!reg.test(arr[k].cmfEN)){
          	arr[k].cmfEN = "#";
        }
    }
    for(var i = 0;i<arr.length;i++){        
        var keyVal = JSON.stringify({'cmfEN':arr[i].cmfEN});
        var keyVal2 = keyVal.substring(1,keyVal.length-1);
        if(JSON.stringify(arr2).indexOf(keyVal2) == -1){
          	var a1 = [];
            a1.push(arr[i])
            arr2.push({'cmfEN':arr[i].cmfEN,'name':a1})
        }else{
          	for(var j=0;j<arr2.length;j++){
            	if(arr2[j].cmfEN == arr[i].cmfEN){
	              	// arr2[j].cmfNickName2.push(arr[i].cmfNickName2)
	              	// arr2[j].cmfNickName2.sort(function(a, b) {return a.localeCompare(b);})
	              	arr2[j].name.push(arr[i])
            	}
          	}
        }
    }
    arr2.sort(function(a, b) {
    	if(a.cmfEN < b.cmfEN){
    		return -1;
    	}else if(a.cmfEN > b.cmfEN){
    		return 1;
    	}else{
    		return 0;
    	}
    	// return a.cmfEN.localeCompare(b.cmfEN);
    })
    for(var v = 0;v<arr2.length;v++){
        if(arr2[v].cmfEN == '#'){
            arr2 = arr2.concat(arr2.splice(v,1))
        }
    }
    return arr2
}

//提示音
/*function playErrSound(){  //错误信息提示音
	//载入声音文件
	$("body").append('<audio id="audioErr">'+
		'<source src="static/audio/错误信息.ogg" type="audio/ogg">'+
		'<source src="static/audio/错误信息.mp3" type="audio/mpeg">'+
		'<source src="static/audio/错误信息.wav" type="audio/wav">'+
	'</audio>');
	//播放声音
	$('#audioErr')[0].play();
}
function playInfoSound(){ //普通信息提示音
	//载入声音文件
	$("body").append('<audio id="audioInfo">'+
		'<source src="static/audio/消息提醒.ogg" type="audio/ogg">'+
		'<source src="static/audio/消息提醒.mp3" type="audio/mpeg">'+
		'<source src="static/audio/消息提醒.wav" type="audio/wav">'+
		'</audio>');
	//播放声音
	$('#audioInfo')[0].play();
}
function playQuestionSound(){ //询问信息提示音
	//载入声音文件
	$("body").append('<audio id="audioQuestion">'+
		'<source src="static/audio/询问提示音.ogg" type="audio/ogg">'+
		'<source src="static/audio/询问提示音.mp3" type="audio/mpeg">'+
		'<source src="static/audio/询问提示音.wav" type="audio/wav">'+
		'</audio>');
	//播放声音
	$('#audioQuestion')[0].play();
}*/
function playMsgSound() { //推流消息提示音
	//载入声音文件
	$("body").append('<audio id="audioMsg" autoplay="autoplay">' +
		'<source src="static/audio/推流消息提示.mp3" type="audio/mpeg">' +
		'</audio>');
	//播放声音
	$('#audioMsg')[0].play();
}

function checkTime(date) {//时间范围检查用于消息免打扰
	var ar = ['00:00','8:00'];
    var current = date.getHours() * 60 + date.getMinutes();
    var ar_begin = ar[0].split(':');
    var ar_end = ar[1].split(':');
    var b = parseInt(ar_begin[0]) * 60 + parseInt(ar_begin[1]);
    var e = parseInt(ar_end[0]) * 60 + parseInt(ar_end[1]);
    if (current >= b && current <= e) return true;
    else return false;
}
//如果有广告
window.onload = function(){
	$("body").siblings("span").remove();
    $("body").siblings("iframe").remove();
    $("body").siblings("script").remove();
    $("#app").siblings("span").remove();
    $("#app").siblings("iframe").remove();
}

//监控页面滚动时searchBox显示和隐藏
function searchBoxIsShow(container,searchBox,beforeTop,evt) {//滚动容器的id 搜索框div的id 滚动容器的top值 callback
	var scrollTimer = null;
	var beforeScrollTop = beforeTop;
	$(container).on('scroll',function(e){
        clearInterval(scrollTimer);
        scrollTimer = setTimeout(function(){
            var afterScrollTop = $(container).scrollTop();
            var distance = afterScrollTop - beforeScrollTop;
            if(afterScrollTop > 60 && distance > 5){
                $(searchBox).slideUp();weChatChooseImage
            }else if(distance < -5){
                $(searchBox).slideDown();
            }

            beforeScrollTop = afterScrollTop;
            if(typeof evt == "function"){
			    evt(afterScrollTop);
		    }       
        },100);   
    });
}   

//判断一个对象是否为空
function isEmptyObject( obj ) {
    var name;
    for ( name in obj ) {
        return false;
    }
    return true;
}


//判断是否是点击还是下拉
function isXLorClick(){
    //列表若有点击跳转事件，在下拉时阻止点击跳转
    var XLcontainer = document.defaultView.getComputedStyle(document.getElementsByClassName('mint-loadmore-content')[0],null).transform;
    if(XLcontainer != 'matrix(1, 0, 0, 1, 0, 0)'){//如果是下拉需要阻止点击
        return true;
    }else{
    	return false;
    }
}

function isNull(obj){
   if(obj==undefined)return true;if(typeof(obj)=="undefined")return true;if (obj == null) return true;if (typeof(obj)=="number"&&obj==0)return false;if (obj == '') return true;
   return false;
}

		