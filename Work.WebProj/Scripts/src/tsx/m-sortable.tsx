import $ = require('jquery');
import React = require('react');
import ReactDOM = require('react-dom');
import Moment = require('moment');
import ReactBootstrap = require("react-bootstrap");
import CommCmpt = require('comm-cmpt');
import CommFunc = require('comm-func');
import DT = require('dt');

namespace TestSoratble {
    interface FormState {
        fieldData?: server.AboutUs,
        data?: Array<any>;
        placeholder?: any;
        dragged?: any;
        over?: any;
        nodePlacement?: string;
    }

    export class GridForm extends React.Component<any, FormState>{

        constructor() {

            super();
            this.handleSubmit = this.handleSubmit.bind(this);
            this.componentDidMount = this.componentDidMount.bind(this);
            this.setLangValue = this.setLangValue.bind(this);

            this.dragStart = this.dragStart.bind(this);
            this.dragEnd = this.dragEnd.bind(this);
            this.dragOver = this.dragOver.bind(this);


            this.render = this.render.bind(this);


            this.state = {
                fieldData: { aboutus_id: 1, i_Lang: 'en-US' },
                data: ["Red", "Green", "Blue", "Yellow", "Black", "White", "Orange"]
            }
        }
        static defaultProps = {
            apiPath: gb_approot + 'api/AboutUs'
        }
        componentDidMount() {
            let placeholder = this.state.placeholder;
            placeholder = document.createElement("li");
            placeholder.className = "placeholder";
            this.setState({ placeholder: placeholder });
        }
        handleSubmit(detailData: server.AboutUsDetail[], e: React.FormEvent) {

            e.preventDefault();
            this.state.fieldData.AboutUsDetail = detailData;
            CommFunc.jqPut(this.props.apiPath, this.state.fieldData)
                .done((data, textStatus, jqXHRdata) => {
                    if (data.result) {
                        (this.refs["GridDetailForm"]).queryGridData();
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
        setLangValue(e: React.SyntheticEvent) {
            let input: HTMLInputElement = e.target as HTMLInputElement;
            let obj = this.state.fieldData;
            obj.i_Lang = input.value;
            if (obj.i_Lang == 'en-US') {
                obj.aboutus_id = 1;
            } else if (obj.i_Lang == 'ja-JP') {
                obj.aboutus_id = 2;
            }
            this.setState({ fieldData: obj });
            //(this.refs["GridDetailForm"]).queryGridData();
        }
        dragStart(e) {
            this.state.dragged = e.currentTarget;
            e.dataTransfer.effectAllowed = 'move';

            // Firefox requires calling dataTransfer.setData
            // for the drag to properly work
            e.dataTransfer.setData("text/html", e.currentTarget);
        }
        dragEnd(e) {

            this.state.dragged.style.display = "block";
            this.state.dragged.parentNode.removeChild(this.state.placeholder);

            // Update state
            var data = this.state.data;
            var from = Number(this.state.dragged.dataset.id);
            var to = Number(this.state.over.dataset.id);
            if (from < to) to--;
            console.log(from, to);
            if (this.state.nodePlacement == "after") to++;
            data.splice(to, 0, data.splice(from, 1)[0]);
            this.setState({ data: data });
            this.state.data.forEach((item, i) => console.log(i, item));
        }
        dragOver(e) {
            e.preventDefault();

            this.state.dragged.style.display = "none";
            if (e.target.className == "placeholder") return;
            this.state.over = e.target;

            var relY = e.clientY - this.state.over.offsetTop;
            var height = this.state.over.offsetHeight / 2;
            var parent = e.target.parentNode;
            if (e.target.dataset.id != undefined) {
                if (relY > height) {
                    this.state.nodePlacement = "after";
                    parent.insertBefore(this.state.placeholder, e.target.nextElementSibling);
                }
                else if (relY < height) {
                    this.state.nodePlacement = "before"
                    parent.insertBefore(this.state.placeholder, e.target);
                }
            }

            //e.target.parentNode.insertBefore(this.state.placeholder, e.target);
        }
        render() {

            var outHtml: JSX.Element = null;
            let fieldData = this.state.fieldData;
            let listItems = this.state.data.map((item, i) =>
                <li data-id={i}
                    key={i}
                    draggable={true}
                    onDragEnd={this.dragEnd.bind(this) }
                    onDragStart={this.dragStart.bind(this) }>{item}</li>);
            outHtml = (
                <div>
                    <h3 className="title clearfix">
                    <span className="pull-left">{this.props.caption}</span>
                        <div className="form-inline pull-left col-xs-offset-1">
                        <label><small>選擇語系：</small></label>
                        <select className="form-control"
                            value={fieldData.i_Lang}
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
                    <div className="alert alert-warning">
                        <button type="button" className="close" data-dismiss="alert"><span aria-hidden="true">×</span></button>
                        <ol>
                            <li>點選 <strong className="fa-bars"></strong> 並<strong>拖曳</strong>，可修改排列順序。</li>
                            <li>點選 <strong className="fa-chevron-up"></strong> 可收合/展開，點選 <strong className="fa-times"></strong> 可刪除。</li>
                            </ol>
                        </div>
                    <ul className="sortable-ul" onDragOver={this.dragOver.bind(this) }>{listItems}</ul>
                    </div>
            );

            return outHtml;
        }
    }
}






var dom = document.getElementById('page_content');
ReactDOM.render(<TestSoratble.GridForm caption={gb_caption} menuName={gb_menuname} iconClass="fa-list-alt" />, dom);