import { AzureCommunicationTokenCredential, CommunicationUserIdentifier } from '@azure/communication-common';
import {  
  CallComposite, 
  fromFlatCommunicationIdentifier, 
  useAzureCommunicationCallAdapter 
} from '@azure/communication-react';
import React, { useState, useMemo, useEffect } from 'react';
import './App.css';

const App = () => { 
  const displayName = 'Guest'
  const [userId, setUserId] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const [teamsMeetingLink, setTeamsMeetingLink] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const credential = useMemo(() => {
    if (token) {
      return new AzureCommunicationTokenCredential(token)
    }
    return;
    }, [token]);

  const callAdapterArgs = useMemo(() => {
    if (userId && credential && displayName && teamsMeetingLink) {
      return {
        userId: fromFlatCommunicationIdentifier(userId) as CommunicationUserIdentifier,
        displayName,
        credential,
        locator: { meetingLink: teamsMeetingLink },
      }
    }
    return {};
  }, [userId, credential, displayName, teamsMeetingLink]);

  const callAdapter = useAzureCommunicationCallAdapter(callAdapterArgs);

  useEffect(() => {
    const init = async () => {
        setMessage('Getting ACS user');
        //Call Azure Function to get the ACS user identity and token
        const res = await fetch('http://localhost:7071/api/ACSTokenFunction' as string);
        const user = await res.json();
        setUserId(user.userId);
        setToken(user.token);

        setMessage('Getting Teams meeting link...');
        //Call Azure Function to get the meeting link
        //const resTeams = await fetch(process.env.REACT_APP_TEAMS_MEETING_FUNCTION as string);
        const resTeams = await fetch('http://localhost:7071/api/TeamsMeetingFunction' as string);
        //console.log('resTeams', resTeams.status)
        const link = await resTeams.text();
        setTeamsMeetingLink(link);
        setMessage('');
        console.log('Dynamic Teams meeting link', link);

    }
    init();

}, []);
  
  if (callAdapter) {
    return (
      <div>
        <h1>Contact Customer Service</h1>
        <div className="wrapper">
          <CallComposite
            adapter={callAdapter}
          />
        </div>
      </div>
    );
  }
  if (!credential) {
    return <>Failed to construct credential. Provided token is malformed.</>;
  }
  if (message) {
    return <div>{message}</div>;
  }
  return <div>Initializing...</div>;
};

export default App;