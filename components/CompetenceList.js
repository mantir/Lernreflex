'use strict'
import React, {
  Component,
} from 'react';
import {
  TouchableHighlight,
  ListView,
  Platform,
  Text,
  View,
  NavigatorIOS,
  ToolbarAndroid
} from 'react-native';
import CompetenceView from 'reflect/components/CompetenceView';
import CourseView from 'reflect/components/CourseView';
import ListEntryCompetence from 'reflect/components/ListEntryCompetence';
import {Router, styles, Competence} from 'reflect/imports';


class CompetenceList extends Component{

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

  componentWillUnmount(){
    this.unmounting = true;
  }

  componentDidUpdate(){
    var _this = this;
    var competence = new Competence();
    //alert(this.props.type);
    //competence.getAllKeys().done((keys) => console.log(keys));
    //competence.removeLocal('goals');
    var type = this.props.type;
    if(type === 'goals') {
      competence.getGoals().done((goals) => {
        if(goals.length && !_this.unmounting){
          _this.setState({
            dataSource: _this.state.dataSource.cloneWithRows(goals),
            loaded: true
          });
        }
      });
    } else {
      competence.getCompetences().done((competences) => {
        if(competences.length && !_this.unmounting){
          _this.setState({
            dataSource: _this.state.dataSource.cloneWithRows(competences),
            loaded: true
          });
        }
      });
    }
  }

  rowPressed(rowData) {
    //console.warn(styles.route);
    if(rowData.type == 'competence'){
      Router.route({
        title: 'Lernziel',
        id: this.props.type == 'goals' ? 'goal' : 'competence',
        component: CompetenceView,
        passProps: {data: rowData}
      }, this.props.navigator);
    } else if(rowData.type == 'course'){
      Router.route({
        title: 'Gruppe',
        id: 'group',
        component: CourseView,
        passProps: {data: rowData}
      }, this.props.navigator);
    }
  }

  renderRow(rowData){
    if(rowData.type == 'competence'){
      return <ListEntryCompetence
        underlayColor={styles.list.liHover}
        onPress={() => this.rowPressed(rowData)}
        rowData={rowData}
        style={styles.list.li} />
    } else if(rowData.type == 'course'){
      return <TouchableHighlight underlayColor={styles.list.liHeadHover} onPress={() => this.rowPressed(rowData)} style={styles.list.liHead}>
        <View>
          <View style={styles.list.rowContainer}>
            <View style={styles.list.textContainer}>
              <Text style={styles.list.headText}>
                {rowData.title}
              </Text>
              <Text style={styles.list.right}>
                {rowData.percent}%
              </Text>
            </View>
          </View>
          <View style={styles.list.separator} />
        </View>
      </TouchableHighlight>
    }
  }

  render(){
    return <View style={styles.wrapper}>
      <ListView
        style={styles._.list}
        dataSource={this.state.dataSource}
        renderRow={this.renderRow}>
      </ListView>
    </View>
  }
}

module.exports = CompetenceList;
