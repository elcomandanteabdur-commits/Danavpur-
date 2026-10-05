// Membership form: rendering, validation, submission states.
const STATES = ["Khambapur","Khamili","Lambeshwaram","Ucha Pradesh","Long Angels","Longfornia","The Giant City","Beyond the Seven Realms"];
const COOLDOWN_MS = 60000, KEY = "dnv_last_join";

const field = (id, label, input, hint = "") => `<div class="fld"><label for="${id}">${label}</label>${input}${hint ? `<small id="${id}-h">${hint}</small>` : ""}<span class="err" id="${id}-e" aria-live="polite"></span></div>`;

function formHTML() {
  return `<form class="mform" novalidate>
    ${field("f-name", "Name", `<input id="f-name" name="name" type="text" autocomplete="name" maxlength="80" required aria-describedby="f-name-e">`)}
    ${field("f-phone", "Phone / contact number", `<input id="f-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" maxlength="20" required aria-describedby="f-phone-h f-phone-e">`, "Kept private. Never shown publicly.")}
    ${field("f-state", "State / territory", `<select id="f-state" name="state" required aria-describedby="f-state-e"><option value="">Choose a territory</option>${STATES.map(s => `<option>${s}</option>`).join("")}</select>`)}
    ${field("f-height", "Height (cm)", `<input id="f-height" name="height" type="number" inputmode="numeric" min="50" max="400" step="1" required aria-describedby="f-height-h f-height-e">`, "Whole centimetres, 50 to 400.")}
    <p class="formerr" role="alert" hidden></p>
    <button class="btn" type="submit">Be a member</button>
    <p class="note">We record your name, contact number, territory and height. Only the total member count is public.</p>
  </form>`;
}

const rules = {
  name: v => v.trim().length >= 2 && v.trim().length <= 80 || "Please enter a valid name.",
  phone: v => /^[+\d][\d\s\-()]{5,18}[\d]$/.test(v.trim()) && v.trim().length >= 7 && v.trim().length <= 20 || "Please enter a valid contact number (7 to 20 characters).",
  state: v => v.length >= 2 || "Please choose your state or territory.",
  height: v => /^\d+$/.test(v) && +v >= 50 && +v <= 400 || "Please enter a valid height between 50 and 400 cm."
};

function setErr(form, k, msg) {
  const el = form.elements[k], out = form.querySelector(`#${el.id}-e`);
  out.textContent = msg || ""; msg ? el.setAttribute("aria-invalid", "true") : el.removeAttribute("aria-invalid");
}

function validate(form) {
  let first = null;
  for (const k of Object.keys(rules)) {
    const r = rules[k](form.elements[k].value);
    setErr(form, k, r === true ? "" : r);
    if (r !== true && !first) first = form.elements[k];
  }
  first?.focus();
  return !first;
}

export function mountForms(onJoined) {
  document.querySelectorAll("[data-member-form]").forEach(box => {
    box.innerHTML = formHTML();
    const form = box.querySelector("form"), btn = form.querySelector("button"), err = form.querySelector(".formerr");
    form.addEventListener("input", e => { if (e.target.name) { const r = rules[e.target.name](e.target.value); if (e.target.hasAttribute("aria-invalid") || r === true) setErr(form, e.target.name, r === true ? "" : r); } });
    form.addEventListener("submit", async e => {
      e.preventDefault(); err.hidden = true;
      if (btn.disabled || !validate(form)) return;
      const last = +localStorage.getItem(KEY) || 0;
      if (Date.now() - last < COOLDOWN_MS) { err.textContent = "A membership was just recorded from this device. Please wait a minute before trying again."; err.hidden = false; return; }
      btn.disabled = true; btn.textContent = "Recording your name…";
      try {
        const { createMember } = await import("./firebase.js");
        const id = await createMember({ name: form.name.value.trim(), phone: form.phone.value.trim(), state: form.state.value, height: parseInt(form.height.value, 10) });
        localStorage.setItem(KEY, String(Date.now()));
        box.innerHTML = `<div class="welcome"><div class="ring" aria-hidden="true"><span>◆</span></div><h2 tabindex="-1">Welcome to Danavpur</h2><p>Your membership has been recorded.</p><span class="ref">REF · DNV-${id.slice(0, 8).toUpperCase()}</span><div class="count" data-count data-state="loading" style="color:inherit"><span class="label">Community now stands at</span><b style="color:inherit;font-size:clamp(2.4rem,10vw,4rem)">—</b></div><a class="btn ghost" href="index.html">Return to the world</a></div>`;
        box.querySelector("h2").focus(); onJoined?.();
      } catch (ex) {
        console.error("Membership submission failed", ex);
        err.textContent = "Unable to connect to Danavpur's membership archive. Please try again.";
        err.hidden = false; btn.disabled = false; btn.textContent = "Be a member";
      }
    });
  });
}
