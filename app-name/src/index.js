import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
import ChooseP from './ChooseP'
import Dashboard from './Dashboard'
import Manage_Location from './Manage_Location';
const root = ReactDOM.createRoot(document.getElementById('root'));

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
    <Route path = "/" element = {<Login/>}/>
    <Route path = "/Login" element = {<Login/>}/>
    <Route path = "/Signup" element = {<Signup/>}/>
    <Route path = "/ChooseP" element = {<ChooseP/>}/>
    <Route path = "/Dashboard" element = {<Dashboard/>}/>
    <Route path = "/Manage_Location" element = {<Manage_Location/>}/>
    </>
  )
)
root.render(
  <React.StrictMode>
    <RouterProvider router = {router}>
    <App />
    </RouterProvider>
  </React.StrictMode>
);

reportWebVitals();