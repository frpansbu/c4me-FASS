import React from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'redux';
import { Modal, Button, Row, Col } from 'react-materialize';

class ScoreInput extends React.Component {
  constructor(props){
    super(props);
    this.divClass = this.props.children.slice(0,3).toLowerCase()+(this.props.children.replace(/\s/g, '')).slice(3);
  }

  render() {
    return (
      <Row className="score-row">
        <Col s={6}>
          <div className="score-label">
            {this.props.children}:
          </div>
        </Col>
        <Col s={4}>
          <div className="profile-input score-input">
            <input defaultValue={this.props.inputValue} className="active" type={this.props.isPassword || "text"} name={this.divClass} id={this.divClass} onChange={this.props.handleChange} />
          </div>
        </Col>
      </Row>
    );
  };
}

export default compose()(ScoreInput);