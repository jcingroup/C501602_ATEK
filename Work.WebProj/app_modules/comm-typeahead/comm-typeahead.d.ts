//ReactTypeahead
declare module "comm-typeahead" {
    interface SelectItem {
        value: string;
        text: string
    }
    interface ReactTypeaheadProps extends React.Props<ReactTypeaheadClass> {
        value?: string;
        fieldName?: string;
        inputClass?: string;
        onCompleteChange?(field_name: string, index: number, select_item: SelectItem): void;
        index?: number;
        apiPath?: string;
        disabled?: boolean;
    }
    interface ReactTypeahead extends React.ReactElement<ReactTypeaheadProps> { }
    interface ReactTypeaheadClass extends React.ComponentClass<ReactTypeaheadProps> {
    }
    var ReactTypeahead: ReactTypeaheadClass;
    //export = ReactTypeaheadClass;
}