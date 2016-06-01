'use strict'
import Model from 'reflect/models/Model';

class Competence extends Model{
  constructor(){
    super();
    this.urls = {
      competences: ''
    }
    this.scales = {
      progress: {unit:'%', values:[0, 10,20,30,40,50,60,70,80,90,100]},
      time: {unit:'h', values:['< 10', '> 10', '> 25', '> 50', '> 100', '> 200', '> 500']},
      interest: {unit:'', values:['Klein', 'Mittel', 'Groß']}
    };
  }

  save(obj){
    var key = obj.isGoal ? 'goals' : 'competences';
    let id = this.generateID(obj);
    this.put(this.api+'competences/'+(id), obj).done((d) => console.log(d));
    console.log(this.lastRequest);
    obj.percent = obj.isGoal ? 0 : 100;
    obj.type = 'competence';
    return this.getItem(key, {})
      .then((comps) => {comps[id] = obj; return comps;})
      .then((comps) => super.save(key, comps));
  }

  generateID(obj){
    return obj.competence;
  }

  getGoals(){
    return this.getItem('goals', {}).then(this.mapToNumericalKeys);
  }

  getCompetences(){
    return this.getItem('competences', {}).then(this.mapToNumericalKeys);
  }

  addLearningTemplate(){

  }
  addCourse(){
    
  }
}

module.exports = Competence;
