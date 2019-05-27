import React from 'react';
import ReactDOM from 'react-dom';

import ActiveEntities from './ActiveEntities';
import GeneratorSelector from './GeneratorSelector';
import SpeedSelector from './SpeedSelector';
import SettingInput from './SettingInput';
import PlanetInfo from './PlanetInfo';

import { EngineContext } from '../AppEngine';

import './UI.css';

export default class UI extends React.Component {
  render() {
    return (
      <EngineContext.Consumer>
        {AppEngine => (
          <div className="ui">
            <div>
              <SettingInput
                label="GEE Value"
                setting="GEE"
                target={AppEngine.instance}
              > </SettingInput>
            </div>
            <div>
              <ActiveEntities style={{float: "left"}}
                engine={AppEngine.instance}
              > </ActiveEntities>

              <div className="generators" style={{float: "left"}}>
                <GeneratorSelector
                  engine={AppEngine.instance}
                  type="multi"
                />

                <GeneratorSelector
                  engine={AppEngine.instance}
                  type="small"
                />

                <GeneratorSelector
                  engine={AppEngine.instance}
                  type="massive"
                />
              </div>

              <div className="speeds" style={{float: "left"}}>
                <SpeedSelector value="0" engine={AppEngine.instance} />
                <SpeedSelector value="1" engine={AppEngine.instance} />
                <SpeedSelector value="2" engine={AppEngine.instance} />
                <SpeedSelector value="4" engine={AppEngine.instance} />
              </div>

              <PlanetInfo engine={AppEngine.instance} />
            </div>
          </div>
        )}
      </EngineContext.Consumer>
    );
  }
}
