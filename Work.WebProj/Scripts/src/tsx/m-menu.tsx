import React = require('react');
import ReactDOM = require('react-dom');
import CommFunc = require('comm-func');
import ReactBootstrap = require("react-bootstrap");


namespace Menu {

    class MenuDef {
        Action: string;
        Area: string;
        Attributes: Array<IKeyValue<string>>;
        Clickable: boolean;
        Controller: string;
        Description: string;
        HostName: string;
        ImageUrl: string;
        Key: number;
        ParentKey: number;
        sort: number;
        TargetFrame: string;
        Title: string;
        sub: Array<MenuDef>;
        Checked: boolean;
        parent: MenuDef;
        IconClass: string;
    }
    interface MenuTreeProps {
        area: string,
        controller: string,
        action: string,
        def_action: string
    }
    export class MenuTree extends React.Component<MenuTreeProps, { menu_data: Array<MenuDef> }>
    {
        constructor() {
            super();
            this.componentDidMount = this.componentDidMount.bind(this);
            this.componentWillMount = this.componentWillMount.bind(this);
            this.makeTreeData = this.makeTreeData.bind(this);
            this.onClick = this.onClick.bind(this);
            this.state = {
                menu_data: []
            }
        }
        static defaultProps = {
        }

        componentWillMount() {
        }

        componentDidMount() {
            CommFunc.jqGet(gb_approot + 'api/GetAction/GetMenuQuery', {})
                .done((data, textStatus, jqXHRdata) => {

                    let c_data = CommFunc.clone(data); //非樹狀
                    let fst: MenuDef = new MenuDef();
                    fst.Key = 0;
                    fst.ParentKey = 0;
                    fst.Title = 'root';
                    fst.sub = this.makeTreeData(fst, c_data);

                    this.setState({ menu_data: fst.sub });
                })
                .fail((jqXHR, textStatus, errorThrown) => {
                    CommFunc.showAjaxError(errorThrown);
                });
        }
        private makeTreeData(item: MenuDef, data: Array<MenuDef>): Array<MenuDef> {

            let collect_Sub: Array<MenuDef> = [];
            for (let i in data) {
                let m = data[i];
                if (m.ParentKey == item.Key) {
                    m.parent = item;
                    //是否為目前被選取項目檢查
                    if (m.Area == this.props.area) {
                        //console.log('check', 1, m.Title, m.Action, this.props.action, this.props.def_action);
                        if (m.Controller == this.props.controller) {
                            if (m.Action == '') {
                                if (this.props.action == this.props.def_action) {
                                    m.Checked = true;
                                    m.parent.Checked = true; //父項目也要核取為true 因為選單只有兩層 只推上一層
                                }
                            }
                            else {
                                if (this.props.action == m.Action) {
                                    m.Checked = true;
                                    m.parent.Checked = true; //父項目也要核取為true 因為選單只有兩層 只推上一層
                                    //console.log('Selected', m);
                                }
                            }
                        }
                    }

                    collect_Sub.push(m);
                    m.sub = this.makeTreeData(m, data);
                }
            }
            return collect_Sub;
        }
        private onClick(menu_id: number) {
            let obj = this.state.menu_data;
            for (let i in obj) {
                if (obj[i].Key == menu_id) {
                    obj[i].Checked = true;
                } else {
                    obj[i].Checked = false;
                }
            }
            this.setState({ menu_data: obj });
        }

        render() {

            let Collapse = ReactBootstrap.Collapse;

            return (
                <div>
                    <h3 className="title">
                        <span className="icon">
                            <i className="fa-square text-success"></i>
                            <i className="fa-square text-info"></i>
                            <i className="fa-square text-warning"></i>
                            <i className="fa-square text-danger"></i>
                            </span>
                        功能選單 MENU
                        </h3>
                    <div id="submenu">
                        <ul className="panel">
                        {
                        this.state.menu_data.map((menu, i) => {
                            let out_html = null;
                            let ele_class: string = null;

                            if (menu.Checked) {

                            } else {

                            }
                            out_html =
                            <div key={menu.Key}>
                                        <li className="panel-heading">
                                            <a href="#" onClick={this.onClick.bind(this, menu.Key) } className="panel-title">
                                                <i className={menu.IconClass}></i> {menu.Title}
                                                </a>
                                            </li>

                                        <Collapse in={menu.Checked}>
                                        <li className="panel-collapse">
                                            <ul className="panel-body">
                                            {
                                            menu.sub.map((menu_item, j) => {
                                                let out_html_sub_item = null;
                                                let active_link = null;
                                                let link_str = null;

                                                if (menu_item.Action == '') {
                                                    link_str = gb_approot + menu_item.Area + '/' + menu_item.Controller;
                                                } else {
                                                    link_str = gb_approot + menu_item.Area + '/' + menu_item.Controller + '/' + menu_item.Action;
                                                }

                                                if (menu_item.Checked) {
                                                    active_link = <a href={link_str} className="current" title={menu_item.Title}><i></i>{menu_item.Title}</a>
                                                } else {
                                                    active_link = <a href={link_str} title={menu_item.Title}><i></i>{menu_item.Title}</a>
                                                }

                                                out_html_sub_item =
                                                <li key={menu_item.Key}>
                                                            {active_link}
                                                    </li>;

                                                return out_html_sub_item;
                                            })
                                            }
                                                </ul>
                                            </li>
                                            </Collapse>
                                </div>;

                            return out_html;
                        })
                        }
                            </ul>
                        </div>
                    </div>
            );
        }
    }
}

var dom = document.getElementById('sidebar');
ReactDOM.render(<Menu.MenuTree
    area={gb_area}
    controller={gb_controller}
    action={gb_action}
    def_action={gb_def_action}
    />, dom);