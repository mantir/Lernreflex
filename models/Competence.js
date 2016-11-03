'use strict'
import Model from 'Lernreflex/models/Model';
import {LearningTemplate, Course, Activity, User, lib} from 'Lernreflex/imports'

class Competence extends Model{

  constructor(caching = true){
    super('Competence', caching);
    this.urls = {
      competences: ''
    }
    this.scales = {
      progress: {unit:'%', values:['0', '10', '20','30','40','50','60','70','80','90','100']},
      time: {unit:'Min', values:['0 - 10', '10 - 20', '20 - 30', '30 - 60', '60 - 120', '120 - 180', '> 180']},
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

  getOverview(type = 'comptences'){ //faster to get learnigntemplates and courses and competences
    let user = new User();
    return user.isLoggedIn().then((u) => {
      return this.get('users/'+u.username+'/overview');
    });
  }

  getGoals(){
    return this.getCompetences('goals');
    //return this.getItem('goals', {}).then(this.mapToNumericalKeys);
  }

  getCompetences(type = 'competences'){
    let learningTemplate = new LearningTemplate();
    let user = new User();
    return user.isLoggedIn().then((user) => {
      return this.getOverview(type).then((ov) => {
        console.log(ov);
        if(!ov) return {};
        let together = {};
        if(ov.courses && ov.courses.length > 0){ //From courses
          ov.courses.map((course) => {
            if(course.courseId != learningTemplate.courseContext) {
              together[course.printableName] = course.competences.map((comp) => {
                return {name:comp, text:this.toIch(comp), inCourse:true, courseId: course.courseId}
              });
            }
          });
        }
        if(ov.learningTemplates && ov.learningTemplates.length > 0) {
          ov.learningTemplates.map((l) => {
            if(!l.competences) return null;
            together[l.selectedTemplate] = l.competences.map((comp) => {
              return {name:comp, text:this.toIch(comp)}
            });
          });
        }
        return this.getProgress().then((progress) => {
          together = this.joinProgressAndCompetences(together, progress);
          return this.checkHasNewGoalReached(together, user, type).then(() => this.filterType(together, type, user)
        );
      });
    });
  });
}

countCompetences(competences){
  let count = 0;
  for(var category in competences) {
    count += competences[category].length;
  }
  return count;
}

checkHasNewGoalReached(allCompetences, user, type){
  let itemName = 'allCompetences';
  console.log(allCompetences);
  if(!allCompetences || !Object.keys(allCompetences).length) return this.setItem(itemName, allCompetences);
  return this.getItem(itemName, false).then((allOldCompetences) => {
    if(!allOldCompetences || !Object.keys(allOldCompetences).length) return this.setItem(itemName, allCompetences);
    let oldGoals = this.filterType(allOldCompetences, 'goals', user);
    let oldCompetences = this.filterType(allOldCompetences, 'competences', user);
    let newGoals = this.filterType(allCompetences, 'goals', user);
    let newCompetences = this.filterType(allCompetences, 'competences', user);
    console.log(this.countCompetences(newGoals), this.countCompetences(oldGoals), this.countCompetences(oldCompetences), this.countCompetences(newCompetences));
    let newGoalReached = false;
    if(this.countCompetences(newGoals) < this.countCompetences(oldGoals) && this.countCompetences(oldCompetences) < this.countCompetences(newCompetences) ) {
      console.log('new GOAL Reached!');
      newGoalReached = true;
      this.newGoalsReached = this.countCompetences(newCompetences) - this.countCompetences(oldCompetences);
    }
    return this.setItem(itemName, allCompetences);
  });
}

joinProgressAndCompetences(together, progress){
  Object.keys(together).map((key) => {
    let comps = together[key];
    //console.log(together, progress);
    if(typeof(comps) != 'object') return;
    together[key] = together[key].map((comp) => {
      if(progress && progress[comp.name]){
        comp.progress = progress[comp.name];
      } else {
        comp.progress = this.progressToView({competence:comp.name});
      }
      return this.toView(comp);
    });
  });
  return together;
}

filterType(competences, type = 'competences', user){ //Filter if learning goal is reached or not
  //console.log(competences);
  let filtered = {};
  for(var category in competences) {
    if(competences[category] && competences[category].length)
    filtered[category] = competences[category].filter((c) => {
      let done = (!c.inCourse && c.progress && c.progress.PROGRESS && c.progress.PROGRESS.assessmentIndex == 10)
      || (c.inCourse && this.hasCommentFromOtherUser(c, user.username));
      return type == 'competences' && done || type == 'goals' && !done;
    });
    if(!filtered[category] || !filtered[category].length) delete filtered[category];
  }
  return filtered;
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
  //console.log('USER-Progress:', username);
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

  //console.log('ProgressToView', pro);
  pro.evidences = p.competenceLinksView;
  pro.answers = p.reflectiveQuestionAnswerHolder ? p.reflectiveQuestionAnswerHolder.data : [];
  return pro;
}

getQuestions(competenceId){
  let caching = this.caching;
  this.caching = false;
  return this.get('competences/'+competenceId+'/questions').then((d) => {
    let questions = d ? d.map((q) => q.question) : [];
    console.log(questions);
    this.caching = caching;
    return questions.map((q, i) => { return {text:q, index:i}; });
  })
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
    //console.log('USER-PROGRESS', JSON.stringify(progress));
    return this.put('progress/'+u.username+'/competences/'+progress.competence, progress)
    .then(() => this.progressToView(progress));
  })
}

answersToView(competenceData, questions){
  let answersQ = {};
  let answers = {};
  let unordered = {};
  answersQ = lib.functions.setKeys(competenceData.progress.answers, 'questionId');
  console.log(answersQ);
  console.log(questions);
  for(let i in answersQ) {
    for(var j in questions){
      //console.log(i, questions[j].text, i.indexOf(questions[j].text));
      if(i.indexOf(questions[j].text) > -1) {
        let t = questions[j].text;
        if(!unordered[t]) unordered[t] = [];
        unordered[t].push(answersQ[i]);
      }
    }
  }
  for(let i in unordered){
    answers[i] = unordered[i].sort((a, b) => a.datecreated < b.datecreated)[0].text;
  }
  console.log(answers);
  return answers;
}

saveAnswers(competenceData, answers){
  //console.log(competenceData, answers);
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
    a.competenceId = competenceData.name;
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
  if(!d || !Object.keys(d).length ){
    return [];
  }
  d = d[0].children;
  if(!d || !Object.keys(d).length){
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
      text: this.toIch(comp.name),
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

toIch(name){
  let die = name.startsWith('Die S.');
  if(name.startsWith('S.') || die) {
    let s = name.split(' ')
    let verb = s[die ? 2 : 1];
    let wholeVerb = verb;
    let last = s[s.length - 1].replace(/\./, '');
    //let index = lib.constants.verbs.indexOf(wholeVerb);
    let prefix = lib.constants.prefixes.indexOf(last) > - 1;
    if(prefix) {
      wholeVerb = last+verb;
      //index = lib.constants.verbs.indexOf(wholeVerb);
    }
    name = name.replace(/^(Die )?S\./, 'Ich');
    let newVerb = lib.functions.ich(wholeVerb).split(' ... ');
    name = name.replace(new RegExp(verb), newVerb[0]);
  }
  return name;
}

getSubCompetences(rootCompetence, courseId = 'university'){
  var _this = this;
  return this.get('competences/', {rootCompetence: rootCompetence, courseId:courseId, asTree: true}).then((d) => {
    return _this.parseFromTree(d);
  });
}

}

module.exports = Competence;

//getCompetences as single requests: very slow, better is overview
//return this.getItem('competences', {}).then(this.mapToNumericalKeys);
/*var learningTemplate = new LearningTemplate(this.caching);
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
d = _this.parseFromTree(d);
if(d.length) {
resultTemplates[template] = d;
}
if(counter == templates.length){
templates.filter((t) => orderedTemplates[t] = resultTemplates[t])
}
}));
}
)
return Promise.all(promises);
}, () => reject()),
course.getCourses()
.then((courses) => {
var counter = 0;
var promises = [];
if(!Array.isArray(courses) || !Object.keys(courses).length) {
return [];
}
courses.map((course) => {
var already = {};
promises.push(_this.get('competences/', {courseId:course.courseid, asTree:true}).then((d) => {
counter++;
d = _this.parseFromTree(d);
if(d.length) {
d = d.map((e) => {
e.inCourse = true;
e.courseId = course.courseid;
return e;
});
resultCourses[course.name] = d;
}
if(counter == courses.length){
courses.filter((t) => orderedCourses[t.name] = resultCourses[t.name])
}
}));
});
return Promise.all(promises);
}, () => reject())])
.then((learningTemplates, courses) => {
let together = Object.assign(orderedCourses, orderedTemplates);
_this.getProgress().then((progress) => {
together = this.joinProgressAndCompetences(together, progress);
let user = new User();
user.isLoggedIn().then((u) => {
resolve(this.filterType(together, type, u));
});
});
});
});*/
