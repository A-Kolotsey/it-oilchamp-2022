/*jshint esversion:6*/
const PG = require('pg').Pool;

global.rt = JSON.stringify( { 'rez': 'bad-cmd' } );




var qjs = function ( qstr, res ) {


// "   select l.perm,l.app , '"+qstr.sessionID+"' as sid "+
// "   select l.perm,l.app , '" +qstr.ip+"' as ip, '"+qstr.sessionID+"' as sid "+
  // var qsql = `   
  // select g.app,g.perm,g.applink,l.uname is_login_uname, l.unc is_login_uid,g.unc is_app_unc, 1::bool is_login, 0::bool is_login_dc, l.ldap_srv
  // from nsi.t_sys_login_users_grants g left join nsi.t_sys_login_users l on l.unc = g.unc_usr
  // where upper(l.uname) ~~ upper('${qstr.uName}') and l.upass ~~ '${qstr.uPassw}' and l.location ~~ 'LOCAL'
  // `;
  var qsql = `   
  select  l.ulogin is_login_uname,
    l.unc is_login_uid,
    1::bool as is_login,
    (select array_to_json(array_agg(gg.*))
    from (select gr.app,gr.perm
    from eqip.t_doc_user_group ug
    left join eqip.t_dir_group tdg on tdg.unc = ug.unc_dir_group
    left outer join eqip.t_doc_group_rights gr on tdg.unc = gr.unc_dir_group
    where gr.app notnull and ug.unc_dir_user=l.unc)gg)as permission,
    (select array_to_json(array_agg(gg.*))
    from (select gr.section,gr.section_unc
    from eqip.t_doc_user_group ug
    left join eqip.t_dir_group tdg on tdg.unc = ug.unc_dir_group
    left outer join eqip.t_doc_group_interface gr on tdg.unc = gr.unc_dir_group
    where gr.section notnull and gr.section_unc=0 and ug.unc_dir_user=l.unc)gg)as interface
  from eqip.t_dir_user l
  where upper(l.ulogin) ~~ upper('${qstr.uName}') and l.upassw ~~ '${qstr.uPassw}'
  `;



  const pg_con = new PG(global._pg_config);

  pg_con.query(qsql,function(err,rez){
    if (err) {
      global.rt = JSON.stringify({'rez':err});
      console.log(err);
      res.send(global._respond_wrapper({error:err}));
      return JSON.stringify({'rez':err});
    }else{
      if(rez.rows[0] /* row 0 is exixts */){
        if (rez.rows.length===1) {
          rez=rez.rows[0];
        } else {
          rez=rez.rows;
        }
        if (rez.interface===null) {
          rez.interface=[];
        }
        if (rez.permission===null) {
          rez.permission=[];
        }

        global._rdclient.set(qstr.sessionID,JSON.stringify(rez));
        global._rdclient.expire(qstr.sessionID,300); //300 = 5min

        global.rt = rez;
        res.setHeader('Content-Type', 'application/json');
        res.send(global._respond_wrapper({respond:rez}));
        return rez;
  
      }else{ /* query result is empty */
        let norow = {"is_login":false,"is_login_uname":"","is_login_uid":0,"is_login_dc":false};
        global.rt = norow;
        try {
          res.setHeader('Content-Type', 'application/json');
          res.send(global._respond_wrapper({respond:norow}));
        } catch (error) {
          console.log(error);          
        }
        return norow;
  
      }
    }
  });

  // sql.query(qsql, { type: sql.QueryTypes.SELECT}).then(function (row,num) {
  //   if(row[0] /* row 0 is exixts */){
  //     global._rdclient.set(qstr.sessionID,JSON.stringify(row));
  //     global._rdclient.expire(qstr.sessionID,300); //300 = 5min

  //     global.rt = row;
  //     res.setHeader('Content-Type', 'application/json');
  //     res.send(row);
  //     return row;

  //   }else{ /* query result is empty */
  //     var norow = {"is_login":false,"is_login_uname":"","is_login_uid":0};
  //     global.rt = norow;
  //     res.setHeader('Content-Type', 'application/json');
  //     res.send(norow);
  //     return norow;

  //   }

  // })
  // .catch(function (err)  {
  //   global.rt = JSON.stringify({'rez':err});
  //   console.log(err);
  //   res.send(err);
  //   return JSON.stringify({'rez':err});
  // });



  //обработка добавления






};

module.exports.qjs = qjs;

