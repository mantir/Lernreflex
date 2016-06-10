'use strict'
import {
  Platform,
  AsyncStorage
} from 'react-native';
import ip from 'reflect/localip';

class Model{
  constructor(className){
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
    this.className = className; //Dont use this.constructor.name because it will be something else when building
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
    var nocache;
    if(params){
      if(params.nocache){
        nocache = true;
        delete params.nocache;
      }
      Object.keys(params).forEach(key => {
        url += lim+key +'=' + encodeURIComponent(params[key]);
        lim = '&';
      });
    }
    //alert(url);
    //return Promise.resolve();
    return this.fetch(url, req, nocache);
  }

  post(url){

  }

  fetch(url, req, nocache){
    url = this.api+url;
    const delay = 10*1000; //Abstand zwischen 2 gleichen GET-Requests (Sonst aus Cache)
    var request = this.lastRequest = {url: url, req: req};
    var caching = req.method.toUpperCase() === 'GET' && !nocache;
    var callback = (response) => {
      var contentType = response.headers ? response.headers.get('content-type') : '';
      //alert(contentType);
      var processResponse = (d) => {
        if(typeof(d) === 'string' && d.indexOf('Request failed') > -1)
          throw 'Grizzly request failed.';
        if(caching){ //
          return this.setItem(request.url, d, true).then(() => d);
        }
        return d;
      };
      if(contentType && contentType.indexOf('application/json') !== -1) {
        return response.text().then((d) => {
          try {
            console.log('parsed JSON');
            return processResponse(JSON.parse(d));
          } catch (e) {
            console.log('parsed Error' + d);
            return processResponse(d);
          }
        });
      } else {
        return response.text().then(processResponse);
      }
    }
    caching = false;
    if(caching){
      return this.getItem(request.url, false, false, true)
      .then((d) => d && Date.now() - d < delay ? this.getItem(request.url, {}) : fetch(url, request))
      .then(callback);
    }
    return fetch(url, req).then(callback);
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
      throw 'Properties missing in ' + this.className + ': ' + error.join(', ');
    return obj;
  }

  save(key, value){
    this.setItem(key, value);
  }

  getName(key, name){
    name = name ? name : this.className;
    return name + '_' + key;
  }

  setItem(key, value, time){
    return AsyncStorage.setItem(this.getName(key), JSON.stringify(value)).then((d) => {
      if(time)
        return AsyncStorage.setItem(this.getName(key)+'_time', Date.now().toString());
      return d;
    })
  }
  /*
  *
  */
  getItem(key, defaultValue, name, time){
    time = time ? '_time' : '';
    return AsyncStorage.getItem(this.getName(key, name)+time).then((value) => { return value ? JSON.parse(value) : defaultValue; });
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
