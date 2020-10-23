import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { firestoreConnect } from 'react-redux-firebase';
import { Redirect } from 'react-router-dom';
import RangeInput from './RangeInput.js';
import SelectorInputStatus from './SelectorInputStatus.js';
import SelectorInputMajor from './SelectorInputMajor.js';
import { Modal, Button, Row, Col, Card } from 'react-materialize';

import firebase, { db } from "../../firebase";
import CanvasJSReact from '../../canvasjs.react.js';
//var CanvasJSReact = require('./canvasjs.react');
var CanvasJS = CanvasJSReact.CanvasJS;
var CanvasJSChart = CanvasJSReact.CanvasJSChart;

class CollegeInfoScreen extends React.Component {
  constructor(props){
    super(props);
    this.toggleDataSeries = this.toggleDataSeries.bind(this);
    this.filters={};
    this.currentItemSortCriteria = null;
    this.newItemSortCriteria = null;
    this.flipped = false;
    this.mount = false;
  }

  state={
    applications: [],
    filterType: "lax",
    collegeClassMin: null,
    collegeClassMax: null,
    applicationStatuses: ["Pending", "Accepted", "Denied", "Deferred", "Wait-listed", "Withdrawn"],
    applicationStatus: null,
    avgGPA: 0,
    avgMath: 0,
    avgEBRW: 0,
    avgACT: 0,
    filterName: "",
    scatterPlotType: "SAT",
    acceptedScores: [],
    declinedScores: [],
    otherScores: [],
    meanScore: [],
    avgAVG: 0,
  }

  componentDidMount(){
    let info = this.props.location.info;
    if(!info){
      return <Redirect to = "/"></Redirect>;
    }
    document.getElementById("lax").checked = true;
    let collegeInfo = info.temp;
    let collegeName = collegeInfo["Name"];
    let approvedDecRef = db.collection('ApprovedDecisions').doc(collegeName);
    let getDoc = approvedDecRef.get().then(
      doc => {
        if(!doc.exists){
          console.log("No such doc");
        }else{
          var appDict = {};
          this.setState({avgGPA : 0});
          this.setState({avgMath : 0});
          this.setState({avgEBRW : 0});
          this.setState({avgACT : 0});
          this.setState({avgAVG : 0});
          this.setState({acceptedScores: [], declinedScores: [], otherScores: [], meanScore: []});
          let data = doc.data();
          for (const key in data){
            const value = data[key];
            //console.log(key);
            //console.log(value);
            appDict[key] = {
              userid: key,
              avgGPA: value.gpa,
              avgSATMath: value.sat_math,
              avgSATEBRW: value.sat_ebrw,
              avgACTComp: value.act_composite,
              decision: value.decision,
              class: value.college_class,
              hsName: value.high_school_name
            };
            if(value.gpa != null){
              this.setState({avgGPA : this.state.avgGPA + value.gpa})
            }
            if(value.sat_math != null){
              this.setState({avgMath : this.state.avgMath + value.sat_math})
            }
            if(value.sat_ebrw != null){
              this.setState({avgEBRW : this.state.avgEBRW + value.sat_ebrw})
            }
            if(value.act_composite != null){
              this.setState({avgACT : this.state.avgACT + value.act_composite})
            }
            if(value.weighted_avg != null){
              this.setState({avgAVG : this.state.avgAVG + value.weighted_avg})
            }//s1
            if(this.state.scatterPlotType == "SAT"){
              if(value.decision == "accepted" && value.gpa != null && (value.sat_math != null || value.sat_ebrw != null)){
                var combSAT = value.sat_math + value.sat_ebrw;
                var joined = this.state.acceptedScores.concat({x: combSAT, y: value.gpa});
                this.setState({ acceptedScores: joined });
              }
              else if(value.decision == "denied" && value.gpa != null && (value.sat_math != null || value.sat_ebrw != null)){
                var combSAT = value.sat_math + value.sat_ebrw;
                var joined = this.state.declinedScores.concat({x: combSAT, y: value.gpa});
                this.setState({ declinedScores: joined });
              }
              else if((value.decision == "deferred" || value.decision == "wait-listed" || value.decision == "withdrawn" || value.decision == "pending") && 
              value.gpa != null && (value.sat_math != null || value.sat_ebrw != null)){
                var combSAT = value.sat_math + value.sat_ebrw;
                var joined = this.state.otherScores.concat({x: combSAT, y: value.gpa});
                this.setState({ otherScores: joined });
              }
            }
            else if(this.state.scatterPlotType == "ACT"){
              if(value.decision == "accepted" && value.gpa != null && value.act_composite != null){
                var joined = this.state.acceptedScores.concat({x: value.act_composite, y: value.gpa});
                this.setState({ acceptedScores: joined });
              }
              else if(value.decision == "denied" && value.gpa != null && value.act_composite != null){
                var joined = this.state.declinedScores.concat({x: value.act_composite, y: value.gpa});
                this.setState({ declinedScores: joined });
              }
              else if((value.decision == "deferred" || value.decision == "wait-listed" || value.decision == "withdrawn" || value.decision == "pending") && 
              value.gpa != null && value.act_composite != null){
                var joined = this.state.otherScores.concat({x: value.act_composite, y: value.gpa});
                this.setState({ otherScores: joined });
              }
            }
            else if(this.state.scatterPlotType == "AVG"){
              if(value.decision == "accepted" && value.gpa != null && value.weighted_avg != null){
                var joined = this.state.acceptedScores.concat({x: value.weighted_avg, y: value.gpa});
                this.setState({ acceptedScores: joined });
              }
              else if(value.decision == "denied" && value.gpa != null && value.weighted_avg != null){
                var joined = this.state.declinedScores.concat({x: value.weighted_avg, y: value.gpa});
                this.setState({ declinedScores: joined });
              }
              else if((value.decision == "deferred" || value.decision == "wait-listed" || value.decision == "withdrawn" || value.decision == "pending") && 
              value.gpa != null && value.weighted_avg != null){
                var joined = this.state.otherScores.concat({x: value.weighted_avg, y: value.gpa});
                this.setState({ otherScores: joined });
              }
            }
          }
          let numApps = Object.keys(appDict).length;
          if(numApps > 0){
            this.setState({avgGPA : Math.round(100*this.state.avgGPA / numApps)/100});
            this.setState({avgMath : Math.round(this.state.avgMath / numApps)});
            this.setState({avgEBRW : Math.round(this.state.avgEBRW / numApps)});
            this.setState({avgACT : Math.round(10*this.state.avgACT / numApps)/10});
            this.setState({avgAVG : Math.round(10*this.state.avgAVG / numApps)/10});
            if(this.state.scatterPlotType == "SAT"){
              this.setState({meanScore : [{x: this.state.avgMath + this.state.avgEBRW, y: this.state.avgGPA}]});
            }
            if(this.state.scatterPlotType == "ACT"){
              this.setState({meanScore : [{x: this.state.avgACT, y: this.state.avgGPA}]});
            }
            if(this.state.scatterPlotType == "AVG"){
              this.setState({meanScore: [{x: this.state.avgAVG, y: this.state.avgGPA}]});
            }//s2
          }else{
            this.setState({avgGPA : 0});
            this.setState({avgMath : 0});
            this.setState({avgEBRW : 0});
            this.setState({avgACT : 0});
            this.setState({avgAVG : 0}); //s3
            this.setState({acceptedScores: [], declinedScores: [], otherScores: [], meanScore: []});
          }
          this.setState({applications : appDict});
          if(this.mount == false){
            this.sortTasks("status");
          }else{
            this.mount = true;
          }
          
        }
      }
    );
  }

  handleCheck = (e) =>{
    const { target } = e;

    this.setState(state => ({
      ...state,
      ["filterType"]: target.id,
    }));
  }

  

  handleChange = (e) =>{
    const { target } = e;

    this.setState(state => ({
      ...state,
      [target.id]: target.value,
    }));
  }

  handleSubmit = (e) =>{
    e.preventDefault();
    console.log(this.state);
    var newDict = {};
    //filters: all null/empty
    if((this.state.applicationStatus == null || this.state.applicationStatus == "Select a Status:") &&
    (this.state.collegeClassMax == null || this.state.collegeClassMax == "") &&
    (this.state.collegeClassMin == null || this.state.collegeClassMin == "") &&
    (this.state.filterName == null || this.state.filterName == "")){
      //query database for all applications
      let info = this.props.location.info;
      if(!info){
        return <Redirect to = "/"></Redirect>;
      }
      let collegeInfo = info.temp;
      let collegeName = collegeInfo["Name"];
      let approvedDecRef = db.collection('ApprovedDecisions').doc(collegeName);
      let getDoc = approvedDecRef.get().then(
        doc => {
          if(!doc.exists){
            console.log("No such doc");
          }else{
            var appDict = {};
            this.setState({avgGPA : 0});
            this.setState({avgMath : 0});
            this.setState({avgEBRW : 0});
            this.setState({avgACT : 0});
            this.setState({avgAVG: 0});
            this.setState({acceptedScores: [], declinedScores: [], otherScores: [], meanScore: []});
            let data = doc.data();
            for (const key in data){
              const value = data[key];
              //console.log(key);
              //console.log(value);
              appDict[key] = {
                userid: key,
                avgGPA: value.gpa,
                avgSATMath: value.sat_math,
                avgSATEBRW: value.sat_ebrw,
                avgACTComp: value.act_composite,
                decision: value.decision,
                class: value.college_class,
                hsName: value.high_school_name
              };
              if(value.gpa != null){
                this.setState({avgGPA : this.state.avgGPA + value.gpa})
              }
              if(value.sat_math != null){
                this.setState({avgMath : this.state.avgMath + value.sat_math})
              }
              if(value.sat_ebrw != null){
                this.setState({avgEBRW : this.state.avgEBRW + value.sat_ebrw})
              }
              if(value.act_composite != null){
                this.setState({avgACT : this.state.avgACT + value.act_composite})
              }
              if(value.weighted_avg != null){
                this.setState({avgAVG : this.state.avgAVG + value.weighted_avg})
              }
              if(this.state.scatterPlotType == "SAT"){
                if(value.decision == "accepted" && value.gpa != null && (value.sat_math != null || value.sat_ebrw != null)){
                  var combSAT = value.sat_math + value.sat_ebrw;
                  var joined = this.state.acceptedScores.concat({x: combSAT, y: value.gpa});
                  this.setState({ acceptedScores: joined });
                }
                else if(value.decision == "denied" && value.gpa != null && (value.sat_math != null || value.sat_ebrw != null)){
                  var combSAT = value.sat_math + value.sat_ebrw;
                  var joined = this.state.declinedScores.concat({x: combSAT, y: value.gpa});
                  this.setState({ declinedScores: joined });
                }
                else if((value.decision == "deferred" || value.decision == "wait-listed" || value.decision == "withdrawn" || value.decision == "pending") && 
                value.gpa != null && (value.sat_math != null || value.sat_ebrw != null)){
                  var combSAT = value.sat_math + value.sat_ebrw;
                  var joined = this.state.otherScores.concat({x: combSAT, y: value.gpa});
                  this.setState({ otherScores: joined });
                }
              }
              else if(this.state.scatterPlotType == "ACT"){
                if(value.decision == "accepted" && value.gpa != null && value.act_composite != null){
                  var joined = this.state.acceptedScores.concat({x: value.act_composite, y: value.gpa});
                  this.setState({ acceptedScores: joined });
                }
                else if(value.decision == "denied" && value.gpa != null && value.act_composite != null){
                  var joined = this.state.declinedScores.concat({x: value.act_composite, y: value.gpa});
                  this.setState({ declinedScores: joined });
                }
                else if((value.decision == "deferred" || value.decision == "wait-listed" || value.decision == "withdrawn" || value.decision == "pending") && 
                value.gpa != null && value.act_composite != null){
                  var joined = this.state.otherScores.concat({x: value.act_composite, y: value.gpa});
                  this.setState({ otherScores: joined });
                }
              }
              else if(this.state.scatterPlotType == "AVG"){
                if(value.decision == "accepted" && value.gpa != null && value.weighted_avg != null){
                  var joined = this.state.acceptedScores.concat({x: value.weighted_avg, y: value.gpa});
                  this.setState({ acceptedScores: joined });
                }
                else if(value.decision == "denied" && value.gpa != null && value.weighted_avg != null){
                  var joined = this.state.declinedScores.concat({x: value.weighted_avg, y: value.gpa});
                  this.setState({ declinedScores: joined });
                }
                else if((value.decision == "deferred" || value.decision == "wait-listed" || value.decision == "withdrawn" || value.decision == "pending") && 
                value.gpa != null && value.weighted_avg != null){
                  var joined = this.state.otherScores.concat({x: value.weighted_avg, y: value.gpa});
                  this.setState({ otherScores: joined });
                }
              }
            }
            let numApps = Object.keys(appDict).length;
            if(numApps > 0){
              this.setState({avgGPA : Math.round(100*this.state.avgGPA / numApps)/100});
              this.setState({avgMath : Math.round(this.state.avgMath / numApps)});
              this.setState({avgEBRW : Math.round(this.state.avgEBRW / numApps)});
              this.setState({avgACT : Math.round(10*this.state.avgACT / numApps)/10});
              this.setState({avgAVG : Math.round(10*this.state.avgAVG / numApps)/10});
              if(this.state.scatterPlotType == "SAT"){
                this.setState({meanScore : [{x: this.state.avgMath + this.state.avgEBRW, y: this.state.avgGPA}]});
              }
              if(this.state.scatterPlotType == "ACT"){
                this.setState({meanScore : [{x: this.state.avgACT, y: this.state.avgGPA}]});
              }
              if(this.state.scatterPlotType == "AVG"){
                this.setState({meanScore: [{x: this.state.avgAVG, y: this.state.avgGPA}]});
              }
            }else{
              this.setState({avgGPA : 0});
              this.setState({avgMath : 0});
              this.setState({avgEBRW : 0});
              this.setState({avgACT : 0});
              this.setState({avgAVG : 0});
              this.setState({acceptedScores: [], declinedScores: [], otherScores: [], meanScore: []});
            }
            this.setState({applications : appDict});
            this.sortTasks("status");
          }
        }
      );
    }else if(this.state.filterType == "lax"){ //LAX SEARCH
      //filters: only applicationstatus
      if((this.state.applicationStatus != null && this.state.applicationStatus != "Select a Status:") &&
        (this.state.collegeClassMax == null || this.state.collegeClassMax == "") &&
        (this.state.collegeClassMin == null || this.state.collegeClassMin == "")&&
        (this.state.filterName == null || this.state.filterName == "")){
          //console.log("YEP")
          //query database for all applications
          let info = this.props.location.info;
          if(!info){
            return <Redirect to = "/"></Redirect>;
          }
          let collegeInfo = info.temp;
          let collegeName = collegeInfo["Name"];
          let approvedDecRef = db.collection('ApprovedDecisions').doc(collegeName);
          let getDoc = approvedDecRef.get().then(
            doc => {
              if(!doc.exists){
                console.log("No such doc");
              }else{
                var appDict = {};
                this.setState({avgGPA : 0});
                this.setState({avgMath : 0});
                this.setState({avgEBRW : 0});
                this.setState({avgACT : 0});
                this.setState({avgAVG : 0});
                this.setState({acceptedScores: [], declinedScores: [], otherScores: [], meanScore: []});
                let data = doc.data();
                for (const key in data){
                  const value = data[key];
                  //console.log(key);
                  //console.log(value);
                  if(value.decision.toLowerCase() == this.state.applicationStatus.toLowerCase()){
                    appDict[key] = {
                      userid: key,
                      avgGPA: value.gpa,
                      avgSATMath: value.sat_math,
                      avgSATEBRW: value.sat_ebrw,
                      avgACTComp: value.act_composite,
                      decision: value.decision,
                      class: value.college_class,
                      hsName: value.high_school_name
                    };
                    if(value.gpa != null){
                      this.setState({avgGPA : this.state.avgGPA + value.gpa})
                    }
                    if(value.sat_math != null){
                      this.setState({avgMath : this.state.avgMath + value.sat_math})
                    }
                    if(value.sat_ebrw != null){
                      this.setState({avgEBRW : this.state.avgEBRW + value.sat_ebrw})
                    }
                    if(value.act_composite != null){
                      this.setState({avgACT : this.state.avgACT + value.act_composite})
                    }
                    if(value.weighted_avg != null){
                      this.setState({avgAVG : this.state.avgAVG + value.weighted_avg})
                    }
                    if(this.state.scatterPlotType == "SAT"){
                      if(value.decision == "accepted" && value.gpa != null && (value.sat_math != null || value.sat_ebrw != null)){
                        var combSAT = value.sat_math + value.sat_ebrw;
                        var joined = this.state.acceptedScores.concat({x: combSAT, y: value.gpa});
                        this.setState({ acceptedScores: joined });
                      }
                      else if(value.decision == "denied" && value.gpa != null && (value.sat_math != null || value.sat_ebrw != null)){
                        var combSAT = value.sat_math + value.sat_ebrw;
                        var joined = this.state.declinedScores.concat({x: combSAT, y: value.gpa});
                        this.setState({ declinedScores: joined });
                      }
                      else if((value.decision == "deferred" || value.decision == "wait-listed" || value.decision == "withdrawn" || value.decision == "pending") && 
                      value.gpa != null && (value.sat_math != null || value.sat_ebrw != null)){
                        var combSAT = value.sat_math + value.sat_ebrw;
                        var joined = this.state.otherScores.concat({x: combSAT, y: value.gpa});
                        this.setState({ otherScores: joined });
                      }
                    }
                    else if(this.state.scatterPlotType == "ACT"){
                      if(value.decision == "accepted" && value.gpa != null && value.act_composite != null){
                        var joined = this.state.acceptedScores.concat({x: value.act_composite, y: value.gpa});
                        this.setState({ acceptedScores: joined });
                      }
                      else if(value.decision == "denied" && value.gpa != null && value.act_composite != null){
                        var joined = this.state.declinedScores.concat({x: value.act_composite, y: value.gpa});
                        this.setState({ declinedScores: joined });
                      }
                      else if((value.decision == "deferred" || value.decision == "wait-listed" || value.decision == "withdrawn" || value.decision == "pending") && 
                      value.gpa != null && value.act_composite != null){
                        var joined = this.state.otherScores.concat({x: value.act_composite, y: value.gpa});
                        this.setState({ otherScores: joined });
                      }
                    }
                    else if(this.state.scatterPlotType == "AVG"){
                      if(value.decision == "accepted" && value.gpa != null && value.weighted_avg != null){
                        var joined = this.state.acceptedScores.concat({x: value.weighted_avg, y: value.gpa});
                        this.setState({ acceptedScores: joined });
                      }
                      else if(value.decision == "denied" && value.gpa != null && value.weighted_avg != null){
                        var joined = this.state.declinedScores.concat({x: value.weighted_avg, y: value.gpa});
                        this.setState({ declinedScores: joined });
                      }
                      else if((value.decision == "deferred" || value.decision == "wait-listed" || value.decision == "withdrawn" || value.decision == "pending") && 
                      value.gpa != null && value.weighted_avg != null){
                        var joined = this.state.otherScores.concat({x: value.weighted_avg, y: value.gpa});
                        this.setState({ otherScores: joined });
                      }
                    }
                  }
                }
                let numApps = Object.keys(appDict).length;
                if(numApps > 0){
                  this.setState({avgGPA : Math.round(100*this.state.avgGPA / numApps)/100});
                  this.setState({avgMath : Math.round(this.state.avgMath / numApps)});
                  this.setState({avgEBRW : Math.round(this.state.avgEBRW / numApps)});
                  this.setState({avgACT : Math.round(10*this.state.avgACT / numApps)/10});
                  this.setState({avgAVG : Math.round(10*this.state.avgAVG / numApps)/10});
                  if(this.state.scatterPlotType == "SAT"){
                    this.setState({meanScore : [{x: this.state.avgMath + this.state.avgEBRW, y: this.state.avgGPA}]});
                  }
                  if(this.state.scatterPlotType == "ACT"){
                    this.setState({meanScore : [{x: this.state.avgACT, y: this.state.avgGPA}]});
                  }
                  if(this.state.scatterPlotType == "AVG"){
                    this.setState({meanScore: [{x: this.state.avgAVG, y: this.state.avgGPA}]});
                  }
                }else{
                  this.setState({avgGPA : 0});
                  this.setState({avgMath : 0});
                  this.setState({avgEBRW : 0});
                  this.setState({avgACT : 0});
                  this.setState({avgAVG : 0});
                  this.setState({acceptedScores: [], declinedScores: [], otherScores: [], meanScore: []});
                }
                this.setState({applications : appDict});
                this.sortTasks("status");
                alert("Finished Filtering");
              }
            }
          );
        }
        //filters: only class
        else if((this.state.applicationStatus == null || this.state.applicationStatus == "Select a Status:") &&
        (this.state.collegeClassMax != null || this.state.collegeClassMax != "") &&
        (this.state.collegeClassMin != null || this.state.collegeClassMin != "")&&
        (this.state.filterName == null || this.state.filterName == "")){
          let info = this.props.location.info;
          //console.log("YEO")
          if(!info){
            return <Redirect to = "/"></Redirect>;
          }
          let collegeInfo = info.temp;
          let collegeName = collegeInfo["Name"];
          let approvedDecRef = db.collection('ApprovedDecisions').doc(collegeName);
          let getDoc = approvedDecRef.get().then(
            doc => {
              if(!doc.exists){
                console.log("No such doc");
              }else{
                var appDict = {};
                this.setState({avgGPA : 0});
                this.setState({avgMath : 0});
                this.setState({avgEBRW : 0});
                this.setState({avgACT : 0});
                this.setState({avgAVG : 0});
                this.setState({acceptedScores: [], declinedScores: [], otherScores: [], meanScore: []});
                let data = doc.data();
                for (const key in data){
                  const value = data[key];
                  //console.log(key);
                  //console.log(value);
                  if(value.college_class >= this.state.collegeClassMin && (this.state.collegeClassMax != null && this.state.collegeClassMax != "" && value.college_class <= this.state.collegeClassMax)
                  || value.college_class == null){
                    appDict[key] = {
                      userid: key,
                      avgGPA: value.gpa,
                      avgSATMath: value.sat_math,
                      avgSATEBRW: value.sat_ebrw,
                      avgACTComp: value.act_composite,
                      decision: value.decision,
                      class: value.college_class,
                      hsName: value.high_school_name
                    };
                    if(value.gpa != null){
                      this.setState({avgGPA : this.state.avgGPA + value.gpa})
                    }
                    if(value.sat_math != null){
                      this.setState({avgMath : this.state.avgMath + value.sat_math})
                    }
                    if(value.sat_ebrw != null){
                      this.setState({avgEBRW : this.state.avgEBRW + value.sat_ebrw})
                    }
                    if(value.act_composite != null){
                      this.setState({avgACT : this.state.avgACT + value.act_composite})
                    }
                    if(value.weighted_avg != null){
                      this.setState({avgAVG : this.state.avgAVG + value.weighted_avg})
                    }
                    if(this.state.scatterPlotType == "SAT"){
                      if(value.decision == "accepted" && value.gpa != null && (value.sat_math != null || value.sat_ebrw != null)){
                        var combSAT = value.sat_math + value.sat_ebrw;
                        var joined = this.state.acceptedScores.concat({x: combSAT, y: value.gpa});
                        this.setState({ acceptedScores: joined });
                      }
                      else if(value.decision == "denied" && value.gpa != null && (value.sat_math != null || value.sat_ebrw != null)){
                        var combSAT = value.sat_math + value.sat_ebrw;
                        var joined = this.state.declinedScores.concat({x: combSAT, y: value.gpa});
                        this.setState({ declinedScores: joined });
                      }
                      else if((value.decision == "deferred" || value.decision == "wait-listed" || value.decision == "withdrawn" || value.decision == "pending") && 
                      value.gpa != null && (value.sat_math != null || value.sat_ebrw != null)){
                        var combSAT = value.sat_math + value.sat_ebrw;
                        var joined = this.state.otherScores.concat({x: combSAT, y: value.gpa});
                        this.setState({ otherScores: joined });
                      }
                    }
                    else if(this.state.scatterPlotType == "ACT"){
                      if(value.decision == "accepted" && value.gpa != null && value.act_composite != null){
                        var joined = this.state.acceptedScores.concat({x: value.act_composite, y: value.gpa});
                        this.setState({ acceptedScores: joined });
                      }
                      else if(value.decision == "denied" && value.gpa != null && value.act_composite != null){
                        var joined = this.state.declinedScores.concat({x: value.act_composite, y: value.gpa});
                        this.setState({ declinedScores: joined });
                      }
                      else if((value.decision == "deferred" || value.decision == "wait-listed" || value.decision == "withdrawn" || value.decision == "pending") && 
                      value.gpa != null && value.act_composite != null){
                        var joined = this.state.otherScores.concat({x: value.act_composite, y: value.gpa});
                        this.setState({ otherScores: joined });
                      }
                    }
                    else if(this.state.scatterPlotType == "AVG"){
                      if(value.decision == "accepted" && value.gpa != null && value.weighted_avg != null){
                        var joined = this.state.acceptedScores.concat({x: value.weighted_avg, y: value.gpa});
                        this.setState({ acceptedScores: joined });
                      }
                      else if(value.decision == "denied" && value.gpa != null && value.weighted_avg != null){
                        var joined = this.state.declinedScores.concat({x: value.weighted_avg, y: value.gpa});
                        this.setState({ declinedScores: joined });
                      }
                      else if((value.decision == "deferred" || value.decision == "wait-listed" || value.decision == "withdrawn" || value.decision == "pending") && 
                      value.gpa != null && value.weighted_avg != null){
                        var joined = this.state.otherScores.concat({x: value.weighted_avg, y: value.gpa});
                        this.setState({ otherScores: joined });
                      }
                    }
                  }
                }
                let numApps = Object.keys(appDict).length;
                if(numApps > 0){
                  this.setState({avgGPA : Math.round(100*this.state.avgGPA / numApps)/100});
                  this.setState({avgMath : Math.round(this.state.avgMath / numApps)});
                  this.setState({avgEBRW : Math.round(this.state.avgEBRW / numApps)});
                  this.setState({avgACT : Math.round(10*this.state.avgACT / numApps)/10});
                  this.setState({avgAVG : Math.round(10*this.state.avgAVG / numApps)/10});
                  if(this.state.scatterPlotType == "SAT"){
                    this.setState({meanScore : [{x: this.state.avgMath + this.state.avgEBRW, y: this.state.avgGPA}]});
                  }
                  if(this.state.scatterPlotType == "ACT"){
                    this.setState({meanScore : [{x: this.state.avgACT, y: this.state.avgGPA}]});
                  }
                  if(this.state.scatterPlotType == "AVG"){
                    this.setState({meanScore: [{x: this.state.avgAVG, y: this.state.avgGPA}]});
                  }
                }else{
                  this.setState({avgGPA : 0});
                  this.setState({avgMath : 0});
                  this.setState({avgEBRW : 0});
                  this.setState({avgACT : 0});
                  this.setState({avgAVG : 0});
                  this.setState({acceptedScores: [], declinedScores: [], otherScores: [], meanScore: []});
                }
                this.setState({applications : appDict});
                this.sortTasks("status");
                alert("Finished Filtering");
              }
            }
          );
        }
        //filters: only class + status
        else if((this.state.applicationStatus != null || this.state.applicationStatus != "Select a Status:") &&
        (this.state.collegeClassMax != null || this.state.collegeClassMax != "") &&
        (this.state.collegeClassMin != null || this.state.collegeClassMin != "")&&
        (this.state.filterName == null || this.state.filterName == "")){
          let info = this.props.location.info;
          console.log("nice")
          if(!info){
            return <Redirect to = "/"></Redirect>;
          }
          let collegeInfo = info.temp;
          let collegeName = collegeInfo["Name"];
          let approvedDecRef = db.collection('ApprovedDecisions').doc(collegeName);
          let getDoc = approvedDecRef.get().then(
            doc => {
              if(!doc.exists){
                console.log("No such doc");
              }else{
                var appDict = {};
                this.setState({avgGPA : 0});
                this.setState({avgMath : 0});
                this.setState({avgEBRW : 0});
                this.setState({avgACT : 0});
                this.setState({avgAVG : 0});
                this.setState({acceptedScores: [], declinedScores: [], otherScores: [], meanScore: []});
                let data = doc.data();
                for (const key in data){
                  const value = data[key];
                  //console.log(key);
                  //console.log(value);
                  if(value.college_class >= this.state.collegeClassMin && (this.state.collegeClassMax != null && this.state.collegeClassMax != "" && value.college_class <= this.state.collegeClassMax) &&
                    value.decision.toLowerCase() == this.state.applicationStatus.toLowerCase()
                    || value.college_class == null){
                    appDict[key] = {
                      userid: key,
                      avgGPA: value.gpa,
                      avgSATMath: value.sat_math,
                      avgSATEBRW: value.sat_ebrw,
                      avgACTComp: value.act_composite,
                      decision: value.decision,
                      class: value.college_class,
                      hsName: value.high_school_name
                    };
                    if(value.gpa != null){
                      this.setState({avgGPA : this.state.avgGPA + value.gpa})
                    }
                    if(value.sat_math != null){
                      this.setState({avgMath : this.state.avgMath + value.sat_math})
                    }
                    if(value.sat_ebrw != null){
                      this.setState({avgEBRW : this.state.avgEBRW + value.sat_ebrw})
                    }
                    if(value.act_composite != null){
                      this.setState({avgACT : this.state.avgACT + value.act_composite})
                    }
                    if(value.weighted_avg != null){
                      this.setState({avgAVG : this.state.avgAVG + value.weighted_avg})
                    }
                    if(this.state.scatterPlotType == "SAT"){
                      if(value.decision == "accepted" && value.gpa != null && (value.sat_math != null || value.sat_ebrw != null)){
                        var combSAT = value.sat_math + value.sat_ebrw;
                        var joined = this.state.acceptedScores.concat({x: combSAT, y: value.gpa});
                        this.setState({ acceptedScores: joined });
                      }
                      else if(value.decision == "denied" && value.gpa != null && (value.sat_math != null || value.sat_ebrw != null)){
                        var combSAT = value.sat_math + value.sat_ebrw;
                        var joined = this.state.declinedScores.concat({x: combSAT, y: value.gpa});
                        this.setState({ declinedScores: joined });
                      }
                      else if((value.decision == "deferred" || value.decision == "wait-listed" || value.decision == "withdrawn" || value.decision == "pending") && 
                      value.gpa != null && (value.sat_math != null || value.sat_ebrw != null)){
                        var combSAT = value.sat_math + value.sat_ebrw;
                        var joined = this.state.otherScores.concat({x: combSAT, y: value.gpa});
                        this.setState({ otherScores: joined });
                      }
                    }
                    else if(this.state.scatterPlotType == "ACT"){
                      if(value.decision == "accepted" && value.gpa != null && value.act_composite != null){
                        var joined = this.state.acceptedScores.concat({x: value.act_composite, y: value.gpa});
                        this.setState({ acceptedScores: joined });
                      }
                      else if(value.decision == "denied" && value.gpa != null && value.act_composite != null){
                        var joined = this.state.declinedScores.concat({x: value.act_composite, y: value.gpa});
                        this.setState({ declinedScores: joined });
                      }
                      else if((value.decision == "deferred" || value.decision == "wait-listed" || value.decision == "withdrawn" || value.decision == "pending") && 
                      value.gpa != null && value.act_composite != null){
                        var joined = this.state.otherScores.concat({x: value.act_composite, y: value.gpa});
                        this.setState({ otherScores: joined });
                      }
                    }
                    else if(this.state.scatterPlotType == "AVG"){
                      if(value.decision == "accepted" && value.gpa != null && value.weighted_avg != null){
                        var joined = this.state.acceptedScores.concat({x: value.weighted_avg, y: value.gpa});
                        this.setState({ acceptedScores: joined });
                      }
                      else if(value.decision == "denied" && value.gpa != null && value.weighted_avg != null){
                        var joined = this.state.declinedScores.concat({x: value.weighted_avg, y: value.gpa});
                        this.setState({ declinedScores: joined });
                      }
                      else if((value.decision == "deferred" || value.decision == "wait-listed" || value.decision == "withdrawn" || value.decision == "pending") && 
                      value.gpa != null && value.weighted_avg != null){
                        var joined = this.state.otherScores.concat({x: value.weighted_avg, y: value.gpa});
                        this.setState({ otherScores: joined });
                      }
                    }
                  }
                }
                let numApps = Object.keys(appDict).length;
                if(numApps > 0){
                  this.setState({avgGPA : Math.round(100*this.state.avgGPA / numApps)/100});
                  this.setState({avgMath : Math.round(this.state.avgMath / numApps)});
                  this.setState({avgEBRW : Math.round(this.state.avgEBRW / numApps)});
                  this.setState({avgACT : Math.round(10*this.state.avgACT / numApps)/10});
                  this.setState({avgAVG : Math.round(10*this.state.avgAVG / numApps)/10});
                  if(this.state.scatterPlotType == "SAT"){
                    this.setState({meanScore : [{x: this.state.avgMath + this.state.avgEBRW, y: this.state.avgGPA}]});
                  }
                  if(this.state.scatterPlotType == "ACT"){
                    this.setState({meanScore : [{x: this.state.avgACT, y: this.state.avgGPA}]});
                  }
                  if(this.state.scatterPlotType == "AVG"){
                    this.setState({meanScore: [{x: this.state.avgAVG, y: this.state.avgGPA}]});
                  }
                }else{
                  this.setState({avgGPA : 0});
                  this.setState({avgMath : 0});
                  this.setState({avgEBRW : 0});
                  this.setState({avgACT : 0});
                  this.setState({avgAVG : 0});
                  this.setState({acceptedScores: [], declinedScores: [], otherScores: [], meanScore: []});
                }
                this.setState({applications : appDict});
                this.sortTasks("status");
                alert("Finished Filtering");
              }
            }
          );
        }
        //filters: just name
        else if((this.state.applicationStatus == null || this.state.applicationStatus == "Select a Status:") &&
        (this.state.collegeClassMax == null || this.state.collegeClassMax == "") &&
        (this.state.collegeClassMin == null || this.state.collegeClassMin == "")&&
        (this.state.filterName != null || this.state.filterName != "")){
          let info = this.props.location.info;
          console.log("only name");
          if(!info){
            return <Redirect to = "/"></Redirect>;
          }
          let collegeInfo = info.temp;
          let collegeName = collegeInfo["Name"];
          let approvedDecRef = db.collection('ApprovedDecisions').doc(collegeName);
          let getDoc = approvedDecRef.get().then(
            doc => {
              if(!doc.exists){
                console.log("No such doc");
              }else{
                var appDict = {};
                this.setState({avgGPA : 0});
                this.setState({avgMath : 0});
                this.setState({avgEBRW : 0});
                this.setState({avgACT : 0});
                this.setState({avgAVG : 0});
                this.setState({acceptedScores: [], declinedScores: [], otherScores: [], meanScore: []});
                let data = doc.data();
                for (const key in data){
                  const value = data[key];
                  //console.log(key);
                  //console.log(value);
                  if(value.high_school_name == null || (value.high_school_name != null && value.high_school_name.toLowerCase().includes(this.state.filterName.toLowerCase()))){
                    appDict[key] = {
                      userid: key,
                      avgGPA: value.gpa,
                      avgSATMath: value.sat_math,
                      avgSATEBRW: value.sat_ebrw,
                      avgACTComp: value.act_composite,
                      decision: value.decision,
                      class: value.college_class,
                      hsName: value.high_school_name
                    };
                    if(value.gpa != null){
                      this.setState({avgGPA : this.state.avgGPA + value.gpa})
                    }
                    if(value.sat_math != null){
                      this.setState({avgMath : this.state.avgMath + value.sat_math})
                    }
                    if(value.sat_ebrw != null){
                      this.setState({avgEBRW : this.state.avgEBRW + value.sat_ebrw})
                    }
                    if(value.act_composite != null){
                      this.setState({avgACT : this.state.avgACT + value.act_composite})
                    }
                    if(value.weighted_avg != null){
                      this.setState({avgAVG : this.state.avgAVG + value.weighted_avg})
                    }
                    if(this.state.scatterPlotType == "SAT"){
                      if(value.decision == "accepted" && value.gpa != null && (value.sat_math != null || value.sat_ebrw != null)){
                        var combSAT = value.sat_math + value.sat_ebrw;
                        var joined = this.state.acceptedScores.concat({x: combSAT, y: value.gpa});
                        this.setState({ acceptedScores: joined });
                      }
                      else if(value.decision == "denied" && value.gpa != null && (value.sat_math != null || value.sat_ebrw != null)){
                        var combSAT = value.sat_math + value.sat_ebrw;
                        var joined = this.state.declinedScores.concat({x: combSAT, y: value.gpa});
                        this.setState({ declinedScores: joined });
                      }
                      else if((value.decision == "deferred" || value.decision == "wait-listed" || value.decision == "withdrawn" || value.decision == "pending") && 
                      value.gpa != null && (value.sat_math != null || value.sat_ebrw != null)){
                        var combSAT = value.sat_math + value.sat_ebrw;
                        var joined = this.state.otherScores.concat({x: combSAT, y: value.gpa});
                        this.setState({ otherScores: joined });
                      }
                    }
                    else if(this.state.scatterPlotType == "ACT"){
                      if(value.decision == "accepted" && value.gpa != null && value.act_composite != null){
                        var joined = this.state.acceptedScores.concat({x: value.act_composite, y: value.gpa});
                        this.setState({ acceptedScores: joined });
                      }
                      else if(value.decision == "denied" && value.gpa != null && value.act_composite != null){
                        var joined = this.state.declinedScores.concat({x: value.act_composite, y: value.gpa});
                        this.setState({ declinedScores: joined });
                      }
                      else if((value.decision == "deferred" || value.decision == "wait-listed" || value.decision == "withdrawn" || value.decision == "pending") && 
                      value.gpa != null && value.act_composite != null){
                        var joined = this.state.otherScores.concat({x: value.act_composite, y: value.gpa});
                        this.setState({ otherScores: joined });
                      }
                    }
                    else if(this.state.scatterPlotType == "AVG"){
                      if(value.decision == "accepted" && value.gpa != null && value.weighted_avg != null){
                        var joined = this.state.acceptedScores.concat({x: value.weighted_avg, y: value.gpa});
                        this.setState({ acceptedScores: joined });
                      }
                      else if(value.decision == "denied" && value.gpa != null && value.weighted_avg != null){
                        var joined = this.state.declinedScores.concat({x: value.weighted_avg, y: value.gpa});
                        this.setState({ declinedScores: joined });
                      }
                      else if((value.decision == "deferred" || value.decision == "wait-listed" || value.decision == "withdrawn" || value.decision == "pending") && 
                      value.gpa != null && value.weighted_avg != null){
                        var joined = this.state.otherScores.concat({x: value.weighted_avg, y: value.gpa});
                        this.setState({ otherScores: joined });
                      }
                    }
                  }
                }
                let numApps = Object.keys(appDict).length;
                if(numApps > 0){
                  this.setState({avgGPA : Math.round(100*this.state.avgGPA / numApps)/100});
                  this.setState({avgMath : Math.round(this.state.avgMath / numApps)});
                  this.setState({avgEBRW : Math.round(this.state.avgEBRW / numApps)});
                  this.setState({avgACT : Math.round(10*this.state.avgACT / numApps)/10});
                  this.setState({avgAVG : Math.round(10*this.state.avgAVG / numApps)/10});
                  if(this.state.scatterPlotType == "SAT"){
                    this.setState({meanScore : [{x: this.state.avgMath + this.state.avgEBRW, y: this.state.avgGPA}]});
                  }
                  if(this.state.scatterPlotType == "ACT"){
                    this.setState({meanScore : [{x: this.state.avgACT, y: this.state.avgGPA}]});
                  }
                  if(this.state.scatterPlotType == "AVG"){
                    this.setState({meanScore: [{x: this.state.avgAVG, y: this.state.avgGPA}]});
                  }
                }else{
                  this.setState({avgGPA : 0});
                  this.setState({avgMath : 0});
                  this.setState({avgEBRW : 0});
                  this.setState({avgACT : 0});
                  this.setState({avgAVG : 0});
                  this.setState({acceptedScores: [], declinedScores: [], otherScores: [], meanScore: []});
                }
                this.setState({applications : appDict});
                this.sortTasks("status");
                alert("Finished Filtering");
              }
            }
          );
        }
        //filters: name + status
        else if((this.state.applicationStatus != null || this.state.applicationStatus != "Select a Status:") &&
        (this.state.collegeClassMax == null || this.state.collegeClassMax == "") &&
        (this.state.collegeClassMin == null || this.state.collegeClassMin == "")&&
        (this.state.filterName != null || this.state.filterName != "")){
          let info = this.props.location.info;
          console.log("name + status");
          if(!info){
            return <Redirect to = "/"></Redirect>;
          }
          let collegeInfo = info.temp;
          let collegeName = collegeInfo["Name"];
          let approvedDecRef = db.collection('ApprovedDecisions').doc(collegeName);
          let getDoc = approvedDecRef.get().then(
            doc => {
              if(!doc.exists){
                console.log("No such doc");
              }else{
                var appDict = {};
                this.setState({avgGPA : 0});
                this.setState({avgMath : 0});
                this.setState({avgEBRW : 0});
                this.setState({avgACT : 0});
                this.setState({avgAVG : 0});
                this.setState({acceptedScores: [], declinedScores: [], otherScores: [], meanScore: []});
                let data = doc.data();
                for (const key in data){
                  const value = data[key];
                  //console.log(key);
                  //console.log(value);
                  if(value.high_school_name == null || (value.high_school_name != null && value.high_school_name.toLowerCase().includes(this.state.filterName.toLowerCase())
                  && value.decision == this.state.applicationStatus.toLowerCase())){
                    appDict[key] = {
                      userid: key,
                      avgGPA: value.gpa,
                      avgSATMath: value.sat_math,
                      avgSATEBRW: value.sat_ebrw,
                      avgACTComp: value.act_composite,
                      decision: value.decision,
                      class: value.college_class,
                      hsName: value.high_school_name
                    };
                    if(value.gpa != null){
                      this.setState({avgGPA : this.state.avgGPA + value.gpa})
                    }
                    if(value.sat_math != null){
                      this.setState({avgMath : this.state.avgMath + value.sat_math})
                    }
                    if(value.sat_ebrw != null){
                      this.setState({avgEBRW : this.state.avgEBRW + value.sat_ebrw})
                    }
                    if(value.act_composite != null){
                      this.setState({avgACT : this.state.avgACT + value.act_composite})
                    }
                    if(value.weighted_avg != null){
                      this.setState({avgAVG : this.state.avgAVG + value.weighted_avg})
                    }
                    if(this.state.scatterPlotType == "SAT"){
                      if(value.decision == "accepted" && value.gpa != null && (value.sat_math != null || value.sat_ebrw != null)){
                        var combSAT = value.sat_math + value.sat_ebrw;
                        var joined = this.state.acceptedScores.concat({x: combSAT, y: value.gpa});
                        this.setState({ acceptedScores: joined });
                      }
                      else if(value.decision == "denied" && value.gpa != null && (value.sat_math != null || value.sat_ebrw != null)){
                        var combSAT = value.sat_math + value.sat_ebrw;
                        var joined = this.state.declinedScores.concat({x: combSAT, y: value.gpa});
                        this.setState({ declinedScores: joined });
                      }
                      else if((value.decision == "deferred" || value.decision == "wait-listed" || value.decision == "withdrawn" || value.decision == "pending") && 
                      value.gpa != null && (value.sat_math != null || value.sat_ebrw != null)){
                        var combSAT = value.sat_math + value.sat_ebrw;
                        var joined = this.state.otherScores.concat({x: combSAT, y: value.gpa});
                        this.setState({ otherScores: joined });
                      }
                    }
                    else if(this.state.scatterPlotType == "ACT"){
                      if(value.decision == "accepted" && value.gpa != null && value.act_composite != null){
                        var joined = this.state.acceptedScores.concat({x: value.act_composite, y: value.gpa});
                        this.setState({ acceptedScores: joined });
                      }
                      else if(value.decision == "denied" && value.gpa != null && value.act_composite != null){
                        var joined = this.state.declinedScores.concat({x: value.act_composite, y: value.gpa});
                        this.setState({ declinedScores: joined });
                      }
                      else if((value.decision == "deferred" || value.decision == "wait-listed" || value.decision == "withdrawn" || value.decision == "pending") && 
                      value.gpa != null && value.act_composite != null){
                        var joined = this.state.otherScores.concat({x: value.act_composite, y: value.gpa});
                        this.setState({ otherScores: joined });
                      }
                    }
                    else if(this.state.scatterPlotType == "AVG"){
                      if(value.decision == "accepted" && value.gpa != null && value.weighted_avg != null){
                        var joined = this.state.acceptedScores.concat({x: value.weighted_avg, y: value.gpa});
                        this.setState({ acceptedScores: joined });
                      }
                      else if(value.decision == "denied" && value.gpa != null && value.weighted_avg != null){
                        var joined = this.state.declinedScores.concat({x: value.weighted_avg, y: value.gpa});
                        this.setState({ declinedScores: joined });
                      }
                      else if((value.decision == "deferred" || value.decision == "wait-listed" || value.decision == "withdrawn" || value.decision == "pending") && 
                      value.gpa != null && value.weighted_avg != null){
                        var joined = this.state.otherScores.concat({x: value.weighted_avg, y: value.gpa});
                        this.setState({ otherScores: joined });
                      }
                    }
                  }
                }
                let numApps = Object.keys(appDict).length;
                if(numApps > 0){
                  this.setState({avgGPA : Math.round(100*this.state.avgGPA / numApps)/100});
                  this.setState({avgMath : Math.round(this.state.avgMath / numApps)});
                  this.setState({avgEBRW : Math.round(this.state.avgEBRW / numApps)});
                  this.setState({avgACT : Math.round(10*this.state.avgACT / numApps)/10});
                  this.setState({avgAVG : Math.round(10*this.state.avgAVG / numApps)/10});
                  if(this.state.scatterPlotType == "SAT"){
                    this.setState({meanScore : [{x: this.state.avgMath + this.state.avgEBRW, y: this.state.avgGPA}]});
                  }
                  if(this.state.scatterPlotType == "ACT"){
                    this.setState({meanScore : [{x: this.state.avgACT, y: this.state.avgGPA}]});
                  }
                  if(this.state.scatterPlotType == "AVG"){
                    this.setState({meanScore: [{x: this.state.avgAVG, y: this.state.avgGPA}]});
                  }
                }else{
                  this.setState({avgGPA : 0});
                  this.setState({avgMath : 0});
                  this.setState({avgEBRW : 0});
                  this.setState({avgACT : 0});
                  this.setState({avgAVG : 0});
                  this.setState({acceptedScores: [], declinedScores: [], otherScores: [], meanScore: []});
                }
                this.setState({applications : appDict});
                this.sortTasks("status");
                alert("Finished Filtering");
              }
            }
          );
        }
        //filters: name + class
        else if((this.state.applicationStatus == null || this.state.applicationStatus == "Select a Status:") &&
        (this.state.collegeClassMax != null || this.state.collegeClassMax != "") &&
        (this.state.collegeClassMin != null || this.state.collegeClassMin != "")&&
        (this.state.filterName != null || this.state.filterName != "")){
          let info = this.props.location.info;
          console.log("name + class")
          if(!info){
            return <Redirect to = "/"></Redirect>;
          }
          let collegeInfo = info.temp;
          let collegeName = collegeInfo["Name"];
          let approvedDecRef = db.collection('ApprovedDecisions').doc(collegeName);
          let getDoc = approvedDecRef.get().then(
            doc => {
              if(!doc.exists){
                console.log("No such doc");
              }else{
                var appDict = {};
                this.setState({avgGPA : 0});
                this.setState({avgMath : 0});
                this.setState({avgEBRW : 0});
                this.setState({avgACT : 0});
                this.setState({avgAVG : 0});
                this.setState({acceptedScores: [], declinedScores: [], otherScores: [], meanScore: []});
                let data = doc.data();
                for (const key in data){
                  const value = data[key];
                  //console.log(key);
                  //console.log(value);
                  if(value.high_school_name == null || (value.high_school_name != null && value.high_school_name.toLowerCase().includes(this.state.filterName.toLowerCase())
                  &&(this.state.collegeClassMin <= value.college_class 
                    && (this.state.collegeClassMax != null && this.state.collegeClassMax != "" && value.college_class <= this.state.collegeClassMax)))){
                    appDict[key] = {
                      userid: key,
                      avgGPA: value.gpa,
                      avgSATMath: value.sat_math,
                      avgSATEBRW: value.sat_ebrw,
                      avgACTComp: value.act_composite,
                      decision: value.decision,
                      class: value.college_class,
                      hsName: value.high_school_name
                    };
                    if(value.gpa != null){
                      this.setState({avgGPA : this.state.avgGPA + value.gpa})
                    }
                    if(value.sat_math != null){
                      this.setState({avgMath : this.state.avgMath + value.sat_math})
                    }
                    if(value.sat_ebrw != null){
                      this.setState({avgEBRW : this.state.avgEBRW + value.sat_ebrw})
                    }
                    if(value.act_composite != null){
                      this.setState({avgACT : this.state.avgACT + value.act_composite})
                    }
                    if(value.weighted_avg != null){
                      this.setState({avgAVG : this.state.avgAVG + value.weighted_avg})
                    }
                    if(this.state.scatterPlotType == "SAT"){
                      if(value.decision == "accepted" && value.gpa != null && (value.sat_math != null || value.sat_ebrw != null)){
                        var combSAT = value.sat_math + value.sat_ebrw;
                        var joined = this.state.acceptedScores.concat({x: combSAT, y: value.gpa});
                        this.setState({ acceptedScores: joined });
                      }
                      else if(value.decision == "denied" && value.gpa != null && (value.sat_math != null || value.sat_ebrw != null)){
                        var combSAT = value.sat_math + value.sat_ebrw;
                        var joined = this.state.declinedScores.concat({x: combSAT, y: value.gpa});
                        this.setState({ declinedScores: joined });
                      }
                      else if((value.decision == "deferred" || value.decision == "wait-listed" || value.decision == "withdrawn" || value.decision == "pending") && 
                      value.gpa != null && (value.sat_math != null || value.sat_ebrw != null)){
                        var combSAT = value.sat_math + value.sat_ebrw;
                        var joined = this.state.otherScores.concat({x: combSAT, y: value.gpa});
                        this.setState({ otherScores: joined });
                      }
                    }
                    else if(this.state.scatterPlotType == "ACT"){
                      if(value.decision == "accepted" && value.gpa != null && value.act_composite != null){
                        var joined = this.state.acceptedScores.concat({x: value.act_composite, y: value.gpa});
                        this.setState({ acceptedScores: joined });
                      }
                      else if(value.decision == "denied" && value.gpa != null && value.act_composite != null){
                        var joined = this.state.declinedScores.concat({x: value.act_composite, y: value.gpa});
                        this.setState({ declinedScores: joined });
                      }
                      else if((value.decision == "deferred" || value.decision == "wait-listed" || value.decision == "withdrawn" || value.decision == "pending") && 
                      value.gpa != null && value.act_composite != null){
                        var joined = this.state.otherScores.concat({x: value.act_composite, y: value.gpa});
                        this.setState({ otherScores: joined });
                      }
                    }
                    else if(this.state.scatterPlotType == "AVG"){
                      if(value.decision == "accepted" && value.gpa != null && value.weighted_avg != null){
                        var joined = this.state.acceptedScores.concat({x: value.weighted_avg, y: value.gpa});
                        this.setState({ acceptedScores: joined });
                      }
                      else if(value.decision == "denied" && value.gpa != null && value.weighted_avg != null){
                        var joined = this.state.declinedScores.concat({x: value.weighted_avg, y: value.gpa});
                        this.setState({ declinedScores: joined });
                      }
                      else if((value.decision == "deferred" || value.decision == "wait-listed" || value.decision == "withdrawn" || value.decision == "pending") && 
                      value.gpa != null && value.weighted_avg != null){
                        var joined = this.state.otherScores.concat({x: value.weighted_avg, y: value.gpa});
                        this.setState({ otherScores: joined });
                      }
                    }
                  }
                }
                let numApps = Object.keys(appDict).length;
                if(numApps > 0){
                  this.setState({avgGPA : Math.round(100*this.state.avgGPA / numApps)/100});
                  this.setState({avgMath : Math.round(this.state.avgMath / numApps)});
                  this.setState({avgEBRW : Math.round(this.state.avgEBRW / numApps)});
                  this.setState({avgACT : Math.round(10*this.state.avgACT / numApps)/10});
                  this.setState({avgAVG : Math.round(10*this.state.avgAVG / numApps)/10});
                  if(this.state.scatterPlotType == "SAT"){
                    this.setState({meanScore : [{x: this.state.avgMath + this.state.avgEBRW, y: this.state.avgGPA}]});
                  }
                  if(this.state.scatterPlotType == "ACT"){
                    this.setState({meanScore : [{x: this.state.avgACT, y: this.state.avgGPA}]});
                  }
                  if(this.state.scatterPlotType == "AVG"){
                    this.setState({meanScore: [{x: this.state.avgAVG, y: this.state.avgGPA}]});
                  }
                }else{
                  this.setState({avgGPA : 0});
                  this.setState({avgMath : 0});
                  this.setState({avgEBRW : 0});
                  this.setState({avgACT : 0});
                  this.setState({avgAVG : 0});
                  this.setState({acceptedScores: [], declinedScores: [], otherScores: [], meanScore: []});
                }
                this.setState({applications : appDict});
                this.sortTasks("status");
                alert("Finished Filtering");
              }
            }
          );
        }
        //filters: name + status + class
        else if((this.state.applicationStatus != null || this.state.applicationStatus != "Select a Status:") &&
        (this.state.collegeClassMax != null || this.state.collegeClassMax != "") &&
        (this.state.collegeClassMin != null || this.state.collegeClassMin != "")&&
        (this.state.filterName != null || this.state.filterName != "")){
          let info = this.props.location.info;
          console.log("name + class + status")
          if(!info){
            return <Redirect to = "/"></Redirect>;
          }
          let collegeInfo = info.temp;
          let collegeName = collegeInfo["Name"];
          let approvedDecRef = db.collection('ApprovedDecisions').doc(collegeName);
          let getDoc = approvedDecRef.get().then(
            doc => {
              if(!doc.exists){
                console.log("No such doc");
              }else{
                var appDict = {};
                this.setState({avgGPA : 0});
                this.setState({avgMath : 0});
                this.setState({avgEBRW : 0});
                this.setState({avgACT : 0});
                this.setState({avgAVG : 0});
                this.setState({acceptedScores: [], declinedScores: [], otherScores: [], meanScore: []});
                let data = doc.data();
                for (const key in data){
                  const value = data[key];
                  //console.log(key);
                  //console.log(value);
                  if(value.high_school_name == null || (value.high_school_name != null && value.decision != null && value.high_school_name.toLowerCase().includes(this.state.filterName.toLowerCase())
                   && (this.state.collegeClassMin <= value.college_class && (this.state.collegeClassMax != null && this.state.collegeClassMax != "" && value.college_class <= this.state.collegeClassMax)) &&
                   value.decision == this.state.applicationStatus.toLowerCase())){
                    appDict[key] = {
                      userid: key,
                      avgGPA: value.gpa,
                      avgSATMath: value.sat_math,
                      avgSATEBRW: value.sat_ebrw,
                      avgACTComp: value.act_composite,
                      decision: value.decision,
                      class: value.college_class,
                      hsName: value.high_school_name
                    };
                    if(value.gpa != null){
                      this.setState({avgGPA : this.state.avgGPA + value.gpa})
                    }
                    if(value.sat_math != null){
                      this.setState({avgMath : this.state.avgMath + value.sat_math})
                    }
                    if(value.sat_ebrw != null){
                      this.setState({avgEBRW : this.state.avgEBRW + value.sat_ebrw})
                    }
                    if(value.act_composite != null){
                      this.setState({avgACT : this.state.avgACT + value.act_composite})
                    }
                    if(value.weighted_avg != null){
                      this.setState({avgAVG : this.state.avgAVG + value.weighted_avg})
                    }
                    if(this.state.scatterPlotType == "SAT"){
                      if(value.decision == "accepted" && value.gpa != null && (value.sat_math != null || value.sat_ebrw != null)){
                        var combSAT = value.sat_math + value.sat_ebrw;
                        var joined = this.state.acceptedScores.concat({x: combSAT, y: value.gpa});
                        this.setState({ acceptedScores: joined });
                      }
                      else if(value.decision == "denied" && value.gpa != null && (value.sat_math != null || value.sat_ebrw != null)){
                        var combSAT = value.sat_math + value.sat_ebrw;
                        var joined = this.state.declinedScores.concat({x: combSAT, y: value.gpa});
                        this.setState({ declinedScores: joined });
                      }
                      else if((value.decision == "deferred" || value.decision == "wait-listed" || value.decision == "withdrawn" || value.decision == "pending") && 
                      value.gpa != null && (value.sat_math != null || value.sat_ebrw != null)){
                        var combSAT = value.sat_math + value.sat_ebrw;
                        var joined = this.state.otherScores.concat({x: combSAT, y: value.gpa});
                        this.setState({ otherScores: joined });
                      }
                    }
                    else if(this.state.scatterPlotType == "ACT"){
                      if(value.decision == "accepted" && value.gpa != null && value.act_composite != null){
                        var joined = this.state.acceptedScores.concat({x: value.act_composite, y: value.gpa});
                        this.setState({ acceptedScores: joined });
                      }
                      else if(value.decision == "denied" && value.gpa != null && value.act_composite != null){
                        var joined = this.state.declinedScores.concat({x: value.act_composite, y: value.gpa});
                        this.setState({ declinedScores: joined });
                      }
                      else if((value.decision == "deferred" || value.decision == "wait-listed" || value.decision == "withdrawn" || value.decision == "pending") && 
                      value.gpa != null && value.act_composite != null){
                        var joined = this.state.otherScores.concat({x: value.act_composite, y: value.gpa});
                        this.setState({ otherScores: joined });
                      }
                    }
                    else if(this.state.scatterPlotType == "AVG"){
                      if(value.decision == "accepted" && value.gpa != null && value.weighted_avg != null){
                        var joined = this.state.acceptedScores.concat({x: value.weighted_avg, y: value.gpa});
                        this.setState({ acceptedScores: joined });
                      }
                      else if(value.decision == "denied" && value.gpa != null && value.weighted_avg != null){
                        var joined = this.state.declinedScores.concat({x: value.weighted_avg, y: value.gpa});
                        this.setState({ declinedScores: joined });
                      }
                      else if((value.decision == "deferred" || value.decision == "wait-listed" || value.decision == "withdrawn" || value.decision == "pending") && 
                      value.gpa != null && value.weighted_avg != null){
                        var joined = this.state.otherScores.concat({x: value.weighted_avg, y: value.gpa});
                        this.setState({ otherScores: joined });
                      }
                    }
                  }
                }
                let numApps = Object.keys(appDict).length;
                if(numApps > 0){
                  this.setState({avgGPA : Math.round(100*this.state.avgGPA / numApps)/100});
                  this.setState({avgMath : Math.round(this.state.avgMath / numApps)});
                  this.setState({avgEBRW : Math.round(this.state.avgEBRW / numApps)});
                  this.setState({avgACT : Math.round(10*this.state.avgACT / numApps)/10});
                  this.setState({avgAVG : Math.round(10*this.state.avgAVG / numApps)/10});
                  if(this.state.scatterPlotType == "SAT"){
                    this.setState({meanScore : [{x: this.state.avgMath + this.state.avgEBRW, y: this.state.avgGPA}]});
                  }
                  if(this.state.scatterPlotType == "ACT"){
                    this.setState({meanScore : [{x: this.state.avgACT, y: this.state.avgGPA}]});
                  }
                  if(this.state.scatterPlotType == "AVG"){
                    this.setState({meanScore: [{x: this.state.avgAVG, y: this.state.avgGPA}]});
                  }
                }else{
                  this.setState({avgGPA : 0});
                  this.setState({avgMath : 0});
                  this.setState({avgEBRW : 0});
                  this.setState({avgACT : 0});
                  this.setState({avgAVG : 0});
                  this.setState({acceptedScores: [], declinedScores: [], otherScores: [], meanScore: []});
                }
                this.setState({applications : appDict});
                this.sortTasks("status");
                alert("Finished Filtering");
              }
            }
          );
        }
    }else{ //STRICT SEARCH
      //filters: only applicationstatus
      //console.log("strct");
      if((this.state.applicationStatus != null && this.state.applicationStatus != "Select a Status:") &&
        (this.state.collegeClassMax == null || this.state.collegeClassMax == "") &&
        (this.state.collegeClassMin == null || this.state.collegeClassMin == "")&&
        (this.state.filterName == null || this.state.filterName == "")){
          console.log("only status")
          //query database for all applications
          let info = this.props.location.info;
          if(!info){
            return <Redirect to = "/"></Redirect>;
          }
          let collegeInfo = info.temp;
          let collegeName = collegeInfo["Name"];
          let approvedDecRef = db.collection('ApprovedDecisions').doc(collegeName);
          let getDoc = approvedDecRef.get().then(
            doc => {
              if(!doc.exists){
                console.log("No such doc");
              }else{
                var appDict = {};
                this.setState({avgGPA : 0});
                this.setState({avgMath : 0});
                this.setState({avgEBRW : 0});
                this.setState({avgACT : 0});
                this.setState({avgAVG : 0});
                this.setState({acceptedScores: [], declinedScores: [], otherScores: [], meanScore: []});
                let data = doc.data();
                for (const key in data){
                  const value = data[key];
                  //console.log(key);
                  //console.log(value);
                  if(value.decision.toLowerCase() == this.state.applicationStatus.toLowerCase()
                  && value.decision != null){
                    appDict[key] = {
                      userid: key,
                      avgGPA: value.gpa,
                      avgSATMath: value.sat_math,
                      avgSATEBRW: value.sat_ebrw,
                      avgACTComp: value.act_composite,
                      decision: value.decision,
                      class: value.college_class,
                      hsName: value.high_school_name
                    };
                    if(value.gpa != null){
                      this.setState({avgGPA : this.state.avgGPA + value.gpa})
                    }
                    if(value.sat_math != null){
                      this.setState({avgMath : this.state.avgMath + value.sat_math})
                    }
                    if(value.sat_ebrw != null){
                      this.setState({avgEBRW : this.state.avgEBRW + value.sat_ebrw})
                    }
                    if(value.act_composite != null){
                      this.setState({avgACT : this.state.avgACT + value.act_composite})
                    }
                    if(value.weighted_avg != null){
                      this.setState({avgAVG : this.state.avgAVG + value.weighted_avg})
                    }
                    if(this.state.scatterPlotType == "SAT"){
                      if(value.decision == "accepted" && value.gpa != null && (value.sat_math != null || value.sat_ebrw != null)){
                        var combSAT = value.sat_math + value.sat_ebrw;
                        var joined = this.state.acceptedScores.concat({x: combSAT, y: value.gpa});
                        this.setState({ acceptedScores: joined });
                      }
                      else if(value.decision == "denied" && value.gpa != null && (value.sat_math != null || value.sat_ebrw != null)){
                        var combSAT = value.sat_math + value.sat_ebrw;
                        var joined = this.state.declinedScores.concat({x: combSAT, y: value.gpa});
                        this.setState({ declinedScores: joined });
                      }
                      else if((value.decision == "deferred" || value.decision == "wait-listed" || value.decision == "withdrawn" || value.decision == "pending") && 
                      value.gpa != null && (value.sat_math != null || value.sat_ebrw != null)){
                        var combSAT = value.sat_math + value.sat_ebrw;
                        var joined = this.state.otherScores.concat({x: combSAT, y: value.gpa});
                        this.setState({ otherScores: joined });
                      }
                    }
                    else if(this.state.scatterPlotType == "ACT"){
                      if(value.decision == "accepted" && value.gpa != null && value.act_composite != null){
                        var joined = this.state.acceptedScores.concat({x: value.act_composite, y: value.gpa});
                        this.setState({ acceptedScores: joined });
                      }
                      else if(value.decision == "denied" && value.gpa != null && value.act_composite != null){
                        var joined = this.state.declinedScores.concat({x: value.act_composite, y: value.gpa});
                        this.setState({ declinedScores: joined });
                      }
                      else if((value.decision == "deferred" || value.decision == "wait-listed" || value.decision == "withdrawn" || value.decision == "pending") && 
                      value.gpa != null && value.act_composite != null){
                        var joined = this.state.otherScores.concat({x: value.act_composite, y: value.gpa});
                        this.setState({ otherScores: joined });
                      }
                    }
                    else if(this.state.scatterPlotType == "AVG"){
                      if(value.decision == "accepted" && value.gpa != null && value.weighted_avg != null){
                        var joined = this.state.acceptedScores.concat({x: value.weighted_avg, y: value.gpa});
                        this.setState({ acceptedScores: joined });
                      }
                      else if(value.decision == "denied" && value.gpa != null && value.weighted_avg != null){
                        var joined = this.state.declinedScores.concat({x: value.weighted_avg, y: value.gpa});
                        this.setState({ declinedScores: joined });
                      }
                      else if((value.decision == "deferred" || value.decision == "wait-listed" || value.decision == "withdrawn" || value.decision == "pending") && 
                      value.gpa != null && value.weighted_avg != null){
                        var joined = this.state.otherScores.concat({x: value.weighted_avg, y: value.gpa});
                        this.setState({ otherScores: joined });
                      }
                    }
                  }
                }
                let numApps = Object.keys(appDict).length;
                if(numApps > 0){
                  this.setState({avgGPA : Math.round(100*this.state.avgGPA / numApps)/100});
                  this.setState({avgMath : Math.round(this.state.avgMath / numApps)});
                  this.setState({avgEBRW : Math.round(this.state.avgEBRW / numApps)});
                  this.setState({avgACT : Math.round(10*this.state.avgACT / numApps)/10});
                  this.setState({avgAVG : Math.round(10*this.state.avgAVG / numApps)/10});
                  if(this.state.scatterPlotType == "SAT"){
                    this.setState({meanScore : [{x: this.state.avgMath + this.state.avgEBRW, y: this.state.avgGPA}]});
                  }
                  if(this.state.scatterPlotType == "ACT"){
                    this.setState({meanScore : [{x: this.state.avgACT, y: this.state.avgGPA}]});
                  }
                  if(this.state.scatterPlotType == "AVG"){
                    this.setState({meanScore: [{x: this.state.avgAVG, y: this.state.avgGPA}]});
                  }
                }else{
                  this.setState({avgGPA : 0});
                  this.setState({avgMath : 0});
                  this.setState({avgEBRW : 0});
                  this.setState({avgACT : 0});
                  this.setState({avgAVG : 0});
                  this.setState({acceptedScores: [], declinedScores: [], otherScores: [], meanScore: []});
                }
                this.setState({applications : appDict});
                this.sortTasks("status");
                alert("Finished Filtering");
              }
            }
          );
        }
        //filters: only class
        else if((this.state.applicationStatus == null || this.state.applicationStatus == "Select a Status:") &&
        (this.state.collegeClassMax != null || this.state.collegeClassMax != "") &&
        (this.state.collegeClassMin != null || this.state.collegeClassMin != "")&&
        (this.state.filterName == null || this.state.filterName == "")){
          let info = this.props.location.info;
          console.log("only class")
          if(!info){
            return <Redirect to = "/"></Redirect>;
          }
          let collegeInfo = info.temp;
          let collegeName = collegeInfo["Name"];
          let approvedDecRef = db.collection('ApprovedDecisions').doc(collegeName);
          let getDoc = approvedDecRef.get().then(
            doc => {
              if(!doc.exists){
                console.log("No such doc");
              }else{
                var appDict = {};
                this.setState({avgGPA : 0});this.setState({avgAVG : 0});
                this.setState({avgMath : 0});
                this.setState({avgEBRW : 0});
                this.setState({avgACT : 0});
                this.setState({acceptedScores: [], declinedScores: [], otherScores: [], meanScore: []});
                let data = doc.data();
                for (const key in data){
                  const value = data[key];
                  //console.log(key);
                  //console.log(value);
                  if(value.college_class != null && value.college_class >= this.state.collegeClassMin && 
                    (this.state.collegeClassMax != null && this.state.collegeClassMax != "" && value.college_class <= this.state.collegeClassMax)){
                    appDict[key] = {
                      userid: key,
                      avgGPA: value.gpa,
                      avgSATMath: value.sat_math,
                      avgSATEBRW: value.sat_ebrw,
                      avgACTComp: value.act_composite,
                      decision: value.decision,
                      class: value.college_class,
                      hsName: value.high_school_name
                    };
                    if(value.gpa != null){
                      this.setState({avgGPA : this.state.avgGPA + value.gpa})
                    }
                    if(value.sat_math != null){
                      this.setState({avgMath : this.state.avgMath + value.sat_math})
                    }
                    if(value.sat_ebrw != null){
                      this.setState({avgEBRW : this.state.avgEBRW + value.sat_ebrw})
                    }
                    if(value.act_composite != null){
                      this.setState({avgACT : this.state.avgACT + value.act_composite})
                    }
                    if(value.weighted_avg != null){
                      this.setState({avgAVG : this.state.avgAVG + value.weighted_avg})
                    }
                    if(this.state.scatterPlotType == "SAT"){
                      if(value.decision == "accepted" && value.gpa != null && (value.sat_math != null || value.sat_ebrw != null)){
                        var combSAT = value.sat_math + value.sat_ebrw;
                        var joined = this.state.acceptedScores.concat({x: combSAT, y: value.gpa});
                        this.setState({ acceptedScores: joined });
                      }
                      else if(value.decision == "denied" && value.gpa != null && (value.sat_math != null || value.sat_ebrw != null)){
                        var combSAT = value.sat_math + value.sat_ebrw;
                        var joined = this.state.declinedScores.concat({x: combSAT, y: value.gpa});
                        this.setState({ declinedScores: joined });
                      }
                      else if((value.decision == "deferred" || value.decision == "wait-listed" || value.decision == "withdrawn" || value.decision == "pending") && 
                      value.gpa != null && (value.sat_math != null || value.sat_ebrw != null)){
                        var combSAT = value.sat_math + value.sat_ebrw;
                        var joined = this.state.otherScores.concat({x: combSAT, y: value.gpa});
                        this.setState({ otherScores: joined });
                      }
                    }
                    else if(this.state.scatterPlotType == "ACT"){
                      if(value.decision == "accepted" && value.gpa != null && value.act_composite != null){
                        var joined = this.state.acceptedScores.concat({x: value.act_composite, y: value.gpa});
                        this.setState({ acceptedScores: joined });
                      }
                      else if(value.decision == "denied" && value.gpa != null && value.act_composite != null){
                        var joined = this.state.declinedScores.concat({x: value.act_composite, y: value.gpa});
                        this.setState({ declinedScores: joined });
                      }
                      else if((value.decision == "deferred" || value.decision == "wait-listed" || value.decision == "withdrawn" || value.decision == "pending") && 
                      value.gpa != null && value.act_composite != null){
                        var joined = this.state.otherScores.concat({x: value.act_composite, y: value.gpa});
                        this.setState({ otherScores: joined });
                      }
                    }
                    else if(this.state.scatterPlotType == "AVG"){
                      if(value.decision == "accepted" && value.gpa != null && value.weighted_avg != null){
                        var joined = this.state.acceptedScores.concat({x: value.weighted_avg, y: value.gpa});
                        this.setState({ acceptedScores: joined });
                      }
                      else if(value.decision == "denied" && value.gpa != null && value.weighted_avg != null){
                        var joined = this.state.declinedScores.concat({x: value.weighted_avg, y: value.gpa});
                        this.setState({ declinedScores: joined });
                      }
                      else if((value.decision == "deferred" || value.decision == "wait-listed" || value.decision == "withdrawn" || value.decision == "pending") && 
                      value.gpa != null && value.weighted_avg != null){
                        var joined = this.state.otherScores.concat({x: value.weighted_avg, y: value.gpa});
                        this.setState({ otherScores: joined });
                      }
                    }
                  }
                }
                let numApps = Object.keys(appDict).length;
                if(numApps > 0){
                  this.setState({avgGPA : Math.round(100*this.state.avgGPA / numApps)/100});
                  this.setState({avgMath : Math.round(this.state.avgMath / numApps)});
                  this.setState({avgEBRW : Math.round(this.state.avgEBRW / numApps)});
                  this.setState({avgACT : Math.round(10*this.state.avgACT / numApps)/10});
                  this.setState({avgAVG : Math.round(10*this.state.avgAVG / numApps)/10});
                  if(this.state.scatterPlotType == "SAT"){
                    this.setState({meanScore : [{x: this.state.avgMath + this.state.avgEBRW, y: this.state.avgGPA}]});
                  }
                  if(this.state.scatterPlotType == "ACT"){
                    this.setState({meanScore : [{x: this.state.avgACT, y: this.state.avgGPA}]});
                  }
                  if(this.state.scatterPlotType == "AVG"){
                    this.setState({meanScore: [{x: this.state.avgAVG, y: this.state.avgGPA}]});
                  }
                }else{
                  this.setState({avgGPA : 0});this.setState({avgAVG : 0});
                  this.setState({avgMath : 0});
                  this.setState({avgEBRW : 0});
                  this.setState({avgACT : 0});
                  this.setState({acceptedScores: [], declinedScores: [], otherScores: [], meanScore: []});
                }
                this.setState({applications : appDict});
                this.sortTasks("status");
                alert("Finished Filtering");
              }
            }
          );
        }
        //filters: only class + status
        else if((this.state.applicationStatus != null || this.state.applicationStatus != "Select a Status:") &&
        (this.state.collegeClassMax != null || this.state.collegeClassMax != "") &&
        (this.state.collegeClassMin != null || this.state.collegeClassMin != "")&&
        (this.state.filterName == null || this.state.filterName == "")){
          let info = this.props.location.info;
          console.log("class + status")
          if(!info){
            return <Redirect to = "/"></Redirect>;
          }
          let collegeInfo = info.temp;
          let collegeName = collegeInfo["Name"];
          let approvedDecRef = db.collection('ApprovedDecisions').doc(collegeName);
          let getDoc = approvedDecRef.get().then(
            doc => {
              if(!doc.exists){
                console.log("No such doc");
              }else{
                var appDict = {};
                this.setState({avgGPA : 0});this.setState({avgAVG : 0});
                this.setState({avgMath : 0});
                this.setState({avgEBRW : 0});
                this.setState({avgACT : 0});
                this.setState({acceptedScores: [], declinedScores: [], otherScores: [], meanScore: []});
                let data = doc.data();
                for (const key in data){
                  const value = data[key];
                  //console.log(key);
                  //console.log(value);
                  if(value.decision != null && value.college_class != null && value.college_class >= this.state.collegeClassMin 
                    && (this.state.collegeClassMax != null && this.state.collegeClassMax != "" && value.college_class <= this.state.collegeClassMax) 
                    && value.decision.toLowerCase() == this.state.applicationStatus.toLowerCase()){
                    appDict[key] = {
                      userid: key,
                      avgGPA: value.gpa,
                      avgSATMath: value.sat_math,
                      avgSATEBRW: value.sat_ebrw,
                      avgACTComp: value.act_composite,
                      decision: value.decision,
                      class: value.college_class,
                      hsName: value.high_school_name
                    };
                    if(value.gpa != null){
                      this.setState({avgGPA : this.state.avgGPA + value.gpa})
                    }
                    if(value.sat_math != null){
                      this.setState({avgMath : this.state.avgMath + value.sat_math})
                    }
                    if(value.sat_ebrw != null){
                      this.setState({avgEBRW : this.state.avgEBRW + value.sat_ebrw})
                    }
                    if(value.act_composite != null){
                      this.setState({avgACT : this.state.avgACT + value.act_composite})
                    }
                    if(value.weighted_avg != null){
                      this.setState({avgAVG : this.state.avgAVG + value.weighted_avg})
                    }
                    if(this.state.scatterPlotType == "SAT"){
                      if(value.decision == "accepted" && value.gpa != null && (value.sat_math != null || value.sat_ebrw != null)){
                        var combSAT = value.sat_math + value.sat_ebrw;
                        var joined = this.state.acceptedScores.concat({x: combSAT, y: value.gpa});
                        this.setState({ acceptedScores: joined });
                      }
                      else if(value.decision == "denied" && value.gpa != null && (value.sat_math != null || value.sat_ebrw != null)){
                        var combSAT = value.sat_math + value.sat_ebrw;
                        var joined = this.state.declinedScores.concat({x: combSAT, y: value.gpa});
                        this.setState({ declinedScores: joined });
                      }
                      else if((value.decision == "deferred" || value.decision == "wait-listed" || value.decision == "withdrawn" || value.decision == "pending") && 
                      value.gpa != null && (value.sat_math != null || value.sat_ebrw != null)){
                        var combSAT = value.sat_math + value.sat_ebrw;
                        var joined = this.state.otherScores.concat({x: combSAT, y: value.gpa});
                        this.setState({ otherScores: joined });
                      }
                    }
                    else if(this.state.scatterPlotType == "ACT"){
                      if(value.decision == "accepted" && value.gpa != null && value.act_composite != null){
                        var joined = this.state.acceptedScores.concat({x: value.act_composite, y: value.gpa});
                        this.setState({ acceptedScores: joined });
                      }
                      else if(value.decision == "denied" && value.gpa != null && value.act_composite != null){
                        var joined = this.state.declinedScores.concat({x: value.act_composite, y: value.gpa});
                        this.setState({ declinedScores: joined });
                      }
                      else if((value.decision == "deferred" || value.decision == "wait-listed" || value.decision == "withdrawn" || value.decision == "pending") && 
                      value.gpa != null && value.act_composite != null){
                        var joined = this.state.otherScores.concat({x: value.act_composite, y: value.gpa});
                        this.setState({ otherScores: joined });
                      }
                    }
                    else if(this.state.scatterPlotType == "AVG"){
                      if(value.decision == "accepted" && value.gpa != null && value.weighted_avg != null){
                        var joined = this.state.acceptedScores.concat({x: value.weighted_avg, y: value.gpa});
                        this.setState({ acceptedScores: joined });
                      }
                      else if(value.decision == "denied" && value.gpa != null && value.weighted_avg != null){
                        var joined = this.state.declinedScores.concat({x: value.weighted_avg, y: value.gpa});
                        this.setState({ declinedScores: joined });
                      }
                      else if((value.decision == "deferred" || value.decision == "wait-listed" || value.decision == "withdrawn" || value.decision == "pending") && 
                      value.gpa != null && value.weighted_avg != null){
                        var joined = this.state.otherScores.concat({x: value.weighted_avg, y: value.gpa});
                        this.setState({ otherScores: joined });
                      }
                    }
                  }
                }
                let numApps = Object.keys(appDict).length;
                if(numApps > 0){
                  this.setState({avgGPA : Math.round(100*this.state.avgGPA / numApps)/100});
                  this.setState({avgMath : Math.round(this.state.avgMath / numApps)});
                  this.setState({avgEBRW : Math.round(this.state.avgEBRW / numApps)});
                  this.setState({avgACT : Math.round(10*this.state.avgACT / numApps)/10});
                  this.setState({avgAVG : Math.round(10*this.state.avgAVG / numApps)/10});
                  if(this.state.scatterPlotType == "SAT"){
                    this.setState({meanScore : [{x: this.state.avgMath + this.state.avgEBRW, y: this.state.avgGPA}]});
                  }
                  if(this.state.scatterPlotType == "ACT"){
                    this.setState({meanScore : [{x: this.state.avgACT, y: this.state.avgGPA}]});
                  }
                  if(this.state.scatterPlotType == "AVG"){
                    this.setState({meanScore: [{x: this.state.avgAVG, y: this.state.avgGPA}]});
                  }
                }else{
                  this.setState({avgGPA : 0});this.setState({avgAVG : 0});
                  this.setState({avgMath : 0});
                  this.setState({avgEBRW : 0});
                  this.setState({avgACT : 0});
                  this.setState({acceptedScores: [], declinedScores: [], otherScores: [], meanScore: []});
                }
                this.setState({applications : appDict});
                this.sortTasks("status");
                alert("Finished Filtering");
              }
            }
          );
        }
        //filters: just name
        else if((this.state.applicationStatus == null || this.state.applicationStatus == "Select a Status:") &&
        (this.state.collegeClassMax == null || this.state.collegeClassMax == "") &&
        (this.state.collegeClassMin == null || this.state.collegeClassMin == "")&&
        (this.state.filterName != null || this.state.filterName != "")){
          let info = this.props.location.info;
          console.log("only name");
          if(!info){
            return <Redirect to = "/"></Redirect>;
          }
          let collegeInfo = info.temp;
          let collegeName = collegeInfo["Name"];
          let approvedDecRef = db.collection('ApprovedDecisions').doc(collegeName);
          let getDoc = approvedDecRef.get().then(
            doc => {
              if(!doc.exists){
                console.log("No such doc");
              }else{
                var appDict = {};
                this.setState({avgGPA : 0});this.setState({avgAVG : 0});
                this.setState({avgMath : 0});
                this.setState({avgEBRW : 0});
                this.setState({avgACT : 0});
                this.setState({acceptedScores: [], declinedScores: [], otherScores: [], meanScore: []});
                let data = doc.data();
                for (const key in data){
                  const value = data[key];
                  //console.log(key);
                  //console.log(value);
                  if(value.high_school_name != null && value.high_school_name.toLowerCase().includes(this.state.filterName.toLowerCase())){
                    appDict[key] = {
                      userid: key,
                      avgGPA: value.gpa,
                      avgSATMath: value.sat_math,
                      avgSATEBRW: value.sat_ebrw,
                      avgACTComp: value.act_composite,
                      decision: value.decision,
                      class: value.college_class,
                      hsName: value.high_school_name
                    };
                    if(value.gpa != null){
                      this.setState({avgGPA : this.state.avgGPA + value.gpa})
                    }
                    if(value.sat_math != null){
                      this.setState({avgMath : this.state.avgMath + value.sat_math})
                    }
                    if(value.sat_ebrw != null){
                      this.setState({avgEBRW : this.state.avgEBRW + value.sat_ebrw})
                    }
                    if(value.act_composite != null){
                      this.setState({avgACT : this.state.avgACT + value.act_composite})
                    }
                    if(value.weighted_avg != null){
                      this.setState({avgAVG : this.state.avgAVG + value.weighted_avg})
                    }
                    if(this.state.scatterPlotType == "SAT"){
                      if(value.decision == "accepted" && value.gpa != null && (value.sat_math != null || value.sat_ebrw != null)){
                        var combSAT = value.sat_math + value.sat_ebrw;
                        var joined = this.state.acceptedScores.concat({x: combSAT, y: value.gpa});
                        this.setState({ acceptedScores: joined });
                      }
                      else if(value.decision == "denied" && value.gpa != null && (value.sat_math != null || value.sat_ebrw != null)){
                        var combSAT = value.sat_math + value.sat_ebrw;
                        var joined = this.state.declinedScores.concat({x: combSAT, y: value.gpa});
                        this.setState({ declinedScores: joined });
                      }
                      else if((value.decision == "deferred" || value.decision == "wait-listed" || value.decision == "withdrawn" || value.decision == "pending") && 
                      value.gpa != null && (value.sat_math != null || value.sat_ebrw != null)){
                        var combSAT = value.sat_math + value.sat_ebrw;
                        var joined = this.state.otherScores.concat({x: combSAT, y: value.gpa});
                        this.setState({ otherScores: joined });
                      }
                    }
                    else if(this.state.scatterPlotType == "ACT"){
                      if(value.decision == "accepted" && value.gpa != null && value.act_composite != null){
                        var joined = this.state.acceptedScores.concat({x: value.act_composite, y: value.gpa});
                        this.setState({ acceptedScores: joined });
                      }
                      else if(value.decision == "denied" && value.gpa != null && value.act_composite != null){
                        var joined = this.state.declinedScores.concat({x: value.act_composite, y: value.gpa});
                        this.setState({ declinedScores: joined });
                      }
                      else if((value.decision == "deferred" || value.decision == "wait-listed" || value.decision == "withdrawn" || value.decision == "pending") && 
                      value.gpa != null && value.act_composite != null){
                        var joined = this.state.otherScores.concat({x: value.act_composite, y: value.gpa});
                        this.setState({ otherScores: joined });
                      }
                    }
                    else if(this.state.scatterPlotType == "AVG"){
                      if(value.decision == "accepted" && value.gpa != null && value.weighted_avg != null){
                        var joined = this.state.acceptedScores.concat({x: value.weighted_avg, y: value.gpa});
                        this.setState({ acceptedScores: joined });
                      }
                      else if(value.decision == "denied" && value.gpa != null && value.weighted_avg != null){
                        var joined = this.state.declinedScores.concat({x: value.weighted_avg, y: value.gpa});
                        this.setState({ declinedScores: joined });
                      }
                      else if((value.decision == "deferred" || value.decision == "wait-listed" || value.decision == "withdrawn" || value.decision == "pending") && 
                      value.gpa != null && value.weighted_avg != null){
                        var joined = this.state.otherScores.concat({x: value.weighted_avg, y: value.gpa});
                        this.setState({ otherScores: joined });
                      }
                    }
                  }
                }
                let numApps = Object.keys(appDict).length;
                if(numApps > 0){
                  this.setState({avgGPA : Math.round(100*this.state.avgGPA / numApps)/100});
                  this.setState({avgMath : Math.round(this.state.avgMath / numApps)});
                  this.setState({avgEBRW : Math.round(this.state.avgEBRW / numApps)});
                  this.setState({avgACT : Math.round(10*this.state.avgACT / numApps)/10});
                  this.setState({avgAVG : Math.round(10*this.state.avgAVG / numApps)/10});
                  if(this.state.scatterPlotType == "SAT"){
                    this.setState({meanScore : [{x: this.state.avgMath + this.state.avgEBRW, y: this.state.avgGPA}]});
                  }
                  if(this.state.scatterPlotType == "ACT"){
                    this.setState({meanScore : [{x: this.state.avgACT, y: this.state.avgGPA}]});
                  }
                  if(this.state.scatterPlotType == "AVG"){
                    this.setState({meanScore: [{x: this.state.avgAVG, y: this.state.avgGPA}]});
                  }
                }else{
                  this.setState({avgGPA : 0});this.setState({avgAVG : 0});
                  this.setState({avgMath : 0});
                  this.setState({avgEBRW : 0});
                  this.setState({avgACT : 0});
                  this.setState({acceptedScores: [], declinedScores: [], otherScores: [], meanScore: []});
                }
                this.setState({applications : appDict});
                this.sortTasks("status");
                alert("Finished Filtering");
              }
            }
          );
        }
        //filters: name + status
        else if((this.state.applicationStatus != null || this.state.applicationStatus != "Select a Status:") &&
        (this.state.collegeClassMax == null || this.state.collegeClassMax == "") &&
        (this.state.collegeClassMin == null || this.state.collegeClassMin == "")&&
        (this.state.filterName != null || this.state.filterName != "")){
          let info = this.props.location.info;
          console.log("name + status");
          if(!info){
            return <Redirect to = "/"></Redirect>;
          }
          let collegeInfo = info.temp;
          let collegeName = collegeInfo["Name"];
          let approvedDecRef = db.collection('ApprovedDecisions').doc(collegeName);
          let getDoc = approvedDecRef.get().then(
            doc => {
              if(!doc.exists){
                console.log("No such doc");
              }else{
                var appDict = {};
                this.setState({avgGPA : 0});this.setState({avgAVG : 0});
                this.setState({avgMath : 0});
                this.setState({avgEBRW : 0});
                this.setState({avgACT : 0});
                this.setState({acceptedScores: [], declinedScores: [], otherScores: [], meanScore: []});
                let data = doc.data();
                for (const key in data){
                  const value = data[key];
                  //console.log(key);
                  //console.log(value);
                  if(value.high_school_name != null && value.high_school_name.toLowerCase().includes(this.state.filterName.toLowerCase())
                  && value.decision == this.state.applicationStatus.toLowerCase()){
                    appDict[key] = {
                      userid: key,
                      avgGPA: value.gpa,
                      avgSATMath: value.sat_math,
                      avgSATEBRW: value.sat_ebrw,
                      avgACTComp: value.act_composite,
                      decision: value.decision,
                      class: value.college_class,
                      hsName: value.high_school_name
                    };
                    if(value.gpa != null){
                      this.setState({avgGPA : this.state.avgGPA + value.gpa})
                    }
                    if(value.sat_math != null){
                      this.setState({avgMath : this.state.avgMath + value.sat_math})
                    }
                    if(value.sat_ebrw != null){
                      this.setState({avgEBRW : this.state.avgEBRW + value.sat_ebrw})
                    }
                    if(value.act_composite != null){
                      this.setState({avgACT : this.state.avgACT + value.act_composite})
                    }
                    if(value.weighted_avg != null){
                      this.setState({avgAVG : this.state.avgAVG + value.weighted_avg})
                    }
                    if(this.state.scatterPlotType == "SAT"){
                      if(value.decision == "accepted" && value.gpa != null && (value.sat_math != null || value.sat_ebrw != null)){
                        var combSAT = value.sat_math + value.sat_ebrw;
                        var joined = this.state.acceptedScores.concat({x: combSAT, y: value.gpa});
                        this.setState({ acceptedScores: joined });
                      }
                      else if(value.decision == "denied" && value.gpa != null && (value.sat_math != null || value.sat_ebrw != null)){
                        var combSAT = value.sat_math + value.sat_ebrw;
                        var joined = this.state.declinedScores.concat({x: combSAT, y: value.gpa});
                        this.setState({ declinedScores: joined });
                      }
                      else if((value.decision == "deferred" || value.decision == "wait-listed" || value.decision == "withdrawn" || value.decision == "pending") && 
                      value.gpa != null && (value.sat_math != null || value.sat_ebrw != null)){
                        var combSAT = value.sat_math + value.sat_ebrw;
                        var joined = this.state.otherScores.concat({x: combSAT, y: value.gpa});
                        this.setState({ otherScores: joined });
                      }
                    }
                    else if(this.state.scatterPlotType == "ACT"){
                      if(value.decision == "accepted" && value.gpa != null && value.act_composite != null){
                        var joined = this.state.acceptedScores.concat({x: value.act_composite, y: value.gpa});
                        this.setState({ acceptedScores: joined });
                      }
                      else if(value.decision == "denied" && value.gpa != null && value.act_composite != null){
                        var joined = this.state.declinedScores.concat({x: value.act_composite, y: value.gpa});
                        this.setState({ declinedScores: joined });
                      }
                      else if((value.decision == "deferred" || value.decision == "wait-listed" || value.decision == "withdrawn" || value.decision == "pending") && 
                      value.gpa != null && value.act_composite != null){
                        var joined = this.state.otherScores.concat({x: value.act_composite, y: value.gpa});
                        this.setState({ otherScores: joined });
                      }
                    }
                    else if(this.state.scatterPlotType == "AVG"){
                      if(value.decision == "accepted" && value.gpa != null && value.weighted_avg != null){
                        var joined = this.state.acceptedScores.concat({x: value.weighted_avg, y: value.gpa});
                        this.setState({ acceptedScores: joined });
                      }
                      else if(value.decision == "denied" && value.gpa != null && value.weighted_avg != null){
                        var joined = this.state.declinedScores.concat({x: value.weighted_avg, y: value.gpa});
                        this.setState({ declinedScores: joined });
                      }
                      else if((value.decision == "deferred" || value.decision == "wait-listed" || value.decision == "withdrawn" || value.decision == "pending") && 
                      value.gpa != null && value.weighted_avg != null){
                        var joined = this.state.otherScores.concat({x: value.weighted_avg, y: value.gpa});
                        this.setState({ otherScores: joined });
                      }
                    }
                  }
                }
                let numApps = Object.keys(appDict).length;
                if(numApps > 0){
                  this.setState({avgGPA : Math.round(100*this.state.avgGPA / numApps)/100});
                  this.setState({avgMath : Math.round(this.state.avgMath / numApps)});
                  this.setState({avgEBRW : Math.round(this.state.avgEBRW / numApps)});
                  this.setState({avgACT : Math.round(10*this.state.avgACT / numApps)/10});
                  this.setState({avgAVG : Math.round(10*this.state.avgAVG / numApps)/10});
                  if(this.state.scatterPlotType == "SAT"){
                    this.setState({meanScore : [{x: this.state.avgMath + this.state.avgEBRW, y: this.state.avgGPA}]});
                  }
                  if(this.state.scatterPlotType == "ACT"){
                    this.setState({meanScore : [{x: this.state.avgACT, y: this.state.avgGPA}]});
                  }
                  if(this.state.scatterPlotType == "AVG"){
                    this.setState({meanScore: [{x: this.state.avgAVG, y: this.state.avgGPA}]});
                  }
                }else{
                  this.setState({avgGPA : 0});this.setState({avgAVG : 0});
                  this.setState({avgMath : 0});
                  this.setState({avgEBRW : 0});
                  this.setState({avgACT : 0});
                  this.setState({acceptedScores: [], declinedScores: [], otherScores: [], meanScore: []});
                }
                this.setState({applications : appDict});
                this.sortTasks("status");
                alert("Finished Filtering");
              }
            }
          );
        }
        //filters: name + class
        else if((this.state.applicationStatus == null || this.state.applicationStatus == "Select a Status:") &&
        (this.state.collegeClassMax != null || this.state.collegeClassMax != "") &&
        (this.state.collegeClassMin != null || this.state.collegeClassMin != "")&&
        (this.state.filterName != null || this.state.filterName != "")){
          let info = this.props.location.info;
          console.log("name + class")
          if(!info){
            return <Redirect to = "/"></Redirect>;
          }
          let collegeInfo = info.temp;
          let collegeName = collegeInfo["Name"];
          let approvedDecRef = db.collection('ApprovedDecisions').doc(collegeName);
          let getDoc = approvedDecRef.get().then(
            doc => {
              if(!doc.exists){
                console.log("No such doc");
              }else{
                var appDict = {};
                this.setState({avgGPA : 0});this.setState({avgAVG : 0});
                this.setState({avgMath : 0});
                this.setState({avgEBRW : 0});
                this.setState({avgACT : 0});
                this.setState({acceptedScores: [], declinedScores: [], otherScores: [], meanScore: []});
                let data = doc.data();
                for (const key in data){
                  const value = data[key];
                  //console.log(key);
                  //console.log(value);
                  if(value.high_school_name != null && value.college_class != null && value.high_school_name.toLowerCase().includes(this.state.filterName.toLowerCase())
                  &&(this.state.collegeClassMin <= value.college_class 
                    && (this.state.collegeClassMax != null && this.state.collegeClassMax != "" && value.college_class <= this.state.collegeClassMax))){
                    appDict[key] = {
                      userid: key,
                      avgGPA: value.gpa,
                      avgSATMath: value.sat_math,
                      avgSATEBRW: value.sat_ebrw,
                      avgACTComp: value.act_composite,
                      decision: value.decision,
                      class: value.college_class,
                      hsName: value.high_school_name
                    };
                    if(value.gpa != null){
                      this.setState({avgGPA : this.state.avgGPA + value.gpa})
                    }
                    if(value.sat_math != null){
                      this.setState({avgMath : this.state.avgMath + value.sat_math})
                    }
                    if(value.sat_ebrw != null){
                      this.setState({avgEBRW : this.state.avgEBRW + value.sat_ebrw})
                    }
                    if(value.act_composite != null){
                      this.setState({avgACT : this.state.avgACT + value.act_composite})
                    }
                    if(value.weighted_avg != null){
                      this.setState({avgAVG : this.state.avgAVG + value.weighted_avg})
                    }
                    if(this.state.scatterPlotType == "SAT"){
                      if(value.decision == "accepted" && value.gpa != null && (value.sat_math != null || value.sat_ebrw != null)){
                        var combSAT = value.sat_math + value.sat_ebrw;
                        var joined = this.state.acceptedScores.concat({x: combSAT, y: value.gpa});
                        this.setState({ acceptedScores: joined });
                      }
                      else if(value.decision == "denied" && value.gpa != null && (value.sat_math != null || value.sat_ebrw != null)){
                        var combSAT = value.sat_math + value.sat_ebrw;
                        var joined = this.state.declinedScores.concat({x: combSAT, y: value.gpa});
                        this.setState({ declinedScores: joined });
                      }
                      else if((value.decision == "deferred" || value.decision == "wait-listed" || value.decision == "withdrawn" || value.decision == "pending") && 
                      value.gpa != null && (value.sat_math != null || value.sat_ebrw != null)){
                        var combSAT = value.sat_math + value.sat_ebrw;
                        var joined = this.state.otherScores.concat({x: combSAT, y: value.gpa});
                        this.setState({ otherScores: joined });
                      }
                    }
                    else if(this.state.scatterPlotType == "ACT"){
                      if(value.decision == "accepted" && value.gpa != null && value.act_composite != null){
                        var joined = this.state.acceptedScores.concat({x: value.act_composite, y: value.gpa});
                        this.setState({ acceptedScores: joined });
                      }
                      else if(value.decision == "denied" && value.gpa != null && value.act_composite != null){
                        var joined = this.state.declinedScores.concat({x: value.act_composite, y: value.gpa});
                        this.setState({ declinedScores: joined });
                      }
                      else if((value.decision == "deferred" || value.decision == "wait-listed" || value.decision == "withdrawn" || value.decision == "pending") && 
                      value.gpa != null && value.act_composite != null){
                        var joined = this.state.otherScores.concat({x: value.act_composite, y: value.gpa});
                        this.setState({ otherScores: joined });
                      }
                    }
                    else if(this.state.scatterPlotType == "AVG"){
                      if(value.decision == "accepted" && value.gpa != null && value.weighted_avg != null){
                        var joined = this.state.acceptedScores.concat({x: value.weighted_avg, y: value.gpa});
                        this.setState({ acceptedScores: joined });
                      }
                      else if(value.decision == "denied" && value.gpa != null && value.weighted_avg != null){
                        var joined = this.state.declinedScores.concat({x: value.weighted_avg, y: value.gpa});
                        this.setState({ declinedScores: joined });
                      }
                      else if((value.decision == "deferred" || value.decision == "wait-listed" || value.decision == "withdrawn" || value.decision == "pending") && 
                      value.gpa != null && value.weighted_avg != null){
                        var joined = this.state.otherScores.concat({x: value.weighted_avg, y: value.gpa});
                        this.setState({ otherScores: joined });
                      }
                    }
                  }
                }
                let numApps = Object.keys(appDict).length;
                if(numApps > 0){
                  this.setState({avgGPA : Math.round(100*this.state.avgGPA / numApps)/100});
                  this.setState({avgMath : Math.round(this.state.avgMath / numApps)});
                  this.setState({avgEBRW : Math.round(this.state.avgEBRW / numApps)});
                  this.setState({avgACT : Math.round(10*this.state.avgACT / numApps)/10});
                  this.setState({avgAVG : Math.round(10*this.state.avgAVG / numApps)/10});
                  if(this.state.scatterPlotType == "SAT"){
                    this.setState({meanScore : [{x: this.state.avgMath + this.state.avgEBRW, y: this.state.avgGPA}]});
                  }
                  if(this.state.scatterPlotType == "ACT"){
                    this.setState({meanScore : [{x: this.state.avgACT, y: this.state.avgGPA}]});
                  }
                  if(this.state.scatterPlotType == "AVG"){
                    this.setState({meanScore: [{x: this.state.avgAVG, y: this.state.avgGPA}]});
                  }
                }else{
                  this.setState({avgGPA : 0});this.setState({avgAVG : 0});
                  this.setState({avgMath : 0});
                  this.setState({avgEBRW : 0});
                  this.setState({avgACT : 0});
                  this.setState({acceptedScores: [], declinedScores: [], otherScores: [], meanScore: []});
                }
                this.setState({applications : appDict});
                this.sortTasks("status");
                alert("Finished Filtering");
              }
            }
          );
        }
        //filters: name + status + class
        else if((this.state.applicationStatus != null || this.state.applicationStatus != "Select a Status:") &&
        (this.state.collegeClassMax != null || this.state.collegeClassMax != "") &&
        (this.state.collegeClassMin != null || this.state.collegeClassMin != "")&&
        (this.state.filterName != null || this.state.filterName != "")){
          let info = this.props.location.info;
          console.log("name + class + status")
          if(!info){
            return <Redirect to = "/"></Redirect>;
          }
          let collegeInfo = info.temp;
          let collegeName = collegeInfo["Name"];
          let approvedDecRef = db.collection('ApprovedDecisions').doc(collegeName);
          let getDoc = approvedDecRef.get().then(
            doc => {
              if(!doc.exists){
                console.log("No such doc");
              }else{
                var appDict = {};
                this.setState({avgGPA : 0});this.setState({avgAVG : 0});
                this.setState({avgMath : 0});
                this.setState({avgEBRW : 0});
                this.setState({avgACT : 0});
                this.setState({acceptedScores: [], declinedScores: [], otherScores: [], meanScore: []});
                let data = doc.data();
                for (const key in data){
                  const value = data[key];
                  //console.log(key);
                  //console.log(value);
                  if(value.high_school_name != null && value.decision != null && value.college_class != null && value.high_school_name.toLowerCase().includes(this.state.filterName.toLowerCase())
                   && (this.state.collegeClassMin <= value.college_class && (this.state.collegeClassMax != null && this.state.collegeClassMax != "" && value.college_class <= this.state.collegeClassMax)) &&
                   value.decision == this.state.applicationStatus.toLowerCase()){
                    appDict[key] = {
                      userid: key,
                      avgGPA: value.gpa,
                      avgSATMath: value.sat_math,
                      avgSATEBRW: value.sat_ebrw,
                      avgACTComp: value.act_composite,
                      decision: value.decision,
                      class: value.college_class,
                      hsName: value.high_school_name
                    };
                    if(value.gpa != null){
                      this.setState({avgGPA : this.state.avgGPA + value.gpa})
                    }
                    if(value.sat_math != null){
                      this.setState({avgMath : this.state.avgMath + value.sat_math})
                    }
                    if(value.sat_ebrw != null){
                      this.setState({avgEBRW : this.state.avgEBRW + value.sat_ebrw})
                    }
                    if(value.act_composite != null){
                      this.setState({avgACT : this.state.avgACT + value.act_composite})
                    }
                    if(value.weighted_avg != null){
                      this.setState({avgAVG : this.state.avgAVG + value.weighted_avg})
                    }
                    if(this.state.scatterPlotType == "SAT"){
                      if(value.decision == "accepted" && value.gpa != null && (value.sat_math != null || value.sat_ebrw != null)){
                        var combSAT = value.sat_math + value.sat_ebrw;
                        var joined = this.state.acceptedScores.concat({x: combSAT, y: value.gpa});
                        this.setState({ acceptedScores: joined });
                      }
                      else if(value.decision == "denied" && value.gpa != null && (value.sat_math != null || value.sat_ebrw != null)){
                        var combSAT = value.sat_math + value.sat_ebrw;
                        var joined = this.state.declinedScores.concat({x: combSAT, y: value.gpa});
                        this.setState({ declinedScores: joined });
                      }
                      else if((value.decision == "deferred" || value.decision == "wait-listed" || value.decision == "withdrawn" || value.decision == "pending") && 
                      value.gpa != null && (value.sat_math != null || value.sat_ebrw != null)){
                        var combSAT = value.sat_math + value.sat_ebrw;
                        var joined = this.state.otherScores.concat({x: combSAT, y: value.gpa});
                        this.setState({ otherScores: joined });
                      }
                    }
                    else if(this.state.scatterPlotType == "ACT"){
                      if(value.decision == "accepted" && value.gpa != null && value.act_composite != null){
                        var joined = this.state.acceptedScores.concat({x: value.act_composite, y: value.gpa});
                        this.setState({ acceptedScores: joined });
                      }
                      else if(value.decision == "denied" && value.gpa != null && value.act_composite != null){
                        var joined = this.state.declinedScores.concat({x: value.act_composite, y: value.gpa});
                        this.setState({ declinedScores: joined });
                      }
                      else if((value.decision == "deferred" || value.decision == "wait-listed" || value.decision == "withdrawn" || value.decision == "pending") && 
                      value.gpa != null && value.act_composite != null){
                        var joined = this.state.otherScores.concat({x: value.act_composite, y: value.gpa});
                        this.setState({ otherScores: joined });
                      }
                    }
                    else if(this.state.scatterPlotType == "AVG"){
                      if(value.decision == "accepted" && value.gpa != null && value.weighted_avg != null){
                        var joined = this.state.acceptedScores.concat({x: value.weighted_avg, y: value.gpa});
                        this.setState({ acceptedScores: joined });
                      }
                      else if(value.decision == "denied" && value.gpa != null && value.weighted_avg != null){
                        var joined = this.state.declinedScores.concat({x: value.weighted_avg, y: value.gpa});
                        this.setState({ declinedScores: joined });
                      }
                      else if((value.decision == "deferred" || value.decision == "wait-listed" || value.decision == "withdrawn" || value.decision == "pending") && 
                      value.gpa != null && value.weighted_avg != null){
                        var joined = this.state.otherScores.concat({x: value.weighted_avg, y: value.gpa});
                        this.setState({ otherScores: joined });
                      }
                    }
                  }
                }
                let numApps = Object.keys(appDict).length;
                if(numApps > 0){
                  this.setState({avgGPA : Math.round(100*this.state.avgGPA / numApps)/100});
                  this.setState({avgMath : Math.round(this.state.avgMath / numApps)});
                  this.setState({avgEBRW : Math.round(this.state.avgEBRW / numApps)});
                  this.setState({avgACT : Math.round(10*this.state.avgACT / numApps)/10});
                  this.setState({avgAVG : Math.round(10*this.state.avgAVG / numApps)/10});
                  if(this.state.scatterPlotType == "SAT"){
                    this.setState({meanScore : [{x: this.state.avgMath + this.state.avgEBRW, y: this.state.avgGPA}]});
                  }
                  if(this.state.scatterPlotType == "ACT"){
                    this.setState({meanScore : [{x: this.state.avgACT, y: this.state.avgGPA}]});
                  }
                  if(this.state.scatterPlotType == "AVG"){
                    this.setState({meanScore: [{x: this.state.avgAVG, y: this.state.avgGPA}]});
                  }
                }else{
                  this.setState({avgGPA : 0});this.setState({avgAVG : 0});
                  this.setState({avgMath : 0});
                  this.setState({avgEBRW : 0});
                  this.setState({avgACT : 0});
                  this.setState({acceptedScores: [], declinedScores: [], otherScores: [], meanScore: []});
                }
                this.setState({applications : appDict});
                this.sortTasks("status");
                alert("Finished Filtering");
              }
            }
          );
        }
    }
  }

  handleSelect = (e) =>{
    const { target } = e;

    this.setState(state => ({
      ...state,
      [target.id]: target.options[target.value].text,
    }));
  }

  sortTasks(sortingCriteria) {
    this.flip = false;
    this.newItemSortCriteria = sortingCriteria;
    let list = Object.entries(this.state.applications);
    //console.log(list);
    //console.log(this.newItemSortCriteria+this.currentItemSortCriteria);
    if ( this.newItemSortCriteria === this.currentItemSortCriteria){
        this.flip = true;
    }
    if(this.flip && !this.flipped){
        if (this.newItemSortCriteria === "status"){
            list.sort(this.compareStatusFlip);
        }
        else if(this.newItemSortCriteria === "gpa"){
          list.sort(this.compareGpaFlip);
        }
        else if(this.newItemSortCriteria === "satMath"){
          list.sort(this.compareMathFlip);
        }
        else if(this.newItemSortCriteria === "satEBRW"){
          list.sort(this.compareEBRWFlip);
        }
        else if(this.newItemSortCriteria === "act"){
          list.sort(this.compareACTFlip);
        }
        this.flipped = true;
    }
    else{
        if (this.newItemSortCriteria === "status"){
            list.sort(this.compareStatus);
        }
        else if(this.newItemSortCriteria === "gpa"){
          list.sort(this.compareGpa);
        }
        else if(this.newItemSortCriteria === "satMath"){
          list.sort(this.compareMath);
        }
        else if(this.newItemSortCriteria === "satEBRW"){
          list.sort(this.compareEBRW);
        }
        else if(this.newItemSortCriteria === "act"){
          list.sort(this.compareACT);
        }
        this.flipped = false;
    }
    let newList = {};
    list.map((data)=>{
      //console.log(data);
      newList[data[0]] = data[1];
    })
    //console.log(newList);
    this.setState({applications:newList});
    this.currentItemSortCriteria = sortingCriteria;
    this.setState({applications:newList});
  }

  compareStatus(item1,item2) {
   
    if (item1[1].decision < item2[1].decision)
        return -1;
    else if (item1[1].decision > item2[1].decision)
        return 1;
    else
        return 0;
  }

  compareStatusFlip(item1,item2) {
    let temp = item1;
    item1 = item2;
    item2 = temp;
    if (item1[1].decision < item2[1].decision)
        return -1;
    else if (item1[1].decision > item2[1].decision)
        return 1;
    else
        return 0;
  }

  compareGpa(item1, item2){
    if (item1[1].avgGPA < item2[1].avgGPA)
        return -1;
    else if (item1[1].avgGPA > item2[1].avgGPA)
        return 1;
    else
        return 0;
  }

  compareGpaFlip(item1, item2){
    let temp = item1;
    item1 = item2;
    item2 = temp;
    if (item1[1].avgGPA < item2[1].avgGPA)
        return -1;
    else if (item1[1].avgGPA > item2[1].avgGPA)
        return 1;
    else
        return 0;
  }

  compareMath(item1, item2){
    if (item1[1].avgSATMath < item2[1].avgSATMath)
        return -1;
    else if (item1[1].avgSATMath > item2[1].avgSATMath)
        return 1;
    else
        return 0;
  }

  compareMathFlip(item1, item2){
    let temp = item1;
    item1 = item2;
    item2 = temp;
    if (item1[1].avgSATMath < item2[1].avgSATMath)
        return -1;
    else if (item1[1].avgSATMath > item2[1].avgSATMath)
        return 1;
    else
        return 0;
  }

  compareEBRW(item1, item2){
    if (item1[1].avgSATEBRW < item2[1].avgSATEBRW)
        return -1;
    else if (item1[1].avgSATEBRW > item2[1].avgSATEBRW)
        return 1;
    else
        return 0;
  }

  compareEBRWFlip(item1, item2){
    let temp = item1;
    item1 = item2;
    item2 = temp;
    if (item1[1].avgSATEBRW < item2[1].avgSATEBRW)
        return -1;
    else if (item1[1].avgSATEBRW > item2[1].avgSATEBRW)
        return 1;
    else
        return 0;
  }

  compareACT(item1, item2){
    if (item1[1].avgACTComp < item2[1].avgACTComp)
        return -1;
    else if (item1[1].avgACTComp > item2[1].avgACTComp)
        return 1;
    else
        return 0;
  }

  compareACTFlip(item1, item2){
    let temp = item1;
    item1 = item2;
    item2 = temp;
    if (item1[1].avgACTComp < item2[1].avgACTComp)
        return -1;
    else if (item1[1].avgACTComp > item2[1].avgACTComp)
        return 1;
    else
        return 0;
  }

  showMore(userid){
    let userInfo = this.state.applications[userid];
    alert("User ID: " + userInfo.userid + "\n" +
    "GPA: " + userInfo.avgGPA.toFixed(1) + "\n" +
    "SAT Math: " + userInfo.avgSATMath + "\n" +
    "SAT EBRW: " + userInfo.avgSATEBRW + "\n" +
    "ACT Composite: " + userInfo.avgACTComp + "\n" +
    "Class of: " + userInfo.class + "\n" +
    "High School: " + userInfo.hsName + "\n" +
    "Status: " + userInfo.decision);
  }

  toggleDataSeries(e){
		if (typeof(e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
			e.dataSeries.visible = false;
		}
		else{
			e.dataSeries.visible = true;
		}
		this.chart.render();
  }

  setPlotSAT(){
    this.setState({scatterPlotType : "SAT"});
  }
  setPlotACT(){
    this.setState({scatterPlotType : "ACT"});
  }
  setPlotAVG(){
    this.setState({scatterPlotType : "AVG"});
  }

  render() {

    let info = this.props.location.info;

    if (!info) {
      return <Redirect to="/" />;
    }

    let infoCollege = info.temp;
    let cInfo = new Object();

    if(this.props.collegeInfo["ScrapedCollegeData"]){
      cInfo = this.props.collegeInfo["ScrapedCollegeData"][infoCollege["Name"]];
    }
    //console.log(info);
    // console.log(this.props.collegeInfo);
    //console.log(this.state);
    
    const options = {
			theme: "light2",
			animationEnabled: true,
			title: {
				text: "Application Status Scatterplot"
			},
			axisX: {
        title: "Standardized Test Scores",
        crosshair: {
          enabled: true,
          snapToDataPoint: true
        }
			},
			axisY: {
				title: "GPA",
				crosshair: {
          enabled: true,
        }
			},
			legend: {
        cursor: "pointer",
        itemclick: this.toggleDataSeries
			},
			data: [{
				type: "scatter",
        name: "Denied",
        markerColor: "red",
				markerType: "circle",
				showInLegend: true,
				toolTipContent: "<span style=\"color:#4F81BC \">{name}</span><br>GPA: {y}<br>Score: {x}",
				dataPoints: this.state.declinedScores
			},
			{
				type: "scatter",
        name: "Accepted",
        markerColor: "green",
				showInLegend: true,
				markerType: "circle",
				toolTipContent: "<span style=\"color:#C0504E \">{name}</span><br>GPA: {y}<br>Score: {x}",
				dataPoints: this.state.acceptedScores
      },
      {
        type: "scatter",
        name: "Other",
        markerColor: "yellow",
				showInLegend: true,
				markerType: "circle",
				toolTipContent: "<span style=\"color:#E8EB34 \">{name}</span><br>GPA: {y}<br>Score: {x}",
				dataPoints: this.state.otherScores
      },
      {
        type: "scatter",
        name: "MEAN",
        markerColor: "black",
				showInLegend: true,
				markerType: "cross",
				toolTipContent: "<span style=\"color:#black \">{name}</span><br>GPA: {y}<br>Score: {x}",
				dataPoints: this.state.meanScore
      }
    ]
		}
    
    return (
      <div className="outlet profile-container">
        
        <div className="college-container">
          <div className="college-header">
            <div className="college-item-header">
              {infoCollege["Name"]}
            </div>
            {cInfo ? (
              <div>
                <div className="section">
                  <div className="college-item-category">
                    General Information:
                  </div>
                  <table className="college-item-table">
                    <tbody>
                      <tr className="search-item">
                        {cInfo["rank"] ? (<td className="college-item-name">Rank: {cInfo["rank"]}</td>) : (<td className="college-item-name">Rank: N/A</td>)}
                        {cInfo["admission_rate"] ? (<td className="college-item-name">Admission Rate: {(cInfo["admission_rate"]*100).toFixed(2)}%</td>) : (<td className="college-item-name">Admission Rate: N/A</td>)}
                        {cInfo["num_ugrads"] ? (<td className="college-item-name">Size: {cInfo["num_ugrads"]}</td>) : (<td className="college-item-name">Size: N/A</td>)}
                        {cInfo["avg_gpa"] ? (<td className="college-item-name">Average GPA: {cInfo["avg_gpa"]}</td>) : (<td className="college-item-name">Average GPA: N/A</td>)}
                      </tr>
                      <tr className="search-item">
                        {cInfo["location"] ? (<td className="college-item-name">Location: {cInfo["location"]}</td>) : (<td className="college-item-name">Location: N/A</td>)}
                        {cInfo["room_and_board"] ? (<td className="college-item-name">Room and Board: {cInfo["room_and_board"].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</td>) : (<td className="college-item-name">Room and Board: N/A</td>)}
                        {cInfo["tuition_fees"] ? (<td className="college-item-name">Tuition Fees: {cInfo["tuition_fees"].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</td>) : (<td className="college-item-name">Tuition Fees: N/A</td>)}
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="section">
                  <div className="college-item-category">
                    Average SAT Scores:
                  </div>
                  <table className="college-item-table">
                    <tbody>
                    <tr className="search-item">
                      {cInfo["sat_Avg"] ? (<td className="college-item-name">SAT Average: {cInfo["sat_Avg"]}</td>) : (<td className="college-item-name">SAT Average: N/A</td>)}
                      {cInfo["sat_Math25"] ? (<td className="college-item-name">SAT Math: {(parseInt(cInfo["sat_Math25"])+parseInt(cInfo["sat_Math75"]))/2}</td>) : (<td className="college-item-name">SAT Math: N/A</td>)}
                      {cInfo["sat_Read25"] ? (<td className="college-item-name">SAT Read: {(parseInt(cInfo["sat_Read25"])+parseInt(cInfo["sat_Read75"]))/2}</td>) : (<td className="college-item-name">SAT Read: N/A</td>)}
                      {cInfo["sat_Write25"] ? (<td className="college-item-name">SAT Write: {(parseInt(cInfo["sat_Write25"])+parseInt(cInfo["sat_Write75"]))/2}</td>) : (<td className="college-item-name">SAT Write: N/A</td>)}
                    </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="section">
                  <div className="college-item-category">
                    Average ACT Scores:
                  </div>
                  <table className="college-item-table">
                    <tbody>
                      <tr className="search-item">
                      {cInfo["act_Math25"] ? (<td className="college-item-name">ACT Math: {(parseInt(cInfo["act_Math25"])+parseInt(cInfo["act_Math75"]))/2}</td>) : (<td className="college-item-name">ACT Math: N/A</td>)}
                      {cInfo["act_ENG25"] ? (<td className="college-item-name">ACT ENG: {(parseInt(cInfo["act_ENG25"])+parseInt(cInfo["act_ENG75"]))/2}</td>) : (<td className="college-item-name">ACT ENG: N/A</td>)}
                      {cInfo["act_Write25"] ? (<td className="college-item-name">ACT Write: {(parseInt(cInfo["act_Write25"])+parseInt(cInfo["act_Write75"]))/2}</td>) : (<td className="college-item-name">ACT Write: N/A</td>)}
                      <td className="college-item-name"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>) :
              (<div></div>)
            }
          </div>
        </div>

        <div className="filter-container">
          <div className="filter-header">
            Filters
          </div>
          <form onSubmit={this.handleSubmit}>
            <div className="filter-item">
              <div className="filter-name-label">High School Name:</div>
              <div className="filter-name">
                <input className="filter-name" type="text" id="filterName" onChange={this.handleChange} ></input>
              </div>
            </div>
            <RangeInput
              handleChange={this.handleChange}
              min={2020}
              max={2099}>
              College Class
            </RangeInput>
            <SelectorInputStatus
              handleChange={this.handleSelect}
              options={this.state.applicationStatuses}>
              Application Status
            </SelectorInputStatus>
            <Row>
              <Col s={4}>
                <label className="filter-radio">Strict
                  <input id="strict" name="filter-type-sl" className="filter-radio-option" type="radio"onChange={this.handleCheck}/>
                </label>
              </Col>
              <Col s={4}>
                <label className="filter-radio">Lax
                  <input id="lax" name="filter-type-sl" className="filter-radio-option" type="radio" onChange={this.handleCheck}/>
                </label>
              </Col>
            </Row>
            <Row>
              <Col s={5}>
                <button type="submit" className="btn green lighten-1">Search</button>
              </Col>
            </Row>
            Scatterplot Type (SAT By default):
            <Row> 
                <Button onClick = {() => this.setPlotSAT()}>SAT</Button>
                <Button onClick = {() => this.setPlotACT()}>ACT</Button>
                <Button onClick = {() => this.setPlotAVG()}>Weighted Average</Button>
              </Row>
          </form>
        </div>

        <div className="college-list-container">
          {Object.keys(this.state.applications).length >0 ? (
            <div>
              <div className="search-num-colleges">
                {Object.keys(this.state.applications).length} Approved Decisions found...
              </div>
              <div className="application-info-text">
                Summary:
                <div>Average GPA: 
                  { this.state.avgGPA}
                </div>
                <div>Average SAT Math: 
                  { this.state.avgMath}
                </div>
                <div>Average SAT EBRW: 
                  { this.state.avgEBRW}
                </div>
                <div>Average ACT Composite: 
                  { this.state.avgACT}
                </div>
              </div>
              <table className="striped">
                <thead>
                  <tr>
                      <th className="search-header"><a className="search-header-text">User ID</a></th>
                      <th className="search-header" onClick={()=>this.sortTasks("gpa")}><a className="search-header-text">GPA</a></th>
                      <th className="search-header" onClick={()=>this.sortTasks("satMath")}><a className="search-header-text">SAT Math</a></th>
                      <th className="search-header" onClick={()=>this.sortTasks("satEBRW")}><a className="search-header-text">SAT EBRW</a></th>
                      <th className="search-header" onClick={()=>this.sortTasks("act")}><a className="search-header-text">ACT Composite</a></th>
                      <th className="search-header" onClick={()=>this.sortTasks("status")}><a className="search-header-text">Status</a></th>
                  </tr>
                </thead>

                <tbody>
                {Object.keys(this.state.applications).map((application) => {
                    let temp = this.state.applications[application];
                    return  <tr className="search-item">
                                {<td className="search-item" onClick = {() => this.showMore(temp["userid"])}>{temp["userid"]}</td>}

                                {temp["avgGPA"] ? (<td className="search-item">{temp["avgGPA"].toFixed(1)}</td>) : (<td className="search-item">N/A</td>)}
                                
                                {temp["avgSATMath"] ? (<td className="search-item">{temp["avgSATMath"]}</td>) : (<td className="search-item">N/A</td>)}
                                
                                {temp["avgSATEBRW"] ? (<td className="search-item">{temp["avgSATEBRW"]}</td>) : (<td className="search-item">N/A</td>)}
                                
                                {temp["avgACTComp"] ? (<td className="search-item">{temp["avgACTComp"]}</td>) : (<td className="search-item">N/A</td>)}

                                {temp["decision"] ? (<td className="search-item" >{temp["decision"]}</td>) : (<td className="search-item">N/A</td>)}
                                <td className="search-item"></td>
                            </tr>
                  })}
                </tbody>
              </table>
              <div>
                <CanvasJSChart options = {options}
                    onRef = {ref => this.chart = ref}
                />
              </div>
              
          </div>
         
    
          ) : (<div className="search-num-colleges">
            No Approved Decisions Found For This College.
          </div>)}
        </div>
      </div>  
      
    );
  };
}

const mapStateToProps = (state, ownProps) => {
  return {
      collegeInfo: state.firestore.data
  };
};

export default compose(
  connect(mapStateToProps),
  firestoreConnect(props => {
    if (!props.location.info) 
    {
        return [];
    }
    else
    {
        let info = props.location.info.temp;
        let infoName = info["Name"];
        return [
        { collection: 'ScrapedCollegeData',
            where: ['name', '==', infoName]
        }];
    }
}),
)(CollegeInfoScreen);