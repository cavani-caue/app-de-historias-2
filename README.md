# Enredo

Plotter de histórias para roteiristas: **Histórias → Episódios → Fases → Textos**, com quadros de estrutura, parede infinita, buracos e ligações na escrita, e maturação real.

Especificação de design: [`design_handoff_enredo_redesign/README.md`](design_handoff_enredo_redesign/README.md) (o protótipo em `prototype/` é só referência).

## Rodar

```bash
npm install
npm run dev        # desenvolvimento em http://localhost:5173
npm run build      # build de produção (com service worker)
npx vite preview   # serve o build: dá pra instalar como app e usar offline
```

## O que tem

- **Histórias → Episódios → Fases → Textos**, com o personagem (PNG) vazando dos cards no hover.
- **Editor de roteiro** (TipTap) em tela cheia: blocos tipados, atalhos, buracos (Ctrl+J), ligações (Ctrl+K), autosave e exportação em .txt, .fountain e .html.
- **Ideação** e **Planejamento** (história e episódio) com os quadros: Anatomia, Jornada do herói, Propp, Curva de tensão, 3 atos, Escaleta, Save the Cat e Parede infinita.
- **Maturação real**: "Mandar maturar" tranca o texto até a data; dá para espiar em modo só leitura, e o app avisa quando destranca.
- **Backup**: os botões no pé da barra lateral baixam e abrem um `.json` com tudo (inclusive as imagens).
- **PWA**: instalável e offline. Tudo fica no navegador (IndexedDB); nada vai para servidor.

Em desenvolvimento, o store fica em `window.enredo` no console.

## Apps de celular e PC

O mesmo código vira um **app Android** (Capacitor, pasta `android/`) e um **app de Windows** (Electron, pasta `electron/`).
Os dois são gerados pelo GitHub Actions (`.github/workflows/apps.yml`) a cada push e publicados numa
[Release](../../releases/latest) com `Enredo.apk` e `Enredo-Setup.exe`.

- **Assinatura do Android:** o `.apk` só entra na Release se os segredos `ENREDO_KEYSTORE_BASE64` e
  `ENREDO_KEYSTORE_PASSWORD` estiverem configurados em *Settings → Secrets and variables → Actions*.
  Com a mesma chave, cada versão nova instala por cima da anterior sem apagar as histórias.
- **Rodar localmente:** `npm run desktop` (abre o app de PC) e `npm run android:sync` (copia o build para
  o projeto Android, que abre no Android Studio).
- No app, "Salvar" e "Baixar backup" usam o menu de compartilhar no Android e o "Salvar como" no PC.

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
- `src/boards/*` — quadros do Planejamento e a parede infinita
- `src/editor/*` — extensões do TipTap (bloco de roteiro e chip de ligação)
- `src/lib/*` — documento, exportação, ligações, backup e seletores
