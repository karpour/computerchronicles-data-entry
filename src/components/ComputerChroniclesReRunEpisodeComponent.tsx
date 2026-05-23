import '../App.css';
import VideoPlayer from './VideoPlayer';
import React, { ChangeEvent } from 'react';
import TagComponent from './TagComponent';
import DualFieldComponent from './DualFieldComponent';
import {
  ComputerChroniclesEpisodeIssues,
  ComputerChroniclesEpisodeStatus,
  ComputerChroniclesFeaturedProduct,
  ComputerChroniclesGuest,
  ComputerChroniclesLocation,
  ComputerChroniclesOriginalEpisodeMetadata,
  ComputerChroniclesRerunEpisodeMetadata,
  COMPUTERCHRONICLES_EPISODE_STATUSES
} from '../ccapi/ComputerChroniclesEpisodeMetadata';

type ComputerChroniclesOriginalEpisodeComponentProps = {
  episodeData: ComputerChroniclesRerunEpisodeMetadata;
  originalEpisodeReRuns: ComputerChroniclesRerunEpisodeMetadata[];
  onChangeReRun: (sourceEpisode: ComputerChroniclesRerunEpisodeMetadata, reRunEpisode: ComputerChroniclesRerunEpisodeMetadata) => Promise<boolean>,
  onCancel: () => void;
  editable: boolean;
  onSaveEpisodeData: (newData: ComputerChroniclesRerunEpisodeMetadata) => Promise<void>;
  tags: string[];
  originalEpisodeData: ComputerChroniclesOriginalEpisodeMetadata;
};

type ComputerChroniclesOriginalEpisodeComponentState = {
  episodeData: ComputerChroniclesRerunEpisodeMetadata;
  selectedStatus: ComputerChroniclesEpisodeStatus | "";
  savedSuccess: boolean;
  randomAccessText: string;
};

class ComputerChroniclesReRunEpisodeComponent extends React.Component<ComputerChroniclesOriginalEpisodeComponentProps, ComputerChroniclesOriginalEpisodeComponentState> {

  public constructor(props: ComputerChroniclesOriginalEpisodeComponentProps) {
    super(props);
    this.state = {
      episodeData: props.episodeData,
      selectedStatus: props.episodeData.status ?? "",
      savedSuccess: false,
      randomAccessText: props.episodeData.randomAccess ? props.episodeData.randomAccess.join('\n') : ""
    };
  }

  private getReRunVideoEp(): ComputerChroniclesRerunEpisodeMetadata | null {
    return this.props.originalEpisodeReRuns.find(ep => ep.iaIdentifier) ?? null;
  }

  private getReRunIaIdentifier(): string | null {
    return this.getReRunVideoEp()?.iaIdentifier ?? null;
  }

  private setEpisodeState(newState: Partial<ComputerChroniclesOriginalEpisodeMetadata>) {
    let episodeData = { ...this.state.episodeData };
    Object.assign(episodeData, newState);
    this.setState({ episodeData: episodeData });
  }

  private handleEpisodeTagChange(tags: string[]) {
    //console.log(tags);
    this.setEpisodeState({ tags: tags });
  }

  private handleRandomAccessHostFieldChanged(index: number, newField: ComputerChroniclesGuest | null) {
    let oldHostList = this.state.episodeData.randomAccessHost ? [this.state.episodeData.randomAccessHost] : [];
    let newHostList = this.updateFieldList(oldHostList, index, newField);

    if (newHostList) {
      this.setEpisodeState({ randomAccessHost: newHostList[0] });
    } else {
      this.setEpisodeState({ randomAccessHost: null });
    }
  }



  private updateFieldList<T>(list: T[], index: number, newField: T | null): T[] {
    let newList = [...list];
    if (newField == null && index < newList.length) {
      //console.log(`Deleted listItem ${index}: ${newList[index]}`);
      newList.splice(index, 1);
    } else if (index >= newList.length - 1 && newField) {
      //console.log(`Added listItem ${index}: ${newList[index]}`);
      newList.push(newField);
    } else if (index < newList.length - 1 && newField) {
      //console.log(`Modified listItem ${index}: ${newList[index]}`);
      newList[index] = newField;
    }
    return newList;
  }


  protected handleIssuesUpdate(issues: ComputerChroniclesEpisodeIssues) {
    console.log(issues);
    this.setEpisodeState({ issues: issues });
  }

  protected handleNotesChange(e: ChangeEvent<HTMLTextAreaElement>) {
    this.setEpisodeState({
      notes: e.target.value
    });
  }

  protected handleRandomAccessChange(e: ChangeEvent<HTMLTextAreaElement>) {
    this.setState({
      randomAccessText: e.target.value
    });
  }

  protected handleAirDateChange(e: ChangeEvent<HTMLInputElement>) {
    this.setEpisodeState({
      airingDate: e.target.value
    });
  }

  protected handleProdDateChange(e: ChangeEvent<HTMLInputElement>) {
    this.setEpisodeState({
      productionDate: e.target.value
    });
  }

  protected handleEpisodeTitleChange(e: ChangeEvent<HTMLInputElement>) {
    this.setEpisodeState({
      title: e.target.value
    });
  }

  protected handleReRunChange(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    const button: HTMLButtonElement = e.currentTarget;
    button.getAttribute("data-rerunepisode");
  }

  protected handleIaIdentifierUpdate(identifier: string | null) {
    console.log(`Updated IA Identifier to ${identifier}`);
    this.setEpisodeState({
      iaIdentifier: identifier ? identifier : null
    });
  }

  protected handleEpisodeStatusChange(e: ChangeEvent<HTMLSelectElement>) {
    this.setEpisodeState({ status: e.target.value as any });
    this.setState({ selectedStatus: e.target.value as any });
  }

  protected handleSave() {
    const randomAccess = this.state.randomAccessText ? this.state.randomAccessText.split('\n').map(item => item.trim()).filter(item => item !== "") : null;
    this.setEpisodeState({
      randomAccess: randomAccess
    });
    if (this.state.selectedStatus !== "") {
      this.props.onSaveEpisodeData({
        ...this.state.episodeData,
        randomAccess: randomAccess
      }).then(() => {
        console.log("Setting savedSuccess to true");
        this.setState({ savedSuccess: true });
      }).catch(err => {
        window.alert((err as Error).message);
      });
    } else {
      window.alert("Select Episode Status first");
    }
  }

  public render() {
    const statusOptions: JSX.Element[] = COMPUTERCHRONICLES_EPISODE_STATUSES.map(
      s => <option value={s}>{s}</option>
    );

    let videoEpisode: ComputerChroniclesOriginalEpisodeMetadata | ComputerChroniclesRerunEpisodeMetadata = this.state.episodeData;
    let videoFromEpisode: number | null = null;
    if (!videoEpisode.iaIdentifier) {
      for (let ep of [this.props.originalEpisodeData, ...this.props.originalEpisodeReRuns]) {
        if (ep.iaIdentifier) {
          videoEpisode = ep;
          videoFromEpisode = ep.episodeNumber;
        }
      }
    }

    return (
      <div className="grid-container">
        <div className="header grid-element">
          <h1>CC{this.state.episodeData.episodeNumber} - {this.props.originalEpisodeData.title}</h1>
        </div>

        <div className="hosts grid-element">
          <h2>Host</h2>
          <DualFieldComponent<ComputerChroniclesGuest, "name", "role">
            name="cc-host"
            title1="Name"
            title2="Company/Role"
            fieldName1="name"
            fieldName2="role"
            maxItems={1}
            fields={this.props.originalEpisodeData.host ? [this.props.originalEpisodeData.host] : []}
            canAddOrRemoveFields={false}
            onFieldChanged={() => { }}
          />

          <div className="spacer"></div>

          <h2>Co-Host(s)</h2>
          <DualFieldComponent<ComputerChroniclesGuest, "name", "role">
            name="cc-cohosts"
            title1="Name"
            title2="Company/Role"
            fieldName1="name"
            fieldName2="role"
            fields={this.props.originalEpisodeData.coHosts}
            canAddOrRemoveFields={false}
            onFieldChanged={() => { }}
          />

          <div className="spacer"></div>

          <h2>Guests &amp; People in the episode</h2>
          <DualFieldComponent<ComputerChroniclesGuest, "name", "role">
            name="cc-guests"
            title1="Name"
            title2="Company/Role"
            fieldName1="name"
            fieldName2="role"
            fields={this.props.originalEpisodeData.guests}
            canAddOrRemoveFields={false}
            onFieldChanged={() => { }}
          />

          <div className="spacer"></div>

          <h2>Random Access Segment Host (if applicable)</h2>
          <DualFieldComponent<ComputerChroniclesGuest, "name", "role">
            name="cc-randomaccesshost"
            title1="Name"
            title2="Company/Role"
            fieldName1="name"
            fieldName2="role"
            maxItems={1}
            fields={this.state.episodeData.randomAccessHost ? [this.state.episodeData.randomAccessHost] : []}
            canAddOrRemoveFields={this.state.episodeData.iaIdentifier !== null && this.props.editable}
            onFieldChanged={this.handleRandomAccessHostFieldChanged.bind(this)}
          />

          <div className="spacer"></div>

          <h2>Re-run of</h2>
          <a href={`./?ep=${this.props.originalEpisodeData.episodeNumber}`}>{`${this.props.originalEpisodeData.episodeNumber}`}</a>
          <h2>Other Re-runs</h2>
          <ul>
            {this.props.originalEpisodeReRuns.map(reRun => <li><a href={`./?ep=${reRun.episodeNumber}`}>{`${reRun.episodeNumber}`}</a> {this.state.episodeData.iaIdentifier && <button onClick={() => this.props.onChangeReRun(this.props.episodeData, reRun)}>move video to this ep</button>}</li>)}
          </ul>
        </div>


        <div className="tags grid-element">
          <h2>Tags</h2>
          <TagComponent
            name="episode-tags"
            editable={false}
            autoCompleteSuggestions={this.props.originalEpisodeData.tags}
            onTagChange={this.handleEpisodeTagChange.bind(this)}
            onAddTag={()=>{}}
            className="episode-tags"
            onDeleteTag={()=>{}}
            tags={this.props.originalEpisodeData.tags}
          />
        </div>

        <VideoPlayer
          videoId={this.state.episodeData.iaIdentifier ?? videoEpisode.iaIdentifier}
          issues={this.state.episodeData.iaIdentifier ? (this.state.episodeData.issues ?? {}) : (this.getReRunVideoEp()?.issues ?? {})}
          onIssuesUpdate={this.handleIssuesUpdate.bind(this)}
          onIaIdentifierUpdate={this.handleIaIdentifierUpdate.bind(this)}
          editable={this.props.editable}
          videoFromEpisode={videoFromEpisode}
        />

        <div className="dates grid-element">
          <div className="date-container">
            <h2><label htmlFor="airDate">Airing date</label></h2>
            <input type="date" id="airDate" name="airDate"
              readOnly={!this.props.editable}
              value={this.state.episodeData.airingDate}
              min={this.state.episodeData.productionDate ? this.state.episodeData.productionDate : "1983-01-01"}
              max="2003-01-01"
              onChange={this.handleAirDateChange.bind(this)}
            />
          </div>

          <div className="date-container">
            <h2><label htmlFor="prodDate">Production date</label></h2>
            <input type="date" id="prodDate" name="prodDate"
              readOnly={!this.props.editable}
              value={this.state.episodeData.productionDate}
              min="1983-01-01"
              max="2003-01-01"
              onChange={this.handleProdDateChange.bind(this)}
            />
          </div>
        </div>

        <div className="products grid-element">
          <h2>Featured products</h2>
          <DualFieldComponent<ComputerChroniclesFeaturedProduct, "company", "product">
            name="cc-featured-products"
            title1="Company"
            title2="Product Name"
            fieldName1="company"
            fieldName2="product"
            fields={this.props.originalEpisodeData.featuredProducts}
            canAddOrRemoveFields={this.props.editable}
            onFieldChanged={() => { }}
          />

          <div className="spacer"></div>

          <h2>Featured events/locations</h2>
          <DualFieldComponent<ComputerChroniclesLocation, "name", "location">
            name="cc-featured-products"
            title1="Company"
            title2="Product Name"
            fieldName1="name"
            fieldName2="location"
            fields={this.props.originalEpisodeData.locations}
            canAddOrRemoveFields={false}
            onFieldChanged={() => { }}
          />

          <div className="spacer"></div>
          <h2>Notes / ToDo</h2>
          <textarea
            className="notes"
            readOnly={!this.props.editable}
            value={this.state.episodeData.notes ?? ""}
            onChange={this.handleNotesChange.bind(this)}
            placeholder="Internal notes, such as 'metadata complete until at 9:55' and things that still need to be changed"
          />
        </div>

        <div className="description grid-element">
          <h2>Description</h2>
          <textarea
            readOnly={true}
            value={this.props.originalEpisodeData.description}
          />
          <h2>Random Access bullet points (one per line)</h2>
          <textarea
            readOnly={!(this.state.episodeData.iaIdentifier !== null && this.props.editable)}
            value={this.state.randomAccessText}
            onChange={this.handleRandomAccessChange.bind(this)}
          />
        </div>

        {this.props.editable && (
          <div className="cancel-save grid-element">
            <select name="status"
              id="status-select"
              className={`select-status ${this.state.selectedStatus === "" ? " unselected-status" : ""}`}
              value={this.state.selectedStatus}
              onChange={this.handleEpisodeStatusChange.bind(this)}>
              {this.state.selectedStatus === "" && (<option value="">SELECT STATUS</option>)}
              {statusOptions}
            </select>
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

export default ComputerChroniclesReRunEpisodeComponent;
