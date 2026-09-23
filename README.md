# Enredo

Plotter de histórias para roteiristas: **Histórias → Episódios → Fases → Textos**, com quadros de estrutura, parede infinita, buracos e ligações na escrita, e maturação real.

Especificação de design: [`design_handoff_enredo_redesign/README.md`](design_handoff_enredo_redesign/README.md) (o protótipo em `prototype/` é só referência).

## Rodar

```bash
npm install
npm run dev
```

## Stack

Vite + React + TypeScript · React Router · Tailwind v4 · Zustand + Dexie (IndexedDB) · lucide-react · TipTap · vite-plugin-pwa.

## Estrutura

- `src/types.ts` — modelo de dados (Serie, Episode, Doc, Idea, Plan…)
- `src/db.ts` — banco Dexie (IndexedDB)
- `src/store.ts` — store Zustand; toda mutação grava no Dexie
- `src/data/constants.ts` — fases, status, quadros e tabelas fixas
- `src/data/seed.ts` — dados de exemplo (gravados na primeira abertura)
- `src/layout/AppShell.tsx` — barra lateral + conteúdo
- `src/pages/*` — telas
