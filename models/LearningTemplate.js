'use strict'
import Model from 'Lernreflex/models/Model';

class LearningTemplate extends Model{
  constructor(caching = false){
    super('LearningTemplate', caching);
    this.definition = {
        userName: '*',
        groupId: '*',
        selectedTemplate: '*'
    };
    this.courseContext = 'randomString';
    this.setApi(1);
  }

  save(obj){
    let key = 'learningTemplates';
    let id = this.generateID(obj);
    obj.groupId = this.courseContext;
    obj = this.checkDefinition(obj);
    if(obj){
      return this.put('learningtemplates/'+(id), obj);
      //return this.getItem(key, {})
        //.then((comps) => {comps[id] = obj; return comps;})
        //.then((comps) => super.save(key, comps));
    }
  }

  generateID(obj){
    return obj.selectedTemplate;
  }

  getLearningTemplates(params){
    return this.isLoggedIn().then((d) => {
      let l = {
        userId: d.username,
        groupId: this.courseContext,
      };
      return this.get('learningtemplates/', l);
    });
    //this.getItem('learningTemplates', params).then(this.mapToNumericalKeys);
  }
}

module.exports = LearningTemplate;
