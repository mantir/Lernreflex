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
import styles from 'reflect/styles';

class ListEntryCompetence extends Component{
  constructor(){
    super();
  }

  _user(rowData){
    return <View>
      <View style={styles.list.rowContainer}>
        <View style={styles.list.textContainer}>
          <Text style={styles.list.text}>
            {rowData.name}
          </Text>
        </View>
      </View>
      <View style={styles.list.separator} />
    </View>
  }

  _comment(rowData){
    return <View>
      <View style={styles.list.rowContainer}>
        <View style={styles.list.textContainer}>
          <Text style={styles.list.text}>
            {rowData.comment}
          </Text>
        </View>
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
    return <View>
      <View style={styles.list.rowContainer}>
        <View style={styles.list.textContainer}>
          <Text style={styles.list.text}>
            {rowData.title}
          </Text>
          <Text style={styles.list.right}>
            {rowData.percent}%
          </Text>
        </View>
      </View>
      <View style={styles.list.separator} />
    </View>
  }

  render(){
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
