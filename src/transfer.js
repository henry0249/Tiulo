export default class Transfer{
    constructor(){
        this.tran_go = 'slide'
        this.tran_back = 'back'
    }

    go(self, link, param){
        this.closeToasts()
        self.$dispatch('transfer', this.tran_go)
        let path = param?link +'\/'+ param:link
        self.$route.router.go(path)
    }

    back(self, link, param){
        this.closeToasts()
        self.$dispatch('transfer', this.tran_back)
        let path = param?link +'\/'+ param:link
        self.$route.router.go(path)
    }

    backLogin(self,data){//请求数据时信息丢失
        self.$Indicator.close();          
        if(data.info.indexOf("用户信息丢失")!= -1 || data.info.indexOf("token没有值")!= -1){
            localStorage.setItem("token",'');
            this.showToast(self,'信息丢失,请重新登录');  
            setTimeout(()=>{
                self.$transfer.back(self,localStorage.getItem("loginUrl"));  
            },1000)
        }else{
            self.$Toast(data.info);
        }
    }

    translationDel(element){
        var isScrolling ='';//这个参数判断是垂直滚动还是水平滚动
        var index = ''; //索引

        var initX; //触摸位置
        var moveX; //滑动时的位置
        var X = 0; //移动距离
        var objX = 0; //目标对象位置
        var left;
        
        var as = document.querySelectorAll(element);
        Array.from(as).forEach(function(item,index){
            item.addEventListener("touchstart",function(event){ 
                $(element).removeClass("active_border");
                var touch = event.targetTouches[0];     //touches数组对象获得屏幕上所有的touch，取第一个touch
                startPos = {x:touch.pageX,y:touch.pageY,time:+new Date};    //取第一个touch的坐标值
                left= (this.style.WebkitTransform.replace(/translateX\(/g, "").replace(/px\)/g, "")) * 1;
                initX = event.targetTouches[0].pageX;
                isScrolling = 0;   //这个参数判断是垂直滚动还是水平滚动
                swipeX = true;
                swipeY = true;
            });
            item.addEventListener("touchmove",function(event){
                //当屏幕有多个touch或者页面被缩放过，就不执行move操作
                if(event.targetTouches.length > 1 || event.scale && event.scale !== 1) return;

                 Array.from(as).forEach(function(item,i){
                    if(index != i){
                        item.style.WebkitTransform = "translateX(" + 0 + "px)";
                    }
                 })
                var touch = event.targetTouches[0];
                var endPos = {x:touch.pageX - startPos.x,y:touch.pageY - startPos.y};
                isScrolling = Math.abs(endPos.x) < Math.abs(endPos.y) ? 1:0;    //isScrolling为1时，表示纵向滑动，0为横向滑动
                if(swipeX && isScrolling === 0){
                    swipeY = false;
                    canSwipeY = false;
                    event.preventDefault();
                    if (left == 0) {
                        moveX = event.targetTouches[0].pageX;
                        X = moveX - initX;
                        if (X >= 0) {
                            this.style.WebkitTransform = "translateX(" + 0 + "px)";
                        } else if (X < 0) {
                            var l = Math.abs(X);
                            this.style.WebkitTransform = "translateX(" + -l + "px)";
                            if (l > 100) {
                                l = 100;
                                this.style.WebkitTransform = "translateX(" + -l + "px)";
                            }
                        }
                    }else if (left < 0) {
                        moveX = event.targetTouches[0].pageX;
                        X = moveX - initX;
                        if (X >= 0) {
                            var r = -100 + Math.abs(X);
                            this.style.WebkitTransform = "translateX(" + r + "px)";
                            if (r > 0) {
                                r = 0;
                                this.style.WebkitTransform = "translateX(" + r + "px)";
                            }
                        } else { //向左滑动
                            this.style.WebkitTransform = "translateX(" + -100 + "px)";
                        }
                    }
                }else if(swipeY && isScrolling === 1){
                    swipeX = false ;
                }
            });
            item.addEventListener("touchend",function(event){
                left = (this.style.WebkitTransform.replace(/translateX\(/g, "").replace(/px\)/g, "")) * 1;
                if (left > -50) {
                    this.style.WebkitTransform = "translateX(" + 0 + "px)";
                    left = 0;
                    canSwipeY = true;
                } else {
                    this.style.WebkitTransform = "translateX(" + -100 + "px)";
                    left = -100;
                    canSwipeY = true;
                }
                
            });
        }) 
    }

    translationConfirm(element,con){
        var isScrolling ='';//这个参数判断是垂直滚动还是水平滚动
        var index = ''; //索引

        var initX; //触摸位置
        var moveX; //滑动时的位置
        var X = 0; //移动距离
        var objX = 0; //目标对象位置
        var left;
        var tranId;
        var tranWidth;
        var as = document.querySelectorAll(element);
        Array.from(as).forEach(function(item,index){
            item.addEventListener("touchstart",function(event){
                var touch = event.targetTouches[0];     //touches数组对象获得屏幕上所有的touch，取第一个touch
                startPos = {x:touch.pageX,y:touch.pageY,time:+new Date};    //取第一个touch的坐标值
                left= (this.style.WebkitTransform.replace(/translateX\(/g, "").replace(/px\)/g, "")) * 1;
                initX = event.targetTouches[0].pageX;
                isScrolling = 0;   //这个参数判断是垂直滚动还是水平滚动
                swipeX = true;
                swipeY = true;
            });
            item.addEventListener("touchmove",function(event){
                tranId = con + index;
                tranWidth = document.getElementById(tranId).offsetWidth;

                //当屏幕有多个touch或者页面被缩放过，就不执行move操作
                if(event.targetTouches.length > 1 || event.scale && event.scale !== 1) return;

                 Array.from(as).forEach(function(item,i){
                    if(index != i){
                        item.style.WebkitTransform = "translateX(" + 0 + "px)";
                    }
                 })
                var touch = event.targetTouches[0];
                var endPos = {x:touch.pageX - startPos.x,y:touch.pageY - startPos.y};
                isScrolling = Math.abs(endPos.x) < Math.abs(endPos.y) ? 1:0;    //isScrolling为1时，表示纵向滑动，0为横向滑动
                if(swipeX && isScrolling === 0){
                    swipeY = false;
                    canSwipeY = false;
                    event.preventDefault();
                    if (left == 0) {
                        moveX = event.targetTouches[0].pageX;
                        X = moveX - initX;
                        if (X >= 0) {
                            this.style.WebkitTransform = "translateX(" + 0 + "px)";
                        } else if (X < 0) {
                            var l = Math.abs(X);
                            this.style.WebkitTransform = "translateX(" + -l + "px)";
                            if (l > tranWidth) {
                                l = tranWidth;
                                this.style.WebkitTransform = "translateX(" + -l + "px)";
                            }
                        }
                    }else if (left < 0) {
                        moveX = event.targetTouches[0].pageX;
                        X = moveX - initX;
                        if (X >= 0) {
                            var r = -tranWidth + Math.abs(X);
                            this.style.WebkitTransform = "translateX(" + r + "px)";
                            if (r > 0) {
                                r = 0;
                                this.style.WebkitTransform = "translateX(" + r + "px)";
                            }
                        } else { //向左滑动
                            this.style.WebkitTransform = "translateX(" + -tranWidth + "px)";
                        }
                    }
                }else if(swipeY && isScrolling === 1){
                    swipeX = false ;
                }
            });
            item.addEventListener("touchend",function(event){
                left = (this.style.WebkitTransform.replace(/translateX\(/g, "").replace(/px\)/g, "")) * 1;
                if (left > -tranWidth/2) {
                    this.style.WebkitTransform = "translateX(" + 0 + "px)";
                    left = 0;
                    canSwipeY = true;
                } else {
                    this.style.WebkitTransform = "translateX(" + -tranWidth + "px)";
                    left = -tranWidth;
                    canSwipeY = true;
                }

            });
        }) 
    }

    //移动端长按事件
    longTouch(el1,el2,evt1,evt2){//el1：长按的对象  el2:删除按钮  evt1:长按后的回调函数 evt2:点击后的回调函数
        var el = document.querySelectorAll(el1);
        Array.from(el).forEach(function(item,index){
            var timeOutEvent = 0;
            $(item).off("touchstart").on("touchstart",function(e){

                timeOutEvent = setTimeout(function(){
                    timeOutEvent = 0; 
                    if(typeof evt1 =="function"){
                        evt1($(item),index);
                    }
                },1000);
                e.preventDefault();
            });

            $(item).off("touchmove").on("touchmove",function(e){
                clearTimeout(timeOutEvent); 
                timeOutEvent = 0; 
            });

            $(item).off("touchend").on("touchend",function(e){
                clearTimeout(timeOutEvent);
                if(timeOutEvent!=0){
                    $(el2).hide(); 
                    if(typeof evt2 =="function"){
                        evt2($(item));
                    }
                } 
                return false;   
            });
        }) 
    }

    closeToasts(){
        let toasts = document.querySelectorAll('.mint-toast')
        if (toasts.length >0) Array.from(toasts).forEach(item => item.parentNode.removeChild(item))
    }
    
    //Toast的显示
    showToast(self,msg,pos,time){//self:vue组件  msg:提示的信息   pos:位置(top middle bottom)  time:显示时长
        $(".home-mask").show();
        let showPos = pos ? pos : "middle";
        let showTime = time ? time : 1000;
        self.$Toast({
          message: msg,
          position: showPos,
          duration: showTime
        })
        setTimeout(function(){
            $(".home-mask").hide();
        },showTime)
    }
}