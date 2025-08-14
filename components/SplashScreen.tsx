
import React from 'react';

const AirStrikeLogo = () => (
    <svg width="80%" height="80%" viewBox="0 0 400 150" className="drop-shadow-[0_5px_15px_rgba(0,255,255,0.4)]">
        <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{stopColor: 'rgb(56, 189, 248)', stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: 'rgb(14, 116, 144)', stopOpacity: 1}} />
            </linearGradient>
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@900&display=swap');
                    .title-text { font-family: 'Orbitron', sans-serif; font-weight: 900; font-size: 60px; fill: url(#grad1); }
                    .subtitle-text { font-family: 'Orbitron', sans-serif; font-weight: 400; font-size: 30px; fill: #00FFFF; }
                `}
            </style>
        </defs>
        <path d="M 20 110 L 100 30 L 180 110 Z" fill="none" stroke="url(#grad1)" strokeWidth="5"/>
        <path d="M 60 70 L 100 30 L 140 70" fill="none" stroke="#00FFFF" strokeWidth="3"/>
        <text x="190" y="80" className="title-text animate-pulse">AIR</text>
        <text x="190" y="120" className="subtitle-text animate-pulse">STRIKE</text>
    </svg>
);

const SplashScreen: React.FC = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black animate-fadeIn">
        <div className="w-2/3 h-2/3 flex items-center justify-center">
            <AirStrikeLogo />
        </div>
        <p className="text-cyan-400 text-2xl animate-ping mt-4">AI</p>
        <p className="mt-8 text-gray-400 animate-pulse">Click anywhere to begin</p>
    </div>
  );
};

export default SplashScreen;
