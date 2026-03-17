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
    const [selectedLineIndex, setSelectedLineIndex] = useState<number | null>(null);
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
        setSelectedLineIndex(null);
    }, [content.lines]);

    const handleLineClick = (index: number) => {
        if (submitted || evaluating) return;

        if (selectedLineIndex === null) {
            setSelectedLineIndex(index);
        } else if (selectedLineIndex === index) {
            setSelectedLineIndex(null); // Deselect if clicking the same line
        } else {
            // Swap the two lines
            setLineOrder(prev => {
                const next = [...prev];
                [next[selectedLineIndex], next[index]] = [next[index], next[selectedLineIndex]];
                return next;
            });
            setSelectedLineIndex(null); // Clear selection after swap
        }
    };

    const handleCheckOrder = () => {
        if (submitted || evaluating) return;
        setEvaluating(true);
        setSelectedLineIndex(null);
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
                    const isSelected = selectedLineIndex === currentIndex;

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
                    } else if (isSelected) {
                        bg = "rgba(96, 165, 250, 0.15)";
                        border = "var(--blue)";
                    }

                    return (
                        <div 
                            key={originalIndex} 
                            onClick={() => handleLineClick(currentIndex)}
                            style={{ 
                                display: "flex", 
                                alignItems: "center", 
                                gap: "1rem", 
                                backgroundColor: bg, 
                                border: `1px solid ${border}`, 
                                borderRadius: "8px", 
                                padding: "0.75rem", 
                                color: color, 
                                transition: "all 0.2s ease",
                                cursor: (submitted || evaluating) ? "default" : "pointer",
                                userSelect: "none"
                            }}
                        >
                            <div style={{ color: "var(--text-dim)", fontSize: "0.85rem", minWidth: "1.5rem", textAlign: "center", flexShrink: 0 }}>
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
