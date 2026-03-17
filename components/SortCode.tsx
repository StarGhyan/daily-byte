"use client";

import { useState, useEffect } from "react";
import { Problem, SortCodeContent } from "@/lib/types";

interface SortCodeProps {
    problem: Problem;
    onComplete: (correctCount: number, totalCount: number) => void;
    submitted: boolean;
}

export function SortCode({ problem, onComplete, submitted }: SortCodeProps) {
    const content = problem.content as SortCodeContent;
    const [lineOrder, setLineOrder] = useState<number[]>([]);
    const [evaluating, setEvaluating] = useState(false);
    
    useEffect(() => {
        // Initialize line order sequentially
        const initialOrder = content.lines.map((_, i) => i);
        // Shuffle lines using Fisher-Yates
        for (let i = initialOrder.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [initialOrder[i], initialOrder[j]] = [initialOrder[j], initialOrder[i]];
        }
        setLineOrder(initialOrder);
    }, [content.lines]);

    const moveUp = (index: number) => {
        if (submitted || evaluating || index === 0) return;
        setLineOrder(prev => {
            const next = [...prev];
            [next[index - 1], next[index]] = [next[index], next[index - 1]];
            return next;
        });
    };

    const moveDown = (index: number) => {
        if (submitted || evaluating || index === lineOrder.length - 1) return;
        setLineOrder(prev => {
            const next = [...prev];
            [next[index + 1], next[index]] = [next[index], next[index + 1]];
            return next;
        });
    };

    const handleCheckOrder = () => {
        if (submitted || evaluating) return;
        setEvaluating(true);
        let correctCount = 0;
        for (let i = 0; i < lineOrder.length; i++) {
            if (lineOrder[i] === content.correct_order[i]) {
                correctCount++;
            }
        }
        onComplete(correctCount, lineOrder.length);
    };

    if (lineOrder.length === 0) return null;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={{ color: "var(--text)", fontSize: "1.1rem", lineHeight: "1.5" }}>
                {content.instruction}
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {lineOrder.map((originalIndex, currentIndex) => {
                    const text = content.lines[originalIndex];
                    const isCorrect = (submitted || evaluating) && originalIndex === content.correct_order[currentIndex];
                    const isWrong = (submitted || evaluating) && originalIndex !== content.correct_order[currentIndex];

                    let bg = "var(--bg-input)";
                    let border = "var(--border)";
                    let color = "var(--text)";

                    if (isCorrect) {
                        bg = "var(--green-bg)";
                        border = "var(--green)";
                        color = "var(--green)";
                    } else if (isWrong) {
                        bg = "var(--red-bg)";
                        border = "var(--red)";
                        color = "var(--red)";
                    }

                    return (
                        <div key={originalIndex} style={{ display: "flex", alignItems: "center", gap: "1rem", backgroundColor: bg, border: `1px solid ${border}`, borderRadius: "8px", padding: "0.75rem", color: color, transition: "all 0.2s ease" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                                <button
                                    onClick={() => moveUp(currentIndex)}
                                    disabled={submitted || evaluating || currentIndex === 0}
                                    style={{ background: "none", border: "none", color: (submitted || evaluating || currentIndex === 0) ? "var(--border)" : "var(--text-muted)", cursor: (submitted || evaluating || currentIndex === 0) ? "default" : "pointer", padding: "4px", display: "flex", justifyContent: "center", alignItems: "center" }}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
                                </button>
                                <button
                                    onClick={() => moveDown(currentIndex)}
                                    disabled={submitted || evaluating || currentIndex === lineOrder.length - 1}
                                    style={{ background: "none", border: "none", color: (submitted || evaluating || currentIndex === lineOrder.length - 1) ? "var(--border)" : "var(--text-muted)", cursor: (submitted || evaluating || currentIndex === lineOrder.length - 1) ? "default" : "pointer", padding: "4px", display: "flex", justifyContent: "center", alignItems: "center" }}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                </button>
                            </div>
                            <div style={{ color: "var(--text-dim)", fontSize: "0.85rem", minWidth: "1.5rem", textAlign: "center", userSelect: "none" }}>
                                {currentIndex + 1}
                            </div>
                            <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word", fontFamily: "inherit", fontSize: "0.95rem" }}>
                                {text}
                            </pre>
                        </div>
                    );
                })}
            </div>

            {(!submitted && !evaluating) && (
                <button
                    onClick={handleCheckOrder}
                    style={{ padding: "12px 24px", backgroundColor: "var(--accent)", color: "var(--bg-primary)", border: "none", borderRadius: "8px", fontSize: "1rem", fontWeight: "600", cursor: "pointer", alignSelf: "flex-start", outline: "none", transition: "opacity 0.2s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.9"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
                >
                    Check order
                </button>
            )}
        </div>
    );
}
