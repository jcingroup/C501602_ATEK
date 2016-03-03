function gcseCallback() {
    if (document.readyState != 'complete')
        return google.setOnLoadCallback(gcseCallback, true);
    google.search.cse.element.render({ gname: 'gsearch', div: 'results', tag: 'searchresults-only', attributes: { linkTarget: '' } });
    var element = google.search.cse.element.getElement('gsearch');
    element.execute('this is my query');
};
window.__gcse = {
    parsetags: 'explicit',
    callback: gcseCallback
};
(function () {
    var cx = '006882016541431297896:jhlz5vusrik';
    var gcse = document.createElement('script');
    gcse.type = 'text/javascript';
    gcse.async = true;
    gcse.src = (document.location.protocol == 'https:' ? 'https:' : 'http:') +
      '//www.google.com/cse/cse.js?cx=' + cx;
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(gcse, s);
})();