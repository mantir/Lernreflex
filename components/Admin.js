import React, {
  Component,
} from 'react';
import {
  TouchableHighlight,
  ListView,
  TextInput,
  ScrollView,
  Text,
  View,
  NavigatorIOS,
  Platform
} from 'react-native';
import {styles, Router, User, lib, Activity, Competence, Course, Loader, SelectList} from 'Lernreflex/imports';

/**
 * Represents the view for an admin. This is a fallback view to create competences
 * and to link moodle activities and questions to them.
 * Please use moodle to create and link competences and activities.
 * @extends React.Component
 * @constructor
 */

class Admin extends Component{

  constructor(){
    super();
    this.state = {
      loading:false,
      printableName:'',
      competences:'',
      competenceForQuestions:'',
      competenceForActivity: '',
      activityId: '',
      activityName: '',
      courseName: '',
      courseId: '',
    };
    this.render = this.render.bind(this);
  }

  rowPressed(rowData) {

  }

  renderRow(rowData){
    return <TouchableHighlight underlayColor={styles.list.liHeadHover} onPress={() => this.rowPressed(rowData)} style={styles.list.liHead}>
      <View>
        <View style={styles.list.rowContainer}>
          <View style={styles.list.textContainer}>
            <Text style={styles.list.headText}>
              {rowData.title}
            </Text>
          </View>
        </View>
        <View style={styles.list.separator} />
      </View>
    </TouchableHighlight>
  }

  _renderSaveCourseButton(){
    if(!this.state.loading) {
      return <TouchableHighlight underlayColor={styles._.hoverBtn} style={styles._.button} onPress={() => this.createCourse()}>
        <Text style={[styles._.buttonText, styles._.big]}>Speichern</Text>
      </TouchableHighlight>
    } else {
      return <Loader color={styles._.primary} />
    }
  }

  _renderSaveQuestionButton(){
    if(!this.state.loading) {
      return <TouchableHighlight underlayColor={styles._.hoverBtn} style={styles._.button} onPress={() => this.saveQuestions()}>
        <Text style={[styles._.buttonText, styles._.big]}>Kompetenzfragen speichern</Text>
      </TouchableHighlight>} else {
        return <Loader color={styles._.primary} />
      }
    }

    _renderSaveActivityButton(){
      if(!this.state.loading) {
        return <TouchableHighlight underlayColor={styles._.hoverBtn} style={styles._.button} onPress={() => this.saveActivity()}>
          <Text style={[styles._.buttonText, styles._.big]}>Aktivität Kompetenz zuordnen</Text>
        </TouchableHighlight>} else {
          return <Loader color={styles._.primary} />
        }
      }

      createCourse(){
        let competences = this.state.competences.split(';');
        let course_obj = {
          courseId: this.state.courseId,
          printableName: this.state.courseName,
          competences: competences
        };
        let course = new Course();
        this.setState({loading:true});
        let _this = this;
        course.save(course_obj).then((d) => {
          _this.setState({loading:false});
        });
      }

      saveQuestions(){
        let u = new User();
        let questions = lib.constants.generalCompetenceQuestions;
        this.setState({loading:true});
        for(var i in questions){
          let q = {
            question: questions[i].text,
            competenceId: this.state.competenceForQuestions
          };
          u.post('competences/questions', q).then((d) => {
            console.log(d);
            this.setState({loading:false});
          });
        }
      }

      saveActivity(){
        let user = new User();
        let activity = new Activity();
        let a = {url:this.state.activityId, name:this.state.activityName, icon:'-', qtip:'-'};
        this.setState({loading:true});
        activity.save(a).then(() => {
          user.post('activities/links/competences/'+this.state.competenceForActivity, a).then((d) => {
            this.setState({loading:false})
          })
        });
      }

      selectPressed(name, name2){
        let elements = [];
        let user = new User();
        this.setState({loadingSelect: true});
        let cb = (elements) => {
          this.setState({loadingSelect: false});
          Router.route({
            id:'select',
            component: SelectList,
            title: name+' auswählen',
            passProps:{
              elements: elements,
              selected: ((el) => {
                let e = {};
                e[name] = el.id;
                if(name2)
                e[name2] = el.value;
                this.setState(e);
              })
            }
          }, this.props.navigator);
        }
        if(name == 'activityId'){
          let course = new Course(false);
          let activity = new Activity(false);
          user.isLoggedIn().then((u) => {
            course.getCourses().then((courses) => {
              console.log(courses);
              if(courses && courses.length) {
                let promises = [];
                for(var i in courses) {
                  promises.push(activity.getCourseActivities(courses[i].courseid));
                }
                Promise.all(promises).then((together) => {
                  console.log(together);
                  together = together.map((el) => { return el.map((e) => { return {id:e.url, value:e.name}})}).filter((e) => e.length < 10);
                  elements = [];
                  together.map((t) => {
                    elements = [...elements, ...t];
                  })
                  cb(elements);
                })
              } else cb([]);
            })
          });
        } else
        if(name == 'competenceForActivity' || name == 'competenceForQuestions'){
          let competence = new Competence(false);
          user.isLoggedIn().then((u) => {
            competence.getOverview().then((competences) => {
              console.log(competences);
              elements = [];
              let fun = (list) => {
                Object.keys(list).map((el) => {
                  console.log(list, elements, el);
                  list[el] = list[el].competences.map((e) => { return {id:e, value:e}})
                  list[el].map((t) => {
                    console.log(t);
                    elements.push(t);
                  })
                });
              }
              if(competences && competences.courses) {
                fun(competences.courses);
              }
              if(competences && competences.learningTemplates) {
                fun(competences.learningTemplates);
              }
              console.log(elements);

              cb(elements);
            })
          });
        } else
        if(name == 'courseId'){
          let competence = new Competence(false);
          user.isLoggedIn().then((u) => {
            competence.getOverview().then((competences) => {
              if(competences && competences.courses) {
                competences.courses.map((c) => {
                  elements.push({id: c.courseId, value: c.printableName});
                })
              }
              cb(elements);
            })
          });
        }
      }

      render(){
        let courseId = '';
        let printableName = '';
        let competences = '';
        return <ScrollView style={styles.wrapper}>
          <Text>Kompetenzen zu Kurs hinzufügen</Text>
          <View style={styles._.row}>
            <TouchableHighlight
              underlayColor={styles._.secondary}
              style={[styles._.col, {flex:0.8, marginRight:10}]}
              onPress={() => this.selectPressed('courseId', 'courseName')}>
              <View style={{borderBottomWidth:1, padding:5, borderColor:'#000', flex:0}}>
                <Text style={{fontSize:18}}>
                  {this.state.loadingSelect ? 'Lädt...' : (this.state.courseId ? this.state.courseName : 'Kurs für Kompetenzen wählen >')}
                </Text>
              </View>
            </TouchableHighlight>
          </View>
          <TextInput
            ref="competences"
            onChangeText={(competences) => this.setState({competences})}
            value={this.state.competences}
            multiline={true}
            editable={!this.state.loading}
            style={styles.comp.input}
            returnKeyType="next"
            blurOnSubmit={false}
            placeholder="Kompetenzen (Mit ; getrennt eintragen)">
          </TextInput>
          {this._renderSaveCourseButton()}
          {/*<TextInput
            ref="competenceForQuestion"
            onChangeText={(competenceForQuestion) => this.setState({competenceForQuestion})}
            value={this.state.competenceForQuestion}
            multiline={true}
            editable={!this.state.loading}
            style={styles.comp.input}
            returnKeyType="next"
            blurOnSubmit={false}
            placeholder="Kompetenz für Fragen">
          </TextInput>*/}
          <View style={styles._.row}>
            <TouchableHighlight
              underlayColor={styles._.secondary}
              style={[styles._.col, {flex:0.8, marginRight:10}]}
              onPress={() => this.selectPressed('competenceForQuestions')}>
              <View style={{borderBottomWidth:1, padding:5, borderColor:'#000', flex:0}}>
                <Text style={{fontSize:18}}>
                  {this.state.loadingSelect ? 'Lädt...' : (this.state.competenceForQuestions ? this.state.competenceForQuestions : 'Kompetenz auswählen >')}
                </Text>
              </View>
            </TouchableHighlight>
          </View>
          {this._renderSaveQuestionButton()}
          <View style={styles._.row}>
            <TouchableHighlight
              underlayColor={styles._.secondary}
              style={[styles._.col, {flex:0.8, marginRight:10}]}
              onPress={() => this.selectPressed('activityId', 'activityName')}>
              <View style={{borderBottomWidth:1, padding:5, borderColor:'#000', flex:0}}>
                <Text style={{fontSize:18}}>
                  {this.state.loadingSelect ? 'Lädt...' : (this.state.activityId ? this.state.activityName : 'Aktivitäts-URL auswählen >')}
                </Text>
              </View>
            </TouchableHighlight>
          </View>
          <View style={styles._.row}>
            <TouchableHighlight
              underlayColor={styles._.secondary}
              style={[styles._.col, {flex:0.8, marginRight:10}]}
              onPress={() => this.selectPressed('competenceForActivity')}>
              <View style={{borderBottomWidth:1, padding:5, borderColor:'#000', flex:0}}>
                <Text style={{fontSize:18}}>
                  {this.state.loadingSelect ? 'Lädt...' : (this.state.competenceForActivity ? this.state.competenceForActivity : 'Kompetenz für Aktivität wählen >')}
                </Text>
              </View>
            </TouchableHighlight>
          </View>
          {this._renderSaveActivityButton()}
        </ScrollView>
      }
    }
    /*    <TextInput
    ref="courseId"
    onChangeText={(courseId) => this.setState({courseId})}
    value={this.state.courseId}
    multiline={false}
    editable={!this.state.loading}
    style={styles.comp.input}
    returnKeyType="next"
    blurOnSubmit={false}
    placeholder="courseId">
    </TextInput>
    <TextInput
    ref="printableName"
    onChangeText={(printableName) => this.setState({printableName})}
    value={this.state.printableName}
    multiline={false}
    editable={!this.state.loading}
    style={styles.comp.input}
    returnKeyType="next"
    blurOnSubmit={false}
    placeholder="printableName">
    </TextInput>*/
    /*<TextInput
    ref="activityId"
    onChangeText={(activityId) => this.setState({activityId})}
    value={this.state.activityId}
    multiline={true}
    editable={!this.state.loading}
    style={styles.comp.input}
    returnKeyType="next"
    blurOnSubmit={false}
    placeholder="Aktivitäts-URL">
    </TextInput>*/


    module.exports = Admin;
