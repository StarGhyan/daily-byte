"use client";

import { useState } from "react";
import { Problem, SpotItContent } from "@/lib/types";

interface SpotItProps {
    problem: Problem;
    onComplete: (correctCount: number, totalCount: number) => void;
    submitted: boolean;
}

export function SpotIt({ problem, onComplete, submitted }: SpotItProps) {
    const content = problem.content as SpotItContent;
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const isAnswered = submitted || selectedIndex !== null;

    const handleSelect = (index: number) => {
        if (isAnswered) return;
        setSelectedIndex(index);
        
        if (index === content.correct) {
            onComplete(1, 1);
        } else {
            onComplete(0, 1);
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={{ color: "var(--text)", fontSize: "1.1rem", lineHeight: "1.5" }}>
                {content.question}
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {content.options.map((option, index) => {
                    const isCorrect = index === content.correct;
                    const isSelected = index === selectedIndex;
                    
                    let bg = "var(--bg-input)";
                    let border = "var(--border)";
                    let color = "var(--text)";

                    // After clicking, highlight correct answer green, wrong answer red
                    if (isAnswered) {
                        if (isCorrect) {
                            bg = "var(--green-bg)";
                            border = "var(--green)";
                            color = "var(--green)";
                        } else if (isSelected) {
                            bg = "var(--red-bg)";
                            border = "var(--red)";
                            color = "var(--red)";
                        } else {
                            color = "var(--text-muted)";
                        }
                    } else if (hoveredIndex === index) {
                        border = "var(--accent)";
                    }

                    const label = String.fromCharCode(65 + index); // A, B, C, D

                    return (
                        <button
                            key={index}
                            onClick={() => handleSelect(index)}
                            disabled={isAnswered}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "1rem",
                                padding: "1rem",
                                backgroundColor: bg,
                                border: `1px solid ${border}`,
                                borderRadius: "8px",
                                color: color,
                                cursor: isAnswered ? "default" : "pointer",
                                textAlign: "left",
                                fontSize: "1rem",
                                transition: "all 0.2s ease",
                                outline: "none"
                            }}
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            <span style={{ fontWeight: "bold", opacity: 0.8 }}>
                                {label}.
                            </span>
                            <span>{option}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
