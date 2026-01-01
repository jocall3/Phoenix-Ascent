
export enum AudioInputFormat {
    WEBM = 'audio/webm',
    MP3 = 'audio/mp3',
    WAV = 'audio/wav',
}

export enum CodeOutputLanguage {
    TYPESCRIPT = 'TypeScript',
    JAVASCRIPT = 'JavaScript',
    PYTHON = 'Python',
    GO = 'Go',
    RUST = 'Rust',
    SQL = 'SQL',
    HTML = 'HTML',
    CSS = 'CSS',
}

export enum CodeFramework {
    NONE = 'None',
    REACT = 'React',
    NEXTJS = 'Next.js',
    NESTJS = 'NestJS',
    EXPRESS = 'Express.js',
    DJANGO = 'Django',
    FASTAPI = 'FastAPI',
    TAILWIND = 'Tailwind CSS',
}

export enum CodeGenerationMode {
    GENERATE_NEW = 'Generate New Code',
    REFACTOR = 'Refactor Existing Code',
    DEBUG = 'Debug Code',
    OPTIMIZE = 'Optimize Code',
    DOCUMENT = 'Document Code',
    TEST = 'Generate Tests',
}

export enum AIModelType {
    GEMINI_3_PRO = 'gemini-3-pro-preview',
    GEMINI_3_FLASH = 'gemini-3-flash-preview',
}

export enum CloudProvider {
    NONE = 'None',
    AWS = 'AWS',
    GCP = 'Google Cloud Platform',
    VERCEL = 'Vercel',
}

export enum SecurityVulnerabilityType {
    NONE = 'None',
    XSS = 'Cross-Site Scripting (XSS)',
    SQL_INJECTION = 'SQL Injection',
    SENSITIVE_DATA_EXPOSURE = 'Sensitive Data Exposure',
}

export interface ICodeSnippet {
    id: string;
    content: string;
    language: CodeOutputLanguage;
    framework: CodeFramework;
    description: string;
    createdAt: Date;
    qualityScore: number;
    securityWarnings: SecurityVulnerabilityType[];
}

export interface ICommandContext {
    currentProjectId: string;
    targetLanguage: CodeOutputLanguage;
    targetFramework: CodeFramework;
    generationMode: CodeGenerationMode;
    promptTemperature: number;
    maxTokens: number;
}

export interface IProjectConfiguration {
    id: string;
    name: string;
    cloudProvider: CloudProvider;
}
