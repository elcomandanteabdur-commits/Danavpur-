import { initNav, initReveal, initParallax, initModal, initChrome, renderCount, renderCountError, refreshCount } from "./ui.js";
import { mountForms } from "./membership.js";

initChrome(); initNav(); initReveal(); initParallax(); initModal();
mountForms(refreshCount);

// Live member count (stats/public.memberCount). Never faked; shows an unavailable state on failure.
import("./firebase.js").then(fb => fb.watchMemberCount(renderCount, e => { console.warn("Count unavailable", e); renderCountError(); }))
  .catch(e => { console.warn("Firebase failed to load", e); renderCountError(); });
