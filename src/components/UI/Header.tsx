import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="bg-blue-500 text-white p-4">
            <h1 className="text-2xl font-bold">Monlake Aquarium Dashboard</h1>
            <nav className="mt-2">
                <ul className="flex space-x-4">
                    <li><a href="#aquarium" className="hover:underline">Aquarium</a></li>
                    <li><a href="#dashboard" className="hover:underline">Dashboard</a></li>
                    <li><a href="#about" className="hover:underline">About</a></li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;