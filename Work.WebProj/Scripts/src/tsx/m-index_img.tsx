import $ = require('jquery');
import React = require('react');
import ReactDOM = require('react-dom');
import Moment = require('moment');
import ReactBootstrap = require("react-bootstrap");
import CommCmpt = require('comm-cmpt');
import CommFunc = require('comm-func');

namespace IndexImg {
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
                <h5>首頁其他圖片設定</h5>
                    </div>
                    <div className="alert alert-warning" role="alert">
                        <ol>
                            <li> 每張圖最大不可超過<strong className="text-danger">2MB</strong></li>
                            </ol>
                        </div>
                   <div className="form-group">
                        <label className="col-xs-2 control-label">New Product</label>
                        <div className="col-xs-8">
                        <small className="help-block">最多1張圖，建議尺寸 w960 x h580</small>
                        <CommCmpt.MasterImageUpload FileKind="NewProduct" MainId={'IndexImg'} ParentEditType={2} url_upload={gb_approot + 'Active/ParmData/aj_FUpload'} url_list={gb_approot + 'Active/ParmData/aj_FList'}
                            url_delete={gb_approot + 'Active/ParmData/aj_FDelete'} />
                            </div>
                       </div>
                   <div className="form-group">
                        <label className="col-xs-2 control-label">ABOUT ATEK</label>
                        <div className="col-xs-8">
                        <small className="help-block">最多1張圖，建議尺寸 w420 x h206</small>
                        <CommCmpt.MasterImageUpload FileKind="About1" MainId={'IndexImg'} ParentEditType={2} url_upload={gb_approot + 'Active/ParmData/aj_FUpload'} url_list={gb_approot + 'Active/ParmData/aj_FList'}
                            url_delete={gb_approot + 'Active/ParmData/aj_FDelete'} />
                            </div>
                       </div>
                   <div className="form-group">
                        <label className="col-xs-2 control-label">OEM/ODM</label>
                        <div className="col-xs-8">
                        <small className="help-block">最多1張圖，建議尺寸 w420 x h206</small>
                        <CommCmpt.MasterImageUpload FileKind="About2" MainId={'IndexImg'} ParentEditType={2} url_upload={gb_approot + 'Active/ParmData/aj_FUpload'} url_list={gb_approot + 'Active/ParmData/aj_FList'}
                            url_delete={gb_approot + 'Active/ParmData/aj_FDelete'} />
                            </div>
                       </div>
                   <div className="form-group">
                        <label className="col-xs-2 control-label">EXHIBITION</label>
                        <div className="col-xs-8">
                        <small className="help-block">最多1張圖，建議尺寸 w420 x h206</small>
                        <CommCmpt.MasterImageUpload FileKind="EXHIBITION" MainId={'IndexImg'} ParentEditType={2} url_upload={gb_approot + 'Active/ParmData/aj_FUpload'} url_list={gb_approot + 'Active/ParmData/aj_FList'}
                            url_delete={gb_approot + 'Active/ParmData/aj_FDelete'} />
                            </div>
                       </div>
                   <div className="form-group">
                        <label className="col-xs-2 control-label">SUPPORT</label>
                        <div className="col-xs-8">
                        <small className="help-block">最多1張圖，建議尺寸 w420 x h206</small>
                        <CommCmpt.MasterImageUpload FileKind="SUPPORT" MainId={'IndexImg'} ParentEditType={2} url_upload={gb_approot + 'Active/ParmData/aj_FUpload'} url_list={gb_approot + 'Active/ParmData/aj_FList'}
                            url_delete={gb_approot + 'Active/ParmData/aj_FDelete'} />
                            </div>
                       </div>
                {/*--email end--*/}
                </div>

            {/*<div className="form-action">
                <div className="col-xs-4 col-xs-offset-5">
                    <button type="submit" className="btn-primary"><i className="fa-check"></i> 儲存</button>
                    </div>
                </div>*/}
            </div>
        </form>
                    </div>
            );

            return outHtml;
        }
    }
}

var dom = document.getElementById('page_content');
ReactDOM.render(<IndexImg.GridForm caption={gb_caption} menuName={gb_menuname} iconClass="fa-list-alt" />, dom);