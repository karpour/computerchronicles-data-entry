import { Component } from "react";
import ComputerChroniclesEpisodeApiClient from "./ccapi/ComputerChroniclesEpisodeApiClient";
import { ComputerChroniclesEpisodeIndex, ComputerChroniclesEpisodeMetadata, ComputerChroniclesOriginalEpisodeMetadata, ComputerChroniclesRerunEpisodeMetadata } from "./ccapi/ComputerChroniclesEpisodeMetadata";
import ComputerChroniclesEpisodeDateComponent from "./components/ComputerChroniclesEpisodeDateComponent";
import ComputerChroniclesEpisodeListComponent from "./components/ComputerChroniclesEpisodeListComponent";
import ComputerChroniclesOriginalEpisodeComponent from "./components/ComputerChroniclesOriginalEpisodeComponent";
import ComputerChroniclesUnknownReRunComponent from "./components/ComputerChroniclesUnknownReRunComponent";
import LoginComponent from "./components/LoginComponent";
import isPositiveInteger from "./isPositiveInteger";


type ApiProps = {};

enum Page {
    MAIN,
    EDITING,
    DATE_LIST
}

type ApiState = {
    editingEpisode: ComputerChroniclesEpisodeMetadata | null;
    episodes: ComputerChroniclesEpisodeMetadata[];
    episodeIndex: ComputerChroniclesEpisodeIndex;
    loggedIn: boolean;
    userName: string | null;
    tags: string[];
    showReRuns: boolean;
    page: Page,
};

export function getReRuns(episodeNumber: number, episodeList: ComputerChroniclesEpisodeMetadata[]): ComputerChroniclesRerunEpisodeMetadata[] {
    return episodeList.filter((ep: ComputerChroniclesEpisodeMetadata) => ep.isReRun && (ep.reRunOf === episodeNumber)) as ComputerChroniclesRerunEpisodeMetadata[];
}


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
            this.setEditedEpisodeByNumber(parseInt($_GET.ep));
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
        this.setState({ editingEpisode: episode });
        return this.api.saveEpisode(episode).then(() => this.reloadApiData());
    }

    public setEditedEpisodeByNumber(episodeNumber: number) {
        if (isPositiveInteger(episodeNumber)) {
            const episode = this.state.episodeIndex[episodeNumber];
            if (episode) {
                this.setEditedEpisode(episode);
            } else {
                console.error(`Episode ${episodeNumber} does not exist`);
            }
        }
    }

    public setEditedEpisode(episode: ComputerChroniclesEpisodeMetadata) {
        const episodeNumber = episode.episodeNumber;
        console.log(`Selected episode ${episodeNumber}`);
        if (episode) {
            window.history.pushState(episodeNumber, `CC${episodeNumber} - ${episode.isReRun ? "ReRun" : episode.title}`, `/?ep=${episodeNumber}`);
            this.setState({ editingEpisode: episode, page: Page.EDITING });
        } else {
            console.error(`Episode ${episodeNumber} not found`);
            console.log(episode);
        }
    }

    public handleCancel() {
        window.history.pushState(null, `Main Menu`, `/`);
        this.setState({ editingEpisode: null, page: Page.MAIN });
    }

    public async handleChangeReRun(sourceEpisode: ComputerChroniclesOriginalEpisodeMetadata, reRunEpisode: ComputerChroniclesRerunEpisodeMetadata): Promise<boolean> {
        if (window.confirm(`Video file and random access will be moved from episode CC${sourceEpisode.episodeNumber} to CC${reRunEpisode.episodeNumber}`)) {
            console.log(`Changing target ep iaIdentifier from ${reRunEpisode.iaIdentifier} to ${sourceEpisode.iaIdentifier}`);
            reRunEpisode.iaIdentifier = sourceEpisode.iaIdentifier;
            sourceEpisode.iaIdentifier = null;
            reRunEpisode.randomAccess = sourceEpisode.randomAccess;
            sourceEpisode.randomAccess = null;
            reRunEpisode.issues = sourceEpisode.issues;
            sourceEpisode.issues = {};
            reRunEpisode.randomAccessHost = sourceEpisode.randomAccessHost;
            sourceEpisode.randomAccess = [];
            try {
                await this.api.saveEpisode(sourceEpisode);
                await this.api.saveEpisode(reRunEpisode);
                await this.reloadApiData();
            } catch (err: any) {
                alert(err.message);
                console.error(err.message);
                return false;
            }
            return true;
        } else {
            return false;
        }
    }

    public render() {
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
                        allEpisodes={this.state.episodes}
                        episodeList={this.state.showReRuns ? this.state.episodes : this.state.episodes.filter(ep => !ep.isReRun)}
                        onSelectEpisode={this.setEditedEpisodeByNumber.bind(this)}
                        episodeIndex={this.state.episodeIndex}
                    />
                </div>;

            case Page.EDITING:
                const episodeData = this.state.editingEpisode;
                if (episodeData) {
                    if (episodeData.isReRun) {
                        if (episodeData.reRunOf) {
                            return "";
                            /*return <div className="main-editing">
                                {loginComponent}
                                <ComputerChroniclesReRunEpisodeComponent
                                    episodeData={episodeData}
                                    originalEpisode={this.state.episodeIndex[episodeData.reRunOf]}
                                    editable={this.state.loggedIn}
                                    onCancel={this.handleCancel.bind(this)}
                                    tags={this.state.tags}
                                    onSaveEpisodeData={this.handleSaveEpisode.bind(this)}
                                />
                            </div>;*/
                        } else {
                            return <div className="main-editing">
                                {loginComponent}
                                <ComputerChroniclesUnknownReRunComponent
                                    episodeData={episodeData}
                                    onCancel={this.handleCancel.bind(this)}
                                    onSaveEpisodeData={this.handleSaveEpisode.bind(this)}
                                    editable={this.state.loggedIn}
                                    episodeNumbers={this.state.episodes.filter(ep => !ep.isReRun).map(ep => ep.episodeNumber)}
                                />
                            </div>;
                        }
                    } else {
                        return <div className="main-editing">
                            {loginComponent}
                            <ComputerChroniclesOriginalEpisodeComponent
                                episodeData={episodeData}
                                episodeReRuns={getReRuns(episodeData.episodeNumber, this.state.episodes)}
                                editable={this.state.loggedIn}
                                onCancel={this.handleCancel.bind(this)}
                                onSaveEpisodeData={this.handleSaveEpisode.bind(this)}
                                tags={this.state.tags}
                                onChangeReRun={this.handleChangeReRun.bind(this)}
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
                        onSelectEpisode={this.setEditedEpisodeByNumber.bind(this)}
                    />
                </div>;
        }
    }
}

export default App;