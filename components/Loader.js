'use strict';

import React, {
  Component
} from 'react';
import {
  StyleSheet,
  Platform,
  ActivityIndicator
} from 'react-native';

/**
 * A loading indicator.
 * @extends React.Component
 * @constructor
 */

class Loader extends Component{
  constructor(){
    super();
  }

  /**
  * Render the loader. color and top can be passed as props.
  */
  render(){
    var color = this.props.color ? this.props.color : '#111';
    var top = this.props.top ? this.props.top : 40;
    return <ActivityIndicator size="large" style={this.styler(top).s} color={color} />;
  }

  /**
  * Generate a style for the loader
  * @param top {int} top margin for the loader
  */
  styler(top){
      return StyleSheet.create({
        s:{
          marginTop:top
        }
      });
  }
}

module.exports = Loader;
