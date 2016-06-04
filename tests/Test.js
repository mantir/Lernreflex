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
import CompetenceView from 'reflect/components/CompetenceView';
import CourseView from 'reflect/components/CourseView';
import ListEntryCompetence from 'reflect/components/ListEntryCompetence';
import {Router, styles, Competence, User, Course, LearningTemplate} from 'reflect/imports';


class Test extends Component{

  constructor(){
    super();
    var ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2,
      sectionHeaderHasChanged : (s1, s2) => s1 !== s2
    });
    this.state = {
      dataSource: ds,
      loaded: false
    };
    this.renderRow = this.renderRow.bind(this);
    //this.testCreateCompetence();
    //this.testGetCompetences();
    //this.testCreateUser();
    this.testCreateCourse();
  }

  testCreateCompetence(){
    var user = new User();
    user.isLoggedIn().done((d) => {
      if(!d){
        return false;
      }
      let templateName = 'Real Life';
      let learningTemplate = {
        userName: d.username,
        groupId: 'randomString',
        selectedTemplate: templateName
      };
      let competence = {
        //operator: 'können',
        forCompetence: 'Ich kann sicher Lego fahren.',
        catchwords:['Auto'],
        subCompetences: [],
        isGoal: true,
        superCompetences: [],
        learningProjectName: templateName
      };
      var l = new LearningTemplate();
      var c = new Competence();
      l.save(learningTemplate)
      .then(() => c.save(competence))
      .done((d) => alert(d + ' Test abgeschlossen.'));
    });
  }

  testGetCompetences(){
    var user = new User();
    var competence = new Competence();
    var learningTemplate = new LearningTemplate();
    return learningTemplate.getLearningTemplates()
      .then((d) => competence.getCompetences())
      .done((d) => alert(JSON.stringify(d)+ ' Test abgeschlossen.'));
  }

  testCreateCourse(){
    var c = {
      courseId: 'randomString',
      competences: ['Ich kann sicher Lego fahren.'],
      printableName: 'randomString'
    };
    var course = new Course();
    course.save(c)
    .done((d) => alert(JSON.stringify(d)+ ' Test abgeschlossen.'));
  }

  testCreateUser(){
    var u = {
      role:'teacher',
      user:'mkapp',
      lmsSystems:'moodle',
      courseContext:'university',
    };
    var user = new User();
    user.save(u)
      .done((d) => alert(JSON.stringify(d)+ ' Test abgeschlossen.'));
  }

  componentDidMount(){
    this.componentDidUpdate();
  }

  componentWillUnmount(){
    this.unmounting = true;
  }

  componentDidUpdate(){
    var _this = this;
    var competence = new Competence();
    //alert(this.props.type);
    //competence.getAllKeys().done((keys) => console.log(keys));
    //competence.removeLocal('goals');
    var type = this.props.type;
    if(type === 'goals') {
      competence.getGoals().done((goals) => {
        if(goals.length && !_this.unmounting){
          _this.setState({
            dataSource: _this.state.dataSource.cloneWithRows(goals),
            loaded: true
          });
        }
      });
    } else {
      competence.getCompetences().done((competences) => {
        if(competences.length && this.unmounting){
          _this.setState({
            dataSource: _this.state.dataSource.cloneWithRows(competences),
            loaded: true
          });
        }
      });
    }
  }

  rowPressed(rowData) {
    //console.warn(styles.route);
    if(rowData.type == 'competence'){
      Router.route({
        title: 'Lernziel',
        id: 'goal',
        component: CompetenceView,
        passProps: {data: rowData}
      }, this.props.navigator);
    } else if(rowData.type == 'course'){
      Router.route({
        title: 'Gruppe',
        id: 'group',
        component: CourseView,
        passProps: {data: rowData}
      }, this.props.navigator);
    }
  }

  renderRow(rowData){
    if(rowData.type == 'competence'){
      return <ListEntryCompetence
        underlayColor={styles.list.liHover}
        onPress={() => this.rowPressed(rowData)}
        rowData={rowData}
        style={styles.list.li} />
    } else if(rowData.type == 'course'){
      return <TouchableHighlight underlayColor={styles.list.liHeadHover} onPress={() => this.rowPressed(rowData)} style={styles.list.liHead}>
        <View>
          <View style={styles.list.rowContainer}>
            <View style={styles.list.textContainer}>
              <Text style={styles.list.headText}>
                {rowData.title}
              </Text>
              <Text style={styles.list.right}>
                {rowData.percent}%
              </Text>
            </View>
          </View>
          <View style={styles.list.separator} />
        </View>
      </TouchableHighlight>
    }
  }

  render(){
    return <View style={styles.wrapper}>
      <ListView
        style={styles._.list}
        dataSource={this.state.dataSource}
        renderRow={this.renderRow}>
      </ListView>
    </View>
  }
}

module.exports = Test;
