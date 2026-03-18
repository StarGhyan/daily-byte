"use client";

import { useState, useRef, useEffect } from "react";
import { Problem, TraceIterContent } from "@/lib/types";
import { useXp } from "@/lib/xp-context";

interface TraceIterProps {
    problem: Problem;
    onComplete: (correctCount: number, totalCount: number) => void;
    submitted: boolean;
}

interface TraceIterProgress {
    answers: string[];
    correctness: (boolean | null)[];
    currentIndex: number;
}

export function TraceIter({ problem, onComplete, submitted }: TraceIterProps) {
    const content = problem.content as TraceIterContent;
    const { saveProgress, getProgress } = useXp();
    const progressKey = `trace-${problem.byte}-${problem.title.replace(/\s+/g, "")}`;

    const saved = getProgress(progressKey) as TraceIterProgress | undefined;

    const [answers, setAnswers] = useState<string[]>(
        saved?.answers ?? Array(content.iterations.length).fill("")
    );
    const [correctness, setCorrectness] = useState<(boolean | null)[]>(
        saved?.correctness ?? Array(content.iterations.length).fill(null)
    );
    const [currentIndex, setCurrentIndex] = useState<number>(
        saved?.currentIndex ?? 0
    );

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Persist to in-memory context on every change (only while active, not after submit)
    useEffect(() => {
        if (!submitted) {
            saveProgress(progressKey, { answers, correctness, currentIndex });
        }
    }, [answers, correctness, currentIndex, submitted]);

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
                // Clear saved progress on completion
                saveProgress(progressKey, undefined);
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
                            {isCurrent ? (
                                <input
                                    ref={(el) => { inputRefs.current[index] = el; }}
                                    type="text"
                                    value={answers[index]}
                                    onChange={(e) => handleChange(e, index)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    placeholder="..."
                                    style={{
                                        width: "60px",
                                        height: "40px",
                                        textAlign: "center",
                                        backgroundColor: bg,
                                        border: "1px solid var(--accent)",
                                        borderRadius: "8px",
                                        color: color,
                                        fontSize: "1rem",
                                        outline: "none",
                                        fontFamily: "inherit",
                                        transition: "all 0.2s"
                                    }}
                                />
                            ) : (
                                <div style={{
                                    width: "60px",
                                    height: "40px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    backgroundColor: bg,
                                    border: `1px solid ${border}`,
                                    borderRadius: "8px",
                                    color: color,
                                    fontSize: "1rem",
                                    fontFamily: "inherit"
                                }}>
                                    {(submitted || index < currentIndex || correctness[index] !== null) ? answers[index] : "?"}
                                </div>
                            )}
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
