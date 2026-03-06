import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line } from "recharts";
import { Wallet, PiggyBank, Target, TrendingUp, PlusCircle, HeartHandshake, Car, Utensils, Home, Wrench, Smile, Download, Upload, Trash2, Search, Pencil } from "lucide-react";

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

const monthNames = [
  "janv.",
  "févr.",
  "mars",
  "avr.",
  "mai",
  "juin",
  "juil.",
  "août",
  "sept.",
  "oct.",
  "nov.",
  "déc.",
];

const categoryIcons = {
  Nourriture: Utensils,
  Carburant: Car,
  Logement: Home,
  "Entretien véhicule": Wrench,
  Santé: HeartHandshake,
  Loisirs: Smile,
  Plaisirs: Smile,
};

const initialTransactions = [
  { id: 1, date: "2026-03-01", type: "Revenu", nature: "Nécessaire", categorie: "Divers", description: "Mission ponctuelle", montant: 750 },
  { id: 2, date: "2026-03-02", type: "Dépense", nature: "Nécessaire", categorie: "Nourriture", description: "Courses", montant: 48 },
  { id: 3, date: "2026-03-03", type: "Dépense", nature: "Nécessaire", categorie: "Carburant", description: "Plein", montant: 82 },
  { id: 4, date: "2026-03-04", type: "Dépense", nature: "Plaisir", categorie: "Plaisirs", description: "Café + sortie", montant: 14 },
  { id: 5, date: "2026-03-05", type: "Dépense", nature: "Nécessaire", categorie: "Abonnements", description: "Téléphone", montant: 20 },
];

function currency(value) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(value || 0);
}

function monthLabel(dateString) {
  const d = new Date(dateString);
  return monthNames[d.getMonth()] ?? "?";
}

function yearLabel(dateString) {
  return new Date(dateString).getFullYear().toString();
}

function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ApplicationFinancesMobile() {
  const [transactions, setTransactions] = useState(() => {
    try {
      const raw = localStorage.getItem("finances-mobile-transactions");
      return raw ? JSON.parse(raw) : initialTransactions;
    } catch {
      return initialTransactions;
    }
  });

  const [objectifCapital, setObjectifCapital] = useState(() => Number(localStorage.getItem("finances-mobile-objectif")) || 20000);
  const [capitalActuel, setCapitalActuel] = useState(() => Number(localStorage.getItem("finances-mobile-capital")) || 2500);
  const [monthlyBudget, setMonthlyBudget] = useState(() => Number(localStorage.getItem("finances-mobile-budget")) || 1200);
  const [foodBudget, setFoodBudget] = useState(() => Number(localStorage.getItem("finances-mobile-budget-food")) || 300);
  const [fuelBudget, setFuelBudget] = useState(() => Number(localStorage.getItem("finances-mobile-budget-fuel")) || 250);
  const [funBudget, setFunBudget] = useState(() => Number(localStorage.getItem("finances-mobile-budget-fun")) || 150);

  const [isFoldMode, setIsFoldMode] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);

  const [form, setForm] = useState({
    date: "2026-03-06",
    type: "Dépense",
    nature: "Nécessaire",
    categorie: "Nourriture",
    description: "",
    montant: "",
  });

  const [batchRows, setBatchRows] = useState([
    { id: 1, montant: "", categorie: "Nourriture", nature: "Nécessaire", description: "" },
    { id: 2, montant: "", categorie: "Carburant", nature: "Nécessaire", description: "" },
  ]);

  const [quickTab, setQuickTab] = useState("simple");
  const [historySearch, setHistorySearch] = useState("");
  const [historyMonth, setHistoryMonth] = useState("all");
  const [historyCategory, setHistoryCategory] = useState("all");
  const [historyNature, setHistoryNature] = useState("all");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    localStorage.setItem("finances-mobile-transactions", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem("finances-mobile-objectif", String(objectifCapital));
  }, [objectifCapital]);

  useEffect(() => {
    localStorage.setItem("finances-mobile-capital", String(capitalActuel));
  }, [capitalActuel]);

  useEffect(() => {
    localStorage.setItem("finances-mobile-budget", String(monthlyBudget));
  }, [monthlyBudget]);

  useEffect(() => {
    localStorage.setItem("finances-mobile-budget-food", String(foodBudget));
  }, [foodBudget]);

  useEffect(() => {
    localStorage.setItem("finances-mobile-budget-fuel", String(fuelBudget));
  }, [fuelBudget]);

  useEffect(() => {
    localStorage.setItem("finances-mobile-budget-fun", String(funBudget));
  }, [funBudget]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    const handleOnline = () => setOfflineReady(true);

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setIsFoldMode(width >= 900 || (width > height && width >= 760));
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("online", handleOnline);
    window.addEventListener("resize", handleResize);

    setOfflineReady(true);
    handleResize();

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("resize", handleResize);
    };
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

    const fuelPerDay = fuelSpent / 30;
    const fuelShareOfBudget = monthlyBudget > 0 ? (fuelSpent / monthlyBudget) * 100 : 0;

    const foodRemaining = foodBudget - foodSpent;
    const fuelRemaining = fuelBudget - fuelSpent;
    const funRemaining = funBudget - funSpent;

    const byCategoryMap = new Map();
    transactions
      .filter((t) => t.type === "Dépense")
      .forEach((t) => {
        byCategoryMap.set(t.categorie, (byCategoryMap.get(t.categorie) || 0) + t.montant);
      });

    const byCategory = Array.from(byCategoryMap.entries()).map(([name, value]) => ({ name, value }));

    const byMonthMap = new Map();
    const byYearMap = new Map();

    transactions.forEach((t) => {
      const monthKey = monthLabel(t.date);
      const monthCurrent = byMonthMap.get(monthKey) || { periode: monthKey, revenus: 0, depenses: 0, solde: 0 };
      if (t.type === "Revenu") monthCurrent.revenus += t.montant;
      else monthCurrent.depenses += t.montant;
      monthCurrent.solde = monthCurrent.revenus - monthCurrent.depenses;
      byMonthMap.set(monthKey, monthCurrent);

      const yearKey = yearLabel(t.date);
      const yearCurrent = byYearMap.get(yearKey) || { periode: yearKey, revenus: 0, depenses: 0, solde: 0 };
      if (t.type === "Revenu") yearCurrent.revenus += t.montant;
      else yearCurrent.depenses += t.montant;
      yearCurrent.solde = yearCurrent.revenus - yearCurrent.depenses;
      byYearMap.set(yearKey, yearCurrent);
    });

    const byMonth = Array.from(byMonthMap.values());
    const byYear = Array.from(byYearMap.values());
    const monthlyGoalEstimate = solde > 0 ? Math.max(0, Math.ceil((objectifCapital - capitalActuel) / solde)) : null;

    return {
      revenus,
      depenses,
      necessaire,
      plaisir,
      solde,
      tauxEpargne,
      score,
      niveau,
      coutJour,
      autonomie,
      progression,
      depensesVsBudget,
      byCategory,
      byMonth,
      byYear,
      monthlyGoalEstimate,
      foodSpent,
      fuelSpent,
      funSpent,
      foodRemaining,
      fuelRemaining,
      funRemaining,
      fuelPerDay,
      fuelShareOfBudget,
    };
  }, [transactions, capitalActuel, objectifCapital, monthlyBudget, foodBudget, fuelBudget, funBudget]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchSearch = historySearch.trim()
        ? `${t.description} ${t.categorie} ${t.nature}`.toLowerCase().includes(historySearch.toLowerCase())
        : true;
      const matchMonth = historyMonth === "all" ? true : monthLabel(t.date) === historyMonth;
      const matchCategory = historyCategory === "all" ? true : t.categorie === historyCategory;
      const matchNature = historyNature === "all" ? true : t.nature === historyNature;
      return matchSearch && matchMonth && matchCategory && matchNature;
    });
  }, [transactions, historySearch, historyMonth, historyCategory, historyNature]);

  const addTransaction = () => {
    const montant = Number(form.montant);
    if (!form.description.trim() || Number.isNaN(montant) || montant <= 0) return;

    setTransactions((prev) => [{ id: Date.now(), ...form, montant }, ...prev]);
    setForm((f) => ({ ...f, description: "", montant: "" }));
    setEditingId(null);
    setQuickTab("simple");
  };

  const updateBatchRow = (id, key, value) => {
    setBatchRows((prev) => prev.map((row) => (row.id === id ? { ...row, [key]: value } : row)));
  };

  const addBatchRow = () => {
    setBatchRows((prev) => [
      ...prev,
      { id: Date.now(), montant: "", categorie: "Divers", nature: "Nécessaire", description: "" },
    ]);
  };

  const removeBatchRow = (id) => {
    setBatchRows((prev) => (prev.length <= 1 ? prev : prev.filter((row) => row.id !== id)));
  };

  const saveBatchRows = () => {
    const validRows = batchRows
      .map((row) => ({
        id: Date.now() + Math.random(),
        date: form.date,
        type: "Dépense",
        nature: row.nature,
        categorie: row.categorie,
        description: row.description,
        montant: Number(row.montant),
      }))
      .filter((row) => row.description && row.montant > 0);

    if (!validRows.length) return;

    setTransactions((prev) => [...validRows.reverse(), ...prev]);
    setBatchRows([
      { id: 1, montant: "", categorie: "Nourriture", nature: "Nécessaire", description: "" },
      { id: 2, montant: "", categorie: "Carburant", nature: "Nécessaire", description: "" },
    ]);
  };

  const deleteTransaction = (id) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const startEditTransaction = (transaction) => {
    setEditingId(transaction.id);
    setQuickTab("simple");
    setForm({
      date: transaction.date,
      type: transaction.type,
      nature: transaction.nature,
      categorie: transaction.categorie,
      description: transaction.description,
      montant: String(transaction.montant),
    });
  };

  const saveEditedTransaction = () => {
    const montant = Number(form.montant);
    if (!editingId || !form.description.trim() || Number.isNaN(montant) || montant <= 0) return;

    setTransactions((prev) => prev.map((t) => (t.id === editingId ? { ...t, ...form, montant } : t)));
    setEditingId(null);
    setForm((f) => ({ ...f, description: "", montant: "" }));
  };

  const resetDemo = () => {
    setTransactions(initialTransactions);
    setCapitalActuel(2500);
    setObjectifCapital(20000);
    setMonthlyBudget(1200);
    setFoodBudget(300);
    setFuelBudget(250);
    setFunBudget(150);
    setEditingId(null);
  };

  const importJson = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(String(e.target?.result || "[]"));
        if (Array.isArray(parsed)) setTransactions(parsed);
      } catch {
        // ignore invalid imports
      }
    };
    reader.readAsText(file);
  };

  const installApp = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    setInstallPrompt(null);
  };

  return (
    <div className="min-h-screen bg-[#f4efe6] p-3 md:p-6 text-slate-900">
      <div className={`mx-auto space-y-4 ${isFoldMode ? "max-w-7xl" : "max-w-md md:max-w-6xl"}`}>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-[#fffaf0] p-5 shadow-sm border border-[#e7dcc8]"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500">Application mobile de finances</p>
              <h1 className="text-2xl font-semibold tracking-tight">Cockpit financier</h1>
            </div>
            <div className="rounded-2xl bg-[#f3eadb] p-3">
              <Wallet className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge className="rounded-xl">{offlineReady ? "Hors ligne prêt" : "Chargement"}</Badge>
            {installPrompt && (
              <Button onClick={installApp} className="rounded-2xl">
                Installer l'application
              </Button>
            )}
          </div>
        </motion.div>

        <div className={`grid gap-3 ${isFoldMode ? "grid-cols-4" : "grid-cols-2 md:grid-cols-4"}`}>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Card className="rounded-3xl shadow-sm bg-[#fffaf0] border border-[#e7dcc8]">
              <CardContent className="p-4">
                <p className="text-xs text-slate-500">Revenus</p>
                <p className="text-lg font-semibold">{currency(stats.revenus)}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="rounded-3xl shadow-sm bg-[#fffaf0] border border-[#e7dcc8]">
              <CardContent className="p-4">
                <p className="text-xs text-slate-500">Dépenses</p>
                <p className="text-lg font-semibold">{currency(stats.depenses)}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="rounded-3xl shadow-sm bg-[#fffaf0] border border-[#e7dcc8]">
              <CardContent className="p-4">
                <p className="text-xs text-slate-500">Solde</p>
                <p className="text-lg font-semibold">{currency(stats.solde)}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="rounded-3xl shadow-sm bg-[#fffaf0] border border-[#e7dcc8]">
              <CardContent className="p-4">
                <p className="text-xs text-slate-500">Coût / jour</p>
                <p className="text-lg font-semibold">{currency(stats.coutJour)}</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <Tabs defaultValue="tableau" className="space-y-4">
          <TabsList className="grid grid-cols-6 rounded-2xl h-auto bg-[#fffaf0] p-1 shadow-sm border border-[#e7dcc8]">
            <TabsTrigger value="tableau" className="rounded-xl">Tableau</TabsTrigger>
            <TabsTrigger value="ajout" className="rounded-xl">Ajouter</TabsTrigger>
            <TabsTrigger value="budget" className="rounded-xl">Budget</TabsTrigger>
            <TabsTrigger value="motivation" className="rounded-xl">Motivation</TabsTrigger>
            <TabsTrigger value="historique" className="rounded-xl">Historique</TabsTrigger>
            <TabsTrigger value="annuel" className="rounded-xl">Annuel</TabsTrigger>
          </TabsList>

          <TabsContent value="tableau" className="space-y-4">
            {!isFoldMode && (
              <div className="grid grid-cols-1 gap-3">
                <Card className="rounded-3xl shadow-sm bg-[#fffaf0] border border-[#e7dcc8]">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs text-slate-500">Vue rapide</p>
                        <p className="text-xl font-semibold">{currency(stats.solde)}</p>
                      </div>
                      <Button
                        className="rounded-2xl"
                        onClick={() => {
                          setQuickTab("simple");
                          setEditingId(null);
                        }}
                      >
                        Ajouter
                      </Button>
                    </div>
                    <p className="mt-3 text-xs text-slate-500">Priorité budget : nourriture, carburant, plaisirs.</p>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-3 gap-3">
                  <Card className="rounded-3xl shadow-sm bg-[#fffaf0] border border-[#e7dcc8]">
                    <CardContent className="p-3">
                      <p className="text-[11px] text-slate-500">Nourriture restant</p>
                      <p className="text-sm font-semibold">{currency(stats.foodRemaining)}</p>
                    </CardContent>
                  </Card>

                  <Card className="rounded-3xl shadow-sm bg-[#fffaf0] border border-[#e7dcc8]">
                    <CardContent className="p-3">
                      <p className="text-[11px] text-slate-500">Carburant restant</p>
                      <p className="text-sm font-semibold">{currency(stats.fuelRemaining)}</p>
                    </CardContent>
                  </Card>

                  <Card className="rounded-3xl shadow-sm bg-[#fffaf0] border border-[#e7dcc8]">
                    <CardContent className="p-3">
                      <p className="text-[11px] text-slate-500">Plaisirs restant</p>
                      <p className="text-sm font-semibold">{currency(stats.funRemaining)}</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {isFoldMode && (
              <Card className="rounded-3xl shadow-sm bg-[#fffaf0] border border-[#e7dcc8] border-dashed">
                <CardContent className="p-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">Mode pliable actif</p>
                    <p className="text-sm text-slate-500">L'interface s'étale automatiquement pour profiter du grand écran du Galaxy Z Fold.</p>
                  </div>
                  <Badge className="rounded-xl">Grand écran</Badge>
                </CardContent>
              </Card>
            )}

            <Card className="rounded-3xl shadow-sm bg-[#fffaf0] border border-[#e7dcc8]">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-base">Vue d'ensemble</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.byMonth}>
                    <XAxis dataKey="periode" />
                    <YAxis />
                    <Tooltip formatter={(v) => currency(Number(v))} />
                    <Line type="monotone" dataKey="solde" stroke="#111827" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className={`grid gap-4 ${isFoldMode ? "grid-cols-3" : "grid-cols-1 md:grid-cols-2"}`}>
              <Card className="rounded-3xl shadow-sm bg-[#fffaf0] border border-[#e7dcc8]">
                <CardHeader><CardTitle className="text-base">Nécessaire / plaisir</CardTitle></CardHeader>
                <CardContent className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={[{ name: "Nécessaire", value: stats.necessaire }, { name: "Plaisir", value: stats.plaisir }]} dataKey="value" nameKey="name" outerRadius={85}>
                        <Cell fill="#111827" />
                        <Cell fill="#9ca3af" />
                      </Pie>
                      <Tooltip formatter={(v) => currency(Number(v))} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="rounded-3xl shadow-sm bg-[#fffaf0] border border-[#e7dcc8]">
                <CardHeader><CardTitle className="text-base">Dépenses par catégorie</CardTitle></CardHeader>
                <CardContent className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.byCategory}>
                      <XAxis dataKey="name" angle={-15} textAnchor="end" height={60} />
                      <YAxis />
                      <Tooltip formatter={(v) => currency(Number(v))} />
                      <Bar dataKey="value" fill="#111827" radius={[10, 10, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card className="rounded-3xl shadow-sm bg-[#fffaf0] border border-[#e7dcc8]">
              <CardHeader><CardTitle className="text-base">Dernières opérations</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {transactions.slice(0, 8).map((t) => {
                  const Icon = categoryIcons[t.categorie] || PiggyBank;
                  return (
                    <div key={t.id} className="flex items-center justify-between rounded-2xl border border-[#e7dcc8] bg-[#fffaf0] p-3 gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="rounded-2xl bg-[#f3eadb] p-2"><Icon className="h-4 w-4" /></div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{t.description}</p>
                          <p className="text-xs text-slate-500">{t.categorie} • {t.nature} • {t.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <p className="text-sm font-semibold">{t.type === "Dépense" ? "-" : "+"}{currency(t.montant)}</p>
                          <p className="text-xs text-slate-500">{t.type}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => deleteTransaction(t.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ajout" className={`space-y-4 ${isFoldMode ? "grid grid-cols-2 gap-4" : ""}`}>
            <Card className="rounded-3xl shadow-sm bg-[#fffaf0] border border-[#e7dcc8]">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="flex items-center gap-2 text-base"><PlusCircle className="h-4 w-4" />Ajouter des opérations</CardTitle>
                  <div className="flex items-center gap-2 rounded-2xl border border-[#e7dcc8] p-1 bg-[#fffaf0]">
                    <Button
                      variant={quickTab === "simple" ? "default" : "ghost"}
                      className="rounded-xl"
                      size="sm"
                      onClick={() => {
                        setQuickTab("simple");
                        setEditingId(null);
                      }}
                    >
                      Simple
                    </Button>
                    <Button
                      variant={quickTab === "multiple" ? "default" : "ghost"}
                      className="rounded-xl"
                      size="sm"
                      onClick={() => setQuickTab("multiple")}
                    >
                      Multiple
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                </div>

                {quickTab === "simple" ? (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Type</Label>
                        <Select value={form.type} onValueChange={(value) => setForm({ ...form, type: value })}>
                          <SelectTrigger className="rounded-2xl"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Revenu">Revenu</SelectItem>
                            <SelectItem value="Dépense">Dépense</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Nature</Label>
                        <Select value={form.nature} onValueChange={(value) => setForm({ ...form, nature: value })}>
                          <SelectTrigger className="rounded-2xl"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Nécessaire">Nécessaire</SelectItem>
                            <SelectItem value="Plaisir">Plaisir</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Catégorie</Label>
                      <Select value={form.categorie} onValueChange={(value) => setForm({ ...form, categorie: value })}>
                        <SelectTrigger className="rounded-2xl"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Ex. courses, plein, mission..." />
                    </div>

                    <div className="space-y-2">
                      <Label>Montant (€)</Label>
                      <Input type="number" value={form.montant} onChange={(e) => setForm({ ...form, montant: e.target.value })} placeholder="0" />
                    </div>

                    {editingId ? (
                      <Button onClick={saveEditedTransaction} className="w-full rounded-2xl">Mettre à jour</Button>
                    ) : (
                      <Button onClick={addTransaction} className="w-full rounded-2xl">Enregistrer</Button>
                    )}
                  </>
                ) : (
                  <div className="space-y-3">
                    {batchRows.map((row, index) => (
                      <div key={row.id} className="rounded-2xl border border-[#e7dcc8] bg-[#fffaf0] p-3 space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">Ligne {index + 1}</p>
                          <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => removeBatchRow(row.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label>Catégorie</Label>
                            <Select value={row.categorie} onValueChange={(value) => updateBatchRow(row.id, "categorie", value)}>
                              <SelectTrigger className="rounded-2xl"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Nature</Label>
                            <Select value={row.nature} onValueChange={(value) => updateBatchRow(row.id, "nature", value)}>
                              <SelectTrigger className="rounded-2xl"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Nécessaire">Nécessaire</SelectItem>
                                <SelectItem value="Plaisir">Plaisir</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Input value={row.description} onChange={(e) => updateBatchRow(row.id, "description", e.target.value)} placeholder="Ex. courses, plein..." />
                        </div>

                        <div className="space-y-2">
                          <Label>Montant (€)</Label>
                          <Input type="number" value={row.montant} onChange={(e) => updateBatchRow(row.id, "montant", e.target.value)} placeholder="0" />
                        </div>
                      </div>
                    ))}

                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline" className="rounded-2xl" onClick={addBatchRow}>Ajouter une ligne</Button>
                      <Button className="rounded-2xl" onClick={saveBatchRows}>Enregistrer le lot</Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-3xl shadow-sm bg-[#fffaf0] border border-[#e7dcc8]">
              <CardHeader><CardTitle className="text-base">Import / export</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <Button variant="outline" className="rounded-2xl" onClick={() => downloadJson("transactions-finances.json", transactions)}>
                  <Download className="h-4 w-4 mr-2" />Exporter
                </Button>

                <label className="flex items-center justify-center rounded-2xl border border-[#e7dcc8] px-4 py-2 text-sm font-medium cursor-pointer bg-[#fffaf0]">
                  <Upload className="h-4 w-4 mr-2" />Importer JSON
                  <input type="file" accept="application/json" className="hidden" onChange={importJson} />
                </label>

                <Button variant="destructive" className="rounded-2xl" onClick={resetDemo}>
                  <Trash2 className="h-4 w-4 mr-2" />Réinitialiser
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="budget" className={`space-y-4 ${isFoldMode ? "grid grid-cols-2 gap-4" : ""}`}>
            <Card className="rounded-3xl shadow-sm bg-[#fffaf0] border border-[#e7dcc8]">
              <CardHeader><CardTitle className="text-base">Pilotage du budget mensuel</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Budget mensuel (€)</Label>
                  <Input type="number" value={monthlyBudget} onChange={(e) => setMonthlyBudget(Number(e.target.value || 0))} />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label>Budget nourriture (€)</Label>
                    <Input type="number" value={foodBudget} onChange={(e) => setFoodBudget(Number(e.target.value || 0))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Budget carburant (€)</Label>
                    <Input type="number" value={fuelBudget} onChange={(e) => setFuelBudget(Number(e.target.value || 0))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Budget plaisirs (€)</Label>
                    <Input type="number" value={funBudget} onChange={(e) => setFunBudget(Number(e.target.value || 0))} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Capital actuel (€)</Label>
                  <Input type="number" value={capitalActuel} onChange={(e) => setCapitalActuel(Number(e.target.value || 0))} />
                </div>

                <div className="space-y-2">
                  <Label>Objectif capital (€)</Label>
                  <Input type="number" value={objectifCapital} onChange={(e) => setObjectifCapital(Number(e.target.value || 0))} />
                </div>

                <div className="rounded-2xl border border-[#e7dcc8] bg-[#fffaf0] p-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progression épargne</span>
                    <span className="font-medium">{stats.progression}%</span>
                  </div>
                  <Progress value={stats.progression} className="h-3" />
                  <p className="text-sm text-slate-500">{currency(capitalActuel)} sur {currency(objectifCapital)}</p>
                </div>

                <div className="rounded-2xl border border-[#e7dcc8] bg-[#fffaf0] p-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Consommation du budget</span>
                    <span className="font-medium">{stats.depensesVsBudget}%</span>
                  </div>
                  <Progress value={Math.min(100, stats.depensesVsBudget)} className="h-3" />
                  <p className="text-sm text-slate-500">{currency(stats.depenses)} dépensés pour un budget de {currency(monthlyBudget)}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Card className="rounded-2xl bg-[#f8f1e4] border border-[#e7dcc8]">
                    <CardContent className="p-4">
                      <p className="text-xs text-slate-500">Autonomie</p>
                      <p className="text-lg font-semibold">{stats.autonomie.toFixed(1)} mois</p>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl bg-[#f8f1e4] border border-[#e7dcc8]">
                    <CardContent className="p-4">
                      <p className="text-xs text-slate-500">Taux d'épargne</p>
                      <p className="text-lg font-semibold">{stats.tauxEpargne.toFixed(0)}%</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <Card className="rounded-2xl bg-[#f8f1e4] border border-[#e7dcc8]">
                    <CardContent className="p-4">
                      <p className="text-xs text-slate-500">Reste nourriture</p>
                      <p className="text-lg font-semibold">{currency(stats.foodRemaining)}</p>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl bg-[#f8f1e4] border border-[#e7dcc8]">
                    <CardContent className="p-4">
                      <p className="text-xs text-slate-500">Reste carburant</p>
                      <p className="text-lg font-semibold">{currency(stats.fuelRemaining)}</p>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl bg-[#f8f1e4] border border-[#e7dcc8]">
                    <CardContent className="p-4">
                      <p className="text-xs text-slate-500">Reste plaisirs</p>
                      <p className="text-lg font-semibold">{currency(stats.funRemaining)}</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="rounded-2xl border border-[#e7dcc8] bg-[#fffaf0] p-4 space-y-1">
                  <p className="text-xs text-slate-500">Mobilité</p>
                  <p className="text-sm font-medium">Carburant / jour : {currency(stats.fuelPerDay)}</p>
                  <p className="text-sm text-slate-500">Part du budget : {stats.fuelShareOfBudget.toFixed(0)}%</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="motivation" className={`space-y-4 ${isFoldMode ? "grid grid-cols-2 gap-4" : ""}`}>
            <Card className="rounded-3xl shadow-sm bg-[#fffaf0] border border-[#e7dcc8]">
              <CardHeader><CardTitle className="text-base">Analyse mensuelle vs annuelle</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-[#e7dcc8] bg-[#fffaf0] p-4">
                  <p className="text-xs text-slate-500">Vue mensuelle</p>
                  <p className="text-lg font-semibold">{currency((stats.byMonth.at(-1)?.depenses || 0))}</p>
                  <p className="text-sm text-slate-500">Dernier mois enregistré</p>
                </div>
                <div className="rounded-2xl border border-[#e7dcc8] bg-[#fffaf0] p-4">
                  <p className="text-xs text-slate-500">Vue annuelle</p>
                  <p className="text-lg font-semibold">{currency(stats.depenses)}</p>
                  <p className="text-sm text-slate-500">Cumul sur l'année</p>
                </div>
              </CardContent>
            </Card>

            <Card className={`rounded-3xl shadow-sm overflow-hidden bg-[#fffaf0] border border-[#e7dcc8] ${isFoldMode ? "h-full" : ""}`}>
              <div className="bg-slate-900 text-white p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-300">Niveau financier</p>
                    <h2 className="text-2xl font-semibold">{stats.niveau}</h2>
                  </div>
                  <Target className="h-8 w-8" />
                </div>
              </div>

              <CardContent className="p-5 space-y-4">
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span>Score financier</span>
                    <Badge variant="secondary" className="rounded-xl">{stats.score}/100</Badge>
                  </div>
                  <Progress value={stats.score} className="h-3" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-[#e7dcc8] bg-[#fffaf0] p-4">
                    <p className="text-xs text-slate-500">Dépenses nécessaires</p>
                    <p className="text-lg font-semibold">{currency(stats.necessaire)}</p>
                  </div>
                  <div className="rounded-2xl border border-[#e7dcc8] bg-[#fffaf0] p-4">
                    <p className="text-xs text-slate-500">Dépenses plaisir</p>
                    <p className="text-lg font-semibold">{currency(stats.plaisir)}</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#e7dcc8] bg-[#fffaf0] p-4">
                  <p className="text-xs text-slate-500">Objectif estimé</p>
                  <p className="text-lg font-semibold">{stats.monthlyGoalEstimate === null ? "À améliorer" : `${stats.monthlyGoalEstimate} mois`}</p>
                  <p className="text-sm text-slate-500">Estimation basée sur ton solde actuel.</p>
                </div>

                <div className="rounded-2xl bg-[#f8f1e4] p-4 border border-[#e7dcc8]">
                  <p className="text-sm font-medium">Message du jour</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {stats.solde >= 0
                      ? "Tu es en train de bâtir quelque chose de stable. Le vrai progrès, c'est la répétition des petits gestes qui te renforcent."
                      : "Tu n'as pas besoin d'être parfait. Tu as surtout besoin d'un système clair, honnête, et assez simple pour tenir dans le temps."}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#e7dcc8] bg-[#fffaf0] p-4 flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Défi simple</p>
                    <p className="text-sm text-slate-600">Essaie cette semaine de noter chaque dépense dès qu'elle arrive. La rigueur enlève une grosse partie du stress.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="historique" className={`space-y-4 ${isFoldMode ? "grid grid-cols-2 gap-4" : ""}`}>
            <Card className="rounded-3xl shadow-sm bg-[#fffaf0] border border-[#e7dcc8]">
              <CardHeader>
                <CardTitle className="text-base">Recherche et filtres</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                  <Input className="pl-9" placeholder="Rechercher une dépense..." value={historySearch} onChange={(e) => setHistorySearch(e.target.value)} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Select value={historyMonth} onValueChange={setHistoryMonth}>
                    <SelectTrigger className="rounded-2xl"><SelectValue placeholder="Mois" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les mois</SelectItem>
                      {monthNames.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>

                  <Select value={historyCategory} onValueChange={setHistoryCategory}>
                    <SelectTrigger className="rounded-2xl"><SelectValue placeholder="Catégorie" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les catégories</SelectItem>
                      {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>

                  <Select value={historyNature} onValueChange={setHistoryNature}>
                    <SelectTrigger className="rounded-2xl"><SelectValue placeholder="Nature" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les natures</SelectItem>
                      <SelectItem value="Nécessaire">Nécessaire</SelectItem>
                      <SelectItem value="Plaisir">Plaisir</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl shadow-sm bg-[#fffaf0] border border-[#e7dcc8]">
              <CardHeader>
                <CardTitle className="text-base">Historique</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[32rem] overflow-auto">
                {filteredTransactions.map((t) => {
                  const Icon = categoryIcons[t.categorie] || PiggyBank;
                  return (
                    <div key={t.id} className="flex items-center justify-between rounded-2xl border border-[#e7dcc8] bg-[#fffaf0] p-3 gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="rounded-2xl bg-[#f3eadb] p-2"><Icon className="h-4 w-4" /></div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{t.description}</p>
                          <p className="text-xs text-slate-500">{t.categorie} • {t.nature} • {t.date}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <p className="text-sm font-semibold">{t.type === "Dépense" ? "-" : "+"}{currency(t.montant)}</p>
                          <p className="text-xs text-slate-500">{t.type}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => startEditTransaction(t)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => deleteTransaction(t.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="annuel" className={`space-y-4 ${isFoldMode ? "grid grid-cols-2 gap-4" : ""}`}>
            <Card className="rounded-3xl shadow-sm bg-[#fffaf0] border border-[#e7dcc8]">
              <CardHeader>
                <CardTitle className="text-base">Analyse annuelle</CardTitle>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.byYear}>
                    <XAxis dataKey="periode" />
                    <YAxis />
                    <Tooltip formatter={(v) => currency(Number(v))} />
                    <Bar dataKey="revenus" fill="#16a34a" radius={[10, 10, 0, 0]} />
                    <Bar dataKey="depenses" fill="#111827" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="rounded-3xl shadow-sm bg-[#fffaf0] border border-[#e7dcc8]">
              <CardHeader>
                <CardTitle className="text-base">Résumé annuel</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-[#e7dcc8] bg-[#fffaf0] p-4">
                  <p className="text-xs text-slate-500">Revenus annuels</p>
                  <p className="text-lg font-semibold">{currency(stats.revenus)}</p>
                </div>
                <div className="rounded-2xl border border-[#e7dcc8] bg-[#fffaf0] p-4">
                  <p className="text-xs text-slate-500">Dépenses annuelles</p>
                  <p className="text-lg font-semibold">{currency(stats.depenses)}</p>
                </div>
                <div className="rounded-2xl border border-[#e7dcc8] bg-[#fffaf0] p-4">
                  <p className="text-xs text-slate-500">Solde annuel</p>
                  <p className="text-lg font-semibold">{currency(stats.solde)}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
