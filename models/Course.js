'use strict'
import Model from 'reflect/models/Model';

class Course extends Model{
  constructor(){
    super('Course');
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
      return this.getItem(key, {})
        .then((comps) => {comps[id] = obj; return comps;})
        .then((comps) => super.save(key, comps));
    }
  }

  generateID(obj){
    return obj.courseId;
  }

  getCourses(params){
    return this.isLoggedIn().then((d) => {
      let l = {
        userId: d.username,
        groupId: 'randomString',
      };
      return this.get('courses/', params);
    });
    //this.getItem('courses', params).then(this.mapToNumericalKeys);
  }
}

module.exports = Course;
