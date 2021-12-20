import React from 'react';
import PropTypes from 'prop-types';
import { instanceOf } from "prop-types";
import {Convergence} from '@convergence/convergence';
import CenteredPanel from './CenteredPanel.jsx';
import logo from "../assets/img/cl_logo.png";
import { withCookies, Cookies } from "react-cookie";

class Login extends React.Component {

  static propTypes = {
    domainUrl: PropTypes.string.isRequired,
    onLogin: PropTypes.func.isRequired,
    cookies: instanceOf(Cookies).isRequired,
    setCookies: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    
    this.state = {
      inProgress: false,
      username: "",
      password: "",
      token: this.props.token,

    };
  }
  
  handleLogin = async () => {

    this.setState({inProgress: true});

    
    return new Promise(resolve => {
      fetch('/ssh_handler/login', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          'username': this.state.username, 
          'password': this.state.password
        }),
      }).then((response) => {
        if(response.ok) {
            return response.json();
        } else {
            this.setState({message: "Error en el servidor!", inProgress: false});
        }
      })
      .then((json) => {
        if(json.message === "Login correcto!")
        { console.log(json.message);
          this.props.setCookies(json);
          resolve(Convergence.connectAnonymously(this.props.domainUrl, this.state.username).then(d => { this.props.onLogin(d) }));
        }
        else if (json.message === "Login incorrecto!")
        { this.setState({message: json.message, inProgress: false});
        }
      });
    });
  }

  handleUsername = (e) => {
    this.setState({username: e.target.value});
  }

  handlePassword = (e) => {
    this.setState({password: e.target.value});
  }

  handleKeyDown = (e) => {
    if (e.keyCode === 13 && this.validate()) {
      e.stopPropagation();
      e.preventDefault();
      this.handleLogin();
    }
  }

  validate = () => {
    return this.state.username.length > 0 &&
      (this.state.password.length > 0 || this.state.anonymous); 
  }


  render() {
    return (
      <CenteredPanel>
        <div className="login-dialog">
          <div className="login-title">
            <img src={logo} alt="Convergence"/>
            <span>SEAP-UTA</span>
          </div>
          <div className="login-contents">
            <div>
              <label>Nombre de usuario</label>
              <input
                type="text"
                value={this.state.username}
                onChange={this.handleUsername}
                onKeyDown={this.handleKeyDown}
                autoFocus />
            </div>
            <div style={{display: "block"}}>
              <label>Contraseña</label>
              <input
                type="password"
                value={this.state.password}
                onChange={this.handlePassword}
                onKeyDown={this.handleKeyDown}/>
            </div>

          </div>
          <div className="login-buttons">
            <button className="app-button" disabled={!this.validate()} onClick={this.handleLogin}>Entrar</button>
          </div>
          <div className="login-message">{this.state.message}</div>
        </div>
      </CenteredPanel>
    );
  }
}

export default withCookies(Login);