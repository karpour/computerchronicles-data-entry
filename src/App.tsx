import { Component } from "react";
import ComputerChroniclesEpisodeApiClient from "./ccapi/ComputerChroniclesEpisodeApiClient";
import { ComputerChroniclesEpisodeMetadata } from "./ccapi/ComputerChroniclesEpisodeMetadata";
import ComputerChroniclesEpisodeListComponent from "./components/ComputerChroniclesEpisodeListComponent";
import ComputerChroniclesOriginalEpisodeComponent from "./components/ComputerChroniclesOriginalEpisodeComponent";
import LoginComponent from "./components/LoginComponent";
import isPositiveInteger from "./isPositiveInteger";


type ApiProps = {};

type ApiState = {
    editingEpisode: number | null;
    episodes: ComputerChroniclesEpisodeMetadata[];
    episodeIndex: ComputerChroniclesEpisodeIndex;
    loggedIn: boolean;
    userName: string | null;
    tags: string[];
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
            episodes: [],
            loggedIn: false,
            userName: null,
            tags: []
        };
    }

    public componentDidMount() {
        window.addEventListener('popstate', () => {
            console.log("popstate");
            this.checkGetVars();
        }, false);

        this.updateLoginStatus();
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
        } else {
            this.setState({ editingEpisode: null });
        }
    }

    public updateLoginStatus() {
        return this.api.getLoginStatus().then(status => {
            if (status.loggedIn) {
                this.setState({
                    loggedIn: true,
                    userName: status.userName
                });
            } else {
                this.setState({
                    loggedIn: false,
                    userName: null
                });
            }
        });
    }

    protected async reloadApiData() {
        try {
            const episodes = await this.api.getAllEpisodes();
            const tags = await this.api.getTags();
            this.setState({
                episodes: episodes,
                episodeIndex: convertEpisodesToIndexedArray(episodes),
                tags: tags
            });
        } catch (err) {
            console.log((err as Error).message);
        }
    }

    public handleSaveEpisode(episode: ComputerChroniclesEpisodeMetadata): Promise<any> {
        console.log(`Saved Episode`);
        console.log(episode);
        return this.api.saveEpisode(episode);
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
        window.history.pushState(null, `Main Menu`, `/`);
        this.setState({ editingEpisode: null });
    }

    public render() {
        console.log(this.state);
        let content!: JSX.Element | JSX.Element[];
        if (this.state.editingEpisode == null) {
            content = [
                <header className="episode-list-header">
                    <p>Welcome to the Computer Chronicles Archiving project!</p>
                </header>,
                <ComputerChroniclesEpisodeListComponent
                    episodeList={this.state.episodes}
                    onSelectEpisode={this.setEditedEpisode.bind(this)}
                />];
        } else {
            const episodeData = this.state.episodeIndex[this.state.editingEpisode];
            if (episodeData) {
                if (episodeData.isReRun) {
                    //return <ComputerChroniclesRerunEpisodeComponent
                    //    episodeData={episodeData}
                    //    onSaveEpisodeData={this.handleSaveEpisode.bind(this)} />;
                    content = <span>Re-run</span>;
                } else {
                    content = <ComputerChroniclesOriginalEpisodeComponent
                        episodeData={episodeData}
                        editable={this.state.loggedIn}
                        onCancel={this.handleCancel.bind(this)}
                        onSaveEpisodeData={this.handleSaveEpisode.bind(this)} 
                        tags={this.state.tags}
                        />;
                }
            } else {
                content = (<span>Not found :/</span>);
            }
        }
        return (
            <div className="main">
                <LoginComponent
                    loggedIn={this.state.loggedIn}
                    userName={this.state.userName}
                    showBackButton={this.state.editingEpisode ? true : false}
                    onBack={this.handleCancel.bind(this)}
                />
                {content}
            </div>
        );
    }
}

export default App;