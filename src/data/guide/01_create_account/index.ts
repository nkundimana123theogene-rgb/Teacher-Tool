export interface SystemGuideItem {
  id: string;
  number: number;
  title: string;
  category: string;
  summary: string;
  details: string[];
  keywords: string[];
}

export const item01: SystemGuideItem = {
  id: "guide_01_create_account",
  number: 1,
  title: "1. Create Account (Kurema Konti Nshya)",
  category: "Authentication",
  summary: "Uburyo mwarimu mushya yandikisha konti muri Teacher Tool kugira ngo atangire gukora amateguro n'ibizamini.",
  details: [
    "Kanda kuri bouton ya 'Sign In / Register' iri hejuru ku rubuga.",
    "Hitamo tab ya 'Register' hanyuma uzuze izina ryawe, Email, Numero ya telefoni (WhatsApp), izina ry'ishuri ryabo, n'ijambo ry'ibanga (Password).",
    "Mukina ukanda 'Register Account', umwarimu ahita ahabwa konti nshya mu sekondi 1 hamwe n'ama-units y'impuza-mahuriro bwo kugerageza gukora amateguro.",
    "Amakuru yose abikwa neza mu buryo bwiteguye muri Firestore Cloud Database."
  ],
  keywords: ["account", "register", "sign up", "kurema konti", "kwiyandikisha"]
};
