import React, { Component } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import './App.css';

import Navbar from './components/navbar/Navbar.js';
import HomeScreen from './components/home/HomeScreen.js';
import UserProfileScreen from './components/user/UserProfileScreen.js';
import RegisterScreen from './components/register/RegisterScreen.js';
import LoginScreen from './components/login/LoginScreen.js';
import HighSchoolSearchScreen from './components/high_schools/HighSchoolSearchScreen.js';
import CollegeSearchScreen from './components/colleges/CollegeSearchScreen.js';
import CollegeInfoScreen from './components/colleges/CollegeInfoScreen.js';
import AdminScreen from './components/admin/AdminScreen.js';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { apiResponse: "" };
  }
  callAPI(){
    fetch("http://localhost:8000/api")
      .then(res => res.text())
      .then(res => this.setState({ apiResponse: res}));
  }
  componentWillMount() {
    this.callAPI();
  }
  
  render() {
      return (
        <BrowserRouter>
          <div className="App">
            <Navbar />
            <Switch>
              <Route exact path="/" component={HomeScreen} />
              <Route path="/user" component={UserProfileScreen} />
              <Route path="/register" component={RegisterScreen} />
              <Route path="/login" component={LoginScreen} />
              <Route path="/high_schools" component={HighSchoolSearchScreen} />
              <Route path="/colleges" component={CollegeSearchScreen} />
              <Route path="/college/:id" component={CollegeInfoScreen} />
              <Route path="/admin" component={AdminScreen} />
              <Route path="/:any" component={HomeScreen} />
            </Switch>
          </div>
        </BrowserRouter>
      );
    }
  }
  export default App;
