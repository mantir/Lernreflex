import React, {
  Component
} from 'react';
import {
  TouchableHighlight,
  ListView,
  Text,
  View,
  NavigatorIOS,
} from 'react-native';
import styles from '../styles';

class CourseView extends Component{
  constructor(){
    super();
  }

  render(){
    var course = this.props.data;
    return <View>
      <Text>{course.name}</Text>
    </View>
  }
}

module.exports = CourseView;
