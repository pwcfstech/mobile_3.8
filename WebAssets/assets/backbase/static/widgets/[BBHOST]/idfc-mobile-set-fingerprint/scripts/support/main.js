/**
 * Created by Sourabh_Sethi on 4/22/2016.
 */


define(function (require, exports, module) {
    'use strict';


    //ar FingerPrintItems1 = require('./angular-rsa-encrypt.js');
    var fingerPrintFactory,encodeString;

    var enc = new  JSEncrypt();

    /*fingerPrintFactory = {

        default: function () {
            return new FingerPrintItems1.JSEncrypt();
        }
    };*/

    function setEncodeDevice(Key,modul,expn) {

        enc.setKey(Key,modul,expn);
     //fingerPrintFactory.default().setKey(Key);
    }

    function encrptDevice(Value) {

        encodeString =  enc.encrypt(Value);
        //encodeString =  fingerPrintFactory.default().encrypt(Value);
        return encodeString;
    }


    exports.setEncodeKey = function (Key,mod,exp) {
         setEncodeDevice(Key,mod,exp);
    };

    exports.setEncrpt = function (Value) {
       return encrptDevice(Value);
    };

});

