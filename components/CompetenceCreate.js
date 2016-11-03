import React, {Component} from 'react';
import ReactNative, {
  TouchableHighlight,
  TouchableOpacity,
  ListView,
  ScrollView,
  Text,
  TextInput,
  Platform,
  View,
  Alert,
  NavigatorIOS,
  Picker
} from 'react-native';
import KeyboardSpacer from 'react-native-keyboard-spacer';


import {
  styles,
  Router,
  lib,
  Competence,
  LearningTemplate,
  SelectList,
  User,
  Loader,
  InputScrollView
} from 'Lernreflex/imports';

class CompetenceCreate extends Component{
  constructor(){
    super();
    this.state = {
      title:'',
      verb:'',
      catchwords:[],
      group:'',

    };
  }

  createCompetence(){
    var competence = new Competence();
    var user = new User();
    var learningTemplate = new LearningTemplate();
    var superCompetences = this.props.superCompetence ? [this.props.superCompetence] : [];
    //console.log(this.state.title);
    var _this = this;
    let verb2 = '';
    let verb = this.state.verb.split(' ... ');
    if(verb[1]) {
      verb2 = verb[1];
    }
    verb = verb[0];
    let r = {'Tätigkeit': verb, 'Lernziel':this.state.title, 'Tags':this.state.catchwords.length > 0, 'Kategorie':this.state.group};
    let empty = Object.keys(r).filter((k) => !r[k]);
    if(empty.length) {
      Alert.alert('Fehlende Infos.', 'Folgende Felder müssen noch ausgefüllt werden: ' + empty.join(', '), [
        {text: 'Ok, mach ich.'},
      ]);
      return;
    }
    this.setState({loading:true});
    let competenceTitle = ('Ich '+verb+' '+this.state.title+' '+verb2).trim();
    user.isLoggedIn().done((u) => {
      learningTemplate.save({
        userName: u.username,
        groupId: learningTemplate.courseContext,
        selectedTemplate: this.state.group
      })
      .then(() => competence.save({
        forCompetence: competenceTitle,
        operator: this.state.verb,
        catchwords: this.state.catchwords,
        isGoal: this.props.type === 'goals',
        subCompetences: [],
        superCompetences: superCompetences,
        learningProjectName: this.state.group
      }))
      .done(() => {
        this.saveQuestions(competenceTitle);
        let competence = new Competence();
        competence.setItem('reloadGoals', true).then(() => {
          this.props.navigator.pop();
        })
        /*if(this.props.afterCompetenceCreate) {
          this.props.afterCompetenceCreate();
        }*/
      }, (error) => {
        //Errorhandler
        Alert.alert('Erstellen fehlgeschlagen', 'Das Lernziel konnte nicht gespeichert werden.', [
          {text: 'Ok, schade'},
        ]);
        _this.setState({loading:false});
      });
    });
  }

  saveQuestions(competenceId){
    let u = new User();
    let questions = lib.constants.generalCompetenceQuestions;
    for(var i in questions){
      let q = {
        question: questions[i].text,
        competenceId: competenceId
      };
      u.post('competences/questions', q).then((d) => {
        console.log(d);
      });
    }
  }

  createCourse(){

  }

  componentDidMount(){
    console.log(this.props.afterCompetenceCreate);

    this.unmounting = false;
  }

  componentWillUnmount(){
    this.unmounting = true;
  }

  setState(obj){
    if(this.unmounting) return;
    super.setState(obj);
  }

  removeTag(i){
    this.state.catchwords.splice(i, 1); //nicht mit delete entfernen, length wird sonst nicht verändert
    this.setState({catchwords:this.state.catchwords});
  }

  addTag(blurred){
    console.log('blurred');
    var tag = this.state.tag;
    if(!tag || !tag.trim() || this.managedTag)
    return;
    this.managedTag = true;
    this.state.catchwords.push(tag.trim());
    setTimeout(function(){
      this.managedTag = false;
      this.setState({tag:'', catchwords: this.state.catchwords});
      //if(!blurred) this.refs.tag.focus();
    }.bind(this), 0);
  }

  _renderTags(tags){
    var rows = [];

    if(!tags.length)
    return null;
    for (var i in tags) {
      rows.push(<TouchableHighlight onPress={() => this.removeTag(i)} key={i} style={styles.comp.tagItem}>
      <Text style={styles.comp.tagItemText}>{tags[i]}</Text>
    </TouchableHighlight>);
  }
  return <View>
    <Text style={styles._.ml10}>Tags: </Text>
    <ScrollView
      horizontal={false}
      styles={styles.comp.tagItemsWrapper}
      contentContainerStyle={[styles.comp.tagItems]}>
      {rows}
    </ScrollView>
  </View>
}

_renderButton(){
  if(!this.state.loading) {
    return <TouchableHighlight underlayColor={styles._.hoverBtn} style={[styles._.button, styles._.col]} onPress={() => this.createCompetence()}>
      <Text style={[styles._.buttonText, styles._.big]}>Erstellen</Text>
    </TouchableHighlight>
  } else {
    return <View style={styles._.col}><Loader color={styles._.primary} /></View>
  }
}

_renderSuperCompetence(){
  if(!this.props.superCompetence)
  return null;
  return <Text style={styles.comp.superTitle}>{'Als Teil von: ' + this.props.superCompetence}</Text>
}

getVerbs(){
  let verbs = lib.constants.verbs.map(lib.functions.ich);
  verbs.sort();
  return verbs;
}

_scrollToBottom(refName) {
  var _this = this;
  if(Platform.OS != 'ios') return;
  setTimeout(() => {
    let scrollResponder = _this.refs.scroller.getScrollResponder();
    scrollResponder.scrollResponderScrollNativeHandleToKeyboard(
      ReactNative.findNodeHandle(_this.refs[refName]),
      10, //additionalOffset
      true
    );
  }, 1);
}


selectPressed(){
  if(this.refs.title)
  this.refs.title.blur();
  Router.route({
    id:'select',
    component: SelectList,
    title: 'Tätigkeit auswählen',
    passProps:{
      placeholder: 'Ich ...',
      elements: this.getVerbs(),
      selected: ((el) => {
        if(this.refs.title)
          this.refs.title.focus();
        this.setState({verb:el})
      })
    }
  }, this.props.navigator)
}


render(){
  var type = this.props.type;
  let group = this.state.group;
  let verb2 = '';
  let verb = this.state.verb.split(' ... ');
  if(verb[1]) {
    verb2 = verb[1];
  }
  let ThisScrollView = Platform.OS == 'ios' ? InputScrollView : ScrollView;
  verb = verb[0];
  return <View style={styles.wrapper}>
    <ThisScrollView keyboardDismissMode="interactive" keyboardShouldPersistTaps={true} ref="scroller">
      {this._renderSuperCompetence()}
      <View style={[styles._.row, {marginTop:10}]}>
        <Text style={[styles._.col, {flex:0.1, fontSize:20, paddingLeft:10}]}>Ich</Text>
        <TouchableHighlight
          underlayColor={styles._.secondary}
          style={[styles._.col, {flex:0.8, marginRight:10}]}
          onPress={() => this.selectPressed()}
          selectedValue={this.state.verb.split(' ... ')[0]}>
          <View style={{borderBottomWidth:1, padding:5, borderColor:'#000', flex:0}}>
            <Text style={{fontSize:18}}>
              {verb ? verb : 'Tätigkeit auswählen >'}
            </Text>
          </View>
        </TouchableHighlight>
      </View>
      {(() => {
        if(this.state.verb) return <View><View style={styles._.row}>
          <TextInput
            ref="title"
            autoCapitalize='none'
            onChangeText={(title) => this.setState({title})}
            value={this.state.title}
            multiline={true}
            returnKeyType='next'
            numberOfLines={4}
            style={[styles.comp.titleInput, {borderWidth:0, borderTopLeftRadius:0,borderTopRightRadius:0}]}
            maxLength={styles.max.competenceTitle}
            editable={!this.state.loading}
            placeholder={this.props.inputTitle}>
          </TextInput>
        </View>
        {(() => {
          if(verb2) return <View style={styles._.row}>
            <Text style={[styles._.col, {flex:1, fontSize:20, paddingLeft:10}]}>{verb2}.</Text>
          </View>
        })()}
        <View style={styles._.row}>
          {this._renderTags(this.state.catchwords)}
        </View>
        <View style={styles._.row}>
          <TextInput
            ref="tag"
            onChangeText={(tag) => this.setState({tag})}
            onSubmitEditing={(event) => this.addTag()}
            onBlur={() => this.addTag(true)}
            value={this.state.tag}
            multiline={false}
            editable={!this.state.loading}
            style={styles.comp.input}
            maxLength={styles.max.competenceCatchwords}
            returnKeyType="next"
            blurOnSubmit={false}
            placeholder="Tags hinzufügen (Mit Weiter bestätigen)">
          </TextInput>
        </View>
        <View style={styles._.row}>
          <TextInput
            ref="group"
            onChangeText={(group) => this.setState({group})}
            onSubmitEditing={(event) => {}}
            value={this.state.group}
            multiline={false}
            onFocus={() => this._scrollToBottom('group')}
            editable={!this.state.loading}
            style={styles.comp.input}
            defaultValue={group}
            maxLength={styles.max.competenceGroup}
            renderItem={({title}) => (
              <TouchableOpacity onPress={() => this.setState({group: title})}>
                <Text style={styles.itemText}>
                  {title}
                </Text>
              </TouchableOpacity>
            )}
            placeholder="Einer Kategorie zuordnen">
          </TextInput>
        </View>
        <View style={styles._.row}>
          {this._renderButton()}
        </View>
      </View>
      })()}
    </ThisScrollView>
  {/*  <KeyboardSpacer onToggle={(state) => console.log('TOGGLED', state)} />*/}
  </View>
}
}

module.exports = CompetenceCreate;
