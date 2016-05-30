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
import {styles, Router, User, CompetenceList, Loader} from 'reflect/imports';


class Menu extends Component{

  constructor(){
    super();
    var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.links = [
      {title: 'Empfohlene Lernziele', route:{
        id: 'goals',
        component: CompetenceList,
        title:'FFF',
        passProps:{
          color: '#000'
        }
      }},
      {title: 'Logout', route:{'id': 'user.logout'}},
    ]
    this.state = {
      links: ds.cloneWithRows(this.links),
    }
    this.renderRow = this.renderRow.bind(this);
  }

  rowPressed(rowData) {
    if(rowData.route.id === 'user.logout'){
      let user = new User();
      user.logout().then(this.props.onLogout);
    } else {
      Router.route(rowData.route, this.props.navigator);
    }
  }

  renderRow(rowData){
    return <TouchableHighlight underlayColor={styles.list.liHeadHover} onPress={() => this.rowPressed(rowData)} style={styles.list.liHead}>
      <View>
        <View style={styles.list.rowContainer}>
          <View style={styles.list.textContainer}>
            <Text style={styles.list.headText}>
              {rowData.title}
            </Text>
          </View>
        </View>
        <View style={styles.list.separator} />
      </View>
    </TouchableHighlight>
  }

  render(){
    return <View style={styles.wrapper}>
      <ListView
        style={styles._.list}
        dataSource={this.state.links}
        renderRow={this.renderRow}>
      </ListView>
    </View>
  }
}



module.exports = Menu;
