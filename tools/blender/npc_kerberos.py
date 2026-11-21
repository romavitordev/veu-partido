"""O KERBEROS (Hexatombe ep. 10) — a 2ª forma do Quibungo no Aniquilação (pve/kerberosInferno.js). Ver npc_kerberos_lib.py."""
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from lib import export_glb
from npc_kerberos_lib import build

build()
export_glb(sys.argv[sys.argv.index('--') + 1])
