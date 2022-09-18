/*jshint esversion: 6 */
$(function () {
  
  
  $('#m_project_etaps_list').on('click','.bt-edit-etap-values', function () {
    $('.bt-edit-etap-values').parent().parent().removeClass('current-edit-row');
    $(this).parent().parent().addClass('current-edit-row');

  });

  $('li.tab>a').on('click', function() {
    $('li.tab>a').removeClass('active');
    $(this).addClass('active');
  });

  $('li.nav-tab>a').on('click', function() {
    $('li.nav-tab>a').removeClass('active');
    $(this).addClass('active');
  });

  // $('#daily_raport_br_params').

  $._f_report_graph_set_height = function () {
    let graph_offset = $('#f_report_graph_result').offset().top;
    let footer_height = $('.page-footer').outerHeight();
    $('#f_report_graph_result').css('height', `calc(100vh - ${graph_offset+footer_height+50}px)`);
  };
  $(window).resize(function () { 
    $._f_report_graph_set_height();
  });

  $('img[alt="logo"]').on('click', function () {
    window.location = "../main-raport/";
  });
  $('a[href="./#in-develop"]').on('click', function () {
    $._subjYELLOW('Доступно только из корпаративной сети!');
  });
  $('a[href="./#opensection&s=s-flot&f=none"]').on('click', function () {
    $('.equipment-list-container').addClass('hide');
  });

});