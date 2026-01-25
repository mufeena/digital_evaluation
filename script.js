/*************************
 BASIC ELEMENTS
**************************/
const pdfContainer = document.getElementById("pdfContainer");
const studentSelect = document.getElementById("studentSelect");

let timer = null;
let timeLeft = 180;
let currentIndex = 0;

/*************************
 CLICK OVERLAY
**************************/
const clickLayer = document.createElement("div");
clickLayer.style.position = "absolute";
clickLayer.style.top = "0";
clickLayer.style.left = "0";
clickLayer.style.width = "100%";
clickLayer.style.height = "100%";
clickLayer.style.background = "transparent";
clickLayer.style.cursor = "crosshair";
clickLayer.style.zIndex = "5";

pdfContainer.style.position = "relative";
pdfContainer.appendChild(clickLayer);

/*************************
 CLICK → ADD TICK AT POSITION
**************************/
clickLayer.addEventListener("click", (e) => {
  if (!studentSelect.value) return;

  const rect = pdfContainer.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const tick = document.createElement("div");
  tick.innerHTML = "✔";
  tick.style.position = "absolute";
  tick.style.left = `${x}px`;
  tick.style.top = `${y}px`;
  tick.style.color = "green";
  tick.style.fontSize = "22px";
  tick.style.fontWeight = "bold";
  tick.style.pointerEvents = "none"; // important
  tick.style.zIndex = "10";

  pdfContainer.appendChild(tick);
});

/*************************
 CLEAR ALL TICKS
**************************/
function clearTicks() {
  pdfContainer.querySelectorAll(".tick").forEach(t => t.remove());
}

/*************************
 LOAD STUDENT BY INDEX
**************************/
function loadStudentByIndex(index) {
  const options = studentSelect.options;

  if (index <= 0 || index >= options.length) {
    alert("All answer sheets evaluated ✅");
    return;
  }

  studentSelect.selectedIndex = index;
  const pdfFile = options[index].value;

  pdfContainer.innerHTML =
    `<embed src="${pdfFile}" type="application/pdf" width="100%" height="100%">`;

  pdfContainer.appendChild(clickLayer);
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
  document.querySelectorAll("textarea").forEach(txt => txt.style.display = "none");
  updateTotals();
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
}

/*************************
 MARK RULES
**************************/
function enforceMaxValue(input) {
  if (input.hasAttribute("max")) {
    let max = parseFloat(input.getAttribute("max"));
    if (parseFloat(input.value) > max) input.value = max;
  }
  if (parseFloat(input.value) < 0) input.value = 0;
}

function handleReasonBox(input) {
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
 TOTALS
**************************/
function calcTotal(className, totalId) {
  const inputs = document.querySelectorAll("." + className);
  let sum = 0;
  let valid = true;

  inputs.forEach(inp => {
    enforceMaxValue(inp);
    handleReasonBox(inp);
    let reasonBox = inp.parentElement.querySelector("textarea");
    if ((inp.value === "0" || inp.value === "") && (!reasonBox || reasonBox.value.trim() === "")) {
      valid = false;
    }
    if (inp.value && inp.value !== "0") sum += parseFloat(inp.value);
  });

  document.getElementById(totalId).textContent = valid ? sum : "⚠ Reason Needed";
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

document.querySelectorAll("input").forEach(inp =>
  inp.addEventListener("input", updateTotals)
);

document.addEventListener("input", e => {
  if (e.target.tagName === "TEXTAREA") updateTotals();
});
