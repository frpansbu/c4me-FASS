import React from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'redux';
import { Modal, Button, Row, Col } from 'react-materialize';

class SelectInput extends React.Component {
  constructor(props){
    super(props);
    this.divClass = this.props.children.charAt(0).toLowerCase()+(this.props.children.replace(/\s/g, '')).slice(1);
    this.locked = false;
  }

  inputValueReceived(){
    if (this.props.inputValue){
      console.log(this.props.inputValue);
      if(!this.locked && document.getElementById(this.divClass)){
        this.locked = true;
        document.getElementById(this.divClass).value = this.props.inputValue;
      }
    }
  }

  render() {
    if (this.props.inputValue){
      this.inputValueReceived();
    }

    return (
      <Row className="profile-row">
        <Col s={3}>
          <div className="profile-label">
            {this.props.hideLabel ? (
              <div></div>
            ) : (
              <div>{this.props.children}:</div>
            )}
          </div>
        </Col>
        {this.props.smallDiv ? (
          <Col s={2}>
            <div className="profile-input">
              <select className="browser-default" name={this.divClass} id={this.divClass} onChange={this.props.handleChange}>
                <option className="option-default" key="0" value="0"></option>
                {this.props.options.map((choice, index) => {
                  return <option key={index+1} value={choice}>{choice}</option>;
                })}
              </select>
            </div>
          </Col>
        ) : (
          <Col s={5}>
            <div className="profile-input">
              <select className="browser-default" name={this.divClass} id={this.divClass} onChange={this.props.handleChange}>
                <option className="option-default" key="0" value="0"></option>
                {this.props.options.map((choice, index) => {
                  return <option key={index+1} value={choice}>{choice}</option>;
                })}
              </select>
            </div>
          </Col>
        )}
      </Row>
    );
  };
}

export default compose()(SelectInput);