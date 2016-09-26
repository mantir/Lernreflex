'use strict';

import React, {
  Component
} from 'react';
import {
  StyleSheet,
  Platform,
  ActivityIndicator,
  ProgressBarAndroid
} from 'react-native';


class Loader extends Component{
  constructor(){
    super();
  }
  render(){
    var color = this.props.color ? this.props.color : '#111';
    var top = this.props.top ? this.props.top : 40;
    if(Platform.OS == 'ios'){
      return <ActivityIndicator size="large" style={this.styler(top).s} color={color} />;
    } else {
      return <ProgressBarAndroid styleAttr="Large" style={this.styler(top).s} color={color} />;
    }
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
