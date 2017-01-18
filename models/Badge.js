'use strict'
import Model from 'Lernreflex/models/Model';
import {User} from 'Lernreflex/imports';

/**
 * Represents an activity.
 * @extends Model
 * @constructor
 * @param {bool} caching - If data can be fetched from cache.
 */

class Badge extends Model{
  constructor(caching = true){
    super('Badge', caching);
  }

  /**
  * Get the ID of a badge object
  * @param obj {object} a badge object
  * @return {string} 
  */
  generateID(obj){
    return obj.title;
  }

  /**
  * Get dummy badges
  * @return {Promise}
  */
  getBadges(){
    return this.getItem('badges', {}).then(this.mapToNumericalKeys).then(this.dummyData);
  }

  /**
  * Get user badges from the API
  * @return {Promise}
  */
  getUserBadges(){
    let user = new User();
    return user.isLoggedIn().then((u) => this.get('progress/badges', {userId:u.username, password:u.password})).then(this.hackToFilterBadgesWhichCouldntBeenDeleted);
  }

  /**
  * Hack to filter out badges that couldn't been deleted in Moodle, but shouldn't show in the app.
  * @param badges {array} Badges from the API
  */
  hackToFilterBadgesWhichCouldntBeenDeleted(badges){
    if(badges && badges.length) {
      badges = badges.filter((b) => b.name != 'Hallo-Welt Coder');
    }
    return badges;
  }

  /**
  * Get dummy data to show as badges
  */
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
