import $ = require('jquery');
import React = require('react');
import ReactDOM = require('react-dom');
import Moment = require('moment');
import ReactBootstrap = require("react-bootstrap");
import CommCmpt = require('comm-cmpt');
import CommFunc = require('comm-func');

namespace AboutUs {
    interface FormState {
        gridData?: server.AboutUsDetail[],
        main_id?: number
    }
    export class GridForm extends React.Component<any, FormState>{

        constructor() {

            super();
            this.queryInitData = this.queryInitData.bind(this);
            this.handleSubmit = this.handleSubmit.bind(this);
            this.componentDidMount = this.componentDidMount.bind(this);
            this.setInputValue = this.setInputValue.bind(this);
            this.render = this.render.bind(this);


            this.state = {
                gridData: [],
                main_id: 1
            }
        }
        static defaultProps = {
            apiInitPath: gb_approot + 'Active/ParmData/aj_Init',
            apiPath: gb_approot + 'api/GetAction/PostAboutUs'
        }
        componentDidMount() {
            //this.queryInitData();
        }
        queryInitData() {
            CommFunc.jqGet(this.props.apiInitPath, {})
                .done((data, textStatus, jqXHRdata) => {
                    this.setState({ gridData: data });
                    CKEDITOR.replace('aboutus_content');
                })
                .fail((jqXHR, textStatus, errorThrown) => {
                    CommFunc.showAjaxError(errorThrown);
                });
        }
        handleSubmit(e: React.FormEvent) {

            e.preventDefault();
            this.state.gridData = CKEDITOR.instances['aboutus_content'].getData();
            CommFunc.jqPost(this.props.apiPath, { aboutus: this.state.gridData })
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
            return;
        }
        handleOnBlur(date) {

        }
        setInputValue(e: React.SyntheticEvent) {
            let input: HTMLInputElement = e.target as HTMLInputElement;
            //let obj = this.state.aboutus_content;
            //obj = input.value;
            //this.setState({ aboutus_content: obj });
        }
        render() {

            var outHtml: JSX.Element = null;

            let InputDate = CommCmpt.InputDate;

            outHtml = (
                <div>
                    <h3 className="title clearfix">
                    <span className="pull-left">{this.props.caption}</span>
                        </h3>

                    <div className="alert alert-warning">
                    <button type="button" className="close" data-dismiss="alert"><span aria-hidden="true">×</span></button>
                    <ol>
                        <li>點選 <strong className="fa-bars"></strong> 並<strong>拖曳</strong>，可修改排列順序。</li>
                        <li>點選 <strong className="fa-chevron-up"></strong> 或 <strong className="fa-chevron-down"></strong> 可收合/展開，點選 <strong className="fa-times"></strong> 可刪除。</li>
                        </ol>
                        </div>
                    <form className="form-horizontal" onSubmit={this.handleSubmit}>
                        <div className="panel-group" ref="SortForm">

                            </div>
                        <div className="form-action text-center">
                            <button type="submit" className="btn-primary"><i className="fa-check"></i> 儲存</button>
                            </div>
                        </form>


                    </div>
            );

            return outHtml;
        }
    }
}

var dom = document.getElementById('page_content');
ReactDOM.render(<AboutUs.GridForm caption={gb_caption} menuName={gb_menuname} iconClass="fa-list-alt" />, dom);