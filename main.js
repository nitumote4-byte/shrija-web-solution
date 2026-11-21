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
