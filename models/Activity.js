'use strict'
import Model from 'reflect/models/Model';

class Activity extends Model{

  constructor(){
    super();
    this.urls = {
      activities: ''
    }
    this.scales = {
      progress: {unit:'%', values:[0, 10,20,30,40,50,60,70,80,90,100]},
      time: {unit:'h', values:['< 10', '> 10', '> 25', '> 50', '> 100', '> 200', '> 500']},
      interest: {unit:'', values:['Klein', 'Mittel', 'Groß']}
    };
    this.definition = {
      operator: '*',
      forActivity: '*',
      catchwords:['*'],
      subActivitys: ['*'],
      superActivitys: ['*'],
      learningProjectName: '*'
    };
    this.setApi(1);
  }

  save(obj){
    var key = obj.isGoal ? 'goals' : 'activities';
    obj.operator = 'operator';
    obj = this.checkDefinition(obj);
    if(obj){
      let id = this.generateID(obj);
      //return this.put('activities/'+(id), obj).then(this.log);
      console.log(this.lastRequest);
      return this.getItem(key, {})
        .then((comps) => {comps[id] = obj; return comps;})
        .then((comps) => super.save(key, comps));
    }
  }

  asssess(obj){
    return this.put('progress/'+obj.user+'/activities/', obj);
  }

  generateID(obj){
    return obj.forActivity;
  }

  getGoals(){
    return this.getItem('goals', {}).then(this.mapToNumericalKeys);
  }

  getActivitys(){
    //return this.isLoggedIn().then((d) => this.get('activities/', {userId:d.username, courseId:'randomString'}));
    return this.getItem('activities', {}).then(this.mapToNumericalKeys);
  }

  addLearningTemplate(){

  }
  addCourse(){

  }
}

module.exports = Activity;
