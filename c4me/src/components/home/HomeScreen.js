import React from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'redux';

class HomeScreen extends React.Component {

  render() {
    return (
      <div className="outlet home-container">
        <div className="white home-text">
          Welcome to c4me.
          <br />
          <br />
          <div className="home-flavor-text">
            Created by FASS:  Franky Pan, Amta Sulaiman, Shawn Felix, and Sean Spencer
          </div>
        </div>
      </div>
    );
  };
}

export default compose()(HomeScreen);