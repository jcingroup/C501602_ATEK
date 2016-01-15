import $ = require('jquery');
import React = require('react');
import ReactDOM = require('react-dom');
import ReactBootstrap = require('react-bootstrap');
import Moment = require('moment');
import CommCmpt = require('comm-cmpt');
import CommFunc = require('comm-func');
import DT = require('dt');

namespace SettleSelf {
    interface ParamData {
        kv_total?: number;
        share_kv_total?: number;
        recommend_kv_total?: number;
        AllLine_kv_total?: number;
        recommend_center_kv_total?: number;
        count_manager?: number;
        self_bonus?: number;
        manager_bonus?: number;
        center_bonus?: number;
        office_bonus?: number;
        b?: number;
    }
    export class GridForm extends React.Component<any, { param?: ParamData }>{


        constructor() {

            super();
            this.queryInitData = this.queryInitData.bind(this);
            this.componentDidMount = this.componentDidMount.bind(this);
            this.setInputValue = this.setInputValue.bind(this);
            this.render = this.render.bind(this);
            this.state = {
                param: {
                    kv_total: 0,
                    share_kv_total: 0,
                    recommend_kv_total: 0,
                    AllLine_kv_total: 0,
                    recommend_center_kv_total:0,
                    count_manager: 0,
                    self_bonus: 0,
                    manager_bonus: 0,
                    center_bonus: 0,
                    office_bonus: 0,
                    b:0
                }
            }
        }
        static defaultProps = {
            apiInitPath: gb_approot + 'api/GetAction/GetSalesSelfBonus'
        }
        componentDidMount() {
            this.queryInitData();
        }
        queryInitData() {

            CommFunc.jqGet(this.props.apiInitPath, { y: Moment().format('YYYY'), m: Moment().format('MM') })
                .done((data, textStatus, jqXHRdata) => {
                    console.log(data);
                    this.setState({ param: data });
                })
                .fail((jqXHR, textStatus, errorThrown) => {
                    CommFunc.showAjaxError(errorThrown);
                });
        }
        setInputValue(name: string, e: React.SyntheticEvent) {
            let input: HTMLInputElement = e.target as HTMLInputElement;
            let obj = this.state.param;
            obj[name] = input.value;
            this.setState({ param: obj });
        }
        render() {

            var outHtml: JSX.Element = null;

            let param = this.state.param;
            let errorSelfHtml: JSX.Element = null;
            let errorCenterHtml: JSX.Element = null;
            if (param.kv_total < 1000) {
                errorSelfHtml = <p>因{Moment().format('MM') }月個人消費<strong className="text-danger">未滿1000 kv</strong>, 無法領取該獎金</p>;
            }
            if (param.kv_total < 1000 && param.count_manager < 30) {
                errorCenterHtml = <p>因{Moment().format('MM') }月個人消費<strong className="text-danger">未滿1000 kv</strong>, 且<strong className="text-danger">未達30位合格經理人(經理人以上) 在線</strong>無法領取該獎金</p>;
            } else if (param.kv_total < 1000) {
                errorCenterHtml = errorSelfHtml;
            } else if (param.count_manager < 30) {
                errorCenterHtml = <p>因{Moment().format('MM') }月<strong className="text-danger">未達30位合格經理人(經理人以上) 在線</strong>無法領取該獎金</p>;
            }

            let managerHtml: JSX.Element = null;
            let centerHtml: JSX.Element = null;
            let officeHtml: JSX.Element = null;
            if (gb_rank >= SalesRankType.manager) {
                managerHtml = (
                    <div className="alert alert-info" role="alert">
                    <p><strong>經理人經營回饋獎金計算</strong></p>
                    <ol>
                     <p><strong className="text-danger">※當月消費未滿1, 000KV，無法領取該月之經理人經營回饋獎金．</strong></p>
                     <p>計算公式：</p>
                     <p><strong>經營回饋獎金：</strong>{Moment().format('MM') }月直推會員總KV(<strong className="text-danger">{param.recommend_kv_total}</strong>) X 12%={Math.round(param.recommend_kv_total * 0.12) }</p>
                     <p>{Moment().format('MM') }月經理人經營回饋獎金=<strong className="text-danger">{Math.round(param.recommend_kv_total * 0.12) }</strong></p>
                        {errorSelfHtml}
                        </ol>
                        </div>
                );
            }
            if (gb_rank >= SalesRankType.operationsCenter) {
                centerHtml = (
                    <div className="alert alert-success" role="alert">
                    <p><strong>營運中心紅利獎金計算</strong></p>
                    <ol>
                     <p><strong className="text-danger">※當月消費未滿1, 000KV，無法領取該月之營運中心紅利獎金．</strong></p>
                     <p><strong className="text-danger">※當月直推會員須達30位合格經理人(經理人以上) 在線，才可領取該月之營運中心紅利獎金．</strong></p>
                     <p>計算公式：</p>
                     <p><strong>營運中心紅利獎金：</strong>{Moment().format('MM') }月直推+間接會員總KV(<strong className="text-danger">{param.AllLine_kv_total - param.recommend_center_kv_total}</strong>) X 2%={Math.round((param.AllLine_kv_total - param.recommend_center_kv_total) * 0.02) }</p>
                     <p>{Moment().format('MM') }月營運中心紅利獎金=<strong className="text-danger">{Math.round((param.AllLine_kv_total - param.recommend_center_kv_total) * 0.02) }</strong></p>
                        {errorCenterHtml}
                        </ol>
                        </div>
                );
            }
            if (gb_rank == SalesRankType.managementOffice) {
                officeHtml = (
                    <div className="alert alert-danger" role="alert">
                    <p><strong>管理處紅利獎金計算</strong></p>
                    <ol>
                     <p><strong className="text-danger">※當月消費未滿1, 000KV，無法領取該月之管理處紅利獎金．</strong></p>
                     <p><strong className="text-danger">※當月直推會員須達30位合格經理人(經理人以上) 在線，才可領取該月之管理處紅利獎金．</strong></p>
                     <p>計算公式：</p>
                     <p><strong>管理處紅利獎金：</strong>{Moment().format('MM') }月直推營運中心之總營業KV(<strong className="text-danger">{param.recommend_center_kv_total}</strong>) X 1%={Math.round(param.recommend_center_kv_total * 0.01) }</p>
                     <p>{Moment().format('MM') }月管理處紅利獎金=<strong className="text-danger">{Math.round(param.recommend_center_kv_total * 0.01) }</strong></p>
                        {errorCenterHtml}
                        </ol>
                        </div>
                );
            }

            outHtml = (
                <div>
    <ul className="breadcrumb">
        <li><i className="fa-list-alt"></i>
            {this.props.menuName}
            </li>
        </ul>
    <h4 className="title"> {this.props.caption}</h4>
    <form className="form-horizontal">
        <div className="col-xs-12">

            <div className="alert alert-warning" role="alert">
                 <p><strong>個人獎金計算</strong></p>
                 <ol>
                     <p><strong className="text-danger">※當月消費未滿1, 000KV，無法領取該月之會員獎金．</strong></p>
                     <p>計算公式：</p>
                     <p><strong>CSC共享圈獎金：</strong>{Moment().format('MM') }月共享圈總KV(<strong className="text-danger">{param.share_kv_total}</strong>) X 1%={Math.round(param.share_kv_total * 0.01) }</p>
                     <p><strong>個人獎金：</strong>{Moment().format('MM') }月個人總KV(<strong className="text-danger">{param.kv_total}</strong>) X 75%={Math.round(param.kv_total * 0.75) }</p>
                     <p>兩者之間取最小為{Moment().format('MM') }月回饋金=<strong className="text-danger">{param.self_bonus}</strong></p>
                     {errorSelfHtml}
                     <p>{Moment().format('MM') }月累積回饋金=<strong className="text-danger">{param.b}</strong></p>
                     </ol>
                </div>

                {managerHtml}
                {centerHtml}
                {officeHtml}
            </div>
        </form>
                    </div>
            );

            return outHtml;
        }
    }
}

var dom = document.getElementById('page_content');
ReactDOM.render(<SettleSelf.GridForm caption={gb_caption} menuName={gb_menuname} iconClass="fa-list-alt" />, dom);