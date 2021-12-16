import React from 'react';
import Home from './Home.jsx';
import Login from './Login.jsx';
import ProjectsDialog from './project/ProjectsDialog.jsx';
import {closeAll} from '../actions/actionCreator';
import {Convergence} from '@convergence/convergence';
import PropTypes from 'prop-types';
import { getUrlParam } from '../utils';

export default class CodeEditor extends React.Component {
  static propTypes = {
    domainUrl: PropTypes.string.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      domain: null,
      projectData: null,
      loading: false,
    };
  }

  componentDidMount() {
    this.tryAutoLogin();
  }

  handleLogin = (domain) => {
    this.setState({domain});
  }
  tryAutoLogin = () => {
    let username = getUrlParam('user');
    if (username) {
      Convergence.connectAnonymously(this.props.domainUrl, username).then(d => {
        this.setState({domain: d});
      });
    }
  }

  handleClose = () => {
    const projData = this.state.projectData;
    projData.model.close();
    projData.activity.leave();
    projData.chatRoom.leave();

    closeAll();

    this.setState({projectData: null, mv_started: null});
  }

  handleLogout = () => {
    this.state.domain.dispose();
    this.setState({domain: null, projectData: null});
  }

  handleOpenProject = (model) => {
    const domain = this.state.domain;
    this.setState({loading: true});
    let activity = null;
    let chatRoom = null;
    let port_machine = null;
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
        .then(p => port_machine = p),
    ])
    .then(() => {
        const projectData = {model, activity, chatRoom, user: model.session().user(), port_machine, editable: true};
        this.setState({projectData, loading: false});
      }).catch((e) => {
      console.error(e);
    });
  }

  render() {
    let component = null;
    if (this.state.domain === null) { 
      component =
        (<Login
          domainUrl={this.props.domainUrl}
          onLogin={this.handleLogin}
        />);
    } else if (this.state.projectData === null && !this.state.loading) {
      component =
        (<ProjectsDialog
          collectionId={'projects'}
          onOpen={this.handleOpenProject}
          modelService={this.state.domain.models()}
          onLogout={this.handleLogout}
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
        editable = {this.state.projectData.editable}
      />);
    }
    return component;
  }
  async get_info_repositorio(modelId, name) //TODO: Entregar visibilidad editable prop
  { return new Promise(resolve => {
      fetch('/ssh_handler/repository_on_open', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          'repository_id': modelId,
          'name': name
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
