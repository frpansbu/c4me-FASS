import React from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'redux';

import firebase, { db } from "../../firebase"

class RegisterScreen extends React.Component {
  state = {
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    userId: ''
  }

  handleChange = (e) => {
    const { target } = e;

    this.setState(state => ({
      ...state,
      [target.id]: target.value,
    }));
  }

  handleSubmit = (e) => {
    e.preventDefault();
    var addToDB = true;
    var idUsed = false;
    let accsRef = db.collection('Accounts');
    //check if user id is taken
    const allAccs = accsRef.get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          console.log(this.state.userId);
          console.log(doc.data().userID);
          if(this.state.userId == doc.data().userID){
            idUsed = true;
            console.log("matched");
          }
        });
      })
      .then(() => {if(idUsed == true){
        alert("User ID has already been taken");
      }})
      .catch(err => {
        console.log('Error getting documents', err);
      })//after checking if id has been used, create user
      .then(() => {
        if(idUsed == false){
          firebase.auth().createUserWithEmailAndPassword(this.state.email, this.state.password)
          .catch(err =>{
            addToDB = false;
            alert(err.message);
          }).then( () => {
            if(addToDB){
              db.collection('Accounts').add({
                firstName: this.state.firstName,
                lastname: this.state.lastName,
                userID: this.state.userId,
                email: this.state.email,
                password: this.state.password
              })
            }
          }).then( () => {
            db.collection('studentProfiles').add({
              userid: this.state.userId,
              password: this.state.password,
              email: this.state.email,
              applied_colleges: {},
              act_composite: null,
              act_english: null,
              act_math: null,
              act_reading: null,
              act_science: null,
              college_class: null,
              gpa: null,
              high_school_city: null,
              high_school_name: null,
              high_school_state: null,
              major_1: null,
              major_2: null,
              num_ap_passed: null,
              residence_state:null,
              sat_chemistry:null,
              sat_ebrw:null,
              sat_eco_bio:null,
              sat_literature:null,
              sat_math:null,
              sat_math_i:null,
              sat_math_ii:null,
              sat_mol_bio:null,
              sat_physics: null,
              sat_us_hist: null,
              sat_world_hist: null
            })
            alert("Account Succesfully Created");
          }); 
        }
      });
      //
      
  }

  render() {
    return (
      <div className="outlet register-container">
        <form onSubmit={this.handleSubmit} className="col s4 white register-form">
            <h5 className="register-header-text">Register</h5>
            <div className="input-field">
              <label htmlFor="email">Email</label>
              <input type="email" name="email" id="email" onChange={this.handleChange} />
            </div>
            <div className="input-field">
              <label htmlFor="userId">User ID</label>
              <input type="text" name="userId" id="userId" onChange={this.handleChange} />
            </div>
            <div className="input-field">
              <label htmlFor="password">Password</label>
              <input type="password" name="password" id="password" onChange={this.handleChange} />
            </div>
            <div className="input-field">
              <label htmlFor="firstName">First Name</label>
              <input type="text" name="firstName" id="firstName" onChange={this.handleChange} />
            </div>
            <div className="input-field">
              <label htmlFor="lastName">Last Name</label>
              <input type="text" name="lastName" id="lastName" onChange={this.handleChange} />
            </div>
            <div className="input-field">
              <button type="submit" className="btn pink lighten-1 z-depth-0">Sign Up</button>
            </div>
          </form>
      </div>
    );
  };
}

export default compose()(RegisterScreen);