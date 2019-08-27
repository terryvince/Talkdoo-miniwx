//转换wx的api为promise
let Promise = require('./es6-promise.min.js');
module.exports = (api) => {
  return (options, ...params) => {
    return new Promise((resolve, reject) => {
      api(Object.assign({}, options, { success: resolve, fail: reject }), ...params);
    });
  }
}
