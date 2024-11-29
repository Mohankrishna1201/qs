import React from 'react';
import './Loader.css'; // Import the loader styles

const Loader = () => {
    return (
        <div className="loader-container">
            <div className="spinner"></div>
            <p>Loading Chat...</p>
        </div>
    );
};

export default Loader;
