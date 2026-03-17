"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
    const router = useRouter();
    const byteNum = Number(params.id);
    const problems = allProblems.filter((p) => p.byte === byteNum);
    const totalXp = problems.reduce((s, p) => s + p.xp, 0);
    const { submitProblem, getSubmission, removeXp } = useXp();

    const [activeIdx, setActiveIdx] = useState<number | null>(null);
    const [showHint, setShowHint] = useState(false);
    const [hintConfirm, setHintConfirm] = useState(false);
    const [showExplanation, setShowExplanation] = useState(false);
    
    // Add a state to force a "redo" without clearing the global XP state.
    const [isRedoingActive, setIsRedoingActive] = useState<boolean>(false);
    const [redoCount, setRedoCount] = useState<number>(0);

    const earnedXp = problems.reduce((s, _p, i) => {
        const sub = getSubmission(`${byteNum}-${i}`);
        return s + (sub?.earned || 0);
    }, 0);

    const handleComplete = (correctCount: number, totalCount: number) => {
        if (activeIdx === null) return;
        const p = problems[activeIdx];
        const key = `${byteNum}-${activeIdx}`;
        
        if (getSubmission(key)) {
            // Already submitted globally. If they completed it in Redo mode, we stop redoing.
            setIsRedoingActive(false);
            return;
        }

        const base = Math.floor(p.xp / 2);
        const correctBonus = Math.round((p.xp - base) * (correctCount / totalCount));
        const earned = base + correctBonus;
        submitProblem(key, { correct: correctCount === totalCount, earned });
        // Don't auto-show explanation
    };

    const handleRedo = () => {
        setIsRedoingActive(true);
        setShowExplanation(false);
        setShowHint(false);
        setHintConfirm(false);
        setRedoCount(prev => prev + 1);
    };

    const handleHintClick = () => {
        if (activeIdx === null) return;
        const key = `${byteNum}-${activeIdx}`;
        if (getSubmission(key) || isRedoingActive) { setShowHint(true); return; } // Free hint during redo or after submit
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
        setShowExplanation(false);
        setIsRedoingActive(false);
    };

    const closeProblem = () => {
        setActiveIdx(null);
        setShowHint(false);
        setHintConfirm(false);
        setShowExplanation(false);
        setIsRedoingActive(false);
    };

    const hasNextByte = allProblems.some(p => p.byte === byteNum + 1);

    const navigateNext = () => {
        if (activeIdx === null) return;
        if (activeIdx < problems.length - 1) {
            openProblem(activeIdx + 1);
        } else if (hasNextByte) {
            router.push(`/byte/${byteNum + 1}`);
        }
    };

    const navigatePrev = () => {
        if (activeIdx !== null && activeIdx > 0) {
            openProblem(activeIdx - 1);
        }
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
                                            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--green)" }}>{sub.earned}/{p.xp} XP</span>
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
    const globalSub = getSubmission(`${byteNum}-${activeIdx}`);
    const activeSub = isRedoingActive ? null : globalSub;

    // Use redoCount to force a complete unmount/remount on redo
    const componentKey = `${activeIdx}-${redoCount}`;

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <div onClick={closeProblem} style={{ color: "var(--text-dim)", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center" }}>← Back to menu</div>
            </div>
            
            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: catColor[p.category], background: catBg[p.category], padding: "2px 8px", borderRadius: 6 }}>{p.category}</span>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{p.title}</h2>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>{p.course}</p>
            <p style={{ fontSize: 13, color: "var(--accent)", marginBottom: 20 }}>
                {globalSub ? `${globalSub.earned}/${p.xp} XP earned` : `★ ${p.xp} XP`}
            </p>

            <details style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 16px", marginBottom: 20 }}>
                <summary style={{ cursor: "pointer", fontSize: 13, color: "var(--text-muted)" }}>Mini Lecture</summary>
                <p style={{ fontSize: 13, lineHeight: 1.7, color: "var(--text-muted)", marginTop: 10 }}>{p.mini_lecture}</p>
            </details>

            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: 20, marginBottom: 16 }}>
                {p.type === "spot_it" && <SpotIt key={componentKey} problem={p} onComplete={handleComplete} submitted={!!activeSub} />}
                {p.type === "sort_code" && <SortCode key={componentKey} problem={p} onComplete={handleComplete} submitted={!!activeSub} />}
                {p.type === "trace_iter" && <TraceIter key={componentKey} problem={p} onComplete={handleComplete} submitted={!!activeSub} />}
                {p.type === "match_it" && <MatchIt key={componentKey} problem={p} onComplete={handleComplete} submitted={!!activeSub} />}
            </div>

            {!showHint && !hintConfirm && (
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

            {showExplanation && activeSub && (
                <div style={{ background: activeSub.correct ? "var(--green-bg)" : "var(--red-bg)", border: `1px solid ${activeSub.correct ? "rgba(74,222,128,0.3)" : "rgba(248,113,113,0.3)"}`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
                    <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7 }}>{p.explanation}</p>
                </div>
            )}

            <div style={{ display: "flex", width: "100%", marginTop: 24, alignItems: "center", flexWrap: "wrap", gap: "12px 0" }}>
                <div style={{ flex: 1, minWidth: "max-content" }}>
                    {activeIdx > 0 && (
                        <button onClick={navigatePrev} style={{ background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 16px", color: "var(--text)", fontSize: 12, cursor: "pointer" }}>← Previous</button>
                    )}
                </div>
                
                {activeSub && !isRedoingActive && (
                    <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                        <button 
                            onClick={() => setShowExplanation(!showExplanation)} 
                            style={{ background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 16px", color: "var(--text)", fontSize: 12, cursor: "pointer" }}
                        >
                            {showExplanation ? "Hide explanation" : "See explanation"}
                        </button>
                        <button onClick={handleRedo} style={{ background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 16px", color: "var(--text)", fontSize: 12, cursor: "pointer" }}>
                            Redo
                        </button>
                        <button style={{ background: "var(--purple-dim)", border: "1px solid rgba(167,139,250,0.3)", borderRadius: 8, padding: "10px 16px", color: "var(--purple)", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z"/>
                            </svg>
                            Discuss on Discord
                        </button>
                    </div>
                )}
                
                <div style={{ flex: 1, display: "flex", justifyContent: "flex-end", minWidth: "max-content" }}>
                    {(activeIdx < problems.length - 1 || hasNextByte) && (
                        <button onClick={navigateNext} style={{ background: "var(--accent-dim)", border: "1px solid rgba(94,232,183,0.3)", borderRadius: 8, padding: "10px 16px", color: "var(--accent)", fontSize: 12, cursor: "pointer" }}>Next →</button>
                    )}
                </div>
            </div>
        </div>
    );
}
