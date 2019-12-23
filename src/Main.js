import '@reshuffle/code-transform/macro';
import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@reshuffle/react-auth';
import './Main.css';
import reshuffleLogo from './assets/reshuffle.png';
import { getProfile } from '../backend/users';
import Upload from './Upload';

export default function Main() {
  const [profilePic, setProfilePic] = useState();

  const {
    loading,
    error,
    authenticated,
    profile,
    login,
    getLogoutURL,
  } = useAuth();

  useEffect(() => {
    (async () => {
      // NOTE: no error handling implemented here
      const prof = await getProfile();
      if (prof) {
        setProfilePic(prof.picture.url);
      }
    })();
  }, [setProfilePic, profile]);

  const handleLogin = useCallback((e) => {
    login({ newWindow: true });
    e.preventDefault();
  }, [login]);

  if (loading) {
    return <div><h2>Loading...</h2></div>;
  }
  if (error) {
    return <div className='error'><h1>{error.toString()}</h1></div>;
  }
  return (
    <>
      <header>
        <div className='title'>
          <img src={reshuffleLogo} height={20} alt='Reshuffle logo' />
          <h2>Profile pic uploader</h2>
        </div>
        <div className='profile'>
          {authenticated ? (
            <>
              <div className='picture' style={{ backgroundImage: `url(${profilePic || profile.picture})` }} alt='profile' />
              <span className='username'>{profile.displayName}</span>
              <a href={getLogoutURL()}>Logout</a>
            </>
          ) : (
            <a href='/login' onClick={handleLogin}>Login</a>
          )}
        </div>
      </header>
      <main>
        <Upload setDisplayProfilePic={setProfilePic} />
      </main>
    </>
  );
}
