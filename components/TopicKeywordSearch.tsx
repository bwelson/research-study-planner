"use client";
import React, { useMemo, useState } from "react";

const cardStyle: React.CSSProperties = {
  border: "1px solid #d1d5db",
  borderRadius: 16,
  padding: 20,
  background: "#ffffff",
};

type PaperResult = {
  score: number;
  title: string;
  year?: number;
  url: string;
  abstract?: string;
};

interface TopicKeywordSearchProps {
  canSearch: boolean;
  onSearchLimitReached: () => void;
  isPremium: boolean;
}

export default function TopicKeywordSearch({ canSearch, onSearchLimitReached, isPremium }: TopicKeywordSearchProps) {
  const [topic, setTopic] = useState("");
  const [researchGoal, setResearchGoal] = useState("");
  const [kwInput, setKwInput] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<PaperResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<any>(null);
  const [limitInput, setLimitInput] = useState(isPremium ? "25" : "10");
  const [showResults, setShowResults] = useState(true);
  const [weekNotes, setWeekNotes] = useState<Record<number, string>>({});
  const [completedGoals, setCompletedGoals] = useState<Record<string, boolean>>({});

  const canAddMore = keywords.length < 5;

  const addKeyword = (raw: string) => {
    const k = raw.trim();
    if (!k) return;
    if (!canAddMore) return;
    if (keywords.some((x) => x.toLowerCase() === k.toLowerCase())) return;
    setKeywords((prev) => [...prev, k]);
  };

  const onKeywordKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addKeyword(kwInput);
      setKwInput("");
    } else if (e.key === "Backspace" && !kwInput && keywords.length) {
      setKeywords((prev) => prev.slice(0, -1));
    }
  };

  const runSearch = async () => {
    setError(null);
    setResults([]);
    setPlan(null);
    
    if (!topic.trim()) {
      setError("Please enter a topic.");
      return;
    }
    
    if (!canSearch) {
      onSearchLimitReached();
      return;
    }
    
    const limit = parseInt(limitInput) || (isPremium ? 25 : 10);
    
    if (!isPremium && limit > 10) {
      setError("Free accounts are limited to 10 papers per search. Upgrade to premium for more.");
      return;
    }
    
    if (limit < 1 || limit > 100) {
      setError("Limit must be between 1 and 100.");
      return;
    }
    
    setLoading(true);
    try {
      if (!isPremium) {
        await fetch('/api/increment-search', { method: 'POST' });
      }
      
      const res = await fetch("http://127.0.0.1:8000/papers/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.trim(),
          keywords,
          limit: limit * 2,
        }),
      });
      
      if (!res.ok) {
        throw new Error(await res.text());
      }
      
      const data = await res.json();
      let papers = data.results ?? [];
      
      // AI filtering works for everyone if they provide a research goal
      if (researchGoal.trim() && papers.length > 0) {
        papers = await filterPapersWithClaude(papers, limit);
      } else {
        papers = papers.slice(0, limit);
      }
      
      setResults(papers);
      setShowResults(true);
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const filterPapersWithClaude = async (papers: PaperResult[], targetCount: number): Promise<PaperResult[]> => {
    try {
      const papersText = papers.map((p, idx) => 
        `${idx + 1}. "${p.title}" (${p.year || 'n.d.'})`
      ).join('\n');
      
      const prompt = `I'm researching: "${researchGoal}"

My research topic is: "${topic}"
Keywords: ${keywords.join(', ') || 'None'}

Here are ${papers.length} papers I found. Please analyze which papers are most relevant to my specific research goal and rank them. Return ONLY a JSON array of paper indices (1-${papers.length}) in order of relevance, limited to the top ${targetCount} papers.

Papers:
${papersText}

Return format: [paper_index_1, paper_index_2, ...]
Return ONLY the JSON array, no other text.`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [
            { role: "user", content: prompt }
          ],
        }),
      });

      if (!response.ok) {
        console.error("Claude API failed, using original order");
        return papers.slice(0, targetCount);
      }

      const result = await response.json();
      const text = result.content[0].text.trim();
      const indices = JSON.parse(text.replace(/```json\n?|\n?```/g, ''));
      const rankedPapers = indices
        .map((idx: number) => papers[idx - 1])
        .filter((p: any) => p !== undefined);
      
      return rankedPapers.slice(0, targetCount);
    } catch (err) {
      console.error("Error filtering with Claude:", err);
      return papers.slice(0, targetCount);
    }
  };

  const generatePlan = async () => {
    if (!isPremium) {
      setError("Monthly plan generation is a premium feature. Upgrade to access this feature.");
      return;
    }
    
    setError(null);
    if (!results.length) {
      setError("Search for papers before generating a plan.");
      return;
    }
    setLoading(true);
    try {
      const papersWithContent = await Promise.all(
        results.map(async (paper) => {
          try {
            const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(paper.url)}`);
            const data = await response.json();
            const html = data.contents;
            
            let abstract = '';
            const abstractPatterns = [
                /<abstract[^>]*>(.*?)<\/abstract>/i,
                /<div[^>]*class="[^"]*abstract[^"]*"[^>]*>(.*?)<\/div>/i,
                /<p[^>]*class="[^"]*abstract[^"]*"[^>]*>(.*?)<\/p>/i,
            ];
            
            for (const pattern of abstractPatterns) {
              const match = html.match(pattern);
              if (match) {
                abstract = match[1].replace(/<[^>]+>/g, '').trim();
                break;
              }
            }
            
            return { ...paper, abstract };
          } catch (err) {
            return { ...paper, abstract: '' };
          }
        })
      );

      const res = await fetch("http://127.0.0.1:8000/plan/monthly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          results: papersWithContent,
          target_count: 12,
        }),
      });
      if (!res.ok) {
        throw new Error(await res.text());
      }
      const data = await res.json();
      setPlan(data.plan ?? null);
      setShowResults(false);
      setWeekNotes({});
      setCompletedGoals({});
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const generateAPACitation = (paper: PaperResult): string => {
    const year = paper.year || "n.d.";
    const title = paper.title;
    return `Author, A. (${year}). ${title}. Retrieved from ${paper.url}`;
  };

  const exportToLatex = () => {
    if (!isPremium) {
      setError("Export features are only available for premium users. Upgrade to access this feature.");
      return;
    }
    
    let latex = `\\documentclass{article}
\\usepackage[utf8]{inputenc}
\\usepackage{hyperref}

\\title{Research Bibliography: ${topic}}
\\author{}
\\date{${new Date().toLocaleDateString()}}

\\begin{document}

\\maketitle

\\section{Research Topic}
${topic}

\\section{Keywords}
${keywords.length > 0 ? keywords.join(', ') : 'None specified'}

\\section{References}
\\begin{thebibliography}{${results.length}}

`;

    results.forEach((paper, idx) => {
      latex += `\\bibitem{ref${idx + 1}} 
${generateAPACitation(paper)}

`;
    });

    latex += `\\end{thebibliography}

\\section{Summary}
Total papers found: ${results.length}

\\end{document}`;

    const blob = new Blob([latex], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bibliography_${topic.replace(/\s+/g, '_')}.tex`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToWord = () => {
    if (!isPremium) {
      setError("Export features are only available for premium users. Upgrade to access this feature.");
      return;
    }
    
    let wordContent = `Research Bibliography: ${topic}\n`;
    wordContent += `Generated: ${new Date().toLocaleDateString()}\n\n`;
    wordContent += `Research Topic:\n${topic}\n\n`;
    wordContent += `Keywords:\n${keywords.length > 0 ? keywords.join(', ') : 'None specified'}\n\n`;
    wordContent += `References (APA Style):\n\n`;

    results.forEach((paper, idx) => {
      wordContent += `${idx + 1}. ${generateAPACitation(paper)}\n\n`;
    });

    wordContent += `\nTotal papers: ${results.length}`;

    const blob = new Blob([wordContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bibliography_${topic.replace(/\s+/g, '_')}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "40px 20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -100,
          right: -100,
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #667eea33, #764ba233)",
          filter: "blur(60px)",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -150,
          left: -150,
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #764ba233, #f093fb33)",
          filter: "blur(80px)",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 300,
          height: 300,
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #4facfe22, #00f2fe22)",
          filter: "blur(100px)",
          zIndex: 0,
        }}
      />

      <div style={{ maxWidth: 900, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h1
            style={{
              fontSize: 36,
              fontWeight: 700,
              color: "#1e293b",
              margin: 0,
              marginBottom: 8,
            }}
          >
            Research Study Planner
          </h1>
          <p style={{ fontSize: 16, color: "#64748b", margin: 0 }}>
            Search academic papers and generate a structured monthly reading plan.
          </p>
          {!isPremium && (
            <div style={{ 
              marginTop: 12, 
              padding: "8px 16px", 
              background: "#fef3c7", 
              border: "1px solid #f59e0b",
              borderRadius: 8,
              fontSize: 14,
              color: "#92400e",
              display: "inline-block"
            }}>
              Free Plan: 1 search • 10 papers max • Basic features only
            </div>
          )}
        </div>

        <div style={cardStyle}>
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                display: "block",
                fontSize: 14,
                fontWeight: 500,
                color: "#374151",
                marginBottom: 4,
              }}
            >
              Research topic
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Bayesian hierarchical models"
              style={{
                width: "100%",
                marginTop: 8,
                padding: 12,
                borderRadius: 10,
                border: "1px solid #9ca3af",
                fontSize: 15,
                color: "#1f2937",
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                display: "block",
                fontSize: 14,
                fontWeight: 500,
                color: "#374151",
                marginBottom: 4,
              }}
            >
              Specific research goal (optional but recommended)
            </label>
            <textarea
              value={researchGoal}
              onChange={(e) => setResearchGoal(e.target.value)}
              placeholder="e.g. I'm developing a new MCMC algorithm for high-dimensional posterior sampling in Bayesian neural networks and need papers on efficient sampling methods and convergence diagnostics..."
              style={{
                width: "100%",
                marginTop: 8,
                padding: 12,
                borderRadius: 10,
                border: "1px solid #9ca3af",
                fontSize: 14,
                color: "#1f2937",
                minHeight: 80,
                fontFamily: "inherit",
                resize: "vertical",
              }}
            />
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
              💡 Describe what you're specifically trying to achieve. Our algorithm will use this to find the most relevant papers for your needs.
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                display: "block",
                fontSize: 14,
                fontWeight: 500,
                color: "#374151",
                marginBottom: 4,
              }}
            >
              Keywords (up to 5)
            </label>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                marginTop: 8,
                padding: 12,
                borderRadius: 10,
                border: "1px solid #9ca3af",
                minHeight: 48,
                background: "#ffffff",
              }}
            >
              {keywords.map((k) => (
                <span
                  key={k}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 12px",
                    borderRadius: 20,
                    background: "#667eea",
                    color: "#ffffff",
                    fontSize: 14,
                  }}
                >
                  {k}
                  <button
                    onClick={() => setKeywords((prev) => prev.filter((x) => x !== k))}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#ffffff",
                      cursor: "pointer",
                      fontSize: 16,
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={kwInput}
                onChange={(e) => setKwInput(e.target.value)}
                onKeyDown={onKeywordKeyDown}
                disabled={!canAddMore}
                placeholder="Type keyword + Enter"
                style={{
                  flex: 1,
                  minWidth: 220,
                  padding: 12,
                  borderRadius: 10,
                  border: "1px solid #9ca3af",
                  fontSize: 14,
                  color: "#1f2937",
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 500,
                color: "#374151",
                marginBottom: 4,
              }}
            >
              Number of papers {!isPremium && "(max 10 for free users)"}
            </label>
            <input
              type="number"
              value={limitInput}
              onChange={(e) => setLimitInput(e.target.value)}
              min="1"
              max={isPremium ? "100" : "10"}
              placeholder={isPremium ? "25" : "10"}
              style={{
                width: 120,
                padding: 12,
                borderRadius: 10,
                border: "1px solid #9ca3af",
                fontSize: 14,
                color: "#1f2937",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
            <button
              onClick={runSearch}
              disabled={loading}
              style={{
                flex: 1,
                padding: 14,
                borderRadius: 10,
                border: "none",
                background: loading ? "#9ca3af" : "#667eea",
                color: "#ffffff",
                fontWeight: 600,
                fontSize: 15,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? (researchGoal.trim() && isPremium ? "AI Filtering..." : "Searching...") : "Search papers"}
            </button>
            <button
              onClick={generatePlan}
              disabled={loading || !results.length}
              style={{
                flex: 1,
                padding: 14,
                borderRadius: 10,
                border: "none",
                background: loading || !results.length ? "#9ca3af" : "#10b981",
                color: "#ffffff",
                fontWeight: 600,
                fontSize: 15,
                cursor: loading || !results.length ? "not-allowed" : "pointer",
                position: "relative",
              }}
            >
              {loading ? "Generating..." : "Generate monthly plan"}
              {!isPremium && (
                <span style={{ 
                  position: "absolute", 
                  top: -8, 
                  right: -8, 
                  padding: "2px 6px", 
                  background: "#8b5cf6", 
                  borderRadius: 4, 
                  fontSize: 10,
                  fontWeight: 700
                }}>
                  PRO
                </span>
              )}
            </button>
          </div>

          {error && (
            <div
              style={{
                marginTop: 16,
                padding: 12,
                borderRadius: 10,
                background: "#fee2e2",
                color: "#991b1b",
                fontSize: 14,
              }}
            >
              {error}
            </div>
          )}
        </div>

        {results.length > 0 && (
          <div style={cardStyle}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: showResults ? 16 : 0,
              }}
            >
              <h2 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>
                Top papers ({results.length})
              </h2>
              <button
                onClick={() => setShowResults(!showResults)}
                style={{
                  background: "#f3f4f6",
                  border: "1px solid #d1d5db",
                  borderRadius: 8,
                  padding: "8px 16px",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                {showResults ? "Hide" : "Show"}
              </button>
            </div>

            {showResults && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {results.map((r, i) => (
                  <div
                    key={i}
                    style={{
                      padding: 14,
                      borderRadius: 10,
                      border: "1px solid #e5e7eb",
                      background: "#ffffff",
                    }}
                  >
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontWeight: 500,
                        color: "#2563eb",
                        textDecoration: "none",
                        fontSize: 15,
                      }}
                    >
                      {r.title}
                    </a>
                    <div style={{ marginTop: 6, fontSize: 13, color: "#6b7280" }}>
                      {r.year ?? "—"} · relevance score {r.score.toFixed(3)}
                    </div>
                  </div>
                ))}

                {isPremium && (
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: "2px solid #e5e7eb" }}>
                    <div style={{ marginBottom: 12, fontSize: 14, fontWeight: 600, color: "#374151" }}>
                      Export Bibliography & Topics:
                    </div>
                    <div style={{ display: "flex", gap: 12 }}>
                      <button
                        onClick={exportToLatex}
                        style={{
                          flex: 1,
                          padding: 12,
                          borderRadius: 10,
                          border: "1px solid #d1d5db",
                          background: "#ffffff",
                          color: "#374151",
                          fontWeight: 500,
                          fontSize: 14,
                          cursor: "pointer",
                        }}
                      >
                        📄 Export to LaTeX
                      </button>
                      <button
                        onClick={exportToWord}
                        style={{
                          flex: 1,
                          padding: 12,
                          borderRadius: 10,
                          border: "1px solid #d1d5db",
                          background: "#ffffff",
                          color: "#374151",
                          fontWeight: 500,
                          fontSize: 14,
                          cursor: "pointer",
                        }}
                      >
                        📝 Export to Word
                      </button>
                    </div>
                    <div style={{ marginTop: 8, fontSize: 12, color: "#6b7280" }}>
                      Exports all {results.length} papers with APA citations, topic, and keywords
                    </div>
                  </div>
                )}
                
                {!isPremium && (
                  <div style={{ 
                    marginTop: 16, 
                    padding: 16, 
                    borderRadius: 10, 
                    background: "#fef3c7",
                    border: "1px solid #f59e0b",
                    textAlign: "center"
                  }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "#92400e", marginBottom: 8 }}>
                      🔒 Unlock Premium Features
                    </div>
                    <div style={{ fontSize: 13, color: "#78350f", marginBottom: 12 }}>
                      Export to LaTeX/Word, monthly plans, AI filtering, and more!
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {plan && isPremium && (
          <div style={cardStyle}>
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>
              📅 Monthly study plan
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {plan.map((w: any) => {
                const weekId = w.week;
                const goals = ["Complete all paper readings", "Take detailed notes", "Write summary", "Identify key questions"].map((label, idx) => ({
                  id: `${weekId}-goal-${idx}`,
                  label,
                }));

                return (
                  <div
                    key={weekId}
                    style={{
                      padding: 18,
                      borderRadius: 12,
                      border: "2px solid #e5e7eb",
                      background: "#fafafa",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 12,
                      }}
                    >
                      <h3 style={{ fontSize: 17, fontWeight: 600, margin: 0 }}>
                        Week {w.week}
                      </h3>
                      <div style={{ fontSize: 13, color: "#6b7280" }}>
                        {w.start} → {w.end}
                      </div>
                    </div>

                    <div style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>
                        Papers to read:
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {w.papers.map((p: any, idx: number) => (
                          <div key={idx} style={{ fontSize: 14, color: "#1f2937", paddingLeft: 12 }}>
                            • {p.title}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>
                        Goals to accomplish:
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {goals.map((goal) => (
                          <label
                            key={goal.id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              cursor: "pointer",
                              fontSize: 14,
                              color: completedGoals[goal.id] ? "#6b7280" : "#1f2937",
                              textDecoration: completedGoals[goal.id] ? "line-through" : "none",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={completedGoals[goal.id] || false}
                              onChange={(e) =>
                                setCompletedGoals((prev) => ({
                                  ...prev,
                                  [goal.id]: e.target.checked,
                                }))
                              }
                              style={{ width: 18, height: 18, marginRight: 10, cursor: "pointer" }}
                            />
                            {goal.label}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>
                        📝 Notes:
                      </div>
                      <textarea
                        value={weekNotes[weekId] || ""}
                        onChange={(e) =>
                          setWeekNotes((prev) => ({
                            ...prev,
                            [weekId]: e.target.value,
                          }))
                        }
                        placeholder="Add your notes, insights, or questions here..."
                        style={{
                          width: "100%",
                          minHeight: 80,
                          padding: 12,
                          borderRadius: 8,
                          border: "1px solid #d1d5db",
                          fontSize: 14,
                          fontFamily: "inherit",
                          resize: "vertical",
                          color: "#1f2937",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}