import $ = require('jquery');
import React = require('react');
import ReactDOM = require('react-dom');
import Moment = require('moment');
import CommCmpt = require('comm-cmpt');
import CommFunc = require('comm-func');

namespace PaymentOrder {
    interface Formprops {
        apiInitPath?: string;
        apiCheckoutPath?: string;
    }
    interface FormState {
        Purchase?: server.Purchase;
        ShippingFee?: number;
        HomoiothermyFee?: number;
        RefrigerFee?: number;
        check_fee?: boolean;
        PurchaseTotal?: number;
        BankName?: string;
        BankCode?: string;
        AccountName?: string;
        AccountNumber?: string;
        ReceiveData?: ReceiveData;
        no?: string;
        mail?: boolean;
    }
    interface ReceiveData {
        pickup_state?: number;
        payby?: number;
        receive_person?: string;
        receive_tel?: string;
        receive_mobile?: string;
        zip?: string;
        city?: string;
        country?: string;
        address?: string;
        email?: string
        memo?: string;
    }
    export class GridForm extends React.Component<Formprops, FormState>{

        constructor() {

            super();
            this.componentDidMount = this.componentDidMount.bind(this);
            this.queryInitData = this.queryInitData.bind(this);
            this.setInputValue = this.setInputValue.bind(this);
            this.setFDValue = this.setFDValue.bind(this);
            this.checkoutOrder = this.checkoutOrder.bind(this);
            this.printDiv = this.printDiv.bind(this);
            this.render = this.render.bind(this);


            this.state = {
                Purchase: {
                    detail: [],
                    total: 0,
                    kv_total: 0
                },
                ShippingFee: 0,
                HomoiothermyFee: 0,
                RefrigerFee: 0,
                check_fee: false,
                PurchaseTotal: 0,
                ReceiveData: {
                    pickup_state: PurchasePickupState.delivery,
                    payby: PaybyType.ATM,
                    receive_person: '',
                    receive_tel: '',
                    receive_mobile: '',
                    zip: '',
                    city: '',
                    country: '',
                    address: '',
                    email: ''
                },
                mail: true
            }
        }
        static defaultProps: Formprops = {
            apiInitPath: gb_approot + 'Cart/GetShoppingCartData',
            apiCheckoutPath: gb_approot + 'Payment/PutPurchaseData'
        }
        componentDidMount() {
            this.queryInitData();
        }
        queryInitData() {
            CommFunc.jqGet(this.props.apiInitPath, {})
                .done((data, textStatus, jqXHRdata) => {
                    let receive = this.state.ReceiveData;
                    receive.email = data.Sales.email;
                    receive.receive_person = data.Sales.sales_name;
                    receive.receive_tel = data.Sales.tel;
                    receive.receive_mobile = data.Sales.mobile;
                    if (data.Sales.zip != undefined)
                        receive.zip = data.Sales.zip;
                    if (data.Sales.address != undefined)
                        receive.address = data.Sales.address;
                    this.setState({
                        Purchase: data.items,
                        ShippingFee: data.ShippingFee,
                        PurchaseTotal: data.PurchaseTotal,
                        HomoiothermyFee: data.HomoiothermyFee,
                        RefrigerFee: data.RefrigerFee,
                        check_fee: data.check_fee,
                        BankName: data.BankName,
                        BankCode: data.BankCode,
                        AccountName: data.AccountName,
                        AccountNumber: data.AccountNumber,
                        ReceiveData: receive
                    });
                })
                .fail((jqXHR, textStatus, errorThrown) => {
                    CommFunc.showAjaxError(errorThrown);
                });
        }
        setInputValue(name: string, e: React.SyntheticEvent) {
            let input: HTMLInputElement = e.target as HTMLInputElement;
            let obj = this.state.ReceiveData;

            obj[name] = input.value;

            this.setState({ ReceiveData: obj });
        }
        setFDValue(fieldName, value) {
            //此function提供給次元件調用，所以要以屬性往下傳。
            var obj = this.state.ReceiveData;
            obj[fieldName] = value;
            this.setState({ ReceiveData: obj });
        }
        checkoutOrder(e: React.FocusEvent) {
            e.preventDefault();
            if (!confirm('確定是否送出訂單?')) {
                return;
            }
            CommFunc.jqPost(this.props.apiCheckoutPath, this.state.ReceiveData)
                .done((data, textStatus, jqXHRdata) => {
                    if (data.data.result) {
                        this.setState({ no: data.no, mail: data.mail });
                        var anchor = $('#tab2').attr('id');
                        $('.checklist').hide();
                        $('#tab2').show();
                        $('.tab-switcher span').removeClass('current');
                        $('.tab-switcher span[rel*="' + anchor + '"]').addClass('current');
                        if (!data.mail) {
                            alert(data.data.message);
                        }
                    } else {
                        alert(data.data.message);
                    }
                })
                .fail((jqXHR, textStatus, errorThrown) => {
                    CommFunc.showAjaxError(errorThrown);
                });


        }
        printDiv(e: React.FocusEvent) {
            //方法一:執行後會遺失javascript event
            //let originalContents = document.body.innerHTML;
            //$('#tab2 > .cart-list a').attr("href", "#");
            //$('#tab2 > .submit > a').css({ visibility: 'hidden' });
            //let printContents = $('#tab2').html();
            //document.body.innerHTML = `<html><head><title>訂單資料</title></head>
            //    <body>${printContents}</body>`;
            window.print();
            //document.body.innerHTML = originalContents;

            //方法二:會跑版
            //let w = window.open();
            //w.document.write($('#tab2').html());
            //w.print();
            //w.close();
        }
        render() {

            var outHtml: JSX.Element = null;
            var ReceiveData = this.state.ReceiveData;
            let TwAddress = CommCmpt.TwAddress;
            //運費
            let shippingFeeHtml: JSX.Element = null;
            let shippingFeeVal: number = 0;
            let requiredAddressHtml: JSX.Element = <small className="text-error">* </small>;//要求地址強制輸入
            let shippingInfoHtml: JSX.Element = <p><strong>使用宅配寄送的商品，若包含須冷藏(凍) 運送之生鮮商品，運費皆以冷藏(凍) 宅配運費計算。</strong></p>;

            if (ReceiveData.pickup_state == PurchasePickupState.getBySelf) {
                requiredAddressHtml = null;
                shippingFeeHtml = <span>取貨方式：<strong>自行取貨 </strong>運費： <strong>NT$ 0</strong></span>;
                shippingInfoHtml = <p><strong>自行取貨仍須先付款，請於三日後至 <span className="text-primary">中壢總部 (桃園市中壢區東興街121號) </span> 現場取貨，須於七日內取貨完畢，謝謝。</strong></p>;
            } else if (this.state.Purchase.total < this.state.PurchaseTotal) {
                if (this.state.check_fee) {
                    shippingFeeHtml = <span>取貨方式：<strong>宅配 (滿 NT${CommFunc.moneyFormat(this.state.PurchaseTotal) }免運費) </strong>冷藏(凍) 運費： <strong>NT$ {this.state.ShippingFee}</strong></span>;
                } else {
                    shippingFeeHtml = <span>取貨方式：<strong>宅配 (滿 NT${CommFunc.moneyFormat(this.state.PurchaseTotal) }免運費) </strong>常溫運費： <strong>NT$ {this.state.ShippingFee}</strong></span>;
                }
                shippingFeeVal = this.state.ShippingFee;
            } else {
                shippingFeeHtml = <span>取貨方式：<strong>宅配 (滿 NT${CommFunc.moneyFormat(this.state.PurchaseTotal) }免運費) </strong>運費： <strong>NT$ 0</strong></span>;
            }
            //購物清單
            let rows = [];
            this.state.Purchase.detail.forEach((itemData, i) => {
                let detailHtml: JSX.Element = null;
                let selectHtml: JSX.Element = null;
                let key_val = 'no-' + itemData.product_no;
                if (itemData.product_select_id != null) {
                    selectHtml = <small><em>規格型號</em>{itemData.style_name}</small>;
                    key_val = 'no-' + itemData.product_no + '-' + itemData.product_select_id;
                }
                detailHtml = (
                    <tr key={key_val}>
                    <td><a className="thumb" href={gb_approot + 'Products/Content?id=' + itemData.product_no}><img src={itemData.imgsrc} alt="" /></a></td>
                    <td className="text-left">
                        <small><em>商品編號</em>{itemData.product_no}</small>
                        <a href={gb_approot + 'Products/Content?id=' + itemData.product_no}>{itemData.product_name}</a>
                        {selectHtml}
                        </td>
                    <td className="text-center">{itemData.qty}</td>
                    <td className="text-center">
                        NT$ {CommFunc.moneyFormat(itemData.price) }<br />
                        <small className="kv">{CommFunc.moneyFormat(itemData.kv) }KV</small>
                        </td>
                    <td className="text-center">
                        <strong>NT$ {CommFunc.moneyFormat(itemData.sub_total) }</strong><br />
                        <small className="kv">{CommFunc.moneyFormat(itemData.kv_sub_total) }KV</small>
                        </td>
                        </tr>
                );
                rows.push(detailHtml);
            })

            //emal是否填寫
            let finishCheckHtml: JSX.Element = null;
            if (ReceiveData.email != null && ReceiveData.email != '' && ReceiveData.email != undefined) {
                if (this.state.mail) {
                    finishCheckHtml = (
                        <dd>
                        <p>訂單成功送出，謝謝您的訂購！訂單付款資訊已寄到您的信箱：<strong>{ReceiveData.email}</strong></p>
                        <p>若超過10分鐘後仍未收到信，請檢查您的垃圾信件匣。</p>
                            </dd>
                    );
                } else {
                    finishCheckHtml = (
                        <dd>
                        <p>訂單成功送出，謝謝您的訂購！</p>
                            </dd>
                    );
                }

            } else {
                finishCheckHtml = (
                    <dd>
                        <p>訂單成功送出，謝謝您的訂購！訂單付款資訊請至<a href={gb_approot + 'History'}>歷史訂單查詢</a>檢視。</p>
                        </dd>
                );
            }


            outHtml = (

                <section id="content">
                        <h2 className="hidden">商品結帳</h2>

                        <ul className="tab-switcher">
                            <li><span className="current" rel="#tab1">STEP 1. 填寫資料</span></li>
                            <li><span rel="#tab2">STEP 2. 送出訂單</span></li>
                            </ul>

                <section id="tab1" className="checklist tab-content">

                    <h4 className="title">選擇取貨方式</h4>
                    <ul className="pay">
                        <li><label  className="check"><input type="radio" name="pickup" value={PurchasePickupState.delivery}
                            checked={ReceiveData.pickup_state == PurchasePickupState.delivery}
                            onChange={this.setInputValue.bind(this, 'pickup_state') }
                            /><i className="fa-check">宅配</i></label></li>
                        <li><label className="check"><input type="radio" name="pickup" value={PurchasePickupState.getBySelf}
                            checked={ReceiveData.pickup_state == PurchasePickupState.getBySelf}
                            onChange={this.setInputValue.bind(this, 'pickup_state') }
                            /><i className="fa-check">自行取貨 (中壢總部)</i></label></li>
                        </ul>
                    {/*<h4 className="title">選擇付款方式</h4>
                    <ul className="pay">
                        <li><label  className="check"><input type="radio" name="pay" value={PaybyType.ATM}
                            checked={ReceiveData.payby == PaybyType.ATM}
                            onChange={this.setInputValue.bind(this, 'payby') }
                            /><i className="fa-check">ATM 轉帳</i></label></li>
                        <li><label className="check"><input type="radio" name="pay" value={PaybyType.CashOnDelivery}
                            checked={ReceiveData.payby == PaybyType.CashOnDelivery}
                            onChange={this.setInputValue.bind(this, 'payby') }
                            /><i className="fa-check">貨到付款</i></label></li>
                        </ul>*/}
                    
                        {shippingInfoHtml}
                        <hr />
                    <h4 className="title">訂單明細</h4>
                    <table className="cart-list table">
                        <thead>
                        <tr>
                            <th colSpan={2} width="50%">商品</th>
                            <th width="10%">數量</th>
                            <th width="15%">單價</th>
                            <th width="15%">小計</th>
                            </tr>
                            </thead>
                        <tbody>
                        {rows}
                        <tr>
                            <td className="shipping" colSpan={5}>
                                {shippingFeeHtml}
                                </td>
                            </tr>
                        <tr>
                            <td className="total" colSpan={5}>
                                <p>總計：<strong>NT${CommFunc.moneyFormat((this.state.Purchase.total + shippingFeeVal)) }</strong></p>
                                <p>總KV值：<strong className="kv">{CommFunc.moneyFormat(this.state.Purchase.kv_total) }KV</strong></p>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    <h4 className="title">填寫收件資料</h4>
                    <form className="form" action="" onSubmit={this.checkoutOrder} id="Receive">
                        <div className="row">
                            <label className="col-2 text-right"><small className="text-error">*</small> 收件人姓名</label>
                            <div className="col-4">
                                    <input type="text" className="form-element" maxLength={16}
                                        value={ReceiveData.receive_person}
                                        onChange={this.setInputValue.bind(this, 'receive_person') }
                                        required/>
                                </div>
                            </div>
                        <div className="row">
                            <label  className="col-2 text-right"><small className="text-error">*</small> 聯絡電話</label>
                            <div className="col-4">
                                    <input type="tel" className="form-element" maxLength={16}
                                        value={ReceiveData.receive_tel}
                                        onChange={this.setInputValue.bind(this, 'receive_tel') }
                                        required/>
                                </div>
                            <label  className="col-1 text-right"><small className="text-error">*</small> 手機</label>
                            <div className="col-5">
                                    <input type="tel" className="form-element" maxLength={16}
                                        value={ReceiveData.receive_mobile}
                                        onChange={this.setInputValue.bind(this, 'receive_mobile') }
                                        required/>
                                </div>
                            </div>
                        <div className="row">
                            <label className="col-2 text-right">E-mail</label>
                            <div className="col-10"><input type="email" className="form-element" maxLength={128}
                                value={ReceiveData.email}
                                onChange={this.setInputValue.bind(this, 'email') }/></div>
                            </div>
                        <div className="row">
                            <label className="col-2 text-right">{requiredAddressHtml}收件地址</label>
                            {/*<div className="col-10">
                                <select name="" id="" className="form-element-inline">
                                    <option value="">台灣</option>
                                    <option value="">海外</option>
                                    </select>
                                </div>*/}
                            <div className="col-1">
                                <input type="text" className="form-element"
                                    value={ReceiveData.zip}
                                    onChange={this.setInputValue.bind(this, 'zip') }
                                    maxLength={5}
                                    required={ReceiveData.pickup_state == PurchasePickupState.delivery} /></div>
                            <div className="col-9">
                                <input 	type="text"
                                    className="form-element"
                                    value={ReceiveData.address}
                                    onChange={this.setInputValue.bind(this, 'address') }
                                    maxLength={256}
                                    required={ReceiveData.pickup_state == PurchasePickupState.delivery}/>
                                </div>
                            </div>
                        <div className="row">
                            <label className="col-2 text-right">備註</label>
                            <div className="col-10"><textarea type="text" className="form-element" maxLength={256}
                                value={ReceiveData.memo}
                                onChange={this.setInputValue.bind(this, 'memo') }></textarea></div>
                            </div>
                        </form>
                    
                    <dl　className="order-finish">
                        <dt className="text-error"><h1><i className="fa-exclamation-triangle"></i></h1></dt>
                        <dd>
                            <p>請填寫 Email 以利收到訂單明細及匯款通知。若不填寫，請於登入會員後，至<a href={gb_approot + "Active/Sales/PersonalInfo"}>會員資料管理</a>內查詢您的訂單及匯款方式。</p>
                            <p>匯款後請填寫 <a href={gb_approot + "Payment/Reply"}>已付款通知</a> 或來電告知帳號後五碼，完成訂購。</p>
                        </dd>
                    </dl>

                    <p className="submit">
                        <a className="back" href="../Cart"><i className="fa-angle-left"></i> 修改訂單內容</a>
                        <button className="btn btn-lg btn-success" type="submit" form="Receive">填寫完成，送出訂單</button>
                        </p>
                    </section>

                <section id="tab2" className="checklist tab-content">
                    <dl className="order-finish">
                        <dt><i className="fa-check"></i></dt>
                            {finishCheckHtml}
                        </dl>
                    <h4 className="title">訂單編號：{this.state.no}</h4>
                    <table className="cart-list table">
                        <thead>
                        <tr>
                            <th colSpan={2} width="50%">商品</th>
                            <th width="10%">數量</th>
                            <th width="15%">單價</th>
                            <th width="15%">小計</th>
                            </tr>
                            </thead>
                        <tbody>
                        {rows}
                        <tr>
                            <td className="shipping" colSpan={5}>
                                {shippingFeeHtml}
                                </td>
                            </tr>
                        <tr>
                            <td className="total" colSpan={5}>
                                <p>總計：<strong>NT${CommFunc.moneyFormat((this.state.Purchase.total + shippingFeeVal)) }</strong></p>
                                <p>總KV值：<strong className="kv">{CommFunc.moneyFormat(this.state.Purchase.kv_total) }KV</strong></p>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    <ul className="orderlist">
                        <li>收件人姓名<strong>{ReceiveData.receive_person}</strong></li>
                        <li>聯絡電話<strong>{ReceiveData.receive_tel}</strong> 手機<strong>{ReceiveData.receive_mobile}</strong></li>
                        <li>收件地址<strong>{ReceiveData.zip + ' ' + ReceiveData.address}</strong></li>
                        <li>備註<strong>{ReceiveData.memo}</strong></li>
                        <li>付款方式<strong>{ReceiveData.payby == PaybyType.ATM ? 'ATM 轉帳' : '貨到付款'}</strong></li>
                        <li>轉帳銀行<strong>{this.state.BankName + '(代碼:' + this.state.BankCode + ')'}</strong></li>
                        <li>轉帳戶名<strong>{this.state.AccountName}</strong></li>
                        <li>轉帳帳號<strong>{this.state.AccountNumber}</strong></li>
                    </ul>
                    <p className="submit">
                        <a href="../Products/list" className="btn btn-lg btn-success">繼續購物</a>
                        <button type="button" onClick={this.printDiv.bind(this) } className="btn btn-lg btn-primary">列印本頁</button>
                    </p>
                    </section>

                    </section>
            );

            return outHtml;
        }
    }
}

var dom = document.getElementById('page_content');
ReactDOM.render(<PaymentOrder.GridForm />, dom);