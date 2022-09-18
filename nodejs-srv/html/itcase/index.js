/*jshint esversion: 6 */

$(function () {
  // !!! GLOBAL VARS

  const origin_cli = location.origin + location.pathname;
  const nodejs = { main: origin_cli + '/itcase-backend/', public: origin_cli + '/itcase-backend/' };
  const app = {}; app.corporate = 'itcase-pg-query-corporate'; app.contractor = 'itcase-pg-query-contractor'; app.basic = 'itcase-pg-query-basic';
  // 
  var dir_tender_job = [];
  var dir_flot_timing = [];
  var dir_tender_status = [];
  var dir_deal_rating = [];
  var list_tender_offer = [];




  ///########################################################
  ///######################################################## materialize css components
  ///########################################################
  var mcss = {};
  mcss.preloader = `
  <div class="preloader-wrapper small active">
    <div class="spinner-layer spinner-green-only">
      <div class="circle-clipper left">
        <div class="circle"></div>
      </div><div class="gap-patch">
        <div class="circle"></div>
      </div><div class="circle-clipper right">
        <div class="circle"></div>
      </div>
    </div>
  </div>
  `;


  ///########################################################
  $._f_data_time_normalize = function (dt) { // wrapper
    return mcss.data_time_normalize(dt);
  };
  mcss.data_time_normalize = function (dt) {
    return `${new Date(dt).toLocaleDateString()} ${new Date(dt).toLocaleTimeString().slice(0, 5)}`;
  };
  mcss.round2 = function (val) {
    return Math.round(parseFloat(val) * 100) / 100;
  };
  mcss.round2f = function (val) { //* (123456.25).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ").replace(/\./,',');
    return mcss.round2(val).toLocaleString();
  };
  mcss.rnd = function () {
    return (new Date()).toISOString().replace(/\-|\:|\./g, '');
  };
  mcss.rnd_color = function () {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  ///########################################################
  ///########################################################
  const _check_res = function (res) {
    /* обработка ошибок с сервера */
    if (Array.isArray(res)) {
      res = res[0];
    }
    if (res === undefined) {
      $._subjYELLOW('Ответ сервера пуст.');
      return (false);
    }
    if (res.is_login === false) {
      $._subjYELLOW('Авторизуйтесь!');
      return (false);
    }
    if (res.nopermission) {
      $._subjRED('У вас нет прав, на это действие!');
      return (false);
    }
    if (res.empty === true) {
      $._subjYELLOW('Ответ сервера пуст.');
      return (false);
    }
    if (res.ins === true) {
      $._subjBLUE('Данные добавлены.');
      return (false);
    }
    if (res.name == 'error') {
      $._subjRED('Критическая ошибка на сервере. Обратитесь в службу сопровождения.');
      return (false);
    }
    return (true);
  };

  ///########################################################

  const _f_get_offer = function (unc_doc_offer) {
    let offer = null;
    if (list_tender_offer.length) {
      list_tender_offer.forEach(el_td => {
        if (el_td.offer !== null) {
          el_td.offer.forEach(el_of => {
            if (el_of.unc_doc_offer === parseInt(unc_doc_offer)) {
              offer = el_of;
            }
          });
        }
      });
    }
    return offer;
  };

  ///########################################################
  ///######################################################## GLOBAL
  ///########################################################
  function getRandomColor() {
    return mcss.rnd_color();
  }


  //* load
  const backend_getJSON = function (url, request) {
    return new Promise((resolve, reject) => {
      function _f_loop_request(query_sid) {
        let loop_timer = setInterval(function () {
          $.getJSON(url.public, {
            app: 'redis-query',
            cmd: 'get-val',
            query_sid
          },
            function (data) {
              if (typeof (data) === 'object' && data.res !== undefined && data.res == 'no-val') { // no answer et
              } else if (typeof (data) == 'object' && data.err !== undefined && data.err == 'query_sid-broken') {
                clearInterval(loop_timer);
                $._subjRED('<strong>Error. broken sid!</strong>');
                reject(data);
              } else {
                clearInterval(loop_timer);
                resolve(data);
              }
            }
          );
        }, 1000);
      }

      $.getJSON(url.main, request,
        function (data) {
          if (typeof (data) == 'object' && data.query_sid !== undefined && data.query_sid) {
            _f_loop_request(data.query_sid);
          } else {
            resolve(data);
          }
        }
      ).catch((err) => {
        reject(err);
      });
    });
  };




  ///########################################################
  ///######################################################## load spr
  ///########################################################
  $._f_load_spr = function () {
    backend_getJSON(nodejs, { app: app.basic, cmd: 'get-dir-tender-job' }).then(function (data) { //* load dir_tender_job
      dir_tender_job = data.respond;
    }).catch(function (err) {
      console.log('err', err);
    });
    backend_getJSON(nodejs, { app: app.basic, cmd: 'get-dir-flot-timing' }).then(function (data) { //* load dir_flot_timing
      dir_flot_timing = data.respond;
    }).catch(function (err) {
      console.log('err', err);
    });
    backend_getJSON(nodejs, { app: app.basic, cmd: 'get-dir-tender-status' }).then(function (data) { //* load dir_tender_status
      dir_tender_status = data.respond;
    }).catch(function (err) {
      console.log('err', err);
    });
    backend_getJSON(nodejs, { app: app.basic, cmd: 'get-dir-deal-rating' }).then(function (data) { //* load dir_deal_rating
      dir_deal_rating = data.respond;
    }).catch(function (err) {
      console.log('err', err);
    });

  };

  $(document).ready(function () {
    $._f_load_spr();
  });

  ///########################################################
  ///######################################################## FLOT LIST
  ///########################################################

  /*
  * ---------- BEGIN load and show flot detail
  */
  const _f_load_and_show_flot_detail = function (unc_doc_flot) {
    //todo: load flot detail
    $._subjBLUE(`
    <p>Флот № <b>${unc_doc_flot}</b>
    </p>
      <table>
        <thead>
          <tr>
            <th><p title="">Параметр</p></th>
            <th><p title="">Значение</p></th>
            <th><p title="">Параметр</p></th>
            <th><p title="">Значение</p></th>
          </tr>
        </thead>
        <tbody>
            <tr class="blue lighten-5">
              <td>Дата и время:</td>
              <td>20.08.2022 18:45</td>
              <td>Глубина забоя:</td>
              <td>1616,39 м.</td>
            </tr>    
            <tr class="blue lighten-5">
              <td>Режим работы:</td>
              <td>Подъем</td>
              <td>Над забоем:</td>
              <td>1578,39 м.</td>
            </tr>    
            <tr class="blue lighten-5">
              <td>Положение долота:</td>
              <td>38,00 м.</td>
              <td>Обороты ротора:</td>
              <td>0,00 мин-1</td>
              
            </tr>    
            <tr class="blue lighten-5">
              <td>Нагрузка на долото:</td>
              <td>0,00 т.</td>
              <td>Кр.м на роторе:</td>
              <td>1,57 т*м.</td>
            </tr>    
            <tr class="blue lighten-5">
              <td>Давление нагнетания:</td>
              <td>0,00 атм.</td>
              <td>Тальблок:</td>
              <td>61,2 м.</td>
              
            </tr>    

          </tbody></table>
    `, 120000);
  };
  $('.flot-list-container').on('click', '.btn-flot-show-detail', function () {
    let unc_doc_flot = $(this).closest('.card-content').data('unc_doc_flot');
    _f_load_and_show_flot_detail(unc_doc_flot);
  });

  /*
  * ---------- END load and show flot detail
  */

  /*
  * ---------- BEGIN load and show flot equipment list
  */
  const _f_load_flot_equipment = function (unc_doc_flot) {
    return new Promise((resolve, reject) => {
      backend_getJSON(nodejs, { app: app.corporate, cmd: 'get-doc-equipment-and-sensor-list', unc_doc_flot }).then(function (data) { //* load flot equipment list
        //todo: check data >> _check_res(data)
        resolve(data);
      }).catch(function (err) {
        reject(err);
        console.log('err', err);
      });
    });
  };
  const _f_load_and_show_flot_equipment = function (unc_doc_flot) {
    $('.equipment-list-container').fadeOut(300);
    $('.equipment-list-container').removeClass('hide');

    _f_load_flot_equipment(unc_doc_flot).then(function (data) {
      $('.equipment-list-container').empty();
      let equipment = data.respond;
      if (equipment.empty) {
        $('.equipment-list-container').append(`
        <div class="card blue lighten-3">
          <div class="card-content black-text">
            <div class="">
              <span class="card-title">Оборудование для контроля не выбрано</span>
            </div>
          </div>
        </div>
        `);
      } else {
        equipment.forEach(el_eq => {
          let sensors = '';
          el_eq.sensors.forEach(el_sen => {
            sensors += `<a href="#!" data-unc_doc_sensor="${el_sen.unc_doc_sensor}" class="collection-item">
            <span class="badge">[-]</span>${el_sen.title} (${el_sen.short_name_unit})</a>`;
          });
          let time_lost = (el_eq.to_time_left.days || 0) < 0 || (el_eq.to_time_left.hours || 0) < 0 || (el_eq.to_time_left.minutes || 0) < 0 || (el_eq.to_time_left.seconds || 0) < 0;
          $('.equipment-list-container').append(`
          <div class="card blue lighten-3">
            <div class="card-content black-text row" data-unc_doc_equipment="${el_eq.unc_doc_equipment}">
              <div class="img-eq col s3 m3 l3">
                <img src="${el_eq.img_eq}" alt="logo">
                <p>&nbsp</p>
                <div class="btn white-text btn-eq-new-tender">Задание</div>
              </div>
              <div class="col s9 m9 l9">
                <div class="">
                  <span class="card-title">${el_eq.name_eq} ${el_eq.model_eq}</span>
                  <p>Период ТО каждые ${el_eq.range_to_h} час(ов)</p>
                  <p>Дата последнего то: ${mcss.data_time_normalize(el_eq.last_to_date)}</p>
                  <p>Дата следующего то: ${mcss.data_time_normalize(el_eq.next_to_date)}</p>
                  <p class="${time_lost ? 'white-text red' : ''}">
                  ${time_lost ? 'Просрочено' : 'Осталось'}: 
                  ${el_eq.to_time_left.days || 0} дней / ${el_eq.to_time_left.hours || 0} часов / ${el_eq.to_time_left.minutes || 0} минут</p>
                </div>
                <div class="collection">
                  ${sensors}
                </div>
              </div>
            </div>
          </div>
          `);
        });
      }
      $('.equipment-list-container').fadeIn(300);
    });
  };
  $('.flot-list-container').on('click', '.btn-flot-show-equipment', function () {
    let unc_doc_flot = $(this).closest('.card-content').data('unc_doc_flot');
    $('.flot-list-container>.card.blue.lighten-2').removeClass('lighten-2');
    $(this).closest('.card.blue').addClass('lighten-2');
    _f_load_and_show_flot_equipment(unc_doc_flot);
  });

  /*
  * ---------- END load and show flot equipment list
  */

  /*
  * ---------- BEGIN load and show flot list
  */
  const _f_load_flots_list = function () {
    return new Promise((resolve, reject) => {
      backend_getJSON(nodejs, { app: app.corporate, cmd: 'get-doc-flot-list' }).then(function (data) { //* load flots list
        //todo: check data >> _check_res(data)
        resolve(data);
      }).catch(function (err) {
        reject(err);
        console.log('err', err);
      });
    });
  };
  const _f_paint_flots_list = function (data) {
    $('.flot-list-container').empty();
    data.respond.forEach(el => {
      $('.flot-list-container').append(`
      <div class="card blue">
        <div class="card-content white-text row" data-unc_doc_flot="${el.unc_doc_flot}">
          <div class="img-flot col s3 m3 l3">
            <img src="${el.img_flot}" alt="logo">
          </div>
          <div class="col s9 m9 l9">
            <span class="card-title">${el.name_flot}</span>
            <p>Буровая установка: ${el.model_flot}</p>
            <p>${el.title}</p>
            <p>Контролируемое оборудование: -</p>
            <p>Текущий статус: -</p>
            <p>Плановый статус: - до -</p>
            <p>&nbsp</p>
            <div class="btn white-text btn-flot-show-equipment">Показать оборудование</div>
          </div>
        </div>
      </div>
      `);
    });
  };
  $('a[href="./#opensection&s=s-flot&f=none"]').on('click', function () {
    _f_load_flots_list().then(function (data) {
      _f_paint_flots_list(data);
    });
  });


  /*
  * ---------- END load and show flot list
  */

  /*
  * ---------- BEGIN save new tender
  */

  const _f_save_new_tender = function (unc_doc_equipment, unc_dir_tender_job, date_begin_job, time_h_todo_job, description_tender) {
    backend_getJSON(nodejs, { app: app.corporate, cmd: 'ins-new-tender', unc_doc_equipment, unc_dir_tender_job, date_begin_job, time_h_todo_job, description_tender }).then(function (data) { //* load flots list
      //todo: check data >> _check_res(data)
      resolve(data);
    }).catch(function (err) {
      reject(err);
      console.log('err', err);
    });
  };

  const _f_create_tender = function (unc_doc_equipment) {
    let rnd = mcss.rnd();
    let list_dit_tender_job = '';
    //todo: check dir_tender_job is empty
    dir_tender_job.forEach(el => {
      list_dit_tender_job += `<option value="${el.unc_dir_tender_job}">${el.name_tender_job}</option>`;
    });
    $._queryBLUE(`
    <p class="center">
    <h5 class="center">Укажите параметры задания<h5>
    <select class="browser-default" id="cb_unc_dir_tender_job_${rnd}">
    ${list_dit_tender_job}
    </select>
    </p>
    <div class="row">
      <div class="col s6 m6 l6">
        <label for="ed_report_byday_dt" class="active">Приступить к выполнению</label>
        <input type="datetime-local" class="ed-date" name="" id="ed_date_begin_job_${rnd}">
      </div>
      <div class="col s6 m6 l6">
        <label for="ed_report_byday_dt" class="active">Максимальный срок выполнения (час)</label>
        <input type="number" class="ed-date" name="" id="ed_time_h_todo_job_${rnd}">
      </div>
      <div class="col s12 m12 l12">
        <label for="ed_create_tender" class="active">Описание (в свободной форме)</label>
        <input type="text" id="ed_description_tender_${rnd}" value="">
      </div>
    </div>    
    `).then(function (result) {
      if (result) {
        let unc_dir_tender_job = $(`#cb_unc_dir_tender_job_${rnd}`).val();
        let date_begin_job = $(`#ed_date_begin_job_${rnd}`).val();
        let time_h_todo_job = $(`#ed_time_h_todo_job_${rnd}`).val();
        let description_tender = $(`#ed_description_tender_${rnd}`).val();

        _f_save_new_tender(unc_doc_equipment, unc_dir_tender_job, date_begin_job, time_h_todo_job, description_tender);
      } else {
        $._subjBLUE('Действие отменено!');
        reject();
      }
    });
  };
  $('.equipment-list-container').on('click', '.btn-eq-new-tender', function () {
    let unc_doc_equipment = $(this).closest('.card-content').data('unc_doc_equipment');
    _f_create_tender(unc_doc_equipment);
  });

  /*
  * ---------- END save new tender
  */

  /*
  * ---------- BEGIN select sensors for chart
  */
  const _f_refresh_create_chart_button = function () {
    let sensors = document.querySelectorAll(`.sensor-add-to-chart`);
    let unc_doc_sensor = [];
    if (sensors.length > 0) {
      $('.bt-create-sensor-chart>a>b').html(sensors.length);
      $('.bt-create-sensor-chart').removeClass('hide');
      sensors.forEach(el => {
        unc_doc_sensor.push(el.dataset.unc_doc_sensor);
      });
    } else {
      $('.bt-create-sensor-chart').addClass('hide');
    }
    return unc_doc_sensor;
  };

  $('.equipment-list-container').on('click', '.collection-item', function () {
    let unc_doc_sensor = $(this).closest('.card-content').data('unc_doc_sensor');

    if ($(this).hasClass('sensor-add-to-chart')) {
      $(this).removeClass('sensor-add-to-chart');
      $(this).children('.badge').html('[-]');
    } else {
      $(this).addClass('sensor-add-to-chart');
      $(this).children('.badge').html('[<b class="red-text">+</b>]');
    }
    _f_refresh_create_chart_button();
  });
  /*
  * ---------- END select sensors for chart
  */

  /*
  * ---------- BEGIN create and show chart
  */

  const _f_create_and_show_chart = function (unc_doc_sensor) {
    backend_getJSON(nodejs, { app: app.corporate, cmd: 'create-sensor-chart', unc_doc_sensor }).then(function (data) { //* create sensor chart
      //todo: check data >> _check_res(data)
      _f_show_chart(data.respond.chart_name);
    }).catch(function (err) {
      console.log('err', err);
    });

  };
  const _f_show_chart = function (chart_filename) {
    let chart_form = `./chart/?${chart_filename}`;
    window.open(chart_form, "Буровичок - График", `location=no,status=no`);
  };

  $('.bt-create-sensor-chart').on('click', function () {
    let unc_doc_sensor = _f_refresh_create_chart_button().toString();
    _f_create_and_show_chart(unc_doc_sensor);
  });

  /*
  * ---------- BEGIN create and show chart
  */




  ///########################################################
  ///######################################################## ОБРАБОТКА ЗАДАНИЙ - TENGER
  ///########################################################


  /*
  * ---------- BEGIN load and show tender list
  */
  const _f_load_tenders_list = function () {
    return new Promise((resolve, reject) => {
      backend_getJSON(nodejs, { app: app.basic, cmd: 'get-doc-tender-list' }).then(function (data) { //* load tenders list
        //todo: check data >> _check_res(data)
        resolve(data);
      }).catch(function (err) {
        reject(err);
        console.log('err', err);
      });
    });
  };
  const _f_paint_tenders_list = function (data) {
    $('.tender-list-container').empty();
    data.respond.forEach(el => {
      $('.tender-list-container').append(`
      <div class="card blue">
        <div class="card-content white-text row" data-unc_doc_tender="${el.unc_doc_tender}">
          <div class="img-eq col s3 m3 l3">
            <img src="${el.img_eq}" alt="logo">
          </div>
          <div class="col s9 m9 l9">
            <span class="card-title">Задание № ${el.unc_doc_tender}</span>
            <p>${el.name_eq} ${el.model_eq}</p>
            <p>Вид задания: ${el.name_tender_job}</p>
            <p>Задание объявлено: ${mcss.data_time_normalize(el.date_tender)}</p>
            <p>Максимальный срок выполнения: ${el.time_h_todo_job} часа</p>
            <p>Приступить к выполнению не позднее: ${mcss.data_time_normalize(el.date_begin_job)}</p>
            <p>Статус: ${el.name_tender_status}</p>
            <p>Задание разместил: ${el.user_name_full}</p>
            <p>&nbsp</p>
            <div class="btn white-text btn-eq-docs-tender-detail" data-description_tender="${el.description_tender}">Описание</div>
            <div class="btn white-text btn-eq-docs-new-offer">Создать ТКП</div>
          </div>
        </div>
      </div>
      `);
    });
  };
  $('a[href="./#opensection&s=s-docs&f=f-docs-tender"]').on('click', function () {
    _f_load_tenders_list().then(function (data) {
      _f_paint_tenders_list(data);
    });
  });
  $('.tender-list-container').on('click', '.btn-eq-docs-tender-detail', function () {
    let description_tender = this.dataset.description_tender;
    $._subjBLUE(description_tender, 30000);
  });

  /*
  * ---------- END load and show tender list
  */

  /*
  * ---------- BEGIN save new offer
  */
  const _f_save_new_offer = function (unc_doc_tender, subject_offer, description_offer, price_offer, time_h_offer, date_begin_offer) {
    backend_getJSON(nodejs, { app: app.contractor, cmd: 'ins-new-offer', unc_doc_tender, subject_offer, description_offer, price_offer, time_h_offer, date_begin_offer }).then(function (data) { //* load flots list
      //todo: check data >> _check_res(data)
      resolve(data);
    }).catch(function (err) {
      reject(err);
      console.log('err', err);
    });
  };

  const _f_create_offer = function (unc_doc_tender) {
    let rnd = mcss.rnd();
    $._queryBLUE(`
    <p class="center">
    <h5 class="center">Укажите параметры ТКП<h5>
    </p>
    <div class="row">
      <div class="col s4 m4 l4">
        <label for="ed_report_byday_dt" class="active">Приступить к выполнению</label>
        <input type="datetime-local" class="ed-date" name="" id="ed_date_begin_offer_${rnd}">
      </div>
      <div class="col s4 m4 l4">
        <label for="ed_report_byday_dt" class="active">Максимальный срок выполнения (час)</label>
        <input type="number" class="ed-date" name="" id="ed_time_h_offer_${rnd}">
      </div>
      <div class="col s4 m4 l4">
        <label for="ed_report_byday_dt" class="active">Стоимость работ</label>
        <input type="number" class="ed-date" name="" id="ed_price_offer_${rnd}">
      </div>
      <div class="col s12 m12 l12">
        <label for="ed_create_offer" class="active">Описание (в свободной форме)</label>
        <input type="text" id="ed_description_offer_${rnd}" value="">
      </div>
    </div>    
    `).then(function (result) {
      if (result) {
        let price_offer = $(`#ed_price_offer_${rnd}`).val();
        let date_begin_offer = $(`#ed_date_begin_offer_${rnd}`).val();
        let time_h_offer = $(`#ed_time_h_offer_${rnd}`).val();
        let description_offer = $(`#ed_description_offer_${rnd}`).val();
        let subject_offer = '';


        _f_save_new_offer(unc_doc_tender, subject_offer, description_offer, price_offer, time_h_offer, date_begin_offer);
      } else {
        $._subjBLUE('Действие отменено!');
        reject();
      }
    });
  };
  $('.tender-list-container').on('click', '.btn-eq-docs-new-offer', function () {
    let unc_doc_tender = $(this).closest('.card-content').data('unc_doc_tender');
    _f_create_offer(unc_doc_tender);
  });

  /*
  * ---------- END save new offer
  */


  /*
  * ---------- BEGIN load and show tender-and-offer-list
  */
  const _f_load_tender_offer = function () {
    return new Promise((resolve, reject) => {
      backend_getJSON(nodejs, { app: app.corporate, cmd: 'get-doc-tender-and-offer-list' }).then(function (data) { //* load flot offer list
        //todo: check data >> _check_res(data)
        resolve(data);
      }).catch(function (err) {
        reject(err);
        console.log('err', err);
      });
    });
  };
  const _f_load_and_show_tender_offer = function () {


    _f_load_tender_offer().then(function (data) {
      $('.offer-list-container').empty();
      list_tender_offer = data.respond;
      let tender = data.respond;

      if (tender.empty) {
        $._subjYELLOW('Пусто');
      } else {
        tender.forEach(el_td => {
          let offer_list = '';
          if (el_td.offer !== null) {

            el_td.offer.forEach(el_of => {
              offer_list += `
              <a href="#!" class="collection-item" 
              data-unc_doc_offer="${el_of.unc_doc_offer}"
              data-unc_dir_company="${el_of.unc_dir_company}"
              data-unc_dir_user="${el_of.unc_dir_user}">
              ${el_of.name_company} - <span class="badge">${mcss.data_time_normalize(el_of.date_begin_offer)} / ${el_of.time_h_offer} / ${el_of.price_offer}</span>
              Начало / Время проведения (часов) / Стоимость работ (руб)
              <br>Контракт с Организацией до: ${mcss.data_time_normalize(el_of.date_end_contract)}</a>
              `;
            });
          }

          $('.offer-list-container').append(`

          <div class="card blue">
            <div class="card-content white-text row" data-unc_doc_offer="${el_td.unc_doc_tender}">
              <div class="img-eq col s3 m3 l3">
                <img src="${el_td.img_eq}" alt="logo">
              </div>
              <div class="">
                <span class="card-title">Предложения по заданию №${el_td.unc_doc_tender}: ${el_td.name_tender_job} ${el_td.name_eq} ${el_td.model_eq}</span>
              </div>
              <div class="collection">
                ${offer_list}
              </div>
            </div>
          </div>

          `);
        });
      }
      $('.offer-list-container').fadeIn(300);
    });
  };
  $('a[href="./#opensection&s=s-docs&f=f-docs-offer"]').on('click', function () {
    _f_load_and_show_tender_offer();
  });

  /*
  * ---------- END load and show tender-and-offer-list
  */


  /*
  * ---------- BEGIN save new deal
  */
  const _f_save_new_deal = function (unc_doc_offer, subject_deal, description_deal) {
    backend_getJSON(nodejs, { app: app.corporate, cmd: 'ins-new-deal', unc_doc_offer, subject_deal, description_deal }).then(function (data) { //* make new deal
      //todo: check data >> _check_res(data)
      resolve(data);
    }).catch(function (err) {
      reject(err);
      console.log('err', err);
    });
  };

  const _f_create_deal = function (unc_doc_offer) {
    let rnd = mcss.rnd();
    let offer = _f_get_offer(unc_doc_offer);
    if (offer === null) {
      $._subjRED('Offer not found');
      return;
    }

    $._queryBLUE(`
    <p class="center">
    <h5 class="center"><b>Детальные параметры ТКП</b><h5>
    </p>
    <div class="row">
      <div class="blue lighten-4">
        <div class="col s6 m6 l6">
          <p><h6>Предложение создано:</h6> ${mcss.data_time_normalize(offer.date_offer)}</p>
          <p><h6>Готов приступить к выполнению: </h6>${mcss.data_time_normalize(offer.date_begin_offer)}</p>
          <p><h6>Имя пользователя: </h6>${offer.user_name_full}</p>
        </div>
        <div class="col s6 m6 l6">
          <p><h6>Наименование организации: </h6>${offer.name_company}</p>
          <p><h6>Элктронный адрес: </h6>${offer.address}</p>
          <p><h6>№ телефона: </h6>${offer.phone}</p>
          <p><h6>Окончание договора сорганизацией: </h6>${mcss.data_time_normalize(offer.date_end_contract)}</p>
        </div>
      </div>
    </div>    
    <p class="center">
    <h5 class="center orange-text"><b>Соглассовать исполнение задания?</b><h5>
    </p>

    `).then(function (result) {
      if (result) {
        let description_deal = '';
        let subject_deal = '';


        _f_save_new_deal(unc_doc_offer, subject_deal, description_deal);
      } else {
        $._subjBLUE('Действие отменено!');
        reject();
      }
    });
  };
  $('.offer-list-container').on('click', '.collection-item', function () {
    let unc_doc_offer = this.dataset.unc_doc_offer;
    _f_create_deal(unc_doc_offer);
  });

  /*
  * ---------- END save new deal
  */

  
  /*
  * ---------- BEGIN load and show deal list
  */
  const _f_load_deals_list = function () {
    return new Promise((resolve, reject) => {
      backend_getJSON(nodejs, { app: app.corporate, cmd: 'get-doc-deal-list' }).then(function (data) { //* load deals list
        //todo: check data >> _check_res(data)
        resolve(data);
      }).catch(function (err) {
        reject(err);
        console.log('err', err);
      });
    });
  };
  const _f_paint_deals_list = function (data) {
    $('.deal-list-container').empty();
    data.respond.forEach((el,i) => {
      $('.deal-list-container').append(`
      <div class="card blue">
        <div class="card-content white-text row" data-unc_doc_deal="${el.unc_doc_deal} data-deal_index="${i}">
          <div class="img-eq col s4 m4 l4">
            <img src="${el.img_eq}" alt="logo">
            <p>&nbsp</p>
            <div class="btn white-text btn-deal-rating">Оценить работу</div>
          </div>
          <div class="col s4 m4 l4">
            <span class="card-title">Договор № ${el.unc_doc_deal}</span>
            <p>Заказчик: ${el.dir_company_tender_name}</p>
            <p>Исполнитель: ${el.dir_company_deal_name}</p>
            <p>Оборудование: ${el.name_eq} ${el.model_eq}</p>
            <p>Расположение: ${el.doc_name_flot} ${el.doc_flot_title}</p> 
            <p>Установка: ${el.model_flot}</p>
            <p>&nbsp</p>
          </div>
          <div class="col s4 m4 l4">
            <span class="card-title">Предложение№: ${el.unc_doc_offer} на Задание №: ${el.unc_doc_tender}</span>
            <p>Вид работ: ${el.name_tender_job}</p>
            <p>Заявленный срок выполнения: ${el.time_h_todo_job} час.</p>
            <p>Соглассованный срок выполнения: ${el.time_h_offer} час.</p>
            <p>Стоимость: ${el.price_offer} руб.</p>
            <p>Оценка работ: ${el.name_deal_rating}</p>
            <p>Статус : ${el.name_deal_status}</p>
          </div>
        </div>
      </div>
      `);
    });
  };
  $('a[href="./#opensection&s=s-docs&f=f-docs-deal"]').on('click', function () {
    _f_load_deals_list().then(function (data) {
      _f_paint_deals_list(data);
    });
  });
  // $('.deal-list-container').on('click', '.btn-eq-docs-deal-detail', function () {
  //   let description_deal = this.dataset.description_deal;
  //   $._subjBLUE(description_deal, 30000);
  // });

  /*
  * ---------- END load and show deal list
  */


  //* Оценка выполнения работ *//
  const _f_save_deal_rating = function (unc_doc_deal, unc_dir_deal_rating, time_end_deal, description_deal) {
    backend_getJSON(nodejs, { app: app.corporate, cmd: 'set-deal-rating', unc_doc_deal, unc_dir_deal_rating, time_end_deal, description_deal }).then(function (data) { //* make new deal rating
      //todo: check data >> _check_res(data)
      resolve(data);
    }).catch(function (err) {
      reject(err);
      console.log('err', err);
    });
  };
  const _f_set_deal_rating = function (unc_doc_deal) {
    let rnd = mcss.rnd();
    let list_dit_dir_deal_rating='';
    dir_deal_rating.forEach(el => {
      list_dit_dir_deal_rating += `<option value="${el.unc_dir_deal_rating}">${el.name_deal_rating}</option>`;
    });
    $._queryBLUE(`
    <p class="center">
    <h5 class="center">Оцените выполнение задаия<h5>
    </p>
    <div class="row">
      <div class="col s6 m6 l6">
        <label for="ed_time_end_deal_${rnd}" class="active">Фактическое завершение</label>
        <input type="datetime-local" class="ed-date" name="" id="ed_time_end_deal_${rnd}">
      </div>
      <div class="col s6 m6 l6">
      <label for="cb_unc_dir_deal_rating_${rnd}" class="active">Эффективность выполнения</label>
      <select class="browser-default" id="cb_unc_dir_deal_rating_${rnd}">
        ${list_dit_dir_deal_rating}
      </select>
      </div>
      <div class="col s12 m12 l12">
        <label for="ed_description_deal_${rnd}" class="active">Описание (в свободной форме)</label>
        <input type="text" id="ed_description_deal_${rnd}" value="">
      </div>
    </div>    
    `).then(function (result) {
      if (result) {
        let unc_dir_deal_rating = $(`#cb_unc_dir_deal_rating_${rnd}`).val();
        let time_end_deal = $(`#ed_time_end_deal_${rnd}`).val();
        let description_deal = $(`#ed_description_deal_${rnd}`).val();
        _f_save_deal_rating(unc_doc_deal, unc_dir_deal_rating, time_end_deal, description_deal);
      } else {
        $._subjBLUE('Действие отменено!');
        reject();
      }
    });
  };
  $('.deal-list-container').on('click', '.btn-deal-rating', function () {
    let unc_doc_deal = $(this).closest('.card-content').data('unc_doc_deal');
    _f_set_deal_rating(unc_doc_deal);
  });







  ///########################################################
  ///######################################################## MYOFFER
  ///########################################################

  
  /*
  * ---------- BEGIN load and show myoffer list
  */
  const _f_load_myoffers_list = function () {
    return new Promise((resolve, reject) => {
      backend_getJSON(nodejs, { app: app.contractor, cmd: 'get-doc-offer-list' }).then(function (data) { //* load myoffers list
        //todo: check data >> _check_res(data)
        resolve(data);
      }).catch(function (err) {
        reject(err);
        console.log('err', err);
      });
    });
  };
  const _f_paint_myoffers_list = function (data) {
    $('.myoffer-list-container').empty();
    data.respond.forEach((el,i) => {
      $('.myoffer-list-container').append(`
      <div class="card blue">
        <div class="card-content white-text row data-unc_doc_offer="${el.unc_doc_offer} data-offer_index="${i}">
          <div class="img-eq col s3 m3 l3">
            <img src="${el.img_eq}" alt="logo">
          </div>
          <div class="col s9 m9 l9">
            <span class="card-title">${el.name_eq} ${el.model_eq}</span>
            <p>Заказчик: ${el.dir_company_tender_name}</p>
            <p>Вид работ: ${el.name_tender_job}</p>
            <p>Заявленное время начала: ${el.time_h_todo_job} час.</p>
            <p>Заявленный срок выполнения: ${el.time_h_todo_job} час.</p>
            <p>Предложенное время начала: ${el.time_h_offer} час.</p>
            <p>Предложенный срок выполнения: ${el.time_h_offer} час.</p>
            <p>Статус: ${el.name_tender_status}</p>
            <p>&nbsp</p>
            <div class="btn white-text btn-docs-myoffer-reject">Отозвать</div>
          </div>
        </div>
      </div>
      `);
    });
  };
  $('a[href="./#opensection&s=s-docs&f=f-docs-myoffer"]').on('click', function () {
    _f_load_myoffers_list().then(function (data) {
      _f_paint_myoffers_list(data);
    });
  });
  // $('.myoffer-list-container').on('click', '.btn-eq-docs-myoffer-detail', function () {
  //   let description_myoffer = this.dataset.description_myoffer;
  //   $._subjBLUE(description_myoffer, 30000);
  // });

  /*
  * ---------- END load and show myoffer list
  */

  /*
  * ---------- BEGIN load and show mydeal list
  */
  const _f_load_mydeals_list = function () {
    return new Promise((resolve, reject) => {
      backend_getJSON(nodejs, { app: app.contractor, cmd: 'get-doc-deal-list' }).then(function (data) { //* load mydeals list
        //todo: check data >> _check_res(data)
        resolve(data);
      }).catch(function (err) {
        reject(err);
        console.log('err', err);
      });
    });
  };
  const _f_paint_mydeals_list = function (data) {
    $('.mydeal-list-container').empty();
    data.respond.forEach((el,i) => {
      $('.mydeal-list-container').append(`
      <div class="card blue">
        <div class="card-content white-text row" data-unc_doc_deal="${el.unc_doc_deal} data-deal_index="${i}">
          <div class="img-eq col s4 m4 l4">
            <img src="${el.img_eq}" alt="logo">
          </div>
          <div class="col s4 m4 l4">
            <span class="card-title">Договор № ${el.unc_doc_deal}</span>
            <p>Заказчик: ${el.dir_company_tender_name}</p>
            <p>Исполнитель: ${el.dir_company_deal_name}</p>
            <p>Оборудование: ${el.name_eq} ${el.model_eq}</p>
            <p>Расположение: ${el.doc_name_flot} ${el.doc_flot_title}</p> 
            <p>Установка: ${el.model_flot}</p>
            <p>&nbsp</p>
          </div>
          <div class="col s4 m4 l4">
            <span class="card-title">Предложение№: ${el.unc_doc_offer} на Задание №: ${el.unc_doc_tender}</span>
            <p>Вид работ: ${el.name_tender_job}</p>
            <p>Заявленный срок выполнения: ${el.time_h_todo_job} час.</p>
            <p>Соглассованный срок выполнения: ${el.time_h_offer} час.</p>
            <p>Стоимость: ${el.price_offer} руб.</p>
            <p>Оценка работ: ${el.name_deal_rating}</p>
            <p>Статус : ${el.name_deal_status}</p>
          </div>
        </div>
      </div>
      `);
    });
  };
  $('a[href="./#opensection&s=s-docs&f=f-docs-mydeal"]').on('click', function () {
    _f_load_mydeals_list().then(function (data) {
      _f_paint_mydeals_list(data);
    });
  });


  /*
  * ---------- END load and show deal list
  */

  
  ///########################################################
  ///######################################################## REPORT OTCHET
  ///########################################################

  //* Заглушка *//

  $('a[href="./#opensection&s=s-report&f=f-report-byday"]').on('click', function () {
    $._subjYELLOW('Данный функционал программного обеспечения не реализован в рамках MVP');
  });

  $('.btn-flot-serch-category').on('click', function () {
    $._subjYELLOW('Данный функционал программного обеспечения не реализован в рамках MVP');
  });

  $('#bt_report_graph_paint').on('click', function () {
    $._subjYELLOW('Данный функционал программного обеспечения не реализован в рамках MVP');
  });

  $('.s-messages').on('click','.btn', function () {
    $._subjYELLOW('Данный функционал программного обеспечения не реализован в рамках MVP');
  });

  $('.f-docs-myoffer').on('click','.btn-docs-myoffer-reject', function () {
    $._subjYELLOW('Данный функционал программного обеспечения не реализован в рамках MVP');
  });


  ///########################################################
  ///######################################################## REPORT OTCHET
  ///########################################################

  ///########################################################
  ///######################################################## REPORT OTCHET
  ///########################################################

  ///########################################################
  ///######################################################## REPORT OTCHET
  ///########################################################

  ///########################################################
  ///######################################################## REPORT GRAPHIC
  ///########################################################

  /*
  * ---------- BEGIN create and show chart
  */

  const _f_load_and_paint_chart_list = function () {
    backend_getJSON(nodejs, { app: app.basic, cmd: 'get-chart-list' }).then(function (data) { //* load chart list
      //todo: check data >> _check_res(data)
      _f_paint_chart_list(data.respond);
    }).catch(function (err) {
      console.log('err', err);
    });
  };
  const _f_paint_chart_list = function (chart_list) {
    $('#out_report_graph_body').empty();
    chart_list.forEach(el => {
      $('#out_report_graph_body').append(`
      <tr>
        <td>${(el.date.slice(0,-8).replace(/T/g,' '))}</td>
        <td>---</td>
        <td>---</td>
        <td>
          <a target="_blank" href="./chart/?${el.file}" class="btn bt-report-graph-show">Просмотр</a>
          <div data-chart_link="${origin_cli}chart/?${el.file}" class="btn bt-report-graph-show-link">Показать ссылку</div>
        </td>
      </tr>
      `);
    });
  };

  $('a[href="./#opensection&s=s-report&f=f-report-graph"]').on('click', function () {
    _f_load_and_paint_chart_list();
  });
  $('#out_report_graph_body').on('click','.bt-report-graph-show-link', function () {
    $._subjBLUE(this.dataset.chart_link,30000);
  });
  /*
  * ---------- BEGIN create and show chart
  */




  ///########################################################
  ///########################################################
  ///########################################################


});