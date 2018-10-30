
var dbName = "tiulo",dbVersion = 3.0;
var indexedDB = window.indexedDB || window.webkitIndexedDB ||window.mozIndexedDB||null;
var tiulo={
	indexedDB:{
		db:null,
		db2:null,
		onerror:function(){
			console.log(e);
		}
	},
};
var DatasetMap={};
tiulo.indexedDB.open=function(dataset,evt){
	if(indexedDB==null){
		if(dataset!=null)dataset.openCache=false;
		if(typeof(evt)=="function")evt();
		return 
	}
	if(dataset!=null){
		var datasource=dataset.datasource;
		if(isNull(datasource)||isNull(dataset.table)||isNull(dataset.idField)){
			if(typeof(evt)=="function")evt();
			return ;
		};
	}
	try{
	var request = indexedDB.open(dbName,dbVersion);
		request.onsuccess =function(e){
			tiulo.indexedDB.db=e.target.result;
			var db = tiulo.indexedDB.db;
			if(db.version!=dbVersion){
				createDatasetTable(db);
				if(typeof(evt)=="function")evt();
			}else{
				if(typeof(evt)=="function")evt();
			}
		}
		request.onupgradeneeded = function(event){
			var db = event.target.result;
			createDatasetTable(db);
		};
	}catch(e){console.log(e)}
}

tiulo.indexedDB.openTable=function(evt){
if(indexedDB==null){
	if(typeof(evt)=="function")evt();
	return 
}
try{
	var request = indexedDB.open(dbName+"_table", dbVersion);
	request.onsuccess =function(e){
		tiulo.indexedDB.db2=e.target.result;
		var db = tiulo.indexedDB.db2;
		if(db.version!=dbVersion){
			if(!db.objectStoreNames.contains("Dataset")){
				createDataset(db);
			}
			if(typeof(evt)=="function")evt();
		}else{
			if(!db.objectStoreNames.contains("Dataset")){
				createDataset(db);
			}
			if(typeof(evt)=="function")evt();
		}
	}
	request.onupgradeneeded = function(event){
		var db = event.target.result;	
		createDataset(db);
	};
	}catch(e){console.log(e)}
}
function createDatasetTable(db){
	try{
		var l=tiuloTables.length;
		for(var i=0;i<l;i++){
			var tb=tiuloTables[i];
			if (db.objectStoreNames.contains(tb[0])){continue;}
			var k=tb[2]*1==1?tb[1]+"Id":tb[3];
			var indexTable=db.createObjectStore(tb[0], { keyPath:k });
			indexTable.createIndex(k,k,{ unique: false });
		}
	}catch(e){console.log(e);}
}
function createDataset(db){
	try{
		if (db.objectStoreNames.contains("Dataset")) {
			db.deleteObjectStore("Dataset");
		}
		var dataset=db.createObjectStore("Dataset", { keyPath: "action_key" });
		dataset.createIndex("action_key","action_key",{ unique: false });
	}catch(e){console.log(e);}
}
//---------------------------------------------------------------------------------
var isModify=false;
function Toolbar(){
	this.map={};
	this.toolbar=$("[_class='toolbar']");
	this.click=function(node){};
	this.loop=function(evt){
		this.toolbar.each(function(){
			var id=$(this).attr("id")==null?"*":$(this).attr("id");
			$(this).find("button").each(function(){
				evt(id,$(this));
			});
		});
	};
	this.build=function(){
		var d=this;
		this.toolbar.each(function(){
			$(this).find("button").each(function(){
				$(this).bind("click",function(){d.click($(this));});
			});
		});
	};
	this.build();
	return this;
}
function getHtml(h,o){
	for(var s in o){
		h=h.replace(eval("/#{"+s+"}/gi"),o[s]);
	}
	return h;
}
function getKey(){
	return new Date().getTime();
}
function Fill(id){
	this.fillBody=$("[fill='"+id+"']");
	this.html=this.fillBody.css("display","block").prop("outerHTML").replace(eval("/_jqr=\"\"/gi"),"");
	this.fillBody.css("display","none");
	this.initValue=function(n,r){
		return null;
	}
	this.getHtml=function(row,split){
		var html=this.html,split2="";
		if(typeof(split)=="undefined")split="";
		if(typeof(row.length)!="undefined"){
			var arr=[];
			for(var i=0;i<row.length;i++){
				var r=row[i];
				var html2=html;
				split2=split;
				for(var s in r){
					var vl=this.initValue(s,r);
					if(vl==null)vl=isNull(r[s])?"":r[s]
					html2=html2.replace(eval("/#{"+s+"}/gi"),vl);
					split2=split2.replace(eval("/#{"+s+"}/gi"),vl);
				}
				html2=html2+split2;
				arr.push(html2);
			}
			html=arr.join("");
		}else{
			for(var s in row){
				html=html.replace(eval("/#{"+s+"}/gi"),isNull(row[s])?"":row[s]);
			}
		}
		return html;
	}
	
}

function Dataset(arg){
	this.params={};//传递参	数集合
	this.pagepilot=arg.pagepilot;
	this.validate=false;
	this.validateData={};
	this.validateId="";
	this.openCache=typeof(arg.openCache)=="undefined"?false:arg.openCache;
	//if(document.location.host.indexOf("7000")>0)this.openCache=true;
	this.isBug=false;
	this._appendData=false;
	this.setValidate=function(id){
		this.validate=true;
		this.validateId=id;
	}
	this.submit=function(evt){
			var ds=this;
			if(ds.validate){
				var _err=[];
				ds._find1(function(n,input,label){
					var min=n.toLowerCase();
					var t=typeof(label)=="undefined"||label==null||isNull(label.text())?n:label.text();
					ds.labelMap[n]=t;
					if(typeof(input.attr("label"))=="undefined")input.attr("label",t);
					if(ds.noValidate.indexOf(","+n+",")==-1){
						if(((input.is("input")&&(input.attr("type")=="text"||input.attr("type")=="password"))
							||input.is("select")
							||input.is("textarea"))
							&&isNull(input.val())){input.addClass("error");_err.push("「"+input.attr("label")+"」不能为空！");}
						else if(!input.hasClass("radios-option")&&(input.is("div")||input.is("span"))&&isNull(input.text())){
							input.addClass("error");_err.push("「"+input.attr("label")+"」不能为空！");
						}
						if((min.indexOf("weight")!=-1||min.indexOf("qty")!=-1||min.indexOf("cubage")!=-1)&&number(input.val())<0){
							_err.push("「"+input.attr("label")+"」不能小于0");
							if(!input.hasClass("error"))input.addClass("error");
						}
					}
				});
				if(_err.length>0){
					alert2(_err.join("<br/>"));
					setTimeout(function(){$(".error").removeClass("error");},3000);
					return false;
				}else return true;
			}else return true;
			//if(!this.validate)return true;
		};
	this.noValidate="";
	this.deleteValidate=function(s){
		this.noValidate=","+s+",";
	}
	this.addValidate=function(n,rules,msg){
		//this.validateData.fields[n]=rules;
		//if(typeof(msg)!="undefined"){this.validateData.msg[n]=msg;this.validateData.isMsg=true;}
	}
	this.id=arg.id;             //控件ID -必须有
	this.name=typeof(arg.name)!="undefined"?arg.name:arg.id;
	this.token=getTokenValue("token");//获得token
	this.modifyDate=typeof(arg.modifyDate)!="undefined"?arg.modifyDate:"";//修改字段名
	this.isGetAllCase==typeof(arg.isGetAllCase)!="undefined"?arg.isGetAllCase:false;//修改字段名
	this.action=arg.action;         //跳转路径 -必须有
	this.actionQuery=arg.actionQuery;
	this.pageSize=typeof(arg.pageSize)=="undefined"?100:arg.pageSize; //每页显示条数 默认20
	this.pageIndex=1;     //当前页号  默认第一页1
	this.pageTotal=1;     //总页数     默认1页
	this.idField=typeof(arg.idField)!="undefined"?arg.idField:"";      //数据集    主建 (执行查询后，可以获得)
	this.dsLines=[];      //子数据集合 类型 Dataset2
	this.rowMap={};       // key=rowId,value=row
	this.rows=[];         // 数据集的所有行
	this.rowId=0;         //最大的行号，自动增加  doAdd 该值 自动增加，只增不减
	this.allRowCount=0;   //数据总条数
	this.table=typeof(arg.table)=="undefined"?"":arg.table;      //表名
	this.addDataset=function(dsLines){this.dsLines=dsLines;};
	this.currentRow={};
	this.oldRows={};
	this.showError=null;
	this.showLoading=typeof(arg.showLoading)=="undefined"?true:arg.showLoading;
	this.showFields=typeof(arg.showFields)=="undefined"?"":arg.showFields;
	this.dblclick=function(rowNode,row){};
	this.click=function(rowNode,row){};
	this.isAppendPage=typeof(arg.isAppendPage)=="undefined"?false:arg.isAppendPage;
	this._rowsHtml={};
	this._controls=[];
	this.isOpenRow=typeof(arg.isOpenRow)=="undefined"?false:arg.isOpenRow;
	this.isShowAll=this.openCache?true:false;
	this.addField=function(v){this._fieldMap[v]=v;}
	this.queryId="";
	this._conctrolMap={};
	this._findEvt=null;
	this.executeId="";
	this.commitMode="change";//change all current select none(非FT规范模式，直接返回rows)
	this.beforChange=function(name,row,cellNode,rowNode){return true;};
	this.initRow=function(rowNode,row){}
	var isSelect=false;
	if(typeof(arg.commitMode)=="undefined"){
		if(this.id!="dsData")this.commitMode="all";
	}else this.commitMode=arg.commitMode;
	this._fieldMap={rowId:"rowId"};
	
	$("body").append('<div  id="no_rows_'+this.name+'" class="norowwarn"  style="color:#FFD91E;position: absolute;background-color:#353535;width:150px;text-align:center; height:50px;line-height:50px;display:none;">'+	
					'查无数据'+		
		'</div>');
	//-----------给Row-绑定change事件--------------------------
	this._bindRowChange=function(rowNode){
		var dataset=this;
		rowNode.find("[bind="+dataset.name+"][name]").each(function(){
			var node=$(this),n=node.attr("name");
			//dataset._fieldMap[n]=n;
			if(node.is("input")||node.is("textarea")||node.is("select"))node.bind("change",function(){
				dataset.format(node);
				var rowId=rowNode.attr("rowid");
				if(rowId==null&&dataset.currentRow!=null)rowId=dataset.currentRow.rowId;
				if(rowId!=null){
					rowId=rowId+"";
					var rr=dataset.rowMap[rowId],isCG=dataset.beforChange(n, rr, node, rowNode);
					var vlu="",vl=rr[n];
					if(node.is("input")&&node.attr("type")=="checkbox"){
						if(isCG)vlu=node.is(":checked")?"1":"0";
						else node.prop("checked",vl=="1"?"checked":false);
					}else if(node.is("input")&&node.attr("type")=="radio"){
						var radio=rowNode.find("input[type='radio'][name='"+n+"']");
						radio.each(function(){
							if(isCG&&$(this).is(":checked"))vlu=$(this).val();
							else if(!isCG&&$(this).val()==vl)$(this).prop("checked",vl=="1"?"checked":false);
						});
					}else{
						if(isCG)vlu=node.val();
						else node.val(vl);
					}
					var isTB=false;
					if(isCG){
						dataset.setModify(true);
						var oldRow={rowId:rowId};
						if(dataset.oldRows[rowId]!=null)oldRow=dataset.oldRows[rowId];
						if(oldRow[n]==null)oldRow[n]=vl;
						dataset.oldRows[rowId]=oldRow;
						rr[n]=vlu==null?null:$.trim(vlu);
						if(rr.state=="n"&&n!="select")rr.state="u";
						dataset.put(rowId, rr);
						isTB=true;
					}
					if(dataset.currentRow.rowId!=rowId){
						dataset.currentRow=rr;
						dataset.afterScroll(rr);
						isTB=true;
					}
					if(isTB){dataset.jsonToRow(rr);dataset._$evt();}
					if(isCG)dataset.change(n,rr, node,rowNode,vl);
				}
				dataset.format(node);
			}).keypress(function(evt){
				if(dataset.isNumber($(this))){
					var t=false,k=evt.which*1;
					if((k>=48&&k<=57)||(k==46&&$(this).val().indexOf(".")==-1)||(k==45&&$(this).val()=="")){t=true;}//||k==44
					return t;
				}
			}).blur(function(){
				if(dataset.isNumber($(this))){
					var s=$(this).val();
					if(isNull(s))$(this).val("0");
					else{
						var sz=[],d=false,s2="";
						for(var i=0;i<s.length;i++){
							var c=s.charAt(i);
							if("-0123456789.".indexOf(c+"")!=-1){sz.push(c);}
						}
						s2=sz.join("")
						if(s!=s2){$(this).val(s2);$(this).change();}
					}
				}
			}).focus(function(){
				if($(this).hasClass("error"))$(this).removeClass("error");
			});
		});
	};
	this.isNumber=function(node){
		var n=node.attr("name"),mn=n.toLowerCase(),isT=false;
		if(mn.indexOf("amt")!=-1||mn.indexOf("weight")!=-1||mn.indexOf("cubage")!=-1||mn.indexOf("qty")!=-1||mn.indexOf("price")!=-1){
			isT=true;
		}
		return isT;
	}
	this.events={};
	this.bindEvents=function(tp,evt){
		this.events[tp]=evt;
	}
	this.executeEvent=function(tp){
		var evt=this.events[tp];
		if(typeof(evt)=="function")evt();
	}
	this.format=function(node){
		var n=node.attr("name"),mn=n.toLowerCase(),vl=node.val(),vt=node.text();
		if(vl=="#{"+this.name+"."+n+"}")return;
		if(node.is("input")&&(mn.indexOf("amt")!=-1||mn.indexOf("price")!=-1)){
			var cv=isNull(vl)?"0.00":number(vl).toFixed(2);
			if(cv!=node.val())node.val(cv);
		}else if(node.is("input")&&mn.indexOf("weight")!=-1){
			var cv=isNull(vl)?"0.000":number(vl).toFixed(3);
			if(cv!=node.val())node.val(cv);
		}else if(node.is("input")&&mn.indexOf("qty")!=-1){
			var cv=isNull(vl)?"0":number(vl).toFixed(0);
			if(cv!=node.val())node.val(cv);
		}else if(node.is("input")&&mn.indexOf("cubage")!=-1){
			var cv=isNull(vl)?"0.0000":number(vl).toFixed(4);
			if(cv!=node.val())node.val(cv);
		}else if(!node.is("input")&&(mn.indexOf("amt")!=-1||mn.indexOf("price")!=-1)){
			var cv=isNull(vt)?"0.00":number(vt).toFixed(2);
			if(cv!=node.text())node.text(cv);
		}else if(!node.is("input")&&mn.indexOf("weight")!=-1){
			var cv=isNull(vt)?"0.000":number(vt).toFixed(3)
			if(cv!=node.text())node.text(cv);
		}else if(!node.is("input")&&mn.indexOf("qty")!=-1){
			var cv=isNull(vt)?"0":number(vt).toFixed(0).replace(",","");
			if(cv!=node.text())node.text(cv);
		}else if(!node.is("input")&&mn.indexOf("cubage")!=-1){
			var cv=isNull(vt)?"0.0000":number(vt).toFixed(4);
			if(cv!=node.text())node.text(cv);
		}
	}
	this.setModify=function(isT){
		if(isModify!=isT){
			isModify=isT;
		}
	};
	this._$evt=function(){
		try{
			var dataset=this;
			if(typeof(refreshForm)=="function")refreshForm(dataset);
			if(typeof(afterRefreshForm)=="function")afterRefreshForm(dataset);
		}catch(e){}
	};
	
	this._remarkNode=function(node){
		var dataset=this;
		var ls=node.find("[dataset]");
		if(ls.length==0){
			node.find("[name]").each(function(){
				if(typeof($(this).attr("bind"))=="undefined")$(this).attr("bind",node.attr("dataset"));
			});
		}
	}
	this.buid=function(){
		var dataset=this;
		$("[dataset='"+dataset.name+"']").each(function(i){dataset._doingBuid($(this));});
		this.getLabel();
	};
	this.getLabel=function(){
		var dataset=this;
		$("[dataset='"+dataset.name+"']").find("._section").each(function(){
			var c=$(this);
			$(this).find("[bind='"+dataset.name+"'][name]").each(function(){
				var lb=c.find("._left"),name=$(this).attr("name");
				dataset.labelMap[name]=lb==null||typeof(lb.text())=="undefined"?name:lb.text();
			});
		});
	};
	/* 循环表单
	*/
	this._find1=function(evt){
		var dataset=this;
		$("#"+dataset.validateId).find("._section").each(function(){
			var c=$(this);
			$(this).find("[bind='"+dataset.name+"'][name]").each(function(){
				$(this).data("field","1");
				evt($(this).attr("name"),$(this),c.find("._left"));
			});
		});
		$("#"+dataset.validateId).find("[name]").each(function(){
			var label=$(this).attr("label");
			if(typeof(label)!="undefined"&&$(this).data("field")!="1")evt($(this).attr("name"),$(this),null);
		});
	}
	this.labelMap={};
	this.replaceValue=function(html,isT){
		if(typeof(isT)=="undefined")isT=false;
		var dataset=this;
		try{
			while(html.indexOf("#{"+dataset.name+".")!=-1){
				var i=html.indexOf("#{"+dataset.name+".")+3+(dataset.name+"").length;
				var $h2=html.substring(i,html.length);
				var $h3=$h2.substring(0,$h2.indexOf("}"));
				dataset._fieldMap[$h3]=$h3;
				if(!isT)html=html.replace(eval("/#{"+dataset.name+"."+$h3+"}/gi"),"");
				else html=html.replace(eval("/#{"+dataset.name+"."+$h3+"}/gi"),"*\" bind=\""+dataset.name+"\" attr_name=\""+$h3+"");
			}
		}catch(e){
		}finally{}
		return html;
	}
	this._bindNode=function(node,$z){
		var dataset=this,name=node.attr("name"),$f="#{"+dataset.name+"."+name+"}";
		node.attr("rowid",$z);
		dataset._fieldMap[name]=name;
		if(!isSelect&&name=="select")isSelect=true;
		if(node.is("img"))node.attr("src",$f);
		else if(node.hasClass("radios-option")){
			 if(isNull($(this).attr("lx"))){
				 node.attr("lx",node.text());
				 node.attr("value",$f);
			 }
		}else if(node.is("span")||node.is("div")||node.is("li")||node.is("td")||node.is("th"))node.html($f);
		else node.attr("value",$f);
	}
	this.refreshTime=0;
	this.setAutoDropDown=function(v){
		var dataset=this;
		clearTimeout(dataset.refreshTime);
		if(v==undefined)return;
		v.on("keydown",function(){
			var lv=dataset.params.findString;
			var  value=lv==null?"":lv;
			v.on("keyup",function(){
				var upValue=v.val();
				clearTimeout(dataset.refreshTime);
				dataset.refreshTime=setTimeout(function(){
					if(upValue!=value){
						if(isNull(upValue)) delete dataset.params["findString"];
						else dataset.params.findString=upValue;
						dataset.doQuery(dataset._findEvt);
					}
				},500);
			})
		}).on("blur",function(){
			v.off("keyup");
		});
	}
	this._doingBuid=function(node){
			var dataset=this;
			dataset._remarkNode(node);
			var _class=node.attr("_class");
			var id=dataset.name+"_"+_class+"_"+getKey(),$z="#{"+dataset.name+".rowId}";
			node.attr("datasetid",id);
			if("rows"==_class){
				node.find("[bind='"+dataset.name+"'][_class='row']").each(function(){
					var $r=$(this);
					$r.attr("rowid",$z);
					if($r.attr("name"))dataset._bindNode($(this),$z);
					$r.find("[bind="+dataset.name+"][name]").each(function(){dataset._bindNode($(this),$z);});
					var hv=$r.prop("outerHTML").replace(eval("/_jqr=\"\"/gi"),"");
					dataset.replaceValue(hv);
					dataset._conctrolMap[id]=hv;
					//setTokenValue(id,hv);
					$r.remove();
				});
				dataset._controls.push({"id":id,"_class":_class,"html":dataset._conctrolMap[id]});
			}else if("row"==_class){
				dataset._controls.push({"id":id,"_class":_class});
				if(dataset.isOpenRow){
					var h=node.html();
					h=dataset.replaceValue(h,true);
					node.html(h);
				}
				node.unbind("click").bind("click",function(){
					dataset.click(node,dataset.currentRow);
				});
				dataset._bindRowChange(node);
			}else if("params"==_class){
				dataset._controls.push({"id":id,"_class":_class});
			}
	}

	this.buid();
	if(isSelect)this.commitMode="select";
	this._deleteRow=function(row,isDelete){
		if(row==null)return;
		var dataset=this,rs=dataset._controls;
		for(var i=0;i<rs.length;i++){
			var js=rs[i];
			if(js._class=="rows"){
				var prev_id="",next_id="",fed=false,cur_id="";
				$("[datasetid='"+js.id+"']").find("[_class='rowData']").each(function(){
					if($(this).attr("rowid")==row.rowId){
						fed=true;
						if(isDelete)$(this).remove();
						else{$(this).addClass("hideNode");}
					}else{
						if($(this).css("display")!="none"){
							if(!fed)prev_id=$(this).attr("rowid");
							if(fed&&next_id=="")next_id=$(this).attr("rowid");
						}
					}
				});
				
				if(row.rowId==dataset.currentRow.rowId){
					cur_id=next_id==""?prev_id:next_id;
					dataset.currentRow=dataset.rowMap[cur_id]==null?{}:dataset.rowMap[cur_id];
					dataset.jsonToRow(dataset.currentRow);
					dataset.afterScroll(dataset.currentRow);
					dataset._$evt();
				}
			}
		}
		if(isDelete)dataset._remove(row.rowId);
	};
	//--------------删除------------
	this.change=function(name,row,cellNode,rowNode,oldValue){};
	this.doDelete=function(ids,evt){
		var dataset=this,rows=[];
		this.executeId=new Date().getTime();
		if(typeof(ids)=="string"){
			var paramObj={"action":"/"+dataset.action+"/del/"+ids,"params":dataset.params,"showError":dataset.showError,"showLoading":dataset.showLoading,"queryId":dataset.queryId,"executeId":dataset.executeId};
			doAjaxUpdate(paramObj,function(data){
				try{
					if(number(dataset.executeId)!=number(data.executeId))return;
					if (data.status=="1"){
							dataset.outParams=data.outParams;
							var drows=[];
						   for(var s in dataset.rowMap){
							   var row=dataset.rowMap[s],id=row[dataset.idField];
							   if(!isNull(id)&&(","+ids+",").indexOf(","+id+",")!=-1){
								   rows.push({rowId:row.rowId});
								}
						   }
						  
						   for(var d=0;d<rows.length;d++){
							   var deleteRow=rows[d]
								  dataset.shareData(deleteRow);
								  dataset.clearRows([deleteRow]);
						   }
							var arr_del=ids.split(",");
						    dataset.deleteTiuloRow(arr_del,function(){});
					}
				}finally{
					if(typeof(evt)=="function")evt(); 
				}
			 });
		}else if(typeof(ids)!="undefined"&&typeof(ids.length)=="number"){
			rows=ids;
			var arrs=[];
			for(var i=0;i<rows.length;i++){
				var r=rows[i];
				if(r.state!="i"){
					arrs.push(r[dataset.idField]);
				}else{ dataset._deleteRow(r,true);}
			}
			if(arrs.length>0)dataset.doDelete(arrs.join(","), evt);
		}else if(typeof(ids)=="undefined"||typeof(ids.rowId)!="undefined"){
			var row=typeof(ids)=="undefined"?dataset.currentRow:ids;
			if(row==null||isNull(row.rowId))return;
			if(row.state!="i"){
				var delete_key=row[dataset.idField];
				var paramObj={"action":"/"+dataset.action+"/del/"+delete_key,"params":dataset.params,"showError":dataset.showError,"showLoading":dataset.showLoading,"queryId":dataset.queryId,"executeId":dataset.executeId};
				doAjaxUpdate(paramObj,function(data){
				       if(number(dataset.executeId)!=number(data.executeId))return;
					   if (data.status=="1"){
						   dataset.outParams=data.outParams;
				    	   if(typeof(evt)=="function")evt(row); 
						   dataset.deleteTiuloRow([delete_key],function(){});
						   dataset.shareData(row);
				    	   dataset._deleteRow(row,true);
				       }
					  if(typeof(evt)=="function")evt(); 
				});
			}else{
				dataset._deleteRow(row,true);
			}
		}
	};
	this.target=null;
	this.copyDataset=function(d){
		if(typeof(d)=="undefined")return;
		this.idField=d.idField;
		this.modifyDate=d.modifyDate;
		if(this.action==null)this.action=d.action;
		if(this.queryAction==null&&typeof(d.queryAction)!="undefined")this.queryAction=d.queryAction;
		this.token=d.token;
		this.table=d.table;
		this.showFields=d.showFields;
		this.target=d;
		this.rowId=d.rowId;
		this._cache_key=d._cache_key;
		this.allRowCount=d.allRowCount*1;
		this.pageIndex=d.pageIndex;
		this.pageTotal=d.pageTotal;
		this.pageSize=d.pageSize;
		this.cacheData=d.cacheData;
		this._cache_value=d._cache_value;
		this.openCache=d.openCache;
		if(!isNull(this.table))DatasetMap[this.name]=this.table;
	}
	this.doRemove=function(row){
		var r=row;
		if(typeof(row)=="undefined")r=this.currentRow;
		if(r.state!="i"){
			r.state="d";
			this.put(r.rowId, r);
		}
		this._deleteRow(r,false);
		this.setModify(true);
	};
	this.doCancel=function(){
		try{
			var dataset=this;
			var row=dataset.oldRows;
			for(var rid in row){
				var cr=row[rid];
				var r1=dataset.get(rid);
				for(var s in cr){
					r1[s]=cr[s];
				}
				dataset.put(rid, r1);
			}
			for(var rowId in dataset.rowMap){
				var r=dataset.rowMap[rowId];
				if(r.state=="i"){dataset._deleteRow(r,true);dataset._remove(rowId);}
				else{r.state="n";}
				dataset.put(rowId, r);
			}
			dataset.showDeleteRow();
			dataset.jsonToRows();
			dataset.oldRows={};
			dataset.setModify(false);
		}catch(e){}
	};
	this.clearRows=function(rows){
		try{
			if(rows.length==0)return;
			var hm={},dataset=this;
			for(var i=0;i<rows.length;i++){var rid=rows[i].rowId;hm[rid]=rid;}
			var ids=[];
			this.scrollRow(function(node,row){
				if(hm[row.rowId]!=null){
					dataset._remove(row.rowId);
					if(!isNull(dataset.idField)){
						ids.push(row[dataset.idField]);
					}
					var pNode=node.parent();
					if(pNode.hasClass("order-list-group")){
						if(pNode.find("[_class='rowData']").length==1)pNode.remove();
						else node.remove();
					}
					else node.remove();
				}
			});
			if(this.openCache&&ids.length>0){
				this.removeKeyId(ids.join(","));
			}
		}catch(e){}
	}
	//--------------清空数据---------
	this.clearData=function(){
		var dataset=this;
		for(var t in this.timeout){
			clearTimeout(this.timeout[t]);
		}
		if(arguments.length==0){
			var arr=dataset._controls;
			if(typeof(arr)!="undefined"&&arr!=null&&arr.length>0){
				for(var i=0;i<arr.length;i++){
					var js=arr[i];
					if(js._class=="rows"){
						var rowDatas=$("[datasetid='"+js.id+"']").find("[_class='rowData']");
						rowDatas.each(function(){
							var node=$(this);
							if(node.parent().hasClass("order-list-group"))node.parent().remove();
							else node.remove();
						});
					}else if(js._class=="row"){$("[datasetid='"+js.id+"']").find("input[type='text']").val("");}
				}
			}
			
			dataset.rowMap={};
			dataset._rowIdMap={};
			dataset.rows=[];
			dataset.oldRows={};
			for(var x=0;x<dataset.dsLines.length;x++){dataset.dsLines[x].clearData();}
		}else{
			var t=arguments[0];
			if(typeof(t.length)=="undefined")dataset._deleteRow(t, true);
			else{
				for(var i=0;i<t.length;i++){
					var r=t[i];
					dataset._deleteRow(r, true);
				}
			}
		}
	};
	//------------下一页----------
	
	this.nextPage=function(){
		this._isExport=false;
		this._isImport=false;
		var evt=this._findEvt;
		for(var i=0;i<arguments.length;i++){
			var p=arguments[0];
			if(typeof(p)=="boolean")this.isAppendPage=p;
			else if(typeof(p)=="function")evt=p;
		}
		//微信端判断
		if(this.pageIndex*1==this.pageTotal*1){if(typeof($("#load_animal").prop("outerHTML"))!='undefined'){$("#load_animal").html("已是最后一页"); setTimeout(function(){$("#load_animal").remove()},2000);}}
		if(this.pageIndex*1==this.pageTotal*1){return false;}
		if(this.isAppendPage&&!this._appendData)this._appendData=true;
		this.pageIndex=this.pageIndex*1+1;   
		this._executeQuery(evt);
	};
	
	this.gotoPage=function(i){
		this._isExport=false;
		this._isImport=false;
		if(i==this.pageIndex)return;
		this.pageIndex=i
		this._executeQuery(this._findEvt);
	};
	//上一页
	this.prevPage=function(evt){
		this._isImport=false;
		this._isExport=false;
		var evt=this._findEvt;
		for(var i=0;i<arguments.length;i++){
			var p=arguments[0];
			if(typeof(p)=="boolean")this.isAppendPage=p;
			else if(typeof(p)=="function")evt=p;
		}
		if(this.isAppendPage)return;
		if(this.pageIndex<=1){return false;}
		this.pageIndex=this.pageIndex*1-1;
		this._executeQuery(evt);
	};
	
	this.bindRowEvent=function(cuRow){
		try{
			var dataset=this,rowId=cuRow.attr("rowid"),rr=dataset.rowMap[rowId];
			cuRow.bind("click",function(event){
				if(dataset.currentRow==null||dataset.currentRow.rowId!=rr.rowId){
					dataset.currentRow=rr;
					dataset.afterScroll(rr);
					setTimeout(function(){dataset.jsonToRow(rr);},1);
					dataset._$evt();
				}
				dataset.click(cuRow, rr);
			}).bind("dblclick",function(){
				var rowId=cuRow.attr("rowid"),rr=dataset.rowMap[rowId];
				dataset.dblclick(cuRow,rr);
			});

			dataset._bindRowChange(cuRow);
				
		}catch(e){
		}finally{
			try{dataset.initRow(cuRow,rr);}catch(ee){}
		}
	};
	this.showNoRowBody=function(){
		if(!this.showLoading)return;
		var mdk=$("#no_rows_"+this.name);
		var h=(document.body.clientHeight-50)/2,w=(document.body.clientWidth-150)/2;
		mdk.css({top:h,left:w});
		mdk.show();
		setTimeout(function(){
			mdk.hide();
		},2000);
	}
	//增行
	this.doAdd=function(data,isAfter2){//isAfter值为true,表示数据更新在页面数据行的最后，------------wangcl 2016.4.28
		var isAfter=typeof(isAfter2)=="boolean"?isAfter2:false;
		var rowNumber=typeof(isAfter2)=="number"?isAfter2:-1;
		var dataset=this;
		var rowId=typeof(data)!="undefined"&&data.rowId!=null?data.rowId:getRowId()+'';//(new Date().getTime()+"");
		var newRow={};
		if(!isNull(data)){
			for(var f in data){
				newRow[f]=data[f];
			}
		}
		newRow.rowId=rowId;
		if(typeof(data)=="undefined"||data.state==null)newRow.state="i";
		dataset.put(rowId, newRow);
		var row=dataset.rowMap[rowId];
		try{
			var arr=dataset._controls;
			for(var i=0;i<arr.length;i++){
				var js=arr[i];
				if(js._class=="rows"){
					var h=dataset.getRowHtml(js.id,row);
					if(h==null){
						if(js==null||js.html==null)h=dataset._conctrolMap[js.id];
						else h=js.html;
					}
					var ff=dataset._fieldMap;
					for(var f in ff){
						if(row[f]==null)row[f]="*";
					}
					var html=h;
					if(typeof(html)=="undefined"||isNull(html))continue;
					for(var rv in row){
						var vl=dataset.initValue(rv,row);
						if(typeof(vl)=="undefined"||vl==null)vl=isNull(row[rv])?"":row[rv];
						html=html.replace(eval("/#{"+dataset.name+"."+rv+"}/gi"),vl);
					}
					html=html.replace("\"row\"","\"rowData\"");
					var $row=$(html);
					dataset.bindRowEvent($row);
					var isAppend=false;
					if(!isAfter){
						$("[bind='"+dataset.name+"'][_class='rowData']").each(function(i){
							if(i==0&&rowNumber==-1){isAppend=true;$(this).before($row);return false;}
							else if(rowNumber!=-1&&i==rowNumber-1){isAppend=true;$(this).before($row);return false;}
						});
					}
					if(!isAppend){
						 $("[datasetid='"+js.id+"']").append($row);
					}
					$("[datasetid='"+js.id+"']").find("input[type='checkbox']").each(function(){
						$(this).prop("checked",$(this).attr("value")=="1"?"checked":false);
					});
				}
			}
		}catch(e){}
		dataset.currentRow=row;
		dataset.jsonToRow(row);
		dataset.afterScroll(row);
		dataset._$evt();
		dataset.setModify(true);
		
	};
	this._$1=function(v){var r={};for(var s in v){if(s=="state")continue;r[s]=v[s]};}
	this.set=function(row,row_number){
		if(row==null)row={};
		if(row.rowId==null&&this.currentRow.rowId!=null)row.rowId=this.currentRow.rowId;
		var r=this.rowMap[row.rowId];
		if(r==null&&row.rowId!=null){
			this.doAdd(row,row_number);
			this.currentRow.rowId=row.rowId;
			var nr=this.currentRow;
			this.put(nr.rowId+"",nr);
			if(nr.state=="n")this.oldRows[nr.rowId]=this._$1(nr);
		}else if(r!=null){
			var old=this.oldRows[row.rowId+""];
			for(var p in row){
				if(r[p]!=row[p]){
					if(old==null)old={"rowId":row.rowId};
					if(old[p]==null)old[p]=r[p];
					//if(r.state=="n"){r["state"]="u";}
					r[p]=row[p];
				}
			}
			if(r.state=="n"){r["state"]="u";}
			if(old!=null)this.oldRows[row.rowId+""]=old;
			this.put(row.rowId, r);
			this.jsonToRow(r,row_number);
		}
	};
	this.refresh=function(){
		this.put(this.currentRow.rowId, this.currentRow);
		this.jsonToRow(this.currentRow);
	};
	this.copyRow=function(row){
		this.doAdd();
		var r=this.currentRow;
		for(var p in row){
			if(p==null||p=="rowId")continue;
			r[p]=row[p];
		}
		if(this.idField!="")r[this.idField]="";
		this.put(r.rowId, r);
		this.jsonToRow(r,"all");
	};
	
	this.afterScroll=function(row){};
	this.doExecute=function(evt){
		var dataset=this;
		dataset.executeId=new Date().getTime();
		doAjaxQuery({"action":"/"+dataset.action+"/execute","params":dataset.params,"showError":dataset.showError,"showLoading":dataset.showLoading,"queryId":dataset.queryId,"executeId":dataset.executeId},function(data){
			if(number(dataset.executeId)!=number(data.executeId))return;
			if(typeof(evt)=="function")evt(data);
		});
	};
	this.outParams={};
	//保存
	this.doSave=function(evt){//保存
		this.executeId=new Date().getTime();
		var ds=this;
		var datasets={},rs=ds.getRows(ds.commitMode);

		if(ds.id=="dsData") {
			datasets = {"dsData": {"rows": rs}};
		}else{
			datasets={"dataset":{"rows":rs}};
		}
		if(rs.length==0){return;}

		for(var x=0;x<ds.dsLines.length;x++){
			var ds_line=ds.dsLines[x];
			datasets[ds_line.id]={};
			datasets[ds_line.id].rows=ds_line.getRows(ds_line.commitMode);
		}
		var isExec=ds.submit();
		if(!isExec){
			ds.onError();
			return false;
		}
		var saveParam={"action":"/"+ds.action+"/save","datasets":datasets,"params":ds.params,"showError":ds.showError,"showLoading":ds.showLoading,"queryId":ds.queryId,"executeId":ds.executeId,"onFailure":ds.onError};
		saveParam["fields"]=ds.labelMap;
			doAjaxUpdate(saveParam,function(data){
					if(number(ds.executeId)!=number(data.executeId))return;
					if(data.status=="1")ds.oldRows={};
					ds.jsonToUI(data,false);
					if(ds.openCache){
						ds.insertIndexData("save",data,function(modifyData){});
					}
					var b=ds.dsLines.length;
					if(b>0){
						for(var a=0;a<b;a++){
							var dsa=ds.dsLines[a];
							var rs=data.datasets[dsa.id].rows;
							if(rs==null||rs.length==0)continue;
							for(var c=0;c<rs.length;c++){
								var nr=rs[c];
								if(nr==null)continue;
								var oldR=dsa.rowMap[nr.rowId];
								if(oldR==null)continue;
								for(var k in nr){
									oldR[k]=nr[k];
								}
								dsa.set(oldR);
							}
						}
					}
					
					ds.outParams=data.outParams;
					if(typeof(evt)=="function"&&data.status=="1")evt(data);
					ds.shareData();
				});
	};
	this.setDatas=function(dsCopyData){
		var dataset=this;
		dataset.jsonToUI({"dataset":{rows:dsCopyData.rows,"idField":dsCopyData.idField,"modifyDate":dsCopyData.modifyDate,"pageSize":dsCopyData.pageSize,
			"pageIndex":dsCopyData.pageIndex,"pageTotal":dsCopyData.pageTotal,"allRowCount":dsCopyData.allRowCount}},true);
		dataset.initPagination();
	}
	this.shareData=function(row){
		if(this.target==null)return;
		var dataset=this;
		if(typeof(row)=="undefined"||row==null){
			for(var i=0;i<dataset.rows.length;i++){
				var r=dataset.rows[i];
				dataset.target.set(r);
			}
		}else{
			dataset.target.clearRows([row]);
		}
		dataset.target.shareData(row);
	}
	this.getRows=function(state){
		var dataset=this,rs=[];
		if(state=="current"){
			rs.push(dataset.currentRow);
			return rs;
		}
		if(state=="none"){//非FT规范时，保存的数据直接 写到rows中的
			return this.rows;
		}

		for(var r in dataset.rowMap){
			if(dataset.rowMap[r]==null)continue;
			var row=dataset.rowMap[r];
			if(state=="select"){
				if(row.select==true||row.select=="1")rs.push(row);
			}else if(state=="all"){ 
				rs.push(row);
			}else if(state=="change"){ 
				if(row.state=="n")continue;
				if(row.state=="i")rs.push(row);
				else if(row.state=="d"){
					var nr={rowId:row.rowId};
					nr[dataset.idField]=row[dataset.idField];
					nr[dataset.modifyDate]=row[dataset.modifyDate];
					nr.state="d";
					rs.push(nr);
				}else{
					var oldR=dataset.oldRows[row.rowId];
					var nr={rowId:row.rowId,state:"u"};
					nr[dataset.idField]=row[dataset.idField];
					nr[dataset.modifyDate]=row[dataset.modifyDate];
					//if(oldR!=null){
						for(var s in row){
							//if(oldR[s]==null||oldR[s]==row[s])continue;
							nr[s]=row[s];
						}
					//}
					rs.push(nr);
				}
			}
		}
		return rs;
	};
	this._isExecute=false;
	this.cacheData=null;
	this._executeQuery=function(evt){
		var md=this,arr=md._controls;
		if((!md.isAppendPage||!md._appendData||md._isImport)&&!md._isExport){md.clearData();}
		var params={};
		for(var i=0;i<arr.length;i++){
			var json=arr[i];
			if(json._class=="params"){
				$("[datasetid='"+json.id+"']").find("[bind="+md.name+"][name]").each(function(){
					var vl="",node=$(this);
					if(node.is("input")&&node.attr("type")=="radio"){if(node.is(":checked"))vl=node.val();}
					else if(node.is("input")&&node.attr("type")=="checkbox"){
						vl=node.is(":checked")?"1":"0";
					}else if(node.is("input")||node.is("select")||node.is("textarea"))vl=node.val();
					else vl=node.text();
					if(!isNull(vl)){
							params[node.attr("name")]=$.trim(vl);
					}
				});
			}
		}
		
		if(!isNull(md.params)){
			for(var p in md.params){
				var lv=md.params[p];
				lv=lv==null?"":$.trim(lv)
				params[p]=lv;
			};
		};
		var a=[];
		for(var s in this._fieldMap){
			if((","+this.showFields+",").indexOf(","+s+",")==-1)a.push(s);
			
		}
		if(a.length>0)this.showFields=this.showFields+(this.showFields==""?"":",")+a.join(",");
		var beforParam={"action":md.actionQuery!=null?md.actionQuery:"/"+md.action+"/query",
			"params":params,
			"pageIndex":md.pageIndex,
			"pageSize":md.pageSize,
			"showError":md.showError,
			"showLoading":md.showLoading,
			"showFields":md.isShowAll?null:md.showFields,
			"rowId":md.rowId,
			"queryId":md.queryId,
			"executeId":md.executeId
		};
		if(md._isExport){
			beforParam.action=beforParam.action.replace("/query","/export/query");
		}
		if(md._isImport){
			beforParam.action=beforParam.action.replace("/query","/import/query");
		}
		if(!md.isAppendPage||!md._appendData){
			$("[dataset='"+md.name+"']").find("[_class='rowData']").remove();
		}			
		if(!md._isExport&&!md._isImport){
			md.setWebKey(beforParam);
			if(md.openCache){
				md._isExecute=false;
				md.getWebDatas(function(map){
					md.cacheData=map;
					var action_ids=md._cache_value==null?null:md._cache_value.action_ids;
					var data_arr=md.mapToArray(action_ids,map);
					var data=data_arr.length==0?null:{status:"1","dataset":{"allRowCount":md.allRowCount,id:md.id,idField:md.idField,modifyDate:md.modifyDate,modifyUser:md.modifyUser,pageIndex:md.pageIndex,pageSize:md.pageSize,pageTotal:md.pageTotal,rowId:data_arr.length,rows:data_arr}};
					if(data!=null){
						if(!md._isExecute){
							console.log("是缓存数据");
							md._$query(true,data,evt);
						}
					}
					if(map!=null)myTip.close();
				});
				setTimeout(function(){
					doAjaxQuery(beforParam,function(data){
							if(!md._isImport&&number(md.executeId)!=number(data.executeId))return;
							md._isExecute=true;
							md._$query(false,data,evt)
					});
				},1);
				
			}else{
				doAjaxQuery(beforParam,function(data){
						if(!md._isImport&&number(md.executeId)!=number(data.executeId))return;
						md._$query(false,data,evt)
					}
				);
			}
		}else{
			doAjaxQuery(beforParam,function(data){
					if(!md._isImport&&number(md.executeId)!=number(data.executeId))return;
					md._$query(false,data,evt)
				}
			);
		}
		this.setModify(false);
	};
	this.refresh=function(row){
		return true;
	}
	this._$query=function(isCache,data,evt){
		var md=this;
		try{
			var endTime=new Date().getTime();
			md.queryStartTime=endTime;
			if(data.status=="1"&&!md._isExport&&!md._isImport){
				try{
					md.status=data.status;
					md.token=data.token;
					if(!md.openCache||(md.openCache&&(!md._isExecute||(md._isExecute&&md.cacheData==null)))){
						md.jsonToUI(data,true,evt);
					}
					if(md.openCache&&!isCache&&!isNull(md.table)&&!isNull(md.idField)){
						md.insertIndexData("query",data,function(modifyData){
							if(modifyData!=null&&modifyData.length>0&&md.cacheData!=null){
								for(var i=0;i<modifyData.length;i++){
									var rs=modifyData[i];
									if(rs!=null){
										md.set(rs);
										var node=$("[bind='"+md.name+"'][_class='rowData'][rowid='"+rs.rowId+"']");
										md.initRow(node,md.rowMap[rs.rowId]);
									}
								}
								evt(data);
							}
						});
					}
				}catch(ee){
					console.log(ee)
				}
			}else{
				if(typeof(evt)=="function"&&(data.status=="1"||md._isImport)){evt(data);}
			}
		}catch(e){
		}finally{
			md.afterQuery();
			setTimeout(function(){md.initPagination();},100);
			if(!isCache&&md.showLoading&&md.rows.length==0){
				md.showNoRowBody();
			}
			//关闭微信端动画
			if(typeof($("#load_animal").prop("outerHTML"))!='undefined'){
				$("#load_animal").remove();
				is_load=true;
			}
		}
	};
	this.afterQuery=function(){}
	//查询
	this.doQuery=function(){//查询
		for(var t in this.timeout){
			clearTimeout(this.timeout[t]);
		}
		if(this.showLoading){
			$(".norowwarn").hide();
		}
		var date=new Date();
		this.queryStartTime2=date.getTime();
		this.executeId=new Date().getTime();
		var evt;
		if(arguments.length==2) {
			this.pageIndex = arguments[0]
			evt = arguments[1];
		}if(arguments.length==1){
			if (typeof(arguments[0])=="function"){
				this.pageIndex=1;
				evt = arguments[0];
			}else{
				this.pageIndex=arguments[0];
			}
		}
		this.cacheData=null;
		this._appendData=false;
		this._isExport=false;
		this._isImport=false;
		this._executeQuery(evt);
		this._findEvt=evt;
	};
	this._isOpenImport=false;
	this.closeImport=function(){
		this._importCloseBut.click();
	};
	this.doImport=function(evt){
		this._isExport=false;
		var dataset=this;
		if(!this._isOpenImport){
			this._isOpenImport=true;
			//$("[dataset='"+dataset.name+"']").each(function(i){
				//if(i==0){
					$("body").append('<div onmousewheel="return false;" class="modal fade" id="'+dataset.name+'_importDiv" tabindex="-1" role="dialog"  aria-hidden="true" style="width:100%;display:none">'+
					'<div class="modal-dialog" style="width:500px;height: 201px;">'+
					'<div class="modal-content">'+
					'<div class="modal-header">'+
					'<button id="'+dataset.name+'_close" type="button" class="close"  data-dismiss="modal" aria-hidden="true"> &times; </button>数据导入'+
					'</div>'+
					'<div class="modal-body">'+
					'<iframe  name="'+dataset.name+'_webframe" src="../../sys/import.jsp?dataset='+dataset.name+'" width="100%" height="80px"  marginheight="0" marginwidth="0" frameborder="0" top="0" left="0" ></iframe>'+
					'</div>'+
					'<div class="modal-footer">'+
					'<div class="fr">\
					<a href="../_wl/import/'+dataset.action+'.xls" class="btn fl btn-primary m10l btn_modal_add" id="'+dataset.name+'_file_dowmload">下载模板</a>\
					<a class="btn fl btn-primary m10l btn_modal_add" id="'+dataset.name+'_file_upload">上传</a>\
					</div></div>'+
					'</div>'+
					'</div>'+
					'</div>');
					$("#"+dataset.name+"_file_upload").unbind("click").click(function(){
						window.frames[dataset.name+"_webframe"].upload_xls();
					});
					//$("#"+dataset.name+"_file_dowmload").unbind("click").click(function(){
						
					//});
				//}

			//})
			this._importCloseBut=$("#"+dataset.name+"_close");
		}
		$("#"+dataset.name+"_importDiv").modal({keyboard: true});
		$("#"+dataset.name+"_importDiv").find(".modal-backdrop").css("min-height","100%");
		if(typeof(evt)=="function"){
			this.importEvt=evt;
		}
		// 弹窗居中
		var w = (document.body.clientWidth-500)/2;
		var h = (document.body.clientHeight-200)/2-40-$("#tms___order").find(".filter").height();
		$("#"+dataset.name+"_importDiv").find(".modal-dialog").css("margin-left",w + "px").css("margin-top",h +"px");
	};
	this.importEvt=function(){};
	this._isExport=false;
	this.doExport=function(evt){
		this.executeId=new Date().getTime();
		this._isExport=true;
		this._isImport=false;
		this._executeQuery(evt);
	};
	this._isImport=false;
	this._doingImport=function(evt){
		this.executeId=new Date().getTime();
		this._isImport=true;
		this._executeQuery(evt);
	};
	this.onError=function(){}
	this.onFailure=function(evt){
		this.onError=evt;
	}
	this._rowIdMap={};
	this.getRow=function(key){
		return this.rowMap[this._rowIdMap[key]];
	}
	this.getRowHtml=function(id,row){};
	this.initValue=function(name,row){return null;}
	this.appendHtml=function(id,rowNodes){
		var dataset=this;
		rowNodes.each(function(){dataset.bindRowEvent($(this));});
		$("[datasetid='"+id+"']").append(rowNodes);
	}
	//json 数据同步到界面上
	this.dataLoadIndex=0;
	this.timeout={};
	this.jsonToUI=function(data,isQuery,evt){
		try{
			var dataset=this;
		    if(data.datasets==null && data["dataset"]==null){if(typeof(evt)=="function"&&(data.status=="1"||dataset._isImport)){evt(data);}return;}
		    var rows;
		    var dst= (data["dataset"]==null?data.datasets["dsData"]:data["dataset"]);
		    rows=dst.rows;
			var saveMap={};
	    	if(isQuery)dataset.rowId=dst.rowId;
	    	if(!isNull(dst.idField))dataset.idField=dst.idField;
	    	if(!isNull(dst.modifyDate))dataset.modifyDate=dst.modifyDate;
	    	if(!isNull(dst.table))dataset.table=dst.table;
			if(!isNull(dataset.table))DatasetMap[dataset.name]=dataset.table;
	    	if(isQuery){
				dataset.allRowCount=dst.allRowCount;
				dataset.pageTotal=dst.pageTotal;
			}
	    	dataset.queryId=dst.queryId;
		    if(rows==null||rows.length==0){if(typeof(evt)=="function"&&(data.status=="1"||dataset._isImport)){evt(data);}return;}
			var lenth=rows.length;
		    if(isQuery==true){
		    	for(var x=0;x<lenth;x++){
		    		var row=rows[x];
					var cu_rowId=new Date().getTime()+""+x;
					if(!isNull(dataset.idField)&&!isNull(row[dataset.idField])&&row[dataset.idField]!="*")cu_rowId=row[dataset.idField];
					else if(!isNull(row["rowId"]))cu_rowId=row.rowId
		    		row.state="n";
					row.rowId=cu_rowId;
					dataset._rowIdMap[cu_rowId]=cu_rowId;
		    		dataset.rowMap[cu_rowId+""]=row;
		    	}
		    	if(!dataset.isAppendPage||!dataset._appendData){
		    		dataset.rows=rows;
		    		dataset.currentRow=rows[0];
		    	}else{
		    		for(var j=0;j<lenth;j++){
		    			dataset.rows.push(rows[j]);
		    		}
		    	}
		    }else{
		    	for(var x=0;x<lenth;x++){
		    		var row=rows[x];
					saveMap[row.rowId]=row;
		    		var oldR=dataset.get(row.rowId);
		    		if(oldR!=null){
			    		for(var s in row){
			    			oldR[s]=row[s];
			    		}
			    		dataset.put(row.rowId, oldR);
		    		}
		    	}
		    }
			var ct=dataset._controls,psz=10,isHaveRow=false;
			if(ct==null||ct.length==0){
				if(typeof(evt)=="function"&&(data.status=="1"||dataset._isImport)){evt(data);}
				return;
			}
			for(var m=0;m<ct.length;m++){
				var r=ct[m];
				if(r==null||r._class==null)continue;
				if(r._class=="rows"){
					isHaveRow=true;
					if(isQuery==true){
						if(!dataset.isAppendPage||!dataset._appendData){
							$("[datasetid='"+r.id+"']").find("[_class='rowData']").remove();
						}
						var arrHtml=[];
						for(var i=0;i<lenth;i++){
							var row=rows[i];
							var h=dataset.getRowHtml(r.id,row);
							if(typeof(h)=="undefined"){
								if(r.html==null)h=dataset._conctrolMap[r.id];
								else h=r.html;
							}
							var html=h,vl;
							if(typeof(html)=="undefined"||isNull(html))continue;
							for(var rv in dataset._fieldMap){
								vl=dataset.initValue(rv,row);
								if(typeof(vl)=="undefined"||vl==null||vl=="")vl=isNull(row[rv])?"":row[rv];
								html=html.replace(eval("/#{"+dataset.name+"."+rv+"}/gi"),dataset.numberValue(rv,vl));
							}
							html=html.replace("\"row\"","\"rowData\"");
							var t=i+1;
							var t2=(t%psz>0?(t-t%psz)/psz+1:t/psz)-1;
							var arrHtml_sz=arrHtml[t2]==null?[]:arrHtml[t2];
							arrHtml_sz.push(html)
							arrHtml[t2]=arrHtml_sz;
						}
						if(arrHtml.length>0){
							for(var m=0;m<arrHtml.length;m++){
								if(m==0){
									if(isQuery&&(!dataset.isAppendPage||!dataset._appendData)){$("[datasetid='"+r.id+"']").html("");}
									dataset.dataLoadIndex=0;
									dataset.appendHtml(r.id,$(arrHtml[0].join("")));
									if(m==arrHtml.length-1){
										if(typeof(evt)=="function"&&(data.status=="1"||dataset._isImport)){evt(data);}
									}
								}else{
									var ts=setTimeout(function(){
										dataset.dataLoadIndex++;
										try{
											if($("[datasetid='"+r.id+"']").attr("datasetid")==r.id){
												var h1=arrHtml[dataset.dataLoadIndex];
												if(h1!=null&&h.length>0)dataset.appendHtml(r.id,$(h1.join("")));
												if(dataset.dataLoadIndex==arrHtml.length-1){
													if(typeof(evt)=="function"&&(data.status=="1"||dataset._isImport)){evt(data);}
												}
											}
										}catch(e){console.log(e)}
									},500*m);
									dataset.timeout[m+""]=ts;
								}
							}
						}
					}else{//保存
						$("[datasetid='"+r.id+"']").find("[_class='rowData']").each(function(){
								var rowId=$(this).attr("rowid");
								var saveRow=saveMap[rowId];
								if(saveRow!=null){
									var row=dataset.rowMap[rowId]
									if(typeof(row)!="undefined"){
										$(this).find("[bind="+dataset.name+"][name]").each(function(){
											var n=$(this).attr("name");
											if(typeof(saveRow[n])!="undefined"){
												var v=dataset.numberValue(n,isNull(row[n])?"":row[n]);
												dataset.initValue(n,v);
												if($(this).is("input")){
													if($(this).attr("type")=="checkbox")$(this).prop("checked",v=="1"||v==true?"checked":false);
													else {if(v!=$(this).val())$(this).val(v);}
												}else if($(this).is("textarea")&&v!=$(this).val())$(this).val(v);
												else if($(this).is("select")){
													$(this).val(v);
													$(this).find("option").each(function(){
														if($(this).attr("value")==v)$(this).prop("selected","selected");
														else $(this).removeAttr("selected");
													});
												}else{
													if($(this).hasClass("radios-option")){
														if($(this).attr("lx")==v)$(this).addClass("_on");
														else $(this).removeClass("_on");
													}else if(v!=$(this).html())$(this).html(v);
												}
											}
										});
										
									}
								}
						});
					}
				}
			}
			if(!isHaveRow){
				if(typeof(evt)=="function"&&(data.status=="1"||dataset._isImport)){evt(data);}
			}
			if(isQuery){
				dataset.afterScroll(dataset.currentRow);
				dataset._$evt();
			}
		  }finally{
			  dataset.jsonToRow(dataset.currentRow);
		  }
	};
	this.loadIndex=0;
	this.numberValue=function(n,v){
		if(typeof(n)=="undefined")return ;
		var mn=n.toLowerCase();
		if(mn.indexOf("amt")!=-1||mn.indexOf("price")!=-1)return isNull(v)?"0.00":number(v).toFixed(2);
		else if(mn.indexOf("qty")!=-1)return isNull(v)?"0":number(v).toFixed(0).replace(",","");
		else if(mn.indexOf("weight")!=-1)return isNull(v)?"0.000":number(v).toFixed(3);
		else if(mn.indexOf("cubage")!=-1)return isNull(v)?"0.0000":number(v).toFixed(4);
		else return isNull(v)?"":v;
	}
	this.scrollRow=function(evt){
		var dataset=this;
		$("[bind='"+dataset.name+"'][_class='rowData']").each(function(){
			evt($(this),dataset.rowMap[$(this).attr("rowid")]);
		});
	}
	/*----------当前行同步------------
	 * row  Datasetl里面rows 数据
	 * class_id 页面属性 id
	 */
	this.jsonToRow=function(row){//同步
		var dataset=this;
		if(row==undefined)return;
		var ct=dataset._controls;
		if(ct==null||ct.length==0)return;
		for(var m=0;m<ct.length;m++){
			var r=ct[m];
			if(r==null||r._class==null||r==undefined)continue;
			if(r._class=="row"){
				dataset._setValueToWeb($("[datasetid='"+r.id+"']"), row);
			}else if(r._class=="rows"){
				var rs=$("[datasetid='"+r.id+"']").find("[_class='rowData']");
				rs.removeClass("currentRow");
				rs.each(function(){
					if($(this).attr("rowid")==row.rowId){
						$(this).addClass("currentRow");
						dataset._setValueToWeb($(this), row);
					}
				});
			}
		}
	};

	this.getField=function(f,evt){
		var dataset=this;
		var ct=dataset._controls;
		if(ct==null||ct.length==0)return;
		for(var m=0;m<ct.length;m++){
			var r=ct[m];
			if(r._class!="rows"&&r._class!="row")continue;
			var rowNodes=r._class=="row"?$("[datasetid='"+r.id+"']"):$("[datasetid='"+r.id+"']").find("[_class='rowData']");
			rowNodes.each(function(){
				var pid=$(this).attr("p"),rowId=$(this).attr("rowid");
				if(rowId==null)rowId=dataset.currentRow.rowId;
					$(this).find("[bind="+dataset.name+"][name]").each(function(){
						var node=$(this),n=node.attr("name");
						if(node.is("input")||node.is("textarea")||node.is("select")){
							if(f=="all"||(","+f+",").indexOf(","+n+",")!=-1){
								evt(pid,n,node,dataset.rowMap[rowId]);
							}
						}
					});
			});
		}
	};
	this.setReadOnly=function(){
		var id=arguments.length==3?arguments[0]:"*";
		var f=arguments.length==2?arguments[0]:arguments.length==3?arguments[1]:"all";
		var t=arguments[arguments.length-1];
		var dataset=this;
		dataset.getField(f, function(controlId,name,node,row){
			if(id=="*"||id==controlId)node.prop("disabled",t);
		});
	};
	this.jsonToRows=function(){//同步
		var dataset=this;
		if(dataset.rows.length==0)return;
		dataset.currentRow=dataset.rows[0];
		var ct=dataset._controls;
		if(ct==null||ct.length==0)return;
		for(var m=0;m<ct.length;m++){
			var r=ct[m];
			if(r==null||r._class==null||r==undefined)continue;
			if(r._class=="row"){
				dataset._setValueToWeb($("[datasetid='"+r.id+"']"), dataset.rows[0]);
			}else if(r._class=="rows"){
				var rs=$("[datasetid='"+r.id+"']").find("[_class='rowData']");
				rs.removeClass("currentRow");
				rs.each(function(){
					if($(this).attr("rowid")==dataset.currentRow.rowId){
						$(this).addClass("currentRow");
					}
						dataset._setValueToWeb($(this), dataset.rowMap[$(this).attr("rowID")]);
				});
			}
		}
	};
	
	this.showDeleteRow=function(){//同步
		var dataset=this,rs=dataset._controls;
		for(var i=0;i<rs.length;i++){
			var js=rs[i];
			if(js._class=="rows"){
				$("[datasetid='"+js.id+"']").find("[_class='rowData']").each(function(){
					if($(this).css("display")=="none"){
						 $(this).removeClass("hideNode");
					}
				});
			}
		}
	};
	this.datasource=getTokenValue("datasource");
	this._cache_key="";
	this._cache_value="";
	this.setWebKey=function(p){
		var keyStr=[];
		if(!isNull(getTokenValue("datasource")))keyStr.push(getTokenValue("datasource"));
		if(!isNull(getTokenValue("userId")))keyStr.push(getTokenValue("userId"));
		if(!isNull(getTokenValue("subSystem")))keyStr.push(getTokenValue("subSystem"));
		if(!isNull(getTokenValue("orgId")))keyStr.push(getTokenValue("orgId"));
		if(!isNull(this.actionQuery))keyStr.push(this.actionQuery);
		else keyStr.push(this.action);
		
		if(p!=null&&p.params!=null){
			for(var s in p.params){
				var vl=JSON.stringify(p.params[s]);
				vl==vl==null?"":$.trim(vl)
				keyStr.push(s+vl);
			}
		}
		if(p["pageSize"]!=null)keyStr.push(p["pageSize"]);
		if(p["pageIndex"]!=null)keyStr.push(p["pageIndex"]);
		var key=keyStr.join("").replace(/"/gi,"").replace(/\//gi,"");
		this._cache_key=key;
		this._cache_value=null;
	}
	this.removeKeyId=function(ids){
		var dataset=this;
		ids=","+ids+",";
		var vl=dataset._cache_value,action_ids=vl.action_ids,sz=action_ids.split(","),nsz=[];
		for(var i=0;i<sz.length;i++){
			var id=sz[i];
			if(isNull(id))continue;
			if(ids.indexOf(","+id+",")==-1){
				nsz.push(id);
			}
		}
		dataset.insertKey(nsz.join(","));
	}
	// 向Dataset 插入数据,插入页面要显示的数据Id
	this.insertKey=function(value){
		var db=null,key=this._cache_key,dataset=this;
		if(dataset._cache_value!=null&&dataset._cache_value.action_ids==value)return;
		try{
			tiulo.indexedDB.openTable(function(){
				db=tiulo.indexedDB.db2;
				var tran = db.transaction(["Dataset"], "readwrite");
				var objectStore = tran.objectStore("Dataset");
				var row={"action_key":key,
						 "action_ids":value,
						 "table":dataset.table,
						 "idField":dataset.idField,
						 "datasource":dataset.datasource,
						 "pageIndex":dataset.pageIndex,
						 "pageTotal":dataset.pageTotal,
						 "allRowCount":dataset.allRowCount
						 };
				var request=objectStore.get(key); 
				request.onsuccess=function(e){ 
					var oldRow=e.target.result; 
					if(oldRow!=null){
						objectStore.delete(key);
					}
					objectStore.add(row);
					dataset._cache_value=row;
				};
			})
		}catch(e){
		}finally{
			if(db!=null)db.close(); 
		}		
	}//获取Dataset 的Id
	this.getDatasetIds=function(evt){
			if(this.isGetAllCase){
				if(typeof(evt)=="function"){evt(null);}
				return;
			}
			var keyId=this._cache_key;
			var db=null,data=null;
			var dataset=this;
			try{
				tiulo.indexedDB.openTable(function(){
					db=tiulo.indexedDB.db2;
					if(db==null){
						if(typeof(evt)=="function")evt(null);
						return;
					}
					var objectStore = db.transaction("Dataset").objectStore("Dataset");
					var request=objectStore.get(keyId); 
					request.onsuccess=function(e){ 
						var row=e.target.result; 
						dataset._cache_value=row==null?null:row;
						if(typeof(evt)=="function"){evt();}
					};
				});
			}catch(e){
				console.log(e)
			}finally{
				if(db!=null)db.close(); 
			}
	}
	
	//获取当前页面要显示的数据据
	this.getWebDatas=function(evt){
		var dataset=this;
		setTimeout(function(){
			dataset.getDatasetIds(function(){
				if(!dataset.isGetAllCase&&(isNull(dataset._cache_value)||isNull(dataset._cache_value.action_ids)))evt(null);
				else{
					if(!dataset.isGetAllCase){
						if(isNull(dataset.datasource)||isNull(dataset.table)||isNull(dataset.idField)){
							dataset.datasource=dataset._cache_value.datasource;
							dataset.table=dataset._cache_value.table;
							dataset.idField=dataset._cache_value.idField;
							DatasetMap[dataset.name]=dataset.table;
						}
						dataset.pageTotal=dataset._cache_value.pageTotal;
						dataset.allRowCount=dataset._cache_value.allRowCount;
					}
					dataset.getDataByIds(function(map){
						if(typeof(evt)=="function")evt(map);
					});
				}
			});
		},1);
	}
	this.deleteTiuloRow=function(ids,evt){
		if(!this.openCache)return;
		if(ids==null||ids.length==0){
			if(typeof(evt)=="function"){evt();}
			return;
		}
		var dataset=this;
		var table=dataset.table;
		if(isNull(table)){
			alert(dataset.name+"请添加table属性");
			return;
		}
		setTimeout(function(){
			tiulo.indexedDB.open(dataset,function(){
					db=tiulo.indexedDB.db;
					if(db==null){
						if(typeof(evt)=="function"){evt();}
						return;
					}
					var tran = db.transaction([table], "readwrite");
					var objectStore = tran.objectStore(table);
					for(var i=0;i<ids.length;i++){
						var _id=ids[i];
						var request=objectStore.get(_id)
						 request.onsuccess=function(e){ 
							var row=e.target.result; 
							if(row!=null)objectStore.delete(_id);
						};
					}
					if(typeof(evt)=="function"){evt();}
					if(dataset._cache_value!=null&&!isNull(dataset._cache_value.action_ids)){
						var k=dataset._cache_value.action_ids;
						var nr=[],sz=k.split(","),dlt=","+ids.join(",")+",";
						for(var j=0;j<sz.length;j++){
							if(isNull(sz[j]))continue;
							if(dlt.indexOf(","+sz[j]+",")==-1){
								nr.push(sz[j]);
							}
						}
						dataset.allRowCount=dataset.allRowCount*1>1?dataset.allRowCount*1-1:0
						dataset.insertKey(nr.join(","));
					}
			});
		},1);
	}
	this.addTiuloRow=function(rows,evt){
		if(!this.openCache)return;
		if(rows==null||rows.length==0){
			if(typeof(evt)=="function"){evt();}
			return;
		}
		var dataset=this;
		var table=dataset.table;
		if(isNull(table)){
			alert(dataset.name+"请添加table属性");
			return;
		}
		setTimeout(function(){
			tiulo.indexedDB.open(dataset,function(){
					db=tiulo.indexedDB.db;
					if(db==null){
						if(typeof(evt)=="function"){evt();}
						return;
					}
					var tran = db.transaction([table], "readwrite");
					var objectStore = tran.objectStore(table);
					var d_ids=[];
					for(var i=0;i<rows.length;i++){
						var row=rows[i],zj=row[dataset.idField];
						if(row==null||isNull(zj))continue;
						d_ids.push();
						objectStore.add(row);
						dataset.cacheData[zj]=row;
					}
					if(typeof(evt)=="function"){evt();}
					if(dataset._cache_value!=null&&!isNull(dataset._cache_value.action_ids)&&d_ids.length>0){
						var k=dataset._cache_value.action_ids;
						dataset.allRowCount=dataset.allRowCount*1>1?dataset.allRowCount*1+1:1;
						dataset.insertKey(d_ids.join(",")+","+k);
						
					}
			});
		},1);
	}
	function checkHf(row,fields){
		if(isNull(fields))return {"row":row,"status":true,error:[]};
		var ps=[];
		for(var s in row){
			if(isNull(s))continue;
			ps.push(s);
		}
		var ns=","+ps.join(",")+",";
		var sz=fields.split(",");
		var isHf=true,err=[],r={};
		for(var i=0;i<sz.length;i++){
			var field=sz[i];
			if(isNull(field))continue;
			if(ns.indexOf(","+field+",")==-1){
				err.push(field);
				isHf=false;
			}else{
				r[field]=row[field];
			}
		}
		r["rowId"]=row["rowId"];
		r["state"]="n";
		return  {"row":r,"status":isHf,"error":err};
	}
	this.getDataByIds=function(evt){
		var dataset=this,db=null,map={},isHv=false;
		var table=dataset.table,keyField=dataset.idField;
		var ids2=this.isGetAllCase?"all":"";
		if(!this.isGetAllCase){
			var showFields=dataset.showFields;
			if(isNull(dataset._cache_value)){
				if(typeof(evt)=="function")evt(null);
				return;
			}
			if(isNull(table)){
				table=dataset._cache_value.table;
				keyField=dataset._cache_value.idField;
			}
			if(isNull(table)){
				if(typeof(evt)=="function")evt(null);
				return;
			}
			ids2=","+(dataset._cache_value==null?"":dataset._cache_value.action_ids)+",";
		}
			try{
				tiulo.indexedDB.open(dataset,function(){
					db=tiulo.indexedDB.db;
					if(db==null){
						if(typeof(evt)=="function")evt(null);
						return;
					}
					var objectStore = db.transaction(table).objectStore(table);
					var index = objectStore.index(keyField);
					index.openCursor().onsuccess = function(event) {
						var cursor = event.target.result;
						if (!cursor) { 
							if(typeof(evt)=="function")evt(isHv?map:null);
							return ;   
						}  
						var row=cursor.value;
						var keyValue=row[keyField];
						if(ids2.indexOf(","+keyValue+",")!=-1||ids2=="all"){
							map[keyValue]=row;
							isHv=true;
							/*var hf=checkHf(row,showFields)
							if(hf.status){
								map[keyValue]=row;
								isHv=true;
								console.log("获取"+keyValue+" 缓存成功");
							}else{
								console.log("获取"+keyValue+" 缓存失败 未匹配："+hf.error.join(","))
							}*/
						}
						cursor.continue();  
					};
				})
			}catch(e){
				console.log(e)
			}finally{
				if(db!=null)db.close(); 
			}
	}
	this.mapToArray=function(ids,map){
		if(isNull(ids)||map==null)return [];
		var sz=[];
		var ar_id=ids.split(",")
		for(var i=0;i<ar_id.length;i++){
			var id=ar_id[i];
			if(isNull(id))continue;
			if(map[id]!=null)sz.push(map[id]);
		}
		return sz;
	};
	this.updateTiuloData=function(type,data,evt){
			if(!this.openCache)return;
			var db=null,dataset=this;
			try{
				if(dataset.rows.length==0){
					if(type=="query"){dataset.insertKey("");dataset.clearData();}
					if(typeof(evt)=="function")evt([]);
					return;
				}
				tiulo.indexedDB.open(dataset,function(){
					db=tiulo.indexedDB.db;
					if(db==null){
						if(typeof(evt)=="function")evt([]);
						return;
					}
					var table=dataset.table;
					var ds=data!=null&&data["dataset"]!=null?data.dataset:null;
					var rows=type=="save"?dataset.rows:ds.rows,length=rows.length,keyField=type=="save"?dataset.idField:ds.idField,modifyDate=typeof(ds.modifyDate)!="undefined"?ds.modifyDate:"*";
					var ids=[],modify=[];
					var tran = db.transaction([table], "readwrite");
					var map=dataset.cacheData,nField=[];
					var objectStore = tran.objectStore(table);
					for(var i=0;i<length;i++){
						var row=rows[i];
						var zj=row[keyField];		
						if(!isNull(zj)){
							ids.push(zj);
							if(type=="query")row.rowId=zj;
							if((map!=null&&map[zj]!=null)||type=="save"){
								var rrr=(map!=null&&map[zj]!=null)?map[zj]:{rowId:zj}
								var rv=bj(type,row,rrr);
								if(!rv.status){
									try{
										if(rv.v.rowId!=row.rowId){
											nField.push(zj);
											dataset.allRowCount=dataset.allRowCount*1+1;
											dataset.cacheData[zj]=rv.v;
										}
									}catch(ex){}
									objectStore.put(rv.v);
									//var ob=rv.m;
									//ob[keyField]=zj;
									//modify.push(ob);
									if(type=="query")modify.push(rv.v);
								}
							}else{
								modify.push(row);
								if(type=="query")row.rowId=row[keyField];
								objectStore.add(row);
							}
						}
					}
					if(type=="query"){
						var nIds=ids.join(",");
						dataset.insertKey(nIds);
						var _clearRows=[];
						for(var x=0;x<dataset.rows.length;x++){
							var rx=dataset.rows[x];
							if((","+nIds+",").indexOf(","+rx[keyField]+",")==-1){
								_clearRows.push(rx);
							}
						}
						if(_clearRows.length>0)dataset.clearRows(_clearRows);
					}else if(type=="save"&&nField.length>0){
						var allIds=dataset._cache_value.action_ids
						dataset.insertKey(nField.join(",")+","+allIds);
					}
					if(typeof(evt)=="function")evt(modify);
				})
			}catch(e){
				console.log(e)
			}finally{
				if(db!=null)db.close(); 
			}
	}
	this.insertIndexData=function(type,data,evt){
		var dataset=this;
		if(type=="query"){
			dataset.updateTiuloData(type,data,function(m){
				if(typeof(evt)=="function")evt(m);
			});	
		}else if(type=="save"){
			var datasets=data["datasets"];
			for(var ds in datasets){
				var _ds7=datasets[ds];
				var data={status:"1","dataset":_ds7};
				if(_ds7.id==dataset.id)dataset.updateTiuloData("save",data,function(m){
					if(typeof(evt)=="function")evt(m);
				});
			}
		}
	}
	this._getParentNode=function(node,_class){
		var dataset=this.name;
		var nd=node;
		for(var i=0;i<20;i++){
			if(dataset!=null&&nd.attr("dataset")==dataset&&nd.attr("_class")==_class){break;}
			else if(dataset==null&&nd.attr("_class")==_class)break;
			else nd=nd.parent();
		}
		return nd;
	};
	this._setValueToWeb=function(rowNode,row){
		var dataset=this,selectNode=null;
		try{
			if(rowNode.css("display")=="none")return;
			rowNode.find("[bind="+dataset.name+"][name]").each(function(){
					var node=$(this),n=node.attr("name");
					if(node.is("input")){
						if(node.is(":selected"))selectNode=node;
						if(node.attr("type")=="checkbox"){
							if(typeof(row[n])!="undefined"&&(row[n]=="1"||row[n]==true))node.prop("checked","checked");
							else node.removeAttr("checked");
						}else if(node.attr("type")=="radio"){
							node.prop("checked",node.attr("value")==row[n]);
						}else{
							var vl=dataset.initValue(n,row);
							if(typeof(vl)=="undefined"||vl==null)vl=isNull(row[n])?"":row[n];
							if(node.val()!=vl)node.val(vl);
							dataset.format(node);
						} 
					}else if(node.is("select")){
						node.find("option").each(function(){
							$(this).prop("selected",row[n]==$(this).val()?"selected":false);
						});
					}else{
						var vl=dataset.initValue(n,row);
						if(typeof(vl)=="undefined"||vl==null)vl=isNull(row[n])?"":row[n];
						if(node.is("img"))node.prop("src",vl);
						else if(node.hasClass("radios-option")){
							var lx=node.attr("lx");
							if(typeof(lx)=="undefined")lx="1";
							if(vl==lx)node.addClass("_on");
							else node.removeClass("_on");
						}else if(node.attr("lx")==null&&node.html()!=vl){node.html(vl);}
						dataset.format(node);
					}
			});
			rowNode.find("[bind="+dataset.name+"][attr_name]").each(function(){
				var n=$(this).attr("attr_name");
				if(typeof(n)!="undefined"){
					var vl=dataset.initValue(n,row);
					if(typeof(vl)=="undefined"||vl==null)vl=isNull(row[n])?"":row[n];
					if($(this).attr("value")!=vl)$(this).attr("value",vl)
				}
			});
		}catch(e){}finally{
			if(selectNode!=null){
				selectNode.select();
			}
		}
		
	};
	this.initPagination=function(){
		try{
			if(this.pagepilot=="")return;
			 var dataset=this;
			 var pageIndex=typeof(dataset.pageIndex)=="undefined"?1:dataset.pageIndex;
			 var pageTotal=typeof(dataset.pageTotal)=="undefined"?1:dataset.pageTotal;
			 var allRowCount=typeof(dataset.allRowCount)=="undefined"?0:dataset.allRowCount;
			 var pageData={
			  page:pageIndex, //当前页
			  pageTotal:pageTotal, //总页数
			  total:allRowCount, //总数量
			  first:function(e){
				dataset.gotoPage(e);
			  },
			  previous:function(e){
				dataset.prevPage();
			  },
			  next:function(e){
				dataset.nextPage();
			  },
			  last:function(e){
				dataset.gotoPage(e);
			  },
			  toPage:function(e){
				dataset.gotoPage(e);
			  }
			};
			$("#"+dataset.pagepilot).pagination(pageData);
		}catch(e){}
	}
	
	return this;
	
};
Dataset.prototype.put = function(key, object) {
	var dataset=this;
    if (key == null) return;
    key=key+"";
    var $2 = this.rowMap[key];
    if (typeof ($2) == "undefined") {
        this.rows.push(object);
    } else {
        var i = this.indexOf($2);
        if (i >= 0) {
            this.rows[i] = object;
        }
    }
	var idKey=dataset.idField;
	if(object!=null&&typeof(idKey)!="undefined"&&typeof(object[idKey])!="undefined")this._rowIdMap[object[idKey]]=object.rowId;
    this.rowMap[key] = object;
};
Dataset.prototype._remove = function(key) {
	delete this._rowIdMap[this.rowMap[key].rowId];
    delete this.rowMap[key];
    delete this.oldRows[key];
	var sz=[];
	for(var i=0;i<this.rows.length;i++){
		var r=this.rows[i];
		if(r.rowId!=key)sz.push(r);
	}
	this.rows=sz;
};
Dataset.prototype.get = function(key) {
   return this.rowMap[key+""];
};

Dataset.prototype.indexOf =function($r) {
    var $2 = this.rowMap[$r];
    if ($2 != null) {
    	var j=-1;
    	for(var i=0;i<this.rows.length;i++){
    		if(this.rows[i].rowId==$2.rowId){
    			j=i;
    			break;
    		}
    	}
       return j;
    } else {
        return -1;
    }
};
function getIndexDb(table,idField,rows,evt){
	var db=null;
		if(isNull(table)||isNull(idField)||indexedDB==null){
			if(typeof(evt)=="function")evt(null);
			return ;
		}
		var ids=[],isHv=false,map={};
		if(rows!=null&&rows.length>0){
			for(var i=0;i<rows.length;i++){
				var r=rows[i];
				if(isNull(r[idField]))continue;
				ids.push(r[idField]);
			}
		}
		var ids2=","+ids.join(",")+",";
			try{
				tiulo.indexedDB.open(null,function(){
					db=tiulo.indexedDB.db;
					if(db==null){
						if(typeof(evt)=="function")evt(null);
						return;
					}
					var objectStore = db.transaction(table).objectStore(table);
					var index = objectStore.index(idField);
					index.openCursor().onsuccess = function(event) {
						var cursor = event.target.result;
						if (!cursor) { 
							if(typeof(evt)=="function")evt(isHv?map:null);
							return ;   
						}  
						var row=cursor.value;
						var keyValue=row[idField];
						if(ids2.indexOf(","+keyValue+",")!=-1){
							map[keyValue]=row;
							isHv=true;
						}
						cursor.continue();  
					};
				})
			}catch(e){
				console.log(e)
			}finally{
				if(db!=null)db.close(); 
			}
	}

	function updateKey(row){
		var db=null;
		try{
			tiulo.indexedDB.openTable(function(){
				db=tiulo.indexedDB.db2;
				var tran = db.transaction(["Dataset"], "readwrite");
				var objectStore = tran.objectStore("Dataset");
				objectStore.delete(row.action_key);
				objectStore.add(row);
			})
		}catch(e){
		}finally{
			if(db!=null)db.close(); 
		}		
	}
	function getKeyValue(key,evt){	
			var db=null,vl=null;
			try{
				tiulo.indexedDB.openTable(function(){
					db=tiulo.indexedDB.db2;
					if(db==null){
						if(typeof(evt)=="function")evt(vl);
						return;
					}
					var objectStore = db.transaction("Dataset").objectStore("Dataset");
					var index = objectStore.index("action_key");
					var boundKeyRange = IDBKeyRange.only(key);
					index.openCursor(boundKeyRange).onsuccess = function(event) {
						var cursor = event.target.result;
						if (!cursor) { 
							if(typeof(evt)=="function"){evt(vl);}
							return ;   
						}  
						vl=cursor.value;
						if(typeof(evt)=="function"){evt(vl);return;}
						cursor.continue();  
					};
				});
			}catch(e){
				console.log(e)
			}finally{
				if(db!=null)db.close(); 
			}
	}	
	
	
function updateIndexDb(table,idField,rows,evt){
	var db=null;
	if(isNull(table)||isNull(idField)||indexedDB==null||rows==null||rows.length==0){
		if(typeof(evt)=="function")evt(null);
		return ;
	}
		getIndexDb(table,idField,rows,function(map){
			if(map==null)evt()
			else{
				try{
					tiulo.indexedDB.open(null,function(){
						db=tiulo.indexedDB.db;
						if(db==null){
							if(typeof(evt)=="function")evt([]);
							return;
						}
						var tran = db.transaction([table], "readwrite");
						var objectStore = tran.objectStore(table);
						for(var i=0;i<rows.length;i++){
							var row=rows[i];
							var zj=row[idField];		
							if(isNull(zj))continue;
							if(map!=null&&map[zj]!=null){
								var rrr=map[zj]
								var rv=bj("save",row,rrr);
								if(!rv.status){
									objectStore.put(rv.v);
								}
							}
							
						}
						if(typeof(evt)=="function")evt();
					})
				}catch(e){
					console.log(e)
				}finally{
					if(db!=null)db.close(); 
				}
			}
		})
}
	function bj(type,row,cacheRow){
		var isT=true,m={};
		for(var s in row){
			if(s=="rowId"||s=="state"||(type=="query"&&row[s]==cacheRow[s]))continue;
			isT=false;
			cacheRow[s]=row[s];
			m[s]=row[s];
		}
		m.rowId=cacheRow.rowId;
		return {"status":isT,"v":cacheRow,"m":m};
	};
var tiuloTables=[
["BaseCarrierOrg","bco","1"],
["BaseCountry","bc","1"],
["BaseDealer","bd","1"],
["BaseDealerAddress","bda","1"],
["BaseFindOrg","bfo","1"],
["BaseMaterial","bm","1"],
["BaseMaterialType","bmt","1"],
["BaseOwnerRecv","bor","1"],
["CmsFriendGroup","cfg","1"],
["CmsInfo","cif","1"],
["CmsMyFriends","cmf","1"],
["CmsTiulo","ct","1"],
["FinAccountDetail","fad","1"],
["FinAccountHead","fah","1"],
["FinAccountLine","fal","1"],
["FinAgreement","fa","1"],
["FinAssetsInfo","fai","1"],
["FinChargeType","fct","1"],
["SecGroup","sg","1"],
["SecGroupProgram","sgp","1"],
["SecProgram","sp","1"],
["SecRoleUser","sru","1"],
["SecUser","su","1"],
["SecUserGroup","sup","1"],
["SecUserLog","sul","1"],
["SecUserOnlineLog","suol","1"],
["SecUserOrg","suo","1"],
["SecUserProgram","sup","1"],
["SysDbLog","sdl","1"],
["SysKeysSetting","key","1"],
["SysReferral","sre","1"],
["SysTableFields","stf","1"],
["SysUserOrder","suor","1"],
["TmCargoDetail","tcd","1"],
["TmCargoHead","tch","1"],
["TmEx","te","1"],
["TmExCharge","tec","1"],
["TmExMsg","tem","1"],
["TmExResult","ter","1"],
["TmInsrc","ti","1"],
["TmOrderDetail","tod","1"],
["TmOrderHead","toh","1"],
["TmTask","tt","1"],
["Truck","trk","1"],
["TruckRoute","tr","1"],
["TruckRouteLine","trl","1"]
];