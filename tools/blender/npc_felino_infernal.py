"""FELINO INFERNAL (só no Aniquilação, Sertão do Quibungo): refeito (2026-11-20) SOBRE o Zumbi de Sangue Fraco, de pé e
curvado como na arte do bestiário — o leque de espinhos de osso nas costas, a coroa de chifres-garra e o rabo em S com
a lâmina. Ver npc_zumbi_lib.py (build(strong=False, felino=True))."""
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from npc_zumbi_lib import build

build(strong=False, felino=True)
