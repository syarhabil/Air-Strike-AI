
import React, { useState, useEffect, useCallback } from 'react';
import { GameState, Settings, GeneratedAssets } from './types';
import SplashScreen from './components/SplashScreen';
import MainMenu from './components/MainMenu';
import AssetGenerator from './components/AssetGenerator';
import GameCanvas from './components/GameCanvas';
import SettingsModal from './components/SettingsModal';
import useAudio from './hooks/useAudio';
import useDeviceDetection from './hooks/useDeviceDetection';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.SPLASH);
  const [showSettings, setShowSettings] = useState(false);
  const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    music: true,
    sfx: true,
    difficulty: 'medium',
  });
  const [generatedAssets, setGeneratedAssets] = useState<GeneratedAssets | null>(null);
  const { isMobile } = useDeviceDetection();

  const { play: playMusic, stop: stopMusic } = useAudio(
    'https://assets.mixkit.co/music/preview/mixkit-whip-858.mp3',
    { loop: true, volume: 0.3 }
  );
  
  const handleInteraction = () => {
    if (!isAudioUnlocked) {
        setIsAudioUnlocked(true);
    }
  };

  useEffect(() => {
    if (settings.music && isAudioUnlocked) {
      if (gameState === GameState.PLAYING || gameState === GameState.MENU) {
        playMusic();
      } else {
        stopMusic();
      }
    } else {
      stopMusic();
    }
  }, [gameState, settings.music, playMusic, stopMusic, isAudioUnlocked]);

  useEffect(() => {
    const timer = setTimeout(() => setGameState(GameState.MENU), 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleStartGame = (assets: GeneratedAssets) => {
    setGeneratedAssets(assets);
    setGameState(GameState.PLAYING);
  };

  const handleGameOver = () => {
    setGameState(GameState.GAME_OVER);
    setTimeout(() => {
        setGameState(GameState.MENU);
        setGeneratedAssets(null);
    }, 5000)
  };

  const handleExitToMenu = () => {
    setGameState(GameState.MENU);
    setGeneratedAssets(null);
  }

  const renderContent = () => {
    switch (gameState) {
      case GameState.SPLASH:
        return <SplashScreen />;
      case GameState.MENU:
        return <MainMenu onStart={() => setGameState(GameState.ASSET_GENERATION)} onSettings={() => setShowSettings(true)} />;
      case GameState.ASSET_GENERATION:
        return <AssetGenerator onStartGame={handleStartGame} onBack={handleExitToMenu} />;
      case GameState.PLAYING:
        if (!generatedAssets) return <MainMenu onStart={() => setGameState(GameState.ASSET_GENERATION)} onSettings={() => setShowSettings(true)} />;
        return (
          <GameCanvas
            assets={generatedAssets}
            settings={settings}
            isMobile={isMobile}
            onGameOver={handleGameOver}
            onExit={handleExitToMenu}
          />
        );
      case GameState.GAME_OVER:
         return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-black bg-opacity-70 text-white">
                <h1 className="text-6xl font-bold text-red-500 animate-pulse">GAME OVER</h1>
                <p className="mt-4 text-xl">Returning to main menu...</p>
            </div>
        )
      default:
        return <SplashScreen />;
    }
  };

  return (
    <div onClick={handleInteraction} className="w-screen h-screen bg-black overflow-hidden flex items-center justify-center font-['Orbitron'] cursor-pointer">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
      <div className="relative w-full h-full max-w-screen-lg max-h-[1024px] aspect-video">
        {renderContent()}
        {showSettings && <SettingsModal settings={settings} onSettingsChange={setSettings} onClose={() => setShowSettings(false)} />}
      </div>
    </div>
  );
};

export default App;
