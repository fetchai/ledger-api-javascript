"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Assert = exports.SUCCESS_STATUS_CODE = exports.FAILURE_STATUS_CODE = void 0;

var _helpers = require("../../utils/helpers");

const FAILURE_STATUS_CODE = 1;
exports.FAILURE_STATUS_CODE = FAILURE_STATUS_CODE;
const SUCCESS_STATUS_CODE = 0;
exports.SUCCESS_STATUS_CODE = SUCCESS_STATUS_CODE;

class Assert {
  static success() {
    process.exit(SUCCESS_STATUS_CODE);
  }

  static fail() {
    process.exit(FAILURE_STATUS_CODE);
  }

  static assert(val) {
    if (!val) {
      console.log('ASSERT SINGLE FAIL');
      process.exit(FAILURE_STATUS_CODE);
    } else console.log('ASSERT SINGLE SUCCEED');
  }

  static assert_objects_equal(actual, expected) {
    if (typeof actual !== 'object') {
      console.log('process.exit: assert first');
      process.exit(FAILURE_STATUS_CODE);
    } else if (typeof expected !== 'object') {
      process.exit(FAILURE_STATUS_CODE);
    } else if (!(0, _helpers.equals)(actual, expected)) {
      process.exit(FAILURE_STATUS_CODE);
    }
  }

  static assert_equal(actual, expected) {
    if (actual !== expected) {
      console.log('process.exit: assert second');
      process.exit(FAILURE_STATUS_CODE);
    } else {
      console.log('passed assert_eqal');
    }
  }

}

exports.Assert = Assert;