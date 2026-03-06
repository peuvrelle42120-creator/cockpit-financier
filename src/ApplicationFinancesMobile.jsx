import React, { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
} from "recharts";
import {
  Wallet,
  PiggyBank,
  Target,
  TrendingUp,
  Car,
  Utensils,
  Home,
  Wrench,
  Smile,
  Download,
  Upload,
  Trash2,
  Search,
  Pencil,
} from "lucide-react";

const categories = [
  "Nourriture",
  "Carburant",
  "Logement",
  "Entretien véhicule",
  "Santé",
  "Plaisirs",
  "Loisirs",
  "Abonnements",
  "Matériel",
  "Divers",
];

const monthNames = ["janv.","févr.","mars","avr.","mai","juin","juil.","août","sept.","oct.","nov.","déc."];
const categoryIcons = { Nourriture: Utensils, Carburant: Car, Logement: Home, "Entretien véhicule": Wrench, Santé: Smile, Loisirs: Smile, Plaisirs: Smile };
const initialTransactions = [
  { id: 1, date: "2026-03-01", type: "Revenu", nature: "Nécessaire", categorie: "Divers", description: "Mission ponctuelle", montant: 750 },
  { id: 2, date: "2026-03-02", type: "Dépense", nature: "Nécessaire", categorie: "Nourriture", description: "Courses", montant: 48 },
  { id: 3, date: "2026-03-03", type: "Dépense", nature: "Nécessaire", categorie: "Carburant", description: "Plein", montant: 82 },
  { id: 4, date: "2026-03-04", type: "Dépense", nature: "Plaisir", categorie: "Plaisirs", description: "Café + sortie", montant: 14 },
  { id: 5, date: "2026-03-05", type: "Dépense", nature: "Nécessaire", categorie: "Abonnements", description: "Téléphone", montant: 20 },
];
const money = (v) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(v || 0);
const monthLabel = (d) => monthNames[new Date(d).getMonth()] ?? "?";
const yearLabel = (d) => String(new Date(d).getFullYear());
const downloadJson = (filename, data) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
};
const Card = ({ children, className = "" }) => <div className={`card ${className}`}>{children}</div>;
const CardHeader = ({ children }) => <div className="card-header">{children}</div>;
const CardTitle = ({ children }) => <h3 className="card-title">{children}</h3>;
const CardContent = ({ children, className = "" }) => <div className={`card-content ${className}`}>{children}</div>;
const Progress = ({ value = 0 }) => <div className="progress"><div className="progress-bar" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div>;
const Button = ({ children, onClick, variant = "default", className = "", type = "button" }) => <button type={type} onClick={onClick} className={`btn btn-${variant} ${className}`}>{children}</button>;
const Input = (props) => <input {...props} className={`input ${props.className || ""}`} />;
const Label = ({ children }) => <label className="label">{children}</label>;
const Badge = ({ children }) => <span className="badge">{children}</span>;

export default function ApplicationFinancesMobile() {
  const [transactions, setTransactions] = useState(() => { try { const raw = localStorage.getItem("finances-mobile-transactions"); return raw ? JSON.parse(raw) : initialTransactions; } catch { return initialTransactions; } });
  const [objectifCapital, setObjectifCapital] = useState(() => Number(localStorage.getItem("finances-mobile-objectif")) || 20000);
  const [capitalActuel, setCapitalActuel] = useState(() => Number(localStorage.getItem("finances-mobile-capital")) || 2500);
  const [monthlyBudget, setMonthlyBudget] = useState(() => Number(localStorage.getItem("finances-mobile-budget")) || 1200);
  const [foodBudget, setFoodBudget] = useState(() => Number(localStorage.getItem("finances-mobile-budget-food")) || 300);
  const [fuelBudget, setFuelBudget] = useState(() => Number(localStorage.getItem("finances-mobile-budget-fuel")) || 250);
  const [funBudget, setFunBudget] = useState(() => Number(localStorage.getItem("finances-mobile-budget-fun")) || 150);
  const [activeTab, setActiveTab] = useState("tableau");
  const [isFoldMode, setIsFoldMode] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [form, setForm] = useState({ date: "2026-03-06", type: "Dépense", nature: "Nécessaire", categorie: "Nourriture", description: "", montant: "" });
  const [batchRows, setBatchRows] = useState([{ id: 1, montant: "", categorie: "Nourriture", nature: "Nécessaire", description: "" }, { id: 2, montant: "", categorie: "Carburant", nature: "Nécessaire", description: "" }]);
  const [quickTab, setQuickTab] = useState("simple");
  const [historySearch, setHistorySearch] = useState("");
  const [historyMonth, setHistoryMonth] = useState("all");
  const [historyCategory, setHistoryCategory] = useState("all");
  const [historyNature, setHistoryNature] = useState("all");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => { localStorage.setItem("finances-mobile-transactions", JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem("finances-mobile-objectif", String(objectifCapital)); }, [objectifCapital]);
  useEffect(() => { localStorage.setItem("finances-mobile-capital", String(capitalActuel)); }, [capitalActuel]);
  useEffect(() => { localStorage.setItem("finances-mobile-budget", String(monthlyBudget)); }, [monthlyBudget]);
  useEffect(() => { localStorage.setItem("finances-mobile-budget-food", String(foodBudget)); }, [foodBudget]);
  useEffect(() => { localStorage.setItem("finances-mobile-budget-fuel", String(fuelBudget)); }, [fuelBudget]);
  useEffect(() => { localStorage.setItem("finances-mobile-budget-fun", String(funBudget)); }, [funBudget]);
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => { e.preventDefault(); setInstallPrompt(e); };
    const handleResize = () => { const width = window.innerWidth; const height = window.innerHeight; setIsFoldMode(width >= 900 || (width > height && width >= 760)); };
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt); window.addEventListener("resize", handleResize); setOfflineReady(true); handleResize();
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/service-worker.js").catch(() => {});
    return () => { window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt); window.removeEventListener("resize", handleResize); };
  }, []);

  const stats = useMemo(() => {
    const revenus = transactions.filter((t) => t.type === "Revenu").reduce((s, t) => s + t.montant, 0);
    const depenses = transactions.filter((t) => t.type === "Dépense").reduce((s, t) => s + t.montant, 0);
    const necessaire = transactions.filter((t) => t.type === "Dépense" && t.nature === "Nécessaire").reduce((s, t) => s + t.montant, 0);
    const plaisir = transactions.filter((t) => t.type === "Dépense" && t.nature === "Plaisir").reduce((s, t) => s + t.montant, 0);
    const solde = revenus - depenses;
    const tauxEpargne = revenus > 0 ? Math.max(0, (solde / revenus) * 100) : 0;
    const score = Math.min(100, Math.round(tauxEpargne));
    const niveau = score < 20 ? "Début" : score < 40 ? "Progression" : score < 60 ? "Stable" : score < 80 ? "Solide" : "Expert";
    const coutJour = depenses / 30;
    const autonomie = coutJour > 0 ? capitalActuel / coutJour / 30 : 0;
    const progression = objectifCapital > 0 ? Math.min(100, Math.round((capitalActuel / objectifCapital) * 100)) : 0;
    const depensesVsBudget = monthlyBudget > 0 ? Math.min(200, Math.round((depenses / monthlyBudget) * 100)) : 0;
    const foodSpent = transactions.filter((t) => t.type === "Dépense" && t.categorie === "Nourriture").reduce((s, t) => s + t.montant, 0);
    const fuelSpent = transactions.filter((t) => t.type === "Dépense" && t.categorie === "Carburant").reduce((s, t) => s + t.montant, 0);
    const funSpent = transactions.filter((t) => t.type === "Dépense" && t.categorie === "Plaisirs").reduce((s, t) => s + t.montant, 0);
    const foodRemaining = foodBudget - foodSpent;
    const fuelRemaining = fuelBudget - fuelSpent;
    const funRemaining = funBudget - funSpent;
    const fuelPerDay = fuelSpent / 30;
    const fuelShareOfBudget = monthlyBudget > 0 ? (fuelSpent / monthlyBudget) * 100 : 0;
    const byCategoryMap = new Map(); transactions.filter((t) => t.type === "Dépense").forEach((t) => byCategoryMap.set(t.categorie, (byCategoryMap.get(t.categorie) || 0) + t.montant));
    const byCategory = Array.from(byCategoryMap.entries()).map(([name, value]) => ({ name, value }));
    const byMonthMap = new Map(); const byYearMap = new Map();
    transactions.forEach((t) => {
      const monthKey = monthLabel(t.date); const monthCurrent = byMonthMap.get(monthKey) || { periode: monthKey, revenus: 0, depenses: 0, solde: 0 };
      if (t.type === "Revenu") monthCurrent.revenus += t.montant; else monthCurrent.depenses += t.montant; monthCurrent.solde = monthCurrent.revenus - monthCurrent.depenses; byMonthMap.set(monthKey, monthCurrent);
      const yearKey = yearLabel(t.date); const yearCurrent = byYearMap.get(yearKey) || { periode: yearKey, revenus: 0, depenses: 0, solde: 0 };
      if (t.type === "Revenu") yearCurrent.revenus += t.montant; else yearCurrent.depenses += t.montant; yearCurrent.solde = yearCurrent.revenus - yearCurrent.depenses; byYearMap.set(yearKey, yearCurrent);
    });
    const byMonth = Array.from(byMonthMap.values()); const byYear = Array.from(byYearMap.values());
    const monthlyGoalEstimate = solde > 0 ? Math.max(0, Math.ceil((objectifCapital - capitalActuel) / solde)) : null;
    return { revenus, depenses, necessaire, plaisir, solde, tauxEpargne, score, niveau, coutJour, autonomie, progression, depensesVsBudget, byCategory, byMonth, byYear, monthlyGoalEstimate, foodRemaining, fuelRemaining, funRemaining, fuelPerDay, fuelShareOfBudget };
  }, [transactions, capitalActuel, objectifCapital, monthlyBudget, foodBudget, fuelBudget, funBudget]);

  const filteredTransactions = useMemo(() => transactions.filter((t) => {
    const matchSearch = historySearch.trim() ? `${t.description} ${t.categorie} ${t.nature}`.toLowerCase().includes(historySearch.toLowerCase()) : true;
    const matchMonth = historyMonth === "all" ? true : monthLabel(t.date) === historyMonth;
    const matchCategory = historyCategory === "all" ? true : t.categorie === historyCategory;
    const matchNature = historyNature === "all" ? true : t.nature === historyNature;
    return matchSearch && matchMonth && matchCategory && matchNature;
  }), [transactions, historySearch, historyMonth, historyCategory, historyNature]);

  const addTransaction = () => { const montant = Number(form.montant); if (!form.description || !montant) return; setTransactions((prev) => [{ id: Date.now(), ...form, montant }, ...prev]); setForm((f) => ({ ...f, description: "", montant: "" })); };
  const updateBatchRow = (id, key, value) => setBatchRows((prev) => prev.map((row) => (row.id === id ? { ...row, [key]: value } : row)));
  const addBatchRow = () => setBatchRows((prev) => [...prev, { id: Date.now(), montant: "", categorie: "Divers", nature: "Nécessaire", description: "" }]);
  const removeBatchRow = (id) => setBatchRows((prev) => prev.length <= 1 ? prev : prev.filter((row) => row.id !== id));
  const saveBatchRows = () => {
    const validRows = batchRows.map((row) => ({ id: Date.now() + Math.random(), date: form.date, type: "Dépense", nature: row.nature, categorie: row.categorie, description: row.description, montant: Number(row.montant) })).filter((row) => row.description && row.montant > 0);
    if (!validRows.length) return; setTransactions((prev) => [...validRows.reverse(), ...prev]);
    setBatchRows([{ id: 1, montant: "", categorie: "Nourriture", nature: "Nécessaire", description: "" }, { id: 2, montant: "", categorie: "Carburant", nature: "Nécessaire", description: "" }]);
  };
  const deleteTransaction = (id) => setTransactions((prev) => prev.filter((t) => t.id !== id));
  const startEditTransaction = (t) => { setEditingId(t.id); setQuickTab("simple"); setActiveTab("ajout"); setForm({ date: t.date, type: t.type, nature: t.nature, categorie: t.categorie, description: t.description, montant: String(t.montant) }); };
  const saveEditedTransaction = () => { const montant = Number(form.montant); if (!editingId || !form.description || !montant) return; setTransactions((prev) => prev.map((t) => (t.id === editingId ? { ...t, ...form, montant } : t))); setEditingId(null); setForm((f) => ({ ...f, description: "", montant: "" })); };
  const resetDemo = () => { setTransactions(initialTransactions); setCapitalActuel(2500); setObjectifCapital(20000); setMonthlyBudget(1200); setFoodBudget(300); setFuelBudget(250); setFunBudget(150); };
  const importJson = (event) => { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = (e) => { try { const parsed = JSON.parse(String(e.target?.result || "[]")); if (Array.isArray(parsed)) setTransactions(parsed); } catch {} }; reader.readAsText(file); };
  const installApp = async () => { if (!installPrompt) return; await installPrompt.prompt(); setInstallPrompt(null); };

  return <div className="app-shell"><div className={`container ${isFoldMode ? "wide" : ""}`}>
    <Card><CardContent><div className="row-between"><div><div className="muted">Application mobile de finances</div><h1 className="main-title">Cockpit financier</h1></div><div className="iconbox lg"><Wallet size={24} /></div></div><div className="row gap mt12 wrap"><Badge>{offlineReady ? "Hors ligne prêt" : "Chargement"}</Badge>{installPrompt && <Button onClick={installApp}>Installer l'application</Button>}</div></CardContent></Card>
    <div className={`grid ${isFoldMode ? "grid-4" : "grid-2-4"} gap`}>
      <Card><CardContent><div className="muted tiny">Revenus</div><div className="value">{money(stats.revenus)}</div></CardContent></Card>
      <Card><CardContent><div className="muted tiny">Dépenses</div><div className="value">{money(stats.depenses)}</div></CardContent></Card>
      <Card><CardContent><div className="muted tiny">Solde</div><div className="value">{money(stats.solde)}</div></CardContent></Card>
      <Card><CardContent><div className="muted tiny">Coût / jour</div><div className="value">{money(stats.coutJour)}</div></CardContent></Card>
    </div>
    <div className="tabs">{[["tableau","Tableau"],["ajout","Ajouter"],["budget","Budget"],["motivation","Motivation"],["historique","Historique"],["annuel","Annuel"]].map(([k,l]) => <button key={k} className={activeTab===k?"tab active":"tab"} onClick={()=>setActiveTab(k)}>{l}</button>)}</div>
    {activeTab === "tableau" && <div className="stack">
      {!isFoldMode && <div className="stack"><Card><CardContent><div className="row-between"><div><div className="muted tiny">Vue rapide</div><div className="big-number">{money(stats.solde)}</div></div><Button onClick={()=>{setQuickTab("simple");setActiveTab("ajout");}}>Ajouter</Button></div><div className="muted tiny mt8">Priorité budget : nourriture, carburant, plaisirs.</div></CardContent></Card><div className="grid grid-3"><Card><CardContent><div className="muted tiny">Nourriture restant</div><div className="value-sm">{money(stats.foodRemaining)}</div></CardContent></Card><Card><CardContent><div className="muted tiny">Carburant restant</div><div className="value-sm">{money(stats.fuelRemaining)}</div></CardContent></Card><Card><CardContent><div className="muted tiny">Plaisirs restant</div><div className="value-sm">{money(stats.funRemaining)}</div></CardContent></Card></div></div>}
      {isFoldMode && <Card className="border-dashed"><CardContent><div className="row-between"><div><div className="medium">Mode pliable actif</div><div className="muted">L'interface profite du grand écran du Galaxy Z Fold.</div></div><Badge>Grand écran</Badge></div></CardContent></Card>}
      <Card><CardHeader><CardTitle>Vue mensuelle</CardTitle></CardHeader><CardContent className="chart"><ResponsiveContainer width="100%" height="100%"><LineChart data={stats.byMonth}><XAxis dataKey="periode" /><YAxis /><Tooltip formatter={(v)=>money(Number(v))} /><Line type="monotone" dataKey="solde" stroke="#111827" strokeWidth={3} dot={{ r: 4 }} /></LineChart></ResponsiveContainer></CardContent></Card>
      <div className={`grid ${isFoldMode ? "grid-3" : "grid-1-2"} gap`}><Card><CardHeader><CardTitle>Nécessaire / plaisir</CardTitle></CardHeader><CardContent className="chart"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={[{ name: "Nécessaire", value: stats.necessaire }, { name: "Plaisir", value: stats.plaisir }]} dataKey="value" nameKey="name" outerRadius={85}><Cell fill="#111827" /><Cell fill="#9ca3af" /></Pie><Tooltip formatter={(v)=>money(Number(v))} /></PieChart></ResponsiveContainer></CardContent></Card><Card><CardHeader><CardTitle>Dépenses par catégorie</CardTitle></CardHeader><CardContent className="chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={stats.byCategory}><XAxis dataKey="name" angle={-15} textAnchor="end" height={60} /><YAxis /><Tooltip formatter={(v)=>money(Number(v))} /><Bar dataKey="value" fill="#111827" radius={[10,10,0,0]} /></BarChart></ResponsiveContainer></CardContent></Card></div>
      <Card><CardHeader><CardTitle>Dernières opérations</CardTitle></CardHeader><CardContent className="stack">{transactions.slice(0,8).map((t)=>{const Icon = categoryIcons[t.categorie] || PiggyBank; return <div key={t.id} className="tx"><div className="tx-left"><div className="iconbox"><Icon size={16} /></div><div><div className="medium">{t.description}</div><div className="muted tiny">{t.categorie} • {t.nature} • {t.date}</div></div></div><div className="tx-right"><div className="value-sm">{t.type==="Dépense"?"-":"+"}{money(t.montant)}</div><div className="muted tiny">{t.type}</div></div></div>})}</CardContent></Card>
    </div>}
    {activeTab === "ajout" && <div className={`stack ${isFoldMode ? "two-col" : ""}`}><Card><CardHeader><div className="row-between"><CardTitle>Ajouter des opérations</CardTitle><div className="segmented"><button className={quickTab==="simple"?"seg active":"seg"} onClick={()=>setQuickTab("simple")}>Simple</button><button className={quickTab==="multiple"?"seg active":"seg"} onClick={()=>setQuickTab("multiple")}>Multiple</button></div></div></CardHeader><CardContent className="stack"><div><Label>Date</Label><Input type="date" value={form.date} onChange={(e)=>setForm({...form,date:e.target.value})} /></div>{quickTab === "simple" ? <><div className="grid grid-2"><div><Label>Type</Label><select className="input" value={form.type} onChange={(e)=>setForm({...form,type:e.target.value})}><option>Revenu</option><option>Dépense</option></select></div><div><Label>Nature</Label><select className="input" value={form.nature} onChange={(e)=>setForm({...form,nature:e.target.value})}><option>Nécessaire</option><option>Plaisir</option></select></div></div><div><Label>Catégorie</Label><select className="input" value={form.categorie} onChange={(e)=>setForm({...form,categorie:e.target.value})}>{categories.map((c)=><option key={c}>{c}</option>)}</select></div><div><Label>Description</Label><Input value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})} placeholder="Ex. courses, plein, mission..." /></div><div><Label>Montant (€)</Label><Input type="number" value={form.montant} onChange={(e)=>setForm({...form,montant:e.target.value})} placeholder="0" /></div>{editingId ? <Button onClick={saveEditedTransaction}>Mettre à jour</Button> : <Button onClick={addTransaction}>Enregistrer</Button>}</> : <div className="stack">{batchRows.map((row,index)=><div key={row.id} className="subcard"><div className="row-between"><div className="medium">Ligne {index+1}</div><Button variant="ghost" onClick={()=>removeBatchRow(row.id)}><Trash2 size={16} /></Button></div><div className="grid grid-2"><div><Label>Catégorie</Label><select className="input" value={row.categorie} onChange={(e)=>updateBatchRow(row.id,"categorie",e.target.value)}>{categories.map((c)=><option key={c}>{c}</option>)}</select></div><div><Label>Nature</Label><select className="input" value={row.nature} onChange={(e)=>updateBatchRow(row.id,"nature",e.target.value)}><option>Nécessaire</option><option>Plaisir</option></select></div></div><div><Label>Description</Label><Input value={row.description} onChange={(e)=>updateBatchRow(row.id,"description",e.target.value)} placeholder="Ex. courses, plein..." /></div><div><Label>Montant (€)</Label><Input type="number" value={row.montant} onChange={(e)=>updateBatchRow(row.id,"montant",e.target.value)} placeholder="0" /></div></div>)}<div className="grid grid-2"><Button variant="outline" onClick={addBatchRow}>Ajouter une ligne</Button><Button onClick={saveBatchRows}>Enregistrer le lot</Button></div></div>}</CardContent></Card><Card><CardHeader><CardTitle>Import / export</CardTitle></CardHeader><CardContent className="stack"><Button variant="outline" onClick={()=>downloadJson("transactions-finances.json", transactions)}><Download size={16} /> Exporter</Button><label className="upload"><Upload size={16} /> Importer JSON<input type="file" accept="application/json" onChange={importJson} hidden /></label><Button variant="danger" onClick={resetDemo}><Trash2 size={16} /> Réinitialiser</Button></CardContent></Card></div>}
    {activeTab === "budget" && <div className={`stack ${isFoldMode ? "two-col" : ""}`}><Card><CardHeader><CardTitle>Pilotage du budget mensuel</CardTitle></CardHeader><CardContent className="stack"><div><Label>Budget mensuel (€)</Label><Input type="number" value={monthlyBudget} onChange={(e)=>setMonthlyBudget(Number(e.target.value || 0))} /></div><div className="grid grid-3"><div><Label>Budget nourriture (€)</Label><Input type="number" value={foodBudget} onChange={(e)=>setFoodBudget(Number(e.target.value || 0))} /></div><div><Label>Budget carburant (€)</Label><Input type="number" value={fuelBudget} onChange={(e)=>setFuelBudget(Number(e.target.value || 0))} /></div><div><Label>Budget plaisirs (€)</Label><Input type="number" value={funBudget} onChange={(e)=>setFunBudget(Number(e.target.value || 0))} /></div></div><div><Label>Capital actuel (€)</Label><Input type="number" value={capitalActuel} onChange={(e)=>setCapitalActuel(Number(e.target.value || 0))} /></div><div><Label>Objectif capital (€)</Label><Input type="number" value={objectifCapital} onChange={(e)=>setObjectifCapital(Number(e.target.value || 0))} /></div><div className="subcard"><div className="row-between"><span>Progression épargne</span><strong>{stats.progression}%</strong></div><div className="progress"><div className="progress-bar" style={{ width: `${Math.max(0, Math.min(100, stats.progression))}%` }} /></div><div className="muted">{money(capitalActuel)} sur {money(objectifCapital)}</div></div><div className="subcard"><div className="row-between"><span>Consommation du budget</span><strong>{stats.depensesVsBudget}%</strong></div><div className="progress"><div className="progress-bar" style={{ width: `${Math.max(0, Math.min(100, stats.depensesVsBudget))}%` }} /></div><div className="muted">{money(stats.depenses)} dépensés pour un budget de {money(monthlyBudget)}</div></div><div className="grid grid-2"><Card className="soft"><CardContent><div className="muted tiny">Autonomie</div><div className="value-sm">{stats.autonomie.toFixed(1)} mois</div></CardContent></Card><Card className="soft"><CardContent><div className="muted tiny">Taux d'épargne</div><div className="value-sm">{stats.tauxEpargne.toFixed(0)}%</div></CardContent></Card></div><div className="grid grid-3"><Card className="soft"><CardContent><div className="muted tiny">Reste nourriture</div><div className="value-sm">{money(stats.foodRemaining)}</div></CardContent></Card><Card className="soft"><CardContent><div className="muted tiny">Reste carburant</div><div className="value-sm">{money(stats.fuelRemaining)}</div></CardContent></Card><Card className="soft"><CardContent><div className="muted tiny">Reste plaisirs</div><div className="value-sm">{money(stats.funRemaining)}</div></CardContent></Card></div><div className="subcard"><div className="muted tiny">Mobilité</div><div className="medium">Carburant / jour : {money(stats.fuelPerDay)}</div><div className="muted">Part du budget : {stats.fuelShareOfBudget.toFixed(0)}%</div></div></CardContent></Card></div>}
    {activeTab === "motivation" && <div className={`stack ${isFoldMode ? "two-col" : ""}`}><Card><CardHeader><CardTitle>Analyse mensuelle vs annuelle</CardTitle></CardHeader><CardContent className="grid grid-2"><div className="subcard"><div className="muted tiny">Vue mensuelle</div><div className="value-sm">{money((stats.byMonth.at(-1)?.depenses || 0))}</div><div className="muted">Dernier mois enregistré</div></div><div className="subcard"><div className="muted tiny">Vue annuelle</div><div className="value-sm">{money(stats.depenses)}</div><div className="muted">Cumul sur l'année</div></div></CardContent></Card><Card className={isFoldMode ? "full-height" : ""}><div className="hero"><div><div className="hero-label">Niveau financier</div><div className="hero-title">{stats.niveau}</div></div><Target size={32} /></div><CardContent className="stack"><div><div className="row-between"><span>Score financier</span><Badge>{stats.score}/100</Badge></div><div className="progress"><div className="progress-bar" style={{ width: `${Math.max(0, Math.min(100, stats.score))}%` }} /></div></div><div className="grid grid-2"><div className="subcard"><div className="muted tiny">Dépenses nécessaires</div><div className="value-sm">{money(stats.necessaire)}</div></div><div className="subcard"><div className="muted tiny">Dépenses plaisir</div><div className="value-sm">{money(stats.plaisir)}</div></div></div><div className="subcard"><div className="muted tiny">Objectif estimé</div><div className="value-sm">{stats.monthlyGoalEstimate === null ? "À améliorer" : `${stats.monthlyGoalEstimate} mois`}</div><div className="muted">Estimation basée sur ton solde actuel.</div></div><div className="soft-box"><div className="medium">Message du jour</div><div className="muted">{stats.solde >= 0 ? "Tu es en train de bâtir quelque chose de stable. Le vrai progrès, c'est la répétition des petits gestes qui te renforcent." : "Tu n'as pas besoin d'être parfait. Tu as surtout besoin d'un système clair, honnête, et assez simple pour tenir dans le temps."}</div></div></CardContent></Card></div>}
    {activeTab === "historique" && <div className={`stack ${isFoldMode ? "two-col" : ""}`}><Card><CardHeader><CardTitle>Recherche et filtres</CardTitle></CardHeader><CardContent className="stack"><div className="search-wrap"><Search size={16} className="search-icon" /><Input className="search-input" placeholder="Rechercher une dépense..." value={historySearch} onChange={(e)=>setHistorySearch(e.target.value)} /></div><div className="grid grid-3"><select className="input" value={historyMonth} onChange={(e)=>setHistoryMonth(e.target.value)}><option value="all">Tous les mois</option>{monthNames.map((m)=><option key={m} value={m}>{m}</option>)}</select><select className="input" value={historyCategory} onChange={(e)=>setHistoryCategory(e.target.value)}><option value="all">Toutes les catégories</option>{categories.map((c)=><option key={c} value={c}>{c}</option>)}</select><select className="input" value={historyNature} onChange={(e)=>setHistoryNature(e.target.value)}><option value="all">Toutes les natures</option><option value="Nécessaire">Nécessaire</option><option value="Plaisir">Plaisir</option></select></div></CardContent></Card><Card><CardHeader><CardTitle>Historique</CardTitle></CardHeader><CardContent className="stack scroll-area">{filteredTransactions.map((t)=>{const Icon = categoryIcons[t.categorie] || PiggyBank; return <div key={t.id} className="tx"><div className="tx-left"><div className="iconbox"><Icon size={16} /></div><div><div className="medium">{t.description}</div><div className="muted tiny">{t.categorie} • {t.nature} • {t.date}</div></div></div><div className="tx-right actions"><div className="value-sm">{t.type==="Dépense"?"-":"+"}{money(t.montant)}</div><div className="action-row"><Button variant="ghost" onClick={()=>startEditTransaction(t)}><Pencil size={16} /></Button><Button variant="ghost" onClick={()=>deleteTransaction(t.id)}><Trash2 size={16} /></Button></div></div></div>})}</CardContent></Card></div>}
    {activeTab === "annuel" && <div className={`stack ${isFoldMode ? "two-col" : ""}`}><Card><CardHeader><CardTitle>Analyse annuelle</CardTitle></CardHeader><CardContent className="chart-lg"><ResponsiveContainer width="100%" height="100%"><BarChart data={stats.byYear}><XAxis dataKey="periode" /><YAxis /><Tooltip formatter={(v)=>money(Number(v))} /><Bar dataKey="revenus" fill="#16a34a" radius={[10,10,0,0]} /><Bar dataKey="depenses" fill="#111827" radius={[10,10,0,0]} /></BarChart></ResponsiveContainer></CardContent></Card><Card><CardHeader><CardTitle>Résumé annuel</CardTitle></CardHeader><CardContent className="grid grid-3"><div className="subcard"><div className="muted tiny">Revenus annuels</div><div className="value-sm">{money(stats.revenus)}</div></div><div className="subcard"><div className="muted tiny">Dépenses annuelles</div><div className="value-sm">{money(stats.depenses)}</div></div><div className="subcard"><div className="muted tiny">Solde annuel</div><div className="value-sm">{money(stats.solde)}</div></div></CardContent></Card></div>}
  </div></div>;
}
