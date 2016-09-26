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
import {
  styles,
  Router,
  Loader,
  Competence,
  CompetenceCreate,
  Icon,
  Activity,
  ActivityView,
  User,
  Questions,
  ListEntryCompetence
} from 'Lernreflex/imports';

class CompetenceView extends Component{

  constructor(){
    super();
    this.Competence = new Competence();
    var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      currentAssessment:'progress',
      //currentTab: 'subcompetences',
      questions: [],
      answers: [],
      currentTab: 'activities',
      assessment:{
        progress:5,
        time:5,
        interest:2
      },
      subcompetences: ds.cloneWithRows([
      ]),
      activities: ds.cloneWithRows([
      ]),
      loaded: false
    };
    this.state.sliderValue = this.state.assessment[this.state.currentAssessment];
    this.render = this.render.bind(this);
  }

  componentDidMount(){
    let user = new User();
    let _this = this;
    console.log(this.props);
    if(this.props.currentUser) {
      user.loggedIn().then((u) => {
        if(u.username != _this.props.currentUser.username) {
          console.log(_this.props.currentUser);
          _this.setState({
            user: _this.props.currentUser
          });
        }
      });
    }
    this.loadData();
  }

  loadData(){
    var _this = this;
    let activity = new Activity();
    activity.getActivities(this.props.courseId).then((d) => {
      _this.setState({
        activities: _this.state.activities.cloneWithRows(d),
        loaded: true
      });
    }, (e) => {console.log('ACTIVITY-ERROR', e);});
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
      //{key:'interest', name: 'Interesse', value: this.state.assessment.interest},
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
      //{key:'users', name: 'Mitlerner', value: ''},
    ];
    if(this.props.courseId) {
      btns.push({key:'activities', name: 'Aktivitäten', value: ''});
    }
    btns.push({key:'subcompetences', name: subCompName, value:''});
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
    //console.log(route);
    if(this.state.currentTab == 'subcompetences'){
      button = <TouchableHighlight
        key='button'
        onPress={() => Router.route(route, this.props.navigator)}
        style={styles._.button}>
        <Text style={styles._.buttonText}>
          <Icon name="ios-add-circle" size={14} color='#FFF' />
          {' '+(this.state.currentTab == 'subcompetences' ? this.subCompName(true) : 'Aktivität')+' hinzufügen'}
        </Text>
      </TouchableHighlight>
    }

    var list = <ListView
      key='list'
      enableEmptySections={true}
      style={{flex:1, flexDirection:'column'}}
      dataSource={content}
      renderRow={(rowData) => this.renderRow(rowData)}>
    </ListView>
    if(!this.state.loaded) {
      return <Loader color="#000" />
    }
    return [list, button];
  }

  updateProgress(){
    let slider = this.refs.slider;
    let p = {
      minValue: slider.props.minimumValue,
      maxValue: slider.props.maximumValue,
      value: this.state.sliderValue,
      scale: this.Competence.scales[this.state.currentAssessment].values,
      identify: this.state.currentAssessment,
      competence: this.props.competence
    }
    this.Competence.saveProgress(p).then((d) => {console.log('Progress saved', d);})
  }

  showQuestions(){
    Router.route({
      id: 'questions',
      passProps: this.props,
      component: Questions
    }, this.props.navigator);
  }

  renderUser(){
    console.log(this.state.user);
    if(this.state.user){
      return <View style={[styles._.row]}>
        <Icon name="ios-person" size={30} color={styles._.primary} /><Text> {this.state.user.name}</Text>
      </View>
    }
    return null;
  }

  render(){
    var competence = this.props;
    var subCompName = competence.isGoal ? 'Teilziele' : 'Teilkompetenzen';
    return <ScrollView style={styles.wrapper}>
      {this.renderUser()}
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
            if(this.state.assessTimer) {
              clearTimeout(this.state.assessTimer);
            }
            let _this = this;
            this.state.assessTimer = setTimeout(() => {
              _this.updateProgress();
            }, 1000);
            this.setState({sliderValue: value});
          }}
          value={this.state.sliderValue}
          step={1}
          style={styles.comp.slider} />
      </View>
      <TouchableHighlight underlayColor={styles.list.liHover} onPress={() => this.showQuestions()} style={styles.list.li}>
        <View>
          <View style={styles.list.rowContainer}>
            <View style={styles.list.textContainer}>
              <Text style={styles.list.text}>
                Reflektionsfragen
              </Text>
              <Text style={styles.list.right}>
                {this.state.answers.length}/{this.state.questions.length}
              </Text>
            </View>
          </View>
          <View style={styles.list.separator} />
        </View>
      </TouchableHighlight>
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
