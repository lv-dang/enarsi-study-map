// Run from src/: node validate.js
const fs=require('fs');
const src=fs.readFileSync('dg.js','utf8')+fs.readFileSync('dg2.js','utf8')+fs.readFileSync('cards.js','utf8')+fs.readFileSync('cards2.js','utf8')+fs.readFileSync('quiz.js','utf8')+fs.readFileSync('quiz2.js','utf8')+fs.readFileSync('quiz3.js','utf8');
eval(src+';global.DG=DG;global.QD=QD;global.CD=CD;global.C=C;global.Q=Q;global.OBJ=OBJ;global.D=D');
const od=k=>({"1":"l","2":"v","3":"s","4":"i"})[k.split(".")[0]];
let err=[];
C.forEach((c,i)=>{if(!OBJ[c[5]])err.push('card orphan '+i+' '+c[5]);else if(od(c[5])!=c[0])err.push('card dom '+i+' '+c[1])});
Q.forEach((q,i)=>{if(!OBJ[q[5]])err.push('q orphan '+i);else if(od(q[5])!=q[0])err.push('q dom '+i+' '+q[1]);
 if(typeof q[3]=="number"&&(q[2].length!=4||q[3]>3))err.push('q opts '+i);if(Array.isArray(q[3])&&q[3].some(j=>j>=q[2].length))err.push('q multi '+i)});
for(const k in QD){const n=Q.filter(q=>q[1].startsWith(k)).length;if(!n)err.push('QD nomatch '+k);if(!DG[QD[k][1]])err.push('QD dg '+k)}
for(const k in CD){if(!C.some(c=>c[1].startsWith(k)))err.push('CD nomatch '+k);if(!DG[CD[k]])err.push('CD dg '+k)}
const html=fs.readFileSync('../index.html','utf8');
const used=new Set([...html.matchAll(/data-dg="(\w+)"/g)].map(m=>m[1]));used.forEach(k=>{if(!DG[k])err.push('placeholder no DG '+k)});
const hk=s=>{let h=5381;for(let i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))|0;return (h>>>0).toString(36)};
const ck=C.map(c=>hk(c[1]+"|"+c[2])),qk=Q.map(q=>hk(q[1]));if(new Set(ck).size!=ck.length)err.push('card hash dup');if(new Set(qk).size!=qk.length)err.push('q hash dup');
const vis={};[...html.matchAll(/<details class="sec" data-d="(\w)" data-o="([\d.]+)"/g)].forEach(m=>vis[m[2]]=(vis[m[2]]||0)+1);
for(const k in OBJ){const nc=C.filter(c=>c[5]==k).length,nq=Q.filter(q=>q[5]==k).length,nv=vis[k]||0;if(nc<5||nq<5||nv<1)err.push(`under ${k}: c${nc} q${nq} v${nv}`)}
for(const d in D)console.log(d,'cards',C.filter(c=>c[0]==d).length,'quiz',Q.filter(q=>q[0]==d).length,'vis',[...html.matchAll(new RegExp(`data-d="${d}"`,'g'))].length);
console.log('total',C.length,Q.length,'DG',Object.keys(DG).length,'unused DG',Object.keys(DG).filter(k=>!used.has(k)&&!Object.values(CD).includes(k)&&!Object.values(QD).some(v=>v[1]==k)));
// scope sweep
const bad=/NetFlow v5|version 5|DNA Center(?! *[)(])|destination guard|confederation/gi;
[...C.map(c=>c.join(' ')),...Q.map(q=>JSON.stringify(q))].forEach(t=>{const m=t.match(bad);if(m)console.log('scope?',m[0],'::',t.slice(0,90))});
console.log(err.length?err.join('\n'):'no errors');
