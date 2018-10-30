import Vue from 'vue'
import app from './App'
require('es6-promise').polyfill()

//router
import VueRouter from 'vue-router'
import { configRouter } from './route-config'

// UI layout & components
import './assets/icon.css'
import './assets/common.css'
import './assets/transition.css'
import Mint from 'mint-ui'
import 'mint-ui/lib/style.css'
import './assets/mint_cover.css'
import { MessageBox } from 'mint-ui'
import { Toast } from 'mint-ui'
import { Actionsheet } from 'mint-ui'
import Echarts from 'echarts'
//transition control
import transfer from './transfer'

//Indicator
import { Indicator } from 'mint-ui'

// vue-resouce
import VueResource from 'vue-resource'

// remove click delay
import Fastclick from 'fastclick'
Fastclick.attach(document.body)

Vue.use(Mint)
Vue.use(VueRouter)
Vue.use(VueResource)

Vue.prototype.$transfer = new transfer()
Vue.prototype.$MessageBox = MessageBox
Vue.prototype.$Toast = Toast
Vue.prototype.$Indicator = Indicator
Vue.prototype.$Echarts = Echarts

const router = new VueRouter()
const App = Vue.extend(app)

// configure router
configRouter(router)
router.start(App, '#app')

window._Router = router




