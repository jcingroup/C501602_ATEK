import $ = require('jquery');
import React = require('react');
import ReactDOM = require('react-dom');
import Moment = require('moment');
import ReactBootstrap = require("react-bootstrap");
import CommCmpt = require('comm-cmpt');
import CommFunc = require('comm-func');
import DT = require('dt');

namespace AllCategory {
    interface Rows {
        all_category_l1_id?: number;
        check_del?: boolean,
        l1_name?: string;
        memo?: string;
        sort?: number;
        i_Hide?: boolean;
        i_Lang: string;
        check_sub?: boolean;
    }
    interface L1RowsProps<R> {
        key?: number,
        ikey: number,
        itemData: R,
        chd?: boolean,
        subCheck(p1: number, p2: boolean): void,
        primKey: number | string,
        i_Lang: string
    }
    interface FormState<G, F> extends BaseDefine.GirdFormStateBase<G, F> {
        searchData?: {
            main_id: number,
            i_Lang: string
        }
    }
    interface FormResult extends IResultBase {
        id: string
    }
    //(展開/合起)子分類項目 按鈕
    class GridSubButton extends React.Component<{ iKey: number, chd: boolean, subCheck(ikey: number, chd: boolean): void }, { subHtml: string }> {
        constructor() {
            super();
            this.componentWillReceiveProps = this.componentWillReceiveProps.bind(this);
            this.onClick = this.onClick.bind(this);
            this.state = {
                subHtml: 'fa-minus'//預設為展開
            }
        }
        componentWillReceiveProps(nextProps) {
            //當元件收到新的 props 時被執行，這個方法在初始化時並不會被執行。使用的時機是在我們使用 setState() 並且呼叫 render() 之前您可以比對 props，舊的值在 this.props，而新值就從 nextProps 來。
            if (nextProps.chd) {
                this.setState({ subHtml: 'fa-minus' });//展開
            } else {
                this.setState({ subHtml: 'fa-plus' });//合起
            }
        }
        onClick() {
            this.props.subCheck(this.props.iKey, this.props.chd);
            this.props.chd = !this.props.chd;
            if (this.props.chd) {
                this.setState({ subHtml: 'fa-minus' });//展開
            } else {
                this.setState({ subHtml: 'fa-plus' });//合起
            }
        }
        render() {
            return <button type="button" className="btn-link btn-lg" onClick={this.onClick}><i className={this.state.subHtml}></i></button>;
        }
    }
    //L1 主表單list
    class GridRow extends React.Component<L1RowsProps<Rows>, BaseDefine.GridRowStateBase> {
        constructor() {
            super();
            this.subCheck = this.subCheck.bind(this);
        }
        static defaultProps = {
            fdName: 'fieldData',
            gdName: 'searchData',
            apiPathName: gb_approot + 'api/AllCategoryL1'
        }
        subCheck(i, chd) {
            this.props.subCheck(i, chd);
        }
        render() {
            let subHtml: JSX.Element = null;
            if (this.props.itemData.check_sub) {
                subHtml = <GridSubForm ref="GridSubForm" MainId={this.props.primKey} i_Lang={this.props.i_Lang}/>;
            }
            return <tbody>
                        <tr>
                        <td className="text-center"><GridSubButton iKey={this.props.ikey} chd={this.props.itemData.check_sub} subCheck={this.subCheck.bind(this) } /></td>
                        <td>{this.props.itemData.l1_name}</td>
                        <td>{this.props.itemData.memo }</td>
                            </tr>
                       {subHtml}{/*裡面放 子表單(GridSubForm)點展開才顯示--(底層)-->子表單內容(GridSubRow)*/}
                </tbody>;
        }
    }
    //L1主表單
    export class GridForm extends React.Component<BaseDefine.GridFormPropsBase, FormState<Rows, server.All_Category_L1>>{

        constructor() {

            super();
            this.queryGridData = this.queryGridData.bind(this);
            this.deleteSubmit = this.deleteSubmit.bind(this);
            this.subCheck = this.subCheck.bind(this);
            this.componentDidMount = this.componentDidMount.bind(this);
            this.insertType = this.insertType.bind(this);
            this.handleSearch = this.handleSearch.bind(this);
            this.render = this.render.bind(this);


            this.state = {
                fieldData: {},
                gridData: { rows: [], page: 1 },
                edit_type: 0,
                searchData: { main_id: gb_MainId, i_Lang: 'en-US' }
            }
        }
        static defaultProps: BaseDefine.GridFormPropsBase = {
            fdName: 'fieldData',
            gdName: 'searchData',
            apiPath: gb_approot + 'api/AllCategoryL1'
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
                .done((data, textStatus, jqXHRdata) => {
                    this.setState({ gridData: data });
                })
                .fail((jqXHR, textStatus, errorThrown) => {
                    CommFunc.showAjaxError(errorThrown);
                });
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
                    ids.push('ids=' + this.state.gridData.rows[i].all_category_l1_id);
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
        subCheck(i: number, chd: boolean) {
            let newState = this.state;
            this.state.gridData.rows[i].check_sub = !chd;
            this.setState(newState);
        }
        insertType() {
            this.setState({ edit_type: 1, fieldData: { i_Hide: false, sort: 0, i_Lang: 'en-US' } });
        }
        changeLangVal(e: React.SyntheticEvent) {
            let input: HTMLInputElement = e.target as HTMLInputElement;
            let obj = this.state.searchData;
            let gridData = this.state.gridData;
            obj.i_Lang = input.value;

            //gridData.rows.forEach((itemData, i) => itemData.check_sub = true);

            this.setState({ searchData: obj, gridData: gridData });
        }
        render() {

            var outHtml: JSX.Element = null;

            let searchData = this.state.searchData;
            let GridNavPage = CommCmpt.GridNavPage;

            outHtml =
                (
                    <div>
                    <h3 className="title clearfix">
                        <span className="pull-left">{this.props.caption}</span>
                        <div className="form-inline pull-left col-xs-offset-1">
                            <label><small>選擇語系：</small></label>
                            <select className="form-control"
                                value={searchData.i_Lang}
                                onChange={this.changeLangVal.bind(this) }
                                >
                                {
                                DT.LangData.map(function (itemData, i) {
                                    return <option key={itemData.id} value={itemData.id}>{itemData.label}</option>;
                                })
                                }
                                </select>
                            </div>
                        </h3>
                    <div className="alert alert-warning clear" role="alert">
                        <p>點選 <i className="fa-bars"></i> 並拖曳，可修改排列順序。</p>
                        </div>
                    <form onSubmit={this.handleSearch}>
                        <div className="table-responsive">
                            <table>
                                <thead>
                                    <tr>
                                        <th className="col-xs-1 text-center">展開/收合</th>
                                        <th className="col-xs-5">項目</th>
                                        <th className="col-xs-6">說明</th>
                                        </tr>
                                    </thead>
                                    {
                                    this.state.gridData.rows.map(
                                        (itemData, i) =>
                                            <GridRow
                                                key={i}
                                                ikey={i}
                                                primKey={itemData.all_category_l1_id}
                                                i_Lang={searchData.i_Lang}
                                                itemData={itemData}
                                                subCheck={this.subCheck}/>
                                    )
                                    }
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
                        showAdd={false}
                        showDelete={false}
                        />
                        </form>
                        </div>
                );

            return outHtml;
        }
    }


    interface SubRows {
        all_category_l2_id: number;
        all_category_l1_id?: number;
        check_del?: boolean,
        l2_name?: string;
        memo?: string;
        sort?: number;
        i_Hide?: boolean;
        i_Lang: string;
    }
    interface SubFormState<G, F> extends BaseDefine.GirdFormStateBase<G, F> {
        isShowSubEdit?: boolean,
        placeholder?: any;
        dragged?: any;
        over_id?: number;
        nodePlacement?: string;
        draggedClientY?: number;//一開始元件拖動起始位置
    }
    interface GridSubFormProps {
        ref: any;
        MainId: number | string;
        i_Lang: string;
        apiSubPathName?: string;
        apiUpdateSortPath?: string;
        fdName?: string;
        gdName?: string;
    }
    interface GridSubRowProps<R> extends BaseDefine.GridRowPropsBase<R> {
        DragEnd(e: any): void,
        DragStart(e: any): void
    }
    // L2子表單List
    class GridSubRow extends React.Component<GridSubRowProps<SubRows>, BaseDefine.GridRowStateBase> {
        constructor() {
            super();
            this.delCheck = this.delCheck.bind(this);
            this.modify = this.modify.bind(this);
        }
        delCheck(i, chd) {
            this.props.delCheck(i, chd);
        }
        modify() {
            this.props.updateType(this.props.primKey)
        }
        render() {
            let StateForGird = CommCmpt.StateForGird;
            return <tr data-id={this.props.ikey} id={"Sort-" + this.props.itemData.all_category_l1_id + "-" + this.props.ikey}
                onDragEnd={this.props.DragEnd.bind(this) }
                onDragStart={this.props.DragStart.bind(this) }>
                       <td className="text-center col-xs-1"
                           data-id={this.props.ikey}
                           ><i className="fa-bars text-muted draggable" data-id={this.props.ikey}></i></td>
                       <td className="text-center col-xs-1"><CommCmpt.GridCheckDel iKey={this.props.ikey} chd={this.props.itemData.check_del} delCheck={this.delCheck} /></td>
                       <td className="text-center col-xs-1"><CommCmpt.GridButtonModify modify={this.modify} /></td>
                       <td className="col-xs-3">{this.props.itemData.l2_name}</td>
                       <td className="col-xs-2">{this.props.itemData.sort }</td>
                       <td className="col-xs-2">{this.props.itemData.i_Hide ? <span className="label label-default">隱藏</span> : <span className="label label-primary">顯示</span>}</td>
                       <td className="col-xs-2"><StateForGird id={this.props.itemData.i_Lang} stateData={DT.LangData} /></td>
                </tr>;

        }
    }
    //L2子表單
    export class GridSubForm extends React.Component<GridSubFormProps, SubFormState<SubRows, server.All_Category_L2>>{

        constructor() {

            super();
            this.updateType = this.updateType.bind(this);
            this.queryGridData = this.queryGridData.bind(this);
            this.handleSubmit = this.handleSubmit.bind(this);
            this.deleteSubmit = this.deleteSubmit.bind(this);
            this.delCheck = this.delCheck.bind(this);
            this.checkAll = this.checkAll.bind(this);
            this.componentDidMount = this.componentDidMount.bind(this);
            this.insertType = this.insertType.bind(this);
            this.changeFDValue = this.changeFDValue.bind(this);
            this.setInputValue = this.setInputValue.bind(this);
            this.handleSearch = this.handleSearch.bind(this);
            this.closeSubEdit = this.closeSubEdit.bind(this);

            this.dragStart = this.dragStart.bind(this);
            this.dragEnd = this.dragEnd.bind(this);
            this.dragOver = this.dragOver.bind(this);
            this.updateSort = this.updateSort.bind(this);

            this.render = this.render.bind(this);


            this.state = {
                fieldData: {},
                gridData: { rows: [], page: 1 },
                edit_type: 0,
                isShowSubEdit: false
            }
        }
        static defaultProps = {
            fdName: 'fieldData',
            gdName: 'searchData',
            apiSubPathName: gb_approot + 'api/AllCategoryL2',
            apiUpdateSortPath: gb_approot + 'api/GetAction/updateCategorySort'
        }
        componentDidMount() {
            this.queryGridData(1);
            let placeholder = this.state.placeholder;
            placeholder = document.createElement("tr");
            placeholder.className = "placeholder";
            let td = document.createElement("td");
            td.setAttribute("colSpan", "7");
            placeholder.appendChild(td);

            this.setState({ placeholder: placeholder });
        }
        componentWillReceiveProps(nextProps: GridSubFormProps) {
            this.queryGridData(0, nextProps.MainId, nextProps.i_Lang);//語系有改變就重新讀取gridData
        }
        gridData(page: number, main_id?: number | string, Lang?: string) {
            if (main_id != undefined && Lang != undefined) {
                var parms = {
                    page: 0,
                    main_id: main_id,
                    i_Lang: Lang
                };
            } else {
                var parms = {
                    page: 0,
                    main_id: this.props.MainId,
                    i_Lang: this.props.i_Lang
                };
            }

            if (page == 0) {
                parms.page = this.state.gridData.page;
            } else {
                parms.page = page;
            }
            return CommFunc.jqGet(this.props.apiSubPathName, parms);
        }
        queryGridData(page: number, main_id?: number | string, Lang?: string) {
            this.gridData(page, main_id, Lang)
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
                CommFunc.jqPost(this.props.apiSubPathName, this.state.fieldData)
                    .done((data: FormResult, textStatus, jqXHRdata) => {
                        if (data.result) {
                            CommFunc.tosMessage(null, '新增完成', 1);
                            //this.updateType(data.id);
                            this.queryGridData(0);
                            this.setState({ isShowSubEdit: false });
                        } else {
                            alert(data.message);
                        }
                    })
                    .fail((jqXHR, textStatus, errorThrown) => {
                        CommFunc.showAjaxError(errorThrown);
                    });
            }
            else if (this.state.edit_type == 2) {
                CommFunc.jqPut(this.props.apiSubPathName, this.state.fieldData)
                    .done((data, textStatus, jqXHRdata) => {
                        if (data.result) {
                            CommFunc.tosMessage(null, '修改完成', 1);
                            this.queryGridData(0);
                            this.setState({ isShowSubEdit: false });
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
                    ids.push('ids=' + this.state.gridData.rows[i].all_category_l2_id);
                }
            }

            if (ids.length == 0) {
                CommFunc.tosMessage(null, '未選擇刪除項', 2);
                return;
            }

            CommFunc.jqDelete(this.props.apiSubPathName + '?' + ids.join('&'), {})
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
                    i_Hide: false,
                    sort: 0,
                    i_Lang: this.props.i_Lang,
                    all_category_l1_id: this.props.MainId
                }, isShowSubEdit: true
            });
        }
        updateType(id: number | string) {
            CommFunc.jqGet(this.props.apiSubPathName, { id: id })
                .done((data, textStatus, jqXHRdata) => {
                    this.setState({ edit_type: 2, fieldData: data.data, isShowSubEdit: true });
                })
                .fail((jqXHR, textStatus, errorThrown) => {
                    CommFunc.showAjaxError(errorThrown);
                });
        }
        changeFDValue(name: string, e: React.SyntheticEvent) {
            this.setInputValue(this.props.fdName, name, e);
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
        closeSubEdit() {
            this.setState({ isShowSubEdit: false });
        }
        dragStart(e) {
            this.state.dragged = e.currentTarget;
            //先抓一開始拖動物件的絕對位置,後面再依拖動的滑鼠做座標比較要插入在before還是after
            this.state.draggedClientY = e.clientY;
            e.dataTransfer.effectAllowed = 'move';
            // Firefox requires calling dataTransfer.setData
            // for the drag to properly work
            e.dataTransfer.setData("text/html", e.currentTarget);
        }
        dragEnd(e) {
            $("#Sort-" + Number(this.state.dragged.dataset.id)).show();
            this.state.dragged.parentNode.removeChild(this.state.placeholder);

            // Update state
            var data = this.state.gridData;
            var from = Number(this.state.dragged.dataset.id);
            var to = this.state.over_id;
            if (from < to) to--;
            if (this.state.nodePlacement == "after") to++;
            data.rows.splice(to, 0, data.rows.splice(from, 1)[0]);

            let updateSort: server.CategroySort[] = [];
            data.rows.forEach((item, i) => {
                item.sort = data.rows.length - i;
                let obj: server.CategroySort = { id: item.all_category_l2_id, sort: item.sort };
                updateSort.push(obj);
            });//變更排序內容
            this.setState({ gridData: data });
            this.updateSort(updateSort);
        }
        dragOver(e) {
            e.preventDefault();
            let newState = this.state;
            $("#Sort-" + Number(this.state.dragged.dataset.id)).hide();
            if (e.target.className == "placeholder") return;

            if (e.target.dataset.id != undefined) {//只能插入有data-id屬性的tr間格中
                var relY = e.clientY - this.state.draggedClientY;
                var height = e.target.offsetHeight / 2;
                newState.over_id = Number(e.target.dataset.id);
                this.setState(newState);
                //因為<tr>點不到,所以只好用<td>放data-id值,所以插入的元素要直接抓id
                if (relY > height) {
                    this.state.nodePlacement = "after";
                    $(this.state.placeholder).insertAfter("#Sort-" + this.props.MainId + "-" + newState.over_id);
                }
                else if (relY < height) {
                    this.state.nodePlacement = "before"
                    $(this.state.placeholder).insertBefore("#Sort-" + this.props.MainId + "-" + newState.over_id);
                }
            }
        }
        updateSort(SortData: server.CategroySort[]) {
            CommFunc.jqPost(this.props.apiUpdateSortPath, { SortData: SortData })
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
        }
        render() {

            var outHtml: JSX.Element = null;
            let GridNavPage = CommCmpt.GridNavPage;
            let ModalSubEdit = ReactBootstrap.Modal;
            let fieldData = this.state.fieldData;

            outHtml =
                (
                    <tr className="sub-grid">
                    <td className="fold">
                        <div className="row">
                            <div className="col-xs-6 col-xs-offset-6 text-center">
                                <i className="fa-chevron-right"></i>
                                </div>
                            </div>
                        </td>
                    <td colSpan={3}>
                        <div className="row">
                            <div className="col-xs-10">
                                <table>
                                    <thead>
                                        <tr>
                                            <th className="col-xs-1"></th>
                                            <th className="col-xs-1 text-center">
                                                <label className="cbox">
                                                    <input type="checkbox" checked={this.state.checkAll} onChange={this.checkAll} />
                                                    <i className="fa-check"></i>
                                                    </label>
                                                </th>
                                            <th className="col-xs-1 text-center">修改</th>
                                            <th className="col-xs-3">項目</th>
                                            <th className="col-xs-2">排序</th>
                                            <th className="col-xs-2">狀態</th>
                                            <th className="col-xs-2">語系</th>
                                            </tr>
                                        </thead>
                                    <tbody ref="SortTbody" onDragOver={this.dragOver.bind(this) }>
                                            {
                                            this.state.gridData.rows.map(
                                                (itemData, i) =>
                                                    <GridSubRow key={i}
                                                        ikey={i}
                                                        primKey={itemData.all_category_l2_id}
                                                        itemData={itemData}
                                                        delCheck={this.delCheck}
                                                        updateType={this.updateType}
                                                        DragEnd={this.dragEnd }
                                                        DragStart={this.dragStart }/>
                                            )
                                            }
                                        </tbody>
                                    </table>
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
                                {/*---子分類編輯視窗start---*/}
                                 <ModalSubEdit show={this.state.isShowSubEdit} onHide={this.closeSubEdit}>
                                    <div className="modal-header light">
                                    <div className="pull-right">
                                        <button onClick={this.closeSubEdit} type="button"><i className="fa-times"></i></button>
                                        </div>
                                    <h4 className="modal-title">分類項目 { } 編輯</h4>
                                        </div>
                                    <form className="form-horizontal"  onSubmit={this.handleSubmit} id="form2">
                                        <div className="modal-body">

                                            <div className="alert alert-warning"><p>以下皆為 <strong className="text-danger">必填項目</strong> 。</p></div>
                                            <div className="form-group">
                                            <label className="col-xs-2 control-label">分類名稱</label>
                                            <div className="col-xs-6">
                                                <input type="text"
                                                    className="form-control"
                                                    value={fieldData.l2_name}
                                                    onChange={this.changeFDValue.bind(this, 'l2_name') }
                                                    maxLength={64}
                                                    required />
                                                </div>
                                            <small className="col-xs-4 help-inline">最多64字</small>
                                                </div>
                                            {/*<div className="form-group">
                                                <label className="col-xs-2 control-label">選擇語系</label>
                                                <div className="col-xs-8">
                                                    <select className="form-control"
                                                        onChange={this.changeFDValue.bind(this, 'i_Lang') }
                                                        value={fieldData.i_Lang} >
                                                        {
                                                        DT.LangData.map((itemData, i) => <option key={i} value={itemData.id}>{itemData.label}</option>)
                                                        }
                                                        </select>
                                                    </div>
                                                </div>*/}
                                            <div className="form-group">
                                            <label className="col-xs-2 control-label">排序</label>
                                            <div className="col-xs-6">
                                                <input type="number"
                                                    className="form-control"
                                                    value={fieldData.sort}
                                                    onChange={this.changeFDValue.bind(this, 'sort') }
                                                    maxLength={64}
                                                    required />
                                                </div>
                                            <small className="col-xs-4 help-inline">數字越大越前面</small>
                                                </div>
                                            <div className="form-group">
                                                <label className="col-xs-2 control-label">狀態</label>
                                                <div className="col-xs-3">
                                                    <div className="radio-inline">
                                                        <label>
                                                            <input 	type="radio"
                                                                name="i_Hide"
                                                                value={true}
                                                                checked={fieldData.i_Hide === true}
                                                                onChange={this.changeFDValue.bind(this, 'i_Hide') } />
                                                            <span>隱藏</span>
                                                            </label>
                                                        </div>
                                                    <div className="radio-inline">
                                                        <label>
                                                            <input type="radio"
                                                                name="i_Hide"
                                                                value={false}
                                                                checked={fieldData.i_Hide === false}
                                                                onChange={this.changeFDValue.bind(this, 'i_Hide') }/>
                                                            <span>顯示</span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>


                                            </div>
                                        <div className="modal-footer">
                                            <button  type="submit" form="form2" className="btn-primary"><i className="fa-check"></i> 儲存</button>
                                                    <button className="col-xs-offset-1" type="button" onClick={this.closeSubEdit}><i className="fa-times"></i>關閉</button>
                                            </div>
                                        </form>
                                     </ModalSubEdit>
                                {/*---子分類編輯視窗end---*/}
                                </div >
                            </div >
                        </td >
                        </tr >
                );

            return outHtml;
        }
    }
}

var dom = document.getElementById('page_content');
ReactDOM.render(<AllCategory.GridForm caption={gb_caption} menuName={gb_menuname} iconClass="fa-list-alt" />, dom);