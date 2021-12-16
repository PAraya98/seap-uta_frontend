import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { addNewNode, renameFolder, selectNode, deleteFolder, markFolderForDelete } from '../../actions/actionCreator';
import RemoteFolderActionCreator from '../../actions/RemoteFolderActionCreator';
import {FolderContextMenu} from './ContextMenu.jsx';
import RenamableNode from './RenamableNode.jsx';
import ConfirmationDialog from '../util/ConfirmationDialog.jsx';
import { TREE_ROOT_ID } from '../../constants/tree';

export default class FolderNode extends React.Component {
  static propTypes = {
    collapsed: PropTypes.bool,
    id: PropTypes.string.isRequired,
    markedForDelete: PropTypes.bool,
    model: PropTypes.object.isRequired,
    onCollapse: PropTypes.func.isRequired,
    selected: PropTypes.bool,
    editable: PropTypes.bool.isRequired
  };

  constructor(props) {
    super(props);

    this.remoteActionCreator = new RemoteFolderActionCreator(props.id, props.model);
    this.remoteActionCreator.listenFor(['changed']);

    this.state = {
      showContextMenu: false,
      showDeleteConfirm: false,
      showErrorRename: false
    };
  }

  componentDidUpdate() {
    if (this.props.markedForDelete && this.isEmpty()) {
      deleteFolder(this.props.id);
    }
  }

  isEmpty() {
    return this.props.model.get('children').length() === 0;
  }

  handleClick = () => {
    selectNode(this.props.id);
  }

  handleRename = (newName) => { 
    var exist;
    var project = this.props.model.model()
    var id_parent = this.props.model.get('id_parent').value()
    var children = project.elementAt(['tree', 'nodes', id_parent]).get('children').value()
    children.forEach(children_id => {
      if(newName === project.elementAt(['tree', 'nodes', children_id]).get('name').value())
      { exist = true;
      }
    });
    if(exist)
    { this.setState({showErrorRename: true});
    }
    else
    { renameFolder(this.props.id, newName);
    }    
    this.setState({renaming: false});
  }

  handleRenameError= () => {
    this.setState({showErrorRename: false});
  }

  handleRenameCancel = () => {
    this.setState({renaming: false});
  }

  handleContextMenu = (e) => {
    this.setState({showContextMenu: true});
    e.preventDefault();
  }

  handleHideContextMenu = () => {
    this.setState({showContextMenu: false});
  }

  handleRenameSelect = () => {
    this.setState({renaming: true});
  }

  handleDelete = () => {
    this.setState({showDeleteConfirm: true});
  }

  handleNewFile = () => {
    addNewNode('file', this.props.id);
  }

  handleNewFolder = () => {
    addNewNode('folder', this.props.id);
  }

  handleDeleteFolderCancel = () => {
    this.setState({showDeleteConfirm: false});
  }

  handleDeleteFolderOk = () => {
    this.setState({showDeleteConfirm: false});
    markFolderForDelete(this.props.id);
  }
  
  _createDeleteConfirm() {
    if (this.state.showDeleteConfirm) {
      const nodeName = this.props.model.get('name').value();
      const title = "Confirmar eliminación";
      const message = `Eliminar la carpeta "${nodeName}"?`;
      return (<ConfirmationDialog
        onCancel={this.handleDeleteFolderCancel}
        onOk={this.handleDeleteFolderOk}
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
    const deleteConfirm = this._createDeleteConfirm();
    const RenameError = this._createRenameError();
    const nodeClasses = classNames("folder-label", this.props.selected ? 'selected' : '');
    const iconClasses = classNames('fa', this.props.collapsed ? 'fa-folder-o' : 'fa-folder-open-o');

    let contextMenu;
    if(this.state.showContextMenu) {
      contextMenu = (
        <FolderContextMenu 
          onHide={this.handleHideContextMenu}
          onSelectDelete={this.handleDelete} 
          onSelectNewFile={this.handleNewFile} 
          onSelectNewFolder={this.handleNewFolder} 
          onSelectRename={this.handleRenameSelect} 
          canDelete={this.props.id !== TREE_ROOT_ID}
          canRename={this.props.id !== TREE_ROOT_ID}
          editable={this.props.editable}
        />
      );
    }
    const folderName = this.props.model.get('name').value();

    return (
      <div 
        className={nodeClasses} 
        onClick={this.handleClick} 
        onDoubleClick={this.props.onCollapse}
        onContextMenu={this.handleContextMenu}
      >
        <i className={iconClasses} />
        <RenamableNode 
          name={folderName} 
          renaming={this.state.renaming} 
          onCancel={this.handleRenameCancel} 
          onComplete={this.handleRename} />
        {contextMenu}
        {deleteConfirm}
        {RenameError}
      </div>
    );
  }  
}
