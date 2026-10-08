# Handoff: Enredo — redesign completo (histórias → episódios → fases → escrita)

## Overview
Enredo é um plotter de histórias para roteiristas. Este redesign troca a interface atual (sidebar branca + cards) por uma interface calorosa e ilustrada. Também reorganiza o app em uma hierarquia clara:

**Histórias (séries/longas)** → **Episódios** → **Fases** (Brainstorming, Planejamento, Vomit draft, Maturação, 2ª versão, Refino, Pronto) → **Textos** (vários por fase), mais um **Planejamento** com quadros de estrutura, que existe tanto por história quanto por episódio.

Três conceitos centrais do produto:
1. **Personagem vazando do quadro**: cards de história e de fase têm um PNG de personagem (só o personagem, fundo transparente) que fica inteiro dentro do quadro e, no hover, cresce e "vaza" para fora dele. O fundo do quadro é a cor da fase.
2. **Maturação**: o texto fica trancado com um relógio até a data de liberação; só depois pode ser relido e editado.
3. **Buracos e ligações na escrita**: o autor marca onde travou (Ctrl+J) e liga o texto a post-its, etapas da jornada do herói, pontos da linha do tempo, episódios e ideias (Ctrl+K), com um botão de voltar rápido.

## About the Design Files
Os arquivos em `prototype/` são **referências de design feitas em HTML**: protótipos que mostram o visual e o comportamento pretendidos, **não código de produção para copiar**. A tarefa é **recriar esses designs no código existente do Enredo** (React + TypeScript + Vite, React Router, Tailwind v4, lucide-react, framer-motion), seguindo os padrões do repositório: `src/layout/AppShell.tsx`, `src/pages/*`, `src/components/*`, `src/data/defaults.ts`, `src/types.ts`, `src/index.css`.

Para abrir o protótipo: sirva a pasta `prototype/` (ex.: `npx serve prototype`) e abra `Enredo.dc.html`. Ele usa `support.js`, o runtime do protótipo; não leve isso para o app. Toda a lógica está no `<script>` da classe `Component`, no fim do arquivo: estado, dados de exemplo, editor, parede e ligações. Use-a como especificação de comportamento.

## Fidelity
**High-fidelity.** Cores, tipografia, raios, sombras, espaçamentos e interações são finais. Recrie pixel a pixel usando Tailwind (valores arbitrários ou tokens no `@theme`) e componentes React. O dado de exemplo (A Casa Vazia, Marina e o Rio…) é só demonstração: substitua pelos dados reais do store.

---

## Design Tokens

### Cores
| Token | Hex | Uso |
|---|---|---|
| desk | `#a8734f` | fundo geral do app ("mesa") com grade de pontos `radial-gradient(rgba(58,35,24,.10) 1px, transparent 1px)` 26px |
| rail | `#3a2318` | barra lateral de ícones |
| rail-ink | `#e8d5bd` | ícones inativos na barra |
| rail-active-bg | `#f2e3cf` | ícone ativo (fundo) |
| paper | `#f7ecdc` | cards claros |
| paper-2 | `#fffdf7` | páginas, post-its do editor, popovers |
| ink | `#2a1b12` | texto principal / botões primários (hover `#000`) |
| ink-soft | `rgba(42,27,18,.68)` | subtítulos |
| ink-muted | `rgba(42,27,18,.55)` | rótulos uppercase |
| accent | `#a8432f` | terracota: marca, planejamento, destaque |
| gold | `#f5c518` | réguas e indicadores |
| link | `#2c5bd1` / bg `#e6edff` | ligações no texto e "Voltar ao texto" |
| gap | bg `#fff3b8`, borda tracejada `#c98f00`, texto `#5a3e00` | buracos |
| editor-desk | `#e7dcc9` | fundo do modo escrita |
| wall | `#efe6d6` + pontos `rgba(58,35,24,.22)` | parede infinita |
| divisórias | `rgba(58,35,24,.14–.24)` | bordas e separadores |

### Fases (cor / tinta do texto / réguas)
| Fase | bg | ink | rule |
|---|---|---|---|
| Brainstorming | `#7b3fe4` | `#fdf6e8` | `#f5c518` |
| Planejamento | `#e8a12a` | `#2c1005` | `#2c1005` |
| Vomit draft | `#25a244` | `#0d2a12` | `#0d2a12` |
| Maturação | `#0f6e63` | `#eafaf3` | `#7fe0c4` |
| 2ª versão | `#2c5bd1` | `#f0f4ff` | `#f5c518` |
| Refino | `#e8622a` | `#2c1005` | `#2c1005` |
| Pronto (por ora) | `#1e1b18` | `#f4e9d8` | `#f4e9d8` |

Cada card de fase tem ainda um halo `0 0 0 7px <cor da fase com ~.28 de alfa>` e um "ghost" (número gigante e formas) em tinta a ~.12 de alfa.

### Status de episódio
Canônico `#25a244`/`#0d2a12` · Temporário `#e8a12a`/`#2c1005` · Ideia `#7b3fe4`/`#fdf6e8` · Descartado `rgba(58,35,24,.22)`/`rgba(42,27,18,.7)`, com a linha inteira a 45% de opacidade.

### Tipografia (Google Fonts)
- **Instrument Serif** 400 (+ itálico): títulos de tela 52–56px/1.0, títulos de card 24–28px, textos de post-it 18–20px.
- **Archivo Black**: rótulos de fase em UPPERCASE 17–20px/1.05, números grandes.
- **JetBrains Mono** 500/700: contadores, relógios e metadados, 10.5–12px.
- **Courier Prime** 400/700: página do roteiro, 15.5px/1.62.
- UI: `system-ui` 12–14px. Rótulos de seção: 11px, 700, uppercase, letter-spacing .12em.

### Raios
Barra lateral 26px · cards grandes 24–30px (cards de fase 30px) · capa interna 18px · pills 999px · botões de ícone 15px (na barra) e 10–11px (no editor) · fichas STC 3px · post-its 0–4px.

### Sombras
- Card: `0 18px 38px -22px rgba(35,18,9,.6)`
- Card de fase: `0 22px 46px -16px rgba(35,18,9,.65)` + halo
- Botão primário: `0 10px 22px -10px rgba(30,15,8,.8)`
- Popover: `0 26px 50px -18px rgba(35,18,9,.65)`
- Post-it: `0 12px 22px -12px rgba(35,18,9,.7)`

---

## Screens / Views

### Shell
- Layout `flex`, `gap:14px`, `padding:14px`, fundo desk.
- **Barra lateral**: 74px de largura, sticky, altura `calc(100vh - 28px)`, radius 26px, cor rail. De cima para baixo:
  - Logo: quadrado de 42px, paper, "E" em Instrument Serif na cor accent.
  - Botões de 46×46: Histórias, Todos os textos, Maturando (com ponto dourado quando há texto trancado), Quadro geral.
  - Embaixo: Baixar backup e Abrir backup. Aproveite o export/import que já existe.
- **Conteúdo**: `padding:22px 16px 48px`.

### 1. Histórias (início)
- Cabeçalho: H1 "Histórias", subtítulo e botão pill "Nova história" (ink, texto `#f7ecdc`, padding 13×22).
- Grade `repeat(auto-fill,minmax(300px,1fr))`, gap 26 / row-gap 34.
- **Card**: paper, radius 26, padding `12px 12px 16px`.
  - Capa 4:3, radius 18, fundo na cor da fase atual da história + `radial-gradient(circle at 50% 58%, <glow>, transparent 62%)`.
  - PNG do personagem em `inset:6% 8%`, `object-fit:contain`.
  - **Hover**: o personagem faz `translateY(-14%) scale(1.3)` em .34s `cubic-bezier(.2,.8,.2,1)`, sem clip, e sai do quadro. O card ganha z-index alto.
  - Rodapé do card: título 28px, meta 12px e pill do tipo (Série/Longa).
- Último item: card tracejado "Nova história".

### 2. História
- Voltar "← Histórias", H1 com o título e subtítulo (tipo · N episódios · N ideias).
- Três cards de entrada em `auto-fit minmax(260px,1fr)`:
  - **Ideação da história** (roxo): contagem de ideias e destacadas.
  - **Planejamento da história** (accent): "N episódios previstos".
  - **Onde a história está**: lista de fases com contagem de textos.
- "Episódios" + botão "Novo episódio". Cada card mostra:
  - número 54×54 na cor da fase;
  - título, logline;
  - pills de fase e de status, e "N textos".

### 3. Ideação da história
Vale para a história inteira.
- **Captura**: input grande em Instrument Serif 24px. Chips de tipo (Trama, Cena, Diálogo, Personagem, Mundo, Reviravolta) com o ativo em ink. Enter ou "Guardar ideia" salva.
- **Filtros**: Todas, Destacadas e os tipos.
- **Biblioteca**: grade de notas coloridas levemente rotacionadas (±1.6°), que endireitam no hover.
  - A estrela destaca a nota: anel de 3px em ink, e destacadas vêm primeiro.
  - "virar episódio →" em cada nota.

### 4. Planejamento (história OU episódio, mesma tela)
- Escopo: `planScope = 'serie' | 'episode'`. Os dados ficam em `plans[serieId]` ou `plans['ep:'+episodeId]`.
- Título: "Planejamento da história" ou "Planejamento do episódio".
- **Cards de topo**:
  - Premissa: textarea em Instrument Serif 21px.
  - Pergunta dramática: itálico 19px.
  - Princípio narrativo: 13.5px.
  - Só no escopo história: Formato (chips), Episódios previstos (−/+ e "N sem lugar na grade") com contadores de status, e Arcos (lista com uma barrinha por episódio colorida pelo status).
- **Estrutura**: abas em pill, com os quadros ativos por plano. "+ adicionar quadro" abre a grade de quadros disponíveis.
  - Padrão na história: anatomia, jornada, atos, fichas, postits, timeline.
  - Padrão no episódio: anatomia, escaleta, atos, postits, fichas.
- **Grade de episódios** (só no escopo história): uma linha por episódio com número (cor do arco), título, logline e pills clicáveis que ciclam **Função** (Piloto, Aprofunda, Virada, Respiro, Clímax, Final, Único), **Arco**, **Fase** e **Status**; mais a contagem de textos.

#### Quadros
1. **Anatomia da história (Truby)**: 7 cards com rótulo, dica e textarea. Falha e necessidade · Desejo · Oponente · Plano · Batalha · Autorrevelação · Novo equilíbrio.
2. **Jornada do herói (infográfico)**:
   - Círculo em `inset:20%` de um quadrado. Metade de cima paper ("Mundo comum"), metade de baixo `#1e1b18` ("Mundo especial"), linha tracejada accent no meio com o rótulo "limiar".
   - 12 nós em círculo, raio 30% e ângulo `-105° + i·30°`. As etapas 5–10 ficam na metade escura.
   - Nós de 46px (58px o selecionado, em accent). Rótulos em raio 37%, com max-width 96px.
   - **Selo amarelo** no nó com a contagem de buracos ligados àquela etapa. **Anel vermelho tracejado** nas etapas vazias (sem nota e sem buraco).
   - Painel lateral: número, mundo, ‹ ›, nome, textarea pautada, "Etapa vazia", lista de "Buracos nesta etapa" (clica e abre o texto) e o resumo.
   - Etapas: Mundo comum, Chamado à aventura, Recusa do chamado, Encontro com o mentor, Travessia do limiar, Provas aliados e inimigos, Aproximação da caverna, Provação, Recompensa, Caminho de volta, Ressurreição, Retorno com o elixir.
3. **31 funções de Propp**: chips que alternam ligado/desligado (ligado em roxo), com contador.
4. **Curva de tensão**: uma barra por episódio (altura `28 + t·34`px, t de 1 a 5, com + e −) na cor do status; clique abre o episódio.
5. **Linha do tempo · 3 atos** (baseada no diagrama clássico):
   - SVG em viewBox 1000×430. Linha grossa (13px) de (40,360) até (795,160) e de lá até (975,360). Base em y=360. Divisórias de ato em x=300 e x=795. Linha tracejada do ponto médio em x=545, entre y 245 e 360. Legendas "Ato 1 · preparação", "Ato 2 · confronto", "Ato 3 · resolução".
   - 14 pontos: estrela de 8 pontas para os clímax e o ponto médio, hexágono pequeno para os demais. Cada ponto tem um tick vertical com altura própria: `[40,72,40,60,40,72,90,40,90,40,120,60,90,40]`.
   - **Os rótulos são divs HTML posicionados por cima do SVG, não `<text>`**.
   - Clicando num ponto, o painel mostra a nota e o vínculo com um episódio. Preenchido = ink, selecionado = accent.
6. **Escaleta**:
   - Lista numerada de cenas: cabeçalho em Courier bold uppercase + uma linha do que acontece, com ▲▼×.
   - "Virar vomit draft →" cria um texto na fase Vomit draft do episódio, com um bloco de cena e um de ação por linha, e abre o editor.
7. **Fichas · Save the Cat**:
   - Faixa com as 15 batidas e suas páginas: Imagem de abertura 1, Tema declarado 5, Preparação 1–10, Catalisador 12, Debate 12–25, Virada para o 2 25, História B 30, Diversão e jogos 30–55, Ponto médio 55, Os vilões se aproximam 55–75, Tudo está perdido 75, Noite escura da alma 75–85, Virada para o 3 85, Final 85–110, Imagem final 110.
   - 4 fileiras em cortiça (`#5c3a26` com pontilhado): Ato 1, 2A, 2B e 3.
   - **Ficha**: 212px, topo de 7px na cor da trama (A `#2c5bd1`, B `#d62e7b`, C `#e8a12a`); cabeçalho INT./EXT.; descrição; rodapé com **+/−** clicável (ciclo +/−, −/+, +/+, −/−) e **><** seguido de "quem contra quem"; beat clicável; ▲▼ muda de fileira; ×.
8. **Parede infinita**: veja Interações.

### 5. Episódio
- Voltar para a história, H1 "ep. 01 — Título".
- Cards em `auto-fit minmax(280px,1fr)`:
  - **Pergunta dramática do episódio**: textarea ligada a `plans['ep:id'].pergunta`, com a pill de status clicável e a logline.
  - **Brainstorming** (roxo): abre a parede do episódio em tela cheia.
  - **Planejamento do episódio** (accent): abre o Planejamento no escopo episódio.
- **Fases do episódio**: grade `auto-fill minmax(236px,1fr)` de cards 24:37, radius 30, na cor da fase, com número ghost de 124px e formas ghost.
  - Topo: pill de status ("N textos", "N post-its", "N cenas na escaleta"), mais o relógio "Xd Yh" na Maturação.
  - Base: título em Archivo Black, régua de 34×2 e descrição.
  - O PNG do personagem ocupa `left/right 8%, top 14%, bottom 26%`. **Hover**: `translateY(-16%) scale(1.42)`, vazando o quadro.
- **Clique por fase**:
  - Brainstorming → parede do episódio em tela cheia.
  - Planejamento → Planejamento do episódio.
  - Demais fases → lista de textos da fase.

### 6. Fase (lista de textos)
- Chip "história · episódio", H1 com a fase, descrição e botão "Novo <substantivo da fase>".
- Na Maturação: banner verde-petróleo com relógio (dias, horas, min, seg).
- Cards de texto: formato, título, meta, "Abrir" e **Ligar**. Ligar abre um popover para mover o texto a qualquer episódio e fase.
- Várias versões por fase são intencionais: "tentativa 1", "tentativa 2"…

### 7. Todos os textos / Quadro geral / Maturando
- **Todos os textos**: todos os textos com a pill "história · ep · fase" e Ligar.
- **Quadro geral**: kanban horizontal por fase (colunas de 250px).
- **Maturando**: card grande verde-petróleo com relógio de 4 blocos e barra de progresso; ao lado, as durações (3 dias, 1 semana, 1 mês, escolher data) e a lista do que também está maturando.

### 8. Escrita (tela cheia, `position:fixed; inset:0`)
- **Barra superior** (paper-2):
  - "← Sair da escrita", título, pill da fase, subtítulo.
  - **Esconder painel / Mostrar painel** (Ctrl+\).
  - **Salvar no PC**: menu com .txt (roteiro formatado com espaços), .fountain e .html.
  - **Mandar maturar**.
- **Segunda linha**:
  - B, I, U, lista, desfazer, refazer.
  - **Ligação** (Ctrl+K, pill azul).
  - Botões de bloco: INT., EXT., INT./EXT., AÇÃO, PERSONAGEM, (PAREN.), DIÁLOGO, TRANSIÇÃO, NOTA, **??? BURACO** (destacado em amarelo).
- **Painel esquerdo** (266px, paper, `overflow-x:hidden`):
  - Cenas (clique rola até a cena).
  - **Buracos**, com contador e "próximo ↓": cada item mostra o texto em itálico e uma pill "ligar à jornada" que cicla pelas etapas 01–12.
  - Outros textos desta fase.
  - Atalhos.
  - Com o painel escondido, uma lingueta "›" na borda esquerda reabre.
- **Página**:
  - Max-width 880, paper-2, radius 8, padding `clamp(40px,7vw,88px) clamp(22px,7vw,104px) 140px`.
  - Editor contentEditable com blocos `div[data-t]`: scene (uppercase bold, margem 26/12), action, character (padding-left 38%, uppercase), paren (31%/30%, itálico), dialog (22%/24%), transition (à direita, uppercase bold), note (itálico, 45%), **gap** (fundo `#fff3b8`, borda tracejada 1.5px `#c98f00`, radius 8, itálico).
- **Rodapé**: palavras, ~páginas (scrollHeight/940), cenas, "N buracos" (clicável) e "salvo agora / digitando…".

---

## Interactions & Behavior

### Editor de roteiro
- **Enter** cria o próximo bloco: scene→action, character→dialog, paren→dialog, dialog→action, transition→scene, gap→action.
- **Tab / Shift+Tab** cicla o tipo do bloco: action, character, dialog, paren, scene, transition.
- Ctrl+1 INT., Ctrl+2 EXT., Ctrl+3 ação, Ctrl+4 personagem, Ctrl+5 parêntese, Ctrl+6 diálogo, Ctrl+7 transição.
- **Ctrl+J** insere um buraco ("??? ") após o bloco atual. **Ctrl+Shift+J** pula para o próximo buraco, rolando e piscando `#ffd84a → #fff3b8` em 900ms.
- **Ctrl+K** abre o seletor de ligação; **Ctrl+\\** esconde ou mostra o painel.
- Autosave com debounce de 600ms. Hoje salva em `localStorage['enredo-doc-<id>']`; migre para o store real.
- Modelo sugerido: guarde o documento como **lista de blocos tipados** `{type, text, stage?, links?}` em vez de HTML. Isso facilita exportar e contar buracos. Uma alternativa é TipTap/ProseMirror com nós customizados.

### Buracos
- Bloco `type:'gap'` com `stage?: 0..11`.
- Os buracos de todos os textos da história (ou do episódio) alimentam os selos e a lista da Jornada do herói.

### Ligações
- Chip inline (não editável) `↗ rótulo`: `#e6edff`/`#2c5bd1`, 12px, radius 999.
- Alvos: `note {k: scopeKey, id}` · `stage {s, i}` · `beat {k, i}` · `episode {id}` · `idea {s, id}`.
- **Seletor**: modal de 520px com busca e lista (cor, rótulo, grupo). Grupos: Post-its da história, Post-its do episódio, Jornada do herói, Linha do tempo · 3 atos, Episódios, Ideias.
- **Clique no chip**: popover de 300px com tipo, rótulo, prévia do conteúdo, "Ir até lá →" e "remover ligação".
- **Ir até lá**: salva `returnTo = {docId, scrollTop}` e navega até o alvo:
  - post-it: abre a parede em tela cheia, centraliza e destaca com anel azul de 5px por 2.4s;
  - etapa: abre a aba Jornada com a etapa selecionada;
  - ponto: abre a aba 3 atos;
  - episódio ou ideia: abre a tela correspondente.
- Botão fixo **"← Voltar ao texto"** (pill azul `#2c5bd1`, canto inferior direito, z 700): reabre o editor e restaura o scroll.

### Parede infinita
- **Estado**: `{vx, vy, scale, mode, pen, color, strokes[], groups[], notes[]}` por escopo.
- **Ferramentas**: Mover (arrasta o fundo para navegar), Caneta (traço livre em SVG, desenha **por cima** dos post-its, que ficam com `pointer-events:none` nesse modo), Post-it (clique cria na cor escolhida) e **Grupo** (arraste para desenhar uma moldura).
- **Post-it**: faixa superior de 22px para arrastar, × para apagar, textarea em Instrument Serif 18px, **alça de redimensionar** no canto inferior direito (mínimo 120×90).
- **Grupo**: moldura tracejada na cor da caneta com fundo tingido a ~7%, pill de título editável com contagem, ×, e alça de redimensionar (mínimo 160×120). Arrastar o título move o grupo **e os post-its cujo centro está dentro dele**.
- **Zoom**: roda do mouse com zoom **no cursor** (`k = exp(-deltaY·0.0015)`, de 0.35 a 2.4). O listener de `wheel` precisa ser **não-passivo** com `preventDefault`, senão a página rola junto. Shift+roda move na horizontal. Há também −, %(reset) e +.
- **Tela cheia**: wrapper fixo com `inset:0`, `display:flex; flex-direction:column; height:100vh`; a parede fica com `flex:1; min-height:0`. Esc sai.
- Padrões: cores de post-it `#f4e08a #f4b7c0 #b9e0a5 #a8d0e6 #c9b6e4 #f2b26b`; canetas `#2a1b12 #a8432f #2c5bd1 #25a244`.
- Recomendação: considere **tldraw** ou **react-konva** se quiser desempenho e desfazer; o protótipo usa DOM + SVG.

### Navegação (rotas sugeridas)
`/` histórias · `/h/:serieId` · `/h/:serieId/ideias` · `/h/:serieId/plano` · `/h/:serieId/ep/:epId` · `/h/:serieId/ep/:epId/plano` · `/h/:serieId/ep/:epId/fase/:phaseId` · `/texto/:docId` · `/textos` · `/quadro` · `/maturando`.

### Maturação
Hoje é só visual. Implemente `lockedUntil` no texto: o editor e a leitura ficam bloqueados até a data, com opção explícita de "Ver mesmo assim" e aviso.

---

## State / Data model (sugestão)
```ts
Serie { id, title, kind: 'Série'|'Longa'|'Curta', coverPng?, createdAt }
Episode { id, serieId, num, title, logline, phase: PhaseId, status: 'canon'|'temp'|'idea'|'cut', arcId, func }
Doc { id, episodeId, phase: PhaseId, title, format, blocks: Block[], lockedUntil?, updatedAt }
Block { id, type: 'scene'|'action'|'character'|'paren'|'dialog'|'transition'|'note'|'gap', text, stage?: number, links?: Link[] }
Idea { id, serieId, kind, text, color, pinned, createdAt }
Plan { // chave: serieId ou 'ep:'+episodeId
  premissa, pergunta, principio, formato?, previstos?, boards: BoardId[],
  anatomia: Record<key,string>, journeyNotes: Record<0..11,string>, propp: Record<0..30,bool>,
  tension: Record<epId,1..5>, atos: Record<0..13,{note, ep?}>, escaleta: {heading,text}[],
  stc: {row:0..3, title, text, emo, conflict, story:'A'|'B'|'C', beat}[],
  wall: { vx, vy, scale, strokes:{d,color}[], groups:{id,x,y,w,h,title,color}[], notes:{id,x,y,w,h,color,text}[] }
}
Arc { id, serieId, title, color }
PhaseArt { phaseId, png } // arte padrão por fase (usuário substitui)
```
Persista tudo, por exemplo em IndexedDB via Dexie ou no store atual. O protótipo guarda quase tudo em memória.

## Assets
- **PNGs de personagens**: o usuário envia (só o personagem, fundo transparente). Um por história (capa) e um por fase (padrão global, com possível override por história). No protótipo são drop-zones `<image-slot>`; no app, faça upload e guarde como blob.
- **Ícones**: SVGs inline simples; troque pelos equivalentes do `lucide-react`, que o repositório já usa.
- **Fontes**: Google Fonts (Instrument Serif, Archivo Black, JetBrains Mono, Courier Prime).

## Files
- `prototype/Enredo.dc.html`: protótipo completo. Template em cima; lógica na classe `Component` no fim: constantes de dados (SERIES, PHASES, EPISODES, DOCS, IDEAS, JOURNEY, PROPP, ATOS, STC_*, ESC_SEED), editor, parede e ligações.
- `prototype/support.js`, `prototype/image-slot.js`: runtime do protótipo e drop-zone de imagem. Apenas referência.

## Notas para quem implementar
- Não havia acesso ao repositório no momento do handoff. Confirme os nomes de arquivos e tipos reais em `src/types.ts` e adapte o modelo acima.
- Priorize nesta ordem: (1) hierarquia história → episódio → fase → texto e persistência; (2) editor com blocos, atalhos, buracos e export; (3) parede infinita; (4) quadros de estrutura; (5) ligações e voltar ao texto; (6) maturação real.
