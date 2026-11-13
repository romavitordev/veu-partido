// Falas de introducao pre-luta; independentes do resultado.
import { VOICES, TEAM_REF } from './introVoices.js';
import { HOST_VICTORY, VICTORY_VS_HOST, BATTLE_EXTRA, BATTLE_REPLIES_EXTRA } from './hostLines.js';
import { defTeams } from './teams.js';
import { ROSTER } from '../characters/index.js';
export const CHARACTER_NAMES = {
  kaiser: 'Kaiser',
  arthur: 'Arthur Cervero',
  joui: 'Joui Jouki',
  aghata: 'Aghata',
  dante: 'Dante',
  erin: 'Erin Parker',
  gal_sal: 'Gal Sal',
  nubi: 'Nubi',
  kian: 'Kian',
  aguiar: 'Aguiar',
  labirinto: 'Labirinto',
  xande: 'Xande',
  lirio: 'Lírio',
  ferreiro: 'Ferreiro',
  juan: 'Henri', // (2026-10-27) o personagem base é o HENRI; no ódio (e nos Portadores) ele é o JUAN
  kemi: 'Kemi',
  balu: 'Balu',
  arnaldo: 'Arnaldo',
  verissimo: 'Veríssimo',
  jae: 'Jae',
  dalmo: 'Dalmo',
  guizo: 'Guizo',
  o_diabo: 'O Diabo',
  magistrada: 'A Magistrada',
  estrangeiro: 'O Estrangeiro',
  amigo: 'Amigo Imaginário',
  cristino: 'Cristino',
  cristopher: 'Cristopher',
  raziel: 'Raziel',
  celestine: 'Celestine',
  gaius: 'Gaius',
  amalia: 'Amalia',
  carnical: 'Carniçal',
  degolificada: 'A Degolificada',
  espreitador: 'O Espreitador',
  dara: 'Dara',
  carina: 'Carina',
  rubens: 'Rubens',
  beatrice: 'Beatrice',
  fernando: 'Fernando',
  tristan: 'Tristan',
  ivete: 'Ivete',
  chico: 'Chico',
  morato: 'Morato',
  damir: 'Damir',
  boris: 'Boris',
  artemis: 'Artemis',
  eloy: 'Eloy',
  sabara: 'Sabara',
};

export const BASE_CHARACTER = { deus_morte: 'ferreiro', diabo: 'juan', fantasma: 'kemi', anfitriao: 'arnaldo', aguiar_mutilador: 'aguiar', erin_caos: 'erin', labirinto_elmo: 'labirinto', jae_x: 'jae', colosso: 'dalmo', guizo_et: 'guizo', kian_calamidade: 'kian', juan_odio: 'juan', guizo_bombado: 'guizo', guizo_velho: 'guizo', cristino_desertor: 'cristino', dante_aberto: 'dante', raziel_verdadeiro: 'raziel', celestine_magistrada: 'celestine', amphitruo: 'anfitriao', carina_leone: 'carina', luciano: 'fernando' };

export const INTRO_IDS = Object.keys(CHARACTER_NAMES);
// as equipes de cada lutador (a principal e as outras), pela ficha; o Anfitrião é o das Relíquias
const TEAMS_OF = Object.fromEntries(ROSTER.map((c) => [c.id, defTeams(c)]));

// como o OUTRO é visto numa fala: o nome e a equipe (a primeira dele que não é do falante)
function seen(id, by) {
  const mine = TEAMS_OF[by] || [];
  const team = (TEAMS_OF[id] || []).find((tm) => !mine.includes(tm)) || (TEAMS_OF[id] || [])[0];
  const ref = TEAM_REF[team] || { one: 'alguém de fora', group: 'gente como você' };
  return { name: CHARACTER_NAMES[id] || HOST_NAMES[id] || id, one: ref.one, group: ref.group };
}
const HOST_NAMES = { anfitriao: 'Anfitrião', amphitruo: 'Amphitruo' }; // fora de CHARACTER_NAMES (as cenas dele são montadas na hora)
// português: a equipe entra depois de preposição ("pra os Vampiros" → "pros Vampiros") e a fala começa maiúscula
const CONTRACT = { 'pra o': 'pro', 'pra a': 'pra', 'pra os': 'pros', 'pra as': 'pras', 'de o': 'do', 'de a': 'da', 'de os': 'dos', 'de as': 'das', 'por o': 'pelo', 'por a': 'pela', 'por os': 'pelos', 'por as': 'pelas', 'em o': 'no', 'em a': 'na', 'em os': 'nos', 'em as': 'nas' };
const polish = (s) => { const out = s.replace(/\b(pra|de|por|em) (os|as|o|a)\b/g, (m) => CONTRACT[m] || m); return out[0].toUpperCase() + out.slice(1); };
const sameTeam = (x, y) => (TEAMS_OF[x] || []).some((tm) => (TEAMS_OF[y] || []).includes(tm));
// número estável por par (as duas cenas do mesmo confronto sempre escolhem as mesmas falas soltas)
function pairSeed(x, y) {
  let h = 7;
  for (const ch of [x, y].sort().join('+')) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}
const pick = (list, k) => list[k % list.length];

// as duas cenas de um confronto sem cena do cânone: a 1ª é sobre QUEM o outro é (colega ou a equipe dele); a 2ª é da
// personalidade de cada um
export function voiceScenes(first, second) {
  const vA = VOICES[first];
  const vB = VOICES[second];
  const ally = sameTeam(first, second);
  const k = pairSeed(first, second);
  const sB = seen(second, first);
  const sA = seen(first, second);
  return [
    { starter: first, line: polish((ally ? vA.open.ally : vA.open.rival)(sB)), response: second, responseLine: polish((ally ? vB.reply.ally : vB.reply.rival)(sA)) },
    { starter: second, line: polish(pick(vB.open.any, k)(sA)), response: first, responseLine: polish(pick(vA.reply.any, k >>> 3)(sB)) },
  ];
}

const INTRO_EXCHANGES = {
  // NUBI (falas originais do jogo): o líder dela, o tiro que ela desviou na Mansão Leone, o machado do Balu e a outra
  // órfã do Santa Menefreda
  // OS LUKIC E A ARTEMIS (cânone: os Marcados do Kian; o Damir manda e o Boris obedece; o Juan é o primo; o Boris quer
  // matar o Diabo "seja do lado do Kian, seja do lado deles")
  'boris+damir': [
    { starter: 'damir', line: 'Grandão, segura ele aí que eu cuido do resto.', response: 'boris', responseLine: 'Hoje não, irmão. Hoje sou eu do outro lado.' },
    { starter: 'boris', line: 'Damir. Você sempre quis ser maior que eu em alguma coisa.', response: 'damir', responseLine: 'Hoje eu sou, Grandão. Senta.' },
  ],
  'damir+kian': [
    { starter: 'damir', line: 'Você me deu essa marca, Kian. Hoje eu cobro o preço.', response: 'kian', responseLine: 'Você nunca teve nada, Damir. Nem o que eu te dei.' },
    { starter: 'kian', line: 'Lukic. O mais ganancioso dos meus.', response: 'damir', responseLine: 'E o mais esperto. Você vai ver.' },
  ],
  'boris+kian': [
    { starter: 'boris', line: 'Eu sigo o meu irmão, Kian. Não você.', response: 'kian', responseLine: 'Eu já vi como isso termina pra você, Boris.' },
    { starter: 'kian', line: 'Ainda quer matar o Diabo, Boris?', response: 'boris', responseLine: 'Do seu lado ou do lado deles. Tanto faz.' },
  ],
  'artemis+kian': [
    { starter: 'kian', line: 'Artemis. O homem ainda fala com você?', response: 'artemis', responseLine: 'Ele fala de você o tempo todo, querido.' },
    { starter: 'artemis', line: 'A mamãe sempre obedeceu, Kian.', response: 'kian', responseLine: 'Então obedeça agora: lute.' },
  ],
  'damir+juan': [
    { starter: 'juan', line: 'Priminho! Veio apanhar do primo?', response: 'damir', responseLine: 'Vim cobrar o que o tio Lucas deixou, Juan.' },
    { starter: 'damir', line: 'Juan. Ainda brincando de Diabo?', response: 'juan', responseLine: 'Ainda brincando de mágico, priminho?' },
  ],
  'boris+juan': [
    { starter: 'juan', line: 'Borjão! Me bate com essa gadanha, vai!', response: 'boris', responseLine: 'Primo... eu não queria. Mas vou.' },
    { starter: 'boris', line: 'A gente cresceu no mesmo circo, Juan.', response: 'juan', responseLine: 'E agora o circo é a gente se batendo. Que lindo!' },
  ],
  'artemis+damir': [
    { starter: 'artemis', line: 'O chapéu é bonito, Damir. Me dá?', response: 'damir', responseLine: 'Tudo tem preço, Artemis. Até o seu bicho.' },
    { starter: 'damir', line: 'Guarda esse rato, Artemis.', response: 'artemis', responseLine: 'É um gambá. E ele não gosta de você.' },
  ],
  // ELOY e SABARA (cânone, Hexatombe): o Eloy socou o Jae sem parar no circo; o Raziel mordeu a focinheira dele; a Sabara
  // fez o Aguiar se ajoelhar, mordeu o pescoço dele e morreu para o Mutilador (a espada ficou com ele); o Raziel é o líder dela
  'eloy+jae': [
    { starter: 'jae', line: 'Shh. Hoje sem soco na minha cara, Eloy.', response: 'eloy', responseLine: 'NÃO PROMETO. DESCULPA ANTES.' },
    { starter: 'eloy', line: 'Jae, sobre o circo... foi mal.', response: 'jae', responseLine: 'Shh. Fala com a faca.' },
  ],
  'eloy+raziel': [
    { starter: 'raziel', line: 'O baterista voltou. A focinheira ainda tem o meu gosto?', response: 'eloy', responseLine: 'MORDE DE NOVO. EU SOCO DE NOVO.' },
    { starter: 'eloy', line: 'Você mordeu a minha máscara, Raziel.', response: 'raziel', responseLine: 'E você ainda bate no ritmo. Que adorável.' },
  ],
  'aguiar+sabara': [
    { starter: 'sabara', line: 'De joelhos, Aguiar. E devolve a minha espada.', response: 'aguiar', responseLine: 'Vem buscar. Da outra vez não deu certo.' },
    { starter: 'aguiar', line: 'A espada corta bem, Sabara. Testei em você.', response: 'sabara', responseLine: 'Então ajoelha e me deixa testar em você.' },
  ],
  'raziel+sabara': [
    { starter: 'raziel', line: 'Minha batedora. Esqueceu quem serve o banquete?', response: 'sabara', responseLine: 'Hoje a caça é minha, Raziel.' },
    { starter: 'sabara', line: 'Ajoelha, Raziel. Só pra eu ver como é.', response: 'raziel', responseLine: 'Que fome bonita, Fenna. Vem.' },
  ],
  'artemis+boris': [
    { starter: 'boris', line: 'Esconde o bichinho, Artemis. A gadanha é grande.', response: 'artemis', responseLine: 'Ele gosta de você, Grandão. Eu também.' },
    { starter: 'artemis', line: 'Quer um abraço da mamãe, Boris?', response: 'boris', responseLine: 'Depois. Primeiro a gente luta.' },
  ],
  'boris+o_diabo': [
    { starter: 'boris', line: 'Eu disse que ia te matar. Seja de que lado for.', response: 'o_diabo', responseLine: 'O filho do Lucas. O seu pai também tentou.' },
    { starter: 'o_diabo', line: 'O trapezista voltou pro meu show.', response: 'boris', responseLine: 'Por Lucas.' },
  ],
  'kian+nubi': [
    { starter: 'nubi', line: 'Você prometeu me tirar daqui de dentro, Kian. Eu ainda conto os séculos.', response: 'kian', responseLine: 'Eu lembro da promessa. Fica de pé até lá.' },
    { starter: 'kian', line: 'Quanto tempo passou pra você desde ontem, Nubi?', response: 'nubi', responseLine: 'O suficiente pra esquecer o seu rosto e lembrar de novo. Três vezes.' },
  ],
  'arthur+nubi': [
    { starter: 'arthur', line: 'Eu errei aquele tiro. Não acontece de novo.', response: 'nubi', responseLine: 'Você não errou. Eu tive tempo de sair da frente. Muito tempo.' },
    { starter: 'nubi', line: 'Eu vi a bala sair do cano, Cervero. Devagar. Como tudo.', response: 'arthur', responseLine: 'Então vê essa chegando também.' },
  ],
  'balu+nubi': [
    { starter: 'balu', line: 'Moça, esse olhar parado me dá arrepio. Vamo resolver logo.', response: 'nubi', responseLine: 'Logo? Pra mim, você já está levantando esse machado faz uma semana.' },
    { starter: 'nubi', line: 'Esse machado... eu já vi esse instante. Já durou anos.', response: 'balu', responseLine: 'Então você sabe como termina, né? Ha ha!' },
  ],
  'gal_sal+nubi': [
    { starter: 'gal_sal', line: 'Nubi. A gente saiu do mesmo fogo.', response: 'nubi', responseLine: 'Você saiu. Eu ainda estou lá dentro, Gal. Cada segundo.' },
    { starter: 'nubi', line: 'Lembra do orfanato? Pra mim ele nunca parou de queimar.', response: 'gal_sal', responseLine: 'Então solta isso. Um pedaço de cada vez.' },
  ],
  // CRISTOPHER (O Segredo na Floresta): o pai do Cesar, o melhor amigo do Arnaldo, o "Gringão" dos Gaudérios Abutres
  'cristopher+kaiser': [
    { starter: 'cristopher', line: 'Cesar! Filho! Eu sei que eu sumi... deixa eu compensar agora?', response: 'kaiser', responseLine: 'Velho vacilão. Vai ter que me alcançar primeiro.' },
    { starter: 'kaiser', line: 'Você nunca contou da Ordem, pai.', response: 'cristopher', responseLine: 'Pra te proteger, filho. E olha onde a gente veio parar... juntos.' },
  ],
  'arnaldo+cristopher': [
    { starter: 'arnaldo', line: 'Cris! O meu dublê favorito! Ainda cai bonito?', response: 'cristopher', responseLine: 'ARNALDO! Cai melhor que você atua, meu amigo!' },
    { starter: 'cristopher', line: 'Foi você que me trouxe pra essa vida, Arnaldo.', response: 'arnaldo', responseLine: 'E você demorou trinta anos pra aceitar o papel.' },
  ],
  'cristopher+joui': [
    { starter: 'joui', line: 'Senhor Cris. Vou tentar não cortar demais.', response: 'cristopher', responseLine: 'Ha! Gostei de você, Joui-san! Pode vir com tudo!' },
    { starter: 'cristopher', line: 'Rapaz, você luta igual filme de kung fu!', response: 'joui', responseLine: 'E o senhor apanha igual filme de ação.' },
  ],
  'balu+cristopher': [
    { starter: 'balu', line: 'Olha o Gringão! Bora ver quem é o maior?', response: 'cristopher', responseLine: 'Tio Balu! O maior a gente decide no braço!' },
    { starter: 'cristopher', line: 'Depois a gente come lá no Suvaco Seco?', response: 'balu', responseLine: 'Só se você pagar, gringo!' },
  ],
  'cristopher+verissimo': [
    { starter: 'verissimo', line: 'Cohen. Demorou, mas você entrou para a Ordem.', response: 'cristopher', responseLine: 'Com uma condição, chefe: a minha família fica de fora.' },
    { starter: 'cristopher', line: 'Senhor Veríssimo! Igual àquela vez do Kian, hein?', response: 'verissimo', responseLine: 'Olhos sempre abertos, Cristopher. Daquela vez quase não voltamos.' },
  ],
  'cristopher+kian': [
    { starter: 'kian', line: 'Eu lembro de você. Você estava lá quando tentaram me apagar.', response: 'cristopher', responseLine: 'E voltei vivo pra contar, primeiro ocultista!' },
    { starter: 'cristopher', line: 'Você devia estar morto, cara!', response: 'kian', responseLine: 'Devia. Muita gente devia.' },
  ],
  // RAZIEL (Hexatombe): o Circo (ep. 7: decapitou o Franco, quase estripou o Dalmo, mordeu o Henri) e a guerra na Igreja
  // Antiga (ep. 9: devorou a Maria, atravessou o Remi, o Cristino cortou o braço dele e o Juan o finalizou)
  // CELESTINE (Calamidade): a guerreira da Ordo Calamitas que vestiu a Máscara do Desespero e virou a Magistrada
  // GAIUS (Calamidade): o mais velho da Ordo Calamitas; foi da Seita das Máscaras pela filha; a Relíquia de Energia
  // o consumiu e ele virou Amphitruo, o primeiro Anfitrião — o Arnaldo é um dos que portaram a mesma Relíquia depois
  // AMALIA (Calamidade): A Flecha — a Celestine a chama de "Gata"; as duas chegaram juntas ao último jogo do Anfitrião
  'amalia+celestine': [
    { starter: 'celestine', line: 'Gata! Sobrou eu e você de novo. Igual no último jogo.', response: 'amalia', responseLine: 'Cabeça no lugar, Celestine. Dessa vez é sério.' },
    { starter: 'amalia', line: 'Celestine. Fica quieta e luta.', response: 'celestine', responseLine: 'Ah, Gata, você fala tão pouco que cada frase parece ameaça.' },
  ],
  'amalia+gaius': [
    { starter: 'gaius', line: 'Amalia, a menina das flechas. Ainda acerta uma mosca a cem passos?', response: 'amalia', responseLine: 'Duzentos. E você ainda reclama das costas.' },
    { starter: 'amalia', line: 'Gaius. Senta. Eu cubro de longe.', response: 'gaius', responseLine: 'Ah, a juventude. Pelo menos essa é educada.' },
  ],
  'amalia+joui': [
    { starter: 'joui', line: 'Eu lembro do último jogo, Amalia. Do que aconteceu com você.', response: 'amalia', responseLine: 'Eu escolhi. Não precisa pedir desculpa.' },
    { starter: 'amalia', line: 'Você estava no corpo da Celestine. Eu vi nos olhos.', response: 'joui', responseLine: 'E dessa vez a gente luta de frente. Sem jogo.' },
  ],
  'celestine+gaius': [
    { starter: 'gaius', line: 'Celestine, você ainda vai quebrar o pescoço fazendo flexão às cinco da manhã.', response: 'celestine', responseLine: 'E você ainda vai quebrar a bacia levantando da cadeira, velho.' },
    { starter: 'celestine', line: 'Gaius! Hoje eu te derrubo e você vai reclamar das costas a semana inteira.', response: 'gaius', responseLine: 'Ah, a juventude. Tão rápida, tão convencida.' },
  ],
  'gaius+magistrada': [
    { starter: 'magistrada', line: 'Você já usou uma Máscara, Gaius. A Seita lembra de todos que entram.', response: 'gaius', responseLine: 'Entrei pela minha filha. E saí inteiro. Não é qualquer um.' },
    { starter: 'gaius', line: 'Vocês cumpriram o acordo. Ela vive. Mas não me peçam para voltar.', response: 'magistrada', responseLine: 'O Equilíbrio não pede. Ele espera.' },
  ],
  'arnaldo+gaius': [
    { starter: 'gaius', line: 'Esse relógio aí... sinto a mesma chama que eu guardei em Roma.', response: 'arnaldo', responseLine: 'Então o senhor sabe que ela cobra caro. E que gosta de plateia.' },
    { starter: 'arnaldo', line: 'O primeiro a usar a Relíquia de Energia. Uma honra, mestre.', response: 'gaius', responseLine: 'Honra nenhuma, rapaz. Ela me comeu inteiro. Toma cuidado com ela.' },
  ],
  'celestine+magistrada': [
    { starter: 'magistrada', line: 'Eu conheço essa Máscara. Ela pesou no seu rosto antes de pesar no meu.', response: 'celestine', responseLine: 'Então você sabe que eu não devolvo nada que é meu.' },
    { starter: 'celestine', line: 'Você é a última, né? Eu fui a primeira. Bem mais divertida.', response: 'magistrada', responseLine: 'Saber tudo custa tudo, Celestine. Você pagou primeiro.' },
  ],
  'cristino+raziel': [
    { starter: 'raziel', line: 'O senhor desceu do telhado sem ser convidado. Que falta de modos.', response: 'cristino', responseLine: 'Não é pessoal. Só quero o seu braço.' },
    { starter: 'cristino', line: 'Eu odeio gente barulhenta. Você grita demais.', response: 'raziel', responseLine: 'E o senhor corta demais. Vamos ver quem acaba primeiro.' },
  ],
  'juan+raziel': [
    { starter: 'raziel', line: 'Henri. O gosto da sua carne ainda está na minha boca.', response: 'juan', responseLine: 'Então lembra dele. Porque hoje quem morde sou eu.' },
    { starter: 'juan', line: 'Eu hesitei uma vez em descarnar você.', response: 'raziel', responseLine: 'E ainda assim obedeceu a Ele. Que triste, Henri.' },
  ],
  'jae+raziel': [
    { starter: 'raziel', line: 'Você estava sentada à minha mesa, menina. Lembra do vinho?', response: 'jae', responseLine: 'Shh... lembro do gosto. Era sangue.' },
    { starter: 'jae', line: 'Você me devorou na igreja.', response: 'raziel', responseLine: 'E foi uma refeição esplêndida. Vamos repetir?' },
  ],
  'labirinto+raziel': [
    { starter: 'raziel', line: 'O senhor das mãos que tocam. Atravessei o seu estômago uma vez.', response: 'labirinto', responseLine: 'E eu fiz a Cleo explodir na sua frente. Estamos quites?' },
    { starter: 'labirinto', line: 'Todo labirinto tem um centro. O seu é só fome.', response: 'raziel', responseLine: 'Fome é o que me trouxe até aqui. E o que vai me levar embora.' },
  ],
  'dalmo+raziel': [
    { starter: 'dalmo', line: 'Você quase me estripou no circo, vampiro!', response: 'raziel', responseLine: 'Quase. Foi falta de educação minha. Hoje eu termino o serviço.' },
    { starter: 'raziel', line: 'O grandalhão do circo. Ainda de pé?', response: 'dalmo', responseLine: 'Grande e de pé, neném. Vem que eu te mostro a arena.' },
  ],
  // CRISTINO (Hexatombe): a caça ao Quibungo com a Jae e o Labirinto, o Pomba sequestrado, a promessa e o fim pelo Juan
  'cristino+jae': [
    { starter: 'cristino', line: 'Vocês ainda têm a minha palavra. Uma vez só.', response: 'jae', responseLine: 'Shh... guarda ela, cangaceiro. Hoje eu não vim pedir.' },
    { starter: 'jae', line: 'Você sumiu depois da caçada. Achou o que era seu?', response: 'cristino', responseLine: 'Achei. E não é da sua conta.' },
  ],
  'cristino+labirinto': [
    { starter: 'labirinto', line: 'O medalhão, Cristino. Eu sei o que aquele símbolo abre.', response: 'cristino', responseLine: 'Então sabe que não é pra você.' },
    { starter: 'cristino', line: 'A rajada falhou na caçada. Não falha hoje.', response: 'labirinto', responseLine: 'Todo caminho tem uma segunda chance. O seu acabou aqui.' },
  ],
  'aguiar+cristino': [
    { starter: 'aguiar', line: 'Você cortou o garoto devagar. Pra quê?', response: 'cristino', responseLine: 'A porta pedia sangue. Eu só paguei.' },
    { starter: 'cristino', line: 'Eu odeio gente barulhenta, delegado.', response: 'aguiar', responseLine: 'Ha ha... então hoje você vai odiar muito.' },
  ],
  'cristino+juan': [
    { starter: 'juan', line: 'Eu senti a sua intenção, cangaceiro. Você veio me matar.', response: 'cristino', responseLine: 'Não é pessoal. É a promessa do meu irmão.' },
    { starter: 'cristino', line: 'Se tiver um jeito do sacrifício ficar vivo, eu descubro.', response: 'juan', responseLine: 'Não precisa. Eu já sei qual é o meu novo começo.' },
  ],
  'kaiser+arthur': [
    { starter: 'arthur', line: 'Kaiser, você não precisa carregar tudo sozinho, filho.', response: 'kaiser', responseLine: 'Eu sei, pai. Só não aprendi a largar ainda.' },
    { starter: 'kaiser', line: 'Arthur, você sempre aparece quando alguém precisa de ajuda.', response: 'arthur', responseLine: 'E você sempre finge que não precisava, César.' },
  ],
  'kaiser+dante': [
    { starter: 'kaiser', line: 'Padre, dá pra gente conversar sem você transformar isso num sermão?', response: 'dante', responseLine: 'Dá. Mas você vai sentir falta do sermão depois, Kaiser.' },
    { starter: 'dante', line: 'Kaiser, ainda me chama de Padre quando quer mudar de assunto?', response: 'kaiser', responseLine: 'Só quando funciona, Padre.' },
  ],
  'kaiser+erin': [
    { starter: 'erin', line: 'Kaiser, ainda guardou a Nebulosa que eu te dei?', response: 'kaiser', responseLine: 'Guardei. E dessa vez eu li as instruções.' },
    { starter: 'kaiser', line: 'Erin, aquela Nebulosa continua sendo um presente ou uma ameaça?', response: 'erin', responseLine: 'Depende de como você usa. Eu fiz as duas coisas.' },
  ],
  'arthur+joui': [
    { starter: 'arthur', line: 'Joui, lembra quando você dizia que eu não sabia dançar?', response: 'joui', responseLine: 'Lembro. Você continua sem saber, Arthur-san.' },
    { starter: 'joui', line: 'Arthur-san, depois disso você ainda vai me pagar aquele lanche?', response: 'arthur', responseLine: 'Vou. Mas você escolhe um lugar que não tenha granadas, beleza?' },
  ],
  'arthur+aghata': [
    { starter: 'arthur', line: 'Agatha, você continua se metendo em problema que não é seu?', response: 'aghata', responseLine: 'E você continua tentando me proteger sem eu pedir.' },
    { starter: 'aghata', line: 'Arthur, não precisa fazer essa cara. Eu sei cuidar de mim.', response: 'arthur', responseLine: 'Eu sei, pequena. Mesmo assim, vou perguntar se está tudo bem.' },
  ],
  'arthur+gal_sal': [
    { starter: 'gal_sal', line: 'Arthur, ainda olha por cima do ombro quando eu chego?', response: 'arthur', responseLine: 'Aprendi que é melhor não dar as costas pra você, Gal.' },
    { starter: 'arthur', line: 'Gal, tem coisa que a gente precisa resolver olhando um pro outro.', response: 'gal_sal', responseLine: 'Então olha direito, Arthur. Eu não sou mais aquele garoto.' },
  ],
  'arthur+dante': [
    { starter: 'arthur', line: 'Dante, vai com calma nesses rituais aí, rabiscado.', response: 'dante', responseLine: 'Calma eu tenho, Arthur. Quem não tem é o lodo.' },
    { starter: 'dante', line: 'Arthur, você ainda chama isso de rabisco?', response: 'arthur', responseLine: 'Enquanto parecer rabisco, vou chamar.' },
  ],
  'kian+gal_sal': [
    { starter: 'gal_sal', line: 'Kian, eu lembro de cada coisa que você me fez fazer.', response: 'kian', responseLine: 'E ainda assim está aqui, Gal. Essa escolha é sua.' },
    { starter: 'kian', line: 'Gal, ainda procura um sentido em tudo que aconteceu?', response: 'gal_sal', responseLine: 'Não. Só quero que você pare de decidir por mim.' },
  ],
  'gal_sal+joui': [
    { starter: 'joui', line: 'Gal, você tirou de mim quem me criou. Eu não esqueci.', response: 'gal_sal', responseLine: 'Eu também não esqueci quem me deixou pra trás, Joui.' },
    { starter: 'gal_sal', line: 'Joui, você ainda acha que existe um jeito certo de fazer isso?', response: 'joui', responseLine: 'Acho que ainda dá pra escolher não machucar todo mundo.' },
  ],
  'dante+kian': [
    { starter: 'dante', line: 'Kian, você usou o Leo. Usou a minha infância inteira.', response: 'kian', responseLine: 'E você ainda tenta encontrar uma explicação que torne isso suportável.' },
    { starter: 'kian', line: 'Gaspar, ainda espera encontrar o Leo em tudo que eu faço?', response: 'dante', responseLine: 'Não. Mas não vou deixar você apagar o que ele foi.' },
  ],
  'dante+gal_sal': [
    { starter: 'gal_sal', line: 'Gaspar... ainda tenta salvar todo mundo?', response: 'dante', responseLine: 'Só quem ainda pode escolher, Gal.' },
    { starter: 'dante', line: 'Gal, o orfanato não precisa decidir quem você é agora.', response: 'gal_sal', responseLine: 'Fácil dizer isso quando você conseguiu sair de lá, Gaspar.' },
  ],
  'dante+aghata': [
    { starter: 'aghata', line: 'Dante, aquele grimório ainda está cheio de perguntas?', response: 'dante', responseLine: 'Está. Algumas respostas eu prefiro encontrar com você por perto.' },
    { starter: 'dante', line: 'Agatha, ainda chama isso de treino quando quase derruba a sala?', response: 'aghata', responseLine: 'Só quando a sala fica de pé no final.' },
  ],
  'erin+joui': [
    { starter: 'erin', line: 'Joui! Fiz uma granada nova pra você... quer ver de perto?', response: 'joui', responseLine: 'Erin... vai ficar tudo bem. Mas não joga isso em mim.' },
    { starter: 'joui', line: 'Erin, você ainda guarda a Sakura?', response: 'erin', responseLine: 'Claro. Foi feita pra você. E essa aqui também pode ser.' },
  ],
  'erin+gal_sal': [
    { starter: 'gal_sal', line: 'Eu lembro do seu cheiro de pólvora. E do seu sangue na Ereshkigal.', response: 'erin', responseLine: 'Então lembra também que eu escolhi o que fazer até o fim.' },
    { starter: 'erin', line: 'Gal, eu não esqueci o que aconteceu. Só não vou deixar isso falar por mim.', response: 'gal_sal', responseLine: 'Você sempre teve esse jeito de transformar dor em decisão.' },
  ],
  'kaiser+xande': [
    { starter: 'xande', line: 'Kaiser, Cinerária? Eu também sei mexer com essa névoa aí.', response: 'kaiser', responseLine: 'Então me conta, Xande: a sua também tem cheiro de lanche queimado?' },
    { starter: 'kaiser', line: 'Xande, ainda mistura skate e ritual como se fosse a coisa mais normal do mundo?', response: 'xande', responseLine: 'É normal pra mim, mano. Você que precisa sair um pouco da névoa.' },
  ],
  'estrangeiro+xande': [
    { starter: 'estrangeiro', line: 'Alexandre. As cápsulas ainda esperam por vocês.', response: 'xande', responseLine: 'Desta vez ninguém entra em cápsula nenhuma. Os Cinco ficam juntos.' },
    { starter: 'xande', line: 'Eu lembro de você. Mesmo que você não queira.', response: 'estrangeiro', responseLine: 'Lembrar é um defeito que eu corrijo.' },
  ],
  'estrangeiro+lirio': [
    { starter: 'lirio', line: 'Tu é o bicho alto que ninguém lembra? A Leonora lembra.', response: 'estrangeiro', responseLine: 'Uma marreta não guarda memórias, Lírio.' },
    { starter: 'estrangeiro', line: 'A parede. Você protege os outros com o corpo. Previsível.', response: 'lirio', responseLine: 'Previsível e de pé. Vem.' },
  ],
  'estrangeiro+guizo': [
    { starter: 'guizo', line: 'Mano... é ELE. Câmera, câmera, CÂMERA!', response: 'estrangeiro', responseLine: 'Sua câmera grava ruído, menino. Só ruído.' },
    { starter: 'estrangeiro', line: 'A torre da TV ainda transmite o meu sinal.', response: 'guizo', responseLine: 'E eu vou transmitir você caindo. Ao vivo.' },
  ],
  'kian+magistrada': [
    { starter: 'magistrada', line: 'Kian. O Equilíbrio já te conteve uma vez.', response: 'kian', responseLine: 'E eu já sei como essa contenção termina, Magistrada.' },
    { starter: 'kian', line: 'A Máscara sabe tudo. Então sabe o que eu vou fazer.', response: 'magistrada', responseLine: 'Sei. Por isso eu vim.' },
  ],
  'joui+magistrada': [
    { starter: 'magistrada', line: 'Joui Jouki. Você prendeu um dos nossos.', response: 'joui', responseLine: 'E você selou a minha espada. Estamos quites?' },
    { starter: 'joui', line: 'As sombras de vocês já me ensinaram muito.', response: 'magistrada', responseLine: 'As sombras não ensinam. Elas lembram.' },
  ],
  'arnaldo+magistrada': [
    { starter: 'arnaldo', line: 'A senhora de novo! Da última vez, me deu uma visão e um relógio que não para.', response: 'magistrada', responseLine: 'Eu te disse que a Relíquia já tinha te encontrado, Arnaldo.' },
    { starter: 'magistrada', line: 'Arnaldo. A Energia ainda vibra no seu bolso.', response: 'arnaldo', responseLine: 'E a plateia adora um bom suspense, minha cara.' },
  ],
  'juan+o_diabo': [
    { starter: 'o_diabo', line: 'Juan. Você ainda carrega o meu trono nas costas.', response: 'juan', responseLine: 'Eu carrego o que eu quiser. Hoje eu vim ver de perto quem me ofereceu o começo.' },
    { starter: 'juan', line: 'Você me deu um novo começo. Agora quero saber o preço inteiro.', response: 'o_diabo', responseLine: 'O preço é você, Juan. Sempre foi.' },
  ],
  'guizo+xande': [
    { starter: 'xande', line: 'Gui! O cumprimento antes, né? Senão dá azar.', response: 'guizo', responseLine: 'Óbvio! Depois eu te bato. Com carinho. E gravando.' },
    { starter: 'guizo', line: 'Xande, depois dessa você me ajuda a editar o vídeo, tá?', response: 'xande', responseLine: 'Só se você me emprestar a câmera por uma semana, idiota.' },
  ],
  'guizo+lirio': [
    { starter: 'lirio', line: 'Ô Chiquinho! Para de me filmar e luta!', response: 'guizo', responseLine: 'Eu consigo fazer os dois, Lírio! É o que eu faço!' },
    { starter: 'guizo', line: 'Lírio, por que você nunca fica quieto numa missão?', response: 'lirio', responseLine: 'E você, Esquisito da Internet, por que filma TUDO?' },
  ],
  'lirio+xande': [
    { starter: 'lirio', line: 'Xande, sai da frente que hoje a Leonora tá com saudade!', response: 'xande', responseLine: 'Lírio, tu vai mesmo bater em mim com essa coisa? Mano...' },
    { starter: 'xande', line: 'Lírio, tu trouxe a Leonora de novo? Ela nunca tira folga?', response: 'lirio', responseLine: 'Ela tira quando quer, Xande. Hoje ela quis vir.' },
  ],
  'aguiar+aghata': [
    { starter: 'aguiar', line: 'Foi você que mexeu no meu corpo, bruxa?', response: 'aghata', responseLine: 'Eu emprestei. Devolvo quando terminar.' },
    { starter: 'aghata', line: 'Aguiar, você ainda está bravo com a troca de corpos?', response: 'aguiar', responseLine: 'Bravo? Ha ha... estou curioso pra saber o que mais você esconde.' },
  ],
  'aguiar+joui': [
    { starter: 'joui', line: 'Uma máscara não te torna maior, assassino.', response: 'aguiar', responseLine: 'Ha ha ha... diz isso pra sua.' },
    { starter: 'aguiar', line: 'Joui, você ainda acha que sabe quem está por trás da máscara?', response: 'joui', responseLine: 'Não preciso saber seu nome pra saber o que você faz.' },
  ],
  'aguiar+kaiser': [
    { starter: 'aguiar', line: 'Névoa não esconde cheiro, garoto.', response: 'kaiser', responseLine: 'Então vem me farejar, Aguiar.' },
    { starter: 'kaiser', line: 'Aguiar, você sempre fareja perigo antes de entrar num lugar?', response: 'aguiar', responseLine: 'Ha ha... só quando alguém tenta esconder alguma coisa.' },
  ],
  'aguiar+arthur': [
    { starter: 'arthur', line: 'Meu rifle já viu coisa pior. Tenta chegar perto, Aguiar.', response: 'aguiar', responseLine: 'Um braço só. Vai ser rápido.' },
    { starter: 'aguiar', line: 'Arthur, você aprendeu a mirar com um braço ou apesar dele?', response: 'arthur', responseLine: 'Aprendi a não desperdiçar tiro com pergunta boba.' },
  ],
  'aguiar+labirinto': [
    { starter: 'labirinto', line: 'Você chama de justiça o caminho que escolheu.', response: 'aguiar', responseLine: 'E você chama de caminho qualquer coisa que leve a Tenebris.' },
    { starter: 'aguiar', line: 'Labirinto, ainda acredita que toda pergunta tem uma saída?', response: 'labirinto', responseLine: 'Não. Algumas portas só servem pra mostrar quem está procurando.' },
  ],
  'arthur+balu': [
    { starter: 'balu', line: 'Arthur! Depois disso, macarrão? Eu pago. Quer dizer... a Ordem paga.', response: 'arthur', responseLine: 'Fechado, Balu. Mas dessa vez tu não pede três pratos.' },
    { starter: 'arthur', line: 'Balu, tu vai mesmo entrar de machado numa conversa?', response: 'balu', responseLine: 'Arthur, eu entro de machado até em velório. Nunca se sabe.' },
  ],
  'balu+dante': [
    { starter: 'balu', line: 'Dante, valeu pela orelha nova. A espiral até combina comigo.', response: 'dante', responseLine: 'Foi o que deu pra fazer com o que o Titã deixou, Balu.' },
    { starter: 'dante', line: 'Balu, você sabe que eu consertei esse machado, né? Não quebra de novo.', response: 'balu', responseLine: 'Não quebro. No máximo amasso um pouquinho em alguém.' },
  ],
  'aghata+balu': [
    { starter: 'aghata', line: 'Balu, você ainda se recusa a transcender?', response: 'balu', responseLine: 'Me recuso, Agatha. O meu Outro Lado é um bom churrasco.' },
    { starter: 'balu', line: 'Agatha, se esse livro morder, eu juro que corto ele no meio.', response: 'aghata', responseLine: 'Ele não morde. Eu, às vezes.' },
  ],
  'balu+joui': [
    { starter: 'balu', line: 'Joui, meu filho, tu come direito? Tá muito magro pra segurar essa espada.', response: 'joui', responseLine: 'Como, Balu-san. Só não como por três.' },
    { starter: 'joui', line: 'Balu-san, você sempre sorri antes de lutar?', response: 'balu', responseLine: 'Sempre. Se eu ficar sério, aí sim tu pode se preocupar.' },
  ],
  'balu+kian': [
    { starter: 'balu', line: 'Tu quebrou meu machado no meio, Kian. Isso eu não esqueço.', response: 'kian', responseLine: 'Quebrarei de novo. E você também.' },
    { starter: 'kian', line: 'Um homem que repudia o paranormal, carregando uma arma amaldiçoada. Previsível.', response: 'balu', responseLine: 'Previsível é a pancada que tu vai levar, Veríssimo— digo, Kian.' },
  ],
  'balu+juan': [
    { starter: 'balu', line: 'Foi tu, ou aquele bicho aí dentro, que amaldiçoou meu machado?', response: 'juan', responseLine: 'Nós dois, Balu. E você gostou do presente.' },
    { starter: 'juan', line: 'O Diabo lembra do seu machado no ombro dele, sabia?', response: 'balu', responseLine: 'Ótimo. Então ele já sabe onde vai doer de novo.' },
  ],
  'aguiar+jae': [
    { starter: 'jae', line: 'Aguiar, deixa o machado. Hoje eu quero brincar sozinha.', response: 'aguiar', responseLine: 'Ha ha... a parceira acordou com fome.' },
    { starter: 'aguiar', line: 'X. Ainda trancando gente na Casa Juno?', response: 'jae', responseLine: 'Só quem merece. Quer uma chave?' },
  ],
  'jae+kemi': [
    { starter: 'kemi', line: 'Jae. O Dalmo sabe que você está aqui?', response: 'jae', responseLine: 'O Colosso não manda em mim, Kemi. Ninguém manda.' },
    { starter: 'jae', line: 'Kemi, larga esse rifle. De perto é mais divertido.', response: 'kemi', responseLine: 'De perto não tem contrato. Só bagunça.' },
  ],
  'aguiar+dalmo': [
    { starter: 'aguiar', line: 'Dalmo! Trouxe mais passageiro pro acampamento?', response: 'dalmo', responseLine: 'Trouxe você, Aguiar. Desce no próximo ponto.' },
    { starter: 'dalmo', line: 'Larga o machado, delegado. Arena é no braço.', response: 'aguiar', responseLine: 'Ha ha... então vem, grandão.' },
  ],
  'dalmo+kemi': [
    { starter: 'kemi', line: 'Da última vez eu baixei o rifle, Dalmo.', response: 'dalmo', responseLine: 'Porque viu a Manu comigo. Hoje ela não tá aqui, Kemi.' },
    { starter: 'dalmo', line: 'Fui eu que te trouxe pro grupo, Kemi.', response: 'kemi', responseLine: 'E eu ainda não cobrei por isso.' },
  ],
  'dalmo+jae': [
    { starter: 'jae', line: 'Shh, Colosso. Você faz barulho demais.', response: 'dalmo', responseLine: 'E você some demais, Jae. Na arena não tem sombra.' },
    { starter: 'dalmo', line: 'Jae, a glória é minha hoje.', response: 'jae', responseLine: 'Fica com a glória. Eu fico com as costas.' },
  ],
  'arnaldo+verissimo': [
    { starter: 'verissimo', line: 'Arnaldo, você ainda segura a espada como se tivesse plateia.', response: 'arnaldo', responseLine: 'Sempre tem plateia, meu velho. Hoje é você.' },
    { starter: 'arnaldo', line: 'Cuide bem dessa espada quando for sua, Veríssimo.', response: 'verissimo', responseLine: 'Não fale assim. Eu ainda preciso de você na Ordem.' },
  ],
  'arnaldo+dante': [
    { starter: 'arnaldo', line: 'Dante! O menino do Santa Menefreda. Olha o tamanho que ficou.', response: 'dante', responseLine: 'O orfanato só ficou de pé por sua causa, Arnaldo. Eu não esqueço.' },
    { starter: 'dante', line: 'Arnaldo, você financiava o orfanato e nunca contou pra ninguém.', response: 'arnaldo', responseLine: 'Um bom ator sabe a hora de ficar fora do palco, Dante.' },
  ],
  'arnaldo+kian': [
    { starter: 'arnaldo', line: 'Eu perguntei à Magistrada como derrotar você, Kian. A resposta veio num relógio.', response: 'kian', responseLine: 'Então você já sabe o preço dessa resposta, ator.' },
    { starter: 'kian', line: 'Arnaldo Fritz. Uma fama inteira construída sobre uma mentira.', response: 'arnaldo', responseLine: 'A fama era o figurino. A Ordem sempre foi o papel.' },
  ],
  'kian+verissimo': [
    { starter: 'kian', line: 'Veríssimo. Eu conheço o fim de todos. O seu continua escondido.', response: 'verissimo', responseLine: 'E vai continuar, Kian. Esse segredo não é seu.' },
    { starter: 'verissimo', line: 'Da última vez eu parei o seu golpe com uma espada comum.', response: 'kian', responseLine: 'Da última vez eu não estava com pressa.' },
  ],
  'arthur+verissimo': [
    { starter: 'verissimo', line: 'Arthur, de pé. Missão nenhuma termina com agente sentado.', response: 'arthur', responseLine: 'Sim, senhor. Mas o senhor sabe que eu sento quando dá.' },
    { starter: 'arthur', line: 'Senhor Veríssimo, obrigado por aquela vez com o Kian.', response: 'verissimo', responseLine: 'Não agradeça. Só não me faça repetir.' },
  ],
  'balu+verissimo': [
    { starter: 'balu', line: 'Veríssimo! Voltei porque tu pediu. Agora não reclama do barulho.', response: 'verissimo', responseLine: 'Eu pedi o Balu inteiro, barulho incluído.' },
    { starter: 'verissimo', line: 'Balu, sem decisões precipitadas hoje.', response: 'balu', responseLine: 'Precipitado eu? Eu só chego antes do plano.' },
  ],
  'arnaldo+erin': [
    { starter: 'erin', line: 'Arnaldo, esse relógio de bolso... posso abrir?', response: 'arnaldo', responseLine: 'Esse não, Erin. Esse guarda a coisa mais preciosa que eu tenho.' },
    { starter: 'arnaldo', line: 'Erin, querida, granada não é adereço de cena.', response: 'erin', responseLine: 'Tudo é adereço de cena se você for corajoso o bastante.' },
  ],
  'labirinto+xande': [
    { starter: 'xande', line: 'Tá, eu não entendi o capacete. Mas vou passar por você.', response: 'labirinto', responseLine: 'Todo caminho passa por aqui. O seu também.' },
    { starter: 'labirinto', line: 'Xande, você sempre escolhe o caminho mais barulhento?', response: 'xande', responseLine: 'Só quando quero que meus amigos saibam onde estou.' },
  ],
};

function buildIntroDialogues() {
  const dialogues = Object.fromEntries(INTRO_IDS.map((id) => [id, {}]));
  for (let i = 0; i < INTRO_IDS.length; i++) {
    for (let j = i + 1; j < INTRO_IDS.length; j++) {
      const first = INTRO_IDS[i];
      const second = INTRO_IDS[j];
      const pairKey = [first, second].sort().join('+');
      const scenes = INTRO_EXCHANGES[pairKey] || voiceScenes(first, second);
      dialogues[first][second] = scenes;
      dialogues[second][first] = scenes;
    }
  }
  return dialogues;
}

export const INTRO_DIALOGUES = buildIntroDialogues();

// ---------------- FALAS DE VITÓRIA: [vencedor][derrotado] (ou .default)
export const VICTORY_LINES = {
  balu: {
    kaiser: [
      'Kaiser, garoto, tu luta bem. Só precisa comer mais.',
      'Essa névoa aí não segura um urso, Kaiser.'
    ],
    arthur: [
      'Foi mal, Arthur! O macarrão é por minha conta, prometo.',
      'Arthur, levanta. Ninguém vai saber que foi o tio Balu.'
    ],
    joui: [
      'Joui, meu filho, espada bonita. Mas machado é machado.',
      'Calma, Joui. Respira. Foi só um susto.'
    ],
    aghata: [
      'Desculpa, Agatha! Eu juro que mirei no livro.',
      'Agatha, tu é esperta demais. Por isso eu não deixei tu pensar.'
    ],
    dante: [
      'Desculpa, Dante. Mas tu que me ensinou a não ter medo de nada.',
      'Calma, Dante, respira. Já passou.'
    ],
    erin: [
      'Granada é bonito, Erin. Mas o tio Balu chega antes da explosão.',
      'Erin, guarda essas coisas antes que alguém se machuque. Tipo eu.'
    ],
    gal_sal: [
      'Corrente nenhuma segura esse machado, rapaz.',
      'Tu dança bonito, Gal. Pena que eu não sei dançar, só bater.'
    ],
    kian: [
      'Isso é pelo machado, Kian. O resto da conta a Ordem cobra.',
      'Quatro mil anos e ainda não aprendeu a desviar de um urso.'
    ],
    aguiar: [
      'Machado contra machado, delegado. O meu é maior.',
      'Tira essa máscara, Aguiar. Tu não assusta ninguém aqui.'
    ],
    labirinto: [
      'Eu não entendi nada do teu labirinto. Por isso fui reto.',
      'Saída? Eu fiz uma, ali na parede.'
    ],
    xande: [
      'Skate é legal, menino. Mas tu precisa de mais músculo.',
      'Bora, Xande, levanta. O tio Balu te paga um lanche.'
    ],
    lirio: [
      'Tu é forte, grandão! Mas o urso aqui é mais velho.',
      'Leonora e o Machado: empate técnico. Mas quem ficou de pé fui eu.'
    ],
    ferreiro: [
      'Tu é alto, Ferreiro. Mas cai igual a todo mundo.',
      'Espada de lodo, machado de sangue. Hoje o sangue ganhou.'
    ],
    juan: [
      'O Diabo me deu um machado novo. Eu só devolvi o favor.',
      'Fica tranquilo, Juan. Dói menos do que parece... eu acho.'
    ],
    kemi: [
      'Atiradora boa, menina. Mas eu já levei tiro à queima-roupa e tô aqui.',
      'Contrato cancelado, Kemi. O tio Balu não estava no orçamento.'
    ]
  },
  kaiser: {
    arthur: [
      'Arthur... você continua sendo uma das poucas pessoas que eu realmente não queria derrotar.',
      'Foi mal, Arthur. Se isso chegar nos seus pais, eu vou dizer que você tropeçou.'
    ],
    joui: [
      'Joui, eu sabia que você não ia facilitar. Só não sabia que ia terminar assim.',
      'Você me deu trabalho, Joui. Como sempre.'
    ],
    aghata: [
      'Agatha, o Arthur vai ficar bravo comigo por isso. Então vamos fingir que foi acidente.',
      'Desculpa, Agatha. Eu prometo que não vou contar pro Arthur como foi fácil... porque não foi.'
    ],
    dante: [
      'Dante, você pensa em dez possibilidades antes de agir. Eu só precisei de uma.',
      'Você analisou tudo, Dante. Só esqueceu de analisar o momento em que eu ia atacar.'
    ],
    erin: [
      'Essa vitória não foi explosiva pra você, Erin?',
      'Erin, eu esperava uma explosão. Recebi uma derrota. Acho que alguém perdeu o timing.'
    ],
    gal_sal: [
      'Gal, você já entrou nessa luta achando que sabia como ela terminaria. Esse foi seu primeiro erro.',
      'Você parecia muito confiante, Gal. Pena que confiança não muda o resultado.'
    ],
    kian: [
      'Você passou tempo demais achando que conhecia todas as respostas, Kian.',
      'Kian, você fala como se já soubesse o final de tudo. Dessa vez, não sabia.'
    ],
    aguiar: [
      'Aguiar, experiência é uma coisa. Saber quando está encurralado é outra.',
      'Você já viu muita coisa, Aguiar. Mas aparentemente ainda tinha uma surpresa guardada.'
    ],
    labirinto: [
      'Labirinto, você fechou todas as saídas. Só esqueceu que eu gosto de achar portas.',
      'Você construiu um labirinto inteiro e ainda assim terminou sem saída.'
    ],
    xande: [
      'Xande, você aguenta pancada pra caramba. Só não aguenta todas.',
      'Você bate forte, Xande. Eu só precisei garantir que a última pancada fosse minha.'
    ],
    lirio: [
      'Lírio, eu não vou perguntar como você consegue carregar essa marreta. Eu só vou comemorar que ela não me acertou.',
      'Lírio, aquela marreta é assustadora. Ainda bem que você não conseguiu usar direito.'
    ],
    ferreiro: [
      'Ferreiro, você é estranhamente tranquilo pra alguém que acabou de perder uma luta.',
      'Você encara a derrota com uma calma impressionante, Ferreiro. Eu não sei se admiro ou me preocupo.'
    ],
    juan: [
      'Juan, depois de tudo que eu já vi, você vai precisar de mais do que isso pra me assustar.',
      'Juan, eu já enfrentei coisa pior. Você só conseguiu me dar trabalho.'
    ],
    kemi: [
      'Kemi, você quase me pegou. Quase ainda conta como erro.',
      'Você foi rápida, Kemi. Mas eu só precisava acertar uma vez.'
    ],
    balu: [
      'Balu, você aguenta pancada demais. Ainda bem que a névoa não cansa.',
      'Fica deitado um pouco, Balu. Eu cuido do resto.'
    ]
  },

  arthur: {
    kaiser: [
      'César, foi mal, irmão. Hoje eu realmente precisava ganhar essa.',
      'Mano, eu gosto de você, mas dessa vez eu não ia deixar barato.'
    ],
    joui: [
      'Joui, eu vou fingir que você deixou eu ganhar. Facilita pros dois.',
      'Joui, você sabe que eu não ia conseguir comemorar isso sem te provocar um pouco.'
    ],
    aghata: [
      'Agatha, você é praticamente minha irmãzinha. Mas irmãzinha nenhuma ganha de mim hoje.',
      'Agatha, desculpa. Eu sei que você vai querer revanche depois dessa.'
    ],
    dante: [
      'Dante, eu sabia que você ia vir preparado. Só não sabia que eu ia ter que bater tanto em você.',
      'Você quase me pegou, Dante. E eu definitivamente não quero repetir essa luta tão cedo.'
    ],
    erin: [
      'Erin, eu tava esperando alguma explosão. Pelo menos a minha vitória veio sem incendiar nada.',
      'Erin, você quase explodiu metade do lugar. Ainda bem que eu terminei isso antes.'
    ],
    gal_sal: [
      'Gal, você pode ficar olhando torto. Eu continuo sendo o cara que ficou de pé.',
      'Gal, não adianta fazer essa cara. Você perdeu e eu ainda tô aqui.'
    ],
    kian: [
      'Kian, você gosta tanto de agir como se soubesse tudo. Hoje faltou uma resposta.',
      'Você fala como se todo mundo fosse previsível, Kian. Eu não sou.'
    ],
    aguiar: [
      'Aguiar, você luta sério demais. Ainda bem que eu também sei levar uma briga a sério.',
      'Aguiar, foi uma luta pesada. Respeito quem consegue chegar até esse ponto.'
    ],
    labirinto: [
      'Labirinto, eu não entendi metade do que você fez. Mas pelo menos entendi o final.',
      'Você tentou me deixar perdido, Labirinto. Só esqueceu que eu posso simplesmente continuar andando.'
    ],
    xande: [
      'Xande, você bate forte pra caramba. Ainda bem que eu também sei levantar.',
      'Xande, essa foi uma daquelas lutas que eu vou sentir amanhã.'
    ],
    lirio: [
      'Lírio, essa marreta é assustadora. O problema foi chegar perto o suficiente pra usar.',
      'Lírio, eu não vou mentir: eu passei metade da luta olhando pra essa marreta.'
    ],
    ferreiro: [
      'Ferreiro, você parece gente boa. Só não precisava ser tão difícil de derrubar.',
      'Você é tranquilo demais, Ferreiro. Pena que não foi tranquilo o bastante pra me vencer.'
    ],
    juan: [
      'Juan, eu já vi coisa muito mais estranha que você. Mas admito que essa foi uma luta e tanto.',
      'Juan, eu não sei exatamente o que você é, mas sei que acabou de perder.'
    ],
    kemi: [
      'Kemi, você quase me fez procurar de onde vinha o tiro. Quase.',
      'Kemi, você é rápida. Só não foi rápida o bastante dessa vez.'
    ],
    balu: [
      'Te devo um macarrão, Balu. Mas hoje quem paga é tu.',
      'Desculpa, véio. Um braço só, mas mira não falta.'
    ]
  },

  joui: {
    kaiser: [
      'César... desculpa, irmão. Dessa vez eu não consegui deixar você ganhar.',
      'César, você sabe que eu não queria te derrubar. Mas numa luta, eu não posso hesitar.'
    ],
    arthur: [
      'Arthur, foi mal! Na próxima você escolhe a música.',
      'Arthur, você sabe que eu vou ouvir piada sobre isso depois. Então deixa eu aproveitar enquanto posso.'
    ],
    aghata: [
      'Agatha, eu sabia que você não ia cair fácil. Ainda assim, eu precisava tentar.',
      'Agatha, você lutou muito bem. Só não conseguiu acompanhar hoje.'
    ],
    dante: [
      'Dante, você continua olhando pra tudo como se já soubesse o que vem depois. Hoje não.',
      'Dante, dessa vez não adiantou prever meus movimentos.'
    ],
    erin: [
      'Erin! Eu sabia que lutar contra você ia ser uma péssima ideia. Foi divertido mesmo assim.',
      'Erin, eu não sei se eu ganhei uma luta ou sobrevivi a uma explosão.'
    ],
    gal_sal: [
      'Gal... depois de tudo que aconteceu, eu não vou fingir que essa vitória não significa nada.',
      'Gal, eu não esqueci nada. E hoje você vai ter que encarar a derrota também.'
    ],
    kian: [
      'Você já tirou gente demais de mim, Kian. Hoje quem caiu foi você.',
      'Kian, você pode falar o que quiser. Eu não vou abaixar a cabeça pra você.'
    ],
    aguiar: [
      'Aguiar, você luta como alguém que já aprendeu a desconfiar de tudo. Eu respeito isso.',
      'Você não chegou até aqui por sorte, Aguiar. Foi uma luta difícil.'
    ],
    labirinto: [
      'Labirinto, você tentou me fazer correr em círculos. Eu só precisava chegar até você.',
      'Você pode mudar o caminho quantas vezes quiser. Uma hora eu encontro você.'
    ],
    xande: [
      'Xande, você é forte pra caramba. Mas eu não cheguei até aqui só na força.',
      'Xande, se eu tivesse tentado ganhar de você só na pancada, eu estaria no chão agora.'
    ],
    lirio: [
      'Lírio, essa marreta quase me mandou conhecer o Outro Lado de perto.',
      'Lírio, eu definitivamente não quero ficar do lado errado dessa marreta de novo.'
    ],
    ferreiro: [
      'Ferreiro, você é tranquilo demais pra alguém que bate desse jeito.',
      'Você luta com uma calma estranha, Ferreiro. Quase me fez esquecer o perigo.'
    ],
    juan: [
      'Juan, eu não sei exatamente o que você é. Só sei que hoje você ficou no chão.',
      'Juan, seja lá o que estiver por trás de você, hoje não foi suficiente.'
    ],
    kemi: [
      'Kemi, você quase me fez esquecer que uma luta pode terminar num segundo.',
      'Kemi, você espera o momento certo. Eu só precisei chegar primeiro.'
    ],
    balu: [
      'Balu-san, desculpe. Você ainda é o mais forte da sala.',
      'Força não basta, Balu-san. Precisa de silêncio também.'
    ]
  },

  aghata: {
    kaiser: [
      'César, você sempre parece estar calculando alguma coisa. Hoje eu fui mais rápida que a sua conta.',
      'Kaiser, você tentou prever meus movimentos. Eu mudei o plano no meio da luta.'
    ],
    arthur: [
      'Arthur, você é forte demais pra alguém que insiste em proteger todo mundo.',
      'Arthur, desculpa. Você sabe que eu não gosto de lutar contra você.'
    ],
    joui: [
      'Joui... eu sabia que você não ia cair fácil. Ainda assim, eu precisava tentar.',
      'Joui, você continua sendo difícil de acompanhar. Hoje eu consegui.'
    ],
    dante: [
      'Dante, você consegue ficar calmo até quando tudo está dando errado. Eu não consigo entender como.',
      'Dante, você ficou calmo até o fim. Eu só fui mais rápida.'
    ],
    erin: [
      'Erin, eu sabia que você ia tentar explodir alguma coisa. Só não sabia que seria você.',
      'Erin, por favor, da próxima vez avisa antes de transformar a luta numa zona de guerra.'
    ],
    gal_sal: [
      'Gal, eu já vi gente falar muito antes de fazer alguma coisa. Você não foi diferente.',
      'Você fala como se já tivesse vencido antes da luta começar. Esse foi o problema.'
    ],
    kian: [
      'Kian... seu broxa. Você fala como se soubesse tudo e ainda conseguiu perder.',
      'Ratinha pra cá, ratinha pra lá... e no fim foi você que acabou no chão, Kian.'
    ],
    aguiar: [
      'Aguiar, você tem experiência. Eu tenho sangue suficiente pra não deixar isso me parar.',
      'Você sabe lutar, Aguiar. Mas eu aprendi a não depender só de experiência.'
    ],
    labirinto: [
      'Labirinto, você pode mudar o caminho quantas vezes quiser. Eu ainda consigo te encontrar.',
      'Você tentou me fazer perder a direção. Só esqueceu que eu também posso mudar o caminho.'
    ],
    xande: [
      'Xande, força não resolve tudo. Principalmente quando eu não deixo você chegar perto.',
      'Você tentou ganhar na força, Xande. Eu preferi não deixar você chegar perto.'
    ],
    lirio: [
      'Lírio, essa marreta parece muito mais assustadora quando não está acertando minha cabeça.',
      'Lírio, eu admito: essa marreta me deu medo. Mas você ainda precisava acertar.'
    ],
    ferreiro: [
      'Ferreiro, você é assustador... mas estranhamente educado pra alguém que acabou de tentar me matar.',
      'Você é uma pessoa estranha, Ferreiro. Até perdendo você parece tranquilo.'
    ],
    juan: [
      'Juan, eu não preciso entender o que você é pra saber onde te machucar.',
      'Juan, eu não sei o que existe dentro de você. Mas descobri onde derrubar.'
    ],
    kemi: [
      'Kemi, você passou a luta inteira tentando desaparecer. Eu só precisei esperar.',
      'Você é boa em se esconder, Kemi. Só não é boa o bastante pra desaparecer de mim.'
    ],
    balu: [
      'Força física é ótima, Balu. Ritual é melhor.',
      'Te avisei que esse machado ia te dar dor de cabeça.'
    ]
  },

  dante: {
    kaiser: [
      'César, você continua tentando encontrar uma saída para tudo. Desta vez, não encontrou.',
      'César, você costuma encontrar soluções. Hoje eu não deixei nenhuma disponível.'
    ],
    arthur: [
      'Arthur, você lutou até o fim. Eu esperava exatamente isso de você.',
      'Arthur, sua determinação não mudou nem quando a derrota ficou evidente.'
    ],
    joui: [
      'Joui, sua determinação continua sendo uma das coisas mais difíceis de enfrentar.',
      'Joui, você continua avançando mesmo quando deveria recuar. É admirável.'
    ],
    aghata: [
      'Agatha, você já passou por coisas suficientes. Ainda assim, continua de pé. Isso é admirável.',
      'Agatha, você não desistiu nem quando a luta já parecia perdida.'
    ],
    erin: [
      'Erin, eu deveria ter previsto que você faria alguma coisa completamente imprevisível.',
      'Erin, admitir que eu não previ isso é provavelmente a parte mais irritante dessa vitória.'
    ],
    gal_sal: [
      'Gal, você fala com muita convicção. Convicção não impede uma derrota.',
      'Gal, confiança é útil. Quando acompanhada de precisão, é ainda melhor.'
    ],
    kian: [
      'Kian, você fala do inevitável como se tivesse inventado o conceito.',
      'Kian, você está acostumado a falar como se o resultado já estivesse decidido. Hoje não estava.'
    ],
    aguiar: [
      'Aguiar, você observa antes de agir. Isso o torna perigoso. Hoje, porém, não foi suficiente.',
      'Aguiar, sua experiência tornou essa luta difícil. Não impossível.'
    ],
    labirinto: [
      'Labirinto, há caminhos que parecem infinitos até encontrarmos a saída.',
      'Você criou caminhos demais, Labirinto. Em algum momento, um deles precisaria terminar.'
    ],
    xande: [
      'Xande, sua força é impressionante. Mas força sem precisão deixa muitas aberturas.',
      'Xande, você tem poder suficiente para vencer. Só precisava acertar.'
    ],
    lirio: [
      'Lírio, sua solução para quase tudo parece ser a mesma: bater mais forte.',
      'Lírio, devo admitir que sua estratégia é simples. E surpreendentemente perigosa.'
    ],
    ferreiro: [
      'Ferreiro, você encara a derrota com uma tranquilidade incomum. Eu respeito isso.',
      'Você parece confortável demais com a ideia de perder, Ferreiro.'
    ],
    juan: [
      'Juan, sua natureza pode ser difícil de compreender. Sua derrota, não.',
      'Juan, eu não preciso compreender completamente você para saber como vencê-lo.'
    ],
    kemi: [
      'Kemi, você passou tempo demais observando minhas mãos. Deveria ter observado meus pés.',
      'Kemi, você percebeu meu ataque tarde demais.'
    ],
    balu: [
      'Sem orelha e agora sem fôlego. Descansa, Balu.',
      'Eu conserto o machado de novo. Mas você fica parado.'
    ]
  },

  erin: {
    kaiser: [
      'César, você é difícil de derrubar! Ainda bem que eu trouxe criatividade.',
      'César, eu sabia que você ia dar trabalho. Só não sabia que ia ser tanto!'
    ],
    arthur: [
      'Arthur! Eu gosto de você, mas amizade não dá ponto extra na luta.',
      'Arthur, nada pessoal! Tá, talvez um pouquinho pessoal.'
    ],
    joui: [
      'Joui! Eu sabia que você ia dar trabalho. Ainda bem que eu adoro uma competição.',
      'Joui, você é rápido! Mas eu sou mais criativa.'
    ],
    aghata: [
      'Agatha, você é assustadora quando fica séria. Eu quase esqueci que era uma luta.',
      'Agatha, você ficou séria demais! Eu tive que compensar com o dobro de caos.'
    ],
    dante: [
      'Dante, você pensa demais! Às vezes é melhor só sair correndo e ver o que acontece.',
      'Dante, você quase previu tudo. O problema é que eu nem eu sabia o que ia fazer.'
    ],
    gal_sal: [
      'Gal, você queria uma luta séria. Eu trouxe exatamente o contrário.',
      'Gal, você parecia tão sério... foi quase divertido demais.'
    ],
    kian: [
      'Kian, você realmente acha que sabe tudo? Que pena. Acabei de te ensinar uma coisa.',
      'Kian, você fala como se tivesse todas as respostas. Eu tenho uma: kabum. Bem, não literalmente.'
    ],
    aguiar: [
      'Aguiar, você tem cara de quem já viu todo tipo de maluquice. Aposto que essa foi nova.',
      'Aguiar, você já enfrentou muita coisa estranha. Espero que tenha gostado dessa.'
    ],
    labirinto: [
      'Labirinto! Eu não entendi seu plano, mas gostei da parte em que você perdeu.',
      'Labirinto, eu me perdi umas três vezes. Ainda assim, achei você no final!'
    ],
    xande: [
      'Xande, você é praticamente uma parede! Uma parede que eu consegui derrubar.',
      'Xande, você aguenta pancada demais! Eu precisei ser criativa.'
    ],
    lirio: [
      'Lírio, essa marreta é ENORME! Eu achei que ia precisar correr pra sempre.',
      'Lírio, você quase acertou essa coisa em mim! Eu ainda estou comemorando que não acertou.'
    ],
    ferreiro: [
      'Ferreiro, você é muito grande! Ainda bem que explosão não precisa pedir licença.',
      'Ferreiro, eu acho que você e eu temos definições muito diferentes de uma luta tranquila.'
    ],
    juan: [
      'Juan, eu não faço ideia do que você é. Mas foi muito divertido te derrubar.',
      'Juan, isso foi estranho até pros meus padrões. E olha que meus padrões são baixos.'
    ],
    kemi: [
      'Kemi, você quase me acertou! Isso foi assustador. Faz de novo depois.',
      'Kemi, você é assustadoramente rápida. Eu gostei.'
    ],
    balu: [
      'Desculpa, Balu! A granada era pro outro lado, juro.',
      'Tamanho não segura explosão, grandão.'
    ]
  },

  gal_sal: {
    kaiser: [
      'César, você sempre parece estar procurando a próxima jogada. Eu só precisei esperar você escolher.',
      'Você tenta calcular cada movimento, César. Eu apenas esperei o erro.'
    ],
    arthur: [
      'Arthur, você insiste em levantar. É uma qualidade admirável. Também é cansativa.',
      'Arthur, sua persistência é impressionante. Pena que não foi suficiente.'
    ],
    joui: [
      'Joui, você ainda luta como se tivesse algo a provar. Eu já sei exatamente do que você é capaz.',
      'Joui, você não mudou tanto quanto pensa. A diferença é que agora eu sei o que esperar.'
    ],
    aghata: [
      'Agatha, você aprendeu bastante desde que nos conhecemos. Ainda não o suficiente.',
      'Você evoluiu, Agatha. Eu seria um tolo se ignorasse isso. Ainda assim, você perdeu.'
    ],
    dante: [
      'Dante, essa sua calma é interessante. Quero saber quanto dela sobra depois de perder.',
      'Dante, você manteve a compostura até o fim. Isso merece respeito.'
    ],
    erin: [
      'Erin... você continua gostando de explosões. Pena que dessa vez não conseguiu fazer uma.',
      'Erin, seu caos quase funcionou. Quase.'
    ],
    kian: [
      'Kian, você passou a vida tratando pessoas como peças. Não esqueça que peças também podem quebrar o tabuleiro.',
      'Você gosta de mover todos ao seu redor, Kian. Dessa vez alguém moveu você.'
    ],
    aguiar: [
      'Aguiar, você não hesita. Eu respeito isso. Só não confunda respeito com misericórdia.',
      'Você não hesitou nem por um segundo, Aguiar. Foi por isso que a luta durou tanto.'
    ],
    labirinto: [
      'Labirinto, você gosta de esconder o caminho. Eu gosto de cortar caminho.',
      'Você tornou o caminho complicado. Não necessariamente difícil.'
    ],
    xande: [
      'Xande, força é ótima. Principalmente quando você sabe onde acertar.',
      'Xande, sua força seria assustadora se eu tivesse deixado você usá-la.'
    ],
    lirio: [
      'Lírio, você realmente acha que uma marreta resolve qualquer problema?',
      'Lírio, sua marreta é impressionante. Sua estratégia, nem tanto.'
    ],
    ferreiro: [
      'Ferreiro, você tem uma tranquilidade curiosa para alguém que acabou de perder.',
      'Você aceita a derrota com muita facilidade, Ferreiro. Isso é raro.'
    ],
    juan: [
      'Juan, você sorri demais para alguém que acabou de descobrir que pode perder.',
      'Juan, esse sorriso desapareceu rápido.'
    ],
    kemi: [
      'Kemi, você fala pouco. Ainda assim, eu consegui entender exatamente o que você faria.',
      'Você tentou ser imprevisível, Kemi. Não foi suficiente.'
    ],
    balu: [
      'Um urso acorrentado. Que imagem bonita.',
      'Você protege todo mundo, Balu. Quem protege você?'
    ]
  },

  kian: {
    kaiser: [
      'César, você sempre tentou transformar o impossível em um problema que pudesse resolver. Hoje não havia solução.',
      'Você procura lógica onde ela não existe, César. Foi isso que o fez perder.'
    ],
    arthur: [
      'Arthur, você continua protegendo pessoas que inevitavelmente perderá. É uma escolha curiosa.',
      'Você insiste em proteger todos ao seu redor. Um dia descobrirá o preço disso.'
    ],
    joui: [
      'Seu Anjo está queimando no inferno, Joui. E mesmo assim você continua fingindo que pode salvá-lo.',
      'Joui, você chama isso de coragem. Eu vejo apenas alguém incapaz de aceitar o que perdeu.'
    ],
    aghata: [
      'Ratinha... você ainda corre atrás de respostas que não consegue compreender.',
      'Ratinha, você continua tentando parecer maior do que é.'
    ],
    dante: [
      'Dante, tanto conhecimento acumulado e ainda assim você permanece preso às mesmas limitações.',
      'Você estudou tanto, Dante. E mesmo assim não encontrou uma maneira de me vencer.'
    ],
    erin: [
      'Erin, até o seu caos possui padrões. E tudo que possui um padrão pode ser compreendido.',
      'Seu caos é previsível, Erin. Só demorou um pouco para eu perceber.'
    ],
    gal_sal: [
      'Gal, você passou tanto tempo tentando servir a um propósito que esqueceu de descobrir se ele era seu.',
      'Você confunde propósito com submissão, Gal. É por isso que continua preso.'
    ],
    aguiar: [
      'Aguiar, experiência é uma ferramenta. Contra mim, ela é apenas mais uma ferramenta inútil.',
      'Você acumulou experiência durante anos. Eu existo há muito mais tempo.'
    ],
    labirinto: [
      'Labirinto, você passou tanto tempo procurando caminhos que esqueceu de perguntar onde eles terminavam.',
      'Você criou caminhos demais. Eu simplesmente escolhi aquele que levava à sua derrota.'
    ],
    xande: [
      'Xande, força física é uma solução bastante simples para um problema que não é.',
      'Você tentou resolver algo complexo usando apenas força. Era previsível.'
    ],
    lirio: [
      'Lírio, sua marreta pode destruir muitas coisas. Conhecimento não é uma delas.',
      'Você pode quebrar pedra, Lírio. Não pode quebrar aquilo que não entende.'
    ],
    ferreiro: [
      'Ferreiro, você representa a morte. Eu passei tempo demais aprendendo o que existe além dela.',
      'Você conhece a morte. Eu conheço aquilo que está além dela.'
    ],
    juan: [
      'Juan, você chama isso de poder. Eu chamaria de mais uma consequência da ignorância.',
      'Você possui poder, Juan. Isso não significa que compreenda o que ele é.'
    ],
    kemi: [
      'Kemi, você aprendeu a sobreviver escondida. Não confunda sobrevivência com liberdade.',
      'Você sabe desaparecer, Kemi. Mas não pode desaparecer de alguém como eu.'
    ],
    balu: [
      'O machado quebrou uma vez. O homem quebra do mesmo jeito.',
      'Força bruta. A forma mais antiga e mais previsível de perder.'
    ]
  },

  aguiar: {
    kaiser: [
      'Kaiser, você é bom. Mas eu aprendi faz tempo a não dar uma segunda chance.',
      'Você é habilidoso, Kaiser. Só não foi cuidadoso o bastante.'
    ],
    arthur: [
      'Arthur, você lutou bem. Agora levanta, respira e aprende com isso.',
      'Boa luta, Arthur. Você tem muito mais força do que parece.'
    ],
    joui: [
      'Joui, velocidade é ótima. Saber quando parar é melhor.',
      'Você é rápido, Joui. Mas velocidade sem controle abre espaço.'
    ],
    aghata: [
      'Agatha, você tem força de sobra. Só precisa escolher melhor quando gastar.',
      'Você tem coragem, Agatha. Só precisa aprender quando transformar coragem em estratégia.'
    ],
    dante: [
      'Dante, você é perigoso. Foi por isso que eu não deixei você ditar o ritmo.',
      'Eu sabia que você seria um problema, Dante. Por isso não te dei tempo.'
    ],
    erin: [
      'Erin, você quase transformou isso numa bagunça. Quase.',
      'Erin, você quase me pegou no meio daquela confusão.'
    ],
    gal_sal: [
      'Gal, ameaça não me impressiona. Resultado também não se anuncia.',
      'Você gosta de parecer perigoso, Gal. Eu prefiro simplesmente fazer o trabalho.'
    ],
    kian: [
      'Kian, conhecer o paranormal não significa saber lutar contra alguém.',
      'Você sabe muita coisa, Kian. Mas saber não é o mesmo que vencer.'
    ],
    labirinto: [
      'Labirinto, você tentou conduzir a luta. Eu só conduzi você até o fim.',
      'Você controlou o terreno. Eu controlei o combate.'
    ],
    xande: [
      'Xande, você tem força de sobra. Técnica fez a diferença hoje.',
      'Você bate forte, Xande. Eu só fui mais preciso.'
    ],
    lirio: [
      'Lírio, eu já vi muita gente grande cair. Você não seria o primeiro.',
      'Essa marreta é pesada, Lírio. Mas não pesa tanto quanto uma abertura.'
    ],
    ferreiro: [
      'Ferreiro, não precisa levar pro lado pessoal. Foi só uma luta.',
      'Boa luta, Ferreiro. Você aguenta mais do que parece.'
    ],
    juan: [
      'Juan, seja lá qual for sua forma, a regra continua a mesma: não deixe o adversário chegar perto.',
      'Juan, eu não preciso saber o que você é. Só preciso saber como derrubar você.'
    ],
    kemi: [
      'Kemi, você sabe esperar. Eu também.',
      'Você esperou pelo momento certo, Kemi. Eu também estava esperando.'
    ],
    balu: [
      'Ha ha... urso grande, pele grossa. Dá mais trabalho, só isso.',
      'Machado bonito, Balu. Vai ficar ótimo na minha coleção.'
    ]
  },

  labirinto: {
    kaiser: [
      'Kaiser, você procurou uma saída. Eu só precisei mudar a porta.',
      'Você encontrou muitas portas, Kaiser. Nenhuma levava para onde precisava.'
    ],
    arthur: [
      'Arthur, você continua sorrindo mesmo quando não entende o caminho. Interessante.',
      'Arthur, você não precisa entender o caminho para continuar andando. Isso é raro.'
    ],
    joui: [
      'Joui, você correu bastante. No fim, chegou exatamente onde eu queria.',
      'Você tentou fugir do caminho, Joui. O caminho já tinha escolhido você.'
    ],
    aghata: [
      'Agatha, você tentou quebrar meu ritmo. Eu só mudei o caminho.',
      'Você percebeu o truque, Agatha. Só não percebeu o próximo.'
    ],
    dante: [
      'Dante, você entende muitas coisas. Hoje não entendeu esta.',
      'Você procurou uma explicação, Dante. Algumas coisas não precisam de uma.'
    ],
    erin: [
      'Erin, você procurou lógica demais onde não existia nenhuma.',
      'Erin, você tentou transformar o labirinto em um experimento. Ele não colaborou.'
    ],
    gal_sal: [
      'Gal, você gosta de controlar o caminho. Eu gosto quando alguém tenta fazer isso.',
      'Você gosta de acreditar que escolhe o caminho, Gal. Nem sempre escolhe.'
    ],
    kian: [
      'Kian, até você pode se perder quando o caminho deixa de obedecer.',
      'Você conhece muitos caminhos, Kian. Hoje nenhum deles serviu.'
    ],
    aguiar: [
      'Aguiar, experiência deixa rastros. Eu só precisei seguir os seus.',
      'Você deixou poucas pistas, Aguiar. Foram suficientes.'
    ],
    xande: [
      'Xande, você tentou atravessar tudo pela força. Eu só movi a passagem.',
      'Você tentou quebrar o caminho, Xande. Eu simplesmente mudei o caminho.'
    ],
    lirio: [
      'Lírio, você gosta de abrir portas. Hoje nenhuma delas levou até mim.',
      'Você pode quebrar portas, Lírio. Isso não significa que encontrará a saída.'
    ],
    ferreiro: [
      'Ferreiro, até a morte precisa encontrar um caminho para chegar.',
      'Você conhece o fim, Ferreiro. Eu conheço os caminhos que levam até ele.'
    ],
    juan: [
      'Juan, você entrou achando que conhecia o lugar. Agora conhece a saída.',
      'Você entrou confiante, Juan. Saiu sabendo que estava perdido.'
    ],
    kemi: [
      'Kemi, você sabe se esconder. Eu sei procurar.',
      'Você quase desapareceu de mim, Kemi. Quase.'
    ],
    balu: [
      'Você foi reto. O labirinto não tem reta.',
      'A força te trouxe até a porta. Não te deu a chave.'
    ]
  },

  xande: {
    kaiser: [
      'Kaiser, você aguenta bastante. Mas eu também sei bater.',
      'Kaiser, você é resistente. Só não mais que eu.'
    ],
    arthur: [
      'Arthur, foi mal, mano. Essa luta foi boa demais pra eu aliviar.',
      'Arthur, você é gente boa. Mas quando começa a luta, eu não seguro a mão.'
    ],
    joui: [
      'Joui, você é rápido pra caramba! Só não conseguiu escapar de tudo.',
      'Joui, você quase me fez correr atrás de você a luta inteira.'
    ],
    aghata: [
      'Agatha, você veio com vontade. Eu gosto de quem não foge.',
      'Agatha, você não arregou nem quando ficou difícil. Respeito isso.'
    ],
    dante: [
      'Dante, esses seus truques são sinistros. Ainda assim, eu consegui te acertar.',
      'Dante, eu não entendi metade dos seus movimentos. Só precisei acertar a outra metade.'
    ],
    erin: [
      'Erin, nunca vi alguém tão feliz em transformar uma luta numa explosão.',
      'Erin, você conseguiu fazer barulho suficiente por dez pessoas.'
    ],
    gal_sal: [
      'Gal, falar é fácil. Quero ver levantar depois dessa.',
      'Gal, pode parar de olhar assim. A luta já acabou.'
    ],
    kian: [
      'Kian, você sabe muita coisa. Eu só precisava saber bater.',
      'Kian, você fala difícil demais. Eu prefiro resolver no soco.'
    ],
    aguiar: [
      'Aguiar, você luta sério. Foi bom encontrar alguém que não fica de brincadeira.',
      'Aguiar, essa foi uma luta de verdade. Gostei.'
    ],
    labirinto: [
      'Labirinto, eu não preciso entender o caminho. Só preciso abrir passagem.',
      'Você pode mudar o caminho, Labirinto. Eu posso quebrar o que estiver na frente.'
    ],
    lirio: [
      'Lírio... essa foi briga de verdade. Gostei.',
      'Lírio, agora sim! Uma luta que valeu cada pancada.'
    ],
    ferreiro: [
      'Ferreiro, você é grande. Eu ainda sou mais teimoso.',
      'Você aguenta pancada, Ferreiro. Mas eu também.'
    ],
    juan: [
      'Juan, não importa o que você virou. Se dá pra acertar, dá pra derrubar.',
      'Juan, seja lá o que você virou, ainda dá pra te derrubar.'
    ],
    kemi: [
      'Kemi, você é rápida demais! Quase me fez correr atrás de você.',
      'Kemi, você quase desapareceu antes que eu conseguisse acertar.'
    ],
    balu: [
      'Desculpa, tio Balu! O skate pegou mais forte do que eu queria.',
      'Por eles... e um pouquinho por mim também.'
    ]
  },

  lirio: {
    kaiser: [
      'César, você é um cabra difícil de derrubar. Mas eu sou mais teimoso.',
      'César, você deu trabalho, rapaz. Mas uma hora a marreta encontra o caminho.'
    ],
    arthur: [
      'Arthur, rapaz, você luta bem! Só que hoje a marreta falou mais alto.',
      'Arthur, você é bom de briga. Mas hoje não foi seu dia.'
    ],
    joui: [
      'Joui, você corre que nem um danado. Mas uma hora tinha que parar.',
      'Joui, menino, você quase me fez cansar só de correr atrás.'
    ],
    aghata: [
      'Agatha, você é valente! Pena que valentia não segura pancada.',
      'Agatha, gostei da sua coragem. Só faltou ela aguentar a marreta.'
    ],
    dante: [
      'Dante, você pensa demais. Enquanto pensa, eu bato.',
      'Dante, enquanto você calculava, eu já estava com a marreta descendo.'
    ],
    erin: [
      'Erin, eu nunca vi alguém gostar tanto de explosão. Quase fiquei com medo!',
      'Erin, menina, você fez mais barulho que a minha marreta!'
    ],
    gal_sal: [
      'Gal, pode parar com essa cara. Aqui não tem mistério: eu ganhei.',
      'Gal, não precisa fazer essa cara feia. Foi uma boa luta.'
    ],
    kian: [
      'Kian, você fala bonito demais pra quem acabou de levar uma marretada.',
      'Kian, rapaz, pode explicar o paranormal depois. Agora fica no chão.'
    ],
    aguiar: [
      'Aguiar, gostei da luta! Mas hoje quem ficou de pé fui eu.',
      'Aguiar, você sabe lutar. Mas eu sei bater mais forte.'
    ],
    labirinto: [
      'Labirinto, eu não preciso achar o caminho. Eu abro um.',
      'Você pode esconder a saída. Eu faço outra.'
    ],
    xande: [
      'Xande, ô rapaz... essa foi briga de verdade!',
      'Xande, agora sim eu achei alguém que aguenta uma pancada!'
    ],
    ferreiro: [
      'Ferreiro, você parece gente boa. Mas não vou deixar de te derrubar por isso.',
      'Ferreiro, nada pessoal, rapaz. Uma luta é uma luta.'
    ],
    juan: [
      'Juan, não sei que diabo você é. Só sei que minha marreta acertou.',
      'Juan, você é esquisito demais. Ainda bem que minha marreta não faz perguntas.'
    ],
    kemi: [
      'Kemi, menina, você some ligeiro! Ainda bem que eu acertei quando apareceu.',
      'Kemi, você é ligeira que só. Mas uma hora aparece no lugar errado.'
    ],
    balu: [
      'A Leonora gostou de você, Balu. Bate igual a ela.',
      'Parede contra urso. A parede ficou.'
    ]
  },

  ferreiro: {
    kaiser: [
      'César, rapaz... você lutou muito bem. Só não precisava continuar depois que já tinha perdido.',
      'César, você é resistente. Foi uma boa luta, rapaz.'
    ],
    arthur: [
      'Arthur, você tem um coração forte. Foi uma boa luta, rapaz.',
      'Arthur, você protege os outros até quando devia pensar em si mesmo.'
    ],
    joui: [
      'Joui, você luta com muita vontade. Não deixe uma derrota tirar isso de você.',
      'Joui, essa determinação sua é coisa rara. Continue assim.'
    ],
    aghata: [
      'Agatha, você é determinada. O Arthur não exagerava quando falava de você.',
      'Agatha, você é mais forte do que parece. Não deixe essa derrota te convencer do contrário.'
    ],
    dante: [
      'Dante, você sempre parece estar pensando em alguma coisa. Eu respeito essa calma.',
      'Dante, você luta com uma calma que eu não vejo em muita gente.'
    ],
    erin: [
      'Erin, você é barulhenta demais! Mas confesso que essa energia é difícil de não gostar.',
      'Erin, menina, você consegue transformar qualquer luta numa festa.'
    ],
    gal_sal: [
      'Gal, você parece carregar coisa demais dentro de si. Hoje pode descansar um pouco.',
      'Gal, você parece estar lutando contra mais do que só o adversário.'
    ],
    kian: [
      'Kian, você fala como se soubesse o destino de todo mundo. Eu não compro essa conversa.',
      'Kian, rapaz, conhecer o destino não significa controlar tudo.'
    ],
    aguiar: [
      'Aguiar, você luta com experiência. Foi uma luta honesta.',
      'Aguiar, você tem muita estrada. Foi bom enfrentar alguém assim.'
    ],
    labirinto: [
      'Labirinto, não entendi metade do que você fez. Mas gostei do desafio.',
      'Você gosta de complicar as coisas, Labirinto. Às vezes o caminho simples também funciona.'
    ],
    xande: [
      'Xande, rapaz, você bate forte! Foi uma boa pancadaria.',
      'Xande, você tem força de sobra. Foi difícil ficar de pé contra você.'
    ],
    lirio: [
      'Lírio, você é tão barulhento quanto forte. Gostei de lutar com você.',
      'Lírio, essa sua marreta faz um barulho que ninguém esquece.'
    ],
    juan: [
      'Juan, você parece carregar algo muito pesado consigo. Espero que um dia consiga largar.',
      'Juan, tem alguma coisa em você que parece estar sempre procurando uma saída.'
    ],
    kemi: [
      'Kemi, você luta como alguém que aprendeu cedo a não depender de ninguém.',
      'Kemi, você aprendeu a lutar sozinha. Espero que um dia não precise mais.'
    ],
    balu: [
      'Força e fé, Balu. Faltou a fé.',
      'Santo Berço não cai para um homem só.'
    ]
  },

  juan: {
    kaiser: [
      'César, você ainda procura uma explicação pra tudo. Que adorável.',
      'Você tenta entender tudo antes de agir, César. Eu prefiro agir primeiro.'
    ],
    arthur: [
      'Arthur, esse sorriso continua aí? Você realmente é difícil de quebrar.',
      'Arthur, você continua sorrindo mesmo depois de perceber que perdeu.'
    ],
    joui: [
      'Joui, você insiste em lutar mesmo quando sabe que está perdendo. Coragem ou teimosia?',
      'Joui, você não sabe quando parar. Talvez seja isso que torna você interessante.'
    ],
    aghata: [
      'Agatha, você não hesitou. Eu gosto disso em uma presa.',
      'Agatha, você não fugiu. Pelo menos isso tornou a luta interessante.'
    ],
    dante: [
      'Dante, você tenta esconder muito bem o que sente. Eu ainda consigo perceber.',
      'Dante, você é bom em esconder emoções. Não tão bom em esconder intenções.'
    ],
    erin: [
      'Erin, você gosta de explosões? Que coincidência... eu gosto de ver coisas se desfazerem.',
      'Erin, você transforma tudo em caos. Eu simplesmente deixo o caos terminar o trabalho.'
    ],
    gal_sal: [
      'Gal, você tem tanta certeza de si. É quase uma pena estragar isso.',
      'Gal, confiança demais costuma deixar uma abertura enorme.'
    ],
    kian: [
      'Kian, você acredita que conhece todas as respostas. Eu gosto mais das perguntas.',
      'Você gosta de falar como se o mundo já tivesse sido explicado, Kian. Que limitado.'
    ],
    aguiar: [
      'Aguiar, você já enfrentou monstros antes. Talvez ainda não tenha entendido o que está diante de você.',
      'Você já viu muita coisa, Aguiar. Mas ainda não viu tudo.'
    ],
    labirinto: [
      'Labirinto, você gosta de esconder as coisas. Eu gosto de encontrá-las.',
      'Você constrói caminhos para ninguém encontrar você. Eu achei mesmo assim.'
    ],
    xande: [
      'Xande, você tentou resolver tudo com força. Eu simplesmente mudei as regras.',
      'Força não adianta quando o jogo muda, Xande.'
    ],
    lirio: [
      'Lírio, você tem uma maneira muito simples de resolver problemas. Admito que é divertida.',
      'Lírio, eu gosto dessa sua solução para tudo. Pena que hoje ela falhou.'
    ],
    ferreiro: [
      'Ferreiro... você conhece a morte. Eu conheço algo um pouco mais interessante.',
      'Ferreiro, você encara a morte como se ela fosse o fim. Eu não tenho tanta certeza.'
    ],
    kemi: [
      'Kemi, você me olhou a luta inteira como se estivesse calculando um contrato.',
      'Kemi, você observa demais. Às vezes é melhor agir antes.'
    ],
    balu: [
      'O machado ainda é meu, Balu. Você só empresta.',
      'Doeu? Que bom. O sangue lembra.'
    ]
  },

  kemi: {
    kaiser: [
      'Kaiser, você demorou demais pra decidir. Eu não.',
      'Você hesitou por meio segundo, Kaiser. Foi o bastante.'
    ],
    arthur: [
      'Arthur, você tenta deixar todo mundo confortável. Comigo isso não funciona.',
      'Você tenta proteger todo mundo, Arthur. Eu só precisei esperar uma abertura.'
    ],
    joui: [
      'Joui, você corre muito. Eu gosto de alvo que dá trabalho.',
      'Você é rápido, Joui. Isso tornou a luta mais interessante.'
    ],
    aghata: [
      'Agatha, você passou a luta inteira tentando me encontrar. Eu estava esperando você chegar.',
      'Você quase me encontrou, Agatha. Quase.'
    ],
    dante: [
      'Dante, você me observou demais. Devia ter prestado atenção no resto.',
      'Você analisou meus movimentos. Eu só mudei um deles.'
    ],
    erin: [
      'Erin, explosões fazem muito barulho. Ótimas pra esconder um tiro.',
      'Erin, você fez barulho suficiente pra eu nem precisar procurar você.'
    ],
    gal_sal: [
      'Gal, você fala como se estivesse no controle. Não estava.',
      'Você gosta de parecer no controle, Gal. Não conseguiu dessa vez.'
    ],
    kian: [
      'Kian, você olha pras pessoas como peças. Eu não sou uma peça.',
      'Você tentou me tratar como parte do seu jogo. Eu não jogo pelas suas regras.'
    ],
    aguiar: [
      'Aguiar, você percebeu a armadilha. Só não percebeu a segunda.',
      'Você percebeu meu primeiro movimento, Aguiar. O segundo já foi tarde demais.'
    ],
    labirinto: [
      'Labirinto, você prepara o terreno muito bem. Eu também.',
      'Você controla o lugar. Eu controlo o momento.'
    ],
    xande: [
      'Xande, você faz muito barulho. Foi fácil saber onde estava.',
      'Você é difícil de derrubar, Xande. Mas impossível de esconder.'
    ],
    lirio: [
      'Lírio, você é grande demais pra se esconder. Facilitou meu trabalho.',
      'Você não precisa procurar você, Lírio. Dá pra ouvir a marreta de longe.'
    ],
    ferreiro: [
      'Ferreiro, você é estranho. Não parece alguém que eu deveria matar... mas contrato não pergunta.',
      'Você parece tranquilo demais pra alguém com um trabalho desses.'
    ],
    juan: [
      'Juan... você não parece um alvo comum. Isso torna o trabalho mais interessante.',
      'Você não é um alvo normal, Juan. Finalmente uma coisa interessante.'
    ],
    balu: [
      'Alvo grande, fácil de acertar.',
      'Nada pessoal, Balu. Mas você estava no caminho do contrato.'
    ]
  }
};

// ARNALDO FRITZ e SENHOR VERÍSSIMO: as falas de vitória deles e as de quem vence contra eles
const VICTORY_NEW = {
  anfitriao: {
    default: [
      'Você lutou com tanta confiança que quase me senti mal. Quase; passou.',
      'Eu tinha preparado um prêmio pra você. Aí você perdeu e fiquei com o prêmio.',
      'Se alguém perguntar, eu te dei uma chance. Não precisa explicar que era mentira.',
      'Essa cara é de derrota ou você sempre fica assim quando pensa?',
      'Você quase me venceu. Eu também quase paguei minhas contas ontem.',
      'Eu ia deixar você escolher qualquer coisa. Aí lembrei que você escolhe mal.',
      'Não fica triste. Até aquela cadeira ali achou que ia ganhar.',
      'Foi por pouco. Quer dizer, por bastante. Mas o "pouco" consola.',
      'Eu apostei em você. Perdi dinheiro e um pouco do respeito que eu tinha por mim.',
      'Boa tentativa. Minha esposa também acha que insistir muda alguma coisa.',
      'Se eu devolver sua dignidade, promete não perder de novo?',
      'Você caiu de um jeito tão dramático que quase estragou meu humor. Quase.',
      'Eu gostei de você. Não o suficiente pra parar, mas o suficiente pra lembrar seu nome.',
      'Pode culpar a sorte. Ela já está acostumada a levar a culpa por você.',
      'Seus amigos vão perguntar como foi. Mente; diz que eu estava distraído.',
      'Eu ia te consolar, mas isso exigiria fingir que me importo.',
      'Não foi uma derrota. Foi uma demonstração pública das suas limitações.',
      'Você sobreviveu? Ah. Então preciso pensar num prêmio melhor.',
    ],
  },
  arnaldo: {
    kaiser: [
      'Kaiser, você tem presença de palco. Falta só ensaiar a queda.',
      'Belíssima névoa, rapaz. Mas o holofote é meu esta noite.'
    ],
    arthur: [
      'Arthur, eu treinei a sua equipe. Achou mesmo que eu não conhecia os seus truques?',
      'Levanta, Arthur. Agente da Ordem não fica no chão depois do terceiro ato.'
    ],
    joui: [
      'Joui, katana bonita. Mas uma espada comum, bem empunhada, ainda faz milagres.',
      'Rápido demais, garoto. O público nem viu. Eu vi.'
    ],
    aghata: [
      'Agatha, você lê rituais. Eu leio pessoas. Hoje ganhou a leitura mais antiga.',
      'Que estreia, Agatha. Volte quando tiver decorado o texto.'
    ],
    dante: [
      'Dante, me perdoe. O Santa Menefreda continua sendo a sua casa.',
      'Você cresceu, menino. Mas o velho Arnaldo ainda sabe um passo ou dois.'
    ],
    erin: [
      'Erin, explosões são ótimas no cinema. Na vida real, eu prefiro a espada.',
      'Bravo, Erin! Só faltou a parte em que você acerta.'
    ],
    gal_sal: [
      'Correntes, Gal? Já vi números de escapismo melhores.',
      'O seu Deus pode assistir. Eu faço questão de plateia.'
    ],
    kian: [
      'Mais uma cena que você não previu, Kian.',
      'O relógio do Thiago ainda bate. O seu tempo, não.'
    ],
    aguiar: [
      'Máscara não é personagem, Aguiar. Personagem é quem está por baixo.',
      'Caçador da noite? O espetáculo acabou antes do seu toque de recolher.'
    ],
    labirinto: [
      'Um labirinto é só um cenário mal iluminado, rapaz.',
      'Encontrei a saída. Ela estava na ponta da minha espada.'
    ],
    xande: [
      'Xande, energia demais e roteiro de menos.',
      'Que vigor! Eu tinha isso aos vinte. Hoje tenho experiência.'
    ],
    lirio: [
      'Lírio, a Leonora é pesada. Eu só precisei desviar dela.',
      'Você é a parede, Lírio. Eu sou a porta dos fundos.'
    ],
    ferreiro: [
      'Guardião de Santo Berço, que presença! Mas o palco é meu.',
      'Uma espada consumidora contra uma espada comum. Quem diria, não?'
    ],
    juan: [
      'Juan, o Diabo é um coadjuvante muito exigente.',
      'Sangue e drama. Eu prefiro o meu drama sem manchas.'
    ],
    kemi: [
      'Kemi, você atira como quem já ensaiou. Eu também ensaiei.',
      'A Fantasma sai de cena. Aplausos para a atiradora.'
    ],
    balu: [
      'Balu, meu caro! Força bruta precisa de coreografia.',
      'O tio Balu caiu. Alguém traga um prato de comida pra ele.'
    ],
    verissimo: [
      'Desculpe, velho amigo. Hoje o protagonista sou eu.',
      'Veríssimo, guarde a lição: nunca subestime um ator.'
    ],
  },
  verissimo: {
    kaiser: [
      'Kaiser, coragem não substitui plano.',
      'Bom trabalho, agente. Ainda não é o suficiente.'
    ],
    arthur: [
      'Arthur, relatório completo amanhã. Inclusive desta derrota.',
      'Você é bom, Arthur. Por isso eu exijo mais.'
    ],
    joui: [
      'Joui, velocidade sem disciplina é só pressa.',
      'Levante. Vou te mandar para o treinamento outra vez.'
    ],
    aghata: [
      'Agatha, pare de se meter onde não foi chamada.',
      'Inteligência você tem. Agora aprenda a obedecer uma ordem.'
    ],
    dante: [
      'Dante, o Lodo não ganha discussão comigo.',
      'Você é teimoso, Dante. Eu sou mais.'
    ],
    erin: [
      'Erin, a próxima granada vai para o almoxarifado. Fechada.',
      'Agente Parker, menos explosão e mais estratégia.'
    ],
    gal_sal: [
      'Correntes não seguram quem já planejou a saída.',
      'A Ordem não negocia com a sua justiça, Gal.'
    ],
    kian: [
      'Eu disse que você não consegue me matar, Kian.',
      'O meu segredo continua guardado. E você, no chão.'
    ],
    aguiar: [
      'Mais um Mascarado no relatório.',
      'A noite acabou para você, Aguiar.'
    ],
    labirinto: [
      'Todo labirinto tem saída para quem anda com mapa.',
      'Arquivem esse capacete com o resto das evidências.'
    ],
    xande: [
      'Xande, a raiva te deixa previsível.',
      'Força tem limite. Disciplina, não.'
    ],
    lirio: [
      'Lírio, proteger os outros é nobre. Proteger a si mesmo também é necessário.',
      'Boa parede, Lírio. Parede não anda.'
    ],
    ferreiro: [
      'Ferreiro, Santo Berço vai continuar de pé. Você só vai descansar um pouco.',
      'Espada contra espada. A minha tinha dono melhor.'
    ],
    juan: [
      'Juan, o Diabo não comanda esta operação.',
      'Contenham o alvo. Ele não sai mais daqui.'
    ],
    kemi: [
      'Kemi, mira perfeita. Posição errada.',
      'Atiradora neutralizada. Próximo.'
    ],
    balu: [
      'Balu, eu te chamei de volta para ajudar, não para apanhar.',
      'De pé, Balu. A Ordem ainda precisa de você.'
    ],
    arnaldo: [
      'Arnaldo... a espada sempre foi melhor na sua mão.',
      'Velho amigo, você me ensinou essa estocada.'
    ],
  },
  kaiser: {
    arnaldo: [
      'Senhor Arnaldo, o senhor faz um show, mas a névoa não aplaude.',
      'Arnaldo, pede desculpa pro público por mim.'
    ],
    verissimo: [
      'Senhor Veríssimo, desculpa. Eu segui o plano... o meu.',
      'Relatório? Escreve que a névoa venceu, chefe.'
    ],
  },
  arthur: {
    arnaldo: [
      'Arnaldo, você me treinou bem demais. Agora aguenta.',
      'Foi mal, mestre. A aula de hoje foi minha.'
    ],
    verissimo: [
      'Senhor, de pé. Missão nenhuma termina com o chefe sentado.',
      'Senhor Veríssimo, eu aprendi. Só não do jeito que o senhor queria.'
    ],
  },
  joui: {
    arnaldo: [
      'Arnaldo-san, muito teatral. Eu só cortei o roteiro.',
      'Belo floreio, Arnaldo-san. O meu foi mais curto.'
    ],
    verissimo: [
      'Senhor Veríssimo, perdão. A sombra chegou antes da ordem.',
      'Disciplina, senhor? Eu chamo de velocidade.'
    ],
  },
  aghata: {
    arnaldo: [
      'Arnaldo, eu li o seu relógio antes de você abrir.',
      'Lindo espetáculo, Arnaldo. Pena que eu sei o final.'
    ],
    verissimo: [
      'Senhor Veríssimo, eu me meti, e deu certo.',
      'Viu? Às vezes desobedecer funciona.'
    ],
  },
  dante: {
    arnaldo: [
      'Arnaldo, eu devo tudo a você. Hoje paguei uma parte com uma surra.',
      'Desculpa, Arnaldo. O orfanato continua de pé, e o senhor também, mais ou menos.'
    ],
    verissimo: [
      'Senhor Veríssimo, o Lodo nunca foi bom em seguir ordens.',
      'O senhor é teimoso. Eu fui criado por freiras.'
    ],
  },
  erin: {
    arnaldo: [
      'Arnaldo, eu disse que queria abrir o relógio!',
      'Bum! Esse foi o efeito especial, seu Arnaldo.'
    ],
    verissimo: [
      'Almoxarifado? Tarde demais, chefe!',
      'Senhor Veríssimo, isso foi estratégia. Explosiva, mas estratégia.'
    ],
  },
  gal_sal: {
    arnaldo: [
      'A sua peça terminou, ator.',
      'Belo figurino, Arnaldo. Ainda assim, injusto.'
    ],
    verissimo: [
      'A Ordem caiu primeiro, Veríssimo.',
      'Ordens não seguram correntes.'
    ],
  },
  kian: {
    arnaldo: [
      'O relógio não te salvou, Arnaldo. Ele só marcou a hora.',
      'Eu sabia o fim desta cena antes de você subir ao palco.'
    ],
    verissimo: [
      'Você continua vivo, Veríssimo. Por enquanto.',
      'O seu segredo te protege. A sua espada, não.'
    ],
  },
  aguiar: {
    arnaldo: [
      'Ha ha... o ator caiu sem roteiro.',
      'Eu caço quem faz barulho, Arnaldo. E você faz muito.'
    ],
    verissimo: [
      'O chefe da Ordem no chão. Isso dá uma bela história.',
      'Ha ha... ordens não funcionam na floresta.'
    ],
  },
  labirinto: {
    arnaldo: [
      'O palco também era um labirinto, Arnaldo.',
      'Você procurou a plateia. Achou só paredes.'
    ],
    verissimo: [
      'Nenhum mapa da Ordem cobre esta saída.',
      'Até o líder se perde aqui dentro.'
    ],
  },
  xande: {
    arnaldo: [
      'Seu Arnaldo, o show foi bom, mas o meu bateu mais forte.',
      'Valeu pela aula, mestre. Hoje eu dei a minha.'
    ],
    verissimo: [
      'Senhor Veríssimo, com todo respeito: pancada também é estratégia.',
      'Por eles, chefe. Sempre por eles.'
    ],
  },
  lirio: {
    arnaldo: [
      'Seu Arnaldo, a Leonora não entende de teatro.',
      'Foi uma luta bonita, Arnaldo. A parede só não caiu.'
    ],
    verissimo: [
      'Senhor Veríssimo, eu protegi o senhor de si mesmo.',
      'Parede não anda, mas também não cai, chefe.'
    ],
  },
  ferreiro: {
    arnaldo: [
      'Ator de longe, guerreiro de perto. Santo Berço respeita os dois.',
      'A sua espada é comum, Arnaldo. A sua coragem, não.'
    ],
    verissimo: [
      'Líder de homens, descanse. Santo Berço segue de pé.',
      'A espada do seu amigo é boa. A mão ainda treme.'
    ],
  },
  juan: {
    arnaldo: [
      'O Diabo adorou a sua apresentação, Arnaldo.',
      'Mais um rosto famoso para o trono.'
    ],
    verissimo: [
      'Veríssimo, o Diabo não recebe ordens.',
      'A Ordem inteira não segura o que mora em mim.'
    ],
  },
  kemi: {
    arnaldo: [
      'Alvo famoso abatido. Sem autógrafo.',
      'Um tiro limpo, Arnaldo. Nada de bis.'
    ],
    verissimo: [
      'O líder caiu. O contrato continua.',
      'Mira perfeita, posição perfeita, senhor Veríssimo.'
    ],
  },
  balu: {
    arnaldo: [
      'Arnaldo, tu é bom ator. Mas machado não lê roteiro.',
      'Foi mal, seu Arnaldo! Depois eu pago o jantar.'
    ],
    verissimo: [
      'Viu, Veríssimo? Valeu me chamar de volta.',
      'Desculpa, chefe! Decisão precipitada, mas funcionou.'
    ],
  },
};
for (const [w, m] of Object.entries(VICTORY_NEW)) VICTORY_LINES[w] = { ...(VICTORY_LINES[w] || {}), ...m };


// JAE (Park Jae-Yoon): falas de vitória dela contra cada um e de cada um contra ela
const VICTORY_JAE = {
  jae: {
    kaiser: ['Shh, Kaiser. A névoa não esconde você de mim.', 'Tanta fumaça... e eu te achei pelo cheiro do medo.'],
    arthur: ['Um braço só e ainda tentou me alcançar. Que fofo.', 'Shh, Arthur. Dorme. Ninguém vem te buscar.'],
    joui: ['Você também some nas sombras? As minhas são mais escuras.', 'Katana bonita. Pena que eu cheguei antes dela.'],
    aghata: ['Todo esse conhecimento e você não viu o X debaixo do pé.', 'Lê mais uma página, Aghata. Eu espero... não, não espero.'],
    dante: ['Fim da peça? Eu nem comecei a me divertir.', 'Seu relógio parou, Dante. O meu nunca começou.'],
    erin: ['Barulho demais, Erin. Assassinato bom é em silêncio.', 'Suas bombas são lindas. O meu punhal é mais rápido.'],
    gal_sal: ['Justiça? Eu mato porque posso, Gal. Simples assim.', 'Corrente nenhuma segura quem já está nas suas costas.'],
    kian: ['Você previu tudo... menos onde eu ia estar.', 'O futuro tinha um X marcado. Era em você.'],
    aguiar: ['Desculpa, parceiro. Hoje a caçada era minha.', 'Fica com o machado, Aguiar. O troféu é meu.'],
    labirinto: ['Achei a saída do seu labirinto: passava por você.', 'Labirinto bonito. Eu prefiro casa trancada.'],
    xande: ['Seus amigos não chegaram a tempo, Xande. Ninguém chega.', 'Tanto barulho pra proteger os outros... e quem protegeu você?'],
    lirio: ['Grande e lenta, Lírio. Do jeito que eu gosto.', 'A Leonora pesa demais pra acompanhar uma sombra.'],
    ferreiro: ['Santo Berço vai ter que achar outro protetor.', 'O Luzidio apagou. Shh.'],
    juan: ['Fugindo de quem você era, Juan? Eu nunca fugi de quem eu sou.', 'O trono pode esperar. Eu não.'],
    kemi: ['Contrato cancelado, Kemi. Nada pessoal... ou talvez um pouco.', 'Você mira de longe. Eu prefiro sentir de perto.'],
    balu: ['Quanto mais alto, maior a queda, tio Balu.', 'Toda essa força e nenhum olho nas costas.'],
    arnaldo: ['Fim do espetáculo, Arnaldo. Sem aplausos.', 'A plateia era só eu. E eu gostei.'],
    verissimo: ['Olhos sempre abertos? Eu entrei pelas costas, velho.', 'A Ordem perdeu o líder pra uma garota com um punhal.'],
  },
  kaiser: { jae: ['Rápida. Mas a névoa vê quem se esconde nela.', 'Guarda esse punhal, Jae. Acabou o jogo.'] },
  arthur: { jae: ['Pelas costas de novo? Eu aprendi a olhar pra trás.', 'Sem jogo hoje, Jae. Só eu de pé.'] },
  joui: { jae: ['Você mata porque pode. Eu luto porque preciso.', 'As sombras também me conhecem, Jae.'] },
  aghata: { jae: ['Eu li cada passo seu antes de você dar.', 'Seu X no chão era previsível, Jae.'] },
  dante: { jae: ['Que personagem chata. Saiu de cena cedo.', 'Teatro de assassina? Já vi bem melhores.'] },
  erin: { jae: ['Boom! O silêncio também tem limite, hein?', 'Anotado: assassina rápida, não é à prova de explosão!'] },
  gal_sal: { jae: ['Pra quem mata porque pode, você caiu bem fácil.', 'Isso é justiça, Jae. Do meu jeito.'] },
  kian: { jae: ['Eu vi o seu fim antes do capuz cair.', 'O X nunca esteve no meu caminho.'] },
  aguiar: { jae: ['Ha ha... parceira, a caça é minha.', 'Volta pra Casa Juno, Jae. Ainda tem chave pra esconder.'] },
  labirinto: { jae: ['Até você se perde aqui dentro.', 'Seu jogo das chaves é brincadeira perto do meu.'] },
  xande: { jae: ['Meus amigos estão salvos. Você não vai tocar neles.', 'Acabou a brincadeira, Jae.'] },
  lirio: { jae: ['Rapidinha, hein? A Leonora é mais.', 'Pega leve com esse punhal, menina.'] },
  ferreiro: { jae: ['Santo Berço não abre a porta pra assassina.', 'O fogo do Luzidio enxerga no escuro.'] },
  juan: { jae: ['Eu já fui pior que você. Por isso eu sei como parar.', 'Matar porque pode não é liberdade, Jae.'] },
  kemi: { jae: ['Alvo abatido. Mesmo sendo colega.', 'Você chega perto demais, Jae. Eu nem precisei mirar.'] },
  balu: { jae: ['Hahaha! Pequena e rápida, mas o tio Balu é maior!', 'Ninguém foge do machado do tio Balu!'] },
  arnaldo: { jae: ['Que entrada! Mas a saída foi minha.', 'Bravo, Jae! Uma vilã de respeito.'] },
  verissimo: { jae: ['Olhos sempre abertos, Jae. Inclusive nas costas.', 'Mais uma assassina fora das ruas.'] },
};
for (const [w, m] of Object.entries(VICTORY_JAE)) VICTORY_LINES[w] = { ...(VICTORY_LINES[w] || {}), ...m };


// DALMO (o Colosso): falas de vitória dele contra cada um e de cada um contra ele
const VICTORY_DALMO = {
  dalmo: {
    kaiser: ['Névoa não segura soco, Kaiser.', 'Respira fundo. Ah, não dá, né? Fumaça demais.'],
    arthur: ['Um braço só contra mim? Coragem você tem, Cervero.', 'Fica no chão, motoqueiro. Ninguém vai te buscar.'],
    joui: ['Rápido, ligeiro... e no chão. Como todos.', 'Katana bonita. Pena que quebrou na minha mão.'],
    aghata: ['Todo esse estudo e nenhum livro ensina a apanhar.', 'Volta pros livros, menina. Arena não é lugar de ritual.'],
    dante: ['Faz um discurso agora. Eu espero.', 'Fecha a cortina, Dante. O show acabou no primeiro soco.'],
    erin: ['Bomba nenhuma derruba um prédio desse tamanho.', 'Barulho bonito. Agora fica quietinha aí.'],
    gal_sal: ['Corrente? Eu já arrebentei coisa mais grossa.', 'Justiça é pra quem tem tempo, Gal. Eu tenho conta pra pagar.'],
    kian: ['Previu isso aqui? Previu a minha mão?', 'Muito poder, pouca casca. Rachou.'],
    aguiar: ['Desculpa, parceiro. Na arena não tem parceiro.', 'Guarda o machado, Aguiar. Hoje a glória é minha.'],
    labirinto: ['Labirinto? Eu atravessei a parede.', 'Achei a saída. Era passando por cima de você.'],
    xande: ['Skate não foge de mim, moleque.', 'Teoria da conspiração nenhuma explica esse soco.'],
    lirio: ['Parede contra parede. A minha é mais grossa.', 'Marreta boa. Mão melhor ainda.'],
    ferreiro: ['Gigante de Santo Berço... tombou igual aos outros.', 'Espada bonita. Não corta o que não alcança.'],
    juan: ['Sangue não me assusta, Juan. Eu nado nele toda luta.', 'Vai rindo, vai. Ri no chão agora.'],
    kemi: ['Você hesitou da primeira vez, Kemi. Hesitou de novo.', 'Eu te trouxe pro grupo. Eu te tiro da arena.'],
    balu: ['Dois grandões, um só de pé. Adivinha qual.', 'Machado bonito, tio. Agora vai pro chão.'],
    arnaldo: ['Aplausos? Eu só escuto a plateia gritando o meu nome.', 'Teatro é bonito. Arena é de verdade.'],
    verissimo: ['A Ordem inteira ia precisar de muito mais.', 'Relatório pronto, velho: perdeu pro motorista.'],
    jae: ['Pequena, rápida... e embaixo do meu pé.', 'Esconde-esconde acabou, Jae. Te achei.'],
  },
  kaiser: { dalmo: ['Grande demais pra desviar da névoa.', 'Até um colosso precisa respirar, Dalmo.'] },
  arthur: { dalmo: ['Um tiro no lugar certo derruba qualquer tamanho.', 'Não importa o tamanho, Dalmo. Importa a mira.'] },
  joui: { dalmo: ['Força bruta não alcança sombra.', 'Você bate forte. Eu só não estava lá.'] },
  aghata: { dalmo: ['Eu sabia exatamente onde você ia pisar.', 'Previsível como uma rota de ônibus, Dalmo.'] },
  dante: { dalmo: ['Que personagem pesado. Saiu de cena com estrondo.', 'O tempo derruba até colosso.'] },
  erin: { dalmo: ['Boom! Prédio grande, implosão maior!', 'Calculei a carga certinho pro seu tamanho!'] },
  gal_sal: { dalmo: ['Grande, forte e preso na minha corrente.', 'Tamanho não é justiça, Dalmo.'] },
  kian: { dalmo: ['Eu vi o colosso cair antes de você levantar o punho.', 'Força sem visão. Que desperdício.'] },
  aguiar: { dalmo: ['Ha ha... o grandão caiu. A caça fica comigo.', 'Volta pro ônibus, Dalmo. A estrada é minha.'] },
  labirinto: { dalmo: ['Grande demais pra caber nos meus corredores.', 'Você se perdeu, Dalmo. Todos se perdem.'] },
  xande: { dalmo: ['Grande e lento! Valeu, skate!', 'Por eles, Dalmo. Você não ia passar.'] },
  lirio: { dalmo: ['A parede aguentou. A Leonora agradece.', 'Grandão, mas eu sou mais teimoso.'] },
  ferreiro: { dalmo: ['Santo Berço já viu gigantes maiores.', 'A Espada Consumidora não liga pro tamanho.'] },
  juan: { dalmo: ['Seu sangue tem gosto de arena, Dalmo.', 'Ha! O colosso sangra igual a todo mundo.'] },
  kemi: { dalmo: ['Contrato antigo, Dalmo. Hoje eu terminei.', 'Você me poupou uma vez. Eu não poupei.'] },
  balu: { dalmo: ['Hahaha! Pode ser grande, mas o tio Balu é maior!', 'Que pancada! Bora comer alguma coisa depois?'] },
  arnaldo: { dalmo: ['Que entrada! O público adorou a queda.', 'Bravo, Colosso! Mas o último ato era meu.'] },
  verissimo: { dalmo: ['Olhos sempre abertos, Dalmo. Até pros gigantes.', 'A Ordem tem um lugar pra você. Uma cela.'] },
  jae: { dalmo: ['Shh, grandão. Dorme.', 'Quanto maior, mais barulho cai. Shh.'] },
};
for (const [w, m] of Object.entries(VICTORY_DALMO)) VICTORY_LINES[w] = { ...(VICTORY_LINES[w] || {}), ...m };


// GUIZO (Os Cinco): falas de vitória dele contra cada um e de cada um contra ele
const VICTORY_GUIZO = {
  guizo: {
    kaiser: ['Névoa paranormal ao vivo! Kaiser, você é conteúdo puro.', 'Desculpa a fumaça no vídeo, galera. Era a Kaiser.'],
    arthur: ['Um braço de sangue! Arthur, posso filmar mais de perto?', 'Gravado! Ninguém vai acreditar que eu derrubei o Cervero.'],
    joui: ['Você é rápido, mas a câmera é mais. Pausei no frame certo.', 'Fica parado aí, Joui. Preciso de um close.'],
    aghata: ['Um grimório de verdade! Posso só ler uma página?', 'Ritual contra ritual. Hoje o meu deu certo, Aghata!'],
    dante: ['Meu Deus, as espirais! Você também mexe com tempo, Dante?', 'Bravo pro vídeo! Agora fica quietinho aí.'],
    erin: ['Isso explodiu demais! Eu tô tremendo, mas gravei!', 'Erin, eu tinha certeza que a gente ia voar junto.'],
    gal_sal: ['Corrente com vida própria? Isso vai pro site hoje.', 'Gal, foi mal. A câmera tava rodando, eu tinha que ganhar.'],
    kian: ['Você me viu ganhar antes? Então por que não desviou?', 'Eu Já Sabia, Kian. É uma habilidade, sabia?'],
    aguiar: ['Machado de corda! Mano, que medo... mas que vídeo!', 'Desculpa, delegado. Isso aqui vai virar documentário.'],
    labirinto: ['O ??? em pessoa! Eu sempre quis filmar um mascarado desses!', 'Achei a saída, Labirinto. Tava na minha câmera.'],
    xande: ['Desculpa, Xande! Depois a gente faz o cumprimento, tá?', 'Ganhei do meu melhor amigo. Isso é estranho... mas tá gravado!'],
    lirio: ['Ganhei de você, Lírio! Agora deixa eu filmar a Leonora.', 'Lírio, cadê aquela confiança toda? Tô gravando, fala pra câmera!'],
    ferreiro: ['Um Luzidio! Orelha pontuda e tudo! Que dia!', 'Desculpa, Ferreiro. Eu filmo e vou embora, juro.'],
    dalmo: ['Pode vir... ele disse. E eu fui! E ganhei!', 'Mano, ele é ENORME. A galera não vai acreditar no tamanho.'],
    jae: ['Shh, eu sei. Mas não dá pra ficar quieto, eu ganhei!', 'Te achei no escuro, Jae. A câmera tem visão noturna.'],
    kemi: ['Desviei de uma sniper! Isso nunca aconteceu antes!', 'Kemi, você treme menos que eu. Mas eu ganhei.'],
    juan: ['Muito sangue, mano... mas eu tô vivo!', 'Juan, ri pra câmera. Agora é a sua vez de aparecer.'],
    balu: ['Derrubei o Balu! Agora alguém me ajuda a levantar ele?', 'Desculpa, tio Balu. Te devo um macarrão.'],
    arnaldo: ['Bravo, Arnaldo! Mas o público aqui é a minha câmera.', 'Teatro paranormal ao vivo. Que espetáculo!'],
    verissimo: ['O chefe da Ordem! Sr. Veríssimo, uma entrevista?', 'Olhos sempre abertos? Os meus também. Pela lente.'],
  },
  kaiser: { guizo: ['Desliga essa câmera, garoto. A névoa não gosta de plateia.', 'Isso não vai pro seu site, Guizo.'] },
  arthur: { guizo: ['Para de filmar e aprende a esquivar.', 'Um tiro. Nem precisou de mira, Guizo.'] },
  joui: { guizo: ['Você grava o que vê. Eu não estava onde você via.', 'Muito barulho para um ocultista.'] },
  aghata: { guizo: ['Ritual bonito. Mal executado.', 'Lê de novo, Guizo. Desta vez com atenção.'] },
  dante: { guizo: ['Que cena curiosa. O câmera virou a matéria.', 'Decadência por decadência, a minha é mais antiga.'] },
  erin: { guizo: ['Boom! Você filmou essa? Fala que você filmou essa!', 'Calma, eu fico com a sua câmera um pouquinho!'] },
  gal_sal: { guizo: ['A corrente não aparece no vídeo. Só a queda.', 'Justiça não precisa de plateia, Guizo.'] },
  kian: { guizo: ['Eu sabia antes de você sacar a faca.', 'Previsto. E nem foi difícil.'] },
  aguiar: { guizo: ['Ha ha... grava isso: a caça acabou.', 'Pequeno, rápido e assustado. A presa perfeita.'] },
  labirinto: { guizo: ['Sua câmera não grava os meus corredores.', 'Você se perdeu, Guizo. Todos se perdem.'] },
  xande: { guizo: ['Foi mal, Gui! Depois a gente faz o cumprimento.', 'Mano, você piscou no meio do ritual!'] },
  lirio: { guizo: ['Esquisito da Internet no chão! Que dia lindo!', 'Chiquinho, a Leonora mandou um beijo!'] },
  ferreiro: { guizo: ['Eu não posso permitir que você filme a minha cidade.', 'Santo Berço não aparece em vídeo, garoto.'] },
  dalmo: { guizo: ['Pode filmar agora, rapaz. A queda foi bonita.', 'Eu sou grande, mas não sou dois. Você, nem um.'] },
  jae: { guizo: ['Shh... desliga a câmera. Pronto.', 'Gravou? Não gravou. Shh.'] },
  kemi: { guizo: ['Eu enxerguei você antes da sua lente.', 'Um tiro. A câmera nem focou.'] },
  juan: { guizo: ['Ha! Que vídeo bonito vai dar. Vermelho do começo ao fim.', 'Grava isso aqui, ó: você caindo.'] },
  balu: { guizo: ['Hahaha! Desculpa, menino! Bora comer um macarrão?', 'Ê, rapaz! Bom de faca, ruim de queda.'] },
  arnaldo: { guizo: ['Que entrada! Mas o protagonista sou eu.', 'Corta! Repete a cena, garoto.'] },
  verissimo: { guizo: ['Ocultismo de iniciante. A Ordem tem um curso pra isso.', 'Olhos sempre abertos, Guizo. Até para câmeras.'] },
};
for (const [w, m] of Object.entries(VICTORY_GUIZO)) VICTORY_LINES[w] = { ...(VICTORY_LINES[w] || {}), ...m };

// O DIABO (Portadores das Relíquias): falas de vitória dele contra cada um e de cada um contra ele
const VICTORY_DIABO = {
  o_diabo: {
    kaiser: ['A névoa esconde tudo. Menos o que você deseja, Kaiser.', 'Cinzas e flores. Eu prefiro sangue.'],
    arthur: ['Um braço de sangue, Cervero? Eu tenho quatro.', 'Você paga rituais com a própria vida. Que cliente fiel.'],
    joui: ['Rápido. Mas ninguém é mais rápido que um desejo.', 'A katana corta. O pacto amarra.'],
    aghata: ['Sangue de vampira tem gosto de promessa, Aghata.', 'Você leu sobre mim. Ler não protege ninguém.'],
    dante: ['A Morte é paciente. Eu não preciso ser.', 'Lodo e espirais... e mesmo assim você sangra.'],
    erin: ['Explosões, que barulho. O sangue é mais silencioso.', 'Caos é divertido. Até ele assinar comigo.'],
    gal_sal: ['Justiça? Eu só faço negócios, Gal.', 'Correntes eu tenho dentro das veias.'],
    kian: ['Você previu isso? Então aceitou o pacto.', 'Conhecimento não é proteção, Kian. É preço.'],
    aguiar: ['A caçada acabou. O caçador virou cliente.', 'Machado bonito. Meu sangue é mais afiado.'],
    labirinto: ['Labirintos têm saída. Pactos, não.', 'Todo corredor leva até mim.'],
    xande: ['Gladiador? Eu já tive arenas inteiras de joelhos.', 'Lealdade é uma moeda ótima, Xande.'],
    lirio: ['A parede caiu, Lírio. A Leonora também.', 'Força bruta. Eu prefiro força de vontade quebrada.'],
    ferreiro: ['Outro Portador. A Morte devia escolher melhor.', 'Santo Berço fica longe daqui, Ferreiro.'],
    dalmo: ['Pela Manu, você disse. Eu ouvi. Eu sempre ouço.', 'Grande, forte... e com um desejo tão simples.'],
    jae: ['Shh. Eu também sei fazer silêncio.', 'Seu X não esconde o que você quer, Jae.'],
    kemi: ['Contratos são minha especialidade, Kemi.', 'Uma bala só. Meu pacto dura para sempre.'],
    juan: ['Você voltou para o trono, Juan. Todos voltam.', 'Um novo começo? Eu te dei. Agora cobro.'],
    balu: ['Que fome, Balu. Eu também tenho.', 'O tio Balu aguenta tudo. Menos um bom acordo.'],
    arnaldo: ['Bravo, Arnaldo. Mas o meu espetáculo tem plateia eterna.', 'Relíquia contra Relíquia. O sangue sempre ganha a cena.'],
    verissimo: ['Olhos abertos, Veríssimo. Eu gosto de ser visto.', 'Escreve no relatório: ele aceitou.'],
    guizo: ['Grava isso, garoto: o pacto ao vivo.', 'Uma faca e uma câmera. Que oferta modesta.'],
  },
  kaiser: { o_diabo: ['Nenhum pacto passa pela névoa.', 'Fica com as suas ofertas. Eu fico com a minha vida.'] },
  arthur: { o_diabo: ['Já paguei com sangue demais. Você não leva mais nada.', 'O Diabo também sangra. Bom saber.'] },
  joui: { o_diabo: ['Eu não tenho nada para negociar.', 'Recusado. Com a katana.'] },
  aghata: { o_diabo: ['Eu li o seu contrato inteiro. Tinha letra miúda.', 'Sangue contra Sangue. O meu é mais teimoso.'] },
  dante: { o_diabo: ['A Morte manda lembranças, Diabo.', 'Que peça curta. O Diabo saiu antes do fim.'] },
  erin: { o_diabo: ['Boom! Pacto cancelado!', 'Diabo, você explodiu lindo.'] },
  gal_sal: { o_diabo: ['Sentença dada. Nenhum pacto a anula.', 'Justiça não aceita propina.'] },
  kian: { o_diabo: ['Eu sabia que você ia oferecer. E sabia a resposta.', 'Previsto. Recusado.'] },
  aguiar: { o_diabo: ['Ha ha... até o Diabo vira presa.', 'Peguei um chifrudo. Que troféu.'] },
  labirinto: { o_diabo: ['Você se perdeu nos corredores, Diabo.', 'Nem o Diabo acha a saída.'] },
  xande: { o_diabo: ['Por eles. Nenhum pacto vale mais.', 'Gladiador um, Diabo zero!'] },
  lirio: { o_diabo: ['Leonora, tu viu? A gente bateu no Diabo!', 'Que asa estranha. Caiu igual a todo mundo.'] },
  ferreiro: { o_diabo: ['Uma Relíquia a menos para o Santo Berço temer.', 'A Morte pesa mais que o Sangue.'] },
  dalmo: { o_diabo: ['Aí sim, neném! Derrubei o Diabo!', 'Grande você. Maior eu.'] },
  jae: { o_diabo: ['Shh. Até o Diabo cala.', 'Seu pacto não tem a minha assinatura.'] },
  kemi: { o_diabo: ['Contrato fechado. Alvo: o Diabo.', 'Uma bala. Nenhum acordo.'] },
  juan: { o_diabo: ['Eu não preciso mais de você.', 'O começo agora é meu, Diabo.'] },
  balu: { o_diabo: ['Hahaha! Diabo nenhum segura o tio Balu!', 'Deu ruim pro capeta, hein!'] },
  arnaldo: { o_diabo: ['E o Diabo sai de cena! Aplausos!', 'Relíquia por Relíquia, a minha é mais divertida.'] },
  verissimo: { o_diabo: ['Entidade de Sangue neutralizada. Relatório amanhã.', 'Olhos abertos. Pacto recusado.'] },
  guizo: { o_diabo: ['EU DERRUBEI O DIABO! Isso tá gravado!', 'Mano... era o Diabo. E eu ganhei!'] },
};
for (const [w, m] of Object.entries(VICTORY_DIABO)) VICTORY_LINES[w] = { ...(VICTORY_LINES[w] || {}), ...m };

// A MAGISTRADA (Portadores das Relíquias): falas de vitória dela contra cada um e de cada um contra ela
const VICTORY_MAGISTRADA = {
  magistrada: {
    kaiser: ['A névoa esconde de você. Não de mim.', 'Eu sabia onde você estaria, Kaiser. Sempre soube.'],
    arthur: ['O sangue cobra, Cervero. O Equilíbrio também.', 'Um braço, uma escolha. As duas eu já conhecia.'],
    joui: ['As sombras eram minhas antes de serem suas.', 'Você nunca esteve fora da vista da Máscara, Joui.'],
    aghata: ['Seu grimório tem as perguntas. Eu tenho as respostas.', 'Ler não é saber, menina.'],
    dante: ['A Morte é previsível. O tempo também.', 'Eu lembro de como essa peça acaba, Dante.'],
    erin: ['O Caos é a única coisa que eu não leio. Você não é o Caos.', 'Barulho não muda o que já foi escrito.'],
    gal_sal: ['Justiça e Equilíbrio não são a mesma coisa, Gal.', 'Suas correntes eram previsíveis.'],
    kian: ['Desta vez, a contenção se manteve.', 'Você previu. Eu sabia. Saber vence.'],
    aguiar: ['A presa sempre soube do caçador, Aguiar.', 'O seu desejo é barulhento demais.'],
    labirinto: ['Eu conheço todos os corredores. Desde o começo.', 'Não há labirinto para quem lembra do caminho.'],
    xande: ['Coragem é bonita. Também é previsível.', 'Os Cinco ainda têm muito a perder.'],
    lirio: ['A parede caiu, como eu lembrava.', 'Força sem saber é só peso.'],
    ferreiro: ['A Morte devia escolher melhor os seus receptáculos.', 'Santo Berço continua em pé. Por enquanto.'],
    dalmo: ['Pela Manu. Eu sei. Eu sempre soube.', 'O tamanho não pesa na balança.'],
    jae: ['Shh. Eu também ouço o silêncio.', 'Você se esconde nas sombras. Elas me obedecem.'],
    kemi: ['Eu sei de onde vem cada bala, Kemi.', 'Um contrato é só uma promessa. Eu sou a Arauta delas.'],
    juan: ['O Equilíbrio não se negocia, Juan.', 'Seu novo começo eu já tinha visto.'],
    balu: ['Calma, senhor Balu. Era só o Equilíbrio.', 'A sua força é real. O meu saber também.'],
    arnaldo: ['O espetáculo acabou, Arnaldo. Como eu disse que acabaria.', 'Senhorita Dicionário venceu, viu?'],
    verissimo: ['Olhos abertos não bastam, Veríssimo.', 'A Ordem esquece. A Máscara lembra.'],
    guizo: ['Pode gravar. Eu apago depois.', 'Ninguém vai lembrar desse vídeo, Guizo.'],
    o_diabo: ['Pactos também têm regras. Eu sou a Executora delas.', 'O Sangue se curva ao Conhecimento.'],
  },
  kaiser: { magistrada: ['Nem a Máscara viu a névoa chegar.', 'Saber tudo e mesmo assim cair.'] },
  arthur: { magistrada: ['A senhora sabia o final? Então devia ter desviado.', 'Equilíbrio restaurado. Do meu jeito.'] },
  joui: { magistrada: ['Eu aprendi com as sombras de vocês.', 'Agora estamos quites, Magistrada.'] },
  aghata: { magistrada: ['Uma página que você não leu.', 'Eu encontrei a resposta antes de você.'] },
  dante: { magistrada: ['Nem quem lembra de tudo escapa do relógio.', 'Que peça. A Máscara caiu no fim.'] },
  erin: { magistrada: ['Caos, Magistrada! Isso você não leu, né?', 'Boom! Equilíbrio desequilibrado!'] },
  gal_sal: { magistrada: ['Sentença dada. Até para quem sabe tudo.', 'Justiça também alcança as Máscaras.'] },
  kian: { magistrada: ['De novo, Magistrada. Como da outra vez.', 'Eu sabia que você ia tentar me conter.'] },
  aguiar: { magistrada: ['Ha ha... a Máscara mais bonita da minha coleção.', 'Até quem sabe tudo vira presa.'] },
  labirinto: { magistrada: ['Você lembrava do caminho. Eu sou o caminho.', 'Perdida entre os meus corredores.'] },
  xande: { magistrada: ['Por eles! Nem a Relíquia passa por cima disso.', 'Saber não é tudo, moça.'] },
  lirio: { magistrada: ['A parede ficou de pé, Magistrada!', 'Leonora não lê o futuro. Ela só bate.'] },
  ferreiro: { magistrada: ['A Morte pesa mais que o saber.', 'Santo Berço não precisa de Máscaras.'] },
  dalmo: { magistrada: ['Aí sim! Derrubei quem sabe tudo!', 'Grande você não é. Eu sou.'] },
  jae: { magistrada: ['Shh. Nem a Máscara ouviu eu chegar.', 'As sombras gostam mais de mim.'] },
  kemi: { magistrada: ['Um tiro. Ela sabia, e não adiantou.', 'Contrato fechado. Máscara no chão.'] },
  juan: { magistrada: ['Ha! O Equilíbrio sangra, viu?', 'Nem o Conhecimento segura um novo começo.'] },
  balu: { magistrada: ['Desculpa, senhora! Mas a briga era justa!', 'Ê! Nem a Máscara aguenta o tio Balu!'] },
  arnaldo: { magistrada: ['Senhorita Dicionário, fim de ato!', 'Uma reviravolta que nem a senhora previu!'] },
  verissimo: { magistrada: ['Relíquia de Conhecimento contida. Relatório amanhã.', 'Olhos abertos, Magistrada. Inclusive os seus.'] },
  guizo: { magistrada: ['EU DERRUBEI A MAGISTRADA! E tá gravado!', 'Mano... a Seita das Máscaras inteira vai me caçar.'] },
  o_diabo: { magistrada: ['Regras são feitas para pactos, Magistrada.', 'O Conhecimento também tem um preço.'] },
};
for (const [w, m] of Object.entries(VICTORY_MAGISTRADA)) VICTORY_LINES[w] = { ...(VICTORY_LINES[w] || {}), ...m };

// O ESTRANGEIRO (Portadores das Relíquias): falas de vitória dele contra cada um e de cada um contra ele
const VICTORY_ESTRANGEIRO = {
  estrangeiro: {
    kaiser: ['A névoa não esconde nada de quem está fora dela.', 'Você vai esquecer esta luta, Kaiser. Já está esquecendo.'],
    arthur: ['Sangue. Tão primitivo.', 'Um braço a menos, uma memória a menos.'],
    joui: ['Rápido. Para a sua espécie.', 'Suas sombras não alcançam o meu sinal.'],
    aghata: ['Seu grimório não tem o meu nome. Ninguém tem.', 'Rituais. Brinquedos de uma civilização inferior.'],
    dante: ['O tempo de vocês é curto. O meu, não.', 'Decadência. Interessante. Irrelevante.'],
    erin: ['Barulho. Apenas barulho.', 'Você explode. Eu observo.'],
    gal_sal: ['Justiça é um conceito local.', 'Suas correntes prendem corpos. Eu prendo mentes.'],
    kian: ['Você também é estrangeiro aqui, Kian.', 'Conhecimento antigo. Ainda assim, pequeno.'],
    aguiar: ['O caçador vira espécime.', 'Sua máscara não esconde o seu medo de mim.'],
    labirinto: ['Corredores. Eu atravesso paredes de memória.', 'Você se perdeu antes de começar.'],
    xande: ['Os Cinco. Quatro, agora. Logo, nenhum.', 'Lealdade. Fácil de apagar.'],
    lirio: ['A parede caiu. As paredes sempre caem.', 'A Leonora não vai lembrar de você.'],
    ferreiro: ['A Morte também é um sinal. Mais fraco que o meu.', 'Santo Berço fica fora do alcance? Não.'],
    dalmo: ['Grande. Para a sua espécie.', 'Pela Manu. Eu vou lembrar disso por você.'],
    jae: ['Silêncio. Eu gosto de silêncio.', 'Você se esconde. Eu esqueço que você existiu.'],
    kemi: ['Uma bala contra um sinal. Inútil.', 'Eu sei onde você estava antes de mirar.'],
    juan: ['Desejo. Que coisa barulhenta.', 'Seu novo começo terminou.'],
    balu: ['Força física. Tão limitada.', 'Durma, criatura grande.'],
    arnaldo: ['Fim do espetáculo. Ninguém vai lembrar dele.', 'O Caos me diverte. Você, não.'],
    verissimo: ['Escreva no relatório. Depois esqueça.', 'Olhos abertos. Mente aberta. Exposta.'],
    guizo: ['Pode gravar. O vídeo vai estar vazio.', 'O seu site nunca vai saber de mim.'],
    o_diabo: ['Pactos. Contratos de uma espécie que precisa de regras.', 'O Sangue ferve. Depois esfria.'],
    magistrada: ['A Máscara lembra de tudo. Menos de mim.', 'Equilíbrio é um conceito local, Magistrada.'],
  },
  kaiser: { estrangeiro: ['A névoa lembra de você, mesmo que ninguém mais lembre.', 'Não sei o que você é. Mas caiu.'] },
  arthur: { estrangeiro: ['Alto, magro e no chão. Pronto.', 'Seja lá de onde veio, volta pra lá.'] },
  joui: { estrangeiro: ['Até as criaturas de outro mundo sangram.', 'Eu não esqueci. Ainda.'] },
  aghata: { estrangeiro: ['Agora o meu grimório tem o seu nome.', 'Criatura anotada. Página nova.'] },
  dante: { estrangeiro: ['Até o estrangeiro termina a peça no chão.', 'Que figura. Pena que caiu.'] },
  erin: { estrangeiro: ['Boom! E aí, alienígena, lembra dessa?', 'Explodi um ET! Anota aí!'] },
  gal_sal: { estrangeiro: ['Sentença dada. Até para quem vem de fora.', 'Justiça também alcança as estrelas.'] },
  kian: { estrangeiro: ['Eu previ a sua queda. Desde antes de você chegar.', 'Estrangeiro aqui sou eu também. E fiquei.'] },
  aguiar: { estrangeiro: ['Ha ha... um troféu de outro mundo!', 'A presa mais alta que eu já peguei.'] },
  labirinto: { estrangeiro: ['Nem um sinal acha a saída do meu labirinto.', 'Perdido. Como todos.'] },
  xande: { estrangeiro: ['Desta vez a gente lembra! OS CINCO!', 'Por eles. Sempre por eles.'] },
  lirio: { estrangeiro: ['A parede ficou de pé, bicho alto!', 'Leonora mandou lembranças. E ela lembra de tudo.'] },
  ferreiro: { estrangeiro: ['A Morte pesa mais que qualquer sinal.', 'Santo Berço não aceita visitas.'] },
  dalmo: { estrangeiro: ['Aí sim, neném! Derrubei o grandão de outro planeta!', 'Grande você. Maior eu.'] },
  jae: { estrangeiro: ['Shh. Nem você me ouviu chegar.', 'Esqueceu de mim? Eu não esqueci de você.'] },
  kemi: { estrangeiro: ['Alvo alto, mira fácil.', 'Contrato fechado. Origem: desconhecida.'] },
  juan: { estrangeiro: ['Ha! Até ET sangra vermelho!', 'Um novo começo pra mim. Um fim pra você.'] },
  balu: { estrangeiro: ['Hahaha! Que bicho estranho! Bora comer um macarrão?', 'Ê, rapaz! Caiu igualzinho!'] },
  arnaldo: { estrangeiro: ['Que figurino! Mas o protagonista sou eu.', 'Uma visita de outro mundo, e a plateia aplaude!'] },
  verissimo: { estrangeiro: ['Entidade de Transmissão neutralizada. Relatório amanhã.', 'Olhos abertos. Inclusive para o que ninguém lembra.'] },
  guizo: { estrangeiro: ['EU DERRUBEI O ESTRANGEIRO! E TÁ GRAVADO!', 'Ninguém vai acreditar... mas eu tenho o vídeo!'] },
  o_diabo: { estrangeiro: ['Até o que vem de fora quer alguma coisa.', 'Que desejo estranho você tem. Mas tem.'] },
  magistrada: { estrangeiro: ['A Máscara lembra de você, Estrangeiro.', 'O Equilíbrio também vale para quem vem de fora.'] },
};
for (const [w, m] of Object.entries(VICTORY_ESTRANGEIRO)) VICTORY_LINES[w] = { ...(VICTORY_LINES[w] || {}), ...m };

// O AMIGO IMAGINÁRIO (Portadores das Relíquias): falas de vitória dele (sussurros) e de cada um contra ele
const VICTORY_AMIGO = {
  amigo: {
    kaiser: ['...a névoa ficou marrom...', '(o sino toca baixinho) ...mais um quadro...'],
    arthur: ['...sangue e tinta... a mesma cor no escuro...', '...um braço... no quadro, tem dois...'],
    joui: ['...rápido... mas a tinta é mais...', '...o rosto dele derreteu bonito...'],
    aghata: ['...o colar ficou sujo de tinta...', '...ela leu o quadro... e o quadro leu ela...'],
    dante: ['...a Morte também escorre...', '...o lodo e a tinta... amigos...'],
    erin: ['...barulho... o sino é mais alto...', '...explodiu... e escorreu...'],
    gal_sal: ['...as correntes enferrujam na tinta...', '...justiça... derretida...'],
    kian: ['...ele sabia... e veio mesmo assim...', '...escrita... e pintura...'],
    aguiar: ['...o caçador virou a caça do quadro...', '...a máscara também derrete...'],
    labirinto: ['...o labirinto tem saída... o quadro não...', '...corredores de tinta...'],
    xande: ['...o skate parou...', '...ele quis proteger todo mundo... todo mundo vai morrer...'],
    lirio: ['...a parede também escorre...', '...a marreta afundou na tinta...'],
    ferreiro: ['...a Morte... e o Sangue... juntos em mim...', '...Santo Berço vai ter um quadro novo...'],
    dalmo: ['...grande... e derretendo...', '...a plateia ficou quieta...'],
    jae: ['...shh... o sino não faz shh...', '...ela se escondeu... a tinta achou...'],
    kemi: ['...uma bala... não mata um quadro...', '...a mira embaçou de tinta...'],
    juan: ['...ele gosta de sangue... eu tenho...', '...um novo começo... pintado...'],
    balu: ['...grande... e quieto agora...', '...ele riu... depois não riu mais...'],
    arnaldo: ['...o espetáculo... virou quadro...', '...aplausos... e o sino...'],
    verissimo: ['...relatório... manchado de tinta...', '...olhos abertos... derretidos...'],
    guizo: ['...a câmera gravou o sino...', '...o vídeo ficou marrom...'],
    o_diabo: ['...pacto... com tinta não se assina...', '...o vermelho dele... e o meu...'],
    magistrada: ['...ela sabia tudo... menos o quadro...', '...a máscara escorre...'],
    estrangeiro: ['...o sinal... e o sino...', '...outro Sino... outro irmão...'],
  },
  kaiser: { amigo: ['Nada de quadro pra mim hoje.', 'A névoa leva até a tinta embora.'] },
  arthur: { amigo: ['Acabou. E eu não vou virar pintura.', 'Pinta isso: você no chão.'] },
  joui: { amigo: ['Rápido demais pra virar quadro.', 'O sino parou.'] },
  aghata: { amigo: ['Registrado: criatura de Tinta. Página nova.', 'O grimório tem o seu nome agora.'] },
  dante: { amigo: ['A peça terminou e o quadro ficou em branco.', 'Que coisa feia. Mas caiu.'] },
  erin: { amigo: ['Boom! Tinta pra todo lado!', 'Explodi uma pintura! Anota!'] },
  gal_sal: { amigo: ['Sentença dada. Até para quadros.', 'Justiça também alcança o que não tem rosto.'] },
  kian: { amigo: ['Eu previ que você ia escorrer.', 'Sem rosto, sem futuro.'] },
  aguiar: { amigo: ['Ha ha... um troféu que pinga.', 'Peguei a obra de arte.'] },
  labirinto: { amigo: ['Nem a tinta acha a saída.', 'Perdido nos meus corredores.'] },
  xande: { amigo: ['O sino parou! Ninguém morreu!', 'Por eles. Sempre por eles.'] },
  lirio: { amigo: ['A parede ficou de pé, bicho!', 'Leonora não tem medo de quadro.'] },
  ferreiro: { amigo: ['A Morte pesa mais que a tinta.', 'Santo Berço não guarda quadros.'] },
  dalmo: { amigo: ['Aí sim, neném! Derrubei a pintura!', 'Grande você. Maior eu.'] },
  jae: { amigo: ['Shh. O sino parou.', 'Até um quadro cala.'] },
  kemi: { amigo: ['Um tiro no buraco do rosto.', 'Contrato fechado. Obra destruída.'] },
  juan: { amigo: ['Ha! Seu sangue é tinta!', 'Que obra horrível. Adorei.'] },
  balu: { amigo: ['Hahaha! Que bicho estranho! Pintou o chão todo!', 'Ê, rapaz! Derreteu foi você!'] },
  arnaldo: { amigo: ['Que cenário! Mas o protagonista sou eu.', 'Cortina! E leva esse quadro daqui.'] },
  verissimo: { amigo: ['Criatura de Tinta neutralizada. Relatório amanhã.', 'Olhos abertos. Até para o que não tem olhos.'] },
  guizo: { amigo: ['EU DERRUBEI O AMIGO IMAGINÁRIO! TÁ GRAVADO!', 'Ninguém vai acreditar nesse vídeo!'] },
  o_diabo: { amigo: ['Sangue de verdade vence sangue pintado.', 'Uma obra bonita. Sem pacto.'] },
  magistrada: { amigo: ['O Equilíbrio também vale para quadros.', 'A Máscara lembra de você. Ninguém mais.'] },
  estrangeiro: { amigo: ['Interessante. Outro Sino. Igualmente frágil.', 'Ninguém vai lembrar desta pintura.'] },
};
for (const [w, m] of Object.entries(VICTORY_AMIGO)) VICTORY_LINES[w] = { ...(VICTORY_LINES[w] || {}), ...m };

// CRISTINO (Transtornados, Hexatombe): falas de vitória dele contra cada um e de cada um contra ele
const VICTORY_CRISTINO = {
  cristino: {
    kaiser: ['Fumaça não esconde de quem caça à noite.', 'Respira devagar, rapaz. Assim dura mais.'],
    arthur: ['Boa mira. A minha é mais velha.', 'Não é pessoal, Cervero. Você tava no caminho.'],
    joui: ['Espada rápida. Chumbo é mais.', 'Não corre no escuro. Eu enxergo com um olho só e te vi.'],
    aghata: ['Livro nenhum ensina a caçar.', 'Muita reza pra pouca pólvora.'],
    dante: ['Fala bonito. Cai igual.', 'Acabou o teatro. Sai da frente.'],
    erin: ['Gosta de fogo? Eu também. Faz tempo.', 'Explosão é coisa séria, menina. Eu montei a minha antes.'],
    gal_sal: ['Correntes não seguram quem andou a pé até aqui.', 'Não quero justiça. Quero o que é meu.'],
    kian: ['Viu o futuro? Não viu o lampião.', 'Presságio nenhum desvia de um tiro de perto.'],
    aguiar: ['Faz menos barulho no chão, delegado.', 'Eu disse pra não se meter no meu caminho.'],
    labirinto: ['O caminho era reto. Você que se perdeu.', 'A minha parte do acordo acabou na caçada.'],
    xande: ['Moleque barulhento. Agora fica quieto.', 'Teoria nenhuma te salvou do chumbo.'],
    lirio: ['Parede grossa. Pólvora mais.', 'Grande e lento. Igual ao Quibungo.'],
    ferreiro: ['Já cacei bicho maior que você no mato.', 'Espada que consome não consome chumbo.'],
    juan: ['Hoje a Lua de Sangue fica comigo.', 'Não é pessoal, Henri. Era a promessa do meu irmão.'],
    kemi: ['Silenciosa. Gosto disso. Fica assim.', 'Contrato é contrato. O meu era outro.'],
    balu: ['Machado pesado demais, tio. Chumbo pesa menos.', 'Grande e risonho. Agora só grande.'],
    arnaldo: ['Fecha a cortina, velho. Sem aplauso.', 'Teatro não assusta quem dorme no mato.'],
    verissimo: ['A Ordem não me achou antes. Não acha agora.', 'Relatório? Escreve aí: o cangaceiro passou.'],
    jae: ['Shh... eu sei fazer silêncio também.', 'Você ainda tem a minha palavra. Mas não hoje.'],
    dalmo: ['Grandão. Caiu igual a qualquer bicho.', 'Arena é bonito. O mato é pior.'],
    guizo: ['Desliga essa câmera, rapaz.', 'Filma isso: o cangaceiro foi embora.'],
    o_diabo: ['Pacto nenhum. Eu cumpro as minhas promessas sozinho.', 'Já toquei a Coroa. Você não me assusta.'],
    magistrada: ['Saber tudo não te avisou do lampião.', 'Equilíbrio é coisa de quem tem tempo.'],
    estrangeiro: ['Não lembro de você. Melhor assim.', 'Sinal nenhum chega onde eu ando.'],
    amigo: ['Bicho pintado. Queima igual.', 'O sino tocou. Hoje não foi pra mim.'],
  },
  kaiser: { cristino: ['Até no mato a névoa chega, cangaceiro.', 'Seu lampião apagou na fumaça, Cristino.'] },
  arthur: { cristino: ['Socadeira demora pra carregar. Eu não.', 'Um tiro só, Cristino. O meu chegou primeiro.'] },
  joui: { cristino: ['Você mirou na sombra. Eu já estava atrás.', 'Um olho só não vê a lâmina vindo.'] },
  aghata: { cristino: ['O símbolo nas suas costas não te protegeu.', 'Sangue de cangaceiro. Anotado.'] },
  dante: { cristino: ['Personagem bom, final trágico. Clássico.', 'Saiu de cena calado. Pelo menos isso.'] },
  erin: { cristino: ['Seus lampiões são lindos! Mas a minha bomba é maior!', 'Kaboom! Aprende com quem entende, tio!'] },
  gal_sal: { cristino: ['Promessa de irmão não é justiça, Cristino.', 'Presa na corrente igual ao bicho que você caçava.'] },
  kian: { cristino: ['Eu vi o tiro antes da pólvora.', 'Você queria a Coroa. Ela não queria você.'] },
  aguiar: { cristino: ['Ha ha... e agora quem tá dilacerado?', 'Isso foi pelo garoto, cangaceiro.'] },
  labirinto: { cristino: ['O medalhão abre portas. Não abre a saída.', 'Você se perdeu no meu labirinto, Cristino.'] },
  xande: { cristino: ['Barulhento sim, e de pé!', 'Por eles, cangaceiro. Você não ia passar.'] },
  lirio: { cristino: ['A Leonora aguenta chumbo, véi.', 'Lampião nenhum derruba essa parede.'] },
  ferreiro: { cristino: ['Santo Berço não teme caçador.', 'O fogo do seu lampião não esquenta a minha espada.'] },
  juan: { cristino: ['Esse é o meu novo começo.', 'Descarnado, igual da primeira vez.'] },
  kemi: { cristino: ['Silêncio, cangaceiro. Você mesmo pediu.', 'Alvo abatido. Sem pressa, como você gosta.'] },
  balu: { cristino: ['Hahaha! Que chapéu de espinho, hein!', 'Bora tirar esses espinhos e comer alguma coisa?'] },
  arnaldo: { cristino: ['Que figurino! Pena o final.', 'Bravo, cangaceiro! O último ato era meu.'] },
  verissimo: { cristino: ['Olhos abertos, Cristino. Até pra quem anda a pé.', 'Desertor de Hexatombe. A Ordem tem perguntas.'] },
  jae: { cristino: ['Shh... palavra cumprida.', 'Você odeia barulho. Então dorme quieto.'] },
  dalmo: { cristino: ['Aí sim, neném! Derrubei o cangaceiro!', 'Grande você. Maior eu.'] },
  guizo: { cristino: ['Gravei! Um cangaceiro de verdade! Ninguém vai acreditar!', 'Chapéu de espinho, óculos vermelho... isso é ouro!'] },
  o_diabo: { cristino: ['Você também queria alguma coisa, Cristino. Todos querem.', 'A promessa do seu irmão... eu podia ter cumprido.'] },
  magistrada: { cristino: ['Tenebris. Eu sei o que esse medalhão significa.', 'O Equilíbrio não deixa a Coroa nas mãos de ninguém.'] },
  estrangeiro: { cristino: ['Ninguém vai lembrar do cangaceiro.', 'Você caçou monstros. Achou um.'] },
  amigo: { cristino: ['...o lampião apagou...', '...mais um chapéu... no quadro...'] },
};
for (const [w, m] of Object.entries(VICTORY_CRISTINO)) VICTORY_LINES[w] = { ...(VICTORY_LINES[w] || {}), ...m };

// CRISTOPHER (Ordo Realitas, OSNF): falas de vitória dele contra cada um e de cada um contra ele
const VICTORY_CRISTOPHER = {
  cristopher: {
    kaiser: ['Desculpa, filho! O pai ainda tem uns golpes!', 'Eu te amo, Cesar. Agora levanta, que eu te ajudo.'],
    arthur: ['Boa luta, motoqueiro! Um braço vale por dois!', 'Fica no chão, Cervero, que a cena acabou!'],
    joui: ['Joui-san! Quase me pegou! Quase!', 'Kung fu bonito, mas o armário aqui não cai!'],
    aghata: ['Desculpa, menina! Foi sem querer... quase!', 'Muito ritual, pouca porrada, querida!'],
    dante: ['Corta! Essa cena ficou ótima, Dante!', 'Discurso bonito. Mas o soco foi mais rápido!'],
    erin: ['Explosão de verdade? Eu já fiz cena com mais fogo!', 'Garota, você é maluca! Gostei!'],
    gal_sal: ['Correntes? Eu já fui amarrado em helicóptero!', 'Justiça é proteger quem a gente ama, Gal.'],
    kian: ['Previu isso, primeiro ocultista? Previu o tio Cris?', 'Te derrubaram uma vez. Eu derrubei de novo!'],
    aguiar: ['Calma, delegado! Ninguém morreu... hoje!', 'Larga esse machado antes que se machuque!'],
    labirinto: ['Labirinto? Eu só ando reto e passo por cima!', 'Achei a saída! Era o meu punho!'],
    xande: ['Moleque bom de briga! Gostei de você!', 'Skate é perigoso, garoto! Use capacete!'],
    lirio: ['Armário contra armário! O mais velho ganhou!', 'Que pancada, rapaz! Vem cá, me dá um abraço!'],
    ferreiro: ['Carpazinha não me pega duas vezes, velho!', 'Seu santo pode esperar. Eu tenho uma equipe pra proteger.'],
    juan: ['Calma, garoto. Ninguém precisa sangrar hoje.', 'Você precisa de um abraço, não de um pacto!'],
    kemi: ['Sniper? Eu caí de um prédio de vinte andares!', 'Mira boa, mocinha. Eu sou maior que o alvo!'],
    balu: ['Desculpa, tio Balu! Hoje o gringo ganhou!', 'Bora pro Suvaco Seco? Eu pago!'],
    arnaldo: ['Hoje o dublê roubou a cena, meu amigo!', 'Que saudade, Arnaldo. Que saudade.'],
    verissimo: ['Relatório, chefe: o tio Cris resolveu!', 'Olhos abertos, senhor! O meu ficou roxo, mas abriu!'],
    jae: ['Shh nada! Aqui é cena de ação, barulho é tudo!', 'Esconde-esconde comigo não dá, eu sou grande demais!'],
    dalmo: ['Dois armários, um em pé. Esse é o velho aqui!', 'Que soco, grandão! Isso foi de filme!'],
    guizo: ['Filmou, rapaz? Essa cena foi de primeira!', 'Câmera boa! Agora corta e manda pro Van Damme!'],
    o_diabo: ['Pacto? Eu já fiz o meu: proteger a minha equipe!', 'Nem o Diabo tira o tio Cris de cena!'],
    magistrada: ['Saber tudo não segura um chute giratório!', 'Desculpa, dona! Eu sou meio escandaloso!'],
    estrangeiro: ['Que bicho estranho! Você é de que filme?', 'Ninguém vai lembrar? Eu vou contar pra todo mundo!'],
    amigo: ['Credo, que coisa! Mas o tio aguenta!', 'Sino nenhum me faz parar, monstro!'],
    cristino: ['Odeia gente barulhenta? Azar o seu, amigo!', 'Cangaceiro duro! Mas o gringo é mais!'],
  },
  kaiser: { cristopher: ['Agora você fica, velho. Nem que seja no chão.', 'Pai... dessa vez eu cuidei de você.'] },
  arthur: { cristopher: ['Grandão demais pra errar, Cris.', 'Levanta, gringo. A equipe precisa de você.'] },
  joui: { cristopher: ['Desculpe, senhor Cris. Foi rápido.', 'O senhor é forte. Eu só fui mais rápido.'] },
  aghata: { cristopher: ['Força bruta não lê rituais.', 'Grande, barulhento e previsível, senhor Cohen.'] },
  dante: { cristopher: ['Que entrada! Que queda! Bravo, dublê!', 'O tempo derruba até os armários.'] },
  erin: { cristopher: ['Kaboom! O tio caiu bonito!', 'Calculei a carga pro seu tamanho, Cris!'] },
  gal_sal: { cristopher: ['Preso na corrente, igual a todo mundo.', 'Proteger também é saber a hora de parar, Cris.'] },
  kian: { cristopher: ['Você sobreviveu daquela vez. Não dessa.', 'Eu vi o armário cair antes do primeiro soco.'] },
  aguiar: { cristopher: ['Ha ha... o grandão caiu na caçada.', 'Gringo grande, queda grande.'] },
  labirinto: { cristopher: ['Grande demais para os meus corredores.', 'Você andou reto. Reto até a parede.'] },
  xande: { cristopher: ['Desculpa, tio! Valeu, skate!', 'Por eles, grandão. Você ia entender.'] },
  lirio: { cristopher: ['A Leonora aguentou o armário!', 'Que pancada, tio! Mas eu sou mais teimoso!'] },
  ferreiro: { cristopher: ['Carpazinha guarda os que caem aqui.', 'O Santo agradece o seu sangue, estrangeiro.'] },
  juan: { cristopher: ['Seu sangue protege bem, grandão. Agora é meu.', 'Ha! Um pai a menos.'] },
  kemi: { cristopher: ['Alvo grande. Tiro fácil.', 'Trabalho encerrado. Sem rancor, Cohen.'] },
  balu: { cristopher: ['Hahaha! O tio Balu ainda é o maior, gringo!', 'Bora comer? Você paga, perdeu!'] },
  arnaldo: { cristopher: ['Aplausos para o meu dublê favorito!', 'Desculpa, Cris. Essa cena era minha.'] },
  verissimo: { cristopher: ['Coragem você tem, Cohen. Juízo, nem tanto.', 'Relatório: agente Cohen fora de combate.'] },
  jae: { cristopher: ['Shh, grandão. Você fala alto demais.', 'Quanto maior, mais barulho cai.'] },
  dalmo: { cristopher: ['Aí sim, neném! Derrubei o armário!', 'Grande você. Maior eu.'] },
  guizo: { cristopher: ['Gravei! O dublê do Van Damme caindo de verdade!', 'Essa queda vai bombar na internet!'] },
  o_diabo: { cristopher: ['Proteger todo mundo... que desejo bonito, Cris.', 'Eu podia ter trazido o Arnaldo de volta.'] },
  magistrada: { cristopher: ['Tanto barulho. Agora, silêncio.', 'O sacrifício não pesa na balança, Cohen.'] },
  estrangeiro: { cristopher: ['Ninguém vai lembrar do dublê.', 'Grande. Para a sua espécie.'] },
  amigo: { cristopher: ['...o armário... derreteu...', '...mais um pai... no quadro...'] },
  cristino: { cristopher: ['Eu odeio gente barulhenta.', 'Não é pessoal, gringo. Fala menos.'] },
};
for (const [w, m] of Object.entries(VICTORY_CRISTOPHER)) VICTORY_LINES[w] = { ...(VICTORY_LINES[w] || {}), ...m };

// RAZIEL (Vampiros, Hexatombe): falas de vitória dele contra cada um e de cada um contra ele
const VICTORY_RAZIEL = {
  raziel: {
    kaiser: ['Fumaça não esconde o cheiro do seu sangue, Cesar.','Respire, rapaz. O banquete ainda nem começou.'],
    arthur: ['Um braço só. Sobra mais para a mesa.','Belo instrumento, motoqueiro. Toque algo para a ceia.'],
    joui: ['Rápido. Mas eu sou um vulto, Joui.','Sua máscara não esconde o gosto do medo.'],
    dante: ['Palavras bonitas, padre. O sangue é mais sincero.','O seu teatro acabou. O meu banquete não.'],
    erin: ['Explosões não me assustam, menina. Eu já ardi inteiro.','Que barulho. Agora, silêncio à mesa.'],
    aghata: ['Rituais de Sangue... para mim? Que gentil.','O seu grimório não ensina a fugir.'],
    balu: ['Tanta carne. Hoje teremos fartura.','O machado era pesado. A queda, mais ainda.'],
    verissimo: ['A Ordem manda os velhos agora? Que deselegante.','Anote no relatório: o anfitrião venceu.'],
    cristopher: ['Um armário de carne. Que generoso.','Proteja o seu filho agora, se puder.'],
    kian: ['Você previu o meu bote? Não previu o gosto.','A Escrita não salva ninguém da fome.'],
    gal_sal: ['Correntes não seguram quem já foi devorado pelo Sangue.','Justiça? À mesa, só existe apetite.'],
    nubi: ['A Morte não me apressa, chacal.','Silenciosa até no fim. Aprecio isso.'],
    xande: ['Moleque barulhento. O sangue jovem é o mais doce.','Tacada forte. Garras mais.'],
    guizo: ['Desligue a câmera. Ninguém filma a ceia.','Grave isto: o anfitrião sempre vence.'],
    lirio: ['Grande e lento. Como um banquete deve ser.','A sua marreta tem nome. Você agora é só carne.'],
    dalmo: ['O grandalhão do circo. Desta vez eu terminei.','Toda arena acaba num prato, Colosso.'],
    aguiar: ['O senhor também gosta de sangue, delegado. Que afinidade.','Seu machado conhece a carne. A minha boca também.'],
    jae: ['Shh... a refeição terminou, menina.','Esplêndida, como da última vez.'],
    kemi: ['Silenciosa e certeira. Mas eu não tenho olhos para mirar.','Contrato cumprido. O meu era com a fome.'],
    labirinto: ['Tocar em mim não explode nada, senhor.','Eu atravessei o seu estômago uma vez. Eu me lembro do caminho.'],
    juan: ['O gosto da sua carne continua o melhor, Henri.','Desta vez o sino não tocou para salvar você.'],
    cristino: ['O senhor queria o meu braço. Fique com a derrota.','Desça do telhado da próxima vez pela porta. É mais educado.'],
    o_diabo: ['Pactos são para quem tem fome de poder. A minha é só de sangue.','O Sangue reconhece o seu senhor. E ainda assim eu venci.'],
    magistrada: ['O Equilíbrio não sacia a fome.','Saber tudo e ainda assim sangrar. Que triste.'],
    arnaldo: ['Bravo, senhor. O último ato foi meu.','Feche a cortina. O jantar está servido.'],
    ferreiro: ['A sua espada consome. Eu devoro.','Até a Morte sangra à minha mesa.'],
    estrangeiro: ['Ninguém vai lembrar de você. Eu vou lembrar do gosto.','Seu sinal se calou. A ceia continua.'],
    amigo: ['Tinta. Que decepção para o paladar.','O sino tocou. Ninguém foi poupado.'],
  },
  kaiser: { raziel: ['A névoa queima até quem não tem pele.','Engasga na fumaça, vampiro.'] },
  arthur: { raziel: ['Rebirth na cabeça. Agora dorme.','Sem olhos e ainda me viu chegar? Não viu.'] },
  joui: { raziel: ['Um vulto contra uma sombra. A sombra corta primeiro.','Sua boca é grande. Seu fim foi rápido.'] },
  dante: { raziel: ['O Sangue também tem fim. Amém.','Que personagem trágico. Que final merecido.'] },
  erin: { raziel: ['KABOOM! Churrasco de vampiro!','Fogo resolve tudo, até sem pele!'] },
  aghata: { raziel: ['Eu conheço os rituais de Sangue melhor que você.','Mais um monstro para o grimório.'] },
  balu: { raziel: ['Banquete? Eu trago a sobremesa: machadada!','Hahaha! Que sorrisão, hein!'] },
  verissimo: { raziel: ['O líder dos Vampiros. Caso encerrado.','Olhos abertos, Raziel. Ah, você não tem.'] },
  cristopher: { raziel: ['Ninguém morde a minha equipe!','Fica no chão, dentuço!'] },
  kian: { raziel: ['Eu vi a sua fome antes do bote.','A Escrita registrou: o vampiro caiu.'] },
  gal_sal: { raziel: ['Preso como um animal. É o que você é.','A justiça também tem dentes.'] },
  nubi: { raziel: ['A Morte espera até os famintos.','Calma. Até o Sangue se cansa.'] },
  xande: { raziel: ['Tacada no meio da boca!','Pelos meus amigos, vampiro!'] },
  guizo: { raziel: ['Gravei um VAMPIRO DE VERDADE! Mano!','Não morde, não morde! ...Venci?'] },
  lirio: { raziel: ['A Leonora quebra até dente de vampiro.','Banquete? Comeu marretada.'] },
  dalmo: { raziel: ['Hoje quem estripa sou eu, neném!','A revanche do circo!'] },
  aguiar: { raziel: ['Ha ha... carne por carne, vampiro.','O predador aqui sou eu.'] },
  jae: { raziel: ['Shh... agora quem foi devorado foi você.','Pela Maria. E pelo vinho.'] },
  kemi: { raziel: ['Um tiro na cabeça. Igual a Lena.','Alvo abatido. Sem olhos, sem mira, sem chance.'] },
  labirinto: { raziel: ['Toquei. Agora explode.','Você me atravessou uma vez. Não duas.'] },
  juan: { raziel: ['Igual na igreja. Até a cabeça.','Ele mandou. Eu obedeci.'] },
  cristino: { raziel: ['Faltou um braço. Agora falta o resto.','Não é pessoal, vampiro.'] },
  o_diabo: { raziel: ['Todo Sangue volta para mim, Raziel.','Que vampiro obediente. Ajoelhe.'] },
  magistrada: { raziel: ['O Equilíbrio cobra a fome também.','Eu sei como esta história termina. Termina assim.'] },
  arnaldo: { raziel: ['Que vilão! Que final! Bravo!','Fecham-se as cortinas para o vampiro.'] },
  ferreiro: { raziel: ['Até um vampiro tem idade, garoto.','Santo Berço não se curva à fome.'] },
  estrangeiro: { raziel: ['Ninguém vai lembrar do líder dos Vampiros.','Interessante. A fome também esquece.'] },
  amigo: { raziel: ['...o vampiro... virou pintura...','...mais uma boca... no quadro...'] },
};
for (const [w, m] of Object.entries(VICTORY_RAZIEL)) VICTORY_LINES[w] = { ...(VICTORY_LINES[w] || {}), ...m };

// CELESTINE (Portadores / Ordo Calamitas, Calamidade): falas de vitória dela contra cada um e de cada um contra ela
const VICTORY_CELESTINE = {
  celestine: {
    kaiser: ['Fumacinha bonita. Pena que eu respiro pela boca.','Nada pessoal, fotógrafo. Sorria para a foto.'],
    arthur: ['Um braço só e ainda queria duelar comigo? Fofo.','Toca uma música triste. Combina com a derrota.'],
    joui: ['Sombra rápida. A corrente foi mais.','Ninja de máscara. Eu conheço máscaras melhores.'],
    dante: ['Rezou bonito. Não adiantou.','Padre, guarda o sermão pra próxima.'],
    erin: ['Explodiu tudo e ainda perdeu. Que talento.','Gostei do barulho. Gostei mais do silêncio depois.'],
    aghata: ['Sangue no grimório não para machadinha.','Ritual demorado. Eu sou mais rápida.'],
    balu: ['Grandão, cai com classe pelo menos.','Machado grande, coração mole. Nada pessoal.'],
    verissimo: ['Velhinho, a Ordem te mandou sozinho? Que crueldade.','Anota aí no relatório: Celestine passou.'],
    cristopher: ['Dublê não substitui no chão, né?','Que muralha. Caiu igual.'],
    kian: ['Previu a corrente? Não previu a segunda machadinha.','Escripta forte. Ainda é Escripta.'],
    gal_sal: ['Correntes contra correntes. As minhas cortam.','Justiça é bonita. Traição ganha.'],
    nubi: ['Calminho até no chão. Gostei de você.','A Morte fala baixo. Eu falo mais alto.'],
    xande: ['Moleque, larga o taco e vai pra casa.','Tacada linda. Pena que errou.'],
    guizo: ['Grava aí: a Celestine venceu.','Desliga a câmera, que o resto é segredo.'],
    lirio: ['A marreta tem nome? Que fofo. Eu não decorei.','Grande, lento e no chão.'],
    dalmo: ['Colosso de arena? Eu sou da arena de verdade.','Esmaga crânio, é? Perdeu o seu.'],
    aguiar: ['Machado contra machadinha. Tamanho não é tudo.','Delegado, você está preso. Na corrente.'],
    jae: ['Shh, é? Eu sussurro melhor. Chama Código.','Assassina furtiva. Eu traio de frente.'],
    kemi: ['Mira bonita. Eu cheguei antes do tiro.','Fantasma, você ainda dá pra ver no chão.'],
    labirinto: ['Encostou em mim? Não explodiu nada.','Todo labirinto tem saída. Eu fui ela.'],
    juan: ['Pacto com o Diabo? Amador.','Masoquista? Então gostou, né?'],
    cristino: ['Odeia barulho? Vou rir bem alto então.','Não é pessoal, cangaceiro. Nunca é.'],
    raziel: ['Vampiro chique. Sangra igual.','O banquete acabou. Quem comeu fui eu.'],
    o_diabo: ['Senhor do Sangue, ajoelha pra mim um pouquinho.','Pacto quebrado. Nada pessoal.'],
    magistrada: ['A Máscara lembra de mim. Lembra quem é a dona.','Última Magistrada? Primeira a cair hoje.'],
    arnaldo: ['Bravo, ator. Agora sai do palco.','Que jogo divertido. Eu ganhei.'],
    ferreiro: ['Gigante de Santo Berço, cai devagar.','Espada que consome. Eu consumi primeiro.'],
    estrangeiro: ['Apagar memória? Ninguém esquece de mim.','Fios demais. Cortei todos.'],
    amigo: ['Tinta pra todo lado. Que bagunça.','Amigo imaginário? Eu não tenho amigos.'],
  },
  kaiser: { celestine: ['Fecha os olhos e respira. Ah, não dá.','Belo flash. Melhor ainda a queda.'] },
  arthur: { celestine: ['Rebirth na cabeça, rebelde.','Debocha agora, vai.'] },
  joui: { celestine: ['A sombra não tem corrente pra puxar.','Traidora rápida. Eu sou mais.'] },
  dante: { celestine: ['A traição também tem fim. Amém.','Personagem divertida. Final merecido.'] },
  erin: { celestine: ['KABOOM! Explodiu o deboche!','Ri agora, loira!'] },
  aghata: { celestine: ['Mais uma página no grimório: a traidora.','Machadinha não vence ritual.'] },
  balu: { celestine: ['Hahaha! Gostei de você, menina! Mas perdeu!','Machadinha? Eu tenho é machado!'] },
  verissimo: { celestine: ['Rebelde da Calamitas. Caso encerrado.','Disciplina vence deboche, moça.'] },
  cristopher: { celestine: ['Fica no chão, encrenqueira!','Corta essa, loira!'] },
  kian: { celestine: ['Eu vi a traição antes de você pensar nela.','A Escrita registrou: a Calamitas caiu.'] },
  gal_sal: { celestine: ['Presa na própria corrente.','A justiça também trai, quando precisa.'] },
  nubi: { celestine: ['A Morte espera até os inquietos.','Calma. A endorfina passa.'] },
  xande: { celestine: ['Tacada certeira na rebelde!','Fala menos, luta mais!'] },
  guizo: { celestine: ['Gravei uma guerreira de 67 d.C.! Mano!','Ela riu de mim e perdeu! Tá gravado!'] },
  lirio: { celestine: ['A Leonora não ri de piada.','Deboche não para marreta.'] },
  dalmo: { celestine: ['Arena de verdade é a minha, neném!','Grande e de pé. Você não.'] },
  aguiar: { celestine: ['Ha ha... o machado maior venceu.','Corrente por corda, menina.'] },
  jae: { celestine: ['Shh... o seu Código eu também sei.','Traidora traída. Que irônico.'] },
  kemi: { celestine: ['Um tiro. Sem deboche.','Alvo abatido. Rindo, mas abatido.'] },
  labirinto: { celestine: ['Toquei. Agora explode.','Cortou tudo, menos a saída.'] },
  juan: { celestine: ['Sangue de guerreira. Delicioso.','Nada pessoal, né? Pra mim foi.'] },
  cristino: { celestine: ['Barulhenta. Agora quieta.','Não é pessoal, moça.'] },
  raziel: { celestine: ['Que sangue antigo. Esplêndido.','A rebeldia tem um gosto ótimo.'] },
  o_diabo: { celestine: ['Toda traidora volta pra mim.','Nada pessoal. Só um pacto.'] },
  magistrada: { celestine: ['A Máscara escolheu de novo. Escolheu a mim.','Saber tudo é perder tudo. Você só perdeu.'] },
  arnaldo: { celestine: ['Que reviravolta! Que traição! Bravo!','Fecham-se as cortinas para a rebelde.'] },
  ferreiro: { celestine: ['Santo Berço não se curva a deboche.','Pequena e barulhenta. E no chão.'] },
  estrangeiro: { celestine: ['Ninguém vai lembrar da Celestine.','Interessante. A traição também esquece.'] },
  amigo: { celestine: ['...as machadinhas... viraram pintura...','...ela riu... no quadro...'] },
};
for (const [w, m] of Object.entries(VICTORY_CELESTINE)) VICTORY_LINES[w] = { ...(VICTORY_LINES[w] || {}), ...m };

// GAIUS (Ordo Calamitas, Calamidade): falas de vitória dele contra cada um e de cada um contra ele
const VICTORY_GAIUS = {
  gaius: {
    kaiser: ['Fumaça não assusta quem já respirou o pó do Coliseu.','Fuma menos, rapaz. Vai chegar na minha idade.'],
    arthur: ['Um braço só e ainda me deu trabalho. Respeito.','Toca alguma coisa calma pro velho descansar.'],
    joui: ['Rápido como eu era. Era.','Sombra nenhuma esconde de quem já usou uma Máscara.'],
    dante: ['Bonito sermão. A maça não ouviu.','Reza por mim também, padre. Minhas costas agradecem.'],
    erin: ['Muito barulho, menina. Velho já é meio surdo mesmo.','Explodiu tudo e caiu igual.'],
    aghata: ['Ritual de Sangue? Eu já vi Roma pegar fogo.','Volta pro grimório, menina.'],
    balu: ['Grandão, você bate forte. Eu bato antes.','Machado grande, mas o velho tem paciência.'],
    verissimo: ['Mais um velho na guerra. Que bom te ver de pé... ah, não está.','Disciplina eu respeito. Só que a maça pesa mais.'],
    cristopher: ['Dublê? Eu caio de verdade faz trinta anos.','Fica deitado, filho. Descansa.'],
    kian: ['A Escrita não me mete medo. A idade mete.','Muito poder, pouca paciência.'],
    gal_sal: ['Correntes eu já carreguei. Pesam mais que as suas.','Justiça leva tempo. Eu tenho de sobra.'],
    nubi: ['A Morte espera por mim faz tempo. Hoje não.','Calmo, você. Gostei.'],
    xande: ['Moleque bom de taco. Treina mais.','Ah, a juventude... perdeu, mas perdeu bonito.'],
    guizo: ['Para de filmar o velho, garoto.','Grava aí: o velho ainda dá conta.'],
    lirio: ['Marreta pesada. Maça mais esperta.','Força você tem. Juízo, falta.'],
    dalmo: ['Arena? Eu lutei no Coliseu de verdade, grandão.','Grande e de pé... era.'],
    aguiar: ['Machado e maça. Ganhou o mais velho.','Delegado, descansa. Eu também quero.'],
    jae: ['Sussurro não engana ouvido velho.','Rápida, menina. Mas eu vi.'],
    kemi: ['Tiro de longe? Velho anda devagar, mas chega.','Fantasma nenhum me tira o sono. A coluna tira.'],
    labirinto: ['Já me perdi em lugar pior que você.','Todo labirinto acaba. Inclusive você.'],
    juan: ['Pacto com o Diabo? Eu fiz com a Seita. Também cobra.','Muito sangue, pouco juízo, rapaz.'],
    cristino: ['Cangaceiro bom. Velho melhor.','Silencioso. Gosto disso.'],
    raziel: ['Vampiro, eu sou velho demais pra virar janta.','Carne velha é dura, criatura.'],
    arnaldo: ['A chama ainda queima em você, rapaz. Cuidado com ela.','Bom ator. Péssimo dia.'],
    ferreiro: ['Gigante de Santo Berço. Caiu igual a qualquer um.','Espada que consome. Maça que derruba.'],
    celestine: ['Ah, Celestine. Rápida, convencida... e no chão.','Vai treinar mais, menina. O velho espera.'],
    o_diabo: ['Já recusei acordo melhor que o seu.','O Sangue não assusta quem guardou a Energia.'],
    magistrada: ['Diga à Seita que eu cumpri a minha parte.','Saber tudo e ainda apanhar de um velho.'],
    estrangeiro: ['Apagar minha memória? Já esqueço sozinho.','Coisa feia. Mas cai igual.'],
    amigo: ['Bicho pintado. Já vi pior em Roma.','Tinta não segura maça.'],
  },
  kaiser: { gaius: ['Respira, vovô. Ah, não dá.','Fumaça e idade não combinam.'] },
  arthur: { gaius: ['Rebirth na cabeça do vovô.','Desculpa, senhor. Mas era luta.'] },
  joui: { gaius: ['O senhor era rápido. Eu ainda sou.','Descansa, velho guerreiro.'] },
  dante: { gaius: ['Que a idade lhe traga sabedoria. E repouso.','Um velho personagem. Um final digno.'] },
  erin: { gaius: ['KABOOM, vovô!','Ops. Machucou a coluna?'] },
  aghata: { gaius: ['Mais um nome antigo pro grimório.','A Ordo Calamitas caiu. Igual Roma.'] },
  balu: { gaius: ['Hahaha! Velho duro de derrubar!','Machadada de respeito, vovô.'] },
  verissimo: { gaius: ['Dois velhos. Um de pé.','Experiência contra experiência. Venci.'] },
  cristopher: { gaius: ['Fica deitado, vovô. Eu seguro.','Respeito os mais velhos. Depois da luta.'] },
  kian: { gaius: ['A Relíquia que te consome é minha, velho.','Roma caiu. Você também.'] },
  gal_sal: { gaius: ['Preso na idade e na corrente.','Justiça não tem idade.'] },
  nubi: { gaius: ['A Morte chega pra todos. Até pra Roma.','Descanse.'] },
  xande: { gaius: ['Tacada no vovô! Desculpa!','Juventude venceu, tio!'] },
  guizo: { gaius: ['Gravei um romano de verdade! Mano!','O vovô bateu forte, hein!'] },
  lirio: { gaius: ['A Leonora não respeita idade.','Maça contra marreta. Marreta ganhou.'] },
  dalmo: { gaius: ['Coliseu de verdade, é? Agora tem dono.','Grande e de pé, vovô.'] },
  aguiar: { gaius: ['Ha ha... carne velha.','O predador não escolhe idade.'] },
  jae: { gaius: ['Shh... dorme, velhinho.','Ouvido velho não ouviu nada.'] },
  kemi: { gaius: ['Alvo lento. Alvo abatido.','Nada pessoal, vovô.'] },
  labirinto: { gaius: ['Se perdeu, velho?','Toquei. Agora descansa.'] },
  juan: { gaius: ['Sangue velho. Ainda serve.','O Diabo manda lembranças, vovô.'] },
  cristino: { gaius: ['Não é pessoal, velho.','Silêncio. Finalmente.'] },
  raziel: { gaius: ['Carne velha... ainda assim, esplêndida.','A sua história acaba à minha mesa.'] },
  arnaldo: { gaius: ['Fecham-se as cortinas para o primeiro ato.','A Relíquia escolheu bem os dois. Mas hoje, eu.'] },
  ferreiro: { gaius: ['Santo Berço não se curva a Roma.','Velho e forte. Mas eu sou mais.'] },
  celestine: { gaius: ['Nada pessoal, velho. Mentira, foi bem pessoal.','Reza pra deixar de ser chato... Chato!'] },
  o_diabo: { gaius: ['Toda chama acaba virando cinza, Gaius.','Um pacto a mais na coleção.'] },
  magistrada: { gaius: ['A Seita não esquece quem já foi dela.','O Equilíbrio cobra até dos velhos.'] },
  estrangeiro: { gaius: ['Ninguém vai lembrar de Roma.','Interessante. Um velho esquecido.'] },
  amigo: { gaius: ['...o velho... virou pintura...','...Roma... no quadro...'] },
};
for (const [w, m] of Object.entries(VICTORY_GAIUS)) VICTORY_LINES[w] = { ...(VICTORY_LINES[w] || {}), ...m };

// AMALIA (Ordo Calamitas, Calamidade): falas de vitória dela contra cada um e de cada um contra ela
const VICTORY_AMALIA = {
  amalia: {
    arthur: ['Um braço só e ainda mira bem. Eu miro melhor.', 'Toca alguma coisa. Baixinho.'],
    joui: ['Rápido. A flecha é mais.', 'Sombra não esconde de quem mira.'],
    kaiser: ['Fumaça não tira a mira.', 'Fala menos. Respira mais.'],
    dante: ['Reza baixo. Eu tô mirando.', 'Bonito. Agora deita.'],
    erin: ['Barulho demais.', 'Explodiu. Errou.'],
    aghata: ['Ritual demora. Flecha não.', 'Anota no grimório. Errou.'],
    balu: ['Grande. Fácil de acertar.', 'O urso caiu.'],
    verissimo: ['Disciplina. Mas a minha mira é melhor.', 'Descansa, senhor.'],
    cristopher: ['Dublê cai bonito.', 'Fica no chão. Melhor.'],
    kian: ['Escrita lenta. Flecha rápida.', 'Escreve isso.'],
    gal_sal: ['Corrente curta. Flecha longa.', 'Justiça de longe também vale.'],
    nubi: ['Você viu chegar. Não desviou.', 'Calma. Gostei.'],
    xande: ['Moleque. Taco curto.', 'Treina a pontaria.'],
    guizo: ['Para de filmar.', 'Grava isso. Errou.'],
    lirio: ['Marreta pesada. Flecha não.', 'Leonora errou. Eu não.'],
    dalmo: ['Grande. Alvo fácil.', 'Arena acabou, neném.'],
    aguiar: ['Predador lento.', 'Caçado.'],
    jae: ['Silêncio. Eu ouvi.', 'Ouvido bom. Mira melhor.'],
    kemi: ['Tiro bom. Flecha melhor.', 'Contrato cancelado.'],
    labirinto: ['Labirinto tem saída. Flecha acha.', 'Toquei de longe.'],
    juan: ['Muito sangue. Pouca mira.', 'Ódio erra.'],
    cristino: ['Barulho? Eu sou quieta.', 'Silêncio. Gosto.'],
    raziel: ['Vampiro. Coração. Flecha.', 'Janta cancelada.'],
    arnaldo: ['Esse relógio queima. Cuidado.', 'Ator. Péssimo dia.'],
    ferreiro: ['Gigante. Alvo grande.', 'Santo Berço caiu.'],
    celestine: ['Perdeu a cabeça, Celestine.', 'Fica quieta, Celestine. Por favor.'],
    gaius: ['Descansa, Gaius. Suas costas.', 'Velho teimoso. Deita.'],
    o_diabo: ['Sem acordo.', 'Diabo também cai.'],
    magistrada: ['Sabe tudo. Não viu a flecha.', 'Celestine? Não. Outra.'],
    estrangeiro: ['Esquece. Eu não erro.', 'Coisa estranha. Caiu.'],
    amigo: ['Bicho pintado. Alvo grande.', 'Tinta não segura flecha.'],
  },
  arthur: { amalia: ['Flecha contra Rebirth. A bala chegou antes.', 'Desculpa, arqueira. Era luta.'] },
  joui: { amalia: ['Eu te devo essa, Amalia. Desculpa.', 'Corte limpo. Você não sentiu.'] },
  kaiser: { amalia: ['Arco contra fuzil. Moderno ganha.', 'Boa mira, moça. A minha é melhor.'] },
  dante: { amalia: ['Que a sua aura descanse, arqueira.', 'Um tiro certeiro. O meu.'] },
  erin: { amalia: ['KABOOM! Flecha nenhuma segura isso!', 'Arco é muito devagar, gata!'] },
  aghata: { amalia: ['Mais uma página. A arqueira de Roma.', 'Sangue mais rápido que flecha.'] },
  balu: { amalia: ['Hahaha! Pegou a arqueira!', 'Machadada de perto, flechinha!'] },
  verissimo: { amalia: ['Precisão admirável. Ainda assim, caiu.', 'Arquearia é bonita. Escopeta é eficiente.'] },
  cristopher: { amalia: ['Peguei a flecha no ar. Mentira, doeu.', 'Cena de ação! Ela cai, eu fico!'] },
  kian: { amalia: ['A Ordo Calamitas caiu antes. Cai de novo.', 'Uma flecha não apaga a Escrita.'] },
  gal_sal: { amalia: ['A justiça alcança qualquer distância.', 'Preso. Como deveria.'] },
  nubi: { amalia: ['A flecha demorou horas pra mim.', 'Respira. Você mira rápido demais.'] },
  xande: { amalia: ['Tacada no arco! Desculpa!', 'Os Cinco venceram, moça!'] },
  guizo: { amalia: ['GRAVEI UMA FLECHA VOANDO! Mano!', 'Ela não fala nada! Que medo!'] },
  lirio: { amalia: ['A Leonora quebrou o arco, viu?', 'Flechinha não para marreta.'] },
  dalmo: { amalia: ['Flecha faz cosquinha, neném.', 'De perto a gente conversa.'] },
  aguiar: { amalia: ['Ha ha... presa que atira.', 'Arqueira boa. Presa melhor.'] },
  jae: { amalia: ['Shh... a corda faz barulho.', 'Você respira alto, arqueira.'] },
  kemi: { amalia: ['Atiradora contra arqueira. Pólvora ganha.', 'Nada pessoal. Um tiro.'] },
  labirinto: { amalia: ['Perdida no labirinto, arqueira.', 'Flecha nenhuma acha a saída.'] },
  juan: { amalia: ['Gostei da dor. Atira de novo.', 'Sangue ganha de flecha.'] },
  cristino: { amalia: ['Pelo menos você é quieta.', 'Lampião ilumina, flecha cai.'] },
  raziel: { amalia: ['Sangue de arqueira. Raro.', 'A ceia está servida, flecha nenhuma salva.'] },
  arnaldo: { amalia: ['Uma guerreira de Roma. Uma honra, senhora.', 'A arqueira saiu de cena.'] },
  ferreiro: { amalia: ['Santo Berço não teme flechas.', 'A espada consome. Inclusive Roma.'] },
  celestine: { amalia: ['Desculpa, Gata. Nada pessoal.', 'Mira boa, Gata. A machadinha voou mais rápido.'] },
  gaius: { amalia: ['Ah, a juventude. Boa mira, menina.', 'Muita flecha, pouca paciência. Senta.'] },
  o_diabo: { amalia: ['Um pacto e a mira é sua de novo.', 'A flecha também queima no Sangue.'] },
  magistrada: { amalia: ['A Ordo Calamitas acabou. Como estava escrito.', 'O Equilíbrio sabia onde a flecha ia cair.'] },
  estrangeiro: { amalia: ['Ninguém vai lembrar da arqueira.', 'Interessante. A flecha também esquece.'] },
  amigo: { amalia: ['...a flecha... virou pintura...', '...a arqueira... no quadro...'] },
};
for (const [w, m] of Object.entries(VICTORY_AMALIA)) VICTORY_LINES[w] = { ...(VICTORY_LINES[w] || {}), ...m };

// NUBI (Escriptas): falas originais do jogo, dela contra cada um e de cada um contra ela
const VICTORY_NUBI = {
  nubi: {
    arthur: ['Um tiro só, Cervero. Eu vi ele chegar por horas.', 'A sua pressa é a coisa mais lenta que eu já vi.'],
    joui: ['Rápido. Pra vocês.', 'Eu tive tempo de ver a lâmina inteira. Duas vezes.'],
    kaiser: ['A névoa demora pra cair. Eu esperei.', 'Respira devagar. Assim você chega aonde eu estou.'],
    dante: ['Você viu a mente de uma Existida. Eu vivo dentro de uma.', 'O lodo é meu também, Dante. Só mais antigo.'],
    erin: ['A explosão demorou um dia inteiro pra mim.', 'Barulho não apressa o tempo, menina.'],
    aghata: ['O grimório não tem a página que eu vivi.', 'Ler é lento. Eu já sei o fim.'],
    balu: ['Hoje o machado não chegou a tempo.', 'Eu esperei anos por esse golpe. Não veio.'],
    verissimo: ['Estratégia é um plano pros próximos minutos. Eu vivi os próximos séculos.', 'Anota no relatório: ela não teve pressa.'],
    cristopher: ['Você fala alto. Eu escuto devagar.', 'O dublê caiu. A cena durou horas pra mim.'],
    kian: ['Eu ainda espero você me salvar, Kian.', 'Me desculpa. Cada segundo aqui é longo demais.'],
    gal_sal: ['As correntes não seguram o tempo, Gal.', 'A gente saiu do mesmo fogo. Você só saiu mais rápido.'],
    xande: ['Teoria nenhuma explica o que eu sinto.', 'Você piscou. Eu envelheci.'],
    guizo: ['Filma devagar. É assim que eu vejo tudo.', 'Embaralhou. Eu tive tempo de achar a verdadeira.'],
    lirio: ['Parede grossa. Eu esperei ela rachar.', 'Paciência eu tenho de sobra. Muito mais que você.'],
    dalmo: ['A arena gritava. Pra mim, um sussurro arrastado.', 'Grande. E devagar como tudo.'],
    aguiar: ['Os cães correram. Eu vi cada passo.', 'Caçador sem pressa? Eu sou pior.'],
    jae: ['Silêncio dura muito pra mim. Eu me acostumei.', 'Eu ouvi o seu passo antes de você dar.'],
    kemi: ['A mira foi perfeita. Lenta, mas perfeita.', 'Contrato de minutos. Eu vivo em séculos.'],
    labirinto: ['Labirinto é tempo. E tempo eu tenho.', 'Eu andei pelo seu caminho mil vezes antes de você.'],
    juan: ['O seu sangue escorreu tão devagar.', 'Recomeço é só mais um segundo pra mim.'],
    cristino: ['Você odeia gente barulhenta. Eu odeio gente rápida.', 'O lampião levou uma eternidade pra apagar.'],
    o_diabo: ['Nem o Diabo tem pressa comigo.', 'Pacto de uma vida. Pra mim, um piscar longo.'],
    magistrada: ['Saber tudo é perder tudo. Eu sei.', 'O Equilíbrio também espera. Igual a mim.'],
    arnaldo: ['A peça foi longa. Eu assisti tudo.', 'Cortina devagar, ator. Eu gosto de ver.'],
    ferreiro: ['O Santo Berço foi meu antes de ser seu.', 'A Morte também é minha, Ferreiro.'],
    estrangeiro: ['O sinal levou horas pra chegar.', 'Você vem de longe. Eu venho de muito tempo.'],
    amigo: ['A tinta escorreu como o lodo. Devagar.', 'O sino tocou uma vez. Pra mim, um dia inteiro.'],
  },
  arthur: {
    nubi: ['Dessa vez ela não teve tempo de desviar.', 'Paciência é a minha também. E a minha atira.'],
  },
  joui: {
    nubi: ['Mesmo devagar, você não viu essa.', 'Shi no Kage. Rápido demais até pra você.'],
  },
  kaiser: {
    nubi: ['Na névoa o tempo não importa.', 'Escriptas. Sempre com essa calma irritante.'],
  },
  dante: {
    nubi: ['Cada segundo são horas? Então foi um dia longo pra você.', 'Eu ouvi milhares de vozes uma vez. A sua ficou quieta.'],
  },
  erin: {
    nubi: ['Kaboom! Isso durou quanto pra você? Uma semana?', 'Calma demais, moça! Sorri um pouco!'],
  },
  aghata: {
    nubi: ['Anotei a sua condição. Interessante e triste.', 'Escripta de Morte. Raro. E derrotada.'],
  },
  balu: {
    nubi: ['De novo, moça. Eu disse que era rapidinho.', 'O machado chega. Sempre chega. Ha ha!'],
  },
  verissimo: {
    nubi: ['Escripta contida. Relatório fechado.', 'Calma não substitui estratégia.'],
  },
  cristopher: {
    nubi: ['Moça, pra você isso foi um filme inteiro, né?', 'Corta! Agora descansa, tá?'],
  },
  kian: {
    nubi: ['Aguenta mais um pouco, Nubi. Eu prometi.', 'Desculpa. Isso deve ter durado anos pra você.'],
  },
  gal_sal: {
    nubi: ['Solta esse fogo, Nubi. A gente já saiu dele.', 'Justiça pela Nina. Mesmo que demore.'],
  },
  xande: {
    nubi: ['Percepção alterada não te salvou da minha.', 'Por eles. Inclusive por quem você machucou.'],
  },
  guizo: {
    nubi: ['Filmei em câmera lenta só pra você ver igual.', 'Nina mandou um recado. Esse foi ele.'],
  },
  lirio: {
    nubi: ['Lerda igual tartaruga, véi. Ah, não, isso é você vendo.', 'A Leonora não espera ninguém.'],
  },
  dalmo: {
    nubi: ['A arena não perdoa quem fica parado.', 'Calma bonita. Caiu igual.'],
  },
  aguiar: {
    nubi: ['Os cães sentiram o cheiro do lodo. Fácil.', 'Ha ha... presa calma é a mais gostosa.'],
  },
  jae: {
    nubi: ['Shh... você ouviu isso durante horas, né?', 'Silêncio. É o que você mais tem.'],
  },
  kemi: {
    nubi: ['Um tiro. Você teve horas pra ver. Não adiantou.', 'Alvo calmo. Abatido.'],
  },
  labirinto: {
    nubi: ['Mesmo com todo o tempo do mundo, não achou a saída.', 'O meu labirinto é mais longo que a sua eternidade.'],
  },
  juan: {
    nubi: ['Escriptas. Sempre achando que o tempo é delas.', 'Sangue corre rápido. Até pra você.'],
  },
  cristino: {
    nubi: ['Não é pessoal. Você só demorou demais.', 'Cansei de esperar.'],
  },
  o_diabo: {
    nubi: ['O tempo é meu também. E o sangue mais.', 'Pequena ocultista. O Diabo não espera.'],
  },
  magistrada: {
    nubi: ['Você vê o tempo de longe. Eu vejo tudo.', 'O Equilíbrio voltou. Descansa.'],
  },
  arnaldo: {
    nubi: ['Que plateia paciente! Uma salva de palmas lenta!', 'Ato final, minha cara. Fecha a cortina.'],
  },
  ferreiro: {
    nubi: ['O Santo Berço lembra de você. E não te quer.', 'A Morte me escolheu primeiro.'],
  },
  estrangeiro: {
    nubi: ['Tempo é uma coisa curiosa no seu planeta.', 'Você vai esquecer disso. Devagar.'],
  },
  amigo: {
    nubi: ['Pintei você bem paradinha. Igual um quadro.', 'O sino tocou pra você, viu?'],
  },
};
for (const [w, m] of Object.entries(VICTORY_NUBI)) VICTORY_LINES[w] = { ...(VICTORY_LINES[w] || {}), ...m };

// CARNIÇAL (Outro Lado, Morte): a criatura quase não fala — rosna, a espiral pulsa, e o Comando sai em ordens curtas
const VICTORY_CARNICAL = {
  carnical: {
    arthur: ['(a espiral pulsa) ...FICA... no chão...', '(rosna e limpa as garras no Lodo)'],
    joui: ['(o Símbolo gira na testa) ...OLHA...', '(fareja o corte e rosna baixo)'],
    kaiser: ['(rasga a fumaça com as garras) ...AJOELHE...', '(o brilho dos ombros acende e apaga)'],
    dante: ['(a reza para; a espiral não) ...QUIETO...', '(rosna para a aura que some)'],
    erin: ['(sacode a poeira da explosão e rosna)', '...BARULHO... PARE...'],
    aghata: ['(o colar de sangue no chão; ela não olha mais) ...DURMA...', '(o Lodo escorre do crânio, devagar)'],
    balu: ['(arranha o chão em volta do urso caído)', '...GRANDE... caiu...'],
    verissimo: ['(a espiral encara o comandante) ...OBEDEÇA...', '(rosna; o plano acabou)'],
    cristopher: ['(o dublê para no ar, hipnotizado, e cai)', '...FIQUE... deitado...'],
    kian: ['(a Escrita some na espiral) ...ESQUEÇA...', '(rasga a página no chão)'],
    gal_sal: ['(as correntes caem; as garras não) ...PARE...', '(fareja o Sangue e rosna)'],
    nubi: ['(a Morte reconhece a Morte; a espiral gira mais rápido)', '...DEVAGAR... você... é minha...'],
    xande: ['(morde o skate e joga longe)', '...MOLEQUE... VENHA...'],
    guizo: ['(a câmera filma só a espiral) ...OLHA...', '(rosna para a lente)'],
    lirio: ['(a Leonora no chão; ele pisa em cima)', '...PESADO... caiu...'],
    dalmo: ['(o escafandro rachado; a espiral reflete no vidro)', '...AJOELHE... gladiador...'],
    aguiar: ['(o caçador vira caça) ...FIQUE...', '(rosna para o cheiro de sangue)'],
    jae: ['(fareja nas sombras até achar) ...AQUI...', '(o silêncio dela; o rosnado dele)'],
    kemi: ['(as balas no chão, achatadas no Lodo)', '...ARMA... inútil...'],
    labirinto: ['(o Símbolo é a saída) ...VENHA...', '(rasga o elmo e rosna)'],
    juan: ['(lambe o sangue das garras) ...MAIS...', '...ÓDIO... pare...'],
    cristino: ['(o lampião apaga; a espiral não)', '(rosna para o fogo que morre)'],
    raziel: ['(as garras contra as garras; as dele ficam)', '...VAMPIRO... AJOELHE...'],
    arnaldo: ['(a cortina é a espiral) ...OLHE...', '(rosna para a plateia vazia)'],
    ferreiro: ['(a espiral do peito do mestre; a da testa dele) ...MORTE...', '(abaixa a cabeça para o Santo Berço, e rosna)'],
    celestine: ['(os olhos dela presos no Símbolo) ...QUIETA...', '(rasga a capa e rosna)'],
    gaius: ['(o velho de Roma ajoelha) ...ISSO...', '(fareja a Calamidade e rosna baixo)'],
    amalia: ['(a flecha não entrou; o Lodo cuspiu)', '...ARCO... pare...'],
    o_diabo: ['(Sangue contra Morte; a espiral pulsa)', '...PACTO... não...'],
    magistrada: ['(ela previu; não desviou) ...OLHE...', '(rasga a beca e rosna)'],
    estrangeiro: ['(fareja a coisa de outro lugar e rosna)', '...ESQUEÇA... você...'],
    amigo: ['(a tinta escorre junto com o Lodo)', '(os dois rosnam; só um levanta)'],
  },
  arthur: { carnical: ['A bala não entrou. A guitarra entrou.', 'Corpo fechado, mas a cabeça não.'] },
  joui: { carnical: ['No crânio. Era o único lugar.', 'Não olhei pra espiral. Só pro corte.'] },
  kaiser: { carnical: ['Vinte tiros e nada. Um soco no crânio e pronto.', 'Bicho feio. Fica aí.'] },
  dante: { carnical: ['Que a Morte leve o que é dela.', 'Não olhei pra testa. Rezei de olho fechado.'] },
  erin: { carnical: ['Bala não entra? Explosão entra!', 'KABOOM no crânio! Resolvido!'] },
  aghata: { carnical: ['Sangue contra Lodo. Mais uma página.', 'A espiral apagou. Anotado.'] },
  balu: { carnical: ['Machadada na cabeça! Simples!', 'Bichão! O urso ganhou dessa vez!'] },
  verissimo: { carnical: ['O ponto fraco é o crânio. Sempre foi.', 'Criatura neutralizada. Próxima.'] },
  cristopher: { carnical: ['Eu já vi um desses. Não queria ver de novo.', 'Corta! Fim de cena pro monstro!'] },
  kian: { carnical: ['A Escrita apaga até a espiral.', 'Você foi escrito pra cair.'] },
  gal_sal: { carnical: ['Corrente no pescoço. Criatura contida.', 'A justiça não olha nos olhos. Por isso funcionou.'] },
  nubi: { carnical: ['A Morte é paciente. Eu também.', 'Volta pro Outro Lado, devagar.'] },
  xande: { carnical: ['Não olhei pra testa, mano! Não olhei!', 'Tacada no crânio! Os Cinco!'] },
  guizo: { carnical: ['GRAVEI UM CARNIÇAL! Ninguém vai acreditar!', 'Eu não olhei pra espiral. Olhei pela câmera!'] },
  lirio: { carnical: ['A Leonora achou o crânio, bah.', 'Bicho grande, marreta maior.'] },
  dalmo: { carnical: ['Fera de arena. Gostei, neném.', 'Na cabeça. É lá que dói.'] },
  aguiar: { carnical: ['Presa do Outro Lado. Rara.', 'Até criatura vira caça.'] },
  jae: { carnical: ['Shh... nem um rosnado.', 'Você nunca me viu. Nem a espiral.'] },
  kemi: { carnical: ['A bala não entrou. Então mirei no crânio.', 'Contrato extra. Monstro abatido.'] },
  labirinto: { carnical: ['Nem a criatura acha a saída.', 'Perdido no labirinto, bicho.'] },
  juan: { carnical: ['Seu sangue nem é sangue. Que nojo.', 'Morte cai pro Sangue. Sempre.'] },
  cristino: { carnical: ['Bicho barulhento. Agora quieto.', 'Lampião queima Lodo também.'] },
  raziel: { carnical: ['Uma besta sem sangue. Não vale a ceia.', 'Garra por garra, a minha é mais antiga.'] },
  arnaldo: { carnical: ['Que figurino horrendo! Fora do palco!', 'O monstro sai pela coxia. Aplausos!'] },
  ferreiro: { carnical: ['Volta pro Santo Berço. A Morte te chamou.', 'Criatura minha não me encara.'] },
  celestine: { carnical: ['Machadinha no crânio. Fácil.', 'Bicho feio! Fica no chão!'] },
  gaius: { carnical: ['Em Roma a gente já via coisa pior.', 'Senta, criatura. Minhas costas doem.'] },
  amalia: { carnical: ['Flecha no crânio. Única entrada.', 'Não olhei. Mirei.'] },
  o_diabo: { carnical: ['Um cão da Morte. Sem pacto pra você.', 'O Sangue queima o Lodo.'] },
  magistrada: { carnical: ['O Equilíbrio sabe onde fica o crânio.', 'Previsto. Eliminado.'] },
  estrangeiro: { carnical: ['Criatura curiosa. Vai esquecer de existir.', 'Sua espiral não funciona em mim.'] },
  amigo: { carnical: ['...o bicho... virou pintura...', '...espiral... na tela... bonita...'] },
};
for (const [w, m] of Object.entries(VICTORY_CARNICAL)) VICTORY_LINES[w] = { ...(VICTORY_LINES[w] || {}), ...m };

// DARA (Os Cinco, a médica de campo): falas de vitória dela contra cada um e de cada um contra ela
const VICTORY_DARA = {
  dara: {
    arthur: ['Fica deitado. Eu dou uma olhada nesse braço depois.', 'Toca uma música calma enquanto descansa, tá?'],
    joui: ['Você corta rápido. Eu remendo mais rápido.', 'Respira. Já passou.'],
    kaiser: ['Menos fumaça, mais cuidado com o pulmão.', 'Pronto. Agora fica quieto que eu te examino.'],
    dante: ['A reza ajuda. O curativo ajuda mais.', 'Descansa. Tá tudo bem.'],
    erin: ['Granada não é brinquedo! Vem cá que eu limpo esse corte.', 'Explodiu tudo e caiu. Clássico.'],
    aghata: ['Sangue eu sei estancar.', 'Fica parada, isso vai arder.'],
    balu: ['Grandão, ainda bem que eu trouxe bastante atadura.', 'O urso dormiu.'],
    verissimo: ['Com todo respeito, senhor: deita.', 'Nem o plano perfeito previu a lanterna.'],
    cristopher: ['Dublê cai bonito. Cai com cuidado também.', 'Eu ajudo a levantar. Daqui a pouco.'],
    kian: ['Escreve aí: a médica venceu.', 'Sua pressão tá alta. Calma.'],
    gal_sal: ['Corrente desarmada. Pulso normal.', 'Justiça e primeiros socorros. Combina.'],
    nubi: ['Você é paciente. Eu sou mais.', 'Fica quietinha. Vou medir seu pulso.'],
    chico: ['Chico, eu falei pra não mexer na fiação!', 'Fica quieto, isso vai doer.'],
    morato: ['Morato, senta aí. Pressão alta de novo.', 'Você não precisa carregar tudo sozinho.'],
    xande: ['Xande! Para de se machucar de propósito!', 'Sem hospital, você prometeu. Mentiroso.'],
    guizo: ['Guizo, larga a câmera e me deixa ver esse joelho.', 'Gravou? Ótimo, agora deita.'],
    lirio: ['Você é a parede. Eu sou quem remenda a parede.', 'Leonora pesada, ombro deslocado. Vem cá.'],
    dara: ['...', '...'],
    dalmo: ['Escafandro rachado. Cabeça inteira. Sorte.', 'Respira devagar aí dentro.'],
    aguiar: ['Caçador sem fôlego. Senta.', 'Eu sei onde dói. É ali.'],
    jae: ['Te achei. A lanterna acha tudo.', 'Silêncio total. Até o pulso.'],
    kemi: ['Tiro bom. Curativo melhor.', 'Fica deitada que eu tiro esse estilhaço.'],
    labirinto: ['Achei a saída. Tava na mochila.', 'Labirinto? Eu tenho mapa.'],
    juan: ['Você gosta de dor. Eu gosto de curar. Empate?', 'Para de rir, isso é sério.'],
    cristino: ['Lampião apagado. Ninguém mais se queima.', 'Calma, eu não faço barulho.'],
    raziel: ['Sangue eu estanco. Até o seu.', 'Nada de mordida hoje.'],
    arnaldo: ['O show acabou. Respira.', 'Que dramático. Fica deitado.'],
    ferreiro: ['Gigante. Muita atadura.', 'Santo Berço precisa de uma médica.'],
    celestine: ['Machadinha guardada. Pulso firme.', 'Fica quieta, eu cuido disso.'],
    gaius: ['Suas costas, senhor. Eu vi. Deita.', 'Repouso absoluto. Ordem médica.'],
    amalia: ['Arqueira, seu ombro tá travado. Alonga depois.', 'Mira boa. Reflexo ruim.'],
    o_diabo: ['Pacto nenhum. Só curativo.', 'Nem o Diabo escapa da lanterna.'],
    magistrada: ['Você previu tudo. Menos eu.', 'Equilíbrio é bom. Repouso também.'],
    estrangeiro: ['Isso é pelo Morato.', 'Volta pro seu sinal. A gente fica.'],
    amigo: ['Tinta não estanca com atadura. Que nojo.', 'Vai pra casa, desenho.'],
    carnical: ['Lanterna no crânio. Achei o ponto fraco.', 'Não olhei pra espiral. Olhei pro raio-X.'],
  },
  arthur: { dara: ['Desculpa, doutora. Eu também sei me virar.', 'Uma médica no chão. Péssimo sinal.'] },
  joui: { dara: ['Você não precisa curar ninguém hoje.', 'Corte limpo. Fácil de suturar.'] },
  kaiser: { dara: ['A médica ficou sem paciente. Eu tô ótimo.', 'Lanterna contra fuzil? Coragem.'] },
  dante: { dara: ['Que sua aura descanse, médica.', 'Cura os outros. Eu cuido de você.'] },
  erin: { dara: ['KABOOM! Cura isso, doutora!', 'Explosão vence curativo!'] },
  aghata: { dara: ['Sangue que você não estancou.', 'Mais uma página: a médica.'] },
  balu: { dara: ['Ô doutora, desculpa! Machadada sem querer!', 'Hahaha! Pega a atadura!'] },
  verissimo: { dara: ['Uma boa médica. Uma lutadora em formação.', 'Treine mais. Vai chegar lá.'] },
  cristopher: { dara: ['Calma, eu sei cair. Você também vai aprender.', 'Corta! Chama a médica! Ah, é você.'] },
  kian: { dara: ['A Escrita não tem cura.', 'Remendo nenhum fecha isso.'] },
  gal_sal: { dara: ['Presa. Com todo o respeito.', 'A justiça também machuca.'] },
  nubi: { dara: ['Você corre demais, menina. Respira.', 'O tempo cura. Devagar.'] },
  xande: { dara: ['Foi mal, Dara! Foi treino, juro!', 'Os Cinco treinando! Bora de novo!'] },
  guizo: { dara: ['DARA! Desculpa! Eu gravei, mas desculpa!', 'Eu já sabia que ia acertar.'] },
  lirio: { dara: ['Bah, Dara, desculpa! A Leonora escorregou.', 'Levanta, guria. A parede te protege.'] },
  dalmo: { dara: ['Médica de campo? A arena é meu campo, neném.', 'Volta pra ambulância.'] },
  aguiar: { dara: ['Presa pequena. Corre bem.', 'Caçada rápida.'] },
  jae: { dara: ['Shh... lanterna desligada.', 'Você nunca me iluminou.'] },
  kemi: { dara: ['Nada pessoal, médica.', 'Contrato fechado. Desculpa.'] },
  labirinto: { dara: ['Mapa nenhum sai daqui.', 'Perdida, doutora.'] },
  juan: { dara: ['Me cura? Não, me bate de novo!', 'Sangue demais pra uma atadura.'] },
  cristino: { dara: ['Médica quieta. Gostei.', 'Lampião ilumina mais que lanterna.'] },
  raziel: { dara: ['Sangue de médica. Cuidadoso.', 'Curar é inútil na minha ceia.'] },
  arnaldo: { dara: ['A enfermeira sai de cena! Aplausos!', 'Bravo, doutora. Mas o show é meu.'] },
  ferreiro: { dara: ['Santo Berço não precisa de médicos.', 'A Morte não se cura.'] },
  celestine: { dara: ['Desculpa, doutora. Nada pessoal.', 'Fica, gata. Quer dizer, fica deitada.'] },
  gaius: { dara: ['Uma médica! Olha minhas costas depois?', 'Ah, a juventude. Senta, menina.'] },
  amalia: { dara: ['Flecha de longe. Lanterna não alcança.', 'Desculpa. Mira.'] },
  o_diabo: { dara: ['Um pacto e você cura qualquer um.', 'O Sangue não fecha com atadura.'] },
  magistrada: { dara: ['O Equilíbrio não precisa de médicos.', 'Previsto. Como tudo.'] },
  estrangeiro: { dara: ['Ninguém vai lembrar da médica. Nem do Morato.', 'Sinal perdido, doutora.'] },
  amigo: { dara: ['...a moça da lanterna... virou pintura...', '...atadura... de tinta...'] },
  carnical: { dara: ['(fareja a bolsa de remédios e rosna)', '...MÉDICA... DURMA...'] },
};
delete VICTORY_DARA.dara.dara;
VICTORY_DARA.morato = { dara: ['Boa, Dara. Mas não baixa a guarda pra cuidar de mim.', 'Ninguém fica pra trás. Nem você.'] };

// MORATO (Os Cinco, o líder): cansado, firme, protetor; ex-Ordo Realitas
const VICTORY_MORATO = {
  morato: {
    arthur: ['A Ordem treina bem. Eu treinei melhor.', 'Levanta, garoto. Tem Alheio lá fora.'],
    joui: ['Rápido. Mas eu já vi coisa mais rápida.', 'Sombra não assusta quem já viu o Outro Lado.'],
    kaiser: ['Soldado bom. Precisa de um líder melhor.', 'Fumaça não me cega.'],
    dante: ['Fé não basta. Precisa de plano.', 'Descansa, padre.'],
    erin: ['Explosão bonita. Agora limpa isso.', 'Calma, menina. Respira.'],
    aghata: ['Sangue eu já vi demais.', 'Guarda essa adaga.'],
    balu: ['Grandão, eu já derrubei maiores.', 'Tamo com ele. Até você.'],
    verissimo: ['A Ordem me expulsou. Agora entende por quê.', 'Estratégia boa, Veríssimo. A minha foi melhor.'],
    cristopher: ['Cai bonito. Agora levanta.', 'Dublê? Eu chamo de saco de pancada.'],
    kian: ['A Escrita não segura um soco.', 'Pena que o Conhecimento não te ensinou a apanhar.'],
    gal_sal: ['Justiça é proteger os seus.', 'Corrente quebra. Família não.'],
    nubi: ['Paciência eu tenho. Muita.', 'A Morte espera. Eu também.'],
    xande: ['Xande, guarda alta! Quantas vezes eu falo?', 'Bom. Mas fica do meu lado na próxima.'],
    guizo: ['Guizo, larga a câmera e luta.', 'Eu sei que você já sabia. Mas apanhou igual.'],
    lirio: ['Lírio, a Leonora é forte. Você precisa ser mais.', 'Boa parede. Mas eu sou o portão.'],
    dara: ['Dara, primeiro você. Depois os outros.', 'Treino acabou. Pode me remendar.'],
    chico: ['Chico, menos fita, mais guarda.', 'Bom improviso. Agora volta pra van.'],
    dalmo: ['Escafandro não te protege de mim.', 'Fim de linha.'],
    aguiar: ['Caçador caçado.', 'Eu caço Alheio há anos.'],
    jae: ['Te ouvi chegar.', 'Sombra não engana agente velho.'],
    kemi: ['Mercenária boa. Lado errado.', 'Abaixa a arma.'],
    labirinto: ['Já saí de coisa pior que você.', 'Mapa na cabeça.'],
    juan: ['Ri agora.', 'Você é tudo que eu combato.'],
    cristino: ['Barulho é comigo mesmo.', 'Apaga o lampião.'],
    raziel: ['Vampiro, Alheio, tanto faz. Cai igual.', 'Sem sangue hoje.'],
    arnaldo: ['O show acabou.', 'Sai do palco.'],
    ferreiro: ['Santo Berço é mais um culto.', 'Já derrubei gigantes.'],
    celestine: ['Machadinha pequena pra mim.', 'Vai pra casa.'],
    gaius: ['Velho contra velho. Ganhou o mais teimoso.', 'Respeito. Mas cai.'],
    amalia: ['Flecha eu desvio.', 'Mira boa. Não o bastante.'],
    o_diabo: ['Eu não faço pacto.', 'Nem o Diabo me separa dos meus.'],
    magistrada: ['Equilíbrio? Eu escolho um lado: o dos meus.', 'Previu isso também?'],
    estrangeiro: ['Dessa vez quem ficou foi você.', 'Os Cinco estão salvos. É o que importa.'],
    amigo: ['Que coisa é você?', 'Desenho apagado.'],
    carnical: ['Corpo fechado. Mente aberta pra porrada.', 'Alheio no chão.'],
  },
  arthur: { morato: ['Ex-agente? Agora ex-lutador.', 'A Ordem manda lembranças.'] },
  joui: { morato: ['Cansado demais, velho.', 'A sombra foi mais rápida.'] },
  kaiser: { morato: ['Liderança não segura fuzil.', 'Abaixo, comandante.'] },
  dante: { morato: ['Descansa, irmão. Você carrega demais.', 'Que a luz te guie.'] },
  erin: { morato: ['KABOOM! Desculpa, tio!', 'Explodi o chefe!'] },
  aghata: { morato: ['Sangue de líder é mais forte. E mais doce.', 'Mais uma página.'] },
  balu: { morato: ['Hahaha! Machadada no chefe!', 'Respeito, grandão. Mas eu ganhei.'] },
  verissimo: { morato: ['A Ordem acertou em te expulsar.', 'Disciplina, Morato. Sempre faltou.'] },
  cristopher: { morato: ['Caiu como dublê!', 'Corta! Tá ótimo!'] },
  kian: { morato: ['Essa cicatriz é Conhecimento. Eu sei ler.', 'A Escrita te conhece.'] },
  gal_sal: { morato: ['Justiça, ex-agente.', 'Preso.'] },
  nubi: { morato: ['Paciência vence cansaço.', 'Descansa.'] },
  xande: { morato: ['Morato! Eu ganhei! Viu? Viu?!', 'Desculpa, chefe! Tava treinando!'] },
  guizo: { morato: ['Eu já sabia, Morato. Desculpa.', 'Gravei! O chefe no chão!'] },
  lirio: { morato: ['Bah, Morato! A Leonora pediu desculpa!', 'Levanta, chefe. A parede te cobre.'] },
  dalmo: { morato: ['O líder caiu. O resto cai junto.', 'Arena minha.'] },
  aguiar: { morato: ['Presa velha.', 'Caçada boa.'] },
  jae: { morato: ['Shh, comandante.', 'Nem viu.'] },
  kemi: { morato: ['Nada pessoal, chefe.', 'Contrato cumprido.'] },
  labirinto: { morato: ['Perdido, líder.', 'Ninguém sai daqui.'] },
  juan: { morato: ['Que olhar cansado! Hahaha!', 'Sangue de líder!'] },
  cristino: { morato: ['Barulhento demais.', 'Fica quieto.'] },
  raziel: { morato: ['Sangue velho, mas serve.', 'Fraco.'] },
  arnaldo: { morato: ['O líder saiu do show!', 'Bravo!'] },
  ferreiro: { morato: ['Santo Berço te leva.', 'A Morte te espera.'] },
  celestine: { morato: ['Nada pessoal, tio.', 'Cortei.'] },
  gaius: { morato: ['Lutou bem, soldado.', 'Roma respeita os líderes.'] },
  amalia: { morato: ['Flecha no alvo.', 'Mira certa.'] },
  o_diabo: { morato: ['Um pacto e eles vivem pra sempre.', 'Que proteção bonita. Que pena.'] },
  magistrada: { morato: ['O Equilíbrio cobra os sacrifícios.', 'Previsto.'] },
  estrangeiro: { morato: ['De novo, Morato. Sempre de novo.', 'Seu sacrifício é meu.'] },
  amigo: { morato: ['...protetor... pintado...', '...o líder... no papel...'] },
  carnical: { morato: ['(rosna sobre o líder caído)', '...LÍDER... CAIU...'] },
};
for (const [w, m] of Object.entries(VICTORY_MORATO)) VICTORY_LINES[w] = { ...(VICTORY_LINES[w] || {}), ...m };

// CHICO (Os Cinco, o técnico): nerd, nervoso, engraçado e cheio de gambiarra
const VICTORY_CHICO = {
  chico: {
    arthur: ['Que guitarra! Posso ver os captadores? Depois. Quando você levantar.', 'Desculpa! Foi o scanner que mandou!'],
    joui: ['Eu não vi o corte. O scanner viu.', 'Sombra tem frequência também, sabia?'],
    kaiser: ['Fumaça atrapalha o sinal, cara.', 'Analisei, achei o bug, consertei. Você.'],
    dante: ['Sua aura dá um pico lindo no scanner.', 'Descansa aí, eu vigio.'],
    erin: ['Granada não é gambiarra! Ou é? Me ensina depois.', 'O barulho estourou meus fones.'],
    aghata: ['Sangue dá interferência. Eca.', 'Fita resolve tudo. Até isso.'],
    balu: ['Desculpa, Balu! O farol tava no máximo!', 'Urso desligado. Reinicia depois.'],
    verissimo: ['Senhor, com todo o respeito: o plano B era eu.', 'Estratégia boa. Gambiarra melhor.'],
    cristopher: ['Dublê! Posso filmar você caindo de novo?', 'Corta! Ficou ótimo!'],
    kian: ['Escreveu, mas eu desliguei o teclado.', 'Escrita? Eu tenho fita isolante.'],
    gal_sal: ['Corrente não conduz bem. Ponto pra mim.', 'Justiça e tecnologia. Parceria.'],
    nubi: ['Seu tempo lagou. O meu não.', 'Paciência é bom. Ping baixo é melhor.'],
    xande: ['Xande! Para de subir na van!', 'Os Cinco, mano! Bora pra casa!'],
    guizo: ['Guizo, você gravou? Gravou, né? Me manda!', 'A câmera tava sem bateria. Eu sabia.'],
    lirio: ['Lírio, a Leonora amassou meu radar!', 'Parede derrubada. Desculpa, cara.'],
    dara: ['Dara, me remenda depois? Eu te devo uma.', 'Foi treino! Não conta pro Morato!'],
    dalmo: ['Escafandro com defeito. Eu conserto. Por um preço.', 'Arena desligada.'],
    aguiar: ['Caçador com sinal fraco.', 'Rastreei primeiro.'],
    jae: ['Te achei no scanner. Sombra não esconde Energia.', 'Silêncio total. Até no rádio.'],
    kemi: ['Mira boa. Firmware melhor.', 'Foi mal, contrato cancelado.'],
    labirinto: ['Labirinto? Eu baixei o mapa.', 'Achei a saída pelo GPS.'],
    juan: ['Cara, você ri demais. Dá medo.', 'Sangue no meu macacão! Sério?'],
    cristino: ['Lampião é tecnologia antiga, mano.', 'Sem barulho. Eu prometo.'],
    raziel: ['Vampiro tem sinal? Tem. Achei.', 'Nada de mordida. O farol queimou.'],
    arnaldo: ['Fim do show! Desliguei as luzes.', 'Que relógio bonito. Posso abrir?'],
    ferreiro: ['Gigante desligado. Precisa de fita.', 'Santo Berço precisa de wi-fi.'],
    celestine: ['Machadinha com bateria fraca.', 'Desculpa, foi o reflexo do óculos.'],
    gaius: ['Senhor, isso é velho. Tipo, muito velho.', 'Roma não tinha scanner. Ponto pra mim.'],
    amalia: ['Flecha não aparece no scanner. Mas você sim.', 'Mira boa. Antena melhor.'],
    o_diabo: ['Nem o Diabo tem sinal aqui.', 'Pacto? Eu leio os termos primeiro.'],
    magistrada: ['Previu tudo, menos a gambiarra.', 'Equilíbrio? Eu tenho fita.'],
    estrangeiro: ['Seu sinal caiu. De vez. Isso foi pelo Morato.', 'Transmissão encerrada.'],
    amigo: ['Tinta não conduz! Eca!', 'Desenho desligado.'],
    carnical: ['Corpo fechado, mas o farol entra.', 'Não olhei pra espiral! Olhei pro scanner!'],
  },
  arthur: { chico: ['Foi mal, Chico. Toca uma pra mim depois.', 'Bom equipamento. Pena.'] },
  joui: { chico: ['Seu scanner não viu a sombra.', 'Rápido demais pra máquina.'] },
  kaiser: { chico: ['Mexe com tecnologia? Eu mexo com fuzil.', 'Sinal perdido, nerd.'] },
  dante: { chico: ['Que sua máquina descanse.', 'A fé não precisa de bateria.'] },
  erin: { chico: ['KABOOM! Conserta isso!', 'Explodi sua antena! Foi mal! Não foi!'] },
  aghata: { chico: ['Seu sangue é tão nerd quanto você.', 'Mais uma página: o técnico.'] },
  balu: { chico: ['Hahaha! Machadada no rádio!', 'Desculpa, baixinho!'] },
  verissimo: { chico: ['Engenhoso. Falta disciplina.', 'Um bom técnico vale um esquadrão. Treine.'] },
  cristopher: { chico: ['Peguei a câmera! Brincadeira, só você.', 'Eu sei cair. Você vai aprender.'] },
  kian: { chico: ['A Escrita não precisa de fio.', 'Conexão negada.'] },
  gal_sal: { chico: ['Preso. Com toda a sua tralha.', 'A justiça é analógica.'] },
  nubi: { chico: ['Seu ritmo é rápido demais, menino.', 'Respira. Desliga a máquina.'] },
  xande: { chico: ['Foi mal, Chico! Eu pago a fita!', 'Os Cinco treinando! Bora de novo!'] },
  guizo: { chico: ['GRAVEI TUDO! Bug nenhum!', 'Eu já sabia que o farol ia falhar.'] },
  lirio: { chico: ['Bah, Chico, desculpa! A Leonora não gosta de máquina.', 'Levanta, guri. A parede te cobre.'] },
  dara: { chico: ['Chico, fica parado que eu te remendo.', 'Foi só um galo. Para de chorar.'] },
  dalmo: { chico: ['Volta pra van, neném.', 'Máquina nenhuma segura a arena.'] },
  aguiar: { chico: ['Presa que fala demais.', 'Caçada fácil.'] },
  jae: { chico: ['Shh... desliga o rádio.', 'Seu scanner nunca me pegou.'] },
  kemi: { chico: ['Nada pessoal, técnico.', 'Pólvora não trava.'] },
  labirinto: { chico: ['GPS nenhum sai daqui.', 'Perdido, técnico.'] },
  juan: { chico: ['Me liga de novo! Dói mais!', 'Seu macacão ficou vermelho.'] },
  cristino: { chico: ['Barulhento. Agora quieto.', 'Lampião não precisa de bateria.'] },
  raziel: { chico: ['Sangue com gosto de bateria.', 'Fraco. Como o seu sinal.'] },
  arnaldo: { chico: ['O técnico de luz saiu de cena!', 'Bravo! Mas o holofote é meu.'] },
  ferreiro: { chico: ['Santo Berço não precisa de máquinas.', 'A Morte não tem conserto.'] },
  celestine: { chico: ['Nada pessoal, nerd.', 'Cortei o fio. Ops.'] },
  gaius: { chico: ['Na minha época era tudo no braço.', 'Senta, rapaz. Descansa a engenhoca.'] },
  amalia: { chico: ['Flecha não tem fio.', 'Mira. Não máquina.'] },
  o_diabo: { chico: ['Um pacto e eu te dou sinal pra sempre.', 'Sangue queima circuito.'] },
  magistrada: { chico: ['O Equilíbrio é melhor que qualquer máquina.', 'Previsto. Desligado.'] },
  estrangeiro: { chico: ['Seu sinal é meu, técnico.', 'Ninguém vai lembrar do Chico.'] },
  amigo: { chico: ['...a máquina... virou pintura...', '...fio... de tinta...'] },
  carnical: { chico: ['(rosna para a luz do farol)', '...MÁQUINA... PARE...'] },
};
VICTORY_CHICO.chico.morato = ['Desculpa, Morato! Foi o farol! Juro!', 'Treino é treino, chefe.'];
VICTORY_CHICO.morato = { chico: ['Bom trabalho, Chico. Agora conserta a van.', 'Menos gambiarra, mais guarda.'] };
VICTORY_CHICO.dara = { ...(VICTORY_CHICO.dara || {}) };
for (const [w, m] of Object.entries(VICTORY_CHICO)) VICTORY_LINES[w] = { ...(VICTORY_LINES[w] || {}), ...m };
for (const [w, m] of Object.entries(VICTORY_DARA)) VICTORY_LINES[w] = { ...(VICTORY_LINES[w] || {}), ...m };

// CARINA LEONE (Ordo Realitas, Equipe Abutres): fria, direta, mercenária; carrega o nome dos Leone. Próxima do Balu, do
// Joui e do Arthur; inimiga do Diabo; tomou os rituais do Kian com o grimório completo (wiki)
const VICTORY_CARINA = {
  carina: {
    arthur: ['Levanta, Arthur. Abutre não fica no chão.', 'Você ainda abre a guarda pra esquerda. Eu avisei.'],
    joui: ['Sua katana é rápida, Joui. Eu já sabia pra onde ela ia.', 'Treino bom. Amanhã de novo.'],
    kaiser: ['Fumaça não esconde o ombro que você vai mexer.', 'Guarda o fuzil, Kaiser. Perto assim ele não serve.'],
    dante: ['Reza depois, Dante. Agora levanta.', 'Seu baralho não previu o nunchaku.'],
    erin: ['Granada é barulho. Eu prefiro silêncio.', 'Explodiu tudo e errou eu. De novo.'],
    aghata: ['Ritual demora. Faca no olho, não.', 'Guarda esse livro. Eu já tenho o meu.'],
    balu: ['Valeu por segurar, grandão. Agora deita um pouco.', 'Calma, Balu. Foi só treino. Quase.'],
    verissimo: ['Com todo respeito, senhor: eu vi o plano antes.', 'Comandante no chão. Ninguém vai saber por mim.'],
    cristopher: ['Dublê cai bonito. Eu derrubo melhor.', 'Corta. Cena encerrada.'],
    kian: ['Seus rituais agora são meus, Kian. O grimório tá completo.', 'Escreve aí: os Leone venceram.'],
    gal_sal: ['Corrente quebrada. Prisão nenhuma me segura.', 'Justiça? Eu cobro por hora.'],
    nubi: ['Paciência é boa. Precognição é melhor.', 'O tempo passou devagar. Pra você.'],
    xande: ['Skate não é escudo, moleque.', 'Cai, levanta, cai. Já entendi.'],
    guizo: ['Grava isso: perdeu pros Leone.', 'Sua câmera filmou meu nunchaku. Ótimo.'],
    lirio: ['Martelo pesado. Eu sou mais rápida.', 'Parede caída, Lírio.'],
    dara: ['Remenda a si mesma primeiro, doutora.', 'Desculpa. Foi limpo, pelo menos.'],
    chico: ['Desliga o scanner. Eu não deixo rastro.', 'Gambiarra não para faca.'],
    morato: ['Líder bom. Ainda assim, no chão.', 'Os Cinco treinam. Os Leone matam.'],
    dalmo: ['Grande. Lento. Previsível.', 'Arena é sua. A luta foi minha.'],
    aguiar: ['Caçador virou alvo.', 'Máscara não esconde o golpe que vem.'],
    jae: ['Shh também. Eu sei andar no escuro.', 'Te vi antes de você sumir.'],
    kemi: ['Bala abafada contra bala abafada. A minha chegou antes.', 'Nada pessoal. É contrato.'],
    labirinto: ['Labirinto? Eu já sabia a saída.', 'Elmo bonito. Abre fácil.'],
    juan: ['Gosta de dor? Toma mais.', 'Para de rir no chão.'],
    cristino: ['Apaga esse lampião. Acabou.', 'Cangaço não para nunchaku.'],
    raziel: ['Vampiro lento é vampiro morto.', 'Mordida nenhuma hoje.'],
    arnaldo: ['O show acabou. Ninguém aplaudiu.', 'Sua finta é teatro. A minha é sério.'],
    ferreiro: ['Espada enorme. Golpe óbvio.', 'Santo Berço caiu. Faz silêncio.'],
    celestine: ['Traição eu enxergo de longe.', 'Nada pessoal, Celestine. É dinheiro.'],
    gaius: ['Velho de Roma, sentado. Respeito.', 'Seus jogos acabaram há dois mil anos.'],
    amalia: ['Flecha boa. Eu vi ela sair.', 'Mira linda. Reflexo meu.'],
    o_diabo: ['Isso é por todos os Leone.', 'Volta pro inferno. Eu sigo viva.'],
    magistrada: ['Você previu. Eu previ antes.', 'Equilíbrio quebrado, Magistrada.'],
    estrangeiro: ['Seu sinal não entra na minha cabeça.', 'Ninguém esquece um Leone.'],
    amigo: ['Desenho feio. Rasguei.', 'Volta pro papel.'],
    carnical: ['Não olhei pra espiral. Olhei pra garganta.', 'Morto de novo. Fica.'],
  },
  arthur: { carina: ['Desculpa, Carina! Foi treino, juro.', 'Te peguei uma vez. Vou lembrar disso pra sempre.'] },
  joui: { carina: ['Você leu o corte. Eu mudei no meio.', 'Treino bom. Amanhã você ganha.'] },
  kaiser: { carina: ['Mercenária boa. Sem contrato hoje.', 'Rápida. Mas fumaça não tem guarda.'] },
  dante: { carina: ['Os Leone descansam hoje, Carina.', 'Peça encerrada. Você foi bem.'] },
  erin: { carina: ['KABOOM! Previu isso aí?', 'Precognição não lê explosão!'] },
  aghata: { carina: ['Seus rituais vieram do livro errado.', 'Mais uma página: a Leone.'] },
  balu: { carina: ['Ô Carina, desculpa! O machado escorregou!', 'Hahaha! Calma, calma, deixa o tio Balu te levantar.'] },
  verissimo: { carina: ['Disciplina vence velocidade, agente.', 'Bom reflexo. Treine a paciência.'] },
  cristopher: { carina: ['Eu sei cair. Você vai aprender também.', 'Corta! Cena do nunchaku, de novo!'] },
  kian: { carina: ['Você tem o grimório. Eu tenho a Escrita.', 'Devolve meus rituais, Leone.'] },
  gal_sal: { carina: ['Presa. Mercenária ou não.', 'A justiça não aceita pagamento.'] },
  nubi: { carina: ['Você vê antes. Eu espero mais.', 'Devagar, menina. Respira.'] },
  xande: { carina: ['Caramba, Carina! Ganhei de uma Abutre!', 'Bora de novo? Eu deixo você girar primeiro.'] },
  guizo: { carina: ['Gravei! Precognição nenhuma vê a câmera.', 'Eu já sabia que ia acertar.'] },
  lirio: { carina: ['Bah, guria, rápida demais. Mas a Leonora pegou.', 'Levanta. A parede segura.'] },
  dara: { carina: ['Fica parada que eu olho esse supercílio.', 'Desculpa, Carina. Respira.'] },
  chico: { carina: ['Peguei no scanner! Tu era um pico enorme!', 'Desculpa! Foi o farol!'] },
  morato: { carina: ['Abutre rápida. Mas eu vi coisa pior.', 'Levanta, Leone. Tem Alheio lá fora.'] },
  dalmo: { carina: ['Volta pro canto, neném.', 'Nunchaku contra escafandro? Coragem.'] },
  aguiar: { carina: ['Presa rápida. Caçada boa.', 'Corre bem. Cai igual.'] },
  jae: { carina: ['Shh... você não me viu.', 'Precognição não ouve sussurro.'] },
  kemi: { carina: ['Nada pessoal, Leone. Contrato.', 'Silenciador bom. O meu é melhor.'] },
  labirinto: { carina: ['Saída nenhuma, Leone.', 'Perdida no meu caminho.'] },
  juan: { carina: ['Mais! Bate mais, Leone!', 'Seu nunchaku ficou vermelho.'] },
  cristino: { carina: ['Moça brava. Agora quieta.', 'O lampião viu você chegar.'] },
  raziel: { carina: ['Sangue Leone. Raro.', 'Rápida. Eu sou mais.'] },
  arnaldo: { carina: ['A dançarina sai de cena! Aplausos!', 'Finta boa. A minha tem plateia.'] },
  ferreiro: { carina: ['A Morte não erra o golpe.', 'Santo Berço não precisa de mercenários.'] },
  celestine: { carina: ['Nada pessoal, gata. Ou quase.', 'Traição você vê. Machadinha não.'] },
  gaius: { carina: ['Lutadora boa. Em Roma você ia longe.', 'Senta, menina. Os jogos acabaram.'] },
  amalia: { carina: ['Flecha longe. Faca não chega.', 'Desculpa. Mira.'] },
  o_diabo: { carina: ['Mais uma Leone. A família inteira é minha.', 'Os Leone vivem dentro de você? Então morrem juntos.'] },
  magistrada: { carina: ['Você vê o próximo segundo. Eu vejo tudo.', 'Previsto. Como os Leone.'] },
  estrangeiro: { carina: ['Ninguém vai lembrar da última Leone.', 'Sinal perdido, mercenária.'] },
  amigo: { carina: ['...a moça do bastão... virou pintura...', '...leão... de tinta...'] },
  carnical: { carina: ['(rosna para o nunchaku caído) ...FIQUE...', '...LEONE... DURMA...'] },
};
for (const [w, m] of Object.entries(VICTORY_CARINA)) VICTORY_LINES[w] = { ...(VICTORY_LINES[w] || {}), ...m };

// RUBENS NALUTI (Ordo Realitas, Equipe Abutres): fala por PALAVRAS-CHAVE, fechado e sério, medroso mas firme; o
// paramédico da equipe. Amigo do Balu (Rubinho/Rubão), respeita o Arthur, confia na Carina; o Joui deu a vitória a ele nos
// jogos; esteve no corpo da Amalia; odeia o Anfitrião (os jogos, o Johnny). Apelidos da Erin: Baixinho, Capitão Sucinto,
// Homem-Hashtag (wiki)
const VICTORY_RUBENS = {
  rubens: {
    arthur: ['Líder. No chão. Levanta, Arthur.', 'Treino. Guarda. Esquerda.'],
    joui: ['Você me deixou ganhar uma vez. Agora foi de verdade.', 'Katana. Rápida. Eu, mais.'],
    kaiser: ['Fumaça. Atrás. Pronto.', 'Mira boa. A minha também.'],
    dante: ['Baralho. Errado. Desculpa, Dante.', 'Ritual longo. Martelo curto.'],
    erin: ['Barulho demais. Silenciador.', 'Pouca-Sombra ganhou, Erin.'],
    aghata: ['Livro. Fechado. Acabou.', 'Sangue? Amuleto. Não pega.'],
    balu: ['Rubão ganhou. Só hoje, Balu.', 'Respira, grandão. Eu cuido. Paramédico.'],
    carina: ['Treino. Empate técnico. Quase.', 'Você previu. Eu teleportei.'],
    verissimo: ['Senhor. Missão cumprida.', 'Estratégia. Palavras-chave. Funciona.'],
    cristopher: ['Dublê. Caiu. Corta.', 'Cena encerrada. Sem plateia.'],
    kian: ['Anel. Colocado. Fim.', 'Pescoço inteiro. Desta vez, o meu.'],
    gal_sal: ['Corrente. Solta. Eu sumo.', 'Justiça? Sorte.'],
    nubi: ['Calma. Mira. Tiro.', 'Paciência minha é maior.'],
    xande: ['Skate. Rápido. Martelo, mais.', 'Levanta. Joelho ralado só.'],
    guizo: ['Câmera. Desliga.', 'Sem gravação. Por favor.'],
    lirio: ['Leonora pesada. Eu, leve.', 'Bah. Venci, guri.'],
    dara: ['Colega. Vou tratar você agora.', 'Ferimento leve. Eu sei.'],
    chico: ['Gambiarra. Fio. Cobre. Solto.', 'Seu scanner? Eu desligo.'],
    morato: ['Os Cinco. Um a menos.', 'Líder bom. Teimoso.'],
    dalmo: ['Escafandro. Lento.', 'Grande. Cai igual.'],
    aguiar: ['Caçador. Eu sumi.', 'Rastro nenhum. Salto Fantasma.'],
    jae: ['Shh. Aprendi.', 'No escuro também eu vejo.'],
    kemi: ['Glock contra rifle. Perto ganha.', 'Queima-roupa. Desculpa.'],
    labirinto: ['Labirinto? Teleporte.', 'Saída. Sempre tem uma.'],
    juan: ['Ódio. Gasta muito. Eu economizo.', 'Para, Henri. Acabou.'],
    cristino: ['Lampião. Apagado.', 'Cangaço. Fim de jogo.'],
    raziel: ['Vampiro. Martelo. Fim.', 'Mordida? Não hoje.'],
    arnaldo: ['Jogo encerrado. Eu voltei. E vou continuar voltando.', 'Sem plateia. Sem botão. Sem você.'],
    ferreiro: ['A Morte errou. De novo.', 'Santo Berço. Silêncio.'],
    celestine: ['Traição. Previsível.', 'Machadinha. Desviei.'],
    gaius: ['Roma acabou. Faz tempo.', 'Seus jogos. Segundo lugar? Não hoje.'],
    amalia: ['Amalia. Eu já fui você. Sei como mira.', 'Flecha. Desviei. Foi mal.'],
    o_diabo: ['Porta fechada. Desta vez.', 'Pacto? Recuso.'],
    magistrada: ['Previu? Eu também. Teleportei.', 'Equilíbrio. Quebrado.'],
    estrangeiro: ['Sinal. Interferência. Eu sou de Energia.', 'Lembrar? Eu lembro de tudo.'],
    amigo: ['Desenho. Rasgado.', 'Tinta. Seca.'],
    carnical: ['Espiral? Não olho. Atiro.', 'Morto. Fica.'],
  },
  arthur: { rubens: ['Foi mal, Rubinho! Levanta aí, parceiro.', 'Te protejo, mas hoje era treino.'] },
  joui: { rubens: ['...Você tá bem, Rubens? (abraça)', 'Treino. Você vai melhor amanhã.'] },
  kaiser: { rubens: ['Pequeno e rápido. Não o bastante.', 'Teleporte bonito. Fumaça mais.'] },
  dante: { rubens: ['A peça te poupou, Rubens.', 'Descansa. A Ordem precisa do seu cérebro.'] },
  erin: { rubens: ['KABOOM, Baixinho! Capitão Sucinto no chão!', 'Homem-Hashtag desligado!'] },
  aghata: { rubens: ['Seu amuleto segurou. Meu ritual não.', 'Pequeno. Corajoso. Caiu.'] },
  balu: { rubens: ['Ô Rubão, desculpa! Te levanto no colo!', 'Hahaha! Rubinho, calma, calma, foi treino!'] },
  carina: { rubens: ['Desculpa, Rubens. Levanta, parceiro.', 'Eu vi o teleporte antes.'] },
  verissimo: { rubens: ['Agente Naluti: mais pernas, menos teleporte.', 'Disciplina, Rubens.'] },
  cristopher: { rubens: ['Caiu bonito. Quer dica de dublê?', 'Corta! De novo, baixinho.'] },
  kian: { rubens: ['O anel não entra, Rubens.', 'Seu pescoço quase. Da próxima.'] },
  gal_sal: { rubens: ['Preso. Sem salto.', 'Correntes não deixam teleportar.'] },
  nubi: { rubens: ['Paciência, menino. Respira.', 'Devagar demais. Ou rápido. Tanto faz.'] },
  xande: { rubens: ['Desculpa, cara! Quer uma mão?', 'Rubens! Ganhei de um Abutre!'] },
  guizo: { rubens: ['Gravei o teleporte! Viralizou!', 'Faz de novo pra câmera?'] },
  lirio: { rubens: ['Bah, piá pequeno, mas teimoso.', 'A Leonora não erra o alvo baixo.'] },
  dara: { rubens: ['Deixa eu ver esse peito... esses cabos...', 'Médico com médico. Respeito.'] },
  chico: { rubens: ['Fio, cobre... solto! Peguei teu jeito!', 'Teu cabo do peito apareceu no scanner!'] },
  morato: { rubens: ['Abutre pequeno. Coração grande.', 'Levanta. Tem Alheio lá fora.'] },
  dalmo: { rubens: ['Volta pro canto, pequenino.', 'Martelo contra escafandro? Corajoso.'] },
  aguiar: { rubens: ['Presa pequena. Escorregadia.', 'Pegou o rastro? Eu peguei você.'] },
  jae: { rubens: ['Shh... você não me viu, pequeno.', 'Teleporte não engana sussurro.'] },
  kemi: { rubens: ['Nada pessoal, Naluti.', 'Glock contra sniper. Perdeu.'] },
  labirinto: { rubens: ['Teleportou pra dentro do meu labirinto.', 'Saída nenhuma, Naluti.'] },
  juan: { rubens: ['Mais! Bate mais, baixinho!', 'Ódio contra teleporte. Ódio venceu.'] },
  cristino: { rubens: ['Cabra pequeno, mas valente.', 'O lampião achou você.'] },
  raziel: { rubens: ['Sangue de Energia. Diferente.', 'Rápido. Eu sou mais.'] },
  arnaldo: { rubens: ['Rubens Naluti! O jogador que SEMPRE volta! Aplausos!', 'Terceiro jogo, Rubens. E o Johnny? Ah, é.'] },
  ferreiro: { rubens: ['A Morte alcança quem teleporta.', 'Ninguém foge do Santo Berço.'] },
  celestine: { rubens: ['Pequeno demais pra ser ameaça, gato.', 'Machadinha acha qualquer altura.'] },
  gaius: { rubens: ['Amalia de novo? Ah, não. Só o menino.', 'Segundo lugar, como sempre.'] },
  amalia: { rubens: ['Você esteve no meu corpo. Sei como você pensa.', 'Mira melhor que a sua. Era a minha.'] },
  o_diabo: { rubens: ['Abriu a porta pra mim, Naluti.', 'Coração pulsante? Agora é meu.'] },
  magistrada: { rubens: ['Previsto. Pequeno e previsto.', 'Seu salto acabou aqui.'] },
  estrangeiro: { rubens: ['Ninguém vai lembrar do baixinho.', 'Sinal perdido, Rubens.'] },
  amigo: { rubens: ['...menino de cabelo branco... virou desenho...', '...fio... cobre... tinta...'] },
  carnical: { rubens: ['(cheira o sangue do peito costurado) ...FICA...', '...NALUTI... DURMA...'] },
};
for (const [w, m] of Object.entries(VICTORY_RUBENS)) VICTORY_LINES[w] = { ...(VICTORY_LINES[w] || {}), ...m };

// BEATRICE PORTINARI (Ordo Realitas, Força D): gentil, altruísta, curiosa; a "irmãzinha" do Dante (Lily), neta de
// consideração do Arnaldo (que escolheu o nome dela pela Divina Comédia), amiga da Erin; a "Luminária" do Kaiser; os
// Escriptas tiraram dela a mãe, a Elizabeth e as memórias (nome original Lilian Galen); medo de ser amarrada (wiki)
const VICTORY_BEATRICE = {
  beatrice: {
    arthur: ['A gente nunca conversou direito, né, Arthur? Depois disso, quem sabe.', 'Desculpa! Eu mirei no ombro, juro.'],
    joui: ['Você é rápido, Joui. O Orpheu é mais.', 'Tudo bem? Quer que eu veja esse corte?'],
    kaiser: ['A Luminária ganhou dessa vez, Kaiser.', 'Fumaça não esconde de um urutau.'],
    dante: ['Viu, irmão? Eu cresci.', 'Você sempre me achava no depósito. Agora quem te achou fui eu.'],
    erin: ['Erin! A gente devia treinar mais vezes, foi divertido!', 'Desculpa, de verdade. Foi a moeda.'],
    aghata: ['O livro não te avisou dessa, né?', 'Faca contra canivete. Ganhou o menor.'],
    balu: ['Grandão demais pra se esconder de uma balestra.', 'Calma, Balu! Já acabou!'],
    carina: ['Você viu o virote chegando? Nem eu.', 'Vou contar pro Arnaldo que ganhei de uma Leone.'],
    rubens: ['Rápido demais, Rubens. Mas o Orpheu voa.', 'Você me ensina a fazer curativo depois?'],
    verissimo: ['Senhor Veríssimo! Missão cumprida?', 'Tristan me ensinou bem, né?'],
    cristopher: ['Desculpa, Cristopher. Eu sei que o Kaiser gosta de você.', 'Essa cena ficou bonita, vai.'],
    kian: ['Saber tudo é perder tudo. Você devia saber disso.', 'Os seus Escriptas me tiraram muita coisa.'],
    gal_sal: ['Pela Elizabeth.', 'Você não vai amarrar mais ninguém.'],
    nubi: ['Calma não adianta contra um virote.', 'O Orpheu não tem medo de você.'],
    xande: ['Skate bonito! Mas o Orpheu é mais rápido.', 'Tudo bem? Levanta, vem.'],
    guizo: ['Pode filmar o Orpheu, ele gosta.', 'Sem foto agora, por favor.'],
    lirio: ['Bah! Aprendi com o Arthur.', 'Linda a Leonora. Pesada demais pra mim.'],
    dara: ['Você é médica? Então se cuida aí.', 'Desculpa, eu sei que dói.'],
    chico: ['Seus fios não pegam um urutau.', 'Gambiarra bonita. Quebrou.'],
    morato: ['Os Cinco são bons. A Força D também.', 'Desculpa, líder.'],
    dalmo: ['Escafandro grande, virote pequeno.', 'Respira aí dentro, tá?'],
    aguiar: ['Caçador? O Orpheu caça de noite.', 'Não fui eu a presa dessa vez.'],
    jae: ['Shh. Eu também sei ser silenciosa.', 'A balestra não faz barulho, Jae.'],
    kemi: ['Mira boa. A minha também.', 'Sniper contra balestra. Empate? Não.'],
    labirinto: ['Eu já me perdi num orfanato. Labirinto é fácil.', 'Sempre tem uma saída.'],
    juan: ['O ódio cansa, Juan.', 'Eu também já senti raiva. Passou.'],
    cristino: ['Lampião não assusta quem cresceu no escuro.', 'Desculpa, moço.'],
    raziel: ['Vampiro? O Orpheu também vê no escuro.', 'Sem mordida hoje.'],
    arnaldo: ['Vô! Você que escolheu meu nome, lembra?', 'Lê a Divina Comédia pra mim de novo?'],
    ferreiro: ['A Morte é lenta pra quem voa.', 'Seu martelo não alcança o céu.'],
    celestine: ['Você não é confiável, sabia?', 'Corrente nenhuma me prende.'],
    gaius: ['Seus jogos acabaram, Gaius.', 'Roma é longe daqui.'],
    amalia: ['Duas atiradoras. Uma só ganha.', 'Bonito arco. Eu prefiro balestra.'],
    o_diabo: ['Não faço pacto com ninguém.', 'Volta pro seu inferno.'],
    magistrada: ['Você previu o Orpheu? Ninguém prevê.', 'Equilíbrio quebrado. Desculpa.'],
    estrangeiro: ['Eu sei como é esquecer tudo. Você não vai me fazer esquecer de novo.', 'Lembra de mim.'],
    amigo: ['Desenho bonito. Rasgado.', 'Eu também desenhava no orfanato.'],
    carnical: ['O Orpheu viu você primeiro.', 'Fica longe de mim.'],
  },
  arthur: { beatrice: ['Foi mal, Beatrice. Vem, eu te ajudo a levantar.', 'Mira boa. Falta guarda.'] },
  joui: { beatrice: ['...Desculpa, Beatrice.', 'Cuida do Orpheu.'] },
  kaiser: { beatrice: ['Desculpa, Luminária. A fumaça foi sem querer.', 'Você brilha, mas cai.'] },
  dante: { beatrice: ['Levanta, irmãzinha. Eu tô aqui.', 'Lily... desculpa. Treino é treino.'] },
  erin: { beatrice: ['Foi mal, Bea! KABOOM amigável!', 'Bea, cê tá viva? Ufa!'] },
  aghata: { beatrice: ['O livro já sabia que você ia cair.', 'Você lembra demais, menina.'] },
  balu: { beatrice: ['Opa! Desculpa, florzinha! Machucou?', 'O passarinho tá bem? Ufa.'] },
  carina: { beatrice: ['Eu vi o virote antes de você puxar.', 'Fica de pé, Portinari.'] },
  rubens: { beatrice: ['Ferimento leve. Eu trato.', 'Desculpa. Treino.'] },
  verissimo: { beatrice: ['Agente Portinari: mire com as duas mãos.', 'O Tristan ensinou bem. Falta você aprender.'] },
  cristopher: { beatrice: ['Caiu feio, menina. Treina a queda.', 'O Kaiser fala bem de você.'] },
  kian: { beatrice: ['Lilian. Você era minha. Eu só estou pegando de volta.', 'Saber tudo é perder tudo, não é?'] },
  gal_sal: { beatrice: ['Amarrada de novo, florista.', 'Pelo Kian. Sempre.'] },
  nubi: { beatrice: ['Paciência, menina.', 'O pássaro não te salvou.'] },
  xande: { beatrice: ['Foi mal! Quer uma mão?', 'Ganhei de uma agente da Força D!'] },
  guizo: { beatrice: ['Gravei o urutau! Muito bonito!', 'Viralizou a moeda!'] },
  lirio: { beatrice: ['Bah, guria, levanta daí.', 'A Leonora não erra.'] },
  dara: { beatrice: ['Deixa eu ver esse corte.', 'Foi só o susto.'] },
  chico: { beatrice: ['Meu scanner pegou o passarinho!', 'Ops, foi mal!'] },
  morato: { beatrice: ['Força D, é? Boa. Mas Os Cinco ganharam.', 'Levanta. Tem trabalho.'] },
  dalmo: { beatrice: ['Pequena demais.', 'Volta pro jardim.'] },
  aguiar: { beatrice: ['Peguei o pássaro e a dona.', 'Presa fácil.'] },
  jae: { beatrice: ['Shh... dorme, florista.', 'Silenciosa? Eu sou mais.'] },
  kemi: { beatrice: ['Nada pessoal.', 'Uma balestra contra uma sniper? Sério?'] },
  labirinto: { beatrice: ['Perdida de novo, menina do orfanato.', 'Não tem saída.'] },
  juan: { beatrice: ['Mais! Atira mais!', 'Ódio contra flor. Ódio ganha.'] },
  cristino: { beatrice: ['Oxente, que passarinho é esse?', 'Valente, a moça.'] },
  raziel: { beatrice: ['Sangue de florista. Doce.', 'O pássaro não voa rápido o bastante.'] },
  arnaldo: { beatrice: ['Beatrice! Minha neta favorita! Aplausos!', 'Você ainda não leu o fim da Divina Comédia, né?'] },
  ferreiro: { beatrice: ['A Morte alcança até o pássaro.', 'Descanse.'] },
  celestine: { beatrice: ['Fofo, o passarinho. Era.', 'Florista no meio de guerreiros, gato.'] },
  gaius: { beatrice: ['Fraca demais para a arena.', 'Segundo lugar? Você nem entrou.'] },
  amalia: { beatrice: ['Mira melhor, florista.', 'Arco ganha de balestra.'] },
  o_diabo: { beatrice: ['Que memória gostosa a sua, Lilian.', 'Faz um pacto e eu te devolvo tudo.'] },
  magistrada: { beatrice: ['Previsto.', 'O equilíbrio não precisa de você.'] },
  estrangeiro: { beatrice: ['Ninguém vai lembrar de você.', 'Esquece.'] },
  amigo: { beatrice: ['...menina do pássaro... virou desenho...', '...penas... tinta...'] },
  carnical: { beatrice: ['...LILIAN... FICA...', '(cheira as penas) ...DURMA...'] },
};
for (const [w, m] of Object.entries(VICTORY_BEATRICE)) VICTORY_LINES[w] = { ...(VICTORY_LINES[w] || {}), ...m };

// A DEGOLIFICADA e O ESPREITADOR (Outro Lado), jogáveis desde 2026-11-06. Os dois quase não falam: ela tem a boca
// vedada (o que escapa é o Gabriel preso no corpo da Agatha); ele só observa — olhos, lágrimas e o olho da boca.
const VICTORY_OUTRO_CHEFES = {
  degolificada: {
    arthur: ["(os fios soltam a guitarra e se recolhem) ...Arthur... me... ajuda...", "(a boca vedada se rasga num grito) ...EU... NÃO SOU... ELA..."],
    joui: ["(os fios soltam a katana e se recolhem) ...Joui... me... ajuda...", "(a boca vedada se rasga num grito) ...EU... NÃO SOU... ELA..."],
    kaiser: ["(os fios soltam a fumaça e se recolhem) ...Kaiser... me... ajuda...", "(a boca vedada se rasga num grito) ...EU... NÃO SOU... ELA..."],
    dante: ["(os fios soltam o terço e se recolhem) ...Dante... me... ajuda...", "(a boca vedada se rasga num grito) ...EU... NÃO SOU... ELA..."],
    erin: ["(os fios soltam as granadas e se recolhem) ...Erin... me... ajuda...", "(a boca vedada se rasga num grito) ...EU... NÃO SOU... ELA..."],
    aghata: ["(os fios soltam o colar de sangue e se recolhem) ...Aghata... me... ajuda...", "(a boca vedada se rasga num grito) ...EU... NÃO SOU... ELA..."],
    balu: ["(os fios soltam o machado e se recolhem) ...Balu... me... ajuda...", "(a boca vedada se rasga num grito) ...EU... NÃO SOU... ELA..."],
    carina: ["(os fios soltam o leque e se recolhem) ...Carina... me... ajuda...", "(a boca vedada se rasga num grito) ...EU... NÃO SOU... ELA..."],
    rubens: ["(os fios soltam o boné e se recolhem) ...Rubens... me... ajuda...", "(a boca vedada se rasga num grito) ...EU... NÃO SOU... ELA..."],
    beatrice: ["(os fios soltam as flores e se recolhem) ...Beatrice... me... ajuda...", "(a boca vedada se rasga num grito) ...EU... NÃO SOU... ELA..."],
    verissimo: ["(os fios soltam o florete e se recolhem) ...Veríssimo... me... ajuda...", "(a boca vedada se rasga num grito) ...EU... NÃO SOU... ELA..."],
    cristopher: ["(os fios soltam a câmera de dublê e se recolhem) ...Cristopher... me... ajuda...", "(a boca vedada se rasga num grito) ...EU... NÃO SOU... ELA..."],
    kian: ["(os fios soltam a Escrita e se recolhem) ...Kian... me... ajuda...", "(a boca vedada se rasga num grito) ...EU... NÃO SOU... ELA..."],
    gal_sal: ["(os fios soltam as correntes e se recolhem) ...Gal... me... ajuda...", "(a boca vedada se rasga num grito) ...EU... NÃO SOU... ELA..."],
    nubi: ["(os fios soltam a bengala de chacal e se recolhem) ...Nubi... me... ajuda...", "(a boca vedada se rasga num grito) ...EU... NÃO SOU... ELA..."],
    xande: ["(os fios soltam o skate e se recolhem) ...Xande... me... ajuda...", "(a boca vedada se rasga num grito) ...EU... NÃO SOU... ELA..."],
    guizo: ["(os fios soltam a câmera e se recolhem) ...Guizo... me... ajuda...", "(a boca vedada se rasga num grito) ...EU... NÃO SOU... ELA..."],
    lirio: ["(os fios soltam a Leonora e se recolhem) ...Lírio... me... ajuda...", "(a boca vedada se rasga num grito) ...EU... NÃO SOU... ELA..."],
    dara: ["(os fios soltam a lanterna e se recolhem) ...Dara... me... ajuda...", "(a boca vedada se rasga num grito) ...EU... NÃO SOU... ELA..."],
    chico: ["(os fios soltam a fiação e se recolhem) ...Chico... me... ajuda...", "(a boca vedada se rasga num grito) ...EU... NÃO SOU... ELA..."],
    morato: ["(os fios soltam a metralhadora e se recolhem) ...Morato... me... ajuda...", "(a boca vedada se rasga num grito) ...EU... NÃO SOU... ELA..."],
    dalmo: ["(os fios soltam o escafandro e se recolhem) ...Dalmo... me... ajuda...", "(a boca vedada se rasga num grito) ...EU... NÃO SOU... ELA..."],
    aguiar: ["(os fios soltam o machado e se recolhem) ...Aguiar... me... ajuda...", "(a boca vedada se rasga num grito) ...EU... NÃO SOU... ELA..."],
    jae: ["(os fios soltam o punhal X e se recolhem) ...Jae... me... ajuda...", "(a boca vedada se rasga num grito) ...EU... NÃO SOU... ELA..."],
    kemi: ["(os fios soltam o fuzil e se recolhem) ...Kemi... me... ajuda...", "(a boca vedada se rasga num grito) ...EU... NÃO SOU... ELA..."],
    labirinto: ["(os fios soltam o elmo e se recolhem) ...Labirinto... me... ajuda...", "(a boca vedada se rasga num grito) ...EU... NÃO SOU... ELA..."],
    juan: ["(os fios soltam a faca e se recolhem) ...Henri... me... ajuda...", "(a boca vedada se rasga num grito) ...EU... NÃO SOU... ELA..."],
    cristino: ["(os fios soltam o lampião e se recolhem) ...Cristino... me... ajuda...", "(a boca vedada se rasga num grito) ...EU... NÃO SOU... ELA..."],
    raziel: ["(os fios soltam as garras e se recolhem) ...Raziel... me... ajuda...", "(a boca vedada se rasga num grito) ...EU... NÃO SOU... ELA..."],
    arnaldo: ["(os fios soltam a espada e se recolhem) ...Arnaldo... me... ajuda...", "(a boca vedada se rasga num grito) ...EU... NÃO SOU... ELA..."],
    ferreiro: ["(os fios soltam o martelo e se recolhem) ...Ferreiro... me... ajuda...", "(a boca vedada se rasga num grito) ...EU... NÃO SOU... ELA..."],
    celestine: ["(os fios soltam as machadinhas e se recolhem) ...Celestine... me... ajuda...", "(a boca vedada se rasga num grito) ...EU... NÃO SOU... ELA..."],
    gaius: ["(os fios soltam a maça e se recolhem) ...Gaius... me... ajuda...", "(a boca vedada se rasga num grito) ...EU... NÃO SOU... ELA..."],
    amalia: ["(os fios soltam o arco e se recolhem) ...Amalia... me... ajuda...", "(a boca vedada se rasga num grito) ...EU... NÃO SOU... ELA..."],
    o_diabo: ["(os fios soltam o pacto e se recolhem) ...O Diabo... me... ajuda...", "(a boca vedada se rasga num grito) ...EU... NÃO SOU... ELA..."],
    magistrada: ["(os fios soltam a bengala e se recolhem) ...A Magistrada... me... ajuda...", "(a boca vedada se rasga num grito) ...EU... NÃO SOU... ELA..."],
    estrangeiro: ["(os fios soltam o sinal e se recolhem) ...O Estrangeiro... me... ajuda...", "(a boca vedada se rasga num grito) ...EU... NÃO SOU... ELA..."],
    amigo: ["(os fios soltam a tinta e se recolhem) ...O Amigo... me... ajuda...", "(a boca vedada se rasga num grito) ...EU... NÃO SOU... ELA..."],
    carnical: ["(os fios soltam a espiral e se recolhem) ...O Carniçal... me... ajuda...", "(a boca vedada se rasga num grito) ...EU... NÃO SOU... ELA..."],
    espreitador: ["(os fios fecham o armário com ele dentro)", "...olhos... demais... (o grito racha a madeira)"],
  },
  espreitador: {
    arthur: ["(as pupilas se multiplicam olhando a guitarra no chão)", "(as lágrimas pingam em Arthur; o olho da boca pisca)"],
    joui: ["(as pupilas seguem a katana no chão)", "(sai pela fresta atrás dele, chorando)"],
    kaiser: ["(o olho da boca fecha, devagar; desta vez ninguém atirou)", "(volta para o armário, olhando a fumaça)"],
    dante: ["(as pupilas se multiplicam olhando o terço no chão)", "(as lágrimas pingam em Dante; o olho da boca pisca)"],
    erin: ["(as pupilas se multiplicam olhando as granadas no chão)", "(as lágrimas pingam em Erin; o olho da boca pisca)"],
    aghata: ["(as pupilas se multiplicam olhando o colar de sangue no chão)", "(as lágrimas pingam em Aghata; o olho da boca pisca)"],
    balu: ["(as pupilas se multiplicam olhando o machado no chão)", "(as lágrimas pingam em Balu; o olho da boca pisca)"],
    carina: ["(as pupilas se multiplicam olhando o leque no chão)", "(as lágrimas pingam em Carina; o olho da boca pisca)"],
    rubens: ["(as pupilas se multiplicam olhando o boné no chão)", "(as lágrimas pingam em Rubens; o olho da boca pisca)"],
    beatrice: ["(as pupilas se multiplicam olhando as flores no chão)", "(as lágrimas pingam em Beatrice; o olho da boca pisca)"],
    verissimo: ["(as pupilas se multiplicam olhando o florete no chão)", "(as lágrimas pingam em Veríssimo; o olho da boca pisca)"],
    cristopher: ["(as pupilas se multiplicam olhando a câmera de dublê no chão)", "(as lágrimas pingam em Cristopher; o olho da boca pisca)"],
    kian: ["(as pupilas se multiplicam olhando a Escrita no chão)", "(as lágrimas pingam em Kian; o olho da boca pisca)"],
    gal_sal: ["(as pupilas se multiplicam olhando as correntes no chão)", "(as lágrimas pingam em Gal; o olho da boca pisca)"],
    nubi: ["(as pupilas se multiplicam olhando a bengala de chacal no chão)", "(as lágrimas pingam em Nubi; o olho da boca pisca)"],
    xande: ["(as pupilas se multiplicam olhando o skate no chão)", "(as lágrimas pingam em Xande; o olho da boca pisca)"],
    guizo: ["(as pupilas se multiplicam olhando a câmera no chão)", "(as lágrimas pingam em Guizo; o olho da boca pisca)"],
    lirio: ["(as pupilas se multiplicam olhando a Leonora no chão)", "(as lágrimas pingam em Lírio; o olho da boca pisca)"],
    dara: ["(as pupilas se multiplicam olhando a lanterna no chão)", "(as lágrimas pingam em Dara; o olho da boca pisca)"],
    chico: ["(as pupilas se multiplicam olhando a fiação no chão)", "(as lágrimas pingam em Chico; o olho da boca pisca)"],
    morato: ["(as pupilas se multiplicam olhando a metralhadora no chão)", "(as lágrimas pingam em Morato; o olho da boca pisca)"],
    dalmo: ["(as pupilas se multiplicam olhando o escafandro no chão)", "(as lágrimas pingam em Dalmo; o olho da boca pisca)"],
    aguiar: ["(as pupilas se multiplicam olhando o machado no chão)", "(as lágrimas pingam em Aguiar; o olho da boca pisca)"],
    jae: ["(as pupilas se multiplicam olhando o punhal X no chão)", "(as lágrimas pingam em Jae; o olho da boca pisca)"],
    kemi: ["(as pupilas se multiplicam olhando o fuzil no chão)", "(as lágrimas pingam em Kemi; o olho da boca pisca)"],
    labirinto: ["(as pupilas se multiplicam olhando o elmo no chão)", "(as lágrimas pingam em Labirinto; o olho da boca pisca)"],
    juan: ["(as pupilas se multiplicam olhando a faca no chão)", "(as lágrimas pingam em Henri; o olho da boca pisca)"],
    cristino: ["(as pupilas se multiplicam olhando o lampião no chão)", "(as lágrimas pingam em Cristino; o olho da boca pisca)"],
    raziel: ["(as pupilas se multiplicam olhando as garras no chão)", "(as lágrimas pingam em Raziel; o olho da boca pisca)"],
    arnaldo: ["(as pupilas se multiplicam olhando a espada no chão)", "(as lágrimas pingam em Arnaldo; o olho da boca pisca)"],
    ferreiro: ["(as pupilas se multiplicam olhando o martelo no chão)", "(as lágrimas pingam em Ferreiro; o olho da boca pisca)"],
    celestine: ["(as pupilas se multiplicam olhando as machadinhas no chão)", "(as lágrimas pingam em Celestine; o olho da boca pisca)"],
    gaius: ["(as pupilas se multiplicam olhando a maça no chão)", "(as lágrimas pingam em Gaius; o olho da boca pisca)"],
    amalia: ["(as pupilas se multiplicam olhando o arco no chão)", "(as lágrimas pingam em Amalia; o olho da boca pisca)"],
    o_diabo: ["(as pupilas se multiplicam olhando o pacto no chão)", "(as lágrimas pingam em O Diabo; o olho da boca pisca)"],
    magistrada: ["(as pupilas se multiplicam olhando a bengala no chão)", "(as lágrimas pingam em A Magistrada; o olho da boca pisca)"],
    estrangeiro: ["(as pupilas se multiplicam olhando o sinal no chão)", "(as lágrimas pingam em O Estrangeiro; o olho da boca pisca)"],
    amigo: ["(as pupilas se multiplicam olhando a tinta no chão)", "(as lágrimas pingam em O Amigo; o olho da boca pisca)"],
    carnical: ["(as pupilas se multiplicam olhando a espiral no chão)", "(as lágrimas pingam em O Carniçal; o olho da boca pisca)"],
    degolificada: ["(as pupilas se multiplicam olhando os fios no chão)", "(uma cópia cinzenta dela fica de pé, ao lado dele)"],
  },
  arthur: { degolificada: ["Cabelo comprido não combina com rock pesado.", "Gabriel. Eu sei quem tá aí dentro."], espreitador: ["Da Mansão eu lembro bem. Fica no armário.", "Fecha os olhos, bicho. Todos eles."] },
  joui: { degolificada: ["Cortei os fios. Todos.", "O corpo é dela. A mente, não. Descansa, Gabriel."], espreitador: ["Eu vi as frestas. Não volto lá.", "Muitos olhos. Um corte."] },
  kaiser: { degolificada: ["Cabelo pega fogo fácil, sabia?", "Chama ele pelo nome. Gabriel. Pronto."], espreitador: ["No olho da boca. Igual da outra vez.", "Abre a boca de novo e eu atiro de novo."] },
  dante: { degolificada: ["Que a alma do Gabriel descanse. A da Agatha também.", "Rezei pelos dois que moram aí."], espreitador: ["Muitos olhos e nenhum sono. Dorme agora.", "A Mansão ficou pra trás. Você também."] },
  erin: { degolificada: ["Explodiu o penteado! Hahaha!", "Fios por todo lado. Arte moderna!"], espreitador: ["Granada no armário! Fecha a fresta com BUM!", "Te achei, olhudo! KABOOM!"] },
  aghata: { degolificada: ["Corpo emprestado. Mente presa. Que página triste.", "Gabriel. Anotado e encerrado."], espreitador: ["Olhos amarelos. Anotei cada um.", "Você observa. Eu também."] },
  balu: { degolificada: ["Machadada no cabelo! Corte grátis!", "Hahaha! Agora ela tá careca, pô!"], espreitador: ["Bichão de armário! O urso achou!", "Olhudo, pode chorar à vontade."] },
  carina: { degolificada: ["Os Leone não se deixam enforcar.", "Cabelo bonito. Pena o resto."], espreitador: ["Os Leone não têm medo do escuro.", "Fica no armário. É lá que monstro mora."] },
  rubens: { degolificada: ["Eu voltei. Você, não.", "Nem o cabelo segura um Abutre."], espreitador: ["Já vi coisa pior no armário de casa.", "Olhos demais pra pouca coragem."] },
  beatrice: { degolificada: ["Cortei os fios com a mesma tesoura das rosas.", "Meu nome é Beatrice. O seu é Gabriel."], espreitador: ["Flores no armário. Fecha a fresta.", "Pode olhar. Eu não desvio."] },
  verissimo: { degolificada: ["Gabriel Opspor. Caso encerrado.", "Disciplina vence até cabelo."], espreitador: ["Criatura de fresta. Neutralizada.", "Postura, olhudo. Postura."] },
  cristopher: { degolificada: ["Corta! Tira o cabelo do set!", "Já caí de prédio. Cabelo não me assusta."], espreitador: ["Já filmei casa mal-assombrada. Essa é fichinha.", "Corta! Volta pro armário do figurino!"] },
  kian: { degolificada: ["A Escrita desfez os fios.", "Nome escrito: Gabriel. Fim."], espreitador: ["Escrevi a fresta fechada.", "Você não está mais na página."] },
  gal_sal: { degolificada: ["Corrente contra cabelo. A corrente ganha.", "Justiça pros dois que morreram aí."], espreitador: ["Preso. Sem fresta, sem fuga.", "A justiça te vê, olhudo."] },
  nubi: { degolificada: ["A Morte devolve o nome: Gabriel.", "Dois numa só carcaça. A Morte separa."], espreitador: ["Seus olhos fecham. Devagar.", "A Morte também espreita. Melhor que você."] },
  xande: { degolificada: ["Mano, que cabelo bizarro!", "Tacada no meio dos fios! Os Cinco!"], espreitador: ["Sai do armário, mano! Ah, saiu. Caiu.", "Muito olho, pouco reflexo!"] },
  guizo: { degolificada: ["GRAVEI UMA DEGOLIFICADA! Ninguém vai acreditar!", "O cabelo cobriu a lente, mas valeu!"], espreitador: ["Gravei os olhos! Todos eles!", "Eu filmei a fresta. Agora ela tá fechada."] },
  lirio: { degolificada: ["A Leonora corta cabelo, bah.", "Bicho cabeludo, marreta pesada."], espreitador: ["Tchê, que bicho chorão.", "Fecha a porta do armário que tá frio."] },
  dara: { degolificada: ["Lanterna no rosto. Achei o Gabriel.", "Não sei estancar isso. Sinto muito."], espreitador: ["A lanterna acha todos os olhos.", "Para de chorar. Fica quieto."] },
  chico: { degolificada: ["Cabelo em curto-circuito! Funciona!", "Choque nos fios! Hahaha!"], espreitador: ["Liguei a luz do armário. Pronto.", "Bicho de fresta odeia lâmpada."] },
  morato: { degolificada: ["Pelos Cinco. Cabelo nenhum segura.", "Descansa, garoto. Eu sei que você tá aí."], espreitador: ["Ninguém espreita os Cinco.", "Pode chorar. A gente não chora mais."] },
  dalmo: { degolificada: ["Fios no vidro do escafandro. Inútil, neném.", "Gladiadora cabeluda. Caiu igual."], espreitador: ["Fera de armário. Fraquinha, neném.", "Pode olhar pelo vidro. Eu olho de volta."] },
  aguiar: { degolificada: ["Presa cabeluda. Troféu.", "Até o Outro Lado vira caça."], espreitador: ["Caça de armário. Rara.", "Muitos olhos. Nenhum viu o machado."] },
  jae: { degolificada: ["Shh... os fios nem me viram.", "Silêncio. Até o grito."], espreitador: ["Eu também espreito. Melhor.", "Fresta? Eu moro nas sombras."] },
  kemi: { degolificada: ["Tiro entre os fios. Fácil.", "Mira boa. Cabelo ruim."], espreitador: ["No olho da boca. Mira certa.", "Olho grande, alvo grande."] },
  labirinto: { degolificada: ["Fios demais. Achei a saída mesmo assim.", "Labirinto de cabelo. Resolvido."], espreitador: ["A fresta era um beco sem saída.", "Você se perdeu no próprio armário."] },
  juan: { degolificada: ["Ela grita bonito. Grita mais.", "Cabelo cortado. Que pena, hahaha."], espreitador: ["Chora mais. Eu gosto.", "Tantos olhos e nenhum viu a faca."] },
  cristino: { degolificada: ["O lampião queimou os fios.", "Grito alto. Odeio gente barulhenta."], espreitador: ["Fresta escura? Trouxe o lampião.", "Bicho de olho amarelo. Apagou."] },
  raziel: { degolificada: ["Sangue nos fios. Gosto disso.", "Devoradora? Eu devoro melhor."], espreitador: ["Olhos amarelos. Os meus são vermelhos.", "Criatura de armário. Indigna de mim."] },
  arnaldo: { degolificada: ["Que cabelo! Aplausos pro cabeleireiro!", "Fim do número. Fecha a cortina."], espreitador: ["Plateia de mil olhos! Ninguém aplaudiu.", "Volta pro camarim. Quer dizer, armário."] },
  ferreiro: { degolificada: ["Fio de cabelo não é fio de ferro. Quebrou.", "O martelo não erra cabeça."], espreitador: ["Forjei o fecho do armário.", "Olhos demais. Martelo de menos."] },
  celestine: { degolificada: ["Duas machadinhas. Corte perfeito.", "A Ordem não teme cabelo."], espreitador: ["Corrente no armário. Trancado.", "Pode espiar. A Ordo Calamitas espia de volta."] },
  gaius: { degolificada: ["Em Roma, cabelo assim era sinal de maldição.", "Que os dois que moram aí descansem."], espreitador: ["Criatura de fresta. Roma tinha piores.", "Mil olhos. Uma maça."] },
  amalia: { degolificada: ["Flecha entre os fios. Mira de verdade.", "Cabelo não para flecha."], espreitador: ["Flecha no olho da boca. Um tiro.", "Muitos alvos. Escolhi o maior."] },
  o_diabo: { degolificada: ["Ninguém fez pacto por esse corpo. Que desperdício.", "Gabriel, Agatha... nenhum dos dois é meu."], espreitador: ["Você vive no escuro? Eu sou o escuro.", "Chora, criaturinha. O Diabo gosta."] },
  magistrada: { degolificada: ["Sentença: Gabriel Opspor. Executada.", "Previ cada fio."], espreitador: ["Previ a fresta. Fechei antes.", "Olhos não julgam. Eu julgo."] },
  estrangeiro: { degolificada: ["Interferência no sinal. Cabelo demais.", "Mente trocada. Eu sei como é."], espreitador: ["Você observa. Eu esqueço você.", "Olhos daqui. Eu sou de outro lugar."] },
  amigo: { degolificada: ["...cabelo... tinta... os dois... escorrem...", "...brincar... de novo... outro dia..."], espreitador: ["...olhos... bonitos... vou pintar...", "...esconde-esconde... achei..."] },
  carnical: { degolificada: ["(a espiral pulsa) ...QUIETA...", "(rasga os fios e rosna)"], espreitador: ["(os olhos amarelos presos no Símbolo) ...OLHE...", "(fecha o armário com as garras)"] },
};
for (const [w, m] of Object.entries(VICTORY_OUTRO_CHEFES)) VICTORY_LINES[w] = { ...(VICTORY_LINES[w] || {}), ...m };

export const VICTORY_FALLBACKS = {
  damir: 'Saber tudo é ganhar tudo. Anota aí.',
  boris: 'Por Lucas. E pelo meu irmão.',
  artemis: 'Gostou do que a mamãe fez?',
  beatrice: 'Meu nome é Beatrice. Lembra de mim.',
  rubens: 'Ainda bem que eu voltei. E vou continuar voltando.',
  carina: 'Todos os Leone vivem dentro de mim. Hoje, eles venceram.',
  kaiser: 'A névoa não escolheu por mim. Desta vez, eu fiquei.',
  arthur: 'Acabou. Agora posso garantir que ninguém mais se machuque.',
  joui: 'Terminou. Eu devia ter encontrado outro jeito.',
  aghata: (other) => `Interessante. Eu estava certa sobre você, ${other}.`,
  dante: 'Fim da peça. O roteiro continua uma porcaria.',
  erin: 'Teste concluído! A explosão ficou ainda melhor do que eu esperava.',
  gal_sal: (other) => `Não chama isso de justiça. Eu sei a diferença, ${other}.`,
  kian: 'Mais um resultado previsto. Não confunda isso com escolha.',
  aguiar: (other) => `Ha ha... e você achou que era o caçador, ${other}.`,
  labirinto: 'A saída esteve ali o tempo todo. Você não a viu.',
  xande: 'Por eles. Sempre por eles.',
  lirio: 'A parede ficou de pé. Boa, Leonora.',
  ferreiro: 'Santo Berço fica em pé. É tudo que importa.',
  juan: 'Não foi redenção. Mas foi um começo.',
  kemi: 'Alvo abatido. Trabalho encerrado.',
  balu: 'Viu? Eu falei que o tio Balu resolvia.',
  arnaldo: 'E fecham-se as cortinas. Aplausos, por favor.',
  verissimo: 'Missão cumprida. Relatório na minha mesa amanhã.',
  jae: 'Shh. Acabou.',
  dalmo: 'Pela Manu. Sempre pela Manu.',
  guizo: 'Gravado. Isso é real e eu tenho provas!',
  o_diabo: 'Assinado. Ninguém lê as letras miúdas.',
  magistrada: 'O Equilíbrio foi mantido. Tá tudo tão quieto agora.',
  estrangeiro: 'Ninguém vai lembrar disto.',
  amigo: '...mais um quadro na igreja...',
  cristino: 'Não é pessoal. Eu disse que não me importo com os joguinhos de vocês.',
  cristopher: 'Corta! Essa foi de primeira! Todo mundo bem aí?',
};

export const BATTLE_DIALOGUES = {
  critical: {
    kaiser: 'Eu já sobrevivi a coisa pior. Não vou cair aqui.',
    arthur: 'Ainda tô de pé. Vai precisar mais que isso.',
    joui: 'Eu ainda posso escolher como essa luta termina.',
    aghata: 'Não vou deixar o medo decidir por mim.',
    dante: 'A peça não acaba enquanto eu estiver de pé.',
    erin: 'Isso foi só um teste. Eu ainda tenho uma solução.',
    gal_sal: 'Eu não vou deixar você decidir o meu fim.',
    kian: 'O resultado ainda pode surpreender.',
    aguiar: 'Ha... agora ficou interessante.',
    labirinto: 'O caminho fica estreito. Ainda há uma saída.',
    xande: 'Não vou cair antes de tirar os meus daqui.',
    lirio: 'A Leonora ainda está comigo.',
    ferreiro: 'Santo Berço precisa de mim. Eu não caio.',
    juan: 'Eu não vou voltar a ser quem fui.',
    kemi: 'A mira ainda está viva, e o contrato não fechou.',
    balu: 'Hahaha! O tio Balu aguenta mais que isso!',
    arnaldo: 'O espetáculo está longe do último ato!',
    verissimo: 'Já vi situação pior no relatório. Sigo.',
    jae: 'Sangrando? Ótimo. Agora eu tô acordada.',
    dalmo: 'Eu já levantei de coisa pior. A plateia quer mais.',
    guizo: 'Tá doendo... tá doendo muito... mas não para de gravar!',
    o_diabo: 'Sangue derramado é sangue que eu bebo. Continue.',
    magistrada: 'Eu já vi este momento. Ele não termina aqui.',
    estrangeiro: 'Dor. Um conceito tão local.',
    amigo: '(o sino toca mais rápido)',
    cristino: 'Já levei tiro de bicho pior. Não é hoje.',
    cristopher: 'Experiência de dublê, rapaz! Eu já caí de prédio!',
    anfitriao: 'Essa dor combina com você. Não sei por quê; combina.',
  },
  special: {
    kaiser: 'A névoa fecha o caminho. Agora, acabou.',
    arthur: 'Eu queria resolver isso de outro jeito. Mas vamos lá.',
    joui: 'Vou acabar com isso sem perder quem eu sou.',
    aghata: 'Encontrei a resposta. Está bem na sua frente.',
    dante: 'A luz apaga. A peça termina.',
    erin: 'Anota aí: essa parte vai ser incrível!',
    gal_sal: 'Você teve a chance de parar. Agora aguenta.',
    kian: 'Eu já vi este momento acontecer.',
    aguiar: 'O caçador chegou ao fim da trilha.',
    labirinto: 'Você entrou no caminho errado.',
    xande: 'Chegou a hora de virar o jogo!',
    lirio: 'Leonora, comigo! Vamos nessa!',
    ferreiro: 'Pelo Santo Berço!',
    juan: 'Eu escolho o que fazer com esse poder.',
    kemi: 'Contrato aceito. Alvo marcado.',
    balu: 'Agora o tio Balu vai mostrar serviço!',
    arnaldo: 'Senhoras e senhores... chegou a atração principal!',
    verissimo: 'Chega de conversa. Vou encerrar a missão.',
    jae: 'Shh. Não grita.',
    dalmo: 'Agora você vai ver por que me chamam de Colosso.',
    guizo: 'Sorria! Você tá no Registro do Outro Lado!',
    o_diabo: 'Eu vim te oferecer um pacto.',
    magistrada: 'Venha. Aqui ficam só nós dois.',
    estrangeiro: 'O que é pior do que a Dor e a Morte?',
    amigo: '...todo mundo vai morrer...',
    cristino: 'Um... dois... três.',
    cristopher: 'Essa cena eu fiz com o Van Damme!',
    anfitriao: 'Eu ia deixar você sair andando. Aí você me olhou com essa cara.',
  },
  transform: {
    deus_morte: 'A Morte não espera. Ela vem buscar.',
    diabo: 'Chega de fugir de quem eu sou.',
    fantasma: 'O contrato cobra. Eu pago.',
    anfitriao: 'Olha só. Eu também ganhei uma fantasia nova. A sua continua sendo essa cara?',
    jae_x: 'Capuz no lugar. Agora você não vê o meu rosto.',
    colosso: 'Aí sim, neném!',
    guizo_et: 'Eu sou o que eu sempre quis encontrar!',
    kian_calamidade: 'Eu fui Kushim. Eu sou Kian. Eu sou a Calamidade.',
    juan_odio: 'Eu não quero morrer... eu quero um novo começo.',
    guizo_bombado: 'Eu sou o mais forte! Grava isso!',
    guizo_velho: 'Na minha época, a gente gravava em fita, rapaz.',
    cristino_desertor: 'Eu toquei a Coroa. Agora eu sei o que você quer.',
    dante_aberto: 'Eu parei de lutar contra o passado. Me aliei ao tempo.',
    cristopher: 'Filho... eu te amo! Ninguém encosta na minha equipe!',
  },
};

export const BATTLE_REPLIES = {
  critical: {
    kaiser: 'Então vai ter que me tirar daqui.',
    arthur: 'Você não vai me fazer cair só porque achou a brecha.',
    joui: 'Ainda dá tempo de parar.',
    aghata: 'Você não me empurra pra fora do mapa sem antes eu provar que estava errado.',
    dante: 'Quero ver se isso funciona de novo sem o meu relógio perto.',
    erin: 'Ótimo! Eu ainda tenho mais ideias.',
    gal_sal: 'Não vou deixar você escolher por mim.',
    kian: 'Você ainda acredita que pode mudar o resultado?',
    aguiar: 'Ha ha... vamos ver quanto tempo dura.',
    labirinto: 'Toda saída cobra um preço.',
    xande: 'Então vem. Eu não vou deixar meus amigos pra trás.',
    lirio: 'A Leonora também não vai deixar.',
    ferreiro: 'Eu não abandono o meu povo.',
    juan: 'Eu sei exatamente o que está em jogo.',
    kemi: 'Ainda tem um alvo vivo e um contrato em aberto.',
    balu: 'Aí sim! Gosto de quem aguenta a pressão.',
    arnaldo: 'O público quer mais! Não decepcione a plateia.',
    verissimo: 'Então continue. Eu ainda não encerrei o caso.',
    jae: 'Shh... só mais um pouquinho.',
    dalmo: 'Aguenta firme. Ainda falta o último round.',
    guizo: 'Calma, calma... respira e enquadra, Guizo.',
    o_diabo: 'Ferido, eu fico com mais fome.',
    magistrada: 'Isso também estava escrito.',
    estrangeiro: 'Persistente. Para a sua espécie.',
    amigo: '...a tinta não acaba...',
    cristino: 'Então levanta. Caça boa não acaba no primeiro tiro.',
    cristopher: 'Isso! Levanta, que o tio te dá a mão!',
    anfitriao: 'Sua coragem é comovente. Quase tanto quanto essa estratégia.',
  },
  special: {
    kaiser: 'Eu ainda consigo atravessar essa névoa.',
    arthur: 'Você não chega perto dos meus sem me fazer ouvir a última palavra.',
    joui: 'Eu vou encontrar outro caminho.',
    aghata: 'Você escondeu um detalhe muito bom. Eu ainda vou encontrar o resto.',
    dante: 'Essa pressão tem um padrão. Você só precisa esperar o erro aparecer.',
    erin: 'Espera, eu não terminei de analisar!',
    gal_sal: 'Você não decide quando isso acaba.',
    kian: 'Já considerei essa possibilidade.',
    aguiar: 'Dessa vez, a presa escapou.',
    labirinto: 'Esse caminho ainda tem uma saída.',
    xande: 'Pode vir. Eu já vi coisa mais estranha.',
    lirio: 'A gente ainda tá junto, Xande.',
    ferreiro: 'Santo Berço não vai cair.',
    juan: 'Esse poder não vai me controlar.',
    kemi: 'Não. O contrato ainda está em aberto.',
    balu: 'Hahaha! Agora a brincadeira ficou séria. Me dá um segundo e eu devolvo.',
    arnaldo: 'Que espetáculo! Mas ainda não acabou.',
    verissimo: 'A missão continua. Só que agora você está no centro da mira.',
    jae: 'Grita mais alto. Eu gosto.',
    dalmo: 'Pode vir. Eu sou grande, mas não sou dois.',
    guizo: 'Isso foi INCRÍVEL! Você pode fazer de novo? A luz tava ruim.',
    o_diabo: 'Que oferta generosa. Eu aceito... e cobro depois.',
    magistrada: 'As sombras não prendem quem as conhece.',
    estrangeiro: 'Interessante. Repita.',
    amigo: '...ainda não derreteu...',
    cristino: 'Eu odeio gente barulhenta.',
    cristopher: 'Retroceder nunca! Render-se jamais!',
    anfitriao: 'Vai, capricha. Quero uma história boa pra contar quando você cair.',
  },
  transform: {
    kaiser: 'Eu não vou deixar você perder o controle.',
    arthur: 'Volta pra si! Ainda dá tempo.',
    joui: 'Não precisa enfrentar isso sozinho.',
    aghata: 'O que aconteceu com você?',
    dante: 'Essa presença... eu conheço.',
    erin: 'Isso definitivamente não estava no protocolo.',
    gal_sal: 'Esse poder não muda o que você escolheu.',
    kian: 'A transformação não altera o desfecho.',
    aguiar: 'Ha ha... agora a caçada ficou séria.',
    labirinto: 'Uma nova forma. O mesmo caminho.',
    xande: 'Seja lá o que for, eu não vou fugir.',
    lirio: 'Xande, tô contigo!',
    ferreiro: 'Eu já vi essa escuridão antes.',
    juan: 'Eu sei o que é ser consumido por isso.',
    kemi: 'O contrato mudou de forma. Não de preço.',
    balu: 'Eita! Agora o negócio ficou grande!',
    arnaldo: 'Uma transformação no meio do ato! Magnífico!',
    verissimo: 'Identifiquei a mudança. Mantenham a posição.',
    jae: 'Fantasia nova? A minha tem capuz.',
    dalmo: 'Bonito. O meu escafandro é maior.',
    guizo: 'Mano, que transformação! Fica parado, deixa eu focar!',
    o_diabo: 'Mudou de pele. O desejo é o mesmo.',
    magistrada: 'Uma nova forma. O Equilíbrio é o mesmo.',
    estrangeiro: 'Mudou de forma. A mente continua aberta.',
    amigo: '...outro rosto... para derreter...',
    cristino: 'A Coroa me mostrou o que você quer. Não vai ter.',
    cristopher: 'Uau! Que figurino! De que filme é isso?',
    anfitriao: 'Isso era pra me assustar? Eu já vi coisa mais convincente no espelho.',
  },
};

// o Anfitrião (o das Relíquias e o Amphitruo): as frases novas no tom do caos (hostLines.js) somadas às antigas; as
// frases de combate de quem ainda não tinha (e as do Anfitrião, no tom certo)
VICTORY_LINES.anfitriao = { ...HOST_VICTORY, default: [...HOST_VICTORY.default, ...VICTORY_LINES.anfitriao.default] };
for (const k of ['critical', 'special', 'transform']) {
  Object.assign(BATTLE_DIALOGUES[k], BATTLE_EXTRA[k]);
  Object.assign(BATTLE_REPLIES[k], BATTLE_REPLIES_EXTRA[k]);
}

const DIALOGUE_BASE_IDS = { deus_morte: 'ferreiro', diabo: 'juan', fantasma: 'kemi', juan_odio: 'juan', guizo_bombado: 'guizo', guizo_velho: 'guizo', cristino_desertor: 'cristino', dante_aberto: 'dante', raziel_verdadeiro: 'raziel', celestine_magistrada: 'celestine', amphitruo: 'anfitriao', carina_leone: 'carina' };

export function battleLines(speakerId, opponentId, event) {
  const lines = BATTLE_DIALOGUES[event];
  const replies = BATTLE_REPLIES[event];
  if (!lines || !replies) return null;

  const speaker = lines[speakerId] ? speakerId : DIALOGUE_BASE_IDS[speakerId] || speakerId;
  const opponent = replies[opponentId] ? opponentId : DIALOGUE_BASE_IDS[opponentId] || opponentId;
  const opening = lines[speaker];
  const response = replies[opponent];
  if (!opening || !response) return null;
  return [[speakerId, opening], [opponentId, response]];
}

export function victoryLines(winner, loser, loserName = CHARACTER_NAMES[loser] || loser) {
  if (winner !== 'anfitriao') winner = BASE_CHARACTER[winner] || winner;
  // quem derruba o ANFITRIÃO (o das Relíquias ou o Amphitruo) fala com ele — não com o Arnaldo nem com o Gaius
  if ((loser === 'anfitriao' || loser === 'amphitruo') && winner !== 'anfitriao' && VICTORY_VS_HOST[winner]) return VICTORY_VS_HOST[winner];
  loser = BASE_CHARACTER[loser] || loser;
  const w = VICTORY_LINES[winner] || {};
  const matchup = w[loser];
  const lines = Array.isArray(matchup) && matchup.length ? matchup : w.default;
  if (Array.isArray(lines) && lines.length) return lines;
  if (typeof matchup === 'string' && matchup) return [matchup];
  const fallback = VICTORY_FALLBACKS[winner];
  const line = (typeof fallback === 'function' ? fallback(loserName) : fallback) || (typeof w.default === 'string' ? w.default : '');
  return line ? [line] : [];
}

export function victoryLine(winner, loser, loserName = CHARACTER_NAMES[loser] || loser) {
  const lines = victoryLines(winner, loser, loserName);
  return lines.length ? lines[Math.floor(Math.random() * lines.length)] : '';
}

// FERNANDO CARVALHO (Ordo Realitas, Equipe Brasa e Força D) — e o LUCIANO, que divide o corpo com ele. A 1ª fala é do
// Fernando (gentil, ansioso, preocupado com todo mundo); a 2ª é do Luciano quando os olhos ficam amarelos (seco, militar,
// protetor do marido). Relações pela wiki: melhor amigo da Erin e do Tristan; amigo do Arthur (tocaram violão juntos), do
// Joui (o Luciano o chama de "capitão") e da Beatrice; trauma com o Dante, depois confiança; a Agatha o achou covarde e
// depois os dois se entenderam (troca de corpo); preso com o Rubens e o Johnny pela Produção do Anfitrião; o Luciano foi
// da equipe de Varredura com o Arnaldo; o Kian matou o Fernando e tomou o corpo do Luciano; a cicatriz no rosto veio de
// um Devorado do Espreitador; a Seita da Magistrada invadiu a base
const VICTORY_FERNANDO = {
  fernando: {
    arthur: ['Arthur! Tá tudo bem? Depois a gente toca aquela no violão, prometo.', '(olhos amarelos) Levanta, Cervero. O Fê ficou preocupado.'],
    joui: ['Joui, desculpa! Eu não queria bater tão forte.', '(olhos amarelos) De pé, capitão. Bate continência pro Fê.'],
    kaiser: ['Kaiser, você tá bem? Respira, respira.', '(olhos amarelos) Abaixa a arma da próxima vez que apontar pra mim.'],
    dante: ['Dante... eu confio em você agora. Mas hoje fui eu.', '(olhos amarelos) Ainda não esqueci o ritual, Dante. Fica no chão.'],
    erin: ['Erin! Minha melhor amiga no chão... me perdoa, irmã!', '(olhos amarelos) Treino é treino, Erin. Levanta que eu te ajudo.'],
    aghata: ['Viu, Agatha? Nem tão covarde assim.', '(olhos amarelos) Troca de corpo a gente entende. Não se mete com a minha.'],
    balu: ['Nossa, que homem grande! Tá tudo bem aí embaixo?', '(olhos amarelos) Tamanho não é treino, grandão.'],
    carina: ['Desculpa, Carina! Foi o reflexo, juro.', '(olhos amarelos) Previu o ataque. Não previu a troca.'],
    rubens: ['Rubens! A gente sobreviveu ao Anfitrião junto, lembra? Levanta, amigo.', '(olhos amarelos) Palavras-chave: chão. Fim.'],
    beatrice: ['Bia, você me acolheu na van. Desculpa, de verdade.', '(olhos amarelos) Boa mira, florista. A minha é melhor.'],
    verissimo: ['Senhor Veríssimo! Missão cumprida, eu acho?', '(olhos amarelos) Agente Carvalho se apresentando. Senhor.'],
    cristopher: ['Desculpa, Cristopher! Eu sei que dublê aguenta, mas mesmo assim.', '(olhos amarelos) Cena encerrada. Sem dublê pra mim.'],
    kian: ['Você não vai me beijar de novo, Kian.', '(olhos amarelos) Esse corpo é meu. E ele é do Fê.'],
    gal_sal: ['Você usou o meu rosto... sai daqui com essas correntes.', '(olhos amarelos) Escripta no chão. Do jeito que tem que ser.'],
    nubi: ['Me desculpa, mas eu vi o que vocês fazem com as pessoas.', '(olhos amarelos) Sem ritual nenhum. Só eu e a M4.'],
    xande: ['Tá tudo bem, menino? Que skate bonito.', '(olhos amarelos) Volta pra pista, garoto.'],
    guizo: ['Para de filmar, por favor! Eu fico nervoso!', '(olhos amarelos) Desliga essa câmera. Agora.'],
    lirio: ['Desculpa, Lírio! Você bate forte demais pra eu ficar parado.', '(olhos amarelos) Martelo pesado, guarda aberta.'],
    dara: ['Ai, Dara, precisa de curativo? Eu chamo alguém.', '(olhos amarelos) Paramédica no chão. Ironia.'],
    chico: ['Desculpa quebrar a sua engenhoca, Chico!', '(olhos amarelos) Gambiarra não segura bala.'],
    morato: ['Você protege os seus. Eu entendo. Eu também.', '(olhos amarelos) Linha de frente rompida, Morato.'],
    dalmo: ['Que susto! Você é enorme!', '(olhos amarelos) Escafandro tem fresta. Achei.'],
    aguiar: ['Não me caça, por favor! Eu sou só um cantor!', '(olhos amarelos) Caçador virou caça.'],
    jae: ['Eu não gosto de escuro... mas acabou.', '(olhos amarelos) Sussurro não assusta militar.'],
    kemi: ['Sniper me deixa nervoso. Muito nervoso.', '(olhos amarelos) Nada pessoal. Só mira melhor.'],
    labirinto: ['Eu achei a saída! Não acredito!', '(olhos amarelos) Labirinto? Treinei em coisa pior.'],
    juan: ['Por que você gosta tanto de apanhar? Me assusta!', '(olhos amarelos) Descarnar também é comigo, Henri.'],
    cristino: ['Abaixa esse lampião, moço, pelo amor de Deus.', '(olhos amarelos) Cangaço não passa por mim.'],
    raziel: ['Vampiro?! Eu não vou deixar você morder ninguém!', '(olhos amarelos) Sangue? Eu também sei usar.'],
    arnaldo: ['Chega de jogo, Anfitrião. Eu e a Erin saímos da sua sala.', '(olhos amarelos) Fritz. Varredura de novo, só que contra você.'],
    ferreiro: ['A Morte não leva mais ninguém hoje.', '(olhos amarelos) Santo nenhum. Só disciplina.'],
    celestine: ['Não confio em quem muda de lado tão fácil.', '(olhos amarelos) Machadinha guardada. Fim.'],
    gaius: ['Um gladiador! Eu nem sabia que isso ainda existia!', '(olhos amarelos) Arena antiga, tática nova.'],
    amalia: ['Desculpa a flecha. Quer dizer, desculpa a minha.', '(olhos amarelos) Arqueira no chão. Linha limpa.'],
    o_diabo: ['Eu sei o que é sangue no caminho. Volta pra Relíquia!', '(olhos amarelos) Pacto? Já fiz um. Nunca mais.'],
    magistrada: ['Você entrou na nossa base. Não entra mais.', '(olhos amarelos) Sem máscara, sem espaço escuro. Só eu.'],
    estrangeiro: ['Eu vou lembrar disso. Eu vou lembrar de tudo!', '(olhos amarelos) Sinal cortado. Missão concluída.'],
    amigo: ['Ninguém precisa morrer, amigo. Ninguém.', '(olhos amarelos) Desenho rasgado. Próximo.'],
    carnical: ['Não olha pra mim assim! Para!', '(olhos amarelos) Espiral nenhuma me controla.'],
    degolificada: ['Você ainda tem alguém aí dentro... eu sinto muito.', '(olhos amarelos) Fios cortados. Sai do corpo dela.'],
    espreitador: ['Você me deixou essa cicatriz. Mas eu tô aqui.', '(olhos amarelos) Seus Devorados erraram o olho. Eu não erro.'],
  },
  arthur: { fernando: ['Desculpa, Fernando! Depois eu toco a sua no violão, fechado?', 'Calma, Luciano! Foi treino, foi treino!'] },
  joui: { fernando: ['Fernando, você está bem? Eu não queria assustá-lo.', 'Luciano. Volte a dormir. Deixe o Fernando falar.'] },
  kaiser: { fernando: ['Desculpa, Fernando. Eu cuido de você.', 'Luciano. Abaixei a arma, viu?'] },
  dante: { fernando: ['Fernando... eu sinto muito. Pelo ritual. Por tudo.', 'Eu sei que você ainda me odeia, Luciano. Eu entendo.'] },
  erin: { fernando: ['FÊ! Desculpa, desculpa! Respira comigo, tá?', 'Luciano! Volta o Fê pra mim agora, KABOOM ou não!'] },
  aghata: { fernando: ['Viu? A gente troca de corpo e ainda assim cai.', 'Você podia transcender também, Fernando. Pensa nisso.'] },
  balu: { fernando: ['Desculpa, rapaz! Tá vendo? Nem doeu!', 'Ô militar, calma! O outro moço era mais simpático!'] },
  carina: { fernando: ['Vi os seus olhos mudarem. Não deu tempo.', 'Desculpa, Fernando. Levanta.'] },
  rubens: { fernando: ['Fernando. Chão. Desculpa.', 'Luciano. Calma. Treino.'] },
  beatrice: { fernando: ['Fê, desculpa! Vem, deixa eu ver isso.', 'Luciano, devolve o Fernando, por favor?'] },
  verissimo: { fernando: ['Agente Carvalho: os dois precisam treinar juntos.', 'Disciplina, Luciano. O seu marido também conta.'] },
  cristopher: { fernando: ['Corta! Você foi ótimo, Fernando!', 'Dublê militar? Caiu igual.'] },
  kian: { fernando: ['Um último beijo, Fernando? Não precisa de ritual dessa vez.', 'Seu corpo é ótimo, Luciano. Vou cuidar bem dele.'] },
  gal_sal: { fernando: ['Seu rosto fica bonito em mim, sabia?', 'Correntes não ligam pra olho amarelo.'] },
  nubi: { fernando: ['Dois numa casca só. Fácil de prender.', 'O Outro Lado te rejeitou, cantor. Eu não.'] },
  xande: { fernando: ['Foi mal, tio! Quer ajuda pra levantar?', 'Olho amarelo! Tô fora, tô fora!'] },
  guizo: { fernando: ['O olho mudou de cor! Gravei! Gravei!', 'Faz de novo pra câmera?'] },
  lirio: { fernando: ['Bah, guri, desculpa a Leonora.', 'Militar ou cantor, cai do mesmo jeito.'] },
  dara: { fernando: ['Deixa eu ver essa cicatriz. Bem fechada.', 'Calma, eu sou médica. Senta aí.'] },
  chico: { fernando: ['Meu scanner pegou DUAS assinaturas em você!', 'Desculpa, cara! Remendo depois!'] },
  morato: { fernando: ['Você protege o seu. Eu protejo os meus.', 'Levanta. Ninguém fica pra trás.'] },
  dalmo: { fernando: ['Volta pro canto, cantor.', 'Militar? Eu era da arena.'] },
  aguiar: { fernando: ['Caça medrosa corre mais.', 'O outro é mais duro de pegar.'] },
  jae: { fernando: ['Shh... não precisa chamar o marido.', 'Silêncio, os dois.'] },
  kemi: { fernando: ['Nada pessoal, Carvalho. Nenhum dos dois.', 'Mira contra mira. A minha venceu.'] },
  labirinto: { fernando: ['Dois perdidos no mesmo labirinto.', 'Saída nenhuma, Carvalho.'] },
  juan: { fernando: ['Assusta mais! Eu gosto!', 'Descarnar? Eu adoro. Faz de novo!'] },
  cristino: { fernando: ['Cabra assustado, mas valente.', 'O lampião achou os dois.'] },
  raziel: { fernando: ['Dois corações, um sangue só.', 'Sangue de militar. Saboroso.'] },
  arnaldo: { fernando: ['Fernando Carvalho! O cantor! E o marido no camarim!', 'Luciano, velho colega de Varredura! Que reencontro!'] },
  ferreiro: { fernando: ['A Morte já te tocou uma vez, cantor.', 'Ninguém foge do Santo Berço.'] },
  celestine: { fernando: ['Fofo, mas fácil, gato.', 'O marido é mais interessante.'] },
  gaius: { fernando: ['Um músico na arena. Corajoso.', 'O soldado era melhor. Ainda assim, caiu.'] },
  amalia: { fernando: ['Desculpa a flecha, Fernando.', 'Olhos amarelos. Alvo claro.'] },
  o_diabo: { fernando: ['O sangue do seu marido me chama, cantor.', 'Descarnar com o MEU sangue? Que graça.'] },
  magistrada: { fernando: ['O espaço escuro te espera de novo, Fernando.', 'Previsto. Os dois.'] },
  estrangeiro: { fernando: ['Ninguém vai lembrar do cantor.', 'Dois sinais. Ambos perdidos.'] },
  amigo: { fernando: ['...dois... numa pessoa só... todo mundo vai morrer...', '...olhos amarelos... desenho bonito...'] },
  carnical: { fernando: ['(cheira o medo) ...FICA...', '...SOLDADO... DURMA...'] },
  degolificada: { fernando: ['(os fios largam o canivete) ...dois... dentro... igual... a mim...', '(a boca vedada se rasga) ...SAI... DO... CORPO...'] },
  espreitador: { fernando: ['(o olho da boca encara a cicatriz) ...', '(as lágrimas escorrem) ...'] },
};
for (const [w, m] of Object.entries(VICTORY_FERNANDO)) VICTORY_LINES[w] = { ...(VICTORY_LINES[w] || {}), ...m };

// TRISTAN MONTEIRO (Desconjuração): carismático, brincalhão e barulhento; calmo e sóbrio perto do Veríssimo (que o
// treinou e lhe deu a jaqueta). Relações pela wiki: mentor da Erin; da Equipe Brasa com a Erin e o casal Carvalho (lutou
// na Guerra dos Dez Dias com o Luciano); Força D com Arthur, Joui, Kaiser, Dante e Beatrice (jogava Tetris com a
// Beatrice na base); recrutador da Ordem; piromaníaco
const VICTORY_TRISTAN = {
  tristan: {
    arthur: ['Arthur, levanta! Força D não deita no treino.', 'Tocou violão demais e esqueceu de defender, hein?'],
    joui: ['Foi mal, Joui. Mas eu avisei que o fogo ia subir.', 'Rápido demais pra mim? Eu só fiquei parado e queimei o caminho.'],
    kaiser: ['Kaiser, desculpa a sobrancelha. Volta a crescer.', 'Energia contra fogo? Hoje o fogo levou a rodada.'],
    dante: ['Dante, sem ritual na minha frente. Eu sou alérgico.', 'Levanta, Dante. Ainda temos missão amanhã.'],
    erin: ['Erin! Bom treino, pupila. Quase me pegou.', 'Caos contra fogo, Erin? Eu te ensinei esse truque, lembra?'],
    aghata: ['Agatha, transcende aí, mas fica longe do fogo.', 'Esquisita, mas gente boa. Bom treino.'],
    balu: ['Urso grande, fogo maior.', 'Ô Balu! Churrasco depois? Eu acendo.'],
    carina: ['Previu tudo, menos o molotov.', 'Desculpa, Carina. Recrutador tem que mostrar serviço.'],
    rubens: ['Rubens, palavra-chave: queimou.', 'Fala menos ainda que eu, impressionante.'],
    beatrice: ['Bia, Tetris mais tarde? Eu deixo você ganhar dessa vez.', 'Desculpa, Bia! O Orpheu me olhou feio, eu reagi.'],
    fernando: ['Fê! Desculpa, irmão. Vem, levanta.', 'Luciano, a gente já brigou em coisa pior que isso. Levanta, soldado.'],
    verissimo: ['Senhor... eu ainda uso a jaqueta. Obrigado por tudo.', 'Missão cumprida, senhor. Com todo o respeito.'],
    cristopher: ['Dublê bom aguenta fogo, né? Você aguentou.', 'Corta! Essa cena ficou quente.'],
    kian: ['Kian, menos pose e mais defesa.', 'Bonito o corpo. O fogo não liga.'],
    gal_sal: ['Escripta não tira mais nada de ninguém aqui.', 'Corrente queima também, sabia?'],
    nubi: ['Sem cerimônia, Nubi. Só fogo.', 'Pode escrever aí: Tristan esteve aqui.'],
    xande: ['Garoto, quer entrar pra Ordem? Tô falando sério.', 'Bom skate. Mas fogo não pega onda.'],
    guizo: ['Gravou? Manda pra mim depois, ficou incrível.', 'Para de filmar e corre, Guizo!'],
    lirio: ['Bah, tchê, o martelo esquentou.', 'Força bruta contra fogo? Fogo leva fácil.'],
    dara: ['Dara, já que é médica: tem pomada pra queimadura?', 'Desculpa, Dara. Eu levo o kit pra você.'],
    chico: ['Sua engenhoca derreteu, Chico. Foi mal.', 'Gambiarra não é à prova de fogo.'],
    morato: ['Protetor igual a mim. Respeito, Morato.', 'Você protege os seus, eu protejo os meus. Hoje fui eu.'],
    dalmo: ['O escafandro ficou quentinho aí dentro?', 'Grandão, tá cozido.'],
    aguiar: ['Caçador? Eu sou o fogo da caçada.', 'Queimou a armadilha, Aguiar.'],
    jae: ['No escuro? Eu trouxe luz. E fogo.', 'Sussurro não apaga chama.'],
    kemi: ['Sniper de longe, molotov de mais longe.', 'Nada pessoal, Kemi. Só fogo.'],
    labirinto: ['Queimei as paredes do labirinto. Saída achada.', 'Cansei de corredor. Botei fogo.'],
    juan: ['Você gosta de apanhar? Experimenta queimar.', 'Ô Juan, isso é fogo, não carinho.'],
    cristino: ['Lampião contra molotov! Que briga bonita!', 'Fogo com fogo, Cristino. O meu é maior.'],
    raziel: ['Vampiro não gosta de fogo, né? Eu sabia.', 'Sangue ferve, Raziel.'],
    arnaldo: ['Fim do espetáculo, Anfitrião. As cortinas pegaram fogo.', 'Arnaldo, eu cresci ouvindo falar de você. Respeito.'],
    ferreiro: ['A Morte também queima, sabia?', 'Santo nenhum me apaga.'],
    celestine: ['Calamitas? Eu recruto qualquer um, menos você.', 'Corrente quente, Celestine.'],
    gaius: ['Gladiador, a arena virou fogueira.', 'Gládio contra lança-chamas. Covardia minha, admito.'],
    amalia: ['Flecha flamejante? Eu tenho o tanque inteiro.', 'Fogo contra fogo. O meu tem mangueira.'],
    o_diabo: ['Fogo do inferno? Eu tenho o meu.', 'Volta pra Relíquia, Diabo. Tá quente aqui fora.'],
    magistrada: ['Lâmpada acesa, Magistrada. Sem espaço escuro.', 'Seu culto não entra na Ordem enquanto eu respirar.'],
    estrangeiro: ['Pode esquecer de mim. Do fogo você vai lembrar.', 'Sinal queimado, Estrangeiro.'],
    amigo: ['Desenho de tinta queima rápido.', 'Ninguém morre hoje, amigo. Só o papel.'],
    carnical: ['Carniçal assado. Não, obrigado.', 'Some, Carniçal. O fogo te achou.'],
    degolificada: ['Desculpa, menina. Eu queria te salvar.', 'Cabelo pega fogo rápido. Sinto muito.'],
    espreitador: ['Achei você, Espreitador. Com luz e com fogo.', 'Olho nenhum aguenta o lança-chamas.'],
  },
  arthur: { tristan: ['Tristan, menos fogo e mais violão, irmão.', 'Força D treina sério, Tristan!'] },
  joui: { tristan: ['Desculpe, Tristan. Rápido demais para o fogo.', 'Sua chama é barulhenta. Eu sou silêncio.'] },
  kaiser: { tristan: ['Energia contra fogo, Tristan. Dessa vez a minha.', 'Tristan, guarda o isqueiro.'] },
  dante: { tristan: ['O fogo não me assusta, Tristan.', 'Levanta. Ainda preciso de você na missão.'] },
  erin: { tristan: ['Aprendi com o melhor, Tristan! KABOOM!', 'Mestre no chão! A pupila superou!'] },
  aghata: { tristan: ['Fogo é só Energia mal-educada, Tristan.', 'Você é barulhento até caído.'] },
  balu: { tristan: ['Hahaha! Apaga esse fogo, rapaz!', 'O urso não tem medo de churrasco!'] },
  carina: { tristan: ['Vi o molotov antes de você jogar.', 'Previsto, Tristan. Desculpa.'] },
  rubens: { tristan: ['Tristan. Fogo. Apagado.', 'Muito barulho. Pouco golpe.'] },
  beatrice: { tristan: ['Desculpa, Tris! Tetris depois, prometo!', 'O Orpheu não gosta de fogo, Tristan.'] },
  fernando: { tristan: ['Tris! Desculpa! Eu me assustei com o fogo!', '(olhos amarelos) Os Dez Dias me ensinaram mais do que a você, Monteiro.'] },
  verissimo: { tristan: ['Postura, Tristan. E cuide da jaqueta.', 'Ainda tem muito a aprender, garoto.'] },
  cristopher: { tristan: ['Dublê já pegou fogo antes, Tristan.', 'Fogo de cena, garoto. Eu conheço.'] },
  kian: { tristan: ['Fogo não queima a escrita, recrutador.', 'Barulhento. Fraco.'] },
  gal_sal: { tristan: ['O seu rosto vai ficar ótimo em mim.', 'Fogo apaga. Corrente fica.'] },
  nubi: { tristan: ['Até o fogo cede ao Conhecimento.', 'Mais um nome pra lista.'] },
  xande: { tristan: ['Foi mal, tio do fogo!', 'Nem chamuscou o skate!'] },
  guizo: { tristan: ['Gravei o tio do fogo caindo!', 'Faz o fogo de novo pra câmera?'] },
  lirio: { tristan: ['Bah, apaga isso aí, guri.', 'Martelo não pega fogo.'] },
  dara: { tristan: ['Senta aí, eu cuido da queimadura.', 'Fogo demais, paciente.'] },
  chico: { tristan: ['Meu extintor caseiro funcionou!', 'Desculpa, cara! Tecnologia contra fogo, um a zero.'] },
  morato: { tristan: ['Protetor contra protetor. Eu fiquei de pé.', 'Levanta, Tristan. Ninguém fica pra trás.'] },
  dalmo: { tristan: ['Escafandro não pega fogo.', 'Volta pra Ordem, fogueteiro.'] },
  aguiar: { tristan: ['A caça trouxe o próprio fogo.', 'Até o lança-chamas cansa.'] },
  jae: { tristan: ['Shh... apaga a luz, Tristan.', 'No escuro, o fogo some.'] },
  kemi: { tristan: ['Nada pessoal. O tanque era um alvo grande.', 'Mira na mangueira. Simples.'] },
  labirinto: { tristan: ['O labirinto não queima.', 'Você corre em círculos, Tristan.'] },
  juan: { tristan: ['Queimar é gostoso! Mais!', 'Faz de novo! Eu gostei!'] },
  cristino: { tristan: ['Fogo de cabra macho é o meu, rapaz.', 'Lampião ainda manda no sertão.'] },
  raziel: { tristan: ['Seu sangue ferve gostoso, Tristan.', 'Fogo não me alcança no escuro.'] },
  arnaldo: { tristan: ['Tristan Monteiro! O recrutador! Que entrada pirotécnica!', 'Bravo! Mas o fogo é meu cenário, rapaz.'] },
  ferreiro: { tristan: ['A Morte não queima.', 'Até a chama se apaga no Santo Berço.'] },
  celestine: { tristan: ['Quente, mas previsível, gato.', 'Apaga, Tristan.'] },
  gaius: { tristan: ['Fogo de soldado. Respeito.', 'Na arena, quem queima é quem cai.'] },
  amalia: { tristan: ['A minha flecha queima mais bonito.', 'Fogo contra fogo. O meu tem mira.'] },
  o_diabo: { tristan: ['Você chama isso de fogo?', 'Eu sou o inferno, rapaz.'] },
  magistrada: { tristan: ['A Ordem tem um a menos, recrutador.', 'Previsto, Tristan. Até o molotov.'] },
  estrangeiro: { tristan: ['Ninguém vai lembrar do recrutador.', 'Sinal apagado.'] },
  amigo: { tristan: ['...fogo... bonito... todo mundo vai morrer...', '...desenha o fogo... de novo...'] },
  carnical: { tristan: ['...QUENTE... FICA...', '(fareja a fumaça) ...SOLDADO...'] },
  degolificada: { tristan: ['(os fios largam o lança-chamas) ...quente... dói...', '(a boca vedada se rasga) ...SEM... FOGO...'] },
  espreitador: { tristan: ['(o olho da boca encara o fogo) ...', '(as lágrimas escorrem e apagam a chama) ...'] },
};
for (const [w, m] of Object.entries(VICTORY_TRISTAN)) VICTORY_LINES[w] = { ...(VICTORY_LINES[w] || {}), ...m };
// IVETE BEICUR (Desconjuração): bruta e fria com estranhos, carinhosa com os de perto. Relações pela wiki: mãe do Arthur
// (e "tia" do Kaiser e do Joui, "Ivete-san" pelo Joui); amiga do Brúlio; cantou o Balu até o beijo na sinuca (o Rubens
// perdeu de propósito); desconfiou do Dante e depois o aceitou em casa; salva pelo Rubens contra o Carniçal da Esfinge;
// "Ivetinha" pela Erin; atormentada pelo Espreitador; refém da Seita das Máscaras; cuida do arsenal da Ordem
const VICTORY_IVETE = {
  ivete: {
    arthur: ['Levanta, meu filho. A mãe pegou pesado, eu sei.', 'Arthur, come alguma coisa depois. Tá fraco.'],
    joui: ['Joui, querido, levanta. A tia faz bolinho de chuva depois.', 'Ivete-san ganhou essa, hein?'],
    kaiser: ['Kaiser, para de reclamar e me ajuda a lavar a louça.', 'Tu é rápido, guri. Mas eu sou mais teimosa.'],
    dante: ['Viu, Dante? Ainda bem que eu te deixei entrar em casa.', 'Levanta, piá. Depois tu reza lá no orfanato.'],
    erin: ['Ivetinha uma ova. Levanta, menina.', 'Explode menos e defende mais, Erin.'],
    aghata: ['Agatha, menina estranha. Gosto de ti.', 'Senta. Eu sirvo um chá pra tu se acalmar.'],
    balu: ['Balu, meu bem... perdeu, mas o beijo tá de pé.', 'Levanta, grandão. Depois a gente joga uma sinuca.'],
    carina: ['Previu essa garrafada, Carina? Não, né.', 'Princesa, no meu bar tu lavava os copos.'],
    rubens: ['Rubens, tu me salvou na Itália. Hoje eu te derrubei. Estamos quites.', 'Perdeu de propósito de novo, Rubens?'],
    beatrice: ['Bia, segura esse passarinho. Ninguém se machucou.', 'Bom treino, menina. Agora vai comer.'],
    fernando: ['Fernando, querido, respira. Já passou.', 'Luciano, guarda essa arma antes que eu guarde pra ti.'],
    tristan: ['Tristan, apaga esse fogo dentro do meu bar!', 'Recrutador? Tu recrutou foi uma surra.'],
    verissimo: ['Senhor Veríssimo, com todo o respeito... levanta.', 'Até o chefe cai, né, Veríssimo.'],
    cristopher: ['Tu é o pai do Kaiser? Educa melhor esse menino.', 'Dublê, é? Caiu bonito.'],
    kian: ['Tu levou o Joui e o Kaiser de mim. Isso aqui foi pouco.', 'Escreve isso no teu corpo: Ivete ganhou.'],
    gal_sal: ['Tira essa cara emprestada e some.', 'Corrente nenhuma segura uma gaudéria.'],
    nubi: ['Tua lista acabou aqui, menina.', 'Conhecimento? Eu conheço é espingarda.'],
    xande: ['Guri, pega teu skate e vai pra casa.', 'Com essa idade e já apanhando de véia?'],
    guizo: ['Desliga essa câmera, moleque.', 'Grava isso: a tia aqui ainda manda.'],
    lirio: ['Bah, tchê, tu bate forte. Eu bato mais.', 'Senta aí que eu te sirvo uma gelada.'],
    dara: ['Doutora, cuida de ti agora.', 'Desculpa, Dara. Mas tu pediu.'],
    chico: ['Tua gambiarra não é páreo pro arsenal da Ordem.', 'Chico, me vende umas peças depois.'],
    morato: ['Protetor dos teus, eu dos meus. Hoje fui eu.', 'Respeito, Morato. Mas no meu bar não.'],
    dalmo: ['Esse capacete não te salvou de chumbo, grandão.', 'Vai, tira esse escafandro e senta.'],
    aguiar: ['Caçador, a caça tinha espingarda.', 'Teus cachorros fugiram. Tu devia ter ido junto.'],
    jae: ['No escuro? Eu já atirei em coisa pior no escuro.', 'Sussurra menos e foge mais.'],
    kemi: ['Mira de longe, menina? Eu chego perto.', 'Sniper nenhuma passa da minha porta.'],
    labirinto: ['Achei a saída. Era a minha espingarda.', 'Tira esse capacete e vai trabalhar.'],
    juan: ['Gosta de apanhar? Tá no lugar certo.', 'Vai embora, Juan. Tu me cansa.'],
    cristino: ['Lampião é lindo, mas espingarda resolve.', 'Cabra macho? Gaudéria é pior.'],
    raziel: ['Vampiro no meu bar? Chumbo grosso nele.', 'Teu sangue é ruim, Raziel. Nem pra drink serve.'],
    arnaldo: ['Fim da peça, Anfitrião. Fecha a cortina.', 'Senhor Fritz... o senhor era melhor no teatro.'],
    ferreiro: ['Santo nenhum me tira o que sobrou.', 'Volta pro teu Santo Berço, homem.'],
    celestine: ['Gata, pode guardar essa corrente.', 'Não gostei de ti. Some.'],
    gaius: ['Gladiador? Eu já briguei com motoqueiro maior que tu.', 'Arena boa, mas o bar é melhor.'],
    amalia: ['Flecha? Eu tenho chumbo.', 'Boa mira, menina. A minha é melhor.'],
    o_diabo: ['Vai pro inferno. De novo.', 'Já perdi tudo uma vez. Tu não me assusta.'],
    magistrada: ['Já me pegaram de refém uma vez. Nunca mais.', 'Tira a máscara e vai embora da minha casa.'],
    estrangeiro: ['Eu não esqueço quem eu amo. Nem tu.', 'Pode ir, estranho. Ninguém vai lembrar de ti mesmo.'],
    amigo: ['Desenho feio. Vai pro lixo.', 'Ninguém morre hoje, bicho de tinta.'],
    carnical: ['Agora não tem Rubens pra me salvar. Nem precisou.', 'Some, bicho. Fede mais que o banheiro do bar.'],
    degolificada: ['Desculpa, menina. Descansa agora.', 'Chega de cabelo. Chega.'],
    espreitador: ['Tu me atormentou demais. Acabou.', 'Olha pra mim agora, bicho. Olha bem.'],
  },
  arthur: { ivete: ['Desculpa, mãe! Eu juro que segurei!', 'Mãe... a senhora tá bem? Fala comigo.'] },
  joui: { ivete: ['Me desculpe, Ivete-san! Foi sem querer!', 'Tia, eu ajudo a senhora a levantar.'] },
  kaiser: { ivete: ['Foi mal, Ivete! Eu lavo a louça a semana toda.', 'Ganhei! Agora quem cozinha hoje é a senhora.'] },
  dante: { ivete: ['Desculpe, dona Ivete. Obrigado por me deixar ficar.', 'Até a senhora cai às vezes.'] },
  erin: { ivete: ['Ivetinha no chão! Desculpa, desculpa!', 'KABOOM! Foi carinhoso, juro.'] },
  aghata: { ivete: ['Sua energia é bonita, Ivete. Teimosa, mas bonita.', 'Desculpa. Eu sirvo o chá dessa vez.'] },
  balu: { ivete: ['Hahaha! Desculpa, minha flor! Te levanto no colo!', 'Ganhei! Agora quem paga a bebida sou eu!'] },
  carina: { ivete: ['Vi a garrafa antes de sair da sua mão.', 'Desculpe, Ivete. Era previsto.'] },
  rubens: { ivete: ['Ivete. Levanta. Eu ajudo.', 'Dessa vez eu não perdi de propósito.'] },
  beatrice: { ivete: ['Desculpa, dona Ivete! O Orpheu se empolgou!', 'A senhora é forte demais pra idade!'] },
  fernando: { ivete: ['Dona Ivete! Desculpa! Eu me assustei!', '(olhos amarelos) Fica no arsenal, senhora.'] },
  tristan: { ivete: ['Foi mal, Ivete! Me vende mais combustível?', 'Eu recruto qualquer um, até a senhora!'] },
  verissimo: { ivete: ['Postura, Ivete. E cuide do arsenal.', 'A Ordem precisa da senhora inteira.'] },
  cristopher: { ivete: ['Obrigado por cuidar do meu filho, Ivete.', 'Dublê aguenta queda. A senhora também.'] },
  kian: { ivete: ['A velha do bar. Mais uma pra perder tudo.', 'Teus meninos já são meus.'] },
  gal_sal: { ivete: ['Seu rosto cansado vai ficar ótimo em mim.', 'Até a velha cai.'] },
  nubi: { ivete: ['Mais um nome pra lista, senhora.', 'O Conhecimento não serve drink.'] },
  xande: { ivete: ['Foi mal, tia! Não conta pra minha mãe!', 'Nem chamuscou o skate!'] },
  guizo: { ivete: ['Gravei a tia caindo! Desculpa!', 'Faz de novo pra câmera, tia?'] },
  lirio: { ivete: ['Bah, desculpa, tia. Mão pesada.', 'Gaudéria contra gaúcho. Ganhei essa.'] },
  dara: { ivete: ['Senta, Ivete. Deixa eu ver esse joelho.', 'Pressão alta, hein? Calma.'] },
  chico: { ivete: ['Desculpa, dona! Me vende a espingarda depois?', 'Gambiarra um, arsenal zero!'] },
  morato: { ivete: ['Protetora como eu. Respeito, senhora.', 'Levanta, senhora. Ninguém fica pra trás.'] },
  dalmo: { ivete: ['Chumbo não entra no escafandro.', 'Volta pro bar, senhora.'] },
  aguiar: { ivete: ['A caça tinha espingarda. Não bastou.', 'Cansou, velha?'] },
  jae: { ivete: ['Shh... no escuro, a senhora não vê.', 'Apagou o cigarro sozinha.'] },
  kemi: { ivete: ['Nada pessoal, senhora. Só distância.', 'Espingarda não alcança aqui.'] },
  labirinto: { ivete: ['A senhora se perdeu no labirinto.', 'Sem saída, senhora.'] },
  juan: { ivete: ['Me bate de novo, tia! Gostei!', 'Garrafada é bom demais!'] },
  cristino: { ivete: ['Respeito a mulher macha, mas o sertão é meu.', 'Espingarda boa. Lampião melhor.'] },
  raziel: { ivete: ['Sangue velho, mas gostoso.', 'Fique quietinha no escuro, senhora.'] },
  arnaldo: { ivete: ['Dona Ivete! A dona do bar! Que entrada!', 'Bravo! Mas o palco é meu, senhora.'] },
  ferreiro: { ivete: ['A Morte vem pra todos, senhora.', 'Seu bar fechou. Sua hora também.'] },
  celestine: { ivete: ['Velha e teimosa. Gostei, gata.', 'Corrente não larga, senhora.'] },
  gaius: { ivete: ['Na arena, a idade pesa.', 'Coragem de soldado, senhora.'] },
  amalia: { ivete: ['Minha flecha chega antes do chumbo.', 'Boa luta, senhora.'] },
  o_diabo: { ivete: ['Você já perdeu tudo. Perde de novo.', 'Eu sou o fogo que levou seus Gaudérios.'] },
  magistrada: { ivete: ['Refém de novo, senhora.', 'Previsto. Até a espingarda.'] },
  estrangeiro: { ivete: ['Ninguém vai lembrar da dona do bar.', 'Esquecida, senhora.'] },
  amigo: { ivete: ['...velha... bonita... todo mundo morre...', '...desenha a senhora... de novo...'] },
  carnical: { ivete: ['...MUITOS... JUNTOS... AQUI...', '(salta sobre ela) ...FERIDA...'] },
  degolificada: { ivete: ['(os fios largam a espingarda) ...mãe...', '(a boca vedada se rasga) ...FICA...'] },
  espreitador: { ivete: ['(o olho da boca encara a Ivete) ...', '(os olhos dela doem e ficam amarelos) ...'] },
};
for (const [w, m] of Object.entries(VICTORY_IVETE)) VICTORY_LINES[w] = { ...(VICTORY_LINES[w] || {}), ...m };

// OS LUKIC E A ARTEMIS (Escriptas, 2026-11-12): falas originais do jogo (tom do cânone: o Damir arrogante e ganancioso
// que chama o irmão de "Grandão"; o Boris sereno, de sorriso meigo, que quer matar o Diabo "por Lucas"; a Artemis, a
// "Mamãe", com o Gambá no bolso e "o homem" na cabeça)
const VICTORY_LUKIC = {
  damir: {
    arthur: ['Guitarra bonita, Cervero. Vende? Eu pago bem.', 'Fica de joelho mais um pouco. Combina com você.'],
    joui: ['Espada cara. Pena do dono.', 'Rápido, rápido... e no chão. Que desperdício.'],
    kaiser: ['Tira uma foto minha. De cima.', 'Agente da Ordem, salário de agente da Ordem.'],
    dante: ['Você saiu dos Escriptas, Dante. Eu fiquei com o lugar.', 'Embaralhar? Eu inventei de embaralhar melhor.'],
    erin: ['Explosão barata. Eu trabalho com coisa fina.', 'Senta, menina. Antes que eu mande.'],
    aghata: ['Seu grimório é grande. O meu caderninho funciona.', 'Sangue é caro. Eu prefiro saber.'],
    balu: ['Grandão por grandão, o meu irmão é maior.', 'Machado bonito. Quanto vale?'],
    carina: ['Previu essa, princesa? Eu previ antes.', 'Herança dos Leone? Agora vale menos.'],
    rubens: ['Volta quantas vezes quiser, doutor. Eu cobro por visita.', 'Martelo pesado pra quem cai tão fácil.'],
    beatrice: ['O passarinho fugiu de mim. Esperto.', 'Senta, florista. Isso, boa menina.'],
    fernando: ['Dois numa cabeça e nenhum presta.', 'Seja quem for aí dentro: perdeu.'],
    tristan: ['Recrutador? Eu não trabalho de graça.', 'Fogo apaga. Conhecimento fica.'],
    verissimo: ['Estrategista da Ordem. Cadê a estratégia?', 'Velho, eu sei o que você esconde. E vendo barato.'],
    cristopher: ['Dublê cai profissional. Você caiu amador.', 'Diz pro seu filho que eu mandei lembrança.'],
    kian: ['Eu achava que você era o mais forte, Kian. Achava.', 'Isso foi pela marca que você me deu.'],
    gal_sal: ['As suas correntes rangem demais, Gal.', 'Injustiça? Não. Isso foi preço justo.'],
    nubi: ['Pra você durou horas. Pra mim, um bocejo.', 'Você vê devagar. Eu penso rápido.'],
    xande: ['Teoria do caos? Eu tenho cartas.', 'Senta no skate e some, moleque.'],
    guizo: ['Grava isso: Damir Lukic, invicto.', 'Câmera boa. Vou levar.'],
    lirio: ['Bah, tchê. Senta.', 'A sua parede tem preço. Eu paguei.'],
    dara: ['Cura a si mesma agora, doutora.', 'Lanterna UV não ilumina o que eu sei.'],
    chico: ['Gambiarra? Eu sou o produto original.', 'Fones bonitos. Vou levar também.'],
    morato: ['Líder dos Cinco, ajoelhado. Bela foto.', 'Protege os seus. Eu protejo o meu bolso.'],
    dalmo: ['Escafandro não segura ordem, grandão.', 'A arena aplaude quem ganha. Aplaude, vai.'],
    aguiar: ['O caçador sentou. Que cachorrinho obediente.', 'Seus cães têm mais juízo que você.'],
    jae: ['No escuro eu também leio, querida.', 'Silêncio? Eu falo por nós dois.'],
    kemi: ['Mira boa. Cabeça ruim.', 'Contrato cancelado. Sem reembolso.'],
    labirinto: ['Labirinto pra quem não sabe ler o mapa.', 'Achei a saída. Era você no chão.'],
    juan: ['Priminho, priminho... o circo ficou pra mim.', 'O tio Lucas ia ter vergonha de você, Juan.'],
    cristino: ['Lampião é luz de pobre.', 'Sertão bonito. Vendo terreno lá?'],
    raziel: ['Vinho bom é o que eu escolho, vampiro.', 'Me chamam de Vinho. Você só bebe.'],
    arnaldo: ['A peça era sua. O ingresso, meu.', 'Saber tudo, Anfitrião, é ganhar tudo.'],
    ferreiro: ['A Morte é do meu irmão. Eu fico com o resto.', 'Santo Berço? Bonito. Quanto vale?'],
    celestine: ['Gata, senta. Isso.', 'Corrente dourada? Eu fico com ela.'],
    gaius: ['Roma caiu. Você também.', 'Gladiador lutando por plateia. Eu luto por lucro.'],
    amalia: ['Flecha? Eu tenho baralho.', 'Arqueira sem flecha é só uma moça bonita.'],
    o_diabo: ['Eu queria você ajoelhado. Consegui.', 'Diabo... no fim, nem você tinha nada.'],
    magistrada: ['Saber tudo é perder tudo. Eu quase acreditei.', 'O Equilíbrio também tem preço.'],
    estrangeiro: ['Ninguém vai esquecer de mim, estranho.', 'Eu anotei seu nome no caderninho.'],
    amigo: ['Desenho de criança. Senta.', 'Tinta se lava, coisa feia.'],
    carnical: ['Fede. Mas obedece.', 'Senta, bicho. Isso.'],
    degolificada: ['Cabelo demais, cabeça de menos.', 'Fica aí, menina. Senta.'],
    espreitador: ['Olha pra mim? Prefiro que olhe pro chão.', 'Na mansão você manda. Aqui, eu.'],
    ivete: ['Tia, me vende essa espingarda?', 'Senta, tia. Pede um chá.'],
    boris: ['Grandão... você não precisava me obedecer dessa vez.', 'Desculpa, irmão. Eu sempre precisei ganhar de alguém.'],
    artemis: ['Mamãe? Senta, mamãe.', 'Seu bicho fugiu pro bolso. Esperto, o bicho.'],
  },
  boris: {
    arthur: ['Levanta, garoto. Não foi nada pessoal.', 'Toca alguma coisa pra gente depois, Cervero.'],
    joui: ['Espada boa. Mão firme. Faltou peso.', 'Descansa, menino. Você lutou bem.'],
    kaiser: ['Fica no chão um pouco. A névoa passa.', 'Você é corajoso. Eu gosto de gente corajosa.'],
    dante: ['Você saiu dos Escriptas e ficou vivo. Que bom.', 'Lodo não segura gadanha, amigo.'],
    erin: ['Muito barulho, menina. Eu só ceifo.', 'Machucou? Desculpa.'],
    aghata: ['Sangue contra Morte. A Morte espera mais.', 'Você é forte. Eu sou maior.'],
    balu: ['Grandão contra grandão. Boa luta, amigo.', 'Seu machado é bonito. A minha gadanha também.'],
    carina: ['Previu o golpe? Que bom. Não adiantou.', 'Desculpa, moça. É o trabalho.'],
    rubens: ['Você volta sempre, doutor. Eu também.', 'Levanta devagar. Isso.'],
    beatrice: ['Cuida do seu pássaro, moça.', 'Não chora. Foi rápido.'],
    fernando: ['Quem quer que esteja aí... descansa.', 'Calma, rapaz. Respira.'],
    tristan: ['Fogo não pega em quem já esteve no inferno.', 'Apaga isso, rapaz.'],
    verissimo: ['O senhor é forte pra idade. Respeito.', 'Até os chefes cansam.'],
    cristopher: ['Caiu bonito. Igual no circo.', 'Você é pai. Volta pra casa.'],
    kian: ['Eu sei como isso termina, Kian. Hoje não.', 'Seja do seu lado ou do outro... o Diabo é meu.'],
    gal_sal: ['Correntes no trapézio eram mais seguras.', 'Descansa, Gal.'],
    nubi: ['Devagar ou rápido, a Morte chega igual.', 'Você me viu chegando. Desculpa.'],
    xande: ['Garoto, vai pra casa.', 'Skate bom. Toma cuidado.'],
    guizo: ['Pode gravar. Não tenho vergonha.', 'Câmera inteira? Que bom.'],
    lirio: ['Bah, você bate forte, tchê.', 'Parede boa. A minha gadanha passou.'],
    dara: ['Cuida dessa ferida, doutora.', 'Desculpa. Eu tento não machucar médico.'],
    chico: ['Sua gambiarra quebrou. Conserta depois.', 'Levanta, amigo.'],
    morato: ['Você protege os seus. Eu protejo o meu irmão.', 'Respeito, líder.'],
    dalmo: ['A arena gosta de gente grande. Hoje fui eu.', 'Pela Manu? Pelo meu irmão.'],
    aguiar: ['Seus cães têm medo de mim. Eles sabem.', 'Caçador caçado. Acontece.'],
    jae: ['Escuro não me assusta. Eu já fui do Diabo.', 'Te achei.'],
    kemi: ['O elmo segura bala. Desculpa.', 'Boa mira. Pena.'],
    labirinto: ['Eu só andei reto. Sempre funciona.', 'Saída achada.'],
    juan: ['Primo... levanta. Pelo tio Lucas.', 'A gente cresceu no mesmo circo, Juan. Lembra disso.'],
    cristino: ['Gente de lampião. Eu gosto.', 'Dorme, homem do sertão.'],
    raziel: ['Bebe outra coisa, vampiro.', 'O Elmo não deixa Sangue passar.'],
    arnaldo: ['O show acabou, Anfitrião.', 'Eu já fui de circo. O seu é pior.'],
    ferreiro: ['Morte com Morte. Eu cheguei primeiro.', 'Descansa, Ferreiro.'],
    celestine: ['Corrente bonita. Solta.', 'Calma, moça.'],
    gaius: ['Gladiador forte. Eu sou mais teimoso.', 'Roma acabou faz tempo, amigo.'],
    amalia: ['A flecha bateu no elmo.', 'Boa mira, moça.'],
    o_diabo: ['Por Lucas.', 'Eu disse que ia te matar. De qualquer lado.'],
    magistrada: ['Equilíbrio nenhum me tira do caminho.', 'Calma, senhora.'],
    estrangeiro: ['Pode esquecer de mim. Eu não esqueço do meu irmão.', 'Vai embora, estranho.'],
    amigo: ['Tinta corta igual.', 'Volta pro desenho.'],
    carnical: ['Até bicho grande cai.', 'Fica quieto, bicho.'],
    degolificada: ['Descansa, menina.', 'Os fios cortaram fácil.'],
    espreitador: ['Olha bem. É o último que você vê.', 'Não tenho medo de mansão.'],
    ivete: ['Desculpa, senhora. Me serve uma bebida depois?', 'A senhora é brava. Gosto.'],
    damir: ['Desculpa, irmão. Hoje você não mandou.', 'Levanta, Damir. Eu ainda tô aqui.'],
    artemis: ['Esconde o bicho, Mamãe. Já acabou.', 'Desculpa, Artemis. Foi rápido.'],
  },
  artemis: {
    arthur: ['Gostou do que a mamãe fez, Cervero?', 'Garoto bonito no chão. Fica assim.'],
    joui: ['Espadinha. A mamãe tem soqueira.', 'Shh. Dorme, menino.'],
    kaiser: ['Tira uma foto. Pro meu álbum.', 'Cansado e com fome? A mamãe também.'],
    dante: ['Você fugiu dos Escriptas. A mamãe achou você.', 'Lodo sujo. Eu prefiro sangue.'],
    erin: ['Explode, explode... e cai.', 'Barulhenta. O Gambá odeia barulho.'],
    aghata: ['Sangue com sangue. O meu é mais teimoso.', 'Gostou? Eu também.'],
    balu: ['Grandão bonito. Grandão no chão.', 'O Gambá mordeu primeiro. Eu só terminei.'],
    carina: ['Previu o Gambá? Ninguém prevê o Gambá.', 'Princesa no chão. Linda.'],
    rubens: ['Volta pra mim, doutor. A mamãe espera.', 'Eu também sei fazer curativo. Mal.'],
    beatrice: ['Seu passarinho, meu gambá. Eu ganhei.', 'Florzinha, fica quieta.'],
    fernando: ['Dois meninos, uma surra.', 'O homem mandou eu bater nos dois.'],
    tristan: ['Fogo? A mamãe já queimou coisa pior.', 'Recruta essa, bonito.'],
    verissimo: ['Velho esperto. Mamãe esperta.', 'Relatório: perdeu pra mamãe.'],
    cristopher: ['Paizão no chão. Que fofo.', 'Dublê bom cai sem chorar.'],
    kian: ['A mamãe obedece, Kian. Mas hoje bateu.', 'Gostou do que a mamãe fez? Você ensinou.'],
    gal_sal: ['Corrente não prende gambá.', 'Gal, querido. Senta.'],
    nubi: ['Devagar pra você. Gostoso pra mim.', 'Pra você durou horas? Que delícia.'],
    xande: ['Moleque, vai pra casa da sua mãe.', 'Skate bonito. O Gambá dorme nele.'],
    guizo: ['Filmou a mamãe? Manda pra mim.', 'Câmera desligada. Agora sim.'],
    lirio: ['Tchê, a mamãe gostou.', 'Paredona caiu.'],
    dara: ['Doutora, cuida do meu Gambá também?', 'Lanterna na cara não. Feio.'],
    chico: ['Gambiarra quebrada. Gambá inteiro.', 'Me dá esses fones.'],
    morato: ['Líder no chão. A mamãe manda agora.', 'Protege os seus? Eu protejo o meu bicho.'],
    dalmo: ['Escafandro abre. A mamãe sabe abrir.', 'A arena gostou de mim.'],
    aguiar: ['Seus cachorros fugiram do meu gambá.', 'Caçador virou comida.'],
    jae: ['No escuro? O Gambá enxerga.', 'Shh... a mamãe também sabe ser quieta.'],
    kemi: ['Mira de elite contra mira de elite. A minha venceu.', 'Atira de longe, menina? Eu chego perto.'],
    labirinto: ['O Gambá achou a saída.', 'Mamãe nunca se perde.'],
    juan: ['Gosta de apanhar? A mamãe gosta de bater.', 'Pede mais, Juan. Pede.'],
    cristino: ['Bonito, o cabra. Bonito no chão.', 'Lampião apagou. Que pena.'],
    raziel: ['Vampiro? A mamãe também gosta de sangue.', 'Devorar é comigo, bonito.'],
    arnaldo: ['A mamãe trocou de rosto melhor que você, ator.', 'Bravo. Bravo pra mim.'],
    ferreiro: ['Morte? A mamãe já morreu um pouquinho também.', 'Santo nenhum, querido.'],
    celestine: ['Gata contra gambá. Gambá ganha.', 'Corrente de ouro? Fica bonita em mim.'],
    gaius: ['Gladiador gostoso. No chão.', 'Roma no chão.'],
    amalia: ['Flecha? Eu tenho rifle.', 'Boa mira. A da mamãe é melhor.'],
    o_diabo: ['O homem disse que você não era tão grande.', 'Gostou, Diabo? A mamãe fez pra você.'],
    magistrada: ['Equilíbrio? A mamãe é desequilibrada.', 'Previsto? Não por você.'],
    estrangeiro: ['Ninguém esquece a mamãe.', 'Vai, estranho. Some.'],
    amigo: ['Tinta é gostosa? O Gambá provou.', 'Desenho feio. Rasga.'],
    carnical: ['Bicho grande, bicho feio.', 'Devorar? Eu devoro você.'],
    degolificada: ['Cabelo bonito. Arranco?', 'Dorme, menina. A mamãe tá aqui.'],
    espreitador: ['Olha pra mamãe. Isso.', 'Na mansão, o Gambá se escondia. Aqui não.'],
    ivete: ['Tia, um drink pra mamãe?', 'Espingarda não assusta gambá.'],
    damir: ['Senta você, Damir.', 'Seu caderninho é bonitinho. Pena.'],
    boris: ['Grandão bonzinho. Dorme.', 'Gostou do que a mamãe fez, Boris?'],
  },
  arthur: { damir: ['Fica com sua grana, Damir. Eu fico com a Ordem.', 'Vendo nada. Nem a guitarra.'], boris: ['Desculpa, grandão. Você é um cara legal.', 'O elmo segurou bala. Não segurou sangue.'], artemis: ['Esconde o seu gambá, Artemis. Ele tá com medo.', 'Você não é a minha mãe.'] },
  joui: { damir: ['Senta você, Damir-san.', 'Arrogância também é uma lâmina. Cega.'], boris: ['Gomen, Boris-san. Você foi gentil.', 'A gadanha é pesada demais pra pressa.'], artemis: ['Me perdoe, senhora. E o gambá também.', 'Mamãe? Não a minha.'] },
  kaiser: { damir: ['Foto do Damir ajoelhado. Vou emoldurar.', 'Menos conversa, Lukic.'], boris: ['Foi mal, grandão. Você parecia gente boa.', 'Elmo bonito. Foto dele.'], artemis: ['Cuidado com o bicho. Ele morde.', 'Mamãe? Eu sou adulto, valeu.'] },
  dante: { damir: ['Os Escriptas não mudaram, Damir.', 'Seu baralho tem cartas marcadas.'], boris: ['Descanse, Boris.', 'A Morte sorri pra você também.'], artemis: ['O lodo não tem cheiro de mamãe.', 'Fica longe, Artemis.'] },
  erin: { damir: ['KABOOM no chapéu roxo!', 'Senta você, careca!'], boris: ['Desculpa, grandão! Foi carinhoso!', 'Explodi o seu elmo? Ops.'], artemis: ['O gambá era fofo! Desculpa!', 'Mamãe explodiu!'] },
  aghata: { damir: ['Conhecimento sem respeito é só ganância.', 'Seu caderninho é raso.'], boris: ['Você tem uma energia gentil. Estranho.', 'Morte serena. Bonita.'], artemis: ['Sangue confuso, Artemis.', 'O homem na sua cabeça mente.'] },
  balu: { damir: ['Senta, magrelo! Ha ha!', 'Esse chapéu ficou torto!'], boris: ['Grandão contra grandão! Boa, amigo!', 'Bora tomar uma depois, Boris!'], artemis: ['Hahaha! O bichinho é fofo, moça!', 'A mamãe aqui sou eu, tá?'] },
  carina: { damir: ['Previ a sua ganância, Damir.', 'Herança se respeita.'], boris: ['Previ cada golpe. Eram honestos.', 'Desculpe, Boris.'], artemis: ['Previ o gambá. E o tiro.', 'Mamãe nenhuma prevê melhor.'] },
  rubens: { damir: ['Senta você. Eu cuido de você depois.', 'Ganancioso até no chão.'], boris: ['Fica quieto, grandão. Eu cuido.', 'Elmo bom. Cabeça melhor.'], artemis: ['Deixa eu ver essa mordida no seu gambá.', 'Respira, Artemis.'] },
  beatrice: { damir: ['O Orpheu não senta pra ninguém!', 'Chapéu bonito. Pena.'], boris: ['Desculpa, Boris! Você é tão gentil!', 'O Orpheu gostou de você.'], artemis: ['O Orpheu e o Gambá podiam ser amigos!', 'Desculpa, Artemis!'] },
  fernando: { damir: ['D-desculpa! Ele mandou eu sentar!', '(olhos amarelos) Senta você, mágico.'], boris: ['Desculpa, senhor grandão!', '(olhos amarelos) Grande. Mas lento.'], artemis: ['O gambá me mordeu! Desculpa!', '(olhos amarelos) Fica longe, mamãe.'] },
  tristan: { damir: ['Vem pra Ordem, Damir? Pagamos mal.', 'Fogo no chapéu!'], boris: ['Recrutaria você na hora, grandão.', 'Elmo não segura fogo.'], artemis: ['Quer entrar pra Ordem? Traz o gambá.', 'Fogo e gambá não combinam.'] },
  verissimo: { damir: ['Ganância é um péssimo estrategista.', 'Sente-se, Lukic.'], boris: ['Lealdade cega ainda é cega, Boris.', 'Bom soldado. Lado errado.'], artemis: ['Instável. Eu anoto.', 'Ninguém aqui é sua família, Artemis.'] },
  cristopher: { damir: ['Corta! Senta você!', 'Cena de ganância? Já fiz melhor.'], boris: ['Ex-trapezista? Respeito, grandão!', 'Caiu como dublê!'], artemis: ['Esse bicho não tava no roteiro!', 'Mamãe? Eu sou o pai aqui!'] },
  kian: { damir: ['Você nunca teve nada, Damir.', 'A marca ainda é minha.'], boris: ['Eu já vi o fim disso, Boris.', 'Lealdade ao irmão. Sempre a mesma.'], artemis: ['Obedeça, Artemis.', 'O homem fala por mim também.'] },
  gal_sal: { damir: ['Ganância também é uma corrente, Damir.', 'Senta. Na injustiça.'], boris: ['Desculpe, Boris. Você não merecia.', 'As correntes pesam mais que a gadanha.'], artemis: ['Esconde o bicho. A corrente aperta.', 'Mamãe nenhuma, Artemis.'] },
  nubi: { damir: ['A sua pressa me deu um século.', 'Senta. Devagar.'], boris: ['O seu sorriso durou horas pra mim, Boris.', 'Calma. Você é gentil.'], artemis: ['O gambá demorou um dia pra pular.', 'Shh, Artemis.'] },
  xande: { damir: ['Teoria do caos: o careca caiu.', 'Senta você, véi!'], boris: ['Grandão, foi mal! Respeito!', 'Elmo massa, véi.'], artemis: ['O gambá roubou meu skate!', 'Tia doida, véi.'] },
  guizo: { damir: ['Gravei o Lukic ajoelhado!', 'Câmera minha, careca!'], boris: ['Grandão gente boa! Foto?', 'Gravei a gadanha!'], artemis: ['Um GAMBÁ ALIENÍGENA!', 'Gravei a mamãe caindo!'] },
  lirio: { damir: ['Bah, tchê, o chapéu voou.', 'Senta tu, guri.'], boris: ['Bah, que grandão gente boa.', 'Leonora segurou a gadanha.'], artemis: ['Bah, o bichinho morde!', 'Tu é bem louca, tchê.'] },
  dara: { damir: ['Deixa eu ver esse olho, Damir.', 'Ganância não é doença. Mas parece.'], boris: ['Senta, Boris. Deixa eu ver.', 'Você é gentil demais pra isso.'], artemis: ['Esse gambá tá vacinado?', 'Respira, Artemis.'] },
  chico: { damir: ['Gambiarra 1, mágico 0.', 'Chapéu roxo virou peça!'], boris: ['Grandão, me ensina o trapézio?', 'Elmo quebrado. Conserto barato.'], artemis: ['O gambá roubou meus fones!', 'Mamãe? Que medo.'] },
  morato: { damir: ['Ninguém ajoelha sem querer na minha equipe.', 'Ganância caiu.'], boris: ['Respeito, grandão. Você protege o seu.', 'Bom soldado.'], artemis: ['Cuida do bicho, senhora.', 'Mamãe nenhuma manda nos Cinco.'] },
  dalmo: { damir: ['Senta? Eu fico de pé. Pela Manu.', 'Escafandro não ouve ordem.'], boris: ['Grandão de verdade. Respeito.', 'Pela Manu.'], artemis: ['Gambá não abre escafandro.', 'Fica longe, senhora.'] },
  aguiar: { damir: ['Ha ha... o mágico virou presa.', 'Cartas não assustam cães.'], boris: ['Presa grande. A melhor.', 'Até o elmo cai.'], artemis: ['Meus cães comeram o seu gambá. Brincadeira.', 'Presa doida.'] },
  jae: { damir: ['Shh. Fala demais.', 'No escuro, cartas não brilham.'], boris: ['Shh. Grande e barulhento.', 'Achei a nuca.'], artemis: ['Shh. O gambá me viu. Você não.', 'Silêncio, mamãe.'] },
  kemi: { damir: ['Alvo arrogante. Alvo fácil.', 'Contrato fechado.'], boris: ['O elmo não cobre tudo.', 'Alvo grande.'], artemis: ['Mira de elite? A minha é melhor.', 'Alvo abatido. Gambá poupado.'] },
  labirinto: { damir: ['Sem saída, Lukic.', 'O mapa não estava no caderninho.'], boris: ['Até o grandão se perde.', 'Sem saída.'], artemis: ['O gambá não achou a saída.', 'Perdida, mamãe.'] },
  juan: { damir: ['Priminho? Hahaha! Bate mais, primo!', 'O circo era do meu pai também, Damir.'], boris: ['Boris... você sempre foi o bom primo.', 'Me bate mais, Borjão! Gostei!'], artemis: ['Ai, gostoso! Me morde de novo, gambá!', 'Bate mais, mamãe!'] },
  cristino: { damir: ['Gente barulhenta. Igual a você.', 'O chapéu era bonito.'], boris: ['Respeito o grandão. Mas caiu.', 'Lampião e gadanha. Ganhei.'], artemis: ['Muito barulhenta.', 'Fica quieta, mulher.'] },
  raziel: { damir: ['Vinho, Vinho... você era mais divertido nos Vampiros.', 'O sangue do Lukic é doce.'], boris: ['Esse elmo é irritante.', 'Sangue de gigante. Que delícia.'], artemis: ['Devorar? Isso é comigo.', 'Sangue de mamãe. Gostoso.'] },
  arnaldo: { damir: ['Bravo, Lukic! Que entrada! Que queda!', 'O circo também era um palco.'], boris: ['Um trapezista! Que número!', 'Aplausos pro grandão!'], artemis: ['Trocar de rosto é a minha especialidade, querida.', 'Bravo, mamãe! Bravo!'] },
  ferreiro: { damir: ['A Morte não aceita suborno.', 'Santo Berço não está à venda.'], boris: ['A Morte é minha também, Boris.', 'Descanse.'], artemis: ['Até a Morte se cansa de você.', 'Descanse, Artemis.'] },
  celestine: { damir: ['Gato, você sentou bonito.', 'Ganância? Eu sou pior.'], boris: ['Grandão fofo. Pena.', 'Corrente apertada, gato.'], artemis: ['Gata contra gambá. Gata ganha, gata.', 'Mamãe nada.'] },
  gaius: { damir: ['Na arena não há mágicos.', 'Ajoelhe-se, Lukic.'], boris: ['Um guerreiro digno.', 'Roma o saúda, grandão.'], artemis: ['Luta suja. Mas perdeu.', 'Fera domada.'] },
  amalia: { damir: ['A flecha não senta.', 'Arrogante.'], boris: ['A flecha passou pelo elmo.', 'Boa luta, grandão.'], artemis: ['Minha flecha foi mais rápida que o seu rifle.', 'Boa luta, mamãe.'] },
  o_diabo: { damir: ['Você quis poder. Eu dei. Ajoelha.', 'Saber tudo, Lukic, é me encontrar.'], boris: ['Matar o Diabo? Que fofo.', 'Por Lucas? Lucas é meu.'], artemis: ['O homem na sua cabeça sou eu, mamãe.', 'Eu sou o fogo que te deixou sozinha.'] },
  magistrada: { damir: ['Saber tudo é perder tudo. Você perdeu.', 'O Equilíbrio cobra os gananciosos.'], boris: ['Lealdade prevista.', 'Equilíbrio mantido.'], artemis: ['Desequilíbrio contido.', 'Previsto. Até o gambá.'] },
  estrangeiro: { damir: ['Ninguém vai lembrar do Lukic.', 'O caderninho vai ficar em branco.'], boris: ['O irmão vai esquecer de você.', 'Esquecido, grandão.'], artemis: ['Ninguém lembra da mamãe.', 'O gambá já esqueceu de você.'] },
  amigo: { damir: ['...chapéu roxo... no quadro...', '...senta... no desenho...'], boris: ['...grandão... sorri... no quadro...', '...gadanha... de tinta...'], artemis: ['...bichinho... desenhado...', '...mamãe... na tinta...'] },
  carnical: { damir: ['...MUITOS... CONHECIMENTO... GOSTOSO...', '(fareja o chapéu) ...MEDO...'], boris: ['...GRANDE... COMIDA...', '(o elmo rola no chão) ...'], artemis: ['...BICHO... PEQUENO... COMIDA...', '(fareja o bolso dela) ...'] },
  degolificada: { damir: ['(os fios fecham a boca dele) ...silêncio...', '...senta... você...'], boris: ['(os fios envolvem a gadanha) ...fica...', '(o elmo cai) ...'], artemis: ['(os fios puxam o gambá) ...meu...', '...mamãe...'] },
  espreitador: { damir: ['(o olho encara o olho dele) ...', '(o tapa-olho cai) ...'], boris: ['(o olho da boca encara o elmo) ...', '(ele sorri; o Espreitador não) ...'], artemis: ['(o gambá se esconde no bolso) ...', '(o olho encara a mamãe) ...'] },
  ivete: { damir: ['Senta tu, careca. No meu bar quem manda sou eu.', 'Vende nada. Some.'], boris: ['Bah, grandão bonzinho. Levanta.', 'Tu é educado. Gosto de ti.'], artemis: ['Tira esse bicho do meu bar!', 'Mãe aqui sou eu, guria.'] },
};
for (const [w, m] of Object.entries(VICTORY_LUKIC)) VICTORY_LINES[w] = { ...(VICTORY_LINES[w] || {}), ...m };

// ------------------------------------------------------------------ ELOY (PSIKOLERA) e SABARA (Vampiros), 2026-11-14
// Eloy: gentil sem a focinheira, CAPSLOCK com ela (o jeito de escrever dele no cânone); Sabara: arrogante, "de joelhos"
const VICTORY_HEXA = {
  eloy: {
    arthur: ['FOI MAL, CERVERO. A GUITARRA É BOA. A BATERIA É MELHOR.', 'Bora montar uma banda depois? Sério.'],
    joui: ['Rápido. Mas fora do tempo.', 'DESCULPA, JOUI. A FOCINHEIRA NÃO ESCUTA.'],
    kaiser: ['Tira a foto agora. Eu tô sorrindo. Acho.', 'NO RITMO, KAISER. VOCÊ TAVA ATRASADO.'],
    dante: ['Calma, Dante. Respira. Eu te levanto.', 'O silêncio é bonito. O barulho é melhor.'],
    erin: ['KABOOM É PRATO DE ATAQUE. EU TOCO MELHOR.', 'Foi mal, Erin! Você tá bem?'],
    aghata: ['Desculpa, Aghata. Eu não sei parar no meio da música.', 'SANGUE NA BAQUETA. SANGUE NO SOLO.'],
    balu: ['GRANDÃO! QUE PORRADA BOA!', 'Bora tomar uma depois, Balu. Eu pago.'],
    carina: ['Você leu o golpe. Eu toquei mais rápido.', 'DESCULPA. EU NÃO GOSTO QUE ENCOSTEM.'],
    rubens: ['Doutor, me costura depois? Sempre preciso.', 'MARTELO BOM. RITMO RUIM.'],
    beatrice: ['Desculpa, Beatrice! O passarinho tá bem?', 'NÃO ENCOSTA. SÉRIO.'],
    fernando: ['Os dois aí dentro tão bem? Respira.', 'DOIS NUMA CABEÇA. UM SÓ NO CHÃO.'],
    tristan: ['Fogo no palco é com o Franco. Não com você.', 'Foi mal, Tristan. Sem rancor.'],
    ivete: ['Ivete, uma água? A focinheira dá sede.', 'BAR FECHADO. O SHOW CONTINUA.'],
    verissimo: ['Estratégia não segura bumbo duplo.', 'Desculpa, senhor. Foi no instinto.'],
    cristopher: ['Dublê bom! Caiu bonito!', 'CENA DE AÇÃO? ISSO FOI UM SHOW.'],
    kian: ['Você escreve. Eu toco. Hoje o barulho foi mais alto que a letra.', 'NÃO ENCOSTA EM MIM, KIAN.'],
    gal_sal: ['As correntes fazem um som bonito. Pena.', 'DESCULPA, GAL. NÃO PARO NO MEIO.'],
    nubi: ['Devagar você, rápido eu. Desculpa.', 'O LODO NÃO TEM RITMO.'],
    damir: ['Senta você, Damir. No banquinho da bateria.', 'CHAPÉU NO CHÃO. BAQUETA NA MÃO.'],
    boris: ['Desculpa, grandão. Você é gente boa.', 'TRAPEZISTA CAI NO TEMPO. BOM.'],
    artemis: ['Esconde o gambá, Artemis. Ele não gosta de barulho.', 'NÃO SOU SEU FILHO.'],
    xande: ['Skate e bateria, Xande. Dava um clipe.', 'TEORIA DO CAOS É MOSH PIT.'],
    guizo: ['Gravou? Manda pra banda!', 'NÃO FILMA A FOCINHEIRA.'],
    lirio: ['Bah, Lírio! Que porrada! Desculpa!', 'CASCA GROSSA. PELE DE TAMBOR.'],
    dara: ['Doutora, me dá um curativo? Eu sempre levanto.', 'Desculpa, Dara. Não foi pessoal.'],
    chico: ['Conserta minha baqueta depois?', 'GAMBIARRA NÃO SEGURA SOLO.'],
    morato: ['Respeito, Morato. Você cuida dos seus.', 'LÍDER NO CHÃO. SHOW EM PÉ.'],
    dalmo: ['O escafandro abafou o som. Bati mais forte.', 'Respeito, grandão. Pela Manu.'],
    aguiar: ['Cachorro não gosta de barulho, né?', 'MUTILADOR? EU SOU O MOSH.'],
    jae: ['Eu te soquei no circo, Jae. Desculpa de novo.', 'SHHH? AQUI NÃO TEM SILÊNCIO.'],
    kemi: ['Mira boa. Eu me joguei antes.', 'NÃO ATIRA NA BANDA.'],
    labirinto: ['Achei a saída: em cima de você.', 'Desculpa ter te segurado no carro... de novo.'],
    juan: ['Henri, você ainda tá rindo? Para.', 'GOSTA DE APANHAR? EU GOSTO DE BATER.'],
    cristino: ['Barulhento sou eu, cangaceiro. Sempre fui.', 'LAMPIÃO APAGOU. O SOM NÃO.'],
    raziel: ['Mordeu a minha focinheira. Péssima ideia.', 'BANQUETE ACABOU. O SHOW NÃO.'],
    sabara: ['De joelhos? Eu toco de pé.', 'NÃO MORDE. NÃO ENCOSTA.'],
    arnaldo: ['Bravo pra você também, ator.', 'PALCO É MEU. SAI.'],
    ferreiro: ['A Morte também tem ritmo. Devagar demais.', 'Desculpa, Ferreiro. Eu sempre volto.'],
    celestine: ['Gata, você não aguenta um show inteiro.', 'CORRENTE DE OURO NÃO É BAQUETA.'],
    gaius: ['Arena boa. Plateia melhor.', 'ROMA NÃO TINHA BUMBO DUPLO.'],
    amalia: ['A flecha errou o tempo.', 'Desculpa, Amalia. Boa mira.'],
    o_diabo: ['O portal do show era maior que você.', 'NO RITMO, DIABO. VOCÊ DANÇA.'],
    magistrada: ['Equilíbrio é chato. Barulho é melhor.', 'PREVIU O SOLO? NINGUÉM PREVÊ.'],
    estrangeiro: ['Ninguém esquece um show desses.', 'LEMBRA DO MEU NOME: ELOY.'],
    amigo: ['Desenha a banda. Eu na frente.', 'TINTA NÃO TEM SOM.'],
    carnical: ['Bicho grande, pele de tambor.', 'SOME. VOLTA PRO ESCURO.'],
    degolificada: ['Os cabelos param no tempo do bumbo.', 'Desculpa, menina. Volta a dormir.'],
    espreitador: ['Pode olhar. A focinheira olha de volta.', 'OLHO NENHUM ACOMPANHA O SOLO.'],
  },
  sabara: {
    arthur: ['De joelhos, Cervero. A guitarra fica comigo.', 'Seu sangue tem gosto de Ordem. Insosso.'],
    joui: ['Lâmina rápida. A minha é mais velha.', 'Aparei. Revidei. Fim.'],
    kaiser: ['Tira uma foto. Eu de pé, você ajoelhado.', 'Presa pequena, sangue doce.'],
    dante: ['O silêncio da Morte. E o meu.', 'Ajoelhe. Isso. Melhor.'],
    erin: ['Barulho não assusta uma caçadora.', 'Sangue de criança. Ainda quente.'],
    aghata: ['Sangue de ritual. Que gosto forte.', 'Ajoelhe pra quem conhece o Sangue há oitenta anos.'],
    balu: ['Grandão. Mais sangue pra mim.', 'O machado caiu. Você também.'],
    carina: ['Previu as facas? Todas?', 'Herdeira dos Leone. De joelhos.'],
    rubens: ['Doutor, costure isso. Se der tempo.', 'Seu martelo é lento. Meu dente não.'],
    beatrice: ['O passarinho voou. Você não.', 'Sangue de flor. Doce.'],
    fernando: ['Dois corações. Dois goles.', 'Ajoelhem. Os dois.'],
    tristan: ['Fogo não queima quem já não tem olhos.', 'De joelhos, recrutador.'],
    ivete: ['Um drink, tia. Vermelho.', 'A espingarda não chegou até mim.'],
    verissimo: ['Velho, sua estratégia sangra.', 'De joelhos, senhor.'],
    cristopher: ['Dublê? Caiu de verdade.', 'Sangue de pai. Forte.'],
    kian: ['Escreva isso: de joelhos.', 'Até a marca sangra.'],
    gal_sal: ['As correntes param quando o sangue para.', 'Injustiça? Não. Caça.'],
    nubi: ['Devagar. Como presa.', 'Lodo não tem gosto.'],
    damir: ['Senta não. De joelhos.', 'O chapéu fica comigo.'],
    boris: ['Grande e manso. A presa ideal.', 'Sangue de trapezista.'],
    artemis: ['Mamãe? Ajoelha pra mim.', 'O gambá fugiu. Esperto.'],
    xande: ['Corre, moleque. Eu gosto de correr atrás.', 'De joelhos no skate.'],
    guizo: ['Grava isso: de joelhos.', 'Presa barulhenta.'],
    lirio: ['Pele grossa. Sangue fino.', 'De joelhos, gaúcho.'],
    dara: ['Doutora, estanca isso. Se conseguir.', 'Remédio nenhum fecha minha mordida.'],
    chico: ['Gambiarra contra caçadora? Não.', 'De joelhos, menino.'],
    morato: ['O líder ajoelha primeiro.', 'Seus Cinco viram quatro.'],
    dalmo: ['O escafandro não para faca.', 'De joelhos, grandão.'],
    aguiar: ['De joelhos, Aguiar. Como da outra vez.', 'A espada é minha. Eu vim buscar.'],
    jae: ['Escuro? Eu não tenho olhos. Te achei mesmo assim.', 'Shh. De joelhos.'],
    kemi: ['Mira boa. Eu não tava onde você mirou.', 'Sangue de atiradora.'],
    labirinto: ['Sem saída. Pra você.', 'O labirinto sangra.'],
    juan: ['Gosta de apanhar? De joelhos, então.', 'Seu sangue ri. Estranho.'],
    cristino: ['Barulho de lampião. Silêncio de faca.', 'De joelhos, cangaceiro.'],
    eloy: ['De joelhos, baterista.', 'A focinheira não segura dente.'],
    raziel: ['Ajoelha você, Raziel. Só hoje.', 'O banquete é meu dessa vez.'],
    arnaldo: ['Aplausos? De joelhos.', 'Sangue de palco.'],
    ferreiro: ['A Morte também ajoelha.', 'Santo nenhum sangra diferente.'],
    celestine: ['Gata de ouro. Ajoelha.', 'Sangue antigo. Gosto.'],
    gaius: ['Gladiador. De joelhos na arena.', 'Roma também sangrava.'],
    amalia: ['A flecha errou. A faca não.', 'De joelhos, arqueira.'],
    o_diabo: ['O Sangue é seu. A fome é minha.', 'Ajoelha, Diabo. Uma vez.'],
    magistrada: ['Previu isso? De joelhos.', 'Equilíbrio sangra.'],
    estrangeiro: ['Ninguém esquece uma caçadora.', 'Some.'],
    amigo: ['Tinta não tem sangue.', 'Desenho rasgado.'],
    carnical: ['Bicho. Eu caço bicho.', 'Fome contra fome. A minha foi maior.'],
    degolificada: ['Cabelo cortado. Fica quieta.', 'De joelhos, menina.'],
    espreitador: ['Olha. Eu não posso olhar de volta.', 'Olho nenhum me assusta.'],
  },
  arthur: { eloy: ['Toca bem, Eloy. Mas a guitarra é minha.', 'Respira, cara. Tira a focinheira.'], sabara: ['Ajoelhar? Só se for pra pegar a guitarra.', 'Fica com as suas facas, Sabara.'] },
  joui: { eloy: ['Gomen, Eloy-san. O ritmo quebrou.', 'Uma batida a menos.'], sabara: ['Aparou. Mas não o bastante.', 'Sua espada pesa demais pra pressa.'] },
  kaiser: { eloy: ['Foto da focinheira. Pro relatório.', 'Menos barulho, baterista.'], sabara: ['Foto sua de joelhos. Inédita.', 'Vampira sem olhos. Foto difícil.'] },
  dante: { eloy: ['Silêncio, enfim.', 'Descanse, Eloy.'], sabara: ['O Sangue não manda em mim.', 'Fica longe, Sabara.'] },
  erin: { eloy: ['KABOOM mais alto que bumbo!', 'Desculpa, Eloy! Show maneiro!'], sabara: ['Explodi as suas facas!', 'Ajoelha VOCÊ!'] },
  aghata: { eloy: ['Ritmo bom. Ritual melhor.', 'Tira a focinheira, Eloy. Respira.'], sabara: ['Sangue velho, Sabara. Conheço.', 'De joelhos ninguém fica aqui.'] },
  balu: { eloy: ['HAHA! Que porrada boa, amigo!', 'Bora tomar uma depois, Eloy!'], sabara: ['Facas pequenas, moça! Machado grande!', 'Levanta, moça. Ninguém ajoelha.'] },
  carina: { eloy: ['Previ o seu solo.', 'O ritmo é previsível.'], sabara: ['Previ cada faca.', 'Aparar? Eu fintei.'] },
  rubens: { eloy: ['Fica quieto. Eu te costuro.', 'Levanta quantas vezes quiser.'], sabara: ['Sangrou muito. Deixa eu ver.', 'Mordida feia. Eu cuido depois.'] },
  beatrice: { eloy: ['O Orpheu gostou do show!', 'Desculpa, Eloy!'], sabara: ['O Orpheu não ajoelha!', 'Desculpa, Sabara!'] },
  fernando: { eloy: ['D-desculpa! Foi alto demais!', '(olhos amarelos) Silêncio, baterista.'], sabara: ['N-não me morde!', '(olhos amarelos) De joelhos você.'] },
  tristan: { eloy: ['Vem pra Ordem? Trazendo a bateria.', 'Fogo apaga o barulho.'], sabara: ['Fogo e vampira. Eu escolho fogo.', 'Recrutaria, se tivesse olhos.'] },
  ivete: { eloy: ['Barulho no meu bar? Rua.', 'Toma uma água, guri.'], sabara: ['Bah, vampira no meu bar? Rua!', 'Tu ajoelha pra mim, guria.'] },
  verissimo: { eloy: ['Ritmo é previsível. Eu anotei.', 'Impulsivo demais, rapaz.'], sabara: ['Arrogância é uma fraqueza tática.', 'De joelhos, a senhora.'] },
  cristopher: { eloy: ['Corta! Fim do show!', 'Bateria boa pra cena de ação!'], sabara: ['Esse dente não tava no roteiro!', 'Caiu como dublê, moça!'] },
  kian: { eloy: ['Seu ritmo não está na minha escrita.', 'Silêncio, Eloy.'], sabara: ['O Sangue também obedece à escrita.', 'Ajoelhe você.'] },
  gal_sal: { eloy: ['As correntes tocam mais alto.', 'Desculpe, Eloy.'], sabara: ['Injustiça? Não. Fim da caça.', 'As correntes não ajoelham.'] },
  nubi: { eloy: ['Devagar, Eloy.', 'O silêncio durou um século pra mim.'], sabara: ['Shh, Sabara.', 'Presa lenta? Não. Eu.'] },
  damir: { eloy: ['Senta, baterista.', 'Barulho de graça. Que desperdício.'], sabara: ['Senta. Não ajoelha. Senta.', 'A espada vale quanto?'] },
  boris: { eloy: ['Desculpa, Eloy. Gostei da música.', 'Calma, amigo. Respira.'], sabara: ['Desculpa, moça. Você é forte.', 'Sem morder, por favor.'] },
  artemis: { eloy: ['Shh, querido. A mamãe não gosta de barulho.', 'O Gambá dormiu com o seu solo.'], sabara: ['A mamãe morde mais forte.', 'Sangue de vampira? Gostoso.'] },
  xande: { eloy: ['Mosh pit massa, véi!', 'Teoria do caos: o baterista caiu.'], sabara: ['Fugi das facas, véi!', 'De joelhos? Só no skate.'] },
  guizo: { eloy: ['Gravei o solo! Viralizou!', 'Banda boa, véi!'], sabara: ['Gravei a vampira caindo!', 'Sem olhos e mesmo assim me achou? Medo!'] },
  lirio: { eloy: ['Bah, que guri forte!', 'Tchê, tira essa focinheira.'], sabara: ['Bah, a vampira morde!', 'De joelhos fica tu, guria.'] },
  dara: { eloy: ['Senta, Eloy. Deixa eu ver esses cortes.', 'Você sempre levanta. Agora descansa.'], sabara: ['Deixa eu ver essa mordida. Na outra pessoa.', 'Respira, Sabara.'] },
  chico: { eloy: ['Consertei sua baqueta. Brincadeira.', 'Som alto demais pros meus fones.'], sabara: ['Gambiarra 1, vampira 0.', 'Faca não segura gambiarra.'] },
  morato: { eloy: ['Respeito, Eloy. Você protege os seus.', 'Ritmo bom.'], sabara: ['Ninguém ajoelha nos Cinco.', 'Caçada encerrada.'] },
  dalmo: { eloy: ['Escafandro não escuta barulho.', 'Pela Manu.'], sabara: ['Faca não fura escafandro.', 'De joelhos? Nunca. Pela Manu.'] },
  aguiar: { eloy: ['Ha ha... o cachorro mordeu o baterista.', 'Barulho de presa.'], sabara: ['De novo, Sabara. A espada continua comigo.', 'A caçadora virou presa. De novo.'] },
  jae: { eloy: ['Shh. Você ainda fala alto, Eloy.', 'Dessa vez quem soca sou eu.'], sabara: ['Shh. No escuro, sem olhos, é empate. Quase.', 'Achei a nuca.'] },
  kemi: { eloy: ['Alvo barulhento. Alvo fácil.', 'Contrato fechado.'], sabara: ['Alvo rápido. Ainda alvo.', 'Abatida.'] },
  labirinto: { eloy: ['Segurou no carro, Eloy. Valeu. Mas aqui não.', 'Sem saída, baterista.'], sabara: ['Sem saída, vampira.', 'O labirinto não sangra.'] },
  juan: { eloy: ['Me bate mais, Eloy! No ritmo!', 'Hahaha! Que solo gostoso!'], sabara: ['Me morde mais! Hahaha!', 'De joelhos? Eu deito!'] },
  cristino: { eloy: ['Gente barulhenta. Eu odeio.', 'Silêncio, baterista.'], sabara: ['Vampira calada. Melhor assim.', 'Faca contra peixeira. A peixeira fica.'] },
  raziel: { eloy: ['Eloy, sua focinheira tem gosto de ferro.', 'O banquete agradece o barulho.'], sabara: ['Levanta, Sabara. Vampiro não ajoelha.', 'A batedora precisa de mais fome.'] },
  arnaldo: { eloy: ['Bravo! Que número de bateria!', 'Aplausos pro baterista!'], sabara: ['Bravo, caçadora! Que queda!', 'O palco é meu, querida.'] },
  ferreiro: { eloy: ['Até a Morte cansa de você levantar, Eloy.', 'Descanse.'], sabara: ['A Morte não ajoelha.', 'Descanse, Sabara.'] },
  celestine: { eloy: ['Gato barulhento.', 'Corrente de ouro bate mais bonito.'], sabara: ['Gata contra vampira. A gata fica de pé.', 'Ajoelha você, gata.'] },
  gaius: { eloy: ['Um guerreiro de ritmo. Digno.', 'Roma o saúda.'], sabara: ['Na arena, a fera cai.', 'Ajoelhe-se diante de Roma.'] },
  amalia: { eloy: ['A flecha cortou o ritmo.', 'Boa luta, Eloy.'], sabara: ['A flecha foi mais rápida que a faca.', 'Boa luta, caçadora.'] },
  o_diabo: { eloy: ['O seu portal fui eu, Eloy.', 'Toque pra mim no inferno.'], sabara: ['O Sangue que você bebe é meu.', 'Ajoelhe pro seu senhor, Fenna.'] },
  magistrada: { eloy: ['Ruído contido.', 'Previsto. Até o solo.'], sabara: ['Fome contida.', 'Previsto. Até a mordida.'] },
  estrangeiro: { eloy: ['Ninguém vai lembrar do show.', 'Esquecido, baterista.'], sabara: ['Ninguém lembra da batedora.', 'Esquecida.'] },
  amigo: { eloy: ['...baterista... no quadro...', '...barulho... de tinta...'], sabara: ['...vampira... desenhada...', '...dentes... de tinta...'] },
  carnical: { eloy: ['...BARULHO... COMIDA...', '(fareja a focinheira) ...'], sabara: ['...SANGUE... COMIDA...', '(fareja as facas) ...'] },
  degolificada: { eloy: ['(os fios fecham a focinheira) ...silêncio...', '...para... de bater...'], sabara: ['(os fios prendem as facas) ...fica...', '...de joelhos... você...'] },
  espreitador: { eloy: ['(o olho encara os olhos brancos) ...', '(a focinheira cai) ...'], sabara: ['(o olho encara as covas vazias) ...', '(ela não pode olhar de volta) ...'] },
};
for (const [w, m] of Object.entries(VICTORY_HEXA)) VICTORY_LINES[w] = { ...(VICTORY_LINES[w] || {}), ...m };

export function introLines(idA, idB) {
  // O ANFITRIÃO (o das Relíquias e o Amphitruo: a mesma consciência) tem a própria voz — as cenas com ele são montadas na hora
  const host = (id) => id === 'anfitriao' || id === 'amphitruo';
  if (host(idA) || host(idB)) {
    const other = host(idA) ? BASE_CHARACTER[idB] || idB : BASE_CHARACTER[idA] || idA;
    const scenes = host(other) ? voiceScenes('anfitriao', 'anfitriao') : host(idA) ? voiceScenes('anfitriao', other) : voiceScenes(other, 'anfitriao');
    const scene = scenes[Math.floor(Math.random() * scenes.length)];
    return [[scene.starter, scene.line], [scene.response, scene.responseLine]];
  }
  idA = BASE_CHARACTER[idA] || idA;
  idB = BASE_CHARACTER[idB] || idB;
  const variations = INTRO_DIALOGUES[idA]?.[idB];
  if (!variations?.length) throw new Error(`Fala de introdução não registrada: ${idA} vs ${idB}`);
  const scene = variations[Math.floor(Math.random() * variations.length)];
  return [
    [scene.starter, scene.line],
    [scene.response, scene.responseLine],
  ];
}
