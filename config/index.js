const config = {
  api: 'https://testapi.talkdoo.com/',      //app当前使用的api地址
  requestLists: [
    'https://api.talkdoo.com',              //api正式环境地址
    'https://testapi.talkdoo.com/',         //api测试环境地址
    'https://apis.map.qq.com',              //地图访问api
    // 'https://at.alicdn.com',             //图标访问地址
    'https://edu.hivoice.cn',               //云之声
    'https://vod-ws.ivreal.com',
    'http://media.talkdoo.com/appletstudent' //图片资源地址
  ],
  env: 'trial',// develop|trial|release   开发，体验，发布
  // mapKey: 'LXFBZ-3EOLU-IZXVB-BXG5P-SER35-SRBYU'  //地图秘钥
}
module.exports = config