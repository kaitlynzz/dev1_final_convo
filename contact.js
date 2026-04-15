// Prefill subject from ?subject= query
const params = new URLSearchParams(location.search);
const subjectParam = params.get("subject");
if (subjectParam) {
  const sel = document.getElementById("subject");
  if (sel && [...sel.options].some((o) => o.value === subjectParam)) {
    sel.value = subjectParam;
  }
}

const form = document.getElementById("contactForm");
const status = document.getElementById("formStatus");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  if (!data.name || !data.email || !data.message) {
    status.hidden = false;
    status.textContent = "Please fill in name, email, and message.";
    status.className = "form__status form__status--error";
    return;
  }
  // No backend yet — simulate a successful submit.
  status.hidden = false;
  status.textContent = `Thanks, ${data.name.split(" ")[0]}. We'll reply within two business days.`;
  status.className = "form__status form__status--ok";
  form.reset();
});
