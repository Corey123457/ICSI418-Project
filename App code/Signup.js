import axios from 'axios'
import React, { useState } from 'react';

const handleSignUp = (event, firstName, lastName, username, password) => {
    axios.post('http://localhost:9000/createUser', { firstName, lastName, username, password })
        .catch((err) => alert('Error in Signing Up'))
}

const Signup = () => {

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
    e.preventDefault();
    };

    return (
    <>
    <form onSubmit={handleSubmit}>
    <label for="First Name">First Name:
    </label>   				<input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
    <label for="Last Name">Last Name:
    </label>   				<input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
    <label for="UserID">User ID:
    </label>   				<input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
    <label for="Password">Password:
    </label>   				<input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
     <button type="button" onClick={(event) => handleSignUp(event, firstName, lastName, username, password)}>
          Signup
        </button>
    </form>

    |<a href="/Login">Login</a>|
    <a href="/ChooseP">ChooseP</a>|

    </>
    );
    };
    export default Signup;