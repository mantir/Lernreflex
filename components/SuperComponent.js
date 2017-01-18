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

/**
 * Represents a generic Component class that holds functions needed in several other classes.
 * @extends React.Component
 * @constructor
 * @param props {object} The properties of the component
 */

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

  /**
  * Check if a new line button was pressed on the keyboard in a text input.
  * @param text {string} The current text in the input to check for new lines.
  * @param ref {string} ref name of the current input
  * @param nextRef {string} ref name of the next input in order.
  * @return {bool}
  */
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
