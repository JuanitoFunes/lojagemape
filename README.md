# Loja Gemape — Tema Shopify

Tema personalizado para a loja Gemape desenvolvido na plataforma Shopify.

## Estrutura

```
├── assets/        # CSS, JS, imagens e fontes
├── config/        # Configurações do tema (settings_schema, settings_data)
├── layout/        # Layouts base (theme.liquid, password.liquid)
├── locales/       # Arquivos de tradução (pt-BR, en, es, fr, ja, nb)
├── sections/      # Seções editáveis pelo customizador
├── snippets/      # Fragmentos reutilizáveis de Liquid
└── templates/     # Templates de página (product, collection, cart, etc.)
```

## Dependências de desenvolvimento

- [Shopify CLI](https://shopify.dev/docs/themes/tools/cli) — deploy e preview do tema
- [Sass](https://sass-lang.com/) — compilação dos arquivos `.scss`

## Instalação

```bash
npm install
```

## Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia servidor de preview local via Shopify CLI |
| `npm run push` | Faz deploy do tema para a loja |
| `npm run pull` | Baixa o tema atual da loja |
| `npm run check` | Valida o tema com Shopify Theme Check |
| `npm run sass:build` | Compila o arquivo SCSS principal |
| `npm run sass` | Compila SCSS em modo watch |

## Sincronização com GitHub

O projeto usa um hook do Kiro para fazer commit e push automático sempre que um arquivo é salvo.

---

Desenvolvido por JuanitoFunes
