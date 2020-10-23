import React from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'redux';
import { Modal, Button, Row, Col } from 'react-materialize';

class ProfileInput extends React.Component {
  constructor(props){
    super(props);
    this.divClass = this.props.children.charAt(0).toLowerCase()+(this.props.children.replace(/\s/g, '')).slice(1);
  }

  render() {
    return (
      <Row className="profile-row">
        <Col s={3}>
          <div className="profile-label">
            {this.props.children}:
          </div>
        </Col>
        <Col s={5}>
          <div className="profile-input">
            <input defaultValue={this.props.inputValue} className="active" type={this.props.isPassword || "text"} name={this.divClass} id={this.divClass} onChange={this.props.handleChange} disabled={!this.props.enabled} />
          </div>
        </Col>
      </Row>
    );
  };
}

export default compose()(ProfileInput);