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
import Autocomplete from 'react-native-autocomplete-input';


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
      categories: ['Hallo', 'Oder']

    };
  }

  createCompetence(){
    var competence = new Competence();
    var user = new User();
    var learningTemplate = new LearningTemplate();
    var superCompetences = this.props.superCompetence ? [this.props.superCompetence] : [];
    //console.log(this.state.title);
    this.setState({loading:true});
    var _this = this;
    user.isLoggedIn().done((u) => {
      learningTemplate.save({
        userName: u.username,
        groupId: 'randomString',
        selectedTemplate: this.state.group
      })
      .then(() => competence.save({
        forCompetence: 'Ich '+this.state.verb+' '+this.state.title,
        operator: this.state.verb,
        catchwords: this.state.catchwords,
        isGoal: this.props.type === 'goals',
        subCompetences: [],
        superCompetences: superCompetences,
        learningProjectName: this.state.group
      }))
      .done(() => {
        this.props.navigator.pop();
        //console.log(this.props.afterCreation);
        if(this.props.afterCreation) {
          this.props.afterCreation(this.state.title);
        }
      }, (error) => {
        //Errorhandler
        Alert.alert('Erstellen fehlgeschlagen', 'Hier steht bald der Fehler.', [
          {text: 'Ok'},
        ]);
        _this.setState({loading:false});
      });
    });
  }

  createCourse(){

  }

  componentDidMount(){

  }

  removeTag(i){
    this.state.catchwords.splice(i, 1); //nicht mit delete entfernen, length wird sonst nicht verändert
    this.setState({catchwords:this.state.catchwords});
  }

  addTag(blurred){
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

_findGroup(query){
  if (query === '') {
    return [];
  }
  const { categories } = this.state;
  const regex = new RegExp(`${query.trim()}`, 'i');
  return categories.filter(group => group.search(regex) >= 0);
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
  this.setState({justSelected:false});
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
        this.setState({verb:el, justSelected:true})
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
  console.log(verb2);
  verb = verb[0];
  const categories = this._findGroup(group);
  const comp = (s, s2) => s.toLowerCase().trim() === s2.toLowerCase().trim();
  return <View style={styles.wrapper}>
    <InputScrollView keyboardDismissMode="interactive" ref="scroller">
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
            numberOfLines={4}
            style={[styles.comp.titleInput, {borderWidth:0, borderTopLeftRadius:0,borderTopRightRadius:0}]}
            maxLength={styles.max.competenceTitle}
            autoFocus={this.state.justSelected ? true : false}
            editable={!this.state.loading}
            onSubmitEditing={() => this.refs.tag.focus()}
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
            onBlur={(event) => this.addTag(true)}
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
            data={categories}
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
    </InputScrollView>
  </View>
}
}

module.exports = CompetenceCreate;
