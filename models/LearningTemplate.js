'use strict'
import Model from 'reflect/models/Model';

class LearningTemplate extends Model{
  constructor(){
    super();
  }

  save(obj){
    let key = 'learningTemplates';
    obj.id = this.generateID(obj);
    return this.getItem(key, {})
      .then((comps) => {comps[obj.id] = obj; return comps;})
      .then((comps) => super.save(key, comps));
  }

  generateID(obj){
    return obj.title;
  }

  getLearningTemplates(){
    return this.getItem('learningTemplates', {}).then(this.mapToNumericalKeys);
  }
}

module.exports = LearningTemplate;
