const VIEW_KEY = "sunflower.session.view";

const gateView = document.getElementById("view-gate");
const proposalView = document.getElementById("view-proposal");
const homeView = document.getElementById("view-home");
const memoryView = document.getElementById("view-memory-1");
const memoryView2 = document.getElementById("view-memory-2");
const memoryView3 = document.getElementById("view-memory-3");
const memoryView4 = document.getElementById("view-memory-4");
const gateBtn = document.getElementById("gateBtn");
const song = document.getElementById("song");
const nightSong = document.getElementById("memory3song");
let musicStarted = false;
const muteBtn = document.getElementById("muteBtn");
const proposal = document.getElementById("proposal");
const proposalHint = document.getElementById("proposalHint");
const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const foreverBtn = document.getElementById("foreverBtn");
const foreverNo = document.getElementById("foreverNo");
const enterMemories = document.getElementById("enterMemories");
const openMemory1 = document.getElementById("openMemory1");
const openMemory2 = document.getElementById("openMemory2");
const openMemory3 = document.getElementById("openMemory3");
const openMemory4 = document.getElementById("openMemory4");
const backHome = document.getElementById("backHome");
const backHome2 = document.getElementById("backHome2");
const backHome3 = document.getElementById("backHome3");
const backHome4 = document.getElementById("backHome4");
const endBack = document.getElementById("endBack");
const endBack2 = document.getElementById("endBack2");
const endBack3 = document.getElementById("endBack3");
const endBack4 = document.getElementById("endBack4");
const progress = document.getElementById("progress");
const progress2 = document.getElementById("progress2");
const progress3 = document.getElementById("progress3");
const progress4 = document.getElementById("progress4");
const rainCanvas = document.getElementById("rain");
const rainVeil = document.getElementById("rainVeil");
const rainChapter = document.getElementById("rainChapter");

const params = new URLSearchParams(location.search);
const preview = params.get("preview");
localStorage.removeItem("sunflower.proposal.seen");

let slide = 0;
let celebrating = false;
let rainAnim = 0;

function storyViews() {
  return [memoryView, memoryView2, memoryView3, memoryView4];
}

function activeStory() {
  return storyViews().find((view) => view.classList.contains("active")) || null;
}

function show(view) {
  [gateView, proposalView, homeView, memoryView, memoryView2, memoryView3, memoryView4].forEach((el) => {
    el.classList.remove("active");
  });
  view.classList.add("active");
  document.body.classList.toggle("is-locked", view === gateView || view === proposalView);
  window.scrollTo(0, 0);
  if (view === homeView) sessionStorage.setItem(VIEW_KEY, "home");
  if (view === memoryView) sessionStorage.setItem(VIEW_KEY, "memory");
  if (view === memoryView2) {
    sessionStorage.setItem(VIEW_KEY, "memory2");
    if (typeof resetRoseTheater === "function") {
      resetRoseTheater();
      resetOutfitGate();
    }
  }
  if (view === memoryView3) {
    sessionStorage.setItem(VIEW_KEY, "memory3");
    if (typeof resetReelStage === "function") resetReelStage();
  } else if (view === memoryView4) {
    sessionStorage.setItem(VIEW_KEY, "memory4");
  }
  if (view !== memoryView3 && typeof resetReelStage === "function") {
    resetReelStage();
  }
  if (view !== memoryView && typeof setRainLive === "function") setRainLive(false);
  if (view === memoryView3 && nightSong) nightSong.currentTime = 0;
  if (typeof syncScore === "function") syncScore();
}

function bedVolume() {
  return rainVisible ? 0.28 : 0.38;
}

function syncScore() {
  if (!musicStarted || !nightSong) return;
  if (memoryView3.classList.contains("active")) {
    song.pause();
    nightSong.muted = song.muted;
    nightSong.volume = reelStage && reelStage.classList.contains("is-open") ? 0.08 : 0.42;
    nightSong.play().catch(() => {});
    return;
  }
  nightSong.pause();
  song.volume = bedVolume();
  song.play().catch(() => {});
}

async function startMusic() {
  musicStarted = true;
  song.volume = bedVolume();
  try {
    if (memoryView3.classList.contains("active")) {
      nightSong.muted = song.muted;
      nightSong.volume = 0.42;
      await nightSong.play();
    } else {
      await song.play();
    }
  } catch (_) {
    /* gesture already happened; ignore autoplay quirks */
  }
  muteBtn.hidden = false;
  ensureRainAudio();
}

gateBtn.addEventListener("click", async () => {
  await startMusic();
  show(proposalView);
});

muteBtn.addEventListener("click", () => {
  song.muted = !song.muted;
  if (nightSong) nightSong.muted = song.muted;
  muteBtn.classList.toggle("is-muted", song.muted);
  muteBtn.textContent = song.muted ? "♫" : "♪";
  if (rainAudio) {
    const now = rainAudio.actx.currentTime;
    rainAudio.master.gain.cancelScheduledValues(now);
    rainAudio.master.gain.setValueAtTime(song.muted || !rainVisible ? 0 : 0.22, now);
  }
});

function slides() {
  return [...proposal.querySelectorAll(".slide")];
}

function renderSlide() {
  slides().forEach((el, i) => el.classList.toggle("is-on", i === slide));
  const lastAsk = slide >= 7;
  proposalHint.hidden = lastAsk;
}

function nextSlide() {
  if (celebrating) return;
  if (slide >= 7) return;
  slide = Math.min(slide + 1, slides().length - 1);
  renderSlide();
}

proposalView.addEventListener("click", (event) => {
  if (event.target.closest("button")) return;
  nextSlide();
});

proposalView.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") nextSlide();
});

noBtn.addEventListener("mouseenter", dodgeNo);
noBtn.addEventListener("touchstart", (event) => {
  event.preventDefault();
  dodgeNo.call(noBtn);
});
foreverNo.addEventListener("mouseenter", () => dodgeNo.call(foreverNo));
foreverNo.addEventListener("touchstart", (event) => {
  event.preventDefault();
  dodgeNo.call(foreverNo);
});

function dodgeNo() {
  const btn = this && this.classList && this.classList.contains("no-btn") ? this : noBtn;
  const box = btn.parentElement.getBoundingClientRect();
  const rect = btn.getBoundingClientRect();
  const x = 12 + Math.random() * Math.max(24, box.width - rect.width - 24);
  const y = 12 + Math.random() * Math.max(24, box.height - rect.height - 24);
  btn.style.left = `${x}px`;
  btn.style.top = `${y}px`;
  btn.style.right = "auto";
  btn.style.transform = "none";
}

yesBtn.addEventListener("click", () => {
  slide = 8;
  renderSlide();
});

foreverBtn.addEventListener("click", () => {
  celebrating = true;
  slide = 9;
  renderSlide();
  burstHearts();
});

enterMemories.addEventListener("click", () => show(homeView));
openMemory1.addEventListener("click", () => show(memoryView));
openMemory2.addEventListener("click", () => {
  resetRoseTheater();
  resetOutfitGate();
  show(memoryView2);
});
openMemory3.addEventListener("click", () => show(memoryView3));
openMemory4.addEventListener("click", () => show(memoryView4));
backHome.addEventListener("click", () => show(homeView));
backHome2.addEventListener("click", () => show(homeView));
backHome3.addEventListener("click", () => show(homeView));
backHome4.addEventListener("click", () => show(homeView));
endBack.addEventListener("click", () => show(homeView));
endBack2.addEventListener("click", () => show(homeView));
endBack3.addEventListener("click", () => show(homeView));
endBack4.addEventListener("click", () => show(homeView));

const roseTheater = document.getElementById("roseTheater");
const roseHint = document.getElementById("roseHint");
const outfitGate = document.getElementById("outfitGate");
let roseBeat = 0;

function roseBeats() {
  return [...roseTheater.querySelectorAll(".rose-beat")];
}

function renderRoseTheater() {
  const beats = roseBeats();
  beats.forEach((el, i) => el.classList.toggle("is-on", i === roseBeat));
  const last = roseBeat >= beats.length - 1;
  roseTheater.classList.toggle("is-blooming", last);
  if (roseHint) roseHint.hidden = last;
  const video = roseTheater.querySelector("video");
  if (!video) return;
  if (last) {
    if (!video.src && video.dataset.src) video.src = video.dataset.src;
    video.muted = false;
    video.play().catch(() => {});
    if (!song.muted) song.volume = 0.08;
  } else {
    video.pause();
    if (!song.muted) song.volume = 0.38;
  }
}

function resetRoseTheater() {
  roseBeat = 0;
  renderRoseTheater();
}

function resetOutfitGate() {
  outfitGate.classList.remove("is-open");
  const video = outfitGate.querySelector("video");
  if (video) video.pause();
}

roseTheater.addEventListener("click", (event) => {
  if (event.target.closest("button")) return;
  const beats = roseBeats();
  if (roseBeat >= beats.length - 1) return;
  roseBeat += 1;
  renderRoseTheater();
});

outfitGate.addEventListener("click", () => {
  if (outfitGate.classList.contains("is-open")) return;
  outfitGate.classList.add("is-open");
  const video = outfitGate.querySelector("video");
  if (!video.src && video.dataset.src) video.src = video.dataset.src;
  video.play().catch(() => {});
});

const reelStage = document.getElementById("reelStage");

function resetReelStage() {
  if (!reelStage) return;
  reelStage.classList.remove("is-open");
  const video = reelStage.querySelector("video");
  if (!video) return;
  video.pause();
  video.muted = true;
  if (nightSong && !song.muted) nightSong.volume = 0.42;
  if (song && !song.muted) song.volume = rainVisible ? 0.28 : 0.38;
}

function openReel() {
  if (!reelStage || reelStage.classList.contains("is-open")) return;
  reelStage.classList.add("is-open");
  const video = reelStage.querySelector("video");
  if (!video) return;
  if (!video.src && video.dataset.src) video.src = video.dataset.src;
  video.muted = false;
  video.play().catch(() => {});
  if (nightSong && !song.muted) nightSong.volume = 0.08;
}

reelStage.addEventListener("click", (event) => {
  if (event.target.closest("video")) return;
  openReel();
});

const futureMemories = document.getElementById("futureMemories");
const memorySentinel = document.getElementById("memorySentinel");
let nextMemory = 5;
let lastHomeY = 0;
let homeGoingUp = false;
let snappingHome = false;

function addLockedCards(count = 10) {
  const frag = document.createDocumentFragment();
  for (let i = 0; i < count; i += 1) {
    const n = String(nextMemory).padStart(2, "0");
    const card = document.createElement("div");
    card.className = "memory-card locked";
    card.setAttribute("aria-hidden", "true");
    card.innerHTML = `
      <div class="empty-frame"></div>
      <div class="card-meta">
        <span>Memory ${n}</span>
        <h2>Waiting to be written</h2>
        <p>soon</p>
      </div>
    `;
    frag.appendChild(card);
    nextMemory += 1;
  }
  futureMemories.appendChild(frag);
}

function trimFutureMemories(keep = 12) {
  const cards = [...futureMemories.children];
  cards.slice(keep).forEach((card) => card.remove());
  nextMemory = 5 + Math.min(cards.length, keep);
}

addLockedCards(12);
new IntersectionObserver(
  (entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    if (!homeView.classList.contains("active")) return;
    if (homeGoingUp || snappingHome) return;
    addLockedCards(8);
  },
  { rootMargin: "400px" }
).observe(memorySentinel);

window.addEventListener(
  "scroll",
  () => {
    const y = window.scrollY;
    if (!homeView.classList.contains("active")) {
      lastHomeY = y;
      return;
    }
    homeGoingUp = y < lastHomeY - 2;
    lastHomeY = y;
    if (snappingHome || !homeGoingUp) return;
    if (openMemory4.getBoundingClientRect().bottom > 48) return;
    snappingHome = true;
    trimFutureMemories(12);
    openMemory1.scrollIntoView({ block: "start" });
    requestAnimationFrame(() => {
      lastHomeY = window.scrollY;
      snappingHome = false;
    });
  },
  { passive: true }
);

function burstHearts() {
  for (let i = 0; i < 24; i += 1) {
    const heart = document.createElement("span");
    heart.textContent = i % 3 === 0 ? "❀" : "♥";
    heart.style.cssText = `
      position: fixed;
      left: ${20 + Math.random() * 60}vw;
      top: 110vh;
      z-index: 80;
      color: ${i % 2 ? "#d4af7a" : "#c97b84"};
      font-size: ${16 + Math.random() * 22}px;
      pointer-events: none;
      transition: transform 2.6s ease-out, opacity 2.6s ease-out;
    `;
    document.body.appendChild(heart);
    requestAnimationFrame(() => {
      heart.style.transform = `translateY(-120vh) rotate(${Math.random() * 80 - 40}deg)`;
      heart.style.opacity = "0";
    });
    setTimeout(() => heart.remove(), 2800);
  }
}

const videoObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const video = entry.target;
      if (entry.isIntersecting) {
        if (video.closest("#roseTheater") && !roseTheater.classList.contains("is-blooming")) return;
        if (video.closest("#outfitGate") && !outfitGate.classList.contains("is-open")) return;
        if (video.closest("#reelStage") && !reelStage.classList.contains("is-open")) return;
        if (!video.src && video.dataset.src) video.src = video.dataset.src;
        const withSound = video.dataset.sound === "on";
        video.muted = !withSound;
        video.play().catch(() => {});
        if (withSound && !song.muted) {
          if (video.closest("#reelStage") && nightSong) nightSong.volume = 0.08;
          else song.volume = 0.08;
        }
      } else {
        video.pause();
        if (video.dataset.sound === "on" && !song.muted) {
          if (video.closest("#reelStage") && nightSong) nightSong.volume = 0.42;
          else song.volume = 0.38;
        }
      }
    });
  },
  { rootMargin: "200px 0px", threshold: 0.2 }
);

document.querySelectorAll("#view-memory-1 video, #view-memory-2 video, #view-memory-3 video").forEach((video) => {
  videoObserver.observe(video);
});

window.addEventListener(
  "scroll",
  () => {
    const story = activeStory();
    const bar =
      story === memoryView4 ? progress4 : story === memoryView3 ? progress3 : story === memoryView2 ? progress2 : progress;
    progress.style.width = "0";
    progress2.style.width = "0";
    progress3.style.width = "0";
    progress4.style.width = "0";
    if (!story) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
  },
  { passive: true }
);

const rainCtx = rainCanvas.getContext("2d");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let rainVisible = false;
let rainAudio = null;
let streaks = [];
let beads = [];
let splashes = [];
let lastRainTs = 0;

function ensureRainAudio() {
  if (rainAudio || reduceMotion) return rainAudio;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  const actx = new AC();
  const makeNoise = (seconds) => {
    const buffer = actx.createBuffer(1, Math.floor(actx.sampleRate * seconds), actx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
    const src = actx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    return src;
  };
  const rumble = makeNoise(2);
  const hiss = makeNoise(1.4);
  const low = actx.createBiquadFilter();
  low.type = "lowpass";
  low.frequency.value = 620;
  const band = actx.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = 2100;
  band.Q.value = 0.45;
  const master = actx.createGain();
  master.gain.value = 0;
  const gLow = actx.createGain();
  const gHigh = actx.createGain();
  gLow.gain.value = 0.85;
  gHigh.gain.value = 0.4;
  rumble.connect(low).connect(gLow).connect(master);
  hiss.connect(band).connect(gHigh).connect(master);
  master.connect(actx.destination);
  rumble.start();
  hiss.start();
  rainAudio = { actx, master };
  return rainAudio;
}

function setRainSound(on) {
  const audio = ensureRainAudio();
  if (!audio) return;
  if (audio.actx.state === "suspended") audio.actx.resume();
  const now = audio.actx.currentTime;
  audio.master.gain.cancelScheduledValues(now);
  audio.master.gain.setValueAtTime(audio.master.gain.value, now);
  audio.master.gain.linearRampToValueAtTime(on && !song.muted ? 0.22 : 0, now + 0.9);
}

function spawnStreak(width, height, layer, y) {
  const near = layer === 2;
  const mid = layer === 1;
  return {
    layer,
    x: Math.random() * (width + 80) - 40,
    y: y == null ? Math.random() * height : y,
    len: near ? 90 + Math.random() * 110 : mid ? 36 + Math.random() * 44 : 14 + Math.random() * 20,
    speed: near ? 1180 + Math.random() * 520 : mid ? 780 + Math.random() * 320 : 460 + Math.random() * 220,
    thick: near ? 2.1 + Math.random() * 1.4 : mid ? 1.1 : 0.65,
    wind: near ? 220 + Math.random() * 80 : 140 + Math.random() * 70,
    alpha: near ? 0.72 + Math.random() * 0.28 : mid ? 0.32 + Math.random() * 0.28 : 0.12 + Math.random() * 0.14,
  };
}

function spawnBead(width, height, y) {
  return {
    x: Math.random() * width,
    y: y == null ? Math.random() * height : y,
    r: 2.2 + Math.random() * 4.8,
    vy: 28 + Math.random() * 70,
    wobble: Math.random() * Math.PI * 2,
  };
}

function seedRain() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  streaks = [
    ...Array.from({ length: 260 }, () => spawnStreak(width, height, 0)),
    ...Array.from({ length: 170 }, () => spawnStreak(width, height, 1)),
    ...Array.from({ length: 42 }, () => spawnStreak(width, height, 2)),
  ];
  beads = Array.from({ length: 48 }, () => spawnBead(width, height));
  splashes = [];
}

function sizeRain() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = window.innerWidth;
  const height = window.innerHeight;
  rainCanvas.width = Math.max(1, Math.floor(width * dpr));
  rainCanvas.height = Math.max(1, Math.floor(height * dpr));
  rainCanvas.style.width = `${width}px`;
  rainCanvas.style.height = `${height}px`;
  rainCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  seedRain();
}

function drawRain(ts) {
  rainAnim = requestAnimationFrame(drawRain);
  const active = memoryView.classList.contains("active") && rainVisible && !reduceMotion;
  if (!active) {
    lastRainTs = ts;
    return;
  }
  const width = window.innerWidth;
  const height = window.innerHeight;
  const dt = Math.min(0.05, ((ts - lastRainTs) || 16) / 1000);
  lastRainTs = ts;
  const gust = 0.85 + Math.sin(ts / 700) * 0.18;

  rainCtx.clearRect(0, 0, width, height);
  rainCtx.lineCap = "round";

  streaks.forEach((drop) => {
    const dx = drop.wind * gust * (drop.len / drop.speed);
    const dy = drop.len;
    const x2 = drop.x + dx;
    const y2 = drop.y + dy;
    const grad = rainCtx.createLinearGradient(drop.x, drop.y, x2, y2);
    grad.addColorStop(0, "rgba(210, 230, 255, 0)");
    grad.addColorStop(0.55, `rgba(200, 225, 255, ${drop.alpha * 0.25})`);
    grad.addColorStop(1, `rgba(255, 255, 255, ${drop.alpha})`);
    rainCtx.strokeStyle = grad;
    rainCtx.lineWidth = drop.thick;
    rainCtx.beginPath();
    rainCtx.moveTo(drop.x, drop.y);
    rainCtx.lineTo(x2, y2);
    rainCtx.stroke();
    drop.x += drop.wind * gust * dt;
    drop.y += drop.speed * dt;
    if (drop.y > height + 20) {
      if (drop.layer > 0 && splashes.length < 70) {
        splashes.push({
          x: drop.x,
          y: height - 8 - Math.random() * 18,
          life: 1,
          r: 2 + Math.random() * 5,
        });
      }
      Object.assign(drop, spawnStreak(width, height, drop.layer, -drop.len));
    }
  });

  beads.forEach((bead) => {
    bead.wobble += dt * 2;
    bead.x += Math.sin(bead.wobble) * 8 * dt;
    bead.y += bead.vy * dt;
    rainCtx.beginPath();
    rainCtx.fillStyle = "rgba(230, 244, 255, 0.55)";
    rainCtx.ellipse(bead.x, bead.y, bead.r * 0.72, bead.r, 0, 0, Math.PI * 2);
    rainCtx.fill();
    rainCtx.beginPath();
    rainCtx.fillStyle = "rgba(255, 255, 255, 0.9)";
    rainCtx.ellipse(bead.x - bead.r * 0.22, bead.y - bead.r * 0.28, bead.r * 0.22, bead.r * 0.28, 0, 0, Math.PI * 2);
    rainCtx.fill();
    if (bead.y > height + 10) Object.assign(bead, spawnBead(width, height, -12));
  });

  for (let i = splashes.length - 1; i >= 0; i -= 1) {
    const splash = splashes[i];
    rainCtx.strokeStyle = `rgba(220, 236, 255, ${splash.life * 0.55})`;
    rainCtx.lineWidth = 1.1;
    rainCtx.beginPath();
    rainCtx.ellipse(
      splash.x,
      splash.y,
      splash.r * (2.2 - splash.life),
      splash.r * 0.28 * (2.2 - splash.life),
      0,
      0,
      Math.PI * 2
    );
    rainCtx.stroke();
    splash.life -= dt * 2.4;
    splash.r += 28 * dt;
    if (splash.life <= 0) splashes.splice(i, 1);
  }
}

function setRainLive(on) {
  rainVisible = on;
  rainCanvas.classList.toggle("is-live", on && !reduceMotion);
  rainVeil.classList.toggle("is-live", on);
  setRainSound(on);
  if (!song.muted) song.volume = on ? 0.28 : 0.38;
}

const rainWatch = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const on = entry.isIntersecting && memoryView.classList.contains("active");
      setRainLive(on);
    });
  },
  { threshold: 0.18 }
);

rainWatch.observe(rainChapter);
window.addEventListener("resize", sizeRain);
sizeRain();
drawRain(performance.now());
renderSlide();

if (preview === "proposal") {
  const wanted = Number(params.get("slide") || 0);
  slide = Number.isFinite(wanted) ? wanted : 0;
  renderSlide();
  show(proposalView);
} else if (preview === "home") {
  show(homeView);
} else if (preview === "memory") {
  show(memoryView);
} else if (preview === "memory2") {
  show(memoryView2);
} else if (preview === "memory3") {
  show(memoryView3);
} else if (preview === "memory4") {
  show(memoryView4);
} else {
  const lastView = sessionStorage.getItem(VIEW_KEY);
  if (lastView === "memory") {
    show(memoryView);
    resumeMusicOnTap();
  } else if (lastView === "memory2") {
    show(memoryView2);
    resumeMusicOnTap();
  } else if (lastView === "memory3") {
    show(memoryView3);
    resumeMusicOnTap();
  } else if (lastView === "memory4") {
    show(memoryView4);
    resumeMusicOnTap();
  } else if (lastView === "home") {
    show(homeView);
    resumeMusicOnTap();
  }
}

function resumeMusicOnTap() {
  const unlock = async () => {
    await startMusic();
    document.removeEventListener("click", unlock);
  };
  document.addEventListener("click", unlock, { once: true });
}
