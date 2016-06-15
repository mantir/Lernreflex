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
      console.log(this.lastRequest);
      this.getItem(key, {})
        .then((comps) => {comps[id] = obj; return comps;})
        .then((comps) => super.save(key, comps));
      return this.put('competences/'+(id), obj).then(this.log);
    }
  }

  asssess(obj){
    return this.put('progress/'+obj.user+'/competences/', obj);
  }

  generateID(obj){
    return obj.forCompetence;
  }

  getGoals(){
    return this.getCompetences();
    //return this.getItem('goals', {}).then(this.mapToNumericalKeys);
  }

  getCompetences(){
    //return this.getItem('competences', {}).then(this.mapToNumericalKeys);
    var learningTemplate = new LearningTemplate();
    var _this = this;
    return learningTemplate.getLearningTemplates()
    .then((templates) => {
      //console.log(templates);
      var q = new Promise(function(resolve, reject){
        var result = {}, orderedResult = {};
        var counter = 0;
        templates = templates.data;
        if(!templates){
          resolve([]);
        }
        templates.map((template) => {
          var already = {};
          _this.get('competences/', {courseId:'university', asTree:true, learningTemplate: template}).then((d) => {
            counter++;
            console.log(d, _this.lastRequest);
            d = _this.parseFromTree(d);
            if(d.length) {
              result[template] = d;
            }
            console.log(result);
            if(counter == templates.length){
              templates.filter((t) => orderedResult[t] = result[t])
              resolve(orderedResult);
            }
          }, () => reject());
        }
      )});
      return q;
    });
  }

  /*
  * Sucht Kompetenzen aus Daten und überprüft
  * ob und wie die Über- oder Unterkompetenzrelation zu anderen Kompetenzen ist
  * @param result: array of arrays
  * @param key: index für momentan zu füllendes array in result
  * @param d: daten, die geparst werden sollen
  */
  parseFromTree(d){
    var _this = this;
    if(!d.length)
      return d;
    d = d[0].competence;
    var subs = {};
    for(var i in d) {
      subs = {...subs, ...this.treeSubCompetences(d[i].competence, {})};
    }

    d = d.filter((e) => {
      return !subs[e.name];
    });
    return d;
  }
  /*
  * Get an array of all subCompetences as keys
  */
  treeSubCompetences(d, subs){
    var _this = this;
    d.map((e) => {
      subs[e.name] = true;
      if(e.competence.length){
        subs = _this.treeSubCompetences(e.competence, subs);
      }
    });
    return subs;
  }

  /*
  * Returns a mapping from a data competence object to display in the view
  */
  toView(comp, type){
    var f = (comp, type) => {
      return {
        competence:comp.name,
        //subCompetences: comp.competence,
        percent:10,
        type:'competence',
        isGoal:type == 'goals'
      }
    }
    if(Array.isArray(comp)){
      return comp.map((c) => f(c, type));
    }
    return f(comp, type);
  }

  getSubCompetences(rootCompetence){
    var _this = this;
    return this.get('competences/', {rootCompetence: rootCompetence, courseId:'university', asTree: true}).then((d) => {
      return _this.parseFromTree(d);
    });
  }

  addLearningTemplate(){

  }
  addCourse(){

  }
}

module.exports = Competence;
