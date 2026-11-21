const promo = document.querySelector("#promo");
const PROMO_KEY = "shrija-promo";

function finishPromo() {
  if (!promo || !promo.isConnected || promo.classList.contains("is-out")) return;
  promo.classList.add("is-out");
  document.documentElement.classList.remove("promo-on");
  try {
    sessionStorage.setItem(PROMO_KEY, "1");
  } catch (error) {}
  window.setTimeout(() => promo.remove(), 420);
}

if (promo && !document.documentElement.classList.contains("promo-off")) {
  document.documentElement.classList.add("promo-on");
  promo.addEventListener("click", finishPromo);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") finishPromo();
  });
  window.setTimeout(finishPromo, 2500);
}

const menuBtn = document.querySelector(".menu-btn");
const nav = document.querySelector("#site-nav");

menuBtn.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
  menuBtn.querySelector(".menu-label").textContent = open ? "Close" : "Menu";
});

nav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("is-open");
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.querySelector(".menu-label").textContent = "Menu";
  });
});

const form = document.querySelector("#note-form");
const errorEl = document.querySelector("#form-error");
const statusEl = document.querySelector("#form-status");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  errorEl.hidden = true;
  statusEl.textContent = "";

  const name = form.name.value.trim();
  const phone = form.phone.value.trim();
  const need = form.need.value.trim();

  if (!name || !need) {
    errorEl.hidden = false;
    errorEl.textContent = "Add your name and what you need, then send.";
    return;
  }

  const lines = ["Hello Shrija Web Solution,", `My name is ${name}.`];
  if (phone) lines.push(`My phone is ${phone}.`);
  lines.push("", need);

  const url = `https://wa.me/918080132061?text=${encodeURIComponent(lines.join("\n"))}`;
  const opened = window.open(url, "_blank", "noopener,noreferrer");
  if (opened) opened.opener = null;

  statusEl.textContent = opened
    ? "WhatsApp should be open in a new tab with your message."
    : "If WhatsApp did not open, use the call link or the WhatsApp link beside the form.";
});

const publishedReviews = [];

const reviewForm = document.querySelector("#review-form");
const reviewError = document.querySelector("#review-error");
const reviewStatus = document.querySelector("#review-status");
const reviewList = document.querySelector("#review-list");
const localList = document.querySelector("#local-review-list");
const localTitle = document.querySelector("#local-review-title");
const scoreEl = document.querySelector("#rating-score");
const scoreStarsEl = document.querySelector("#rating-stars");
const scoreCountEl = document.querySelector("#rating-count");
const starButtons = [...document.querySelectorAll(".star-row .star")];
const REVIEW_KEY = "shrija-reviews";
let selectedStars = 0;

function starGlyphs(count) {
  return "★★★★★".slice(0, count) + "☆☆☆☆☆".slice(0, 5 - count);
}

function paintStars(count) {
  starButtons.forEach((button) => {
    const value = Number(button.dataset.value);
    button.classList.toggle("is-on", value <= count);
    button.setAttribute("aria-checked", value === count ? "true" : "false");
  });
}

function readLocalReviews() {
  try {
    const saved = JSON.parse(localStorage.getItem(REVIEW_KEY) || "[]");
    if (!Array.isArray(saved)) return [];
    return saved.filter((item) => item && item.name && item.text && item.stars >= 1 && item.stars <= 5);
  } catch {
    return [];
  }
}

function writeLocalReviews(items) {
  localStorage.setItem(REVIEW_KEY, JSON.stringify(items.slice(0, 20)));
}

function addCard(list, review) {
  const card = document.createElement("article");
  card.className = "review-card";
  const top = document.createElement("div");
  top.className = "review-top";
  const name = document.createElement("strong");
  name.textContent = review.name;
  const stars = document.createElement("span");
  stars.className = "mini-stars";
  stars.setAttribute("aria-label", `${review.stars} out of 5 stars`);
  stars.textContent = starGlyphs(review.stars);
  const body = document.createElement("p");
  body.textContent = review.text;
  top.append(name, stars);
  card.append(top, body);
  list.append(card);
}

function renderReviews() {
  const localReviews = readLocalReviews();
  reviewList.replaceChildren();
  localList.replaceChildren();

  if (publishedReviews.length === 0) {
    const empty = document.createElement("p");
    empty.className = "review-empty";
    empty.textContent = "Published reviews show up here after we add them.";
    reviewList.append(empty);
  } else {
    publishedReviews.forEach((review) => addCard(reviewList, review));
  }

  localTitle.hidden = localReviews.length === 0;
  localReviews.forEach((review) => addCard(localList, review));

  if (publishedReviews.length === 0) {
    scoreEl.textContent = "New";
    scoreEl.classList.add("is-empty");
    scoreStarsEl.textContent = "☆☆☆☆☆";
    scoreCountEl.textContent = "No published reviews yet";
    return;
  }

  scoreEl.classList.remove("is-empty");

  const total = publishedReviews.reduce((sum, review) => sum + review.stars, 0);
  const average = total / publishedReviews.length;
  scoreEl.textContent = average.toFixed(1);
  scoreStarsEl.textContent = starGlyphs(Math.round(average));
  scoreCountEl.textContent = publishedReviews.length === 1
    ? "1 published review"
    : `${publishedReviews.length} published reviews`;
}

starButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedStars = Number(button.dataset.value);
    paintStars(selectedStars);
    reviewError.hidden = true;
  });
});

document.querySelector(".star-row").addEventListener("keydown", (event) => {
  const current = selectedStars || 1;
  if (event.key === "ArrowRight" || event.key === "ArrowUp") {
    event.preventDefault();
    selectedStars = Math.min(5, current + (selectedStars ? 1 : 0));
    paintStars(selectedStars);
    starButtons[selectedStars - 1].focus();
  }
  if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
    event.preventDefault();
    selectedStars = Math.max(1, current - 1);
    paintStars(selectedStars);
    starButtons[selectedStars - 1].focus();
  }
});

reviewForm.addEventListener("submit", (event) => {
  event.preventDefault();
  reviewError.hidden = true;
  reviewStatus.textContent = "";

  const name = reviewForm.reviewName.value.trim();
  const text = reviewForm.reviewText.value.trim();

  if (!selectedStars || !name || !text) {
    reviewError.hidden = false;
    reviewError.textContent = "Choose a star rating, then add your name and review.";
    return;
  }

  const review = { name, text, stars: selectedStars };
  const localReviews = readLocalReviews();
  localReviews.unshift(review);
  writeLocalReviews(localReviews);
  renderReviews();

  const message = [
    "New website review",
    `Name: ${name}`,
    `Rating: ${selectedStars} / 5`,
    "",
    text
  ].join("\n");
  const url = `https://wa.me/918080132061?text=${encodeURIComponent(message)}`;
  const opened = window.open(url, "_blank", "noopener,noreferrer");
  if (opened) opened.opener = null;

  reviewForm.reset();
  selectedStars = 0;
  paintStars(0);
  reviewStatus.textContent = opened
    ? "WhatsApp should be open with your rating. It also stays on this browser until we publish it."
    : "Your rating is saved on this browser. If WhatsApp did not open, use the WhatsApp link in Contact.";
});

renderReviews();

const ripAudio = { ctx: null, wind: null };

function ripContext() {
  if (!ripAudio.ctx) ripAudio.ctx = new AudioContext();
  return ripAudio.ctx;
}

function ripTone(freq, delay, duration, type, volume) {
  const ctx = ripContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const start = ctx.currentTime + delay;
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.04);
}

function playRipStart() {
  const ctx = ripContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(180, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(740, ctx.currentTime + 0.42);
  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.32, ctx.currentTime + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.46);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.48);
  ripTone(240, 0.02, 0.28, "sine", 0.18);
}

function playRipDone() {
  ripTone(523.25, 0, 0.2, "sine", 0.34);
  ripTone(659.25, 0.12, 0.24, "sine", 0.3);
  ripTone(783.99, 0.24, 0.46, "triangle", 0.26);
}

function startWind() {
  stopWind();
  const ctx = ripContext();
  const length = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 520;
  filter.Q.value = 0.6;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.09, ctx.currentTime + 0.12);
  source.connect(filter).connect(gain).connect(ctx.destination);
  source.start();
  ripAudio.wind = { source, gain, ctx };
}

function stopWind() {
  const wind = ripAudio.wind;
  if (!wind) return;
  ripAudio.wind = null;
  const now = wind.ctx.currentTime;
  const level = Math.max(wind.gain.gain.value, 0.001);
  wind.gain.gain.cancelScheduledValues(now);
  wind.gain.gain.setValueAtTime(level, now);
  wind.gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
  wind.source.stop(now + 0.2);
}

function saveBlob(blob, name) {
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = name;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(href), 4000);
}

let activeReset = null;

function stopNavigation() {
  try { window.stop(); } catch (err) {}
}

const RIP_NS = "http://www.w3.org/2000/svg";
const RIP_CX = 140;
const RIP_R = 30;
const RING_Y = 78;
const ROPE_Y = 118;

function ripEl(name, attrs) {
  const node = document.createElementNS(RIP_NS, name);
  Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
  return node;
}

function ellipsePath(morph) {
  const yBase = RING_Y + (ROPE_Y - RING_Y) * morph;
  const squash = 1 - morph;
  const xRadius = RIP_R + morph * (Math.PI * RIP_R - RIP_R);
  let d = "";
  const steps = 72;
  for (let i = 0; i <= steps; i += 1) {
    const ang = -Math.PI / 2 + (i / steps) * Math.PI * 2;
    const x = RIP_CX + Math.cos(ang) * xRadius;
    const y = yBase + Math.sin(ang) * RIP_R * squash;
    d += `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return `${d}Z`;
}

function linePath(amp, phase) {
  const left = RIP_CX - Math.PI * RIP_R;
  const len = Math.PI * 2 * RIP_R;
  let d = "";
  const steps = 42;
  for (let i = 0; i <= steps; i += 1) {
    const u = i / steps;
    const x = left + u * len;
    const y = ROPE_Y + Math.sin(u * Math.PI * 2 + phase) * amp;
    d += `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return d;
}

document.querySelectorAll(".rip").forEach((rip) => {
  const svg = rip.querySelector(".rip-svg");
  const ring = rip.querySelector(".rip-ring");
  const pct = rip.querySelector(".rip-pct");
  const cancel = rip.querySelector(".rip-cancel");
  const speaker = rip.querySelector(".rip-speaker");
  const url = rip.dataset.url;
  const file = rip.dataset.file;
  const knownBytes = Number(rip.dataset.bytes) || 0;
  const remote = /^https?:/i.test(url);
  const track = ripEl("path", { fill: "none", stroke: "rgba(40,37,92,0.16)", "stroke-width": "5.5", "stroke-linecap": "round" });
  const ink = ripEl("path", { fill: "none", stroke: "#f3a92c", "stroke-width": "5.5", "stroke-linecap": "round", "stroke-linejoin": "round" });
  const chute = ripEl("g", { fill: "none", stroke: "#28255c", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" });
  const canopy = ripEl("path", { d: "M-36,12 C-24,-16 24,-16 36,12", "stroke-width": "2.6" });
  const skirt = ripEl("path", { d: "M-36,12 Q0,20 36,12" });
  const ropeL = ripEl("path", {});
  const ropeR = ripEl("path", {});
  const ropeIn = ripEl("path", {});
  const knot = ripEl("path", {});
  chute.append(canopy, skirt, ropeL, ropeR, ropeIn, knot);
  const arrow = ripEl("path", {
    d: "M0 -10 V7 M-6 1 L0 8 L6 1",
    fill: "none",
    stroke: "#28255c",
    "stroke-width": "2.6",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    transform: `translate(${RIP_CX} ${RING_Y})`
  });
  svg.append(track, ink, chute, arrow);

  let job = 0;
  let xhr = null;
  let windOn = false;
  let saved = false;

  function paint(morph, progress, phase, indeterminate) {
    const amount = Math.max(0, Math.min(1, morph));
    const value = Math.max(0, Math.min(1, progress));
    const amp = phase ? Math.sin(Math.min(phase, Math.PI)) * 8 : 0;
    if (amount < 0.98) {
      track.setAttribute("opacity", "0");
      ink.removeAttribute("pathLength");
      ink.style.strokeDasharray = "none";
      ink.setAttribute("d", ellipsePath(amount));
    } else {
      const d = linePath(amp, phase || 0);
      track.setAttribute("opacity", "1");
      track.setAttribute("d", d);
      ink.setAttribute("d", d);
      ink.setAttribute("pathLength", "100");
      if (indeterminate) {
        ink.style.strokeDasharray = "24 76";
        ink.style.strokeDashoffset = String(-(phase || 0) * 18);
      } else {
        ink.style.strokeDasharray = `${Math.max(1, value * 100)} 100`;
        ink.style.strokeDashoffset = "0";
      }
    }
    const rise = indeterminate ? 0.82 : 0.28 + (1 - (1 - value) ** 2) * 0.72;
    const canopyY = ROPE_Y - 36 - rise * 52;
    const drop = Math.max(28, ROPE_Y - 8 - canopyY);
    chute.setAttribute("opacity", String(Math.min(1, amount * 1.8)));
    chute.setAttribute("transform", `translate(${RIP_CX} ${canopyY.toFixed(1)})`);
    ropeL.setAttribute("d", `M-28,12 L-5,${drop.toFixed(1)}`);
    ropeR.setAttribute("d", `M28,12 L5,${drop.toFixed(1)}`);
    ropeIn.setAttribute("d", `M-12,12 L-2,${drop.toFixed(1)} M12,12 L2,${drop.toFixed(1)}`);
    knot.setAttribute("d", `M-7,${drop.toFixed(1)} H7`);
    arrow.setAttribute("opacity", amount < 0.35 ? String(1 - amount / 0.35) : "0");
    if (indeterminate) pct.textContent = "Downloading";
    else pct.textContent = `${Math.round(value * 100)}%`;
  }

  function reset(stopLoad) {
    const running = rip.classList.contains("is-run") || xhr;
    if (stopLoad === false && !running) return;
    if (!running && !rip.classList.contains("is-done")) return;
    job += 1;
    saved = false;
    if (activeReset === reset) activeReset = null;
    if (xhr) {
      xhr.abort();
      xhr = null;
    }
    if (remote && stopLoad !== false) stopNavigation();
    if (windOn) {
      stopWind();
      windOn = false;
    }
    rip.classList.remove("is-run", "is-done");
    paint(0, 0, 0, false);
  }

  function showDone() {
    if (activeReset === reset) activeReset = null;
    rip.classList.remove("is-run");
    rip.classList.add("is-done");
    if (windOn) {
      stopWind();
      windOn = false;
    }
    playRipDone();
  }

  function waveThenSave(id, blob) {
    const started = performance.now();
    const step = (now) => {
      if (id !== job) return;
      const t = (now - started) / 680;
      if (t < 1) {
        paint(1, 1, t * Math.PI, false);
        requestAnimationFrame(step);
        return;
      }
      showDone();
      if (blob && !saved) {
        saved = true;
        saveBlob(blob, file);
      }
    };
    requestAnimationFrame(step);
  }

  function runMeasured() {
    const id = job;
    const started = performance.now();
    let real = 0;
    let blob = null;
    if (!remote) {
      xhr = new XMLHttpRequest();
      xhr.open("GET", url);
      xhr.responseType = "blob";
      xhr.onprogress = (event) => {
        if (id !== job) return;
        if (event.lengthComputable && event.total > 0) real = event.loaded / event.total;
        else if (knownBytes > 0) real = Math.min(0.99, event.loaded / knownBytes);
      };
      xhr.onerror = () => {
        if (id === job) reset();
      };
      xhr.onabort = () => {};
      xhr.onload = () => {
        if (id !== job) return;
        if (xhr.status < 200 || xhr.status >= 300) {
          reset();
          return;
        }
        blob = xhr.response;
        real = 1;
        xhr = null;
      };
      xhr.send();
    }
    const frame = (now) => {
      if (id !== job) return;
      const morph = Math.min(1, (now - started) / 560);
      if (remote && morph >= 1) {
        reset(false);
        return;
      }
      paint(morph, real, 0, false);
      if (blob && morph >= 1) waveThenSave(id, blob);
      else requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }

  paint(0, 0, 0, false);

  speaker.addEventListener("click", () => {
    try {
      ripContext().resume();
      playRipDone();
    } catch (err) {}
  });

  cancel.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    event.stopPropagation();
    reset();
  });
  cancel.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    reset();
  });

  const fileLink = rip.querySelector(".rip-file");
  function beginDownload(event) {
    if (rip.classList.contains("is-run")) {
      event.preventDefault();
      return;
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (activeReset && activeReset !== reset) activeReset();
    activeReset = reset;
    if (!remote && !reduce) event.preventDefault();
    try {
      ripContext().resume();
      playRipStart();
    } catch (err) {}
    if (reduce) return;
    try {
      startWind();
      windOn = true;
    } catch (err) {}
    job += 1;
    rip.classList.add("is-run");
    rip.classList.remove("is-done");
    saved = false;
    paint(0, 0, 0, false);
    runMeasured();
  }
  ring.addEventListener("click", beginDownload);
  fileLink.addEventListener("click", beginDownload);
});

function releaseDownload() {
  if (activeReset) activeReset(false);
}

if (window.navigation) {
  navigation.addEventListener("navigateerror", releaseDownload);
}

window.addEventListener("pageshow", (event) => {
  if (event.persisted) releaseDownload();
});
