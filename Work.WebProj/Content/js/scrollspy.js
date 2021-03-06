$(document).ready(function () {

    $(document).on("scroll", onScroll);

    //smoothscroll
    $('a[href*="#"]').on('click', function (e) {
        e.preventDefault();
        var check_exit = $(this).attr("data-exist");
        if (check_exit == 1) {
            $(document).off("scroll");

            $('a').each(function () {
                $(this).removeClass('active');
            })
            $(this).addClass('active');

            var target = this.hash,
                menu = target,
                topMenuHeight = $("#sub-nav").outerHeight() + 88;

            $target = $(target);
            $('html, body').stop().animate({
                'scrollTop': $target.offset().top + 15
            }, 500, 'swing', function () {
                window.location.hash = target;
                $(document).on("scroll", onScroll);
            });
        } else {
            //console.log($(this).attr('href'),this.href);
            //var href = this.href.split("#")[0];
            //location.href = this.href;
            
            $(document).off("scroll");

            $('a').each(function () {
                $(this).removeClass('active');
            })
            $(this).addClass('active');

            var target = this.hash,
                menu = target,
                topMenuHeight = $("#sub-nav").outerHeight() + 88;

            $target = $(target);
            $('html, body').stop().animate({
                'scrollTop': $target.offset().top + 15
            }, 500, 'swing', function () {
                window.location.hash = target;
                $(document).on("scroll", onScroll);
            });
        };
    });

    function onScroll(event) {
        var scrollPos = $(document).scrollTop();
        $('#sub-nav a').each(function () {
            var currLink = $(this);
            var refElement = $(currLink.attr("href"));
            if (refElement.position().top <= scrollPos && refElement.position().top + refElement.height() > scrollPos) {
                $(this).removeClass("active");
                currLink.addClass("active");
            }
            else {
                currLink.removeClass("active");
            }
        });
    }
})