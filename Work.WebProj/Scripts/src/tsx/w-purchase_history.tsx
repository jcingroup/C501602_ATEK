import $ = require('jquery');
import React = require('react');
import ReactDOM = require('react-dom');
import Moment = require('moment');
import CommCmpt = require('comm-cmpt');
import CommFunc = require('comm-func');
import DT = require('dt');
import "Pikaday/css/pikaday.css";

namespace PurchaseHistory {
    interface Formprops {
        shoppingCost?: number;
        apiInitPath?: string;
    }
    //訂單狀態
    export class PurchaseState extends React.Component<{ stateData: any, id: number, no: string }, { setClass: string, label: string }>{
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
            stateData: null,
            id: null
        }
        componentWillReceiveProps(nextProps) {
            //當元件收到新的 props 時被執行，這個方法在初始化時並不會被執行。使用的時機是在我們使用 setState() 並且呼叫 render() 之前您可以比對 props，舊的值在 this.props，而新值就從 nextProps 來。
            for (var i in this.props.stateData) {
                var item = this.props.stateData[i];
                if (item.id == nextProps.id) {
                    this.setState({ setClass: item.className, label: item.label });
                    break;
                }
            }
        }
        componentDidMount() {
            for (var i in this.props.stateData) {
                var item = this.props.stateData[i];
                if (item.id == this.props.id) {
                    this.setState({ setClass: item.className, label: item.label });
                    break;
                }
            }
        }
        render() {
            let replyHtml: JSX.Element = null;
            if (this.props.id == PurchaseStateType.waitForPayment) {
                replyHtml = (<a href={gb_approot + 'Payment/Reply?no=' + this.props.no} className="pay-inform" >按此填寫付款通知</a>);
            }
            return (
                <strong className={this.state.setClass}>
                    {this.state.label}
                    {replyHtml}
                    </strong>
            );
        }
    }
    export class GridForm extends React.Component<Formprops, { list?: Array<server.Purchase>, login?: boolean, searchData?: { set_date?: any, no?: string } }>{

        constructor() {

            super();
            this.componentDidMount = this.componentDidMount.bind(this);
            this.queryInitData = this.queryInitData.bind(this);
            this.showAddr = this.showAddr.bind(this);
            this.changeDatePicker = this.changeDatePicker.bind(this);
            this.changeInputVal = this.changeInputVal.bind(this);
            this.handleSearch = this.handleSearch.bind(this);
            this.render = this.render.bind(this);


            this.state = {
                list: [],
                login: false,
                searchData: {
                    set_date: null,
                    no: null
                }
            }
        }
        static defaultProps: Formprops = {
            shoppingCost: 3000,
            apiInitPath: gb_approot + 'History/GetPurchaseHistory'
        }
        componentDidMount() {
            this.queryInitData();
        }
        queryInitData() {
            CommFunc.jqGet(this.props.apiInitPath, this.state.searchData)
                .done((data, textStatus, jqXHRdata) => {
                    if (data.result) {
                        this.setState({ list: data.items, login: data.login });
                    } else {
                        alert(data.msg);
                    }
                })
                .fail((jqXHR, textStatus, errorThrown) => {
                    CommFunc.showAjaxError(errorThrown);
                });
        }
        handleSearch(e: React.FormEvent) {
            e.preventDefault();
            this.queryInitData();
            return;
        }
        showAddr(no: string, type: string, e: React.FormEvent) {
            $('#' + no + type).toggle();
            $(e.currentTarget).find('i').toggleClass('fa-plus-circle fa-minus-circle');
        }
        changeDatePicker(name: string, v: Date) {
            let obj = this.state.searchData
            obj[name] = Moment(v).toJSON();
            this.setState({
                searchData: obj
            });
        }
        changeInputVal(name: string, e: React.SyntheticEvent) {
            let input: HTMLInputElement = e.target as HTMLInputElement;
            let obj = this.state.searchData
            obj[name] = input.value;
            this.setState({
                searchData: obj
            });
        }
        render() {

            var outHtml: JSX.Element = null;
            let InputDate = CommCmpt.InputDate;
            let searchData = this.state.searchData;
            let rows = [];
            this.state.list.forEach((itemData, i) => {
                let PurchaseHtml: JSX.Element = null;
                PurchaseHtml = (
                    <tbody key={itemData.purchase_no}>
                    <tr>
                        <td>{Moment(itemData.set_date).format('YYYY-MM-DD hh:mm') }</td>
                        <td>{itemData.purchase_no}</td>
                        <td>
                            總金額 <strong className="text-error">NT$ {CommFunc.moneyFormat(itemData.total) }</strong>
                            <small className="kv">{CommFunc.moneyFormat(itemData.kv_total) }KV</small>
                            <button className="detail-trigger form-element-inline" onClick={this.showAddr.bind(this, itemData.purchase_no, '-detail') }><i className="fa-plus-circle"></i> 看訂單明細</button>
                            </td>
                        <td>
                                <PurchaseState id={itemData.state} stateData={DT.PurchaseStateType} no={itemData.purchase_no}/>
                            {/*<strong className="text-info">訂單處理中</strong>
                            <strong className="text-error">待繳款</strong>
                            <strong className="text-error">待對帳確認</strong>
                            <strong className="text-success">訂單完成</strong>
                            <strong className="text-muted">取消訂單</strong>
                            <strong className="text-muted">已退貨</strong>*/}
                            </td>
                        <td><button className="addr-trigger form-element-inline" onClick={this.showAddr.bind(this, itemData.purchase_no, '-addr') }><i className="fa-plus-circle"></i> 看收件資料</button></td>
                        </tr>
                    <tr className="detail-show" id={itemData.purchase_no + '-detail'}>
                        <td colSpan={5}>
                            <ul className="list-unstyled">
                                    {
                                    itemData.detail.map((detailData, j) =>
                                        <li key={detailData.purchase_detail_id}>
                                    <small>商品編號 {detailData.product_no}</small>{detailData.product_name + 'x' + detailData.qty + ' ' + detailData.style_name}
                                    <strong className="text-error">NT$ {CommFunc.moneyFormat(detailData.sub_total) }</strong>
                                    <small className="kv">{CommFunc.moneyFormat(detailData.kv_sub_total) }KV</small>
                                            </li>)
                                    }

                                <li>
                                    運費
                                    <strong className="text-error">NT$ {CommFunc.moneyFormat(itemData.shipping_fee) }</strong>
                                    </li>
                                </ul>
                            </td>
                        </tr>
                    <tr className="addr-show" id={itemData.purchase_no + '-addr'}>
                        <td colSpan={5}>
                            <ul className="list-unstyled">
                                <li><strong>收件人：</strong>{itemData.receive_person}</li>
                                <li><strong>電話：</strong>{itemData.receive_tel}</li>
                                <li><strong>手機：</strong>{itemData.receive_mobile}</li>
                                <li><strong>地址：</strong>{itemData.receive_zip + itemData.receive_address}</li>
                                </ul>
                            </td>
                        </tr>
                        </tbody>
                );
                rows.push(PurchaseHtml);
            });
            outHtml = (
                <section id="content">
                <h2 className="title">歷史訂單查詢</h2>

                <form className="form" onSubmit={this.handleSearch}>
                    <label className="text-right">訂單日期</label>
                    <InputDate id="set_date"
                        onChange={this.changeDatePicker}
                        field_name="set_date"
                        value={searchData.set_date}
                        disabled={false} required={false} ver={3} />
                    <label className="text-right offset-1">訂單編號</label>
                    <input type="text" className="form-element-inline"
                        pattern="[a-zA-Z0-9_]" title="限輸入數字及英文字母"
                        value={searchData.no}
                        onChange={this.changeInputVal.bind(this, 'no') }
                        required={!this.state.login}
                        />
                    <button className="btn">搜尋</button>
                    </form>

               <table className="history-list table">
                    <thead>
                    <tr>
                        <th className="date">訂購日期</th>
                        <th className="num">訂單編號</th>
                        <th className="detail">訂單明細</th>
                        <th className="status">訂單狀態</th>
                        <th className="addr">收件資料</th>
                        </tr>
                        </thead>
                    {/**--訂單--**/}
                        {rows}
                    {/**--訂單end--**/}
                   </table>
                    </section>
            );
            return outHtml;
        }
    }
}

var dom = document.getElementById('page_content');
ReactDOM.render(<PurchaseHistory.GridForm />, dom);