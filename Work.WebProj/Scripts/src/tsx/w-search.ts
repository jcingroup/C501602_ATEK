namespace Search {
    interface BasicData {
        keyword: string,
    }
    $("#Search").submit(function (event) {
        event.preventDefault();
        let keyword: string = $("#m_keyword").val().replace(/<|>/g, "")

        if (keyword != null) {
            if (keyword.trim() == '') {
                alert('Not be empty!');
                return;
            }
        } else if (keyword == null) {
            alert('Not be empty!');
            return;
        }
        if (keyword.length < 2) {
            alert('Inputting at least two or more!');
            return;
        }
        document.location.href = gb_approot + 'Search?keyword=' + keyword;

    });
}

