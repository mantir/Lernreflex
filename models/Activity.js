'use strict'
import Model from 'Lernreflex/models/Model';
import {User} from 'Lernreflex/imports'

/**
 * Represents an activity (Model).
 * @extends Model
 * @constructor
 * @param {bool} caching - If data can be fetched from cache.
 */

class Activity extends Model{

  constructor(caching = true){
    super('Activity', caching);
    this.urls = {
      activities: ''
    };
    this.evidenceParamName = 'user'; //Is added to an activity-URL to get user specific evidence
    this.definition = {
      name: '*',
      url: '*',
      icon: '*',
      qtip: '*'
    }
    this.setApi(1);
  }

  /**
  * Save an activity object to the API
  * @param obj {object} An activity object that has everything defined in the definition
  * @return {Promise}
  */
  save(obj){
    obj.icon = '-';
    obj.qtip = '-';
    obj = this.checkDefinition(obj);
    if(obj){
      return this.put('activities', obj);
    }
  }

  /**
  * Get the comments of an activity from the progress object of a competence
  * @param competenceProgress {object} A progress object of a competence
  * @param activity {object} An activity object
  * @return {array} Comments for the given activity
  */
  commentsToView(competenceProgress, activity){
    //console.log(competenceProgress, activity);
    let comments = [];
    if(competenceProgress && Array.isArray(competenceProgress.evidences)) {
      for(var i in competenceProgress.evidences){
        let l = competenceProgress.evidences[i];
        if(l.evidenceUrl.indexOf(activity.url) > -1) {
          comments = l.comments.sort((a, b) => a.created > b.created);
          break;
        }
      }
    }
    return comments;
  }

  /**
  * Save a comment for an activity to the API
  * @param obj {object} A comment object
  * @return {Promise}
  */
  comment(obj){
    if(!obj.user){
      let user = new User();
      return user.isLoggedIn().then(u => {
        if(u && u.username) {
          obj.user = u;
          return this.comment(obj);
        }
        return false;
      })
    }
    if(!obj.comment || !obj.comment.trim()) return;
    let o = {
      competence: obj.competence.name,
      competenceLinksView: [{
        evidenceTitel: obj.activity.name,
        evidenceUrl: this.addUsernameToUrl(obj.activity.url, obj.user.username),
        comments: [{
          user: obj.author.username,
          text: obj.comment,
          courseContext: obj.competence.courseId
        }],
        validated: false
      }
    ],
    abstractAssessment: [
    ]
  }
  //console.log(o);
  return this.put('progress/'+obj.user.username+'/competences/'+obj.competence.name, o);
}

/**
* Check if an activity was done by a user
* @param evidence {object} An evidence object of a progress object of a competence object
* @param username {string} Username
* @return {bool}
*/
isDone(evidence, username){
  console.log(evidence, username);
  return evidence.comments && evidence.comments.filter((c) => c.user != username).length > 0;
}

/**
* Store to every activity in a list of activities if they were done by a user
* @param activities {array} A list of activities
* @param competenceData {object} A competence object containing progress.evidence
* @param username {strting} Username
* @return {array}
*/
areDone(activities, competenceData, username){
  if(!competenceData.progress.evidences) return activities;
  return activities.map((a) => {
    a.done = competenceData.progress.evidences.filter((e) => {
      return e.evidenceUrl.indexOf(a.url) > -1 && this.isDone(e, username)
    }).length > 0;
    console.log(a.done);
    return a;
  });
}

/**
* Add the username to an evidence url to make it unique to the user. This is necessary
* because the activity urls in Moodle are not unique to a user.
* @param url {string} Evidence url
* @param username {string} Username
* @return {string}
*/
addUsernameToUrl(url, username){
  let symbol = url.indexOf('?') > -1 ? '&' : '?';
  return url+symbol+this.evidenceParamName+'='+username;
}

/**
* Get the activities for a competence from the API
* @param competence {string} The competence ID
* @return {Promise}
*/
getActivities(competence){
  let user = new User();
  let _this = this;
  return user.isLoggedIn().then((u) => {
    return _this.get('activities/competences/'+competence).then((activities) => {
      console.log('Activities:', activities, competence);
      activities = activities.map((a) => {a.type = 'activity'; a.activityData = {...a}; return a;});
      return activities;
    });
  });
}

/**
* Get all the activities from a course. This is only used for the admin.
* @param courseId {string} course ID
* @return {Promise}
*/
getCourseActivities(courseId){
  let user = new User();
  let _this = this;
  return user.isLoggedIn().then((u) => {
    return _this.get('courses/'+courseId+'/activities', {userId:u.username, password:u.password}).then((d) => {
      let activities = [];
      let already = {};
      //console.log(d);
      if(d && d.length) {
        for(var i in d) {
          if(d[i] && d[i].activityTypes && d[i].activityTypes.length) {
            d[i].activityTypes.map((at) => {
              let acts = at.activities.map((a) => {
                a.activityType = at.name;
                a.type = 'activity';
                if(!already[a.activityType + a.name]) {
                  activities.push(a);
                  activities[activities.length - 1].activityData = {...a};
                  already[a.activityType+a.name] = true;
                }
              });
              return acts;
            });
          }
        }
      }
      //console.log('Activities:', activities);
      return activities;
    });
  });
}

/**
* Return the ID of an activity object
* @param obj {object} An activity object
* @return {string} ID
*/
generateID(obj){
  return obj.url;
}



}

module.exports = Activity;
