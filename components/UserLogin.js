import React, {Component} from 'react';
import {
  TouchableHighlight,
  ListView,
  ScrollView,
  Text,
  TextInput,
  View,
  Platform,
  Alert,
  NavigatorIOS,
  ActivityIndicatorIOS,
  ProgressBarAndroid
} from 'react-native';

import {
  styles,
  Router,
  Loader,
  User,
  CompetenceList,
  InputScrollView
} from 'Lernreflex/imports';
/*Props need to contain a onLogin function which will be called after the login was successfull*/

class UserLogin extends Component{
  constructor(){
    super();
    this.state = {username:'', password:''};
    this.render = this.render.bind(this);
    this.tryLogin = this.tryLogin.bind(this);
  }

  tryLogin(){
    var user = new User(false);
    var _this = this;
    let username = this.state.username,
    password = this.state.password;
    console.log('TRY');
    this.setState({loggingIn:true});
    user.tryLogin(username, password)
      .done((d) => {
        if(!d){
          _this.setState({loggingIn:false, loggedIn:d});
          Alert.alert( 'Login fehlgeschlagen', 'Nutzer oder Passwort sind fehlerhaft.', [
            {text: 'Ok', onPress: () => this.refs.username.focus()}, ]);
          return false;
        }
        user.login(username, password).done(() => {
          _this.setState({loggingIn:false, loggedIn:d});
          this.props.onLogin();
        });
      });
  }

  componentDidMount(){
    this.unmounting = false;
  }

  componentWillUnmount(){
    this.unmounting = true;
  }

  setState(obj){
    if(this.unmounting) return;
    super.setState(obj);
  }

  _renderLoginButton(){
      if (!this.state.loggingIn) {
        if(!this.state.loggedIn) {
          return (
            <TouchableHighlight ref="loginButton" underlayColor={styles._.hoverBtn} style={styles._.button} onPress={() => this.tryLogin()}>
              <Text style={[styles._.buttonText, styles._.big]}>Einloggen</Text>
            </TouchableHighlight>
          );
        } else return false;
      } else {
          return <Loader color="#FFF" />
      }
  }

  render(){
    var type = this.props.type;
    return <View style={styles.wrapper}>
        <InputScrollView style={styles.user.login}>
        <TextInput
          ref="username"
          onChangeText={(username) => this.setState({username})}
          value={this.state.username}
          style={styles.user.textInput}
          keyboardType="email-address"
          onSubmitEditing={(event) => {
            this.refs.password.focus();
          }}
          autoCorrect={false}
          editable={!this.state.loggingIn}
          autoCapitalize="none"
          autoFocus={true}
          placeholder='Nutzername'>
        </TextInput>
        <TextInput
          ref="password"
          onChangeText={(password) => this.setState({password})}
          value={this.state.password}
          secureTextEntry={true}
          editable={!this.state.loggingIn}
          style={[styles.user.textInput, styles.user.passwordInput]}
          onSubmitEditing={(event) => {
            this.tryLogin();
          }}
          placeholder='Passwort'>
        </TextInput>
        {this._renderLoginButton()}
      </InputScrollView>
    </View>
  }
}

module.exports = UserLogin;
