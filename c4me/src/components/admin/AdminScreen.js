import React from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'redux';
import { connect } from 'react-redux';
import firebase from '../../firebase';
import { firestoreConnect } from 'react-redux-firebase';
import { Redirect } from 'react-router-dom';

import CSVReader from 'react-csv-reader';

import { db } from "../../firebase"

class AdminScreen extends React.Component {
  state = {
    decisions: {},
    scrapeRes: "loaded"
  }

  handleFileLoad = (data) =>{
    console.log(data);
    data.forEach((datum)=>{

      // Construct weighted avg
      let Wsat_chemistry, Wsat_ebrw, Wsat_eco_bio, Wsat_literature, Wsat_math, Wsat_mathi, Wsat_mathii, Wsat_mol_bio, Wsat_physics, Wsat_us_hist, Wsat_world_hist, Wact = 0;

      let totalSAT = 0;
      let totalSATScore = 0;

      if(datum.sat_chemistry){
        Wsat_chemistry = datum.sat_chemistry;
        totalSAT = totalSAT+1;
        totalSATScore = totalSATScore+Wsat_chemistry;}
      if(datum.sat_eco_bio){
        Wsat_eco_bio = datum.sat_eco_bio;
        totalSAT = totalSAT+1;
        totalSATScore = totalSATScore+Wsat_eco_bio;}
      if(datum.sat_literature){
        Wsat_literature = datum.sat_literature;
        totalSAT = totalSAT+1;
        totalSATScore = totalSATScore+Wsat_literature;}
      if(datum.sat_math_i){
        Wsat_mathi = datum.sat_math_i;
        totalSAT = totalSAT+1;
        totalSATScore = totalSATScore+Wsat_mathi;}
      if(datum.sat_math_ii){
        Wsat_mathii = datum.sat_math_ii;
        totalSAT = totalSAT+1;
        totalSATScore = totalSATScore+Wsat_mathii;}
      if(datum.sat_mol_bio){
        Wsat_mol_bio = datum.sat_mol_bio;
        totalSAT = totalSAT+1;
        totalSATScore = totalSATScore+Wsat_mol_bio;}
      if(datum.sat_physics){
        Wsat_physics = datum.sat_physics;
        totalSAT = totalSAT+1;
        totalSATScore = totalSATScore+Wsat_physics;}
      if(datum.sat_us_hist){
        Wsat_us_hist = datum.sat_us_hist;
        totalSAT = totalSAT+1;
        totalSATScore = totalSATScore+Wsat_us_hist;}
      if(datum.sat_world_hist){
        Wsat_world_hist = datum.sat_world_hist;
        totalSAT = totalSAT+1;
        totalSATScore = totalSATScore+Wsat_world_hist;}

      let totalPercentage = totalSAT*.05;
      let totalSA = 0;

      if(datum.sat_ebrw && datum.sat_math){
        Wsat_ebrw = datum.sat_ebrw;
        Wsat_math = datum.sat_math;
        totalSA = totalSA+2;
      }
      // if(datum.act_composite){
      //   Wact = datum.act_composite;
      //   totalSA = totalSA+1;
      // }

      if(totalSAT == 0){
        totalSAT = 1;
      }
      if(totalSA == 0){
        totalSA = 1;
      }
      
      let weightedAvg = 0;
      weightedAvg = ((Wsat_chemistry+Wsat_ebrw+Wsat_eco_bio+Wsat_literature+Wsat_math+Wsat_mathi+Wsat_mathii+Wsat_mol_bio+Wsat_physics+Wsat_us_hist+Wsat_world_hist)/totalSAT)*totalPercentage;
      console.log(weightedAvg);
      weightedAvg = weightedAvg + ((Wsat_ebrw + Wsat_math + Wact)/totalSA)*(1-totalPercentage);


      db.collection("studentProfiles").where("userid","==",datum.userid.toLowerCase())
      .get()
      .then(function(querySnapshot){
        if (querySnapshot.size == 0){
          console.log("Not Found . . . Creating");
          db.collection("studentProfiles").add({
            userid: datum.userid.toLowerCase(),
            email: datum.userid.toLowerCase()+"@c4me.com",
            password: datum.password,
            residence_state: datum.residence_state,
            high_school_name: datum.high_school_name,
            high_school_city: datum.high_school_city,
            high_school_state: datum.high_school_state,
            gpa: datum.gpa,
            college_class: datum.college_class,
            major_1: datum.major_1,
            major_2: datum.major_2,
            sat_math: datum.sat_math,
            sat_ebrw: datum.sat_ebrw,
            act_english: datum.act_english,
            act_math: datum.act_math,
            act_reading: datum.act_reading,
            act_science: datum.act_science,
            act_composite: datum.act_composite,
            sat_literature: datum.sat_literature,
            sat_us_hist: datum.sat_us_hist,
            sat_world_hist: datum.sat_world_hist,
            sat_math_i: datum.sat_math_i,
            sat_math_ii: datum.sat_math_ii,
            sat_eco_bio: datum.sat_eco_bio,
            sat_mol_bio: datum.sat_mol_bio,
            sat_chemistry: datum.sat_chemistry,
            sat_physics: datum.sat_physics,
            num_ap_passed: datum.num_ap_passed,
            applied_colleges: {},
            weighted_avg: weightedAvg,
          })
        }
        else{
          console.log("Found . . . Updating");
          querySnapshot.forEach(function(doc) {
            db.collection("studentProfiles").doc(doc.id).update({
              userid: datum.userid.toLowerCase(),
              email: datum.userid.toLowerCase()+"@c4me.com",
              password: datum.password,
              residence_state: datum.residence_state,
              high_school_name: datum.high_school_name,
              high_school_city: datum.high_school_city,
              high_school_state: datum.high_school_state,
              gpa: datum.gpa,
              college_class: datum.college_class,
              major_1: datum.major_1,
              major_2: datum.major_2,
              sat_math: datum.sat_math,
              sat_ebrw: datum.sat_ebrw,
              act_english: datum.act_english,
              act_math: datum.act_math,
              act_reading: datum.act_reading,
              act_science: datum.act_science,
              act_composite: datum.act_composite,
              sat_literature: datum.sat_literature,
              sat_us_hist: datum.sat_us_hist,
              sat_world_hist: datum.sat_world_hist,
              sat_math_i: datum.sat_math_i,
              sat_math_ii: datum.sat_math_ii,
              sat_eco_bio: datum.sat_eco_bio,
              sat_mol_bio: datum.sat_mol_bio,
              sat_chemistry: datum.sat_chemistry,
              sat_physics: datum.sat_physics,
              num_ap_passed: datum.num_ap_passed,
              weighted_avg: weightedAvg,
            })
          })
        }
      });

      if (data.length < 150){
        db.collection('Accounts').where("userID","==",datum.userid.toLowerCase())
        .get()
        .then(function(querySnapshot){
          if (querySnapshot.size == 0){
            console.log("Not Found . . . Creating");
            firebase.auth().createUserWithEmailAndPassword(datum.userid.toLowerCase()+"@c4me.com", datum.password)
            db.collection('Accounts').add({
              firstName: "",
              lastname: "",
              userID: datum.userid.toLowerCase(),
              email: datum.userid.toLowerCase()+"@c4me.com",
              password: datum.password
            })
          }
          else{
            console.log("Account exists");
            // querySnapshot.forEach(function(doc) {
            //   db.collection('Accounts').doc(doc.id).update({
            //     firstName: "",
            //     lastname: "",
            //     userID: datum.userid.toLowerCase(),
            //     email: datum.userid.toLowerCase()+"@c4me.com",
            //     password: datum.password
            //   })
            // });
          }
        });
      }
    });
  } 

  handleApplicationFileLoad = async (data) =>{
    console.log(data);
    let fullData = {};
    let approvedDecisions = {};
    let questionableDecisions = {};
    let allDecisions = {};


    data.forEach((datum)=>{
      if (datum.userid){
         if (!(datum.userid.toLowerCase() in fullData)){
          fullData[datum.userid.toLowerCase()] = [];
          let userData = {
            [datum.college]: datum.status,
          }
          let temp = fullData[datum.userid.toLowerCase()];
          temp.push(userData);
          fullData[datum.userid.toLowerCase()] = temp;
        }
        else{
          let userData = {
            [datum.college]: datum.status,
          }
          let temp = fullData[datum.userid.toLowerCase()];
          temp.push(userData);
          fullData[datum.userid.toLowerCase()] = temp;
        }
      }
     
    });

    console.log(fullData);

    Object.keys(fullData).forEach((user) => {
      let temp = {}
      fullData[user].forEach((application)=>{
        for (let college in application){
          temp[college.replace(/,/g, '')] = application[college];
        }
      })
      console.log(temp);
      db.collection("studentProfiles").where("userid","==",user)
      .get()
      .then(async (querySnapshot) =>{
        querySnapshot.forEach(async (doc) =>{
          let tempPromise = db.collection("studentProfiles").doc(doc.id).update({
                              applied_colleges: temp,
                            });
          await tempPromise;
        })
      })
    })

    Object.keys(fullData).forEach((id,index)=>{
      console.log(id);
      db.collection('studentProfiles').where("userid","==",id)
      .get()
      .then(function(querySnapshot){
        if (querySnapshot.size == 0){
          console.log("Not Found");
        }
        else if (index != Object.keys(fullData).length-1){
          querySnapshot.forEach(function(doc) {
            console.log("Found");
            let temp = doc.data();
            let tempColleges = {}
            fullData[id].forEach((application)=>{
              for (let college in application){
                tempColleges[college.replace(/,/g, '')] = application[college];
              }
            })
            Object.keys(tempColleges).forEach((college)=>{
              if (!(college in allDecisions)){
                allDecisions[college] = {};
              }
              allDecisions[college][id] = {};
              allDecisions[college][id]["decision"] = tempColleges[college];
              allDecisions[college][id]["high_school_name"] = temp.high_school_name;
              allDecisions[college][id]["gpa"] = temp.gpa;
              allDecisions[college][id]["sat_math"] = temp.sat_math;
              allDecisions[college][id]["sat_ebrw"] = temp.sat_ebrw;
              allDecisions[college][id]["act_composite"] = temp.act_composite;
              allDecisions[college][id]["college_class"] = temp.college_class;
              allDecisions[college][id]["weighted_avg"] = temp.weighted_avg;
            })
          })
        }
        else{
          querySnapshot.forEach(function(doc) {
            console.log("Found");
            let temp = doc.data();
            let tempColleges = {}
            fullData[id].forEach((application)=>{
              for (let college in application){
                tempColleges[college.replace(/,/g, '')] = application[college];
              }
            })
            Object.keys(tempColleges).forEach((college)=>{
              if (!(college in allDecisions)){
                allDecisions[college] = {};
              }
              allDecisions[college][id] = {};
              allDecisions[college][id]["decision"] = tempColleges[college];
              allDecisions[college][id]["high_school_name"] = temp.high_school_name;
              allDecisions[college][id]["sat_math"] = temp.sat_math;
              allDecisions[college][id]["sat_ebrw"] = temp.sat_ebrw;
              allDecisions[college][id]["act_composite"] = temp.act_composite;
              allDecisions[college][id]["college_class"] = temp.college_class;
              allDecisions[college][id]["weighted_avg"] = temp.weighted_avg;
            })
          })
          
          // Evaluate all decisions
          console.log(allDecisions);

          Object.keys(allDecisions).forEach((college)=>{
            db.collection("ScrapedCollegeData").where("name","==",college)
            .get()
            .then(function(querySnapshot){

              let qCollegesFinal = {};
              let aCollegesFinal = {};
              let questionableColleges = {};
              let approvedColleges = {};
              let decisionsRef = db.collection('QuestionableDecisions');
              let approvedRef = db.collection('ApprovedDecisions');

              if (querySnapshot.size == 0){
                console.log("Not Found, all Decisions approved");
              }
              else{
                querySnapshot.forEach(function(doc) {
                  let temp = doc.data();
                  Object.keys(allDecisions[college]).forEach((student,index)=>{
                    let schoolName = college;
                    let parsedSchoolName = schoolName.replace(/\s/g, '');
                    let sum = 0;
                    let approve = false;
                    let neither = false;
                    let schoolDecision = allDecisions[college][student]["decision"];
                    let userFields = {
                      sat_Math: allDecisions[college][student]["sat_math"],
                      sat_Read: allDecisions[college][student]["sat_ebrw"],
                      act_ENG: allDecisions[college][student]["act_composite"]
                    }
                    let fieldNames = ["sat_Math","sat_Write","act_ENG"];
  
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
                      fieldNames.forEach((field) => {
                        if (userFields[field]){
                  
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

                      let value = sum;
                      console.log(value);
                      console.log(Math.round(value%1 * 10) / 10);
                      // No data can be compared
                      if (Math.round(value%1 * 10) / 10 === .4){
                        neither = true;
                      }
                      // Data is questionable, at least one field was below criteria
                      else if (value < 4){
                        questionableColleges[parsedSchoolName] = {
                          name: schoolName,
                          decision: "accepted",
                          reviewed: false
                        }
                      }
                      // Data is good.  All comparable fields were within acceptance criteria.
                      else{
                        approve = true;
                        approvedColleges[schoolName] = schoolDecision;
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

                      let value = sum;
                      console.log(value);
                      console.log(Math.round(value%1 * 10) / 10);
                      // No data can be compared
                      if (Math.round(value%1 * 10) / 10 === .4){
                        neither = true;
                      }
                      // Data is questionable, at least one field was below criteria
                      else if (value >= 5){
                        questionableColleges[parsedSchoolName] = {
                          name: schoolName,
                          decision: "denied",
                          reviewed: false
                        }
                      }
                      // Data is good.  All comparable fields were within acceptance criteria.
                      else{
                        approve = true;
                        approvedColleges[schoolName] = schoolDecision;
                      }
                    }
  
  
                    // Other
                    else{
                      approve = true;
                      approvedColleges[schoolName] = schoolDecision;
                    }

                    // Add to final object
                    if(approve){
                      aCollegesFinal[student] = {
                        decision: allDecisions[college][student]["decision"] ? (allDecisions[college][student]["decision"]) : (""),
                        gpa: allDecisions[college][student]["gpa"] ? (allDecisions[college][student]["gpa"]) : (0),
                        sat_math: allDecisions[college][student]["sat_math"] ? (allDecisions[college][student]["sat_math"]) : (0),
                        sat_ebrw: allDecisions[college][student]["sat_ebrw"] ? (allDecisions[college][student]["sat_ebrw"]) : (0),
                        act_composite: allDecisions[college][student]["act_composite"] ? (allDecisions[college][student]["act_composite"]) : (0),
                        high_school_name: allDecisions[college][student]["high_school_name"] ? (allDecisions[college][student]["high_school_name"]) : (""),
                        college_class: allDecisions[college][student]["college_class"] ? (allDecisions[college][student]["college_class"]) : (0),
                        weighted_avg: allDecisions[college][student]["weighted_avg"] ? (allDecisions[college][student]["weighted_avg"]) : (0),
                      }
                    }
                    else{
                      if (!neither){
                        qCollegesFinal[student] = {
                          colleges: {},
                          gpa: allDecisions[college][student]["gpa"] ? (allDecisions[college][student]["gpa"]) : (0),
                          sat_math: allDecisions[college][student]["sat_math"] ? (allDecisions[college][student]["sat_math"]) : (0),
                          sat_ebrw: allDecisions[college][student]["sat_ebrw"] ? (allDecisions[college][student]["sat_ebrw"]) : (0),
                          act_composite: allDecisions[college][student]["act_composite"] ? (allDecisions[college][student]["act_composite"]) : (0),
                          high_school_name: allDecisions[college][student]["high_school_name"] ? (allDecisions[college][student]["high_school_name"]) : (""),
                          college_class: allDecisions[college][student]["college_class"] ? (allDecisions[college][student]["college_class"]) : (0),
                          weighted_avg: allDecisions[college][student]["weighted_avg"] ? (allDecisions[college][student]["weighted_avg"]) : (0),
                        }
                        qCollegesFinal[student]["colleges"][parsedSchoolName] = {};
                        qCollegesFinal[student]["colleges"][parsedSchoolName] = questionableColleges[parsedSchoolName];
                        console.log(questionableColleges[parsedSchoolName]);
                      }
                    }
                    


                    if (index == Object.keys(allDecisions[college]).length-1){
                      console.log("done");
                      console.log(college);
                      console.log("Questionable");
                      console.log(qCollegesFinal);
                      console.log("Approved");
                      console.log(aCollegesFinal);
                      // Update all approved colleges onto the DB along with relevant info about the student
                      Object.keys(approvedColleges).forEach((college)=>{
                        approvedRef.doc(college).set(aCollegesFinal, { merge: true}
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
                              db.collection('QuestionableDecisions').doc(doc.id).set(qCollegesFinal, { merge: true})
                              .then(function() {
                                console.log("Document successfully written!");
                              })
                              .catch(function(error) {
                                  console.error("Error writing document: ", error);
                              });
                          });
                      })
                      .catch(function(error) {
                          console.log("Error getting documents: ", error);
                      });
                    }
                  })
                })
              }
            })
          })
        }
      })
    })


    
  }

  deleteAll = (e) =>{
    e.preventDefault();
    db.collection('studentProfiles').get().then(function(querySnapshot){
      querySnapshot.forEach(function(doc) {
          console.log("deleting " + doc.id);
          db.collection('studentProfiles').doc(doc.id).delete();
      })
    });
    db.collection('ApprovedDecisions').get().then(function(querySnapshot){
      querySnapshot.forEach(function(doc) {
          console.log("deleting " + doc.id);
          db.collection('ApprovedDecisions').doc(doc.id).delete();
      })
      db.collection('ApprovedDecisions').add({
      });
    });
    db.collection('QuestionableDecisions').get().then(function(querySnapshot){
      querySnapshot.forEach(function(doc) {
          console.log("deleting " + doc.id);
          db.collection('QuestionableDecisions').doc(doc.id).delete();
      })
      db.collection('QuestionableDecisions').add({
      });
    });

  }

  papaParse = {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    transformHeader: header => header.toLowerCase().replace(/\W/g, "")
  }

  //fetch is the api call to the backend
  // api will respond with json object
  scrapeResults = () => {
    var res = fetch("http://localhost:8000/scrape")
        .then(response => {
          return response.json();
          
        }).then(data =>{
          console.log(data);
          var text = JSON.stringify(data, null, "\n");
          console.log(text);
          this.setState({scrapeRes: text});
          return text;
        });
  }
  scrapeUpdateCollegeScorecard = () =>{
    fetch("http://localhost:8000/scrape/updateCsv")
        .then((response) => {
          console.log(response.json());
        });
  }
  scrapeUpdateFirebase(event){
    event.preventDefault();
    fetch("http://localhost:8000/scrape/updatefirebase")
        .then((response)=> {
        });
  }
  scrapeHighschoolData= () =>{
    fetch("http://localhost:8000/scrapehighschools")
    .then((response) => {
      console.log(response.json());
    });
  }


  approveDecision(userID,userData,dec,college,parsedSchoolName){
    // Remove from list of Questionable Decisions for that user
    let decisionsRef = db.collection('QuestionableDecisions');
    decisionsRef
      .get()
      .then(function(querySnapshot) {
          querySnapshot.forEach(function(doc) {
              let temp = doc.data();

              db.collection('QuestionableDecisions').doc(doc.id).update({
                [userID+".colleges."+parsedSchoolName]: firebase.firestore.FieldValue.delete(),
              })
          });
      })
      .catch(function(error) {
          console.log("Error getting documents: ", error);
      });


      // Add to list of Approved Decisions for that college with this userID.
      let approvedRef = db.collection('ApprovedDecisions');
      approvedRef.doc(college).set({
        [userID]: {
          decision: dec.toLowerCase(),
          gpa: userData["gpa"],
          sat_math: userData["sat_math"],
          sat_ebrw: userData["sat_ebrw"],
          act_composite: userData["act_composite"],
          college_class: userData["college_class"],
          high_school_name: userData["high_school_name"],
          weighted_avg: userData["weighted_avg"],
        }}, { merge: true}
      )
      .then(function() {
        console.log("Document successfully written!");
      })
      .catch(function(error) {
          console.error("Error writing document: ", error);
      });
  }

  denyDecision(userID,college){
    console.log(userID,college);
    let decisionsRef = db.collection('QuestionableDecisions');
    decisionsRef
      .get()
      .then(function(querySnapshot) {
          querySnapshot.forEach(function(doc) {
              let temp = doc.data();

              db.collection('QuestionableDecisions').doc(doc.id).update({
                [userID+".colleges."+college+".reviewed"]: true,
              })
          });
      })
      .catch(function(error) {
          console.log("Error getting documents: ", error);
      });
  }

  render() {

    if (!(this.props.auth.email == "franky.pan@stonybrook.edu" || this.props.auth.email == "sean.spencer@stonybrook.edu" 
    || this.props.auth.email == "amta.sulaiman@stonybrook.edu" || this.props.auth.email == "shawn.felix@stonybrook.edu")) {
      return <Redirect to="/" />;
    }

    let temp = this.props.questionableDecisions["QuestionableDecisions"];
    let temp2 = {};
    if(temp){
      temp2 = temp[Object.keys(temp)[0]];
    }
    console.log(temp2);

    return (
      <div className="outlet profile-container">
        <form onSubmit={this.handleSubmit} className="profile-form white">
        <div>
          <h4>Student Profile Data</h4>

          <CSVReader 
          cssClass = "react-csv-input" 
          label = "Select Student Profile Dataset"
          onFileLoaded = {this.handleFileLoad}
          parserOptions = {this.papaParse}
          />

          <CSVReader 
          cssClass = "react-csv-input" 
          label = "Select Application Dataset"
          onFileLoaded = {this.handleApplicationFileLoad}
          parserOptions = {this.papaParse}
          />
          <button className="delete-profiles btn red lighten-1 z-depth-0 profile-button" onClick = {this.deleteAll}>Delete All Student Profiles</button>
        </div>
        <h4>Questionable Decisions</h4>


          <table className="striped">
            <thead>
              <tr>
                  <th className="search-header"><a className="search-header-text">User ID</a></th>
                  <th className="search-header"><a className="search-header-text">College</a></th>
                  <th className="search-header"><a className="search-header-text">Decision</a></th>
                  <th className="search-header"><a className="search-header-text">GPA</a></th>
                  <th className="search-header"><a className="search-header-text">SAT Math</a></th>
                  <th className="search-header"><a className="search-header-text">SAT EBRW</a></th>
                  <th className="search-header"><a className="search-header-text">ACT Composite</a></th>
                  <th className="search-header"><a className="search-header-text">Review</a></th>
              </tr>
            </thead>

            <tbody>
              {Object.keys(temp2).map((decision) => {
                console.log(temp2[decision]);
                return Object.keys(temp2[decision]["colleges"]).map((college) => {
                  let temp = temp2[decision];
                  console.log(decision,college);
                  if (!temp["colleges"][college]["reviewed"]){
                    return  <tr className="search-item">
                            <td className="search-item-name">{decision}</td>
                            
                            <td className="search-item">{temp["colleges"][college]["name"]}</td>
                            
                            <td className="search-item">{temp["colleges"][college]["decision"]}</td>
                            
                            {temp2[decision]["gpa"] ? (<td className="search-item">{temp2[decision]["gpa"]}</td>) : (<td className="search-item">N/A</td>)}
                            {temp2[decision]["sat_math"] ? (<td className="search-item">{temp2[decision]["sat_math"]}</td>) : (<td className="search-item">N/A</td>)}
                            {temp2[decision]["sat_ebrw"] ? (<td className="search-item">{temp2[decision]["sat_ebrw"]}</td>) : (<td className="search-item">N/A</td>)}
                            {temp2[decision]["act_composite"] ? (<td className="search-item">{temp2[decision]["act_composite"]}</td>) : (<td className="search-item">N/A</td>)}
                            <td>
                              <a className="btn-floating btn-large waves-effect waves-light green" onClick={()=>this.approveDecision(decision,temp2[decision],temp["colleges"][college]["decision"],temp["colleges"][college]["name"],college)}>✓</a>
                              <a className="btn-floating btn-large waves-effect waves-light red" onClick={()=>this.denyDecision(decision,college)}>✗</a>
                            </td>
                        </tr>
                  }
                  else{
                    return
                  }
                });
              })}
            </tbody>
          </table>
          <div className="input-field admin-button-container">
            <h4>Scraping</h4>
            Scrape and update the system
            <button type="button" onClick={this.scrapeUpdateFirebase} className="btn green lighten-1 z-depth-0 profile-button">Scrape & Update System</button>
          </div>
        </form>
      </div>
    );
  };
}

const mapStateToProps = (state) => {
  return {
      questionableDecisions: state.firestore.data,
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
          return [
          { collection: 'QuestionableDecisions'}];
      }
  }),
)(AdminScreen);