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

  render(){
    return <TouchableHighlight
      underlayColor={this.props.underlayColor}
      onPress={this.props.onPress}
      style={this.props.style}>
      <View>
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
    </TouchableHighlight>
  }
}

module.exports = ListEntryCompetence;
