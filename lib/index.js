let MS = require('jm-ms')
let error = require('jm-err')
let _ = require('lodash')
let t = require('./locale')
let consts = require('./consts')
let Logger = require('./logger')

let ms = MS()
let Err = _.defaults(error.Err, consts.Err)
let logger = Logger('main', __filename)

module.exports = function (opts) {
  opts || (opts = {})
  opts.schemaExt = {}
  let o = require('jm-user')(opts)
  o._router = o.router
  o.getLogger = Logger
  o.Err = Err
  o.utils = require('./utils')
  o.t = function (doc, lng, tr) {
    if (typeof lng === 'object') {
      tr = lng
      lng = null
    }
    lng || (lng = opts.lng)
    if (doc && lng && doc.err && doc.msg) {
      doc = {
        err: doc.err,
        msg: t(doc.msg, lng) || Err.t(doc.msg, lng) || doc.msg
      }
    }
    if (tr) {
      doc.msg = error.errMsg(doc.msg, tr)
    }
    return doc
  }
  o.router = require('./router')

  let bind = function (name, uri) {
    uri || (uri = '/' + name)
    ms.client({
      uri: opts.gateway + uri
    }, function (err, doc) {
      !err && doc && (o[name] = doc)
    })
  }
  bind('acl')

  return o
}
