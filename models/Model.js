'use strict'
import {
  Platform,
  AsyncStorage
} from 'react-native';
import ip from 'reflect/localip';

class Model{
  constructor(name){
    this.protocol = 'http://';
    if(Platform.OS === 'ios') {
      this.ip = ip.ip ? ip.ip : 'localhost'
    } else {
      this.ip = ip.ip ? ip.ip : 'localhost';
    }
    this.host = this.protocol + this.ip+':8084/';
    this.api1 = this.host+'api1/';
    this.api0 = this.host+'competences/';
    this.api = this.api1;
    this.headers = {
      //'Accept' : 'application/json',
      //'Content-Type' : 'application/json',
      //'Host' : this.host
    };
    this.putHeaders = {
      'Accept' : 'application/json',
      'Content-Type' : 'application/json',
      //'Host' : this.host
    };
    this.definition = false;
  }

  setApi(num){
    if(num == 0){
      this.api = this.api0;
    }
    if(num == 1){
      this.api = this.api1;
    }
  }

  put(url, body){
    let req = {
      method: 'PUT',
      headers: this.putHeaders,
      body: JSON.stringify(body)
    }
    return this.fetch(url, req);
  }

  get(url, params){
    let req = {
      method: 'GET',
      headers: this.headers
    }
    var lim = '?';
    if(params)
    Object.keys(params).forEach(key => {
      url += lim+key +'=' + encodeURIComponent(params[key]);
      lim = '&';
    });
    //alert(url);
    //return Promise.resolve();
    return this.fetch(url, req);
  }

  post(url){

  }

  fetch(url, req){
    url = this.api+url;
    this.lastRequest = {url: url, req: req};
    return fetch(url, req).then((response) => {
      var contentType = response.headers.get('content-type');
      //alert(contentType);
      var checkFail = (d) => {
        if(d.indexOf('Request failed') > -1)
          throw 'Grizzly request failed.';
        return d;
      };
      if(contentType && contentType.indexOf('application/json') !== -1) {
        return response.text().then((d) => {
          try {
             return JSON.parse(d);
          } catch (e) {
             return checkFail(d);
          }
        });
      } else {
        return response.text().then(checkFail);
      }
    });
  }

  delete(url){

  }

  checkDefinition(obj){
    if(!this.definition) return obj;
    var error = [];
    Object.keys(this.definition).map((def) => {
      if(this.definition[def] == '*' && !obj[def]){
        error.push(def);
      }
    });
    Object.keys(obj).map((def) => {
      if(!this.definition[def]){
        delete obj[def];
      }
    });
    if(error.length > 0)
      throw 'Properties missing in ' + this.constructor.name + ': ' + error.join(', ');
    return obj;
  }

  save(key, value){
    this.setItem(key, value);
  }

  getName(key, name){
    name = name ? name : this.constructor.name;
    return name + '_' + key;
  }

  setItem(key, value){
    return AsyncStorage.setItem(this.getName(key), JSON.stringify(value));
  }

  getItem(key, defaultValue, name){
    return AsyncStorage.getItem(this.getName(key, name)).then((value) => { return value ? JSON.parse(value) : defaultValue; });
    //item ? JSON.parse(item) : defaultValue;
  }
  getAllKeys(){
    return AsyncStorage.getAllKeys();
  }

  mapToNumericalKeys(obj){
    return Object.keys(obj).map(key => obj[key]);
  }

  removeLocal(key){
    return AsyncStorage.removeItem(this.getName(key));
  }

  log(d){
    console.log(d);
    return d;
  }

  isLoggedIn(){
    return this.getItem('auth', false, 'User');
  }


}

module.exports = Model;
