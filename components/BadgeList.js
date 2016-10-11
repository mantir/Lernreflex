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
//import BadgeView from 'Lernreflex/components/BadgeView';
import Badge from 'Lernreflex/models/Badge';
import styles from 'Lernreflex/styles';
import Router from 'Lernreflex/Router';


class BadgeList extends Component{

  constructor(){
    super();
    this.unmounting = true;
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

  componentWillUnmount(){
    this.unmounting = true;
  }

  componentDidMount(){
    this.unmounting = false;
    var _this = this;
    var badge = new Badge();
    //alert(this.props.type);
    //badge.getAllKeys().done((keys) => console.log(keys));
    //badge.removeLocal('goals');
    var type = this.props.type;
    badge.getUserBadges().then((badges) => {
      _this.setState({
        dataSource: _this.state.dataSource.cloneWithRows(badges),
        loaded: true
      });
    });
    /*badge.getBadges().done((badges) => {
      if(badges.length && !_this.unmounting){
        _this.setState({
          dataSource: _this.state.dataSource.cloneWithRows(badges),
          loaded: true
        });
      }
    });*/
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
    rowData.done = true;
    return <TouchableHighlight underlayColor={styles.list.liHover} onPress={() => this.rowPressed(rowData)} style={styles.list.li}>
      <View>
        <View style={styles.list.rowContainer}>
          <Image
            style={{height:50, width:50}}
            resizeMode='contain'
            source={{uri:rowData.png}}
          />
          <View style={styles.list.textContainer}>
            <Text style={styles.list.text}>
              {rowData.name}
            </Text>
            <Text style={styles.list.right}>
              {rowData.done ? <Image
                style={styles._.icon}
                resizeMode='cover'
                source={require('Lernreflex/img/sign-check-icon.png')}
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
