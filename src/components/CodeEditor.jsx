import React from 'react';
import Home from './Home.jsx';
import Login from './Login.jsx';
import ProjectsDialog from './project/ProjectsDialog.jsx';
import {closeAll} from '../actions/actionCreator';
import {Convergence} from '@convergence/convergence';
import PropTypes from 'prop-types';
import { instanceOf } from "prop-types";
import { withCookies, Cookies } from "react-cookie";

class CodeEditor extends React.Component {
  
  static propTypes = {
    domainUrl: PropTypes.string.isRequired,
    token: PropTypes.string,
    username: PropTypes.string,
    cookies: instanceOf(Cookies).isRequired

  };

  constructor(props) {
    super(props);
    
    this.state = {
      domain: null,
      projectData: null,
      loading: false,
      username: this.props.cookies.get("username") || "",
      token: this.props.cookies.get("token") || "",
      rol: ""
    };
  }

  componentDidMount() {
    this.tryAutoLogin();
  }

  handleLogin = (domain) => {
    this.setState({domain});
  }

  tryAutoLogin = () => {
    let token = this.props.cookies.get("token");
    if (token) {
      this.setState({loading: true});
      new Promise(resolve => {
        fetch('/ssh_handler/validate-jwt', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            'token': token
          }),
        }).then((response) => {
          if(response.ok) {
            return response.json();
          } else {
            this.setState({message: "Error en el servidor!", inProgress: false});
          }
        })
        .then((json) => {
          if(json.bool)
          {  resolve(Convergence.connectAnonymously(this.props.domainUrl, this.props.cookies.get("username")).then(d => { this.setState({domain: d, loading: false}) }));
          }
          else
          { this.props.cookies.remove("token", { path: '/' });
            this.props.cookies.remove("username", { path: '/' });
            this.setState({user: "", token: "", loading: false});
          }
        });
      });
    }
  }

  handleClose = () => {
    const projData = this.state.projectData;
    projData.model.close();
    projData.activity.leave();
    projData.chatRoom.leave();

    closeAll();

    this.setState({projectData: null, mv_started: null, rol: ""});
  }

  handleLogout = () => {
    this.props.cookies.remove("token", { path: '/' });
    this.props.cookies.remove("username", { path: '/' });
    this.state.domain.dispose();
    this.setState({domain: null, projectData: null, user: "", token: ""});
  }

  setCookies = (json) =>
  { this.props.cookies.set("token", json.token, { path: '/' });
    this.props.cookies.set("username", json.username, { path: '/' })
    this.setState({username: json.username, token: json.token});
  }

  handleOpenProject = (model) => {
    const domain = this.state.domain;
    this.setState({loading: true});
    let activity = null;
    let chatRoom = null;
    let port_machine = null;
    let rol = null;
    const options = {autoCreate:{ephemeral: true, worldPermissions: ["join", "view_state", "set_state"] }};

    Promise.all([
      domain.activities().join("code-editor", model.modelId(), options).then(a => activity = a),
      domain.chat()
        .create({
          id: model.modelId(), 
          type: "room", 
          membership: "public", 
          ignoreExistsError: true
        })
        .then(channelId => domain.chat().join(channelId))
        .then(c => chatRoom = c),
        this.get_info_repositorio(model.modelId(), model.root().get("name").value())
        .then(p => {port_machine = p.port; rol = p.rol}),
    ])
    .then(() => {
        const projectData = {model, activity, chatRoom, user: model.session().user(), port_machine, rol};
        this.setState({projectData, loading: false});
        this.is_rol_changed();
      }).catch((e) => {
      console.error(e);
    });
  }

  async is_rol_changed()
  { let bool = true;
    while(bool)
    { 
      await new Promise (async resolve => {setTimeout(() => resolve(), 5000)})
      await new Promise(() => {
        fetch('/ssh_handler/get-rol', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            'token': this.state.token,
            'modelId': this.state.projectData.model.modelId()
          }),
        }).then((response) => {
          if(response.ok) {
            return response.json();
          } else {
            this.setState({message: "Error en el servidor!", inProgress: false});
          }
        })
        .then((json) => {
          if(json.rol === "ERROR")
          {   this.handleClose()
              bool = false;
          }
          else if (this.state.projectData.rol !== json.rol)
          {   const projData = this.state.projectData;
              projData.activity.leave();
              projData.chatRoom.leave();
              this.handleOpenProject(this.state.projectData.model)
              bool = false;
          }
        });
      })
    }
  }



  render() {
    
    let component = null;
    if ((this.state.domain === null && !this.state.loading) || (this.state.token === "") || (this.state.rol === "ERROR")) { 
      component =
        (<Login
          domainUrl={this.props.domainUrl}
          onLogin={this.handleLogin}
          setCookies={this.setCookies}
        />);
    } else if (this.state.projectData === null && !this.state.loading) { //TODO: IMPORTANTE PARA VOLVER ATRAS this.state.projectData
      component =
        (<ProjectsDialog
          collectionId={'projects'}
          onOpen={this.handleOpenProject}
          modelService={this.state.domain.models()}
          onLogout={this.handleLogout}
          token = {this.state.token}
          username = {this.state.username}
        />);
    } else if (this.state.loading) {
      component =(<div className='parent'> <div className='child'><i className="fa fa-spinner fa-pulse fa-3x fa-fw child"></i> <span className='texto'>Cargando...</span></div></div>);
    }else {
      component = 
      (<Home
        rtModel={this.state.projectData.model}
        chatRoom={this.state.projectData.chatRoom}
        domain={this.state.domain}
        activity={this.state.projectData.activity}
        user={this.state.projectData.user}
        onLogout={this.handleLogout}
        onClose={this.handleClose}
        port_machine= {this.state.projectData.port_machine}        
        token = {this.state.token}
        rol = {this.state.projectData.rol}
      />);
    }
    return component;
  }
  async get_info_repositorio(modelId, name) 
  { 
    return new Promise(resolve => {
      fetch('/ssh_handler/repository_on_open', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          'modelId': modelId,
          'name': name,
          'username': this.state.username
        }),
      }).then((response) => {
        if(response.ok) {
            return response.json();
        } else {
            console.log('Server response wasn\'t OK');
        }
      })
      .then((json) => {
        console.log(json.message);
        resolve(json.message);
      });
    });
  }

}

export default withCookies(CodeEditor);