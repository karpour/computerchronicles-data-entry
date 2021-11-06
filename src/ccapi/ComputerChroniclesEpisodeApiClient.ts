import axios from "axios";
import { ComputerChroniclesEpisodeMetadata, ComputerChroniclesFeaturedProduct, ComputerChroniclesGuest, ComputerChroniclesLocation } from "./ComputerChroniclesEpisodeMetadata";


const API_URL = "/api";

type ApiErrorResponse = { error: string; };

export type LoginStatus = {
    loggedIn: false;
} | {
    loggedIn: true;
    userName: string;
    role: string;
};

function isApiError(response: unknown): response is ApiErrorResponse {
    if (typeof response === 'object' && response) {
        return (response as any).error !== undefined;
    }
    return false;
}

export default class ComputerChroniclesEpisodeApiClient {

    public constructor(protected readonly apiUrl: string = API_URL) { }

    private ccApiGet<T>(url: string): Promise<T> {
        return axios.get(url, { withCredentials: true })
            .then((response) => {
                let r = response.data as ApiErrorResponse | T;
                if (isApiError(r)) throw new Error(r.error);
                return r as T;
            });
    }

    public getEpisode(episodeNumber: number): Promise<ComputerChroniclesEpisodeMetadata> {
        return this.ccApiGet(`${this.apiUrl}/episode/${episodeNumber}`);
    }

    public async getAllEpisodes(): Promise<ComputerChroniclesEpisodeMetadata[]> {
        //return allEpisodes as ComputerChroniclesEpisodeMetadata[];
        return this.ccApiGet(`${this.apiUrl}/episodes`);
    }

    public saveEpisode(episode: ComputerChroniclesEpisodeMetadata): Promise<ComputerChroniclesEpisodeMetadata> {
        console.log(`api.saveEpisode`);
        console.log(episode);
        return axios.put(`${this.apiUrl}/episode/${episode.episodeNumber}`, episode, { withCredentials: true })
            .then(response => {
                console.log(response.status)
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

    public getLoginStatus(): Promise<LoginStatus> {
        return this.ccApiGet(`${this.apiUrl}/loginstatus`);
    }
}