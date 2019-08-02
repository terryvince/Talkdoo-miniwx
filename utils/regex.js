const reg = {
  'phone': /^1[3456789]\d{9}$/,                               //匹配手机号
  'id': /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,           //匹配身份证
  'email': /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,   //匹配邮箱
  'chinese': /^[\u4E00-\u9FA5\uf900-\ufa2d·s]{2,20}$/,        //匹配中文名
  'emoj': /\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g,     //匹配表情
  'ch_en': /^[\u4e00-\u9fa5]{1,7}$|^[\dA-Za-z_]{1,14}$/,      //匹配中英文
}
module.exports={
  check(v,option){
    return reg[option].test(v);
  }
}