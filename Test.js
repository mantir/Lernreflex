'use strict'
import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Platform,
  ListView,
  TouchableHighlight,
  StatusBar,
  Text,
  View,
  NavigatorIOS,
  Navigator
} from 'react-native';

import Router from 'reflect/Router';
import CompetenceList from 'reflect/components/CompetenceList';
import CompetenceView from 'reflect/components/CompetenceView';

class AppRouter {
  static route(route, navigator){
    switch (route.id) {
      case 'goals':
        route.title = 'Lernziele';
      break;
      case 'goal':
        route.title = 'Lernziel';
      break;
      case 'goal.add':
        route.title = 'Lernziel erstellen';
      break;
      case 'competence.add':
        route.title = 'Kompetenz hinzufügen';
      break;
      case 'user.login':
        route.title = 'Einloggen';
      break;
    }
    navigator.push(route);
  }
  static renderRoute(route, navigator){
    switch (route.id) {
      case 'goals':
      return (<CompetenceList navigator={navigator} title={route.title} />);
      case 'goal':
      return (<CompetenceView navigator={navigator} title={route.title} data={route.passProps.data} />);
      case 'goal.add':
      return (<CompetenceCreate navigator={navigator} type="goal" />);
    }
    return null;
  }
}

module.exports = Router;
