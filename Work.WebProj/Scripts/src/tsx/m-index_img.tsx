import $ = require('jquery');
import React = require('react');
import ReactDOM = require('react-dom');
import Moment = require('moment');
import ReactBootstrap = require("react-bootstrap");
import CommCmpt = require('comm-cmpt');
import CommFunc = require('comm-func');
import DT = require('dt');

namespace IndexImg {
    interface ParamData {
        url_1?: string;
        url_2?: string;
        url_3?: string;
        url_4?: string;
        url_5?: string;
        type?: number;
    }
    export class GridForm extends React.Component<any, { param?: ParamData, i_Lang?: string }>{


        constructor() {

            super();
            this.queryInitData = this.queryInitData.bind(this);
            this.handleSubmit = this.handleSubmit.bind(this);
            this.componentDidMount = this.componentDidMount.bind(this);
            this.setInputValue = this.setInputValue.bind(this);
            this.setLangValue = this.setLangValue.bind(this);
            this.render = this.render.bind(this);
            this.state = {
                param: {
                    url_1: null,
                    url_2: null,
                    url_3: null,
                    url_4: null,
                    url_5: null,
                    type: IndexImgType.US
                },
                i_Lang: "en-US"
            }
        }
        static defaultProps = {
            apiInitPath: gb_approot + 'Active/ParmData/aj_Init',
            apiPath: gb_approot + 'api/GetAction/PostIndexUrl'
        }
        componentDidMount() {
            this.queryInitData(IndexImgType.US);
        }
        queryInitData(type: number) {
            CommFunc.jqGet(this.props.apiInitPath, { type: type })
                .done((data, textStatus, jqXHRdata) => {
                    this.setState({ param: data });
                })
                .fail((jqXHR, textStatus, errorThrown) => {
                    CommFunc.showAjaxError(errorThrown);
                });
        }
        handleSubmit(e: React.FormEvent) {

            e.preventDefault();
            if (this.state.i_Lang == "ja-JP") {
                this.state.param.type = IndexImgType.JP;
            } else if (this.state.i_Lang == "en-US") {
                this.state.param.type = IndexImgType.US;
            }
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
        setLangValue(e: React.SyntheticEvent) {
            let input: HTMLInputElement = e.target as HTMLInputElement;
            let obj = this.state.i_Lang;
            obj = input.value;
            this.setState({ i_Lang: obj });
            let type = IndexImgType.US;
            if (obj == "ja-JP") {
                type = IndexImgType.JP;
            } else if (obj == "en-US") {
                type = IndexImgType.US;
            }
            this.queryInitData(type);
        }
        render() {

            var outHtml: JSX.Element = null;

            let param = this.state.param;
            let InputDate = CommCmpt.InputDate;
            let img_html: JSX.Element = null;
            if (gb_roles == "Admins") {
                if (this.state.i_Lang == "en-US") {
                    img_html = (
                        <div>
                   <div className="form-group">
                        <label className="col-xs-2 control-label">New Product</label>
                       <div className="col-xs-5">
                                <input className="form-control" type="text"
                                    value={param.url_1}
                                    onChange={this.setInputValue.bind(this, 'url_1') }
                                    maxLength={256}
                                    required/>
                           </div>
                        <div className="col-xs-5">
                        <CommCmpt.MasterImageUpload FileKind="NewProduct" MainId={'IndexImg'} ParentEditType={2} url_upload={gb_approot + 'Active/ParmData/aj_FUpload'} url_list={gb_approot + 'Active/ParmData/aj_FList'}
                            url_delete={gb_approot + 'Active/ParmData/aj_FDelete'} />
                            </div>
                       </div>
                   <div className="form-group clear bg-info">
                   <div className="form-group"><label className="col-xs-2 text-primary control-label strong">首頁四小圖</label></div>
                   <div className="form-group">
                        <label className="col-xs-2 control-label">小圖1(左上) </label>
                       <div className="col-xs-5">
                                <input className="form-control" type="text"
                                    value={param.url_2}
                                    onChange={this.setInputValue.bind(this, 'url_2') }
                                    maxLength={256}
                                    required/>
                           </div>
                        <div className="col-xs-5">
                        <CommCmpt.MasterImageUpload FileKind="About1" MainId={'IndexImg'} ParentEditType={2} url_upload={gb_approot + 'Active/ParmData/aj_FUpload'} url_list={gb_approot + 'Active/ParmData/aj_FList'}
                            url_delete={gb_approot + 'Active/ParmData/aj_FDelete'} />
                            </div>
                       </div>
                   <div className="form-group">
                        <label className="col-xs-2 control-label">小圖2(右上) </label>
                       <div className="col-xs-5">
                                <input className="form-control" type="text"
                                    value={param.url_3}
                                    onChange={this.setInputValue.bind(this, 'url_3') }
                                    maxLength={256}
                                    required/>
                           </div>
                        <div className="col-xs-5">
                        <CommCmpt.MasterImageUpload FileKind="About2" MainId={'IndexImg'} ParentEditType={2} url_upload={gb_approot + 'Active/ParmData/aj_FUpload'} url_list={gb_approot + 'Active/ParmData/aj_FList'}
                            url_delete={gb_approot + 'Active/ParmData/aj_FDelete'} />
                            </div>
                       </div>
                   <div className="form-group">
                        <label className="col-xs-2 control-label">小圖3(左下) </label>
                       <div className="col-xs-5">
                                <input className="form-control" type="text"
                                    value={param.url_4}
                                    onChange={this.setInputValue.bind(this, 'url_4') }
                                    maxLength={256}
                                    required/>
                           </div>
                        <div className="col-xs-5">
                        <CommCmpt.MasterImageUpload FileKind="EXHIBITION" MainId={'IndexImg'} ParentEditType={2} url_upload={gb_approot + 'Active/ParmData/aj_FUpload'} url_list={gb_approot + 'Active/ParmData/aj_FList'}
                            url_delete={gb_approot + 'Active/ParmData/aj_FDelete'} />
                            </div>
                       </div>
                   <div className="form-group">
                        <label className="col-xs-2 control-label">小圖4(右下) </label>
                       <div className="col-xs-5">
                                <input className="form-control" type="text"
                                    value={param.url_5}
                                    onChange={this.setInputValue.bind(this, 'url_5') }
                                    maxLength={256}
                                    required/>
                           </div>
                        <div className="col-xs-5">
                        <CommCmpt.MasterImageUpload FileKind="SUPPORT" MainId={'IndexImg'} ParentEditType={2} url_upload={gb_approot + 'Active/ParmData/aj_FUpload'} url_list={gb_approot + 'Active/ParmData/aj_FList'}
                            url_delete={gb_approot + 'Active/ParmData/aj_FDelete'} />
                            </div>
                       </div>
                       </div>
                            </div>
                    );
                } else if (this.state.i_Lang == "ja-JP") {
                    img_html = (
                        <div>
                            日文切換...
                            <div className="form-group">
                        <label className="col-xs-2 control-label">New Product</label>
                       <div className="col-xs-5">
                                <input className="form-control" type="text"
                                    value={param.url_1}
                                    onChange={this.setInputValue.bind(this, 'url_1') }
                                    maxLength={256}
                                    required/>
                           </div>
                        <div className="col-xs-5">
                        <CommCmpt.MasterImageUpload FileKind="NewProduct_jp" MainId={'IndexImg'} ParentEditType={2} url_upload={gb_approot + 'Active/ParmData/aj_FUpload'} url_list={gb_approot + 'Active/ParmData/aj_FList'}
                            url_delete={gb_approot + 'Active/ParmData/aj_FDelete'} />
                            </div>
                                </div>
                   <div className="form-group clear bg-info">
                   <div className="form-group"><label className="col-xs-2 text-primary control-label strong">首頁四小圖</label></div>
                   <div className="form-group">
                        <label className="col-xs-2 control-label">小圖1(左上) </label>
                       <div className="col-xs-5">
                                <input className="form-control" type="text"
                                    value={param.url_2}
                                    onChange={this.setInputValue.bind(this, 'url_2') }
                                    maxLength={256}
                                    required/>
                           </div>
                        <div className="col-xs-5">
                        <CommCmpt.MasterImageUpload FileKind="About1_jp" MainId={'IndexImg'} ParentEditType={2} url_upload={gb_approot + 'Active/ParmData/aj_FUpload'} url_list={gb_approot + 'Active/ParmData/aj_FList'}
                            url_delete={gb_approot + 'Active/ParmData/aj_FDelete'} />
                            </div>
                       </div>
                   <div className="form-group">
                        <label className="col-xs-2 control-label">小圖2(右上) </label>
                       <div className="col-xs-5">
                                <input className="form-control" type="text"
                                    value={param.url_3}
                                    onChange={this.setInputValue.bind(this, 'url_3') }
                                    maxLength={256}
                                    required/>
                           </div>
                        <div className="col-xs-5">
                        <CommCmpt.MasterImageUpload FileKind="About2_jp" MainId={'IndexImg'} ParentEditType={2} url_upload={gb_approot + 'Active/ParmData/aj_FUpload'} url_list={gb_approot + 'Active/ParmData/aj_FList'}
                            url_delete={gb_approot + 'Active/ParmData/aj_FDelete'} />
                            </div>
                       </div>
                   <div className="form-group">
                        <label className="col-xs-2 control-label">小圖3(左下) </label>
                       <div className="col-xs-5">
                                <input className="form-control" type="text"
                                    value={param.url_4}
                                    onChange={this.setInputValue.bind(this, 'url_4') }
                                    maxLength={256}
                                    required/>
                           </div>
                        <div className="col-xs-5">
                        <CommCmpt.MasterImageUpload FileKind="EXHIBITION_jp" MainId={'IndexImg'} ParentEditType={2} url_upload={gb_approot + 'Active/ParmData/aj_FUpload'} url_list={gb_approot + 'Active/ParmData/aj_FList'}
                            url_delete={gb_approot + 'Active/ParmData/aj_FDelete'} />
                            </div>
                       </div>
                   <div className="form-group">
                        <label className="col-xs-2 control-label">小圖4(右下) </label>
                       <div className="col-xs-5">
                                <input className="form-control" type="text"
                                    value={param.url_5}
                                    onChange={this.setInputValue.bind(this, 'url_5') }
                                    maxLength={256}
                                    required/>
                           </div>
                        <div className="col-xs-5">
                        <CommCmpt.MasterImageUpload FileKind="SUPPORT_jp" MainId={'IndexImg'} ParentEditType={2} url_upload={gb_approot + 'Active/ParmData/aj_FUpload'} url_list={gb_approot + 'Active/ParmData/aj_FList'}
                            url_delete={gb_approot + 'Active/ParmData/aj_FDelete'} />
                            </div>
                       </div>
                       </div>
                            </div>
                    );
                }
            } else {
                if (this.state.i_Lang == "en-US") {
                    img_html = (
                        <div>
                   <div className="form-group">
                        <label className="col-xs-2 control-label">New Product</label>
                        <div className="col-xs-7">
                        <CommCmpt.MasterImageUpload FileKind="NewProduct" MainId={'IndexImg'} ParentEditType={2} url_upload={gb_approot + 'Active/ParmData/aj_FUpload'} url_list={gb_approot + 'Active/ParmData/aj_FList'}
                            url_delete={gb_approot + 'Active/ParmData/aj_FDelete'} />
                            </div>
                       </div>
                   <div className="form-group clear bg-info">
                   <div className="form-group"><label className="col-xs-2 text-primary control-label strong">首頁四小圖</label></div>
                   <div className="form-group">
                        <label className="col-xs-2 control-label">小圖1(左上) </label>
                        <div className="col-xs-7">
                        <CommCmpt.MasterImageUpload FileKind="About1" MainId={'IndexImg'} ParentEditType={2} url_upload={gb_approot + 'Active/ParmData/aj_FUpload'} url_list={gb_approot + 'Active/ParmData/aj_FList'}
                            url_delete={gb_approot + 'Active/ParmData/aj_FDelete'} />
                            </div>
                       </div>
                   <div className="form-group">
                        <label className="col-xs-2 control-label">小圖2(右上) </label>
                        <div className="col-xs-7">
                        <CommCmpt.MasterImageUpload FileKind="About2" MainId={'IndexImg'} ParentEditType={2} url_upload={gb_approot + 'Active/ParmData/aj_FUpload'} url_list={gb_approot + 'Active/ParmData/aj_FList'}
                            url_delete={gb_approot + 'Active/ParmData/aj_FDelete'} />
                            </div>
                       </div>
                   <div className="form-group">
                        <label className="col-xs-2 control-label">小圖3(左下) </label>
                        <div className="col-xs-7">
                        <CommCmpt.MasterImageUpload FileKind="EXHIBITION" MainId={'IndexImg'} ParentEditType={2} url_upload={gb_approot + 'Active/ParmData/aj_FUpload'} url_list={gb_approot + 'Active/ParmData/aj_FList'}
                            url_delete={gb_approot + 'Active/ParmData/aj_FDelete'} />
                            </div>
                       </div>
                   <div className="form-group">
                        <label className="col-xs-2 control-label">小圖4(右下) </label>
                        <div className="col-xs-7">
                        <CommCmpt.MasterImageUpload FileKind="SUPPORT" MainId={'IndexImg'} ParentEditType={2} url_upload={gb_approot + 'Active/ParmData/aj_FUpload'} url_list={gb_approot + 'Active/ParmData/aj_FList'}
                            url_delete={gb_approot + 'Active/ParmData/aj_FDelete'} />
                            </div>
                       </div>
                       </div>
                            </div>
                    );
                } else if (this.state.i_Lang == "ja-JP") {
                    img_html = (
                        <div>
                            日文切換...
                            <div className="form-group">
                        <label className="col-xs-2 control-label">New Product</label>
                        <div className="col-xs-8">
                        <CommCmpt.MasterImageUpload FileKind="NewProduct_jp" MainId={'IndexImg'} ParentEditType={2} url_upload={gb_approot + 'Active/ParmData/aj_FUpload'} url_list={gb_approot + 'Active/ParmData/aj_FList'}
                            url_delete={gb_approot + 'Active/ParmData/aj_FDelete'} />
                            </div>
                                </div>
                   <div className="form-group clear bg-info">
                   <div className="form-group"><label className="col-xs-2 text-primary control-label strong">首頁四小圖</label></div>
                   <div className="form-group">
                        <label className="col-xs-2 control-label">小圖1(左上) </label>
                        <div className="col-xs-8">
                        <CommCmpt.MasterImageUpload FileKind="About1_jp" MainId={'IndexImg'} ParentEditType={2} url_upload={gb_approot + 'Active/ParmData/aj_FUpload'} url_list={gb_approot + 'Active/ParmData/aj_FList'}
                            url_delete={gb_approot + 'Active/ParmData/aj_FDelete'} />
                            </div>
                       </div>
                   <div className="form-group">
                        <label className="col-xs-2 control-label">小圖2(右上) </label>
                        <div className="col-xs-8">
                        <CommCmpt.MasterImageUpload FileKind="About2_jp" MainId={'IndexImg'} ParentEditType={2} url_upload={gb_approot + 'Active/ParmData/aj_FUpload'} url_list={gb_approot + 'Active/ParmData/aj_FList'}
                            url_delete={gb_approot + 'Active/ParmData/aj_FDelete'} />
                            </div>
                       </div>
                   <div className="form-group">
                        <label className="col-xs-2 control-label">小圖3(左下) </label>
                        <div className="col-xs-8">
                        <CommCmpt.MasterImageUpload FileKind="EXHIBITION_jp" MainId={'IndexImg'} ParentEditType={2} url_upload={gb_approot + 'Active/ParmData/aj_FUpload'} url_list={gb_approot + 'Active/ParmData/aj_FList'}
                            url_delete={gb_approot + 'Active/ParmData/aj_FDelete'} />
                            </div>
                       </div>
                   <div className="form-group">
                        <label className="col-xs-2 control-label">小圖4(右下) </label>
                        <div className="col-xs-8">
                        <CommCmpt.MasterImageUpload FileKind="SUPPORT_jp" MainId={'IndexImg'} ParentEditType={2} url_upload={gb_approot + 'Active/ParmData/aj_FUpload'} url_list={gb_approot + 'Active/ParmData/aj_FList'}
                            url_delete={gb_approot + 'Active/ParmData/aj_FDelete'} />
                            </div>
                       </div>
                       </div>
                            </div>
                    );
                }
            }

            outHtml = (
                <div>
                    <h3 className="title clearfix">
                    <span className="pull-left">{this.props.caption}</span>
                        <div className="form-inline pull-left col-xs-offset-1">
                        <label><small>選擇語系：</small></label>
                        <select className="form-control"
                            value={this.state.i_Lang}
                            onChange={this.setLangValue.bind(this) }
                            >
                            {
                            DT.LangData.map(function (itemData, i) {
                                return <option key={itemData.id} value={itemData.id}>{itemData.label}</option>;
                            })
                            }
                            </select>
                            </div>
                        </h3>
    <form className="form-horizontal" onSubmit={this.handleSubmit}>
        <div className="col-xs-12">
                    <div className="item-box">
                {/*--email--*/}
                <div className="item-title text-center">
                <h5>首頁其他圖片設定</h5>
                    </div>
                    <div className="alert alert-warning" role="alert">
                        <ol>
                            <li> 每個連結最多1張圖，每張圖最大不可超過<strong className="text-danger">2MB</strong></li>
                            <li> <strong>New Product</strong> 建議尺寸<strong className="text-danger">w960 x h580</strong></li>
                            <li> <strong>四小圖</strong> 建議尺寸<strong className="text-danger">w420 x h206</strong></li>
                            </ol>
                        </div>
                        {img_html}
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
ReactDOM.render(<IndexImg.GridForm caption={gb_caption} menuName={gb_menuname} iconClass="fa-list-alt" />, dom);