import React, {Component} from 'react';
import ReactNative, {
  TouchableHighlight,
  TouchableOpacity,
  ListView,
  ScrollView,
  Text,
  TextInput,
  Platform,
  View,
  Alert,
  NavigatorIOS,
  Picker
} from 'react-native';
import dismissKeyboard from 'dismissKeyboard'

import {
  styles,
  lib,
  Competence,
  LearningTemplate,
  User,
  Loader,
  InputScrollView,
  ListEntryCompetence
} from 'Lernreflex/imports';

class SelectList extends Component{
  constructor(){
    super();
    var ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2
    });
    this.state = {
      elements: [],
      filter: '',
      dataSource: ds,
      renderTheList: 0,
    };
    this.render = this.render.bind(this);
    this.renderRow = this.renderRow.bind(this);
    this.renderList = this.renderList.bind(this);
    this.forceUpdate = this.forceUpdate.bind(this);
  }

  createCompetence(){

  }

  componentDidMount(){
    this.setState({dataSource:this.state.dataSource.cloneWithRows(this.props.elements)});
    setTimeout(this.forceUpdate, 1000);
  }

  filterElements(filter){
    let { elements } = this.props;
    const regex = new RegExp(filter.trim(), 'i');
    let filteredElements = elements.filter(el => {
      if(typeof(el) == 'string') {
        el = {id:el, value:el};
      }
      if(!el.id) el.id = '';
      if(!el.value) el.value = '';
      return el.id.search(regex) >= 0 || el.value.search(regex) >= 0;
    });
    this.setState({filter:filter, dataSource:this.state.dataSource.cloneWithRows(filteredElements)});
  }

  renderRow(rowData){
    return <ListEntryCompetence
      type='select'
      underlayColor={styles.list.liHover}
      onPress={() => this.rowPressed(rowData)}
      rowData={rowData}
      style={styles.list.li} />
  }

  rowPressed(rowData){
    this.props.selected(rowData);
    dismissKeyboard();
    this.props.navigator.pop();
  }

  _scrollToBottom(refName) {
    var _this = this;
    if(Platform.OS != 'ios') return;
    setTimeout(() => {
      let scrollResponder = _this.refs.scroller.getScrollResponder();
      scrollResponder.scrollResponderScrollNativeHandleToKeyboard(
        ReactNative.findNodeHandle(_this.refs[refName]),
        10, //additionalOffset
        true
      );
    }, 1);
  }


  renderList(){
    if(this.state.renderTheList <= 1) {
      this.state.renderTheList = this.state.renderTheList + 1;
      return null;
    }
    return <View style={[styles._.row, {flex:1, alignItems:'flex-start'}]}>
      <ListView
        keyboardShouldPersistTaps={true}
        enableEmptySections={true}
        style={[styles._.list, {flex:1}]}
        dataSource={this.state.dataSource}
        renderRow={this.renderRow}>
      </ListView>
    </View>
  }

  render(){
    return <View style={styles.wrapper}>
      <View style={[styles._.row,{flex:0, marginTop:Platform.OS == 'ios' ? 80 : 0, height:50}]}>
      {/*onSubmitEditing={(event) => this.selected()}*/}
      <TextInput
        ref="filter"
        onChangeText={(filter) => this.filterElements(filter)}
        value={this.state.filter}
        autoCapitalize='none'
        autoCorrect={false}
        multiline={false}
        autoFocus={true}
        editable={!this.state.loading}
        style={[styles.comp.input]}
        placeholder={this.props.placeholder ? this.props.placeholder : 'Filter'}>
      </TextInput>
      </View>
      {this.renderList()}
    </View>
  }
}

module.exports = SelectList;
