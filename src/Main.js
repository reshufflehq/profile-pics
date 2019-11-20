import '@reshuffle/code-transform/macro';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@reshuffle/react-auth';
import './Main.css';
import reshuffleLogo from './assets/reshuffle.png';
import { incrViewCount } from '../backend/users';

export default function Main() {
  const [viewCount, setViewCount] = useState();
  useEffect(() => {
    incrViewCount().then(setViewCount);
  }, [setViewCount]);

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
            <div className='picture' style={{ backgroundImage: `url(${profile.picture})` }} alt='profile' />
            <span className='username'>{profile.displayName} {viewCount ? `(${viewCount})` : ''}</span>
            <a href={getLogoutURL()}>Logout</a>
          </>
        ) : (
          <a href={getLoginURL()}>Login</a>
        )}
      </div>
    </header>
  );
}

