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
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import {
  styles,
  Router,
  lib,
  Loader,
  Competence,
  CompetenceCreate,
  Icon,
  Activity,
  ActivityView,
  User,
  UserList,
  Questions,
  ListEntryCompetence
} from 'Lernreflex/imports';

/**
* Represents the view for a competence/goal.
* @extends React.Component
* @constructor
*/

class CompetenceView extends Component{

  constructor(){
    super();
    this.Competence = new Competence();
    var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      currentAssessment:'progress',
      //currentTab: 'subcompetences',
      currentTab: 'activities',
      progress:{
        questions: [],
        answers: {},
        progress:0,
        time:0,
      },
      subcompetences: ds.cloneWithRows([
      ]),
      activities: ds.cloneWithRows([
      ]),
      loaded: false,
    };
    this.state.sliderValue = this.state.progress[this.state.currentAssessment];
    this.render = this.render.bind(this);
  }

  componentWillUnmount(){
    this.unmounting = true;
    if(this.state.assessTimer){
      clearTimeout(this.state.assessTimer);
      this.updateProgress();
      this.props.updateChanges();
    } else
    this.props.updateChanges();
  }

  setState(input){
    if(!this.unmounting){
      super.setState(input);
    }
  }

  /**
  * Executed when the component receives props
  * @param nextProps {object}
  */
  componentWillReceiveProps(nextProps){
    this.loadUser(nextProps);
  }

  /**
  * Load the competence for a certain user. Executed when receiving props.
  * @param nextProps {object} Props that are passed to this component
  */
  loadUser(nextProps){
    let user = new User();
    let comp = new Competence(false);
    let _this = this;
    user.getCurrentUser().then((cu) => {
      //if(!user.different(this.state.currentUser, cu)) return;
      if(!user.different(this.state.currentUser, cu)) return;
      this.state.currentUser = nextProps.currentUser;
      _this.setState({
        currentUser: cu,
        loading:true
      });
      comp.getProgress(cu.username).then((progress) => {
        let props = {
          competenceData:{...this.props.competenceData, progress:progress[_this.props.competenceData.name]},
          currentProgress: progress
        };
        _this.updateState(props);
      });
    });
  }

  componentDidMount(){
    let user = new User();
    this.unmounting = false;
    let _this = this;
    user.setItem('currentUser', false);
    this.updateState();
    this.loadData();
  }

  /**
  * Update the state depending on the new props received
  * @param props {object}
  */
  updateState(props){
    props = props ? props : this.props;
    let fun = (questions) => {
      let sliderProgress = {time:0, progress:0, value:0};
      let answers = {};
      //questions = lib.constants.generalCompetenceQuestions;
      if(props.competenceData.progress && Object.keys(props.competenceData.progress).length) {
        sliderProgress.progress = props.competenceData.progress.PROGRESS.assessmentIndex;
        sliderProgress.time = props.competenceData.progress.TIME.assessmentIndex;
        sliderProgress.value = sliderProgress.progress;
        answers = (new Competence()).answersToView(props.competenceData, questions);
      }
      //console.log(questions);
      this.setState({
        loading:false,
        progress: {
          progress: sliderProgress.progress,
          time: sliderProgress.time,
          answers: answers,
          questions: questions,
        },
        competenceData: props.competenceData,
        sliderValue: sliderProgress.value,
      });
    }
    if(!this.state.questions || !this.state.questions.length)
    this.Competence.getQuestions(props.competence).then(fun);
    else
    fun(this.state.questions);
  }

  /**
  * Load competence data, activities, questions and sub competences
  */
  loadData(){
    var _this = this;
    let activity = new Activity();
    let user = new User();
    user.isLoggedIn().then((u) => {
      activity.getActivities(this.props.competence, this.props.courseId).then((d) => {
        d = activity.areDone(d, this.props.competenceData, u.username);
        _this.setState({
          activities: d,
          loadedActivities: true
        });
      }, (e) => {console.log('ACTIVITY-ERROR', e);});
    })
    this.Competence.getSubCompetences(this.props.competence)
    .then((d) => {
      d = _this.Competence.toView(d, _this.props.type);
      _this.setState({
        subcompetences: d,
        loadedSubcompetences: true
      });
    });
    this.Competence.getQuestions(this.props.competence).then((questions) => {
      _this.setState({
        loadedQuestions: true,
        questions: questions
      });
    });
  }

  /**
  * Render the self assessment section for progress and time
  */
  _renderAssessment(){
    let btns = [
      {key:'progress', name: 'Fortschritt', value:this.state.progress.progress},
      {key:'time', name: 'Zeit', value: this.state.progress.time},
      //{key:'interest', name: 'Interesse', value: this.state.progress.interest},
    ];
    if(!this.state.currentUser) {
      return <View style={[styles._.row, styles._.otherBG]}>
        {btns.map(function(btn){
          var style = [styles._.button, {backgroundColor:styles._.primary}];
          var scale = this.Competence.scales[btn.key];
          var color = styles._.primary;
          if(btn.key === this.state.currentAssessment) {
            style.push(styles._.buttonActive);
          }
          return <View key={btn.key} style={styles._.col}>
            {this._wrapRow(<Text style={styles._.center}>{scale.values[btn.value]+scale.unit}</Text>)}
            {this._wrapRow(<TouchableHighlight
              underlayColor={color}
              onPress={() => {this.setState({currentAssessment:btn.key, sliderValue: this.state.progress[btn.key]})}}
              style={style}>
              <Text style={styles._.buttonText}>{btn.name}</Text>
            </TouchableHighlight>)}
          </View>
        }.bind(this))}
      </View>
    } else {
      return <View style={[styles._.row, styles._.otherBG]}>
        {btns.map(function(btn){
          var style = [styles._.button];
          var scale = this.Competence.scales[btn.key];
          var color = this.state.currentUser ? styles._.secondary : styles._.primary;
          if(btn.key === this.state.currentAssessment && !this.state.currentUser) {
            style.push(styles._.buttonActive);
          }
          let percent = (btn.value) / (scale.values.length - 1) * 100;
          console.log(percent);
          return <View key={btn.key} style={[styles._.col, {}]}>
            <View style={{flex: 1, justifyContent: 'space-between', alignItems: 'center'}}>
              <AnimatedCircularProgress
                style={styles._.center}
                size={120}
                width={15}
                fill={percent}
                tintColor={styles._.primaryBrighter}
                backgroundColor={styles._.primary}>{ () =>
                  <Text style={styles.comp.circleText}>
                    { scale.values[btn.value]+scale.unit }
                  </Text>}
                </AnimatedCircularProgress>
              </View>
              {this._wrapRow(<View>
                <Text style={{color:styles._.primary, alignSelf:'center', padding:3}}>{btn.name}</Text>
              </View>)}
            </View>
          }.bind(this))}
        </View>
      }
    }

    /**
    * Get the name for sub goal or sub competence
    */
    subCompName(singular){
      if(singular)
      return this.props.isGoal ? 'Teilziel' : 'Teilkompetenz';
      return this.props.isGoal ? 'Teilziele' : 'Teilkompetenzen';
    }

    /**
    * Render the buttons for activities and sub subcompetences
    */
    _renderTabs(){
      var subCompName = this.subCompName();
      let btns = [
        //{key:'users', name: 'Mitlerner', value: ''},
      ];
      if(this.props.courseId) {
        btns.push({key:'activities', name: 'Aktivitäten', value: ''});
      } //else btns.push({key:'subcompetences', name: subCompName, value:''});
      let _this = this;
      return btns.map(function(btn){
        var style = [styles._.tab];
        var style2 = [styles._.buttonText];
        if(btn.key === _this.state.currentTab){
          style.push(styles._.tabActive);
          style2.push(styles._.tabActiveText);
        }
        return <TouchableHighlight
          underlayColor={styles.list.liHover}
          key={btn.key}
          onPress={() => {_this.setState({currentTab: btn.key})}}
          style={style}>
          <Text style={style2}>{btn.name}</Text>
        </TouchableHighlight>
      });
    }

    /**
    * Wrap an element in row markup to have a clear layout.
    */
    _wrapRow(content, colStyle, rowStyle){
      let st = [styles._.col];
      let str = [styles._.row];
      if(colStyle) {
        st.push(colStyle);
      }
      if(rowStyle){
        if(rowStyle[0]) {
          str = str.concat(rowStyle);
        } else
        str.push(rowStyle);
      }
      return <View style={str}>
        <View style={st}>
          {content}
        </View>
      </View>
    }

    /**
    * Render content of activity tab and subcompetences tab
    */
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
          onPress={() => {Router.route(route, this.props.navigator)}}
          style={styles._.button}>
          <Text style={styles._.buttonText}>
            <Icon name={Router.icons.addRound} size={14} color='#FFF' />
            {' '+(this.state.currentTab == 'subcompetences' ? this.subCompName(true) : 'Aktivität')+' hinzufügen'}
          </Text>
        </TouchableHighlight>
      }

      var list = content ? Object.keys(content).map((key) => this.renderRow(content[key])) : null;
      let loaded = this.state.currentTab == 'activities' && this.state.loadedActivities || this.state.currentTab == 'subcompetences' && this.state.loadedSubcompetences;
      if(!loaded) {
        return this._wrapRow(<Loader color="#000" />);
      }
      return [list, button];
    }

    /**
    * Render the slider for self assessment of progress and time
    */
    _renderSlider(){
      if(this.state.currentUser) return null;
      return this._wrapRow(<Slider
        ref="slider"
        maximumValue={this.Competence.scales[this.state.currentAssessment].values.length - 1}
        minimumValue={0}
        onValueChange={(value) => {
          this.state.progress[this.state.currentAssessment] = value;
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
        style={[styles.comp.slider]}
        step={1}></Slider>, null, [styles._.otherBG, {paddingTop:0}])
      }

      /**
      * Update the progress when changed with the slider
      */
      updateProgress(){
        let slider = this.refs.slider;
        let _this = this;
        let p = {
          minValue: 0,
          maxValue: this.Competence.scales[this.state.currentAssessment].values.length - 1,
          value: this.state.sliderValue,
          identify: this.state.currentAssessment,
          competence: this.props.competence
        }
        let type = _this.state.currentAssessment.toUpperCase();
        if(!_this.props.competenceData.progress) {
          _this.props.competenceData.progress = {};
        }
        _this.props.competenceData.progress[type].assessmentIndex = this.state.sliderValue;
        _this.Competence.setState(_this.props.competence, _this.props.competenceData);
        return this.Competence.saveProgress(p).then((progress) => {
          console.log('Progress saved', _this.props.competenceData);
        });
      }

      /**
      * Navigate to the reflective questions
      */
      showQuestions(){
        //console.log(this.props.route);
        Router.route({
          id: 'questions',
          passProps: {
            competenceData:this.state.competenceData,
            answers: this.state.progress.answers,
            currentUser: this.state.currentUser,
            questions: this.state.progress.questions,
            questionsAnswered: () => {this.Competence.setState(this.props.competence, this.state.competenceData)}
          },
          component: Questions,
          previousRoute: this.props.route
        }, this.props.navigator);
      }

      /**
      * Executed when an activity or subsompetence is tapped
      */
      rowPressed(rowData) {
        rowData.currentUser = this.state.currentUser;
        let route = {};
        if(rowData.type == 'competence'){
          route = {
            title: 'Lernziel',
            id: this.props.type == 'goals' ? 'goal' : 'competence',
            component: CompetenceView,
            passProps: rowData
          }
        } else if(rowData.type == 'activity'){
          rowData.competenceData = this.state.competenceData;
          route = {
            title: 'Aktivität',
            id: 'activity',
            component: ActivityView,
            passProps: {...rowData}
          }
        }
        route.rightButtonIcon = this.props.communityIcon;
        route.onRightButtonPress = () => {Router.route({
          id:'users',
          component: UserList,
          passProps: {
            communityIcon: this.props.communityIcon,
            previousRoute: route,
            backTo: rowData.type,
            competenceData: this.props.competenceData
          }
        }, this.props.navigator)};
        Router.route(route, this.props.navigator);
      }

      /**
      * Render an activity or subcompetence row
      */
      renderRow(rowData){
        return this._wrapRow(
          <ListEntryCompetence
            type={rowData.type}
            underlayColor={styles.list.liHover}
            onPress={() => {this.rowPressed(rowData)}}
            rowData={rowData}
            style={[styles._.row, styles.list.withSeparator]} />
        );
      }
      /**
      * Render the user at the top, if different from the current
      */
      renderUser(){
        if(this.state.currentUser){
          return <ListEntryCompetence
            type="currentUser"
            underlayColor={styles._.primary}
            onPress={() => {this.showUsers()}}
            rowData={this.state.currentUser}
            />
        }
        return null;
      }

      /**
      * Render the competence view
      */
      render(){
        var competence = this.props;
        var subCompName = competence.isGoal ? 'Teilziele' : 'Teilkompetenzen';
        if(this.state.loading) return <ScrollView style={styles.wrapper}>{this.renderUser()}<Loader /></ScrollView>
        return <ScrollView style={styles.wrapper}>
          {this.renderUser()}
          {this._wrapRow(<Text style={styles.comp.title}>{competence.text}</Text>)}

          {this._wrapRow(<Text style={[styles.comp.sectionHead]}>Selbsteinschätzung</Text>, styles._.justify, styles._.otherBG)}

          {this._renderAssessment()}
          {this._renderSlider()}

          {this.state.loadedQuestions ? this._wrapRow(
            <TouchableHighlight underlayColor={styles.list.liHover} onPress={() => {this.showQuestions()}} style={[styles._.row, styles.list.withSeparator]}>
              <View style={styles._.col}>
                <View style={styles.list.rowContainer}>
                  <View style={styles.list.textContainer}>
                    <Text style={styles.list.text}>
                      Reflexionsfragen
                    </Text>
                    <Text style={styles.list.right}>
                      {Object.keys(this.state.progress.answers).length}/{this.state.progress.questions.length}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableHighlight>) : <Loader></Loader>
          }

          <View style={styles._.row}>
            {this._renderTabs()}
          </View>
          {this._renderTabContent()}
        </ScrollView>
      }
    }

    module.exports = CompetenceView;
