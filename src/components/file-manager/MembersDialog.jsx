import React from 'react';
import PropTypes from 'prop-types';
import Dialog from 'rc-dialog';
import MemberList from './MemberList.jsx';

export default class MembersDialog extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loaded: false,
      selected: null,
      deleteProjectVisible: false,
      message: "",
      members: []
    };
    this._loadMembers();
  }
  static propTypes = {
    rol: PropTypes.string.isRequired,
    token: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    modelId: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired
  };

  handleOnClose = () => {
    this.props.onClose();
  }

  _loadMembers() {
    
    this.setState({loaded: false});
    new Promise(() => {
      fetch('/ssh_handler/get-members', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          'token': this.props.token,
          'modelId': this.props.modelId
        }),
      }).then((response) => {
        if(response.ok) {
          return response.json();
        } else {
          this.setState({message: "Error en el servidor!", inProgress: false});
        }
      })
      .then((json) => {
        if(json.message === "Lista enviada!")
        {   this.setState({members: json.members, loaded: true, selected: null});
        }
        else
        { this.setState({loaded: false, selected: null});
        }
      });
    });
  }

  setMessage = (message) => {
    this.setState({message: message});
  }

  onUpdate = (username, rol) => {
    new Promise(() => {
      fetch('/ssh_handler/modify-member', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          'token': this.props.token,
          'target_user': username,
          'modelId': this.props.modelId,
          'rolname': rol
        }),
      }).then((response) => {
        if(response.ok) {
          return response.json();
        } else {
          this.setState({message: "Error en el servidor!", inProgress: false});
        }
      })
      .then((json) => {
        if(json.message === "Miembro "+username+" ha sido definido como "+rol+".")
        {   this._loadMembers();
            this.setState({message: json.message})
        }
        else
        { 
          this.setState({message: json.message})
        }
      });
    });  
  }

  onDelete = (username) => {
    new Promise(() => {
      fetch('/ssh_handler/remove-member', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          'token': this.props.token,
          'target_user': username,
          'modelId': this.props.modelId
        }),
      }).then((response) => {
        if(response.ok) {
          return response.json();
        } else {
          this.setState({message: "Error en el servidor!", inProgress: false});
        }
      })
      .then((json) => {
        if(json.message === "Miembro eliminado!")
        {   this._loadMembers();
            this.setState({message: json.message})
        }
        else
        { 
          this.setState({message: json.message})
        }
      });
    });  
  }

  onInsert = (username) => {
    new Promise(() => {
      fetch('/ssh_handler/add-member', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          'token': this.props.token,
          'target_user': username,
          'modelId': this.props.modelId
        }),
      }).then((response) => {
        if(response.ok) {
          return response.json();
        } else {
          this.setState({message: "Error en el servidor!", inProgress: false});
        }
      })
      .then((json) => {
        if(json.message === "Miembro "+username+"agregado como Lector.")
        {   this._loadMembers();
            this.setState({message: json.message})
        }
        else
        { 
          this.setState({message: json.message})
        }
      });
    });  
  }

  render() {
    let footer = (
      <div style={{textAlign: "center"}} >
        <div className="message">{this.state.message}</div>
        <br></br>
        <button className="app-button" onClick={this.handleOnClose}>Cerrar</button>
      </div>);

    return (
      <Dialog
        className="confirm-dialog"
        title={this.props.title}
        footer={footer}
        visible
        wrapClassName=''
        animation=""
        maskAnimation="fade"
        onClose={this.props.onClose}
      >
          <MemberList
              members= {this.state.members}
              onInsert = {this.onInsert}
              onUpdate = {this.onUpdate}
              onDelete = {this.onDelete}
              loaded={this.state.loaded}
              rol={this.props.rol}
              username={this.props.username}
              setMessage={this.setMessage}
          />
      </Dialog>
    );
  }
}
