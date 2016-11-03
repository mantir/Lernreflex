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
  UIManager,
  View,
  TouchableOpacity,
  Navigator,
  ScrollView,
  ToolbarAndroid,
  BackAndroid,
  Keyboard,
  Dimensions
} from 'react-native';
import TabNavigator from 'react-native-tab-navigator';

import Menu from 'Lernreflex/components/Menu';
import CompetenceView from 'Lernreflex/components/CompetenceView';
import BadgeList from 'Lernreflex/components/BadgeList';
import {styles, Router, User, UserLogin, Icon, CompetenceCreate, UserList, CompetenceList} from 'Lernreflex/imports';


var _navigator; // we fill this up upon on first navigation.

BackAndroid.addEventListener('hardwareBackPress', () => {
  if (_navigator.getCurrentRoutes().length === 1  ) {
     return false;
  }
  _navigator.pop();
  return true;
});

class Lernreflex extends Component {
  constructor(){
    super();
    this.position = 0;
    this.renderScene = this.renderScene.bind(this);
    this.routeMapper = {
      test: 4
    }
    this.systemName = Router.systemName;
    UIManager.setLayoutAnimationEnabledExperimental(true);
    this.afterCompetenceCreate = this.afterCompetenceCreate.bind(this);
    this.updateBadge = this.updateBadge.bind(this);

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
    this.state = {
      selectedTab: 'goals',
      keyboardIn: false
    };
    this.checkedLoggedIn = false;
    this.user.isLoggedIn().done((isIn) => {
      this.checkedLoggedIn = true;
      this.loggedIn = isIn;
      this.setState({loggedIn: isIn});
    });
    this.NavigationBarRouteMapper = {

      LeftButton: function(route, navigator, index, navState) {

        if((route.id == 'goals' || route.id == 'competences' || route.id == 'badges' || route.id == 'menu') && _this.state.loggedIn) {
          return <Text style={{paddingLeft:10, color:'#FFF'}}>{_this.state.loggedIn.username}</Text>
        }

        //var previousRoute = navState.routeStack[index - 1];
        return (
          null
        );
      },

      RightButton: function(route, navigator, index, navState) {
        let iconSize = 25;
        if(route.id == 'goals')
        return (
          <TouchableHighlight underlayColor={styles._.primary} style={styles._.toolbarRight}
            onPress={() => Router.route({
              id:'goal.add',
              component:CompetenceCreate,
              passProps: {
                afterCompetenceCreate: _this.afterCompetenceCreate
              }
            }, navigator)} >
            <Icon name="md-add" size={iconSize} color='#FFF' />
            </TouchableHighlight>
        );
        if(route.id == 'competences')
        return (
          <TouchableHighlight underlayColor={styles._.primary} style={styles._.toolbarRight} onPress={() => Router.route({id:'competence.add', component:CompetenceCreate}, navigator)} >
            <Icon name="md-add" size={iconSize} color='#FFF' />
          </TouchableHighlight>
        );
        if(route.id == 'goal' || route.id == 'competence' || route.id == 'activity')
        return (
          <TouchableHighlight underlayColor={styles._.primary} style={styles._.toolbarRight}
            onPress={route.onRightButtonPress}>
            <Icon name={Router.icons.community} size={iconSize} color='#FFF' />
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

  componentDidMount () {
    this.subscriptions = [
      Keyboard.addListener('keyboardDidShow', this.keyboardWillShow.bind(this)),
      Keyboard.addListener('keyboardDidHide', this.keyboardWillHide.bind(this))
    ];
  }

  componentWillUnmount () {
    this.subscriptions.forEach((sub) => {sub.remove()});
  }

  keyboardWillShow (e) {
    //console.log('KEYBOARD SHOW');
    this.setState({
      keyboardIn: true,
    })
  }

  keyboardWillHide (e) {
    //console.log('KEYBOARD HIDE');
    this.setState({
      keyboardIn: false,
    })
  }

  afterCompetenceCreate(){
    if(this.refs.navGoal) {
      //console.log(this.refs.navGoal.refs);
      this.refs.navGoal.refs.goals.afterCompetenceCreate();
    }
    if(this.refs.navComp)
      this.refs.navComp.refs.competences.afterCompetenceCreate();
  }

  updateBadge(n, ref){
    let o = {};
    o[ref+'Badge'] = n;
    this.setState(o);
  }

  onLogin(){
    this.loggedIn = true;
    this.setState({loggedIn: true});
    Router.route(this.initialRoute, _navigator, {reset:true});
  }

  onLogout(){
    this.loggedIn = false;
    this.setState({loggedIn: false});
    this.selectTab('goals');
    Router.route(this.loginRoute, _navigator, {reset:true});
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
    return <View style={styles._.androidView}>
      {Router.renderRoute(route, navigator)}
    </View>

  }

  _renderNavigator(route, ref){
    if(this.state.iconsLoaded < 1) { //Erst wenn das Icon geladen ist anzeigen
      return false;
    }
    route.leftButtonIcon = this.state.hamburgerIcon;
    route.onLeftButtonPress = () => {

    };
    let sceneStyle = this.state.keyboardIn ? {paddingBottom:0, marginBottom:0} : {};
    return <Navigator ref={ref}
      tintColor={styles._.navBtnColor}
      titleTextColor={styles._.navColor}
      barTintColor={styles._.navBg}
      sceneStyle={[styles._.navWrap, sceneStyle]}
      navigationBar={<Navigator.NavigationBar
        navigationStyles={Navigator.NavigationBar.StylesIOS}
        style={styles._.toolbar}
        title="Router"
        routeMapper={this.NavigationBarRouteMapper}
        />}
        renderScene={this.renderScene}
        initialRoute={route}>
      </Navigator>
  }

  selectTab(tab, navigatorRef){
    if(this.state.selectedTab == tab) {
      this.refs[navigatorRef].popToTop();
    }
    this.setState({
      selectedTab: tab,
    });
  }

  render() {
    if(!this.checkedLoggedIn) {
      return null
    }
    var initialRoute = this.initialRoute;
    if(!this.state.loggedIn) {
      return this._renderNavigator({
        title: this.systemName + ' Login',
        component: UserLogin,
        passProps: {
          onLogin: () => this.onLogin()
        }
      }, 'userLogin');
    }
    let iconSize = 27;
    let iconColor = styles._.tabIconColor;
    let tabBarStyle = {};
    let sceneStyle = {};
    if(this.state.keyboardIn) {
      tabBarStyle.height = 0;
      tabBarStyle.overflow = 'hidden';
      sceneStyle.paddingBottom = 0;
    }
    return (
      <TabNavigator
        style={{backgroundColor:'#FFF'}}
        sceneStyle={sceneStyle}
        tabBarStyle={tabBarStyle}
        barTintColor="white">
        <TabNavigator.Item
          renderIcon={() => <Icon name={Router.icons.goals} size={iconSize} color={iconColor} />}
          renderSelectedIcon={() => <Icon name={Router.icons.goals} size={iconSize} color={styles._.secondary} />}
          selected={this.state.selectedTab === 'goals'}
          onPress={() => {
            this.selectTab('goals', 'navGoal');
          }}>
          {this._renderNavigator({
            id:'goals',
            title: 'Lernziele',
            component: CompetenceList,
            passProps: {
              ref: 'goals',
              type:'goals',
              updateBadge: this.updateBadge.bind(this)
            }
          }, 'navGoal')}
        </TabNavigator.Item>
        <TabNavigator.Item
          id='badges'
          badgeText={this.state.badgesBadge > 0 ? this.state.badgesBadge : undefined}
          renderIcon={() => <Icon name={Router.icons.badges} size={iconSize} color={iconColor} />}
          renderSelectedIcon={() => <Icon name={Router.icons.badges} size={iconSize} color={styles._.secondary} />}
          selected={this.state.selectedTab === 'badges'}
          onPress={() => {
            this.selectTab('badges', 'navBadge');
          }}>
          {this._renderNavigator({
            id:'badges',
            title: 'Abzeichen',
            component: BadgeList,
            passProps: {
              updateBadge: this.updateBadge
            }
          }, 'navBadge')}
        </TabNavigator.Item>
        <TabNavigator.Item
          id='competences'
          badgeText={this.state.competencesBadge > 0 ? this.state.competencesBadge : undefined}
          renderIcon={() => <Icon name={Router.icons.competences} size={iconSize} color={iconColor} />}
          renderSelectedIcon={() => <Icon name={Router.icons.competences} size={iconSize} color={styles._.secondary} />}
          selected={this.state.selectedTab === 'competences'}
          onPress={() => {
            this.selectTab('competences', 'navComp');
          }}>
          {this._renderNavigator({
            id:'competences',
            title: 'Erreicht',
            component: CompetenceList,
            passProps: {
              ref: 'competences',
              type: 'competences',
              updateBadge: this.updateBadge
            }
          }, 'navComp')}
        </TabNavigator.Item>
        <TabNavigator.Item
          id='menu'
          renderIcon={() => <Icon name={Router.icons.menu} size={iconSize} color={iconColor} />}
          renderSelectedIcon={() => <Icon name={Router.icons.menu} size={iconSize} color={styles._.secondary} />}
          selected={this.state.selectedTab === 'menu'}
          onPress={() => {
            this.selectTab('menu', 'navMenu');
          }}>
          {this._renderNavigator({
            id: 'menu',
            title: 'Menü',
            component: Menu,
            passProps: {
              onLogout: () => this.onLogout()
            }
          }, 'navMenu')}
        </TabNavigator.Item>
      </TabNavigator>
    );
    }
  }


  AppRegistry.registerComponent('Lernreflex', () => Lernreflex);
