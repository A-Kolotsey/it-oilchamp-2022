$(function(){

  var login_data = {"is_login":false , "is_login_uname":"", "is_login_uid":-1};
  var is_login = false;
  var is_login_uname = '';
  var is_login_uid = 0;
  var login_form_timer = -1;
  var login_form_timer_disable = false;

  if(window.opener && window.opener.login_data!==undefined && window.opener.login_data){
    $('#ed_uname').val(window.opener.login_data.is_login_uname);
  }
  if(window.opener && window.opener.login_form_timer!==undefined && window.opener.login_form_timer>-1){
    login_form_timer = window.opener.login_form_timer;
  }

  _f_refresh_section_login = function (){
    if (is_login){
      $('.f-logout').css('display','block');
      $('.f-login').css('display','none');
      $('.lb-uname').html(is_login_uname);
      if (login_form_timer>-1) {
        setTimeout(function (){ if (!login_form_timer_disable) { window.close(); } },login_form_timer*1000);
      }
    } else {
      $('.f-login').css('display','block');
      $('.f-logout').css('display','none');
      $('.lb-uname').html('');
    }
  };

  _f_get_session_state = function (){
    $.get('./itcase-backend/session-check').then(function (d) {
      if (Array.isArray(d)) {
        login_data = d[0].respond;
        d=d[0].respond;
      }else{
        login_data = d.respond;
        d=d.respond;
      }
      if(window.opener){
        window.opener.login_data = login_data;
      }
      is_login = d.is_login;
      is_login_uname = d.is_login_uname;
      is_login_uid = d.is_login_uid;
      _f_refresh_section_login();
    }).fail(function () {
      login_data = {"is_login":false , "is_login_uname":"", "is_login_uid":-1};
      if(window.opener){
        window.opener.login_data = login_data;
      }
      is_login = false;
      is_login_uname = '';
      is_login_uid = 0;
      _f_refresh_section_login();
    });
  }; _f_get_session_state();

  var _f_sendlogin = function(uname,passw,login){
    $.post('./itcase-backend/'+login,{
      uName   : uname,
      uPassw   : passw
    }).then(function (data) { // each must be
      if (Array.isArray(data)) {
        login_data = data[0].respond;
        d=data[0].respond;
      }else{
        login_data = data.respond;
        d=data.respond;
      }
      if(window.opener){
        window.opener.login_data = login_data;
      }
      is_login = d.is_login;
      is_login_uname = d.is_login_uname;
      is_login_uid = d.is_login_uid;
      _f_refresh_section_login();
      if (!d.is_login && !d.is_login_dc) {
        $._subjRED('Имя пользователя или пароль неверены.');
      }
      if (!d.is_login && d.is_login_dc) {
        $._subjYELLOW('У вас нет прав на этом сервере.');
      }
    });
  };

  $('#bt_sendlogin').on('click',function(){
    var uname = ($('#ed_uname').val() || 'ANONIMOUS');
    var passw = ($('#ed_passw').val() || '');
    var d={};
    if (uname=='ANONIMOUS' || passw=='') {
      $._subjRED('Имя пользователя или пароль пусты.');
      return;
    }
    _f_sendlogin(uname,passw,'login');
  });

  $('#bt_sendlogin_guest').on('click',function () {
    // _f_sendlogin('ANONIMOUS','','login');
    $._subjBLUE(`
      <div>
        <p><b>Для тестирования созданы пользователи:</b></p>
        <label>&nbsp</label>
        <p>Со стороны организации заказчика</p>
        <p>Имя пользователя: <b>corp_user</b></p>
        <p>Пароль: <b>corp</b></p>
        <p>Имя пользователя: <b>corp_user2</b></p>
        <p>Пароль: <b>corp</b></p>
        <label>&nbsp</label>
        <p>Со стороны подрядной организации</p>
        <p>Имя пользователя: <b>contr_user</b></p>
        <p>Пароль: <b>contr</b></p>
        <p>Имя пользователя: <b>contr_user2</b></p>
        <p>Пароль: <b>contr</b></p>
      </div>
    `,30000);
  });

  $('#bt_sendlogout').on('click',function(){
    $.get('./itcase-backend/logout').then(function (d) {
      if(window.opener){
        window.opener.login_data = {"is_login":false , "is_login_uname":"", "is_login_uid":-1};
      }
      is_login = d.is_login;
      is_login_uname = d.is_login_uname;
      _f_refresh_section_login();
    });
  });



});