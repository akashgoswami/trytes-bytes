const NUMBER_OF_TRITS_IN_A_BYTE = 5;
const NUMBER_OF_TRITS_IN_A_TRYTE = 3;

var RADIX = 3;
var RADIX_BYTES = 256;
var MAX_TRIT_VALUE = 1;
var MIN_TRIT_VALUE = -1;
var BYTE_HASH_LENGTH = 48;

// All possible tryte values
var trytesAlphabet = "9ABCDEFGHIJKLMNOPQRSTUVWXYZ"

// map of all trits representations
var trytesTrits = [
    [ 0,  0,  0],
    [ 1,  0,  0],
    [-1,  1,  0],
    [ 0,  1,  0],
    [ 1,  1,  0],
    [-1, -1,  1],
    [ 0, -1,  1],
    [ 1, -1,  1],
    [-1,  0,  1],
    [ 0,  0,  1],
    [ 1,  0,  1],
    [-1,  1,  1],
    [ 0,  1,  1],
    [ 1,  1,  1],
    [-1, -1, -1],
    [ 0, -1, -1],
    [ 1, -1, -1],
    [-1,  0, -1],
    [ 0,  0, -1],
    [ 1,  0, -1],
    [-1,  1, -1],
    [ 0,  1, -1],
    [ 1,  1, -1],
    [-1, -1,  0],
    [ 0, -1,  0],
    [ 1, -1,  0],
    [-1,  0,  0]
];



var byte2tritMap = {};


var trits = [-1,-1,-1,-1,-1]

var tritList = [];

for (var i = -121; i < 122; ++i) {
  var output = i+ " ="+trits;
  var key = new Uint8Array(1);
  key[0] = i;
  
  byte2tritMap[key[0].toString(16)] = trits.slice();
  tritList.push(trits.slice());
  console.log(output);
  
  for (var j = 0; j < 5; ++j) {
    if (++trits[j] > 1) {
      trits[j] = -1
    } else {
      break;
    }
  }
}


function Trits2Bytes(trits) {

    var expectedLength = Math.floor((trits.length + NUMBER_OF_TRITS_IN_A_BYTE - 1) / NUMBER_OF_TRITS_IN_A_BYTE);
    var output = new Int8Array(expectedLength);
    
    for (var i = 0; i < expectedLength; i++) {
        var value = 0;
        for (var j = (trits.length - i * NUMBER_OF_TRITS_IN_A_BYTE) < 5 ? (expectedLength - i * NUMBER_OF_TRITS_IN_A_BYTE) : NUMBER_OF_TRITS_IN_A_BYTE; j-- > 0; ) {
            value = value * 3 + trits[ i * NUMBER_OF_TRITS_IN_A_BYTE + j];
        }
        output[i] = value;
    }
    
    return output;
    
}

function Bytes2Trits(bytes) {

    var result = [];
    var index = 0;
    while (bytes.length >= 2) {
      var value = parseInt(bytes.substring(0, 2), 16);
      result.push(value);
  
      bytes = bytes.substring(2, bytes.length);
      index++;
    }
    console.log(result);
    // result is an Uint8Array
    var expectedLength = result.length * NUMBER_OF_TRITS_IN_A_BYTE;
    var output = [];
    
    for (var i = 0; i < result.length; i++) {
        //console.log(bytesTrits[result[i]]);
          output = output.concat( byte2tritMap[result[i].toString(16)]);

    }
    
    return output;
    
}

function Trytes2Trits( input, state ) {

    var trits = state || [];

    if (Number.isInteger(input)) {

        var absoluteValue = input < 0 ? -input : input;

        while (absoluteValue > 0) {

            var remainder = absoluteValue % 3;
            absoluteValue = Math.floor(absoluteValue / 3);

            if (remainder > 1) {
                remainder = -1;
                absoluteValue++;
            }

            trits[trits.length] = remainder;
        }
        if (input < 0) {

            for (var i = 0; i < trits.length; i++) {

                trits[i] = -trits[i];
            }
        }
    } else {

        for (var i = 0; i < input.length; i++) {

            var index = trytesAlphabet.indexOf(input.charAt(i));
            trits[i * 3] = trytesTrits[index][0];
            trits[i * 3 + 1] = trytesTrits[index][1];
            trits[i * 3 + 2] = trytesTrits[index][2];
        }
    }

    return trits;
}

function Trits2Trytes(trits) {

    var trytes = "";

    for ( var i = 0; i < trits.length; i += 3 ) {

        // Iterate over all possible tryte values to find correct trit representation
        for ( var j = 0; j < trytesAlphabet.length; j++ ) {

            if ( trytesTrits[ j ][ 0 ] === trits[ i ] && trytesTrits[ j ][ 1 ] === trits[ i + 1 ] && trytesTrits[ j ][ 2 ] === trits[ i + 2 ] ) {

                trytes += trytesAlphabet.charAt( j );
                break;

            }

        }

    }

    return trytes;
}


function buf2hex(buffer) { // buffer is an ArrayBuffer
  return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
}

var app = new Vue({
      el: '#app',
      data: {
        ready: false,
        trytes: "",
        bytes:"",
        trits:"",
        trytesValid: true,
        bytesValid: true,
        showTrits: false,
        tritList: tritList,
        trytesTrits: trytesTrits
      },
      methods:{

          t2b: function(trytes){
              var self = this;
              var trits = Trytes2Trits(self.trytes);
              if (trits.length % 5 != 0){
                trits = trits.concat(new Array(5- trits.length % 5).fill(0));
              }
              self.trits = trits.toString();
              var payload = Trits2Bytes(trits);
              self.bytes = buf2hex(payload).toUpperCase();
          },
          b2t: function(trytes){
              var self = this;
              var trits = Bytes2Trits(self.bytes);
              if (trits.length % 3 != 0){
                trits = trits.concat(new Array(3- trits.length % 3).fill(0));
              }              
              self.trits = trits.toString();
              var payload = Trits2Trytes(trits);
              self.trytes = payload;
          },
          getByteMap: function(){
            return tritList;
          }
      },
      watch: {
        trytes: function (val) {
          this.trytes = this.trytes.toUpperCase();
          var myRegEx  = /^[A-Z9]+$/i;
          if (!(myRegEx.test(this.trytes)) ) {
              // matches
              this.trytesValid = false;
          }
          else
          {
            this.trytesValid = true;
          }
        },
        bytes: function (val) {
          this.bytes = this.bytes.replace(/\s|^0x/g, '').toUpperCase();
          
          var myRegEx  = /^[A-F0-9]+$/i;
          if (!(myRegEx.test(this.bytes)) ) {
              // matches
              this.bytesValid = false;
          }
          else
          {
            this.bytesValid = true;
          }
        },
      },
});

