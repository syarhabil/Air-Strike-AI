
import React from 'react';
import { Settings } from '../types';
import { CloseIcon } from './Icon';

interface SettingsModalProps {
  settings: Settings;
  onSettingsChange: (newSettings: Settings) => void;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ settings, onSettingsChange, onClose }) => {
    const handleToggle = (key: keyof Settings) => {
        onSettingsChange({ ...settings, [key]: !settings[key] });
    };

    const handleDifficultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onSettingsChange({ ...settings, difficulty: e.target.value as 'easy' | 'medium' | 'hard' });
    };

    return (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-gray-900 border-2 border-cyan-500 rounded-lg shadow-2xl p-8 w-full max-w-md relative text-white">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
                    <CloseIcon />
                </button>
                <h2 className="text-3xl font-bold text-cyan-400 mb-6 text-center">Settings</h2>
                
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <span className="text-lg">Music</span>
                        <button
                            onClick={() => handleToggle('music')}
                            className={`w-14 h-8 rounded-full flex items-center transition-colors ${settings.music ? 'bg-cyan-500' : 'bg-gray-700'}`}
                        >
                            <span className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${settings.music ? 'translate-x-7' : 'translate-x-1'}`}></span>
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-lg">Sound Effects (SFX)</span>
                        <button
                            onClick={() => handleToggle('sfx')}
                            className={`w-14 h-8 rounded-full flex items-center transition-colors ${settings.sfx ? 'bg-cyan-500' : 'bg-gray-700'}`}
                        >
                            <span className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${settings.sfx ? 'translate-x-7' : 'translate-x-1'}`}></span>
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-lg">Difficulty</span>
                        <select
                            value={settings.difficulty}
                            onChange={handleDifficultyChange}
                            className="bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                    </div>
                </div>

                <button onClick={onClose} className="mt-8 w-full py-3 bg-cyan-600 hover:bg-cyan-500 rounded-lg font-bold transition-colors">
                    Done
                </button>
            </div>
        </div>
    );
};

export default SettingsModal;
