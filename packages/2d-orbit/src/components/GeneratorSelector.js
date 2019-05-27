import React from 'react';
import ReactDOM from 'react-dom';
import './generator-selector.css';

export default class GeneratorSelector extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      active: false
    };

    this.handleClick = this.handleClick.bind(this);
    this.props.engine.on('generator:clear', () => this.setState({ active: false }));
  }

  handleClick() {
    this.props.engine.setGenerator(this.props.type);

    this.setState({
      active: true
    });
  }

  render() {
    return (
      <div
        className={this.state.active ? 'generator-active' : 'generator-inactive'}
        onClick={this.handleClick}
      >
        {this.props.type}
      </div>
    );
  }
}
