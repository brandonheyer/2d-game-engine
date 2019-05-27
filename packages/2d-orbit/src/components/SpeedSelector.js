import React from "react";
import ReactDOM from "react-dom";

export default class SpeedSelector extends React.Component {
  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.props.engine.setSpeedMultiplier(this.props.value);
  }

  render() {
    return (
      <div
        onClick={this.handleClick}
      >
        {this.props.value}
      </div>
    );
  }
}
