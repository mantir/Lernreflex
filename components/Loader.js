'use strict';

import React, {
  Component
} from 'react';
import {
  StyleSheet,
  Platform,
  ActivityIndicatorIOS,
  ProgressBarAndroid
} from 'react-native';


class Loader extends Component{
  constructor(){
    super();
  }
  render(){
    var color = this.props.color ? this.props.color : '#FFF';
    if(Platform.OS == 'ios'){
      return <ActivityIndicatorIOS size="large" color={color} />;
    } else {
      return <ProgressBarAndroid styleAttr="Large" color={color} />;
    }
  }
}

module.exports = Loader;
