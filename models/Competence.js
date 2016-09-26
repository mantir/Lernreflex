'use strict'
import Model from 'Lernreflex/models/Model';
import {LearningTemplate, Course, User} from 'Lernreflex/imports'

class Competence extends Model{

  constructor(){
    super('Competence');
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

  assess(obj){
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
    var course = new Course();
    var _this = this;
    var doneCounter = 0;
    var resultTemplates = {}, orderedTemplates = {};
    var resultCourses = {}, orderedCourses = {};
    return new Promise((resolve, reject) => {
      //console.log(s);
      Promise.all([ //LearningTemplates, Kurse und zugehörige Kompetenzen holen
        learningTemplate.getLearningTemplates()
        .then((templates) => {
          console.log('TEMPLATES:', templates);
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
              //console.log(d, _this.lastRequest);
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
        console.log('KURSE:', courses);
        var counter = 0;
        var promises = [];
        courses.map((course) => {
          var already = {};
          promises.push(_this.get('competences/', {courseId:course.courseid, asTree:true}).then((d) => {
            counter++;
            console.log('KURS', course);
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
        _this.getProgress().then((d) => {
          console.log('Progress:', d);
          resolve(together);
        });
      });
    });

  }

  getProgress(){
    let user = new User();
    return user.isLoggedIn().then((u) => {
      return this.get('progress/'+u.username);
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
      console.log('USER-PROGRESS', JSON.stringify(progress));
      return this.put('progress/'+u.username+'/competences/'+progress.competence, progress).then((d) => {console.log('SAVED:', d);});
      //return this.put('progress/'+u.username, progress).then((d) => {console.log('SAVED:', d);});
    })
  }

  saveQuestion(){

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
    console.log(d);
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
        competence:comp.name,
        courseId: comp.courseId,
        inCourse: comp.inCourse,
        //subCompetences: comp.competence,
        type:'competence',
        isGoal:type == 'goals'
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
