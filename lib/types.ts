export interface SortCodeContent {
    instruction: string;
    lines: string[];
    correct_order: number[];
}

export interface TraceIterContent {
    code: string;
    question: string;
    iterations: { label: string; answer: string }[];
}

export interface MatchItContent {
    instruction: string;
    algorithms: string[];
    complexities: string[];
    correct: Record<string, number>;
}

export interface SpotItContent {
    question: string;
    options: string[];
    correct: number;
}

export interface Problem {
    byte: number;
    category: "Lower division" | "Upper division" | "Interview prep";
    course: string;
    title: string;
    type: "sort_code" | "trace_iter" | "match_it" | "spot_it";
    xp: number;
    teaser: string;
    mini_lecture: string;
    hint: string;
    content: SortCodeContent | TraceIterContent | MatchItContent | SpotItContent;
    explanation: string;
}

