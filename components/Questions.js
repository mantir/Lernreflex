import React, {
  Component,
} from 'react';
import {
  TouchableHighlight,
  ListView,
  ScrollView,
  Text,
  TextInput,
  View,
  NavigatorIOS,
  Platform
} from 'react-native';
import {styles, Router, User, lib, Competence, CompetenceView, Loader, ListEntryCompetence} from 'Lernreflex/imports';


class Questions extends Component{

  constructor(){
    super();
    console.log('CONSTRUCTED');
    this.user = new User();
    var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    var _this = this;
    let user = new User();

    this.state = {
      dataSource: ds,
      answers: {},
      questions: []
    }
    this.renderRow = this.renderRow.bind(this);
  }

  componentDidMount(){
    this.unmounting = false;
    if(this.props.currentUser){
      this.setState({currentUser: this.props.currentUser});
    }
    console.log(this.props);
    this.setQuestions();
  }

  setQuestions(){
    let questions = this.props.questions;
    let answers = this.props.answers;
    let questionList = [
      {text: 'currentUser'},
      ...questions,
      {text: 'saveButton'},
    ];
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(questionList),
      questions: questions,
      answers: answers,
    })
  }

  loadData(){
    let user = new User();
    let _this = this;
    /*this.getAnswers().then((d) => {
    _this.setState({dataSource: _this.state.dataSource.cloneWithRows(d)});
    console.log('USERS:', d);
    });*/
  }

  saveAnswers(){
    let c = new Competence();
    let answers = Object.keys(this.state.answers).map((q) => {
      return {
        text: this.state.answers[q],
        questionId: q
      };
    });
    c.saveAnswers(this.props.competenceData, answers).then((d) => {
      this.props.navigator.pop();
    })
  }

  rowPressed(rowData) {

  }

  renderSaveButton(){
    if(this.state.currentUser) return null;
    return <TouchableHighlight underlayColor={styles._.buttonActive} onPress={() => this.saveAnswers()} style={styles._.button}>
      <Text style={styles._.buttonText}>Antworten speichern</Text>
    </TouchableHighlight>
  }

  renderUser(){
    if(this.state.currentUser){
      return <ListEntryCompetence
        type="currentUser"
        underlayColor={styles._.primary}
        onPress={() => this.showUsers()}
        rowData={this.state.currentUser}
         />
    }
    return null;
  }

  renderRow(rowData){
    if(rowData.text == 'saveButton') {
      return this.renderSaveButton();
    }
    if(rowData.text == 'currentUser') {
      return this.renderUser();
    }
    let answer = this.state.currentUser ?
    <Text style={{fontSize:18, marginLeft:20, marginRight:20, marginBottom:10}}>{this.state.answers[rowData.text]}</Text>
     : <TextInput
        ref="text[]"
        onChangeText={(text) => {this.state.answers[rowData.text] = text; this.setState({answers:this.state.answers})}}
        value={this.state.answers[rowData.text]}
        multiline={true}
        numberOfLines={4}
        returnKeyType="next"
        style={styles.comp.questionInput}
        maxLength={styles.max.answer}
        autoFocus={false}
        editable={!this.state.loading}
        placeholder='Antwort eingeben ...'>
      </TextInput>

    return <View style={styles.list.liHead}>
      <View>
        <View style={styles.list.rowContainer}>
          <View style={styles.list.textContainer}>
            <Text style={[styles.list.headText, {margin:5}]}>
              {rowData.text}
            </Text>
          </View>
        </View>
        <View style={styles._.row}>
          {answer}
        </View>
        <View style={styles.list.separator} />
      </View>
    </View>
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

module.exports = Questions;
