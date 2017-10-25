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
