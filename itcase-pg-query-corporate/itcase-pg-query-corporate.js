/*jshint esversion: 6 */
const PG = require('pg').Pool;
const fs = require('fs');
const to_sql = require('../classes/srv-classes').ToSQL;
const main = require('../classes/srv-classes').Main;
const chart_path = global._srv_dirname +'/html/itcase/chart/';
global.rt = JSON.stringify({
  'rez': 'bad-cmd'
});


var qjs = function (req, res, qstr) {

  var query_sid = '0';
  setTimeout(() => {
    if (!res.headersSent) {
      query_sid = `${qstr.app}${qstr.cmd}${(new Date(Date.now()).toISOString().replace(/\s|\,|:|\./g, '-'))}`;
      return _f_response(global._respond_wrapper({ respond: { query_sid }, error: 'timeout' }));
    }
  }, 3000);



  let qsql = "select version()";
  let values = [];
  if (qstr.cmd === 'get-doc-flot-list') {
    qsql = `
    select
        dof.unc unc_doc_flot, dof.title, dof.name_flot, dif.description_flot, dif.img_flot, dif.model_flot
    from eqip.t_doc_flot dof
    left join eqip.t_dir_flot dif on dif.unc = dof.unc_dir_flot
    where dof.unc in (
        select gr.section_unc
        from eqip.t_doc_user_group ug
        left join eqip.t_dir_group tdg on tdg.unc = ug.unc_dir_group
        left outer join eqip.t_doc_group_interface gr on tdg.unc = gr.unc_dir_group
        where gr.section ~~ 'flot-list-container' and ug.unc_dir_user=${qstr.is_login_uid} )  
    order by dof.unc
        `;
    pg_query(qsql, []).then(function (data) {
      return _f_response(global._respond_wrapper({ respond: data, querystate: true }));
    }).catch((err) => {
      return _f_response(global._respond_wrapper({ error: err }));
    });
  }

  if (qstr.cmd === 'get-doc-equipment-and-sensor-list') {
    let unc_doc_flot = to_sql.integer_abs_ser(qstr.unc_doc_flot);
    if (unc_doc_flot.length === 0) { return _f_response(global._respond_wrapper({ error: 'emptyparam', respond: { target: 'unc_doc_flot' } })); }
    qsql = `
    select 
      doe.unc unc_doc_equipment,doe.unc_doc_flot,doe.title, doe.last_to_date, die.img_eq, die.model_eq, die.range_to_h,die.name_eq,
      (doe.last_to_date + (die.range_to_h::text||'h'::text)::interval) as next_to_date,
      ((doe.last_to_date + (die.range_to_h::text||'h'::text)::interval)-(now())::timestamp) as to_time_left,
      (select array_to_json(array_agg(gg.*))
      from (select dos.unc unc_doc_sensor, dos.title, diu.short_name_unit   
            from eqip.t_doc_sensor dos
            left join eqip.t_dir_sensor dis on dis.unc=dos.unc_dir_sensor
            left join eqip.t_dir_unit diu on diu.unc=dis.unc_dir_unit
            where dos.unc_doc_equipment = doe.unc)gg)as sensors
    from eqip.t_doc_equipment doe
    left join eqip.t_dir_equipment die on die.unc = doe.unc_dir_equipment
    where doe.unc_doc_flot in (${unc_doc_flot})    
    `;
    pg_query(qsql, []).then(function (data) {
      return _f_response(global._respond_wrapper({ respond: data, querystate: true }));
    }).catch((err) => {
      return _f_response(global._respond_wrapper({ error: err }));
    });
  }

  if (qstr.cmd === 'ins-new-tender') { 
    let unc_doc_equipment = to_sql.integer_abs(qstr.unc_doc_equipment);
    if (unc_doc_equipment.length === 0) { return _f_response(global._respond_wrapper({ error: 'emptyparam', respond: { target: 'unc_doc_equipment' } })); }
    let unc_dir_tender_job = to_sql.integer_abs(qstr.unc_dir_tender_job);
    if (unc_dir_tender_job.length === 0) { return _f_response(global._respond_wrapper({ error: 'emptyparam', respond: { target: 'unc_dir_tender_job' } })); }
    let time_h_todo_job = to_sql.float(qstr.time_h_todo_job);
    if (time_h_todo_job.length === 0) { return _f_response(global._respond_wrapper({ error: 'emptyparam', respond: { target: 'time_h_todo_job' } })); }
    let date_begin_job = to_sql.text(qstr.date_begin_job);
    if (date_begin_job.length === 0) { return _f_response(global._respond_wrapper({ error: 'emptyparam', respond: { target: 'date_begin_job' } })); }
    let description_tender = to_sql.text(qstr.description_tender);
    if (description_tender.length === 0) { description_tender = `''`; }

    qsql = `
    insert into eqip.t_doc_tender (unc_dir_user,unc_doc_equipment, unc_dir_tender_job, unc_dir_tender_status, description_tender, time_h_todo_job,date_begin_job)
    values (${qstr.is_login_uid},${unc_doc_equipment},${unc_dir_tender_job},1,${description_tender},${time_h_todo_job},${date_begin_job})
    returning unc as unc_doc_tender
    `;
    pg_query(qsql, []).then(function (data) {
      return _f_response(global._respond_wrapper({ respond: data, querystate: true }));
    }).catch((err) => {
      return _f_response(global._respond_wrapper({ error: err }));
    });
  }

  if (qstr.cmd === 'ins-new-deal') { 
    let unc_doc_offer = to_sql.integer_abs(qstr.unc_doc_offer);
    if (unc_doc_offer.length === 0) { return _f_response(global._respond_wrapper({ error: 'emptyparam', respond: { target: 'unc_doc_offer' } })); }
    let subject_deal = to_sql.text(qstr.subject_deal);
    if (subject_deal.length === 0) { subject_deal = `''`; }
    let description_deal = to_sql.text(qstr.description_deal);
    if (description_deal.length === 0) { description_deal = `''`; }

    qsql = `
    insert into eqip.t_doc_deal (unc_dir_user,unc_doc_offer, description_deal, subject_deal)
    values (${qstr.is_login_uid},${unc_doc_offer},${description_deal},${subject_deal})
    returning unc as unc_doc_deal
    `;
    pg_query(qsql, []).then(function (data) {
      return _f_response(global._respond_wrapper({ respond: data, querystate: true }));
    }).catch((err) => {
      return _f_response(global._respond_wrapper({ error: err }));
    });
  }


  if (qstr.cmd === 'get-doc-tender-and-offer-list') {
    qsql = `
    SELECT dot.unc unc_doc_tender, dot.unc_doc_equipment, dot.subject_tender, dot.description_tender,
        dot.date_tender, dot.date_begin_job, dot.time_h_todo_job,
        ditj.name_tender_job,diu.name_full,doe.title doc_equipment_title,
        die.model_eq,die.img_eq,die.name_eq,dits.name_tender_status,

        (select array_to_json(array_agg(gg.*))
        from (select
             doo1.unc unc_doc_offer, doo1.unc_dir_company,doo1.unc_dir_user,doo1.subject_offer,doo1.description_offer,doo1.price_offer,doo1.time_h_offer,
             doo1.date_offer,doo1.date_begin_offer,dic1.name_company,dic1.address,dic1.phone,diu1.name_full user_name_full,contr1.date_end date_end_contract
        from eqip.t_doc_offer doo1
        left join eqip.t_dir_company dic1 on dic1.unc = doo1.unc_dir_company
        left join eqip.t_dir_user diu1 on diu1.unc = doo1.unc_dir_user
        left join eqip.t_doc_tender dot1 on dot1.unc = doo1.unc_doc_tender
        left join eqip.t_doc_equipment doe1 on doe1.unc = dot1.unc_doc_equipment
        left join eqip.t_doc_contract contr1 on dic1.unc = contr1.unc_dir_company and contr1.unc_dir_equipment=dot1.unc_doc_equipment
        where doo1.unc_doc_tender=dot.unc)gg)as offer

    FROM eqip.t_doc_tender dot
    left join eqip.t_dir_tender_job ditj on ditj.unc = dot.unc_dir_tender_job
    left join eqip.t_dir_user diu on diu.unc = dot.unc_dir_user
    left join eqip.t_doc_equipment doe on doe.unc = dot.unc_doc_equipment
    left join eqip.t_dir_equipment die on die.unc = doe.unc_dir_equipment
    left join eqip.t_dir_tender_status dits on dits.unc = dot.unc_dir_tender_status
    `;
    pg_query(qsql, []).then(function (data) {
      return _f_response(global._respond_wrapper({ respond: data, querystate: true }));
    }).catch((err) => {
      return _f_response(global._respond_wrapper({ error: err }));
    });
  }

  if (qstr.cmd === 'get-doc-deal-list') {
    qsql = `
    select dod.unc unc_doc_deal,dot.unc unc_doc_tender,doo.unc unc_doc_offer,dof.unc unc_doc_flot,
      dif.description_flot,dif.img_flot,dif.model_flot,dof.title doc_flot_title,dof.name_flot doc_name_flot,
      die.name_eq name_eq,die.description_eq dir_description_eq,die.img_eq,die.model_eq,
      doe.title doc_eqipment_title,dits.name_tender_status, dot.subject_tender,dot.description_tender,
      dot.date_tender,dot.date_begin_job,dot.time_h_todo_job, ditj.name_tender_job, 
      dic_d.name_company dir_company_deal_name, dic_t.name_company dir_company_tender_name,
      doo.subject_offer ,doo.description_offer ,doo.price_offer ,doo.time_h_offer ,doo.date_offer ,doo.date_begin_offer,
      didr.name_deal_rating ,dids.name_deal_status
    from eqip.t_doc_deal dod
    left join eqip.t_dir_deal_status dids on dids.unc = dod.unc_dir_deal_status
    left join eqip.t_dir_deal_rating didr on didr.unc = dod.unc_dir_deal_rating
    left join eqip.t_doc_offer doo on doo.unc = dod.unc_doc_offer
    left join eqip.t_dir_company dic_d on dic_d.unc = doo.unc_dir_company 
    left join eqip.t_doc_tender dot on dot.unc = doo.unc_doc_tender
    left join eqip.t_dir_tender_job ditj on dot.unc_dir_tender_job = ditj.unc 
    left join eqip.t_dir_tender_status dits on dits.unc = dot.unc_dir_tender_status 
    left join eqip.t_dir_user diu on diu.unc = dot.unc_dir_user 
    left join eqip.t_dir_company dic_t on dic_t.unc =diu.unc_dir_company  
    left join eqip.t_doc_equipment doe on doe.unc = dot.unc_doc_equipment
    left join eqip.t_dir_equipment die on die.unc = doe.unc_dir_equipment
    left join eqip.t_doc_flot dof on doe.unc_doc_flot = dof.unc
    left join eqip.t_dir_flot dif on dof.unc_dir_flot = dif.unc
    `;
    pg_query(qsql, []).then(function (data) {
      return _f_response(global._respond_wrapper({ respond: data, querystate: true }));
    }).catch((err) => {
      return _f_response(global._respond_wrapper({ error: err }));
    });
  }

  if (qstr.cmd === 'set-deal-rating') { 

    let unc_doc_deal = to_sql.integer_abs(qstr.unc_doc_deal);
    let unc_dir_deal_rating = to_sql.integer_abs(qstr.unc_dir_deal_rating);
    let time_end_deal = to_sql.text(qstr.time_end_deal);
    let description_deal = to_sql.text(qstr.description_deal);

    if (unc_doc_deal.length === 0) { return _f_response(global._respond_wrapper({ error: 'emptyparam', respond: { target: 'unc_doc_deal' } })); }
    if (unc_dir_deal_rating.length === 0) { return _f_response(global._respond_wrapper({ error: 'emptyparam', respond: { target: 'unc_dir_deal_rating' } })); }

    let upd_item = [];

    if (unc_dir_deal_rating.length > 0) { upd_item.push(`unc_dir_deal_rating=${unc_dir_deal_rating}`); }
    if (time_end_deal.length > 0) { upd_item.push(`time_end_deal=${time_end_deal}`); }
    if (description_deal.length > 0) { upd_item.push(`description_deal=${description_deal}`); }


    qsql = `
      update eqip.t_doc_deal set ${upd_item.toString()} where unc=${unc_doc_deal}
    `;
    console.log('qsql :>> ', qsql);
    pg_query(qsql, []).then(function (data) {
      return _f_response(global._respond_wrapper({ respond: data, querystate: true }));
    }).catch((err) => {
      return _f_response(global._respond_wrapper({ error: err }));
    });
  }


  

  if (qstr.cmd === 'create-sensor-chart') {
    let unc_doc_sensor = to_sql.integer_abs_ser(qstr.unc_doc_sensor);
    if (unc_doc_sensor.length === 0) { return _f_response(global._respond_wrapper({ error: 'emptyparam', respond: { target: 'unc_doc_sensor' } })); }
    qsql = `
    select
        left(timezone('Europe/Minsk'::text, now())::text,19) chart_create_date,
        doe.title,
        die.img_eq, die.model_eq, die.range_to_h,die.name_eq,
        dis.name_sensor,
        (select array_to_json(array_agg(gg.*))
        from (select dosr.range_flag, dosr.range_color, dosr.range_min, dosr.range_max, dosr.range_dx, dosr.range_cnt, dosr.range_description
            from eqip.t_doc_sensor_range dosr
            where dosr.unc_doc_sensor=dos.unc)gg)as sensor_range,
        (select array_to_json(array_agg(gg.*))
        from (select dosd.val, dosd.range_flag, dosd.date_val
            from eqip.t_doc_sensor_data dosd
            where dosd.unc_doc_sensor=dos.unc)gg)as sensor_data
    from eqip.t_doc_sensor dos
    left join eqip.t_dir_sensor dis on dis.unc = dos.unc_dir_sensor
    left join eqip.t_doc_equipment doe on doe.unc = dos.unc_doc_equipment
    left join eqip.t_dir_equipment die on die.unc = doe.unc_dir_equipment
    where dos.unc in (${unc_doc_sensor})
    `;
    pg_query(qsql, []).then(function (data) {
      let chart_name = `${main.get_query_sid_from_qstr(qstr)}.json`;
      //! delete after dev BEGIN
      fs.writeFile(`${global._srv_dirname +'/html/itcase-dev/chart/'}${chart_name}`, JSON.stringify(data), function (err) {
        if (err) { console.log(err); }
      });
      //! delete after dev END
      fs.writeFile(`${chart_path}${chart_name}`, JSON.stringify(data), function (err) {
        if (err) { return _f_response(global._respond_wrapper({ error: err })); }
        return _f_response(global._respond_wrapper({ respond: { chart_name }, querystate: true }));
      });
    }).catch((err) => {
      return _f_response(global._respond_wrapper({ error: err }));
    });
  }








  /**     before query         ************************************************************************** */
  /**     before query         ************************************************************************** */
  /**     before query         ************************************************************************** */
  function pg_query(qsql, values) {
    return new Promise((resolve, reject) => {
      const pg_con = new PG(global._pg_config);

      pg_con.query(qsql, values, function (err, rez) {
        if (err) { /* error in PG module */
          err = { query: false, target: 'pg_query', qsql, err };
          console.log(err);
          reject(err);
        } else {
          if (rez.rows.length > 0) { /* row 0 is exixts */
            resolve(rez.rows);
          } else { /* query result is empty */
            resolve({ empty: true });
          }
        }
      });

    });
  }

  /** after query *************************************************************** */





  function _f_response(rez) {
    if (!res.headersSent) {
      res.setHeader('Content-Type', 'application/json');
      res.send(rez);
    } else {//global._send_var_to_redis = function (vname,vsend,vexpr)
      console.log('save >> ', query_sid);
      global._send_var_to_redis(query_sid, JSON.stringify(rez), 60);
    }
    global.rt = rez;
    return rez;
  }


};

module.exports.qjs = qjs;