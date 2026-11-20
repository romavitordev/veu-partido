"""ARARA INFERNAL (o bestiário do Sertão do Quibungo; ver npc_arara_lib.py)."""
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from npc_arara_lib import build

build("infernal")
