import React from 'react';
import { Link } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { firebaseConnect } from 'react-redux-firebase';
import { logoutHandler } from '../../store/database/asynchHandler'
import { Modal, Button, Row, Col } from 'react-materialize';
import { firebase, db} from '../../firebase';

class LoggedIn extends React.Component {
  handleLogout = () => {
    const { firebase } = this.props;
    this.props.signOut(firebase);
    this.props.handleLogOutRefresh();
  }

  render() {
    const { accountInfo } = this.props;

    return (
      <div className="col s3 nav-main-menu-accounts">
        <div className="nav-account-item">
        <Link to={{pathname: "/user", info: {accountInfo}}}>
            <Button className="nav-login-button cyan lighten-3">
              <div  className="nav-account-text">Edit Profile</div>
            </Button>
          </Link>
        </div>
        <div className="nav-account-item">
          <NavLink to="/" onClick={this.handleLogout}>
            <Button className="nav-register-button red accent-2">
              <div  className="nav-account-text">Log Out</div>
            </Button>
          </NavLink>
        </div>
      </div>
    );
  };
}

const mapDispatchToProps = dispatch => ({
  signOut: firebase => dispatch(logoutHandler(firebase)),
});

export default compose(
  firebaseConnect(),
  connect(null, mapDispatchToProps),
)(LoggedIn);