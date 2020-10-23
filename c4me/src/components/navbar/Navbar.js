import React from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'redux';
import { Modal, Button, Row, Col } from 'react-materialize';
import { firebaseConnect } from 'react-redux-firebase';
import { connect } from 'react-redux';
import { firestoreConnect } from 'react-redux-firebase';
import { Redirect } from 'react-router-dom';
import LoggedIn from './LoggedIn';
import LoggedOut from './LoggedOut';

class Navbar extends React.Component {
  constructor(props){
    super(props);
    this.adminLoggedIn = false;
  }
  
  handleLogOutRefresh(){
    window.location.reload(); 
  }

  isDisabled(){
    if(this.props.auth.email == "franky.pan@stonybrook.edu" || this.props.auth.email == "sean.spencer@stonybrook.edu" 
    || this.props.auth.email == "amta.sulaiman@stonybrook.edu" || this.props.auth.email == "shawn.felix@stonybrook.edu"){
      //console.log("ADMIN");
      this.adminLoggedIn = true;
      return;
    }
    //console.log("NOT ADMIN");
    return { 
      //color: "white", 
      pointerEvents: 'none' };
  }

  render() {
    const { auth, profile } = this.props;

    if (this.props.auth.email == "franky.pan@stonybrook.edu" || this.props.auth.email == "sean.spencer@stonybrook.edu" 
    || this.props.auth.email == "amta.sulaiman@stonybrook.edu" || this.props.auth.email == "shawn.felix@stonybrook.edu") {
      this.adminLoggedIn = true;
    }

    const links = auth.uid ? <LoggedIn profile={profile}
                                        accountInfo={this.props.accountInfo}
                                        handleLogOutRefresh = {this.handleLogOutRefresh.bind(this)} /> : <LoggedOut
                                        />;

                                        console.log(this.props.accountInfo);
    return (
      <div>
        <div className="nav-shadow z-depth-4">
        </div>
        <div className="nav-wrapper">
          <div className="row">
            <div className="col s9 nav-main-menu">
              <div className="nav-logo">
              <Link to="/">
                <Button className="nav-home-button">
                  <div  className="nav-header-text">c4me</div>
                </Button>
              </Link>
              </div>
              <div className="nav-item">
                <Link to="/" className="nav-item-text">Home</Link>
              </div>
              <div className="nav-item">
                <Link to="/colleges" className="nav-item-text">College Search</Link>
              </div>
              <div className="nav-item">
                <Link to="/high_schools" className="nav-item-text">Similar High Schools</Link>
              </div>
              <div className="nav-item">
                {this.adminLoggedIn ?
                  (<Link to="/admin" className="nav-item-text" style={this.isDisabled()}>Admin Settings</Link>) :
                  (<div></div>)
                }
              </div>
            </div>
            {links}
          </div>
        </div>
      </div>
    );
  };
}

const mapStateToProps = (state) => {
  return {
    accountInfo: state.firestore.data,
    auth: state.firebase.auth,
    profile: state.firebase.profile
  }
};

export default compose(
  connect(mapStateToProps),
  firestoreConnect(props => {
    if (!props.auth.uid) 
    {
        return [];
    }
    else
    {
        return [
        { collection: 'Accounts',
            where: ['email', '==', props.auth.email]
        }];
    }
}),
)(Navbar);