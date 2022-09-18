/*jshint esversion: 6*/
/**
 * Main
 */
let main = {};

main.get_vname_from_qstr = function (qstr) {
  let vname;
  for (let i in qstr.query) { if (typeof qstr.query[i] === 'object') { break; } vname += '-' + qstr.query[i]; }
  return vname;
};
main.get_query_sid_from_qstr = function (qstr) {
  return `${qstr.app}${qstr.cmd}${(new Date(Date.now()).toISOString().replace(/\s|\,|:|\./g, '-'))}`;
};
main.now = function (variant) {
  let ret;
  if(variant===undefined) {
    ret = new Date(new Date().valueOf() + 10800000).toISOString().substring(0, 19).replace('T', ' '); // 10800000 = GMT+3;
  }else{
    ret = new Date().toLocaleString('ru-RU',{timeZone:'Europe/Minsk'});
  }
  return ret;
};

/**
 * ToSQL
 */
var to_sql = {};
to_sql.integer = function (param) {
  let result = (param !== undefined && param.length > 0 ? param.toString().replace(/[^0-9\-]/g, '') : '');
  return result;
};
to_sql.integer_abs = function (param) {
  let result = (param !== undefined && param.length > 0 ? param.toString().replace(/[^0-9]/g, '') : '');
  return result;
};
to_sql.integer_ser = function (param) {
  let result = (param !== undefined && param.length > 0 ? param.toString().replace(/[^0-9\-\,]/g, '') : '');
  return result;
};
to_sql.integer_abs_ser = function (param) {
  let result = (param !== undefined && param.length > 0 ? param.toString().replace(/[^0-9\,]/g, '') : '');
  return result;
};
to_sql.float = function (param) {
  let result = (param !== undefined && param.length > 0 ? param.toString().replace(/[^0-9\.\-]/g, '') : '');
  return result;
};
to_sql.float_abs = function (param) {
  let result = (param !== undefined && param.length > 0 ? param.toString().replace(/[^0-9\.]/g, '') : '');
  return result;
};
to_sql.text = function (param) {
  let result = (param !== undefined && param.length > 0 ? param.toString().replace(/[^a-zA-Z0-9а-яА-Я\s\.\,\!\?\:\-\+\*\(\)\\]/g, '') : '');
  if (result.length > 0) {
    result = `'${result}'`;
  }
  return result;
};
to_sql.alias = function (param) {
  let result = (param !== undefined && param.length > 0 ? param.toString().replace(/[^a-zA-Z0-9\:\-\+\(\)]/g, '') : '');
  if (result.length > 0) {
    result = `'${result}'`;
  }
  return result;
};
to_sql.date_ora = function (param) {
  let result = (param !== undefined && param.length > 0 ? param.toString().replace(/[^0-9\.\-]/g, '') : '');
  if (result.length === 10 && result.toString()[2] === '.' && result.toString()[5] === '.') { //* DD.MM.YYYY
    result = `to_date('${result}','DD.MM.YYYY')`;
  } else if (result.length === 10 && result.toString()[4] === '-' && result.toString()[7] === '-') { //* YYYY-MM-DD
    result = `to_date('${result}','YYYY-MM-DD')`;
  } else {
    result = '';
  }
  return result;
};
to_sql.date_pg = function (param) {
  let result = (param !== undefined && param.length > 0 ? param.toString().replace(/[^0-9\.\-]/g, '') : '');
  if (result.length === 10 &&
    ((result.toString()[2] === '.' && result.toString()[5] === '.') ||
      (result.toString()[4] === '-' && result.toString()[7] === '-'))) { //* DD.MM.YYYY or YYYY-MM-DD
    result = `'${result}'::date`;
  } else {
    result = '';
  }
  return result;
};

/**
 * SeparateParams
 */
 var separate_params = {};
 separate_params.integer = function (param) {
   let result = (param !== undefined && param.length > 0 ? param.toString().replace(/[^0-9\-]/g, '') : '');
   return result;
 };
 separate_params.integer_abs = function (param) {
   let result = (param !== undefined && param.length > 0 ? param.toString().replace(/[^0-9]/g, '') : '');
   return result;
 };
 separate_params.float = function (param) {
   let result = (param !== undefined && param.length > 0 ? param.toString().replace(/[^0-9\.\-]/g, '') : '');
   return result;
 };
 separate_params.float_abs = function (param) {
   let result = (param !== undefined && param.length > 0 ? param.toString().replace(/[^0-9\.]/g, '') : '');
   return result;
 };
 separate_params.text = function (param) {
   let result = (param !== undefined && param.length > 0 ? param.toString().replace(/[^a-zA-Z0-9а-яА-Я\s\.\,\!\?\:\-\+\*\(\)\\]/g, '') : '');
   return result;
 };

module.exports.SeparateParams = separate_params;
module.exports.ToSQL = to_sql;
module.exports.Main = main;