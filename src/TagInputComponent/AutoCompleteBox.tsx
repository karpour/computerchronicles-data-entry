import React from "react";
import { Component, MouseEvent } from "react";
import './AutoCompleteBox.css';



type AutoCompleteBoxProps = {
    autoCompleteOptions: string[];
    searchTerm?: string;
    className?: string;
    onAutoCompleteSelect: (selectedOption: string) => void;
};

type AutoCompleteBoxState = {};

class AutoCompleteBox extends Component<AutoCompleteBoxProps, AutoCompleteBoxState> {
    private className: string = "auto-complete-box";

    public constructor(props: AutoCompleteBoxProps) {
        super(props);
        if (this.props.className) this.className = `${this.className} ${props.className}`;
    }

    public handleOptionSelect(event: MouseEvent<HTMLDivElement>) {
        let element: HTMLDivElement = event.target as HTMLDivElement;
        this.props.onAutoCompleteSelect(element.innerHTML);
    }

    public render() {
        let items = this.props.autoCompleteOptions.map((option) => (
            <div onClick={(this.handleOptionSelect.bind(this))}>{option}</div>
        ));

        return (<div className={this.className}>
            {items}
        </div>);
    }
}

export default AutoCompleteBox;