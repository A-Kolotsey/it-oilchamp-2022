/*jshint esversion: 6 */

$(function () {
  // !!! GLOBAL VARS

  const origin_cli = location.origin + location.pathname;
  const nodejs = { main: origin_cli + '/itcase-backend/', public: origin_cli + '/itcase-backend/' };
  const app = {}; app.corporate = 'itcase-pg-query-corporate'; app.contractor = 'itcase-pg-query-contractor'; app.basic = 'itcase-pg-query-basic';
  // 
  var dir_tender_job = [];
  var dir_flot_timing = [];
  var doc_flot_list = [];
  var dir_user_list = [];
  var dir_tender_status = [];
  var dir_message_status = [];
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
    /* ?????????????????? ???????????? ?? ?????????????? */
    if (Array.isArray(res)) {
      res = res[0];
    }
    if (res === undefined) {
      $._subjYELLOW('?????????? ?????????????? ????????.');
      return (false);
    }
    if (res.is_login === false) {
      $._subjYELLOW('??????????????????????????!');
      return (false);
    }
    if (res.nopermission) {
      $._subjRED('?? ?????? ?????? ????????, ???? ?????? ????????????????!');
      return (false);
    }
    if (res.empty === true) {
      $._subjYELLOW('?????????? ?????????????? ????????.');
      return (false);
    }
    if (res.ins === true) {
      $._subjBLUE('???????????? ??????????????????.');
      return (false);
    }
    if (res.name == 'error') {
      $._subjRED('?????????????????????? ???????????? ???? ??????????????. ???????????????????? ?? ???????????? ??????????????????????????.');
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
    backend_getJSON(nodejs, { app: app.basic, cmd: 'get-dir-message-status' }).then(function (data) { //* load dir_message_status
      dir_message_status = data.respond;
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
    <p>???????? ??? <b>${unc_doc_flot}</b>
    </p>
      <table>
        <thead>
          <tr>
            <th><p title="">????????????????</p></th>
            <th><p title="">????????????????</p></th>
            <th><p title="">????????????????</p></th>
            <th><p title="">????????????????</p></th>
          </tr>
        </thead>
        <tbody>
            <tr class="blue lighten-5">
              <td>???????? ?? ??????????:</td>
              <td>20.08.2022 18:45</td>
              <td>?????????????? ??????????:</td>
              <td>1616,39 ??.</td>
            </tr>    
            <tr class="blue lighten-5">
              <td>?????????? ????????????:</td>
              <td>????????????</td>
              <td>?????? ????????????:</td>
              <td>1578,39 ??.</td>
            </tr>    
            <tr class="blue lighten-5">
              <td>?????????????????? ????????????:</td>
              <td>38,00 ??.</td>
              <td>?????????????? ????????????:</td>
              <td>0,00 ??????-1</td>
              
            </tr>    
            <tr class="blue lighten-5">
              <td>???????????????? ???? ????????????:</td>
              <td>0,00 ??.</td>
              <td>????.?? ???? ????????????:</td>
              <td>1,57 ??*??.</td>
            </tr>    
            <tr class="blue lighten-5">
              <td>???????????????? ????????????????????:</td>
              <td>0,00 ??????.</td>
              <td>????????????????:</td>
              <td>61,2 ??.</td>
              
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
              <span class="card-title">???????????????????????? ?????? ???????????????? ???? ??????????????</span>
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
                <div class="btn white-text btn-eq-new-tender">??????????????</div>
              </div>
              <div class="col s9 m9 l9">
                <div class="">
                  <span class="card-title">${el_eq.name_eq} ${el_eq.model_eq}</span>
                  <p>???????????? ???? ???????????? ${el_eq.range_to_h} ??????(????)</p>
                  <p>???????? ???????????????????? ????: ${mcss.data_time_normalize(el_eq.last_to_date)}</p>
                  <p>???????? ???????????????????? ????: ${mcss.data_time_normalize(el_eq.next_to_date)}</p>
                  <p class="${time_lost ? 'white-text red' : ''}">
                  ${time_lost ? '????????????????????' : '????????????????'}: 
                  ${el_eq.to_time_left.days || 0} ???????? / ${el_eq.to_time_left.hours || 0} ?????????? / ${el_eq.to_time_left.minutes || 0} ??????????</p>
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



  const _f_load_and_show_flot_report_timing= function(unc_doc_flot,doc_flot_index){
    backend_getJSON(nodejs, { app: app.corporate, cmd: 'get-flot-report-timing', unc_doc_flot }).then(function (data) { //* create sensor chart
      //todo: check data >> _check_res(data)
      data.respond.flot_info=doc_flot_list[doc_flot_index];
      _f_show_flot_report_timing(data.respond);
    }).catch(function (err) {
      console.log('err', err);
    });
  };
  const _f_show_flot_report_timing = function (data) {
    let chart_form = `./report-flot-timing/`;
    let w_width=800,w_heigght=800;
    window.flot_report_timing_data=data;
    let flot_report_timing = window.open(chart_form, "?????????????????? - ???????? ??????????", `location=no,status=no,width=${w_width},height=${w_heigght}`);
    flot_report_timing.flot_report_timing_data=data;
  };
  $('.flot-list-container').on('click', '.btn-flot-show-report-timing', function () {
    let unc_doc_flot = $(this).closest('.card-content').data('unc_doc_flot');
    let doc_flot_index = $(this).closest('.card-content').data('doc_flot_index');
    _f_load_and_show_flot_report_timing(unc_doc_flot,doc_flot_index);
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
    data.forEach((el,i) => {
      $('.flot-list-container').append(`
      <div class="card blue">
        <div class="card-content white-text row" data-unc_doc_flot="${el.unc_doc_flot}" data-doc_flot_index="${i}">
          <div class="img-flot col s3 m3 l3">
            <img src="${el.img_flot}" alt="logo">
          </div>
          <div class="col s9 m9 l9">
            <span class="card-title">${el.name_flot}</span>
            <p>?????????????? ??????????????????: ${el.model_flot}</p>
            <p>${el.title}</p>
            <p>???????????????????????????? ????????????????????????: -</p>
            <p>?????????????? ????????????: ?????? ????????????</p>
            <p>???????????????? ????????????: - ???? -</p>
            <p>&nbsp</p>
            <div class="btn white-text btn-flot-show-report-timing">???????? ??????????</div>
            <div class="btn white-text btn-flot-show-equipment">???????????????? ????????????????????????</div>
          </div>
        </div>
      </div>
      `);
    });
  };
  $('a[href="./#opensection&s=s-flot&f=none"]').on('click', function () {
    _f_load_flots_list().then(function (data) {
      doc_flot_list=data.respond;
      _f_paint_flots_list(doc_flot_list);
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
    <h5 class="center">?????????????? ?????????????????? ??????????????<h5>
    <select class="browser-default" id="cb_unc_dir_tender_job_${rnd}">
    ${list_dit_tender_job}
    </select>
    </p>
    <div class="row">
      <div class="col s6 m6 l6">
        <label for="ed_report_byday_dt" class="active">???????????????????? ?? ????????????????????</label>
        <input type="datetime-local" class="ed-date" name="" id="ed_date_begin_job_${rnd}">
      </div>
      <div class="col s6 m6 l6">
        <label for="ed_report_byday_dt" class="active">???????????????????????? ???????? ???????????????????? (??????)</label>
        <input type="number" class="ed-date" name="" id="ed_time_h_todo_job_${rnd}">
      </div>
      <div class="col s12 m12 l12">
        <label for="ed_create_tender" class="active">???????????????? (?? ?????????????????? ??????????)</label>
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
        $._subjBLUE('???????????????? ????????????????!');
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
    let w_width=1024,w_heigght=800;
    window.open(chart_form, "?????????????????? - ????????????", `location=no,status=no,width=${w_width},height=${w_heigght}`);
  };

  $('.bt-create-sensor-chart').on('click', function () {
    let unc_doc_sensor = _f_refresh_create_chart_button().toString();
    _f_create_and_show_chart(unc_doc_sensor);
  });

  /*
  * ---------- BEGIN create and show chart
  */




  ///########################################################
  ///######################################################## ?????????????????? ?????????????? - TENGER
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
      <div class="card blue mlr-20">
        <div class="card-content white-text row" data-unc_doc_tender="${el.unc_doc_tender}">
          <div class="img-eq col s3 m3 l3">
            <img src="${el.img_eq}" alt="logo">
          </div>
          <div class="col s9 m9 l9">
            <span class="card-title">?????????????? ??? ${el.unc_doc_tender}</span>
            <p>${el.name_eq} ${el.model_eq}</p>
            <p>?????? ??????????????: ${el.name_tender_job}</p>
            <p>?????????????? ??????????????????: ${mcss.data_time_normalize(el.date_tender)}</p>
            <p>???????????????????????? ???????? ????????????????????: ${el.time_h_todo_job} ????????</p>
            <p>???????????????????? ?? ???????????????????? ???? ??????????????: ${mcss.data_time_normalize(el.date_begin_job)}</p>
            <p>????????????: ${el.name_tender_status}</p>
            <p>?????????????? ??????????????????: ${el.user_name_full}</p>
            <p>&nbsp</p>
            <div class="btn white-text btn-eq-docs-tender-detail" data-description_tender="${el.description_tender}">????????????????</div>
            <div class="btn white-text btn-eq-docs-new-offer">?????????????? ??????</div>
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
    <h5 class="center">?????????????? ?????????????????? ??????<h5>
    </p>
    <div class="row">
      <div class="col s4 m4 l4">
        <label for="ed_report_byday_dt" class="active">???????????????????? ?? ????????????????????</label>
        <input type="datetime-local" class="ed-date" name="" id="ed_date_begin_offer_${rnd}">
      </div>
      <div class="col s4 m4 l4">
        <label for="ed_report_byday_dt" class="active">???????????????????????? ???????? ???????????????????? (??????)</label>
        <input type="number" class="ed-date" name="" id="ed_time_h_offer_${rnd}">
      </div>
      <div class="col s4 m4 l4">
        <label for="ed_report_byday_dt" class="active">?????????????????? ??????????</label>
        <input type="number" class="ed-date" name="" id="ed_price_offer_${rnd}">
      </div>
      <div class="col s12 m12 l12">
        <label for="ed_create_offer" class="active">???????????????? (?? ?????????????????? ??????????)</label>
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
        $._subjBLUE('???????????????? ????????????????!');
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
        $._subjYELLOW('??????????');
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
              ???????????? / ?????????? ???????????????????? (??????????) / ?????????????????? ?????????? (??????)
              <br>???????????????? ?? ???????????????????????? ????: ${mcss.data_time_normalize(el_of.date_end_contract)}</a>
              `;
            });
          }

          $('.offer-list-container').append(`

          <div class="card blue mlr-20">
            <div class="card-content white-text row" data-unc_doc_offer="${el_td.unc_doc_tender}">
              <div class="img-eq col s3 m3 l3">
                <img src="${el_td.img_eq}" alt="logo">
              </div>
              <div class="">
                <span class="card-title">?????????????????????? ???? ?????????????? ???${el_td.unc_doc_tender}: ${el_td.name_tender_job} ${el_td.name_eq} ${el_td.model_eq}</span>
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
    <h5 class="center"><b>?????????????????? ?????????????????? ??????</b><h5>
    </p>
    <div class="row">
      <div class="blue lighten-4">
        <div class="col s6 m6 l6">
          <p><h6>?????????????????????? ??????????????:</h6> ${mcss.data_time_normalize(offer.date_offer)}</p>
          <p><h6>?????????? ???????????????????? ?? ????????????????????: </h6>${mcss.data_time_normalize(offer.date_begin_offer)}</p>
          <p><h6>?????? ????????????????????????: </h6>${offer.user_name_full}</p>
        </div>
        <div class="col s6 m6 l6">
          <p><h6>???????????????????????? ??????????????????????: </h6>${offer.name_company}</p>
          <p><h6>???????????????????? ??????????: </h6>${offer.address}</p>
          <p><h6>??? ????????????????: </h6>${offer.phone}</p>
          <p><h6>?????????????????? ???????????????? ??????????????????????????: </h6>${mcss.data_time_normalize(offer.date_end_contract)}</p>
        </div>
      </div>
    </div>    
    <p class="center">
    <h5 class="center orange-text"><b>???????????????????????? ???????????????????? ???????????????</b><h5>
    </p>

    `).then(function (result) {
      if (result) {
        let description_deal = '';
        let subject_deal = '';


        _f_save_new_deal(unc_doc_offer, subject_deal, description_deal);
      } else {
        $._subjBLUE('???????????????? ????????????????!');
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
      <div class="card blue mlr-20">
        <div class="card-content white-text row" data-unc_doc_deal="${el.unc_doc_deal} data-deal_index="${i}">
          <div class="img-eq col s4 m4 l4">
            <img src="${el.img_eq}" alt="logo">
            <p>&nbsp</p>
            <div class="btn white-text btn-deal-rating">?????????????? ????????????</div>
          </div>
          <div class="col s4 m4 l4 bl">
            <span class="card-title">?????????????? ??? ${el.unc_doc_deal}</span>
            <p>????????????????: ${el.dir_company_tender_name}</p>
            <p>??????????????????????: ${el.dir_company_deal_name}</p>
            <p>????????????????????????: ${el.name_eq} ${el.model_eq}</p>
            <p>????????????????????????: ${el.doc_name_flot} ${el.doc_flot_title}</p> 
            <p>??????????????????: ${el.model_flot}</p>
            <p>&nbsp</p>
          </div>
          <div class="col s4 m4 l4 bl">
            <span class="card-title">?????????????????????????: ${el.unc_doc_offer} ???? ?????????????? ???: ${el.unc_doc_tender}</span>
            <p>?????? ??????????: ${el.name_tender_job}</p>
            <p>???????????????????? ???????? ????????????????????: ${el.time_h_todo_job} ??????.</p>
            <p>???????????????????????????? ???????? ????????????????????: ${el.time_h_offer} ??????.</p>
            <p>??????????????????: ${el.price_offer} ??????.</p>
            <p>???????????? ??????????: ${el.name_deal_rating}</p>
            <p>???????????? : ${el.name_deal_status}</p>
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


  //* ???????????? ???????????????????? ?????????? *//
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
    <h5 class="center">?????????????? ???????????????????? ????????????<h5>
    </p>
    <div class="row">
      <div class="col s6 m6 l6">
        <label for="ed_time_end_deal_${rnd}" class="active">?????????????????????? ????????????????????</label>
        <input type="datetime-local" class="ed-date" name="" id="ed_time_end_deal_${rnd}">
      </div>
      <div class="col s6 m6 l6">
      <label for="cb_unc_dir_deal_rating_${rnd}" class="active">?????????????????????????? ????????????????????</label>
      <select class="browser-default" id="cb_unc_dir_deal_rating_${rnd}">
        ${list_dit_dir_deal_rating}
      </select>
      </div>
      <div class="col s12 m12 l12">
        <label for="ed_description_deal_${rnd}" class="active">???????????????? (?? ?????????????????? ??????????)</label>
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
        $._subjBLUE('???????????????? ????????????????!');
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
      <div class="card blue mlr-20">
        <div class="card-content white-text row data-unc_doc_offer="${el.unc_doc_offer} data-offer_index="${i}">
          <div class="img-eq col s3 m3 l3">
            <img src="${el.img_eq}" alt="logo">
          </div>
          <div class="col s9 m9 l9">
            <span class="card-title">${el.name_eq} ${el.model_eq}</span>
            <p>????????????????: ${el.dir_company_tender_name}</p>
            <p>?????? ??????????: ${el.name_tender_job}</p>
            <p>???????????????????? ?????????? ????????????: ${el.time_h_todo_job} ??????.</p>
            <p>???????????????????? ???????? ????????????????????: ${el.time_h_todo_job} ??????.</p>
            <p>???????????????????????? ?????????? ????????????: ${el.time_h_offer} ??????.</p>
            <p>???????????????????????? ???????? ????????????????????: ${el.time_h_offer} ??????.</p>
            <p>????????????: ${el.name_tender_status}</p>
            <p>&nbsp</p>
            <div class="btn plug white-text btn-docs-myoffer-reject">????????????????</div>
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
      <div class="card blue mlr-20">
        <div class="card-content white-text row" data-unc_doc_deal="${el.unc_doc_deal} data-deal_index="${i}">
          <div class="img-eq col s4 m4 l4">
            <img src="${el.img_eq}" alt="logo">
          </div>
          <div class="col s4 m4 l4 bl">
            <span class="card-title">?????????????? ??? ${el.unc_doc_deal}</span>
            <p>????????????????: ${el.dir_company_tender_name}</p>
            <p>??????????????????????: ${el.dir_company_deal_name}</p>
            <p>????????????????????????: ${el.name_eq} ${el.model_eq}</p>
            <p>????????????????????????: ${el.doc_name_flot} ${el.doc_flot_title}</p> 
            <p>??????????????????: ${el.model_flot}</p>
            <p>&nbsp</p>
          </div>
          <div class="col s4 m4 l4 bl">
            <span class="card-title">?????????????????????????: ${el.unc_doc_offer} ???? ?????????????? ???: ${el.unc_doc_tender}</span>
            <p>?????? ??????????: ${el.name_tender_job}</p>
            <p>???????????????????? ???????? ????????????????????: ${el.time_h_todo_job} ??????.</p>
            <p>???????????????????????????? ???????? ????????????????????: ${el.time_h_offer} ??????.</p>
            <p>??????????????????: ${el.price_offer} ??????.</p>
            <p>???????????? ??????????: ${el.name_deal_rating}</p>
            <p>???????????? : ${el.name_deal_status}</p>
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

  //* ??????????????a *//

  $('body').on('click','.plug', function () {
    $._subjYELLOW('???????????? ???????????????????? ???????????????????????? ?????????????????????? ???? ???????????????????? ?? ???????????? MVP');
  });


  ///########################################################
  ///######################################################## MESSAGES
  ///########################################################

  const _f_load_users_list = function () {
    return new Promise((resolve, reject) => {
      backend_getJSON(nodejs, { app: app.basic, cmd: 'get-dir-user-list' }).then(function (data) { //* load users list
        //todo: check data >> _check_res(data)
        dir_user_list=data.respond;
        resolve(data);
      }).catch(function (err) {
        reject(err);
        console.log('err', err);
      });
    });
  };
  const _f_paint_users_list = function (data) {
    $('#lst_out_message_users_list').empty();
    data.respond.forEach((el,i) => {
      $('#lst_out_message_users_list').append(`
        <option data-unc_dir_user="${el.unc_dir_user}" value="${el.name_full} (${el.name_company})">${el.name_full} (${el.name_company})</option>
      });
      `);
    });
  };
  $('a[href="./#opensection&s=s-messages&f=none"]').on('click', function () {
    _f_load_users_list().then(function (data) {
      _f_paint_users_list(data);
    });
  });

  const _f_send_message = function (unc_dir_user_to,unc_dir_message_status,subj_msg,body_msg) {
    return new Promise((resolve, reject) => {
      backend_getJSON(nodejs, { app: app.basic, cmd: 'ins-new-message',unc_dir_user_to,unc_dir_message_status,subj_msg,body_msg }).then(function (data) { //* load users list
        //todo: check data >> _check_res(data)
        resolve(data);
      }).catch(function (err) {
        reject(err);
        console.log('err', err);
      });
    });
  };

  const _f_get_unc_dir_user = function (mask){
    let unc_dir_user=0;
    dir_user_list.forEach(el => {
      if (mask.toString().indexOf(el.name_full)>=0&&mask.toString().indexOf(el.name_company)>=0) {
        unc_dir_user=el.unc_dir_user;
      }
    });
    return unc_dir_user;
  };

  const _f_out_message_send_new=function () {
    let unc_dir_user_to=_f_get_unc_dir_user($('#ed_out_message_users_list').val()),
    unc_dir_message_status=$('#cb_out_message_status').val(),
    subj_msg=$('#ed_out_message_new').val(),
    body_msg=$('#ed_out_message_new').val();
    _f_send_message(unc_dir_user_to,unc_dir_message_status,subj_msg,body_msg).then(function (data) {
      console.log('data :>> ', data);
    });
  };
  $('#btn_out_message_send_new').on('click', function () {
    _f_out_message_send_new();
  });

  const _f_chat_message_send_new=function () {
    let unc_dir_user_to=0,
    unc_dir_message_status=$('#cb_chat_message_status').val(),
    subj_msg=$('#ed_chat_message_new').val(),
    body_msg=$('#ed_chat_message_new').val();
    _f_send_message(unc_dir_user_to,unc_dir_message_status,subj_msg,body_msg).then(function (data) {
      console.log('data :>> ', data);
    });
  };
  $('#btn_chat_message_send_new').on('click', function () {
    _f_chat_message_send_new();
  });


/* ----------------------- in_message_list begin ------------------------------ */

  const _f_load_in_message_list = function () {
    return new Promise((resolve, reject) => {
      backend_getJSON(nodejs, { app: app.basic, cmd: 'get-doc-message-in' }).then(function (data) { //* load in_message list
        //todo: check data >> _check_res(data)
        resolve(data);
      }).catch(function (err) {
        reject(err);
        console.log('err', err);
      });
    });
  };
  const _f_paint_in_message_list = function (data) {
    $('#lst_in_message_list').empty();
    data.forEach((el,i) => {
      $('#lst_in_message_list').append(`
      <li class="collection-item ${el.css_class===''?'':`${el.css_class} lighten-5`}">
        <label for="msg${i}">${el.name_user_from} / ${mcss.data_time_normalize(el.dt_msg)} / 
        <div class="event-msg ${el.css_class===''?'':`${el.css_class}-text`}">
          ${el.name_status}
        </div>
        </label>
        <div class="btn plug btn-small red btn-msg-chat-del" id=""><i class="small material-icons">delete</i></div>
        <div class="btn plug white-text btn-small btn-msg-chat">????????????????</div>
        <div id="msg${i}" class="">${el.subj_msg}</div>
      </li>
      `);
    });
  };
  const _f_load_and_show_in_message = function (){
    _f_load_in_message_list().then(function (data) {
      if (data.respond.result==="empty") {
        $._subjYELLOW('???????????? ?????????????????? ????????');
      }else{
        _f_paint_in_message_list(data.respond);
      }
    });
  };

  $('a[href="./#opensection&s=s-messages&f=f-messages-in"]').on('click', function () {
    _f_load_and_show_in_message();
  });
/* ----------------------- in_message_list end ------------------------------ */
  


/* ----------------------- out_message_list begin ------------------------------ */

  const _f_load_out_message_list = function () {
    return new Promise((resolve, reject) => {
      backend_getJSON(nodejs, { app: app.basic, cmd: 'get-doc-message-out' }).then(function (data) { //* load out_message list
        //todo: check data >> _check_res(data)
        resolve(data);
      }).catch(function (err) {
        reject(err);
        console.log('err', err);
      });
    });
  };
  const _f_paint_out_message_list = function (data) {
    $('#lst_out_message_list').empty();
    data.forEach((el,i) => {
      $('#lst_out_message_list').append(`
      <li class="collection-item ${el.css_class===''?'':`${el.css_class} lighten-5`}">
        <label for="msg${i}">${el.name_user_from} / ${mcss.data_time_normalize(el.dt_msg)} / 
        <div class="event-msg ${el.css_class===''?'':`${el.css_class}-text`}">
          ${el.name_status}
        </div>
        </label>
        <div class="btn plug btn-small red btn-msg-chat-del" id=""><i class="small material-icons">delete</i></div>
        <div class="btn plug white-text btn-small btn-msg-chat">??????????????????</div>
        <div id="msg${i}" class="">${el.subj_msg}</div>
      </li>
      `);
    });
  };
  const _f_load_and_show_out_message = function (){
    _f_load_out_message_list().then(function (data) {
      if (data.respond.result==="empty") {
        $._subjYELLOW('???????????? ?????????????????? ????????');
      }else{
        _f_paint_out_message_list(data.respond);
      }
    });
  };

  $('a[href="./#opensection&s=s-messages&f=f-messages-out"]').on('click', function () {
    _f_load_and_show_out_message();
  });

  $('#btn_out_message_send_new').on('click', function () {
    _f_load_and_show_out_message();
  });
/* ----------------------- out_message_list end ------------------------------ */
  


/* ----------------------- chat_message_list begin ------------------------------ */

  const _f_load_chat_message_list = function () {
    return new Promise((resolve, reject) => {
      backend_getJSON(nodejs, { app: app.basic, cmd: 'get-doc-message-chat' }).then(function (data) { //* load chat_message list
        //todo: check data >> _check_res(data)
        resolve(data);
      }).catch(function (err) {
        reject(err);
        console.log('err', err);
      });
    });
  };
  const _f_paint_chat_message_list = function (data) {
    $('#lst_chat_message_list').empty();
    data.forEach((el,i) => {
      $('#lst_chat_message_list').append(`
      <li class="collection-item ${el.css_class===''?'':`${el.css_class} lighten-5`}">
        <label for="msg${i}">${el.name_user_from} / ${mcss.data_time_normalize(el.dt_msg)} / 
        <div class="event-msg ${el.css_class===''?'':`${el.css_class}-text`}">
          ${el.name_status}
        </div>
        </label>
        <div class="btn plug white-text btn-small btn-msg-chat">???????????? ??????????????????</div>
        <div id="msg${i}" class="">${el.subj_msg}</div>
      </li>
      `);
    });
  };
  const _f_load_and_show_chat_message = function (){
    _f_load_chat_message_list().then(function (data) {
      if (data.respond.result==="empty") {
        $._subjYELLOW('???????????? ?????????????????? ????????');
      }else{
        _f_paint_chat_message_list(data.respond);
      }
    });
  };

  $('a[href="./#opensection&s=s-messages&f=f-messages-chat"]').on('click', function () {
    _f_load_and_show_chat_message();
  });

  $('#btn_chat_message_send_new').on('click', function () {
    _f_load_and_show_chat_message();
  });
/* ----------------------- chat_message_list end ------------------------------ */
  

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
          <a target="_blank" href="./chart/?${el.file}" class="btn bt-report-graph-show">????????????????</a>
          <div data-chart_link="${origin_cli}chart/?${el.file}" class="btn bt-report-graph-show-link">???????????????? ????????????</div>
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

  /* ----------------------- chart report rating begin ------------------------------ */

  const _f_load_and_show_report_company_rating= function(cmd,company_info){
    backend_getJSON(nodejs, { app: app.corporate, cmd}).then(function (data) { //* create company-rating chart
      //todo: check data >> _check_res(data)
      data.respond.company_info=company_info;
      _f_show_report_company_rating(data.respond);
    }).catch(function (err) {
      console.log('err', err);
    });
  };
  const _f_show_report_company_rating = function (data) {
    let chart_form = `./report-company-rating/`;
    let w_width=800,w_heigght=800;
    window.report_company_rating_data=data;
    let report_company_rating = window.open(chart_form, "?????????????????? - ??????????????", `location=no,status=no,width=${w_width},height=${w_heigght}`);
    report_company_rating.report_company_rating_data=data;
  };
  $('.report-rating-container').on('click', '.btn-report-rating-eff', function () {
    let cmd = $(this).data('cmd');
    let company_info = $(this).children('a').html();
    _f_load_and_show_report_company_rating(cmd,company_info);
  });

  /* ----------------------- chart report rating end ------------------------------ */

  /*
  * ---------- BEGIN create and show chart
  */




  ///########################################################
  ///########################################################
  ///########################################################


});