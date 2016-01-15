import $ = require('jquery');
import React = require('react');
import ReactDOM = require('react-dom');
import Moment = require('moment');
import ReactBootstrap = require("react-bootstrap");
import CommCmpt = require('comm-cmpt');
import CommFunc = require('comm-func');
import DT = require('dt');
import "Pikaday/css/pikaday.css";

namespace Sales {
    interface Rows {
        check_del: boolean,
        sales_no: string;
        sales_name: string;
        join_date: Date;
        sales_state: number;
        rank: number;
    }
    interface FormState<G, F> extends BaseDefine.GirdFormStateBase<G, F> {
        isShowModalSales?: boolean;
        ModalDataSales?: {
            search?: { keyword: string }
            isShowModalSales?: boolean;
        };
        isShowModalShare?: boolean,
        isShowModalShareView?: boolean,
        searchData?: {
            keyword: string,
            rank: number
        }
        download_src?: string;
    }
    interface FormResult extends IResultBase {
        no: string
    }
    interface ModalShareProps {
        sales_sn_site: string;
        upMasterData(share_sn: string, share_name: string): void;
        close(): void;
        isShow: boolean;
    }
    interface ModalShareState {
        share_data?: SalesTree
        checked_sales_no?: string
        checked_sales_name?: string
    }
    interface TreeInfoProps {
        data: SalesTree,
        level: number,
        checked?: boolean,
        onCheckedChange(sales_no: string, sales_name: string): void,
        key: any
    }
    interface SalesTree {
        sales_no?: string;
        sales_name?: string;
        sub: Array<SalesTree>;
        sub_count?: number;
        is_me?: boolean;
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

            let out_func_1 = null;
            let out_func_2 = null;

            if (this.props.itemData.sales_no != 'A034689493') {
                out_func_1 = <CommCmpt.GridCheckDel iKey={this.props.ikey}
                    chd={this.props.itemData.check_del}
                    delCheck={this.delCheck} />;

                out_func_2 = <CommCmpt.GridButtonModify modify={this.modify}/>
            }
            let StateForGird = CommCmpt.StateForGird;
            return <tr>
                    <td className="text-center">
                    {out_func_1}
                        </td>
                    <td className="text-center">
                        {out_func_2}
                        </td>
                    <td>{this.props.itemData.sales_no}</td>
                    <td><StateForGird id={this.props.itemData.rank} stateData={DT.SalesRankType} /></td>
                    <td>{this.props.itemData.sales_name}</td>
                    <td>{Moment(this.props.itemData.join_date).format(DT.dateFT) }</td>
                    {/*<td>{this.props.itemData.sales_state}</td>*/}
                </tr>;
        }
    }
    //設定安置人start
    class ModalShare extends React.Component<ModalShareProps, ModalShareState>{
        constructor() {
            super();
            this.componentDidMount = this.componentDidMount.bind(this);
            this.close = this.close.bind(this);
            this.sure = this.sure.bind(this);
            this.onCheckedChange = this.onCheckedChange.bind(this);
            this.queryShareBySales = this.queryShareBySales.bind(this);
            this.querySub = this.querySub.bind(this);
            this.onChange = this.onChange.bind(this);
            this.state = {
                share_data: {
                    sub: []
                },
                checked_sales_no: null
            };
        }
        static defaultProps = {
        }
        componentDidMount() {
            this.queryShareBySales();
        }
        queryShareBySales() {
            CommFunc.jqGet(gb_approot + 'api/GetAction/GetShareBySales', { sales_no: this.props.sales_sn_site })
                .done((data, textStatus, jqXHRdata) => {
                    //data 為樹狀排列完成資料
                    this.setState({ share_data: data });

                    for (let i in data) {
                        var obj = data[i];
                        //obj.
                    }

                    // this.props.upMasterData();
                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    CommFunc.showAjaxError(errorThrown);
                });
        }

        onChange(e: React.SyntheticEvent) {
            let input: HTMLInputElement = e.target as HTMLInputElement;
            this.setState(
                {
                    checked_sales_no: this.state.share_data.sales_no,
                    checked_sales_name: this.state.share_data.sales_name
                });
        }
        onCheckedChange(sales_sn: string, sales_name: string) {
            this.setState({ checked_sales_no: sales_sn, checked_sales_name: sales_name });
        }

        upMasterData() {

        }

        private querySub(obj: SalesTree): SalesTree {
            if (obj.sales_no == this.state.checked_sales_no) {
                return obj;
            }
            else {
                for (var i in obj.sub) {
                    let sub = obj.sub[i];
                    this.querySub(sub)
                }
            }
        }
        close() {
            this.props.close();
        }
        sure() {
            if (confirm('安置人是否確認?')) {

                var params = { sales_no: this.props.sales_sn_site, share_sn: this.state.checked_sales_no };
                CommFunc.jqPut(gb_approot + 'api/GetAction/PutSalesSite', params)
                    .done((data: IResultBase, textStatus, jqXHRdata) => {
                        if (data.result) {
                            CommFunc.tosMessage(null, '設定完成', ToastrType.success);
                            this.queryShareBySales();
                            this.props.upMasterData(this.state.checked_sales_no, this.state.checked_sales_name);
                        } else {
                            alert(data.message);
                        }
                    })
                    .fail((jqXHR, textStatus, errorThrown) => {
                        CommFunc.showAjaxError(errorThrown);
                    });
            }
        }
        render() {
            var Modal = ReactBootstrap.Modal;
            let Button = ReactBootstrap.Button;

            let ck_out_html = null;

            if (this.state.share_data.sub_count < 3) {
                ck_out_html = <span>
    <input type="radio" name="sales_site"
        value={this.state.share_data.sales_no}
        onChange={this.onChange} />
    <i className="fa-check"></i>
                    </span>;
            }

            let out_html: JSX.Element = (
                <Modal onHide={this.close} show={this.props.isShow}>
                    <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title-lg">
                            安置設定
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                        <div>
                            <ul className="root tree">
                                <li>
                                    <span className="fa-minus-square"></span>
                                    <label>
                                {this.state.share_data.sales_name}{ck_out_html}
                                        </label>
                                {
                                this.state.share_data.sub.map(
                                    (itemData, i) => {
                                        var out_html =
                                            <TreeInfo
                                                key={itemData.sales_no}
                                                data={itemData}
                                                level={0}
                                                onCheckedChange={this.onCheckedChange}
                                                />;
                                        return out_html;
                                    })
                                }
                                    </li>
                                </ul>
                            </div>
                            </Modal.Body>
                        <Modal.Footer>
                            <Button type="button" onClick={this.close}>關閉</Button>
                            <Button type="button" onClick={this.sure} bsStyle="primary" disabled={this.state.checked_sales_no == null}>確認</Button>
                            </Modal.Footer>
                    </Modal>
            );

            return out_html;
        }
    }
    class TreeInfo extends React.Component<TreeInfoProps, any>{
        now_level: number;
        constructor() {
            super();
            this.componentWillMount = this.componentWillMount.bind(this);
            this.onChange = this.onChange.bind(this);
        }
        static defaultProps = {
            checked: false
        }
        componentWillMount() {
            this.now_level = this.props.level + 1;
        }
        componentDidMount() {

        }
        onChange(e: React.SyntheticEvent) {
            let input: HTMLInputElement = e.target as HTMLInputElement;
            this.props.onCheckedChange(this.props.data.sales_no, this.props.data.sales_name);
        }
        render() {

            let ck_out_html = null;

            if (this.props.data.sub_count < 3) {
                ck_out_html = <span>
    <input type="radio" name="sales_site" value={this.props.data.sales_no} onChange={this.onChange} />
    <i className="fa-check"></i>
                    </span>;

            }

            var out_html =
                <ul className="tree">
                    <li>
                        <label>
                            <span className="fa-plus-square"></span>
                            {this.props.data.sales_name}
                            {ck_out_html}
                            </label>
                                            {
                                            this.props.data.sub.map(
                                                (itemData, i) => {
                                                    var out_html = <TreeInfo data={itemData} level={this.now_level} onCheckedChange={this.props.onCheckedChange} key={itemData.sales_no} />
                                                        ;
                                                    return out_html;
                                                })
                                            }
                        </li>
                    </ul>;
            return out_html;
        }
    }
    //設定安置人end
    //檢視共享圈start
    class ModalShareView extends React.Component<ModalShareProps, ModalShareState>{
        constructor() {
            super();
            this.componentDidMount = this.componentDidMount.bind(this);
            this.close = this.close.bind(this);
            this.onCheckedChange = this.onCheckedChange.bind(this);
            this.queryShareBySales = this.queryShareBySales.bind(this);
            this.querySub = this.querySub.bind(this);
            this.onChange = this.onChange.bind(this);
            this.state = {
                share_data: {
                    sub: []
                },
                checked_sales_no: null
            };
        }
        static defaultProps = {
        }
        componentDidMount() {
            this.queryShareBySales();
        }
        queryShareBySales() {
            CommFunc.jqGet(gb_approot + 'api/GetAction/GetShareBySales_View', { sales_no: this.props.sales_sn_site })
                .done((data, textStatus, jqXHRdata) => {
                    //data 為樹狀排列完成資料
                    this.setState({ share_data: data });

                    for (let i in data) {
                        var obj = data[i];
                        //obj.
                    }

                    // this.props.upMasterData();
                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    CommFunc.showAjaxError(errorThrown);
                });
        }

        onChange(e: React.SyntheticEvent) {
            let input: HTMLInputElement = e.target as HTMLInputElement;
            this.setState(
                {
                    checked_sales_no: this.state.share_data.sales_no,
                    checked_sales_name: this.state.share_data.sales_name
                });
        }
        onCheckedChange(sales_sn: string, sales_name: string) {
            this.setState({ checked_sales_no: sales_sn, checked_sales_name: sales_name });
        }

        private querySub(obj: SalesTree): SalesTree {
            if (obj.sales_no == this.state.checked_sales_no) {
                return obj;
            }
            else {
                for (var i in obj.sub) {
                    let sub = obj.sub[i];
                    this.querySub(sub)
                }
            }
        }
        close() {
            this.props.close();
        }

        render() {
            var Modal = ReactBootstrap.Modal;
            let Button = ReactBootstrap.Button;

            let ck_out_html = null;

            let out_html: JSX.Element = (
                <Modal onHide={this.close} show={this.props.isShow}>
                    <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title-lg">
                            共享圈成員檢視(目前自己底層已安置{this.state.share_data.sub_count}人)
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                        <div>
                            <ul className="root tree">
                                <li>
                                    <span className="fa-minus-square"></span>
                                    <label>
                                <span className="label label-warning">安置人</span>
                                {this.state.share_data.sales_name}
                                        </label>
                                {
                                this.state.share_data.sub.map(
                                    (itemData, i) => {
                                        var out_html =
                                            <TreeInfoView
                                                key={itemData.sales_no}
                                                data={itemData}
                                                level={0}
                                                onCheckedChange={this.onCheckedChange}
                                                />;
                                        return out_html;
                                    })
                                }
                                    </li>
                                </ul>
                            </div>
                            </Modal.Body>
                        <Modal.Footer>
                            <Button type="button" onClick={this.close}>關閉</Button>
                            </Modal.Footer>
                    </Modal>
            );

            return out_html;
        }
    }
    class TreeInfoView extends React.Component<TreeInfoProps, any>{
        now_level: number;
        constructor() {
            super();
            this.componentWillMount = this.componentWillMount.bind(this);
            this.onChange = this.onChange.bind(this);
        }
        static defaultProps = {
            checked: false
        }
        componentWillMount() {
            this.now_level = this.props.level + 1;
        }
        componentDidMount() {

        }
        onChange(e: React.SyntheticEvent) {
            let input: HTMLInputElement = e.target as HTMLInputElement;
            this.props.onCheckedChange(this.props.data.sales_no, this.props.data.sales_name);
        }
        render() {

            let ck_out_html = null;

            var out_html =
                <ul className="tree">
                    <li>
                        <label>
                            <span className="fa-plus-square"></span>
                            {this.props.data.sales_name}
                            </label>
                                            {
                                            this.props.data.sub.map(
                                                (itemData, i) => {
                                                    var out_html = <TreeInfoView data={itemData} level={this.now_level} onCheckedChange={this.props.onCheckedChange} key={itemData.sales_no} />
                                                        ;
                                                    return out_html;
                                                })
                                            }
                        </li>
                    </ul>;
            return out_html;
        }
    }
    //檢視共享圈end
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
            this.setFDValue = this.setFDValue.bind(this);
            this.closeModalSales = this.closeModalSales.bind(this);
            this.openModalSales = this.openModalSales.bind(this);
            this.setModalSalesValue = this.setModalSalesValue.bind(this);

            this.closeModalShare = this.closeModalShare.bind(this);
            this.openModalShare = this.openModalShare.bind(this);

            this.openModalShareView = this.openModalShareView.bind(this);
            this.closeModalShareView = this.closeModalShareView.bind(this);

            this.changeDatePicker = this.changeDatePicker.bind(this);
            this.onModalShareChange = this.onModalShareChange.bind(this);
            this.resetPasswrod = this.resetPasswrod.bind(this);
            this.excelPrint = this.excelPrint.bind(this);
            this.render = this.render.bind(this);

            this.state = {
                fieldData: { join_date: null, city: '', country: '' },
                gridData: { rows: [], page: 1 }, edit_type: 0,
                searchData: { keyword: null, rank: null },
                isShowModalSales: false
            }

            Moment.locale('zh-tw');
        }
        static defaultProps: BaseDefine.GridFormPropsBase = {
            fdName: 'fieldData',
            gdName: 'searchData',
            apiPath: gb_approot + 'api/Sales'
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
        setFDValue(fieldName, value) {
            //此function提供給次元件調用，所以要以屬性往下傳。
            var obj = this.state[this.props.fdName];
            obj[fieldName] = value;
            this.setState({ fieldData: obj });
        }
        changeDatePicker(name: string, v: Date) {
            let obj = this.state.fieldData
            obj[name] = Moment(v).toJSON();
            this.setState({
                fieldData: obj
            });
        }

        openModalSales() {
            this.setState({ isShowModalSales: true });
        }
        closeModalSales() {
            this.setState({ isShowModalSales: false });
        }
        setModalSalesValue(sales_no: string, sales_name: string) {
            let obj = this.state.fieldData;
            obj.recommend_no = sales_no;
            obj.recommend_name = sales_name;
            this.setState({ fieldData: obj });
        }

        openModalShare() {
            this.setState({ isShowModalShare: true });
        }
        onModalShareChange(share_sn: string, share_name: string) {
            let obj = this.state.fieldData;
            obj.share_sn = share_sn;
            obj.share_name = share_name;
            this.setState({ fieldData: obj });
        }
        closeModalShare() {
            this.setState({ isShowModalShare: false });
        }

        openModalShareView() {
            this.setState({ isShowModalShareView: true });
        }
        closeModalShareView() {
            this.setState({ isShowModalShareView: false });
        }

        resetPasswrod() {
            if (!confirm('確定是否重設密碼?')) {
                return;
            }
            console.log(this.state.fieldData.sales_no);
            CommFunc.jqGet(gb_approot + 'api/GetAction/resetPasswrod', { id: this.state.fieldData.sales_no })
                .done((data, textStatus, jqXHRdata) => {
                    if (data) {
                        CommFunc.tosMessage(null, '完成重設密碼', ToastrType.success);
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
            var print_url = gb_approot + 'Base/ExcelReport/downloadExcel_SalesData';

            this.setState({ download_src: print_url });
            return;
        }
        render() {

            var outHtml: JSX.Element = null;

            var GridNavPage = CommCmpt.GridNavPage;
            var InputDate = CommCmpt.InputDate;
            var ModalSales = CommCmpt.ModalSales;

            if (this.state.edit_type == 0) {
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
                            {}
                            <input type="text" className="form-control" value={searchData.keyword} onChange={this.changeGDValue.bind(this, 'keyword') } placeholder="請輸入姓名或電話..." /> { }
                            <label>階級</label>
                            <select className="form-control" value={searchData.rank} onChange={this.changeGDValue.bind(this, 'rank') } >
                                <option value="">全部</option>
                                {
                                DT.SalesRankType.map((itemData, i) => <option key={i} value={itemData.id}>{itemData.label}</option>)
                                }
                                </select> { }
                            <button className="btn-primary" type="submit"><i className="fa-search"></i> 搜尋</button> { }
                            <button className="btn-success" type="button" onClick={this.excelPrint.bind(this) }><i className="fa-print"></i> 列印會員資料</button>
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
                        <th className="col-xs-2">會員編號</th>
                        <th className="col-xs-1">階級</th>
                        <th className="col-xs-3">姓名</th>
                        <th className="col-xs-2">加入日期</th>
                        {/*<th className="col-xs-2">狀態</th>*/}
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
                                updateType={this.updateType} />
                    ) }
                    </tbody>
                </table>
            </div>
        <GridNavPage startCount={this.state.gridData.startcount} endCount={this.state.gridData.endcount} recordCount={this.state.gridData.records} totalPage={this.state.gridData.total} nowPage={this.state.gridData.page}
            onQueryGridData={this.queryGridData} InsertType={this.insertType} deleteSubmit={this.deleteSubmit} />
        </form>
                        <iframe src={this.state.download_src} style={ { visibility: 'hidden', display: 'none' } } />
                            </div>


                    );
            }
            else if (this.state.edit_type == 1 || this.state.edit_type == 2) {
                let fieldData = this.state.fieldData;
                let out_ModalSales: JSX.Element = null;
                let out_ModalShare: JSX.Element = null;
                let out_ModalShareView: JSX.Element = null;

                if (this.state.edit_type == 2) {
                    out_ModalShare = <ModalShare
                        isShow={this.state.isShowModalShare}
                        close={this.closeModalShare}
                        sales_sn_site={this.state.fieldData.sales_no}
                        upMasterData={this.onModalShareChange}
                        />;
                    out_ModalShareView = <ModalShareView
                        isShow={this.state.isShowModalShareView}
                        close={this.closeModalShareView}
                        sales_sn_site={this.state.fieldData.sales_no}
                        upMasterData={this.onModalShareChange}
                        />;
                }
                outHtml = (
                    <div>
                    <ul className="breadcrumb">
                        <li><i className="fa-list-alt"></i> {this.props.menuName}</li>
                        </ul>
                    <h4 className="title"> { this.props.caption } 基本資料維護</h4>
                    <form className="form-horizontal" onSubmit={this.handleSubmit}>

                        <div className="col-xs-8">

                        <div className="form-group">
                            <label className="col-xs-2 control-label">會員編號</label>
                            <div className="col-xs-8">
                                <input type="text"
                                    className="form-control"
                                    onChange={this.changeFDValue.bind(this, 'sales_no') }
                                    value={fieldData.sales_no}
                                    maxLength={16}
                                    disabled={this.state.edit_type == 2}
                                    required />
                                </div>
                            <small className="col-xs-2 text-danger">(必填) </small>
                            </div>

                        <div className="form-group">
                            <label className="col-xs-2 control-label">姓名</label>
                            <div className="col-xs-8">
                                <input type="text"
                                    className="form-control"
                                    onChange={this.changeFDValue.bind(this, 'sales_name') }
                                    value={fieldData.sales_name}
                                    maxLength={32}
                                    required />
                                </div>
                            <small className="col-xs-2 text-danger">(必填) </small>
                            </div>

                        <div className="form-group">
                            <label className="col-xs-2 control-label">加入日期</label>
                            <div className="col-xs-8">
                                <InputDate id="join_date"
                                    onChange={this.changeDatePicker}
                                    field_name="join_date"
                                    value={fieldData.join_date}
                                    disabled={false} required={true} ver={1} />
                                </div>
                            <small className="col-xs-2 text-danger">(必填) </small>
                            </div>

                        <div className="form-group">
                            <label className="col-xs-2 control-label">推薦人</label>
                            <div className="col-xs-8">
                                <div className="input-group">
                                    <input type="text"
                                        className="form-control"
                                        onChange={this.changeFDValue.bind(this, 'recommend_name') }
                                        value={fieldData.recommend_name}
                                        maxLength={16}
                                        disabled={true}
                                        required />
                                    <span className="input-group-btn">
                                        <button className="btn-info" type="button" onClick={this.openModalSales}
                                            disabled={false}><i className="fa-search"></i> 搜尋</button>
                                        </span>
                                    </div>
                                </div>
                            <small className="col-xs-2 text-danger">(必填) </small>
                            </div>

                        <div className="form-group">
                            <label className="col-xs-2 control-label">安置人</label>
                            <div className="col-xs-8">
                                <div className="input-group">
                                    <input type="text"
                                        className="form-control"
                                        value={fieldData.share_name}
                                        disabled />
                                    <span className="input-group-btn">
                                        <button className="btn-info" type="button" onClick={this.openModalShareView} disabled={fieldData.edit_type == 1}> <i className="fa-search-plus"></i> { }共享圈成員</button>
                                        </span>
                                    <span className="input-group-btn">
                                        <button className="btn-success" type="button" onClick={this.openModalShare} disabled={fieldData.edit_type == 1}> <i className="fa-plus"></i> 選擇安置人</button>
                                        </span>
                                    </div>

                                </div>
                            </div>
                        <div className="form-group">
                            <label className="col-xs-2 control-label">階級設定</label>
                            <div className="col-xs-8">
                                <select className="form-control" value={fieldData.rank} required
                                    onChange={this.changeFDValue.bind(this, 'rank') }>
                                {
                                DT.SalesRankType.map((itemData, i) => <option key={i} value={itemData.id}>{itemData.label}</option>)
                                }
                                    </select>
                                </div>
                                <small className="col-xs-2 text-danger">(必填) </small>
                            </div>
                        <div className="form-group">
                            <label className="col-xs-2 control-label">電話</label>
                            <div className="col-xs-8">
                                <input type="text"
                                    className="form-control"
                                    onChange={this.changeFDValue.bind(this, 'tel') }
                                    value={fieldData.tel}
                                    maxLength={16}
                                    />
                                </div>
                            </div>

                        <div className="form-group">
                            <label className="col-xs-2 control-label">行動電話</label>
                            <div className="col-xs-8">
                                <input type="text"
                                    className="form-control"
                                    onChange={this.changeFDValue.bind(this, 'mobile') }
                                    value={fieldData.mobile}
                                    maxLength={16}
                                    />
                                </div>
                            </div>

                        <div className="form-group">
                            <label className="col-xs-2 control-label">生日</label>
                            <div className="col-xs-8">
                                <InputDate id="birthday"
                                    onChange={this.changeDatePicker}
                                    field_name="birthday"
                                    value={fieldData.birthday}
                                    disabled={false} required={false} ver={1} />
                                </div>
                            </div>

                        <div className="form-group">
                            <label className="col-xs-2 control-label">地址</label>
                            <div className="col-xs-2">
                                <input type="text"
                                    className="form-control"
                                    onChange={this.changeFDValue.bind(this, 'zip') }
                                    value={fieldData.zip}
                                    maxLength={5}
                                    />
                                </div>
                            <div className="col-xs-6">
                                <input type="text"
                                    className="form-control"
                                    onChange={this.changeFDValue.bind(this, 'address') }
                                    value={fieldData.address}
                                    maxLength={256}
                                    />
                                </div>
                            </div>

                        <div className="form-group">
                            <label className="col-xs-2 control-label">email</label>
                            <div className="col-xs-8">
                                <input type="email"
                                    className="form-control"
                                    onChange={this.changeFDValue.bind(this, 'email') }
                                    value={fieldData.email}
                                    maxLength={128}
                                    />
                                </div>
                                {/*<small className="col-xs-2 text-danger">(必填) </small>*/}
                            </div>
                        <div className="form-group">
                            <label className="col-xs-2 control-label">帳號</label>
                            <div className="col-xs-8">
                                <input type="text"
                                    className="form-control"
                                    onChange={this.changeFDValue.bind(this, 'account') }
                                    value={fieldData.account}
                                    maxLength={16}
                                    />
                                </div>
                             <small className="col-xs-2">預設為會員編號</small>
                            </div>
                        <div className="form-group">
                            <label className="col-xs-2 control-label">重設密碼</label>
                            <div className="col-xs-8">
                                <button type="button" className="btn-warning" onClick={this.resetPasswrod}><i className="fa-repeat"></i> 重設密碼</button>
                                </div>
                             <small className="col-xs-2">預設為「111111」</small>
                            </div>
                        {/*<div className="form-group">
                            <label className="col-xs-2 control-label">密碼</label>
                            <div className="col-xs-8">
                                <input type="password"
                                    className="form-control"
                                    onChange={this.changeFDValue.bind(this, 'password') }
                                    value={fieldData.password}
                                    maxLength={50}
                                    />
                                </div>
                             <small className="col-xs-2">預設為「111111」</small>
                            </div>*/}

                        <div className="form-action">
                            <div className="col-xs-4 col-xs-offset-2">
                                <button type="submit" className="btn-primary"><i className="fa-check"></i> 儲存</button> { }
                                <button type="button" onClick={this.noneType}><i className="fa-times"></i> 回前頁</button>
                                </div>
                            </div>

                            </div>

                        </form>
                    <ModalSales
                        close={this.closeModalSales}
                        isShow={this.state.isShowModalSales}
                        fieldSalesNo={this.state.fieldData.recommend_no}
                        fieldSalesName={this.state.fieldData.recommend_name}
                        updateView={this.setModalSalesValue}
                        />
                        {out_ModalShare}
                        {out_ModalShareView}
                        </div>
                );
            }

            return outHtml;
        }
    }
}

var dom = document.getElementById('page_content');
ReactDOM.render(<Sales.GridForm caption={gb_caption} menuName={gb_menuname} iconClass="fa-list-alt" />, dom);