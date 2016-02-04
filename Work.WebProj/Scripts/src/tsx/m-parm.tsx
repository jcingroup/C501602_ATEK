import $ = require('jquery');
import React = require('react');
import ReactDOM = require('react-dom');
import Moment = require('moment');
import ReactBootstrap = require("react-bootstrap");
import CommCmpt = require('comm-cmpt');
import CommFunc = require('comm-func');

namespace Parm {
    interface ParamData {
        Email?: string;
    }
    export class GridForm extends React.Component<any, { param?: ParamData }>{


        constructor() {

            super();
            this.queryInitData = this.queryInitData.bind(this);
            this.handleSubmit = this.handleSubmit.bind(this);
            this.componentDidMount = this.componentDidMount.bind(this);
            this.setInputValue = this.setInputValue.bind(this);
            this.render = this.render.bind(this);
            this.state = {
                param: {
                    Email: null
                }
            }
        }
        static defaultProps = {
            apiInitPath: gb_approot + 'Active/ParmData/aj_ParamInit',
            apiPath: gb_approot + 'api/GetAction/PostParamData'
        }
        componentDidMount() {
            this.queryInitData();
        }
        queryInitData() {
            CommFunc.jqGet(this.props.apiInitPath, {})
                .done((data, textStatus, jqXHRdata) => {
                    this.setState({ param: data });
                })
                .fail((jqXHR, textStatus, errorThrown) => {
                    CommFunc.showAjaxError(errorThrown);
                });
        }
        handleSubmit(e: React.FormEvent) {

            e.preventDefault();
            CommFunc.jqPost(this.props.apiPath, this.state.param)
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
        setInputValue(name: string, e: React.SyntheticEvent) {
            let input: HTMLInputElement = e.target as HTMLInputElement;
            let obj = this.state.param;
            obj[name] = input.value;
            this.setState({ param: obj });
        }
        render() {

            var outHtml: JSX.Element = null;

            let param = this.state.param;
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
            <div className="item-box">
                {/*--email--*/}
                <div className="item-title text-center">
                <h5>Email信箱設定</h5>
                    </div>
                    <div className="alert alert-warning" role="alert">
                        <ol>
                            <li>多筆信箱請用「<strong className="text-danger">, </strong>」逗號分開。<br />ex.<strong>user1 @demo.com.tw, user2 @demo.com.tw</strong></li>
                            <li>Email 前面可填收件人姓名，用「<strong className="text-danger">: </strong>」冒號分隔姓名和信箱，此項非必要，可省略。<br />ex.<strong>收件人A: user1 @demo.com.tw, 收件人B: user2 @demo.com.tw</strong></li>
                            </ol>
                        </div>
                    <div className="form-group">
                       <label className="col-xs-1 control-label">收件信箱</label>
                       <div className="col-xs-9">
                                <input className="form-control" type="text"
                                    value={param.Email}
                                    onChange={this.setInputValue.bind(this, 'Email') }
                                    maxLength={500}
                                    required/>
                           </div>
                        </div>
                {/*--email end--*/}
                </div>

            <div className="form-action">
                <div className="col-xs-4 col-xs-offset-5">
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
ReactDOM.render(<Parm.GridForm caption={gb_caption} menuName={gb_menuname} iconClass="fa-list-alt" />, dom);