import '../App.css';
import React, { ChangeEvent } from 'react';
import {
  ComputerChroniclesEpisodeNumber,
  ComputerChroniclesEpisodeStatus,
  ComputerChroniclesRerunEpisodeMetadata,
  parseComputerChroniclesEpisodeNumber
} from '../ccapi/ComputerChroniclesEpisodeMetadata';

type ComputerChroniclesUnknownReRunComponentProps = {
  episodeData: ComputerChroniclesRerunEpisodeMetadata;
  onCancel: () => void;
  editable: boolean;
  onSaveEpisodeData: (newData: ComputerChroniclesRerunEpisodeMetadata) => Promise<void>;
  episodeNumbers: ComputerChroniclesEpisodeNumber[];
};

type ComputerChroniclesUnknownReRunComponentState = {
  episodeData: ComputerChroniclesRerunEpisodeMetadata;
  savedSuccess: boolean;
  randomAccessText: string;
  selectedEpisode: string;
  selectedStatus: ComputerChroniclesEpisodeStatus | "";
};

class ComputerChroniclesUnknownReRunComponent extends React.Component<ComputerChroniclesUnknownReRunComponentProps, ComputerChroniclesUnknownReRunComponentState> {

  public constructor(props: ComputerChroniclesUnknownReRunComponentProps) {
    super(props);
    this.state = {
      episodeData: props.episodeData,
      selectedEpisode: "",
      savedSuccess: false,
      selectedStatus: "",
      randomAccessText: props.episodeData.randomAccess ? props.episodeData.randomAccess.join('\n') : ""
    };
  }

  private setEpisodeState(newState: Partial<ComputerChroniclesRerunEpisodeMetadata>) {
    let episodeData = { ...this.state.episodeData };
    Object.assign(episodeData, newState);
    this.setState({ episodeData: episodeData });
  }

  protected handleReRunOfChange(e: ChangeEvent<HTMLSelectElement>) {
    this.setState({
      selectedEpisode: e.target.value
    });
    this.setEpisodeState({
      reRunOf: parseComputerChroniclesEpisodeNumber(e.target.value)
    });
  }

  protected handleSave() {
    this.setEpisodeState({
      status: "unknown"
    });

    this.props.onSaveEpisodeData({
      ...this.state.episodeData
    }).then(() => {
      console.log("Setting savedSuccess to true");
      this.setState({ savedSuccess: true });
    }).catch(err => {
      window.alert((err as Error).message);
    });

  }

  public render() {
    const episodeOptions: JSX.Element[] = this.props.episodeNumbers.map(
      epNum => <option value={`${epNum}`}>{`CC${epNum}`}</option>
    );

    return (
      <div className="grid-container">
        <div className="header grid-element">
          Re-run of
          <select
            id="status-select"

            value={this.state.selectedEpisode}
            onChange={this.handleReRunOfChange.bind(this)}
          >
            <option value="">SELECT EPISODE</option>
            {episodeOptions}
          </select>
        </div>
        {this.props.editable && (
          <div className="cancel-save grid-element">
            <button className="cancel-button" onClick={this.props.onCancel}>CANCEL</button>
            <button className="save-button" onClick={this.handleSave.bind(this)}>{this.state.savedSuccess ? "SAVED ✔️" : "SAVE"}</button>
          </div>
        )}

        <div className="blank">
        </div>

      </div>
    );
  }
}

export default ComputerChroniclesUnknownReRunComponent;
