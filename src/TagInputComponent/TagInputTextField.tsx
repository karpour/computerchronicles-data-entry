import React from "react";
import { ChangeEvent, Component, FocusEvent } from "react";
import './TagInputTextField.css';



type TagInputProps = {
    className?: string;
    placeHolder?: string;
    canAddTags: boolean;
    autoCompleteSuggestions: string[];
    onBackSpace: () => void;
    onFocusChange: (focus: boolean) => void;
    onTagChange: (partialTag: string) => void;
    onTagAdd: (tag: string) => void;
    delimiters?: string[];
};

type TagInputState = {
    newTag: string;

};

class TagInputTextField extends Component<TagInputProps, TagInputState> {
    private className: string = "tag-input-box";
    private delimiters: string[];


    public constructor(props: TagInputProps) {
        super(props);
        this.delimiters = props.delimiters ?? [",", "Enter"];
        this.state = {
            newTag: ""

        };
        if (this.props.className) this.className = `${this.className} ${props.className}`;
    }

    protected handleTextFieldFocus(event: FocusEvent<HTMLInputElement>) {
        const element = event.target as HTMLInputElement;
        console.log(event);
    }


    protected setNewTag(tag: string) {
        this.setState({
            newTag: tag
        });
    }



    public handleKeyPress(e: React.KeyboardEvent<HTMLInputElement>) {
        console.log(e.key);
        console.log(this.state.newTag);
        if (this.delimiters.includes(e.key) && this.state.newTag !== '') {
            e.preventDefault();
            this.props.onTagAdd(this.state.newTag);
            this.setNewTag('');
        } else {
            /*const s = selectedAutoSuggestIndex;

            if (e.key === 'ArrowUp') {
                if (s === -1) {
                    setSelectedAutoSuggestIndex(props.suggestions.length - 1);
                    setNewTag(props.suggestions[props.suggestions.length - 1]);
                } else if (s === 0) {
                    setSelectedAutoSuggestIndex(-1);
                    setNewTag(typedTag);
                } else {
                    setSelectedAutoSuggestIndex(s - 1);
                    setNewTag(props.suggestions[s - 1]);
                }
            } else if (e.key === 'ArrowDown') {
                if (s === props.suggestions.length - 1) {
                    setSelectedAutoSuggestIndex(-1);
                    setNewTag(typedTag);
                } else {
                    setSelectedAutoSuggestIndex(s + 1);
                    setNewTag(props.suggestions[s + 1]);
                }
            }*/
        }
    };

    protected handleValueChange(e: ChangeEvent<HTMLInputElement>) {
        const t = e.target.value;
        console.log(`Value changed: ${t}`);
        this.setNewTag(t);
        this.props.onTagChange(t);
    };

    //<label htmlFor="ice-cream-choice">Choose a flavor:</label>

    public render() {
        return (
            <div>
                <input
                    type="text"
                    list="ice-cream-flavors"
                    id="ice-cream-choice"
                    name="ice-cream-choice"
                    onKeyPress={this.handleKeyPress.bind(this)}
                />

                <datalist id="list-options">
                    {this.props.autoCompleteSuggestions.map((suggestion: string) =>
                        <option key={suggestion} value={suggestion} />
                    )}
                </datalist>

                <input
                    type="text"
                    value={this.state.newTag}
                    onFocus={() => this.props.onFocusChange(true)}
                    onBlur={() => this.props.onFocusChange(false)}
                    onKeyPress={this.handleKeyPress.bind(this)}
                    onChange={this.handleValueChange.bind(this)}
                    placeholder={this.props.placeHolder ?? 'Enter a tag'} />
            </div>);
    }
}

export default TagInputTextField;