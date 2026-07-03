import { Game } from './core/Game.js';

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}

async function main() {
  try {
    const game = new Game();
    await game.init();
    game.start();
    window.__game = game;
  } catch (error) {
    console.error('Game failed to start:', error);
    const msg = error.message || String(error);
    const stack = error.stack ? error.stack.split('\n').slice(0, 4).join('\n') : '';
    document.body.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;background:#0a0a0a;color:#D4A574;font-family:Georgia,serif;padding:20px;text-align:center;">
        <h1>Failed to Load</h1>
        <p style="color:#8B7355;margin:10px 0;max-width:600px;word-break:break-all;">${msg}</p>
        ${stack ? `<pre style="color:#6A5A3A;font-size:10px;max-width:600px;overflow:hidden;text-overflow:ellipsis;">${stack}</pre>` : ''}
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
