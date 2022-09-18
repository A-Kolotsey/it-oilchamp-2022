/*jshint esversion: 6 */
const PG = require('pg').Pool;
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

  if (qstr.cmd === 'ins-new-offer') {
    let unc_doc_tender = to_sql.integer_abs(qstr.unc_doc_tender);
    if (unc_doc_tender.length === 0) { return _f_response(global._respond_wrapper({ error: 'emptyparam', respond: { target: 'unc_doc_tender' } })); }
    let time_h_offer = to_sql.float(qstr.time_h_offer);
    if (time_h_offer.length === 0) { return _f_response(global._respond_wrapper({ error: 'emptyparam', respond: { target: 'time_h_offer' } })); }
    let price_offer = to_sql.float(qstr.price_offer);
    if (price_offer.length === 0) { return _f_response(global._respond_wrapper({ error: 'emptyparam', respond: { target: 'price_offer' } })); }
    let date_begin_offer = to_sql.text(qstr.date_begin_offer);
    if (date_begin_offer.length === 0) { return _f_response(global._respond_wrapper({ error: 'emptyparam', respond: { target: 'date_begin_offer' } })); }
    let subject_offer = to_sql.text(qstr.subject_offer);
    if (subject_offer.length === 0) { subject_offer = `''`; }
    let description_offer = to_sql.text(qstr.description_offer);
    if (description_offer.length === 0) { description_offer = `''`; }

    qsql = `
    insert into eqip.t_doc_offer (unc_dir_user,unc_doc_tender, subject_offer, description_offer, price_offer, time_h_offer, date_begin_offer,unc_dir_company)
    select 
      ${qstr.is_login_uid} unc_dir_user,
      ${unc_doc_tender} unc_doc_tender,
      ${subject_offer} subject_offer,
      ${description_offer} description_offer,
      ${price_offer} price_offer,
      ${time_h_offer} time_h_offer,
      ${date_begin_offer} date_begin_offer,
      diu.unc_dir_company from eqip.t_dir_user diu where diu.unc=${qstr.is_login_uid}
    returning unc as unc_doc_offer
    `;
    pg_query(qsql, []).then(function (data) {
      return _f_response(global._respond_wrapper({ respond: data, querystate: true }));
    }).catch((err) => {
      return _f_response(global._respond_wrapper({ error: err }));
    });
  }


  if (qstr.cmd === 'get-doc-offer-list') {
    qsql = `
    select dot.unc unc_doc_tender,unc_doc_equipment, doo.unc_dir_user ,doo.unc unc_doc_offer,
      dot.date_tender ,dot.date_begin_job ,dot.time_h_todo_job, 
      doo.price_offer ,doo.time_h_offer ,doo.date_offer ,doo.date_begin_offer, 
      ditj.name_tender_job ,dits.name_tender_status, 
      doe.title ,die.name_eq ,die.img_eq ,die.model_eq ,dic.name_company dir_company_tender_name
    from eqip.t_doc_tender dot
    left join eqip.t_doc_offer doo on dot.unc = doo.unc_doc_tender
    left join eqip.t_dir_tender_job ditj on ditj.unc = dot.unc_dir_tender_job
    left join eqip.t_dir_tender_status dits on dits.unc = dot.unc_dir_tender_status
    left join eqip.t_doc_equipment doe on doe.unc = dot.unc_doc_equipment
    left join eqip.t_dir_equipment die on die.unc = doe.unc_dir_equipment
    left join eqip.t_dir_user diu on diu.unc = dot.unc_dir_user 
    left join eqip.t_dir_company dic on dic.unc = diu.unc_dir_company 
    where doo.unc_dir_user =${qstr.is_login_uid}    `;
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
    where doo.unc_dir_user =${qstr.is_login_uid}
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