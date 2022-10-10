/* jshint esversion:6 */
$(function () {
  var flot_report_timing_data;

  const _f_data_time_normalize = function (dt) {
    return `${new Date(dt).toLocaleDateString()} ${new Date(dt).toLocaleTimeString().slice(0, 5)}`;
  };

  const _f_prepare_chart_data = function (data) {

    var options = {
      series: data,
      chart: {
        height: 350,
        type: 'rangeBar'
      },
      plotOptions: {
        bar: {
          horizontal: true,
          barHeight: '50%',
          rangeBarGroupRows: true
        }
      },
      colors: [
        "#008FFB", "#00E396", "#FEB019", "#FF4560", "#775DD0",
        "#3F51B5", "#546E7A", "#D4526E", "#8D5B4C", "#F86624",
        "#D7263D", "#1B998B", "#2E294E", "#F46036", "#E2C044"
      ],
      fill: {
        type: 'solid'
      },
      xaxis: {
        type: 'datetime'
      },
      legend: {
        position: 'bottom'
      },
      tooltip: {
        custom: function (opts) {
          const dt_from = new Date(opts.y1).toISOString();
          const dt_to = new Date(opts.y2).toISOString();
          const values = opts.ctx.rangeBar.getTooltipValues(opts);

          return (
            `${values.seriesName}${_f_data_time_normalize(dt_from)} - ${_f_data_time_normalize(dt_to)}`
          );
        }
      }
    };


    _f_create_chart(options);
  };


  const _f_create_chart = function (options) {

    var chart = new ApexCharts(document.querySelector("#chart"), options);
    chart.render();
  };

  const _f_prepare_flot_info = function(flot_info){
    $('#lb_name_flot').html(flot_info.name_flot);
    $('#lb_title').html(flot_info.title);
    $('#lb_model_flot').html(flot_info.model_flot);
  };



  $(document).ready(function () {
    flot_report_timing_data = window.flot_report_timing_data;
    if (flot_report_timing_data === undefined || flot_report_timing_data.lenght === 0) {
      flot_report_timing_data = window.opener.flot_report_timing_data;
      if (flot_report_timing_data === undefined || flot_report_timing_data.chart_data === undefined || flot_report_timing_data.chart_data === null) {
        $._subjRED(`chart_data is empty!`);
        return;
      }
    }

    _f_prepare_flot_info(flot_report_timing_data.flot_info);
    _f_prepare_chart_data(flot_report_timing_data.chart_data);
  });


  $('.btn-close').on('click', function () {
    window.close();
  });

});