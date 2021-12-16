import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {openFile, deleteFile, renameFile, selectNode, openHistory} from '../../actions/actionCreator';
import RemoteFileActionCreator from '../../actions/RemoteFileActionCreator';
import {FileContextMenu} from './ContextMenu.jsx';
import RenamableNode from './RenamableNode.jsx';
import ConfirmationDialog from '../util/ConfirmationDialog.jsx';

export default class FileNode extends React.Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    markedForDelete: PropTypes.bool,
    selected: PropTypes.bool,
    treeNode: PropTypes.object.isRequired,
    editable: PropTypes.bool.isRequired
  };

  constructor(props) {
    super(props);

    this.remoteActionCreator = new RemoteFileActionCreator(props.id, props.treeNode);
    this.remoteActionCreator.listenFor(['changed', 'deleted']);

    this.state = {
      showContextMenu: false,
      showDeleteConfirm: false,
      showErrorRename: false
    };
  }

  componentDidUpdate() {
    if (this.props.markedForDelete) {
      deleteFile(this.props.id);
    }
  }

  componentWillUnmount() {
    this.remoteActionCreator.cleanUp();
  }

  handleClick = () => {
    selectNode(this.props.id, false);
  };

  handleOpen = () => {
    openFile(this.props.id);
  };

  handleDelete = () => {
    this.setState({showDeleteConfirm: true});
  };

  handleHistory = () => {
    openHistory(this.props.id);
  };

  handleRename = (newName) => {
    var exist;
    var project = this.props.treeNode.model()
    var id_parent = this.props.treeNode.get('id_parent').value()
    var children = project.elementAt(['tree', 'nodes', id_parent]).get('children').value()
    children.forEach(children_id => {
      console.log(project.elementAt(['tree', 'nodes', children_id]).get('name').value())
      if(newName === project.elementAt(['tree', 'nodes', children_id]).get('name').value())
      { exist = true;
      }
    });
    if(exist)
    { this.setState({showErrorRename: true});
    }
    else
    { renameFile(this.props.id, newName);
    }        
    this.setState({renaming: false});
  };

  handleRenameError= () => {
    this.setState({showErrorRename: false});
  }

  handleRenameCancel = () => {
    this.setState({renaming: false});
  };

  handleRenameSelect = () => {
    this.setState({renaming: true});
  };

  handleContextMenu = (e) => {
    this.setState({showContextMenu: true});
    e.preventDefault();
  };

  handleHideContextMenu = () => {
    this.setState({showContextMenu: false});
  };

  handleDeleteFileCancel = () => {
    this.setState({showDeleteConfirm: false});
  }

  handleDeleteFileOk = () => {
    deleteFile(this.props.id);
    this.setState({showDeleteConfirm: false});
  }

  _createDeleteConfirm() {
    if (this.state.showDeleteConfirm) {
      const nodeName = this.props.treeNode.get('name').value();
      const title = "Confirmar eliminación";
      const message = `Eliminar archivo "${nodeName}"?`;
      return (<ConfirmationDialog
        onCancel={this.handleDeleteFileCancel}
        onOk={this.handleDeleteFileOk}
        title={title}
        message={message}
      />);
    }
  }

  _createRenameError() {
    if (this.state.showErrorRename) {
      const title = "Error al cambiar nombre";
      const message = `El nombre del elemento ya existe en la ubicación.`;
      return (<ConfirmationDialog
        onOk={this.handleRenameError}
        onCancel={null}
        title={title}
        message={message}
      />);
    }
  }

  render() {
    const nodeClasses = classNames("node", "file", this.props.selected ? 'selected' : '');
    const deleteConfirm = this._createDeleteConfirm();
    const RenameError = this._createRenameError();

    let contextMenu;
    if(this.state.showContextMenu) {
      contextMenu = (
        <FileContextMenu 
          onHide={this.handleHideContextMenu}
          onSelectDelete={this.handleDelete} 
          onSelectOpen={this.handleOpen}
          onSelectRename={this.handleRenameSelect} 
          editable={this.props.editable}
        />
      );
    }

    const nodeName = this.props.treeNode.get('name').value();

    return (
      <div 
        className={nodeClasses} 
        onClick={this.handleClick} 
        onContextMenu={this.handleContextMenu} 
        onDoubleClick={this.handleOpen}
      >
        <i className="fa fa-file-code-o" /> 
        <RenamableNode 
          name={nodeName} 
          renaming={this.state.renaming} 
          onCancel={this.handleRenameCancel} 
          onComplete={this.handleRename} 
        />
        {contextMenu}
        {deleteConfirm}
        {RenameError}
      </div>
    );
  }  
}
