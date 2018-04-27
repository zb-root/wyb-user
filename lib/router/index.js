var _ = require('lodash')
var error = require('jm-err')
var MS = require('jm-ms-core')
var ms = new MS()

var Err = error.Err
module.exports = function (opts) {
  opts || (opts = {})
  var config = opts
  var service = this
  var t = function (doc, lng) {
    if (doc && lng && doc.err && doc.msg) {
      return {
        err: doc.err,
        msg: service.t(doc.msg, lng) || Err.t(doc.msg, lng) || doc.msg
      }
    }
    return doc
  }
  service.routes || (service.routes = {})
  var routes = service.routes

  config.list = config.list || {
    conditions: {},

    options: {
      sort: [{'crtime': -1}]
    },

    fields: {
      // mobile: 0,
      salt: 0,
      password: 0,
      ext: 0
    },
    populations: {
      path: 'creator',
      select: {
        nick: 1
      }
    }
  }

  config.get = config.get || {
    fields: {
      // mobile: 0,
      salt: 0,
      password: 0
    },
    populations: {
      path: 'creator',
      select: {
        nick: 1
      }
    }
  }

  routes.filter_list_acl = function (opts, cb, next) {
    if (opts.headers && opts.headers.acl_user) {
      var user = opts.headers.acl_user
      service.acl.get('/isAllowed', {
        user: user,
        resource: 'global',
        permissions: opts.type
      }, function (err, doc) {
        if (!err && doc && doc.ret) {
          opts.headers.acl_global = true
          if (opts.fields) delete opts.fields.mobile
        }
        next()
      })
      return
    }
    next()
  }

  routes.filter_get_acl = function (opts, cb, next) {
    if (opts.headers && opts.headers.acl_user) {
      var user = opts.headers.acl_user
      if (opts.type === 'get') {
        if (opts.params.id && opts.params.id === user) {
          opts.fields = {
            salt: 0,
            password: 0
          }
          return next()
        }
      }
      if (opts.type === 'post') {
        if (opts.params.id && opts.params.id === user) {
          opts.fields = {
            salt: 0,
            password: 0
          }
          return next()
        }
      }
      if (opts.params.id && opts.params.id !== user) {
        service.acl.get('/isAllowed', {
          user: user,
          resource: 'global',
          permissions: opts.type
        }, function (err, doc) {
          if (!err && doc && doc.ret) {
            opts.headers.acl_global = true
            if (opts.fields) delete opts.fields.mobile
            return next()
          } else {
            cb(null, t(Err.FA_NOPERMISSION, opts.lng))
          }
        })
        return
      }
    }
    next()
  }

  var checkUid = function (code) {        //检查生成的code是否符合规则
    var str = code.toString()
    var pattern = /(\w)*(\w)\2{2}(\w)*/g                  //验证连续三位数是否相同的
    if (pattern.test(str)) {
      var strsub = str.substring(0, 3)
      var increase = 1
      if (pattern.test(strsub)) increase = 100
      return false
    }

    pattern = /((\d){3})\1{1}/g                  //验证ABCABC型
    if (pattern.test(str)) return false

    var str1 = str.substring(0, 3)           //验证ABCCBA型
    var str2 = str.substring(3, 6)
    str2 = str2.split('').reverse().join('')        //反转
    var str12 = str1.concat(str2)
    pattern = /((\d){3})\1{1}/g
    if (pattern.test(str12)) return false

    var strList = str.split('')                  //验证是否AB型(只由两个数字组成)
    var numList = []
    strList.forEach(function (item) {
      if (numList.indexOf(Number(item)) == -1) {
        numList.push(Number(item))
      }
    })
    if (numList.length <= 2) return false

    strList = str.split('')                //验证顺子型(12345,23456)
    var judge = true
    for (var i = 1; i < strList.length; i++) {
      if (Number(strList[i]) != (Number(strList[i - 1]) + 1)) {
        judge = false
        break
      }
    }
    if (judge) return false

    return true
  }

  var router = ms.router()
  router
    .add('/users/:id', 'get', function (opts, cb, next) {
      if (!opts.fields) {
        opts.fields = _.clone(config.get.fields)
      }
      next()
    })
    .add('/users', 'get', function (opts, cb, next) {
      if (!opts.fields) {
        opts.fields = _.clone(config.list.fields)
      }
      next()
    })
    .use('/users', routes.filter_list_acl)
    .use('/users/:id', routes.filter_get_acl)
    .add('/findUser', 'get', function (opts, cb) {
      var data = opts.data || {}
      var defaultField = {
        uid: 1,
        account: 1,
        mobile: 1,
        name: 1,
        nick: 1,
        gender: 1,
        signature: 1,
        idtype: 1,
        idcard: 1
      }
      var fields = data.fields
      var conditions = data.conditions
      if (conditions) {
        if (typeof conditions === 'string') {
          try {conditions = JSON.parse(conditions)} catch (e) {conditions = null}
        }
        if (!_.isPlainObject(conditions)) {
          return cb(null, {})
        }
      }
      if (fields) {
        if (typeof fields === 'string') {
          try {fields = JSON.parse(fields)} catch (e) {fields = defaultField}
        }
        if (!_.isPlainObject(fields)) {
          fields = defaultField
        }
      } else {
        fields = defaultField
      }
      fields = _.omit(fields, ['password', 'salt'])
      service.user.findOne(conditions, fields, function (err, doc) {
        if (err) return cb(null, err)
        cb(null, doc || {})
      })
    })
    .use(service._router(opts))
  return router
}
