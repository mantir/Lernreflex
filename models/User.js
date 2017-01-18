'use strict'
import Model from 'Lernreflex/models/Model';
import {lib} from 'Lernreflex/imports';

/**
 * Represents a user.
 * @extends Model
 * @constructor
 * @param {bool} caching - If data can be fetched from cache.
 */

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

  /**
  * Save a user object to the API
  * @param obj {object} A user object that has everything defined in the definition
  */
  save(obj){
    obj = this.checkDefinition(obj);
    if(obj){
      return this.put('users/'+obj.userId, obj);
    }
  }

  generateID(obj){

  }

  /**
  * Try to log in
  * @param user {string} username
  * @param password {string} password
  * @return {Promise}
  */
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

  /**
  * Log the user in and trigger the sync with the API
  * @param username {string} username
  * @param password {string} password
  * @return {Promise}
  */
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

  /** Check if current user is logged in
  * @return {Promise}
  */
  isLoggedIn(){
    return this.getItem('auth', false);
  }

  /**
  * Log the current user out
  * @return {Promise}
  */
  logout() {
    return this.setItem('auth', false);
  }

  /** Get the users of a course
  * @param courseId {string} course Id
  * @return {Promise}
  */
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
  /** Get the current user object
  * @return {Promise}
  */
  getCurrentUser(){
    return this.getItem('currentUser');
  }

  /**
  * Set the current user in local storage
  * @param currentUser {object} containing username and password
  * @return {Promise}
  */
  setCurrentUser(currentUser){
    return this.setItem('currentUser', currentUser);
  }

  /** Check if two users are different
  * @param u1 {object|string} user 1
  * @param u2 {object|string} user 2
  * @return {bool}
  */
  different(u1, u2){
    return !u1 != !u2 || (u1 && u2 && u1.username != u2.username);
  }

}

module.exports = User;
