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
import {styles, Router, User, Admin, CompetenceList, Loader} from 'Lernreflex/imports';

/**
 * Represents the view for the menu.
 * @extends React.Component
 * @constructor
 */

class Menu extends Component{

  constructor(){
    super();
    this.user = new User();
    var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.links = [
/*      {title: 'Empfohlene Lernziele', route:{
        id: 'goals',
        component: CompetenceList,
        title:'FFF',
        passProps:{
          color: '#000'
        }
      }},*/
      {title: 'Logout', route:{'id': 'user.logout'}},
    ];
    var _this = this;
    let user = new User();
    this.state = {
      links: ds.cloneWithRows(_this.links),
    }
    this.renderRow = this.renderRow.bind(this);
    user.isLoggedIn().then((u) => {
      if(Router.adminNames.indexOf(u.username) > -1) {
        _this.links.push({title: 'Admin', route:{'id': 'admin', component: Admin}});
      }
      _this.setState({
        links: ds.cloneWithRows(_this.links),
      });
    });

  }

  /**
  * Executed when menu entry is pressed
  */
  rowPressed(rowData) {
    if(rowData.route.id === 'user.logout'){
      this.user.logout().then(this.props.onLogout);
    } else {
      Router.route(rowData.route, this.props.navigator);
    }
  }

  /**
  * Renders menu entry
  * @return {ReactNative.TouchableHighlight}
  */
  renderRow(rowData){
    return <TouchableHighlight underlayColor={styles.list.liHover} onPress={() => { this.rowPressed(rowData) }} style={styles.list.li}>
      <View>
        <View style={styles.list.rowContainer}>
          <View style={styles.list.textContainer}>
            <Text style={styles.list.text}>
              {rowData.title}
            </Text>
          </View>
        </View>
        <View style={styles.list.separator} />
      </View>
    </TouchableHighlight>
  }

  /**
  * Render the whole menu
  * @return {ReactNative.View}
  */
  render(){
    return <View style={styles.wrapper}>
      <ListView
        style={styles._.list}
        dataSource={this.state.links}
        contentContainerStyle={{flex:1}}
        renderRow={this.renderRow}>
      </ListView>
    </View>
  }
}



module.exports = Menu;
