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
import {styles, Router, Competence, Activity, Icon} from 'reflect/imports';

class ActivityView extends Component{

  constructor(){
    super();
    this.competence = new Activity();
    var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      currentAssessment:'progress',
      currentTab: 'subcompetences',
      assessment:{
        progress:5,
        time:5,
        interest:2
      },
      comments: ds.cloneWithRows([
        {id:1, percent:75, type:'comment', comment:'Activity 1'},
        {id:2, percent:15, type:'comment', comment:'Activity 2'},
        {id:3, percent:20, type:'comment', comment:'Activity 3'},
        {id:4, percent:20, type:'comment', comment:'Activity 4'},
        {id:5, percent:20, type:'comment', comment:'Activity 5'},
      ]),
    };
    this.state.sliderValue = this.state.assessment[this.state.currentAssessment];
    this.render = this.render.bind(this);
  }

  rowPressed(rowData) {
    if(rowData.type == 'competence'){
      Router.route({
        title: 'Lernziel',
        id: 'goal',
        component: ActivityView,
        passProps: {data: rowData}
      }, this.props.navigator);
    } else if(rowData.type == 'activity'){
      Router.route({
        title: 'Aktivität',
        id: 'activity',
        component: ActivityView,
        passProps: {data: rowData}
      }, this.props.navigator);
    }
  }

  renderRow(rowData){
    if(rowData.type == 'competence'){
    return <ListEntryActivity
      underlayColor={styles.list.liHover}
      onPress={() => this.rowPressed(rowData)}
      rowData={rowData}
      style={styles.list.li} />
  } else if(rowData.type == 'activity'){
    return <TouchableHighlight underlayColor={styles.list.liHover} onPress={() => this.rowPressed(rowData)} style={styles.list.li}>
      <View>
        <View style={styles.list.rowContainer}>
          <View style={styles.list.textContainer}>
            <Text style={styles.list.text}>
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

  _renderAssessment(){
    let btns = [
      {key:'progress', name: 'Fortschritt', value:this.state.assessment.progress},
      {key:'time', name: 'Zeit', value: this.state.assessment.time},
      {key:'interest', name: 'Interesse', value: this.state.assessment.interest},
    ];
    return btns.map(function(btn){
      var style = [styles._.button];
      var scale = this.competence.scales[btn.key];
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

  _renderTabs(){
    var competence = this.props.data;
    var subCompName = competence.isGoal ? 'Teilziele' : 'Teilkompetenzen';
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
        let {tabActive, tabActiveText} = styles._;
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
    if(this.state.currentTab != 'users'){
      button = <TouchableHighlight
        key='button'
        onPress={() => Router.route({
          id: this.state.currentTab == 'subcompetences' ? (this.props.type == 'goals' ? 'goal.add' : 'competence.add') : 'activity.add',
          component: this.state.currentTab == 'subcompetences' ? ActivityCreate : ActivityView,
          passProps:{
            superActivity: this.props.data.competence
          }
        })}
        style={styles._.button}>
        <Text style={styles._.buttonText}><Icon name="md-add" size={20} color='#FFF' /> {"Hinzufügen"}</Text>
      </TouchableHighlight>}

    var list = <ListView
      key='list'
      style={styles._.list}
      dataSource={content}
      renderRow={(rowData) => this.renderRow(rowData)}>
    </ListView>
  return [list, button];
  }

  render(){
    var competence = this.props.data;
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
        maximumValue={this.competence.scales[this.state.currentAssessment].values.length - 1}
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


module.exports = ActivityView;
