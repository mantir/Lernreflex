'use strict'
import Model from 'reflect/models/Model';

class Badge extends Model{
  constructor(){
    super();
  }

  generateID(obj){
    return obj.title;
  }

  getBadges(){
    return this.getItem('badges', {}).then(this.mapToNumericalKeys).then(this.dummyData);
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
