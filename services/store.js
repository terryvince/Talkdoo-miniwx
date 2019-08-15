// 全局的数据存储
class Store {
  constructor(){
    this.store = {};
  }
  get(key){
    if(!key){
      return this.store;
    }
    if (!this.store[key]){
      throw new Error('store.get(key) - key does not exist!');
    }
    return this.store[key];
  }
  set(stateObject){
    if(!stateObject){
      throw new Error('store.set(stateObject) - stateObject is null!');
    }
    Object.assign(this.store,stateObject);
    return this.store;
  }
  reset(stateObject){
    if (!stateObject) {
      throw new Error('store.reset(stateObject) - stateObject is null!');
    }
    this.store = stateObject;
    return this.store;
  }
  clear(){
    this.store ={};
  }
  remove(key){
    if (!this.store[key]) {
      throw new Error('store.get(key) - key does not exist!');
    }
    delete this.store[key];
  }
  print(){
    console.log(this.store);
  }
}

let wxstore = new Store();

module.exports = wxstore;