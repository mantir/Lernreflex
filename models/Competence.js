'use strict'
import Model from 'reflect/models/Model';
import {LearningTemplate} from 'reflect/imports'

class Competence extends Model{

  constructor(){
    super('Competence');
    this.urls = {
      competences: ''
    }
    this.scales = {
      progress: {unit:'%', values:[0, 10,20,30,40,50,60,70,80,90,100]},
      time: {unit:'h', values:['< 10', '> 10', '> 25', '> 50', '> 100', '> 200', '> 500']},
      interest: {unit:'', values:['Sehr klein', 'Klein', 'Mittel', 'Groß', 'Sehr groß']}
    };
    this.definition = {
      operator: '*',
      forCompetence: '*',
      catchwords:['*'],
      subCompetences: ['*'],
      superCompetences: ['*'],
      learningProjectName: '*'
    };
    this.setApi(1);
  }

  save(obj){
    var key = obj.isGoal ? 'goals' : 'competences';
    obj.operator = 'operator';
    obj = this.checkDefinition(obj);
    if(obj){
      let id = this.generateID(obj);
      return this.put('competences/'+(id), obj).then(this.log);
      console.log(this.lastRequest);
      return this.getItem(key, {})
        .then((comps) => {comps[id] = obj; return comps;})
        .then((comps) => super.save(key, comps));
    }
  }

  asssess(obj){
    return this.put('progress/'+obj.user+'/competences/', obj);
  }

  generateID(obj){
    return obj.forCompetence;
  }

  getGoals(){
    return this.getItem('goals', {}).then(this.mapToNumericalKeys);
  }

  getCompetences(){
    return this.getItem('competences', {}).then(this.mapToNumericalKeys);
    
    var learningTemplate = new LearningTemplate();
    var _this = this;
    return learningTemplate.getLearningTemplates()
    .then((templates) => {
      var q = new Promise(function(resolve, reject){
        var result = {};
        var counter = 0;
        for(var i in templates){
          _this.get('competences/', {courseId:'randomString', learningTemplate: templates[i]}).then((d) => {
            counter++;
            result[templates[i]] = d;
            if(counter == templates.length){
              resolve(result);
            }
          }, () => reject());
        }
      });
      return q;
    });
  }

  addLearningTemplate(){

  }
  addCourse(){

  }
}

module.exports = Competence;
