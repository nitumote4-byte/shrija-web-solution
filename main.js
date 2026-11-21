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

const ripAudio = { ctx: null };

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
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.03);
}

function playRipStart() {
  const ctx = ripContext();
  const length = Math.floor(ctx.sampleRate * 0.32);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(380, ctx.currentTime);
  filter.frequency.exponentialRampToValueAtTime(2200, ctx.currentTime + 0.26);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.16, ctx.currentTime);
  source.connect(filter).connect(gain).connect(ctx.destination);
  source.start();
  ripTone(196, 0, 0.2, "sine", 0.05);
}

function playRipDone() {
  ripTone(523.25, 0, 0.16, "sine", 0.11);
  ripTone(659.25, 0.09, 0.2, "sine", 0.09);
  ripTone(783.99, 0.18, 0.36, "triangle", 0.07);
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

function openDownload(url) {
  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  document.body.append(link);
  link.click();
  link.remove();
}

document.querySelectorAll(".rip").forEach((rip) => {
  const ring = rip.querySelector(".rip-ring");
  const stage = rip.querySelector(".rip-stage");
  const done = rip.querySelector(".rip-done");
  const fill = rip.querySelector(".rip-fill");
  const pct = rip.querySelector(".rip-pct");
  const chute = rip.querySelector(".rip-chute");
  const cancel = rip.querySelector(".rip-cancel");
  const url = rip.dataset.url;
  const file = rip.dataset.file;
  const saveLocally = rip.dataset.save === "1";
  let job = 0;
  let xhr = null;
  let finishing = false;

  function paint(amount) {
    const value = Math.max(0, Math.min(1, amount));
    fill.style.transform = `scaleX(${value})`;
    pct.textContent = `${Math.round(value * 100)}%`;
    chute.style.transform = `translateY(${(1 - value) * 16}px)`;
  }

  function reset() {
    job += 1;
    if (xhr) {
      xhr.abort();
      xhr = null;
    }
    finishing = false;
    rip.classList.remove("is-run", "is-done", "is-wave");
    ring.hidden = false;
    stage.hidden = true;
    done.hidden = true;
    paint(0);
  }

  function finish() {
    if (finishing) return;
    finishing = true;
    const id = job;
    rip.classList.add("is-wave");
    window.setTimeout(() => {
      if (id !== job) return;
      rip.classList.remove("is-run", "is-wave");
      rip.classList.add("is-done");
      ring.hidden = true;
      stage.hidden = true;
      done.hidden = false;
      playRipDone();
    }, 420);
  }

  function runTimed() {
    const id = job;
    const started = performance.now();
    const duration = 2400;
    let handed = false;
    const frame = (now) => {
      if (id !== job) return;
      const t = Math.min(1, (now - started) / duration);
      const eased = 1 - (1 - t) ** 3;
      paint(eased);
      if (!handed && t > 0.18) {
        handed = true;
        openDownload(url);
      }
      if (t < 1) requestAnimationFrame(frame);
      else finish();
    };
    requestAnimationFrame(frame);
    cancel.onclick = reset;
  }

  function runSaved() {
    const id = job;
    const started = performance.now();
    let real = 0;
    xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = "blob";
    xhr.onprogress = (event) => {
      if (event.lengthComputable) real = event.loaded / event.total;
    };
    xhr.onerror = reset;
    xhr.onabort = () => {};
    xhr.onload = () => {
      if (id !== job) return;
      if (xhr.status < 200 || xhr.status >= 300) {
        reset();
        return;
      }
      saveBlob(xhr.response, file);
      real = 1;
    };
    xhr.send();
    const frame = (now) => {
      if (id !== job) return;
      const shown = Math.min(real, (now - started) / 1600);
      paint(shown);
      if (real >= 1 && now - started > 1600) finish();
      else requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
    cancel.onclick = reset;
  }

  ring.addEventListener("click", () => {
    if (rip.classList.contains("is-run")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      openDownload(url);
      playRipDone();
      return;
    }
    ripContext().resume();
    playRipStart();
    job += 1;
    rip.classList.add("is-run");
    rip.classList.remove("is-done");
    ring.hidden = false;
    done.hidden = true;
    stage.hidden = false;
    paint(0);
    if (saveLocally) runSaved();
    else runTimed();
  });
});
