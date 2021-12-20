import React from 'react';
import PropTypes from 'prop-types';
import CenteredPanel from '../CenteredPanel.jsx';
import ProjectsList from './ProjectsList.jsx';
import NewProjectDialog from './NewProjectDialog.jsx';
import ConfirmationDialog from '../util/ConfirmationDialog.jsx';
import logo from "../../assets/img/cl_logo.png";
import { getUrlParam } from '../../utils';

// fixme abstract this to somewhere else.
const PROJECT_COLLECTION_ID = "projects";

export default class ProjectsDialog extends React.Component {

  static propTypes = {
    collectionId: PropTypes.string.isRequired,
    modelService: PropTypes.object.isRequired,
    onLogout: PropTypes.func.isRequired,
    onOpen: PropTypes.func.isRequired,
    token: PropTypes.string.isRequired,
    username:PropTypes.string.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      loaded: false,
      opening: false,
      projects: [],
      our_repo: [],
      my_repo: [],
      pub_repo: [],
      selected: null,
      deleteProjectVisible: false
    };

    if (!this._checkForDesiredProject()) {
      this._loadProjects();
    }
  }

  _checkForDesiredProject() {
    let modelId = getUrlParam('project');
    if (modelId) {
      return this.handleOpenProject(modelId);
    }
    return false;
  }

  _loadProjects = () => {
    this.setState({loaded: false});
    new Promise(() => {
      fetch('/ssh_handler/repository_list', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          'token': this.props.token
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
        {   this.setState({my_repo: json.my_repo, our_repo: json.our_repo, pub_repo: json.pub_repo, loaded: true, selected: null});
        }
        else
        { console.log("error?")
          this.setState({loaded: false, selected: null});
        }
      });
    });
  }

  handleOpenProject = (modelId) => {
    // set opening to true.
    this.props.modelService.open(modelId).then(model => {
      this.props.onOpen(model);
    }).catch((e) => {
      // replace with UI notification.
      console.error(e);
    });
  }

  handleSelectProject = (projectId) => {
    this.setState({selected: projectId});
  }

  handleOpen = () => {
    this.handleOpenProject(this.state.selected);
  }

  handleDelete = () => {
    this.setState({deleteProjectVisible: true});
  }

  handleNew = () => {
    this.setState({newProjectVisible: true});
  }

  handleNewProjectCancel = () => {
    this.setState({newProjectVisible: false});
  }

  handleNewProjectOk = (projectName, visibility) => { // VERIFICAR SI PERTENECE AL REPOSITORIO, SINO ERROR 
    new Promise(resolve => {
      fetch('/ssh_handler/validate-jwt', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          'token': this.props.token
        }),
      }).then((response) => {
        if(response.ok) {
          return response.json();
        } else {
          this.setState({message: "Error en el servidor!", inProgress: false});
        }
      })
      .then((json) => {
        console.log(json)
        if(json.bool)
        {   this.setState({newProjectVisible: false});
            this.props.modelService.create({
              collection: PROJECT_COLLECTION_ID,
              data: {
                "name": projectName,
                "tree": {
                  "nodes": {
                    "root": {
                      "name": projectName,
                      "children": [],
                      "path": projectName
                    }
                  }
                }
              }
            }).then(modelId => { 
              fetch('/ssh_handler/create_repository', {
                method: 'POST',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  'token': this.props.token,
                  'username': this.props.username,
                  'model_id': modelId,
                  'name': projectName,
                  'visibility': visibility
                }),
              }).then((response) => {
                if(response.ok) {
                  return response.json();
                } else {
                  this.setState({message: "Error en el servidor!", inProgress: false});
                }
              })
              .then((json) => {
                
                if(json.message === "Creación realizada!")
                { this.handleOpenProject(modelId)

                }
                else
                { this.prop.onLogout();
                }
              })
            });
        }
        else
        { this.prop.onLogout();
        }
      });
    });
  }

  _createNewProjectDialog() {
    if (this.state.newProjectVisible) {
      return (<NewProjectDialog
        onCancel={this.handleNewProjectCancel}
        onOk={this.handleNewProjectOk}
      />);
    }
  }

  handleDeleteProjectCancel = () => {
    this.setState({deleteProjectVisible: false});
  }

  handleDeleteProjectOk = () => { 
    new Promise(() => {
      fetch('/ssh_handler/delete_repository', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          'token': this.props.token,
          'username': this.props.username,
          'modelId': this.state.selected
        }),
      }).then((response) => {
        if(response.ok) {
          return response.json();
        } else {
          this.setState({message: "Error en el servidor!", inProgress: false});
        }
      })
      .then((json) => {
        if(json.message === "Eliminación realizada!")
        {   this.props.modelService.remove(this.state.selected).then(() => {
              this.setState({deleteProjectVisible: false});
              this._loadProjects();
            });
        }
        else
        { console.log("No eres el creador del repositorio!")
          this.setState({deleteProjectVisible: false, selected: null})
        }
      });
    });  



      //EN CASO DE QUE SEA ACEPTADO


}

  _createDeleteProjectDialog() {
    if (this.state.deleteProjectVisible) {
      const title = "Confirmar eliminación";
      const array = [];
      Array.prototype.push.apply(array, this.state.my_repo);
      Array.prototype.push.apply(array, this.state.our_repo);
      Array.prototype.push.apply(array, this.state.pub_repo);
      const message = `Borrar repositorio "${(array.find(o => o.id === this.state.selected).name).split("<separator>")[0]}"?`;
      return (<ConfirmationDialog
        onCancel={this.handleDeleteProjectCancel}
        onOk={this.handleDeleteProjectOk}
        title={title}
        message={message}
      />);
    }
  }


  render() {
    const newProjectDialog = this._createNewProjectDialog();
    const deleteProjectDialog = this._createDeleteProjectDialog();
    let creador = false;
    if(this.state.loaded && this.state.selected !== null)
    {   const array = [];
        Array.prototype.push.apply(array, this.state.my_repo);
        Array.prototype.push.apply(array, this.state.our_repo);
        Array.prototype.push.apply(array, this.state.pub_repo);
        creador = array.find(o => o.id === this.state.selected).role === "Creador";
    }

    return (
      <div>
        <CenteredPanel>
          <div className="projects-dialog">
            <div className="title">
              <img src={logo} alt="Convergence" />
              <i className="fa fa-power-off" onClick={this.props.onLogout} />
              <span style={{textAlign: 'center', alignSelf: 'center'}} > SEAP-UTA </span> 
              

              
              <span style={{textAlign: 'center'}}>Bienvenido {this.props.username} !</span>
            </div>
            <ProjectsList
              my_repo= {this.state.my_repo}
              our_repo= {this.state.our_repo}
              pub_repo= {this.state.pub_repo}
              onOpen={this.handleOpenProject}
              onSelect={this.handleSelectProject}
              loaded={this.state.loaded}
            />
            <div className="buttons">
              <button disabled={this.state.selected === null} className="app-button" onClick={this.handleOpen}>Abrir
              </button>
              
              <button className="app-button" onClick={this.handleNew}>Crear nuevo repositorio
              </button>

              <button disabled={this.state.selected === null || !creador} className="app-button" onClick={this.handleDelete}>Borrar
              </button>

              <button className="app-button" onClick={this._loadProjects}>Actualizar
              </button>

            </div>
          </div>

        </CenteredPanel>
        {newProjectDialog}
        {deleteProjectDialog}
      </div>
    );
  }
}
