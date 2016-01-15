
interface ProductData {
    product_no?: string;
    select_id?: number;
    qty?: number;
}
interface ResultInfo {
    result: boolean;
    message: string;
    url: string;
    id: string;
}

function addCart(product_no: string) {
    let data: ProductData = {
        "product_no": product_no,
        "select_id": $("#p_select_id").val(),
        "qty": $("#p_qty").val()
    }
    $.ajax({
        type: "POST",
        url: gb_approot + 'Products/ajax_addProduct',
        data: data,
        dataType: 'json'
    }).done(function (result: ResultInfo, textStatus, jqXHRdata) {
        if (result.result) {
            $('.add-to-cart').fadeIn('slow').delay(1000).fadeOut('slow');
            $('#p_count').text(result.id);
        }
        else {
            alert(result.message);
        }
    }).fail(function (jqXHR, textStatus, errorThrown) {
        alert(errorThrown);
    });
}





