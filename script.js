async function loadMarketData(){
const fmt=(v,d=2)=>Number.isFinite(v)?v.toLocaleString("en-IN",{minimumFractionDigits:d,maximumFractionDigits:d}):"—";
const pct=v=>Number.isFinite(v)?`${v>=0?"+":""}${v.toFixed(2)}%`:"—";
const setPair=(id,d,digits=2)=>{const p=document.getElementById(id+"-price"),c=document.getElementById(id+"-change");if(p)p.textContent=d?fmt(d.price,digits):"—";if(c){c.textContent=pct(d?.changePct);c.classList.toggle("up",(d?.changePct??0)>=0);c.classList.toggle("down",(d?.changePct??0)<0)}};
try{const r=await fetch("market-data.json?ts="+Date.now(),{cache:"no-store"});if(!r.ok)throw Error("data unavailable");const data=await r.json(),m=data.instruments||{};
["nifty","sensex","sp500","nasdaq","dow","ftse","nikkei"].forEach(id=>setPair(id,m[id],2));
["usdinr","eurinr","gbpinr","jpyinr"].forEach(id=>setPair(id,m[id],4));
["nifty","sensex","sp500","nasdaq","usdinr"].forEach(id=>{const d=m[id],t=document.getElementById("t-"+id),tc=document.getElementById("tc-"+id);if(t)t.textContent=d?fmt(d.price,id==="usdinr"?4:2):"—";if(tc)tc.textContent=d?pct(d.changePct):"—"});
const dt=data.updatedAt?new Date(data.updatedAt):null;document.getElementById("data-status").textContent=dt?"UPDATED "+dt.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"}):"WAITING FOR FIRST UPDATE";document.getElementById("dashboard-date").textContent=dt?dt.toLocaleDateString("en-IN",{weekday:"long",day:"2-digit",month:"long",year:"numeric"}).toUpperCase()+" · MARKET DATA":"MARKET DATA DASHBOARD";document.getElementById("footer-source").textContent="Market data: Yahoo Finance · delayed where applicable";
}catch(e){document.getElementById("data-status").textContent="DATA FEED UNAVAILABLE";document.getElementById("footer-source").textContent="Market data feed unavailable"}}
loadMarketData();