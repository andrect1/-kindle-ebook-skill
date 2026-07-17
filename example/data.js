// Exemplo de "data.js" — adapte este objeto por livro, sem reescrever o
// build_docx_template.js do zero.

module.exports = {
  cover: {
    title: "100 Curiosidades Bíblicas",
    subtitle: "Fatos surpreendentes que poucos conhecem sobre as Escrituras",
    author: "",
  },

  // Opcional — se omitido, usa a paleta padrão ouro/azul/vinho
  themes: [
    { accent: "9C6B30", shade: "F6ECD9" },
    { accent: "1F4E79", shade: "DCE6F1" },
    { accent: "7A2048", shade: "F3DEE7" },
  ],

  hook: {
    hookTitle: "Você sabia disso?",
    hookParagraphs: [
      "A Bíblia é o livro mais lido da história — e também um dos mais mal compreendidos. Por trás de versículos familiares escondem-se detalhes que a maioria das pessoas nunca ouviu.",
      "Nas próximas páginas você vai descobrir curiosidades que vão mudar a forma como você lê passagens conhecidas — começando agora mesmo.",
    ],
  },

  parts: [
    {
      kicker: "Parte I",
      title: "Curiosidades do Antigo Testamento",
      intro: "Fatos surpreendentes escondidos nos livros mais antigos das Escrituras.",
      items: [
        {
          title: "01. O nome mais longo da Bíblia",
          body: "Mahershalalhashbaz, filho do profeta Isaías, carrega o nome próprio mais longo do texto bíblico.",
        },
        {
          title: "02. Uma arca maior que muitos navios modernos",
          body: "As dimensões da Arca de Noé, segundo o texto, se aproximam das de navios de carga do século XIX.",
        },
      ],
    },
    {
      kicker: "Parte II",
      title: "Curiosidades do Novo Testamento",
      intro: "Detalhes pouco conhecidos sobre os Evangelhos e as cartas apostólicas.",
      items: [
        {
          title: "03. Quatro relatos, quatro perspectivas",
          body: "Cada evangelho foi escrito para uma audiência diferente, o que explica variações nos detalhes narrados.",
        },
      ],
    },
    {
      kicker: "Parte III",
      title: "Curiosidades sobre Pessoas e Lugares",
      intro: "Personagens e locais que carregam histórias surpreendentes.",
      items: [
        {
          title: "04. A cidade reconstruída sete vezes",
          body: "Jericó foi ocupada e destruída em múltiplas camadas arqueológicas ao longo de milênios.",
        },
      ],
    },
  ],

  conclusion: {
    title: "Conclusão",
    paragraphs: [
      "Esperamos que essas curiosidades tenham despertado uma nova curiosidade pela leitura das Escrituras.",
      "Obrigado por ler até aqui!",
    ],
  },
};
