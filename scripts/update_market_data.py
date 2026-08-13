import json
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import quote
from urllib.request import Request, urlopen

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"market-data.json"
SYMBOLS={"nifty":"^NSEI","sensex":"^BSESN","sp500":"^GSPC","nasdaq":"^IXIC","dow":"^DJI","ftse":"^FTSE","nikkei":"^N225","usdinr":"USDINR=X","eurinr":"EURINR=X","gbpinr":"GBPINR=X","jpyinr":"JPYINR=X"}

def fetch(symbol):
    url="https://query1.finance.yahoo.com/v8/finance/chart/"+quote(symbol,safe="")+"?range=1d&interval=5m&includePrePost=false"
    req=Request(url,headers={"User-Agent":"Mozilla/5.0"})
    with urlopen(req,timeout=20) as r: payload=json.load(r)
    meta=payload["chart"]["result"][0]["meta"]
    price=meta.get("regularMarketPrice"); prev=meta.get("previousClose") or meta.get("chartPreviousClose")
    change=((price-prev)/prev*100) if price is not None and prev else None
    return {"symbol":symbol,"price":price,"previousClose":prev,"changePct":change,"currency":meta.get("currency"),"exchange":meta.get("exchangeName"),"marketState":meta.get("marketState"),"asOf":meta.get("regularMarketTime")}

data={"updatedAt":datetime.now(timezone.utc).isoformat(),"source":"Yahoo Finance chart feed","instruments":{}}
for key,symbol in SYMBOLS.items():
    try:data["instruments"][key]=fetch(symbol)
    except Exception as exc:data["instruments"][key]={"symbol":symbol,"error":str(exc)}
OUT.write_text(json.dumps(data,indent=2),encoding="utf-8")
print("Updated",OUT)