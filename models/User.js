'use strict'
import Model from 'Lernreflex/models/Model';

class User extends Model{
  constructor(){
    super('User'); //Dont use this.constructor.name because it will be something else when building
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
    //return new Promise((resolve, reject) => resolve("true"));
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

  getUsers(){
    let _this = this;
    return this.isLoggedIn().then((u) => _this.get('users', {userName:u.username, password:u.password})).then((d) => {
      return d.map((user) => {
        let u = {};
        u.username = user.userId;
        u.name = user.printableName ? user.printableName : u.username;
        u.role = user.role;
        u.courseContext = user.courseContext;
        u.fromSystem = user.lmsSystems;
        return u;
      });
    });
  }
}

module.exports = User;
