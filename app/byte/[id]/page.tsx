"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import problemsData from "@/data/problems.json";
import { Problem } from "@/lib/types";
import { useXp } from "@/lib/xp-context";
import { SpotIt } from "@/components/SpotIt";
import { SortCode } from "@/components/SortCode";
import { TraceIter } from "@/components/TraceIter";
import { MatchIt } from "@/components/MatchIt";

const allProblems = problemsData as Problem[];

const catColor: Record<string, string> = {
    "Lower division": "var(--blue)",
    "Upper division": "var(--amber)",
    "Interview prep": "var(--coral)",
};
const catBg: Record<string, string> = {
    "Lower division": "var(--blue-dim)",
    "Upper division": "var(--amber-dim)",
    "Interview prep": "var(--coral-dim)",
};

export default function BytePage({ params: _params }: any) {
    const params = useParams();
    const byteNum = Number(params.id);
    const problems = allProblems.filter((p) => p.byte === byteNum);
    const totalXp = problems.reduce((s, p) => s + p.xp, 0);
    const { submitProblem, getSubmission, removeXp } = useXp();

    const [activeIdx, setActiveIdx] = useState<number | null>(null);
    const [showHint, setShowHint] = useState(false);
    const [hintConfirm, setHintConfirm] = useState(false);
    const [showExplanation, setShowExplanation] = useState(false);

    const earnedXp = problems.reduce((s, _p, i) => {
        const sub = getSubmission(`${byteNum}-${i}`);
        return s + (sub?.earned || 0);
    }, 0);

    const handleComplete = (correctCount: number, totalCount: number) => {
        if (activeIdx === null) return;
        const p = problems[activeIdx];
        const key = `${byteNum}-${activeIdx}`;
        if (getSubmission(key)) return;
        const base = Math.floor(p.xp / 2);
        const correctBonus = Math.round((p.xp - base) * (correctCount / totalCount));
        const earned = base + correctBonus;
        submitProblem(key, { correct: correctCount === totalCount, earned });
        setShowExplanation(true);
    };

    const handleHintClick = () => {
        if (activeIdx === null) return;
        const key = `${byteNum}-${activeIdx}`;
        if (getSubmission(key)) { setShowHint(true); return; }
        setHintConfirm(true);
    };

    const confirmHint = () => {
        removeXp(1);
        setHintConfirm(false);
        setShowHint(true);
    };

    const openProblem = (idx: number) => {
        setActiveIdx(idx);
        setShowHint(false);
        setHintConfirm(false);
        const sub = getSubmission(`${byteNum}-${idx}`);
        setShowExplanation(!!sub);
    };

    const closeProblem = () => {
        setActiveIdx(null);
        setShowHint(false);
        setHintConfirm(false);
        setShowExplanation(false);
    };

    if (activeIdx === null) {
        return (
            <div>
                <Link href="/" style={{ color: "var(--text-dim)", fontSize: 13, display: "block", marginBottom: 16 }}>← All bytes</Link>
                <h1 style={{ fontSize: 24, fontWeight: 700 }}>Byte #{byteNum}</h1>
                <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 24 }}>
                    {problems.length} problems · <span style={{ color: "var(--accent)" }}>{earnedXp} / {totalXp} XP</span>
                </p>
                <div style={{ width: "100%", height: 3, background: "var(--border)", borderRadius: 2, marginBottom: 24 }}>
                    <div style={{ height: "100%", background: "var(--accent)", borderRadius: 2, width: `${totalXp > 0 ? (earnedXp / totalXp) * 100 : 0}%`, transition: "width 0.5s" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {problems.map((p, i) => {
                        const sub = getSubmission(`${byteNum}-${i}`);
                        return (
                            <div key={i} onClick={() => openProblem(i)} style={{
                                background: "var(--bg-card)", border: `1px solid ${sub ? (sub.correct ? "rgba(74,222,128,0.3)" : "rgba(248,113,113,0.3)") : "var(--border)"}`,
                                borderRadius: 12, padding: "16px 20px", cursor: "pointer",
                            }}>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <div>
                                        <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                                            <span style={{ fontSize: 10, fontWeight: 600, color: catColor[p.category], background: catBg[p.category], padding: "2px 8px", borderRadius: 6 }}>{p.category}</span>
                                            <span style={{ fontSize: 10, color: "var(--text-dim)", background: "var(--bg-input)", padding: "2px 8px", borderRadius: 6 }}>{p.type.replace("_", " ")}</span>
                                        </div>
                                        <div style={{ fontSize: 15, fontWeight: 600 }}>{p.title}</div>
                                        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{p.course}</div>
                                    </div>
                                    <div>
                                        {sub ? (
                                            <span style={{ fontSize: 12, fontWeight: 600, color: sub.correct ? "var(--green)" : "var(--red)" }}>{sub.earned}/{p.xp} XP</span>
                                        ) : (
                                            <span style={{ fontSize: 13, color: "var(--accent)" }}>★ {p.xp}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    const p = problems[activeIdx];
    const sub = getSubmission(`${byteNum}-${activeIdx}`);

    return (
        <div>
            <div onClick={closeProblem} style={{ color: "var(--text-dim)", fontSize: 13, cursor: "pointer", marginBottom: 16 }}>← Back to menu</div>
            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: catColor[p.category], background: catBg[p.category], padding: "2px 8px", borderRadius: 6 }}>{p.category}</span>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{p.title}</h2>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>{p.course}</p>
            <p style={{ fontSize: 13, color: "var(--accent)", marginBottom: 20 }}>
                {sub ? `${sub.earned}/${p.xp} XP earned` : `★ ${p.xp} XP`}
            </p>

            <details style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 16px", marginBottom: 20 }}>
                <summary style={{ cursor: "pointer", fontSize: 13, color: "var(--text-muted)" }}>Mini Lecture</summary>
                <p style={{ fontSize: 13, lineHeight: 1.7, color: "var(--text-muted)", marginTop: 10 }}>{p.mini_lecture}</p>
            </details>

            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: 20, marginBottom: 16 }}>
                {p.type === "spot_it" && <SpotIt key={activeIdx} problem={p} onComplete={handleComplete} submitted={!!sub} />}
                {p.type === "sort_code" && <SortCode key={activeIdx} problem={p} onComplete={handleComplete} submitted={!!sub} />}
                {p.type === "trace_iter" && <TraceIter key={activeIdx} problem={p} onComplete={handleComplete} submitted={!!sub} />}
                {p.type === "match_it" && <MatchIt key={activeIdx} problem={p} onComplete={handleComplete} submitted={!!sub} />}
            </div>

            {!showHint && !sub && (
                <button onClick={handleHintClick} style={{ background: "none", border: "1px solid rgba(251,191,36,0.2)", borderRadius: 8, padding: "8px 16px", color: "var(--amber)", fontSize: 12, cursor: "pointer", marginBottom: 16 }}>Show hint</button>
            )}
            {hintConfirm && (
                <div style={{ background: "var(--amber-dim)", border: "1px solid rgba(251,191,36,0.3)", borderRadius: 10, padding: 14, marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13, color: "var(--amber)" }}>Using a hint costs 1 XP</span>
                    <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={confirmHint} style={{ background: "rgba(251,191,36,0.2)", border: "1px solid rgba(251,191,36,0.3)", borderRadius: 6, padding: "6px 12px", color: "var(--amber)", fontSize: 12, cursor: "pointer" }}>See anyway</button>
                        <button onClick={() => setHintConfirm(false)} style={{ background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 6, padding: "6px 12px", color: "var(--text-dim)", fontSize: 12, cursor: "pointer" }}>Cancel</button>
                    </div>
                </div>
            )}
            {showHint && (
                <div style={{ background: "var(--amber-dim)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: 10, padding: 14, marginBottom: 16, fontSize: 13, color: "var(--amber)", lineHeight: 1.6 }}>{p.hint}</div>
            )}

            {showExplanation && sub && (
                <div style={{ background: sub.correct ? "var(--green-bg)" : "var(--red-bg)", border: `1px solid ${sub.correct ? "rgba(74,222,128,0.3)" : "rgba(248,113,113,0.3)"}`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: sub.correct ? "var(--green)" : "var(--red)", marginBottom: 8 }}>
                        {sub.correct ? "Correct!" : "Not quite right"} — {sub.earned}/{p.xp} XP
                    </div>
                    <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7 }}>{p.explanation}</p>
                </div>
            )}

            {sub && (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button style={{ background: "var(--purple-dim)", border: "1px solid rgba(167,139,250,0.3)", borderRadius: 8, padding: "10px 16px", color: "var(--purple)", fontSize: 12, cursor: "pointer" }}>Discuss on Discord</button>
                    {activeIdx > 0 && (
                        <button onClick={() => openProblem(activeIdx - 1)} style={{ background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 16px", color: "var(--text-muted)", fontSize: 12, cursor: "pointer" }}>← Previous</button>
                    )}
                    {activeIdx < problems.length - 1 && (
                        <button onClick={() => openProblem(activeIdx + 1)} style={{ background: "var(--accent-dim)", border: "1px solid rgba(94,232,183,0.3)", borderRadius: 8, padding: "10px 16px", color: "var(--accent)", fontSize: 12, cursor: "pointer" }}>Next question →</button>
                    )}
                </div>
            )}
        </div>
    );
}