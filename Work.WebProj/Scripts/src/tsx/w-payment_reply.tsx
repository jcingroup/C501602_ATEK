import $ = require('jquery');
import React = require('react');
import ReactDOM = require('react-dom');
import Moment = require('moment');
import CommCmpt = require('comm-cmpt');
import CommFunc = require('comm-func');
import DT = require('dt');
import "Pikaday/css/pikaday.css";

namespace PaymentReply {
    interface Formprops {
        apiPath?: string;
    }
    interface FormState {
        fieldData?: server.PaymentReply;
        no_require?: boolean;
    }
    interface ResultInfo {
        id?: number;
        no?: string;
        message?: string;
    }
    export class GridForm extends React.Component<Formprops, FormState>{

        constructor() {

            super();
            this.componentDidMount = this.componentDidMount.bind(this);
            this.setInputValue = this.setInputValue.bind(this);
            this.changeDatePicker = this.changeDatePicker.bind(this);
            this.handleSubmit = this.handleSubmit.bind(this);
            this.render = this.render.bind(this);


            this.state = {
                fieldData: {
                    purchase_no: gb_no,
                    remit_number: null
                },
                no_require: false
            }
        }
        static defaultProps: Formprops = {
            apiPath: gb_approot + 'Payment/PostPaymentReplyData'
        }
        componentDidMount() {
            if (gb_no != '') {
                this.setState({ no_require: true });
            }
        }
        setInputValue(name: string, e: React.SyntheticEvent) {
            let input: HTMLInputElement = e.target as HTMLInputElement;
            let obj = this.state.fieldData;
            obj[name] = input.value;
            this.setState({ fieldData: obj });
        }
        changeDatePicker(name: string, v: Date) {
            let obj = this.state.fieldData
            obj[name] = Moment(v).toJSON();
            this.setState({
                fieldData: obj
            });
        }
        handleSubmit(e: React.FocusEvent) {
            e.preventDefault();
            if (!confirm('確定是否送出?')) {
                return;
            }
            CommFunc.jqPost(this.props.apiPath, this.state.fieldData)
                .done((data, textStatus, jqXHRdata) => {
                    if (data.result) {
                        var anchor = $('#tab2').attr('id');
                        $('.checklist').hide();
                        $('#tab2').show();
                        $('.tab-switcher span').removeClass('current');
                        $('.tab-switcher span[rel*="' + anchor + '"]').addClass('current');
                    } else {
                        alert(data.message);
                        this.setState({ no_require: false });
                    }
                })
                .fail((jqXHR, textStatus, errorThrown) => {
                    CommFunc.showAjaxError(errorThrown);
                });
        }
        render() {

            var outHtml: JSX.Element = null;
            var fieldData = this.state.fieldData;
            let InputDate = CommCmpt.InputDate;

            outHtml = (
                <section id="content">

                    <h2 className="title">已付款通知</h2>

                    <section id="tab1" className="checklist tab-content">
                        <p>請填寫付款資料以利對帳，謝謝！</p>
                        <form action="" className="form" onSubmit={this.handleSubmit} id="reply">
                            <div className="row">
                                <label className="col-2 text-right">訂單編號</label>
                                <div className="col-6">
                                    <input type="text" className="form-element" maxLength={16}
                                        value={fieldData.purchase_no}
                                        onChange={this.setInputValue.bind(this, 'purchase_no') }
                                        disabled={this.state.no_require}
                                        required/>
                                    </div>
                                </div>
                            <div className="row">
                                <label className="col-2 text-right">匯款帳號後5碼</label>
                                <div className="col-6">
                                    <input type="text" className="form-element" maxLength={5}
                                        pattern="[0-9]{5}" title="限輸入數字"
                                        value={fieldData.remit_number} 
                                        onChange={this.setInputValue.bind(this, 'remit_number') }
                                        required/>
                                    </div>
                                <small className="col-4 text-error">(必填) </small>
                                </div>
                            <div className="row">
                                <label className="col-2 text-right">匯款日期</label>
                                <div className="col-6">
                                    <InputDate id="remit_day"
                                        onChange={this.changeDatePicker}
                                        field_name="remit_day"
                                        value={fieldData.remit_day}
                                        disabled={false} required={true} ver={4} />
                                    </div>
                                <small className="col-4 text-error">(必填) </small>
                                </div>
                            <div className="row">
                                <label className="col-2 text-right">匯款時間</label>
                                <div className="col-6">
                                    <select className="form-element" value={fieldData.remit_time} required
                                        onChange={this.setInputValue.bind(this, 'remit_time') }>
                                        <option value=""></option>
                                        {
                                        DT.remitTimeData.map((itemData, i) => <option key={i} value={itemData.id}>{itemData.label}</option>)
                                        }
                                        </select>
                                    </div>
                                <small className="col-4 text-error">(必填) </small>
                                </div>
                            <div className="row">
                                <label className="col-2 text-right">匯款金額</label>
                                <div className="col-6">
                                    <input type="number" className="form-element"
                                        value={fieldData.remit_money}
                                        onChange={this.setInputValue.bind(this, 'remit_money') }
                                        required/>
                                    </div>
                                <small className="col-4"><span className="text-error">(必填) </span> 單位: 新台幣 (NT) </small>
                                </div>
                            <div className="row">
                                <label className="col-2 text-right">備註</label>
                                <div className="col-6">
                                    <textarea name="" id="" cols={30} rows={5} className="form-element"
                                        value={fieldData.memo} maxLength={256}
                                        onChange={this.setInputValue.bind(this, 'memo') }></textarea>
                                    </div>
                                </div>
                            <div className="row submit">
                                <div className="col-6 offset-2">
                                    <button className="btn btn-lg btn-success" form="reply" type="submit">送出</button>
                                    </div>
                                </div>
                            </form>
                        </section>

                    <section id="tab2" className="checklist tab-content">
                        <dl className="signup-finish">
                            <dt><i className="fa-check"></i></dt>
                            <dd>
                                <p>系統已收到您的付款通知，謝謝您的填寫！</p>
                                <p>您可前往 <a href="../History">歷史訂單查詢</a> 隨時查詢訂單進度。</p>
                                </dd>
                            </dl>
                        </section>

                    </section>
            );

            return outHtml;
        }
    }
}

var dom = document.getElementById('page_content');
ReactDOM.render(<PaymentReply.GridForm />, dom);