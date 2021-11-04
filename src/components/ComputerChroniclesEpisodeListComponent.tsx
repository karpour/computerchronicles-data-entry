import { Component } from "react";
import { ComputerChroniclesEpisodeMetadata } from "../ccapi/ComputerChroniclesEpisodeMetadata";

type ComputerChroniclesEpisodeListComponentProps = {
    episodeList: ComputerChroniclesEpisodeMetadata[];
    onSelectEpisode: (episodeNumber: number) => void;
};

export default class ComputerChroniclesEpisodeListComponent extends Component<ComputerChroniclesEpisodeListComponentProps> {



    public render() {
        let episodeListElements: JSX.Element[] = this.props.episodeList.map(
            (episode, idx) => {

                let title: JSX.Element = <span className="episode-list-title"></span>;
                let rerunTag = "";
                if (!episode.isReRun) {
                    title = <span className="episode-list-title">{episode.title}</span>;
                } else {
                    if (episode.reRunOf) {
                        title = <span className="episode-list-title">Re-run of CC{episode.reRunOf}</span>;
                        rerunTag = "rerun";
                    } else {
                        title = <span className="episode-list-title">Re-run [unknown]</span>;
                        rerunTag = "rerun rerun-unknown";
                    }
                }

                let seasonChange = false;
                if (episode.episodeNumber % 100 === 1 && episode.episodeNumber != 101) {
                    seasonChange = true;
                }

                return (
                    <div className={`episode-list-item${seasonChange ? " season-separator" : ""}`} id={`CC${episode.episodeNumber}`} onClick={() => this.props.onSelectEpisode(episode.episodeNumber)}>
                        <span className={`episode-list-number ${rerunTag}`}>{episode.episodeNumber}</span>
                        <span className="episode-list-title">{title}</span>
                        <span className={`episode-status episode-status-${episode.status}`}>{episode.status}</span>
                    </div >
                );
            }
        );


        return <div className="episode-list-container">{episodeListElements}</div>;
    }
}