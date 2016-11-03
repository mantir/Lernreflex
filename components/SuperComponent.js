'use strict';

import React, {
  Component,
} from 'react';
import {
  AppRegistry,
  StyleSheet,
  Platform,
  ListView,
  TouchableHighlight,
  StatusBar,
  Text,
  View,
  TouchableOpacity,
  Navigator,
  ScrollView,
  ToolbarAndroid,
  BackAndroid
} from 'react-native';

import {styles} from 'Lernreflex/imports';

class SuperComponent extends Component{
  constructor(props){
    super(props);
    this.unmounting = false;
  }

  componentWillUnmount(){
    this.unmounting = true;
  }

  setState(obj){
    if(!this.unmounting) {
      super.setState(obj);
    }
  }



  enterButtonPressed(text, ref, nextRef){
    let match = /\r|\n/.exec(text);
    if (match) {
      //if(this.refs[ref]) this.refs[ref].blur();
      //console.log(nextRef);
      if(this.refs[nextRef]) this.refs[nextRef].focus();
    }
    return match;
  }

}

module.exports = SuperComponent;
