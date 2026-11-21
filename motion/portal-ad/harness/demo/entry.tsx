import './fetch-mock';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '../contexts/ThemeContext';
import StudentPortal from '../pages/StudentPortal';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <HashRouter>
      <Routes>
        <Route path="/student-portal" element={<StudentPortal />} />
        <Route path="*" element={<Navigate to="/student-portal" replace />} />
      </Routes>
    </HashRouter>
  </ThemeProvider>
);
