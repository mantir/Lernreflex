'use strict'
import Model from 'Lernreflex/models/Model';
import {User} from 'Lernreflex/imports'

class Activity extends Model{

  constructor(){
    super('Activity');
    this.urls = {
      activities: ''
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

  comment(obj){
    return this.put('progress/'+obj.user+'/activities/', obj);
  }

  getActivities(courseId){
    let user = new User();
    let _this = this;
    return user.isLoggedIn().then((u) => {
      return _this.get('courses/'+courseId+'/activities', {userId:u.username, password:u.password}).then((d) => {
        let activities = [];
        if(d[0] && d[0].activityTypes && d[0].activityTypes.length) {
          d[0].activityTypes.map((at) => {
            let acts = at.activities.map((a) => {
              a.activityType = at.name;
              a.type = 'activity';
              activities.push(a);
            });
            return acts;
          });
        }
        console.log('ACT:',activities);
        return activities;
      });
    });
  }

  generateID(obj){
    return obj.forActivity;
  }



}

module.exports = Activity;
