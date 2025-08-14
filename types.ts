
export enum GameState {
  SPLASH = 'SPLASH',
  MENU = 'MENU',
  ASSET_GENERATION = 'ASSET_GENERATION',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
}

export interface Settings {
  music: boolean;
  sfx: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface SoundAsset {
  url: string;
  source: string;
}

export interface GeneratedAssets {
  player: string; // base64 string
  enemy: string; // base64 string
  mission: string;
  sfx: {
    laser: SoundAsset;
    hit: SoundAsset;
    explosion: SoundAsset;
  };
}

export interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Player extends GameObject {
  id: string;
}

export interface Enemy extends GameObject {
  id: number;
  health: number;
}

export interface Bullet extends GameObject {
  id: number;
}

export interface Effect {
  id: number;
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  life: number; // frames to live
}