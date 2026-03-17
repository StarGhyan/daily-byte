"use client";
import { useXp } from "@/lib/xp-context";
import Link from "next/link";

export function Header() {
    const { xp } = useXp();
    return (
        <header style={{
            borderBottom: "1px solid var(--border)",
            padding: "14px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "sticky",
            top: 0,
            background: "var(--bg-primary)",
            zIndex: 10,
        }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: "linear-gradient(135deg, rgba(94,232,183,0.15), rgba(167,139,250,0.15))",
                    border: "1px solid rgba(94,232,183,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, fontWeight: 700, color: "var(--accent)",
                }}>DB</div>
                <span style={{ fontSize: 15, fontWeight: 600 }}>Daily Byte</span>
            </Link>
            <div style={{
                background: "rgba(94,232,183,0.08)",
                border: "1px solid rgba(94,232,183,0.2)",
                borderRadius: 10,
                padding: "6px 14px",
                display: "flex",
                alignItems: "center",
                gap: 6,
            }}>
                <span style={{ color: "var(--accent)", fontSize: 14, fontWeight: 700 }}>{xp}</span>
                <span style={{ color: "var(--text-dim)", fontSize: 11 }}>XP</span>
            </div>
        </header>
    );
}