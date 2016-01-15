import $ = require('jquery');
import React = require('react');
import ReactDOM = require('react-dom');
import Moment = require('moment');
import ReactBootstrap = require("react-bootstrap");
import CommCmpt = require('comm-cmpt');
import CommFunc = require('comm-func');
import DT = require('dt');
import "Pikaday/css/pikaday.css";

namespace SalesRank {
    interface Rows {
        check_del: boolean,
        sales_no: string;
        sales_name: string;
        join_date: Date;
        sales_state: number;
        rank: number;
        rise_type: number;
    }
    interface GridRowProps<R> extends BaseDefine.GridRowPropsBase<R> {
        changeSalesRank(key: number, type: SalesRiseRankType): void;
    }
    interface FormState<G, F> extends BaseDefine.GirdFormStateBase<G, F> {
        searchData?: {
            keyword: string,
            rise_type: number
        }
    }
    interface FormResult extends IResultBase {
        no: string
    }
    export class RiseRankButton extends React.Component<{
        stateData: Array<server.StateTemplate>, id: number, onclick(): void, ikey: number
    }, { setClass: string, label: string }>{
        constructor() {

            super();
            this.componentDidMount = this.componentDidMount.bind(this);
            this.componentWillReceiveProps = this.componentWillReceiveProps.bind(this);
            this.render = this.render.bind(this);

            this.state = {
                setClass: null,
                label: null
            }
        }
        static defaultProps = {
            stateData: [],
            id: null
        }
        componentWillReceiveProps(nextProps) {
            //當元件收到新的 props 時被執行，這個方法在初始化時並不會被執行。使用的時機是在我們使用 setState() 並且呼叫 render() 之前您可以比對 props，舊的值在 this.props，而新值就從 nextProps 來。
            for (var i in this.props.stateData) {
                var item = this.props.stateData[i];
                if (item.id == nextProps.id) {
                    this.setState({ setClass: item.classNameforG, label: item.label });
                    break;
                }
            }
        }
        componentDidMount() {
            for (var i in this.props.stateData) {
                var item = this.props.stateData[i];
                if (item.id == this.props.id) {
                    this.setState({ setClass: item.classNameforG, label: item.label });
                    break;
                }
            }
        }
        render() {
            return (
                <button type="button" className="btn-primary" onClick={this.props.onclick.bind(this) }>
                    <i className="fa-check"></i> { }
                    {this.state.label}
                    </button>
            );
        }
    }
    class GridRow extends React.Component<GridRowProps<Rows>, BaseDefine.GridRowStateBase> {
        constructor() {
            super();
            this.delCheck = this.delCheck.bind(this);
            this.modify = this.modify.bind(this);
            this.setRiseRank = this.setRiseRank.bind(this);
        }
        static defaultProps = {
        }
        delCheck(i, chd) {
            this.props.delCheck(i, chd);
        }
        modify() {
            this.props.updateType(this.props.primKey)
        }
        setRiseRank() {
            if (!confirm('確定是否升級?')) {
                return;
            }
            this.props.changeSalesRank(this.props.ikey, this.props.itemData.rise_type);
        }

        render() {

            let out_func_1 = null;
            let out_func_2 = null;

            let StateForGird = CommCmpt.StateForGird;
            return <tr>
                    <td className="text-center">
                    <RiseRankButton id={this.props.itemData.rise_type} stateData={DT.SalesRiseRankType} ikey={this.props.ikey} onclick={this.setRiseRank } />
                        </td>
                    <td>{this.props.itemData.sales_no}</td>
                    <td><StateForGird id={this.props.itemData.rank} stateData={DT.SalesRankType} /></td>
                    <td><StateForGird id={this.props.itemData.rise_type} stateData={DT.SalesRiseRankType} ver={2} /></td>

                    <td>{this.props.itemData.sales_name}</td>
                    <td>{Moment(this.props.itemData.join_date).format(DT.dateFT) }</td>
                </tr>;
        }
    }
    export class GridForm extends React.Component<BaseDefine.GridFormPropsBase, FormState<Rows, server.Sales>>{

        constructor() {

            super();
            this.updateType = this.updateType.bind(this);
            this.noneType = this.noneType.bind(this);
            this.queryGridData = this.queryGridData.bind(this);
            this.handleSearch = this.handleSearch.bind(this);
            this.handleSubmit = this.handleSubmit.bind(this);
            this.deleteSubmit = this.deleteSubmit.bind(this);
            this.delCheck = this.delCheck.bind(this);
            this.checkAll = this.checkAll.bind(this);
            this.componentDidMount = this.componentDidMount.bind(this);
            this.insertType = this.insertType.bind(this);
            this.changeGDValue = this.changeGDValue.bind(this);
            this.changeFDValue = this.changeFDValue.bind(this);
            this.setInputValue = this.setInputValue.bind(this);

            this.changeSalesRank = this.changeSalesRank.bind(this);

            this.render = this.render.bind(this);

            this.state = {
                fieldData: { join_date: null, city: '', country: '' },
                gridData: { rows: [], page: 1 }, edit_type: 0,
                searchData: { keyword: null, rise_type: null }
            }

            Moment.locale('zh-tw');
        }
        static defaultProps: BaseDefine.GridFormPropsBase = {
            fdName: 'fieldData',
            gdName: 'searchData',
            apiPath: gb_approot + 'api/GetAction/GetRiseRankData'
        }
        componentDidMount() {
            this.queryGridData(1);
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

            //$("body").mask("查詢資料中...");
            this.gridData(page)
                .done((data: widegt.GridInfo, textStatus, jqXHRdata) => {
                    if (data.records == 0) {
                        CommFunc.tosMessage(null, '無任何資料', ToastrType.warning);
                        //$("body").unmask();
                    }
                    this.setState({ gridData: data });
                })
                .fail((jqXHR, textStatus, errorThrown) => {
                    CommFunc.showAjaxError(errorThrown);
                    //$("body").unmask();
                });
        }
        handleSubmit(e: React.FormEvent) {

            e.preventDefault();
            if (this.state.edit_type == 1) {
                CommFunc.jqPost(this.props.apiPath, this.state.fieldData)
                    .done((data: FormResult, textStatus, jqXHRdata) => {
                        if (data.result) {
                            CommFunc.tosMessage(null, '新增完成', ToastrType.success);
                            this.updateType(data.no);
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
                            CommFunc.tosMessage(null, '修改完成', ToastrType.success);
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
        deleteSubmit() {

            if (!confirm('確定是否刪除?')) {
                return;
            }

            var ids = [];
            for (var i in this.state.gridData.rows) {
                if (this.state.gridData.rows[i].check_del) {
                    ids.push('ids=' + this.state.gridData.rows[i].sales_no);
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
            this.setState({ edit_type: 1, fieldData: {} });
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

        changeSalesRank(key: number, type: SalesRiseRankType) {
            let obj = this.state.gridData;
            CommFunc.jqPut(gb_approot + 'api/GetAction/SetSalesRank', { no: obj.rows[key].sales_no, rise_type: type })
                .done((data, textStatus, jqXHRdata) => {
                    if (data.result) {
                        CommFunc.tosMessage(null, '升級成功!', ToastrType.success);
                        this.queryGridData(1);
                    }
                })
                .fail((jqXHR, textStatus, errorThrown) => {
                    CommFunc.showAjaxError(errorThrown);
                });

        }

        render() {

            var outHtml: JSX.Element = null;

            var GridNavPage = CommCmpt.GridNavPage;

            var searchData = this.state.searchData;
            outHtml =
                (
                    <div>
    <ul className="breadcrumb">
        <li><i className="fa-list-alt"></i>
            {this.props.menuName}
            </li>
        </ul>
    <h3 className="title">
                        {this.props.caption}
        </h3>
    <form onSubmit={this.handleSearch}>
        <div className="table-responsive">
            <div className="table-header">
                <div className="table-filter">
                    <div className="form-inline">
                        <div className="form-group">
                            <label className="sr-only"></label>
                            <label>可晉升階級</label>
                            <select className="form-control" value={searchData.rise_type} onChange={this.changeGDValue.bind(this, 'rise_type') } >
                                <option value="">全部</option>
                                {
                                DT.SalesRiseRankType.map((itemData, i) => <option key={i} value={itemData.id}>{itemData.label}</option>)
                                }
                                </select>
                            <button className="btn-primary" type="submit"><i className="fa-search"></i> 搜尋</button>
                            </div>
                        </div>
                    </div>
                </div>
            <table>
                <thead>
                    <tr>
                        <th className="col-xs-1 text-center">確認升級</th>
                        <th className="col-xs-1">會員編號</th>
                        <th className="col-xs-1">階級</th>
                        <th className="col-xs-1">建議晉升</th>
                        <th className="col-xs-3">姓名</th>
                        <th className="col-xs-2">加入日期</th>
                        </tr>
                    </thead>
                <tbody>
                    {this.state.gridData.rows.map(
                        (item, i) =>
                            <GridRow key={i}
                                ikey={i}
                                primKey={item.sales_no}
                                itemData={item}
                                delCheck={this.delCheck}
                                updateType={this.updateType}
                                changeSalesRank={this.changeSalesRank}/>
                    ) }
                    </tbody>
                </table>
            </div>
        <GridNavPage startCount={this.state.gridData.startcount} endCount={this.state.gridData.endcount} recordCount={this.state.gridData.records} totalPage={this.state.gridData.total} nowPage={this.state.gridData.page}
            onQueryGridData={this.queryGridData} InsertType={this.insertType} deleteSubmit={this.deleteSubmit} showAdd={false} showDelete={false} />
        </form>
                        </div>


                );


            return outHtml;
        }
    }
}

var dom = document.getElementById('page_content');
ReactDOM.render(<SalesRank.GridForm caption={gb_caption} menuName={gb_menuname} iconClass="fa-list-alt" />, dom);