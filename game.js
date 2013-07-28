// http://paulirish.com/2011/requestanimationframe-for-smart-animating
// shim layer with setTimeout fallback
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       || 
          window.webkitRequestAnimationFrame || 
          window.mozRequestAnimationFrame    || 
          window.oRequestAnimationFrame      || 
          window.msRequestAnimationFrame     || 
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();



//namespace for the game
var DOT = {

	//initial values
	WIDTH: window.innerWidth,
	HEIGHT: window.innerHeight,
	//the rest is set in the init function
	RATIO: null,
	currentWidth: null,
	currentHeight: null,
	canvas: null,
	ctx: null,
    level: 0,
	// let's keep track of scale
	// along with all initial declarations
	// at the start of the program
	scale:  1,
	// the position of the canvas
	// in relation to the screen
	offset: {top: 0, left: 0},

	// this goes at the start of the program
	// to track players's progress
	score: {
	    taps: 0,
	    hit: 0,
	    escaped: 0,
	    accuracy: 0
	},

	entities:[],

	// Add at the start of the program
	// the amount of game ticks until
	// we spawn a bubble
	nextBubble: 100,

	init: function() {
		DOT.RATIO = DOT.WIDTH / DOT.HEIGHT;
		DOT.currentHeight = DOT.HEIGHT;
		DOT.currentWidth = DOT.WIDTH;

		DOT.canvas = document.getElementsByTagName('canvas')[0];

		DOT.canvas.width = DOT.WIDTH;
		DOT.canvas.height = DOT.HEIGHT;

		//get the canvas context to interact with the canvas api
		DOT.ctx = DOT.canvas.getContext('2d');

		// we need to sniff out Android and iOS
		// so that we can hide the address bar in
		// our resize function
		DOT.ua = navigator.userAgent.toLowerCase();
		DOT.android = DOT.ua.indexOf('android') > -1 ? true : false;
		DOT.ios = ( DOT.ua.indexOf('iphone') > -1 || DOT.ua.indexOf('ipad') > -1  ) ? true : false;

		//lets resize the game after initalized
		DOT.resize();

        //set up a random background color:
        document.bgColor = DOT.randomColor();
        DOT.canvas.background = DOT.randomColor();

		// listen for clicks
		window.addEventListener('mousedown', function(e) {
		    e.preventDefault();
		    DOT.Input.set(e);
		}, false);

		// listen for touches
		window.addEventListener('touchstart', function(e) {
		    // e.preventDefault();
		    // the event object has an array
		    // named touches; we just want
		    // the first touch
		    DOT.Input.set(e.touches[0]);
		}, false);
		window.addEventListener('touchmove', function(e) {
		    // we're not interested in this,
		    // but prevent default behaviour
		    // so the screen doesn't scroll
		    // or zoom
		    e.preventDefault();
		}, false);
		window.addEventListener('touchend', function(e) {
		    // as above
		    e.preventDefault();
		}, false);

		// Add this at the end of DOT.init;
		// it will then repeat continuously
		DOT.loop();

		},

			

		// Add the following functions after DOT.init:

		// this is where all entities will be moved
		// and checked for collisions, etc.
		update: function() {


			var i,
            checkCollision = false; // we only need to check for a collision
                                // if the user tapped on this game tick
 


        if (DOT.entities.length == 0) {
            if (DOT.level < 3) {
                DOT.level++;
            };
            for (var i = 0; i < DOT.level; i++) {
                DOT.entities.push(new DOT.Bubble());
            };
        };
        // decrease our nextBubble counter
        // DOT.nextBubble -= 1;
        // // if the counter is less than zero
        // if (DOT.nextBubble < 0) {
        //     // put a new instance of bubble into our entities array
        //     DOT.entities.push(new DOT.Bubble());
        //     // reset the counter with a random value
        //     DOT.nextBubble = ( Math.random() * 100 ) + 100;
        // }

        // spawn a new instance of Touch
        // if the user has tapped the screen
        if (DOT.Input.tapped) {
            // keep track of taps; needed to 
            // calculate accuracy
            DOT.score.taps += 1;
            // add a new touch
            DOT.entities.push(new DOT.Touch(DOT.Input.x, DOT.Input.y));
            // set tapped back to false
            // to avoid spawning a new touch
            // in the next cycle
            DOT.Input.tapped = false;
            checkCollision = true;
        }

        // cycle through all entities and update as necessary
        for (i = 0; i < DOT.entities.length; i += 1) {
            DOT.entities[i].update();

            if (DOT.entities[i].type === 'bubble' && checkCollision) {
                hit = DOT.collides(DOT.entities[i], 
                                    {x: DOT.Input.x, y: DOT.Input.y, r: 20});
                if (hit) {
                    // spawn an exposion
                    // for (var n = 0; n < 10; n +=1 ) {
                    //     DOT.entities.push(new DOT.Particle(
                    //         DOT.entities[i].x, 
                    //         DOT.entities[i].y, 
                    //         2, 
                    //         // random opacity to spice it up a bit
                    //         'rgba(255,255,255,'+Math.random()*1+')'
                    //     )); 
                    // }
                    DOT.score.hit += 1;
                }

                DOT.entities[i].touched = hit;
            }

            // delete from array if remove property
            // flag is set to true
            if (DOT.entities[i].remove) {
                DOT.entities.splice(i, 1);
            }
        }

        // update wave offset
        // feel free to play with these values for
        // either slower or faster waves
        // DOT.wave.time = new Date().getTime() * 0.002;
        // DOT.wave.offset = Math.sin(DOT.wave.time * 0.8) * 5;

        // calculate accuracy
        DOT.score.accuracy = (DOT.score.hit / DOT.score.taps) * 100;
        DOT.score.accuracy = isNaN(DOT.score.accuracy) ?
            0 :
            ~~(DOT.score.accuracy); // a handy way to round floats

    },

		// this is where we draw all the entities
		render: function() {

		       var i;

			   DOT.ctx.clearRect(0, 0, DOT.WIDTH, DOT.HEIGHT);

			    // cycle through all entities and render to canvas
			    for (i = 0; i < DOT.entities.length; i += 1) {
			        DOT.entities[i].render();
			    }
		},

		// the actual loop
		// requests animation frame,
		// then proceeds to update
		// and render
		loop: function() {

		    requestAnimFrame( DOT.loop );

		    DOT.update();
		    DOT.render();
		},



	resize: function() {
		DOT.currentHeight = window.innerHeight;

		DOT.currentWidth = DOT.currentHeight * DOT.RATIO;

        if (DOT.android) {
            document.getElementById('appStore').style.display= 'none';
            document.getElementById('googlePlay').style.display= 'block';
        };
        if (DOT.ios) {
            document.getElementById('appStore').style.display= 'none';
            document.getElementById('googlePlay').style.display= 'none';
        };


        DOT.canvas.style.width = DOT.currentWidth + 'px';
        DOT.canvas.style.height = DOT.currentHeight + 'px';

		// create extra space on the page allowing us to scroll past the address bar
		if (!DOT.android && !DOT.ios) {
			DOT.canvas.style.height = DOT.currentHeight-80 + 'px';
		}

		


		// add this to the resize function.
		DOT.scale = DOT.currentWidth / DOT.WIDTH;
		DOT.offset.top = DOT.canvas.offsetTop;
		DOT.offset.left = DOT.canvas.offsetLeft;

		window.setTimeout(function() {
			window.scrollTo(0,1);
		}, 100);
        
	}
};

DOT.randomColor = function () {
    return Math.floor(Math.random()*16777215).toString(16);
};

// abstracts various canvas operations into
// standalone functions
DOT.Draw = {

    clear: function() {
        DOT.ctx.clearRect(0, 0, DOT.WIDTH, DOT.HEIGHT);
    },

    rect: function(x, y, w, h, col) {
        DOT.ctx.fillStyle = col;
        DOT.ctx.fillRect(x, y, w, h);
    },

    dot: function(x, y, r, red, green, blue, alpha) {

        //draw the white circle
        DOT.ctx.fillStyle = 'rgba(255,255,255,'+alpha+')';
        DOT.ctx.beginPath();
        DOT.ctx.arc(x + 5, y + 5, r, 0,  Math.PI * 2, true);
        DOT.ctx.closePath();
        DOT.ctx.fill();
        
        DOT.ctx.fillStyle = 'rgba('+red+','+green+','+blue+','+alpha+')';
        DOT.ctx.beginPath();
        DOT.ctx.arc(x + 5, y + 5, r-r/8, 0,  Math.PI * 2, true);
        DOT.ctx.closePath();
        DOT.ctx.fill();
    },

    text: function(string, x, y, size, col) {
        DOT.ctx.font = 'bold '+size+'px Monospace';
        DOT.ctx.fillStyle = col;
        DOT.ctx.fillText(string, x, y);
    }

};

DOT.Input = {

    x: 0,
    y: 0,
    tapped :false,

    set: function(data) {
		this.x = (data.pageX - DOT.offset.left) / DOT.scale;
		this.y = (data.pageY - DOT.offset.top) / DOT.scale;
        this.tapped = true; 

        // DOT.Draw.circle(this.x, this.y, 10, 'red');
    }

};

DOT.Touch = function(x, y) {

    this.type = 'touch';    // we'll need this later
    this.x = x;             // the x coordinate
    this.y = y;             // the y coordinate
    this.r = 5;             // the radius
    this.opacity = 1;       // initial opacity; the dot will fade out
    this.fade = 0.05;       // amount by which to fade on each game tick
    this.remove = false;    // flag for removing this entity. DOT.update
                            // will take care of this

    this.update = function() {
        // reduce the opacity accordingly
        this.opacity -= this.fade; 
        // if opacity if 0 or less, flag for removal
        this.remove = (this.opacity < 0) ? true : false;
    };

    this.render = function() {
        // DOT.Draw.circle(this.x, this.y, this.r, 'rgba(255,0,0,'+this.opacity+')');
    };

};

DOT.Bubble = function() {

    this.type = 'bubble';
    maxDotSize = 60;
    dotSize = DOT.HEIGHT/1;
    this.touched = false;
    this.alpha = 0.1;

    this.r = (dotSize > maxDotSize) ? maxDotSize : dotSize;

    this.speedX = (Math.random() * 8 -4);
    this.speedY = (Math.random() * 8 -4);
    this.color = DOT.randomColor();
    this.red = Math.floor( Math.random()*255);
    this.green = Math.floor( Math.random()*255);
    this.blue = Math.floor( Math.random()*255);

    this.x = (Math.random() * (DOT.WIDTH - (this.r*2)) + this.r);
    this.y = (Math.random() * (DOT.HEIGHT - (this.r*2)) + this.r);

    this.remove = false;

    this.update = function() {

        this.y -= this.speedY;
        this.x -= this.speedX;
        var player1 = document.getElementById('player1');
        var player2 = document.getElementById('player2');

        if (collides({x: this.x-this.r, y: this.y-this.r, width: this.r*2, height: this.r*2}, {x: player1.offsetLeft, y: player1.offsetTop, width: player1.offsetWidth, height: player1.offsetHeight})) {this.speedX = -this.speedX;};
        if (collides({x: this.x-this.r, y: this.y-this.r, width: this.r*2, height: this.r*2}, {x: player2.offsetLeft, y: player2.offsetTop, width: player2.offsetWidth, height: player2.offsetHeight})) {this.speedX = -this.speedX;};

        // if off screen, flag for removal
        if (this.y-this.r < 0 || this.y+this.r > DOT.HEIGHT) {
            this.speedY = -this.speedY;
        }
        if (this.x-this.r < -this.r || this.x+this.r > DOT.WIDTH+this.r) {
            this.touched = true;
        }
        // console.log(this.x);

    };

    this.render = function() {
        // DOT.Draw.circle(this.x, this.y, this.r, '#ffffff');
        // DOT.Draw.circle(this.x, this.y, this.r-this.r/6, this.color);

        if (this.touched) {
            this.alpha = this.alpha-0.05;
            this.r = this.r+3;
        };
        if (this.alpha < 0.1) {this.remove = true;}
        else if(this.alpha < 1.0 && !this.touched){this.alpha = this.alpha+0.1};

        DOT.Draw.dot(this.x, this.y, this.r, this.red, this.green, this.blue, this.alpha);
    };

};

function collides(a, b) {
  return a.x < b.x + b.width &&
         a.x + a.width > b.x &&
         a.y < b.y + b.height &&
         a.y + a.height > b.y;
}

// this function checks if two circles overlap
DOT.collides = function(a, b) {

        var distance_squared = ( ((a.x - b.x) * (a.x - b.x)) + 
                                ((a.y - b.y) * (a.y - b.y)));

        var radii_squared = (a.r + b.r) * (a.r + b.r);

        if (distance_squared < radii_squared) {
            return true;
        } else {
            return false;
        }
};

// DOT.Particle = function(x, y,r, col) {

//     this.x = x;
//     this.y = y;
//     this.r = r;
//     this.col = col;

//     // determines whether particle will
//     // travel to the right of left
//     // 50% chance of either happening
//     this.dir = (Math.random() * 2 > 1) ? 1 : -1;

//     // random values so particles do not
//     // travel at the same speeds
//     this.vx = ~~(Math.random() * 4) * this.dir;
//     this.vy = ~~(Math.random() * 7);

//     this.remove = false;

//     this.update = function() {

//         // update coordinates
//         this.x += this.vx;
//         this.y += this.vy;

//         // increase velocity so particle
//         // accelerates off screen
//         this.vx *= 0.99;
//         this.vy *= 0.99;

//         // adding this negative amount to the
//         // y velocity exerts an upward pull on
//         // the particle, as if drawn to the
//         // surface
//         this.vy -= 0.25;

//         // off screen
//         if (this.y < 0) {
//             this.remove = true;
//         }

//     };

//     this.render = function() {
//         DOT.Draw.circle(this.x, this.y, this.r, this.col);
//     };

// };



window.addEventListener('load', DOT.init, false);
window.addEventListener('resize', DOT.resize, false);