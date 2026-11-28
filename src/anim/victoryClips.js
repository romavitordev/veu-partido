// Poses de VITÓRIA de cada personagem (tela de vitória: os vencedores de frente para a câmera). Antes quase todos
// erguiam o mesmo punho. Cada uma conversa com a arma e o jeito do personagem.
// Chamado no fim de clips.js (recebe CLIPS e o ajudante de keyframe, sem import circular).

export function addVictoryClips(CLIPS, k) {
  const STAND = { h: -0.02, hip: [0, 0, 0], sp: [0, 0, 0], hd: [0, 0, 0], sL: [0.05, 0, 0.15], eL: [-0.3, 0, 0], sR: [0.05, 0, -0.15], eR: [-0.3, 0, 0], lL: [-0.1, 0, 0.12], kL: [0.12, 0, 0], lR: [0.1, 0, -0.12], kR: [0.12, 0, 0] };
  // entra na pose e respira de leve no fim (fica parada na última pose)
  const pose = (p) => {
    const P = { ...STAND, ...p };
    return { dur: 1.3, keys: [k(0, STAND), k(0.55, P), k(1, { ...P, h: (P.h || 0) - 0.02 })] };
  };
  Object.assign(CLIPS, {
    // Kaiser: M4 apoiada no ombro direito, cabeça inclinada, "queimada, séria e perigosa"
    vic_kaiser: pose({ hip: [0, 0.2, 0], sp: [-0.05, -0.2, 0], hd: [0.05, 0.3, 0.1], sR: [-2.0, 0.3, -0.6], eR: [-2.3, 0, 0], sL: [0.1, 0, 0.25], eL: [-0.35, 0, 0] }),
    // Joui: katana baixa na diagonal, a outra mão no peito e a cabeça baixa (calma de duelista)
    vic_joui: pose({ sp: [0.15, 0, 0], hd: [0.35, 0, 0], sR: [-0.5, 0, -0.45], eR: [-0.2, 0, 0], sL: [-1.2, -0.6, 0.1], eL: [-1.6, 0, 0] }),
    // Aghata: faca perto do rosto, o grimório na outra mão, corpo de lado
    vic_aghata: pose({ hip: [0, -0.3, 0], sp: [0, 0.3, 0.1], hd: [-0.1, -0.3, 0.15], sR: [-2.0, 0.5, -0.2], eR: [-2.0, 0, 0], sL: [-0.9, -0.5, 0.2], eL: [-1.4, 0, 0] }),
    // Gal: braços abertos para baixo com as lâminas nas correntes, queixo erguido
    vic_gal: pose({ sp: [-0.15, 0, 0], hd: [-0.3, 0, 0], sL: [-0.3, 0, 0.9], eL: [-0.2, 0, 0], sR: [-0.3, 0, -0.9], eR: [-0.2, 0, 0], lL: [-0.1, 0, 0.2], lR: [0.1, 0, -0.2] }),
    // Kian: braços cruzados, pés afastados
    // (refeita 2026-11-09: antes os cotovelos subiam até o ombro e os antebraços ficavam de pé na frente do rosto —
    // lia como guarda de boxe e escondia o sigilo; agora o braço de cima fica na vertical e o giro leva o antebraço na
    // horizontal pelo meio do peito, o queixo nivelado olhando a câmera e o peso na perna direita)
    vic_kian: pose({ hip: [0, -0.1, 0], sp: [-0.03, 0.1, 0], hd: [0.04, -0.1, 0], sL: [-0.1, -1.1, 0.2], eL: [-1.75, 0, 0], sR: [-0.15, 1.1, -0.2], eR: [-1.8, 0, 0], lL: [-0.12, 0, 0.2], kL: [0.05, 0, 0], lR: [0.12, 0, -0.24], kR: [0.25, 0, 0] }),
    // Dante: mão no peito e a outra estendida, cabeça baixa (bênção)
    vic_dante: pose({ sp: [0.12, 0, 0], hd: [0.3, 0, 0], sR: [-1.0, 0.8, -0.1], eR: [-2.2, 0, 0], sL: [-1.0, 0.2, 0.3], eL: [-0.4, 0, 0] }),
    // Erin: escopeta no ombro e a outra mão na cintura
    vic_erin: pose({ hip: [0, 0.25, 0.05], hd: [0, 0.2, -0.12], sR: [-2.1, 0.2, -0.5], eR: [-2.2, 0, 0], sL: [0.25, 0, 0.65], eL: [-1.6, 0, 0], lL: [-0.15, 0, 0.1], kL: [0.25, 0, 0] }),
    // Aguiar: aponta o machado para a câmera, inclinado para a frente
    vic_aguiar: pose({ h: -0.12, sp: [0.25, 0.3, 0], hd: [0.1, -0.25, 0], sR: [-1.5, 0.2, -0.1], eR: [-0.15, 0, 0], sL: [-0.4, 0, 0.4], eL: [-1.4, 0, 0], lL: [-0.5, 0, 0.15], kL: [0.5, 0, 0], lR: [0.35, 0, -0.1], kR: [0.3, 0, 0] }),
    // Labirinto: braços abertos e a cabeça tombada de lado (perturbador)
    vic_labirinto: pose({ sp: [0.1, 0, 0.1], hd: [0.1, 0, 0.45], sL: [-0.6, 0, 1.3], eL: [-0.3, 0, 0], sR: [-0.6, 0, -1.3], eR: [-0.3, 0, 0] }),
    // Xande: taco atrás do pescoço com os dois braços pendurados nele
    vic_xande: pose({ hip: [0, 0.1, 0], hd: [-0.1, 0, -0.15], sR: [-2.6, -0.3, -0.9], eR: [-1.9, 0, 0], sL: [-2.6, 0.3, 0.9], eL: [-1.9, 0, 0] }),
    // Ferreiro: a espada cravada à frente, as duas mãos no punho
    vic_ferreiro: pose({ sp: [0.1, 0, 0], hd: [0.05, 0, 0], sR: [-0.9, 0.35, 0], eR: [-0.5, 0, 0], sL: [-0.9, -0.35, 0], eL: [-0.5, 0, 0], lL: [-0.1, 0, 0.2], lR: [0.1, 0, -0.2] }),
    // Juan: reverência debochada — mão no peito, curvado, olhando para cima
    vic_juan: pose({ sp: [0.45, 0, 0], hd: [-0.35, 0, 0], sR: [-1.0, 0.8, -0.1], eR: [-2.2, 0, 0], sL: [-0.2, 0, 0.8], eL: [-0.2, 0, 0], lR: [0.3, 0, -0.1], kR: [0.25, 0, 0] }),
    // Kemi: braços cruzados, peso numa perna, cabeça baixa ("um contrato é um contrato")
    vic_kemi: pose({ hip: [0, 0.2, 0.06], hd: [0.25, 0.2, 0], sL: [-0.55, -0.95, 0.1], eL: [-2.05, 0, 0], sR: [-0.6, 0.95, -0.1], eR: [-2.0, 0, 0], lL: [-0.15, 0, 0.08], kL: [0.35, 0, 0] }),
    // Balu: machado apoiado no ombro direito e a mão esquerda acenando, sorriso largo ("deixa que o tio Balu resolve")
    vic_balu: pose({ hip: [0, 0.15, 0], sp: [-0.08, -0.1, 0], hd: [-0.12, 0.15, 0.06], sR: [-2.0, 0.3, -0.55], eR: [-2.2, 0, 0], sL: [-2.6, 0.2, 0.55], eL: [-0.5, 0, 0], lL: [-0.12, 0, 0.16], lR: [0.12, 0, -0.16] }),
    // A Fantasma: aponta para a câmera — o próximo alvo
    vic_fantasma: pose({ sp: [0.05, -0.25, 0], hd: [0.1, 0.15, 0], sR: [-1.75, 0.4, -0.1], eR: [-0.05, 0, 0] }),
    // Arthur: a sniper apoiada no ombro (o único braço), corpo de lado e o olhar baixo — "paciente, um tiro basta"
    // JAE: o "shh" — dedo da mão ESQUERDA (a sem arma) na frente dos lábios, cabeça baixa e de lado, o punhal baixo na
    // direita (referência "shiu")
    // Dalmo: punho direito erguido bem alto (a arte da finalização do Mosto), o outro fechado embaixo, ofegante
    vic_dalmo: pose({ h: -0.04, hip: [0, 0.1, 0], sp: [0.05, -0.1, 0], hd: [0.1, 0.1, 0], sR: [-2.95, 0, -0.15], eR: [-0.35, 0, 0], sL: [-0.3, 0, 0.3], eL: [-1.2, 0, 0], lL: [-0.15, 0, 0.2], kL: [0.2, 0, 0], lR: [0.15, 0, -0.22], kR: [0.15, 0, 0] }),
    // Colosso: agachado com os braços abertos, as Manoplas para os lados (o fim do gif da Transformação)
    vic_colosso: pose({ h: -0.28, sp: [0.3, 0, 0], hd: [-0.25, 0, 0], sL: [-0.55, 0, 1.25], eL: [-0.6, 0, 0], sR: [-0.55, 0, -1.25], eR: [-0.6, 0, 0], lL: [-0.65, 0, 0.35], kL: [1.0, 0, 0], lR: [-0.2, 0, -0.35], kR: [0.85, 0, 0] }),
    // Guizo: confere a gravação na tela da câmera, olhando para baixo empolgado, a faca erguida comemorando
    vic_guizo: pose({ hip: [0, 0.15, 0], sp: [0.12, 0.15, 0], hd: [0.45, 0.25, 0.05], sL: [-1.25, -0.35, 0.15], eL: [-1.7, 0, 0], sR: [-2.4, 0.2, -0.5], eR: [-1.2, 0, 0], lL: [-0.1, 0, 0.14], lR: [0.12, 0, -0.14] }),
    vic_jae: pose({ hip: [0, -0.15, 0], sp: [0.08, -0.1, 0], hd: [0.18, 0.15, -0.08], sL: [-1.05, -0.3, 0.4], eL: [-2.2, 0, 0], sR: [0.15, 0, -0.18], eR: [-0.25, 0, 0], lR: [-0.05, 0, -0.08], lL: [0.08, 0, 0.06] }),
    vic_arthur: pose({ hip: [0, -0.25, 0], sp: [0, 0.2, 0], hd: [0.12, 0.25, 0.05], sR: [-2.1, 0.35, -0.55], eR: [-2.2, 0, 0], sL: [0, 0, 0.1], eL: [0, 0, 0], lL: [-0.12, 0, 0.12], kL: [0.15, 0, 0], lR: [0.1, 0, -0.14] }),
    // Arnaldo: o ator agradece a plateia — reverência teatral, a espada aberta para o lado e a mão livre no peito
    // A Magistrada: ereta, a bengala firme na direita, a esquerda aberta para baixo e a cabeça inclinada — a Máscara olha
    // O Estrangeiro: ereto, os braços longos abertos para baixo com as garras à mostra e a cabeça levemente inclinada
    // Amigo Imaginário: curvado, os braços abertos para os lados com as garras, a cabeça pendendo (a tinta escorre)
    vic_amigo: pose({ h: -0.08, sp: [0.6, 0, 0], hd: [0.35, 0, 0.1], sL: [-0.4, 0, 0.9], eL: [-0.4, 0, 0], sR: [-0.4, 0, -0.9], eR: [-0.4, 0, 0], kL: [0.2, 0, 0], kR: [0.2, 0, 0] }),
    vic_estrangeiro: pose({ sp: [-0.08, 0, 0], hd: [0.25, 0, -0.2], sR: [-0.25, 0, -0.55], eR: [-0.25, 0, 0], sL: [-0.25, 0, 0.55], eL: [-0.25, 0, 0] }),
    vic_magistrada: pose({ sp: [-0.05, 0, 0], hd: [0.18, 0.1, 0.18], sR: [-0.42, 0, -0.18], eR: [-0.5, 0, 0], sL: [-0.12, 0, 0.42], eL: [-0.35, 0, 0], lR: [0.04, 0, -0.05], lL: [-0.04, 0, 0.05] }),
    vic_arnaldo: pose({ sp: [0.5, 0, 0], hd: [-0.25, 0, 0], sR: [-0.4, 0, -1.2], eR: [-0.15, 0, 0], sL: [-1.0, 0.8, 0.1], eL: [-2.1, 0, 0], lR: [0.35, 0, -0.08], kR: [0.3, 0, 0], lL: [-0.12, 0, 0.1] }),
    // Cristino: a mão esquerda na aba do chapéu de cangaceiro, cabeça baixa (os óculos vermelhos por baixo da meia-lua),
    // a peixeira solta na direita — indiferente ("não é pessoal")
    // Nubi: parada, a bengala fincada à frente nas duas mãos e a cabeça inclinada de leve — olhando sem pressa
    vic_nubi: pose({ hip: [0, 0, 0], sp: [0.05, 0, 0], hd: [0.18, 0.1, 0.12], sR: [-0.62, 0, -0.22], eR: [-0.45, 0, 0], sL: [-0.62, 0, 0.22], eL: [-0.6, 0, 0], lL: [-0.04, 0, 0.05], lR: [0.04, 0, -0.05] }),
    vic_cristino: pose({ hip: [0, -0.15, 0], sp: [0.05, 0.1, 0], hd: [0.28, -0.1, 0], sL: [-2.25, 0.35, 0.45], eL: [-2.15, 0, 0], sR: [0.1, 0, -0.2], eR: [-0.25, 0, 0], lL: [-0.12, 0, 0.14], lR: [0.1, 0, -0.14] }),
    // Cristopher: os dois braços erguidos e o sorrisão de quem fez a cena de primeira (escandaloso, o paizão da equipe)
    vic_cristopher: pose({ hip: [0, 0.05, 0], sp: [-0.12, 0, 0], hd: [-0.2, 0, 0], sL: [-2.6, 0.2, 0.55], eL: [-0.7, 0, 0], sR: [-2.6, -0.2, -0.55], eR: [-0.7, 0, 0], lL: [-0.12, 0, 0.18], lR: [0.12, 0, -0.18] }),
    // Veríssimo: o comandante — a espada do Arnaldo de ponta para baixo à frente, as duas mãos no punho, queixo erguido
    vic_verissimo: pose({ sp: [-0.05, 0, 0], hd: [-0.12, 0, 0], sR: [-0.75, 0.3, 0], eR: [-0.7, 0, 0], sL: [-0.75, -0.3, 0], eL: [-0.7, 0, 0], lL: [-0.08, 0, 0.18], lR: [0.08, 0, -0.18] }),
    // O Anfitrião: braços abertos para a plateia invisível, a cabeça tombada (o relógio no braço esquerdo erguido)
    vic_anfitriao: pose({ sp: [-0.12, 0, 0.05], hd: [0.05, 0, 0.5], sL: [-2.3, 0, 0.9], eL: [-0.35, 0, 0], sR: [-0.9, 0, -1.2], eR: [-0.3, 0, 0], lL: [-0.1, 0, 0.18], lR: [0.1, 0, -0.18] }),
    // ---- poses próprias (2026-11-15, pedido do dono: "personagens que ainda não têm uma pose de vitória própria").
    // Todas PROPOSTA, cada uma tirada do jeito e da arma do cânone (o cabeçalho de cada characters/<id>.js).
    // Artemis: o revólver Apache erguido ao lado do rosto, a outra mão na cintura e a cabeça de lado — "Gostou do que a
    // mamãe fez?" (o Gambá fica no ombro: combat/companion.js)
    vic_artemis: pose({ hip: [0, 0.2, 0.06], sp: [-0.05, 0.1, 0], hd: [-0.08, -0.15, 0.22], sR: [-2.45, 0.35, -0.3], eR: [-2.3, 0, 0], sL: [0.3, 0, 0.42], eL: [-1.5, 0, 0], lL: [-0.12, 0, 0.1], kL: [0.25, 0, 0] }),
    // Beatrice: o braço esquerdo estendido de lado para o Orpheu pousar, a balestra baixa na direita e o rosto virado
    // para o pássaro (gentil, curiosa)
    vic_beatrice: pose({ sp: [0, 0.15, 0], hd: [-0.05, 0.5, 0.05], sL: [-1.35, -0.25, 0.65], eL: [-0.35, 0, 0], sR: [-0.3, 0, -0.2], eR: [-0.6, 0, 0], lR: [0.05, 0, -0.08], lL: [-0.05, 0, 0.08] }),
    // Carina: a guarda de artista marcial — um punho à frente, o outro no peito, base larga e baixa (a leoa pronta)
    vic_carina: pose({ h: -0.12, hip: [0, -0.35, 0], sp: [0.1, -0.25, 0], hd: [-0.05, 0.3, 0], sL: [-1.5, 0, 0.2], eL: [-0.25, 0, 0], sR: [-0.85, 0.6, -0.1], eR: [-2.0, 0, 0], lL: [-0.45, 0, 0.22], kL: [0.5, 0, 0], lR: [0.3, 0, -0.25], kR: [0.45, 0, 0] }),
    // Cindy: toca o Fuzil Baixo como um baixo — a mão esquerda no braço do instrumento, a direita no corpo, o quadril
    // de lado e a cabeça para trás cantando (com a máscara "não consegue parar de dançar")
    vic_cindy: pose({ hip: [0, 0.25, 0.12], sp: [-0.12, -0.15, 0], hd: [-0.32, 0, 0.15], sL: [-1.3, -0.5, 0.3], eL: [-0.6, 0, 0], sR: [-0.5, 0.6, -0.1], eR: [-1.6, 0, 0], lR: [-0.2, 0, -0.06], kR: [0.4, 0, 0], lL: [0.08, 0, 0.1] }),
    // Caio: a Espada Microfone fincada do lado, a outra mão aberta para a plateia e a cabeça para trás GRITANDO
    vic_caio: pose({ h: -0.03, sp: [-0.15, 0, 0], hd: [-0.45, 0, 0], sR: [-0.45, 0, -0.35], eR: [-0.4, 0, 0], sL: [-2.2, -0.2, 0.7], eL: [-0.3, 0, 0], lL: [-0.08, 0, 0.18], lR: [0.08, 0, -0.18] }),
    // Franco: a guitarra erguida no alto com a mão direita, a esquerda em chifrinho, a cabeça para trás
    // ALÊ: a lâmina keytar apoiada no ombro e a outra mão estendida, de palma para cima ("me dá sua mão")
    vic_ale: pose({ h: 0, sp: [0.05, -0.2, 0], hd: [0.1, 0.25, 0], sR: [-2.2, 0.2, -0.6], eR: [-1.9, 0, 0], sL: [-1.1, -0.5, 0.2], eL: [-0.2, 0, 0], lL: [-0.04, 0, 0.12], lR: [0.04, 0, -0.12] }),
    vic_franco: pose({ h: -0.02, sp: [-0.1, 0, 0], hd: [-0.35, 0, 0], sR: [-2.6, 0, -0.2], eR: [-0.3, 0, 0], sL: [-1.2, 0.3, 0.6], eL: [-1.2, 0, 0], lL: [-0.05, 0, 0.2], lR: [0.05, 0, -0.2] }),
    // Damir: a bengala fincada à frente na direita, a esquerda na aba do fedora e o queixo erguido (arrogante)
    vic_damir: pose({ sp: [-0.08, 0, 0], hd: [-0.22, 0.1, 0], sR: [-0.55, 0, -0.2], eR: [-0.5, 0, 0], sL: [-1.95, -0.3, 0.5], eL: [-2.4, 0, 0], lL: [-0.06, 0, 0.12], lR: [0.06, 0, -0.12] }),
    // Eloy: as baquetas erguidas no alto depois do solo, a cabeça baixa batendo no ritmo e as pernas abertas
    vic_eloy: pose({ h: -0.05, sp: [0.05, 0, 0], hd: [0.42, 0, 0], sL: [-2.8, 0, 0.5], eL: [-0.35, 0, 0], sR: [-2.8, 0, -0.5], eR: [-0.35, 0, 0], lL: [-0.1, 0, 0.22], kL: [0.15, 0, 0], lR: [0.1, 0, -0.22], kR: [0.15, 0, 0] }),
    // Fernando: a mão no peito, a outra solta, a cabeça inclinada e um alívio tímido (gentil, ansioso)
    vic_fernando: pose({ sp: [0.08, 0, 0], hd: [0.15, 0, 0.2], sR: [-0.3, 0.75, 0], eR: [-1.45, 0, 0], sL: [0.05, 0, 0.25], eL: [-0.2, 0, 0], lL: [-0.04, 0, 0.06], lR: [0.04, 0, -0.06] }),
    // Luciano: a continência do ex-militar, pés juntos e o olhar firme
    vic_luciano: pose({ sp: [-0.05, 0, 0], hd: [-0.06, 0, 0], sR: [-0.55, 0, -1.35], eR: [-2.45, 0, 0], sL: [0.02, 0, 0.12], eL: [-0.1, 0, 0], lL: [0, 0, 0.03], kL: [0, 0, 0], lR: [0, 0, -0.03], kR: [0, 0, 0] }),
    // Ivete: a espingarda solta na direita, a esquerda levando o charuto à boca, o peso numa perna (bruta e fria)
    vic_ivete: pose({ hip: [0, 0.15, 0.04], hd: [-0.1, 0.12, 0], sL: [-1.6, 0.6, 0.3], eL: [-2.4, 0, 0], sR: [-0.2, 0, -0.25], eR: [-0.3, 0, 0], lL: [-0.12, 0, 0.1], kL: [0.22, 0, 0] }),
    // Rubens: confere o Relógio de Arnaldo no pulso esquerdo, a cabeça baixa nele, o martelo solto na direita —
    // "Ainda bem que eu voltei"
    vic_rubens: pose({ sp: [0.06, 0.15, 0], hd: [0.38, 0.32, 0], sL: [-1.5, -0.7, 0.2], eL: [-1.9, 0, 0], sR: [-0.25, 0, -0.2], eR: [-0.3, 0, 0], lL: [-0.05, 0, 0.1], lR: [0.06, 0, -0.1] }),
    // Sabara: espada e adaga abertas para baixo dos dois lados, agachada de leve, a cabeça tombada (sem olhos, só os dentes)
    vic_alvira: pose({ h: 0, sp: [0.05, 0, 0], hd: [-0.1, 0, 0.25], sR: [-0.62, 0.75, -0.1], eR: [-1.6, 0, 0], sL: [-0.62, -0.75, 0.1], eL: [-1.6, 0, 0] }), // a reza depois da absolvição
    vic_sabara: pose({ h: -0.1, sp: [0.2, 0, 0], hd: [-0.15, 0, 0.28], sR: [-0.6, 0.3, -0.45], eR: [-0.35, 0, 0], sL: [-0.6, -0.3, 0.45], eL: [-0.35, 0, 0], lL: [-0.3, 0, 0.2], kL: [0.45, 0, 0], lR: [0.2, 0, -0.2], kR: [0.35, 0, 0] }),
    // Tristan: o lança-chamas apontado para o céu, o outro punho fechado e o sorrisão (barulhento, piromaníaco)
    vic_tristan: pose({ sp: [-0.12, 0, 0], hd: [-0.22, 0.15, 0], sR: [-1.9, 0.25, -0.55], eR: [-1.0, 0, 0], sL: [-1.0, 0.4, 0.6], eL: [-1.6, 0, 0], lL: [-0.1, 0, 0.18], lR: [0.1, 0, -0.18] }),
    // Amalia: mira o céu com o arco (esquerda), a corda puxada junto do rosto — a flecha flamejante de sinal
    vic_amalia: pose({ sp: [-0.2, 0, 0], hd: [-0.35, 0.1, 0], sL: [-2.4, -0.2, 0.45], eL: [-0.1, 0, 0], sR: [-2.2, 0.6, -0.1], eR: [-2.2, 0, 0], lL: [-0.1, 0, 0.16], lR: [0.1, 0, -0.16] }),
    // Gaius: a mão nas costas doloridas e a maça pendurada na outra — cansado, mas confiante
    vic_gaius: pose({ sp: [0.18, 0, 0], hd: [-0.05, 0, 0.1], sL: [0.35, 0, 0.35], eL: [-1.9, 0, 0], sR: [-0.25, 0, -0.3], eR: [-0.4, 0, 0], lL: [-0.05, 0, 0.1], kL: [0.12, 0, 0] }),
    // ORDO CALAMITAS (v5.32.0)
    // Veritus: a espada longa cravada na frente, as duas mãos no pomo — o líder de pé
    vic_veritus: pose({ sp: [0.02, 0, 0], hd: [-0.08, 0, 0], sR: [-0.85, 0.45, -0.1], eR: [-1.0, 0, 0], sL: [-0.85, -0.45, 0.1], eL: [-1.0, 0, 0], lL: [-0.05, 0, 0.12], lR: [0.05, 0, -0.12] }),
    // o Sacrifício do Rancor: os braços abertos e a cabeça para trás — o único que saiu vivo do ritual
    vic_veritus_rancor: pose({ sp: [-0.15, 0, 0], hd: [-0.5, 0, 0], sR: [-0.5, 0, -1.15], eR: [-0.4, 0, 0], sL: [-0.5, 0, 1.15], eL: [-0.4, 0, 0], lL: [-0.08, 0, 0.18], lR: [0.08, 0, -0.18] }),
    // Nero: o queixo erguido, a espada apontada para o chão e a outra mão nas costas (o imperador)
    vic_nero: pose({ sp: [-0.06, 0, 0], hd: [-0.3, 0.15, 0], sR: [-0.35, 0.1, -0.25], eR: [-0.25, 0, 0], sL: [0.45, 0, 0.25], eL: [-1.5, 0, 0], lL: [-0.05, 0, 0.1], lR: [0.06, 0, -0.1] }),
    // Faustus: o gládio erguido para o céu e a outra mão no peito, segurando o colar — reza a Júpiter
    vic_faustus: pose({ sp: [-0.1, 0, 0], hd: [-0.45, 0, 0], sR: [-2.7, 0.15, -0.15], eR: [-0.2, 0, 0], sL: [-0.6, -0.9, 0.3], eL: [-2.0, 0, 0], lL: [-0.05, 0, 0.12], lR: [0.05, 0, -0.12] }),
    // Marius: as manoplas soltas, a cabeça baixa — "obrigado por tudo"
    vic_marius: pose({ sp: [0.15, 0, 0], hd: [0.35, 0, 0], sR: [-0.2, 0, -0.25], eR: [-0.5, 0, 0], sL: [-0.2, 0, 0.25], eL: [-0.5, 0, 0], lL: [-0.05, 0, 0.12], lR: [0.05, 0, -0.12] }),
    // Remus: a mão na cintura e as garras da outra junto do rosto, a cabeça de lado — o sorriso
    vic_remus: pose({ sp: [0.02, 0.15, 0], hd: [0, -0.25, 0.22], sL: [0.3, 0, 0.45], eL: [-1.9, 0, 0], sR: [-1.6, 0.6, -0.3], eR: [-1.8, 0, 0], lL: [-0.05, 0, 0.18], lR: [0.12, 0, -0.05], kR: [0.3, 0, 0] }),
    // Cascadia: as duas lâminas abaixadas, os ombros caídos, a cabeça tombada — cansada
    vic_cascadia: pose({ sp: [0.12, 0, 0], hd: [0.2, 0, 0.18], sR: [-0.3, 0.2, -0.35], eR: [-0.2, 0, 0], sL: [-0.3, -0.2, 0.35], eL: [-0.2, 0, 0], lL: [-0.05, 0, 0.12], lR: [0.05, 0, -0.12] }),
    // Cornelius: a lança erguida, o escudo na frente e o grito
    vic_cornelius: pose({ sp: [-0.12, 0, 0], hd: [-0.35, 0, 0], sR: [-2.8, 0, -0.1], eR: [-0.2, 0, 0], sL: [-0.75, -0.3, 0.05], eL: [-1.0, 0, 0], lL: [-0.2, 0, 0.18], lR: [0.2, 0, -0.18] }),
    // Bran: a lança fincada de pé ao lado, o broquel no peito e o olhar no horizonte — o vigia que aguentou a noite
    vic_bran: pose({ sp: [0.04, 0, 0], hd: [-0.12, 0.35, 0], sR: [-0.45, 0.1, -0.3], eR: [-2.2, 0, 0], sL: [-0.75, -0.3, 0.05], eL: [-1.0, 0, 0], lL: [-0.08, 0, 0.16], lR: [0.06, 0, -0.16] }),
    // Mael: a mão aberta no peito (o druida que aceitou o destino), a machadinha baixa ao lado e o rosto erguido
    vic_mael: pose({ sp: [-0.04, 0, 0], hd: [-0.25, -0.15, 0], sR: [-0.2, 0.15, -0.25], eR: [-0.35, 0, 0], sL: [-0.75, -0.9, 0.2], eL: [-1.9, 0, 0], lL: [-0.06, 0, 0.12], lR: [0.1, 0, -0.14] }),
    // Gwayne: o arco da Gwyneth erguido de lado na esquerda, a direita no peito (a promessa à irmã) e o rosto baixo
    vic_gwayne: pose({ sp: [0.02, 0, 0], hd: [0.2, 0.1, 0], sL: [-1.2, -0.2, 0.5], eL: [-0.4, 0, 0], sR: [-0.6, 0.6, -0.2], eR: [-1.8, 0, 0], lL: [-0.05, 0, 0.1], lR: [0.08, 0, -0.12] }),
    // Zuri: a faca baixa na direita, a esquerda aberta para a frente (a curandeira que manda ficar parado) e o rosto erguido
    vic_zuri: pose({ sp: [0.02, 0, 0], hd: [-0.15, -0.2, 0], sR: [-0.3, 0.2, -0.25], eR: [-0.5, 0, 0], sL: [-1.3, -0.2, 0.25], eL: [-0.2, 0, 0], lL: [-0.05, 0, 0.12], lR: [0.08, 0, -0.12] }),
    // Eileen: a foice erguida no ombro e a esquerda na cintura, a cabeça inclinada num sorriso torto
    vic_eileen: pose({ sp: [-0.03, 0, 0], hd: [0.05, 0.15, 0.25], sR: [-2.4, 0.3, -0.2], eR: [-1.6, 0, 0], sL: [-0.2, -0.4, 0.55], eL: [-1.6, 0, 0], lL: [-0.06, 0, 0.14], lR: [0.06, 0, -0.1] }),
    // Karise: agachada, as adagas abertas dos dois lados, a cabeça baixa no capuz
    vic_karise: pose({ h: -0.12, sp: [0.25, 0, 0], hd: [0.1, 0, 0], sR: [-0.6, 0.3, -0.55], eR: [-0.4, 0, 0], sL: [-0.6, -0.3, 0.55], eL: [-0.4, 0, 0], lL: [-0.35, 0, 0.2], kL: [0.55, 0, 0], lR: [0.25, 0, -0.2], kR: [0.4, 0, 0] }),
    // Marcellus: a saudação do esgrimista — a rapieira de pé na frente do rosto
    vic_marcellus: pose({ sp: [0, 0, 0], hd: [-0.05, 0, 0], sR: [-1.45, 0.35, -0.1], eR: [-1.65, 0, 0], sL: [0.35, 0, 0.3], eL: [-1.2, 0, 0], lL: [-0.05, 0, 0.12], lR: [0.18, 0, -0.1] }),
    // Celestine: uma machadinha atrás da cabeça, a outra pendurada na corrente, o quadril de lado e a cabeça tombada
    // (debochada)
    vic_celestine: pose({ hip: [0, -0.2, 0.08], sp: [-0.05, 0.1, 0], hd: [-0.1, -0.25, -0.15], sR: [-2.5, 0.3, -0.7], eR: [-2.0, 0, 0], sL: [-0.4, 0, 0.7], eL: [-0.3, 0, 0], lL: [-0.15, 0, 0.12], kL: [0.25, 0, 0] }),
    // Chico: o scanner estendido na esquerda e a cabeça nele, a Mac-10 de pé junto do ombro direito (o técnico)
    vic_chico: pose({ sp: [0.05, -0.15, 0], hd: [0.15, -0.28, 0], sL: [-1.4, -0.2, 0.15], eL: [-0.4, 0, 0], sR: [-1.9, 0.4, -0.3], eR: [-2.2, 0, 0], lL: [-0.06, 0, 0.12], lR: [0.06, 0, -0.12] }),
    // Morato: o punho erguido chamando o grupo ("Tamo com ele"), a outra mão na cintura
    vic_morato: pose({ sp: [-0.06, 0, 0], hd: [-0.15, 0.1, 0], sR: [-2.7, 0, -0.3], eR: [-1.4, 0, 0], sL: [0.25, 0, 0.6], eL: [-1.6, 0, 0], lL: [-0.1, 0, 0.18], lR: [0.1, 0, -0.18] }),
    // Dara: segura a alça da bolsa enorme e faz um joinha com a outra, a cabeça de lado (o suporte do grupo)
    vic_dara: pose({ hip: [0, 0.1, 0], hd: [0.05, 0, -0.18], sL: [-0.3, 0, 0.1], eL: [-1.6, 0, 0], sR: [-0.65, 0.4, -0.5], eR: [-1.15, 0, 0], lL: [-0.05, 0, 0.1], lR: [0.06, 0, -0.1] }),
    // Boris: a gadanha de pé ao lado, a mão no cabo, e o sorriso meigo de cabeça inclinada (sereno)
    vic_boris: pose({ sp: [0.04, 0, 0], hd: [0.15, 0, 0.16], sR: [-0.5, 0, -0.45], eR: [-1.4, 0, 0], sL: [0.05, 0, 0.2], eL: [-0.15, 0, 0], lL: [-0.04, 0, 0.1], lR: [0.04, 0, -0.1] }),
    // Lírio: a Leonora erguida acima da cabeça com as duas mãos, base larga e o grito (a parede)
    vic_lirio: pose({ h: -0.1, sp: [-0.1, 0, 0], hd: [-0.4, 0, 0], sR: [-2.9, 0, -0.3], eR: [-0.6, 0, 0], sL: [-2.9, 0, 0.3], eL: [-0.6, 0, 0], lL: [-0.15, 0, 0.3], kL: [0.25, 0, 0], lR: [0.15, 0, -0.3], kR: [0.25, 0, 0] }),
    // ---- o BEIJO do fim do Amor e Sangue (pedido do dono, 2026-11-15: "no final do especial da Kemi e do Eloy eles
    // devem se beijar"). PROPOSTA: ele (mais alto) sem a focinheira, as mãos na cintura dela e a cabeça baixa de lado;
    // ela nas pontas dos pés, os braços no pescoço dele e o rosto erguido para o outro lado
    kiss_lead: pose({ sp: [0.22, 0, 0], hd: [0.38, 0, -0.22], sL: [-0.75, 0.25, 0.3], eL: [-1.25, 0, 0], sR: [-0.75, -0.25, -0.3], eR: [-1.25, 0, 0], lL: [-0.05, 0, 0.1], lR: [0.05, 0, -0.1] }),
    kiss_follow: pose({ h: 0.05, sp: [-0.12, 0, 0], hd: [-0.35, 0, 0.2], sL: [-2.35, -0.2, 0.3], eL: [-1.45, 0, 0], sR: [-2.35, 0.2, -0.3], eR: [-1.45, 0, 0], lL: [0.05, 0, 0.06], kL: [0.05, 0, 0], lR: [-0.35, 0, -0.06], kR: [0.85, 0, 0] }),
  });
}
