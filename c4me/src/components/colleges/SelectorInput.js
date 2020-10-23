import React from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'redux';
import { Modal, Button, Row, Col } from 'react-materialize';

class SelectorInput extends React.Component {

  constructor(props){
    super(props);
    this.divClass = this.props.children.charAt(0).toLowerCase()+(this.props.children.replace(/\s/g, '')).slice(1);
  }

  render() {
    return (
      <div className="filter-item">
        <div className="filter-label">
          {this.props.children}:
        </div>
        <select id={this.divClass} onChange={this.props.handleChange} className="filter-select">
          <option className="option-default" key="0" value="">Select a Location:</option>
          {this.props.options.map((choice, index) => {
            return <option key={index+1} value={choice}>{choice}</option>;
          })}
        </select>
      </div>
    );
  };
}

export default compose()(SelectorInput);