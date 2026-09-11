(() => {
  const STORAGE_KEY = "timesheet-app-state-v1";

  const employeeNameInput = document.getElementById("employeeName");
  const targetMonthInput = document.getElementById("targetMonth");
  const breakMinutesInput = document.getElementById("breakMinutes");
  const generateBtn = document.getElementById("generateBtn");
  const clearBtn = document.getElementById("clearBtn");
  const printBtn = document.getElementById("printBtn");
  const table = document.getElementById("timesheetTable");
  const tbody = document.getElementById("timesheetBody");
  const emptyMessage = document.getElementById("emptyMessage");
  const summary = document.getElementById("summary");
  const workDaysCountEl = document.getElementById("workDaysCount");
  const totalHoursEl = document.getElementById("totalHours");

  const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

  function defaultMonthValue() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  }

  function daysInMonth(year, monthIndex) {
    return new Date(year, monthIndex + 1, 0).getDate();
  }

  function parseTimeToMinutes(value) {
    if (!value) return null;
    const [h, m] = value.split(":").map(Number);
    return h * 60 + m;
  }

  function formatMinutesAsHours(totalMinutes) {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h}:${String(m).padStart(2, "0")}`;
  }

  function computeWorkedMinutes(startVal, endVal, breakMin) {
    const start = parseTimeToMinutes(startVal);
    const end = parseTimeToMinutes(endVal);
    if (start === null || end === null) return 0;
    let diff = end - start;
    if (diff < 0) diff += 24 * 60;
    diff -= Number(breakMin) || 0;
    return diff > 0 ? diff : 0;
  }

  function rowClassFor(dayOfWeek) {
    if (dayOfWeek === 0) return "sunday-holiday";
    if (dayOfWeek === 6) return "saturday";
    return "";
  }

  function buildTable(year, monthIndex, defaultBreak) {
    tbody.innerHTML = "";
    const count = daysInMonth(year, monthIndex);

    for (let day = 1; day <= count; day++) {
      const date = new Date(year, monthIndex, day);
      const dow = date.getDay();
      const tr = document.createElement("tr");
      const rowClass = rowClassFor(dow);
      if (rowClass) tr.className = rowClass;
      tr.dataset.day = String(day);

      tr.innerHTML = `
        <td>${monthIndex + 1}/${day}</td>
        <td>${WEEKDAY_LABELS[dow]}</td>
        <td><input type="time" class="start-time"></td>
        <td><input type="time" class="end-time"></td>
        <td><input type="number" class="break-min" min="0" step="5" value="${defaultBreak}"></td>
        <td class="worked-hours">0:00</td>
        <td><input type="text" class="note" placeholder=""></td>
      `;
      tbody.appendChild(tr);
    }
  }

  function recalcRow(tr) {
    const start = tr.querySelector(".start-time").value;
    const end = tr.querySelector(".end-time").value;
    const breakMin = tr.querySelector(".break-min").value;
    const minutes = computeWorkedMinutes(start, end, breakMin);
    tr.querySelector(".worked-hours").textContent = formatMinutesAsHours(minutes);
    return minutes;
  }

  function recalcSummary() {
    let totalMinutes = 0;
    let workDays = 0;
    tbody.querySelectorAll("tr").forEach((tr) => {
      const minutes = recalcRow(tr);
      if (minutes > 0) {
        totalMinutes += minutes;
        workDays += 1;
      }
    });
    workDaysCountEl.textContent = String(workDays);
    totalHoursEl.textContent = formatMinutesAsHours(totalMinutes);
  }

  function collectState() {
    const rows = [];
    tbody.querySelectorAll("tr").forEach((tr) => {
      rows.push({
        day: tr.dataset.day,
        start: tr.querySelector(".start-time").value,
        end: tr.querySelector(".end-time").value,
        breakMin: tr.querySelector(".break-min").value,
        note: tr.querySelector(".note").value,
      });
    });
    return {
      employeeName: employeeNameInput.value,
      targetMonth: targetMonthInput.value,
      breakMinutes: breakMinutesInput.value,
      rows,
    };
  }

  function saveState() {
    if (table.hidden) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(collectState()));
  }

  function loadState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function showTable() {
    table.hidden = false;
    summary.hidden = false;
    emptyMessage.hidden = true;
  }

  function hideTable() {
    table.hidden = true;
    summary.hidden = true;
    emptyMessage.hidden = false;
  }

  function generateFromInputs(restoreRows) {
    const monthValue = targetMonthInput.value;
    if (!monthValue) {
      alert("対象年月を選択してください。");
      return;
    }
    const [yearStr, monthStr] = monthValue.split("-");
    const year = Number(yearStr);
    const monthIndex = Number(monthStr) - 1;
    const defaultBreak = breakMinutesInput.value || 0;

    buildTable(year, monthIndex, defaultBreak);

    if (restoreRows) {
      restoreRows.forEach((rowData) => {
        const tr = tbody.querySelector(`tr[data-day="${rowData.day}"]`);
        if (!tr) return;
        tr.querySelector(".start-time").value = rowData.start || "";
        tr.querySelector(".end-time").value = rowData.end || "";
        tr.querySelector(".break-min").value = rowData.breakMin ?? defaultBreak;
        tr.querySelector(".note").value = rowData.note || "";
      });
    }

    showTable();
    recalcSummary();
    saveState();
  }

  tbody.addEventListener("input", () => {
    recalcSummary();
    saveState();
  });

  generateBtn.addEventListener("click", () => generateFromInputs(null));

  clearBtn.addEventListener("click", () => {
    if (!confirm("入力内容をすべてクリアします。よろしいですか？")) return;
    localStorage.removeItem(STORAGE_KEY);
    employeeNameInput.value = "";
    breakMinutesInput.value = 60;
    targetMonthInput.value = defaultMonthValue();
    hideTable();
    tbody.innerHTML = "";
  });

  printBtn.addEventListener("click", () => {
    window.print();
  });

  [employeeNameInput, targetMonthInput, breakMinutesInput].forEach((el) => {
    el.addEventListener("change", saveState);
  });

  function init() {
    const saved = loadState();
    if (saved) {
      employeeNameInput.value = saved.employeeName || "";
      targetMonthInput.value = saved.targetMonth || defaultMonthValue();
      breakMinutesInput.value = saved.breakMinutes || 60;
      if (saved.targetMonth) {
        generateFromInputs(saved.rows);
        return;
      }
    } else {
      targetMonthInput.value = defaultMonthValue();
    }
    hideTable();
  }

  init();
})();
