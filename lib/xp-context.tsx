"use client";
import { createContext, useContext, useState, ReactNode } from "react";

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

export function XpProvider({ children }: { children: ReactNode }) {
    const [xp, setXp] = useState(0);
    const [submissions, setSubmissions] = useState<Record<string, Submission>>({});

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

export function useXp() {
    const ctx = useContext(XpContext);
    if (!ctx) throw new Error("useXp must be used within XpProvider");
    return ctx;
}