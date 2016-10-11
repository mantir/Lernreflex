'use strict'
import Model from 'Lernreflex/models/Model';

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
    //this.getItem('courses', params).then(this.mapToNumericalKeys);
  }
}

module.exports = Course;
