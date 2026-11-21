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
