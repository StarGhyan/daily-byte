"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

const XP_KEY = "dailybyte-xp";
const SUBMISSIONS_KEY = "dailybyte-submissions";

interface Submission {
    correct: boolean;
    earned: number;
}

interface XpState {
    xp: number;
    submissions: Record<string, Submission>;
    addXp: (amount: number) => void;
    removeXp: (amount: number) => void;
    submitProblem: (key: string, submission: Submission) => void;
    getSubmission: (key: string) => Submission | undefined;
}

const XpContext = createContext<XpState | null>(null);

function readLocalStorage<T>(key: string, fallback: T): T {
    if (typeof window === "undefined") return fallback;
    try {
        const raw = localStorage.getItem(key);
        if (raw === null) return fallback;
        return JSON.parse(raw) as T;
    } catch {
        return fallback;
    }
}

function writeLocalStorage(key: string, value: unknown) {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // Ignore quota / security errors
    }
}

export function XpProvider({ children }: { children: ReactNode }) {
    const [xp, setXp] = useState<number>(() => readLocalStorage<number>(XP_KEY, 0));
    const [submissions, setSubmissions] = useState<Record<string, Submission>>(
        () => readLocalStorage<Record<string, Submission>>(SUBMISSIONS_KEY, {})
    );

    // Persist to localStorage whenever state changes
    useEffect(() => {
        writeLocalStorage(XP_KEY, xp);
    }, [xp]);

    useEffect(() => {
        writeLocalStorage(SUBMISSIONS_KEY, submissions);
    }, [submissions]);

    const addXp = (amount: number) => setXp((prev) => prev + amount);
    const removeXp = (amount: number) => setXp((prev) => prev - amount);

    const submitProblem = (key: string, submission: Submission) => {
        setSubmissions((prev) => ({ ...prev, [key]: submission }));
        addXp(submission.earned);
    };

    const getSubmission = (key: string) => submissions[key];

    return (
        <XpContext.Provider value={{ xp, submissions, addXp, removeXp, submitProblem, getSubmission }}>
            {children}
        </XpContext.Provider>
    );
}

const defaultState: XpState = {
    xp: 0,
    submissions: {},
    addXp: () => { },
    removeXp: () => { },
    submitProblem: () => { },
    getSubmission: () => undefined,
};

export function useXp() {
    const ctx = useContext(XpContext);
    return ctx || defaultState;
}