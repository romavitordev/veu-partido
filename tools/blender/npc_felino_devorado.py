"""FELINO DEVORADO (o bestiário do Sertão do Quibungo): a jaguatirica tomada pelo Sangue, refeita (2026-11-20) SOBRE o
cão da tinta (npc_bicho_lib.py, kind 'felino') — as mesmas juntas do InkBeast (body, torso, head, jaw, as quatro pernas
e tail): a pelagem vermelha com rosetas, o pescoço alto, a coroa de chifres-garra e o rabo em S com a lâmina."""
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from npc_bicho_lib import build

build('felino')
