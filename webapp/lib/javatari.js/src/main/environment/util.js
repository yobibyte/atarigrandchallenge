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
