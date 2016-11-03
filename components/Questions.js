import React, {
  Component,
} from 'react';
import {
  findNodeHandle,
  TouchableHighlight,
  ListView,
  ScrollView,
  Text,
  TextInput,
  View,
  NavigatorIOS,
  Animated,
  Alert,
  Platform
} from 'react-native';
import {
  styles,
  Icon,
  Router,
  User,
  lib,
  SuperComponent,
  Competence,
  CompetenceView,
  Loader,
  ListEntryCompetence
} from 'Lernreflex/imports';


class Questions extends SuperComponent{

  constructor(){
    super();
    this.user = new User();
    var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    var _this = this;
    let user = new User();

    this.state = {
      dataSource: ds,
      answers: {},
      questions: [],
      currentRow: -1
    }
    //this.colors = ['#09F', '#F66', '#090', '#666', '#F9F', '#990', '#099'];
    //this.colors = ['#666', '#777', '#888', '#999', '#AAA', '#BBB', '#CCC', '#DDD'];
    this.colors = ['#3E6E7F', '#4E7E8F', /*'#5E8E9F', '#6E9EAF', '#7EAEBF', '#8EBECF', '#9ECEDF'*/];
    this.render = this.render.bind(this);
    this.renderRow = this.renderRow.bind(this);
    this.renderCurrentRow = this.renderCurrentRow.bind(this);
    this.changeMode = this.changeMode.bind(this);
    this.changeQuestion = this.changeQuestion.bind(this);
  }

  componentDidMount(){
    this.setQuestions();
  }

  getMaxAnswers(){
    let oneNot = false;
    let answers = this.state.answers;
    return this.state.questions.filter((q) => {
      let res = !oneNot && answers[q.text];
      if(!answers[q.text]) oneNot = true;
      return res;
    }).length;
  }

  setQuestions(){
    let questions = this.state.questions = this.props.questions;
    let answers = this.state.answers = this.props.answers;
    let maxAnswers = this.getMaxAnswers();
    let questionList = [
      {text: 'competence'},
      {text: 'currentUser'},
      ...questions,
      //{text: 'saveButton'},
    ];
    console.log(questionList);
    //console.log(answers);
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(questionList),
      questions: questions,
      answers: answers,
      maxAnswers: maxAnswers,
      currentUser: this.props.currentUser,
      currentRow: -1
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

  saveAnswers(q){
    let c = new Competence();
    let answers = [];
    if(q) {
      answers = {};
      answers[q] = this.state.answers[q];
    } else answers = this.state.answers;
    answers = Object.keys(answers).map((q) => {
      return {
        text: this.state.answers[q],
        questionId: q
      };
    }).filter((a) => (a.text+'').trim() ? true : false);

    this.setState({saving:true});
    return c.saveAnswers(this.props.competenceData, answers).then((d) => {
      this.setState({saving:false});
      this.props.questionsAnswered();
    })
  }

  rowPressed(rowData) {

  }

  // Scroll a component into view. Just pass the component ref string.
  inputFocused (refName) {
    //console.log(refName, this.refs[refName], this.refs);
    //setTimeout(() => {
    if(Platform.OS != 'nonsense') {
      return;
    }
    let scrollResponder = this.refs.scrollView.getScrollResponder();
    scrollResponder.scrollResponderScrollNativeHandleToKeyboard(
      findNodeHandle(this.refs[refName]),
      100, //additionalOffset
      false
    );
    //}, 1);
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

  renderCompetence(){
    //console.log(this.props.competenceData);
    return <View style={{backgroundColor:'#FFF'}}>
      <Text style={styles.comp.title}>{this.props.competenceData.text}</Text>
    </View>
  }

  setCurrentFocus(){
    let fun = () => {
      if(this.refs.currentAnswer) {
        this.refs.currentAnswer.focus();
      } else
      setTimeout(fun, 100);
    }
    fun();
  }

  changeMode(mode, currentRow){
    if(mode == 1) { //In den Beantwortenmodus gehen
      //console.log(currentRow, this.state.questions);
      let answerCopies = Object.assign({}, this.state.answers);
      let currentQuestion = this.state.questions[currentRow];
      if(currentQuestion) currentQuestion = currentQuestion.text;
      this.setState({currentRow, currentQuestion, answerCopies});
      this.setCurrentFocus();
    } else if(mode == 0){ //In den Übersichtsmodus
      if(this.state.answerCopies[this.state.currentQuestion])
        this.state.answers[this.state.currentQuestion] = this.state.answerCopies[this.state.currentQuestion];
      if(this.state.changedAnswer) this.saveAnswers(this.state.currentQuestion);
      this.setState({
        maxAnswers: this.getMaxAnswers(),
        currentRow: -1
      });
    }
  }

  wasAnswered(q){
    return this.state.answers[q] && this.state.answers[q].trim();
  }

  changeQuestion(dir){
    let newRow = this.state.currentRow;
    let changedAnswer = this.state.changedAnswer;
    console.log(changedAnswer, this.wasAnswered(this.state.currentQuestion));
    if(dir == 'next'){
      if(changedAnswer) this.saveAnswers(this.state.currentQuestion);
      if(!this.wasAnswered(this.state.currentQuestion)) return;
      if(this.state.currentRow >= this.state.questions.length - 1) return this.changeMode(0);
      newRow = this.state.currentRow + 1;
    } else if(dir == 'previous'){
      if(this.state.answerCopies[this.state.currentQuestion])
        this.state.answers[this.state.currentQuestion] = this.state.answerCopies[this.state.currentQuestion];
      if(this.currentRow == 0) return this.changeMode(0);
      newRow = this.state.currentRow - 1;
    }
    delete this.refs.currentAnswer;
    let currentQuestion = this.state.questions[newRow];
    if(currentQuestion) currentQuestion = currentQuestion.text;
    this.setState({currentRow:newRow, currentQuestion:currentQuestion, changedAnswer:false});
    this.setCurrentFocus();
  }

  renderCurrentRow(rowData){
    if(rowData.index != this.state.currentRow) return null;
    let ref = 'currentAnswer';
    let index = rowData.index;
    let answer = <TextInput
      ref={(com) => this.refs[ref] = com}
      onFocus={this.inputFocused.bind(this, ref)}
      onChangeText={(text) => {
        if(this.enterButtonPressed(text)){
          this.changeQuestion('next');
        } else {
          this.state.answers[rowData.text] = text;
          this.setState({answers:this.state.answers, currentQuestion:rowData.text, changedAnswer: true});
        }
      }}
      value={this.state.answers[rowData.text]}
      multiline={true}
      numberOfLines={3}
      returnKeyType="next"
      style={styles.comp.questionInput}
      maxLength={styles.max.answer}
      autoFocus={true}
      editable={!this.state.loading}
      placeholder={rowData.placeholder ? rowData.placeholder : 'Antwort eingeben ...'}>
    </TextInput>
    return <View style={[styles.list.liHead, {backgroundColor:this.colors[rowData.index % this.colors.length]}]}>
      <Text style={[styles.list.headText, {margin:5}]}>Frage {index + 1}/{this.state.questions.length}</Text>
      <View style={[styles._.row, {paddingBottom:0}]}>
        <View style={styles._.col}>
          <Text style={[styles.list.headText, {margin:5}]}>
            {rowData.text}
          </Text>
        </View>
      </View>
      <View style={styles._.row}>
        {answer}
      </View>
      <View style={styles._.row}>
        <View style={[styles._.col, {flex:0.2}]}>
          <TouchableHighlight underlayColor='#FFF' style={styles._.button} onPress={ () => {this.changeQuestion('previous')} }>
            <Text style={styles._.buttonText}>{'<'}</Text>
          </TouchableHighlight>
        </View>
        <View style={[styles._.col, {flex:0.3}]}>
          <TouchableHighlight underlayColor='#FFF' style={[styles._.button, {backgroundColor:styles._.primaryDarker}]} onPress={ () => {this.changeMode(0)} }>
            <Text style={styles._.buttonText}>Übersicht</Text>
          </TouchableHighlight>
        </View>
        <View style={[styles._.col, {flex:0.5}]}>
          <TouchableHighlight underlayColor='#FFF' style={styles._.button} onPress={ () => {this.changeQuestion('next')} }>
            <Text style={styles._.buttonText}>Speichern{' >'}</Text>
          </TouchableHighlight>
        </View>
      </View>
    </View>
  }

  renderRow(rowData){
    if(rowData.text == 'saveButton') {
      return this.renderSaveButton();
    }
    if(rowData.text == 'currentUser') {
      return this.renderUser();
    }
    if(rowData.text == 'competence') {
      return this.renderCompetence();
    }
    if(this.state.currentRow > -1) return this.renderCurrentRow(rowData);
    if(rowData.index > this.state.maxAnswers) return null;
    var ref = '';
    ref = rowData.index !== undefined ? 'text_'+rowData.index : '';
    let index = rowData.index !== undefined ? (rowData.index + 1) + '. ' : '';
    let bg = rowData.index === undefined ? '#FFF' : this.colors[rowData.index % this.colors.length];
    var nextRef = 'text_'+(rowData.index + 1);
    let color = styles._.primaryDarker;
    let text = this.state.currentUser ? 'Frage wurde noch nicht beantwortet.' : 'Frage beantworten ...'
    if(this.state.answers[rowData.text]) {
      color = styles._.primaryBrighter;
      text = this.state.answers[rowData.text];
    }
    let answer = <Text style={{color:color, fontSize:16, marginLeft:20, marginRight:20, marginBottom:10}}>
      {text}
    </Text>

    let ComponentType = View;
    let style = [styles.list.liHead, {backgroundColor:bg}];
    let props = {};
    if(!this.state.currentUser) {
      ComponentType = TouchableHighlight;
      props.underlayColor = '#FFF';
      props.onPress = () => {
        this.changeMode(1, rowData.index);
      }
    }

    return <ComponentType {...props} style={style}>
      <View>
        <View style={[styles._.row, {paddingBottom:0}]}>
          <View style={styles._.col}>
            <Text style={[styles.list.headText, {margin:5}]}>
              {index}{rowData.text}
            </Text>
          </View>
        </View>
        <View style={[styles._.row]}>
          {answer}
        </View>

      </View>
    </ComponentType>
  }

  render(){
    //let style = this.state.currentRow > -1 ? {backgroundColor:styles._.primary} : {};
    let style = {backgroundColor:styles._.primary};
    return <View style={[styles.wrapper, style]}>
      <ListView
        ref="scrollView"
        keyboardDismissMode='interactive'
        keyboardShouldPersistTaps={true}
        style={[styles._.list]}
        dataSource={this.state.dataSource}
        renderRow={this.renderRow}>
      </ListView>
    </View>
  }
}

module.exports = Questions;
