import { useState, useEffect, useRef } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────
const GI_COLORS = { high: "#ef4444", medium: "#f59e0b", low: "#22c55e", unknown: "#94a3b8" };
const GI_LABELS = { high: "High GI", medium: "Med GI", low: "Low GI", unknown: "?" };
const NOVORAPID_DURATION_HRS = 3.5; // active insulin window

// ─── Food Databases ───────────────────────────────────────────────────────────
const MEALS_DB = [
  { name: "White Rice (cooked)", carbs: 28, unit: "100g", gi: "high", cat: "South Indian" },
  { name: "Brown Rice (cooked)", carbs: 23, unit: "100g", gi: "medium", cat: "South Indian" },
  { name: "Idli", carbs: 18, unit: "piece", gi: "medium", cat: "South Indian" },
  { name: "Dosa (plain)", carbs: 30, unit: "piece", gi: "high", cat: "South Indian" },
  { name: "Masala Dosa", carbs: 45, unit: "piece", gi: "high", cat: "South Indian" },
  { name: "Uttapam", carbs: 32, unit: "piece", gi: "medium", cat: "South Indian" },
  { name: "Upma (1 cup)", carbs: 35, unit: "serving", gi: "medium", cat: "South Indian" },
  { name: "Pongal (1 cup)", carbs: 38, unit: "serving", gi: "medium", cat: "South Indian" },
  { name: "Sambar (1 cup)", carbs: 12, unit: "serving", gi: "low", cat: "South Indian" },
  { name: "Appam", carbs: 22, unit: "piece", gi: "medium", cat: "South Indian" },
  { name: "Vada (medu)", carbs: 15, unit: "piece", gi: "medium", cat: "South Indian" },
  { name: "Curd Rice (1 cup)", carbs: 32, unit: "serving", gi: "medium", cat: "South Indian" },
  { name: "Lemon Rice (1 cup)", carbs: 40, unit: "serving", gi: "high", cat: "South Indian" },
  { name: "Tamarind Rice (1 cup)", carbs: 42, unit: "serving", gi: "high", cat: "South Indian" },
  { name: "Roti / Chapati", carbs: 25, unit: "piece", gi: "medium", cat: "North Indian" },
  { name: "Paratha (plain)", carbs: 30, unit: "piece", gi: "medium", cat: "North Indian" },
  { name: "Aloo Paratha", carbs: 40, unit: "piece", gi: "medium", cat: "North Indian" },
  { name: "Puri", carbs: 22, unit: "piece", gi: "high", cat: "North Indian" },
  { name: "Naan", carbs: 35, unit: "piece", gi: "high", cat: "North Indian" },
  { name: "Bhatura", carbs: 38, unit: "piece", gi: "high", cat: "North Indian" },
  { name: "Poha (1 cup)", carbs: 40, unit: "serving", gi: "medium", cat: "North Indian" },
  { name: "Dal (1 cup cooked)", carbs: 20, unit: "serving", gi: "low", cat: "North Indian" },
  { name: "Dal Makhani (1 cup)", carbs: 22, unit: "serving", gi: "low", cat: "North Indian" },
  { name: "Rajma (1 cup)", carbs: 22, unit: "serving", gi: "low", cat: "North Indian" },
  { name: "Chole (1 cup)", carbs: 24, unit: "serving", gi: "low", cat: "North Indian" },
  { name: "Biryani (1 cup)", carbs: 45, unit: "serving", gi: "high", cat: "North Indian" },
  { name: "Khichdi (1 cup)", carbs: 35, unit: "serving", gi: "medium", cat: "North Indian" },
  { name: "Palak Paneer (1 cup)", carbs: 12, unit: "serving", gi: "low", cat: "North Indian" },
  { name: "Paneer Butter Masala (1 cup)", carbs: 15, unit: "serving", gi: "low", cat: "North Indian" },
  { name: "Aloo Sabzi (1 cup)", carbs: 25, unit: "serving", gi: "high", cat: "North Indian" },
  { name: "Fried Rice (1 cup)", carbs: 40, unit: "serving", gi: "high", cat: "North Indian" },
  { name: "Samosa", carbs: 25, unit: "piece", gi: "high", cat: "Street Food" },
  { name: "Kachori", carbs: 28, unit: "piece", gi: "high", cat: "Street Food" },
  { name: "Pav Bhaji (1 plate)", carbs: 55, unit: "serving", gi: "high", cat: "Street Food" },
  { name: "Vada Pav", carbs: 40, unit: "piece", gi: "high", cat: "Street Food" },
  { name: "Pani Puri (6 pcs)", carbs: 30, unit: "serving", gi: "high", cat: "Street Food" },
  { name: "Bhel Puri (1 cup)", carbs: 35, unit: "serving", gi: "high", cat: "Street Food" },
  { name: "Chole Bhature (1 plate)", carbs: 65, unit: "serving", gi: "high", cat: "Street Food" },
  { name: "Kathi Roll", carbs: 45, unit: "piece", gi: "high", cat: "Street Food" },
  { name: "Dhokla (2 pcs)", carbs: 18, unit: "serving", gi: "medium", cat: "Street Food" },
  { name: "Bread (white)", carbs: 15, unit: "slice", gi: "high", cat: "Continental" },
  { name: "Bread (brown)", carbs: 12, unit: "slice", gi: "medium", cat: "Continental" },
  { name: "Pasta (cooked, 1 cup)", carbs: 40, unit: "serving", gi: "medium", cat: "Continental" },
  { name: "Pizza (1 slice)", carbs: 35, unit: "slice", gi: "high", cat: "Continental" },
  { name: "Burger bun", carbs: 26, unit: "piece", gi: "high", cat: "Continental" },
  { name: "Sandwich (2 slices)", carbs: 30, unit: "serving", gi: "medium", cat: "Continental" },
  { name: "French fries (medium)", carbs: 40, unit: "serving", gi: "high", cat: "Continental" },
  { name: "Oats (cooked, 1 cup)", carbs: 27, unit: "serving", gi: "low", cat: "Continental" },
  { name: "Cornflakes (1 cup)", carbs: 25, unit: "serving", gi: "high", cat: "Continental" },
  { name: "Banana (medium)", carbs: 25, unit: "piece", gi: "medium", cat: "Fruits" },
  { name: "Apple (medium)", carbs: 20, unit: "piece", gi: "low", cat: "Fruits" },
  { name: "Mango (1 cup)", carbs: 28, unit: "serving", gi: "high", cat: "Fruits" },
  { name: "Orange (medium)", carbs: 15, unit: "piece", gi: "low", cat: "Fruits" },
  { name: "Grapes (1 cup)", carbs: 27, unit: "serving", gi: "medium", cat: "Fruits" },
  { name: "Watermelon (1 cup)", carbs: 11, unit: "serving", gi: "high", cat: "Fruits" },
  { name: "Milk (1 cup)", carbs: 12, unit: "serving", gi: "low", cat: "Dairy" },
  { name: "Yogurt / Curd (1 cup)", carbs: 10, unit: "serving", gi: "low", cat: "Dairy" },
  { name: "Lassi (sweet, 1 glass)", carbs: 28, unit: "serving", gi: "medium", cat: "Dairy" },
  { name: "Potato (boiled, 100g)", carbs: 20, unit: "100g", gi: "high", cat: "Vegetables" },
  { name: "Sweet Potato (100g)", carbs: 20, unit: "100g", gi: "medium", cat: "Vegetables" },
  { name: "Corn (1 cup)", carbs: 30, unit: "serving", gi: "medium", cat: "Vegetables" },
  { name: "Custom item", carbs: 0, unit: "manual", gi: "unknown", cat: "Custom" },
];

const SNACKS_DB = [
  { name: "Biscuits (2 pcs)", carbs: 14, unit: "serving", gi: "high", cat: "Biscuits" },
  { name: "Marie biscuits (4 pcs)", carbs: 20, unit: "serving", gi: "high", cat: "Biscuits" },
  { name: "Glucose biscuits (4 pcs)", carbs: 22, unit: "serving", gi: "high", cat: "Biscuits" },
  { name: "Digestive biscuits (2 pcs)", carbs: 18, unit: "serving", gi: "medium", cat: "Biscuits" },
  { name: "Rusk (2 pcs)", carbs: 18, unit: "serving", gi: "high", cat: "Biscuits" },
  { name: "Granola bar", carbs: 25, unit: "bar", gi: "medium", cat: "Biscuits" },
  { name: "Mathri (2 pcs)", carbs: 16, unit: "serving", gi: "medium", cat: "Namkeen" },
  { name: "Namkeen / Mixture (30g)", carbs: 18, unit: "serving", gi: "medium", cat: "Namkeen" },
  { name: "Chakli (3 pcs)", carbs: 15, unit: "serving", gi: "medium", cat: "Namkeen" },
  { name: "Sev (30g)", carbs: 17, unit: "serving", gi: "high", cat: "Namkeen" },
  { name: "Banana chips (30g)", carbs: 18, unit: "serving", gi: "high", cat: "Namkeen" },
  { name: "Popcorn (1 cup)", carbs: 12, unit: "cup", gi: "medium", cat: "Namkeen" },
  { name: "Murukku (2 pcs)", carbs: 14, unit: "serving", gi: "medium", cat: "Namkeen" },
  { name: "Peanuts (30g)", carbs: 6, unit: "serving", gi: "low", cat: "Nuts" },
  { name: "Cashews (30g)", carbs: 9, unit: "serving", gi: "low", cat: "Nuts" },
  { name: "Almonds (30g)", carbs: 6, unit: "serving", gi: "low", cat: "Nuts" },
  { name: "Mixed nuts (30g)", carbs: 7, unit: "serving", gi: "low", cat: "Nuts" },
  { name: "Makhana (30g)", carbs: 20, unit: "serving", gi: "low", cat: "Nuts" },
  { name: "Chikki (1 piece)", carbs: 20, unit: "piece", gi: "high", cat: "Nuts" },
  { name: "Ladoo (1 piece)", carbs: 22, unit: "piece", gi: "high", cat: "Sweets" },
  { name: "Halwa (2 tbsp)", carbs: 20, unit: "serving", gi: "high", cat: "Sweets" },
  { name: "Barfi (1 piece)", carbs: 18, unit: "piece", gi: "high", cat: "Sweets" },
  { name: "Jalebi (2 pcs)", carbs: 30, unit: "serving", gi: "high", cat: "Sweets" },
  { name: "Rasgulla (1 pc)", carbs: 22, unit: "piece", gi: "high", cat: "Sweets" },
  { name: "Gulab Jamun (1 pc)", carbs: 20, unit: "piece", gi: "high", cat: "Sweets" },
  { name: "Fruit chaat (1 cup)", carbs: 22, unit: "cup", gi: "medium", cat: "Light" },
  { name: "Corn chaat (1 cup)", carbs: 28, unit: "cup", gi: "medium", cat: "Light" },
  { name: "Sprouts (1 cup)", carbs: 14, unit: "cup", gi: "low", cat: "Light" },
  { name: "Dates (2 pcs)", carbs: 18, unit: "serving", gi: "high", cat: "Light" },
  { name: "Dhokla (2 pcs)", carbs: 18, unit: "serving", gi: "medium", cat: "Light" },
  { name: "Custom snack", carbs: 0, unit: "manual", gi: "unknown", cat: "Custom" },
];

const DRINKS_DB = [
  { name: "Water", carbs: 0, unit: "glass", gi: "low", cat: "Drinks" },
  { name: "Chai with sugar (1 cup)", carbs: 10, unit: "cup", gi: "high", cat: "Drinks" },
  { name: "Chai without sugar", carbs: 4, unit: "cup", gi: "low", cat: "Drinks" },
  { name: "Coffee with sugar", carbs: 8, unit: "cup", gi: "high", cat: "Drinks" },
  { name: "Black coffee", carbs: 1, unit: "cup", gi: "low", cat: "Drinks" },
  { name: "Milk (1 glass)", carbs: 12, unit: "glass", gi: "low", cat: "Drinks" },
  { name: "Sweet lassi (1 glass)", carbs: 28, unit: "glass", gi: "medium", cat: "Drinks" },
  { name: "Mango lassi (1 glass)", carbs: 36, unit: "glass", gi: "high", cat: "Drinks" },
  { name: "Salted lassi (1 glass)", carbs: 10, unit: "glass", gi: "low", cat: "Drinks" },
  { name: "Coconut water (1 glass)", carbs: 9, unit: "glass", gi: "low", cat: "Drinks" },
  { name: "Orange juice (1 glass)", carbs: 26, unit: "glass", gi: "high", cat: "Drinks" },
  { name: "Apple juice (1 glass)", carbs: 28, unit: "glass", gi: "high", cat: "Drinks" },
  { name: "Sugarcane juice (1 glass)", carbs: 38, unit: "glass", gi: "high", cat: "Drinks" },
  { name: "Buttermilk / Chaas", carbs: 5, unit: "glass", gi: "low", cat: "Drinks" },
  { name: "Soft drink / Soda (1 can)", carbs: 39, unit: "can", gi: "high", cat: "Drinks" },
  { name: "Diet soda (1 can)", carbs: 0, unit: "can", gi: "low", cat: "Drinks" },
  { name: "Sports drink (1 bottle)", carbs: 21, unit: "bottle", gi: "high", cat: "Drinks" },
  { name: "Protein shake (1 scoop)", carbs: 5, unit: "serving", gi: "low", cat: "Drinks" },
  { name: "Milkshake (1 glass)", carbs: 45, unit: "glass", gi: "high", cat: "Drinks" },
  { name: "Fresh lime soda (sweet)", carbs: 20, unit: "glass", gi: "high", cat: "Drinks" },
  { name: "Fresh lime soda (plain)", carbs: 4, unit: "glass", gi: "low", cat: "Drinks" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getMealType() {
  const h = new Date().getHours();
  if (h >= 5 && h < 11) return "breakfast";
  if (h >= 11 && h < 16) return "lunch";
  if (h >= 16 && h < 19) return "snack";
  return "dinner";
}
function roundHalf(n) { return Math.round(n * 2) / 2; }
function blankItem() { return { food: null, qty: 1, customCarbs: 0, customName: "", search: "", open: false }; }
function fmtDate(ts) { return new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short" }); }
function fmtTime(ts) { return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); }

// ─── MiniBar chart component ──────────────────────────────────────────────────
function HistoryChart({ history }) {
  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  const recent = history.filter(h => h.timestamp && h.timestamp > sevenDaysAgo);

  // Group by day
  const days = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now - i * 86400000);
    const key = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    days[key] = { dose: 0, carbs: 0, count: 0, bg: [] };
  }
  recent.forEach(h => {
    const key = fmtDate(h.timestamp);
    if (days[key]) {
      days[key].dose += h.totalDose || 0;
      days[key].carbs += h.totalCarbs || 0;
      days[key].count += 1;
      if (h.bg) days[key].bg.push(h.bg);
    }
  });

  const dayKeys = Object.keys(days);
  const maxDose = Math.max(...dayKeys.map(k => days[k].dose), 1);
  const [tab, setTab] = useState("dose");

  const vals = dayKeys.map(k => tab === "dose" ? days[k].dose : tab === "carbs" ? days[k].carbs : (days[k].bg.length ? Math.round(days[k].bg.reduce((a, b) => a + b, 0) / days[k].bg.length) : 0));
  const maxVal = Math.max(...vals, 1);
  const barColor = tab === "dose" ? "#00b896" : tab === "carbs" ? "#6366f1" : "#f59e0b";

  return (
    <div style={{ background: "#0f172a", borderRadius: 12, border: "1px solid #1e293b", padding: "16px", marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.1em", textTransform: "uppercase" }}>Last 7 Days</div>
        <div style={{ display: "flex", gap: 6 }}>
          {[["dose", "Dose"], ["carbs", "Carbs"], ["bg", "BG"]].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{ padding: "3px 9px", borderRadius: 6, border: "1px solid", borderColor: tab === id ? barColor : "#1e293b", background: tab === id ? barColor + "22" : "transparent", color: tab === id ? barColor : "#334155", fontSize: 10, cursor: "pointer", fontFamily: "inherit" }}>{label}</button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 80 }}>
        {dayKeys.map((key, i) => {
          const val = vals[i];
          const pct = maxVal > 0 ? (val / maxVal) * 100 : 0;
          const shortKey = key.split(" ")[0];
          return (
            <div key={key} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ fontSize: 9, color: val > 0 ? barColor : "#1e293b" }}>{val > 0 ? (tab === "dose" ? `${val}u` : tab === "carbs" ? `${val}g` : val) : ""}</div>
              <div style={{ width: "100%", borderRadius: 4, background: val > 0 ? barColor : "#1e293b", height: `${Math.max(pct, val > 0 ? 8 : 4)}%`, minHeight: 3, transition: "height 0.3s ease" }} />
              <div style={{ fontSize: 9, color: "#334155" }}>{shortKey}</div>
            </div>
          );
        })}
      </div>

      {recent.length === 0 && (
        <div style={{ textAlign: "center", fontSize: 11, color: "#334155", marginTop: 8 }}>No data yet — start calculating to see your history</div>
      )}

      <div style={{ display: "flex", gap: 16, marginTop: 12, paddingTop: 12, borderTop: "1px solid #1e293b" }}>
        {[
          ["Total doses", recent.reduce((s, h) => s + (h.totalDose || 0), 0).toFixed(1) + "u"],
          ["Avg carbs", recent.length ? Math.round(recent.reduce((s, h) => s + (h.totalCarbs || 0), 0) / recent.length) + "g" : "—"],
          ["Calculations", recent.length],
        ].map(([l, v]) => (
          <div key={l} style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>{v}</div>
            <div style={{ fontSize: 9, color: "#334155", marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Active Insulin Banner ─────────────────────────────────────────────────────
function ActiveInsulinBanner({ history }) {
  const lastDose = history.find(h => h.timestamp && h.totalDose > 0);
  if (!lastDose || !lastDose.timestamp) return null;
  const hrsAgo = (Date.now() - lastDose.timestamp) / 3600000;
  if (hrsAgo >= NOVORAPID_DURATION_HRS) return null;
  const remaining = NOVORAPID_DURATION_HRS - hrsAgo;
  const activeUnits = roundHalf(lastDose.totalDose * (remaining / NOVORAPID_DURATION_HRS));
  const pct = Math.round((remaining / NOVORAPID_DURATION_HRS) * 100);

  return (
    <div style={{ background: "rgba(251,191,36,0.07)", border: "1px solid rgba(251,191,36,0.25)", borderRadius: 10, padding: "12px 14px", marginBottom: 16, fontSize: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ color: "#fbbf24", fontWeight: 700 }}>⚡ Active insulin from last dose</span>
        <span style={{ color: "#fbbf24", fontWeight: 700 }}>{activeUnits}u remaining</span>
      </div>
      <div style={{ height: 4, background: "#1e293b", borderRadius: 2, marginBottom: 6 }}>
        <div style={{ height: "100%", width: `${pct}%`, background: "#fbbf24", borderRadius: 2, transition: "width 0.3s" }} />
      </div>
      <div style={{ color: "#64748b" }}>
        Last dose: <span style={{ color: "#94a3b8" }}>{lastDose.totalDose}u</span> at {fmtTime(lastDose.timestamp)} · clears in ~{remaining.toFixed(1)}hrs
        <span style={{ color: "#fbbf24", marginLeft: 8 }}>Consider this before correcting</span>
      </div>
    </div>
  );
}

// ─── Tooltip popup ────────────────────────────────────────────────────────────
function Tooltip({ content }) {
  const [open, setOpen] = useState(false);
  return (
    <span style={{ position: "relative", display: "inline-block", verticalAlign: "middle", marginLeft: 6 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ background: "none", border: "1px solid #334155", borderRadius: "50%", width: 16, height: 16, color: "#475569", fontSize: 10, cursor: "pointer", lineHeight: 1, padding: 0, display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit" }}
      >ⓘ</button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 98 }} />
          <div style={{ position: "absolute", top: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)", zIndex: 99, background: "#1e293b", border: "1px solid #334155", borderRadius: 10, padding: "12px 14px", width: 260, fontSize: 12, color: "#94a3b8", lineHeight: 1.7, boxShadow: "0 8px 32px rgba(0,0,0,0.6)" }}>
            <div onClick={() => setOpen(false)} style={{ float: "right", cursor: "pointer", color: "#475569", marginLeft: 8 }}>✕</div>
            {content}
          </div>
        </>
      )}
    </span>
  );
}

// ─── Profile field input — defined OUTSIDE ProfileSetup to prevent focus loss ──
function ProfileInp({ label, k, ph, hint, type = "number", value, onChange }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 11, color: "#64748b", marginBottom: 5, letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</div>
      {hint && <div style={{ fontSize: 11, color: "#334155", marginBottom: 5 }}>{hint}</div>}
      <input type={type} value={value} onChange={onChange} placeholder={ph}
        style={{ width: "100%", background: "#0f172a", border: "1px solid #1e293b", borderRadius: 10, padding: "12px 14px", color: "#e2e8f0", fontSize: 16, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
        onFocus={e => e.target.style.borderColor = "#6366f1"} onBlur={e => e.target.style.borderColor = "#1e293b"}
      />
    </div>
  );
}

// ─── Profile Setup ─────────────────────────────────────────────────────────────
function ProfileSetup({ onSave, existing }) {
  const [form, setForm] = useState(existing ? {
    name: existing.name, tdd: existing.tdd, target: existing.target, prebolus: existing.prebolus,
    icr_breakfast: existing.icr.breakfast, icr_lunch: existing.icr.lunch, icr_dinner: existing.icr.dinner, icr_snack: existing.icr.snack,
  } : { name: "", tdd: "", icr_breakfast: "", icr_lunch: "", icr_dinner: "", icr_snack: "", target: 110, prebolus: 15 });
  const [sameICR, setSameICR] = useState(true);
  const [error, setError] = useState("");
  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = () => {
    if (!form.name || !form.tdd || !form.icr_breakfast) { setError("Please fill in name, TDD and I:C ratio."); return; }
    const icr = sameICR
      ? { breakfast: +form.icr_breakfast, lunch: +form.icr_breakfast, dinner: +form.icr_breakfast, snack: +form.icr_breakfast }
      : { breakfast: +form.icr_breakfast, lunch: +(form.icr_lunch || form.icr_breakfast), dinner: +(form.icr_dinner || form.icr_breakfast), snack: +(form.icr_snack || form.icr_breakfast) };
    const profile = { name: form.name, tdd: +form.tdd, icr, target: +(form.target || 110), prebolus: +(form.prebolus || 15), cf: Math.round(1800 / +form.tdd) };
    try { localStorage.setItem("carbcalc_profile", JSON.stringify(profile)); } catch {}
    onSave(profile);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0e1a", backgroundImage: "radial-gradient(ellipse at 20% 50%,rgba(0,180,150,0.07) 0%,transparent 60%),radial-gradient(ellipse at 80% 20%,rgba(99,102,241,0.08) 0%,transparent 50%)", fontFamily: "'DM Mono','Fira Code','Courier New',monospace", color: "#e2e8f0", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ width: "100%", maxWidth: 520, padding: "28px 24px 40px", boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#00b896,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>💉</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>Carb Calc</div>
            <div style={{ fontSize: 11, color: "#64748b" }}>{existing ? "Edit your profile" : "Set up your profile"}</div>
          </div>
        </div>
        <div style={{ height: 1, background: "linear-gradient(90deg,#00b89640,transparent)", marginTop: 16, marginBottom: 24 }} />
        <div style={{ background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 12, padding: "14px 16px", marginBottom: 24, fontSize: 12, color: "#94a3b8", lineHeight: 1.6 }}>
          ℹ️ Saved only on your device. Your data never leaves your browser.
        </div>
        <ProfileInp label="Your name" k="name" ph="e.g. Ash" type="text" value={form.name} onChange={e => upd("name", e.target.value)} />
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: "#64748b", marginBottom: 5, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Total Daily Dose — TDD (units)
            <Tooltip content={<><strong style={{ color: "#e2e8f0" }}>Total Daily Dose (TDD)</strong> is the total amount of insulin you inject in a day — basal (background) + bolus (mealtime) combined.<br /><br />Example: if you take 18u of Glargine at night and roughly 18u of NovoRapid across meals, your TDD is 36u.<br /><br />Your doctor or diabetes team will have given you this number. If unsure, check your prescription or logbook.</>} />
          </div>
          <input type="number" inputMode="decimal" value={form.tdd} onChange={e => upd("tdd", e.target.value)} placeholder="e.g. 36"
            style={{ width: "100%", background: "#0f172a", border: "1px solid #1e293b", borderRadius: 10, padding: "12px 14px", color: "#e2e8f0", fontSize: 16, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
            onFocus={e => { e.target.style.borderColor = "#6366f1"; e.target.scrollIntoView({ behavior: "smooth", block: "center" }); }}
            onBlur={e => e.target.style.borderColor = "#1e293b"}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: "#64748b", marginBottom: 5, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Insulin-to-Carb Ratio (I:C)
            <Tooltip content={<><strong style={{ color: "#e2e8f0" }}>Insulin-to-Carb Ratio (I:C)</strong> tells you how many grams of carbohydrates 1 unit of insulin will cover.<br /><br />Example: a ratio of 1:13 means 1 unit covers 13g of carbs. So if your meal has 52g of carbs, you'd take 4 units.<br /><br />Your doctor sets this. Some people need different ratios for breakfast vs dinner — dawn hormones make mornings harder to control.</>} />
          </div>
          <div style={{ fontSize: 11, color: "#334155", marginBottom: 10 }}>How many grams of carbs does 1 unit cover?</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            {[true, false].map(v => (
              <button key={String(v)} onClick={() => setSameICR(v)} style={{ flex: 1, padding: "8px", borderRadius: 8, border: "1px solid", borderColor: sameICR === v ? "#00b896" : "#1e293b", background: sameICR === v ? "rgba(0,184,150,0.12)" : "#0f172a", color: sameICR === v ? "#00b896" : "#475569", fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: sameICR === v ? 700 : 400 }}>
                {v ? "Same all day" : "Different per meal"}
              </button>
            ))}
          </div>
          {sameICR ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 13, color: "#64748b" }}>1 unit covers</span>
              <input type="number" inputMode="decimal" value={form.icr_breakfast} onChange={e => upd("icr_breakfast", e.target.value)} placeholder="13"
                style={{ width: 70, background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, padding: "10px", color: "#00b896", fontSize: 16, fontFamily: "inherit", outline: "none", textAlign: "center" }}
                onFocus={e => { e.target.style.borderColor = "#00b896"; e.target.scrollIntoView({ behavior: "smooth", block: "center" }); }} onBlur={e => e.target.style.borderColor = "#1e293b"}
              />
              <span style={{ fontSize: 13, color: "#64748b" }}>g of carbs</span>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[["Breakfast", "icr_breakfast"], ["Lunch", "icr_lunch"], ["Dinner", "icr_dinner"], ["Snack", "icr_snack"]].map(([label, key]) => (
                <div key={key}>
                  <div style={{ fontSize: 10, color: "#475569", marginBottom: 4 }}>{label}</div>
                  <input type="number" inputMode="decimal" value={form[key]} onChange={e => upd(key, e.target.value)} placeholder="13"
                    style={{ width: "100%", background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, padding: "9px", color: "#00b896", fontSize: 15, fontFamily: "inherit", outline: "none", textAlign: "center", boxSizing: "border-box" }}
                    onFocus={e => { e.target.style.borderColor = "#00b896"; e.target.scrollIntoView({ behavior: "smooth", block: "center" }); }} onBlur={e => e.target.style.borderColor = "#1e293b"}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        <ProfileInp label="Target Blood Glucose (mg/dL)" k="target" ph="110" value={form.target} onChange={e => upd("target", e.target.value)} />
        <ProfileInp label="Pre-bolus time (minutes)" k="prebolus" ph="15" hint="How many minutes before eating do you inject?" value={form.prebolus} onChange={e => upd("prebolus", e.target.value)} />
        {error && <div style={{ color: "#ef4444", fontSize: 12, marginBottom: 12 }}>{error}</div>}
        <button onClick={save} style={{ width: "100%", padding: "16px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#00b896,#6366f1)", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
          Save & Start →
        </button>
        <div style={{ marginTop: 14, fontSize: 11, color: "#1e293b", textAlign: "center" }}>⚠️ Estimates only. Always verify doses with your diabetes care team.</div>
      </div>
    </div>
  );
}

// ─── Export helper ─────────────────────────────────────────────────────────────
function exportCSV(history) {
  const header = "Date,Time,Type,Carbs (g),BG (mg/dL),Carb Dose (u),Correction (u),Total Dose (u),Meal\n";
  const rows = history.map(h => {
    const d = h.timestamp ? new Date(h.timestamp) : new Date();
    const date = d.toLocaleDateString("en-IN");
    const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const meal = (h.items || []).map(i => `${i.qty}x ${i.name}`).join(" + ");
    return `${date},${time},${h.mode || h.mealType},${h.totalCarbs},${h.bg},${h.carbDose},${h.correctionDose},${h.totalDose},"${meal}"`;
  }).join("\n");
  const blob = new Blob([header + rows], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "carbcalc_history.csv"; a.click();
  URL.revokeObjectURL(url);
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [profile, setProfile] = useState(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState("calc"); // calc | history | presets
  const [mode, setMode] = useState("meal");
  const [inputMode, setInputMode] = useState("search");
  const [step, setStep] = useState("input");
  const [items, setItems] = useState([blankItem()]);
  const [manualCarbs, setManualCarbs] = useState("");
  const [currentBG, setCurrentBG] = useState("");
  const [mealType, setMealType] = useState(getMealType());
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [presets, setPresets] = useState([]);
  const [savedBanner, setSavedBanner] = useState(false);

  useEffect(() => {
    try {
      const p = localStorage.getItem("carbcalc_profile");
      const h = localStorage.getItem("carbcalc_history_v3");
      const pr = localStorage.getItem("carbcalc_presets");
      if (p) setProfile(JSON.parse(p));
      if (h) setHistory(JSON.parse(h));
      if (pr) setPresets(JSON.parse(pr));
    } catch {}
    setProfileLoaded(true);
  }, []);

  useEffect(() => { setItems([blankItem()]); }, [mode]);

  const saveHistory = (res) => {
    try {
      const updated = [res, ...history].slice(0, 60);
      setHistory(updated);
      localStorage.setItem("carbcalc_history_v3", JSON.stringify(updated));
    } catch {}
  };

  const savePreset = (res) => {
    const preset = { id: Date.now(), name: `${res.mealType.charAt(0).toUpperCase() + res.mealType.slice(1)} — ${res.totalCarbs}g`, items: res.items, totalCarbs: res.totalCarbs, mode: res.mode, mealType: res.mealType };
    const updated = [preset, ...presets].slice(0, 20);
    setPresets(updated);
    try { localStorage.setItem("carbcalc_presets", JSON.stringify(updated)); } catch {}
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 2500);
  };

  const deletePreset = (id) => {
    const updated = presets.filter(p => p.id !== id);
    setPresets(updated);
    try { localStorage.setItem("carbcalc_presets", JSON.stringify(updated)); } catch {}
  };

  const loadPreset = (preset) => {
    setMode(preset.mode || "meal");
    setMealType(preset.mealType || getMealType());
    setInputMode("manual");
    setManualCarbs(String(preset.totalCarbs));
    setActiveTab("calc");
  };

  if (!profileLoaded) return null;
  if (!profile || showSettings) return <ProfileSetup onSave={p => { setProfile(p); setShowSettings(false); }} existing={showSettings ? profile : null} />;

  const DB = mode === "snack" ? SNACKS_DB : mode === "drinks" ? DRINKS_DB : MEALS_DB;
  const filtered = (idx) => {
    const q = items[idx]?.search?.toLowerCase() || "";
    if (!q) return DB.slice(0, 8);
    return DB.filter(f => f.name.toLowerCase().includes(q));
  };

  const addItem = () => setItems(p => [...p, blankItem()]);
  const removeItem = (idx) => { if (items.length > 1) setItems(p => p.filter((_, i) => i !== idx)); };
  const upd = (idx, patch) => setItems(p => p.map((it, i) => i === idx ? { ...it, ...patch } : it));
  const selectFood = (idx, food) => upd(idx, { food, customCarbs: food.carbs, customName: food.name, search: food.name, open: false });

  const searchTotalCarbs = items.reduce((s, it) => s + (it.food ? it.customCarbs * it.qty : 0), 0);
  const totalCarbs = inputMode === "manual" ? (parseFloat(manualCarbs) || 0) : searchTotalCarbs;
  const hasHighGI = inputMode === "search" && items.some(i => i.food?.gi === "high");

  const calculate = () => {
    if (!currentBG || totalCarbs === 0) return;
    const bg = parseFloat(currentBG);
    const icr = profile.icr[mealType] || 13;
    const carbDose = totalCarbs / icr;
    const correctionDose = (bg - profile.target) / profile.cf;
    const totalDose = roundHalf(Math.max(carbDose + correctionDose, 0));
    const res = {
      totalCarbs: Math.round(totalCarbs), carbDose: roundHalf(carbDose),
      correctionDose: roundHalf(correctionDose), totalDose, bg, mealType, mode, icr,
      highGIWarning: hasHighGI, crashRisk: correctionDose < 0,
      timestamp: Date.now(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      date: new Date().toLocaleDateString("en-IN"),
      items: inputMode === "manual"
        ? [{ name: "Manual entry", qty: 1, carbs: totalCarbs }]
        : items.filter(i => i.food).map(i => ({ name: i.customName, qty: i.qty, carbs: i.customCarbs * i.qty })),
      profile: profile.name,
    };
    setResult(res);
    setStep("confirm"); // go to confirm screen first
  };

  const confirm = () => {
    saveHistory(result);
    setStep("result");
  };

  const reset = () => {
    setStep("input"); setResult(null); setCurrentBG(""); setMealType(getMealType());
    setItems([blankItem()]); setManualCarbs("");
  };

  const L = (s) => ({ fontSize: 11, color: "#64748b", marginBottom: 8, letterSpacing: "0.1em", textTransform: "uppercase" });

  return (
    <div style={{ minHeight: "100vh", background: "#0a0e1a", backgroundImage: "radial-gradient(ellipse at 20% 50%,rgba(0,180,150,0.07) 0%,transparent 60%),radial-gradient(ellipse at 80% 20%,rgba(99,102,241,0.08) 0%,transparent 50%)", fontFamily: "'DM Mono','Fira Code','Courier New',monospace", color: "#e2e8f0", display: "flex", flexDirection: "column", alignItems: "center" }}>

      {/* Header */}
      <div style={{ width: "100%", maxWidth: 520, padding: "24px 24px 0", boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#00b896,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>💉</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>Carb Calc</div>
            <div style={{ fontSize: 11, color: "#64748b" }}>Hey {profile.name} · TDD {profile.tdd}u · Target {profile.target}</div>
          </div>
          <button onClick={() => setShowSettings(true)} style={{ marginLeft: "auto", background: "none", border: "1px solid #1e293b", borderRadius: 8, padding: "6px 10px", color: "#475569", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>⚙ Profile</button>
        </div>

        {/* Nav tabs */}
        <div style={{ display: "flex", gap: 4, marginTop: 16, background: "#0f172a", borderRadius: 10, padding: 4 }}>
          {[["calc", "💉 Calculate"], ["history", "📈 History"], ["presets", "⚡ Presets"]].map(([id, label]) => (
            <button key={id} onClick={() => setActiveTab(id)} style={{ flex: 1, padding: "8px 4px", borderRadius: 7, border: "none", background: activeTab === id ? "#1e293b" : "transparent", color: activeTab === id ? "#e2e8f0" : "#334155", fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: activeTab === id ? 700 : 400, transition: "all 0.15s" }}>{label}</button>
          ))}
        </div>
        <div style={{ height: 1, background: "linear-gradient(90deg,#00b89640,transparent)", marginTop: 16, marginBottom: 20 }} />
      </div>

      <div style={{ width: "100%", maxWidth: 520, padding: "0 24px 40px", boxSizing: "border-box" }}>

        {/* ── HISTORY TAB ── */}
        {activeTab === "history" && (
          <div>
            <HistoryChart history={history} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={L()}>All Calculations</div>
              {history.length > 0 && (
                <button onClick={() => exportCSV(history)} style={{ background: "none", border: "1px solid #1e293b", borderRadius: 7, padding: "5px 10px", color: "#475569", fontSize: 10, cursor: "pointer", fontFamily: "inherit" }}>⬇ Export CSV</button>
              )}
            </div>
            {history.length === 0 && <div style={{ textAlign: "center", color: "#334155", fontSize: 12, marginTop: 32 }}>No calculations yet</div>}
            {history.slice(0, 20).map((h, i) => (
              <div key={i} style={{ background: "#0f172a", borderRadius: 10, border: "1px solid #1e293b", padding: "12px 14px", marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: "#334155" }}>{h.timestamp ? fmtDate(h.timestamp) : h.date} {h.timestamp ? fmtTime(h.timestamp) : h.time}</span>
                  <span style={{ fontSize: 11, color: "#475569", textTransform: "capitalize" }}>{h.mode} · {h.mealType}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#00b896" }}>{h.totalDose}u</span>
                </div>
                <div style={{ display: "flex", gap: 16, fontSize: 11 }}>
                  <span style={{ color: "#475569" }}>Carbs: <span style={{ color: "#94a3b8" }}>{h.totalCarbs}g</span></span>
                  <span style={{ color: "#475569" }}>BG: <span style={{ color: "#94a3b8" }}>{h.bg}</span></span>
                  <span style={{ color: "#475569" }}>Corr: <span style={{ color: h.correctionDose >= 0 ? "#f59e0b" : "#22c55e" }}>{h.correctionDose >= 0 ? "+" : ""}{h.correctionDose}u</span></span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── PRESETS TAB ── */}
        {activeTab === "presets" && (
          <div>
            <div style={{ background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 10, padding: "12px 14px", marginBottom: 16, fontSize: 12, color: "#94a3b8", lineHeight: 1.6 }}>
              ⚡ Presets are your saved meals. After calculating, tap <strong style={{ color: "#a5b4fc" }}>Save as preset</strong> on the result screen to save it here for quick reuse.
            </div>
            {presets.length === 0 && <div style={{ textAlign: "center", color: "#334155", fontSize: 12, marginTop: 32 }}>No presets saved yet</div>}
            {presets.map(preset => (
              <div key={preset.id} style={{ background: "#0f172a", borderRadius: 10, border: "1px solid #1e293b", padding: "12px 14px", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 700, marginBottom: 3 }}>{preset.name}</div>
                  <div style={{ fontSize: 11, color: "#475569", textTransform: "capitalize" }}>{preset.mode} · {preset.totalCarbs}g carbs</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => loadPreset(preset)} style={{ background: "rgba(0,184,150,0.12)", border: "1px solid rgba(0,184,150,0.3)", borderRadius: 7, padding: "6px 12px", color: "#00b896", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>Use</button>
                  <button onClick={() => deletePreset(preset.id)} style={{ background: "none", border: "1px solid #1e293b", borderRadius: 7, padding: "6px 10px", color: "#ef4444", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>✕</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── CALCULATOR TAB ── */}
        {activeTab === "calc" && (
          <div>
            {step === "input" && (
              <div>
                <ActiveInsulinBanner history={history} />

                {/* Mode toggle */}
                <div style={{ marginBottom: 20 }}>
                  <div style={L()}>Session Type</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {[{ id: "meal", label: "🍽 Meal" }, { id: "snack", label: "🧃 Snack" }, { id: "drinks", label: "🥤 Drinks" }].map(({ id, label }) => (
                      <button key={id} onClick={() => setMode(id)} style={{ flex: 1, padding: "9px 4px", borderRadius: 8, border: "1px solid", borderColor: mode === id ? "#00b896" : "#1e293b", background: mode === id ? "rgba(0,184,150,0.12)" : "#0f172a", color: mode === id ? "#00b896" : "#475569", fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: mode === id ? 700 : 400, transition: "all 0.15s" }}>{label}</button>
                    ))}
                  </div>
                </div>

                {/* Meal slot */}
                {mode === "meal" && (
                  <div style={{ marginBottom: 20 }}>
                    <div style={L()}>Meal</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {["breakfast", "lunch", "dinner"].map(m => (
                        <button key={m} onClick={() => setMealType(m)} style={{ flex: 1, padding: "8px 4px", borderRadius: 8, border: "1px solid", borderColor: mealType === m ? "#00b896" : "#1e293b", background: mealType === m ? "rgba(0,184,150,0.12)" : "#0f172a", color: mealType === m ? "#00b896" : "#475569", fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: mealType === m ? 700 : 400, transition: "all 0.15s", textTransform: "capitalize" }}>{m}</button>
                      ))}
                    </div>
                    {profile.icr.breakfast !== profile.icr.lunch || profile.icr.breakfast !== profile.icr.dinner ? (
                      <div style={{ marginTop: 8, fontSize: 11, color: "#334155" }}>
                        I:C for {mealType}: <span style={{ color: "#00b896" }}>1:{profile.icr[mealType]}</span>
                      </div>
                    ) : null}
                  </div>
                )}

                {/* Input mode toggle */}
                <div style={{ marginBottom: 16 }}>
                  <div style={L()}>How do you want to enter carbs?</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {[{ id: "search", label: "🔍 Search food" }, { id: "manual", label: "✏️ Enter grams" }].map(({ id, label }) => (
                      <button key={id} onClick={() => setInputMode(id)} style={{ flex: 1, padding: "9px 4px", borderRadius: 8, border: "1px solid", borderColor: inputMode === id ? "#6366f1" : "#1e293b", background: inputMode === id ? "rgba(99,102,241,0.12)" : "#0f172a", color: inputMode === id ? "#a5b4fc" : "#475569", fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: inputMode === id ? 700 : 400, transition: "all 0.15s" }}>{label}</button>
                    ))}
                  </div>
                </div>

                {/* Manual carb entry */}
                {inputMode === "manual" && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={L()}>Total carbohydrates (grams)</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: "14px 16px" }}
                      onFocus={e => e.currentTarget.style.borderColor = "#6366f1"} onBlur={e => e.currentTarget.style.borderColor = "#1e293b"}
                    >
                      <input type="number" min="0" value={manualCarbs} onChange={e => setManualCarbs(e.target.value)} placeholder="e.g. 60"
                        style={{ flex: 1, background: "none", border: "none", color: "#00b896", fontSize: 28, fontFamily: "inherit", outline: "none", fontWeight: 700 }}
                      />
                      <span style={{ fontSize: 14, color: "#475569" }}>grams</span>
                    </div>
                    <div style={{ fontSize: 11, color: "#334155", marginTop: 6 }}>Enter total carbs from a food label or your own estimate</div>
                  </div>
                )}

                {/* Search items */}
                {inputMode === "search" && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={L()}>{mode === "snack" ? "What are you snacking on?" : mode === "drinks" ? "What are you drinking?" : "What are you eating?"}</div>
                    {items.map((item, idx) => (
                      <div key={idx} style={{ marginBottom: 10, background: "#0f172a", borderRadius: 12, border: "1px solid #1e293b", padding: "12px 14px" }}>
                        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: item.food ? 8 : 0 }}>
                          <div style={{ flex: 1, position: "relative" }}>
                            <input value={item.search || ""} onChange={e => upd(idx, { search: e.target.value, open: true, food: null })} onFocus={() => upd(idx, { open: true })}
                              placeholder={mode === "drinks" ? "Search drink..." : mode === "snack" ? "Search snack..." : "Search food..."}
                              style={{ width: "100%", background: "#1e293b", border: "1px solid #334155", borderRadius: 8, padding: "8px 10px", color: "#e2e8f0", fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
                            />
                            {item.open && (
                              <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 100, background: "#1e293b", border: "1px solid #334155", borderRadius: 8, maxHeight: 200, overflowY: "auto", marginTop: 2 }}>
                                {filtered(idx).map((food, fi) => (
                                  <div key={fi} onMouseDown={() => selectFood(idx, food)}
                                    style={{ padding: "8px 12px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #0f172a", fontSize: 12 }}
                                    onMouseEnter={e => e.currentTarget.style.background = "#0f172a"}
                                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                  >
                                    <span style={{ color: "#cbd5e1" }}>{food.name}</span>
                                    <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                      <span style={{ color: "#64748b", fontSize: 11 }}>{food.carbs}g/{food.unit}</span>
                                      <span style={{ fontSize: 9, padding: "2px 5px", borderRadius: 4, background: GI_COLORS[food.gi] + "22", color: GI_COLORS[food.gi] }}>{GI_LABELS[food.gi]}</span>
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <input type="number" min="0.5" step="0.5" value={item.qty} onChange={e => upd(idx, { qty: parseFloat(e.target.value) || 0 })}
                            style={{ width: 52, background: "#1e293b", border: "1px solid #334155", borderRadius: 8, padding: "8px", color: "#e2e8f0", fontSize: 13, fontFamily: "inherit", outline: "none", textAlign: "center" }}
                          />
                          {items.length > 1 && <button onClick={() => removeItem(idx)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 16, padding: "0 4px" }}>×</button>}
                        </div>
                        {item.food && (
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ fontSize: 11, color: "#475569" }}>Carbs per {item.food.unit}:</div>
                            <input type="number" min="0" value={item.customCarbs} onChange={e => upd(idx, { customCarbs: parseFloat(e.target.value) || 0 })}
                              style={{ width: 60, background: "#0a0e1a", border: "1px solid #334155", borderRadius: 6, padding: "4px 8px", color: "#00b896", fontSize: 12, fontFamily: "inherit", outline: "none", textAlign: "center" }}
                            />
                            <span style={{ fontSize: 11, color: "#475569" }}>g</span>
                            <span style={{ marginLeft: "auto", fontSize: 12, color: "#e2e8f0", fontWeight: 700 }}>= {Math.round(item.customCarbs * item.qty)}g</span>
                            {item.food.gi !== "unknown" && <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: GI_COLORS[item.food.gi] + "22", color: GI_COLORS[item.food.gi] }}>{GI_LABELS[item.food.gi]}</span>}
                          </div>
                        )}
                      </div>
                    ))}
                    <button onClick={addItem} style={{ width: "100%", padding: "9px", borderRadius: 8, border: "1px dashed #1e293b", background: "transparent", color: "#334155", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "#00b896"; e.currentTarget.style.color = "#00b896"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e293b"; e.currentTarget.style.color = "#334155"; }}
                    >+ Add another item</button>
                  </div>
                )}

                {totalCarbs > 0 && (
                  <div style={{ background: "rgba(0,184,150,0.07)", border: "1px solid rgba(0,184,150,0.2)", borderRadius: 10, padding: "10px 14px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: "#64748b" }}>Total carbs</span>
                    <span style={{ fontSize: 18, fontWeight: 700, color: "#00b896" }}>{Math.round(totalCarbs)}g</span>
                  </div>
                )}

                <div style={{ marginBottom: 20 }}>
                  <div style={L()}>Current Blood Glucose (mg/dL)</div>
                  <input type="number" inputMode="decimal" min="40" max="500" value={currentBG} onChange={e => setCurrentBG(e.target.value)} placeholder="e.g. 140"
                    style={{ width: "100%", background: "#0f172a", border: "1px solid #1e293b", borderRadius: 10, padding: "14px 16px", color: "#e2e8f0", fontSize: 20, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
                    onFocus={e => { e.target.style.borderColor = "#6366f1"; e.target.scrollIntoView({ behavior: "smooth", block: "center" }); }} onBlur={e => e.target.style.borderColor = "#1e293b"}
                  />
                  {currentBG && (
                    <div style={{ marginTop: 6, fontSize: 11, color: parseFloat(currentBG) < 70 ? "#ef4444" : parseFloat(currentBG) > 180 ? "#f59e0b" : "#22c55e" }}>
                      {parseFloat(currentBG) < 70 ? "⚠️ Low — treat hypo before eating" : parseFloat(currentBG) > 250 ? "⚠️ Very high — consider correction-only first" : parseFloat(currentBG) > 180 ? "↑ Above target" : "✓ In range"}
                    </div>
                  )}
                </div>

                <button onClick={calculate} disabled={!currentBG || totalCarbs === 0} style={{ width: "100%", padding: "16px", borderRadius: 12, border: "none", background: (!currentBG || totalCarbs === 0) ? "#1e293b" : "linear-gradient(135deg,#00b896,#6366f1)", color: (!currentBG || totalCarbs === 0) ? "#334155" : "#fff", fontSize: 15, fontWeight: 700, cursor: (!currentBG || totalCarbs === 0) ? "not-allowed" : "pointer", fontFamily: "inherit", letterSpacing: "0.05em", transition: "all 0.2s" }}>
                  CALCULATE DOSE →
                </button>
              </div>
            )}

            {step === "confirm" && result && (
              <div>
                <div style={{ background: "#0f172a", borderRadius: 16, border: "1px solid #1e293b", padding: "32px 24px", marginBottom: 16, textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 6 }}>Calculated dose</div>
                  <div style={{ fontSize: 80, fontWeight: 700, color: "#00b896", lineHeight: 1, letterSpacing: "-3px" }}>{result.totalDose}</div>
                  <div style={{ fontSize: 16, color: "#64748b", marginTop: 4, marginBottom: 20 }}>units of NovoRapid</div>
                  <div style={{ display: "flex", gap: 10, fontSize: 12, justifyContent: "center", marginBottom: 24 }}>
                    <span style={{ background: "#1e293b", borderRadius: 8, padding: "6px 12px", color: "#94a3b8" }}>{result.totalCarbs}g carbs</span>
                    <span style={{ background: "#1e293b", borderRadius: 8, padding: "6px 12px", color: "#94a3b8" }}>BG {result.bg} mg/dL</span>
                    <span style={{ background: "#1e293b", borderRadius: 8, padding: "6px 12px", color: "#94a3b8" }}>1:{result.icr} ratio</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#475569", marginBottom: 20, lineHeight: 1.6 }}>
                    Please double-check this dose before injecting.<br />
                    <span style={{ color: "#334155" }}>Tap confirm when ready.</span>
                  </div>
                  <button onClick={confirm} style={{ width: "100%", padding: "16px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#00b896,#6366f1)", color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.05em", marginBottom: 10 }}>
                    ✓ Confirm & inject {result.totalDose}u
                  </button>
                  <button onClick={reset} style={{ width: "100%", padding: "12px", borderRadius: 12, border: "1px solid #1e293b", background: "transparent", color: "#475569", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                    ← Go back & recalculate
                  </button>
                </div>
                <div style={{ fontSize: 11, color: "#334155", textAlign: "center", lineHeight: 1.6 }}>
                  ⚠️ Estimates only. Always verify with your diabetes care team.
                </div>
              </div>
            )}

            {step === "result" && result && (
              <div>
                {savedBanner && (
                  <div style={{ background: "rgba(0,184,150,0.12)", border: "1px solid rgba(0,184,150,0.3)", borderRadius: 10, padding: "10px 14px", marginBottom: 12, fontSize: 12, color: "#00b896", textAlign: "center" }}>
                    ✓ Saved as preset!
                  </div>
                )}

                <div style={{ background: "linear-gradient(135deg,rgba(0,184,150,0.12),rgba(99,102,241,0.12))", border: "1px solid rgba(0,184,150,0.3)", borderRadius: 16, padding: "28px 24px", marginBottom: 16, textAlign: "center" }}>
                  <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4, letterSpacing: "0.1em", textTransform: "uppercase" }}>NovoRapid Dose</div>
                  <div style={{ fontSize: 64, fontWeight: 700, color: "#00b896", lineHeight: 1, letterSpacing: "-2px" }}>{result.totalDose}</div>
                  <div style={{ fontSize: 16, color: "#94a3b8", marginTop: 4 }}>units</div>
                  <div style={{ marginTop: 16, fontSize: 12, color: "#475569" }}>
                    💉 Inject now → eat in <span style={{ color: "#00b896", fontWeight: 700 }}>{profile.prebolus} min</span>
                  </div>
                </div>

                {/* Save as preset button */}
                <button onClick={() => savePreset(result)} style={{ width: "100%", padding: "11px", borderRadius: 10, border: "1px solid rgba(99,102,241,0.3)", background: "rgba(99,102,241,0.08)", color: "#a5b4fc", fontSize: 13, cursor: "pointer", fontFamily: "inherit", marginBottom: 12 }}>
                  ⚡ Save as preset
                </button>

                <div style={{ background: "#0f172a", borderRadius: 12, border: "1px solid #1e293b", padding: "16px", marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: "#64748b", marginBottom: 12, letterSpacing: "0.1em", textTransform: "uppercase" }}>Breakdown</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {[["Total carbs", `${result.totalCarbs}g`], [`I:C ratio (${result.mealType})`, `1:${result.icr}`]].map(([l, v]) => (
                      <div key={l} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                        <span style={{ color: "#64748b" }}>{l}</span><span style={{ color: "#e2e8f0" }}>{v}</span>
                      </div>
                    ))}
                    <div style={{ height: 1, background: "#1e293b" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                      <span style={{ color: "#64748b" }}>Carb dose</span><span style={{ color: "#e2e8f0" }}>+{result.carbDose}u</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                      <span style={{ color: "#64748b" }}>Correction ({result.bg} → {profile.target})</span>
                      <span style={{ color: result.correctionDose >= 0 ? "#f59e0b" : "#22c55e" }}>{result.correctionDose >= 0 ? "+" : ""}{result.correctionDose}u</span>
                    </div>
                    <div style={{ height: 1, background: "#1e293b" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 700 }}>
                      <span style={{ color: "#94a3b8" }}>Total</span><span style={{ color: "#00b896" }}>{result.totalDose}u</span>
                    </div>
                  </div>
                </div>

                <div style={{ background: "#0f172a", borderRadius: 12, border: "1px solid #1e293b", padding: "14px", marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: "#64748b", marginBottom: 10, letterSpacing: "0.1em", textTransform: "uppercase" }}>Consumed</div>
                  {result.items.map((item, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                      <span style={{ color: "#94a3b8" }}>{item.qty}× {item.name}</span>
                      <span style={{ color: "#475569" }}>{Math.round(item.carbs)}g</span>
                    </div>
                  ))}
                </div>

                {result.highGIWarning && (
                  <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 10, padding: "12px 14px", marginBottom: 10, fontSize: 12 }}>
                    <span style={{ color: "#ef4444", fontWeight: 700 }}>⚠ High GI meal detected</span>
                    <div style={{ color: "#94a3b8", marginTop: 4 }}>Glucose may spike faster than insulin peaks. Consider pre-bolusing 20 min instead of {profile.prebolus}, or eating protein/fat first.</div>
                  </div>
                )}
                {result.crashRisk && (
                  <div style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 10, padding: "12px 14px", marginBottom: 10, fontSize: 12 }}>
                    <span style={{ color: "#22c55e", fontWeight: 700 }}>↓ BG below target</span>
                    <div style={{ color: "#94a3b8", marginTop: 4 }}>No correction needed — carb dose only. Watch for post-meal crash.</div>
                  </div>
                )}
                {result.bg < 70 && (
                  <div style={{ background: "rgba(239,68,68,0.15)", border: "1px solid #ef4444", borderRadius: 10, padding: "12px 14px", marginBottom: 10, fontSize: 12 }}>
                    <span style={{ color: "#ef4444", fontWeight: 700 }}>🚨 Hypo — treat first!</span>
                    <div style={{ color: "#fca5a5", marginTop: 4 }}>Eat 15g fast carbs, wait 15 min, recheck before any insulin.</div>
                  </div>
                )}

                <button onClick={reset} style={{ width: "100%", padding: "14px", borderRadius: 12, border: "1px solid #1e293b", background: "#0f172a", color: "#94a3b8", fontSize: 14, cursor: "pointer", fontFamily: "inherit", marginTop: 4 }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "#334155"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "#1e293b"}
                >← New Calculation</button>
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: 32, fontSize: 10, color: "#1e293b", textAlign: "center", lineHeight: 1.6 }}>
          ⚠️ Estimates only. Always verify doses with your diabetes care team.<br />
          CF ~{profile.cf} mg/dL/u · Target {profile.target} · TDD {profile.tdd}u
        </div>
      </div>
    </div>
  );
}
