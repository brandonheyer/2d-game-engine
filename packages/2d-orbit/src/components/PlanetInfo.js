import React from 'react';
import ReactDOM from 'react-dom';

import SettingInput from './SettingInput';

import './planet-info.css';

export default class PlanetInfo extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      planet: undefined
    };

    this.props.engine.on(
      'reporting:planet',
      planet => this.setState({ planet: planet })
    );
  }

  render() {
    if (this.state.planet) {
      return (
        <div className="planet-info info-panel info-panel-open">
          <SettingInput
            target={this.state.planet}
            setting={"mass"}
          />

          <SettingInput
            target={this.state.planet}
            setting={"speed"}
          />
        </div>
      );
    }

    return (<div className="info-panel info-panel-closed"></div>);
  }
}
