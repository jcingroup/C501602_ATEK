import $ = require('jquery');
import React = require('react');
import ReactDOM = require('react-dom');
import CommCmpt = require('comm-cmpt');
import CommFunc = require('comm-func');
import ReactBootstrap = require("react-bootstrap");
//ckeditor options for 產品簡介
var ck_options = {
    language: 'zh',
    toolbar: [
        { name: "document", items: ["Source", "-"] },
        { name: "tools", items: ["Maximize", "-"] },
        {
            name: "clipboard",
            items: ["Cut", "Copy", "Paste", "PasteText", "PasteFromWord", "Undo", "Redo"]
        },
        { name: "links", items: ["Link", "Unlink"] },
        {
            name: 'insert',
            items: ['Smiley']
        },
        {
            name: "basicstyles",
            items: ["FontSize", "Bold", "Underline", "Strike", "-", "JustifyLeft", "JustifyCenter", "JustifyRight", "-", "RemoveFormat"]
        },
        { name: "paragraph", items: ["NumberedList", "BulletedList", "-", "Outdent", "Indent"] },
        { name: "colors", items: ["TextColor", "BGColor"] },
        { name: "editing" }
    ],
    autoUpdateElement: true
};

namespace Product {
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
        shipping_state: boolean;
    }
    interface ComponentState<G, F> extends BaseDefine.GirdFormStateBase<G, F> {
        category_option?: Array<server.L1>
        category2_option?: Array<server.L2>
        style_value?: string,
        exist_product_sn?: boolean,
        searchData?: {
            keyword: string,
            l1: number,
            l2: number
        }
    }
    interface CallResult extends IResultBase {
        no: string
    }

    class HandleProductSelect extends React.Component<{ product_sn: string },
        { styles?: Array<server.ProductSelect>, style_value?: string }> {
        constructor() {
            super();
            this.componentDidMount = this.componentDidMount.bind(this);
            this.query = this.query.bind(this);
            this.delItem = this.delItem.bind(this);
            this.submit = this.submit.bind(this);
            this.onChange = this.onChange.bind(this);
            this.state = {
                styles: [], style_value: null
            };
        }
        static defaultProps = {
        }

        private query() {
            CommFunc.jqGet(gb_approot + 'api/ProductSelect', { product_no: this.props.product_sn })
                .done((data: Array<server.ProductSelect>, textStatus, jqXHRdata) => {
                    this.setState({
                        style_value: null,
                        styles: data
                    });
                })
                .fail((jqXHR, textStatus, errorThrown) => {
                    CommFunc.showAjaxError(errorThrown);
                });
        }
        componentDidMount() {
            this.query();
        }
        addNew() {

            let sort: number = 1;
            let last_item: server.ProductSelect;

            if (this.state.styles.length > 0) {
                last_item = this.state.styles[this.state.styles.length - 1];

                if (last_item.edit_type == 1) {
                    alert('尚有資料編輯中，無法新增。');
                    return;
                }
                sort = last_item.sort + 1;
            }


            let new_item: server.ProductSelect = {
                edit_type: 1,
                product_select_id: 0,
                product_no: this.props.product_sn,
                style_name: '',
                sort: sort
            };
            let obj = this.state.styles;
            obj.push(new_item);
            this.setState({ styles: obj });
        }
        delItem(i: number, e: React.SyntheticEvent) {

            let obj = this.state.styles;
            let item = obj[i];

            CommFunc.jqDelete(gb_approot + 'api/ProductSelect?id=' + item.product_select_id, {})
                .done((data: Array<server.ProductSelect>, textStatus, jqXHRdata) => {
                    this.query();
                })
                .fail((jqXHR, textStatus, errorThrown) => {
                    CommFunc.showAjaxError(errorThrown);
                });
        }
        submit() {
            if (this.state.style_value.trim() == '') {
                alert('樣式名稱未填寫!');
                return;
            }

            let sort: number = 1;
            let last_item: server.ProductSelect;

            if (this.state.styles.length > 0) {
                last_item = this.state.styles[this.state.styles.length - 1];
                sort = last_item.sort + 1;
            }

            var new_obj: server.ProductSelect = {
                product_no: this.props.product_sn,
                style_name: this.state.style_value.trim(),
                sort: sort
            };

            CommFunc.jqPost(gb_approot + 'api/ProductSelect', new_obj)
                .done((data, textStatus, jqXHRdata) => {
                    this.query();
                })
                .fail((jqXHR, textStatus, errorThrown) => {
                    CommFunc.showAjaxError(errorThrown);
                });
        }
        cancel() {
            let obj = this.state.styles;
            obj.splice(-1, 1);
            this.setState({ styles: obj });
        }
        onChange(e: React.SyntheticEvent) {
            let input: HTMLInputElement = e.target as HTMLInputElement;
            this.setState({ style_value: input.value });
        }

        render() {
            return (
                <div>
    <div className="input-group">
        <input type="text" className="form-control" value={this.state.style_value} onChange={this.onChange} />
        <span className="input-group-btn">
                                                <button type="button" className="btn-success" onClick={this.submit}><i className="fa-plus"></i> 新增</button>
            </span>
        </div>
    <ul className="help-block list-inline">
        {this.state.styles.map((item, i) => {
            return <li key={item.product_select_id}><span className="label label-info">{item.style_name} <button type="button" className="btn-link" onClick={this.delItem.bind(this, i) }> &times; </button></span></li>
        }) }
        </ul>
    <small className="help-block">ex.白色 / 黑色、S 號 / M 號...</small>
                    </div>

            );
        }
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
            return <tr>
                    <td className="text-center">
                         <CommCmpt.GridCheckDel iKey={this.props.ikey}
                             chd={this.props.itemData.check_del}
                             delCheck={this.delCheck} />
                        </td>
                    <td className="text-center">
                        <CommCmpt.GridButtonModify modify={this.modify}/>
                        </td>
                    <td>{this.props.itemData.product_no}</td>
                    <td>{this.props.itemData.product_name}</td>
                    <td>{this.props.itemData.price}</td>
                    <td>{this.props.itemData.kvalue}</td>
                    <td>{this.props.itemData.shipping_state ? <span className="label label-info">冷凍(冷藏) </span> : <span className="label label-warning">常溫</span>}</td>
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
            this.onBlurProductSN = this.onBlurProductSN.bind(this);
            this.setCategoryDataChange = this.setCategoryDataChange.bind(this);

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
                searchData: { keyword: null, l1: null, l2: null },
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
            console.log('prevState', prevState.edit_type, this.state.edit_type);
            if ((prevState.edit_type == 0 && (this.state.edit_type == 1 || this.state.edit_type == 2)) ||
                (prevState.edit_type == 1 && this.state.edit_type == 2)) {
                console.log('CKEDITOR');
                CKEDITOR.replace('intro_s', ck_options);
                CKEDITOR.replace('intro');
            }
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
            this.state.fieldData.intro_s = CKEDITOR.instances['intro_s'].getData();
            this.state.fieldData.intro = CKEDITOR.instances['intro'].getData();
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
                    state: false,
                    shipping_state: false
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
        setCategoryDataChange(e: React.SyntheticEvent) {
            let select: HTMLSelectElement = e.target as HTMLSelectElement;
            let index: number = select.selectedIndex;
            let option: HTMLOptionElement = select.options[index];
            let obj = this.state.fieldData;

            obj.product_category_l1_id = parseInt(option.attributes['data-l1'].value);
            obj.product_category_l2_id = parseInt(option.value);

            this.setState({ fieldData: obj });
        }
        onBlurProductSN(e: React.SyntheticEvent) {
            //新增時檢查產品序號是否重複
            let input: HTMLInputElement = e.target as HTMLInputElement;
            CommFunc.jqGet(gb_approot + 'api/GetAction/GetProductNoExist', { no: input.value })
                .done((data, textStatus, jqXHRdata) => {
                    this.setState({ exist_product_sn: data });
                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    CommFunc.showAjaxError(errorThrown);
                });
        }
        changeL1CategorySearch(name: string, e: React.SyntheticEvent) {//產品分類搜尋
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
            var Tabs = ReactBootstrap.Tabs;
            var Tab = ReactBootstrap.Tab;

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
                            <label></label>
                            {}
                            <input type="text" className="form-control" onChange={this.changeGDValue.bind(this, 'keyword') } placeholder="輸入品名或產品編號" />
                            {}
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
                        <th className="col-xs-2">品號</th>
                        <th className="col-xs-4">品名</th>
                        <th className="col-xs-1">單價</th>
                        <th className="col-xs-1">KV</th>
                        <th className="col-xs-1">運送方式</th>
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
                                updateType={this.updateType} />
                    ) }
                    </tbody>
                </table>
            </div>
        <GridNavPage startCount={this.state.gridData.startcount} endCount={this.state.gridData.endcount} recordCount={this.state.gridData.records} totalPage={this.state.gridData.total} nowPage={this.state.gridData.page}
            onQueryGridData={this.queryGridData} InsertType={this.insertType} deleteSubmit={this.deleteSubmit} />
        </form>
                            </div>
                    );
            }
            else if (this.state.edit_type == 1 || this.state.edit_type == 2) {

                let fieldData = this.state.fieldData;
                let out_product_sn_exist = this.state.exist_product_sn ? <span>此產品編號已存</span> : null;

                outHtml = (
                    <div>
    <ul className="breadcrumb">
        <li><i className="fa-list-alt"></i>
            {this.props.menuName}
            </li>
        </ul>
    <h4 className="title"> {this.props.caption} </h4>
    <form className="form-horizontal" onSubmit={this.handleSubmit}>
        <div className="col-xs-6">
            <div className="form-group">
                <label className="col-xs-2 control-label">品號</label>
                <div className="col-xs-8">
                    <input type="text" className="form-control" onChange={this.changeFDValue.bind(this, 'product_no') } onBlur={this.onBlurProductSN} value={fieldData.product_no} disabled={this.state.edit_type == 2} maxLength={256}
                        required placeholder="新增後無法修改..." />
                    </div>
                <small className="col-xs-2 text-danger">(必填) {out_product_sn_exist} </small>
                </div>
            <div className="form-group">
                <label className="col-xs-2 control-label">品名</label>
                <div className="col-xs-8">
                    <input type="text" className="form-control" onChange={this.changeFDValue.bind(this, 'product_name') } value={fieldData.product_name} maxLength={256} required />
                    </div>
                <small className="col-xs-2 text-danger">(必填) </small>
                </div>
            <div className="form-group">
                <label className="col-xs-2 control-label">KV</label>
                <div className="col-xs-8">
                    <input type="number" className="form-control" onChange={this.changeFDValue.bind(this, 'kvalue') } value={fieldData.kvalue} required />
                    </div>
                <small className="col-xs-2 text-danger">(必填) </small>
                </div>
            <div className="form-group">
                <label className="col-xs-2 control-label">產品分類</label>
                <div className="col-xs-8">
                    <select className="form-control" value={fieldData.product_category_l2_id} onChange={this.setCategoryDataChange.bind(this) }>
                        {this.state.category_option.map((itemData, i) =>
                            <optgroup key={itemData.l1_id} label={itemData.l1_name}>
                              {itemData.l2_list.map((l2Data, i) =>
                                  <option key={l2Data.l2_id} data-l1={itemData.l1_id} value={l2Data.l2_id}>{l2Data.l2_name}</option>) }
                                </optgroup>) }
                        </select>
                    </div>
                <small className="col-xs-2 text-danger">(必填) </small>
                </div>
            <div className="form-group">
                <label className="col-xs-2 control-label">規格</label>
                <div className="col-xs-8">
                    <input type="text" className="form-control" onChange={this.changeFDValue.bind(this, 'standard') } value={fieldData.standard} />
                    </div>
                <small className="col-xs-2 text-danger">(必填) </small>
                </div>
            <div className="form-group">
                <label className="col-xs-2 control-label">實際售價</label>
                <div className="col-xs-8">
                    <input type="number" className="form-control" onChange={this.changeFDValue.bind(this, 'price') } value={fieldData.price} required />
                    </div>
                <small className="col-xs-2 text-danger">(必填) </small>
                </div>
            <div className="form-group">
                <label className="col-xs-2 control-label">建議售價</label>
                <div className="col-xs-8">
                    <input type="number" className="form-control" onChange={this.changeFDValue.bind(this, 'price_gen') } value={fieldData.price_gen} />
                    </div>
                </div>
            <div className="form-group">
                <label className="col-xs-2 control-label">成本價</label>
                <div className="col-xs-8">
                    <input type="number" className="form-control" onChange={this.changeFDValue.bind(this, 'price_ent') } value={fieldData.price_ent} />
                    </div>
                </div>
            <div className="form-group">
                <label className="col-xs-2 control-label">運送方式</label>
                <div className="col-xs-4">
                   <div className="radio-inline">
                       <label>
                            <input type="radio"
                                name="shipping_state"
                                value={true}
                                checked={fieldData.shipping_state === true}
                                onChange={this.changeFDValue.bind(this, 'shipping_state') }
                                />
                            <span>冷凍(冷藏) </span>
                           </label>
                       </div>
                   <div className="radio-inline">
                       <label>
                            <input type="radio"
                                name="shipping_state"
                                value={false}
                                checked={fieldData.shipping_state === false}
                                onChange={this.changeFDValue.bind(this, 'shipping_state') }
                                />
                            <span>常溫</span>
                           </label>
                       </div>
                    </div>
                </div>
            <div className="form-group">
                <label className="col-xs-2 control-label">網路</label>
                <div className="col-xs-4">
                   <div className="radio-inline">
                       <label>
                            <input type="radio"
                                name="i_Hide"
                                value={true}
                                checked={fieldData.i_Hide === true}
                                onChange={this.changeFDValue.bind(this, 'i_Hide') }
                                />
                            <span>下架</span>
                           </label>
                       </div>
                   <div className="radio-inline">
                       <label>
                            <input type="radio"
                                name="i_Hide"
                                value={false}
                                checked={fieldData.i_Hide === false}
                                onChange={this.changeFDValue.bind(this, 'i_Hide') }
                                />
                            <span>上架</span>
                           </label>
                       </div>
                    </div>
                </div>

            <div className="form-group">
                <label className="col-xs-2 control-label">現場</label>
                <div className="col-xs-4">
                   <div className="radio-inline">
                       <label>
                            <input type="radio"
                                name="state"
                                value={true}
                                checked={fieldData.state === true}
                                onChange={this.changeFDValue.bind(this, 'state') }
                                />
                            <span>下架</span>
                           </label>
                       </div>
                   <div className="radio-inline">
                       <label>
                            <input type="radio"
                                name="state"
                                value={false}
                                checked={fieldData.state === false}
                                onChange={this.changeFDValue.bind(this, 'state') }
                                />
                            <span>上架</span>
                           </label>
                       </div>
                    </div>
                </div>

            <div className="form-group">
                <label className="col-xs-2 control-label">顏色尺寸</label>
                <div className="col-xs-8">
                    {/*建議改成這樣：*/}
                    <HandleProductSelect product_sn={this.state.fieldData.product_no} />
                    </div>
                </div>



            </div>
        <div className="col-xs-6">
            <div className="form-group">
                <label className="col-xs-2 control-label">列表圖</label>
                <div className="col-xs-10">
                    <CommCmpt.MasterImageUpload FileKind="List" MainId={fieldData.product_no} ParentEditType={this.state.edit_type} url_upload={gb_approot + 'Active/Product/aj_FUpload'} url_list={gb_approot + 'Active/Product/aj_FList'}
                        url_delete={gb_approot + 'Active/Product/aj_FDelete'} />
                    <small className="help-block">最多1張圖，建議尺寸 180*180 px，檔案大小上限 2 MB</small>
                    </div>
                </div>
            <div className="form-group">
                <label className="col-xs-2 control-label">商品圖</label>
                <div className="col-xs-10">
                    <CommCmpt.MasterImageUpload FileKind="Roll" MainId={fieldData.product_no} ParentEditType={this.state.edit_type} url_upload={gb_approot + 'Active/Product/aj_FUpload'} url_list={gb_approot + 'Active/Product/aj_FList'}
                        url_delete={gb_approot + 'Active/Product/aj_FDelete'} />
                    <small className="help-block">最多10張圖，建議尺寸 385*280 px，檔案大小每張上限 2 MB</small>
                    </div>
                </div>
            <div className="form-group">
                <label className="col-xs-2 control-label">影片網址</label>
                <div className="col-xs-10">
                    <input type="text" className="form-control" onChange={this.changeFDValue.bind(this, 'video_text') } value={fieldData.video_text} />
                    <small className="help-block">請輸入完整 Youtube 網址 (包含 http 開頭) </small>
                    </div>
                </div>
            </div>
        <div className="col-xs-12">
            <Tabs defaultActiveKey={1} animation={false}>
                <Tab eventKey={1} title="產品簡介">
                    <textarea type="date" className="form-control" id="intro_s" name="intro_s" value={fieldData.intro_s} onChange={this.changeFDValue.bind(this, 'intro_s') } />
                    </Tab>
                <Tab eventKey={2} title="產品介紹">
                    <textarea type="date" className="form-control" id="intro" name="intro" value={fieldData.intro} onChange={this.changeFDValue.bind(this, 'intro') } />
                    </Tab>
                </Tabs>
            <div className="form-action">
                <div className="col-xs-12">
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
ReactDOM.render(<Product.GirdForm caption={gb_caption} menuName={gb_menuname} iconClass="fa-list-alt" />, dom);