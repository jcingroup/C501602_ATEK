import $ = require('jquery');
import React = require('react');
import ReactDOM = require('react-dom');
import ReactBootstrap = require('react-bootstrap');
import Moment = require('moment');
import CommCmpt = require('comm-cmpt');
import CommFunc = require('comm-func');
import DT = require('dt');
import Typeahead = require('comm-typeahead');
import "Pikaday/css/pikaday.css";

namespace Purchase {

    interface Rows {
        check_del: boolean,
        purchase_no: string;
        set_date: Date;
        state: number;
        sales_id: number;
        sales_name: string;
        sales_no: string;
        source: number;
    }

    class GridRow extends React.Component<BaseDefine.GridRowPropsBase<Rows>, BaseDefine.GridRowStateBase> {
        constructor() {
            super();
            this.delCheck = this.delCheck.bind(this);
            this.modify = this.modify.bind(this);
        }
        static defaultProps = {
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
                    <td className="text-center">
                         <CommCmpt.GridCheckDel iKey={this.props.ikey}
                             chd={this.props.itemData.check_del}
                             delCheck={this.delCheck} />
                        </td>
                    <td className="text-center">
                        <CommCmpt.GridButtonModify modify={this.modify}/>
                        </td>
                    <td>{this.props.itemData.purchase_no}</td>
                    <td>{this.props.itemData.sales_no}</td>
                    <td>{this.props.itemData.sales_name}</td>
                    <td>{Moment(this.props.itemData.set_date).format(DT.dateFT) }</td>
                    <td className="text-center"><StateForGird id={this.props.itemData.state} stateData={DT.PurchaseStateType} /></td>
                    <td className="text-center"><StateForGird id={this.props.itemData.source} stateData={DT.sourceType} /></td>
                </tr>;
        }
    }

    interface PurchaseState<G, F> extends BaseDefine.GirdFormStateBase<G, F> {

        detailData?: Array<server.PurchaseDetail>;
        isShowModalSales?: boolean;
        download_src?: string;
        download_all_src?: string;
        searchData?: {
            keyword: string,
            source: number,
            state: number,
            start_date?: string,
            end_date?: string
        }
    }
    interface PurchaseResult extends IResultBase {
        no: string
    }
    interface FormProps extends BaseDefine.GridFormPropsBase {
        apiCheckPath?: string;
    }

    export class GirdForm extends React.Component<FormProps, PurchaseState<Rows, server.Purchase>>{

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
            this.closeModalSales = this.closeModalSales.bind(this);
            this.openModalSales = this.openModalSales.bind(this);
            this.setModalSalesValue = this.setModalSalesValue.bind(this);
            this.updateItems = this.updateItems.bind(this);
            this.changeDatePicker = this.changeDatePicker.bind(this);
            this.setFDValue = this.setFDValue.bind(this);
            this.handleSearch = this.handleSearch.bind(this);
            this.checkPaymentReplyState = this.checkPaymentReplyState.bind(this);
            this.excelPrint = this.excelPrint.bind(this);
            this.excelPrintAll = this.excelPrintAll.bind(this);
            this.changeDatePickerForSearch = this.changeDatePickerForSearch.bind(this);
            this.state = {
                fieldData: {},
                detailData: [],
                gridData: { rows: [], page: 1 }, edit_type: 0,
                isShowModalSales: false,
                searchData: {
                    keyword: null, state: null, source: null,
                    start_date: new Date().getFullYear() + '/' + (new Date().getMonth() + 1) + '/1', end_date: Moment().format('YYYY-MM-DD')
                }
            }

        }
        static defaultProps: FormProps = {
            fdName: 'fieldData',
            gdName: 'searchData',
            apiPath: gb_approot + 'api/Purchase',
            apiPathDetail: gb_approot + 'api/PurchaseDetail',
            apiCheckPath: gb_approot + 'Active/Purchase/PutPurchaseCheck'
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
                .done(function (data, textStatus, jqXHRdata) {
                    this.setState({ gridData: data });
                }.bind(this))
                .fail(function (jqXHR, textStatus, errorThrown) {
                    CommFunc.showAjaxError(errorThrown);
                });
        }
        handleSubmit(e: React.FormEvent) {

            e.preventDefault();
            let fieldData = this.state.fieldData;
            if (this.state.edit_type == 1) {
                CommFunc.jqPost(this.props.apiPath, fieldData)
                    .done((data: PurchaseResult, textStatus, jqXHRdata) => {
                        if (data.result) {
                            CommFunc.tosMessage(null, '新增完成', 1);
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
        deleteSubmit() {

            if (!confirm('確定是否刪除?')) {
                return;
            }

            var ids = [];
            for (var i in this.state.gridData.rows) {
                if (this.state.gridData.rows[i].check_del) {
                    ids.push('ids=' + this.state.gridData.rows[i].purchase_no);
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
            this.setState({
                edit_type: 1, fieldData: {
                    purchase_no: '',
                    shipping_fee: 0,
                    source: SourceType.onSite,
                    state: PurchaseStateType.onSite,
                    payby: PaybyType.Cash,
                    set_date: Moment().toJSON()
                }, detailData: []
            });
        }
        updateType(no: number | string) {
            //get master data
            CommFunc.jqGet(this.props.apiPath, { no: no })
                .done((data, textStatus, jqXHRdata) => {
                    this.setState({ edit_type: 2, fieldData: data.data });
                })
                .fail((jqXHR, textStatus, errorThrown) => {
                    CommFunc.showAjaxError(errorThrown);
                });

            CommFunc.jqGet(this.props.apiPathDetail, { purchase_no: no })
                .done((data, textStatus, jqXHRdata) => {
                    this.setState({ detailData: data });
                })
                .fail((jqXHR, textStatus, errorThrown) => {
                    CommFunc.showAjaxError(errorThrown);
                });
        }
        noneType() {
            this.gridData(0)
                .done(function (data, textStatus, jqXHRdata) {
                    this.setState({ edit_type: 0, gridData: data, download_src: null, download_all_src: null });
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
        changeDatePickerForSearch(name: string, v: Date) {
            let obj = this.state.searchData
            obj[name] = Moment(v).toJSON();
            this.setState({
                searchData: obj
            });
        }
        setFDValue(fieldName, value) {
            //此function提供給次元件調用，所以要以屬性往下傳。
            var obj = this.state[this.props.fdName];
            obj[fieldName] = value;
            this.setState({ fieldData: obj });
        }
        openModalSales() {
            this.setState({ isShowModalSales: true });
        }
        closeModalSales() {
            this.setState({ isShowModalSales: false });
        }
        setModalSalesValue(sales_no: string, sales_name: string) {
            let obj = this.state.fieldData;
            obj.sales_no = sales_no;
            obj.sales_name = sales_name;
            this.setState({ fieldData: obj });
        }

        updateItems(details: Array<server.PurchaseDetail>) {

            let obj = this.state.fieldData;
            let total: number = 0;
            let total_kv: number = 0;
            details.map((item, i) => {
                item.sub_total = item.price * item.qty;
                item.kv_sub_total = item.kv * item.qty;

                total += item.sub_total;
                total_kv += item.kv_sub_total;
            });

            obj.total = total;
            obj.kv_total = total_kv;
            this.setState({ detailData: details, fieldData: obj });
        }
        checkPaymentReplyState(state: PurchaseStateType) {
            let is_mail: boolean = false;
            let fieldData = this.state.fieldData;
            if (this.state.fieldData.state >= PurchaseStateType.complete) {
                if (!confirm('此匯款狀態已核完成，確定是否繼續?')) {
                    return;
                }
            }

            if (state == PurchaseStateType.waitForShip) {
                if (!confirm('確定是否將訂單狀態修改為「匯款完畢待出貨通知」?')) {
                    return;
                }
            } else if (state == PurchaseStateType.complete) {
                if (!confirm('確定是否將訂單狀態修改為「訂單完成」?')) {
                    return;
                }
                if (confirm('確定是否發送EMail?')) {
                    is_mail = true;
                }
            }
            CommFunc.jqPut(this.props.apiCheckPath, { id: fieldData.purchase_no, state: state, is_mail: is_mail })
                .done((data, textStatus, jqXHRdata) => {
                    if (data.result) {
                        fieldData.state = state;
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
        excelPrint(e: React.SyntheticEvent) {
            e.preventDefault();

            //var parms = { tid: uniqid() };
            //$.extend(parms, this.state.searchData);

            //var url_parms = $.param(parms);
            var print_url = gb_approot + 'Base/ExcelReport/downloadExcel_PurchaseData?no=' + this.state.fieldData.purchase_no + '&t=' + CommFunc.uniqid();

            this.setState({ download_src: print_url });
            return;
        }
        excelPrintAll(e: React.SyntheticEvent) {
            e.preventDefault();

            var parms = { tid: CommFunc.uniqid() };
            $.extend(parms, this.state.searchData);

            var url_parms = $.param(parms);
            var print_url = gb_approot + 'Base/ExcelReport/downloadExcel_PurchaseDataAll?' + url_parms;

            this.setState({ download_all_src: print_url });
            return;
        }
        render() {
            var outHtml: JSX.Element = null;

            if (this.state.edit_type == 0) {
                var searchData = this.state.searchData;
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
                           <label>日期區間</label> { }
                           <span className="has-feedback">
                            <CommCmpt.InputDate id="start_date"
                                onChange={this.changeDatePickerForSearch}
                                field_name="start_date"
                                value={searchData.start_date} />
                               </span> { }
                           <label>~</label> { }
                           <span className="has-feedback">
                           <CommCmpt.InputDate id="end_date"
                               onChange={this.changeDatePickerForSearch}
                               field_name="end_date"
                               value={searchData.end_date} />
                               </span> { }
                            <label>購買編號/姓名</label> { }
                            <input type="text" className="form-control"
                                value={searchData.keyword}
                                onChange={this.changeGDValue.bind(this, 'keyword') }
                                placeholder="請輸入關鍵字..." /> { }
                            <label>通路</label> { }
                            <select className="form-control"
                                value={searchData.source}
                                onChange={this.changeGDValue.bind(this, 'source') }>
                                <option value="">全部</option>
                                {
                                DT.sourceType.map((itemData, i) => <option key={itemData.id} value={itemData.id}>{itemData.label}</option>)
                                }
                                </select> { }
                            <label>付款狀態</label> { }
                            <select className="form-control"
                                value={searchData.state}
                                onChange={this.changeGDValue.bind(this, 'state') }>
                                <option value="">全部</option>
                                {
                                DT.PurchaseStateType.map((itemData, i) => <option key={itemData.id} value={itemData.id}>{itemData.label}</option>)
                                }
                                </select> { }
                            <button className="btn-primary" type="submit"><i className="fa-search"></i> 搜尋</button> { }
                            <button type="button" onClick={this.excelPrintAll.bind(this) } className="btn-success"><i className="fa-print"></i> 列印</button> { }
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
                        <th className="col-xs-2">購買編號</th>
                        <th className="col-xs-2">會員編號</th>
                        <th className="col-xs-2">姓名</th>
                        <th className="col-xs-2">購買日期</th>
                        <th className="col-xs-1 text-center">付款狀態</th>
                        <th className="col-xs-1 text-center">通路</th>
                        </tr>
                    </thead>
                <tbody>
                    {
                    this.state.gridData.rows.map(
                        (itemData, i) =>
                            <GridRow key={i}
                                ikey={i}
                                primKey={itemData.purchase_no}
                                itemData={itemData}
                                delCheck={this.delCheck}
                                updateType={this.updateType} />
                    )
                    }
                    </tbody>
                </table>
            </div>
        <CommCmpt.GridNavPage startCount={this.state.gridData.startcount}
            endCount={this.state.gridData.endcount}
            recordCount={this.state.gridData.records}
            totalPage={this.state.gridData.total}
            nowPage={this.state.gridData.page}
            onQueryGridData={this.queryGridData}
            InsertType={this.insertType}
            deleteSubmit={this.deleteSubmit} />
        </form>
                          <iframe src={this.state.download_all_src} style={ { visibility: 'hidden', display: 'none' } } />
                            </div>
                    );
            }
            else if (this.state.edit_type == 1 || this.state.edit_type == 2) {

                let fieldData = this.state.fieldData;
                let StateForGird = CommCmpt.StateForGird;
                let TwAddress = CommCmpt.TwAddress;
                let out_detail: JSX.Element = null;
                if (this.state.edit_type == 2) {
                    out_detail = <SubForm purchase_no={this.state.fieldData.purchase_no} items={this.state.detailData} updateItems={this.updateItems} source={this.state.fieldData.source} />;
                }
                //---網路購買資料---
                let checkStateButton: JSX.Element = null;
                let receiveHtml: JSX.Element = null;
                if (fieldData.source == SourceType.online) {
                    checkStateButton = (
                        <div className="form-group">
                        <label className="col-xs-1 control-label text-danger">審核</label>
                        <div className="col-xs-7">
                            <button type="button" className="btn-info" onClick={this.checkPaymentReplyState.bind(this, PurchaseStateType.waitForShip) }>
                            <i className="fa-check"></i> 核對正確(狀態: 待出貨通知) </button> { }
                            <button type="button" className="btn-success" onClick={this.checkPaymentReplyState.bind(this, PurchaseStateType.complete) }>
                            <i className="fa-envelope"></i> 核對正確, 並寄送出貨通知(狀態: 訂單完成) </button> { }
                            </div>
                            <small className="col-3 text-error">*若購買人未填寫email, 則無法寄送通知信</small>
                            </div>
                    );
                    //網路購買才顯示收件人及匯款對帳資訊
                    receiveHtml = (
                        <div>
                        {/*---收件人---*/}
                        <div className="col-xs-10 col-xs-offset-2">
                            <div className="item-title col-xs-offset-4">
                            <h4>收件人資料</h4>
                                </div>
                              <div className="form-group">
                                <label className="col-xs-1 control-label">收件人</label>
                                <div className="col-xs-2">
                                  <input type="text"
                                      className="form-control"
                                      onChange={this.changeFDValue.bind(this, 'receive_person') }
                                      value={fieldData.receive_person}
                                      maxLength={16}
                                      disabled/>
                                    </div>
                                <label className="col-xs-1 control-label">電話</label>
                                <div className="col-xs-2">
                                  <input type="text"
                                      className="form-control"
                                      onChange={this.changeFDValue.bind(this, 'receive_tel') }
                                      value={fieldData.receive_tel}
                                      maxLength={16}
                                      disabled/>
                                    </div>
                                <label className="col-xs-1 control-label">手機</label>
                                <div className="col-xs-2">
                                  <input type="text"
                                      className="form-control"
                                      onChange={this.changeFDValue.bind(this, 'receive_mobile') }
                                      value={fieldData.receive_mobile}
                                      maxLength={16}
                                      disabled/>
                                    </div>
                                  </div>
                              <div className="form-group">
                                <label className="col-xs-1 control-label">地址</label>
                                <div className="col-xs-2">
                                    <input type="text"
                                        className="form-control"
                                        onChange={this.changeFDValue.bind(this, 'receive_zip') }
                                        value={fieldData.receive_zip}
                                        maxLength={5}
                                        disabled
                                        />
                                    </div>
                                <div className="col-xs-6">
                                    <input type="text"
                                        className="form-control"
                                        onChange={this.changeFDValue.bind(this, 'receive_address') }
                                        value={fieldData.receive_address}
                                        maxLength={256}
                                        disabled/>
                                    </div>
                                  </div>
                              <div className="form-group">
                                <label className="col-xs-1 control-label">備註</label>
                                <div className="col-xs-8">
                                    <textarea type="text"
                                        className="form-control"
                                        onChange={this.changeFDValue.bind(this, 'receive_memo') }
                                        value={fieldData.receive_memo}
                                        maxLength={256}
                                        disabled
                                        ></textarea>
                                    </div>
                                  </div>
                            </div>
                            {/*---收件人end---*/}
                            {/*---已匯款對帳資訊---*/}
                            <div className= "col-xs-10 col-xs-offset-1">
                                <div className="item-title col-xs-offset-5">
                            <h4>已付款通知</h4>
                                    </div>
                                <div className= "form-group">
                                    <label className="col-xs-2 control-label">匯款帳號後5碼</label>
                                    < div className= "col-xs-1" >
                                        <input type="text"
                                            className="form-control"
                                            onChange={this.changeFDValue.bind(this, 'remit_number') }
                                            value={fieldData.remit_number}
                                            maxLength={5}
                                            pattern="[0-9]{5}" title="限輸入數字"
                                            required disabled={true}/>
                                        </div >
                            <label className="col-xs-1 control-label">匯款日期</label>
                            < div className= "col-xs-2" >
                                <CommCmpt.InputDate id="remit_day"
                                    onChange={this.changeDatePicker}
                                    field_name="remit_day"
                                    value={fieldData.remit_day}
                                    disabled={true} required={true} ver={1} />
                                </div >
                            <label className="col-xs-1 control-label">匯款時間</label>
                            < div className= "col-xs-2" >
                                <select className="form-control" value={fieldData.remit_time} required
                                    disabled={true}
                                    onChange={this.changeFDValue.bind(this, 'remit_time') }>
                                        <option value=""></option>
                                        {
                                        DT.remitTimeData.map((itemData, i) => <option key={i} value={itemData.id}>{itemData.label}</option>)
                                        }
                                    </select>
                                </div >
                            <label className="col-xs-1 control-label">匯款金額</label>
                            < div className= "col-xs-2" >
                                <input type="number" className="form-control"
                                    value={fieldData.remit_money}
                                    disabled={true}
                                    onChange={this.changeFDValue.bind(this, 'remit_money') }
                                    required/>
                                </div >
                                    </div >
                            <div className="form-group">
                                <label className="col-xs-2 control-label">已付款通知備註</label>
                                <div className="col-xs-10">
                                    <textarea type="text"
                                        className="form-control"
                                        onChange={this.changeFDValue.bind(this, 'remit_memo') }
                                        value={fieldData.remit_memo}
                                        disabled={true}
                                        maxLength={256}></textarea>
                                    </div>
                                </div>
                                </div>
                            {/*---已匯款對帳資訊end---*/}
                            </div>
                    );
                }
                //---網路購買資料 end---

                outHtml = (
                    <div>
  <ul className="breadcrumb">
    <li><i className="fa-list-alt"></i> {this.props.menuName}</li>
      </ul>
  <h4 className="title"> {this.props.caption} 基本資料維護</h4>
  <form className="form-horizontal clearfix" onSubmit={this.handleSubmit}>
    <div className="col-xs-12">
      <div className="alert alert-warning">
        <p><strong className="text-danger">紅色標題</strong> 為必填欄位。</p>
          </div>
        </div>
    <div className="col-xs-6">

      <div className="form-group">
        <label className="col-xs-2 control-label text-danger">購買編號</label>
        <div className="col-xs-10">
          <input type="text"
              className="form-control"
              onChange={this.changeFDValue.bind(this, 'purchase_no') }
              value={fieldData.purchase_no}
              maxLength={16}
              disabled required
              placeholder="系統自動產生..."/>
            </div>
          </div>

      <div className="form-group">
        <label className="col-xs-2 control-label text-danger">購買日期</label>
        <div className="col-xs-10">
          <CommCmpt.InputDate id="set_date"
              onChange={this.changeDatePicker }
              field_name="set_date"
              value={fieldData.set_date}
              disabled={false} required={true} ver={1} />
            </div>
          </div>

    <div className="form-group">
        <label className="col-xs-2 control-label text-danger">付款狀態</label>
        <div className="col-xs-10">
            <div className="input-group">
                <label><StateForGird id={fieldData.state} stateData={DT.PurchaseStateType} /></label>
                </div>
            </div>
        </div>
    <div className="form-group">
        <label className="col-xs-2 control-label text-danger">取貨方式</label>
        <div className="col-xs-10">
            <div className="input-group">
                <label><StateForGird id={fieldData.pickup_state} stateData={DT.PurchasePickupState} /></label>
                </div>
            </div>
        </div>
    <div className="form-group">
        <label className="col-xs-2 control-label text-danger">通路</label>
        <div className="col-xs-10">
            <div className="input-group">
                <label><StateForGird id={fieldData.source} stateData={DT.sourceType} /></label>
                </div>
            </div>
        </div>
        </div>
    <div className="col-xs-6">

      <div className="form-group">
        <label className="col-xs-2 control-label text-danger">購買人</label>
        <div className="col-xs-10">
          <div className="input-group">
            <input type="text"
                className="form-control"
                onChange={this.changeFDValue.bind(this, 'sales_name') }
                value={fieldData.sales_name}
                maxLength={32}
                required />
            <span className="input-group-btn">
              <a className="btn" onClick={this.openModalSales}
                  disabled={false}><i className="fa fa-search"></i></a>
                </span>
              </div>
            </div>
          </div>

    <div className="form-group">
        <label className="col-xs-2 control-label text-danger">總計金額</label>
        <div className="col-xs-10">
            <div className="input-group">
                <label>{fieldData.total}</label>
                </div>
            </div>
        </div>
    <div className="form-group">
        <label className="col-xs-2 control-label text-danger">總計KV</label>
        <div className="col-xs-10">
            <div className="input-group">
                <label>{fieldData.kv_total}</label>
                </div>
            </div>
        </div>
    <div className="form-group">
        <label className="col-xs-2 control-label text-danger">運費</label>
        <div className="col-xs-10">
            <div className="input-group">
                <label>{fieldData.shipping_fee}</label>
                </div>
            </div>
        </div>
        </div>

   <div className="col-xs-12">
       {checkStateButton}
       </div>
    {/*--收件人資料--*/}
      {receiveHtml}
    {/*--收件人資料 end--*/}
    <div className="col-xs-12">
      <div className="form-action">
        <div className="col-xs-10 col-xs-offset-2">
          <button type="submit" className="btn-primary"><i className="fa-check"></i> 儲存</button> { }
          <button type="button" onClick={this.noneType}><i className="fa-times"></i> 回前頁</button> { }
          <button type="button" onClick={this.excelPrint.bind(this) } className="btn-success"><i className="fa-print"></i> 列印三聯單</button> { }
            </div>
          </div>
        </div>
      </form>
    <CommCmpt.ModalSales
        close={this.closeModalSales}
        isShow={this.state.isShowModalSales}
        fieldSalesNo={this.state.fieldData.sales_no}
        fieldSalesName={this.state.fieldData.sales_name}
        updateView={this.setModalSalesValue}
        />
    {out_detail}
    <iframe src={this.state.download_src} style={ { visibility: 'hidden', display: 'none' } } />
                        </div>
                );
            }

            return outHtml;
        }
    }

    interface SubFormProps {
        purchase_no: string,
        items: Array<server.PurchaseDetail>,
        updateItems?(p1: Array<server.PurchaseDetail>): void,
        apiPath?: string,
        source: number
    }
    interface SubFormState {
        isShowModalProduct?: boolean,
        editKey?: number,
        editItem?: server.PurchaseDetail,
        copyItem?: server.PurchaseDetail
    }
    class SubForm extends React.Component<SubFormProps, SubFormState>{

        constructor() {

            super();
            this.updateItem = this.updateItem.bind(this);
            this.newDetail = this.newDetail.bind(this);
            this.newCancel = this.newCancel.bind(this);
            this.submitNew = this.submitNew.bind(this);
            this.submitEdit = this.submitEdit.bind(this);
            this.CompleteChangeProductSN = this.CompleteChangeProductSN.bind(this);
            this.state = { isShowModalProduct: false, editKey: 0 }
        }
        static defaultProps = {
            items: [],
            apiPath: gb_approot + 'api/PurchaseDetail'
        }

        updateItem(index: number, detail: server.PurchaseDetail) {
            let obj: Array<server.PurchaseDetail> = this.props.items;
            let item = obj[index];

            item.purchase_detail_id = detail.purchase_detail_id;
            item.product_no = detail.product_no;
            item.product_name = detail.product_name;
            item.price = detail.price;
            item.qty = 0;
            item.sub_total = 0;

            this.props.updateItems(obj);
        }

        newDetail() {
            let obj: Array<server.PurchaseDetail> = this.props.items;
            obj.push({
                edit_type: 1,
                purchase_no: this.props.purchase_no,
                product_no: null,
                purchase_detail_id: CommFunc.uniqid()
            });
            this.props.updateItems(obj);
        }
        newCancel(e: React.MouseEvent) {
            let obj = this.props.items;
            obj.splice(-1, 1);
            this.props.updateItems(obj);
        }
        editDetail(index: number, e: React.MouseEvent) {
            let obj = this.props.items;
            let item = obj[index];
            this.state.copyItem = CommFunc.clone(item);
            item.edit_type = 2;

            this.props.updateItems(obj);
        }
        editCancel(index: number, e: React.MouseEvent) {
            let obj = this.props.items;
            let item = obj[index];

            item.qty = this.state.copyItem.qty;
            item.edit_type = 0;

            this.state.copyItem = null;
            this.props.updateItems(obj);
        }
        submitNew(e: React.MouseEvent) {
            let obj = this.props.items;
            let item = obj.slice(-1)[0]; //新增的該筆資料一定是陣列的最後一筆
            item.purchase_detail_id = 0;
            CommFunc.jqPost(this.props.apiPath, item)
                .done((data, textStatus, jqXHRdata) => {
                    if (data.result) {
                        CommFunc.tosMessage(null, '增新完成', 1);
                        item.edit_type = 0;
                        item.purchase_detail_id = data.id;
                        this.props.updateItems(obj);
                    } else {
                        alert(data.message);
                    }
                })
                .fail((jqXHR, textStatus, errorThrown) => {
                    CommFunc.showAjaxError(errorThrown);
                });
        }
        submitEdit(index: number) {
            let obj = this.props.items;
            let item = obj[index];

            CommFunc.jqPut(this.props.apiPath, item)
                .done((data, textStatus, jqXHRdata) => {
                    if (data.result) {
                        CommFunc.tosMessage(null, '修改完成', 1);
                        item.edit_type = 0;
                        this.props.updateItems(obj);
                    } else {
                        alert(data.message);
                    }
                })
                .fail((jqXHR, textStatus, errorThrown) => {
                    CommFunc.showAjaxError(errorThrown);
                });
        }
        submitDelete(index: number) {

            let obj = this.props.items;
            let item = obj[index];

            if (!confirm('是否刪除?')) {
                return;
            }

            CommFunc.jqDelete(this.props.apiPath + '?id=' + item.purchase_detail_id, {})
                .done((data, textStatus, jqXHRdata) => {
                    if (data.result) {
                        CommFunc.tosMessage(null, '刪除完成', 1);
                        obj.splice(index, 1);
                        console.log(obj);
                        this.props.updateItems(obj);
                    } else {
                        alert(data.message);
                    }
                })
                .fail((jqXHR, textStatus, errorThrown) => {
                    CommFunc.showAjaxError(errorThrown);
                });
        }

        setValue(index: number, field: string, e: React.SyntheticEvent) {
            let obj = this.props.items;
            let item = obj[index];
            let input: HTMLInputElement = e.target as HTMLInputElement;
            item[field] = input.value;
            item.sub_total = item.qty * item.price;
            item.kv_sub_total = item.qty * item.kv;
            this.props.updateItems(obj);
        }

        CompleteChangeProductSN(f, i, select_item: Typeahead.SelectItem) {
            CommFunc.jqGet(gb_approot + 'api/Product?no=' + select_item.value, {})
                .done((result: IResultData<server.Product>) => {
                    let obj = this.props.items;
                    let item = obj[i];
                    item.product_no = select_item.value;
                    item.product_name = result.data.product_name;
                    item.price = result.data.price;
                    item.kv = result.data.kvalue;
                    this.updateItem(i, item);
                })
        }

        render() {
            //console.log(new Date(), 'SubForm', 'render', this.props.items);
            var TypeAhead = Typeahead.ReactTypeahead;
            //現場購買才可以新增購買清單
            let addDetailButton: JSX.Element = null;
            addDetailButton = this.props.source == SourceType.onSite ? <button type="button" onClick={this.newDetail}>新增</button> : null;

            return (
                <div>
  <div className="row">
    <div className="col-xs-12">
      <table className="table-condensed">
        <caption>
            產品購買清單
            {addDetailButton}
            </caption>
        <tbody>
          <tr>
            <th className="col-xs-1">編輯</th>
            <th className="col-xs-1">項次</th>
            <th className="col-xs-2">品號</th>
            <th className="col-xs-3">品名</th>
            <th className="col-xs-1">單價</th>
            <th className="col-xs-1">KV</th>
            <th className="col-xs-1">數量</th>
            <th className="col-xs-1">小計</th>
            <th className="col-xs-1">KV | T</th>
              </tr>
          {
          this.props.items.map((detail, i) => {
              let out_detail_html: JSX.Element;
              let oper_button: JSX.Element;

              if (detail.edit_type == 0) {
                  oper_button = (
                      <div>
                      <button className="btn btn-link text-danger" title="刪除" onClick={this.submitDelete.bind(this, i) }>
                          <span className="glyphicon glyphicon-remove"></span>
                          </button>
                        <button className="btn btn-link text-success" onClick={this.editDetail.bind(this, i) } title="編輯">
                            <span className="glyphicon glyphicon-pencil"></span>
                            </button>
                          </div>
                  );
              }

              if (detail.edit_type == 1) {
                  oper_button = (
                      <div>
                      <button className="btn btn-link text-danger" onClick={this.newCancel} title="放棄">
                          <span className="glyphicon glyphicon-share-alt"></span>
                          </button>
                      <button className="btn btn-link text-right" onClick={this.submitNew}>
                              <span className="glyphicon glyphicon glyphicon-ok"  title="確認"></span>
                          </button>
                          </div>
                  );
              }

              if (detail.edit_type == 2) {
                  oper_button = (
                      <div>
                      <button className="btn btn-link text-danger" onClick={this.editCancel.bind(this, i) } title="放棄">
                          <span className="glyphicon glyphicon-share-alt"></span>
                          </button>
                          <button className="btn btn-link text-right" onClick={this.submitEdit.bind(this, i) } title="確認">
                              <span className="glyphicon glyphicon glyphicon-ok"></span>
                              </button>
                          </div>
                  );
              }

              out_detail_html = (
                  <tr key={detail.purchase_detail_id}>
              <td>{oper_button}</td>
              <td>{detail.item_no}</td>
              <td>
                <TypeAhead
                    fieldName="product_no"
                    value={detail.product_no}
                    inputClass="col-xs-12"
                    index={i}
                    disabled={detail.edit_type != 1}
                    apiPath={gb_approot + 'api/GetAction/ta_Product'}
                    onCompleteChange={this.CompleteChangeProductSN} />
                  </td>
              <td>{detail.product_name}</td>
              <td><input type="number" value={detail.price} disabled={true} /></td>
              <td><input type="number" value={detail.kv} disabled={true} /></td>
              <td><input type="number" value={detail.qty} onChange={this.setValue.bind(this, i, 'qty') } disabled={detail.edit_type == 0} /></td>
              <td><input type="number" value={detail.sub_total} disabled={true}/></td>
              <td><input type="number" value={detail.kv_sub_total} disabled={true}/></td>
                      </tr>
              )

              return out_detail_html;
          })
          }
            </tbody>
          </table>
        </div>
      </div>

                    </div>
            )
        }
    }




    interface ModalProductProps {
        editIndex: number,
        isShow: boolean,
        item: server.PurchaseDetail,
        setValue?(): void,
        close?(): void
        updateItem?(index: number, detail: server.PurchaseDetail): void,
    }
    interface ModalProductState {
        modalData?: Array<{ product_no: string, product_name: string, price: number, kvalue: number }>,
        keyword?: string
    }
    class ModalProduct extends React.Component<ModalProductProps, ModalProductState>{
        constructor() {
            super();

            this.close = this.close.bind(this);
            this.queryModal = this.queryModal.bind(this);
            this.setModalKeyword = this.setModalKeyword.bind(this);
            this.selectModal = this.selectModal.bind(this);
            this.render = this.render.bind(this);

            this.state = {
                modalData: [],
                keyword: null
            }
        }

        close() {
            this.props.close();
        }
        queryModal() {
            CommFunc.jqGet(gb_approot + 'api/GetAction/GetModalQueryProduct', { keyword: this.state.keyword })
                .done((data, textStatus, jqXHRdata) => {
                    var obj = this.state.modalData;
                    obj = data;
                    this.setState({ modalData: obj });
                })
                .fail((jqXHR, textStatus, errorThrown) => {
                    CommFunc.showAjaxError(errorThrown);
                });
        }
        setModalKeyword(e: React.SyntheticEvent) {

            let input: HTMLInputElement = e.target as HTMLInputElement;
            let getObj = this.state.keyword;
            getObj = input.value;
            this.setState({ keyword: getObj });
        }
        selectModal(product_no: string, e: React.SyntheticEvent) {

            let qObj = this.state.modalData;

            qObj.map((item, index, ary) => {

                if (item.product_no == product_no) {
                    let obj: server.PurchaseDetail = this.props.item;
                    obj.product_no = item.product_no;
                    obj.product_name = item.product_name;
                    obj.price = item.price;
                    obj.kv = item.kvalue;
                    this.props.updateItem(this.props.editIndex, obj);
                }
            });

            this.close();
        }

        static defaultProps = {
            isShow: false
        }
        render() {

            let out_html: JSX.Element = <div></div>;
            let ModalQ = ReactBootstrap.Modal;

            if (this.props.isShow) {
                out_html = (
                    <ModalQ bsSize="large" onHide={this.close}>
    <div className="modal-body">
        <div className="table-header">
            <div className="table-filter">
                <div className="form-inline">
                    <div className="form-group">
                        <label>購買編號</label> { }
                        <input type="text" className="form-control input-sm"
                            />
                        </div>

                    <div className="form-group">
                        <button className="btn-primary btn-sm" onClick={this.queryModal}><i className="fa-search"></i> 搜尋</button>
                        </div>
                    </div>
                </div>
            </div>
        <table className="table-condensed">
            <tbody>
                <tr>
                    <th className="col-xs-3">品號</th>
                    <th className="col-xs-3">品名</th>
                    <th className="col-xs-3">單價</th>
                    <th className="col-xs-3">KV</th>
                    </tr>
                {
                this.state.modalData.map((itemData, i) => {

                    var out_html =
                        <tr key={itemData.product_no}>
        <td>
            <button type="button" className="btn btn-link" onClick={this.selectModal.bind(this, itemData.product_no) }>{itemData.product_no}</button></td>
        <td>{itemData.product_name}</td>
        <td>{itemData.price}</td>
        <td>{itemData.kvalue}</td>
                            </tr>
                        ;
                    return out_html;
                })
                }
                </tbody>
            </table>
        </div>
                        </ModalQ>
                );
            }

            return out_html
        }
    }
}
var dom = document.getElementById('page_content');
ReactDOM.render(<Purchase.GirdForm caption={gb_caption} menuName={gb_menuname} iconClass="fa-list-alt" />, dom);