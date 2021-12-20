import React from 'react';
import PropTypes from 'prop-types';
import SplitPanel from 'react-split-pane';

import Files from './containers/Files.jsx';
import Editors from './containers/Editors.jsx';

import ParticipantsList from './participants/ParticipantsList.jsx';
import GroupChatPane from './chat/GroupChatPane.jsx';
import Banner from './Banner.jsx';

export default function Home({rtModel, chatRoom, domain, activity, onClose, onLogout, user, port_machine, rol, token}) {
  const displayName = user.displayName ? user.displayName : user.username;  
  const mv = "/webssh2/ssh/host/localhost?port="+port_machine;
  return (
    <div className="code-editor">
      <Banner
          className="status-bar"
          username={displayName}
          onClose={onClose}
          onLogout={onLogout}/>
      <div className="_editor">
        
        <div className="top-pane">
          <SplitPanel direction="horizontal" defaultSize={200}>
            <Files rtModel={rtModel} port_machine={port_machine} rol = {rol} token = {token} username={displayName}/> 
            
            <SplitPanel direction="horizontal" defaultSize={200} primary="second">

              <Editors 
                rtModel={rtModel} 
                port_machine={port_machine}
                rol = {rol}
              />

              <div className="right-pane">
                <div className="section-title">Participantes</div>
                <ParticipantsList activity={activity}/>
                <div className="section-title">Chat de grupo</div>
                <GroupChatPane
                  displayName={displayName}
                  chatRoom={chatRoom}
                  domain={domain}
                />
              </div>
            </SplitPanel>
          </SplitPanel>
          </div>
      </div>

        <iframe className= "console" src= {mv}></iframe>

      
    </div>

  );
}

Home.propTypes = {
  activity: PropTypes.object.isRequired,
  chatRoom: PropTypes.object.isRequired,
  domain: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
  rtModel: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired
};
