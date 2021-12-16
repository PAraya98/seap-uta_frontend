import React from 'react';
import PropTypes from 'prop-types';
import Popover from '../util/Popover.jsx';

// FIXME seems like this could be abstracted into something more generic.

export function FileContextMenu(props) { 
  return (props.editable ?
    <Popover display onHide={props.onHide}>
      <div className="context-menu" onClick={props.onHide}>
        <ul>
          <li onClick={props.onSelectOpen}>Abrir</li>
          <li onClick={props.onSelectRename}>Renombrar...</li>
          <li onClick={props.onSelectDelete}>Borrar...</li>
        </ul>
      </div> 
    </Popover> : null
  );
}
FileContextMenu.propTypes = {
  onHide: PropTypes.func.isRequired,
  editable: PropTypes.bool.isRequired,
  onSelectDelete: PropTypes.func.isRequired,
  onSelectOpen: PropTypes.func.isRequired,
  onSelectRename: PropTypes.func.isRequired,
};


export function FolderContextMenu(props) {
  return ( props.editable ? 
    <Popover display onHide={props.onHide}>
      <div className="context-menu" onClick={props.onHide}>
        <ul>
          {props.canRename ?<li onClick={props.onSelectRename}>Renombrar...</li>: null}
          {props.canDelete ? <li onClick={props.onSelectDelete}>Borrar carpeta</li> : null}
          <li onClick={props.onSelectNewFile}>Nuevo archivo</li>
          <li onClick={props.onSelectNewFolder}>Nueva carpeta</li>
        </ul>
      </div> 
    </Popover>: null
  );
}
FolderContextMenu.propTypes = {
  canDelete: PropTypes.bool,
  editable: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  onSelectDelete: PropTypes.func.isRequired,
  onSelectNewFile: PropTypes.func.isRequired,
  onSelectNewFolder: PropTypes.func.isRequired,
  onSelectRename: PropTypes.func.isRequired,
};
