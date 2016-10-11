'use strict'
import Model from 'Lernreflex/models/Model';
import {LearningTemplate, Course, Activity, User} from 'Lernreflex/imports'

class Competence extends Model{

  constructor(caching = true){
    super('Competence', caching);
    this.urls = {
      competences: ''
    }
    this.scales = {
      progress: {unit:'%', values:['0', '10', '20','30','40','50','60','70','80','90','100']},
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
    obj = this.checkDefinition(obj);
    if(obj){
      let id = this.generateID(obj);
      console.log(this.lastRequest);
      this.getItem(key, {})
      .then((comps) => {comps[id] = obj; return comps;})
      .then((comps) => super.save(key, comps));
      return this.put('competences/'+(id), obj);
    }
  }

  generateID(obj){
    return obj.forCompetence;
  }

  getGoals(){
    return this.getCompetences('goals');
    //return this.getItem('goals', {}).then(this.mapToNumericalKeys);
  }

  getCompetences(type = 'competences'){
    //return this.getItem('competences', {}).then(this.mapToNumericalKeys);
    var learningTemplate = new LearningTemplate(this.caching);
    var course = new Course(this.caching);
    var _this = this;
    var doneCounter = 0;
    var resultTemplates = {}, orderedTemplates = {};
    var resultCourses = {}, orderedCourses = {};
    return new Promise((resolve, reject) => {
      console.log('getCompetences');
      Promise.all([ //LearningTemplates, Kurse und zugehörige Kompetenzen holen
        learningTemplate.getLearningTemplates()
        .then((templates) => {
          //console.log('TEMPLATES:', templates);
          var counter = 0;
          templates = templates.data;
          if(!templates) {
            return [];
          }
          var promises = [];
          templates.map((template) => {
            var already = {};
            promises.push(_this.get('competences/', {courseId:'university', asTree:true, learningTemplate: template}).then((d) => {
              counter++;
              //console.log('Template-Kompetenzen:', d);
              d = _this.parseFromTree(d);
              if(d.length) {
                resultTemplates[template] = d;
              }
              //console.log('TEMPLATES:', resultTemplates);
              if(counter == templates.length){
                templates.filter((t) => orderedTemplates[t] = resultTemplates[t])
              }
            }));
          }
        )
        //console.log(promises);
        return Promise.all(promises);
      }, () => reject()),
      course.getCourses()
      .then((courses) => {
        //console.log('Kurs-Kompetenzen:', courses);
        var counter = 0;
        var promises = [];
        if(!Array.isArray(courses) || !Object.keys(courses).length) {
          return [];
        }
        courses.map((course) => {
          var already = {};
          promises.push(_this.get('competences/', {courseId:course.courseid, asTree:true}).then((d) => {
            counter++;
            //console.log('KURS', course);
            //console.log(d, _this.lastRequest);
            d = _this.parseFromTree(d);
            if(d.length) {
              d = d.map((e) => {
                e.inCourse = true;
                e.courseId = course.courseid;
                return e;
              });
              resultCourses[course.name] = d;
            }
            //console.log('KURSE:', resultCourses);
            if(counter == courses.length){
              courses.filter((t) => orderedCourses[t.name] = resultCourses[t.name])
            }
          }));
        });
        return Promise.all(promises);
      }, () => reject())])
      .then((learningTemplates, courses) => {
        console.log(orderedTemplates);
        let together = Object.assign(orderedCourses, orderedTemplates);
        _this.getProgress().then((progress) => {
          Object.keys(together).map((key) => {
            let comps = together[key];
            if(typeof(comps) != 'object') return;
            together[key] = together[key].map((comp) => {
              if(progress && progress[comp.name]){
                comp.progress = progress[comp.name];
              } else {
                comp.progress = _this.progressToView({competence:comp.name});
              }
              return _this.toView(comp);
            });
          });
          let user = new User();
          user.isLoggedIn().then((u) => {
            resolve(this.filterType(together, type, u));
          });
        });
      });
    });

  }

  filterType(competences, type = 'competences', user){ //Filter if learning goal is reached or not
    console.log(competences);
    for(var category in competences) {
      if(competences[category])
      competences[category] = competences[category].filter((c) => {
        let done = (!c.inCourse && c.progress && c.progress.PROGRESS && c.progress.PROGRESS.assessmentIndex == 10)
        || (c.inCourse && this.hasCommentFromOtherUser(c, user.username));
        return type == 'competences' && done || type == 'goals' && !done;
      });
      if(!competences[category] || !competences[category].length) delete competences[category];
    }
    return competences;
  }

  hasCommentFromOtherUser(competence, username){
    if(competence.progress && competence.progress.evidences) {
      for(var i in competence.progress.evidences) {
        let e = competence.progress.evidences[i];
        if(e.comments && e.comments.filter((c) => c.user != username).length > 0) {
          return true;
        }
      }
    }
    return false;
  }

  getProgress(username){
    let user = new User();
    let callback = (d) => {
      if(!d || !d.userCompetenceProgressList) return false;
      let progress = {};
      d.userCompetenceProgressList.map(this.progressToView).map((p) => {
        progress[p.competence] = p;
      });
      return progress;
    };
    console.log('USER-Progress:', username);
    if(username) {
      return this.get('progress/'+username).then(callback);
    }
    return user.isLoggedIn().then((u) => {
      return this.get('progress/'+u.username).then(callback);
    })
  }

  progressToView(p){
    let pro = {
      name: p.competence,
      competence: p.competence,
    }

    if(!p.abstractAssessment || !Object.keys(p.abstractAssessment).length) {
      pro = {...pro, PROGRESS:{assessmentIndex:0}, TIME:{assessmentIndex:0}}
    } else
    p.abstractAssessment.map((a) => {
      pro[a.typeOfSelfAssessment] = a;
    })

    console.log('ProgressToView', pro);
    pro.evidences = p.competenceLinksView;
    pro.answers = p.reflectiveQuestionAnswerHolder ? p.reflectiveQuestionAnswerHolder.data : [];
    return pro;
  }

  saveProgress(p){
    let progress = {
      userCompetenceProgressList: [{
        competence: p.competence,
        competenceLinksView: [],
        abstractAssessment: [{
          typeOfSelfAssessment: p.identify.toUpperCase(),
          assessmentIndex: p.value,
          learningGoal: false,
          minValue: p.minValue,
          maxValue: p.maxValue
        }
      ]}
    ]}
    progress = progress.userCompetenceProgressList[0];
    let user = new User();
    return user.isLoggedIn().then((u) => {
      console.log('USER-PROGRESS', JSON.stringify(progress));
      return this.put('progress/'+u.username+'/competences/'+progress.competence, progress)
      .then(() => this.progressToView(progress));
      //return this.put('progress/'+u.username, progress).then((d) => {console.log('SAVED:', d);});
    })
  }

  answersToView(competenceData){
    let answers;
    try {
      answers = competenceData.progress.answers;
    } catch(e) {
      answers = [];
    }
    return answers;
  }

  saveAnswers(competenceData, answers){
    console.log(competenceData, answers);
    let user = new User();
    let promises = [];
    return user.isLoggedIn().then((u) => {
      /*let obj = {
      competence: competenceData.name,
      reflectiveQuestionAnswerHolder:{data:answers.map((a) => {a.userId = u.username; return a})},
      competenceLinksView: [],
      abstractAssessment: []
    };*/
    answers = answers.map((a) => {
      a.userId = u.username;
      return a
    });
    for(var i in answers) {
      promises.push(this.put('competences/questions/answers', answers[i]));
    }
    return Promise.all(promises);
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
  //console.log(d);
  if(!d || !Object.keys(d).length ){
    //console.log('OUT-1');
    return [];
  }
  d = d[0].children;
  if(!d || !Object.keys(d).length){
    //console.log('OUT-2');
    return [];
  }
  var subs = {};
  for(var i in d) {
    subs = {...subs, ...this.treeSubCompetences(d[i].children, {})};
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
    if(e.children.length){
      subs = _this.treeSubCompetences(e.children, subs);
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
      name: comp.name,
      competence:comp.name,
      courseId: comp.courseId,
      inCourse: comp.inCourse,
      progress: comp.progress,
      percent: comp.progress && comp.progress.PROGRESS ? this.scales.progress.values[comp.progress.PROGRESS.assessmentIndex] : 0,
      //subCompetences: comp.competence,
      type:'competence',
      isGoal:type == 'goals',
      competenceData: comp,
    }
  }
  if(Array.isArray(comp)){
    return comp.map((c) => f(c, type));
  }
  return f(comp, type);
}

getSubCompetences(rootCompetence, courseId = 'university'){
  var _this = this;
  return this.get('competences/', {rootCompetence: rootCompetence, courseId:courseId, asTree: true}).then((d) => {
    return _this.parseFromTree(d);
  });
}

}

module.exports = Competence;
