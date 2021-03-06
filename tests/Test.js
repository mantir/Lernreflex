'use strict'
import React, {
  Component,
} from 'react';
import {
  TouchableHighlight,
  ListView,
  Platform,
  Text,
  View,
  NavigatorIOS,
  ToolbarAndroid
} from 'react-native';
import CompetenceView from 'Lernreflex/components/CompetenceView';
import CourseView from 'Lernreflex/components/CourseView';
import ListEntryCompetence from 'Lernreflex/components/ListEntryCompetence';
import {Router, styles, Competence, User, Course, LearningTemplate} from 'Lernreflex/imports';
import UITest from 'Lernreflex/tests/UITest'


class Test extends Component{

  constructor(){
    super();
    var ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2,
      //sectionHeaderHasChanged : (s1, s2) => s1 !== s2
    });
    this.testCompName = 'Ich kann sicher Lego fahren.';
    this.testCompName2 = 'Ich kann fernseh gucken.';
    this.tests = [
      {id:1, name:'testCreateUser'},
      {id:6, name:'testCreateLearningTemplate'},
      {id:2, name:'testCreateCompetence'},
      {id:3, name:'testCreateCourse'},
      {id:4, name:'testGetCompetences'},
      {id:5, name:'testGetCourses'},
      {id:6, name:'uiTest'},
    ];
    this.state = {
      dataSource: ds.cloneWithRows(this.tests),
      loaded: false
    };
    this.renderRow = this.renderRow.bind(this);
    this.rowPressed = this.rowPressed.bind(this);
    /*this.testCreateUser()
    .then(this.testCreateCompetence)
    .then(this.testCreateCourse)
    .then(this.testGetCompetences);*/
    //this.testCreateUser();
    //this.testCreateCompetence();
    //this.testGetCompetences();
    //this.testCreateCourse();
    this.user = new User();
    this.competence = new Competence();
    this.learningTemplate = new LearningTemplate();
    this.course = new Course();
  }
  testCreateLearningTemplate(){
    var user = new User();
    var _this = this;
    return user.isLoggedIn().then((d) => {
      if(!d){
        return ['not', 'not'];
      }
      let templateName = 'RealTest';
      let learningTemplate = {
        userName: d.username,
        groupId: 'randomString',
        selectedTemplate: templateName
      };
      var l = new LearningTemplate();
      return l.save(learningTemplate)
      .then((d) => [d, l.lastRequest]);
    });
  }

  testCreateCompetence(){
    var user = new User();
    var _this = this;
    return user.isLoggedIn().then((d) => {
      if(!d){
        return ['not', 'not'];
      }
      let templateName = 'Frankreich';
      let learningTemplate = {
        userName: d.username,
        groupId: 'randomString',
        selectedTemplate: templateName
      };
      let competence = {
        //operator: 'können',
        forCompetence: _this.testCompName,
        catchwords:['Auto'],
        subCompetences: [],
        isGoal: true,
        superCompetences: [],
        learningProjectName: templateName
      };
      var l = new LearningTemplate();
      var c = new Competence();
      return l.save(learningTemplate)
      .then(() => c.save(competence))
      .then((d) => [d, c.lastRequest]);
    });
  }

  testGetCompetences(){
    var user = this.user;
    var competence = this.competence;
    var learningTemplate = this.learningTemplate;
    return competence.getCompetences()
      .then((d) => [d, competence.lastRequest]);
  }

  testGetCourses(){
    var user = this.user;
    var course = this.course;
    return course.getCourses()
      .then((d) => [d, course.lastRequest]);
  }

  testCreateCourse(){
    console.log('user');
    var c = {
      courseId: 'randomString',
      competences: [this.testCompName, this.testCompName2],
      printableName: 'randomString'
    };
    var course = new Course();
    return course.save(c)
    .then((d) => [d, course.lastRequest]);
  }

  testCreateUser(){
    var u = {
      role:'teacher',
      user:'mkapp',
      lmsSystems:'moodle',
      courseContext:'university',
    };
    var user = this.user;
    return user.save(u)
      .then((d) => [d, user.lastRequest]);
  }

  uiTest(){
    this.render = function() {
      return <UITest />
    }
    this.setState({tdfsdfsd:1});
    return new Promise((resolve, reject) => {
      resolve(['Render UI', {}]);
    });
  }

  componentDidMount(){
    this.componentDidUpdate();
  }

  componentWillUnmount(){
    this.unmounting = true;
  }

  componentDidUpdate(){
    var _this = this;

  }

  rowPressed(rowData) {
    this[rowData.name]().then((d) => {
      d[0] = JSON.stringify(d[0]);
      alert(d[0]+' '+rowData.name+' abgeschlossen.');
      this.setState({lastRequest:JSON.stringify(d[1])})
    });
  }

  renderRow(rowData){
      return <TouchableHighlight underlayColor={styles.list.liHeadHover} onPress={() => this.rowPressed(rowData)} style={styles.list.liHead}>
        <View>
          <View style={styles.list.rowContainer}>
            <View style={styles.list.textContainer}>
              <Text style={styles.list.headText}>
                {rowData.name}
              </Text>
            </View>
          </View>
          <View style={styles.list.separator} />
        </View>
      </TouchableHighlight>
  }

  render(){
    return <View style={styles.wrapper}>
      <ListView
        style={styles._.list}
        dataSource={this.state.dataSource}
        renderRow={this.renderRow}>
      </ListView>
      <Text>{'Last request: '+this.state.lastRequest}</Text>
    </View>
  }
}

module.exports = Test;
