import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = ({ role }) => {

  const adminLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Manage Students', path: '/students' },
    { name: 'Resume OCR Upload', path: '/ocr-upload' },
    { name: 'Placement Analytics', path: '/analytics' },
    { name: 'Recruiters & Offers', path: '/recruiters' },
    { name: 'Settings', path: '/settings' },
    { name: 'Logout', path: '/logout' }
  ];

  const studentLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'My Profile', path: '/profile' },
    { name: 'Resume Analysis', path: '/resume-analysis' },
    { name: 'Eligible Companies', path: '/eligible-companies' },
    { name: 'Applied Jobs', path: '/applied-jobs' },
    { name: 'Logout', path: '/logout' }
  ];

  const links = role === 'admin' ? adminLinks : studentLinks;

  return (
    <div className='w-1/6  bg-black h-screen text-amber-50 p-4'>
      <h2 className='text-xl mt-10 font-semibold mb-6'>
        {role === 'admin' ? 'TPO Panel' : 'Student Panel'}
      </h2>
      <ul className='space-y-10 mt-20 hover:text-shadow-amber-500 transition-colors duration-200 '>
        {links.map((link, index) => (
          <li className='cursor-pointer  hover:text-amber-500 shadow-2xl transition-colors duration-200 ' key={index}>
            <Link to={link.path} >
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
