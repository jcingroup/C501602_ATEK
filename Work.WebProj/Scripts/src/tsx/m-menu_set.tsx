import $ = require('jquery');
import React = require('react');
import ReactDOM = require('react-dom');
import Moment = require('moment');
import ReactBootstrap = require("react-bootstrap");
import CommCmpt = require('comm-cmpt');
import CommFunc = require('comm-func');
import DT = require('dt');

namespace MenuSet {
    interface Rows {
        menu_id: number;
        parent_menu_id: number;
        menu_name: string;
        area: string;
        controller: string;
        action: string;
        icon_class: string;
        check_del?: boolean,
        sort?: number;
        is_folder?: boolean;
    }
    interface FormState<G, F> extends BaseDefine.GirdFormStateBase<G, F> {
        searchData?: {
            keyword: string
            is_folder: boolean
            parent_id: number
        }
        folder?: server.Option[]
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
            apiPathName: gb_approot + 'api/Menu'
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
                       <td>{this.props.itemData.menu_id}</td>
                       <td>{this.props.itemData.parent_menu_id}</td>
                       <td>{this.props.itemData.menu_name}</td>
                       <td>{this.props.itemData.area}</td>
                       <td>{this.props.itemData.controller}</td>
                       <td>{this.props.itemData.action}</td>
                       <td>{this.props.itemData.icon_class}</td>
                       <td>{this.props.itemData.sort}</td>
                       <td>{this.props.itemData.is_folder ? <span className="label label-success">父選單</span> : <span className="label label-primary">子選單</span>}</td>
                </tr>;

        }
    }
    export class GridForm extends React.Component<BaseDefine.GridFormPropsBase, FormState<Rows, server.Menu>>{

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
            this.getAjaxInitData = this.getAjaxInitData.bind(this);
            this.setRolesCheck = this.setRolesCheck.bind(this);
            this.render = this.render.bind(this);


            this.state = {
                fieldData: {},
                gridData: { rows: [], page: 1 },
                edit_type: 0,
                searchData: { keyword: null, is_folder: null, parent_id: null },
                folder: []
            }
        }
        static defaultProps: BaseDefine.GridFormPropsBase = {
            fdName: 'fieldData',
            gdName: 'searchData',
            apiPath: gb_approot + 'api/Menu',
            apiInitPath: gb_approot + 'Base/Menu/aj_Init'
        }
        componentDidMount() {
            this.queryGridData(1);
            this.getAjaxInitData();
        }
        getAjaxInitData() {
            CommFunc.jqGet(this.props.apiInitPath, {})
                .done(function (data, textStatus, jqXHRdata) {
                    console.log(data);
                    this.setState({ folder: data.options_folder });
                    //載入下拉是選單內容
                }.bind(this))
                .fail(function (jqXHR, textStatus, errorThrown) {
                    showAjaxError(errorThrown);
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
                    ids.push('ids=' + this.state.gridData.rows[i].menu_id);
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
            CommFunc.jqGet(gb_approot + 'api/GetAction/GetInsertRoles', {})
                .done((data, textStatus, jqXHRdata) => {
                    this.setState({ edit_type: 1, fieldData: { role_array: data, parent_menu_id: 0, sort: 0 } });
                })
                .fail((jqXHR, textStatus, errorThrown) => {
                    CommFunc.showAjaxError(errorThrown);
                });
        }
        updateType(id: number | string) {
            CommFunc.jqGet(this.props.apiPath, { id: id })
                .done((data, textStatus, jqXHRdata) => {
                    this.setState({ edit_type: 2, fieldData: data.data });
                })
                .fail((jqXHR, textStatus, errorThrown) => {
                    CommFunc.showAjaxError(errorThrown);
                });
        }
        noneType() {
            this.gridData(0)
                .done(function (data, textStatus, jqXHRdata) {
                    this.setState({ edit_type: 0, gridData: data });
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
        setRolesCheck(i: number, e: React.SyntheticEvent) {
            var obj = this.state[this.props.fdName];
            var roleObj = obj['role_array'];
            var item = roleObj[i];
            item.role_use = !item.role_use;

            this.setState({ fieldData: obj });
        }
        render() {

            var outHtml: JSX.Element = null;

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
                                            <label>menu名稱</label> { }
                                            <input type="text" className="form-control"
                                                onChange={this.changeGDValue.bind(this, 'keyword') }
                                                value={searchData.keyword}
                                                placeholder="請輸入關鍵字..." /> { }
                                            <label>狀態</label> { }
                                            <select className="form-control"
                                                onChange={this.changeGDValue.bind(this, 'is_folder') }
                                                value={searchData.is_folder} >
                                                <option value="">全部</option>
                                                <option value="true">父選單</option>
                                                <option value="false">子選單</option>
                                                </select> { }
                                            <label>父選單</label> { }
                                            <select className="form-control"
                                                onChange={this.changeGDValue.bind(this, 'parent_id') }
                                                value={searchData.parent_id} >
                                                <option value="">全部</option>
                                                <option value="0">無</option>
                                                {
                                                this.state.folder.map(function (itemData, i) {
                                                    return <option key={i} value={itemData.val}>{itemData.Lname}</option>;
                                                })
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
                                        <th className="col-xs-1">編號</th>
                                        <th className="col-xs-1">對應父選單</th>
                                        <th className="col-xs-2">選單名稱</th>
                                        <th className="col-xs-1">area</th>
                                        <th className="col-xs-1">controller</th>
                                        <th className="col-xs-1">action</th>
                                        <th className="col-xs-1">icon_class</th>
                                        <th className="col-xs-1">排序</th>
                                        <th className="col-xs-1">選單狀態</th>
                                        </tr>
                                    </thead>
                                <tbody>
                                    {
                                    this.state.gridData.rows.map(
                                        (itemData, i) =>
                                            <GridRow key={i}
                                                ikey={i}
                                                primKey={itemData.menu_id}
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


                outHtml = (
                    <div>
    <h4 className="title"> {this.props.caption} 基本資料維護</h4>
    <form className="form-horizontal" onSubmit={this.handleSubmit}>
        <div className="col-xs-10">
                    <div className="form-group">
                        <label className="col-xs-2 control-label">編號</label>
                        <div className="col-xs-4">
                            <input type="number"
                                className="form-control"
                                value={fieldData.menu_id}
                                onChange={this.changeFDValue.bind(this, 'menu_id') }
                                placeholder="系統自動產生"
                                disabled={true} />
                            </div>
                        </div>
                    <div className="form-group">
                        <label className="col-xs-2 control-label">選擇父選單</label>
                        <div className="col-xs-4">
                            <select className="form-control"
                                value={fieldData.parent_menu_id}
                                onChange={this.changeFDValue.bind(this, 'parent_menu_id') }>
                            <option value="0">無</option>
                            {
                            this.state.folder.map(function (itemData, i) {
                                return <option key={i} value={itemData.val}>{itemData.Lname}</option>;
                            })
                            }
                                </select>
                            </div>
                        <small className="help-inline col-xs-6 text-danger">(必填) </small>
                        </div>
                    <div className="form-group">
                        <label className="col-xs-2 control-label">選單名稱</label>
                        <div className="col-xs-4">
                            <input type="text"
                                className="form-control"
                                value={fieldData.menu_name}
                                onChange={this.changeFDValue.bind(this, 'menu_name') }
                                maxLength={64}
                                required />
                            </div>
                        <small className="help-inline col-xs-6 text-danger">(必填) </small>
                        </div>
                    <div className="form-group">
                        <label className="col-xs-2 control-label">area</label>
                        <div className="col-xs-4">
                            <input type="text"
                                className="form-control"
                                value={fieldData.area}
                                onChange={this.changeFDValue.bind(this, 'area') }
                                maxLength={64} />
                            </div>
                        </div>
                    <div className="form-group">
                        <label className="col-xs-2 control-label">controller</label>
                        <div className="col-xs-4">
                            <input type="text"
                                className="form-control"
                                value={fieldData.controller}
                                onChange={this.changeFDValue.bind(this, 'controller') }
                                maxLength={16} />
                            </div>
                        </div>
                    <div className="form-group">
                        <label className="col-xs-2 control-label">action</label>
                        <div className="col-xs-4">
                            <input type="text"
                                className="form-control"
                                value={fieldData.action}
                                onChange={this.changeFDValue.bind(this, 'action') }
                                maxLength={16} />
                            </div>
                        </div>
                    <div className="form-group">
                        <label className="col-xs-2 control-label">icon_class</label>
                        <div className="col-xs-4">
                            <input type="text"
                                className="form-control"
                                value={fieldData.icon_class}
                                onChange={this.changeFDValue.bind(this, 'icon_class') }
                                maxLength={16} />
                            </div>
                        </div>
            <div className="form-group">
                <label className="col-xs-2 control-label">排序</label>
                <div className="col-xs-4">
                    <input type="number" className="form-control" onChange={this.changeFDValue.bind(this, 'sort') } value={fieldData.sort} required />
                    </div>
                <small className="col-xs-6 help-inline">由小到大排序</small>
                </div>
            <div className="form-group">
                <label className="col-xs-2 control-label">選單狀態</label>
                <div className="col-xs-4">
                   <div className="radio-inline">
                       <label>
                            <input type="radio"
                                name="is_folder"
                                value={true}
                                checked={fieldData.is_folder === true}
                                onChange={this.changeFDValue.bind(this, 'is_folder') }
                                />
                            <span>父選單</span>
                           </label>
                       </div>
                   <div className="radio-inline">
                       <label>
                            <input type="radio"
                                name="is_folder"
                                value={false}
                                checked={fieldData.is_folder === false}
                                onChange={this.changeFDValue.bind(this, 'is_folder') }
                                />
                            <span>子選單</span>
                           </label>
                       </div>
                    </div>
                </div>
            <div className="form-group">
                <label className="col-xs-2 control-label">使用狀態</label>
                <div className="col-xs-4">
                   <div className="radio-inline">
                       <label>
                            <input type="radio"
                                name="is_use"
                                value={true}
                                checked={fieldData.is_use === true}
                                onChange={this.changeFDValue.bind(this, 'is_use') }
                                />
                            <span>使用中</span>
                           </label>
                       </div>
                   <div className="radio-inline">
                       <label>
                            <input type="radio"
                                name="is_use"
                                value={false}
                                checked={fieldData.is_use === false}
                                onChange={this.changeFDValue.bind(this, 'is_use') }
                                />
                            <span>未使用</span>
                           </label>
                       </div>
                    </div>
                </div>
                    <div className="form-group">
                        <label className="col-xs-2 control-label">可檢視角色</label>
                        <div className="col-xs-10">
                        {
                        fieldData.role_array.map((itemData, i) =>
                            <div className="checkbox" key={itemData.role_id}>
                                    <label>
                                        <input  type="checkbox"
                                            checked={itemData.role_use}
                                            onChange={this.setRolesCheck.bind(this, i) }
                                            />
                                        {itemData.role_name}
                                        </label>
                                </div>
                        ) }
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
                        </div>
                );
            }

            return outHtml;
        }
    }
}

var dom = document.getElementById('page_content');
ReactDOM.render(<MenuSet.GridForm caption={gb_caption} menuName={gb_menuname} iconClass="fa-list-alt" />, dom);