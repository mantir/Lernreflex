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
import Icon from 'react-native-vector-icons/Ionicons';
import CompetenceView from 'reflect/components/CompetenceView';
import CompetenceCreate from 'reflect/components/CompetenceCreate';
import BadgeList from 'reflect/components/BadgeList';
import {styles, Router, User, UserLogin, CompetenceList} from 'reflect/imports';


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
    this.renderScene = this.renderScene.bind(this);
    this.routeMapper = {
      test: 4
    }
    this.systemName = 'Reflect';
    this.user = new User();
    var _this = this;
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
            <Text style={styles._.toolbarText}>+</Text>
            </TouchableHighlight>
        );
        if(route.id == 'competences')
        return (
          <TouchableHighlight style={styles._.toolbarRight} onPress={() => Router.route({id:'competence.add', component:CompetenceCreate}, navigator)} >
            <Text style={styles._.toolbarText}>+</Text>
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
  }

  onLogout(){
    this.loggedIn = false;
    this.setState({loggedIn: false});
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
      {id:'goals', title: 'Lernziele', passProps:{type: 'goals'}, component: CompetenceList, show: 'always'},
      {id:'badges', title: 'Badges', component: BadgeList, show: 'ifRoom'},
      {id:'notifications', title: 'Benachrichtigungen', component: CompetenceList, icon:require('./img/sign-check-icon.png'), show: 'always'},
      {id:'recommendations', title: 'Empfehlungen', component: CompetenceList, show: 'ifRoom'},
      {id:'competences', title: 'Kompetenzen', component: CompetenceList, show: 'always'}
    ];
    let current = -1;
    actions = actions.filter((a, index) => { if(a.id == route.id) current = index; return a.id != route.id});

    let _this = this;
    let onSelect = (position) => {
      let route = actions[position];
      Router.route(route, navigator, {reset: true});
    };
    return <View>
      {this._renderToolbar(route, actions, onSelect)}
      {Router.renderRoute(route, navigator)}
    </View>

  }
  render() {
    var initialRoute = {
      title: 'Lernziele',
      component: CompetenceList,
      id: 'goals',
      passProps:{
        type:'goals'
      }
    };
    if(!this.checkedLoggedIn) {
      return null
    }
    if(!this.loggedIn) {
      initialRoute = {
        title: this.systemName + ' Login',
        id:'user.login',
        component: UserLogin,
        passProps: {
          onLogin: () => this.onLogin()
        }
      };
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
