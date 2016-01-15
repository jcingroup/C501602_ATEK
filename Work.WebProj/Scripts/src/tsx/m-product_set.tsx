import $ = require('jquery');
import React = require('react');
import ReactDOM = require('react-dom');
import CommCmpt = require('comm-cmpt');
import CommFunc = require('comm-func');
import ReactBootstrap = require("react-bootstrap");

namespace ProductSet {
    interface Rows {
        check_del: boolean,
        product_no: string;
        product_type: number;
        product_name: string;
        price: number;
        standard: string;
        sort: number;
        memo: string;
        kvalue: number;
        i_Hide: boolean;
        state: boolean;
        is_Hot: boolean;
        is_TopSales: boolean;
    }
    interface GridRowProps<R> extends BaseDefine.GridRowPropsBase<R> {
        changeProudctSet(key: number, type: ProductSetType, checked: boolean): void;
    }
    interface ComponentState<G, F> extends BaseDefine.GirdFormStateBase<G, F> {
        category_option?: Array<server.L1>
        category2_option?: Array<server.L2>
        style_value?: string,
        exist_product_sn?: boolean,
        searchData?: {
            keyword: string,
            hot: boolean,
            top: boolean,
            l1: number,
            l2: number
        }
    }
    interface CallResult extends IResultBase {
        no: string
    }

    class GridRow extends React.Component<GridRowProps<Rows>, BaseDefine.GridRowStateBase> {
        constructor() {
            super();
            this.delCheck = this.delCheck.bind(this);
            this.modify = this.modify.bind(this);
            this.setProduct = this.setProduct.bind(this);
        }
        static defaultProps = {
        }
        delCheck(i, chd) {
            this.props.delCheck(i, chd);
        }
        modify() {
            this.props.updateType(this.props.primKey)
        }
        setProduct(no: string, type: ProductSetType, e: React.FormEvent) {
            let input: HTMLInputElement = e.target as HTMLInputElement;
            this.props.changeProudctSet(this.props.ikey, type, input.checked);
        }

        render() {
            return <tr>
                    <td className="text-center">
                         <label className="cbox">
                             <input type="checkbox" checked={this.props.itemData.is_Hot} onChange={this.setProduct.bind(this, this.props.primKey, ProductSetType.hot) } />
                             <i className="fa-check"></i>
                             </label>
                        </td>
                    <td className="text-center">
                         <label className="cbox">
                             <input type="checkbox" checked={this.props.itemData.is_TopSales} onChange={this.setProduct.bind(this, this.props.primKey, ProductSetType.top) } />
                             <i className="fa-check"></i>
                             </label>
                        </td>
                    <td>{this.props.itemData.product_no}</td>
                    <td>{this.props.itemData.product_name}</td>
                    <td>{this.props.itemData.price}</td>
                    <td>{this.props.itemData.kvalue}</td>
                    <td>{this.props.itemData.i_Hide ? <span className="label label-default">下架</span> : <span className="label label-primary">上架</span>}</td>
                    <td>{this.props.itemData.state ? <span className="label label-default">下架</span> : <span className="label label-primary">上架</span>}</td>
                </tr>;
        }
    }
    export class GirdForm extends React.Component<BaseDefine.GridFormPropsBase, ComponentState<Rows, server.Product>>{

        constructor() {

            super();
            this.updateType = this.updateType.bind(this);
            this.noneType = this.noneType.bind(this);
            this.queryGridData = this.queryGridData.bind(this);
            this.handleSubmit = this.handleSubmit.bind(this);
            this.handleSearch = this.handleSearch.bind(this);
            this.deleteSubmit = this.deleteSubmit.bind(this);
            this.delCheck = this.delCheck.bind(this);
            this.checkAll = this.checkAll.bind(this);
            this.changeProudctSet = this.changeProudctSet.bind(this);
            this.changeL1CategorySearch = this.changeL1CategorySearch.bind(this);

            this.componentDidMount = this.componentDidMount.bind(this);
            this.componentDidUpdate = this.componentDidUpdate.bind(this);
            this.componentWillUnmount = this.componentWillUnmount.bind(this);

            this.insertType = this.insertType.bind(this);
            this.state = {
                fieldData: null,
                gridData: { rows: [], page: 1 },
                edit_type: 0,
                category_option: [],
                category2_option: [],
                exist_product_sn: false,
                searchData: {
                    keyword: null, hot: null, top: null, l1: null, l2: null
                },
            }

        }
        static defaultProps: BaseDefine.GridFormPropsBase = {
            fdName: 'fieldData',
            gdName: 'searchData',
            apiPath: gb_approot + 'api/Product'
        }
        componentDidMount() {

            CommFunc.jqGet(gb_approot + 'Active/Product/aj_Init', {})
                .done((data: Array<server.L1>, textStatus, jqXHRdata) => {
                    this.setState({
                        category_option: data
                    });
                })
                .fail((jqXHR, textStatus, errorThrown) => {
                    CommFunc.showAjaxError(errorThrown);
                });

            this.queryGridData(1);
        }
        componentDidUpdate(prevProps, prevState) {
        }
        componentWillUnmount() {
            //元件被從 DOM 卸載之前執行，通常我們在這個方法清除一些不再需要地物件或 timer。
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
                    if (data.records == 0) {
                        CommFunc.tosMessage(null, '無任何資料', ToastrType.warning);
                    }
                    this.setState({ gridData: data });
                })
                .fail((jqXHR, textStatus, errorThrown) => {
                    CommFunc.showAjaxError(errorThrown);
                });
        }
        handleSubmit(e: React.FormEvent) {

            e.preventDefault();
            if (this.state.edit_type == 1) {

                if (this.state.exist_product_sn) {
                    alert('產品編號已存在無法新增');
                    return;
                }
                CommFunc.jqPost(this.props.apiPath, this.state.fieldData)
                    .done((data: CallResult, textStatus, jqXHRdata) => {
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
                    ids.push('ids=' + this.state.gridData.rows[i].product_no);
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
                    product_no: '',
                    product_category_l1_id: this.state.category_option[0].l1_id,
                    product_category_l2_id: this.state.category_option[0].l2_list[0].l2_id,
                    i_Hide: false,
                    state: false
                }
            });
        }
        updateType(id: number | string) {

            CommFunc.jqGet(this.props.apiPath, { no: id })
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
        changeProudctSet(key: number, type: ProductSetType, checked: boolean) {
            let obj = this.state.gridData;
            let apiSetPath: string = null;
            if (type == ProductSetType.hot) {
                obj.rows[key]['is_Hot'] = checked;
                apiSetPath = gb_approot + 'api/GetAction/SetProductHot';

            } else if (type == ProductSetType.top) {
                obj.rows[key]['is_TopSales'] = checked;
                apiSetPath = gb_approot + 'api/GetAction/SetProductTop';
            }

            CommFunc.jqPut(apiSetPath, { product_no: obj.rows[key].product_no, val: checked })
                .done((data, textStatus, jqXHRdata) => {
                    if (data.result) {
                        this.setState({ gridData: obj });
                    }
                })
                .fail((jqXHR, textStatus, errorThrown) => {
                    CommFunc.showAjaxError(errorThrown);
                });

        }
        changeL1CategorySearch(name: string, e: React.SyntheticEvent) {
            let input: HTMLInputElement = e.target as HTMLInputElement;
            let obj = this.state.searchData;
            let l2_category = [];
            obj[name] = input.value;
            obj.l2 = null;
            for (let i of this.state.category_option) {
                if (i.l1_id == obj[name]) {
                    l2_category = i.l2_list;
                    break;
                }
            }
            this.setState({ searchData: obj, category2_option: l2_category });
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
                            <label></label>
                            {}
                            <input type="text" className="form-control" value={searchData.keyword} onChange={this.changeGDValue.bind(this, 'keyword') } placeholder="輸入品名或產品編號" /> { }
                            <label>主分類</label>
                            <select className="form-control" value={searchData.l1} onChange={this.changeL1CategorySearch.bind(this, 'l1') } >
                                <option value="">全部</option>
                                {
                                this.state.category_option.map((itemData, i) => <option key={i} value={itemData.l1_id}>{itemData.l1_name}</option>)
                                }
                                </select> { }
                            <label>次分類</label>
                            <select className="form-control" value={searchData.l2} onChange={this.changeGDValue.bind(this, 'l2') } >
                                <option value="">全部</option>
                                {
                                this.state.category2_option.map((itemData, i) => <option key={i} value={itemData.l2_id}>{itemData.l2_name}</option>)
                                }
                                </select> { }
                            <label>熱門商品</label>
                            <select className="form-control" value={searchData.hot} onChange={this.changeGDValue.bind(this, 'hot') } >
                                <option value="">全部</option>
                                <option value="true">是</option>
                                <option value="false">否</option>
                                </select> { }
                            <label>銷售排行</label>
                            <select className="form-control" value={searchData.top} onChange={this.changeGDValue.bind(this, 'top') } >
                                <option value="">全部</option>
                                <option value="true">是</option>
                                <option value="false">否</option>
                                </select> { }
                            <button className="btn-primary" type="submit"><i className="fa-search"></i> 搜尋</button>
                            </div>
                        </div>
                    </div>
                </div>
            <table>
                <thead>
                    <tr>
                        <th className="col-xs-1 text-center">熱門商品</th>
                        <th className="col-xs-1 text-center">銷售排行</th>
                        <th className="col-xs-2">品號</th>
                        <th className="col-xs-4">品名</th>
                        <th className="col-xs-2">單價</th>
                        <th className="col-xs-2">KV</th>
                        <th className="col-xs-1">網路</th>
                        <th className="col-xs-1">現場</th>
                        </tr>
                    </thead>
                <tbody>
                    {this.state.gridData.rows.map(
                        (itemData, i) =>
                            <GridRow key={i}
                                ikey={i}
                                primKey={itemData.product_no}
                                itemData={itemData}
                                delCheck={this.delCheck}
                                updateType={this.updateType}
                                changeProudctSet={this.changeProudctSet}/>
                    ) }
                    </tbody>
                </table>
            </div>
        <GridNavPage startCount={this.state.gridData.startcount} endCount={this.state.gridData.endcount} recordCount={this.state.gridData.records} totalPage={this.state.gridData.total} nowPage={this.state.gridData.page}
            onQueryGridData={this.queryGridData} InsertType={this.insertType} deleteSubmit={this.deleteSubmit}
            showAdd={false} showDelete={false}/>
        </form>
                        </div>
                );



            return outHtml;
        }
    }
}
var dom = document.getElementById('page_content');
ReactDOM.render(<ProductSet.GirdForm caption={gb_caption} menuName={gb_menuname} iconClass="fa-list-alt" />, dom);