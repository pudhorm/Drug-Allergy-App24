/* ===== ปรับ label "ยา" / "ADR" ไม่ให้ทับวันที่ ===== */
#page5 .p5-lane {
  align-items: flex-start;
}
#page5 .p5-lane-label {
  width: 46px;
  margin-left: 2px;
  margin-right: 6px; /* ดัน bar ออกไปทางขวานิดนึง */
  text-align: left;
  font-weight: 700;
  line-height: 1.5;
}

/* ให้เลนของ bar เริ่มนิดหน่อยจากซ้าย */
#p5DrugLane,
#p5AdrLane {
  position: relative;
  height: 44px;
  margin-left: 4px;
}

/* ปุ่มลบในหน้า 5 ให้สวย */
.p5-field-del {
  display: flex;
  align-items: flex-end;
}
.p5-del-btn {
  background: radial-gradient(circle at top, #fee2e2 0%, #fca5a5 65%, #f43f5e 100%);
  border: none;
  color: #fff;
  padding: .35rem .9rem .4rem;
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 8px 18px rgba(248, 113, 113, 0.35);
  white-space: nowrap;
}
.p5-del-btn:hover {
  filter: brightness(1.02);
}
