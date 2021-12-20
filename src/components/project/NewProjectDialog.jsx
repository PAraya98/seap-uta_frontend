import React from 'react';
import PropTypes from 'prop-types';
import Dialog from 'rc-dialog';

export default class NewProjectDialog extends React.Component {

  static propTypes = {
    onCancel: PropTypes.func.isRequired,
    onOk: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      projectName: "",
      visibility: 1,
      message: ""
    };
  }

  handleNameInput = (e) => {
    this.setState({projectName: e.target.value});
  }

  handleVisibilityInput = (e) => {
    console.log(parseInt(e.target.value))
    this.setState({visibility: parseInt(e.target.value)});
  }

  handleCancel = () => {
    this.props.onCancel();
  }

  handleOk = () => {
    if(this.state.projectName === "")
    { this.setState({message: "El nombre no puede estar vacío!"});
    }
    else
    { this.props.onOk(this.state.projectName, this.state.visibility);
    }
  }


  render() {
    let footer = (
      <div>
        <button className="app-button" onClick={this.handleCancel}>Cancelar</button>
        <button className="app-button" onClick={this.handleOk}>Aceptar</button>
      </div>);
    return (
      <Dialog
        className="new-project-dialog"
        title="Nuevo repositorio"
        footer={footer}
        visible
        wrapClassName=''
        animation=""
        maskAnimation="fade"
        onClose={this.props.onCancel}
      >
        <label>Nombre del repositorio:</label>
        <input
          type="text"
          onChange={this.handleNameInput}
          value={this.state.projectName}
        />
        <label> </label>
        <label>Privacidad:</label>
        <label><input className='radio' type="radio" value={1} name="visibility" defaultChecked={true} onChange={this.handleVisibilityInput}/> Público</label>
        
        <label><input className='radio' type="radio" value={0} name="visibility" onChange={this.handleVisibilityInput}/> Privado</label>
        <div className="message">{this.state.message}</div>

        
      </Dialog>
    );
  }
}
