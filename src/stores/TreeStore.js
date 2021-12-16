import {UserActions} from '../constants/ActionTypes';
import {BaseStore} from './BaseStore';
import {isNodeFolder} from '../utils';
import { TREE_ROOT_ID } from '../constants/tree';

/**
 * Fixme the data structure for this could be cleaned up / simplified
 */
export default class TreeStore extends BaseStore {
  constructor(rtModel, port_machine) {
    super();

    this.rtModel = rtModel;
    this.port_machine = port_machine;
    this.initState();
  }

  initState() {
    this.newNode = {};
  }

  getTreeState() {
    return {
      selectedId: this.selectedNode,
      newNode: this.newNode,
      folderMarkedForDeletion: this.folderMarkedForDeletion
    };
  }

  actionHandler(action) {
    const payload = action.payload;
    switch (action.type) {
      case UserActions.CREATE_FILE:
        this.createFile(payload.id, payload.name, payload.parentId);
        break;
      case UserActions.DELETE_FILE:
      case UserActions.DELETE_FOLDER:
        this.deleteNode(payload.id);
        break;
      case UserActions.MARK_FOLDER_FOR_DELETION:
        this.folderMarkedForDeletion = payload.id;
        break;
      case UserActions.RENAME_FILE: 
        this.renameFile(payload.id, payload.newName);
        break;
      case UserActions.CREATE_FOLDER:
        this.createFolder(payload.id, payload.name, payload.parentId);
        break;
      case UserActions.RENAME_FOLDER:
        this.renameFolder(payload.id, payload.newName);
        break;
      case UserActions.SELECT_NODE:
        this.selectedNode = payload.id;
        break;
      case UserActions.ADD_NEW_NODE:
        this.addNewNode(payload.type, payload.folderId);
        break;
      case UserActions.CANCEL_NEW_NODE:
        this.newNode = {};
        break;
      case UserActions.SELECT_TAB:
        this.selectedNode = payload.id;
        break;
      default:
    }
    this.emitChange();
  }

  async createFile(newId, name, parentId) {
    const nodes = this.getNodes();
    //SAEP-UTA_ agregar no poder agregar con el mismo nombre
    const path = this.rtModel.elementAt(['tree', 'nodes', parentId]).get('path').value()+"/"+name;
    nodes.set(newId, {name: name, id_parent: parentId, path: path}); // agregar path aca

    const parentFolder = this.rtModel.elementAt(['tree', 'nodes', parentId, 'children']);
    parentFolder.push(newId);

    this.create_file_ssh(path); 

  }
  renameFile(id, newName) {
    //SAEP-UTA_ agregar no poder agregar con el mismo nombre
    const rtFile = this.getNode(id);
    rtFile.set('name', newName);
    //rtFile.set('name', path); // cambiar
    
    const old_dir = this.rtModel.elementAt(['tree', 'nodes', id]).get('path').value();

    var new_dir = old_dir;
    const lastIndex = new_dir.lastIndexOf("/");
    new_dir = new_dir.substring(0, lastIndex)+"/"+newName;

    //const new_dir = this.rtModel.elementAt(['tree', 'nodes', id]).get('path').value()+newName;
    rtFile.set('path', new_dir);
    this.rename_element_ssh(old_dir, new_dir);  
  }

  async createFolder(newId, name, parentId) {
    const nodes = this.getNodes();
    const path = this.rtModel.elementAt(['tree', 'nodes', parentId]).get('path').value()+"/"+name;
    //SAEP-UTA_ agregar no poder agregar con el mismo nombre
    nodes.set(newId, {name: name, id_parent: parentId, children: [], path: path});
    nodes.elementAt([parentId, 'children']).push(newId);


    this.create_folder_ssh(path);
  }

  renameFolder(id, newName) {
    //SAEP-UTA_ agregar no poder agregar con el mismo nombre
    const rtFolder = this.getNode(id);
    const oldName = rtFolder.get('name').value();
    rtFolder.set('name', newName);
    const old_dir = this.rtModel.elementAt(['tree', 'nodes', id]).get('path').value()+oldName;
    const new_dir = this.rtModel.elementAt(['tree', 'nodes', id]).get('path').value()+newName;
    this.rename_element_ssh(old_dir, new_dir);  
  }

  deleteNode(id) { 
    const path_element = this.rtModel.elementAt(['tree', 'nodes', id]).get('path').value();
    this.delete_element_ssh(path_element);

    let nodes = this.getNodes();
    let parent = this.rtModel.elementAt(['tree', 'nodes', id]).get('id_parent').value();
    let parentsChildren = nodes.get(parent).get('children');
    let childIndex = parentsChildren.findIndex(childId => childId.value() === id);

    // delete the parent's reference to this node 
    //SAEP-UTA_ AGREGAR ELIMINAR CARPETA/FILE EN CONSOLA VIRTUAL API


    parentsChildren.remove(childIndex);
    nodes.remove(id);
    if(this.selectedNode === id) {
      delete this.selectedNode;
    }
}

  addNewNode(type, nodeId) {
    const nodes = this.getNodes();
    nodeId = nodeId || TREE_ROOT_ID;
    let parentFolderId = nodeId;
    if(!isNodeFolder(nodes, nodeId)) {
      parentFolderId = nodes.elementAt(['tree', 'nodes', nodeId]).get('id_parent');
    } 
    //SAEP-UTA_ AGREGAR CARPETA/FILE EN CONSOLA VIRTUAL API
    this.newNode = {type, folderId: parentFolderId};
  }

  getNodes() {
    return this.rtModel.elementAt(['tree', 'nodes']);
  }
  getNode(id) {
    return this.rtModel.elementAt(['tree', 'nodes', id]);
  }


  create_folder_ssh(path)
  {   return fetch('/ssh_handler/folder_on_create', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        'path': path, // this.rtModel.modelId();
        'port_machine': this.port_machine // Puerto de la máquina
      }),
    });
  }

  create_file_ssh(path)
    { return fetch('/ssh_handler/file_on_create', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        'path': path, 
        'port_machine': this.port_machine // Puerto de la máquina
      }),
    });
  }


  rename_element_ssh(old_dir, new_dir)
  { return fetch('/ssh_handler/element_on_rename', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        'old_dir': old_dir, 
        'new_dir': new_dir,
        'port_machine': this.port_machine 
      }),
    });
  }

  delete_element_ssh(direction)
  { return fetch('/ssh_handler/element_on_delete', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        'direction': direction,
        'port_machine': this.port_machine 
      }),
    });
  }
  //create_file_ssh()
}