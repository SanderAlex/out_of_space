$(document).ready(function() {
	
	var app = {
		initialize: function() {
			this.IMG = new Array();
			this.METEOR =  new Array();
			this.EXPLODE = new Array();
			this.ENMEXP = new Array();

			this.pictures();
			this.ready();				
		},

		pictures: function() {
			this.IMG[0] = new Image();	this.IMG[0].src = "img/ship1.png";
			this.IMG[1] = new Image();	this.IMG[1].src = "img/explode.gif";
			this.IMG[2] = new Image();	this.IMG[2].src = "img/enemy.png";
			this.waitForImages(this.IMG);

			this.METEOR[0] = new Image();	this.METEOR[0].src = "img/asteroid_1.png";
			this.METEOR[1] = new Image();	this.METEOR[1].src = "img/asteroid_2.png";
			this.METEOR[2] = new Image();	this.METEOR[2].src = "img/asteroid_3.png";
			this.METEOR[3] = new Image();	this.METEOR[3].src = "img/asteroid_4.png";
			this.waitForImages(this.METEOR);

			for(var i = 0; i <= 16; i++) {
				this.EXPLODE.push(new Image());
				this.EXPLODE[i].src = "img/explode/" + i + ".gif";
			}
			this.waitForImages(this.EXPLODE);

			for(var i = 0; i <= 28; i++) {
				this.ENMEXP.push(new Image());
				this.ENMEXP[i].src = "img/enemyExp/" + i + ".gif";
			}
			this.waitForImages(this.ENMEXP);
		},

		waitForImages: function(arr) {
			that = this;
		  	for (var i = 0; i < arr.length; i++) {
		  		if(!arr[i].complete) {
		  			setTimeout(function() { that.waitForImages(arr); }, 100)
		  			return;
		  		}
		  	}
		},

		ready: function() {
			background.initialize();
			ship.initialize();
			field.initialize();
			background.newBg();
			ship.draw();
		},

		newFrame: function() {
			background.draw();
			field.ctx.clearRect(0, 0, field.canvas.width, field.canvas.height);
			for(var i = 0; i < field.asteroids.length; i++) {
				field.asteroids[i].draw(i);
			}
			for(i = 0; i < field.amm.length; i++) {
				field.amm[i].draw();
			}
			for(i = 0; i < field.enemies.length; i++) {
				field.enemies[i].draw(i);
			}
		},

		gameOver: function() {
			$(ship.canvas).unbind('mousemove');
			$(document).unbind('keydown');
			clearInterval(app_interval);
			clearInterval(meteor_interval);
			clearInterval(enemy_interval);
		}
	}

	var background = {
		initialize: function() {
			this.hCanvas = document.getElementById("bgHiddenCanvas");
			this.hCtx = this.hCanvas.getContext("2d");
			this.canvas = document.getElementById("bgCanvas");
			this.ctx = this.canvas.getContext("2d");
			this.y = 0;
			this.botD = 0;
			this.topD = 0;
		},

		newBg: function() {
			this.y = 0;
			this.botD = this.topD;
			this.hCtx.fillStyle = "#fff";
			for(var i = 0; i < 200; i++) {
				this.hCtx.fillRect(Math.random()*this.canvas.width, Math.random()*this.canvas.height, 1, 1);
			}
			if(!this.botD) {
				this.topD = this.hCtx.getImageData(0, 0, this.canvas.width, this.canvas.height);
				this.newBg();
			}
		},

		draw: function() {
			if(this.y == this.canvas.height)
				this.newBg();
			this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
			this.ctx.putImageData(this.botD, 0, ++this.y);
			this.ctx.putImageData(this.topD, 0, this.y-this.canvas.height);
		}
	}

	var ship = {
		initialize: function() {
			this.canvas = document.getElementById("shipCanvas");
			this.ctx = this.canvas.getContext("2d");

			this.img = app.IMG[0];

			this.width = this.canvas.width/10;
			this.height = this.width*1.25;

			this.exhaustH = this.height/4;
			this.max_amm = 2;

			this.x = this.canvas.width/2 - this.width/2;
			this.y = this.canvas.height - this.height - this.exhaustH*2;

			this.shell_count = 3;
			this.isshell = false;

			this.shell = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
			this.shell.addColorStop(0, "rgba(163, 220, 230, 0.6)");
			this.shell.addColorStop(0.3, "rgba(244, 220, 125, 0.6)");
			this.shell.addColorStop(0.75, "rgba(149, 236, 143, 0.6)");
			this.shell.addColorStop(1, "rgba(157, 100, 171, 0.6)");

		  	$(this.canvas).bind('mousemove', function(event) {
	  			ship.move(event);
			});
			$(this.canvas).bind('click', function(event) {
				if(field.amm.length != ship.max_amm)
	  				ship.fire(event);
			});
			$(document).bind('keydown', function(event) {
	  			ship.control(event);
			});
		},

		draw: function() {
			this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
			this.ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
			if(this.isshell) {
				this.ctx.beginPath();
				this.ctx.fillStyle = this.shell;
				this.ctx.arc(this.x+this.width/2, this.y+this.height/2, this.height/1.5, 0, 2*Math.PI, false);
				this.ctx.fill();			
			}
		},

		shellAction: function() {
			if(this.isshell || !this.shell_count)
				return;
			this.shell_count--;
			this.isshell = true;
			this.draw();
			setTimeout(function() {
				ship.isshell = false;
			}, 2000);
		},

		destroy: function() {
			var that = this;

			app.gameOver();

			animation(0);

			function animation(f) {
				that.ctx.clearRect(0, 0, that.canvas.width, that.canvas.height);
				that.ctx.drawImage(app.EXPLODE[f], that.x-that.width/2, that.y-that.height/2);
				if(f < app.EXPLODE.length - 1) {
					setTimeout(function() {
						animation(++f);
					}, 100);
				}
			}
		},

		control: function(e) {
			switch(e.which) {
				case 32:
					this.shellAction(); break;

				default:
					return;
			}
		},

		move: function(e) {
			//console.log(e.pageX);
			if(e.pageX >= 0 && e.pageX <= this.canvas.width-this.width && e.pageY < this.canvas.height-this.height) {
				this.x = e.pageX;
				this.y = e.pageY;
				this.draw();
			}
		},

		fire: function(e) {
			field.amm.unshift(new Lazer(e));
		}
	}

	var field = {
		initialize: function() {
			this.canvas = document.getElementById("fieldCanvas");
			this.ctx = this.canvas.getContext("2d");
			this.asteroids = new Array;
			this.amm = new Array;
			this.enemies = new Array;
		},

		newAsteroid: function() {
			this.asteroids.unshift(new Asteroid(Math.random()*this.canvas.width));
		},

		newEnemy: function() {
			this.enemies.unshift(new Enemy(Math.random()*this.canvas.width));
		}
	}

	function Asteroid(x) {
		this.canvas = field.canvas;
		this.ctx = field.ctx;
		this.type = Math.floor(Math.random()*app.METEOR.length);
		this.img = app.METEOR[this.type];

		this.width = Math.floor(Math.random() * (100 - 50 + 1)) + 50;
		this.height = Math.floor(Math.random() * (80 - 60 + 1)) + 60;
		if(Math.random() > 0.5) {
			this.x = -this.width;
			this.speedX = Math.floor(Math.random() * (8 - 4 + 1)) + 4;
		}
		else {
			this.x = this.canvas.width;
			this.speedX = -(Math.floor(Math.random() * (8 - 4 + 1)) + 4);
		}
		this.y = Math.random() * this.canvas.height/4;

		this.speedY = Math.floor(Math.random() * (8 - 4 + 1)) + 4;
	}

	Asteroid.prototype.draw = function(index) {
		this.x += this.speedX;
		this.y += this.speedY;
		//проверка на столкновение с кораблем
		if(ship.y+ship.height >= this.y && ship.y+ship.height/4 <= this.y+this.height && ship.x+ship.width >= this.x && ship.x <= this.x + this.width) {
			if(ship.isshell) {
				field.asteroids.splice(index, 1);
			}
			else {
				ship.destroy();
			}
		}
		//проверка на столкновение с лазером
		for(var i = 0; i < field.amm.length; i++) {
			//console.log(field.amm[i].y);
			if(this.x <= field.amm[i].x && this.x+this.width >= field.amm[i].x && this.y <= field.amm[i].y && this.y+this.height >= field.amm[i].y) {
				//field.asteroids[index].hp -= field.amm[i].damage;
				field.amm.splice(i, 1);
				/*if(field.asteroids[index].hp <= 0)
					field.asteroids.splice(index, 1);*/
			}
		}
		//проверка на столкновение с вражескими корабляим
		for(var i = 0; i < field.enemies.length; i++) {
			if(field.enemies[i].exp_frame < 0 && this.x < field.enemies[i].x+field.enemies[i].width && this.x+this.width > field.enemies[i].x && this.y < field.enemies[i].y+field.enemies[i].height && this.y+this.height > field.enemies[i].y) {
				//field.asteroids[index].hp -= field.amm[i].damage;
				field.enemies[i].exp_frame = 0;
				/*if(field.asteroids[index].hp <= 0)
					field.asteroids.splice(index, 1);*/
			}
		}
		//проверка на выход астероида из игровой зоны
		if(this.y >= this.canvas.height)
			field.asteroids.splice(index, 1);
		else
			this.ctx.drawImage(this.img, this.x, this.y, this.height, this.width);
	}

	function Lazer(e) {
		this.canvas = field.canvas;
		this.ctx = field.ctx;
		this.damage = 15;
		this.speed = 20;
		this.width = 5;
		this.height = 10;
		this.x = e.pageX + ship.width/2;
		this.y = ship.y + this.height;
	}

	Lazer.prototype.draw = function() {
		this.y -= this.speed;
		if(this.y+this.height > 0) {
			this.ctx.beginPath();
			this.ctx.lineWidth = this.width;
			this.ctx.strokeStyle = "#E11515";
			this.ctx.moveTo(this.x, this.y);
			this.ctx.lineTo(this.x, this.y+this.height);
			this.ctx.stroke();
		}
		else
			field.amm.splice(field.amm.length - 1, 1);
	}

	function Enemy(x) {
		this.canvas = field.canvas;
		this.ctx = field.ctx;
		this.img = app.IMG[2];
		this.width = this.canvas.width/12;;
		this.height = this.width*1.1;
		this.x = x;
		this.y = -this.height;
		this.speed = Math.random()*10+1;
		this.exp_frame = -1;
	}

	Enemy.prototype.draw = function(index) {
		if(this.y > this.canvas.height) {
			field.enemies.splice(index, 1);
			return;
		}
		if(this.exp_frame < 0) {
			if(ship.y+ship.height >= this.y && ship.y+ship.height/4 <= this.y+this.height && ship.x+ship.width >= this.x && ship.x <= this.x + this.width) {
				if(ship.isshell) {
					this.exp_frame = 0;
				}
				else {
					ship.destroy();
					return;
				}
			}

			for(var i = 0; i < field.amm.length; i++) {
				//console.log(field.amm[i].y);
				if(this.x <= field.amm[i].x && this.x+this.width >= field.amm[i].x && this.y+this.height >= field.amm[i].y) {
					//field.asteroids[index].hp -= field.amm[i].damage;
					this.exp_frame = 0;
					field.amm.splice(i, 1);
				}
			}
			if(ship.x > this.x)
				this.x++;
			else if(ship.x < this.x)
				this.x--;

			this.y += this.speed;
		}
		else {
			if(this.exp_frame < app.ENMEXP.length) {
				this.img = app.ENMEXP[this.exp_frame];
				this.exp_frame++;
			}
			else {
				field.enemies.splice(index, 1);
				return;
			}	
		}
	
		this.ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
	}

	$("#explode").hide();
	app.initialize();

	app_interval = setInterval(function() { app.newFrame(); }, 30);
	meteor_interval = setInterval(function() { field.newAsteroid(); }, 800);
	enemy_interval = setInterval(function() { field.newEnemy(); }, 600);
}); 