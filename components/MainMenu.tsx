
import React from 'react';
import { PlayIcon, SettingsIcon } from './Icon';

interface MainMenuProps {
  onStart: () => void;
  onSettings: () => void;
}

const MenuButton: React.FC<{ onClick: () => void; children: React.ReactNode; className?: string }> = ({ onClick, children, className }) => (
  <button
    onClick={onClick}
    className={`
        w-64 py-4 px-6 text-xl font-bold text-cyan-200 bg-cyan-900 bg-opacity-50 border-2 border-cyan-400 
        rounded-md shadow-[0_0_15px_rgba(0,255,255,0.3)] backdrop-blur-sm
        hover:bg-cyan-700 hover:text-white hover:shadow-[0_0_25px_rgba(0,255,255,0.7)]
        transition-all duration-300 ease-in-out transform hover:scale-105
        flex items-center justify-center space-x-3
        ${className}
    `}
  >
    {children}
  </button>
);


const MainMenu: React.FC<MainMenuProps> = ({ onStart, onSettings }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center animate-fadeIn">
        <h1 className="text-7xl font-black text-white drop-shadow-[0_2px_5px_rgba(0,255,255,0.6)] mb-4" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            AIR <span className="text-cyan-400">STRIKE</span> AI
        </h1>
        <p className="text-gray-300 text-lg mb-16">Design your battle. Dominate the skies.</p>

        <div className="space-y-6">
            <MenuButton onClick={onStart}>
                <PlayIcon />
                <span>START GAME</span>
            </MenuButton>
            <MenuButton onClick={onSettings}>
                <SettingsIcon />
                <span>SETTINGS</span>
            </MenuButton>
        </div>
        <div className="absolute bottom-4 text-xs text-gray-500">
            A Gemini & Imagen AI Experiment
        </div>
    </div>
  );
};

export default MainMenu;
