"use client";

import { useState, useRef, useEffect } from "react";
import { Problem, TraceIterContent } from "@/lib/types";

interface TraceIterProps {
    problem: Problem;
    onComplete: (correctCount: number, totalCount: number) => void;
    submitted: boolean;
}

export function TraceIter({ problem, onComplete, submitted }: TraceIterProps) {
    const content = problem.content as TraceIterContent;
    const storageKey = `trace_iter_${problem.byte}_${problem.title.replace(/\s+/g, '')}`;

    const [answers, setAnswers] = useState<string[]>(() => {
        if (typeof window !== "undefined") {
            if (!submitted) {
                // Fresh attempt or redo - clear previous save
                sessionStorage.removeItem(storageKey + "_ans");
                sessionStorage.removeItem(storageKey + "_corr");
            } else {
                const saved = sessionStorage.getItem(storageKey + "_ans");
                if (saved) return JSON.parse(saved);
            }
        }
        return Array(content.iterations.length).fill("");
    });
    
    const [correctness, setCorrectness] = useState<(boolean | null)[]>(() => {
        if (typeof window !== "undefined") {
            if (!submitted) {
                // Already removed above, just return empty
            } else {
                const saved = sessionStorage.getItem(storageKey + "_corr");
                if (saved) return JSON.parse(saved);
            }
        }
        return Array(content.iterations.length).fill(null);
    });
    
    const [currentIndex, setCurrentIndex] = useState(0);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        sessionStorage.setItem(storageKey + "_ans", JSON.stringify(answers));
    }, [answers, storageKey]);

    useEffect(() => {
        sessionStorage.setItem(storageKey + "_corr", JSON.stringify(correctness));
    }, [correctness, storageKey]);

    useEffect(() => {
        if (!submitted && currentIndex < content.iterations.length) {
            inputRefs.current[currentIndex]?.focus();
        }
    }, [currentIndex, submitted]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Enter" && !submitted) {
            const isCorrect = answers[index].trim() === content.iterations[index].answer;
            
            setCorrectness(prev => {
                const next = [...prev];
                next[index] = isCorrect;
                return next;
            });

            if (index < content.iterations.length - 1) {
                setCurrentIndex(Math.max(currentIndex, index + 1));
            } else {
                let correctCount = (isCorrect ? 1 : 0);
                for (let i = 0; i < index; i++) {
                    if (correctness[i]) correctCount++;
                }
                onComplete(correctCount, content.iterations.length);
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        if (submitted) return;
        setAnswers(prev => {
            const next = [...prev];
            next[index] = e.target.value;
            return next;
        });
        if (correctness[index] !== null) {
            setCorrectness(prev => {
                const next = [...prev];
                next[index] = null;
                return next;
            });
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={{ color: "var(--text)", fontSize: "1.1rem", lineHeight: "1.5" }}>
                {content.question}
            </div>
            <pre style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border)", padding: "1rem", borderRadius: "8px", overflowX: "auto", fontSize: "0.95rem", margin: 0 }}>
                <code style={{ fontFamily: "inherit" }}>{content.code}</code>
            </pre>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
                {content.iterations.map((iter, index) => {
                    let bg = "var(--bg-input)";
                    let border = "var(--border)";
                    let color = "var(--text)";

                    // Highlight based on correctness
                    if (correctness[index] !== null) {
                        if (correctness[index]) {
                            bg = "var(--green-bg)";
                            border = "var(--green)";
                            color = "var(--green)";
                        } else {
                            bg = "var(--red-bg)";
                            border = "var(--red)";
                            color = "var(--red)";
                        }
                    }

                    const isCurrent = index === currentIndex && !submitted && correctness[index] === null;

                    return (
                        <div key={index} style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center" }}>
                            <span style={{ fontSize: "0.85rem", color: "var(--text-dim)", fontWeight: "600" }}>{iter.label}</span>
                            <input
                                ref={(el) => { inputRefs.current[index] = el; }}
                                type="text"
                                value={answers[index]}
                                onChange={(e) => handleChange(e, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                disabled={submitted || index > currentIndex || correctness[index] === true}
                                placeholder={isCurrent ? "..." : ""}
                                style={{
                                    width: "60px",
                                    height: "40px",
                                    textAlign: "center",
                                    backgroundColor: bg,
                                    border: `1px solid ${isCurrent ? "var(--accent)" : border}`,
                                    borderRadius: "8px",
                                    color: color,
                                    fontSize: "1rem",
                                    outline: "none",
                                    fontFamily: "inherit",
                                    transition: "all 0.2s"
                                }}
                            />
                        </div>
                    );
                })}
            </div>
            {!submitted && currentIndex < content.iterations.length && (
                <div style={{ fontSize: "0.85rem", color: "var(--text-dim)" }}>
                    Press <kbd style={{ background: "var(--border)", padding: "2px 6px", borderRadius: "4px", color: "var(--text)" }}>Enter</kbd> to submit your answer. Correct inputs are locked.
                </div>
            )}
        </div>
    );
}

