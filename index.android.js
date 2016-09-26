'use strict';

import React, {
  Component,
} from 'react';
import {
  AppRegistry,
  StyleSheet,
  Platform,
  ListView,
  TouchableHighlight,
  StatusBar,
  Text,
  View,
  TouchableOpacity,
  Navigator,
  ToolbarAndroid,
  BackAndroid
} from 'react-native';

import Menu from 'Lernreflex/components/Menu';
import CompetenceView from 'Lernreflex/components/CompetenceView';
import BadgeList from 'Lernreflex/components/BadgeList';
import {styles, Router, User, UserLogin, Icon, CompetenceCreate, CompetenceList} from 'Lernreflex/imports';


var _navigator; // we fill this up upon on first navigation.

BackAndroid.addEventListener('hardwareBackPress', () => {
  if (_navigator.getCurrentRoutes().length === 1  ) {
     return false;
  }
  _navigator.pop();
  return true;
});

class reflect extends Component {
  constructor(){
    super();
    this.position = 0;
    this.renderScene = this.renderScene.bind(this);
    this.routeMapper = {
      test: 4
    }
    this.systemName = Router.systemName;
    this.user = new User();
    var _this = this;
    this.initialRoute = {
      title: 'Lernziele',
      component: CompetenceList,
      id: 'goals',
      passProps:{
        type:'goals'
      }
    };
    this.loginRoute = {
      title: this.systemName + ' Login',
      id:'user.login',
      component: UserLogin,
      passProps: {
        onLogin: () => this.onLogin()
      }
    };
    this.checkedLoggedIn = false;
    this.user.isLoggedIn().done((isIn) => {
      _this.checkedLoggedIn = true;
      _this.loggedIn = isIn;
      this.setState({loggedIn: isIn});
    });
    this.NavigationBarRouteMapper = {

      LeftButton: function(route, navigator, index, navState) {
        if (index === 0) {
          return null;
        }

        var previousRoute = navState.routeStack[index - 1];
        return (
          null
        );
      },

      RightButton: function(route, navigator, index, navState) {
        if(route.id == 'goals')
        return (
          <TouchableHighlight style={styles._.toolbarRight} onPress={() => Router.route({id:'goal.add', component:CompetenceCreate}, navigator)} >
            <Icon name="md-add" size={25} color='#FFF' />
            </TouchableHighlight>
        );
        if(route.id == 'competences')
        return (
          <TouchableHighlight style={styles._.toolbarRight} onPress={() => Router.route({id:'competence.add', component:CompetenceCreate}, navigator)} >
            <Icon name="md-add" size={25} color='#FFF' />
          </TouchableHighlight>
        );
      },

      Title: function(route, navigator, index, navState) {
        return (
          <Text style={styles._.toolbarText}>{route.title}</Text>
        );
      },

    };
  }

  onLogin(){
    this.loggedIn = true;
    this.setState({loggedIn: true});
    alert(1);
    Router.route(this.initialRoute, _navigator, {reset:true});
  }

  onLogout(){
    this.loggedIn = false;
    alert(2);
    this.setState({loggedIn: false});
    Router.route(this.loginRoute, _navigator, {reset:true});
  }

  onActionSelected(position){
      alert(position);
  }

  _renderToolbar(route, actions, onSelect){
    if(!this.loggedIn)
      return null;
    return <Icon.ToolbarAndroid
          actions={actions}
          onActionSelected={onSelect}
          style={styles._.actionBar}
          />
  }

  renderScene(route, navigator){
    _navigator = navigator;
    var actions = [
      {id:'goals', iconName:Router.icons.goals, title: '', passProps:{type: 'goals'}, component: CompetenceList, show: 'always'},
      {id:'badges', iconName:Router.icons.badges, title: '', component: BadgeList, show: 'always'}, //ifRoom
      {id:'notifications', iconName:Router.icons.notifications, title: '', component: CompetenceList, show: 'always'},
      //{id:'recommendations', iconName:Router.icons.recommendations, title: '', component: CompetenceList, show: 'ifRoom'}, //ifRoom
      {id:'competences', iconName:Router.icons.competences, title: '', component: CompetenceList, show: 'always'},
      {id:'menu', passProps: { onLogout: () => this.onLogout() }, iconName:Router.icons.menu, title: '', component: Menu, show: 'always'}
    ];
    let current = -1;
    actions = actions.map((a, index) => {
      if(a.id == route.id) {
        current = index;
        a.iconColor = styles._.secondary;
        a.iconSize = 35;
      } else {
        a.iconColor = '#FFF'; //styles._.primaryBrighter;
        a.iconSize = 30;
      }
      return a;
    });
    if(current > -1) {
      this._position = current;
    } else {
      //actions[this._position].iconColor = styles._.secondary;
      //actions[this._position].iconSize = 35;
    }

    let _this = this;
    let onSelect = (position) => {
      _this.position = position;
      let route = actions[position];
      Router.route(route, navigator, {reset: true});
    };
    return <View>
      {this._renderToolbar(route, actions, onSelect)}
      {Router.renderRoute(route, navigator)}
    </View>

  }
  render() {
    if(!this.checkedLoggedIn) {
      return null
    }
    var initialRoute = this.initialRoute;
    if(!this.loggedIn) {
      initialRoute = this.loginRoute;
    }
    return (
      <Navigator ref='nav'
        tintColor={styles._.navBtnColor}
        titleTextColor={styles._.navColor}
        barTintColor={styles._.navBg}
        itemWrapperStyle={styles._.navWrap}
        style={styles._.navWrap}
        navigationBar={<Navigator.NavigationBar
          navigationStyles={Navigator.NavigationBar.StylesIOS}
          style={styles._.toolbar}
          title="Router"
          routeMapper={this.NavigationBarRouteMapper}
          />}
          renderScene={this.renderScene}
          initialRoute={initialRoute}>
        </Navigator>

      );
    }
  }


  AppRegistry.registerComponent('reflect', () => reflect);
