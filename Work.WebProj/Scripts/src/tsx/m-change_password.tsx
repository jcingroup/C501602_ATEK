import $ = require('jquery');
import React = require('react');
import ReactDOM = require('react-dom');
import Moment = require('moment');
import ReactBootstrap = require("react-bootstrap");
import CommCmpt = require('comm-cmpt');
import CommFunc = require('comm-func');

namespace ChangePasswrod {
    interface PadParm {
        OldPassword?: string;
        NewPassword?: string;
        ConfirmPassword?: string;
    }
    export class GridForm extends React.Component<any, { pram?: PadParm }>{

        constructor() {

            super();
            this.handleSubmit = this.handleSubmit.bind(this);
            this.componentDidMount = this.componentDidMount.bind(this);
            this.changePValue = this.changePValue.bind(this);
            this.setInputValue = this.setInputValue.bind(this);
            this.render = this.render.bind(this);


            this.state = {
                pram: { OldPassword: null, NewPassword: null, ConfirmPassword: null }
            }
        }
        static defaultProps = {
            PName: 'pram',
            updatePathName: gb_approot + 'Base/Users/aj_MasterPasswordUpdate'
        }
        componentDidMount() {

        }
        handleSubmit(e: React.FormEvent) {

            e.preventDefault();
            CommFunc.jqPost(this.props.updatePathName, this.state.pram)
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
        changePValue(name: string, e: React.SyntheticEvent) {
            this.setInputValue(this.props.PName, name, e);
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
            this.setState({ pram: obj });
        }
        render() {

            var outHtml: JSX.Element = null;
            var pram = this.state.pram;

            outHtml = (
                <div>
    <h4 className="title"> {this.props.caption}</h4>
    <div className="alert alert-warning"><p>以下皆為 <strong className="text-danger">必填項目</strong> 。</p></div>
    <form className="form-horizontal" onSubmit={this.handleSubmit}>
        <div className="col-xs-12">

                        <div className="form-group">
                            <label className="col-xs-2 control-label">目前密碼</label>
                            <div className="col-xs-5">
                                <input className="form-control" type="password"
                                    value={pram.OldPassword}
                                    onChange={this.changePValue.bind(this, 'OldPassword') }
                                    maxLength={16} required />
                                </div>
                            </div>

                        <div className="form-group">
                            <label className="col-xs-2 control-label">新密碼</label>
                            <div className="col-xs-5">
                                <input className="form-control" type="password"
                                    value={pram.NewPassword}
                                    onChange={this.changePValue.bind(this, 'NewPassword') }
                                    maxLength={16} required />
                                </div>
                            </div>

                        <div className="form-group">
                            <label className="col-xs-2 control-label">確認新密碼</label>
                            <div className="col-xs-5">
                                <input className="form-control" type="password"
                                    value={pram.ConfirmPassword}
                                    onChange={this.changePValue.bind(this, 'ConfirmPassword') }
                                    maxLength={16} required />
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
ReactDOM.render(<ChangePasswrod.GridForm caption={gb_caption} menuName={gb_menuname} iconClass="fa-list-alt" />, dom);