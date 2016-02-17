CKEDITOR.editorConfig = function (config) {
    // Define changes to default configuration here. For example:
    config.language = 'zh';
    // config.uiColor = '#AADC6E';

    //config.contentsCss = ['../../Content/css/editor.css'];
    config.extraPlugins = 'youtube';
    config.extraAllowedContent = 'ul(*);';
    config.toolbar = [
        { name: "document", items: ["Source", "-"] },
        { name: "tools", items: ["Maximize", "-"] },
        {
            name: "basicstyles",
            items: ["FontSize", "Bold", "Underline", "Strike", "-", "JustifyLeft", "JustifyCenter", "JustifyRight", "-", "RemoveFormat"]
        },
        {
            name: "colors",
            items: ["TextColor", "BGColor"]
        },
        {
            name: "paragraph",
            items: ["NumberedList", "BulletedList", "-", "Outdent", "Indent"]
        },
        {
            name: "links",
            items: ["Link", "Unlink", "Anchor"]
        },
        {
            name: 'insert',
            items: ['Image', 'Youtube', 'Table', 'HorizontalRule', 'Smiley', 'Iframe']
        },
        {
            name: "clipboard",
            items: ["Cut", "Copy", "Paste", "PasteText", "PasteFromWord", "Undo", "Redo"]
        },
        { name: "styles", items: ["Styles", "Format"] }
        // { name: "editing" }
    ];
    config.filebrowserBrowseUrl = "../../ckfinder/ckfinder.html";
    config.filebrowserImageBrowseUrl = "../../ckfinder/ckfinder.html?type=Images";
    config.filebrowserImageUploadUrl = "../../ckfinder/core/connector/aspx/connector.aspx?command=QuickUpload&type=Images";
    config.autoUpdateElement = true;
};