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
import {styles, Router, User, CompetenceList, CompetenceView, ActivityView, Loader} from 'Lernreflex/imports';


class Questions extends Component{

  constructor(){
    super();
    this.user = new User();
    var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    var _this = this;
    let user = new User();
    this.state = {
      dataSource: ds,
    }
    this.renderRow = this.renderRow.bind(this);
  }

  componentDidMount(){
    this.unmounting = false;
    this.loadData();
  }

  loadData(){
    let user = new User();
    let _this = this;
    user.getUsers().then((d) => {
      _this.setState({dataSource: _this.state.dataSource.cloneWithRows(d)});
      console.log('USERS:', d);
    });
  }

  rowPressed(rowData) {
    let route = this.props.previousRoute;
    if(!route.passProps){
      route.passProps = {};
    }
    route.passProps.currentUser = rowData;
    route.component = this.props.backTo == 'competence' ? CompetenceView : ActivityView;
    console.log(route);
    Router.route(route, this.props.navigator, {replacePrevious:true});
  }

  renderRow(rowData){
    return <TouchableHighlight underlayColor={styles.list.liHeadHover} onPress={() => this.rowPressed(rowData)} style={styles.list.liHead}>
      <View>
        <View style={styles.list.rowContainer}>
          <View style={styles.list.textContainer}>
            <Text style={styles.list.headText}>
              {rowData.name}
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
        dataSource={this.state.dataSource}
        renderRow={this.renderRow}>
      </ListView>
    </View>
  }
}

module.exports = Questions;
