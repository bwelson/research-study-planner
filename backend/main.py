from fastapi import FastAPI, Query
import requests

app = FastAPI(title="Research Intelligence Backend")

SEMANTIC_SCHOLAR_URL = "https://api.semanticscholar.org/graph/v1/paper/search"


@app.get("/")
def health_check():
    return {
        "status": "ok",
        "message": "Research backend running"
    }


@app.get("/papers/search")
def search_papers(
    topic: str = Query(..., min_length=3),
    limit: int = 20
):
    params = {
        "query": topic,
        "limit": limit,
        "fields": "title,authors,year,venue,citationCount,url"
    }

    headers = {
        "User-Agent": "Research-Intel/0.1 (personal research tool)"
    }

    response = requests.get(
        SEMANTIC_SCHOLAR_URL,
        params=params,
        headers=headers,
        timeout=30
    )

    # IMPORTANT: never crash on external API errors
    if response.status_code != 200:
        return {
            "error": "Semantic Scholar API error",
            "status_code": response.status_code,
            "detail": response.text
        }

    data = response.json().get("data", [])

    papers = []
    for p in data:
        papers.append({
            "title": p.get("title"),
            "authors": [a.get("name") for a in p.get("authors", [])],
            "year": p.get("year"),
            "venue": p.get("venue"),
            "citations": p.get("citationCount"),
            "url": p.get("url")
        })

    return {
        "topic": topic,
        "count": len(papers),
        "papers": papers
    }
