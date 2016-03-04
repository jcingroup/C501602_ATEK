namespace Search {
    interface BasicData {
        keyword: string,
    }
    $("#Search").submit(function (event) {
        event.preventDefault();
        let keyword: string = $("#m_keyword").val().replace(/<|>/g, "")

        if (keyword != null) {
            if (keyword.trim() == '') {
                alert('搜尋內容不可空白');
                return;
            }
        } else if (keyword == null) {
            alert('搜尋內容不可空白!');
            return;
        }
        if (keyword.length < 2) {
            alert('搜尋條件請輸入兩個字(含兩個字)以上!');
            return;
        }
        document.location.href = gb_approot + 'Search?keyword=' + keyword;

    });
}

