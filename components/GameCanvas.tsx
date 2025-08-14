
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GeneratedAssets, Settings, Player, Enemy, Bullet, Effect } from '../types';
import useAudio from '../hooks/useAudio';

interface GameCanvasProps {
  assets: GeneratedAssets;
  settings: Settings;
  isMobile: boolean;
  onGameOver: () => void;
  onExit: () => void;
}

const TouchControls: React.FC<{ onMove: (dir: 'left' | 'right' | 'stop') => void; onShoot: () => void }> = ({ onMove, onShoot }) => (
    <div className="absolute bottom-0 left-0 w-full h-1/4 flex justify-between items-center p-4 z-20">
        <div className="flex gap-4">
            <button onTouchStart={() => onMove('left')} onTouchEnd={() => onMove('stop')} className="w-20 h-20 bg-cyan-500/30 text-white rounded-full border-2 border-cyan-400 flex items-center justify-center text-4xl active:bg-cyan-500/60">‹</button>
            <button onTouchStart={() => onMove('right')} onTouchEnd={() => onMove('stop')} className="w-20 h-20 bg-cyan-500/30 text-white rounded-full border-2 border-cyan-400 flex items-center justify-center text-4xl active:bg-cyan-500/60">›</button>
        </div>
        <button onTouchStart={() => onShoot()} className="w-24 h-24 bg-red-600/50 text-white rounded-full border-2 border-red-500 flex items-center justify-center text-lg font-bold active:bg-red-600/80">FIRE</button>
    </div>
);


const GameCanvas: React.FC<GameCanvasProps> = ({ assets, settings, isMobile, onGameOver, onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [isPaused, setIsPaused] = useState(false);
  const [screenShake, setScreenShake] = useState(0);

  const { play: playLaser } = useAudio(assets.sfx.laser, { volume: 0.4 });
  const { play: playHit } = useAudio(assets.sfx.hit, { volume: 0.3 });
  const { play: playExplosion } = useAudio(assets.sfx.explosion, { volume: 0.5 });

  // Game state refs
  const playerRef = useRef<Player>({ id: 'player', x: 0, y: 0, width: 60, height: 60 });
  const enemiesRef = useRef<Enemy[]>([]);
  const bulletsRef = useRef<Bullet[]>([]);
  const effectsRef = useRef<Effect[]>([]);
  const keysPressed = useRef<Record<string, boolean>>({});
  const lastShotTime = useRef(0);

  const difficultySettings = {
      easy: { enemySpeed: 2, enemySpawnRate: 1500, enemyHealth: 1 },
      medium: { enemySpeed: 3, enemySpawnRate: 1000, enemyHealth: 2 },
      hard: { enemySpeed: 4, enemySpawnRate: 700, enemyHealth: 3 },
  };
  const currentDifficulty = difficultySettings[settings.difficulty];

  const playerImg = useRef<HTMLImageElement>(new Image());
  const enemyImg = useRef<HTMLImageElement>(new Image());

  useEffect(() => {
    playerImg.current.src = `data:image/png;base64,${assets.player}`;
    enemyImg.current.src = `data:image/png;base64,${assets.enemy}`;
  }, [assets]);

  const triggerScreenShake = (intensity: number) => {
    setScreenShake(intensity);
    setTimeout(() => setScreenShake(0), 150);
  };

  const shoot = useCallback(() => {
    const now = Date.now();
    if (now - lastShotTime.current > 200) { // Cooldown
      if (settings.sfx) playLaser();
      bulletsRef.current.push({
        id: Date.now(),
        x: playerRef.current.x + playerRef.current.width / 2 - 2.5,
        y: playerRef.current.y,
        width: 5,
        height: 20,
      });
      lastShotTime.current = now;
    }
  }, [settings.sfx, playLaser]);
  
  const mobileMoveRef = useRef<'left'|'right'|'stop'>('stop');

  const handleMobileMove = (dir: 'left'|'right'|'stop') => {
      mobileMoveRef.current = dir;
  };
  
  const gameLoop = useCallback(() => {
    if (isPaused) {
        gameLoopRef.current = requestAnimationFrame(gameLoop);
        return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    ctx.save();
    if (screenShake > 0) {
        const dx = (Math.random() - 0.5) * screenShake;
        const dy = (Math.random() - 0.5) * screenShake;
        ctx.translate(dx, dy);
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update & draw player
    const playerSpeed = 7;
    if (keysPressed.current['ArrowLeft'] || keysPressed.current['a'] || mobileMoveRef.current === 'left') {
        playerRef.current.x = Math.max(0, playerRef.current.x - playerSpeed);
    }
    if (keysPressed.current['ArrowRight'] || keysPressed.current['d'] || mobileMoveRef.current === 'right') {
        playerRef.current.x = Math.min(canvas.width - playerRef.current.width, playerRef.current.x + playerSpeed);
    }
    if (keysPressed.current[' '] || keysPressed.current['Spacebar']) {
        shoot();
    }
    ctx.drawImage(playerImg.current, playerRef.current.x, playerRef.current.y, playerRef.current.width, playerRef.current.height);

    // Update & draw bullets
    bulletsRef.current = bulletsRef.current.filter(b => b.y > 0);
    bulletsRef.current.forEach(bullet => {
        bullet.y -= 10;
        ctx.fillStyle = '#00FFFF';
        ctx.shadowColor = '#00FFFF';
        ctx.shadowBlur = 10;
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        ctx.shadowBlur = 0;
    });

    // Update & draw enemies
    enemiesRef.current = enemiesRef.current.filter(e => e.y < canvas.height);
    enemiesRef.current.forEach(enemy => {
        enemy.y += currentDifficulty.enemySpeed;
        ctx.drawImage(enemyImg.current, enemy.x, enemy.y, enemy.width, enemy.height);
    });

    // Collision detection
    const newEnemies: Enemy[] = [];
    enemiesRef.current.forEach(enemy => {
        let enemyHit = false;
        const newBullets: Bullet[] = [];
        bulletsRef.current.forEach(bullet => {
            if (bullet.x < enemy.x + enemy.width && bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height && bullet.y + bullet.height > enemy.y) {
                enemyHit = true;
                enemy.health -= 1;
                if(settings.sfx) playHit();
                 effectsRef.current.push({ id: Date.now() + Math.random(), x: bullet.x + bullet.width / 2, y: bullet.y, radius: 0, maxRadius: 15, color: 'rgba(255, 255, 150, 0.9)', life: 8 });
            } else {
                newBullets.push(bullet);
            }
        });
        bulletsRef.current = newBullets;

        if (enemy.health <= 0) {
            setScore(s => s + 100);
            if(settings.sfx) playExplosion();
            effectsRef.current.push({ id: Date.now() + Math.random(), x: enemy.x + enemy.width / 2, y: enemy.y + enemy.height / 2, radius: 0, maxRadius: 40, color: 'rgba(255, 165, 0, 0.9)', life: 25 });
            triggerScreenShake(8);
        } else {
            newEnemies.push(enemy);
        }
    });
    enemiesRef.current = newEnemies;

    // Player collision with enemy
    enemiesRef.current.forEach(enemy => {
        if (playerRef.current.x < enemy.x + enemy.width && playerRef.current.x + playerRef.current.width > enemy.x &&
            playerRef.current.y < enemy.y + enemy.height && playerRef.current.y + playerRef.current.height > enemy.y) {
            
            if(settings.sfx) playExplosion();
            // Destroy enemy
            effectsRef.current.push({ id: Date.now() + Math.random(), x: enemy.x + enemy.width / 2, y: enemy.y + enemy.height / 2, radius: 0, maxRadius: 40, color: 'rgba(255, 165, 0, 0.9)', life: 25 });
            enemiesRef.current = enemiesRef.current.filter(e => e.id !== enemy.id);
            // Damage player
            effectsRef.current.push({ id: Date.now() + Math.random(), x: playerRef.current.x + playerRef.current.width / 2, y: playerRef.current.y + playerRef.current.height / 2, radius: 0, maxRadius: 60, color: 'rgba(255, 0, 0, 0.7)', life: 20 });
            triggerScreenShake(12);

            setLives(l => {
                const newLives = l - 1;
                if (newLives <= 0) {
                    onGameOver();
                }
                return newLives;
            });
        }
    });

    // Update and draw effects
    effectsRef.current = effectsRef.current.filter(effect => effect.life > 0);
    effectsRef.current.forEach(effect => {
        effect.life--;
        effect.radius += (effect.maxRadius - effect.radius) * 0.15; // Ease-out expansion
        const opacity = effect.life / (effect.maxRadius * 1.5);
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
        ctx.fillStyle = effect.color.replace(/[\d\.]+\)$/, `${opacity})`);
        ctx.fill();
    });

    ctx.restore();
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [isPaused, shoot, onGameOver, settings.sfx, playExplosion, playHit, currentDifficulty, screenShake]);

  // Sizing and initial setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const container = canvas.parentElement;
    if (!container) return;

    const setSizeAndPosition = (isInitial: boolean) => {
        const newWidth = container.clientWidth;
        const newHeight = container.clientHeight;
        
        canvas.width = newWidth;
        canvas.height = newHeight;

        if (isInitial) {
            playerRef.current.x = newWidth / 2 - playerRef.current.width / 2;
            playerRef.current.y = newHeight - playerRef.current.height - (isMobile ? 120 : 20);
        } else {
            // On resize, clamp position to new boundaries to prevent player from being off-screen
            playerRef.current.x = Math.max(0, Math.min(newWidth - playerRef.current.width, playerRef.current.x));
            playerRef.current.y = Math.max(0, Math.min(newHeight - playerRef.current.height, playerRef.current.y));
        }
    };

    const resizeHandler = () => setSizeAndPosition(false);

    setSizeAndPosition(true); // Initial setup
    window.addEventListener('resize', resizeHandler);

    return () => {
        window.removeEventListener('resize', resizeHandler);
    };
  }, [isMobile]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { keysPressed.current[e.key] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keysPressed.current[e.key] = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Game loop and enemy spawner
  useEffect(() => {
    const canvas = canvasRef.current;
    if (isPaused || !canvas) {
        if(gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
        return;
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop);
    
    const enemySpawner = setInterval(() => {
        if (!isPaused) {
            enemiesRef.current.push({
                id: Date.now(),
                x: Math.random() * (canvas.width - 60),
                y: -60,
                width: 50,
                height: 50,
                health: currentDifficulty.enemyHealth,
            });
        }
    }, currentDifficulty.enemySpawnRate);

    return () => {
        if(gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
        clearInterval(enemySpawner);
    };
  }, [gameLoop, isPaused, currentDifficulty.enemySpawnRate]);

  return (
    <div className={`w-full h-full relative bg-gray-900 transition-transform duration-75 ${screenShake > 0 ? 'animate-shake' : ''}`}>
      <div className="absolute top-0 left-0 right-0 p-4 z-10 flex justify-between items-center bg-black/30 backdrop-blur-sm">
        <div>
            <h2 className="text-xl font-bold text-cyan-400">SCORE: {score}</h2>
            <p className="text-sm text-gray-300 truncate max-w-sm md:max-w-md lg:max-w-lg">{assets.mission}</p>
        </div>
        <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-red-500">LIVES: {'❤️'.repeat(lives)}</h2>
            <button onClick={() => setIsPaused(!isPaused)} className="px-4 py-2 text-white bg-yellow-600 rounded-md hover:bg-yellow-500">{isPaused ? 'Resume' : 'Pause'}</button>
            <button onClick={onExit} className="px-4 py-2 text-white bg-gray-600 rounded-md hover:bg-gray-500">Exit</button>
        </div>
      </div>
      <canvas ref={canvasRef} className="w-full h-full" />
      {isMobile && <TouchControls onMove={handleMobileMove} onShoot={shoot}/>}
      {isPaused && (
        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-30 text-white">
            <h2 className="text-5xl font-bold text-yellow-400">PAUSED</h2>
            <button onClick={() => setIsPaused(false)} className="mt-6 px-8 py-3 bg-cyan-600 rounded-md text-xl hover:bg-cyan-500">Resume</button>
        </div>
      )}
    </div>
  );
};

export default GameCanvas;
