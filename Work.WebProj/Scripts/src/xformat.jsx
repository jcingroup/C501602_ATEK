var a = (
<div style={color:red}>
    <ul className="breadcrumb">
        <li><i className="fa-list-alt"></i> {this.props.menuName}</li>
    </ul>
    <h4 className="title"> { this.props.caption } 基本資料維護</h4>
    <form className="form-horizontal" onSubmit={this.handleSubmit}>

        <div className="col-xs-12">
            <div className="alert alert-warning">
                <p><strong className="text-danger">紅色標題</strong> 為必填欄位。</p>
            </div>
        </div>

        <div className="col-xs-6">
            <div className="form-group">
                <label className="col-xs-2 control-label text-danger">品號</label>
                <div className="col-xs-10">
                    <input type="text"
                           className="form-control"
                           onChange={this.changeFDValue.bind(this, 'product_no' ) }
                           value={fieldData.product_no}
                           disabled={this.state.edit_type ==2}
                           maxLength={256}
                           required />
                </div>
            </div>

            <div className="form-group">
                <label className="col-xs-2 control-label text-danger">品名</label>
                <div className="col-xs-10">
                <input type="text"
                       className="form-control"
                       onChange={this.changeFDValue.bind(this, 'product_name' ) }
                       value={fieldData.product_name}
                       maxLength={256}
                       required />
                </div>
            </div>

            <div className="form-group">
            <label className="col-xs-2 control-label text-danger">單價</label>
            <div className="col-xs-10">
            <input type="number"
                   className="form-control"
                   onChange={this.changeFDValue.bind(this, 'price' ) }
                   value={fieldData.price}
                   required />
            </div>
            </div>

            <div className="form-group">
                <label className="col-xs-2 control-label text-danger">KV</label>
                <div className="col-xs-10">
                    <input type="number"
                           className="form-control"
                           onChange={this.changeFDValue.bind(this, 'kvalue' ) }
                           value={fieldData.kvalue}
                           required />
                </div>
            </div>

            <div className="form-group">
                <label className="col-xs-2 control-label text-danger">產品分類</label>
                <div className="col-xs-10">
                    <select className="form-control"
                            value={fieldData.product_category_id}
                            onChange={this.changeFDValue.bind(this, 'product_category_id' ) }>
                        {
                        this.state.category_option.map((itemData, i) =>
                    <option key={itemData.product_category_id} value={itemData.product_category_id.toString() }>{itemData.category_name}</option>
                        )
                        }
                    </select>
                </div>
            </div>

            <div className="form-group">
                <label className="col-xs-2 control-label text-danger">規格</label>
                <div className="col-xs-10">
                <textarea className="form-control"
                          onChange={this.changeFDValue.bind(this, 'standard' ) }
                          value={fieldData.standard} />
                </div>
            </div>
        </div>

        <div className="col-xs-6">
            <div className="form-group">
                <label className="col-xs-2 control-label text-danger">圖檔上傳</label>
                <div className="col-xs-10">
							<MasterImageUpload FileKind="Photo1"
                                               MainId={fieldData.流水號}
                                               ParentEditType={this.state.edit_type}
                                               url_upload={gb_approot + 'Sys_Active/Active/aj_FUpload' }
                                               url_list={gb_approot+'Sys_Active/Active/aj_FList'}
                                               url_delete={gb_approot+'Sys_Active/Active/aj_FDelete'} />
                </div>
            </div>
        </div>
        <div className="col-xs-12">
            <div className="form-action">
                <div className="col-xs-12">
                    <button type="submit" className="btn-primary"><i className="fa-check"></i> 儲存</button> { }
                    <button type="button" onClick={this.noneType}><i className="fa-times"></i> 回前頁</button>
                </div>
            </div>
        </div>
    </form>
</div>
)