"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Users, Loader2, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../../context/AuthContext";
import { useApi, apiPost } from "../../../hooks/useApi";

interface InvitationPreview {
  invitation: {
    email: string;
    status: string;
    expiresAt: string;
    familyName: string | null;
    invitedByName: string | null;
  };
  canAccept: boolean;
  expired: boolean;
  emailMatches: boolean;
  sessionEmail: string;
}

export default function InvitationPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const { isLoading: authLoading, isAuthenticated, refreshUser } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  // Le middleware renvoie déjà vers /login, mais l'invitation est une page
  // publique : on garde le lien pour y revenir après connexion.
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace(`/login?callbackUrl=/invitation/${token}`);
    }
  }, [authLoading, isAuthenticated, router, token]);

  const { data, isLoading, error } = useApi<InvitationPreview>(
    isAuthenticated && token ? `/api/invitations/${token}` : null
  );

  const handleAccept = async () => {
    setSubmitting(true);
    try {
      await apiPost(`/api/invitations/${token}/accept`);
      await refreshUser();
      toast.success("Invitation acceptée, bienvenue !");
      router.replace("/");
    } catch (err: any) {
      toast.error(err.message || "Impossible d'accepter l'invitation.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDecline = async () => {
    setSubmitting(true);
    try {
      await apiPost(`/api/invitations/${token}/decline`);
      toast.success("Invitation refusée.");
      router.replace("/onboarding");
    } catch (err: any) {
      toast.error(err.message || "Impossible de refuser l'invitation.");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-tba-blue" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-tba-surface via-white to-tba-bg-light">
      <div className="w-full max-w-md bg-white rounded-tba shadow-tba border border-border p-8 text-center">
        {error || !data ? (
          <>
            <IconBadge tone="red">
              <XCircle size={30} />
            </IconBadge>
            <h1 className="text-2xl font-bold text-tba-blue mb-2">Invitation introuvable</h1>
            <p className="text-tba-gray mb-7">
              {error || "Ce lien d'invitation n'est pas valide."}
            </p>
            <Link href="/onboarding" className="btn-primary inline-block py-3 px-7">
              Rejoindre avec un code
            </Link>
          </>
        ) : data.canAccept ? (
          <>
            <IconBadge tone="blue">
              <Users size={30} />
            </IconBadge>
            <h1 className="text-2xl font-bold text-tba-blue mb-2">
              Rejoindre {data.invitation.familyName || "la famille"}
            </h1>
            <p className="text-tba-gray mb-7">
              {data.invitation.invitedByName
                ? `${data.invitation.invitedByName} vous invite à rejoindre le calendrier familial.`
                : "Vous êtes invité à rejoindre ce calendrier familial."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAccept}
                disabled={submitting}
                className="btn-primary flex-1 py-3 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                Accepter
              </button>
              <button
                onClick={handleDecline}
                disabled={submitting}
                className="flex-1 py-3 px-5 rounded-xl border border-border font-bold text-tba-gray hover:bg-muted transition-colors disabled:opacity-60"
              >
                Refuser
              </button>
            </div>
          </>
        ) : (
          <>
            <IconBadge tone="yellow">
              <AlertTriangle size={30} />
            </IconBadge>
            <h1 className="text-2xl font-bold text-tba-blue mb-2">Invitation inutilisable</h1>
            <p className="text-tba-gray mb-7">{explain(data)}</p>
            <Link href="/onboarding" className="btn-primary inline-block py-3 px-7">
              Rejoindre avec un code
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

function explain(data: InvitationPreview) {
  if (data.expired) {
    return "Cette invitation a expiré. Demandez à l'administrateur de votre famille d'en envoyer une nouvelle.";
  }
  if (data.invitation.status === "accepted") {
    return "Cette invitation a déjà été utilisée.";
  }
  if (data.invitation.status === "revoked") {
    return "Cette invitation a été annulée.";
  }
  if (!data.emailMatches) {
    return `Cette invitation a été envoyée à ${data.invitation.email}, mais vous êtes connecté avec ${data.sessionEmail}. Connectez-vous avec la bonne adresse.`;
  }
  return "Cette invitation n'est plus valide.";
}

function IconBadge({ tone, children }: { tone: "blue" | "red" | "yellow"; children: React.ReactNode }) {
  const tones = {
    blue: "bg-tba-blue text-white shadow-tba-blue/20",
    red: "bg-tba-red/10 text-tba-red",
    yellow: "bg-tba-yellow/20 text-tba-text",
  } as const;
  return (
    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg ${tones[tone]}`}>
      {children}
    </div>
  );
}
