"""
Roda um char_*.py DENTRO do Blender aberto (pelo Blender MCP), como pede a regra do dono (2026-11-09): todo modelo novo
é feito e conferido no Blender vivo — o script continua sendo a fonte reproduzível, mas o resultado é inspecionado ali
(look nas 4 vistas) e exportado da própria sessão.
Uso pelo MCP (execute_blender_code):
    exec(open(r"E:/arena paranormal/tools/blender/mcp_build.py", encoding="utf-8").read()); mcp_build("tristan")
    invocações (npc_*.py → public/npcs): mcp_build("rastropoda", kind="npc")
Diferença para o build.mjs (headless): o lib.py chama wm.read_factory_settings ao importar, o que derruba o servidor do
addon do MCP; aqui essa chamada vira uma limpeza manual da cena. O .glb vai para public/models/<nome>.glb e o .blend
para tools/blender/fonte/<nome>.blend, como no build.mjs.
"""
import bpy, sys, os, runpy

ROOT = os.path.dirname(os.path.abspath(__file__)) if '__file__' in globals() else r"E:/arena paranormal/tools/blender"


def _clear(**kw):
    for o in list(bpy.data.objects):
        bpy.data.objects.remove(o, do_unlink=True)
    for coll in (bpy.data.meshes, bpy.data.materials, bpy.data.armatures, bpy.data.images, bpy.data.actions, bpy.data.curves):
        for x in list(coll):
            coll.remove(x)
    for c in list(bpy.data.collections):
        bpy.data.collections.remove(c)
    return {'FINISHED'}


class _WM:
    def __init__(self, real):
        self._real = real

    def __getattr__(self, n):
        return _clear if n in ('read_factory_settings', 'read_homefile') else getattr(self._real, n)


def mcp_build(name, root=r"E:/arena paranormal/tools/blender", kind="char"):
    """kind: 'char' (public/models) ou 'npc' (invocações em peças rígidas, public/npcs)"""
    if root not in sys.path:
        sys.path.insert(0, root)
    rn = os.path.normcase(os.path.abspath(root))
    for k, m in list(sys.modules.items()):  # recarrega todo módulo da pasta (lib, sculpt_lib, carvalho_common...)
        f = getattr(m, '__file__', None)
        if f and os.path.normcase(os.path.dirname(os.path.abspath(f))) == rn:
            del sys.modules[k]
    out = os.path.join(os.path.dirname(os.path.dirname(root)), 'public', 'npcs' if kind == 'npc' else 'models', name + '.glb')
    old_argv, real = sys.argv, bpy.ops.wm
    sys.argv = ['blender', '--', out]
    bpy.ops.wm = _WM(real)
    try:
        runpy.run_path(os.path.join(root, kind + '_' + name + '.py'), run_name='__main__')
    finally:
        bpy.ops.wm = real
        sys.argv = old_argv
    print('mcp_build:', name, '→', out, '·', len(bpy.data.objects), 'objetos')
