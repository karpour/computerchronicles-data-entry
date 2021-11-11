import React, { ChangeEvent, Component, MouseEvent, RefObject } from 'react';

type TwoStringValuesObject<T, I extends keyof T, J extends keyof T> =
    ({ [P in I]?: string; } & { [P in J]: string; }) |
    ({ [P in I]: string; } & { [P in J]?: string; });


type FieldNameOrder<T, I extends keyof T, J extends keyof T> = {
    fieldName1: I;
    fieldName2: J;
} | {
    fieldName1: J;
    fieldName2: I;
};

type DualFieldComponentProps<ObjectType extends TwoStringValuesObject<ObjectType, Field1, Field2>, Field1 extends keyof ObjectType, Field2 extends keyof ObjectType> = {
    name: string;
    title1: string;
    title2: string;
    fields: ObjectType[];
    className?: string;
    maxItems?: number;
    canAddOrRemoveFields?: boolean;
    onFieldChanged: (index: number, newField: ObjectType | null) => void;
} & FieldNameOrder<ObjectType, Field1, Field2>;

export type DualFieldComponentState = {
    value1: string;
    value2: string;
};

class DualFieldComponent<ObjectType extends TwoStringValuesObject<ObjectType, Field1, Field2>, Field1 extends keyof ObjectType, Field2 extends keyof ObjectType> extends Component<DualFieldComponentProps<ObjectType, Field1, Field2>, DualFieldComponentState> {
    private className: string = "dual-field-component";
    private readonly textInputId1: string;
    private readonly textInputId2: string;
    private textInput1: RefObject<HTMLInputElement>;
    private textInput2: RefObject<HTMLInputElement>;

    public constructor(props: DualFieldComponentProps<ObjectType, Field1, Field2>) {
        super(props);
        this.state = {
            value1: "",
            value2: ""
        };
        if (props.className) this.className = `${this.className} ${props.className}`;
        this.textInputId1 = `${this.props.name}-${this.props.fieldName1}`;
        this.textInputId2 = `${this.props.name}-${this.props.fieldName2}`;

        this.textInput1 = React.createRef();
        this.textInput2 = React.createRef();
    }

    protected tryAddItem() {
        if (this.state.value1) {
            let newItem: ObjectType = {
                [this.props.fieldName1]: this.state.value1,
                [this.props.fieldName2]: this.state.value2
            } as ObjectType;
            this.props.onFieldChanged(this.props.fields.length, newItem);
            this.setState({ value1: "", value2: "" });
            this.textInput1.current?.focus();
        }
    }

    protected handleAddButtonClick(e: MouseEvent<HTMLButtonElement>) {
        this.tryAddItem();
    }

    public handleKeyPress(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter") {
            e.preventDefault();
            let target = (e as any).target as HTMLInputElement;
            if (!e.target) console.error(`no target`);
            switch (target.id) {
                case this.textInputId1: this.textInput2.current?.focus(); break;
                case this.textInputId2: this.tryAddItem(); break;
            }
        }
    }

    protected handleValueChange(e: ChangeEvent<HTMLInputElement>) {
        switch (e.target.id) {
            case this.textInputId1: this.setState({ value1: e.target.value }); break;
            case this.textInputId2: this.setState({ value2: e.target.value }); break;
        }
    };

    public render() {
        const btnName = `${this.props.name}-add-button`;

        let fieldElements: JSX.Element[] = this.props.fields.map(
            (field, idx) => {
                let separator: string = "";
                if (field[this.props.fieldName1] && field[this.props.fieldName2]) {
                    separator = " | "
                }
                return (<div><b>{field[this.props.fieldName1]}</b>{separator}{field[this.props.fieldName2]} {this.props.canAddOrRemoveFields && (<button
                    className="tag-delete-x"
                    onClick={() => this.props.onFieldChanged(idx, null)}
                >×</button>)}</div>);
            }
        );

        let textInput: JSX.Element = (<div className="dual-field-text-input">
            <input type="text"
                id={this.textInputId1}
                placeholder={String(this.props.fieldName1)}
                value={this.state.value1}
                onChange={this.handleValueChange.bind(this)}
                onKeyPress={this.handleKeyPress.bind(this)}
                ref={this.textInput1}
            >
            </input>
            <input type="text"
                id={this.textInputId2}
                placeholder={String(this.props.fieldName2)}
                value={this.state.value2}
                onKeyPress={this.handleKeyPress.bind(this)}
                onChange={this.handleValueChange.bind(this)}
                ref={this.textInput2}
            >
            </input>
            <button id={btnName} onClick={this.handleAddButtonClick.bind(this)}>ADD</button>
        </div >);

        const showTextInput = this.props.canAddOrRemoveFields &&
            (this.props.maxItems ? (this.props.fields.length < this.props.maxItems) : true);
        return (
            <div className={this.className}>
                {fieldElements}
                {(showTextInput && textInput)}
            </div>);
    }
}

export default DualFieldComponent;