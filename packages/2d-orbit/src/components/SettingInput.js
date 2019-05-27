import React from "react";
import ReactDOM from "react-dom";

var inputId = 0;

export default class SettingInput extends React.Component {
  constructor(props) {
    super(props);

    this.id = inputId++;
    this.formName = `form-${this.id}`;
    this.inputName = `input-label-${this.id}`;

    this.state = {
      value: props.target[props.setting]
    };

    this.onBlur = this.onBlur.bind(this);
    this.setValue = this.setValue.bind(this);

    props.target.on('setting:change:' + this.props.setting, this.setValue);
  }

  setValue(v) {
    if (v !== this.state.value) {
      this.setState({
        value: v
      });
    }
  }

  onBlur(e) {
    const v = e.currentTarget.value;

    if (v !== this.state.value) {
      this.props.target[this.props.setting] = v;
      this.setValue(v);
    }
  }

  render() {
    return (
      <div>
        <label htmlFor={this.inputName}>
          {this.props.label}
        </label>
        <input
          id={this.inputName}
          name={this.inputName}
          type="number"
          value={this.state.value}
          onChange={this.onBlur}
          onBlur={this.onBlur}
        />
      </div>
    );
  }
}
