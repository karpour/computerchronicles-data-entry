import axios from "axios";
import { ComputerChroniclesEpisodeMetadata, ComputerChroniclesFeaturedProduct, ComputerChroniclesGuest, ComputerChroniclesLocation } from "./ComputerChroniclesEpisodeMetadata";
import allEpisodes from "../episodes.json";


const API_URL = "https://localhost:4000/api";

type ApiErrorResponse = { error: string; };

function isApiError(response: unknown): response is ApiErrorResponse {
    if (typeof response === 'object' && response) {
        return (response as any).error !== undefined;
    }
    return false;
}

export default class ComputerChroniclesEpisodeApiClient {

    public constructor(protected readonly apiUrl: string = API_URL) { }

    private ccApiGet<T>(url: string): Promise<T> {
        return axios.get(url)
            .then((response) => {
                let r = response.data as ApiErrorResponse | T;
                if (isApiError(r)) throw new Error(r.error);
                return r as T;
            });
    }

    public getEpisode(episodeNumber: number): Promise<ComputerChroniclesEpisodeMetadata> {
        return this.ccApiGet(`${this.apiUrl}/episodes/${episodeNumber}`);
    }
    
    public async getAllEpisodes(): Promise<ComputerChroniclesEpisodeMetadata[]> {
        return allEpisodes as ComputerChroniclesEpisodeMetadata[];
        //return this.ccApiGet(`${this.apiUrl}/episodes`);
    }

    public saveEpisode(episode: ComputerChroniclesEpisodeMetadata): Promise<ComputerChroniclesEpisodeMetadata> {
        return axios.put(`${this.apiUrl}/episodes/${episode.episodeNumber}`, episode, { withCredentials: true })
            .then(response => {
                if (response.status === 403) throw new Error("Not authorized");
                if (isApiError(response.data)) throw new Error(response.data.error);
                if (response.status !== 200) throw new Error(`Unspecified error, http code ${response.status}`);
                return response.data as ComputerChroniclesEpisodeMetadata;
            });
    }

    public getGuestList(): Promise<ComputerChroniclesGuest[]> {
        return this.ccApiGet(`${this.apiUrl}/guests`);
    }

    public getCoHostList(): Promise<ComputerChroniclesGuest[]> {
        return this.ccApiGet(`${this.apiUrl}/cohosts`);
    }

    public getProductsList(): Promise<ComputerChroniclesFeaturedProduct[]> {
        return this.ccApiGet(`${this.apiUrl}/products`);
    }

    public getLocationsList(): Promise<ComputerChroniclesLocation[]> {
        return this.ccApiGet(`${this.apiUrl}/locations`);
    }
}