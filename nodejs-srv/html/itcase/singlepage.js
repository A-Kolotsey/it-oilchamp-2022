$(function () {

  $._f_parse_url = function (url){
    let in_url = {};
    let in_url_str = url.replace('?','').replace('#','').split('&');
    $.each(in_url_str,function (key,val) {
      let v = val.split('=');
      if (v[0]!=='') {
        in_url[v[0]]=v[1];
      }
    });
    $._f_do_action(!in_url?url:in_url);
  };
  $._f_parse_url(window.location.search.length<1?window.location.hash:window.location.search);

  $('a[href]').on('click',function (e) {
    // if (e.target.search===undefined & e.target.hash===undefined){return;}
    // if (e.target.search.length<1&e.target.hash.length<1){return;}

    // if (e.target.search && e.target.search.length>0) {
    //   $._f_parse_url(e.target.search);
    // }else if (e.target.hash) {
    //   $._f_parse_url(e.target.hash);
    // }
    $._f_parse_url(e.target.search.length<1?e.target.hash:e.target.search);
    e.preventDefault();
  });
  
  $(window).on('hashchange',function (e) {
    // if (e.currentTarget.location.hash.length<1){return;}
    // if (e.target.search && e.target.search.length>0) {
    //   $._f_parse_url(e.target.search);
    // }else if (e.target.hash) {
    //   $._f_parse_url(e.target.hash);
    //   // e.currentTarget.location.hash = '';
    // }
    $._f_parse_url(e.currentTarget.location.hash);
    e.preventDefault();
  });

});