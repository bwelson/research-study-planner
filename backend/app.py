from typing import List
import time
import requests
import numpy as np
from fastapi import FastAPI
from pydantic import BaseModel

from fastapi.middleware.cors import CORSMiddleware
from analysis import embed_papers  # your existing function
from datetime import date, timedelta
from fastapi import Body

API_KEY = "9hIgGY5M223rHWUXBXuJzvCI33cwFEr9igOAaS32"  # keep it simple for now

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Semantic Scholar: 1 request per second
_last_call_ts = 0.0
def throttle_one_rps():
    global _last_call_ts
    now = time.time()
    wait = 1.0 - (now - _last_call_ts)
    if wait > 0:
        time.sleep(wait)
    _last_call_ts = time.time()

class SearchRequest(BaseModel):
    topic: str
    keywords: List[str] = []
    limit: int = 25

def normalize(v):
    v = np.array(v, dtype=np.float32)
    return v / (np.linalg.norm(v) + 1e-12)

@app.post("/papers/search")
def search_papers(req: SearchRequest):
    topic = (req.topic or "").strip()
    keywords = [k.strip() for k in (req.keywords or []) if k.strip()][:5]
    limit = max(1, min(req.limit, 50))

    # 1) Build combined search query for Semantic Scholar
    search_query = " ".join([topic] + keywords).strip()

    throttle_one_rps()

    url = "https://api.semanticscholar.org/graph/v1/paper/search"
    params = {
        "query": search_query,
        "limit": limit,
        "fields": "title,year,url"
    }
    headers = {"x-api-key": API_KEY}

    r = requests.get(url, params=params, headers=headers, timeout=30)
    r.raise_for_status()

    papers = r.json().get("data", [])

    if not papers:
        return {"query": search_query, "results": []}

    # 2) Embed “intent” and rank (topic weighted by repeating once)
    intent_text = " ".join([topic, topic] + keywords).strip()
    intent_emb = embed_papers([{"title": intent_text}])[0]
    paper_embs = embed_papers(papers)

    intent_n = normalize(intent_emb)
    paper_n = np.array([normalize(e) for e in paper_embs])

    scores = paper_n @ intent_n
    ranked = sorted(zip(scores, papers), key=lambda x: x[0], reverse=True)

    results = []
    for score, p in ranked:
        results.append({
            "score": float(score),
            "title": p.get("title"),
            "year": p.get("year"),
            "url": p.get("url"),
        })

    return {"query": search_query, "results": results}
class PlanRequest(BaseModel):
    # send the already-ranked results from the frontend
    results: List[dict]
    target_count: int = 12  # you said 12–15

@app.post("/plan/monthly")
def monthly_plan(req: PlanRequest):
    results = req.results or []
    target = max(1, min(req.target_count, 15))

    # Take top N papers
    selected = results[:target]

    # Simple rule-based weekly split: 4 weeks
    weeks = [[], [], [], []]
    for i, item in enumerate(selected):
        weeks[i % 4].append(item)

    # Add simple task structure
    start = date.today()
    plan = []
    for w in range(4):
        week_start = start + timedelta(days=w * 7)
        week_end = week_start + timedelta(days=6)
        plan.append({
            "week": w + 1,
            "start": str(week_start),
            "end": str(week_end),
            "papers": weeks[w],
            "tasks": [
                "Skim & decide priority",
                "Deep read top 2",
                "Write 5-bullet summary per paper",
                "Review notes + questions"
            ]
        })

    return {"count": len(selected), "plan": plan}
