import { useState, useEffect } from "react";

// ─── Personal Profile ─────────────────────────────────────────────────────────
const PROFILE = {
  basal: "Glargine", bolus: "NovoRapid",
  dailyBasal: 18, tdd: 36,
  icr: { breakfast: 13, lunch: 13, dinner: 13, snack: 13 },
  correctionFactor: Math.round(1800 / 36),
  targetGlucose: 110, preBolusMinutes: 15,
  highGIWarning: true, crashRisk: true,
};

// ─── Food databases ───────────────────────────────────────────────────────────
const MEALS_DB = [
  { name: "White Rice (cooked)", carbs: 28, unit: "100g", gi: "high" },
  { name: "Brown Rice (cooked)", carbs: 23, unit: "100g", gi: "medium" },
  { name: "Roti / Chapati", carbs: 25, unit: "piece", gi: "medium" },
  { name: "Paratha (plain)", carbs: 30, unit: "piece", gi: "medium" },
  { name: "Puri", carbs: 22, unit: "piece", gi: "high" },
  { name: "Idli", carbs: 18, unit: "piece", gi: "medium" },
  { name: "Dosa (plain)", carbs: 30, unit: "piece", gi: "high" },
  { name: "Upma (1 cup)", carbs: 35, unit: "serving", gi: "medium" },
  { name: "Poha (1 cup)", carbs: 40, unit: "serving", gi: "medium" },
  { name: "Dal (1 cup cooked)", carbs: 20, unit: "serving", gi: "low" },
  { name: "Rajma (1 cup)", carbs: 22, unit: "serving", gi: "low" },
  { name: "Chole (1 cup)", carbs: 24, unit: "serving", gi: "low" },
  { name: "Biryani (1 cup)", carbs: 45, unit: "serving", gi: "high" },
  { name: "Fried Rice (1 cup)", carbs: 40, unit: "serving", gi: "high" },
  { name: "Naan", carbs: 35, unit: "piece", gi: "high" },
  { name: "Bread (white)", carbs: 15, unit: "slice", gi: "high" },
  { name: "Bread (brown)", carbs: 12, unit: "slice", gi: "medium" },
  { name: "Oats (cooked, 1 cup)", carbs: 27, unit: "serving", gi: "low" },
  { name: "Potato (boiled, 100g)", carbs: 20, unit: "100g", gi: "high" },
  { name: "Banana (medium)", carbs: 25, unit: "piece", gi: "medium" },
  { name: "Mango (1 cup)", carbs: 28, unit: "serving", gi: "high" },
  { name: "Apple (medium)", carbs: 20, unit: "piece", gi: "low" },
  { name: "Milk (1 cup)", carbs: 12, unit: "serving", gi: "low" },
  { name: "Yogurt / Curd (1 cup)", carbs: 10, unit: "serving", gi: "low" },
  { name: "Custom item", carbs: 0, unit: "manual", gi: "unknown" },
];

const SNACKS_DB = [
  { name: "Biscuits (2 pcs)", carbs: 14, unit: "serving", gi: "high" },
  { name: "Marie biscuits (4 pcs)", carbs: 20, unit: "serving", gi: "high" },
  { name: "Glucose biscuits (4 pcs)", carbs: 22, unit: "serving", gi: "high" },
  { name: "Mathri (2 pcs)", carbs: 16, unit: "serving", gi: "medium" },
  { name: "Namkeen / Mixture (30g)", carbs: 18, unit: "serving", gi: "medium" },
  { name: "Chakli (3 pcs)", carbs: 15, unit: "serving", gi: "medium" },
  { name: "Samosa (1 piece)", carbs: 25, unit: "piece", gi: "high" },
  { name: "Kachori (1 piece)", carbs: 28, unit: "piece", gi: "high" },
  { name: "Dhokla (2 pcs)", carbs: 18, unit: "serving", gi: "medium" },
  { name: "Popcorn (1 cup)", carbs: 12, unit: "cup", gi: "medium" },
  { name: "Peanuts (30g)", carbs: 6, unit: "serving", gi: "low" },
  { name: "Cashews (30g)", carbs: 9, unit: "serving", gi: "low" },
  { name: "Almonds (30g)", carbs: 6, unit: "serving", gi: "low" },
  { name: "Mixed nuts (30g)", carbs: 7, unit: "serving", gi: "low" },
  { name: "Fruit chaat (1 cup)", carbs: 22, unit: "cup", gi: "medium" },
  { name: "Banana chips (30g)", carbs: 18, unit: "serving", gi: "high" },
  { name: "Dates (2 pcs)", carbs: 18, unit: "serving", gi: "high" },
  { name: "Granola bar", carbs: 25, unit: "bar", gi: "medium" },
  { name: "Corn chaat (1 cup)", carbs: 28, unit: "cup", gi: "medium" },
  { name: "Sprouts (1 cup)", carbs: 14, unit: "cup", gi: "low" },
  { name: "Bread + peanut butter", carbs: 20, unit: "serving", gi: "medium" },
  { name: "Rusk (2 pcs)", carbs: 18, unit: "serving", gi: "high" },
  { name: "Sev (30g)", carbs: 17, unit: "serving", gi: "high" },
  { name: "Makhana (30g)", carbs: 20, unit: "serving", gi: "low" },
  { name: "Ladoo (1 piece)", carbs: 22, unit: "piece", gi: "high" },
  { name: "Halwa (2 tbsp)", carbs: 20, unit: "serving", gi: "high" },
  { name: "Custom snack", carbs: 0, unit: "manual", gi: "unknown" },
];

const GI_COLORS = { high: "#ef4444", medium: "#f59e0b", low: "#22c55e", unknown: "#94a3b8" };
const GI_LABELS = { high: "High GI", medium: "Med GI", low: "Low GI", unknown: "?" };

function getMealType() {
  const h = new Date().getHours();
  if (h >= 5 && h < 11) return "breakfast";
  if (h >= 11 && h < 16) return "lunch";
  if (h >= 16 && h < 19) return "snack";
  return "dinner";
}
function roundHalf(n) { return Math.round(n * 2) / 2; }

function blankItem() {
  return { food: null, qty: 1, customCarbs: 0, customName: "", search: "", open: false };
}

export default function App() {
  const [mode, setMode] = useState("meal");
  const [step, setStep] = useState("input");
  const [items, setItems] = useState([blankItem()]);
  const [currentBG, setCurrentBG] = useState("");
  const [mealType, setMealType] = useState(getMealType());
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  const DB = mode === "snack" ? SNACKS_DB : MEALS_DB;

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("carbcalc_history");
      if (saved) setHistory(JSON.parse(saved));
    } catch {}
  }, []);

  // Reset items when mode changes
  useEffect(() => {
    setItems([blankItem()]);
  }, [mode]);

  const filtered = (idx) => {
    const q = items[idx]?.search?.toLowerCase() || "";
    if (!q) return DB.slice(0, 8);
    return DB.filter(f => f.name.toLowerCase().includes(q));
  };

  const addItem = () => setItems(p => [...p, blankItem()]);
  const removeItem = (idx) => { if (items.length > 1) setItems(p => p.filter((_, i) => i !== idx)); };
  const upd = (idx, patch) => setItems(p => p.map((it, i) => i === idx ? { ...it, ...patch } : it));
  const selectFood = (idx, food) =>
    upd(idx, { food, customCarbs: food.carbs, customName: food.name, search: food.name, open: false });

  const totalCarbs = items.reduce((sum, item) => sum + (item.food ? item.customCarbs * item.qty : 0), 0);
  const hasHighGI = items.some(i => i.food?.gi === "high");

  const calculate = () => {
    if (!currentBG || totalCarbs === 0) return;
    const bg = parseFloat(currentBG);
    const icr = PROFILE.icr[mealType] || 13;
    const carbDose = totalCarbs / icr;
    const correctionDose = (bg - PROFILE.targetGlucose) / PROFILE.correctionFactor;
    const totalDose = roundHalf(Math.max(carbDose + correctionDose, 0));
    const res = {
      totalCarbs: Math.round(totalCarbs), carbDose: roundHalf(carbDose),
      correctionDose: roundHalf(correctionDose), totalDose, bg, mealType, mode,
      highGIWarning: hasHighGI && PROFILE.highGIWarning,
      crashRisk: correctionDose < 0 && PROFILE.crashRisk,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      date: new Date().toLocaleDateString(),
      items: items.filter(i => i.food).map(i => ({ name: i.customName, qty: i.qty, carbs: i.customCarbs * i.qty })),
    };
    setResult(res);
    setStep("result");
    try {
      const updated = [res, ...history].slice(0, 10);
      setHistory(updated);
      localStorage.setItem("carbcalc_history", JSON.stringify(updated));
    } catch {}
  };

  const reset = () => {
    setStep("input"); setResult(null); setCurrentBG(""); setMealType(getMealType());
    setItems([blankItem()]);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0e1a", backgroundImage: "radial-gradient(ellipse at 20% 50%, rgba(0,180,150,0.07) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(99,102,241,0.08) 0%, transparent 50%)", fontFamily: "'DM Mono', 'Fira Code', 'Courier New', monospace", color: "#e2e8f0", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ width: "100%", maxWidth: 520, padding: "28px 24px 0", boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #00b896, #6366f1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>💉</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.5px", color: "#fff" }}>Carb Calc</div>
            <div style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.05em" }}>NovoRapid · TDD 36u · I:C 1:13 · Target {PROFILE.targetGlucose}</div>
          </div>
          <div style={{ marginLeft: "auto", fontSize: 11, color: "#334155", textAlign: "right" }}>Pre-bolus<br /><span style={{ color: "#00b896", fontWeight: 700 }}>{PROFILE.preBolusMinutes} min</span></div>
        </div>
        <div style={{ height: 1, background: "linear-gradient(90deg, #00b89640, transparent)", marginTop: 16, marginBottom: 20 }} />
      </div>

      <div style={{ width: "100%", maxWidth: 520, padding: "0 24px 40px", boxSizing: "border-box" }}>
        {step === "input" && (
          <div>
            {/* Mode toggle */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 8, letterSpacing: "0.1em", textTransform: "uppercase" }}>Session Type</div>
              <div style={{ display: "flex", gap: 8 }}>
                {[{ id: "meal", label: "🍽 Meal" }, { id: "snack", label: "🧃 Snack" }].map(({ id, label }) => (
                  <button key={id} onClick={() => setMode(id)} style={{
                    flex: 1, padding: "10px 4px", borderRadius: 8, border: "1px solid",
                    borderColor: mode === id ? "#00b896" : "#1e293b",
                    background: mode === id ? "rgba(0,184,150,0.12)" : "#0f172a",
                    color: mode === id ? "#00b896" : "#475569",
                    fontSize: 13, cursor: "pointer", fontFamily: "inherit",
                    fontWeight: mode === id ? 700 : 400, transition: "all 0.15s",
                  }}>{label}</button>
                ))}
              </div>
            </div>

            {/* Meal slot */}
            {mode === "meal" && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, color: "#64748b", marginBottom: 8, letterSpacing: "0.1em", textTransform: "uppercase" }}>Meal</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {["breakfast", "lunch", "dinner"].map(m => (
                    <button key={m} onClick={() => setMealType(m)} style={{
                      flex: 1, padding: "8px 4px", borderRadius: 8, border: "1px solid",
                      borderColor: mealType === m ? "#00b896" : "#1e293b",
                      background: mealType === m ? "rgba(0,184,150,0.12)" : "#0f172a",
                      color: mealType === m ? "#00b896" : "#475569",
                      fontSize: 12, cursor: "pointer", fontFamily: "inherit",
                      fontWeight: mealType === m ? 700 : 400, transition: "all 0.15s", textTransform: "capitalize",
                    }}>{m}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Food items */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 8, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                {mode === "snack" ? "What are you snacking on?" : "What are you eating?"}
              </div>
              {items.map((item, idx) => (
                <div key={idx} style={{ marginBottom: 10, background: "#0f172a", borderRadius: 12, border: "1px solid #1e293b", padding: "12px 14px" }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: item.food ? 8 : 0 }}>
                    <div style={{ flex: 1, position: "relative" }}>
                      <input
                        value={item.search || ""}
                        onChange={e => upd(idx, { search: e.target.value, open: true, food: null })}
                        onFocus={() => upd(idx, { open: true })}
                        placeholder={mode === "snack" ? "Search snack..." : "Search food..."}
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
                    <input type="number" min="0.5" step="0.5" value={item.qty}
                      onChange={e => upd(idx, { qty: parseFloat(e.target.value) || 0 })}
                      style={{ width: 52, background: "#1e293b", border: "1px solid #334155", borderRadius: 8, padding: "8px 8px", color: "#e2e8f0", fontSize: 13, fontFamily: "inherit", outline: "none", textAlign: "center" }}
                    />
                    {items.length > 1 && (
                      <button onClick={() => removeItem(idx)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 16, padding: "0 4px" }}>×</button>
                    )}
                  </div>
                  {item.food && (
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ fontSize: 11, color: "#475569" }}>Carbs per {item.food.unit}:</div>
                      <input type="number" min="0" value={item.customCarbs}
                        onChange={e => upd(idx, { customCarbs: parseFloat(e.target.value) || 0 })}
                        style={{ width: 60, background: "#0a0e1a", border: "1px solid #334155", borderRadius: 6, padding: "4px 8px", color: "#00b896", fontSize: 12, fontFamily: "inherit", outline: "none", textAlign: "center" }}
                      />
                      <span style={{ fontSize: 11, color: "#475569" }}>g</span>
                      <span style={{ marginLeft: "auto", fontSize: 12, color: "#e2e8f0", fontWeight: 700 }}>= {Math.round(item.customCarbs * item.qty)}g</span>
                      {item.food.gi !== "unknown" && (
                        <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: GI_COLORS[item.food.gi] + "22", color: GI_COLORS[item.food.gi] }}>{GI_LABELS[item.food.gi]}</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
              <button onClick={addItem} style={{ width: "100%", padding: "9px", borderRadius: 8, border: "1px dashed #1e293b", background: "transparent", color: "#334155", fontSize: 12, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#00b896"; e.currentTarget.style.color = "#00b896"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e293b"; e.currentTarget.style.color = "#334155"; }}
              >+ Add another item</button>
            </div>

            {/* Carb total */}
            {totalCarbs > 0 && (
              <div style={{ background: "rgba(0,184,150,0.07)", border: "1px solid rgba(0,184,150,0.2)", borderRadius: 10, padding: "10px 14px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "#64748b" }}>Total carbs</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: "#00b896" }}>{Math.round(totalCarbs)}g</span>
              </div>
            )}

            {/* BG input */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 8, letterSpacing: "0.1em", textTransform: "uppercase" }}>Current Blood Glucose (mg/dL)</div>
              <input type="number" min="40" max="500" value={currentBG}
                onChange={e => setCurrentBG(e.target.value)}
                placeholder="e.g. 140"
                style={{ width: "100%", background: "#0f172a", border: "1px solid #1e293b", borderRadius: 10, padding: "14px 16px", color: "#e2e8f0", fontSize: 20, fontFamily: "inherit", outline: "none", boxSizing: "border-box", letterSpacing: "0.05em" }}
                onFocus={e => e.target.style.borderColor = "#6366f1"}
                onBlur={e => e.target.style.borderColor = "#1e293b"}
              />
              {currentBG && (
                <div style={{ marginTop: 6, fontSize: 11, color: parseFloat(currentBG) < 70 ? "#ef4444" : parseFloat(currentBG) > 180 ? "#f59e0b" : "#22c55e" }}>
                  {parseFloat(currentBG) < 70 ? "⚠️ Low — treat hypo before eating" : parseFloat(currentBG) > 250 ? "⚠️ Very high — consider correction-only first" : parseFloat(currentBG) > 180 ? "↑ Above target" : "✓ In range"}
                </div>
              )}
            </div>

            {/* Calculate button */}
            <button onClick={calculate} disabled={!currentBG || totalCarbs === 0} style={{
              width: "100%", padding: "16px", borderRadius: 12, border: "none",
              background: (!currentBG || totalCarbs === 0) ? "#1e293b" : "linear-gradient(135deg, #00b896, #6366f1)",
              color: (!currentBG || totalCarbs === 0) ? "#334155" : "#fff",
              fontSize: 15, fontWeight: 700, cursor: (!currentBG || totalCarbs === 0) ? "not-allowed" : "pointer",
              fontFamily: "inherit", letterSpacing: "0.05em", transition: "all 0.2s",
            }}>CALCULATE DOSE →</button>

            {/* History */}
            {history.length > 0 && (
              <div style={{ marginTop: 32 }}>
                <div style={{ fontSize: 11, color: "#334155", marginBottom: 10, letterSpacing: "0.1em", textTransform: "uppercase" }}>Recent</div>
                {history.slice(0, 3).map((h, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #0f172a", fontSize: 12 }}>
                    <span style={{ color: "#334155" }}>{h.date} {h.time}</span>
                    <span style={{ color: "#475569", textTransform: "capitalize" }}>{h.mode || h.mealType}</span>
                    <span style={{ color: "#475569" }}>{h.totalCarbs}g · BG {h.bg}</span>
                    <span style={{ color: "#00b896", fontWeight: 700 }}>{h.totalDose}u</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── RESULT ── */}
        {step === "result" && result && (
          <div>
            <div style={{ background: "linear-gradient(135deg, rgba(0,184,150,0.12), rgba(99,102,241,0.12))", border: "1px solid rgba(0,184,150,0.3)", borderRadius: 16, padding: "28px 24px", marginBottom: 16, textAlign: "center" }}>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4, letterSpacing: "0.1em", textTransform: "uppercase" }}>NovoRapid Dose</div>
              <div style={{ fontSize: 64, fontWeight: 700, color: "#00b896", lineHeight: 1, letterSpacing: "-2px" }}>{result.totalDose}</div>
              <div style={{ fontSize: 16, color: "#94a3b8", marginTop: 4 }}>units</div>
              <div style={{ marginTop: 16, fontSize: 12, color: "#475569" }}>
                💉 Inject now → eat in <span style={{ color: "#00b896", fontWeight: 700 }}>{PROFILE.preBolusMinutes} min</span>
              </div>
            </div>

            <div style={{ background: "#0f172a", borderRadius: 12, border: "1px solid #1e293b", padding: "16px", marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 12, letterSpacing: "0.1em", textTransform: "uppercase" }}>Breakdown</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[["Total carbs", `${result.totalCarbs}g`], [`I:C ratio (${result.mealType})`, `1:${PROFILE.icr[result.mealType]}`]].map(([l, v]) => (
                  <div key={l} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: "#64748b" }}>{l}</span><span style={{ color: "#e2e8f0" }}>{v}</span>
                  </div>
                ))}
                <div style={{ height: 1, background: "#1e293b" }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ color: "#64748b" }}>Carb dose</span><span style={{ color: "#e2e8f0" }}>+{result.carbDose}u</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ color: "#64748b" }}>Correction ({result.bg} → {PROFILE.targetGlucose})</span>
                  <span style={{ color: result.correctionDose >= 0 ? "#f59e0b" : "#22c55e" }}>{result.correctionDose >= 0 ? "+" : ""}{result.correctionDose}u</span>
                </div>
                <div style={{ height: 1, background: "#1e293b" }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 700 }}>
                  <span style={{ color: "#94a3b8" }}>Total</span><span style={{ color: "#00b896" }}>{result.totalDose}u</span>
                </div>
              </div>
            </div>

            <div style={{ background: "#0f172a", borderRadius: 12, border: "1px solid #1e293b", padding: "14px", marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 10, letterSpacing: "0.1em", textTransform: "uppercase" }}>Meal</div>
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
                <div style={{ color: "#94a3b8", marginTop: 4 }}>Your glucose may spike faster than insulin peaks. Consider pre-bolusing 20 min instead of 15, or eating protein/fat first.</div>
              </div>
            )}
            {result.crashRisk && (
              <div style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 10, padding: "12px 14px", marginBottom: 10, fontSize: 12 }}>
                <span style={{ color: "#22c55e", fontWeight: 700 }}>↓ BG below target</span>
                <div style={{ color: "#94a3b8", marginTop: 4 }}>No correction needed — carb dose only. Watch for post-meal crash on certain foods.</div>
              </div>
            )}
            {result.bg < 70 && (
              <div style={{ background: "rgba(239,68,68,0.15)", border: "1px solid #ef4444", borderRadius: 10, padding: "12px 14px", marginBottom: 10, fontSize: 12 }}>
                <span style={{ color: "#ef4444", fontWeight: 700 }}>🚨 Hypo — treat first!</span>
                <div style={{ color: "#fca5a5", marginTop: 4 }}>Eat 15g fast carbs, wait 15 min, recheck before taking any insulin.</div>
              </div>
            )}

            <button onClick={reset} style={{ width: "100%", padding: "14px", borderRadius: 12, border: "1px solid #1e293b", background: "#0f172a", color: "#94a3b8", fontSize: 14, cursor: "pointer", fontFamily: "inherit", marginTop: 4 }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "#334155"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#1e293b"}
            >← New Calculation</button>
          </div>
        )}

        <div style={{ marginTop: 32, fontSize: 10, color: "#1e293b", textAlign: "center", lineHeight: 1.6 }}>
          Estimates only. Always verify with your diabetes care team.<br />
          Glargine 18u basal · CF ~50 mg/dL/u · Target 110
        </div>
      </div>
    </div>
  );
}
