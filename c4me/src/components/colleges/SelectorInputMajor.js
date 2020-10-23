import React from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'redux';
import { Modal, Button, Row, Col } from 'react-materialize';

class SelectorInputMajor extends React.Component {

  constructor(props){
    super(props);
    this.divClass = this.props.children.charAt(0).toLowerCase()+(this.props.children.replace(/\s/g, '')).slice(1);
  }

  render() {
    return (
      <div className="filter-majors">
        <div className="filter-item-major">
          <div className="filter-label">
            {this.props.children}:
          </div>
          <select id={this.divClass} onChange={this.props.handleChange} className="filter-select">
            <option className="option-default" key="0" value="">Select a Major:</option>
            {this.props.options.map((choice, index) => {
              return <option key={index+1} value={choice}>{choice}</option>;
            })}
          </select>
        </div>
      </div>
      
    );
  };
}

export default compose()(SelectorInputMajor);