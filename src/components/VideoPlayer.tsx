import { ChangeEvent, Component } from "react";
import { ComputerChroniclesEpisodeIssues } from "../ccapi/ComputerChroniclesEpisodeMetadata";

type VideoPlayerProps = {
    videoId: string | null;
    issues: ComputerChroniclesEpisodeIssues;
    editable: boolean;
    onIssuesUpdate: (issues: ComputerChroniclesEpisodeIssues) => void;
};

export default class VideoPlayer extends Component<VideoPlayerProps> {

    protected handleCheckBoxClick(e: ChangeEvent<HTMLInputElement>) {
        console.log(e);
        let newIssues: ComputerChroniclesEpisodeIssues = Object.assign({}, this.props.issues);

        switch (e.target.id) {
            case "audioIssues": newIssues.audioIssues = e.target.checked; break;
            case "noAudio": newIssues.noAudio = e.target.checked; break;
            case "videoIssues": newIssues.videoIssues = e.target.checked; break;
        }

        this.props.onIssuesUpdate(newIssues);
    }

    public render(): JSX.Element {
        return (<div className="video grid-element">
            <div className="media-container">
                {this.props.videoId && <iframe title="video" src={"https://archive.org/embed/" + this.props.videoId}></iframe>}
                {!this.props.videoId && <span>MISSING VIDEO</span>}
            </div>

            <div className="video-checkbox">
                <input type="checkbox" id="videoIssues" name="videoIssues" onChange={this.handleCheckBoxClick.bind(this)} checked={this.props.issues.videoIssues} disabled={!this.props.editable}></input>
                <label htmlFor="videoIssues">Video issues</label>
            </div>
            <div className="video-checkbox">
                <input type="checkbox" id="audioIssues" name="audioIssues" onChange={this.handleCheckBoxClick.bind(this)} checked={this.props.issues.audioIssues} disabled={!this.props.editable}></input>
                <label htmlFor="audioIssues">Audio issues</label>
            </div>
            <div className="video-checkbox">
                <input type="checkbox" id="noAudio" name="noAudio" onChange={this.handleCheckBoxClick.bind(this)} checked={this.props.issues.noAudio} disabled={!this.props.editable}></input>
                <label htmlFor="noAudio">No Audio</label>
            </div>
            {this.props.videoId && <div className="ia-identifier"><b><a href={`https://archive.org/details/${this.props.videoId}`} target="_blank">{this.props.videoId}</a></b></div>}
        </div>);
    }
}