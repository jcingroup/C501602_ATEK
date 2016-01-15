import $ = require('jquery');
import React = require('react');
import ReactDOM = require('react-dom');
import Moment = require('moment');
import ReactBootstrap = require("react-bootstrap");
import CommCmpt = require('comm-cmpt');
import CommFunc = require('comm-func');
import DT = require('dt');
import "Pikaday/css/pikaday.css";

namespace MPaymentReply {
    interface Rows {
        payment_reply_id?: number;
        purchase_no?: string;
        check_del?: boolean,
        remit_number?: string;
        remit_day?: any;
        remit_time?: string;
        remit_money?: number;
        state?: number;
        check_state?: number;
        sales_name?: string;
    }
    interface FormState<G, F> extends BaseDefine.GirdFormStateBase<G, F> {
        searchData?: {
            keyword: string
        }
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
            apiPathName: gb_approot + 'api/PaymentReply'
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
                       <td>{this.props.itemData.purchase_no}</td>
                       <td>{this.props.itemData.sales_name}</td>
                       <td>{this.props.itemData.remit_number}</td>
                       <td>{Moment(this.props.itemData.remit_day).format(DT.dateFT) + ' ' + this.props.itemData.remit_time }</td>
                       <td>{'NT$ ' + CommFunc.moneyFormat(this.props.itemData.remit_money) }</td>
                       <td className="text-center"><StateForGird id={this.props.itemData.check_state} stateData={DT.PaymentReplyType} /></td>
                       <td className="text-center"><StateForGird id={this.props.itemData.state} stateData={DT.PurchaseStateType} /></td>
                </tr>;

        }
    }
    export class GridForm extends React.Component<BaseDefine.GridFormPropsBase, FormState<Rows, server.PaymentReply>>{

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
            this.changeDatePicker = this.changeDatePicker.bind(this);
            this.handleSearch = this.handleSearch.bind(this);
            this.checkPaymentReplyState = this.checkPaymentReplyState.bind(this);
            this.render = this.render.bind(this);


            this.state = {
                fieldData: {},
                gridData: { rows: [], page: 1 },
                edit_type: 0,
                searchData: { keyword: null }
            }
        }
        static defaultProps: BaseDefine.GridFormPropsBase = {
            fdName: 'fieldData',
            gdName: 'searchData',
            apiPath: gb_approot + 'api/PaymentReply',
            apiPathDetail: gb_approot + 'Active/Purchase/PutPaymentReplyCheck'
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
                    ids.push('ids=' + this.state.gridData.rows[i].payment_reply_id);
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

        changeDatePicker(name: string, v: Date) {
            let obj = this.state.fieldData
            obj[name] = Moment(v).toJSON();
            this.setState({
                fieldData: obj
            });
        }
        checkPaymentReplyState(check_state: PaymentReplyType, state: PurchaseStateType) {
            let is_mail: boolean = false;
            let fieldData = this.state.fieldData;
            if (this.state.fieldData.check_state != PaymentReplyType.notCheck) {
                if (!confirm('此匯款通知已核對過，確定是否繼續?')) {
                    return;
                }
            }
            if (check_state == PaymentReplyType.error) {
                if (!confirm('確定是否核對為「錯誤」?')) {
                    return;
                }
            } else if (check_state == PaymentReplyType.correct) {
                if (state == PurchaseStateType.waitForShip) {
                    if (!confirm('確定是否核對為「正確」，並將訂單狀態修改為「待出貨通知」?')) {
                        return;
                    }
                } else if (state == PurchaseStateType.complete) {
                    if (!confirm('確定是否核對為「正確」，並將訂單狀態修改為「訂單完成」?')) {
                        return;
                    }
                    if (confirm('確定是否發送EMail?')) {
                        is_mail = true;
                    }
                }
            }
            CommFunc.jqPut(this.props.apiPathDetail, { id: fieldData.payment_reply_id, state: state, check_state: check_state, is_mail: is_mail })
                .done((data, textStatus, jqXHRdata) => {
                    if (data.result) {
                        fieldData.check_state = check_state;
                        CommFunc.tosMessage(null, '核對完成', 1);
                        this.setState({ fieldData: fieldData });
                    } else {
                        alert(data.message);
                    }
                })
                .fail((jqXHR, textStatus, errorThrown) => {
                    CommFunc.showAjaxError(errorThrown);
                });
        }
        render() {

            var outHtml: JSX.Element = null;

            if (this.state.edit_type == 0) {
                let searchData = this.state.searchData;
                let GridNavPage = CommCmpt.GridNavPage;

                outHtml =
                (
                    <div>

                    <ul className="breadcrumb">
                        <li><i className="fa-list-alt"></i> {this.props.menuName}</li>
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
                                            <label>訂單編號</label> { }
                                            <input type="text" className="form-control"
                                                onChange={this.changeGDValue.bind(this, 'keyword') }
                                                value={searchData.keyword}
                                                placeholder="請輸入關鍵字..." /> { }
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
                                        <th className="col-xs-2">訂單編號</th>
                                        <th className="col-xs-1">會員姓名</th>
                                        <th className="col-xs-2">匯款帳號後5碼</th>
                                        <th className="col-xs-2">匯款日期</th>
                                        <th className="col-xs-1">金額</th>
                                        <th className="col-xs-1">核對狀態</th>
                                        <th className="col-xs-1">訂單狀態</th>
                                        </tr>
                                    </thead>
                                <tbody>
                                    {
                                    this.state.gridData.rows.map(
                                        (itemData, i) =>
                                            <GridRow key={i}
                                                ikey={i}
                                                primKey={itemData.payment_reply_id}
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
                        showAdd={false} />
                        </form>
                        </div>
                );
            }
            else if (this.state.edit_type == 1 || this.state.edit_type == 2) {
                let fieldData = this.state.fieldData;
                let InputDate = CommCmpt.InputDate;

                outHtml = (
                    <div>
    <ul className="breadcrumb">
        <li><i className="fa-list-alt"></i>
            {this.props.menuName}
            </li>
        </ul>
    <h4 className="title"> {this.props.caption} 基本資料維護</h4>
    <form className="form-horizontal" onSubmit={this.handleSubmit}>
        <div className="col-xs-10">


            <div className="form-group">
                <label className="col-xs-2 control-label">訂單編號</label>
                <div className="col-xs-8">
                    <div className="input-group">
                        <label>{fieldData.purchase_no}</label>
                        </div>
                    </div>
                </div>
            <div className="form-group">
                <label className="col-xs-2 control-label">購買會員姓名</label>
                <div className="col-xs-8">
                    <div className="input-group">
                        <label>{fieldData.sales_name}</label>
                        </div>
                    </div>
                </div>
            <div className="form-group">
                <label className="col-xs-2 control-label">匯款帳號後5碼</label>
                <div className="col-xs-8">
                    <div className="input-group">
                        <label>{fieldData.remit_number}</label>
                        </div>
                    </div>
                </div>
            <div className="form-group">
                <label className="col-xs-2 control-label">匯款日期</label>
                <div className="col-xs-8">
                    <div className="input-group">
                        <label>{Moment(fieldData.remit_day).format(DT.dateFT) }</label>
                        </div>
                    </div>
                </div>
           <div className="form-group">
                <label className="col-xs-2 control-label">匯款時間</label>
                <div className="col-xs-8">
                    <select className="form-element" value={fieldData.remit_time} disabled
                        onChange={this.changeFDValue.bind(this, 'remit_time') }>
                        <option value=""></option>
                        {
                        DT.remitTimeData.map((itemData, i) => <option key={i} value={itemData.id}>{itemData.label}</option>)
                        }
                        </select>
                    </div>
               </div>

            <div className="form-group">
                <label className="col-xs-2 control-label">匯款金額</label>
                <div className="col-xs-8">
                    <div className="input-group">
                        <label>{'NT$ ' + CommFunc.moneyFormat(fieldData.remit_money) }</label>
                        </div>
                    </div>
                </div>

            <div className="form-group">
                <label className="col-xs-2 control-label">備註</label>
                <div className="col-xs-8">
                    <textarea type="date" className="form-control" id="memo" name="memo" value={fieldData.memo} onChange={this.changeFDValue.bind(this, 'memo') } disabled />
                    </div>
                </div>
            <div className="form-group">
                <label className="col-xs-2 control-label">審核</label>
                <div className="col-xs-10">
                    <button type="button" className="btn-danger"
                        onClick={this.checkPaymentReplyState.bind(this, PaymentReplyType.error, PurchaseStateType.waitForPaymentCheckout) }>
                        <i className="fa-times"></i> 核對錯誤</button> { }
                    </div>
                </div>
            <div className="form-group">
                <div className="col-xs-10 col-xs-offset-2">
                    <button type="button" className="btn-info"
                        onClick={this.checkPaymentReplyState.bind(this, PaymentReplyType.correct, PurchaseStateType.waitForShip) }>
                        <i className="fa-check"></i> 核對正確(狀態: 待出貨通知) </button> { }
                    </div>
                </div>
            <div className="form-group">
                <div className="col-xs-10 col-xs-offset-2">
                    <button type="button" className="btn-success"
                        onClick={this.checkPaymentReplyState.bind(this, PaymentReplyType.correct, PurchaseStateType.complete) }>
                        <i className="fa-envelope"></i> 核對正確, 並寄送出貨通知(狀態: 訂單完成) </button> { }
                    </div>
                </div>
            <div className="form-action">
                <div className="col-xs-6 col-xs-offset-2">
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
ReactDOM.render(<MPaymentReply.GridForm caption={gb_caption} menuName={gb_menuname} iconClass="fa-list-alt" />, dom);