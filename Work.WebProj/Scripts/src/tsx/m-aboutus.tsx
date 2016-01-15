import $ = require('jquery');
import React = require('react');
import ReactDOM = require('react-dom');
import Moment = require('moment');
import ReactBootstrap = require("react-bootstrap");
import CommCmpt = require('comm-cmpt');
import CommFunc = require('comm-func');

namespace AboutUs {
    export class GridForm extends React.Component<any, { aboutus_content?: string }>{

        constructor() {

            super();
            this.queryInitData = this.queryInitData.bind(this);
            this.handleSubmit = this.handleSubmit.bind(this);
            this.componentDidMount = this.componentDidMount.bind(this);
            this.setInputValue = this.setInputValue.bind(this);
            this.render = this.render.bind(this);


            this.state = {
                aboutus_content: null
            }
        }
        static defaultProps = {
            apiInitPath: gb_approot + 'Active/ParmData/aj_Init',
            apiPath: gb_approot + 'api/GetAction/PostAboutUs'
        }
        componentDidMount() {
            this.queryInitData();
        }
        queryInitData() {
            CommFunc.jqGet(this.props.apiInitPath, {})
                .done((data, textStatus, jqXHRdata) => {
                    this.setState({ aboutus_content: data });
                    CKEDITOR.replace('aboutus_content');
                })
                .fail((jqXHR, textStatus, errorThrown) => {
                    CommFunc.showAjaxError(errorThrown);
                });
        }
        handleSubmit(e: React.FormEvent) {

            e.preventDefault();
            this.state.aboutus_content = CKEDITOR.instances['aboutus_content'].getData();
            CommFunc.jqPost(this.props.apiPath, { aboutus: this.state.aboutus_content })
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
            let obj = this.state.aboutus_content;
            obj = input.value;
            this.setState({ aboutus_content: obj });
        }
        render() {

            var outHtml: JSX.Element = null;

            let aboutus_content = this.state.aboutus_content;
            let InputDate = CommCmpt.InputDate;

            outHtml = (
                <div>
    <ul className="breadcrumb">
        <li><i className="fa-list-alt"></i>
            {this.props.menuName}
            </li>
        </ul>
    <h4 className="title"> {this.props.caption} 基本資料維護</h4>
    <form className="form-horizontal" onSubmit={this.handleSubmit}>
        <div className="col-xs-12">

            <div className="form-group">
                <div className="col-xs-10">
                    <textarea type="date" rows={20} className="form-control" id="aboutus_content" name="aboutus_content" value={aboutus_content} onChange={this.setInputValue.bind(this) } />
                    </div>
                </div>


            <div className="form-action">
                <div className="col-xs-4 col-xs-offset-2">
                    <button type="submit" className="btn-primary"><i className="fa-check"></i> 儲存</button>
                    </div>
                </div>
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