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
import {Router, styles, Competence, CompetenceCreate, Loader} from 'reflect/imports';


class CompetenceList extends Component{


  constructor(){
    super();
    this.unmounting = true;
    this.Competence = new Competence();
    var ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2,
      sectionHeaderHasChanged : (s1, s2) => s1 !== s2,
      getSectionData: this.getSectionData,
      getRowData: this.getRowData,
    });
    this.state = {
      dataSource: ds.cloneWithRows([{id:'loading'}]), //Set one element for loading
      loading: true,
    };
    this.renderRow = this.renderRow.bind(this);
    this.renderSectionHeader = this.renderSectionHeader.bind(this);
    this.loadData = this.loadData.bind(this);
    this.afterCompetenceCreate = this.afterCompetenceCreate.bind(this);
    this.setState = this.setState.bind(this);
  }

  emptyList(state){
    if(!state)
      state = {};
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows([]),
      loading: false,
      ...state
    });
  }

  componentDidMount(){
    this.unmounting = false;
    this.loadData();
  }

  afterCompetenceCreate(){
    this.loadData();
  }

  componentWillReceiveProps(){

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
  competencesToView(comps, notAsTree){
    var viewCompetence = {
      competence:'',
      percent: ''
    }
    var sectionIDs = [];
    var rowIDs = [];
    var dataBlob = {};

    var _this = this;
    //if(!this.once) alert(JSON.stringify(comps));
    if(!notAsTree) { //Results came as tree, use always this
      Object.keys(comps).map((k) => {
        if(!dataBlob[k]){
          sectionIDs.push(k);
          dataBlob[k] = {title:k, index:rowIDs.length, type:'course'};
          console.log(comps[k]);
          rowIDs[dataBlob[k].index] = comps[k].map((c) => c.name);
        }
        comps[k].map((comp) => {
          dataBlob[k + ':' + comp.name] = _this.Competence.toView(comp, _this.props.type);
        });
      });
    } /*else { //Not as Tree
      Object.keys(comps).map((k) => {
        if(!dataBlob[k]){
          sectionIDs.push(k);
          dataBlob[k] = {title:k, index:rowIDs.length, type:'course'};
          rowIDs[dataBlob[k].index] = comps[k];
        }
        comps[k].map((comp) => {
          dataBlob[k + ':' + comp] = {
            competence:comp,
            percent:10,
            type:'competence',
            isGoal:this.props.type == 'goals'
          }
        });
      });
    }*/
    this.once = true;
    console.log(dataBlob, sectionIDs, rowIDs);
    return {dataBlob, sectionIDs, rowIDs};
  }

  loadData(){
    var competence = this.Competence;
    //alert(this.props.type);
    //competence.getAllKeys().done((keys) => console.log(keys));
    //competence.removeLocal('goals');
    this.emptyList({loading:true});
    var _this = this;
    var type = this.props.type;
    var fun;
    if(type === 'goals') {
      fun = competence.getGoals.bind(competence);
    } else {
      fun = competence.getCompetences.bind(competence);
    }
    fun().done((competences) => {
      //console.log(competences);
      if(Object.keys(competences).length){
        let {dataBlob, sectionIDs, rowIDs} = _this.competencesToView(competences);
        _this.setState({
          dataSource: _this.state.dataSource.cloneWithRowsAndSections(dataBlob, sectionIDs, rowIDs),
         loading:false
        });
      } else {
        _this.emptyList();
      }
    }, () => _this.emptyList());
  }

  rowPressed(rowData) {
    //console.warn(styles.route);
    if(rowData.type == 'competence'){
      Router.route({
        title: 'Lernziel',
        id: this.props.type == 'goals' ? 'goal' : 'competence',
        component: CompetenceView,
        passProps: rowData
      }, this.props.navigator);
    } else if(rowData.type == 'course'){
      Router.route({
        title: 'Gruppe',
        id: 'group',
        component: CourseView,
        passProps: rowData
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
              {rowData.percent}
            </Text>
          </View>
        </View>
        <View style={styles.list.separator} />
      </View>
    </TouchableHighlight>
  }

  renderRow(rowData){
    if(this.state.loading) {
      return <Loader color={styles._.primary} />
    }
      return <ListEntryCompetence
        type='competence'
        underlayColor={styles.list.liHover}
        onPress={() => this.rowPressed(rowData)}
        rowData={rowData}
        style={styles.list.li} />
  }

  render(){
    return <View style={[styles.wrapper, styles._.list]}>
      <ListView
        style={[styles._.list]}
        dataSource={this.state.dataSource}
        enableEmptySections={true}
        renderRow={this.renderRow}
        renderSectionHeader={this.renderSectionHeader}>
      </ListView>
    </View>
  }

/*  testRoute(){
    //alert(1);
    var navigator = this.props.navigator;
    setTimeout(() => {
      //navigator.push()
      Router.route({
        title:'test',
        id:'goals',
        component:CompetenceCreate,
      }, navigator);
    }, 1000);
  }

  _renderTestButton(){
    return <TouchableHighlight underlayColor={styles.list.liHover} onPress={() => this.testRoute()} style={{position:'absolute', top:200}}>
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
  }*/
}

module.exports = CompetenceList;
