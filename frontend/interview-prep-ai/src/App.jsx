// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Login from "./pages/Auth/Login";
import SignUp from "./pages/Auth/SignUp";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Home/Dashboard";
import InterviewPrep from "./pages/InterviewPrep/InterviewPrep";
import ATSScore from "./pages/ATSScore";
import ATSSavedReports from "./pages/ATSSavedReports";
import NewOverview from "./pages/InterviewPrep/NewOverview";
import CodingDashboard from "./pages/Coding/CodingDashboard";
import CodingSession from "./pages/Coding/CodingSession";
import TemplateGenerator from "./pages/Templates/TemplateGenerator";
import MyLibrary from "./pages/Templates/MyLibrary";
import UserProvider from "./context/userContext";
import { ThemeProvider } from "./context/themeContext";

const App = () => {
  return (
    <ThemeProvider>
      <UserProvider>
        <div>
          <Router>
            <Routes>
              {/* Routes  */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/ats-score" element={<ATSScore />} />
              <Route path="/ats-score/saved-reports" element={<ATSSavedReports />} />
              <Route path="/interview-prep/new" element={<NewOverview />} />
              <Route path="/coding" element={<CodingDashboard />} />
              <Route path="/coding/:sessionId" element={<CodingSession />} />
              {/* Template Generator routes */}
              <Route path="/templates" element={<TemplateGenerator />} />
              <Route path="/templates/mylibrary" element={<MyLibrary />} />
              <Route path="/interview-prep/:sessionId" element={<InterviewPrep />} />
            </Routes>
          </Router>

          <Toaster
            toastOptions={{
              className: "",
              style: {
                fontSize: "13px",
              },
            }}
          />
        </div>
      </UserProvider>
    </ThemeProvider>
  );
};

export default App;
