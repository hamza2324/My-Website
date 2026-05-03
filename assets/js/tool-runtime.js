const tool = document.querySelector(".tool-shell")?.dataset.tool;
const ui = document.getElementById("toolUI");
const out = document.getElementById("toolResult");
function setResult(v) { out.textContent = v || ""; if (window.trackToolUse) window.trackToolUse(tool); }
function setHtml(v) { out.innerHTML = v || ""; if (window.trackToolUse) window.trackToolUse(tool); }
function copyText(v) { navigator.clipboard.writeText(v || out.textContent || ""); }
function mkBase() { return '<textarea id="input" placeholder="Enter input..."></textarea><div><button id="run" class="btn primary">Run Tool</button> <button id="copy" class="btn">Copy</button> <button id="clear" class="btn">Clear</button></div>'; }
function words(text) { return (text.trim().match(/\S+/g) || []); }
function sentences(text) { return text.split(/[.!?]+/).map(s => s.trim()).filter(Boolean); }
function fmtTime(minutesFloat) { const total = Math.max(0, Math.round(minutesFloat * 60)); const m = Math.floor(total / 60); const s = total % 60; return `${m} min ${s} sec`; }

const commonPasswords = new Set(["password","123456","qwerty","letmein","admin","welcome","abc123","password123","iloveyou","123123"]);

const builders = {
  "text-diff-checker": () => {
    ui.innerHTML = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px"><textarea id="a" placeholder="Original text"></textarea><textarea id="b" placeholder="Modified text"></textarea></div><label>Mode <select id="mode"><option value="line">Line</option><option value="word">Word</option><option value="char">Character</option></select></label><button id="run" class="btn primary">Compare</button><button id="copy" class="btn">Copy Diff</button><a id="downloadDiff" class="btn" download="changes.diff">Download .diff</a>';
    const tok = (s,m)=>m==="line"?s.split(/\n/):m==="word"?(s.match(/\S+|\s+/g)||[]):s.split("");
    function lcsDiff(x,y){
      const n=x.length,m=y.length,dp=Array.from({length:n+1},()=>Array(m+1).fill(0));
      for(let i=n-1;i>=0;i--)for(let j=m-1;j>=0;j--)dp[i][j]=x[i]===y[j]?1+dp[i+1][j+1]:Math.max(dp[i+1][j],dp[i][j+1]);
      let i=0,j=0,out=[],add=0,rem=0,same=0;
      while(i<n&&j<m){if(x[i]===y[j]){out.push("  "+x[i]);same++;i++;j++;}else if(dp[i+1][j]>=dp[i][j+1]){out.push("- "+x[i]);rem++;i++;}else{out.push("+ "+y[j]);add++;j++;}}
      while(i<n){out.push("- "+x[i]);rem++;i++;} while(j<m){out.push("+ "+y[j]);add++;j++;}
      const sim=Math.round((same/Math.max(1,Math.max(n,m)))*100);
      return {text:out.join(tok("", "line").length? "\n":" "),add,rem,same,sim};
    }
    const run=()=>{const m=document.getElementById("mode").value;const A=tok(document.getElementById("a").value,m),B=tok(document.getElementById("b").value,m);const d=lcsDiff(A,B);const payload=`Added: ${d.add} | Removed: ${d.rem} | Unchanged: ${d.same} | Similarity: ${d.sim}%\n\n${d.text}`;setResult(payload);const blob=new Blob([d.text],{type:"text/x-diff"});document.getElementById("downloadDiff").href=URL.createObjectURL(blob);};
    document.getElementById("run").onclick=run;document.getElementById("copy").onclick=()=>copyText();run();
  },
  "cron-expression-builder": () => {
    ui.innerHTML = '<div style="display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px"><input id="min" placeholder="Minute" value="0"><input id="hr" placeholder="Hour" value="9"><input id="dom" placeholder="Day" value="*"><input id="mon" placeholder="Month" value="*"><input id="dow" placeholder="Weekday" value="1-5"></div><div><button data-p="* * * * *" class="btn preset">Every minute</button> <button data-p="0 * * * *" class="btn preset">Every hour</button> <button data-p="0 0 * * *" class="btn preset">Daily midnight</button></div><button id="run" class="btn primary">Build Cron</button><button id="copy" class="btn">Copy</button>';
    const nextRuns=(expr,count=5)=>{const [mi,hh,dd,mm,ww]=expr.split(" ");const ok=(v,p,max)=>p==="*"||p===String(v)||(p.includes("-")&&(()=>{const[a,b]=p.split("-").map(Number);return v>=a&&v<=b;})())||(p.includes("/")&&(()=>{const[a,s]=p.split("/");if(a!=="*")return false;return v%Number(s)===0;})())||(p.split(",").includes(String(v)));
      const out=[];let d=new Date();d.setSeconds(0,0);
      for(let i=0;i<200000&&out.length<count;i++){d=new Date(d.getTime()+60000);if(ok(d.getMinutes(),mi,59)&&ok(d.getHours(),hh,23)&&ok(d.getDate(),dd,31)&&ok(d.getMonth()+1,mm,12)&&ok(d.getDay(),ww,6))out.push(d.toString());}
      return out;
    };
    const human=(e)=>{const [m,h,dom,mon,dow]=e.split(" ");return `At ${h}:${String(m).padStart(2,"0")}, day ${dom}, month ${mon}, weekday ${dow}`;};
    const run=()=>{const expr=[...["min","hr","dom","mon","dow"].map(id=>document.getElementById(id).value.trim()||"*")].join(" ");const runs=nextRuns(expr).map((r,i)=>`${i+1}. ${r}`).join("\n");setResult(`Cron: ${expr}\n${human(expr)}\n\nNext 5 runs:\n${runs}`);};
    document.querySelectorAll(".preset").forEach(b=>b.onclick=()=>{const [a,b2,c,d,e]=b.dataset.p.split(" ");["min","hr","dom","mon","dow"].forEach((id,i)=>document.getElementById(id).value=[a,b2,c,d,e][i]);run();});
    document.getElementById("run").onclick=run;document.getElementById("copy").onclick=()=>copyText();run();
  },
  "image-resizer": () => {
    ui.innerHTML='<input id="img" type="file" accept="image/*" multiple><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><input id="w" type="number" placeholder="Width"><input id="h" type="number" placeholder="Height"></div><label><input id="lock" type="checkbox" checked> Lock aspect ratio</label><label>Quality <input id="q" type="range" min="1" max="100" value="90"></label><select id="fmt"><option value="image/jpeg">JPEG</option><option value="image/png">PNG</option><option value="image/webp">WebP</option></select><button id="run" class="btn primary">Resize</button><a id="dl" class="btn" download="resized-image">Download</a>';
    let srcImg,canvas=document.createElement("canvas");
    const fileInput=document.getElementById("img");
    fileInput.onchange=()=>{const f=fileInput.files[0];if(!f)return;const img=new Image();img.onload=()=>{srcImg=img;document.getElementById("w").value=img.width;document.getElementById("h").value=img.height;setResult(`Original: ${img.width}x${img.height} | ${(f.size/1024).toFixed(1)} KB`);};img.src=URL.createObjectURL(f);};
    document.getElementById("w").oninput=()=>{if(srcImg&&document.getElementById("lock").checked){document.getElementById("h").value=Math.round((document.getElementById("w").value/srcImg.width)*srcImg.height);}};
    document.getElementById("run").onclick=()=>{if(!srcImg){setResult("Upload image first.");return;}const w=+document.getElementById("w").value,h=+document.getElementById("h").value,fmt=document.getElementById("fmt").value,q=+document.getElementById("q").value/100;canvas.width=w;canvas.height=h;canvas.getContext("2d").drawImage(srcImg,0,0,w,h);canvas.toBlob(b=>{const url=URL.createObjectURL(b);const dl=document.getElementById("dl");dl.href=url;dl.download=`resized.${fmt.split("/")[1]}`;setResult(`Resized: ${w}x${h} | ${(b.size/1024).toFixed(1)} KB`);},fmt,q);};
  },
  "png-to-jpg": () => {
    ui.innerHTML='<input id="img" type="file" accept="image/png" multiple><label>Background <input id="bg" type="color" value="#ffffff"></label><label>Quality <input id="q" type="range" min="60" max="100" value="90"></label><button id="run" class="btn primary">Convert</button><a id="dl" class="btn" download="converted.jpg">Download First JPG</a><a id="zipdl" class="btn" download="converted-jpg.zip">Download All ZIP</a>';
    const ensureZip = () => new Promise((resolve) => {
      if (window.JSZip) return resolve(window.JSZip);
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
      s.onload = () => resolve(window.JSZip);
      document.body.appendChild(s);
    });
    document.getElementById("run").onclick=async()=>{const files=[...document.getElementById("img").files];if(!files.length){setResult("Upload PNG files first.");return;}const q=+document.getElementById("q").value/100,bg=document.getElementById("bg").value;const firstOut={};const zipLib=await ensureZip();const zip=new zipLib();let report=[];
      const convertOne=(f)=>new Promise((resolve)=>{const img=new Image();img.onload=()=>{const c=document.createElement("canvas");c.width=img.width;c.height=img.height;const ctx=c.getContext("2d");ctx.fillStyle=bg;ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(img,0,0);c.toBlob(b=>{const outName=f.name.replace(/\.png$/i,".jpg");zip.file(outName,b);report.push(`${f.name}: ${(f.size/1024).toFixed(1)}KB → ${(b.size/1024).toFixed(1)}KB`);if(!firstOut.blob){firstOut.blob=b;firstOut.name=outName;}resolve();},"image/jpeg",q);};img.src=URL.createObjectURL(f);});
      for(const f of files) await convertOne(f);
      if(firstOut.blob){const u=URL.createObjectURL(firstOut.blob);const dl=document.getElementById("dl");dl.href=u;dl.download=firstOut.name;}
      const zipBlob=await zip.generateAsync({type:"blob"});const zu=URL.createObjectURL(zipBlob);const z=document.getElementById("zipdl");z.href=zu;setResult(report.join("\n"));};
  },
  "meta-tag-generator": () => {
    ui.innerHTML='<input id="title" placeholder="Page title"><textarea id="desc" placeholder="Meta description"></textarea><input id="kw" placeholder="Keywords comma-separated"><input id="author" placeholder="Author"><input id="url" placeholder="Canonical URL"><button id="run" class="btn primary">Generate</button><button id="copy" class="btn">Copy HTML</button>';
    const run=()=>{const t=document.getElementById("title").value,d=document.getElementById("desc").value,k=document.getElementById("kw").value,a=document.getElementById("author").value,u=document.getElementById("url").value;setResult(`<!-- SEO Meta Tags -->\n<title>${t}</title>\n<meta name="description" content="${d}">\n<meta name="keywords" content="${k}">\n<meta name="author" content="${a}">\n<link rel="canonical" href="${u}">`);};
    document.getElementById("run").onclick=run;document.getElementById("copy").onclick=()=>copyText();run();
  },
  "utm-link-builder": () => {
    ui.innerHTML='<input id="url" placeholder="Destination URL"><input id="src" placeholder="utm_source"><input id="med" placeholder="utm_medium"><input id="cmp" placeholder="utm_campaign"><input id="term" placeholder="utm_term (optional)"><input id="cnt" placeholder="utm_content (optional)"><button id="run" class="btn primary">Build UTM</button><button id="copy" class="btn">Copy URL</button>';
    const run=()=>{try{const u=new URL(document.getElementById("url").value);[["utm_source","src"],["utm_medium","med"],["utm_campaign","cmp"],["utm_term","term"],["utm_content","cnt"]].forEach(([k,id])=>{const v=document.getElementById(id).value.trim();if(v)u.searchParams.set(k,v);});setResult(u.toString());const hist=JSON.parse(localStorage.getItem("utm_history")||"[]");hist.unshift(u.toString());localStorage.setItem("utm_history",JSON.stringify(hist.slice(0,10)));}catch{setResult("Enter a valid URL.");}};
    document.getElementById("run").onclick=run;document.getElementById("copy").onclick=()=>copyText();run();
  },
  "open-graph-preview": () => {
    ui.innerHTML='<input id="url" placeholder="Enter URL e.g. https://example.com"><button id="run" class="btn primary">Fetch OG Tags</button>';
    document.getElementById("run").onclick=async()=>{const u=document.getElementById("url").value.trim();if(!u){setResult("Enter URL.");return;}try{setResult("Fetching...");const api=`https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`;const html=await fetch(api).then(r=>r.text());const doc=new DOMParser().parseFromString(html,"text/html");const meta=(p)=>doc.querySelector(`meta[property='${p}']`)?.content||"";const title=meta("og:title")||doc.title||"";const desc=meta("og:description")||"";const img=meta("og:image")||"";const missing=[];["og:title","og:description","og:image","og:type","og:url"].forEach(k=>{if(!doc.querySelector(`meta[property='${k}']`))missing.push(k);});setHtml(`<div><h3>Preview</h3><div style="border:1px solid #ddd;padding:10px;border-radius:8px">${img?`<img src="${img}" alt="" style="max-width:100%;border-radius:6px">`:""}<p><strong>${title||"No OG title"}</strong></p><p>${desc||"No OG description"}</p></div><h4>Missing tags</h4><p>${missing.length?missing.join(", "):"None"}</p></div>`);}catch(e){setResult("Could not fetch URL: "+e.message);}};
  },
  "robots-txt-generator": () => {
    ui.innerHTML='<input id="ua" placeholder="User-agent" value="*"><textarea id="allow" placeholder="Allow paths (one per line)">/</textarea><textarea id="disallow" placeholder="Disallow paths (one per line)"></textarea><input id="crawl" type="number" placeholder="Crawl-delay (optional)"><input id="sitemap" placeholder="Sitemap URL"><button id="run" class="btn primary">Generate robots.txt</button><button id="copy" class="btn">Copy</button>';
    const run=()=>{const ua=document.getElementById("ua").value||"*";const allows=(document.getElementById("allow").value||"").split("\n").map(s=>s.trim()).filter(Boolean);const dis=(document.getElementById("disallow").value||"").split("\n").map(s=>s.trim()).filter(Boolean);const crawl=document.getElementById("crawl").value.trim();const sm=document.getElementById("sitemap").value.trim();let txt=`User-agent: ${ua}\n`;allows.forEach(a=>txt+=`Allow: ${a}\n`);dis.forEach(d=>txt+=`Disallow: ${d}\n`);if(crawl)txt+=`Crawl-delay: ${crawl}\n`;if(sm)txt+=`Sitemap: ${sm}\n`;setResult(txt);};
    document.getElementById("run").onclick=run;document.getElementById("copy").onclick=()=>copyText();run();
  },
  "yaml-to-json": () => {
    ui.innerHTML='<textarea id="input" placeholder="YAML or JSON"></textarea><select id="dir"><option value="y2j">YAML → JSON</option><option value="j2y">JSON → YAML</option></select><button id="run" class="btn primary">Convert</button>';
    function toYaml(obj,indent=0){if(obj===null)return"null";if(typeof obj!=="object")return String(obj);if(Array.isArray(obj))return obj.map(v=>" ".repeat(indent)+"- "+(typeof v==="object"?"\n"+toYaml(v,indent+2):v)).join("\n");return Object.entries(obj).map(([k,v])=>" ".repeat(indent)+k+": "+(typeof v==="object"?"\n"+toYaml(v,indent+2):v)).join("\n");}
    function simpleYamlParse(y){const lines=y.split("\n").filter(l=>l.trim());const o={};for(const ln of lines){const m=ln.match(/^([^:]+):\s*(.*)$/);if(m)o[m[1].trim()]=m[2].trim();}return o;}
    const ensureYaml = () => new Promise((resolve) => {
      if (window.jsyaml) return resolve(window.jsyaml);
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/js-yaml/4.1.0/js-yaml.min.js";
      s.onload = () => resolve(window.jsyaml);
      document.body.appendChild(s);
    });
    document.getElementById("run").onclick=async()=>{const dir=document.getElementById("dir").value;const t=document.getElementById("input").value;try{if(dir==="y2j"){const y=await ensureYaml();setResult(JSON.stringify(y.load(t),null,2));}else{try{const y=await ensureYaml();setResult(y.dump(JSON.parse(t)));}catch{setResult(toYaml(JSON.parse(t)));}}}catch(e){setResult("Conversion error: "+e.message);}};
  },
  "sql-formatter": () => {
    ui.innerHTML = '<textarea id="input" placeholder="Paste SQL query..."></textarea><button id="fmt" class="btn primary">Format</button><button id="min" class="btn">Minify</button><button id="copy" class="btn">Copy</button>';
    const ensureSql = () => new Promise((resolve) => {
      if (window.sqlFormatter) return resolve(window.sqlFormatter);
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/sql-formatter/12.2.4/sql-formatter.min.js";
      s.onload = () => resolve(window.sqlFormatter);
      document.body.appendChild(s);
    });
    document.getElementById("fmt").onclick = async () => { try { const f = await ensureSql(); setResult(f.format(document.getElementById("input").value)); } catch(e){ setResult("Format error: "+e.message);} };
    document.getElementById("min").onclick = async () => { try { const f = await ensureSql(); setResult(f.compact(document.getElementById("input").value)); } catch(e){ setResult("Minify error: "+e.message);} };
    document.getElementById("copy").onclick = () => copyText();
  },
  "xml-to-json": () => {
    ui.innerHTML='<textarea id="input" placeholder="Paste XML"></textarea><label><input id="attrs" type="checkbox" checked> Include attributes</label><button id="run" class="btn primary">Convert</button>';
    function nodeToObj(node,attrs){const obj={};if(attrs&&node.attributes&&node.attributes.length){obj["@attributes"]={};for(const a of node.attributes)obj["@attributes"][a.name]=a.value;}const kids=[...node.children];if(!kids.length){const txt=node.textContent.trim();return Object.keys(obj).length?(txt?{...obj,"#text":txt}:obj):txt;}for(const k of kids){const v=nodeToObj(k,attrs);if(obj[k.nodeName]){if(!Array.isArray(obj[k.nodeName]))obj[k.nodeName]=[obj[k.nodeName]];obj[k.nodeName].push(v);}else obj[k.nodeName]=v;}return obj;}
    document.getElementById("run").onclick=()=>{try{const xml=document.getElementById("input").value;const doc=new DOMParser().parseFromString(xml,"application/xml");const err=doc.querySelector("parsererror");if(err){setResult("Invalid XML");return;}const root=doc.documentElement;setResult(JSON.stringify({[root.nodeName]:nodeToObj(root,document.getElementById("attrs").checked)},null,2));}catch(e){setResult("Error: "+e.message);}};
  },
  "json-to-table": () => {
    ui.innerHTML='<textarea id="input" placeholder=\'Paste JSON array e.g. [{"name":"A","age":20}]\'></textarea><button id="run" class="btn primary">Render Table</button><button id="csv" class="btn">Copy as CSV</button><input id="searchTbl" placeholder="Filter rows">';
    let cache=[], sortKey=null, sortDir=1;
    const toCsv = (keys, rows) => [keys.join(","), ...rows.map(r => r.map(v => `"${String(v??"").replace(/"/g,'""')}"`).join(","))].join("\n");
    const render=(arr)=>{
      if(!Array.isArray(arr)||!arr.length){setResult("Provide a JSON array with at least one row.");return;}
      const keys=[...new Set(arr.flatMap(o=>Object.keys(o)))];
      let rows=arr.map(o=>keys.map(k=>o[k]??""));
      const q=(document.getElementById("searchTbl").value||"").toLowerCase();
      rows=rows.filter(r=>r.join(" ").toLowerCase().includes(q));
      if(sortKey!==null){rows.sort((a,b)=>String(a[sortKey]).localeCompare(String(b[sortKey]))*sortDir);}
      const head = keys.map((k,i)=>`<th data-i="${i}" style="cursor:pointer">${k}${sortKey===i?(sortDir>0?" ▲":" ▼"):""}</th>`).join("");
      const body = rows.slice(0,250).map(r=>`<tr>${r.map(v=>`<td>${String(v)}</td>`).join("")}</tr>`).join("");
      setHtml(`<div style="overflow:auto"><table class="data-table"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div><p>Rows shown: ${Math.min(rows.length,250)} / ${rows.length}</p>`);
      out.querySelectorAll("th").forEach(th=>th.onclick=()=>{const i=Number(th.dataset.i);if(sortKey===i)sortDir*=-1;else{sortKey=i;sortDir=1;}render(cache);});
      document.getElementById("csv").onclick=()=>copyText(toCsv(keys,rows));
    };
    document.getElementById("run").onclick=()=>{try{cache=JSON.parse(document.getElementById("input").value);render(cache);}catch(e){setResult("Invalid JSON: "+e.message);}};
    document.getElementById("searchTbl").oninput=()=>render(cache);
  },
  "reading-time-estimator": () => {
    ui.innerHTML = '<textarea id="input" placeholder="Paste article text..."></textarea><label>Speed <select id="wpm"><option value="150">Slow (150)</option><option value="200" selected>Average (200)</option><option value="300">Fast (300)</option></select></label><button id="copy" class="btn">Share this estimate</button>';
    const inp = document.getElementById("input");
    const wpm = document.getElementById("wpm");
    const run = () => {
      const t = inp.value;
      const wc = words(t).length;
      const cc = t.length;
      const pc = t.split(/\n+/).filter(Boolean).length;
      const readMin = wc / Number(wpm.value || 200);
      const speakMin = wc / 140;
      const audioMin = wc / 150;
      setResult(`Estimated Reading Time: ${fmtTime(readMin)}\nWord Count: ${wc}\nCharacter Count: ${cc}\nParagraph Count: ${pc}\nSpeaking Time: ${fmtTime(speakMin)}\nAudiobook Time: ${fmtTime(audioMin)}`);
    };
    inp.addEventListener("input", run); wpm.addEventListener("change", run); run();
    document.getElementById("copy").onclick = () => copyText();
  },
  "sentence-counter": () => {
    ui.innerHTML = '<textarea id="input" placeholder="Paste text..."></textarea><label><input id="show" type="checkbox"> Show numbered sentences</label>';
    const inp = document.getElementById("input"), show = document.getElementById("show");
    const run = () => {
      const arr = sentences(inp.value);
      const counts = arr.map(s => words(s).length);
      const total = arr.length;
      const avg = total ? (counts.reduce((a,b)=>a+b,0)/total).toFixed(2) : 0;
      const longest = total ? arr[counts.indexOf(Math.max(...counts))] : "";
      const shortest = total ? arr[counts.indexOf(Math.min(...counts))] : "";
      const complexity = avg < 12 ? "Simple" : avg < 20 ? "Moderate" : "Complex";
      let details = "";
      if (show.checked) details = "\n\nSentences:\n" + arr.map((s,i)=>`${i+1}. ${s}`).join("\n");
      setResult(`Total Sentences: ${total}\nAverage Words/Sentence: ${avg}\nComplexity: ${complexity}\nLongest: ${longest}\nShortest: ${shortest}${details}`);
    };
    inp.addEventListener("input", run); show.addEventListener("change", run); run();
  },
  "word-frequency-counter": () => {
    const stop = new Set("the a an and or if is are was were to in on at of for with from by as be been being this that these those it its".split(" "));
    ui.innerHTML = '<textarea id="input" placeholder="Paste text..."></textarea><label><input id="ignore" type="checkbox" checked> Ignore stop words</label><label><input id="case" type="checkbox"> Case sensitive</label><label>Top N <select id="n"><option>10</option><option>20</option><option>50</option><option>100</option></select></label><button id="copy" class="btn">Copy Table</button>';
    const inp=q("input"),ig=q("ignore"),cs=q("case"),n=q("n");
    function q(id){return document.getElementById(id);}
    const run=()=>{
      const raw=inp.value.match(/[A-Za-z0-9']+/g)||[];
      const list=raw.map(w=>cs.checked?w:w.toLowerCase()).filter(w=>w.length>=1).filter(w=>!(ig.checked&&stop.has(w)));
      const map={};list.forEach(w=>map[w]=(map[w]||0)+1);
      const arr=Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,Number(n.value));
      const total=list.length||1;
      const table=arr.map((e,i)=>`${i+1}\t${e[0]}\t${e[1]}\t${((e[1]/total)*100).toFixed(2)}%`).join("\n");
      setResult(`Rank\tWord\tCount\tFrequency\n${table}`);
    };
    inp.addEventListener("input",run);ig.addEventListener("change",run);cs.addEventListener("change",run);n.addEventListener("change",run);run();
    q("copy").onclick=()=>copyText();
  },
  "regex-tester": () => {
    ui.innerHTML = '<input id="pat" placeholder="Pattern e.g. \\d+"><input id="flags" placeholder="Flags e.g. gi"><textarea id="txt" placeholder="Test string..."></textarea>';
    const pat=document.getElementById("pat"),flags=document.getElementById("flags"),txt=document.getElementById("txt");
    const run=()=>{try{const re=new RegExp(pat.value,flags.value);const m=[...txt.value.matchAll(re)];const rows=m.map((x,i)=>`${i+1}. "${x[0]}" @ ${x.index}-${x.index+x[0].length}`).join("\n");setResult(`Matches: ${m.length}\n${rows}`);}catch(e){setResult(`Regex error: ${e.message}`);}};
    pat.addEventListener("input",run);flags.addEventListener("input",run);txt.addEventListener("input",run);run();
  },
  "jwt-decoder": () => {
    ui.innerHTML = '<textarea id="input" placeholder="Paste JWT token"></textarea><button id="copy" class="btn">Copy Payload</button><p>JWT decoding happens entirely in your browser.</p>';
    const inp=document.getElementById("input");
    const b64url=(s)=>{s=s.replace(/-/g,"+").replace(/_/g,"/");while(s.length%4)s+="=";return atob(s);};
    const run=()=>{const t=inp.value.trim();const parts=t.split(".");if(parts.length<2){setResult("Enter a valid JWT.");return;}try{const h=JSON.parse(b64url(parts[0]));const p=JSON.parse(b64url(parts[1]));const exp=p.exp?new Date(p.exp*1000):null;const now=Date.now();const status=exp?(exp.getTime()>now?`Expires: ${exp.toISOString()}`:`EXPIRED: ${exp.toISOString()}`):"No exp claim";setResult(`Header:\n${JSON.stringify(h,null,2)}\n\nPayload:\n${JSON.stringify(p,null,2)}\n\nSignature: ${parts[2]?parts[2].slice(0,20)+"...":"N/A"}\n${status}`);}catch(e){setResult("Could not decode JWT: "+e.message);}};
    inp.addEventListener("input",run);run();
    document.getElementById("copy").onclick=()=>{const t=inp.value.trim().split(".");if(t.length>1){try{copyText(JSON.stringify(JSON.parse(b64url(t[1])),null,2));}catch{}}};
  },
  "hash-generator": () => {
    ui.innerHTML = '<textarea id="input" placeholder="Text to hash"></textarea><input id="secret" placeholder="HMAC secret (optional)"><button id="run" class="btn primary">Generate Hashes</button><button id="copy" class="btn">Copy</button>';
    async function digest(algo,text){const buf=new TextEncoder().encode(text);const hash=await crypto.subtle.digest(algo,buf);return [...new Uint8Array(hash)].map(b=>b.toString(16).padStart(2,"0")).join("");}
    async function hmacSHA256(secret,msg){const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);const sig=await crypto.subtle.sign("HMAC",key,new TextEncoder().encode(msg));return [...new Uint8Array(sig)].map(b=>b.toString(16).padStart(2,"0")).join("");}
    const ensureMd5=()=>new Promise((resolve)=>{if(window.md5)return resolve(window.md5);const s=document.createElement("script");s.src="https://cdnjs.cloudflare.com/ajax/libs/blueimp-md5/2.19.0/js/md5.min.js";s.onload=()=>resolve(window.md5);document.body.appendChild(s);});
    document.getElementById("run").onclick=async()=>{const t=document.getElementById("input").value;const secret=document.getElementById("secret").value;const sha1=await digest("SHA-1",t);const sha256=await digest("SHA-256",t);const sha384=await digest("SHA-384",t);const sha512=await digest("SHA-512",t);const md5Fn=await ensureMd5();const md5v=md5Fn?md5Fn(t):"N/A";const hmac=secret?await hmacSHA256(secret,t):"Not provided";setResult(`MD5: ${md5v}\nSHA-1: ${sha1}\nSHA-256: ${sha256}\nSHA-384: ${sha384}\nSHA-512: ${sha512}\nHMAC-SHA256: ${hmac}`);};
    document.getElementById("copy").onclick=()=>copyText();
  },
  "loan-emi-calculator": () => {
    ui.innerHTML = '<input id="p" type="number" placeholder="Loan Amount" value="1000000"><input id="r" type="number" placeholder="Annual Interest %" value="12"><input id="n" type="number" placeholder="Tenure months" value="60"><button id="run" class="btn primary">Calculate</button>';
    const run=()=>{const P=+document.getElementById("p").value||0;const annual=+document.getElementById("r").value||0;const n=+document.getElementById("n").value||0;const rr=annual/1200;const emi=rr?P*rr*Math.pow(1+rr,n)/(Math.pow(1+rr,n)-1):P/(n||1);const total=emi*n;const interest=total-P;setResult(`Monthly EMI: ${emi.toFixed(2)}\nTotal Interest: ${interest.toFixed(2)}\nTotal Payable: ${total.toFixed(2)}`);};
    ["p","r","n"].forEach(id=>document.getElementById(id).addEventListener("input",run));document.getElementById("run").onclick=run;run();
  },
  "password-strength-checker": () => {
    ui.innerHTML = '<input id="input" type="password" placeholder="Enter password"><button id="toggle" class="btn">Show/Hide</button>';
    const inp=document.getElementById("input");
    document.getElementById("toggle").onclick=()=>{inp.type=inp.type==="password"?"text":"password";};
    const run=()=>{const p=inp.value;let score=0;const checks=[["Min 8 chars",p.length>=8],["Uppercase",/[A-Z]/.test(p)],["Lowercase",/[a-z]/.test(p)],["Number",/\d/.test(p)],["Symbol",/[^A-Za-z0-9]/.test(p)],["Not common",!commonPasswords.has(p.toLowerCase())],["No sequences",!/(123|abc|qwerty)/i.test(p)]];
      score=checks.filter(c=>c[1]).length*14;const label=score<30?"Weak":score<50?"Fair":score<70?"Good":score<90?"Strong":"Very Strong";
      setResult(`Strength: ${score}/100 (${label})\n`+checks.map(c=>`${c[1]?"✅":"❌"} ${c[0]}`).join("\n"));
    }; inp.addEventListener("input",run);run();
  },
  "scientific-calculator": () => {
    ui.innerHTML = '<input id="expr" placeholder="e.g. sin(0.5)+2*3"><button id="run" class="btn primary">Calculate</button><button id="clear" class="btn">Clear</button>';
    const history=[];
    const run=()=>{const exp=document.getElementById("expr").value.trim();if(!exp){setResult("");return;}try{const safe=exp.replace(/\bpi\b/gi,"Math.PI").replace(/\be\b/g,"Math.E").replace(/\bsin\(/g,"Math.sin(").replace(/\bcos\(/g,"Math.cos(").replace(/\btan\(/g,"Math.tan(").replace(/\blog\(/g,"Math.log10(").replace(/\bln\(/g,"Math.log(").replace(/\bsqrt\(/g,"Math.sqrt(");const val=Function(`"use strict";return (${safe})`)();history.unshift(`${exp} = ${val}`);if(history.length>20)history.pop();setResult(`Result: ${val}\n\nHistory:\n${history.join("\n")}`);}catch(e){setResult("Invalid expression: "+e.message);}};
    document.getElementById("run").onclick=run;document.getElementById("clear").onclick=()=>{document.getElementById("expr").value="";setResult("");};
  },
  "working-days-calculator": () => {
    ui.innerHTML='<input id="start" type="date"><input id="end" type="date"><label><input id="pk" type="checkbox"> Exclude Pakistan major holidays</label><textarea id="custom" placeholder="Custom holidays YYYY-MM-DD one per line"></textarea><button id="run" class="btn primary">Calculate</button>';
    const pkH=new Set(["2026-03-23","2026-08-14","2026-12-25","2026-07-01"]);
    const run=()=>{const s=new Date(document.getElementById("start").value),e=new Date(document.getElementById("end").value);if(isNaN(s)||isNaN(e)){setResult("Select valid dates.");return;}const customs=new Set((document.getElementById("custom").value||"").split("\n").map(x=>x.trim()).filter(Boolean));let work=0,total=0,excluded=[];for(let d=new Date(s);d<=e;d.setDate(d.getDate()+1)){total++;const iso=d.toISOString().slice(0,10);const wk=d.getDay();const holiday=(document.getElementById("pk").checked&&pkH.has(iso))||customs.has(iso);if(holiday){excluded.push(iso);continue;}if(wk!==0&&wk!==6)work++;}setResult(`Total calendar days: ${total}\nWorking days: ${work}\nExcluded holidays: ${excluded.length}\n${excluded.join(", ")}`);};
    document.getElementById("run").onclick=run;
  },
  "unix-timestamp-converter": () => {
    ui.innerHTML='<input id="ts" placeholder="Unix timestamp (sec or ms)"><button id="toDate" class="btn primary">Timestamp → Date</button><input id="dt" type="datetime-local"><button id="toTs" class="btn">Date → Timestamp</button><button id="now" class="btn">Current Timestamp</button><textarea id="batch" placeholder="Batch timestamps (one per line)"></textarea><button id="batchRun" class="btn">Batch Convert</button>';
    document.getElementById("toDate").onclick=()=>{let v=document.getElementById("ts").value.trim();if(!v){setResult("Enter timestamp.");return;}let n=Number(v);if(!Number.isFinite(n)){setResult("Invalid number.");return;}if(String(Math.trunc(n)).length<=10)n*=1000;setResult(new Date(n).toString());};
    document.getElementById("toTs").onclick=()=>{const v=document.getElementById("dt").value;if(!v){setResult("Pick date/time.");return;}const ms=new Date(v).getTime();setResult(`Milliseconds: ${ms}\nSeconds: ${Math.floor(ms/1000)}`);};
    document.getElementById("now").onclick=()=>{const ms=Date.now();setResult(`Milliseconds: ${ms}\nSeconds: ${Math.floor(ms/1000)}`);};
    document.getElementById("batchRun").onclick=()=>{const lines=(document.getElementById("batch").value||"").split("\n").map(x=>x.trim()).filter(Boolean);const outLines=lines.map(x=>{let n=Number(x);if(!Number.isFinite(n))return `${x} => invalid`;if(String(Math.trunc(n)).length<=10)n*=1000;return `${x} => ${new Date(n).toISOString()}`;});setResult(outLines.join("\n"));};
  },
  "screenshot-to-text": () => {
    ui.innerHTML = '<input id="img" type="file" accept="image/*"><button id="paste" class="btn">Paste from Clipboard</button><select id="lang"><option value="eng">English</option><option value="spa">Spanish</option><option value="fra">French</option><option value="deu">German</option><option value="hin">Hindi</option><option value="ara">Arabic</option><option value="urd">Urdu</option></select><button id="run" class="btn primary">Extract Text</button><button id="copy" class="btn">Copy Text</button><p>OCR runs in your browser. Images are never uploaded.</p>';
    let pastedFile = null;
    document.getElementById("paste").onclick = async () => {
      try {
        const items = await navigator.clipboard.read();
        for (const item of items) {
          const type = item.types.find(t => t.startsWith("image/"));
          if (type) {
            const blob = await item.getType(type);
            pastedFile = new File([blob], "clipboard-image.png", { type });
            setResult("Clipboard image captured. Click Extract Text.");
            return;
          }
        }
        setResult("No image found in clipboard.");
      } catch {
        setResult("Clipboard paste not supported in this browser context.");
      }
    };
    document.getElementById("run").onclick=async()=>{
      const file=document.getElementById("img").files[0] || pastedFile;
      if(!file){setResult("Upload or paste an image first.");return;}
      setResult("Loading OCR engine... 0%");
      const ensure = () => new Promise((resolve)=>{ if(window.Tesseract) return resolve(window.Tesseract); const s=document.createElement("script"); s.src="https://cdnjs.cloudflare.com/ajax/libs/tesseract.js/4.1.4/tesseract.min.js"; s.onload=()=>resolve(window.Tesseract); document.body.appendChild(s);});
      const T = await ensure();
      const url=URL.createObjectURL(file);
      const lang=document.getElementById("lang").value;
      const result=await T.recognize(url,lang,{logger:m=>{if(typeof m.progress==="number")setResult(`${m.status || "OCR"}... ${Math.round(m.progress*100)}%`);}});
      setResult(result.data.text || "No text found.");
      URL.revokeObjectURL(url);
    };
    document.getElementById("copy").onclick=()=>copyText();
  },
  "word-counter":()=>{ui.innerHTML='<textarea id="input" placeholder="Paste text..."></textarea>';const inp=document.getElementById('input');inp.addEventListener('input',()=>{const t=inp.value.trim();const w=t?t.split(/\s+/).length:0;const ch=inp.value.length;const sen=(inp.value.match(/[.!?]+/g)||[]).length;const par=inp.value?inp.value.split(/\n+/).filter(Boolean).length:0;setResult('Words: '+w+'\nCharacters: '+ch+'\nSentences: '+sen+'\nParagraphs: '+par);});},
  "json-formatter":()=>{ui.innerHTML=mkBase();document.getElementById("run").onclick=()=>{try{setResult(JSON.stringify(JSON.parse(document.getElementById("input").value),null,2));}catch(e){setResult("Invalid JSON: "+e.message);}};document.getElementById("copy").onclick=()=>copyText();document.getElementById("clear").onclick=()=>{document.getElementById("input").value="";setResult("");};},
  default:()=>{ui.innerHTML=mkBase();document.getElementById("run").onclick=()=>setResult("Output:\n"+document.getElementById("input").value);document.getElementById("copy").onclick=()=>copyText();document.getElementById("clear").onclick=()=>{document.getElementById("input").value="";setResult("");};}
};
(builders[tool]||builders.default)();
