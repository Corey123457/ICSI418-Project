// src/App.js
import React from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";

import Login from "./Login";
import Signup from "./Signup";
import Dashboard from "./Dashboard";
import ChooseP from "./ChooseP";
import CreateTrip from "./CreateTrip";
import NewTrip from "./NewTrip";
import Shortcuts from "./Shortcuts";
import Groups from "./Groups";
import Preferences from "./Preferences";
import Itinerary from "./Itinerary";
import Settings from "./Settings";
import Trip from "./Trip";   // ⭐ VERY IMPORTANT — Trip component added

// Simple auth guard using localStorage userProfile
const ProtectedRoute = ({ children }) => {
  const profile = JSON.parse(localStorage.getItem("userProfile") || "null");
  if (!profile) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const router = createBrowserRouter([
  { path: "/", element: <Login /> },
  { path: "/Signup", element: <Signup /> },

  {
    path: "/Dashboard",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },

  // ⭐ NEW IMPORTANT ROUTE — FIXES THE "NOT MOVING FORWARD" PROBLEM
  {
    path: "/Trip",
    element: (
      <ProtectedRoute>
        <Trip />
      </ProtectedRoute>
    ),
  },

  {
    path: "/Itinerary",
    element: (
      <ProtectedRoute>
        <Itinerary />
      </ProtectedRoute>
    ),
  },

  {
    path: "/CreateTrip",
    element: (
      <ProtectedRoute>
        <CreateTrip />
      </ProtectedRoute>
    ),
  },
  {
    path: "/NewTrip",
    element: (
      <ProtectedRoute>
        <NewTrip />
      </ProtectedRoute>
    ),
  },

  {
    path: "/Shortcuts",
    element: (
      <ProtectedRoute>
        <Shortcuts />
      </ProtectedRoute>
    ),
  },
  {
    path: "/Groups",
    element: (
      <ProtectedRoute>
        <Groups />
      </ProtectedRoute>
    ),
  },
  {
    path: "/Preferences",
    element: (
      <ProtectedRoute>
        <Preferences />
      </ProtectedRoute>
    ),
  },
  {
    path: "/Settings",
    element: (
      <ProtectedRoute>
        <Settings />
      </ProtectedRoute>
    ),
  },

  // fallback
  {
    path: "*",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
