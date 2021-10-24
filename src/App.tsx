import { Component } from "react";
import { ComputerChroniclesEpisodeMetadata, ComputerChroniclesOriginalEpisodeMetadata } from "./ComputerChroniclesEpisodeMetadata";
import ComputerChroniclesOriginalEpisodeComponent from "./components/ComputerChroniclesOriginalEpisodeComponent";

export const emptyComputerChroniclesEpisodeMetadata: ComputerChroniclesOriginalEpisodeMetadata = {
    issues: {
        videoIssues: false,
        audioIssues: false,
        noAudio: false,
    },
    episodeNumber: 218,
    isReRun: false,
    airingDate: "1970-01-01",
    productionDate: "1970-01-01",
    title: "Japanese PC's",
    description: "This is a description\n\nof the episode",
    host: { name: "Stewart Cheifet" },
    coHosts: [{ name: "Gary Kildall", role: "DRI" }, { name: "George Morrow", role: "Morrow Computing" }],
    locations: [{
        name: "CES 1995",
        location: "Las Vegas"
    }],
    iaIdentifier: "Japanese1985",
    guests: [
        {
            name: "John Miller",
            role: "Microsoft"
        },
        {
            name: "Jack Johnson"
        }
    ],
    featuredProducts: [{
        company: "Microsoft",
        product: "Windows 95"
    }],
    tags: ["Tag1", "Tag2", "Taggy tag"],
};

class App extends Component {

    public constructor(props: any) {
        super(props);
    }

    public handleSaveEpisode(episode: ComputerChroniclesEpisodeMetadata) {
        console.log(`Saved Episode`);
    }

    public render() {
        return <ComputerChroniclesOriginalEpisodeComponent
            episodeData={emptyComputerChroniclesEpisodeMetadata}
            onSaveEpisodeData={this.handleSaveEpisode.bind(this)}
        />;
    }
}

export default App;