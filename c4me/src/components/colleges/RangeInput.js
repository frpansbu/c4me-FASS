import React from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'redux';
import { Modal, Button, Row, Col } from 'react-materialize';

class RangeInput extends React.Component {

  constructor(props){
    super(props);
    this.divClass = this.props.children.charAt(0).toLowerCase()+(this.props.children.replace(/\s/g, '')).slice(1);
    this.divClassMin = this.divClass + "Min";
    this.divClassMax = this.divClass + "Max";
  }

  render() {
    return (
      <div className="filter-item">
        <div className="filter-label">
          {this.props.children}:
        </div>
        <Row className="filter-row">
          <Col s={5}>
            {this.props.prefix ? (
              <div className="filter-range-prefix">
                <div className="filter-prefix">{this.props.prefix}</div>
                <input className="filter-range" type="text" id={this.divClassMin} onChange={this.props.handleChange} ></input>
                <div className="filter-suffix">{this.props.suffix}</div>
              </div>
             ) : (
              <div className="filter-range">
                <div className="filter-prefix">{this.props.prefix}</div>
                <input className="filter-range" type="text" id={this.divClassMin} onChange={this.props.handleChange} ></input>
                <div className="filter-suffix">{this.props.suffix}</div>
              </div>
             )}
          </Col>
          <Col s={2}>
            <div className="filter-range-separator">to</div>
          </Col>
          <Col s={5}>
          {this.props.prefix ? (
              <div className="filter-range-prefix">
                <div className="filter-prefix">{this.props.prefix}</div>
                <input className="filter-range" type="text" id={this.divClassMax} onChange={this.props.handleChange} ></input>
                <div className="filter-suffix">{this.props.suffix}</div>
              </div>
             ) : (
              <div className="filter-range">
                <div className="filter-prefix">{this.props.prefix}</div>
                <input className="filter-range" type="text" id={this.divClassMax} onChange={this.props.handleChange} ></input>
                <div className="filter-suffix">{this.props.suffix}</div>
              </div>
             )}
          </Col>
        </Row>
      </div>
    );
  };
}

export default compose()(RangeInput);