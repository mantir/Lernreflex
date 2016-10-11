import React, {
  Component,
} from 'react';
import ReactNative, {
  TouchableHighlight,
  ListView,
  ScrollView,
  Text,
  View,
  NavigatorIOS,
  Platform,
  TextInput,
  Slider
} from 'react-native';
import {
  styles,
  Router,
  Competence,
  Activity,
  ListEntryCompetence,
  Icon,
  Loader,
  User,
  InputScrollView
} from 'Lernreflex/imports';
import Dimensions from 'Dimensions';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import dismissKeyboard from 'dismissKeyboard'

class ActivityView extends Component{

  constructor(){
    super();
    this.activity = new Activity();
    var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      currentTab: 'comments',
      comment:'',
      comments: ds.cloneWithRows([
        //{id:2, percent:15, type:'comment', user:'Klaus R.', comment:'Deine Lösung war sehr elegant. Der Gradient Descent könnte allerdings noch etwas schneller ablaufen, wenn die du Step Size größer machst.'},
        //{id:1, percent:75, type:'comment', user:'Martin K.', comment:''},
        /*        {id:3, percent:20, type:'comment', user:'Martin K.', comment:'Comment 3'},
        {id:4, percent:20, type:'comment', user:'Martin K.', comment:'Comment 4'},
        {id:5, percent:20, type:'comment', user:'Martin K.', comment:'Comment 5'},*/
      ]),
    };
    this.render = this.render.bind(this);
    this.updateState = this.updateState.bind(this);
  }

  setState(input){
    if(!this.unmounting){
      super.setState(input);
    }
  }

  componentWillUnmount(){
    this.unmounting = true;
  }

  componentDidMount(param = 'nothing'){
    this.unmounting = false;
    this.updateState();
  }

  componentWillReceiveProps(nextProps){
    let user = new User();
    let comp = new Competence(false);
    let _this = this;
    if(!user.different(this.state.currentUser, nextProps.currentUser)) return;
    this.state.currentUser = nextProps.currentUser;
    user.getCurrentUser().then((cu) => {
      console.log('current', cu);
      user.isLoggedIn().then((u) => {
        if(user.different(u, cu) || !cu) {
          this.setState({
            currentUser: cu,
            loading:true
          });
          let username = cu ? cu.username : u.username;
          console.log('username', username);
          comp.getProgress(username).then((progress) => {
            let props = {...nextProps,
              competenceData:{...nextProps.competenceData, progress:progress[_this.props.competenceData.name]},
              currentUser:cu,
              currentProgress: progress
            };
            _this.updateState(props);
          });
        }
      });
    });
  }

  updateState(nextProps){
    let props = !nextProps ? this.props : nextProps;

    let activity = new Activity();
    let user = new User();
    let comments = activity.commentsToView(props.competenceData.progress, props.activityData);

    this.setState({
      height:40,
      commentsData: comments,
      currentUser: props.currentUser,
      comments: this.state.comments.cloneWithRows(comments),
      loading:false
    });
  }

  rowPressed(rowData) {
    if(rowData.type == 'activity'){
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
    return <ListEntryCompetence type="comment" rowData={rowData} />
  }

  renderAuthor(){

  }

  _renderHeadline(){
    let headline = {key:'comments', name: 'Kommentare', value:''};
    return <Text style={{color:styles._.secondary, marginLeft:10}}>{headline.name}</Text>
  }

  _renderTabContent(){
    var content = this.state.comments;
    var input = null, spacer = null;
    if(this.state.loading) {
      return <Loader />
    }

    input = <View key="inputView" style={{flexDirection:'row'}}>
      <View style={{flexDirection:'column', alignItems:'flex-start', flex:0.8}}>
        <TextInput
          key="input"
          ref="newComment"
          onChange={(event) => {
            this.setState({comment:event.nativeEvent.text, height: event.nativeEvent.contentSize.height});
            this._scrollToBottom('newComment');
          }}
          onFocus={() => this._scrollToBottom('newComment')}
          value={this.state.comment}
          numberOfLines={10}
          multiline={true}
          style={[styles.comp.input, styles.comp.commentInput, {height: Math.max(40, this.state.height)}]}
          maxLength={styles.max.comment}
          editable={!this.state.loading}
          enablesReturnKeyAutomatically={true}
          placeholder='Kommentieren ...'>
        </TextInput>
      </View>
      <View style={{flexDirection:'column', alignItems:'center', flex:0.2}}>
        <View style={{flexDirection:'row', alignItems:'flex-end', flex:1}}>
          <TouchableHighlight underlayColor='#FFF' onPress={() => this.addComment()} style={[styles.comp.addComment]}>
            <Text style={[styles._.highlight, {color: this.state.comment.trim() ? styles._.secondary : '#EEE'}]}>
              Senden
            </Text>
          </TouchableHighlight>
        </View>
      </View>
    </View>

    var list = <ListView
      key='list'
      style={styles._.list}
      dataSource={content}
      enableEmptySections={true}
      renderRow={(rowData) => this.renderRow(rowData)}>
    </ListView>
    return [list, input, spacer];
  }

  addComment(){
    let user = new User();
    user.isLoggedIn().then((u) => {
      var comment = {
        user: this.state.currentUser,
        author: u,
        competence: this.props.competenceData,
        activity: this.props,
        comment: this.state.comment
      }
      comment.comment = comment.comment.trim();
      if(!comment.comment) {
        return;
      }
      let activity = new Activity();
      activity.comment(comment).then((d) => {
        let created = Date.now();
        this.state.commentsData.push({user:u.username, created:created, text:this.state.comment});
        this.setState({comments: this.state.comments.cloneWithRows(this.state.commentsData),
          comment:''
        });
      });
    });
    dismissKeyboard();
  }

  _scrollToBottom(refName) {
    var _this = this;
    if(Platform.OS != 'ios') return;
    setTimeout(() => {
      let scrollResponder = _this.refs.scroller.getScrollResponder();
      scrollResponder.scrollResponderScrollNativeHandleToKeyboard(
        ReactNative.findNodeHandle(_this.refs[refName]),
        10, //additionalOffset
        true
      );
    }, 1);
  }

  renderUser(){
    if(this.state.currentUser){
      return <ListEntryCompetence
        type="currentUser"
        underlayColor={styles._.primary}
        onPress={() => this.showUsers()}
        rowData={this.state.currentUser} />
    }
    return null;
  }


  render(){
    var activity = this.props;
    var Comp = ScrollView;
    if(Platform.OS == 'ios') {
      Comp = InputScrollView;
    }
    return <View style={{flex:1}}>
      <Comp keyboardShouldPersistTaps={true} style={[styles.wrapper, {overflow:'hidden'}]} ref="scroller">
        {this.renderUser()}
        <Text style={[styles.comp.title]}>{activity.name}</Text>
        <View style={styles._.row}>
          {this._renderHeadline()}
        </View>
        {this._renderTabContent()}
      </Comp>
    </View>
  }
}


module.exports = ActivityView;
