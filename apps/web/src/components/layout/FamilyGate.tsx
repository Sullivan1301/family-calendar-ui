"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

/**
 * Empêche d'afficher l'application tant que l'utilisateur n'appartient à aucune
 * famille : sans famille active, toutes les pages sont vides et les appels API
 * restent bloqués. On l'envoie alors créer ou rejoindre une famille.
 */
export function FamilyGate({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated, families } = useAuth();
  const router = useRouter();

  const needsFamily = !isLoading && isAuthenticated && families.length === 0;

  useEffect(() => {
    if (needsFamily) {
      router.replace("/onboarding");
    }
  }, [needsFamily, router]);

  if (isLoading || needsFamily) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4 text-tba-gray">
        <Loader2 size={32} className="animate-spin text-tba-blue" />
        <p className="text-sm font-medium">Chargement de votre famille…</p>
      </div>
    );
  }

  return <>{children}</>;
}
