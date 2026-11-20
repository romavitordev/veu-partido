"""O QUIBUNGO (o chefe do Sertão do Quibungo, Hexatombe ep. 5) — feito SOBRE o Zumbi de Sangue Forte (o gigante), como
pediu o dono (2026-11-20): o segundo par de braços, os dedos longos, as mandíbulas dos lados, a bocarra nas costas com os
espinhos de osso em arco e a língua comprida. Ver npc_zumbi_lib.py (build(strong=True, quibungo=True))."""
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from npc_zumbi_lib import build

build(strong=True, quibungo=True)
