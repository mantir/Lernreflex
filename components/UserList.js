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
  Platform
} from 'react-native';
import {styles, Router, User, CompetenceList, CompetenceView, ActivityView, ListEntryCompetence, Loader, Icon} from 'Lernreflex/imports';


class UserList extends Component{

  constructor(){
    super();
    this.user = new User();
    var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    var _this = this;
    this.state = {
      dataSource: ds,
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
    let user = new User(false);
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(['loader'])
    });
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

  loadData(){
    let user = new User();
    let _this = this;
    user.getUsers(this.props.competenceData.courseId).then((d) => {
      user.isLoggedIn().then((u) => {
        if(_this.state.currentUser) {
          u.id = 'mySelf';
          d.unshift(u);
          d.unshift({name:'currentUser'});
        }
         _this.setState({dataSource: _this.state.dataSource.cloneWithRows(d)});
      })
      //console.log('USERS:', d);
    });
  }

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
    let user = new User();
    user.setCurrentUser(rowData).then(() => {
      Router.route(route, this.props.navigator, {replacePrevious:true});
    })
  }
  renderUser(){
      return <ListEntryCompetence
        type="currentUser"
        underlayColor={styles._.primary}
        onPress={() => this.showUsers()}
        rowData={this.state.currentUser} />
    }

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

  render(){
    return <View style={styles.wrapper}>
      <ListView
        style={styles._.list}
        enableEmptySections={true}
        dataSource={this.state.dataSource}
        renderRow={this.renderRow}>
      </ListView>
    </View>
  }
}



module.exports = UserList;
