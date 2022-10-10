/* jshint esversion:6 */
$(function () {
  var report_company_rating_data;

  const _f_data_time_normalize = function (dt) {
    return `${new Date(dt).toLocaleDateString()} ${new Date(dt).toLocaleTimeString().slice(0, 5)}`;
  };

  const _f_prepare_chart_data = function (data) {

    var options = {
      series: [{
        data: data.chart_data
      }],
        chart: {
        type: 'bar',
        height: 350
      },
      plotOptions: {
        bar: {
          borderRadius: 4,
          horizontal: true,
        }
      },
      dataLabels: {
        enabled: false
      },
      xaxis: {
        categories: data.chart_categories,
      }
    };


    _f_create_chart(options);
  };


  const _f_create_chart = function (options) {

    var chart = new ApexCharts(document.querySelector("#chart"), options);
    chart.render();
  };

  const _f_prepare_info = function(info){
    $('#lb_name_company').html(info);
  };



  $(document).ready(function () {
    report_company_rating_data = window.report_company_rating_data;
    if (report_company_rating_data === undefined || report_company_rating_data.lenght === 0) {
      report_company_rating_data = window.opener.report_company_rating_data;
      if (report_company_rating_data === undefined || report_company_rating_data.chart_data === undefined || report_company_rating_data.chart_data === null) {
        $._subjRED(`chart_data is empty!`);
        return;
      }
    }

    _f_prepare_info(report_company_rating_data.company_info);
    _f_prepare_chart_data(report_company_rating_data);
  });


  $('.btn-close').on('click', function () {
    window.close();
  });

});