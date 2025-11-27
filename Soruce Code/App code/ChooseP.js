import axios from 'axios'
import React, { useState } from 'react';

const handleTeam = (event, pref) => {
    axios.post('http://localhost:9000/choosePref', { pref })
        .catch((err) => alert('Error in Signing Up'))
}

const Signup = () => {

  const [pref, setPref] = useState('');

    const handleSubmit = (e) => {
    e.preventDefault();
    };

    return (
    <>
    <form onSubmit={handleSubmit}>
    <label for="Preferences">Preferences:
    </label>   				<input
            type="text"
            value={pref}
            onChange={(e) => setPref(e.target.value)}
          />
     <button type="button" onClick={(event) => handleTeam(event, pref)}>
          Submit
        </button>
    </form>

    |<a href="/Login">Login</a>|
    <a href="/Signup">Signup</a>|

    </>
    );
    };
    export default Signup;