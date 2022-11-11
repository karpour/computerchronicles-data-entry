export type ComputerChroniclesGuest = {
    name: string,
    role?: string;
};

export function computerChroniclesGuestToString(guest: ComputerChroniclesGuest): string {
    return `${guest.name}${guest.role ? " | " + guest.role : ""}`;
}

export type ComputerChroniclesFeaturedProduct = {
    company?: string;
    product: string,
};

export function computerChroniclesFeaturedProductToString(product: ComputerChroniclesFeaturedProduct): string {
    return `${product.company ? product.company + " | " : ""}${product.product}`;
}

export type ComputerChroniclesLocation = {
    name: string;
    location?: string;
};

export function computerChroniclesLocationToString(location: ComputerChroniclesLocation): string {
    return `${location.name}${location.location ? " | " + location.location : ""}`;
}

export type ComputerChroniclesEpisodeIssues = {
    videoIssues?: boolean,
    audioIssues?: boolean,
    noAudio?: boolean,
};

export const COMPUTERCHRONICLES_EPISODE_STATUSES = ["unknown", "videochecked", "needswork", "review", "done"] as const;

export type ComputerChroniclesEpisodeStatus = typeof COMPUTERCHRONICLES_EPISODE_STATUSES[number];

export type ComputerChroniclesOriginalEpisodeMetadata = {
    iaIdentifier: string | null,
    issues?: ComputerChroniclesEpisodeIssues;
    title: string,
    episodeNumber: ComputerChroniclesEpisodeNumber,
    isReRun: false,
    airingDate: string,
    productionDate: string,
    description: string,
    host: ComputerChroniclesGuest | null,
    coHosts: ComputerChroniclesGuest[],
    guests: ComputerChroniclesGuest[],
    locations: ComputerChroniclesLocation[],
    featuredProducts: ComputerChroniclesFeaturedProduct[],
    tags: string[],
    status: ComputerChroniclesEpisodeStatus;
    randomAccess: string[] | null;
    randomAccessHost: ComputerChroniclesGuest | null,
    editedBy?: string;
    notes?: string;
};

export type ComputerChroniclesRerunEpisodeMetadata = {
    issues?: ComputerChroniclesEpisodeIssues;
    iaIdentifier: string | null,
    episodeNumber: ComputerChroniclesEpisodeNumber,
    isReRun: true,
    reRunOf: ComputerChroniclesEpisodeNumber | null,
    productionDate: string,
    airingDate: string,
    status: ComputerChroniclesEpisodeStatus;
    randomAccess: string[] | null;
    randomAccessHost: ComputerChroniclesGuest | null,
    editedBy?: string;
    notes?: string;
};


export type ComputerChroniclesEpisodeInfo = {
    episodeNumber: ComputerChroniclesEpisodeNumber,
    title: string,
} & ({
    isReRun: false,
} | {
    isReRun: true,
    reRunOf: number;
});

export type ComputerChroniclesEpisodeMetadata = ComputerChroniclesOriginalEpisodeMetadata | ComputerChroniclesRerunEpisodeMetadata;

export type ComputerChroniclesEpisodeNumber = number;

export type ComputerChroniclesEpisodeIndex = { [key: number]: ComputerChroniclesEpisodeMetadata | undefined; };

export function parseComputerChroniclesEpisodeNumber(epNum: string): ComputerChroniclesEpisodeNumber {
    return parseInt(epNum);
}