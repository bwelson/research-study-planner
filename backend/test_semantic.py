import requests
import numpy as np
from analysis import embed_papers

API_KEY = "9hIgGY5M223rHWUXBXuJzvCI33cwFEr9igOAaS32"

TOPIC = "bayesian hierarchical models"
KEYWORDS = ["Gibbs sampler", "small area estimation", "Stan"]  # up to 5

SEARCH_QUERY = TOPIC + " " + " ".join(KEYWORDS)
LIMIT = 10

url = "https://api.semanticscholar.org/graph/v1/paper/search"
params = {
    "query": SEARCH_QUERY,
    "limit": LIMIT,
    "fields": "title,year,url"
}
headers = {"x-api-key": API_KEY}

r = requests.get(url, params=params, headers=headers, timeout=30)
print("Status:", r.status_code)
r.raise_for_status()

data = r.json()
papers = data.get("data", [])
print("Papers fetched:", len(papers))

query_emb = embed_papers([{"title": SEARCH_QUERY}])[0]
paper_embs = embed_papers(papers)

def normalize(v):
    v = np.array(v, dtype=np.float32)
    return v / (np.linalg.norm(v) + 1e-12)

query_emb_n = normalize(query_emb)
paper_embs_n = np.array([normalize(e) for e in paper_embs])

scores = paper_embs_n @ query_emb_n

ranked = sorted(zip(scores, papers), key=lambda x: x[0], reverse=True)

print("\nTop results by similarity:\n")
for i, (score, p) in enumerate(ranked[:5], start=1):
    print(f"{i}. {score:.3f} | {p.get('year')} | {p.get('title')}")
    print(f"   {p.get('url')}\n")
