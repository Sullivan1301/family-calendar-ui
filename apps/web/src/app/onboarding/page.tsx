"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users, Plus, KeyRound, Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { apiPost } from "../../hooks/useApi";

type Mode = "create" | "join";

export default function OnboardingPage() {
  const router = useRouter();
  const { isLoading, isAuthenticated, families, refreshUser, logout, user } = useAuth();
  const [mode, setMode] = useState<Mode>("create");
  const [familyName, setFamilyName] = useState("");
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Déjà rattaché à une famille : rien à faire ici.
  useEffect(() => {
    if (!isLoading && isAuthenticated && families.length > 0) {
      router.replace("/");
    }
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, families, router]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (familyName.trim().length < 2) {
      toast.error("Le nom de la famille doit faire au moins 2 caractères.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await apiPost<{ family: { name: string; invitationCode: string | null } }>(
        "/api/families",
        { name: familyName.trim() }
      );
      await refreshUser();
      toast.success(
        result.family.invitationCode
          ? `Famille créée ! Code d'invitation : ${result.family.invitationCode}`
          : "Famille créée !"
      );
      router.replace("/members");
    } catch (err: any) {
      toast.error(err.message || "Impossible de créer la famille.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = code.trim().toUpperCase();
    if (clean.length !== 8) {
      toast.error("Le code d'invitation comporte 8 caractères.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await apiPost<{ family: { name: string } }>("/api/families/join-code", {
        code: clean,
      });
      await refreshUser();
      toast.success(`Bienvenue dans la famille ${result.family.name} !`);
      router.replace("/");
    } catch (err: any) {
      toast.error(err.message || "Code d'invitation invalide.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-tba-blue" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-tba-surface via-white to-tba-bg-light">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-tba-blue text-white flex items-center justify-center mx-auto mb-5 shadow-lg shadow-tba-blue/20">
            <Users size={30} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-tba-blue tracking-tight">
            Bienvenue{user?.name ? `, ${user.name}` : ""} 👋
          </h1>
          <p className="text-tba-gray mt-3">
            Pour commencer, créez votre famille ou rejoignez-en une avec un code d'invitation.
          </p>
        </div>

        <div className="bg-white rounded-tba shadow-tba border border-border p-6 md:p-8">
          <div className="flex bg-muted p-1.5 rounded-2xl gap-1 mb-7">
            <button
              type="button"
              onClick={() => setMode("create")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
                mode === "create" ? "bg-white text-tba-blue shadow-md" : "text-tba-gray hover:bg-white/50"
              }`}
            >
              <Plus size={16} /> Créer une famille
            </button>
            <button
              type="button"
              onClick={() => setMode("join")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
                mode === "join" ? "bg-white text-tba-blue shadow-md" : "text-tba-gray hover:bg-white/50"
              }`}
            >
              <KeyRound size={16} /> Rejoindre
            </button>
          </div>

          {mode === "create" ? (
            <form onSubmit={handleCreate} className="space-y-5">
              <div>
                <label htmlFor="familyName" className="block text-sm font-bold text-tba-text mb-2">
                  Nom de la famille
                </label>
                <input
                  id="familyName"
                  type="text"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  placeholder="Famille Rakotoarisoa"
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl border border-border focus:border-tba-blue focus:ring-2 focus:ring-tba-blue/20 outline-none transition-all"
                />
                <p className="text-xs text-tba-gray mt-2">
                  Vous en serez l'administrateur et recevrez un code à partager aux autres membres.
                </p>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submitting && <Loader2 size={16} className="animate-spin" />}
                Créer ma famille
              </button>
            </form>
          ) : (
            <form onSubmit={handleJoin} className="space-y-5">
              <div>
                <label htmlFor="code" className="block text-sm font-bold text-tba-text mb-2">
                  Code d'invitation
                </label>
                <input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="A1B2C3D4"
                  maxLength={8}
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl border border-border focus:border-tba-blue focus:ring-2 focus:ring-tba-blue/20 outline-none transition-all font-mono text-lg tracking-[0.3em] text-center uppercase"
                />
                <p className="text-xs text-tba-gray mt-2">
                  Demandez ce code de 8 caractères à l'administrateur de votre famille.
                </p>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submitting && <Loader2 size={16} className="animate-spin" />}
                Rejoindre la famille
              </button>
            </form>
          )}
        </div>

        <button
          type="button"
          onClick={async () => {
            await logout();
            router.replace("/login");
          }}
          className="mt-6 mx-auto flex items-center gap-2 text-sm text-tba-gray hover:text-tba-blue transition-colors"
        >
          <LogOut size={14} /> Se déconnecter
        </button>
      </div>
    </div>
  );
}
