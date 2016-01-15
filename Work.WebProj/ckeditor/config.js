CKEDITOR.editorConfig = function (config) {
    // Define changes to default configuration here. For example:
    config.language = 'zh';
    // config.uiColor = '#AADC6E';

    config.contentsCss = ['../../Content/css/editor.css'];
    config.toolbar = [
        { name: "document", items: ["Source", "-"] },
        { name: "tools", items: ["Maximize", "-"] },
        {
            name: "clipboard",
            items: ["Cut", "Copy", "Paste", "PasteText", "PasteFromWord", "Undo", "Redo"]
        },
        { name: "links", items: ["Link", "Unlink", "Anchor"] },
        {
            name: 'insert',
            items: ['Image', 'Table', 'HorizontalRule', 'Smiley', 'SpecialChar', 'PageBreak', 'Iframe']
        },
        {
            name: "basicstyles",
            items: ["FontSize", "Bold", "Underline", "Strike", "-", "JustifyLeft", "JustifyCenter", "JustifyRight", "-", "RemoveFormat"]
        },
        { name: "paragraph", items: ["NumberedList", "BulletedList", "-", "Outdent", "Indent"] },
        { name: "colors", items: ["TextColor", "BGColor"] },
        { name: "styles", items: ["Styles", "Format"] },
        { name: "editing" }
    ];
    config.filebrowserBrowseUrl = "../../ckfinder/ckfinder.html";
    config.filebrowserImageBrowseUrl = "../../ckfinder/ckfinder.html?type=Images";
    config.filebrowserImageUploadUrl = "../../ckfinder/core/connector/aspx/connector.aspx?command=QuickUpload&type=Images";
    config.autoUpdateElement = true;
};