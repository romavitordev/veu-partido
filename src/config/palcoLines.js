// O NARRADOR DO PALCO DO ANFITRIÃO (2026-11-01): o Anfitrião comenta a luta no mapa dele (src/arena/palcoHost.js).
// O tom é o de hostLines.js: agitado, prepotente, sarcástico, fala com a plateia, muda as regras. `{a}` = quem fez,
// `{b}` = quem sofreu. Falas originais (nada transcrito do cânone).

export const PALCO_LINES = {
  start: [
    'Senhoras, senhores e coisas! Bem-vindos ao MEU palco!',
    'Plateia, silêncio! ...Ninguém tava falando? Ótimo. Começa!',
    'Regras simples: lutem. As outras regras eu invento depois.',
    'Dois convidados, uma arena e eu. O melhor programa do Outro Lado!',
  ],
  first: [
    'Primeiro sangue para {a}! A plateia vai à loucura!',
    '{a} abriu o placar! {b}, meu bem, isso doeu até aqui em cima.',
    'Olha só, {a} começando! Eu AMO quando começa.',
  ],
  big: [
    'UUUH! {b} sentiu essa!',
    'Que pancada! Repete, {a}, a plateia não viu!',
    '{a}, você vai ganhar um prêmio. Não, mentira. Mas foi bonito.',
    'Isso vai deixar marca, {b}. Ótimo pra audiência.',
  ],
  combo: [
    'Combo! Combo! {a} não deixa {b} nem respirar!',
    '{b} virou saco de pancada. A plateia aprova!',
    'Quantos golpes foram? Perdi a conta. Ótimo.',
  ],
  special: [
    'O ESPECIAL! Todo mundo de pé!',
    'Agora sim, {a}! É disso que o meu público gosta!',
    'Alguém segura a câmera! {a} vai acabar com tudo!',
  ],
  transform: [
    'Mudou de figurino no meio do ato! Gostei, {a}!',
    '{a} mostrou a verdadeira cara! Plateia, aplaudam a feiura!',
    'Transformação! Agora a coisa fica divertida!',
  ],
  critical: [
    'Shhh... {b} está quase lá. Silêncio na plateia.',
    '{b}, um passo e acabou. Que tensão deliciosa.',
    'Ninguém respira! {b} está por um fio!',
  ],
  ko: [
    'FIM DE ATO! {b} ficou pelo caminho!',
    '{b} saiu de cena! Aplausos... ou não, tanto faz.',
    'E {a} sobra de pé! Que espetáculo!',
  ],
  // a ZOEIRA: o Anfitrião provoca um dos lutadores na abertura (as ligações do cânone de hostLines.js; quem não tem
  // ligação ganha a provocação geral)
  tease: {
    any: [
      '{a}, que figurino corajoso. A plateia vai rir muito de você. Quer dizer, COM você.',
      '{a}, você tem cara de quem cai no primeiro ato.',
      'Palmas para {a}, que veio de tão longe só pra apanhar no meu palco!',
    ],
    arnaldo: ['Arnaldo! O meu velho figurino! Ainda tô com saudade do seu corpo, sabia?'],
    gaius: ['Gaius! Como vão as costas? Ótimo, vão piorar.'],
    celestine: ['Celestine, a campeã dos meus jogos! Vamos ver se ainda tem sorte.'],
    magistrada: ['Ela! A única que pode me destronar! Plateia, VAIEM!'],
    kian: ['O menino do orfanato! Cresceu! Ainda não conjura nada perto de mim?'],
    dante: ['Dante, o estraga-prazeres do Jogo do Orfanato. Hoje não tem final feliz.'],
    erin: ['Erin! Ela de novo no meu programa! A audiência ama quando ela explode.'],
    verissimo: ['Veríssimo, o amigo do Arnaldo! Que reencontro emocionante. Pra mim.'],
    o_diabo: ['Sócio! Nada pessoal. Na verdade é bem pessoal.'],
    juan: ['O masoquista chegou! Plateia, ele GOSTA de apanhar!'],
    anfitriao: ['Eu contra... alguém. Plateia, já sabem pra quem torcer.'],
    amphitruo: ['Eu de toga! Que elegância a minha. Plateia, aplaudam a mim.'],
    carnical: ['Uma criatura de Lodo no meu palco! Alguém limpa o chão depois.'],
    amigo: ['O desenho da criança! Plateia, não olhem muito, mancha.'],
    degolificada: ['Uma moça de cabelo comprido no meu palco! Alguém traz uma escova. E uma tesoura.'],
    espreitador: ['Um espectador saiu do armário! Plateia, ele vai olhar vocês de volta.'],
  },
  // os EVENTOS do mapa: anúncio antes, efeito igual para os dois (palcoHost.js)
  event: {
    haste: ['REGRA NOVA: todo mundo mais rápido! Corram, corram!', 'Acelera! A plateia está entediada!'],
    pain: ['REGRA NOVA: agora tudo dói mais! Para os DOIS, claro. Eu sou justo. Às vezes.', 'Golpes valem mais por alguns segundos. Aproveitem!'],
    melee: ['REGRA NOVA: só vale golpe físico! Sem tiro, sem ritual, na mão!', 'Larguem os brinquedos! Na porrada!'],
    energy: ['INTERVALO COMERCIAL! Sanidade de presente pros dois. Não se acostumem.', 'Patrocínio do Outro Lado: um pouco de energia pra cada um!'],
  },
};
