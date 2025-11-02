/* ปุ่มพิมพ์ — ชมพูอมม่วง */
.p5-bottom-print {
  background:
    radial-gradient(circle at 10% 25%, rgba(255,255,255,0.16) 0, rgba(255,255,255,0) 55%),
    linear-gradient(90deg, #f472b6 0%, #a855f7 100%);
  color: #fff;
  font-weight: 600;
}

/* ตอนพิมพ์ให้สีออก */
@media print {
  body,
  .p5-wrapper {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* ซ่อนปุ่มเวลา print */
  .p5-footer-btns,
  .p5-btn-group {
    display: none !important;
  }

  /* timeline ไม่ตัด */
  #p5TimelineScroll {
    overflow: visible !important;
    width: 100% !important;
  }

  #p5DateRow .p5-date-cell {
    font-size: 0.65rem !important;
    white-space: nowrap;
  }

  .p5-bar-drug {
    background: linear-gradient(90deg, #1d4ed8 0%, #0ea5e9 100%) !important;
    color: #fff !important;
  }
  .p5-bar-adr {
    background: linear-gradient(90deg, #e11d48 0%, #f97316 100%) !important;
    color: #fff !important;
  }
}

/* ใช้กฎเดียวกับตอน print ตอนที่เรากดปุ่ม */
body.p5-printing .p5-footer-btns,
body.p5-printing .p5-btn-group {
  display: none !important;
}
body.p5-printing #p5TimelineScroll {
  overflow: visible !important;
  width: 100% !important;
}
body.p5-printing .p5-bar-drug {
  background: linear-gradient(90deg, #1d4ed8 0%, #0ea5e9 100%) !important;
  color: #fff !important;
}
body.p5-printing .p5-bar-adr {
  background: linear-gradient(90deg, #e11d48 0%, #f97316 100%) !important;
  color: #fff !important;
}
