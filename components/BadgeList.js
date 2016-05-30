'use strict'
import React, {Component} from 'react';
import {
  TouchableHighlight,
  ListView,
  Platform,
  Text,
  View,
  NavigatorIOS,
  ToolbarAndroid,
  Image
} from 'react-native';
//import BadgeView from 'reflect/components/BadgeView';
import Badge from 'reflect/models/Badge';
import styles from 'reflect/styles';
import Router from 'reflect/Router';


class BadgeList extends Component{

  constructor(){
    super();
    var ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2,
      sectionHeaderHasChanged : (s1, s2) => s1 !== s2
    });
    this.state = {
      dataSource: ds,
      loaded: false
    };
    this.renderRow = this.renderRow.bind(this);
  }

  componentDidMount(){
    this.componentDidUpdate();
  }

  componentDidUpdate(){
    var _this = this;
    var badge = new Badge();
    //alert(this.props.type);
    //badge.getAllKeys().done((keys) => console.log(keys));
    //badge.removeLocal('goals');
    var type = this.props.type;
    badge.getBadges().done((badges) => {
      if(badges.length){
        _this.setState({
          dataSource: _this.state.dataSource.cloneWithRows(badges),
          loaded: true
        });
      }
    });
  }

  rowPressed(rowData) {
    //console.warn(styles.route);
    /*if(rowData.type == 'badge'){
      Router.route({
        title: 'Badge',
        id: 'goal',
        component: BadgeView,
        passProps: {data: rowData}
      }, this.props.navigator);
    } */
  }



  renderSectionHeader(sectionData, sectionID){
    return null;
  }

  renderRow(rowData){
    return <TouchableHighlight underlayColor={styles.list.liHeadHover} onPress={() => this.rowPressed(rowData)} style={styles.list.liHead}>
      <View>
        <View style={styles.list.rowContainer}>
          <View style={styles.list.textContainer}>
            <Text style={styles.list.headText}>
              {rowData.title}
            </Text>
            <Text style={styles.list.right}>
              {rowData.done ? <Image
                style={styles._.icon}
                resizeMode='cover'
                source={require('reflect/img/sign-check-icon.png')}
              /> : ''}
            </Text>
          </View>
        </View>
        <View style={styles.list.separator} />
      </View>
    </TouchableHighlight>
  }

  render(){
    return <View style={styles.wrapper}>
      <ListView
        style={styles._.list}
        dataSource={this.state.dataSource}
        renderSectionHeader={this.renderSectionHeader}
        renderRow={this.renderRow}>
      </ListView>
    </View>
  }
}

module.exports = BadgeList;
