'use strict'
import Model from 'Lernreflex/models/Model';

/**
 * Represents a learningtempalte. (Model)
 * @extends Model
 * @constructor
 * @param {bool} caching - If data can be fetched from cache.
 */

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

  /**
  * Save a learning template.
  * @param obj {object} Containing the properties from the definition.
  * @return {Promise}
  */
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

  /**
  * Return the ID of a learning template object.
  * @param {string}
  */
  generateID(obj){
    return obj.selectedTemplate;
  }

  /**
  * Load the learning templates of user. Is not used anymore.
  * Could be used to make suggestions for the learning template, when creating a competence.
  * @param params {object}
  */
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
