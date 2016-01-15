import $ = require('jquery');
import React = require('react');
import ReactDOM = require('react-dom');
import ReactBootstrap = require('react-bootstrap');
import Moment = require('moment');
import CommCmpt = require('comm-cmpt');
import CommFunc = require('comm-func');
import DT = require('dt');

namespace SettleAccumulate {

    interface Rows {
        check_del: boolean,
        settle_id: number;
        y: number;
        m: number;
        state: number;
        set_date: Date;
    }
    interface FormProps<T> extends BaseDefine.GridRowPropsBase<T> {

    }

    interface FormState<G, F> extends BaseDefine.GirdFormStateBase<G, F> {
        isShowModalSales?: boolean;
        ModalDataSales?: {
            search?: { keyword: string }
            isShowModalSales?: boolean;
        }
        download_src?: string;
    }
    interface FormResult extends IResultBase {
        id: number
    }

    class GridRow extends React.Component<FormProps<Rows>, BaseDefine.GridRowStateBase> {
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
                    <td>{this.props.itemData.y}</td>
                    <td>{this.props.itemData.m}</td>
                    <td>{Moment(this.props.itemData.set_date).format(DT.dateFT) }</td>
                    <td>{this.props.itemData.state == 1 ? <span className="label label-danger">結算中</span> : <span className="label label-success">結算完成</span>}</td>
                </tr>;
        }
    }
    export class GridForm extends React.Component<BaseDefine.GridFormPropsBase, FormState<Rows, server.Settle>>{

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
            this.settleCal = this.settleCal.bind(this);
            this.excelPrint = this.excelPrint.bind(this);
            this.setSettleState = this.setSettleState.bind(this);
            this.render = this.render.bind(this);

            this.state = {
                fieldData: null, gridData: { rows: [], page: 1 }, edit_type: 0,
                isShowModalSales: false
            }
        }
        static defaultProps: BaseDefine.GridFormPropsBase = {
            fdName: 'fieldData',
            gdName: 'searchData',
            apiPath: gb_approot + 'api/Settle'
        }
        refs: any;
        componentDidMount() {
            //this.queryGridData(1);
            this.updateType(7);
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
                .done(function (data, textStatus, jqXHRdata) {
                    this.setState({ gridData: data });
                }.bind(this))
                .fail(function (jqXHR, textStatus, errorThrown) {
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
        deleteSubmit() {

            if (!confirm('確定是否刪除?')) {
                return;
            }

            var ids = [];
            for (var i in this.state.gridData.rows) {
                if (this.state.gridData.rows[i].check_del) {
                    ids.push('ids=' + this.state.gridData.rows[i].settle_id);
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

        settleCal(e: React.SyntheticEvent) {
            CommFunc.jqPost(gb_approot + 'api/GetAction/SettleCal', { y: this.state.fieldData.y, m: this.state.fieldData.m })
                .done((data: FormResult, textStatus, jqXHRdata) => {
                    if (data.result) {
                        //let obj = React.findDOMNode(this.refs['detail']) as HTMLDivElement & { loadDetail: () => void };
                        //obj.loadDetail();
                        this.refs.detail.loadDetail();
                        CommFunc.tosMessage(null, '計算完成', 1);
                    } else {
                        alert(data.message);
                    }
                })
                .fail((jqXHR, textStatus, errorThrown) => {
                    CommFunc.showAjaxError(errorThrown);
                });

        }
        setSettleState(e: React.SyntheticEvent) {
            if (!confirm('是否確認此次結算?確認後將無法變更結算結果!')) {
                return;
            }
            CommFunc.jqGet(gb_approot + 'api/GetAction/setSettleState', { id: this.state.fieldData.settle_id })
                .done((data: FormResult, textStatus, jqXHRdata) => {
                    if (data.result) {
                        this.refs.detail.loadDetail();
                        let obj = this.state.fieldData;
                        obj.state = SettleState.complete;
                        this.setState({ fieldData: obj });
                        CommFunc.tosMessage(null, '完成結算確認!', 1);
                    } else {
                        alert(data.message);
                    }
                })
                .fail((jqXHR, textStatus, errorThrown) => {
                    CommFunc.showAjaxError(errorThrown);
                });
        }
        excelPrint(e: React.SyntheticEvent) {
            e.preventDefault();

            var print_url = gb_approot + 'Base/ExcelReport/downloadExcel_SalesRankData?';

            this.setState({ download_src: print_url });
            return;
        }
        render() {
            var outHtml: JSX.Element = null;

            if (this.state.edit_type == 0) {
                var searchData = this.state.searchData;
                outHtml =
                    (
                        <div>
    <ul className="breadcrumb">
        <li><i className="fa-list-alt"></i> {this.props.menuName}</li>
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
                            <label>使用者名稱</label> { }
                            <input type="text" className="form-control"
                                onChange={this.changeGDValue.bind(this, 'UserName') }
                                placeholder="請輸入關鍵字..." /> { }
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
                        <th className="col-xs-3">年</th>
                        <th className="col-xs-3">月</th>
                        <th className="col-xs-3">結算日期</th>
                        <th className="col-xs-2">狀態</th>
                        </tr>
                    </thead>
                <tbody>
                    {
                    this.state.gridData.rows.map(
                        (itemData, i) =>
                            <GridRow key={i}
                                ikey={i}
                                primKey={itemData.settle_id}
                                itemData={itemData}
                                delCheck={this.delCheck}
                                updateType={this.updateType} />
                    )
                    }
                    </tbody>
                </table>
            </div>
        <CommCmpt.GridNavPage startCount={this.state.gridData.startcount}
            endCount={this.state.gridData.endcount}
            recordCount={this.state.gridData.records}
            totalPage={this.state.gridData.total}
            nowPage={this.state.gridData.page}
            onQueryGridData={this.queryGridData}
            InsertType={this.insertType}
            deleteSubmit={this.deleteSubmit} />
        </form>
                            </div>
                    );
            }
            else if (this.state.edit_type == 1 || this.state.edit_type == 2) {
                let fieldData = this.state.fieldData;
                let buttonHtml: JSX.Element = null;
                if (this.state.edit_type == 1) {
                    buttonHtml = (
                        <div className="col-xs-12">
                            <div className="form-action">
                                <div className="col-xs-10 col-xs-offset-2">
                                    <button type="submit" className="btn-primary"><i className="fa-check"></i> 儲存 { }<CommCmpt.Tips comment="請確定結算年、月後按下儲存在開始結算獎金" /></button> { }
                                    <button type="button" onClick={this.noneType}><i className="fa-times"></i> 回前頁</button>
                                    </div>
                                </div>
                            </div>
                    );
                } else if (this.state.edit_type == 2) {
                    if (this.state.fieldData.state == SettleState.complete) {
                        buttonHtml = (
                            <div className="col-xs-12">
                            <div className="form-action">
                                <div className="col-xs-10 col-xs-offset-2">
                                    <button type="button" onClick={this.noneType}><i className="fa-times"></i> 回前頁</button>
                                    </div>
                                </div>
                                </div>
                        );
                    } else {
                        buttonHtml = (
                            <div className="col-xs-12">
                            <div className="form-action">
                                <div className="col-xs-10 col-xs-offset-2">
                                    <button type="button" className="btn-primary"
                                        onClick={this.settleCal.bind(this) }><i className="fa-check"></i> 結算</button> { }

                                    <button type="button" className="btn-danger" onClick={this.setSettleState.bind(this) }>
                                        <i className="fa-check"></i> 確認本次結算
                                        </button> { }
                                    <button type="button" onClick={this.noneType}><i className="fa-times"></i> 回前頁</button>
                                    </div>
                                </div>
                                </div>
                        );
                    }
                }

                outHtml = (
                    <div>
    <ul className="breadcrumb">
        <li><i className="fa-list-alt"></i> {this.props.menuName}</li>
        </ul>
    <h4 className="title"> { this.props.caption }</h4>
    <form className="form-horizontal" onSubmit={this.handleSubmit}>
        <div className="col-xs-12">
            <div className="alert alert-warning">
                <p><strong className="text-danger">紅色標題</strong> 為必填欄位。</p>
                </div>
            </div>
        <div className="col-xs-6">
            <div className="form-group">
                <label className="col-xs-2 control-label text-danger">年</label>
                <div className="col-xs-10">
                        <input type="text"
                            className="form-control"
                            onChange={this.changeFDValue.bind(this, 'y') }
                            value={fieldData.y}
                            maxLength={4}
                            required
                            disabled={this.state.edit_type == 2}/>
                    </div>
                </div>
            </div>
        <div className="col-xs-6">
            <div className="form-group">
                <label className="col-xs-2 control-label text-danger">月</label>
                <div className="col-xs-10">
                    <input type="number"
                        className="form-control"
                        onChange={this.changeFDValue.bind(this, 'm') }
                        value={fieldData.m}
                        maxLength={2}
                        required
                        disabled={this.state.edit_type == 2}/>
                    </div>
                </div>
            </div>

            {/*buttonHtml*/}
        </form>
    <Detail MasterId={this.state.fieldData.settle_id} ref="detail" />
                        <iframe src={this.state.download_src} style={ { visibility: 'hidden', display: 'none' } } />
                        </div>
                );
            }

            return outHtml;
        }
    }

    interface DetailProps {
        ref: string;
        MasterId: number;
        apiPath?: string;
        items?: Array<server.SettleDetail>;
    }
    interface DetailState {
        details?: widegt.GridInfoT<server.SettleDetail>;
        SearchDetailData?: {
            settle_id?: number;
            page?: number;
            keyword?: string;
        }
    }

    class Detail extends React.Component<DetailProps, DetailState>{
        constructor() {
            super();
            this.componentDidMount = this.componentDidMount.bind(this);
            this.LeftGridPrev = this.LeftGridPrev.bind(this);
            this.LeftGridNext = this.LeftGridNext.bind(this);
            this.changeGDValue = this.changeGDValue.bind(this);
            this.changeBValue = this.changeBValue.bind(this);
            this.setBValue = this.setBValue.bind(this);
            this.render = this.render.bind(this);
            this.state = {
                details: { rows: [], page: 0, startcount: 0, endcount: 0, records: 0, total: 0 },
                SearchDetailData: { settle_id: 0, page: null, keyword: null }
            }
        }
        static defaultProps: DetailProps = {
            ref: 'detail',
            MasterId: 0,
            items: [],
            apiPath: gb_approot + 'api/SettleDetail'
        }

        componentDidMount() {
            this.loadDetail();
        }

        loadDetail(page?: number) {
            var SearchDetailData = this.state.SearchDetailData;
            SearchDetailData.settle_id = this.props.MasterId;
            if (page != null && page != undefined)
                SearchDetailData.page = page;

            CommFunc.jqGet(this.props.apiPath, this.state.SearchDetailData)
                .done((data: widegt.GridInfoT<server.SettleDetail>, textStatus, jqXHRdata) => {
                    let obj = this.state.details;
                    this.setState({ details: data });
                })
                .fail((jqXHR, textStatus, errorThrown) => {
                    CommFunc.showAjaxError(errorThrown);
                });
        }
        changeGDValue(name: string, e: React.SyntheticEvent) {
            let input: HTMLInputElement = e.target as HTMLInputElement;
            let obj = this.state.SearchDetailData;

            if (input.value == 'true') {
                obj[name] = true;
            } else if (input.value == 'false') {
                obj[name] = false;
            } else {
                obj[name] = input.value;
            }
            this.setState({ SearchDetailData: obj });
            this.loadDetail();
        }
        changeBValue(id: number, key: number, e: React.SyntheticEvent) {
            let input: HTMLInputElement = e.target as HTMLInputElement;
            let obj = this.state.details;

            obj.rows[key].b = +input.value;
            this.setState({ details: obj });
        }
        setBValue(id: number, e: React.SyntheticEvent) {
            let input: HTMLInputElement = e.target as HTMLInputElement;
            //console.log(id, +input.value);

            CommFunc.jqGet(gb_approot + 'api/GetAction/setSettleDetailBVal', { id: id, b: +input.value})
                .done((data, textStatus, jqXHRdata) => {
                })
                .fail((jqXHR, textStatus, errorThrown) => {
                    CommFunc.showAjaxError(errorThrown);
                });
        }
        LeftGridPrev() {
            if (this.state.details.page > 1) {
                this.state.details.page--;
                this.loadDetail(this.state.details.page);
            }
        }
        LeftGridNext() {
            if (this.state.details.page < this.state.details.total) {
                this.state.details.page++;
                this.loadDetail(this.state.details.page);
            }
        }
        render() {
            let StateForGird = CommCmpt.StateForGird;

            return <div className="row">
    <div className="col-xs-12">
        <table className="table-condensed">
            <caption>
               <div className="col-xs-12">
                   <div className="form-group">
                       <label className="col-xs-2 control-label">獎金結算明細</label>
                       <div className="col-xs-3">
                           <input type="text" className="form-control"
                               value={this.state.SearchDetailData.keyword}
                               onChange={this.changeGDValue.bind(this, 'keyword') }
                               placeholder="請輸入會員編號或姓名..." /> { }
                           </div>
                       </div>
                   </div>
                </caption>
            <tbody>
                <tr>
                    <th className="col-xs-1">會員編號{ }</th>
                    <th className="col-xs-2">姓名</th>
                    <th className="col-xs-2">級別</th>
                    <th className="col-xs-1">KV<CommCmpt.Tips comment="個人KV值總計"/></th>
                    <th className="col-xs-1">KV/T<CommCmpt.Tips comment="個人經營其下共享圈KV值總計(不含個人KV值)" /></th>
                    <th className="col-xs-1">回饋獎金</th>
                    <th className="col-xs-1">累積回饋<br />獎金</th>
                    <th className="col-xs-1">經營獎金</th>
                    <th className="col-xs-1">營運紅利<CommCmpt.Tips comment="需達30經理人在線" /></th>
                    <th className="col-xs-1">管理紅利<CommCmpt.Tips comment="需達30經理人在線" /></th>
                    </tr>
                    {
                    this.state.details.rows.map((detail, i) => {

                        var out_html = <tr key={detail.settle_detail_id}>
                                    <td>{detail.sales_no}</td>
                                    <td>{detail.sales_name}</td>
                                    <td><StateForGird id={detail.rank} stateData={DT.SalesRankType} /></td>
                                    <td>{detail.kv_p_sum}</td>
                                    <td>{detail.kv_g_sum}</td>
                                    <td>{detail.a}</td>
                                    <td>
                                        <input type="number" className="form-control"
                                            value={detail.b}
                                            onChange={this.changeBValue.bind(this, detail.settle_detail_id, i) }
                                            onBlur={this.setBValue.bind(this, detail.settle_detail_id) }/>
                                        </td>
                                    <td>{detail.bound}</td>
                                    <td>{detail.center_bonus}</td>
                                    <td>{detail.office_bonus}</td>
                            </tr>;

                        return out_html;

                    })
                    }
                </tbody>
            </table>
            <div className="form-inline text-center">
                <ul className="pager list-inline list-unstyled">
                   <li><a href="#" onClick={this.LeftGridPrev}><i className="glyphicon glyphicon-arrow-left"></i> 上一頁</a></li>
                   <li>{this.state.details.page + '/' + this.state.details.total }</li>
                   <li><a href="#" onClick={this.LeftGridNext}>下一頁 <i className="glyphicon glyphicon-arrow-right"></i></a></li>
                    </ul>
                </div>
        </div>
                </div>;
        }
    }
}

var dom = document.getElementById('page_content');
ReactDOM.render(<SettleAccumulate.GridForm caption={gb_caption} menuName={gb_menuname} iconClass="fa-list-alt" />, dom);