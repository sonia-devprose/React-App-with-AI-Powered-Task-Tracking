import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer>
      <p>Copyright © {new Date().getFullYear()}</p>
      <p>About</p>
    </footer>
  );
};

export default Footer;