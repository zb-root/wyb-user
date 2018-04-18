var mongoose = require('mongoose')
var Schema = mongoose.Schema
var MS = require('jm-ms')
var ms = MS()
module.exports = function (opts) {
  opts || (opts = {})
  opts.schemaExt = {
    
  }
  var o = require('jm-user')(opts)
  o._router = o.router
  o.router = require('./router')
  var bind = function (name, uri) {
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