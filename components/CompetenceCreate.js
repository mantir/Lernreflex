import React, {Component} from 'react';
import {
  TouchableHighlight,
  ListView,
  ScrollView,
  Text,
  TextInput,
  View,
  Alert,
  NavigatorIOS,
} from 'react-native';
import Autocomplete from 'react-native-autocomplete-input';

import {
  styles,
  Competence,
  LearningTemplate,
  User,
  Loader,
  InputScrollView
} from 'reflect/imports';

class CompetenceCreate extends Component{
  constructor(){
    super();
    this.state = {
      title:'',
      catchwords:[],
      group:'',
      groups:[]
    };
  }

  createCompetence(){
    var competence = new Competence();
    var user = new User();
    var learningTemplate = new LearningTemplate();
    //console.log(this.state.title);
    this.setState({loading:true});
    var _this = this;
    user.isLoggedIn().done((d) => {
      learningTemplate.save({
        userName: d.username,
        groupId: 'randomString',
        selectedTemplate: this.state.group
      })
      .then(() => competence.save({
          forCompetence: this.state.title,
          catchwords: this.state.catchwords,
          isGoal: this.props.type === 'goals',
          subCompetences: [],
          superCompetences: [],
          learningProjectName: this.state.group
      }))
      .done(() => this.props.navigator.pop(), (error) => {
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
    const { groups } = this.state;
    const regex = new RegExp(`${query.trim()}`, 'i');
    return groups.filter(group => group.title.search(regex) >= 0);
  }

  _renderButton(){
    if(!this.state.loading) {
      return <TouchableHighlight underlayColor={styles._.hoverBtn} style={styles._.button} onPress={() => this.createCompetence()}>
      <Text style={[styles._.buttonText, styles._.big]}>Erstellen</Text>
    </TouchableHighlight>} else {
      return <Loader color={styles._.primary} />
    }
  }

  render(){
    var type = this.props.type;
    const {group} = this.state;
    const groups = this._findGroup(group);
    const comp = (s, s2) => s.toLowerCase().trim() === s2.toLowerCase().trim();
    return <View style={styles.wrapper}>
        <InputScrollView keyboardDismissMode="interactive" ref="scrollView">
        <TextInput
          ref="title"
          onChangeText={(title) => this.setState({title})}
          value={this.state.title}
          multiline={true}
          numberOfLines={4}
          style={styles.comp.titleInput}
          maxLength={styles.max.competenceTitle}
          autoFocus={true}
          editable={!this.state.loading}
          onSubmitEditing={() => this.refs.tag.focus()}
          placeholder={this.props.inputTitle}>
        </TextInput>
        {this._renderTags(this.state.catchwords)}
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
        <Autocomplete
          ref="group"
          onChangeText={(group) => this.setState({group})}
          onSubmitEditing={(event) => {}}
          value={this.state.group}
          multiline={false}
          editable={!this.state.loading}
          style={styles.comp.input}
          data={groups.length === 1 && comp(group, groups[0].title) ? [] : groups}
          defaultValue={group}
          maxLength={styles.max.competenceGroup}
          renderItem={({title}) => (
            <TouchableOpacity onPress={() => this.setState({group: title})}>
              <Text style={styles.itemText}>
                {title}
              </Text>
            </TouchableOpacity>
          )}
          placeholder="Einer Gruppe zuordnen">
        </Autocomplete>
        {this._renderButton()}
      </InputScrollView>
    </View>
  }
}

module.exports = CompetenceCreate;
