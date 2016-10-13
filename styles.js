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
var tabIconColor = '#AAA';
var white = '#FFF';
var gray = '#333';
var lightGray = '#EEE';
var topHeight = 50;
var iosTop = 64;

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
  tab:{
    flex:1,
    flexDirection:'column',
    backgroundColor: secondary,
    justifyContent:'center',
    paddingTop: 10,
    paddingBottom: 10,
  },
  tabActive:{
    backgroundColor:white
  },
  tabActiveText:{
    fontSize: 14,
    color: secondary,
  },
  otherBG:{
    paddingTop:10,
    backgroundColor:lightGray,
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
    flexDirection:'column'
  },
  nav: {
    flex: 1,
  },
  list: {
    flex:1,
    flexDirection:'column',
  },
  wrapper: {
    flex:1,
    flexDirection:'column',
    backgroundColor:'#FFF'
    //paddingTop:topHeight
    //paddingTop: ios ? iosTop : topHeight
  },
  viewWrapper: {//Does not work...
    flex:1,
    paddingTop: ios ? topHeight : topHeight
  },
  toolbar: {
    flex : 0,
    backgroundColor: primaryBG,
    height: topHeight,
    marginLeft:0,
    paddingTop:0,
    marginTop:0
  },
  androidView: {
    flex:1,
    marginTop:topHeight,
  },
  toolbarText:{
    height: topHeight,
    color:white,
    marginTop: -5,
    fontSize: 20
  },
  toolbarRight:{
    marginTop:-23,
    marginRight:0,
    padding: 20
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
  mt20:{
    marginTop:20
  },
  pt10:{
    paddingTop:10
  },
  row:{
    flex:0,
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
  },
  justify: {
    justifyContent:'center',
  },
  highlight:{
    color:secondary
  }
});
general.primary = primaryBG;
general.primaryBrighter = brighterPrimary;
general.secondary = secondary;
general.navBg = primaryBG;
general.navColor = '#FFF';
general.navBtnColor = '#FFF';
general.hoverBtn = secondaryBright;
general.tabIconColor = tabIconColor;

var list = StyleSheet.create({

  separator:{
    height: 1,
    backgroundColor:'#DDD',
  },
  withSeparator:{
    borderBottomColor:'#DDD',
    borderBottomWidth: 1,
  },
  li:{
    backgroundColor: '#FFF',
  },
  liHead:{
    backgroundColor: '#67B8D4',
  },
  liHead2:{
    backgroundColor: '#67D8D4',
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
    fontSize:16
  },
  text: {
    flex:1,
    alignSelf:'flex-start',
    fontSize: 18
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
    padding: 10
  },
  superTitle:{
    margin: 10,
    marginBottom:0,
  },
  sectionHead:{
    fontSize:18,
    //justifyContent:'center',
    color:primaryBG,
    //flexDirection:'row',
    alignSelf:'center',
    //flex:1
  },
  addBtn:{
    flex:1,
    alignSelf:'flex-end'
  },
  questionInput:{
    flex:1,
    margin: ios ? 5 : 0,
    fontSize: 18,
    height: 100,
    borderWidth:0,
    borderRadius: 0,
    borderColor:'#CCC',
    color:'#FFF',
    padding:10,
    //backgroundColor:'none'
  },
  titleInput:{
    margin: ios ? 10 : 0,
    fontSize: 18,
    height: 100,
    borderWidth:1,
    borderRadius: 5,
    borderColor:'#EEE',
    padding:10,
    flex:1,
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
    marginLeft: ios ? 10 : 0,
    marginRight: ios ? 10 : 0,
  },
  commentInput: {
    fontSize: 16,
    padding:5,
    flex:1,
    flexDirection:'row',
    alignSelf: 'stretch',
  },
  addComment:{
    paddingTop:20,
    paddingBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    flex:1
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
    competenceGroup: 50,
    comment: 500,
    answer: 500
  },
  wrapper: general.wrapper,
};

module.exports = styles;
