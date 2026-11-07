import html,re
exec(open('cfg_data.py').read())
def pre(txt,cls):
    out=[]
    for ln in txt.split('\n'):
        hl=ln.startswith('»'); ln=ln[1:] if hl else ln
        e=html.escape(ln)
        if cls=='cfg' and ln.lstrip().startswith('!'): e=f'<span class="cm">{e}</span>'
        if hl: e=f'<span class="hl">{e}</span>'
        out.append(e)
    return f'<pre class="cf {cls}">'+'\n'.join(out)+'</pre>'
def block(b):
    gui=b['obj']=='4.7'
    rows=''.join(f'<tr><td><code>{html.escape(c)}</code></td><td>{html.escape(w)}</td></tr>' for c,w in b['tbl'])
    return (f'\n    <details class="cfg"><summary>⌨️ {html.escape(b["title"])} <span class="src">{b["src"]}</span></summary><div class="cfgb">'
      f'<div class="cl">{"Workflow" if gui else "Configuration"}</div>{pre(b["cfg"],"cfg")}'
      f'<div class="cl">{"What the screens show (simplified)" if gui else "Sample output (trimmed)"}</div>{pre(b["out"],"out")}'
      f'<div class="cl">Troubleshooting {"views" if gui else "commands"}</div><table class="tc">{rows}</table></div>\n    </details>')
src=open('overview.html').read()
for b in B:
    starts=[m.start() for m in re.finditer(r'<details class="sec" data-d="\w" data-o="%s"'%re.escape(b['obj']),src)]
    st=starts[b['n']]
    end=src.index('\n  </details>',st)
    src=src[:end]+block(b)+src[end:]
src=src.replace('Deep dives with diagrams are below.','Deep dives with diagrams are below; each has a ⌨️ block with configuration, sample output and troubleshooting commands.')
open('overview_full.html','w').write(src)
objs=sorted({b['obj'] for b in B},key=lambda k:[int(x) for x in k.split('.')])
print(len(B),'blocks;',len(objs),'objectives:',' '.join(objs))
