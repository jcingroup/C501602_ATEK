// 判斷是否為行動裝置
var browser={
versions:function(){
var u = navigator.userAgent, app = navigator.appVersion;
return {
            android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android终端或者uc浏览器
            iPhone: u.indexOf('iPhone') > -1 || u.indexOf('Mac') > -1, //是否为iPhone或者QQHD浏览器
            iPad: u.indexOf('iPad') > -1 //是否iPad
        };
    }()
}


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

// 行動裝置的子選單
var dropbtn = $("[data-dropdown='btn']");
var dropcontent = $("[data-dropdown='content']");
if(browser.versions.iPad || browser.versions.iPhone || browser.versions.android) {
    $(dropcontent).hide();
    $(dropbtn).click(function(event) {
        $(dropbtn).not(this).removeClass('active').siblings(dropcontent).slideUp();
        $(this).toggleClass('active').siblings(dropcontent).slideToggle();
        event.preventDefault();
    });
} else {
    var subW = ($("#menu dl").width() + 24) * $("#menu dl").length;
    $(".sub-nav").width(subW);
}

// 行動裝置的產品分類選單
$(".pro-menu").click(function() {
    $(this).toggleClass("active");
    $('#sidebar nav').toggleClass('open');
});

// 語系下拉選單
$(".dropbtn").click(function(){
    $(this).next().slideToggle("300");
});
$(".dropbtn").blur(function(){
    $(this).next().slideUp("300");
});

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
