'use strict'
import Model from 'Lernreflex/models/Model';

/**
 * Represents a course. This class is not used except for the admin.
 * The overview from API for the competences contains the courses for the user
 * @extends Model
 * @constructor
 * @param {bool} caching - If data can be fetched from cache.
 */

class Course extends Model{
  constructor(caching = true){
    super('Course', caching);
    this.definition = {
        courseId: '*',
        competences: ['*'],
        printableName: '*'
    };
    this.setApi(1);
  }

  save(obj){
    let key = 'courses';
    let id = this.generateID(obj);
    obj = this.checkDefinition(obj);
    if(obj){
      return this.put('courses/'+(id), obj);
      //return this.getItem(key, {})
        //.then((comps) => {comps[id] = obj; return comps;})
        //.then((comps) => super.save(key, comps));
    }
  }

  generateID(obj){
    return obj.courseId;
  }
  
  getCourses(params){
    return this.isLoggedIn().then((d) => {
      let l = {
        password: d.password,
      };
      return this.get('users/'+d.username+'/courses', l).then(this.log);
    });
  }
}

module.exports = Course;
