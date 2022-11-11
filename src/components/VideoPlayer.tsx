import { ChangeEvent, Component, createRef } from "react";
import { ComputerChroniclesEpisodeIssues } from "../ccapi/ComputerChroniclesEpisodeMetadata";

type VideoPlayerProps = {
    videoId: string | null;
    issues: ComputerChroniclesEpisodeIssues;
    editable: boolean;
    videoFromEpisode: Number | null;
    onIssuesUpdate: (issues: ComputerChroniclesEpisodeIssues) => void;
    onIaIdentifierUpdate: (identifier: string | null) => void;
};

type VideoPlayerState = {
    isEditingIaIdentifier: boolean;
    iaIdentifier: string;
};

export default class VideoPlayer extends Component<VideoPlayerProps, VideoPlayerState> {
    private iaIdentifierRef;

    public constructor(props: VideoPlayerProps) {
        super(props);
        this.state = {
            isEditingIaIdentifier: false,
            iaIdentifier: props.videoId ?? "",
        };
        this.iaIdentifierRef = createRef<HTMLInputElement>();
    }

    protected handleCheckBoxClick(e: ChangeEvent<HTMLInputElement>) {
        let newIssues: ComputerChroniclesEpisodeIssues = Object.assign({}, this.props.issues);

        switch (e.target.id) {
            case "audioIssues": newIssues.audioIssues = e.target.checked; break;
            case "noAudio": newIssues.noAudio = e.target.checked; break;
            case "videoIssues": newIssues.videoIssues = e.target.checked; break;
        }

        this.props.onIssuesUpdate(newIssues);
    }

    public saveIaIdentifier() {
        let newVal: string | null = this.state.iaIdentifier;
        if (newVal === "") newVal = null;
        this.props.onIaIdentifierUpdate(newVal);
    }

    public handleIaIdentifierChange(e: ChangeEvent<HTMLInputElement>) {
        console.log(`iaIdentifier set to "${e.target.value}"`);
        this.setState({
            ...this.state,
            iaIdentifier: e.target.value
        });
    }

    public setEditIaIdentifier() {
        this.setState({
            ...this.state,
            isEditingIaIdentifier: true
        });
    }

    public cancelEditIaIdentifier() {
        this.setState({
            ...this.state,
            isEditingIaIdentifier: false
        });
    }

    public get editable(): boolean {
        return this.props.editable && this.props.videoFromEpisode == null;
    }

    public render(): JSX.Element {
        return (<div className="video grid-element">
            <div className="media-container">
                {this.props.videoId && <iframe title="video" src={"https://archive.org/embed/" + this.props.videoId}></iframe>}
                {!this.props.videoId && <span>MISSING VIDEO</span>}
            </div>

            <div className="video-checkbox">
                <input type="checkbox" id="videoIssues" name="videoIssues" onChange={this.handleCheckBoxClick.bind(this)} checked={this.props.issues.videoIssues} disabled={!this.editable}></input>
                <label htmlFor="videoIssues">Video issues</label>
            </div>
            <div className="video-checkbox">
                <input type="checkbox" id="audioIssues" name="audioIssues" onChange={this.handleCheckBoxClick.bind(this)} checked={this.props.issues.audioIssues} disabled={!this.editable}></input>
                <label htmlFor="audioIssues">Audio issues</label>
            </div>
            <div className="video-checkbox">
                <input type="checkbox" id="noAudio" name="noAudio" onChange={this.handleCheckBoxClick.bind(this)} checked={this.props.issues.noAudio} disabled={!this.editable}></input>
                <label htmlFor="noAudio">No Audio</label>
            </div>
            {this.state.isEditingIaIdentifier ? <div className="ia-identifier-editor">
                <input type="text" ref={this.iaIdentifierRef} value={this.state.iaIdentifier} onChange={this.handleIaIdentifierChange.bind(this)}></input>
                <button onClick={this.saveIaIdentifier.bind(this)}>Apply</button>
                <button onClick={this.cancelEditIaIdentifier.bind(this)}>Cancel</button>
            </div>
                :
                <div className="ia-identifier">
                    {this.props.videoFromEpisode && <b>⚠️Video from Episode <a href={`./?ep=${this.props.videoFromEpisode}`}>{`CC${this.props.videoFromEpisode}`}</a>: </b>}
                    {this.props.videoId ? <b><a href={`https://archive.org/details/${this.props.videoId}`} target="_blank" rel="noreferrer">{this.props.videoId ?? ""}</a></b> : <b>NO VIDEOID</b>}
                    {this.props.editable && <button onClick={this.setEditIaIdentifier.bind(this)}>edit</button>}
                </div>}
        </div>);
    }
}