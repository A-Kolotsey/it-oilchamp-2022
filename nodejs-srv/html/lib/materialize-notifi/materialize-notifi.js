/*jshint esversion:6*/

$(function () {

  $(document).ready(function () {
    $('body').append('<div class="subj-bar"><div class="subj"></div></div>');
    $('.subj-bar').on('click','.btn-close-msg', function () {
      let uniqid = this.dataset.uniqid;
      $('#' + uniqid).fadeOut('slow', function () {});
    });
  });
  ////////////////////////////////////////////////////// subjects message

  subj = function (msgstr, color, livetime) {
    var uniqid = 'message_' + Date.now();
    var container = '<div class="materialize-notifi-message" id=' + uniqid + '></div>';
    var msghtml = '<div class="card ' + color + ' lighten-4">' +
      '<div class="card-content ' + color + '-text">' +
      '<p>' + msgstr + '</p></div></div>';

    $('.subj').append(container);
    $('#' + uniqid).hide().html(msghtml).fadeIn('slow');
    $(`#${uniqid}`).append(`<div class="btn-close-msg material-icons ${color} lighten-4 ${color}-text" data-uniqid="${uniqid}">close</div>`);
    setTimeout(function () {
      $('#' + uniqid).fadeOut('slow', function () {});
    }, livetime);
  };

  $._subjRED = function (msgstr, livetime) {
    subj(msgstr, 'red', livetime || 10000);
  };
  $._subjGREEN = function (msgstr, livetime) {
    subj(msgstr, 'green', livetime || 10000);
  };
  $._subjBLUE = function (msgstr, livetime) {
    subj(msgstr, 'blue', livetime || 10000);
  };
  $._subjYELLOW = function (msgstr, livetime) {
    subj(msgstr, 'orange', livetime || 10000);
  };

  //////////////////////////////////////////////////////


  ////////////////////////////////////////////////////// query message

  query = function (msgstr, color) {
    return new Promise((resolve, reject) => {

      var uniqid = 'message_' + Date.now();
      var container = '<div class="materialize-notifi-message" id=' + uniqid + '></div>';
      var msghtml = '<div class="card ' + color + ' lighten-4">' +
        '<div class="card-content ' + color + '-text">' +
        '<p>' + msgstr + '</p><div class="card-btn center"></div></div></div>';

      var button_yes = document.createElement("button");
      button_yes.textContent = `done`;
      button_yes.classList.add("btn");
      button_yes.classList.add("material-icons");
      button_yes.classList.add("btn-yes");
      button_yes.classList.add(color);
      button_yes.classList.add('lighten-2');
      button_yes.onclick = function () {
        resolve(true);
        $('#' + uniqid).fadeOut('slow', function () {});
      };

      var button_no = document.createElement("button");
      button_no.textContent = "close";
      button_no.classList.add("btn");
      button_no.classList.add("material-icons");
      button_no.classList.add("btn-no");
      button_no.classList.add(color);
      button_no.classList.add('lighten-2');
      button_no.onclick = function () {
        resolve(false);
        $('#' + uniqid).fadeOut('slow', function () {});
      };

      $('.subj').append(container);
      $('#' + uniqid).hide().append(msghtml).fadeIn('slow');
      $(`#${uniqid} .card-btn`).append(button_yes).append(button_no);

    });
  };

  $._queryRED = function (msgstr) {
    return new Promise((resolve, reject) => {
      query(msgstr, 'red').then(function (resp) {
        resolve(resp);
      }).catch(function (err) {
        reject(err);
      });
    });
  };

  $._queryGREEN = function (msgstr) {
    return new Promise((resolve, reject) => {
      query(msgstr, 'green').then(function (resp) {
        resolve(resp);
      }).catch(function (err) {
        reject(err);
      });
    });
  };

  $._queryBLUE = function (msgstr) {
    return new Promise((resolve, reject) => {
      query(msgstr, 'blue').then(function (resp) {
        resolve(resp);
      }).catch(function (err) {
        reject(err);
      });
    });
  };

  $._queryYELLOW = function (msgstr) {
    return new Promise((resolve, reject) => {
      query(msgstr, 'orange').then(function (resp) {
        resolve(resp);
      }).catch(function (err) {
        reject(err);
      });
    });
  };

  //////////////////////////////////////////////////////


});