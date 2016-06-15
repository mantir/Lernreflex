import React, {
  Component,
} from 'react';
import {
  TouchableHighlight,
  ListView,
  ScrollView,
  Text,
  View,
  NavigatorIOS,
  Platform,
  Slider
} from 'react-native';
import {styles, Router, Competence, CompetenceCreate, Icon, ListEntryCompetence} from 'reflect/imports';
import ActivityView from 'reflect/components/ActivityView';

class CompetenceView extends Component{

  constructor(){
    super();
    this.Competence = new Competence();
    var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      currentAssessment:'progress',
      currentTab: 'subcompetences',
      //currentTab: 'activities',
      assessment:{
        progress:5,
        time:5,
        interest:2
      },
      subcompetences: ds.cloneWithRows([
      ]),
      activities: ds.cloneWithRows([
        {id:1, percent:75, type:'activity', title:'Backpropagation in Python implementieren mit dem SciKit'},
        /*{id:2, percent:15, type:'activity', title:'Activity 2'},
        {id:3, percent:20, type:'activity', title:'Activity 3'},
        {id:4, percent:20, type:'activity', title:'Activity 4'},
        {id:5, percent:20, type:'activity', title:'Activity 5'},*/
      ]),
      users: ds.cloneWithRows([
        {id:1, percent:75, type:'user', name:'User 1'},
        {id:2, percent:15, type:'user', name:'User 2'},
        {id:3, percent:20, type:'user', name:'User 3'},
        {id:4, percent:20, type:'user', name:'User 4'},
        {id:5, percent:20, type:'user', name:'User 5'},
      ]),
    };
    this.state.sliderValue = this.state.assessment[this.state.currentAssessment];
    this.render = this.render.bind(this);
  }

  componentDidMount(){
    this.loadData();
  }

  loadData(){
    var _this = this;
    this.Competence.getSubCompetences(this.props.competence)
      .then((d) => {
        d = _this.Competence.toView(d, _this.props.type);
        _this.setState({
          subcompetences: _this.state.subcompetences.cloneWithRows(d),
          loaded: true
        });
      });
  }

  rowPressed(rowData) {
    if(rowData.type == 'competence'){
      Router.route({
        title: 'Lernziel',
        id: this.props.type == 'goals' ? 'goal' : 'competence',
        component: CompetenceView,
        passProps: rowData
      }, this.props.navigator);
    } else if(rowData.type == 'activity'){
      Router.route({
        title: 'Aktivität',
        id: 'activity',
        component: ActivityView,
        passProps: rowData
      }, this.props.navigator);
    }
  }

  renderRow(rowData){
    return <ListEntryCompetence
      type={rowData.type}
      underlayColor={styles.list.liHover}
      onPress={() => this.rowPressed(rowData)}
      rowData={rowData}
      style={styles.list.li} />
  }

  _renderAssessment(){
    let btns = [
      {key:'progress', name: 'Fortschritt', value:this.state.assessment.progress},
      {key:'time', name: 'Zeit', value: this.state.assessment.time},
      {key:'interest', name: 'Interesse', value: this.state.assessment.interest},
    ];
    return btns.map(function(btn){
      var style = [styles._.button];
      var scale = this.Competence.scales[btn.key];
      if(btn.key === this.state.currentAssessment)
        style.push(styles._.buttonActive);
      return <View key={btn.key} style={styles._.col}>
        <Text style={styles._.center}>{scale.values[btn.value]+scale.unit}</Text>
        <TouchableHighlight
          onPress={() => this.setState({currentAssessment:btn.key, sliderValue: this.state.assessment[btn.key]})}
          style={style}>
          <Text style={styles._.buttonText}>{btn.name}</Text>
        </TouchableHighlight>
      </View>
    }.bind(this))
  }

  subCompName(singular){
    if(singular)
      return this.props.isGoal ? 'Teilziel' : 'Teilkompetenz';
    return this.props.isGoal ? 'Teilziele' : 'Teilkompetenzen';
  }

  _renderTabs(){
    var subCompName = this.subCompName();
    let btns = [
      {key:'subcompetences', name: subCompName, value:''},
      {key:'activities', name: 'Aktivitäten', value: ''},
      {key:'users', name: 'Mitlerner', value: ''},
    ];
    let _this = this;
    return btns.map(function(btn){
      var style = [styles._.tab];
      var style2 = [styles._.buttonText];
      if(btn.key === _this.state.currentTab){
        style.push(styles._.tabActive);
        style2.push(styles._.tabActiveText);
      }
      return <TouchableHighlight
          key={btn.key}
          onPress={() => _this.setState({currentTab: btn.key})}
          style={style}>
          <Text style={style2}>{btn.name}</Text>
        </TouchableHighlight>
    })
  }

  _renderTabContent(){
    var content = this.state[this.state.currentTab];
    var button = null;
    var route = {
      id: this.state.currentTab == 'subcompetences' ? (this.props.isGoal ? 'goal.add' : 'competence.add') : 'activity.add',
      component: this.state.currentTab == 'subcompetences' ? CompetenceCreate : ActivityView,
      passProps:{
        afterCreation: (c) => this.loadData(),
        superCompetence: this.props.competence,
        type:this.props.type
      }
    }
    console.log(route);
    if(this.state.currentTab != 'users'){
      button = <TouchableHighlight
        key='button'
        onPress={() => Router.route(route, this.props.navigator)}
        style={styles._.button}>
        <Text style={styles._.buttonText}>
          <Icon name="ios-add-circle" size={14} color='#FFF' />
          {' '+(this.state.currentTab == 'subcompetences' ? this.subCompName(true) : 'Aktivität')+' hinzufügen'}
        </Text>
      </TouchableHighlight>}

    var list = <ListView
      key='list'
      enableEmptySections={true}
      style={styles._.list}
      dataSource={content}
      renderRow={(rowData) => this.renderRow(rowData)}>
    </ListView>
  return [list, button];
  }


  render(){
    var competence = this.props;
    var subCompName = competence.isGoal ? 'Teilziele' : 'Teilkompetenzen';
    return <ScrollView style={styles.wrapper}>
      <Text style={styles.comp.title}>{competence.competence}</Text>
      <View style={styles._.otherBG}>
      <Text style={styles.comp.sectionHead}>Selbsteinschätzung</Text>
      <View style={styles._.row}>
        {this._renderAssessment()}
      </View>
      <Slider
        ref="slider"
        maximumValue={this.Competence.scales[this.state.currentAssessment].values.length - 1}
        minimumValue={0}
        onValueChange={(value) => {
          this.state.assessment[this.state.currentAssessment] = value;
          this.setState({value: value});
        }}
        value={this.state.sliderValue}
        step={1}
        style={styles.comp.slider} />
    </View>
        <View style={styles._.tabContainer}>
          {this._renderTabs()}
        </View>
        {this._renderTabContent()}
    </ScrollView>
  }
}
/*
<TouchableHighlight
  onPress={() => Router.route({
    id: this.props.type == 'goals' ? 'goal.add' : 'competence.add',
    component: CompetenceCreate,
    passProps:{
      superCompetence: this.props.competence
    }
  }, this.props.navigator)}
  style={styles.comp.addBtn}>
  <Text style={styles._.buttonText}><Icon name="md-add" size={30} color={styles._.primary} /></Text>
</TouchableHighlight>*/

module.exports = CompetenceView;
