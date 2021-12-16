export default class EditorData {
  constructor( modelId, title, model, historical, port_machine) {
    this.modelId = modelId;
    this.title = title;
    this.model = model;
    this.historical = historical;
    this.port_machine = port_machine;
  }

  setModel(model) {
    this.model = model;
  }
}
