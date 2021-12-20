import React from 'react';
import PropTypes from 'prop-types';

export default class MemberItem extends React.Component {
  static propTypes = {
    key: PropTypes.number,
    onUpdate: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    username: PropTypes.string.isRequired,
    _username: PropTypes.string.isRequired,
    rol: PropTypes.string.isRequired,
    _rol: PropTypes.string.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      selectedRol: this.props.rol
    };
  }

  handleClick = () => {
    this.props.onClick(this.props.project.id, this.props.item_list);
  }

  handleDoubleClick = () => {
    this.props.onDoubleClick(this.props.project.id, this.props.item_list);
  }

  selectRol = (e) => {
      this.setState({selectedRol: e});
  } 

  handleUpdate = (e) => {
    this.props.onUpdate(this.props.username, e.target.value)
  }

  handleInsert = () =>
  { this.props.onInsert(this.props.username);    
  }

  handleDelete = () =>
  { this.props.onDelete(this.props.username);
  }

  render() {
    if(this.props._rol === "Creador")
    { return (
        <tr>
          <td>{this.props.username}</td>
          {this.props.rol === "Creador"  || this.props._username === this.props.username ? 
          <td>
          </td>
          :
          <td>
            <button  
              className="icon-button"
              onClick={this.handleDelete} 
              title="Ver miembros"
              type="button"  
            >
              <i className="fa fa-lg fa-user-times" />
            </button>
          </td>
          }
          {this.props.rol === "Creador" || this.props._username === this.props.username ? <td>{this.props.rol}</td>:
            <td style={{verticalAlign: "top"}}>
              <select size="1" defaultValue ={this.props.rol} onChange={this.handleUpdate} style={{textAlign: "center"}}> 
                <option value="Lector">Lector</option>
                <option value="Editor">Editor</option>
                <option value="Administrador">Administrador</option>
              </select>
            </td>
          }
        </tr>
      );
    } 
    else if (this.props._rol === "Administrador")
    { return (
        <tr>
          <td>{this.props.username}</td>
          {this.props.rol === "Creador"  || this.props._username === this.props.username? 
          <td>
          </td>
          :
          <td>
            <button  
              className="icon-button"
              onClick={this.handleDelete} 
              title="Ver miembros"
              type="button"  
            >
              <i className="fa fa-lg fa-user-times" />
            </button>
          </td>
          }
          {this.props.rol === "Creador" || this.props._username === this.props.username ? <td>{this.props.rol}</td>:
            <td style={{verticalAlign: "top"}}>
              <select size="1" defaultValue ={this.props.rol} onChange={this.handleUpdate} style={{textAlign: "center"}}> 
                <option value="Lector">Lector</option>
                <option value="Editor">Editor</option>
              </select>
            </td>
          }
        </tr>
      );

    }
    { return (
        <tr>
          <td>{this.props.username}</td>
          <td>{this.props.rol}</td>
        </tr>
      );
    }
  }
}
