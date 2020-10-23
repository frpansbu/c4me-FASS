import React from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'redux';
import { Modal, Button, Row, Col } from 'react-materialize';

class LoggedOut extends React.Component {

  render() {
    return (
      <div className="col s3 nav-main-menu-accounts">
        <div className="nav-account-item">
        <Link to="/login">
            <Button className="nav-login-button teal accent-3">
              <div  className="nav-account-text">Login</div>
            </Button>
          </Link>
        </div>
        <div className="nav-account-item">
          <Link to="/register">
            <Button className="nav-register-button cyan accent-3">
              <div  className="nav-account-text">Register</div>
            </Button>
          </Link>
        </div>
      </div>
    );
  };
}

export default compose()(LoggedOut);