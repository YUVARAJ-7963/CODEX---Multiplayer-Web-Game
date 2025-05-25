import React from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from "./home-page/home";
import Lobby from "./player/lobby";
import Playground from "./Playground/playground";
import AdminLogin from "./admin/pages/AdminLogin";
import Admin from "./admin/Admin";
import ForgotPassword from "./admin/pages/ForgotPassword";
import ResetPassword from "./admin/pages/ResetPassword";
import AdminProtectedRoute from "./admin/components/ProtectedRoute";
import PlayerProtectedRoute from "./player/player-components/ProtectedRoute";
import PlaygroundforPVP from "./Playground/playground_for_PVP";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/forgot-password" element={<ForgotPassword />} />
        <Route path="/admin/reset-password/:token" element={<ResetPassword />} />
        <Route element={<AdminProtectedRoute />}>
          <Route path="/admin" element={<Admin />} />
        </Route>
        <Route element={<PlayerProtectedRoute />}>
          <Route path="/lobby" element={<Lobby />} />
        </Route>
        <Route path="/playground" element={<Playground />} />
        <Route path="/playground-pvp" element={<PlaygroundforPVP />} />
      </Routes>
    </Router>
  );
}

export default App;
  