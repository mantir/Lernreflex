'use strict'
import Model from 'Lernreflex/models/Model';
import {User} from 'Lernreflex/imports';

class Badge extends Model{
  constructor(caching = true){
    super('Badge', caching);
  }

  generateID(obj){
    return obj.title;
  }

  getBadges(){
    return this.getItem('badges', {}).then(this.mapToNumericalKeys).then(this.dummyData);
  }

  getUserBadges(){
    let user = new User();
    return user.isLoggedIn().then((u) => this.get('progress/badges', {userId:u.username, password:u.password}));
  }

  dummyData(){
    let objs = [];
    let num = 5;
    for(var i = 0; i < num; i++){
      objs.push({
        id: i,
        title: 'Badge ' + i,
        done: true
      });
    }
    let q = Promise.resolve(objs);
    return q;
  }
}

module.exports = Badge;
