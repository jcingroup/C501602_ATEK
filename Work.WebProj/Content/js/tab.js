// 頁籤切換
var $tab = $('.js-tab');
// 偵測網址是否有錨點，錨點所指的那篇消息要打開
if (window.location.hash) {
    var hash = window.location.hash;
    $($('a[href=' + hash + ']').addClass('active').parent().find('a').attr('href')).find('.tab-content').hide();//隱藏其他content
} else {
    // 進入時預設點擊第一個頁籤，除了第一個 content 其他 content 隱藏
    $($tab.eq(0).addClass('active').find('a').attr('href')).find('.tab-content').hide();
}
$(window).on('hashchange', function () {
    var hash = window.location.hash;
    $($('a[href=' + hash + ']').parent().find('a').attr('href')).fadeIn().find('.tab-content').hide();
    $($('a[href=' + hash + ']').addClass('active').find('.active').removeClass('active');
});
$tab.click(function (event) {
    event.preventDefault();
    $($(this).find('a').attr('href')).fadeIn().find('.tab-content').hide();
    $(this).addClass('active').find('.active').removeClass('active');
});