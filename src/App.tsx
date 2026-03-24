/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipForward, SkipBack, Zap } from 'lucide-react';
import { motion } from 'motion/react';

const TRACKS = [
  { id: 1, title: 'Neon Pulse', artist: 'SynthWave AI', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 2, title: 'Cyber Snake', artist: 'Glitch Beats', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: 3, title: 'Midnight Grid', artist: 'Retro AI', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
];

const GRID_SIZE = 20;

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [direction, setDirection] = useState({ x: 0, y: -1 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [running, setRunning] = useState(false);
  
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const gameLoop = useRef<number>();
  const lastTime = useRef<number>(0);

  const draw = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const cellSize = width / GRID_SIZE;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#0ff'; // Cyan
    snake.forEach(cell => ctx.fillRect(cell.x * cellSize, cell.y * cellSize, cellSize - 1, cellSize - 1));

    ctx.fillStyle = '#f0f'; // Magenta
    ctx.fillRect(food.x * cellSize, food.y * cellSize, cellSize - 1, cellSize - 1);
  }, [snake, food]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = (time: number) => {
      if (time - lastTime.current > 150 && running) {
        setSnake(prev => {
          const newSnake = [...prev];
          const head = { ...newSnake[0] };
          head.x += direction.x;
          head.y += direction.y;

          if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE || newSnake.some(cell => cell.x === head.x && cell.y === head.y)) {
            setGameOver(true);
            setRunning(false);
            return prev;
          }

          newSnake.unshift(head);
          if (head.x === food.x && head.y === food.y) {
            setScore(s => s + 10);
            setFood({ x: Math.floor(Math.random() * GRID_SIZE), y: Math.floor(Math.random() * GRID_SIZE) });
          } else {
            newSnake.pop();
          }
          return newSnake;
        });
        lastTime.current = time;
      }
      draw(ctx, canvas.width, canvas.height);
      gameLoop.current = requestAnimationFrame(animate);
    };
    gameLoop.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(gameLoop.current!);
  }, [running, direction, food, draw]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': setDirection({ x: 0, y: -1 }); break;
        case 'ArrowDown': setDirection({ x: 0, y: 1 }); break;
        case 'ArrowLeft': setDirection({ x: -1, y: 0 }); break;
        case 'ArrowRight': setDirection({ x: 1, y: 0 }); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="min-h-screen bg-black text-cyan-400 p-4 font-sans flex flex-col items-center">
      <header className="w-full max-w-4xl flex justify-between items-center mb-8 border-b-4 border-magenta-500 pb-4">
        <h1 className="text-3xl font-bold tracking-tighter flex items-center gap-2 glitch">
          <Zap className="text-yellow-400" /> NEON SNAKE BEATS
        </h1>
        <div className="text-xl text-magenta-400">SCORE: {score}</div>
      </header>

      <main className="flex-grow flex flex-col md:flex-row gap-8 w-full max-w-4xl">
        <div className="flex-grow border-4 border-cyan-500 bg-black p-2 relative shadow-[0_0_20px_rgba(6,182,212,0.5)]">
          <canvas ref={canvasRef} width={400} height={400} className="w-full aspect-square" />
          {gameOver && <div className="absolute inset-0 bg-black/80 flex items-center justify-center text-4xl font-bold text-magenta-500 glitch">GAME OVER</div>}
          {!running && !gameOver && <button onClick={() => setRunning(true)} className="absolute inset-0 bg-black/50 flex items-center justify-center text-2xl text-cyan-400 hover:text-magenta-400">START GAME</button>}
        </div>

        <aside className="w-full md:w-64 border-4 border-magenta-500 bg-black p-4 shadow-[0_0_20px_rgba(236,72,153,0.5)]">
          <h2 className="text-xl mb-4 text-magenta-400">PLAYER</h2>
          <div className="mb-4 font-mono">
            <div className="text-lg">{TRACKS[currentTrackIndex].title}</div>
            <div className="text-sm text-cyan-700">{TRACKS[currentTrackIndex].artist}</div>
          </div>
          <div className="flex justify-center gap-4 text-cyan-400">
            <button onClick={() => setCurrentTrackIndex(i => (i - 1 + TRACKS.length) % TRACKS.length)}><SkipBack /></button>
            <button onClick={togglePlay}>{isPlaying ? <Pause /> : <Play />}</button>
            <button onClick={() => setCurrentTrackIndex(i => (i + 1) % TRACKS.length)}><SkipForward /></button>
          </div>
          <audio ref={audioRef} src={TRACKS[currentTrackIndex].url} onEnded={() => setCurrentTrackIndex(i => (i + 1) % TRACKS.length)} />
        </aside>
      </main>
    </div>
  );
}
