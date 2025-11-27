import {React, useState} from "react";
import axios from 'axios'

const handleLogin = (event, username, password) => {
    axios.get('http://localhost:9000/getUser', { params: { username, password}})
        .then((res) => {
            if (res.data) {
                alert('Login Successful')
            }
            else {
                alert('Wrong Credentials')
            }
        })
        .catch((err) => alert('Error in Login'))
}

const Login = () => {
    
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');   

    const handleSubmit = (e) => {
    e.preventDefault();
    };
    
    return (
    <>
    <form onSubmit={handleSubmit}>
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
     <button type="button" onClick={(event) => {
                    handleLogin(event, username, password)
                }}>Login</button>
    </form>


    |<a href="/Signup">Signup</a>|
    <a href="/ChooseP">ChooseP</a>|

    </>
    );
    };
    export default Login; 