const searchInput = document.getElementById("search");
const resultsEl = document.getElementById("results");

const nameInput = document.getElementById("name");
const domainInput = document.getElementById("domain");
const extInput = document.getElementById("ext");
const pathInput = document.getElementById("path");

const saveBtn = document.getElementById("save");
const deleteBtn = document.getElementById("delete");
const statusEl = document.getElementById("status");

const darkToggle = document.getElementById("darkMode");

let rulesData = null;
let selectedRuleId = null;

function setStatus(msg) {
  statusEl.textContent = msg;
  setTimeout(() => (statusEl.textContent = ""), 1500);
}

function parseList(value) {
  return value
    .split(",")
    .map(v => v.trim().toLowerCase())
    .filter(Boolean);
}

function clearForm() {
  selectedRuleId = null;
  nameInput.value = "";
  domainInput.value = "";
  extInput.value = "";
  pathInput.value = "";
  deleteBtn.disabled = true;
}

async function loadRules() {
  const data = await browser.storage.local.get("rules");
  rulesData = data.rules;
  renderList();
}

async function saveRules() {
  await browser.storage.local.set({ rules: rulesData });
}

function renderList(filter = "") {
  resultsEl.innerHTML = "";

  if (!rulesData) return;

   if (!filter.trim()) {
    return;
  }
  
  const q = filter.toLowerCase();

  for (const rule of rulesData.rules) {
    if (
      q &&
      !rule.name.toLowerCase().includes(q) &&
      !JSON.stringify(rule.conditions).toLowerCase().includes(q)
    ) {
      continue;
    }

    const li = document.createElement("li");
    li.textContent = rule.name;
    li.onclick = () => selectRule(rule);
    resultsEl.appendChild(li);
  }
}

function selectRule(rule) {
  selectedRuleId = rule.id;

  nameInput.value = rule.name;
  domainInput.value = (rule.conditions.domains || []).join(",");
  extInput.value = (rule.conditions.extensions || []).join(",");
  pathInput.value = rule.path;

  deleteBtn.disabled = false;
}

saveBtn.onclick = async () => {
  const name = nameInput.value.trim();
  const path = pathInput.value.trim();

  if (!name || !path) {
    setStatus("Name and path required");
    return;
  }

  const domains = parseList(domainInput.value);
  const extensions = parseList(extInput.value);

  const conditions = {};
  if (domains.length) conditions.domains = domains;
  if (extensions.length) conditions.extensions = extensions;

  if (selectedRuleId) {
    rulesData.rules = rulesData.rules.map(r =>
      r.id === selectedRuleId
        ? { ...r, name, conditions, path }
        : r
    );
    setStatus("Rule updated");
  } else {
    const id = Date.now();
    rulesData.rules.push({ id, name, conditions, path });
    setStatus("Rule added");
  }

  await saveRules();
  clearForm();
  renderList();
};

deleteBtn.onclick = async () => {
  if (!selectedRuleId) return;

  rulesData.rules = rulesData.rules.filter(
    r => r.id !== selectedRuleId
  );

  await saveRules();
  clearForm();
  renderList();
  setStatus("Rule deleted");
};

searchInput.oninput = e => {
  renderList(e.target.value);
};

async function loadTheme() {
  const data = await browser.storage.local.get("theme");
  if (data.theme === "dark") {
    document.body.classList.add("dark");
    darkToggle.checked = true;
  }
}

darkToggle.onchange = async () => {
  if (darkToggle.checked) {
    document.body.classList.add("dark");
    await browser.storage.local.set({ theme: "dark" });
  } else {
    document.body.classList.remove("dark");
    await browser.storage.local.set({ theme: "light" });
  }
};

loadTheme();
loadRules();
