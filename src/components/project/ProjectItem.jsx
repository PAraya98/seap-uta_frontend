import React from 'react';
import PropTypes from 'prop-types';

export default class ProjectItem extends React.Component {
  static propTypes = {
    onClick: PropTypes.func.isRequired,
    onDoubleClick: PropTypes.func.isRequired,
    project: PropTypes.object.isRequired,
    selected: PropTypes.bool.isRequired,
    item_list: PropTypes.string.isRequired
  };

  handleClick = () => {
    this.props.onClick(this.props.project.id, this.props.item_list);
  }

  handleDoubleClick = () => {
    this.props.onDoubleClick(this.props.project.id, this.props.item_list);
  }

  render() {
    const className = this.props.selected ? "selected" : null;
    return (
      <div
        id={this.props.item_list}
        className={className}
        onClick={this.handleClick}
        onDoubleClick={this.handleDoubleClick} 
        >
        <div style={{display: 'inline-block', width: '30%', textAlign: "center", paddingLeft: "5%"}} >
        {this.props.project.name.split("<separator>")[0]}
        </div>
        
        <div style={{display: 'inline-block', width: '30%', textAlign: "center", paddingLeft: "5%"}} >
        Creado por {this.props.project.name.split("<separator>")[1]}
        </div>

        <div style={{display: 'inline-block', width: '20%', textAlign: "center", verticalAlign: "middle"}}>
        {this.props.project.role}
        </div>
        
        
        </div>
    );
  }
}
