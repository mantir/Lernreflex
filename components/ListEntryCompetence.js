'use strict'
/*
* Rendert eine Zeile in einem Listview als Kompetenz
*/
import React, {
  Component,
} from 'react';
import {
  TouchableHighlight,
  ListView,
  Platform,
  Image,
  Text,
  View,
} from 'react-native';
import {styles, Icon, Router, Loader} from 'Lernreflex/imports';

/**
 * Holds the markup for several list elements ocurring on different views in this app.
 * To render a row, you need to pass a property rowData containing type = {one of the possible function names} without a leading _
 * In the future the markup for a row could be transfered back into the belonging class,
 * to make things more consistent
 * @extends React.Component
 * @constructor
 */

class ListEntryCompetence extends Component{
  constructor(){
    super();
  }

  /**
  * Markup for user row
  * @return {ReactNative.View}
  */
  _user(rowData){
    return <View>
      <View style={styles.list.rowContainer}>
        <View style={styles.list.textContainer}>
          <Icon name={Router.icons.person} size={30} color='#CCC' style={{flexDirection:'column', alignSelf:'flex-start', flex:1}} />
          <Text style={[styles.list.text, {flexDirection:'column', marginTop:5, flex:8}]}>
            {rowData.name} {rowData.id == 'mySelf' ? '(Ich)' : ''}
          </Text>
        </View>
      </View>
      <View style={styles.list.separator} />
    </View>
  }

  /**
  * Markup for badge row
  * @return {ReactNative.View}
  */
  _badge(rowData){
    return <View>
      <View style={styles.list.rowContainer}>
        <Image
          style={{height:50, width:50}}
          resizeMode='contain'
          source={{uri:rowData.png}}
          />
        <View style={styles.list.textContainer}>
          <Text style={styles.list.text}>
            {rowData.name}
          </Text>
          <Text style={styles.list.right}>
            {rowData.done ? <Image
              style={styles._.icon}
              resizeMode='cover'
              source={require('Lernreflex/img/checked.png')}
              /> : ''}
            </Text>
          </View>
        </View>
        <View style={styles.list.separator} />
      </View>
    }

    /**
    * Markup for comment row
    * @return {ReactNative.View}
    */
    _comment(rowData){
      let date = new Date(rowData.created);
      return <View>
        <View style={styles._.row}>
          <Text style={[styles.list.text, styles._.col, {color:'#CCC', fontSize:12, paddingLeft:10, paddingRight:10, paddingTop:10}]}>
            {rowData.user} - {date.getDate()}.{date.getMonth()}.{date.getFullYear()}, {date.getHours()}:{date.getMinutes()}
          </Text>
        </View>
        <View style={styles._.row}>
          <Text style={[styles.list.text, styles._.col, {paddingLeft:10, paddingRight:10, paddingBottom:10}]}>
            {rowData.text}
          </Text>
        </View>
        <View style={styles.list.separator} />
      </View>
    }

    /**
    * Markup for competence row
    * @return {ReactNative.View}
    */
    _competence(){
      return <View>
        <View style={styles.list.rowContainer}>
          <View style={styles.list.textContainer}>
            <Text style={styles.list.text}>
              {this.props.rowData.text}
            </Text>
            <Text style={styles.list.right}>
              {this.props.rowData.percent}%
            </Text>
          </View>
        </View>
        <View style={styles.list.separator} />
      </View>
    }

    /**
    * Markup for activity row
    * @return {ReactNative.View}
    */
    _activity(rowData){
      let isDone;
      if(rowData.done) isDone = <View style={styles.list.right, {justifyContent:'center', padding:5}}>
        <Image style={{width: 20, height: 20, justifyContent:'center', alignSelf:'center', flex:1}} resizeMode='contain' source={require('Lernreflex/img/checked.png')}></Image>
      </View>
      return <View style={styles._.col}>
        <View style={styles.list.rowContainer}>
          <View style={styles.list.textContainer}>
            <Text style={styles.list.text}>
              {rowData.name}
            </Text>
            {isDone}
            <View style={styles.list.right, {justifyContent:'center', padding:5}}>
              <Icon name={Router.icons.comments} size={30} color='#222' style={{flexDirection:'column', justifyContent:'center', alignSelf:'center', flex:1}}></Icon>
            </View>
          </View>
        </View>

      </View>
    }

    /**
    * Markup for select list row
    * @return {ReactNative.View}
    */
    _select(rowData){
      if(typeof(rowData) != 'object') {
        rowData = {'id':false, value:rowData};
      }
      return <View style={styles._.col}>
        <View style={styles.list.rowContainer}>
          <View style={styles.list.textContainer}>
            <Text style={styles.list.text}>
              {rowData.value}
            </Text>
          </View>
        </View>
        <View style={styles.list.separator} />
      </View>
    }

    /**
    * Markup for user, at the top of a view, if it's different than the current user.
    * @return {ReactNative.View}
    */
    _currentUser(currentUser){
      return <View style={[styles._.row, {backgroundColor:styles._.secondary}]}>
        <Icon name={Router.icons.person} size={30} color='#FFF' style={{flexDirection:'column', marginLeft:20, alignSelf:'flex-start', flex:1}} />
        <Text style={[styles.list.headText, {flexDirection:'column', marginTop:4, flex:10}]}>
          {currentUser.name}
        </Text>
      </View>
    }

    /**
    * Render row by props.rowData.type
    * @return {React.Component}
    */
    render(){
      if(this.props.rowData == 'loader') {
        if(Platform.OS == 'ios') {
          return <View style={styles._.col}><Loader /></View>
        }
        return null;
      }
      if(this.props.rowData.id == 'empty') {
        return <View style={[styles._.row]}>
          <View style={[styles._.col, {alignItems: 'center'}]}>
            <Text style={{fontSize:18, padding:20, justifyContent: 'center', alignItems: 'center', alignSelf:'center'}}>
              {this.props.rowData.text}
            </Text>
          </View>
        </View>
      }
      this.type = this.props.rowData.type ? this.props.rowData.type : this.props.type;
      if(!this.props.rowData) throw this.constructor.name+' needs a "rowData" object as property for type '+this.type;
      return <TouchableHighlight
        underlayColor={this.props.underlayColor}
        onPress={this.props.onPress}
        style={this.props.style}>
        {this['_'+this.type](this.props.rowData)}
      </TouchableHighlight>
    }
  }

  module.exports = ListEntryCompetence;
