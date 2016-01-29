import $ = require('jquery');
import React = require('react');
import ReactDOM = require('react-dom');
import Moment = require('moment');
import ReactBootstrap = require("react-bootstrap");
import CommCmpt = require('comm-cmpt');
import CommFunc = require('comm-func');
import DT = require('dt');

namespace AboutUs {
    interface FormState {
        fieldData?: server.AboutUs
    }

    export class GridForm extends React.Component<any, FormState>{

        constructor() {

            super();
            this.handleSubmit = this.handleSubmit.bind(this);
            this.componentDidMount = this.componentDidMount.bind(this);
            this.setLangValue = this.setLangValue.bind(this);
            this.render = this.render.bind(this);


            this.state = {
                fieldData: { aboutus_id: 1, i_Lang: 'en-US' }
            }
        }
        static defaultProps = {
            apiPath: gb_approot + 'api/AboutUs'
        }
        componentDidMount() {
        }
        handleSubmit(detailData: server.AboutUsDetail[], e: React.FormEvent) {

            e.preventDefault();
            this.state.fieldData.AboutUsDetail = detailData;
            CommFunc.jqPut(this.props.apiPath, this.state.fieldData)
                .done((data, textStatus, jqXHRdata) => {
                    if (data.result) {
                        (this.refs["GridDetailForm"]).queryGridData();
                        CommFunc.tosMessage(null, '修改完成', 1);
                    } else {
                        alert(data.message);
                    }
                })
                .fail((jqXHR, textStatus, errorThrown) => {
                    CommFunc.showAjaxError(errorThrown);
                });
            return;
        }
        setLangValue(e: React.SyntheticEvent) {
            let input: HTMLInputElement = e.target as HTMLInputElement;
            let obj = this.state.fieldData;
            obj.i_Lang = input.value;
            if (obj.i_Lang == 'en-US') {
                obj.aboutus_id = 1;
            } else if (obj.i_Lang == 'ja-JP') {
                obj.aboutus_id = 2;
            }
            this.setState({ fieldData: obj });
            //(this.refs["GridDetailForm"]).queryGridData();
        }
        render() {

            var outHtml: JSX.Element = null;
            let fieldData = this.state.fieldData;

            outHtml = (
                <div>
                    <h3 className="title clearfix">
                    <span className="pull-left">{this.props.caption}</span>
                        <div className="form-inline pull-left col-xs-offset-1">
                        <label><small>選擇語系：</small></label>
                        <select className="form-control"
                            value={fieldData.i_Lang}
                            onChange={this.setLangValue.bind(this) }
                            >
                            {
                            DT.LangData.map(function (itemData, i) {
                                return <option key={itemData.id} value={itemData.id}>{itemData.label}</option>;
                            })
                            }
                            </select>
                            </div>
                        </h3>

                    <GridDetailForm
                        MainId={fieldData.aboutus_id}
                        handleSubmit={this.handleSubmit}
                        Lang={fieldData.i_Lang}
                        ref="GridDetailForm" />

                    </div>
            );

            return outHtml;
        }
    }

    interface DetailFormState {
        gridData?: server.AboutUsDetail[]
    }
    interface DetailFormProps {
        MainId: number,
        handleSubmit(detailData: server.AboutUsDetail[], e: React.FormEvent): void,
        Lang: string,
        ref: string,
        apiDetailPath?: string
    }
    //明細列表
    export class GridDetailForm extends React.Component<DetailFormProps, DetailFormState>{

        constructor() {

            super();
            this.handleSubmit = this.handleSubmit.bind(this);
            this.componentDidMount = this.componentDidMount.bind(this);
            this.componentWillReceiveProps = this.componentWillReceiveProps.bind(this);
            this.gridData = this.gridData.bind(this);
            this.queryGridData = this.queryGridData.bind(this);
            this.setSubInputValue = this.setSubInputValue.bind(this);
            this.creatNewData = this.creatNewData.bind(this);
            this.deleteItem = this.deleteItem.bind(this);
            this.render = this.render.bind(this);
            this.state = {
                gridData: []
            }
        }
        static defaultProps = {
            apiDetailPath: gb_approot + 'api/AboutUsDetail'
        }
        componentDidMount() {
            this.queryGridData();
        }
        componentWillReceiveProps(nextProps: DetailFormProps) {
            this.queryGridData(nextProps.MainId, nextProps.Lang);//語系有改變就重新讀取gridData
        }
        handleSubmit(e: React.FormEvent) {

            e.preventDefault();
            this.props.handleSubmit(this.state.gridData, e);
            return;
        }
        gridData(main_id?: number, Lang?: string) {
            if (main_id != undefined && Lang != undefined) {
                var parms = {
                    main_id: main_id,
                    i_Lang: Lang
                };
            } else {
                var parms = {
                    main_id: this.props.MainId,
                    i_Lang: this.props.Lang
                };
            }
            //console.log(main_id, Lang);
            return CommFunc.jqGet(this.props.apiDetailPath, parms);
        }
        queryGridData(main_id?: number, Lang?: string) {
            this.gridData(main_id, Lang)
                .done((data, textStatus, jqXHRdata) => {
                    this.setState({ gridData: data });
                })
                .fail((jqXHR, textStatus, errorThrown) => {
                    CommFunc.showAjaxError(errorThrown);
                });
        }
        setSubInputValue(i: number, name: string, e: React.SyntheticEvent) {
            let input: HTMLInputElement = e.target as HTMLInputElement;
            let gridData = this.state.gridData;
            let obj = gridData[i];
            if (input.value == 'true') {
                obj[name] = true;
            } else if (input.value == 'false') {
                obj[name] = false;
            } else {
                obj[name] = input.value;
            }
            this.setState({ gridData: gridData });
        }
        creatNewData() {
            let newState = this.state;
            let newData: server.AboutUsDetail = {
                aboutus_detail_id: 0,
                aboutus_id: this.props.MainId,
                detail_content: null,
                i_Hide: false,
                i_Lang: this.props.Lang,
                edit_state: EditState.Insert
            };
            newState.gridData.push(newData);
            this.setState(newState);
        }
        deleteItem(i: number) {
            var newState = this.state;
            var data = newState.gridData[i];

            if (data.edit_state == EditState.Insert) {
                newState.gridData.splice(i, 1);
                this.setState(newState);
            } else {
                CommFunc.jqDelete(this.props.apiDetailPath + '?ids=' + data.aboutus_detail_id, {})
                    .done(function (data, textStatus, jqXHRdata) {
                        if (data.result) {
                            newState.gridData.splice(i, 1);
                            this.setState(newState);
                        } else {
                            tosMessage(null, data.message, 1);
                        }
                    }.bind(this))
                    .fail(function (jqXHR, textStatus, errorThrown) {
                        showAjaxError(errorThrown);
                    });
            }
        }
        render() {

            var outHtml: JSX.Element = null;

            let InputDate = CommCmpt.InputDate;

            outHtml = (
                <div>
                    <div className="col-xs-12">
                        <button className="btn-lg thumbnail" type="button" onClick={this.creatNewData.bind(this) }>
                            <span className="caption"><i className="fa-plus-circle"></i>新增</span>
                            </button>
                        </div>
                    <div className="alert alert-warning col-xs-12">
                    <button type="button" className="close" data-dismiss="alert"><span aria-hidden="true">×</span></button>
                    <ol>
                        <li>點選 <strong className="fa-bars"></strong> 並<strong>拖曳</strong>，可修改排列順序。</li>
                        <li>點選 <strong className="fa-chevron-up"></strong> 或 <strong className="fa-chevron-down"></strong> 可收合/展開，點選 <strong className="fa-times"></strong> 可刪除。</li>
                        </ol>
                        </div>
                    <form className="form-horizontal" onSubmit={this.handleSubmit}>
                        <div className="panel-group" ref="SortForm">
                    {
                    this.state.gridData.map((itemData, i) =>
                        <GridDetailField key={i + '-' + itemData.aboutus_detail_id} iKey={i} fieldData={itemData}
                            setSubInputValue={this.setSubInputValue}
                            DeleteItem={this.deleteItem} />
                    )
                    }
                            </div>
                        <div className="form-action text-center">
                            <button type="submit" className="btn-primary"><i className="fa-check"></i> 儲存</button>
                            </div>
                        </form>
                    </div>
            );

            return outHtml;
        }
    }

    interface DetailFieldState {
        fieldData?: server.AboutUsDetail,
        editorObj?: any,
        open?: boolean
    }
    interface DetailFieldProps {
        fieldData: server.AboutUsDetail,
        iKey: number,
        key: string,
        setSubInputValue(i: number, name: string, e: React.SyntheticEvent): void,
        DeleteItem(i: number): void,
    }
    //明細表單
    export class GridDetailField extends React.Component<DetailFieldProps, DetailFieldState>{

        constructor() {

            super();
            this.componentDidMount = this.componentDidMount.bind(this);
            this.changeFDValue = this.changeFDValue.bind(this);
            this.deleteItem = this.deleteItem.bind(this);
            this.setEditor = this.setEditor.bind(this);
            this.render = this.render.bind(this);
            this.state = {
                fieldData: {},
                editorObj: null,
                open: true
            }
        }
        static defaultProps = {
            apiDetailPath: gb_approot + 'api/AboutUsDetail'
        }
        componentDidMount() {
            let fieldData = this.props.fieldData;
            if (fieldData.edit_state == 0) {
                fieldData.sort = this.props.iKey;//排序預設跟資料順序一樣
            }
            this.setState({ fieldData: fieldData });

            this.setEditor('content-' + this.props.iKey, fieldData.detail_content);
        }
        changeFDValue(name: string, e: React.SyntheticEvent) {
            this.props.setSubInputValue(this.props.iKey, name, e);
        }
        deleteItem(i: number) {
            if (this.props.fieldData.edit_state == 1) {
                if (confirm('此筆資料已存在，確認是否刪除?')) {
                    this.props.DeleteItem(i);
                }
            } else {
                this.props.DeleteItem(i);
            }
        }
        setEditor(editorName: string, content: string) {
            let editorObj = this.state.editorObj;

            CKEDITOR.disableAutoInline = true;
            var cfg2 = { customConfig: '../ckeditor/inlineConfig.js' }
            editorObj = CKEDITOR.inline(editorName, cfg2);
            editorObj.setData(content);//一開始載入會沒資料

            editorObj.on('change', function (evt) {
                this.state.fieldData.detail_content = editorObj.getData();
            }.bind(this));
        }
        render() {

            var outHtml: JSX.Element = null;

            let fieldData = this.state.fieldData;
            let Collapse = ReactBootstrap.Collapse;

            outHtml = (
                <div className="panel">
            <div className="panel-heading">
                <h4 className="panel-title draggable clearfix">
                    <div className="form-horizontal">
                        <div className="col-xs-10">
                            <i className="fa-bars"></i>
                            <div className="input-group">
                                <span className="input-group-addon">#{this.props.iKey}</span>
                                </div>
                            </div>
                        </div>
                    <ul className="widget">
                        <li><button onClick={() => this.setState({ open: !this.state.open }) } type="button" title="收合/展開" className="btn-link text-default"><i className="fa-chevron-down"></i></button></li>
                        <li><button className="btn-link text-danger" type="button" title="刪除" onClick={this.deleteItem.bind(this, this.props.iKey) }><i className="fa-times"></i></button></li>
                        </ul>
                    </h4>
                </div>
                    <Collapse in={this.state.open}>
                        <div className="panel-body">
                            <div className="editor">
                                <textarea className="form-control" rows={4} id={'content-' + this.props.iKey}
                                    name={'content-' + this.props.iKey}
                                    value={fieldData.detail_content}
                                    onChange={this.changeFDValue.bind(this, 'detail_content') } />
                                </div>
                            </div>
                        </Collapse>


                    </div>
            );

            return outHtml;
        }
    }
}






var dom = document.getElementById('page_content');
ReactDOM.render(<AboutUs.GridForm caption={gb_caption} menuName={gb_menuname} iconClass="fa-list-alt" />, dom);