import { Component } from "react";
import { ComputerChroniclesEpisodeMetadata } from "../ccapi/ComputerChroniclesEpisodeMetadata";
import dateToYYYYMMDD from "../dateToYYYYMMDD";

type ComputerChroniclesEpisodeDateComponentProps = {
    episodeList: ComputerChroniclesEpisodeMetadata[];
    onSelectEpisode: (episodeNumber: number) => void;
};

export function getEpisodeTitle(episode: ComputerChroniclesEpisodeMetadata): string {
    if (!episode.isReRun) {
        return episode.title;
    } else {
        if (episode.reRunOf) {
            return `Re-run of CC${episode.reRunOf}`;
        } else {
            return `Re-run [unknown]`;
        }
    }
}

export function getDayDifference(date1: Date, date2: Date): number {
    return Math.round((date2.getTime() - date1.getTime()) / (1000 * 3600 * 24));
}


export default class ComputerChroniclesEpisodeDateComponent extends Component<ComputerChroniclesEpisodeDateComponentProps> {


    public render() {


        let lastSeason = 0;
        let lastDate: Date;
        let episodeListElements: JSX.Element[] = this.props.episodeList.map(
            (episode, idx) => {

                let title: string = getEpisodeTitle(episode);

                let currentSeason = episode.episodeNumber - (episode.episodeNumber % 100);

                //let seasonChange = false;
                //if (lastSeason !== currentSeason && episode.episodeNumber !== 101) {
                //    seasonChange = true;
                //}

                lastSeason = currentSeason;
                let dateUnsure: boolean = false;
                let currentDate: Date;


                if (episode.airingDate) {
                    currentDate = new Date(episode.airingDate);
                } else {
                    dateUnsure = true;
                    // Add 7 days to prev date
                    currentDate = new Date(lastDate.getTime() + (7 * 3600 * 24 * 1000));
                }

                let dateFormatted = dateToYYYYMMDD(currentDate);
                let daysSinceLastEpisode = 0;

                let daysClasses = "";
                if (lastDate) {
                    daysSinceLastEpisode = getDayDifference(lastDate, currentDate);
                    if (daysSinceLastEpisode <= 0) {
                        daysClasses = `days-0-or-fewer`;
                    } else if (daysSinceLastEpisode === 7) {
                        daysClasses = `days-7`;
                    } else {
                        daysClasses = `days-other`;
                    }
                }

                lastDate = currentDate;

                return (
                    <div>
                        {episode.episodeNumber !== 101 &&

                            <div className={`days-gap ${daysClasses}`}>{daysSinceLastEpisode} days</div>
                        }
                        <div className={`episode-list-item`} key={`CC${episode.episodeNumber}`} onClick={() => this.props.onSelectEpisode(episode.episodeNumber)}>
                            <span className={`episode-list-date ${dateUnsure ? "date-unsure" : ""}`}>{dateFormatted}</span>
                            <span className={`episode-list-number`}>{episode.episodeNumber}</span>
                            <span className="episode-list-title">{title}</span>
                        </div>
                    </div>
                );
            }
        );


        return <div className="episode-list-container">{episodeListElements}</div>;
    }
}