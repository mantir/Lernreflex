'use strict'
import Model from 'Lernreflex/models/Model';
import {lib} from 'Lernreflex/imports';

class User extends Model{

  constructor(caching = true){
    super('User', caching); //Dont use this.constructor.name because it will be something else when building
    this.urls = {
      competences: ''
    }
    this.definition = {
      role:'*',
      userId:'*',
      lmsSystems:'*',
      printableName:'*',
      courseContext:'*',
    }
    this.setApi(1);
  }

  save(obj){
    obj = this.checkDefinition(obj);
    if(obj){
      return this.put('users/'+obj.userId, obj);
    }
  }

  generateID(obj){

  }

  tryLogin(user, password){

    //return new Promise((resolve, reject) => resolve("true"));
    return this.clearStorage()
    .then(() => this.get('users/'+user+'/systems', {password:password, nocache:true}).then((d) => {
      console.log(d);
      if(d && d.data && d.data.length) {
        d = lib.functions.swapKeyVal(d.data);
        if(!d.moodle) return false;
        /*if(!d.db) return this.save({
          userId: user,
          courseContext: 'university',
          role: 'student',
          printableName: user,
          lmsSystems: 'db'
        }).then(() => d);*/
        return true;
      }
      return false;
    }));
  }

  login(username, password){
    if(username && password) {
      let user = {
        username: username,
        password: password
      };
      let sync = {
        userName: username,
        password: password,
        syncUsers: true,
        syncCourses: true,
        syncBadges: false,
        syncActivities: false,
      };
      return this.post('users/sync/moodle', sync)
        .then(() => this.setItem('auth', user));
    }
    return Promise.resolve();
  }

  isLoggedIn(){
    return this.getItem('auth', false);
  }

  logout() {
    return this.setItem('auth', false);
  }

  getUsers(courseId){
    let _this = this;
    return this.isLoggedIn().then((u) => _this.get('users', {userName:u.username, password:u.password})).then((d) => {
      let users = d.map((user) => {
        let u = {};
        u.username = user.printableName ? user.printableName : user.userId; //From moodle: userId is a number, printableName is the username
        u.name = u.username;
        u.role = user.role;
        u.courseContext = user.courseContext;
        u.fromSystem = user.lmsSystems;
        return u;
      });
      return users.filter((u) => {
        return u.courseContext+'' == courseId+'' && users.filter((us) => {
          return us.fromSystem == 'db' && us.username == u.username;
        }).length > 0;
      });
    });
  }

  getCurrentUser(){
    return this.getItem('currentUser');
  }

  setCurrentUser(currentUser){
    return this.setItem('currentUser', currentUser);
  }

  different(u1, u2){
    return !u1 != !u2 || (u1 && u2 && u1.username != u2.username);
  }

}

module.exports = User;
