import React from 'react';
import PropTypes from 'prop-types';
import TreeStore from '../../stores/TreeStore';
import FileManager from '../file-manager/FileManager.jsx';

export default class Files extends React.Component {
  static propTypes = {
    rtModel: PropTypes.object.isRequired,
    port_machine: PropTypes.number.isRequired,
    editable: PropTypes.bool.isRequired
  };

  constructor(props) {
    super(props);

    this.store = new TreeStore(props.rtModel, props.port_machine);

    this.state = this.getStateFromStore();
  }

  componentDidMount() {
    this.store.addChangeListener(this.onChange);
  }

  componentWillUnmount() {
    this.store.removeChangeListener(this.onChange);
    this.store.dispose();
  }

  onChange = () => {
    this.setState(this.getStateFromStore());
  };

  getStateFromStore = () => {
    return {
      treeNodes: this.store.getNodes(),
      treeState: this.store.getTreeState()
    };
  };

  render() {
    return <FileManager {...this.state } editable={this.props.editable}/>;
  }
}


