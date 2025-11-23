// ====================== page8.js — หน้า 8 ข้อมูลสถิติ ======================
(function () {
  // ใช้ key เดียวกับหน้า 7
  var STORAGE_KEY = "drugAllergyCases_v1";
  var chartInstance = null;

  // 21 ADR หลัก (ชื่อให้ตรงกับที่บันทึกใน mainAdrLabel / mainAdr / brain.topLabel)
  var ADR_LABELS = [
    "Urticaria",
    "Anaphylaxis",
    "Angioedema",
    "Maculopapular rash",
    "Fixed drug eruption",
    "AGEP",
    "SJS",
    "TEN",
    "DRESS",
    "Erythema multiforme",
    "Photosensitivity drug eruption",
    "Exfoliative dermatitis",
    "Eczematous drug eruption",
    "Bullous Drug Eruption",
    "Serum sickness",
    "Vasculitis",
    "Hemolytic anemia",
    "Pancytopenia",
    "Neutropenia",
    "Thrombocytopenia",
    "Nephritis"
  ];

  function loadCases() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      var arr = JSON.parse(raw);
      if (!Array.isArray(arr)) return [];
      return arr;
    } catch (e) {
      console.warn("page8 loadCases error", e);
      return [];
    }
  }

  // ดึงชื่อ ADR หลักจากเคส แล้วตัด % ทิ้ง
  function getMainAdrName(c) {
    var raw =
      (c && (c.mainAdrLabel || c.mainAdr)) ||
      (c && c.brain && c.brain.topLabel) ||
      "";

    raw = String(raw).trim();
    if (!raw) return "";

    // ตัดส่วนที่เป็น (70%) หรือ (70.5 %) ออก
    var m = raw.match(/^(.+?)(\s*\([\d.,]+\s*%?\))?$/);
    var base = m ? m[1].trim() : raw;
    return base;
  }

  function buildCounts() {
    var cases = loadCases();
    var counts = {};
    ADR_LABELS.forEach(function (name) {
      counts[name] = 0;
    });

    cases.forEach(function (c) {
      var name = getMainAdrName(c);
      if (!name) return;
      if (counts.hasOwnProperty(name)) {
        counts[name] += 1;
      }
      // ถ้าอยากมีกลุ่ม Others ค่อยเพิ่ม logic ทีหลัง
    });

    // สร้าง array สำหรับกราฟ (เอาแค่ ADR ที่เคส ≥ 0 ทั้ง 21 ตัว)
    var labels = [];
    var values = [];
    ADR_LABELS.forEach(function (name) {
      labels.push(name);
      values.push(counts[name] || 0);
    });

    return { labels: labels, values: values, totalCases: cases.length };
  }

  function createPastelColors(n) {
    var colors = [];
    var baseHues = [260, 280, 300, 320, 340, 200, 220]; // โทนม่วง-ชมพู-ฟ้าอ่อน
    for (var i = 0; i < n; i++) {
      var h = baseHues[i % baseHues.length];
      var s = 70;
      var l = 80;
      // ใช้ HSL → rgba แบบง่าย ๆ โดยให้ browser แปลง
      colors.push("hsl(" + h + " " + s + "% " + l + "%)");
    }
    return colors;
  }

  // วาดกราฟ
  function renderChart(ctx, data) {
    var labels = data.labels;
    var values = data.values;
    var total = data.totalCases;

    var bgColors = createPastelColors(labels.length);

    if (chartInstance) {
      chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "จำนวนเคส",
            data: values,
            backgroundColor: bgColors,
            borderRadius: 12,
            borderSkipped: false,
            barThickness: 30, // แท่งใหญ่ขึ้น
            maxBarThickness: 40
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              title: function (items) {
                if (!items.length) return "";
                var label = items[0].label || "";
                return label;
              },
              label: function (ctx) {
                var val = ctx.parsed.y || 0;
                return "พบ " + val + " เคส";
              },
              footer: function () {
                return "";
              }
            }
          },
          title: {
            display: true,
            text: "สถิติชนิด ADR หลัก (รวม " + total + " เคส)",
            font: {
              size: 16,
              weight: "bold"
            },
            color: "#4c1d95"
          }
        },
        scales: {
          x: {
            ticks: {
              color: "#4b5563",
              maxRotation: 60,
              minRotation: 45,
              font: {
                size: 10
              }
            },
            grid: {
              display: false
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0,
              color: "#6b7280"
            },
            grid: {
              color: "rgba(156,163,175,0.2)"
            }
          }
        }
      }
    });
  }

  // สร้าง layout หน้า 8
  function buildLayout(root) {
    root.innerHTML = [
      '<div class="p8-wrapper" style="padding:14px 10px 22px;">',
        '<h2 style="margin:0 0 8px;font-size:1.2rem;font-weight:800;color:#4c1d95;">📊 หน้า 8 ข้อมูลสถิติชนิด ADR หลัก</h2>',
        '<p style="margin:0 0 12px;font-size:.9rem;color:#6b21a8;">',
          'แสดงจำนวนเคสในแต่ละชนิด ADR หลักจากข้อมูลที่บันทึกไว้ในหน้า 7 รายงานเคส',
        '</p>',
        '<div style="border-radius:18px;border:1px solid #e5e7eb;background:linear-gradient(180deg,#faf5ff,#fefce8);box-shadow:0 16px 40px rgba(148,163,184,0.35);padding:12px 12px 16px;">',
          '<div style="height:420px;">',
            '<canvas id="p8Chart"></canvas>',
          '</div>',
          '<p id="p8NoData" style="margin-top:8px;font-size:.85rem;color:#9ca3af;display:none;">ยังไม่มีเคสที่บันทึกไว้จากหน้า 7</p>',
        '</div>',
      '</div>'
    ].join("");
  }

  // renderer สำหรับ router
  window.renderPage8 = function () {
    var root = document.getElementById("p8Root");
    if (!root) return;

    buildLayout(root);

    var info = buildCounts();
    var canvas = document.getElementById("p8Chart");
    var noData = document.getElementById("p8NoData");

    if (!canvas) return;
    var ctx = canvas.getContext("2d");

    var hasAny = info.values.some(function (v) { return v > 0; });

    if (!hasAny) {
      if (noData) noData.style.display = "block";
    }

    renderChart(ctx, info);
  };
})();
