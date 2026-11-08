"""
FERNANDO CARVALHO — public/models/fernando.glb. O corpo é o mesmo do casal (carvalho_common.py): o cânone diz que os dois dividem
o corpo do Luciano; o que muda é o rosto (os olhos de quem está no controle).
  node tools/blender/build.mjs fernando
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from carvalho_common import build

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'fernando.glb'
build('fernando', OUT)
