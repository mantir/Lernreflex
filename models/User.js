'use strict'
import Model from 'reflect/models/Model';

class User extends Model{
  constructor(){
    super();
    this.urls = {
      competences: ''
    }
    this.setApi(1);
  }

  save(obj){

  }

  generateID(obj){

  }

  tryLogin(user, password){
    return this.get('users/'+user+'/exists', {password:password});
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
