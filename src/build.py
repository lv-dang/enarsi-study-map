import re
ref=open('template.html').read()
css=ref[ref.index('<style>'):ref.index('</style>')+8]
s=ref[ref.index('<script>')+8:ref.rindex('</script>')]
# renderer
r0=s.index('let dgN=0;'); r1=s.index('\nObject.assign(DG,{',r0)
renderer=s[r0:r1]
helpers='function cardDiag(c){for(const k in CD)if(c[1].startsWith(k))return CD[k];return null}\nfunction qDiag(q){for(const k in QD)if(q[1].startsWith(k))return QD[k];return null}\n'
e1=s[s.index('let st={};'):s.index('\nbuildFilters();build();')+len('\nbuildFilters();build();')]
e2=s[s.index('let qh={};'):s.index('const OBJ=')]
e3=s[s.index('function coverage(){'):]
e3=re.sub(r'const TGT=\{[^\n]*\n','',e3)

def common(t):
    t=t.replace('d.n.split(" ")[0]','(d.s||d.n.split(" ")[0])')
    t=t.replace('qh[i]','qh[QK[i]]').replace('ql[i]','ql[QK[i]]').replace('i in qh','QK[i] in qh')
    return t
e1=e1.replace('"ensld-en"','"enarsi-cards"')
e1=e1.replace('const lv=i=>{const v=st[i];','const lv=i=>{const v=st[CK[i]];').replace('const tsv=i=>{const v=st[i];','const tsv=i=>{const v=st[CK[i]];')
e1=e1.replace('delete st[i]','delete st[CK[i]]').replace('st[i]={l:0','st[CK[i]]={l:0').replace('st[i]={l:Math.min','st[CK[i]]={l:Math.min')
e1=e1.replace('width:${d.w*4}%','width:${d.w*2.5}%')
e1=common(e1)
e2=e2.replace('"ensld-qh"','"enarsi-qh"').replace('"ensld-ql"','"enarsi-ql"').replace('"ensld-mock"','"enarsi-mock"')
old='function record(id,ok){if(!(id in qh))qh[id]=ok?1:0;ql[id]=ok?1:0;qsave()}'
assert old in e2; e2=e2.replace(old,'function record(id,ok){const k=QK[id];if(!(k in qh))qh[k]=ok?1:0;ql[k]=ok?1:0;qsave()}')
e2=common(e2)
e3=e3.replace('const a=k[0]=="5",mc=a?4:5,mq=a?3:5;','const a=D[od(k)].w<=10,mc=a?4:5,mq=a?3:5;')
e3=e3.replace('D["rcwsa"["12345".indexOf(k[0])]].c','D[od(k)].c')
e3=e3.replace('const ready=met==5;','const ready=met==Object.keys(D).length;')
e3=e3.replace('" of 5 domains meet the target"','" of "+Object.keys(D).length+" domains meet the target"')
e3=e3.replace('(Automation 4 + 3)','(domains ≤10 % weight: 4 + 3; none on ENARSI)')
e3=e3.replace('<b>NSSA</b>, <b>TLOC</b>, <b>830</b>, <b>root guard</b>','<b>ExStart</b>, <b>NHRP</b>, <b>646</b>, <b>RA guard</b>')
e3=common(e3)

e2=e2.replace('<div class="scen">${q[1]}</div>','<div class="scen">${q[1]}</div>${exh(q)}')
e2=e2.replace('<div style="font-weight:600;margin-bottom:6px">${q[1]}</div>','<div style="font-weight:600;margin-bottom:6px">${q[1]}</div>${exh(q)}')
e3=e3.replace('txt:[q[1],qanswer(q).replace(/<br>/g," "),q[4]].join(" "),html:`<div style="font-weight:600">${q[1]}</div>','txt:[q[1],q[6]||"",qanswer(q).replace(/<br>/g," "),q[4]].join(" "),html:`<div style="font-weight:600">${q[1]}</div>${exh(q)}')
assert e2.count('exh(q)')==2 and 'exh(q)' in e3

e2=e2.replace('let qh={};','let qt={};try{qt=JSON.parse(localStorage.getItem("enarsi-qt")||"{}")}catch(e){}\nlet qh={};',1)
e2=e2.replace('localStorage.setItem("enarsi-mock",JSON.stringify(mh))','localStorage.setItem("enarsi-mock",JSON.stringify(mh));localStorage.setItem("enarsi-qt",JSON.stringify(qt))',1)
e2=e2.replace('function record(id,ok){const k=QK[id];','function record(id,ok){const k=QK[id];qt[k]=Date.now();',1)
e2=e2.replace('if(qmode=="practice"){qorder=shuf(all.filter(inDom));hint="All question types · answers shuffled"}','if(qmode=="practice"){qorder=qf=="all"?wOrder(all):shuf(all.filter(inDom));hint=qf=="all"?"Drawn in proportion to the exam weights · answers shuffled":"All question types · answers shuffled"}',1)
e2=e2.replace('mh.unshift({d:new Date().toLocaleDateString(),p:pct,m:mins})','mh.unshift({d:new Date().toLocaleDateString(),p:pct,m:mins,ts:Date.now()})',1)
e2='function wOrder(ids){const pools={};Object.keys(D).forEach(k=>pools[k]=shuf(ids.filter(i=>Q[i][0]==k)));const out=[];for(;;){const ks=Object.keys(pools).filter(k=>pools[k].length);if(!ks.length)break;let r=Math.random()*ks.reduce((s,k)=>s+D[k].w,0),pick=ks[ks.length-1];for(const k of ks){r-=D[k].w;if(r<=0){pick=k;break}}out.push(pools[pick].pop())}return out}\n'+e2
e3=e3.replace('const good=seenPct>=80&&acc>=85;if(good)met++;','const fr=ids.filter(i=>(qt[QK[i]]||0)>Date.now()-12096e5).length,frPct=Math.round(fr/ids.length*100);const good=seenPct>=80&&acc>=85&&frPct>=20;if(good)met++;',1)
e3=e3.replace('${pbar(known_,cIds.length,known_+"/"+cIds.length)}','${pbar(frPct,20,fr+"/"+ids.length)}${pbar(known_,cIds.length,known_+"/"+cIds.length)}',1)
e3=e3.replace('<div class="rg"><span class="h">Domain</span><span class="h">Seen ≥80%</span><span class="h">Right ≥85%</span><span class="h">Cards</span><span class="h"></span>','<div class="rg" style="grid-template-columns:62px 1fr 1fr 1fr 1fr 20px"><span class="h">Domain</span><span class="h">Seen ≥80%</span><span class="h">Right ≥85%</span><span class="h">14 d ≥20%</span><span class="h">Cards</span><span class="h"></span>',1)
e3=e3.replace('const ready=met==Object.keys(D).length;','const lm=mh[0],mockOK=!!(lm&&lm.ts&&Date.now()-lm.ts<12096e5&&lm.p>=85),allD=met==Object.keys(D).length,ready=allD&&mockOK;',1)
e3=e3.replace('${ready?"Ready: every domain meets the target":"Not ready yet: "+met+" of "+Object.keys(D).length+" domains meet the target"}','${ready?"Ready: every domain meets the target and your last mock passed":allD?"Almost: every domain meets the target, but you need a mock exam ≥85 % from the last 14 days":"Not ready yet: "+met+" of "+Object.keys(D).length+" domains meet the target"}',1)
e3=e3.replace('Per domain you need ≥80 % of quiz questions answered <b>and</b> ≥85 % correct on the first try.','Per domain: ≥80 % of questions seen, ≥85 % right on the first try, and ≥20 % of its questions practiced in the last 14 days. Plus a mock exam ≥85 % taken in the last 14 days.</div><div class="why" style="margin-top:4px">Latest mock: <b>${lm&&lm.ts?lm.p+" % ("+Math.floor((Date.now()-lm.ts)/864e5)+" d ago)":"none yet"}</b>',1)
e3=e3.replace('document.getElementById("qhr").onclick=()=>{qh={};','document.getElementById("qhr").onclick=()=>{qh={};qt={};',1)
for frag in ['wOrder(all)','qt[k]=Date.now()','frPct>=20','mockOK','Latest mock','qt={};qsave','ts:Date.now()','enarsi-qt",JSON']:
    assert frag in e2+e3, frag
for t,name in ((e1,'e1'),(e2,'e2'),(e3,'e3')):
    assert 'ensld' not in t, name
    assert 'rcwsa' not in t, name
dg=open('dg.js').read()+'\n'+open('dg2.js').read(); cards=open('cards.js').read()+'\n'+open('cards2.js').read(); quiz=open('quiz.js').read()+'\n'+open('quiz2.js').read()+'\n'+open('quiz3.js').read()
script='\n'.join([
 dg, renderer, helpers,
 'const hk=s=>{let h=5381;for(let i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))|0;return (h>>>0).toString(36)};',
 'const od=k=>({"1":"l","2":"v","3":"s","4":"i"})[k.split(".")[0]];',
 cards, 'const CK=C.map(c=>"c"+hk(c[1]+"|"+c[2]));',
 e1, 'const exh=q=>q[6]?\'<pre class="cf out" style="margin:0 0 12px">\'+q[6].replace(/&/g,"&amp;").replace(/</g,"&lt;")+\'</pre>\':"";', quiz, 'const QK=Q.map(q=>"q"+hk(q[1]));',
 e2, 'const TGT={cards:{l:70,v:25,s:25,i:35},quiz:{l:65,v:24,s:24,i:35},vis:{l:14,v:4,s:5,i:8}};',
 e3])

head='''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>ENARSI Last-Minute Study Map</title>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;600&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
'''+css+'''
<style>.ek{grid-template-columns:1fr!important;row-gap:3px}.ek b{font:600 13px Inter!important;color:var(--ink)!important;margin-top:9px}.ek b:first-child{margin-top:0}.ek b code{font:600 12px 'JetBrains Mono';color:var(--mute);margin-right:6px}.ek span{color:#c3cbe0}details.cfg{margin-top:12px;border:1px solid var(--line);border-radius:10px;background:#121826;min-width:0}details.cfg summary{cursor:pointer;padding:9px 12px;font:600 13px Inter;color:var(--c1);list-style:none;display:flex;gap:8px;align-items:center}details.cfg summary::-webkit-details-marker{display:none}details.cfg summary::after{content:'+';margin-left:6px;color:var(--mute)}details.cfg[open] summary::after{content:'–'}details.cfg[open] summary{border-bottom:1px solid var(--line)}.cfgb{padding:4px 10px 10px}.cl{font:600 10px 'JetBrains Mono';letter-spacing:.08em;text-transform:uppercase;color:var(--mute);margin:10px 0 4px}pre.cf{margin:0;background:#0b0f18;border-radius:8px;padding:8px 10px;font:500 11px/1.5 'JetBrains Mono',monospace;color:#cfe3ff;overflow-x:auto;white-space:pre;max-width:100%}pre.out{color:#c3cbe0}pre.cf .cm{color:#6b7896}pre.cf .hl{background:#4a3c10;color:#ffe9a8}table.tc td{font-size:12px;vertical-align:top;padding:5px 4px}table.tc td:first-child{width:46%}#v-nums td.n{white-space:normal;word-break:break-word;max-width:55%}#v-nums .mx td{word-break:break-word}table.tc code{font:500 11px 'JetBrains Mono',monospace;color:var(--c1);word-break:break-word}</style>
</head>
<body>
<header>
  <h1>ENARSI <span>300-410</span> · Last Minute</h1>
  <div class="sub">Troubleshoot like the exam: symptom → cause → fix · blueprint v1.1</div>
</header>
<nav><div class="in">
  <button data-v="map" class="on">🗺️ Overview</button>
  <button data-v="cards">🃏 Trigger cards</button>
  <button data-v="quiz">🎯 Scenario quiz</button>
  <button data-v="nums">🔢 Numbers</button>
  <button data-v="day">⏱ Exam day</button>
  <button data-v="find">🔍 Search</button>
</div></nav>
<main>
'''
html=head+open('overview_full.html').read()+open('rest.html').read()+'</main>\n<script>\n'+script+'\n</script>\n</body>\n</html>\n'
open('../index.html','w').write(html)
print(len(html))
