'use strict'
import {
  Platform,
  AsyncStorage
} from 'react-native';

class Model{
  constructor(name){
    this.protocol = 'http://';
    if(Platform.OS === 'ios') {
      this.ip = 'localhost'
    } else {
      this.ip = '141.89.169.13';
    }
    this.host = this.protocol + this.ip+':8084/';
    this.api = this.host+'api1/';
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
    this.lastRequest = {url: url, req: req};
    return fetch(url, req).then((response) => {
      var contentType = response.headers.get('content-type');
      if(contentType && contentType.indexOf('application/json') !== -1) {
        return response.json();
      } else {
        return response.text();
      }
    });
  }

  delete(url){

  }

  save(key, value){
    this.setItem(key, value);
  }

  getName(key){
    return this.constructor.name + '_' + key;
  }

  setItem(key, value){
    return AsyncStorage.setItem(this.getName(key), JSON.stringify(value));
  }

  getItem(key, defaultValue){
    return AsyncStorage.getItem(this.getName(key)).then((value) => { return value ? JSON.parse(value) : defaultValue; });
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


}

module.exports = Model;
