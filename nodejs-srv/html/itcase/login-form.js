/* jshint esversion:6 */
$(function(){
  let login_form = null;
  let w_width = 540;
  let w_heigght = 750;

  function _f_login_open(login_form_timer) {
    let lnk =`./login/`;
    if(login_form==null || login_form.closed){
      if(login_form_timer!==undefined && login_form_timer>-1){
        window.login_form_timer=login_form_timer;
      }
      login_form = window.open(lnk, "ПО Белоруснефть - Аутентификация", `location=no,status=no,width=${w_width},height=${w_heigght}`);
      login_form.focus();
      login_form.onbeforeunload = function () { // событие при запросе закрытия окна логина
        console.log('onbeforeunload ',window.login_data);
        $('#login_info_out').html(window.login_data && window.login_data.is_login_uname.length>0?window.login_data.is_login_uname:'Авторизуйтесь');
        $._f_load_spr();
        $._f_refresh_ui_elements();
      };
      login_form.onunload = function () { // событие после закрытия окна логина
      };
    }else{
      login_form.focus();
    }
    return login_form;
  }

  document.querySelector('#bt_loginopen').addEventListener('click', function () {
    _f_login_open(3);
  });

  $('a[href="./#opensection&s=s-login"]').on('click', function () {
    _f_login_open(3);
  });


  function _f_login_close() {
    if(login_form==null || login_form.closed){
      document.querySelector('#login_info_out').innerHTML ='form not opened';
    }else{
      login_form.close();
    }
  }
  try {
    document.querySelector('#bt_loginclose').addEventListener('click', function () {
      _f_login_close();
    });
  } catch (error) {
    
  }
  
  

});