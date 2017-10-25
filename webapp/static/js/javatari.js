// Copyright 2015 by Paulo Augusto Peccin. See license.txt distributed with this file.

// Main Emulator parameters.
// You may change any of these after loading the project and before starting the Emulator

Javatari = {

    VERSION:                        "version 0.91",             // Don't change this one!

    //ROM_AUTO_LOAD_URL:              "static/roms/"+rom+".bin",                         // Full or relative URL of ROM
    ROM_AUTO_LOAD_URL:             "",                         // Full or relative URL of ROM
    AUTO_START:                     true,                       // Set false to start emulator manually with Javatari.start()
    SCREEN_ELEMENT_ID:              "javatari-screen",
    CONSOLE_PANEL_ELEMENT_ID:       "javatari-console-panel",
    CARTRIDGE_CHANGE_DISABLED:      true,
    SCREEN_RESIZE_DISABLED:         true,
    SCREEN_FULLSCREEN_DISABLED:     false,
    CARTRIDGE_LABEL_COLORS:         "",                         // Space-separated colors for Label, Background, Border. e.g. "#f00 #000 transparent". Leave "" for defaults
    PADDLES_MODE:                   -1,                         // -1 = auto, 0 = off, 1 = 0n
    SCREEN_CRT_MODE:                -1,                         // -1 = auto, 0 .. 4 = mode
    SCREEN_OPENING_SIZE:            2,                          // 1 .. 4
    SCREEN_CONTROL_BAR:             0,                          // 0 = Always, 1 = Hover, 2 = Original Javatari
    SCREEN_NATURAL_FPS:             60,                         // 60, 50 fps
    AUDIO_BUFFER_SIZE:              1024,                        // 256, 512, 1024, 2048, 4096, 8192. More buffer = more delay
    IMAGES_PATH:                    window.Javatari_IMAGES_PATH || "static/img/"

};

jt = window.jt || {};

// Copyright 2015 by Paulo Augusto Peccin. See license.txt distributed with this file.

jt.Util = new function() {

    this.log = function(str) {
        console.log(">> Javatari: " + str);
    };

    this.message = function(str) {
        alert(str);
    };

    this.arraysEqual = function(a, b) {
        var i = a.length;
        if (i !== b.length) return false;
        while (i--)
            if (a[i] !== b[i]) return false;
        return true;
    };

    this.arrayFill = function(arr, val) {
        var i = arr.length;
        while(i--)
            arr[i] = val;
        return arr;
    };

    this.arrayFillWithArrayClone = function(arr, val) {
        var i = arr.length;
        while(i--)
            arr[i] = val.slice(0);
        return arr;
    };

    this.arrayFillSegment = function(arr, from, to, val) {
        //noinspection UnnecessaryLocalVariableJS
        var i = to;
        while(i-- > from)
            arr[i] = val;
        return arr;
    };

    this.arrayCopy = function(src, srcPos, dest, destPos, length) {
        var finalSrcPos = srcPos + length;
        while(srcPos < finalSrcPos)
            dest[destPos++] = src[srcPos++];
    };

    this.uInt32ArrayCopyToUInt8Array = function(src, srcPos, dest, destPos, length) {
        var finalSrcPos = srcPos + length;
        destPos *= 4;
        while(srcPos < finalSrcPos) {
            var val =  src[srcPos++];
            dest[destPos++] = val & 255;
            dest[destPos++] = (val >> 8) & 255;
            dest[destPos++] = (val >> 16) & 255;
            dest[destPos++] = val >>> 24;
        }
    };

    this.arrayCopyCircularSourceWithStep = function(src, srcPos, srcLength, srcStep, dest, destPos, destLength) {
        var s = srcPos;
        var d = destPos;
        var destEnd = destPos + destLength;
        while (d < destEnd) {
            dest[d] = src[s | 0];   // as integer
            d++;
            s += srcStep;
            if (s >= srcLength) s -= srcLength;
        }
    };

    this.arrayRemove = function(arr, element) {
        var i = arr.indexOf(element);
        if (i < 0) return;
        arr.splice(i, 1);
    };

    this.booleanArrayToByteString = function(boos) {
        var str = "";
        for(var i = 0, len = boos.length; i < len; i++)
            str += boos[i] ? "1" : "0";
        return str;
    };

    this.byteStringToBooleanArray = function(str) {
        var boos = [];
        for(var i = 0, n = str.length; i < n; i++)
            boos.push(str.charAt(i) === "1");
        return boos;
    };

    // Only 8 bit values
    this.uInt8ArrayToByteString = function(ints) {
        var str = "";
        for(var i = 0, len = ints.length; i < len; i++)
            str += String.fromCharCode(ints[i] & 0xff);
        return str;
    };

    this.byteStringToUInt8Array = function(str) {
        var ints = [];
        for(var i = 0, len = str.length; i < len; i++)
            ints.push(str.charCodeAt(i) & 0xff);
        return ints;
    };

    // Only 32 bit values
    this.uInt32ArrayToByteString = function(ints) {
        var str = "";
        for(var i = 0, len = ints.length; i < len; i++) {
            var val = ints[i];
            str += String.fromCharCode((val & 0xff000000) >>> 24);
            str += String.fromCharCode((val & 0xff0000) >>> 16);
            str += String.fromCharCode((val & 0xff00) >>> 8);
            str += String.fromCharCode(val & 0xff);
        }
        return str;
    };

    this.byteStringToUInt32Array = function(str) {
        var ints = [];
        for(var i = 0, len = str.length; i < len;)
            ints.push((str.charCodeAt(i++) * (1 << 24)) + (str.charCodeAt(i++) << 16) + (str.charCodeAt(i++) << 8) + str.charCodeAt(i++));
        return ints;
    };

    // Only 8 bit values, inner arrays of the same length
    this.uInt8BiArrayToByteString = function(ints) {
        var str = "";
        for(var a = 0, lenA = ints.length; a < lenA; a++)
            for(var b = 0, lenB = ints[a].length; b < lenB; b++)
                str += String.fromCharCode(ints[a][b] & 0xff);
        return str;
    };

    // only inner arrays of the same length
    this.byteStringToUInt8BiArray = function(str, innerLength) {
        var outer = [];
        for(var a = 0, len = str.length; a < len;) {
            var inner = new Array(innerLength);
            for(var b = 0; b < innerLength; b++)
                inner[b] = str.charCodeAt(a++) & 0xff;
            outer.push(inner);
        }
        return outer;
    };

};



// Copyright 2015 by Paulo Augusto Peccin. See license.txt distributed with this file.

jt.M6502 = function() {
    var self = this;

    this.powerOn = function() {
        this.reset();
    };

    this.powerOff = function() {
    };

    this.clockPulse = function() {
        if (!RDY) return;      // TODO Should be ignored in the last cycle of the instruction
        T++;
        instruction[T]();
    };

    this.connectBus = function(aBus) {
        bus = aBus;
    };

    this.setRDY = function(boo) {
        RDY = boo;
    };

    this.reset = function() {
        I = 1;
        T = -1;
        instruction = [ fetchOpcodeAndDecodeInstruction ];    // Bootstrap instruction
        PC = bus.read(RESET_VECTOR) | (bus.read(RESET_VECTOR + 1) << 8);
        this.setRDY(true);
    };


    // Interfaces
    var bus;
    var RDY = false;

    // Registers
    var PC = 0;
    var SP = 0;
    var A = 0;
    var X = 0;
    var Y = 0;

    // Status Bits
    var N = 0;
    var V = 0;
    var D = 0;
    var I = 0;
    var Z = 0;
    var C = 0;

    // Internal decoding registers
    var T = -1;
    var opcode = -1;
    var instruction;
    var data = 0;
    var AD = 0;
    var BA = 0;
    var BALCrossed = false;
    var IA = 0;
    var branchOffset = 0;
    var branchOffsetCrossAdjust = 0;

    // Vectors
    //var NMI_VECTOR = 0xfffa;
    var RESET_VECTOR = 0xfffc;
    var IRQ_VECTOR = 0xfffe;

    // Index registers names
    var rX = 0;
    var rY = 1;

    // Status bits names
    var bN = 7;
    var bV = 6;
    // var bE = 5;	// Not used
    // var bB = 4;	// Not used
    // var bD = 3;  // Not used
    // var bI = 2;  // Not used
    var bZ = 1;
    var bC = 0;

    // Auxiliary variables
    //noinspection JSUnusedGlobalSymbols
    this.debug = false;
    //noinspection JSUnusedGlobalSymbols
    this.trace = false;


    // Internal operations

    var fetchOpcodeAndDecodeInstruction = function() {
        opcode = bus.read(PC);
        instruction = instructions[opcode];
        T = 0;

        // if (self.trace) self.breakpoint("TRACE");
        // console.log("PC: " + PC + ", op: " + opcode + ": " + opcodes[opcode]);

        PC++;
    };

    var fetchNextOpcode = fetchOpcodeAndDecodeInstruction;

    var fetchOpcodeAndDiscard = function() {
        bus.read(PC);
    };

    var fetchBranchOffset = function() {
        branchOffset = bus.read(PC);
        PC++;
    };

    var fetchADL = function() {
        AD = bus.read(PC);
        PC++;
    };

    var fetchADH = function() {
        AD |= bus.read(PC) << 8;
        PC++;
    };

    var fetchADLFromBA = function() {
        AD = bus.read(BA);
    };

    var fetchADHFromBA = function() {
        AD |= bus.read(BA) << 8;
    };

    var fetchBAL = function() {
        BA = bus.read(PC);
        PC++;
    };

    var fetchBAH = function() {
        BA |= bus.read(PC) << 8;
        PC++;
    };

    var fetchBALFromIA = function() {
        BA = bus.read(IA);
    };

    var fetchBAHFromIA = function() {
        BA |= bus.read(IA) << 8;
    };

    var addXtoBAL = function() {
        var low = (BA & 255) + X;
        BALCrossed = low > 255;
        BA = (BA & 0xff00) | (low & 255);
    };

    var addYtoBAL = function() {
        var low = (BA & 255) + Y;
        BALCrossed = low > 255;
        BA = (BA & 0xff00) | (low & 255);
    };

    var add1toBAL = function() {
        var low = (BA & 255) + 1;
        BALCrossed = low > 255;
        BA = (BA & 0xff00) | (low & 255);
    };

    var add1toBAHifBALCrossed = function() {
        if (BALCrossed)
            BA = (BA + 0x0100) & 0xffff;
    };

    var fetchIAL = function() {
        IA = bus.read(PC);
        PC++;
    };

    var fetchIAH = function() {
        IA |= bus.read(PC) << 8;
        PC++;
    };

    var add1toIAL = function() {
        var low = (IA & 255) + 1;
        IA = (IA & 0xff00) | (low & 255);
    };

    var fetchDataFromImmediate = function() {
        data = bus.read(PC);
        PC++;
    };

    var fetchDataFromAD = function() {
        data = bus.read(AD);
    };

    var fetchDataFromBA = function() {
        data = bus.read(BA);
    };

    var writeDataToAD = function() {
        bus.write(AD, data);
    };

    var writeDataToBA = function() {
        bus.write(BA, data);
    };

    var addBranchOffsetToPCL = function() {
        var oldLow = (PC & 0x00ff);
        var newLow = (oldLow + branchOffset) & 255;
        // Negative offset?
        if (branchOffset > 127)
            branchOffsetCrossAdjust = (newLow > oldLow) ? -0x0100 : 0;
        else
            branchOffsetCrossAdjust = (newLow < oldLow) ? 0x0100 : 0;
        PC = (PC & 0xff00) | newLow;
    };

    var adjustPCHForBranchOffsetCross = function() {
        PC = (PC + branchOffsetCrossAdjust) & 0xffff;
    };

    var setZ = function(val) {
        Z = (val === 0) ? 1 : 0;
    };

    var setN = function(val) {
        N = (val & 0x080) ? 1 : 0;
    };

    var setV = function(boo) {
        V = boo ? 1 : 0;
    };

    var setC = function(boo) {
        C = boo ? 1 : 0;
    };

    var popFromStack = function() {
        SP = (SP + 1) & 255;
        return bus.read(0x0100 + SP);
    };

    var peekFromStack = function() {
        return bus.read(0x0100 + SP);
    };

    var pushToStack = function(val) {
        bus.write(0x0100 + SP, val);
        SP = (SP - 1) & 255;
    };

    var getStatusBits = function() {
        return N << 7 | V << 6 | 0x30                 // Always push with E (bit 5) and B (bit 4) ON
            |  D << 3 | I << 2 | Z << 1 | C;
    };

    var setStatusBits = function(val) {
        N = val >>> 7; V = val >>> 6 & 1;             // E and B flags actually do not exist as real flags, so ignore
        D = val >>> 3 & 1; I = val >>> 2 & 1; Z = val >>> 1 & 1; C = val & 1;
    };

    var illegalOpcode = function(op) {
        if (self.debug) self.breakpoint("Illegal Opcode: " + op);
    };


    // Addressing routines

    var implied = function(operation) {
        return [
            fetchOpcodeAndDecodeInstruction,
            fetchOpcodeAndDiscard,
            function() {
                operation();
                fetchNextOpcode();
            }
        ];
    };

    var immediateRead = function(operation) {
        return [
            fetchOpcodeAndDecodeInstruction,
            fetchDataFromImmediate,
            function() {
                operation();
                fetchNextOpcode();
            }
        ];
    };

    var zeroPageRead = function(operation) {
        return [
            fetchOpcodeAndDecodeInstruction,
            fetchADL,                        // ADH will be zero
            fetchDataFromAD,
            function() {
                operation();
                fetchNextOpcode();
            }
        ];
    };

    var absoluteRead = function(operation) {
        return [
            fetchOpcodeAndDecodeInstruction,
            fetchADL,
            fetchADH,
            fetchDataFromAD,
            function() {
                operation();
                fetchNextOpcode();
            }
        ];
    };

    var indirectXRead = function(operation) {
        return [
            fetchOpcodeAndDecodeInstruction,
            fetchBAL,                        // BAH will be zero
            fetchDataFromBA,
            function() {
                addXtoBAL();
                fetchADLFromBA();
            },
            function() {
                add1toBAL();
                fetchADHFromBA();
            },
            fetchDataFromAD,
            function() {
                operation();
                fetchNextOpcode();
            }
        ];
    };

    var absoluteIndexedRead = function(index) {
        var addIndex = index === rX ? addXtoBAL : addYtoBAL;
        return function(operation) {
            return [
                fetchOpcodeAndDecodeInstruction,
                fetchBAL,
                fetchBAH,
                function() {
                    addIndex();
                    fetchDataFromBA();
                    add1toBAHifBALCrossed();
                },
                function() {
                    if (BALCrossed) {
                        fetchDataFromBA();
                    } else {
                        operation();
                        fetchNextOpcode();
                    }
                },
                function() {
                    operation();
                    fetchNextOpcode();
                }
            ];
        };
    };

    var zeroPageIndexedRead = function(index) {
        var addIndex = index === rX ? addXtoBAL : addYtoBAL;
        return function(operation) {
            return [
                fetchOpcodeAndDecodeInstruction,
                fetchBAL,                        // BAH will be zero
                fetchDataFromBA,
                function() {
                    addIndex();
                    fetchDataFromBA();
                },
                function() {
                    operation();
                    fetchNextOpcode();
                }
            ];
        };
    };

    var indirectYRead = function(operation) {
        return [
            fetchOpcodeAndDecodeInstruction,
            fetchIAL,                           // IAH will be zero
            fetchBALFromIA,
            function() {
                add1toIAL();
                fetchBAHFromIA();
            },
            function() {
                addYtoBAL();
                fetchDataFromBA();
                add1toBAHifBALCrossed();
            },
            function() {
                if(BALCrossed) {
                    fetchDataFromBA();
                } else {
                    operation();
                    fetchNextOpcode();
                }
            },
            function() {
                operation();
                fetchNextOpcode();
            }
        ];
    };

    var zeroPageWrite = function(operation) {
        return [
            fetchOpcodeAndDecodeInstruction,
            fetchADL,                        // ADH will be zero
            function() {
                operation();
                writeDataToAD();
            },
            fetchNextOpcode
        ];
    };

    var absoluteWrite = function(operation) {
        return [
            fetchOpcodeAndDecodeInstruction,
            fetchADL,
            fetchADH,
            function() {
                operation();
                writeDataToAD();
            },
            fetchNextOpcode
        ];
    };

    var indirectXWrite = function(operation) {
        return [
            fetchOpcodeAndDecodeInstruction,
            fetchBAL,                        // BAH will be zero
            fetchDataFromBA,
            function() {
                addXtoBAL();
                fetchADLFromBA();
            },
            function() {
                add1toBAL();
                fetchADHFromBA();
            },
            function() {
                operation();
                writeDataToAD();
            },
            fetchNextOpcode
        ];
    };

    var absoluteIndexedWrite = function(index) {
        var addIndex = index === rX ? addXtoBAL : addYtoBAL;
        return function(operation) {
            return [
                fetchOpcodeAndDecodeInstruction,
                fetchBAL,
                fetchBAH,
                function() {
                    addIndex();
                    fetchDataFromBA();
                    add1toBAHifBALCrossed();
                },
                function() {
                    operation();
                    writeDataToBA();
                },
                fetchNextOpcode
            ];
        };
    };

    var zeroPageIndexedWrite = function(index) {
        var addIndex = index === rX ? addXtoBAL : addYtoBAL;
        return function(operation) {
            return [
                fetchOpcodeAndDecodeInstruction,
                fetchBAL,                        // BAH will be zero
                fetchDataFromBA,
                function() {
                    addIndex();
                    operation();
                    writeDataToBA();
                },
                fetchNextOpcode
            ];
        };
    };

    var indirectYWrite = function(operation) {
        return [
            fetchOpcodeAndDecodeInstruction,
            fetchIAL,                           // IAH will be zero
            fetchBALFromIA,
            function() {
                add1toIAL();
                fetchBAHFromIA();
            },
            function() {
                addYtoBAL();
                fetchDataFromBA();
                add1toBAHifBALCrossed();
            },
            function() {
                operation();
                writeDataToBA();
            },
            fetchNextOpcode
        ];
    };


    var zeroPageReadModifyWrite = function(operation) {
        return [
            fetchOpcodeAndDecodeInstruction,
            fetchADL,                        // ADH will be zero
            fetchDataFromAD,
            writeDataToAD,
            function() {
                operation();
                writeDataToAD();
            },
            fetchNextOpcode
        ];
    };

    var absoluteReadModifyWrite = function(operation) {
        return [
            fetchOpcodeAndDecodeInstruction,
            fetchADL,
            fetchADH,
            fetchDataFromAD,
            writeDataToAD,
            function() {
                operation();
                writeDataToAD();
            },
            fetchNextOpcode
        ];
    };

    var zeroPageIndexedReadModifyWrite = function(index) {
        var addIndex = index === rX ? addXtoBAL : addYtoBAL;
        return function(operation) {
            return [
                fetchOpcodeAndDecodeInstruction,
                fetchBAL,                        // BAH will be zero
                fetchDataFromBA,
                function () {
                    addIndex();
                    fetchDataFromBA();
                },
                writeDataToBA,
                function () {
                    operation();
                    writeDataToBA();
                },
                fetchNextOpcode
            ];
        };
    };

    var absoluteIndexedReadModifyWrite = function(index) {
        var addIndex = index === rX ? addXtoBAL : addYtoBAL;
        return function(operation) {
            return [
                fetchOpcodeAndDecodeInstruction,
                fetchBAL,
                fetchBAH,
                function () {
                    addIndex();
                    fetchDataFromBA();
                    add1toBAHifBALCrossed();
                },
                fetchDataFromBA,
                writeDataToBA,
                function () {
                    operation();
                    writeDataToBA();
                },
                fetchNextOpcode
            ];
        };
    };

    var indirectXReadModifyWrite = function(operation) {
        return [
            fetchOpcodeAndDecodeInstruction,
            fetchBAL,                        // BAH will be zero
            fetchDataFromBA,
            function() {
                addXtoBAL();
                fetchADLFromBA();
            },
            function() {
                add1toBAL();
                fetchADHFromBA();
            },
            fetchDataFromAD,
            writeDataToAD,
            function() {
                operation();
                writeDataToAD();
            },
            fetchNextOpcode
        ];
    };

    var indirectYReadModifyWrite = function(operation) {
        return [
            fetchOpcodeAndDecodeInstruction,
            fetchIAL,                           // IAH will be zero
            fetchBALFromIA,
            function() {
                add1toIAL();
                fetchBAHFromIA();
            },
            function() {
                addYtoBAL();
                fetchDataFromBA();
                add1toBAHifBALCrossed();
            },
            fetchDataFromBA,
            writeDataToBA,
            function() {
                operation();
                writeDataToBA();
            },
            fetchNextOpcode
        ];
    };


    // Instructions  ========================================================================================

    // Complete instruction set
    var opcodes =      new Array(256);
    var instructions = new Array(256);

    opcodes[0x00] = "BRK";  instructions[0x00] = BRK();
    opcodes[0x01] = "ORA";  instructions[0x01] = ORA(indirectXRead);
    opcodes[0x02] = "uKIL"; instructions[0x02] = uKIL();
    opcodes[0x03] = "uSLO"; instructions[0x03] = uSLO(indirectXReadModifyWrite);
    opcodes[0x04] = "uNOP"; instructions[0x04] = uNOP(zeroPageRead);
    opcodes[0x05] = "ORA";  instructions[0x05] = ORA(zeroPageRead);
    opcodes[0x06] = "ASL";  instructions[0x06] = ASL(zeroPageReadModifyWrite);
    opcodes[0x07] = "uSLO"; instructions[0x07] = uSLO(zeroPageReadModifyWrite);
    opcodes[0x08] = "PHP";  instructions[0x08] = PHP();
    opcodes[0x09] = "ORA";  instructions[0x09] = ORA(immediateRead);
    opcodes[0x0a] = "ASL";  instructions[0x0a] = ASL_ACC();
    opcodes[0x0b] = "uANC"; instructions[0x0b] = uANC(immediateRead);
    opcodes[0x0c] = "uNOP"; instructions[0x0c] = uNOP(absoluteRead);
    opcodes[0x0d] = "ORA";  instructions[0x0d] = ORA(absoluteRead);
    opcodes[0x0e] = "ASL";  instructions[0x0e] = ASL(absoluteReadModifyWrite);
    opcodes[0x0f] = "uSLO"; instructions[0x0f] = uSLO(absoluteReadModifyWrite);
    opcodes[0x10] = "BPL";  instructions[0x10] = Bxx(bN, 0);                 // BPL
    opcodes[0x11] = "ORA";  instructions[0x11] = ORA(indirectYRead);
    opcodes[0x12] = "uKIL"; instructions[0x12] = uKIL();
    opcodes[0x13] = "uSLO"; instructions[0x13] = uSLO(indirectYReadModifyWrite);
    opcodes[0x14] = "uNOP"; instructions[0x14] = uNOP(zeroPageIndexedRead(rX));
    opcodes[0x15] = "ORA";  instructions[0x15] = ORA(zeroPageIndexedRead(rX));
    opcodes[0x16] = "ASL";  instructions[0x16] = ASL(zeroPageIndexedReadModifyWrite(rX));
    opcodes[0x17] = "uSLO"; instructions[0x17] = uSLO(zeroPageIndexedReadModifyWrite(rX));
    opcodes[0x18] = "CLC";  instructions[0x18] = CLC();
    opcodes[0x19] = "ORA";  instructions[0x19] = ORA(absoluteIndexedRead(rY));
    opcodes[0x1a] = "uNOP"; instructions[0x1a] = uNOP(implied);
    opcodes[0x1b] = "uSLO"; instructions[0x1b] = uSLO(absoluteIndexedReadModifyWrite(rY));
    opcodes[0x1c] = "uNOP"; instructions[0x1c] = uNOP(absoluteIndexedRead(rX));
    opcodes[0x1d] = "ORA";  instructions[0x1d] = ORA(absoluteIndexedRead(rX));
    opcodes[0x1e] = "ASL";  instructions[0x1e] = ASL(absoluteIndexedReadModifyWrite(rX));
    opcodes[0x1f] = "uSLO"; instructions[0x1f] = uSLO(absoluteIndexedReadModifyWrite(rX));
    opcodes[0x20] = "JSR";  instructions[0x20] = JSR();
    opcodes[0x21] = "AND";  instructions[0x21] = AND(indirectXRead);
    opcodes[0x22] = "uKIL"; instructions[0x22] = uKIL();
    opcodes[0x23] = "uRLA"; instructions[0x23] = uRLA(indirectXReadModifyWrite);
    opcodes[0x24] = "BIT";  instructions[0x24] = BIT(zeroPageRead);
    opcodes[0x25] = "AND";  instructions[0x25] = AND(zeroPageRead);
    opcodes[0x26] = "ROL";  instructions[0x26] = ROL(zeroPageReadModifyWrite);
    opcodes[0x27] = "uRLA"; instructions[0x27] = uRLA(zeroPageReadModifyWrite);
    opcodes[0x28] = "PLP";  instructions[0x28] = PLP();
    opcodes[0x29] = "AND";  instructions[0x29] = AND(immediateRead);
    opcodes[0x2a] = "ROL";  instructions[0x2a] = ROL_ACC();
    opcodes[0x2b] = "uANC"; instructions[0x2b] = uANC(immediateRead);
    opcodes[0x2c] = "BIT";  instructions[0x2c] = BIT(absoluteRead);
    opcodes[0x2d] = "AND";  instructions[0x2d] = AND(absoluteRead);
    opcodes[0x2e] = "ROL";  instructions[0x2e] = ROL(absoluteReadModifyWrite);
    opcodes[0x2f] = "uRLA"; instructions[0x2f] = uRLA(absoluteReadModifyWrite);
    opcodes[0x30] = "BMI";  instructions[0x30] = Bxx(bN, 1);                 // BMI
    opcodes[0x31] = "AND";  instructions[0x31] = AND(indirectYRead);
    opcodes[0x32] = "uKIL"; instructions[0x32] = uKIL();
    opcodes[0x33] = "uRLA"; instructions[0x33] = uRLA(indirectYReadModifyWrite);
    opcodes[0x34] = "uNOP"; instructions[0x34] = uNOP(zeroPageIndexedRead(rX));
    opcodes[0x35] = "AND";  instructions[0x35] = AND(zeroPageIndexedRead(rX));
    opcodes[0x36] = "ROL";  instructions[0x36] = ROL(zeroPageIndexedReadModifyWrite(rX));
    opcodes[0x37] = "uRLA"; instructions[0x37] = uRLA(zeroPageIndexedReadModifyWrite(rX));
    opcodes[0x38] = "SEC";  instructions[0x38] = SEC();
    opcodes[0x39] = "AND";  instructions[0x39] = AND(absoluteIndexedRead(rY));
    opcodes[0x3a] = "uNOP"; instructions[0x3a] = uNOP(implied);
    opcodes[0x3b] = "uRLA"; instructions[0x3b] = uRLA(absoluteIndexedReadModifyWrite(rY));
    opcodes[0x3c] = "uNOP"; instructions[0x3c] = uNOP(absoluteIndexedRead(rX));
    opcodes[0x3d] = "AND";  instructions[0x3d] = AND(absoluteIndexedRead(rX));
    opcodes[0x3e] = "ROL";  instructions[0x3e] = ROL(absoluteIndexedReadModifyWrite(rX));
    opcodes[0x3f] = "uRLA"; instructions[0x3f] = uRLA(absoluteIndexedReadModifyWrite(rX));
    opcodes[0x40] = "RTI";  instructions[0x40] = RTI();
    opcodes[0x41] = "EOR";  instructions[0x41] = EOR(indirectXRead);
    opcodes[0x42] = "uKIL"; instructions[0x42] = uKIL();
    opcodes[0x43] = "uSRE"; instructions[0x43] = uSRE(indirectXReadModifyWrite);
    opcodes[0x44] = "uNOP"; instructions[0x44] = uNOP(zeroPageRead);
    opcodes[0x45] = "EOR";  instructions[0x45] = EOR(zeroPageRead);
    opcodes[0x46] = "LSR";  instructions[0x46] = LSR(zeroPageReadModifyWrite);
    opcodes[0x47] = "uSRE"; instructions[0x47] = uSRE(zeroPageReadModifyWrite);
    opcodes[0x48] = "PHA";  instructions[0x48] = PHA();
    opcodes[0x49] = "EOR";  instructions[0x49] = EOR(immediateRead);
    opcodes[0x4a] = "LSR";  instructions[0x4a] = LSR_ACC();
    opcodes[0x4b] = "uASR"; instructions[0x4b] = uASR(immediateRead);
    opcodes[0x4c] = "JMP";  instructions[0x4c] = JMP_ABS();
    opcodes[0x4d] = "EOR";  instructions[0x4d] = EOR(absoluteRead);
    opcodes[0x4e] = "LSR";  instructions[0x4e] = LSR(absoluteReadModifyWrite);
    opcodes[0x4f] = "uSRE"; instructions[0x4f] = uSRE(absoluteReadModifyWrite);
    opcodes[0x50] = "BVC";  instructions[0x50] = Bxx(bV, 0);                 // BVC
    opcodes[0x51] = "EOR";  instructions[0x51] = EOR(indirectYRead);
    opcodes[0x52] = "uKIL"; instructions[0x52] = uKIL();
    opcodes[0x53] = "uSRE"; instructions[0x53] = uSRE(indirectYReadModifyWrite);
    opcodes[0x54] = "uNOP"; instructions[0x54] = uNOP(zeroPageIndexedRead(rX));
    opcodes[0x55] = "EOR";  instructions[0x55] = EOR(zeroPageIndexedRead(rX));
    opcodes[0x56] = "LSR";  instructions[0x56] = LSR(zeroPageIndexedReadModifyWrite(rX));
    opcodes[0x57] = "uSRE"; instructions[0x57] = uSRE(zeroPageIndexedReadModifyWrite(rX));
    opcodes[0x58] = "CLI";  instructions[0x58] = CLI();
    opcodes[0x59] = "EOR";  instructions[0x59] = EOR(absoluteIndexedRead(rY));
    opcodes[0x5a] = "uNOP"; instructions[0x5a] = uNOP(implied);
    opcodes[0x5b] = "uSRE"; instructions[0x5b] = uSRE(absoluteIndexedReadModifyWrite(rY));
    opcodes[0x5c] = "uNOP"; instructions[0x5c] = uNOP(absoluteIndexedRead(rX));
    opcodes[0x5d] = "EOR";  instructions[0x5d] = EOR(absoluteIndexedRead(rX));
    opcodes[0x5e] = "LSR";  instructions[0x5e] = LSR(absoluteIndexedReadModifyWrite(rX));
    opcodes[0x5f] = "uSRE"; instructions[0x5f] = uSRE(absoluteIndexedReadModifyWrite(rX));
    opcodes[0x60] = "RTS";  instructions[0x60] = RTS();
    opcodes[0x61] = "ADC";  instructions[0x61] = ADC(indirectXRead);
    opcodes[0x62] = "uKIL"; instructions[0x62] = uKIL();
    opcodes[0x63] = "uRRA"; instructions[0x63] = uRRA(indirectXReadModifyWrite);
    opcodes[0x64] = "uNOP"; instructions[0x64] = uNOP(zeroPageRead);
    opcodes[0x65] = "ADC";  instructions[0x65] = ADC(zeroPageRead);
    opcodes[0x66] = "ROR";  instructions[0x66] = ROR(zeroPageReadModifyWrite);
    opcodes[0x67] = "uRRA"; instructions[0x67] = uRRA(zeroPageReadModifyWrite);
    opcodes[0x68] = "PLA";  instructions[0x68] = PLA();
    opcodes[0x69] = "ADC";  instructions[0x69] = ADC(immediateRead);
    opcodes[0x6a] = "ROR";  instructions[0x6a] = ROR_ACC();
    opcodes[0x6b] = "uARR"; instructions[0x6b] = uARR(immediateRead);
    opcodes[0x6c] = "JMP";  instructions[0x6c] = JMP_IND();
    opcodes[0x6d] = "ADC";  instructions[0x6d] = ADC(absoluteRead);
    opcodes[0x6e] = "ROR";  instructions[0x6e] = ROR(absoluteReadModifyWrite);
    opcodes[0x6f] = "uRRA"; instructions[0x6f] = uRRA(absoluteReadModifyWrite);
    opcodes[0x70] = "BVS";  instructions[0x70] = Bxx(bV, 1);                 // BVS
    opcodes[0x71] = "ADC";  instructions[0x71] = ADC(indirectYRead);
    opcodes[0x72] = "uKIL"; instructions[0x72] = uKIL();
    opcodes[0x73] = "uRRA"; instructions[0x73] = uRRA(indirectYReadModifyWrite);
    opcodes[0x74] = "uNOP"; instructions[0x74] = uNOP(zeroPageIndexedRead(rX));
    opcodes[0x75] = "ADC";  instructions[0x75] = ADC(zeroPageIndexedRead(rX));
    opcodes[0x76] = "ROR";  instructions[0x76] = ROR(zeroPageIndexedReadModifyWrite(rX));
    opcodes[0x77] = "uRRA"; instructions[0x77] = uRRA(zeroPageIndexedReadModifyWrite(rX));
    opcodes[0x78] = "SEI";  instructions[0x78] = SEI();
    opcodes[0x79] = "ADC";  instructions[0x79] = ADC(absoluteIndexedRead(rY));
    opcodes[0x7a] = "uNOP"; instructions[0x7a] = uNOP(implied);
    opcodes[0x7b] = "uRRA"; instructions[0x7b] = uRRA(absoluteIndexedReadModifyWrite(rY));
    opcodes[0x7c] = "uNOP"; instructions[0x7c] = uNOP(absoluteIndexedRead(rX));
    opcodes[0x7d] = "ADC";  instructions[0x7d] = ADC(absoluteIndexedRead(rX));
    opcodes[0x7e] = "ROR";  instructions[0x7e] = ROR(absoluteIndexedReadModifyWrite(rX));
    opcodes[0x7f] = "uRRA"; instructions[0x7f] = uRRA(absoluteIndexedReadModifyWrite(rX));
    opcodes[0x80] = "uNOP"; instructions[0x80] = uNOP(immediateRead);
    opcodes[0x81] = "STA";  instructions[0x81] = STA(indirectXWrite);
    opcodes[0x82] = "uNOP"; instructions[0x82] = uNOP(immediateRead);
    opcodes[0x83] = "uSAX"; instructions[0x83] = uSAX(indirectXWrite);
    opcodes[0x84] = "STY";  instructions[0x84] = STY(zeroPageWrite);
    opcodes[0x85] = "STA";  instructions[0x85] = STA(zeroPageWrite);
    opcodes[0x86] = "STX";  instructions[0x86] = STX(zeroPageWrite);
    opcodes[0x87] = "uSAX"; instructions[0x87] = uSAX(zeroPageWrite);
    opcodes[0x88] = "DEY";  instructions[0x88] = DEY();
    opcodes[0x89] = "uNOP"; instructions[0x89] = uNOP(immediateRead);
    opcodes[0x8a] = "TXA";  instructions[0x8a] = TXA();
    opcodes[0x8b] = "uANE"; instructions[0x8b] = uANE(immediateRead);
    opcodes[0x8c] = "STY";  instructions[0x8c] = STY(absoluteWrite);
    opcodes[0x8d] = "STA";  instructions[0x8d] = STA(absoluteWrite);
    opcodes[0x8e] = "STX";  instructions[0x8e] = STX(absoluteWrite);
    opcodes[0x8f] = "uSAX"; instructions[0x8f] = uSAX(absoluteWrite);
    opcodes[0x90] = "BCC";  instructions[0x90] = Bxx(bC, 0);                 // BCC
    opcodes[0x91] = "STA";  instructions[0x91] = STA(indirectYWrite);
    opcodes[0x92] = "uKIL"; instructions[0x92] = uKIL();
    opcodes[0x93] = "uSHA"; instructions[0x93] = uSHA(indirectYWrite);
    opcodes[0x94] = "STY";  instructions[0x94] = STY(zeroPageIndexedWrite(rX));
    opcodes[0x95] = "STA";  instructions[0x95] = STA(zeroPageIndexedWrite(rX));
    opcodes[0x96] = "STX";  instructions[0x96] = STX(zeroPageIndexedWrite(rY));
    opcodes[0x97] = "uSAX"; instructions[0x97] = uSAX(zeroPageIndexedWrite(rY));
    opcodes[0x98] = "TYA";  instructions[0x98] = TYA();
    opcodes[0x99] = "STA";  instructions[0x99] = STA(absoluteIndexedWrite(rY));
    opcodes[0x9a] = "TXS";  instructions[0x9a] = TXS();
    opcodes[0x9b] = "uSHS"; instructions[0x9b] = uSHS(absoluteIndexedWrite(rY));
    opcodes[0x9c] = "uSHY"; instructions[0x9c] = uSHY(absoluteIndexedWrite(rX));
    opcodes[0x9d] = "STA";  instructions[0x9d] = STA(absoluteIndexedWrite(rX));
    opcodes[0x9e] = "uSHX"; instructions[0x9e] = uSHX(absoluteIndexedWrite(rY));
    opcodes[0x9f] = "uSHA"; instructions[0x9f] = uSHA(absoluteIndexedWrite(rY));
    opcodes[0xa0] = "LDY";  instructions[0xa0] = LDY(immediateRead);
    opcodes[0xa1] = "LDA";  instructions[0xa1] = LDA(indirectXRead);
    opcodes[0xa2] = "LDX";  instructions[0xa2] = LDX(immediateRead);
    opcodes[0xa3] = "uLAX"; instructions[0xa3] = uLAX(indirectXRead);
    opcodes[0xa4] = "LDY";  instructions[0xa4] = LDY(zeroPageRead);
    opcodes[0xa5] = "LDA";  instructions[0xa5] = LDA(zeroPageRead);
    opcodes[0xa6] = "LDX";  instructions[0xa6] = LDX(zeroPageRead);
    opcodes[0xa7] = "uLAX"; instructions[0xa7] = uLAX(zeroPageRead);
    opcodes[0xa8] = "TAY";  instructions[0xa8] = TAY();
    opcodes[0xa9] = "LDA";  instructions[0xa9] = LDA(immediateRead);
    opcodes[0xaa] = "TAX";  instructions[0xaa] = TAX();
    opcodes[0xab] = "uLXA"; instructions[0xab] = uLXA(immediateRead);
    opcodes[0xac] = "LDY";  instructions[0xac] = LDY(absoluteRead);
    opcodes[0xad] = "LDA";  instructions[0xad] = LDA(absoluteRead);
    opcodes[0xae] = "LDX";  instructions[0xae] = LDX(absoluteRead);
    opcodes[0xaf] = "uLAX"; instructions[0xaf] = uLAX(absoluteRead);
    opcodes[0xb0] = "BCS";  instructions[0xb0] = Bxx(bC, 1);                 // BCS
    opcodes[0xb1] = "LDA";  instructions[0xb1] = LDA(indirectYRead);
    opcodes[0xb2] = "uKIL"; instructions[0xb2] = uKIL();
    opcodes[0xb3] = "uLAX"; instructions[0xb3] = uLAX(indirectYRead);
    opcodes[0xb4] = "LDY";  instructions[0xb4] = LDY(zeroPageIndexedRead(rX));
    opcodes[0xb5] = "LDA";  instructions[0xb5] = LDA(zeroPageIndexedRead(rX));
    opcodes[0xb6] = "LDX";  instructions[0xb6] = LDX(zeroPageIndexedRead(rY));
    opcodes[0xb7] = "uLAX"; instructions[0xb7] = uLAX(zeroPageIndexedRead(rY));
    opcodes[0xb8] = "CLV";  instructions[0xb8] = CLV();
    opcodes[0xb9] = "LDA";  instructions[0xb9] = LDA(absoluteIndexedRead(rY));
    opcodes[0xba] = "TSX";  instructions[0xba] = TSX();
    opcodes[0xbb] = "uLAS"; instructions[0xbb] = uLAS(absoluteIndexedRead(rY));
    opcodes[0xbc] = "LDY";  instructions[0xbc] = LDY(absoluteIndexedRead(rX));
    opcodes[0xbd] = "LDA";  instructions[0xbd] = LDA(absoluteIndexedRead(rX));
    opcodes[0xbe] = "LDX";  instructions[0xbe] = LDX(absoluteIndexedRead(rY));
    opcodes[0xbf] = "uLAX"; instructions[0xbf] = uLAX(absoluteIndexedRead(rY));
    opcodes[0xc0] = "CPY";  instructions[0xc0] = CPY(immediateRead);
    opcodes[0xc1] = "CMP";  instructions[0xc1] = CMP(indirectXRead);
    opcodes[0xc2] = "uNOP"; instructions[0xc2] = uNOP(immediateRead);
    opcodes[0xc3] = "uDCP"; instructions[0xc3] = uDCP(indirectXReadModifyWrite);
    opcodes[0xc4] = "CPY";  instructions[0xc4] = CPY(zeroPageRead);
    opcodes[0xc5] = "CMP";  instructions[0xc5] = CMP(zeroPageRead);
    opcodes[0xc6] = "DEC";  instructions[0xc6] = DEC(zeroPageReadModifyWrite);
    opcodes[0xc7] = "uDCP"; instructions[0xc7] = uDCP(zeroPageReadModifyWrite);
    opcodes[0xc8] = "INY";  instructions[0xc8] = INY();
    opcodes[0xc9] = "CMP";  instructions[0xc9] = CMP(immediateRead);
    opcodes[0xca] = "DEX";  instructions[0xca] = DEX();
    opcodes[0xcb] = "uSBX"; instructions[0xcb] = uSBX(immediateRead);
    opcodes[0xcc] = "CPY";  instructions[0xcc] = CPY(absoluteRead);
    opcodes[0xcd] = "CMP";  instructions[0xcd] = CMP(absoluteRead);
    opcodes[0xce] = "DEC";  instructions[0xce] = DEC(absoluteReadModifyWrite);
    opcodes[0xcf] = "uDCP"; instructions[0xcf] = uDCP(absoluteReadModifyWrite);
    opcodes[0xd0] = "BNE";  instructions[0xd0] = Bxx(bZ, 0);                 // BNE
    opcodes[0xd1] = "CMP";  instructions[0xd1] = CMP(indirectYRead);
    opcodes[0xd2] = "uKIL"; instructions[0xd2] = uKIL();
    opcodes[0xd3] = "uDCP"; instructions[0xd3] = uDCP(indirectYReadModifyWrite);
    opcodes[0xd4] = "uNOP"; instructions[0xd4] = uNOP(zeroPageIndexedRead(rX));
    opcodes[0xd5] = "CMP";  instructions[0xd5] = CMP(zeroPageIndexedRead(rX));
    opcodes[0xd6] = "DEC";  instructions[0xd6] = DEC(zeroPageIndexedReadModifyWrite(rX));
    opcodes[0xd7] = "uDCP"; instructions[0xd7] = uDCP(zeroPageIndexedReadModifyWrite(rX));
    opcodes[0xd8] = "CLD";  instructions[0xd8] = CLD();
    opcodes[0xd9] = "CMP";  instructions[0xd9] = CMP(absoluteIndexedRead(rY));
    opcodes[0xda] = "uNOP"; instructions[0xda] = uNOP(implied);
    opcodes[0xdb] = "uDCP"; instructions[0xdb] = uDCP(absoluteIndexedReadModifyWrite(rY));
    opcodes[0xdc] = "uNOP"; instructions[0xdc] = uNOP(absoluteIndexedRead(rX));
    opcodes[0xdd] = "CMP";  instructions[0xdd] = CMP(absoluteIndexedRead(rX));
    opcodes[0xde] = "DEC";  instructions[0xde] = DEC(absoluteIndexedReadModifyWrite(rX));
    opcodes[0xdf] = "uDCP"; instructions[0xdf] = uDCP(absoluteIndexedReadModifyWrite(rX));
    opcodes[0xe0] = "CPX";  instructions[0xe0] = CPX(immediateRead);
    opcodes[0xe1] = "SBC";  instructions[0xe1] = SBC(indirectXRead);
    opcodes[0xe2] = "uNOP"; instructions[0xe2] = uNOP(immediateRead);
    opcodes[0xe3] = "uISB"; instructions[0xe3] = uISB(indirectXReadModifyWrite);
    opcodes[0xe4] = "CPX";  instructions[0xe4] = CPX(zeroPageRead);
    opcodes[0xe5] = "SBC";  instructions[0xe5] = SBC(zeroPageRead);
    opcodes[0xe6] = "INC";  instructions[0xe6] = INC(zeroPageReadModifyWrite);
    opcodes[0xe7] = "uISB"; instructions[0xe7] = uISB(zeroPageReadModifyWrite);
    opcodes[0xe8] = "INX";  instructions[0xe8] = INX();
    opcodes[0xe9] = "SBC";  instructions[0xe9] = SBC(immediateRead);
    opcodes[0xea] = "NOP";  instructions[0xea] = NOP();
    opcodes[0xeb] = "SBC";  instructions[0xeb] = SBC(immediateRead);
    opcodes[0xec] = "CPX";  instructions[0xec] = CPX(absoluteRead);
    opcodes[0xed] = "SBC";  instructions[0xed] = SBC(absoluteRead);
    opcodes[0xee] = "INC";  instructions[0xee] = INC(absoluteReadModifyWrite);
    opcodes[0xef] = "uISB"; instructions[0xef] = uISB(absoluteReadModifyWrite);
    opcodes[0xf0] = "BEQ";  instructions[0xf0] = Bxx(bZ, 1);                 // BEQ
    opcodes[0xf1] = "SBC";  instructions[0xf1] = SBC(indirectYRead);
    opcodes[0xf2] = "uKIL"; instructions[0xf2] = uKIL();
    opcodes[0xf3] = "uISB"; instructions[0xf3] = uISB(indirectYReadModifyWrite);
    opcodes[0xf4] = "uNOP"; instructions[0xf4] = uNOP(zeroPageIndexedRead(rX));
    opcodes[0xf5] = "SBC";  instructions[0xf5] = SBC(zeroPageIndexedRead(rX));
    opcodes[0xf6] = "INC";  instructions[0xf6] = INC(zeroPageIndexedReadModifyWrite(rX));
    opcodes[0xf7] = "uISB"; instructions[0xf7] = uISB(zeroPageIndexedReadModifyWrite(rX));
    opcodes[0xf8] = "SED";  instructions[0xf8] = SED();
    opcodes[0xf9] = "SBC";  instructions[0xf9] = SBC(absoluteIndexedRead(rY));
    opcodes[0xfa] = "uNOP"; instructions[0xfa] = uNOP(implied);
    opcodes[0xfb] = "uISB"; instructions[0xfb] = uISB(absoluteIndexedReadModifyWrite(rY));
    opcodes[0xfc] = "uNOP"; instructions[0xfc] = uNOP(absoluteIndexedRead(rX));
    opcodes[0xfd] = "SBC";  instructions[0xfd] = SBC(absoluteIndexedRead(rX));
    opcodes[0xfe] = "INC";  instructions[0xfe] = INC(absoluteIndexedReadModifyWrite(rX));
    opcodes[0xff] = "uISB"; instructions[0xff] = uISB(absoluteIndexedReadModifyWrite(rX));


    // Single Byte instructions

    function ASL_ACC() {
        return implied(function() {
            setC(A > 127);
            A = (A << 1) & 255;
            setZ(A);
            setN(A);
        });
    }

    function CLC() {
        return implied(function() {
            C = 0;
        });
    }

    function CLD() {
        return implied(function() {
            D = 0;
        });
    }

    function CLI() {
        return implied(function() {
            I = 0;
        });
    }

    function CLV() {
        return implied(function() {
            V = 0;
        });
    }

    function DEX() {
        return implied(function() {
            X = (X - 1) & 255;
            setZ(X);
            setN(X);
        });
    }

    function DEY() {
        return implied(function() {
            Y = (Y - 1) & 255;
            setZ(Y);
            setN(Y);
        });
    }

    function INX() {
        return implied(function() {
            X = (X + 1) & 255;
            setZ(X);
            setN(X);
        });
    }

    function INY() {
        return implied(function() {
            Y = (Y + 1) & 255;
            setZ(Y);
            setN(Y);
        });
    }

    function LSR_ACC() {
        return implied(function() {
            C = A & 0x01;
            A >>>= 1;
            setZ(A);
            N = 0;
        });
    }

    function NOP() {
        return implied(function() {
            // nothing
        });
    }

    function ROL_ACC() {
        return implied(function() {
            var newC = A > 127;
            A = ((A << 1) | C) & 255;
            setC(newC);
            setZ(A);
            setN(A);
        });
    }

    function ROR_ACC() {
        return implied(function() {
            var newC = A & 0x01;
            A = (A >>> 1) | (C << 7);
            setC(newC);
            setZ(A);
            setN(A);
        });
    }

    function SEC() {
        return implied(function() {
            C = 1;
        });
    }

    function SED() {
        return implied(function() {
            D = 1;
        });
    }

    function SEI() {
        return implied(function() {
            I = 1;
        });
    }

    function TAX() {
        return implied(function() {
            X = A;
            setZ(X);
            setN(X);
        });
    }

    function TAY() {
        return implied(function() {
            Y = A;
            setZ(Y);
            setN(Y);
        });
    }

    function TSX() {
        return implied(function() {
            X = SP;
            setZ(X);
            setN(X);
        });
    }

    function TXA() {
        return implied(function() {
            A = X;
            setZ(A);
            setN(A);
        });
    }

    function TXS() {
        return implied(function() {
            SP = X;
        });
    }

    function TYA() {
        return implied(function() {
            A = Y;
            setZ(A);
            setN(A);
        });
    }

    function uKIL() {
        return [
            fetchOpcodeAndDecodeInstruction,
            function() {
                illegalOpcode("KIL/HLT/JAM");
            },
            function() {
                T--;        // Causes the processor to be stuck in this instruction forever
            }
        ];
    }

    function uNOP(addressing) {
        return addressing(function() {
            illegalOpcode("NOP/DOP");
            // nothing
        });
    }


    // Internal Execution on Memory Data

    function ADC(addressing) {
        return addressing(function() {
            if (D) {
                var operand = data;
                var AL = (A & 15) + (operand & 15) + C;
                if (AL > 9) { AL += 6; }
                var AH = ((A >> 4) + (operand >> 4) + (AL > 15)) << 4;
                setZ((A + operand + C) & 255);
                setN(AH);
                setV(((A ^AH) & ~(A ^ operand)) & 128);
                if (AH > 0x9f) { AH += 0x60; }
                setC(AH > 255);
                A = (AH | (AL & 15)) & 255;
            } else {
                var add = A + data + C;
                setC(add > 255);
                setV(((A ^ add) & (data ^ add)) & 0x80);
                A = add & 255;
                setZ(A);
                setN(A);
            }
        });
    }

    function AND(addressing) {
        return addressing(function() {
            A &= data;
            setZ(A);
            setN(A);
        });
    }

    function BIT(addressing) {
        return addressing(function() {
            var par = data;
            setZ(A & par);
            setV(par & 0x40);
            setN(par);
        });
    }

    function CMP(addressing) {
        return addressing(function() {
            var val = (A - data) & 255;
            setC(A >= data);
            setZ(val);
            setN(val);
        });
    }

    function CPX(addressing) {
        return addressing(function() {
            var val = (X - data) & 255;
            setC(X >= data);
            setZ(val);
            setN(val);
        });
    }

    function CPY(addressing) {
        return addressing(function() {
            var val = (Y - data) & 255;
            setC(Y >= data);
            setZ(val);
            setN(val);
        });
    }

    function EOR(addressing) {
        return addressing(function() {
            A ^= data;
            setZ(A);
            setN(A);
        });
    }

    function LDA(addressing) {
        return addressing(function() {
            A = data;
            setZ(A);
            setN(A);
        });
    }

    function LDX(addressing) {
        return addressing(function() {
            X = data;
            setZ(X);
            setN(X);
        });
    }

    function LDY(addressing) {
        return addressing(function() {
            Y = data;
            setZ(Y);
            setN(Y);
        });
    }

    function ORA(addressing) {
        return addressing(function() {
            A |= data;
            setZ(A);
            setN(A);
        });
    }

    function SBC(addressing) {
        return addressing(function() {
            if (D) {
                var operand = data;
                var AL = (A & 15) - (operand & 15) - (1-C);
                var AH = (A >> 4) - (operand >> 4) - (AL < 0);
                if (AL < 0) { AL -= 6; }
                if (AH < 0) { AH -= 6; }
                var sub = A - operand - (1-C);
                setC(~sub & 256);
                setV(((A ^ operand) & (A ^ sub)) & 128);
                setZ(sub & 255);
                setN(sub);
                A = ((AH << 4) | (AL & 15)) & 255;
            } else {
                operand = (~data) & 255;
                sub = A + operand + C;
                setC(sub > 255);
                setV(((A ^ sub) & (operand ^ sub) & 0x80));
                A = sub & 255;
                setZ(A);
                setN(A);
            }
        });
    }

    function uANC(addressing) {
        return addressing(function() {
            illegalOpcode("ANC");
            A &= data;
            setZ(A);
            N = C = (A & 0x080) ? 1 : 0;
        });
    }

    function uANE(addressing) {
        return addressing(function() {
            illegalOpcode("ANE");
            // Exact operation unknown. Do nothing
        });
    }

    function uARR(addressing) {
        // Some sources say flags are affected per ROR, others say its more complex. The complex one is chosen
        return addressing(function() {
            illegalOpcode("ARR");
            var val = A & data;
            var oldC = C ? 0x80 : 0;
            val = (val >>> 1) | oldC;
            A = val;
            setZ(val);
            setN(val);
            var comp = A & 0x60;
            if (comp == 0x60) 		{ C = 1; V = 0; }
            else if (comp == 0x00) 	{ C = 0; V = 0; }
            else if (comp == 0x20) 	{ C = 0; V = 1; }
            else if (comp == 0x40) 	{ C = 1; V = 1; }
        });
    }

    function uASR(addressing) {
        return addressing(function() {
            illegalOpcode("ASR");
            var val = A & data;
            C = (val & 0x01);		// bit 0
            val = val >>> 1;
            A = val;
            setZ(val);
            N = 0;
        });
    }

    function uLAS(addressing) {
        return addressing(function() {
            illegalOpcode("LAS");
            var val = SP & data;
            A = val;
            X = val;
            SP = val;
            setZ(val);
            setN(val);
        });
    }

    function uLAX(addressing) {
        return addressing(function() {
            illegalOpcode("LAX");
            var val = data;
            A = val;
            X = val;
            setZ(val);
            setN(val);
        });
    }

    function uLXA(addressing) {
        return addressing(function() {
            // Some sources say its an OR with $EE then AND with IMM, others exclude the OR,
            // others exclude both the OR and the AND. Excluding just the OR...
            illegalOpcode("LXA");
            var val = A /* | 0xEE) */ & data;
            A = val;
            X = val;
            setZ(val);
            setN(val);
        });
    }

    function uSBX(addressing) {
        return addressing(function() {
            illegalOpcode("SBX");
            var par = A & X;
            var val = data;
            var newX = (par - val) & 255;
            X = newX;
            setC(par >= val);
            setZ(newX);
            setN(newX);
        });
    }


    // Store operations

    function STA(addressing) {
        return addressing(function() {
            data = A;
        });
    }

    function STX(addressing) {
        return addressing(function() {
            data = X;
        });
    }

    function STY(addressing) {
        return addressing(function() {
            data = Y;
        });
    }

    function uSAX(addressing) {
        return addressing(function() {
            // Some sources say it would affect N and Z flags, some say it wouldn't. Chose not to affect
            illegalOpcode("SAX");
            data = A & X;
        });
    }

    function uSHA(addressing) {
        return addressing(function() {
            illegalOpcode("SHA");
            data = A & X & ((BA >>> 8) + 1) & 255; // A & X & (High byte of effective address + 1) !!!
            // data would also be stored BAH if page boundary is crossed. Unobservable, not needed here
        });
    }

    function uSHS(addressing) {
        return addressing(function() {
            illegalOpcode("SHS");
            var val = A & X;
            SP = val;
            data = val & ((BA >>> 8) + 1) & 255; // A & X & (High byte of effective address + 1) !!!
            // data would also be stored BAH if page boundary is crossed. Unobservable, not needed here
        });
    }

    function uSHX(addressing) {
        return addressing(function() {
            illegalOpcode("SHX");
            data = X & ((BA >>> 8) + 1) & 255; // X & (High byte of effective address + 1) !!!
            // data would also be stored BAH if page boundary is crossed. Unobservable, not needed here
        });
    }

    function uSHY(addressing) {
        return addressing(function() {
            illegalOpcode("SHY");
            data = Y & ((BA >>> 8) + 1) & 255; // Y & (High byte of effective address + 1) !!!
            // data would also be stored BAH if page boundary is crossed. Unobservable, not needed here
        });
    }


    // Read-Modify-Write operations

    function ASL(addressing) {
        return addressing(function() {
            setC(data > 127);
            var par = (data << 1) & 255;
            data = par;
            setZ(par);
            setN(par);
        });
    }

    function DEC(addressing) {
        return addressing(function() {
            var par = (data - 1) & 255;
            data = par;
            setZ(par);
            setN(par);
        });
    }

    function INC(addressing) {
        return addressing(function() {
            var par = (data + 1) & 255;
            data = par;
            setZ(par);
            setN(par);
        });
    }

    function LSR(addressing) {
        return addressing(function() {
            C = data & 0x01;
            data >>>= 1;
            setZ(data);
            N = 0;
        });
    }

    function ROL(addressing) {
        return addressing(function() {
            var newC = data > 127;
            var par = ((data << 1) | C) & 255;
            data = par;
            setC(newC);
            setZ(par);
            setN(par);
        });
    }

    function ROR(addressing) {
        return addressing(function() {
            var newC = data & 0x01;
            var par = (data >>> 1) | (C << 7);
            data = par;
            setC(newC);
            setZ(par);
            setN(par);
        });
    }

    function uDCP(addressing) {
        return addressing(function() {
            illegalOpcode("DCP");
            var par = (data - 1) & 255;
            data = par;
            par = A - par;
            setC(par >= 0);
            setZ(par);
            setN(par);
        });
    }

    function uISB(addressing) {
        return addressing(function() {
            illegalOpcode("ISB");
            data = (data + 1) & 255;    // ISB is the same as SBC but incs the operand first
            if (D) {
                var operand = data;
                var AL = (A & 15) - (operand & 15) - (1-C);
                var AH = (A >> 4) - (operand >> 4) - (AL < 0);
                if (AL < 0) { AL -= 6; }
                if (AH < 0) { AH -= 6; }
                var sub = A - operand - (1-C);
                setC(~sub & 256);
                setV(((A ^ operand) & (A ^ sub)) & 128);
                setZ(sub & 255);
                setN(sub);
                A = ((AH << 4) | (AL & 15)) & 255;
            } else {
                operand = (~data) & 255;
                sub = A + operand + C;
                setC(sub > 255);
                setV(((A ^ sub) & (operand ^ sub) & 0x80));
                A = sub & 255;
                setZ(A);
                setN(A);
            }
        });
    }

    function uRLA(addressing) {
        return addressing(function() {
            illegalOpcode("RLA");
            var val = data;
            var oldC = C;
            setC(val & 0x80);		// bit 7 was set
            val = ((val << 1) | oldC) & 255;
            data = val;
            A &= val;
            setZ(val);              // TODO Verify. May be A instead of val in the flags setting
            setN(val);
        });
    }

    function uRRA(addressing) {
        return addressing(function() {
            illegalOpcode("RRA");
            var val = data;
            var oldC = C ? 0x80 : 0;
            setC(val & 0x01);		// bit 0 was set
            val = (val >>> 1) | oldC;
            data = val;
            // RRA is the same as ADC from here
            if (D) {
                var operand = data;
                var AL = (A & 15) + (operand & 15) + C;
                if (AL > 9) { AL += 6; }
                var AH = ((A >> 4) + (operand >> 4) + (AL > 15)) << 4;
                setZ((A + operand + C) & 255);
                setN(AH);
                setV(((A ^AH) & ~(A ^ operand)) & 128);
                if (AH > 0x9f) { AH += 0x60; }
                setC(AH > 255);
                A = (AH | (AL & 15)) & 255;
            } else {
                var add = A + data + C;
                setC(add > 255);
                setV(((A ^ add) & (data ^ add)) & 0x80);
                A = add & 255;
                setZ(A);
                setN(A);
            }
        });
    }

    function uSLO(addressing) {
        return addressing(function() {
            illegalOpcode("SLO");
            var val = data;
            setC(val & 0x80);		// bit 7 was set
            val = (val << 1) & 255;
            data = val;
            val = A | val;
            A = val;
            setZ(val);
            setN(val);
        });
    }

    function uSRE(addressing) {
        return addressing(function() {
            illegalOpcode("SRE");
            var val = data;
            setC(val & 0x01);		// bit 0 was set
            val = val >>> 1;
            data = val;
            val = (A ^ val) & 255;
            A = val;
            setZ(val);
            setN(val);
        });
    }


    // Miscellaneous operations

    function PHA() {
        return [
            fetchOpcodeAndDecodeInstruction,
            fetchOpcodeAndDiscard,
            function() { pushToStack(A); },
            fetchNextOpcode
        ];
    }

    function PHP() {
        return [
            fetchOpcodeAndDecodeInstruction,
            fetchOpcodeAndDiscard,
            function() { pushToStack(getStatusBits()); },
            fetchNextOpcode
        ];
    }

    function PLA() {
        return [
            fetchOpcodeAndDecodeInstruction,
            fetchOpcodeAndDiscard,
            peekFromStack,
            function() {
                A = popFromStack();
                setZ(A);
                setN(A);
            },
            fetchNextOpcode
        ];
    }

    function PLP() {
        return [
            fetchOpcodeAndDecodeInstruction,
            fetchOpcodeAndDiscard,
            peekFromStack,
            function() { setStatusBits(popFromStack()); },
            fetchNextOpcode
        ];
    }

    function JSR() {
        return [
            fetchOpcodeAndDecodeInstruction,
            fetchADL,
            peekFromStack,
            function() { pushToStack((PC >>> 8)  & 0xff); },
            function() { pushToStack(PC & 0xff); },
            fetchADH,
            function() { PC = AD; fetchNextOpcode(); }
        ];
    }

    function BRK() {
        return [
            fetchOpcodeAndDecodeInstruction,
            fetchDataFromImmediate,                 // For debugging purposes, use operand as an arg for BRK!
            function() {
                if (self.debug) self.breakpoint("BRK " + data);
                pushToStack((PC >>> 8) & 0xff);
            },
            function() { pushToStack(PC & 0xff); },
            function() { pushToStack(getStatusBits()); },
            function() { AD = bus.read(IRQ_VECTOR); },
            function() { AD |= bus.read(IRQ_VECTOR + 1) << 8; },
            function() { PC = AD; fetchNextOpcode(); }
        ];
    }

    function RTI() {
        return [
            fetchOpcodeAndDecodeInstruction,
            fetchOpcodeAndDiscard,
            peekFromStack,
            function() { setStatusBits(popFromStack()); },
            function() { AD = popFromStack(); },
            function() { AD |= popFromStack() << 8; },
            function() { PC = AD; fetchNextOpcode(); }
        ];
    }

    function RTS() {
        return [
            fetchOpcodeAndDecodeInstruction,
            fetchOpcodeAndDiscard,
            peekFromStack,
            function() { AD = popFromStack(); },
            function() { AD |= popFromStack() << 8; },
            function() { PC = AD; fetchDataFromImmediate(); },
            fetchNextOpcode
        ];
    }

    function JMP_ABS() {
        return [
            fetchOpcodeAndDecodeInstruction,
            fetchADL,
            fetchADH,
            function() { PC = AD; fetchNextOpcode(); }
        ];
    }

    function JMP_IND() {
        return [
            fetchOpcodeAndDecodeInstruction,
            fetchIAL,                           // IAH will be zero
            fetchIAH,
            fetchBALFromIA,
            function() {
                add1toIAL();
                fetchBAHFromIA();
            },
            function() { PC = BA; fetchNextOpcode(); }
        ];
    }

    function Bxx(reg, cond) {
        var branchTaken;
        if      (reg === bZ) branchTaken = function() { return Z === cond; };
        else if (reg === bN) branchTaken = function() { return N === cond; };
        else if (reg === bC) branchTaken = function() { return C === cond; };
        else                 branchTaken = function() { return V === cond; };
        return [
            fetchOpcodeAndDecodeInstruction,
            fetchBranchOffset,
            function() {
                if (branchTaken()) {
                    fetchOpcodeAndDiscard();
                    addBranchOffsetToPCL();
                } else {
                    fetchNextOpcode();
                }
            },
            function() {
                if(branchOffsetCrossAdjust) {
                    fetchOpcodeAndDiscard();
                    adjustPCHForBranchOffsetCross();
                } else {
                    fetchNextOpcode();
                }
            },
            fetchNextOpcode
        ];
    }


    // Savestate  -------------------------------------------

    this.saveState = function() {
        return {
            PC: PC, A: A, X: X, Y: Y, SP: SP,
            N: N, V: V, D: D, I: I, Z: Z, C: C,
            T: T, o: opcode, R: RDY | 0,
            d: data, AD: AD, BA: BA, BC: BALCrossed | 0, IA: IA,
            bo: branchOffset, boa: branchOffsetCrossAdjust
        };
    };

    this.loadState = function(state) {
        PC = state.PC; A = state.A; X = state.X; Y = state.Y; SP = state.SP;
        N = state.N; V = state.V; D = state.D; I = state.I; Z = state.Z; C = state.C;
        T = state.T; opcode = state.o; RDY = !!state.R;
        data = state.d; AD = state.AD; BA = state.BA; BALCrossed = !!state.BC; IA = state.IA;
        branchOffset = state.bo; branchOffsetCrossAdjust = state.boa;

        instruction = instructions[opcode];
    };


    // Accessory methods

    this.toString = function() {
        return "CPU " +
            " PC: " + PC.toString(16) + "  op: " + opcode.toString() + "  T: " + T + "  data: " + data + "\n" +
            " A: " + A.toString(16) + "  X: " + X.toString(16) + "  Y: " + Y.toString(16) + "  SP: " + SP.toString(16) + "     " +
            "N" + N + "  " + "V" + V + "  " + "D" + D + "  " + "I" + I + "  " + "Z" + Z + "  " + "C" + C + "  ";
    };

    this.breakpoint = function(mes) {
        jt.Util.log(mes);
        if (this.trace) {
            var text = "CPU Breakpoint!  " + (mes ? "(" + mes + ")" : "") + "\n\n" + this.toString();
            jt.Util.message(text);
        }
    };

    //noinspection JSUnusedGlobalSymbols
    this.runCycles = function(cycles) {
        //noinspection JSUnresolvedVariable
        var start = performance.now();
        for (var i = 0; i < cycles; i++) {
            this.clockPulse();
        }
        //noinspection JSUnresolvedVariable
        var end = performance.now();
        jt.Util.message("Done running " + cycles + " cycles in " + (end - start) + " ms.");
    };

};

// Copyright 2015 by Paulo Augusto Peccin. See license.txt distributed with this file.

jt.Ram = function() {

    function init() {
        // RAM comes totally random at creation
        for (var i = bytes.length - 1; i >= 0; i--) {
            bytes[i] = (Math.random() * 256) | 0;
        }
    }

    this.powerOn = function() {
    };

    this.powerOff = function() {
    };

    this.read = function(address) {
        return bytes[address & ADDRESS_MASK];
    };

    this.write = function(address, val) {
        bytes[address & ADDRESS_MASK] = val;
    };

    this.powerFry = function() {
        var variance = 1 - FRY_VARIANCE + 2 * Math.random() * FRY_VARIANCE;
        // Randomly put "0" in bits on the ram
        var fryZeroBits = variance * FRY_ZERO_BITS;
        for (var i = 0; i < fryZeroBits; i++)
            bytes[(Math.random() * 128) | 0] &= ((Math.random() * 256) | 0);
        // Randomly put "1" in bits on the ram
        var fryOneBits = variance * FRY_ONE_BITS;
        for (i = 0; i < fryOneBits; i++)
            bytes[(Math.random() * 128) | 0] |= (0x01 << ((Math.random() * 8) | 0));
    };


    // Savestate  -------------------------------------------

    this.saveState = function() {
        return {
            b: btoa(jt.Util.uInt8ArrayToByteString(bytes))
        };
    };

    this.loadState = function(state) {
        bytes = jt.Util.byteStringToUInt8Array(atob(state.b));
    };


    // Variables  -------------------------------------------

    var bytes = new Array(128);

    var ADDRESS_MASK = 0x007f;

    var FRY_ZERO_BITS = 120;        // Quantity of bits to change
    var FRY_ONE_BITS = 25;
    var FRY_VARIANCE = 0.3;


    init();

};
// Copyright 2015 by Paulo Augusto Peccin. See license.txt distributed with this file.

jt.Pia = function() {

    this.powerOn = function() {
    };

    this.powerOff = function() {
    };

    this.clockPulse = function() {
        if (--timerCount <= 0)
            decrementTimer();
    };

    this.connectBus = function(aBus) {
        bus = aBus;
    };

    this.read = function(address) {
        var reg = address & ADDRESS_MASK;

        if (reg === 0x04 || reg === 0x06) { readFromINTIM(); return INTIM; }
        if (reg === 0x00) return SWCHA;
        if (reg === 0x02) return SWCHB;
        if (reg === 0x01) return SWACNT;
        if (reg === 0x03) return SWBCNT;
        if (reg === 0x05 || reg === 0x07) return INSTAT;						// Undocumented

        // debugInfo(String.format("Invalid PIA read register address: %04x", address));
        return 0;
    };

    this.write = function(address, i) {
        var reg = address & ADDRESS_MASK;

        if (reg === 0x04) { TIM1T  = i; setTimerInterval(i, 1); return; }
        if (reg === 0x05) { TIM8T  = i; setTimerInterval(i, 8); return; }
        if (reg === 0x06) { TIM64T = i; setTimerInterval(i, 64); return; }
        if (reg === 0x07) { T1024T = i; setTimerInterval(i, 1024); return; }
        if (reg === 0x02) { swchbWrite(i); return; }
        if (reg === 0x03) { SWBCNT = i; debugInfo(">>>> Ineffective Write to PIA SWBCNT: " + i); return; }
        if (reg === 0x00) { debugInfo(">>>> Unsupported Write to PIA SWCHA: " + i); return; }	// Output to controllers not supported
        if (reg === 0x01) { debugInfo(">>>> Unsupported Write to PIA SWACNT " + i); return; }	// SWACNT configuration not supported

        // debugInfo(String.format("Invalid PIA write register address: %04x value %d", address, b));
        return 0;
    };

    var decrementTimer = function() {	// TODO There might be an accuracy problem here
        // Also check for overflow
        if (--INTIM < 0) {
            INSTAT |= 0xc0;								// Set bit 7 and 6 (Overflow since last INTIM read and since last TIMxx write)
            INTIM = 0xff;								// Wrap timer
            timerCount = currentTimerInterval = 1;		// If timer underflows, return to 1 cycle interval per specification
        } else
            timerCount = currentTimerInterval;
    };

    var setTimerInterval = function(value, interval) {
        INTIM = value;
        INSTAT &= 0x3f;				// Reset bit 7 and 6 (Overflow since last INTIM read and since last TIMxx write)
        timerCount = currentTimerInterval = lastSetTimerInterval = interval;
        decrementTimer();			// Timer immediately decrements after setting per specification
    };

    var readFromINTIM = function() {
        INSTAT &= 0xbf;									// Resets bit 6 (Overflow since last INTIM read)
        // If fastDecrement was active (currentTimerInterval == 1), interval always returns to set value after read per specification
        if (currentTimerInterval === 1)
            timerCount = currentTimerInterval = lastSetTimerInterval;
    };

    var swchbWrite = function(val) {
        // Only bits 2, 4 and 5 can be written
        SWCHB = (SWCHB & 0xcb) | (val & 34);
    };

    var debugInfo = function(str) {
        if (self.debug)
            jt.Util.log(str);
    };


    // Controls interface  -----------------------------------------

    var controls = jt.ConsoleControls;

    this.controlStateChanged = function(control, state) {
        switch (control) {
            case controls.JOY0_UP:        if (state) SWCHA &= 0xef; else SWCHA |= 0x10; return;	//  0 = Pressed
            case controls.JOY0_DOWN:      if (state) SWCHA &= 0xdf; else SWCHA |= 0x20; return;
            case controls.PADDLE1_BUTTON:
            case controls.JOY0_LEFT:      if (state) SWCHA &= 0xbf; else SWCHA |= 0x40; return;
            case controls.PADDLE0_BUTTON:
            case controls.JOY0_RIGHT:     if (state) SWCHA &= 0x7f; else SWCHA |= 0x80; return;
            case controls.JOY1_UP:        if (state) SWCHA &= 0xfe; else SWCHA |= 0x01; return;
            case controls.JOY1_DOWN:      if (state) SWCHA &= 0xfd; else SWCHA |= 0x02; return;
            case controls.JOY1_LEFT:      if (state) SWCHA &= 0xfb; else SWCHA |= 0x04; return;
            case controls.JOY1_RIGHT:     if (state) SWCHA &= 0xf7; else SWCHA |= 0x08; return;
            case controls.RESET:          if (state) SWCHB &= 0xfe; else SWCHB |= 0x01; return;
            //case controls.SELECT:         if (state) SWCHB &= 0xfd; else SWCHB |= 0x02; return;
        }
        /*
        // Toggles
        if (!state) return;
        switch (control) {
            case controls.BLACK_WHITE: if ((SWCHB & 0x08) == 0) SWCHB |= 0x08; else SWCHB &= 0xf7;		//	0 = B/W, 1 = Color
                bus.getTia().getVideoOutput().showOSD((SWCHB & 0x08) != 0 ? "COLOR" : "B/W", true); return;
            case controls.DIFFICULTY0: if ((SWCHB & 0x40) == 0) SWCHB |= 0x40; else SWCHB &= 0xbf; 		//  0 = Beginner, 1 = Advanced
                bus.getTia().getVideoOutput().showOSD((SWCHB & 0x40) != 0 ? "P1 Expert" : "P1 Novice", true); return;
            case controls.DIFFICULTY1: if ((SWCHB & 0x80) == 0) SWCHB |= 0x80; else SWCHB &= 0x7f;		//  0 = Beginner, 1 = Advanced
                bus.getTia().getVideoOutput().showOSD((SWCHB & 0x80) != 0 ? "P2 Expert" : "P2 Novice", true); return;
        }
        */
    };

    this.controlValueChanged = function(control, position) {
        // No positional controls here
    };

    this.controlsStateReport = function(report) {
        //  Only Panel Controls are visible from outside
        report[controls.BLACK_WHITE] = (SWCHB & 0x08) === 0;
        report[controls.DIFFICULTY0] = (SWCHB & 0x40) !== 0;
        report[controls.DIFFICULTY1] = (SWCHB & 0x80) !== 0;
        report[controls.SELECT]      = (SWCHB & 0x02) === 0;
        report[controls.RESET]       = (SWCHB & 0x01) === 0;
    };


    // Savestate  -------------------------------------------

    this.saveState = function() {
        return {
            t:          timerCount,
            c:          currentTimerInterval,
            l:          lastSetTimerInterval,
            SA:         SWCHA,
            SAC:        SWACNT,
            SB:         SWCHB,
            SBC:        SWBCNT,
            IT:         INTIM,
            IS:         INSTAT,
            T1:         TIM1T,
            T8:         TIM8T,
            T6:         TIM64T,
            T2:         T1024T
        };
    };

    this.loadState = function(state) {
        timerCount           = state.t;
        currentTimerInterval = state.c;
        lastSetTimerInterval = state.l;
        // SWCHA           	 = state.SA;			// Do not load controls state
        SWACNT               = state.SAC;
        SWCHB                = state.SB;
        SWBCNT               = state.SBC;
        INTIM                = state.IT;
        INSTAT               = state.IS;
        TIM1T                = state.T1;
        TIM8T                = state.T8;
        TIM64T               = state.T6;
        T1024T               = state.T2;
    };


    // State Variables ----------------------------------------------

    this.debug = false;

    var bus;

    var timerCount = 1024;				// Start with the largest timer interval
    var currentTimerInterval = 1024;
    var lastSetTimerInterval = 1024;


    // Registers ----------------------------------------------------

    var SWCHA=      					// 11111111  Port A; input or output  (read or write)
        0xff;						    // All directions of both controllers OFF
    var SWACNT = 0;						// 11111111  Port A DDR, 0=input, 1=output
    var SWCHB = 						// 11..1.11  Port B; console switches (should be read only but unused bits can be written and read)
        0x0b;  						    // Reset OFF; Select OFF; B/W OFF; Difficult A/B OFF (Amateur)
    var SWBCNT = 0; 					// 11111111  Port B DDR (hard wired as input)
    var INTIM =   						// 11111111  Timer output (read only)
        (Math.random() * 256) | 0 ;     // Some random value. Games use this at startup to seed random number generation
    var INSTAT = 0;     	            // 11......  Timer Status (read only, undocumented)
    var TIM1T  = 0;  	    			// 11111111  set 1 clock interval (838 nsec/interval)
    var TIM8T  = 0;  					// 11111111  set 8 clock interval (6.7 usec/interval)
    var TIM64T = 0; 					// 11111111  set 64 clock interval (53.6 usec/interval)
    var T1024T = 0; 					// 11111111  set 1024 clock interval (858.2 usec/interval)


    // Constants  ----------------------------------------------------

    var ADDRESS_MASK = 0x0007;

};

// Copyright 2015 by Paulo Augusto Peccin. See license.txt distributed with this file.

(function() {

    var ntscRGB = [
        0x000000,		// 00
        0x404040,		// 02
        0x6c6c6c,		// 04
        0x909090,		// 06
        0xb0b0b0,		// 08
        0xc8c8c8,		// 0A
        0xdcdcdc,		// 0C
        0xf4f4f4,		// 0E
        0x004444,		// 10
        0x106464,		// 12
        0x248484,		// 14
        0x34a0a0,		// 16
        0x40b8b8,		// 18
        0x50d0d0,		// 1A
        0x5ce8e8,		// 1C
        0x68fcfc,		// 1E
        0x002870,		// 20
        0x144484,		// 22
        0x285c98,		// 24
        0x3c78ac,		// 26
        0x4c8cbc,		// 28
        0x5ca0cc,		// 2A
        0x68b4dc,		// 2C
        0x78c8ec,		// 2E
        0x001884,		// 30
        0x183498,		// 32
        0x3050ac,		// 34
        0x4868c0,		// 36
        0x5c80d0,		// 38
        0x7094e0,		// 3A
        0x80a8ec,		// 3C
        0x94bcfc,		// 3E
        0x000088,		// 40
        0x20209c,		// 42
        0x3c3cb0,		// 44
        0x5858c0,		// 46
        0x7070d0,		// 48
        0x8888e0,		// 4A
        0xa0a0ec,		// 4C
        0xb4b4fc,		// 4E
        0x5c0078,		// 50
        0x74208c,		// 52
        0x883ca0,		// 54
        0x9c58b0,		// 56
        0xb070c0,		// 58
        0xc084d0,		// 5A
        0xd09cdc,		// 5C
        0xe0b0ec,		// 5E
        0x780048,		// 60
        0x902060,		// 62
        0xa43c78,		// 64
        0xb8588c,		// 66
        0xcc70a0,		// 68
        0xdc84b4,		// 6A
        0xec9cc4,		// 6C
        0xfcb0d4,		// 6E
        0x840014,		// 70
        0x982030,		// 72
        0xac3c4c,		// 74
        0xc05868,		// 76
        0xd0707c,		// 78
        0xe08894,		// 7A
        0xeca0a8,		// 7C
        0xfcb4bc,		// 7E
        0x880000,		// 80
        0x9c201c,		// 82
        0xb04038,		// 84
        0xc05c50,		// 86
        0xd07468,		// 88
        0xe08c7c,		// 8A
        0xeca490,		// 8C
        0xfcb8a4,		// 8E
        0x7c1800,		// 90
        0x90381c,		// 92
        0xa85438,		// 94
        0xbc7050,		// 96
        0xcc8868,		// 98
        0xdc9c7c,		// 9A
        0xecb490,		// 9C
        0xfcc8a4,		// 9E
        0x5c2c00,		// A0
        0x784c1c,		// A2
        0x906838,		// A4
        0xac8450,		// A6
        0xc09c68,		// A8
        0xd4b47c,		// AA
        0xe8cc90,		// AC
        0xfce0a4,		// AE
        0x2c3c00,		// B0
        0x485c1c,		// B2
        0x647c38,		// B4
        0x809c50,		// B6
        0x94b468,		// B8
        0xacd07c,		// BA
        0xc0e490,		// BC
        0xd4fca4,		// BE
        0x003c00,		// C0
        0x205c20,		// C2
        0x407c40,		// C4
        0x5c9c5c,		// C6
        0x74b474,		// C8
        0x8cd08c,		// CA
        0xa4e4a4,		// CC
        0xb8fcb8,		// CE
        0x003814,		// D0
        0x1c5c34,		// D2
        0x387c50,		// D4
        0x50986c,		// D6
        0x68b484,		// D8
        0x7ccc9c,		// DA
        0x90e4b4,		// DC
        0xa4fcc8,		// DE
        0x00302c,		// E0
        0x1c504c,		// E2
        0x347068,		// E4
        0x4c8c84,		// E6
        0x64a89c,		// E8
        0x78c0b4,		// EA
        0x88d4cc,		// EC
        0x9cece0,		// EE
        0x002844,		// F0
        0x184864,		// F2
        0x306884,		// F4
        0x4484a0,		// F6
        0x589cb8,		// F8
        0x6cb4d0,		// FA
        0x7ccce8,		// FC
        0x8ce0fc		// FE
    ];

    var palRGB = [
        0x000000,		// 00
        0x282828,		// 02
        0x505050,		// 04
        0x747474,		// 06
        0x949494,		// 08
        0xb4b4b4,		// 0A
        0xd0d0d0,		// 0C
        0xf1f1f1,		// 0E
        0x000000,		// 10
        0x282828,		// 12
        0x505050,		// 14
        0x747474,		// 16
        0x949494,		// 18
        0xb4b4b4,		// 1A
        0xd0d0d0,		// 1C
        0xf1f1f1,		// 1E
        0x005880,		// 20
        0x207094,		// 22
        0x3c84a8,		// 24
        0x589cbc,		// 26
        0x70accc,		// 28
        0x84c0dc,		// 2A
        0x9cd0ec,		// 2C
        0xb0e0fc,		// 2E
        0x005c44,		// 30
        0x20785c,		// 32
        0x3c9074,		// 34
        0x58ac8c,		// 36
        0x70c0a0,		// 38
        0x84d4b0,		// 3A
        0x9ce8c4,		// 3C
        0xb0fcd4,		// 3E
        0x003470,		// 40
        0x205088,		// 42
        0x3C68A0,		// 44
        0x5884B4,		// 46
        0x7098C8,		// 48
        0x84ACDC,		// 4A
        0x9CC0EC,		// 4C
        0xB0D4FC,		// 4E
        0x146400,		// 50
        0x348020,		// 52
        0x50983C,		// 54
        0x6CB058,		// 56
        0x84C470,		// 58
        0x9CD884,		// 5A
        0xB4E89C,		// 5C
        0xC8FCB0,		// 5E
        0x140070,		// 60
        0x342088,		// 62
        0x503CA0,		// 64
        0x6C58B4,		// 66
        0x8470C8,		// 68
        0x9C84DC,		// 6A
        0xB49CEC,		// 6C
        0xC8B0FC,		// 6E
        0x5C5C00,		// 70
        0x747420,		// 72
        0x8C8C3C,		// 74
        0xA4A458,		// 76
        0xB8B870,		// 78
        0xC8C884,		// 7A
        0xDCDC9C,		// 7C
        0xECECB0,		// 7E
        0x5C0070,		// 80
        0x742084,		// 82
        0x883C94,		// 84
        0x9C58A8,		// 86
        0xB070B4,		// 88
        0xC084C4,		// 8A
        0xD09CD0,		// 8C
        0xE0B0E0,		// 8E
        0x703C00,		// 90
        0x88581C,		// 92
        0xA07438,		// 94
        0xB48C50,		// 96
        0xC8A468,		// 98
        0xDCB87C,		// 9A
        0xECCC90,		// 9C
        0xFCE0A4,		// 9E
        0x700058,		// A0
        0x88206C,		// A2
        0xA03C80,		// A4
        0xB45894,		// A6
        0xC870A4,		// A8
        0xDC84B4,		// AA
        0xEC9CC4,		// AC
        0xFCB0D4,		// AE
        0x702000,		// B0
        0x883C1C,		// B2
        0xA05838,		// B4
        0xB47450,		// B6
        0xC88868,		// B8
        0xDCA07C,		// BA
        0xECB490,		// BC
        0xFCC8A4,		// BE
        0x80003C,		// C0
        0x942054,		// C2
        0xA83C6C,		// C4
        0xBC5880,		// C6
        0xCC7094,		// C8
        0xDC84A8,		// CA
        0xEC9CB8,		// CC
        0xFCB0C8,		// CE
        0x880000,		// D0
        0x9C2020,		// D2
        0xB03C3C,		// D4
        0xC05858,		// D6
        0xD07070,		// D8
        0xE08484,		// DA
        0xEC9C9C,		// DC
        0xFCB0B0,		// DE
        0x000000,		// E0
        0x282828,		// E2
        0x505050,		// E4
        0x747474,		// E6
        0x949494,		// E8
        0xB4B4B4,		// EA
        0xD0D0D0,		// EC
        0xF1F1F1,		// EE
        0x000000,		// F0
        0x282828,		// F2
        0x505050,		// F4
        0x747474,		// F6
        0x949494,		// F8
        0xB4B4B4,		// FA
        0xD0D0D0,		// FC
        0xF1F1F1		// FE
    ];

    var ntscPalette = new Array(256);
    var palPalette = new Array(256);
    for (var i = 0, len = ntscRGB.length; i < len; i++) {
        // Adds 100% alpha for ARGB use
        ntscPalette[i*2] = ntscPalette[i*2+1] = ntscRGB[i] + 0xff000000;
        palPalette[i*2] = palPalette[i*2+1] = palRGB[i] + 0xff000000;
    }
    // ntscPalette[0] = ntscPalette[1] = palPalette[0] = palPalette[1] = 0;	// Full transparency for blacks. Needed for CRT emulation modes

    // Clean up
    ntscRGB = palRGB = undefined;


    // Set Global Constants --------------------------------------------

    jt.VideoStandard = {
        NTSC: {
            name: "NTSC",
            width: 228,
            height: 262,
            fps: 60,
            palette: ntscPalette
        },
        PAL: {
            name: "PAL",
            width: 228,
            height: 312,
            fps: 50.3846153846153847,
            palette: palPalette
        }
    };

})();


// Copyright 2015 by Paulo Augusto Peccin. See license.txt distributed with this file.

jt.TiaVideoSignal = function() {

    this.connectMonitor = function(pMonitor) {
        this.monitor = pMonitor;
    };

    this.nextLine = function(pixels, vSynch) {
        if (!this.monitor) return false;
        return this.monitor.nextLine(pixels, vSynch);
    };

    this.finishFrame = function() {
       this.monitor.synchOutput();
    };

    this.signalOff = function() {
        if (this.monitor) this.monitor.nextLine(null, false);
    };

    this.showOSD = function(message, overlap) {
        if (this.monitor)
            this.monitor.showOSD(message, overlap);
    };


    this.standard = null;
    this.monitor = null;

};
// Copyright 2015 by Paulo Augusto Peccin. See license.txt distributed with this file.

jt.TiaAudioSignal = function() {

    this.connectMonitor = function(pMonitor) {
        monitor = pMonitor;
    };

    this.cartridgeInserted = function(pCartridge) {
        if (pCartridge && pCartridge.needsAudioClock()) cartridgeNeedsAudioClock = pCartridge;
        else cartridgeNeedsAudioClock = null;
    };

    this.getChannel0 = function() {
        return channel0;
    };

    this.getChannel1 = function() {
        return channel1;
    };

    this.audioClockPulse = function() {
        if (frameSamples < samplesPerFrame)
            generateNextSamples(1);
    };

    this.signalOn = function() {
        signalOn = true;
    };

    this.signalOff = function() {
        signalOn = false;
        channel0.setVolume(0);
        channel1.setVolume(0);
    };

    this.setFps = function(fps) {
        // Normal amount is 2 sample per scanline = 31440, 524 for NTSC(60Hz) and 624 for PAL(50hz)
        // Calculate total samples per frame based on fps
        samplesPerFrame = Math.round(jt.TiaAudioSignal.SAMPLE_RATE / fps);
        if (samplesPerFrame > MAX_SAMPLES) samplesPerFrame = MAX_SAMPLES;
    };

    this.finishFrame = function() {
        var missingSamples = samplesPerFrame - frameSamples;
        if (missingSamples > 0) generateNextSamples(missingSamples);
        frameSamples = 0;
    };

    // TODO Verify choppiness in DPC audio
    this.retrieveSamples = function(quant) {
        //Util.log(">>> Samples generated: " + (nextSampleToGenerate - nextSampleToRetrieve));

        //if (nextSampleToGenerate === nextSampleToRetrieve)
        //    console.log("MATCH: " + nextSampleToGenerate );

        //if (nextSampleToGenerate < nextSampleToRetrieve)
        //    console.log("WRAP: " + nextSampleToGenerate );

        var missing = nextSampleToGenerate >= nextSampleToRetrieve
            ? quant - (nextSampleToGenerate - nextSampleToRetrieve)
            : quant - (MAX_SAMPLES - nextSampleToRetrieve + nextSampleToGenerate);

        if (missing > 0) {
            generateNextSamples(missing, true);
            //Util.log(">>> Extra samples generated: " + missing);
        } else {
            //Util.log(">>> No missing samples");
        }

        var end = nextSampleToRetrieve + quant;
        if (end >= MAX_SAMPLES) end -= MAX_SAMPLES;

        var result = retrieveResult;

        result.start = nextSampleToRetrieve;

        nextSampleToRetrieve = end;

        return result;
    };

    var generateNextSamples = function(quant, extra) {
        var mixedSample;
        for (var i = quant; i > 0; i--) {

            if (cartridgeNeedsAudioClock) cartridgeNeedsAudioClock.audioClockPulse();

            if (signalOn) {
                mixedSample = channel0.nextSample() - channel1.nextSample();
                // Add a little damper effect to round the edges of the square wave
                if (mixedSample !== lastSample) {
                    mixedSample = (mixedSample * 9 + lastSample) / 10;
                    lastSample = mixedSample;
                }
            } else {
                mixedSample = 0;
            }

            samples[nextSampleToGenerate] = mixedSample * MAX_AMPLITUDE;

            nextSampleToGenerate++;
            if (nextSampleToGenerate >= MAX_SAMPLES)
                nextSampleToGenerate = 0;
        }
        if (!extra) frameSamples += quant;
    };


    var monitor;

    var cartridgeNeedsAudioClock;

    var signalOn = false;
    var channel0 = new jt.TiaAudioChannel();
    var channel1 = new jt.TiaAudioChannel();

    var nextSampleToGenerate = 0;
    var nextSampleToRetrieve = 0;

    var samplesPerFrame =  jt.TiaAudioSignal.SAMPLE_RATE / jt.VideoStandard.NTSC.fps;
    var frameSamples = 0;

    var lastSample = 0;

    var MAX_SAMPLES = 10 * Javatari.AUDIO_BUFFER_SIZE;
    var MAX_AMPLITUDE = 0.4;

    var samples = jt.Util.arrayFill(new Array(MAX_SAMPLES), 0);

    var retrieveResult = {
        buffer: samples,
        bufferSize: MAX_SAMPLES,
        start: 0
    };

};

jt.TiaAudioSignal.SAMPLE_RATE = 31440;

// Copyright 2015 by Paulo Augusto Peccin. See license.txt distributed with this file.

jt.TiaAudioChannel = function() {

    this.nextSample = function() {				// Range 0 - 1
        if (--dividerCountdown <= 0) {
            dividerCountdown += divider;
            currentSample = nextSampleForControl();
        }

        return currentSample === 1 ? volume : 0;
    };

    this.setVolume = function(newVolume) {
        volume = newVolume / MAX_VOLUME;
    };

    this.setDivider = function(newDivider) {
        if (divider === newDivider) return;

        dividerCountdown = (dividerCountdown / divider) * newDivider;
        divider = newDivider;
    };

    this.setControl = function(newControl) {
        if (control === newControl) return;

        control = newControl;

        if (newControl === 0x00 || newControl === 0x0b)
            nextSampleForControl = nextSilence;						// Silence  ("set to 1" per specification)
        else if (newControl === 0x01)
            nextSampleForControl = nextPoly4;						// 4 bit poly
        else if (newControl === 0x02)
            nextSampleForControl = nextDiv15Poly4;	                // div 15 > 4 bit poly
        else if (newControl === 0x03)
            nextSampleForControl = nextPoly5Poly4;                   // 5 bit poly > 4 bit poly
        else if (newControl === 0x04 || newControl === 0x05)
            nextSampleForControl = nextTone2;						// div 2 pure tone
        else if (newControl === 0x06 || newControl === 0x0a)
            nextSampleForControl = nextTone31;						// div 31 pure tone (18 high, 13 low)
        else if (newControl === 0x07 || newControl === 0x09)
            nextSampleForControl = nextPoly5;						// 5 bit poly
        else if (newControl === 0x08)
            nextSampleForControl = nextPoly9;						// 9 bit poly
        else if (newControl === 0x0c || newControl === 0x0d)
            nextSampleForControl = nextTone6;						// div 6 pure tone (3 high, 3 low)
        else if (newControl === 0x0e)
            nextSampleForControl = nextDiv93;                        // div 93 pure tone	(31 tone each 3)
        else if (newControl === 0x0f)
            nextSampleForControl = nextPoly5Div6;				    // 5 bit poly div 6 (poly 5 each 3)
        else
            nextSampleForControl = nextSilence;						// default
    };

    var nextSilence = function() {
        return 1;
    };

    var currentPoly4 = function() {
        return POLY4_STREAM[poly4Count];
    };

    var nextPoly4 = function() {
        if (++poly4Count === 15)
            poly4Count = 0;
        return POLY4_STREAM[poly4Count];
    };

    var nextPoly5 = function() {
        if (++poly5Count === 31)
            poly5Count = 0;
        return POLY5_STREAM[poly5Count];
    };

    var nextPoly9 = function() {
        var carry = poly9 & 0x01;					// bit 0
        var push = ((poly9 >> 4) ^ carry) & 0x01;	// bit 4 XOR bit 0
        poly9 = poly9 >>> 1;						// shift right
        if (push === 0)								// set bit 8 = push
            poly9 &= 0x0ff;
        else
            poly9 |= 0x100;
        return carry;
    };

    var nextTone2 = function() {
        if (divider === 1)                          // Divider 1 and Tone2 should never produce sound
            return 1;
        else
            return tone2 = tone2 ? 0 : 1;
    };

    var currentTone6 = function() {
        return tone6;
    };

    var nextTone6 = function() {
        if (--tone6Countdown === 0) {
            tone6Countdown = 3;
            tone6 = tone6 ? 0 : 1;
        }
        return tone6;
    };

    var currentTone31 = function() {
        return TONE31_STREAM[tone31Count];
    };

    var nextTone31 = function() {
        if (++tone31Count === 31)
            tone31Count = 0;
        return TONE31_STREAM[tone31Count];
    };

    var nextDiv15Poly4 = function() {
        return currentTone31() !== nextTone31() ? nextPoly4() : currentPoly4();
    };

    var nextPoly5Poly4 = function() {
        return nextPoly5() ? nextPoly4() : currentPoly4();
    };

    var nextDiv93 = function() {
        return currentTone31() != nextTone31() ? nextTone6() : currentTone6();
    };

    var nextPoly5Div6 = function() {
        return nextPoly5() ? nextTone6() : currentTone6();
    };

    var nextSampleForControl = nextSilence;


    var volume = 0;					// 0 - 1
    var control = 0;				// 0-f
    var divider = 1;				// Changes to dividers will only be reflected at the next countdown cycle
    var dividerCountdown = 1;

    var currentSample = 0;

    var tone2 = 1;

    var tone6 = 1;
    var tone6Countdown = 3;

    var poly9 = 0x1ff;

    var poly4Count = 14;
    var POLY4_STREAM = [1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0 ];

    var poly5Count = 30;
    var POLY5_STREAM = [1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 0];

    var tone31Count = 30;
    var TONE31_STREAM = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    var MAX_VOLUME = 15;

};

// Copyright 2015 by Paulo Augusto Peccin. See license.txt distributed with this file.

jt.Tia = function(pCpu, pPia) {
    var self = this;

    this.powerOn = function() {
        jt.Util.arrayFill(linePixels, HBLANK_COLOR);
        jt.Util.arrayFill(debugPixels, 0);
        audioSignal.getChannel0().setVolume(0);
        audioSignal.getChannel1().setVolume(0);
        initLatchesAtPowerOn();
        observableChange(); observableChangeExtended = true;
        audioSignal.signalOn();
        powerOn = true;
    };

    this.powerOff = function() {
        powerOn = false;
        // Let monitors know that the signals are off
        videoSignal.signalOff();
        audioSignal.signalOff();
    };

    this.frame = function() {
        if (debugPause)
            if (debugPauseMoreFrames-- <= 0) return;
        do {
            clock = 0;
            // Send the first clock/3 pulse to the CPU and PIA, perceived by TIA at clock 0
            bus.clockPulse();
            // Releases the CPU at the beginning of the line in case a WSYNC has halted it
            cpu.setRDY(true);
            // HBLANK period
            for (clock = 3; clock < HBLANK_DURATION; clock += 3) {		// 3 .. 66
                if (!repeatLastLine) checkRepeatMode();
                // Send clock/3 pulse to the CPU and PIA each 3rd TIA cycle
                bus.clockPulse();
            }
            // 67
            // First Audio Sample. 2 samples per scan line ~ 31440 KHz
            audioSignal.audioClockPulse();
            // Display period
            var subClock3 = 2;	    // To control the clock/3 cycles. First at clock 69
            for (clock = 68; clock < LINE_WIDTH; clock++) {			// 68 .. 227
                if (!repeatLastLine) checkRepeatMode();
                // Clock delay decodes
                if (vBlankDecodeActive) vBlankClockDecode();
                // Send clock/3 pulse to the CPU and PIA each 3rd TIA cycle
                if (--subClock3 === 0) {
                    bus.clockPulse();
                    subClock3 = 3;
                }
                objectsClockCounters();
                if (!repeatLastLine && (clock >= 76 || !hMoveHitBlank))
                    setPixelValue();
                // else linePixels[clock] |= 0x88800080;	// Add a pink dye to show pixels repeated
            }
            // End of scan line
            // Second Audio Sample. 2 samples per scan line ~ 31440 KHz
            audioSignal.audioClockPulse();
            finishLine();
            // Send the finished line to the output and check if monitor vSynched (true returned)
        } while(!videoSignal.nextLine(linePixels, vSyncOn));
        // Ask for a refresh of the frame
        audioSignal.finishFrame();
        videoSignal.finishFrame();
    };

    this.connectBus = function(aBus) {
        bus = aBus;
    };

    this.getVideoOutput = function() {
        return videoSignal;
    };

    this.getAudioOutput = function() {
        return audioSignal;
    };

    this.setVideoStandard = function(standard) {
        videoSignal.standard = standard;
        palette = standard === jt.VideoStandard.NTSC ? jt.VideoStandard.NTSC.palette : jt.VideoStandard.PAL.palette;
    };

    this.debug = function(level) {
        debugLevel = level > 4 ? 0 : level;
        debug = debugLevel !== 0;
        videoSignal.showOSD(debug ? "Debug Level " + debugLevel : "Debug OFF", true);
        cpu.debug = debug;
        pia.debug = debug;
        if (debug) debugSetColors();
        else debugRestoreColors();
    };

    this.read = function(address) {
        var reg = address & READ_ADDRESS_MASK;
        if (reg === 0x00) return CXM0P;
        if (reg === 0x01) return CXM1P;
        if (reg === 0x02) return CXP0FB;
        if (reg === 0x03) return CXP1FB;
        if (reg === 0x04) return CXM0FB;
        if (reg === 0x05) return CXM1FB;
        if (reg === 0x06) return CXBLPF;
        if (reg === 0x07) return CXPPMM;
        if (reg === 0x08) return INPT0;
        if (reg === 0x09) return INPT1;
        if (reg === 0x0A) return INPT2;
        if (reg === 0x0B) return INPT3;
        if (reg === 0x0C) return INPT4;
        if (reg === 0x0D) return INPT5;
        return 0;
    };

    this.write = function(address, i) {
        var reg = address & WRITE_ADDRESS_MASK;
        if (reg === 0x1B) {  playerDelaySpriteChange(0, i); return; }
        if (reg === 0x1C) { playerDelaySpriteChange(1, i); return; }
   		if (reg === 0x02) { cpu.setRDY(false); if (debug) debugPixel(DEBUG_WSYNC_COLOR); return; } 	// <STROBE> Halts the CPU until the next HBLANK
        if (reg === 0x2A) { hitHMOVE(); return; }
        if (reg === 0x0D) { if (PF0 != i || playfieldDelayedChangePart === 0) playfieldDelaySpriteChange(0, i); return; }
        if (reg === 0x0E) { if (PF1 != i || playfieldDelayedChangePart === 1) playfieldDelaySpriteChange(1, i); return; }
        if (reg === 0x0F) { if (PF2 != i || playfieldDelayedChangePart === 2) playfieldDelaySpriteChange(2, i); return; }
        if (reg === 0x06) { observableChange(); if (!debug) player0Color = missile0Color = palette[i]; return; }
        if (reg === 0x07) { observableChange(); if (!debug) player1Color = missile1Color = palette[i]; return; }
        if (reg === 0x08) { observableChange(); if (!debug) playfieldColor = ballColor = palette[i]; return; }
        if (reg === 0x09) { observableChange(); if (!debug) playfieldBackground = palette[i]; return; }
        if (reg === 0x1D) { observableChange(); missile0Enabled = (i & 0x02) !== 0; return; }
        if (reg === 0x1E) { observableChange(); missile1Enabled = (i & 0x02) !== 0; return; }
        if (reg === 0x14) { hitRESBL(); return; }
        if (reg === 0x10) { hitRESP0(); return; }
        if (reg === 0x11) { hitRESP1(); return; }
        if (reg === 0x12) { hitRESM0(); return; }
        if (reg === 0x13) { hitRESM1(); return; }
        if (reg === 0x20) { HMP0 = i > 127 ? -16 + (i >>> 4) : i >>> 4; return; }
        if (reg === 0x21) { HMP1 = i > 127 ? -16 + (i >>> 4) : i >>> 4; return; }
        if (reg === 0x22) { HMM0 = i > 127 ? -16 + (i >>> 4) : i >>> 4; return; }
        if (reg === 0x23) { HMM1 = i > 127 ? -16 + (i >>> 4) : i >>> 4; return; }
        if (reg === 0x24) { HMBL = i > 127 ? -16 + (i >>> 4) : i >>> 4; return; }
        if (reg === 0x2B) { HMP0 = HMP1 = HMM0 = HMM1 = HMBL = 0; return; }
        if (reg === 0x1F) { ballSetGraphic(i); return; }
        if (reg === 0x04) { player0SetShape(i); return; }
        if (reg === 0x05) { player1SetShape(i); return; }
        if (reg === 0x0A) { playfieldAndBallSetShape(i); return; }
        if (reg === 0x0B) { observableChange(); player0Reflected = (i & 0x08) !== 0; return; }
        if (reg === 0x0C) { observableChange(); player1Reflected = (i & 0x08) !== 0; return; }
        if (reg === 0x25) { observableChange(); player0VerticalDelay = (i & 0x01) !== 0; return; }
        if (reg === 0x26) { observableChange(); player1VerticalDelay = (i & 0x01) !== 0; return; }
        if (reg === 0x27) { observableChange(); ballVerticalDelay = (i & 0x01) !== 0; return; }
        if (reg === 0x15) { AUDC0 = i; audioSignal.getChannel0().setControl(i & 0x0f); return; }
        if (reg === 0x16) { AUDC1 = i; audioSignal.getChannel1().setControl(i & 0x0f); return; }
        if (reg === 0x17) { AUDF0 = i; audioSignal.getChannel0().setDivider((i & 0x1f) + 1); return; }     // Bits 0-4, Divider from 1 to 32
        if (reg === 0x18) { AUDF1 = i; audioSignal.getChannel1().setDivider((i & 0x1f) + 1); return; }     // Bits 0-4, Divider from 1 to 32
        if (reg === 0x19) { AUDV0 = i; audioSignal.getChannel0().setVolume(i & 0x0f); return; }            // Bits 0-3, Volume from 0 to 15
        if (reg === 0x1A) { AUDV1 = i; audioSignal.getChannel1().setVolume(i & 0x0f); return; }            // Bits 0-3, Volume from 0 to 15
        if (reg === 0x28) { missile0SetResetToPlayer(i); return; }
        if (reg === 0x29) { missile1SetResetToPlayer(i); return; }
        if (reg === 0x01) { vBlankSet(i); return; }
        if (reg === 0x00) { observableChange(); vSyncOn = (i & 0x02) !== 0; if (debug) debugPixel(VSYNC_COLOR); return; }
        if (reg === 0x2C) { observableChange(); CXM0P = CXM1P = CXP0FB = CXP1FB = CXM0FB = CXM1FB = CXBLPF = CXPPMM = 0; return; }
        // if (reg === 0x03) { clock = 0; return; }  //  RSYNC
        return 0;
    };

    var setPixelValue = function() {
        // No need to calculate all possibilities in vSync/vBlank. TODO No collisions will be detected
        if (vSyncOn) {
            linePixels[clock] = vSyncColor;
            return;
        }
        if (vBlankOn) {
            linePixels[clock] = vBlankColor;
            return;
        }
        // Flags for Collision latches
        var P0 = false, P1 = false, M0 = false, M1 = false, FL = false, BL = false;
        // Updates the current PlayFiled pixel to draw only each 4 pixels, or at the first calculated pixel after stopped using cached line
        if ((clock & 0x03) === 0 || clock === lastObservableChangeClock)		// clock & 0x03 is the same as clock % 4
            playfieldUpdateCurrentPixel();
        // Pixel color
        var color;

        // Get the value for the PlayField and Ball first only if PlayField and Ball have higher priority
        if (playfieldPriority) {
            // Get the value for the Ball
            if (ballScanCounter >= 0 && ballScanCounter <= 7) {
                playersPerformDelayedSpriteChanges();		// May trigger Ball delayed enablement
                if (ballEnabled) {
                    BL = true;
                    color = ballColor;
                }
            }
            if (playfieldCurrentPixel) {
                FL = true;
                if (!color) color = playfieldColor;	// No Score Mode in priority mode
            }
        }
        // Get the value for Player0
        if (player0ScanCounter >= 0 && player0ScanCounter <= 31) {
            playersPerformDelayedSpriteChanges();
            var sprite = player0VerticalDelay ? player0ActiveSprite : player0DelayedSprite;
            if (sprite != 0)
                if (((sprite >> (player0Reflected ? (7 - (player0ScanCounter >>> 2)) : (player0ScanCounter >>> 2))) & 0x01) !== 0) {
                    P0 = true;
                    if (!color) color = player0Color;
                }
        }
        if (missile0ScanCounter >= 0 && missile0Enabled && missile0ScanCounter <= 7 && !missile0ResetToPlayer) {
            M0 = true;
            if (!color > 0) color = missile0Color;
        }
        // Get the value for Player1
        if (player1ScanCounter >= 0 && player1ScanCounter <= 31) {
            playersPerformDelayedSpriteChanges();
            sprite = player1VerticalDelay ? player1ActiveSprite : player1DelayedSprite;
            if (sprite !== 0)
                if (((sprite >> (player1Reflected ? (7 - (player1ScanCounter >>> 2)) : (player1ScanCounter >>> 2))) & 0x01) !== 0) {
                    P1 = true;
                    if (!color) color = player1Color;
                }
        }
        if (missile1ScanCounter >= 0 && missile1Enabled &&  missile1ScanCounter <= 7 && !missile1ResetToPlayer) {
            M1 = true;
            if (!color) color = missile1Color;
        }
        if (!playfieldPriority) {
            // Get the value for the Ball (low priority)
            if (ballScanCounter >= 0 && ballScanCounter <= 7) {
                playersPerformDelayedSpriteChanges();		// May trigger Ball delayed enablement
                if (ballEnabled) {
                    BL = true;
                    if (!color) color = ballColor;
                }
            }
            // Get the value for the the PlayField (low priority)
            if (playfieldCurrentPixel) {
                FL = true;
                if (!color) color = !playfieldScoreMode ? playfieldColor : (clock < 148 ? player0Color : player1Color);
            }
        }
        // If nothing more is showing, get the PlayField background value (low priority)
        if (!color) color = playfieldBackground;
        // Set the correct pixel color
        linePixels[clock] = color;
        // Finish collision latches
        if (debugNoCollisions) return;
        if (P0 && FL)
            CXP0FB |= 0x80;
        if (P1) {
            if (FL) CXP1FB |= 0x80;
            if (P0) CXPPMM |= 0x80;
        }
        if (BL) {
            if (FL) CXBLPF |= 0x80;
            if (P0) CXP0FB |= 0x40;
            if (P1) CXP1FB |= 0x40;
        }
        if (M0) {
            if (P1) CXM0P  |= 0x80;
            if (P0) CXM0P  |= 0x40;
            if (FL) CXM0FB |= 0x80;
            if (BL) CXM0FB |= 0x40;
        }
        if (M1) {
            if (P0) CXM1P  |= 0x80;
            if (P1) CXM1P  |= 0x40;
            if (FL) CXM1FB |= 0x80;
            if (BL) CXM1FB |= 0x40;
            if (M0) CXPPMM |= 0x40;
        }
    };

    var finishLine = function() {
        // Handle Paddles capacitor charging, only if paddles are connected (position >= 0)
        if (paddle0Position >= 0 && !paddleCapacitorsGrounded) {
            if (INPT0 < 0x80 && ++paddle0CapacitorCharge >= paddle0Position) INPT0 |= 0x80;
            if (INPT1 < 0x80 && ++paddle1CapacitorCharge >= paddle1Position) INPT1 |= 0x80;
        }
        // Fills the extended HBLANK portion of the current line if needed
        if (hMoveHitBlank) {
            linePixels[HBLANK_DURATION] = linePixels[HBLANK_DURATION + 1] =
            linePixels[HBLANK_DURATION + 2] = linePixels[HBLANK_DURATION + 3] =
            linePixels[HBLANK_DURATION + 4] = linePixels[HBLANK_DURATION + 5] =
            linePixels[HBLANK_DURATION + 6] = linePixels[HBLANK_DURATION + 7] = hBlankColor;    // This is faster than a fill
            hMoveHitBlank = false;
        }
        // Perform late HMOVE hit if needed
        if (hMoveLateHit) {
            hMoveLateHit = false;
            hMoveHitBlank = hMoveLateHitBlank;
            performHMOVE();
        }
        // Extend pixel computation to the entire next line if needed
        if (observableChangeExtended) {
            lastObservableChangeClock = 227;
            observableChangeExtended = false;
        }
        // Inject debugging information in the line if needed
        if (debugLevel >= 2) processDebugPixelsInLine();
    };

    var playfieldUpdateCurrentPixel = function() {
        playfieldPerformDelayedSpriteChange(false);
        if (playfieldPatternInvalid) {
            playfieldPatternInvalid = false;
            // Shortcut if the Playfield is all clear
            if (PF0 === 0 && PF1 === 0 && PF2 === 0) {
                jt.Util.arrayFill(playfieldPattern, false);
                playfieldCurrentPixel = false;
                return;
            }
            var s, i;
            if (playfieldReflected) {
                s = 40; i = -1;
            } else {
                s = 19; i = 1;
            }
            playfieldPattern[0]  = playfieldPattern[s+=i] = (PF0 & 0x10) !== 0;
            playfieldPattern[1]  = playfieldPattern[s+=i] = (PF0 & 0x20) !== 0;
            playfieldPattern[2]  = playfieldPattern[s+=i] = (PF0 & 0x40) !== 0;
            playfieldPattern[3]  = playfieldPattern[s+=i] = (PF0 & 0x80) !== 0;
            playfieldPattern[4]  = playfieldPattern[s+=i] = (PF1 & 0x80) !== 0;
            playfieldPattern[5]  = playfieldPattern[s+=i] = (PF1 & 0x40) !== 0;
            playfieldPattern[6]  = playfieldPattern[s+=i] = (PF1 & 0x20) !== 0;
            playfieldPattern[7]  = playfieldPattern[s+=i] = (PF1 & 0x10) !== 0;
            playfieldPattern[8]  = playfieldPattern[s+=i] = (PF1 & 0x08) !== 0;
            playfieldPattern[9]  = playfieldPattern[s+=i] = (PF1 & 0x04) !== 0;
            playfieldPattern[10] = playfieldPattern[s+=i] = (PF1 & 0x02) !== 0;
            playfieldPattern[11] = playfieldPattern[s+=i] = (PF1 & 0x01) !== 0;
            playfieldPattern[12] = playfieldPattern[s+=i] = (PF2 & 0x01) !== 0;
            playfieldPattern[13] = playfieldPattern[s+=i] = (PF2 & 0x02) !== 0;
            playfieldPattern[14] = playfieldPattern[s+=i] = (PF2 & 0x04) !== 0;
            playfieldPattern[15] = playfieldPattern[s+=i] = (PF2 & 0x08) !== 0;
            playfieldPattern[16] = playfieldPattern[s+=i] = (PF2 & 0x10) !== 0;
            playfieldPattern[17] = playfieldPattern[s+=i] = (PF2 & 0x20) !== 0;
            playfieldPattern[18] = playfieldPattern[s+=i] = (PF2 & 0x40) !== 0;
            playfieldPattern[19] = playfieldPattern[s+=i] = (PF2 & 0x80) !== 0;
        }
        playfieldCurrentPixel = playfieldPattern[((clock - HBLANK_DURATION) >>> 2)];
    };

    var playfieldDelaySpriteChange = function(part, sprite) {
        observableChange();
        if (debug) debugPixel(DEBUG_PF_GR_COLOR);
        playfieldPerformDelayedSpriteChange(true);
        playfieldDelayedChangeClock = clock;
        playfieldDelayedChangePart = part;
        playfieldDelayedChangePattern = sprite;
    };

    var playfieldPerformDelayedSpriteChange = function(force) {
        // Only commits change if there is one and the delay has passed
        if (playfieldDelayedChangePart === -1) return;
        if (!force) {
            var dif = clock - playfieldDelayedChangeClock;
            if (dif === 0 || dif === 1) return;
        }
        observableChange();
        if 		(playfieldDelayedChangePart === 0) PF0 = playfieldDelayedChangePattern;
        else if	(playfieldDelayedChangePart === 1) PF1 = playfieldDelayedChangePattern;
        else if (playfieldDelayedChangePart === 2) PF2 = playfieldDelayedChangePattern;
        playfieldPatternInvalid = true;
        playfieldDelayedChangePart = -1;		// Marks the delayed change as nothing
    };

    var ballSetGraphic = function(value) {
        observableChange();
        ballDelayedEnablement = (value & 0x02) != 0;
        if (!ballVerticalDelay) ballEnabled = ballDelayedEnablement;
    };

    var player0SetShape = function(shape) {
        observableChange();
        // Missile size
        var speed = shape & 0x30;
        if 		(speed === 0x00) speed = 8;		// Normal size = 8 = full speed = 1 pixel per clock
        else if	(speed === 0x10) speed = 4;
        else if	(speed === 0x20) speed = 2;
        else if	(speed === 0x30) speed = 1;
        if (missile0ScanSpeed !== speed) {
            // if a copy is about to start, adjust for the new speed
            if (missile0ScanCounter > 7) missile0ScanCounter = 7 + (missile0ScanCounter - 7) / missile0ScanSpeed * speed;
            // if a copy is being scanned, kill the scan
            else if (missile0ScanCounter >= 0) missile0ScanCounter = -1;
            missile0ScanSpeed = speed;
        }
        // Player size and copies
        if ((shape & 0x07) === 0x05) {			// Double size = 1/2 speed
            speed = 2;
            player0CloseCopy = player0MediumCopy = player0WideCopy = false;
        } else if ((shape & 0x07) === 0x07) {	// Quad size = 1/4 speed
            speed = 1;
            player0CloseCopy = player0MediumCopy = player0WideCopy = false;
        } else {
            speed = 4;							// Normal size = 4 = full speed = 1 pixel per clock
            player0CloseCopy =  (shape & 0x01) !== 0;
            player0MediumCopy = (shape & 0x02) !== 0;
            player0WideCopy =   (shape & 0x04) !== 0;
        }
        if (player0ScanSpeed !== speed) {
            // if a copy is about to start, adjust for the new speed
            if (player0ScanCounter > 31) player0ScanCounter = 31 + (player0ScanCounter - 31) / player0ScanSpeed * speed;
            // if a copy is being scanned, kill the scan
            else if (player0ScanCounter >= 0) player0ScanCounter = -1;
            player0ScanSpeed = speed;
        }
    };

    var player1SetShape = function(shape) {
        observableChange();
        // Missile size
        var speed = shape & 0x30;
        if 		(speed === 0x00) speed = 8;		// Normal size = 8 = full speed = 1 pixel per clock
        else if	(speed === 0x10) speed = 4;
        else if	(speed === 0x20) speed = 2;
        else if	(speed === 0x30) speed = 1;
        if (missile1ScanSpeed !== speed) {
            // if a copy is about to start, adjust for the new speed
            if (missile1ScanCounter > 7) missile1ScanCounter = 7 + (missile1ScanCounter - 7) / missile1ScanSpeed * speed;
            // if a copy is being scanned, kill the scan
            else if (missile1ScanCounter >= 0) missile1ScanCounter = -1;
            missile1ScanSpeed = speed;
        }
        // Player size and copies
        if ((shape & 0x07) === 0x05) {			// Double size = 1/2 speed
            speed = 2;
            player1CloseCopy = player1MediumCopy = player1WideCopy = false;
        } else if ((shape & 0x07) === 0x07) {	// Quad size = 1/4 speed
            speed = 1;
            player1CloseCopy = player1MediumCopy = player1WideCopy = false;
        } else {
            speed = 4;							// Normal size = 4 = full speed = 1 pixel per clock
            player1CloseCopy =  (shape & 0x01) !== 0;
            player1MediumCopy = (shape & 0x02) !== 0;
            player1WideCopy =   (shape & 0x04) !== 0;
        }
        if (player1ScanSpeed !== speed) {
            // if a copy is about to start, adjust to produce the same start position
            if (player1ScanCounter > 31) player1ScanCounter = 31 + (player1ScanCounter - 31) / player1ScanSpeed * speed;
            // if a copy is being scanned, kill the scan
            else if (player1ScanCounter >= 0) player1ScanCounter = -1;
            player1ScanSpeed = speed;
        }
    };

    var playfieldAndBallSetShape = function(shape) {
        observableChange();
        var reflect = (shape & 0x01) !== 0;
        if (playfieldReflected != reflect) {
            playfieldReflected = reflect;
            playfieldPatternInvalid = true;
        }
        playfieldScoreMode = (shape & 0x02) !== 0;
        playfieldPriority = (shape & 0x04) !== 0;
        var speed = shape & 0x30;
        if 		(speed === 0x00) speed = 8;		// Normal size = 8 = full speed = 1 pixel per clock
        else if	(speed === 0x10) speed = 4;
        else if	(speed === 0x20) speed = 2;
        else if	(speed === 0x30) speed = 1;
        if (ballScanSpeed !== speed) {
            // if a copy is about to start, adjust for the new speed
            if (ballScanCounter > 7) ballScanCounter = 7 + (ballScanCounter - 7) / ballScanSpeed * speed;
            // if a copy is being scanned, kill the scan
            else if (ballScanCounter >= 0) ballScanCounter = -1;
            ballScanSpeed = speed;
        }
    };

    var hitRESP0 = function() {
        observableChange(); observableChangeExtended = true;
        if (debug) debugPixel(DEBUG_P0_RES_COLOR);

        // Hit in last pixel of HBLANK or after
        if (clock >= HBLANK_DURATION + (hMoveHitBlank ? 8-1 : 0)) {
            if (player0Counter !== 155) player0RecentReset = true;
            player0Counter = 155;
            return;
        }

        // Hit before last pixel of HBLANK
        var d = 0;									// No HMOVE, displacement = 0
        if (hMoveHitBlank) {						// With HMOVE
            if (clock >= HBLANK_DURATION)			// During extended HBLANK
                d = (HBLANK_DURATION - clock) + 8;
            else {
                d = (clock - hMoveHitClock - 4) >> 2;
                if (d > 8) d = 8;
            }
        }

        player0Counter = 157 - d;
        player0RecentReset = player0Counter <= 155;
    };

    var hitRESP1 = function() {
        observableChange(); observableChangeExtended = true;
        if (debug) debugPixel(DEBUG_P1_RES_COLOR);

        // Hit in last pixel of HBLANK or after
        if (clock >= HBLANK_DURATION + (hMoveHitBlank ? 8-1 : 0)) {
            if (player1Counter !== 155) player1RecentReset = true;
            player1Counter = 155;
            return;
        }

        // Hit before last pixel of HBLANK
        var d = 0;									// No HMOVE, displacement = 0
        if (hMoveHitBlank) {						// With HMOVE
            if (clock >= HBLANK_DURATION)			// During extended HBLANK
                d = (HBLANK_DURATION - clock) + 8;
            else {
                d = (clock - hMoveHitClock - 4) >> 2;
                if (d > 8) d = 8;
            }
        }

        player1Counter = 157 - d;
        player1RecentReset = player1Counter <= 155;
    };

    var hitRESM0 = function() {
        observableChange(); observableChangeExtended = true;
        if (debug) debugPixel(DEBUG_M0_COLOR);

        // Hit in last pixel of HBLANK or after
        if (clock >= HBLANK_DURATION + (hMoveHitBlank ? 8-1 : 0)) {
            if (missile0Counter !== 155) missile0RecentReset = true;
            missile0Counter = 155;
            return;
        }

        // Hit before last pixel of HBLANK
        var d = 0;									// No HMOVE, displacement = 0
        if (hMoveHitBlank) {						// With HMOVE
            if (clock >= HBLANK_DURATION)			// During extended HBLANK
                d = (HBLANK_DURATION - clock) + 8;
            else {
                d = (clock - hMoveHitClock - 4) >> 2;
                if (d > 8) d = 8;
            }
        }

        missile0Counter = 157 - d;
        missile0RecentReset = missile0Counter <= 155;
    };

    var hitRESM1 = function() {
        observableChange(); observableChangeExtended = true;
        if (debug) debugPixel(DEBUG_M1_COLOR);

        // Hit in last pixel of HBLANK or after
        if (clock >= HBLANK_DURATION + (hMoveHitBlank ? 8-1 : 0)) {
            if (missile1Counter !== 155) missile1RecentReset = true;
            missile1Counter = 155;
            return;
        }

        // Hit before last pixel of HBLANK
        var d = 0;									// No HMOVE, displacement = 0
        if (hMoveHitBlank) {						// With HMOVE
            if (clock >= HBLANK_DURATION)			// During extended HBLANK
                d = (HBLANK_DURATION - clock) + 8;
            else {
                d = (clock - hMoveHitClock - 4) >> 2;
                if (d > 8) d = 8;
            }
        }

        missile1Counter = 157 - d;
        missile1RecentReset = missile1Counter <= 155;
    };

    var hitRESBL = function() {
        observableChange();
        if (debug) debugPixel(DEBUG_BL_COLOR);

        // Hit in last pixel of HBLANK or after
        if (clock >= HBLANK_DURATION + (hMoveHitBlank ? 8-1 : 0)) {
            ballCounter = 155;
            return;
        }

        // Hit before last pixel of HBLANK
        var d = 0;				// No HMOVE, displacement = 0
        if (hMoveHitBlank)		// With HMOVE
            if (clock >= HBLANK_DURATION)				// During extended HBLANK
                d = (HBLANK_DURATION - clock) + 8;
            else {
                d = (clock - hMoveHitClock - 4) >> 2;
                if (d > 8) d = 8;
            }

        ballCounter = 157 - d;
    };

    var hitHMOVE = function() {
        if (debug) debugPixel(DEBUG_HMOVE_COLOR);
        // Normal HMOVE
        if (clock < HBLANK_DURATION) {
            hMoveHitClock = clock;
            hMoveHitBlank = true;
            performHMOVE();
            return;
        }
        // Unsupported HMOVE
        if (clock < 219) {
            debugInfo("Unsupported HMOVE hit");
            return;
        }
        // Late HMOVE: Clocks [219-224] hide HMOVE blank next line, clocks [225, 0] produce normal behavior next line
        hMoveHitClock = 160 - clock;
        hMoveLateHit = true;
        hMoveLateHitBlank = clock >= 225;
    };

    var performHMOVE = function() {
        var add;
        var vis = false;
        add = (hMoveHitBlank ? HMP0 : HMP0 + 8); if (add !== 0) {
            vis = true;
            if (add > 0) {
                for (var i = add; i > 0; i--) player0ClockCounter();
            } else {
                player0Counter += add; if (player0Counter < 0) player0Counter += 160;
                if (player0ScanCounter >= 0) player0ScanCounter -= player0ScanSpeed * add;
            }
        }
        add = (hMoveHitBlank ? HMP1 : HMP1 + 8); if (add !== 0) {
            vis = true;
            if (add > 0) {
                for (i = add; i > 0; i--) player1ClockCounter();
            } else {
                player1Counter += add; if (player1Counter < 0) player1Counter += 160;
                if (player1ScanCounter >= 0) player1ScanCounter -= player1ScanSpeed * add;
            }
        }
        add = (hMoveHitBlank ? HMM0 : HMM0 + 8); if (add !== 0) {
            vis = true;
            if (add > 0) {
                for (i = add; i > 0; i--) missile0ClockCounter();
            } else {
                missile0Counter += add; if (missile0Counter < 0) missile0Counter += 160;
                if (missile0ScanCounter >= 0) missile0ScanCounter -= missile0ScanSpeed * add;
            }
        }
        add = (hMoveHitBlank ? HMM1 : HMM1 + 8); if (add != 0) {
            vis = true;
            if (add > 0) {
                for (i = add; i > 0; i--) missile1ClockCounter();
            } else {
                missile1Counter += add; if (missile1Counter < 0) missile1Counter += 160;
                if (missile1ScanCounter >= 0) missile1ScanCounter -= missile1ScanSpeed * add;
            }
        }
        add = (hMoveHitBlank ? HMBL : HMBL + 8); if (add != 0) {
            vis = true;
            if (add > 0) {
                for (i = add; i > 0; i--) ballClockCounter();
            } else {
                ballCounter += add; if (ballCounter < 0) ballCounter += 160;
                if (ballScanCounter >= 0) ballScanCounter -= ballScanSpeed * add;
            }
        }
        if (vis) observableChange();
    };

    var objectsClockCounters = function() {
        player0ClockCounter();
        player1ClockCounter();
        missile0ClockCounter();
        missile1ClockCounter();
        ballClockCounter();
    };

    var player0ClockCounter = function() {
        if (++player0Counter === 160) player0Counter = 0;
        if (player0ScanCounter >= 0) {
            // If missileResetToPlayer is on and the player scan has started the FIRST copy
            if (missile0ResetToPlayer && player0Counter < 12 && player0ScanCounter >= 28 && player0ScanCounter <= 31)
                missile0Counter = 156;
            player0ScanCounter -= player0ScanSpeed;
        }
        // Start scans 4 clocks before each copy. Scan is between 0 and 31, each pixel = 4 scan clocks
        if (player0Counter === 156) {
            if (player0RecentReset) player0RecentReset = false;
            else player0ScanCounter = 31 + player0ScanSpeed * (player0ScanSpeed === 4 ? 5 : 6);	// If Double or Quadruple size, delays 1 additional pixel
        }
        else if (player0Counter === 12) {
            if (player0CloseCopy) player0ScanCounter = 31 + player0ScanSpeed * 5;
        }
        else if (player0Counter === 28) {
            if (player0MediumCopy) player0ScanCounter = 31 + player0ScanSpeed * 5;
        }
        else if (player0Counter === 60) {
            if (player0WideCopy) player0ScanCounter = 31 + player0ScanSpeed * 5;
        }
    };

    var player1ClockCounter = function() {
        if (++player1Counter === 160) player1Counter = 0;
        if (player1ScanCounter >= 0) {
            // If missileResetToPlayer is on and the player scan has started the FIRST copy
            if (missile1ResetToPlayer && player1Counter < 12 && player1ScanCounter >= 28 && player1ScanCounter <= 31)
                missile1Counter = 156;
            player1ScanCounter -= player1ScanSpeed;
        }
        // Start scans 4 clocks before each copy. Scan is between 0 and 31, each pixel = 4 scan clocks
        if (player1Counter === 156) {
            if (player1RecentReset) player1RecentReset = false;
            else player1ScanCounter = 31 + player1ScanSpeed * (player1ScanSpeed === 4 ? 5 : 6);	// If Double or Quadruple size, delays 1 additional pixel
        }
        else if (player1Counter === 12) {
            if (player1CloseCopy) player1ScanCounter = 31 + player1ScanSpeed * 5;
        }
        else if (player1Counter === 28) {
            if (player1MediumCopy) player1ScanCounter = 31 + player1ScanSpeed * 5;
        }
        else if (player1Counter === 60) {
            if (player1WideCopy) player1ScanCounter = 31 + player1ScanSpeed * 5;
        }
    };

    var missile0ClockCounter = function() {
        if (++missile0Counter === 160) missile0Counter = 0;
        if (missile0ScanCounter >= 0) missile0ScanCounter -= missile0ScanSpeed;
        // Start scans 4 clocks before each copy. Scan is between 0 and 7, each pixel = 8 scan clocks
        if (missile0Counter === 156) {
            if (missile0RecentReset) missile0RecentReset = false;
            else missile0ScanCounter = 7 + missile0ScanSpeed * 4;
        }
        else if (missile0Counter === 12) {
            if (player0CloseCopy) missile0ScanCounter = 7 + missile0ScanSpeed * 4;
        }
        else if (missile0Counter === 28) {
            if (player0MediumCopy) missile0ScanCounter = 7 + missile0ScanSpeed * 4;
        }
        else if (missile0Counter === 60) {
            if (player0WideCopy) missile0ScanCounter = 7 + missile0ScanSpeed * 4;
        }
    };

    var missile1ClockCounter = function() {
        if (++missile1Counter === 160) missile1Counter = 0;
        if (missile1ScanCounter >= 0) missile1ScanCounter -= missile1ScanSpeed;
        // Start scans 4 clocks before each copy. Scan is between 0 and 7, each pixel = 8 scan clocks
        if (missile1Counter === 156) {
            if (missile1RecentReset) missile1RecentReset = false;
            else missile1ScanCounter = 7 + missile1ScanSpeed * 4;
        }
        else if (missile1Counter === 12) {
            if (player1CloseCopy) missile1ScanCounter = 7 + missile1ScanSpeed * 4;
        }
        else if (missile1Counter === 28) {
            if (player1MediumCopy) missile1ScanCounter = 7 + missile1ScanSpeed * 4;
        }
        else if (missile1Counter === 60) {
            if (player1WideCopy) missile1ScanCounter = 7 + missile1ScanSpeed * 4;
        }
    };

    var ballClockCounter = function() {
        if (++ballCounter === 160) ballCounter = 0;
        if (ballScanCounter >= 0) ballScanCounter -= ballScanSpeed;
        // The ball does not have copies and does not wait for the next scanline to start even if recently reset
        // Start scans 4 clocks before. Scan is between 0 and 7, each pixel = 8 scan clocks
        if (ballCounter === 156) ballScanCounter = 7 + ballScanSpeed * 4;
    };

    var playerDelaySpriteChange = function(player, sprite) {
        observableChange();
        if (debug) debugPixel(player === 0 ? DEBUG_P0_GR_COLOR : DEBUG_P1_GR_COLOR);
        if (playersDelayedSpriteChangesCount >= PLAYERS_DELAYED_SPRITE_CHANGES_MAX_COUNT) {
            debugInfo(">>> Max player delayed changes reached: " + PLAYERS_DELAYED_SPRITE_CHANGES_MAX_COUNT);
            return;
        }
        playersDelayedSpriteChanges[playersDelayedSpriteChangesCount][0] = clock;
        playersDelayedSpriteChanges[playersDelayedSpriteChangesCount][1] = player;
        playersDelayedSpriteChanges[playersDelayedSpriteChangesCount][2] = sprite;
        playersDelayedSpriteChangesCount++;
    };

    var playersPerformDelayedSpriteChanges = function() {
        if (playersDelayedSpriteChangesCount === 0 || playersDelayedSpriteChanges[0][0] === clock) return;
        for (var i = 0; i < playersDelayedSpriteChangesCount; i++) {
            var change = playersDelayedSpriteChanges[i];
            if (change[1] === 0) {
                player0DelayedSprite = change[2];
                player1ActiveSprite = player1DelayedSprite;
            } else {
                player1DelayedSprite = change[2];
                player0ActiveSprite = player0DelayedSprite;
                ballEnabled = ballDelayedEnablement;
            }
        }
        playersDelayedSpriteChangesCount = 0;
    };

    var missile0SetResetToPlayer = function(res) {
        observableChange();
        if (missile0ResetToPlayer = (res & 0x02) !== 0) missile0Enabled = false;
    };

    var missile1SetResetToPlayer = function(res) {
        observableChange();
        if (missile1ResetToPlayer = (res & 0x02) !== 0) missile1Enabled = false;
    };

    var vBlankSet = function(blank) {
        if (((blank & 0x02) != 0) !== vBlankOn) {	// Start the delayed decode for vBlank state change
            vBlankDecodeActive = true;
            vBlankNewState = !vBlankOn;
        }
        if ((blank & 0x40) !== 0) {
            controlsButtonsLatched = true;			// Enable Joystick Button latches
        } else {
            controlsButtonsLatched = false;			// Disable latches and update registers with the current button state
            if (controlsJOY0ButtonPressed) INPT4 &= 0x7f; else INPT4 |= 0x80;
            if (controlsJOY1ButtonPressed) INPT5 &= 0x7f; else INPT5 |= 0x80;
        }
        if ((blank & 0x80) != 0) {					// Ground paddle capacitors
            paddleCapacitorsGrounded = true;
            paddle0CapacitorCharge = paddle1CapacitorCharge = 0;
            INPT0 &= 0x7f; INPT1 &= 0x7f; INPT2 &= 0x7f; INPT3 &= 0x7f;
        }
        else
            paddleCapacitorsGrounded = false;
    };

    var vBlankClockDecode = function() {
        vBlankDecodeActive = false;
        vBlankOn = vBlankNewState;
        if (debug) debugPixel(DEBUG_VBLANK_COLOR);
        observableChange();
    };

    var observableChange = function() {
        lastObservableChangeClock = clock;
        if (repeatLastLine) repeatLastLine = false;
    };

    var checkRepeatMode = function() {
        // If one entire line since last observable change has just completed, enter repeatLastLine mode
        if (clock === lastObservableChangeClock) {
            repeatLastLine = true;
            lastObservableChangeClock = -1;
        }
    };

    var initLatchesAtPowerOn = function() {
        CXM0P = CXM1P = CXP0FB = CXP1FB = CXM0FB = CXM1FB = CXBLPF = CXPPMM = 0;
        INPT0 = INPT1 = INPT2 = INPT3 = 0;
        INPT4 = INPT5 = 0x80;
    };

    var debugPixel = function(color) {
        debugPixels[clock] = color;
    };

    var processDebugPixelsInLine = function() {
        jt.Util.arrayFillSegment(linePixels, 0, HBLANK_DURATION, hBlankColor);
        if (debugLevel >= 4 && videoSignal.monitor.currentLine() % 10 == 0) {
            for (var i = 0; i < LINE_WIDTH; i++) {
                if (debugPixels[i] !== 0) continue;
                if (i < HBLANK_DURATION) {
                    if (i % 6 == 0 || i == 66 || i == 63)
                        debugPixels[i] = DEBUG_MARKS_COLOR;
                } else {
                    if ((i - HBLANK_DURATION - 1) % 6 == 0)
                        debugPixels[i] = DEBUG_MARKS_COLOR;
                }
            }
        }
        if (debugLevel >= 3) {
            for (i = 0; i < LINE_WIDTH; i++) {
                if (debugPixels[i] != 0) {
                    linePixels[i] = debugPixels[i];
                    debugPixels[i] = 0;
                }
            }
        }
        observableChange();
    };

    var debugSetColors = function() {
        player0Color = DEBUG_P0_COLOR;
        player1Color = DEBUG_P1_COLOR;
        missile0Color = DEBUG_M0_COLOR;
        missile1Color = DEBUG_M1_COLOR;
        ballColor = DEBUG_BL_COLOR;
        playfieldColor = DEBUG_PF_COLOR;
        playfieldBackground = DEBUG_BK_COLOR;
        hBlankColor = debugLevel >= 1 ? DEBUG_HBLANK_COLOR : HBLANK_COLOR;
        vBlankColor = debugLevel >= 2 ? DEBUG_VBLANK_COLOR : VBLANK_COLOR;
    };

    var debugRestoreColors = function() {
        hBlankColor = HBLANK_COLOR;
        vBlankColor = VBLANK_COLOR;
        playfieldBackground = palette[0];
        jt.Util.arrayFill(linePixels, hBlankColor);
        observableChange();
    };

    var debugInfo = function(str) {
        if (debug) jt.Util.log("Line: " + videoSignal.monitor.currentLine() +", Pixel: " + clock + ". " + str);
    };


    // Controls interface  -----------------------------------

    var controls = jt.ConsoleControls;

    this.controlStateChanged = function(control, state) {
        //console.log(state);
        switch (control) {
            case controls.JOY0_BUTTON:
                if (state) {
                    controlsJOY0ButtonPressed = true;
                    INPT4 &= 0x7f;
                } else {
                    controlsJOY0ButtonPressed = false;
                    if (!controlsButtonsLatched)			// Does not lift the button if Latched Mode is on
                        INPT4 |= 0x80;
                }
                return;
            case controls.JOY1_BUTTON:
                if (state) {
                    controlsJOY1ButtonPressed = true;
                    INPT5 &= 0x7f;
                } else {
                    controlsJOY1ButtonPressed = false;
                    if (!controlsButtonsLatched)			// Does not lift the button if Latched Mode is on
                        INPT5 |= 0x80;
                }
                return;
        }
        /*
        // Toggles
        if (!state) return;
        switch (control) {
            case controls.DEBUG:
                self.debug(debugLevel + 1); return;
            case controls.NO_COLLISIONS:
                debugNoCollisions = !debugNoCollisions;
                videoSignal.showOSD(debugNoCollisions ? "Collisions OFF" : "Collisions ON", true);
                return;
            case controls.PAUSE:
                debugPause = !debugPause; debugPauseMoreFrames = 1;
                videoSignal.showOSD(debugPause ? "PAUSE" : "RESUME", true);
                return;
            case controls.FRAME:
                if (debugPause) debugPauseMoreFrames = 1;
                return;
            case controls.TRACE:
                cpu.trace = !cpu.trace; return;
        }
        */
    };

    this.controlValueChanged = function(control, position) {
        switch (control) {
            case controls.PADDLE0_POSITION:
                paddle0Position = position; return;
            case controls.PADDLE1_POSITION:
                paddle1Position = position; return;
        }
    };

    this.controlsStateReport = function(report) {
        //  No TIA controls visible outside by now
    };


    // Savestate  ------------------------------------------------

    this.saveState = function() {
        return {
            lp:     btoa(jt.Util.uInt32ArrayToByteString(linePixels)),
            lo:     lastObservableChangeClock,
            oc:     observableChangeExtended | 0,
            rl:     repeatLastLine | 0,
            vs:     vSyncOn | 0,
            vb:     vBlankOn | 0,
            vbd:    vBlankDecodeActive | 0,
            vbn:    vBlankNewState | 0,
            f:      jt.Util.booleanArrayToByteString(playfieldPattern),
            fi:     playfieldPatternInvalid | 0,
            fp:     playfieldCurrentPixel | 0,
            fc:     playfieldColor,
            fb:     playfieldBackground,
            fr:     playfieldReflected | 0,
            fs:     playfieldScoreMode | 0,
            ft:     playfieldPriority | 0,
            p0:     player0ActiveSprite,
            p0d:    player0DelayedSprite,
            p0c:    player0Color,
            p0rr:   player0RecentReset | 0,
            p0co:   player0Counter,
            p0sc:   player0ScanCounter,
            p0ss:   player0ScanSpeed,
            p0v:    player0VerticalDelay | 0,
            p0cc:   player0CloseCopy | 0,
            p0mc:   player0MediumCopy | 0,
            p0wc:   player0WideCopy | 0,
            p0r:    player0Reflected | 0,
            p1:     player1ActiveSprite,
            p1d:    player1DelayedSprite,
            p1c:    player1Color,
            p1rr:   player1RecentReset | 0,
            p1co:   player1Counter,
            p1sc:   player1ScanCounter,
            p1ss:   player1ScanSpeed,
            p1v:    player1VerticalDelay | 0,
            p1cc:   player1CloseCopy | 0,
            p1mc:   player1MediumCopy | 0,
            p1wc:   player1WideCopy | 0,
            p1r:    player1Reflected | 0,
            m0:     missile0Enabled | 0,
            m0c:    missile0Color,
            m0rr:   missile0RecentReset | 0,
            m0co:   missile0Counter,
            m0sc:   missile0ScanCounter,
            m0ss:   missile0ScanSpeed,
            m0r:    missile0ResetToPlayer | 0,
            m1:     missile1Enabled | 0,
            m1c:    missile1Color,
            m1rr:   missile1RecentReset | 0,
            m1co:   missile1Counter,
            m1sc:   missile1ScanCounter,
            m1ss:   missile1ScanSpeed,
            m1r:    missile1ResetToPlayer | 0,
            b:      ballEnabled | 0,
            bd:     ballDelayedEnablement | 0,
            bc:     ballColor,
            bco:    ballCounter,
            bsc:    ballScanCounter,
            bss:    ballScanSpeed,
            bv:     ballVerticalDelay | 0,
            fd:     playfieldDelayedChangeClock,
            fdc:    playfieldDelayedChangePart,
            fdp:    playfieldDelayedChangePattern,
            pds:    btoa(jt.Util.uInt8BiArrayToByteString(playersDelayedSpriteChanges)),
            pdc:    playersDelayedSpriteChangesCount,
            hb:     hMoveHitBlank | 0,
            hc:     hMoveHitClock,
            PF0:    PF0,
            PF1:    PF1,
            PF2:    PF2,
            AC0:    AUDC0,
            AC1:    AUDC1,
            AF0:    AUDF0,
            AF1:    AUDF1,
            AV0:    AUDV0,
            AV1:    AUDV1,
            HP0:    HMP0,
            HP1:    HMP1,
            HM0:    HMM0,
            HM1:    HMM1,
            HB:     HMBL,
            XM0P:   CXM0P,
            XM1P:   CXM1P,
            XP0F:   CXP0FB,
            XP1F:   CXP1FB,
            XM0F:   CXM0FB,
            XM1F:   CXM1FB,
            XBP:    CXBLPF,
            XPM:    CXPPMM
        };
    };

    this.loadState = function(state) {
        linePixels						 =  jt.Util.byteStringToUInt32Array(atob(state.lp));
        lastObservableChangeClock		 =	state.lo;
        observableChangeExtended		 =  !!state.oc;
        repeatLastLine 					 =	!!state.rl;
        vSyncOn                     	 =  !!state.vs;
        vBlankOn                    	 =  !!state.vb;
        vBlankDecodeActive				 =  !!state.vbd;
        vBlankNewState				 	 =  !!state.vbn;
        playfieldPattern            	 =  jt.Util.byteStringToBooleanArray(state.f);
        playfieldPatternInvalid     	 =  !!state.fi;
        playfieldCurrentPixel       	 =  !!state.fp;
        playfieldColor              	 =  state.fc;
        playfieldBackground         	 =  state.fb;
        playfieldReflected          	 =  !!state.fr;
        playfieldScoreMode          	 =  !!state.fs;
        playfieldPriority           	 =  !!state.ft;
        player0ActiveSprite         	 =  state.p0;
        player0DelayedSprite        	 =  state.p0d;
        player0Color                	 =  state.p0c;
        player0RecentReset       	 	 =  !!state.p0rr;
        player0Counter	            	 =  state.p0co;
        player0ScanCounter	        	 =  state.p0sc;
        player0ScanSpeed            	 =  state.p0ss;
        player0VerticalDelay        	 =  !!state.p0v;
        player0CloseCopy            	 =  !!state.p0cc;
        player0MediumCopy           	 =  !!state.p0mc;
        player0WideCopy             	 =  !!state.p0wc;
        player0Reflected            	 =  !!state.p0r;
        player1ActiveSprite         	 =  state.p1;
        player1DelayedSprite        	 =  state.p1d;
        player1Color                	 =  state.p1c;
        player1RecentReset       		 =  !!state.p1rr;
        player1Counter              	 =  state.p1co;
        player1ScanCounter				 =  state.p1sc;
        player1ScanSpeed				 =  state.p1ss;
        player1VerticalDelay        	 =  !!state.p1v;
        player1CloseCopy            	 =  !!state.p1cc;
        player1MediumCopy           	 =  !!state.p1mc;
        player1WideCopy             	 =  !!state.p1wc;
        player1Reflected            	 =  !!state.p1r;
        missile0Enabled             	 =  !!state.m0;
        missile0Color               	 =  state.m0c;
        missile0RecentReset      	 	 =  !!state.m0rr;
        missile0Counter             	 =  state.m0co;
        missile0ScanCounter         	 =  state.m0sc;
        missile0ScanSpeed				 =  state.m0ss;
        missile0ResetToPlayer			 =  !!state.m0r;
        missile1Enabled             	 =  !!state.m1;
        missile1Color               	 =  state.m1c;
        missile1RecentReset      	 	 =  !!state.m1rr;
        missile1Counter             	 =  state.m1co;
        missile1ScanCounter         	 =  state.m1sc;
        missile1ScanSpeed				 =  state.m1ss;
        missile1ResetToPlayer			 =  !!state.m1r;
        ballEnabled                 	 =  !!state.b;
        ballDelayedEnablement       	 =  !!state.bd;
        ballColor                   	 =  state.bc;
        ballCounter                 	 =  state.bco;
        ballScanCounter             	 =  state.bsc;
        ballScanSpeed					 =  state.bss;
        ballVerticalDelay           	 =  !!state.bv;
        playfieldDelayedChangeClock		 =  state.fd;
        playfieldDelayedChangePart		 =  state.fdc;
        playfieldDelayedChangePattern	 =  state.fdp;
        playersDelayedSpriteChanges      =  jt.Util.byteStringToUInt8BiArray(atob(state.pds), 3);
        playersDelayedSpriteChangesCount =  state.pdc;
        hMoveHitBlank					 =  !!state.hb;
        hMoveHitClock					 =  state.hc;
        PF0								 =  state.PF0;
        PF1								 =  state.PF1;
        PF2								 =  state.PF2;
        AUDC0							 =  state.AC0; audioSignal.getChannel0().setControl(AUDC0 & 0x0f);		// Also update the Audio Generator
        AUDC1							 =  state.AC1; audioSignal.getChannel1().setControl(AUDC1 & 0x0f);
        AUDF0							 =  state.AF0; audioSignal.getChannel0().setDivider((AUDF0 & 0x1f) + 1);
        AUDF1							 =  state.AF1; audioSignal.getChannel1().setDivider((AUDF1 & 0x1f) + 1);
        AUDV0							 =  state.AV0; audioSignal.getChannel0().setVolume(AUDV0 & 0x0f);
        AUDV1							 =  state.AV1; audioSignal.getChannel1().setVolume(AUDV1 & 0x0f);
        HMP0							 =  state.HP0;
        HMP1							 =  state.HP1;
        HMM0							 =  state.HM0;
        HMM1							 =  state.HM1;
        HMBL							 =  state.HB;
        CXM0P 							 =  state.XM0P;
        CXM1P 							 =  state.XM1P;
        CXP0FB							 =  state.XP0F;
        CXP1FB							 =  state.XP1F;
        CXM0FB							 =  state.XM0F;
        CXM1FB							 =  state.XM1F;
        CXBLPF							 =  state.XBP;
        CXPPMM							 =  state.XPM;
        if (debug) debugSetColors();						// IF debug is on, ensure debug colors are used
    };


    // Constants  ------------------------------------------------

    var HBLANK_DURATION = 68;
    var LINE_WIDTH = 228;

    var PLAYERS_DELAYED_SPRITE_CHANGES_MAX_COUNT = 50;  // Supports a maximum of player GR changes before any is drawn

    var VBLANK_COLOR = 0xff000000;		// Full transparency needed for CRT emulation modes
    var HBLANK_COLOR = 0xff000000;
    var VSYNC_COLOR  = 0xffdddddd;

    var DEBUG_P0_COLOR     = 0xff0000ff;
    var DEBUG_P0_RES_COLOR = 0xff2222bb;
    var DEBUG_P0_GR_COLOR  = 0xff111177;
    var DEBUG_P1_COLOR     = 0xffff0000;
    var DEBUG_P1_RES_COLOR = 0xffbb2222;
    var DEBUG_P1_GR_COLOR  = 0xff771111;
    var DEBUG_M0_COLOR     = 0xff6666ff;
    var DEBUG_M1_COLOR     = 0xffff6666;
    var DEBUG_PF_COLOR     = 0xff448844;
    var DEBUG_PF_GR_COLOR  = 0xff33dd33;
    var DEBUG_BK_COLOR     = 0xff334433;
    var DEBUG_BL_COLOR     = 0xff00ffff;
    var DEBUG_MARKS_COLOR  = 0xff202020;
    var DEBUG_HBLANK_COLOR = 0xff444444;
    var DEBUG_VBLANK_COLOR = 0xff2a2a2a;
    var DEBUG_WSYNC_COLOR  = 0xff880088;
    var DEBUG_HMOVE_COLOR  = 0xffffffff;

    var READ_ADDRESS_MASK  = 0x000f;
    var WRITE_ADDRESS_MASK = 0x003f;


    // Variables  ---------------------------------------------------

    var cpu = pCpu;
    var pia = pPia;
    var bus;

    var powerOn = false;

    var clock;
    var linePixels = jt.Util.arrayFill(new Array(LINE_WIDTH), 0);

    var vSyncOn = false;
    var vBlankOn = false;
    var vBlankDecodeActive = false;
    var vBlankNewState;

    var playfieldPattern = jt.Util.arrayFill(new Array(40), false);
    var playfieldPatternInvalid = true;
    var playfieldCurrentPixel = false;
    var playfieldColor = 0xff000000;
    var playfieldBackground = 0xff000000;
    var playfieldReflected = false;
    var playfieldScoreMode = false;
    var playfieldPriority = false;
    var playfieldDelayedChangeClock = -1;
    var playfieldDelayedChangePart = -1;			// Supports only one delayed change at a time.
    var playfieldDelayedChangePattern = -1;

    var player0ActiveSprite = 0;
    var player0DelayedSprite = 0;
    var player0Color = 0xff000000;
    var player0RecentReset = false;
    var player0Counter = 0;							// Position!
    var player0ScanCounter = -1;					// 31 down to 0. Current scan position. Negative = scan not happening
    var player0ScanSpeed = 4;						// Decrement ScanCounter. 4 per clock = 1 pixel wide
    var player0VerticalDelay = false;
    var player0CloseCopy = false;
    var player0MediumCopy = false;
    var player0WideCopy = false;
    var player0Reflected = false;

    var player1ActiveSprite = 0;
    var player1DelayedSprite = 0;
    var player1Color = 0xff000000;
    var player1RecentReset = false;
    var player1Counter = 0;
    var player1ScanCounter = -1;
    var player1ScanSpeed = 4;
    var player1VerticalDelay = false;
    var player1CloseCopy = false;
    var player1MediumCopy = false;
    var player1WideCopy = false;
    var player1Reflected = false;

    var missile0Enabled = false;
    var missile0Color = 0xff000000;
    var missile0RecentReset = false;
    var missile0Counter = 0;
    var missile0ScanCounter = -1;
    var missile0ScanSpeed = 8;						// 8 per clock = 1 pixel wide
    var missile0ResetToPlayer = false;

    var missile1Enabled = false;
    var missile1Color = 0xff000000;
    var missile1RecentReset = false;
    var missile1Counter = 0;
    var missile1ScanCounter = -1;
    var missile1ScanSpeed = 8;
    var missile1ResetToPlayer = false;

    var ballEnabled = false;
    var ballDelayedEnablement = false;
    var ballColor = 0xff000000;
    var ballCounter = 0;
    var ballScanCounter = -1;
    var ballScanSpeed = 8;							// 8 per clock = 1 pixel wide
    var ballVerticalDelay = false;

    var playersDelayedSpriteChanges = jt.Util.arrayFillWithArrayClone(new Array(PLAYERS_DELAYED_SPRITE_CHANGES_MAX_COUNT), [0, 0, 0]);
    var playersDelayedSpriteChangesCount = 0;

    var hMoveHitBlank = false;
    var hMoveHitClock = -1;
    var hMoveLateHit = false;
    var hMoveLateHitBlank = false;

    var debug = false;
    var debugLevel = 0;
    var debugNoCollisions = false;
    var debugPixels = jt.Util.arrayFill(new Array(LINE_WIDTH), 0);
    var debugPause = false;
    var debugPauseMoreFrames = 0;

    var vSyncColor = VSYNC_COLOR;
    var vBlankColor = VBLANK_COLOR;
    var hBlankColor = VBLANK_COLOR;

    var repeatLastLine = false;
    var lastObservableChangeClock = -1;
    var observableChangeExtended = false;

    var controlsButtonsLatched = false;
    var controlsJOY0ButtonPressed = false;
    var controlsJOY1ButtonPressed = false;

    var paddleCapacitorsGrounded = false;
    var paddle0Position = -1;			    // 380 = Left, 190 = Middle, 0 = Right. -1 = disconnected, won't charge POTs
    var paddle0CapacitorCharge = 0;
    var paddle1Position = -1;
    var paddle1CapacitorCharge = 0;

    var videoSignal = new jt.TiaVideoSignal();
    var palette;

    var audioSignal = new jt.TiaAudioSignal();


    // Read registers -------------------------------------------

    var CXM0P  = 0;     // collision M0-P1, M0-P0 (Bit 7,6)
    var CXM1P  = 0;     // collision M1-P0, M1-P1
    var CXP0FB = 0;	    // collision P0-PF, P0-BL
    var CXP1FB = 0;	    // collision P1-PF, P1-BL
    var CXM0FB = 0;	    // collision M0-PF, M0-BL
    var CXM1FB = 0;	    // collision M1-PF, M1-BL
    var CXBLPF = 0;	    // collision BL-PF, unused
    var CXPPMM = 0;	    // collision P0-P1, M0-M1
    var INPT0 =  0;     // Paddle0 Left pot port
    var INPT1 =  0;     // Paddle0 Right pot port
    var INPT2 =  0;     // Paddle1 Left pot port
    var INPT3 =  0;     // Paddle1 Right pot port
    var INPT4 =  0;     // input (Joy0 button)
    var INPT5 =  0;     // input (Joy1 button)


    // Write registers  ------------------------------------------

    var PF0;		// 1111....  playfield register byte 0
    var PF1;		// 11111111  playfield register byte 1
    var PF2;		// 11111111  playfield register byte 2
    var AUDC0;		// ....1111  audio control 0
    var AUDC1;		// ....1111  audio control 1
    var AUDF0;		// ...11111  audio frequency 0
    var AUDF1;		// ...11111  audio frequency 1
    var AUDV0;		// ....1111  audio volume 0
    var AUDV1;		// ....1111  audio volume 1
    var HMP0;		// 1111....  horizontal motion player 0
    var HMP1;		// 1111....  horizontal motion player 1
    var HMM0;		// 1111....  horizontal motion missile 0
    var HMM1;		// 1111....  horizontal motion missile 1
    var HMBL;		// 1111....  horizontal motion ball

};

// Copyright 2015 by Paulo Augusto Peccin. See license.txt distributed with this file.

jt.Bus = function(pCpu, pTia, pPia, pRam) {

    function init(self) {
        cpu = pCpu;
        tia = pTia;
        pia = pPia;
        ram = pRam;
        cpu.connectBus(self);
        tia.connectBus(self);
        pia.connectBus(self);
    }

    this.powerOn = function() {
        data = 0;
        if (!cartridge) {
            tia.getVideoOutput().showOSD("NO CARTRIDGE INSERTED!", true);
            // Data in the bus comes random at powerOn if no Cartridge is present
            data = (Math.random()* 256) | 0;
        }
        // Power on devices connected to the BUS
        if (cartridge != null) cartridge.powerOn();
        ram.powerOn();
        pia.powerOn();
        cpu.powerOn();
        tia.powerOn();
    };

    this.powerOff = function() {
        tia.powerOff();
        cpu.powerOff();
        pia.powerOff();
        ram.powerOff();
    };

    this.setCartridge = function(pCartridge) {
        cartridge = pCartridge;
        if (cartridge) {
            data = 0;
            cartridge.connectBus(this);
        }
        cartridgeNeedsBusMonitoring = cartridge && cartridge.needsBusMonitoring();
    };

    this.getCartridge = function() {
        return cartridge;
    };

    this.getTia = function() {
        return tia;
    };

    this.clockPulse = function() {
        pia.clockPulse();
        cpu.clockPulse();
    };

    this.read = function(address) {
        // CART Bus monitoring
        if (cartridgeNeedsBusMonitoring) cartridge.monitorBusBeforeRead(address, data);

        if ((address & CART_MASK) === CART_SELECT) {
            if (cartridge) data = cartridge.read(address);
        } else if ((address & RAM_MASK) === RAM_SELECT) {
            data = ram.read(address);
        } else if ((address & PIA_MASK) === PIA_SELECT) {
            data = pia.read(address);
        } else {
            // Only bit 7 and 6 are connected to TIA read registers.
            data = data & 0x3f | tia.read(address);		// Use the retained data for bits 5-0
        }

        return data;
    };

    this.write = function(address, val) {
        // CART Bus monitoring
        if (cartridgeNeedsBusMonitoring) cartridge.monitorBusBeforeWrite(address, val);

        data = val;

        if ((address & TIA_MASK) === TIA_SELECT) tia.write(address, val);
        else if ((address & RAM_MASK) === RAM_SELECT) ram.write(address, val);
        else if ((address & PIA_MASK) === PIA_SELECT) pia.write(address, val);
        else if (cartridge) cartridge.write(address, val);
    };


    var cpu;
    var tia;
    var pia;
    var ram;
    var cartridge;
    var cartridgeNeedsBusMonitoring = false;

    var data = 0;


    var CART_MASK = 0x1000;
    var CART_SELECT = 0x1000;
    var RAM_MASK = 0x1280;
    var RAM_SELECT = 0x0080;
    var TIA_MASK = 0x1080;
    var TIA_SELECT = 0x0000;
    var PIA_MASK = 0x1280;
    var PIA_SELECT = 0x0280;


    init(this);

};
// Copyright 2015 by Paulo Augusto Peccin. See license.txt distributed with this file.

jt.Clock = function(clockDriven, pCyclesPerSecond) {
    var self = this;

    function init() {
        internalSetFrequency(pCyclesPerSecond || NATURAL_FPS);
    }

    this.go = function() {
        running = true;
        if(pausePending)
            pausePending = false;
        else
            pulse();
    };

    this.pauseOnNextPulse = function(continuation) {
        continuationAfterPause = continuation || null;
        pausePending = true;
    };

    this.setFrequency = function(freq) {
        if (running)
            this.pauseOnNextPulse(function setFrequencyContinuation() {
                internalSetFrequency(freq);
                self.go();
            });
        else
            internalSetFrequency(freq);
    };

    var internalSetFrequency = function(freq) {
        cyclesPerSecond = freq;
        cycleTimeMs = 1000 / freq;
        useRequestAnimationFrame = window.requestAnimationFrame && (freq === NATURAL_FPS);
    };

    var pulse = function() {
        if (pausePending) {
            pause();
            if (continuationAfterPause) continuationAfterPause();
            continuationAfterPause = null;
            return;
        }

        clockDriven.clockPulse();
        if (useRequestAnimationFrame)
            animationFrame = window.requestAnimationFrame(pulse);
        else
            if (!interval) interval = window.setInterval(pulse, cycleTimeMs);
    };

    var pause = function () {
        if (animationFrame) {
            window.cancelAnimationFrame(animationFrame);
            animationFrame = null;
        }
        if (interval) {
            window.clearTimeout(interval);
            interval = null;
        }
        pausePending = false;
        running = false;
    };


    var running = false;

    var cyclesPerSecond = null;
    var cycleTimeMs = null;
    var useRequestAnimationFrame = null;

    var animationFrame = null;
    var interval = null;
    var pausePending = false;
    var continuationAfterPause = null;

    var NATURAL_FPS = Javatari.SCREEN_NATURAL_FPS;

    init();

};
// Copyright 2015 by Paulo Augusto Peccin. See license.txt distributed with this file.

jt.ConsoleControls = {

    JOY0_UP: 11, JOY0_DOWN: 12, JOY0_LEFT: 13, JOY0_RIGHT: 14, JOY0_BUTTON: 15,
    JOY1_UP: 21, JOY1_DOWN: 22, JOY1_LEFT: 23, JOY1_RIGHT: 24, JOY1_BUTTON: 25,
    PADDLE0_POSITION: 31, PADDLE1_POSITION: 41,		// Position from 380 (Left) to 190 (Center) to 0 (Right); -1 = disconnected, won't charge POTs
    PADDLE0_BUTTON: 35, PADDLE1_BUTTON: 45,

    POWER: 51, BLACK_WHITE: 52, SELECT: 53, RESET: 54,
    DIFFICULTY0: 55, DIFFICULTY1: 56,
    POWER_OFF: 61,

    DEBUG: 101, NO_COLLISIONS: 102, TRACE: 103, PAUSE: 104, FRAME: 105, FAST_SPEED: 106,
    CARTRIDGE_FORMAT: 107, CARTRIDGE_CLOCK_DEC: 108, CARTRIDGE_CLOCK_INC: 109, CARTRIDGE_REMOVE: 110,
    VIDEO_STANDARD: 111, POWER_FRY: 112,

    SAVE_STATE_0: {to: 0}, SAVE_STATE_1: {to: 1}, SAVE_STATE_2: {to: 2}, SAVE_STATE_3: {to: 3}, SAVE_STATE_4: {to: 4}, SAVE_STATE_5: {to: 5},
    SAVE_STATE_6: {to: 6}, SAVE_STATE_7: {to: 7}, SAVE_STATE_8: {to: 8}, SAVE_STATE_9: {to: 9}, SAVE_STATE_10: {to: 10}, SAVE_STATE_11: {to: 11}, SAVE_STATE_12: {to: 12},
    LOAD_STATE_0: {from: 0}, LOAD_STATE_1: {from: 1}, LOAD_STATE_2: {from: 2}, LOAD_STATE_3: {from: 3}, LOAD_STATE_4: {from: 4}, LOAD_STATE_5: {from: 5},
    LOAD_STATE_6: {from: 6}, LOAD_STATE_7: {from: 7}, LOAD_STATE_8: {from: 8}, LOAD_STATE_9: {from: 9}, LOAD_STATE_10: {from: 10}, LOAD_STATE_11: {from: 11}, LOAD_STATE_12: {from: 12},
    SAVE_STATE_FILE: 201,

    playerDigitalControls: [
        11, 12, 13, 14, 15, 21, 22, 23, 24, 25, 35, 45
    ]

};

// Copyright 2015 by Paulo Augusto Peccin. See license.txt distributed with this file.

jt.AtariConsole = function() {
    var self = this;
    function init() {
        mainComponentsCreate();
        socketsCreate();
        setVideoStandardAuto();
    }

    this.powerOn = function(paused) {
        if (this.powerIsOn) this.powerOff();
        bus.powerOn();
        this.powerIsOn = true;
        controlsSocket.controlsStatesRedefined();
        videoStandardAutoDetectionStart();
        if (!paused) go();
    };

    this.powerOff = function() {
        pause();
        bus.powerOff();
        this.powerIsOn = false;
        controlsSocket.controlsStatesRedefined();
    };
    
    this.emu = function(id) {
      controlsSocket.controlStateChanged(id, true);
    };

    this.clockPulse = function() {
        if (videoStandardAutoDetectionInProgress)
            videoStandardAutoDetectionTry();
        frameActions = $.extend({}, Javatari.room.controls.getControlStateMap());        
        if(self.game!=null) {
          if(replay) {
            if(self.game.frame >= 1) {
              data = Javatari.room.screen.getMonitor().getScreenURL()
              saveFrame(data, self.rom)
              var tr = self.traj[self.game.frame]['keys_pressed'];
              for(var k in tr){
                //if(isNumeric(tr[k])) {
                //  controlsSocket.controlValueChanged(parseInt(k), tr[k]);
                //} else {
                controlsSocket.controlStateChanged(parseInt(k), tr[k]);
                //}
              }
            }
            self.game.step(self.ram);
            controlsSocket.clockPulse();
            if(self.traj_max_frame == self.game.frame - 1) {
              alert('END OF REPLAY');              
            }
          } else {
            if (self.game.frame == 1) {
              self.init_state = self.saveState();
              if(rom == 'qbert' || rom == 'revenge') {
                self.started = true;
              }
            }
            if(!self.game.terminal) {
              self.game.step(self.ram);
              var frame_data = {};
              frame_data['action'] = atariControlsToALE(frameActions, ctrls);
              frame_data['keys_pressed'] = frameActions;
              frame_data['reward'] = self.game.reward;
              frame_data['terminal'] = self.game.terminal;
              frame_data['score'] = self.game.score;
              trajectory[self.game.frame-1] = frame_data;
              if(self.game.frame % 60 == 0) {
                var score = self.started ? self.game.score:0;
                update_score(score); 
              }
            } else {
              self.save_seq();
              sequence_sent = true;
            } 
            controlsSocket.clockPulse();
            if(isReset()) {
              self.resetEnv();
            }
          }
        }
        tia.frame();
        this.framesGenerated++;
    };

    this.resetEnv = function() {
      self.save_seq();
      self.game.reset();
      sequence_sent = false;
      trajectory = {};
      self.started = true;
    }

    var isReset = function() {
        return (frameActions[ctrls.RESET] || (self.game.terminal && self.started && frameActions[self.game.ADDITIONAL_RESET]));
    };

    this.getCartridgeSocket = function() {
        return cartridgeSocket;
    };

    this.getControlsSocket = function() {
        return controlsSocket;
    };

    this.getVideoOutput = function() {
        return tia.getVideoOutput();
    };

      this.getAudioOutput = function() {
        return tia.getAudioOutput();
    };

    this.getSavestateSocket = function() {
        return saveStateSocket;
    };

    this.showOSD = function(message, overlap) {
        this.getVideoOutput().showOSD(message, overlap);
    };

    var go = function() {
        mainClock.go();
    };

    var pause = function() {
        mainClock.pauseOnNextPulse();
    };

    var setCartridge = function(cartridge) {
        self.game = envForGame(cartridge.rom.info.l);
        self.init_state = 0; 
        Javatari.cartridge = cartridge;
        var removedCartridge = getCartridge();
        bus.setCartridge(cartridge);
        cartridgeSocket.cartridgeInserted(cartridge, removedCartridge);
    };

    var getCartridge = function() {
        return bus.getCartridge();
    };

    var setVideoStandard = function(pVideoStandard) {
        if (videoStandard !== pVideoStandard){
           videoStandard = pVideoStandard;
            tia.setVideoStandard(videoStandard);
            mainClockAdjustToNormal();
        }
        self.showOSD((videoStandardIsAuto ? "AUTO: " : "") + videoStandard.name, false);
    };

    var setVideoStandardAuto = function() {
        videoStandardIsAuto = true;
        if (self.powerIsOn) videoStandardAutoDetectionStart();
        else setVideoStandard(jt.VideoStandard.NTSC);
    };

    var videoStandardAutoDetectionStart = function() {
        if (!videoStandardIsAuto || videoStandardAutoDetectionInProgress) return;
        // If no Cartridge present, use NTSC
        if (!bus.getCartridge()) {
            setVideoStandard(jt.VideoStandard.NTSC);
            return;
        }
        // Otherwise use the VideoStandard detected by the monitor
        if (!tia.getVideoOutput().monitor) return;
        videoStandardAutoDetectionInProgress = true;
        videoStandardAutoDetectionTries = 0;
        tia.getVideoOutput().monitor.videoStandardDetectionStart();
    };

    var videoStandardAutoDetectionTry = function() {
        videoStandardAutoDetectionTries++;
        var standard = tia.getVideoOutput().monitor.getVideoStandardDetected();
        if (!standard && videoStandardAutoDetectionTries < VIDEO_STANDARD_AUTO_DETECTION_FRAMES)
            return;

        if (standard) setVideoStandard(standard);
        else self.showOSD("AUTO: FAILED", false);
        videoStandardAutoDetectionInProgress = false;
    };

    var setVideoStandardForced = function(forcedVideoStandard) {
        videoStandardIsAuto = false;
        setVideoStandard(forcedVideoStandard);
    };

    var powerFry = function() {
        self.ram.powerFry();
    };

    var cycleCartridgeFormat = function() {
    };

    this.saveState = function() {
        return {
            t: tia.saveState(),
            p: pia.saveState(),
            r: self.ram.saveState(),
            c: cpu.saveState(),
            ca: getCartridge() && getCartridge().saveState(),
            vs: videoStandard.name
        };
    };

    this.loadState = function(state) {
        if (!self.powerIsOn) self.powerOn();
        tia.loadState(state.t);
        pia.loadState(state.p);
        self.ram.loadState(state.r);
        cpu.loadState(state.c);
        setCartridge(state.ca && jt.CartridgeDatabase.createCartridgeFromSaveState(state.ca));
        setVideoStandard(jt.VideoStandard[state.vs]);
        controlsSocket.controlsStatesRedefined();
    };

    var mainClockAdjustToNormal = function() {
        var freq = videoStandard.fps;
        mainClock.setFrequency(freq);
        tia.getAudioOutput().setFps(freq);
    };

    var mainClockAdjustToFast    = function() {
        var freq = 600;     // About 10x faster
        mainClock.setFrequency(freq);
        tia.getAudioOutput().setFps(freq);
    };

    var mainComponentsCreate = function() {
        cpu = new jt.M6502();
        pia = new jt.Pia();
        tia = new jt.Tia(cpu, pia);
        self.ram = new jt.Ram();
        bus = new jt.Bus(cpu, tia, pia, self.ram);
        mainClock = new jt.Clock(self, jt.VideoStandard.NTSC.fps);
    };

    var socketsCreate = function() {
        controlsSocket = new ControlsSocket();
        controlsSocket.addForwardedInput(self);
        controlsSocket.addForwardedInput(tia);
        controlsSocket.addForwardedInput(pia);
        cartridgeSocket = new CartridgeSocket();
        cartridgeSocket.addInsertionListener(tia.getAudioOutput());
        cartridgeSocket.addInsertionListener(controlsSocket);
        saveStateSocket = new SaveStateSocket();
        cartridgeSocket.addInsertionListener(saveStateSocket);
    };


    this.powerIsOn = false;

    this.framesGenerated = 0;

    var cpu;
    var pia;
    var tia;
    this.ram = 0;
    this.test = 0;
    var sequence_sent = false;
    var bus;
    var mainClock;

    var videoStandard;
    var controlsSocket;
    var cartridgeSocket;
    var saveStateSocket;

    var videoStandardIsAuto = false;
    var videoStandardAutoDetectionInProgress = false;
    var videoStandardAutoDetectionTries = 0;

    var VIDEO_STANDARD_AUTO_DETECTION_FRAMES = 90;

    // Controls interface  --------------------------------------------

    var controls = jt.ConsoleControls;

    this.controlStateChanged = function (control, state) {
        // Normal state controls
        if (control == controls.FAST_SPEED) {
            if (state) {
                self.showOSD("FAST FORWARD", true);
                mainClockAdjustToFast();
            } else {
                self.showOSD(null, true);
                mainClockAdjustToNormal();
            }
            return;
        }
        /*
        // Toggles
        if (!state) return;
        switch (control) {
            case controls.POWER:
                if (self.powerIsOn) self.powerOff();
                else self.powerOn();
                break;
            case controls.POWER_OFF:
                if (self.powerIsOn) self.powerOff();
                break;
            case controls.POWER_FRY:
                powerFry();
                break;
            case controls.SAVE_STATE_0:
            case controls.SAVE_STATE_1:
            case controls.SAVE_STATE_2:
            case controls.SAVE_STATE_3:
            case controls.SAVE_STATE_4:
            case controls.SAVE_STATE_5:
            case controls.SAVE_STATE_6:
            case controls.SAVE_STATE_7:
            case controls.SAVE_STATE_8:
            case controls.SAVE_STATE_9:
            case controls.SAVE_STATE_10:
            case controls.SAVE_STATE_11:
            case controls.SAVE_STATE_12:
                saveStateSocket.saveState(control.to);
                break;
            case controls.SAVE_STATE_FILE:
                saveStateSocket.saveStateFile();
                break;
            case controls.LOAD_STATE_0:
            case controls.LOAD_STATE_1:
            case controls.LOAD_STATE_2:
            case controls.LOAD_STATE_3:
            case controls.LOAD_STATE_4:
            case controls.LOAD_STATE_5:
            case controls.LOAD_STATE_6:
            case controls.LOAD_STATE_7:
            case controls.LOAD_STATE_8:
            case controls.LOAD_STATE_9:
            case controls.LOAD_STATE_10:
            case controls.LOAD_STATE_11:
            case controls.LOAD_STATE_12:
                saveStateSocket.loadState(control.from);
                break;
            case controls.VIDEO_STANDARD:
                self.showOSD(null, true);	// Prepares for the upcoming "AUTO" OSD to always show
                if (videoStandardIsAuto) setVideoStandardForced(jt.VideoStandard.NTSC);
                else if (videoStandard == jt.VideoStandard.NTSC) setVideoStandardForced(jt.VideoStandard.PAL);
                else setVideoStandardAuto();
                break;
            case controls.CARTRIDGE_FORMAT:
                cycleCartridgeFormat();
                break;
            case controls.CARTRIDGE_REMOVE:
                if (Javatari.CARTRIDGE_CHANGE_DISABLED)
                    self.showOSD("Cartridge change is disabled", true);
                else
                    cartridgeSocket.insert(null, false);
        }
        */
    };

    this.controlValueChanged = function (control, position) {
        // No positional controls here
    };

    this.controlsStateReport = function (report) {
        //  Only Power Control is visible from outside
        report[controls.POWER] = self.powerIsOn;
    };


    // CartridgeSocket  -----------------------------------------

    function CartridgeSocket() {

        this.insert = function (cartridge, autoPower) {
            if (autoPower && self.powerIsOn) self.powerOff();
            setCartridge(cartridge);
            if (autoPower && !self.powerIsOn) self.powerOn();
        };

        this.inserted = function () {
            return getCartridge();
        };

        this.cartridgeInserted = function (cartridge, removedCartridge) {
            for (var i = 0; i < insertionListeners.length; i++)
                insertionListeners[i].cartridgeInserted(cartridge, removedCartridge);
        };

        this.addInsertionListener = function (listener) {
            if (insertionListeners.indexOf(listener) < 0) {
                insertionListeners.push(listener);
                listener.cartridgeInserted(this.inserted());		// Fire a insertion event
            }
        };

        this.removeInsertionListener = function (listener) {
            jt.Util.arrayRemove(insertionListeners, listener);
        };

        var insertionListeners = [];

    }

    // ControlsSocket  -----------------------------------------

    function ControlsSocket() {

        this.connectControls = function(pControls) {
            controls = pControls;
        };

        this.cartridgeInserted = function(cartridge, removedCartridge) {
            if (removedCartridge) controlsSocket.removeForwardedInput(removedCartridge);
            if (cartridge) controlsSocket.addForwardedInput(cartridge);
        };

        this.clockPulse = function() {
            controls.clockPulse();
        };

        this.controlStateChanged = function(control, state) {
            frameActions[control] = state;
            for (var i = 0; i < forwardedInputsCount; i++)
                forwardedInputs[i].controlStateChanged(control, state);
        };

        //check for player id as in Tia.js lines 957-965 and append to str
        this.controlValueChanged = function(control, position) {
            //frameActions[control] = position;
            for (var i = 0; i < forwardedInputsCount; i++)
                forwardedInputs[i].controlValueChanged(control, position);
        };

        this.controlsStateReport = function(report) {
            for (var i = 0; i < forwardedInputsCount; i++)
                forwardedInputs[i].controlsStateReport(report);
        };

        this.addForwardedInput = function(input) {
            forwardedInputs.push(input);
            forwardedInputsCount = forwardedInputs.length;
        };

        this.removeForwardedInput = function(input) {
            jt.Util.arrayRemove(forwardedInputs, input);
            forwardedInputsCount = forwardedInputs.length;
        };

        this.addRedefinitionListener = function(listener) {
            if (redefinitionListeners.indexOf(listener) < 0) {
                redefinitionListeners.push(listener);
                listener.controlsStatesRedefined();		// Fire a redefinition event
            }
        };

        this.controlsStatesRedefined = function() {
            for (var i = 0; i < redefinitionListeners.length; i++)
                redefinitionListeners[i].controlsStatesRedefined();
        };

        var controls;
        var forwardedInputs = [];
        var forwardedInputsCount = 0;
        var redefinitionListeners = [];

    }


    // SavestateSocket  -----------------------------------------

    function SaveStateSocket() {

        this.connectMedia = function(pMedia) {
            media = pMedia;
        };

        this.getMedia = function() {
            return media;
        };

        this.cartridgeInserted = function(cartridge) {
            if (cartridge) cartridge.connectSaveStateSocket(this);
        };

        this.externalStateChange = function() {
            // Nothing
        };

        this.saveState = function(slot) {
            if (!self.powerIsOn || !media) return;
            var state = self.saveState();
            state.v = VERSION;
            if (media.saveState(slot, state))
                self.showOSD("State " + slot + " saved", true);
            else
                self.showOSD("State " + slot + " save failed", true);
        };

        this.loadState = function(slot) {
            if (!media) return;
            var state = media.loadState(slot);
            if (!state) {
                self.showOSD("State " + slot + " not found", true);
                return;
            }
            if (state.v !== VERSION) {
                self.showOSD("State " + slot + " load failed, wrong version", true);
                return;
            }
            self.loadState(state);
            self.showOSD("State " + slot + " loaded", true);
        };

        this.saveStateFile = function() {
            if (!self.powerIsOn || !media) return;
            // Use Cartrige label as file name
            var fileName = cartridgeSocket.inserted() && cartridgeSocket.inserted().rom.info.l;
            var state = self.saveState();
            state.v = VERSION;
            if (media.saveStateFile(fileName, state))
                self.showOSD("State Cartridge saved", true);
            else
                self.showOSD("State Cartridge save failed", true);
        };

        this.loadStateFile = function(data) {       // Return true if data was indeed a SaveState
            if (!media) return;
            var state = media.loadStateFile(data);
            if (!state) return;
            if (state.v !== VERSION) {
                self.showOSD("State Cartridge load failed, wrong version", true);
                return true;
            }
            self.loadState(state);
            self.showOSD("State Cartridge loaded", true);
            return true;
        };


        var media;
        var VERSION = 1;

    }


    // Debug methods  ------------------------------------------------------

    this.startProfiling = function() {
        var lastFrameCount = this.framesGenerated;
        setInterval(function() {
            jt.Util.log(self.framesGenerated - lastFrameCount);
            lastFrameCount = self.framesGenerated;
        }, 1000);
    };

    this.runFramesAtTopSpeed = function(frames) {
        pause();
        var start = performance.now();
        for (var i = 0; i < frames; i++)
            self.clockPulse();
        var duration = performance.now() - start;
        jt.Util.log("Done running " + frames + " in " + duration + " ms");
        jt.Util.log(frames / (duration/1000) + "frames/sec");
        go();
    };


    init();

    var frameActions = {};
    var ctrls = jt.ConsoleControls;
    var trajectory = {};
    var LEN_SAVE_THRESHOLD = 60;
    this.started = false;
    this.save_seq = function() {
      if(Object.keys(trajectory).length > LEN_SAVE_THRESHOLD && !sequence_sent && self.started) {
        sequenceToServ(trajectory, self.init_state, self.game.id, self.game.score);
      }
    }
};

// Copyright 2015 by Paulo Augusto Peccin. See license.txt distributed with this file.

jt.ROM = function(source, content, info) {

    this.source = source;
    this.content = content;
    if (info) this.info = info;
    else this.info = jt.CartridgeDatabase.produceInfo(this);


    // Savestate  -------------------------------------------

    this.saveState = function() {
        return {
            s: this.source,
            i: this.info
            // content not needed in savestates
        };
    };

};

jt.ROM.loadState = function(state) {
    return new jt.ROM(state.s, null, state.i);
};

// Copyright 2015 by Paulo Augusto Peccin. See license.txt distributed with this file.

jt.CartridgeInfoLibrary = {
	version: 20130406,
	"0685BD0BCB975CEEF7041749A5454A48":{n:"11 Sprite Demo (Piero Cavina) (PD)"},
	"1862FCA4F98E66F363308B859B5863AF":{n:"128-in-1 Junior Console (Chip 1 of 4) (1991) (Atari) (PAL)"},
	"715DD9E0240638D441A3ADD49316C018":{n:"128-in-1 Junior Console (Chip 2 of 4) (1991) (Atari) (PAL)"},
	"0D6B974FE58A1BDD453600401C407856":{n:"128-in-1 Junior Console (Chip 3 or 4) (1991) (Atari) (PAL)"},
	"7F525B07BC98080CC8950F7284E52EDE":{n:"128-in-1 Junior Console (Chip 4 of 4) (1991) (Atari) (PAL)"},
	"7F430C33044E0354815392B53A9A772D":{n:"2 Pak Special - Cavern Blaster, City War (1992) (HES) (PAL)"},
	"7732E4E4CC2644F163D6650DDCC9D9DF":{n:"2 Pak Special - Challenge, Spitfallrfing (1990) (HES) (PAL)"},
	"FD7464EDAA8CC264B97BA0D13E7F0678":{n:"2 Pak Special - Challenge, Surfing (1990) (HES) (PAL) [a]"},
	"8C8A26ED57870DABA8E13162D497BAD1":{n:"2 Pak Special - Dolphin, Oink (1990) (HES) (PAL)"},
	"ED1306436CE237AFC5A7ED3F77134202":{n:"2 Pak Special - Dolphin, Pigs 'n' Wolf (1990) (HES) (PAL)"},
	"F8C1C4A41303BD40B0D6C81BFAF8573B":{n:"2 Pak Special - Dungeon Master, Creature Strike (1992) (HES) (PAL)"},
	"AB434F4C942D6472E75D5490CC4DD128":{n:"2 Pak Special - Hoppy, Alien Force (1992) (HES) (PAL)"},
	"5B9C2E0012FBFD29EFD3306359BBFC4A":{n:"2 Pak Special - Hoppy, Alien Force (1992) (HES) (PAL) [a]"},
	"2E842C2EE22E9DAD9DF16EED091315C4":{n:"2 Pak Special - Motocross, Boom Bang (1990) (HES) (PAL)"},
	"A94B8CA630F467B574B614808D813919":{n:"2 Pak Special - Space Voyage, Fire Alert (1992) (HES) (PAL)"},
	"02A5FC90A0D183F870E8EEBAC1F16591":{n:"2 Pak Special - Star Warrior, Frogger (1990) (HES) (PAL)"},
	"4D2CEF8F19CAFEEC72D142E34A1BBC03":{n:"2 Pak Special - Star Warrior, Frogger (1990) (HES) (PAL) [a]"},
	"72FD08DEED1D6195942E0C6F392E9848":{n:"2 Pak Special - Wall Defender, Planet Patrol (1990) (HES) (PAL)"},
	"9C40BF810F761FFC9C1B69C4647A8B84":{n:"2 in 1 - Frostbite, River Raid (Unknown)"},
	"94E3FBC19107A169909E274187247A9D":{n:"2-in-1 Freeway and Tennis (Unknown)"},
	"FA529EC88ECA679F6D5FD0CCB2120E46":{n:"20 Sprites at Once Demo 1 (PD)"},
	"7A93D0C029EAA72236523EEDC3F19645":{n:"20 Sprites at Once Demo 2 (PD)"},
	"6C449DB9BBBD90972AD1932D6AF87330":{n:"20 Sprites at Once Demo 3 (PD)"},
	"BFA58198C6B9CD8062EE76A2B38E9B33":{n:"20 Sprites at Once Demo 4 (PD)"},
	"D2D8C4F1EA7F347C8BCC7D24F45AA338":{n:"20 Sprites at Once Demo 5 (PD)"},
	"AD2E6BFB3B9B9B36BA8BF493CE764C49":{n:"2600 Collison Demo 1 (Piero Cavina) (PD)"},
	"777AECE98D7373998FFB8BC0B5EFF1A2":{n:"2600 Collison Demo 2 (Piero Cavina) (PD)"},
	"EADA0DD61CE13F8317DE774DC1E68604":{n:"2600 Digital Clock (Demo 1) (PD)"},
	"3E5CA1AFAA27C5DA3C54C9942FEC528B":{n:"2600 Digital Clock (Demo 2) (PD)"},
	"F6EFA00AE99AAF33E427B674BCFD834D":{n:"2600 Digital Clock (Demo 3) (PD)"},
	"75E8D8B9E9C5C67C2226DBFD77DCFA7D":{n:"2600 Digital Clock (V b1) (PD)"},
	"5E99AA93D0ACC741DCDA8752C4E813CE":{n:"2600 Digital Clock (V b2) (PD)"},
	"62FFD175CAC3F781EF6E4870136A2520":{n:"2600 Digital Clock (V x.xx) (PD)"},
	"4FAEB04B1B7FB0FA25DB05753182A898":{n:"2600 Digital Clock (V x.xx) (PD) [a1]"},
	"655C84E5B951258C9D20F0BF2B9D496D":{n:"2600_2003 Demo (PD)"},
	"B95A6274CA0E0C773BFDC06B4C3DAA42":{n:"3-D Corridor (29-03-2003) (Paul Slocum)"},
	"6B8FB021BB2E1F1E9BD7EE57F2A8E709":{n:"3-D Corridor (29-03-2003) (Paul Slocum) (PD) [a]"},
	"8D00A38F4C8F8800F1C237215AC243FC":{n:"3-D Corridor (Green) (30-03-2003) (AD)"},
	"7B6F3348DBF71ADA88DB0FDAF7FEEFE0":{n:"3-D Corridor (Pink Spiral) (31-03-2003) (AD)"},
	"B6960BE26BEE87D53BA4E2E71CFE772F":{n:"3-D Corridor (Spiral Words) (31-03-2003) (AD)"},
	"493DAAF9FB1BA450EBA6B8ED53FFB37D":{n:"3-D Corridor Demo (27-03-2003) (MP)"},
	"4947C9DE2E28B2F5F3B0C40CE7E56D93":{n:"3-D Corridor Demo 2 (29-03-2003) (MP)"},
	"0DB4F4150FECF77E4CE72CA4D04C052F":{n:"3-D Tic-Tac-Toe (1980) (Atari)"},
	"F3213A8A702B0646D2EAF9EE0722B51C":{n:"3-D Tic-Tac-Toe (1980) (Atari) (4K)"},
	"E3600BE9EB98146ADAFDC12D91323D0F":{n:"3-D Tic-Tac-Toe (1980) (Atari) (PAL)"},
	"854B68B93E7123A3BE42B5A2A41F75D7":{n:"3-D Tic-Tac-Toe (1980) (Atari) (PAL) (4K)"},
	"7B5207E68EE85B16998BEA861987C690":{n:"3-D Tic-Tac-Toe (32 in 1) (1988) (Atari) (PAL)"},
	"402B1CA3C230A60FB279D4A2A10FA677":{n:"3-D Tic-Tac-Toe (Unknown) (PAL) (4K)"},
	"291DD47588B9158BEEBE4ACCC3A093A6":{n:"32 in 1 Console ROM (02-10-1989) (Atari) (Prototype) (PAL)"},
	"291BCDB05F2B37CDF9452D2BF08E0321":{n:"32 in 1 Game Cartridge (1988) (Atari) (Prototype) (PAL)"},
	"792B1D93EB1D8045260C840B0688EC8F":{n:"3E Bankswitch Test (TIA @ $00)"},
	"9B150A42FC788960FBB4CBE250259EE2":{n:"3E Bankswitch Test (TIA @ $40)"},
	"703F0F7AF350B0FA29DFE5FBF45D0D75":{n:"4 Game in One Dark Green (1983) (BitCorp) (PAL)"},
	"31BB9B8CEED46CB3E506777A9E65F3CE":{n:"4 Game in One Light Green (1983) (BitCorp) (PAL)"},
	"FE6ABC0F63E31E2646C9C600926B5B7F":{n:"4 in 1 (02-19-1987) (Atari) (Prototype)"},
	"6D218DAFBF5A691045CDC1F67CEB6A8F":{n:"6 Digit Score Display (1998) (Robin Harbron) (PD)"},
	"7465B06B6E25A4A6C6D77D02242AF6D6":{n:"8 in 1 (01-16-92) (Atari) (Prototype)"},
	"2CEFA695DF2ED020899A7DF7BB1E3A95":{n:"A-Team (2002) (Manuel Polik) (Hack)"},
	"DAFC3945677CCC322CE323D1E9930BEB":{n:"A-Team (Atari) (Prototype) (PAL)"},
	"C02E1AFA0671E438FD526055C556D231":{n:"A-Team (Atari) (Prototype) (PAL60)"},
	"C00734A2233EF683D9B6E622AC97A5C8":{n:"A-Team, The (03-30-1984) (Atari) (Prototype)"},
	"CD5AF682685CFECBC25A983E16B9D833":{n:"A-Team, The (05-08-1984) (Atari) (Prototype)"},
	"537ED1E0D80E6C9F752B33EA7ACBE079":{n:"A-VCS-tec Challenge (beta 5) (PD)"},
	"8786C1E56EF221D946C64F6B65B697E9":{n:"AKA Space Adventure"},
	"00F7985C20B8BDF3C557FAC4D3F26775":{n:"AStar (NTSC)"},
	"3FD1F9D66A418C9F787FC5799174DDB7":{n:"AStar (PAL)"},
	"A3FEE8CE15525EA00D45A06F04C215D1":{n:"AStar (PAL60)"},
	"17EE23E5DA931BE82F733917ADCB6386":{n:"Acid Drop (1992) (Salu) (PAL)"},
	"09274C3FC1C43BF1E362FDA436651FD8":{n:"Acid Drop (TJ)"},
	"B9F6FA399B8CD386C235983EC45E4355":{n:"Action Force (1983) (Parker Bros) (PAL)",p:1},
	"D573089534CA596E64EFEF474BE7B6BC":{n:"Action Force (1983) (Parker Bros) (PAL) [a]",p:1},
	"543B4B8FF1D616FA250C648BE428A75C":{n:"Adventure (1978) (Warren Robinett) (Hack)"},
	"157BDDB7192754A45372BE196797F284":{n:"Adventure (1980) (Atari)"},
	"4B27F5397C442D25F0C418CCDACF1926":{n:"Adventure (1980) (Atari) (PAL)"},
	"9BE58A14E055B0E7581FC4D6C2F6B31D":{n:"Adventure (Color Scrolling) (Hack)"},
	"A5B7F420CA6CC1384DA0FED523920D8E":{n:"Adventure (New Graphics) (Hack)"},
	"171CD6B55267573E6A9C2921FB720794":{n:"Adventure 34 (Kurt Howe) (Hack)"},
	"E923001015BEDD7901569F035D9C592C":{n:"Adventure II (Hack)"},
	"E2846AF3E4D172B251AB77CBDD01761E":{n:"Adventure Plus (2003) (Steve Engelhardt) (Hack)"},
	"CA4F8C5B4D6FB9D608BB96BC7EBD26C7":{n:"Adventures of TRON (1982) (M Network)"},
	"06CFD57F0559F38B9293ADAE9128FF88":{n:"Adventures on GX-12 (1989) (Telegames) (PAL)"},
	"35BE55426C1FEC32DFB503B4F0651572":{n:"Air Raid (Men-A-Vision) (PAL)",c:1},
	"A9CB638CD2CB2E8E0643D7A67DB4281C":{n:"Air Raiders (1982) (M Network)"},
	"F066BEA7AB0A37B83C83C924A87C5B67":{n:"Air Raiders (1982) (Unknown)"},
	"DA0FB2A484D0D2D8F79D6E063C94063D":{n:"Air Raiders (1982) (Unknown) [a]"},
	"CF3A9ADA2692BB42F81192897752B912":{n:"Air Raiders (Unknown) (PAL)"},
	"16CB43492987D2F32B423817CDAAF7C4":{n:"Air-Sea Battle (1977) (Atari)"},
	"1D1D2603EC139867C1D1F5DDF83093F1":{n:"Air-Sea Battle (1977) (Atari) (4K)"},
	"0C7926D660F903A2D6910C254660C32C":{n:"Air-Sea Battle (1977) (Atari) (PAL)"},
	"8AAD33DA907BED78B76B87FCEAA838C1":{n:"Air-Sea Battle (32 in 1) (1988) (Atari) (PAL)"},
	"605DCB73D22F4EFDB90EF9DA2F290F7C":{n:"Air-Sea Battle (32 in 1) (1988) (Atari) (PAL) (4K)"},
	"98E5E4D5C4DD9A986D30FD62BD2F75AE":{n:"Air-Sea Battle (Unknown) (Hack) (4K)"},
	"E5FCC62E1D73706BE7B895E887E90F84":{n:"Air-Sea Battle (Unknown) (PAL) (4K)"},
	"4D77F291DCA1518D7D8E47838695F54B":{n:"Airlock (1982) (Data Age)"},
	"8C7E5E2329F4F4E06CBCC994A30FD352":{n:"Airlock (1982) (Data Age) (Prototype)"},
	"F1A0A23E6464D954E3A9579C4CCD01C8":{n:"Alien (1982) (20th Century Fox)",c:1},
	"956496F81775DE0B69A116A0D1AD41CC":{n:"Alien (CCE)",c:1},
	"1287535256BF5DFF404839AC9E25C3E7":{n:"Alien Pac-Man (PacManPlus) (Hack)",c:1},
	"E1A51690792838C5C687DA80CD764D78":{n:"Alligator People (1983) (20th Century Fox) (Prototype)"},
	"DF95E4AF466C809619299F49ECE92365":{n:"Alpha Beam with Ernie (06-03-1983) (Atari) (Prototype) (PAL)"},
	"8F5AC5139419C5D49BACC296E342A247":{n:"Alpha Beam with Ernie (12-22-1983) (Atari) (Prototype)"},
	"9E01F7F95CB8596765E03B9A36E8E33C":{n:"Alpha Beam with Ernie (1983) (Atari)"},
	"F2D40C70CF3E1D03BC112796315888D9":{n:"Alpha Beam with Ernie (1983) (Atari) (PAL)"},
	"B0BA51723B9330797985808DB598FC31":{n:"Alpha Beam with Ernie (1983) (Atari) (PAL) [a]"},
	"2A10053FD08664C7CFBBB104386ED77F":{n:"Alpha Demo - The Beta Demo (2000) (MP)"},
	"FDF6680B2B1E8054293A39700A765692":{n:"Alpha Demo - The Beta Demo 2 (2000) (MP)"},
	"26BC2BDF447A17376AEA7EF187FF6E44":{n:"Amanda Invaders (PD)"},
	"51F15B39D9F502C2361B6BA6A73464D4":{n:"Amanda Invaders (PD) [a]"},
	"ACB7750B4D0C4BD34969802A7DEB2990":{n:"Amidar (1982) (Parker Bros)"},
	"056F5D886A4E7E6FDD83650554997D0D":{n:"Amidar (1982) (Parker Bros) (PAL)"},
	"6354F9C7588A27109C66905B0405825B":{n:"Amidar DS (2003) (TJ) (Hack)"},
	"93B9229FC0EA4FB959D604F83F8F603C":{n:"Amidar DS (Fast Enemies) (2003) (TJ) (Hack)"},
	"5BD79139A0C03B63F6F2CF00A7D385D2":{n:"An Exercise In Minimalism (V1) (1999) (Marc de Smet) (PD)"},
	"6F74ED915FFE73B524EF0F63819E2A1D":{n:"An Exercise In Minimalism (V2) (1999) (Eckhard Stolberg)"},
	"E39A13B13DC82C5FDBFBBFD55BA1230E":{n:"Analog Clock (Additional Frame Info) (V0.0) (20-01-2003) (AD)"},
	"0AE3497E731CA0BF6A77B23441D9D9F9":{n:"Analog Clock (V0.0) (20-01-2003) (AD)"},
	"335793736CBF6FC99C9359ED2A32A49D":{n:"Analog Clock (V0.0) (20-01-2003) (AD) [a]"},
	"63C5FEF3208BB1424D26CF1AB984B40C":{n:"Analog Clock (V0.1) (20-01-2003) (AD)"},
	"FC9C1652FE3A2CADE6188F4D3692481F":{n:"Andrew Davies early notBoulderDash demo (NTSC)",c:1},
	"4C606235F4EC5D2A4B89139093A69437":{n:"Andrew Davies early notBoulderDash demo (PAL)",c:1},
	"0866E22F6F56F92EA1A14C8D8D01D29C":{n:"AndroMan on the Moon (1984) (Western Tech) (Prototype)"},
	"6672DE8F82C4F7B8F7F1EF8B6B4F614D":{n:"Angeln I (Ariola) (PAL)"},
	"ADF1AFAC3BDD7B36D2EDA5949F1A0FA3":{n:"Angriff der Luftflotten (1983) (Quelle) (PAL)"},
	"AFE4EEFC7D885C277FC0649507FBCD84":{n:"Ant Party (32 in 1) (1988) (Atari) (PAL)",c:1},
	"6B01A519B413F8CFA2F399F4D2841B42":{n:"Aphex Invaders (Hack)"},
	"E73838C43040BCBC83E4204A3E72EEF4":{n:"Apples and Dolls (CCE)",c:1},
	"038E1E79C3D4410DEFDE4BFE0B99CC32":{n:"Aquaventure (08-12-1983) (Atari) (Prototype)"},
	"F69D4FCF76942FCD9BDF3FD8FDE790FB":{n:"Aquaventure (CCE)"},
	"A7B584937911D60C120677FE0D47F36F":{n:"Armor Ambush (1982) (M Network)"},
	"D0AF33865512E9B6900714C26DB5FA23":{n:"Armor Ambush (1989) (Telegames) (PAL)"},
	"C77C35A6FC3C0F12BF9E8BAE48CBA54B":{n:"Artillery Duel (1983) (Xonox)"},
	"589C73BBCD77DB798CB92A992B4C06C3":{n:"Artillery Duel (1983) (Xonox) (PAL)"},
	"D341D39774277CEE6A1D378A013F92AC":{n:"Artillery Duel (1983) (Xonox) (PAL) [a]"},
	"3F039981255691D3859D04EF813A1264":{n:"Artillery Duel (1983) (Xonox) [a]"},
	"3750F2375252B6A20E4628692E94E8B1":{n:"Ases do Ar (Dismac)"},
	"DE78B3A064D374390AC0710F95EDDE92":{n:"Assault (1983) (Bomb)"},
	"327468D6C19697E65AB702F06502C7ED":{n:"Aster-Hawk (2002) (Charles Morgan) (Hack)",c:1},
	"89A68746EFF7F266BBF08DE2483ABE55":{n:"Asterix (1983) (Atari)"},
	"FAEBCB2EF1F3831B2FC1DBD39D36517C":{n:"Asterix (1983) (Atari) (PAL)"},
	"C5C7CC66FEBF2D4E743B4459DE7ED868":{n:"Asterix (1983) (Atari) (PAL) [a]"},
	"47B82D47E491AC7FDB5053A88FCCC832":{n:"Asteroid 2 (Atari Freak 1) (Hack)",c:1},
	"18F299EDB5BA709A64C80C8C9CEC24F2":{n:"Asteroid Fire (1983) (Home Vision) (PAL)"},
	"DD7884B4F93CAB423AC471AA1935E3DF":{n:"Asteroids (1981) (Atari)",c:1},
	"8CF0D333BBE85B9549B1E6B1E2390B8D":{n:"Asteroids (1981) (Atari) (PAL)",c:1},
	"A957DBE7D85EA89133346AD56FBDA03F":{n:"Asteroids (1981) (Atari) (PAL) [a1]",c:1},
	"19ABAF2144B6A7B281C4112CFF154904":{n:"Asteroids (1981) (Atari) (PAL) [a2]",c:1},
	"BB5049E4558DAADE0F87FED69A244C59":{n:"Asteroids (1981) (Atari) (PAL) [no copyright]",c:1},
	"B227175699E372B8FE10CE243AD6DDA5":{n:"Asteroids (1981) (Atari) [a1]",c:1},
	"D563BA38151B8204C9F5C9F58E781455":{n:"Asteroids (1981) (Atari) [a2]",c:1},
	"CCBD36746ED4525821A8083B0D6D2C2C":{n:"Asteroids (1981) (Atari) [no copyright]",c:1},
	"3E4B1137433CC1E617B5508619E13063":{n:"Asteroids (Genesis)",c:1},
	"DF40AF244A8D68B492BFBA9E97DEA4D6":{n:"Asteroids 2 (Franlin Cruz) (Hack)",c:1},
	"2DBDCA3058035D2B40C734DCF06A86D9":{n:"Asteroids DC+ (Thomas Jentzsch) (Hack)",c:1},
	"8DF4BE9DDC54AC363B13DC57CEAF161A":{n:"Asteroids SS (Scott Stilphen) (Hack)",c:1},
	"75169C08B56E4E6C36681E599C4D8CC5":{n:"Astroblast (1982) (M Network)",p:1},
	"170E7589A48739CFB9CC782CBB0FE25A":{n:"Astroblast (1982) (M Network) [fixed]",p:1},
	"46E9428848C9EA71A4D8F91FF81AC9CC":{n:"Astroblast (1989) (Telegames) (PAL)",p:1},
	"8F53A3B925F0FD961D9B8C4D46EE6755":{n:"Astrowar (Unknown)"},
	"E643AAEC9A9E1C8AB7FE1EAE90BC77D7":{n:"Asymmetric Playfield (Roger Williams)"},
	"4B753A97AEE91E4B3E4E02F5E9758C72":{n:"Asymmetric Reflected Playfield (Glenn Saunders)"},
	"A4AA7630E4C0AD7EBB9837D2D81DE801":{n:"Atari 2600 Invaders (Hack)"},
	"D0A379946ED77B1B126230CA68461333":{n:"Atari Invaders (Ataripoll) (Hack)"},
	"D61629BBBE035F45552E31CEF7D591B2":{n:"Atari Logo Demo (PD) (PAL)"},
	"E932F44FAD2A66B6D5FAEC9ADDEC208E":{n:"Atari Logo Demo 1 (PD)"},
	"13D8326BF5648DB4DAFCE45D25E62DDD":{n:"Atari Logo Demo 2 (PD)"},
	"3E49DA621193D2611A4EA152D5D5CA3A":{n:"Atari Logo Demo 3 (PD)"},
	"42E0EC5AB8F5DEBA53E4169FF2A5EFBE":{n:"Atari Logo Demo 5 (PD)"},
	"9526E3DB3BDFBC27989A9CBFD0EE34BF":{n:"Atari Logo Demo 6 (PD)"},
	"5DF32450B9FBCAF43F9D83BD66BD5A81":{n:"Atari Logo Playfield Demo (2001) (Eric Ball) (PD)"},
	"4EDB251F5F287C22EFC64B3A2D095504":{n:"Atari VCS Point-of-Purchase ROM (1982) (Atari)"},
	"3F540A30FDEE0B20AED7288E4A5EA528":{n:"Atari Video Cube (1982) (Atari)"},
	"2CA6445204FFB7686DDEE3E33BA64D5B":{n:"AtariVox Test ROM"},
	"9AD36E699EF6F45D9EB6C4CF90475C9F":{n:"Atlantis (1982) (Imagic)"},
	"ACB962473185D7A652F90ED6591AE13B":{n:"Atlantis (1982) (Imagic) (16K)"},
	"5324CF5B6DC17AF4C64BF8696C39C2C1":{n:"Atlantis (1982) (Imagic) (8K)"},
	"3D2367B2B09C28F1659C082BB46A7334":{n:"Atlantis (1982) (Imagic) (PAL)"},
	"41818738AB1745E879024A17784D71F5":{n:"Atlantis (1983) (CCE)"},
	"0B33252B680B65001E91A411E56E72E9":{n:"Atlantis (1983) (CCE) [a]"},
	"71B193F46C88FB234329855452DFAC5B":{n:"Atlantis (1983) (Digitel)"},
	"3AAD0EF62885736A5B8C6CCAC0DBE00C":{n:"Atlantis (1983) (Dynacom)"},
	"6CEA35DED079863A846159C3A1101CC7":{n:"Atlantis (208 in 1) (Unknown) (PAL) (Hack)"},
	"A1403FEF01641DCD3980CAC9F24D63F9":{n:"Atlantis (Dactari - Milmar)"},
	"72BDA70C75DFA2365B3F8894BACE9E6A":{n:"Atlantis (TJ) (Hack)"},
	"C4BBBB0C8FE203CBD3BE2E318E55BCC0":{n:"Atlantis (Unknown) (PAL) (Hack)"},
	"AC0DDBCFF34D064009591607746E33B8":{n:"Atlantis FH (2003) (TJ) (Hack)"},
	"826481F6FC53EA47C9F272F7050EEDF7":{n:"Atlantis II (1982) (Imagic)"},
	"A7CF2B9AFDBB3A161BF418DBCF0321DC":{n:"Attack Of The Mutant Space Urchins (2002) (Barry Laws Jr.) (Hack)",c:1},
	"B5110F55ED99D5279F18266D001A8CD5":{n:"Auto-mobile Demo (2001) (Eckhard Stolberg)"},
	"B4F87CE75F7329C18301A2505FE59CD3":{n:"Autorennen (Ariola) (PAL)"},
	"7C757BB151269B2A626C907A22F5DAE7":{n:"BMX Air Master (1989) (TNT Games) (PAL)"},
	"968EFC79D500DCE52A906870A97358AB":{n:"BMX Air Master (1990) (Atari)"},
	"4F89B897444E7C3B36AED469B8836839":{n:"BMX Air Master (1990) (Atari) (PAL)"},
	"4E2C884D04B57B43F23A5A2F4E9D9750":{n:"Baby Center Animation (PD)",c:1},
	"5B124850DE9EEA66781A50B2E9837000":{n:"Bachelor Party (1982) (PlayAround)",p:1,c:1},
	"274D17CCD825EF9C728D68394B4569D2":{n:"Bachelorette Party (1982) (Playaround)",p:1,c:1},
	"8556B42AA05F94BC29FF39C39B11BFF4":{n:"Backgammon (1979) (Atari)",p:1},
	"85B1BCA93E69F13905107CC802A02470":{n:"Backgammon (1979) (Atari) (PAL)",p:1},
	"4E4895C3381AA4220F8C2795D6338237":{n:"Backwards Cannonball v1 (Hack)"},
	"2A33E21447BF9E13DCFED85077FF6B40":{n:"Backwards Cannonball v2 (Hack)"},
	"FCEA12625C071DDC49F4E409F4038C60":{n:"Balls! (16-09-2002) (Fabrizio Zavagli)",c:1},
	"805F9A32EF97AC25F999A25014DC5C23":{n:"Balthazar (SnailSoft)",c:1},
	"00CE0BDD43AED84A983BEF38FE7F5EE3":{n:"Bank Heist (1983) (20th Century Fox)"},
	"83B8C01C72306D60DD9B753332EBD276":{n:"Bank Heist (208 in 1) (Unknown) (PAL)"},
	"E9C71F8CDBA6037521C9A3C70819D171":{n:"Bank Heist (PAL)"},
	"C2A37F1C7603C5FD97DF47D6C562ABFA":{n:"Bar-Score Demo (2001) (Roger Williams)"},
	"73A710E621D44E97039D640071908AEF":{n:"Barber Pole Demo (PD)"},
	"F8240E62D8C0A64A61E19388414E3104":{n:"Barnstorming (1982) (Activision)"},
	"A29FC854838E08C247553A7D883DD65B":{n:"Barnstorming (1982) (Activision) (16K)"},
	"9AEB5206C5BF974892A9CC59F1478DB3":{n:"Barnstorming (1982) (Activision) (8K)"},
	"E7DD8C2E6C100044002C1086D02B366E":{n:"Barnstorming (1982) (Activision) (PAL)"},
	"5AE73916FA1DA8D38CEFF674FA25A78A":{n:"Barnstorming (CCE)"},
	"9AD362179C2EEA4EA115C7640B4B003E":{n:"Barnstorming (Unknown) (PAL)"},
	"DCEC46A98F45B193F07239611EB878C2":{n:"Bars and Text Demo (PD)"},
	"D7891B0FAA4C7F764482762D0ED427A5":{n:"Bars and Text Demo 2 (PD)"},
	"600D48EEF5C0EC27DB554B7328B3251C":{n:"Bars and Text Demo 3 (PD)"},
	"C469151655E333793472777052013F4F":{n:"Base Attack (Unknown) (Hack)"},
	"034C1434280B0F2C9F229777D790D1E1":{n:"Baseball (1989) (Telegames) (PAL)"},
	"9848B5EF7A0C02FE808B920A2AC566D2":{n:"Baseball (2002) (Skyworks)"},
	"A41450333F8DD0E96E5E9F0AF3770AE9":{n:"Basic Math (208 in 1) (Unknown) (PAL)"},
	"7EAB0284A0CD1043461D446A08D08CEC":{n:"Basic Math (Jone Yuan) (4K)"},
	"9F48EEB47836CF145A15771775F0767A":{n:"Basic Programming (1979) (Atari)",c:1},
	"B061E98A4C854A672AADEFA233236E51":{n:"Basic Programming (1979) (Atari) (PAL)",c:1},
	"AB4AC994865FB16EBB85738316309457":{n:"Basketball (1978) (Atari)"},
	"E13C7627B2E136B9C449D9E8925B4547":{n:"Basketball (1978) (Atari) (4K)"},
	"218C0FE53DFAAA37F3C823F66EAFD3FC":{n:"Basketball (1978) (Atari) (PAL)"},
	"F4AB6BD5F80D8988141EDDE4C84B23B5":{n:"Basketball (1978) (Atari) (PAL) (4K)"},
	"77BE57D872E3F5B7ECF8D19D97F73281":{n:"Basketball (208 in 1) (Unknown) (PAL)"},
	"5D132D121AABC5235DD039DFC46AA024":{n:"Basketball (208 in 1) (Unknown) (PAL) (Hack)"},
	"1228C01CD3C4B9C477540C5ADB306D2A":{n:"Basketball (32 in 1) (1988) (Atari) (PAL)"},
	"32D1260EA682E1BB10850FA94C04EC5F":{n:"Basketball (32 in 1) (1988) (Atari) (PAL) (4K)"},
	"5C0227AD63300670A647FCEBF595EA37":{n:"Battle for Naboo (Josh) (Hack)"},
	"E434C0E161DD3C3FB435EB6BAD2E182C":{n:"Battlezone (05-02-1983) (Atari) (Prototype)"},
	"5B85E987E2B1618769D97BA9182333D0":{n:"Battlezone (05-12-1983) (Atari) (Prototype)"},
	"41F252A66C6301F1E8AB3612C19BC5D4":{n:"Battlezone (1983) (Atari)"},
	"FBE554AA8F759226D251BA6B64A9CCE4":{n:"Battlezone (1983) (Atari) (PAL)"},
	"E38DC1F81A02E325562CD285123F579B":{n:"Battlezone (1983) (Atari) (PAL) [a1]"},
	"2319922DF4D0C820B3E5F15FAA870CC3":{n:"Battlezone (1983) (Atari) (PAL) [a]"},
	"6015A9CEF783E97E98A2AA2CF070AE06":{n:"Battlezone TC (Thomas Jentzsch) (Hack)"},
	"38C362DCD5CAD5A62E73AE52631BD9D8":{n:"Baubles (14-11-2001) (Jake Patterson) (PD)"},
	"3EB1E34A4F0EEC36F12E7336BADCECF2":{n:"Baubles (V0.001) (2001) (Jake Patterson) (PD)"},
	"599CBF919D47A05AF975AD447DF29497":{n:"Baubles (V0.002) (2001) (Jake Patterson) (PD)"},
	"FBFEBEE9C14694719E3EDA4854DC42EE":{n:"Baubles 3 (Jake Patterson) (PD)"},
	"79AB4123A83DC11D468FB2108EA09E2E":{n:"Beamrider (1984) (Activision)"},
	"FEC0C2E2AB0588ED20C750B58CF3BAA3":{n:"Beamrider (1984) (Activision) (PAL)"},
	"F4204FC92D17ED4CB567C40361AD58F1":{n:"Beanie Baby Bash (Inky) (Hack)"},
	"D0B9DF57BFEA66378C0418EC68CFE37F":{n:"Beany Bopper (1982) (20th Century Fox)"},
	"6A9E0C72FAB92DF70084ECCD9061FDBD":{n:"Beany Bopper (1983) (CCE)"},
	"235436AB0832370E73677C9C6F0C8B06":{n:"Beast Invaders (Double Shot) (Hack)"},
	"4D0A28443F7DF5F883CF669894164CFA":{n:"Beast Invaders (Hack)"},
	"B4F31EA8A6CC9F1FD4D5585A87C3B487":{n:"Beat 'Em & Eat 'Em (1982) (Mystique) (PAL)",p:1},
	"59E96DE9628E8373D1C685F5E57DCF10":{n:"Beat 'Em & Eat 'Em (1982) (PlayAround)",p:1},
	"6C25F58FD184632CA76020F589BB3767":{n:"Beat 'Em & Eat 'Em (1983) (Dynacom)",p:1},
	"EE6665683EBDB539E89BA620981CB0F6":{n:"Berenstain Bears (1983) (Coleco)"},
	"073D7AFF37B7601431E4F742C36C0DC1":{n:"Bermuda (Unknown) (PAL)"},
	"B8ED78AFDB1E6CFE44EF6E3428789D5F":{n:"Bermuda Triangle (1982) (Data Age)"},
	"36C993DC328933E4DD6374A8FFE224F4":{n:"Bermuda Triangle (1983) (Gameworld) (PAL)"},
	"BCEF7880828A391CF6B50D5A6DCEF719":{n:"Bermuda, The (Rainbow Vision) (PAL)"},
	"CF3C2725F736D4BCB84AD6F42DE62A41":{n:"Bermuda, The (Rainbow Vision) (PAL) [a]"},
	"136F75C4DD02C29283752B7E5799F978":{n:"Berzerk (1982) (Atari)"},
	"0805366F1B165A64B6D4DF20D2C39D25":{n:"Berzerk (1982) (Atari) (PAL)"},
	"FAC28963307B6E85082CCD77C88325E7":{n:"Berzerk (CCE)"},
	"4B205EF73A5779ACC5759BDE3F6D33ED":{n:"Berzerk (Unknown) (PAL)"},
	"490E3CC59D82F85FAE817CDF767EA7A0":{n:"Berzerk (Unknown) (PAL) [a]"},
	"BE41463CD918DAEF107D249F8CDE3409":{n:"Berzerk (Voice Enhanced) (Hack)"},
	"5C618A50DFA23DAAC97BA459B9FF5206":{n:"Berzerk Renegade (2002) (Steve Engelhardt) (Hack)",c:1},
	"4C4CE802CBFD160F7B3EC0F13F2A29DF":{n:"Beta Demo (V1.1) (26-09-2002) (MP)"},
	"63A7445B1D3046D3CDCDBD488DCA38D9":{n:"Better Space Invaders (1999) (Rob Kudla) (Hack)"},
	"012020625A3227815E47B37FD025E480":{n:"Better Space Invaders (1999) (Rob Kudla) (Hack) [a]"},
	"4D5F6DB55F7F44FD0253258E810BDE21":{n:"Betterblast (Fabrizio Zavagli) (Hack)"},
	"7CD900E9ECCBB240FE9C37FA28F917B5":{n:"Bi! Bi! (Jone Yuan) (PAL)"},
	"F714A223954C28ECCF459295517DCAE6":{n:"Big - Move This Demo (PD)"},
	"16CC6D1B4DDCE51C767A1BA8E5FF196C":{n:"Big - Move This Demo 2 (PD)",c:1},
	"151FA3218D8D7600114EB5BCD79C85CB":{n:"Big Bird's Egg Catch (05-02-1983) (Atari) (Prototype)"},
	"0B17ED42984000DA8B727CA46143F87A":{n:"Big Bird's Egg Catch (05-17-1983) (Atari) (Prototype)"},
	"AFD2CF258D51AE4965EE21ABBA3627AB":{n:"Big Bird's Egg Catch (12-08-1982) (Atari) (Prototype)"},
	"1802CC46B879B229272501998C5DE04F":{n:"Big Bird's Egg Catch (1983) (Atari)"},
	"F283CC294ECE520C2BADF9DA20CFC025":{n:"Big Bird's Egg Catch (1983) (Atari) (PAL)"},
	"2CB42CF62B2F25F59F909B5447821B14":{n:"Big Bird's Egg Catch (1983) (Atari) (PAL) [a]"},
	"F8FF34B53D86F55BD52D7A520AF6D1DC":{n:"Big Dig (04-04-2003) (CT)"},
	"7CCF350354EE15CD9B85564A2014B08C":{n:"Big Dig (13-04-2003) (CT)"},
	"23E4CA038ABA11982E1694559F3BE10F":{n:"Big Dig (V3) (20-10-2002) (CT)"},
	"93C9F9239A4E5C956663DD7AFFA70DA2":{n:"Billard (1983) (Quelle) (PAL)",c:1},
	"BD1BD6F6B928DF17A702DEF0302F46F4":{n:"Binary To Decimal Routine (2001) (AD)"},
	"84535AFB9A69712EC0AF4947329E08B8":{n:"Bingo (1983) (CCE) (PAL)"},
	"10F0ECAF962AEF1FC28ABED870B01B65":{n:"Bionic Breakthrough (06-22-1984) (Atari) (Prototype)"},
	"F0541D2F7CDA5EC7BAB6D62B6128B823":{n:"Bionic Breakthrough (1984) (Atari) (Prototype)"},
	"AA8E4B2CB8A78FFE6B20580033F4DEC9":{n:"Bitmap Demo (13-01-2003) (AD)"},
	"282A77841CB3D33AF5B56151ACBA770E":{n:"Black Hole (1983) (Quelle) (PAL)"},
	"CBEAFD37F15E0DDDB0540DBE15C545A4":{n:"Black and White Fast Scolling Demo (PD)"},
	"0A981C03204AC2B278BA392674682560":{n:"Blackjack (1977) (Atari)",p:1},
	"B2761EFB8A11FC59B00A3B9D78022AD6":{n:"Blackjack (1977) (Atari) (4K)",p:1},
	"FF3BD0C684F7144AEAA18758D8281A78":{n:"Blackjack (1977) (Atari) (PAL)",p:1},
	"FF7627207E8AA03730C35C735A82C26C":{n:"Blackjack (32 in 1) (1988) (Atari) (PAL)",p:1},
	"D726621C676552AFA503B7942AF5AFA2":{n:"Blackjack (32 in 1) (1988) (Atari) (PAL) (4K)",p:1},
	"575C0FB61E66A31D982C95C9DEA6865C":{n:"Blackjack (Unknown) (PAL)",p:1},
	"19A9D3F9FA1B1358FB53009444247AAF":{n:"Blackjack (Unknown) (PAL) (4K)",p:1},
	"93420CC4CB1AF1F2175C63E52EC18332":{n:"Blair Witch Project (Tim Snider) (Hack)"},
	"07C76F2D88552D20AD2C0ED7AEF406C6":{n:"Blob (Cody Pittman) (Hack)"},
	"1086FF69F82B68D6776634F336FB4857":{n:"Bloody Human Freeway (Activision) (Prototype)"},
	"FCF8E306F6615F74FEBA5CB25550038C":{n:"Blue Dot Demo (PD)"},
	"2942680C47BEB9BF713A910706FFABFE":{n:"Blue Line Demo (PD)"},
	"B7F184013991823FC02A6557341D2A7A":{n:"Blue Rod Demo (PD)"},
	"DAD2AB5F66F98674F12C92ABCFBF3A20":{n:"Blue and White Sprite Demo (PD)"},
	"33D68C3CD74E5BC4CF0DF3716C5848BC":{n:"Blueprint (1983) (CBS Electronics)",c:1},
	"2432F33FD278DEA5FE6AE94073627FCC":{n:"Blueprint (1983) (CBS Electronics) (PAL)",c:1},
	"345488D3B014B684A181108F0EF823CB":{n:"Blueprint (1983) (CBS Electronics) (Prototype)"},
	"6FBD05B0AD65B2A261FA154B34328A7F":{n:"Boardgame Demo (20-12-2002) (CT)"},
	"EBCB084A91D41865B2C1915779001CA7":{n:"Bob Is Going Home (JVP)"},
	"521F4DD1EB84A09B2B19959A41839AAD":{n:"Bobby Is Going Home (1983) (BitCorp)"},
	"2823364702595FEEA24A3FBEE138A243":{n:"Bobby Is Going Home (1983) (BitCorp) (PAL)"},
	"CCB56107FF0492232065B85493DAA635":{n:"Bobby Is Going Home (1983) (BitCorp) (PAL) [demo cart]"},
	"075069AD80CDE15ECA69E3C98BD66714":{n:"Bobby Is Going Home (1983) (CCE)"},
	"3CBDF71BB9FD261FBC433717F547D738":{n:"Bobby Is Going Home (1983) (CCE) (PAL)"},
	"F2F59629D7341C97644405DAEAC08845":{n:"Bobby Is Going Home (Jone Yuan)"},
	"2F2F9061398A74C80420B99DDECF6448":{n:"Bobby Is Going Home (Rentacom)"},
	"48E5C4AE4F2D3B62B35A87BCA18DC9F5":{n:"Bobby geht nach Hause (1983) (Quelle) (PAL)"},
	"AFE776DB50E3378CD6F29C7CDD79104A":{n:"Bobby is Going Home (TJ)"},
	"C59633DBEBD926C150FB6D30B0576405":{n:"Bogey Blaster (1989) (Telegames)"},
	"B438A6AA9D4B9B8F0B2DDB51323B21E4":{n:"Bogey Blaster (1989) (Telegames) (PAL)"},
	"A5855D73D304D83EF07DDE03E379619F":{n:"Boggle (08-07-1978) (Atari) (Prototype)",c:1},
	"14C2548712099C220964D7F044C59FD9":{n:"Boing! (1983) (First Star Software)",c:1},
	"C471B97446A85304BBAC021C57C2CB49":{n:"Boing! (1983) (First Star Software) (PAL)",c:1},
	"0E08CD2C5BCF11C6A7E5A009A7715B6A":{n:"Boing! (PD) [a1]"},
	"5D8FB14860C2F198472B233874F6B0C9":{n:"Boing! (PD) [a2]"},
	"956B99511C0F47B3A11D18E8B7AC8D47":{n:"Bones (Arcade Golf Hack)"},
	"E5359CBBBFF9C6D7FE8AEFF5FB471B46":{n:"Boom Bang (1983) (CCE)"},
	"7F54FA6AA824001AF415503C313262F2":{n:"Boom Bang (HES) (PAL)"},
	"A2AAE759E4E76F85C8AFEC3B86529317":{n:"Boom Bang (Unknown)"},
	"2825F4D068FEBA6973E61C84649489FE":{n:"Boom Bang (Unknown) (PAL)"},
	"02E3F4BA156FB578BEF7D7A0BF3400C1":{n:"Booster (Junkosoft) (PD)"},
	"5BC9998B7E9A970E31D2CB60E8696CC4":{n:"Borgwars Asteroids (2003) (Jack Kortkamp) (Hack)",c:1},
	"05F11FB2E45C4E47424D3CB25414D278":{n:"Boring (NTSC) (AD)"},
	"9B246683F44C963A50E41D6B485BEE77":{n:"Boring (PAL) (AD)"},
	"F0CACAE1D1B79EE92F0DC035F42E0560":{n:"Boring Donkey Kong (Hack)"},
	"CE17325834BF8B0A0D0D8DE08478D436":{n:"Boring Freeway (Hack)"},
	"1733772165D7B886A94E2B4ED0F74CCD":{n:"Boring Journey Escape (Hack)"},
	"613ABF596C304EF6DBD8F3351920C37A":{n:"Boring Pac-Man (Hack)"},
	"96670D0BF3610DA2AFCABD8E21D8EABF":{n:"Boring Pitfall (Hack)"},
	"E8E7B9BDF4BF04930C2BCAA0278EE637":{n:"Boring Taz (Hack)"},
	"8A49CF1785E3DEA2012D331A3AD476E1":{n:"Boulderdash (10 Blocks Wide) (02-04-2003) (AD)"},
	"E0DE3773F5B867795DB557BE7B8A703E":{n:"Boulderdash (13 Blocks Wide) (02-04-2003) (AD)"},
	"29DFA26B7988AF9984D617708E4FC6E2":{n:"Boulderdash Demo (05-04-2003) (AD)"},
	"68CD2ADC6B1FC9A1F263AB4561112F30":{n:"Boulderdash Demo (09-12-2002) (TJ)",c:1},
	"D90205E29BB73A4CDF28EA7662BA0C3C":{n:"Boulderdash Demo (Brighter Version) (09-12-2002) (TJ)",c:1},
	"B2D1E63F7F22864096B7B6C154151D55":{n:"Bounce! (17-03-2003) (Fabrizio Zavagli)",c:1},
	"7EAF009A892F03D90682DC1E67E85F07":{n:"Bounce! (18-03-2003) (Fabrizio Zavagli)",c:1},
	"C9B7AFAD3BFD922E006A6BFC1D4F3FE7":{n:"Bowling (1979) (Atari)"},
	"A28D872FC50FA6B64EB35981D0F4BB8D":{n:"Bowling (1979) (Atari) (4K)"},
	"2AA5E56D36C2E58B6F2856109F2099A9":{n:"Bowling (1979) (Atari) (4K) [a]"},
	"969B968383D9F0E9D8FFD1056BCAEF49":{n:"Bowling (1979) (Atari) (PAL)"},
	"82C25D1C35E6AC6F893D1D7C2FC2F9C8":{n:"Bowling (1979) (Atari) (PAL) (4K)"},
	"11E7E0D9437EC98FA085284CF16D0EB4":{n:"Bowling (208 in 1) (Unknown) (PAL)"},
	"F69BB58B815A6BDCA548FA4D5E0D5A75":{n:"Bowling (32 in 1) (1988) (Atari) (PAL)"},
	"4B71197153D651480830638CB6A03249":{n:"Bowling (32 in 1) (1988) (Atari) (PAL) (4K)"},
	"32ECB5A652EB73D287E883EEA751D99C":{n:"Bowling (Dactar - Milmar)"},
	"58746219D8094EDFF869F0F5C2AEAAD5":{n:"Bowling (Jone Yuan) (4K)"},
	"7F07CD2E89DDA5A3A90D3AB064BFD1F6":{n:"Boxen (Ariola) (PAL)"},
	"C3EF5C4653212088EDA54DC91D787870":{n:"Boxing (1980) (Activision)"},
	"88F74EC75EF696E7294B7B6AC5CA465F":{n:"Boxing (1980) (Activision) (16K)"},
	"277CCA62014FCEEBB46C549BAC25A2E3":{n:"Boxing (1980) (Activision) (4K)"},
	"5A80B857EB8B908AB477EC4EF902EDC8":{n:"Boxing (1980) (Activision) (8K)"},
	"25F2E760CD7F56B88AAC88D63757D41B":{n:"Boxing (1980) (Activision) (PAL)"},
	"C2BCD8F2378C3779067F3A551F662BB7":{n:"Boxing (1980) (Activision) (PAL) (4K)"},
	"A8B3EA6836B99BEA77C8F603CF1EA187":{n:"Boxing (1983) (CCE)"},
	"2C45C3EB819A797237820A1816C532EB":{n:"Boxing (32 in 1) (1988) (Atari) (PAL)"},
	"B77468D586957D1B7FB4CCCDA2684F47":{n:"Boxing (32 in 1) (1988) (Atari) (PAL) (4K)"},
	"CFB3260C603B0341D49DDFC94051EC10":{n:"Boxing (Dactari - Milmar)"},
	"34FD4FCB40FF5BABCE67F8B806D5969C":{n:"Boxing (Dactari) (4K)"},
	"AFC194534C1B346609EF05EFF6D3CEF6":{n:"Boxing (Jone Yuan)"},
	"FD6E507B5DF68BEEEDDEAF696B6828FA":{n:"Boxing (Unknown) (PAL)"},
	"1CCA2197D95C5A41F2ADD49A13738055":{n:"Brain Games (1978) (Atari)"},
	"CB9626517B440F099C0B6B27CA65142C":{n:"Brain Games (1978) (Atari) (4K)"},
	"F280976D69D6E27A48506BD6BAD11DCD":{n:"Brain Games (1978) (Atari) (PAL)"},
	"2162266B906C939B35C84FF9A0F50AD1":{n:"Brain Games (1978) (Atari) (PAL) (4K)"},
	"4DBF47C7F5AC767A3B07843A530D29A5":{n:"Breaking News (2002) (Ric Pryor) (Hack)"},
	"F34F08E5EB96E500E851A80BE3277A56":{n:"Breakout (1978) (Atari)",p:1},
	"C738FC3F5AAE1E8F86F7249F6C82AC81":{n:"Breakout (1978) (Atari) (16K)",p:1},
	"9A25B3CFE2BBB847B66A97282200CCA2":{n:"Breakout (1978) (Atari) (4K)",p:1},
	"6C76FE09AA8B39EE52035E0DA6D0808B":{n:"Breakout (1978) (Atari) (PAL)",p:1},
	"C5FE45F2734AFD47E27CA3B04A90213C":{n:"Breakout (1978) (Atari) (PAL) (4K)",p:1},
	"4DF6124093CCB4F0B6C26A719F4B7706":{n:"Breakout (1978) (Atari) [a]",p:1},
	"CFD6A8B23D12B0462BAF6A05EF347CD8":{n:"Bridge (1980) (Activision)"},
	"413C925C5FDCEA62842A63A4C671A5F2":{n:"Bridge (1980) (Activision) [fixed]"},
	"18A970BEA7AC4D29707C8D5CD559D03A":{n:"Bridge (208 in 1) (Unknown) (PAL)"},
	"428B2D36F5D716765460701F7016AC91":{n:"Brooni (2001) (Andrew Wallace) (PD)"},
	"A537879D8E82E1061D3AD800479D3B84":{n:"Brooni (2001) (Andrew Wallace) (PD) (PAL)"},
	"1CF59FC7B11CDBCEFE931E41641772F6":{n:"Buck Rogers - Planet of Zoom (1983) (Sega)",c:1},
	"CD88EF1736497288C4533BCCA339F881":{n:"Buck Rogers - Planet of Zoom (1983) (Sega) (PAL)",c:1},
	"68597264C8E57ADA93BE3A5BE4565096":{n:"Bugs (1982) (Data Age)",p:1},
	"E61210293B14C9C4ECC91705072C6A7E":{n:"Bugs (1983) (Gameworld) (PAL)",p:1},
	"A3486C0B8110D9D4B1DB5D8A280723C6":{n:"Bugs Bunny (08-04-1983) (Atari) (Prototype)"},
	"FA4404FABC094E3A31FCD7B559CDD029":{n:"Bugs Bunny (1983) (Atari) (Prototype)"},
	"9E792A59F8795664CBAAFF1BA152D731":{n:"Bullet Demo (20-12-2002) (CT)"},
	"76F53ABBBF39A0063F24036D6EE0968A":{n:"Bump 'n' Jump (1983) (M Network)"},
	"9295570A141CDEC18074C55DC7229D08":{n:"Bump 'n' Jump (1989) (Telegames) (PAL)"},
	"AA1C41F86EC44C0A44EB64C332CE08AF":{n:"Bumper Bash (1983) (Spectravideo)"},
	"1BF503C724001B09BE79C515ECFCBD03":{n:"Bumper Bash (1983) (Spectravideo) (PAL)"},
	"0443CFA9872CDB49069186413275FA21":{n:"BurgerTime (1983) (M Network)"},
	"B42DF8D92E3118DC594CECD575F515D7":{n:"Burning Desire (1982) (Mystique) (PAL)",c:1},
	"19D6956FF17A959C48FCD8F4706A848D":{n:"Burning Desire (1982) (PlayAround)",c:1},
	"572D0A4633D6A9407D3BA83083536E0F":{n:"Busy Police (Funvision)"},
	"8905D54F48B8024FC718ED643E9033F7":{n:"Cabbage Patch Kids (05-24-1984) (Coleco) (Prototype)"},
	"E1486C7822C07117B4F94A32E5ED68C1":{n:"Cabbage Patch Kids (06-14-1984) (Coleco) (Prototype)"},
	"80E5400470AC788143E6DB9BC8DD88CF":{n:"Cabbage Patch Kids (06-XX-1984) (Coleco) (Prototype)"},
	"4605A00F5B44A9CBD5803A7A55DE150E":{n:"Cabbage Patch Kids (07-03-1984) (Coleco) (Prototype)"},
	"7D726FA494F706784BAFEB1B50D87F23":{n:"Cabbage Patch Kids (07-27-1984) (Coleco) (Prototype)"},
	"F4DABD5BCC603E8464A478208037D423":{n:"Cabbage Patch Kids (08-21-1984) (Coleco) (Prototype)"},
	"1FA7A42C2C7D6B7A0C6A05D38C7508F4":{n:"Cabbage Patch Kids (09-04-1984) (Coleco) (Prototype)"},
	"5D0E8A25CBD23E76F843C75A86B7E15B":{n:"Cabbage Patch Kids (09-07-1984) (Coleco) (Prototype)"},
	"66FCF7643D554F5E15D4D06BAB59FE70":{n:"Cabbage Patch Kids (09-13-1984) (Coleco) (Prototype)"},
	"F6B5EBB65CBB2981AF4D546C470629D7":{n:"Cabbage Patch Kids (09-13-1984) (Coleco) (Prototype) [a]"},
	"7F6533386644C7D6358F871666C86E79":{n:"Cakewalk (1983) (CommaVid)"},
	"0060A89B4C956B9C703A59B181CB3018":{n:"Cakewalk (1983) (CommaVid) (PAL)"},
	"0EEBFB60D437796D536039701EC43845":{n:"Cakewalk (Fabrizio Zavagli)"},
	"9AB72D3FD2CC1A0C9ADB504502579037":{n:"California Games (1988) (Epyx)"},
	"8068E07B484DFD661158B3771D6621CA":{n:"California Games (1988) (Epyx) (PAL)"},
	"85478BB289DFA5C63726B9153992A920":{n:"Candi (Hack)"},
	"0E0808227EF41F6825C06F25082C2E56":{n:"Candi (Hack) [a]"},
	"FEEDCC20BC3CA34851CD5D9E38AA2CA6":{n:"Canyon Bomber (1979) (Atari)",p:1},
	"3051B6071CB26377CD428AF155E1BFC4":{n:"Canyon Bomber (1979) (Atari) (4K)",p:1},
	"457F4AD2CDA5F4803F122508BFBDE3F5":{n:"Canyon Bomber (208 in 1) (Unknown) (PAL)"},
	"151C33A71B99E6BCFFB34B43C6F0EC23":{n:"Care Bears (1983) (Parker Bros) (Prototype)"},
	"DE29E46DBEA003C3C09C892D668B9413":{n:"Carnival (1982) (CBS Electronics) (PAL)"},
	"028024FB8E5E5F18EA586652F9799C96":{n:"Carnival (1982) (Coleco)"},
	"8ED5A746C59571FEB255EAA7D6D0CF98":{n:"Carnival (208 in 1) (Unknown) (PAL) (Hack)"},
	"5409D20C1AEA0B89C56993AEC5DC5740":{n:"Carnival Shooter (PD)"},
	"B816296311019AB69A21CB9E9E235D12":{n:"Casino (1979) (Atari)",p:1},
	"2BC26619E31710A9884C110D8430C1DA":{n:"Casino (1979) (Atari) (PAL)",p:1},
	"681206A6BDE73E71C19743607E96C4BB":{n:"Casino (Unknown) (PAL)",p:1},
	"76F66CE3B83D7A104A899B4B3354A2F2":{n:"Cat Trax (1983) (UA Limited) (Prototype)",c:1},
	"D071D2EC86B9D52B585CC0382480B351":{n:"Cat Trax (1983) (UA Limited) (Prototype) [a]",c:1},
	"B7903268E235310DC346A164AF4C7022":{n:"Cat Trax (Thomas Jentzsch) (PAL60)",c:1},
	"A2DE0FC85548871279ED2A3C1325C13E":{n:"Cat and Mouse (George Veeder) (Hack)"},
	"E2904748DA63DFEFC8816652B924B642":{n:"Catch Time (Jone Yuan)"},
	"9E192601829F5F5C2D3B51F8AE25DBE5":{n:"Cathouse Blues (1982) (PlayAround)",c:1},
	"8726C17EE7B559CB7BF2330D20972AD0":{n:"Cave Demo (21-04-2003) (CT)"},
	"91C2098E88A6B13F977AF8C003E0BCA5":{n:"Centipede (1982) (Atari)"},
	"17D000A2882F9FDAA8B4A391AD367F00":{n:"Centipede (1982) (Atari) (PAL)"},
	"2F11BA54609777E2C6A5DA9B302C98E8":{n:"Centipede (1982) (Atari) (Prototype) (PAL)"},
	"10958CD0A1A81D599005F1797AB0E51D":{n:"Centipede 2k (2000) (PD) (Hack)"},
	"713FDE2AF865B6EC464DFD72E2EBB83E":{n:"Challenge (208 in 1) (Unknown) (PAL)",c:1},
	"9905F9F4706223DADEE84F6867EDE8E3":{n:"Challenge (HES) (PAL)"},
	"4311A4115FB7BC68477C96CF44CEBACF":{n:"Challenge (Unknown)"},
	"73158EA51D77BF521E1369311D26C27B":{n:"Challenge (Zellers)"},
	"5D799BFA9E1E7B6224877162ACCADA0D":{n:"Challenge of.... Nexar, The (1982) (Spectravision)"},
	"1DA2DA7974D2CA73A823523F82F517B3":{n:"Challenge of.... Nexar, The (1982) (Spectravision) (PAL)"},
	"45C4413DD703B9CFEA49A13709D560EB":{n:"Challenge of.... Nexar, The (Jone Yuan) (Hack)"},
	"3D9C2FCCF8B11630762FF00811C19277":{n:"Challenge of.... Nexar, The (Unknown) (PAL)"},
	"3E33AC10DCF2DFF014BC1DECF8A9AEA4":{n:"Chase the Chuckwagon (1983) (Spectravideo)",c:1},
	"3F5A43602F960EDE330CD2F43A25139E":{n:"Checkers (1980) (Activision)"},
	"7EDC8FCB319B3FB61CAC87614AFD4FFA":{n:"Checkers (1980) (Activision) (4K)"},
	"191AC4EEC767358EE3EC3756C120423A":{n:"Checkers (208 in 1) (Unknown) (PAL)"},
	"BCE93984B920E9B56CF24064F740FE78":{n:"Checkers (32 in 1) (1988) (Atari) (PAL)"},
	"499B612F6544AE71D4915AA63E403E10":{n:"Checkers (32 in 1) (1988) (Atari) (PAL) (4K)"},
	"3D7749FB9C2F91A276DFE494495234C5":{n:"Checkers (Jone Yuan)"},
	"04E737C9D53CD84BFD5EE679954E4706":{n:"Checkers (Jone Yuan) (4K)"},
	"E5ECD78EDD24326A968809DECBC7B916":{n:"Cheese (Dragonfire Beta) (05-21-1982) (Imagic) (Prototype)"},
	"749FEC9918160921576F850B2375B516":{n:"China Syndrome (1982) (Spectravision)",c:1},
	"E150F0D14F013A104B032305C0CE23EF":{n:"China Syndrome (1982) (Spectravision) (PAL)",c:1},
	"36F9A953EBDD9A8BE97CCF27A2041903":{n:"Chinese Character Demo (PD)"},
	"C1CB228470A87BEB5F36E90AC745DA26":{n:"Chopper Command (1982) (Activision)"},
	"25D4BE3309B89583C6B39D9F93BF654F":{n:"Chopper Command (1982) (Activision) (16K)"},
	"51F211C8FC879391FEE26EDFA7D3F11C":{n:"Chopper Command (1982) (Activision) (8K)"},
	"114C599454D32F74C728A6E1F71012BA":{n:"Chopper Command (1982) (Activision) (PAL)"},
	"85A4133F6DCF4180E36E70AD0FCA0921":{n:"Chopper Command (1983) (CCE)"},
	"FFDC0EB3543404EB4C353FBDDDFA33B6":{n:"Chopper Command (1983) (CCE) [a]"},
	"DA66D75E4B47FAB99733529743F86F4F":{n:"Chopper Command (1983) (Digitel)"},
	"C2C7A11717E255593E54D0ACAF653EE5":{n:"Chopper Command (208 in 1) (Unknown) (PAL) (Hack)"},
	"1CAD3B56CC0E6E858554E46D08952861":{n:"Chopper Command (Jone Yuan)"},
	"F8811D45A9935CCA90C62F924712F8E6":{n:"Chopper Command (Jone Yuan) (Hack)"},
	"B9F9C0FED0DB08C34346317F3957A945":{n:"Chopper Command (SuperVision) (PAL)"},
	"ACB6787B938079F4E74313A905EC3CEB":{n:"Chronocolor Donkey Kong (PD)"},
	"EE456542B93FA8D7E6A8C689B5A0413C":{n:"Chronocolor Donkey Kong Clean (PD)"},
	"1D5EAC85E67B8CFF1377C8DBA1136929":{n:"Chronocolor Donkey Kong Sideways (PD)"},
	"D605ED12F4EAAAEC3DCD5AA909A4BAD7":{n:"Chronocolor Frame Demo (10-01-2003) (AD)"},
	"DB339AEA2B65B84C7CFE0EEAB11E110A":{n:"Chronocolor Frame Demo 2 (10-01-2003) (AD)"},
	"A30ECE6DC4787E474FBC4090512838DC":{n:"Circus (Zellers)"},
	"A7B96A8150600B3E800A4689C3EC60A2":{n:"Circus Atari (1980) (Atari)",p:1},
	"A29DF35557F31DFEA2E2AE4609C6EBB7":{n:"Circus Atari (1980) (Atari) (Joystick)"},
	"30E0AB8BE713208AE9A978B34E9E8E8C":{n:"Circus Atari (1980) (Atari) (PAL)",p:1},
	"EFFFAFC17B7CB01B9CA35324AA767364":{n:"Circus Atari (Unknown)"},
	"324CB4A749BCAC4F3DB9DA842B85D2F7":{n:"Climber 5 (01-05-2003) (Dennis Debro)"},
	"9D4BC7C6FE9A7C8C4AA24A237C340ADB":{n:"Climber 5 (16-04-2003) (Dennis Debro)"},
	"87B460DF21B7BBCFC57B1C082C6794B0":{n:"Climber 5 (20-03-2003) (Dennis Debro)"},
	"D82C8A58098A6B46C5B81C16180354D1":{n:"Climber 5 (30-10-2002) (Dennis Debro) (Prototype)"},
	"1E587CA91518A47753A28217CD4FD586":{n:"Coco Nuts (1982) (Telesys)"},
	"5846B1D34C296BF7AFC2FA05BBC16E98":{n:"Codebreaker (1978) (Atari)"},
	"83F50FA0FBAE545E4B88BB53B788C341":{n:"Codebreaker (1978) (Atari) (4K)"},
	"A47E26096DE6F6487BF5DD2D1CCED294":{n:"Codebreaker (1978) (Atari) (PAL)"},
	"71D005B60CF6E608D04EFB99A37362C3":{n:"Codebreaker (1978) (Atari) (PAL) (4K) [a]"},
	"551A64A945D7D6ECE81E9C1047ACEDBC":{n:"Coffee Cup Soccer (Matthias Jaap) (Hack)"},
	"76A9BF05A6DE8418A3EBC7FC254B71B4":{n:"Color Bar Generator (1984) (VideoSoft)"},
	"E5A6E0BB7D56E2F08B237E15076E5699":{n:"Color Table Display Helper (PD)"},
	"C221607529CABC93450EF25DBAC6E8D2":{n:"Color Test (26-09-2002) (Eckhard Stolberg)"},
	"58C396323EA3E85671E34C98EB54E2A4":{n:"Color Tweaker (B. Watson)"},
	"F6DAEBC0424FA0F8D9AAF26C86DF50F4":{n:"Color Tweaker (V1.0) (2001) (B. Watson)"},
	"35AE903DFF7389755AD4A07F2FB7400C":{n:"Colored Wall Demo (PD)"},
	"97A9BB5C3679D67F5C2CD17F30B85D95":{n:"Colors (1980) (Atari) (Prototype) (PAL)"},
	"3F9431CC8C5E2F220B2AC14BBC8231F4":{n:"Colors Demo (PD)"},
	"CC74DDB45D7BC4D04C2E6F1907416699":{n:"Colour Display Programme (1997) (Chris Cracknell)"},
	"9989F974C3CF9C641DB6C8A70A2A2267":{n:"Colours Selector (Eckhard Stolberg)"},
	"3C72DDAF41158FDD66E4F1CB90D4FD29":{n:"Comando Suicida (Dismac)"},
	"4C8832ED387BBAFC055320C05205BC08":{n:"Combat (1977) (Atari)"},
	"AC05C0E53A5E7009DDD75ED4B99949FC":{n:"Combat (1977) (Atari) (4K)"},
	"BE35D8B37BBC03848A5F020662A99909":{n:"Combat (1977) (Atari) (4K) [a]"},
	"E8AA36E3D49E9BFA654C25DCC19C74E6":{n:"Combat (1977) (Atari) (PAL)"},
	"0EF64CDBECCCB7049752A3DE0B7ADE14":{n:"Combat (32 in 1) (1988) (Atari) (PAL)"},
	"E2ECCBBE963F80F291CB1F18803BF557":{n:"Combat (32 in 1) (1988) (Atari) (PAL) (4K)"},
	"E94632B0D863DD76459D689A9865BB33":{n:"Combat (Jone Yuan) (4K)"},
	"331938989F0F33CA39C10AF4C09FF640":{n:"Combat - Tank AI (19-04-2003) (Zach Matley)"},
	"176D3FBA7D687F2B23158098E103C34A":{n:"Combat AI (16-02-2003) (Zach Matley)"},
	"5385CF2A04DE1D36AB55C73174B84DB0":{n:"Combat Rock (PD) (Hack)"},
	"E63EFDFDA9A4003DCD77A854A781A06A":{n:"Combat Rock (PD) (Hack) [a]"},
	"461029AB23800833E9645BE3E472D470":{n:"Combat TC (v0.1)"},
	"B0C9CF89A6D4E612524F4FD48B5BB562":{n:"Combat Two (1982) (Atari) (Prototype)"},
	"E25E173740F7ECC0E23025445C4591F3":{n:"Comitoid (Greg Zumwalt)"},
	"99F7C6C26046BBE95F1C604B25DA8360":{n:"Comitoid beta 2 (SnailSoft)"},
	"755FED16B48E81DE05130708A905D00D":{n:"Comitoid beta 3 (SnailSoft)"},
	"E4E9125A8741977583776729359614E1":{n:"Comitoid beta 4 (SnailSoft)"},
	"5D2CC33CA798783DEE435EB29DEBF6D6":{n:"Commando (1988) (Activision)"},
	"DE1E9FB700BAF8D2E5AE242BFFE2DBDA":{n:"Commando (1988) (Activision) (PAL)"},
	"61631C2F96221527E7DA9802B4704F93":{n:"Commando (1988) (Activision) [different logo]"},
	"F457674CEF449CFD85F21DB2B4F631A7":{n:"Commando Raid (1982) (U.S. Games)"},
	"5864CAB0BC21A60BE3853B6BCD50C59F":{n:"Commando Raid (208 in 1) (Unknown) (PAL)"},
	"5F316973FFD107F7AB9117E93F50E4BD":{n:"Commando Raid (Unknown) (PAL)"},
	"2C8835AED7F52A0DA9ADE5226EE5AA75":{n:"Communist Mutants from Space (1982) (Arcadia)"},
	"E2C89F270F72CD256ED667507FA038A2":{n:"Communist Mutants from Space (1982) (Arcadia) (PAL)"},
	"C4B73C35BC2F54B66CD786F55B668A82":{n:"Communist Mutants from Space (1982) (Arcadia) [a]"},
	"D541B20EAE221A8EE321375E5971E766":{n:"Communist Mutants from Space (Preview) (1982) (Arcadia)"},
	"7BA07D4EA18BF3B3245C374D8720AD30":{n:"Communist Mutants from Space (Preview) (1982) (Arcadia) (PAL)"},
	"B98CC2C6F7A0F05176F74F0F62C45488":{n:"CompuMate (1983) (Spectravideo)",c:1},
	"E7F005DDB6902C648DE098511F6AE2E5":{n:"CompuMate (1983) (Spectravideo) (PAL)",c:1},
	"6A2C68F7A77736BA02C0F21A6BA0985B":{n:"Computer Chess (07-07-1978) (Atari) (Prototype)"},
	"B49331B237C8F11D5F36FE2054A7B92B":{n:"Condor Attack (Unknown) (PAL)"},
	"F965CC981CBB0822F955641F8D84E774":{n:"Confrontation (1983) (Answer) (Prototype)",c:1},
	"00B7B4CBEC81570642283E7FC1EF17AF":{n:"Congo Bongo (1983) (Sega)"},
	"335A7C5CFA6FEE0F35F5824D1FA09AED":{n:"Congo Bongo (1983) (Sega) (PAL)"},
	"D078D25873C5B99F78FA267245A2AF02":{n:"Congo Bongo (1983) (Sega) [a]"},
	"C2FBEF02B6EEA37D8DF3E91107F89950":{n:"Conquest Of Mars (NTSC)"},
	"85BBEFB90E16BF386B304C1E9A1F6084":{n:"Conquest Of Mars (PAL60)"},
	"A81B29177F258494B499FBAC69789CEF":{n:"Console Wars (Greg Thompson) (Hack)"},
	"57C5B351D4DE021785CF8ED8191A195C":{n:"Cookie Monster Munch (1983) (Atari)"},
	"A0297C4788F9E91D43E522F4C561B4AD":{n:"Cookie Monster Munch (1983) (Atari) (PAL)"},
	"798B8921276EEC9E332DFCB47A2DBB17":{n:"Cookie Monster Munch (1983) (Atari) (PAL) [a]"},
	"01E5C81258860DD82F77339D58BC5F5C":{n:"Corrida da Matematica (CCE)"},
	"6A3B0C33CF74B1E213A629E3C142B73C":{n:"Cory The Interviewer (Cody Pittman) (Hack)"},
	"EEB92F3F46DF841487D1504F2896D61A":{n:"Corys Adventure (Cody Pittman) (Hack)"},
	"AB5BF1EF5E463AD1CBB11B6A33797228":{n:"Cosmic Ark (1982) (Imagic)"},
	"C5124E7D7A8C768E5A18BDE8B54AEB1D":{n:"Cosmic Ark (1982) (Imagic) (PAL)"},
	"0FD72A13B3B6103FC825A692C71963B4":{n:"Cosmic Ark (1982) (Imagic) (PAL) [selectable starfield]"},
	"98EF1593624B409B9FB83A1C272A0AA7":{n:"Cosmic Ark (1983) (CCE)"},
	"69DF0411D4D176E558017F961F5C5849":{n:"Cosmic Ark (1983) (CCE) [a]"},
	"7D903411807704E725CF3FAFBEB97255":{n:"Cosmic Ark (Reaction) (1982) (Imagic) [selectable starfield]"},
	"72D0ACB5DE0DB662DE0360A6FC59334D":{n:"Cosmic Ark (Unknown) (PAL)"},
	"05D61B925D3D2474BAB83F0A79BB5DF1":{n:"Cosmic Ark Stars (1997) (Eckhard Stolberg)"},
	"00CE76AD69CDC2FA36ADA01AE092D5A6":{n:"Cosmic Avenger (4 Game in One) (1983) (BitCorp) (PAL)"},
	"133B56DE011D562CBAB665968BDE352B":{n:"Cosmic Commuter (1984) (Activision)"},
	"BA657D940A11E807FF314BBA2C8B389B":{n:"Cosmic Commuter (1984) (Activision) (16K)"},
	"59734E1CC41822373845A09C51E6BA21":{n:"Cosmic Commuter (1984) (Activision) (8K)"},
	"5F1B7D5FA73AA071BA0A3C2819511505":{n:"Cosmic Commuter (CCE)"},
	"8E879AA58DB41EDB67CBF318B77766C4":{n:"Cosmic Commuter (Thomas Jentzsch) (PAL60)"},
	"F367E58667A30E7482175809E3CEC4D4":{n:"Cosmic Corridor (1983) (ZiMAG)"},
	"3C853D864A1D5534ED0D4B325347F131":{n:"Cosmic Creeps (1982) (Telesys)",c:1},
	"E2CA84A2BB63D1A210EBB659929747A9":{n:"Cosmic Creeps (1982) (Telesys) (PAL)",c:1},
	"5835A78A88F97ACEA38C964980B7DBC6":{n:"Cosmic Creeps (Unknown) (PAL)",c:1},
	"E5F17B3E62A21D0DF1CA9AEE1AA8C7C5":{n:"Cosmic Swarm (1982) (CommaVid)",c:1},
	"9DEC0BE14D899E1AAC4337ACEF5AB94A":{n:"Cosmic Swarm (1982) (CommaVid) (4K)",c:1},
	"2A2F46B3F4000495239CBDAD70F17C59":{n:"Cosmic Swarm (1982) (CommaVid) (PAL)",c:1},
	"3E22C7EAF6459B67388602E4BEBBB3A8":{n:"Cosmic Swarm (1982) (CommaVid) (PAL) (4K)"},
	"8AF58A9B90B25907DA0251EC0FACF3B8":{n:"Cosmic Swarm (Jone Yuan)"},
	"1B0F3D7AF668EEEA38DDD6182D8F48FB":{n:"Cosmic Swarm (Jone Yuan) (4K)",c:1},
	"36547BC6FAA5132B87504E18D088E1D7":{n:"Cosmic Swarm (Unknown) (PAL) (4K)",c:1},
	"6C91AC51421CB9FC72C9833C4F440D65":{n:"Cosmic Town (1983) (ITT Family Games) (PAL)"},
	"4981CEFE5493EA512284E7F9F27D1E54":{n:"Cosmic War (1983) (Home Vision) (PAL)"},
	"BE561B286B6432CAC71BCCBAE68002F7":{n:"Counter Demo (PD)"},
	"FE67087F9C22655CE519616FC6C6EF4D":{n:"Crack'ed (11-28-1988) (Atari) (Prototype)"},
	"A184846D8904396830951217B47D13D9":{n:"Crackpots (1983) (Activision)"},
	"88ED87C011F699DD27321DBE404DB6C8":{n:"Crackpots (1983) (Activision) (16K)"},
	"5A17E30E6E911E74CCD7B716D02B16C6":{n:"Crackpots (1983) (Activision) (8K)"},
	"3F3AD2765C874CA13C015CA6A44A40A1":{n:"Crackpots (1983) (CCE)"},
	"3091AF0EF1A61E801F4867783C21D45C":{n:"Crackpots (1983) (CCE) [a]"},
	"13448EB5BA575E8D7B8D5B280EA6788F":{n:"Crackpots (Digivision)"},
	"606C2C1753051E03C1F1AC096C9D2832":{n:"Crackpots (Jone Yuan)"},
	"F3C431930E035A457FE370ED4D230659":{n:"Crackpots (Unknown) (PAL)"},
	"FB88C400D602FE759AE74EF1716EE84E":{n:"Crash Dive (1983) (20th Century Fox)"},
	"0CEBB0BB45A856B23F56D21CE7D1BC34":{n:"Crash Dive (1983) (20th Century Fox) (PAL)"},
	"9072C142728A3A3D994956D03BFACBA2":{n:"Crash Dive (Fabrizio Zavagli) (PAL60)"},
	"55EF7B65066428367844342ED59F956C":{n:"Crazy Climber (1982) (Atari)"},
	"4A7EEE19C2DFB6AEB4D9D0A01D37E127":{n:"Crazy Valet (Hozer Video Games)"},
	"C17BDC7D14A36E10837D039F43EE5FA3":{n:"Cross Force (1982) (Spectravision)"},
	"8F88309AFAD108936CA70F8B2B084718":{n:"Cross Force (1982) (Spectravision) (PAL)"},
	"8372EEC01A08C60DBED063C5524CDFB1":{n:"Cross Force (Unknown) (PAL)"},
	"8CD26DCF249456FE4AEB8DB42D49DF74":{n:"Crossbow (1987) (Atari)"},
	"7E4783A59972AE2CD8384F231757EA0B":{n:"Crossbow (1987) (Atari) (PAL)"},
	"384F5FBF57B5E92ED708935EBF8A8610":{n:"Crypts of Chaos (1982) (20th Century Fox)"},
	"F12AFBFFA080DD3B2801DD14D4837CF6":{n:"Crystal Castles (01-04-1984) (Atari) (Prototype)",c:1},
	"1C6EB740D3C485766CADE566ABAB8208":{n:"Crystal Castles (1984) (Atari)"},
	"CA7ABC774A2FA95014688BC0849EEE47":{n:"Crystal Castles (1984) (Atari) (PAL)"},
	"C68A6BAFB667BAD2F6D020F879BE1D11":{n:"Crystal Castles (1984) (Atari) (Prototype)"},
	"A6127F470306EED359D85EB4A9CF3C96":{n:"Crystal Castles (1984) (Atari) [a]"},
	"0ABF64CA504A116ADCA80F77F85E00FB":{n:"Cube Conquest (Billy Eno) (PD)"},
	"58E313E2B5613B2439B5F12BB41E3EEF":{n:"Cube Conquest (Demo Interlace) (Billy Eno) (PD)",c:1},
	"F1929BB9B5DB22D98DD992AA3FE72920":{n:"Cube Conquest (Improved Interlace) (Billy Eno) (PD)",c:1},
	"36A701C60A9F9768D057BC2A83526A80":{n:"Cube Conquest (Interlaced) (Billy Eno) (PD)",c:1},
	"292F2446A0325B7B423E88A2EBFEB5A0":{n:"Cube Conquest (Non Interlaced) (Billy Eno) (PD)",c:1},
	"6FA0AC6943E33637D8E77DF14962FBFC":{n:"Cubicolor (1982) (Imagic) (Prototype)"},
	"F74AD642552385C3DAA203A2A6FC2291":{n:"Cubis (1997) (Eckhard Stolberg)"},
	"D2C957DD7746521B51BB09FDE25C5774":{n:"Cubis (6K) (1997) (Eckhard Stolberg)"},
	"281FF9BD0470643853DE5CBD6D9E17F5":{n:"Cubis (EM) (1997) (Eckhard Stolberg)"},
	"64CA518905311D2D9AEB56273F6CAA04":{n:"Cubo Magico (CCE)"},
	"58513BAE774360B96866A07CA0E8FD8E":{n:"Custer's Revenge (1982) (Mystique)"},
	"50200F697AEEF38A3CE31C4F49739551":{n:"Custer's Revenge (1982) (Mystique) (PAL60)"},
	"D57EB282D7540051BC9B5427CF966F03":{n:"Custer's Viagra (Atari Troll) (Hack)"},
	"93EB1795C8B1065B1B3D62BB9EC0CCDC":{n:"Custer's Viagra (JSK) (Hack)"},
	"211F76DFF0B7DAD3F6FCAC9D938EE61A":{n:"Custer's Viagra (JSK) (Hack) [a]"},
	"5355F80CACF0E63A49CBF4ADE4E27034":{n:"Cute Dead Things House (Christian Samuel) (Hack)"},
	"60358EDF0C2CC76B1E549E031E50E130":{n:"Cyber Goth Galaxian (Manuel Polik) (Hack)"},
	"52615AE358A68DE6E76467E95EB404C7":{n:"DJdsl-wopd (PD)",c:1},
	"2B42DA79A682ED6E2D735FACBF70107E":{n:"DKjr Improved (Hack)"},
	"B719ADA17771A8D206C7976553825139":{n:"DUP Space Invaders (Ron Corcoran) (Hack)"},
	"929E8A84ED50601D9AF8C49B0425C7EA":{n:"Dancing Plate (1982) (BitCorp) (PAL)",c:1},
	"ECE463ABDE92E8B89BCD867EC71751B8":{n:"Dancing Plate (1982) (Puzzy) (PAL)",c:1},
	"F48735115EC302BA8BB2D2F3A442E814":{n:"Dancing Plate (Unknown) (PAL)",c:1},
	"2D1CF85FBC732856BF76470CD4060F4A":{n:"Daredevil (V1) (Stunt_Cycle_Rules!) (PD)"},
	"CD8FA2E9F6255EF3D3B9B5A4F24A54F7":{n:"Daredevil (V2) (Stunt_Cycle_Rules!) (PD)"},
	"585F73010E205AE5B04EE5C1A67E632D":{n:"Daredevil (V3) (Stunt_Cycle_Rules!) (PD)"},
	"A422194290C64EF9D444DA9D6A207807":{n:"Dark Cavern (1982) (M Network)"},
	"106855474C69D08C8FFA308D47337269":{n:"Dark Chambers (1988) (Atari)",c:1},
	"0D5AF65AD3F19558E6F8E29BF2A9D0F8":{n:"Dark Chambers (1988) (Atari) (PAL)",c:1},
	"951E8CEC7A1A1D6C01FD649E7FF7743A":{n:"Dark Chambers (1988) (Atari) (Prototype) (PAL)"},
	"DBA270850AE997969A18EE0001675821":{n:"Dark Mage (Greg Troutman) (PD) (4K)",c:1},
	"6333EF5B5CBB77ACD47F558C8B7A95D3":{n:"Dark Mage (Greg Troutman) (PD) (8K)",c:1},
	"6CD506509E8FD5627F55603780E862A8":{n:"Dark Mage (SuperCharger) (Greg Troutman) (PD)",c:1},
	"2B71A59A53BE5883399917BF582B7772":{n:"Dark Mage (final beta) (Greg Troutman) (PD)",c:1},
	"1345E972DBE08EA3E70850902E20E1A5":{n:"Dark Mage (rough beta) (Greg Troutman) (PD)",c:1},
	"C1F209D80F0624DADA5866CE05DD3399":{n:"Deadly Discs (1989) (Telegames) (PAL)"},
	"E4C00BEB17FDC5881757855F2838C816":{n:"Deadly Duck (1982) (20th Century Fox)"},
	"80CD42881E670E4B74A9CCD10D0D7B2E":{n:"Deadly Duck (1982) (20th Century Fox) [a]"},
	"4E15DDFD48BCA4F0BF999240C47B49F5":{n:"Death Trap (1983) (Avalon Hill)",c:1},
	"AC7C2260378975614192CA2BC3D20E0B":{n:"Decathlon (1983) (Activision)"},
	"883258DCD68CEFC6CD4D40B1185116DC":{n:"Decathlon (1983) (Activision) (PAL)"},
	"525F2DFC8B21B0186CFF2568E0509BFC":{n:"Decathlon (1983) (Activision) [fixed]"},
	"BF52327C2197D9D2C4544BE053CADED1":{n:"Decathlon (HES) (PAL) (16K)"},
	"E1029676EDB3D35B76CA943DA7434DA8":{n:"Defender (10-30-1981) (Atari) (Prototype)"},
	"0F643C34E40E3F1DAAFD9C524D3FFE64":{n:"Defender (1982) (Atari)"},
	"E4BFF1D5DF70163C0428A1EAD309C22D":{n:"Defender (1982) (Atari) (PAL)"},
	"808C3B1E60EE0E7C65205FA4BD772221":{n:"Defender (CCE)"},
	"6596B3737AE4B976E4AADB68D836C5C7":{n:"Defender (Digivision)"},
	"35B10A248A7E67493EC43AEB9743538C":{n:"Defender (Dor-x) (Hack)"},
	"3C4223316C835CEAAD619651E25DF0F9":{n:"Defender (Genesis)"},
	"047AC3B9FAEA64522B7A23C4465A7AA8":{n:"Defender (Unknown) (PAL)"},
	"CE82A675C773FF21E0FFC0A4D1C90A71":{n:"Defender 2 (Genesis)"},
	"6F3E3306DA2AA6E74A5E046FF43BF028":{n:"Defender Arcade (Genesis)"},
	"3A771876E4B61D42E3A3892AD885D889":{n:"Defender II (1988) (Atari)"},
	"5F786B67E05FB9985B77D4BEB35E06EE":{n:"Defender II (1988) (Atari) (PAL)"},
	"278531CC31915747018D22145823D2C9":{n:"Defender MegaDrive (PAL) (Genesis)"},
	"039CF18B459D33B8A8FCA31D06C4C244":{n:"Demo Image Series #0 (12-02-2003) (AD)"},
	"A4AB331E8768EAFDC20CE8B0411FF77A":{n:"Demo Image Series #1 - Sam (19-02-2003) (AD)"},
	"EA86176B27AB0DA8CCE8F0179884BFAA":{n:"Demo Image Series #10 - It's Art (28-02-2003) (AD)"},
	"678C1D71A1616D9D022F03D8545B64BB":{n:"Demo Image Series #11 - Donald And Mario (28-02-2003) (AD)"},
	"CB8399DC0D409FF1F531EF86B3B34953":{n:"Demo Image Series #12 - Luigi And Mario (01-03-2003) (AD)"},
	"83F05ECECAE8BE59BA1E51135F4BDCBF":{n:"Demo Image Series #13 - Mario (4K Interleaved Chronocolour) (05-03-2003) (AD)"},
	"3025BDC30B5AEC9FB40668787F67D24C":{n:"Demo Image Series #14 - Two Marios (4K Interleaved Chronocolour Vertical Movement) (05-03-2003) (AD)"},
	"25710BDE8FA181B0C5CF0846B983BEC1":{n:"Demo Image Series #15 - Three Marios (NTSC) (06-03-2003) (AD)"},
	"FB0C32EF7AF5B45486DB663510094BE8":{n:"Demo Image Series #15 - Three Marios (NTSC) (Non-Interleave) (06-03-2003) (AD)"},
	"8D8B7D7B983F75DEBBDAAC651E814768":{n:"Demo Image Series #15 - Three Marios (PAL) (06-03-2003) (AD)"},
	"14DBB3686DD31964332DC2EF0C55CAD0":{n:"Demo Image Series #15 - Three Marios (PAL) (Non-Interleave) (06-03-2003) (AD)"},
	"EDE7E8BF865B0AFB4744F86D13624F9A":{n:"Demo Image Series #2 - Clown (19-02-2003) (AD)"},
	"02066B17F29082412C6754C1A2D6302E":{n:"Demo Image Series #3 - Baboon (19-02-2003) (AD)"},
	"C1B1049B88BCD98437D8872D1D62BA31":{n:"Demo Image Series #4 - Donald (19-02-2003) (AD)"},
	"BB6A5A2F7B67BEE5D1F237F62F1E643F":{n:"Demo Image Series #5 - Animegirl (19-02-2003) (AD)"},
	"A47878A760F5FA3AA99F95C3FDC70A0B":{n:"Demo Image Series #5 - Baboon (19-02-2003) (AD)"},
	"373B8A081ACD98A895DB0CB02DF35673":{n:"Demo Image Series #5 - Boofly (19-02-2003) (AD)"},
	"7CD379DA92C93679F3B6D2548617746A":{n:"Demo Image Series #5 - Clown (19-02-2003) (AD)"},
	"CD38AD19F51B1048D8E5E99C86A2A655":{n:"Demo Image Series #5 - Flag (19-02-2003) (AD)"},
	"A0D502DC8B90B1D7DAA5F6EFFB10D349":{n:"Demo Image Series #5 - Sam (19-02-2003) (AD)"},
	"A310494AD5BA2B5B221A30D7180A0336":{n:"Demo Image Series #6 - Mario (19-02-2003) (AD)"},
	"B451307B8B5E29F1C5F2CF064F6C7227":{n:"Demo Image Series #6 - Mario (Fixed) (26-02-2003) (AD)"},
	"D1B4075925E8D3031A7616D2F02FDD1F":{n:"Demo Image Series #7 - Two Marios (27-02-2003) (AD)"},
	"5C1B1AA78B7609D43C5144C3B3B60ADF":{n:"Demo Image Series #8 - Two Marios (Different Interlacing) (27-02-2003) (AD)"},
	"C8C7DA12F087E8D16D3E6A21B371A5D3":{n:"Demo Image Series #9 - Genius (28-02-2003) (AD)"},
	"D09935802D6760AE58253685FF649268":{n:"Demolition Herby (1983) (Telesys)",c:1},
	"7DFD100BDA9ABB0F3744361BC7112681":{n:"Demolition Herby (1983) (Telesys) (PAL)",c:1},
	"4A6BE79310F86F0BEBC7DFCBA4D74161":{n:"Demolition Herby (Unknown) (PAL)",c:1},
	"F0E0ADDC07971561AB80D9ABE1B8D333":{n:"Demon Attack (1982) (Imagic)"},
	"4901C05068512828367FDE3FB22199FE":{n:"Demon Attack (1982) (Imagic) (PAL)"},
	"B12A7F63787A6BB08E683837A8ED3F18":{n:"Demon Attack (1982) (Imagic) [fixed]"},
	"B24F6A5820A4B7763A3D547E3E07441D":{n:"Demon Attack (1983) (CCE)"},
	"9718B85AC5A55CBC7348963C63FFA35A":{n:"Demon Attack (Robby)"},
	"BAC28D06DFC03D3D2F4A7C13383E84EE":{n:"Demon Attack (Supergame)"},
	"110AC8ECAF1B69F41BC94C59DFCB8B2D":{n:"Demon Attack (Unknown)"},
	"442602713CB45B9321EE93C6EA28A5D0":{n:"Demon Attack (Unknown) (PAL)"},
	"F91FB8DA3223B79F1C9A07B77EBFA0B2":{n:"Demons to Diamonds (1982) (Atari)",p:1},
	"D62283AED0F4199ADB2333DE4C263E9C":{n:"Demons to Diamonds (1982) (Atari) (PAL)",p:1},
	"BF84F528DE44225DD733C0E6A8E400A0":{n:"Demons to Diamonds (CCE)",p:1},
	"698F569EAB5A9906EEC3BC7C6B3E0980":{n:"Demons! (2003) (SpkLeader) (Hack)"},
	"2D16A8B59A225EA551667BE45F554652":{n:"Der Geheimkurier (1983) (Quelle) (PAL)"},
	"A1CA372388B6465A693E4626CC98B865":{n:"Der Vielfrass (1983) (Quelle) (PAL)"},
	"25A21C47AFE925A3CA0806876A2B4F3F":{n:"Der kleine Baer (1983) (Quelle) (PAL)"},
	"A1F9159121142D42E63E6FB807D337AA":{n:"Der moderne Ritter (1983) (Quelle) (PAL)"},
	"E9E6AD30549A6E2CD89FE93B7691D447":{n:"Desert Falcon (05-27-1987) (Atari) (Prototype) (PAL)"},
	"FD4F5536FD80F35C64D365DF85873418":{n:"Desert Falcon (1987) (Atari)"},
	"D4806775693FCAAA24CF00FC00EDCDF3":{n:"Desert Falcon (1987) (Atari) (PAL)"},
	"626D67918F4B5E3F961E4B2AF2F41F1D":{n:"Diagnostic Test Cartridge 2.0 (1980) (Atari) (Prototype)"},
	"38BD172DA8B2A3A176E517C213FCD5A6":{n:"Diagnostic Test Cartridge 2.6 (1982) (Atari)"},
	"02AB2C47BC21E7FEAFA015F90D7DF776":{n:"Diagnostic Test Cartridge 2.6 (1982) (Atari) (Prototype)"},
	"09F89BBFA2AB00F1964D200E12D7CED0":{n:"Diagnostic Test Cartridge 2.6 (1982) (Atari) (Prototype) (4K)"},
	"740F39E71104E90416C29A73560B9C6B":{n:"Diagnostic Test Cartridge 2.6P (1982) (Atari) (PAL) (4K)"},
	"9222B25A0875022B412E8DA37E7F6887":{n:"Dice Puzzle (1983) (Panda)",c:1},
	"E02156294393818FF872D4314FC2F38E":{n:"Dice Puzzle (1983) (Sancho) (PAL)",c:1},
	"72876FD7C7435F41D571F1101FC456EA":{n:"Die Ente und der Wolf (1983) (Quelle) (PAL)"},
	"31DF1C50C4351E144C9A378ADB8C10BA":{n:"Die Ratte und die Karotten (1983) (Quelle) (PAL)"},
	"834A2273E97AEC3181EE127917B4B269":{n:"Die hungrigen Froesche (1983) (Quelle) (PAL)"},
	"6DDA84FB8E442ECF34241AC0D1D91D69":{n:"Dig Dug (1983) (Atari)"},
	"977294AE6526C31C7F9A166EE00964AD":{n:"Dig Dug (1983) (Atari) (PAL)"},
	"21D2C435BCCCDE7792D82844B3CF60F4":{n:"Dig Dug (1983) (Atari) (PAL) [a]"},
	"BAE1A23F9B6ACDADF465CFB330BA0ACB":{n:"Dig Dug (1983) (Atari) [a]"},
	"EF66AF190840871409FE1702D2483554":{n:"DiscoTech (12-02-2003) (Andrew Davie)"},
	"939CE554F5C0E74CC6E4E62810EC2111":{n:"Dishaster (1983) (ZiMAG)",c:1},
	"740B47DF422372FBEF700B42CEA4E0BF":{n:"Dizzy Wiz (2001) (B. Watson)"},
	"A5E9ED3033FB2836E80AA7A420376788":{n:"Dodge 'Em (1980) (Atari) (PAL)"},
	"10F62443F1AE087DC588A77F9E8F43E9":{n:"Dodge 'Em (1980) (Atari) (PAL) [fixed]"},
	"C3472FA98C3B452FA2FD37D1C219FB6F":{n:"Dodge 'Em (1980) (Atari) [a]"},
	"83BDC819980DB99BF89A7F2ED6A2DE59":{n:"Dodge 'Em (1980) (Atari) [fixed]"},
	"D28AFE0517A046265C418181FA9DD9A1":{n:"Dodge 'Em (Unknown) (PAL)"},
	"BC526185AD324241782DC68BA5D0540B":{n:"Dodge Demo 1 (PD)"},
	"5ACF9865A72C0CE944979F76FF9610F0":{n:"Dodge Demo 2 (PD)"},
	"0C0392DB94A20E4D006D885ABBE60D8E":{n:"Dodge Demo 3 (PD)"},
	"E2B682F6E6D76B35C180C7D847E93B4F":{n:"Dodge Demo 4 (PD)"},
	"CA09FA7406B7D2AEA10D969B6FC90195":{n:"Dolphin (1983) (Activision)"},
	"D09A7504EE8C8717AC3E24D263E7814D":{n:"Dolphin (1983) (Activision) (16K)"},
	"E237EE91514D5ED535C95A14FC608C11":{n:"Dolphin (1983) (Activision) (8K)"},
	"3889351C6C2100B9F3AEF817A7E17A7A":{n:"Dolphin (CCE)"},
	"7FFC2D80FD49A124808315306D19868E":{n:"Domino (Ishido) (PD)"},
	"937736D899337036DE818391A87271E0":{n:"Donald Duck's Speedboat (04-12-1983) (Atari) (Prototype)"},
	"FA7CE62E7FD77E02B3E2198D70742F80":{n:"Donald Duck's Speedboat (04-18-1983) (Atari) (Prototype) (PAL)"},
	"F473F99E47D4026A7A571184922EBF04":{n:"Donkey Claus (Philip R. Frey) (Hack)"},
	"8B5B1E3A434EBBDC2C2A49DC68F46360":{n:"Donkey Kong (1982) (CBS Electronics) (PAL)"},
	"3A526E6A1F9FE918AF0F2CE997DFEA73":{n:"Donkey Kong (1982) (CBS Electronics) (PAL) [a1]"},
	"0894AA7BE77521F9DF562BE8D9555FE6":{n:"Donkey Kong (1982) (CBS Electronics) (PAL) [a2]"},
	"B59417D083B0BE2D49A7D93769880A4B":{n:"Donkey Kong (1983) (Pet Boat) (PAL)"},
	"36B20C427975760CB9CF4A47E41369E4":{n:"Donkey Kong (1987) (Atari)"},
	"7511C34518A9A124EA773F5B0B5C9A48":{n:"Donkey Kong (208 in 1) (Unknown) (PAL)"},
	"DE5AAB22E5ABA5EDCB29A3E7491FF319":{n:"Donkey Kong (Star Game)"},
	"E7864CAAF9EC49ED67B1904CE8602690":{n:"Donkey Kong 2K3 Pic (PD)"},
	"5B98E0536C3F60547DD708AE22ADB04B":{n:"Donkey Kong Gingerbread Man (Ben Hudman) (Prototype)"},
	"5A6FEBB9554483D8C71C86A84A0AA74E":{n:"Donkey Kong Jr (1983) (CCE)"},
	"2880C6B59BD54B153174676E465167C7":{n:"Donkey Kong Jr. (Tron)"},
	"2091AF29B4E7B86914D79D9AAA4CBD20":{n:"Donkey Kong Junior (1983) (CBS Electronics) (PAL)"},
	"C8FA5D69D9E555EB16068EF87B1C9C45":{n:"Donkey Kong Junior (1987) (Atari)"},
	"278155FC9956E9B6EF2359EB238F7C7F":{n:"Donkey Kong Junior (Unknown) (Hack)"},
	"200A9D2A7CB4441CE4F002DF6AA47E38":{n:"Doomzerk (PD) (Hack)"},
	"7E2FE40A788E56765FE56A3576019968":{n:"Double Dragon (1989) (Activision)"},
	"3624E5568368929FABB55D7F9DF1022E":{n:"Double Dragon (1989) (Activision) (PAL)"},
	"47464694E9CCE07FDBFD096605BF39D4":{n:"Double Dragon (1989) (Activision) (PAL) [a]"},
	"4999B45BE0AB5A85BAC1B7C0E551542B":{n:"Double Dragon (CCE) (PAL)"},
	"740A7FA80F52CC7287BA37677AFB6B21":{n:"Double Dragon (PAL) (Genesis)"},
	"368D88A6C071CABA60B4F778615AAE94":{n:"Double Dunk (1989) (Atari)"},
	"CFC226D04D7490B69E155ABD7741E98C":{n:"Double Dunk (1989) (Atari) (PAL)"},
	"3B966BF3C2CA34AC6CA1DE4CF6383582":{n:"Double-Height 6-Digit Score Display (2001) (AD)"},
	"707ECD80030E85751EF311CED66220BC":{n:"Double-Height 6-Digit Score Display (Background Color Change) (2001) (AD)"},
	"88DCE4037471424BB38AB6841AAA8CAB":{n:"Double-Height 6-Digit Score Display (Two Background Color Change) (2001) (AD)"},
	"6A882FB1413912D2CE5CF5FA62CF3875":{n:"Dragon Defender (Ariola) (PAL)",c:1},
	"24D9A55D8F0633E886A1B33EE1E0E797":{n:"Dragon Defender (Thomas Jentzsch)",c:1},
	"41810DD94BD0DE1110BEDC5092BEF5B0":{n:"Dragon Treasure (Funvision)"},
	"6FC394DBF21CF541A60E3B3631B817F1":{n:"Dragonfire (1982) (Imagic) (PAL)"},
	"1267E3C6CA951FF1DF6F222C8F813D97":{n:"Dragonfire (Unknown) (PAL)"},
	"78B84CFB1C57B0488D674D2374E656E6":{n:"Dragonstomper (1 of 3) (1982) (Arcadia)"},
	"2D9E65959808A6098C16C82A59C9D9DC":{n:"Dragonstomper (1 of 3) (1982) (Arcadia) (PAL)"},
	"90CCF4F30A5AD8C801090B388DDD5613":{n:"Dragonstomper (1982) (Arcadia)"},
	"8B04E9D132B8E30D447ACAA6BD049C32":{n:"Dragonstomper (1982) (Arcadia) (PAL)"},
	"5B7EA6AA6B35DC947C65CE665FDE624B":{n:"Dragonstomper (2 of 3) (1982) (Arcadia)"},
	"66C4E0298D4120DF333BC2F3E163657E":{n:"Dragonstomper (2 of 3) (1982) (Arcadia) (PAL)"},
	"DD8A2124D4EDA200DF715C698A6EA887":{n:"Dragonstomper (3 of 3) (1982) (Arcadia)"},
	"AFF8CBA0F2D2EB239953DD7116894A08":{n:"Dragonstomper (3 of 3) (1982) (Arcadia) (PAL)"},
	"A302B922A8DBEC47743F28B7F91D4CD8":{n:"Dragonstomper (Preview) (1982) (Arcadia)"},
	"FBAC6476E7B2B20D246202AF81662C88":{n:"Dragonstomper (Preview) (1982) (Arcadia) (PAL)"},
	"A867B76098786C4091DBA2FCEE5084C3":{n:"Dragrace (Hack)"},
	"77057D9D14B99E465EA9E29783AF0AE3":{n:"Dragster (1980) (Activision)"},
	"D763E3A9CDCDD56C715EC826106FAB6A":{n:"Dragster (1980) (Activision) (16K)"},
	"63A6EDA1DA30446569AC76211D0F861C":{n:"Dragster (1980) (Activision) (4K)"},
	"9D1556AE5890398BE7E3D57449774B40":{n:"Dragster (1980) (Activision) (8K)"},
	"0C54811CF3B1F1573C9164D5F19ECA65":{n:"Dragster (1980) (Activision) (PAL)"},
	"BB18189021D58362D9E4D317CD2E28B7":{n:"Dragster (1980) (Activision) (PAL) (4K)"},
	"C216B91F5DB21A093DED6A5AAEC85709":{n:"Dragster (Jone Yuan)"},
	"3BB9793C60C92911895CF44530846136":{n:"Dragster (Jone Yuan) (4K)"},
	"B1339C56A9EA63122232FE4328373AC5":{n:"Dream Flight (1983) (Goliath) (PAL)"},
	"2BC6C53B19E0097A242F22375A6A60FF":{n:"Droid Demo 2 (David Conrad Schweinsberg) (PD)"},
	"37F42AB50018497114F6B0F4F01AA9A1":{n:"Droid Demo 2-M (David Conrad Schweinsberg) (PD)"},
	"BFF8F8F53A8AEB1EE804004CCBB08313":{n:"Droid Demo 22 (David Conrad Schweinsberg) (PD)"},
	"C1B7AEABC3EC41556D924C8372A9BA5B":{n:"Dukes of Hazard (1980) (Atari) (Prototype)"},
	"34CA2FCBC8BA4A0B544ACD94991CFB50":{n:"Dukes of Hazzard (1980) (Atari) (Prototype) (4K)"},
	"51DE328E79D919D7234CF19C1CD77FBC":{n:"Dukes of Hazzard (1983) (Atari)"},
	"2BA02F509A4991AA176BA8D9E540DF3D":{n:"Dukes of Hazzard (1983) (Atari) [a]"},
	"3897744DD3C756EA4B1542E5E181E02A":{n:"Dumbo's Flying Circus (05-05-1983) (Atari) (Prototype)"},
	"1F773A94D919B2A3C647172BBB97F6B4":{n:"Dumbo's Flying Circus (07-11-1983) (Atari) (Prototype) (PAL)"},
	"31FCBCE1CFA6EC9F5B6DE318E1F57647":{n:"Dumbo's Flying Circus (1983) (Atari) (Prototype) (PAL)"},
	"469473FF6FED8CC8D65F3C334F963AAB":{n:"Dune (07-10-1984) (Atari) (Prototype)",c:1},
	"AFB3BC45C6A82739CC82582127CD96E6":{n:"Dungeon (11-22-1985) (Atari) (Prototype)"},
	"615A3BF251A38EB6638CDC7FFBDE5480":{n:"E.T. - The Extra-Terrestrial (1982) (Atari)"},
	"8FEBDD9142960D084AB6EEB1D3E88969":{n:"E.T. - The Extra-Terrestrial (1982) (Atari) (PAL)"},
	"A511F7EE13E4B35512F9217A677B4028":{n:"E.T. - The Extra-Terrestrial (1982) (Atari) (PAL) [a]"},
	"C82EC00335CBB4B74494AECF31608FA1":{n:"E.T. - The Extra-Terrestrial (CCE)"},
	"F71694BD8E89D5A28DAA73BF856635DF":{n:"E.T. Book Cart (NTSC)",c:1},
	"91191666186117F5BF78B40623D79039":{n:"E.T. Book Cart (PAL)",c:1},
	"84DF0704E6C777E1F9A16EC92AD80DF0":{n:"E.T. Book Cart (PAL60)",c:1},
	"EFA1098C7D091B940C2543ABE372F036":{n:"E.T. The Extra-Terrestrial (Scott Stilphen) (Hack)"},
	"13ABC32F803165C458BB086FA57195FB":{n:"E.T. The Extra-Testical (Christian Samuel) (Hack)"},
	"6982854657A2CC87D712F718E402BF85":{n:"Earth Attack (Zellers)"},
	"033E21521E0BF4E54E8816873943406D":{n:"Earth Dies Screaming, The (1983) (20th Century Fox)"},
	"2C0DC885D5EDE94AA664BF3081ADD34E":{n:"Earth Dies Screaming, The (Unknown) (PAL)"},
	"2BF34B6AD7D2317A2D0808B3FB93571B":{n:"Easy Playfield Graphics (1997) (Chris Cracknell)"},
	"9CBB07F1993A027BC2F87D5205457EC9":{n:"Eckhard Stolberg's Scrolling Text Demo 1 (PD)"},
	"F8BFD99163D2C4EC688357786E6FBA28":{n:"Eckhard Stolberg's Scrolling Text Demo 2 (PD)"},
	"32E65D1E4DFCBCD9B57FEE72CAFE074C":{n:"Eckhard Stolberg's Scrolling Text Demo 3 (PD)"},
	"3B5751A8D20F7DE41EB069F76FECD5D7":{n:"Eckhard Stolberg's Scrolling Text Demo 4 (PD)"},
	"3E6DAB92009D6034618CB6B7844C5216":{n:"Ed Invaders (Hack)"},
	"07973BE3ECFD55235BF59AA56BDEF28C":{n:"Eddy Langfinger, der Museumsdieb (1983) (Quelle) (PAL)",c:1},
	"C6D48C6AE6461E0E82753540A985AC9E":{n:"Edtris (1994) (Ed Federmeyer)"},
	"683DC64EF7316C13BA04EE4398E2B93A":{n:"Edtris (1995) (Ed Federmeyer)"},
	"A00EE0AED5C8979ADD4C170F5322C706":{n:"Egghead (Barry Laws Jr.) (Hack)"},
	"42B2C3B4545F1499A083CFBC4A3B7640":{n:"Eggomania (1982) (U.S. Games)",p:1},
	"2B1589C7E1F394AE6A1C046944F06688":{n:"Eggomania (1983) (Carrere Video) (PAL)",p:1},
	"A3F2A0FCF74BBC5FA763B0EE979B05B1":{n:"Eishockey-Fieber (1983) (Quelle) (PAL)"},
	"71F8BACFBDCA019113F3F0801849057E":{n:"Elevator Action (1983) (Atari) (Prototype)"},
	"B6812EAF87127F043E78F91F2028F9F4":{n:"Eli's Ladder (1982) (Simage)"},
	"7EAFC9827E8D5B1336905939E097AAE7":{n:"Elk Attack (1987) (Atari) (Prototype)"},
	"DBC8829EF6F12DB8F463E30F60AF209F":{n:"Encounter at L-5 (1982) (Data Age)",p:1},
	"5188FEE071D3C5EF0D66FB45C123E4A5":{n:"Encounter at L-5 (1983) (Gameworld) (PAL)",p:1},
	"94B92A882F6DBAA6993A46E2DCC58402":{n:"Enduro (1983) (Activision)",l:"ENDURO"},
	"CFE62ED7125FF9FAE99B4C8A367C0399":{n:"Enduro (1983) (Activision) (16K)",l:"ENDURO"},
	"265C74A956500BD31EFD24ADC6D5CCF6":{n:"Enduro (1983) (Activision) (8K)",l:"ENDURO"},
	"6A82B8ECC663F371B19076D99F46C598":{n:"Enduro (1983) (Activision) (PAL)",l:"ENDURO"},
	"DE62F8A30298E2325249FE112ECB5C10":{n:"Enduro (1983) (CCE)",l:"ENDURO"},
	"360C0DCB11506E73BD0B77207C81BC62":{n:"Enduro (1983) (Digitel)",l:"ENDURO"},
	"E1EFE2EF7664BB6758B1A22FF8EA16A1":{n:"Enduro (1983) (Dynacom)",l:"ENDURO"},
	"07F84DB31E97EF8D08DC9FA8A5250755":{n:"Enduro (1984) (Supergame)",l:"ENDURO"},
	"5DF559A36347D8572F9A6E8075A31322":{n:"Enduro (Digivision)",l:"ENDURO"},
	"D2F713C78A9EBBA9DA6D10AEEFC6F20F":{n:"Enduro (Digivision) [a]",l:"ENDURO"},
	"A8E49D7E24CE293629CA29614862821B":{n:"Enduro (Genesis)"},
	"2BB0A1F1DEE5226DE648EB5F1C97F067":{n:"Enduro (Robby)",l:"ENDURO"},
	"E9E646F730B8400CD5DA08C849EF3E3B":{n:"Enduro (Tron)",l:"ENDURO"},
	"4279485E922B34F127A88904B31CE9FA":{n:"Enduro (Unknown)",l:"ENDURO"},
	"61719A8BDAFBD8DAB3CA9CE7B171B9E2":{n:"Enduro (Unknown) (PAL)",l:"ENDURO"},
	"9F5096A6F1A5049DF87798EB59707583":{n:"Entity, The (1983) (20th Century Fox) (Prototype)"},
	"6B683BE69F92958ABE0E2A9945157AD5":{n:"Entombed (1982) (U.S. Games)",c:1},
	"D7F5BF138CFC7FEAB7B8EF1534C8B477":{n:"Eric Bergstrom's KC-135 (Radar Map) (Aaron Bergstrom)"},
	"8538C5E3EE83267774480649F83FA8D6":{n:"Escape Demo (PD)"},
	"D1A1841B7F2007A24439AC248374630A":{n:"Escape from the Mindmaster (1 of 4) (1982) (Arcadia)"},
	"3576037C9281656655FA114A835BE553":{n:"Escape from the Mindmaster (1 of 4) (1982) (Arcadia) (PAL)"},
	"81F4F0285F651399A12FF2E2F35BAB77":{n:"Escape from the Mindmaster (1982) (Arcadia)"},
	"C9E721EB29C940C2E743485B044C0A3F":{n:"Escape from the Mindmaster (1982) (Arcadia) (PAL)"},
	"64198BB6470C78AC24FCF13FE76AB28C":{n:"Escape from the Mindmaster (1982) (Arcadia) [a]"},
	"FDF0DE38517E0CF7F0885F98CCC95836":{n:"Escape from the Mindmaster (2 of 4) (1982) (Arcadia)"},
	"A075AD332942740C386F4C3814925ECE":{n:"Escape from the Mindmaster (2 of 4) (1982) (Arcadia) (PAL)"},
	"7A63D7EA3F2851BCF04F0BB4BA1A3929":{n:"Escape from the Mindmaster (3 of 4) (1982) (Arcadia)"},
	"CC1939E4769D0C157ACE326EFCFDCF80":{n:"Escape from the Mindmaster (3 of 4) (1982) (Arcadia) (PAL)"},
	"F0536303F49006806BAC3AEC15738336":{n:"Escape from the Mindmaster (4 of 4) (1982) (Arcadia)"},
	"1EE2CFC7D0333B96BD11F7F3EC8CE8BC":{n:"Escape from the Mindmaster (4 of 4) (1982) (Arcadia) (PAL)"},
	"F1127ADE54037236E75A133B1DFC389D":{n:"Escape from the Mindmaster (Preview) (1982) (Arcadia)"},
	"271BFD5DC2673D382019F1FB6CAB9332":{n:"Escape from the Mindmaster (Preview) (1982) (Arcadia) (PAL)"},
	"F344AC1279152157D63E64AA39479599":{n:"Espial (1984) (Tigervision)"},
	"F7A138EED69665B5CD1BFA796A550B01":{n:"Espial (1984) (Tigervision) (PAL)"},
	"66362890EB78D6EA65301592CCE65F5B":{n:"Euchre (13-07-2001) (Eric Eid) (PD)"},
	"72097E9DC366900BA2DA73A47E3E80F5":{n:"Euchre (15-06-2001) (Eric Eid) (PD)"},
	"524693B337F7ECC9E8B9126E04A232AF":{n:"Euchre (19-08-2001) (Eric Eid) (PD)"},
	"8EE3F64DC0F349ADC893FE93DF5245D8":{n:"Euchre (20-07-2001) (Eric Eid) (PD)"},
	"EB71743C6C7CCCE5B108FAD70A326AD9":{n:"Euchre (25-11-2001) (Erik Eid) (PD)"},
	"65562F686B267B21B81C4DDDC129D724":{n:"Euchre (28-07-2001) (Eric Eid) (PD)"},
	"29949F893EF6CB9E8ECB368B9E99EEE4":{n:"Euchre (Alpha) (NTSC) (31-08-2002) (Erik Eid)"},
	"407A0C6CC0FF777F67B669440D68A242":{n:"Euchre (Alpha) (PAL) (31-08-2002) (Erik Eid)"},
	"FFB1CD548563158CE33F9D10268187E7":{n:"Euchre (Beta) (NTSC) (12-09-2002) (Erik Eid)"},
	"877A5397F3F205BF6750398C98F33DE1":{n:"Euchre (Beta) (PAL) (12-09-2002) (Erik Eid)"},
	"873FB75A7788BA0F4AE715229A05545E":{n:"Euchre (Improved Colors) (PAL) (26-09-2002) (Erik Eid)"},
	"15BF2EF7583BFCBBBA630847A1DC5539":{n:"Euchre (Jul 15) (2002) (Eric Eid) (PD)"},
	"80E52315919BD8A8B82A407CCD9BB13F":{n:"Euchre (Jul 28) (2002) (Eric Eid) (PD)"},
	"40AA851E8D0F1C555176A5E209A5FABB":{n:"Euchre (More for less) (NTSC) (22-08-2002) (Erik Eid)"},
	"C9D02D3CFEEF8B48FB71CB4520A4AA84":{n:"Euchre (More for less) (PAL) (22-08-2002) (Erik Eid)"},
	"B1B20536AEF4EED9C79DC5804F077862":{n:"Euchre (NTSC) (09-11-2001) (Erik Eid)"},
	"D4AA89E96D2902692F5C45F36903D336":{n:"Euchre (NTSC) (Erik Eid) (PD)"},
	"E5D5085123A98C1E61818CAA2971E999":{n:"Euchre (PAL) (Erik Eid) (PD)"},
	"6205855CC848D1F6C4551391B9BFA279":{n:"Euchre (Release Candidate 2) (NTSC) (01-10-2002) (Erik Eid)"},
	"199985CAE1C0123AB1AEF921DAACE8BE":{n:"Euchre (Release Candidate 2) (PAL) (01-10-2002) (Erik Eid)"},
	"4690FDB70C86604BB35DA26696818667":{n:"Euchre (Release Candidate) (NTSC) (28-09-2002) (Erik Eid)"},
	"BFFE34516AAA3CBF5D307EAB382A7E95":{n:"Euchre (Release Candidate) (PAL) (28-09-2002) (Erik Eid)"},
	"77CD9A9DD810CE8042BDB9D40E256DFE":{n:"Evil Dead (2003) (Kyle Pittman) (Hack)"},
	"B5657D4C1C732FBB6AF150668464247F":{n:"Excalibur (Dragonstomper Beta) (1982) (Arcadia) (Prototype)"},
	"1B4B06C2A14ED3EE73B7D0FD61B6AAF5":{n:"Excalibur (Dragonstomper Beta) (1982) (Arcadia) (Prototype) [a]"},
	"3AD58B53A1E972396890BD86C735E78D":{n:"Excalibur Version 36 (Dragonstomper Beta) (1982) (Arcadia) (Prototype)"},
	"2EAF8FA9E9FDF1FCFC896926A4BDBF85":{n:"Excalibur Version 39 (Dragonstomper Beta) (1982) (Arcadia) (Prototype)"},
	"6362396C8344EEC3E86731A700B13ABF":{n:"Exocet (1983) (Panda)"},
	"295F3679BDF91CA5E37DA3F787B29997":{n:"Exorcise (Hack)"},
	"EBD2488DCACE40474C1A78FA53EBFADF":{n:"Extra Terrestrials (1983) (SSG)"},
	"7926083AD423ED685DE3B3A04A914315":{n:"Face Invaders 2 (Barry Laws Jr.) (Hack)"},
	"0AF51CEB4AECC7A8FC89781AC44A1973":{n:"Face Invaders Deluxe (Barry Laws Jr.) (Hack)"},
	"B80D50ECEE73919A507498D0A4D922AE":{n:"Fantastic Voyage (1982) (20th Century Fox)"},
	"0F24CA5668B4AB5DFAF217933C505926":{n:"Fantastic Voyage (208 in 1) (Unknown) (PAL)"},
	"F7E07080ED8396B68F2E5788A5C245E2":{n:"Farmyard Fun (Ariola)"},
	"9DE0D45731F90A0A922AB09228510393":{n:"Fast Eddie (1982) (20th Century Fox)"},
	"A97733B0852EE3096300102CB0689175":{n:"Fast Eddie (1983) (CCE)"},
	"665B8F8EAD0EEF220ED53886FBD61EC9":{n:"Fast Food (1982) (Telesys)"},
	"48411C9EF7E2CEF1D6B2BEE0E6055C27":{n:"Fast Food (1982) (Telesys) (PAL)"},
	"313243FC41E49EF6BD3AA9EBC0D372DD":{n:"Fast Food (Unknown) (PAL)"},
	"6B7E1C11448C4D3F28160D2DE884EBC8":{n:"Fast Food (Zirok)"},
	"63E783994DF824CAF289B69A084CBF3E":{n:"Fat Albert (David Marli) (Hack)"},
	"8A159EE58B2F0A54805162984B0F07E5":{n:"Fatal Run (1989) (Atari) (PAL) [a]"},
	"85470DCB7989E5E856F36B962D815537":{n:"Fatal Run (1989) (Atari) (Prototype)"},
	"EF263D40A23483AB339CAC44D9515A56":{n:"Fatal Run (TJ)"},
	"074EC425EC20579E64A7DED592155D48":{n:"Fatal Run (Ultimate Driving) (1989) (Atari) (PAL)"},
	"0B55399CF640A2A00BA72DD155A0C140":{n:"Fathom (1983) (Imagic)",c:1},
	"47CD61F83457A0890DE381E478F5CF5F":{n:"Fathom (1983) (Imagic) (PAL)",c:1},
	"962FFD3EAF865230A7A312B80E6C5CFD":{n:"Fathom (1983) (Imagic) (PAL) [a]",c:1},
	"540075F657D4B244A1F74DA1B9E4BF92":{n:"Festival (4 Game in One Dark Green) (1983) (BitCorp) (PAL)"},
	"8E737A88A566CC94BD50174C2D019593":{n:"Feuerwehr im Einsatz (1983) (Quelle) (PAL)"},
	"2AC3A08CFBF1942BA169C3E9E6C47E09":{n:"Fighter Pilot (1988) (Activision) (PAL)"},
	"211FBBDBBCA1102DC5B43DC8157C09B3":{n:"Final Approach (1982) (Apollo)"},
	"51E390424F20E468D2B480030CE95D7B":{n:"Fire Bird (Video Game Program) (PAL)"},
	"01E60A109A6A67C70D3C0528381D0187":{n:"Fire Birds (1983) (ITT Family Games) (PAL)"},
	"D09F1830FB316515B90694C45728D702":{n:"Fire Fighter (1982) (Imagic)"},
	"90D77E966793754AB4312C47B42900B1":{n:"Fire Fighter (1982) (Imagic) (PAL)"},
	"20DCA534B997BF607D658E77FBB3C0EE":{n:"Fire Fly (1983) (Mythicon)"},
	"386FF28AC5E254BA1B1BAC6916BCC93A":{n:"Fireball (1982) (Arcadia)",p:1},
	"CDB81BF33D830EE4EE0606EE99E84DBA":{n:"Fireball (1982) (Arcadia) (PAL)",p:1},
	"5438E84B90E50A5362F01CC843B358D4":{n:"Fireball (1982) (Arcadia) (Prototype)",p:1},
	"683BB0D0F0C5DF58557FBA9DFFC32C40":{n:"Fireball (1982) (Arcadia) [a]",p:1},
	"66BC1BEF269EA59033928BAC2D1D81E6":{n:"Fireball (Preview) (1982) (Arcadia)",p:1},
	"A3D7C299FBCD7B637898EE0FDCFC47FC":{n:"Fireball (Preview) (1982) (Arcadia) (PAL)",p:1},
	"6C85098518D3F94F7622C42FD1D819AC":{n:"Firebug (Suntek) (PAL)"},
	"D2901C34BB6496BB96C7BC78A9E6142A":{n:"Fish Revenge (2003) (Greg Zumwalt) (Hack)"},
	"3FE43915E5655CF69485364E9F464097":{n:"Fisher Price (1983) (CCE)"},
	"2517827950FEE41A3B9DE60275C8AA6A":{n:"Fishing (32 in 1) (1988) (Atari) (PAL)"},
	"F9967369943209B4788D4E92CEFC0795":{n:"Fishing (32 in 1) (1988) (Atari) (PAL) (4K)"},
	"B8865F05676E64F3BEC72B9DEFDACFA7":{n:"Fishing Derby (1980) (Activision)"},
	"3C82E808FE0E6A006DC0C4E714D36209":{n:"Fishing Derby (1980) (Activision) (16K)"},
	"85227160F37AAA29F5E3A6C7A3219F54":{n:"Fishing Derby (1980) (Activision) (4K)"},
	"5131AB3797FE8C127E3E135B18B4D2C8":{n:"Fishing Derby (1980) (Activision) (8K)"},
	"571C6D9BC71CB97617422851F787F8FE":{n:"Fishing Derby (1980) (Activision) (PAL)"},
	"ECFA04523DDE82FE42CDC7315A8F61B6":{n:"Fishing Derby (1980) (Activision) (PAL) (4K)"},
	"7628D3CADEEE0FD2E41E68B3B8FBE229":{n:"Fishing Derby (32 in 1) (1988) (Atari) (PAL)"},
	"D782543818B6320E4F60D77DA2B596DE":{n:"Fishing Derby (32 in 1) (1988) (Atari) (PAL) (4K)"},
	"DEA0ADE296F7093E71185E802B500DB8":{n:"Fishing Derby (CCE)"},
	"804ED85EADF1CE3E93721547CBEA7592":{n:"Fishing Derby (CCE) (4K)"},
	"0651216C4A4A9C9AC5ADA3013A317C72":{n:"Fishing Derby (Jone Yuan) (4K) (Hack)"},
	"74023E0F2E739FC5A9BA7CAAEEEE8B6B":{n:"Fishing Derby (Jone Yuan) (Hack)"},
	"1D2A28EB8C95DA0D6D6B18294211839F":{n:"Fishing Derby (Unknown) (PAL) (4K)"},
	"6B72B691EA86F61438ED0D84C4D711DE":{n:"Fishing Derby (Unknown) (PAL) (4K) (Hack)"},
	"458883F1D952CD772CF0057ABCA57497":{n:"Fishing Derby (Unknown) (PAL) (Hack)"},
	"30512E0E83903FC05541D2F6A6A62654":{n:"Flag Capture (1978) (Atari)"},
	"4B143D7DCF6C96796C37090CBA045F4F":{n:"Flag Capture (1978) (Atari) (4K)"},
	"DA7A17DCDAA62D6971393C0A6FAF202A":{n:"Flag Capture (208 in 1) (Unknown) (PAL)"},
	"F5445B52999E229E3789C39E7EE99947":{n:"Flag Capture (32 in 1) (1988) (Atari) (PAL)"},
	"B897F9E3F939B9F21566D56DB812A84E":{n:"Flag Capture (32 in 1) (1988) (Atari) (PAL) (4K)"},
	"19162393786098D50587827588198A86":{n:"Flag Capture (Jone Yuan) (4K)"},
	"4AE8C76CD6F24A2E181AE874D4D2AA3D":{n:"Flash Gordon (Unknown) (PAL)"},
	"7A2AF383014F5D810AD26D322823549D":{n:"FlickerSort Demo (20-04-2002) (MP)"},
	"02811151906E477D47C135DB5B1699C6":{n:"FlickerSort Demo (Updated) (20-04-2002) (MP)"},
	"5A2F2DCD775207536D9299E768BCD2DF":{n:"Flippern (Double-Game Package) (1983) (Quelle) (PAL)"},
	"E549F1178E038FA88DC6D657DC441146":{n:"Football (1979) (Atari)"},
	"D86DEB100C6ABED1588AA84B2F7B3A98":{n:"Football (1979) (Atari) (4K)"},
	"5F9B62350B31BE8BD270D9A241CBD50E":{n:"Football (1989) (Telegames) (PAL)"},
	"CFE2185F84CE8501933BEB5C5E1FD053":{n:"Football (208 in 1) (Unknown) (PAL)"},
	"E6D5948F451A24994DFAACA51DFDB4E1":{n:"Football (Jone Yuan) (4K)"},
	"213E5E82ECB42AF237CFED8612C128AC":{n:"Forest (1983) (Sancho) (PAL)",c:1},
	"7AB210F448DE518FA61A5924120BA872":{n:"Fortress (20-04-2003) (CT)"},
	"2008C76DEBA5953201EF75A09B2FF7DC":{n:"Fortress (21-04-2003) (CT)"},
	"19D9B5F8428947EAE6F8E97C7F33BF44":{n:"Fortress (Dual Version) (20-04-2003) (CT)"},
	"6D74EBABA914A5CFC868DE9DD1A5C434":{n:"Fortress (Smooth Version) (20-04-2003) (CT)"},
	"76EE917D817EF9A654BC4783E0273AC4":{n:"Fox & Goat (Double-Game Package) (1983) (Quelle) (PAL)"},
	"0856F202B18CD46E44FD1DC3B42E9BFB":{n:"Frame Counter 1 (2001) (Jake Patterson) (PD)"},
	"DB1753CC702C18D3917EC7F3B0E8659F":{n:"Frame Counter 2 (2001) (Jake Patterson) (PD)"},
	"8290DAEA8391F96D7C8E1482E184D19C":{n:"Frame Timed Sound Effects (Eckhard Stolberg)"},
	"442B7863683E5F084716FDA050474FEB":{n:"Frame Timed Sound Effects-EM (Eckhard Stolberg)"},
	"15DD21C2608E0D7D9F54C0D3F08CCA1F":{n:"Frankenstein's Monster (1983) (Data Age)"},
	"7D0B49EA4FE3A5F1E119A6D14843DB17":{n:"Frankenstein's Monster (1983) (Gameworld) (PAL)"},
	"8E0AB801B1705A740B476B7F588C6D16":{n:"Freeway (1981) (Activision)"},
	"69974DD5D6420B90898CDE50AEC5EF39":{n:"Freeway (1981) (Activision) (16K)"},
	"851CC1F3C64EAEDD10361EA26345ACEA":{n:"Freeway (1981) (Activision) (4K)"},
	"0F95264089C99FC2A839A19872552004":{n:"Freeway (1981) (Activision) (8K)"},
	"2EC6B045CFD7BC52D9CDFD1B1447D1E5":{n:"Freeway (1981) (Activision) (PAL)"},
	"E4AFE157C09962CF39CDB25845D83D47":{n:"Freeway (1981) (Activision) (PAL) (4K)"},
	"EDDEF10FDC0029301064115AE0CD41D4":{n:"Freeway (CCE)"},
	"28148A52B1955CE12C7A74D3A3E620A4":{n:"Freeway (CCE) (4K)"},
	"7D5C3B7B908752B98E30690E2A3322C2":{n:"Freeway (Dactari - Milmar)"},
	"B822FBA8B7C8A97EA4E92AEB2C455EF9":{n:"Freeway (Dactari) (4K)"},
	"7B7B4AC05232490C28F9B680C72998F9":{n:"Freeway (Zellers)"},
	"914A8FEAF6D0A1BBED9EB61D33817679":{n:"Freeway Chicken (32 in 1) (1988) (Atari) (PAL)"},
	"B7B1D3CE07E75976C43A2DCA3866237E":{n:"Freeway Chicken (32 in 1) (1988) (Atari) (PAL) (4K)"},
	"481D20EC22E7A63E818D5EF9679D548B":{n:"Freeway Rabbit (32 in 1) (1988) (Atari) (PAL)"},
	"060C865C782DEBB047E6FD101C8923FC":{n:"Freeway Rabbit (32 in 1) (1988) (Atari) (PAL) (4K)"},
	"E80A4026D29777C3C7993FBFAEE8920F":{n:"Frisco (Unknown)"},
	"056FF67DD9715FAFA91FB8B0DDCC4A46":{n:"Frisco (Unknown) (PAL) (Hack)"},
	"45A4F55BB9A5083D470AD479AFD8BCA2":{n:"Frog Demo (1983) (CommaVid)"},
	"F67181B3A01B9C9159840B15449B87B0":{n:"Frog Pond (08-27-1982) (Atari) (Prototype)"},
	"5F73E7175474C1C22FB8030C3158E9B3":{n:"Frog Pond (1982) (Atari) (Prototype)"},
	"081E2C114C9C20B61ACF25FC95C71BF4":{n:"Frogger (1982) (Parker Bros)"},
	"02CED7EA2B7CB509748DB6BFA227EBEC":{n:"Frogger (1982) (Parker Bros) (PAL)"},
	"27C6A2CA16AD7D814626CEEA62FA8FB4":{n:"Frogger II (1984) (Parker Bros)",c:1},
	"FB91DFC36CDDAA54B09924AE8FD96199":{n:"Frogger II (1984) (Parker Bros) (PAL)",c:1},
	"DCC2956C7A39FDBF1E861FC5C595DA0D":{n:"Frogs and Flies (1982) (M Network)"},
	"1B8C3C0BFB815B2A1010BBA95998B66E":{n:"Frogs and Flies (1989) (Telegames) (PAL)"},
	"4A196713A21EF07A3F74CF51784C6B12":{n:"Frogs and Flies (Jone Yuan) (Hack)"},
	"E556E07CC06C803F2955986F53EF63ED":{n:"Front Line (1984) (Coleco)"},
	"4CA73EB959299471788F0B685C3BA0B5":{n:"Frostbite (1983) (Activision)"},
	"5A93265095146458DF2BAF2162014889":{n:"Frostbite (1983) (Activision) (PAL)"},
	"70CE036E59BE92821C4C7FD735EC6F68":{n:"Frostbite (1983) (Activision) (PAL) (16K)"},
	"9831EFC7F4CB8FFB4DF0082BAB2F07A3":{n:"Frostbite (1983) (Activision) (PAL) (8K)"},
	"F4469178CD8998CB437FA110A228EACA":{n:"Frostbite (1983) (Digitel)"},
	"C225379E7C4FB6F886EF9C8C522275B4":{n:"Frostbite (1983) (Video Mania)"},
	"C6AE21CACEAAD734987CB24243793BD5":{n:"Frostbite (CCE)"},
	"ADB79F9AC1A633CDD44954E2EAC14774":{n:"Frostbite (Digivision)"},
	"6B71F20C857574B732E7A8E840BD3CB2":{n:"Frostbite (Unknown) (PAL)"},
	"6A9B30CA46B0DBA9E719F4CBD340E01C":{n:"Frostbite (Unknown) (PAL) (Hack)"},
	"415C11FCAC66BBD2ACE2096687774B5A":{n:"Fu Kung! (V0.00) (07-01-2003) (AD)"},
	"EB3D680699F8762F71F38E28E321234D":{n:"Fu Kung! (V0.01) (08-01-2003) (AD)"},
	"9F2D58DCE1B81C6BA201ED103507C025":{n:"Fu Kung! (V0.02) (2003) (AD)"},
	"DFF33523CCD2FDC8912E84CAB8E0D982":{n:"Fu Kung! (V0.03) (10-01-2003) (AD)"},
	"AB2EA35DCC1098C87455BB8210B018CF":{n:"Fu Kung! (V0.04 Single Line Resolution) (10-01-2003) (AD)"},
	"81341F00B61AB37D19D1529F483D496D":{n:"Fu Kung! (V0.04) (10-01-2003) (AD)"},
	"7ED7130A6E4020161836414332B11983":{n:"Fu Kung! (V0.05 Cuttle Card Compatible) (13-01-2003) (AD)"},
	"61621A556AD3228F0234F5FEB3AB135C":{n:"Fu Kung! (V0.05 Cuttle Card Compattle Revision) (14-01-2003) (AD)"},
	"D026716B3C5BE2C951CC4C064317C524":{n:"Fu Kung! (V0.06) (14-01-2003) (AD)"},
	"CBAD928E10AEEE848786CC55394FB692":{n:"Fu Kung! (V0.06a Cuttle Cart Compatible) (15-01-2003) (AD)"},
	"78C2DE58E42CD1FAAC2EA7DF783EAEB3":{n:"Fu Kung! (V0.07) (25-01-2003) (AD)"},
	"9ECA521DB1959156A115DEE85A405194":{n:"Fu Kung! (V0.08) (2003) (AD)"},
	"58D331C23297ED98663D11B869636F16":{n:"Fu Kung! (V0.09) (26-01-2003) (AD)"},
	"2228C67D25E507603D4873D3934F0757":{n:"Fu Kung! (V0.10) (28-01-2003) (AD)"},
	"52E9DB3FE8B5D336843ACAC234AAEA79":{n:"Fu Kung! (V0.11) (28-01-2003) (AD)"},
	"D632B74FEA533D593AF82CF16E7C5E4A":{n:"Fu Kung! (V0.13) (01-02-2003) (AD)"},
	"6076B187A5D8EA7A2A05111C19B5D5CD":{n:"Fu Kung! (V0.14) (01-02-2003) (AD)"},
	"F80CF77164079D774B9B0FAE33DFFCA9":{n:"Fu Kung! (V0.15) (Negative Version) (05-02-2003) (AD)"},
	"F1BECA5A198CF08190487E5C27B8E540":{n:"Fu Kung! (V0.16) (2003) (AD)"},
	"2240655247D6DE1C585564004A853AB7":{n:"Fu Kung! (V0.17) (07-02-2003) (AD)"},
	"0DE53160A8B54C3AA5AED8D68C970B62":{n:"Fuchs & Schweinchen Schlau (1983) (Quelle) (PAL)"},
	"456453A54CA65191781AEF316343AE00":{n:"Full Screen Bitmap (3-D Green) (PD)"},
	"C3F53993ADE534B0982CA3A286C85BB5":{n:"Full Screen Bitmap Drawing System (12-02-2003) (AD)"},
	"819AEEB9A2E11DEB54E6DE334F843894":{n:"Fun with Numbers (1980) (Atari)"},
	"DFC03EF371CF5163F54C50D8EE73C8CF":{n:"Fun with Numbers (1980) (Atari) (4K)"},
	"5F46D1FF6D7CDEB4B09C39D04DFD50A1":{n:"Fun with Numbers (1980) (Atari) (PAL)"},
	"D0CB28E1B7BD6C7F683A0917B59F707E":{n:"Fun with Numbers (1980) (Atari) (PAL) (4K)"},
	"D816FEA559B47F9A672604DF06F9D2E3":{n:"Fun with Numbers (32 in 1) (1988) (Atari) (PAL)"},
	"08989FA4FF537F5DBD611AFF4019521A":{n:"Fun with Numbers (32 in 1) (1988) (Atari) (PAL) (4K)"},
	"D3BB42228A6CD452C111C1932503CC03":{n:"Funky Fish (1983) (UA Limited) (Prototype)",c:1},
	"CD568D6ACB2F14477EBF7E59FB382292":{n:"Fussball (Ariola) (PAL)"},
	"C1FDD44EFDA916414BE3527A47752C75":{n:"G.I. Joe - Cobra Strike (1983) (Parker Bros)",p:1},
	"840A5A2EAEA24D95D289F514FD12F9BB":{n:"GBImprov (Hack)"},
	"A3B9D2BE822EAB07E7F4B10593FB5EAA":{n:"GREGXM Demo (PD)"},
	"13A991BC9C2FF03753AEB322D3E3E2E5":{n:"Galactic (Funvision) (PAL)"},
	"C745487828A1A6A743488ECEBC55AD44":{n:"Galactic (Rainbow Vision) (PAL)"},
	"EA7E25ADE3FE68F5B786EE0AA82B1FE5":{n:"Galatic (208 in 1) (Unknown) (PAL)"},
	"590AC71FA5F71D3EB29C41023B09ADE9":{n:"Galaxian (01-05-1983) (Atari) (Prototype)"},
	"803393ED29A9E9346569DD1BF209907B":{n:"Galaxian (02-04-1983) (Atari) (Prototype)"},
	"211774F4C5739042618BE8FF67351177":{n:"Galaxian (1983) (Atari)"},
	"13A37CF8170A3A34CE311B89BDE82032":{n:"Galaxian (1983) (Atari) (PAL)"},
	"18DC28BC22402F21E1C9B81344B3B8C5":{n:"Galaxian (1983) (Atari) (PAL) [a1]"},
	"218B76F5A4142DC2EA9051A768583D70":{n:"Galaxian (1983) (Atari) (PAL) [a2]"},
	"D65028524761EF52FBBDEBAB46F79D0F":{n:"Galaxian (CCE)"},
	"93C8D9D24F9C5F1F570694848D087DF7":{n:"Galaxian (Digivision)"},
	"579BAA6A4AA44F035D245908EA7A044D":{n:"Galaxian Enhanced Graphics (Jess Ragan) (Hack)"},
	"D6B8BEEB05E5B730084D4B8F381BBF8D":{n:"Game Select (208 in 1) (Unknown) (PAL)"},
	"31F4692EE2CA07A7CE1F7A6A1DAB4AC9":{n:"Game of Concentration (1980) (Atari) (4K)"},
	"F539E32BF6CE39C8CA47CB0CDD2C5CB8":{n:"GameLine Master Module ROM (1983) (Control Video)"},
	"DB971B6AFC9D243F614EBF380AF0AC60":{n:"Gamma-Attack (1983) (Gammation)"},
	"A7523DB9A33E9417637BE0E71FA4377C":{n:"Gangster (Ariola) (PAL)"},
	"20EDCC3AA6C189259FA7E2F044A99C49":{n:"Gangster Alley (1982) (Spectravision)"},
	"BAE66907C3200BC63592EFE5A9A69DBB":{n:"Gangster Alley (1982) (Spectravision) (PAL)"},
	"DC13DF8420EC69841A7C51E41B9FBBA5":{n:"Garfield (06-21-1984) (Atari) (Prototype)"},
	"E0EFF071F578ECF19EDC2AB276644E46":{n:"Gas Gauge Demo (2001) (Joe Grand) (PD)"},
	"61EF8C2FC43BE9A04FE13FDB79FF2BD9":{n:"Gas Gauge Demo - Revisited (2001) (Joe Grand) (PD)"},
	"728152F5AE6FDD0D3A9B88709BEE6C7A":{n:"Gas Hog (1983) (Spectravideo)"},
	"5CBD7C31443FB9C308E9F0B54D94A395":{n:"Gas Hog (1983) (Spectravideo) [fixed]"},
	"E64A8008812327853877A37BEFEB6465":{n:"Gauntlet (1983) (Answer Software)"},
	"E784A9D26707CFCD170A4C1C60422A72":{n:"Gefecht im All (1983) (Quelle) (PAL)"},
	"7E464186BA384069582D9F0C141F7491":{n:"General Re-Treat (1982) (PlayAround) (PAL)"},
	"2BEE7F226D506C217163BAD4AB1768C0":{n:"Ghost Manor (1983) (Xonox)"},
	"0EECB5F58F55DE9DB4EEDB3A0F6B74A8":{n:"Ghost Manor (1983) (Xonox) (4K)"},
	"40D8ED6A5106245AA79F05642A961485":{n:"Ghost Manor (1983) (Xonox) (PAL)"},
	"3B10106836565E5DB28C7823C0898FBB":{n:"Ghost Manor (1983) (Xonox) (PAL) [a]"},
	"7B33407B2B198AF74906B936CE1EECBB":{n:"Ghostbuster 2 (King Atari)",c:1},
	"D36308387241E98F813646F346E7F9F7":{n:"Ghostbuster 2 (King Atari) (PAL)",c:1},
	"E314B42761CD13C03DEF744B4AFC7B1B":{n:"Ghostbusters (1985) (Activision)"},
	"F7D6592DCB773C81C278140ED4D01669":{n:"Ghostbusters (1985) (Activision) (PAL)"},
	"721A5567F76856F6B50A6707AA8F8316":{n:"Ghostbusters (1985) (Activision) (PAL) [a]"},
	"C2B5C50CCB59816867036D7CF730BF75":{n:"Ghostbusters II (1992) (Salu) (PAL)",c:1},
	"643E6451EB6B8AB793EB60BA9C02E000":{n:"Ghostbusters II (1992) (Salu) (PAL) [different tune]",c:1},
	"718EE85EA7EC27D5BEA60D11F6D40030":{n:"Ghostbusters II (1992) (Thomas Jentzsch)",c:1},
	"1C8C42D1AEE5010B30E7F1992D69216E":{n:"Gigolo (1982) (PlayAround)",c:1},
	"F303630A2D7316787AECD67FFF6B2E33":{n:"Gingerbread Man (Fred Quimby)"},
	"37E828675D556775AE8285C0CAF7D11C":{n:"Gingerbread Man (Fred Quimby) (Genesis)"},
	"5E0C37F534AB5CCC4661768E2DDF0162":{n:"Glacier Patrol (1989) (Telegames)"},
	"2D9E5D8D083B6367EDA880E80DFDFAEB":{n:"Glib (1983) (Selchow & Righter)"},
	"A591B5E8587AAE0D984A0F6FE2CC7D1C":{n:"Globe Trotter Demo (24-03-2003) (Weston)"},
	"0F6676B05621F80C670966E2995B227A":{n:"Globe Trotter Demo 1 (24-03-2003) (Weston)"},
	"103F1756D9DC0DD2B16B53AD0F0F1859":{n:"Go Go Home Monster (1983) (Quelle) (PAL)"},
	"4093382187F8387E6D011883E8EA519B":{n:"Go Go Home Monster (Unknown)"},
	"CFB83A3B0513ACAF8BE4CAE1512281DC":{n:"Going-Up (1983) (Starpath) (Prototype)"},
	"2E663EAA0D6B723B645E643750B942FD":{n:"Golf (1980) (Atari)"},
	"F542B5D0193A3959B54F3C4C803BA242":{n:"Golf (1980) (Atari) (4K)"},
	"9D522A3759AA855668E75962C84546F7":{n:"Golf (1980) (Atari) (PAL)"},
	"BB756AA98B847DDDC8FC170BC79F92B2":{n:"Golf (208 in 1) (Unknown) (PAL)"},
	"95351B46FA9C45471D852D28B9B4E00B":{n:"Golf (32 in 1) (1988) (Atari) (PAL)"},
	"DB5073BD75EB05F7D62A7268396D1E77":{n:"Golf (32 in 1) (1988) (Atari) (PAL) (4K)"},
	"C16C79AAD6272BAFFB8AAE9A7FFF0864":{n:"Gopher (1982) (U.S. Games)"},
	"A56B642A3D3AB9BBEEE63CD44EB73216":{n:"Gopher (1983) (Carrere Video) (PAL)"},
	"8F90590DBA143D783DF5A6CFF2000E4D":{n:"Gopher (208 in 1) (Unknown) (PAL)"},
	"06DB908011065E5EBB37F4E253C2A0B0":{n:"Gopher (Unknown) (PAL)"},
	"81B3BF17CF01039D311B4CD738AE608E":{n:"Gorf (1982) (CBS Electronics)",c:1},
	"3E03086DA53ECC29D855D8EDF10962CB":{n:"Gorf (1982) (CBS Electronics) (PAL)",c:1},
	"98BA601A60172CB46C5BF9A962FD5B1F":{n:"Gorilla Kong (Hack)"},
	"2903896D88A341511586D69FCFC20F7D":{n:"Grand Prix (1982) (Activision)"},
	"DE4436EAA41E5D7B7609512632B90078":{n:"Grand Prix (1982) (Activision) (16K)"},
	"5E1B7A6078AF428EF056FE85A37A95CA":{n:"Grand Prix (1982) (Activision) (8K)"},
	"757F529026696E13838364DEA382A4ED":{n:"Grand Prix (1982) (Activision) (PAL)"},
	"41C4E3D45A06DF9D21B7AAE6AE7E9912":{n:"Grand Prix (1983) (CCE)"},
	"E5F84930AA468DB33C0D0F7B26DD8293":{n:"Grand Prix (1983) (CCE) [a]"},
	"D5D2D44FB73785996CCC24AE3A0F5CEF":{n:"Grand Prix (Robby)"},
	"0F738DC44437557624EB277ED7AD91C9":{n:"Grand Prix (Unknown) (PAL)"},
	"9E437229136F1C5E6EF4C5F36178ED18":{n:"Grand Prize (Funvision)"},
	"5A9685C4D51A6C1D6A9544946D9E8DC3":{n:"Grandma's Revenge (AtariAge)"},
	"4767356FA0ED3EBE21437B4473D4EE28":{n:"Gravitar (04-12-1983) (Atari) (Prototype)"},
	"8AC18076D01A6B63ACF6E2CAB4968940":{n:"Gravitar (1983) (Atari)"},
	"A81697B0C8BBC338AE4D0046EDE0646B":{n:"Gravitar (CCE)"},
	"9245A84E9851565D565CB6C9FAC5802B":{n:"Great Escape (1983) (Bomb)"},
	"ED014BEEEB77DBB2BBCF9B5F6850B2F4":{n:"Green Bar Text Demo (PD)"},
	"ABC64037CA5D5B04AE8A7EEDBCA3ED74":{n:"Green and Yellow Number 1 Demo (PD)",c:1},
	"B41FDD4A522E1D5A2721840028684AC2":{n:"Green and Yellow Number 1 Demo 2 (PD)",c:1},
	"42B5E3A35B032F033809AFB0EA28802D":{n:"Gremlins (03-12-1984) (Atari) (Prototype)"},
	"01CB3E8DFAB7203A9C62BA3B94B4E59F":{n:"Gremlins (1984) (Atari)"},
	"9962034EA7B3D4A905D0991804670087":{n:"Grid Demo (PD)"},
	"95A69CF8C08EF1522B050529464F0BCA":{n:"Grid Pattern Demo 1 (20-12-2002) (CT)"},
	"8D9A06101EBB0F147936356E645309B8":{n:"Grid Pattern Demo 2 (20-12-2002) (CT)"},
	"D65900FEFA7DC18AC3AD99C213E2FA4E":{n:"Grid and Purple Dot Demo (PD)"},
	"EB46E99EC15858F8CD8C91CEF384CE09":{n:"Ground Zero (1983) (Goliath) (PAL)"},
	"66B89BA44E7AE0B51F9EF000EBBA1EB7":{n:"Grover's Music Maker (01-18-1983) (Atari) (Prototype)"},
	"4AC9F40DDFCF194BD8732A75B3F2F214":{n:"Grover's Music Maker (12-29-1982) (Atari) (Prototype)"},
	"7AB2F190D4E59E8742E76A6E870B567E":{n:"Guardian (1982) (Apollo)",p:1},
	"6A07836C382195DD5305CE61D992AAA6":{n:"Guardian (1982) (Apollo) (Prototype)",p:1},
	"F750B5D613796963ACECAB1690F554AE":{n:"Gunfight 2600 (MP)"},
	"18B28B386ABDADB3A700AC8FB68E639A":{n:"Gunfight 2600 (MP) (PAL)"},
	"6CBE945E16D9F827D0D295546AC11B22":{n:"Gunfight 2600 - AI (MP)"},
	"2ABC3D46B3F2140160759E2E10BC86D9":{n:"Gunfight 2600 - Beta Release! (2001) (MP)"},
	"9853089672116117258097DBBDB939B7":{n:"Gunfight 2600 - Cowboy Hair (2001) (MP)"},
	"A025A8F83A42A4D6D46C4887E799BFAC":{n:"Gunfight 2600 - Descissions had to be made (2001) (MP)"},
	"25472DFDEEF6A42581A231D631D6B04D":{n:"Gunfight 2600 - Design thoughts (MP)"},
	"14A56B493A8D9D10E94A3E100362E3A2":{n:"Gunfight 2600 - Early Play-kernel (2001) (MP)"},
	"0FBA7D8C3520BDB681F75494E498EC36":{n:"Gunfight 2600 - Final Run (MP)"},
	"91A3749FF7B7E72B7FA09E05396A0E7B":{n:"Gunfight 2600 - Final Run Part 2 (2002) (MP)"},
	"29396DB58406084E416032C372734A3E":{n:"Gunfight 2600 - Fixed Beta Release! (2001) (MP)"},
	"862CF669CBCED78F9ED31A5D375B2EBE":{n:"Gunfight 2600 - Flicker acceptance (2001) (MP)"},
	"910DD9BF98CC5BC080943E5128B15BF5":{n:"Gunfight 2600 - Improved AI (MP)"},
	"C21450C21EFB7715746E9FA87AD6F145":{n:"Gunfight 2600 - It could've been soooo cool, but... (2001) (MP)"},
	"D17A671029B1532B197DEFCA5F3649A7":{n:"Gunfight 2600 - Limit broken again! (2001) (MP)"},
	"E6F49A1053C79211F82BE4D90DC9FE3D":{n:"Gunfight 2600 - Little progress... (2001) (MP)"},
	"C67FF409F28F44883BD5251CEA79727D":{n:"Gunfight 2600 - Music & Bugfixes 1 (2001) (MP)"},
	"7D93071B3E3616093A6B5A98B0315751":{n:"Gunfight 2600 - Music & Bugfixes 2 (2001) (MP)"},
	"BC703EA6AFB20BC089F04D8C9D79A2BD":{n:"Gunfight 2600 - Not mergeable with Colbert wizardry... (2001) (MP)"},
	"111029770226B319524134193886A10E":{n:"Gunfight 2600 - One Limit Reached! (2001) (MP)"},
	"68C80E7E1D30DF98A0CF67ECBF39CC67":{n:"Gunfight 2600 - One Step Forward & Two Steps Back (2001) (MP)"},
	"E4A0B28BEFAAA2915DF1FA01238B1E29":{n:"Gunfight 2600 - Red River (MP)"},
	"CFDB4D0427A1EA8085C6BC6EB90259D8":{n:"Gunfight 2600 - Release Candidate (2001) (MP)"},
	"83D15FB9843D9F84AA3710538403F434":{n:"Gunfight 2600 - Release Candidate (2001) (MP) (PAL)"},
	"DFCDD6F593BB7B05DBC2E8E1FC6EE0DE":{n:"Gunfight 2600 - Scenarios complete (MP)"},
	"D245E2F27C84016041E9496B66B722FE":{n:"Gunfight 2600 - The Final Kernel (MP)"},
	"991D57BBCD529AD62925098E0AEC1241":{n:"Gunfight 2600 - The Final Kernel (MP) [a1]"},
	"A4F1CEA2C8479284E2A2292F8D51B5FA":{n:"Gunfight 2600 - The Final Kernel Part 2 (MP)"},
	"D81BB6965E6C99B3BE99FFD8978740E4":{n:"Gunfight 2600 - The Final Kernel Part 3 (MP)"},
	"A15B5831A1FAB52E4C416068C85EC011":{n:"Gunfight 2600 - The Good, The Bad, The Ugly (2001) (MP)"},
	"24AD538291EB5F5CAC4B9998F3B851C3":{n:"Gunfight 2600 - This time it's your decission! (2001) (MP)"},
	"801BA40F3290FC413E8C816C467C765C":{n:"Gunfight 2600 - Westward Ho! (2001) (MP)"},
	"24759BE31E8FE55D2829FD86BDF3181F":{n:"Gunfight 2600 - Worst Nightmare... (2001) (MP)"},
	"B311AB95E85BC0162308390728A7361D":{n:"Gyruss (1984) (Parker Bros)",c:1},
	"E600F5E98A20FAFA47676198EFE6834D":{n:"Gyruss (1984) (Parker Bros) (PAL)",c:1},
	"FCA4A5BE1251927027F2C24774A02160":{n:"H.E.R.O. (1984) (Activision)"},
	"D9B49F0678776E04916FA5478685A819":{n:"H.E.R.O. (1984) (Activision) (PAL)"},
	"48BCF2C5A8C80F18B24C55DB96845472":{n:"H.E.R.O. (1984) (Activision) (PAL) (16K)"},
	"467340A18158649AA5E02A4372DCFCCD":{n:"H.E.R.O. (1984) (Activision) (PAL) [a1]"},
	"66B92EDE655B73B402ECD1F4D8CD9C50":{n:"H.E.R.O. (1984) (Activision) (PAL) [a2]"},
	"1D284D6A3F850BAFB25635A12B316F3D":{n:"H.E.R.O. (CCE)"},
	"769DDC995DBB9EDB8167EFCEA9F34A7C":{n:"H.E.R.O. (Genesis)"},
	"BDF1996E2DD64BAF8EFF5511811CA6CA":{n:"H.E.R.O. (Tron)"},
	"98E7CAAAB8EC237558378D2776C66616":{n:"HMOVE Test (Bradford W. Mott) (1998) (PD)"},
	"30516CFBAA1BC3B5335EE53AD811F17A":{n:"Halloween (1983) (Wizard Video Games)"},
	"C450A285DAA7A3B65188C2C3CF04FB3E":{n:"Halloween (1983) (Wizard Video Games) [a]"},
	"54DA3B0B3F43F5B37911C135B9432B49":{n:"Halloween III Revision (Hack)",p:1},
	"4AFA7F377EAE1CAFB4265C68F73F2718":{n:"Halo 2600 (2010) (Ed Fries)"},
	"F16C709DF0A6C52F47FF52B9D95B7D8D":{n:"Hangman (1978) (Atari)"},
	"378C118B3BDA502C73E76190CA089EEF":{n:"Hangman (1978) (Atari) (PAL)"},
	"C3E4AA718F46291311F1CCE53E6CCD79":{n:"Hangman Ghost 4letter (Hack)"},
	"99A24D7BB31D49B720B422550B32C35F":{n:"Hangman Ghost Biglist1 (Hack)"},
	"6AA66E9C3EEA76A0C40EF05513497C40":{n:"Hangman Ghost Biglist2 (Hack)"},
	"A62E3E19280FF958407E05CA0A2D5EC7":{n:"Hangman Ghost Biglist3 (Hack)"},
	"4E37992A37EA36489283F7EB90913BBC":{n:"Hangman Ghost Halloween (Kris) (Hack)"},
	"8E822B39A71C84AC875F0107FB61D6F0":{n:"Hangman Ghost Original Words (Hack)"},
	"9671B658286E276CC4A3D02AA25931D2":{n:"Hangman Ghost Wordlist (Hack)"},
	"502044B1AC111B394E6FBB0D821FCA41":{n:"Hangman Invader 4letter (Hack)"},
	"2C9FADD510509CC7F28F1CCBA931855F":{n:"Hangman Invader Biglist1 (Hack)"},
	"6C658B52D03E01828B9D2D4718A998AC":{n:"Hangman Invader Biglist2 (Hack)"},
	"8A9D953AC3DB52A313A90D6A9B139C76":{n:"Hangman Invader Biglist3 (Hack)"},
	"E8F7679359C4F532F5D5E93AF7D8A985":{n:"Hangman Invader Original Words (Hack)"},
	"8A42E2C7266439D8997A55D0124C912C":{n:"Hangman Invader Wordlist (Hack)"},
	"898748D5EAAC3164B0391A64AE1E0E32":{n:"Hangman Man 4letter (Hack)"},
	"135708B9A7DD20576C1B66AB2A41860D":{n:"Hangman Man Biglist1 (Hack)"},
	"1F562B89D081E36D58E6FC943512EC05":{n:"Hangman Man Biglist2 (Hack)"},
	"5CE98F22ADE915108860424D8DDE0D35":{n:"Hangman Man Biglist3 (Hack)"},
	"227532D82505C3C185A878273C285D5F":{n:"Hangman Man Original Words (Hack)"},
	"4CA90BA45ECED6F5AD560EA8938641B2":{n:"Hangman Man Wordlist (Hack)"},
	"67CF913D1DF0BF2D7AE668060D0B6694":{n:"Hangman Monkey 4letter (Hack)"},
	"1738B2E3F25AB3EEF3CECB95E1D0D957":{n:"Hangman Monkey Biglist1 (Hack)"},
	"205070B6A0D454961DD9196A8E81D877":{n:"Hangman Monkey Biglist2 (Hack)"},
	"DAC38B4DD3DA73BB7B2E9D70C61D2B7C":{n:"Hangman Monkey Biglist3 (Hack)"},
	"30C92C685224DC7A72B9BBE5EB62D004":{n:"Hangman Monkey Original Words (Hack)"},
	"7860716FA5DBC0FFFAB93FB9A4CB4132":{n:"Hangman Monkey Wordlist (Hack)"},
	"CD032AB6764B55438A7B0BFB5E78595A":{n:"Hangman Pac-Man 4letter (Hack)"},
	"0A1B98937911D621B004B1617446D124":{n:"Hangman Pac-Man Biglist1 (Hack)"},
	"DCA941DAB5C6F859B71883B13ADE9744":{n:"Hangman Pac-Man Biglist2 (Hack)"},
	"662ECA7E3D89175BA0802E8E3425DEDB":{n:"Hangman Pac-Man Biglist3 (Hack)"},
	"9BD4E0D5F28BA6DA417C26649171F8E4":{n:"Hangman Pac-Man Original Words (Hack)"},
	"79D4AF56036EC28F298CAD964A2E2494":{n:"Hangman Pac-Man Wordlist (Hack)"},
	"BE1922BD8E09D74DA471287E1E968653":{n:"Hangman Pacman Demo (Cropsy) (Hack)"},
	"A8435EC570141DE5D833C4ABEC499E55":{n:"Happy Birthday Demo (2001) (Dennis Debro) (PD)"},
	"B9232C1DE494875EFE1858FC8390616D":{n:"Harbor Escape (1983) (Panda)"},
	"A34560841E0878C7B14CC65F79F6967D":{n:"Harem (1982) (Multivision)"},
	"F0A6E99F5875891246C3DBECBF2D2CEA":{n:"Haunted House (1982) (Atari)"},
	"09E1ECF9BD2A3030D5670DBA7A65E78D":{n:"Haunted House (1982) (Atari) (PAL)"},
	"06742CF522F23797157F215A1DC8A1A9":{n:"Healthbars (PD)"},
	"260C787E8925BF3649C8AEAE5B97DCC0":{n:"Hell Driver (Thomas Jentzsch)"},
	"E77F332B71F13884C84771E7A121182D":{n:"Hey! Stop! (Jone Yuan)"},
	"FE9AE625D924B54C9F8A14AC9A0F6C6D":{n:"High Bid! (BG Dodson) (Hack)"},
	"8FE00172E7FFF4C1878DABCF11BB8DCE":{n:"Hili Ball (1983) (Quelle) (PAL)",c:1},
	"CD34B3B3EF9E485201E841BA71BEB253":{n:"Hit HMOVE At Various Cycles After WSYNC Test (Bradford W. Mott) (1998) (PD)"},
	"3D48B8B586A09BDBF49F1A016BF4D29A":{n:"Hole Hunter (Video Game Cartridge)"},
	"C52D9BBDC5530E1EF8E8BA7BE692B01E":{n:"Holey Moley (02-29-1984) (Atari) (Prototype)"},
	"0BFABF1E98BDB180643F35F2165995D0":{n:"Home Run (1978) (Atari)"},
	"9F901509F0474BF9760E6EBD80E629CD":{n:"Home Run (1978) (Atari) (4K)"},
	"328949872E454181223A80389D03C122":{n:"Home Run (Unknown) (PAL)"},
	"24B5F4BBDB853ECA38EA0CAE2DFE73A1":{n:"Home Run (Unknown) (PAL) (4K)"},
	"CA7AAEBD861A9EF47967D31C5A6C4555":{n:"Homerun (32 in 1) (1988) (Atari) (PAL)"},
	"63811ED69BDBC35C69D8AA7806C3D6E9":{n:"Homerun (32 in 1) (1988) (Atari) (PAL) (4K)"},
	"F7A651972D78F9BA485B14690452D4BE":{n:"Homestar Runner Demo #2 (2004-03-29)",c:1},
	"6B7A56B6AC2CA4BF9254474BF6ED7D80":{n:"Horizonal Color Bars Demo (PD)"},
	"68449E4AABA677ABCD7CDE4264E02168":{n:"Horizonal Color Bars Demo 2 (PD)"},
	"70A8480CFAF08776E5420365732159D2":{n:"Horizontally Scrolling Playfield Thing (Rob Kudla) (PD)"},
	"78821EF76EBC3934850D1BC1B9E4F4B0":{n:"Hot Action Pak - Ghostbusters, Tennis, Plaque Attack (1990) (HES) (PAL)"},
	"CCD6CE508EEE4B3FCA67212833EDCD85":{n:"Hot Wave (Double-Game Package) (1983) (Quelle) (PAL)"},
	"2DBC92688F9BA92A7E086D62BE9DF79D":{n:"How to Draw a Playfield (1997) (Jim Crawford) (PD)"},
	"D6D5DD8FD322D3CF874E651E7B6C1657":{n:"How to Draw a Playfield (1997) (Nick Bensema) (PD)"},
	"9E904E2EAA471C050C491289B8B80F60":{n:"How to Draw a Playfield II (1997) (Erik Mooney) (PD)"},
	"4A45C6D75B1BA131F94A9C13194D8E46":{n:"How to Draw a Playfield II (Joystick Hack) (1997) (Eric Bacher) (PD)"},
	"7DC03A1F56D0E6A8AAE3E3E50D654A08":{n:"Hozer Video Demo (PD)"},
	"11330EAA5DD2629052FAC37CFE1A0B7D":{n:"Human Cannonball (128-in-1 Junior Console) (PAL)"},
	"C6C63DA3BC2E47291F63280E057061D0":{n:"Human Cannonball (128-in-1 Junior Console) (PAL) (4K)"},
	"7972E5101FA548B952D852DB24AD6060":{n:"Human Cannonball (1979) (Atari)"},
	"FFE51989BA6DA2C6AE5A12D277862E16":{n:"Human Cannonball (1979) (Atari) (4K)"},
	"10A3CD14E5DCFDDE6FF216A14CE7B7DD":{n:"Human Cannonball (1979) (Atari) (PAL)"},
	"AD42E3CA3144E2159E26BE123471BFFC":{n:"Human Cannonball (32 in 1) (1988) (Atari) (PAL)"},
	"4BDAE9246D6EE258C26665512C1C8DE3":{n:"Human Cannonball (32 in 1) (1988) (Atari) (PAL) (4K)"},
	"42DCC02777B0BCFACD85AEB61D33558A":{n:"Human Cannonball (Unknown) (PAL) (4K)"},
	"5BE03A1FE7B2C114725150BE04B38704":{n:"Hunt & Score (1978) (Atari) (PAL)"},
	"B26506FBF411009E5E3F7365F442960E":{n:"Hunt & Score (1978) (Atari) (PAL) (4K)"},
	"102672BBD7E25CD79F4384DD7214C32B":{n:"Hunt & Score - Memory Match (1978) (Atari)"},
	"F4C2E50B01DFF99BDDBE037B3489511C":{n:"Hypnotic (V0.04) (2001) (Inkling) (PD)"},
	"7C9B3B8B25ACF2FE3B8DA834F69629C6":{n:"I Robot (1984) (Atari) (Prototype) [!]"},
	"F6A282374441012B01714E19699FC62A":{n:"I Want My Mommy (1983) (ZiMAG)",c:1},
	"DC33479D66615A3B09670775DE4C2A38":{n:"I.Q. Memory Teaser (Suntek) (PAL)"},
	"2016726DB38AD6A68B4C48BA6FE51557":{n:"INV 2 (Piero Cavina, Erik Mooney)"},
	"9EA8ED9DEC03082973244A080941E58A":{n:"INV+"},
	"AB301D3D7F2F4FE3FDD8A3540B7A74F5":{n:"IQ 180 (Jone Yuan)"},
	"4B9581C3100A1EF05EAC1535D25385AA":{n:"IQ 180 (Unknown)"},
	"A4C08C4994EB9D24FB78BE1793E82E26":{n:"Ice Hockey (1981) (Activision)"},
	"5BCC83677D68F7EF74C1B4A0697BA2A8":{n:"Ice Hockey (1981) (Activision) (16K)"},
	"3EB21313EA5D5764C5ED9160A5A55A83":{n:"Ice Hockey (1981) (Activision) (8K)"},
	"AC9ADBD6DE786A242E19D4BEC527982B":{n:"Ice Hockey (1981) (Activision) (PAL)"},
	"C7D5819B26B480A49EB26AEB63CC831E":{n:"Ice Hockey (4 Game in One Light Green) (1983) (BitCorp) (PAL)"},
	"47711C44723DA5D67047990157DCB5DD":{n:"Ice Hockey (CCE)"},
	"C3AEB796FDAF9429E8CD6AF6346F337E":{n:"If It's Not One Thing It's Another (1997) (Chris Cracknell)"},
	"9A21FBA9EE9794E0FADD7C7EB6BE4E12":{n:"Ikari Warriors (1989) (Atari)"},
	"321C3451129357AF42A375D12AFD4450":{n:"Ikari Warriors (1989) (Atari) (PAL)"},
	"9813B9E4B8A6FD919C86A40C6BDA8C93":{n:"Ikari Warriors (1989) (Atari) (PAL) [a]"},
	"3F251C50AA7237E61A38AB42315EBED4":{n:"Ikari Warriors (1990) (Thomas Jentzsch)"},
	"95E542A7467C94B1E4AB24A3EBE907F1":{n:"Im Schutz der Drachen (1983) (Quelle) (PAL)",c:1},
	"C4BC8C2E130D76346EBF8EB544991B46":{n:"Imagic Selector ROM (1982) (Imagic)"},
	"9B21D8FC78CC4308990D99A4D906EC52":{n:"Immies & Aggies (1983) (CCE)"},
	"75A303FD46AD12457ED8E853016815A0":{n:"Immies & Aggies (1983) (ZiMAG) (Prototype)"},
	"47ABFB993FF14F502F88CF988092E055":{n:"Inca Gold (Zellers)"},
	"F137211537438B1FCE3D811BAEF25457":{n:"Incoming (02-10-2002) (Ben Larson) (PD)"},
	"FE870018332A0221EB59FB18B0C6BCCC":{n:"Incoming (08-11-2002) (Ben Larson) (PD)"},
	"86B4AA76BBEB70E1A4F9211A9880BA8E":{n:"Incoming (1 Player Version) (05-11-2002) (Ben Larson)"},
	"3556E125681AEA864E17B09F3F3B2A75":{n:"Incoming (2 Player Demo) (PD)"},
	"15BCD74F2F1F2A63E1AA93E90D2C0555":{n:"Incoming (22-08-2002) (Ben Larson) (PD)"},
	"03B1051C9374678363C899914412CFC5":{n:"Incoming (30-10-2002) (Ben Larson) (PD)"},
	"76C88341017EAE660EFC6E49C4B6AB40":{n:"Indiana Pitfall (Hack)"},
	"C5301F549D0722049BB0ADD6B10D1E09":{n:"Indy 500 (1977) (Atari)"},
	"08188785E2B8300983529946DBEFF4D2":{n:"Indy 500 (1977) (Atari) (4K)"},
	"DAC762E4D01D445BDEF20B7771F6570E":{n:"Indy 500 (1977) (Atari) (4K) [a]"},
	"81591A221419024060B890665BEB0FB8":{n:"Indy 500 (1977) (Atari) (PAL)"},
	"63166867F75869A3592B7A94EA62D147":{n:"Indy 500 (Hack) [a1]"},
	"30E012E8D50330C8972F126B8E913BC4":{n:"Indy 500 (Hack) [a2]"},
	"4F781F0476493C50DC578336F1132A67":{n:"Indy 500 (Unknown) (PAL) (4K)"},
	"0C7BD935D9A7F2522155E48315F44FA0":{n:"Infernal Tower (1983) (Carrere Video) (PAL)",c:1},
	"AFE88AAE81D99E0947C0CFB687B16251":{n:"Infiltrate (1981) (Apollo)",c:1},
	"3B69F8929373598E1752F43F8DA61AA4":{n:"Infiltrate (1981) (Apollo) (PAL)",c:1},
	"FB5C8AF97BD8FFE88323656F462645A7":{n:"Interlace Demo (Glenn Saunders)",c:1},
	"463E66AD98806A49106CFFA49C08E2ED":{n:"Interlace Game Demo (01-09-2002) (Billy Eno)"},
	"91FDB6541F70C40B16AABF8308123BE8":{n:"Interlacing Game (19-08-2002) (Billy Eno)"},
	"888DEBB162D7D1AE71025B4AB794257F":{n:"Interleaved ChronoColour - Nude Art (17-04-2003) (AD)"},
	"A25BB76E9E773117E567FD4300B1BB23":{n:"Interleaved ChronoColour Demo (NTSC) (05-03-2003) (AD)"},
	"3B097A7ED5BD2A84DC3D3ED361E9C31C":{n:"Interleaved ChronoColour Demo (PAL) (05-03-2003) (AD)"},
	"FB0E84CEE4C108D24253BCB7E382CFFD":{n:"Interleaved ChronoColour Demo (SECAM) (05-03-2003) (AD)"},
	"B4030C38A720DD84B84178B6CE1FC749":{n:"International Soccer (1982) (M Network)"},
	"29630A20D356FB58685B150BFA8F00C3":{n:"International Soccer (1982) (Mattel) [a]"},
	"CE904C0AE58D36D085CD506989116B0B":{n:"International Soccer (1989) (Telegames) (PAL)"},
	"A0185C06297B2818F786D11A3F9E42C3":{n:"International Soccer (Unknown) (PAL)"},
	"ADB770FF70E9ADF08BBB907A7ECCD240":{n:"Inv Demo 3 (2001) (Erik Mooney) (PD)"},
	"E0CF2DCC4C1348C468F5BB1E421C9164":{n:"Invader Sprites in a Line Demo (PD)"},
	"425EE444A41D218598893D6B6E03431A":{n:"Invaders Demo (2001) (TJ)"},
	"46C43FDCBCE8FDE3A91EBEAFC05B7CBD":{n:"Invaders Demo (PAL) (2001) (Eckhard Stolberg)"},
	"CD139AE6D09F3665AD09EB79DA3F9E49":{n:"Invaders by Erik Mooney (4-24-97) (PD)"},
	"8874B68751FD2BA6D3306A263AE57A7D":{n:"Invaders by Erik Mooney (Alpha 1) (PD)"},
	"6D475019EA30D0B29F695E9DCFD8F730":{n:"Invaders by Erik Mooney (Alpha 2) (PD)"},
	"62992392EA651A16AA724A92E4596ED6":{n:"Invaders by Erik Mooney (Beta) (PD)"},
	"4868A81E1B6031ED66ECD60547E6EC85":{n:"Invaders by Erik Mooney (V2.1) (1-3-98) (PD)"},
	"80CEC82239913CB8C4016EB13749DE44":{n:"Invaders from Space by David Marli (Space Invaders Hack)"},
	"850FFD5849C911946B24544EA1E60496":{n:"Invasion (07-10-2002) (CT)"},
	"273CE50DB5A0D6DA7EA827A54F44DEE9":{n:"Island Flyer Demo (PD)"},
	"C2778507B83D9540E9BE5713758FF945":{n:"Island Flyer Demo 2 (PD)"},
	"2F0546C4D238551C7D64D884B618100C":{n:"Ixion (1984) (Sega) (Prototype)"},
	"9C729017DD2F9CCBADCB511187F80E6B":{n:"J-Pac (Hack)"},
	"A5262FE6D01D6A1253692682A47F79DD":{n:"JKH Text Scrolling Demo (PD)"},
	"CE243747BF34A2DE366F846B3F4CA772":{n:"Jacky Jump (1983) (Home Vision) (PAL)"},
	"98EA10C47C13F1B3306C7B13DB304865":{n:"Jam Demo 1 (PD)"},
	"60D304582D33E2957B73EB300A7495BB":{n:"Jam Demo 2 (PD)"},
	"E51030251E440CFFAAB1AC63438B44AE":{n:"James Bond 007 (1983) (Parker Bros)",c:1},
	"04DFB4ACAC1D0909E4C360FD2AC04480":{n:"Jammed (2001) (XYPE) (NTSC)"},
	"BA317F83CDFCD58CBC65AAC1CCB87BC5":{n:"Jammed (2001) (XYPE) [a1]"},
	"911D385EE0805FF5B8F96C5A63DA7DE5":{n:"Jammed (V0.1) (Demo) (2001) (TJ)"},
	"15B498199ED0ED28057BF0DBDCE9B8D8":{n:"Jammed (V0.2) (Demo) (2001) (TJ)"},
	"EF5C02C95A1E7ED24F24193935755CD3":{n:"Jammed Demo (1999) (Hozer Video Games)"},
	"58A82E1DA64A692FD727C25FAEF2ECC9":{n:"Jaw Breaker (1983) (CCE)"},
	"A406D2F6D84E61D842F4CB13B2B1CFA7":{n:"Jawbreaker (1982) (Tigervision) (PAL)"},
	"97327D6962F8C64E6F926F79CD01C6B9":{n:"Jawbreaker (Unknown) (PAL)"},
	"8F33BCE5BA1053DCF4CEA9C1C69981E4":{n:"Jawbreaker (Unknown) (PAL) [a]"},
	"EB4252FAFF7A4F2BA5284A98B8F78D1A":{n:"John K Harvey's Equalizer (NTSC) (PD)",c:1},
	"30997031B668E37168D4D0E299CCC46F":{n:"John K Harvey's Equalizer (PAL) (PD)",c:1},
	"4FC1B85B8074B4B9436D097900E34F29":{n:"John K. Harvey's Equalizer (John K. Harvey)",c:1},
	"E39843C56B7A4A08B18FA7949EC3EE6B":{n:"Joshua Invaders (Hack)"},
	"718AE62C70AF4E5FD8E932FEE216948A":{n:"Journey Escape (1982) (Data Age)",c:1},
	"6B4EB5B3DF80995B8D9117CB7E9AEB3C":{n:"Journey Escape (1983) (Gameworld) (PAL)",c:1},
	"B2D3BCEE001CFF2BD2D8A21B2CB55109":{n:"Joust (08-09-1983) (Atari) (Prototype)",c:1},
	"3276C777CBE97CDD2B4A63FFC16B7151":{n:"Joust (1983) (Atari)",c:1},
	"640A08E9CA019172D612DF22A9190AFB":{n:"Joust (1983) (Atari) (PAL)",c:1},
	"17EE158D15E4A34F57A837BC1CE2B0CE":{n:"Joust (1983) (Atari) (PAL) [a]",c:1},
	"22319BE7A640AF5314EC3C482CCEB676":{n:"Joustpong (05-07-2002) (Kirk Israel) (PD)"},
	"706E3CC4931F984447213B92D1417AFF":{n:"Joustpong (06-07-2002) (Kirk Israel) (PD)"},
	"94102FEBC53B4A78342D11B645342ED4":{n:"Joustpong (14-07-2002) (Kirk Israel) (PD)"},
	"814210C0E121F7DBC25661B93C06311C":{n:"Joustpong (16-09-2002) (Kirk Israel) (PD)"},
	"C225ABFB584960EFE1F359FC94B73379":{n:"Joustpong (21-09-2002) (Kirk Israel) (PD)"},
	"36C29CEEE2C151B23A1AD7AA04BD529D":{n:"Jr. Pac-Man (1984) (Atari)"},
	"297C405AFD01F3AC48CDB67B00D273FE":{n:"Jr. Pac-Man (1984) (Atari) (PAL)"},
	"25265D0E7F88B3026003809F25EE025E":{n:"Jr. Pac-Man (1984) (Atari) [a]"},
	"161DED4A85D3C78E44FFFD40426F537F":{n:"JtzBall (Alpha) (TJ)"},
	"80E1410EC98089E0733CC09E584DBA4B":{n:"Jumping Jack (1983) (Dynamics) (PAL)"},
	"2CCCC079C15E9AF94246F867FFC7E9BF":{n:"Jungle Fever (1982) (PlayAround)",c:1},
	"FD16949913AAAB5BEAEFED73BF2CA67C":{n:"Jungle Hunt (02-03-1983) (Atari) (Prototype)"},
	"0EC93F519BB769E0D9F80E61F6CC8023":{n:"Jungle Hunt (02-25-1983) (Atari) (Prototype)"},
	"2BB9F4686F7E08C5FCC69EC1A1C66FE7":{n:"Jungle Hunt (1983) (Atari)"},
	"9FC2D1627DCDD8925F4C042E38EB0BC9":{n:"Jungle Hunt (1983) (Atari) (PAL)"},
	"C47244F5557AE12C61E8E01C140E2173":{n:"Jungle Hunt (1983) (Atari) (PAL) [a1]"},
	"2DCF9CE486393CD36CA0928CD53B96CB":{n:"Jungle Hunt (1983) (Atari) (PAL) [a2]"},
	"88A6C9C88CB329EE5FA7D168BD6C7C63":{n:"Jungle Hunt (1983) (CCE)"},
	"2496D404BFC561A40A80BEA6A69695C3":{n:"Jungle Hunt (1983) (CCE) [a]"},
	"000509D1ED2B8D30A9D94BE1B3B5FEBB":{n:"Jungle Jane (2003) (Greg Zumwalt) (Hack)"},
	"E1D5C8213E82820128FA9C4775F1E166":{n:"Jungle King (2003) (Jess Ragan) (Hack)"},
	"65917AE29A8C9785BB1F2ACB0D6AAFD0":{n:"Junkosoft One Year Demo (1999) (PD)"},
	"90B647BFB6B18AF35FCF613573AD2EEC":{n:"Juno First (2009)",c:1},
	"FA98D48CD609C9BABC819E0A1BD8D598":{n:"Juno First (2009) (PAL60)",c:1},
	"72A5B5052272AC785FA076709D16CEF4":{n:"KC Munckin (29-01-2003) (J. Parlee)"},
	"B9D1E3BE30B131324482345959AED5E5":{n:"Kabobber (07-25-1983) (Activision) (Prototype)"},
	"5428CDFADA281C569C74C7308C7F2C26":{n:"Kaboom! (1981) (Activision)",p:1},
	"E14DC36B24FE22C04FA076E298F2E15F":{n:"Kaboom! (1981) (Activision) (16K)",p:1},
	"AF6AB88D3D7C7417DB2B3B3C70B0DA0A":{n:"Kaboom! (1981) (Activision) (4K)",p:1},
	"ED8F319E82D355832195EB7715644795":{n:"Kaboom! (1981) (Activision) (8K)",p:1},
	"F9E99596345A84358BC5D1FBE877134B":{n:"Kaboom! (1981) (Activision) (PAL)",p:1},
	"B09B79C9628878BE051E89F7F1E77378":{n:"Kaboom! (1981) (Activision) (PAL) (4K)",p:1},
	"DBDAF82F4F0C415A94D1030271A9EF44":{n:"Kaboom! (CCE)",p:1},
	"E49AC0EC879A0D7820BC2598FC2CFCD4":{n:"Kaboom! (CCE) (4K)",p:1},
	"A93E8EA1F565C3C1E86B708CF0DC2FA9":{n:"Kabul! (Jess Ragan) (Hack)",p:1},
	"7B43C32E3D4FF5932F39AFCB4C551627":{n:"Kamikaze Saucers (1983) (Syncro) (Prototype)"},
	"73AA02458B413091AC940C0489301710":{n:"Kampf dem Steinfresser (1983) (Quelle) (PAL)"},
	"4326EDB70FF20D0EE5BA58FA5CB09D60":{n:"Kangaroo (1983) (Atari)"},
	"6FE67F525C39200A798985E419431805":{n:"Kangaroo (1983) (Atari) (PAL)"},
	"DD08E18CFEE87A0E7FC19A684B36E124":{n:"Kangaroo (1983) (Atari) (PAL) [a]"},
	"4431428A7500C96FC0E2798A5DBD36D6":{n:"Kangaroo (Genesis)"},
	"6D8A04EE15951480CB7C466E5951EEE0":{n:"Kanguru (1983) (Zirok)"},
	"10EAE73A07B3DA044B72473D8D366267":{n:"Karate (1982) (Funvision) (PAL)"},
	"CEDBD67D1FF321C996051EEC843F8716":{n:"Karate (1982) (Ultravision)"},
	"DD17711A30AD60109C8BEACE0D4A76E8":{n:"Karate (Unknown) (PAL)"},
	"65BA1A4C643D1AB44481BDDDEB403827":{n:"Katastrophen-Einsatz (1983) (Quelle) (PAL)"},
	"A1770EF47146AB7B12E2C4BECCD68806":{n:"Kaystone Kapers (1983) (Digitel)"},
	"810D8952AF5A6036FCA8D0C4E1B23DB6":{n:"Keystone (Tiger Vision)"},
	"BE929419902E21BD7830A7A7D746195D":{n:"Keystone Kapers (1983) (Activision)"},
	"6C1F3F2E359DBF55DF462CCBCDD2F6BF":{n:"Keystone Kapers (1983) (Activision) (PAL)"},
	"BEDFBDE71FB606601F936B5B057F26F7":{n:"Keystone Kapers (1983) (Activision) (PAL) (16K)"},
	"91925ABCE3A29E33B6A8B81482F4F5AF":{n:"Keystone Kapers (1983) (Activision) (PAL) (8K)"},
	"1351C67B42770C1BD758C3E42F553FEA":{n:"Keystone Kapers (Digivision)"},
	"F5A3E051730D45FEA518F2E8B926565B":{n:"Keystone Kapers (Robby)"},
	"E558BE88EEF569F33716E8E330D2F5BC":{n:"Keystone Kapers (Shock Vision)"},
	"8DB152458ABAEF3CFA7A4E420DDBDA59":{n:"Keystone Kapers (Unknown)"},
	"05AEDF04803C43EB5E09DFD098D3FD01":{n:"Keystone Kapers (Unknown) (PAL)"},
	"4FBE0F10A6327A76F83F83958C3CBEFF":{n:"Keystone Kappers (1983) (CCE)"},
	"E28113D10C0C14CC3B5F430B0D142FCB":{n:"Keystone Kappers (1983) (CCE) [a]"},
	"7187118674FF3C0BB932E049D9DBB379":{n:"Keystone Keypers (1983) (Zirok)"},
	"7A7F6AB9215A3A6B5940B8737F116359":{n:"Killer Satellites (1983) (Arcadia)"},
	"75E276BA12DC4504659481C31345703A":{n:"Killer Satellites (1983) (Arcadia) (PAL)"},
	"C0A68837C60E15D1FC5A40C9A62894BC":{n:"Killer Satellites (1983) (Arcadia) (Prototype)"},
	"9C27EF3BD01C611CDB80182A59463A82":{n:"Killer Satellites (1983) (Arcadia) [a]"},
	"05CCF96247AF12EEF59698F1A060A54F":{n:"King Arthur (1983) (Quelle) (PAL)"},
	"E21EE3541EBD2C23E817FFB449939C37":{n:"King Kong (1982) (Tigervision)"},
	"0DD4C69B5F9A7AE96A7A08329496779A":{n:"King Kong (1982) (Tigervision) (PAL)"},
	"0B1056F1091CFDC5EB0E2301F47AC6C3":{n:"King Kong (1982) (Tigervision) (PAL) [a]"},
	"E4D41F2D59A56A9D917038682B8E0B8C":{n:"Kiss Meets Pacman (Cody Pittman) (Hack)"},
	"B5EFE0271D2214E4D5DC798881486884":{n:"Klax (06-14-1990) (Atari) (Prototype)"},
	"2C29182EDF0965A7F56FE0897D2F84BA":{n:"Klax (08-18-1990) (Atari) (Prototype)"},
	"EED9EAF1A0B6A2B9BC4C8032CB43E3FB":{n:"Klax (1990) (Atari) (PAL)"},
	"7FCD1766DE75C614A3CCC31B25DD5B7A":{n:"Knight on the Town (1982) (PlayAround)",c:1},
	"ED0451010D022B96A464FEBCBA70B9C4":{n:"Knight on the Town (1982) (PlayAround) (PAL)",c:1},
	"A2EB84CFEED55ACD7FECE7FEFDC83FBB":{n:"Kool Aid Man (Fixed) (15-11-2002) (CT)"},
	"2C8C11295D8613F875B7BCF5253AB9BB":{n:"Kool Aid Man (PAL Conversion) (16-11-2002) (Fabrizio Zavagli) (PAL60)"},
	"534E23210DD1993C828D944C6AC4D9FB":{n:"Kool-Aid Man (1983) (M Network)"},
	"071F84D10B343C7C05CE3E32AF631687":{n:"Krieg der Sterne (Ariola) (PAL)"},
	"CC724EBE74A109E39C0B2784DDC980CA":{n:"Krull (05-27-1983) (Atari) (Prototype)"},
	"4BAADA22435320D185C95B7DD2BCDB24":{n:"Krull (1983) (Atari)"},
	"00DC28B881989C39A6CF87A892BD3C6B":{n:"Krull (CCE)"},
	"6805734A0B7BCC8925D9305B071BF147":{n:"Kung Fu (4 Game in One Dark Green) (1983) (BitCorp) (PAL)"},
	"0B4E793C9425175498F5A65A3E960086":{n:"Kung Fu Master (CCE)"},
	"A9E3C23599C0D77151602F8E31DAF879":{n:"Kung Fu Master (Genesis)"},
	"A8101CB667E50A46165C6FB48C608B6B":{n:"Kung Fu Sprite Demo (PD)",c:1},
	"CE89529D6E98A13DDF3D84827BBDFE68":{n:"Kung Fu Sprite Demo 2 (PD)",c:1},
	"3F58F972276D1E4E0E09582521ED7A5B":{n:"Kung Fu Superkicks (1989) (Telegames)"},
	"E5D72FF8BAB4450BE57785CC9E83F3C0":{n:"Kung Fu Superkicks (1989) (Telegames) (PAL)"},
	"5B92A93B23523FF16E2789B820E2A4C5":{n:"Kung-Fu Master (1987) (Activision)"},
	"4474B3AD3BF6AABE719A2D7F1D1FB4CC":{n:"Kung-Fu Master (1987) (Activision) (PAL)"},
	"9945A22F60BBAF6D04A8D73B3CF3DB75":{n:"Kung-Fu Master (1987) (Activision) (PAL) [a]"},
	"7AD782952E5147B88B65A25CADCDF9E0":{n:"Kwibble (1983) (Imagic) (Prototype)"},
	"B86552198F52CFCE721BAFB496363099":{n:"Kyphus (1982) (Apollo) (Prototype)"},
	"0FBF618BE43D4396856D4244126FE7DC":{n:"Labyrinth (1983) (Quelle) (PAL)"},
	"01F584BF67B0E464014A8C8B5EA470E3":{n:"Labyrinth (Escape from the Mindmaster Beta) (1982) (Arcadia)"},
	"710497DF2CAAB69CDCC45E919C69E13F":{n:"Labyrinth (Escape from the Mindmaster Beta) (1982) (Arcadia) [a]"},
	"ADFBD2E8A38F96E03751717F7422851D":{n:"Lady Bug (NTSC)",c:1},
	"F1489E27A4539A0C6C8529262F9F7E18":{n:"Lady Bug (PAL60)",c:1},
	"95A89D1BF767D7CC9D0D5093D579BA61":{n:"Lady in Wading (1982) (PlayAround)",c:1},
	"EC407A206B718A0A9F69B03E920A0185":{n:"Landung in der Normandie (1983) (Quelle) (PAL)"},
	"B7345220A0C587F3B0C47AF33EBE533C":{n:"Landungskommando (1983) (Quelle) (PAL)"},
	"85564DD0665AA0A1359037AEF1A48D58":{n:"Laser Base (1983) (ITT Family Games) (PAL) [a]",c:1},
	"8C103A79B007A2FD5AF602334937B4E1":{n:"Laser Base (Thomas Jentzsch)"},
	"D2C8E6AA8172B16C8AA9AAE739AC9C5E":{n:"Laser Blast (08-08-1980) (Activision) (Prototype)"},
	"931B91A8EA2D39FE4DCA1A23832B591A":{n:"Laser Blast (1981) (Activision)"},
	"9EC1B259A1BCFFA63042A3C2B3B90F0A":{n:"Laser Blast (1981) (Activision) (16K)"},
	"D5E27051512C1E7445A9BF91501BDA09":{n:"Laser Blast (1981) (Activision) (4K)"},
	"F6676E3FE901EB8515FC7AE310302C3C":{n:"Laser Blast (1981) (Activision) (8K)"},
	"8A8E401369E2B63A13E18A4D685387C6":{n:"Laser Blast (1981) (Activision) (PAL)"},
	"F7F50D9C9D28BCC9F7D3075668B7AC89":{n:"Laser Blast (1981) (Activision) (PAL) (4K)"},
	"0D1B3ABF681A2FC9A6AA31A9B0E8B445":{n:"Laser Blast (32 in 1) (1988) (Atari) (PAL)"},
	"303242C239474F2D7763B843DE58C1C3":{n:"Laser Blast (CCE)"},
	"F9420173EFCB4B9F2B01C2A7B595CCA7":{n:"Laser Blast (CCE) (4K)"},
	"D078674AFDF24A4547B4B32890FDC614":{n:"Laser Blast (Jone Yuan)"},
	"3F6938AA6CE66E6F42E582C1EB19B18C":{n:"Laser Blast (Jone Yuan) (4K) (Hack)"},
	"91B007F33F9B790BE64F57220EC52E80":{n:"Laser Blast (Jone Yuan) (Hack)"},
	"D339B95F273F8C3550DC4DAA67A4AA94":{n:"Laser Blast (Unknown) (PAL) (4K)"},
	"0277C449FAE63F6F1C8F94DEDFCF0058":{n:"Laser Demo (B. Watson)"},
	"68760B82FC5DCF3FEDF84376A4944BF9":{n:"Laser Gate (1983) (CCE)"},
	"CD4DED1EDE63C4DD09F3DD01BDA7458C":{n:"Laser Gate (Future Video Games) (PAL)"},
	"1FA58679D4A39052BD9DB059E8CDA4AD":{n:"Laser Gates (1983) (Imagic)"},
	"8E4CD60D93FCDE8065C1A2B972A26377":{n:"Laser Gates (1983) (Imagic) (PAL)"},
	"48287A9323A0AE6AB15E671AC2A87598":{n:"Laser Volley (Zellers)"},
	"1FAB68FD67FE5A86B2C0A9227A59BB95":{n:"Lasercade (1983) (20th Century Fox) (Prototype)"},
	"19098C46DA0640F2B5763167DEA6C716":{n:"Laseresal 2002 (NTSC) (PD)"},
	"F9655ED51462ECFC690C7B97CEC649F9":{n:"Laseresal 2002 (PAL) (PD)"},
	"02DCBA28C614FEC7CA25955327128ABB":{n:"Laseresal 2002 (PAL) (PD) [a]"},
	"9C6FD6ED3599978AB7B6F900484B9BE6":{n:"Laseresal 2002 (PAL60) (PD)"},
	"FABCA526D57DE46768B392F758F1A008":{n:"Laseresal 2600 (16-12-2001) (Andrew Wallace) (PD)"},
	"31E518DEBBA46DF6226B535FA8BD2543":{n:"Last Starfighter (1984) (Atari) (Prototype)"},
	"BB579404924C40CA378B4AFF6CCF302D":{n:"Lightbulb Lightens, The (PD) (Non Functional)"},
	"D0CDAFCB000B9AE04AC465F17788AD11":{n:"Lilly Adventure (1983) (Quelle) (PAL)"},
	"3947EB7305B0C904256CDBC5C5956C0F":{n:"Lilly Adventure (Jone Yuan)"},
	"64D43859258DC8CA54949E9FF4174202":{n:"Lilly Adventure (Thomas Jentzsch)"},
	"FE0B7F27E3AD50BBF9FF468EE56D553D":{n:"Lines Demo (Eckhard Stolberg) (PAL) (PD)"},
	"86128001E69AB049937F265911CE7E8A":{n:"Lochjaw (1981) (Apollo)"},
	"71464C54DA46ADAE9447926FDBFC1ABE":{n:"Lock 'n' Chase (1982) (M Network)"},
	"493E90602A4434B117C91C95E73828D1":{n:"Lock 'n' Chase (1989) (Telegames) (PAL)"},
	"E88340F5BD2F03E2E9CE5ECFA9C644F5":{n:"Lock 'n' Chase (Unknown) (PAL)"},
	"B4E2FD27D3180F0F4EB1065AFC0D7FC9":{n:"London Blitz (1983) (Avalon Hill)"},
	"5BABE0CAD3EC99D76B0AA1D36A695D2F":{n:"Looping (1983) (Coleco) (Prototype)"},
	"E24D7D879281FFEC0641E9C3F52E505A":{n:"Lord of the Rings (1983) (Parker Bros) (Prototype)"},
	"C6D7FE7A46DC46F962FE8413C6F53FC9":{n:"Lord of the Rings (1983) (Parker Bros) (Prototype) [a]"},
	"DAEF7D8E5A09981C4AA81573D4DBB380":{n:"Lord of the Rings (Adam Thornton) (Hack)",c:1},
	"E4B12DEAAFD1DBF5AC31AFE4B8E9C233":{n:"Lord of the Rings (Adam Thornton) (Hack) [a]",c:1},
	"7C00E7A205D3FDA98EB20DA7C9C50A55":{n:"Lost Luggage (1981) (Apollo)"},
	"D0B26E908370683AD99BC6B52137A784":{n:"Lost Luggage (1981) (Apollo) (PAL)"},
	"2D76C5D1AAD506442B9E9FB67765E051":{n:"Lost Luggage (1981) (Apollo) [no opening scene]"},
	"DF5CC5CCCDC140EB7107F5B8ADFACDA1":{n:"Lumberman (Cracker Jack) (Hack)"},
	"97D0151BEB84ACBE82AA6DB18CD91B98":{n:"Lunar Attack (2002) (Steve Engelhardt) (Hack)"},
	"393E41CA8BDD35B52BF6256A968A9B89":{n:"M.A.D. (1982) (U.S. Games)"},
	"090F0A7EF8A3F885048D213FAA59B2F8":{n:"M.A.D. (1983) (Carrere Video) (PAL)"},
	"835759FF95C2CDC2324D7C1E7C5FA237":{n:"M.A.S.H (1983) (20th Century Fox)"},
	"43C6CFFFEDDAB6B3787357FED9D44529":{n:"M.A.S.H (1983) (20th Century Fox) (PAL)"},
	"E97EAFD0635651D3999CECE953C06BD5":{n:"M.A.S.H (208 in 1) (Unknown) (PAL)"},
	"9193B6FFF6897D43274741D4F9855B6D":{n:"M.A.S.H (Unknown) (PAL) (Hack)"},
	"CF63FFAC9DA89EF09C6C973083061A47":{n:"MASH (1983) (CCE)"},
	"1423F560062C4F3C669D55891A2BCBE7":{n:"MASH (1983) (CCE) [a]"},
	"E9BE3E8E4A7E73DD63ED4235A3A1A25F":{n:"MMetall (Hack)"},
	"47AAD247CCE2534FD70C412CB483C7E0":{n:"Mafia (Rainbow Vision) (PAL)"},
	"CDDABFD68363A76CD30BEE4E8094C646":{n:"MagiCard (1981) (CommaVid)"},
	"7DA9DE8D62FCDD3A2C545B2E720C2A61":{n:"MagiCard (1981) (CommaVid) (4K)"},
	"CCB5FA954FB76F09CAAE9A8C66462190":{n:"Malagai (1983) (Answer Software)",c:1},
	"402D876EC4A73F9E3133F8F7F7992A1E":{n:"Man Goes Down (2006) (A. Herbert) (Prototype)"},
	"54A1C1255ED45EB8F71414DADB1CF669":{n:"Mangia' (1983) (Spectravideo)"},
	"D8295EFF5DCC43360AFA87221EA6021F":{n:"Mangia' (1983) (Spectravideo) (PAL)"},
	"E4C2077A18E3C27F4819AA7757903AA0":{n:"Many Blue Bars Demo (PD)"},
	"CEF01595000627EE50863D4290372C27":{n:"Many Blue Bars and Text Demo (PD)"},
	"163E7E757E2DC44469123FF0E5DAEC5E":{n:"Many Blue Bars and Text Demo 2 (PD)"},
	"F032B2F2D8323404A6B4541F92DD1825":{n:"Many Blue Bars and Text Demo 3 (PD)"},
	"EF60B06FDDB675B0D783AFBFA5FC5232":{n:"Many Blue Bars and Text Demo 4 (PD)"},
	"13895EF15610AF0D0F89D588F376B3FE":{n:"Marauder (1982) (Tigervision)"},
	"512E874A240731D7378586A05F28AEC6":{n:"Marauder (1982) (Tigervision) (PAL)"},
	"CC03C68B8348B62331964D7A3DBEC381":{n:"Marauder (Jone Yuan)"},
	"319A142AAB6260842AB616382848C204":{n:"Marble Craze (05-02-2002) (Paul Slocum)"},
	"F777444FC21A5925E066B68B1D350575":{n:"Marble Craze (Kernel Works) (Paul Slocum)"},
	"F2E4FB2D3600C0F76D05864E658CC57B":{n:"Marble Craze (Kernel) (17-02-2002) (Paul Slocum)"},
	"89A65B83203980D5D4D60F52A584A5B8":{n:"Marble Craze (PAL) (02-02-2003) (Paul Slocum)"},
	"21B09C40295C2D7074A83AE040F22EDF":{n:"Marble Craze (V0.90) (Easy Version) (Paul Slocum)"},
	"097074F24CDE141FE6A0F26A10333265":{n:"Marble Craze (V0.90) (Paul Slocum)"},
	"34B269387FA1AA5A396636F5ECDD63DD":{n:"Marble Craze (mc7_23) (Paul Slocum)"},
	"CD9FEA12051E414A6DFE17052067DA8E":{n:"Marble Craze Demo (PD)"},
	"966B11D3C147D894DD9E4EBB971EA309":{n:"Marble Craze Song (Paul Slocum) (PD)"},
	"6141C095D0AEE4E734BEBFAAC939030A":{n:"Mariana (Rainbow Vision) (PAL)"},
	"EE84BDC5DAE268E227E407C7B5E6B6B7":{n:"Marilyn Monroe Demo (PD)"},
	"CADE123747426DF69570A2BC871D3BAF":{n:"Marine Wars (1983) (Gakken) (PAL)"},
	"B00E8217633E870BF39D948662A52AAC":{n:"Marine Wars (1983) (Konami)"},
	"1B8D35D93697450EA26EBF7FF17BD4D1":{n:"Marineflieger (1983) (Quelle) (PAL)"},
	"E908611D99890733BE31733A979C62D8":{n:"Mario Bros. (1983) (Atari)"},
	"C49FE437800AD7FD9302F3A90A38FB7D":{n:"Mario Bros. (1983) (Atari) (PAL)"},
	"2A9F9001540C55A302BEFD8E9D54B47B":{n:"Mario Bros. (1983) (Atari) (PAL) [a]"},
	"9A165C39AF3F050FDEE6583FDFCDC9BE":{n:"Mario Bros. (Zirok)"},
	"B1D1E083DC9E7D9A5DC1627869D2ADE7":{n:"Mario's Bros. (1983) (CCE)"},
	"C446288FE62C0C2737639FD788AE4A21":{n:"Mark's Sound Demo (PD)",c:1},
	"B2F0D7217147160B2F481954CEDF814B":{n:"Marquee Drawer (2001) (B. Watson)",c:1},
	"B1486E12DE717013376447AC6F7F3A80":{n:"Marspatrouille (1983) (Quelle) (PAL)"},
	"36E47ED74968C365121EAB60F48C6517":{n:"Master Builder (1983) (Quelle) (PAL)"},
	"AE4BE3A36B285C1A1DFF202157E2155D":{n:"Master Builder (1983) (Spectravideo)"},
	"3B76242691730B2DD22EC0CEAB351BC6":{n:"Masters of the Universe (1983) (M Network)",c:1},
	"470878B9917EA0348D64B5750AF149AA":{n:"Math Gran Prix (1982) (Atari)"},
	"45BEEF9DA1A7E45F37F3F445F769A0B3":{n:"Math Gran Prix (1982) (Atari) (PAL)"},
	"7996B8D07462A19259BAA4C811C2B4B4":{n:"Math Gran Prix (208 in 1) (Unknown) (PAL)"},
	"5E2495D43B981010304AF55EFED1E798":{n:"Math Gran Prix (Jone Yuan)"},
	"244C6DE27FAFF527886FC7699A41C3BE":{n:"Matt Demo (PD)"},
	"DDD1EFC1862CD3EB3BAF4CBA81FF5050":{n:"Max3 (2001) (Maxime Beauvais) (PD)"},
	"AE83541CF4A4C0BCE0ADCCD2C1BF6288":{n:"Maze 003 Demo (PD)"},
	"F825C538481F9A7A46D1E9BC06200AAF":{n:"Maze Craze (1980) (Atari)"},
	"ED2218B3075D15EAA34E3356025CCCA3":{n:"Maze Craze (1980) (Atari) (PAL)"},
	"8108AD2679BD055AFEC0A35A1DCA46A4":{n:"Maze Craze (Unknown)"},
	"69EBF910AB9B63E5B8345F016095003B":{n:"Maze Demo 1 (PD)"},
	"F9DE91D868D6EBFB0076AF9063D7195E":{n:"Maze Demo 2 (PD)"},
	"35B43B54E83403BB3D71F519739A9549":{n:"McDonald's (06-06-1983) (Parker Bros) (Prototype)"},
	"F7FAC15CF54B55C5597718B6742DBEC2":{n:"Medieval Mayhem (NTSC)",p:1},
	"D00F6F8BA89559E4B20972A478FC0370":{n:"Medieval Mayhem (PAL)",p:1},
	"DAEB54957875C50198A7E616F9CC8144":{n:"Mega Force (1982) (20th Century Fox)"},
	"ECF51385384B468834611D44A8429C03":{n:"Mega Force (1982) (20th Century Fox) (PAL)"},
	"BDBAEFF1F7132358EA64C7BE9E46C1AC":{n:"Mega Force (1982) (20th Century Fox) (PAL) [a]"},
	"E37C8055D70979AF354251EBE9F1B7DD":{n:"Mega Funpak - Gorf, P. Patrol, Pacman, Skeet Shoot (HES) (PAL)"},
	"28A2BEA8F84936CB2E063F857414CDA0":{n:"Mega Mania Raid (1999) (Thiago Paiva) (Hack)"},
	"B65D4A38D6047735824EE99684F3515E":{n:"MegaBoy (Dynacom)"},
	"318A9D6DDA791268DF92D72679914AC3":{n:"MegaMania (1982) (Activision)"},
	"A35D47898B2B16EC641D1DFA8A45C2B7":{n:"MegaMania (1982) (Activision) (16K)"},
	"D45BF71871B196022829AA3B96BFCFD4":{n:"MegaMania (1982) (Activision) (8K)"},
	"3D934BB980E2E63E1EAD3E7756928CCD":{n:"MegaMania (1982) (Activision) (PAL)"},
	"6604F72A966CA6B2DF6A94EE4A68EB82":{n:"MegaMania (208 in 1) (Unknown) (PAL)"},
	"049626CBFB1A5F7A5DC885A0C4BB758E":{n:"MegaMania (Unknown) (PAL)"},
	"FC92D74F073A44BC6E46A3B3FA8256A2":{n:"Megademo (19xx) (PD)"},
	"6BB22EFA892B89B69B9BF5EA547E62B8":{n:"Megamania (1982) (Dynacom)"},
	"D5618464DBDC2981F6AA8B955828EEB4":{n:"Megamania (1983) (CCE)"},
	"12937DB3D4A80DA5C4452B752891252D":{n:"Megamania (1983) (Digitel)"},
	"1E0EF01E330E5B91387F75F700CCAF8F":{n:"Mein Weg (1983) (Quelle) (PAL)"},
	"96E798995AF6ED9D8601166D4350F276":{n:"Meltdown (1983) (20th Century Fox) (Prototype)"},
	"50568C80AC61CAB789D9923C9B05B68E":{n:"Merlin's Walls - Standard Edition (1999) (Ebivision)"},
	"8FBABAA87941CDF3A377C15E95BDB0F3":{n:"Meteor Smasher (SnailSoft)"},
	"08BF437D012DB07B05FF57A0C745C49E":{n:"Meteoroids (1982) (Arcadia) (Prototype)",c:1},
	"F1554569321DC933C87981CF5C239C43":{n:"Midnight Magic (1984) (Atari)",c:1},
	"DA732C57697AD7D7AF414998FA527E75":{n:"Midnight Magic (1984) (Atari) (PAL)",c:1},
	"C47B7389E76974FD0DE3F088FEA35576":{n:"Mighty Mouse (Funvision)"},
	"0BF19E40D5CD8AA5AFB33B16569313E6":{n:"Millipede (01-04-1984) (Atari) (Prototype)"},
	"3C57748C8286CF9E821ECD064F21AAA9":{n:"Millipede (1984) (Atari)"},
	"A7673809068062106DB8E9D10B56A5B3":{n:"Millipede (1984) (Atari) (PAL)"},
	"11BCF5C752088B5AAF86D6C7A6A11E8D":{n:"Millipede (1984) (Atari) (Prototype)"},
	"EFD387430A35A659FF569A9A0EC22209":{n:"Millipede (1984) (Atari) (Prototype) (PAL)"},
	"0E224EA74310DA4E7E2103400EB1B4BF":{n:"Mind Maze (10-10-1984) (Atari) (Prototype)"},
	"FA0570561AA80896F0EAD05C46351389":{n:"Miner 2049er (1982) (Tigervision)"},
	"C517144E3D3AC5C06F2F682EBF212DD7":{n:"Miner 2049er (1982) (Tigervision) (PAL)"},
	"598A4E6E12F8238B7E7555F5A7777B46":{n:"Miner 2049er (1982) (Tigervision) (Prototype)"},
	"3B040ED7D1EF8ACB4EFDEEBEBDAA2052":{n:"Miner 2049er (1982) (Tigervision) [fixed]"},
	"2A1B454A5C3832B0240111E7FD73DE8A":{n:"Miner 2049er Volume II (1983) (Tigervision)",c:1},
	"468F2DEC984F3D4114EA84F05EDF82B6":{n:"Miner 2049er Volume II (1983) (Tigervision) (PAL)",c:1},
	"4543B7691914DFD69C3755A5287A95E1":{n:"Mines of Minos (1982) (CommaVid)",c:1},
	"B5CB9CF6E668EA3F4CC2BE00EA70EC3C":{n:"Mines of Minos (1982) (CommaVid) (PAL)",c:1},
	"73CB1F1666F3FD30B52B4F3D760C928F":{n:"Mines of Minos (Unknown) (PAL)",c:1},
	"635CC7A0DB33773959D739D04EFF96C2":{n:"Minesweeper (V.90) (Soren Gust) (PD)"},
	"AC5F78BAE0638CF3F2A0C8D07EB4DF69":{n:"Minesweeper (V.99) (Soren Gust) (PD)"},
	"2982E655DFFC89D218A0A3072CFC6811":{n:"Mini Golf 812631 (Hack)"},
	"DF62A658496AC98A3AA4A6EE5719C251":{n:"Miniature Golf (1979) (Atari)"},
	"384DB97670817103DD8C0BBDEF132445":{n:"Miniature Golf (1979) (Atari) (4K)"},
	"ED5CCFC93AD4561075436EE42A15438A":{n:"Miniature Golf (1979) (Atari) (PAL)"},
	"8B8152D6081F31365406CB716BD95567":{n:"Miniature Golf (1979) (Atari) (PAL) (4K)"},
	"4F82D8D78099DD71E8E169646E799D05":{n:"Miniature Golf (Unknown) (PAL) (4K)"},
	"73521C6B9FED6A243D9B7B161A0FB793":{n:"Miniaturer Golf (32 in 1) (1988) (Atari) (PAL)"},
	"6979F30204149BE3E227558CFFE21C1D":{n:"Miniaturer Golf (32 in 1) (1988) (Atari) (PAL) (4K)"},
	"391764720140C432AEC454A468F77A40":{n:"Miss Pack Man (Video Game Program) (PAL)"},
	"4181087389A79C7F59611FB51C263137":{n:"Miss Piggy's Wedding (06-24-1983) (Atari) (Prototype) (8K)"},
	"855A42078B14714BCFD490D2CF57E68D":{n:"Miss Piggy's Wedding (1983) (Atari) (Prototype)"},
	"25E73EFB9A6EDF119114718BD2F646BA":{n:"Miss Piggy's Wedding (1983) (Atari) (Prototype) [a]"},
	"3A2E2D0C6892AA14544083DFB7762782":{n:"Missile Command (1981) (Atari)",l:"missile command",c:1},
	"9364AD51C321E0F15C96A8C0AFF47CEB":{n:"Missile Command (1981) (Atari) (PAL)",l:"missile command",c:1},
	"1A8204A2BCD793F539168773D9AD6230":{n:"Missile Command (1981) (Atari) [no initials]",l:"missile command"},
	"94E7CC6342D11E508E7E8B2DDF53C255":{n:"Missile Command (208 in 1) (Unknown) (PAL) (Hack)"},
	"8D1E2A6D2885966E6D86717180938F87":{n:"Missile Command (Amiga Mouse) (2002) (TJ)",l:"missile command",c:1},
	"183020A80848E06A1238A1AB74079D52":{n:"Missile Command (Amiga Mouse) (2002) (TJ) (PAL)",l:"missile command",c:1},
	"8CE9126066F2DDD5173E9F1F9CE1494E":{n:"Missile Command (CX-22 Trackball) (2002) (TJ)",l:"missile command",c:1},
	"8BEBAC614571135933116045204F0F00":{n:"Missile Command (CX-22 Trackball) (2002) (TJ) (PAL)",l:"missile command",c:1},
	"2365E1534D67F94D8670394AB99150CE":{n:"Missile Command (CX-80 Trackball) (2002) (TJ)",l:"missile command",c:1},
	"96ECCC2277043508A6C481EA432D7DD9":{n:"Missile Command (CX-80 Trackball) (2002) (TJ) (PAL)",l:"missile command",c:1},
	"F6A9EA814D15B85BFFE980C927DF606B":{n:"Missile Command (Unknown) (PAL)",l:"missile command",c:1},
	"CB24210DC86D92DF97B38CF2A51782DA":{n:"Missile Control (1983) (Video Gems) (PAL)"},
	"E6E5BB0E4F4350DA573023256268313D":{n:"Missile Control (Thomas Jentzsch)"},
	"53D181CDE2E0219B5754CAAD246FCB66":{n:"Missile Demo (1998) (Ruffin Bailey) (PD)"},
	"317A4CDBAB090DCC996833D07CB40165":{n:"Missile War (1983) (Goliath) (PAL)"},
	"4C6AFB8A44ADF8E28F49164C84144BFE":{n:"Mission 3,000 A.D. (1983) (BitCorp)"},
	"6EFE876168E2D45D4719B6A61355E5FE":{n:"Mission 3,000 A.D. (1983) (BitCorp) (PAL)",c:1},
	"CFAD2B9CA8B8FEC7FB1611D656CC765B":{n:"Mission 3,000 A.D. (1983) (BitCorp) (PAL) [demo cart]",c:1},
	"B83579C4450FCBDF2B108903731FA734":{n:"Mission 3,000 A.D. (208 in 1) (Unknown) (PAL)",c:1},
	"CF9069F92A43F719974EE712C50CD932":{n:"Mission Survive (1983) (Video Gems) (PAL)",c:1},
	"B5CDBAB514EA726A14383CFF6DB40E26":{n:"Mission Survive (1983) (Video Gems) (PAL) [a]",c:1},
	"3783F12821B88B08814DA8ADB1A9F220":{n:"Mission Survive (PAL) (Genesis)",c:1},
	"B676A9B7094E0345A76EF027091D916B":{n:"Mission Survive (Thomas Jentzsch)",c:1},
	"E13818A5C0CB2F84DD84368070E9F099":{n:"Misterious Thief, A (1983) (CCE)",c:1},
	"5D9592756425192EC621D2613D0E683D":{n:"Misterious Thief, A (1983) (CCE) [a]"},
	"B4A4C87840613F102ACB5B3A647D0A67":{n:"Mobile 48 Sprite Kernel (04-01-2003) (Eric Ball)"},
	"073CB76B006AF034FD150BE3F5E0E7E6":{n:"Mobile 48 Sprite Kernel (Bug Fixed) (10-01-2003) (Eric Ball)"},
	"63E9E612BBEE31045F8D184A4E53F8EC":{n:"Moby Blues (2002) (ATARITALIA) (Hack)"},
	"7AF40C1485CE9F29B1A7B069A2EB04A7":{n:"Mogul Maniac (1983) (Amiga)"},
	"F802FA61011DD9EB6F80B271BAC479D0":{n:"Mole Hunter (Suntek) (PAL)"},
	"6BDE3F6AC31ACEEF447CE57D4D2C2EC0":{n:"Mondo Pong V1 (Piero Cavina) (PD)",p:1},
	"1F60E48AD98B659A05CE0C1A8E999AD9":{n:"Mondo Pong V2 (Piero Cavina) (PD)",p:1},
	"6913C90002636C1487538D4004F7CAC2":{n:"Monster Cise (1984) (Atari) (Prototype)"},
	"3347A6DD59049B15A38394AA2DAFA585":{n:"Montezuma's Revenge (1984) (Parker Bros)"},
	"4AB2EBD95A8F861EA451ABEBDAD914A5":{n:"Montezuma's Revenge (PAL) (Genesis)"},
	"9F59EDDF9BA91A7D93BCE7EE4B7693BC":{n:"Montezuma's Revenge (Thomas Jentzsch) (PAL60)"},
	"7B8A481E0C5AA78150B5555DFF01F64E":{n:"Moon Patrol (05-16-1983) (Atari) (Prototype)"},
	"AC3DD22DD945724BE705DDD2785487C2":{n:"Moon Patrol (06-15-1983) (Atari) (Prototype)"},
	"E2C1B60EAA8EDA131632D73E4E0C146B":{n:"Moon Patrol (07-04-1983) (Atari) (Prototype)"},
	"5256F68D1491986AAE5CFDFF539BFEB5":{n:"Moon Patrol (07-26-1983) (Atari) (Prototype)"},
	"94FF6B7489ED401DCAAF952FECE10F67":{n:"Moon Patrol (07-31-1983) (Atari) (Prototype)"},
	"515046E3061B7B18AA3A551C3AE12673":{n:"Moon Patrol (1983) (Atari)"},
	"65490D61922F3E3883EE1D583CE10855":{n:"Moon Patrol (1983) (Atari) (PAL)"},
	"0AFE6AE18966795B89314C3797DD2B1E":{n:"Moon Patrol (1983) (Atari) (PAL) [a]"},
	"6DE924C2297C8733524952448D54A33C":{n:"Moon Patrol (1983) (CCE)"},
	"2854E5DFB84173FAFC5BF485C3E69D5A":{n:"Moon Patrol (Canal 3)"},
	"5643EE916F7DC760148FCA4DB3AA7D10":{n:"Moon Patrol (Genesis)"},
	"1B22A3D79DDD79335B69C94DD9B3E44E":{n:"Moon Patrol (Tron)"},
	"44E9C4A047C348DBEB7ACE60F45484B4":{n:"Moon Patrol Arcade (Genesis)"},
	"203ABB713C00B0884206DCC656CAA48F":{n:"Moonsweeper (1983) (Imagic)",c:1},
	"4AF4103759D603C82B1C9C5ACD2D8FAF":{n:"Moonsweeper (1983) (Imagic) (PAL)",c:1},
	"B79FE32320388A197AC3A0B932CC2189":{n:"Moonsweeper (1983) (Imagic) (PAL) [a]",c:1},
	"B06050F686C6B857D0DF1B79FEA47BB4":{n:"Moonsweeper (1988) (Activision)",c:1},
	"AE6CB335470788B94BEB5787976E8818":{n:"Mortal Kurling (02-01-2003) (CT)"},
	"EB503CC64C3560CD78B7051188B7BA56":{n:"Moto Laser (Star Game)"},
	"378A62AF6E9C12A760795FF4FC939656":{n:"MotoRodeo (1990) (Atari)",c:1},
	"B1E2D5DC1353AF6D56CD2FE7CFE75254":{n:"MotoRodeo (1990) (Atari) (PAL)",c:1},
	"A20B7ABBCDF90FBC29AC0FAFA195BD12":{n:"Motocross (1983) (Quelle) (PAL)"},
	"5641C0FF707630D2DD829B26A9F2E98F":{n:"Motocross (Joystik)"},
	"F5A2F6EFA33A3E5541BC680E9DC31D5B":{n:"Motocross (Suntek) (PAL)"},
	"DE0173ED6BE9DE6FD049803811E5F1A8":{n:"Motocross Racer (1983) (Xonox)"},
	"DB4EB44BC5D652D9192451383D3249FC":{n:"Mountain King (1983) (CBS Electronics)",c:1},
	"7E51A58DE2C0DB7D33715F518893B0DB":{n:"Mountain King (1983) (CBS Electronics) [a]",c:1},
	"23D445EA19A18FB78D5035878D9FB649":{n:"Mouse Trap (1982) (CBS Electronics) (PAL)",c:1},
	"5678EBAA09CA3B699516DBA4671643ED":{n:"Mouse Trap (1982) (Coleco)",c:1},
	"35156407E54F67EB1F625450D5C093E1":{n:"Mouse Trap (Genesis)"},
	"24FBF8250A71611E40EF18552E61B009":{n:"Movable Grid Demo (PD)"},
	"6342AFE9C9AD1B6120B8F6FB040D0926":{n:"Move a Blue Blob Demo (PD)"},
	"F69A39B215852A0C2764D2A923C1E463":{n:"Move a Blue Blob Demo 2 (PD)"},
	"140909D204ABD6841C64CDAD4D7765B4":{n:"Moving Blue Ladder Demo (PD)"},
	"703D32062436E4C20C48313DFF30E257":{n:"Moving Maze Demo (PD)",c:1},
	"AA7BB54D2C189A31BB1FA20099E42859":{n:"Mr. Do! (1983) (CBS Electronics) (PAL)",c:1},
	"0164F26F6B38A34208CD4A2D0212AFC3":{n:"Mr. Do! (1983) (Coleco)",c:1},
	"B7A7E34E304E4B7BC565EC01BA33EA27":{n:"Mr. Do!'s Castle (1984) (Parker Bros)",c:1},
	"0CB7AF80FD0DDEF84844481D85E5D29B":{n:"Mr. Pac-Man (El Destructo)"},
	"0DFBDADF8F1BC718E7E1BB3CCD5FEF3D":{n:"Mr. Pac-Man (New start tune) (El Destructo)"},
	"603C7A0D12C935DF5810F400F3971B67":{n:"Mr. Postman (1983) (BitCorp) (PAL)"},
	"8644352B806985EFDE499AE6FC7B0FEC":{n:"Mr. Postman (1983) (CCE)"},
	"9A4274409216FF09ECDE799F2A56AC73":{n:"Mr. Postman (1983) (CCE) [a]"},
	"2327456F86D7E0DEDA94758C518D05B3":{n:"Mr. Postman (Digitel)"},
	"F0DAAA966199EF2B49403E9A29D12C50":{n:"Mr. Postman (Unknown)"},
	"CFF9950D4E650094F65F40D179A9882D":{n:"Mr. Roboto (Paul Slocum) (Hack)",c:1},
	"87E79CD41CE136FD4F72CC6E2C161BEE":{n:"Ms. Pac-Man (1982) (Atari)"},
	"1EE9C1BA95CEF2CF987D63F176C54AC3":{n:"Ms. Pac-Man (1982) (Atari) (PAL)"},
	"D4942F4B55313FF269488527D84CE35C":{n:"Ms. Pac-Man (1982) (Atari) (PAL) [a]"},
	"1EA980574416BFD504F62575BA524005":{n:"Ms. Pac-Man (1982) (Atari) (Prototype)"},
	"AEB104F1E7B166BC0CBACA0A968FDE51":{n:"Ms. Pac-Man (1999) (Hack)"},
	"9469D18238345D87768E8965F9F4A6B2":{n:"Ms. Pac-Man (CCE)"},
	"4066309EB3FA3E7A725585B9814BC375":{n:"Multi Ball Demo (PD)"},
	"079FE9103515D15BC108577E234A484D":{n:"Multi-Color Demo 0 (Bob Colbert) (PD)"},
	"4AFE528A082F0D008E7319EBD481248D":{n:"Multi-Color Demo 1 (Bob Colbert) (PD)"},
	"191449E40B0C56411C70772706F79224":{n:"Multi-Color Demo 2 (Bob Colbert) (PD)"},
	"AE18C11E4D7ED2437F0BF5D167C0E96C":{n:"Multi-Color Demo 3 (Bob Colbert) (PD)"},
	"C28B29764C2338B0CF95537CC9AAD8C9":{n:"Multi-Color Demo 4 (Bob Colbert) (PD)"},
	"D34B933660E29C0A0A04004F15D7E160":{n:"Multi-Color Demo 5 (Bob Colbert) (PD)"},
	"14163EB2A3DDD35576BD8527EAE3B45E":{n:"Multi-Color Demo 6 (Bob Colbert) (PD)"},
	"B1FD0B71DE9F6EEB5143A97963674CB6":{n:"Multi-Color Demo 7 (Bob Colbert) (PD)"},
	"25F9CF703575C5D63048C222F5463758":{n:"Multi-Sprite Demo 1 (PD)"},
	"42AE81AE8AC51E5C238639F9F77D91AE":{n:"Multi-Sprite Demo 2 (Piero Cavina) (PD)"},
	"17515A4D0B7EA5029FFFF7DFA8456671":{n:"Multi-Sprite Demo V1.1 (Piero Cavina) (PD)"},
	"EF71E9FB0D8D477226D8D42261FBF0A7":{n:"Multi-Sprite Demo V2.0 (Piero Cavina) (PD)"},
	"B958D5FD9574C5CF9ECE4B9421C28ECD":{n:"Multi-Sprite Game V1.0 (Piero Cavina) (PD)"},
	"59135F13985B84C4F13CC9E55EEC869A":{n:"Multi-Sprite Game V2.0 (Piero Cavina) (PD)"},
	"7197B6CBDE6ECD10376155E6B848E80D":{n:"Multi-Sprite Game V2.1 (Piero Cavina) (PD)"},
	"585600522B1F22F617652C962E358A5D":{n:"Multi-Sprite Game V2.2 (Piero Cavina) (PD)"},
	"E609E8A007127B8FCFF79FFC380DA6B1":{n:"Multi-Sprite Game V2.3 (Piero Cavina) (PD)"},
	"50EF88F9A5E0E1E6B86E175362A27FDB":{n:"Multi-Sprite Game V2.4 (Piero Cavina) (PD)"},
	"157356F80C709AB675961D8B8B207E20":{n:"Multi-Sprite Game V2.5 (Piero Cavina) (PD)"},
	"072A6EA2181CA0DF88AC0DEDC67B239D":{n:"Multiple Missiles Demo (19-12-2002) (CT)"},
	"7550B821EE56FB5833DCA2BE88622D5A":{n:"Multiple Moving Objects Demo (B. Watson)"},
	"CD3E26786136A4692FD2CB2DFBC1927E":{n:"Multiple Moving Objects Demo 2 (B. Watson)"},
	"A100EFF2D7AE61CA2B8E65BAF7E2AAE8":{n:"Muncher (David Marli) (Hack)"},
	"5BBA254E18257E578C245ED96F6B003B":{n:"Music Effects Demo (21-01-2003) (Paul Slocum)",c:1},
	"F5AA6BD10F662199C42E43863A30106C":{n:"Music Kit (V1.0) - Song Player (Paul Slocum)",c:1},
	"6F084DAF265599F65422EF4173B69BC7":{n:"Music Kit (V2.0) - Song Player (Paul Slocum)",c:1},
	"65B106EBA3E45F3DAB72EA907F39F8B4":{n:"Music Machine, The (1983) (Sparrow)",p:1},
	"04FCCC7735155A6C1373D453B110C640":{n:"My Golf (1990) (HES) (PAL)"},
	"936F555B4B1A2CD061B659FF63F4F5F2":{n:"My Golf (1990) (HES) (PAL) [a1]"},
	"DFAD86DD85A11C80259F3DDB6151F48F":{n:"My Golf (1990) (HES) (PAL) [fixed]"},
	"EE6CBEDF6C0AAC90FAA0A8DBC093FFBE":{n:"My Golf (CCE) (PAL)"},
	"0546F4E6B946F38956799DD00CAAB3B1":{n:"My Golf (Thomas Jentzsch)"},
	"FCBBD0A407D3FF7BF857B8A399280EA1":{n:"Mysterious Thief, A (1983) (ZiMAG) (Prototype)",c:1},
	"48F18D69799A5F5451A5F0D17876ACEF":{n:"Mysterious Thief, A (1983) (ZiMAG) (Prototype) [a]",c:1},
	"FA7E11A3DBEA4365975CD2F094E61D25":{n:"Mystery Science Theater 2600 (1999) (Tim Snider) (Hack)"},
	"7608ABDFD9B26F4A0ECEC18B232BEA54":{n:"NFL Football (32 in 1) (1988) (Atari) (PAL)"},
	"67C05AE94BF8B83A666C3AE2C4BC14DE":{n:"NFL Football (32 in 1) (1988) (Atari) (PAL) (4K)"},
	"C58708C09CCB61625CDA9D15DDCD8BE6":{n:"NOIZ Invaders (SPIKE) (2002) (Hack)"},
	"36306070F0C90A72461551A7A4F3A209":{n:"Name This Game (1982) (U.S. Games)"},
	"F98D2276D4A25B286135566255AEA9D0":{n:"Name This Game (1983) (Digitel)"},
	"2F7949F71076DB42480D3F5036B4A332":{n:"Name This Game (208 in 1) (Unknown) (PAL) (Hack)"},
	"B392964E8B1C9C2BED12246F228011B2":{n:"Name This Game (Unknown) (PAL)"},
	"0614ED51ACD027D531E7C85C4F435292":{n:"Narnia (Glenn Saunders) (PD)"},
	"709910C2E83361BC4BF8CD0C20C34FBF":{n:"Netmaker (Rainbow Vision) (PAL)"},
	"3F9CB1ABA8EC20E2C243AE642F9942BF":{n:"New Questions (1998) (John K. Harvey) (PD)"},
	"1201C18CF00D2C236F42E4D7D8C86AA1":{n:"Nick Bensema Demo (Nick Bensema)"},
	"392F00FD1A074A3C15BC96B0A57D52A1":{n:"Night Driver (1980) (Atari)",p:1,c:1},
	"F48022230BB774A7F22184B48A3385AF":{n:"Night Driver (1980) (Atari) (4K)",p:1,c:1},
	"FEEC54AAC911887940B47FE8C9F80B11":{n:"Night Driver (1980) (Atari) (PAL)",p:1,c:1},
	"D9DA2AE7C7894A29B43B3C6B79F3B7A2":{n:"Night Driver (1980) (Atari) (PAL) (4K)",p:1,c:1},
	"BD39598F067A1193AE81BD6182E756D1":{n:"Night Stalker (1989) (Telegames) (PAL)"},
	"2783006EE6519F15CBC96ADAE031C9A9":{n:"Night Stalker (1989) (Telegames) (PAL) [a]"},
	"EAD60451C28635B55CA8FEA198444E16":{n:"Nightmare (1983) (Sancho) (PAL)"},
	"27F9E2E1B92AF9DC17C6155605C38E49":{n:"Nightmare (CCE)"},
	"BDB4B584DDC90C9D2EC7E21632A236B6":{n:"Nitemare at Sunshine Bowl-a-Rama (Atari Freak 1) (Hack)"},
	"DDA23757407C4E217F64962C87AD0C82":{n:"Nitemare at Sunshine Bowl-a-Rama (Atari Freak 1) (Hack) [a]"},
	"B6D52A0CF53AD4216FEB04147301F87D":{n:"No Escape! (1982) (Imagic)"},
	"DC81C4805BF23959FCF2C649700B82BF":{n:"No Escape! (1982) (Imagic) (PAL)"},
	"D8DF256C0D89E494A9FB3E9ABB8E44AC":{n:"No Escape! (1982) (Imagic) (PAL) [a]"},
	"9912D06EEA42200A198DD3E2BE18C601":{n:"No Escape! (1982) (Imagic) [a]"},
	"637EFAC676FF063F2FBB0ABFF77C4FA5":{n:"Noize Maker Demo (PD)"},
	"34F4B1D809AA705ACE6E46B13253FD3B":{n:"Nothern Alliance (Aaron Bergstrom) (Hack)"},
	"E3C35EAC234537396A865D23BAFB1C84":{n:"Nuts (1983) (TechnoVision) (PAL)"},
	"DE7A64108074098BA333CC0C70EEF18A":{n:"Nuts (Unknown)"},
	"9ED0F2AA226C34D4F55F661442E8F22A":{n:"Nuts (Unknown) (PAL)"},
	"133A4234512E8C4E9E8C5651469D4A09":{n:"Obelix (1983) (Atari)"},
	"19E739C2764A5AB9ED08F9095AA2AF0B":{n:"Obelix (1983) (Atari) (PAL)"},
	"669840B0411BFBAB5C05B786947D55D4":{n:"Obelix (1983) (Atari) (PAL) [a]"},
	"A189F280521F4E5224D345EFB4E75506":{n:"Obelix (1983) (Thomas Jentzsch)"},
	"4CABC895EA546022C2ECAA5129036634":{n:"Ocean City (Funvision)"},
	"45CB0F41774B78DEF53331E4C3BF3362":{n:"Octopus (1983) (Carrere Video) (PAL)"},
	"B6166F15720FDF192932F1F76DF5B65D":{n:"Off Your Rocker (1983) (Amiga) (Prototype)"},
	"98F63949E656FF309CEFA672146DC1B8":{n:"Off the Wall (1989) (Atari)"},
	"36EDEF446AB4C2395666EFC672B92ED0":{n:"Off the Wall (1989) (Atari) (PAL)"},
	"0BF1E354304F46C0CAF8FC0F6F5E9525":{n:"Official Frogger (1983) (Arcadia) [a]"},
	"E823B13751E4388F1F2A375D3560A8D7":{n:"Official Frogger (Preview) (1983) (Arcadia) [a]"},
	"C73AE5BA5A0A3F3AC77F0A9E14770E73":{n:"Official Frogger, The (1983) (Arcadia)"},
	"A74689A08746A667A299B0507E1E6DD9":{n:"Official Frogger, The (1983) (Arcadia) (PAL)"},
	"F5D103A9AE36D1D4EE7EEF657B75D2B3":{n:"Official Frogger, The (Preview) (1983) (Arcadia)"},
	"95FD6097DC27C20666F039CFE34F7C69":{n:"Oh No! (Version 1) (17-01-2003) (AD)"},
	"5A734779D797CCEF25DC8ACFA47244C7":{n:"Oh No! (Version 2) (18-01-2003) (AD)"},
	"FDD4995A50395DB14F518F63C2D63438":{n:"Oh No! (Version 3) (18-01-2003) (AD)"},
	"DE07E9CB43AD8D06A35F6506E22C62E9":{n:"Oh No! (Version 4) (22-01-2003) (AD)"},
	"C9C25FC536DE9A7CDC5B9A916C459110":{n:"Oink! (1982) (Activision)"},
	"06B6C5031B8353F3A424A5B86B8FE409":{n:"Oink! (1982) (Activision) (PAL)"},
	"3DA7CC7049D73D34920BB73817BD05A9":{n:"Oink! (1983) (Activision) (16K)"},
	"2CF20F82ABCAE2DECFF88DB99331E071":{n:"Oink! (1983) (Activision) (8K)"},
	"F8648D0C6AD1266434F6C485FF69EC40":{n:"Oink! (CCE)"},
	"853C11C4D07050C22EF3E0721533E0C5":{n:"Oink! (Unknown) (PAL)"},
	"8101EFAFCF0AF32FEDDA4579C941E6F4":{n:"Okie Dokie (4K) (PD)"},
	"CE4BBE11D682C15A490AE15A4A8716CF":{n:"Okie Dokie (Older) (PD)"},
	"CCA33AE30A58F39E3FC5D80F94DC0362":{n:"Okie Dokie (PD)"},
	"9947F1EBABB56FD075A96C6D37351EFA":{n:"Omega Race (1983) (CBS Electronics)"},
	"257BC3B72A6B5DB3FD0D47619125B387":{n:"Omega Race (1983) (CBS Electronics) [a]"},
	"5B5D04887922B430DE0B7B2A21F9CD25":{n:"Omega Race (Genesis)"},
	"A9784C24CDDB33BD0D14442B97784F3D":{n:"Omega Race DC (2003) (TJ) (Omega Race Hack)"},
	"3B6DBA1A24BB2893BD3BD0593F92016B":{n:"Omega Race JS (TJ)"},
	"61426CEE013306E7F7367534AB124747":{n:"One Blue Bar Demo (PD)"},
	"B83DF1F32B4539C324BDF94851B4DB55":{n:"One On One by Angelino (Basketball Hack)"},
	"8786F4609A66FBEA2CD9AA48CA7AA11C":{n:"Open Sesame (1983) (Goliath) (PAL)",c:1},
	"28D5DF3ED036ED63D33A31D0D8B85C47":{n:"Open Sesame (1983) (Goliath) (PAL) [a]",c:1},
	"90578A63441DE4520BE5324E8F015352":{n:"Open Sesame (4 Game in One Dark Green) (1983) (BitCorp) (PAL)",c:1},
	"C880C659CDC0F84C4A66BC818F89618E":{n:"Open Sesame (Thomas Jentzsch)",c:1},
	"52385334AC9E9B713E13FFA4CC5CB940":{n:"Open, Sesame! (1983) (CCE)",c:1},
	"CC7138202CD8F6776212EBFC3A820ECC":{n:"Oscar's Trash Race (03-30-1983) (Atari) (Prototype)"},
	"4B94FD272785D7EC6C95FB7279D0F522":{n:"Oscar's Trash Race (12-03-1982) (Atari) (Prototype)"},
	"FA1B060FD8E0BCA0C2A097DCFFCE93D3":{n:"Oscar's Trash Race (1983) (Atari)"},
	"47911752BF113A2496DBB66C70C9E70C":{n:"Oscar's Trash Race (1983) (Atari) (PAL)"},
	"55949CB7884F9DB0F8DFCF8707C7E5CB":{n:"Othello (1981) (Atari)"},
	"02CEE0B140D2F1A1EFCFB1D482A5C392":{n:"Othello (1981) (Atari) (4K)"},
	"2C3B9C171E214E9E46BBAA12BDF8977E":{n:"Othello (1981) (Atari) (4K) [a]"},
	"A0E2D310E3E98646268200C8F0F08F46":{n:"Othello (1981) (Atari) (PAL)"},
	"95956108289A917F80667ECCD3CE98A9":{n:"Othello (1981) (Atari) (PAL) (4K)"},
	"00E19EBF9D0817CCFB057E262BE1E5AF":{n:"Othello (1981) (Atari) (PAL) [no grid markers]"},
	"113CD09C9771AC278544B7E90EFE7DF2":{n:"Othello (1981) (Atari) [no grid markers]"},
	"7D9C96B215D1941E87B6FB412EB9204F":{n:"Othello (Unknown) (PAL) (4K)"},
	"F97DEE1AA2629911F30F225CA31789D4":{n:"Out of Control (1983) (Avalon Hill)"},
	"890C13590E0D8D5D6149737D930E4D95":{n:"Outlaw (1978) (Atari)"},
	"F060826626AAC9E0D8CDA0282F4B7FC3":{n:"Outlaw (1978) (Atari) (4K)"},
	"22675CACD9B71DEA21800CBF8597F000":{n:"Outlaw (1978) (Atari) (PAL)"},
	"3EAE062A9B722BDA1255D474A87ECA5C":{n:"Outlaw (1978) (Atari) (PAL) (4K)"},
	"2E3728F3086DC3E71047FFD6B2D9F015":{n:"Outlaw (32 in 1) (1988) (Atari) (PAL)"},
	"F661F129644F338B13D9F4510D816C03":{n:"Outlaw (32 in 1) (1988) (Atari) (PAL) (4K)"},
	"7F819454734DDF93F83FEFCFFCD3E212":{n:"Outlaw (Jone Yuan) (4K)"},
	"1EC5BEF77B91E59313CBA205F15B06D7":{n:"Overhead Adventure Demo 1 (PD)"},
	"4066D7D88EC4A2C656127A67FA52DCF1":{n:"Overhead Adventure Demo 2 (PD)"},
	"3C7A96978F52B2B15426CDD50F2C4048":{n:"Overhead Adventure Demo 3 (PD)"},
	"0CFDD2F3B243CAC21F38A0F09F54BEAD":{n:"Overhead Adventure Demo 4 (PD)"},
	"D5AA7472E7F2CC17E893A1A36F8DADF0":{n:"Overhead Adventure Demo 5 (PD)"},
	"F45644FF82B533A781A1EE50F2E95F3C":{n:"Overhead Adventure Demo 6 (PD)"},
	"4689081B7363721858756FE781CC7713":{n:"Oystron (V2.6) (Piero Cavina) (PD)"},
	"26F4F8B098609164EFFEF7809E0121E1":{n:"Oystron (V2.7) (Piero Cavina) (PD)"},
	"E6508B878145187B87B9CDED097293E7":{n:"Oystron (V2.8) (Piero Cavina) (PD)"},
	"70D14C66C319683B4C19ABBE0E3DB57C":{n:"Oystron (V2.82) (Piero Cavina) (PD)"},
	"5360693F1EB90856176BD1C0A7B17432":{n:"Oystron (V2.85) (Piero Cavina) (PD)"},
	"91F0A708EEB93C133E9672AD2C8E0429":{n:"Oystron (V2.9) (Piero Cavina) (PD)"},
	"AA2C4B32656BDE9A75042A4D158583E1":{n:"Oystron X (Piero Cavina) (PD)"},
	"C7E43AD79C5E5C029D9F5FFDE23E32CF":{n:"PAL-NTSC Detector (15-11-2002) (CT)"},
	"106326C262DFD3E8EAEABD961D2A0519":{n:"PAL-NTSC Detector (15-11-2002) (CT)[a1]"},
	"6AC3FD31A51730358708C7FDC62487F8":{n:"PC Invaders (Matthias Jaap) (Hack)"},
	"9C7FA3CFCAAAFB4E6DAF1E2517D43D88":{n:"PIEROXM Demo (PD)"},
	"D0498BACA989E792DB4B8270A02B9624":{n:"Pac Ghost Sprite Demo (PD)"},
	"BD430C2193045C68D1A20A018A976248":{n:"Pac Ghost Sprite Demo 2 (PD)"},
	"F9DA42F91A1C5CFA344D2FF440C6F8D4":{n:"Pac Invaders (ZUT)"},
	"88D300A38BDD7CAB9EDAD271C18CD02B":{n:"Pac Kong (Funvision) (PAL)"},
	"936EF1D6F8A57B9FF575DC195EE36B80":{n:"Pac Kong (Unknown)"},
	"CA53FC8FD8B3C4A7DF89AC86B222EBA0":{n:"Pac Man (1983) (CCE)",l:"PAC-MAN",lc:"#f0f010"},
	"651D2B6743A3A18B426BCE2C881AF212":{n:"Pac Man (1983) (CCE) [a]",l:"PAC-MAN",lc:"#f0f010"},
	"B36040A2F9ECAFA73D835D804A572DBF":{n:"Pac Man (1983) (Digitel)",l:"PAC-MAN",lc:"#f0f010"},
	"EBF9038E927E6A0DB3E0D170C59911E6":{n:"Pac-2600 (PD)"},
	"D223BC6F13358642F02DDACFAF4A90C9":{n:"Pac-Kong (Rainbow Vision) (PAL)"},
	"A4B99AA5ED85CFDB7D101923147DE035":{n:"Pac-Law (Jim Goebel) (Hack)"},
	"3B8AACF5F5638492B926B5124DE19F18":{n:"Pac-Man (1981) (Atari) (8K)",l:"PAC-MAN",lc:"#f0f010"},
	"72DB1194B1CC7D45B242F25EB1C148D3":{n:"Pac-Man (1981) (Atari) (Hack)",l:"PAC-MAN",lc:"#f0f010"},
	"6E372F076FB9586AFF416144F5CFE1CB":{n:"Pac-Man (1982) (Atari)",l:"PAC-MAN",lc:"#f0f010"},
	"FC2233FC116FAEF0D3C31541717CA2DB":{n:"Pac-Man (1982) (Atari) (PAL)",l:"PAC-MAN",lc:"#f0f010"},
	"C2410D03820E0FF0A449FA6170F51211":{n:"Pac-Man (Unknown) (PAL) (Hack)"},
	"6B6CA32228AE352B4267E4BD2CDDF10C":{n:"Pac-Man 4 (Pac-Man Hack)"},
	"C569E57DCA93D3BEE115A49923057FD7":{n:"Pac-Space (Pac-Man Hack)"},
	"D7B58303EC8D8C4DBCBF54D3B9734C7E":{n:"Paddle Demo (Joe Grand) (PD)",p:1},
	"82BF0DFF20CEE6A1ED4BB834B00074E6":{n:"Panda (Quest) (Suntek) (PAL)"},
	"0E713D4E272EA7322C5B27D645F56DD0":{n:"Panda Chase (1983) (Home Vision) (PAL)"},
	"F8582BC6CA7046ADB8E18164E8CECDBC":{n:"Panda Chase (Unknown) (PAL)"},
	"714E13C08508EE9A7785CEAC908AE831":{n:"Parachute (1983) (Home Vision) (PAL)"},
	"245F07C8603077A0CAF5F83EE6CF8B43":{n:"Parachute (Thomas Jentzsch)"},
	"012B8E6EF3B5FD5AABC94075C527709D":{n:"Party Mix (1983) (Arcadia)",p:1},
	"7EF3CA08ABDE439C6CCCA84693839C57":{n:"Party Mix (1983) (Arcadia) (PAL)",p:1},
	"4C0FB2544AE0F8B5F7AE8BCE7BD7F134":{n:"Party Mix (Preview) (1983) (Arcadia)",p:1},
	"7D940D749E55B96B7B746519FA06F2DE":{n:"Party Mix (Preview) (1983) (Arcadia) (PAL)",p:1},
	"36C31BB5DAEB103F488C66DE67AC5075":{n:"Party Mix - Bop a Buggy (1 of 3) (1983) (Arcadia)",p:1},
	"FF86FC8FFA717BB095E8471638C1C31C":{n:"Party Mix - Bop a Buggy (1 of 3) (1983) (Arcadia) (PAL)",p:1},
	"6ED5012793F5DDF4353A48C11EA9B8D3":{n:"Party Mix - Down on the Line (3 of 3) (1983) (Arcadia)",p:1},
	"0E86470791B26292ABE1C64545C47985":{n:"Party Mix - Down on the Line (3 of 3) (1983) (Arcadia) (PAL)",p:1},
	"AAEA37B65DB9E492798F0105A6915E96":{n:"Party Mix - Tug of War (2 of 3) (1983) (Arcadia)",p:1},
	"08F4DC6F118F7C98E2406C180C08E78E":{n:"Party Mix - Tug of War (2 of 3) (1983) (Arcadia) (PAL)",p:1},
	"E40A818DAC4DD851F3B4AAFBE2F1E0C1":{n:"Peek-A-Boo (1984) (Atari) (Prototype)"},
	"17BBE288C3855C235950FEA91C9504E9":{n:"Pega Ladrao (Dismac)"},
	"ACE319DC4F76548659876741A6690D57":{n:"Pele's Soccer (1981) (Atari)"},
	"7A09299F473105AE1EF3AD6F9F2CD807":{n:"Pele's Soccer (1981) (Atari) (PAL)"},
	"4BCC7F6BA501A26EE785B7EFBFB0FDC8":{n:"Pengo (1983) (Atari) (Prototype)"},
	"04014D563B094E79AC8974366F616308":{n:"Pengo (1984) (Atari)"},
	"87B6A17132FC32F576BC49EA18729506":{n:"Pengo (1984) (Atari) (PAL)"},
	"212D0B200ED8B45D8795AD899734D7D7":{n:"Pepsi Invaders (1983) (Atari)"},
	"6CE2110AC5DD89AB398D9452891752AB":{n:"Persian Gulf War (Funvision)"},
	"09388BF390CD9A86DC0849697B96C7DC":{n:"Pete Rose Baseball (1988) (Absolute)"},
	"CB4A7B507372C24F8B9390D22D54A918":{n:"Peter Penguin (1983) (ITT Family Games) (PAL)"},
	"3685060707DF27D4091BA0EA2DC4B059":{n:"PezZerk - PezMan in Ghost Manor (Hack)"},
	"E959B5A2C882CCAACB43C32790957C2D":{n:"Phantom II & Pirate (NTSC)"},
	"069C17BEB1E8E0557ADB8539FDCF6CBA":{n:"Phantom II & Pirate (PAL60)"},
	"6B1FC959E28BD71AED7B89014574BDC2":{n:"Phantom Tank (1982) (BitCorp) (PAL)"},
	"B29359F7DE62FED6E6AD4C948F699DF8":{n:"Phantom Tank (1982) (Puzzy) (PAL)"},
	"5A9D188245AFF829EFDE816FCADE0B16":{n:"Phantom Tank (1983) (CCE) (PAL)"},
	"7454786AF7126CCC7A0C31FCF5AF40F1":{n:"Phantom Tank (Unknown) (PAL)"},
	"4D38E1105C3A5F0B3119A805F261FCB5":{n:"Phantom UFO (4 Game in One Light Green) (1983) (BitCorp) (PAL)"},
	"08BD4C1DCC843F6A0B563D9FD80B3B11":{n:"Phantompanzer II (1983) (Quelle) (PAL)"},
	"E9034B41741DCEE64AB6605ABA9DE455":{n:"Phanton Tank (Digivision)"},
	"3577E19714921912685BB0E32DDF943C":{n:"Pharaoh's Curse (1983) (TechnoVision) (PAL)",c:1},
	"2AE700C9DBA843A68DFDCA40D7D86BD6":{n:"Pharaoh's Curse (Thomas Jentzsch)",c:1},
	"62F74A2736841191135514422B20382D":{n:"Pharaoh's Curse (Unknown)",c:1},
	"A69F5B1761A8A11C98E706EC7204937F":{n:"Pharaoh's Curse (Unknown) (PAL)",c:1},
	"3AB5D138E26D88C8190E7CC629A89493":{n:"Phased Color Demo (PD)",c:1},
	"7DCBFD2ACC013E817F011309C7504DAA":{n:"Phaser Patrol (1982) (Arcadia)",c:1},
	"72305C997F2CEC414FE6F8C946172F83":{n:"Phaser Patrol (1982) (Arcadia) (PAL)",c:1},
	"7867EE819B53D69CFCFE740F7DDCA574":{n:"Phaser Patrol (1982) (Arcadia) (Prototype)",c:1},
	"A7A58E9291AEFA1064E933071F60D4EF":{n:"Phaser Patrol (1982) (Arcadia) (Prototype) [a]",c:1},
	"A412C8577B2D57B09185AE51739AC54F":{n:"Phaser Patrol (1982) (Arcadia) [a]",c:1},
	"CA54DE69F7CDF4D7996E86F347129892":{n:"Philly Flasher (1982) (PlayAround)",p:1},
	"7E52A95074A66640FCFDE124FFFD491A":{n:"Phoenix (1982) (Atari)"},
	"79FCDEE6D71F23F6CF3D01258236C3B9":{n:"Phoenix (1982) (Atari) (PAL)"},
	"FD8B4EE0D57605B35E236E814F706FF1":{n:"Phoenix (1982) (Atari) (PAL) [a]"},
	"A00EC89D22FCC0C1A85BB542DDCB1178":{n:"Phoenix (1983) (CCE)"},
	"00E55B27FE2E96354CD21B8B698D1E31":{n:"Phoenix (Unknown)"},
	"A8633050A686270FCF6C0CC4DCBAD630":{n:"Phoenix (Zirok)"},
	"C4060A31D61BA857E756430A0A15ED2E":{n:"Pick 'n Pile (2003) (TJ)",c:1},
	"DA79AAD11572C80A96E261E4AC6392D0":{n:"Pick 'n' Pile (1990) (Salu) (PAL)",c:1},
	"1D4E0A034AD1275BC4D75165AE236105":{n:"Pick Up (1983) (20th Century Fox) (Prototype)"},
	"17C0A63F9A680E7A61BEBA81692D9297":{n:"Picnic (1982) (U.S. Games)",p:1},
	"24544EE5D76F579992D9522E9B238955":{n:"Picnic (1983) (Carrere Video) (PAL)",p:1},
	"D3423D7600879174C038F53E5EBBF9D3":{n:"Piece o' Cake (1982) (U.S. Games)",p:1},
	"8E4FA8C6AD8D8DCE0DB8C991C166CDAA":{n:"Pigs in Space (1983) (Atari)"},
	"95E1D834C57CDD525DD0BD6048A57F7B":{n:"Pigs in Space (1983) (Atari) (PAL)"},
	"CC3D942C6958BD16B1C602623F59E6E1":{n:"Pigs in Space (1983) (Atari) (PAL) [a]"},
	"F04EE80011D95798006378643650AAA7":{n:"Pigs in Space (1983) (Atari) (Prototype)"},
	"E3533684A7EF930A7FBD0C4DD8EC4847":{n:"Pimball (1983) (CCE)"},
	"DBC7485AD5814D466DE780A3E7ED3B46":{n:"Pink Floyd (Kyle Pittman) (PD)"},
	"69E79B1352B9EE1754BBE63B4A7062C3":{n:"Pink Floyd - The Wall (2003) (Barry Laws Jr.) (Hack)"},
	"798CC114F1623C14085868CD3494FE8E":{n:"Pins Revenge (Atari Freak 1)"},
	"F73D2D0EFF548E8FC66996F27ACF2B4B":{n:"Pitfall (1983) (CCE)",l:"PITFALL!",lc:"#ececec #272"},
	"D20E61C86ED729780FECA162166912CA":{n:"Pitfall (1984) (Supergame)",l:"PITFALL!",lc:"#ececec #272"},
	"2D405DA70AF82B20A6B3ECC3D1D2C4EC":{n:"Pitfall (Genus)",l:"PITFALL!",lc:"#ececec #272"},
	"5A272012A62BECABCD52920348C7C60B":{n:"Pitfall (Star Game)",l:"PITFALL!",lc:"#ececec #272"},
	"39A6A5A2E1F6297CCEAA48BB03AF02E9":{n:"Pitfall 2 Plus (Hack)"},
	"7B79BEB378D1B4471DEF90CECCF413DE":{n:"Pitfall Cupcake (Hack)"},
	"6D842C96D5A01967BE9680080DD5BE54":{n:"Pitfall II (1983) (Activision)"},
	"E34C236630C945089FCDEF088C4B6E06":{n:"Pitfall II (1983) (Activision) (PAL)"},
	"448C2A175AFC8DF174D6FF4CCE12C794":{n:"Pitfall II (1983) (Activision) [a2]"},
	"490EED07D4691B27F473953FBEA6541A":{n:"Pitfall II (1983) (Activision) [a]"},
	"268F46038E29301568FA9E443E16E960":{n:"Pitfall Unlimited (Atarius Maximus) (Hack)"},
	"AAD91BE0BF78D33D29758876D999848A":{n:"Pitfall! (1981) (Activision) (Prototype)",l:"PITFALL!",lc:"#ececec #272"},
	"3E90CF23106F2E08B2781E41299DE556":{n:"Pitfall! (1982) (Activision)",l:"PITFALL!",lc:"#ececec #272"},
	"6FD7C7057EEAB273B29C7AAFC7429A96":{n:"Pitfall! (1982) (Activision) (16K)",l:"PITFALL!",lc:"#ececec #272"},
	"98EC0FA4199B9C01F7B8FA3732E43372":{n:"Pitfall! (1982) (Activision) (8K)",l:"PITFALL!",lc:"#ececec #272"},
	"791BC8ACEB6B0F4D9990D6062B30ADFA":{n:"Pitfall! (1982) (Activision) (PAL)",l:"PITFALL!",lc:"#ececec #272"},
	"1782929E1C214B70FB6884F77C207A55":{n:"Pitfall! (1982) (Activision) (Prototype)",l:"PITFALL!",lc:"#ececec #272"},
	"2B430C00DC79E495762AC59B2F9B4FCD":{n:"Pitfall! (1982) (Activision) (Prototype)",l:"PITFALL!",lc:"#ececec #272"},
	"E42B937C30C617241CA9E01E4510C3F6":{n:"Pitfall! (No Walls Hack)",l:"PITFALL!",lc:"#ececec #272"},
	"177504ABD4260C4265E1338955E9FA47":{n:"Pitfall! (Steroids Hack)"},
	"55EF6AB2321CA0C3D369E63D59C059C8":{n:"Pitfall! (Unknown) (PAL)",l:"PITFALL!",lc:"#ececec #272"},
	"5BBAB3F3E4B47E3E23F9820765DBB45C":{n:"Pitfall! (says 1985) [h1]",l:"PITFALL!",lc:"#ececec #272"},
	"82EFE7984783E23A7C55266A5125C68E":{n:"Pizza Chef (1983) (CCE)"},
	"D9FBF1113114FB3A3C97550A0689F10F":{n:"Pizza Chef (1983) (ZiMAG) (Prototype)"},
	"2F77F015FC880B05F28E84156F989A0C":{n:"Plane Demo (Gonzalo) (PD)"},
	"AE10527840A1AC24DE43730645ED508D":{n:"Planet Invaders (Charles Morgan) (Hack)"},
	"BB745C893999B0EFC96EA9029E3C62CA":{n:"Planet Patrol (1982) (Play Video) (PAL)"},
	"043F165F384FBEA3EA89393597951512":{n:"Planet Patrol (1982) (Spectravision)"},
	"69FAC82CD2312DD9CE5D90E22E2F070A":{n:"Planet Patrol (1982) (Spectravision) (PAL)"},
	"D6ACFF6AED0F04690FE4024D58FF4CE3":{n:"Planet Patrol (1982) (Spectravision) (PAL) [different spaceship]"},
	"79004F84BDEEE78D142E445057883169":{n:"Planet Patrol (1983) (CCE)"},
	"1C3F3133A3E5B023C77ECBA94FD65995":{n:"Planet Patrol (1983) (CCE) [a]"},
	"AAFC79FFC32C4C9B2D73C8ADA7602CFE":{n:"Planet Patrol (Unknown) (PAL)"},
	"9EFB4E1A15A6CDD286E4BCD7CD94B7B8":{n:"Planet of the Apes (1983) (20th Century Fox) (Prototype)"},
	"DA4E3396AA2DB3BD667F83A1CB9E4A36":{n:"Plaque Attack (1983) (Activision)"},
	"32244E55CE6EC6BFBD763F33384BDC2E":{n:"Plaque Attack (1983) (Activision) (16K)"},
	"2ABA6A1B01A5859E96D6A66D2286772F":{n:"Plaque Attack (1983) (Activision) (8K)"},
	"7CED6709F091E79A2AB9575D3516A4AC":{n:"Plaque Attack (1983) (Activision) (PAL)"},
	"B64426E787F04FF23EE629182C168603":{n:"Plaque Attack (1983) (Dynacom)"},
	"DE24F700FD28D5B8381DE13ABD091DB9":{n:"Plaque Attack (CCE)"},
	"8B8789C6669A4CEE86C579A65332F852":{n:"Plaque Attack (Digivision)"},
	"3ECCF9F363F5C5DE0C8B174A535DC83B":{n:"Plaque Attack (Unknown) (PAL)"},
	"6A76D5F0ED721639474AA9BBDE69EBF0":{n:"Play Demo (PD)",c:1},
	"5C3A6D27C026F59A96B7AF91E8B1BF26":{n:"PlayAround Demo (PlayAround) (1982)"},
	"103E9D616328969F5D7B4E0A381B25D5":{n:"Playfield Illustration and Logo Demo (2001) (Jake Patterson) (PD)"},
	"CBA56E939252B05DF7B7DE87307D12CA":{n:"Playfield Text Demo (2001) (Roger Williams)"},
	"8BBFD951C89CC09C148BFABDEFA08BEC":{n:"Pleiades (1983) (UA Limited) (Prototype)",c:1},
	"9AFDFE1CFF7F37F1C971FE3F0C900606":{n:"Plug Attack (Funvision)"},
	"7C4A499D343FCA0CEF2D59DD16AF621A":{n:"Poker Card Demo (PD)"},
	"D74A81FCD89C5CF0BD4C88EB207EBD62":{n:"Poker Squares (V0.00a) (2001) (B. Watson)"},
	"12D7E0D6B187889F8D150BF7034D1DB2":{n:"Poker Squares (V0.0e) (2001) (B. Watson)"},
	"E879B7093AC4CFAD74C88D636CA97D00":{n:"Poker Squares (V0.0f) (2001) (B. Watson)"},
	"6E7ED74082F39AD4166C823765A59909":{n:"Poker Squares (V0.14) (2001) (B. Watson)"},
	"78297DB7F416AF3052DD793B53FF014E":{n:"Poker Squares (V0.17) (2001) (B. Watson)"},
	"54785FA29E28AAE6038929BA29D33D38":{n:"Poker Squares (V0.19) (2001) (B. Watson)"},
	"675AE9C23FA1AAE376CEA86CAD96F9A5":{n:"Poker Squares (V0.25) (2001) (B. Watson)"},
	"CCCFE9E9A11B1DAD04BEBA46EEFB7351":{n:"Poker Squares (V0.25) (PAL) (2001) (B. Watson)"},
	"8C136E97C0A4AF66DA4A249561ED17DB":{n:"Poker Squares (V0.27) (2001) (B. Watson)"},
	"08D60A58A691C7F690162850302DC0E1":{n:"Poker Squares (V0.27) (PAL) (2001) (B. Watson)"},
	"EA832E2CB6AAE6F525F07452C381FA48":{n:"Polar to Cartesian and VV (2001) (Roger Williams)"},
	"8953BC11352D794431D3303E31D3B892":{n:"Polaris (02-17-1983) (Tigervision) (Prototype) (4K)"},
	"87BEA777A34278D29B3B6029833C5422":{n:"Polaris (1983) (Thomas Jentzsch)"},
	"44F71E70B89DCC7CF39DFD622CFB9A27":{n:"Polaris (1983) (Tigervision)"},
	"203049F4D8290BB4521CC4402415E737":{n:"Polaris (1983) (Tigervision) (PAL)"},
	"9048CCB7E0802CD8FA5BFC2609F292D8":{n:"Polaris (1983) (Tigervision) (Prototype)"},
	"7F0209CFCC3D181715463F4D6451CECF":{n:"Pole Position (05-15-1983) (Atari) (Prototype)"},
	"A4FF39D513B993159911EFE01AC12EBA":{n:"Pole Position (1983) (Atari)"},
	"B56264F738B2EB2C8F7CF5A2A75E5FDC":{n:"Pole Position (1983) (Atari) (PAL)"},
	"25B52BF8DD215BCBD59C9ABDB55C44F8":{n:"Pole Position (1983) (Atari) (PAL) [a]"},
	"5F39353F7C6925779B0169A87FF86F1E":{n:"Pole Position (1983) (Atari) [a]"},
	"3225676F5C0C577AECCFAA7E6BEDD765":{n:"Pole Position (1983) (CCE)"},
	"5DA8FD0B5ED33A360BFF37F8B5D0CD58":{n:"Pole Position (Tron)"},
	"EE28424AF389A7F3672182009472500C":{n:"Polo (1978) (Atari) (Prototype)"},
	"14B1E30982962C72F426E2E763EB4274":{n:"Polo (1978) (Atari) (Prototype) (4K)"},
	"A83B070B485CF1FB4D5A48DA153FDF1A":{n:"Pompeii (1983) (Apollo) (Prototype)"},
	"668DC528B7EA9345140F4FCFBECF7066":{n:"Pooyan (1983) (Gakken) (PAL)"},
	"4799A40B6E889370B7EE55C17BA65141":{n:"Pooyan (1983) (Konami)"},
	"F70E3F3BB2D19EC2AAEC8F78DC43744F":{n:"Pooyan (Jone Yuan) (Hack)"},
	"89AFFF4A10807093C105740C73E9B544":{n:"Pooyan (Unknown) (PAL)"},
	"C7F13EF38F61EE2367ADA94FDCC6D206":{n:"Popeye (1983) (Parker Bros)",c:1},
	"E9CB18770A41A16DE63B124C1E8BD493":{n:"Popeye (1983) (Parker Bros) (PAL)",c:1},
	"F93D7FEE92717E161E6763A88A293FFA":{n:"Porky's (1983) (20th Century Fox)"},
	"4A5FDDF89801336637AC8E57A7C9A881":{n:"Power Play Arcade Video Game Album IV (1984) (Amiga) (Prototype)"},
	"BBF8C7C9ED280151934AABE138E41BA7":{n:"Power Play Arcade Video Game Album V (1984) (Amiga) (Prototype)"},
	"97D079315C09796FF6D95A06E4B70171":{n:"Pressure Cooker (1983) (Activision)"},
	"525EA747D746F3E80E3027720E1FA7AC":{n:"Pressure Cooker (1983) (Activision) (PAL)"},
	"D57913088E0C49AC3A716BF9837B284F":{n:"Pressure Cooker (1983) (Activision) (PAL) [a]"},
	"027A59A575B78860AED780B2AE7D001D":{n:"Pressure Cooker (CCE)"},
	"DE1A636D098349BE11BBC2D090F4E9CF":{n:"Pressure Gauge (Hozer Video Games)"},
	"6A03C28D505BAB710BF20B954E14D521":{n:"Pressure Gauge 2 Beta (Hozer Video Games)"},
	"EF3A4F64B6494BA770862768CAF04B86":{n:"Private Eye (1983) (Activision)"},
	"1266B3FD632C981F3EF9BDBF9F86CE9A":{n:"Private Eye (1983) (Activision) (PAL)"},
	"F9CEF637EA8E905A10E324E582DD39C2":{n:"Private Eye (CCE)"},
	"22F6B40FC82110D68E50A1208AE0BB97":{n:"Purple Bar Demo (PD)"},
	"9CA2DEB61318EBA4FB784D4BF7441D8B":{n:"Purple Bar Demo 2 (PD)"},
	"6E19428387686A77D8C8D2F731CB09E0":{n:"Purple Cross Demo (PD)"},
	"CFF1E9170BDBC29859B815203EDF18FA":{n:"Push (V0.01) (1998) (AD)",c:1},
	"B7E459D5416EEB196AAA8E092DB14463":{n:"Push (V0.02) (1998) (AD)"},
	"C482F8EEBD45E0B8D479D9B71DD72BB8":{n:"Push (V0.03) (1998) (AD)",c:1},
	"BEFCE0DE2012B24FD6CB8B53C17C8271":{n:"Push (V0.03) (No Illegal Opcodes) (1998) (AD)"},
	"0375F589F7DA06D2D2BE532E0D4D4B94":{n:"Push (V0.04) (2001) (AD)"},
	"96F806FC62005205D851E758D050DFCA":{n:"Push (V0.05) (2001) (AD)"},
	"9D2F05D0FE8B2DFCF770B02EDA066FC1":{n:"Push (V0.06) (2001) (AD)"},
	"9F93734C68F6479EB022CAB40814142E":{n:"Push (V0.07) (2001) (AD)"},
	"78963290052FD17C6C7998305AB3A6A0":{n:"Push (V0.08) (2001) (AD)"},
	"679D30C7886B283CBE1DB4E7DBE5F2A6":{n:"Puzzle (Colin Hughes) (PD)"},
	"3FF5165378213DAB531FFA4F1A41AE45":{n:"Pygmy (1983) (Quelle) (PAL)"},
	"6FC0176CCF53D7BCE249AEB56D59D414":{n:"Pyramid War (Rainbow Vision) (PAL)"},
	"37FD7FA52D358F66984948999F1213C5":{n:"Pyramid War (Rainbow Vision) (PAL) [a2]"},
	"8B40A9CA1CFCD14822E2547EAA9DF5C1":{n:"Q-bert (1983) (Parker Bros) (PAL)"},
	"1EDE4F365CE1386D58F121B15A775E24":{n:"Q-bert (1983) (Parker Bros) (PAL) [a]"},
	"484B0076816A104875E00467D431C2D2":{n:"Q-bert (1987) (Atari)"},
	"EB6D6E22A16F30687ADE526D7A6F05C5":{n:"Q-bert (1987) (Atari) (PAL)"},
	"A91D0858A52DE3A2E6468437212D93E8":{n:"Q-bert (208 in 1) (Unknown) (PAL)"},
	"517592E6E0C71731019C0CEBC2CE044F":{n:"Q-bert's Qubes (1984) (Parker Bros)"},
	"B15026B43C6758609667468434766DD8":{n:"Qb (0.06) (Retroactive)",c:1},
	"6803FA7C2C094B428B859A58DC1DD06A":{n:"Qb (0.11) (Retroactive)",c:1},
	"5A5390F91437AF9951A5F8455B61CD43":{n:"Qb (0.11) (Retroactive) (PAL)",c:1},
	"376944889DCFA96C73D3079F308E3D32":{n:"Qb (0.11) (Retroactive) (Stella)",c:1},
	"292A0BB975B2587F9AC784C960E1B453":{n:"Qb (05-02-2001) (AD)",c:1},
	"D0E9BEB2347595C6C7D158E9D83D2DA8":{n:"Qb (2.00) (Retroactive)",c:1},
	"C866C995C0D2CA7D017FEF0FC0C2E268":{n:"Qb (2.00) (Retroactive) (PAL)",c:1},
	"F33F1D0F7819C74148DACB48CBF1C597":{n:"Qb (2.00) (Retroactive) (Stella)",c:1},
	"2E0AED5BB619EDCEFA3FAFB4FBE7C551":{n:"Qb (2.06) (Retroactive) (NTSC)",c:1},
	"05EB4347F0EC8F4783983CA35FFD8D1B":{n:"Qb (2.06) (Retroactive) (PAL)",c:1},
	"E800E4AEC7C6C54C9CF3DB0D1D030058":{n:"Qb (2.06) (Retroactive) (Stella)",c:1},
	"3A51A6860848E36E6D06FFE01B71FB13":{n:"Qb (2.07) (Retroactive) (NTSC)",c:1},
	"FAE0B86934A7C5A362281DFFEBDB43A0":{n:"Qb (2.07) (Retroactive) (PAL)",c:1},
	"CEA9F72036DC6F7AF5EFF52459066290":{n:"Qb (2.07) (Retroactive) (Stella)",c:1},
	"67BD3D4DC5AC6A42A99950B4245BDC81":{n:"Qb (2.11) (Retroactive)",c:1},
	"283DEE88F295834C4C077D788F151125":{n:"Qb (2.11) (Retroactive) (PAL)",c:1},
	"2808DC745FF4321DC5C8122ABEF6711F":{n:"Qb (2.11) (Retroactive) (Stella)",c:1},
	"35163B56F4A692A232AE96AD3E23310F":{n:"Qb (2.12) (Retroactive)",c:1},
	"B3017E397F74EFD53CAF8FAE0A38E3FE":{n:"Qb (2.12) (Retroactive) (PAL)",c:1},
	"6E5D5BA193D2540AEC2E847AAFB2A5FB":{n:"Qb (2.14) (Retroactive) (NTSC)",c:1},
	"4F634893D54E9CABE106E0EC0B7BDCDF":{n:"Qb (2.14) (Retroactive) (PAL)",c:1},
	"52E1954DC01454C03A336B30C390FB8D":{n:"Qb (2.14) (Retroactive) (Stella)",c:1},
	"AC53B83E1B57A601EEAE9D3CE1B4A458":{n:"Qb (2.15) (Retroactive) (NTSC)",c:1},
	"9281ECCD7F6EF4B3EBDCFD2204C9763A":{n:"Qb (2.15) (Retroactive) (PAL)",c:1},
	"34E37EAFFC0D34E05E40ED883F848B40":{n:"Qb (2.15) (Retroactive) (Stella)",c:1},
	"2D69A5F23784F1C2230143292A073B53":{n:"Qb (Fixed background animation) (2001) (AD)",c:1},
	"17512D0C38F448712F49F36F9D185C4E":{n:"Qb (Release Candidate #1) (Retroactive)",c:1},
	"687C23224E26F81C56E431C24FAEA36D":{n:"Qb (Simple Background Animation) (2001) (AD)",c:1},
	"3F01BD6D059396F495A4CDE7DE0AB180":{n:"Qb (Special Edition) (NTSC) (Retroactive)",c:1},
	"F49A34F1FDD7DC147CBF96CE2CE71B76":{n:"Qb (Special Edition) (PAL) (Retroactive)",c:1},
	"E01E00504E6D4B88FA743C0BBE8A96E5":{n:"Qb (Special Edition, some bugfixes) (Retroactive)",c:1},
	"D787EC6785B0CCFBD844C7866DB9667D":{n:"Qb (V0.04) (2001) (Retroactive)",c:1},
	"3C4A6F613CA8BA27CE9E43C6C92A3128":{n:"Qb (V0.04) (Non-Lax Version) (2001) (Retroactive)",c:1},
	"CF0C593C563C84FDAF0F741ADB367445":{n:"Qb (V0.05) (2001) (Retroactive)",c:1},
	"35FA32256982774A4F134C3347882DFF":{n:"Qb (V0.05) (Macintosh) (2001) (Retroactive)",c:1},
	"8712CCEEC5644AACC2C21203D9EBE2EC":{n:"Qb (V0.10) (NTSC) (2001) (Retroactive)",c:1},
	"4233EB824C2B4811ABEF9B6D00355AE9":{n:"Qb (V0.10) (PAL) (2001) (Retroactive)",c:1},
	"D010E3DFE7366E47561C088079A59439":{n:"Qb (V0.10) (Stella) (2001) (Retroactive)",c:1},
	"0906C6E0E4BDA9C10CFA4C5FC64D2F4B":{n:"Qb (V0.12) (NTSC) (2001) (Retroactive)",c:1},
	"AE682886058CD6981C4B8E93E7B019CF":{n:"Qb (V0.12) (PAL) (2001) (Retroactive)",c:1},
	"CDC1A5C61D7488EADC9ABA36166B253D":{n:"Qb (V0.12) (Stella) (2001) (Retroactive)",c:1},
	"8B504B417C8626167A7E02F44229F0E7":{n:"Qb (V1.00) (NTSC) (2001) (Retroactive)",c:1},
	"8FFFC8F15BB2E6D24E211884A5479AA5":{n:"Qb (V1.00) (PAL) (2001) (Retroactive)",c:1},
	"7BC4FD254EC8C0A25A13F02FD3F762FF":{n:"Qb (V1.00) (Stella) (2001) (Retroactive)",c:1},
	"8CCAA442D26B09139685F5B22BF189C4":{n:"Qb (V1.01) (NTSC) (2001) (Retroactive)",c:1},
	"ABB740BEA0A6842831B4F53112FB8145":{n:"Qb (V1.01) (PAL) (2001) (Retroactive)",c:1},
	"AE0D4F3396CB49DE0FABDFF03CB2756F":{n:"Qb (V2.02) (PAL) (2001) (Retroactive)",c:1},
	"C504A71C411A601D1FC3173369CFDCA4":{n:"Qb (V2.02) (Stella) (2001) (Retroactive)",c:1},
	"693137592A7F5CCC9BAAE2D1041B7A85":{n:"Qb (V2.02) (Stella) (2001) (Retroactive) [a1]",c:1},
	"98CCD15345B1AEE6CAF51E05955F0261":{n:"Qb (V2.03) (NTSC) (2001) (Retroactive)",c:1},
	"4C030667D07D1438F0E5C458A90978D8":{n:"Qb (V2.03) (PAL) (2001) (Retroactive)",c:1},
	"CE64812EB83C95723B04FB56D816910B":{n:"Qb (V2.04) (NTSC) (2001) (Retroactive)",c:1},
	"EB9712E423B57F0B07CCD315BB9ABF61":{n:"Qb (V2.04) (PAL) (2001) (Retroactive)",c:1},
	"4DD6C7AB9EF77F2B4950D8FC7CD42EE1":{n:"Qb (V2.04) (Stella) (2001) (Retroactive)",c:1},
	"659A20019DE4A23C748EC2292EA5F221":{n:"Qb (V2.05) (NTSC) (2001) (Retroactive)",c:1},
	"C92CFA54B5D022637FDCBDC1EF640D82":{n:"Qb (V2.05) (PAL) (2001) (Retroactive)",c:1},
	"DCBA0E33AA4AED67630A4B292386F405":{n:"Qb (V2.08) (Half Speed Version) (NTSC) (2001) (Retroactive)",c:1},
	"57A66B6DB7EFC5DF17B0B0F2F2C2F078":{n:"Qb (V2.08) (NTSC) (2001) (Retroactive)",c:1},
	"876A953DAAE0E946620CF05ED41989F4":{n:"Qb (V2.08) (PAL) (2001) (Retroactive)",c:1},
	"318046AE3711C05FD16E479B298E5FCC":{n:"Qb (V2.08) (Stella) (2001) (Retroactive)",c:1},
	"E2389C0BE5B5B84E0D3CA36EC7E67514":{n:"Qb (V2.09) (NTSC) (2001) (Retroactive)",c:1},
	"008543AE43497AF015E9428A5E3E874E":{n:"Qb (V2.09) (PAL) (2001) (Retroactive)",c:1},
	"67CE6CDF788D324935FD317D064ED842":{n:"Qb (V2.09) (Stella) (2001) (Retroactive)",c:1},
	"94E4C9B924286038527F49CDC20FDA69":{n:"Qb (V2.12) (Stella) (2001) (Retroactive)",c:1},
	"4FAE08027365D31C558E400B687ADF21":{n:"Qb (V2.17) (NTSC) (2001) (Retroactive)",c:1},
	"8388D6FE59C38C0B3A6AB2C58420036A":{n:"Quadrun (12-06-1982) (Atari) (Prototype)"},
	"024365007A87F213CBE8EF5F2E8E1333":{n:"Quadrun (1983) (Atari)"},
	"392D34C0498075DD58DF0CE7CD491EA2":{n:"Quadrun (1983) (Atari) (Prototype)"},
	"955C408265AD6994F61F9B66657BBAE9":{n:"Quadrun (Video Conversion) (Fabrizio Zavagli)"},
	"152C253478B009C275E18CD731B48561":{n:"Quest (11-10-2002) (Chris Larkin)"},
	"A0675883F9B09A3595DDD66A6F5D3498":{n:"Quest for Quintana Roo (1989) (Telegames)"},
	"F736864442164B29235E8872013180CD":{n:"Quest for Quintana Roo (1989) (Telegames) (PAL)"},
	"7EBA20C2291A982214CC7CBE8D0B47CD":{n:"Quick Step! (1983) (Imagic)"},
	"E72EE2D6E501F07EC5E8A0EFBE520BEE":{n:"Quick Step! (1983) (Imagic) (PAL)"},
	"84290E333FF7567C2380F179430083B8":{n:"Quick Step! (1983) (Imagic) (PAL) [a]"},
	"7836794B79E8060C2B8326A2DB74EEF0":{n:"RIOT RAM Test (26-11-2002) (Dennis Debro)"},
	"6CCD8CA17A0E4429B446CDCB66327BF1":{n:"RPG Engine (12-05-2003) (Paul Slocum) (PD)",c:1},
	"9C6D65BD3B477AACE0376F705B354D68":{n:"RPG Kernal (18-04-2003) (Paul Slocum) (PD)",c:1},
	"0F341D1F4E144E3163D9A5FC5A662B79":{n:"RUN Platform Demo (PD)",c:1},
	"2E5B184DA8A27C4D362B5A81F0B4A68F":{n:"Rabbit Transit (08-29-1983) (Atari) (Prototype)"},
	"FB4CA865ABC02D66E39651BD9ADE140A":{n:"Rabbit Transit (1983) (Arcadia)"},
	"7481F0771BFF13885B2FF2570CF90D7B":{n:"Rabbit Transit (1983) (Arcadia) (PAL)"},
	"A779B9FA02C62D00D7C31ED51268F18A":{n:"Rabbit Transit (1983) (Arcadia) [a]"},
	"CD399BC422992A361BA932CC50F48B65":{n:"Rabbit Transit (Preview) (1983) (Arcadia)"},
	"1A23540D91F87584A04F184304A00648":{n:"Race Demo (PD)"},
	"AAB840DB22075AA0F6A6B83A597F8890":{n:"Racing Car (1983) (Home Vision) (PAL)"},
	"4DF9D7352A56A458ABB7961BF10ABA4E":{n:"Racing Car (Unknown)"},
	"CBCED209DD0575A27212D3EEE6AEE3BC":{n:"Racquetball (1981) (Apollo)",c:1},
	"4F7B07EC2BEF5CCFFE06403A142F80DB":{n:"Racquetball (1981) (Apollo) (PAL)",c:1},
	"A20D931A8FDDCD6F6116ED21FF5C4832":{n:"Racquetball (1981) (Apollo) [a]",c:1},
	"F0D393DBF4164A688B2346770C9BBD12":{n:"Racquetball (Unknown)",c:1},
	"97933C9F20873446E4C1F8A4DA21575F":{n:"Racquetball (Unknown) (PAL)",c:1},
	"56300ED31FEF018BD96768CCC982F7B4":{n:"Rad Action Pak - Kung-Fu Master, Freeway, Frostbite (1990) (HES) (PAL)"},
	"247FA1A29AD90E64069EE13D96FEA6D6":{n:"Radar (1983) (CCE)"},
	"74F623833429D35341B7A84BC09793C0":{n:"Radar (Zellers)"},
	"BAF4CE885AA281FD31711DA9B9795485":{n:"Radar Lock (1989) (Atari)"},
	"04856E3006A4F5F7B4638DA71DAD3D88":{n:"Radar Lock (1989) (Atari) (PAL)"},
	"200309C8FBA0F248C13751ED4FC69BAB":{n:"Radial Pong - Version 1 (Jeffry Johnston) (PD)"},
	"0F14C03050B35D6B1D8850B07578722D":{n:"Radial Pong - Version 10 (Jeffry Johnston) (PD)"},
	"43F33C6DFDEAF5138CE6E6968AD7C5CE":{n:"Radial Pong - Version 11 (Jeffry Johnston) (PD)"},
	"32199271DC980EB31A2CC96E10A9E244":{n:"Radial Pong - Version 12 (Jeffry Johnston) (PD)"},
	"6337927AD909AA739D6D0044699A916D":{n:"Radial Pong - Version 2 (Jeffry Johnston) (PD)"},
	"F1E375D921858467166E53BCEC05803F":{n:"Radial Pong - Version 3 (Jeffry Johnston) (PD)"},
	"481F9A742052801CC5F3DEFB41CB638E":{n:"Radial Pong - Version 4 (Jeffry Johnston) (PD)"},
	"FD9B321CEE5FBB32C39BA3CA5D9EC7CF":{n:"Radial Pong - Version 5 (Jeffry Johnston) (PD)"},
	"64B8E19C767191CCDC97ACC6904C397B":{n:"Radial Pong - Version 6 (Jeffry Johnston) (PD)"},
	"2450DFA1DF70D12B60683185775EFED8":{n:"Radial Pong - Version 7 (Jeffry Johnston) (PD)"},
	"9F9EE0F60C119C831E80694B6678CA1A":{n:"Radial Pong - Version 8 (Jeffry Johnston) (PD)"},
	"05824FCBE615DBCA836D061A140A50E0":{n:"Radial Pong - Version 9 (Jeffry Johnston) (PD)"},
	"92A1A605B7AD56D863A56373A866761B":{n:"Raft Rider (1982) (U.S. Games)"},
	"438968A26B7CFE14A499F5BBBBF844DB":{n:"Raft Rider (208 in 1) (Unknown) (PAL)"},
	"1E750000AF77CC76232F4D040F4AB060":{n:"Raft Rider (Jone Yuan)"},
	"025668E36A788E8AF8AC4F1BE7E72043":{n:"Raiders of the Lost Ark (06-14-82) (Atari) (Prototype)"},
	"F724D3DD2471ED4CF5F191DBB724B69F":{n:"Raiders of the Lost Ark (1982) (Atari)"},
	"1CAFA9F3F9A2FCE4AF6E4B85A2BBD254":{n:"Raiders of the Lost Ark (1982) (Atari) (PAL)"},
	"CB96B0CF90AB7777A2F6F05E8AD3F694":{n:"Rainbow Invaders"},
	"8F98519A91DBBF4864F135A10050D9ED":{n:"Rainbow Invaders (non-playable demo) (PD)"},
	"0B577E63B0C64F9779F315DCA8967587":{n:"Raketen-Angriff (Ariola) (PAL)"},
	"7096A198531D3F16A99D518AC0D7519A":{n:"Ram It (1982) (Telesys)"},
	"63E42D576800086488679490A833E097":{n:"Ram It (1982) (Telesys) (PAL)"},
	"F2F2CB35FDEF063C966C1F5481050EA2":{n:"Ram It (Unknown) (PAL)"},
	"9EEB40F04A27EFB1C68BA1D25E606607":{n:"Rambo II (2003) (Kyle Pittman) (Hack)"},
	"2EDA6A49A49FCB2B674EA9E160B6A617":{n:"Rambo in Afghanistan (Kyle Pittman) (Hack)"},
	"5E1B4629426F4992CF3B2905A696E1A7":{n:"Rampage! (1989) (Activision)"},
	"A11099B6EC24E4B00B8795744FB12005":{n:"Rampage! (1989) (Activision) (PAL)"},
	"9F8FAD4BADCD7BE61BBD2BCAEEF3C58F":{n:"Reactor (1982) (Parker Bros)",c:1},
	"4904A2550759B9B4570E886374F9D092":{n:"Reactor (1982) (Parker Bros) (PAL)",c:1},
	"C6DB733E0B108C2580A1D65211F06DBF":{n:"RealSports Baseball (07-09-1982) (Atari) (Prototype)"},
	"EB634650C3912132092B7AEE540BBCE3":{n:"RealSports Baseball (1982) (Atari)",c:1},
	"20D4457BA22517253FCB62967AF11B37":{n:"RealSports Baseball (1982) (Atari) (Prototype)"},
	"8A183B6357987DB5170C5CF9F4A113E5":{n:"RealSports Basketball (1983) (Atari) (Prototype) (PAL)"},
	"5524718A19107A04EC3265C93136A7B5":{n:"RealSports Basketball (Thomas Jentzsch)"},
	"3177CC5C04C1A4080A927DFA4099482B":{n:"RealSports Boxing (1987) (Atari)"},
	"4ABB4C87A4C5F5D0C14EAD2BB36251BE":{n:"RealSports Boxing (1987) (Atari) (PAL)"},
	"7AD257833190BC60277C1CA475057051":{n:"RealSports Football (1982) (Atari)",c:1},
	"277FA4B9A6BB7A8DCEA2C5F38A4C25F0":{n:"RealSports Football (1982) (Atari) (Prototype)",c:1},
	"08F853E8E01E711919E734D85349220D":{n:"RealSports Soccer (1983) (Atari)"},
	"B9336ED6D94A5CC81A16483B0A946A73":{n:"RealSports Soccer (1983) (Atari) (PAL)",c:1},
	"6272F348A9A7F2D500A4006AA93E0D08":{n:"RealSports Soccer (1983) (Atari) (PAL) [a]",c:1},
	"6706A00F9635508CFEDA20639156E66E":{n:"RealSports Soccer (1983) (Atari) (Prototype)"},
	"F7856E324BC56F45B9C8E6FF062EC033":{n:"RealSports Soccer (1983) (Atari) [no opening tune]",c:1},
	"C5DD8399257D8862F3952BE75C23E0EB":{n:"RealSports Tennis (1982) (Atari) (Prototype)"},
	"DAC5C0FE74531F077C105B396874A9F1":{n:"RealSports Tennis (1983) (Atari)"},
	"4E66C8E7C670532569C70D205F615DAD":{n:"RealSports Tennis (1983) (Atari) (PAL)"},
	"13AA1F9AC4249947E4AF61319D9A08F2":{n:"RealSports Tennis (1983) (Atari) (PAL) [a1]"},
	"C7EAB66576696E11E3C11FFFF92E13CC":{n:"RealSports Tennis (1983) (Atari) (PAL) [a2]"},
	"435FD469F088468C4D66BE6B5204D887":{n:"RealSports Tennis (1983) (Atari) (PAL) [a]"},
	"AED0B7BD64CC384F85FDEA33E28DAF3B":{n:"RealSports Volleyball (1982) (Atari)"},
	"4CA0959F846D2BEADA18ECF29EFE137E":{n:"RealSports Volleyball (1982) (Atari) (PAL)"},
	"A8D4A9500B18B0A067A1F272F869E094":{n:"Red And White Checkerboard Demo (PD)"},
	"13DFB095E519A555A5B60B7D9D7169F9":{n:"Red Line Demo (PD)"},
	"874C76726F68C166FCFAC48CE78EEF95":{n:"Red Pong Number 2 Demo (PD)",c:1},
	"79B649FB812C50B4347D12E7DDBB8400":{n:"Red Pong Number 2 Demo 2 (PD)",c:1},
	"DD1422FFD538E2E33B339EBEEF4F259D":{n:"Red Vs. Blue (1981) (Atari) (Prototype)"},
	"EB9F8B84C193D9D93A58FCA112AA39ED":{n:"Register Twiddler Demo (PD)"},
	"7450AE4E10BA8380C55B259D7C2B13E8":{n:"Register Twiddler Demo 2 (PD)"},
	"8A9D874A38608964F33EC0C35CAB618D":{n:"Rescue Bira Bira (Chris Cracknell)",c:1},
	"60A61DA9B2F43DD7E13A5093EC41A53D":{n:"Rescue Terra I (1982) (VentureVision)"},
	"42249EC8043A9A0203DDE0B5BB46D8C4":{n:"Resgate Espacial (CCE)",c:1},
	"5E1CD11A6D41FC15CF4792257400A31E":{n:"Return of Mario Bros (Philip R. Frey) (Hack)"},
	"0B01909BA84512FDAF224D3C3FD0CF8D":{n:"Revenge of the Apes (Hack)"},
	"96BCB3D97CE4FF7586326D183AC338A2":{n:"Revenge of the Apes (Hack) [h2]"},
	"4F64D6D0694D9B7A1ED7B0CB0B83E759":{n:"Revenge of the Beefsteak Tomatoes (1982) (20th Century Fox)"},
	"6468D744BE9984F2A39CA9285443A2B2":{n:"Reversi (32 in 1) (1988) (Atari) (PAL)"},
	"A995B6CBDB1F0433ABC74050808590E6":{n:"Riddle of the Sphinx (1982) (Imagic)"},
	"083E7CAE41A874B2F9B61736C37D2FFE":{n:"Riddle of the Sphinx (1982) (Imagic) (PAL)"},
	"3D2652CBEA462A886A41791DD7C8D073":{n:"Ritorno dei frattelli di Mario (Mario Bros Hack)"},
	"31512CDFADFD82BFB6F196E3B0FD83CD":{n:"River Patrol (1984) (Tigervision)"},
	"393948436D1F4CC3192410BB918F9724":{n:"River Raid (1982) (Activision)",l:"RIVER RAID",lc:"#ececec #833"},
	"291CC37604BC899E8E065C30153FC4B9":{n:"River Raid (1982) (Activision) (16K)",l:"RIVER RAID"},
	"BCCB4E2CFAD5EFC93F6D55DC992118CE":{n:"River Raid (1982) (Activision) (8K)",l:"RIVER RAID"},
	"927D422D6335018DA469A9A07CD80390":{n:"River Raid (1982) (Activision) (PAL)",l:"RIVER RAID"},
	"33ED6DFAC4B9EA2F81F778CEDDBB4A75":{n:"River Raid (1982) (SpkSoft) [t1]",l:"RIVER RAID"},
	"59F596285D174233C84597DEE6F34F1F":{n:"River Raid (1983) (CCE)",l:"RIVER RAID"},
	"39D36366AE7E6DFD53393FB9EBAB02A0":{n:"River Raid (1983) (CCE) [a]",l:"RIVER RAID"},
	"DA5096000DB5FDAA8D02DB57D9367998":{n:"River Raid (1983) (Digitel)",l:"RIVER RAID"},
	"01B09872DCD9556427761F0ED64AA42A":{n:"River Raid (1984) (Galaga Games)",l:"RIVER RAID"},
	"FADB89F9B23BEB4D43A7895C532757E2":{n:"River Raid (1984) (Galaga Games) (PAL)",l:"RIVER RAID"},
	"8C8B15B3259E60757987ED13CDD74D41":{n:"River Raid (1984) (Supergame)",l:"RIVER RAID"},
	"B1C14B5AC896400CC91C8E5DD67ACB59":{n:"River Raid (208 in 1) (Unknown) (PAL) (Hack)"},
	"A539B9FD1BA57E46442B3E9351E6383B":{n:"River Raid (208 in 1) (Unknown) (PAL) (Hack) [a]"},
	"8C941FA32C7718A10061D8C328909577":{n:"River Raid (Digivision)",l:"RIVER RAID"},
	"A94528AE05DD051894E945D4D2349B3B":{n:"River Raid (Genus)",l:"RIVER RAID"},
	"CD4423BD9F0763409BAE9111F888F7C2":{n:"River Raid (Jone Yuan)",l:"RIVER RAID"},
	"C29D17EEF6B0784DB4586C12CB5FD454":{n:"River Raid (Jone Yuan) (Hack)"},
	"39FE316952134B1277B6A81AF8E05776":{n:"River Raid (Robby)",l:"RIVER RAID"},
	"EDF69B123E06EAF8663CC78D8AEBA06E":{n:"River Raid (SpkSoft 98) [h1]",l:"RIVER RAID"},
	"DD92D6AD50976F881D86B52D38616118":{n:"River Raid (SpkSoft) [h1]",l:"RIVER RAID"},
	"D5E5B3EC074FFF8976017EF121D26129":{n:"River Raid (Star Game)",l:"RIVER RAID"},
	"1E89F722494608D6EA15A00D99F81337":{n:"River Raid (Unknown) (PAL)",l:"RIVER RAID"},
	"90F502CBF4438A95F69F848CEF36EB64":{n:"River Raid II (1985) (Digitel)"},
	"AB56F1B2542A05BEBC4FBCCFC4803A38":{n:"River Raid II (1988) (Activision)"},
	"B049FC8AC50BE7C2F28418817979C637":{n:"River Raid II (1988) (Activision) (PAL)"},
	"DEB39482E77F984D4CE73BE9FD8ADABD":{n:"River Raid II (1988) (Activision) [a]"},
	"F2D4D6187903CAC2D5EA8ED90DAD120D":{n:"River Raid II (Digimax)"},
	"D5F965C159E26A1FB49A22A47FBD1DD0":{n:"River Raid II (Supergame)"},
	"FBB4F3DEBF48DC961B559384467F2057":{n:"River Raid III (1985) (Digitel)"},
	"4E86866D9CDE738D1630E2E35D7288CE":{n:"River Raid III (Supergame)"},
	"304512528A5530A9361E8A231ED9A6DE":{n:"River Raid Plus (Thomas Jentzsch) (Hack)"},
	"C74BFD02C7F1877BBE712C1DA5C4C194":{n:"River Raid Tanks (Thomas Jentzsch) (Hack)"},
	"322B29E84455AA41E7CC9AF463BFFA89":{n:"Road Runner (06-25-1984) (Atari) (Prototype)"},
	"CE5CC62608BE2CD3ED8ABD844EFB8919":{n:"Road Runner (1989) (Atari)"},
	"C3A9550F6345F4C25B372C42DC865703":{n:"Road Runner (1989) (Atari) (PAL)"},
	"7D3CDDE63B16FA637C4484E716839C94":{n:"Road Runner (CCE)"},
	"0F8043715D66A4BBED394EF801D99862":{n:"Robin Hood (1983) (Quelle) (PAL)"},
	"72A46E0C21F825518B7261C267AB886E":{n:"Robin Hood (1983) (Xonox)"},
	"DD7598B8BCB81590428900F71B720EFB":{n:"Robin Hood (1983) (Xonox) (PAL)"},
	"DB76F7A0819659D9E585F2CDDE9175C7":{n:"Robin Hood (1983) (Xonox) (PAL) [a]"},
	"3E1682DDAEC486D8B6B90B527AAA0FC4":{n:"Robot City (V0.12) (TJ)"},
	"F954381F9E0F2009D1AC40DEDD777B1A":{n:"Robot City (V0.18) (01-09-2002) (TJ)"},
	"97CD63C483FE3C68B7CE939AB8F7A318":{n:"Robot City (V0.21) (15-09-2002) (TJ)"},
	"D82675CE67CAF16AFE5ED6B6FAC8AA37":{n:"Robot City (V0.23) (13-11-2002) (TJ)"},
	"82337E5FE0F418CA9484CA851DFC226A":{n:"Robot City (V1.0) (Alpha) (TJ)"},
	"4251B4557EA6953E88AFB22A3A868724":{n:"Robot City (V1.1) (TJ)"},
	"913D5D959B5021F879033C89797BAB5E":{n:"Robot Player Graphic (1996) (J.V. Matthews) (PD)"},
	"4F618C2429138E0280969193ED6C107E":{n:"Robot Tank (1983) (Activision)"},
	"F687EC4B69611A7F78BD69B8A567937A":{n:"Robot Tank (1983) (Activision) (PAL)"},
	"FBB0151EA2108E33B2DBAAE14A1831DD":{n:"Robot Tank TV (Thomas Jentzsch) (Hack)"},
	"568371FBAE6F5E5B936AF80031CD8888":{n:"Robotfindskitten2600 (26-04-2003) (Jeremy Penner)"},
	"39790A2E9030751D7DB414E13F1B6960":{n:"Robotfindskitten2600 (26-04-2003) (Jeremy Penner) [a1]"},
	"D100B11BE34A1E5B7832B1B53F711497":{n:"Robotfindskitten2600 (26-04-2003) (Jeremy Penner) [a2]"},
	"0173675D40A8D975763EE493377CA87D":{n:"Roc 'n Rope (1984) (CBS Electronics) (PAL)"},
	"65BD29E8AB1B847309775B0DE6B2E4FE":{n:"Roc 'n Rope (1984) (Coleco)"},
	"D97FD5E6E1DAACD909559A71F189F14B":{n:"Rocky & Bullwinkle (04-20-1983) (M Network) (Prototype)"},
	"A89A3E0547D6887279C34ABA4B17A560":{n:"Rocky & Bullwinkle (1983) (Mattel) (Prototype)"},
	"DB80D8EF9087AF4764236F7B5649FA12":{n:"Rocky & Bullwinkle (1983) (Mattel) (Prototype) (4K)"},
	"2F16663B01591539624D0EF52934A17D":{n:"Rocky and Bullwinkle"},
	"3F96EB711928A6FAC667C04ECD41F59F":{n:"Rodeo Champ (4 Game in One Dark Green) (1983) (BitCorp) (PAL)"},
	"67931B0D37DC99AF250DD06F1C095E8D":{n:"Room of Doom (1982) (CommaVid)",c:1},
	"685E9668DC270B6DEEB9CFBFD4D633C3":{n:"Room of Doom (1982) (CommaVid) (PAL)",c:1},
	"A936D80083E99D48752AD15C2B5F7C96":{n:"Room of Doom (208 in 1) (Unknown) (PAL)",c:1},
	"CBB0EE17C1308148823CC6DA85BFF25C":{n:"Rotating Colors Demo 1 (Junkosoft) (PD)"},
	"C1B038CE5CB6D85E956C5509B0E0D0D8":{n:"Rotating Colors Demo 2 (Junkosoft) (PD)"},
	"1F2AE0C70A04C980C838C2CDC412CF45":{n:"Rubik's Cube (1984) (Atari)"},
	"40B1832177C63EBF81E6C5B61AAFFD3A":{n:"Rubik's Cube 3-D (1982) (Atari) (Prototype)"},
	"B6821AC51C4C1DCB283F01BE2F047DC1":{n:"Rubik's Cube 3D Demo (25-11-2002) (TJ)"},
	"B731D35E4AC6B3B47EBA5DD0991F452F":{n:"Rubik's Cube 3D Demo (Final) (08-01-2003) (TJ)"},
	"6058E40CE79D7434C7F7477B29ABD4A5":{n:"Rubik's Cube Demo (23-12-2002) (CT)"},
	"3A35D7F1DC2A33565C8DCA52BAA86BC4":{n:"Rubik's Cube Demo 2 (23-12-2002) (CT)"},
	"73B4E8F8B04515D91937510E680214BC":{n:"Rubik's Cube Demo 3 (24-12-2002) (CT)"},
	"6847CE70819B74FEBCFD03E99610243B":{n:"Ruby Runner 4A50"},
	"E18ABE87035379C56B435BFE8175077B":{n:"Rumble 2600 (Grimlock) (Hack)"},
	"B9B4612358A0B2C1B4D66BB146767306":{n:"Rush Hour (1983) (Commavid) (Prototype)"},
	"F3CD0F886201D1376F3ABAB2DF53B1B9":{n:"Rush Hour (1983) (Commavid) (Prototype)"},
	"AAD61898633F470CE528E3D7EF3D0ADB":{n:"Rush Hour (1983) (Commavid) (Prototype) [a1]"},
	"EBF2DFF78A08733251BF3838F02F7938":{n:"Rush Hour (1983) (Commavid) (Prototype) [a2]"},
	"3391F7C4C656793F92299F4187E139F7":{n:"Rush Hour (1983) (Commavid) (Prototype) [a4]"},
	"8749A0D088DF25218C149DC325ABC7CA":{n:"Rush Hour (1983) (Commavid) (Prototype) [a5]"},
	"C529E63013698064149B9E0468AFD941":{n:"S.I.PLIX 2 (Hack)",p:1},
	"298387B0637173D2002770A649B4FBCA":{n:"S.I.PLIX 2 (Hack) [a]",p:1},
	"17BA72433DD41383065D4AA6DEDB3D91":{n:"SCSIcide (09-06-2001) (Joe Grand)"},
	"523F5CBB992F121E2D100F0F9965E33F":{n:"SCSIcide (1.30) (CGE 2001 Release) (Joe Grand)",p:1},
	"843435EB360ED72085F7AB9374F9749A":{n:"SCSIcide (1.31) (Joe Grand)",p:1},
	"9EFA877A98DD5A075E058214DA428ABB":{n:"SCSIcide (1.32) (Hozer Video Games)",p:1},
	"FECE458A8023A809A5006867FECA40E8":{n:"SCSIcide (24-02-2001) (Joe Grand) (PD)"},
	"742DE93B8D849220F266B627FBABBA82":{n:"SCSIcide (25-02-2001) (Chris Wilkson) (PD)"},
	"FF87D58125AE517EB7B09A0475A1CCDC":{n:"SCSIcide (Score Hack 1) (24-02-2001) (Joe Grand) (PD)"},
	"E9C5D04643855949A23FF29349AF74EA":{n:"SCSIcide (Score Hack 2) (24-02-2001) (Joe Grand) (PD)"},
	"62921652F6634EB1A0940ED5489C7E18":{n:"SCSIcide (V1.09) (2001) (Joe Grand)",p:1},
	"EAE0C06EE61C63B81CD016096FC901B0":{n:"SCSIcide (v1.0) (2001) (Joe Grand)"},
	"7991E1797E5E9F311FD957E62D889DFF":{n:"SCSIcide (v1.1) (2001) (Joe Grand)",p:1},
	"6538E454B0498AD2BEFE1EF0F87815C0":{n:"SCSIcide (v1.2) (2001) (Joe Grand)",p:1},
	"B1A6C96E9093352106BC335E96CAA154":{n:"SCSIcide Pre-release 1 (Joe Grand)"},
	"07A3AF1E18B63765B6807876366F5E8A":{n:"SCSIcide Pre-release 2 (Joe Grand)"},
	"D483F65468D9A265661917BAE1A54F3E":{n:"SCSIcide Pre-release 3 (Joe Grand)"},
	"34340C8EECD1E557314789CC6477E650":{n:"SCSIcide Pre-release 4 (Joe Grand)"},
	"F34DD3B8156AAF113CB621B2E51D90B8":{n:"SCSIcide Pre-release 5 (Joe Grand)"},
	"A0028F057D496F22B549FD8DEECC6F78":{n:"SCSIcide Pre-release 6 (Joe Grand)"},
	"0AC0D491763153FAC75F5337CE32A9D6":{n:"SPAM Image Demo (PD)"},
	"504688D49A41BF03D8A955512609F3F2":{n:"SWOOPS! (TJ)",p:1},
	"278F14887D601B5E5B620F1870BC09F6":{n:"SWOOPS! (v0.96) (TJ)",p:1},
	"5D8F1AB95362ACDF3426D572A6301BF2":{n:"SWOOPS! (v0.96) (TJ) (PAL)",p:1},
	"88D8A1ACCAB58CF1ABB043613CF185E9":{n:"Sabotage (Ultravison)"},
	"64FAB9D15DF937915B1C392FC119B83B":{n:"Saboteur (05-20-1983) (Atari) (Prototype)"},
	"350E0F7B562EC5E457B3F5AF013648DB":{n:"Saboteur (06-09-1983) (Atari) (Prototype)"},
	"4E01D9072C500331E65BB87C24020D3F":{n:"Saboteur (06-15-1983) (Atari) (Prototype)"},
	"1EC57BBD27BDBD08B60C391C4895C1CF":{n:"Saboteur (09-02-1983) (Atari) (Prototype)"},
	"A4ECB54F877CD94515527B11E698608C":{n:"Saboteur (12-20-1983) (Atari) (Prototype)"},
	"E723AD8F406CB258B89681EF4CEF0EFF":{n:"Sadoom (TJ) (PAL) (Hack)",p:1},
	"81073D0377A2BADEF8D5E74FC44FC323":{n:"Sadoom (TJ) (PAL60) (Hack)",p:1},
	"7AB0917107B6EC768A5EBAADF28C497A":{n:"Santa's Helper (Hack)",p:1},
	"7BB286CB659D146AF3966D699B51F509":{n:"Save Mary! (04-03-1989) (Atari) (Prototype)"},
	"4884B1297500BD1243659E43C7E7579E":{n:"Save Mary! (10-24-1991) (Atari) (Prototype) (PAL)"},
	"4D502D6FB5B992EE0591569144128F99":{n:"Save Mary! (11-21-1989) (Atari) (Prototype)"},
	"01297D9B450455DD716DB9658EFB2FAE":{n:"Save Our Ship (1983) (TechnoVision) (PAL)"},
	"49571B26F46620A85F93448359324C28":{n:"Save Our Ship (Unknown)"},
	"ED1A784875538C7871D035B7A98C2433":{n:"Save Our Ship (Unknown) (Hack)"},
	"E377C3AF4F54A51B85EFE37D4B7029E6":{n:"Save the Whales (1983) (20th Century Fox) (Prototype)"},
	"2516F4F4B811EDE4ECF6FBEB5D54A299":{n:"Schiessbude (1983) (Quelle) (PAL)"},
	"F6F1B27EFC247A0E8D473DDB4269FF9E":{n:"Schnapp die Apfeldiebe (1983) (Quelle) (PAL)"},
	"E040DF95A055B18EBDB094E904CB71B2":{n:"Score Demo (B. Watson)"},
	"EE67DC0B01746372D2B983D88F48E24F":{n:"Scroller Demo (02-01-2003) (CT)"},
	"0F2E09C71CC216F79D22A804152BA24B":{n:"Scroller Demo (Bob Colbert) (PD)",c:1},
	"0D07D2C1BE1A5EAAEA235A533BCDA781":{n:"Scrolling Playfield 1 (Junkosoft) (PD)"},
	"F6C13E816E58C8C62F82B2C8B91A2D67":{n:"Scrolling Playfield 2 (Junkosoft) (PD)"},
	"A6737C81542A99EE71CB5F5FF14703D9":{n:"Scrolling Playfield 3 (Junkosoft) (PD)"},
	"0D786A41695E5FC8CFFD05A6DBB3F659":{n:"Scrolling Playfield With Score (10-02-2003) (Aaron Bergstrom)"},
	"19E761E53E5EC8E9F2FCEEA62715CA06":{n:"Scuba Diver (1983) (Panda)"},
	"1BC2427AC9B032A52FE527C7B26CE22C":{n:"Sea Battle (1983) (M Network)"},
	"624E0A77F9EC67D628211AAF24D8AEA6":{n:"Sea Hawk (1983) (Panda)"},
	"3FD53BFEEE39064C945A769F17815A7F":{n:"Sea Hawk (CCE)"},
	"8FA47E5242776E841DF7E708B12EB998":{n:"Sea Hawk (Genesis)"},
	"07F42847A79E4F5AE55CC03304B18C25":{n:"Sea Hawk (Zellers)"},
	"5DCCF215FDB9BBF5D4A6D0139E5E8BCB":{n:"Sea Hunt (1987) (Froggo)"},
	"D8ACAA980CDA94B65066568DD04D9EB0":{n:"Sea Hunt (CCE)"},
	"68489E60268A5E6E052BAD9C62681635":{n:"Sea Monster (1982) (BitCorp) (PAL)"},
	"DF6A46714960A3E39B57B3C3983801B5":{n:"Sea Monster (1982) (Puzzy) (PAL)"},
	"A4B9423877A0B86CA35B52CA3C994AC5":{n:"Sea Monster (1983) (CCE)"},
	"2124CF92978C46684B6C39CCC2E33713":{n:"Sea Monster (Unknown) (PAL)"},
	"74D072E8A34560C36CACBC57B2462360":{n:"Seahawk (1982) (Sancho) (PAL)"},
	"A8C48B4E0BF35FE97CC84FDD2C507F78":{n:"Seamonster (1982) (Puzzy)"},
	"240BFBAC5163AF4DF5AE713985386F92":{n:"Seaquest (1983) (Activision)"},
	"EBCBC8A181A738E13DF6216E5C329230":{n:"Seaquest (1983) (Activision) (16K)"},
	"026180BF641FF17D8577C33FACF0EDEA":{n:"Seaquest (1983) (Activision) (8K)"},
	"FD0E5148162E8EC6719445D559F018A9":{n:"Seaquest (1983) (Activision) (PAL)"},
	"0B24658714F8DFF110A693A2052CC207":{n:"Seaquest (1983) (CCE)"},
	"79C27F90591E3FDC7D2ED020ECBEDEB3":{n:"Seaquest (1983) (CCE) [a]"},
	"BC33C685E6FFCED83ABE7A43F30DF7F9":{n:"Seaquest (1983) (Dynacom)"},
	"94D90F63678E086F6B6D5E1BC6C4C8C2":{n:"Seaquest (Digivision)"},
	"10AF8728F975AA35A99D0965DE8F714C":{n:"Seaquest (Dinatronic)"},
	"5B6F5BCBBDE42FC77D0BDB3146693565":{n:"Seaquest (Unknown) (PAL)"},
	"40EB4E263581B3DFEC6DD8920B68E00F":{n:"Seawolf 3 (03-23-1981) (Sears) (Prototype) (PAL)"},
	"605FD59BFEF88901C8C4794193A4CBAD":{n:"Secret Agent (1983) (Data Age) (Prototype)",p:1},
	"FC24A94D4371C69BC58F5245ADA43C44":{n:"Secret Quest (1989) (Atari)"},
	"2D2C5F0761E609E3C5228766F446F7F8":{n:"Secret Quest (1989) (Atari) (PAL)"},
	"F3DFAE774F3BD005A026E29894DB40D3":{n:"See Saw (Double-Game Package) (1983) (Quelle) (PAL)"},
	"8DA51E0C4B6B46F7619425119C7D018E":{n:"Sentinel (1990) (Atari)"},
	"55ACE3C775F42EB46F08BB1DCA9114E7":{n:"Shadow Keep (04-03-2003) (Andrew Towers)"},
	"D7DD56677E4EC1E6627419478A4A9668":{n:"Shadow Keep (Fixed) (04-03-2003) (Andrew Towers)"},
	"54F7EFA6428F14B9F610AD0CA757E26C":{n:"Shark Attack (1982) (Apollo)"},
	"5069FECBE4706371F17737B0357CFA68":{n:"Shark Attack (1982) (Apollo) (PAL)"},
	"90B1799DDDB8BF748EE286D22E609480":{n:"Ship Demo (PD)"},
	"1DB3BC4601F22CF43BE7CE015D74F59A":{n:"Ship Demo (V 10) (PD)"},
	"85E48D68C8D802E3BA9D494A47D6E016":{n:"Ship Demo (V 15) (PD)"},
	"A0563DD6D8215C38C488FBBD61435626":{n:"Ship Demo (V 1501) (PD)"},
	"1B1DAAA9AA5CDED3D633BFCBEB06479C":{n:"Ship Demo (V 1502) (PD)"},
	"B5A1A189601A785BDB2F02A424080412":{n:"Shootin' Gallery (1982) (Imagic)"},
	"557E893616648C37A27AAB5A47ACBF10":{n:"Shooting Arcade (01-16-1990) (Atari) (Prototype) (PAL)"},
	"15C11AB6E4502B2010B18366133FC322":{n:"Shooting Arcade (09-19-1989) (Atari) (Prototype)"},
	"25B6DC012CDBA63704EA9535C6987BEB":{n:"Shuttle Orbiter (1983) (Avalon Hill)"},
	"E3C0451D29DAD724231BC5818EC4BAE0":{n:"Single-Scanline Positioning Demo 1 (2001) (Roger Williams)"},
	"4C205F166157154DF2F1EF60D87E552F":{n:"Single-Scanline Positioning Demo 2 (2001) (Roger Williams)"},
	"DE8443FF47283E7B274A7838CB071FB6":{n:"Sinistar (01-04-1984) (Atari) (Prototype)"},
	"3E88CCA5B860D0BD8947479E74C44284":{n:"Sinistar (01-23-1984) (Atari) (Prototype)"},
	"1E85F8BCCB4B866D4DAA9FCF89306474":{n:"Sinistar (02-13-1984) (Atari) (Prototype)"},
	"EA38FCFC06AD87A0AED1A3D1588744E4":{n:"Sinistar (1984) (Atari) (Prototype)"},
	"4C8970F6C294A0A54C9C45E5E8445F93":{n:"Sir Lancelot (1983) (Xonox)"},
	"DD0CBE5351551A538414FB9E37FC56E8":{n:"Sir Lancelot (1983) (Xonox) (PAL)"},
	"7EAD257E8B5A44CAC538F5F54C7A0023":{n:"Sir Lancelot (1983) (Xonox) [a1]"},
	"8490E1014C2BAA0D3A3A08854E5D68B3":{n:"Sir Lancelot (1983) (Xonox) [a2]"},
	"F847FB8DBA6C6D66D13724DBE5D95C4D":{n:"Skate Boardin' (1987) (Absolute)"},
	"ABE40542E4FF2D1C51AA2BB033F09984":{n:"Skate Boardin' (1987) (Absolute) (PAL)"},
	"7F9FBE3E00A21EA06E6AE5E0E5DB2143":{n:"Skate Boardin' (2002) (Skyworks)"},
	"39C78D682516D79130B379FA9DEB8D1C":{n:"Skeet Shoot (1981) (Apollo)"},
	"5F2B4C155949F01C06507FB32369D42A":{n:"Skeet Shoot (1981) (Apollo) (4K)"},
	"0832FB2EE654BF9382BC57D2B16D2FFC":{n:"Skeet Shoot (1981) (Apollo) (PAL)"},
	"4189ADFC1B30C121248876E3A1A3AC7E":{n:"Skeleton (Complete) (06-09-2002) (Eric Ball)"},
	"40E12C008037A323A1290C8FA4D2FE7F":{n:"Skeleton (NTSC) (06-09-2002) (Eric Ball)"},
	"647162CCEB550FD49820E2206D9EE7E8":{n:"Skeleton (NTSC) (2002) (Eric Ball)"},
	"8E42674972D6805068FC653E014370FD":{n:"Skeleton (PAL) (15-10-2002) (Eric Ball)"},
	"C033DC1D7B6FDE41B9CADCE9638909BB":{n:"Skeleton (V1.1) (06-09-2002) (Eric Ball)"},
	"28A4CD87FB9DE4EE91693A38611CB53C":{n:"Skeleton (V1.1) (NTSC) (24-10-2002) (Eric Ball)"},
	"8E887D1BA5F3A71AE8A0EA16A4AF9FC9":{n:"Skeleton (V1.1) (PAL) (24-10-2002) (Eric Ball)"},
	"F20BD756F3990E06C492F53CD0168E68":{n:"Skeleton+ (03-05-2003) (Eric Ball) (NTSC)"},
	"22B22C4CE240303012E8A9596AE8D189":{n:"Skeleton+ (03-05-2003) (Eric Ball) (PAL)"},
	"CFEF1A2D1F6A5EE7A5E1F43F3056F112":{n:"Skeleton+ (05-05-2003) (Eric Ball) (NTSC)"},
	"75B22FDF632D76E246433DB1EBCCD3C4":{n:"Skeleton+ (05-05-2003) (Eric Ball) (PAL)"},
	"F98D869F287D2CE4F8FB36E0686929D9":{n:"Skeleton+ (17-04-2003) (Eric Ball) (NTSC)"},
	"43F8459D39FB4EDDF9186D62722FF795":{n:"Skeleton+ (17-04-2003) (Eric Ball) (PAL)"},
	"EAFE8B40313A65792E88FF9F2FE2655C":{n:"Skeleton+ (NTSC)"},
	"63C7395D412A3CD095CCDD9B5711F387":{n:"Skeleton+ (PAL)"},
	"8654D7F0FB351960016E06646F639B02":{n:"Ski Hunt (1983) (Home Vision) (PAL)"},
	"F10E3F45FB01416C87E5835AB270B53A":{n:"Ski Run (Ariola) (PAL)"},
	"5305F69FBF772FAC4760CDCF87F1AB1F":{n:"Ski Run (Jone Yuan)"},
	"B76FBADC8FFB1F83E2CA08B6FB4D6C9F":{n:"Skiing (1980) (Activision)"},
	"0D90A0EE73D55539B7DEF24C88CAA651":{n:"Skiing (1980) (Activision) (16K)"},
	"60BBD425CB7214DDB9F9A31948E91ECB":{n:"Skiing (1980) (Activision) (4K)"},
	"7623A639A6FFFDB246775FE2EABC8D01":{n:"Skiing (1980) (Activision) (8K)"},
	"EEC61CC4250DF70939D48FE02D7122AC":{n:"Skiing (1980) (Activision) (PAL)"},
	"E1F88DA6DA8A7D521CA1DCBF2BC6978B":{n:"Skiing (1980) (Activision) (PAL) (4K)"},
	"0E4B2B6E014A93EF8BE896823DA0D4EC":{n:"Skiing (208 in 1) (Unknown) (PAL)"},
	"367411B78119299234772C08DF10E134":{n:"Skiing (32 in 1) (1988) (Atari) (PAL)"},
	"40B59249E05135BCA33861E383735E9E":{n:"Skiing (32 in 1) (1988) (Atari) (PAL) (4K)"},
	"40D9F5709877ECF3DD1184F9791DD35E":{n:"Skiing (Dactari - Milmar)"},
	"7ED61A18CEBDECA0A93BE1F5461731E5":{n:"Skiing (Dactari) (4K)"},
	"C118854D670289A8B5D5156AA74B0C49":{n:"Skiing (Jone Yuan)"},
	"13584411DA0A8D431991035423FDC0DC":{n:"Skiing (Jone Yuan) (4K)"},
	"340F546D59E72FB358C49AC2CA8482BB":{n:"Skindiver (1983) (Sancho) (PAL)"},
	"C31A17942D162B80962CB1F7571CD1D5":{n:"Sky Alien (1983) (Home Vision) (PAL)"},
	"BC97D544F1D4834CC72BCC92A37B8C1B":{n:"Sky Demo (PD)"},
	"46C021A3E9E2FD00919CA3DD1A6B76D8":{n:"Sky Diver (1979) (Atari)"},
	"3D8A2D6493123A53ADE45E3E2C5CAFA0":{n:"Sky Diver (1979) (Atari) (4K)"},
	"756CA07A65A4FBBEDEB5F0DDFC04D0BE":{n:"Sky Diver (1979) (Atari) (PAL)"},
	"5EF303B9F0AA8CF20720C560E5F9BAA1":{n:"Sky Diver (1979) (Atari) (PAL) (4K)"},
	"3F75A5DA3E40D486B21DFC1C8517ADC0":{n:"Sky Diver (32 in 1) (1988) (Atari) (PAL)"},
	"F1FE06EBE2900EAC4CDD17799389A102":{n:"Sky Diver (32 in 1) (1988) (Atari) (PAL) (4K)"},
	"B23EBF427713DD0198B7EF47DBD07EF4":{n:"Sky Diver (Jone Yuan) (4K) (Hack)"},
	"5A81AD4E184050851E63C8E16E3DAC77":{n:"Sky Diver (Jone Yuan) (Hack)"},
	"37252757A79DC5B174E3C03D6EA0BDCB":{n:"Sky Diver (Unknown) (PAL) (4K) (Hack)"},
	"8190B403D67BF9792FE22FA5D22F3556":{n:"Sky Diver (Unknown) (PAL) (Hack)"},
	"2A0BA55E56E7A596146FA729ACF0E109":{n:"Sky Jinks (1982) (Activision)"},
	"05AFF8F626EF870432AE3B3D9D5AA301":{n:"Sky Jinks (1982) (Activision) (16K)"},
	"8BD8F65377023BDB7C5FCF46DDDA5D31":{n:"Sky Jinks (1982) (Activision) (4K)"},
	"A4790224BD5AFABD53CBE93E46A7F241":{n:"Sky Jinks (1982) (Activision) (8K)"},
	"50A410A5DED0FC9AA6576BE45A04F215":{n:"Sky Jinks (1982) (Activision) (PAL)"},
	"502168660BFD9C1D2649D415DC89C69D":{n:"Sky Jinks (1982) (Activision) (PAL) (4K)"},
	"93DC15D15E77A7B23162467F95A5F22D":{n:"Sky Jinks (CCE)"},
	"8764462D7D19A33B0717AF22B99FC88F":{n:"Sky Jinks (CCE) (4K)"},
	"E1B90F1E01B1A316D7BBF141525CC00E":{n:"Sky Jinks (Unknown) (PAL) (4K) (Hack)"},
	"F992A39B46AA48188FAB12AD3809AE4A":{n:"Sky Jinks (Unknown) (PAL) (Hack)"},
	"4C9307DE724C36FD487AF6C99CA078F2":{n:"Sky Patrol (1982) (Imagic) (Prototype)"},
	"3B91C347D8E6427EDBE942A7A405290D":{n:"Sky Skipper (1983) (Parker Bros)"},
	"514F911ECFF2BE5EEFF2F39C49A9725C":{n:"Sky Skipper (1983) (Parker Bros) (PAL)"},
	"1AA7344B563C597EECFBFCF8E7093C27":{n:"Slot Invaders (David Marli) (Hack)"},
	"F90B5DA189F24D7E1A2117D8C8ABC952":{n:"Slot Machine (1979) (Atari)"},
	"81254EBCE88FA46C4FF5A2F4D2BAD538":{n:"Slot Machine (1979) (Atari) (4K)"},
	"705FE719179E65B0AF328644F3A04900":{n:"Slot Machine (1979) (Atari) (4K) [a]"},
	"FC6052438F339AEA373BBC999433388A":{n:"Slot Machine (1979) (Atari) (PAL)"},
	"75EA128BA96AC6DB8EDF54B071027C4E":{n:"Slot Machine (32 in 1) (1988) (Atari) (PAL)"},
	"1E272D09C0E55F5EF14FCB76A735F6D7":{n:"Slot Machine (32 in 1) (1988) (Atari) (PAL) (4K)"},
	"DBDD21E1EE3D72119E8CD14D943C585B":{n:"Slot Machine (Unknown) (PAL) (4K)"},
	"AED82052F7589DF05A3F417BB4E45F0C":{n:"Slot Racers (1978) (Atari)"},
	"5F708CA39627697E859D1C53F8D8D7D2":{n:"Slot Racers (1978) (Atari) (4K)"},
	"A7ED7DC5CBC901388AFA59030FB11D26":{n:"Slot Racers (1978) (Atari) (PAL)"},
	"7A64A8B727C8215D945E37D565CA95A5":{n:"Slot Racers (1978) (Atari) (PAL) (4K)"},
	"D1D704A7146E95709B57B6D4CAC3F788":{n:"Slot Racers (32 in 1) (1988) (Atari) (PAL)"},
	"F6D512BEF1BF253DC935D0E13C3D1462":{n:"Slot Racers (Unknown) (PAL) (4K)"},
	"92D1F6AC179EBE5963868D6BC1BDDA8D":{n:"Smash Hit Pak - Frogger, Boxing, Seaquest, Skiing, Stampede (HES) (PAL)"},
	"73C545DB2AFD5783D37C46004E4024C2":{n:"Smurf (1982) (CBS Electronics) (PAL)"},
	"24AFF972D58990F9B88A6D787C796F1E":{n:"Smurf (1982) (CBS Electronics) (PAL) [a]"},
	"3D1E83AFDB4265FA2FB84819C9CFD39C":{n:"Smurf - Rescue in Gargamel's Castle (1982) (Coleco)"},
	"A204CD4FB1944C86E800120706512A64":{n:"Smurfs Save the Day (1983) (Coleco)"},
	"898B5467551D32AF48A604802407B6E8":{n:"Snail Against Squirrel (1983) (BitCorp) (PAL)"},
	"AC26D7D37248D1D8EAC5ECCACDBEF8DB":{n:"Snail Against Squirrel (Unknown) (PAL)"},
	"9C6FAA4FF7F2AE549BBCB14F582B70E4":{n:"Sneak 'n Peek (1982) (U.S. Games)"},
	"F21813AA050437F0DBC8479864ACEC6D":{n:"Sneak 'n Peek (Unknown) (PAL)"},
	"C54B4207CE1D4BF72FADBB1A805D4A39":{n:"Sniper (Feb 30) (2001) (Prototype)"},
	"01293BD90A4579ABB7AED2F7D440681F":{n:"Snoopy (1983) (Century) (PAL)"},
	"45A095645696A217E416E4BD2BAEA723":{n:"Snoopy (Digivision)"},
	"0F39FC03D579D0D93A6B729A3746843E":{n:"Snoopy and the Red Baron (05-27-1983) (Atari) (Prototype)"},
	"57939B326DF86B74CA6404F64F89FCE9":{n:"Snoopy and the Red Baron (1983) (Atari)"},
	"F844F4C6F3BAAAF5322657442D6F29EB":{n:"Snoopy and the Red Baron (1983) (Atari) (PAL)"},
	"BDA1463E02AE3A6E1107FFE1B572EFD2":{n:"Snoopy and the Red Baron (1983) (Atari) (PAL) [a]"},
	"C5D2834BF98E90245E545573EB7E6BBC":{n:"Snoopy and the Red Baron (CCE)"},
	"D2DEDDB77C8B823E4BE9C57CB3C69ADC":{n:"Snoopy and the Red Baron (Canal 3)"},
	"75028162BFC4CC8E74B04E320F9E6A3F":{n:"Snow White and the Seven Dwarfs (02-09-1983) (Atari) (Prototype)"},
	"75EE371CCFC4F43E7D9B8F24E1266B55":{n:"Snow White and the Seven Dwarfs (11-09-1982) (Atari) (Prototype)"},
	"3F6DBF448F25E2BD06DEA44248EB122D":{n:"Soccer (1989) (Telegames)"},
	"604E09724555807C28108049EFE34A13":{n:"Sokoban (01-01-2003) (Adam Wozniak)"},
	"B4DAEDB43511521DB9036D503B3C1B69":{n:"Sokoban (01-01-2003) (Adam Wozniak) [a1]"},
	"947317A89AF38A49C4864D6BDD6A91FB":{n:"Solar Fox (1983) (CBS Electronics)"},
	"E03B0B091BEA5BC9D3F14EE0221E714D":{n:"Solar Fox (1983) (CBS Electronics) (PAL)"},
	"DF753CB87D3AF4D03F694AB848638108":{n:"Solar Fox (1983) (CBS Electronics) (PAL) [a]"},
	"97842FE847E8EB71263D6F92F7E122BD":{n:"Solar Storm (1983) (Imagic)",p:1},
	"E6DE4EF9AB62E2196962AA6B0DEDAC59":{n:"Solar Storm (1983) (Imagic) (PAL)",p:1},
	"E72EB8D4410152BDCB69E7FBA327B420":{n:"Solaris (1986) (Atari)"},
	"BC4CF38A4BEE45752DC466C98ED7AD09":{n:"Solaris (1986) (Atari) (PAL)"},
	"0ADB21206DE92E8AEC5EF295805EBB90":{n:"Solaris (Genesis)"},
	"F19ABA18F86E415812480AD2BE221425":{n:"Solaris Trainer (2002) (Chris Larkin) (Hack)"},
	"2DFEC1615C49501FEFC02165C81955E6":{n:"Song (05-11-2002) (Paul Slocum)",c:1},
	"CAD982C9B45BC5EFF34E4EA982D5F1CA":{n:"Song (17-02-2003) (Paul Slocum)",c:1},
	"D2C4F8A4A98A905A9DEEF3BA7380ED64":{n:"Sorcerer (1983) (Mythicon)"},
	"5F7AE9A7F8D79A3B37E8FC841F65643A":{n:"Sorcerer's Apprentice (1983) (Atari)"},
	"2E82A1628EF6C735C0AB8FA92927E9B0":{n:"Sorcerer's Apprentice (1983) (Atari) (PAL)"},
	"27C4C2AF4B46394BB98638AF8E0F6E9D":{n:"Sorcerer's Apprentice (1983) (Atari) (Prototype)"},
	"101AB60F4000A5D13792EF0ABAD5F74B":{n:"Sorcerer's Apprentice (1983) (Atari) [a]"},
	"F78C125B5DA483C41E51522947D6C4CE":{n:"Sound Paddle V1 (Dennis Caswell & Jim Nitchals) (PD)",p:1},
	"EEE7695AE3EEA7818321DF0B790B31F3":{n:"Sound Paddle V2 (Dennis Caswell & Jim Nitchals) (PD)",p:1},
	"32F4E47A71601AB06CFB59E1C6A0B846":{n:"Sound X (1994) (Ed Federmeyer)"},
	"7DBC8FA2E488E3F6B87FBE0F76C5B89F":{n:"Sound X (1996) (Ed Federmeyer)"},
	"310BA30E25EA8957E58180B663503C0C":{n:"Sound X6 (1994) (Ed Federmeyer)"},
	"24B9ADAC1B4F85B0BAC9BF9B9E180906":{n:"Space 2002 (Angelino) (Hack)"},
	"17BADBB3F54D1FC01EE68726882F26A6":{n:"Space Attack (1982) (M Network)"},
	"ABB741C83F665D73C86D90A7D9292A9B":{n:"Space Attack (1989) (Telegames) (PAL)"},
	"F047DF70D3D08E331122CD2DE61D6AF8":{n:"Space Battle (NTSC)"},
	"CC12581E079CD18330A89902625B8347":{n:"Space Battle (PAL)"},
	"559317712F989F097EA464517F1A8318":{n:"Space Canyon (1983) (Panda)"},
	"DF6A28A89600AFFE36D94394EF597214":{n:"Space Cavern (1981) (Apollo)"},
	"D9548AD44E67EDEC202D1B8B325E5ADF":{n:"Space Cavern (1981) (Apollo) (PAL)"},
	"7AC4F4FB425DB38288FA07FB8FF4B21D":{n:"Space Eagle (1983) (Goliath) (PAL)"},
	"0D27C7F5DB349B592F70F68DAF5E8F3B":{n:"Space Instigators (21-10-2002) (CT)"},
	"B2A6F31636B699AEDA900F07152BAB6E":{n:"Space Instigators (Public Release 2) (06-01-2003) (CT)"},
	"18BEBBBD41C234F82B1717B1905E6027":{n:"Space Instigators (Public Release) (02-01-2003) (CT)"},
	"CDA38714267978B9A8B0B24BEE3529AE":{n:"Space Instigators (V1.6) (17-10-2002) (CT)"},
	"98E6E34AF45A0664597972C3BB31180F":{n:"Space Instigators (V1.7) (17-10-2002) (CT)"},
	"52BAE1726D2D7A531C9CA81E25377FC3":{n:"Space Instigators (V1.8 Fixed) (20-10-2002) (CT)"},
	"CFEE10BD7119F10B136921CED2EE8972":{n:"Space Instigators (V1.8) (19-10-2002) (CT)"},
	"E927ECF80F3784D745ABD8368D78F2F3":{n:"Space Instigators (V1.8) (19-10-2002) (CT) [a1]"},
	"DD10B5EE37FDBF909423F2998A1F3179":{n:"Space Instigators (V1.9) (21-10-2002) (CT)"},
	"E10BF1AF6BF3B4A253C5BEF6577FE923":{n:"Space Invaders (1978) (Atari) [h1]"},
	"07F91E33E76F53BB9D2731FD5D8A35A5":{n:"Space Invaders (1978) (Atari) [t1]"},
	"72FFBEF6504B75E69EE1045AF9075F66":{n:"Space Invaders (1980) (Atari)"},
	"F1B7EDFF81CEEF5AF7AE1FA76C8590FC":{n:"Space Invaders (1980) (Atari) (PAL)"},
	"8747BA79CD39FA83A529BB26010DB21B":{n:"Space Invaders (1980) (Atari) (PAL) [different speed and colors]"},
	"7CC77F6745E1F2B20DF4A4327D350545":{n:"Space Invaders (1980) (Atari) (PAL) [fixed]"},
	"61DBE94F110F30CA4EC524AE5CE2D026":{n:"Space Invaders (1983) (CCE)"},
	"C126656DF6BADFA519CC63E681FB3596":{n:"Space Invaders (2002) (Ron Corcoran) (Hack)"},
	"2EF36341D1BF42E02C7EA2F71E024982":{n:"Space Invaders (Explosion Hack)"},
	"270229C6D5578446E6A588492E4E5910":{n:"Space Invaders 2 (Hack)"},
	"0963AA9F7F6CF5A36FF700001583624E":{n:"Space Invaders 2 (Hack) [o1]"},
	"2CFB188C1091CC7EC2A7E60064D2A758":{n:"Space Invaders Hack Demo (2003) (SnailSoft)"},
	"6F2AAFFAAF53D23A28BF6677B86AC0E3":{n:"Space Jockey (1982) (U.S. Games)"},
	"D1A9478B99D6A55E13A9FD4262DA7CD4":{n:"Space Jockey (1982) (U.S. Games) (4K)"},
	"457E7D4FCD56EBC47F5925DBEA3EE427":{n:"Space Jockey (1983) (Carrere Video) (PAL)"},
	"EE9CAEE4EB958284FB10C277B14537F1":{n:"Space Jockey (1983) (Carrere Video) (PAL) (4K)"},
	"E1D79E4E7C150F3861256C541EC715A1":{n:"Space Jockey (208 in 1) (Unknown) (PAL)"},
	"822A950F27FF0122870558A89A49CAD3":{n:"Space Jockey (Unknown) (PAL)"},
	"C689148AD9275667924AB334107B517E":{n:"Space Raid (Jone Yuan)"},
	"690A6049DB78B9400C13521646708E9C":{n:"Space Raid (King Tripod) (PAL)"},
	"345769D085113D57937198262AF52298":{n:"Space Raid (Rainbow Vision) (PAL)"},
	"1A624E236526C4C8F31175E9C89B2A22":{n:"Space Raid (Rainbow Vision) (PAL) [a]"},
	"1BEF389E3DD2D4CA4F2F60D42C932509":{n:"Space Robot (1983) (Dimax - Sinmax) (PAL)",c:1},
	"3DFB7C1803F937FADC652A3E95FF7DC6":{n:"Space Robot (Dimax - Sinmax)",c:1},
	"82E7AAB602C378CFFDD8186A099E807E":{n:"Space Robot (Unknown)"},
	"C4D888BCF532E7C9C5FDEAFBB145266A":{n:"Space Robot (Unknown) (PAL)",c:1},
	"5894C9C0C1E7E29F3AB86C6D3F673361":{n:"Space Shuttle (1983) (Activision)"},
	"4F6702C3BA6E0EE2E2868D054B00C064":{n:"Space Shuttle (1983) (Activision) (PAL)"},
	"898143773824663EFE88D0A3A0BB1BA4":{n:"Space Shuttle (1983) (Activision) [FE]"},
	"FF5A9E340D96DF6F5A5B6EB038E923BD":{n:"Space Shuttle (1983) (Activision) [t1]"},
	"A8D0A4A77CD71AC601BD71DF5A060E4C":{n:"Space Shuttle (1983) (Activision) [t2] (Fuel)"},
	"D97E3D0B4575CE0B9A6132E19CFEAC6E":{n:"Space Treat (061002) (PD)"},
	"2683D29A282DD059535AC3BB250F540D":{n:"Space Treat (12-01-2003) (Fabrizio Zavagli)"},
	"DED26E1CB17F875A9C17515C900F9933":{n:"Space Treat (29-12-2002) (Fabrizio Zavagli)"},
	"3367EEBA3269AA04720ABE6169767502":{n:"Space Treat (30-12-2002) (Fabrizio Zavagli)"},
	"75B557BE7F08DB84EC5B242207B9F241":{n:"Space Treat (30-12-2002) (Fabrizio Zavagli) [a1]"},
	"E74022CFE31EC8908844718DFBDEDF7A":{n:"Space Treat (30-12-2002) (Fabrizio Zavagli) [a2]"},
	"D49AFF83F77A1B9041AD7185DF3C2277":{n:"Space Treat (60% complete) (PD)"},
	"6C9A32AD83BCFDE3774536E52BE1CCE7":{n:"Space Treat (NTSC) (13-08-2002) (Fabrizio Zavagli)"},
	"B0C47E426C7F799AEE2C40422DF8F56A":{n:"Space Treat (PAL) (Fabrizio Zavagli)"},
	"DFAFA3FA58F5CC3F0342CCA475DF6095":{n:"Space Treat (V1.1 Beta) (24-12-2002) (Fabrizio Zavagli)"},
	"562ACB1B7FF182ABA133BDA8E21AD7C1":{n:"Space Treat Deluxe (08-03-2003) (Fabrizio Zavagli)"},
	"DF2745D585238780101DF812D00B49F4":{n:"Space Tunnel (1982) (BitCorp)"},
	"C5387FC1AA71F11D2FA82459E189A5F0":{n:"Space Tunnel (1982) (BitCorp) (PAL)"},
	"8917F7C1AC5EB05B82331CF01C495AF2":{n:"Space Tunnel (1982) (BitCorp) (PAL) [a]"},
	"BE3F0E827E2F748819DAC2A22D6AC823":{n:"Space Tunnel (1982) (Puzzy)"},
	"D73AD614F1C2357997C88F37E75B18FE":{n:"Space Tunnel (1982) (Puzzy) (PAL)"},
	"7FCD5FB59E88FC7B8473C641F44226C3":{n:"Space Tunnel (1983) (CCE)"},
	"A7EF44CCB5B9000CAF02DF3E6DA71A92":{n:"Space War (1978) (Atari)"},
	"7E9DA5CB84D5BC869854938FE3E85FFA":{n:"Space War (1978) (Atari) (4K)"},
	"F9677B2EC8728A703EB710274474613D":{n:"Space War (1978) (Atari) (PAL)"},
	"0519F395D5F7D76BE813B834AA51C0BE":{n:"Space War (1978) (Atari) (PAL) (4K)"},
	"77887E4192A6B0A781530E6CF9BE7199":{n:"Space War (1978) (Atari) [b1]"},
	"E505BD8E59E31AAED20718D47B15C61B":{n:"Space War (1982) (Funvision) (PAL)"},
	"63D6247F35902BA32AA49E7660B0ECAA":{n:"Space War (208 in 1) (Unknown) (PAL)"},
	"B702641D698C60BCDC922DBD8C9DD49C":{n:"Space War (32 in 1) (1988) (Atari) (PAL)"},
	"8F60551DB6D1535EF0030F155018C738":{n:"Space War (Unknown) (PAL) (4K)"},
	"45040679D72B101189C298A864A5B5BA":{n:"SpaceMaster X-7 (1983) (20th Century Fox)"},
	"E14FEDDEB82F5160ED5CF9CA4078E58D":{n:"SpaceMaster X-7 (208 in 1) (Unknown) (PAL)"},
	"EC5C861B487A5075876AB01155E74C6C":{n:"Spacechase (1981) (Apollo)"},
	"89EABA47A59CBFD26E74AAD32F553CD7":{n:"Spacechase (1981) (Apollo) (PAL)"},
	"FAFFD84F3A8ECEEE2FA5EA5B0A3E6678":{n:"Spectracube Invasion (Suntek) (PAL)"},
	"F3F92AAD3A335F0A1EAD24A0214FF446":{n:"Spectrum Color Demo (PD)"},
	"327FE8CF94F3A45C35A840A453DF1235":{n:"Spice Girls Rule Demo (PD)"},
	"A8A703E073183A89C94D4D99B9661B7F":{n:"Spice Invaders (Franklin Cruz) (Hack)"},
	"24D018C4A6DE7E5BD19A36F2B879B335":{n:"Spider Fighter (1982) (Activision)"},
	"8786F229B974C393222874F73A9F3206":{n:"Spider Fighter (1982) (Activision) (PAL)"},
	"BA3A17EFD26DB8B4F09C0CF7AFDF84D1":{n:"Spider Fighter (1983) (Activision) (16K)"},
	"D25018349C544320BF3FD5092EE072BC":{n:"Spider Fighter (1983) (Activision) (8K)"},
	"0FC161704C46E16F7483F92B06C1558D":{n:"Spider Fighter (1983) (CCE)"},
	"C41E7735F6701DD50E84EE71D3ED1D8F":{n:"Spider Fighter (1983) (Dynacom)"},
	"92E72F7CC569584C44C9530D645AE04E":{n:"Spider Fighter (Canal 3)"},
	"B40DEA357D41C5408546E4E4D5F27779":{n:"Spider Fighter (Digivision)"},
	"7778AC65D775A079F537E97CBDAD541C":{n:"Spider Fighter (Unknown) (PAL)"},
	"F14D5E96EC3380AEF57A4B70132C6677":{n:"Spider Kong (1983) (Goliath) (PAL) [a]"},
	"672012D40336B403EDEA4A98CE70C76D":{n:"Spider Kong (208 in 1) (Unknown) (PAL)"},
	"AE465044DFBA287D344BA468820995D7":{n:"Spider Kong (Unknown) (PAL)"},
	"21299C8C3AC1D54F8289D88702A738FD":{n:"Spider Maze (1982) (K-Tel Vision)"},
	"37B98344C8E0746C486CAF5AAEEC892A":{n:"Spider Maze (1982) (K-Tel Vision) (PAL)"},
	"D39E29B03AF3C28641084DD1528AAE05":{n:"Spider Monster (1982) (Funvision) (PAL)"},
	"199EB0B8DCE1408F3F7D46411B715CA9":{n:"Spider-Man (1982) (Parker Bros)"},
	"E77EC259E1387BC308B0534647A89198":{n:"Spider-Man (1982) (Parker Bros) (PAL)"},
	"8454ED9787C9D8211748CCDDB673E920":{n:"Spiderdroid (1987) (Froggo)"},
	"F7AF41A87533524D9A478575B0D873D0":{n:"Spiderman (1983) (Quelle) (PAL)"},
	"A4E885726AF9D97B12BB5A36792EAB63":{n:"Spike's Peak (1983) (Xonox)"},
	"B37F0FE822B92CA8F5E330BF62D56EA9":{n:"Spike's Peak (1983) (Xonox) (PAL)"},
	"9BB136B62521C67AC893213E01DD338F":{n:"Spike's Peak (1983) (Xonox) (PAL) [a]"},
	"542C6DD5F7280179B51917A4CBA4FAFF":{n:"Spinning Fireball (1983) (ZiMAG) (Prototype)"},
	"D3171407C3A8BB401A3A62EB578F48FB":{n:"Spinning Fireball (1983) (ZiMAG) (Prototype) [a]",c:1},
	"98555B95CB38E0E0B22B482B2B60A5B6":{n:"Spinning Fireball (Unknown) (PAL)",c:1},
	"CEF2287D5FD80216B2200FB2EF1ADFA8":{n:"Spitfire Attack (1983) (Milton Bradley)"},
	"FFEBB0070689B9D322687EDD9C0A2BAE":{n:"Spitfire Attack (1983) (Milton Bradley) [h1]"},
	"FB91DA78455D9B1606913FBF8C859772":{n:"Split Screen (Ballblazer) Demo (PD)"},
	"A4D026A5C200EF98518EBB77719FE8DC":{n:"SpongeBob SquarePants (2003) (Kyle Pittman) (Hack)"},
	"2C3B2843295C9D6B16996971180A3FE9":{n:"Sports Action Pak - Enduro, Ice Hockey, Fishing Derby, Dragster (1988) (HES) (PAL)"},
	"4CD796B5911ED3F1062E805A3DF33D98":{n:"Springer (1982) (Tigervision)"},
	"133456269A03E3FDAE6CDDD65754C50D":{n:"Springer (1982) (Tigervision) (PAL)"},
	"5A8AFE5422ABBFB0A342FB15AFD7415F":{n:"Sprint Master (1988) (Atari)"},
	"B2D5D200F0AF8485413FAD957828582A":{n:"Sprint Master (1988) (Atari) (PAL)"},
	"6B75F8FA4FD011A6698C58315F83D2AC":{n:"Sprintmaster DC (TJ)"},
	"D597D35C6022C590D6E75E865738558A":{n:"Sprite Color Demo (PD)"},
	"F1B2EA568B3E156E3F2849DAC83591F6":{n:"Sprite Demo (1997) (Bob Colbert) (PD)"},
	"E15B5525CF8F77297B322838DF8D999C":{n:"Sprite Demo 0 (PD)"},
	"D5C6B81212AD86FD9542A1FEDAF57CAE":{n:"Sprite Demo 1 (PD)"},
	"FE0BC4BB92C1C4DE7D5706AAA8D8C10D":{n:"Sprite Demo 2 (PD)"},
	"DBABB80E92FF18D8EECF615C0539151E":{n:"Sprite Demo 3 (PD)"},
	"61728C6CFB052E62A9ED088C5BF407BA":{n:"Sprite Demo 4 (PD)"},
	"AD7E97C19BD25D5AA3999430845C755B":{n:"Sprite Demo 5 (PD)"},
	"ACAA27D214039D89D7031609AAFA55C3":{n:"Sprite Demo 6 (PD)"},
	"2D6DA0EB85EABC93270E5BB8A466CA51":{n:"Sprite Demo 7 (PD)"},
	"DFE034297200DFF672DF9533ED1449A9":{n:"Sprite Movement Demo 1 (2001) (Roger Williams)"},
	"D4C590CCFB611A73B3331359700C01A3":{n:"Sprite Movement Demo 2 (2001) (Roger Williams)"},
	"37AB3AFFC7987995784B59FCD3FCBD31":{n:"Sprite Test (29-11-2002) (Eric Ball)"},
	"3105967F7222CC36A5AC6E5F6E89A0B4":{n:"Spy Hunter (1984) (Sega)"},
	"6A8C6940D3BE6FD01274363C4D4B298E":{n:"Spy Hunter (Genesis)"},
	"2A360BC85BF22DE438651CF92FFDA1DE":{n:"Spy Vs. Spy (4 Game in One) (1983) (BitCorp) (PAL)"},
	"BA257438F8A78862A9E014D831143690":{n:"Squeeze Box (1982) (U.S. Games)"},
	"68878250E106EB6C7754BC2519D780A0":{n:"Squirrel (1983) (CCE)"},
	"34C808AD6577DBFA46169B73171585A3":{n:"Squoosh (1983) (Apollo) (Prototype)"},
	"22ABBDCB094D014388D529352ABE9B4B":{n:"Squoosh (1983) (Apollo) (Prototype) [a]"},
	"21A96301BB0DF27FDE2E7EEFA49E0397":{n:"Sssnake (1982) (Data Age)"},
	"B3203E383B435F7E43F9492893C7469F":{n:"Sssnake (1983) (Gameworld) (PAL)"},
	"21D7334E406C2407E69DBDDD7CEC3583":{n:"Stampede (1981) (Activision)"},
	"9057694DCE8449521E6164D263702185":{n:"Stampede (1981) (Activision) (16K)"},
	"E66E5AF5DEA661D58420088368E4EF0D":{n:"Stampede (1981) (Activision) (4K)"},
	"53F147B9746FDC997C62F3DD67888EE5":{n:"Stampede (1981) (Activision) (8K)"},
	"75511BB694662301C9E71DF645F4B5A7":{n:"Stampede (1981) (Activision) (PAL)"},
	"F52F40299FD238C6FFD9E6107050DC76":{n:"Stampede (1981) (Activision) (PAL) (4K)"},
	"C9196E28367E46F8A55E04C27743148F":{n:"Stampede (32 in 1) (1988) (Atari) (PAL)"},
	"F20675C8B98518367B9F5B8EE6F7C8EA":{n:"Stampede (32 in 1) (1988) (Atari) (PAL) (4K)"},
	"F77F5FC3893DA5D00198E4CD96544AAD":{n:"Stampede (Canal 3)"},
	"866E5150C995C4AE5172E5207BA948C7":{n:"Stampede (Canal 3) (16K)"},
	"43ADF60EBDD6B5A0FAE21594ECF17154":{n:"Stampede (Jone Yuan)"},
	"D170317AE4C7D997A989C7D6567C2840":{n:"Stampede (Jone Yuan) (4K) (Hack)"},
	"1EA1ABCD2D3D3D628F59A99A9D41B13B":{n:"Stampede (Jone Yuan) (Hack)"},
	"869ABE0426E6E9FCB6D75A3C2D6E05D1":{n:"Stampede (Unknown) (PAL)"},
	"0945081A6BD00345FF3D58EB7A07330A":{n:"Stampede (Unknown) (PAL) (4K)"},
	"A8916734FF8C64EC3342F4C73FD5B57D":{n:"Stand Alone Test Cart (1982) (Atari) [a]"},
	"D9C9CECE2E769C7985494B1403A25721":{n:"Star Castle 2600 (SolidCorp)",c:1},
	"54BAFC299423F5A50B8BC3A797914706":{n:"Star Castle 2600 (SolidCorp) (PAL)",c:1},
	"CE8467AE2A3A5BC88CA72A2CE44CE28C":{n:"Star Castle 2600 (SolidCorp) (PAL) [015]",c:1},
	"DD0DE0F61AF2A2A4878E377B880A3933":{n:"Star Castle 2600 (SolidCorp) [013]",c:1},
	"C0589BB73858924389077FA3C2E9441A":{n:"Star Castle 2600 (SolidCorp) [014]",c:1},
	"39B94D41BD3B01C12B4054C1A8733783":{n:"Star Castle 2600 (SolidCorp) [016]",c:1},
	"2AEEDCC6EB1602EFB77161B0CEF832AB":{n:"Star Castle 2600 (SolidCorp) [025]",c:1},
	"1EF04E7E508296A8D9EB61CC7DAE2E5D":{n:"Star Castle 2600 (SolidCorp) [069]",c:1},
	"6E4521989A60A0DDF4FF1FC6E6E5FC3D":{n:"Star Fire (01-05-2002) (MP)"},
	"A443D8557D712845C8CD3699363A42E6":{n:"Star Fire (07-01-2003) (MP)"},
	"1E1817D9CBCC3BA75043B7DB4E6C228F":{n:"Star Fire (07-10-2002) (MP)"},
	"DBA2692A216CB6C262C78F8B111A813E":{n:"Star Fire (08-10-2002) (MP)"},
	"47BB1C677FE7BA5F376372AE7358E790":{n:"Star Fire (10-10-2002) (MP)"},
	"43E6C5159C3A093FCA88656628C6EF34":{n:"Star Fire (17-02-2003) (MP)"},
	"6F75D72E4CF996100CCDD163D57BDAC2":{n:"Star Fire (200203) (MP)"},
	"18760F1F9CA5E18610115CF7B815B824":{n:"Star Fire (23-10-2002) (MP)"},
	"539B7038ACEC0CCEDEAE40F238998579":{n:"Star Fire (25-10-2002) (MP)"},
	"16FBB36A6124567405A235821E8F69EE":{n:"Star Fire (28-11-2002) (MP)"},
	"C473B222B7C5308D0773326416094272":{n:"Star Fire (28-11-2002) (MP) [a1]"},
	"BC6432CBED32C695658514C4EB41D905":{n:"Star Fire (MP) (2002) (PD)"},
	"BF5E2079586CB307BF5EB2413E2E61AF":{n:"Star Fire - 1LK Intro (13-11-2002) (TJ)"},
	"0890A5B089191F45D0F08DD1E3235687":{n:"Star Fire - 4K Version (25-10-2002) (MP)"},
	"D2C305A443DFC49E8430964D7C1BD1B7":{n:"Star Fire - Advice on radar needed (16-10-2002) (MP)"},
	"09D19274C20768F842E8FAE84B766ABE":{n:"Star Fire - Animated Patricles (06-10-2002) (MP)"},
	"BF9DDC5DD9056633D4AC0DAC8B871DFE":{n:"Star Fire - Cockpit View (10-10-2002) (MP)"},
	"EC26FDC87B1D35F1D60EA89CDA4F4DD4":{n:"Star Fire - Crash Scene (04-11-2002) (MP)"},
	"BFCABC6995EF42D0B6C06786993DC4D6":{n:"Star Fire - Creating a Universe (09-09-2002) (MP)"},
	"86F5E55CA9A9BDE7338A157570828E79":{n:"Star Fire - Creating a Universe (09-09-2002) (MP) [a1]"},
	"11CF751BC8173DB105EABD119C5844BA":{n:"Star Fire - Crosshair (12-02-2002) (MP)"},
	"06953ED762220DBA63D63930D4AD0CC3":{n:"Star Fire - Eckhard WIP (MP)"},
	"40D7CCD460C9B1198238AF6CEEA1737D":{n:"Star Fire - Enemy Mine (2002) (MP)"},
	"D79DF06894E3C1585A47C2807332B319":{n:"Star Fire - Explosions! (10-10-2002) (MP)"},
	"5E2928F089490017E88E9F9E5A881A25":{n:"Star Fire - Faster Skipping 1 (24-10-2002) (MP)"},
	"44560E324FFB30741A483218BA5B4342":{n:"Star Fire - Faster Skipping 2 (24-10-2002) (MP)"},
	"562BF02F5031D51C6B53B03972A56B22":{n:"Star Fire - Framework Done (30-10-2002) (MP)"},
	"DC6AA0BB21A6E66E80E75BA5EDC5C0DD":{n:"Star Fire - Kernel Done (MP)"},
	"9E6FA031ECE07919C816FBA5DC8DE43E":{n:"Star Fire - Meteor Dance (13-11-2002) (MP)"},
	"BB9F06B288B5275BC0D38B6731B2526A":{n:"Star Fire - Meteor Dance 2 (18-11-2002) (MP)"},
	"551EF75593EC18D078E8F5CC0229E1C4":{n:"Star Fire - New Paulstar WIP (MP)"},
	"74CA9BDC91EE387A5BD929B73AEC5C2C":{n:"Star Fire - New Shields (03-04-2003) (MP)"},
	"A23FFC86804240CE77134A1C91926685":{n:"Star Fire - Paulstar WIP (MP)"},
	"C6CEDB25B7D390B580EA8EDB614B168B":{n:"Star Fire - Radar Completed (22-10-2002) (MP)"},
	"5F69453A69F21DC49697A80D2E933491":{n:"Star Fire - Reduced Flickering (06-10-2002) (MP)"},
	"2E2885E68FA1045871CE1382B68F6EFC":{n:"Star Fire - Return of the Crosshair (MP)"},
	"DA64F33D0521D5C9958E5D2D4434FF95":{n:"Star Fire - Return of the Starfield (MP)"},
	"92EDE72ED8F61D255BC58D2F166DC6B6":{n:"Star Fire - Shootable (26-09-2002) (MP)"},
	"ED9999911B406DC5F75C850DCC17BDF4":{n:"Star Fire - Shootable (Friendlier Collision Detection) (26-09-2002) (MP)"},
	"92C5ABB7A8BB1C3FC66C92BA353A3D21":{n:"Star Fire - Sorting Fixed (MP)"},
	"103D4C890C2108CB536372C98D093E5F":{n:"Star Fire - Star Background (MP)"},
	"7F73AC39E5E3E13E40FD8AD885561A0F":{n:"Star Fire - Warping Star (13-04-2003) (MP)"},
	"FBD6102E17A5C02C6E1911381B7203F9":{n:"Star Fire - Warping!! (10-04-2003) (MP)"},
	"BB07F917611CDE42B7D83746EE27147D":{n:"Star Fire - Warping!! (13-04-2003) (MP)"},
	"F526D0C519F5001ADB1FC7948BFBB3CE":{n:"Star Fox (1983) (Mythicon)"},
	"C541A5F6FC23B40A211196DD78233780":{n:"Star Raiders (1981) (Atari) (Prototype)"},
	"CBD981A23C592FB9AB979223BB368CD5":{n:"Star Raiders (1982) (Atari)"},
	"C1A83F44137EA914B495FC6AC036C493":{n:"Star Raiders (1982) (Atari) (PAL)"},
	"E363E467F605537F3777AD33E74E113A":{n:"Star Ship (1977) (Atari)"},
	"7B938C7DDF18E8362949B62C7EAA660A":{n:"Star Ship (1977) (Atari) (4K)"},
	"79E5338DBFA6B64008BB0D72A3179D3C":{n:"Star Strike (1983) (M Network)"},
	"405F8591B6941CFF56C9B392C2D5E4E5":{n:"Star Strike (1989) (Telegames) (PAL)"},
	"AB8D318DA4ADDD39C65B7F9C408DF2A6":{n:"Star Trek (Genesis)",c:1},
	"03C3F7BA4585E349DD12BFA7B34B7729":{n:"Star Trek - Strategic Operations Simulator (1983) (Sega)",c:1},
	"30F0B49661CFCFD4EC63395FAB837DC3":{n:"Star Trek - Strategic Operations Simulator (1983) (Sega) (PAL)",c:1},
	"813985A940AA739CC28DF19E0EDD4722":{n:"Star Voyager (1982) (Imagic)"},
	"0ACEB7C3BD13FE048B77A1928ED4267D":{n:"Star Voyager (1982) (Imagic) (PAL)"},
	"D912312349D90E9D41A9DB0D5CD3DB70":{n:"Star Voyager (1983) (CCE)"},
	"2E7E9C6DCFCCEAFFC6FA73F0D08A402A":{n:"Star Voyager (1983) (CCE) [a]"},
	"9D33D31FB1DE58C5460D8A67B57B36DA":{n:"Star Voyager (Genesis)"},
	"5336F86F6B982CC925532F2E80AA1E17":{n:"Star Wars - Death Star Battle (1983) (Parker Bros)",c:1},
	"CB9B2E9806A7FBAB3D819CFE15F0F05A":{n:"Star Wars - Death Star Battle (1983) (Parker Bros) (PAL)"},
	"D44D90E7C389165F5034B5844077777F":{n:"Star Wars - Ewok Adventure (1983) (Parker Bros) (Prototype)"},
	"2E2ACEF8513EDCCA991E7E5149412E11":{n:"Star Wars - Ewok Adventure (1983) (Parker Bros) (Prototype) (16K)"},
	"6DFAD2DD2C7C16AC0FA257B6CE0BE2F0":{n:"Star Wars - Ewok Adventure (1983) (Parker Bros) (Prototype) (PAL)"},
	"9D7F04618BB4043F531D087E3AAA7AC8":{n:"Star Wars - Ewok Adventure (1983) (Parker Bros) (Prototype) (PAL) (16K)"},
	"C246E05B52F68AB2E9AEE40F278CD158":{n:"Star Wars - Ewok Adventure (Thomas Jentzsch) (Prototype)"},
	"C9F6E521A49A2D15DAC56B6DDB3FB4C7":{n:"Star Wars - Jedi Arena (1983) (Parker Bros)",p:1},
	"05B45BA09C05BEFA75AC70476829EDA0":{n:"Star Wars - Jedi Arena (1983) (Parker Bros) (PAL)",p:1},
	"F4B8A47A95B61895E671C3EC86FFD461":{n:"Star Wars - The Arcade Game (01-03-1984) (Parker Bros) (Prototype)",c:1},
	"6651E2791D38EDC02C5A5FD7B47A1627":{n:"Star Wars - The Arcade Game (04-05-1984) (Parker Bros) (Prototype) (8K)",c:1},
	"E8A3473BF786CF796D1336D2D03A0008":{n:"Star Wars - The Arcade Game (12-05-1983) (Parker Bros) (Prototype)",c:1},
	"1E1290EA102E12D7AC52820961457E2B":{n:"Star Wars - The Arcade Game (12-15-1983) (Parker Bros) (Prototype)",c:1},
	"AE2F1F69BB38355395C1C75C81ACC644":{n:"Star Wars - The Arcade Game (12-23-1983) (Parker Bros) (Prototype)",c:1},
	"6339D28C9A7F92054E70029EB0375837":{n:"Star Wars - The Arcade Game (1984) (Parker Bros)",c:1},
	"6CF054CD23A02E09298D2C6F787EB21D":{n:"Star Wars - The Arcade Game (1984) (Parker Bros) (PAL)",c:1},
	"FFC0FF4305DD46B4B459885BD1818E2E":{n:"Star Wars - The Battle of Alderaan (Star Strike Hack)"},
	"3C8E57A246742FA5D59E517134C0B4E6":{n:"Star Wars - The Empire Strikes Back (1982) (Parker Bros)"},
	"BE060A704803446C02E6F039AB12EB91":{n:"Star Wars - The Empire Strikes Back (1982) (Parker Bros) (PAL)"},
	"D69559F9C9DC6EF528D841BF9D91B275":{n:"StarMaster (1982) (Activision)"},
	"73C839AFF6A055643044D2CE16B3AAF7":{n:"StarMaster (1982) (Activision) (PAL)"},
	"348615FFA30FAB3CEC1441B5A76E9460":{n:"StarMaster (1982) (Activision) (PAL) [fixed]"},
	"D62D7D1A974C31C5803F96A8C1552510":{n:"StarMaster (Unknown) (PAL)"},
	"1542662F665D2FFAA77B4B897DD2E2AF":{n:"Starfield (V1.0) (2002) (MP)"},
	"91D1C82CEAF8AF2ADD3973A3C34BC0CB":{n:"Starfield Demo 1 (20-12-2002) (CT)"},
	"68FEB6D6FF63E80DF1302D8547979AEC":{n:"Starfield Demo 2 (20-12-2002) (CT)"},
	"0C48E820301251FBB6BCDC89BD3555D9":{n:"Stargate (1984) (Atari)"},
	"493DE059B32F84AB29CDE6213964AEEE":{n:"Stargate (1984) (Atari) (PAL)"},
	"A3C1C70024D7AABB41381ADBFB6D3B25":{n:"Stargunner (1982) (Telesys)"},
	"E5BACF526036D3C8C99DB5B030CF00E7":{n:"Starmaster (Genesis)"},
	"C5BAB953AC13DBB2CBA03CD0684FB125":{n:"Stay Frosty (SpiceWare)",c:1},
	"1FA86282403FA35D103AB88A9D603C31":{n:"Stay Frosty (SpiceWare) (PAL60)",c:1},
	"1619BC27632F9148D8480CD813AA74C3":{n:"Steeple Chase (Thomas Jentzsch)",c:1},
	"F75872946E82AD74D48EAE5BC28F5F0E":{n:"Steeplechase (04-15-1980) (Sears) (Prototype)",p:1},
	"656DC247DB2871766DFFD978C71DA80C":{n:"Steeplechase (1980) (Sears)",p:1},
	"A174CECE06B3ABC0AEC3516913CDF9CC":{n:"Steeplechase (1980) (Sears) (4K)",p:1},
	"F1EEECCC4BBA6999345A2575AE96508E":{n:"Steeplechase (1983) (Video Gems) (PAL)",c:1},
	"3CDD91E1C28D28E856C0063D602DA166":{n:"Stell-A-Sketch (03-11-1997) (Bob Colbert) (PD)",c:1},
	"47AEF18509051BAB493589CB2619170B":{n:"Stell-A-Sketch (Bob Colbert) (PD)",c:1},
	"18ED63E3CE5BC3DD2D8BD188B807F1A2":{n:"Stell-A-Sketch (Bob Colbert) (PD) [a1]",c:1},
	"0B8D3002D8F744A753BA434A4D39249A":{n:"Stellar Track (1980) (Sears)",c:1},
	"23FAD5A125BCD4463701C8AD8A0043A9":{n:"Stone Age (1983) (CCE)"},
	"B17B9CC4103844DCDA54F77F44ACC93A":{n:"Stopp die Gangster (1983) (Quelle) (PAL)"},
	"F240BA9F8092D2E8A4C7D82C554BF509":{n:"Strahlen der Teufelsvoegel (1983) (Quelle) (PAL)"},
	"807A8FF6216B00D52ABA2DFEA5D8D860":{n:"Strat-O-Gems Deluxe (2005) (J. Payson)"},
	"EF76EA05655A0B62CB1018C92B9B4B7D":{n:"Strategy X (1983) (Gakken) (PAL)"},
	"9333172E3C4992ECF548D3AC1F2553EB":{n:"Strategy X (1983) (Konami)"},
	"E10D2C785AADB42C06390FAE0D92F282":{n:"Strawberry Shortcake - Musical Match-Ups (1983) (Parker Bros)"},
	"516FFD008057A1D78D007C851E6EFF37":{n:"Strawberry Shortcake - Musical Match-Ups (1983) (Parker Bros) (PAL)"},
	"8A6C84F481ACF42ABCB78BA5064AD755":{n:"Street Racer (128-in-1 Junior Console) (PAL) (4K)",p:1},
	"396F7BC90AB4FA4975F8C74ABE4E81F0":{n:"Street Racer (1977) (Atari)",p:1},
	"6FF4156D10B357F61F09820D03C0F852":{n:"Street Racer (1977) (Atari) (4K)",p:1},
	"E12E32DEE68201B6765FCD0ED54D6646":{n:"Street Racer (1977) (Atari) (PAL)",p:1},
	"7B3CF0256E1FA0FDC538CAF3D5D86337":{n:"Stronghold (1983) (CommaVid)"},
	"C3BBC673ACF2701B5275E85D9372FACF":{n:"Stunt Cycle (07-21-1980) (Atari) (Prototype)"},
	"D7759FA91902EDD93F1568A37DC70CDB":{n:"Stunt Cycle (1980) (Atari) (Prototype) (4K)"},
	"ED0AB909CF7B30AFF6FC28C3A4660B8E":{n:"Stunt Man (1983) (Panda)"},
	"5AF9CD346266A1F2515E1FBC86F5186A":{n:"Sub-Scan (1982) (Sega)"},
	"B095009004DF341386D22B2A3FAE3C81":{n:"Sub-Scan (Unknown) (PAL)"},
	"F3F5F72BFDD67F3D0E45D097E11B8091":{n:"Submarine Commander (1982) (Sears)"},
	"93C52141D3C4E1B5574D072F1AFDE6CD":{n:"Subterranea (1983) (Imagic)"},
	"38DE7B68379770B9BD3F7BF000136EB0":{n:"Subterranea (1983) (Imagic) (PAL)"},
	"D8E4C8E2D210270CD1E0F6D1B4582B91":{n:"Subterranea (1983) (Imagic) (PAL) [a]"},
	"4AB4AF3ADCDAE8CDACC3D06084FC8D6A":{n:"Sucky Zepplin (Nick Bensema) (PD)"},
	"CFF578E5C60DE8CAECBEE7F2C9BBB57B":{n:"Suicide Adventure (George Veeder) (Hack)"},
	"E4C666CA0C36928B95B13D33474DBB44":{n:"Suicide Mission (1982) (Arcadia)",c:1},
	"EB92193F06B645DF0B2A15D077CE435F":{n:"Suicide Mission (1982) (Arcadia) (PAL)",c:1},
	"CD98BE8A48EBF610C9609A688B9C57F2":{n:"Suicide Mission (1982) (Arcadia) (Prototype)",c:1},
	"753375D183C713CFA0AA7298D1F3067B":{n:"Suicide Mission (1982) (Arcadia) [a]",c:1},
	"463DD4770506E6C0EF993A40C52C47BE":{n:"Suicide Mission (Preview) (1982) (Arcadia)",c:1},
	"B4F05E544834D0238A0C263491775EDF":{n:"Suicide Mission (Preview) (1982) (Arcadia) (PAL)",c:1},
	"45027DDE2BE5BDD0CAB522B80632717D":{n:"Summer Games (1987) (Epyx)"},
	"12BCA8305D5AB8EA51FE1CFD95D7AB0E":{n:"Summer Games (1987) (Epyx) (PAL)"},
	"4F2D47792A06DA224BA996C489A87939":{n:"Super Action Pak - Pitfall, Barnstorming, Grand Prix, Laser Blast (1988) (HES) (PAL)"},
	"7ADBCF78399B19596671EDBFFC3D34AA":{n:"Super Baseball (1988) (Atari)"},
	"0751F342EE4CF28F2C9A6E8467C901BE":{n:"Super Baseball (1988) (Atari) (PAL)"},
	"FAED2EF6B44894F8C83F2B50891C35C6":{n:"Super Baseball (CCE)"},
	"1C85C0FC480BBD69DC301591B6ECB422":{n:"Super Box (CCE)"},
	"8885D0CE11C5B40C3A8A8D9ED28CEFEF":{n:"Super Breakout (1982 - 1981) (Atari)",p:1},
	"EE4C186123D31A279ED7A84D3578DF23":{n:"Super Breakout (1982 - 1981) (Atari) (PAL)",p:1},
	"0AD9A358E361256B94F3FB4F2FA5A3B1":{n:"Super Breakout (1982 - 1981) (Atari) [a]",p:1},
	"9D37A1BE4A6E898026414B8FEE2FC826":{n:"Super Challenge Baseball (1982) (M Network)"},
	"DAB844DEED4C752632B5E786B0F47999":{n:"Super Challenge Baseball (208 in 1) (Unknown) (PAL)"},
	"1D6ED6FE9DFBDE32708E8353548CBB80":{n:"Super Challenge Baseball (Jone Yuan)"},
	"E275CBE7D4E11E62C3BFCFB38FCA3D49":{n:"Super Challenge Football (1982) (M Network)"},
	"FEBA8686FD0376015258D1152923958A":{n:"Super Circus (Unknown) (PAL)"},
	"C29F8DB680990CB45EF7FEF6AB57A2C2":{n:"Super Cobra (1982) (Parker Bros)"},
	"D326DB524D93FA2897AB69C42D6FB698":{n:"Super Cobra (1982) (Parker Bros) (PAL)"},
	"5F7DE62A408B9DE3A1168898298FD31D":{n:"Super Cobra (Genesis)"},
	"C7900A7FE95A47EEF3B325072AD2C232":{n:"Super Congo Bongo (2003) (Larry Petit) (Hack)"},
	"638CC82EA96F67674595BA9AE05DA6C6":{n:"Super Ferrari (Rainbow Vision) (PAL)"},
	"09ABFE9A312CE7C9F661582FDF12EAB6":{n:"Super Football (1988) (Atari)"},
	"262CCB882FF617D9B4B51F24AEE02CBE":{n:"Super Football (1988) (Atari) (PAL)"},
	"2447E17A4E18E6B609DE498FE4AB52BA":{n:"Super Futebol (CCE)",c:1},
	"2F0A8BB4E18839F9B1DCAA2F5D02FD1D":{n:"Super Futebol (CCE) [a]",c:1},
	"C08D0CEE43077D3055FEBB00E5745C1D":{n:"Super Hit Pak - River Raid, Sky Jinks, Grand Prix, Fishing Derby, Checkers (HES) (PAL)"},
	"08D1B6D75206EDB999252CAF542A2C7F":{n:"Super Home Run (2003) (Larry Petit) (Hack)"},
	"645BF7F9146F0E4811FF9C7898F5CD93":{n:"Super Kung-Fu (1983) (Xonox) (PAL)"},
	"3B2C32FCD331664D037952BCAA62DF94":{n:"Super Kung-Fu (1983) (Xonox) (PAL) [a]"},
	"0E7E73421606873B544E858C59DC283E":{n:"Super Soccer (Digivision)",c:1},
	"3E7D10D0A911AFC4B492D06C99863E65":{n:"Super Tenis (VGS)"},
	"53B66F11F67C3B53B2995E0E02017BD7":{n:"Super Tennis (1983) (CCE)"},
	"517923E655755086A3B72C0B17B430E6":{n:"Super Tennis (Tron)"},
	"CBC373FBCB1653B4C56BFABBA33EA50D":{n:"Super Voleyball (CCE)"},
	"BDECC81F740200780DB04A107C3A1EBA":{n:"Super-Cowboy beim Rodeo (1983) (Quelle) (PAL)"},
	"CC2973680C150886CCE1ED8693C3ACA2":{n:"Super-Cowboy beim Rodeo (1983) (Quelle) (PAL) (4K)"},
	"2B27EB194E13F3B38D23C879CC1E3ABF":{n:"Super-Ferrari (1983) (Quelle) (PAL)"},
	"85502D69FE46B7F54EF2598225678B47":{n:"Super-Ferrari (Jone Yuan)"},
	"724613EFFAF7743CBCD695FAB469C2A8":{n:"Super-Ferrari (Unknown)"},
	"4565C1A7ABCE773E53C75B35414ADEFD":{n:"Supercharger BIOS (1982) (Arcadia)"},
	"A9531C763077464307086EC9A1FD057D":{n:"Superman (1979) (Atari)"},
	"3619786F6A32EFC1E4A262D5ACA8A070":{n:"Superman (1979) (Atari) (8K)"},
	"DBB10B904242FCFB8428F372E00C01AF":{n:"Superman (1979) (Atari) (PAL)"},
	"FD10915633AEA4F9CD8B518A25D62B55":{n:"Superman (1979) (Atari) (PAL) [a]"},
	"5DE8803A59C36725888346FDC6E7429D":{n:"Superman (1979) (Atari) [fixed]"},
	"149B543C917C180A1B02D33C12415206":{n:"Superman (1983) (CCE)"},
	"CCB807EB79B0ED0F5FDC460445EF703A":{n:"Superman (Stunt_Cycle_Rules!) (Hack)"},
	"6FAC680FC9A72E0E54255567C72AFE34":{n:"Superman (Unknown) (PAL)"},
	"169D4C7BD3A4D09E184A3B993823D048":{n:"Superman (Unknown) (PAL) [a]"},
	"AEC9B885D0E8B24E871925630884095C":{n:"Surf's Up (1983) (Amiga) (Prototype)"},
	"A2170318A8EF4B50A1B1D38567C220D6":{n:"Surf's Up (1983) (Amiga) (Prototype) [a]"},
	"C20F15282A1AA8724D70C117E5C9709E":{n:"Surfer's Paradise (1983) (Video Gems) (PAL)"},
	"59B70658F9DD0E2075770B07BE1A35CF":{n:"Surfer's Paradise (Thomas Jentzsch)"},
	"4D7517AE69F95CFBC053BE01312B7DBA":{n:"Surround (1977) (Atari)"},
	"31D08CB465965F80D3541A57EC82C625":{n:"Surround (1977) (Atari) (4K)"},
	"52A0003EFB3B1C49FCDE4DBC2C685D8F":{n:"Surround (1977) (Atari) (4K) [a]"},
	"C370C3268AD95B3266D6E36FF23D1F0C":{n:"Surround (1977) (Atari) (PAL)"},
	"A60598AD7EE9C5CCAD42D5B0DF1570A1":{n:"Surround (32 in 1) (1988) (Atari) (PAL)"},
	"5C86E938E0845B9D61F458539E9A552B":{n:"Surround (32 in 1) (1988) (Atari) (PAL) (4K)"},
	"D89FEDDED0436FDEDA7C3C37E2FB7CF1":{n:"Surround (Unknown) (PAL) (4K)"},
	"4C462B2B6FB0A19A1437EB2C3DC20783":{n:"Survival Island (1 of 3) (1983) (Arcadia)"},
	"B6E40BCE550672E5495A8CDDE7075B8B":{n:"Survival Island (1 of 3) (1983) (Arcadia) (PAL)"},
	"045035F995272EB2DEB8820111745A07":{n:"Survival Island (1983) (Arcadia)"},
	"84DB818CD4111542A15C2A795369A256":{n:"Survival Island (1983) (Arcadia) (PAL)"},
	"691D67910B08B63DE8631901D1887C1F":{n:"Survival Island (1983) (Arcadia) [a]"},
	"B31DC989F594764EACFA7931CEAD0050":{n:"Survival Island (2 of 3) (1983) (Arcadia)"},
	"277C7281AC945B8331E2E6FCAD560C11":{n:"Survival Island (2 of 3) (1983) (Arcadia) (PAL)"},
	"4A9009620038F7F30AAEB2A00AE58FDE":{n:"Survival Island (3 of 3) (1983) (Arcadia)"},
	"76C685D1A60C0107AA54A772113A2972":{n:"Survival Island (3 of 3) (1983) (Arcadia) (PAL)"},
	"59E53894B3899EE164C91CFA7842DA66":{n:"Survival Run (1983) (Data Age) (Prototype)"},
	"85E564DAE5687E431955056FBDA10978":{n:"Survival Run (1983) (Milton Bradley)",c:1},
	"C7600D72247C5DFA1EC1A88D23E6C85E":{n:"Sweat! - The Decathlon Game (1 of 3) (1983) (Arcadia) (Prototype)",p:1},
	"E51C23389E43AB328CCFB05BE7D451DA":{n:"Sweat! - The Decathlon Game (1983) (Arcadia) (Prototype)",p:1},
	"5EC73AC7D2AC95AC9530C6D33E713D14":{n:"Sweat! - The Decathlon Game (2 of 3) (1983) (Arcadia) (Prototype)",p:1},
	"1E060A8025512AD2127E3DA11E212CCC":{n:"Sweat! - The Decathlon Game (3 of 3) (1983) (Arcadia) (Prototype)",p:1},
	"528400FAD9A77FD5AD7FC5FDC2B7D69D":{n:"Sword of Saros (1983) (Arcadia)"},
	"8B7CA29A55432F886CEE3D452FB00481":{n:"Sword of Saros (1983) (Arcadia) (PAL)"},
	"545048CCB045F9EFC6CF2B125CD0DFA8":{n:"Sword of Saros (1983) (Arcadia) [a]"},
	"5AEA9974B975A6A844E6DF10D2B861C4":{n:"SwordQuest - EarthWorld (1982) (Atari)"},
	"A875F0A919129B4F1B5103DDD200D2FE":{n:"SwordQuest - EarthWorld (1982) (Atari) (PAL)"},
	"05EBD183EA854C0A1B56C218246FBBAE":{n:"SwordQuest - EarthWorld (1982) (Atari) [a]"},
	"F9D51A4E5F8B48F68770C89FFD495ED1":{n:"SwordQuest - FireWorld (1982) (Atari)"},
	"BF976CF80BCF52C5F164C1D45F2B316B":{n:"SwordQuest - FireWorld (1982) (Atari) (PAL)"},
	"3882224ADBD0CA7C748B2A1C9B87263E":{n:"SwordQuest - FireWorld (1982) (Atari) (PAL) [a]"},
	"BC5389839857612CFABEB810BA7EFFDC":{n:"SwordQuest - WaterWorld (1983) (Atari)"},
	"87662815BC4F3C3C86071DC994E3F30E":{n:"Swordfight (1983) (Intellivision)"},
	"D0B9F705AA5F61F47A748A66009AE2D2":{n:"Synthcart (14-01-2002) (Paul Slocum)",c:1},
	"2C2AEA31B01C6126C1A43E10CACBFD58":{n:"Synthcart (2002) (Paul Slocum)",c:1},
	"8B556C3D9CA8E5E6E665BD759B93FFAE":{n:"Synthcart (2002) (Paul Slocum) (PAL) [!]",c:1},
	"896EC58F26E930E02F5E4F046602C3A1":{n:"Synthcart (Beta) (2002) (Paul Slocum)",c:1},
	"8933976F2029C0D8492EBD8F4EB21492":{n:"Synthcart Plus (09-02-2003) (Paul Slocum)"},
	"294762000E853B4319F9991C1CED5DFC":{n:"T.F. Space Invaders (Hack)"},
	"BECD908F9D7BB361982C3DC02D6475C6":{n:"THX-1138 (Kyle Pittman) (Hack)"},
	"6FFC95108E5ADD6F9B8ABCAF330BE835":{n:"TP Bug (Charles Morgan) (Hack)"},
	"FB27AFE896E7C928089307B32E5642EE":{n:"TRON - Deadly Discs (1982) (M Network)"},
	"9E5007131695621D06902AB3C960622A":{n:"Tac Scan (1983) (Sega) [h1]",p:1,c:1},
	"D45EBF130ED9070EA8EBD56176E48A38":{n:"Tac-Scan (1982) (Sega)",p:1,c:1},
	"06E5DC181A8EDA1C31CC7C581C68B6EF":{n:"Tac-Scan (Unknown) (PAL)",c:1},
	"C77D3B47F2293E69419B92522C6F6647":{n:"Tank Brigade (1983) (Panda)"},
	"AD8072675109D13FDD31A2E0403D5CFF":{n:"Tank City (Funvision)"},
	"FA6FE97A10EFB9E74C0B5A816E6E1958":{n:"Tanks But No Tanks (1983) (ZiMAG)"},
	"082FDC8BD47FEF01482CE5883C4FFDB8":{n:"Tanks DX (Charles Morgan) (Hack)"},
	"1A613CE60FC834D4970E1E674B9196B3":{n:"Tanks War (1983) (Home Vision) (PAL)"},
	"DE3D0E37729D85AFCB25A8D052A6E236":{n:"Tapeworm (1982) (Spectravision)",c:1},
	"8ED73106E2F42F91447FB90B6F0EA4A4":{n:"Tapeworm (1982) (Spectravision) (PAL)",c:1},
	"33CAC5E767A534C95D292B04F439DC37":{n:"Tapeworm (Jone Yuan)"},
	"C0D2434348DE72FA6EDCC6D8E40F28D7":{n:"Tapper (1984) (Sega)"},
	"2D6741CDA3000230F6BBDD5E31941C01":{n:"Targ (1983) (CBS Electronics) (Prototype)"},
	"3D6FC7A19BE76D808AA233415CB583FC":{n:"Target Practice (1983) (CCE)"},
	"7DD9C5284422F729066AB22A284C8283":{n:"Target Practice (1983) (CCE) [a]"},
	"0C35806FF0019A270A7ACAE68DE89D28":{n:"Task Force (1987) (Froggo)"},
	"A1EAD9C181D67859AA93C44E40F1709C":{n:"Tax Avoiders (1982) (American Videogame)"},
	"360BA640F6810EC902B01A09CC8AB556":{n:"Taz (06-15-1983) (Atari) (Prototype) (PAL)"},
	"B31F178AA0D569CCCAC7959F84E0A724":{n:"Taz (07-13-1983) (Atari) (Prototype)"},
	"9A01115206F32EB0B539C7E5A47CCAFA":{n:"Taz (07-15-1983) (Atari) (Prototype)"},
	"7574480AE2AB0D282C887E9015FDB54C":{n:"Taz (1983) (Atari)"},
	"0D09CFF0D28033C02C3290EDFC3A5CEA":{n:"Taz (1983) (Atari) (Prototype)"},
	"76809EB1EE0DB8A318308A5CDDA0F4E2":{n:"Taz (1983) (Atari) (Prototype) [a]"},
	"4702D8D9B48A332724AF198AEAC9E469":{n:"Taz (1983) (Atari) [a]"},
	"AB60EA7B707C58D356CAD858EB18DB43":{n:"Tazer (John K. Harvey)"},
	"8C2FA33048F055F38358D51EEFE417DB":{n:"Teddy Apple (1983) (Home Vision) (PAL)",c:1},
	"3D7AAD37C55692814211C8B590A0334C":{n:"Telepathy (1983) (Atari) (Prototype)"},
	"AE97CF8ED21F4154B4360A3CF6C95C5E":{n:"Teleterm 2600 (John K. Harvey) (PD)"},
	"203B1EFC6101D4B9D83BB6CC1C71F67F":{n:"Teller-Jonglieren! (1983) (Quelle) (PAL)",c:1},
	"C830F6AE7EE58BCC2A6712FB33E92D55":{n:"Tempest (01-05-1984) (Atari) (Prototype)"},
	"42CDD6A9E42A3639E190722B8EA3FC51":{n:"Tennis (1981) (Activision)"},
	"961112B74A920A5242E233480326C356":{n:"Tennis (1981) (Activision) (16K)"},
	"ACA09FFEA77174B148B96B205109DB4D":{n:"Tennis (1981) (Activision) (4K)"},
	"74EBACA101CC428CF219F15DDA84B6F8":{n:"Tennis (1981) (Activision) (8K)"},
	"A5C96B046D5F8B7C96DAAA12F925BEF8":{n:"Tennis (1981) (Activision) (PAL)"},
	"CA7F166A94EED1A349DEC6D6A358BCAD":{n:"Tennis (1981) (Activision) (PAL) (4K)"},
	"73EFA9F3CBE197F26E0FB87132829232":{n:"Tennis (1983) (CCE) (4K)"},
	"04B488D4EEF622D022A0021375E7E339":{n:"Tennis (1983) (Home Vision) (PAL) (4K)"},
	"A3F8AEBB38182749CB8DA85CFBC63D7C":{n:"Tennis (208 in 1) (Unknown) (PAL) (Hack)"},
	"16E04823887C547DC24BC70DFF693DF4":{n:"Tennis (32 in 1) (1988) (Atari) (PAL)"},
	"30685B9B6EBD9BA71536DD7632A1E3B6":{n:"Tennis (Dactari)"},
	"736388D73198552D77D423962000006F":{n:"Tennis (Dactari) (4K)"},
	"1F5A2927A0B2FAF87540B01D9D7D7FD1":{n:"Tennis (Pet Boat) (PAL)"},
	"61E0F5E1CC207E98704D0758C68DF317":{n:"Tennis (Star Game)"},
	"A3873D7C544AF459F40D58DFCFB78887":{n:"Tennis (Unknown)"},
	"6697F177847C70505824422E76AAD586":{n:"Tennis (Unknown) (PAL) (4K)"},
	"E3ED4BA3361756970F076E46E9CAD1D2":{n:"Tennis (Unknown) (PAL) (4K) [a]"},
	"20AE62FB69C6CC6E8098CCA8CD080487":{n:"Tennis (Zirok)"},
	"67631EA5CFE44066A1E76DDCB6BCB512":{n:"Termool (Unknown) (PAL)"},
	"05C60458EC69E7FE8B1BE973852D84F1":{n:"Test (1996) (J.V. Matthews) (PD)"},
	"F0631C6675033428238408885D7E4FDE":{n:"Test Cart (2002) (Paul Slocum)",c:1},
	"B0E1EE07FBC73493EAC5651A52F90F00":{n:"Tetris 2600 (Colin Hughes)",c:1},
	"CAE8F83C06831EC7BB6A3C07E98E9342":{n:"Tetris 2600 (Colin Hughes) [o1]",c:1},
	"5EEB81292992E057B290A5CD196F155D":{n:"Texas Chainsaw Massacre, The (1983) (Wizard Video)"},
	"3316EE2F887E9CB9B54DD23C5B98C3E2":{n:"Texas Golf (miniature Gold Hack)"},
	"4476C39736090DABAC09F6CAF835FC49":{n:"Text Screen (25-01-2003) (AD)"},
	"3B64A00CE147C3C29F7F8F8E531D08D8":{n:"This Planet Sucks (16K) (Greg Troutman)"},
	"5FB71CC60E293FE10A5023F11C734E55":{n:"This Planet Sucks (Fix) (27-12-2002) (Greg Troutman)"},
	"A98B649912B6CA19EAF5C2D2FAF38562":{n:"This Planet Sucks (Greg Troutman) (PAL) [!]"},
	"DFE6AA7443BB813CEFA35A4CF4887422":{n:"This Planet Sucks (Greg Troutman) [a1]"},
	"0ACAF71E60B89F6B6EAB63DB6AB84510":{n:"This Planet Sucks (Greg Troutman) [a2]"},
	"225522777DC7155627808BDE0C1D0EF0":{n:"This Planet Sucks Demo 1 (Greg Troutman) (PD)"},
	"8530CAAAF40ACBDCD118C282B5F8A37A":{n:"This Planet Sucks Demo 2 (Greg Troutman) (PD)"},
	"7F790939F7EAA8C47A246C4283981F84":{n:"This Planet Sucks Demo 3 (Greg Troutman) (PD)"},
	"E56DA674188BA2F02C7A0A343A01236F":{n:"This Planet Sucks Demo 4 (Greg Troutman) (PD)"},
	"65C6406F5AF934590097C8C032EBB482":{n:"Three Hugger (Pave Demo) (20-12-2002) (Billy Eno)"},
	"E63A87C231EE9A506F9599AA4EF7DFB9":{n:"Threshold (1982) (Tigervision)"},
	"67684A1D18C85FFA5D82DAB48FD1CB51":{n:"Threshold (1982) (Tigervision) (PAL)"},
	"346555779A2D51B48833463B5433472F":{n:"Thrust (V0.1) (2000) (TJ)"},
	"1442D1B35A6478FBA22AE7DD1FCB5634":{n:"Thrust (V0.2) (2000) (TJ)"},
	"BA3B0EEBCCC7B791107DE5B4ABB671B4":{n:"Thrust (V0.9) (2000) (TJ)"},
	"041B5E56BBC650DB574BD8DB3FAE2696":{n:"Thrust (V1.0) (2000) (TJ)"},
	"98FA3AD778A668A79449350DE4B3B95B":{n:"Thrust (V1.1) (2000) (TJ)"},
	"FC668A2251DD79CBD903D4FA0E558F96":{n:"Thrust (V1.1) (2000) (TJ) [a1]"},
	"E1E09E2F280E8E142121A377D0DC1B46":{n:"Thrust (V1.21) (2000) (TJ)"},
	"DE7BCA4E569AD9D3FD08FF1395E53D2D":{n:"Thrust (V1.22) (2000) (TJ)"},
	"CF507910D6E74568A68AC949537BCCF9":{n:"Thunderground (1983) (Sega)",c:1},
	"1428029E762797069AD795CE7C6A1A93":{n:"Thunderground (Unknown) (PAL)",c:1},
	"C032C2BD7017FDFBBA9A105EC50F800E":{n:"Thwocker (04-09-1984) (Activision) (Prototype)"},
	"79D6F61DA3C64688AC8E075667F8A39F":{n:"Tie-Fighters (MP)"},
	"7576DD46C2F8D8AB159D97E3A3F2052F":{n:"Time Machine (1983) (Goliath) (PAL)"},
	"FC2104DD2DADF9A6176C1C1C8F87CED9":{n:"Time Pilot (1983) (Coleco)"},
	"4E99EBD65A967CABF350DB54405D577C":{n:"Time Pilot (1983) (Coleco) [b1]"},
	"5DB9E5BF663CAD6BF159BC395F6EAD53":{n:"Time Race (1983) (Goliath) (PAL)"},
	"71F09F128E76EB14E244BE8F44848759":{n:"Time Race (Funvision) (PAL)"},
	"00EAEE22034AFF602F899B684C107D77":{n:"Time Race (Rainbow Vision) (PAL)"},
	"EFB47D70B2965CE689E2C5757616B286":{n:"Time Test Demo (Eckhard Stolberg) (PAL) (PD)"},
	"D6D1DDD21E9D17EA5F325FA09305069C":{n:"Time Warp (1982) (Funvision) (PAL)"},
	"BC3057A35319AAE3A5CD87A203736ABE":{n:"Time Warp (1983) (CCE)"},
	"619DE46281EB2E0ADBB98255732483B4":{n:"Time Warp (Unknown)"},
	"6D9AFD70E9369C2A6BFF96C4964413B7":{n:"Time Warp (Unknown) (PAL)"},
	"B879E13FD99382E09BCAF1D87AD84ADD":{n:"Time Warp (Zellers)"},
	"FB09EE4CCD47AE74A3C314F0D8A40344":{n:"Titans (SnailSoft)"},
	"12123B534BDEE79ED7563B9AD74F1CBD":{n:"Title Match Pro Wrestling (1987) (Absolute)"},
	"153F40E335E5CB90F5CE02E54934AB62":{n:"Title Match Pro Wrestling (1987) (Absolute) (PAL)"},
	"DA6465A34D2E44D26AA9A2A0CD1BCE4D":{n:"Title Match Pro Wrestling (1987) (Absolute) [a]"},
	"784176346E9422733D55C427230E5BAD":{n:"Title Match Pro Wrestling (1989) (Activision)"},
	"3B9480BB6FB1E358C9C0A64E86945AEE":{n:"Title Match Pro Wrestling (2002) (Skyworks)"},
	"DE61A0B171E909A5A4CFCF81D146DBCB":{n:"Tom Boy (Rainbow Vision) (PAL)"},
	"ECE908D77AB944F7BAC84322B9973549":{n:"Tom Boy (Unknown) (PAL60)"},
	"D85F1E35C5445AC898746719A3D93F09":{n:"Tom's Eierjagd (1983) (Quelle) (PAL)"},
	"C05F367FA4767CEB27ABADF0066DF7F4":{n:"TomInv (31-07-2001) (TJ)"},
	"32DCD1B535F564EE38143A70A8146EFE":{n:"Tomarc the Barbarian (1983) (Xonox)"},
	"8BC0D2052B4F259E7A50A7C771B45241":{n:"Tomarc the Barbarian (1983) (Xonox) [a]"},
	"BE2870A0120FD28D25284E9CCDCBDC99":{n:"Tomb Raider 2600 [REV 01] (Montezuma's Revenge Hack)"},
	"E0221C95AA657F5764EEEB64C8429258":{n:"Tomb Raider 2600 [REV 02] (Montezuma's Revenge Hack)"},
	"5B574FAA56836DA0866BA32AE32547F2":{n:"Tomb Raider 2600 [REV 03] (Montezuma's Revenge Hack)"},
	"3AC6C50A8E62D4CE71595134CBD8035E":{n:"Tomcat (1988) (Absolute)"},
	"155FA7F479DCBA3B10B1494E236D6010":{n:"Tomcat (2002) (Skyworks) (PAL)"},
	"FA2BE8125C3C60AB83E1C0FE56922FCB":{n:"Tooth Protectors (1983) (DSD-Camelot)",c:1},
	"E0B24C3F40A46CDA52E29835AB7AD660":{n:"Top Gun (1983) (Quelle) (PAL)"},
	"01ABCC1D2D3CBA87A3AA0EB97A9D7B9C":{n:"Topy (Jone Yuan)"},
	"0AA208060D7C140F20571E3341F5A3F8":{n:"Towering Inferno (1982) (U.S. Games)",c:1},
	"15FE28D0C8893BE9223E8CB2D032E557":{n:"Towering Inferno (208 in 1) (Unknown) (PAL)",c:1},
	"F39E4BC99845EDD8621B0F3C7B8C4FD9":{n:"Toyshop Trouble (AtariAge)",p:1},
	"6AE4DC6D7351DACD1012749CA82F9A56":{n:"Track and Field (1984) (Atari)"},
	"66706459E62514D0C39C3797CBF73FF1":{n:"Treasure Below (1983) (Video Gems) (PAL)"},
	"81414174F1816D5C1E583AF427AC89FC":{n:"Treasure Below (Thomas Jentzsch)"},
	"B86A12E53AB107B6CAEDD4E0272AA034":{n:"Treasure Hunting (Funvision)"},
	"1BB91BAE919DDBD655FA25C54EA6F532":{n:"Treasure Island (Suntek) (PAL)"},
	"D6A44277C3EB4F9D039185E0ECF7BFA6":{n:"Trick (1997) (Eckhard Stolberg)"},
	"0CC8224FF1EDFE458E8629E9E5FE3F5B":{n:"Trick 12 (2001) (TJ)"},
	"24DF052902AA9DE21C2B2525EB84A255":{n:"Trick Shot (1982) (Imagic)",c:1},
	"097936B07E0E0117B9026AE6835EB168":{n:"Trick Shot (1982) (Imagic) (PAL)",c:1},
	"DCA90EA1084A2FDBE300D7178CA1A138":{n:"Trick Shot (1982) (Imagic) (PAL) [a]",c:1},
	"8F613EA7C32A587D6741790E32872DDD":{n:"Troll Demo (PD)"},
	"E7A758BB0B43D0F7004E92B9ABF4BC83":{n:"Troll's Adventure (Hack)"},
	"DF3E6A9B6927CF59B7AFB626F6FD7EEA":{n:"Tuby Bird (208 in 1) (Unknown) (PAL)"},
	"E957EB4612D6BD5940D3492DFA749668":{n:"Tunnel Demo (27-03-2003) (CT)"},
	"A14D8A388083C60283E00592B18D4C6C":{n:"Tunnel Demo (28-03-2003) (AD)"},
	"18D26111CEF66DFF0C8AF8CF0E117843":{n:"Tunnel Demo (Cycling Colours 2) (29-03-2003) (AD)"},
	"265A85F66544EAF95FDA06C3D9E48ABF":{n:"Tunnel Demo (Cycling Colours) (29-03-2003) (AD)"},
	"AE047E9468BDA961D8E9E9D8FF52980F":{n:"Tunnel Demo (Red Spiral) (30-03-2003) (AD)"},
	"D8B2C81CEA5AF04F795EB3DC6573D72B":{n:"Tunnel Demo 2 (27-03-2003) (CT)"},
	"B2737034F974535F5C0C6431AB8CAF73":{n:"Tunnel Runner (1983) (CBS Electronics)"},
	"7648E72A5B5899076688DF18A1DDCF72":{n:"Tunnel Runner (1983) (CBS Electronics) (Prototype)"},
	"EFEFC02BBC5258815457F7A5B8D8750A":{n:"Tunnel Runner (1983) (CBS Electronics) [a]"},
	"D9AB6B67A17DA51E5AD13717E93FA2E2":{n:"Turbo (Coleco) Prototype Fake v0.1 (TJ)"},
	"DD4F4E0FBD81762533E39E6F5B55BB3A":{n:"Turbo WIP (TJ)"},
	"7A5463545DFB2DCFDAFA6074B2F2C15E":{n:"Turmoil (1982) (20th Century Fox)"},
	"46258BD92B1F66F4CB47864D7654F542":{n:"Turmoil (Zellers)"},
	"085322BAE40D904F53BDCC56DF0593FC":{n:"Tutankham (1983) (Parker Bros)"},
	"66C2380C71709EFA7B166621E5BB4558":{n:"Tutankham (1983) (Parker Bros) (PAL)"},
	"6FC27A9233FC69D28D3F190B4FF80F03":{n:"UFO #6 (Charles Morgan) (Hack)"},
	"6BB09BC915A7411FE160D0B2E4D66047":{n:"UFO (32 in 1) (1988) (Atari) (PAL)"},
	"B290C2B139344FCFF5B312C71B9AC3B2":{n:"UFO (32 in 1) (1988) (Atari) (PAL) (4K)"},
	"CA50CC4B21B0155255E066FCD6396331":{n:"UFO Patrol (Suntek) (PAL)",c:1},
	"1278F74CA1DFAA9122DF3ECA3C5BCAAD":{n:"Ungeheuer der Tiefe (Quelle) (PAL)"},
	"81A010ABDBA1A640F7ADF7F84E13D307":{n:"Universal Chaos (1989) (Telegames)",c:1},
	"E020F612255E266A8A6A9795A4DF0C0F":{n:"Universal Chaos (1989) (Telegames) (PAL)"},
	"5F950A2D1EB331A1276819520705DF94":{n:"Unknown 20th Century Fox Game (1983) (20th Century Fox) (Prototype)",c:1},
	"841B7BC1CAD05F5408302308777D49DC":{n:"Unknown Activision Game #1 (10-22-1982) (Activision) (Prototype)"},
	"EE681F566AAD6C07C61BBBFC66D74A27":{n:"Unknown Activision Game #1 (10-29-1982) (Activision) (Prototype)"},
	"8055B9C2622136FD91EDFEA6DF642DAF":{n:"Unknown Activision Game #1 (1983) (Activision) (Prototype) (PAL)"},
	"700A786471C8A91EC09E2F8E47F14A04":{n:"Unknown Activision Game #2 (1983) (Activision) (Prototype)"},
	"06B0194CE992584C365278E0D7323279":{n:"Unknown Activision Game #2 (Prototype) (PAL)"},
	"73E66E82AC22B305EB4D9578E866236E":{n:"Unknown Datatech Game (Jone Yuan)"},
	"C3205E3707F646E1A106E09C5C49C1BF":{n:"Unknown Title (bin00003 (200206)) (PD)"},
	"3C3A2BB776DEC245C7D6678B5A56AC10":{n:"Unknown Title (bin00003) (PD)"},
	"B00088418FC891F3FAA3D4DDDE6ACE94":{n:"Unknown Title (bin00007 (200102)) (PD)"},
	"143918368F4F4DFFF90999188C0197C9":{n:"Unknown Title (bin00016 (200110)) (PD)"},
	"4DCC7E7C2EC0738E26C817B9383091AF":{n:"Unknown Title (bin00026 (200110)) (PD)"},
	"C150C76CBDE2C9B5A97EB5399D46C64F":{n:"Unknown Title (xxx00000 (200203)) (PD)"},
	"A499D720E7EE35C62424DE882A3351B6":{n:"Up 'n Down (1984) (Sega)"},
	"C6556E082AAC04260596B4045BC122DE":{n:"Vanguard (1982) (Atari)"},
	"3CAA902AC0CE4509308990645876426A":{n:"Vanguard (1982) (Atari) (PAL)"},
	"9D0BEFA555F003069A21D2F6847AD962":{n:"Vanguard (1982) (Atari) (PAL) [a]"},
	"88D7B6B3967DE0DB24CDAE1C7F7181BD":{n:"Vanguard (1982) (Atari) (Prototype)"},
	"7EF74879D7CB9FA0EF161B91AD55B3BB":{n:"Vanguard (CCE)"},
	"F9660EBED66FEE8BDFDF07B4FAA22941":{n:"Vanguard (VGS)"},
	"787EBC2609A31EB5C57C4A18837D1AEE":{n:"Vault Assault (19xx) (Prescott)"},
	"D08FCCFBEBAA531C4A4FA7359393A0A9":{n:"Venetian Blinds Demo (1982) (Activision)"},
	"FB884FFD89013331A6F01AE3F6ABD214":{n:"Venetian Blinds Demo (1982) (Activision) (PAL)"},
	"39DA69FF9833F8C143F03B6E0E7A996B":{n:"Ventrra Invaders 2002 (Charles Morgan) (Hack)"},
	"345758747B893E4C9BDDE8877DE47788":{n:"Venture (1982) (CBS Electronics) (PAL)",c:1},
	"3E899EBA0CA8CD2972DA1AE5479B4F0D":{n:"Venture (1982) (Coleco)",c:1},
	"82DE957D155FC041FC6AFB8315A28550":{n:"Venture (1982) (Coleco) (Prototype)"},
	"C63A98CA404AA5EE9FCFF1DE488C3F43":{n:"Venture (1987) (Atari)",c:1},
	"7CA7A471D70305C673FEDD08174A81E8":{n:"Venture II (2001) (Tim Snider)",c:1},
	"6CD1DC960E3E8D5C5E0FBE67AB49087A":{n:"Vertical Playfield Demo 1 (PD)"},
	"EA6D40DB5498D6386571A76DF448AA4C":{n:"Vertical Playfield Demo 2 (PD)"},
	"CE6C4270F605AD3CE5E82678B0FC71F8":{n:"Vertical Rainbow Demo (PD)"},
	"BDC381BAF7C252C63739C5E9ED087A5C":{n:"Vertical Ship Demo 1 (PD)"},
	"6A091B8FFEACD0939850DA2094B51564":{n:"Vertically Scrolling Playfield (02-02-2003) (Aaron Bergstrom)"},
	"0956285E24A18EFA10C68A33846CA84D":{n:"Viagem Espacial (Dismac)"},
	"539D26B6E9DF0DA8E7465F0F5AD863B7":{n:"Video Checkers (1980) (Atari)"},
	"193F060553BA0A2A2676F91D9EC0C555":{n:"Video Checkers (1980) (Atari) (PAL)"},
	"F0B7DB930CA0E548C41A97160B9F6275":{n:"Video Chess (1979) (Atari)"},
	"3EF9573536730DCD6D9C20B6822DBDC4":{n:"Video Chess (1979) (Atari) (PAL)"},
	"A58B11148C18D85E4C2AEF4FF46ADE67":{n:"Video Chess (Unknown) (PAL)"},
	"ED1492D4CAFD7EBF064F0C933249F5B0":{n:"Video Cube (CCE)"},
	"4191B671BCD8237FC8E297B4947F2990":{n:"Video Jogger (1983) (Exus)"},
	"497F3D2970C43E5224BE99F75E97CBBB":{n:"Video Life (1981) (CommaVid)",c:1},
	"3EC12372CA3E870B11CA70EDC7EC26A4":{n:"Video Life (1981) (CommaVid) (4K)",c:1},
	"4209E9DCDF05614E290167A1C033CFD2":{n:"Video Life (1981) (CommaVid) [higher sounds]",c:1},
	"14D365BBFAAC3D20C6119591F57ACCA4":{n:"Video Life (Unknown) (4K) (Hack)",c:1},
	"60E0EA3CBE0913D39803477945E9E5EC":{n:"Video Olympics (1977) (Atari)",p:1},
	"C00B65D1BAE0AEF6A1B5652C9C2156A1":{n:"Video Olympics (1977) (Atari) (4K)",p:1},
	"77D0A577636E1C9212AECCDE9D0BAA4B":{n:"Video Olympics (1977) (Atari) (PAL)",p:1},
	"FE3B461D4C8B179FE68BC77760294C25":{n:"Video Olympics (1977) (Atari) (PAL) (4K)",p:1},
	"107CC025334211E6D29DA0B6BE46AEC7":{n:"Video Pinball (1981) (Atari)"},
	"6E59DD52F88C00D5060EAC56C1A0B0D3":{n:"Video Pinball (1981) (Atari) (PAL)"},
	"A2424C1A0C783D7585D701B1C71B5FDC":{n:"Video Pinball (Unknown) (PAL)"},
	"EE659AE50E9DF886AC4F8D7AD10D046A":{n:"Video Reflex (1983) (Exus)"},
	"16F494F20AF5DC803BC35939EF924020":{n:"Video Simon (Mark De Smet)"},
	"93ACD5020AE8EB5673601E2EDECBC158":{n:"Video Time Machine (Chris Cracknell)"},
	"3B80B8F52A0939E16B5059F93A3FC19A":{n:"Virtual Pet (V007) (after Demo 2) (CRACKERS) (PD)"},
	"4F0071946E80CA68EDFDCCBAC86DCCE0":{n:"Virtual Pet Demo 1 (CRACKERS) (PD)"},
	"1F349DD41C3F93C4214E5E308DCCB056":{n:"Virtual Pet Demo 2 (CRACKERS) (PD)"},
	"E17699A54C90F3A56AE4820F779F72C4":{n:"Vogel Flieh (1983) (Quelle) (PAL)"},
	"6C128BC950FCBDBCAF0D99935DA70156":{n:"Volleyball (1983) (Digitel)"},
	"4D8396DEEABB40B5E8578276EB5A8B6D":{n:"Volleyball (1983) (Quelle) (PAL)"},
	"5FAFFE1C4C57430978DEC5CED32B9F4A":{n:"Volleyball (Dactari - Milmar)"},
	"42B3AB3CF661929BDC77B621A8C37574":{n:"Volleyball (Robby)"},
	"8108162BC88B5A14ADC3E031CF4175AD":{n:"Vom Himmel durch die Hoelle (1983) (Quelle) (PAL)"},
	"1F21666B8F78B65051B7A609F1D48608":{n:"Vulture Attack (1982) (K-Tel Vision)"},
	"B00A8BC9D7FE7080980A514005CBAD13":{n:"Vulture Attack (1982) (K-Tel Vision) (PAL)"},
	"6041F400B45511AA3A69FAB4B8FC8F41":{n:"Wabbit (1982) (Apollo)"},
	"38CF93EACFB2FA9A2C5E39059FF35A74":{n:"WacMan (2003) (Greg Zumwalt) (Hack)"},
	"1C5796D277D9E4DF3F6648F7012884C4":{n:"Wachroboter jagt Jupy (Quelle) (PAL)"},
	"7FF53F6922708119E7BF478D7D618C86":{n:"Walker (Suntek) (PAL)"},
	"D175258B2973B917A05B46DF4E1CF15D":{n:"Walker (Suntek) (PAL) [a]"},
	"D3456B4CF1BD1A7B8FB907AF1A80EE15":{n:"Wall Ball (1983) (Avalon Hill)",c:1},
	"C16FBFDBFDF5590CC8179E4B0F5F5AEB":{n:"Wall Break (Unknown)"},
	"EAE6A5510055341D3ABEB45667BB3E9B":{n:"Wall Defender (HES) (PAL)"},
	"03FF9E8A7AF437F16447FE88CEA3226C":{n:"Wall-Defender (1983) (Bomb)"},
	"372BDDF113D088BC572F94E98D8249F5":{n:"Wall-Defender (1983) (Bomb) (PAL)"},
	"6522717CFD75D1DBA252CBDE76992090":{n:"War 2000 (1983) (Home Vision) (PAL)"},
	"9436B7AD131B5A1F7753CE4309BA3DEE":{n:"War of The Worlds (Kyle Pittman) (Hack)"},
	"CBE5A166550A8129A5E6D374901DFFAD":{n:"Warlords (1981) (Atari)",p:1},
	"0C80751F6F7A3B370CC9E9F39AD533A7":{n:"Warlords (1981) (Atari) (PAL)",p:1},
	"679E910B27406C6A2072F9569AE35FC8":{n:"Warplock (1982) (Data Age)",p:1,c:1},
	"D1C3520B57C348BC21D543699BC88E7E":{n:"Warplock (1983) (Gameworld) (PAL)",p:1,c:1},
	"D88691C995008B9AB61A44BB686B32E4":{n:"Warring Worms (07-02-2002) (Billy Eno)"},
	"FA3DE71841C0841DB6A741884A6B6B2F":{n:"Warring Worms (17-02-2002) (Billy Eno)"},
	"2351D26D0BFDEE3095BEC9C05CBCF7B0":{n:"Warring Worms (19-01-2002) (Billy Eno)"},
	"7E7C4C59D55494E66EEF5E04EC1C6157":{n:"Warring Worms (2002) (Baroque Gaming)"},
	"A2F296EA2D6D4B59979BAC5DFBF4EDF0":{n:"Warring Worms (28-01-2002) (Billy Eno)"},
	"7A64B5A6E90619C6AACF244CDD7502F8":{n:"Warring Worms (Beta 1) (2002) (Baroque Gaming)"},
	"2F66EBF037321ED0442AC4B89CE22633":{n:"Warring Worms (Beta 2) (2002) (Baroque Gaming)"},
	"D17A8C440D6BE79FAE393A4B46661164":{n:"Warring Worms (Beta 3) (2002) (Billy Eno)"},
	"4A2FE6F0F6317F006FD6D4B34515448B":{n:"Warring Worms (Midwest Classic Edition) (08-06-2002) (Billy Eno)"},
	"E171558C51BB3BAC97BFA79FA2C1A19C":{n:"Warring Worms (Tim Strauss Edition) (20-12-2002) (Billy Eno)"},
	"0D7E630A14856F4D52C9666040961D4D":{n:"Wavy Line Test (PD)"},
	"5C73693A89B06E5A09F1721A13176F95":{n:"Wavy Line Test 2 (PD)"},
	"BCE4C291D0007F16997FAA5C4DB0A6B8":{n:"Weltraumtunnel (1983) (Quelle) (PAL)"},
	"D47387658ED450DB77C3F189B969CC00":{n:"Westward Ho (1982) (PlayAround) (PAL)"},
	"4C39A2C97917D3D71739B3E21F60BBA5":{n:"Whale (Sub Scan Hack)"},
	"AB10F2974DEE73DAB4579F0CAB35FCA6":{n:"Wilma Wanderer (1983) (ITT Family Games) (PAL)"},
	"4E02880BEEB8DBD4DA724A3F33F0971F":{n:"Wing War (1983) (Imagic) (PAL)"},
	"9D2938EB2B17BB73E9A79BBC06053506":{n:"Wing War (1983) (Imagic) (PAL) [a]"},
	"0CDD9CC692E8B04BA8EB31FC31D72E5E":{n:"Wing War (Thomas Jentzsch)"},
	"8E48EA6EA53709B98E6F4BD8AA018908":{n:"Wings (06-03-1983) (CBS Electronics) (Prototype)",c:1},
	"827A22B9DFFEE24E93ED0DF09FF8414A":{n:"Wings (10-10-1983) (CBS Electronics) (Prototype) (PAL)",c:1},
	"83FAFD7BD12E3335166C6314B3BDE528":{n:"Winter Games (1987) (Epyx)"},
	"8C36ED2352801031516695D1EEEFE617":{n:"Winter Games (1987) (Epyx) (PAL)"},
	"6C1553CA90B413BF762DFC65F2B881C7":{n:"Winterjagd (1983) (Quelle) (PAL)"},
	"7B24BFE1B61864E758ADA1FE9ADAA098":{n:"Wizard (1980) (Atari) (Prototype)"},
	"3B86A27132FB74D9B35D4783605A1BCB":{n:"Wizard (1980) (Atari) (Prototype) (4K)"},
	"1F40EEFC7447336AE6CD8FFA5EB325BE":{n:"Wizard (1980) (Atari) (Prototype) (4K) [a]"},
	"C43BD363E1F128E73BA5F0380B6FD7E3":{n:"Wizard (1980) (Atari) (Prototype) [a]"},
	"7E8AA18BC9502EB57DAAF5E7C1E94DA7":{n:"Wizard of Wor (1982) (CBS Electronics)",c:1},
	"663EF22EB399504D5204C543B8A86BCD":{n:"Wizard of Wor (1982) (CBS Electronics) (PAL)",c:1},
	"EC3BEB6D8B5689E867BAFB5D5F507491":{n:"Word Zapper (1982) (U.S. Games)"},
	"3A53963F053B22599DB6AC9686F7722F":{n:"Word Zapper (208 in 1) (Unknown) (PAL)"},
	"E1143B72A30D4D3FEE385EEC38B4AA4D":{n:"Word Zapper (Unknown)"},
	"37527966823EE9243D34C7DA8302774F":{n:"Word Zapper (Unknown) (PAL)"},
	"2FACD460A6828E0E476D3AC4B8C5F4F7":{n:"Words-Attack (1983) (Sancho) (PAL)",c:1},
	"130C5742CD6CBE4877704D733D5B08CA":{n:"World End (1983) (Home Vision) (PAL)"},
	"E62E60A3E6CB5563F72982FCD83DE25A":{n:"World End (Jone Yuan)"},
	"87F020DAA98D0132E98E43DB7D8FEA7E":{n:"Worm War I (1982) (20th Century Fox)"},
	"007D18DEDC1F0565F09C42AA61A6F585":{n:"Worm War I (1983) (CCE)"},
	"FB531FEBF8E155328EC0CD39EF77A122":{n:"Worm War I (208 in 1) (Unknown) (PAL)",c:1},
	"52B448757081FD9FABF859F4E2F91F6B":{n:"Worm War I (Unknown) (PAL)"},
	"5C0520C00163915A4336E481CA4E7EF4":{n:"Wuestenschlacht (1983) (Quelle) (PAL)"},
	"332F01FD18E99C6584F61AA45EE7791E":{n:"X'Mission (Unknown) (PAL)",c:1},
	"0D35618B6D76DDD46D2626E9E3E40DB5":{n:"X-Doom V.26 (PD)"},
	"F613AAD84D2163D6B197B220BFEC1B7E":{n:"X-Doom V.27 (PD)"},
	"5961D259115E99C30B64FE7058256BCF":{n:"X-Man (1983) (Universal)"},
	"5E201D6BFC520424A28F129EE5E56835":{n:"X-Man (1983) (Universal) (PAL)"},
	"F38358CD8F5ECFEDFFD5ACA1AA939F18":{n:"X-Man (1983) (Universal) [a]"},
	"9E2C7299C69B602443D327C7DAD51CBF":{n:"Xaxyrax Road (Charles Morgan) (Hack)"},
	"972486110933623039A3581DB308FDA6":{n:"Xeno Plus (Hack)"},
	"EAF744185D5E8DEF899950BA7C6E7BB5":{n:"Xenophobe (1990) (Atari)"},
	"F02BA8B5292BF3017D10553C9B7B2861":{n:"Xenophobe (1990) (Atari) (PAL)"},
	"5494B9EE403D9757F0FD1F749E80214A":{n:"Xenophobe Arcade (2003) (Larry Petit) (Hack)"},
	"284CA61B2407BDBA3938048B0A559015":{n:"Xevious (05-25-1983) (Atari) (Prototype)",c:1},
	"C6688781F4AB844852F4E3352772289B":{n:"Xevious (08-02-1983) (Atari) (Prototype)",c:1},
	"24385BA7F5109FBE76AADC0A375DE573":{n:"Xevious (CCE)",c:1},
	"D090836F0A4EA8DB9AC7ABB7D6ADF61E":{n:"Yahtzee (Hozer Video Games)",c:1},
	"096649575E451508006B17E0353259A5":{n:"Yar Vs. Yar (2002) (Justin J. Scott) (Hack)",c:1},
	"159E5CD6CCB968015F49AED5ADBC91EB":{n:"Yar's Defeat (2002) (Justin J. Scott) (Hack)",c:1},
	"C5930D0E8CDAE3E037349BFA08E871BE":{n:"Yars' Revenge (1982) (Atari)",c:1},
	"E91D2ECF8803AE52B55BBF105AF04D4B":{n:"Yars' Revenge (1982) (Atari) (PAL)",c:1},
	"75EA60884C05BA496473C23A58EDF12F":{n:"Yars' Revenge (1982) (Atari) (PAL) [a]",c:1},
	"5F681403B1051A0822344F467B05A94D":{n:"Yars' Revenge (1982) (Atari) [a]",c:1},
	"2F7772879A1ED04F660AA9D77A86A4BD":{n:"Yars' Revenge (Genesis)",c:1},
	"522C9CF684ECD72DB2F85053E6F6F720":{n:"Year 1999, The (Rainbow Vision) (PAL)"},
	"2179DFD7EDEE76EFAFE698C1BC763735":{n:"Yellow Submarine (Cody Pittman) (PD)"},
	"3856B9425CC0185ED770376A62AF0282":{n:"Yellow Submarine (Kyle Pittman) (Hack)"},
	"C1E6E4E7EF5F146388A090F1C469A2FA":{n:"Z-Tack (1983) (Bomb)"},
	"D6DC9B4508DA407E2437BFA4DE53D1B2":{n:"Z-Tack (1983) (Bomb) (PAL)"},
	"25BB080457351BE724AAC8A02021AA92":{n:"Zaxxon (1982) (CBS Electronics) (PAL)"},
	"EEA0DA9B987D661264CCE69A7C13C3BD":{n:"Zaxxon (1982) (Coleco)"},
	"1367E41858BE525710EB04D0DAB53505":{n:"Zelda (2003) (Kyle Pittman) (Hack)"},
	"C5A76BAFC4676EDB76E0126FB9F0FB2D":{n:"Zero Patrol (Charles Morgan) (Hack)"},
	"692202772D8B38CCF85A90C8003A1324":{n:"Zi - The Flie Buster (2002) (Fernando Mora) (PD)"},
	"FB833ED50C865A9A505A125FC9D79A7E":{n:"Zoo Fun (1983) (Home Vision) (PAL)"},
	"0FCFF6FE3B0769AD5D0CF82814D2A6D9":{n:"Zoo Fun (Suntek) (PAL)"},
	"A336BEAC1F0A835614200ECD9C41FD70":{n:"Zoo Keeper Sounds (1984) (Atari) (Prototype)"},
	"527B2893F202E0B4930E18E739C81EF4":{n:"Star Castle Arcade 124cu",l:"Star Castle Arcade",c:1},
	"2CEE5D587E6A2240233C93A5035D5748":{n:"Star Castle Arcade 124",l:"Star Castle Arcade",c:1},
	"DCBDD2C1E201637C30369CE657E1B5CC":{n:"Star Castle Arcade 133cu",l:"Star Castle Arcade",c:1},
	"B503531C719AECEF6E97C4961F97F5E8":{n:"Star Castle Arcade 133",l:"Star Castle Arcade",c:1},
	"33AB116244C57F6726D0D64BA9F5B6A4":{n:"Star Castle Arcade 140cu",l:"Star Castle Arcade",c:1},
	"15A6D61D04D50B5C4DC77964AF812469":{n:"Star Castle Arcade 140",l:"Star Castle Arcade",c:1}
};

// Copyright 2015 by Paulo Augusto Peccin. See license.txt distributed with this file.

jt.Cartridge = function() {

    this.powerOn = function() {
    };

    this.powerOff = function() {
    };

    this.connectBus = function(bus) {
    };

    this.connectSaveStateSocket = function(socket) {
    };

    this.read = function(address) {
    };

    this.write = function(address, val) {
        // Writing to ROMs is possible, but nothing is changed
    };

    this.needsBusMonitoring = function() {
        return false;
    };

    this.monitorBusBeforeRead = function(address, data)  {
    };

    this.monitorBusBeforeWrite = function(address, val)  {
    };

    this.needsAudioClock = function() {
        return false;
    };

    this.audioClockPulse = function() {
    };


     // Controls interface  ---------------------------------

    this.controlStateChanged = function(control, state) {
    };

    this.controlValueChanged = function(control, position) {
    };

    this.controlsStateReport = function(report) {
    };


    // Savestate  -------------------------------------------

    this.saveState = function() {
    };

    this.loadState = function(state) {
    };


    this.rom = null;

};

jt.Cartridge.base = new jt.Cartridge();

// Copyright 2015 by Paulo Augusto Peccin. See license.txt distributed with this file.

// Implements the 4K unbanked format. Smaller ROMs will be copied multiple times to fill the entire 4K

jt.Cartridge4K = function(rom, format) {

    function init(self) {
        self.rom = rom;
        self.format = format;
        // Always use a 4K ROM image, multiplying the ROM internally
        bytes = new Array(4096);
        var len = rom.content.length;
        for (var pos = 0; pos < bytes.length; pos += len)
            jt.Util.arrayCopy(rom.content, 0, bytes, pos, len);
    }

    this.read = function(address) {
        return bytes[address & ADDRESS_MASK];
    };


    // Savestate  -------------------------------------------

    this.saveState = function() {
        return {
            f: this.format.name,
            r: this.rom.saveState(),
            b: btoa(jt.Util.uInt8ArrayToByteString(bytes))
        };
    };

    this.loadState = function(state) {
        this.format = jt.CartridgeFormats[state.f];
        this.rom = jt.ROM.loadState(state.r);
        bytes = jt.Util.byteStringToUInt8Array(atob(state.b));
    };


    var bytes;

    var ADDRESS_MASK = 0x0fff;


    if (rom) init(this);

};

jt.Cartridge4K.prototype = jt.Cartridge.base;

jt.Cartridge4K.createFromSaveState = function(state) {
    var cart = new jt.Cartridge4K();
    cart.loadState(state);
    return cart;
};

// Copyright 2015 by Paulo Augusto Peccin. See license.txt distributed with this file.

// Implements the 2K "CV" Commavid + 1K RAM format

jt.Cartridge2K_CV = function(rom, format) {

    function init(self) {
        self.rom = rom;
        self.format = format;
        // Always use a 4K ROM image, multiplying the ROM internally
        bytes = new Array(4096);
        var len = rom.content.length;
        for (var pos = 0; pos < bytes.length; pos += len)
            jt.Util.arrayCopy(rom.content, 0, bytes, pos, len);
    }

    this.read = function(address) {
        var maskedAddress = maskAddress(address);
        // Check for Extra RAM reads
        if (maskedAddress < 0x0400)				// RAM
            return extraRAM[maskedAddress];
        else
            return bytes[maskedAddress];	    // ROM
    };

    this.write = function(address, val) {
        var maskedAddress = maskAddress(address);
        // Check for Extra RAM writes
        if (maskedAddress >= 0x0400 && maskedAddress <= 0x07ff)
            extraRAM[maskedAddress - 0x0400] = val;
    };

    var maskAddress = function(address) {
        return address & ADDRESS_MASK;
    };


    // Savestate  -------------------------------------------

    this.saveState = function() {
        return {
            f: this.format.name,
            r: this.rom.saveState(),
            b: btoa(jt.Util.uInt8ArrayToByteString(bytes)),
            ra: btoa(jt.Util.uInt8ArrayToByteString(extraRAM))
        };
    };

    this.loadState = function(state) {
        this.format = jt.CartridgeFormats[state.f];
        this.rom = jt.ROM.loadState(state.r);
        bytes = jt.Util.byteStringToUInt8Array(atob(state.b));
        extraRAM = jt.Util.byteStringToUInt8Array(atob(state.ra));
    };


    var bytes;
    var extraRAM = jt.Util.arrayFill(new Array(1024), 0);

    var ADDRESS_MASK = 0x0fff;


    if (rom) init(this);

};

jt.Cartridge2K_CV.prototype = jt.Cartridge.base;

jt.Cartridge2K_CV.createFromSaveState = function(state) {
    var cart = new jt.Cartridge2K_CV();
    cart.loadState(state);
    return cart;
};

// Copyright 2015 by Paulo Augusto Peccin. See license.txt distributed with this file.

/**
 * Implements the simple bank switching method by masked address range access (within Cart area)
 * Supports SuperChip extra RAM (ON/OFF/AUTO).
 * Used by several n * 4K bank formats with varying extra RAM sizes
 */

jt.CartridgeBankedByMaskedRange = function(rom, format, pBaseBankSwitchAddress, superChip, pExtraRAMSize) {

    function init(self) {
        self.rom = rom;
        self.format = format;
        bytes = rom.content;        // uses the content of the ROM directly
        var numBanks = bytes.length / BANK_SIZE;
        baseBankSwitchAddress = pBaseBankSwitchAddress;
        topBankSwitchAddress = baseBankSwitchAddress + numBanks - 1;
        extraRAMSize = pExtraRAMSize;
        // SuperChip mode. null = automatic mode
        if (superChip == null || superChip == undefined) {
            superChipMode = false;
            superChipAutoDetect = true;
        } else {
            superChipMode = !!superChip;
            superChipAutoDetect = false;
        }
        extraRAM = superChip !== false ? jt.Util.arrayFill(new Array(extraRAMSize), 0) : null;
    }

    this.read = function(address) {
        var maskedAddress = maskAddress(address);
        // Check for SuperChip Extra RAM reads
        if (superChipMode && (maskedAddress >= extraRAMSize) && (maskedAddress < extraRAMSize * 2))
            return extraRAM[maskedAddress - extraRAMSize];
        else
        // Always add the correct offset to access bank selected
            return bytes[bankAddressOffset + maskedAddress];
    };

    this.write = function(address, val) {
        var maskedAddress = maskAddress(address);
        // Check for Extra RAM writes and then turn superChip mode on
        if (maskedAddress < extraRAMSize && (superChipMode || superChipAutoDetect)) {
            if (!superChipMode) superChipMode = true;
            extraRAM[maskedAddress] = val;
        }
    };

    var maskAddress = function(address) {
        var maskedAddress = address & ADDRESS_MASK;
        // Check and perform bank-switch as necessary
        if (maskedAddress >= baseBankSwitchAddress && maskedAddress <= topBankSwitchAddress)
            bankAddressOffset = BANK_SIZE * (maskedAddress - baseBankSwitchAddress);
        return maskedAddress;
    };


    // Savestate  -------------------------------------------

    this.saveState = function() {
        return {
            f: this.format.name,
            r: this.rom.saveState(),
            b: btoa(jt.Util.uInt8ArrayToByteString(bytes)),
            bo: bankAddressOffset,
            bb: baseBankSwitchAddress,
            es: extraRAMSize,
            tb: topBankSwitchAddress,
            s: superChipMode | 0,
            sa: superChipAutoDetect | 0,
            e: extraRAM && btoa(jt.Util.uInt8ArrayToByteString(extraRAM))
        };
    };

    this.loadState = function(state) {
        this.format = jt.CartridgeFormats[state.f];
        this.rom = jt.ROM.loadState(state.r);
        bytes = jt.Util.byteStringToUInt8Array(atob(state.b));
        bankAddressOffset = state.bo;
        baseBankSwitchAddress = state.bb;
        extraRAMSize = state.es;
        topBankSwitchAddress =  state.tb;
        superChipMode = !!state.s;
        superChipAutoDetect = !!state.sa;
        extraRAM = state.e && jt.Util.byteStringToUInt8Array(atob(state.e));
    };


    var bytes;

    var bankAddressOffset = 0;
    var baseBankSwitchAddress;
    var topBankSwitchAddress;

    var superChipMode = false;
    var superChipAutoDetect;
    var extraRAMSize;
    var extraRAM;


    var ADDRESS_MASK = 0x0fff;
    var BANK_SIZE = 4096;


    if (rom) init(this);

};

jt.CartridgeBankedByMaskedRange.prototype = jt.Cartridge.base;

jt.CartridgeBankedByMaskedRange.createFromSaveState = function(state) {
    var cart = new jt.CartridgeBankedByMaskedRange();
    cart.loadState(state);
    return cart;
};

// Copyright 2015 by Paulo Augusto Peccin. See license.txt distributed with this file.

// Implements the 8K "E0" Parker Bros. format

jt.Cartridge8K_E0 = function(rom, format) {

    function init(self) {
        self.rom = rom;
        self.format = format;
        bytes = rom.content;        // uses the content of the ROM directly
    }

    this.read = function(address) {
        var maskedAddress = maskAddress(address);
        // Always add the correct offset to access bank selected on the corresponding slice
        if (maskedAddress < 0x0400)		// Slice 0
            return bytes[slice0AddressOffset + maskedAddress];
        if (maskedAddress < 0x0800)		// Slice 1
            return bytes[slice1AddressOffset + maskedAddress - 0x0400];
        if (maskedAddress < 0x0c00)		// Slice 2
            return bytes[slice2AddressOffset + maskedAddress - 0x0800];
        // Slice 3 (0x0c00 - 0x0fff) is always at 0x1c00 (bank 7)
        return bytes[0x1000 + maskedAddress];
    };

    this.write = function(address, val) {
        maskAddress(address);
        // Writing to ROMs is possible, but nothing is changed
    };

    var maskAddress = function(address) {
        var maskedAddress = address & ADDRESS_MASK;
        // Check if address is within range of bank selection
        if (maskedAddress >= 0x0fe0 && maskedAddress <= 0x0ff7) {
            // Each bank is 0x0400 bytes each, 0 to 7
            if (/* maskedAddress >= 0x0fe0 && */ maskedAddress <= 0x0fe7)	    // Slice 0 bank selection
                slice0AddressOffset = (maskedAddress - 0x0fe0) * 0x0400;
            else if (/* maskedAddress >= 0x0fe8 && */ maskedAddress <= 0x0fef)	// Slice 1 bank selection
                slice1AddressOffset = (maskedAddress - 0x0fe8) * 0x0400;
            else if (/* maskedAddress >= 0x0ff0 && */ maskedAddress <= 0x0ff7)	// Slice 2 bank selection
                slice2AddressOffset = (maskedAddress - 0x0ff0) * 0x0400;
        }
        return maskedAddress;
    };


    // Savestate  -------------------------------------------

    this.saveState = function() {
        return {
            f: this.format.name,
            r: this.rom.saveState(),
            b: btoa(jt.Util.uInt8ArrayToByteString(bytes)),
            s0: slice0AddressOffset,
            s1: slice1AddressOffset,
            s2: slice2AddressOffset
        };
    };

    this.loadState = function(state) {
        this.format = jt.CartridgeFormats[state.f];
        this.rom = jt.ROM.loadState(state.r);
        bytes = jt.Util.byteStringToUInt8Array(atob(state.b));
        slice0AddressOffset = state.s0;
        slice1AddressOffset = state.s1;
        slice2AddressOffset = state.s2;
    };


    var bytes;
    var slice0AddressOffset = 0;
    var slice1AddressOffset = 0;
    var slice2AddressOffset = 0;
    // Slice 3 is fixed at bank 7


    var ADDRESS_MASK = 0x0fff;


    if (rom) init(this);

};

jt.Cartridge8K_E0.prototype = jt.Cartridge.base;

jt.Cartridge8K_E0.createFromSaveState = function(state) {
    var cart = new jt.Cartridge8K_E0();
    cart.loadState(state);
    return cart;
};

// Copyright 2015 by Paulo Augusto Peccin. See license.txt distributed with this file.

// Implements the 64K "F0" Dynacom Megaboy format

jt.Cartridge64K_F0 = function(rom, format) {

    function init(self) {
        self.rom = rom;
        self.format = format;
        bytes = rom.content;        // uses the content of the ROM directly
    }

    this.read = function(address) {
        var maskedAddress = maskAddress(address);
        return bytes[bankAddressOffset + maskedAddress];
    };

    this.write = function(address, val) {
        maskAddress(address);
        // Writing to ROMs is possible, but nothing is changed
    };

    var maskAddress = function(address) {
        var maskedAddress = address & ADDRESS_MASK;
        // Check and perform bank-switch as necessary
        if (maskedAddress == BANKSW_ADDRESS) {	// Bank selection. Increments bank
            bankAddressOffset += BANK_SIZE;
            if (bankAddressOffset >= SIZE) bankAddressOffset = 0;
        }
        return maskedAddress;
    };


    // Savestate  -------------------------------------------

    this.saveState = function() {
        return {
            f: this.format.name,
            r: this.rom.saveState(),
            b: btoa(jt.Util.uInt8ArrayToByteString(bytes)),
            bo: bankAddressOffset
        };
    };

    this.loadState = function(state) {
        this.format = jt.CartridgeFormats[state.f];
        this.rom = jt.ROM.loadState(state.r);
        bytes = jt.Util.byteStringToUInt8Array(atob(state.b));
        bankAddressOffset = state.bo;
    };


    var bytes;
    var bankAddressOffset = 0;

    var ADDRESS_MASK = 0x0fff;
    var SIZE = 65536;
    var BANK_SIZE = 4096;
    var BANKSW_ADDRESS = 0x0ff0;


    if (rom) init(this);

};

jt.Cartridge64K_F0.prototype = jt.Cartridge.base;

jt.Cartridge64K_F0.createFromSaveState = function(state) {
    var cart = new jt.Cartridge64K_F0();
    cart.loadState(state);
    return cart;
};

// Copyright 2015 by Paulo Augusto Peccin. See license.txt distributed with this file.

// Implements the 8K "FE" Robotank/Decathlon format

jt.Cartridge8K_FE = function(rom, format) {

    function init(self) {
        self.rom = rom;
        self.format = format;
        bytes = rom.content;        // uses the content of the ROM directly
    }

    this.read = function(address) {
        var maskedAddress = maskAddress(address);
        return bytes[bankAddressOffset + maskedAddress];
    };

    this.write = function(address, val) {
        maskAddress(address);
        // Writing to ROMs is possible, but nothing is changed
    };

    var maskAddress = function(address) {
        // Bankswitching: Look at the address to determine the correct bank to be
        if ((address & 0x2000) !== 0) {		// Check bit 13. Address is like Fxxx or Dxxx?
            if (bankAddressOffset !== 0) bankAddressOffset = 0;
        } else {
            if (bankAddressOffset != BANK_SIZE) bankAddressOffset = BANK_SIZE;
        }
        return address & ADDRESS_MASK;
    };


    // Savestate  -------------------------------------------

    this.saveState = function() {
        return {
            f: this.format.name,
            r: this.rom.saveState(),
            b: btoa(jt.Util.uInt8ArrayToByteString(bytes)),
            bo: bankAddressOffset
        };
    };

    this.loadState = function(state) {
        this.format = jt.CartridgeFormats[state.f];
        this.rom = jt.ROM.loadState(state.r);
        bytes = jt.Util.byteStringToUInt8Array(atob(state.b));
        bankAddressOffset = state.bo;
    };


    var bytes;
    var bankAddressOffset = 0;

    var ADDRESS_MASK = 0x0fff;
    var BANK_SIZE = 4096;


    if (rom) init(this);

};

jt.Cartridge8K_FE.prototype = jt.Cartridge.base;

jt.Cartridge8K_FE.createFromSaveState = function(state) {
    var cart = new jt.Cartridge8K_FE();
    cart.loadState(state);
    return cart;
};

// Copyright 2015 by Paulo Augusto Peccin. See license.txt distributed with this file.

// Implements the 16K "E7" M-Network format

jt.Cartridge16K_E7 = function(rom, format) {

    function init(self) {
        self.rom = rom;
        self.format = format;
        bytes = rom.content;        // uses the content of the ROM directly
    }

    this.read = function(address) {
        var maskedAddress = maskAddress(address);
        // Check for Extra RAM Slice1 (always ON)
        if (maskedAddress >= 0x0900 && maskedAddress <= 0x09ff)
            return extraRAM[extraRAMSlice1Offset + maskedAddress - 0x0900];
        // Check for Extra RAM Slice0
        if (extraRAMSlice0Active && maskedAddress >= 0x0400 && maskedAddress <= 0x07ff)
            return extraRAM[maskedAddress - 0x0400];
        // ROM
        if (maskedAddress < ROM_FIXED_SLICE_START)
            return bytes[bankAddressOffset + maskedAddress];		// ROM Selectable Slice
        else
            return bytes[ROM_FIXED_SLICE_OFFSET + maskedAddress];	// ROM Fixed Slice
    };

    this.write = function(address, val) {
        var maskedAddress = maskAddress(address);
        // Check for Extra RAM Slice1 (always ON)
        if (maskedAddress >= 0x0800 && maskedAddress <= 0x08ff)
            extraRAM[extraRAMSlice1Offset + maskedAddress - 0x0800] = val;
        else // Check for Extra RAM Slice0
            if (extraRAMSlice0Active && maskedAddress <= 0x03ff)
                extraRAM[maskedAddress] = val;
    };

    var maskAddress = function(address) {
        var maskedAddress = address & ADDRESS_MASK;
        // Check if address is within range of bank selection
        if (maskedAddress >= 0x0fe0 && maskedAddress <= 0x0feb) {
            if (/* maskedAddress >= 0x0fe0 && */ maskedAddress <= 0x0fe6)	    // Selectable ROM Slice
                bankAddressOffset = BANK_SIZE * (maskedAddress - 0x0fe0);
            else if (maskedAddress == 0x0fe7)								    // Extra RAM Slice0
                extraRAMSlice0Active = true;
            else if (/* maskedAddress >= 0x0fe8 && */ maskedAddress <= 0x0feb)	// Extra RAM Slice1
                extraRAMSlice1Offset = EXTRA_RAM_SLICE1_START + EXTRA_RAM_SLICE1_BANK_SIZE * (maskedAddress - 0x0fe8);
        }
        return maskedAddress;
    };


    // Savestate  -------------------------------------------

    this.saveState = function() {
        return {
            f: this.format.name,
            r: this.rom.saveState(),
            b: btoa(jt.Util.uInt8ArrayToByteString(bytes)),
            bo: bankAddressOffset,
            rs: extraRAMSlice0Active,
            ro: extraRAMSlice1Offset,
            ra: btoa(jt.Util.uInt8ArrayToByteString(extraRAM))
        };
    };

    this.loadState = function(state) {
        this.format = jt.CartridgeFormats[state.f];
        this.rom = jt.ROM.loadState(state.r);
        bytes = jt.Util.byteStringToUInt8Array(atob(state.b));
        bankAddressOffset = state.bo;
        extraRAMSlice0Active = state.rs;
        extraRAMSlice1Offset = state.ro;
        extraRAM = jt.Util.byteStringToUInt8Array(atob(state.ra));
    };


    var bytes;
    var bankAddressOffset = 0;

    var EXTRA_RAM_SLICE1_START = 1024;

    var extraRAM = jt.Util.arrayFill(new Array(2048), 0);
    var extraRAMSlice0Active = false;
    var extraRAMSlice1Offset = EXTRA_RAM_SLICE1_START;

    var ADDRESS_MASK = 0x0fff;
    var SIZE = 16384;
    var BANK_SIZE = 2048;
    var ROM_FIXED_SLICE_START = 0x0800;
    var ROM_FIXED_SLICE_OFFSET = SIZE - BANK_SIZE - ROM_FIXED_SLICE_START;
    var EXTRA_RAM_SLICE1_BANK_SIZE = 256;


    if (rom) init(this);

};

jt.Cartridge16K_E7.prototype = jt.Cartridge.base;

jt.Cartridge16K_E7.createFromSaveState = function(state) {
    var cart = new jt.Cartridge16K_E7();
    cart.loadState(state);
    return cart;
};

// Copyright 2015 by Paulo Augusto Peccin. See license.txt distributed with this file.

// Implements the 8K + 2K "DPCa" (Pitfall2) format, enhanced version with TIA audio updates every DPC audio clock!

jt.Cartridge10K_DPCa = function(rom, format) {

    function init(self) {
        self.rom = rom;
        self.format = format;
        bytes = rom.content;        // uses the content of the ROM directly
    }

    this.powerOn = function() {
        audioClockStep = AUDIO_CLOCK_DEFAULT_STEP;
        audioClockCycles = 0;
    };

    this.connectBus = function(bus) {
        dpcAudioChannel = bus.getTia().getAudioOutput().getChannel0();
    };

    this.needsAudioClock = function() {
        return true;
    };

    this.read = function(address) {
        var maskedAddress = maskAddress(address);
        // Check for DPC register read
        if (maskedAddress <= 0x03f || (maskedAddress >= 0x800 && maskedAddress <= 0x83f))
            return readDPCRegister(maskedAddress & 0x00ff);
        // Always add the correct bank offset
        return bytes[bankAddressOffset + maskedAddress];	// ROM
    };

    this.write = function(address, val) {
        var maskedAddress = maskAddress(address);
        // Check for DPC register write
        if ((maskedAddress >= 0x040 && maskedAddress <= 0x07f) ||
            (maskedAddress >= 0x840 && maskedAddress <= 0x87f))
            writeDPCRegister(maskedAddress & 0x00ff, val);
    };

    this.audioClockPulse = function() {
        if (((audioClockCycles + audioClockStep) | 0) > (audioClockCycles | 0)) {
            // Actual integer clock
            for (var f = 5; f <= 7; f++) {
                if (!audioMode[f]) continue;
                fetcherPointer[f]--;
                if ((fetcherPointer[f] & 0x00ff) == 0xff)
                    setFetcherPointer(f, fetcherPointer[f] & 0xff00 | fetcherStart[f]);
                updateFetcherMask(f);
                if (!audioChanged) audioChanged = true;
            }
        }
        audioClockCycles += audioClockStep;
        if (!audioChanged) return;
        // Send a volume update directly to TIA Audio Channel 0
        updateAudioOutput();
        dpcAudioChannel.setVolume(audioOutput);
    };

    var maskAddress = function(address) {
        var maskedAddress = address & ADDRESS_MASK;
        // Check and perform bank-switch as necessary
        if (maskedAddress === 0xff8) bankAddressOffset = 0;
        else if (maskedAddress === 0xff9) bankAddressOffset = 4096;
        return maskedAddress;
    };

    var updateAudioOutput = function() {
        audioOutput = AUDIO_MIXED_OUTPUT[
        (audioMode[5] ? fetcherMask[5] & 0x04 : 0) |
        (audioMode[6] ? fetcherMask[6] & 0x02 : 0) |
        (audioMode[7] ? fetcherMask[7] & 0x01 : 0)];
        audioChanged = false;
    };

    // TODO Fix bug when reading register as normal fetcher while in audio mode
    var readDPCRegister = function(reg) {
        var res;
        // Random number
        if (reg >= 0x00 && reg <= 0x03) {
            clockRandomNumber();
            return randomNumber;
        }
        // Audio value (MOVAMT not supported)
        if (reg >= 0x04 && reg <= 0x07) {
            if (audioChanged) updateAudioOutput();
            return audioOutput;
        }
        // Fetcher unmasked value
        if (reg >= 0x08 && reg <= 0x0f) {
            res = bytes[DPC_ROM_END - fetcherPointer[reg - 0x08]];
            clockFetcher(reg - 0x08);
            return res;
        }
        // Fetcher masked value
        if (reg >= 0x10 && reg <= 0x17) {
            res = bytes[DPC_ROM_END - fetcherPointer[reg - 0x10]] & fetcherMask[reg - 0x10];
            clockFetcher(reg - 0x10);
            return res;
        }
        // Fetcher masked value, nibbles swapped
        if (reg >= 0x18 && reg <= 0x1f) {
            res = bytes[DPC_ROM_END - fetcherPointer[reg - 0x18]] & fetcherMask[reg - 0x18];
            clockFetcher(reg - 0x18);
            res = (res & 0x0f << 4) | (res & 0xf0 >>> 4);
            return res;
        }
        // Fetcher masked value, byte reversed
        if (reg >= 0x20 && reg <= 0x27) {
            res = bytes[DPC_ROM_END - fetcherPointer[reg - 0x20]] & fetcherMask[reg - 0x20];
            clockFetcher(reg - 0x20);
            res = (res & 0x01 << 7) |  (res & 0x02 << 5) |  (res & 0x04 << 3) |  (res & 0x08 << 1) |
                  (res & 0x10 >>> 1) | (res & 0x20 >>> 3) | (res & 0x40 >>> 5) | (res & 0x80 >> 7);
            return res;
        }
        // Fetcher masked value, byte rotated right
        if (reg >= 0x28 && reg <= 0x2f) {
            res = bytes[DPC_ROM_END - fetcherPointer[reg - 0x28]] & fetcherMask[reg - 0x28];
            clockFetcher(reg - 0x28);
            res = ((res >>> 1) | (res << 7)) & 0xff;
            return res;
        }
        // Fetcher masked value, byte rotated left
        if (reg >= 0x30 && reg <= 0x37) {
            res = bytes[DPC_ROM_END - fetcherPointer[reg - 0x30]] & fetcherMask[reg - 0x30];
            clockFetcher(reg - 0x30);
            res = ((res << 1) | ((res >> 7) & 0x01)) & 0xff;
            return res;
        }
        // Fetcher mask
        if (reg >= 0x38 && reg <= 0x3f) {
            return fetcherMask[reg - 0x38];
        }
        return 0;
    };

    var writeDPCRegister = function(reg, b) {
        // Fetchers Start
        if (reg >= 0x40 && reg <= 0x47) {
            var f = reg - 0x40;
            fetcherStart[f] = b;
            if ((fetcherPointer[f] & 0xff) === fetcherStart[f]) fetcherMask[f] = 0xff;
            return;
        }
        // Fetchers End
        if (reg >= 0x48 && reg <= 0x4f) {
            fetcherEnd[reg - 0x48] = b; fetcherMask[reg - 0x48] = 0x00; return;
        }
        // Fetchers Pointers LSB
        if (reg >= 0x50 && reg <= 0x57) {
            setFetcherPointer(reg - 0x50, (fetcherPointer[reg - 0x50] & 0xff00) | (b & 0xff)); return;			// LSB
        }
        // Fetchers 0-3 Pointers MSB
        if (reg >= 0x58 && reg <= 0x5b) {
            setFetcherPointer(reg - 0x58, (fetcherPointer[reg - 0x58] & 0x00ff) | ((b & (0x07)) << 8)); return;	// MSB bits 0-2
        }
        // Fetchers 4 Pointers MSB (Draw Line enable not supported)
        if (reg == 0x5c) {
            setFetcherPointer(4, (fetcherPointer[4] & 0x00ff) | ((b & (0x07)) << 8));							// MSB bits 0-2
            return;
        }
        // Fetchers 5-7 Pointers MSB and Audio Mode enable
        if (reg >= 0x5d && reg <= 0x5f) {
            setFetcherPointer(reg - 0x58, (fetcherPointer[reg - 0x58] & 0x00ff) + ((b & (0x07)) << 8));			// MSB bits 0-2
            audioMode[reg - 0x58] = ((b & 0x10) >>> 4);
            return;
        }
        // Draw Line MOVAMT value (not supported)
        if (reg >= 0x60 && reg <= 0x67) {
            return;
        }
        // 0x68 - 0x6f Not used
        // Random Number reset
        if (reg >= 0x70 && reg <= 0x77) {
            randomNumber = 0x00;
        }
        // 0x78 - 0x7f Not used
    };

    var setFetcherPointer = function(f, pointer) {
        fetcherPointer[f] = pointer;
    };

    var clockFetcher = function(f) {
        var newPointer = fetcherPointer[f] - 1;
        if (newPointer < 0 ) newPointer = 0x07ff;
        setFetcherPointer(f, newPointer);
        updateFetcherMask(f);
    };

    var updateFetcherMask = function(f) {
        var lsb = fetcherPointer[f] & 0xff;
        if (lsb == fetcherStart[f]) fetcherMask[f] = 0xff;
        else if (lsb == fetcherEnd[f]) fetcherMask[f] = 0x00;
    };

    var clockRandomNumber = function() {
        randomNumber = ((randomNumber << 1) |
            (~((randomNumber >> 7) ^ (randomNumber >> 5) ^
            (randomNumber >> 4) ^ (randomNumber >> 3)) & 0x01)) & 0xff;
        if (randomNumber === 0xff) randomNumber = 0;
    };


    // Controls interface  ---------------------------------

    this.controlStateChanged = function(control, state) {
        if (!state) return;
        switch (control) {
            case jt.ConsoleControls.CARTRIDGE_CLOCK_DEC:
                if (audioClockStep < 1) audioClockStep += 0.01;
                jt.Util.log("DPC audio clock factor: " + audioClockStep);
                break;
            case jt.ConsoleControls.CARTRIDGE_CLOCK_INC:
                if (audioClockStep > 0.3) audioClockStep -= 0.01;
                jt.Util.log("DPC audio clock factor: " + audioClockStep);
        }
    };


    // Savestate  -------------------------------------------

    this.saveState = function() {
        return {
            f: this.format.name,
            r: this.rom.saveState(),
            b: btoa(jt.Util.uInt8ArrayToByteString(bytes)),
            bo: bankAddressOffset,
            rn: randomNumber,
            fp: btoa(jt.Util.uInt8ArrayToByteString(fetcherPointer)),
            fs: btoa(jt.Util.uInt8ArrayToByteString(fetcherStart)),
            fe: btoa(jt.Util.uInt8ArrayToByteString(fetcherEnd)),
            fm: btoa(jt.Util.uInt8ArrayToByteString(fetcherMask)),
            a: btoa(jt.Util.uInt8ArrayToByteString(audioMode))
        };
    };

    this.loadState = function(state) {
        this.format = jt.CartridgeFormats[state.f];
        this.rom = jt.ROM.loadState(state.r);
        bytes = jt.Util.byteStringToUInt8Array(atob(state.b));
        bankAddressOffset = state.bo;
        randomNumber = state.rn;
        fetcherPointer = jt.Util.byteStringToUInt8Array(atob(state.fp));
        fetcherStart = jt.Util.byteStringToUInt8Array(atob(state.fs));
        fetcherEnd = jt.Util.byteStringToUInt8Array(atob(state.fe));
        fetcherMask = jt.Util.byteStringToUInt8Array(atob(state.fm));
        audioMode = jt.Util.byteStringToUInt8Array(atob(state.a));
    };


    var AUDIO_MIXED_OUTPUT = [0x0, 0x5, 0x5, 0xa, 0x5, 0xa, 0xa, 0xf];
    // var AUDIO_MIXED_OUTPUT = [0x0, 0x4, 0x5, 0x9, 0x6, 0xa, 0xb, 0xf];   // Per specification

    var ADDRESS_MASK = 0x0fff;
    var AUDIO_CLOCK_DEFAULT_STEP = 0.62;
    var DPC_ROM_END = 8192 + 2048 - 1;

    var dpcAudioChannel;

    var bytes;
    var bankAddressOffset = 0;
    var randomNumber = 0;
    var fetcherPointer = jt.Util.arrayFill(new Array(8), 0);
    var fetcherStart =   jt.Util.arrayFill(new Array(8), 0);
    var fetcherEnd =     jt.Util.arrayFill(new Array(8), 0);
    var fetcherMask =    jt.Util.arrayFill(new Array(8), 0);
    var audioMode =      jt.Util.arrayFill(new Array(8), 0);
    var audioClockStep = AUDIO_CLOCK_DEFAULT_STEP;
    var audioClockCycles = 0;
    var audioChanged = true;
    var audioOutput = 0;


    if (rom) init(this);

};

jt.Cartridge10K_DPCa.prototype = jt.Cartridge.base;

jt.Cartridge10K_DPCa.createFromSaveState = function(state) {
    var cart = new jt.Cartridge10K_DPCa();
    cart.loadState(state);
    return cart;
};

// Copyright 2015 by Paulo Augusto Peccin. See license.txt distributed with this file.

// Implements the 24K/28K/32K "FA2" CBS RAM Plus format
// Also supports SC RAM Saving on Harmony Flash memory (emulated to a "savestate" file)

jt.Cartridge24K_28K_32K_FA2 = function(rom, format, pRomStartAddress) {
    var self = this;

    function init(self) {
        self.rom = rom;
        self.format = format;
        bytes = rom.content;        // uses the content of the ROM directly
        romStartAddress = pRomStartAddress || 0;
        bankAddressOffset = romStartAddress;
        var numBanks = (bytes.length - romStartAddress) / BANK_SIZE;
        topBankSwitchAddress = baseBankSwitchAddress + numBanks - 1;
    }

    this.connectBus = function(pBus) {
        bus = pBus;
    };

    this.connectSaveStateSocket = function(socket) {
        saveStateSocket = socket;
    };

    this.read = function(address) {
        var val;
        var maskedAddress = maskAddress(address);

        // Check for SuperChip Extra RAM reads
        if (maskedAddress >= 256 && maskedAddress < (256 * 2))
            val = extraRAM[maskedAddress - 256];
        else
            val = bytes[bankAddressOffset + maskedAddress];

        // Normal behavior if not the Flash Operation Hotspot address
        if (maskedAddress !== FLASH_OP_HOTSPOT) return val;

        // Should trigger new operation?
        if (harmonyFlashOpInProgress === 0) {
            var op = extraRAM[FLASH_OP_CONTROL];
            if (op === 1 || op === 2) {
                performFlashOperation(op);
                return val | 0x40;	    // In progress, set bit 6
            }
        }

        // Report operation completion
        if (harmonyFlashOpInProgress !== 0) detectFlashOperationCompletion();
        else return val & 0xbf;	        // Not busy, clear bit 6

        if (harmonyFlashOpInProgress !== 0) return val | 0x40;	    // Still in progress, set bit 6
        else return val & 0xbf;		        						// Finished, clear bit 6

    };

    this.write = function(address, val) {
        var maskedAddress = maskAddress(address);
        // Check for Extra RAM writes
        if (maskedAddress < 256) extraRAM[maskedAddress] = val;
    };

    var maskAddress = function(address) {
        var maskedAddress = address & ADDRESS_MASK;
        // Check and perform bank-switch as necessary
        if (maskedAddress >= baseBankSwitchAddress && maskedAddress <= topBankSwitchAddress)
            bankAddressOffset = romStartAddress + BANK_SIZE * (maskedAddress - baseBankSwitchAddress);
        return maskedAddress;
    };

    var performFlashOperation = function(op) {
        harmonyFlashOpInProgress = op;
        harmonyFlashOpStartTime = Date.now();
        // 1 = read, 2 = write
        if (op === 1) readMemoryFromFlash();
        else if (op === 2) saveMemoryToFlash();
    };

    var readMemoryFromFlash = function() {
        bus.getTia().getVideoOutput().showOSD("Reading from Cartridge Flash Memory...", true);
        if (saveStateSocket) {
            var data = saveStateSocket.getMedia().loadResourceFromFile(flashMemoryResourceName());
            if (data) harmonyFlashMemory = jt.Util.byteStringToUInt8Array(atob(data));
        }
        extraRAM = harmonyFlashMemory.slice(0);
    };

    var saveMemoryToFlash = function() {
        bus.getTia().getVideoOutput().showOSD("Writing to Cartridge Flash Memory...", true);
        harmonyFlashMemory = extraRAM.slice(0);
        if (saveStateSocket)
            saveStateSocket.getMedia().saveResourceToFile(flashMemoryResourceName(), btoa(jt.Util.uInt8ArrayToByteString(harmonyFlashMemory)));
    };

    var detectFlashOperationCompletion = function() {
        if (Date.now() - harmonyFlashOpStartTime > 1100) {		// 1.1 seconds
            harmonyFlashOpStartTime = Date.now();
            harmonyFlashOpInProgress = 0;
            extraRAM[FLASH_OP_CONTROL] = 0;			// Set return code for Successful operation
            bus.getTia().getVideoOutput().showOSD("Done.", true);
            // Signal a external state modification
            // Flash memory may have been loaded from file and changed
            // Also the waiting timer is a source of indeterminism!
            if (saveStateSocket) saveStateSocket.externalStateChange();
        }
    };

    var flashMemoryResourceName = function() {
        return "hfm" + self.rom.info.h;
    };


    // Savestate  -------------------------------------------

    this.saveState = function() {
        return {
            f: this.format.name,
            r: this.rom.saveState(),
            b: btoa(jt.Util.uInt8ArrayToByteString(bytes)),
            rs: romStartAddress,
            bo: bankAddressOffset,
            tb: topBankSwitchAddress,
            e: btoa(jt.Util.uInt8ArrayToByteString(extraRAM)),
            ho: harmonyFlashOpInProgress,
            ht: harmonyFlashOpStartTime
        };
    };

    this.loadState = function(state) {
        this.format = jt.CartridgeFormats[state.f];
        this.rom = jt.ROM.loadState(state.r);
        bytes = jt.Util.byteStringToUInt8Array(atob(state.b));
        romStartAddress = state.rs || 0;
        bankAddressOffset = state.bo;
        topBankSwitchAddress =  state.tb;
        extraRAM = jt.Util.byteStringToUInt8Array(atob(state.e));
        harmonyFlashOpInProgress = state.ho || 0;
        harmonyFlashOpStartTime = Date.now();   // Always as if operation just started
    };


    var bus;
    var saveStateSocket;

    var bytes;
    var romStartAddress = 0;
    var bankAddressOffset = 0;
    var baseBankSwitchAddress = 0x0ff5;
    var topBankSwitchAddress;
    var extraRAM = jt.Util.arrayFill(new Array(256), 0);

    var harmonyFlashOpStartTime = Date.now();
    var harmonyFlashOpInProgress = 0;					// 0 = none, 1 = read, 2 = write
    var harmonyFlashMemory = jt.Util.arrayFill(new Array(256), 0);

    var ADDRESS_MASK = 0x0fff;
    var BANK_SIZE = 4096;
    var FLASH_OP_HOTSPOT = 0x0ff4;
    var FLASH_OP_CONTROL = 0x00ff;


    if (rom) init(this);

};

jt.Cartridge24K_28K_32K_FA2.prototype = jt.Cartridge.base;

jt.Cartridge24K_28K_32K_FA2.createFromSaveState = function(state) {
    var cart = new jt.Cartridge24K_28K_32K_FA2();
    cart.loadState(state);
    return cart;
};

// Copyright 2015 by Paulo Augusto Peccin. See license.txt distributed with this file.

// Implements generic bank switching using unmasked address access via bus monitoring (outside Cart area)

jt.CartridgeBankedByBusMonitoring = function(rom, format) {

    this.needsBusMonitoring = function() {
        return true;
    };

    this.monitorBusBeforeRead = function(address, data) {
        this.performBankSwitchOnMonitoredAccess(address)
    };

    this.monitorBusBeforeWrite = function(address, data) {
        this.performBankSwitchOnMonitoredAccess(address)
    };

    this.performBankSwitchOnMonitoredAccess = function(address) {
    };

};

jt.CartridgeBankedByBusMonitoring.prototype = jt.Cartridge.base;

jt.CartridgeBankedByBusMonitoring.base = new jt.CartridgeBankedByBusMonitoring();



// Copyright 2015 by Paulo Augusto Peccin. See license.txt distributed with this file.

// Implements the 8K-512K "Enhanced 3F" Tigervision format

jt.Cartridge8K_512K_3F = function(rom, format) {

    function init(self) {
        self.rom = rom;
        self.format = format;
        bytes = rom.content;        // uses the content of the ROM directly
        selectableSliceMaxBank = (bytes.length - BANK_SIZE) / BANK_SIZE - 1;
        fixedSliceAddressOffset = bytes.length - BANK_SIZE * 2;
    }

    this.read = function(address) {
        var maskedAddress = address & ADDRESS_MASK;
        if (maskedAddress >= FIXED_SLICE_START_ADDRESS)			// Fixed slice
            return bytes[fixedSliceAddressOffset + maskedAddress];
        else
            return bytes[bankAddressOffset + maskedAddress];	// Selectable slice
    };

     // Bank switching is done only on monitored writes
    this.monitorBusBeforeWrite = function(address, data) {
        // Perform bank switching as needed
        if (address <= 0x003f) {
            var bank = data & 0xff;		// unsigned
            if (bank <= selectableSliceMaxBank)
                bankAddressOffset = bank * BANK_SIZE;
        }
    };


    // Savestate  -------------------------------------------

    this.saveState = function() {
        return {
            f: this.format.name,
            r: this.rom.saveState(),
            b: btoa(jt.Util.uInt8ArrayToByteString(bytes)),
            bo: bankAddressOffset,
            sm: selectableSliceMaxBank,
            fo: fixedSliceAddressOffset
        };
    };

    this.loadState = function(state) {
        this.format = jt.CartridgeFormats[state.f];
        this.rom = jt.ROM.loadState(state.r);
        bytes = jt.Util.byteStringToUInt8Array(atob(state.b));
        bankAddressOffset = state.bo;
        selectableSliceMaxBank = state.sm;
        fixedSliceAddressOffset = state.fo;
    };


    var bytes;

    var bankAddressOffset = 0;
    var selectableSliceMaxBank;
    var fixedSliceAddressOffset;		    // This slice is fixed at the last bank

    var ADDRESS_MASK = 0x0fff;
    var BANK_SIZE = 2048;
    var FIXED_SLICE_START_ADDRESS = 2048;


    if (rom) init(this);

};

jt.Cartridge8K_512K_3F.prototype = jt.CartridgeBankedByBusMonitoring.base;

jt.Cartridge8K_512K_3F.createFromSaveState = function(state) {
    var cart = new jt.Cartridge8K_512K_3F();
    cart.loadState(state);
    return cart;
};

// Copyright 2015 by Paulo Augusto Peccin. See license.txt distributed with this file.

// Implements the 8K-512K "3E" Tigervision (+RAM) format

jt.Cartridge8K_512K_3E = function(rom, format) {

    function init(self) {
        self.rom = rom;
        self.format = format;
        bytes = rom.content;        // uses the content of the ROM directly
        selectableSliceMaxBank = (bytes.length - BANK_SIZE) / BANK_SIZE - 1;
        fixedSliceAddressOffset = bytes.length - BANK_SIZE * 2;
    }

    this.read = function(address) {
        var maskedAddress = maskAddress(address);
        if (maskedAddress >= FIXED_SLICE_START_ADDRESS)						// ROM Fixed Slice
            return bytes[fixedSliceAddressOffset + maskedAddress];
        else
        if (extraRAMBankAddressOffset >= 0 && maskedAddress < 0x0400)		// RAM
            return extraRAM[extraRAMBankAddressOffset + maskedAddress] || 0;
        else
            return bytes[bankAddressOffset + maskedAddress];				// ROM Selectable Slice
    };

    this.write = function(address, val) {
        // Check if Extra RAM bank is selected
        if (extraRAMBankAddressOffset < 0) return;

        var maskedAddress = maskAddress(address);
        // Check for Extra RAM writes
        if (maskedAddress >= 0x0400 && maskedAddress <= 0x07ff)
            extraRAM[extraRAMBankAddressOffset + maskedAddress - 0x0400] = val;
    };

    var maskAddress = function(address) {
        return address & ADDRESS_MASK;
    };

    // Bank switching is done only on monitored writes
    this.monitorBusBeforeWrite = function(address, data) {
        // Perform ROM bank switching as needed
        if (address === 0x003f) {
            var bank = data & 0xff;		// unsigned
            if (bank <= selectableSliceMaxBank) {
                bankAddressOffset = bank * BANK_SIZE;
                extraRAMBankAddressOffset = -1;
            }
            return;
        }
        // Perform RAM bank switching as needed
        if (address === 0x003e) {
            var ramBank = data & 0xff;	// unsigned
            extraRAMBankAddressOffset = ramBank * EXTRA_RAM_BANK_SIZE;
        }
    };


    // Savestate  -------------------------------------------

    this.saveState = function() {
        return {
            f: this.format.name,
            r: this.rom.saveState(),
            b: btoa(jt.Util.uInt8ArrayToByteString(bytes)),
            bo: bankAddressOffset,
            sm: selectableSliceMaxBank,
            fo: fixedSliceAddressOffset,
            ro: extraRAMBankAddressOffset,
            ra: btoa(jt.Util.uInt8ArrayToByteString(extraRAM))
        };
    };

    this.loadState = function(state) {
        this.format = jt.CartridgeFormats[state.f];
        this.rom = jt.ROM.loadState(state.r);
        bytes = jt.Util.byteStringToUInt8Array(atob(state.b));
        bankAddressOffset = state.bo;
        selectableSliceMaxBank = state.sm;
        fixedSliceAddressOffset = state.fo;
        extraRAMBankAddressOffset = state.ro;
        extraRAM = jt.Util.byteStringToUInt8Array(atob(state.ra));
    };


    var bytes;

    var EXTRA_RAM_BANK_SIZE = 1024;

    var bankAddressOffset = 0;
    var selectableSliceMaxBank;
    var fixedSliceAddressOffset;		                                // This slice is fixed at the last bank
    var extraRAMBankAddressOffset = -1;		                            // No Extra RAM bank selected
    var extraRAM = jt.Util.arrayFill(new Array(EXTRA_RAM_BANK_SIZE), 0);   // Pre allocate minimum RAM bank for performance


    var ADDRESS_MASK = 0x0fff;
    var BANK_SIZE = 2048;
    var FIXED_SLICE_START_ADDRESS = 2048;


    if (rom) init(this);

};

jt.Cartridge8K_512K_3E.prototype = jt.CartridgeBankedByBusMonitoring.base;

jt.Cartridge8K_512K_3E.createFromSaveState = function(state) {
    var cart = new jt.Cartridge8K_512K_3E();
    cart.loadState(state);
    return cart;
};

// Copyright 2015 by Paulo Augusto Peccin. See license.txt distributed with this file.

// Implements the 8K-256K "SB" Superbanking format

jt.Cartridge8K_256K_SB = function(rom, format) {

    function init(self) {
        self.rom = rom;
        self.format = format;
        bytes = rom.content;        // uses the content of the ROM directly
        maxBank = bytes.length / BANK_SIZE - 1;
    }

    this.read = function(address) {
        // Always add the correct offset to access bank selected
        return bytes[bankAddressOffset + (address & ADDRESS_MASK)];
    };

    this.performBankSwitchOnMonitoredAccess = function(address) {
        if ((address & 0x1800) !== 0x0800) return;
        var bank = address & 0x007f;
        if (bank > maxBank) return;
        bankAddressOffset = bank * BANK_SIZE;
    };


    // Savestate  -------------------------------------------

    this.saveState = function() {
        return {
            f: this.format.name,
            r: this.rom.saveState(),
            b: btoa(jt.Util.uInt8ArrayToByteString(bytes)),
            bo: bankAddressOffset,
            m: maxBank
        };
    };

    this.loadState = function(state) {
        this.format = jt.CartridgeFormats[state.f];
        this.rom = jt.ROM.loadState(state.r);
        bytes = jt.Util.byteStringToUInt8Array(atob(state.b));
        bankAddressOffset = state.bo;
        maxBank = state.m;
    };


    var bytes;
    var bankAddressOffset = 0;
    var maxBank;

    var ADDRESS_MASK = 0x0fff;
    var BANK_SIZE = 4096;


    if (rom) init(this);

};

jt.Cartridge8K_256K_SB.prototype = jt.CartridgeBankedByBusMonitoring.base;

jt.Cartridge8K_256K_SB.createFromSaveState = function(state) {
    var cart = new jt.Cartridge8K_256K_SB();
    cart.loadState(state);
    return cart;
};




// Copyright 2015 by Paulo Augusto Peccin. See license.txt distributed with this file.

// Implements the n * 8448 byte "AR" Arcadia/Starpath/Supercharger tape format

jt.Cartridge8K_64K_AR = function(rom, format) {

    function init(self) {
        self.rom = rom;
        self.format = format;
        // Cannot use the contents of the ROM directly, as cartridge is all RAM and can be modified
        // Also, ROM content represents the entire tape and can have multiple parts
        bytes = jt.Util.arrayFill(new Array(4 * BANK_SIZE));
        loadBIOS();
    }

    this.powerOn = function() {
        // Always start with bank configuration 000 (bank2, bank3 = BIOS ROM), writes disabled and BIOS ROM powered on
        setControlRegister(0x00);
        // Rewind Tape
        tapeOffset = 0;
        // BIOS will ask to load Part Number 0 at System Reset
    };

    this.connectBus = function(pBus) {
        bus = pBus;
    };

    this.read = function(address) {
        // maskedAddress already set on bus monitoring method
        // bank0
        if (maskedAddress < BANK_SIZE)
            return bytes[bank0AddressOffset + maskedAddress];
        else
        // bank1
            return bytes[bank1AddressOffset + maskedAddress - BANK_SIZE];
    };

    this.write = function(address, b) {
        // No direct writes are possible
        // But check for BIOS Load Part Hotspot range
        if (bank1AddressOffset === BIOS_BANK_OFFSET &&
            maskedAddress >= BIOS_INT_EMUL_LOAD_HOTSPOT && maskedAddress < BIOS_INT_EMUL_LOAD_HOTSPOT + 256) {
            loadPart(maskedAddress - BIOS_INT_EMUL_LOAD_HOTSPOT);
        }
    };

    this.performBankSwitchOnMonitoredAccess = function(address) {
        maskedAddress = address & ADDRESS_MASK;
        address &= 0x1fff;

        // Set ControlRegister if the hotspot was triggered
        if (address == 0x1ff8) {
            setControlRegister(valueToWrite);
            return;
        }

        // Check for writes pending and watch for address transitions
        if (addressChangeCountdown > 0) {
            if (address !== lastAddress) {
                lastAddress = address;
                if (--addressChangeCountdown === 0) {
                    // 5th address transition detected, perform write
                    if ((address & CHIP_MASK) === CHIP_SELECT) {		// Do not write outside Cartridge range
                        // bank0
                        if (maskedAddress < BANK_SIZE)
                            bytes[bank0AddressOffset + maskedAddress] = valueToWrite;
                        // bank1
                        else if (bank1AddressOffset < BIOS_BANK_OFFSET)	// Do not write to BIOS ROM
                            bytes[bank1AddressOffset + maskedAddress - BANK_SIZE] = valueToWrite;
                    }
                }
            }
            return;
        }

        // Check and store desired value to write
        if (((address & CHIP_MASK) === CHIP_SELECT) && maskedAddress <= 0x00ff) {
            valueToWrite = maskedAddress;
            if (writeEnabled) {
                lastAddress = address;		// Will be watched for the 5th address change
                addressChangeCountdown = 5;
            }
        }
    };

    var setControlRegister = function(controlRegister) {
        var banksConfig = (controlRegister >> 2) & 0x07;
        switch (banksConfig) {
            case 0: bank0AddressOffset = 2 * BANK_SIZE; bank1AddressOffset = BIOS_BANK_OFFSET; break;
            case 1: bank0AddressOffset = 0 * BANK_SIZE; bank1AddressOffset = BIOS_BANK_OFFSET; break;
            case 2: bank0AddressOffset = 2 * BANK_SIZE; bank1AddressOffset = 0 * BANK_SIZE; break;	// as used in Commie Mutants and many others
            case 3: bank0AddressOffset = 0 * BANK_SIZE; bank1AddressOffset = 2 * BANK_SIZE; break;	// as used in Suicide Mission
            case 4: bank0AddressOffset = 2 * BANK_SIZE; bank1AddressOffset = BIOS_BANK_OFFSET; break;
            case 5: bank0AddressOffset = 1 * BANK_SIZE; bank1AddressOffset = BIOS_BANK_OFFSET; break;
            case 6: bank0AddressOffset = 2 * BANK_SIZE; bank1AddressOffset = 1 * BANK_SIZE; break;	// as used in Killer Satellites
            case 7: bank0AddressOffset = 1 * BANK_SIZE; bank1AddressOffset = 2 * BANK_SIZE; break;	// as we use for 2k/4k ROM cloning		}
            default: throw new Error("Invalid bank configuration");
        }
        addressChangeCountdown = 0;	// Setting ControlRegister cancels any pending write
        writeEnabled = (controlRegister & 0x02) !== 0;
        biosRomPower = (controlRegister & 0x01) === 0;
        // System.out.println("Banks: " + banksConfig + ", Writes: " + (writeEnabled ? "ON" : "OFF"));
    };

    var loadPart = function(part) {
        var tapeRewound = false;
        do {
            // Check for tape end
            if (tapeOffset > rom.content.length - 1) {
                // Check if tape was already rewound once to avoid infinite tries
                if (tapeRewound) {
                    if (part === 0) bus.getTia().getVideoOutput().showOSD("Could not load Tape from Start. Not a Start Tape ROM!", true);
                    else bus.getTia().getVideoOutput().showOSD("Could not find next Part to load in Tape!", true);
                    signalPartLoadedOK(false);		// BIOS will handle this
                    return;
                }
                // Rewind tape
                tapeOffset = 0;
                tapeRewound = true;
            }
            // Check if the next part is the one we are looking for
            if (jt.Cartridge8K_64K_AR.peekPartNoOnTape(rom.content, tapeOffset) === part) {
                if (part === 0) bus.getTia().getVideoOutput().showOSD("Loaded Tape from Start", true);
                else bus.getTia().getVideoOutput().showOSD("Loaded next Part from Tape", true);
                loadNextPart();
                return;
            } else {
                // Advance tape
                tapeOffset += PART_SIZE;
            }
        } while(true);
    };

    var loadNextPart = function() {
        loadHeaderData();
        loadPagesIntoBanks();
        patchPartDataIntoBIOS();
    };

    var loadHeaderData = function() {
        // Store header info
        jt.Util.arrayCopy(rom.content, tapeOffset + 4 * BANK_SIZE, header, 0, header.length);
        romStartupAddress = (header[1] << 8) | (header[0] & 0xff);
        romControlRegister = header[2];
        romPageCount = header[3];
        romChecksum = header[4];
        romMultiLoadIndex = header[5];
        romProgressBarSpeed = (header[7] << 8) | (header[6] & 0xff);
        romPageOffsets = jt.Util.arrayFill(new Array(romPageCount), 0);
        jt.Util.arrayCopy(header, 16, romPageOffsets, 0, romPageCount);
    };

    var loadPagesIntoBanks = function() {
        // Clear last page of first bank, as per original BIOS
        jt.Util.arrayFillSegment(bytes, 7 * PAGE_SIZE, 8 * PAGE_SIZE - 1, 0);

        // Load pages
        var romOffset = tapeOffset;
        for (var i = 0, len = romPageOffsets.length; i < len; i++) {
            var pageInfo = romPageOffsets[i];
            var bankOffset = (pageInfo & 0x03) * BANK_SIZE;
            var pageOffset = (pageInfo >> 2) * PAGE_SIZE;
            // Only write if not in BIOS area
            if (bankOffset + pageOffset + 255 < BIOS_BANK_OFFSET)
                jt.Util.arrayCopy(rom.content, romOffset, bytes, bankOffset + pageOffset, PAGE_SIZE);
            romOffset += PAGE_SIZE;
        }
        // Advance tape
        tapeOffset += PART_SIZE;
    };

    var patchPartDataIntoBIOS = function() {
        // Patch BIOS interface area with correct values from stored Header data
        bytes[BIOS_BANK_OFFSET + BIOS_INT_CONTROL_REG_ADDR - 0xf800] = romControlRegister;
        bytes[BIOS_BANK_OFFSET + BIOS_INT_PART_NO_ADDR - 0xf800] = romMultiLoadIndex;
        // TODO This random is a source of indeterminism. Potential problem in multiplayer sync
        bytes[BIOS_BANK_OFFSET + BIOS_INT_RANDOM_SEED_ADDR - 0xf800] = ((Math.random() * 256) | 0);
        bytes[BIOS_BANK_OFFSET + BIOS_INT_START_ADDR - 0xf800] = romStartupAddress & 0xff;
        bytes[BIOS_BANK_OFFSET + BIOS_INT_START_ADDR + 1 - 0xf800] = (romStartupAddress >> 8) & 0xff;
        signalPartLoadedOK(true);
    };

    var signalPartLoadedOK = function(ok) {
        bytes[BIOS_BANK_OFFSET + BIOS_INT_PART_LOADED_OK - 0xf800] = (ok ? 1 : 0);
    };

    var loadBIOS = function() {
        var bios = JSZip.compressions.DEFLATE.uncompress(jt.Util.byteStringToUInt8Array(atob(STARPATH_BIOS)));
        jt.Util.arrayCopy(bios, 0, bytes, BIOS_BANK_OFFSET, BANK_SIZE);
    };


    var bus;

    var bytes;
    var maskedAddress;

    var HEADER_SIZE = 256;

    var bank0AddressOffset = 0;
    var bank1AddressOffset = 0;
    var header = jt.Util.arrayFill(new Array(HEADER_SIZE), 0);
    var valueToWrite = 0;
    var writeEnabled = false;
    var lastAddress = -1;
    var addressChangeCountdown = 0;
    var biosRomPower = false;

    var romStartupAddress = 0;
    var romControlRegister = 0;
    var romPageCount = 0;
    var romChecksum = 0;
    var romMultiLoadIndex = 0;
    var romProgressBarSpeed = 0;
    var romPageOffsets;

    var tapeOffset = 0;


    var BIOS_INT_PART_NO_ADDR 		= 0xfb00;
    var BIOS_INT_CONTROL_REG_ADDR	= 0xfb01;
    var BIOS_INT_START_ADDR 		= 0xfb02;
    var BIOS_INT_RANDOM_SEED_ADDR	= 0xfb04;
    var BIOS_INT_PART_LOADED_OK	= 0xfb05;
    var BIOS_INT_EMUL_LOAD_HOTSPOT	= 0x0c00;

    var PAGE_SIZE = 256;
    var BANK_SIZE = 8 * PAGE_SIZE;
    var BIOS_BANK_OFFSET = 3 * BANK_SIZE;
    var PART_SIZE = 4 * BANK_SIZE + HEADER_SIZE;	// 4 * 2048 banks + header

    // Bios is 2048 bytes. This is compressed (zip) and stored in base64
    var STARPATH_BIOS = "7dSxCsIwEAbgv6niGkeddPVZ8kCOXc43yCIokkGIUN+gLxAoZHTxHRxjYq2xk7vSIPS75bb7uYNTuOJWu/bod3iU42BzUTiBe9sTzSj" +
        "ToBnNBVxfQz/nQ+2NhA2a05KYmhhjmxhoQZymxGil8gpeesOdyioW5DN25yxsiri3chQOUO1WeCSI/hPx9AJ/m/576KROMUhlfdE4dQ+AfJoPNBikgOZdLw==";

    var ADDRESS_MASK = 0x0fff;
    var CHIP_MASK = 0x1000;
    var CHIP_SELECT = 0x1000;


    // Savestate  -------------------------------------------

    this.saveState = function() {
        return {
            f: this.format.name,
            r: this.rom.saveState(),
            b: btoa(jt.Util.uInt8ArrayToByteString(bytes))
        };
    };

    this.loadState = function(state) {
        this.format = jt.CartridgeFormats[state.f];
        this.rom = jt.ROM.loadState(state.r);
        bytes = jt.Util.byteStringToUInt8Array(atob(state.b));
    };


    if (rom) init(this);

};

jt.Cartridge8K_64K_AR.prototype = jt.CartridgeBankedByBusMonitoring.base;

jt.Cartridge8K_64K_AR.createFromSaveState = function(state) {
    var cart = new jt.Cartridge8K_64K_AR();
    cart.loadState(state);
    return cart;
};

jt.Cartridge8K_64K_AR.HEADER_SIZE = 256;
jt.Cartridge8K_64K_AR.PAGE_SIZE = 256;
jt.Cartridge8K_64K_AR.BANK_SIZE = 8 * jt.Cartridge8K_64K_AR.PAGE_SIZE;
jt.Cartridge8K_64K_AR.PART_SIZE = 4 * jt.Cartridge8K_64K_AR.BANK_SIZE + jt.Cartridge8K_64K_AR.HEADER_SIZE;	// 4 * 2048 banks + header

jt.Cartridge8K_64K_AR.peekPartNoOnTape = function(tapeContent, tapeOffset) {
    return tapeContent[tapeOffset + 4*jt.Cartridge8K_64K_AR.BANK_SIZE + 5];
};

jt.Cartridge8K_64K_AR.checkTape = function(rom) {
    if (jt.Cartridge8K_64K_AR.peekPartNoOnTape(rom.content, 0) != 0) {
        var ex = new Error("Wrong Supercharger Tape Part ROM!\nPlease load a Full Tape ROM file.");
        ex.formatDenial = true;
        throw ex;
    }
};



// Copyright 2015 by Paulo Augusto Peccin. See license.txt distributed with this file.

// Implements the 64K "X07" AtariAge format

jt.Cartridge64K_X07 = function(rom, format) {

    function init(self) {
        self.rom = rom;
        self.format = format;
        bytes = rom.content;        // uses the content of the ROM directly
    }

    this.read = function(address) {
        // Always add the correct offset to access bank selected
        return bytes[bankAddressOffset + (address & ADDRESS_MASK)];
    };

    this.performBankSwitchOnMonitoredAccess = function(address) {
        if ((address & 0x180f) === 0x080d)		                                            // Method 1
            bankAddressOffset = ((address & 0x00f0) >> 4) * BANK_SIZE;	                    // Pick bank from bits 7-4
        else if (bankAddressOffset >= BANK_14_ADDRESS && (address & 0x1880) === 0x0000) 	// Method 2, only if at bank 14 or 15
            bankAddressOffset = ((address & 0x0040) === 0 ? 14 : 15) * BANK_SIZE;	        // Pick bank 14 or 15 from bit 6
    };


    // Savestate  -------------------------------------------

    this.saveState = function() {
        return {
            f: this.format.name,
            r: this.rom.saveState(),
            b: btoa(jt.Util.uInt8ArrayToByteString(bytes)),
            bo: bankAddressOffset
        };
    };

    this.loadState = function(state) {
        this.format = jt.CartridgeFormats[state.f];
        this.rom = jt.ROM.loadState(state.r);
        bytes = jt.Util.byteStringToUInt8Array(atob(state.b));
        bankAddressOffset = state.bo;
    };


    var bytes;
    var bankAddressOffset = 0;

    var ADDRESS_MASK = 0x0fff;
    var BANK_SIZE = 4096;
    var BANK_14_ADDRESS = 14 * BANK_SIZE;


    if (rom) init(this);

};

jt.Cartridge64K_X07.prototype = jt.CartridgeBankedByBusMonitoring.base;

jt.Cartridge64K_X07.createFromSaveState = function(state) {
    var cart = new jt.Cartridge64K_X07();
    cart.loadState(state);
    return cart;
};




// Copyright 2015 by Paulo Augusto Peccin. See license.txt distributed with this file.

// Implements the 8K "0840" Econobanking format

jt.Cartridge8K_0840 = function(rom, format) {

    function init(self) {
        self.rom = rom;
        self.format = format;
        bytes = rom.content;        // uses the content of the ROM directly
    }

    this.read = function(address) {
        // Always add the correct offset to access bank selected
        return bytes[bankAddressOffset + (address & ADDRESS_MASK)];
    };

    this.performBankSwitchOnMonitoredAccess = function(address) {
        var addrBank = address & 0x1840;
        if (addrBank === 0x0800) {
            if (bankAddressOffset !== 0) bankAddressOffset = 0;
        } else if (addrBank === 0x0840) {
            if (bankAddressOffset !== BANK_SIZE) bankAddressOffset = BANK_SIZE;
        }
    };


    // Savestate  -------------------------------------------

    this.saveState = function() {
        return {
            f: this.format.name,
            r: this.rom.saveState(),
            b: btoa(jt.Util.uInt8ArrayToByteString(bytes)),
            bo: bankAddressOffset
        };
    };

    this.loadState = function(state) {
        this.format = jt.CartridgeFormats[state.f];
        this.rom = jt.ROM.loadState(state.r);
        bytes = jt.Util.byteStringToUInt8Array(atob(state.b));
        bankAddressOffset = state.bo;
    };


    var bytes;
    var bankAddressOffset = 0;

    var ADDRESS_MASK = 0x0fff;
    var BANK_SIZE = 4096;


    if (rom) init(this);

};

jt.Cartridge8K_0840.prototype = jt.CartridgeBankedByBusMonitoring.base;

jt.Cartridge8K_0840.createFromSaveState = function(state) {
    var cart = new jt.Cartridge8K_0840();
    cart.loadState(state);
    return cart;
};




// Copyright 2015 by Paulo Augusto Peccin. See license.txt distributed with this file.

// Implements the 8K "UA" UA Limited format

jt.Cartridge8K_UA = function(rom, format) {

    function init(self) {
        self.rom = rom;
        self.format = format;
        bytes = rom.content;        // uses the content of the ROM directly
    }

    this.read = function(address) {
        // Always add the correct offset to access bank selected
        return bytes[bankAddressOffset + (address & ADDRESS_MASK)];
    };

    this.performBankSwitchOnMonitoredAccess = function(address) {
        if (address === 0x0220) {
            if (bankAddressOffset !== 0) bankAddressOffset = 0;
        } else if (address === 0x0240) {
            if (bankAddressOffset !== BANK_SIZE) bankAddressOffset = BANK_SIZE;
        }
    };


    // Savestate  -------------------------------------------

    this.saveState = function() {
        return {
            f: this.format.name,
            r: this.rom.saveState(),
            b: btoa(jt.Util.uInt8ArrayToByteString(bytes)),
            bo: bankAddressOffset
        };
    };

    this.loadState = function(state) {
        this.format = jt.CartridgeFormats[state.f];
        this.rom = jt.ROM.loadState(state.r);
        bytes = jt.Util.byteStringToUInt8Array(atob(state.b));
        bankAddressOffset = state.bo;
    };


    var bytes;
    var bankAddressOffset = 0;

    var ADDRESS_MASK = 0x0fff;
    var BANK_SIZE = 4096;


    if (rom) init(this);

};

jt.Cartridge8K_UA.prototype = jt.CartridgeBankedByBusMonitoring.base;

jt.Cartridge8K_UA.createFromSaveState = function(state) {
    var cart = new jt.Cartridge8K_UA();
    cart.loadState(state);
    return cart;
};




// Copyright 2015 by Paulo Augusto Peccin. See license.txt distributed with this file.

    jt.CartridgeFormats = {

    "4K": {
        name: "4K",
        desc: "4K Atari",
        priority: 101,
        tryFormat: function (rom) {
            if (rom.content.length >= 8 && rom.content.length <= 4096 && 4096 % rom.content.length === 0) return this;
        },
        createCartridgeFromRom: function (rom) {
            return new jt.Cartridge4K(rom, this);
        },
        createCartridgeFromSaveState: function (state) {
            return jt.Cartridge4K.createFromSaveState(state);
        }
    },

    "CV": {
        name: "CV",
        desc: "2K Commavid +RAM",
        priority: 102,
        tryFormat: function (rom) {
            if (rom.content.length === 2048 || rom.content.length === 4096) return this;	// Also accepts 4K ROMs
        },
        createCartridgeFromRom: function (rom) {
            return new jt.Cartridge2K_CV(rom, this);
        },
        createCartridgeFromSaveState: function (state) {
            return jt.Cartridge2K_CV.createFromSaveState(state);
        }
    },

    "E0": {
        name: "E0",
        desc: "8K Parker Bros.",
        priority: 102,
        tryFormat: function (rom) {
            if (rom.content.length === 8192) return this;
        },
        createCartridgeFromRom: function (rom) {
            return new jt.Cartridge8K_E0(rom, this);
        },
        createCartridgeFromSaveState: function (state) {
            return jt.Cartridge8K_E0.createFromSaveState(state);
        }
    },

    "F0": {
        name: "F0",
        desc: "64K Dynacom Megaboy",
        priority: 101,
        tryFormat: function (rom) {
            if (rom.content.length === 65536) return this;
        },
        createCartridgeFromRom: function (rom) {
            return new jt.Cartridge64K_F0(rom, this);
        },
        createCartridgeFromSaveState: function (state) {
            return jt.Cartridge64K_F0.createFromSaveState(state);
        }
    },

    "FE": {
        name: "FE",
        desc: "8K Robotank/Decathlon",
        priority: 103,
        tryFormat: function (rom) {
            if (rom.content.length === 8192) return this;
        },
        createCartridgeFromRom: function (rom) {
            return new jt.Cartridge8K_FE(rom, this);
        },
        createCartridgeFromSaveState: function (state) {
            return jt.Cartridge8K_FE.createFromSaveState(state);
        }
    },

    "E7": {
        name: "E7",
        desc: "16K M-Network",
        priority: 102,
        tryFormat: function (rom) {
            if (rom.content.length === 16384) return this;
        },
        createCartridgeFromRom: function (rom) {
            return new jt.Cartridge16K_E7(rom, this);
        },
        createCartridgeFromSaveState: function (state) {
            return jt.Cartridge16K_E7.createFromSaveState(state);
        }
    },

    "F8": {
        name: "F8",
        desc: "8K Atari (+RAM)",
        priority: 101,
        tryFormat: function(rom) {
            if (rom.content.length === 8192) return this;
        },
        createCartridgeFromRom: function(rom) {
            return new jt.CartridgeBankedByMaskedRange(rom, this, 0x0ff8, null, 128);
        },
        createCartridgeFromSaveState: function(state) {
            return jt.CartridgeBankedByMaskedRange.createFromSaveState(state);
        }
    },

    "F6": {
        name: "F6",
        desc: "16K Atari (+RAM)",
        priority: 101,
        tryFormat: function(rom) {
            if (rom.content.length === 16384) return this;
        },
        createCartridgeFromRom: function(rom) {
            return new jt.CartridgeBankedByMaskedRange(rom, this, 0x0ff6, null, 128);
        },
        createCartridgeFromSaveState: function(state) {
            return jt.CartridgeBankedByMaskedRange.createFromSaveState(state);
        }
    },

    "F4": {
        name: "F4",
        desc: "32K Atari (+RAM)",
        priority: 101,
        tryFormat: function(rom) {
            if (rom.content.length === 32768) return this;
        },
        createCartridgeFromRom: function(rom) {
            return new jt.CartridgeBankedByMaskedRange(rom, this, 0x0ff4, null, 128);
        },
        createCartridgeFromSaveState: function(state) {
            return jt.CartridgeBankedByMaskedRange.createFromSaveState(state);
        }
    },

    "FA2cu": {
        name: "FA2cu",
        desc: "32K CBS RAM Plus CU Image",
        priority: 103,
        tryFormat: function(rom) {
            if (rom.content.length === 32768) {
                // Check for the values $10adab1e, for "loadable", starting at position 32 (33rd byte)
                // This is a hint that the content is in CU format
                var foundHint = jt.Util.arraysEqual(rom.content.slice(32, 32 + 4), this.cuMagicWord);
                this.priority = 103 - (foundHint ? 30 : 0);
                return this;
            }
        },
        createCartridgeFromRom: function(rom) {
            // ROM is only 28K. The first 1024 bytes are custom ARM content. ROM begins after that
            return new jt.Cartridge24K_28K_32K_FA2(rom, this, 1024);
        },
        createCartridgeFromSaveState: function(state) {
            return jt.Cartridge24K_28K_32K_FA2.createFromSaveState(state);
        },
        cuMagicWord: [0x1e, 0xab, 0xad, 0x10]
    },

    "FA2": {
        name: "FA2",
        desc: "24K/28K/32K CBS RAM Plus",
        priority: 102,
        tryFormat: function(rom) {
            if (rom.content.length === 24576 || rom.content.length === 28672 || rom.content.length === 32768) return this;
        },
        createCartridgeFromRom: function(rom) {
            return new jt.Cartridge24K_28K_32K_FA2(rom, this);
        },
        createCartridgeFromSaveState: function(state) {
            return jt.Cartridge24K_28K_32K_FA2.createFromSaveState(state);
        }
    },

    "FA": {
        name: "FA",
        desc: "12K CBS RAM Plus",
        priority: 101,
        tryFormat: function(rom) {
            if (rom.content.length === 12288) return this;
        },
        createCartridgeFromRom: function(rom) {
            return new jt.CartridgeBankedByMaskedRange(rom, this, 0x0ff8, true, 256);
        },
        createCartridgeFromSaveState: function(state) {
            return jt.CartridgeBankedByMaskedRange.createFromSaveState(state);
        }
    },

    "EF": {
        name: "EF",
        desc: "8K-64K H. Runner (+RAM)",
        priority: 114,
        tryFormat: function(rom) {
            if (rom.content.length % 4096 === 0 && rom.content.length >= 8192 && rom.content.length <= 65536) return this;
        },
        createCartridgeFromRom: function(rom) {
            return new jt.CartridgeBankedByMaskedRange(rom, this, 0x0fe0, null, 128);
        },
        createCartridgeFromSaveState: function(state) {
            return jt.CartridgeBankedByMaskedRange.createFromSaveState(state);
        }
    },

    "DPCa": {
        name: "DPCa",
        desc: "10K DPC Pitfall 2 (Enhanced Audio)",
        priority: 101,
        tryFormat: function(rom) {
            if (rom.content.length >= (8192 + 2048) && rom.content.length <= (8192 + 2048 + 256)) return this;
        },
        createCartridgeFromRom: function(rom) {
            return new jt.Cartridge10K_DPCa(rom, this);
        },
        createCartridgeFromSaveState: function(state) {
            return jt.Cartridge10K_DPCa.createFromSaveState(state);
        }
    },

    "3F": {
        name: "3F",
        desc: "8K-512K Tigervision",
        priority: 112,
        tryFormat: function(rom) {
            if (rom.content.length % 2048 === 0 && rom.content.length <= 256 * 2048) return this;
        },
        createCartridgeFromRom: function(rom) {
            return new jt.Cartridge8K_512K_3F(rom, this);
        },
        createCartridgeFromSaveState: function(state) {
            return jt.Cartridge8K_512K_3F.createFromSaveState(state);
        }
    },

    "3E": {
        name: "3E",
        desc: "8K-512K Tigervision (+RAM)",
        priority: 111,
        tryFormat: function(rom) {
            if (rom.content.length % 2048 === 0 && rom.content.length <= 256 * 2048) return this;
        },
        createCartridgeFromRom: function(rom) {
            return new jt.Cartridge8K_512K_3E(rom, this);
        },
        createCartridgeFromSaveState: function(state) {
            return jt.Cartridge8K_512K_3E.createFromSaveState(state);
        }
    },

    "X07": {
        name: "X07",
        desc: "64K AtariAge",
        priority: 102,
        tryFormat: function(rom) {
            if (rom.content.length === 65536) return this;
        },
        createCartridgeFromRom: function(rom) {
            return new jt.Cartridge64K_X07(rom, this);
        },
        createCartridgeFromSaveState: function(state) {
            return jt.Cartridge64K_X07.createFromSaveState(state);
        }
    },

    "0840": {
        name: "0840",
        desc: "8K Econobanking",
        priority: 116,
        tryFormat: function(rom) {
            if (rom.content.length === 8192) return this;
        },
        createCartridgeFromRom: function(rom) {
            return new jt.Cartridge8K_0840(rom, this);
        },
        createCartridgeFromSaveState: function(state) {
            return jt.Cartridge8K_0840.createFromSaveState(state);
        }
    },

    "UA": {
        name: "UA",
        desc: "8K UA Limited",
        priority: 115,
        tryFormat: function(rom) {
            if (rom.content.length === 8192) return this;
        },
        createCartridgeFromRom: function(rom) {
            return new jt.Cartridge8K_UA(rom, this);
        },
        createCartridgeFromSaveState: function(state) {
            return jt.Cartridge8K_UA.createFromSaveState(state);
        }
    },

    "SB": {
        name: "SB",
        desc: "8K-256K Superbanking",
        priority: 113,
        tryFormat: function(rom) {
            if (rom.content.length % 4096 === 0 && rom.content.length >= 8192 && rom.content.length <= 64 * 4096) return this;
        },
        createCartridgeFromRom: function(rom) {
            return new jt.Cartridge8K_256K_SB(rom, this);
        },
        createCartridgeFromSaveState: function(state) {
            return jt.Cartridge8K_256K_SB.createFromSaveState(state);
        }
    },

    "AR": {
        name: "AR",
        desc: "8K-64K Arcadia/Starpath/Supercharger",
        priority: 101,
        tryFormat: function(rom) {
            // Any number of parts between 1 and 8
            if (rom.content.length % jt.Cartridge8K_64K_AR.PART_SIZE === 0 && rom.content.length / jt.Cartridge8K_64K_AR.PART_SIZE >= 1
                && rom.content.length / jt.Cartridge8K_64K_AR.PART_SIZE <= 8) {
                // Check if the content starts with Part 0
                jt.Cartridge8K_64K_AR.checkTape(rom);      // Will throw exception if not a Tape Start or Full Tape
                return this;
            }
        },
        createCartridgeFromRom: function(rom) {
            return new jt.Cartridge8K_64K_AR(rom, this);
        },
        createCartridgeFromSaveState: function(state) {
            return jt.Cartridge8K_64K_AR.createFromSaveState(state);
        }
    }

};

// Copyright 2015 by Paulo Augusto Peccin. See license.txt distributed with this file.

jt.CartridgeDatabase = function() {

    this.createCartridgeFromRom = function(rom) {
        // Try to build the Cartridge if a supported format is found
        var options = getFormatOptions(rom);
        if (options.length === 0) return;

        // Choose the best option
        var bestOption = options[0];
        jt.Util.log("" + bestOption.name + ": " + bestOption.desc + ", priority: " + bestOption.priority + (bestOption.priorityBoosted ? " (" + bestOption.priorityBoosted + ")" : ""));
        return bestOption.createCartridgeFromRom(rom);
    };

    this.createCartridgeFromSaveState = function(saveState) {
        var cartridgeFormat = jt.CartridgeFormats[saveState.f];
        if (!cartridgeFormat) {
            var ex = new Error ("Unsupported ROM Format: " + saveState.f);
            ex.javatari = true;
            throw ex;
        }
        return cartridgeFormat.createCartridgeFromSaveState(saveState);
    };

    this.produceInfo = function(rom) {
        // Preserve original length as MD5 computation may increase it
        var origLen = rom.content.length;
        var hash = jt.MD5(rom.content);
        if (rom.content.length > origLen) rom.content.splice(origLen);

        // Get info from the library
        var info = jt.CartridgeInfoLibrary[hash];
        if (info) {
            jt.Util.log("" + info.n);
        } else {
            info = buildInfo(rom.source);
            jt.Util.log("Unknown ROM: " + info.n);
        }

        finishInfo(info, rom.source, hash);
        return info;
    };

    var getFormatOptions = function(rom) {
        var formatOptions = [];
        var formatOption;
        var denialEx;
        for (var format in jt.CartridgeFormats) {
            try {
                formatOption = jt.CartridgeFormats[format].tryFormat(rom);
                if (!formatOption) continue;	    	    // rejected by format
                boostPriority(formatOption, rom.info);	    // adjust priority based on ROM info
                formatOptions.push(formatOption);
            } catch (ex) {
                if (!ex.formatDenial) throw ex;
                if (!denialEx) denialEx = ex;               // Keep only the first one
            }
        }

        // If no Format could be found, throw error
        if (formatOptions.length === 0) {
            var ex = denialEx || new Error ("Unsupported ROM Format. Size: " + rom.content.length);
            ex.javatari = true;
            throw ex;
        }
        // Sort according to priority
        formatOptions.sort(function formatOptionComparator(a, b) {
           return (a.priorityBoosted || a.priority) - (b.priorityBoosted || b.priority);
        });

        return formatOptions;
    };

    var buildInfo = function(romSource) {
        var info = { n: "Unknown" };
        if (!romSource || !romSource.trim()) return info;

        var name = romSource;

        // Get the last part of the URL (file name)
        var slash = name.lastIndexOf("/");
        var bslash = name.lastIndexOf("\\");
        var question = name.lastIndexOf("?");
        var i = Math.max(slash, Math.max(bslash, question));
        if (i >= 0 && i < name.length - 1) name = name.substring(i + 1);
        // Get only the file name without the extension
        var dot = name.lastIndexOf(".");
        if (dot >= 0) name = name.substring(0, dot);

        info.n = name.trim() || "Unknown";
        return info;
    };

    // Fill absent information based on ROM name
    var finishInfo = function(info, romSource, hash) {
        // Saves the hash on the info
        info.h = hash;
        // Compute label based on name
        if (!info.l) info.l = produceCartridgeLabel(info.n);
        var name = info.n.toUpperCase();
        // Adjust Paddles information if absent
        Paddles: if (!info.p) {
            info.p = 0;
            if (!name.match(HINTS_PREFIX_REGEX + "JOYSTICK(S)?" + HINTS_SUFFIX_REGEX)) {
                if (name.match(HINTS_PREFIX_REGEX + "PADDLE(S)?" + HINTS_SUFFIX_REGEX))
                    info.p = 1;
                else
                    for (var i = 0; i < PADDLES_ROM_NAMES.length; i++)
                        if (name.match(PADDLES_ROM_NAMES[i])) {
                            info.p = 1;
                            break Paddles;
                        }
            }
        }
        // Adjust CRT Mode information if absent
        CrtMode: if (!info.c) {
            if (name.match(HINTS_PREFIX_REGEX + "CRT(_|-)?MODE" + HINTS_SUFFIX_REGEX))
                info.c = 1;
            else
                for (i = 0; i < CRT_MODE_ROM_NAMES.length; i++)
                    if (name.match(CRT_MODE_ROM_NAMES[i])) {
                        info.c = 1;
                        break CrtMode;
                    }
        }
        // Adjust Format information if absent
        Format: if (!info.f) {
            // First by explicit format hint
            var romURL = romSource.toUpperCase();
            for (var formatName in jt.CartridgeFormats)
                if (formatMatchesByHint(formatName, name) || formatMatchesByHint(formatName, romURL)) {
                    info.f = formatName;
                    break Format;
                }
            // Then by name
            for (formatName in FORMAT_ROM_NAMES)
                if (formatMatchesByName(formatName, name)) {
                    info.f = formatName;
                    break Format;
                }
        }
    };

    var boostPriority = function(formatOption, info) {
        if (info.f && formatOption.name === info.f)
            formatOption.priorityBoosted = formatOption.priority - FORMAT_PRIORITY_BOOST;
        else
            formatOption.priorityBoosted = undefined;
    };

    var produceCartridgeLabel = function(name) {
        return name.split(/(\(|\[)/)[0].trim();   //  .toUpperCase();   // TODO Validade
    };

    var formatMatchesByHint = function(formatName, hint) {
        return hint.match(HINTS_PREFIX_REGEX + formatName + HINTS_SUFFIX_REGEX);
    };

    var formatMatchesByName = function(formatName, name) {
        var namesForFormat = FORMAT_ROM_NAMES[formatName];
        if (!namesForFormat) return false;
        for (var i = 0; i < namesForFormat.length; i++)
            if (name.match(namesForFormat[i]))
                return true;
        return false;
    };


    var FORMAT_ROM_NAMES = {
        "E0": [
            "^.*MONTEZUMA.*$",						"^.*MONTZREV.*$",
            "^.*GYRUS.*$",
            "^.*TOOTH.*PROTECTORS.*$",				"^.*TOOTHPRO.*$",
            "^.*DEATH.*STAR.*BATTLE.*$",			"^.*DETHSTAR.*$",
            "^.*JAMES.*BOND.*$",					"^.*JAMEBOND.*$",
            "^.*SUPER.*COBRA.*$",					"^.*SPRCOBRA.*$",
            "^.*TUTANKHAM.*$",						"^.*TUTANK.*$",
            "^.*POPEYE.*$",
            "^.*(SW|STAR.?WARS).*ARCADE.*GAME.*$",	"^.*SWARCADE.*$",
            "^.*Q.*BERT.*QUBES.*$",					"^.*QBRTQUBE.*$",
            "^.*FROGGER.?(2|II).*$",
            "^.*DO.*CASTLE.*$"
        ],
        "FE": [
            "^.*ROBOT.*TANK.*$",		"^.*ROBOTANK.*$",
            "^.*DECATHLON.*$"	, 		"^.*DECATHLN.*$"		// There is also a 16K F6 version
        ],
        "E7": [
            "^.*BUMP.*JUMP.*$",			"^.*BNJ.*$",
            "^.*BURGER.*TIME.*$",		"^.*BURGTIME.*$",
            "^.*POWER.*HE.?MAN.*$",		"^.*HE_MAN.*$"
        ],
        "3F": [
            "^.*POLARIS.*$",
            "^.*RIVER.*PATROL.*$",		 "^.*RIVERP.*$",
            "^.*SPRINGER.*$",
            "^.*MINER.*2049.*$",		 "^.*MNR2049R.*$",
            "^.*MINER.*2049.*VOLUME.*$", "^.*MINRVOL2.*$",
            "^.*ESPIAL.*$",
            "^.*ANDREW.*DAVIE.*$",       "^.*DEMO.*IMAGE.*AD.*$" 		// Various 32K Image demos
        ],
        "3E": [
            "^.*BOULDER.*DASH.*$", 		 "^.*BLDRDASH.*$"
        ],
        "DPCa": [
            "^.*PITFALL.*(2|II).*$"
        ]
    };

    var PADDLES_ROM_NAMES = [
        "^.*PADDLES.*$",										// Generic hint
        "^.*BREAKOUT.*$",
        "^.*SUPER.*BREAKOUT.*$",		  "^.*SUPERB.*$",
        "^.*WARLORDS.*$",
        "^.*STEEPLE.*CHASE.*$",			  "^.*STEPLCHS.*$",
        "^.*VIDEO.*OLYMPICS.*$",		  "^.*VID(|_)OLYM(|P).*$",
        "^.*CIRCUS.*ATARI.*$", 			  "^.*CIRCATRI.*$",
        "^.*KABOOM.*$",
        "^.*BUGS((?!BUNNY).)*",								// Bugs, but not Bugs Bunny!
        "^.*BACHELOR.*PARTY.*$", 		  "^.*BACHELOR.*$",
        "^.*BACHELORETTE.*PARTY.*$", 	  "^.*BACHLRTT.*$",
        "^.*BEAT.*EM.*EAT.*EM.*$", 		  "^.*BEATEM.*$",
        "^.*PHILLY.*FLASHER.*$",	 	  "^.*PHILLY.*$",
        "^.*JEDI.*ARENA.*$",			  "^.*JEDIAREN.*$",
        "^.*EGGOMANIA.*$",				  "^.*EGGOMANA.*$",
        "^.*PICNIC.*$",
        "^.*PIECE.*O.*CAKE.*$",			  "^.*PIECECKE.*$",
        "^.*BACKGAMMON.*$", 			  "^.*BACKGAM.*$",
        "^.*BLACKJACK.*$",				  "^.*BLACK(|_)J.*$",
        "^.*CANYON.*BOMBER.*$", 		  "^.*CANYONB.*$",
        "^.*CASINO.*$",
        "^.*DEMONS.*DIAMONDS.*$",	      "^.*DEMONDIM.*$",
        "^.*DUKES.*HAZZARD.*2.*$",    	  "^.*STUNT.?2.*$",
        "^.*ENCOUNTER.*L.?5.*$", 		  "^.*ENCONTL5.*$",
        "^.*G.*I.*JOE.*COBRA.*STRIKE.*$", "^.*GIJOE.*$",
        "^.*GUARDIAN.*$",
        "^.*MARBLE.*CRAZE.*$",			  "^.*MARBCRAZ.*$",
        "^.*MEDIEVAL.*MAYHEM.*$",
        "^.*MONDO.*PONG.*$",
        "^.*NIGHT.*DRIVER.*$",			  "^.*NIGHTDRV.*$",
        "^.*PARTY.*MIX.*$",
        "^.*POKER.*PLUS.*$",
        "^.*PONG.*SPORTS.*$",
        "^.*SCSICIDE.*$",
        "^.*SECRET.*AGENT.*$",
        "^.*SOLAR.*STORM.*$", 			  "^.*SOLRSTRM.*$",
        "^.*SPEEDWAY.*$",
        "^.*STREET.*RACER.*$", 			  "^.*STRTRACE.*$",
        "^.*STUNT.*CYCLE.*$", 			  "^.*STUNT.?1.*$",
        "^.*TAC.?SCAN.*$",
        "^.*MUSIC.*MACHINE.*$", 		  "^.*MUSCMACH.*$",
        "^.*VONG.*$",
        "^.*WARPLOCK.*$"
    ];

    var CRT_MODE_ROM_NAMES = [
        "^.*STAR.*CASTLE.*$",
        "^.*SEAWEED.*$",
        "^.*ANDREW.*DAVIE.*$",          "^.*DEMO.*IMAGE.*AD.*$" 		// Various 32K Image demos
    ];

    var HINTS_PREFIX_REGEX = "^(|.*?(\\W|_|%20))";
    var HINTS_SUFFIX_REGEX = "(|(\\W|_|%20).*)$";

    var FORMAT_PRIORITY_BOOST = 50;

};

jt.CartridgeDatabase = new jt.CartridgeDatabase();

jt.MD5 = function(data) {

    // convert number to (unsigned) 32 bit hex, zero filled string
    function to_zerofilled_hex(n) {     
        var t1 = (n >>> 0).toString(16)
        return "00000000".substr(0, 8 - t1.length) + t1
    }

    // convert array of chars to array of bytes 
    function chars_to_bytes(ac) {
        var retval = []
        for (var i = 0; i < ac.length; i++) {
            retval = retval.concat(str_to_bytes(ac[i]))
        }
        return retval
    }


    // convert a 64 bit unsigned number to array of bytes. Little endian
    function int64_to_bytes(num) {
        var retval = []
        for (var i = 0; i < 8; i++) {
            retval.push(num & 0xFF)
            num = num >>> 8
        }
        return retval
    }

    //  32 bit left-rotation
    function rol(num, places) {
        return ((num << places) & 0xFFFFFFFF) | (num >>> (32 - places))
    }

    // The 4 MD5 functions
    function fF(b, c, d) {
        return (b & c) | (~b & d)
    }

    function fG(b, c, d) {
        return (d & b) | (~d & c)
    }

    function fH(b, c, d) {
        return b ^ c ^ d
    }

    function fI(b, c, d) {
        return c ^ (b | ~d)
    }

    // pick 4 bytes at specified offset. Little-endian is assumed
    function bytes_to_int32(arr, off) {
        return (arr[off + 3] << 24) | (arr[off + 2] << 16) | (arr[off + 1] << 8) | (arr[off])
    }

    /*
    Conver string to array of bytes in UTF-8 encoding
    See: 
    http://www.dangrossman.info/2007/05/25/handling-utf-8-in-javascript-php-and-non-utf8-databases/
    http://stackoverflow.com/questions/1240408/reading-bytes-from-a-javascript-string
    How about a String.getBytes(<ENCODING>) for Javascript!? Isn't it time to add it?
    */
    function str_to_bytes(str) {
        var retval = [ ]
        for (var i = 0; i < str.length; i++)
            if (str.charCodeAt(i) <= 0x7F) {
                retval.push(str.charCodeAt(i))
            } else {
                var tmp = encodeURIComponent(str.charAt(i)).substr(1).split('%')
                for (var j = 0; j < tmp.length; j++) {
                    retval.push(parseInt(tmp[j], 0x10))
                }
            }
        return retval
    }


    // convert the 4 32-bit buffers to a 128 bit hex string. (Little-endian is assumed)
    function int128le_to_hex(a, b, c, d) {
        var ra = ""
        var t = 0
        var ta = 0
        for (var i = 3; i >= 0; i--) {
            ta = arguments[i]
            t = (ta & 0xFF)
            ta = ta >>> 8
            t = t << 8
            t = t | (ta & 0xFF)
            ta = ta >>> 8
            t = t << 8
            t = t | (ta & 0xFF)
            ta = ta >>> 8
            t = t << 8
            t = t | ta
            ra = ra + to_zerofilled_hex(t)
        }
        return ra
    }

    // conversion from typed byte array to plain javascript array 
    function typed_to_plain(tarr) {
        var retval = new Array(tarr.length)
        for (var i = 0; i < tarr.length; i++) {
            retval[i] = tarr[i]
        }
        return retval
    }

    // check input data type and perform conversions if needed
    var databytes = null
    // String
    var type_mismatch = null
    if (typeof data == 'string') {
        // convert string to array bytes
        databytes = str_to_bytes(data)
    } else if (data.constructor == Array) {
        if (data.length === 0) {
            // if it's empty, just assume array of bytes
            databytes = data
        } else if (typeof data[0] == 'string') {
            databytes = chars_to_bytes(data)
        } else if (typeof data[0] == 'number') {
            databytes = data
        } else {
            type_mismatch = typeof data[0]
        }
    } else if (typeof ArrayBuffer != 'undefined') {
        if (data instanceof ArrayBuffer) {
            databytes = typed_to_plain(new Uint8Array(data))
        } else if ((data instanceof Uint8Array) || (data instanceof Int8Array)) {
            databytes = typed_to_plain(data)
        } else if ((data instanceof Uint32Array) || (data instanceof Int32Array) || 
               (data instanceof Uint16Array) || (data instanceof Int16Array) || 
               (data instanceof Float32Array) || (data instanceof Float64Array)
         ) {
            databytes = typed_to_plain(new Uint8Array(data.buffer))
        } else {
            type_mismatch = typeof data
        }   
    } else {
        type_mismatch = typeof data
    }

    if (type_mismatch) {
        alert('MD5 type mismatch, cannot process ' + type_mismatch)
    }

    function _add(n1, n2) {
        return 0x0FFFFFFFF & (n1 + n2)
    }


    return do_digest()

    function do_digest() {

        // function update partial state for each run
        function updateRun(nf, sin32, dw32, b32) {
            var temp = d
            d = c
            c = b
            //b = b + rol(a + (nf + (sin32 + dw32)), b32)
            b = _add(b, 
                rol( 
                    _add(a, 
                        _add(nf, _add(sin32, dw32))
                    ), b32
                )
            )
            a = temp
        }

        // save original length
        var org_len = databytes.length

        // first append the "1" + 7x "0"
        databytes.push(0x80)

        // determine required amount of padding
        var tail = databytes.length % 64
        // no room for msg length?
        if (tail > 56) {
            // pad to next 512 bit block
            for (var i = 0; i < (64 - tail); i++) {
                databytes.push(0x0)
            }
            tail = databytes.length % 64
        }
        for (i = 0; i < (56 - tail); i++) {
            databytes.push(0x0)
        }
        // message length in bits mod 512 should now be 448
        // append 64 bit, little-endian original msg length (in *bits*!)
        databytes = databytes.concat(int64_to_bytes(org_len * 8))

        // initialize 4x32 bit state
        var h0 = 0x67452301
        var h1 = 0xEFCDAB89
        var h2 = 0x98BADCFE
        var h3 = 0x10325476

        // temp buffers
        var a = 0, b = 0, c = 0, d = 0

        // Digest message
        for (i = 0; i < databytes.length / 64; i++) {
            // initialize run
            a = h0
            b = h1
            c = h2
            d = h3

            var ptr = i * 64

            // do 64 runs
            updateRun(fF(b, c, d), 0xd76aa478, bytes_to_int32(databytes, ptr), 7)
            updateRun(fF(b, c, d), 0xe8c7b756, bytes_to_int32(databytes, ptr + 4), 12)
            updateRun(fF(b, c, d), 0x242070db, bytes_to_int32(databytes, ptr + 8), 17)
            updateRun(fF(b, c, d), 0xc1bdceee, bytes_to_int32(databytes, ptr + 12), 22)
            updateRun(fF(b, c, d), 0xf57c0faf, bytes_to_int32(databytes, ptr + 16), 7)
            updateRun(fF(b, c, d), 0x4787c62a, bytes_to_int32(databytes, ptr + 20), 12)
            updateRun(fF(b, c, d), 0xa8304613, bytes_to_int32(databytes, ptr + 24), 17)
            updateRun(fF(b, c, d), 0xfd469501, bytes_to_int32(databytes, ptr + 28), 22)
            updateRun(fF(b, c, d), 0x698098d8, bytes_to_int32(databytes, ptr + 32), 7)
            updateRun(fF(b, c, d), 0x8b44f7af, bytes_to_int32(databytes, ptr + 36), 12)
            updateRun(fF(b, c, d), 0xffff5bb1, bytes_to_int32(databytes, ptr + 40), 17)
            updateRun(fF(b, c, d), 0x895cd7be, bytes_to_int32(databytes, ptr + 44), 22)
            updateRun(fF(b, c, d), 0x6b901122, bytes_to_int32(databytes, ptr + 48), 7)
            updateRun(fF(b, c, d), 0xfd987193, bytes_to_int32(databytes, ptr + 52), 12)
            updateRun(fF(b, c, d), 0xa679438e, bytes_to_int32(databytes, ptr + 56), 17)
            updateRun(fF(b, c, d), 0x49b40821, bytes_to_int32(databytes, ptr + 60), 22)
            updateRun(fG(b, c, d), 0xf61e2562, bytes_to_int32(databytes, ptr + 4), 5)
            updateRun(fG(b, c, d), 0xc040b340, bytes_to_int32(databytes, ptr + 24), 9)
            updateRun(fG(b, c, d), 0x265e5a51, bytes_to_int32(databytes, ptr + 44), 14)
            updateRun(fG(b, c, d), 0xe9b6c7aa, bytes_to_int32(databytes, ptr), 20)
            updateRun(fG(b, c, d), 0xd62f105d, bytes_to_int32(databytes, ptr + 20), 5)
            updateRun(fG(b, c, d), 0x2441453, bytes_to_int32(databytes, ptr + 40), 9)
            updateRun(fG(b, c, d), 0xd8a1e681, bytes_to_int32(databytes, ptr + 60), 14)
            updateRun(fG(b, c, d), 0xe7d3fbc8, bytes_to_int32(databytes, ptr + 16), 20)
            updateRun(fG(b, c, d), 0x21e1cde6, bytes_to_int32(databytes, ptr + 36), 5)
            updateRun(fG(b, c, d), 0xc33707d6, bytes_to_int32(databytes, ptr + 56), 9)
            updateRun(fG(b, c, d), 0xf4d50d87, bytes_to_int32(databytes, ptr + 12), 14)
            updateRun(fG(b, c, d), 0x455a14ed, bytes_to_int32(databytes, ptr + 32), 20)
            updateRun(fG(b, c, d), 0xa9e3e905, bytes_to_int32(databytes, ptr + 52), 5)
            updateRun(fG(b, c, d), 0xfcefa3f8, bytes_to_int32(databytes, ptr + 8), 9)
            updateRun(fG(b, c, d), 0x676f02d9, bytes_to_int32(databytes, ptr + 28), 14)
            updateRun(fG(b, c, d), 0x8d2a4c8a, bytes_to_int32(databytes, ptr + 48), 20)
            updateRun(fH(b, c, d), 0xfffa3942, bytes_to_int32(databytes, ptr + 20), 4)
            updateRun(fH(b, c, d), 0x8771f681, bytes_to_int32(databytes, ptr + 32), 11)
            updateRun(fH(b, c, d), 0x6d9d6122, bytes_to_int32(databytes, ptr + 44), 16)
            updateRun(fH(b, c, d), 0xfde5380c, bytes_to_int32(databytes, ptr + 56), 23)
            updateRun(fH(b, c, d), 0xa4beea44, bytes_to_int32(databytes, ptr + 4), 4)
            updateRun(fH(b, c, d), 0x4bdecfa9, bytes_to_int32(databytes, ptr + 16), 11)
            updateRun(fH(b, c, d), 0xf6bb4b60, bytes_to_int32(databytes, ptr + 28), 16)
            updateRun(fH(b, c, d), 0xbebfbc70, bytes_to_int32(databytes, ptr + 40), 23)
            updateRun(fH(b, c, d), 0x289b7ec6, bytes_to_int32(databytes, ptr + 52), 4)
            updateRun(fH(b, c, d), 0xeaa127fa, bytes_to_int32(databytes, ptr), 11)
            updateRun(fH(b, c, d), 0xd4ef3085, bytes_to_int32(databytes, ptr + 12), 16)
            updateRun(fH(b, c, d), 0x4881d05, bytes_to_int32(databytes, ptr + 24), 23)
            updateRun(fH(b, c, d), 0xd9d4d039, bytes_to_int32(databytes, ptr + 36), 4)
            updateRun(fH(b, c, d), 0xe6db99e5, bytes_to_int32(databytes, ptr + 48), 11)
            updateRun(fH(b, c, d), 0x1fa27cf8, bytes_to_int32(databytes, ptr + 60), 16)
            updateRun(fH(b, c, d), 0xc4ac5665, bytes_to_int32(databytes, ptr + 8), 23)
            updateRun(fI(b, c, d), 0xf4292244, bytes_to_int32(databytes, ptr), 6)
            updateRun(fI(b, c, d), 0x432aff97, bytes_to_int32(databytes, ptr + 28), 10)
            updateRun(fI(b, c, d), 0xab9423a7, bytes_to_int32(databytes, ptr + 56), 15)
            updateRun(fI(b, c, d), 0xfc93a039, bytes_to_int32(databytes, ptr + 20), 21)
            updateRun(fI(b, c, d), 0x655b59c3, bytes_to_int32(databytes, ptr + 48), 6)
            updateRun(fI(b, c, d), 0x8f0ccc92, bytes_to_int32(databytes, ptr + 12), 10)
            updateRun(fI(b, c, d), 0xffeff47d, bytes_to_int32(databytes, ptr + 40), 15)
            updateRun(fI(b, c, d), 0x85845dd1, bytes_to_int32(databytes, ptr + 4), 21)
            updateRun(fI(b, c, d), 0x6fa87e4f, bytes_to_int32(databytes, ptr + 32), 6)
            updateRun(fI(b, c, d), 0xfe2ce6e0, bytes_to_int32(databytes, ptr + 60), 10)
            updateRun(fI(b, c, d), 0xa3014314, bytes_to_int32(databytes, ptr + 24), 15)
            updateRun(fI(b, c, d), 0x4e0811a1, bytes_to_int32(databytes, ptr + 52), 21)
            updateRun(fI(b, c, d), 0xf7537e82, bytes_to_int32(databytes, ptr + 16), 6)
            updateRun(fI(b, c, d), 0xbd3af235, bytes_to_int32(databytes, ptr + 44), 10)
            updateRun(fI(b, c, d), 0x2ad7d2bb, bytes_to_int32(databytes, ptr + 8), 15)
            updateRun(fI(b, c, d), 0xeb86d391, bytes_to_int32(databytes, ptr + 36), 21)

            // update buffers
            h0 = _add(h0, a)
            h1 = _add(h1, b)
            h2 = _add(h2, c)
            h3 = _add(h3, d)
        }
        // Done! Convert buffers to 128 bit (LE)
        return int128le_to_hex(h3, h2, h1, h0).toUpperCase()
    }
    
};


/*!
JSZip - A Javascript class for generating and reading zip files
<http://stuartk.com/jszip>

(c) 2009-2014 Stuart Knightley <stuart [at] stuartk.com>
Dual licenced under the MIT license or GPLv3. See https://raw.github.com/Stuk/jszip/master/LICENSE.markdown.

JSZip uses the library pako released under the MIT license :
https://github.com/nodeca/pako/blob/master/LICENSE
*/
!function(a){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=a();else if("function"==typeof define&&define.amd)define([],a);else{var b;"undefined"!=typeof window?b=window:"undefined"!=typeof global?b=global:"undefined"!=typeof self&&(b=self),b.JSZip=a()}}(function(){return function a(b,c,d){function e(g,h){if(!c[g]){if(!b[g]){var i="function"==typeof require&&require;if(!h&&i)return i(g,!0);if(f)return f(g,!0);throw new Error("Cannot find module '"+g+"'")}var j=c[g]={exports:{}};b[g][0].call(j.exports,function(a){var c=b[g][1][a];return e(c?c:a)},j,j.exports,a,b,c,d)}return c[g].exports}for(var f="function"==typeof require&&require,g=0;g<d.length;g++)e(d[g]);return e}({1:[function(a,b,c){"use strict";var d="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";c.encode=function(a){for(var b,c,e,f,g,h,i,j="",k=0;k<a.length;)b=a.charCodeAt(k++),c=a.charCodeAt(k++),e=a.charCodeAt(k++),f=b>>2,g=(3&b)<<4|c>>4,h=(15&c)<<2|e>>6,i=63&e,isNaN(c)?h=i=64:isNaN(e)&&(i=64),j=j+d.charAt(f)+d.charAt(g)+d.charAt(h)+d.charAt(i);return j},c.decode=function(a){var b,c,e,f,g,h,i,j="",k=0;for(a=a.replace(/[^A-Za-z0-9\+\/\=]/g,"");k<a.length;)f=d.indexOf(a.charAt(k++)),g=d.indexOf(a.charAt(k++)),h=d.indexOf(a.charAt(k++)),i=d.indexOf(a.charAt(k++)),b=f<<2|g>>4,c=(15&g)<<4|h>>2,e=(3&h)<<6|i,j+=String.fromCharCode(b),64!=h&&(j+=String.fromCharCode(c)),64!=i&&(j+=String.fromCharCode(e));return j}},{}],2:[function(a,b){"use strict";function c(){this.compressedSize=0,this.uncompressedSize=0,this.crc32=0,this.compressionMethod=null,this.compressedContent=null}c.prototype={getContent:function(){return null},getCompressedContent:function(){return null}},b.exports=c},{}],3:[function(a,b,c){"use strict";c.STORE={magic:"\x00\x00",compress:function(a){return a},uncompress:function(a){return a},compressInputType:null,uncompressInputType:null},c.DEFLATE=a("./flate")},{"./flate":8}],4:[function(a,b){"use strict";var c=a("./utils"),d=[0,1996959894,3993919788,2567524794,124634137,1886057615,3915621685,2657392035,249268274,2044508324,3772115230,2547177864,162941995,2125561021,3887607047,2428444049,498536548,1789927666,4089016648,2227061214,450548861,1843258603,4107580753,2211677639,325883990,1684777152,4251122042,2321926636,335633487,1661365465,4195302755,2366115317,997073096,1281953886,3579855332,2724688242,1006888145,1258607687,3524101629,2768942443,901097722,1119000684,3686517206,2898065728,853044451,1172266101,3705015759,2882616665,651767980,1373503546,3369554304,3218104598,565507253,1454621731,3485111705,3099436303,671266974,1594198024,3322730930,2970347812,795835527,1483230225,3244367275,3060149565,1994146192,31158534,2563907772,4023717930,1907459465,112637215,2680153253,3904427059,2013776290,251722036,2517215374,3775830040,2137656763,141376813,2439277719,3865271297,1802195444,476864866,2238001368,4066508878,1812370925,453092731,2181625025,4111451223,1706088902,314042704,2344532202,4240017532,1658658271,366619977,2362670323,4224994405,1303535960,984961486,2747007092,3569037538,1256170817,1037604311,2765210733,3554079995,1131014506,879679996,2909243462,3663771856,1141124467,855842277,2852801631,3708648649,1342533948,654459306,3188396048,3373015174,1466479909,544179635,3110523913,3462522015,1591671054,702138776,2966460450,3352799412,1504918807,783551873,3082640443,3233442989,3988292384,2596254646,62317068,1957810842,3939845945,2647816111,81470997,1943803523,3814918930,2489596804,225274430,2053790376,3826175755,2466906013,167816743,2097651377,4027552580,2265490386,503444072,1762050814,4150417245,2154129355,426522225,1852507879,4275313526,2312317920,282753626,1742555852,4189708143,2394877945,397917763,1622183637,3604390888,2714866558,953729732,1340076626,3518719985,2797360999,1068828381,1219638859,3624741850,2936675148,906185462,1090812512,3747672003,2825379669,829329135,1181335161,3412177804,3160834842,628085408,1382605366,3423369109,3138078467,570562233,1426400815,3317316542,2998733608,733239954,1555261956,3268935591,3050360625,752459403,1541320221,2607071920,3965973030,1969922972,40735498,2617837225,3943577151,1913087877,83908371,2512341634,3803740692,2075208622,213261112,2463272603,3855990285,2094854071,198958881,2262029012,4057260610,1759359992,534414190,2176718541,4139329115,1873836001,414664567,2282248934,4279200368,1711684554,285281116,2405801727,4167216745,1634467795,376229701,2685067896,3608007406,1308918612,956543938,2808555105,3495958263,1231636301,1047427035,2932959818,3654703836,1088359270,936918e3,2847714899,3736837829,1202900863,817233897,3183342108,3401237130,1404277552,615818150,3134207493,3453421203,1423857449,601450431,3009837614,3294710456,1567103746,711928724,3020668471,3272380065,1510334235,755167117];b.exports=function(a,b){if("undefined"==typeof a||!a.length)return 0;var e="string"!==c.getTypeOf(a);"undefined"==typeof b&&(b=0);var f=0,g=0,h=0;b=-1^b;for(var i=0,j=a.length;j>i;i++)h=e?a[i]:a.charCodeAt(i),g=255&(b^h),f=d[g],b=b>>>8^f;return-1^b}},{"./utils":21}],5:[function(a,b){"use strict";function c(){this.data=null,this.length=0,this.index=0}var d=a("./utils");c.prototype={checkOffset:function(a){this.checkIndex(this.index+a)},checkIndex:function(a){if(this.length<a||0>a)throw new Error("End of data reached (data length = "+this.length+", asked index = "+a+"). Corrupted zip ?")},setIndex:function(a){this.checkIndex(a),this.index=a},skip:function(a){this.setIndex(this.index+a)},byteAt:function(){},readInt:function(a){var b,c=0;for(this.checkOffset(a),b=this.index+a-1;b>=this.index;b--)c=(c<<8)+this.byteAt(b);return this.index+=a,c},readString:function(a){return d.transformTo("string",this.readData(a))},readData:function(){},lastIndexOfSignature:function(){},readDate:function(){var a=this.readInt(4);return new Date((a>>25&127)+1980,(a>>21&15)-1,a>>16&31,a>>11&31,a>>5&63,(31&a)<<1)}},b.exports=c},{"./utils":21}],6:[function(a,b,c){"use strict";c.base64=!1,c.binary=!1,c.dir=!1,c.createFolders=!1,c.date=null,c.compression=null,c.comment=null},{}],7:[function(a,b,c){"use strict";var d=a("./utils");c.string2binary=function(a){return d.string2binary(a)},c.string2Uint8Array=function(a){return d.transformTo("uint8array",a)},c.uint8Array2String=function(a){return d.transformTo("string",a)},c.string2Blob=function(a){var b=d.transformTo("arraybuffer",a);return d.arrayBuffer2Blob(b)},c.arrayBuffer2Blob=function(a){return d.arrayBuffer2Blob(a)},c.transformTo=function(a,b){return d.transformTo(a,b)},c.getTypeOf=function(a){return d.getTypeOf(a)},c.checkSupport=function(a){return d.checkSupport(a)},c.MAX_VALUE_16BITS=d.MAX_VALUE_16BITS,c.MAX_VALUE_32BITS=d.MAX_VALUE_32BITS,c.pretty=function(a){return d.pretty(a)},c.findCompression=function(a){return d.findCompression(a)},c.isRegExp=function(a){return d.isRegExp(a)}},{"./utils":21}],8:[function(a,b,c){"use strict";var d="undefined"!=typeof Uint8Array&&"undefined"!=typeof Uint16Array&&"undefined"!=typeof Uint32Array,e=a("pako");c.uncompressInputType=d?"uint8array":"array",c.compressInputType=d?"uint8array":"array",c.magic="\b\x00",c.compress=function(a){return e.deflateRaw(a)},c.uncompress=function(a){return e.inflateRaw(a)}},{pako:24}],9:[function(a,b){"use strict";function c(a,b){return this instanceof c?(this.files={},this.comment=null,this.root="",a&&this.load(a,b),void(this.clone=function(){var a=new c;for(var b in this)"function"!=typeof this[b]&&(a[b]=this[b]);return a})):new c(a,b)}var d=a("./base64");c.prototype=a("./object"),c.prototype.load=a("./load"),c.support=a("./support"),c.defaults=a("./defaults"),c.utils=a("./deprecatedPublicUtils"),c.base64={encode:function(a){return d.encode(a)},decode:function(a){return d.decode(a)}},c.compressions=a("./compressions"),b.exports=c},{"./base64":1,"./compressions":3,"./defaults":6,"./deprecatedPublicUtils":7,"./load":10,"./object":13,"./support":17}],10:[function(a,b){"use strict";var c=a("./base64"),d=a("./zipEntries");b.exports=function(a,b){var e,f,g,h;for(b=b||{},b.base64&&(a=c.decode(a)),f=new d(a,b),e=f.files,g=0;g<e.length;g++)h=e[g],this.file(h.fileName,h.decompressed,{binary:!0,optimizedBinaryString:!0,date:h.date,dir:h.dir,comment:h.fileComment.length?h.fileComment:null,createFolders:b.createFolders});return f.zipComment.length&&(this.comment=f.zipComment),this}},{"./base64":1,"./zipEntries":22}],11:[function(a,b){(function(a){"use strict";b.exports=function(b,c){return new a(b,c)},b.exports.test=function(b){return a.isBuffer(b)}}).call(this,"undefined"!=typeof Buffer?Buffer:void 0)},{}],12:[function(a,b){"use strict";function c(a){this.data=a,this.length=this.data.length,this.index=0}var d=a("./uint8ArrayReader");c.prototype=new d,c.prototype.readData=function(a){this.checkOffset(a);var b=this.data.slice(this.index,this.index+a);return this.index+=a,b},b.exports=c},{"./uint8ArrayReader":18}],13:[function(a,b){"use strict";var c=a("./support"),d=a("./utils"),e=a("./crc32"),f=a("./signature"),g=a("./defaults"),h=a("./base64"),i=a("./compressions"),j=a("./compressedObject"),k=a("./nodeBuffer"),l=a("./utf8"),m=a("./stringWriter"),n=a("./uint8ArrayWriter"),o=function(a){if(a._data instanceof j&&(a._data=a._data.getContent(),a.options.binary=!0,a.options.base64=!1,"uint8array"===d.getTypeOf(a._data))){var b=a._data;a._data=new Uint8Array(b.length),0!==b.length&&a._data.set(b,0)}return a._data},p=function(a){var b=o(a),e=d.getTypeOf(b);return"string"===e?!a.options.binary&&c.nodebuffer?k(b,"utf-8"):a.asBinary():b},q=function(a){var b=o(this);return null===b||"undefined"==typeof b?"":(this.options.base64&&(b=h.decode(b)),b=a&&this.options.binary?A.utf8decode(b):d.transformTo("string",b),a||this.options.binary||(b=d.transformTo("string",A.utf8encode(b))),b)},r=function(a,b,c){this.name=a,this.dir=c.dir,this.date=c.date,this.comment=c.comment,this._data=b,this.options=c,this._initialMetadata={dir:c.dir,date:c.date}};r.prototype={asText:function(){return q.call(this,!0)},asBinary:function(){return q.call(this,!1)},asNodeBuffer:function(){var a=p(this);return d.transformTo("nodebuffer",a)},asUint8Array:function(){var a=p(this);return d.transformTo("uint8array",a)},asArrayBuffer:function(){return this.asUint8Array().buffer}};var s=function(a,b){var c,d="";for(c=0;b>c;c++)d+=String.fromCharCode(255&a),a>>>=8;return d},t=function(){var a,b,c={};for(a=0;a<arguments.length;a++)for(b in arguments[a])arguments[a].hasOwnProperty(b)&&"undefined"==typeof c[b]&&(c[b]=arguments[a][b]);return c},u=function(a){return a=a||{},a.base64!==!0||null!==a.binary&&void 0!==a.binary||(a.binary=!0),a=t(a,g),a.date=a.date||new Date,null!==a.compression&&(a.compression=a.compression.toUpperCase()),a},v=function(a,b,c){var e,f=d.getTypeOf(b);if(c=u(c),c.createFolders&&(e=w(a))&&x.call(this,e,!0),c.dir||null===b||"undefined"==typeof b)c.base64=!1,c.binary=!1,b=null;else if("string"===f)c.binary&&!c.base64&&c.optimizedBinaryString!==!0&&(b=d.string2binary(b));else{if(c.base64=!1,c.binary=!0,!(f||b instanceof j))throw new Error("The data of '"+a+"' is in an unsupported format !");"arraybuffer"===f&&(b=d.transformTo("uint8array",b))}var g=new r(a,b,c);return this.files[a]=g,g},w=function(a){"/"==a.slice(-1)&&(a=a.substring(0,a.length-1));var b=a.lastIndexOf("/");return b>0?a.substring(0,b):""},x=function(a,b){return"/"!=a.slice(-1)&&(a+="/"),b="undefined"!=typeof b?b:!1,this.files[a]||v.call(this,a,null,{dir:!0,createFolders:b}),this.files[a]},y=function(a,b){var c,f=new j;return a._data instanceof j?(f.uncompressedSize=a._data.uncompressedSize,f.crc32=a._data.crc32,0===f.uncompressedSize||a.dir?(b=i.STORE,f.compressedContent="",f.crc32=0):a._data.compressionMethod===b.magic?f.compressedContent=a._data.getCompressedContent():(c=a._data.getContent(),f.compressedContent=b.compress(d.transformTo(b.compressInputType,c)))):(c=p(a),(!c||0===c.length||a.dir)&&(b=i.STORE,c=""),f.uncompressedSize=c.length,f.crc32=e(c),f.compressedContent=b.compress(d.transformTo(b.compressInputType,c))),f.compressedSize=f.compressedContent.length,f.compressionMethod=b.magic,f},z=function(a,b,c,g){var h,i,j,k,m=(c.compressedContent,d.transformTo("string",l.utf8encode(b.name))),n=b.comment||"",o=d.transformTo("string",l.utf8encode(n)),p=m.length!==b.name.length,q=o.length!==n.length,r=b.options,t="",u="",v="";j=b._initialMetadata.dir!==b.dir?b.dir:r.dir,k=b._initialMetadata.date!==b.date?b.date:r.date,h=k.getHours(),h<<=6,h|=k.getMinutes(),h<<=5,h|=k.getSeconds()/2,i=k.getFullYear()-1980,i<<=4,i|=k.getMonth()+1,i<<=5,i|=k.getDate(),p&&(u=s(1,1)+s(e(m),4)+m,t+="up"+s(u.length,2)+u),q&&(v=s(1,1)+s(this.crc32(o),4)+o,t+="uc"+s(v.length,2)+v);var w="";w+="\n\x00",w+=p||q?"\x00\b":"\x00\x00",w+=c.compressionMethod,w+=s(h,2),w+=s(i,2),w+=s(c.crc32,4),w+=s(c.compressedSize,4),w+=s(c.uncompressedSize,4),w+=s(m.length,2),w+=s(t.length,2);var x=f.LOCAL_FILE_HEADER+w+m+t,y=f.CENTRAL_FILE_HEADER+"\x00"+w+s(o.length,2)+"\x00\x00\x00\x00"+(j===!0?"\x00\x00\x00":"\x00\x00\x00\x00")+s(g,4)+m+t+o;return{fileRecord:x,dirRecord:y,compressedObject:c}},A={load:function(){throw new Error("Load method is not defined. Is the file jszip-load.js included ?")},filter:function(a){var b,c,d,e,f=[];for(b in this.files)this.files.hasOwnProperty(b)&&(d=this.files[b],e=new r(d.name,d._data,t(d.options)),c=b.slice(this.root.length,b.length),b.slice(0,this.root.length)===this.root&&a(c,e)&&f.push(e));return f},file:function(a,b,c){if(1===arguments.length){if(d.isRegExp(a)){var e=a;return this.filter(function(a,b){return!b.dir&&e.test(a)})}return this.filter(function(b,c){return!c.dir&&b===a})[0]||null}return a=this.root+a,v.call(this,a,b,c),this},folder:function(a){if(!a)return this;if(d.isRegExp(a))return this.filter(function(b,c){return c.dir&&a.test(b)});var b=this.root+a,c=x.call(this,b),e=this.clone();return e.root=c.name,e},remove:function(a){a=this.root+a;var b=this.files[a];if(b||("/"!=a.slice(-1)&&(a+="/"),b=this.files[a]),b&&!b.dir)delete this.files[a];else for(var c=this.filter(function(b,c){return c.name.slice(0,a.length)===a}),d=0;d<c.length;d++)delete this.files[c[d].name];return this},generate:function(a){a=t(a||{},{base64:!0,compression:"STORE",type:"base64",comment:null}),d.checkSupport(a.type);var b,c,e=[],g=0,j=0,k=d.transformTo("string",this.utf8encode(a.comment||this.comment||""));for(var l in this.files)if(this.files.hasOwnProperty(l)){var o=this.files[l],p=o.options.compression||a.compression.toUpperCase(),q=i[p];if(!q)throw new Error(p+" is not a valid compression method !");var r=y.call(this,o,q),u=z.call(this,l,o,r,g);g+=u.fileRecord.length+r.compressedSize,j+=u.dirRecord.length,e.push(u)}var v="";v=f.CENTRAL_DIRECTORY_END+"\x00\x00\x00\x00"+s(e.length,2)+s(e.length,2)+s(j,4)+s(g,4)+s(k.length,2)+k;var w=a.type.toLowerCase();for(b="uint8array"===w||"arraybuffer"===w||"blob"===w||"nodebuffer"===w?new n(g+j+v.length):new m(g+j+v.length),c=0;c<e.length;c++)b.append(e[c].fileRecord),b.append(e[c].compressedObject.compressedContent);for(c=0;c<e.length;c++)b.append(e[c].dirRecord);b.append(v);var x=b.finalize();switch(a.type.toLowerCase()){case"uint8array":case"arraybuffer":case"nodebuffer":return d.transformTo(a.type.toLowerCase(),x);case"blob":return d.arrayBuffer2Blob(d.transformTo("arraybuffer",x));case"base64":return a.base64?h.encode(x):x;default:return x}},crc32:function(a,b){return e(a,b)},utf8encode:function(a){return d.transformTo("string",l.utf8encode(a))},utf8decode:function(a){return l.utf8decode(a)}};b.exports=A},{"./base64":1,"./compressedObject":2,"./compressions":3,"./crc32":4,"./defaults":6,"./nodeBuffer":11,"./signature":14,"./stringWriter":16,"./support":17,"./uint8ArrayWriter":19,"./utf8":20,"./utils":21}],14:[function(a,b,c){"use strict";c.LOCAL_FILE_HEADER="PK",c.CENTRAL_FILE_HEADER="PK",c.CENTRAL_DIRECTORY_END="PK",c.ZIP64_CENTRAL_DIRECTORY_LOCATOR="PK",c.ZIP64_CENTRAL_DIRECTORY_END="PK",c.DATA_DESCRIPTOR="PK\b"},{}],15:[function(a,b){"use strict";function c(a,b){this.data=a,b||(this.data=e.string2binary(this.data)),this.length=this.data.length,this.index=0}var d=a("./dataReader"),e=a("./utils");c.prototype=new d,c.prototype.byteAt=function(a){return this.data.charCodeAt(a)},c.prototype.lastIndexOfSignature=function(a){return this.data.lastIndexOf(a)},c.prototype.readData=function(a){this.checkOffset(a);var b=this.data.slice(this.index,this.index+a);return this.index+=a,b},b.exports=c},{"./dataReader":5,"./utils":21}],16:[function(a,b){"use strict";var c=a("./utils"),d=function(){this.data=[]};d.prototype={append:function(a){a=c.transformTo("string",a),this.data.push(a)},finalize:function(){return this.data.join("")}},b.exports=d},{"./utils":21}],17:[function(a,b,c){(function(a){"use strict";if(c.base64=!0,c.array=!0,c.string=!0,c.arraybuffer="undefined"!=typeof ArrayBuffer&&"undefined"!=typeof Uint8Array,c.nodebuffer="undefined"!=typeof a,c.uint8array="undefined"!=typeof Uint8Array,"undefined"==typeof ArrayBuffer)c.blob=!1;else{var b=new ArrayBuffer(0);try{c.blob=0===new Blob([b],{type:"application/zip"}).size}catch(d){try{var e=window.BlobBuilder||window.WebKitBlobBuilder||window.MozBlobBuilder||window.MSBlobBuilder,f=new e;f.append(b),c.blob=0===f.getBlob("application/zip").size}catch(d){c.blob=!1}}}}).call(this,"undefined"!=typeof Buffer?Buffer:void 0)},{}],18:[function(a,b){"use strict";function c(a){a&&(this.data=a,this.length=this.data.length,this.index=0)}var d=a("./dataReader");c.prototype=new d,c.prototype.byteAt=function(a){return this.data[a]},c.prototype.lastIndexOfSignature=function(a){for(var b=a.charCodeAt(0),c=a.charCodeAt(1),d=a.charCodeAt(2),e=a.charCodeAt(3),f=this.length-4;f>=0;--f)if(this.data[f]===b&&this.data[f+1]===c&&this.data[f+2]===d&&this.data[f+3]===e)return f;return-1},c.prototype.readData=function(a){if(this.checkOffset(a),0===a)return new Uint8Array(0);var b=this.data.subarray(this.index,this.index+a);return this.index+=a,b},b.exports=c},{"./dataReader":5}],19:[function(a,b){"use strict";var c=a("./utils"),d=function(a){this.data=new Uint8Array(a),this.index=0};d.prototype={append:function(a){0!==a.length&&(a=c.transformTo("uint8array",a),this.data.set(a,this.index),this.index+=a.length)},finalize:function(){return this.data}},b.exports=d},{"./utils":21}],20:[function(a,b,c){"use strict";for(var d=a("./utils"),e=a("./support"),f=a("./nodeBuffer"),g=new Array(256),h=0;256>h;h++)g[h]=h>=252?6:h>=248?5:h>=240?4:h>=224?3:h>=192?2:1;g[254]=g[254]=1;var i=function(a){var b,c,d,f,g,h=a.length,i=0;for(f=0;h>f;f++)c=a.charCodeAt(f),55296===(64512&c)&&h>f+1&&(d=a.charCodeAt(f+1),56320===(64512&d)&&(c=65536+(c-55296<<10)+(d-56320),f++)),i+=128>c?1:2048>c?2:65536>c?3:4;for(b=e.uint8array?new Uint8Array(i):new Array(i),g=0,f=0;i>g;f++)c=a.charCodeAt(f),55296===(64512&c)&&h>f+1&&(d=a.charCodeAt(f+1),56320===(64512&d)&&(c=65536+(c-55296<<10)+(d-56320),f++)),128>c?b[g++]=c:2048>c?(b[g++]=192|c>>>6,b[g++]=128|63&c):65536>c?(b[g++]=224|c>>>12,b[g++]=128|c>>>6&63,b[g++]=128|63&c):(b[g++]=240|c>>>18,b[g++]=128|c>>>12&63,b[g++]=128|c>>>6&63,b[g++]=128|63&c);return b},j=function(a,b){var c;for(b=b||a.length,b>a.length&&(b=a.length),c=b-1;c>=0&&128===(192&a[c]);)c--;return 0>c?b:0===c?b:c+g[a[c]]>b?c:b},k=function(a){var b,c,e,f,h=a.length,i=new Array(2*h);for(c=0,b=0;h>b;)if(e=a[b++],128>e)i[c++]=e;else if(f=g[e],f>4)i[c++]=65533,b+=f-1;else{for(e&=2===f?31:3===f?15:7;f>1&&h>b;)e=e<<6|63&a[b++],f--;f>1?i[c++]=65533:65536>e?i[c++]=e:(e-=65536,i[c++]=55296|e>>10&1023,i[c++]=56320|1023&e)}return i.length!==c&&(i.subarray?i=i.subarray(0,c):i.length=c),d.applyFromCharCode(i)};c.utf8encode=function(a){return e.nodebuffer?f(a,"utf-8"):i(a)},c.utf8decode=function(a){if(e.nodebuffer)return d.transformTo("nodebuffer",a).toString("utf-8");a=d.transformTo(e.uint8array?"uint8array":"array",a);for(var b=[],c=0,f=a.length,g=65536;f>c;){var h=j(a,Math.min(c+g,f));b.push(e.uint8array?k(a.subarray(c,h)):k(a.slice(c,h))),c=h}return b.join("")}},{"./nodeBuffer":11,"./support":17,"./utils":21}],21:[function(a,b,c){"use strict";function d(a){return a}function e(a,b){for(var c=0;c<a.length;++c)b[c]=255&a.charCodeAt(c);return b}function f(a){var b=65536,d=[],e=a.length,f=c.getTypeOf(a),g=0,h=!0;try{switch(f){case"uint8array":String.fromCharCode.apply(null,new Uint8Array(0));break;case"nodebuffer":String.fromCharCode.apply(null,j(0))}}catch(i){h=!1}if(!h){for(var k="",l=0;l<a.length;l++)k+=String.fromCharCode(a[l]);return k}for(;e>g&&b>1;)try{d.push("array"===f||"nodebuffer"===f?String.fromCharCode.apply(null,a.slice(g,Math.min(g+b,e))):String.fromCharCode.apply(null,a.subarray(g,Math.min(g+b,e)))),g+=b}catch(i){b=Math.floor(b/2)}return d.join("")}function g(a,b){for(var c=0;c<a.length;c++)b[c]=a[c];return b}var h=a("./support"),i=a("./compressions"),j=a("./nodeBuffer");c.string2binary=function(a){for(var b="",c=0;c<a.length;c++)b+=String.fromCharCode(255&a.charCodeAt(c));return b},c.arrayBuffer2Blob=function(a){c.checkSupport("blob");try{return new Blob([a],{type:"application/zip"})}catch(b){try{var d=window.BlobBuilder||window.WebKitBlobBuilder||window.MozBlobBuilder||window.MSBlobBuilder,e=new d;return e.append(a),e.getBlob("application/zip")}catch(b){throw new Error("Bug : can't construct the Blob.")}}},c.applyFromCharCode=f;var k={};k.string={string:d,array:function(a){return e(a,new Array(a.length))},arraybuffer:function(a){return k.string.uint8array(a).buffer},uint8array:function(a){return e(a,new Uint8Array(a.length))},nodebuffer:function(a){return e(a,j(a.length))}},k.array={string:f,array:d,arraybuffer:function(a){return new Uint8Array(a).buffer},uint8array:function(a){return new Uint8Array(a)},nodebuffer:function(a){return j(a)}},k.arraybuffer={string:function(a){return f(new Uint8Array(a))},array:function(a){return g(new Uint8Array(a),new Array(a.byteLength))},arraybuffer:d,uint8array:function(a){return new Uint8Array(a)},nodebuffer:function(a){return j(new Uint8Array(a))}},k.uint8array={string:f,array:function(a){return g(a,new Array(a.length))},arraybuffer:function(a){return a.buffer},uint8array:d,nodebuffer:function(a){return j(a)}},k.nodebuffer={string:f,array:function(a){return g(a,new Array(a.length))},arraybuffer:function(a){return k.nodebuffer.uint8array(a).buffer},uint8array:function(a){return g(a,new Uint8Array(a.length))},nodebuffer:d},c.transformTo=function(a,b){if(b||(b=""),!a)return b;c.checkSupport(a);var d=c.getTypeOf(b),e=k[d][a](b);return e},c.getTypeOf=function(a){return"string"==typeof a?"string":"[object Array]"===Object.prototype.toString.call(a)?"array":h.nodebuffer&&j.test(a)?"nodebuffer":h.uint8array&&a instanceof Uint8Array?"uint8array":h.arraybuffer&&a instanceof ArrayBuffer?"arraybuffer":void 0},c.checkSupport=function(a){var b=h[a.toLowerCase()];if(!b)throw new Error(a+" is not supported by this browser")},c.MAX_VALUE_16BITS=65535,c.MAX_VALUE_32BITS=-1,c.pretty=function(a){var b,c,d="";for(c=0;c<(a||"").length;c++)b=a.charCodeAt(c),d+="\\x"+(16>b?"0":"")+b.toString(16).toUpperCase();return d},c.findCompression=function(a){for(var b in i)if(i.hasOwnProperty(b)&&i[b].magic===a)return i[b];return null},c.isRegExp=function(a){return"[object RegExp]"===Object.prototype.toString.call(a)}},{"./compressions":3,"./nodeBuffer":11,"./support":17}],22:[function(a,b){"use strict";function c(a,b){this.files=[],this.loadOptions=b,a&&this.load(a)}var d=a("./stringReader"),e=a("./nodeBufferReader"),f=a("./uint8ArrayReader"),g=a("./utils"),h=a("./signature"),i=a("./zipEntry"),j=a("./support"),k=a("./object");c.prototype={checkSignature:function(a){var b=this.reader.readString(4);if(b!==a)throw new Error("Corrupted zip or bug : unexpected signature ("+g.pretty(b)+", expected "+g.pretty(a)+")")},readBlockEndOfCentral:function(){this.diskNumber=this.reader.readInt(2),this.diskWithCentralDirStart=this.reader.readInt(2),this.centralDirRecordsOnThisDisk=this.reader.readInt(2),this.centralDirRecords=this.reader.readInt(2),this.centralDirSize=this.reader.readInt(4),this.centralDirOffset=this.reader.readInt(4),this.zipCommentLength=this.reader.readInt(2),this.zipComment=this.reader.readString(this.zipCommentLength),this.zipComment=k.utf8decode(this.zipComment)},readBlockZip64EndOfCentral:function(){this.zip64EndOfCentralSize=this.reader.readInt(8),this.versionMadeBy=this.reader.readString(2),this.versionNeeded=this.reader.readInt(2),this.diskNumber=this.reader.readInt(4),this.diskWithCentralDirStart=this.reader.readInt(4),this.centralDirRecordsOnThisDisk=this.reader.readInt(8),this.centralDirRecords=this.reader.readInt(8),this.centralDirSize=this.reader.readInt(8),this.centralDirOffset=this.reader.readInt(8),this.zip64ExtensibleData={};for(var a,b,c,d=this.zip64EndOfCentralSize-44,e=0;d>e;)a=this.reader.readInt(2),b=this.reader.readInt(4),c=this.reader.readString(b),this.zip64ExtensibleData[a]={id:a,length:b,value:c}},readBlockZip64EndOfCentralLocator:function(){if(this.diskWithZip64CentralDirStart=this.reader.readInt(4),this.relativeOffsetEndOfZip64CentralDir=this.reader.readInt(8),this.disksCount=this.reader.readInt(4),this.disksCount>1)throw new Error("Multi-volumes zip are not supported")},readLocalFiles:function(){var a,b;for(a=0;a<this.files.length;a++)b=this.files[a],this.reader.setIndex(b.localHeaderOffset),this.checkSignature(h.LOCAL_FILE_HEADER),b.readLocalPart(this.reader),b.handleUTF8()},readCentralDir:function(){var a;for(this.reader.setIndex(this.centralDirOffset);this.reader.readString(4)===h.CENTRAL_FILE_HEADER;)a=new i({zip64:this.zip64},this.loadOptions),a.readCentralPart(this.reader),this.files.push(a)},readEndOfCentral:function(){var a=this.reader.lastIndexOfSignature(h.CENTRAL_DIRECTORY_END);if(-1===a)throw new Error("Corrupted zip : can't find end of central directory");if(this.reader.setIndex(a),this.checkSignature(h.CENTRAL_DIRECTORY_END),this.readBlockEndOfCentral(),this.diskNumber===g.MAX_VALUE_16BITS||this.diskWithCentralDirStart===g.MAX_VALUE_16BITS||this.centralDirRecordsOnThisDisk===g.MAX_VALUE_16BITS||this.centralDirRecords===g.MAX_VALUE_16BITS||this.centralDirSize===g.MAX_VALUE_32BITS||this.centralDirOffset===g.MAX_VALUE_32BITS){if(this.zip64=!0,a=this.reader.lastIndexOfSignature(h.ZIP64_CENTRAL_DIRECTORY_LOCATOR),-1===a)throw new Error("Corrupted zip : can't find the ZIP64 end of central directory locator");this.reader.setIndex(a),this.checkSignature(h.ZIP64_CENTRAL_DIRECTORY_LOCATOR),this.readBlockZip64EndOfCentralLocator(),this.reader.setIndex(this.relativeOffsetEndOfZip64CentralDir),this.checkSignature(h.ZIP64_CENTRAL_DIRECTORY_END),this.readBlockZip64EndOfCentral()}},prepareReader:function(a){var b=g.getTypeOf(a);this.reader="string"!==b||j.uint8array?"nodebuffer"===b?new e(a):new f(g.transformTo("uint8array",a)):new d(a,this.loadOptions.optimizedBinaryString)},load:function(a){this.prepareReader(a),this.readEndOfCentral(),this.readCentralDir(),this.readLocalFiles()}},b.exports=c},{"./nodeBufferReader":12,"./object":13,"./signature":14,"./stringReader":15,"./support":17,"./uint8ArrayReader":18,"./utils":21,"./zipEntry":23}],23:[function(a,b){"use strict";function c(a,b){this.options=a,this.loadOptions=b}var d=a("./stringReader"),e=a("./utils"),f=a("./compressedObject"),g=a("./object");c.prototype={isEncrypted:function(){return 1===(1&this.bitFlag)},useUTF8:function(){return 2048===(2048&this.bitFlag)},prepareCompressedContent:function(a,b,c){return function(){var d=a.index;a.setIndex(b);var e=a.readData(c);return a.setIndex(d),e}},prepareContent:function(a,b,c,d,f){return function(){var a=e.transformTo(d.uncompressInputType,this.getCompressedContent()),b=d.uncompress(a);if(b.length!==f)throw new Error("Bug : uncompressed data size mismatch");return b}},readLocalPart:function(a){var b,c;if(a.skip(22),this.fileNameLength=a.readInt(2),c=a.readInt(2),this.fileName=a.readString(this.fileNameLength),a.skip(c),-1==this.compressedSize||-1==this.uncompressedSize)throw new Error("Bug or corrupted zip : didn't get enough informations from the central directory (compressedSize == -1 || uncompressedSize == -1)");if(b=e.findCompression(this.compressionMethod),null===b)throw new Error("Corrupted zip : compression "+e.pretty(this.compressionMethod)+" unknown (inner file : "+this.fileName+")");if(this.decompressed=new f,this.decompressed.compressedSize=this.compressedSize,this.decompressed.uncompressedSize=this.uncompressedSize,this.decompressed.crc32=this.crc32,this.decompressed.compressionMethod=this.compressionMethod,this.decompressed.getCompressedContent=this.prepareCompressedContent(a,a.index,this.compressedSize,b),this.decompressed.getContent=this.prepareContent(a,a.index,this.compressedSize,b,this.uncompressedSize),this.loadOptions.checkCRC32&&(this.decompressed=e.transformTo("string",this.decompressed.getContent()),g.crc32(this.decompressed)!==this.crc32))throw new Error("Corrupted zip : CRC32 mismatch")},readCentralPart:function(a){if(this.versionMadeBy=a.readString(2),this.versionNeeded=a.readInt(2),this.bitFlag=a.readInt(2),this.compressionMethod=a.readString(2),this.date=a.readDate(),this.crc32=a.readInt(4),this.compressedSize=a.readInt(4),this.uncompressedSize=a.readInt(4),this.fileNameLength=a.readInt(2),this.extraFieldsLength=a.readInt(2),this.fileCommentLength=a.readInt(2),this.diskNumberStart=a.readInt(2),this.internalFileAttributes=a.readInt(2),this.externalFileAttributes=a.readInt(4),this.localHeaderOffset=a.readInt(4),this.isEncrypted())throw new Error("Encrypted zip are not supported");this.fileName=a.readString(this.fileNameLength),this.readExtraFields(a),this.parseZIP64ExtraField(a),this.fileComment=a.readString(this.fileCommentLength),this.dir=16&this.externalFileAttributes?!0:!1},parseZIP64ExtraField:function(){if(this.extraFields[1]){var a=new d(this.extraFields[1].value);this.uncompressedSize===e.MAX_VALUE_32BITS&&(this.uncompressedSize=a.readInt(8)),this.compressedSize===e.MAX_VALUE_32BITS&&(this.compressedSize=a.readInt(8)),this.localHeaderOffset===e.MAX_VALUE_32BITS&&(this.localHeaderOffset=a.readInt(8)),this.diskNumberStart===e.MAX_VALUE_32BITS&&(this.diskNumberStart=a.readInt(4))}},readExtraFields:function(a){var b,c,d,e=a.index;for(this.extraFields=this.extraFields||{};a.index<e+this.extraFieldsLength;)b=a.readInt(2),c=a.readInt(2),d=a.readString(c),this.extraFields[b]={id:b,length:c,value:d}},handleUTF8:function(){if(this.useUTF8())this.fileName=g.utf8decode(this.fileName),this.fileComment=g.utf8decode(this.fileComment);else{var a=this.findExtraFieldUnicodePath();null!==a&&(this.fileName=a);var b=this.findExtraFieldUnicodeComment();null!==b&&(this.fileComment=b)}},findExtraFieldUnicodePath:function(){var a=this.extraFields[28789];if(a){var b=new d(a.value);return 1!==b.readInt(1)?null:g.crc32(this.fileName)!==b.readInt(4)?null:g.utf8decode(b.readString(a.length-5))}return null},findExtraFieldUnicodeComment:function(){var a=this.extraFields[25461];if(a){var b=new d(a.value);return 1!==b.readInt(1)?null:g.crc32(this.fileComment)!==b.readInt(4)?null:g.utf8decode(b.readString(a.length-5))}return null}},b.exports=c},{"./compressedObject":2,"./object":13,"./stringReader":15,"./utils":21}],24:[function(a,b){"use strict";var c=a("./lib/utils/common").assign,d=a("./lib/deflate"),e=a("./lib/inflate"),f=a("./lib/zlib/constants"),g={};c(g,d,e,f),b.exports=g},{"./lib/deflate":25,"./lib/inflate":26,"./lib/utils/common":27,"./lib/zlib/constants":30}],25:[function(a,b,c){"use strict";function d(a,b){var c=new s(b);if(c.push(a,!0),c.err)throw c.msg;return c.result}function e(a,b){return b=b||{},b.raw=!0,d(a,b)}function f(a,b){return b=b||{},b.gzip=!0,d(a,b)}var g=a("./zlib/deflate.js"),h=a("./utils/common"),i=a("./utils/strings"),j=a("./zlib/messages"),k=a("./zlib/zstream"),l=0,m=4,n=0,o=1,p=-1,q=0,r=8,s=function(a){this.options=h.assign({level:p,method:r,chunkSize:16384,windowBits:15,memLevel:8,strategy:q,to:""},a||{});var b=this.options;b.raw&&b.windowBits>0?b.windowBits=-b.windowBits:b.gzip&&b.windowBits>0&&b.windowBits<16&&(b.windowBits+=16),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new k,this.strm.avail_out=0;var c=g.deflateInit2(this.strm,b.level,b.method,b.windowBits,b.memLevel,b.strategy);if(c!==n)throw new Error(j[c]);b.header&&g.deflateSetHeader(this.strm,b.header)
};s.prototype.push=function(a,b){var c,d,e=this.strm,f=this.options.chunkSize;if(this.ended)return!1;d=b===~~b?b:b===!0?m:l,e.input="string"==typeof a?i.string2buf(a):a,e.next_in=0,e.avail_in=e.input.length;do{if(0===e.avail_out&&(e.output=new h.Buf8(f),e.next_out=0,e.avail_out=f),c=g.deflate(e,d),c!==o&&c!==n)return this.onEnd(c),this.ended=!0,!1;(0===e.avail_out||0===e.avail_in&&d===m)&&this.onData("string"===this.options.to?i.buf2binstring(h.shrinkBuf(e.output,e.next_out)):h.shrinkBuf(e.output,e.next_out))}while((e.avail_in>0||0===e.avail_out)&&c!==o);return d===m?(c=g.deflateEnd(this.strm),this.onEnd(c),this.ended=!0,c===n):!0},s.prototype.onData=function(a){this.chunks.push(a)},s.prototype.onEnd=function(a){a===n&&(this.result="string"===this.options.to?this.chunks.join(""):h.flattenChunks(this.chunks)),this.chunks=[],this.err=a,this.msg=this.strm.msg},c.Deflate=s,c.deflate=d,c.deflateRaw=e,c.gzip=f},{"./utils/common":27,"./utils/strings":28,"./zlib/deflate.js":32,"./zlib/messages":37,"./zlib/zstream":39}],26:[function(a,b,c){"use strict";function d(a,b){var c=new m(b);if(c.push(a,!0),c.err)throw c.msg;return c.result}function e(a,b){return b=b||{},b.raw=!0,d(a,b)}var f=a("./zlib/inflate.js"),g=a("./utils/common"),h=a("./utils/strings"),i=a("./zlib/constants"),j=a("./zlib/messages"),k=a("./zlib/zstream"),l=a("./zlib/gzheader"),m=function(a){this.options=g.assign({chunkSize:16384,windowBits:0,to:""},a||{});var b=this.options;b.raw&&b.windowBits>=0&&b.windowBits<16&&(b.windowBits=-b.windowBits,0===b.windowBits&&(b.windowBits=-15)),!(b.windowBits>=0&&b.windowBits<16)||a&&a.windowBits||(b.windowBits+=32),b.windowBits>15&&b.windowBits<48&&0===(15&b.windowBits)&&(b.windowBits|=15),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new k,this.strm.avail_out=0;var c=f.inflateInit2(this.strm,b.windowBits);if(c!==i.Z_OK)throw new Error(j[c]);this.header=new l,f.inflateGetHeader(this.strm,this.header)};m.prototype.push=function(a,b){var c,d,e,j,k,l=this.strm,m=this.options.chunkSize;if(this.ended)return!1;d=b===~~b?b:b===!0?i.Z_FINISH:i.Z_NO_FLUSH,l.input="string"==typeof a?h.binstring2buf(a):a,l.next_in=0,l.avail_in=l.input.length;do{if(0===l.avail_out&&(l.output=new g.Buf8(m),l.next_out=0,l.avail_out=m),c=f.inflate(l,i.Z_NO_FLUSH),c!==i.Z_STREAM_END&&c!==i.Z_OK)return this.onEnd(c),this.ended=!0,!1;l.next_out&&(0===l.avail_out||c===i.Z_STREAM_END||0===l.avail_in&&d===i.Z_FINISH)&&("string"===this.options.to?(e=h.utf8border(l.output,l.next_out),j=l.next_out-e,k=h.buf2string(l.output,e),l.next_out=j,l.avail_out=m-j,j&&g.arraySet(l.output,l.output,e,j,0),this.onData(k)):this.onData(g.shrinkBuf(l.output,l.next_out)))}while(l.avail_in>0&&c!==i.Z_STREAM_END);return c===i.Z_STREAM_END&&(d=i.Z_FINISH),d===i.Z_FINISH?(c=f.inflateEnd(this.strm),this.onEnd(c),this.ended=!0,c===i.Z_OK):!0},m.prototype.onData=function(a){this.chunks.push(a)},m.prototype.onEnd=function(a){a===i.Z_OK&&(this.result="string"===this.options.to?this.chunks.join(""):g.flattenChunks(this.chunks)),this.chunks=[],this.err=a,this.msg=this.strm.msg},c.Inflate=m,c.inflate=d,c.inflateRaw=e,c.ungzip=d},{"./utils/common":27,"./utils/strings":28,"./zlib/constants":30,"./zlib/gzheader":33,"./zlib/inflate.js":35,"./zlib/messages":37,"./zlib/zstream":39}],27:[function(a,b,c){"use strict";var d="undefined"!=typeof Uint8Array&&"undefined"!=typeof Uint16Array&&"undefined"!=typeof Int32Array;c.assign=function(a){for(var b=Array.prototype.slice.call(arguments,1);b.length;){var c=b.shift();if(c){if("object"!=typeof c)throw new TypeError(c+"must be non-object");for(var d in c)c.hasOwnProperty(d)&&(a[d]=c[d])}}return a},c.shrinkBuf=function(a,b){return a.length===b?a:a.subarray?a.subarray(0,b):(a.length=b,a)};var e={arraySet:function(a,b,c,d,e){if(b.subarray&&a.subarray)return void a.set(b.subarray(c,c+d),e);for(var f=0;d>f;f++)a[e+f]=b[c+f]},flattenChunks:function(a){var b,c,d,e,f,g;for(d=0,b=0,c=a.length;c>b;b++)d+=a[b].length;for(g=new Uint8Array(d),e=0,b=0,c=a.length;c>b;b++)f=a[b],g.set(f,e),e+=f.length;return g}},f={arraySet:function(a,b,c,d,e){for(var f=0;d>f;f++)a[e+f]=b[c+f]},flattenChunks:function(a){return[].concat.apply([],a)}};c.setTyped=function(a){a?(c.Buf8=Uint8Array,c.Buf16=Uint16Array,c.Buf32=Int32Array,c.assign(c,e)):(c.Buf8=Array,c.Buf16=Array,c.Buf32=Array,c.assign(c,f))},c.setTyped(d)},{}],28:[function(a,b,c){"use strict";function d(a,b){if(65537>b&&(a.subarray&&g||!a.subarray&&f))return String.fromCharCode.apply(null,e.shrinkBuf(a,b));for(var c="",d=0;b>d;d++)c+=String.fromCharCode(a[d]);return c}var e=a("./common"),f=!0,g=!0;try{String.fromCharCode.apply(null,[0])}catch(h){f=!1}try{String.fromCharCode.apply(null,new Uint8Array(1))}catch(h){g=!1}for(var i=new e.Buf8(256),j=0;256>j;j++)i[j]=j>=252?6:j>=248?5:j>=240?4:j>=224?3:j>=192?2:1;i[254]=i[254]=1,c.string2buf=function(a){var b,c,d,f,g,h=a.length,i=0;for(f=0;h>f;f++)c=a.charCodeAt(f),55296===(64512&c)&&h>f+1&&(d=a.charCodeAt(f+1),56320===(64512&d)&&(c=65536+(c-55296<<10)+(d-56320),f++)),i+=128>c?1:2048>c?2:65536>c?3:4;for(b=new e.Buf8(i),g=0,f=0;i>g;f++)c=a.charCodeAt(f),55296===(64512&c)&&h>f+1&&(d=a.charCodeAt(f+1),56320===(64512&d)&&(c=65536+(c-55296<<10)+(d-56320),f++)),128>c?b[g++]=c:2048>c?(b[g++]=192|c>>>6,b[g++]=128|63&c):65536>c?(b[g++]=224|c>>>12,b[g++]=128|c>>>6&63,b[g++]=128|63&c):(b[g++]=240|c>>>18,b[g++]=128|c>>>12&63,b[g++]=128|c>>>6&63,b[g++]=128|63&c);return b},c.buf2binstring=function(a){return d(a,a.length)},c.binstring2buf=function(a){for(var b=new e.Buf8(a.length),c=0,d=b.length;d>c;c++)b[c]=a.charCodeAt(c);return b},c.buf2string=function(a,b){var c,e,f,g,h=b||a.length,j=new Array(2*h);for(e=0,c=0;h>c;)if(f=a[c++],128>f)j[e++]=f;else if(g=i[f],g>4)j[e++]=65533,c+=g-1;else{for(f&=2===g?31:3===g?15:7;g>1&&h>c;)f=f<<6|63&a[c++],g--;g>1?j[e++]=65533:65536>f?j[e++]=f:(f-=65536,j[e++]=55296|f>>10&1023,j[e++]=56320|1023&f)}return d(j,e)},c.utf8border=function(a,b){var c;for(b=b||a.length,b>a.length&&(b=a.length),c=b-1;c>=0&&128===(192&a[c]);)c--;return 0>c?b:0===c?b:c+i[a[c]]>b?c:b}},{"./common":27}],29:[function(a,b){"use strict";function c(a,b,c,d){for(var e=65535&a|0,f=a>>>16&65535|0,g=0;0!==c;){g=c>2e3?2e3:c,c-=g;do e=e+b[d++]|0,f=f+e|0;while(--g);e%=65521,f%=65521}return e|f<<16|0}b.exports=c},{}],30:[function(a,b){b.exports={Z_NO_FLUSH:0,Z_PARTIAL_FLUSH:1,Z_SYNC_FLUSH:2,Z_FULL_FLUSH:3,Z_FINISH:4,Z_BLOCK:5,Z_TREES:6,Z_OK:0,Z_STREAM_END:1,Z_NEED_DICT:2,Z_ERRNO:-1,Z_STREAM_ERROR:-2,Z_DATA_ERROR:-3,Z_BUF_ERROR:-5,Z_NO_COMPRESSION:0,Z_BEST_SPEED:1,Z_BEST_COMPRESSION:9,Z_DEFAULT_COMPRESSION:-1,Z_FILTERED:1,Z_HUFFMAN_ONLY:2,Z_RLE:3,Z_FIXED:4,Z_DEFAULT_STRATEGY:0,Z_BINARY:0,Z_TEXT:1,Z_UNKNOWN:2,Z_DEFLATED:8}},{}],31:[function(a,b){"use strict";function c(){for(var a,b=[],c=0;256>c;c++){a=c;for(var d=0;8>d;d++)a=1&a?3988292384^a>>>1:a>>>1;b[c]=a}return b}function d(a,b,c,d){var f=e,g=d+c;a=-1^a;for(var h=d;g>h;h++)a=a>>>8^f[255&(a^b[h])];return-1^a}var e=c();b.exports=d},{}],32:[function(a,b,c){"use strict";function d(a,b){return a.msg=G[b],b}function e(a){return(a<<1)-(a>4?9:0)}function f(a){for(var b=a.length;--b>=0;)a[b]=0}function g(a){var b=a.state,c=b.pending;c>a.avail_out&&(c=a.avail_out),0!==c&&(C.arraySet(a.output,b.pending_buf,b.pending_out,c,a.next_out),a.next_out+=c,b.pending_out+=c,a.total_out+=c,a.avail_out-=c,b.pending-=c,0===b.pending&&(b.pending_out=0))}function h(a,b){D._tr_flush_block(a,a.block_start>=0?a.block_start:-1,a.strstart-a.block_start,b),a.block_start=a.strstart,g(a.strm)}function i(a,b){a.pending_buf[a.pending++]=b}function j(a,b){a.pending_buf[a.pending++]=b>>>8&255,a.pending_buf[a.pending++]=255&b}function k(a,b,c,d){var e=a.avail_in;return e>d&&(e=d),0===e?0:(a.avail_in-=e,C.arraySet(b,a.input,a.next_in,e,c),1===a.state.wrap?a.adler=E(a.adler,b,e,c):2===a.state.wrap&&(a.adler=F(a.adler,b,e,c)),a.next_in+=e,a.total_in+=e,e)}function l(a,b){var c,d,e=a.max_chain_length,f=a.strstart,g=a.prev_length,h=a.nice_match,i=a.strstart>a.w_size-jb?a.strstart-(a.w_size-jb):0,j=a.window,k=a.w_mask,l=a.prev,m=a.strstart+ib,n=j[f+g-1],o=j[f+g];a.prev_length>=a.good_match&&(e>>=2),h>a.lookahead&&(h=a.lookahead);do if(c=b,j[c+g]===o&&j[c+g-1]===n&&j[c]===j[f]&&j[++c]===j[f+1]){f+=2,c++;do;while(j[++f]===j[++c]&&j[++f]===j[++c]&&j[++f]===j[++c]&&j[++f]===j[++c]&&j[++f]===j[++c]&&j[++f]===j[++c]&&j[++f]===j[++c]&&j[++f]===j[++c]&&m>f);if(d=ib-(m-f),f=m-ib,d>g){if(a.match_start=b,g=d,d>=h)break;n=j[f+g-1],o=j[f+g]}}while((b=l[b&k])>i&&0!==--e);return g<=a.lookahead?g:a.lookahead}function m(a){var b,c,d,e,f,g=a.w_size;do{if(e=a.window_size-a.lookahead-a.strstart,a.strstart>=g+(g-jb)){C.arraySet(a.window,a.window,g,g,0),a.match_start-=g,a.strstart-=g,a.block_start-=g,c=a.hash_size,b=c;do d=a.head[--b],a.head[b]=d>=g?d-g:0;while(--c);c=g,b=c;do d=a.prev[--b],a.prev[b]=d>=g?d-g:0;while(--c);e+=g}if(0===a.strm.avail_in)break;if(c=k(a.strm,a.window,a.strstart+a.lookahead,e),a.lookahead+=c,a.lookahead+a.insert>=hb)for(f=a.strstart-a.insert,a.ins_h=a.window[f],a.ins_h=(a.ins_h<<a.hash_shift^a.window[f+1])&a.hash_mask;a.insert&&(a.ins_h=(a.ins_h<<a.hash_shift^a.window[f+hb-1])&a.hash_mask,a.prev[f&a.w_mask]=a.head[a.ins_h],a.head[a.ins_h]=f,f++,a.insert--,!(a.lookahead+a.insert<hb)););}while(a.lookahead<jb&&0!==a.strm.avail_in)}function n(a,b){var c=65535;for(c>a.pending_buf_size-5&&(c=a.pending_buf_size-5);;){if(a.lookahead<=1){if(m(a),0===a.lookahead&&b===H)return sb;if(0===a.lookahead)break}a.strstart+=a.lookahead,a.lookahead=0;var d=a.block_start+c;if((0===a.strstart||a.strstart>=d)&&(a.lookahead=a.strstart-d,a.strstart=d,h(a,!1),0===a.strm.avail_out))return sb;if(a.strstart-a.block_start>=a.w_size-jb&&(h(a,!1),0===a.strm.avail_out))return sb}return a.insert=0,b===K?(h(a,!0),0===a.strm.avail_out?ub:vb):a.strstart>a.block_start&&(h(a,!1),0===a.strm.avail_out)?sb:sb}function o(a,b){for(var c,d;;){if(a.lookahead<jb){if(m(a),a.lookahead<jb&&b===H)return sb;if(0===a.lookahead)break}if(c=0,a.lookahead>=hb&&(a.ins_h=(a.ins_h<<a.hash_shift^a.window[a.strstart+hb-1])&a.hash_mask,c=a.prev[a.strstart&a.w_mask]=a.head[a.ins_h],a.head[a.ins_h]=a.strstart),0!==c&&a.strstart-c<=a.w_size-jb&&(a.match_length=l(a,c)),a.match_length>=hb)if(d=D._tr_tally(a,a.strstart-a.match_start,a.match_length-hb),a.lookahead-=a.match_length,a.match_length<=a.max_lazy_match&&a.lookahead>=hb){a.match_length--;do a.strstart++,a.ins_h=(a.ins_h<<a.hash_shift^a.window[a.strstart+hb-1])&a.hash_mask,c=a.prev[a.strstart&a.w_mask]=a.head[a.ins_h],a.head[a.ins_h]=a.strstart;while(0!==--a.match_length);a.strstart++}else a.strstart+=a.match_length,a.match_length=0,a.ins_h=a.window[a.strstart],a.ins_h=(a.ins_h<<a.hash_shift^a.window[a.strstart+1])&a.hash_mask;else d=D._tr_tally(a,0,a.window[a.strstart]),a.lookahead--,a.strstart++;if(d&&(h(a,!1),0===a.strm.avail_out))return sb}return a.insert=a.strstart<hb-1?a.strstart:hb-1,b===K?(h(a,!0),0===a.strm.avail_out?ub:vb):a.last_lit&&(h(a,!1),0===a.strm.avail_out)?sb:tb}function p(a,b){for(var c,d,e;;){if(a.lookahead<jb){if(m(a),a.lookahead<jb&&b===H)return sb;if(0===a.lookahead)break}if(c=0,a.lookahead>=hb&&(a.ins_h=(a.ins_h<<a.hash_shift^a.window[a.strstart+hb-1])&a.hash_mask,c=a.prev[a.strstart&a.w_mask]=a.head[a.ins_h],a.head[a.ins_h]=a.strstart),a.prev_length=a.match_length,a.prev_match=a.match_start,a.match_length=hb-1,0!==c&&a.prev_length<a.max_lazy_match&&a.strstart-c<=a.w_size-jb&&(a.match_length=l(a,c),a.match_length<=5&&(a.strategy===S||a.match_length===hb&&a.strstart-a.match_start>4096)&&(a.match_length=hb-1)),a.prev_length>=hb&&a.match_length<=a.prev_length){e=a.strstart+a.lookahead-hb,d=D._tr_tally(a,a.strstart-1-a.prev_match,a.prev_length-hb),a.lookahead-=a.prev_length-1,a.prev_length-=2;do++a.strstart<=e&&(a.ins_h=(a.ins_h<<a.hash_shift^a.window[a.strstart+hb-1])&a.hash_mask,c=a.prev[a.strstart&a.w_mask]=a.head[a.ins_h],a.head[a.ins_h]=a.strstart);while(0!==--a.prev_length);if(a.match_available=0,a.match_length=hb-1,a.strstart++,d&&(h(a,!1),0===a.strm.avail_out))return sb}else if(a.match_available){if(d=D._tr_tally(a,0,a.window[a.strstart-1]),d&&h(a,!1),a.strstart++,a.lookahead--,0===a.strm.avail_out)return sb}else a.match_available=1,a.strstart++,a.lookahead--}return a.match_available&&(d=D._tr_tally(a,0,a.window[a.strstart-1]),a.match_available=0),a.insert=a.strstart<hb-1?a.strstart:hb-1,b===K?(h(a,!0),0===a.strm.avail_out?ub:vb):a.last_lit&&(h(a,!1),0===a.strm.avail_out)?sb:tb}function q(a,b){for(var c,d,e,f,g=a.window;;){if(a.lookahead<=ib){if(m(a),a.lookahead<=ib&&b===H)return sb;if(0===a.lookahead)break}if(a.match_length=0,a.lookahead>=hb&&a.strstart>0&&(e=a.strstart-1,d=g[e],d===g[++e]&&d===g[++e]&&d===g[++e])){f=a.strstart+ib;do;while(d===g[++e]&&d===g[++e]&&d===g[++e]&&d===g[++e]&&d===g[++e]&&d===g[++e]&&d===g[++e]&&d===g[++e]&&f>e);a.match_length=ib-(f-e),a.match_length>a.lookahead&&(a.match_length=a.lookahead)}if(a.match_length>=hb?(c=D._tr_tally(a,1,a.match_length-hb),a.lookahead-=a.match_length,a.strstart+=a.match_length,a.match_length=0):(c=D._tr_tally(a,0,a.window[a.strstart]),a.lookahead--,a.strstart++),c&&(h(a,!1),0===a.strm.avail_out))return sb}return a.insert=0,b===K?(h(a,!0),0===a.strm.avail_out?ub:vb):a.last_lit&&(h(a,!1),0===a.strm.avail_out)?sb:tb}function r(a,b){for(var c;;){if(0===a.lookahead&&(m(a),0===a.lookahead)){if(b===H)return sb;break}if(a.match_length=0,c=D._tr_tally(a,0,a.window[a.strstart]),a.lookahead--,a.strstart++,c&&(h(a,!1),0===a.strm.avail_out))return sb}return a.insert=0,b===K?(h(a,!0),0===a.strm.avail_out?ub:vb):a.last_lit&&(h(a,!1),0===a.strm.avail_out)?sb:tb}function s(a){a.window_size=2*a.w_size,f(a.head),a.max_lazy_match=B[a.level].max_lazy,a.good_match=B[a.level].good_length,a.nice_match=B[a.level].nice_length,a.max_chain_length=B[a.level].max_chain,a.strstart=0,a.block_start=0,a.lookahead=0,a.insert=0,a.match_length=a.prev_length=hb-1,a.match_available=0,a.ins_h=0}function t(){this.strm=null,this.status=0,this.pending_buf=null,this.pending_buf_size=0,this.pending_out=0,this.pending=0,this.wrap=0,this.gzhead=null,this.gzindex=0,this.method=Y,this.last_flush=-1,this.w_size=0,this.w_bits=0,this.w_mask=0,this.window=null,this.window_size=0,this.prev=null,this.head=null,this.ins_h=0,this.hash_size=0,this.hash_bits=0,this.hash_mask=0,this.hash_shift=0,this.block_start=0,this.match_length=0,this.prev_match=0,this.match_available=0,this.strstart=0,this.match_start=0,this.lookahead=0,this.prev_length=0,this.max_chain_length=0,this.max_lazy_match=0,this.level=0,this.strategy=0,this.good_match=0,this.nice_match=0,this.dyn_ltree=new C.Buf16(2*fb),this.dyn_dtree=new C.Buf16(2*(2*db+1)),this.bl_tree=new C.Buf16(2*(2*eb+1)),f(this.dyn_ltree),f(this.dyn_dtree),f(this.bl_tree),this.l_desc=null,this.d_desc=null,this.bl_desc=null,this.bl_count=new C.Buf16(gb+1),this.heap=new C.Buf16(2*cb+1),f(this.heap),this.heap_len=0,this.heap_max=0,this.depth=new C.Buf16(2*cb+1),f(this.depth),this.l_buf=0,this.lit_bufsize=0,this.last_lit=0,this.d_buf=0,this.opt_len=0,this.static_len=0,this.matches=0,this.insert=0,this.bi_buf=0,this.bi_valid=0}function u(a){var b;return a&&a.state?(a.total_in=a.total_out=0,a.data_type=X,b=a.state,b.pending=0,b.pending_out=0,b.wrap<0&&(b.wrap=-b.wrap),b.status=b.wrap?lb:qb,a.adler=2===b.wrap?0:1,b.last_flush=H,D._tr_init(b),M):d(a,O)}function v(a){var b=u(a);return b===M&&s(a.state),b}function w(a,b){return a&&a.state?2!==a.state.wrap?O:(a.state.gzhead=b,M):O}function x(a,b,c,e,f,g){if(!a)return O;var h=1;if(b===R&&(b=6),0>e?(h=0,e=-e):e>15&&(h=2,e-=16),1>f||f>Z||c!==Y||8>e||e>15||0>b||b>9||0>g||g>V)return d(a,O);8===e&&(e=9);var i=new t;return a.state=i,i.strm=a,i.wrap=h,i.gzhead=null,i.w_bits=e,i.w_size=1<<i.w_bits,i.w_mask=i.w_size-1,i.hash_bits=f+7,i.hash_size=1<<i.hash_bits,i.hash_mask=i.hash_size-1,i.hash_shift=~~((i.hash_bits+hb-1)/hb),i.window=new C.Buf8(2*i.w_size),i.head=new C.Buf16(i.hash_size),i.prev=new C.Buf16(i.w_size),i.lit_bufsize=1<<f+6,i.pending_buf_size=4*i.lit_bufsize,i.pending_buf=new C.Buf8(i.pending_buf_size),i.d_buf=i.lit_bufsize>>1,i.l_buf=3*i.lit_bufsize,i.level=b,i.strategy=g,i.method=c,v(a)}function y(a,b){return x(a,b,Y,$,_,W)}function z(a,b){var c,h,k,l;if(!a||!a.state||b>L||0>b)return a?d(a,O):O;if(h=a.state,!a.output||!a.input&&0!==a.avail_in||h.status===rb&&b!==K)return d(a,0===a.avail_out?Q:O);if(h.strm=a,c=h.last_flush,h.last_flush=b,h.status===lb)if(2===h.wrap)a.adler=0,i(h,31),i(h,139),i(h,8),h.gzhead?(i(h,(h.gzhead.text?1:0)+(h.gzhead.hcrc?2:0)+(h.gzhead.extra?4:0)+(h.gzhead.name?8:0)+(h.gzhead.comment?16:0)),i(h,255&h.gzhead.time),i(h,h.gzhead.time>>8&255),i(h,h.gzhead.time>>16&255),i(h,h.gzhead.time>>24&255),i(h,9===h.level?2:h.strategy>=T||h.level<2?4:0),i(h,255&h.gzhead.os),h.gzhead.extra&&h.gzhead.extra.length&&(i(h,255&h.gzhead.extra.length),i(h,h.gzhead.extra.length>>8&255)),h.gzhead.hcrc&&(a.adler=F(a.adler,h.pending_buf,h.pending,0)),h.gzindex=0,h.status=mb):(i(h,0),i(h,0),i(h,0),i(h,0),i(h,0),i(h,9===h.level?2:h.strategy>=T||h.level<2?4:0),i(h,wb),h.status=qb);else{var m=Y+(h.w_bits-8<<4)<<8,n=-1;n=h.strategy>=T||h.level<2?0:h.level<6?1:6===h.level?2:3,m|=n<<6,0!==h.strstart&&(m|=kb),m+=31-m%31,h.status=qb,j(h,m),0!==h.strstart&&(j(h,a.adler>>>16),j(h,65535&a.adler)),a.adler=1}if(h.status===mb)if(h.gzhead.extra){for(k=h.pending;h.gzindex<(65535&h.gzhead.extra.length)&&(h.pending!==h.pending_buf_size||(h.gzhead.hcrc&&h.pending>k&&(a.adler=F(a.adler,h.pending_buf,h.pending-k,k)),g(a),k=h.pending,h.pending!==h.pending_buf_size));)i(h,255&h.gzhead.extra[h.gzindex]),h.gzindex++;h.gzhead.hcrc&&h.pending>k&&(a.adler=F(a.adler,h.pending_buf,h.pending-k,k)),h.gzindex===h.gzhead.extra.length&&(h.gzindex=0,h.status=nb)}else h.status=nb;if(h.status===nb)if(h.gzhead.name){k=h.pending;do{if(h.pending===h.pending_buf_size&&(h.gzhead.hcrc&&h.pending>k&&(a.adler=F(a.adler,h.pending_buf,h.pending-k,k)),g(a),k=h.pending,h.pending===h.pending_buf_size)){l=1;break}l=h.gzindex<h.gzhead.name.length?255&h.gzhead.name.charCodeAt(h.gzindex++):0,i(h,l)}while(0!==l);h.gzhead.hcrc&&h.pending>k&&(a.adler=F(a.adler,h.pending_buf,h.pending-k,k)),0===l&&(h.gzindex=0,h.status=ob)}else h.status=ob;if(h.status===ob)if(h.gzhead.comment){k=h.pending;do{if(h.pending===h.pending_buf_size&&(h.gzhead.hcrc&&h.pending>k&&(a.adler=F(a.adler,h.pending_buf,h.pending-k,k)),g(a),k=h.pending,h.pending===h.pending_buf_size)){l=1;break}l=h.gzindex<h.gzhead.comment.length?255&h.gzhead.comment.charCodeAt(h.gzindex++):0,i(h,l)}while(0!==l);h.gzhead.hcrc&&h.pending>k&&(a.adler=F(a.adler,h.pending_buf,h.pending-k,k)),0===l&&(h.status=pb)}else h.status=pb;if(h.status===pb&&(h.gzhead.hcrc?(h.pending+2>h.pending_buf_size&&g(a),h.pending+2<=h.pending_buf_size&&(i(h,255&a.adler),i(h,a.adler>>8&255),a.adler=0,h.status=qb)):h.status=qb),0!==h.pending){if(g(a),0===a.avail_out)return h.last_flush=-1,M}else if(0===a.avail_in&&e(b)<=e(c)&&b!==K)return d(a,Q);if(h.status===rb&&0!==a.avail_in)return d(a,Q);if(0!==a.avail_in||0!==h.lookahead||b!==H&&h.status!==rb){var o=h.strategy===T?r(h,b):h.strategy===U?q(h,b):B[h.level].func(h,b);if((o===ub||o===vb)&&(h.status=rb),o===sb||o===ub)return 0===a.avail_out&&(h.last_flush=-1),M;if(o===tb&&(b===I?D._tr_align(h):b!==L&&(D._tr_stored_block(h,0,0,!1),b===J&&(f(h.head),0===h.lookahead&&(h.strstart=0,h.block_start=0,h.insert=0))),g(a),0===a.avail_out))return h.last_flush=-1,M}return b!==K?M:h.wrap<=0?N:(2===h.wrap?(i(h,255&a.adler),i(h,a.adler>>8&255),i(h,a.adler>>16&255),i(h,a.adler>>24&255),i(h,255&a.total_in),i(h,a.total_in>>8&255),i(h,a.total_in>>16&255),i(h,a.total_in>>24&255)):(j(h,a.adler>>>16),j(h,65535&a.adler)),g(a),h.wrap>0&&(h.wrap=-h.wrap),0!==h.pending?M:N)}function A(a){var b;return a&&a.state?(b=a.state.status,b!==lb&&b!==mb&&b!==nb&&b!==ob&&b!==pb&&b!==qb&&b!==rb?d(a,O):(a.state=null,b===qb?d(a,P):M)):O}var B,C=a("../utils/common"),D=a("./trees"),E=a("./adler32"),F=a("./crc32"),G=a("./messages"),H=0,I=1,J=3,K=4,L=5,M=0,N=1,O=-2,P=-3,Q=-5,R=-1,S=1,T=2,U=3,V=4,W=0,X=2,Y=8,Z=9,$=15,_=8,ab=29,bb=256,cb=bb+1+ab,db=30,eb=19,fb=2*cb+1,gb=15,hb=3,ib=258,jb=ib+hb+1,kb=32,lb=42,mb=69,nb=73,ob=91,pb=103,qb=113,rb=666,sb=1,tb=2,ub=3,vb=4,wb=3,xb=function(a,b,c,d,e){this.good_length=a,this.max_lazy=b,this.nice_length=c,this.max_chain=d,this.func=e};B=[new xb(0,0,0,0,n),new xb(4,4,8,4,o),new xb(4,5,16,8,o),new xb(4,6,32,32,o),new xb(4,4,16,16,p),new xb(8,16,32,32,p),new xb(8,16,128,128,p),new xb(8,32,128,256,p),new xb(32,128,258,1024,p),new xb(32,258,258,4096,p)],c.deflateInit=y,c.deflateInit2=x,c.deflateReset=v,c.deflateResetKeep=u,c.deflateSetHeader=w,c.deflate=z,c.deflateEnd=A,c.deflateInfo="pako deflate (from Nodeca project)"},{"../utils/common":27,"./adler32":29,"./crc32":31,"./messages":37,"./trees":38}],33:[function(a,b){"use strict";function c(){this.text=0,this.time=0,this.xflags=0,this.os=0,this.extra=null,this.extra_len=0,this.name="",this.comment="",this.hcrc=0,this.done=!1}b.exports=c},{}],34:[function(a,b){"use strict";var c=30,d=12;b.exports=function(a,b){var e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,A,B,C;e=a.state,f=a.next_in,B=a.input,g=f+(a.avail_in-5),h=a.next_out,C=a.output,i=h-(b-a.avail_out),j=h+(a.avail_out-257),k=e.dmax,l=e.wsize,m=e.whave,n=e.wnext,o=e.window,p=e.hold,q=e.bits,r=e.lencode,s=e.distcode,t=(1<<e.lenbits)-1,u=(1<<e.distbits)-1;a:do{15>q&&(p+=B[f++]<<q,q+=8,p+=B[f++]<<q,q+=8),v=r[p&t];b:for(;;){if(w=v>>>24,p>>>=w,q-=w,w=v>>>16&255,0===w)C[h++]=65535&v;else{if(!(16&w)){if(0===(64&w)){v=r[(65535&v)+(p&(1<<w)-1)];continue b}if(32&w){e.mode=d;break a}a.msg="invalid literal/length code",e.mode=c;break a}x=65535&v,w&=15,w&&(w>q&&(p+=B[f++]<<q,q+=8),x+=p&(1<<w)-1,p>>>=w,q-=w),15>q&&(p+=B[f++]<<q,q+=8,p+=B[f++]<<q,q+=8),v=s[p&u];c:for(;;){if(w=v>>>24,p>>>=w,q-=w,w=v>>>16&255,!(16&w)){if(0===(64&w)){v=s[(65535&v)+(p&(1<<w)-1)];continue c}a.msg="invalid distance code",e.mode=c;break a}if(y=65535&v,w&=15,w>q&&(p+=B[f++]<<q,q+=8,w>q&&(p+=B[f++]<<q,q+=8)),y+=p&(1<<w)-1,y>k){a.msg="invalid distance too far back",e.mode=c;break a}if(p>>>=w,q-=w,w=h-i,y>w){if(w=y-w,w>m&&e.sane){a.msg="invalid distance too far back",e.mode=c;break a}if(z=0,A=o,0===n){if(z+=l-w,x>w){x-=w;do C[h++]=o[z++];while(--w);z=h-y,A=C}}else if(w>n){if(z+=l+n-w,w-=n,x>w){x-=w;do C[h++]=o[z++];while(--w);if(z=0,x>n){w=n,x-=w;do C[h++]=o[z++];while(--w);z=h-y,A=C}}}else if(z+=n-w,x>w){x-=w;do C[h++]=o[z++];while(--w);z=h-y,A=C}for(;x>2;)C[h++]=A[z++],C[h++]=A[z++],C[h++]=A[z++],x-=3;x&&(C[h++]=A[z++],x>1&&(C[h++]=A[z++]))}else{z=h-y;do C[h++]=C[z++],C[h++]=C[z++],C[h++]=C[z++],x-=3;while(x>2);x&&(C[h++]=C[z++],x>1&&(C[h++]=C[z++]))}break}}break}}while(g>f&&j>h);x=q>>3,f-=x,q-=x<<3,p&=(1<<q)-1,a.next_in=f,a.next_out=h,a.avail_in=g>f?5+(g-f):5-(f-g),a.avail_out=j>h?257+(j-h):257-(h-j),e.hold=p,e.bits=q}},{}],35:[function(a,b,c){"use strict";function d(a){return(a>>>24&255)+(a>>>8&65280)+((65280&a)<<8)+((255&a)<<24)}function e(){this.mode=0,this.last=!1,this.wrap=0,this.havedict=!1,this.flags=0,this.dmax=0,this.check=0,this.total=0,this.head=null,this.wbits=0,this.wsize=0,this.whave=0,this.wnext=0,this.window=null,this.hold=0,this.bits=0,this.length=0,this.offset=0,this.extra=0,this.lencode=null,this.distcode=null,this.lenbits=0,this.distbits=0,this.ncode=0,this.nlen=0,this.ndist=0,this.have=0,this.next=null,this.lens=new r.Buf16(320),this.work=new r.Buf16(288),this.lendyn=null,this.distdyn=null,this.sane=0,this.back=0,this.was=0}function f(a){var b;return a&&a.state?(b=a.state,a.total_in=a.total_out=b.total=0,a.msg="",b.wrap&&(a.adler=1&b.wrap),b.mode=K,b.last=0,b.havedict=0,b.dmax=32768,b.head=null,b.hold=0,b.bits=0,b.lencode=b.lendyn=new r.Buf32(ob),b.distcode=b.distdyn=new r.Buf32(pb),b.sane=1,b.back=-1,C):F}function g(a){var b;return a&&a.state?(b=a.state,b.wsize=0,b.whave=0,b.wnext=0,f(a)):F}function h(a,b){var c,d;return a&&a.state?(d=a.state,0>b?(c=0,b=-b):(c=(b>>4)+1,48>b&&(b&=15)),b&&(8>b||b>15)?F:(null!==d.window&&d.wbits!==b&&(d.window=null),d.wrap=c,d.wbits=b,g(a))):F}function i(a,b){var c,d;return a?(d=new e,a.state=d,d.window=null,c=h(a,b),c!==C&&(a.state=null),c):F}function j(a){return i(a,rb)}function k(a){if(sb){var b;for(p=new r.Buf32(512),q=new r.Buf32(32),b=0;144>b;)a.lens[b++]=8;for(;256>b;)a.lens[b++]=9;for(;280>b;)a.lens[b++]=7;for(;288>b;)a.lens[b++]=8;for(v(x,a.lens,0,288,p,0,a.work,{bits:9}),b=0;32>b;)a.lens[b++]=5;v(y,a.lens,0,32,q,0,a.work,{bits:5}),sb=!1}a.lencode=p,a.lenbits=9,a.distcode=q,a.distbits=5}function l(a,b,c,d){var e,f=a.state;return null===f.window&&(f.wsize=1<<f.wbits,f.wnext=0,f.whave=0,f.window=new r.Buf8(f.wsize)),d>=f.wsize?(r.arraySet(f.window,b,c-f.wsize,f.wsize,0),f.wnext=0,f.whave=f.wsize):(e=f.wsize-f.wnext,e>d&&(e=d),r.arraySet(f.window,b,c-d,e,f.wnext),d-=e,d?(r.arraySet(f.window,b,c-d,d,0),f.wnext=d,f.whave=f.wsize):(f.wnext+=e,f.wnext===f.wsize&&(f.wnext=0),f.whave<f.wsize&&(f.whave+=e))),0}function m(a,b){var c,e,f,g,h,i,j,m,n,o,p,q,ob,pb,qb,rb,sb,tb,ub,vb,wb,xb,yb,zb,Ab=0,Bb=new r.Buf8(4),Cb=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];if(!a||!a.state||!a.output||!a.input&&0!==a.avail_in)return F;c=a.state,c.mode===V&&(c.mode=W),h=a.next_out,f=a.output,j=a.avail_out,g=a.next_in,e=a.input,i=a.avail_in,m=c.hold,n=c.bits,o=i,p=j,xb=C;a:for(;;)switch(c.mode){case K:if(0===c.wrap){c.mode=W;break}for(;16>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}if(2&c.wrap&&35615===m){c.check=0,Bb[0]=255&m,Bb[1]=m>>>8&255,c.check=t(c.check,Bb,2,0),m=0,n=0,c.mode=L;break}if(c.flags=0,c.head&&(c.head.done=!1),!(1&c.wrap)||(((255&m)<<8)+(m>>8))%31){a.msg="incorrect header check",c.mode=lb;break}if((15&m)!==J){a.msg="unknown compression method",c.mode=lb;break}if(m>>>=4,n-=4,wb=(15&m)+8,0===c.wbits)c.wbits=wb;else if(wb>c.wbits){a.msg="invalid window size",c.mode=lb;break}c.dmax=1<<wb,a.adler=c.check=1,c.mode=512&m?T:V,m=0,n=0;break;case L:for(;16>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}if(c.flags=m,(255&c.flags)!==J){a.msg="unknown compression method",c.mode=lb;break}if(57344&c.flags){a.msg="unknown header flags set",c.mode=lb;break}c.head&&(c.head.text=m>>8&1),512&c.flags&&(Bb[0]=255&m,Bb[1]=m>>>8&255,c.check=t(c.check,Bb,2,0)),m=0,n=0,c.mode=M;case M:for(;32>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}c.head&&(c.head.time=m),512&c.flags&&(Bb[0]=255&m,Bb[1]=m>>>8&255,Bb[2]=m>>>16&255,Bb[3]=m>>>24&255,c.check=t(c.check,Bb,4,0)),m=0,n=0,c.mode=N;case N:for(;16>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}c.head&&(c.head.xflags=255&m,c.head.os=m>>8),512&c.flags&&(Bb[0]=255&m,Bb[1]=m>>>8&255,c.check=t(c.check,Bb,2,0)),m=0,n=0,c.mode=O;case O:if(1024&c.flags){for(;16>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}c.length=m,c.head&&(c.head.extra_len=m),512&c.flags&&(Bb[0]=255&m,Bb[1]=m>>>8&255,c.check=t(c.check,Bb,2,0)),m=0,n=0}else c.head&&(c.head.extra=null);c.mode=P;case P:if(1024&c.flags&&(q=c.length,q>i&&(q=i),q&&(c.head&&(wb=c.head.extra_len-c.length,c.head.extra||(c.head.extra=new Array(c.head.extra_len)),r.arraySet(c.head.extra,e,g,q,wb)),512&c.flags&&(c.check=t(c.check,e,q,g)),i-=q,g+=q,c.length-=q),c.length))break a;c.length=0,c.mode=Q;case Q:if(2048&c.flags){if(0===i)break a;q=0;do wb=e[g+q++],c.head&&wb&&c.length<65536&&(c.head.name+=String.fromCharCode(wb));while(wb&&i>q);if(512&c.flags&&(c.check=t(c.check,e,q,g)),i-=q,g+=q,wb)break a}else c.head&&(c.head.name=null);c.length=0,c.mode=R;case R:if(4096&c.flags){if(0===i)break a;q=0;do wb=e[g+q++],c.head&&wb&&c.length<65536&&(c.head.comment+=String.fromCharCode(wb));while(wb&&i>q);if(512&c.flags&&(c.check=t(c.check,e,q,g)),i-=q,g+=q,wb)break a}else c.head&&(c.head.comment=null);c.mode=S;case S:if(512&c.flags){for(;16>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}if(m!==(65535&c.check)){a.msg="header crc mismatch",c.mode=lb;break}m=0,n=0}c.head&&(c.head.hcrc=c.flags>>9&1,c.head.done=!0),a.adler=c.check=0,c.mode=V;break;case T:for(;32>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}a.adler=c.check=d(m),m=0,n=0,c.mode=U;case U:if(0===c.havedict)return a.next_out=h,a.avail_out=j,a.next_in=g,a.avail_in=i,c.hold=m,c.bits=n,E;a.adler=c.check=1,c.mode=V;case V:if(b===A||b===B)break a;case W:if(c.last){m>>>=7&n,n-=7&n,c.mode=ib;break}for(;3>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}switch(c.last=1&m,m>>>=1,n-=1,3&m){case 0:c.mode=X;break;case 1:if(k(c),c.mode=bb,b===B){m>>>=2,n-=2;break a}break;case 2:c.mode=$;break;case 3:a.msg="invalid block type",c.mode=lb}m>>>=2,n-=2;break;case X:for(m>>>=7&n,n-=7&n;32>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}if((65535&m)!==(m>>>16^65535)){a.msg="invalid stored block lengths",c.mode=lb;break}if(c.length=65535&m,m=0,n=0,c.mode=Y,b===B)break a;case Y:c.mode=Z;case Z:if(q=c.length){if(q>i&&(q=i),q>j&&(q=j),0===q)break a;r.arraySet(f,e,g,q,h),i-=q,g+=q,j-=q,h+=q,c.length-=q;break}c.mode=V;break;case $:for(;14>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}if(c.nlen=(31&m)+257,m>>>=5,n-=5,c.ndist=(31&m)+1,m>>>=5,n-=5,c.ncode=(15&m)+4,m>>>=4,n-=4,c.nlen>286||c.ndist>30){a.msg="too many length or distance symbols",c.mode=lb;break}c.have=0,c.mode=_;case _:for(;c.have<c.ncode;){for(;3>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}c.lens[Cb[c.have++]]=7&m,m>>>=3,n-=3}for(;c.have<19;)c.lens[Cb[c.have++]]=0;if(c.lencode=c.lendyn,c.lenbits=7,yb={bits:c.lenbits},xb=v(w,c.lens,0,19,c.lencode,0,c.work,yb),c.lenbits=yb.bits,xb){a.msg="invalid code lengths set",c.mode=lb;break}c.have=0,c.mode=ab;case ab:for(;c.have<c.nlen+c.ndist;){for(;Ab=c.lencode[m&(1<<c.lenbits)-1],qb=Ab>>>24,rb=Ab>>>16&255,sb=65535&Ab,!(n>=qb);){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}if(16>sb)m>>>=qb,n-=qb,c.lens[c.have++]=sb;else{if(16===sb){for(zb=qb+2;zb>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}if(m>>>=qb,n-=qb,0===c.have){a.msg="invalid bit length repeat",c.mode=lb;break}wb=c.lens[c.have-1],q=3+(3&m),m>>>=2,n-=2}else if(17===sb){for(zb=qb+3;zb>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}m>>>=qb,n-=qb,wb=0,q=3+(7&m),m>>>=3,n-=3}else{for(zb=qb+7;zb>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}m>>>=qb,n-=qb,wb=0,q=11+(127&m),m>>>=7,n-=7}if(c.have+q>c.nlen+c.ndist){a.msg="invalid bit length repeat",c.mode=lb;break}for(;q--;)c.lens[c.have++]=wb}}if(c.mode===lb)break;if(0===c.lens[256]){a.msg="invalid code -- missing end-of-block",c.mode=lb;break}if(c.lenbits=9,yb={bits:c.lenbits},xb=v(x,c.lens,0,c.nlen,c.lencode,0,c.work,yb),c.lenbits=yb.bits,xb){a.msg="invalid literal/lengths set",c.mode=lb;break}if(c.distbits=6,c.distcode=c.distdyn,yb={bits:c.distbits},xb=v(y,c.lens,c.nlen,c.ndist,c.distcode,0,c.work,yb),c.distbits=yb.bits,xb){a.msg="invalid distances set",c.mode=lb;break}if(c.mode=bb,b===B)break a;case bb:c.mode=cb;case cb:if(i>=6&&j>=258){a.next_out=h,a.avail_out=j,a.next_in=g,a.avail_in=i,c.hold=m,c.bits=n,u(a,p),h=a.next_out,f=a.output,j=a.avail_out,g=a.next_in,e=a.input,i=a.avail_in,m=c.hold,n=c.bits,c.mode===V&&(c.back=-1);break}for(c.back=0;Ab=c.lencode[m&(1<<c.lenbits)-1],qb=Ab>>>24,rb=Ab>>>16&255,sb=65535&Ab,!(n>=qb);){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}if(rb&&0===(240&rb)){for(tb=qb,ub=rb,vb=sb;Ab=c.lencode[vb+((m&(1<<tb+ub)-1)>>tb)],qb=Ab>>>24,rb=Ab>>>16&255,sb=65535&Ab,!(n>=tb+qb);){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}m>>>=tb,n-=tb,c.back+=tb}if(m>>>=qb,n-=qb,c.back+=qb,c.length=sb,0===rb){c.mode=hb;break}if(32&rb){c.back=-1,c.mode=V;break}if(64&rb){a.msg="invalid literal/length code",c.mode=lb;break}c.extra=15&rb,c.mode=db;case db:if(c.extra){for(zb=c.extra;zb>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}c.length+=m&(1<<c.extra)-1,m>>>=c.extra,n-=c.extra,c.back+=c.extra}c.was=c.length,c.mode=eb;case eb:for(;Ab=c.distcode[m&(1<<c.distbits)-1],qb=Ab>>>24,rb=Ab>>>16&255,sb=65535&Ab,!(n>=qb);){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}if(0===(240&rb)){for(tb=qb,ub=rb,vb=sb;Ab=c.distcode[vb+((m&(1<<tb+ub)-1)>>tb)],qb=Ab>>>24,rb=Ab>>>16&255,sb=65535&Ab,!(n>=tb+qb);){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}m>>>=tb,n-=tb,c.back+=tb}if(m>>>=qb,n-=qb,c.back+=qb,64&rb){a.msg="invalid distance code",c.mode=lb;break}c.offset=sb,c.extra=15&rb,c.mode=fb;case fb:if(c.extra){for(zb=c.extra;zb>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}c.offset+=m&(1<<c.extra)-1,m>>>=c.extra,n-=c.extra,c.back+=c.extra}if(c.offset>c.dmax){a.msg="invalid distance too far back",c.mode=lb;break}c.mode=gb;case gb:if(0===j)break a;
if(q=p-j,c.offset>q){if(q=c.offset-q,q>c.whave&&c.sane){a.msg="invalid distance too far back",c.mode=lb;break}q>c.wnext?(q-=c.wnext,ob=c.wsize-q):ob=c.wnext-q,q>c.length&&(q=c.length),pb=c.window}else pb=f,ob=h-c.offset,q=c.length;q>j&&(q=j),j-=q,c.length-=q;do f[h++]=pb[ob++];while(--q);0===c.length&&(c.mode=cb);break;case hb:if(0===j)break a;f[h++]=c.length,j--,c.mode=cb;break;case ib:if(c.wrap){for(;32>n;){if(0===i)break a;i--,m|=e[g++]<<n,n+=8}if(p-=j,a.total_out+=p,c.total+=p,p&&(a.adler=c.check=c.flags?t(c.check,f,p,h-p):s(c.check,f,p,h-p)),p=j,(c.flags?m:d(m))!==c.check){a.msg="incorrect data check",c.mode=lb;break}m=0,n=0}c.mode=jb;case jb:if(c.wrap&&c.flags){for(;32>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}if(m!==(4294967295&c.total)){a.msg="incorrect length check",c.mode=lb;break}m=0,n=0}c.mode=kb;case kb:xb=D;break a;case lb:xb=G;break a;case mb:return H;case nb:default:return F}return a.next_out=h,a.avail_out=j,a.next_in=g,a.avail_in=i,c.hold=m,c.bits=n,(c.wsize||p!==a.avail_out&&c.mode<lb&&(c.mode<ib||b!==z))&&l(a,a.output,a.next_out,p-a.avail_out)?(c.mode=mb,H):(o-=a.avail_in,p-=a.avail_out,a.total_in+=o,a.total_out+=p,c.total+=p,c.wrap&&p&&(a.adler=c.check=c.flags?t(c.check,f,p,a.next_out-p):s(c.check,f,p,a.next_out-p)),a.data_type=c.bits+(c.last?64:0)+(c.mode===V?128:0)+(c.mode===bb||c.mode===Y?256:0),(0===o&&0===p||b===z)&&xb===C&&(xb=I),xb)}function n(a){if(!a||!a.state)return F;var b=a.state;return b.window&&(b.window=null),a.state=null,C}function o(a,b){var c;return a&&a.state?(c=a.state,0===(2&c.wrap)?F:(c.head=b,b.done=!1,C)):F}var p,q,r=a("../utils/common"),s=a("./adler32"),t=a("./crc32"),u=a("./inffast"),v=a("./inftrees"),w=0,x=1,y=2,z=4,A=5,B=6,C=0,D=1,E=2,F=-2,G=-3,H=-4,I=-5,J=8,K=1,L=2,M=3,N=4,O=5,P=6,Q=7,R=8,S=9,T=10,U=11,V=12,W=13,X=14,Y=15,Z=16,$=17,_=18,ab=19,bb=20,cb=21,db=22,eb=23,fb=24,gb=25,hb=26,ib=27,jb=28,kb=29,lb=30,mb=31,nb=32,ob=852,pb=592,qb=15,rb=qb,sb=!0;c.inflateReset=g,c.inflateReset2=h,c.inflateResetKeep=f,c.inflateInit=j,c.inflateInit2=i,c.inflate=m,c.inflateEnd=n,c.inflateGetHeader=o,c.inflateInfo="pako inflate (from Nodeca project)"},{"../utils/common":27,"./adler32":29,"./crc32":31,"./inffast":34,"./inftrees":36}],36:[function(a,b){"use strict";var c=a("../utils/common"),d=15,e=852,f=592,g=0,h=1,i=2,j=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,0,0],k=[16,16,16,16,16,16,16,16,17,17,17,17,18,18,18,18,19,19,19,19,20,20,20,20,21,21,21,21,16,72,78],l=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577,0,0],m=[16,16,16,16,17,17,18,18,19,19,20,20,21,21,22,22,23,23,24,24,25,25,26,26,27,27,28,28,29,29,64,64];b.exports=function(a,b,n,o,p,q,r,s){var t,u,v,w,x,y,z,A,B,C=s.bits,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=null,O=0,P=new c.Buf16(d+1),Q=new c.Buf16(d+1),R=null,S=0;for(D=0;d>=D;D++)P[D]=0;for(E=0;o>E;E++)P[b[n+E]]++;for(H=C,G=d;G>=1&&0===P[G];G--);if(H>G&&(H=G),0===G)return p[q++]=20971520,p[q++]=20971520,s.bits=1,0;for(F=1;G>F&&0===P[F];F++);for(F>H&&(H=F),K=1,D=1;d>=D;D++)if(K<<=1,K-=P[D],0>K)return-1;if(K>0&&(a===g||1!==G))return-1;for(Q[1]=0,D=1;d>D;D++)Q[D+1]=Q[D]+P[D];for(E=0;o>E;E++)0!==b[n+E]&&(r[Q[b[n+E]]++]=E);if(a===g?(N=R=r,y=19):a===h?(N=j,O-=257,R=k,S-=257,y=256):(N=l,R=m,y=-1),M=0,E=0,D=F,x=q,I=H,J=0,v=-1,L=1<<H,w=L-1,a===h&&L>e||a===i&&L>f)return 1;for(var T=0;;){T++,z=D-J,r[E]<y?(A=0,B=r[E]):r[E]>y?(A=R[S+r[E]],B=N[O+r[E]]):(A=96,B=0),t=1<<D-J,u=1<<I,F=u;do u-=t,p[x+(M>>J)+u]=z<<24|A<<16|B|0;while(0!==u);for(t=1<<D-1;M&t;)t>>=1;if(0!==t?(M&=t-1,M+=t):M=0,E++,0===--P[D]){if(D===G)break;D=b[n+r[E]]}if(D>H&&(M&w)!==v){for(0===J&&(J=H),x+=F,I=D-J,K=1<<I;G>I+J&&(K-=P[I+J],!(0>=K));)I++,K<<=1;if(L+=1<<I,a===h&&L>e||a===i&&L>f)return 1;v=M&w,p[v]=H<<24|I<<16|x-q|0}}return 0!==M&&(p[x+M]=D-J<<24|64<<16|0),s.bits=H,0}},{"../utils/common":27}],37:[function(a,b){"use strict";b.exports={2:"need dictionary",1:"stream end",0:"","-1":"file error","-2":"stream error","-3":"data error","-4":"insufficient memory","-5":"buffer error","-6":"incompatible version"}},{}],38:[function(a,b,c){"use strict";function d(a){for(var b=a.length;--b>=0;)a[b]=0}function e(a){return 256>a?gb[a]:gb[256+(a>>>7)]}function f(a,b){a.pending_buf[a.pending++]=255&b,a.pending_buf[a.pending++]=b>>>8&255}function g(a,b,c){a.bi_valid>V-c?(a.bi_buf|=b<<a.bi_valid&65535,f(a,a.bi_buf),a.bi_buf=b>>V-a.bi_valid,a.bi_valid+=c-V):(a.bi_buf|=b<<a.bi_valid&65535,a.bi_valid+=c)}function h(a,b,c){g(a,c[2*b],c[2*b+1])}function i(a,b){var c=0;do c|=1&a,a>>>=1,c<<=1;while(--b>0);return c>>>1}function j(a){16===a.bi_valid?(f(a,a.bi_buf),a.bi_buf=0,a.bi_valid=0):a.bi_valid>=8&&(a.pending_buf[a.pending++]=255&a.bi_buf,a.bi_buf>>=8,a.bi_valid-=8)}function k(a,b){var c,d,e,f,g,h,i=b.dyn_tree,j=b.max_code,k=b.stat_desc.static_tree,l=b.stat_desc.has_stree,m=b.stat_desc.extra_bits,n=b.stat_desc.extra_base,o=b.stat_desc.max_length,p=0;for(f=0;U>=f;f++)a.bl_count[f]=0;for(i[2*a.heap[a.heap_max]+1]=0,c=a.heap_max+1;T>c;c++)d=a.heap[c],f=i[2*i[2*d+1]+1]+1,f>o&&(f=o,p++),i[2*d+1]=f,d>j||(a.bl_count[f]++,g=0,d>=n&&(g=m[d-n]),h=i[2*d],a.opt_len+=h*(f+g),l&&(a.static_len+=h*(k[2*d+1]+g)));if(0!==p){do{for(f=o-1;0===a.bl_count[f];)f--;a.bl_count[f]--,a.bl_count[f+1]+=2,a.bl_count[o]--,p-=2}while(p>0);for(f=o;0!==f;f--)for(d=a.bl_count[f];0!==d;)e=a.heap[--c],e>j||(i[2*e+1]!==f&&(a.opt_len+=(f-i[2*e+1])*i[2*e],i[2*e+1]=f),d--)}}function l(a,b,c){var d,e,f=new Array(U+1),g=0;for(d=1;U>=d;d++)f[d]=g=g+c[d-1]<<1;for(e=0;b>=e;e++){var h=a[2*e+1];0!==h&&(a[2*e]=i(f[h]++,h))}}function m(){var a,b,c,d,e,f=new Array(U+1);for(c=0,d=0;O-1>d;d++)for(ib[d]=c,a=0;a<1<<_[d];a++)hb[c++]=d;for(hb[c-1]=d,e=0,d=0;16>d;d++)for(jb[d]=e,a=0;a<1<<ab[d];a++)gb[e++]=d;for(e>>=7;R>d;d++)for(jb[d]=e<<7,a=0;a<1<<ab[d]-7;a++)gb[256+e++]=d;for(b=0;U>=b;b++)f[b]=0;for(a=0;143>=a;)eb[2*a+1]=8,a++,f[8]++;for(;255>=a;)eb[2*a+1]=9,a++,f[9]++;for(;279>=a;)eb[2*a+1]=7,a++,f[7]++;for(;287>=a;)eb[2*a+1]=8,a++,f[8]++;for(l(eb,Q+1,f),a=0;R>a;a++)fb[2*a+1]=5,fb[2*a]=i(a,5);kb=new nb(eb,_,P+1,Q,U),lb=new nb(fb,ab,0,R,U),mb=new nb(new Array(0),bb,0,S,W)}function n(a){var b;for(b=0;Q>b;b++)a.dyn_ltree[2*b]=0;for(b=0;R>b;b++)a.dyn_dtree[2*b]=0;for(b=0;S>b;b++)a.bl_tree[2*b]=0;a.dyn_ltree[2*X]=1,a.opt_len=a.static_len=0,a.last_lit=a.matches=0}function o(a){a.bi_valid>8?f(a,a.bi_buf):a.bi_valid>0&&(a.pending_buf[a.pending++]=a.bi_buf),a.bi_buf=0,a.bi_valid=0}function p(a,b,c,d){o(a),d&&(f(a,c),f(a,~c)),E.arraySet(a.pending_buf,a.window,b,c,a.pending),a.pending+=c}function q(a,b,c,d){var e=2*b,f=2*c;return a[e]<a[f]||a[e]===a[f]&&d[b]<=d[c]}function r(a,b,c){for(var d=a.heap[c],e=c<<1;e<=a.heap_len&&(e<a.heap_len&&q(b,a.heap[e+1],a.heap[e],a.depth)&&e++,!q(b,d,a.heap[e],a.depth));)a.heap[c]=a.heap[e],c=e,e<<=1;a.heap[c]=d}function s(a,b,c){var d,f,i,j,k=0;if(0!==a.last_lit)do d=a.pending_buf[a.d_buf+2*k]<<8|a.pending_buf[a.d_buf+2*k+1],f=a.pending_buf[a.l_buf+k],k++,0===d?h(a,f,b):(i=hb[f],h(a,i+P+1,b),j=_[i],0!==j&&(f-=ib[i],g(a,f,j)),d--,i=e(d),h(a,i,c),j=ab[i],0!==j&&(d-=jb[i],g(a,d,j)));while(k<a.last_lit);h(a,X,b)}function t(a,b){var c,d,e,f=b.dyn_tree,g=b.stat_desc.static_tree,h=b.stat_desc.has_stree,i=b.stat_desc.elems,j=-1;for(a.heap_len=0,a.heap_max=T,c=0;i>c;c++)0!==f[2*c]?(a.heap[++a.heap_len]=j=c,a.depth[c]=0):f[2*c+1]=0;for(;a.heap_len<2;)e=a.heap[++a.heap_len]=2>j?++j:0,f[2*e]=1,a.depth[e]=0,a.opt_len--,h&&(a.static_len-=g[2*e+1]);for(b.max_code=j,c=a.heap_len>>1;c>=1;c--)r(a,f,c);e=i;do c=a.heap[1],a.heap[1]=a.heap[a.heap_len--],r(a,f,1),d=a.heap[1],a.heap[--a.heap_max]=c,a.heap[--a.heap_max]=d,f[2*e]=f[2*c]+f[2*d],a.depth[e]=(a.depth[c]>=a.depth[d]?a.depth[c]:a.depth[d])+1,f[2*c+1]=f[2*d+1]=e,a.heap[1]=e++,r(a,f,1);while(a.heap_len>=2);a.heap[--a.heap_max]=a.heap[1],k(a,b),l(f,j,a.bl_count)}function u(a,b,c){var d,e,f=-1,g=b[1],h=0,i=7,j=4;for(0===g&&(i=138,j=3),b[2*(c+1)+1]=65535,d=0;c>=d;d++)e=g,g=b[2*(d+1)+1],++h<i&&e===g||(j>h?a.bl_tree[2*e]+=h:0!==e?(e!==f&&a.bl_tree[2*e]++,a.bl_tree[2*Y]++):10>=h?a.bl_tree[2*Z]++:a.bl_tree[2*$]++,h=0,f=e,0===g?(i=138,j=3):e===g?(i=6,j=3):(i=7,j=4))}function v(a,b,c){var d,e,f=-1,i=b[1],j=0,k=7,l=4;for(0===i&&(k=138,l=3),d=0;c>=d;d++)if(e=i,i=b[2*(d+1)+1],!(++j<k&&e===i)){if(l>j){do h(a,e,a.bl_tree);while(0!==--j)}else 0!==e?(e!==f&&(h(a,e,a.bl_tree),j--),h(a,Y,a.bl_tree),g(a,j-3,2)):10>=j?(h(a,Z,a.bl_tree),g(a,j-3,3)):(h(a,$,a.bl_tree),g(a,j-11,7));j=0,f=e,0===i?(k=138,l=3):e===i?(k=6,l=3):(k=7,l=4)}}function w(a){var b;for(u(a,a.dyn_ltree,a.l_desc.max_code),u(a,a.dyn_dtree,a.d_desc.max_code),t(a,a.bl_desc),b=S-1;b>=3&&0===a.bl_tree[2*cb[b]+1];b--);return a.opt_len+=3*(b+1)+5+5+4,b}function x(a,b,c,d){var e;for(g(a,b-257,5),g(a,c-1,5),g(a,d-4,4),e=0;d>e;e++)g(a,a.bl_tree[2*cb[e]+1],3);v(a,a.dyn_ltree,b-1),v(a,a.dyn_dtree,c-1)}function y(a){var b,c=4093624447;for(b=0;31>=b;b++,c>>>=1)if(1&c&&0!==a.dyn_ltree[2*b])return G;if(0!==a.dyn_ltree[18]||0!==a.dyn_ltree[20]||0!==a.dyn_ltree[26])return H;for(b=32;P>b;b++)if(0!==a.dyn_ltree[2*b])return H;return G}function z(a){pb||(m(),pb=!0),a.l_desc=new ob(a.dyn_ltree,kb),a.d_desc=new ob(a.dyn_dtree,lb),a.bl_desc=new ob(a.bl_tree,mb),a.bi_buf=0,a.bi_valid=0,n(a)}function A(a,b,c,d){g(a,(J<<1)+(d?1:0),3),p(a,b,c,!0)}function B(a){g(a,K<<1,3),h(a,X,eb),j(a)}function C(a,b,c,d){var e,f,h=0;a.level>0?(a.strm.data_type===I&&(a.strm.data_type=y(a)),t(a,a.l_desc),t(a,a.d_desc),h=w(a),e=a.opt_len+3+7>>>3,f=a.static_len+3+7>>>3,e>=f&&(e=f)):e=f=c+5,e>=c+4&&-1!==b?A(a,b,c,d):a.strategy===F||f===e?(g(a,(K<<1)+(d?1:0),3),s(a,eb,fb)):(g(a,(L<<1)+(d?1:0),3),x(a,a.l_desc.max_code+1,a.d_desc.max_code+1,h+1),s(a,a.dyn_ltree,a.dyn_dtree)),n(a),d&&o(a)}function D(a,b,c){return a.pending_buf[a.d_buf+2*a.last_lit]=b>>>8&255,a.pending_buf[a.d_buf+2*a.last_lit+1]=255&b,a.pending_buf[a.l_buf+a.last_lit]=255&c,a.last_lit++,0===b?a.dyn_ltree[2*c]++:(a.matches++,b--,a.dyn_ltree[2*(hb[c]+P+1)]++,a.dyn_dtree[2*e(b)]++),a.last_lit===a.lit_bufsize-1}var E=a("../utils/common"),F=4,G=0,H=1,I=2,J=0,K=1,L=2,M=3,N=258,O=29,P=256,Q=P+1+O,R=30,S=19,T=2*Q+1,U=15,V=16,W=7,X=256,Y=16,Z=17,$=18,_=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0],ab=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13],bb=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7],cb=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],db=512,eb=new Array(2*(Q+2));d(eb);var fb=new Array(2*R);d(fb);var gb=new Array(db);d(gb);var hb=new Array(N-M+1);d(hb);var ib=new Array(O);d(ib);var jb=new Array(R);d(jb);var kb,lb,mb,nb=function(a,b,c,d,e){this.static_tree=a,this.extra_bits=b,this.extra_base=c,this.elems=d,this.max_length=e,this.has_stree=a&&a.length},ob=function(a,b){this.dyn_tree=a,this.max_code=0,this.stat_desc=b},pb=!1;c._tr_init=z,c._tr_stored_block=A,c._tr_flush_block=C,c._tr_tally=D,c._tr_align=B},{"../utils/common":27}],39:[function(a,b){"use strict";function c(){this.input=null,this.next_in=0,this.avail_in=0,this.total_in=0,this.output=null,this.next_out=0,this.avail_out=0,this.total_out=0,this.msg="",this.state=null,this.data_type=2,this.adler=0}b.exports=c},{}]},{},[9])(9)});
// Copyright 2015 by Paulo Augusto Peccin. See license.txt distributed with this file.

jt.Keys = {
    VK_ESCAPE: {c: 27, n: "Esc"},
    VK_F1: {c: 112, n: "F1"},
    VK_F2: {c: 113, n: "F2"},
    VK_F3: {c: 114, n: "F3"},
    VK_F4: {c: 115, n: "F4"},
    VK_F5: {c: 116, n: "F5"},
    VK_F6: {c: 117, n: "F6"},
    VK_F7: {c: 118, n: "F7"},
    VK_F8: {c: 119, n: "F8"},
    VK_F9: {c: 120, n: "F9"},
    VK_F10: {c: 121, n: "F10"},
    VK_F11: {c: 122, n: "F11"},
    VK_F12: {c: 123, n: "F12"},
    VK_SCROLL_LOCK: {c: 145, n: "ScrLck"},
    VK_PAUSE: {c: 19, n: "Pause"},
    VK_QUOTE: {c: 192, n: "'"},
    VK_TILDE: {c: 222, n: "~"},
    VK_1: {c: 49, n: "1"},
    VK_2: {c: 50, n: "2"},
    VK_3: {c: 51, n: "3"},
    VK_4: {c: 52, n: "4"},
    VK_5: {c: 53, n: "5"},
    VK_6: {c: 54, n: "6"},
    VK_7: {c: 55, n: "7"},
    VK_8: {c: 56, n: "8"},
    VK_9: {c: 57, n: "9"},
    VK_0: {c: 48, n: "0"},
    VK_MINUS: {c: 189, n: "-"},
    VK_MINUS2: {c: 173, n: "-"},
    VK_EQUALS: {c: 187, n: "="},
    VK_EQUALS2: {c: 61, n: "="},
    VK_BACK_SPACE: {c: 8, n: "Bkspc"},
    VK_TAB: {c: 9, n: "Tab"},
    VK_Q: {c: 81, n: "Q"},
    VK_W: {c: 87, n: "W"},
    VK_E: {c: 69, n: "E"},
    VK_R: {c: 82, n: "R"},
    VK_T: {c: 84, n: "T"},
    VK_Y: {c: 89, n: "Y"},
    VK_U: {c: 85, n: "U"},
    VK_I: {c: 73, n: "I"},
    VK_O: {c: 79, n: "O"},
    VK_P: {c: 80, n: "P"},
    VK_ACUTE: {c: 219, n: "´"},
    VK_OPEN_BRACKET: {c: 221, n: "["},
    VK_CLOSE_BRACKET: {c: 220, n: "]"},
    VK_CAPS_LOCK: {c: 20, n: "CpsLck"},
    VK_A: {c: 65, n: "A"},
    VK_S: {c: 83, n: "S"},
    VK_D: {c: 68, n: "D"},
    VK_F: {c: 70, n: "F"},
    VK_G: {c: 71, n: "G"},
    VK_H: {c: 72, n: "H"},
    VK_J: {c: 74, n: "J"},
    VK_K: {c: 75, n: "K"},
    VK_L: {c: 76, n: "L"},
    VK_CEDILLA: {c: 186, n: "Ç"},
    VK_TILDE: {c: 222, n: "~"},
    VK_ENTER: {c: 13, n: "Enter"},
    VK_SHIFT: {c: 16, n: "Shift"},
    VK_BACK_SLASH: {c: 226, n: "\\"},
    VK_Z: {c: 90, n: "Z"},
    VK_X: {c: 88, n: "X"},
    VK_C: {c: 67, n: "C"},
    VK_V: {c: 86, n: "V"},
    VK_B: {c: 66, n: "B"},
    VK_N: {c: 78, n: "N"},
    VK_M: {c: 77, n: "M"},
    VK_COMMA: {c: 188, n: "] ="},
    VK_PERIOD: {c: 190, n: "."},
    VK_SEMICOLON: {c: 191, n: ";"},
    VK_SLASH: {c: 193, n: "/"},
    VK_CONTROL: {c: 17, n: "Ctrl"},
    VK_ALT: {c: 18, n: "Alt"},
    VK_SPACE: {c: 32, n: "Space"},
    VK_INSERT: {c: 45, n: "Ins"},
    VK_DELETE: {c: 46, n: "Del"},
    VK_HOME: {c: 36, n: "Home"},
    VK_END: {c: 35, n: "End"},
    VK_PAGE_UP: {c: 33, n: "PgUp"},
    VK_PAGE_DOWN: {c: 34, n: "PgDown"},
    VK_UP: {c: 38, n: "Up"},
    VK_DOWN: {c: 40, n: "Down"},
    VK_LEFT: {c: 37, n: "Left"},
    VK_RIGHT: {c: 39, n: "Right"},
    VK_NUM_LOCK: {c: 144, n: "Num"},
    VK_DIVIDE: {c: 111, n: "Num /"},
    VK_MULTIPLY: {c: 106, n: "Num *"},
    VK_SUBTRACT: {c: 109, n: "Num -"},
    VK_ADD: {c: 107, n: "Num +"},
    VK_DECIMAL: {c: 194, n: "Num ."},
    VK_NUMPAD0: {c: 96, n: "Num 0"},
    VK_NUMPAD1: {c: 97, n: "Num 1"},
    VK_NUMPAD2: {c: 98, n: "Num 2"},
    VK_NUMPAD3: {c: 99, n: "Num 3"},
    VK_NUMPAD4: {c: 100, n: "Num 4"},
    VK_NUMPAD5: {c: 101, n: "Num 5"},
    VK_NUMPAD6: {c: 102, n: "Num 6"},
    VK_NUMPAD7: {c: 103, n: "Num 7"},
    VK_NUMPAD8: {c: 104, n: "Num 8"},
    VK_NUMPAD9: {c: 105, n: "Num 9"},
    VK_NUMPAD_CENTER: {c: 12, n: "Num Cntr"}
};

jt.KeysByCode = {};
for (var key in jt.Keys)
    jt.KeysByCode[jt.Keys[key].c] = jt.Keys[key];


// Copyright 2015 by Paulo Augusto Peccin. See license.txt distributed with this file.

Javatari.preferences = {};

Javatari.preferences.defaults = {
    KP0LEFT  : jt.Keys.VK_LEFT.c,
    KP0UP    : jt.Keys.VK_UP.c,
    KP0RIGHT : jt.Keys.VK_RIGHT.c,
    KP0DOWN  : jt.Keys.VK_DOWN.c,
    KP0BUT   : jt.Keys.VK_SPACE.c,
    KP0BUT2  : jt.Keys.VK_DELETE.c,
    KP1LEFT  : jt.Keys.VK_F.c,
    KP1UP    : jt.Keys.VK_T.c,
    KP1RIGHT : jt.Keys.VK_H.c,
    KP1DOWN  : jt.Keys.VK_G.c,
    KP1BUT   : jt.Keys.VK_A.c,
    KP1BUT2  : jt.Keys.VK_PERIOD.c,

    JP0DEVICE   : -1,  // -1 = auto
    JP0XAXIS    : 0,
    JP0XAXISSIG : 1,
    JP0YAXIS    : 1,
    JP0YAXISSIG : 1,
    JP0PAXIS    : 0,
    JP0PAXISSIG : 1,
    JP0BUT      : 0,
    JP0BUT2     : 1,
    JP0SELECT   : 8,
    JP0RESET    : 9,
    JP0PAUSE    : 7,
    JP0FAST     : 6,
    JP0DEADZONE : 0.3,
    JP0PCENTER  : 0.3,
    JP0PSENS    : 0.75,

    JP1DEVICE   : -1,  // -1 = auto
    JP1XAXIS    : 0,
    JP1XAXISSIG : 1,
    JP1YAXIS    : 1,
    JP1YAXISSIG : 1,
    JP1PAXIS    : 0,
    JP1PAXISSIG : 1,
    JP1BUT      : 0,
    JP1BUT2     : 1,
    JP1SELECT   : 8,
    JP1RESET    : 9,
    JP1PAUSE    : 7,
    JP1FAST     : 6,
    JP1DEADZONE : 0.3,
    JP1PCENTER  : 0.3,
    JP1PSENS    : 0.75
};

Javatari.preferences.loadDefaults = function() {
    for (var pref in Javatari.preferences.defaults)
        Javatari.preferences[pref] = Javatari.preferences.defaults[pref];
};

Javatari.preferences.load = function() {
    try {
        Javatari.preferences.loadDefaults();
        var loaded = JSON.parse(localStorage.javatariprefs || "{}");
        for (var pref in Javatari.preferences.defaults)
            if (loaded[pref]) Javatari.preferences[pref] = loaded[pref];
    } catch(e) {
        // giveup
    }
};

Javatari.preferences.save = function() {
    try {
        localStorage.javatariprefs = JSON.stringify(Javatari.preferences);
    } catch (e) {
        // giveup
    }
};



// Copyright 2015 by Paulo Augusto Peccin. See license.txt distributed with this file.

jt.GamepadConsoleControls = function(domControls) {

    this.connect = function(pConsoleControlsSocket) {
        consoleControlsSocket = pConsoleControlsSocket;
    };

    this.connectScreen = function(pScreen) {
        screen = pScreen;
    };

    this.powerOn = function() {
        supported = !!navigator.getGamepads;
        if (!supported) return;
        this.applyPreferences();
        initStates();
    };

    this.powerOff = function() {
        supported = false;
    };

    this.toggleMode = function() {
        if (!supported) return;
        initStates();
        swappedMode = !swappedMode;
        screen.getMonitor().showOSD("Gamepad input " + (swappedMode ? "Swapped" : "Normal"), true);
    };

    this.setPaddleMode = function(state) {
        if (!supported) return;
        paddleMode = state;
        joy0State.xPosition = joy1State.xPosition = -1;
    };

    this.setP1ControlsMode = function(state) {
        p1ControlsMode = state;
    };

    this.clockPulse = function() {
        if (!supported) return;

        // Try to avoid polling at gamepads if none are present, as it may be expensive
        // Only try to detect connected gamepads once each 60 clocks (frames)
        if (++gamepadsDetectionDelay >= 60) gamepadsDetectionDelay = 0;
        if (!joystick0 && !joystick1 && gamepadsDetectionDelay !== 0) return;

        var gamepads = navigator.getGamepads();     // Just one poll per clock here then use it several times

        if (joystick0) {
            if (joystick0.update(gamepads)) {
                if (joystick0.hasMoved())
                    update(joystick0, joy0State, joy0Prefs, !swappedMode);
            } else {
                joystick0 = null;
                joystickConnectionMessage(true, false);
            }
        } else {
            if (gamepadsDetectionDelay === 0) {
                joystick0 = detectNewJoystick(joy0Prefs, joy1Prefs, gamepads);
                if (joystick0) joystickConnectionMessage(true, true);
            }
        }

        if (joystick1) {
            if (joystick1.update(gamepads)) {
                if (joystick1.hasMoved())
                    update(joystick1, joy1State, joy1Prefs, swappedMode);
            } else {
                joystick1 = null;
                joystickConnectionMessage(false, false);
            }
        } else {
            if (gamepadsDetectionDelay === 0) {
                joystick1 = detectNewJoystick(joy1Prefs, joy0Prefs, gamepads);
                if (joystick1) joystickConnectionMessage(false, true);
            }
        }
    };

    var joystickConnectionMessage = function (joy0, conn) {
        screen.getMonitor().showOSD((joy0 ^ p1ControlsMode ^ swappedMode ? "P1" : "P2") + " Gamepad " + (conn ? "connected" : "disconnected"), joy0);
    };

    var detectNewJoystick = function(prefs, notPrefs, gamepads) {
        if (!gamepads || gamepads.length === 0) return;
        // Fixed index detection. Also allow the same gamepad to control both  players
        if (prefs.device >= 0)   // pref.device == -1 means "auto"
            return gamepads[prefs.device] ? new Joystick(prefs.device, prefs) : null;
        // Auto detection
        for (var i = 0, len = gamepads.length; i < len; i++)
            if (gamepads[i])
                if (i !== notPrefs.device && (!joystick0 || joystick0.index !== i) && (!joystick1 || joystick1.index !== i))
                    // New Joystick found!
                    return new Joystick(i, prefs);
    };

    var initStates = function() {
        joy0State = newControllerState();
        joy1State = newControllerState();
    };

    var update = function(joystick, joyState, joyPrefs, player0) {
        // Paddle Analog
        if (paddleMode && joyPrefs.paddleSens !== 0) {
            var newPosition = joystick.getPaddlePosition();
            if (newPosition !== joyState.xPosition) {
                joyState.xPosition = newPosition;
                consoleControlsSocket.controlValueChanged(player0 ^ p1ControlsMode ? controls.PADDLE0_POSITION : controls.PADDLE1_POSITION, newPosition);
            }
        }
        // Joystick direction (Analog or POV) and Paddle Digital (Analog or POV)
        var newDirection = joystick.getDPadDirection();
        if (newDirection === -1 && (!paddleMode || joyPrefs.paddleSens === 0))
            newDirection = joystick.getStickDirection();
        if (newDirection !== joyState.direction) {
            var newUP = newDirection === 7 || newDirection === 0 || newDirection == 1;
            var newRIGHT = newDirection === 1 || newDirection === 2 || newDirection === 3;
            var newDOWN = newDirection === 3 || newDirection === 4 || newDirection === 5;
            var newLEFT = newDirection === 5 || newDirection === 6 || newDirection === 7;
            if (player0) {
                domControls.processKeyEvent(Javatari.preferences.KP0UP, newUP, 0);
                domControls.processKeyEvent(Javatari.preferences.KP0RIGHT, newRIGHT, 0);
                domControls.processKeyEvent(Javatari.preferences.KP0DOWN, newDOWN, 0);
                domControls.processKeyEvent(Javatari.preferences.KP0LEFT, newLEFT, 0);
            } else {
                domControls.processKeyEvent(Javatari.preferences.KP1UP, newUP, 0);
                domControls.processKeyEvent(Javatari.preferences.KP1RIGHT, newRIGHT, 0);
                domControls.processKeyEvent(Javatari.preferences.KP1DOWN, newDOWN, 0);
                domControls.processKeyEvent(Javatari.preferences.KP1LEFT, newLEFT, 0);
            }
            joyState.direction = newDirection;
        }
        // Joystick button
        if (joyButtonDetection === joystick) {
            detectButton();
            return;
        } else {
            var newButton = joystick.getButtonDigital(joyPrefs.button) || joystick.getButtonDigital(joyPrefs.button2);
            if (newButton !== joyState.button) {
                domControls.processKeyEvent(player0 ? Javatari.preferences.KP0BUT : Javatari.preferences.KP1BUT, newButton, 0);
                joyState.button = newButton;
            }
        }
        // Other Console controls
        var newSelect = joystick.getButtonDigital(joyPrefs.select);
        if (newSelect !== joyState.select) {
            domControls.processKeyEvent(jt.DOMConsoleControls.KEY_SELECT, newSelect, 0);
            joyState.select = newSelect;
        }
        var newReset = joystick.getButtonDigital(joyPrefs.reset);
        if (newReset !== joyState.reset) {
            domControls.processKeyEvent(jt.DOMConsoleControls.KEY_RESET, newReset, 0);
            joyState.reset = newReset;
        }
        var newPause = joystick.getButtonDigital(joyPrefs.pause);
        if (newPause !== joyState.pause) {
            domControls.processKeyEvent(jt.DOMConsoleControls.KEY_PAUSE, newPause, jt.DOMConsoleControls.KEY_ALT_MASK);
            joyState.pause = newPause;
        }
        var newFastSpeed = joystick.getButtonDigital(joyPrefs.fastSpeed);
        if (newFastSpeed !== joyState.fastSpeed) {
            domControls.processKeyEvent(jt.DOMConsoleControls.KEY_FAST_SPEED, newFastSpeed, 0);
            joyState.fastSpeed = newFastSpeed;
        }
    };

    var newControllerState = function() {
        return {
            direction: -1,         // CENTER
            button: false, select: false, reset: false, fastSpeed: false, pause: false,
            xPosition: -1          // PADDLE POSITION
        }
    };

    var detectButton = function() {
    };

    this.applyPreferences = function() {
        joy0Prefs = {
            device         : Javatari.preferences.JP0DEVICE,
            xAxis          : Javatari.preferences.JP0XAXIS,
            xAxisSig       : Javatari.preferences.JP0XAXISSIG,
            yAxis          : Javatari.preferences.JP0YAXIS,
            yAxisSig       : Javatari.preferences.JP0YAXISSIG,
            paddleAxis     : Javatari.preferences.JP0PAXIS,
            paddleAxisSig  : Javatari.preferences.JP0PAXISSIG,
            button         : Javatari.preferences.JP0BUT,
            button2        : Javatari.preferences.JP0BUT2,
            select         : Javatari.preferences.JP0SELECT,
            reset          : Javatari.preferences.JP0RESET,
            pause          : Javatari.preferences.JP0PAUSE,
            fastSpeed      : Javatari.preferences.JP0FAST,
            paddleCenter   : Javatari.preferences.JP0PCENTER * -190 + 190 - 5,
            paddleSens     : Javatari.preferences.JP0PSENS * -190,
            deadzone       : Javatari.preferences.JP0DEADZONE
        };
        joy1Prefs = {
            device         : Javatari.preferences.JP1DEVICE,
            xAxis          : Javatari.preferences.JP1XAXIS,
            xAxisSig       : Javatari.preferences.JP1XAXISSIG,
            yAxis          : Javatari.preferences.JP1YAXIS,
            yAxisSig       : Javatari.preferences.JP1YAXISSIG,
            paddleAxis     : Javatari.preferences.JP1PAXIS,
            paddleAxisSig  : Javatari.preferences.JP1PAXISSIG,
            button         : Javatari.preferences.JP1BUT,
            button2        : Javatari.preferences.JP1BUT2,
            select         : Javatari.preferences.JP1SELECT,
            reset          : Javatari.preferences.JP1RESET,
            pause          : Javatari.preferences.JP1PAUSE,
            fastSpeed      : Javatari.preferences.JP1FAST,
            paddleCenter   : Javatari.preferences.JP1PCENTER * -190 + 190 - 5,
            paddleSens     : Javatari.preferences.JP1PSENS * -190,
            deadzone       : Javatari.preferences.JP1DEADZONE
        };
    };


    var supported = false;
    var gamepadsDetectionDelay = -1;

    var controls = jt.ConsoleControls;
    var consoleControlsSocket;
    var screen;

    var paddleMode = false;
    var swappedMode = false;
    var p1ControlsMode = false;

    var joystick0;
    var joystick1;
    var joy0State;
    var joy1State;
    var joy0Prefs;
    var joy1Prefs;

    var joyButtonDetection = null;


    function Joystick(index, prefs) {

        this.index = index;

        this.update = function(gamepads) {
            gamepad = gamepads[index];
            return !!gamepad;
        };

        this.hasMoved = function() {
            var newTime = gamepad.timestamp;
            if (newTime) {
                if (newTime > lastTimestamp) {
                    lastTimestamp = newTime;
                    return true;
                } else
                    return false;
            } else
                return true;        // Always true if the timestamp property is not supported
        };

        this.getButtonDigital = function(butIndex) {
            var b = gamepad.buttons[butIndex];
            if (typeof(b) === "object") return b.pressed || b.value > 0.5;
            else return b > 0.5;
        };

        this.getDPadDirection = function() {
            if (this.getButtonDigital(12)) {
                if (this.getButtonDigital(15)) return 1;                // NORTHEAST
                else if (this.getButtonDigital(14)) return 7;           // NORTHWEST
                else return 0;                                          // NORTH
            } else if (this.getButtonDigital(13)) {
                if (this.getButtonDigital(15)) return 3;                // SOUTHEAST
                else if (this.getButtonDigital(14)) return 5;           // SOUTHWEST
                else return 4;                                          // SOUTH
            } else if (this.getButtonDigital(14)) return 6;             // WEST
            else if (this.getButtonDigital(15)) return 2;               // EAST
            else return -1;                                             // CENTER
        };

        this.getStickDirection = function() {
            var x = gamepad.axes[xAxis];
            var y = gamepad.axes[yAxis];
            if ((x < 0 ? -x : x) < deadzone) x = 0; else x *= xAxisSig;
            if ((y < 0 ? -y : y) < deadzone) y = 0; else y *= yAxisSig;
            if (x === 0 && y === 0) return -1;
            var dir = (1 - Math.atan2(x, y) / Math.PI) / 2;
            dir += 1/16; if (dir >= 1) dir -= 1;
            return (dir * 8) | 0;
        };

        this.getPaddlePosition = function() {
            var pos = (gamepad.axes[paddleAxis] * paddleAxisSig * paddleSens + paddleCenter) | 0;
            if (pos < 0) pos = 0;
            else if (pos > 380) pos = 380;
            return pos;
        };

        var gamepad;

        var xAxis = prefs.xAxis;
        var yAxis = prefs.yAxis;
        var xAxisSig = prefs.xAxisSig;
        var yAxisSig = prefs.yAxisSig;
        var deadzone = prefs.deadzone;
        var paddleAxis = prefs.paddleAxis;
        var paddleAxisSig = prefs.paddleAxisSig;
        var paddleSens = prefs.paddleSens;
        var paddleCenter = prefs.paddleCenter;

        var lastTimestamp = Number.MIN_VALUE;

    }

};



// Copyright 2015 by Paulo Augusto Peccin. See license.txt distributed with this file.

jt.DOMConsoleControls = function() {
    var self = this;

    function init() {
        gamepadControls = new jt.GamepadConsoleControls(self);
        initKeys();
    }

    this.connect = function(pControlsSocket, pCartridgeSocket) {
        if (cartridgeSocket) cartridgeSocket.removeInsertionListener(this);
        cartridgeSocket = pCartridgeSocket;
        cartridgeSocket.addInsertionListener(this);
        consoleControlsSocket = pControlsSocket;
        consoleControlsSocket.connectControls(this);
        gamepadControls.connect(pControlsSocket);
    };

    this.connectPeripherals = function(screen, consolePanel) {
        videoMonitor = screen.getMonitor();
        gamepadControls.connectScreen(screen);
        this.addInputElements(screen.keyControlsInputElements());
        if (consolePanel) this.addInputElements(consolePanel.keyControlsInputElements());
    };

    this.powerOn = function() {
        preventIEHelp();
        gamepadControls.powerOn();
        if (PADDLES_MODE === 0) setPaddleMode(false, false);
        else if (PADDLES_MODE === 1) setPaddleMode(true, false);
    };

    this.powerOff = function() {
        setPaddleMode(false, false);
        gamepadControls.powerOff();
    };

    this.destroy = function() {
    };

    this.addInputElements = function(elements) {
        for (var i = 0; i < elements.length; i++) {
            elements[i].addEventListener("keydown", this.keyDown);
            elements[i].addEventListener("keyup", this.keyUp);
        }
    };

    this.toggleP1ControlsMode = function() {
        this.setP1ControlsMode(!p1ControlsMode);
        showModeOSD();
    };

    this.setP1ControlsMode = function(state) {
        p1ControlsMode = state;
        gamepadControls.setP1ControlsMode(state);
        this.applyPreferences();
    };

    this.isP1ControlsMode = function() {
        return p1ControlsMode;
    };

    this.togglePaddleMode = function() {
        setPaddleMode(!paddleMode, true);
    };

    this.isPaddleMode = function() {
        return paddleMode;
    };

    this.getGamepadControls = function() {
        return gamepadControls;
    };

    this.keyDown = function(event) {
        var modifiers = 0 | (event.ctrlKey ? KEY_CTRL_MASK : 0) | (event.altKey ? KEY_ALT_MASK : 0) | (event.shiftKey ? KEY_SHIFT_MASK : 0);
        if (processKeyEvent(event.keyCode, true, modifiers)) {
            event.returnValue = false;  // IE
            if (event.preventDefault) event.preventDefault();
            if (event.stopPropagation) event.stopPropagation();
            return false;
        }
    };

    this.keyUp = function(event) {
        var modifiers = 0 | (event.ctrlKey ? KEY_CTRL_MASK : 0) | (event.altKey ? KEY_ALT_MASK : 0) | (event.shiftKey ? KEY_SHIFT_MASK : 0);
        if (processKeyEvent(event.keyCode, false, modifiers)) {
            event.returnValue = false;  // IE
            if (event.preventDefault) event.preventDefault();
            if (event.stopPropagation) event.stopPropagation();
            return false;
        }
    };

    this.cartridgeInserted = function(cartridge) {
        if (!cartridge || PADDLES_MODE >= 0) return;	// Does not interfere if Paddle Mode is forced
        var usePaddles = cartridge.rom.info.p === 1;
        if (paddleMode !== usePaddles) {
          setPaddleMode(usePaddles, false);
        }
    };

    this.clockPulse = function() {
        gamepadControls.clockPulse();
        if (!paddleMode) return;
        // Update paddles position as time passes
        if (paddle0MovingRight) {
            if (!paddle0MovingLeft) {
                paddle0Position -= paddle0Speed;
                if (paddle0Position < 0) paddle0Position = 0;
                consoleControlsSocket.controlValueChanged(controls.PADDLE0_POSITION, paddle0Position);
            }
        } else if (paddle0MovingLeft) {
            paddle0Position += paddle0Speed;
            if (paddle0Position > 380) paddle0Position = 380;
            consoleControlsSocket.controlValueChanged(controls.PADDLE0_POSITION, paddle0Position);
        }
        if (paddle1MovingRight) {
            if (!paddle1MovingLeft) {
                paddle1Position -= paddle1Speed;
                if (paddle1Position < 0) paddle1Position = 0;
                consoleControlsSocket.controlValueChanged(controls.PADDLE1_POSITION, paddle1Position);
            }
        } else if (paddle1MovingLeft) {
            paddle1Position += paddle1Speed;
            if (paddle1Position > 380) paddle1Position = 380;
            consoleControlsSocket.controlValueChanged(controls.PADDLE1_POSITION, paddle1Position);
        }
    };

    this.processKeyEvent = function(keyCode, press, modifiers) {
        if (checkLocalControlKey(keyCode, modifiers, press)) return true;
        var control = controlForEvent(keyCode, modifiers);
        if (control == null) return false;
        if (paddleMode)	control = translatePaddleModeButtons(control);
        var state = self.controlStateMap[control];
        if (!state || (state !== press)) {
            self.controlStateMap[control] = press;
            consoleControlsSocket.controlStateChanged(control, press);
        }
        return true;
    };

    var processKeyEvent = this.processKeyEvent;

    var showModeOSD = function() {
        videoMonitor.showOSD("Controllers: " + (paddleMode ? "Paddles" : "Joysticks") + (p1ControlsMode ? ", Swapped" : ""), true);
    };

    var setPaddleMode = function(mode, showOSD) {
        paddleMode = mode;
        paddle0MovingLeft = paddle0MovingRight = paddle1MovingLeft = paddle1MovingRight = false;
        paddle0Speed = paddle1Speed = 2;
        paddle0Position = paddle1Position = (paddleMode ? 190 : -1);	// -1 = disconnected, won't charge POTs
        // Reset all controls to default state
        for (var i = 0; i < controls.playerDigitalControls.length; i++) {
            consoleControlsSocket.controlStateChanged(controls.playerDigitalControls[i], false);
        }
        consoleControlsSocket.controlValueChanged(controls.PADDLE0_POSITION, paddle0Position);
        consoleControlsSocket.controlValueChanged(controls.PADDLE1_POSITION, paddle1Position);
        gamepadControls.setPaddleMode(paddleMode);
        if (showOSD) showModeOSD();
    };

    var checkLocalControlKey = function(keyCode, modif, press) {
        var control;
        if (press) {
            /*
            if (modif === KEY_ALT_MASK || modif === KEY_CTRL_MASK)
                switch(keyCode) {
                    case KEY_TOGGLE_P1_MODE:
                        self.toggleP1ControlsMode();
                        return true;
                    case KEY_TOGGLE_JOYSTICK:
                        gamepadControls.toggleMode();
                        return true;
                    case KEY_TOGGLE_PADDLE:
                        self.togglePaddleMode();
                        return true;
                }
             */
            if (paddleMode) {
                control = controlForEvent(keyCode, modif);
                if (control == null) return false;
                switch(control) {
                    case controls.JOY0_LEFT:
                        paddle0MovingLeft = true; return true;
                    case controls.JOY0_RIGHT:
                        paddle0MovingRight = true; return true;
                    //case controls.JOY0_UP:
                    //    if (paddle0Speed < 10) paddle0Speed++;
                    //    videoMonitor.showOSD("P1 Paddle speed: " + paddle0Speed, true);
                    //    return true;
                    //case controls.JOY0_DOWN:
                    //    if (paddle0Speed > 1) paddle0Speed--;
                    //    videoMonitor.showOSD("P1 Paddle speed: " + paddle0Speed, true);
                    //    return true;
                    case controls.JOY1_LEFT:
                        paddle1MovingLeft = true; return true;
                    case controls.JOY1_RIGHT:
                        paddle1MovingRight = true; return true;
                    case controls.JOY1_UP:
                        if (paddle1Speed < 10) paddle1Speed++;
                        videoMonitor.showOSD("P2 Paddle speed: " + paddle1Speed, true);
                        return true;
                    case controls.JOY1_DOWN:
                        if (paddle1Speed > 1) paddle1Speed--;
                        videoMonitor.showOSD("P2 Paddle speed: " + paddle1Speed, true);
                        return true;
                }
            }
        } else {
            if (paddleMode) {
                control = controlForEvent(keyCode, modif);
                if (control == null) return false;
                switch(control) {
                    case controls.JOY0_LEFT:
                        paddle0MovingLeft = false; return true;
                    case controls.JOY0_RIGHT:
                        paddle0MovingRight = false; return true;
                    case controls.JOY1_LEFT:
                        paddle1MovingLeft = false; return true;
                    case controls.JOY1_RIGHT:
                        paddle1MovingRight = false; return true;
                }
            }
        }
        return false;
    };

    var controlForEvent = function(keyCode, modif) {
        switch (modif) {
            case 0:
                var joy = joyKeysCodeMap[keyCode];
                if (joy) return joy;
                return normalCodeMap[keyCode];
            case KEY_CTRL_MASK:
                return withCTRLCodeMap[keyCode];
            case KEY_ALT_MASK:
                return withALTCodeMap[keyCode];
        }
        return null;
    };

    var translatePaddleModeButtons = function(control) {
        switch (control) {
            case controls.JOY0_BUTTON: return controls.PADDLE0_BUTTON;
            case controls.JOY1_BUTTON: return controls.PADDLE1_BUTTON;
        }
        return control;
    };

    var preventIEHelp = function() {
        window.onhelp = function () {
            return false;
        };
    };

    var initKeys = function() {
        self.applyPreferences();

        normalCodeMap[KEY_POWER]            = controls.POWER;
        normalCodeMap[KEY_BLACK_WHITE]      = controls.BLACK_WHITE;
        normalCodeMap[KEY_DIFFICULTY0]      = controls.DIFFICULTY0;
        normalCodeMap[KEY_CARTRIDGE_REMOVE] = controls.CARTRIDGE_REMOVE;
        normalCodeMap[KEY_SAVE_STATE_FILE]  = controls.SAVE_STATE_FILE;
        normalCodeMap[KEY_DIFFICULTY1]      = controls.DIFFICULTY1;
        normalCodeMap[KEY_SELECT]           = controls.SELECT;
        normalCodeMap[KEY_SELECT2]          = controls.SELECT;
        normalCodeMap[KEY_RESET]            = controls.RESET;

        withALTCodeMap[KEY_POWER]            = controls.POWER;
        withALTCodeMap[KEY_BLACK_WHITE]      = controls.BLACK_WHITE;
        withALTCodeMap[KEY_DIFFICULTY0]      = controls.DIFFICULTY0;
        withALTCodeMap[KEY_CARTRIDGE_REMOVE] = controls.CARTRIDGE_REMOVE;
        withALTCodeMap[KEY_SAVE_STATE_FILE]  = controls.SAVE_STATE_FILE;
        withALTCodeMap[KEY_DIFFICULTY1]      = controls.DIFFICULTY1;
        withALTCodeMap[KEY_SELECT]           = controls.SELECT;
        withALTCodeMap[KEY_SELECT2]          = controls.SELECT;
        withALTCodeMap[KEY_RESET]            = controls.RESET;

        normalCodeMap[KEY_FAST_SPEED] = controls.FAST_SPEED;

        withALTCodeMap[KEY_PAUSE]          = controls.PAUSE;
        withALTCodeMap[KEY_FRAME]          = controls.FRAME;
        withALTCodeMap[KEY_TRACE]          = controls.TRACE;
        withALTCodeMap[KEY_DEBUG]          = controls.DEBUG;
        withALTCodeMap[KEY_NO_COLLISIONS]  = controls.NO_COLLISIONS;
        withALTCodeMap[KEY_VIDEO_STANDARD] = controls.VIDEO_STANDARD;

        withCTRLCodeMap[KEY_PAUSE]          = controls.PAUSE;
        withCTRLCodeMap[KEY_FRAME]          = controls.FRAME;
        withCTRLCodeMap[KEY_TRACE]          = controls.TRACE;
        withCTRLCodeMap[KEY_DEBUG]          = controls.DEBUG;
        withCTRLCodeMap[KEY_NO_COLLISIONS]  = controls.NO_COLLISIONS;
        withCTRLCodeMap[KEY_VIDEO_STANDARD] = controls.VIDEO_STANDARD;

        withCTRLCodeMap[KEY_POWER] = controls.POWER_FRY;

        withCTRLCodeMap[KEY_STATE_0] = controls.SAVE_STATE_0;
        withCTRLCodeMap[KEY_STATE_0a] = controls.SAVE_STATE_0;
        withCTRLCodeMap[KEY_STATE_1] = controls.SAVE_STATE_1;
        withCTRLCodeMap[KEY_STATE_2] = controls.SAVE_STATE_2;
        withCTRLCodeMap[KEY_STATE_3] = controls.SAVE_STATE_3;
        withCTRLCodeMap[KEY_STATE_4] = controls.SAVE_STATE_4;
        withCTRLCodeMap[KEY_STATE_5] = controls.SAVE_STATE_5;
        withCTRLCodeMap[KEY_STATE_6] = controls.SAVE_STATE_6;
        withCTRLCodeMap[KEY_STATE_7] = controls.SAVE_STATE_7;
        withCTRLCodeMap[KEY_STATE_8] = controls.SAVE_STATE_8;
        withCTRLCodeMap[KEY_STATE_9] = controls.SAVE_STATE_9;
        withCTRLCodeMap[KEY_STATE_10] = controls.SAVE_STATE_10;
        withCTRLCodeMap[KEY_STATE_11] = controls.SAVE_STATE_11;
        withCTRLCodeMap[KEY_STATE_11a] = controls.SAVE_STATE_11;
        withCTRLCodeMap[KEY_STATE_12] = controls.SAVE_STATE_12;
        withCTRLCodeMap[KEY_STATE_12a] = controls.SAVE_STATE_12;

        withALTCodeMap[KEY_STATE_0] = controls.LOAD_STATE_0;
        withALTCodeMap[KEY_STATE_0a] = controls.LOAD_STATE_0;
        withALTCodeMap[KEY_STATE_1] = controls.LOAD_STATE_1;
        withALTCodeMap[KEY_STATE_2] = controls.LOAD_STATE_2;
        withALTCodeMap[KEY_STATE_3] = controls.LOAD_STATE_3;
        withALTCodeMap[KEY_STATE_4] = controls.LOAD_STATE_4;
        withALTCodeMap[KEY_STATE_5] = controls.LOAD_STATE_5;
        withALTCodeMap[KEY_STATE_6] = controls.LOAD_STATE_6;
        withALTCodeMap[KEY_STATE_7] = controls.LOAD_STATE_7;
        withALTCodeMap[KEY_STATE_8] = controls.LOAD_STATE_8;
        withALTCodeMap[KEY_STATE_9] = controls.LOAD_STATE_9;
        withALTCodeMap[KEY_STATE_10] = controls.LOAD_STATE_10;
        withALTCodeMap[KEY_STATE_11] = controls.LOAD_STATE_11;
        withALTCodeMap[KEY_STATE_11a] = controls.LOAD_STATE_11;
        withALTCodeMap[KEY_STATE_12] = controls.LOAD_STATE_12;
        withALTCodeMap[KEY_STATE_12a] = controls.LOAD_STATE_12;

        withALTCodeMap[KEY_CARTRIDGE_FORMAT]    = controls.CARTRIDGE_FORMAT;
        withALTCodeMap[KEY_CARTRIDGE_CLOCK_DEC] = controls.CARTRIDGE_CLOCK_DEC;
        withALTCodeMap[KEY_CARTRIDGE_CLOCK_INC] = controls.CARTRIDGE_CLOCK_INC;

        withCTRLCodeMap[KEY_CARTRIDGE_FORMAT]    = controls.CARTRIDGE_FORMAT;
        withCTRLCodeMap[KEY_CARTRIDGE_CLOCK_DEC] = controls.CARTRIDGE_CLOCK_DEC;
        withCTRLCodeMap[KEY_CARTRIDGE_CLOCK_INC] = controls.CARTRIDGE_CLOCK_INC;
    };

    this.applyPreferences = function() {
        joyKeysCodeMap = {};
        if (!p1ControlsMode) {
            joyKeysCodeMap[Javatari.preferences.KP0LEFT]  = controls.JOY0_LEFT;
            joyKeysCodeMap[Javatari.preferences.KP0UP]    = controls.JOY0_UP;
            joyKeysCodeMap[Javatari.preferences.KP0RIGHT] = controls.JOY0_RIGHT;
            joyKeysCodeMap[Javatari.preferences.KP0DOWN]  = controls.JOY0_DOWN;
            joyKeysCodeMap[Javatari.preferences.KP0BUT]   = controls.JOY0_BUTTON;
            joyKeysCodeMap[Javatari.preferences.KP0BUT2]  = controls.JOY0_BUTTON;
            joyKeysCodeMap[Javatari.preferences.KP1LEFT]  = controls.JOY1_LEFT;
            joyKeysCodeMap[Javatari.preferences.KP1UP]    = controls.JOY1_UP;
            joyKeysCodeMap[Javatari.preferences.KP1RIGHT] = controls.JOY1_RIGHT;
            joyKeysCodeMap[Javatari.preferences.KP1DOWN ] = controls.JOY1_DOWN;
            joyKeysCodeMap[Javatari.preferences.KP1BUT]   = controls.JOY1_BUTTON;
            joyKeysCodeMap[Javatari.preferences.KP1BUT2]  = controls.JOY1_BUTTON;
        } else {
            joyKeysCodeMap[Javatari.preferences.KP0LEFT]  = controls.JOY1_LEFT;
            joyKeysCodeMap[Javatari.preferences.KP0UP]    = controls.JOY1_UP;
            joyKeysCodeMap[Javatari.preferences.KP0RIGHT] = controls.JOY1_RIGHT;
            joyKeysCodeMap[Javatari.preferences.KP0DOWN]  = controls.JOY1_DOWN;
            joyKeysCodeMap[Javatari.preferences.KP0BUT]   = controls.JOY1_BUTTON;
            joyKeysCodeMap[Javatari.preferences.KP0BUT2]  = controls.JOY1_BUTTON;
            joyKeysCodeMap[Javatari.preferences.KP1LEFT]  = controls.JOY0_LEFT;
            joyKeysCodeMap[Javatari.preferences.KP1UP]    = controls.JOY0_UP;
            joyKeysCodeMap[Javatari.preferences.KP1RIGHT] = controls.JOY0_RIGHT;
            joyKeysCodeMap[Javatari.preferences.KP1DOWN]  = controls.JOY0_DOWN;
            joyKeysCodeMap[Javatari.preferences.KP1BUT]   = controls.JOY0_BUTTON;
            joyKeysCodeMap[Javatari.preferences.KP1BUT2]  = controls.JOY0_BUTTON;
        }
    };

    var controls = jt.ConsoleControls;

    var p1ControlsMode = false;
    var paddleMode = false;

    var consoleControlsSocket;
    var cartridgeSocket;
    var videoMonitor;
    var gamepadControls;

    var paddle0Position = 0;			// 380 = LEFT, 190 = MIDDLE, 0 = RIGHT
    var paddle0Speed = 3;				// 1 to 10
    var paddle0MovingLeft = false;
    var paddle0MovingRight = false;
    var paddle1Position = 0;
    var paddle1Speed = 3;
    var paddle1MovingLeft = false;
    var paddle1MovingRight = false;

    var joyKeysCodeMap = {};
    var normalCodeMap = {};
    var withCTRLCodeMap = {};
    var withALTCodeMap = {};

    this.controlStateMap = {};

    this.getControlStateMap = function() {return self.controlStateMap};

    var PADDLES_MODE = Javatari.PADDLES_MODE;


    // Default Key Values

    var KEY_TOGGLE_JOYSTICK  = jt.DOMConsoleControls.KEY_TOGGLE_JOYSTICK;
    var KEY_TOGGLE_P1_MODE   = jt.DOMConsoleControls.KEY_TOGGLE_P1_MODE;
    var KEY_TOGGLE_PADDLE    = jt.DOMConsoleControls.KEY_TOGGLE_PADDLE;
    var KEY_CARTRIDGE_FORMAT = jt.DOMConsoleControls.KEY_CARTRIDGE_FORMAT;
    var KEY_SELECT           = jt.DOMConsoleControls.KEY_SELECT;
    var KEY_SELECT2          = jt.DOMConsoleControls.KEY_SELECT2;
    var KEY_RESET            = jt.DOMConsoleControls.KEY_RESET;
    var KEY_FAST_SPEED       = jt.DOMConsoleControls.KEY_FAST_SPEED;
    var KEY_PAUSE            = jt.DOMConsoleControls.KEY_PAUSE;

    var KEY_POWER            = jt.Keys.VK_F1.c;
    var KEY_BLACK_WHITE      = jt.Keys.VK_F2.c;
    var KEY_DIFFICULTY0      = jt.Keys.VK_F4.c;
    var KEY_DIFFICULTY1      = jt.Keys.VK_F9.c;

    var KEY_FRAME            = jt.Keys.VK_F.c;
    var KEY_TRACE            = jt.Keys.VK_Q.c;
    var KEY_DEBUG            = jt.Keys.VK_D.c;
    var KEY_NO_COLLISIONS    = jt.Keys.VK_C.c;
    var KEY_VIDEO_STANDARD   = jt.Keys.VK_V.c;

    var KEY_STATE_0          = jt.Keys.VK_QUOTE.c;
    var KEY_STATE_0a         = jt.Keys.VK_TILDE.c;
    var KEY_STATE_1          = jt.Keys.VK_1.c;
    var KEY_STATE_2          = jt.Keys.VK_2.c;
    var KEY_STATE_3          = jt.Keys.VK_3.c;
    var KEY_STATE_4          = jt.Keys.VK_4.c;
    var KEY_STATE_5          = jt.Keys.VK_5.c;
    var KEY_STATE_6          = jt.Keys.VK_6.c;
    var KEY_STATE_7          = jt.Keys.VK_7.c;
    var KEY_STATE_8          = jt.Keys.VK_8.c;
    var KEY_STATE_9          = jt.Keys.VK_9.c;
    var KEY_STATE_10         = jt.Keys.VK_0.c;
    var KEY_STATE_11         = jt.Keys.VK_MINUS.c;
    var KEY_STATE_11a        = jt.Keys.VK_MINUS2.c;
    var KEY_STATE_12         = jt.Keys.VK_EQUALS.c;
    var KEY_STATE_12a        = jt.Keys.VK_EQUALS2.c;

    var KEY_SAVE_STATE_FILE  = jt.Keys.VK_F8.c;

    var KEY_CARTRIDGE_CLOCK_DEC = jt.Keys.VK_END.c;
    var KEY_CARTRIDGE_CLOCK_INC = jt.Keys.VK_HOME.c;
    var KEY_CARTRIDGE_REMOVE    = jt.Keys.VK_F7.c;

    var KEY_CTRL_MASK  = 1;
    var KEY_ALT_MASK   = jt.DOMConsoleControls.KEY_ALT_MASK;
    var KEY_SHIFT_MASK = 4;


    init();

};

jt.DOMConsoleControls.KEY_SELECT     = jt.Keys.VK_F11.c;
jt.DOMConsoleControls.KEY_SELECT2    = jt.Keys.VK_F10.c;
jt.DOMConsoleControls.KEY_RESET      = jt.Keys.VK_F12.c;
jt.DOMConsoleControls.KEY_FAST_SPEED = jt.Keys.VK_TAB.c;
jt.DOMConsoleControls.KEY_PAUSE      = jt.Keys.VK_P.c;

jt.DOMConsoleControls.KEY_TOGGLE_JOYSTICK  = jt.Keys.VK_J.c;
jt.DOMConsoleControls.KEY_TOGGLE_P1_MODE   = jt.Keys.VK_K.c;
jt.DOMConsoleControls.KEY_TOGGLE_PADDLE    = jt.Keys.VK_L.c;
jt.DOMConsoleControls.KEY_CARTRIDGE_FORMAT = jt.Keys.VK_B.c;

jt.DOMConsoleControls.KEY_ALT_MASK   = 2;

// Copyright 2015 by Paulo Augusto Peccin. See license.txt distributed with this file.

jt.DOMMonitorControls = function(monitor) {

    function init() {
        initKeys();
    }

    this.addInputElements = function(elements) {
        for (var i = 0; i < elements.length; i++)
            elements[i].addEventListener("keydown", this.keyDown);
    };

    this.keyDown = function(event) {
        var modifiers = 0 | (event.ctrlKey ? KEY_CTRL_MASK : 0) | (event.altKey ? KEY_ALT_MASK : 0) | (event.shiftKey ? KEY_SHIFT_MASK : 0);
        if (processKeyPress(event.keyCode, modifiers)) {
            event.returnValue = false;  // IE
            if (event.preventDefault) event.preventDefault();
            if (event.stopPropagation) event.stopPropagation();
            return false;
        }
    };

    var processKeyPress = function(keyCode, modifiers) {
        var control = controlForEvent(keyCode, modifiers);
        if (!control) return false;
        monitor.controlActivated(control);
        return true;
    };

    var controlForEvent = function(keyCode, modif) {
        switch (modif) {
            case 0:
                return keyCodeMap[keyCode];
            case KEY_ALT_MASK:
                return keyAltCodeMap[keyCode];
            case KEY_SHIFT_MASK:
                return keyShiftCodeMap[keyCode];
            case KEY_CTRL_MASK:
                return keyControlCodeMap[keyCode];
            case KEY_CTRL_MASK | KEY_ALT_MASK:
                return keyControlAltCodeMap[keyCode];
            case KEY_SHIFT_MASK | KEY_CTRL_MASK:
                return keyShiftControlCodeMap[keyCode];
            case KEY_SHIFT_MASK | KEY_ALT_MASK:
                return keyShiftAltCodeMap[keyCode];
        }
        return null;
    };

    var initKeys = function() {
        var monControls = jt.Monitor.Controls;

        keyCodeMap[KEY_EXIT]            = monControls.EXIT;
        keyCodeMap[KEY_CART_FILE]       = monControls.LOAD_CARTRIDGE_FILE;
        keyCodeMap[KEY_CART_URL]        = monControls.LOAD_CARTRIDGE_URL;

        keyAltCodeMap[KEY_CART_FILE]    = monControls.LOAD_CARTRIDGE_FILE;
        keyAltCodeMap[KEY_CART_URL]     = monControls.LOAD_CARTRIDGE_URL;

        keyControlCodeMap[KEY_CART_FILE] = monControls.LOAD_CARTRIDGE_FILE_NO_AUTO_POWER;
        keyControlCodeMap[KEY_CART_URL]  = monControls.LOAD_CARTRIDGE_URL_NO_AUTO_POWER;

        keyAltCodeMap[KEY_CRT_FILTER]   = monControls.CRT_FILTER;
        keyAltCodeMap[KEY_DEBUG]     	= monControls.DEBUG;
        keyAltCodeMap[KEY_STATS]    	= monControls.STATS;
        keyAltCodeMap[KEY_CRT_MODES] 	= monControls.CRT_MODES;
        keyAltCodeMap[KEY_FULLSCREEN]  	= monControls.FULLSCREEN;

        keyControlCodeMap[KEY_CRT_FILTER]   = monControls.CRT_FILTER;
        keyControlCodeMap[KEY_DEBUG]     	= monControls.DEBUG;
        keyControlCodeMap[KEY_STATS]    	= monControls.STATS;
        keyControlCodeMap[KEY_CRT_MODES] 	= monControls.CRT_MODES;
        keyControlCodeMap[KEY_FULLSCREEN]  	= monControls.FULLSCREEN;


        keyShiftCodeMap[KEY_UP]     = monControls.SIZE_MINUS;
        keyShiftCodeMap[KEY_DOWN]   = monControls.SIZE_PLUS;
        keyShiftCodeMap[KEY_LEFT]   = monControls.SIZE_MINUS;
        keyShiftCodeMap[KEY_RIGHT]  = monControls.SIZE_PLUS;

        keyShiftAltCodeMap[KEY_UP]     = monControls.SCALE_Y_MINUS;
        keyShiftAltCodeMap[KEY_DOWN]   = monControls.SCALE_Y_PLUS;
        keyShiftAltCodeMap[KEY_LEFT]   = monControls.SCALE_X_MINUS;
        keyShiftAltCodeMap[KEY_RIGHT]  = monControls.SCALE_X_PLUS;

        keyControlAltCodeMap[KEY_UP]     = monControls.ORIGIN_Y_MINUS;
        keyControlAltCodeMap[KEY_DOWN]   = monControls.ORIGIN_Y_PLUS;
        keyControlAltCodeMap[KEY_LEFT]   = monControls.ORIGIN_X_MINUS;
        keyControlAltCodeMap[KEY_RIGHT]  = monControls.ORIGIN_X_PLUS;

        keyShiftControlCodeMap[KEY_UP]    = monControls.HEIGHT_MINUS;
        keyShiftControlCodeMap[KEY_DOWN]  = monControls.HEIGHT_PLUS;
        keyShiftControlCodeMap[KEY_LEFT]  = monControls.WIDTH_MINUS;
        keyShiftControlCodeMap[KEY_RIGHT] = monControls.WIDTH_PLUS;

        keyShiftCodeMap[KEY_CART_PASTE_INS] = monControls.LOAD_CARTRIDGE_PASTE;
        keyControlCodeMap[KEY_CART_PASTE_V] = monControls.LOAD_CARTRIDGE_PASTE;

        keyCodeMap[KEY_SIZE_DEFAULT] = monControls.SIZE_DEFAULT;
    };


    var keyCodeMap = {};
    var keyShiftCodeMap = {};
    var keyAltCodeMap = {};
    var keyShiftControlCodeMap = {};
    var keyShiftAltCodeMap = {};
    var keyControlCodeMap = {};
    var keyControlAltCodeMap = {};


    var KEY_LEFT           = jt.Keys.VK_LEFT.c;
    var KEY_UP             = jt.Keys.VK_UP.c;
    var KEY_RIGHT          = jt.Keys.VK_RIGHT.c;
    var KEY_DOWN           = jt.Keys.VK_DOWN.c;

    var KEY_SIZE_DEFAULT   = jt.Keys.VK_BACK_SPACE.c;

    var KEY_CART_FILE      = jt.Keys.VK_F5.c;
    var KEY_CART_URL       = jt.Keys.VK_F6.c;
    var KEY_CART_PASTE_V   = jt.Keys.VK_V.c;
    var KEY_CART_PASTE_INS = jt.Keys.VK_INSERT.c;

    var KEY_CRT_FILTER     = jt.Keys.VK_T.c;
    var KEY_CRT_MODES      = jt.Keys.VK_R.c;

    var KEY_DEBUG          = jt.Keys.VK_D.c;
    var KEY_STATS          = jt.Keys.VK_G.c;

    var KEY_FULLSCREEN     = jt.Keys.VK_ENTER.c;

    var KEY_EXIT           = jt.Keys.VK_ESCAPE.c;

    var KEY_CTRL_MASK  = 1;
    var KEY_ALT_MASK   = 2;
    var KEY_SHIFT_MASK = 4;


    //init();

};

// Copyright 2015 by Paulo Augusto Peccin. See license.txt distributed with this file.

jt.Monitor = function() {

    function init(self) {
        prepareResources();
        adjustToVideoStandard(jt.VideoStandard.NTSC);
        setDisplayDefaultSize();
        controls = new jt.DOMMonitorControls(self);
    }

    this.connectDisplay = function(monitorDisplay) {
        display = monitorDisplay;
        var scX = display.displayDefaultOpeningScaleX(displayWidth, displayHeight);
        setDisplayScale(scX, scX / DEFAULT_SCALE_ASPECT_X);
        displayCenter();
    };

    this.connectPeripherals = function(pROMLoader) {
        romLoader = pROMLoader;
    };

    this.connect = function(pVideoSignal, pCartridgeSocket) {
        pCartridgeSocket.addInsertionListener(this);
        videoSignal = pVideoSignal;
        videoSignal.connectMonitor(this);
        adjustToVideoSignal();
    };

    this.addControlInputElements = function(elements) {
        controls.addInputElements(elements);
    };

    this.nextLine = function(pixels, vSynchSignal) {
        // Adjusts to the new signal state (on or off) as necessary
        if (!signalState(pixels !== null))		// If signal is off, we are done
            return false;
        // Process new line received
        var vSynched = false;
        if (line < signalHeight) {
            // Copy to the back buffer only contents that will be displayed
            if (line >= displayOriginY && line < displayOriginY + displayHeight) {
                if (backBuffer)
                    jt.Util.arrayCopy(pixels, displayOriginX, backBuffer, (line - displayOriginY) * signalWidth, displayWidth);
                else
                    jt.Util.uInt32ArrayCopyToUInt8Array(pixels, displayOriginX, backData, (line - displayOriginY) * signalWidth, displayWidth);
            }
        } else
            vSynched = maxLineExceeded();
        line++;
        if (!videoStandardDetected) videoStandardDetectionFrameLineCount++;
        if (vSynchSignal) {
            if (!videoStandardDetected) videoStandardDetectionNewFrame();
            vSynched = newFrame() || vSynched;
        }
        return vSynched;
    };

    this.synchOutput = function() {
        refresh();
    };

    this.currentLine = function() {
        return line;
    };

    this.showOSD = function(message, overlap) {
        display.showOSD(message, overlap);
    };

    this.videoStandardDetectionStart = function() {
        videoStandardDetected = null;
        videoStandardDetectionFrameCount = 0;
        videoStandardDetectionFrameLineCount = 0;
    };

    this.getVideoStandardDetected = function() {
        return videoStandardDetected;
    };

    this.cartridgeInserted = function(cartridge) {
        // Only change mode if not forced
        if (CRT_MODE >= 0) return;
        if (crtMode === 0 || crtMode === 1)
            setCrtMode(!cartridge ? 0 : cartridge.rom.info.c || 0);
    };

    var newFrame = function() {
        if (line < signalHeight - VSYNC_TOLERANCE) return false;

        if (showStats) display.showOSD(videoSignal.standard.name + "  " + line + " lines" /* ,  CRT mode: " + crtModeNames[crtMode] */, true);

        // Start a new frame
        line = 0;
        frame++;
        return true;
    };

    var maxLineExceeded = function() {
        if (line > signalHeight + VSYNC_TOLERANCE + EXTRA_UPPER_VSYNC_TOLERANCE) {
            //if (debug > 0) Util.log("Display maximum scanlines exceeded: " + line);
            return newFrame();
        }
        return false;
    };

    var signalState = function(state) {
        if (state) {
            signalOn = true;
            adjustToVideoSignal();
        } else {
            signalOn = false;
            adjustToVideoSignalOff();
        }
        return state;
    };

    var adjustToVideoStandard = function(videoStandard) {
        signalStandard = videoStandard;
        signalWidth = videoStandard.width;
        signalHeight = videoStandard.height;
        setDisplaySize(displayWidth, displayHeightPct);
        setDisplayOrigin(displayOriginX, displayOriginYPct);
    };

    var videoStandardDetectionNewFrame = function() {
        var linesCount = videoStandardDetectionFrameLineCount;
        videoStandardDetectionFrameLineCount = 0;
        // Only consider frames with linesCount in range with tolerances (NTSC 262, PAL 312)
        if ((linesCount >= 250 && linesCount <= 281)
            || (linesCount >= 300 && linesCount <= 325))
            if (++videoStandardDetectionFrameCount >= 5)
                videoStandardDetectionFinish(linesCount);
    };

    var videoStandardDetectionFinish = function(linesCount) {
        videoStandardDetected = linesCount < 290 ? jt.VideoStandard.NTSC : jt.VideoStandard.PAL;

        // Compute an additional number of lines to make the display bigger, if needed
        // Only used when the detected number of lines per frame is bigger than standard by a reasonable amount
        var prevAdd = videoStandardDetectionAdtLinesPerFrame;
        var newAdd = linesCount - videoStandardDetected.height;
        if (newAdd > 2) newAdd = (newAdd > 6 ? 6 : newAdd) - 2;
        else newAdd = 0;

        // Only sets size now if additional lines changed
        if (newAdd != prevAdd) {
            videoStandardDetectionAdtLinesPerFrame = newAdd;
            adjustToVideoStandard(videoStandardDetected);
        }
    };

    var adjustToVideoSignal = function() {
        if (signalStandard != videoSignal.standard)
            adjustToVideoStandard(videoSignal.standard);
    };

    var adjustToVideoSignalOff = function() {
        line = 0;
        display.adjustToVideoSignalOff();
    };

    var setDisplayDefaultSize = function() {
        setDisplaySize(DEFAULT_WIDTH, DEFAULT_HEIGHT_PCT);
        setDisplayOrigin(DEFAULT_ORIGIN_X, DEFAULT_ORIGIN_Y_PCT);
        if (display != null) {
            var scX = display.displayDefaultOpeningScaleX(displayWidth, displayHeight);
            setDisplayScale(scX, scX / DEFAULT_SCALE_ASPECT_X);
        } else
            setDisplayScale(DEFAULT_SCALE_X, DEFAULT_SCALE_Y);
        displayCenter();
    };

    var setDisplayOrigin = function(x, yPct) {
        displayOriginX = x;
        if (displayOriginX < 0) displayOriginX = 0;
        else if (displayOriginX > signalWidth - displayWidth) displayOriginX = signalWidth - displayWidth;

        displayOriginYPct = yPct;
        if (displayOriginYPct < 0) displayOriginYPct = 0;
        else if ((displayOriginYPct / 100 * signalHeight) > signalHeight - displayHeight)
            displayOriginYPct = (signalHeight - displayHeight) / signalHeight * 100;

        // Compute final display originY, adding a little for additional lines as discovered in last video standard detection
        var adtOriginY = videoStandardDetectionAdtLinesPerFrame / 2;
        displayOriginY = ((displayOriginYPct / 100 * signalHeight) + adtOriginY) | 0;
        if ((displayOriginY + displayHeight) > signalHeight) displayOriginY = signalHeight - displayHeight;
    };

    var setDisplaySize = function(width, heightPct) {
        displayWidth = width;
        if (displayWidth < 10) displayWidth = 10;
        else if (displayWidth > signalWidth) displayWidth = signalWidth;

        displayHeightPct = heightPct;
        if (displayHeightPct < 10) displayHeightPct = 10;
        else if (displayHeightPct > 100) displayHeightPct = 100;

        // Compute final display height, considering additional lines as discovered in last video standard detection
        displayHeight = (displayHeightPct / 100 * (signalHeight + videoStandardDetectionAdtLinesPerFrame)) | 0;
        if (displayHeight > signalHeight) displayHeight = signalHeight;

        setDisplayOrigin(displayOriginX, displayOriginYPct);
        displayUpdateSize();
    };

    var displayUpdateSize = function() {
        if (!display) return;
        display.displaySize((displayWidth * displayScaleX) | 0, (displayHeight * displayScaleY) | 0);
        display.displayMinimumSize((displayWidth * DEFAULT_SCALE_X / DEFAULT_SCALE_Y) | 0, displayHeight);
    };

    var setDisplayScale = function(x, y) {
        displayScaleX = x;
        if (displayScaleX < 1) displayScaleX = 1;
        displayScaleY = y;
        if (displayScaleY < 1) displayScaleY = 1;
        displayUpdateSize();
    };

    var setDisplayScaleDefaultAspect = function(y) {
        var scaleY = y | 0;
        if (scaleY < 1) scaleY = 1;
        setDisplayScale(scaleY * DEFAULT_SCALE_ASPECT_X, scaleY);
    };

    var displayCenter = function() {
        if (display) display.displayCenter();
    };

    var refresh = function() {
        if (!signalOn) return;

        // First paint the offscreen canvas with new frame data
        offContext.putImageData(offImageData, 0, 0);
        // Then refresh display with the new image (canvas) and correct dimensions
        display.refresh(offCanvas, displayWidth, displayHeight);

        if (debug > 0) cleanBackBuffer();
    };

    var toggleFullscreen = function() {
        display.displayToggleFullscreen();
    };

    var crtModeToggle = function() {
         return display.showOSD("Not yet supported!", true); 
        //setCrtMode(crtMode + 1);
    };

    var setCrtMode = function(mode) {
        var newMode = mode > 4 || mode < 0 ? 0 : mode;
        if (crtMode === newMode) return;
        crtMode = newMode;
        display.showOSD("CRT mode: " + CRT_MODE_NAMES[crtMode], true);
    };

    var exit = function() {
        display.exit();
    };

    var prepareResources = function() {
        offCanvas = document.createElement('canvas');
        offCanvas.width = jt.VideoStandard.PAL.width;
        offCanvas.height = jt.VideoStandard.PAL.height;
        offContext = offCanvas.getContext("2d");
        offImageData = offContext.getImageData(0, 0, offCanvas.width, offCanvas.height);
        if (offImageData.data.buffer)
            backBuffer = new Uint32Array(offImageData.data.buffer);
        else {
            // Needed for IE compatibility, which has no underlying buffer
            backData = offImageData.data;
        }
    };

    var cleanBackBuffer = function() {
        // Put a nice green for detection of undrawn lines, for debug purposes
        if (backBuffer) jt.Util.arrayFill(backBuffer, 0xff00ff00);
    };

    var cartridgeChangeDisabledWarning = function() {
        if (Javatari.CARTRIDGE_CHANGE_DISABLED) {
            display.showOSD("Cartridge change is disabled", true);
            return true;
        }
        return false;
    };


    // Controls Interface  -----------------------------------------

    var monControls = jt.Monitor.Controls;

    this.controlActivated = function(control) {
        // All controls are Press-only and repeatable
        switch(control) {
            case monControls.LOAD_CARTRIDGE_FILE:
                if (!cartridgeChangeDisabledWarning()) romLoader.openFileChooserDialog(true);
                break;
            case monControls.LOAD_CARTRIDGE_FILE_NO_AUTO_POWER:
                if (!cartridgeChangeDisabledWarning()) romLoader.openFileChooserDialog(false);
                break;
            case monControls.LOAD_CARTRIDGE_URL:
                if (!cartridgeChangeDisabledWarning()) romLoader.openURLChooserDialog(true);
                break;
            case monControls.LOAD_CARTRIDGE_URL_NO_AUTO_POWER:
                if (!cartridgeChangeDisabledWarning()) romLoader.openURLChooserDialog(false);
                break;
            // TODO Maybe get URL from clipboard?
            //case monControls.LOAD_CARTRIDGE_PASTE:
            //    if (!cartridgeChangeDisabledWarning()) romLoader.openFileChooserDialog();
            //    break;
            case monControls.CRT_MODES:
                crtModeToggle(); break;
            case monControls.CRT_FILTER:
                display.toggleCRTFilter(); break;
            case monControls.STATS:
                showStats = !showStats; display.showOSD(null, true); break;
            case monControls.DEBUG:
                debug++;
                if (debug > 4) debug = 0;
                break;
            case monControls.ORIGIN_X_MINUS:
                setDisplayOrigin(displayOriginX + 1, displayOriginYPct); break;
            case monControls.ORIGIN_X_PLUS:
                setDisplayOrigin(displayOriginX - 1, displayOriginYPct); break;
            case monControls.ORIGIN_Y_MINUS:
                setDisplayOrigin(displayOriginX, displayOriginYPct + 0.5); break;
            case monControls.ORIGIN_Y_PLUS:
                setDisplayOrigin(displayOriginX, displayOriginYPct - 0.5); break;
            case monControls.SIZE_DEFAULT:
                setDisplayDefaultSize(); break;
            case monControls.FULLSCREEN:
                toggleFullscreen(); break;
            case monControls.EXIT:
                exit(); break;
        }
        if (fixedSizeMode) return;
        switch(control) {
            case monControls.WIDTH_MINUS:
                setDisplaySize(displayWidth - 1, displayHeightPct); break;
            case monControls.WIDTH_PLUS:
                setDisplaySize(displayWidth + 1, displayHeightPct); break;
            case monControls.HEIGHT_MINUS:
                setDisplaySize(displayWidth, displayHeightPct - 0.5); break;
            case monControls.HEIGHT_PLUS:
                setDisplaySize(displayWidth, displayHeightPct + 0.5); break;
            case monControls.SCALE_X_MINUS:
                setDisplayScale(displayScaleX - 0.5, displayScaleY); break;
            case monControls.SCALE_X_PLUS:
                setDisplayScale(displayScaleX + 0.5, displayScaleY); break;
            case monControls.SCALE_Y_MINUS:
                setDisplayScale(displayScaleX, displayScaleY - 0.5); break;
            case monControls.SCALE_Y_PLUS:
                setDisplayScale(displayScaleX, displayScaleY + 0.5); break;
            case monControls.SIZE_MINUS:
                setDisplayScaleDefaultAspect(displayScaleY - 1); break;
            case monControls.SIZE_PLUS:
                setDisplayScaleDefaultAspect(displayScaleY + 1); break;
        }
    };


    var display;
    var romLoader;

    var videoSignal;
    var controls;

    var line = 0;
    var frame = 0;

    var offCanvas;

    this.getScreen = function() {
      return offImageData;
    };
    
    this.getScreenURL = function() {
      //return {canvas:offCanvas.toDataURL('image/png'), width:offCanvas.width*displayScaleX, height:offCanvas.height*displayScaleY}; 
      return {canvas:offCanvas.toDataURL('image/png'), width:displayWidth, height:displayHeight}; 
    };

    var offContext;
    var offImageData;

    var backBuffer;
    var backData;       // Needed for IE compatibility, which has no underlying buffer

    var signalOn = false;
    var signalStandard;
    var signalWidth;
    var signalHeight;

    var displayWidth;
    var displayHeight;
    var displayHeightPct;
    var displayOriginX;
    var displayOriginY;
    var displayOriginYPct;
    var displayScaleX;
    var displayScaleY;

    var videoStandardDetected;
    var videoStandardDetectionFrameCount;
    var videoStandardDetectionFrameLineCount = 0;
    var videoStandardDetectionAdtLinesPerFrame = 0;

    var debug = 0;
    var showStats = false;
    var fixedSizeMode = Javatari.SCREEN_RESIZE_DISABLED;

    var DEFAULT_ORIGIN_X = 68;
    var DEFAULT_ORIGIN_Y_PCT = 12.4;		// Percentage of height
    var DEFAULT_WIDTH = 160;
    var DEFAULT_HEIGHT_PCT = 81.5;	        // Percentage of height
    var DEFAULT_SCALE_X = 4;
    var DEFAULT_SCALE_ASPECT_X = 2;
    var DEFAULT_SCALE_Y = 2;
    var VSYNC_TOLERANCE = 16;
    var EXTRA_UPPER_VSYNC_TOLERANCE = 5;
    var CRT_MODE = 0;
    var CRT_MODE_NAMES = [ "OFF", "Phosphor", "Phosphor Scanlines", "RGB", "RGB Phosphor" ];

    var crtMode = CRT_MODE < 0 ? 0 : CRT_MODE;


    init(this);

};

jt.Monitor.Controls = {
    WIDTH_PLUS: 1, HEIGHT_PLUS: 2,
    WIDTH_MINUS: 3, HEIGHT_MINUS: 4,
    ORIGIN_X_PLUS: 5, ORIGIN_Y_PLUS: 6,
    ORIGIN_X_MINUS: 7, ORIGIN_Y_MINUS: 8,
    SCALE_X_PLUS: 9, SCALE_Y_PLUS: 10,
    SCALE_X_MINUS: 11, SCALE_Y_MINUS: 12,
    SIZE_PLUS: 13, SIZE_MINUS: 14,
    SIZE_DEFAULT: 15,
    FULLSCREEN: 16,
    LOAD_CARTRIDGE_FILE: 21, LOAD_CARTRIDGE_FILE_NO_AUTO_POWER: 22,
    LOAD_CARTRIDGE_URL: 23, LOAD_CARTRIDGE_URL_NO_AUTO_POWER: 24,
    LOAD_CARTRIDGE_PASTE: 25,
    CRT_FILTER: 31, CRT_MODES: 32,
    DEBUG: 41, STATS: 42,
    EXIT: 51
};

// Copyright 2015 by Paulo Augusto Peccin. See license.txt distributed with this file.

// TODO Implement phosphor and other CRT modes
jt.CanvasDisplay = function(mainElement) {

    function init(self) {
        setupProperties();
        setupMain();
        setupOSD();
        //setupButtonsBar();
        loadImages();
        context = canvas.getContext("2d");
        monitor = new jt.Monitor();
        monitor.connectDisplay(self);
        monitor.addControlInputElements(self.keyControlsInputElements());
    }

    this.connectPeripherals = function(pROMLoader, stateMedia) {
        pROMLoader.registerForDnD(mainElement);
        pROMLoader.registerForFileInputElement(mainElement);
        stateMedia.registerForDownloadElement(mainElement);
        monitor.connectPeripherals(pROMLoader);
    };

    this.connect = function(pVideoSignal, pControlsSocket, pCartridgeSocket) {
        monitor.connect(pVideoSignal, pCartridgeSocket);
        controlsSocket = pControlsSocket;
    };

    this.powerOn = function() {
        mainElement.style.visibility = "visible";
        this.focus();
        drawLogo();
    };

    this.powerOff = function() {
        mainElement.style.visibility = "hidden";
        mainElement.style.display = "none";
    };

    this.refresh = function(image, iWidth, iHeight) {
        signalIsOn = true;
        context.drawImage(image, 0, 0, iWidth, iHeight, 0, 0, canvas.width, canvas.height);
    };

    this.adjustToVideoSignalOff = function() {
        signalIsOn = false;
        drawLogo();
    };

    this.keyControlsInputElements = function() {
        return [mainElement];
    };

    //noinspection JSUnusedLocalSymbols
    this.displayDefaultOpeningScaleX = function(displayWidth, displayHeight) {
        if (isFullscreen) {
            var winW = fsElement.clientWidth;
            var winH = fsElement.clientHeight;
            var scaleX = winW / displayWidth;
            scaleX -= (scaleX % DEFAULT_SCALE_ASPECT_X);		// Round multiple of the default X scale
            var h = scaleX / DEFAULT_SCALE_ASPECT_X * displayHeight;
            while (h > winH + 35) {										// 35 is a little tolerance
                scaleX -= DEFAULT_SCALE_ASPECT_X;				// Decrease one full default X scale
                h = scaleX / DEFAULT_SCALE_ASPECT_X * displayHeight;
            }
            return scaleX | 0;
        } else
            return DEFAULT_OPENING_SCALE_X;
    };

    this.displaySize = function(width, height) {
        setElementsSizes(width, height);
        setCRTFilter();
        if (!signalIsOn) drawLogo();
    };

    this.displayMinimumSize = function(width, height) {
    };

    this.displayCenter = function() {
        this.focus();
    };

    this.getMonitor = function() {
        return monitor;
    };

    this.showOSD = function(message, overlap) {
        //Util.log(message);
        if (osdTimeout) clearTimeout(osdTimeout);
        if (!message) {
            osd.style.transition = "all 0.15s linear";
            osd.style.top = "-29px";
            osd.style.opacity = 0;
            osdShowing = false;
            return;
        }
        if (overlap || !osdShowing) osd.innerHTML = message;
        osd.style.transition = "none";
        osd.style.top = "15px";
        osd.style.opacity = 1;
        osdShowing = true;
        osdTimeout = setTimeout(function() {
            osd.style.transition = "all 0.15s linear";
            osd.style.top = "-29px";
            osd.style.opacity = 0;
            osdShowing = false;
        }, OSD_TIME);
    };

    this.toggleCRTFilter = function() {
        crtFilter = !crtFilter;
        this.showOSD(crtFilter ? "CRT Filter: ON" : "CRT Filter: OFF", true);
        setCRTFilter();
    };

    //noinspection JSUnresolvedFunction
    this.displayToggleFullscreen = function() {
        if (Javatari.SCREEN_FULLSCREEN_DISABLED) return;

        if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.mozFullScreenElement && !document.msFullscreenElement) {
            if (fsElement.requestFullscreen)
                fsElement.requestFullscreen();
            else if (fsElement.webkitRequestFullscreen)
                fsElement.webkitRequestFullscreen();
            else if (fsElement.webkitRequestFullScreen)
                fsElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
            else if (fsElement.mozRequestFullScreen)
                fsElement.mozRequestFullScreen();
            else if (fsElement.msRequestFullscreen)
                fsElement.msRequestFullscreen();
            else
                this.showOSD("Fullscreen is not supported by your browser!");
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    };

    this.exit = function() {
        controlsSocket.controlStateChanged(jt.ConsoleControls.POWER_OFF, true);
        monitor.controlActivated(jt.Monitor.Controls.SIZE_DEFAULT);
    };

    this.focus = function() {
        canvas.focus();
    };

    var openSettings = function(page) {
        if (!settings) settings = new jt.Settings();
        settings.show(page);
    };

    var fullScreenChanged = function() {
        var fse = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
        isFullscreen = !!fse;
        monitor.controlActivated(jt.Monitor.Controls.SIZE_DEFAULT);
        // Schedule another one to give the browser some time to set full screen properly
        if (isFullscreen)
            setTimeout(function() {
                monitor.controlActivated(jt.Monitor.Controls.SIZE_DEFAULT);
            }, 120);
    };

    var setElementsSizes = function (width, height) {
        canvas.width = width;
        canvas.height = height;
        canvas.style.width = "" + width + "px";
        canvas.style.height = "" + height + "px";
        // Do not change containers sizes while in fullscreen
        if (isFullscreen) return;
        borderElement.style.width = "" + width + "px";
        borderElement.style.height = "" + height + "px";
        width += borderLateral * 2;
        height += borderTop + borderBottom;
        mainElement.style.width = "" + width + "px";
        mainElement.style.height = "" + height + "px";
    };

    var setCRTFilter = function() {
        if (context.imageSmoothingEnabled !== undefined) {
            context.imageSmoothingEnabled = crtFilter;
        } else {
            context.webkitImageSmoothingEnabled = crtFilter;
            context.mozImageSmoothingEnabled = crtFilter;
            context.msImageSmoothingEnabled = crtFilter;
        }
    };

    var drawLogo = function () {
        context.fillStyle = "black";
        context.fillRect(0, 0, canvas.width, canvas.height);
        if (logoImage.isLoaded) {
            var logoWidth = logoImage.width;
            var logoHeight = logoImage.height;
            if (logoHeight > canvas.height * 0.7) {
                var factor = (canvas.height * 0.7) / logoHeight;
                logoHeight = (logoHeight * factor) | 0;
                logoWidth = (logoWidth * factor) | 0;
            }
            context.drawImage(logoImage, ((canvas.width - logoWidth) / 2) | 0, ((canvas.height - logoHeight) / 2) | 0, logoWidth, logoHeight);
        }
    };

    var setupMain = function () {
        mainElement.style.position = "relative";
        mainElement.style.overflow = "hidden";
        mainElement.style.outline = "none";
        mainElement.tabIndex = "-1";               // Make it focusable

        borderElement = document.createElement('div');
        borderElement.style.position = "relative";
        borderElement.style.overflow = "hidden";
        borderElement.style.background = "black";
        borderElement.style.border = "0 solid black";
        borderElement.style.borderWidth = "" + borderTop + "px " + borderLateral + "px " + borderBottom + "px";
        if (Javatari.SCREEN_CONTROL_BAR === 2) {
            borderElement.style.borderImage = "url(" + IMAGE_PATH + "screenborder.png) " +
                borderTop + " " + borderLateral + " " + borderBottom + " repeat stretch";
        }

        fsElement = document.createElement('div');
        fsElement.style.position = "relative";
        fsElement.style.width = "100%";
        fsElement.style.height = "100%";
        fsElement.style.overflow = "hidden";
        fsElement.style.background = "black";

        document.addEventListener("fullscreenchange", fullScreenChanged);
        document.addEventListener("webkitfullscreenchange", fullScreenChanged);
        document.addEventListener("mozfullscreenchange", fullScreenChanged);
        document.addEventListener("msfullscreenchange", fullScreenChanged);

        borderElement.appendChild(fsElement);

        canvas = document.createElement('canvas');
        canvas.style.position = "absolute";
        canvas.style.display = "block";
        canvas.style.left = canvas.style.right = 0;
        canvas.style.top = canvas.style.bottom = 0;
        canvas.style.margin = "auto";
        canvas.tabIndex = "-1";               // Make it focusable
        canvas.style.outline = "none";
        fsElement.appendChild(canvas);

        setElementsSizes(jt.CanvasDisplay.DEFAULT_STARTING_WIDTH, jt.CanvasDisplay.DEFAULT_STARTING_HEIGHT);

        mainElement.appendChild(borderElement);
    };

    var setupButtonsBar = function() {
        buttonsBar = document.createElement('div');
        buttonsBar.style.position = "absolute";
        buttonsBar.style.left = "0";
        buttonsBar.style.right = "0";
        buttonsBar.style.height = "29px";
        if (Javatari.SCREEN_CONTROL_BAR === 2) {
            buttonsBar.style.bottom = "0";
            // No background
        } else if (Javatari.SCREEN_CONTROL_BAR === 1) {
            buttonsBar.style.bottom = "-30px";
            buttonsBar.style.background = "rgba(47, 47, 43, .8)";
            buttonsBar.style.transition = "bottom 0.3s ease-in-out";
            mainElement.addEventListener("mouseover", function() {
                if (buttonsBarHideTimeout) clearTimeout(buttonsBarHideTimeout);
                buttonsBar.style.bottom = "0px";
            });
            mainElement.addEventListener("mouseleave", function() {
                buttonsBarHideTimeout = setTimeout(function() {
                    buttonsBar.style.bottom = "-30px";
                }, 1000);
            });
        } else {
            buttonsBar.style.bottom = "0";
            buttonsBar.style.background = "rgb(44, 44, 40)";
            buttonsBar.style.border = "1px solid black";
        }

        powerButton  = addBarButton(6, -26, 24, 23, -436, -208);
        consoleControlButton(powerButton, jt.ConsoleControls.POWER);
        var fsGap = 23;
        if (!Javatari.SCREEN_FULLSCREEN_DISABLED) {
            fullscreenButton = addBarButton(-53, -26, 24, 22, -387, -209);
            screenControlButton(fullscreenButton, jt.Monitor.Controls.FULLSCREEN);
            fsGap = 0;
        }
        if (!Javatari.SCREEN_RESIZE_DISABLED) {
            scaleDownButton = addBarButton(-92 + fsGap, -26, 18, 22, -342, -209);
            screenControlButton(scaleDownButton, jt.Monitor.Controls.SIZE_MINUS);
            scaleUpButton = addBarButton(-74 + fsGap, -26, 21, 22, -364, -209);
            screenControlButton(scaleUpButton, jt.Monitor.Controls.SIZE_PLUS);
        }

        settingsButton  = addBarButton(-29, -26, 24, 22, -412, -209);
        settingsButton.style.cursor = "pointer";
        settingsButton.addEventListener("mousedown", function (e) {
            if (e.preventDefault) e.preventDefault();
            openSettings();
        });

        logoButton = addBarButton("CENTER", -26, 24, 24, -388, -181);
        logoButton.style.cursor = "pointer";
        logoButton.addEventListener("mousedown", function (e) {
            if (e.preventDefault) e.preventDefault();
            openSettings("ABOUT");
        });

        mainElement.appendChild(buttonsBar);
    };

    var addBarButton = function(x, y, w, h, px, py, noImage) {
        var but = document.createElement('div');
        but.style.position = "absolute";
        if (x === "CENTER") {
            but.style.left = but.style.right = 0;
            but.style.margin = "0 auto";
        } else if (x > 0) but.style.left = "" + x + "px"; else but.style.right = "" + (-w - x) + "px";
        if (y > 0) but.style.top = "" + y + "px"; else but.style.bottom = "" + (-h - y) + "px";
        but.style.width = "" + w + "px";
        but.style.height = "" + h + "px";
        but.style.outline = "none";

        if (!noImage) {
            but.style.backgroundImage = "url(" + IMAGE_PATH + "sprites.png" + ")";
            but.style.backgroundPosition = "" + px + "px " + py + "px";
            but.style.backgroundRepeat = "no-repeat";
        }

        buttonsBar.appendChild(but);

        //but.style.boxSizing = "border-box";
        //but.style.backgroundOrigin = "border-box";
        //but.style.border = "1px solid yellow";

        return but;
    };

    var screenControlButton = function (but, control) {
        but.style.cursor = "pointer";
        but.addEventListener("mousedown", function (e) {
            if (e.preventDefault) e.preventDefault();
            monitor.controlActivated(control);
        });
    };

    var consoleControlButton = function (but, control) {
        but.style.cursor = "pointer";
        but.addEventListener("mousedown", function (e) {
            if (e.preventDefault) e.preventDefault();
            controlsSocket.controlStateChanged(control, true);
        });
    };

    var loadImages = function() {
        logoImage = new Image();
        logoImage.isLoaded = false;
        logoImage.onload = function() {
            logoImage.isLoaded = true;
            drawLogo();
        };
        logoImage.src = IMAGE_PATH + "logo.png";
    };

    var setupOSD = function() {
        osd = document.createElement('div');
        osd.style.position = "absolute";
        osd.style.overflow = "hidden";
        osd.style.top = "-29px";
        osd.style.right = "18px";
        osd.style.height = "29px";
        osd.style.padding = "0 12px";
        osd.style.margin = "0";
        osd.style.font = 'bold 15px/29px sans-serif';
        osd.style.color = "rgb(0, 255, 0)";
        osd.style.background = "rgba(0, 0, 0, 0.4)";
        osd.style.opacity = 0;
        osd.innerHTML = "";
        fsElement.appendChild(osd);
    };

    var setupProperties = function() {
        if (Javatari.SCREEN_CONTROL_BAR === 2) {            // Legacy
            borderTop = 5;
            borderLateral = 5;
            borderBottom = 31;
        } else if (Javatari.SCREEN_CONTROL_BAR === 1) {     // Hover
            borderTop = 1;
            borderLateral = 1;
            borderBottom = 1;
        } else {                                                // Always
            borderTop = 1;
            borderLateral = 1;
            borderBottom = 30;
        }
    };

    var monitor;
    var controlsSocket;
    var settings;

    var borderElement;
    var fsElement;

    var canvas;
    var context;

    var buttonsBar;
    var buttonsBarHideTimeout;

    var osd;
    var osdTimeout;
    var osdShowing = false;

    var signalIsOn = false;
    var crtFilter = false;
    var isFullscreen = false;

    var logoImage;

    var powerButton;
    var logoButton;
    var scaleDownButton;
    var scaleUpButton;
    var fullscreenButton;
    var settingsButton;

    var borderTop;
    var borderLateral;
    var borderBottom;


    var IMAGE_PATH = Javatari.IMAGES_PATH;
    var OSD_TIME = 2500;
    var DEFAULT_SCALE_ASPECT_X = 2;
    var DEFAULT_OPENING_SCALE_X = (Javatari.SCREEN_OPENING_SIZE || 2) * 2;


    init(this);

};

jt.CanvasDisplay.DEFAULT_STARTING_WIDTH = 640;
jt.CanvasDisplay.DEFAULT_STARTING_HEIGHT = 426;

// Copyright 2015 by Paulo Augusto Peccin. See license.txt distributed with this file.

jt.ConsolePanel = function(mainElement) {

    function init() {
        setupMain();
        setupButtons();
        setupCartridgeLabel();
    }

    this.connectPeripherals = function(pScreen, pROMLoader) {
        screen = pScreen;
        screen.getMonitor().addControlInputElements(this.keyControlsInputElements());
        pROMLoader.registerForDnD(mainElement);
    };

    this.connect = function(pControlsSocket, pCartridgeSocket) {
        controlsSocket = pControlsSocket;
        controlsSocket.addForwardedInput(this);
        controlsSocket.addRedefinitionListener(this);   	// Will fire a redefinition event
        cartridgeSocket = pCartridgeSocket;
        cartridgeSocket.addInsertionListener(this);		    // Will fire an insertion event
    };

    this.powerOn = function() {
        mainElement.style.visibility = "visible";
        refreshControls();
        refreshCartridge()
    };

    this.powerOff = function() {
        mainElement.style.visibility = "hidden";
        mainElement.style.display = "none";
    };

    this.keyControlsInputElements = function() {
        return [mainElement];
    };

    var refreshControls = function() {
        // Controls State
        setVisibility(powerButton, !controlsStateReport[controls.POWER]);
        setVisibility(colorButton, controlsStateReport[controls.BLACK_WHITE]);
        setVisibility(selectButton, controlsStateReport[controls.SELECT]);
        setVisibility(resetButton, controlsStateReport[controls.RESET]);
        setVisibility(p0DiffButton, controlsStateReport[controls.DIFFICULTY0]);
        setVisibility(p1DiffButton, controlsStateReport[controls.DIFFICULTY1]);
        refreshCartridge();
    };

    var refreshCartridge = function () {
        // Cartridge Image
        setVisibility(cartInsertedImage, cartridgeInserted);
        setVisibility(cartLabel, cartridgeInserted);

        // Cartridge Label
        cartLabel.innerHTML = (cartridgeInserted && cartridgeInserted.rom.info.l) || DEFAULT_CARTRIDGE_LABEL;
        if (cartridgeInserted && cartridgeInserted.rom.info.lc) {
            var colors = cartridgeInserted.rom.info.lc.trim().split(/\s+/);
            cartLabel.style.color = colors[0] || DEFAULT_CARTRIDGE_LABEL_COLOR;
            cartLabel.style.background = colors[1] || DEFAULT_CARTRIDGE_BACK_COLOR;
            cartLabel.style.borderColor = colors[2] || DEFAULT_CARTRIDGE_BORDER_COLOR;
        } else {
            cartLabel.style.color = DEFAULT_CARTRIDGE_LABEL_COLOR;
            cartLabel.style.background = DEFAULT_CARTRIDGE_BACK_COLOR;
            cartLabel.style.borderColor = DEFAULT_CARTRIDGE_BORDER_COLOR;
        }
    };

    var updateVisibleControlsState = function() {
        controlsSocket.controlsStateReport(controlsStateReport);
        refreshControls();
    };

    var setupMain = function () {
        mainElement.style.position = "relative";
        mainElement.style.width = "" + jt.ConsolePanel.DEFAULT_WIDTH + "px";
        mainElement.style.height = "" + jt.ConsolePanel.DEFAULT_HEIGHT + "px";
        mainElement.style.background = "black url(" + IMAGE_PATH + "sprites.png" + ") no-repeat";
        mainElement.style.outline = "none";
        mainElement.tabIndex = "-1";               // Make it focusable
    };

    var setupButtons = function() {
        powerButton  = addButton(31, 52 - 137, 25, 47, 2, -141);
        consoleControlButton(powerButton, controls.POWER, false);
        colorButton  = addButton(95, 52 - 137, 25, 47, -22, -141);
        consoleControlButton(colorButton, controls.BLACK_WHITE, false);
        selectButton = addButton(351, 52 - 137, 25, 47, -46, -141);
        consoleControlButton(selectButton, controls.SELECT, true);
        resetButton  = addButton(414, 52 - 137, 25, 47, -70, -141);
        consoleControlButton(resetButton, controls.RESET, true);
        p0DiffButton = addButton(162, 4 - 137, 33, 22, -94, -157);
        consoleControlButton(p0DiffButton, controls.DIFFICULTY0, false);
        p1DiffButton = addButton(275, 4 - 137, 33, 22, -94, -137);
        consoleControlButton(p1DiffButton, controls.DIFFICULTY1, false);

        cartInsertedImage =  addButton(141, 51 - 145, 189, 82, -127, -139);
        cartChangeButton = addButton(143, 51 - 144, 184, 55, 0, 0, true);
        monitorCartridgeControlButton(cartChangeButton, jt.Monitor.Controls.LOAD_CARTRIDGE_FILE);

        if (!Javatari.CARTRIDGE_CHANGE_DISABLED) {
            cartChangeFileButton = addButton(171, 51 - 86, 31, 30, 2, -188);
            monitorCartridgeControlButton(cartChangeFileButton, jt.Monitor.Controls.LOAD_CARTRIDGE_FILE);
            setVisibility(cartChangeFileButton, true);
            cartChangeURLButton = addButton(267, 51 - 86, 31, 30, -94, -188);
            monitorCartridgeControlButton(cartChangeURLButton, jt.Monitor.Controls.LOAD_CARTRIDGE_URL);
            setVisibility(cartChangeURLButton, true);
        }
    };

    var addButton = function(x, y, w, h, px, py, noImage) {
        var but = document.createElement('div');
        but.style.opacity = 0;
        but.style.position = "absolute";
        if (x > 0) but.style.left = "" + x + "px"; else but.style.right = "" + (-w - x) + "px";
        if (y > 0) but.style.top = "" + y + "px"; else but.style.bottom = "" + (-h - y) + "px";
        but.style.width = "" + w + "px";
        but.style.height = "" + h + "px";
        but.style.outline = "none";

        if (!noImage) {
            but.style.backgroundImage = "url(" + IMAGE_PATH + "sprites.png" + ")";
            but.style.backgroundPosition = "" + px + "px " + py + "px";
            but.style.backgroundRepeat = "no-repeat";
        }

        mainElement.appendChild(but);

        //but.style.boxSizing = "border-box";
        //but.style.backgroundOrigin = "border-box";
        //but.style.border = "1px solid yellow";

        return but;
    };

    this.consoleControlButton = function (but, control, isHold) {
        if (control) {
            but.style.cursor = "pointer";
            var mouseDown;
            but.addEventListener("mousedown", function (e) {
                if (e.preventDefault) e.preventDefault();
                mouseDown = true;
                controlsSocket.controlStateChanged(control, true);
            });
            if (isHold) {
                but.addEventListener("mouseup", function (e) {
                    if (e.preventDefault) e.preventDefault();
                    mouseDown = false;
                    controlsSocket.controlStateChanged(control, false);
                });
                but.addEventListener("mouseleave", function (e) {
                    if (e.preventDefault) e.preventDefault();
                    if (!mouseDown) return;
                    mouseDown = false;
                    controlsSocket.controlStateChanged(control, false);
                });
            }
        }
    };

    var monitorCartridgeControlButton = function (but, control) {
        but.style.cursor = "pointer";
        // A "click" event and not a "mousedown" is necessary here. Without a click, FF does not open the Open File window
        // TODO Hotkeys for this are also not working in FF since they're not click events!
        but.addEventListener("click", function (e) {
            if (e.preventDefault) e.preventDefault();
            screen.getMonitor().controlActivated(control);
        });
    };

    var setVisibility = function(element, boo) {
        element.style.opacity = boo ? 1 : 0;
    };

    var setupCartridgeLabel = function() {
        // Adjust default colors for the label as per parameters
        var colors = (Javatari.CARTRIDGE_LABEL_COLORS || "").trim().split(/\s+/);
        if (colors[0]) DEFAULT_CARTRIDGE_LABEL_COLOR = colors[0];
        if (colors[1]) DEFAULT_CARTRIDGE_BACK_COLOR = colors[1];
        if (colors[2]) DEFAULT_CARTRIDGE_BORDER_COLOR = colors[2];

        cartLabel = document.createElement('div');
        cartLabel.style.position = "absolute";
        cartLabel.style.overflow = "hidden";
        cartLabel.style.textOverflow = "ellipsis";
        cartLabel.style.whiteSpace = "nowrap";
        cartLabel.style.top = "52px";
        cartLabel.style.left = "158px";
        cartLabel.style.width = "148px";
        cartLabel.style.height = "25px";
        cartLabel.style.padding = "0 2px";
        cartLabel.style.margin = "0";
        cartLabel.style.font = 'bold 14px/25px sans-serif';
        cartLabel.style.textAlign = "center";
        cartLabel.style.color = DEFAULT_CARTRIDGE_LABEL_COLOR;
        cartLabel.style.background = DEFAULT_CARTRIDGE_BACK_COLOR;
        cartLabel.style.border = "1px solid " + DEFAULT_CARTRIDGE_BORDER_COLOR;
        cartLabel.style.opacity = "0";
        cartLabel.innerHTML = "";
        monitorCartridgeControlButton(cartLabel, jt.Monitor.Controls.LOAD_CARTRIDGE_FILE);
        mainElement.appendChild(cartLabel);
    };



    // Controls interface  -----------------------------------

    var controls = jt.ConsoleControls;

    this.controlStateChanged = function(control, state) {
        if (visibleControls[control]) updateVisibleControlsState();
    };

    this.controlValueChanged = function(control, position) {
        //  Nothing to show for positional controls
    };

    this.controlsStateReport = function(report) {
        //  Nothing to report here
    };

    this.controlsStatesRedefined = function () {
        updateVisibleControlsState();
    };


    // Cartridge interface  ------------------------------------

    this.cartridgeInserted = function(cartridge) {
        cartridgeInserted = cartridge;
        refreshCartridge();
    };


    var screen;

    var controlsSocket;
    var controlsStateReport = {};

    var cartridgeSocket;
    var cartridgeInserted;

    var powerButton;
    var colorButton;
    var selectButton;
    var resetButton;
    var p0DiffButton;
    var p1DiffButton;
    var cartInsertedImage;
    var cartChangeButton;
    var cartChangeFileButton;
    var cartChangeURLButton;

    var cartLabel;

    var visibleControls = {};
    visibleControls[controls.POWER] = 1;
    visibleControls[controls.BLACK_WHITE] = 1;
    visibleControls[controls.SELECT] = 1;
    visibleControls[controls.RESET] = 1;
    visibleControls[controls.DIFFICULTY0] = 1;
    visibleControls[controls.DIFFICULTY1] = 1;


    var IMAGE_PATH = Javatari.IMAGES_PATH;
    var DEFAULT_CARTRIDGE_LABEL =       "JAVATARI.js";
    var DEFAULT_CARTRIDGE_LABEL_COLOR =  "#fa2525";
    var	DEFAULT_CARTRIDGE_BACK_COLOR =   "#101010";
    var	DEFAULT_CARTRIDGE_BORDER_COLOR = "transparent";


    init();

};

jt.ConsolePanel.DEFAULT_WIDTH = 465;
jt.ConsolePanel.DEFAULT_HEIGHT = 137;

// Copyright 2015 by Paulo Augusto Peccin. See license.txt distributed with this file.

jt.WebAudioSpeaker = function() {

    this.connect = function(pAudioSignal) {
        audioSignal = pAudioSignal;
        audioSignal.connectMonitor(this);
    };

    this.powerOn = function() {
        createAudioContext();
        if (!audioContext) return;

        processor = audioContext.createScriptProcessor(Javatari.AUDIO_BUFFER_SIZE, 0, 1);
        processor.onaudioprocess = onAudioProcess;
        this.play();
    };

    this.powerOff = function() {
        this.mute();
        audioContext = undefined;
    };

    this.play = function () {
        if (processor) processor.connect(audioContext.destination);
    };

    this.mute = function () {
        if (processor) processor.disconnect();
    };

    var createAudioContext = function() {
        try {
            var constr = (window.AudioContext || window.webkitAudioContext || window.WebkitAudioContext);
            if (!constr) throw new Error("WebAudio API not supported by the browser");
            audioContext = new constr();
            resamplingFactor = jt.TiaAudioSignal.SAMPLE_RATE / audioContext.sampleRate;
            jt.Util.log("Speaker AudioContext created. Sample rate: " + audioContext.sampleRate);
            //jt.Util.log("Audio resampling factor: " + (1/resamplingFactor));
        } catch(e) {
            jt.Util.log("Could not create AudioContext. Audio disabled.\n" + e.message);
        }
    };

    var onAudioProcess = function(event) {
        if (!audioSignal) return;

        // Assumes there is only one channel
        var outputBuffer = event.outputBuffer.getChannelData(0);
        // TODO Be aware of fractional samples to avoid +1 here
        var input = audioSignal.retrieveSamples(((outputBuffer.length * resamplingFactor) | 0) + 1);
        jt.Util.arrayCopyCircularSourceWithStep(
            input.buffer, input.start, input.bufferSize, resamplingFactor,
            outputBuffer, 0, outputBuffer.length
        );
    };


    var audioSignal;
    var resamplingFactor;

    var audioContext;
    var processor;

};

// Copyright 2015 by Paulo Augusto Peccin. See license.txt distributed with this file.

jt.LocalStorageSaveStateMedia = function() {

    this.connect = function(socket) {
        socket.connectMedia(this);
    };

    this.registerForDownloadElement = function (element) {
        downloadLinkElementParent = element;
    };

    this.saveState = function(slot, state) {
        var data = buildDataFromState(state);
        return data && saveToLocalStorage("save" + slot, data);
    };

    this.loadState = function(slot) {
        var data = loadFromLocalStorage("save" + slot);
        return buildStateFromData(data);
    };

    this.saveStateFile = function(fileName, state) {
        var data = buildDataFromState(state);
        return data && startDownload(fileName || "JavatariSave", data);
    };

    this.loadStateFile = function(data) {
        return buildStateFromData(data);
    };

    this.saveResourceToFile = function(entry, data) {
        try {
            var res = data && JSON.stringify(data);
            return saveToLocalStorage(entry, res);
        } catch(ex) {
            // give up
        }
    };

    this.loadResourceFromFile = function(entry) {
        try {
            var res = loadFromLocalStorage(entry);
            return res && JSON.parse(res);
        } catch(ex) {
            // give up
        }
    };

    var saveToLocalStorage = function(entry, data) {
        try {
            localStorage["javatari" + entry] = data;
            return true;
        } catch (e) {
            return false;
        }
    };

    var loadFromLocalStorage = function(entry) {
        try {
            return localStorage["javatari" + entry];
        } catch (e) {
            // give up
        }
    };

    var buildDataFromState = function(state) {
        try {
            return SAVE_STATE_IDENTIFIER + JSON.stringify(state);
        } catch(ex) {
            // give up
        }
    };

    var buildStateFromData = function (data) {
        try {
            var id;
            if (data instanceof Array)
                id = jt.Util.uInt8ArrayToByteString(data.slice(0, SAVE_STATE_IDENTIFIER.length));
            else
                id = data.substr(0, SAVE_STATE_IDENTIFIER.length);

            // Check for the identifier
            if (id !== SAVE_STATE_IDENTIFIER) return;

            var stateData = data.slice(SAVE_STATE_IDENTIFIER.length);
            if (stateData instanceof Array)
                stateData = jt.Util.uInt8ArrayToByteString(stateData);

            return stateData && JSON.parse(stateData);
        } catch(e) {
        }
    };

    var startDownload = function (fileName, data) {
        if (!downloadLinkElement) createDownloadLinkElement();

        // Release previous URL
        if (downloadLinkElement.href) (window.URL || window.webkitURL).revokeObjectURL(downloadLinkElement.href);

        if (fileName) fileName = fileName + SAVE_STATE_FILE_EXTENSION;
        var blob = new Blob([data], {type: "data:application/octet-stream"});
        downloadLinkElement.download = fileName.trim();
        downloadLinkElement.href = (window.URL || window.webkitURL).createObjectURL(blob);
        downloadLinkElement.click();

        return true;
    };

    var createDownloadLinkElement = function () {
        downloadLinkElement = document.createElement('a');
        downloadLinkElement.style.display = "none";
        downloadLinkElement.href = "#";
        downloadLinkElementParent.appendChild(downloadLinkElement);
    };


    var downloadLinkElement;
    var downloadLinkElementParent;

    var SAVE_STATE_IDENTIFIER = "javatarijsstate!";
    var SAVE_STATE_FILE_EXTENSION = ".jst";

};

// Copyright 2015 by Paulo Augusto Peccin. See license.txt distributed with this file.

jt.ROMLoader = function() {
    var self = this;

    this.connect = function(pCartrigeSocket, pSaveStateSocket) {
        cartridgeSocket = pCartrigeSocket;
        saveStateSocket = pSaveStateSocket;
    };

    this.registerForDnD = function (element) {
        element.addEventListener("dragover", onDragOver, false);
        element.addEventListener("drop", onDrop, false);
    };

    this.registerForFileInputElement = function (element) {
        fileInputElementParent = element;
    };

    this.openFileChooserDialog = function(withAutoPower) {
        if (!fileInputElement) createFileInputElement();
        autoPower = withAutoPower !== false;
        fileInputElement.click();
    };

    this.openURLChooserDialog = function(withAutoPower) {
        autoPower = withAutoPower !== false;
        var url;
        try {
            url = localStorage && localStorage[LOCAL_STOARAGE_LAST_URL_KEY];
        } catch (e) {
            // give up
        }
        url = prompt("Load ROM from URL:", url || "");
        if (!url) return;
        url = url.toString().trim();
        if (!url) return;
        try {
            localStorage[LOCAL_STOARAGE_LAST_URL_KEY] = url;
        } catch (e) {
            // give up
        }
        this.loadFromURL(url);
    };

    this.loadFromFile = function (file) {
        jt.Util.log("Reading ROM file: " + file.name);
        var reader = new FileReader();
        reader.onload = function (event) {
            var content = new Uint8Array(event.target.result);
            loadContent(file.name, content);
        };
        reader.onerror = function (event) {
            showError("File reading error: " + event.target.error.name);
        };

        reader.readAsArrayBuffer(file);
    };

    this.loadFromURL = function (url) {
        jt.Util.log("Reading ROM from URL: " + url);

        var req = new XMLHttpRequest();
        req.withCredentials = true;
        req.open("GET", url, true);
        req.responseType = "arraybuffer";
        req.timeout = 2000;
        req.onload = function () {
            if (req.status === 200) {
                var content = new Uint8Array(req.response);
                loadContent(url, content);
            } else
                showError("URL reading error: " + (req.statusText || req.status));
        };
        req.onerror = function () {
            showError("URL reading error: " + (req.statusText || req.status));
        };
        req.ontimeout = function () {
            showError("URL reading error: " + (req.statusText || req.status));
        };

        req.send();
    };

    var onFileInputChange = function(event) {
        event.returnValue = false;  // IE
        if (event.preventDefault) event.preventDefault();
        if (event.stopPropagation) event.stopPropagation();
        event.target.focus();
        if (!this.files || !this.files.length) return;

        var file = this.files[0];
        // Tries to clear the last selected file so the same rom can be chosen
        try {
            fileInputElement.value = "";
        } catch (e) {
            // Ignore
        }
        self.loadFromFile(file);
        return false;
    };

    var onDragOver = function (event) {
        event.returnValue = false;  // IE
        if (event.preventDefault) event.preventDefault();
        if (event.stopPropagation) event.stopPropagation();

        if (Javatari.CARTRIDGE_CHANGE_DISABLED)
            event.dataTransfer.dropEffect = "none";
        else
            event.dataTransfer.dropEffect = "link";
    };

    var onDrop = function (event) {
        event.returnValue = false;  // IE
        if (event.preventDefault) event.preventDefault();
        if (event.stopPropagation) event.stopPropagation();
        event.target.focus();

        autoPower = event.altKey !== true;

        if (Javatari.CARTRIDGE_CHANGE_DISABLED) return;
        if (!event.dataTransfer) return;

        // First try to get local file
        var files = event.dataTransfer && event.dataTransfer.files;
        if (files && files.length > 0) {
            self.loadFromFile(files[0]);
            return;
        }

        // Then try to get URL
        var url = event.dataTransfer.getData("URL");
        if (url && url.length > 0) {
            self.loadFromURL(url);
        }
    };

    var loadContent = function (name, content) {
        var cart, rom, arrContent;
        // First try reading and creating directly
        try {
            arrContent = new Array(content.length);
            jt.Util.arrayCopy(content, 0, arrContent, 0, arrContent.length);
            // Frist try to load as a SaveState file
            if (saveStateSocket.loadStateFile(arrContent)) {
                jt.Util.log("SaveState file loaded");
                return;
            }
            // Then try to load as a normal, uncompressed ROM
            rom = new jt.ROM(name, arrContent);
            cart = jt.CartridgeDatabase.createCartridgeFromRom(rom);
            if (cartridgeSocket) cartridgeSocket.insert(cart, autoPower);
        } catch(e) {
            if (!e.javatari) {
                jt.Util.log(e.stack);
                throw e;
            }

            // If it fails, try assuming its a compressed content (zip with ROMs)
            try {
                var zip = new JSZip(content);
                var files = zip.file(ZIP_INNER_FILES_PATTERN);
                for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                    jt.Util.log("Trying zip file content: " + file.name);
                    try {
                        var cont = file.asUint8Array();
                        arrContent = new Array(cont.length);
                        jt.Util.arrayCopy(cont, 0, arrContent, 0, arrContent.length);
                        rom = new jt.ROM(file.name, arrContent);
                        cart = jt.CartridgeDatabase.createCartridgeFromRom(rom);
                        if (cartridgeSocket) cartridgeSocket.insert(cart, autoPower);
                        return;
                    } catch (ef) {
                        // Move on and try the next file
                    }
                }
                showError("No valid ROM files inside zip file");
            } catch(ez) {
                // Probably not a zip file. Let the original message show
                showError(e.message);
            }
        }
    };

    var showError = function(message) {
        jt.Util.log("" + message);
        jt.Util.message("Could not load ROM:\n\n" + message);
    };

    var createFileInputElement = function (element) {
        fileInputElement = document.createElement("input");
        fileInputElement.id = "ROMLoaderFileInput";
        fileInputElement.type = "file";
        fileInputElement.accept = INPUT_ELEM_ACCEPT_PROP;
        fileInputElement.style.display = "none";
        fileInputElement.addEventListener("change", onFileInputChange);
        fileInputElementParent.appendChild(fileInputElement);
    };


    var cartridgeSocket;
    var saveStateSocket;

    var fileInputElement;
    var fileInputElementParent;

    var autoPower = true;


    var ZIP_INNER_FILES_PATTERN = /^.*\.(bin|BIN|rom|ROM|a26|A26|jst|JST)$/;
    var INPUT_ELEM_ACCEPT_PROP  = ".bin,.rom,.a26,.zip,.jst";
    var LOCAL_STOARAGE_LAST_URL_KEY = "javatarilasturl";


    Javatari.loadROMFromURL = this.loadFromURL;

};
// Copyright 2015 by Paulo Augusto Peccin. See license.txt distributed with this file.

jt.Settings = function() {
    var self = this;

    this.show = function (page) {
        if (!this.panel) {
            create(this);
            setTimeout(function() {
                self.show(page);
            }, 0);
            return;
        }
        preferencesChanged = false;
        controlRedefining = null;
        refreshData();
        if (page) this.setPage(page);
        this["jt-cover"].classList.add("show");
        this["jt-modal"].classList.add("show");
        this.panel.focus();
    };

    this.hide = function () {
        if (preferencesChanged) finishPreferences();
        this["jt-modal"].classList.remove("show");
        this["jt-cover"].classList.remove("show");
        Javatari.room.screen.focus();
    };

    this.setPage = function (page) {
        var contentPosition = {
            "HELP": "0",
            "CONTROLS": "-560px",
            "ABOUT": "-1120px"
        }[page];
        var selectionPosition = {
            "HELP": "0",
            "CONTROLS": "33.3%",
            "ABOUT": "66.6%"
        }[page];

        if (contentPosition) self["jt-content"].style.left = contentPosition;
        if (selectionPosition) self["jt-menu-selection"].style.left = selectionPosition;

        self["jt-menu-help"].classList[page === "HELP" ? "add" : "remove"]("selected");
        self["jt-menu-controls"].classList[page === "CONTROLS" ? "add" : "remove"]("selected");
        self["jt-menu-about"].classList[page === "ABOUT" ? "add" : "remove"]("selected");
    };

    var create = function () {
        var styles = document.createElement('style');
        styles.type = 'text/css';
        styles.innerHTML = SettingsGUI.css();
        document.head.appendChild(styles);

        self.panel = document.createElement("div");
        self.panel.innerHTML = SettingsGUI.html();
        self.panel.style.outline = "none";
        self.panel.tabIndex = -1;
        document.body.appendChild(self.panel);

        delete SettingsGUI.html;
        delete SettingsGUI.css;

        setFields();
        setEvents();
    };

    // Automatic set fields for each child element that has the "id" attribute
    var setFields = function () {
        traverseDOM(self.panel, function (element) {
            if (element.id) self[element.id] = element;
        });

        function traverseDOM(element, func) {
            func(element);
            var child = element.childNodes;
            for (var i = 0; i < child.length; i++) {
                traverseDOM(child[i], func);
            }
        }
    };

    var setEvents = function () {
        // Close the modal with a click outside
        self.panel.addEventListener("mousedown", function (e) {
            if (e.preventDefault) e.preventDefault();
            if (e.stopPropagation) e.stopPropagation();
            self.hide();
        });
        // But do not close the modal with a click inside
        self["jt-modal"].addEventListener("mousedown", function (e) {
            if (e.stopPropagation) e.stopPropagation();
            keyRedefinitonStop();
        });
        // Close with the back button
        self["jt-back"].addEventListener("mousedown", function (e) {
            if (e.preventDefault) e.preventDefault();
            if (e.stopPropagation) e.stopPropagation();
            self.hide();
        });

        // Several key events
        self.panel.addEventListener("keydown", function (e) {
            if (e.preventDefault) e.preventDefault();
            if (e.stopPropagation) e.stopPropagation();
            processKeyEvent(e);
        });

        // Tabs
        self["jt-menu-help"].addEventListener("mousedown", function (e) {
            if (e.preventDefault) e.preventDefault();
            self.setPage("HELP");
        });
        self["jt-menu-controls"].addEventListener("mousedown", function (e) {
            if (e.preventDefault) e.preventDefault();
            self.setPage("CONTROLS");
        });
        self["jt-menu-about"].addEventListener("mousedown", function (e) {
            if (e.preventDefault) e.preventDefault();
            self.setPage("ABOUT");
        });

        // Double click for key redefinition
        for (var control in controlKeys) {
            (function(localControl) {
                self[localControl].addEventListener("mousedown", function (e) {
                    if (e.stopPropagation) e.stopPropagation();
                    if (e.preventDefault) e.preventDefault();
                    reyRedefinitionStart(localControl);
                });
            })(control);
        }

        // Controls Actions
        self["jt-controls-defaults"].addEventListener("mousedown", function (e) {
            if (e.preventDefault) e.preventDefault();
            controlsDefaults();
        });
        self["jt-controls-revert"].addEventListener("mousedown", function (e) {
            if (e.preventDefault) e.preventDefault();
            controlsRevert();
        });

        // Generic Console Controls Commands
        for (var key in controlsCommandKeys) {
            (function(keyLocal) {
                self[controlsCommandKeys[key]].addEventListener("mousedown", function (e) {
                    if (e.preventDefault) e.preventDefault();
                    Javatari.room.controls.processKeyEvent(keyLocal, true, jt.DOMConsoleControls.KEY_ALT_MASK);
                    keyRedefinitonStop();   // will refresh
                });
            })(key | 0);    // must be a number to simulate a keyCode
        }
    };

    var refreshData = function () {
        self["jt-browserinfo"].innerHTML = navigator.userAgent;

        if (Javatari.room.controls.isPaddleMode()) {
            self["jt-control-p1-controller"].style.backgroundPositionY = "-91px";
            self["jt-control-p2-controller"].style.backgroundPositionY = "-91px";
            self["jt-control-p1-up-label"].innerHTML = self["jt-control-p2-up-label"].innerHTML = "+ Speed";
            self["jt-control-p1-down-label"].innerHTML = self["jt-control-p2-down-label"].innerHTML = "- Speed";
        } else {
            self["jt-control-p1-controller"].style.backgroundPositionY = "0";
            self["jt-control-p2-controller"].style.backgroundPositionY = "0";
            self["jt-control-p1-up-label"].innerHTML = self["jt-control-p2-up-label"].innerHTML = "Up";
            self["jt-control-p1-down-label"].innerHTML = self["jt-control-p2-down-label"].innerHTML = "Down";

        }
        var swapped = Javatari.room.controls.isP1ControlsMode();
        self["jt-control-p1-label"].innerHTML = "Player " + (swapped ? "2" : "1");
        self["jt-control-p2-label"].innerHTML = "Player " + (swapped ? "1" : "2");

        for (var control in controlKeys) {
            if (control === controlRedefining) {
                self[control].classList.add("redefining");
                self[control].classList.remove("undefined");
                self[control].innerHTML = "?";
            } else {
                self[control].classList.remove("redefining");
                var keyInfo = jt.KeysByCode[Javatari.preferences[controlKeys[control]]];
                if (keyInfo) {
                    self[control].classList.remove("undefined");
                    self[control].innerHTML = keyInfo.n;
                } else {
                    self[control].classList.add("undefined");
                    self[control].innerHTML = "-";
                }
            }
        }
    };

    var processKeyEvent = function (e) {
        if (e.keyCode === KEY_ESC)
            closeOrKeyRedefinitionStop();
        else if(controlRedefining) keyRedefinitionTry(e.keyCode);
        else {
            if (e.altKey && controlsCommandKeys[e.keyCode]) {
                Javatari.room.controls.keyDown(e);
                refreshData();
            }
        }
    };

    var reyRedefinitionStart = function(control) {
        controlRedefining = control;
        refreshData();
    };

    var keyRedefinitonStop = function() {
        controlRedefining = null;
        refreshData();
    };

    var keyRedefinitionTry = function (keyCode) {
        if (!controlRedefining) return;
        if (!jt.KeysByCode[keyCode]) return;
        if (Javatari.preferences[controlKeys[controlRedefining]] !== keyCode) {
            for (var con in controlKeys)
                if (Javatari.preferences[controlKeys[con]] === keyCode)
                    Javatari.preferences[controlKeys[con]] = -1;

            Javatari.preferences[controlKeys[controlRedefining]] = keyCode;
            preferencesChanged = true;
        }
        keyRedefinitonStop();
    };

    var closeOrKeyRedefinitionStop = function() {
        if (controlRedefining) keyRedefinitonStop();
        else self.hide()
    };

    var controlsDefaults = function () {
        Javatari.preferences.loadDefaults();
        preferencesChanged = true;
        keyRedefinitonStop();   // will refresh
    };

    var controlsRevert = function () {
        Javatari.preferences.load();
        preferencesChanged = false;
        keyRedefinitonStop();   // will refresh
    };

    var finishPreferences = function () {
        Javatari.room.controls.applyPreferences();
        Javatari.preferences.save();
        preferencesChanged = false;
    };

    var controlKeys = {
        "jt-control-p1-button1": "KP0BUT",
        "jt-control-p1-button2": "KP0BUT2",
        "jt-control-p1-up": "KP0UP",
        "jt-control-p1-left": "KP0LEFT",
        "jt-control-p1-right": "KP0RIGHT",
        "jt-control-p1-down": "KP0DOWN",
        "jt-control-p2-button1": "KP1BUT",
        "jt-control-p2-button2": "KP1BUT2",
        "jt-control-p2-up": "KP1UP",
        "jt-control-p2-left": "KP1LEFT",
        "jt-control-p2-right": "KP1RIGHT",
        "jt-control-p2-down": "KP1DOWN"
    };

    var controlRedefining = null;

    var controlsCommandKeys = {};
        controlsCommandKeys[jt.DOMConsoleControls.KEY_TOGGLE_P1_MODE] = "jt-controls-swap-keys";
        controlsCommandKeys[jt.DOMConsoleControls.KEY_TOGGLE_JOYSTICK] = "jt-controls-swap-gamepads";
        controlsCommandKeys[jt.DOMConsoleControls.KEY_TOGGLE_PADDLE] = "jt-controls-toggle-paddles";

    var preferencesChanged = false;

    var KEY_ESC = 27;        // VK_ESC

};


// Copyright 2015 by Paulo Augusto Peccin. See license.txt distributed with this file./**

// HTML and CSS data for Settings

SettingsGUI = {};

SettingsGUI.html = function() {
    return '<div id="jt-cover">' +
        '<div id="jt-modal">' +
        '<div id="jt-menu">' +
        '<div id="jt-back">' +
        '<div id="jt-back-arrow">' +
        '&larr;' +
        '</div>' +
        '</div>' +
        '<div class="caption">' +
        'Settings' +
        '</div>' +
        '<div class="items">' +
        '<div id="jt-menu-help" class="item selected">' +
        'HELP' +
        '</div>' +
        '<div id="jt-menu-controls" class="item">' +
        'CONTROLS' +
        '</div>' +
        '<div id="jt-menu-about" class="item">' +
        'ABOUT' +
        '</div>' +
        '<div id="jt-menu-selection">' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div id="jt-content">' +
        '<div id="jt-help">' +
        '<div class="left">' +
        '<div class="hotkey">' +
        '<div class="command">' +
        '<div class="key key-ctrlalt">' +
        'Ctrl' +
        '</div>' +
        ' + ' +
        '<div class="key">' +
        '1 - 0' +
        '</div>' +
        '</div>' +
        '<div class="desc">' +
        'Save State' +
        '</div>' +
        '</div>' +
        '<div class="hotkey">' +
        '<div class="command">' +
        '<div class="key key-ctrlalt">' +
        'Alt' +
        '</div>' +
        ' + ' +
        '<div class="key">' +
        '1 - 0' +
        '</div>' +
        '</div>' +
        '<div class="desc">' +
        'Load State' +
        '</div>' +
        '</div>' +
        '<div class="hotkey">' +
        '<div class="command">' +
        '<div class="key">' +
        'F8' +
        '</div>' +
        '</div>' +
        '<div class="desc">' +
        'Save State File' +
        '</div>' +
        '</div>' +
        '<div class="hotkey">' +
        '</div>' +
        '<div class="hotkey">' +
        '<div class="command">' +
        '<div class="key key-ctrlalt">' +
        'Alt' +
        '</div>' +
        ' + ' +
        '<div class="key">' +
        'P' +
        '</div>' +
        '</div>' +
        '<div class="desc">' +
        'Pause' +
        '</div>' +
        '</div>' +
        '<div class="hotkey">' +
        '<div class="command">' +
        '<div class="key key-ctrlalt">' +
        'Alt' +
        '</div>' +
        ' + ' +
        '<div class="key">' +
        'F' +
        '</div>' +
        '</div>' +
        '<div class="desc">' +
        'Next Frame' +
        '</div>' +
        '</div>' +
        '<div class="hotkey">' +
        '<div class="command">' +
        '<div class="key key-ctrlalt">' +
        'Alt' +
        '</div>' +
        ' + ' +
        '<div class="key">' +
        'V' +
        '</div>' +
        '</div>' +
        '<div class="desc">' +
        'NTSC/PAL' +
        '</div>' +
        '</div>' +
        '<div class="hotkey">' +
        '<div class="command">' +
        '<div class="key key-ctrlalt">' +
        'Alt' +
        '</div>' +
        ' + ' +
        '<div class="key">' +
        'R' +
        '</div>' +
        '</div>' +
        '<div class="desc">' +
        'CRT Modes' +
        '</div>' +
        '</div>' +
        '<div class="hotkey">' +
        '<div class="command">' +
        '<div class="key key-ctrlalt">' +
        'Alt' +
        '</div>' +
        ' + ' +
        '<div class="key">' +
        'T' +
        '</div>' +
        '</div>' +
        '<div class="desc">' +
        'CRT Filter' +
        '</div>' +
        '</div>' +
        '<div class="hotkey">' +
        '<div class="command">' +
        '<div class="key key-ctrlalt">' +
        'Alt' +
        '</div>' +
        ' + ' +
        '<div class="key">' +
        'G' +
        '</div>' +
        '</div>' +
        '<div class="desc">' +
        'Show Info' +
        '</div>' +
        '</div>' +
        '<div class="hotkey">' +
        '<div class="command">' +
        '<div class="key key-ctrlalt">' +
        'Alt' +
        '</div>' +
        ' + ' +
        '<div class="key">' +
        'D' +
        '</div>' +
        '</div>' +
        '<div class="desc">' +
        'Debug Modes' +
        '</div>' +
        '</div>' +
        '<div class="hotkey">' +
        '<div class="command">' +
        '<div class="key key-ctrlalt">' +
        'Alt' +
        '</div>' +
        ' + ' +
        '<div class="key">' +
        'C' +
        '</div>' +
        '</div>' +
        '<div class="desc">' +
        'Collisions' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div class="right">' +
        '<div class="hotkey">' +
        '<div class="command">' +
        '<div class="key">' +
        'Tab' +
        '</div>' +
        '</div>' +
        '<div class="desc">' +
        'Fast Speed' +
        '</div>' +
        '</div>' +
        '<div class="hotkey">' +
        '<div class="command">' +
        '<div class="key key-ctrlalt">' +
        'Alt' +
        '</div>' +
        ' + ' +
        '<div class="key">' +
        'Enter' +
        '</div>' +
        '</div>' +
        '<div class="desc">' +
        'Full Screen' +
        '</div>' +
        '</div>' +
        '<div class="hotkey">' +
        '<div class="command">' +
        '<div class="key key-ctrlalt">' +
        'Ctrl' +
        '</div>' +
        ' + ' +
        '<div class="key">' +
        'F1' +
        '</div>' +
        '</div>' +
        '<div class="desc">' +
        'Fry Console' +
        '</div>' +
        '</div>' +
        '<div class="hotkey">' +
        '<div class="command">' +
        '<div class="key">' +
        'F7' +
        '</div>' +
        '</div>' +
        '<div class="desc">' +
        'Remove Cartridge' +
        '</div>' +
        '</div>' +
        '<div class="hotkey">' +
        '</div>' +
        '<div class="hotkey">' +
        '<div class="command right-bottom">' +
        '<div class="key">' +
        'Backspace' +
        '</div>' +
        '</div>' +
        '<div class="desc">' +
        'Screen Defaults' +
        '</div>' +
        '</div>' +
        '<div class="hotkey">' +
        '<div class="command right-bottom">' +
        '<div class="key">' +
        'Shift' +
        '</div>' +
        ' + ' +
        '<div class="key">' +
        'Arrows' +
        '</div>' +
        '</div>' +
        '<div class="desc">' +
        'Screen Size' +
        '</div>' +
        '</div>' +
        '<div class="hotkey">' +
        '<div class="command right-bottom">' +
        '<div class="key">' +
        'Shift' +
        '</div>' +
        ' ' +
        '<div class="key key-ctrlalt">' +
        'Alt' +
        '</div>' +
        ' + ' +
        '<div class="key">' +
        'Arrows' +
        '</div>' +
        '</div>' +
        '<div class="desc">' +
        'Screen Scale' +
        '</div>' +
        '</div>' +
        '<div class="hotkey">' +
        '<div class="command right-bottom">' +
        '<div class="key">' +
        'Shift' +
        '</div>' +
        ' ' +
        '<div class="key key-ctrlalt">' +
        'Ctrl' +
        '</div>' +
        ' + ' +
        '<div class="key">' +
        'Arrows' +
        '</div>' +
        '</div>' +
        '<div class="desc">' +
        'Viewport Size' +
        '</div>' +
        '</div>' +
        '<div class="hotkey">' +
        '<div class="command right-bottom">' +
        '<div class="key key-ctrlalt">' +
        'Ctrl' +
        '</div>' +
        ' ' +
        '<div class="key key-ctrlalt">' +
        'Alt' +
        '</div>' +
        ' + ' +
        '<div class="key">' +
        'Arrows' +
        '</div>' +
        '</div>' +
        '<div class="desc">' +
        'Viewport Origin' +
        '</div>' +
        '</div>' +
        '<div class="hotkey">' +
        '</div>' +
        '<div class="hotkey">' +
        '<div class="desc">' +
        'Drag/Drop Files or URLs to load ROMs' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div id="jt-controls">' +
        '<div class="player p1">' +
        '<div id="jt-control-p1-label" class="title">' +
        'Player 1' +
        '</div>' +
        '<div class="command fire1">' +
        'Button<br>' +
        '<div id="jt-control-p1-button1" class="key">' +
        'Space' +
        '</div>' +
        '</div>' +
        '<div class="command up">' +
        '<div id="jt-control-p1-up-label">' +
        'Up' +
        '</div>' +
        '<div id="jt-control-p1-up" class="key">' +
        'Up' +
        '</div>' +
        '</div>' +
        '<div class="command fire2">' +
        'Button<br>' +
        '<div id="jt-control-p1-button2" class="key">' +
        'Del' +
        '</div>' +
        '</div>' +
        '<div class="command left">' +
        'Left<br>' +
        '<div id="jt-control-p1-left" class="key">' +
        'Left' +
        '</div>' +
        '</div>' +
        '<div class="command controller">' +
        '<div id="jt-control-p1-controller">' +
        '</div>' +
        '</div>' +
        '<div class="command right">' +
        'Right<br>' +
        '<div id="jt-control-p1-right" class="key">' +
        'Right' +
        '</div>' +
        '</div>' +
        '<div class="command down">' +
        '<div id="jt-control-p1-down-label">' +
        'Down' +
        '</div>' +
        '<div id="jt-control-p1-down" class="key">' +
        'Down' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div class="player p2">' +
        '<div id="jt-control-p2-label" class="title">' +
        'Player 2' +
        '</div>' +
        '<div class="command fire1">' +
        'Button<br>' +
        '<div id="jt-control-p2-button1" class="key">' +
        'A' +
        '</div>' +
        '</div>' +
        '<div class="command up">' +
        '<div id="jt-control-p2-up-label">' +
        'Up' +
        '</div>' +
        '<div id="jt-control-p2-up" class="key">' +
        'T' +
        '</div>' +
        '</div>' +
        '<div class="command fire2">' +
        'Button<br>' +
        '<div id="jt-control-p2-button2" class="key">' +
        'Dot' +
        '</div>' +
        '</div>' +
        '<div class="command left">' +
        'Left<br>' +
        '<div id="jt-control-p2-left" class="key">' +
        'F' +
        '</div>' +
        '</div>' +
        '<div class="command controller">' +
        '<div id="jt-control-p2-controller">' +
        '</div>' +
        '</div>' +
        '<div class="command right">' +
        'Right<br>' +
        '<div id="jt-control-p2-right" class="key">' +
        'H' +
        '</div>' +
        '</div>' +
        '<div class="command down">' +
        '<div id="jt-control-p2-down-label">' +
        'Down' +
        '</div>' +
        '<div id="jt-control-p2-down" class="key">' +
        'G' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div class="modes">' +
        '<div class="title">' +
        'Modes' +
        '</div>' +
        '<div id="jt-controls-swap-keys" class="hotkey">' +
        '<div class="command">' +
        '<div class="key key-ctrlalt">' +
        'Alt' +
        '</div>' +
        ' + ' +
        '<div class="key">' +
        'K' +
        '</div>' +
        '</div>' +
        '<div class="desc">' +
        'Swap Keys' +
        '</div>' +
        '</div>' +
        '<div id="jt-controls-swap-gamepads" class="hotkey">' +
        '<div class="command">' +
        '<div class="key key-ctrlalt">' +
        'Alt' +
        '</div>' +
        ' + ' +
        '<div class="key">' +
        'J' +
        '</div>' +
        '</div>' +
        '<div class="desc">' +
        'Swap Gamepads' +
        '</div>' +
        '</div>' +
        '<div id="jt-controls-toggle-paddles" class="hotkey">' +
        '<div class="command">' +
        '<div class="key key-ctrlalt">' +
        'Alt' +
        '</div>' +
        ' + ' +
        '<div class="key">' +
        'L' +
        '</div>' +
        '</div>' +
        '<div class="desc">' +
        'Toggle Paddles' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div id="jt-controls-revert">' +
        'REVERT' +
        '</div>' +
        '<div id="jt-controls-defaults">' +
        'DEFAULTS' +
        '</div>' +
        '</div>' +
        '<div id="jt-about">' +
        '<div id="jt-logo-version">' +
        Javatari.VERSION +
        '</div>' +
        '<div class="info">' +
        'Created by Paulo Augusto Peccin' +
        '<br>' +
        '<a href="http://javatari.org">http://javatari.org</a>' +
        '</div>' +
        '<div id="jt-browserinfo">' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>';
};

SettingsGUI.css = function() {
    return '#jt-cover {' +
        'position: fixed;' +
        'top: 0;' +
        'right: 0;' +
        'bottom: 0;' +
        'left: 0;' +
        'visibility: hidden;' +
        'opacity: 0;' +
        'background-color: rgba(0, 0, 0, 0.6);' +
        'transition: all .2s ease-out;' +
        '}' +

        '#jt-cover.show {' +
        'visibility: visible;' +
        'opacity: 1;' +
        '}' +

        '#jt-modal {' +
        'position: relative;' +
        'overflow: hidden;' +
        'width: 560px;' +
        'top: 80px;' +
        'left: -120px;' +
        'margin: 0 auto;' +
        'color: rgba(0, 0, 0, 0.90);' +
        'font-family: arial, sans-serif;' +
        'box-shadow: 3px 3px 15px 2px rgba(0, 0, 0, .4);' +
        'transition: all .2s ease-out;' +
        '}' +

        '#jt-modal.show {' +
        'left: 0;' +
        '}' +

        '#jt-modal .hotkey {' +
        'height: 27px;' +
        'padding: 3px 5px;' +
        'font-size: 13px;' +
        'box-sizing: border-box;' +
        '}' +

        '#jt-modal .hotkey .command {' +
        'position: relative;' +
        'float: left;' +
        'font-weight: 600;' +
        'color: rgba(0, 0, 0, .50);' +
        '}' +

        '#jt-modal .hotkey .desc {' +
        'float: left;' +
        'padding-top: 3px;' +
        '}' +

        '#jt-modal .key {' +
        'position: relative;' +
        'display: inline-block;' +
        'top: -1px;' +
        'min-width: 25px;' +
        'height: 21px;' +
        'padding: 4px 6px 3px;' +
        'box-sizing: border-box;' +
        'font-weight: 600;' +
        'font-size: 12px;' +
        'line-height: 12px;' +
        'color: rgba(0, 0, 0, .68);' +
        'background-color: white;' +
        'border-radius: 3px;' +
        'border: 1px solid rgb(210, 210, 210);' +
        'box-shadow: 0 1px 0 1px rgba(0, 0, 0, .5);' +
        'text-align: center;' +
        '}' +

        '#jt-modal .key-ctrlalt {' +
        'width: 31px;' +
        'padding-left: 0;' +
        'padding-right: 2px;' +
        '}' +

        '#jt-menu {' +
        'position: relative;' +
        'background-color: white;' +
        'border-bottom: 1px solid rgb(200, 200, 200);' +
        '}' +

        '#jt-menu #jt-back {' +
        'position: absolute;' +
        'width: 18px;' +
        'height: 32px;' +
        'margin: 3px;' +
        'padding: 0 11px;' +
        'font-size: 35px;' +
        'color: white;' +
        'cursor: pointer;' +
        '}' +

        '#jt-menu #jt-back:hover {' +
        'background-color: rgba(0, 0, 0, .12);' +
        '}' +

        '#jt-menu #jt-back-arrow {' +
        'position: relative;' +
        'overflow: hidden;' +
        'top: -7px;' +
        '}' +

        '#jt-menu .caption {' +
        'height: 29px;' +
        'margin: 0 -1px;' +
        'padding: 9px 0 0 48px;' +
        'font-size: 19px;' +
        'color: white;' +
        'background-color: rgb(235, 62, 35);' +
        'box-shadow: 0 1px 4px rgba(0, 0, 0, .8);' +
        '}' +

        '#jt-menu .items {' +
        'position: relative;' +
        'width: 70%;' +
        'height: 39px;' +
        'margin: 0 auto;' +
        'font-weight: 600;' +
        '}' +

        '#jt-menu .item {' +
        'float: left;' +
        'width: 33.3%;' +
        'height: 100%;' +
        'padding-top: 13px;' +
        'font-size: 14px;' +
        'color: rgba(0, 0, 0, .43);' +
        'text-align: center;' +
        'cursor: pointer' +
        '}' +

        '#jt-menu .selected {' +
        'color: rgb(224, 56, 34);' +
        '}' +

        '#jt-menu #jt-menu-selection {' +
        'position: absolute;' +
        'left: 0;' +
        'bottom: 0;' +
        'width: 33.3%;' +
        'height: 3px;' +
        'background-color: rgb(235, 62, 35);' +
        'transition: left 0.3s ease-in-out' +
        '}' +


        '#jt-content {' +
        'position: relative;' +
        'left: 0;' +
        'width: 1680px;' +
        'height: 370px;' +
        'background-color: rgb(220, 220, 220);' +
        'transition: left 0.3s ease-in-out' +
        '}' +

        '#jt-help, #jt-controls, #jt-about {' +
        'position: absolute;' +
        'width: 560px;' +
        'height: 100%;' +
        'box-sizing: border-box;' +
        '}' +

        '#jt-help {' +
        'padding-top: 22px;' +
        '}' +

        '#jt-help .left {' +
        'float: left;' +
        'padding-left: 30px;' +
        '}' +

        '#jt-help .right {' +
        'float: left;' +
        'padding-left: 34px;' +
        '}' +

        '#jt-help .left .command {' +
        'width: 104px;' +
        '}' +

        '#jt-help .right .command {' +
        'width: 109px;' +
        '}' +

        '#jt-help .command.right-bottom {' +
        'width: 164px;' +
        '}' +

        '#jt-controls {' +
        'left: 560px;' +
        '}' +

        '#jt-controls .player {' +
        'position: absolute;' +
        'top: 15px;' +
        'width: 217px;' +
        'color: rgba(0, 0, 0, .8);' +
        '}' +

        '#jt-controls .p1 {' +
        'left: 28px;' +
        '}' +

        '#jt-controls .p2 {' +
        'right: 28px;' +
        '}' +

        '#jt-controls .title {' +
        'padding-bottom: 4px;' +
        'margin: 0 14px 8px 12px;' +
        'font-size: 18px;' +
        'text-align: center;' +
        'border-bottom: 2px solid rgba(242, 66, 35, .55);' +
        '}' +

        '#jt-controls .player .command {' +
        'position: relative;' +
        'float: left;' +
        'width: 33%;' +
        'height: 45px;' +
        'font-size: 13px;' +
        'text-align: center;' +
        '}' +

        '#jt-controls .command.fire1, #jt-controls .command.fire2 {' +
        'top: 14px;' +
        '}' +

        '#jt-controls .command.left, #jt-controls .command.right {' +
        'top: 27px;' +
        '}' +

        '#jt-controls .command.down {' +
        'float: none;' +
        'clear: both;' +
        'margin: 0 auto;' +
        '}' +

        '#jt-controls .command.controller {' +
        'height: 90px;' +
        '}' +

        '#jt-controls #jt-control-p1-controller, #jt-controls #jt-control-p2-controller {' +
        'width: 70px;' +
        'height: 89px;' +
        'margin-left: 1px;' +
        'background: url("' + Javatari.IMAGES_PATH + 'sprites.png") no-repeat -466px 0;' +
        '}' +

        '#jt-controls .player .key {' +
        'min-width: 33px;' +
        'height: 23px;' +
        'padding: 5px 6px 4px;' +
        'margin-top: 2px;' +
        'cursor: pointer;' +
        '}' +

        '#jt-controls .player .key:hover {' +
        'box-shadow: 0 1px 0 1px rgba(0, 0, 0, .5), 1px 2px 6px 4px rgb(170, 170, 170);' +
        '}' +

        '#jt-controls .player .key.redefining {' +
        'color: white;' +
        'background-color: rgb(87, 128, 255);' +
        'border-color: rgb(71, 117, 255);' +
        '}' +

        '#jt-controls .player .key.undefined {' +
        'background-color: rgb(255, 150, 130);' +
        'border-color: rgb(255, 130, 90);' +
        '}' +

        '#jt-controls .modes {' +
        'position: absolute;' +
        'top: 200px;' +
        'left: 0;' +
        'right: 0;' +
        'width: 200px;' +
        'margin: 0 auto;' +
        '}' +

        '#jt-controls .modes .hotkey {' +
        'position: relative;' +
        'padding-left: 8px;' +
        'cursor: pointer;' +
        '}' +

        '#jt-controls .modes .hotkey:hover {' +
        'background-color: white;' +
        'box-shadow: 1px 1px 3px 1px rgb(180, 180, 180);' +
        '}' +

        '#jt-controls .modes .command {' +
        'margin-right: 12px;' +
        '}' +

        '#jt-controls-defaults, #jt-controls-revert {' +
        'position: absolute;' +
        'bottom: 18px;' +
        'padding: 7px 10px;' +
        'font-size: 12px;' +
        'font-weight: 600;' +
        'border-radius: 1px;' +
        'cursor: pointer' +
        '}' +

        '#jt-controls-defaults:hover, #jt-controls-revert:hover {' +
        'background-color: white;' +
        'box-shadow: 1px 1px 3px 1px rgb(180, 180, 180);' +
        '}' +

        '#jt-controls-revert {' +
        'right: 30px;' +
        'color: rgba(0, 0, 0, 0.8);' +
        '}' +

        '#jt-controls-defaults {' +
        'right: 115px;' +
        'color: rgb(0, 80, 230);' +
        '}' +


        '#jt-about {' +
        'left: 1120px;' +
        '}' +

        '#jt-about #jt-logo-version {' +
        'width: 248px;' +
        'height: 220px;' +
        'margin: 28px auto 14px;' +
        'font-size: 18px;' +
        'color: rgba(255, 255, 255, 0.97);' +
        'padding-top: 190px;' +
        'box-sizing: border-box;' +
        'text-align: center;' +
        'background: black url("' + Javatari.IMAGES_PATH + 'logo.png") no-repeat 5px 13px;' +
        'background-size: 233px 173px;' +
        'box-shadow: 3px 3px 14px rgb(75, 75, 75);' +
        '}' +

        '#jt-about .info {' +
        'font-size: 18px;' +
        'line-height: 30px;' +
        'text-align: center;' +
        '}' +

        '#jt-about a {' +
        'color: rgb(0, 80, 230);' +
        'text-decoration: none;' +
        '}' +

        '#jt-about #jt-browserinfo {' +
        'position: absolute;' +
        'left: 0;' +
        'right: 0;' +
        'bottom: 7px;' +
        'font-size: 10px;' +
        'text-align: center;' +
        'color: transparent;' +
        '}';
};


// Copyright 2015 by Paulo Augusto Peccin. See license.txt distributed with this file.

jt.Room = function(screenElement, consolePanelElement, cartridgeProvided) {
    var self = this;

    function init() {
        buildPeripherals();
        buildAndPlugConsole();
    }

    this.powerOn = function(paused) {
        setPageVisibilityHandling();
        self.screen.powerOn();
        if (self.consolePanel) this.consolePanel.powerOn();
        self.speaker.powerOn();
        self.controls.powerOn();
        insertCartridgeProvidedIfNoneInserted();
        if (self.console.getCartridgeSocket().inserted() && !self.console.powerIsOn) self.console.powerOn(paused);
    };

    this.powerOff = function() {
        self.console.powerOff();
        self.controls.powerOff();
        self.speaker.powerOff();
        self.screen.powerOff();
        if (self.consolePanel) this.consolePanel.powerOff();
    };

    var insertCartridgeProvidedIfNoneInserted = function() {
        if (self.console.getCartridgeSocket().inserted()) return;
        if (cartridgeProvided) self.console.getCartridgeSocket().insert(cartridgeProvided, false);
    };

    var buildPeripherals = function() {
        self.stateMedia = new jt.LocalStorageSaveStateMedia();
        self.romLoader = new jt.ROMLoader();
        self.screen = new jt.CanvasDisplay(screenElement);
        self.screen.connectPeripherals(self.romLoader, self.stateMedia);
        if (consolePanelElement) {
            self.consolePanel = new jt.ConsolePanel(consolePanelElement);
            self.consolePanel.connectPeripherals(self.screen, self.romLoader);
        }
        self.speaker = new jt.WebAudioSpeaker();
        self.controls = new jt.DOMConsoleControls();
        self.controls.connectPeripherals(self.screen, self.consolePanel);
    };

    var buildAndPlugConsole = function() {
        self.console = new jt.AtariConsole();
        self.stateMedia.connect(self.console.getSavestateSocket());
        self.romLoader.connect(self.console.getCartridgeSocket(), self.console.getSavestateSocket());
        self.screen.connect(self.console.getVideoOutput(), self.console.getControlsSocket(), self.console.getCartridgeSocket());
        if (self.consolePanel) self.consolePanel.connect(self.console.getControlsSocket(), self.console.getCartridgeSocket(), self.controls);
        self.speaker.connect(self.console.getAudioOutput());
        self.controls.connect(self.console.getControlsSocket(), self.console.getCartridgeSocket());
    };

    var setPageVisibilityHandling = function() {
        function visibilityChange() {
            if (document.hidden) self.speaker.mute();
            else self.speaker.play();
        }
        document.addEventListener("visibilitychange", visibilityChange);
    };


    this.screen = null;
    this.consolePanel = null;
    this.speaker = null;
    this.controls = null;
    this.console = null;
    this.stateMedia = null;
    this.romLoader = null;


    init();

};


// Copyright 2015 by Paulo Augusto Peccin. See license.txt distributed with this file.

Javatari.start = function () {
    // Init preferences
    Javatari.preferences.load();
    // Get container elements
    if (!Javatari.screenElement) {
        Javatari.screenElement = document.getElementById(Javatari.SCREEN_ELEMENT_ID);
        if (!Javatari.screenElement)
            throw new Error('Javatari cannot be started. ' +
            'HTML document is missing screen element with id "' + Javatari.SCREEN_ELEMENT_ID + '"');
    }
    if (!Javatari.consolePanelElement)
        Javatari.consolePanelElement = document.getElementById(Javatari.CONSOLE_PANEL_ELEMENT_ID);
    // Build and start emulator
    Javatari.room = new jt.Room(Javatari.screenElement, Javatari.consolePanelElement);
    Javatari.room.powerOn();
    // Auto-load ROM if specified
    if (Javatari.ROM_AUTO_LOAD_URL)
        Javatari.room.romLoader.loadFromURL(Javatari.ROM_AUTO_LOAD_URL);

    Javatari.shutdown = function () {
        if (Javatari.room) Javatari.room.powerOff();
        jt.Util.log("shutdown");
        delete Javatari;
    };

    // Emulator can only be started once
    delete Javatari.start;
    delete Javatari.preLoadImagesAndStart;

    jt.Util.log(Javatari.VERSION + " started");
};


// Pre-load images and start emulator as soon as all are loaded and DOM is ready
Javatari.preLoadImagesAndStart = function() {
    var images = [ "sprites.png", "logo.png", "screenborder.png" ];
    var numImages = images.length;

    var domReady = false;
    var imagesToLoad = numImages;
    function tryLaunch(bypass) {
        if (Javatari.start && Javatari.AUTO_START !== false && (bypass || (domReady && imagesToLoad === 0))) {
            Javatari.start();
            if(replay) {
              var data = JSON.parse(getTrajectory(traj_id).responseText);
              saveReplayTrajectory(data['trajectory'], data['rom'], data['seqid']);
              Javatari.room.console.traj = data['trajectory'];
              Javatari.room.console.rom = data['rom'];
              Javatari.room.console.traj_max_frame = Math.max.apply(null, Object.keys(data['trajectory']).map(Number));
              Javatari.room.console.loadState(data['init_state']);
            }
        }
    }

    document.addEventListener("DOMContentLoaded", function() {
        domReady = true;
        tryLaunch(false);
    });

    for (var i = 0; i < numImages; i++) {
        var img = new Image();
        img.src = Javatari.IMAGES_PATH + images[i];
        img.onload = function() {
            imagesToLoad--;
            tryLaunch(false);
        };
    }

    window.addEventListener("load", function() {
        tryLaunch(true);
    });

};

// Start pre-loading images right away
Javatari.preLoadImagesAndStart();

// misc useful stuff
// all getDecimalScore functions are modified from 
// https://github.com/mgbellemare/Arcade-Learning-Environment/blob/master/src/games/RomUtils.cpp

/* extracts a decimal value from a byte */
indexDecimalScore = function(index, ram) {    
    var digits_val = ram.read(index);
    var right_digit = digits_val & 15;
    var left_digit = digits_val >> 4;
    return ((10 * left_digit) + right_digit);    
};

/* extracts a decimal value from 2 bytes */
doubleIndexDecimalScore = function(lower_index, higher_index, ram) {
    var lower_digits_val = ram.read(lower_index);
    var lower_right_digit = lower_digits_val & 15;
    var lower_left_digit = (lower_digits_val - lower_right_digit) >> 4;
    var score = ((10 * lower_left_digit) + lower_right_digit);
    if (higher_index < 0) {
        return score;
    }
    var higher_digits_val = ram.read(higher_index);
    var higher_right_digit = higher_digits_val & 15;
    var higher_left_digit = (higher_digits_val - higher_right_digit) >> 4;
    score += ((1000 * higher_left_digit) + 100 * higher_right_digit);
    return score;
};

/* extracts a decimal value from 3 bytes */
tripleIndexDecimalScore = function(lower_index, middle_index, higher_index, ram) {
    var score = doubleIndexDecimalScore(lower_index, middle_index, ram);
    var higher_digits_val = ram.read(higher_index);
    var higher_right_digit = higher_digits_val & 15;
    var higher_left_digit = (higher_digits_val - higher_right_digit) >> 4;
    score += ((100000 * higher_left_digit) + 10000 * higher_right_digit);
    return score;
};

var sequenceToServ = function(trajectory, state, game_id, final_score) {
  return $.ajax({url:'/api/save', type:'POST', contentType:'application/json', data: JSON.stringify({'trajectory':trajectory, 'init_state':state,'game_id':game_id, 'final_score':final_score}), success:function(data){console.log('Sequence ' + data + ' saved.'); //window.location.href='/replay/'+data;
  }});
};

var saveFrame = function(data, rom) {
   return $.ajax({type: "POST", contentType:'application/json',  url: "/api/save_frame",  data: JSON.stringify({'screenshot': data['canvas'], 'width':data['width'], 'height':data['height'], 'rom':rom}), async:false});
};

var saveReplayTrajectory = function(data, rom, seqid) {
   return $.ajax({type: "POST", contentType:'application/json',  url: "/api/save_trajectory",  data: JSON.stringify({'trajectory': data, 'rom':rom, 'seqid':seqid}), async:false});

}

getTrajectory = function(trajectory_id) {
    return $.ajax({url:'/api/trajectory/' + trajectory_id, type:'GET', async:false});
};

getScoresForRom = function(rom) {
    return eval($.ajax({url:'/api/quantiles/' + rom, type:'GET', async:false}).responseText);
};

var has_elem = function(arr, elem) {
  return arr.indexOf(elem) > -1;
};

var get_active_keys = function(keyMap){
  var active_keys = []
  for (var key in keyMap) {
    if (keyMap.hasOwnProperty(key) && keyMap[key]) {
      active_keys.push(parseInt(key));
    }
  }
  return active_keys;
};

// numbers should be consistent with ALE constants
// https://github.com/mgbellemare/Arcade-Learning-Environment/blob/2b5c3796a8f1536ffe8219db0e25ea190d3727aa/src/common/Constants.h#L28
var ALEActions = {
  'NOOP': 0,
  'FIRE': 1,
  'UP'  : 2,
  'RIGHT':3,
  'LEFT':4,
  'DOWN':5,
  'UPRIGHT':6,
  'UPLEFT':7,
  'DOWNRIGHT':8,
  'DOWNLEFT':9,
  'UPFIRE':10,
  'RIGHTFIRE':11,
  'LEFTFIRE':12,
  'DOWNFIRE':13,
  'UPRIGHTFIRE':14,
  'UPLEFTFIRE':15,
  'DOWNRIGHTFIRE':16,
  'DOWNLEFTFIRE':17
};

var atariControlsToALE = function(keyMap, ctrls) {                                                                                                            //keyMap to array of ints with keys that are true
    var active_keys = get_active_keys(keyMap);

    //eliminate opposite keys with the assumption that it is higly improbable
    if (has_elem(active_keys, ctrls.JOY0_LEFT) && has_elem(active_keys, ctrls.JOY0_RIGHT)) {
      idx1 = active_keys.indexOf(ctrls.JOY0_LEFT);
      active_keys.splice(idx1,1);
      idx2 = active_keys.indexOf(ctrls.JOY0_RIGHT);
      active_keys.splice(idx2,1);
    }
    if (has_elem(active_keys, ctrls.JOY0_UP) && has_elem(active_keys, ctrls.JOY0_DOWN)) {
      idx1 = active_keys.indexOf(ctrls.JOY0_UP);
      active_keys.splice(idx1,1);
      idx2 = active_keys.indexOf(ctrls.JOY0_DOWN);
      active_keys.splice(idx2,1);
    }

    var isFire = has_elem(active_keys, ctrls.JOY0_BUTTON);

    if(has_elem(active_keys, ctrls.JOY0_UP)) {
      if(has_elem(active_keys, ctrls.JOY0_LEFT)) {
        if(isFire) {
          return ALEActions['UPLEFTFIRE'];
        }
        return ALEActions['UPLEFT'];
      }
      if(has_elem(active_keys, ctrls.JOY0_RIGHT)) {
        if(isFire) {
          return ALEActions['UPRIGHTFIRE'];
        }
        return ALEActions['UPRIGHT'];
      }
      if(isFire) {
        return ALEActions['UPFIRE'];
      }
      return ALEActions['UP'];
    }
    if(has_elem(active_keys, ctrls.JOY0_DOWN)) {
      if(has_elem(active_keys, ctrls.JOY0_LEFT)) {
        if(isFire) {
          return ALEActions['DOWNLEFTFIRE'];
        }
        return ALEActions['DOWNLEFT'];
      }
      if(has_elem(active_keys, ctrls.JOY0_RIGHT)) {
        if(isFire) {
          return ALEActions['DOWNRIGHTFIRE'];
        }
        return ALEActions['DOWNRIGHT'];
      }
      if(isFire) {
        return ALEActions['DOWNFIRE'];
      }
      return ALEActions['DOWN'];
    }
    if(has_elem(active_keys, ctrls.JOY0_LEFT)) {
      if(isFire) {
        return ALEActions['LEFTFIRE'];
      }
      return ALEActions['LEFT'];
    }
    if(has_elem(active_keys,ctrls.JOY0_RIGHT)) {
      if(isFire) {
        return ALEActions['RIGHTFIRE'];
      }
      return ALEActions['RIGHT'];
    }
    if(isFire){
      return ALEActions['FIRE'];
    }
    return ALEActions['NOOP'];
  };

isNumeric = function(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

// Getting score/terminal info from memory is modified from ALE
// https://github.com/mgbellemare/Arcade-Learning-Environment/tree/master/src/games/supported

Qbert = function() {
  this.id = 0;

  this.reset = function() {
    this.reward     = 0;
    this.score      = 0;
    this.terminal   = false;
    this.last_lives = 2;
    this.lives      = 4;
    this.frame      = 0;
  }

  this.ADDITIONAL_RESET = jt.ConsoleControls.JOY0_BUTTON; 
  
  this.reset();

  this.step = function(ram) {
		var lives_value = ram.read('0x88');
    // Lives start at 2 (4 lives, 3 displayed) and go down to 0xFE (death)
    // Alternatively we can die and reset within one frame; we catch this case
    this.terminal = (lives_value ==' 0xFE') || (lives_value == '0x02' && this.last_lives == -1);
   
    var livesAsChar = parseInt(lives_value);

    if (this.last_lives - 1 == livesAsChar) {
			this.lives--
		};
    
		this.last_lives = livesAsChar;

    // update the reward
    // Ignore reward if reset the game via the fire button; otherwise the agent 
    //  gets a big negative reward on its last step 
    if (!this.terminal) {
      var score   = tripleIndexDecimalScore('0xDB', '0xDA', '0xD9', ram);
      var reward  = score - this.score;
      this.reward = reward;
      this.score  = score;
    }
    else {
      this.reward = 0;
		}
    this.frame++;
	};
};

Montezuma = function() {
  this.id = 4;
		this.reset = function() {  
      this.reward   = 0;
      this.score    = 0;
      this.terminal = false;
		  this.lives    = 6;
      this.frame    = 0;
    };   
    this.reset();
  this.ADDITIONAL_RESET = jt.ConsoleControls.JOY0_BUTTON; 

		this.step = function(ram) {
    	var score = tripleIndexDecimalScore('0x95', '0x94', '0x93', ram); 
    	var reward = score - this.score;
    	this.reward = reward;
    	this.score = score;

			var new_lives = ram.read('0xBA');
			var some_byte = ram.read('0xFE');
    	this.terminal = new_lives == 0 && some_byte == '0x60';

    	// Actually does not go up to 8, but that's alright
    	this.lives = (new_lives & 0x7) + 1;
      this.frame++;
	  };
};

Invaders = function() {
  this.id = 3;
	this.reset = function() {
    this.reward   = 0;
	  this.score    = 0;
	  this.terminal = false;
    this.lives    = 3;
    this.frame    = 0;
  };
  this.reset();
	this.ADDITIONAL_RESET = null;
  this.step = function(ram) {
    var score = doubleIndexDecimalScore('0xE8', '0xE6', ram);
    // reward cannot get negative in this game. When it does, it means that the score has looped (overflow)
    this.reward = score - this.score;
    if(this.reward < 0) {
      // 10000 is the highest possible score
      var maximumScore = 10000;
      this.reward = (maximumScore - this.score) + score; 
    }
    this.score = score;
    this.lives = ram.read('0xC9');
  
    tmp = ram.read('0x98') & 0x80;
    this.terminal = tmp || this.lives == 0;
    if(tmp == 128) {
      this.terminal = true;
    }
            
    this.frame++;
  };
};

Pinball = function() {
  this.id = 1;
  this.reset = function() {
    this.reward   = 0;
    this.score    = 0;
    this.lives    = 3;
    this.terminal = false;
    this.frame    = 0;
  };
  this.reset();
	this.ADDITIONAL_RESET = null;

	this.step = function(ram) {
    var score = tripleIndexDecimalScore('0xB0', '0xB2', '0xB4', ram);
    var reward = score - this.score;
    this.reward = reward;
    this.score = score;

    // update terminal status
    var flag = ram.read('0xAF') & 0x1;
    this.terminal = flag != 0;

    // The lives in video pinball are displayed as ball number; so #1 == 3 lives
    var lives_byte = ram.read('0x99') & 0x7;
    // And of course, we keep the 'extra ball' counter in a different memory location
    var extra_ball = ram.read('0xA8') & 0x1;

		this.lives = 4 + extra_ball - lives_byte;
    this.frame++;
	};
};

MsPacMan = function() {
  this.id = 2;
	this.reset = function(ram) {
    this.reward   = 0;
	  this.score    = 0;
	  this.terminal = false;
    this.lives    = 3;
    this.frame    = 0;
  };

  this.reset();
  this.ADDITIONAL_RESET = jt.ConsoleControls.JOY0_BUTTON; 

  this.step = function(ram){
    var score = tripleIndexDecimalScore('0xF8', '0xF9', '0xFA', ram);
    // crazy score when we load the cartridge and the games have not
    // started yet
    //if (score == 1650000) {
    //  score = 0;
    //}
    var reward = score - this.score;
    this.reward = reward;
    this.score = score;

    var lives_byte = ram.read('0xFB') & 0xF;
    var death_timer = ram.read('0xA7');
    this.terminal = (lives_byte == 0 && death_timer == '0x53');

    this.lives = (lives_byte & 0x7) + 1;     
    this.frame++;
  };
};

var envForGame = function(title) {
  switch(title){
    //you get these names from Javatari.cartridge.rom.info.l
    case 'Q-bert':
    case 'qbert':
      return new Qbert();
    case 'Video Pinball':
    case 'pinball':
      return new Pinball();
    case 'Ms. Pac-Man':
    case 'mspacman':
      return new MsPacMan();
    case 'Space Invaders':
    case 'spaceinvaders':
      return new Invaders();
    case 'Montezuma\'s Revenge':
    case 'revenge':
      return new Montezuma();
  }
};
