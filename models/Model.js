'use strict'
import {
  Platform,
  AsyncStorage
} from 'react-native';
import ip from 'Lernreflex/localip';
import lib from 'Lernreflex/lib';

//Default API-URL: fleckenroller.cs.uni-potsdam.de/app/competence-base
/**
* Represents a model. All models inherit from this class. It handles the communication
* to the server and the caching and storing of the data locally.
* The handling of local storage and global state should be implemented in the future with the REDUX Framework.
* Local storage and AsyncStorage are used here as a synonym.
* @constructor
* @param {string} className - The name of the object class.
* @param {bool} caching - If data can be fetched from cache.
*/

class Model {
  constructor(className, caching = true){
    this.protocol = 'http://';
    if(Platform.OS === 'ios') {
      this.ip = ip.ip ? ip.ip : 'localhost'
    } else {
      this.ip = ip.ip ? ip.ip : 'localhost';
    }
    if(this.ip.indexOf('fleckenroller') > -1) {
      this.host = this.protocol + this.ip + '/';
    } else if(this.ip.indexOf('erdmaennchen') > -1) {
      this.protocol = 'https://';
      this.host = this.protocol + this.ip + '/';
    } else
    if(this.ip.indexOf('competence-base') > -1) {
      this.host = this.protocol + this.ip + '/';
    } else {
      this.host = this.protocol + this.ip+':8084/';
    }
    this.api1 = this.host+'api1/';
    this.api0 = this.host+'competences/';
    this.api = this.api1;
    this.headers = {
      'Accept' : 'application/json',
      //'Content-Type' : 'application/json',
      //'Host' : this.host
    };
    this.putHeaders = {
      //'Accept' : 'text/plain',
      'Content-Type' : 'application/json', //Muss gesetzt sein!
      //'Host' : this.host
    };
    this.className = className; //Dont use this.constructor.name because it will be something else when building
    this.definition = false;
    this.caching = caching;
    this.prefix = 'lernreflex_'; //Prefix for AsyncStorage
    this.cache_time = 3600; //In seconds
  }

  /**
  * Set the API version for this model.
  * @param num {int} 0 or 1
  * @return {Promise}
  */
  setApi(num){
    if(num == 0){
      this.api = this.api0;
    }
    if(num == 1){
      this.api = this.api1;
    }
  }

  /**
  * Send a HTTP PUT request to the API
  * @param url {string} Url
  * @param body {object} Message body
  * @return {Promise}
  */
  put(url, body){
    let req = {
      method: 'PUT',
      headers: this.putHeaders,
      body: JSON.stringify(body)//.replace(/\\/,'')
    }
    return this.fetch(url, req);
  }

  /**
  * Send a HTTP GET request to the API
  * @param url {string} Url
  * @param params {object} Query parameters
  * @return {Promise}
  */
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

  /**
  * Send a HTTP POST request to the API
  * @param url {string} Url
  * @param body {object} Request body
  * @return {Promise}
  */
  post(url, body){
    let req = {
      method: 'POST',
      headers: this.putHeaders,
      body: JSON.stringify(body)
    }
    return this.fetch(url, req);
  }

  /**
  * Send a request to the API
  * @param url {string} Url
  * @param req {object} Contains the request method, headers and body
  * @param nocache {bool} If nothing should be fetched from cache
  * @return {Promise}
  */
  fetch(url, req, nocache){
    //console.log('Fecthing:', url);
    url = this.api + url;
    const delay = this.cache_time * 1000; //Abstand zwischen 2 gleichen GET-Requests (Sonst aus Cache)
    var request = this.lastRequest = {url: url, req: req};
    var isGET = req.method.toUpperCase() === 'GET';
    var caching = this.caching && isGET && !nocache;
    var fromCache = false;
    var errorCallback = (d) => {
      console.log('errorCallback:', d);
    };
    var callback = (response) => {
      var contentType = response.headers ? response.headers.get('content-type') : '';
      //console.log(contentType);
      if(fromCache) {
        //console.log(fromCache);
        return response;
      }
      var processResponse = (d) => {
        console.log('Response:', d);
        if(typeof(d) === 'string' && d.indexOf('Request failed') > -1)
        throw 'Grizzly request failed.';
        if(isGET){ //
          if(Array.isArray(d)) {
            d = d.map((e) => {e.requestSourceUrl = url; return e});
          } else if(typeof(d) == 'object') {
            d.requestSourceUrl = url;
          }
          return this.setItem(request.url, d, true).then(() => d);
        }
        return d;
      };
      if(contentType && contentType.indexOf('application/json') !== -1) {
        return response.text().then((d) => {
          try {
            //console.log('parsed JSON');
            return processResponse(JSON.parse(d));
          } catch (e) {
            console.log('parsed Error' + d);
            return processResponse(d);
          }
        }, errorCallback);
      } else {
        return response.text().then(processResponse, errorCallback);
      }
    }
    //caching = false;
    console.log('Fetching:', url);
    if(caching){
      return this.getItem(request.url, false, false, true)
      .then((d) => {
        //console.log(d, Date.now(), delay, Date.now() - d);
        fromCache = d && Date.now() - d < delay;
        return fromCache ? this.getItem(request.url, false): fetch(url, req)
      })
      .then(callback, errorCallback);
    }
    //console.log(req);
    var requestObject = new Request(url, req);
    console.log(requestObject);
    return fetch(requestObject).then(callback, errorCallback);
  }

  delete(url){
    /*not implemented*/
  }

  /**
  * CHeck if a data object fits to its definition
  * @param obj {object} Data object
  * @return {object}
  */
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

  /**
  * Store a value locally
  * @param key {string} Key
  * @param value {mixed} Value to store for the key
  */
  save(key, value){
    this.setItem(key, value);
  }

  /**
  * Get the key in the local storage for given key and classname
  * @param key {string} Key
  * @param name {string} A class name (Optional)
  * @return {Promise}
  */
  getName(key, name){
    name = name ? name : this.className;
    return this.prefix + name + '_' + key;
  }

  /**
  * Set an item in the AsyncStorage
  * @param key {string} Key
  * @param value {mixed} Value to store for the key
  * @param time {bool} If the string "_time" should be added at the end of the key name. This is for storing storing times for certain values.
  * @return {Promise}
  */
  setItem(key, value, time){
    //console.log('KEYNAME:', this.getName(key));
    return AsyncStorage.setItem(this.getName(key), JSON.stringify(value)).then((d) => {
      if(time)
      return AsyncStorage.setItem(this.getName(key)+'_time', Date.now().toString());
      return d;
    })
  }

  /**
  * Get an item from the AsyncStorage
  * @param key {string} Key
  * @param defaultValue {mixed} The default value to return, if nothing is stored under the given key. (Optional)
  * @param name {string} A class name (Optional)
  * @param time {bool} If the string "_time" is added to the end of the key (Optional)
  * @return {Promise}
  */
  getItem(key, defaultValue, name, time){
    time = time ? '_time' : '';
    return AsyncStorage.getItem(this.getName(key, name)+time).then((value) => { return value ? JSON.parse(value) : defaultValue; });
    //item ? JSON.parse(item) : defaultValue;
  }
  /**
  * Get all the keys in the AsynStorage starting with the prefix of this app defined in the constructor.
  * @return {Promise}
  */
  getAllKeys(){
    return AsyncStorage.getAllKeys().then((keys) => keys.filter((k) => k.startsWith(this.prefix)));
  }

  /**
  * Remove all keys and values from AsynStorage.
  * @return {Promise}
  */
  clearStorage(){
    return this.getAllKeys().then((keys) => keys && keys.length ? AsyncStorage.multiRemove(keys) : Promise.resolve(false));
  }

  /**
  * Map an object with non numerical keys to an array
  * @param obj {object} Object representing a list
  * @return {array}
  */
  mapToNumericalKeys(obj){
    return Object.keys(obj).map(key => obj[key]);
  }

  /**
  * Remove key and value from local AsyncStorage
  * @param key {string} Key to remove
  * @return {Promise}
  */
  removeLocal(key){
    return AsyncStorage.removeItem(this.getName(key));
  }

  /**
  * Log data to the console
  * @param d {mixed} data to log
  * @return {mixed}
  */
  log(d){
    console.log(d);
    return d;
  }

  /**
  * Check if the current user is logged in.
  * @return {Promise}
  */
  isLoggedIn(){
    return this.getItem('auth', false, 'User');
  }

  /**
  * Set the "state" of the model, and store that something has changed.
  * @param key {string} Key
  * @param value {mixed} Value for the key
  * @return {Promise}
  */
  setState(key, value){
    let _this = this;
    return this.getItem('changes', {}).then((changes) => {
      if(!changes) changes = {};
      return _this.setItem(key, value).then(() => {
        //changes = {};
        changes[key] = key;
        console.log('SettingChanges:', changes);
        return _this.setItem('changes', changes);//.then(() => this.getItem('changes')).then((value) => console.log('Saved?', value));
      });
    });
  }

  /**
  * Check if the value of some variables in the local storage have changed
  * @param list {object|array} Of objects
  * @param searchPath {string} Path inside the object E.g.: '{}.{}.name' to get the name of an object inside an object in the list.
  * @param setPath {string} The path inside the object from searchPath, that should be changed. E.g. '-' In the current Object, '--' in the parent object.
  * @param valueCallback {function} To be executed for every element found in setPath
  * @return {Promise}
  */
  mayApplyLocalChanges(list, searchPath, setPath, valueCallback){
    let count = 0;
    return this.getItem('changes', false).then((changes) => {
      if(!changes || !list || !Object.keys(changes).length) return false;
      let promises = [];
      let keys = [];
      for(var i in changes){
        keys.push(i);
        promises.push(this.getItem(changes[i]));
      }
      return Promise.all(promises).then((values) => {
        console.log(values, list);
        for(var i in values) {
          if(values[i]) {
            let v = valueCallback ? valueCallback(values[i]) : values[i];
            list = lib.functions.setObjectValues(list, searchPath, changes[keys[i]], setPath, v);
          }
        }
        console.log(list);
        return list;
      }).then((list) => {
        return this.setItem('changes', false).then(() => list);
      });
    });
  }
}

module.exports = Model;
