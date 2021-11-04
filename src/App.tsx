import { Component } from "react";
import ComputerChroniclesEpisodeApiClient from "./ccapi/ComputerChroniclesEpisodeApiClient";
import { ComputerChroniclesEpisodeMetadata } from "./ccapi/ComputerChroniclesEpisodeMetadata";
import ComputerChroniclesEpisodeListComponent from "./components/ComputerChroniclesEpisodeListComponent";
import ComputerChroniclesOriginalEpisodeComponent from "./components/ComputerChroniclesOriginalEpisodeComponent";
import isPositiveInteger from "./isPositiveInteger";


type ApiProps = {};

type ApiState = {
    editingEpisode: number | null;
    episodes: ComputerChroniclesEpisodeMetadata[];
    episodeIndex: ComputerChroniclesEpisodeIndex;
};

type ComputerChroniclesEpisodeIndex = { [key: number]: ComputerChroniclesEpisodeMetadata | undefined; };

function convertEpisodesToIndexedArray(episodes: ComputerChroniclesEpisodeMetadata[]): ComputerChroniclesEpisodeIndex {
    const episodeIndex: ComputerChroniclesEpisodeIndex = {};
    episodes.forEach(episode => {
        episodeIndex[episode.episodeNumber] = episode;
    });
    return episodeIndex;
}

class App extends Component<ApiProps, ApiState> {
    private api: ComputerChroniclesEpisodeApiClient;

    public constructor(props: ApiProps) {
        super(props);

        this.api = new ComputerChroniclesEpisodeApiClient();
        this.state = {
            editingEpisode: null,
            episodeIndex: [],
            episodes: []
        };
    }

    public componentDidMount() {
        window.addEventListener('popstate', () => {
            console.log("popstate");
            this.checkGetVars();
        }, false);

        this.reloadApiData().then(() => this.checkGetVars());
    }

    protected checkGetVars() {
        console.log("checking get vars");
        console.log(window.location.search);
        const parts = window.location.search.substr(1).split("&");

        const $_GET: { [key: string]: string; } = {};
        for (let part of parts) {
            var temp = part.split("=");
            $_GET[decodeURIComponent(temp[0])] = decodeURIComponent(temp[1]);
        }
        if ($_GET.ep) {
            let epNum = parseInt($_GET.ep);
            if (isPositiveInteger(epNum)) {
                this.setEditedEpisode(epNum);
            }
        }else{
            this.setState({ editingEpisode: null });
        }
    }

    protected async reloadApiData() {
        this.api.getAllEpisodes().then(episodes => {
            this.setState({
                episodes: episodes,
                episodeIndex: convertEpisodesToIndexedArray(episodes)
            });
        }).catch(err => console.log((err as Error).message));
    }

    public handleSaveEpisode(episode: ComputerChroniclesEpisodeMetadata) {
        console.log(`Saved Episode`);
        console.log(episode);
        this.api.saveEpisode(episode).catch(err => console.log((err as any).message));
    }

    public setEditedEpisode(episodeNumber: number) {
        console.log(`Selected episode ${episodeNumber}`);
        let episode = this.state.episodeIndex[episodeNumber];
        if (episode) {
            window.history.pushState(episodeNumber, `CC${episodeNumber} - ${episode.isReRun ? "ReRun" : episode.title}`, `/?ep=${episodeNumber}`);
            this.setState({ editingEpisode: episodeNumber });
        } else {
            console.error(`Episode ${episodeNumber} not found`);
            console.log(episode);
        }
    }

    public handleCancel() {
        this.setState({ editingEpisode: null });
    }

    public render() {
        console.log(this.state);
        if (this.state.editingEpisode == null) {
            return <div className="main">
                <header className="episode-list-header">
                    <p>Welcome to the Computer Chronicles Archiving project!</p>
                </header>
                <ComputerChroniclesEpisodeListComponent
                    episodeList={this.state.episodes}
                    onSelectEpisode={this.setEditedEpisode.bind(this)}
                /></div>;
        } else {
            const episodeData = this.state.episodeIndex[this.state.editingEpisode];
            if (episodeData) {
                if (episodeData.isReRun) {
                    //return <ComputerChroniclesRerunEpisodeComponent
                    //    episodeData={episodeData}
                    //    onSaveEpisodeData={this.handleSaveEpisode.bind(this)} />;
                    return <span>Re-run</span>;
                } else {
                    return <ComputerChroniclesOriginalEpisodeComponent
                        episodeData={episodeData}
                        onCancel={this.handleCancel.bind(this)}
                        onSaveEpisodeData={this.handleSaveEpisode.bind(this)} />;
                }
            } else {
                return <span>Not found :/</span>;
            }
        }

    }
}

export default App;