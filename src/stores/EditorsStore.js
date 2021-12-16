import {UserActions, RemoteActions} from '../constants/ActionTypes';
import {BaseStore} from './BaseStore';
import EditorData from '../editorData';


export default class EditorsStore extends BaseStore {

  constructor(rtModel, port_machine) {
    super();

    this.modelService = rtModel.session().domain().models();
    this.collectionId = "files";
    this.username = rtModel.session().user().username;
    this.rtModel = rtModel;
    this.port_machine = port_machine;
    this.initState();
  }

  initState() {
    this.editors = [];
  }

  getEditors() {
    return this.editors;
  }

  getActiveEditor() {
    return this.activeEditor;
  }

  actionHandler(action) {
    const payload = action.payload;
    switch (action.type) {
      case UserActions.SELECT_TAB:
        this.activateTab(payload.id, payload.historical);
        this.emitChange();
        break;
      case UserActions.SELECT_NODE:
        if (this.isFileOpen(payload.id)) {
          this.activateTab(payload.id, false);
          this.emitChange();
        }
        break;
      case UserActions.CLOSE_TAB:
        this.removeEditor(payload.editor);
        this.emitChange();
        break;
      case UserActions.OPEN_FILE:
        if (!this.isFileOpen(payload.id)) {
          this.openModel(payload.id).then(model => {
            this.createEditor(payload.id, model, false);
            this.emitChange();
          });
        }
        break;
      case UserActions.OPEN_HISTORY:
        if (!this.isFileHistoryOpen(payload.id)) {
          this.openHistoricalModel(payload.id).then(model => {
            this.createEditor(payload.id, model, true);
            this.emitChange();
          });
        }
        break;
      case UserActions.CREATE_FILE:
        this.createModel(payload.id).then(() => {
          return this.openModel(payload.id);
        }).then(model => {
          this.createEditor(payload.id, model, false);
          this.emitChange();
        });
        break;
      case UserActions.DELETE_FILE:
        this.deleteModel(payload.id).then(() => {
          const editor = this.getEditor(payload.id);
          this.removeEditor(editor);
        }).then(() => {
          this.emitChange();
        });
        break;
      case UserActions.RENAME_FILE:
        if (this.setTabTitle(payload.id, payload.newName)) {
          this.renameFile(payload.id, payload.newName);
          this.emitChange();
        }
        break;
      case UserActions.CLOSE_ALL: {
        const editors = this.getEditors().slice(0);
        editors.forEach(editor => {
          this.removeEditor(editor);
          this.emitChange();
        });
        break;
      }
      case RemoteActions.FILE_DELETED: {
        const editor = this.getEditor(payload.id);
        if (editor) {
          this.removeEditor(editor);
          this.emitChange();
        }
        break;
      }
      default:
    }
  }

  activateTab(id, historical) {
    const editor = this.editors.find((editor) => {
      return editor.modelId === id && editor.historical === historical;
    });
    this.activeEditor = editor;
  }

  createModel(id) {
    return this.modelService.create({
      collection: this.collectionId,
      id,
      data: {
        content: '',
        folder: this.rtModel.modelId(),
        path: this.rtModel.elementAt(['tree', 'nodes', id]).get('path').value()
      }
    });
  }


  openModel(modelId) {
    return this.modelService.open(modelId);
  }

  openHistoricalModel(modelId) {
    return this.modelService.history(modelId);
  }

  deleteModel(modelId) {
    return this.modelService.remove(modelId);
  }

  async createEditor(id, model, historical) {
    const editor = new EditorData(id, this.getFileName(id), model, historical, this.port_machine);
    this.editors.push(editor);
    this.activeEditor = editor;
  }

  getEditorIndex(editor) {
    return this.editors.findIndex((e) => {
      return e === editor;
    });
  }

  getEditor(id) {
    return this.editors.find(e => e.modelId === id);
  }

  isFileOpen(id) {
    return this.editors.some(editor => {
      return editor.modelId === id && editor.historical === false;
    });
  }

  isFileHistoryOpen(id) {
    return this.editors.some(editor => {
      return editor.modelId === id && editor.historical === true;
    });
  }

  removeEditor(editor) {
    const index = this.getEditorIndex(editor);

    if (index >= 0) {
      if (!editor.historical) {
        if (editor.model.isOpen()) {
          editor.model.close();
        }
      }

      this.editors.splice(index, 1);

      if (this.editors.length > 0) {
        this.activeEditor = this.editors[0];
      } else {
        delete this.activeEditor;
      }
    }
  }

  getFileName(fileId) {
    return this.rtModel.elementAt(['tree', 'nodes', fileId]).get('name').value();
  }

  setTabTitle(id, title) {
    const editor = this.getEditor(id);
    const index = this.getEditorIndex(editor);
    if (editor) {
      editor.title = title;
    }
    return index >= 0;
  }

  getHistoryId(id) {
    return `history:${id}`;
  }

  renameFile(id, newName)
  { this.modelService.open(id)
    .then(model => {
      var new_dir = model.root().get('path').value();
      const lastIndex = new_dir.lastIndexOf("/");
      new_dir = new_dir.substring(0, lastIndex)+"/"+newName;
      model.root().set('name', newName);
      model.root().set('path', new_dir);
    });
  }
}
