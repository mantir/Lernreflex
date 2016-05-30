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

import {
  styles,
  Competence,
  InputScrollView
} from 'reflect/imports';

class CompetenceCreate extends Component{
  constructor(){
    super();
    this.state = {
      title:'',
      catchwords:[],
      group:''
    };
  }

  createCompetence(){
    var competence = new Competence();
    //console.log(this.state.title);
    competence.save({
        competence: this.state.title,
        catchwords: this.state.catchwords,
        isGoal: this.props.type === 'goals'
    })
    .done(() => this.props.navigator.pop(), (error) => {
        //Errorhandler
        Alert.alert( 'Erstellen fehlgeschlagen', 'Hier steht bald der Fehler.', [
          {text: 'Ok'}, ]);
    });
  }

  componentDidMount(){
    /*var scrollViewPressHandler = this.refs.scrollView.scrollResponderHandleStartShouldSetResponderCapture;
    this.refs.scrollView.scrollResponderHandleStartShouldSetResponderCapture = e => {
      return false;
        if (e.dispatchMarker.indexOf('buttonNext') > -1) {
            return false;
        }
        return scrollViewPressHandler(e);
    }*/
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

  render(){
    var type = this.props.type;
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
          style={styles.comp.input}
          maxLength={styles.max.competenceCatchwords}
          returnKeyType="next"
          blurOnSubmit={false}
          placeholder="Tags hinzufügen (Mit Weiter bestätigen)">
        </TextInput>
        <TextInput
          ref="group"
          onChangeText={(group) => this.setState({group})}
          onSubmitEditing={(event) => {}}
          value={this.state.group}
          multiline={false}
          style={styles.comp.input}
          maxLength={styles.max.competenceGroup}
          placeholder="Einer Gruppe zuordnen">
        </TextInput>
        <TouchableHighlight underlayColor={styles._.hoverBtn} style={styles._.button} onPress={() => this.createCompetence()}>
          <Text style={[styles._.buttonText, styles._.big]}>Erstellen</Text>
        </TouchableHighlight>
      </InputScrollView>
    </View>
  }
}

module.exports = CompetenceCreate;
