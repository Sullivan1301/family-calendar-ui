"use client";

import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
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
        <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all w-full text-left group bg-tba-red/10 text-tba-red hover:bg-tba-red hover:text-white shadow-sm mt-4">
          <Heart size={18} className="transition-transform duration-300 group-hover:scale-110 fill-current" />
          Soutenir le développement
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-tba-blue font-serif">
            <Heart size={20} className="text-tba-red fill-current" /> 
            Soutenir le développement
          </DialogTitle>
          <DialogDescription className="text-tba-gray font-medium pt-2">
            Vous pouvez contribuer via MVola ou Orange Money pour m'aider à faire évoluer ce projet. 🇲🇬
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="flex flex-col gap-4">
            <div 
              onClick={() => copyToClipboard("0341060802", "Numéro MVola")}
              className="flex items-center justify-between p-4 rounded-2xl bg-tba-surface2 border border-tba-border/50 shadow-sm cursor-pointer hover:bg-white hover:shadow-md transition-all group"
            >
              <div className="flex flex-col">
                <span className="text-[0.6rem] font-black uppercase tracking-widest text-tba-gray-light">MVola</span>
                <span className="text-lg font-black text-tba-blue">034 10 608 02</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#fcd34d] flex items-center justify-center font-black text-[0.6rem] text-black shadow-sm group-hover:scale-110 transition-transform">
                <Copy size={14} />
              </div>
            </div>
            
            <div 
              onClick={() => copyToClipboard("0378717959", "Numéro Orange Money")}
              className="flex items-center justify-between p-4 rounded-2xl bg-tba-surface2 border border-tba-border/50 shadow-sm cursor-pointer hover:bg-white hover:shadow-md transition-all group"
            >
              <div className="flex flex-col">
                <span className="text-[0.6rem] font-black uppercase tracking-widest text-tba-gray-light">Orange Money</span>
                <span className="text-lg font-black text-tba-blue">037 87 179 59</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#fb923c] flex items-center justify-center font-black text-[0.6rem] text-white shadow-sm group-hover:scale-110 transition-transform">
                <Copy size={14} />
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 p-6 rounded-3xl bg-tba-blue/5 border-2 border-dashed border-tba-blue/20">
            <div className="w-32 h-32 bg-white rounded-2xl p-2 shadow-inner border border-tba-border flex items-center justify-center overflow-hidden">
              <img 
                src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=MVola:%200341060802%20|%20Orange%20Money:%200378717959" 
                alt="QR Code Mobile Money"
                className="w-full h-full object-contain"
              />
            </div>
            <p className="text-[0.7rem] font-bold text-center text-tba-gray">
              Scannez le QR code pour un paiement rapide
            </p>
          </div>

          <a 
            href="https://wa.me/261341060802" 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={() => toast.info("Ouverture de WhatsApp...")}
            className="flex items-center justify-center gap-3 w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-4 rounded-2xl shadow-lg shadow-green-500/20 transition-all active:scale-95"
          >
            <MessageCircle size={20} />
            Contacter sur WhatsApp
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
