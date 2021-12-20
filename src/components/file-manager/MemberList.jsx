import React from 'react';
import PropTypes from 'prop-types';
import MemberItem from './MemberItem.jsx';

export default class MemberList extends React.Component {

  static propTypes = {
    loaded: PropTypes.bool.isRequired,
    onInsert: PropTypes.func,
    onUpdate: PropTypes.func,
    onDelete: PropTypes.func,
    members: PropTypes.array.isRequired,
    rol: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    setMessage: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      selectedId: null,
      selectedList: null,
      newUser: "",
    };
  }
  
  handleNameInput = (e) => {
    this.setState({newUser: e.target.value});
  }

  setMessage = (message) => {
    this.props.setMessage(message)
  }

  onInsert = () => {
    if(this.state.newUser === "")
    { this.setMessage("El usuario no puede estar vacío!")
    }
    else this.props.onInsert(this.state.newUser)
  }

  render() {
    let members_table = null;
    if (this.props.loaded) {
      
      
      members_table = this.props.members.map((member, index) => {
        return (
        <MemberItem
          key={index}
          _username={this.props.username}
          username={member.username}
          rol={member.role}
          onUpdate={this.props.onUpdate}
          onDelete={this.props.onDelete}
          manager={!(this.props.rol === "Lector" || this.props.rol === "Editor")}
          _rol={this.props.rol}
        />
        );
      });

    } else {
      members_table = <tr><td>Cargando...</td><td></td></tr>;
    }
    if(this.props.rol === "Lector" || this.props.rol === "Editor")
    { return (
      <div>
        <table style={{ width: "100%", tableLayout: "fixed", textAlign: "center", border: "1px solid white"}}>
        <thead >
        <tr>
        <th>Usuario</th>
        <th>Rol</th>
        </tr></thead>
        <tbody>{members_table}</tbody>
        </table>
      </div>
      );
    }
    else if(this.props.rol === "Administrador" || this.props.rol === "Creador")
    { return (
      <div>
        <table style={{ width: "100%", tableLayout: "fixed", textAlign: "center", border: "1px solid white"}}>
        <thead >
        <tr>
        <th>Usuario</th>
        <th>Eliminar</th>
        <th>Rol</th>
        
        </tr></thead>
        <tbody>{members_table}</tbody>
        </table>
        <br></br>
        <div style={{textAlign: "center"}}>
          <label>Nuevo miembro: </label>
          <input
            type="text"
            onChange={this.handleNameInput}
            value={this.state.newUser}
          />
          <label> </label>
          <button className="app-button" onClick={this.onInsert}>Agregar</button>
        </div>
      </div>
      );
    }
  }
}
