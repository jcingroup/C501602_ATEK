import $ = require('jquery');
import React = require('react');
import ReactDOM = require('react-dom');
import Moment = require('moment');
import ReactBootstrap = require("react-bootstrap");
import CommCmpt = require('comm-cmpt');
import CommFunc = require('comm-func');

namespace MyShareCircle {
    interface ModalShareProps extends BaseDefine.GridFormPropsBase {
        sales_sn_site: string;
    }
    interface ModalShareState {
        share_data?: SalesTree
        checked_sales_no?: string
        checked_sales_name?: string
    }
    interface TreeInfoProps {
        data: SalesTree,
        level: number,
        checked?: boolean,
        key: any
    }
    interface SalesTree {
        sales_no?: string;
        sales_name?: string;
        sub: Array<SalesTree>;
        sub_count?: number;
        is_me?: boolean;

        kv_total?: number;
        total?: number;
        last_kv_total?: number;
        last_total?: number;
    }

    class TreeInfo extends React.Component<TreeInfoProps, any>{
        now_level: number;
        constructor() {
            super();
            this.componentWillMount = this.componentWillMount.bind(this);
        }
        static defaultProps = {
            checked: false
        }
        componentWillMount() {
            this.now_level = this.props.level + 1;
        }
        componentDidMount() {

        }
        render() {

            let ck_out_html = null;


            var out_html =
                <ul className="tree">
                    <li>
                        <label>
                            <span className="fa-plus-square"></span>
                                {this.props.data.sales_name} { }
                                <span className="label label-success">total: {this.props.data.last_total}, kv: {this.props.data.last_kv_total}</span> { }
                                <span className="label label-info">total: {this.props.data.total}, kv: {this.props.data.kv_total}</span>
                            </label>
                                            {
                                            this.props.data.sub.map(
                                                (itemData, i) => {
                                                    var out_html = <TreeInfo data={itemData} level={this.now_level} key={itemData.sales_no} />
                                                        ;
                                                    return out_html;
                                                })
                                            }
                        </li>
                    </ul>;
            return out_html;
        }
    }
    export class GridForm extends React.Component<ModalShareProps, ModalShareState>{

        constructor() {

            super();
            this.queryShareBySales = this.queryShareBySales.bind(this);
            this.componentDidMount = this.componentDidMount.bind(this);
            this.render = this.render.bind(this);

            this.state = {
                share_data: {
                    sub: []
                },
                checked_sales_no: null
            }

            Moment.locale('zh-tw');
        }
        static defaultProps: ModalShareProps = {
            fdName: 'fieldData',
            gdName: 'searchData',
            apiPath: gb_approot + 'api/Sales',
            sales_sn_site: gb_sales_no
        }
        componentDidMount() {
            //this.queryGridData(1);
            this.queryShareBySales();
        }
        queryShareBySales() {
            CommFunc.jqGet(gb_approot + 'api/GetAction/GetShareBySales_kv', { sales_no: this.props.sales_sn_site })
                .done((data, textStatus, jqXHRdata) => {
                    //data 為樹狀排列完成資料
                    this.setState({ share_data: data });
                    for (let i in data) {
                        var obj = data[i];
                        //obj.
                    }

                    // this.props.upMasterData();
                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    CommFunc.showAjaxError(errorThrown);
                });
        }

        render() {

            var outHtml: JSX.Element = null;
            var blankStyle = {
                height: 100
            };

            outHtml = (
                <div>
                    <h4 className="title"> { this.props.caption }(目前自己底層已安置{this.state.share_data.sub_count}人) </h4>
                    <form className="form-horizontal" >

                        <div className="col-xs-12">
                            <div className="alert alert-warning" role="alert">
                                <p><strong>上月</strong>總KV值及當月總消費使用<span className="label label-success">此顏色區塊顯示</span>，
                                   <strong>當月</strong>總KV值及當月總消費使用<span className="label label-info">此顏色區塊顯示</span></p>
                                </div>
                            </div>

                        <div className="col-xs-8">
                            <ul className="root tree">
                                <li>
                                    <span className="fa-minus-square"></span>
                                    <label>
                                    {this.state.share_data.sales_name} { }
                                <span className="label label-success">total: {this.state.share_data.last_total}, kv: {this.state.share_data.last_kv_total}</span> { }
                                <span className="label label-info">total: {this.state.share_data.total}, kv: {this.state.share_data.kv_total}</span>
                                        </label>
                                {
                                this.state.share_data.sub.map(
                                    (itemData, i) => {
                                        var out_html =
                                            <TreeInfo
                                                key={itemData.sales_no}
                                                data={itemData}
                                                level={0}
                                                />;
                                        return out_html;
                                    })
                                }
                                    </li>
                                </ul>
                            </div>
                        </form>
                        <div className="col-xs-12" style={blankStyle}>
                        </div>                        
                    </div>
            );

            return outHtml;
        }
    }
}

var dom = document.getElementById('page_content');
ReactDOM.render(<MyShareCircle.GridForm caption={gb_caption} menuName={gb_menuname} sales_sn_site={gb_sales_no} iconClass="fa-list-alt" />, dom);