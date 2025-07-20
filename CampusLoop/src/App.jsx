import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './auth/Login';
import Dashboard from './mainpage/dashboard'; 
import ResumeAnalysis from './components/resumeanalysis';
import Companies from './mainpage/companies';
import ApplyPage from './mainpage/applypage';
import Profile from './mainpage/profile';
import Applied from './mainpage/applied';


const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/resume-analysis' element={<ResumeAnalysis />} />
        <Route path='/eligible-companies' element={<Companies />} />
        <Route path='*' element={<div>404 Not Found</div>} />
        <Route path='/company/:companyId' element={<ApplyPage />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/applied-jobs' element={<Applied />} />
        <Route path='/logout' element={<Login />} />
      

      </Routes>
    </BrowserRouter>
  );
};

export default App;
