import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

const Login = () => {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate(); // React Router hook

    const handleLogin = (event, username, password) => {
        axios.get('http://localhost:9000/getUser', { params: { username, password }})
            .then((res) => {
                if (res.data) {
                    alert('Login Successful');
                    navigate("/dashboard"); // Redirect to Dashboard
                } else {
                    alert('Wrong Credentials');
                }
            })
            .catch((err) => alert('Error in Login'));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
    };

    return (
        <>
            <form onSubmit={handleSubmit}>
                <label htmlFor="UserID">User ID:</label>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <label htmlFor="Password">Password:</label>
                <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button
                    type="button"
                    onClick={(event) => handleLogin(event, username, password)}
                >
                    Login
                </button>
            </form>

            |<a href="/Signup">Signup</a>|
            <a href="/ChooseP">ChooseP</a>|
        </>
    );
};

export default Login;