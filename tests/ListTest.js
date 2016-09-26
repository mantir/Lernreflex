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
import CompetenceView from 'Lernreflex/components/CompetenceView';
import CourseView from 'Lernreflex/components/CourseView';
import ListEntryCompetence from 'Lernreflex/components/ListEntryCompetence';
import {Router, styles, Competence} from 'Lernreflex/imports';


class ListTest extends Component{

  constructor(){
    super();
    this.unmounting = true;
    var ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2,
      sectionHeaderHasChanged : (s1, s2) => s1 !== s2,
      getSectionData: this.getSectionData,
      getRowData: this.getRowData,
    });
    this.state = {
      dataSource: ds,
      loaded: false
    };
    this.renderRow = this.renderRow.bind(this);
    this.renderSectionHeader = this.renderSectionHeader.bind(this);
  }

  componentDidMount(){
    this.unmounting = false;
    this.componentDidUpdate();
  }

  componentWillUnmount(){
    this.unmounting = true;
  }

  setState(input){
    if(!this.unmounting){
      super.setState(input);
    }
  }

  /*
  * Converts the returned data into displayable data
  */
  competencesToView(comps){
    var viewCompetence = {
      competence:'',
      percent: ''
    }
    var sectionIDs = [];
    var rowIDs = [];
    var dataBlob = {};
    //if(!this.once) alert(JSON.stringify(comps));
    comps.map((c) => {
      if(!dataBlob[c.learningProjectName]){
        rowIDs.push([]);
        sectionIDs.push(c.learningProjectName);
        dataBlob[c.learningProjectName] = {title:c.learningProjectName, index:rowIDs.length - 1, type:'course'};
      }
      rowIDs[dataBlob[c.learningProjectName].index].push(c.forCompetence);
      dataBlob[c.learningProjectName + ':' + c.forCompetence] = {
        competence:c.forCompetence,
        percent:10,
        type:'competence',
        isGoal:this.props.type == 'goals'
      }
    });
    this.once = true;
    //console.log(dataBlob, sectionIDs, rowIDs);
    return {dataBlob, sectionIDs, rowIDs};
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
        if(goals.length){
          let {dataBlob, sectionIDs, rowIDs} = _this.competencesToView(goals);
          _this.setState({
            dataSource: _this.state.dataSource.cloneWithRowsAndSections(dataBlob, sectionIDs, rowIDs),
            loaded: true
          });
        }
      });
    } else {
      competence.getCompetences().done((competences) => {
        if(competences.length){
          let {dataBlob, sectionIDs, rowIDs} = _this.competencesToView(competences);
          _this.setState({
            dataSource: _this.state.dataSource.cloneWithRowsAndSections(dataBlob, sectionIDs, rowIDs),
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
    return true;
  }

  getSectionData(dataBlob, sectionID){
    //console.log(dataBlob[sectionID], sectionID);
      return dataBlob[sectionID];
  }

  getRowData(dataBlob, sectionID, rowID){
    //console.log(dataBlob[sectionID + ':' + rowID], sectionID + ':' + rowID);
      return dataBlob[sectionID + ':' + rowID];
  }

  renderSectionHeader(rowData, id){
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

  renderRow(rowData){
      return <ListEntryCompetence
        type='competence'
        underlayColor={styles.list.liHover}
        onPress={() => this.rowPressed(rowData)}
        rowData={rowData}
        style={styles.list.li} />
  }

  render(){
    return <View style={styles.wrapper}>
      <ListView
        style={styles._.list}
        dataSource={this.state.dataSource}
        enableEmptySections={true}
        renderRow={this.renderRow}
        renderSectionHeader={this.renderSectionHeader}>
      </ListView>
      <TouchableHighlight underlayColor={styles.list.liHover} onPress={() => Router.route({
        title: 'Gruppe',
        id: 'group',
        component: CourseView,
        passProps: {data: {competence:'d'}}
      }, this.props.navigator)} style={styles.list.li}>
        <View>
          <View style={styles.list.rowContainer}>
            <View style={styles.list.textContainer}>
              <Text>
                TestButton
              </Text>
            </View>
          </View>
          <View style={styles.list.separator} />
        </View>
      </TouchableHighlight>
    </View>
  }
}

module.exports = ListTest;
