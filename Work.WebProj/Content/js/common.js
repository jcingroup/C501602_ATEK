$(window).scroll(function(){
    // 沒有卷軸時不出現 goTop 按鈕
    if ($(this).scrollTop() > 100) {
        $('.goTop').fadeIn();
    } else {
        $('.goTop').fadeOut(500);
    }

    // 左選單在卷動時固定位置
    var sticky = $('#sidebar'),
        scroll = $(window).scrollTop();

    if (scroll >= 200) sticky.addClass('fixed');
    else sticky.removeClass('fixed');
});

// 點選後跳到 href 指向的位置
$('.scroll, .scroll a').click(function () {
    $('html, body').animate({
        scrollTop: $($.attr(this, 'href')).offset().top
    }, 750);
    return false;
});

$(document).ready(function() {
    // 行動裝置的主選單
    $menuLeft = $('#menu');
    $trigger = $('.menu-trigger');

    $trigger.click(function() {
        $(this).toggleClass('active');
        $('body').toggleClass('push');
    });
    $('.toggle').click(function() {
        $('body').removeClass('push');
    });

    // 行動裝置的產品分類選單
    // $(".pro-menu").click(function() {
    //     $(this).toggleClass("active");
    //     // $('aside nav').slideToggle(750);
    //     $('aside nav').toggleClass('open');
    // });

    // 下拉選單
    $(".dropbtn").click(function(){
        $(".dropdown-content").toggle("300");
    });
});
