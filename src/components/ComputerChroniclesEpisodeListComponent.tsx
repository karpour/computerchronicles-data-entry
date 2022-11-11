import { Component } from "react";
import { getReRuns } from "../App";
import { ComputerChroniclesEpisodeIndex, ComputerChroniclesEpisodeMetadata, ComputerChroniclesEpisodeNumber } from "../ccapi/ComputerChroniclesEpisodeMetadata";

type ComputerChroniclesEpisodeListComponentProps = {
    episodeList: ComputerChroniclesEpisodeMetadata[];
    allEpisodes: ComputerChroniclesEpisodeMetadata[];
    episodeIndex: ComputerChroniclesEpisodeIndex;
    onSelectEpisode: (episodeNumber: number) => void;
};

function getSeason(episodeNumber: ComputerChroniclesEpisodeNumber): number {
    return (episodeNumber - (episodeNumber % 100)) / 100;
}

export default class ComputerChroniclesEpisodeListComponent extends Component<ComputerChroniclesEpisodeListComponentProps> {



    public render() {
        const episodeIndex: ComputerChroniclesEpisodeIndex = this.props.episodeIndex;
        const allEpisodes: ComputerChroniclesEpisodeMetadata[] = this.props.allEpisodes;
        let episodeListElements: JSX.Element[] = this.props.episodeList.map(
            (episode, idx, arr) => {

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
                if (idx > 0 && getSeason(episode.episodeNumber) !== getSeason(arr[idx - 1].episodeNumber)) {
                    seasonChange = true;
                }

                let missingEl: string | null = null;
                if (!episode.iaIdentifier) {
                    missingEl = "episode-list-missing";
                    if (!episode.isReRun) {
                        const reRuns = getReRuns(episode.episodeNumber, allEpisodes).filter(el => el.iaIdentifier);
                        if (reRuns.length > 0) {
                            missingEl = "episode-rerun-only";
                        }
                    } else if (episode.isReRun && episode.reRunOf && episodeIndex[episode.reRunOf]?.iaIdentifier) {
                        missingEl = "episode-original-only";
                    } 
                }

                return (
                    <div className={`episode-list-item${seasonChange ? " season-separator" : ""}`} key={`CC${episode.episodeNumber}`} onClick={() => this.props.onSelectEpisode(episode.episodeNumber)}>
                        <span className={`episode-list-number ${rerunTag}`}>{episode.episodeNumber}</span>
                        <span className="episode-list-title">{title}</span>
                        {(missingEl !== null) && (<span className={missingEl}></span>)}
                        <span className={`episode-status episode-status-${episode.status}`}>{episode.status}</span>
                    </div >
                );
            }
        );


        return <div className="episode-list-container">{episodeListElements}</div>;
    }
}