import React from 'react';
import PropTypes from 'prop-types';
import ProjectItem from './ProjectItem.jsx';

export default class ProjectsList extends React.Component {

  static propTypes = {
    loaded: PropTypes.bool.isRequired,
    onOpen: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired,
    my_repo: PropTypes.array.isRequired,
    our_repo: PropTypes.array.isRequired,
    pub_repo: PropTypes.array.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      selectedId: null,
      selectedList: null
    };
  }

  handleProjectClick = (projectId, item_list) => {
    this.setState({selectedId: projectId, selectedList: item_list});
    this.props.onSelect(projectId);
  }

  handleProjectDoubleClick = (projectId) => {
    this.props.onOpen(projectId);
  }
  handleId = (e) => {
     console.log(e.target.id);
     console.log(e.currentTarget.id);
   }
   
  render() {
    let contents = null;
    let contents2 = null;
    let contents3 = null;
    if (this.props.loaded) {
      contents = this.props.my_repo.map((project) => {
        return (<ProjectItem
          key={project.id}
          project={project}
          item_list = {"my_repo"}
          selected={this.state.selectedId === project.id && this.state.selectedList === "my_repo" }
          onClick={this.handleProjectClick}
          onDoubleClick={this.handleProjectDoubleClick}
        />);
      });

      contents2 = this.props.our_repo.map((project) => {
        return (
        <ProjectItem
          key={project.id}
          item_list = {"our_repo"}
          project={project}
          selected={this.state.selectedId === project.id && this.state.selectedList === "our_repo" }
          onClick={this.handleProjectClick}
          onDoubleClick={this.handleProjectDoubleClick}
        />
        );
      });

      contents3 = this.props.pub_repo.map((project) => {
        return (
        <ProjectItem
          key={project.id}
          item_list = {"pub_repo"}
          project={project}
          selected={this.state.selectedId === project.id && this.state.selectedList === "pub_repo" }
          onClick={this.handleProjectClick}
          onDoubleClick={this.handleProjectDoubleClick}
        />
        );
      });

    } else {
      contents = <div>Cargando...</div>;
      contents2 = <div>Cargando...</div>;
      contents3 = <div>Cargando...</div>;
    }

    return (
      <div>
        <label>Mis repositorios:</label>
        <div className="projects-list">{contents}</div>
        <label>Repositorios en que soy miembro:</label>
        <div className="projects-list">{contents2}</div>
        <label>Repositorios públicos:</label>
        <div className="projects-list">{contents3}</div>
      </div>
    );
  }
}
