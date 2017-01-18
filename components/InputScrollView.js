import React, {
  Component,
} from 'react';
import {
  ScrollView,
  TextInput,
  Text,
  View,
  dismissKeyboard
} from 'react-native';

/**
 * Used in iOS to allow scrolling and tapping only once to change the input field.
 * Can be used analogously to a ScrollView.
 * @extends React.Component
 * @constructor
 */

class InputScrollView extends React.Component {

  constructor(props, ctx) {
      super(props, ctx);
      this.handleCapture = this.handleCapture.bind(this);
  }

  render() {
    return (
      <ScrollView ref="inputScrollView" style={this.props.style} keyboardShouldPersistTaps={true} keyboardDismissMode='on-drag'>
        <View onStartShouldSetResponderCapture={this.handleCapture}>
          {this.props.children}
        </View>
      </ScrollView>
    );
  }
  getScrollResponder(){
    return this.refs.inputScrollView.getScrollResponder();
  }

  handleCapture(e) {
    const focusField = TextInput.State.currentlyFocusedField();
    const target = e.nativeEvent.target;
    if (focusField != null && target != focusField){
      const inputs = this.props.inputs;
      if (inputs && inputs.indexOf(target) === -1) {
        dismissKeyboard();
      }
    }
  }
}

InputScrollView.propTypes = {
  inputs : React.PropTypes.array,
}

module.exports = InputScrollView;
