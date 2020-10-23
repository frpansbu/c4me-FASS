import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { Modal, Button, Row, Col } from 'react-materialize';
import { firestoreConnect } from 'react-redux-firebase';
import firebase, {db} from '../../firebase';
import ProfileInput from './ProfileInput';
import CollegeInput from './CollegeInput';
import ScoreInput from './ScoreInput';
import { Redirect } from 'react-router-dom';
import SelectInput from './SelectInput';
import { text } from './../../resources/colleges.json'

class UserProfileScreen extends React.Component {
  constructor(props){
    super(props);

    console.log(text);
    this.n = []
    let length = 10; // user defined length

    for(let i = 0; i < length; i++) {
        this.n.push(0);
    }
    this.collegesArray = text.split(/\r?\n/);
    console.log(this.collegesArray);
    this.value = null;
    this.applyArray = {};
    this.locked = false;
    this.disabled = false;
    this.enabled = true;
    this.isPassword = "password";
    this.validData = true;
    this.collegeData = new Object();
    this.collegeData = {
      HarvardUniversity : {
        satMath25: null,
        satMath75: null,
        satEBRW25: 730,
        satEBRW75: 790,
        actComposite25: 32,
        actComposite75: 35
      },
      StonyBrookUniversity : {
        satMath25: 620,
        satMath75: 730,
        satEBRW25: 590,
        satEBRW75: 680,
        actComposite25: 26,
        actComposite75: 31
      },
      KalamazooCollege : {
        satMath25: 580,
        satMath75: 690,
        satEBRW25: 600,
        satEBRW75: 690,
        actComposite25: 26,
        actComposite75: 30
      }
    }
    console.log(this.collegeData);
  }
  
  state = {
    classNumbers: ["2020","2021","2022","2023","2024","2025","2026","2027","2028","2029","2030","2031"],
    majorsList: ["Accounting","Architecture","Art","Biochemistry","Biology","Chemistry","Computer Science","Economics","Engineering","English","Environmental Studies","Graphic Design","History","Law","Linguistics","Mathematics","Music","Nursing","Philosophy","Physics","Political Science","Pre Med","Psychology","Religion","Teaching"],
    states: [ 'AL', 'AK', 'AS', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FM', 'FL', 'GA', 'GU', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MH', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'MP', 'OH', 'OK', 'OR', 'PW', 'PA', 'PR', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VI', 'VA', 'WA', 'WV', 'WI', 'WY' ],
    email: '',
    password: '',
    locked: false
  }

  handleChange = (e) => {
    const { target } = e;
    document.querySelector("#"+target.id).classList.remove("invalid");

    this.setState(state => ({
      ...state,
      [target.id]: target.value,
    }));
  }

  componentDidMount(){
  }

  checkGPA(){
    let tvalue = document.querySelector("#gpa").value;
    let fieldValid = true;
    let value = 1;
    if (tvalue){
      if (tvalue < 0){
        fieldValid = false;
      }
      if (tvalue > 5){
        fieldValid = false;
      }
    }
    else{
      value = 0;
    }
    if (fieldValid === false){
      document.querySelector("#gpa").classList.add("invalid");
      this.validData = false;
    }
    return value;
  }

  checkACTScores(field){
    let tvalue = document.querySelector("#"+field).value;
    let fieldValid = true;
    let value = 1;
    if (tvalue){
      if (!Number.isInteger(parseFloat(tvalue))){
        fieldValid = false;
      }
      if (tvalue < 0){
        fieldValid = false;
      }
      if (tvalue > 40){
        fieldValid = false;
      }
    }
    else{
      value = 0;
    }
    if (fieldValid === false){
      document.querySelector("#"+field).classList.add("invalid");
      this.validData = false;
    }
    return value;
  }

  checkSATScores(field){
    let tvalue = document.querySelector("#"+field).value;
    let fieldValid = true;
    let value = 1;
    if (tvalue){
      if (tvalue%10 != 0){
        fieldValid = false;
      }
      if (tvalue < 0){
        fieldValid = false;
      }
      if (tvalue > 800){
        fieldValid = false;
      }
    }
    else{
      value = 0;
    }
    if (fieldValid === false){
      document.querySelector("#"+field).classList.add("invalid");
      this.validData = false;
    }
    return value;
  }

  handleSubmit = (e) => {
    e.preventDefault();
    console.log(this.state);
    this.validData = true;

    // Check SAT and ACT Scores and GPA

    this.checkSATScores("satLiterature");
    this.checkSATScores("satUSHistory");
    this.checkSATScores("satWorldHistory");
    this.checkSATScores("satChemistry");
    this.checkSATScores("satPhysics");
    this.checkSATScores("satEcologicalBiology");
    this.checkSATScores("satMolecularBiology");
    this.checkSATScores("satMathI");
    this.checkSATScores("satMathII");


    this.checkACTScores("actReading");
    this.checkACTScores("actScience");
    this.checkACTScores("actMath");
    this.checkACTScores("actLiterature");

    // Filled Data must be > 0 in order to evaluate decisions
    let filledData = this.checkSATScores("satMath")+
                      this.checkSATScores("satEBRW")+
                      this.checkACTScores("actComposite")+
                      this.checkGPA();
                      
    // Check if any school decisions are the same.  If so, data invalid:
    let collegesSelected = [];
    for(let i=0; i<10; i++){
      if (document.getElementById("school"+i)){
        if (document.getElementById("school"+i).value === "0"){

        }
        else{
          let current = document.getElementById("school"+i).value;
          collegesSelected.forEach((selected)=>{
            if (current === selected){
              this.validData = false;
              document.getElementById("school"+i).classList.add("invalid");
            }
          })
          collegesSelected.push(current);
        }
      }
    }
    console.log(collegesSelected);

    if (this.validData){
      let scoresChanged = false;

      let questionableColleges = {};
      let approvedColleges = {};
      let decisionsRef = db.collection('QuestionableDecisions');
      let approvedRef = db.collection('ApprovedDecisions');
      let collegesRef = db.collection('Colleges');
      
      let tempAccount = this.props.profileInfo["Accounts"];
      let tempID = tempAccount[Object.keys(tempAccount)[0]].userID;

      let tempQuestionable = this.props.profileInfo["QuestionableDecisions"];
      let tempQInfo = tempQuestionable[Object.keys(tempQuestionable)[0]][tempID];

      let profileID = Object.keys(this.props.profileInfo["studentProfiles"])[0];
      let t1 = this.props.profileInfo["studentProfiles"];
      let t2 = t1[Object.keys(t1)[0]];
      console.log(t2);


      // First, check if any scores were changed.  If so, all decisions must be re-evaluated.
      if (document.getElementById("actComposite").value != t2.act_composite
        || document.getElementById("satMath").value != t2.sat_math
        || document.getElementById("satEBRW").value != t2.sat_ebrw
        || document.getElementById("gpa").value != t2.gpa){
          scoresChanged = true;
          console.log("Scores Changed");
      }

      // Remove user from all colleges they previously applied to (and was approved)
        Object.keys(t2.applied_colleges).forEach((college) => {
          let approvedSchoolName = college;
          approvedRef.doc(approvedSchoolName).update({
            [tempID]: firebase.firestore.FieldValue.delete(),
          })
          .then(function() {
            console.log("Deleting approved decisions...");
          })
          .catch(function(error) {
            console.log("Error getting documents: ");
          });
        })


      console.log("Valid Data: ",this.validData);
      if (this.validData && filledData > 0){
        for(let i=0; i<20; i++){
          if (document.querySelector("#school"+i)){
            if (document.getElementById("decision"+i)){

              // No College Selected
              if (document.getElementById("school"+i).value === "0"){
                document.querySelector("#questionable"+i).innerHTML = "No evaluation."
              }

              // College Selected
              else{
                let schoolName = document.querySelector("#school"+i).value;
                let schoolDecision = document.querySelector("#decision"+i).value;
                let parsedSchoolName = schoolName.replace(/\s/g, '');
                let sum = 0;
                console.log(schoolDecision);

                  db.collection("ScrapedCollegeData").where("name","==",schoolName)
                  .get()
                  .then(function(querySnapshot){
                    if (querySnapshot.size == 0){
                      console.log("Not Found");
                      sum = 4
                    }
                    else{
                      console.log("Found")



                      // Student says they were accepted
                      //  Acceptance Criteria: At least one comparable field, all comparable fields > 25% cutoffs
                      //  There are four fields to compare: SAT Math, SAT EBRW, GPA, ACT Composite.
                      //  Each comparison will return a value.
                      // 
                      //  Possible Return Values:
                      //      No comparable data: 1.1
                      //      Data above 25% threshold: 1
                      //      Data below 25% threshold: 0
                      // 
                      //  All return values will be summed together.
                      // 
                      //  Possible Outcomes:
                      //      (No evaluation) ALL fields have no comparable data: Sum has a decimal place of .4
                      //      (Questionable Acceptance) ONE field is not above the 25% threshold: Sum is < 4.
                      //      (Approved Acceptance) All comparable fields are above the 25% threshold: Sum is >= 4,
                      //                             but decimal place is < .4
                      // 
                      if (schoolDecision === "accepted"){
                        sum = 0;
                        querySnapshot.forEach(function(doc) {
                          let temp = doc.data();
                          let userFields = {
                            sat_Math: document.getElementById("satMath").value,
                            sat_Read: document.getElementById("satEBRW").value,
                            act_ENG: document.getElementById("actComposite").value
                          }
                          let fieldNames = ["sat_Math","sat_Read","act_ENG"];

                          fieldNames.forEach((field) => {
                            if (userFields[field]){
                              console.log(temp);
                              console.log(userFields[field]+"___________"+parseInt(temp[field+"25"]))
                      
                              // Check if school has this field.
                              if(temp[field+"25"]){
                                if (isNaN(parseInt(temp[field+"25"]))){
                                  // Not calculable
                                  sum = sum + 1.1
                                }
                                else{
                                  if (userFields[field] < parseInt(temp[field+"25"])){
                                    //Data is questionable
                                  }
                                  else{
                                    // Data is good.
                                    sum = sum+1
                                  }
                                }
                                
                              }
                              else{
                                // Data not calculable
                                sum = sum+1.1
                              }
                            }
                            else{
                              // Data not calculable
                              sum = sum+1.1
                            }
                          })
                          sum = sum+1.1
                          if (isNaN(parseInt(temp["sat_Math25"]))
                          && isNaN(parseInt(temp["sat_Read25"]))
                          && isNaN(parseInt(temp["act_ENG25"]))){
                            sum = 4;
                          }
                        })

                        let value = sum;
                        console.log(value);
                        console.log(Math.round(value%1 * 10) / 10);
                        // No data can be compared
                        if (Math.round(value%1 * 10) / 10 === .4){
                          document.querySelector("#questionable"+i).innerHTML = "No evaluation."
                        }
                        // Data is questionable, at least one field was below criteria
                        else if (value < 4){
                          document.querySelector("#questionable"+i).innerHTML = "Questionable."
                          // If scores weren't changed, check if this decision was changed before adding it to the list.
                          if (!scoresChanged){
                            if (tempQInfo){
                              if (!tempQInfo["colleges"][parsedSchoolName]
                              && Object.keys(t2.applied_colleges)[i] === document.getElementById("school"+i).value
                              && t2.applied_colleges[schoolName] === document.getElementById("decision"+i).value){
                                console.log("Nothing was changed, and decision was already approved.");
                                document.querySelector("#questionable"+i).innerHTML = "Questionable, but already approved.";
                                approvedColleges[schoolName] = "accepted";
                              }
                              else{
                                // Either the decision was not yet approved or the decision for that school was changed
                                // Check if the decision changed.  If not, keep current reviewed variable.  If it did, set reviewed to false.
                                if (Object.keys(t2.applied_colleges)[i] === document.getElementById("school"+i).value
                                && t2.applied_colleges[schoolName] === document.getElementById("decision"+i).value){
                                  questionableColleges[parsedSchoolName] = {
                                    name: schoolName,
                                    decision: "accepted",
                                    reviewed: tempQInfo["colleges"][parsedSchoolName]["reviewed"]
                                  }
                                }
                                else{
                                  questionableColleges[parsedSchoolName] = {
                                    name: schoolName,
                                    decision: "accepted",
                                    reviewed: false
                                  }
                                }
                                
                              }
                            }
                            else{
                              questionableColleges[parsedSchoolName] = {
                                name: schoolName,
                                decision: "accepted",
                                reviewed: false
                              }
                            }
                          }
                          else{
                            // Scores were changed, add to object of colleges that were questionable.  Reviewed is automatically false.
                            // questionableColleges[parsedSchoolName] = "accepted";
                            questionableColleges[parsedSchoolName] = {
                              name: schoolName,
                              decision: "accepted",
                              reviewed: false
                            }
                          }
                        }
                        // Data is good.  All comparable fields were within acceptance criteria.
                        else{
                          document.querySelector("#questionable"+i).innerHTML = "Approved."
                          approvedColleges[schoolName] = "accepted";
                        }
                      }



                      //Student says they were rejected.
                      //  Rejection Criteria: At least one comparable field, all fields < 75% grade cutoff
                      //  There are four fields to compare: SAT Math, SAT EBRW, GPA, ACT Composite.
                      //  Each comparison will return a value.
                      // 
                      //  Possible Return Values:
                      //      No comparable data: 1.1
                      //      Data above 75% threshold: 2
                      //      Data above 25% threshold: 1
                      //      Data below 25% threshold: -10
                      // 
                      //  All return values will be summed together.
                      // 
                      //  Possible Outcomes:
                      //      (No evaluation) ALL fields have no comparable data: Sum has a decimal place of .4
                      //      (Questionable Rejection) All comparable fields were above the 25% threshold
                      //                               and at least one field was above the 75% threshold: Sum is >= 5
                      //      (Approved Rejection 1) All comparable fields were above the 25% threshold,
                      //                              but none were above 75%: Sum is < 5
                      //      (Approved Rejection 2) At least one comparable field was below the 25% threshold:
                      //                            Sum is < 5 (despite any exceptional grades)
                      // 
                      else if (schoolDecision === "denied"){
                        sum = 0;
                        querySnapshot.forEach(function(doc) {
                          let temp = doc.data();
                          let userFields = {
                            sat_Math: document.getElementById("satMath").value,
                            sat_Read: document.getElementById("satEBRW").value,
                            act_ENG: document.getElementById("actComposite").value
                          }
                          let fieldNames = ["sat_Math","sat_Read","act_ENG"];

                          fieldNames.forEach((field) => {
                            if (userFields[field]){
                              // Check if school has these fields.  If not, add one and disregard.
                              if(temp[field+"25"] && temp[field+"75"]){
                                if (isNaN(parseInt(temp[field+"25"])) || isNaN(parseInt(temp[field+"75"]))){
                                  // Not calculable
                                  sum = sum + 1.1
                                }
                                else{
                                  if (userFields[field] >= parseInt(temp[field+"25"])){
                                    if(userFields[field] >= parseInt(temp[field+"75"])){
                                      // Surpasses expecations (at least one is necessary to reach a sum of 5)
                                      sum = sum+2;
                                    }
                                    else{
                                      // Data is good
                                      sum = sum+1
                                    }
                                  }
                                  else{
                                    // Data meets rejection criteria (By subtracting 10, no amount of exceptional scores can bring the sum back up to 5)
                                    sum = sum-10
                                  }
                                }
                              }
                              else{
                                // Not calculable
                                sum = sum + 1.1
                              }
                            }
                            else{
                              // Not calculable
                              sum = sum + 1.1
                            }
                          })
                          sum = sum+1.1
                          if (isNaN(parseInt(temp["sat_Math25"]))
                          && isNaN(parseInt(temp["sat_Read25"]))
                          && isNaN(parseInt(temp["act_ENG25"]))){
                            sum = 4;
                          }
                        })

                        let value = sum;
                        console.log(value);

                        // No data can be compared
                        if (Math.round(value%1 * 10) / 10 === .4){
                          document.querySelector("#questionable"+i).innerHTML = "No evaluation."
                        }

                        // Data is questionable.  All comparable fields were within acceptance criteria, and 1 was above 75% threshold.
                        else if (value >= 5){
                          document.querySelector("#questionable"+i).innerHTML = "Questionable."

                          // If scores weren't changed, check if this decisions was changed before adding it to the list.
                          if (!scoresChanged){
                            if (tempQInfo){
                              if (!tempQInfo["colleges"][parsedSchoolName]
                              && Object.keys(t2.applied_colleges)[i] === document.getElementById("school"+i).value
                              && t2.applied_colleges[schoolName] === document.getElementById("decision"+i).value){
                                console.log("Nothing was changed, and decision was already approved.");
                                document.querySelector("#questionable"+i).innerHTML = "Questionable, but already approved.";
                                approvedColleges[schoolName] = "denied";
                              }
                              else{
                                // Either the decision was not yet approved or the decision for that school was changed
                                // Check if the decision changed.  If not, keep current reviewed variable.  If it did, set reviewed to false.
                                if (Object.keys(t2.applied_colleges)[i] === document.getElementById("school"+i).value
                                && t2.applied_colleges[schoolName] === document.getElementById("decision"+i).value){
                                  questionableColleges[parsedSchoolName] = {
                                    name: schoolName,
                                    decision: "denied",
                                    reviewed: tempQInfo["colleges"][parsedSchoolName]["reviewed"]
                                  }
                                }
                                else{
                                  questionableColleges[parsedSchoolName] = {
                                    name: schoolName,
                                    decision: "denied",
                                    reviewed: false
                                  }
                                }
                                
                              }
                            }
                            else{
                              questionableColleges[parsedSchoolName] = {
                                name: schoolName,
                                decision: "accepted",
                                reviewed: false
                              }
                            }
                          }
                          else{
                            // Scores were changed, add to object of colleges that were questionable.
                            questionableColleges[parsedSchoolName] = {
                              name: schoolName,
                              decision: "denied",
                              reviewed: false
                            }
                          }
                        }

                        // Data is good.  At least one comparable field met rejection criteria.
                        else{
                          document.querySelector("#questionable"+i).innerHTML = "Approved."
                          approvedColleges[schoolName] = "denied";
                        }
                      }



                      // Student is pending, deferred, withdrawn or on waitlist.
                      else{
                        document.querySelector("#questionable"+i).innerHTML = "No Acceptance Decision Made."
                        approvedColleges[schoolName] = schoolDecision;
                      }

                      console.log(questionableColleges);
                      console.log(approvedColleges);


                      // Construct weighted avg
                      let Wsat_chemistry, Wsat_ebrw, Wsat_eco_bio, Wsat_literature, Wsat_math, Wsat_mathi, Wsat_mathii, Wsat_mol_bio, Wsat_physics, Wsat_us_hist, Wsat_world_hist, Wact = 0;

                      let totalSAT = 0;
                      let totalSATScore = 0;

                      if(document.getElementById("satChemistry").value){
                        Wsat_chemistry = parseInt(document.getElementById("satChemistry").value);
                        totalSAT = totalSAT+1;
                        totalSATScore = totalSATScore+Wsat_chemistry;}
                      if(document.getElementById("satEcologicalBiology").value){
                        Wsat_eco_bio = parseInt(document.getElementById("satEcologicalBiology").value);
                        totalSAT = totalSAT+1;
                        totalSATScore = totalSATScore+Wsat_eco_bio;}
                      if(document.getElementById("satLiterature").value){
                        Wsat_literature = parseInt(document.getElementById("satLiterature").value);
                        totalSAT = totalSAT+1;
                        totalSATScore = totalSATScore+Wsat_literature;}
                      if(document.getElementById("satMathI").value){
                        Wsat_mathi = parseInt(document.getElementById("satMathI").value);
                        totalSAT = totalSAT+1;
                        totalSATScore = totalSATScore+Wsat_mathi;}
                      if(document.getElementById("satMathII").value){
                        Wsat_mathii = parseInt(document.getElementById("satMathII").value);
                        totalSAT = totalSAT+1;
                        totalSATScore = totalSATScore+Wsat_mathii;}
                      if(document.getElementById("satMolecularBiology").value){
                        Wsat_mol_bio = parseInt(document.getElementById("satMolecularBiology").value);
                        totalSAT = totalSAT+1;
                        totalSATScore = totalSATScore+Wsat_mol_bio;}
                      if(document.getElementById("satPhysics").value){
                        Wsat_physics = parseInt(document.getElementById("satPhysics").value);
                        totalSAT = totalSAT+1;
                        totalSATScore = totalSATScore+Wsat_physics;}
                      if(document.getElementById("satUSHistory").value){
                        Wsat_us_hist = parseInt(document.getElementById("satUSHistory").value);
                        totalSAT = totalSAT+1;
                        totalSATScore = totalSATScore+Wsat_us_hist;}
                      if(document.getElementById("satWorldHistory").value){
                        Wsat_world_hist = parseInt(document.getElementById("satWorldHistory").value);
                        totalSAT = totalSAT+1;
                        totalSATScore = totalSATScore+Wsat_world_hist;}

                      let totalPercentage = totalSAT*.05;
                      let totalSA = 0;

                      if (document.getElementById("satEBRW").value && document.getElementById("satMath").value){
                        Wsat_ebrw = parseInt(document.getElementById("satEBRW").value);
                        Wsat_math = parseInt(document.getElementById("satMath").value);
                        totalSA = totalSA+2;
                      }
                      // if (document.getElementById("actComposite").value){
                      //   Wact = parseInt(document.getElementById("actComposite").value);
                      //   totalSA = totalSA+1;
                      // }

                      let weightedAvg = 0;
                      weightedAvg = ((Wsat_chemistry+Wsat_ebrw+Wsat_eco_bio+Wsat_literature+Wsat_math+Wsat_mathi+Wsat_mathii+Wsat_mol_bio+Wsat_physics+Wsat_us_hist+Wsat_world_hist)/totalSAT)*totalPercentage;
                      weightedAvg = weightedAvg + ((Wsat_ebrw + Wsat_math + Wact)/totalSA)*(1-totalPercentage);



                      // Update all approved colleges onto the DB along with relevant info about the student
                      Object.keys(approvedColleges).forEach((college)=>{
                        approvedRef.doc(college).set({
                          [tempID]: {
                            decision: approvedColleges[college],
                            gpa: parseFloat(document.getElementById("gpa").value),
                            sat_math: parseInt(document.getElementById("satMath").value),
                            sat_ebrw: parseInt(document.getElementById("satEBRW").value),
                            act_composite: parseInt(document.getElementById("actComposite").value),
                            college_class: (document.getElementById("classOf").value) ? (parseInt(document.getElementById("classOf").value)) : (null),
                            high_school_name: (document.getElementById("highSchool").value) ? (document.getElementById("highSchool").value) : (null),
                            weighted_avg: weightedAvg,
                          }}, { merge: true}
                        )
                        .then(function() {
                          console.log("Document successfully written!");
                        })
                        .catch(function(error) {
                            console.error("Error writing document: ", error);
                        });
                      })

                      // Update all questionable colleges onto the DB along with relevant info about the student
                      decisionsRef
                      .get()
                      .then(function(querySnapshot) {
                          querySnapshot.forEach(function(doc) {
                              let temp = doc.data();
                              console.log(temp);
                              db.collection('QuestionableDecisions').doc(doc.id).update({
                                [tempID]: {
                                  colleges: questionableColleges,
                                  gpa: parseFloat(document.getElementById("gpa").value),
                                  sat_math: parseInt(document.getElementById("satMath").value),
                                  sat_ebrw: parseInt(document.getElementById("satEBRW").value),
                                  act_composite: parseInt(document.getElementById("actComposite").value),
                                  college_class: (document.getElementById("classOf").value) ? (parseInt(document.getElementById("classOf").value)) : (null),
                                  high_school_name: (document.getElementById("highSchool").value) ? (document.getElementById("highSchool").value) : (null),
                                  weighted_avg: weightedAvg,
                                }
                              })
                          });
                      })
                      .catch(function(error) {
                          console.log("Error getting documents: ", error);
                      });
                    }
                  })
                }
              }

              // Either college or Decision was not selected.
              else{
                document.querySelector("#questionable"+i).innerHTML = "No evaluation."
              }
            }
          }
      }
      else{
        if (filledData == 0){
          console.log("Not enough Data");
        }
        else{
          console.log("Invalid Data.");
        }
      }


      // Construct array of applied colleges to save to the profile

      let appliedColleges = {};
      for (let i=0;i<10;i++){
        if(document.getElementById("school"+i)){
          if(document.getElementById("school"+i).value !=0){
            appliedColleges[document.getElementById("school"+i).value] = document.getElementById("decision"+i).value;
          }
        }
        else{

        }
      }

      console.log(appliedColleges);

      // Construct weighted avg
      let Wsat_chemistry, Wsat_ebrw, Wsat_eco_bio, Wsat_literature, Wsat_math, Wsat_mathi, Wsat_mathii, Wsat_mol_bio, Wsat_physics, Wsat_us_hist, Wsat_world_hist, Wact = 0;
      let totalSAT = 0;
      let totalSATScore = 0;

      console.log(document.getElementById("satChemistry").value);

      if(document.getElementById("satChemistry").value && document.getElementById("satChemistry").value.length != 0){
        console.log(document.getElementById("satChemistry").value);
        Wsat_chemistry = parseInt(document.getElementById("satChemistry").value);
        totalSAT = totalSAT+1;
        totalSATScore = totalSATScore+Wsat_chemistry;}
      if(document.getElementById("satEcologicalBiology").value && document.getElementById("satEcologicalBiology").value.length != 0){
        Wsat_eco_bio = parseInt(document.getElementById("satEcologicalBiology").value);
        totalSAT = totalSAT+1;
        totalSATScore = totalSATScore+Wsat_eco_bio;}
      if(document.getElementById("satLiterature").value && document.getElementById("satLiterature").value.length != 0){
        Wsat_literature = parseInt(document.getElementById("satLiterature").value);
        console.log(document.getElementById("satLiterature").value);
        totalSAT = totalSAT+1;
        totalSATScore = totalSATScore+Wsat_literature;}
      if(document.getElementById("satMathI").value && document.getElementById("satMathI").value.length != 0){
        Wsat_mathi = parseInt(document.getElementById("satMathI").value);
        totalSAT = totalSAT+1;
        totalSATScore = totalSATScore+Wsat_mathi;}
      if(document.getElementById("satMathII").value && document.getElementById("satMathII").value.length != 0){
        Wsat_mathii = parseInt(document.getElementById("satMathII").value);
        totalSAT = totalSAT+1;
        totalSATScore = totalSATScore+Wsat_mathii;}
      if(document.getElementById("satMolecularBiology").value && document.getElementById("satMolecularBiology").value.length != 0){
        Wsat_mol_bio = parseInt(document.getElementById("satMolecularBiology").value);
        totalSAT = totalSAT+1;
        totalSATScore = totalSATScore+Wsat_mol_bio;}
      if(document.getElementById("satPhysics").value && document.getElementById("satPhysics").value.length != 0){
        Wsat_physics = parseInt(document.getElementById("satPhysics").value);
        totalSAT = totalSAT+1;
        totalSATScore = totalSATScore+Wsat_physics;}
      if(document.getElementById("satUSHistory").value && document.getElementById("satUSHistory").value.length != 0){
        Wsat_us_hist = parseInt(document.getElementById("satUSHistory").value);
        totalSAT = totalSAT+1;
        totalSATScore = totalSATScore+Wsat_us_hist;}
      if(document.getElementById("satWorldHistory").value && document.getElementById("satWorldHistory").value.length != 0){
        Wsat_world_hist = parseInt(document.getElementById("satWorldHistory").value);
        totalSAT = totalSAT+1;
        totalSATScore = totalSATScore+Wsat_world_hist;}
      let totalPercentage = totalSAT*.05;
      let totalSA = 0;
      if (document.getElementById("satEBRW").value && document.getElementById("satEBRW").value.length != 0 && document.getElementById("satMath").value && document.getElementById("satMath").value.length != 0){
        Wsat_ebrw = parseInt(document.getElementById("satEBRW").value);
        Wsat_math = parseInt(document.getElementById("satMath").value);
        totalSA = totalSA+2;
      }
      // if (document.getElementById("actComposite").value){
      //   Wact = parseInt(document.getElementById("actComposite").value);
      //   totalSA = totalSA+1;
      // }

      console.log(Wsat_chemistry, Wsat_ebrw, Wsat_eco_bio, Wsat_literature, Wsat_math, Wsat_mathi, Wsat_mathii, Wsat_mol_bio, Wsat_physics, Wsat_us_hist, Wsat_world_hist, Wact);
      let weightedAvg = 0;
      if(totalSAT == 0){
        totalSAT = 1;
      }
      if(totalSA == 0){
        totalSA = 1;
      }
      if(Wsat_chemistry == undefined){
        Wsat_chemistry = 0
      }
      if(Wsat_ebrw == undefined){
        Wsat_ebrw = 0
      }
      if(Wsat_eco_bio == undefined){
        Wsat_eco_bio = 0
      }
      if(Wsat_literature == undefined){
        Wsat_literature = 0
      }
      if(Wsat_math == undefined){
        Wsat_math = 0
      }
      if(Wsat_mathi == undefined){
        Wsat_mathi = 0
      }
      if(Wsat_mathii == undefined){
        Wsat_mathii = 0
      }
      if(Wsat_mol_bio == undefined){
        Wsat_mol_bio = 0
      }
      if(Wsat_physics == undefined){
        Wsat_physics = 0
      }
      if(Wsat_us_hist == undefined){
        Wsat_us_hist = 0
      }
      if(Wsat_world_hist == undefined){
        Wsat_world_hist = 0
      }
      console.log(Wsat_chemistry, Wsat_ebrw, Wsat_eco_bio, Wsat_literature, Wsat_math, Wsat_mathi, Wsat_mathii, Wsat_mol_bio, Wsat_physics, Wsat_us_hist, Wsat_world_hist, Wact);
      console.log(totalSATScore);
      weightedAvg = ((Wsat_chemistry+Wsat_ebrw+Wsat_eco_bio+Wsat_literature+Wsat_math+Wsat_mathi+Wsat_mathii+Wsat_mol_bio+Wsat_physics+Wsat_us_hist+Wsat_world_hist)/totalSAT)*totalPercentage;
      console.log(weightedAvg);
      weightedAvg = weightedAvg + ((Wsat_ebrw + Wsat_math + Wact)/totalSA)*(1-totalPercentage);
      console.log(weightedAvg);




      // Finally, Update profile

      let temp2Account = tempAccount[(Object.keys(tempAccount)[0])];
      let tempProfile = {
        userid: temp2Account.userID,
        password: temp2Account.password,
        email: temp2Account.email,
        applied_colleges: appliedColleges,
        act_composite: (document.getElementById("actComposite").value) ? (parseInt(document.getElementById("actComposite").value)) : (null),
        act_english: (document.getElementById("actLiterature").value) ? (parseInt(document.getElementById("actLiterature").value)) : (null),
        act_math: (document.getElementById("actMath").value) ? (parseInt(document.getElementById("actMath").value)) : (null),
        act_reading: (document.getElementById("actReading").value) ? (parseInt(document.getElementById("actReading").value)) : (null),
        act_science: (document.getElementById("actScience").value) ? (parseInt(document.getElementById("actScience").value)) : (null),
        college_class: (document.getElementById("classOf").value) ? (parseInt(document.getElementById("classOf").value)) : (null),
        gpa: (document.getElementById("gpa").value) ? (parseFloat(document.getElementById("gpa").value)) : (null),
        high_school_city: (document.getElementById("highSchoolCity").value) ? (document.getElementById("highSchoolCity").value) : (null),
        high_school_name: (document.getElementById("highSchool").value) ? (document.getElementById("highSchool").value) : (null),
        high_school_state: (document.getElementById("highSchoolState").value) ? (document.getElementById("highSchoolState").value) : (null),
        major_1: (document.getElementById("majors").value) ? (document.getElementById("majors").value) : (null),
        major_2: (document.getElementById("major2").value) ? (document.getElementById("major2").value) : (null),
        num_ap_passed: (document.getElementById("numberofAPsPassed").value) ? (parseInt(document.getElementById("numberofAPsPassed").value)) : (null),
        residence_state: (document.getElementById("residenceState").value) ? (document.getElementById("residenceState").value) : (null),
        sat_chemistry:(document.getElementById("satChemistry").value) ? (parseInt(document.getElementById("satChemistry").value)) : (null),
        sat_ebrw:(document.getElementById("satEBRW").value) ? (parseInt(document.getElementById("satEBRW").value)) : (null),
        sat_eco_bio:(document.getElementById("satEcologicalBiology").value) ? (parseInt(document.getElementById("satEcologicalBiology").value)) : (null),
        sat_literature:(document.getElementById("satLiterature").value) ? (parseInt(document.getElementById("satLiterature").value)) : (null),
        sat_math:(document.getElementById("satMath").value) ? (parseInt(document.getElementById("satMath").value)) : (null),
        sat_math_i:(document.getElementById("satMathI").value) ? (parseInt(document.getElementById("satMathI").value)) : (null),
        sat_math_ii:(document.getElementById("satMathII").value) ? (parseInt(document.getElementById("satMathII").value)) : (null),
        sat_mol_bio:(document.getElementById("satMolecularBiology").value) ? (parseInt(document.getElementById("satMolecularBiology").value)) : (null),
        sat_physics: (document.getElementById("satPhysics").value) ? (parseInt(document.getElementById("satPhysics").value)) : (null),
        sat_us_hist: (document.getElementById("satUSHistory").value) ? (parseInt(document.getElementById("satUSHistory").value)) : (null),
        sat_world_hist: (document.getElementById("satWorldHistory").value) ? (parseInt(document.getElementById("satWorldHistory").value)) : (null),
        weighted_avg: weightedAvg,
      };
      console.log(tempProfile);
      db.collection('studentProfiles').doc(profileID).update({
        userid: temp2Account.userID,
        password: temp2Account.password,
        email: temp2Account.email,
        applied_colleges: appliedColleges,
        act_composite: (document.getElementById("actComposite").value) ? (parseInt(document.getElementById("actComposite").value)) : (null),
        act_english: (document.getElementById("actLiterature").value) ? (parseInt(document.getElementById("actLiterature").value)) : (null),
        act_math: (document.getElementById("actMath").value) ? (parseInt(document.getElementById("actMath").value)) : (null),
        act_reading: (document.getElementById("actReading").value) ? (parseInt(document.getElementById("actReading").value)) : (null),
        act_science: (document.getElementById("actScience").value) ? (parseInt(document.getElementById("actScience").value)) : (null),
        college_class: (document.getElementById("classOf").value) ? (parseInt(document.getElementById("classOf").value)) : (null),
        gpa: (document.getElementById("gpa").value) ? (parseFloat(document.getElementById("gpa").value)) : (null),
        high_school_city: (document.getElementById("highSchoolCity").value) ? (document.getElementById("highSchoolCity").value) : (null),
        high_school_name: (document.getElementById("highSchool").value) ? (document.getElementById("highSchool").value) : (null),
        high_school_state: (document.getElementById("highSchoolState").value) ? (document.getElementById("highSchoolState").value) : (null),
        major_1: (document.getElementById("majors").value) ? (document.getElementById("majors").value) : (null),
        major_2: (document.getElementById("major2").value) ? (document.getElementById("major2").value) : (null),
        num_ap_passed: (document.getElementById("numberofAPsPassed").value) ? (parseInt(document.getElementById("numberofAPsPassed").value)) : (null),
        residence_state: (document.getElementById("residenceState").value) ? (document.getElementById("residenceState").value) : (null),
        sat_chemistry:(document.getElementById("satChemistry").value) ? (parseInt(document.getElementById("satChemistry").value)) : (null),
        sat_ebrw:(document.getElementById("satEBRW").value) ? (parseInt(document.getElementById("satEBRW").value)) : (null),
        sat_eco_bio:(document.getElementById("satEcologicalBiology").value) ? (parseInt(document.getElementById("satEcologicalBiology").value)) : (null),
        sat_literature:(document.getElementById("satLiterature").value) ? (parseInt(document.getElementById("satLiterature").value)) : (null),
        sat_math:(document.getElementById("satMath").value) ? (parseInt(document.getElementById("satMath").value)) : (null),
        sat_math_i:(document.getElementById("satMathI").value) ? (parseInt(document.getElementById("satMathI").value)) : (null),
        sat_math_ii:(document.getElementById("satMathII").value) ? (parseInt(document.getElementById("satMathII").value)) : (null),
        sat_mol_bio:(document.getElementById("satMolecularBiology").value) ? (parseInt(document.getElementById("satMolecularBiology").value)) : (null),
        sat_physics: (document.getElementById("satPhysics").value) ? (parseInt(document.getElementById("satPhysics").value)) : (null),
        sat_us_hist: (document.getElementById("satUSHistory").value) ? (parseInt(document.getElementById("satUSHistory").value)) : (null),
        sat_world_hist: (document.getElementById("satWorldHistory").value) ? (parseInt(document.getElementById("satWorldHistory").value)) : (null),
        weighted_avg: weightedAvg,
      });
      this.forceUpdate();
    }
    else{
      alert("Invalid Data.  Unable to Save Changes");
    }
  }


  removeCollege = (e) => {
    
  }

  addCollege = (e) => {

  }

  updateState(field,value){
    this.setState({field,value});
    console.log(this.state);
  }

  addProfile(temp2Account){
    // Locking here prevents multiple renders from triggering student profile generation
    if(!this.state.locked){
      this.setState({locked:true});
      db.collection('studentProfiles').add({
        userid: temp2Account.userID,
        password: temp2Account.password,
        email: temp2Account.email,
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
      console.log("Student Profile Succesfully Created");
    }
  }

  updateAppliedColleges(data){
    let temp = Object.keys(data).length-10;
    if (!this.locked){
      this.locked = true;
      console.log(data);
      console.log(temp);
      if(temp >=1){
        for(let i = 0; i<temp; i++){
          this.n.push(0);
        }
      }
      for(let i = 0; i<20; i++){
        if (Object.keys(data)[i]){
          if (document.getElementById("school"+i)){
            document.getElementById("school"+i).value = Object.keys(data)[i];
            document.getElementById("decision"+i).value = data[Object.keys(data)[i]];
          }
        }
      }
    }
  }

  render() {
    const { auth, authError } = this.props;
    if (!auth.uid) {
      return <Redirect to="/" />;
    }

    let acc = this.props.location.info.accountInfo;
    console.log(acc);
    let acc2 = acc[(Object.keys(acc)[0])];
    let acc3 = acc2[(Object.keys(acc2)[0])];

    const profileInfo = this.props.profileInfo;
    let temp = profileInfo["studentProfiles"];
    let tempAccount = profileInfo["Accounts"];
    let temp2 = new Object();

    temp2 = {
      userid: null,
      password: null,
      email: null,
      residence_state: null,
      high_school_name: null,
      high_school_city: null,
      high_school_state: null,
      gpa: null,
      college_class: null,
      major_1: null,
      major_2: null,
      sat_math: null,
      sat_ebrw: null,
      act_english: null,
      act_math: null,
      act_reading: null,
      act_science: null,
      act_composite: null,
      sat_literature: null,
      sat_us_hist: null,
      sat_world_hist: null,
      sat_math_i: null,
      sat_math_ii: null,
      sat_eco_bio: null,
      sat_mol_bio: null,
      sat_chemistry: null,
      sat_physics: null,
      num_ap_passed: null,
      applied_colleges: null
    }
    let temp2Account = new Object();
    temp2Account = {
      email: null,
      firstName: null,
      lastName: null,
      password: null,
      userID: null
    }
    if(temp){
      temp2 = temp[(Object.keys(temp)[0])];
    }

    if (temp2.applied_colleges){
      this.updateAppliedColleges(temp2.applied_colleges);
    }

    console.log(temp2);
    if(tempAccount){
      temp2Account = tempAccount[(Object.keys(tempAccount)[0])];

      if(!temp){
        db.collection('studentProfiles').where("userid","==",temp2Account.userID)
        .get()
        .then((querySnapshot) => {
          if (querySnapshot.size == 0){
            this.addProfile(temp2Account);
          }
        });
      }
    }

    return (
      <div className="outlet profile-container">
        <form onSubmit={this.handleSubmit} className="profile-form white">
          <h5 className="profile-header-text">Edit Profile</h5>
            {/* General Information */}

            <ProfileInput
              handleChange = {this.handleChange.bind(this)}
              enabled={this.disabled}
              inputValue={temp2Account.userID}>User ID</ProfileInput>
            <ProfileInput
              handleChange = {this.handleChange.bind(this)}
              enabled={this.enabled}
              inputValue={[temp2Account.firstName]+" "+[temp2Account.lastname]}>Display Name</ProfileInput>
            <ProfileInput
              handleChange = {this.handleChange.bind(this)}
              enabled={this.disabled}
              inputValue={temp2Account.email}>Email</ProfileInput>
            <ProfileInput
              handleChange = {this.handleChange.bind(this)}
              enabled={this.enabled}
              inputValue={temp2.high_school_name}>High School</ProfileInput>
            <ProfileInput
              handleChange = {this.handleChange.bind(this)}
              enabled={this.enabled}
              inputValue={temp2.high_school_city}>High School City</ProfileInput>

            <SelectInput
              inputValue = {temp2.high_school_state}
              updateState = {this.updateState.bind(this)}
              handleChange = {this.handleChange.bind(this)}
              options = {this.state.states}
              smallDiv = {true}
            >High School State</SelectInput>

            <SelectInput
              inputValue = {temp2.residence_state}
              updateState = {this.updateState.bind(this)}
              handleChange = {this.handleChange.bind(this)}
              options = {this.state.states}
              smallDiv = {true}
            >Residence State</SelectInput>

            <SelectInput
              inputValue = {temp2.major_1}
              updateState = {this.updateState.bind(this)}
              handleChange = {this.handleChange.bind(this)}
              options = {this.state.majorsList}
            >Majors</SelectInput>

            <SelectInput
              inputValue = {temp2.major_2}
              updateState = {this.updateState.bind(this)}
              handleChange = {this.handleChange.bind(this)}
              options = {this.state.majorsList}
              hideLabel = {true}
            >Major 2</SelectInput>

            {/* Academic Statistics */}
            <div className="section">
              <Row className="profile-row">
                <Col>
                  <div className="profile-label">
                    Academic Statistics:
                  </div>
                </Col>
              </Row>
              <Row className="score-row">
                <Col s={4}>
                  <ScoreInput
                  handleChange = {this.handleChange.bind(this)}
                  inputValue={temp2.gpa}>GPA</ScoreInput>
                </Col>
                <Col s={4}>
                  <ScoreInput
                  handleChange = {this.handleChange.bind(this)}
                  inputValue={temp2.num_ap_passed}>Number of APs Passed</ScoreInput>
                </Col>
              </Row>
            </div>

            {/* SAT Scores */}
            <div className="section">
              <Row className="profile-row">
                <Col>
                  <div className="profile-label">
                    SAT Scores:
                  </div>
                </Col>
              </Row>

              <Row className="score-row">
                <Col s={4}>
                  <ScoreInput
                  handleChange = {this.handleChange.bind(this)}
                  inputValue={temp2.sat_math}>SAT Math</ScoreInput>
                </Col>
                <Col s={4}>
                  <ScoreInput
                  handleChange = {this.handleChange.bind(this)}
                  inputValue={temp2.sat_ebrw}>SAT EBRW</ScoreInput>
                </Col>
                <Col s={4}>
                  <ScoreInput
                  handleChange = {this.handleChange.bind(this)}
                  inputValue={temp2.sat_literature}>SAT Literature</ScoreInput>
                </Col>
              </Row>

              <Row className="score-row">
                <Col s={4}>
                  <ScoreInput
                  handleChange = {this.handleChange.bind(this)}
                  inputValue={temp2.sat_us_hist}>SAT US History</ScoreInput>
                </Col>
                <Col s={4}>
                  <ScoreInput
                  handleChange = {this.handleChange.bind(this)}
                  inputValue={temp2.sat_world_hist}>SAT World History</ScoreInput>
                </Col>
                <Col s={4}>
                  <ScoreInput
                  handleChange = {this.handleChange.bind(this)}
                  inputValue={temp2.sat_chemistry}>SAT Chemistry</ScoreInput>
                </Col>
              </Row>

              <Row className="score-row">
                <Col s={4}>
                  <ScoreInput
                  handleChange = {this.handleChange.bind(this)}
                  inputValue={temp2.sat_physics}>SAT Physics</ScoreInput>
                </Col>
                <Col s={4}>
                  <ScoreInput
                  handleChange = {this.handleChange.bind(this)}
                  inputValue={temp2.sat_eco_bio}>SAT Ecological Biology</ScoreInput>
                </Col>
                <Col s={4}>
                  <ScoreInput
                  handleChange = {this.handleChange.bind(this)}
                  inputValue={temp2.sat_mol_bio}>SAT Molecular Biology</ScoreInput>
                </Col>
              </Row>

              <Row className="score-row">
                <Col s={4}>
                  <ScoreInput
                  handleChange = {this.handleChange.bind(this)}
                  inputValue={temp2.sat_math_i}>SAT Math I</ScoreInput>
                </Col>
                <Col s={4}>
                  <ScoreInput
                  handleChange = {this.handleChange.bind(this)}
                  inputValue={temp2.sat_math_ii}>SAT Math II</ScoreInput>
                </Col>
                <Col s={4}>
                </Col>
              </Row>
            </div>

            {/* Act Scores */}
            <div className="section">
              <Row className="profile-row">
                <Col>
                  <div className="profile-label">
                    ACT Scores:
                  </div>
                </Col>
              </Row>
              <Row className="score-row">
                <Col s={4}>
                  <ScoreInput
                  handleChange = {this.handleChange.bind(this)}
                  inputValue={temp2.act_composite}>ACT Composite</ScoreInput>
                </Col>
                <Col s={4}>
                  <ScoreInput
                  handleChange = {this.handleChange.bind(this)}
                  inputValue={temp2.act_reading}>ACT Reading</ScoreInput>
                </Col>
                <Col s={4}>
                  <ScoreInput
                  handleChange = {this.handleChange.bind(this)}
                  inputValue={temp2.act_science}>ACT Science</ScoreInput>
                </Col>
              </Row>
              <Row className="score-row">
                <Col s={4}>
                  <ScoreInput
                  handleChange = {this.handleChange.bind(this)}
                  inputValue={temp2.act_math}>ACT Math</ScoreInput>
                </Col>
                <Col s={4}>
                  <ScoreInput
                  handleChange = {this.handleChange.bind(this)}
                  inputValue={temp2.act_english}>ACT Literature</ScoreInput>
                </Col>
                <Col s={4}>
                </Col>
              </Row>
            </div>
            

            {/* College Applications */}

            <Row className="profile-row">
              <Col>
                <div className="profile-label">
                  Applied Colleges:
                </div>
              </Col>
            </Row>

            {/* {temp2.applied_colleges ? (
              Object.entries(temp2.applied_colleges).map((decision,index) => {
                return <CollegeInput
                      options = {this.collegesArray}
                      inputValue = {decision}
                      updateState = {this.updateState.bind(this)}
                      handleChange = {this.handleChange.bind(this)}
                      removeCollege = {this.removeCollege.bind(this)}
                      optionIndex = {index}/>
              })
              ) : (
                <div></div>
              )} */}

            {(this.n).map((e, index)=>{
              return <CollegeInput
                      options = {this.collegesArray}
                      updateState = {this.updateState.bind(this)}
                      handleChange = {this.handleChange.bind(this)}
                      removeCollege = {this.removeCollege.bind(this)}
                      optionIndex = {index}/>
            })}


            <SelectInput
            inputValue = {temp2.college_class}
            updateState = {this.updateState.bind(this)}
            handleChange = {this.handleChange.bind(this)}
            options = {this.state.classNumbers}
            smallDiv = {true}
            >Class Of</SelectInput>
            {/* <Row className="profile-row">
              <Col s={2}>
                <div className="profile-label">
                  Class Of: 
                </div>
              </Col>
              <Col s={2}>
                <div className="profile-input">
                  <select className="active browser-default" name="collegeClass" id="collegeClass" onChange={this.props.handleChange}>
                    <option value="0"></option>
                    <option value="2020">2020</option>
                    <option value="2021">2021</option>
                    <option value="2022">2022</option>
                    <option value="2023">2023</option>
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                  </select>
                </div>
              </Col>
            </Row> */}

            <div className="input-field">
              <Row>
                <Col s={4}>
                  <button type="submit" className="btn-large green lighten-1 z-depth-0 profile-button">Save Changes</button>
                </Col>
              </Row>
            </div>
        </form>
      </div>
    );
  };
}

const mapStateToProps = (state) => {
  return {
      profileInfo: state.firestore.data,
      auth: state.firebase.auth,
  };
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
          let acc = props.location.info.accountInfo;
          let acc2 = acc[(Object.keys(acc)[0])];
          let acc3 = acc2[(Object.keys(acc2)[0])];
          console.log(acc3.userID);
          return [
          { collection: 'studentProfiles',
              where: ['userid', '==', acc3.userID]
          }, {collection: 'QuestionableDecisions'}];
      }
  }),
)(UserProfileScreen);


// Extra Info
      // if (scoresChanged){
      //   // Remove ALL decisions from this user from Questionable Decisions Docs.
      //   console.log(tempID);
      //   decisionsRef
      //   .get()
      //   .then(function(querySnapshot) {
      //       querySnapshot.forEach(function(doc) {
      //           // doc.data() is never undefined for query doc snapshots
      //           let temp = doc.data();
      //           console.log(temp);
      //           // First remove Student from all decision lists

      //           Object.keys(temp).forEach((student)=>{
      //             if (student === tempID){
      //               console.log("Found");
      //               db.collection('QuestionableDecisions').doc(doc.id).update({
      //                 [student]: {}
      //               })
      //             }
      //           });
      //       });
      //   })
      //   .catch(function(error) {
      //       console.log("Error getting documents: ", error);
      //   });
      // }


      // Remove decisions from this user from all colleges they applied to.
      // collegesRef.where("Name","==","test")
      // .get()
      // .then(function(querySnapshot) {
      //     querySnapshot.forEach(function(doc) {
      //         // doc.data() is never undefined for query doc snapshots
      //         console.log(doc.id, " => ", doc.data());
      //         let temp = doc.data().list;
      //         console.log(temp);
      //         // First remove Student from all college decision lists


      //         // db.collection('Colleges').doc(doc.id).update({
      //         //   list: {}
      //         // });

      //         // Then check if they should be added back to these college decision lists

      //     });
      // })
      // .catch(function(error) {
      //     console.log("Error getting documents: ", error);
      // });

      // Then check if they should be added back to these college decision lists

      // handleReview = (e) => {
      //   e.preventDefault();
      //   console.log(this.state);
      //   console.log(this.value);
      //   this.validData = true;
    
      //   // Check SAT and ACT Scores and GPA
    
      //   this.checkSATScores("satLiterature");
      //   this.checkSATScores("satUSHistory");
      //   this.checkSATScores("satWorldHistory");
      //   this.checkSATScores("satChemistry");
      //   this.checkSATScores("satPhysics");
      //   this.checkSATScores("satEcologicalBiology");
      //   this.checkSATScores("satMolecularBiology");
      //   this.checkSATScores("satMathI");
      //   this.checkSATScores("satMathII");
    
    
      //   this.checkACTScores("actReading");
      //   this.checkACTScores("actScience");
      //   this.checkACTScores("actMath");
      //   this.checkACTScores("actLiterature");
    
      //   this.checkGPA();
    
      //   let filledData = this.checkSATScores("satMath")+
      //                     this.checkSATScores("satEBRW")+
      //                     this.checkACTScores("actComposite");
    
      //   // Check at least one is filled and that all data is valid.
      //   console.log("Valid Data: ",this.validData);
      //   if (this.validData && filledData > 0){
      //     for(let i=0; i<10; i++){
      //       if (document.querySelector("#school"+i)){
      //         if (this.state["school"+i] && this.state["decision"+i]){
    
      //           // No College Selected
      //           if (this.state["school"+i] === "0"){
      //             document.querySelector("#questionable"+i).innerHTML = "No evaluation."
      //           }
    
      //           // College Selected
      //           else{
      //             let schoolName = document.querySelector("#school"+i).options[this.state["school"+i]].text;
      //             let schoolDecision = document.querySelector("#decision"+i).options[this.state["decision"+i]].text;
    
      //             // Student says they were accepted
      //             if (schoolDecision === "Accepted"){
      //               let value = this.compareScores(schoolName,"satMath", true)+
      //                           this.compareScores(schoolName,"satEBRW", true)+
      //                           this.compareScores(schoolName,"actComposite", true);
      //               console.log(value);
      //               console.log(Math.round(value%1 * 10) / 10);
      //               let parsedSchoolName = schoolName.replace(/\s/g, '');
    
      //               // No data can be compared
      //               if (Math.round(value%1 * 10) / 10 === .3){
      //                 console.log("hi");
      //                 document.querySelector("#questionable"+i).innerHTML = "No evaluation."
      //               }
    
      //               // Data is questionable, at least one field was below criteria
      //               else if (value < 3){
      //                 this.setState({[parsedSchoolName]: "questionable"});
      //                 document.querySelector("#questionable"+i).innerHTML = "Questionable."
      //               }
    
      //               // Data is good.  All comparable fields were within acceptance criteria.
      //               else{
      //                 this.setState({[parsedSchoolName]: "approved"});
      //                 document.querySelector("#questionable"+i).innerHTML = "Approved."
      //               }
      //             }
    
      //             //Student says they were rejected.
      //             else if (schoolDecision === "Rejected"){
      //               let value = this.compareScores(schoolName,"satMath", false)+
      //                           this.compareScores(schoolName,"satEBRW", false)+
      //                           this.compareScores(schoolName,"actComposite", false);
      //               console.log(value);
      //               let parsedSchoolName = schoolName.replace(/\s/g, '');
    
      //               // No data can be compared
      //               if (Math.round(value%1 * 10) / 10 === .3){
      //                 document.querySelector("#questionable"+i).innerHTML = "No evaluation."
      //               }
    
      //               // Data is questionable.  All comparable fields were within acceptance criteria, and 1 was above 75% threshold.
      //               else if (value > 3){
      //                 this.setState({[parsedSchoolName]: "questionable"});
      //                 document.querySelector("#questionable"+i).innerHTML = "Questionable."
      //               }
    
      //               // Data is good.  At least one comparable field met rejection criteria.
      //               else{
      //                 this.setState({[parsedSchoolName]: "approved"});
      //                 document.querySelector("#questionable"+i).innerHTML = "Approved."
      //               }
      //             }
    
      //             // Student is pending or on waitlist.
      //             else{
      //               document.querySelector("#questionable"+i).innerHTML = "No Acceptance Decision Made."
      //             }
      //           }
      //         }
    
      //         // Either college or Decision was not selected.
      //         else{
      //           document.querySelector("#questionable"+i).innerHTML = "No evaluation."
      //         }
      //       }
      //     }
      //   }
      //   else{
      //     if (filledData == 0){
      //       alert("Not enough Data");
      //     }
      //     else{
      //       alert("Invalid Data.");
      //     }
      //   }
      // }