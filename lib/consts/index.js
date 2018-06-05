let BaseErrCode = 2600

module.exports = {
  SequenceUserId: 'userId',

  Err: {
    FA_CREATE_USER_UID: {
      err: BaseErrCode + 1,
      msg: 'Create Uid Fail'
    },
    FA_USER_NOT_EXIST: {
      err: BaseErrCode + 2,
      msg: 'User Not Exist'
    },
    FA_USER_EXIST: {
      err: BaseErrCode + 3,
      msg: 'User Already Exist'
    },
    FA_FIND_USER: {
      err: BaseErrCode + 4,
      msg: 'Find User Fail'
    },
    FA_CREATE_USER: {
      err: BaseErrCode + 5,
      msg: 'Create User Fail'
    },
    FA_UPDATE_USER: {
      err: BaseErrCode + 6,
      msg: 'Update User Fail'
    },
    FA_SAVE_USER: {
      err: BaseErrCode + 7,
      msg: 'Save User Fail'
    },
    FA_USER_NOT_ACTIVE: {
      err: BaseErrCode + 8,
      msg: 'User Not Active'
    },
    FA_USER_DELETED: {
      err: BaseErrCode + 9,
      msg: 'User Already Deleted'
    },
    FA_INVALID_USER: {
      err: BaseErrCode + 10,
      msg: 'Invalid User'
    },
    FA_INVALID_PASSWD: {
      err: BaseErrCode + 11,
      msg: 'Invalid Password'
    },
    FA_INVALID_ACCOUNT: {
      err: BaseErrCode + 12,
      msg: 'Invalid Account'
    },
    FA_INVALID_EMAIL: {
      err: BaseErrCode + 13,
      msg: 'Invalid Email'
    },
    FA_INVALID_MOBILE: {
      err: BaseErrCode + 14,
      msg: 'Invalid Mobile'
    },
    FA_ACCOUNT_BAN: {
      err: BaseErrCode + 15,
      msg: 'Account Disabled'
    },
    FA_INVALID_IDCARD: {
      err: BaseErrCode + 16,
      msg: 'Invalid IDCard'
    }
  }
}
