# kindle-ebook-skill

Skill para gerar e-books estilizados (.docx) para Amazon Kindle Direct Publishing (KDP),
com layout colorido em "cards", capa persuasiva em SVG e otimização para o "Look Inside".

## O que tem aqui

```
kindle-ebook-skill/
├── SKILL.md                        # regras da skill (Look Inside, paleta, checklist)
├── scripts/
│   ├── build_docx_template.js      # motor do manuscrito (.docx)
│   └── build_cover_template.js     # motor da capa (SVG -> JPEG, 1600x2560)
├── example/
│   ├── data.js                     # exemplo de conteúdo pro manuscrito
│   └── cover-data.js               # exemplo de conteúdo pra capa
└── assets/fonts/                   # Cinzel + Cormorant Garamond (OFL) — adicione aqui
```

## Requisitos

- Node.js + pacote `docx` (`npm install docx`)
- `librsvg2-bin` (`apt-get install -y librsvg2-bin`) para `rsvg-convert`
- `imagemagick` (`apt-get install -y imagemagick`) para exportar JPEG
- LibreOffice (`soffice`) + `pdftoppm` (poppler) — só se quiser renderizar o docx
  pra conferência visual, como o SKILL.md recomenda

## Uso rápido

### Manuscrito

```bash
node scripts/build_docx_template.js example/data.js output.docx
```

Adapte `example/data.js` (título, tema de cores, hook, partes e itens) por livro —
não é preciso reescrever `build_docx_template.js`.

### Capa

```bash
node scripts/build_cover_template.js example/cover-data.js cover.jpg
```

Para usar as fontes elegantes (`Cinzel`, `Cormorant Garamond`) em vez de fontes
padrão do sistema:

```bash
mkdir -p ~/.fonts
cp assets/fonts/*.ttf ~/.fonts/
fc-cache -f
```

Depois troque `titleFont`/`subtitleFont` em `cover-data.js` para `"Cinzel"` e
`"Cormorant Garamond"`.

## Fontes (licença OFL)

As fontes não estão versionadas neste repo por padrão — baixe do Google Fonts:

```bash
curl -L -o assets/fonts/Cinzel.ttf \
  https://raw.githubusercontent.com/google/fonts/main/ofl/cinzel/Cinzel[wght].ttf
curl -L -o assets/fonts/CormorantGaramond-Regular.ttf \
  https://raw.githubusercontent.com/google/fonts/main/ofl/cormorantgaramond/CormorantGaramond-Regular.ttf
curl -L -o assets/fonts/CormorantGaramond-Italic.ttf \
  https://raw.githubusercontent.com/google/fonts/main/ofl/cormorantgaramond/CormorantGaramond-Italic.ttf
```

(Confirme os caminhos exatos no repositório `google/fonts` — a estrutura de
arquivos varia por família.)

## Checklist antes de publicar um e-book (ver SKILL.md, seção 4)

- [ ] Front matter mínimo (capa + sumário curto)
- [ ] Hook real antes do sumário/outline
- [ ] Estimativa do corte de ~10% do "Look Inside" informada ao usuário
- [ ] Paleta de 3 cores + cards com fundo sombreado (não parágrafos simples)
- [ ] Páginas renderizadas em imagem e conferidas visualmente
- [ ] Capa em 1600×2560px, fontes não-padrão, hook line clara, conferida em tamanho real
- [ ] `.docx` + capa entregues juntos
