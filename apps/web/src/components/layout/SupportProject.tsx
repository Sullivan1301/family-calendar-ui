"use client";

import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "../ui/dialog";
import { Heart, QrCode, MessageCircle, Copy } from "lucide-react";
import { toast } from "sonner";

export function SupportProject() {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copié dans le presse-papier !`);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 w-full text-left group bg-tba-red/8 text-tba-red hover:bg-tba-red hover:text-white border border-tba-red/10 hover:border-tba-red mt-3">
          <Heart size={16} className="transition-transform duration-300 group-hover:scale-110 fill-current" />
          Soutenir le projet
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] rounded-tba">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-tba-blue font-serif text-lg">
            <Heart size={18} className="text-tba-red fill-current" />
            Soutenir le développement
          </DialogTitle>
          <DialogDescription className="text-tba-gray font-medium pt-1 text-sm">
            Vous pouvez contribuer via MVola ou Orange Money pour m'aider à faire évoluer ce projet. 🇲🇬
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-3">
          <div className="flex flex-col gap-3">
            <div
              onClick={() => copyToClipboard("0341060802", "Numéro MVola")}
              className="flex items-center justify-between p-4 rounded-xl bg-tba-surface border border-tba-border/50 cursor-pointer hover:bg-white hover:shadow-tba hover:border-tba-border transition-all duration-200 group"
            >
              <div className="flex flex-col">
                <span className="section-label">MVola</span>
                <span className="text-lg font-bold text-tba-blue tabular-nums">034 10 608 02</span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-[#fcd34d] flex items-center justify-center text-black shadow-sm group-hover:scale-105 transition-transform duration-200">
                <Copy size={14} />
              </div>
            </div>

            <div
              onClick={() => copyToClipboard("0378717959", "Numéro Orange Money")}
              className="flex items-center justify-between p-4 rounded-xl bg-tba-surface border border-tba-border/50 cursor-pointer hover:bg-white hover:shadow-tba hover:border-tba-border transition-all duration-200 group"
            >
              <div className="flex flex-col">
                <span className="section-label">Orange Money</span>
                <span className="text-lg font-bold text-tba-blue tabular-nums">037 87 179 59</span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-[#fb923c] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform duration-200">
                <Copy size={14} />
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3 p-5 rounded-xl bg-tba-surface border border-dashed border-tba-border">
            <div className="w-28 h-28 bg-white rounded-xl p-2 shadow-inner-sm border border-tba-border/50 flex items-center justify-center overflow-hidden">
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=MVola:%200341060802%20|%20Orange%20Money:%200378717959"
                alt="QR Code Mobile Money"
                className="w-full h-full object-contain"
              />
            </div>
            <p className="text-[0.7rem] font-medium text-center text-tba-gray">
              Scannez le QR code pour un paiement rapide
            </p>
          </div>

          <a
            href="https://wa.me/261341060802"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => toast.info("Ouverture de WhatsApp...")}
            className="flex items-center justify-center gap-2.5 w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-semibold py-3.5 rounded-xl shadow-tba transition-all duration-200 active:scale-[0.97] text-sm"
          >
            <MessageCircle size={18} />
            Contacter sur WhatsApp
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
