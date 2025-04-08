export type User = {
    id: number;
    full_name: string;
    email: string;
    role: string;
    created_at: string;
};

export type Announcement = {
    id: number;
    title: string;
    description: string;
    user_id: number;
    image_url: string | null;
    created_at: string;
    updated_at: string;
    user?: User;
};

export type SentimentAnalysis = {
    sentiment: string;
    score: number;
    analysis: string;
}; 