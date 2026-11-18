// Usado pelo release.bat: imprime "VERSAO|TITULO" da entrada do topo de src/config/version.js (ou sai com erro se a
// entrada do topo não for da versão atual).
import { VERSION, CHANGELOG } from '../src/config/version.js';

const top = CHANGELOG[0];
if (!top || top.v !== VERSION) {
  console.error(`A entrada do topo do CHANGELOG (${top && top.v}) não é da versão ${VERSION}.`);
  process.exit(1);
}
console.log(`${VERSION}|${top.title}`);
