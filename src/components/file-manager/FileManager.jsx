import React from 'react';
import PropTypes from 'prop-types';
import { addNewNode, deleteFile, markFolderForDelete } from '../../actions/actionCreator';
import {isNodeFolder} from '../../utils';
import ActionButton from './ActionButton.jsx';
import TreeView from './TreeView.jsx';
import { TREE_ROOT_ID } from '../../constants/tree';
import ConfirmationDialog from '../util/ConfirmationDialog';

export default class FileManager extends React.Component {
  static propTypes = {
    treeNodes: PropTypes.object.isRequired,
    treeState: PropTypes.object.isRequired,
    editable: PropTypes.bool.isRequired
  };

  constructor(props) {
    super(props);

    this.rootId = TREE_ROOT_ID;

    this.state = {
      showDeleteConfirm: false
    };
  }

  handleNewFile = () => {
    addNewNode('file', this.props.treeState.selectedId);
  }

  handleNewFolder = () => {
    addNewNode('folder', this.props.treeState.selectedId);
  }

  handleDelete = () => {
    this.setState({showDeleteConfirm: true});
  }

  handleDeleteFolderCancel = () => {
    this.setState({showDeleteConfirm: false});
  }

  handleDeleteFolderOk = () => {
    const id = this.props.treeState.selectedId;
    if(isNodeFolder(this.props.treeNodes, id)) {
      markFolderForDelete(id);
    } else {
      deleteFile(id);
    }
    this.setState({showDeleteConfirm: false});
  }

  renderConfirmDeleteNode() {
    if (this.state.showDeleteConfirm) {
      const selectedId = this.props.treeState.selectedId;
      const folder = this.props.treeNodes.get(selectedId);
      const nodeName = folder.get('name').value();
      const title = "Confirm Delete";
      const message = `Delete folder "${nodeName}"?`;
      return (<ConfirmationDialog
        onCancel={this.handleDeleteFolderCancel}
        onOk={this.handleDeleteFolderOk}
        title={title}
        message={message}
      />);
    }
  }
  handlemembers(){} // TODO: CREAR VISTA DE MIEMBROS - EN CASO DE CREADOR>ADMIN PUEDE MODIFICAR - EN OTRO CASO PUEDE VER

  render() {
    const folder = this.props.treeNodes.get(this.rootId);
    const selectedId = this.props.treeState.selectedId;
    const admin = true; //TODO: AGREGAR AL SOLICITAR EL REPOSITORIO

    let is_folder;
    try {
      is_folder = this.props.treeNodes.get(selectedId).get('children').value() !== undefined;
    } catch (error) {
      is_folder = false;
    }
    const deleteBtnStyle = {display: (!selectedId || selectedId === this.rootId) ? 'none' : 'inline'};
    const newelementBtnStyle = {display: (!(!selectedId || selectedId === this.rootId) && !is_folder) ? 'none' : 'inline'};
    const addmemberBtnStyle = {display: !admin ? 'none' : 'inline'}

    return (this.props.editable ?
       <div className="file-manager">
        <div className="section-title">Repositorio</div>
        <div className="file-actions">
          
        <button  
            className="icon-button"
            onClick={this.handlemembers}  // TODO: https://github.com/cornflourblue/react-hook-form-crud-example
            title="Ver miembros"
            style={addmemberBtnStyle}
            type="button"  
          >
            <i className="fa fa-lg fa-users " />
          </button>


          <button 
            className="icon-button"
            onClick={this.handleNewFile} 
            title="Nuevo archivo"
            style={newelementBtnStyle}
            type="button"  
          >
            <i className="fa fa-lg fa-file-text-o" />
          </button>

          <button 
            className="icon-button"
            onClick={this.handleNewFolder} 
            title="Nueva carpeta" 
            style={newelementBtnStyle}
            type="button" 
          >
            <i className="fa fa-lg fa-folder-o" />
          </button>

          <button 
            className="icon-button"
            onClick={this.handleDelete} 
            style={deleteBtnStyle}
            title="Borrar archivo seleccionado"
            type="button" 
          >
            <i className="fa fa-lg fa-trash-o" />
          </button>
        </div>
        <div className="file-tree">
          <TreeView 
            defaultCollapsed={false} 
            folder={folder} 
            folderId={this.rootId}
            editable={this.props.editable}
            {...this.props} />
        </div>
        { this.renderConfirmDeleteNode() }
      </div> 
      :           
      <div className="file-manager">
        <div className="section-title">Repositorio</div>
        <div className="file-actions">
          <button 
            className="icon-button"
            onClick={this.handlemembers} 
            title="Ver miembros"
            style={addmemberBtnStyle}
            type="button"  
          >
            <i className="fa fa-lg fa-users" />
          </button>
        </div>
        

        <div className="file-tree">
          <TreeView 
            defaultCollapsed={false} 
            folder={folder} 
            folderId={this.rootId}
            editable={this.props.editable}
            {...this.props} />
        </div>
      </div>

    );
  }
}

