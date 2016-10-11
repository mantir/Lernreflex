'use strict';

import React, {
  Component
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
  NavigatorIOS,
  TabBarIOS,
  Navigator,
  Image
} from 'react-native';

import BadgeList from 'Lernreflex/components/BadgeList';
import Menu from 'Lernreflex/components/Menu';
import UserLogin from 'Lernreflex/components/UserLogin';
import {styles, Router, CompetenceList, CompetenceCreate, User, Test, Icon} from 'Lernreflex/imports';
import UITest from 'Lernreflex/tests/UITest'

class Lernreflex extends Component {
  constructor(){
    super();
    this.state = {
      selectedTab: 'goals',
      notifCount: 0,
      presses: 0,
      iconsLoaded: 0,
      loggedIn: false,
      checkedLoggedIn: false
    };
    this.systemName = Router.systemName;
    this.user = new User();
    var _this = this;
    this.user.isLoggedIn().done((isIn) => {
      _this.setState({loggedIn: isIn, checkedLoggedIn:true});
    });
    this.afterCompetenceCreate = this.afterCompetenceCreate.bind(this);
    //this.test();
  }

  test(){
    this.render = () => {
      return <Test />;
    };
    /*this.render = () => {
      return <UITest />;
    };
  */}

  onLogin(){
    this.setState({loggedIn: true});
  }

  onLogout(){
    this.setState({loggedIn: false});
  }

  renderScene(route, navigator){
    return <View>
      {Router.renderRoute(route, navigator)}
    </View>
  }

    route(route, navigator){
      Router.route(route, navigator);
    }

    componentWillMount() {
      let icons = [
        //['md-menu', 'hamburgerIcon'],
        ['md-add']
      ];
      //Icon.getImageSource('md-menu', 30)
        //.then((source) => this.setState({ hamburgerIcon: source, iconsLoaded: this.state.iconsLoaded+1 }));
      Icon.getImageSource('md-add', 30)
        .then((source) => this.setState({ addIcon: source, iconsLoaded: this.state.iconsLoaded+1 }));

    }

    _renderNavigator(route, ref){
      if(this.state.iconsLoaded < 1) { //Erst wenn das Icon geladen ist anzeigen
        return false;
      }
      route.leftButtonIcon = this.state.hamburgerIcon;
      route.onLeftButtonPress = () => {

      };
      return <NavigatorIOS ref={ref}
        tintColor={styles._.navBtnColor}
        titleTextColor={styles._.navColor}
        barTintColor={styles._.navBg}
        itemWrapperStyle={styles._.navWrap}
        style={styles._.nav}
        navigationBarHidden={false}
        initialRoute={route}>
      </NavigatorIOS>
    }

    _renderContent(color, pageText, num) {
      return (
        <View style={[styles.tabContent, {backgroundColor: color}]}>
          <Text style={styles.tabText}>{pageText}</Text>
          <Text style={styles.tabText}>{num} re-renders of the {pageText}</Text>
        </View>
      );
    }

    afterCompetenceCreate(d){
      if(this.refs.navGoal)
        this.refs.navGoal.refs.goals.afterCompetenceCreate();
      if(this.refs.navComp)
        this.refs.navComp.refs.competences.afterCompetenceCreate();
    }

    render() {
      StatusBar.setBarStyle('light-content', true);
      var base64Icon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEsAAABLCAQAAACSR7JhAAADtUlEQVR4Ac3YA2Bj6QLH0XPT1Fzbtm29tW3btm3bfLZtv7e2ObZnms7d8Uw098tuetPzrxv8wiISrtVudrG2JXQZ4VOv+qUfmqCGGl1mqLhoA52oZlb0mrjsnhKpgeUNEs91Z0pd1kvihA3ULGVHiQO2narKSHKkEMulm9VgUyE60s1aWoMQUbpZOWE+kaqs4eLEjdIlZTcFZB0ndc1+lhB1lZrIuk5P2aib1NBpZaL+JaOGIt0ls47SKzLC7CqrlGF6RZ09HGoNy1lYl2aRSWL5GuzqWU1KafRdoRp0iOQEiDzgZPnG6DbldcomadViflnl/cL93tOoVbsOLVM2jylvdWjXolWX1hmfZbGR/wjypDjFLSZIRov09BgYmtUqPQPlQrPapecLgTIy0jMgPKtTeob2zWtrGH3xvjUkPCtNg/tm1rjwrMa+mdUkPd3hWbH0jArPGiU9ufCsNNWFZ40wpwn+62/66R2RUtoso1OB34tnLOcy7YB1fUdc9e0q3yru8PGM773vXsuZ5YIZX+5xmHwHGVvlrGPN6ZSiP1smOsMMde40wKv2VmwPPVXNut4sVpUreZiLBHi0qln/VQeI/LTMYXpsJtFiclUN+5HVZazim+Ky+7sAvxWnvjXrJFneVtLWLyPJu9K3cXLWeOlbMTlrIelbMDlrLenrjEQOtIF+fuI9xRp9ZBFp6+b6WT8RrxEpdK64BuvHgDk+vUy+b5hYk6zfyfs051gRoNO1usU12WWRWL73/MMEy9pMi9qIrR4ZpV16Rrvduxazmy1FSvuFXRkqTnE7m2kdb5U8xGjLw/spRr1uTov4uOgQE+0N/DvFrG/Jt7i/FzwxbA9kDanhf2w+t4V97G8lrT7wc08aA2QNUkuTfW/KimT01wdlfK4yEw030VfT0RtZbzjeMprNq8m8tnSTASrTLti64oBNdpmMQm0eEwvfPwRbUBywG5TzjPCsdwk3IeAXjQblLCoXnDVeoAz6SfJNk5TTzytCNZk/POtTSV40NwOFWzw86wNJRpubpXsn60NJFlHeqlYRbslqZm2jnEZ3qcSKgm0kTli3zZVS7y/iivZTweYXJ26Y+RTbV1zh3hYkgyFGSTKPfRVbRqWWVReaxYeSLarYv1Qqsmh1s95S7G+eEWK0f3jYKTbV6bOwepjfhtafsvUsqrQvrGC8YhmnO9cSCk3yuY984F1vesdHYhWJ5FvASlacshUsajFt2mUM9pqzvKGcyNJW0arTKN1GGGzQlH0tXwLDgQTurS8eIQAAAABJRU5ErkJggg==';
      if(!this.state.checkedLoggedIn) {
        return null
      }
      if(!this.state.loggedIn) {
        return this._renderNavigator({
          title: this.systemName + ' Login',
          component: UserLogin,
          passProps: {
            onLogin: () => this.onLogin()
          }
        }, 'userLogin');
      }
      var iconSize = 27;
      return (
        <TabBarIOS
          translucent={true}
          tintColor={styles._.secondary}
          unselectedTintColor={styles._.tabIconColor}
          barTintColor="white">
          <Icon.TabBarItemIOS
            iconSize={iconSize}
            iconName={Router.icons.goals}
            selected={this.state.selectedTab === 'goals'}
            onPress={() => {
              this.setState({
                selectedTab: 'goals',
              });
            }}>
            {this._renderNavigator({
              id:'goals',
              title: 'Lernziele',
              component: CompetenceList,
              rightButtonTitle: 'Hinzufügen',
              rightButtonIcon: this.state.addIcon,
              onRightButtonPress: () => this.route({
                id:'goal.add',
                component: CompetenceCreate,
                passProps: {
                  afterCreation: this.afterCompetenceCreate
                }
              }, this.refs.navGoal.navigator),
              passProps: {
                ref: 'goals',
                type:'goals'
              }
            }, 'navGoal')}
          </Icon.TabBarItemIOS>
          <Icon.TabBarItemIOS
            iconSize={iconSize}
            iconName={Router.icons.badges}
            selected={this.state.selectedTab === 'badges'}
            onPress={() => {
              this.setState({
                selectedTab: 'badges',
              });
            }}>
            {this._renderNavigator({
              title: 'Badges',
              component: BadgeList,
              passProps: {

              }
            }, 'nav2')}
          </Icon.TabBarItemIOS>
          <Icon.TabBarItemIOS
            iconSize={iconSize}
            iconName={Router.icons.notifications}
            badge={this.state.notifCount > 0 ? this.state.notifCount : undefined}
            selected={this.state.selectedTab === 'redTab'}
            onPress={() => {
              this.setState({
                selectedTab: 'redTab',
                notifCount: this.state.notifCount + 1,
              });
            }}>
            {this._renderContent('#783E33', 'Red Tab', this.state.notifCount)}
          </Icon.TabBarItemIOS>
          <Icon.TabBarItemIOS
            iconSize={iconSize}
            iconName={Router.icons.competences}
            selected={this.state.selectedTab === 'competences'}
            onPress={() => {
              this.setState({
                selectedTab: 'competences',
              });
            }}>
            {this._renderNavigator({
              title: 'Erreicht',
              component: CompetenceList,
              rightButtonTitle: 'Hinzufügen',
              rightButtonIcon: this.state.addIcon,
              onRightButtonPress: () => this.route({
                id:'competence.add',
                component: CompetenceCreate,
                passProps: {
                  afterCreation: this.afterCompetenceCreate
                }
              }, this.refs.navComp.navigator),
              passProps: {
                ref: 'competences',
                type: 'competences'
              }
            }, 'navComp')}
          </Icon.TabBarItemIOS>
          <Icon.TabBarItemIOS
            iconName={Router.icons.menu}
            iconSize={iconSize}
            selected={this.state.selectedTab === 'menu'}
            onPress={() => {
              this.setState({
                selectedTab: 'menu',
              });
            }}>
            {this._renderNavigator({
              id: 'menu',
              title: 'Menü',
              component: Menu,
              passProps: {
                onLogout: () => this.onLogout()
              }
            }, 'navMenu')}
          </Icon.TabBarItemIOS>
        </TabBarIOS>
      );
    }
}

AppRegistry.registerComponent('Lernreflex', () => Lernreflex);
