import $ = require('jquery');
import React = require('react');
import ReactDOM = require('react-dom');
import Moment = require('moment');
import ReactBootstrap = require("react-bootstrap");
import CommCmpt = require('comm-cmpt');
import CommFunc = require('comm-func');
import DT = require('dt');

namespace ProductCategoryL3 {
    interface Rows {
        product_category_l3_id?: string;
        check_del?: boolean,
        l1_id: number;
        l2_id: number;
        l1_name?: string;
        l2_name?: string;
        l3_name?: string;
        l3_sort?: number;
        i_Hide?: boolean;
        i_Lang: string;
    }
    interface FormState<G, F> extends BaseDefine.GirdFormStateBase<G, F> {
        searchData?: {
            keyword: string
            i_Lang: string
            category_l1: number
            category_l2: number
        },
        all_category?: Array<server.LangOptionByProduct>,
        options_category_l1?: Array<server.L1>
        options_category_l2?: Array<server.L2>
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
            apiPathName: gb_approot + 'api/ProductCategoryL2'
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
                       <td>{this.props.itemData.l1_name}</td>
                       <td>{this.props.itemData.l2_name}</td>
                       <td>{this.props.itemData.l3_name}</td>
                       <td>{this.props.itemData.l3_sort }</td>
                       <td>{this.props.itemData.i_Hide ? <span className="label label-default">隱藏</span> : <span className="label label-primary">顯示</span>}</td>
                       <td><StateForGird id={this.props.itemData.i_Lang} stateData={DT.LangData} /></td>
                </tr>;

        }
    }
    export class GridForm extends React.Component<BaseDefine.GridFormPropsBase, FormState<Rows, server.Product_Category_L3>>{

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
            this.handleSearch = this.handleSearch.bind(this);
            this.componentDidUpdate = this.componentDidUpdate.bind(this);
            this.queryInitData = this.queryInitData.bind(this);
            this.setLangVal = this.setLangVal.bind(this);
            this.changeSearchCategoryL1 = this.changeSearchCategoryL1.bind(this);
            this.onFieldDataL2Change = this.onFieldDataL2Change.bind(this);
            this.render = this.render.bind(this);


            this.state = {
                fieldData: {},
                gridData: { rows: [], page: 1 },
                edit_type: 0,
                searchData: { keyword: null, i_Lang: null, category_l1: null, category_l2: null },
                all_category: [],
                options_category_l1: [],
                options_category_l2: []
            }
        }
        static defaultProps: BaseDefine.GridFormPropsBase = {
            fdName: 'fieldData',
            gdName: 'searchData',
            apiPath: gb_approot + 'api/ProductCategoryL3',
            apiInitPath: gb_approot + 'api/GetAction/GetPorductCategoryL2'
        }
        componentDidMount() {
            this.queryGridData(1);
            this.queryInitData();
        }
        componentDidUpdate(prevProps, prevState) {
        }
        queryInitData() {
            CommFunc.jqGet(this.props.apiInitPath, {})
                .done((data, textStatus, jqXHRdata) => {
                    if (data.result) {
                        this.setState({ all_category: data.data });
                    }
                })
                .fail((jqXHR, textStatus, errorThrown) => {
                    CommFunc.showAjaxError(errorThrown);
                });
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
                    ids.push('ids=' + this.state.gridData.rows[i].product_category_l3_id);
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
            let options = this.state.all_category[0].items;
            this.setState({
                edit_type: 1, fieldData: {
                    i_Hide: false,
                    l3_sort: 0,
                    i_Lang: 'en-US',
                    l1_id: options[0].l1_id,
                    l2_id: options[0].l2_list[0].l2_id
                }, options_category_l1: options
            });
        }
        updateType(id: number | string) {

            CommFunc.jqGet(this.props.apiPath, { id: id })
                .done((data, textStatus, jqXHRdata) => {
                    let options = [];
                    this.state.all_category.forEach((item, i) => {
                        if (data.data.i_Lang == item.lang) {
                            options = item.items;
                        }
                    });
                    this.setState({ edit_type: 2, fieldData: data.data, options_category_l1: options });
                })
                .fail((jqXHR, textStatus, errorThrown) => {
                    CommFunc.showAjaxError(errorThrown);
                });
        }
        noneType() {
            let searchData = this.state.searchData;
            let options_1 = [];
            let options_2 = [];
            this.state.all_category.forEach((item, i) => {
                if (searchData.i_Lang == item.lang) {
                    options_1 = item.items;
                }
            });
            options_1.map((item: server.L1, i) => {
                if (searchData.category_l1 == item.l1_id) {
                    options_2 = item.l2_list;
                }
            })
            this.gridData(0)
                .done(function (data, textStatus, jqXHRdata) {
                    this.setState({ edit_type: 0, gridData: data, options_category_l1: options_1, options_category_l2: options_2 });
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
        setLangVal(collentName: string, name: string, e: React.SyntheticEvent) {
            let input: HTMLInputElement = e.target as HTMLInputElement;
            let NewState = this.state;

            let obj = this.state[collentName];
            obj[name] = input.value;

            NewState.options_category_l1 = [];
            NewState.all_category.forEach((item, i) => {
                if (item.lang == input.value) {
                    NewState.options_category_l1 = item.items;
                }
            });
            if (collentName == this.props.gdName) {
                NewState.options_category_l2 = [];
                obj['category_l1'] = null;//語系切換,分類搜尋條件清空
                obj['category_l2'] = null;//語系切換,分類搜尋條件清空
                $("#search-category-l1 option:first").attr("selected", "true");
                $("#search-category-l2 option:first").attr("selected", "true");
            } else if (collentName == this.props.fdName) {
                if (NewState.options_category_l1.length > 0 && NewState.options_category_l1[0].l2_list.length > 0) {
                    $("#field-category option:first").attr("selected", "true");
                    obj['l1_id'] = NewState.options_category_l1[0].l1_id;
                    obj['l2_id'] = NewState.options_category_l1[0].l2_list[0].l2_id;
                }
            }
            this.setState(NewState);
        }
        changeSearchCategoryL1(name: string, e: React.SyntheticEvent) {
            let input: HTMLInputElement = e.target as HTMLInputElement;
            let NewState = this.state;

            let obj = this.state.searchData;
            obj[name] = input.value;

            NewState.options_category_l2 = [];
            NewState.options_category_l1.forEach((item, i) => {
                if (item.l1_id == parseInt(input.value)) {
                    NewState.options_category_l2 = item.l2_list;
                }
            });

            obj['category_l2'] = null;//階層切換,分類搜尋條件清空
            $("#search-category-l2 option:first").attr("selected", "true");
            this.setState(NewState);
        }
        onFieldDataL2Change(e: React.SyntheticEvent) {
            let input: HTMLInputElement = e.target as HTMLInputElement;
            let obj = this.state.fieldData;
            var select = $(':selected', e.target);//取得目前選取的option
            obj['l1_id'] = parseInt(select.attr('data-l1'));
            obj['l2_id'] = parseInt(input.value);
            this.setState({ fieldData: obj });
        }
        render() {

            var outHtml: JSX.Element = null;
            let option_l1 = this.state.options_category_l1;
            let option_l2 = this.state.options_category_l2;

            if (this.state.edit_type == 0) {
                let searchData = this.state.searchData;
                let GridNavPage = CommCmpt.GridNavPage;

                outHtml =
                    (
                        <div>
                    <h3 className="title">
                        {this.props.caption}
                        </h3>
                    <form onSubmit={this.handleSearch}>
                        <div className="table-responsive">
                            <div className="table-header">
                                <div className="table-filter">
                                    <div className="form-inline">
                                        <div className="form-group">
                                            <label>標題</label> { }
                                            <input type="text" className="form-control"
                                                onChange={this.changeGDValue.bind(this, 'keyword') }
                                                value={searchData.keyword}
                                                placeholder="請輸入關鍵字..." /> { }
                                            <label>語系</label> { }
                                            <select className="form-control"
                                                onChange={this.setLangVal.bind(this, this.props.gdName, 'i_Lang') }
                                                value={searchData.i_Lang} >
                                                <option value="">全部</option>
                                                {
                                                DT.LangData.map((itemData, i) => <option key={i} value={itemData.id}>{itemData.label}</option>)
                                                }
                                                </select> { }
                                            <label>第一層分類</label> { }
                                            <select className="form-control"
                                                id="search-category-l1"
                                                onChange={this.changeSearchCategoryL1.bind(this, 'category_l1') }
                                                value={searchData.category_l1} >
                                                <option value="">全部</option>
                                                {
                                                option_l1.map((itemData, i) => <option key={i} value={itemData.l1_id}>{itemData.l1_name}</option>)
                                                }
                                                </select> { }
                                            <label>第二層分類</label> { }
                                            <select className="form-control"
                                                id="search-category-l2"
                                                onChange={this.changeGDValue.bind(this, 'category_l2') }
                                                value={searchData.category_l2} >
                                                <option value="">全部</option>
                                                {
                                                option_l2.map((itemData, i) => <option key={i} value={itemData.l2_id}>{itemData.l2_name}</option>)
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
                                        <th className="col-xs-2">第一層分類</th>
                                        <th className="col-xs-2">第二層分類</th>
                                        <th className="col-xs-2">分類名稱</th>
                                        <th className="col-xs-1">排序</th>
                                        <th className="col-xs-1">狀態</th>
                                        <th className="col-xs-1">語系</th>
                                        </tr>
                                    </thead>
                                <tbody>
                                    {
                                    this.state.gridData.rows.map(
                                        (itemData, i) =>
                                            <GridRow key={i}
                                                ikey={i}
                                                primKey={itemData.product_category_l3_id}
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
                        />
                        </form>
                            </div>
                    );
            }
            else if (this.state.edit_type == 1 || this.state.edit_type == 2) {
                let fieldData = this.state.fieldData;


                outHtml = (
                    <div>
    <h4 className="title"> {this.props.caption} 基本資料維護</h4>
    <form className="form-horizontal" onSubmit={this.handleSubmit}>
        <div className="col-xs-10">
            <div className="form-group">
                <label className="col-xs-2 control-label">分類名稱</label>
                <div className="col-xs-8">
                    <input type="text" className="form-control" onChange={this.changeFDValue.bind(this, 'l3_name') } value={fieldData.l3_name} maxLength={64} required />
                    </div>
                <small className="col-xs-2 help-inline"><span className="text-danger">(必填) </span>, 最多64字</small>
                </div>
            <div className="form-group">
                <label className="col-xs-2 control-label">語系</label>
                <div className="col-xs-8">
                    <select className="form-control"
                        onChange={this.setLangVal.bind(this, this.props.fdName, 'i_Lang') }
                        value={fieldData.i_Lang} >
                        {
                        DT.LangData.map((itemData, i) => <option key={i} value={itemData.id}>{itemData.label}</option>)
                        }
                        </select>
                    </div>
                <small className="help-inline col-xs-2 text-danger">(必填) </small>
                </div>
            <div className="form-group">
                <label className="col-xs-2 control-label">分類</label>
                <div className="col-xs-8">
                    <select className="form-control" id="field-category"
                        onChange={this.onFieldDataL2Change.bind(this) }
                        value={fieldData.l2_id} >
                        {
                        option_l1.map((itemData, i) => {
                            let options_html = <optgroup key={'l1-'} label={itemData.l1_name}>
                                {
                                itemData.l2_list.map((l2, j) => < option key= { 'l2-' + j } data-l1={itemData.l1_id} value= { l2.l2_id } > { l2.l2_name }</option>)
                                }
                                </optgroup>
                            return options_html;
                        })
                        }
                        </select>
                    </div>
                <small className="help-inline col-xs-2 text-danger">(必填) </small>
                </div>
            <div className="form-group">
                <label className="col-xs-2 control-label">排序</label>
                <div className="col-xs-8">
                    <input type="number" className="form-control" onChange={this.changeFDValue.bind(this, 'l3_sort') } value={fieldData.l3_sort}  />
                    </div>
                <small className="col-xs-2 help-inline">數字越大越前面</small>
                </div>
            <div className="form-group">
                <label className="col-xs-2 control-label">狀態</label>
                <div className="col-xs-4">
                   <div className="radio-inline">
                       <label>
                            <input type="radio"
                                name="i_Hide"
                                value={true}
                                checked={fieldData.i_Hide === true}
                                onChange={this.changeFDValue.bind(this, 'i_Hide') }
                                />
                            <span>隱藏</span>
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
                            <span>顯示</span>
                           </label>
                       </div>
                    </div>
                </div>
            <div className="form-action">
                <div className="col-xs-4 col-xs-offset-2">
                    <button type="submit" className="btn-primary"><i className="fa-check"></i> 儲存</button> { }
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
ReactDOM.render(<ProductCategoryL3.GridForm caption={gb_caption} menuName={gb_menuname} iconClass="fa-list-alt" />, dom);