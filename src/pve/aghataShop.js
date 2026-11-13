// OUTRO LADO — o BALCÃO DA AGHATA na tela de Melhorias permanentes (pedido do dono, 2026-11-12: "a página de melhorias
// pode ter um balcão da loja dela no RPG; quem atende é a Aghata, perguntando o que ele vai querer hoje, e depois
// comentando sobre o que ele escolheu"). PROPOSTA: todas as falas (escritas no tom dela: sorri antes de cortar).
export const AGHATA_LINES = {
  hello: [
    'Bem-vindo de volta. O que vai querer hoje?',
    'Ah, você sobreviveu. Que bom, eu ia sentir falta das moedas. O que vai ser?',
    'Entra, fecha a porta. O Outro Lado escuta. O que você precisa?',
    'Mais uma descida? Então vamos te deixar inteiro. O que vai querer?',
  ],
  buy: {
    vida: ['Mais vida. Escolha sensata: morto não volta pra comprar.', 'Isso aqui segura uma pancada a mais. Às vezes é a que importa.'],
    dano: ['Gostei. Quem bate mais forte termina mais cedo.', 'Dano. Ótimo. Só não corta o que não deve.'],
    defesa: ['Defesa. Você aprende rápido, ou apanhou muito.', 'Isso não impede o golpe. Só faz ele doer menos. É o melhor que eu tenho.'],
    sanidade: ['Sanidade é a moeda mais cara de todas. Esta saiu barata.', 'Cabeça no lugar. Lá embaixo ela tenta fugir.'],
    velocidade: ['Pernas mais rápidas. Fugir também é estratégia.', 'Mais rápido. A Degolificada não gosta de quem corre.'],
    recuperacao: ['Recuperar rápido é o segredo. Ninguém sai lá de baixo sem um arranhão.', 'Volta mais rápido do susto. Eu queria uma dessas pra mim.'],
    crescimento: ['Aprender mais rápido. A escola nunca te ensinou isso, né?', 'Mais experiência por inimigo. Eles vão te ensinar de graça.'],
    sorte: ['Sorte. Eu não acredito nela, mas vendo mesmo assim.', 'Mais baús bons. Se vier coisa ruim, não fui eu.'],
    ganancia: ['Ganância. Agora a gente se entende.', 'Mais moedas por descida. Eu também ganho com isso, não vou mentir.'],
    precisao: ['Precisão. Um corte bem dado vale por três.', 'Mira no ponto fraco. Todo mundo tem um.'],
    farto: ['Baús mais cheios. O Outro Lado guarda coisa boa pra quem procura.', 'Mais coisa por baú. Não me pergunta de onde vem.'],
    ressurreicao: ['…Você juntou tudo isso? Leva. Mas a morte cobra os juros depois.', 'Ressurreição. Eu nunca vendi uma dessas. Não desperdice.'],
    _: ['Boa escolha. Volta inteiro.'],
  },
  poor: ['Sem moedas, sem negócio. Desce mais um pouco e volta.', 'Isso custa mais do que você tem. Os baús lá embaixo não se abrem sozinhos.'],
  refundAsk: ['Quer desfazer tudo? Eu devolvo cada moeda. Aperta de novo pra confirmar.', 'Trocar de estratégia? Tudo bem, confirma que eu devolvo.'],
  refund: ['Pronto. ● {n} de volta. Monta algo melhor dessa vez.', 'Desfeito. ● {n} na sua mão. Eu gosto de quem muda de ideia.'],
  max: ['Essa já está no máximo. Nem eu consigo melhorar mais.', 'Mais que isso, só transcendendo. E eu não recomendo.'],
};

export const pickLine = (list) => list[Math.floor(Math.random() * list.length)];
export const buyLine = (id) => pickLine(AGHATA_LINES.buy[id] || AGHATA_LINES.buy._);
