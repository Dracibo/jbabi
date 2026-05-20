import { z } from "zod";

export const DeliveryRowSchema = z.object({
  date: z.date(),
  livreur: z.string().min(1),
  soldeInitial: z.number(),
  nbLivraisons: z.number().int().nonnegative(),
  montantTotal: z.number(),
  carburant: z.number(),
  reparation: z.number(),
  autresDepenses: z.number(),
  totalDepenses: z.number(),
  recetteNette: z.number(),
  nouveauSolde: z.number(),
  observation: z.string().optional(),
});

export type DeliveryRow = z.infer<typeof DeliveryRowSchema>;

export type Granularity = "day" | "week" | "month";

export type Period = {
  from: Date;
  to: Date;
};

export type CourierStat = {
  name: string;
  jours: number;
  livraisons: number;
  montant: number;
  depenses: number;
  recette: number;
};

export type DailyPoint = {
  label: string;
  date: Date;
  livraisons: number;
  /** Chiffre d'affaires brut — somme de la colonne "Montant total livraisons (F)". */
  chiffreAffaires: number;
  depenses: number;
  /** Recette nette = chiffre d'affaires − dépenses (somme de la colonne "Recette nette (F)"). */
  recetteNette: number;
  carburant: number;
  reparation: number;
  autres: number;
};

export type Kpi = {
  livraisons: number;
  livraisonsPrev: number;
  /** Chiffre d'affaires brut (somme de "Montant total livraisons"). */
  chiffreAffaires: number;
  chiffreAffairesPrev: number;
  /** Recette nette (somme de "Recette nette"). */
  recetteNette: number;
  recetteNettePrev: number;
  depenses: number;
  depensesPrev: number;
  coutParLivraison: number;
  coutParLivraisonPrev: number;
};
