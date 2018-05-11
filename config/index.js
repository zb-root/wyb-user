require('log4js').configure(require('path').join(__dirname, 'log4js.json'))
let config = {
  development: {
    port: 3000,
    lng: 'zh_CN',

    // config: 'http://api.h5.jamma.cn/config', // 可选 如果不填，必须设置sdk
    // sso: 'http://api.h5.jamma.cn/sso', // 可选 如果不填，必须设置sdk
    // acl: 'http://api.h5.jamma.cn/acl',

    // db: 'mongodb://localhost/main',
    db: 'mongodb://root:123@api.h5.jamma.cn/wyb?authSource=admin',
    avatarDir: process.cwd() + '/../uploads',
    avatarPrefix: '/avatar',
    mqtt: 'mqtt://root:123@api.h5.jamma.cn',
    gateway: 'http://api.wyb.jamma.cn:81',
    modules: {
      // 'jm-server-config': {},
      // 'jm-server-sso': {},
      // 'jm-server-acl': {},
      'user': {
        module: process.cwd() + '/lib'
      },
      'jm-user-mqtt': {}
    }
  },
  production: {
    port: 80,
    lng: 'zh_CN',
    db: 'mongodb://mongo.db/user',
    gateway: 'http://gateway.wyb',
    avatarDir: process.cwd() + '/../uploads',
    avatarPrefix: '/avatar',
    tokenExpire: 3600,
    disableVerifyCode: false,
    disableAutoUid: false,
    modules: {
      'user': {
        module: process.cwd() + '/lib'
      },
      'jm-user-mqtt': {}
    }
  }
}

let env = process.env.NODE_ENV || 'development'
config = config[env] || config['development']
config.env = env

module.exports = config
