"use client";
import { createContext, useContext, useState, ReactNode } from "react";

interface Submission {
    correct: boolean;
    earned: number;
}

interface XpState {
    xp: number;
    submissions: Record<string, Submission>;
    partialProgress: Record<string, any>;
    addXp: (amount: number) => void;
    removeXp: (amount: number) => void;
    submitProblem: (key: string, submission: Submission) => void;
    getSubmission: (key: string) => Submission | undefined;
    saveProgress: (key: string, data: any) => void;
    getProgress: (key: string) => any;
}

const XpContext = createContext<XpState | null>(null);

export function XpProvider({ children }: { children: ReactNode }) {
    const [xp, setXp] = useState(0);
    const [submissions, setSubmissions] = useState<Record<string, Submission>>({});
    const [partialProgress, setPartialProgress] = useState<Record<string, any>>({});

    const addXp = (amount: number) => setXp((prev) => prev + amount);
    const removeXp = (amount: number) => setXp((prev) => prev - amount);

    const submitProblem = (key: string, submission: Submission) => {
        setSubmissions((prev) => ({ ...prev, [key]: submission }));
        addXp(submission.earned);
    };

    const getSubmission = (key: string) => submissions[key];

    const saveProgress = (key: string, data: any) => {
        setPartialProgress((prev) => ({ ...prev, [key]: data }));
    };

    const getProgress = (key: string) => partialProgress[key];

    return (
        <XpContext.Provider value={{ xp, submissions, partialProgress, addXp, removeXp, submitProblem, getSubmission, saveProgress, getProgress }}>
            {children}
        </XpContext.Provider>
    );
}

const defaultState: XpState = {
    xp: 0,
    submissions: {},
    partialProgress: {},
    addXp: () => { },
    removeXp: () => { },
    submitProblem: () => { },
    getSubmission: () => undefined,
    saveProgress: () => { },
    getProgress: () => undefined,
};

export function useXp() {
    const ctx = useContext(XpContext);
    return ctx || defaultState;
}