/*jshint esversion:6*/
$(function () {
  // !!! GLOBAL VARS
  var last_action = new Date();
  const origin_cli = location.origin + location.pathname;
  const nodejs = { main: origin_cli + '/itcase-backend/', public: origin_cli + '/itcase-backend/' };//
  window.is_login = false;

  
  $._f_do_action = function (url) {

    $.getJSON(nodejs.main + 'session-alive').then(function (data) {
      let d;
      if (Array.isArray(data)) {
        d = data[0].respond;
      } else {
        d = data.respond;
      }
      window.is_login = d.is_login;
      window.is_login_uname = d.is_login_uname;
      window.is_login_uid = d.is_login_uid;
      if (!window.is_login) { $._subjYELLOW('Авторизуйтесь!'); $._f_refresh_section_login(); }
      if ('login' in url) {
        $._f_do_login($('#ed_uname').val(), $('#ed_passw').val());
      }
      if ('logout' in url) {
        $._f_do_logout();
      }
      if ('opensection' in url) {
        $('.section').css('display', 'none');
        $('.' + (window.is_login ? url.s : 's-login')).css('display', 'block');
        $('main').attr('activesection', (window.is_login ? url.s : 's-login'));
        if (window.is_login && url.f !== undefined && url.f.length !== 0) {
          $(`.${url.s} > .form`).css('display', 'none');
          $(`.${url.s} > .${url.f}`).css('display', 'block');
        }
      }
    });

  };
  

  $._f_do_login = function (uname, passw) {
    if (uname.length < 1 || passw.length < 1) {
      $._subjRED('Вы чтото не ввели.');
      return;
    }
    $.post(nodejs.main + 'login', {
      uName: uname,
      uPassw: passw
    }).then(function (data) {
      let d;
      if (Array.isArray(data)) {
        d = data[0].respond;
      } else {
        d = data.respond;
      }
      window.is_login = d.is_login;
      window.is_login_uname = d.is_login_uname;
      window.is_login_uid = d.is_login_uid;
      $._f_refresh_section_login();
    }).fail(function () { ///!!!!!!!!!!!!!!!!!
      window.is_login = false;
      window.is_login_uname = '';
      window.is_login_uid = 0;
      $._f_refresh_section_login();
    });
  };
  $._f_do_logout = function () {
    $.getJSON(nodejs + 'logout').then(function (d) {
      // window.is_login = d.is_login;
      // window.is_login_uname = d.is_login_uname;
      // window.is_login_uid = d.is_login_uid;
      window.is_login = false;
      window.is_login_uname = '';
      window.is_login_uid = 0;
      $._f_refresh_section_login();
    });
  };
  $._f_get_login = function () {

    $.getJSON(nodejs.main + 'session-alive').then(function (data) {
      let d;
      if (Array.isArray(data)) {
        d = data[0].respond;
      } else {
        d = data.respond;
      }
      window.is_login = d.is_login;
      window.is_login_uname = d.is_login_uname;
      window.is_login_uid = d.is_login_uid;
      $._f_refresh_section_login();
    }).fail(function () { //!!!!!!!!!!!!!!!!!!!!!!!
      window.is_login = false;
      window.is_login_uname = '';
      window.is_login_uid = 0;
      $._f_refresh_section_login();
    });
  };
  $._f_get_login();
  $._f_get_session_state = function () {
    $.getJSON(nodejs.main + 'session-check').then(function (data) {
      let d;
      if (Array.isArray(data)) {
        d = data[0].respond;
      } else {
        d = data.respond;
      }
      window.is_login = d.is_login;
      window.is_login_uname = d.is_login_uname;
      window.is_login_uid = d.is_login_uid;
      // $._f_refresh_section_login();
      return $;
    }).fail(function () {
      window.is_login = false;
      window.is_login_uname = '';
      window.is_login_uid = 0;
      // $._f_refresh_section_login();
      return $;
    });
  };
  $._f_refresh_session = function () {
    $.getJSON(nodejs.main + 'session-alive').then(function (data) {
      let d;
      if (Array.isArray(data)) {
        d = data[0].respond;
      } else {
        d = data.respond;
      }
      window.is_login = d.is_login;
      window.is_login_uname = d.is_login_uname;
      window.is_login_uid = d.is_login_uid;
      window.login_data=d;
      $._f_refresh_ui_elements();
    }).fail(function () {
      window.is_login = false;
      window.is_login_uname = '';
      window.is_login_uid = 0;
      window.login_data={};
    });
  };

  $._f_refresh_section_login = function () {
    if (window.is_login) {
      $('.f-logout').css('display', 'block');
      $('.f-login').css('display', 'none');
      $('.lb-uname').html(window.is_login_uname);
      // todo: hide/show sections and forms
      $._f_refresh_ui_elements();
    } else {
      $('.f-login').css('display', 'block');
      $('.f-logout').css('display', 'none');
      $('.lb-uname').html('');
    }
  };
  $._f_refresh_section_login();
  $._f_is_login = function () {
    if (!window.is_login) {
      $._subjYELLOW('Авторизуйтесь!');
    }
    return (window.is_login);
  };

  $._f_refresh_ui_elements = function () {
    let ui_ellements = document.querySelectorAll('[data-ui_element]');
    let interface = window?.login_data?.interface;
    ui_ellements.forEach(el => {
      if (interface) {
        let ui_element= el.dataset.ui_element;
        let state = interface.find(ui_el=>{return ui_el.section===ui_element;});
        if (state!==undefined) {
          el.classList.remove("hide");
        } else {
          el.classList.add("hide");
        }
      } else {
        el.classList.add("hide");
      }
    });
  };

  // var last_check_session = new Date();
  // setInterval(function () { /// extend session lifetime
  //   if (last_action > last_check_session) {
  //     last_check_session = new Date();
  //     $._f_refresh_session();
  //   } else {
  //     $._f_get_session_state();
  //     $._f_is_login();
  //   }
  // }, 30000);

  setInterval(function () { /// extend session lifetime
      $._f_refresh_session();
  }, 30000);

  $(document).ready(function () {
    $._f_refresh_session();
  });

});