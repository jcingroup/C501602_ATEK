import $ = require('jquery');
import React = require('react');
import ReactDOM = require('react-dom');
import Moment = require('moment');
import ReactBootstrap = require("react-bootstrap");
import CommCmpt = require('comm-cmpt');
import CommFunc = require('comm-func');
import DT = require('dt');

namespace Product {
    interface Rows {
        product_id?: string;
        check_del?: boolean,
        l1_id: number;
        l2_id: number;
        l3_id: number;
        l1_name?: string;
        l2_name?: string;
        l3_name?: string;
        power?: string;
        sort?: number;
        i_Hide?: boolean;
        i_Lang: string;
    }
    interface FormState<G, F> extends BaseDefine.GirdFormStateBase<G, F> {
        searchData?: {
            keyword: string
            i_Lang: string
            category_l1: number
            category_l2: number
            category_l3: number
            i_Hide: boolean
        },
        all_category?: Array<server.LangOptionByProduct>,
        options_category_l1?: Array<server.L1>,
        options_category_l2?: Array<server.L2>,
        options_category_l3?: Array<server.L3>,
        table_tmple?: string
    }
    interface FormResult extends IResultBase {
        id: string
    }

    class HandleProductModel extends React.Component<{ product_id: number, parent_edit_type: number },
        { models?: Array<server.ProductModel>, model_value?: string }> {
        constructor() {
            super();
            this.componentDidMount = this.componentDidMount.bind(this);
            this.query = this.query.bind(this);
            this.delItem = this.delItem.bind(this);
            this.submit = this.submit.bind(this);
            this.onChange = this.onChange.bind(this);
            this.state = {
                models: [], model_value: null
            };
        }
        static defaultProps = {
        }

        private query() {
            CommFunc.jqGet(gb_approot + 'api/ProductModel', { product_id: this.props.product_id })
                .done((data: Array<server.ProductModel>, textStatus, jqXHRdata) => {
                    this.setState({
                        model_value: null,
                        models: data
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
            let last_item: server.ProductModel;

            if (this.state.models.length > 0) {
                last_item = this.state.models[this.state.models.length - 1];

                if (last_item.edit_type == 1) {
                    alert('尚有資料編輯中，無法新增。');
                    return;
                }
                sort = last_item.sort + 1;
            }


            let new_item: server.ProductModel = {
                edit_type: 1,
                product_model_id: 0,
                product_id: this.props.product_id,
                model_name: '',
                sort: sort
            };
            let obj = this.state.models;
            obj.push(new_item);
            this.setState({ models: obj });
        }
        delItem(i: number, e: React.SyntheticEvent) {

            let obj = this.state.models;
            let item = obj[i];

            CommFunc.jqDelete(gb_approot + 'api/ProductModel?id=' + item.product_model_id, {})
                .done((data: Array<server.ProductModel>, textStatus, jqXHRdata) => {
                    this.query();
                })
                .fail((jqXHR, textStatus, errorThrown) => {
                    CommFunc.showAjaxError(errorThrown);
                });
        }
        submit() {
            if (this.state.model_value != null) {
                if (this.state.model_value.trim() == '') {
                    alert('型號名稱未填寫!');
                    return;
                }
            } else if (this.state.model_value == null) {
                alert('型號名稱未填寫!');
                return;
            }

            if (this.props.parent_edit_type == 1) {
                alert('請先儲存確認產品新增完畢後，再新增型號!');
                return;
            }
            let sort: number = 1;
            let last_item: server.ProductModel;

            if (this.state.models.length > 0) {
                last_item = this.state.models[this.state.models.length - 1];
                sort = last_item.sort + 1;
            }

            var new_obj: server.ProductModel = {
                product_id: this.props.product_id,
                model_name: this.state.model_value.trim(),
                sort: sort
            };

            CommFunc.jqPost(gb_approot + 'api/ProductModel', new_obj)
                .done((data, textStatus, jqXHRdata) => {
                    this.query();
                })
                .fail((jqXHR, textStatus, errorThrown) => {
                    CommFunc.showAjaxError(errorThrown);
                });
        }
        cancel() {
            let obj = this.state.models;
            obj.splice(-1, 1);
            this.setState({ models: obj });
        }
        onChange(e: React.SyntheticEvent) {
            let input: HTMLInputElement = e.target as HTMLInputElement;
            this.setState({ model_value: input.value });
        }

        render() {
            return (
                <div>
    <div className="input-group">
        <input type="text" className="form-control" value={this.state.model_value} onChange={this.onChange} />
        <span className="input-group-btn">
                                                <button type="button" className="btn-success" onClick={this.submit}><i className="fa-plus"></i> 新增</button>
            </span>
        </div>
    <ul className="help-block list-inline">
        {this.state.models.map((item, i) => {
            return <li key={item.product_model_id}><span className="label label-info">{item.model_name} <button type="button" className="btn-link" onClick={this.delItem.bind(this, i) }> &times; </button></span></li>
        }) }
        </ul>
    <small className="help-block">ex.LUX2-200-V024、LUX2-200-V036...</small>
                    </div>

            );
        }
    }
    class HandleProductCertificate extends React.Component<{ product_id: number, parent_edit_type: number },
        { certificates?: Array<server.ProductCertificate>, name_value?: string }> {
        constructor() {
            super();
            this.componentDidMount = this.componentDidMount.bind(this);
            this.query = this.query.bind(this);
            this.delItem = this.delItem.bind(this);
            this.submit = this.submit.bind(this);
            this.onChange = this.onChange.bind(this);
            this.state = {
                certificates: [], name_value: null
            };
        }
        static defaultProps = {
        }

        private query() {
            CommFunc.jqGet(gb_approot + 'api/ProductCertificate', { product_id: this.props.product_id })
                .done((data: Array<server.ProductCertificate>, textStatus, jqXHRdata) => {
                    this.setState({
                        name_value: null,
                        certificates: data
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
            let last_item: server.ProductCertificate;

            if (this.state.certificates.length > 0) {
                last_item = this.state.certificates[this.state.certificates.length - 1];

                if (last_item.edit_type == 1) {
                    alert('尚有資料編輯中，無法新增。');
                    return;
                }
                sort = last_item.sort + 1;
            }


            let new_item: server.ProductCertificate = {
                edit_type: 1,
                product_certificate_id: 0,
                product_id: this.props.product_id,
                name: '',
                sort: sort
            };
            let obj = this.state.certificates;
            obj.push(new_item);
            this.setState({ certificates: obj });
        }
        delItem(i: number, e: React.SyntheticEvent) {

            let obj = this.state.certificates;
            let item = obj[i];

            CommFunc.jqDelete(gb_approot + 'api/ProductCertificate?id=' + item.product_certificate_id, {})
                .done((data: Array<server.ProductCertificate>, textStatus, jqXHRdata) => {
                    this.query();
                })
                .fail((jqXHR, textStatus, errorThrown) => {
                    CommFunc.showAjaxError(errorThrown);
                });
        }
        submit() {
            if (this.state.name_value != null) {
                if (this.state.name_value.trim() == '') {
                    alert('證書名稱未填寫!');
                    return;
                }
            } else if (this.state.name_value == null) {
                alert('證書名稱未填寫!');
                return;
            }

            if (this.props.parent_edit_type == 1) {
                alert('請先儲存確認產品新增完畢後，再新增證書!');
                return;
            }
            let sort: number = 1;
            let last_item: server.ProductCertificate;

            if (this.state.certificates.length > 0) {
                last_item = this.state.certificates[this.state.certificates.length - 1];
                sort = last_item.sort + 1;
            }

            var new_obj: server.ProductCertificate = {
                product_id: this.props.product_id,
                name: this.state.name_value.trim(),
                sort: sort
            };

            CommFunc.jqPost(gb_approot + 'api/ProductCertificate', new_obj)
                .done((data, textStatus, jqXHRdata) => {
                    this.query();
                })
                .fail((jqXHR, textStatus, errorThrown) => {
                    CommFunc.showAjaxError(errorThrown);
                });
        }
        onChange(e: React.SyntheticEvent) {
            let input: HTMLInputElement = e.target as HTMLInputElement;
            this.setState({ name_value: input.value });
        }

        render() {
            return (
                <div>
            <div className="form-group">
                <label className="col-xs-2 control-label"></label>
                <div className="col-xs-8">
                    <div className="input-group">
                        <input type="text" className="form-control" value={this.state.name_value} onChange={this.onChange} placeholder="請輸入要新增的證書名稱..." />
                        <span className="input-group-btn">
                            <button type="button" className="btn-success" onClick={this.submit}><i className="fa-plus"></i> 新增</button>
                            </span>
                        </div>
                    </div>
                </div>

        {this.state.certificates.map((item, i) => {
            return <div key={item.product_certificate_id} className="form-group">
                 <label className="col-xs-2 control-label">{item.name}</label>
                 <div className="col-xs-8">
                    <CommCmpt.MasterImageUpload FileKind="Certificate" MainId={item.product_certificate_id} ParentEditType={this.props.parent_edit_type} url_upload={gb_approot + 'Active/ProductCertificate/aj_FUpload'} url_list={gb_approot + 'Active/ProductCertificate/aj_FList'}
                        url_delete={gb_approot + 'Active/ProductCertificate/aj_FDelete'} />
                     </div>
                    <button type="button" className="btn-danger col-xs-1" onClick={this.delItem.bind(this, i) }><i className="fa-times"></i></button>
                </div>
        }) }
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
            fdName: 'fieldData',
            gdName: 'searchData',
            apiPathName: gb_approot + 'api/Product'
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
                       <td>{this.props.itemData.power}</td>
                       <td>{this.props.itemData.sort }</td>
                       <td>{this.props.itemData.i_Hide ? <span className="label label-default">隱藏</span> : <span className="label label-primary">顯示</span>}</td>
                       <td><StateForGird id={this.props.itemData.i_Lang} stateData={DT.LangData} /></td>
                </tr>;

        }
    }
    export class GridForm extends React.Component<BaseDefine.GridFormPropsBase, FormState<Rows, server.Product>>{

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
            this.changeSearchCategoryL2 = this.changeSearchCategoryL2.bind(this);
            this.onFieldDataL3Change = this.onFieldDataL3Change.bind(this);

            this.changeFieldCategory = this.changeFieldCategory.bind(this);
            this.render = this.render.bind(this);


            this.state = {
                fieldData: {},
                gridData: { rows: [], page: 1 },
                edit_type: 0,
                searchData: { keyword: null, i_Lang: null, category_l1: null, category_l2: null, category_l3: null, i_Hide: null },
                all_category: [],
                options_category_l1: [],
                options_category_l2: [],
                options_category_l3: []
            }
        }
        static defaultProps: BaseDefine.GridFormPropsBase = {
            fdName: 'fieldData',
            gdName: 'searchData',
            apiPath: gb_approot + 'api/Product',
            apiInitPath: gb_approot + 'api/GetAction/GetPorductCategoryL3'
        }
        componentDidMount() {
            this.queryGridData(1);
            this.queryInitData();
        }
        componentDidUpdate(prevProps, prevState) {
            if ((prevState.edit_type == 0 && (this.state.edit_type == 1 || this.state.edit_type == 2))) {
                console.log('CKEDITOR');
                CKEDITOR.replace('feature', { customConfig: '../ckeditor/inlineConfig.js' });
                CKEDITOR.disableAutoInline = true;
                CKEDITOR.inline('technical_specification', { customConfig: '../ckeditor/inlineTableConfig.js' });
            }
        }
        queryInitData() {
            CommFunc.jqGet(this.props.apiInitPath, {})
                .done((data, textStatus, jqXHRdata) => {
                    if (data.result) {
                        this.setState({ all_category: data.data, table_tmple: data.table });
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
            this.state.fieldData.feature = CKEDITOR.instances['feature'].getData();
            this.state.fieldData.technical_specification = CKEDITOR.instances['technical_specification'].getData();
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
        deleteSubmit() {

            if (!confirm('確定是否刪除?')) {
                return;
            }

            var ids = [];
            for (var i in this.state.gridData.rows) {
                if (this.state.gridData.rows[i].check_del) {
                    ids.push('ids=' + this.state.gridData.rows[i].product_id);
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
            let options_l2 = options[0].l2_list;
            let optoins_l3 = options_l2[0].l3_list;
            this.setState({
                edit_type: 1, fieldData: {
                    i_Hide: false,
                    sort: 0,
                    i_Lang: 'en-US',
                    l1_id: options[0].l1_id,
                    l2_id: options[0].l2_list[0].l2_id,
                    l3_id: options[0].l2_list[0].l3_list[0].l3_id,
                    technical_specification: this.state.table_tmple
                },
                options_category_l1: options,
                options_category_l2: options_l2,
                options_category_l3: optoins_l3
            });
        }
        updateType(id: number | string) {

            CommFunc.jqGet(this.props.apiPath, { id: id })
                .done((data, textStatus, jqXHRdata) => {
                    let options: Array<server.L1> = [];
                    let options_l2: Array<server.L2> = [];
                    let options_l3: Array<server.L3> = [];
                    this.state.all_category.forEach((item, i) => {
                        if (data.data.i_Lang == item.lang) {
                            options = item.items;
                        }
                    });
                    options.forEach((l1, i) => {
                        if (l1.l1_id == data.data.l1_id) { options_l2 = l1.l2_list; }
                    });
                    options_l2.forEach((l2, i) => {
                        if (l2.l2_id == data.data.l2_id) { options_l3 = l2.l3_list; }
                    });
                    this.setState({
                        edit_type: 2, fieldData: data.data,
                        options_category_l1: options,
                        options_category_l2: options_l2,
                        options_category_l3: options_l3
                    });
                })
                .fail((jqXHR, textStatus, errorThrown) => {
                    CommFunc.showAjaxError(errorThrown);
                });
        }
        noneType() {
            let searchData = this.state.searchData;
            let options_1 = [];
            let options_2 = [];
            let options_3 = [];
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
            options_2.map((item: server.L2, i) => {
                if (searchData.category_l2 == item.l2_id) {
                    options_3 = item.l3_list;
                }
            })
            this.gridData(0)
                .done(function (data, textStatus, jqXHRdata) {
                    this.setState({ edit_type: 0, gridData: data, options_category_l1: options_1, options_category_l2: options_2, options_category_l3: options_3 });
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
            if (collentName == this.props.gdName) {
                this.queryGridData(1);
            }
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
                NewState.options_category_l3 = [];
                obj['category_l1'] = null;//語系切換,分類搜尋條件清空
                obj['category_l2'] = null;//語系切換,分類搜尋條件清空
                obj['category_l3'] = null;//語系切換,分類搜尋條件清空
                $("#search-category-l1 option:first").attr("selected", "true");
                $("#search-category-l2 option:first").attr("selected", "true");
                $("#search-category-l3 option:first").attr("selected", "true");
            } else if (collentName == this.props.fdName) {
                if (NewState.options_category_l1.length > 0 &&
                    NewState.options_category_l1[0].l2_list.length > 0 &&
                    NewState.options_category_l1[0].l2_list[0].l3_list.length > 0) {
                    $("#field-category option:first").attr("selected", "true");
                    obj['l1_id'] = NewState.options_category_l1[0].l1_id;
                    obj['l2_id'] = NewState.options_category_l1[0].l2_list[0].l2_id;
                    obj['l3_id'] = NewState.options_category_l1[0].l2_list[0].l3_list[0].l3_id;
                } else {
                    obj['l1_id'] = null;
                    obj['l2_id'] = null;
                    obj['l3_id'] = null;
                }
            }
            this.setState(NewState);
            if (collentName == this.props.gdName) {
                this.queryGridData(1);
            }
        }
        changeSearchCategoryL1(name: string, e: React.SyntheticEvent) {
            let input: HTMLInputElement = e.target as HTMLInputElement;
            let NewState = this.state;

            let obj = this.state.searchData;
            obj[name] = input.value;

            NewState.options_category_l2 = [];
            NewState.options_category_l3 = [];
            NewState.options_category_l1.forEach((item, i) => {
                if (item.l1_id == parseInt(input.value)) {
                    NewState.options_category_l2 = item.l2_list;
                }
            });

            obj['category_l2'] = null;//階層切換,分類搜尋條件清空
            obj['category_l3'] = null;//階層切換,分類搜尋條件清空
            $("#search-category-l2 option:first").attr("selected", "true");
            $("#search-category-l3 option:first").attr("selected", "true");
            this.setState(NewState);
            this.queryGridData(1);
        }
        changeSearchCategoryL2(name: string, e: React.SyntheticEvent) {
            let input: HTMLInputElement = e.target as HTMLInputElement;
            let NewState = this.state;

            let obj = this.state.searchData;
            obj[name] = input.value;

            NewState.options_category_l3 = [];
            NewState.options_category_l2.forEach((item, i) => {
                if (item.l2_id == parseInt(input.value)) {
                    NewState.options_category_l3 = item.l3_list;
                }
            });

            obj['category_l3'] = null;//階層切換,分類搜尋條件清空
            $("#search-category-l3 option:first").attr("selected", "true");
            this.setState(NewState);
            this.queryGridData(1);
        }
        onFieldDataL3Change(e: React.SyntheticEvent) {
            let input: HTMLInputElement = e.target as HTMLInputElement;
            let obj = this.state.fieldData;
            var select = $(':selected', e.target);//取得目前選取的option
            obj['l1_id'] = parseInt(select.attr('data-l1'));
            obj['l2_id'] = parseInt(select.attr('data-l2'));
            obj['l3_id'] = parseInt(input.value);
            this.setState({ fieldData: obj });
        }
        changeFieldCategory(name: string, e: React.SyntheticEvent) {
            let input: HTMLInputElement = e.target as HTMLInputElement;
            let NewState = this.state;

            let obj = this.state.fieldData;
            obj[name] = input.value;
            if (name == 'l1_id') {
                NewState.options_category_l1.forEach((item, i) => {
                    if (item.l1_id == parseInt(input.value)) {
                        NewState.options_category_l2 = item.l2_list;
                        if (item.l2_list.length > 0) {
                            NewState.options_category_l3 = item.l2_list[0].l3_list;
                        } else { NewState.options_category_l3 = []; }
                    }
                });
                if (NewState.options_category_l2.length > 0 &&
                    NewState.options_category_l3.length > 0) {
                    obj['l2_id'] = NewState.options_category_l2[0].l2_id;
                    obj['l3_id'] = NewState.options_category_l3[0].l3_id;
                } else {
                    obj['l2_id'] = null;
                    obj['l3_id'] = null;
                }
            } else if (name == 'l2_id') {
                NewState.options_category_l3 = [];
                NewState.options_category_l2.forEach((item, i) => {
                    if (item.l2_id == parseInt(input.value)) {
                        NewState.options_category_l3 = item.l3_list;
                    }
                });
                if (NewState.options_category_l3.length > 0) {
                    obj['l3_id'] = NewState.options_category_l3[0].l3_id;
                } else {
                    obj['l3_id'] = null;
                }
            }


            this.setState(NewState);
        }
        render() {

            var outHtml: JSX.Element = null;
            let option_l1 = this.state.options_category_l1;
            let option_l2 = this.state.options_category_l2;
            let option_l3 = this.state.options_category_l3;

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
                                            <label>標題/分類名稱</label> { }
                                            <input type="text" className="form-control"
                                                onChange={this.changeGDValue.bind(this, 'keyword') }
                                                value={searchData.keyword}
                                                placeholder="請輸入關鍵字..." /> { }
                                            <label>狀態</label> { }
                                            <select className="form-control"
                                                onChange={this.changeGDValue.bind(this, 'i_Hide') }
                                                value={searchData.i_Hide} >
                                                <option value="">全部</option>
                                                <option value="false">顯示</option>
                                                <option value="true">隱藏</option>
                                                </select> { }
                                            <br />
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
                                                onChange={this.changeSearchCategoryL2.bind(this, 'category_l2') }
                                                value={searchData.category_l2} >
                                                <option value="">全部</option>
                                                {
                                                option_l2.map((itemData, i) => <option key={i} value={itemData.l2_id}>{itemData.l2_name}</option>)
                                                }
                                                </select> { }
                                            <label>第三層分類</label> { }
                                            <select className="form-control"
                                                id="search-category-l3"
                                                onChange={this.changeGDValue.bind(this, 'category_l3') }
                                                value={searchData.category_l3} >
                                                <option value="">全部</option>
                                                {
                                                option_l3.map((itemData, i) => <option key={i} value={itemData.l3_id}>{itemData.l3_name}</option>)
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
                                        <th className="col-xs-1">第一層分類</th>
                                        <th className="col-xs-2">第二層分類</th>
                                        <th className="col-xs-2">第三層分類</th>
                                        <th className="col-xs-2">產品名稱</th>
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
                                                primKey={itemData.product_id}
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
                var Tabs = ReactBootstrap.Tabs;
                var Tab = ReactBootstrap.Tab;
                //分類-選單內容
                let options = [];
                option_l1.forEach((l1, i) => {
                    let options_l1_html = <optgroup className="text-danger" key={'l1-' + l1.l1_id} label={l1.l1_name}></optgroup>;
                    options.push(options_l1_html);
                    let options_l2_html: JSX.Element = null;
                    l1.l2_list.forEach((l2, j) => {
                        let detail = [];
                        l2.l3_list.forEach((l3, k) => {
                            let options_l3_html = < option className="text-success" key= { 'l3-' + l3.l3_id } data-l1={l1.l1_id} data-l2={l2.l2_id} value= { l3.l3_id } > {l3.l3_name }</option>;
                            detail.push(options_l3_html);
                        });
                        options_l2_html = <optgroup className="text-warning" key={'l2-' + l2.l2_id} label={l2.l2_name}>{detail}</optgroup>;
                        options.push(options_l2_html);
                    });
                });
                ////分類-選單內容
                outHtml = (
                    <div>
    <h4 className="title"> {this.props.caption} 基本資料維護</h4>
    <form className="form-horizontal" onSubmit={this.handleSubmit}>
        <div className="col-xs-6">

            <div className="form-group">
                <label className="col-xs-3 control-label">語系</label>
                <div className="col-xs-6">
                    <select className="form-control"
                        onChange={this.setLangVal.bind(this, this.props.fdName, 'i_Lang') }
                        value={fieldData.i_Lang} >
                        {
                        DT.LangData.map((itemData, i) => <option key={i} value={itemData.id}>{itemData.label}</option>)
                        }
                        </select>
                    </div>
                <small className="help-inline col-xs-3 text-danger">(必填) </small>
                </div>
            <div className="form-group">
                <label className="col-xs-3 control-label">分類</label>
                <div className="col-xs-2">
                    <select className="form-control" id="field-category-l1"
                        onChange={this.changeFieldCategory.bind(this, 'l1_id') }
                        value={fieldData.l1_id} required>
                        {
                        option_l1.map((l1, i) => <option key={'l1-' + l1.l1_id} className="text-danger" value={l1.l1_id}>{l1.l1_name}</option>)
                        }
                        </select>
                    </div>
                <div className="col-xs-3">
                    <select className="form-control" id="field-category-l2"
                        onChange={this.changeFieldCategory.bind(this, 'l2_id') }
                        value={fieldData.l2_id} required>
                        {
                        option_l2.map((l2, i) => <option key={'l2-' + l2.l2_id} className="text-success" value={l2.l2_id}>{l2.l2_name}</option>)
                        }
                        </select>
                    </div>
                <div className="col-xs-3">
                    <select className="form-control" id="field-category-l3"
                        onChange={this.changeFDValue.bind(this, 'l3_id') }
                        value={fieldData.l3_id} required>
                        {
                        option_l3.map((l3, i) => <option key={'l3-' + l3.l3_id}  value={l3.l3_id}>{l3.l3_name}</option>)
                        }
                        </select>
                    </div>
                {/*<div className="col-xs-2">
                    <select className="form-control" id="field-category"
                        onChange={this.onFieldDataL3Change.bind(this) }
                        value={fieldData.l3_id} required>
                        {options}
                        </select>
                    </div>*/}
                <small className="help-inline col-xs-1 text-danger">(必填) </small>
                </div>
            <div className="form-group">
                <label className="col-xs-3 control-label">排序</label>
                <div className="col-xs-6">
                    <input type="number" className="form-control" onChange={this.changeFDValue.bind(this, 'sort') } value={fieldData.sort}  />
                    </div>
                <small className="col-xs-3 help-inline">數字越大越前面</small>
                </div>
            <div className="form-group">
                <label className="col-xs-3 control-label">狀態</label>
                <div className="col-xs-6">
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
            <div className="form-group">
                <label className="col-xs-3 control-label">產品名稱</label>
                <div className="col-xs-6">
                    <input type="text" className="form-control" onChange={this.changeFDValue.bind(this, 'power') } value={fieldData.power} maxLength={64} required />
                    </div>
                <small className="col-xs-3 help-inline"><span className="text-danger">(必填) </span>, 最多64字</small>
                </div>
            <div className="form-group">
                <label className="col-xs-3 control-label">型號(Model) </label>
                <div className="col-xs-6">
                    <HandleProductModel product_id={this.state.fieldData.product_id} parent_edit_type={this.state.edit_type} />
                    </div>
                </div>

            </div>
        <div className="col-xs-6">
           <div className="form-group">
                <label className="col-xs-2 control-label">產品圖</label>
                <div className="col-xs-8">
                <CommCmpt.MasterImageUpload FileKind="img1" MainId={fieldData.product_id} ParentEditType={this.state.edit_type} url_upload={gb_approot + 'Active/ProductData/aj_FUpload'} url_list={gb_approot + 'Active/ProductData/aj_FList'}
                    url_delete={gb_approot + 'Active/ProductData/aj_FDelete'} />
                <small className="help-block">最多1張圖，建議尺寸 420*350 px, 每張圖最大不可超過2MB</small>
                    </div>
               </div>
           <div className="form-group">
                <label className="col-xs-2 control-label">附件檔</label>
                <div className="col-xs-8">
                <CommCmpt.MasterFileUpload FileKind="file1" MainId={fieldData.product_id} ParentEditType={this.state.edit_type} url_upload={gb_approot + 'Active/ProductData/aj_FUpload'}
                    url_list={gb_approot + 'Active/ProductData/aj_FList'} url_delete={gb_approot + 'Active/ProductData/aj_FDelete'} url_download={gb_approot + 'Active/ProductData/aj_FDown'} />
                <small className="help-block">最多1個檔案, 每個檔案最大不可超過4MB; 接受檔案類型為pdf、doc、docx、xls、xlsx、txt、png、jpg、jpeg的檔案</small>
                    </div>
               </div>
            </div>

       <div className="form-group clear bg-warning">
           <div className="col-xs-6">
               <label className="col-xs-3 control-label">證書文件</label>
               <small className="col-xs-9 help-block">每項證書最多1張圖，建議尺寸寬度不超過 1000px, 每張最大不可超過2MB</small>
               </div>

           <div className="col-xs-6">
               <HandleProductCertificate product_id={this.state.fieldData.product_id} parent_edit_type={this.state.edit_type} />
               </div>
           </div>

       <div className="alert alert-warning alert-dismissible" role="alert">
           編輯器上傳圖片或新增表格等時，請勿設定寬度及高度(將數字刪除) ，以免行動裝置顯示時會跑版。<br/>
           ps.youtube 可勾選「用自適應縮放模式」
           </div>

        <div className="col-xs-12">
            <Tabs defaultActiveKey={2} animation={false}>
                <Tab eventKey={1} title="特色(Feature)">
                    <textarea type="date" className="form-control" id="feature" name="feature" value={fieldData.feature} onChange={this.changeFDValue.bind(this, 'feature') } />
                    </Tab>
                <Tab eventKey={2} title="技術規格(Technical Specification)">
                    <textarea type="date" className="form-control" id="technical_specification" name="technical_specification" value={fieldData.technical_specification} onChange={this.changeFDValue.bind(this, 'technical_specification') } />
                    </Tab>
                </Tabs>
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
ReactDOM.render(<Product.GridForm caption={gb_caption} menuName={gb_menuname} iconClass="fa-list-alt" />, dom);