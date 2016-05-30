'use strict';

var React = require('react-native');
var {
  AppRegistry,
  StyleSheet,
  Component,
  Text,
  View,
  NavigatorIOS,
  Navigator,
  ListView,
  TouchableHighlight,
  TouchableWithoutFeedback,
} = React;

class FirstPage extends Component{
  _handleChangePage() {
    //this.props.toggleNavBar(); // should hide the navigator
    this.props.navigator.push({
      title: 'Second Page',
      component: SecondPage,
    });

  }

  render() {
    return (
      <View>
        <Text>FirstPage</Text>

        <TouchableWithoutFeedback onPress={this._handleChangePage}>
          <View style={styles.button}>
            <Text style={styles.buttonText}>Go to SecondPage</Text>
          </View>
        </TouchableWithoutFeedback>
      </View>
    );
  }
}

var SecondPage = React.createClass({
  _handleChangePage() {
    //this.props.toggleNavBar(); // should show the navigator
    this.props.navigator.pop(); // yes it is the problem, the right action is show navigator
  },

  getInitialState(){
    var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    return {
      dataSource: ds.cloneWithRows(['row 1', 'row 2', 'row 3', 'row 4', 'row 5']),
    };
  },

  render() {
    return (

      <View>
        <ListView
          dataSource={this.state.dataSource}
          renderRow={(rowData) => <View>
            <TouchableHighlight>
              <View style={styles.row}>
                <Text>
                  {rowData}
                </Text>
              </View>
            </TouchableHighlight>
            <View style={styles.separator} />
          </View>}>
        </ListView>
        </View>
    );
  }
});

class SampleApp extends Component{

  render() {
    return (
      <NavigatorIOS ref='nav'
        tintColor='#000000'
        barTintColor='#584F60'
        itemWrapperStyle={styles.navWrap}
        style={styles.nav}
        initialRoute={{
           title: 'First Page',
           component: FirstPage,
        }} />
    );
  }
}

import styles from './styles';

AppRegistry.registerComponent('SampleApp', () => SampleApp);

module.exports = SampleApp;
