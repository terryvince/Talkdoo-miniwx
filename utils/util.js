//格式化时间
const formatTime = (date,option) => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  if(option=='date'){
    return [year, month, day].map(formatNumber).join('-');
  }
  if (option == 'time') {
    return [hour, minute, second].map(formatNumber).join(':');
  }
  
  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

//取得dom信息
function query(selector) {
  var query = wx.createSelectorQuery();
  return new Promise(resolve => {
    query.select(selector).boundingClientRect(function (nodesRef) {
      resolve(nodesRef);
    }).exec();
  })
}

//取得dom信息
function queryAll(selector) {
  var query = wx.createSelectorQuery();
  return new Promise(resolve => {
    query.selectAll(selector).boundingClientRect(function (nodesRef) {
      resolve(nodesRef);
    }).exec();
  })
}

//获取经纬度两点间距离
function getDistance(lat1, lng1, lat2, lng2) {
  lat1 = lat1 || 0;
  lng1 = lng1 || 0;
  lat2 = lat2 || 0;
  lng2 = lng2 || 0;
  var rad1 = lat1 * Math.PI / 180.0;
  var rad2 = lat2 * Math.PI / 180.0;
  var a = rad1 - rad2;
  var b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0;
  var r = 6378137;
  var result = r * 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(rad1) * Math.cos(rad2) * Math.pow(Math.sin(b / 2), 2)));
  return parseInt(result);
}

//函数节流，第一次点击直接生效，在间隔时间内只生效一次点击
function throttle(fn, gapTime) {
  if (gapTime == null || gapTime == undefined) {
    gapTime = 1500
  }

  let _lastTime = null

  // 返回新的函数
  return function () {
    let _nowTime = + new Date()
    if (_nowTime - _lastTime > gapTime || !_lastTime) {
      fn.apply(this, arguments)   //将this和参数传给原函数
      _lastTime = _nowTime
    }
  }
}

//函数防抖，immediate 是否立即生效
function debounce(fn, wait, immediate) {
  let timer;
  return function () {
    if (timer) clearTimeout(timer);
    if (immediate) {
      // 如果已经执行过，不再执行
      var callNow = !timer;
      timer = setTimeout(() => {
        timer = null;
      }, wait)
      if (callNow) {
        fn.apply(this, arguments)
      }
    } else {
      timer = setTimeout(() => {
        fn.apply(this, arguments)
      }, wait);
    }
  }
}

//截取字符串（1个字符一个长度，1个中文2个长度）
function limitString(str, option){
  var len = 0;
  var endIndex = 0;
  str = str.trim();
  for (var i = 0; i < str.length; i++) {
    if (len > option) {
      break;
    }
    endIndex = i;
    if (/[\u4e00-\u9fa5]/.test(str[i])) {
      len += 2;
    }
    if (/ /.test(str[i])) {
      len++;
    }
    if (/[A-z]/.test(str[i])) {
      len++;
    }
  }
  if (len > option) {
    return str.slice(0, endIndex) + '...';
  }
  return str;
}

// 秒数转分钟数
function secondToTime(s) {
  if (!s) {
    return;
  }
  var m = parseInt(s / 60);
  var s = s % 60;
  if (m < 10) {
    m = '0' + m;
  }
  if (s < 10) {
    s = '0' + s;
  }
  return m + ':' + s;
}



module.exports = {
  formatTime,         //格式化时间信息
  query,              //取得dom信息，只匹配一个
  queryAll,           //取得dom信息，匹配多个
  getDistance,        //经纬度转距离
  throttle,           //节流
  debounce,           //防抖
  limitString,        //按字节长度截取字符串
  secondToTime,       //秒数转分钟数
}