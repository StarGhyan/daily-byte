"use client";

import { useState, useEffect, useRef } from "react";
import { Problem, SortCodeContent } from "@/lib/types";
import { useXp } from "@/lib/xp-context";

interface SortCodeProps {
    problem: Problem;
    onComplete: (correctCount: number, totalCount: number) => void;
    submitted: boolean;
}

export function SortCode({ problem, onComplete, submitted }: SortCodeProps) {
    const content = problem.content as SortCodeContent;
    const { saveProgress, getProgress } = useXp();
    const progressKey = `sort-${problem.byte}-${problem.title.replace(/\s+/g, "")}`;

    const [lineOrder, setLineOrder] = useState<number[]>(() => {
        const saved = getProgress(progressKey) as number[] | undefined;
        if (saved && saved.length === content.lines.length) return saved;
        // Shuffle using Fisher-Yates
        const initialOrder = content.lines.map((_, i) => i);
        for (let i = initialOrder.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [initialOrder[i], initialOrder[j]] = [initialOrder[j], initialOrder[i]];
        }
        return initialOrder;
    });
    const [selectedLineIndex, setSelectedLineIndex] = useState<number | null>(null);
    const [evaluating, setEvaluating] = useState(false);

    // Keep a stable ref so the initializer closure doesn't go stale
    const initializedRef = useRef(false);
    useEffect(() => {
        // Only run if no saved progress existed (first mount without saved state)
        if (initializedRef.current) return;
        initializedRef.current = true;
    }, []);

    // Save line order to context whenever it changes
    useEffect(() => {
        if (!submitted && !evaluating) {
            saveProgress(progressKey, lineOrder);
        }
    }, [lineOrder, submitted, evaluating]);

    const handleLineClick = (index: number) => {
        if (submitted || evaluating) return;

        if (selectedLineIndex === null) {
            setSelectedLineIndex(index);
        } else if (selectedLineIndex === index) {
            setSelectedLineIndex(null);
        } else {
            setLineOrder(prev => {
                const next = [...prev];
                [next[selectedLineIndex], next[index]] = [next[index], next[selectedLineIndex]];
                return next;
            });
            setSelectedLineIndex(null);
        }
    };

    const handleMoveUp = (index: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (submitted || evaluating || index === 0) return;
        setLineOrder(prev => {
            const next = [...prev];
            [next[index - 1], next[index]] = [next[index], next[index - 1]];
            return next;
        });
        if (selectedLineIndex === index) setSelectedLineIndex(index - 1);
        else if (selectedLineIndex === index - 1) setSelectedLineIndex(index);
    };

    const handleMoveDown = (index: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (submitted || evaluating || index === lineOrder.length - 1) return;
        setLineOrder(prev => {
            const next = [...prev];
            [next[index], next[index + 1]] = [next[index + 1], next[index]];
            return next;
        });
        if (selectedLineIndex === index) setSelectedLineIndex(index + 1);
        else if (selectedLineIndex === index + 1) setSelectedLineIndex(index);
    };

    const handleCheckOrder = () => {
        if (submitted || evaluating) return;
        setEvaluating(true);
        setSelectedLineIndex(null);
        // Clear saved progress on submit
        saveProgress(progressKey, undefined);
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

                    const arrowDisabled = submitted || evaluating;
                    const arrowBase: React.CSSProperties = {
                        background: "none",
                        border: "none",
                        padding: "0 2px",
                        lineHeight: 1,
                        fontSize: "0.7rem",
                        cursor: arrowDisabled ? "default" : "pointer",
                        color: "var(--text-dim)",
                        opacity: arrowDisabled ? 0.3 : 0.55,
                        flexShrink: 0,
                        transition: "opacity 0.15s",
                    };

                    return (
                        <div
                            key={originalIndex}
                            onClick={() => handleLineClick(currentIndex)}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                backgroundColor: bg,
                                border: `1px solid ${border}`,
                                borderRadius: "8px",
                                padding: "0.6rem 0.75rem",
                                color: color,
                                transition: "all 0.2s ease",
                                cursor: (submitted || evaluating) ? "default" : "pointer",
                                userSelect: "none"
                            }}
                        >
                            {/* Arrow buttons */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "1px", flexShrink: 0 }}>
                                <button
                                    onClick={(e) => handleMoveUp(currentIndex, e)}
                                    disabled={arrowDisabled || currentIndex === 0}
                                    title="Move up"
                                    style={{
                                        ...arrowBase,
                                        opacity: (arrowDisabled || currentIndex === 0) ? 0.2 : 0.55,
                                        cursor: (arrowDisabled || currentIndex === 0) ? "default" : "pointer",
                                    }}
                                >▲</button>
                                <button
                                    onClick={(e) => handleMoveDown(currentIndex, e)}
                                    disabled={arrowDisabled || currentIndex === lineOrder.length - 1}
                                    title="Move down"
                                    style={{
                                        ...arrowBase,
                                        opacity: (arrowDisabled || currentIndex === lineOrder.length - 1) ? 0.2 : 0.55,
                                        cursor: (arrowDisabled || currentIndex === lineOrder.length - 1) ? "default" : "pointer",
                                    }}
                                >▼</button>
                            </div>
                            {/* Line number */}
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
