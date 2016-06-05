'use strict'
import React from 'react';
var Router = {
  icons: {
    goals:'ios-pie-outline',
    badges:'md-ribbon',
    notifications:'md-notifications',
    competences:'md-school',
    menu:'md-menu',
  },

  route(route, navigator, params){
    if(!route.passProps){
      route.passProps = {};
    }
    switch (route.id) {
      case 'goals':
        route.passProps = {type:'goals'};
        route.title = 'Lernziele';
      break;
      case 'goal':
        route.title = 'Lernziel';
      break;
      case 'competence':
        route.title = 'Kompetenz';
      break;
      case 'goal.add':
        route.title = 'Lernziel erstellen';
        route.passProps = {...route.passProps, type: 'goals', inputTitle:'Lernziel eingeben'};
      break;
      case 'competence.add':
        route.title = 'Kompetenz hinzufügen';
        route.passProps = {...route.passProps, type: 'competences', inputTitle:'Kompetenz eingeben'};
      break;
      case 'user.login':
        route.title = 'Einloggen';
      break;
      case 'menu':
        route.title = 'Menü';
      break;
    }
    if(!navigator){
      return route;
    }
    if(!params){
      navigator.push(route);
    } else {
      if(params.replace)
        navigator.replace(route);
      if(params.reset)
        navigator.resetTo(route);
    }
  },
  renderRoute(route, navigator){
      route = this.route(route);
      return (<route.component navigator={navigator} title={route.title} {...route.passProps} />);
  },

}

module.exports = Router;
