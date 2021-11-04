import { ComputerChroniclesEpisodeMetadata, ComputerChroniclesFeaturedProduct, ComputerChroniclesGuest, ComputerChroniclesLocation } from "./ComputerChroniclesEpisodeMetadata";

export default class ComputerChroniclesApi {

    private static ccApiGet<T>(url: string): Promise<T> {
        return fetch(url)
            .then(response => {
                if (response.status != 200) {
                    return response.json().then(json => {
                        throw new Error(json.error ?? `Error while fetching '${url}'`);
                    });
                }
                return response.json() as Promise<T>;
            });
    }

    public static getAllEpisodes(): Promise<ComputerChroniclesEpisodeMetadata[]> {
        return this.ccApiGet<ComputerChroniclesEpisodeMetadata[]>('api/episodes');
    }

    public static getEpisode(episodeNumber: number): Promise<ComputerChroniclesEpisodeMetadata | null> {
        return this.ccApiGet<ComputerChroniclesEpisodeMetadata | null>(`api/episode/${episodeNumber}`);
    }

    public static getCoHosts() {
        return this.ccApiGet<ComputerChroniclesGuest[]>('api/coHosts');
    }

    public static getGuests() {
        return this.ccApiGet<ComputerChroniclesGuest[]>('api/guests');
    }

    public static getLocations() {
        return this.ccApiGet<ComputerChroniclesLocation[]>('api/locations');
    }

    public static getFeaturedProducts() {
        return this.ccApiGet<ComputerChroniclesFeaturedProduct[]>('api/featuredproducts');
    }
}