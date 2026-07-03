let qualityTier = 'medium';

export function detectDeviceCapability() {
  const score = { cpu: 0, ram: 0, gpu: 0, total: 0 };

  const cores = navigator.hardwareConcurrency || 4;
  if (cores <= 2) score.cpu = 1;
  else if (cores <= 4) score.cpu = 2;
  else if (cores <= 8) score.cpu = 3;
  else score.cpu = 4;

  if ('deviceMemory' in navigator) {
    const mem = navigator.deviceMemory || 4;
    if (mem <= 1) score.ram = 1;
    else if (mem <= 2) score.ram = 2;
    else if (mem <= 4) score.ram = 3;
    else score.ram = 4;
  } else {
    score.ram = 2;
  }

  if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    score.gpu = 2;
    const n = navigator.userAgent;
    if (/Pixel [6-9]|Galaxy S2[1-9]|iPhone 1[4-9]|iPad Pro/i.test(n)) {
      score.gpu = 4;
    } else if (/Pixel [4-5]|Galaxy S2[0]|iPhone 1[2-3]/i.test(n)) {
      score.gpu = 3;
    }
  } else {
    score.gpu = 3;
  }

  score.total = Math.floor((score.cpu + score.ram + score.gpu) / 3);

  const tiers = ['potato', 'low', 'medium', 'high', 'ultra'];
  qualityTier = tiers[Math.min(score.total, tiers.length - 1)];

  return { score, tier: qualityTier };
}

export function getQualityTier() {
  return qualityTier;
}

export function setQualityTier(tier) {
  const tiers = ['potato', 'low', 'medium', 'high', 'ultra'];
  if (tiers.includes(tier)) {
    qualityTier = tier;
  }
}

export function getQualitySettings(tier) {
  tier = tier || qualityTier;
  const settings = {
    potato: { shadows: false, shadowSize: 0, drawDistance: 30, particles: 0, bloom: false, textureSize: 128, msaa: 0, foliage: 0, water: 'flat', lod: 2, screenShake: false },
    low: { shadows: false, shadowSize: 0, drawDistance: 50, particles: 0, bloom: false, textureSize: 256, msaa: 0, foliage: 0.3, water: 'flat', lod: 1, screenShake: false },
    medium: { shadows: true, shadowSize: 512, drawDistance: 100, particles: 30, bloom: false, textureSize: 512, msaa: 0, foliage: 0.6, water: 'simple', lod: 0, screenShake: true },
    high: { shadows: true, shadowSize: 1024, drawDistance: 150, particles: 100, bloom: true, textureSize: 1024, msaa: 2, foliage: 0.8, water: 'envmap', lod: 0, screenShake: true },
    ultra: { shadows: true, shadowSize: 2048, drawDistance: 250, particles: 300, bloom: true, textureSize: 2048, msaa: 4, foliage: 1, water: 'mirror', lod: 0, screenShake: true },
  };
  return settings[tier] || settings.medium;
}

export function runGraphicsBenchmark(renderer, scene, camera) {
  return new Promise((resolve) => {
    let frameCount = 0;
    let totalTime = 0;
    const duration = 2000;
    const start = performance.now();

    function frame() {
      const now = performance.now();
      const elapsed = now - start;
      if (elapsed >= duration) {
        const fps = frameCount / (elapsed / 1000);
        if (fps < 20) resolve('potato');
        else if (fps < 30) resolve('low');
        else if (fps < 45) resolve('medium');
        else if (fps < 55) resolve('high');
        else resolve('ultra');
        return;
      }
      renderer.render(scene, camera);
      frameCount++;
      requestAnimationFrame(frame);
    }
    frame();
  });
}

export function isMobile() {
  return /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 1024;
}

export function isLandscape() {
  return window.innerWidth > window.innerHeight;
}
