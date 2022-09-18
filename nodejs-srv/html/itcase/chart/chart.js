/* jshint esversion:6*/
$(function () {


  var chartjs;
  let r_g_data = [];
  let chart_filename = window.location.search.replace('?','');

  const _f_data_time_normalize = function (dt) {
    return `${new Date(dt).toLocaleDateString()} ${new Date(dt).toLocaleTimeString().slice(0, 5)}`;
  };

  const _f_report_graph_set_height = function () {
    let graph_offset = $('#f_report_graph_result').offset().top;
    let footer_height = $('.page-footer').outerHeight();
    $('#f_report_graph_result').css('height', `calc(100vh - ${graph_offset+footer_height+50}px)`);
  };

  const _f_report_graph_load_skv_data = function (chart_source) {
    _f_report_graph_set_height();


    $.getJSON(chart_source).then(function (data) {
      // console.table(data);
      $('.chart-list-container').empty();
      r_g_data = data;
      r_g_data.forEach((el,i) => {
        if (el.sensor_data !== null) {
          $('.chart-list-container').append(`
          <li data-sensor_index="${i}" class="tab">
            <a >${el.name_eq} ${el.model_eq}: ${el.name_sensor}</a>
          </li>`);
        }

      });
      // $._subjBLUE('Данные добавлены');
    });
  };

  _f_report_graph_load_skv_data(chart_filename);


  const _f_report_graph_paint = function (data, sensor_index,chart_points) {
    let chart_datasets_filtred = [], dt_list = [], chart_data = [];
    let sensor = data[sensor_index];
    function chart_paint(dt_list, chart_datasets_filtred) {
      if (chartjs) {
        $('#chart_report_graph_out').remove();
        $('#f_report_graph_result').append($('<canvas>', { id: 'chart_report_graph_out' }));
      }
      let ctx = document.getElementById('chart_report_graph_out').getContext('2d');
      chartjs = new Chart(ctx, {
        type: 'line',
        data: {
          labels: dt_list,
          datasets: chart_datasets_filtred
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              min: 0,
              ticks: {
                stepSize: 1
              }
            }
          },
          responsive: true,
          interaction: {
            intersect: false,
            mode: 'index',
          },
          plugins: {
            legend: {
              labels: {
                usePointStyle: true,
              },
              position: 'top'
            },
            title: {
              font: {
                size: 22,
                family: 'tahoma',
                weight: 'normal'
              },
              display: true,
              text: ``
            },
            tooltip: {
              callbacks: {
                footer: '',
              }
            }
          },
          maintainAspectRatio: false
        }
      });
    }

    let statr_point = sensor.sensor_data.length-chart_points;
    sensor.sensor_data.forEach((el,i) => {
      if (i>=statr_point) {
        dt_list.push(_f_data_time_normalize(el.date_val));
        chart_data.push(parseFloat(el.val));
      }
    });

    let color = '#66BB6A';
    chart_datasets_filtred.push({
      label: (sensor.name_sensor || 'Прочее'),
      data: [...chart_data],
      borderColor: [color],
      /*backgroundColor: [color],*/
      borderWidth: 3,
      hidden: false,
      key: 1
    });

    chart_paint(dt_list, chart_datasets_filtred);

  };


  $('.chart-list-container').on('click','li.tab', function () {
    let sensor_index = parseInt(this.dataset.sensor_index);
    let chart_points = $('#ed_chart_points').val();
    _f_report_graph_paint(r_g_data, sensor_index,chart_points);
  });

  $('.btn-close').on('click', function () {
    window.close();
  });

});
