'use strict';

import React, {
  Component
} from 'react';
import {
  StyleSheet,
  Platform,
  ActivityIndicator
} from 'react-native';


class Loader extends Component{
  constructor(){
    super();
  }
  render(){
    var color = this.props.color ? this.props.color : '#111';
    var top = this.props.top ? this.props.top : 40;
    return <ActivityIndicator size="large" style={this.styler(top).s} color={color} />;
  }

  styler(top){
      return StyleSheet.create({
        s:{
          marginTop:top
        }
      });
  }
}

module.exports = Loader;
