'use strict'
import Model from 'reflect/models/Model';

class User extends Model{
  constructor(){
    super();
    this.urls = {
      competences: ''
    }
    this.definition = {
      role:'*',
      user:'*',
      lmsSystems:'*',
      courseContext:'*',
    }
    this.setApi(1);
  }

  save(obj){
    obj = this.checkDefinition(obj);
    if(obj){
      return this.put('users/'+obj.user, obj);
    }
  }

  generateID(obj){

  }

  tryLogin(user, password){
    return this.get('users/'+user+'/exists', {password:password, nocache:true});
  }

  login(username, password){
    if(username && password) {
      let user = {
        username: username,
        password: password
      };
      return this.setItem('auth', user);
    }
    return Promise.resolve();
  }

  isLoggedIn(){
    return this.getItem('auth', false);
  }

  logout() {
    return this.setItem('auth', false);
  }
}

module.exports = User;
