import Link from "next/link";
import problemsData from "@/data/problems.json";
import { Problem } from "@/lib/types";

const problems = problemsData as Problem[];

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

export default function Home() {
  const byteMap = new Map<number, Problem[]>();
  problems.forEach((p) => {
    if (!byteMap.has(p.byte)) byteMap.set(p.byte, []);
    byteMap.get(p.byte)!.push(p);
  });
  const bytes = Array.from(byteMap.entries()).sort((a, b) => a[0] - b[0]);

  return (
    <div>
      <style>{`
        .byte-card { cursor: pointer; user-select: none; transition: border-color 0.2s; }
        .byte-card:hover .byte-start { color: var(--accent) !important; }
      `}</style>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Daily Byte</h1>
      <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 32 }}>
        Bite-sized CS challenges. Complete all 4 problems in each byte.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
        {bytes.map(([byteNum, byteProblems]) => {
          const totalXp = byteProblems.reduce((s, p) => s + p.xp, 0);
          return (
            <Link key={byteNum} href={`/byte/${byteNum}`}>
              <div className="byte-card" style={{
                background: "var(--bg-card)", border: "1px solid var(--border)",
                borderRadius: 14, padding: 20,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 9,
                      background: "var(--accent-dim)", border: "1px solid rgba(94,232,183,0.3)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, fontWeight: 700, color: "var(--accent)",
                    }}>#{byteNum}</div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 600 }}>Byte #{byteNum}</div>
                      <div style={{ fontSize: 12, color: "var(--text-dim)" }}>{byteProblems.length} problems</div>
                    </div>
                  </div>
                  <div style={{ color: "var(--accent)", fontSize: 13, fontWeight: 600 }}>★ {totalXp} XP</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {byteProblems.map((p, i) => {
                      let displayPrefix = "";
                      if (p.category !== "Interview prep") {
                        const match = p.course.match(/\d+/);
                        if (match) {
                          displayPrefix = `(${match[0]}) `;
                        }
                      }
                      return (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 13, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, minWidth: 0 }}>{displayPrefix}{p.title}</span>
                          <span style={{
                            fontSize: 10, fontWeight: 600, color: catColor[p.category],
                            background: catBg[p.category], padding: "2px 8px", borderRadius: 6,
                            whiteSpace: "nowrap",
                          }}>{p.category}</span>
                        </div>
                      );
                    })}
                </div>
                <div className="byte-start" style={{ marginTop: 16, fontSize: 13, color: "var(--text-dim)", transition: "color 0.2s" }}>Start this byte →</div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}