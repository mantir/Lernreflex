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
import {styles, Router, Competence} from 'reflect/imports';
import ListEntryCompetence from 'reflect/components/ListEntryCompetence';

class CompetenceView extends Component{

  constructor(){
    super();
    this.competence = new Competence();
    var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      currentTab:'progress',
      assessment:{
        progress:5,
        time:5,
        interest:2
      },
      comps: ds.cloneWithRows([
        {id:1, percent:75, type:'competence', competence:'Competence 1'},
        {id:2, percent:15, type:'competence', competence:'Competence 2'},
        {id:3, percent:20, type:'competence', competence:'Competence 3'},
        {id:4, percent:20, type:'competence', competence:'Competence 4'},
        {id:5, percent:20, type:'competence', competence:'Competence 5'},
      ]),
      acts: ds.cloneWithRows([
        {id:1, percent:75, type:'activity', title:'Activity 1'},
        {id:2, percent:15, type:'activity', title:'Activity 2'},
        {id:3, percent:20, type:'activity', title:'Activity 3'},
        {id:4, percent:20, type:'activity', title:'Activity 4'},
        {id:5, percent:20, type:'activity', title:'Activity 5'},
      ]),
    };
    this.state.sliderValue = this.state.assessment[this.state.currentTab];
    this.render = this.render.bind(this);
  }

  rowPressed(rowData) {
    if(rowData.type == 'competence'){
      Router.route({
        title: 'Lernziel',
        id: 'goal',
        component: CompetenceView,
        passProps: {data: rowData}
      }, this.props.navigator);
    } else if(rowData.type == 'activity'){
      Router.route({
        title: 'Aktivität',
        id: 'activity',
        component: CompetenceView,
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
      if(btn.key === this.state.currentTab)
        style.push(styles._.buttonActive);
      return <View key={btn.key} style={styles._.col}>
        <Text style={styles._.center}>{scale.values[btn.value]+scale.unit}</Text>
        <TouchableHighlight
          onPress={() => this.setState({currentTab:btn.key, sliderValue: this.state.assessment[btn.key]})}
          style={style}>
          <Text style={styles._.buttonText}>{btn.name}</Text>
        </TouchableHighlight>
      </View>
    }.bind(this))
  }

  render(){
    var competence = this.props.data;
    var subCompName = competence.isGoal ? 'Teilziele' : 'Teilkompetenzen';
    return <ScrollView style={styles.wrapper}>
      <Text style={styles.comp.title}>{competence.competence}</Text>
      <Text style={styles.comp.sectionHead}>Selbsteinschätzung</Text>
      <View style={styles._.row}>
        {this._renderAssessment()}
      </View>
      <Slider
        ref="slider"
        maximumValue={this.competence.scales[this.state.currentTab].values.length - 1}
        minimumValue={0}
        onValueChange={(value) => {
          this.state.assessment[this.state.currentTab] = value;
          this.setState({value: value});
        }}
        value={this.state.sliderValue}
        step={1}
        style={styles.comp.slider} />
      <Text style={styles.comp.sectionHead}>{subCompName}</Text>
      <ListView
        style={styles._.list}
        dataSource={this.state.comps}
        renderRow={(rowData) => this.renderRow(rowData)}>
      </ListView>
      <Text style={styles.comp.sectionHead}>Aktivitäten</Text>
      <ListView
        style={styles._.list}
        dataSource={this.state.acts}
        renderRow={(rowData) => this.renderRow(rowData)}>
      </ListView>

    </ScrollView>
  }
}

module.exports = CompetenceView;
