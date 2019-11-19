import '@reshuffle/code-transform/macro';
import React, { useEffect } from 'react';
import { useAuth } from '@reshuffle/react-auth';
import './Main.css';
import reshuffleLogo from './assets/reshuffle.png';
import { getSession } from '../backend/users';

function getPhotoUrl(profile) {
  // profile.photos[0] *should* contain a URL.  In practice we see it
  // on profile.picture (which is _not_ part of passport.Profile or
  // passportAuth0.Profile).
  return profile.picture;
}

export default function Main() {
  useEffect(() => {
    // Non-practical example of session in exposed function
    getSession().then((session) => console.log('session:', session));
  }, []);

  const {
    loading,
    error,
    authenticated,
    profile,
    getLoginURL,
    getLogoutURL,
  } = useAuth();

  if (loading) {
    return <div><h2>Loading...</h2></div>;
  }
  if (error) {
    return <div className='error'><h1>{error.toString()}</h1></div>;
  }
  return (
    <header>
      <div className='title'>
        <img src={reshuffleLogo} height={20} alt='Reshuffle logo' />
        <h2>Auth Demo</h2>
      </div>
      <div className='profile'>
        {authenticated ? (
          <>
            <img src={getPhotoUrl(profile)} height={20} />
            <span className='username'>{profile.displayName}</span>
            <a href={getLogoutURL()}>Logout</a>
          </>
        ) : (
          <a href={getLoginURL()}>Login</a>
        )}
      </div>
    </header>
  );
}

