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
import {styles, Router, Competence, Activity, ListEntryCompetence, Icon, InputScrollView} from 'Lernreflex/imports';
import Dimensions from 'Dimensions';

class ActivityView extends Component{

  constructor(){
    super();
    this.activity = new Activity();
    var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      currentTab: 'comments',
      comment:'',
      comments: ds.cloneWithRows([
        {id:2, percent:15, type:'comment', user:'Klaus R.', comment:'Deine Lösung war sehr elegant. Der Gradient Descent könnte allerdings noch etwas schneller ablaufen, wenn die du Step Size größer machst.'},
        //{id:1, percent:75, type:'comment', user:'Martin K.', comment:''},
/*        {id:3, percent:20, type:'comment', user:'Martin K.', comment:'Comment 3'},
        {id:4, percent:20, type:'comment', user:'Martin K.', comment:'Comment 4'},
        {id:5, percent:20, type:'comment', user:'Martin K.', comment:'Comment 5'},*/
      ]),
      users: ds.cloneWithRows([
        {id:1, percent:75, type:'user', name:'User 1'},
        {id:2, percent:15, type:'user', name:'User 2'},
        {id:3, percent:20, type:'user', name:'User 3'},
        {id:4, percent:20, type:'user', name:'User 4'},
        {id:5, percent:20, type:'user', name:'User 5'},
      ]),
    };
    this.render = this.render.bind(this);
  }

  componentDidMount(){
    this.setState({height:40});
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
    if(rowData.type == 'user'){
      return <ListEntryCompetence type="user" rowData={rowData} />
    } else if(rowData.type == 'comment'){
      return <ListEntryCompetence type="comment" rowData={rowData} />
    }
  }

  _renderTabs(){
    let btns = [
      {key:'comments', name: 'Kommentare', value:''},
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
    var input = null, spacer = null;
    if(this.state.currentTab == 'comments'){
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
            <TouchableHighlight underlayColor={styles._.primary} onPress={() => this.addComment()} style={styles.comp.addComment}>
              <Text style={styles._.highlight}>
                {"Senden"}
              </Text>
            </TouchableHighlight>
          </View>
        </View>
      </View>
    }
    var list = <ListView
      key='list'
      style={styles._.list}
      dataSource={content}
      renderRow={(rowData) => this.renderRow(rowData)}>
    </ListView>
    return [list, input, spacer];
  }

  addComment(){
    var comment = this.state.comment;
    var competence = new Competence();
    this.setState({comments: this.state.comments.cloneWithRows([
      {id:2, type:'comment', user:'Klaus R.', comment:'Deine Lösung war sehr elegant. Der Gradient Descent könnte allerdings noch etwas schneller ablaufen, wenn die du Step Size größer machst.'},
      {id:1, type:'comment', user:'Martin K.', comment:this.state.comment},
    ]),
      comment:''
    });
  }

  _scrollToBottom(refName) {
    var _this = this;
    setTimeout(() => {
      let scrollResponder = _this.refs.scroller.getScrollResponder();
      scrollResponder.scrollResponderScrollNativeHandleToKeyboard(
        ReactNative.findNodeHandle(_this.refs[refName]),
        10, //additionalOffset
        true
      );
    }, 1);
  }


  render(){
    var activity = this.props;
    //<View style={styles.viewWrapper}>
    return <InputScrollView style={[styles.wrapper, {overflow:'hidden'}]} ref="scroller">
      <Text style={[styles.comp.title]}>{activity.name}</Text>
        <View style={styles._.tabContainer}>
          {this._renderTabs()}
        </View>
        {this._renderTabContent()}
      </InputScrollView>
    //</View>

  }
}


module.exports = ActivityView;
