import { MessageBox } from 'mint-ui'
export function configRouter (router) {
  // normal routes
  router.map({
    // 基础页面
    '/android': {//安卓测试页面
      component: require('./views/android.vue')
    }, 
    '/android2': {//安卓测试页面
      component: require('./views/android2.vue')
    }, 
    '/showMap': {//安卓测试页面
      component: require('./views/showMap.vue')
    },
    '/login': {//登录
      component: require('./views/login.vue')
    }, 
    '/register/:versionsId': {//注册
      component: require('./views/register.vue')
    },
    '/forget_pwd': {//忘记密码
      component: require('./views/forget_pwd.vue')
    },
    '/list3': {//图表测试
      component: require('./views/list3.vue')
    },

    //view-msg
    '/tiulo': {//推流
      component: require('./view-msg/tiulo.vue')
    },
    //异常信息
    '/exceptionList': {
      component: require('./view-msg/exceptionList.vue')
    },
    //业务提醒
    '/opMsgList': {
      component: require('./view-msg/opMsgList.vue')
    },
    //审核提醒 和 收付款提醒
    '/accountMsgList/:operation': {
      component: require('./view-msg/accountMsgList.vue')
    },
    //系统提醒
    '/sysMsgList': {
      component: require('./view-msg/sysMsgList.vue')
    },
    //公告
    '/noticeList': {
      component: require('./view-msg/noticeList.vue')
    },
    //公告发起
    '/addNotice': {
      component: require('./view-msg/addNotice.vue')
    },
    //公告详情
    '/noticeDetails/:cinfId': {
      component: require('./view-msg/noticeDetails.vue')
    },

    //view-friend 
    '/friends': {//通讯录
      component: require('./view-friend/friends.vue')
    },
    '/group_sort': {//分组详情
      component: require('./view-friend/group_sort.vue')
    },
    '/addtel_friend': {//添加手机伙伴和二维码扫描
      component: require('./view-friend/addtel_friend.vue')
    },
    '/tel_friends': {//添加手机伙伴
      component: require('./view-friend/tel_friends.vue')
    },
    '/select_group': {//为新伙伴添加分组
      component: require('./view-friend/select_group.vue')
    },
    '/add_group': {//新建分组
      component: require('./view-friend/add_group.vue')
    },
    '/friend_detail': {//详情页面
      component: require('./view-friend/friend_detail.vue')
    },
    '/amend_group/:nameId': {//修改自定义分组成员
      component: require('./view-friend/amend_group.vue')
    },
    '/add_member/:nameId': {//添加成员
      component: require('./view-friend/add_member.vue')
    },

    //view-tms
    '/taskList': {//任务列表
      component: require('./view-tms/taskList.vue')
    },
    '/taskDetail': {//任务详情
      component: require('./view-tms/taskDetail.vue')
    },
    '/taskOrderDetail': {//任务订单详情
      component: require('./view-tms/taskOrderDetail.vue')
    },
    '/taskOrderModified/:keyId': {//任务订单修改记录
      component: require('./view-tms/taskOrderModified.vue')
    },
    '/taskOrderExtremely/:tchOrderId': {//任务订单异常列表
      component: require('./view-tms/taskOrderExtremely.vue')
    },
    '/taskOrderExDetail/:texId': {//任务订单异常详情
      component: require('./view-tms/taskOrderExDetail.vue')
    },
    '/taskOrderAddExtremely/:tchOrderId': {//发起订单异常
      component: require('./view-tms/taskOrderAddExtremely.vue')
    },
    '/taskTruckAddExtremely/:ttId': {//发起车次异常
      component: require('./view-tms/taskTruckAddExtremely.vue')
    },
    '/traceList': {//跟踪
      component: require('./view-tms/traceList.vue')
    },
    '/taskOrderExSummed/:texId': {//异常总结
      component: require('./view-tms/taskOrderExSummed.vue')
    },
    '/addExOrder': {//添加异常订单
      component: require('./view-tms/addExOrder.vue')
    },
    // '/taskTruckExtremely': {//发起车次异常
    //   component: require('./view-tms/taskTruckExtremely.vue')
    // },

    //view-tmsT  运力版任务
    '/TMStaskList': {
      component: require('./view-tmsT/TMStaskList.vue')
    },
    '/orderManage': {//订单管理
      component: require('./view-tmsT/orderManage.vue')
    },
    '/allotStation': {//选择分配的站点
      component: require('./view-tmsT/allotStation.vue')
    },
    '/joinManage': {//交接管理
      component: require('./view-tmsT/joinManage.vue')
    },
    '/joinTruckDetail': {//交接管理车次详情
      component: require('./view-tmsT/joinTruckDetail.vue')
    },
    '/financeManage': {//财务管理
      component: require('./view-tmsT/financeManage.vue')
    },
    '/financeAffirm': {//支付收入确认
      component: require('./view-tmsT/financeAffirm.vue')
    },
    '/oughtAffirm': {//应收应付款
      component: require('./view-tmsT/oughtAffirm.vue')
    },
    '/oughtBill': {//应收应付款详情
      component: require('./view-tmsT/oughtBill.vue')
    },
    '/propertyAffirm': {//固定资产
      component: require('./view-tmsT/propertyAffirm.vue')
    },
    '/signManage': {//回单管理
      component: require('./view-tmsT/signManage.vue')
    },
    '/exManage': {//异常管理
      component: require('./view-tmsT/exManage.vue')
    },
    '/accountCheckManage': {//审核管理
      component: require('./view-tmsT/accountCheckManage.vue')
    },
    '/accountManage': {//对账管理
      component: require('./view-tmsT/accountManage.vue')
    },
    '/reportManage': {//报表管理
      component: require('./view-tmsT/reportManage.vue')
    },
    '/TMSBillDetail': {
      component: require('./view-tmsT/TMSBillDetail.vue')
    }, 
    '/TMSBillOrderList/:ttId': {
      component: require('./view-tmsT/TMSBillOrderList.vue')
    },

    //view-fin
    '/accountIndex': {
      component: require('./view-fin/accountIndex.vue')
    }, 
    '/billDetail': {
      component: require('./view-fin/billDetail.vue')
    }, 
    '/billOrderList/:ttId': {
      component: require('./view-fin/billOrderList.vue')
    }, 
    '/billOrderKF/:fachId': {//企业对账单
      component: require('./view-fin/billOrderKF.vue')
    }, 

    //view-more  
    '/more': {//更多
      component: require('./view-more/more.vue')
    }, 
    '/my_information': {
      component: require('./view-more/my_information.vue')
    },
    '/setting': {
      component: require('./view-more/setting.vue')
    },
    '/bind_account': {
      component: require('./view-more/bind_account.vue')
    },
    '/address': {
      component: require('./view-more/address.vue')
    },
    '/clip_img': {//剪切图片
      component: require('./view-more/clip_img.vue')
    },
    '/truckList': {//车辆管理
      component: require('./view-more/truckList.vue')
    },
    '/truckDetail': {//车辆详情
      component: require('./view-more/truckDetail.vue')
    },
    '/changeName/:nameId': {//更改信息
      component: require('./view-more/changeName.vue')
    },

    '/changeVersion/': {//切换版本
      component: require('./view-more/changeVersion.vue')
    },
    '/companyList/': {//机构与认证
      component: require('./view-more/companyList.vue')
    },
    '/companyAdd/:operation': {//创建机构
      component: require('./view-more/companyAdd.vue')
    },
    '/companyDetails/:companyId': {//机构详情
      component: require('./view-more/companyDetails.vue')
    },
    '/noOrg': {//定位数据查询
      component: require('./view-more/noOrg.vue')
    },
    '/orgCheck/:companyId': {//认证机构
      component: require('./view-more/orgCheck.vue')
    },
    '/companyCheck/:companyId': {//企业认证
      component: require('./view-more/companyCheck.vue')
    },
    '/personCheck/:companyId': {//个人认证
      component: require('./view-more/personCheck.vue')
    },
    '/locationData/': {//定位数据查询
      component: require('./view-more/locationData.vue')
    },
    '/joinOrg/': {//创建机构
      component: require('./view-more/joinOrg.vue')
    },

    // 新建机构--新样式(0227)
    // 新建机构--新样式(0302)
    '/selectRole': {//选择角色
      component: require('./view-org/selectRole.vue')
    },
    '/foundOrg': {//创建机构
      component: require('./view-org/foundOrg.vue')
    },
    '/optimizeWay': {//优势线路
      component: require('./view-org/optimizeWay.vue')
    },
    '/perfectInformation': {//完善资料
      component: require('./view-org/perfectInformation.vue')
    },
    '/moreselect': {//多选页面
      component: require('./view-org/moreselect.vue')
    },
    '/addfriends': {//添加成员
      component: require('./view-org/addfriends.vue')
    },
    '/newAddFriend/:friendID': {//选择页面
      component: require('./view-org/newAddFriend.vue')
    },
    '/addCarType': {//添加车辆类型
      component: require('./view-org/addCarType.vue')
    },


    '/exception': {//异常
      component: require('./views/exception.vue')
    },


    '/list2': {//购物车案例
      component: require('./views/list2.vue')
    },
    '/list3': {//测试列表下拉
      component: require('./views/list3.vue')
    },
    
    '/shipper': {//承运人demo
      component: require('./shipperDemo/shipper.vue')
    },
    '/shipperAdd': {//添加承运人demo
      component: require('./shipperDemo/shipperAdd.vue')
    },
    '/shipperEntry/:shipperId': {//承运人详情demo
      component: require('./shipperDemo/shipperEntry.vue')
    },

    // // not found handler
    '*': {
      component: require('./views/login.vue')
    },
  })

  // redirect
  router.redirect({
    '/': '/tiulo',
  })

  // global before
  // 3 options:
  // 1. return a boolean
  // 2. return a Promise that resolves to a boolean
  // 3. call transition.next() or transition.abort()
 
  /* 
   * here I put a home-mask (a absolute & transparent lay)
   * to cover the .3s duration animation when pages switch
   */

  router.beforeEach(({to,from,next}) => {
      
      //如果是按浏览器的返回按钮从tiulo页面退出到login页面
      if(to.path && to.path.indexOf("login") != -1 && from.path && from.path.indexOf("tiulo") != -1){
        MessageBox.confirm('确定退出?')
        .then(action => { 
            localStorage.setItem("token",'');
            next();
        }).catch(function(){
            window.history.forward();
        })
                
      }else{
        router.app.mask = true
        next()
      }
      
  })
  
  router.afterEach(({from,next}) => {
    setTimeout(()=>{
        router.app.mask = false   
    },500)
  })  
}
