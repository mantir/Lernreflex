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
  ScrollView,
  ToolbarAndroid,
  RefreshControl
} from 'react-native';
import CompetenceView from 'Lernreflex/components/CompetenceView';
import CourseView from 'Lernreflex/components/CourseView';
import ListEntryCompetence from 'Lernreflex/components/ListEntryCompetence';
import {Router, styles, Competence, Loader, CompetenceCreate, UserList, Icon} from 'Lernreflex/imports';


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
      dataSource: ds,
      loaded: false,
      refreshing: false,
      iconsLoaded:0
    };
    this.renderRow = this.renderRow.bind(this);
    this.renderSectionHeader = this.renderSectionHeader.bind(this);
    this.loadData = this.loadData.bind(this);
    this.afterCompetenceCreate = this.afterCompetenceCreate.bind(this);
  }

  componentWillMount() {
    let icons = [
      [Router.icons.community]
    ];
    Icon.getImageSource(Router.icons.community, 30)
      .then((source) => this.setState({ communityIcon: source, iconsLoaded: this.state.iconsLoaded+1 }));
  }

  componentDidMount(){
    this.unmounting = false;
    this.setState({dataSource:this.state.dataSource.cloneWithRowsAndSections({'loader:loader': 'loader'}, ['loader'], [['loader']])});
    this.loadData();
  }

  afterCompetenceCreate(){
    this.loadData(false);
  }

  componentWillReceiveProps(){
    console.log('CompetenceList componentWillReceiveProps');
  }

  updateChanges(){
    let comp = new Competence();
    let competences = this.state.competences;
    let _this = this;
    let promises = [];
    let counter = 0;
    comp.mayApplyLocalChanges(competences, '{}.{}.name', '-', comp.toView.bind(comp)).then((comps) => {
      if(comps){
        this.loadData(false);
      } else return;
      _this.setState({competences:comps, dataSource: _this.getDatasource(comps)});
    });

    /*if(promises.length) {
      Promise.all(promises).then(() => {
        //console.log('AFTER', competences);

      }).then(() => counter > 0 ? this.loadData(false) : null);
    }
    */
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
    Object.keys(comps).map((k) => {
      if(!comps[k]) return;
      if(!dataBlob[k]){
        sectionIDs.push(k);
        dataBlob[k] = {title:k, index:rowIDs.length, type:comps[k][0].inCourse ? 'course' : 'learningTemplate'};
        console.log(comps[k]);
        rowIDs[dataBlob[k].index] = comps[k].map((c) => c.name);
      }

      comps[k].map((comp) => {
        dataBlob[k + ':' + comp.name] = comp;
      });
    });
    console.log(dataBlob, sectionIDs, rowIDs);
    return {dataBlob, sectionIDs, rowIDs};
  }

  getDatasource(competences){
    let {dataBlob, sectionIDs, rowIDs} = this.competencesToView(competences);
    return this.state.dataSource.cloneWithRowsAndSections(dataBlob, sectionIDs, rowIDs);
  }

  emptyList(){
    this.setState({dataSource:this.state.dataSource.cloneWithRowsAndSections({'empty:empty':
      {id:'empty', text:'Du hast noch keine '+(this.props.type == 'goals' ? 'Lernziele.' : 'Erreichten Lernziele.') + '\n' + 'Lege mit dem + oben eins an.'}}, ['empty'], [['empty']])
    });
  }

  loadData(caching = true){
    var _this = this;
    var competence = new Competence(caching);
    console.log('loading');
    //alert(this.props.type);
    //competence.getAllKeys().done((keys) => console.log(keys));
    //competence.removeLocal('goals');
    this.setState({refreshing:true});
    var type = this.props.type;
    if(type === 'goals') {
      competence.getGoals().done((goals) => {
        console.log(goals);
        if(Object.keys(goals).length){
          _this.setState({
            dataSource: _this.getDatasource(goals),
            loaded: true,
            refreshing: false,
            competences: goals
          });
        } else this.emptyList();
      });
    } else {
      competence.getCompetences().done((competences) => {
        console.log(competences);
        if(Object.keys(competences).length){
          _this.setState({
            dataSource: _this.getDatasource(competences),
            loaded: true,
            refreshing: false,
            competences: competences
          });
        } else this.emptyList();
      });
    }
  }

  rowPressed(rowData) {
    if(rowData.type == 'competence'){
      rowData.updateChanges = this.updateChanges.bind(this);
      rowData.communityIcon = this.state.communityIcon;
      let route = {
        title: 'Lernziel',
        id: this.props.type == 'goals' ? 'goal' : 'competence',
        rightButtonIcon: this.state.communityIcon,
        onRightButtonPress: () => Router.route({
          id:'users',
          component: UserList,
          passProps: {
            communityIcon: this.state.communityIcon,
            previousRoute: {...route},
            backTo:'competence',
            competenceData: rowData.competenceData
          }
        }, this.props.navigator),
        component: CompetenceView,
        passProps: {...rowData}
      };
      if(!rowData.courseId) { //Nur Community Icon anzeigen, wenn Kompetenz in Kurs
        delete route.rightButtonIcon;
        delete route.onRightButtonPress;
      }
      Router.route(route, this.props.navigator);
    } else if(rowData.type == 'course'){
      /*Router.route({
        title: 'Gruppe',
        id: 'group',
        component: CourseView,
        passProps: rowData
      }, this.props.navigator);*/
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
    if(id == 'loader') return null;
    if(id == 'empty') return null;
    let cstyle = rowData.type == 'course' ? styles.list.liHead2 : styles.list.liHead;
    return <TouchableHighlight underlayColor={styles.list.liHeadHover} onPress={() => this.rowPressed(rowData)} style={cstyle}>
      <View>
        <View style={styles.list.rowContainer}>
          <View style={styles.list.textContainer}>
            <Text style={styles.list.headText}>
              {rowData.title + (rowData.type == 'course' ? ' (Kurs)' : '')}
            </Text>
            <Text style={styles.list.right}>
              {/*rowData.percent+'%'*/}
            </Text>
          </View>
        </View>
        <View style={styles.list.separator} />
      </View>
    </TouchableHighlight>
  }

  renderRow(rowData){
    console.log(rowData);
      return <ListEntryCompetence
        type='competence'
        underlayColor={styles.list.liHover}
        onPress={() => this.rowPressed(rowData)}
        rowData={rowData}
        style={styles.list.li} />
  }

  _onRefresh() {
    this.loadData(false);
  }

  render(){
    /*if(!this.state.loaded) {
      return <ScrollView style={styles.wrapper}>
        <Loader />
      </ScrollView>
    }*/
    return <View style={styles.wrapper}>
      <ListView
        refreshControl={ <RefreshControl refreshing={this.state.refreshing} onRefresh={this._onRefresh.bind(this)} /> }
        style={styles._.list}
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
