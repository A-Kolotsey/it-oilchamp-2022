/*jshint esversion: 6 */
const PG = require('pg').Pool;
const fs = require('fs');
const to_sql = require('../classes/srv-classes').ToSQL;
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
  if (qstr.cmd === 'get-dir-flot-timing') {
    qsql = `
    SELECT unc, code_timing, name_timing
    FROM eqip.t_dir_flot_timing
    `;
    pg_query(qsql, []).then(function (data) {
      return _f_response(global._respond_wrapper({ respond: data, querystate: true }));
    }).catch((err) => {
      return _f_response(global._respond_wrapper({ error: err }));
    });
  }


  if (qstr.cmd === 'get-dir-tender-job') {
    qsql = `
    SELECT ditj.unc unc_dir_tender_job, ditj.name_tender_job
    FROM eqip.t_dir_tender_job ditj
    `;
    pg_query(qsql, []).then(function (data) {
      return _f_response(global._respond_wrapper({ respond: data, querystate: true }));
    }).catch((err) => {
      return _f_response(global._respond_wrapper({ error: err }));
    });
  }
  if (qstr.cmd === 'get-dir-tender-status') {
    qsql = `
    SELECT dits.unc unc_dir_tender_status, dits.name_tender_status
    FROM eqip.t_dir_tender_status dits
    `;
    pg_query(qsql, []).then(function (data) {
      return _f_response(global._respond_wrapper({ respond: data, querystate: true }));
    }).catch((err) => {
      return _f_response(global._respond_wrapper({ error: err }));
    });
  }

  if (qstr.cmd === 'get-dir-deal-rating') {
    qsql = `
    SELECT unc unc_dir_deal_rating, name_deal_rating
    FROM eqip.t_dir_deal_rating    
    `;
    pg_query(qsql, []).then(function (data) {
      return _f_response(global._respond_wrapper({ respond: data, querystate: true }));
    }).catch((err) => {
      return _f_response(global._respond_wrapper({ error: err }));
    });
  }


  if (qstr.cmd === 'get-doc-tender-list') {
    qsql = `
    SELECT dot.unc unc_doc_tender, dot.unc_doc_equipment, dot.subject_tender, dot.description_tender,
        dot.date_tender, dot.date_begin_job, dot.time_h_todo_job,
        ditj.name_tender_job,diu.name_full user_name_full,
        doe.title doc_equipment_title,
        die.model_eq,die.img_eq,die.name_eq,dits.name_tender_status
    FROM eqip.t_doc_tender dot
    left join eqip.t_dir_tender_job ditj on ditj.unc = dot.unc_dir_tender_job
    left join eqip.t_dir_user diu on diu.unc = dot.unc_dir_user
    left join eqip.t_doc_equipment doe on doe.unc = dot.unc_doc_equipment
    left join eqip.t_dir_equipment die on die.unc = doe.unc_dir_equipment
    left join eqip.t_dir_tender_status dits on dits.unc = dot.unc_dir_tender_status
    where die.unc in (
    SELECT unc_dir_equipment
    FROM eqip.t_doc_contract contr
    where now() between date_begin and date_end
      and contr.unc_dir_company = (select diu.unc_dir_company from eqip.t_dir_user diu where diu.unc=${qstr.is_login_uid})
    )
    `;
    pg_query(qsql, []).then(function (data) {
      return _f_response(global._respond_wrapper({ respond: data, querystate: true }));
    }).catch((err) => {
      return _f_response(global._respond_wrapper({ error: err }));
    });
  }


  if (qstr.cmd === 'get-chart-list') {
    let chart_folder = __dirname.replace('/itcase-pg-query-basic', '/nodejs-srv/html/itcase-dev/chart/');
    let chart_list = [];
    fs.readdir(chart_folder, (err, files) => {
      if (err) {
        console.log('error search charts :>> ', err);
        return _f_response(global._respond_wrapper({ error: err }));
      } else {
        files.forEach(file => {
          if (file.indexOf('.json')>0) {
            let date = file.split('.')[0].replace('itcase-pg-query-corporatecreate-sensor-chart','');
            chart_list.push({file,date});
          }
        });
        return _f_response(global._respond_wrapper({ respond: chart_list, querystate: false }));
      }
    });
  }

  /**     messages         ************************************************************************** */

  if (qstr.cmd === 'get-dir-user-list') {
    let unc_dir_company = to_sql.integer_abs(qstr.unc_dir_company);
    if (unc_dir_company.length !== 0) { unc_dir_company = `where diu.unc_dir_company=${unc_dir_company}`; }

    qsql = `
    select diu.unc unc_dir_user, diu.unc_dir_company, diu.name_full, dic.name_company  
    from eqip.t_dir_user diu
    left join eqip.t_dir_company dic on dic.unc = diu.unc_dir_company  
    ${unc_dir_company}
    `;
    pg_query(qsql, []).then(function (data) {
      return _f_response(global._respond_wrapper({ respond: data, querystate: true }));
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
            resolve({ query: true, result: "empty" });
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