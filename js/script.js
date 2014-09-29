$(document).ready(function() {
	
	var app = {
		initialize: function() {
			this.IMG = new Array();
			this.METEOR =  new Array();
			this.EXPLODE = new Array();
			this.ENMEXP = new Array();
			this.METEXP = new Array();

			background.initialize();
			background.newBg();
			background_interval = setInterval(function() { background.draw(); }, 30);
			this.pictures();
			$("#newGame").click(function() {
				$(this).hide();
				$("#result").hide();
				$('canvas').css("cursor", "none");
				app.ready();	
			});
						
		},

		pictures: function() {
			this.IMG[0] = new Image();	this.IMG[0].src = "img/ship1.png";
			this.IMG[1] = new Image();	this.IMG[1].src = "img/explode.gif";
			this.IMG[2] = new Image();	this.IMG[2].src = "img/enemy.png";
			this.waitForImages(this.IMG);

			this.loadAnimation(this.METEOR, 3, "img/asteroids/", "png");
			this.loadAnimation(this.EXPLODE, 16, "img/explode/", "gif");
			this.loadAnimation(this.ENMEXP, 28, "img/enemyExp/", "gif");
			this.loadAnimation(this.METEXP, 23, "img/asteroidEXP/", "gif");
		},

		loadAnimation: function(arr, count, path, type) {
			for(var i = 0; i <= count; i++) {
				arr.push(new Image());
				arr[i].src = path + i + "." + type;
			}
			this.waitForImages(arr);
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
			ship.initialize();
			field.initialize();
			
			stats.initialize();

			clearInterval(background_interval);
			app_interval = setInterval(function() { app.newFrame(); }, 30);
			meteor_interval = setInterval(function() { field.newAsteroid(); }, 800);
			enemy_interval = setInterval(function() { field.newEnemy(); }, 700);	
		},

		newFrame: function() {
			background.draw();
			ship.draw();
			field.ctx.clearRect(0, 0, field.canvas.width, field.canvas.height);
			for(var i = 0; i < field.asteroids.length; i++) {
				if(field.asteroids[i].exp_frame < 0)
					field.asteroids[i].draw(i);
				else
					field.asteroids[i].drawExplode(i);
			}
			for(i = 0; i < field.amm.length; i++) {
				field.amm[i].draw(i);
			}
			for(i = 0; i < field.enemies.length; i++) {
				field.enemies[i].draw(i);
			}
			for(i = 0; i < field.enemies.length; i++) {
				for(var j = 0; j < field.enemies[i].gun.length; j++) {
					field.enemies[i].gun[j].draw();
				}
			}
			for(var i = 0; i < field.enemies.length; i++) {
				for(var j = 0; j < field.enemies[i].gun.length; j++) {
					if(ship.x < field.enemies[i].gun[j].x+field.enemies[i].gun[j].width && ship.x+ship.width > field.enemies[i].gun[j].x && ship.y < field.enemies[i].gun[j].y && ship.y+ship.height > field.enemies[i].gun[j].y+field.enemies[i].gun[j].height) {
						if(ship.isshell) {
							field.enemies[i].gun.splice(j, 1);
						}
						else {
							field.enemies[i].gun.splice(j, 1);
							ship.destroy();
						}
					}
				}
			}
		},

		gameOver: function() {
			$(ship.canvas).unbind('mousemove');
			$(ship.canvas).unbind('click');
			$(document).unbind('keydown');
			clearInterval(app_interval);
			clearInterval(meteor_interval);
			clearInterval(enemy_interval);
		}
	}

	var stats = {
		initialize: function() {
			this.score = 0;
			$("#enemyStats span").text(this.score);
			$("#shellStats span").text(ship.shell_count);
		},

		frag: function() {
			this.score++;
			if(!(this.score%20)) {
				ship.shell_count++;
				this.shell();
			}
			$("#enemyStats span").text(this.score);
		},

		shell: function() {
			$("#shellStats span").text(ship.shell_count);
		}
	}

	var background = {
		initialize: function() {
			this.hCanvas = document.getElementById("bgHiddenCanvas");
			this.hCtx = this.hCanvas.getContext("2d");
			//this.hCanvas.width = window.innerWidth;
			//this.hCanvas.height = window.innerHeight;
			this.canvas = document.getElementById("bgCanvas");
			//this.canvas.width = window.innerWidth;
			//this.canvas.height = window.innerHeight;
			this.ctx = this.canvas.getContext("2d");
			this.y = 0;
			this.botD = 0;
			this.topD = 0;
		},

		newBg: function() {
			this.y = 0;
			this.botD = this.topD;
			this.hCtx.fillStyle = "#fff";
			for(var i = 0; i < 300; i++) {
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
			//this.canvas.width = window.innerWidth;
			//this.canvas.height = window.innerHeight;

			this.img = app.IMG[0];

			this.width = this.canvas.width/12;
			this.height = this.width*1.25;

			this.exhaustH = this.height/4;
			this.max_amm = 2;

			this.x = this.canvas.width/2 - this.width/2;
			this.y = this.canvas.height - this.height - this.exhaustH*2;

			this.shell_count = 3;
			this.isshell = false;

		  	$(this.canvas).bind('mousemove', function(event) {
	  			ship.move(event);
			});
			$(this.canvas).bind('click', function(event) {
				console.log(field.amm);
				if(field.amm.length != ship.max_amm)
	  				ship.fire(event);
			});
			$(document).bind('keydown', function(event) {
	  			ship.control(event);
			});
			ship.draw();
		},

		draw: function() {
			this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
			this.ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
			if(this.isshell) {

				this.shell = this.ctx.createLinearGradient(this.x+this.width/2-this.height/1.5, this.y+this.height/2-this.height/1.5, this.x+this.width/2+this.height/1.5, this.y+this.height/2+this.height/1.5);
				this.shell.addColorStop(0, "rgba(135, 50, 50, 0.7)");
				this.shell.addColorStop(1, "rgba(204, 250, 250, 0.5)");
				
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
			stats.shell();
			this.isshell = true;
			this.draw();
			setTimeout(function() {
				ship.isshell = false;
			}, 3000);
		},

		destroy: function() {
			var that = this;
			background_interval = setInterval(function() { background.draw(); }, 30);
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
				if(f == app.EXPLODE.length - 1) {
					field.ctx.clearRect(0, 0, field.canvas.width, field.canvas.height);
					$("#result span").text(stats.score);
					$('canvas').css("cursor", "default");
					$("#newGame").show();
					$("#result").show();
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
			//this.canvas.width = window.innerWidth;
			//this.canvas.height = window.innerHeight;

			this.asteroids = new Array;
			this.amm = new Array;
			this.enemies = new Array;
			this.eguns = new Array;
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

		this.width = Math.floor(Math.random() * (100 - 60 + 1)) + 60;
		this.height = Math.floor(Math.random() * (100 - 60 + 1)) + 60;
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

		this.exp_frame = -1;
	}

	Asteroid.prototype.draw = function(index) {
		this.x += this.speedX;
		this.y += this.speedY;
		//проверка на выход астероида из игровой зоны
		if(this.y >= this.canvas.height) {
			this.exp_frame = 0;
			return;
		}
		//проверка на столкновение с другими астероидами
		for(var i = 0; i < field.asteroids.length; i++) {
			if(index != i && field.asteroids[i].exp_frame == -1) {
				if(this.x <= field.asteroids[i].x && this.x+this.width >= field.asteroids[i].x && this.y <= field.asteroids[i].y && this.y+this.height >= field.asteroids[i].y) {
					field.asteroids.splice(i, 1);
					this.destroy();
				}
			}
		}
		//проверка на столкновение с кораблем
		if(ship.y+ship.height >= this.y && ship.y+ship.height/4 <= this.y+this.height && ship.x+ship.width >= this.x && ship.x <= this.x + this.width) {
			if(ship.isshell) {
				this.destroy();
			}
			else {
				ship.destroy();
			}
		}
		//проверка на столкновение с лазером
		for(var i = 0; i < field.amm.length; i++) {
			if(this.x <= field.amm[i].x && this.x+this.width >= field.amm[i].x && this.y <= field.amm[i].y && this.y+this.height >= field.amm[i].y) {
				field.amm.splice(i, 1);
			}
		}
		//проверка на столкновение с вражескими корабляим
		for(var i = 0; i < field.enemies.length; i++) {
			if(field.enemies[i].exp_frame < 0 && this.x < field.enemies[i].x+field.enemies[i].width && this.x+this.width > field.enemies[i].x && this.y < field.enemies[i].y+field.enemies[i].height && this.y+this.height > field.enemies[i].y) {
				field.enemies[i].destroy();
			}
		}
		//проверка на столкновение с вражескими снарядами
		for(var i = 0; i < field.enemies.length; i++) {
			for(var j = 0; j < field.enemies[i].gun.length; j++) {
				if(this.x < field.enemies[i].gun[j].x+field.enemies[i].gun[j].width && this.x+this.width > field.enemies[i].gun[j].x && this.y < field.enemies[i].gun[j].y && this.y+this.height > field.enemies[i].gun[j].y+field.enemies[i].gun[j].height) {
					field.enemies[i].gun.splice(j, 1);
				}
			}
		}

		this.ctx.drawImage(this.img, this.x, this.y, this.height, this.width);
	}

	Asteroid.prototype.destroy = function(index) {
		this.exp_frame = 0;
		this.width = 138;
		this.height = 138;
	}

	Asteroid.prototype.drawExplode = function(index) {
		if(this.exp_frame < app.METEXP.length) {
			this.img = app.METEXP[this.exp_frame];
			this.exp_frame++;
		}
		else {
			field.asteroids.splice(index, 1);
			return;
		}
		this.ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
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

	Lazer.prototype.draw = function(index) {
		this.y -= this.speed;
		for(var i = 0; i < field.enemies.length; i++) {
			for(var j = 0; j < field.enemies[i].gun.length; j++) {
				if(this.x <= field.enemies[i].gun[j].x+field.enemies[i].gun[j].width && this.x+this.width >= field.enemies[i].gun[j].x && this.y <= field.enemies[i].gun[j].y+field.enemies[i].gun[j].height && this.y+this.height >= field.enemies[i].gun[j].y) {
					field.amm.splice(index - 1, 1);
					field.enemies[i].gun.splice(j, 1);
					return;
				}
			}
		}
		if(this.y+this.height > 0) {
			this.ctx.beginPath();
			this.ctx.lineWidth = this.width;
			this.ctx.strokeStyle = "#2ECDD0";
			this.ctx.moveTo(this.x, this.y);
			this.ctx.lineTo(this.x, this.y+this.height);
			this.ctx.stroke();
		}
		else
			field.amm.splice(index - 1, 1);
	}

	function Enemy(x) {
		that = this;
		this.canvas = field.canvas;
		this.ctx = field.ctx;
		this.img = app.IMG[2];
		this.width = Math.floor(this.canvas.width/16);
		this.height = Math.floor(this.width*1.1);
		this.x = x;
		this.y = -this.height;
		this.speed = Math.floor(Math.random()*10+1);
		this.max_amm = 1;
		this.exp_frame = -1;

		this.gun = new Array();
		this.shoot(1);
	}

	Enemy.prototype.draw = function(index) {
		if(this.y > this.canvas.height) {
			field.enemies.splice(index, 1);
			return;
		}
		if(this.exp_frame < 0) {
			if(ship.y+ship.height >= this.y && ship.y+ship.height/4 <= this.y+this.height && ship.x+ship.width >= this.x && ship.x <= this.x + this.width) {
				if(ship.isshell) {
					this.destroy();
					stats.frag();
				}
				else {
					ship.destroy();
					return;
				}
			}

			for(var i = 0; i < field.amm.length; i++) {
				if(this.x <= field.amm[i].x && this.x+this.width >= field.amm[i].x && this.y+this.height >= field.amm[i].y && this.y <= field.amm[i].y+field.amm[i].height) {
					this.destroy();
					field.amm.splice(i, 1);
					stats.frag();
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

	Enemy.prototype.shoot = function(first) {
		if(!first)
			this.gun.unshift(new EGun(this));
		var self = this;
		this.shooting = setTimeout(function() { self.shoot(); }, Math.floor(Math.random() * (2000 - 500 + 1)) + 500);
	}

	Enemy.prototype.destroy = function() {
		clearTimeout(this.shooting);
		this.exp_frame = 0;
	}

	function EGun(enemy) {
		this.enemy = enemy;
		this.canvas = field.canvas;
		this.ctx = field.ctx;
		this.damage = 15;
		this.speed = 16;
		this.width = 7;
		this.height = 13;
		this.x = this.enemy.x + this.enemy.width/2;
		this.y = this.enemy.y + this.enemy.height;
	}

	EGun.prototype.draw = function() {
		this.y += this.speed;
		if(this.height < this.canvas.height) {
			this.ctx.beginPath();
			this.ctx.lineCap = "round";
			this.ctx.lineWidth = this.width;
			this.ctx.strokeStyle = "#2ED06C";
			this.ctx.moveTo(this.x, this.y);
			this.ctx.lineTo(this.x, this.y+this.height);
			this.ctx.stroke();
		}
		else
			this.enemy.gun.splice(field.enemy.gun.length - 1, 1);
	}

	$("#result").hide();
	app.initialize();
}); 