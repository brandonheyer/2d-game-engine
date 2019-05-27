import React from "react";
import ReactDOM from "react-dom";

export default class ActiveEntities extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      numEntities: props.engine.entities.length
    };

    this.onEntityChange = this.onEntityChange.bind(this);

    props.engine.on('entities:change', this.onEntityChange);
  }

  onEntityChange(count) {
    this.setState({
      numEntities: count
    });
  }

  render() {
    return (
      <div>{ this.state.numEntities }</div>
    );
  }
}
