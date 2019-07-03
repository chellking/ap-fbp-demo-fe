var path = require('path')
var pkg = require('../package.json')
var pkgName = pkg.name

// 配置代理服务
  var baseHost = 'http://172.20.53.211:80';
// var baseHost = 'http://localhost:8082';

// 应用平台服务地址
var proxyAPHost = baseHost;


module.exports = {
  build: {
    fonts:[
    //   {
    //   fontsName: '默认图标',
    //   fontFamilyName: 'iconfont',
    //   fontsPath: '/assets/fonts/moren/iconfont.css',
    //   index: 1
    // }, {
    //   fontsName: '菜单图标',
    //   fontFamilyName: 'menufont',
    //   fontsPath: '/assets/fonts/caidantubiao/iconfont.css',
    //   index: 2
    // }, {
    //   fontsName: '业务应用',
    //   fontFamilyName: 'ecmifont',
    //   fontsPath: '/assets/fonts/shuziyingxiao/iconfont.css',
    //   index: 3
    // }
  ],
    languages: []
  },
  dev: {
    port: 8086,
    autoOpenBrowser: true,
    // autoOpenUrl: '/ap/index.html',
    // autoLogin: true,
    // loginname: 'admin',
    // pwd: '123456',
    proxyTable: {
      'app-attach/**': { target: proxyAPHost, secure: false },
      '/ifbp-print/**': {target: proxyAPHost,secure: false},
      '/print-demo/**': {target: proxyAPHost,secure: false},
      '/ifbp-msg/**': {target: proxyAPHost,secure: false},
      '/ifbp-bpm-service/**': {target: proxyAPHost,secure: false},
      '/fin-ifbp-base/**':{target: proxyAPHost,secure: false},
      '/wbalone/**': {target:  proxyAPHost,secure: false,},
      // '/ap/**': {filter: ['/ap/**', '!/ap/config.js','!/ap/pages/**','!/ap/common/**','!/ap/assets/**','!/ap/widget/**'],target:  proxyAPHost,secure: false,},
      // '/ap/**': {filter: ['/ap/**', '!/ap/trd/ifbp-element/**'],target:  proxyAPHost,secure: false,},
      '/ap/**': {target: proxyAPHost,secure: false,},
      '/ap-pub/**': {target: proxyAPHost,secure: false,},
      '/i_uap/**': {target: proxyAPHost,secure: false,},
      '/integration/**': {target: proxyAPHost,secure: false,},
      '/uui/**': {target: proxyAPHost,secure: false,},
      '/busilog': {target: proxyAPHost,secure: false,},
      '/securitylog': {target: proxyAPHost,secure: false,},
      '/ifbp-eiap-bpm-service/**': {target: proxyAPHost,secure: false,},
      '/ubpm-web-approve/**': {target: proxyAPHost,secure: false,},
      '/billcode/**': {target: proxyAPHost,secure: false,},
      '/iuap-saas-message-center/**': {target: proxyAPHost,secure: false,},
      '/iuap-saas-dispatch-service': {target: proxyAPHost,secure: false,},
      '/app-bd/**': {target: proxyAPHost,secure: false,},
      '/app-sm/**': {target: proxyAPHost,secure: false,},
      //'/apm-fe/**': {target: proxyAPHost,secure: false,},
      // '/train/**': {target: proxyAPHost,secure: false,},
      '/oss/**': {target: proxyAPHost,secure: false,},
      '/ifbp-bop-web/**': {target: proxyAPHost,secure: false,},
      '/user/getBopUserAccount': {target: proxyAPHost,secure: false,},
      '/uc-web/token/**': {target: proxyAPHost,secure: false},
      '/app-sm-defdoc-web/**': { target: proxyAPHost, secure: false },
      '/uitemplate_web/**': { target: proxyAPHost, secure: false},
      '/app-sm-infoset-web/**': { target: proxyAPHost, secure: false },
      '/imfbp-ins-web/**': { target: proxyAPHost, secure: false },
      '/app-sm-qt-web/**': { target: proxyAPHost, secure: false },
      //'/ifbp-demo-web/**': { target: proxyAPHost, secure: false },

      // 以上为平台服务，后续可添加项目对应的服务
      '/ifbp-demo-web/**' : {target: 'http://127.0.0.1:8080', secure: false},
      '/course/**' : {target: 'http://127.0.0.1:8080', secure: false}
    }
  }
}
