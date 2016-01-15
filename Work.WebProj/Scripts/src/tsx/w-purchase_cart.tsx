import $ = require('jquery');
import React = require('react');
import ReactDOM = require('react-dom');
import Moment = require('moment');
import CommCmpt = require('comm-cmpt');
import CommFunc = require('comm-func');

namespace Cart {
    interface Formprops {
        apiInitPath?: string;
        apiDeletePath?: string;
        apiChangePath?: string;
        apiCheckoutPath?: string;
    }
    export class GridForm extends React.Component<Formprops, {
        Purchase?: server.Purchase,
        ShippingFee?: number,
        check_fee?: boolean,
        PurchaseTotal?: number
    }>{

        constructor() {

            super();
            this.componentDidMount = this.componentDidMount.bind(this);
            this.queryInitData = this.queryInitData.bind(this);
            this.changeQtyValue = this.changeQtyValue.bind(this);
            this.deleteProduct = this.deleteProduct.bind(this);
            this.putQtyValue = this.putQtyValue.bind(this);
            this.checkoutShopping = this.checkoutShopping.bind(this);
            this.render = this.render.bind(this);


            this.state = {
                Purchase: {
                    detail: []
                },
                ShippingFee: 0,
                check_fee: false,
                PurchaseTotal: 0
            }
        }
        static defaultProps: Formprops = {
            apiInitPath: gb_approot + 'Cart/GetShoppingCartData',
            apiDeletePath: gb_approot + 'Cart/DeleteShoppingProduct',
            apiChangePath: gb_approot + 'Cart/ChangeShoppingCartData',
            apiCheckoutPath: gb_approot + 'Cart/CheckoutMember'
        }
        componentDidMount() {
            this.queryInitData();
        }
        queryInitData() {
            CommFunc.jqGet(this.props.apiInitPath, {})
                .done((data, textStatus, jqXHRdata) => {
                    this.setState({
                        Purchase: data.items,
                        ShippingFee: data.ShippingFee,
                        check_fee: data.check_fee,
                        PurchaseTotal: data.PurchaseTotal
                    });
                })
                .fail((jqXHR, textStatus, errorThrown) => {
                    CommFunc.showAjaxError(errorThrown);
                });
        }
        changeQtyValue(no: string, select_id: number, e: React.FormEvent) {
            let input: HTMLInputElement = e.target as HTMLInputElement;
            let obj = this.state.Purchase;

            for (var i of obj.detail) {
                if (i.product_no == no && i.product_select_id == select_id) {
                    i.qty = input.value;
                    i.sub_total = i.price * i.qty;
                    i.kv_sub_total = i.kv * i.qty;
                    break;
                }
            }
            this.setState({ Purchase: obj });
        }
        putQtyValue(no: string, select_id: number, e: React.FormEvent) {
            let input: HTMLInputElement = e.target as HTMLInputElement;
            CommFunc.jqGet(this.props.apiChangePath, { product_no: no, product_select_id: select_id, qty: input.value })
                .done((data: server.Purchase, textStatus, jqXHRdata) => {
                })
                .fail((jqXHR, textStatus, errorThrown) => {
                    CommFunc.showAjaxError(errorThrown);
                });
        }
        deleteProduct(no: string, select_id: number, e: React.FormEvent) {
            if (!confirm('確定是否刪除?')) {
                return;
            }
            CommFunc.jqDelete(this.props.apiDeletePath, { product_no: no, product_select_id: select_id })
                .done((data, textStatus, jqXHRdata) => {
                    if (data.result) {
                        this.queryInitData();
                        $('#p_count').text(data.id);
                    }
                })
                .fail((jqXHR, textStatus, errorThrown) => {
                    CommFunc.showAjaxError(errorThrown);
                });
        }
        checkoutShopping() {
            if (!confirm('確定是否結帳?')) {
                return;
            }
            CommFunc.jqGet(this.props.apiCheckoutPath, {})
                .done((data, textStatus, jqXHRdata) => {
                    if (data) {
                        document.location.href = gb_approot + "Payment/order";
                    } else {
                        alert("請登入會員後再結帳!");
                        document.location.href = gb_approot + "Member/Login";
                    }
                })
                .fail((jqXHR, textStatus, errorThrown) => {
                    CommFunc.showAjaxError(errorThrown);
                });
        }
        render() {

            var outHtml: JSX.Element = null;
            if (this.state.Purchase.detail.length <= 0) {
                outHtml = (
                    <section id="content">
                    <h2 className="title">購物車</h2>
                    <p>Oops!您的購物車內還沒有任何商品！</p>
                        </section>
                );
            }
            else {
                //運費
                let shippingFeeHtml: JSX.Element = null;
                let shippingFeeVal: number = 0;
                if (this.state.Purchase.total < this.state.PurchaseTotal) {
                    if (this.state.check_fee) {
                        shippingFeeHtml = <span>冷藏(凍)運費： <strong>NT$ {this.state.ShippingFee}</strong></span>;
                    } else {
                        shippingFeeHtml = <span>常溫運費： <strong>NT$ {this.state.ShippingFee}</strong></span>;
                    }
                    shippingFeeVal = this.state.ShippingFee;
                } else {
                    shippingFeeHtml = <strong>NT$ 0</strong>;
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
                            <td> <a className="thumb" href={'Products/Content?id=' + itemData.product_no}><img src={itemData.imgsrc} alt="" /></a></td >
                    <td>
                        <small><em>商品編號</em>{itemData.product_no}</small>
                        <a href={'Products/Content?id=' + itemData.product_no}>{itemData.product_name}</a>
                        {/*--規格型號--*/}
                        {selectHtml}
                        </td>
                    <td className="text-center">
                        <input type="number" className="form-element-inline"
                            onChange={this.changeQtyValue.bind(this, itemData.product_no, itemData.product_select_id) }
                            onBlur={this.putQtyValue.bind(this, itemData.product_no, itemData.product_select_id) }
                            value={itemData.qty} min="1"/>
                        </td>
                    <td className="text-center">
                        NT$ {CommFunc.moneyFormat(itemData.price) }<br />
                                <small className="kv">{CommFunc.moneyFormat(itemData.kv) }KV</small>
                        </td>
                    <td className="text-center">
                    <strong>NT$ {CommFunc.moneyFormat(itemData.sub_total) }</strong> < br />
                    <small className="kv">{CommFunc.moneyFormat(itemData.kv_sub_total) }KV</small>
                        </td >
                    <td className="text-center"><button className="form-element-inline" type="button" onClick={this.deleteProduct.bind(this, itemData.product_no, itemData.product_select_id) }><i className="fa-trash"></i> 刪除</button></td>
                            </tr >
                    );
                    rows.push(detailHtml);
                })

                outHtml = (
                    <section id="content">
                    <h2 className="title">購物車</h2>

                    <table className="cart-list table">
                        <thead>
                        <tr>
                            <th colSpan={2}  className="item">商品</th>
                            <th className="quan">數量</th>
                            <th className="price">單價</th>
                            <th className="sum">小計</th>
                            <th className="del">刪除</th>
                            </tr>
                            </thead>
                        <tbody>
                            {rows}
                        {/*<tr>
                            <td className="shipping" colSpan={6}>
                                運送方式：
                                <strong>宅配 (滿 NT${CommFunc.moneyFormat(this.state.PurchaseTotal) } 免運費) </strong>
                                
                                {shippingFeeHtml}
                                </td>
                            </tr>*/}
                        <tr>
                            <td className="total" colSpan={6}>
                                <p>總計：<strong>NT$ {CommFunc.moneyFormat(this.state.Purchase.total) }</strong> (尚未計算運費)</p>
                                <p>總KV值：<strong className="kv">{CommFunc.moneyFormat(this.state.Purchase.kv_total) }KV</strong></p>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    <p className="submit">
                        <a href="Products/list"><i className="fa-angle-left"></i> 繼續選購</a>
                        <button className="btn btn-lg btn-success" type="button" onClick={this.checkoutShopping}>確定結帳</button>
                        </p>

                        </section>
                );
            }


            return outHtml;
        }
    }
}

var dom = document.getElementById('page_content');
ReactDOM.render(<Cart.GridForm />, dom);