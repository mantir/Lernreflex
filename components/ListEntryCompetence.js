'use strict'
/*
* Rendert eine Zeile in einem Listview als Kompetenz
*/
import React, {
  Component,
} from 'react';
import {
  TouchableHighlight,
  ListView,
  Platform,
  Text,
  View,
} from 'react-native';
import {styles, Icon, Router, Loader} from 'Lernreflex/imports';

class ListEntryCompetence extends Component{
  constructor(){
    super();
  }

  _user(rowData){
    return <View>
      <View style={styles.list.rowContainer}>
        <View style={styles.list.textContainer}>
          <Icon name={Router.icons.person} size={30} color='#CCC' style={{flexDirection:'column', alignSelf:'flex-start', flex:1}} />
          <Text style={[styles.list.text, {flexDirection:'column', marginTop:5, flex:8}]}>
            {rowData.name} {rowData.id == 'mySelf' ? '(Ich)' : ''}
          </Text>
        </View>
      </View>
      <View style={styles.list.separator} />
    </View>
  }

  _comment(rowData){
    let date = new Date(rowData.created);
    return <View>
      <View style={styles._.row}>
        <Text style={[styles.list.text, styles._.col, {color:'#CCC', fontSize:12, paddingLeft:10, paddingRight:10, paddingTop:10}]}>
          {rowData.user} - {date.getDate()}.{date.getMonth()}.{date.getFullYear()}, {date.getHours()}:{date.getMinutes()}
        </Text>
      </View>
      <View style={styles._.row}>
        <Text style={[styles.list.text, styles._.col, {paddingLeft:10, paddingRight:10, paddingBottom:10}]}>
          {rowData.text}
        </Text>
      </View>
      <View style={styles.list.separator} />
    </View>
  }

  _competence(){
    return <View>
      <View style={styles.list.rowContainer}>
        <View style={styles.list.textContainer}>
          <Text style={styles.list.text}>
            {this.props.rowData.competence}
          </Text>
          <Text style={styles.list.right}>
            {this.props.rowData.percent}%
          </Text>
        </View>
      </View>
      <View style={styles.list.separator} />
    </View>
  }

  _activity(rowData){
    return <View style={styles._.col}>
      <View style={styles.list.rowContainer}>
        <View style={styles.list.textContainer}>
          <Text style={styles.list.text}>
            {rowData.name}
          </Text>
          <Text style={styles.list.right}>
            {rowData.percent}
          </Text>
        </View>
      </View>

    </View>
  }

  _select(rowData){
    return <View style={styles._.col}>
      <View style={styles.list.rowContainer}>
        <View style={styles.list.textContainer}>
          <Text style={styles.list.text}>
            {rowData}
          </Text>
        </View>
      </View>
      <View style={styles.list.separator} />
    </View>
  }

  _currentUser(currentUser){
    return <View style={[styles._.row, {backgroundColor:styles._.secondary}]}>
      <Icon name={Router.icons.person} size={30} color='#FFF' style={{flexDirection:'column', marginLeft:20, alignSelf:'flex-start', flex:1}} />
      <Text style={[styles.list.headText, {flexDirection:'column', marginTop:4, flex:10}]}>
        {currentUser.name}
      </Text>
    </View>
  }

  render(){
    console.log(this.props.rowData);
    if(this.props.rowData == 'loader') {
      return <View style={styles._.col}><Loader /></View>
    }
    if(this.props.rowData.id == 'empty') {
      return <View style={[styles._.col, {alignItems: 'center'}]}>
        <Text style={{fontSize:18, padding:10, justifyContent: 'center', alignItems: 'center', alignSelf:'center'}}>
          {this.props.rowData.text}
        </Text>
      </View>
    }
    this.type = this.props.rowData.type ? this.props.rowData.type : this.props.type;
    if(!this.props.rowData) throw this.constructor.name+' needs a "rowData" object as property for type '+this.type;
    return <TouchableHighlight
      underlayColor={this.props.underlayColor}
      onPress={this.props.onPress}
      style={this.props.style}>
      {this['_'+this.type](this.props.rowData)}
    </TouchableHighlight>
  }
}

module.exports = ListEntryCompetence;
