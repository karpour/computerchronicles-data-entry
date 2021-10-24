import { ChangeEvent, Component, FormEvent } from "react";
import './TagInputComponent.css';
import React from "react";

type TagInputComponentProps = {
    name: string,
    tags: string[];
    autoCompleteSuggestions: string[];
    onTagAdd: (tag: string) => void;
    onTagDelete: (index: number) => void;
    backSpaceTagDelete?: boolean;
    delimiters?: string[];
    placeHolder?: string;
};

type TagInputComponentState = {
    canAddTags: boolean;
    addedTags: string[];
    newTag: string;
};

export class TagInputComponent extends Component<TagInputComponentProps, TagInputComponentState> {
    private className = "tag-input-component";
    private delimiters: string[];
    private keyPress: boolean;
    private lastAddedTag: string | null;

    public constructor(props: any) {
        super(props);
        this.delimiters = props.delimiters ?? [",", "Enter"];
        this.keyPress = false;
        this.lastAddedTag = null;

        this.state = {
            canAddTags: true,
            addedTags: this.props.tags,
            newTag: ""
        };
    }

    private addTag(tag: string) {
        console.log(`Tag added: ${tag}`);
        this.lastAddedTag = tag;
        if (!this.props.tags.includes(tag)) {
            this.props.tags.push(tag);
            this.props.autoCompleteSuggestions.push(tag);
        }
        this.setState({
            addedTags: [...this.props.tags],
            newTag: ""
        });
    }


    public handleKeyPress(e: React.KeyboardEvent<HTMLInputElement> | React.KeyboardEvent<HTMLDataListElement>) {
        console.log(e.key);
        //console.log(this.state.newTag);
        if (e.key) {
            if (this.delimiters.includes(e.key) && this.state.newTag !== '') {
                e.preventDefault();
                console.log("Adding tag from handleKeyPress");

                this.addTag(this.state.newTag);
            }
            this.keyPress = true;
        }
    }

    protected handleValueChange(e: ChangeEvent<HTMLInputElement>) {
        const t = e.target.value;
        if (t !== this.lastAddedTag) {
            console.log(`Value changed: ${t}`);
            this.setState({ newTag: t });
        }
    };

    protected handleInput(e: FormEvent<HTMLInputElement>) {
        console.log(e);
        let t = (e as any).target.value;
        if (this.keyPress === false) {
            //console.log("Adding tag from handleSelectAutoCompleteTag");
            //this.addTag(t);
        }
        this.keyPress = false;
    }

    public render() {
        const selectedTags = this.state.addedTags.map(tagText => (<div className="tag-input-component-tag">{tagText}</div>));


        return (<div className={this.className}>
            <div>{selectedTags}</div>

            <input
                type="text"
                className="tag-input-component-input"
                value={this.state.newTag}
                list={`${this.props.name}-datalist`}
                id={`${this.props.name}-tag-input`}
                name={`${this.props.name}-tag-input`}
                onChange={this.handleValueChange.bind(this)}
                onKeyPress={this.handleKeyPress.bind(this)}
                onInput={this.handleInput.bind(this)}
            />

            <datalist id={`${this.props.name}-datalist`} >
                {this.props.autoCompleteSuggestions.map((suggestion: string) =>
                    <option key={suggestion} value={suggestion} />
                )}
            </datalist>
        </div>);
    }
}

export default TagInputComponent;