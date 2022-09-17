import { Component } from "react";
import ComputerChroniclesEpisodeApiClient from "./ccapi/ComputerChroniclesEpisodeApiClient";
import { ComputerChroniclesEpisodeMetadata } from "./ccapi/ComputerChroniclesEpisodeMetadata";
import ComputerChroniclesEpisodeDateComponent from "./components/ComputerChroniclesEpisodeDateComponent";
import ComputerChroniclesEpisodeListComponent from "./components/ComputerChroniclesEpisodeListComponent";
import ComputerChroniclesOriginalEpisodeComponent from "./components/ComputerChroniclesOriginalEpisodeComponent";
import LoginComponent from "./components/LoginComponent";
import isPositiveInteger from "./isPositiveInteger";


type ApiProps = {};

enum Page {
    MAIN,
    EDITING,
    DATE_LIST
}

type ApiState = {
    editingEpisode: number | null;
    episodes: ComputerChroniclesEpisodeMetadata[];
    episodeIndex: ComputerChroniclesEpisodeIndex;
    loggedIn: boolean;
    userName: string | null;
    tags: string[];
    showReRuns: boolean;
    page: Page,
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
            tags: [],
            showReRuns: false,
            page: Page.MAIN
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
        } else if ($_GET.dates) {
            this.setState({ editingEpisode: null, page: Page.DATE_LIST });
        } else {
            this.setState({ editingEpisode: null, page: Page.MAIN });
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
        console.log("Reloading api data");
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
            this.setState({ editingEpisode: episodeNumber, page: Page.EDITING });
        } else {
            console.error(`Episode ${episodeNumber} not found`);
            console.log(episode);
        }
    }

    public handleCancel() {
        window.history.pushState(null, `Main Menu`, `/`);
        this.setState({ editingEpisode: null, page: Page.MAIN });
    }

    public render() {
        //console.log(this.state);
        let content!: JSX.Element | JSX.Element[];

        const loginComponent = <LoginComponent
            loggedIn={this.state.loggedIn}
            userName={this.state.userName}
            showBackButton={this.state.editingEpisode ? true : false}
            onBack={this.handleCancel.bind(this)}
        />;

        switch (this.state.page) {
            case Page.MAIN:
                return <div className="main">
                    {loginComponent}
                    <header className="episode-list-header">
                        <p>Welcome to the Computer Chronicles Archiving project!<br />
                            This project aims to once and for all complete all metadata for the Computer Chronicles.</p>
                        <p><b>Want to participate?</b> Join the <a href="https://discord.gg/STPwnYqcnW">discord server</a> or write an <a href="mailto:computerchronicles@thomasnovotny.com">e-mail</a>.</p>
                        <p>The entire dataset is available here: <a href="computerchronicles_metadata.json">JSON</a> <a href="computerchronicles_metadata.ndjson">NDJSON</a></p>
                    </header>
                    <div className="episode-list-item">
                        <input type="checkbox" name="show-reruns" id="show-reruns" checked={this.state.showReRuns} onChange={() => { this.setState({ showReRuns: !this.state.showReRuns }); }}></input>
                        <label htmlFor="show-reruns">Show Re-Runs</label>
                    </div>
                    <ComputerChroniclesEpisodeListComponent
                        episodeList={this.state.showReRuns ? this.state.episodes : this.state.episodes.filter(ep => !ep.isReRun)}
                        onSelectEpisode={this.setEditedEpisode.bind(this)}
                    />
                </div>;

            case Page.EDITING:
                const episodeData = this.state.episodeIndex[this.state.editingEpisode ?? 101];
                if (episodeData) {
                    if (episodeData.isReRun) {
                        return <div className="main-editing">
                            {loginComponent}
                            <span>Re-run</span>;
                        </div>;

                    } else {
                        return <div className="main-editing">
                            {loginComponent}
                            <ComputerChroniclesOriginalEpisodeComponent
                                episodeData={episodeData}
                                editable={this.state.loggedIn}
                                onCancel={this.handleCancel.bind(this)}
                                onSaveEpisodeData={this.handleSaveEpisode.bind(this)}
                                tags={this.state.tags}
                            />
                        </div>;
                    }
                } else {
                    return <span>Not found</span>;
                }

            case Page.DATE_LIST:
                return <div className="main">
                    {loginComponent}
                    <header className="episode-list-header">
                        <p>This page shows all episodes and their respective dates.</p>
                    </header>
                    <ComputerChroniclesEpisodeDateComponent
                        episodeList={this.state.episodes}
                        onSelectEpisode={this.setEditedEpisode.bind(this)}
                    />
                </div>;
        }
    }
}

export default App;