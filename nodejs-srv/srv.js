/*jshint esversion: 9 */
const express = require('express');
const session = require('express-session');
const redis = require('redis');
const fs = require('fs');
const node_origin = '*/itcase-backend/';
global._rdclient = redis.createClient();
global._srv_dirname = __dirname;

try {
  global._pg_config = JSON.parse(fs.readFileSync('./pg_config.json', 'utf8'));
} catch (err) {
  console.log(err);
  global._pg_config = {
    user: 'user_itcase',
    host: '192.168.126.25',
    database: 'itcase',
    password: 'itcase',
    port: 54011
  };
}

const port = process.env.NODE_PORT || 8080;
var app = express();
app.use(session({
  key: 'user_sid',
  secret: 'beloil.tu-itcase-session',
  saveUninitialized: true,
  resave: true
}));
app.use(express.urlencoded({
  extended: true
})); // support encoded bodies
app.use(express.json()); // To parse the incoming requests with JSON payloads
app.enable('trust proxy');
app.use(express.static('html'));

global._rdclient.on('connect', function () {
  console.log('REDIS connected');
});

const check_app = function (req, res, next) {
  if (req.query.app === undefined && req.body.app === undefined) {
    res.sendFile(__dirname + '/index.html');
  } else {
    next();
  }
};
const check_login = function (req, res, next) {

  global._rdclient.get(req.sessionID, function (err, reply) {
    if (err) {
      res.send(_respond_wrapper({
        error: err
      }));
      return JSON.stringify({
        'rez': err
      });
    }
    if (reply == null) {
      reply = {
        "is_login": false,
        "is_login_uname": "",
        "is_login_uid": 0,
        "nopermission": true,
        "permission": "empty-perm"
      };
      req.perm = reply;
      res.setHeader('Content-Type', 'application/json');
      res.send(_respond_wrapper({
        respond: reply
      }));
      return reply;
    } else {
      global._rdclient.expire(req.sessionID, 300);
      req.perm = reply;
      next();
    }
  });
};
const check_perm = function (req, res, next) {
  var perm = JSON.parse(req.perm);
  var app = req.query.app || req.body.app;
  var cmd = req.query.cmd || req.body.cmd;
  req.is_login_uname = perm.is_login_uname;
  req.is_login_uid = perm.is_login_uid;
  perm = perm.permission;
  var check = false;
  for (let i = 0; i < perm.length; i++) {
    const el = perm[i];
    if ((el.app.indexOf(app) >= 0 || el.app.indexOf('ALL') == 0) && (el.perm.indexOf(cmd) >= 0 || el.perm.indexOf('ALL') >= 0)) {

      check = true;
      break;
    }
  }
  if (check) {
    next();
  } else {
    reply = {
      "nopermission": true,
      "permission": "mistmach-perm"
    };
    req.perm = reply;
    res.setHeader('Content-Type', 'application/json');
    res.send(_respond_wrapper({
      respond: reply
    }));
    return reply;
  }
};

global._respond_wrapper = function ({
  respond = [],
  querystate = false,
  memoized = false,
  errorstate,
  error
}) {
  errorstate = errorstate || error !== undefined;
  return {
    "querystate": querystate,                   /* было ли обращение к базе */
    "memoized": memoized,                       /* ответ сервера взят из памяти Redis */
    "errorstate": errorstate,                   /* была ли ошибка при обработке на сервере */
    "error": error !== undefined ? error : [],  /* состав ошибки если она была */
    "respond": respond                          /* ответ сервера */
  };
};

/**
 * how to use in modules:
 * 
 *  global._respond_wrapper({переменная:значение,...}) 
 * 
 *  respond - (DEFAULT []) ответ сервера
 *  querystate - (DEFAULT false) было ли обращение к базе
 *  memoized - (DEFAULT false) ответ сервера мемоизирован (взят из памяти Redis)
 *  errorstate - была ли ошибка при обработке на сервере, переходит в true при передаче параметра error если не была принудительно установлена
 *  error - состав ошибки если она была
 * 
 *  examples
 *  global._respond_wrapper({querystate:true,respond:rez});
 *  global._respond_wrapper({respond:_f_get_current_user_grants(qstr)});
 *  global._respond_wrapper({respond:qstr})
 *  global._respond_wrapper({error:noparams})
 */


app.get(node_origin + 'session-check', function (req, res) { // check session exist without extend session life
  global._rdclient.get(req.sessionID, function (err, reply) {
    if (err) {
      res.send(_respond_wrapper({
        error: err
      }));
      return JSON.stringify({
        'rez': err
      });
    }
    res.setHeader('Content-Type', 'application/json');
    if (reply == null) {
      reply = {
        "is_login": false,
        "is_login_uname": "",
        "is_login_uid": 0,
        "nopermission": true,
        "permission": "empty-perm"
      };
      res.send(_respond_wrapper({
        respond: reply
      }));

    } else {
      res.send(_respond_wrapper({
        respond: JSON.parse(reply)
      }));

    }

    return reply;
  });
});
app.get(node_origin + 'session-alive', check_login, function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.send(_respond_wrapper({
    respond: JSON.parse(req.perm)
  }));
});


app.get(node_origin + 'logout', function (req, res) {
  global._rdclient.del(req.sessionID);
  req.session.destroy();
  res.send(_respond_wrapper({
    respond: {
      sid: req.sessionID,
      canceled: true
    }
  }));
});

var login = require('../login/login.js');
app.post(node_origin + 'login', function (req, res) { 

  var qstr = {
    sessionID: req.sessionID,
    uName: req.body.uName,
    uPassw: req.body.uPassw,
    ip: undefined
  };
  global.qstr={};
  global.qstr = qstr;
  global.rt = JSON.stringify({
    'rez': 'no-app'
  });

  if (!req.body) return res.sendStatus(400);
  let ap = '';
  login.qjs(qstr, res);

});



const check_memoize_var = function (req, res, next) {
  let vname = '';
  let rq = {
    ...req.query,
    ...req.body
  };
  for (let i in rq) {
    if (typeof rq[i] === 'object') {
      break;
    }
    vname += '-' + rq[i];
  }

  global._rdclient.get(vname, function (err, reply) {
    if (err) {
      res.send(_respond_wrapper({
        error: err
      }));
      return JSON.stringify({
        'rez': err
      });
    }
    if (reply !== null) {
      try {
        reply = JSON.parse(reply);
      } catch (error) {
        console.log('reply JSON.parse error :>> ', reply);
      }
      console.log('var-memoized', vname);
      res.setHeader('Content-Type', 'application/json');
      res.send(_respond_wrapper({
        respond: reply,
        memoized: true
      }));
      return reply;
    } else {
      next();
    }
  });
};

function save_variable_to_redis(vname, vsend, vexpr) {
  if (vname.length || vsend.length) {
    global._rdclient.set(vname, vsend);
    global._rdclient.expire(vname, vexpr || 300); //300 = 5min
    console.log(vname);
  }
}


/** 
 * global._redis_generate_var_name => генерирует уникальное имя переменной для REDIS
 * how to use in modules:
 *     
 *     global._redis_generate_var_name(qstr); // без указания жизни переменной, будет хранится 5 минут
 * 
 *    qstr  - переменная qstr соответствующая сессии модуля из которого передаются данные
 */
global._redis_generate_var_name = function (local_qstr) {
  return `${local_qstr.app}${local_qstr.cmd}${(new Date(Date.now()).toISOString().replace(/\s|\,|:|\./g,'-'))}`;
};


/** 
 * global._redis_send_var => сохраняет переменную в REDIS
 * how to use in modules:
 *     
 *     global._redis_send_var(vname,JSON.stringify(rez)); // без указания жизни переменной, будет хранится 5 минут
 *     global._redis_send_var(vname,JSON.stringify(rez),600); // с указанием произвольной жизни переменной
 * 
 *    vname - имя переменной в REDIS, можно использовать global._redis_generate_var_name
 *    vdata - значение переменной которое будет положено в redis в виде строки
 *    vexpr - время жизни переменной, указывается в секундах, по умолчанию 5 минут
 */
global._redis_send_var = function (vname, vdata, vexpr) {
  save_variable_to_redis(vname, vdata, vexpr);
};


/** 
 * global._redis_memoize_var => производит мемоизацию переменной в REDIS
 * how to use in modules:
 *     
 *     global._redis_memoize_var(qstr,JSON.stringify(rez)); // без указания жизни переменной, будет хранится 5 минут
 *     global._redis_memoize_var(qstr,JSON.stringify(rez),600); // с указанием произвольной жизни переменной
 * 
 *    qstr  - переменная qstr соответствующая сессии модуля из которого передаются данные
 *    vdata - значение переменной которое будет положено в redis в виде строки
 *    vexpr - время жизни переменной, указывается в секундах, по умолчанию 5 минут
 */
global._redis_memoize_var = function (local_qstr, vdata, vexpr) {
  let vname = '';
  for (let i in local_qstr.fullquery) {
    if (typeof local_qstr.fullquery[i] === 'object') {
      break;
    }
    vname += '-' + local_qstr.fullquery[i];
  }
  save_variable_to_redis(vname, vdata, vexpr);
};




function load_module(req, res) {
  let conf = {
    "reloadmodules": true
  };
  try {
    conf = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
  } catch (err) {
    console.log(err);
  }
  global.qstr = {
    ...req.query,
    ...req.body
  };
  global.qstr.fullquery = {
    ...req.query,
    ...req.body
  };
  global.qstr.sessionID = req.sessionID;
  global.qstr.perm = JSON.parse(req.perm);
  global.qstr.is_login_uname = req.is_login_uname;
  global.qstr.is_login_uid = req.is_login_uid;
  global.qstr.is_app_unc = req.is_app_unc;

  if (!qstr.app) {
    res.sendFile(__dirname + '/index.html');
  } else {
    var ap = qstr.app;
    global.rt = {
      status: 'no-app-found',
      app: ap
    };
    ap = '../' + ap + '/' + ap + '.js';
    if (fs.existsSync(ap)) {
      if (conf.reloadmodules) {
        console.log('unload module >> ', ap);
        delete require.cache[require.resolve(ap)];
      }
      var apjs = require(ap);
      apjs.qjs(req, res, qstr);
    } else {
      res.send(_respond_wrapper({
        error: global.rt
      }));
    }
  }
}

app.get(node_origin, check_app, check_login, check_perm, check_memoize_var, function (req, res) {
  load_module(req, res);
});
app.post(node_origin, check_app, check_login, check_perm, check_memoize_var, function (req, res) {
  load_module(req, res);
});

app.listen(port);
console.log('Сервер стартовал!');