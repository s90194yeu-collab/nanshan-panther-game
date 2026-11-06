/* 校園地圖輪廓產生器（給老師列印、手寫修改用）
 * 用法：把 index.html 複製一份，在最後的 `})();` 前面加上
 *   window.MAPDATA=()=>({K,BUILD,GATES,SIDEDOORS,OFFNPC,SP,HISTORY,TASKS,LAWNS,FIELD,COURT,GOB,PARK,PARK2,THEATRE,ROAD1,ROAD2,PTSK,ZH2,GTEXT,QLOC,LAMPS,MONTHS,BINFO,FONT,GZONES,PARK3,ZS,
 *     LANES:[['下凹車道',LANE2,'#6b6e76',2.6],['石磚路',BRICK,'#c9b8a0',3.6],['通漳二小路',LANE3,'#cdbf9f',1.6]],
 *     tc:(g,t)=>{const o=G;G=g;const r=[T(t.x),T(t.z),T(t.name),T(t.type)];G=o;return r;}});
 * 再載入本檔，執行 mapOutline(MAPDATA()) 取得 {base, tasks, csv}（兩張 PNG 的 dataURL 與一份 CSV 文字）。
 * 座標一律用「未放大」的值（遊戲程式裡寫的數字），x 往右變大、z 往下變大。
 */
function mapOutline(D){
  const K=D.K,ZS=D.ZS||1,X0=-80,X1=84,Z0=-50,Z1=54,S=17,OX=90,OY=175,MW=(X1-X0)*S,MH=(Z1-Z0)*S*ZS,LW=1000,W=OX+MW+50+LW,H=OY+MH+90;
  const F=D.FONT||'sans-serif';
  const tm=(x,z)=>[OX+(x/K-X0)*S,OY+(z/K-Z0)*S*ZS];          // 已放大座標 → 畫布
  const tu=(x,z)=>[OX+(x-X0)*S,OY+(z-Z0)*S*ZS];              // 未放大座標 → 畫布
  const r1=v=>Math.round(v*10)/10, un=v=>r1(v/K);
  const rr=(m,x,y,w,h,r)=>{m.beginPath();m.moveTo(x+r,y);m.arcTo(x+w,y,x+w,y+h,r);m.arcTo(x+w,y+h,x,y+h,r);m.arcTo(x,y+h,x,y,r);m.arcTo(x,y,x+w,y,r);m.closePath();};
  const mk=()=>{const c=document.createElement('canvas');c.width=W;c.height=H;const m=c.getContext('2d');m.fillStyle='#fffdf8';m.fillRect(0,0,W,H);return [c,m];};
  const poly=(m,P,f,st,lw=2)=>{m.beginPath();P.forEach(([x,z],i)=>{const [a,b]=tm(x,z);i?m.lineTo(a,b):m.moveTo(a,b);});m.closePath();if(f){m.fillStyle=f;m.fill();}if(st){m.strokeStyle=st;m.lineWidth=lw;m.stroke();}};
  const lab=(m,t,x,y,fs=20,bg='rgba(255,255,255,.88)',fg='#222',bold=true)=>{m.font=`${bold?'bold ':''}${fs}px ${F}`;const w=m.measureText(t).width;if(bg){m.fillStyle=bg;rr(m,x-w/2-6,y-fs*.72,w+12,fs*1.44,6);m.fill();}m.fillStyle=fg;m.textAlign='center';m.textBaseline='middle';m.fillText(t,x,y+1);};
  const pin=(m,t,x,y,col,fs=17,shape='circle')=>{m.font=`bold ${fs}px ${F}`;const w=Math.max(fs*1.5,m.measureText(t).width+12),h=fs*1.5;
    m.fillStyle=col;m.strokeStyle='#1d1d28';m.lineWidth=2.2;
    if(shape==='circle'&&w<=fs*1.6){m.beginPath();m.arc(x,y,h/2,0,7);}else rr(m,x-w/2,y-h/2,w,h,h/2);
    m.fill();m.stroke();m.fillStyle='#fff';m.textAlign='center';m.textBaseline='middle';m.fillText(t,x,y+1);};
  // 校園底圖
  function base(m,fade){
    m.save();m.beginPath();m.rect(OX,OY,MW,MH);m.clip();
    m.globalAlpha=fade?.55:1;
    // 道路與範圍
    [D.ROAD1,D.ROAD2].forEach(R=>{poly(m,R.road,'#c9cbd1');poly(m,R.walk,'#e6dfd0');});
    poly(m,D.PTSK,'rgba(236,228,210,.75)','#8a7b5e',3);
    D.LAWNS.forEach(L=>poly(m,L,'#bfe3a8','#7fae68',1.5));
    poly(m,D.FIELD,'#c6cfdf','#7d8aa6',1.5);poly(m,D.COURT,'#cfe0f2','#6f9fd0',1.5);poly(m,D.GOB,'#f0d9ad','#c49a50',1.5);
    poly(m,D.PARK,'#dde0e6','#9aa0aa',1.5);poly(m,D.PARK2,'#dde0e6','#9aa0aa',1.5);if(D.PARK3)poly(m,D.PARK3,'#dde0e6','#9aa0aa',1.5);
    (D.GZONES||[]).forEach(g=>poly(m,g.P,g.c,'#8a8070',1.2));
    const XW=(D.ZH2.xw||-69.6)*K;poly(m,[[XW,22.8*K],[D.ZH2.xd*K,22.8*K],[D.ZH2.xd*K,D.ZH2.zr*K],[XW,D.ZH2.zr*K]],'#d3d5da');
    if(D.THEATRE.pts){poly(m,D.THEATRE.pts,'#e6dccb','#a39373',2);const T=D.THEATRE,[x,y]=tm(T.x,T.z);m.strokeStyle='#a39373';m.lineWidth=1.5;[.75,.5,.25].forEach(f=>{m.beginPath();m.ellipse(x,y,T.r/K*S*f,T.r/K*S*f*ZS,0,Math.PI/2-T.a,Math.PI/2+T.a);m.stroke();});}
    else{const [x,y]=tm(D.THEATRE.x,D.THEATRE.z);m.fillStyle='#e6dccb';m.strokeStyle='#a39373';m.lineWidth=2;m.beginPath();m.arc(x,y,D.THEATRE.r/K*S,0,7);m.fill();m.stroke();}
    // 建物（不含校外背景建物；汽車畫成小方塊）
    D.BUILD.forEach(B=>{if(B.o.plain)return;const car=B.h<1.2&&B.o.nowin&&B.o.roofFx;const wall=B.o.nowin&&!car&&B.h<3;
      if(B.pts){poly(m,B.pts,car?'#9aa0aa':wall?'#cdbb96':'#ffffff',car?null:'#3d342c',wall?1:2.6);
        if(!car&&!wall){m.save();m.globalAlpha*=.22;poly(m,B.pts,B.roof);m.restore();}}
      else if(B.r){const [x,y]=tm(B.cx,B.cz);m.fillStyle='#fff';m.strokeStyle='#3d342c';m.lineWidth=2.6;m.beginPath();m.ellipse(x,y,B.r/K*S,B.r/K*S*ZS,0,0,7);m.fill();m.stroke();}});
    m.globalAlpha=1;
    // 格線（未放大座標）
    for(let x=Math.ceil(X0/5)*5;x<=X1;x+=5){const [a]=tu(x,0),major=x%10===0;m.strokeStyle=major?'rgba(80,90,130,.32)':'rgba(80,90,130,.13)';m.lineWidth=major?1.4:1;m.beginPath();m.moveTo(a,OY);m.lineTo(a,OY+MH);m.stroke();}
    for(let z=Math.ceil(Z0/5)*5;z<=Z1;z+=5){const [,b]=tu(0,z),major=z%10===0;m.strokeStyle=major?'rgba(80,90,130,.32)':'rgba(80,90,130,.13)';m.lineWidth=major?1.4:1;m.beginPath();m.moveTo(OX,b);m.lineTo(OX+MW,b);m.stroke();}
    // 建物名稱
    const named=D.BUILD.filter(B=>B.name&&!B.o.plain);
    named.forEach(B=>{const at=B.o.labAt?tu(...B.o.labAt):tm(B.cx,B.cz);lab(m,B.name,at[0],at[1],fade?22:26,fade?'rgba(255,255,255,.6)':'rgba(255,255,255,.92)',fade?'#555':'#1d1d28');});
    {const [x,y]=tm(D.THEATRE.lx||D.THEATRE.x,D.THEATRE.lz||D.THEATRE.z);lab(m,'天馬劇場',x,y,fade?20:23,'rgba(255,255,255,.85)',fade?'#555':'#1d1d28');}
    if(!fade)(D.LANES||[]).forEach(([n,L,c,w])=>{m.beginPath();L.forEach(([x,z],i)=>{const [a,b]=tu(x,z);i?m.lineTo(a,b):m.moveTo(a,b);});m.strokeStyle=c;m.lineWidth=w*S;m.lineCap='round';m.lineJoin='round';m.stroke();const q=L[Math.floor(L.length/2)],[a,b]=tu(q[0],q[1]);lab(m,n,a,b,15,'rgba(255,255,255,.85)','#3a3a46',true);});
    if(!fade)(D.GZONES||[]).forEach(g=>{if(!g.n||g.n==='石板路')return;const c=g.P.reduce((a,p)=>[a[0]+p[0]/g.P.length,a[1]+p[1]/g.P.length],[0,0]);const [x,y]=tm(...c);lab(m,g.n,x,y,15,'rgba(255,255,255,.8)','#2b4a3a',true);});
    if(!fade)D.GTEXT.forEach(([t,x,z])=>{if(/路 /.test(t))return;const [a,b]=tm(x,z);lab(m,t,a,b,16,'rgba(255,255,255,.7)','#3a3a46',false);});
    // 路名
    m.fillStyle='#555';m.font=`bold 24px ${F}`;m.textAlign='center';m.textBaseline='middle';
    {let [x,y]=tm(...D.ROAD1.lab);m.save();m.translate(x,y);m.rotate(Math.atan2(-.4921*ZS,.8705));m.fillText('廣福路',0,0);m.restore();[x,y]=tm(...D.ROAD2.lab);m.save();m.translate(x,y);m.rotate(Math.PI/2);m.fillText('南工路',0,0);m.restore();}
    // 校門
    D.GATES.forEach(g=>{const [x,y]=tm(g.x,g.z);pin(m,'🚪 '+g.name,x,y,'#2f6b5a',18,'pill');});
    m.restore();
  }
  function frame(m,title,sub){
    m.fillStyle='#1d1d28';m.font=`bold 40px ${F}`;m.textAlign='left';m.textBaseline='top';m.fillText(title,OX,26);
    m.fillStyle='#555';m.font=`21px ${F}`;m.fillText(sub,OX,84);
    m.strokeStyle='#4a5480';m.lineWidth=2;m.strokeRect(OX,OY,MW,MH);
    m.fillStyle='#4a5480';m.font=`bold 17px ${F}`;
    for(let x=Math.ceil(X0/10)*10;x<=X1;x+=10){const [a]=tu(x,0);m.textAlign='center';m.textBaseline='bottom';m.fillText(String(x),a,OY-6);m.textBaseline='top';m.fillText(String(x),a,OY+MH+6);}
    for(let z=Math.ceil(Z0/10)*10;z<=Z1;z+=10){const [,b]=tu(0,z);m.textBaseline='middle';m.textAlign='right';m.fillText(String(z),OX-8,b);m.textAlign='left';m.fillText(String(z),OX+MW+6,b);}
  }
  function legend(m,title,rows,x0){let x=x0,y=OY;const colW=LW/2-10,lh=27;
    m.fillStyle='#1d1d28';m.font=`bold 28px ${F}`;m.textAlign='left';m.textBaseline='top';m.fillText(title,x,y-48);
    rows.forEach(r=>{if(r.head){if(y>OY+MH-lh*3){x+=colW+20;y=OY;}y+=6;m.fillStyle=r.col||'#1d1d28';m.font=`bold 21px ${F}`;m.textAlign='left';m.textBaseline='top';m.fillText(r.head,x,y);y+=lh+2;return;}
      if(y>OY+MH-lh){x+=colW+20;y=OY;}
      m.font=`bold 17px ${F}`;const tw=Math.max(26,m.measureText(r.k).width+12);m.fillStyle=r.col;rr(m,x,y+1,tw,22,11);m.fill();m.fillStyle='#fff';m.textAlign='center';m.textBaseline='middle';m.fillText(r.k,x+tw/2,y+12);
      m.fillStyle='#222';m.font=`17px ${F}`;m.textAlign='left';let t=r.t;while(m.measureText(t).width>colW-tw-10&&t.length>4)t=t.slice(0,-2)+'…';m.fillText(t,x+tw+8,y+12);y+=lh;});
  }
  const CSV=[['分類','編號','名稱','x','z','目前說明','您的修改（請寫在這欄）']];
  /* ---------- 圖一：校園配置 ---------- */
  const [c1,m1]=mk();base(m1,false);
  frame(m1,'南山校園地圖輪廓（一）校園配置','格線是遊戲座標（未放大值），x 往右變大、z 往下變大；畫面上方＝遊戲畫面上方。數字、字母對照右側清單。');
  const rows1=[];
  // 主任與首長
  rows1.push({head:'👔 董事長、校長、處室主任（數字）',col:'#8c3b2e'});
  D.OFFNPC.forEach((n,i)=>{const k=String(i+1),nm=n.kind==='leader'?`${n.d.title} ${n.d.name}`:`${n.d.name} ${n.d.dir}`;const [x,y]=tm(n.x,n.z);pin(m1,k,x,y,n.kind==='leader'?'#b08a1a':'#8c3b2e');
    rows1.push({k,t:`${nm}（${un(n.x)}, ${un(n.z)}）`,col:n.kind==='leader'?'#b08a1a':'#8c3b2e'});CSV.push(['首長／主任',k,nm,un(n.x),un(n.z),n.kind==='leader'?'站在校園裡':'靠近按 E 進辦公室','']);});
  // 其他年級泡泡站位
  rows1.push({head:'💬 其他年級同學泡泡站位（字母）',col:'#2f8a4a'});
  const SPN={A:'大草坪北',B:'大草坪中',C:'草坪東側',D:'熊祥南側',E:'大中至正（高一、高二）',F:'幼保樓前',G:'曹俊西側（高三）',H:'熊祥（國一）',I:'崇智（國二、國三）',J:'曹俊東側（國三）'};
  Object.entries(D.SP).forEach(([k,[x,z]])=>{const [a,b]=tu(x,z);pin(m1,k,a,b,'#2f8a4a');rows1.push({k,t:`${SPN[k]||''}（${x}, ${z}）`,col:'#2f8a4a'});CSV.push(['泡泡站位',k,SPN[k]||'',x,z,'各月份「其他年級在做什麼」的同學站這裡','']);});
  // 各科小教室
  rows1.push({head:'⭐ 各科小教室（每月一處，Q1＝7–8 月）',col:'#2f78b5'});
  D.QLOC.forEach(([x,z],i)=>{const k='Q'+(i+1),[a,b]=tu(x,z);pin(m1,k,a,b,'#2f78b5',15,'pill');const mn=D.MONTHS[i]?D.MONTHS[i].name.split('・')[0]:'';rows1.push({k,t:`${mn}（${x}, ${z}）`,col:'#2f78b5'});CSV.push(['各科小教室',k,mn,x,z,'加分任務（藍色光圈）','']);});
  // 小門
  rows1.push({head:'🚪 小門（D）',col:'#2f6b5a'});
  D.SIDEDOORS.forEach((g,i)=>{const k='D'+(i+1),[a,b]=tu(g.x,g.z);pin(m1,k,a,b,'#2f6b5a',15,'pill');const nm=g.n.replace('小門・','小門 ');rows1.push({k,t:`${nm}${g.closed?'（關）':''}`,col:'#2f6b5a'});CSV.push(['小門',k,nm,g.x,g.z,g.d.replace(/^🚪 |^🎒 /,''),'']);});
  D.GATES.forEach(g=>CSV.push(['校門','',g.name,un(g.x),un(g.z),'','']));
  // 時光碑
  rows1.push({head:'🔶 校史時光碑（年份）',col:'#b5651d'});
  D.HISTORY.forEach(h=>{const [a,b]=tu(h.x,h.z);pin(m1,h.y,a,b,'#b5651d',14,'pill');rows1.push({k:h.y,t:`${h.t}（${h.x}, ${h.z}）`,col:'#b5651d'});CSV.push(['時光碑',h.y,h.t,h.x,h.z,h.d,'']);});
  // 路燈
  D.LAMPS.forEach(l=>{const [a,b]=tm(l.x,l.z);m1.fillStyle='#ffd84a';m1.strokeStyle='#5a4a10';m1.lineWidth=2;m1.beginPath();m1.arc(a,b,6,0,7);m1.fill();m1.stroke();});
  rows1.push({head:'其他',col:'#555'});rows1.push({k:'●',t:'黃點＝路燈（傍晚亮燈）',col:'#c9a227'});
  legend(m1,'圖一清單',rows1,OX+MW+50);
  // 建物與樓層導覽寫進 CSV
  D.BUILD.filter(B=>B.name&&!B.o.plain).forEach(B=>CSV.push(['建物','',B.name,un(B.cx),un(B.cz),`${r1(B.h)} 高`,'']));
  D.BINFO.forEach(b=>CSV.push(['樓層導覽','',b.name,b.at[0],b.at[1],b.floors.map(([f,t])=>(f?f+'：':'')+t).join('／'),'']));
  /* ---------- 圖二：每月任務位置 ---------- */
  const [c2,m2]=mk();base(m2,true);
  frame(m2,'南山校園地圖輪廓（二）每月任務位置','編號＝月份-順序（例：9-2 是 9 月第 2 個任務）。國一、高一位置不同時分開標「國」「高」。☆＝加分任務。');
  const MC=['#d8343f','#e07b1a','#b08a1a','#4f9a2f','#1f8a7a','#2f78b5','#4a52b5','#7a3fb5','#b53f9a','#8c3b2e','#3a3a46'];
  const rows2=[];const placed=[];
  const place=(x,y)=>{let yy=y;for(let k=0;k<8&&placed.some(([a,b])=>Math.abs(a-x)<44&&Math.abs(b-yy)<24);k++)yy+=24;placed.push([x,yy]);return yy;};
  D.MONTHS.forEach((M,mi)=>{const list=D.TASKS.filter(t=>t.m===mi&&t.id!=='buddy');if(!list.length)return;rows2.push({head:M.name,col:MC[mi]});
    list.forEach((t,i)=>{const k=`${mi===0?'7':M.name.match(/^\d+/)[0]}-${i+1}`,j=D.tc('j',t),s=D.tc('s',t);const same=j[0]===s[0]&&j[1]===s[1];
      const only=t.only==='j'?'（國一）':t.only==='s'?'（高一）':'';const nm=(j[2]===s[2]?j[2]:`${j[2]}／${s[2]}`)+(t.opt?' ☆':'');
      const draw=(p,suf)=>{const [a,b]=tu(p[0],p[1]);const y=place(a,b);if(y!==b){m2.strokeStyle=MC[mi];m2.lineWidth=1.5;m2.beginPath();m2.moveTo(a,b);m2.lineTo(a,y);m2.stroke();m2.fillStyle=MC[mi];m2.beginPath();m2.arc(a,b,4,0,7);m2.fill();}pin(m2,k+suf+(t.opt?'☆':''),a,y,MC[mi],15,'pill');};
      if(same||t.only){draw(t.only==='s'?s:j,'');}else{draw(j,'國');draw(s,'高');}
      rows2.push({k,t:`${nm}${only}${same||t.only?`（${(t.only==='s'?s:j)[0]}, ${(t.only==='s'?s:j)[1]}）`:'（國高不同）'}`,col:MC[mi]});
      CSV.push(['任務',k,nm+only,same||t.only?(t.only==='s'?s:j)[0]:`國 ${j[0]}／高 ${s[0]}`,same||t.only?(t.only==='s'?s:j)[1]:`國 ${j[1]}／高 ${s[1]}`,typeof t.title==='string'?t.title:'','']);});});
  legend(m2,'圖二清單',rows2,OX+MW+50);
  const csv='﻿'+CSV.map(r=>r.map(v=>{v=String(v??'');return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v;}).join(',')).join('\r\n');
  return {base:c1.toDataURL('image/png'),tasks:c2.toDataURL('image/png'),csv};
}
