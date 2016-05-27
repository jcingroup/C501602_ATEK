namespace ContactUs {
    interface ContactData {
        title: string,
        name: string,
        company: string,
        tel: string,
        fax: string,
        email: string,
        content: string,
        country: string,
        response: string
    }
    interface LoginResult {
        result: boolean;
        message: string;
        url: string;
    }
    $("#ContactUsInfo").submit(function (event) {
        event.preventDefault();
        let data: ContactData = {
            "title": $("#m_title").val().replace(/<|>/g, ""),
            "name": $("#m_name").val().replace(/<|>/g, ""),
            "company": $("#m_company").val().replace(/<|>/g, ""),
            "tel": $("#m_tel").val().replace(/<|>/g, ""),
            "fax": $("#m_fax").val(),
            "email": $("#m_email").val().replace(/<|>/g, ""),
            "content": $("#m_content").val().replace(/<|>/g, ""),
            "country": $("#m_country").val().replace(/<|>/g, ""),
            "response": $("#g-recaptcha-response").val()
        };

        $.ajax({
            type: "POST",
            url: gb_approot + 'ContactUs/sendMail',
            data: data,
            dataType: 'json'
        }).done(function (result: LoginResult, textStatus, jqXHRdata) {
            alert(result.message);
            grecaptcha.reset(widgetId);
        }).fail(function (jqXHR, textStatus, errorThrown) {
            alert(errorThrown);
        });
    });


}

