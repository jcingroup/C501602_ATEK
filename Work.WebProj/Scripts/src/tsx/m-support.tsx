import $ = require('jquery');
import React = require('react');
import ReactDOM = require('react-dom');
import Moment = require('moment');
import ReactBootstrap = require("react-bootstrap");
import CommCmpt = require('comm-cmpt');
import CommFunc = require('comm-func');
import DT = require('dt');
import "Pikaday/css/pikaday.css";

namespace Support {
    interface Rows {
        support_id?: string;
        check_del?: boolean,
        support_title?: string;
        l2_name?: string;
        day?: any;
        sort?: number;
        i_Hide?: boolean;
        i_Lang: string;
    }
    interface FormState<G, F> extends BaseDefine.GirdFormStateBase<G, F> {
        searchData?: {
            keyword: string
            i_Lang: string
            category: number
        },
        all_category?: Array<server.LangOption>,
        options_category?: Array<server.Option>
    }
    interface FormResult extends IResultBase {
        id: string
    }

    class GridRow extends React.Component<BaseDefine.GridRowPropsBase<Rows>, BaseDefine.GridRowStateBase> {
        constructor() {
            super();
            this.delCheck = this.delCheck.bind(this);
            this.modify = this.modify.bind(this);
        }
        static defaultProps = {
            fdName: 'fieldData',
            gdName: 'searchData',
            apiPathName: gb_approot + 'api/Support'
        }
        delCheck(i, chd) {
            this.props.delCheck(i, chd);
        }
        modify() {
            this.props.updateType(this.props.primKey)
        }
        render() {
            let StateForGird = CommCmpt.StateForGird;
            return <tr>
                       <td className="text-center"><CommCmpt.GridCheckDel iKey={this.props.ikey} chd={this.props.itemData.check_del} delCheck={this.delCheck} /></td>
                       <td className="text-center"><CommCmpt.GridButtonModify modify={this.modify} /></td>
                       <td>{this.props.itemData.support_title}</td>
                       <td>{this.props.itemData.l2_name}</td>
                       <td>{Moment(this.props.itemData.day).format(DT.dateFT) }</td>
                       <td>{this.props.itemData.sort }</td>
                       <td>{this.props.itemData.i_Hide ? <span className="label label-default">隱藏</span> : <span className="label label-primary">顯示</span>}</td>
                       <td><StateForGird id={this.props.itemData.i_Lang} stateData={DT.LangData} /></td>
                </tr>;

        }
    }
    export class GridForm extends React.Component<BaseDefine.GridFormPropsBase, FormState<Rows, server.Support>>{

        constructor() {

            super();
            this.updateType = this.updateType.bind(this);
            this.noneType = this.noneType.bind(this);
            this.queryGridData = this.queryGridData.bind(this);
            this.handleSubmit = this.handleSubmit.bind(this);
            this.deleteSubmit = this.deleteSubmit.bind(this);
            this.delCheck = this.delCheck.bind(this);
            this.checkAll = this.checkAll.bind(this);
            this.componentDidMount = this.componentDidMount.bind(this);
            this.insertType = this.insertType.bind(this);
            this.changeGDValue = this.changeGDValue.bind(this);
            this.changeFDValue = this.changeFDValue.bind(this);
            this.setInputValue = this.setInputValue.bind(this);
            this.handleSearch = this.handleSearch.bind(this);
            this.componentDidUpdate = this.componentDidUpdate.bind(this);
            this.queryInitData = this.queryInitData.bind(this);
            this.setLangVal = this.setLangVal.bind(this);
            this.changeDatePicker = this.changeDatePicker.bind(this);
            this.render = this.render.bind(this);


            this.state = {
                fieldData: {},
                gridData: { rows: [], page: 1 },
                edit_type: 0,
                searchData: { keyword: null, i_Lang: null, category: null },
                all_category: [],
                options_category: []
            }
        }
        static defaultProps: BaseDefine.GridFormPropsBase = {
            fdName: 'fieldData',
            gdName: 'searchData',
            apiPath: gb_approot + 'api/Support',
            apiInitPath: gb_approot + 'api/GetAction/GetCategoryData'
        }
        componentDidMount() {
            this.queryGridData(1);
            this.queryInitData();
        }
        componentDidUpdate(prevProps, prevState) {
            if ((prevState.edit_type == 0 && (this.state.edit_type == 1 || this.state.edit_type == 2))) {
                console.log('CKEDITOR');
                CKEDITOR.replace('support_content', { customConfig: '../ckeditor/inlineConfig.js' });
            }
        }
        queryInitData() {
            CommFunc.jqGet(this.props.apiInitPath, { l1_id: AllCategoryL1.support })
                .done((data, textStatus, jqXHRdata) => {
                    if (data.result) {
                        this.setState({ all_category: data.data });
                    }
                })
                .fail((jqXHR, textStatus, errorThrown) => {
                    CommFunc.showAjaxError(errorThrown);
                });
        }
        gridData(page: number) {

            var parms = {
                page: 0
            };

            if (page == 0) {
                parms.page = this.state.gridData.page;
            } else {
                parms.page = page;
            }

            $.extend(parms, this.state.searchData);
            return CommFunc.jqGet(this.props.apiPath, parms);
        }
        queryGridData(page: number) {
            this.gridData(page)
                .done((data, textStatus, jqXHRdata) => {
                    this.setState({ gridData: data });
                })
                .fail((jqXHR, textStatus, errorThrown) => {
                    CommFunc.showAjaxError(errorThrown);
                });
        }
        handleSubmit(e: React.FormEvent) {

            e.preventDefault();
            this.state.fieldData.support_content = CKEDITOR.instances['support_content'].getData();
            if (this.state.edit_type == 1) {
                CommFunc.jqPost(this.props.apiPath, this.state.fieldData)
                    .done((data: FormResult, textStatus, jqXHRdata) => {
                        if (data.result) {
                            CommFunc.tosMessage(null, '新增完成', 1);
                            this.updateType(data.id);
                        } else {
                            alert(data.message);
                        }
                    })
                    .fail((jqXHR, textStatus, errorThrown) => {
                        CommFunc.showAjaxError(errorThrown);
                    });
            }
            else if (this.state.edit_type == 2) {
                CommFunc.jqPut(this.props.apiPath, this.state.fieldData)
                    .done((data, textStatus, jqXHRdata) => {
                        if (data.result) {
                            CommFunc.tosMessage(null, '修改完成', 1);
                        } else {
                            alert(data.message);
                        }
                    })
                    .fail((jqXHR, textStatus, errorThrown) => {
                        CommFunc.showAjaxError(errorThrown);
                    });
            };
            return;
        }
        handleOnBlur(date) {

        }
        deleteSubmit() {

            if (!confirm('確定是否刪除?')) {
                return;
            }

            var ids = [];
            for (var i in this.state.gridData.rows) {
                if (this.state.gridData.rows[i].check_del) {
                    ids.push('ids=' + this.state.gridData.rows[i].support_id);
                }
            }

            if (ids.length == 0) {
                CommFunc.tosMessage(null, '未選擇刪除項', 2);
                return;
            }

            CommFunc.jqDelete(this.props.apiPath + '?' + ids.join('&'), {})
                .done(function (data, textStatus, jqXHRdata) {
                    if (data.result) {
                        CommFunc.tosMessage(null, '刪除完成', 1);
                        this.queryGridData(0);
                    } else {
                        alert(data.message);
                    }
                }.bind(this))
                .fail(function (jqXHR, textStatus, errorThrown) {
                    CommFunc.showAjaxError(errorThrown);
                });
        }
        handleSearch(e: React.FormEvent) {
            e.preventDefault();
            this.queryGridData(0);
            return;
        }
        delCheck(i: number, chd: boolean) {
            let newState = this.state;
            this.state.gridData.rows[i].check_del = !chd;
            this.setState(newState);
        }
        checkAll() {

            let newState = this.state;
            newState.checkAll = !newState.checkAll;
            for (var prop in this.state.gridData.rows) {
                this.state.gridData.rows[prop].check_del = newState.checkAll;
            }
            this.setState(newState);
        }
        insertType() {
            let options = this.state.all_category[0].items;
            this.setState({
                edit_type: 1, fieldData: {
                    i_Hide: false,
                    sort: 0, i_Lang: 'en-US', support_category: options[0].val,
                    day: Moment().toJSON()
                }, options_category: options
            });
        }
        updateType(id: number | string) {

            CommFunc.jqGet(this.props.apiPath, { id: id })
                .done((data, textStatus, jqXHRdata) => {
                    let options = [];
                    this.state.all_category.forEach((item, i) => {
                        if (data.data.i_Lang == item.lang) {
                            options = item.items;
                        }
                    });
                    this.setState({ edit_type: 2, fieldData: data.data, options_category: options });
                })
                .fail((jqXHR, textStatus, errorThrown) => {
                    CommFunc.showAjaxError(errorThrown);
                });
        }
        noneType() {
            let searchData = this.state.searchData;
            let options = [];
            this.state.all_category.forEach((item, i) => {
                if (searchData.i_Lang == item.lang) {
                    options = item.items;
                }
            });
            this.gridData(0)
                .done(function (data, textStatus, jqXHRdata) {
                    this.setState({ edit_type: 0, gridData: data, options_category: options});
                }.bind(this))
                .fail(function (jqXHR, textStatus, errorThrown) {
                    CommFunc.showAjaxError(errorThrown);
                });
        }

        changeFDValue(name: string, e: React.SyntheticEvent) {
            this.setInputValue(this.props.fdName, name, e);
        }
        changeGDValue(name: string, e: React.SyntheticEvent) {
            this.setInputValue(this.props.gdName, name, e);
        }
        setInputValue(collentName: string, name: string, e: React.SyntheticEvent) {
            let input: HTMLInputElement = e.target as HTMLInputElement;
            let obj = this.state[collentName];
            if (input.value == 'true') {
                obj[name] = true;
            } else if (input.value == 'false') {
                obj[name] = false;
            } else {
                obj[name] = input.value;
            }
            this.setState({ fieldData: obj });
        }
        changeDatePicker(name: string, v: Date) {
            let obj = this.state.fieldData
            obj[name] = Moment(v).toJSON();
            this.setState({
                fieldData: obj
            });
        }
        setLangVal(collentName: string, name: string, e: React.SyntheticEvent) {
            let input: HTMLInputElement = e.target as HTMLInputElement;
            let NewState = this.state;

            let obj = this.state[collentName];
            obj[name] = input.value;

            NewState.options_category = [];
            NewState.all_category.forEach((item, i) => {
                if (item.lang == input.value) {
                    NewState.options_category = item.items;
                }
            });
            if (collentName == this.props.gdName) {
                obj['category'] = null;//語系切換,分類搜尋條件清空
                $("#search-category option:first").attr("selected", "true");
            } else if (collentName == this.props.fdName) {
                if (NewState.options_category.length > 0) {
                    $("#field-category option:first").attr("selected", "true");
                    obj['support_category'] = NewState.options_category[0].val;
                }
            }
            this.setState(NewState);
        }
        render() {

            var outHtml: JSX.Element = null;
            let option = this.state.options_category;

            if (this.state.edit_type == 0) {
                let searchData = this.state.searchData;
                let GridNavPage = CommCmpt.GridNavPage;

                outHtml =
                    (
                        <div>
                    <h3 className="title">
                        {this.props.caption}
                        </h3>
                    <form onSubmit={this.handleSearch}>
                        <div className="table-responsive">
                            <div className="table-header">
                                <div className="table-filter">
                                    <div className="form-inline">
                                        <div className="form-group">
                                            <label>標題</label> { }
                                            <input type="text" className="form-control"
                                                onChange={this.changeGDValue.bind(this, 'keyword') }
                                                value={searchData.keyword}
                                                placeholder="請輸入關鍵字..." /> { }
                                            <label>語系</label> { }
                                            <select className="form-control"
                                                onChange={this.setLangVal.bind(this, this.props.gdName, 'i_Lang') }
                                                value={searchData.i_Lang} >
                                                <option value="">全部</option>
                                                {
                                                DT.LangData.map((itemData, i) => <option key={i} value={itemData.id}>{itemData.label}</option>)
                                                }
                                                </select> { }
                                            <label>分類</label> { }
                                            <select className="form-control"
                                                id="search-category"
                                                onChange={this.changeGDValue.bind(this, 'category') }
                                                value={searchData.category} >
                                                <option value="">全部</option>
                                                {
                                                option.map((itemData, i) => <option key={i} value={itemData.val}>{itemData.Lname}</option>)
                                                }
                                                </select> { }
                                            <button className="btn-primary" type="submit"><i className="fa-search"></i> 搜尋</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            <table>
                                <thead>
                                    <tr>
                                        <th className="col-xs-1 text-center">
                                            <label className="cbox">
                                                <input type="checkbox" checked={this.state.checkAll} onChange={this.checkAll} />
                                                <i className="fa-check"></i>
                                                </label>
                                            </th>
                                        <th className="col-xs-1 text-center">修改</th>
                                        <th className="col-xs-3">標題</th>
                                        <th className="col-xs-1">分類</th>
                                        <th className="col-xs-1">發布日期</th>
                                        <th className="col-xs-1">排序</th>
                                        <th className="col-xs-1">狀態</th>
                                        <th className="col-xs-1">語系</th>
                                        </tr>
                                    </thead>
                                <tbody>
                                    {
                                    this.state.gridData.rows.map(
                                        (itemData, i) =>
                                            <GridRow key={i}
                                                ikey={i}
                                                primKey={itemData.support_id}
                                                itemData={itemData}
                                                delCheck={this.delCheck}
                                                updateType={this.updateType} />
                                    )
                                    }
                                    </tbody>
                                </table>
                            </div>
                    <GridNavPage
                        startCount={this.state.gridData.startcount}
                        endCount={this.state.gridData.endcount}
                        recordCount={this.state.gridData.records}
                        totalPage={this.state.gridData.total}
                        nowPage={this.state.gridData.page}
                        onQueryGridData={this.queryGridData}
                        InsertType={this.insertType}
                        deleteSubmit={this.deleteSubmit}
                        />
                        </form>
                            </div>
                    );
            }
            else if (this.state.edit_type == 1 || this.state.edit_type == 2) {
                let fieldData = this.state.fieldData;
                let InputDate = CommCmpt.InputDate;
                let MasterFileUpload = CommCmpt.MasterFileUpload;


                outHtml = (
                    <div>
    <h4 className="title"> {this.props.caption} 基本資料維護</h4>
    <form className="form-horizontal" onSubmit={this.handleSubmit}>
        <div className="col-xs-10">
            <div className="form-group">
                <label className="col-xs-2 control-label">標題</label>
                <div className="col-xs-8">
                    <input type="text" className="form-control" onChange={this.changeFDValue.bind(this, 'support_title') } value={fieldData.support_title} maxLength={64} required />
                    </div>
                <small className="col-xs-2 help-inline"><span className="text-danger">(必填) </span>, 最多64字</small>
                </div>
            <div className="form-group">
                <label className="col-xs-2 control-label">語系</label>
                <div className="col-xs-8">
                    <select className="form-control"
                        onChange={this.setLangVal.bind(this, this.props.fdName, 'i_Lang') }
                        value={fieldData.i_Lang} >
                        {
                        DT.LangData.map((itemData, i) => <option key={i} value={itemData.id}>{itemData.label}</option>)
                        }
                        </select>
                    </div>
                <small className="help-inline col-xs-2 text-danger">(必填) </small>
                </div>
            <div className="form-group">
                <label className="col-xs-2 control-label">分類</label>
                <div className="col-xs-8">
                    <select className="form-control" id="field-category"
                        onChange={this.changeFDValue.bind(this, 'support_category') }
                        value={fieldData.support_category} >
                        {
                        option.map((itemData, i) => <option key={i} value={itemData.val}>{itemData.Lname}</option>)
                        }
                        </select>
                    </div>
                <small className="help-inline col-xs-2 text-danger">(必填) </small>
                </div>
            <div className="form-group">
                <label className="col-xs-2 control-label">發布日期</label>
                <div className="col-xs-8">
                    <CommCmpt.InputDate id="day"
                        onChange={this.changeDatePicker }
                        field_name="day"
                        value={fieldData.day}
                        disabled={false} required={true} ver={1} />
                    </div>
                <small className="col-xs-2 help-inline"><span className="text-danger">(必填) </span></small>
                </div>
            <div className="form-group">
                <label className="col-xs-2 control-label">排序</label>
                <div className="col-xs-8">
                    <input type="number" className="form-control" onChange={this.changeFDValue.bind(this, 'sort') } value={fieldData.sort}  />
                    </div>
                <small className="col-xs-2 help-inline">數字越大越前面</small>
                </div>
            <div className="form-group">
                <label className="col-xs-2 control-label">狀態</label>
                <div className="col-xs-4">
                   <div className="radio-inline">
                       <label>
                            <input type="radio"
                                name="i_Hide"
                                value={true}
                                checked={fieldData.i_Hide === true}
                                onChange={this.changeFDValue.bind(this, 'i_Hide') }
                                />
                            <span>隱藏</span>
                           </label>
                       </div>
                   <div className="radio-inline">
                       <label>
                            <input type="radio"
                                name="i_Hide"
                                value={false}
                                checked={fieldData.i_Hide === false}
                                onChange={this.changeFDValue.bind(this, 'i_Hide') }
                                />
                            <span>顯示</span>
                           </label>
                       </div>
                    </div>
                </div>
           <div className="form-group">
                <label className="col-xs-2 control-label">附件</label>
                <div className="col-xs-8">
                <MasterFileUpload FileKind="File1" MainId={fieldData.support_id} ParentEditType={this.state.edit_type} url_upload={gb_approot + 'Active/SupportData/aj_FUpload'}
                    url_list={gb_approot + 'Active/SupportData/aj_FList'} url_delete={gb_approot + 'Active/SupportData/aj_FDelete'} url_download={gb_approot + 'Active/SupportData/aj_FDown'} />
                <small className="help-block">每個檔案最大不可超過4MB; 接受檔案類型為pdf、doc、docx、xls、xlsx、txt、png、jpg、jpeg的檔案</small>
                    </div>
               </div>
            <div className="form-group">
                <label className="col-xs-2 control-label">內容</label>
                <div className="col-xs-10">
                    <textarea type="date" className="form-control" id="support_content" name="support_content" value={fieldData.support_content} onChange={this.changeFDValue.bind(this, 'support_content') } />
                    </div>
                </div>
            <div className="form-action">
                <div className="col-xs-4 col-xs-offset-2">
                    <button type="submit" className="btn-primary"><i className="fa-check"></i> 儲存</button> { }
                    <button type="button" onClick={this.noneType}><i className="fa-times"></i> 回前頁</button>
                    </div>
                </div>
            </div>
        </form>
                        </div >
                );
            }

            return outHtml;
        }
    }
}

var dom = document.getElementById('page_content');
ReactDOM.render(<Support.GridForm caption={gb_caption} menuName={gb_menuname} iconClass="fa-list-alt" />, dom);