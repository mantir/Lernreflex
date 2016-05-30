'use strict'
import React, {
  StyleSheet,
  Platform
} from 'react-native';

var OS = Platform.OS;
var ios = OS == 'ios';
var primaryBG = '#3E6E7F';
var brighterPrimary = '#6cb9d4';
var secondary = '#EC7426';
var secondaryDark = '#ac5720';
var secondaryBright = '#f59150';
var white = '#FFF';
var gray = '#333';
var topHeight = 50;

var general = StyleSheet.create({
  button: {
    backgroundColor: secondary,
    justifyContent:'center',
    borderRadius: 5,
    padding: 10,
    margin: 10,
  },
  buttonActive:{
    backgroundColor:primaryBG
  },
  buttonText: {
    color: '#fff',
    alignSelf:'center'
  },
  big:{
    fontSize: 20
  },
  navWrap: {
    flex: 1,
    marginTop: 0
  },
  nav: {
    flex: 1,
  },
  list: {
    flex:1,
  },
  wrapper: {
    flex:1,
    //paddingTop: ios ? 0 : topHeight
  },
  toolbar: {
    flex : 1,
    backgroundColor: primaryBG,
    height: topHeight,
    marginLeft:0,
    paddingTop:0
  },
  actionBar: {
    backgroundColor: primaryBG,
    height: topHeight,
    marginTop:topHeight,
  },
  toolbarText:{
    height: topHeight,
    color:white,
    marginTop: -5,
    fontSize: 20
  },
  toolbarRight:{
    marginTop:-10,
    padding: 10
  },
  icon: {
    width: 20,
    height: 20
  },
  ml10:{
    marginLeft:10
  },
  mt10:{
    marginTop:10
  },
  row:{
    flex:1,
    flexWrap: 'wrap',
    alignItems: 'center',
    flexDirection:'row',
  },
  col:{
    flex:1,
    flexDirection:'column'
  },
  center:{
    alignSelf:'center'
  }
});
general.primary = primaryBG;
general.secondary = secondary;
general.navBg = primaryBG;
general.navColor = '#FFF';
general.navBtnColor = '#FFF';
general.hoverBtn = secondaryBright;

var list = StyleSheet.create({

  separator:{
    height: 1,
    backgroundColor:'#DDD',
  },
  li:{
    backgroundColor: '#FFF',
  },
  liHead:{
    backgroundColor: '#67B8D4',
  },
  right:{
    color: gray,
    alignItems:'flex-end',
    justifyContent: 'flex-end'
  },
  headText: {
    flex:1,
    color: '#FFF',
    alignSelf:'flex-start',
  },
  text: {
    flex:1,
    alignSelf:'flex-start',
  },
  textContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  rowContainer: {
    flexDirection: 'row',
    padding: 10,
  },
});
list.liHover = '#DDD';
list.liHeadHover =  general.navBg;

var competence = StyleSheet.create({
  title: {
    fontSize: 20,
    margin: 10
  },
  sectionHead:{
    fontSize: 16,
    color: secondary,
    margin: 10,
    paddingBottom:0
  },
  titleInput:{
    margin: ios ? 10 : 0,
    fontSize: 18,
    height: 100,
    borderWidth:1,
    borderRadius: 5,
    borderColor:'#EEE',
    padding:10,
  },
  input:{
    backgroundColor:'#FFF',
    height: 40,
    fontSize: 18,
    borderWidth: 1,
    borderColor: '#EEE',
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 10,
    borderRadius: 5,
    marginTop: 10,
    padding:10,
    flex: 1
  },
  tagItems:{
    flex:1,
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    flexDirection:'row',
  },
  tagItemsWrapper:{
    flex:1,
    flexDirection:'column'
  },
  tagItem:{
    padding:10,
    backgroundColor: secondary,
    marginLeft:10,
    marginTop:10
  },
  tagItemText:{
    color:'#FFF',
  },
  slider:{
    height: 40,
    margin:10,
  }
});

var user = StyleSheet.create({
  login:{
    backgroundColor:primaryBG
  },
  textInput: {
    backgroundColor:'#FFF',
    height: 40,
    fontSize: 18,
    borderWidth: 1,
    borderColor: '#EEE',
    marginLeft: 30,
    marginRight: 30,
    marginBottom: 10,
    borderRadius: 5,
    marginTop: 50,
    padding:10,
    flex: 1
  },
  passwordInput: {
    marginTop:5
  }
});


var styles = {
  _: general,
  list: list,
  comp: competence,
  user: user,
  max: {
    competenceTitle: 140,
    competenceCatchwords: 100,
    competenceGroup: 50
  },
  wrapper: general.wrapper,
};

module.exports = styles;
