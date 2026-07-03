import { Game } from './core/Game.js';

async function main() {
  try {
    const game = new Game();
    await game.init();
    game.start();
    window.__game = game;
  } catch (error) {
    console.error('Game failed to start:', error);
    document.body.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;background:#0a0a0a;color:#D4A574;font-family:Georgia,serif;">
        <h1>Failed to Load</h1>
        <p style="color:#8B7355;margin:10px 0;">${error.message}</p>
        <button onclick="location.reload()" style="padding:10px 30px;background:#D4A574;border:none;border-radius:4px;color:#0a0a0a;font-size:16px;cursor:pointer;margin-top:20px;">
          Reload
        </button>
      </div>
    `;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}
