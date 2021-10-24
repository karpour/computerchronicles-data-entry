import { Component } from "react";
import TagInputComponent from "./TagInputComponent/TagInputComponent";
import "./Test.css";

const val: string[] = ["aaa", "bbb", "ccc", "abc", "abb", "abbbbb"];


function autoCompleteSuggestionProvider(input: string): string[] {
    return val.filter(val => val.includes(input));
}

type TestProps = {

};

type TestState = {
    tags: string[];
};

class Test extends Component<TestProps, TestState> {
    private classNames = "tag-component";

    public constructor(props: any) {
        super(props);
        this.state = {
            tags: []
        };
    }

    public handleAutoCompleteSelect(selection: string) {
        console.log(`Selected ${selection}`);
    }

    protected handleTagAdd(tag: string) {
        console.log(`Added ${tag}`);
        this.setState((prevState, props) => {
            let newTags = [...prevState.tags];
            newTags.push(tag);
            return {
                tags: newTags
            };
        });
    }

    protected handleTagDelete(index: number) {
        this.setState((prevState, props) => {
            if (index < -1 || index >= prevState.tags.length) throw new Error(`Invalid index '${index}', tags.length is ${prevState.tags.length}`);
            let newTags = [...prevState.tags];
            if (index < 0) {
                newTags.pop();
            } else {
                newTags.splice(index, 1);
            }
            return {
                tags: newTags
            };
        });
    }

    public render() {
        return (<div>
            <div className="main">

                <TagInputComponent
                    name="Testinput"
                    autoCompleteSuggestions={["Stewart", "Cheifet", "Computer", "Chrome", "Colorado"]}
                    onTagAdd={this.handleTagAdd.bind(this)}
                    onTagDelete={this.handleTagDelete.bind(this)}
                    tags={this.state.tags}
                    backSpaceTagDelete={true}
                />
            </div>
        </div>);
    }
}

export default Test;