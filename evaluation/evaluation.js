/*************************
 BASIC ELEMENTS
**************************/
const pdfContainer = document.getElementById("pdfContainer");
const studentSelect = document.getElementById("studentSelect");

let timer = null;
let timeLeft = 180;
let currentIndex = 0;

/*************************
 CLICK ON PDF → ADD TICK
**************************/
pdfContainer.addEventListener("click", (e) => {
  if (!studentSelect.value) return;

  const rect = pdfContainer.getBoundingClientRect();
  const x = e.clientX - rect.left + pdfContainer.scrollLeft;
  const y = e.clientY - rect.top + pdfContainer.scrollTop;

  const tick = document.createElement("div");
  tick.textContent = "✔";
  tick.className = "tick";

  tick.style.position = "absolute";
  tick.style.left = `${x}px`;
  tick.style.top = `${y}px`;
  tick.style.color = "green";
  tick.style.fontSize = "22px";
  tick.style.fontWeight = "bold";
  tick.style.pointerEvents = "none";
  tick.style.zIndex = "10";

  pdfContainer.appendChild(tick);
});

/*************************
 CLEAR TICKS
**************************/
function clearTicks() {
  pdfContainer.querySelectorAll(".tick").forEach(t => t.remove());
}

/*************************
 LOAD ANSWER SHEET
**************************/
function loadStudentByIndex(index) {
  const options = studentSelect.options;

  if (index <= 0 || index >= options.length) {
    alert("All answer sheets evaluated ✅");
    return;
  }

  studentSelect.selectedIndex = index;
  const pdfFile = options[index].value;

  pdfContainer.innerHTML = `
    <iframe
      src="${pdfFile}"
      width="100%"
      height="100%"
      style="border:none;"
    ></iframe>
  `;

  pdfContainer.style.position = "relative";
  pdfContainer.style.overflow = "auto";

  clearTicks();
}

/*************************
 DROPDOWN CHANGE
**************************/
studentSelect.addEventListener("change", () => {
  currentIndex = studentSelect.selectedIndex;
  if (currentIndex > 0) {
    loadStudentByIndex(currentIndex);
    startTimer();
  }
});

/*************************
 3-MIN TIMER → AUTO NEXT
**************************/
function startTimer() {
  clearInterval(timer);
  timeLeft = 180;

  timer = setInterval(() => {
    timeLeft--;

    if (timeLeft <= 0) {
      clearInterval(timer);
      currentIndex++;
      loadStudentByIndex(currentIndex);
      startTimer();
    }
  }, 1000);
}

/*************************
 RESET MARKS
**************************/
function resetMarks() {
  document.querySelectorAll("input").forEach(inp => inp.value = "");
  document.querySelectorAll("textarea").forEach(txt => txt.remove());
  updateTotals();
  calculateLOTMOTHOT();
}

/*************************
 SAVE MARKS
**************************/
function saveStudentMarks(student) {
  const data = {};
  document.querySelectorAll("input").forEach(inp => {
    data[inp.className + "_" + inp.parentElement.innerText.split(" ")[0]] = inp.value;
  });
  localStorage.setItem(student, JSON.stringify(data));
}

/*************************
 LOAD MARKS
**************************/
function loadStudentMarks(student) {
  resetMarks();
  const data = JSON.parse(localStorage.getItem(student) || "{}");

  for (let key in data) {
    const inputs = document.querySelectorAll("." + key.split("_")[0]);
    inputs.forEach(inp => inp.value = data[key]);
  }
  updateTotals();
  calculateLOTMOTHOT();
}

/*************************
 MARK RULES
**************************/
function enforceMaxValue(input) {
  if (input.hasAttribute("max")) {
    const max = parseFloat(input.getAttribute("max"));
    if (parseFloat(input.value) > max) input.value = max;
  }
  if (parseFloat(input.value) < 0) input.value = 0;
}

/* UPDATED: Reason box only for Q16–Q28 */
function handleReasonBox(input) {
  const allInputs = Array.from(document.querySelectorAll("input[type='number']"));
  const qIndex = allInputs.indexOf(input); // 0-based

  // Q1–Q15 → no reason box
  if (qIndex >= 0 && qIndex <= 14) {
    const old = input.parentElement.querySelector("textarea");
    if (old) old.remove();
    return;
  }

  // Q16–Q28 → reason required
  let parent = input.parentElement;
  let reasonBox = parent.querySelector("textarea");

  if (!reasonBox) {
    reasonBox = document.createElement("textarea");
    reasonBox.placeholder = "Reason for 0 marks";
    parent.appendChild(reasonBox);
  }

  if (input.value === "0" || input.value === "") {
    reasonBox.style.display = "block";
  } else {
    reasonBox.style.display = "none";
    reasonBox.value = "";
  }
}

/*************************
 TOTAL CALCULATION (UNCHANGED)
**************************/
function calcTotal(className, totalId) {
  const inputs = document.querySelectorAll("." + className);
  let sum = 0;
  let valid = true;

  inputs.forEach(inp => {
    enforceMaxValue(inp);
    handleReasonBox(inp);

    const reasonBox = inp.parentElement.querySelector("textarea");
    const allInputs = Array.from(document.querySelectorAll("input[type='number']"));
    const qIndex = allInputs.indexOf(inp);

    if (
      qIndex >= 15 &&
      (inp.value === "0" || inp.value === "") &&
      (!reasonBox || reasonBox.value.trim() === "")
    ) {
      valid = false;
    }

    if (inp.value && inp.value !== "0") {
      sum += parseFloat(inp.value);
    }
  });

  document.getElementById(totalId).textContent =
    valid ? sum : "⚠ Reason Needed";

  return valid ? sum : NaN;
}

function updateTotals() {
  const t1 = calcTotal("sec1", "total1");
  const t2 = calcTotal("sec2", "total2");
  const t3 = calcTotal("sec3", "total3");
  const t4 = calcTotal("sec4", "total4");
  const t5 = calcTotal("obe", "total5");

  let grand = 0;
  if (![t1, t2, t3, t4, t5].some(isNaN)) {
    grand = t1 + t2 + t3 + t4 + t5;
  }

  document.getElementById("grand").textContent = grand;

  if (studentSelect.value) saveStudentMarks(studentSelect.value);
}

/*************************
 LOT / MOT / HOT (SAFE ADD-ON)
**************************/
function calculateLOTMOTHOT() {
  const inputs = Array.from(document.querySelectorAll("input[type='number']"));

  let lot = 0, mot = 0, hot = 0;

  inputs.forEach((inp, index) => {
    const val = parseFloat(inp.value);
    if (isNaN(val)) return;

    if (index <= 14) lot += val;           // Q1–15
    else if (index <= 26) mot += val;      // Q16–27
    else if (index === 27) hot += val;     // Q28
  });

  document.getElementById("lotTotal").textContent = lot;
  document.getElementById("motTotal").textContent = mot;
  document.getElementById("hotTotal").textContent = hot;
}

/*************************
 EVENT HOOKS
**************************/
document.querySelectorAll("input").forEach(inp =>
  inp.addEventListener("input", () => {
    updateTotals();
    calculateLOTMOTHOT();
  })
);

document.addEventListener("input", e => {
  if (e.target.tagName === "TEXTAREA") {
    updateTotals();
    calculateLOTMOTHOT();
  }
});

/*************************
 AUTH CHECK
**************************/
const loggedStaff = localStorage.getItem("loggedStaff");
if (!loggedStaff) {
  window.location.href = "../index.html";
}

/*************************
 LOGOUT
**************************/
document.getElementById("logoutBtn")?.addEventListener("click", () => {
  localStorage.removeItem("loggedStaff");
  window.location.href = "../index.html";
});
