import '../App.css';
import VideoPlayer from './VideoPlayer';
import React, { ChangeEvent } from 'react';
import TagComponent from './TagComponent';
import DualFieldComponent from './DualFieldComponent';
import { ComputerChroniclesEpisodeIssues, ComputerChroniclesEpisodeStatus, ComputerChroniclesFeaturedProduct, ComputerChroniclesGuest, ComputerChroniclesLocation, ComputerChroniclesOriginalEpisodeMetadata, COMPUTERCHRONICLES_EPISODE_STATUSES } from '../ccapi/ComputerChroniclesEpisodeMetadata';

type ComputerChroniclesOriginalEpisodeComponentProps = {
  episodeData: ComputerChroniclesOriginalEpisodeMetadata;
  onCancel: () => void;
  onSaveEpisodeData: (newData: ComputerChroniclesOriginalEpisodeMetadata) => void;
};

type ComputerChroniclesOriginalEpisodeComponentState = {
  episodeData: ComputerChroniclesOriginalEpisodeMetadata;
  editable: boolean;
  selectedStatus: ComputerChroniclesEpisodeStatus | "";
};

class ComputerChroniclesOriginalEpisodeComponent extends React.Component<ComputerChroniclesOriginalEpisodeComponentProps, ComputerChroniclesOriginalEpisodeComponentState> {

  public constructor(props: ComputerChroniclesOriginalEpisodeComponentProps) {
    super(props);
    this.state = {
      episodeData: props.episodeData,
      editable: true,
      selectedStatus: ""
    };
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

  private handleEpisodeTagDelete(tagIndex: number) {
    //console.log(`Deleted tag ${tagIndex}`);
    let newTags = [...this.state.episodeData.tags];
    newTags.splice(tagIndex, 1);
    this.setEpisodeState({ tags: newTags });
  }

  private handleEpisodeTagAdd(tag: string) {
    console.log(`Adding tag: ${tag}`);
    this.setEpisodeState({ tags: [...this.state.episodeData.tags, tag] });
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

  private handleGuestFieldChanged(index: number, newField: ComputerChroniclesGuest | null) {
    this.setEpisodeState({ guests: this.updateFieldList(this.state.episodeData.guests, index, newField) });
  }


  private handleCoHostFieldChanged(index: number, newField: ComputerChroniclesGuest | null) {
    this.setEpisodeState({ coHosts: this.updateFieldList(this.state.episodeData.coHosts, index, newField) });

  }

  private handleFeaturedProductFieldChanged(index: number, newField: ComputerChroniclesFeaturedProduct | null) {
    this.setEpisodeState({ featuredProducts: this.updateFieldList(this.state.episodeData.featuredProducts, index, newField) });
  }

  private handleLocationChanged(index: number, newField: ComputerChroniclesLocation | null) {
    this.setEpisodeState({ locations: this.updateFieldList(this.state.episodeData.locations, index, newField) });
  }

  private handleHostFieldChanged(index: number, newField: ComputerChroniclesGuest | null) {
    let oldHostList = this.state.episodeData.host ? [this.state.episodeData.host] : [];
    let newHostList = this.updateFieldList(oldHostList, index, newField);

    if (newHostList) {
      this.setEpisodeState({ host: newHostList[0] });
    } else {
      this.setEpisodeState({ host: undefined });
    }
  }

  protected handleIssuesUpdate(issues: ComputerChroniclesEpisodeIssues) {
    console.log(issues);
    this.setEpisodeState({ issues: issues });
  }

  protected handleDescriptionChange(e: ChangeEvent<HTMLTextAreaElement>) {
    this.setEpisodeState({
      description: e.target.value
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

  protected handleEpisodeStatusChange(e: ChangeEvent<HTMLSelectElement>) {
    console.log(e.target.value);
    this.setState({ selectedStatus: e.target.value as any });
  }

  protected handleSave() {
    if (this.state.selectedStatus !== "") {
      this.props.onSaveEpisodeData(this.state.episodeData);
    } else {
      window.alert("Select Episode Status first");
    }
  }

  public render() {
    const statusOptions: JSX.Element[] = COMPUTERCHRONICLES_EPISODE_STATUSES.map(
      s => <option value={s}>{s}</option>
    );

    return (
      <div className="grid-container">
        <div className="header grid-element">
          <h1>CC{this.state.episodeData.episodeNumber} - {this.state.episodeData.title}</h1>
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
            fields={this.state.episodeData.host ? [this.state.episodeData.host] : []}
            canAddOrRemoveFields={this.state.editable}
            onFieldChanged={this.handleHostFieldChanged.bind(this)}
          />

          <div className="spacer"></div>

          <h2>Co-Host(s)</h2>
          <DualFieldComponent<ComputerChroniclesGuest, "name", "role">
            name="cc-cohosts"
            title1="Name"
            title2="Company/Role"
            fieldName1="name"
            fieldName2="role"
            fields={this.state.episodeData.coHosts}
            canAddOrRemoveFields={this.state.editable}
            onFieldChanged={this.handleCoHostFieldChanged.bind(this)}
          />

          <div className="spacer"></div>

          <h2>Guests</h2>
          <DualFieldComponent<ComputerChroniclesGuest, "name", "role">
            name="cc-guests"
            title1="Name"
            title2="Company/Role"
            fieldName1="name"
            fieldName2="role"
            fields={this.state.episodeData.guests}
            canAddOrRemoveFields={this.state.editable}
            onFieldChanged={this.handleGuestFieldChanged.bind(this)}
          />
        </div>


        <div className="tags grid-element">
          <h2>Tags</h2>
          <TagComponent
            name="episode-tags"
            editable={this.state.editable}
            autoCompleteSuggestions={["Computer", "Chronicles"]}
            onTagChange={this.handleEpisodeTagChange.bind(this)}
            onAddTag={this.handleEpisodeTagAdd.bind(this)}
            className="episode-tags"
            onDeleteTag={this.handleEpisodeTagDelete.bind(this)}
            tags={this.state.episodeData.tags}
          />
        </div>

        <VideoPlayer
          videoId={this.state.episodeData.iaIdentifier ?? null}
          issues={this.state.episodeData.issues ?? {}}
          iaIdentifier={this.state.episodeData.iaIdentifier ?? "<missing video>"}
          onIssuesUpdate={this.handleIssuesUpdate.bind(this)}
          editable={this.state.editable}
        />

        <div className="dates grid-element">
          <div className="date-container">
            <h2><label htmlFor="airDate">Airing date</label></h2>
            <input type="date" id="airDate" name="airDate"
              readOnly={!this.state.editable}
              value={this.state.episodeData.airingDate}
              min={this.state.episodeData.productionDate ? this.state.episodeData.productionDate : "1983-01-01"}
              max="2003-01-01"
              onChange={this.handleAirDateChange.bind(this)}
            />
          </div>

          <div className="date-container">
            <h2><label htmlFor="prodDate">Production date</label></h2>
            <input type="date" id="prodDate" name="prodDate"
              readOnly={!this.state.editable}
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
            fields={this.state.episodeData.featuredProducts}
            canAddOrRemoveFields={this.state.editable}
            onFieldChanged={this.handleFeaturedProductFieldChanged.bind(this)}
          />

          <div className="spacer"></div>

          <h2>Featured events/locations</h2>
          <DualFieldComponent<ComputerChroniclesLocation, "name", "location">
            name="cc-featured-products"
            title1="Company"
            title2="Product Name"
            fieldName1="name"
            fieldName2="location"
            fields={this.state.episodeData.locations}
            canAddOrRemoveFields={this.state.editable}
            onFieldChanged={this.handleLocationChanged.bind(this)}
          />
        </div>

        <div className="description grid-element">
          <h2>Description</h2>
          <textarea
            readOnly={!this.state.editable}
            value={this.state.episodeData.description}
            onChange={this.handleDescriptionChange.bind(this)}
          />
        </div>

        {this.state.editable && (
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
            <button className="save-button" onClick={this.handleSave.bind(this)}>SAVE</button>
          </div>
        )}


        <div className="blank">
        </div>

      </div>
    );
  }
}

export default ComputerChroniclesOriginalEpisodeComponent;
