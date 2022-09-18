/*jshint esversion: 6 */
$(function () {

  $("#cb_dty [value='" + (new Date().getFullYear().toString()) + "']").attr("selected", "selected");
  $("#cb_dtm [value='" + ("0" + ((new Date().getMonth() + 1).toString())).slice(-2) + "']").attr("selected", "selected");

  $("#cb_disp_dty [value='" + (new Date().getFullYear().toString()) + "']").attr("selected", "selected");
  $("#cb_disp_dtm [value='" + ("0" + ((new Date().getMonth() + 1).toString())).slice(-2) + "']").attr("selected", "selected");

  $('.ed-date').val('2022-05-05');
  // $('.ed-date').val(
  //     ((new Date().getFullYear().toString()))+"-"+
  //     (("0" + ((new Date().getMonth()+1).toString())).slice(-2))+"-"+
  //     (("0" + (new Date().getDate().toString())).slice(-2)));

  // $('select').formSelect();
  $('.modal').modal();
  $('.sidenav').sidenav();
  $('.sidenav').on('click', function name() {
    $('.sidenav').sidenav('close');
  });
  // $(document).on('ready', function () {
  // });
  $('.fixed-action-btn').floatingActionButton({hoverEnabled: false});

  $('#cb_opt_contr_cli_list').chosen({ width: "100%" });




});