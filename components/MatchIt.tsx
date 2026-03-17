"use client";

import { useState } from "react";
import { Problem, MatchItContent } from "@/lib/types";

interface MatchItProps {
    problem: Problem;
    onComplete: (correctCount: number, totalCount: number) => void;
    submitted: boolean;
}

export function MatchIt({ problem, onComplete, submitted }: MatchItProps) {
    const content = problem.content as MatchItContent;
    
    // Using mapping algorithm index -> complexity index
    const [matches, setMatches] = useState<Record<number, number>>({});
    const [selectedAlgo, setSelectedAlgo] = useState<number | null>(null);
    const [evaluating, setEvaluating] = useState(false);

    const handleAlgoClick = (index: number) => {
        if (submitted || evaluating) return;
        setSelectedAlgo(selectedAlgo === index ? null : index);
    };

    const handleCompClick = (compIndex: number) => {
        if (submitted || evaluating) return;
        if (selectedAlgo !== null) {
            setMatches(prev => {
                const next = { ...prev };
                next[selectedAlgo] = compIndex;
                return next;
            });
            setSelectedAlgo(null);
        }
    };

    const handleCheckMatches = () => {
        if (submitted || evaluating) return;
        setEvaluating(true);
        let correctCount = 0;
        const totalCount = content.algorithms.length;

        content.algorithms.forEach((algo, index) => {
            const matchedCompIndex = matches[index];
            const correctCompIndex = content.correct[algo];
            if (matchedCompIndex === correctCompIndex) {
                correctCount++;
            }
        });
        
        onComplete(correctCount, totalCount);
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={{ color: "var(--text)", fontSize: "1.1rem", lineHeight: "1.5" }}>
                {content.instruction}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", gap: "2rem", position: "relative" }}>
                {/* Algorithms Column */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", flex: 1 }}>
                    {content.algorithms.map((algo, index) => {
                        const isSelected = selectedAlgo === index;
                        const matchIndex = matches[index];
                        const hasMatch = matchIndex !== undefined;
                        
                        let bg = "var(--bg-input)";
                        let border = isSelected ? "var(--accent)" : "var(--border)";
                        let color = "var(--text)";

                        if (submitted || evaluating) {
                            if (hasMatch) {
                                const isCorrect = matchIndex === content.correct[algo];
                                if (isCorrect) {
                                    bg = "var(--green-bg)"; border = "var(--green)"; color = "var(--green)";
                                } else {
                                    bg = "var(--red-bg)"; border = "var(--red)"; color = "var(--red)";
                                }
                            } else {
                                bg = "var(--red-bg)"; border = "var(--red)"; color = "var(--red)";
                            }
                        }

                        return (
                            <button
                                key={`algo-${index}`}
                                onClick={() => handleAlgoClick(index)}
                                disabled={submitted || evaluating}
                                style={{
                                    padding: "1rem",
                                    backgroundColor: bg,
                                    border: `1px solid ${border}`,
                                    borderRadius: "8px",
                                    color: color,
                                    textAlign: "left",
                                    cursor: (submitted || evaluating) ? "default" : "pointer",
                                    minHeight: "3.5rem",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    outline: "none",
                                    transition: "all 0.2s"
                                }}
                            >
                                <span>{algo}</span>
                                {hasMatch && (
                                    <span style={{ fontSize: "0.85rem", opacity: 0.8, color: (submitted || evaluating) ? "inherit" : "var(--accent)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                        <span>→</span> {content.complexities[matchIndex]}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Complexities Column */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", flex: 1 }}>
                    {content.complexities.map((comp, index) => {
                        let border = selectedAlgo !== null ? "var(--accent)" : "var(--border)";
                        
                        return (
                            <button
                                key={`comp-${index}`}
                                onClick={() => handleCompClick(index)}
                                disabled={submitted || evaluating || selectedAlgo === null}
                                style={{
                                    padding: "1rem",
                                    backgroundColor: "var(--bg-input)",
                                    border: `1px solid ${selectedAlgo !== null ? "rgba(94, 232, 183, 0.4)" : "var(--border)"}`,
                                    borderRadius: "8px",
                                    color: "var(--text)",
                                    textAlign: "center",
                                    cursor: (submitted || evaluating || selectedAlgo === null) ? "default" : "pointer",
                                    minHeight: "3.5rem",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    outline: "none",
                                    transition: "all 0.2s"
                                }}
                                onMouseEnter={(e) => { if (!submitted && !evaluating && selectedAlgo !== null) e.currentTarget.style.borderColor = "var(--accent)"; }}
                                onMouseLeave={(e) => { if (!submitted && !evaluating && selectedAlgo !== null) e.currentTarget.style.borderColor = "rgba(94, 232, 183, 0.4)"; }}
                            >
                                {comp}
                            </button>
                        );
                    })}
                </div>
            </div>

            {(!submitted && !evaluating) && (
                <button
                    onClick={handleCheckMatches}
                    disabled={Object.keys(matches).length !== content.algorithms.length}
                    style={{ 
                        padding: "12px 24px", 
                        backgroundColor: Object.keys(matches).length === content.algorithms.length ? "var(--accent)" : "var(--bg-input)", 
                        color: Object.keys(matches).length === content.algorithms.length ? "var(--bg-primary)" : "var(--text-muted)", 
                        border: `1px solid ${Object.keys(matches).length === content.algorithms.length ? "var(--accent)" : "var(--border)"}`, 
                        borderRadius: "8px", 
                        fontSize: "1rem", 
                        fontWeight: "600", 
                        cursor: Object.keys(matches).length === content.algorithms.length ? "pointer" : "not-allowed", 
                        alignSelf: "flex-start", 
                        outline: "none", 
                        transition: "all 0.2s" 
                    }}
                >
                    Check matches
                </button>
            )}
        </div>
    );
}
