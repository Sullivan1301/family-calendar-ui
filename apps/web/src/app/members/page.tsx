"use client";

import { useState, useMemo } from "react";
import {
  UserPlus,
  Mail,
  ShieldCheck,
  AlertCircle,
  Copy,
  Check,
  X,
  Loader2,
  Trash2,
  ArrowUpCircle,
  ArrowDownCircle,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { UserStatus } from "../../types";
import { useApi, apiPost, apiPatch, apiDelete } from "../../hooks/useApi";

interface ApiMember {
  id: string;
  userId: string;
  status: UserStatus;
  joinedAt: string;
  role: "super-admin" | "admin" | "member";
  user?: { id: string; name: string | null; email: string; image: string | null };
}

const roleLabels: Record<string, string> = {
  "super-admin": "Super Admin",
  admin: "Admin",
  member: "Membre",
};

/** Couleur de pastille dérivée du nom, pour que chaque membre garde la sienne. */
const palettes = [
  "from-tba-blue to-tba-cyan",
  "from-emerald-700 to-emerald-500",
  "from-amber-600 to-amber-400",
  "from-tba-red to-rose-400",
  "from-blue-600 to-blue-400",
  "from-slate-600 to-slate-400",
  "from-purple-600 to-purple-400",
  "from-pink-600 to-pink-400",
];

function paletteFor(key: string) {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) % 997;
  return palettes[hash % palettes.length];
}

function initialsOf(label: string) {
  return (
    label
      .split(/[\s@._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}

export default function MembersPage() {
  const { isAdmin, isSuperAdmin, activeFamily, user } = useAuth();
  const [inviteOpen, setInviteOpen] = useState(false);

  const { data: familyData, refetch: refetchFamily } = useApi<{
    family: { id: string; name: string; invitationCode: string | null };
  }>(activeFamily ? `/api/families/${activeFamily.id}` : null);

  const {
    data: membersData,
    isLoading,
    error,
    refetch,
  } = useApi<{ members: ApiMember[] }>(
    activeFamily ? `/api/families/${activeFamily.id}/members` : null
  );

  const members = useMemo(() => membersData?.members ?? [], [membersData]);
  const activeCount = members.filter((m) => m.status === "active").length;
  const pendingCount = members.filter((m) => m.status === "pending").length;

  const handleMemberUpdate = async (
    member: ApiMember,
    payload: { status?: UserStatus; role?: "admin" | "member" },
    successMessage: string
  ) => {
    if (!activeFamily) return;
    try {
      await apiPatch(`/api/families/${activeFamily.id}/members/${member.id}`, payload);
      toast.success(successMessage);
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Action impossible.");
    }
  };

  const handleRemove = async (member: ApiMember) => {
    if (!activeFamily) return;
    const label = member.user?.name || member.user?.email || "ce membre";
    if (!window.confirm(`Retirer ${label} de la famille ? Cette action est irréversible.`)) {
      return;
    }
    try {
      await apiDelete(`/api/families/${activeFamily.id}/members/${member.id}`);
      toast.success(`${label} a été retiré de la famille.`);
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Suppression impossible.");
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-tba-blue tracking-tight">
            Membres de la famille
          </h1>
          <p className="text-base text-tba-gray mt-2 font-sans font-normal">
            {activeFamily?.name ? `${activeFamily.name} · ` : ""}
            {activeCount} membre{activeCount > 1 ? "s" : ""} actif{activeCount > 1 ? "s" : ""}
            {pendingCount > 0 && ` · ${pendingCount} en attente`}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setInviteOpen((v) => !v)}
            className="btn-primary flex items-center gap-2 py-3 px-8"
          >
            <UserPlus size={18} />
            <span>Inviter un membre</span>
          </button>
        )}
      </div>

      {inviteOpen && isAdmin && activeFamily && (
        <InvitePanel
          familyId={activeFamily.id}
          invitationCode={familyData?.family.invitationCode ?? null}
          onClose={() => setInviteOpen(false)}
          onInvited={() => {
            refetchFamily();
            refetch();
          }}
        />
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-20 text-tba-gray gap-3">
          <Loader2 size={24} className="animate-spin text-tba-blue" />
          Chargement des membres…
        </div>
      )}

      {error && (
        <div className="bg-tba-red/5 border border-tba-red/20 rounded-tba p-6 flex items-start gap-3">
          <AlertCircle className="text-tba-red shrink-0 mt-0.5" size={18} />
          <div>
            <p className="font-bold text-tba-blue">Impossible de charger les membres</p>
            <p className="text-sm text-tba-gray mt-1">{error}</p>
          </div>
        </div>
      )}

      {!isLoading && !error && members.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-tba-bg-light flex items-center justify-center mb-4 text-muted-foreground">
            <Users size={32} />
          </div>
          <h3 className="text-lg font-bold text-tba-blue">Vous êtes seul pour l&apos;instant</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Partagez votre code d&apos;invitation pour que votre famille vous rejoigne.
          </p>
        </div>
      )}

      {members.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              isAdminView={isAdmin}
              isSuperAdminView={isSuperAdmin}
              isSelf={member.userId === user?.id}
              onApprove={() =>
                handleMemberUpdate(
                  member,
                  { status: "active" },
                  `${member.user?.name || "Le membre"} a été validé.`
                )
              }
              onReject={() =>
                handleMemberUpdate(
                  member,
                  { status: "rejected" },
                  `${member.user?.name || "Le membre"} a été refusé.`
                )
              }
              onPromote={() =>
                handleMemberUpdate(
                  member,
                  { role: "admin" },
                  `${member.user?.name || "Le membre"} est désormais admin.`
                )
              }
              onDemote={() =>
                handleMemberUpdate(
                  member,
                  { role: "member" },
                  `${member.user?.name || "Le membre"} est redevenu membre.`
                )
              }
              onRemove={() => handleRemove(member)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function InvitePanel({
  familyId,
  invitationCode,
  onClose,
  onInvited,
}: {
  familyId: string;
  invitationCode: string | null;
  onClose: () => void;
  onInvited: () => void;
}) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState<"code" | "link" | null>(null);
  const [lastLink, setLastLink] = useState<string | null>(null);

  const copy = async (value: string, what: "code" | "link") => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(what);
      setTimeout(() => setCopied(null), 2000);
      toast.success(what === "code" ? "Code copié !" : "Lien copié !");
    } catch {
      toast.error("Copie impossible. Sélectionnez le texte manuellement.");
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    try {
      const result = await apiPost<{ invitation: { token: string } }>(
        `/api/families/${familyId}/invitations`,
        { email: email.trim() }
      );
      const link = `${window.location.origin}/invitation/${result.invitation.token}`;
      setLastLink(link);
      setEmail("");
      onInvited();
      // Aucun service d'email n'est branché : le lien se partage à la main.
      toast.success("Invitation créée. Copiez le lien et envoyez-le.");
    } catch (err: any) {
      toast.error(err.message || "Invitation impossible.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white rounded-tba shadow-tba border border-border p-6 md:p-8 mb-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-tba-blue">Inviter un membre</h2>
          <p className="text-sm text-tba-gray mt-1">
            Deux façons de faire entrer quelqu&apos;un dans la famille.
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg text-tba-gray hover:bg-muted transition-colors"
          aria-label="Fermer"
        >
          <X size={18} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-tba-bg-light rounded-xl p-5">
          <div className="text-[0.65rem] font-black text-tba-blue uppercase tracking-widest mb-3">
            1 · Code d&apos;invitation
          </div>
          {invitationCode ? (
            <>
              <button
                onClick={() => copy(invitationCode, "code")}
                className="w-full font-mono text-2xl tracking-[0.25em] text-center bg-white border border-border rounded-xl py-4 text-tba-blue font-bold hover:border-tba-blue transition-colors flex items-center justify-center gap-3"
              >
                {invitationCode}
                {copied === "code" ? (
                  <Check size={18} className="text-emerald-600" />
                ) : (
                  <Copy size={16} className="text-tba-gray" />
                )}
              </button>
              <p className="text-xs text-tba-gray mt-3">
                La personne crée un compte, puis saisit ce code pour rejoindre la famille
                directement.
              </p>
            </>
          ) : (
            <p className="text-sm text-tba-gray">
              Cette famille n&apos;a pas de code d&apos;invitation.
            </p>
          )}
        </div>

        <div className="bg-tba-bg-light rounded-xl p-5">
          <div className="text-[0.65rem] font-black text-tba-blue uppercase tracking-widest mb-3">
            2 · Lien nominatif
          </div>
          <form onSubmit={handleInvite} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="adresse@email.com"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-border focus:border-tba-blue focus:ring-2 focus:ring-tba-blue/20 outline-none transition-all text-sm"
            />
            <button
              type="submit"
              disabled={sending}
              className="btn-primary w-full py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {sending ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
              Générer le lien
            </button>
          </form>
          <p className="text-xs text-tba-gray mt-3">
            Valable 7 jours, utilisable seulement par cette adresse.
          </p>

          {lastLink && (
            <button
              onClick={() => copy(lastLink, "link")}
              className="mt-3 w-full text-left bg-white border border-border rounded-xl p-3 hover:border-tba-blue transition-colors"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[0.65rem] font-bold text-tba-blue uppercase tracking-wider">
                  Lien à envoyer
                </span>
                {copied === "link" ? (
                  <Check size={14} className="text-emerald-600" />
                ) : (
                  <Copy size={12} className="text-tba-gray" />
                )}
              </div>
              <div className="text-[0.7rem] text-tba-gray break-all font-mono leading-tight">
                {lastLink}
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function MemberCard({
  member,
  isAdminView,
  isSuperAdminView,
  isSelf,
  onApprove,
  onReject,
  onPromote,
  onDemote,
  onRemove,
}: {
  member: ApiMember;
  isAdminView: boolean;
  isSuperAdminView: boolean;
  isSelf: boolean;
  onApprove: () => void;
  onReject: () => void;
  onPromote: () => void;
  onDemote: () => void;
  onRemove: () => void;
}) {
  const name = member.user?.name || member.user?.email || "Membre inconnu";
  const email = member.user?.email || "";
  const color = paletteFor(member.userId);
  const canModerate = isAdminView && !isSelf && member.role !== "super-admin";

  return (
    <div className="bg-white rounded-tba shadow-tba overflow-hidden hover:-translate-y-1 hover:shadow-tba-lg transition-all border border-border">
      <div className={`h-24 bg-gradient-to-br ${color} relative px-6 flex items-end shadow-inner`}>
        <div className="absolute inset-0 bg-black/5" />
        <div
          className={`w-16 h-16 rounded-full bg-gradient-to-br ${color} border-4 border-white absolute -bottom-8 left-6 shadow-lg flex items-center justify-center font-black text-xl text-white z-10 overflow-hidden`}
        >
          {member.user?.image ? (
            <img src={member.user.image} alt={name} className="w-full h-full object-cover" />
          ) : (
            initialsOf(name)
          )}
        </div>
      </div>
      <div className="pt-10 pb-6 px-6">
        <div className="flex justify-between items-start mb-1 gap-2">
          <h3 className="text-lg font-bold text-tba-blue leading-tight">
            {name}
            {isSelf && <span className="text-xs font-semibold text-tba-gray ml-2">(vous)</span>}
          </h3>
          <StatusBadge status={member.status} />
        </div>
        <div className="text-xs font-semibold text-muted-foreground mb-4 break-all">{email}</div>

        <div className="flex flex-wrap gap-2 mb-5">
          {member.role === "super-admin" && (
            <span className="flex items-center gap-1.5 text-[0.7rem] font-bold text-tba-blue bg-tba-blue/10 px-3 py-1 rounded-full">
              <ShieldCheck size={12} /> Super Admin
            </span>
          )}
          {member.role === "admin" && (
            <span className="flex items-center gap-1.5 text-[0.7rem] font-bold text-tba-cyan bg-tba-cyan/10 px-3 py-1 rounded-full">
              <ShieldCheck size={12} /> Admin
            </span>
          )}
          {member.role === "member" && (
            <span className="text-[0.7rem] font-bold text-muted-foreground bg-muted px-3 py-1 rounded-full">
              {roleLabels[member.role]}
            </span>
          )}
          {member.joinedAt && (
            <span className="text-[0.7rem] font-bold text-muted-foreground bg-muted px-3 py-1 rounded-full">
              Depuis le {new Date(member.joinedAt).toLocaleDateString("fr-FR")}
            </span>
          )}
        </div>

        {member.status === "pending" && isAdminView && (
          <div className="bg-tba-yellow/10 border border-tba-yellow/20 rounded-xl p-3 mb-5 flex items-start gap-2">
            <AlertCircle className="text-tba-yellow shrink-0 mt-0.5" size={14} />
            <p className="text-[0.65rem] text-tba-text font-medium leading-tight">
              Ce membre attend votre validation pour accéder au calendrier.
            </p>
          </div>
        )}

        {canModerate ? (
          <div className="flex flex-wrap gap-2">
            {member.status === "pending" && (
              <>
                <button
                  onClick={onApprove}
                  className="flex-1 bg-emerald-600 text-white font-bold text-xs py-2.5 rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  <Check size={14} /> Valider
                </button>
                <button
                  onClick={onReject}
                  className="flex-1 border-2 border-tba-red text-tba-red font-bold text-xs py-2.5 rounded-xl hover:bg-tba-red hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <X size={14} /> Refuser
                </button>
              </>
            )}
            {member.status === "active" && (
              <>
                {member.role === "member" ? (
                  <button
                    onClick={onPromote}
                    className="flex-1 bg-tba-blue text-white font-bold text-xs py-2.5 rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
                  >
                    <ArrowUpCircle size={14} /> Passer admin
                  </button>
                ) : (
                  <button
                    onClick={onDemote}
                    className="flex-1 border-2 border-tba-blue text-tba-blue font-bold text-xs py-2.5 rounded-xl hover:bg-tba-blue hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    <ArrowDownCircle size={14} /> Retirer admin
                  </button>
                )}
                {isSuperAdminView && (
                  <button
                    onClick={onRemove}
                    className="px-3 py-2.5 rounded-xl bg-tba-red/10 text-tba-red hover:bg-tba-red hover:text-white transition-all"
                    title="Retirer de la famille"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </>
            )}
            {member.status === "rejected" && (
              <button
                onClick={onApprove}
                className="flex-1 border-2 border-emerald-600 text-emerald-700 font-bold text-xs py-2.5 rounded-xl hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <Check size={14} /> Réintégrer
              </button>
            )}
          </div>
        ) : (
          email && (
            <a
              href={`mailto:${email}`}
              className="w-full border-2 border-tba-blue text-tba-blue font-bold text-xs py-2.5 rounded-xl hover:bg-tba-blue hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <Mail size={14} /> Contacter
            </a>
          )
        )}
      </div>
    </div>
  );
}
