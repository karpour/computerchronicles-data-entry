import React, { ChangeEvent, Component, FormEvent } from 'react';


export type TagComponentProps = {
    name: string,
    tags: string[],
    editable: boolean,
    autoCompleteSuggestions: string[];
    className?: string;
    onTagChange: (tagList: string[]) => void;
    onDeleteTag: (index: number) => void;
    onAddTag: (tag: string) => void;
    delimiters?: string[];
    placeholder?: string;
};

export type TagComponentState = {
    newTag: string;
};

class TagComponent extends Component<TagComponentProps, TagComponentState> {
    private classNames = "tag-component";
    private delimiters: string[];
    private keyPress: boolean;
    private lastAddedTag: string | null;

    public constructor(props: TagComponentProps) {
        super(props);
        if (props.className) this.classNames = `${this.classNames} ${props.className}`;
        this.state = { newTag: "" };
        this.delimiters = props.delimiters ?? [",", "Enter"];
        this.lastAddedTag = null;
        this.keyPress = false;
    }

    private addTag(tag: string) {
        console.log(`Tag added: ${tag}`);
        this.lastAddedTag = tag;
        if (!this.props.tags.includes(tag)) {
            this.props.onAddTag(tag);
        }
        this.setState({
            newTag: ""
        });
    }

    public handleKeyPress(e: React.KeyboardEvent<HTMLInputElement>) {
        //console.log(e.key);
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


    public render(): JSX.Element {
        let selectedTags = this.props.tags.map((tag, idx) => {
            return (
                <li key={idx} className="tag-chosen">
                    <span className="tag-chosen-text">{tag}</span>
                    <button
                        className="tag-delete-x"
                        onClick={() => this.props.onDeleteTag(idx)}
                    >×</button>
                </li>
            );
        });

        return (
            <div className={this.classNames}>
                <ul className="tag-chosen-list">
                    {selectedTags}
                </ul>

                {this.props.editable && (
                <input
                    type="text"
                    className="tag-text-input"
                    value={this.state.newTag}
                    list={`${this.props.name}-datalist`}
                    id={`${this.props.name}-tag-input`}
                    name={`${this.props.name}-tag-input`}
                    onChange={this.handleValueChange.bind(this)}
                    onKeyPress={this.handleKeyPress.bind(this)}
                    onInput={this.handleInput.bind(this)}
                    placeholder="Enter tag"
                />)}

                <datalist id={`${this.props.name}-datalist`} >
                    {this.props.autoCompleteSuggestions.map((suggestion: string) =>
                        <option key={suggestion} value={suggestion} />
                    )}
                </datalist>
            </div>
        );
    }
}

export default TagComponent;