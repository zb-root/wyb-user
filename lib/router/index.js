let _ = require('lodash')
let MS = require('jm-ms-core')
let ms = new MS()

module.exports = function (opts = {}) {
  let config = opts
  let service = this
  let t = service.t
  let Err = service.Err
  let logger = service.getLogger('main', __filename)

  service.routes || (service.routes = {})
  let routes = service.routes

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
      let user = opts.headers.acl_user
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
      let user = opts.headers.acl_user
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

  let router = ms.router()
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
    .add('/users/:id', 'post', function (opts, cb, next) {
      let id = opts.params.id
      let data = opts.data
      if (data.idcard && !service.utils.isIdCardNo(data.idcard)) {
        return cb(null, t(Err.FA_INVALID_IDCARD, opts.lng))
      }
      logger.debug('update user: ' + JSON.stringify(data))
      if (data.idcard && data.name) {
        service.acl.post('/users', {
          _id: id,
          nick: data.name,
          status: 1,
          visible: true,
          roles: ['authuser'],
          creator: opts.headers.acl_user
        }, function (err, doc) {
          if (err || (doc && doc.err)) {
            logger.warn(JSON.stringify(err || doc))
          }
          logger.debug('acl user: ' + JSON.stringify(doc))
        })
      }
      next()
    })
    .add('/findUser', 'get', function (opts, cb) {
      let data = opts.data || {}
      let defaultField = {
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
      let fields = data.fields
      let conditions = data.conditions
      if (conditions) {
        if (typeof conditions === 'string') {
          try {conditions = JSON.parse(conditions)} catch (e) {conditions = null}
        }
        if (!_.isPlainObject(conditions)) {
          return cb(null, null)
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
        cb(null, doc)
      })
    })
    .use(service._router(opts))

  return router
}
