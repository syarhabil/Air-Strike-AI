
import React, { useState, useCallback } from 'react';
import { GeneratedAssets } from '../types';
import { generateImage, generateMission, findSoundUrl } from '../services/geminiService';
import { BackIcon } from './Icon';

interface AssetGeneratorProps {
  onStartGame: (assets: GeneratedAssets) => void;
  onBack: () => void;
}

const LoadingSpinner: React.FC = () => (
    <div className="w-16 h-16 border-4 border-t-4 border-gray-600 border-t-cyan-400 rounded-full animate-spin"></div>
);

const AssetGenerator: React.FC<AssetGeneratorProps> = ({ onStartGame, onBack }) => {
  const [playerPrompt, setPlayerPrompt] = useState('a sleek, futuristic silver fighter jet with blue glowing engines');
  const [enemyPrompt, setEnemyPrompt] = useState('a bulky, hostile alien spaceship shaped like a beetle, with green lights');
  const [assets, setAssets] = useState<GeneratedAssets | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setAssets(null);

    try {
      const [playerImg, enemyImg, missionText, laserSfx, hitSfx, explosionSfx] = await Promise.all([
        generateImage(playerPrompt),
        generateImage(enemyPrompt),
        generateMission(),
        findSoundUrl('short laser gun shot', 'https://assets.mixkit.co/sfx/preview/mixkit-short-laser-gun-shot-1670.mp3'),
        findSoundUrl('quick electronic retro hit', 'https://assets.mixkit.co/sfx/preview/mixkit-electronic-retro-block-hit-2185.mp3'),
        findSoundUrl('fast, sharp explosion', 'https://assets.mixkit.co/sfx/preview/mixkit-fast-explosion-1688.mp3')
      ]);

      setAssets({
        player: playerImg,
        enemy: enemyImg,
        mission: missionText,
        sfx: {
          laser: laserSfx,
          hit: hitSfx,
          explosion: explosionSfx
        }
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [playerPrompt, enemyPrompt]);
  
  const canStart = assets !== null;

  return (
    <div className="w-full h-full p-8 flex flex-col items-center justify-center text-white bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn">
        <button onClick={onBack} className="absolute top-4 left-4 text-gray-300 hover:text-white transition-colors p-2 bg-gray-800 rounded-full">
            <BackIcon />
        </button>

        <h2 className="text-4xl font-bold text-cyan-400 mb-2">Design Your Fleet</h2>
        <p className="text-gray-400 mb-8">Describe your ships and let AI bring them to life.</p>

        {error && <div className="bg-red-900 border border-red-500 text-red-200 p-3 rounded-md mb-6">{error}</div>}

        <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 mb-8">
            <div className="flex flex-col">
                <label className="text-lg font-semibold mb-2 text-cyan-300">Your Aircraft</label>
                <textarea
                    value={playerPrompt}
                    onChange={(e) => setPlayerPrompt(e.target.value)}
                    className="w-full p-3 bg-gray-900 border-2 border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                    rows={3}
                    placeholder="e.g., A lightning-fast jet with phoenix wings"
                />
            </div>
            <div className="flex flex-col">
                <label className="text-lg font-semibold mb-2 text-cyan-300">Enemy Aircraft</label>
                <textarea
                    value={enemyPrompt}
                    onChange={(e) => setEnemyPrompt(e.target.value)}
                    className="w-full p-3 bg-gray-900 border-2 border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                    rows={3}
                    placeholder="e.g., A heavy, armored alien mothership"
                />
            </div>
        </div>

        <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-72 py-4 px-6 text-xl font-bold text-white bg-cyan-600 rounded-md hover:bg-cyan-500 disabled:bg-gray-700 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center"
        >
            {isLoading ? 'Generating Assets...' : 'Generate Assets'}
        </button>

        <div className="mt-8 flex gap-8 items-center justify-center h-48">
            {isLoading && <LoadingSpinner />}
            {assets?.player && (
                <div className="text-center animate-fadeIn">
                    <h3 className="text-lg font-semibold mb-2">Your Ship</h3>
                    <img src={`data:image/png;base64,${assets.player}`} alt="Player Ship" className="w-32 h-32 object-contain bg-black/20 rounded-md p-2 border border-cyan-400"/>
                </div>
            )}
            {assets?.enemy && (
                <div className="text-center animate-fadeIn">
                    <h3 className="text-lg font-semibold mb-2">Enemy Ship</h3>
                    <img src={`data:image/png;base64,${assets.enemy}`} alt="Enemy Ship" className="w-32 h-32 object-contain bg-black/20 rounded-md p-2 border border-cyan-400"/>
                </div>
            )}
        </div>
        
        {canStart && (
             <button
                onClick={() => onStartGame(assets)}
                className="mt-8 w-72 py-4 px-6 text-xl font-bold text-black bg-yellow-400 rounded-md hover:bg-yellow-300 transition-all duration-300 animate-pulse"
            >
                LAUNCH MISSION
            </button>
        )}
    </div>
  );
};

export default AssetGenerator;
