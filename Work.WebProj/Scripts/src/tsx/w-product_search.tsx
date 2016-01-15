import $ = require('jquery');
import React = require('react');
import ReactDOM = require('react-dom');
import Moment = require('moment');
import CommCmpt = require('comm-cmpt');
import CommFunc = require('comm-func');
import DT = require('dt');

namespace ProductSearch {
    interface Formprops {
        apiInitPath?: string;
    }
    export class GridForm extends React.Component<Formprops, {
        list?: Array<server.Product>,
        isSearch?: boolean,
        searchData?: { keyword?: string }
    }>{

        constructor() {

            super();
            this.componentDidMount = this.componentDidMount.bind(this);
            this.queryInitData = this.queryInitData.bind(this);
            this.showAddr = this.showAddr.bind(this);
            this.changeInputVal = this.changeInputVal.bind(this);
            this.handleSearch = this.handleSearch.bind(this);
            this.render = this.render.bind(this);


            this.state = {
                list: [],
                isSearch: false,
                searchData: {
                    keyword: null
                }
            }
        }
        static defaultProps: Formprops = {
            apiInitPath: gb_approot + 'Index/getProductSearch'
        }
        componentDidMount() {
            //this.queryInitData();
        }
        queryInitData() {
            CommFunc.jqGet(this.props.apiInitPath, { keyword: this.state.searchData.keyword })
                .done((data, textStatus, jqXHRdata) => {
                    console.log(data, this.props.apiInitPath);
                    if (data.result) {
                        this.setState({ list: data.data, isSearch: true });
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
        changeInputVal(name: string, e: React.SyntheticEvent) {
            let input: HTMLInputElement = e.target as HTMLInputElement;
            let obj = this.state.searchData
            obj[name] = input.value;
            this.setState({
                searchData: obj,
                isSearch: false
            });
        }
        render() {

            var outHtml: JSX.Element = null;
            let searchData = this.state.searchData;
            let rows = [];
            this.state.list.forEach((itemData, i) => {
                let productHtml: JSX.Element = null;
                let kvLiHtml: JSX.Element = null;
                let newLiHtml: JSX.Element = null;
                let shippingLiHtml: JSX.Element = null;
                let now: Date = new Date();
                let insertDate: Date = new Date(itemData.i_InsertDateTime);
                if (itemData.kvalue > 0 && itemData.kvalue != undefined) {
                    kvLiHtml = <li><span className="kv">{itemData.kvalue + 'KV'}</span></li>;
                }
                console.log(now, insertDate);
                if (insertDate.getFullYear() == now.getFullYear() && insertDate.getMonth() == now.getMonth()) {
                    newLiHtml = <li><span className="new">New</span></li>;
                }
                if (itemData.shipping_state) {
                    shippingLiHtml = <li><span className="cold">冷藏(凍) </span></li>;
                }
                productHtml = (
                    <article className="pro" key={itemData.product_no}>
                        <h4 className="title">{itemData.product_name}</h4>
                        <a href={gb_approot + 'Products/content?id=' + itemData.product_no}>
                            <i><img src={itemData.imgsrc} alt="" /></i>
                            </a>
                        <strong className="sale">NT$ {itemData.price}</strong>
                        <del>NT$ {itemData.price_gen}</del>
                        <em>-{Math.round(((itemData.price_gen - itemData.price) / itemData.price_gen) * 100) }%</em>
                        <ul className="label">
                            {kvLiHtml}
                            {newLiHtml}
                            {shippingLiHtml}
                            </ul>
                        </article>
                );
                rows.push(productHtml);
            });

            let searchInfo: JSX.Element = null;
            if (this.state.isSearch) {
                searchInfo = <h4 className="title">搜尋結果：共有 {rows.length} 項「{searchData.keyword}」相關商品資訊</h4>;
            }
            outHtml = (
                <div>
                    <h3 className="hidden">商品快速查詢</h3>
                    <article className="search">
                        <form action="" className="search-form row" onSubmit={this.handleSearch}>
                            <div className="col-4 offset-3">
                                <input type="text" className="form-element"
                                    value={searchData.keyword}
                                    onChange={this.changeInputVal.bind(this, 'keyword') }
                                    required
                                    placeholder="請在此輸入您要查詢的商品名稱" />
                                </div>
                            <div className="col-2">
                                <button className="btn btn-lg btn-success">查詢</button>
                                </div>
                            </form>
                        {searchInfo}
                        </article>
                    {/*--搜尋結果--*/}
                    {rows}
                    {/*--搜尋結果--*/}
                    </div>
            );
            return outHtml;
        }
    }
}

var dom = document.getElementById('search_content');
ReactDOM.render(<ProductSearch.GridForm />, dom);