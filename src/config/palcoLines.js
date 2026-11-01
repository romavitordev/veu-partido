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
  // os EVENTOS do mapa: anúncio antes, efeito igual para os dois (palcoHost.js)
  event: {
    haste: ['REGRA NOVA: todo mundo mais rápido! Corram, corram!', 'Acelera! A plateia está entediada!'],
    pain: ['REGRA NOVA: agora tudo dói mais! Para os DOIS, claro. Eu sou justo. Às vezes.', 'Golpes valem mais por alguns segundos. Aproveitem!'],
    melee: ['REGRA NOVA: só vale golpe físico! Sem tiro, sem ritual, na mão!', 'Larguem os brinquedos! Na porrada!'],
    energy: ['INTERVALO COMERCIAL! Sanidade de presente pros dois. Não se acostumem.', 'Patrocínio do Outro Lado: um pouco de energia pra cada um!'],
  },
};
