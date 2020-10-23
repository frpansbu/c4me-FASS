import React from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'redux';
import { Modal, Button, Row, Col } from 'react-materialize';

class CollegeInput extends React.Component {
  constructor(props){
    super(props);
    this.divClass = "school"+this.props.optionIndex.toString();
    this.decisionClass = "decision"+this.props.optionIndex.toString();
    this.questionableClass = "questionable"+this.props.optionIndex.toString();
    this.locked = false;
  }

  inputValueReceived(){
    if (this.props.inputValue){
      console.log(this.props.inputValue);
      if(!this.locked && document.getElementById(this.divClass) && document.getElementById(this.decisionClass)){
        this.locked = true;
        document.getElementById(this.divClass).value = this.props.inputValue[0];
        document.getElementById(this.decisionClass).value = this.props.inputValue[1];
      }
    }
  }

  render() {

    if (this.props.inputValue){
      this.inputValueReceived();
    }

    return (
      <Row className="profile-row college-input">
        <Col s={7}>
          <div className="profile-input">
            <select className="browser-default" name={this.divClass} id={this.divClass} onChange={this.props.handleChange}>
              <option value="0">Select a College</option>
              {this.props.options.map((choice, index) => {
                return <option key={index+1} value={choice.replace(/,/g, '')}>{choice}</option>;
              })}
            </select>
          </div>
        </Col>
        <Col s={2}>
          <div className="profile-input">
            <select className="active browser-default" name={this.decisionClass} id={this.decisionClass} onChange={this.props.handleChange}>
              <option value="0"></option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="denied">Denied</option>
              <option value="deferred">Deferred</option>
              <option value="wait-listed">Wait-listed</option>
              <option value="withdrawn">Withdrawn</option>
            </select>
          </div>
        </Col>
        <Col s={4}>
          <div className="questionable-div">
            <div id={this.questionableClass}>
              No evaluation.
            </div>
            <div className="disclaimer">
              *(Will not be shown in the final version)
            </div>
          </div>
        </Col>
      </Row>
    );
  };
}

export default compose()(CollegeInput);