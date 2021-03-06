import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {generateUUID} from '../../utils';
import {createFile, createFolder, cancelNewNode} from '../../actions/actionCreator';
import Collapser from './Collapser.jsx';
import InlineInput from './InlineInput.jsx';
import FileNode from './FileNode.jsx';
import FolderNode from './FolderNode.jsx';
import ConfirmationDialog from '../util/ConfirmationDialog.jsx';

export default class TreeView extends React.Component {
  static propTypes = {
    collapsed: PropTypes.bool,
    defaultCollapsed: PropTypes.bool,
    folder: PropTypes.object.isRequired,
    folderId: PropTypes.string.isRequired,
    markedForDelete: PropTypes.bool,
    treeNodes: PropTypes.object.isRequired,
    treeState: PropTypes.object.isRequired,
    editable: PropTypes.bool.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      collapsed: props.collapsed || props.defaultCollapsed,
      showErrorCreate: false
    };
  }

  handleCollapserClick = () => {
    this.setState({collapsed: !this.state.collapsed});
  }

  handleNewChildCancel = () => {
    cancelNewNode(this.props.folderId);
  }

  isMarkedForDelete = () => {
    return this.props.markedForDelete || this.props.treeState.folderMarkedForDeletion === this.props.folderId;
  }

  handleEntityNamed = (name) => {
    var exist;
    
    
    var children = this.props.treeNodes.get(this.props.folderId).get('children').value()
    
    children.forEach(children_id => {
      
      if(name === this.props.treeNodes.get(children_id).get('name').value())
      { exist = true;
        console.log(name)
      }
    });
    if(exist)
    { this.setState({showErrorCreate: true});
      cancelNewNode(this.props.folderId);
    }
    else
    { const newId = generateUUID();
      if(this.props.treeState.newNode.type === 'file') {
        createFile(newId, name, this.props.folderId);
      } else if(this.props.treeState.newNode.type === 'folder') {
        createFolder(newId, name, this.props.folderId);
      }
      cancelNewNode(this.props.folderId);
    }
  }

  handleCreateError= () => {
    this.setState({showErrorCreate: false});
  }

  _createError() {
    if (this.state.showErrorCreate) {
      const title = "Error al crear el elemento";
      const message = `El nombre del elemento ya existe en la ubicaci??n.`;
      return (<ConfirmationDialog
        onOk={this.handleCreateError}
        onCancel={null}
        title={title}
        message={message}
      />);
    }
  }

  renderChildren = (children, nodes) => {
    var childNodes = [];
    children.forEach(child => {
      const id = child.value();
      let node = nodes.get(id);
      if(node.hasKey('children')) {
        childNodes.push(
          <TreeView 
            defaultCollapsed={this.props.defaultCollapsed} 
            folder={node} 
            folderId={id}
            markedForDelete={this.isMarkedForDelete()}
            treeNodes={this.props.treeNodes}
            key={id}
            treeState={this.props.treeState}
            editable={this.props.editable} />
            
        );
      } else {
        childNodes.push(
          <FileNode 
            id={id}
            key={id}
            treeNode={node}
            markedForDelete={this.isMarkedForDelete()}
            selected={this.props.treeState.selectedId === id}
            editable={this.props.editable} />
        );
      }
    });
    return childNodes;
  }

  render() {
    const {
      collapsed = this.state.collapsed,
      folder,
      folderId,
      treeNodes,
      treeState
    } = this.props;

    const CreateError = this._createError();

    let containerClasses = classNames('node-children', collapsed ? 'collapsed' : 'open');

    let placeholderNode;
    if(treeState.newNode.folderId === folderId) {
      placeholderNode = (
        <NewNodePlaceholder 
          name={''} 
          onCancel={this.handleNewChildCancel} 
          onComplete={this.handleEntityNamed} 
          type={treeState.newNode.type} />
      );
    }

    return (
      <div className="sub-tree">
        <div className="node">
          <Collapser onClick={this.handleCollapserClick} collapsed={collapsed} />
          <FolderNode 
            collapsed={collapsed}
            id={folderId}
            markedForDelete={this.isMarkedForDelete()}
            model={folder} 
            onCollapse={this.handleCollapserClick}
            selected={treeState.selectedId === folderId}
            editable={this.props.editable}
          />
        </div>
        <div className={containerClasses}>
          {placeholderNode}
          {this.renderChildren(folder.get('children'), treeNodes)}
        </div>
        {CreateError}
      </div>
      
    );
  }
}

function NewNodePlaceholder(props) { 
  const nodeClasses = classNames('new-node node', props.type === 'file' ? 'file' : '');
  const iconClasses = classNames('fa', props.type === 'file' ? 'fa-file-code-o' : 'fa-folder-o');

  return (
    <div className={nodeClasses}>
      <i className={iconClasses} /> 
      <InlineInput onCancel={props.onCancel} onComplete={props.onComplete} 
        value={props.name} /> 
    </div>
  );
}

NewNodePlaceholder.propTypes = {
  name: PropTypes.string.isRequired,
  onCancel: PropTypes.func.isRequired,
  onComplete: PropTypes.func.isRequired,
  type: PropTypes.string,
};

