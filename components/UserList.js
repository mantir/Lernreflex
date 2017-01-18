import React, {
  Component,
} from 'react';
import {
  TouchableHighlight,
  ListView,
  ScrollView,
  RefreshControl,
  Text,
  View,
  NavigatorIOS,
  Platform
} from 'react-native';
import {styles, Router, User, CompetenceList, CompetenceView, ActivityView, ListEntryCompetence, Loader, Icon} from 'Lernreflex/imports';

/**
 * Represents the view for the list of users sharing a competence
 * @extends React.Component
 * @constructor
 */

class UserList extends Component{

  constructor(){
    super();
    this.user = new User();
    var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    var _this = this;
    this.state = {
      dataSource: ds,
      refreshing: false,
      mySelf:{}
    }
    this.renderRow = this.renderRow.bind(this);
  }

  componentWillUnmount(){
    this.unmounting = true;
  }

  setState(input){
    if(!this.unmounting){
      super.setState(input);
    }
  }

  componentDidMount(){
    this.unmounting = false;
    let user = new User();
    //this.setState({ dataSource: this.state.dataSource.cloneWithRows(['loader']) });
    user.getCurrentUser().then((cu) => {
      user.isLoggedIn().then((u) => {
        console.log(u, cu);
        if(user.different(u, cu)) {
          this.setState({currentUser: cu, mySelf: u});
        } else
        this.setState({mySelf: u});
        this.loadData();
      });
    })
  }

  /**
  * Load users for course passed by props.competenceData.courseId
  * @param caching {bool} If users can be loaded from cache
  */
  loadData(caching = true){
    let user = new User(caching);
    let _this = this;
    this.setState({refreshing:true})
    user.getUsers(this.props.competenceData.courseId).then((d) => {
      user.isLoggedIn().then((u) => {
        if(_this.state.currentUser) {
          u.id = 'mySelf';
          d.unshift(u);
          d.unshift({name:'currentUser'});
        }
         _this.setState({
           dataSource: _this.state.dataSource.cloneWithRows(d),
           refreshing: false
         });
      })
      console.log('USERS:', d);
    });
  }

  /**
  * Executed if a user is selected
  * @param rowData {object} user data
  */
  rowPressed(rowData) {
    let route = {...this.props.previousRoute};
    //console.log(this.props.previousRoute);
    if(!route.passProps){
      route.passProps = {};
    }
    if(rowData.id == 'mySelf') rowData = false;
    route.passProps.currentUser = rowData;
    route.component = this.props.backTo == 'competence' ? CompetenceView : ActivityView;
    console.log('user slected', route.passProps);
    console.log(rowData);
    let user = new User();
    user.setCurrentUser(rowData).then(() => {
      this.props.navigator.pop();
      //Router.route(route, this.props.navigator, {replacePrevious:true});
    })
  }

  /**
  * Render user at the top, if different from the current
  */
  renderUser(){
      return <ListEntryCompetence
        type="currentUser"
        underlayColor={styles._.primary}
        onPress={() => this.showUsers()}
        rowData={this.state.currentUser} />
    }


    /**
    * Render a user in the list.
    * @param rowData {object} user data
    */
  renderRow(rowData){
    //if(rowData == 'loader') return null;
    if(rowData.name == 'currentUser') return this.renderUser();
    if(rowData.name == this.state.mySelf.username) return null;
    return <ListEntryCompetence
      type="user"
      underlayColor={styles._.primary}
      onPress={() => this.rowPressed(rowData)}
      rowData={rowData} />
  }

  /**
  * Executed on pull to refresh
  */
  _onRefresh(){
    this.loadData(false);
  }

  /**
  * Render the list view
  */
  render(){
    return <View style={styles.wrapper}>
      <ListView
        refreshControl={<RefreshControl refreshing={this.state.refreshing} onRefresh={this._onRefresh.bind(this)} />}
        style={styles._.list}
        enableEmptySections={true}
        dataSource={this.state.dataSource}
        renderRow={this.renderRow}>
      </ListView>
    </View>
  }
}



module.exports = UserList;
