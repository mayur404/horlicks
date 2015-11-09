$(function(){

LOG && console.log("Link Opened");
mixpanel.track("Connected");
FastClick.attach(document.body);

var socket = io();
var deviceRatio = window.getDevicePixelRatio();
var ratio = 1;
var strongClan = new Object();
var tallClan = new Object();
var sharpClan = new Object();
var aptClan = new Object();

var clan = 0;
var baseHealth = 15
var health = baseHealth;
var baseTiles = 16;
var healthConstant = health;
var buildSubmited = false;	//set to 0 if the build is submited


//Strong Clan 0
strongClan.strong = 3;
strongClan.strongHit = 1;
strongClan.tall = 2;
strongClan.tallHit = 2;
strongClan.sharp = 1;
strongClan.sharpHit = 3;

//Tall Clan 1
tallClan.strong = 2;
tallClan.tall = 3;
tallClan.sharp = 1;
tallClan.strongHit = 2;
tallClan.tallHit = 1;
tallClan.sharpHit = 2;

//Sharp Clan 2
sharpClan.strong = 1;
sharpClan.tall = 2;
sharpClan.sharp = 3;
sharpClan.strongHit = 3;
sharpClan.tallHit = 2;
sharpClan.sharpHit = 1;

//Apt Clan 3
aptClan.strong = 2;
aptClan.tall = 2;
aptClan.sharp = 2;
aptClan.strongHit = 2;
aptClan.tallHit = 2;
aptClan.sharpHit = 2;



clans = new Array();
clans.push(tallClan);
clans.push(strongClan);
clans.push(sharpClan);
clans.push(aptClan);

var opacity = [0,0.25,0.5];
var currentHeathY = 0;

var playerClan = 'glaxo';

var isHost = 0;

var updateGlobalIndex = 0;
var gameOn = 0;
var localJoinData = new Object();
flickerStarted = 0;
var deviceData = new Object();
var deviceDataSet  = true;
var tapOpen = false;

//Functions executed from the server

//Requesting the deviceData

/*if(localStorage.pwidth&&localStorage.pheight){
	//Direct use Device Data;
	console.log("From localStorage");
	console.log(localStorage.pwidth);
	console.log(localStorage.pheight);
	pWidth = parseFloat(localStorage.pwidth)
	pHeight = parseFloat(localStorage.pheight)
	deviceDataSet = true;

}else{*/
	socket.emit("requestDeviceData");
//}

///All Canvas Functionality

////


socket.on('deviceData',function(gotDeviceData){
	
	deviceData = gotDeviceData;
	localStorage.pWidth = gotDeviceData.pwidth;
	localStorage.pHeight = gotDeviceData.pheight;
	pWidth = gotDeviceData.pwidth;
	pHeight = gotDeviceData.pheight;
	deviceDataSet = true;
	$(".ppi").empty();
	$(".ppi").append(deviceData.pheight + '<br/>');
	$(".ppi").append(deviceData.pwidth + '<br/>');
	
});

socket.on('buildingBoard',function(){
	
	$(".messageLog").html("Validating Path!!");
	
});


socket.on('replayFromServer',function(){
	
	transitScreen('gameEnd','demoArea');
	$(".healthBar").css({'opacity':0.8});
	$(".messageLog").html('');
	tapOpen = false;
	hitGrid.length = 0;
	linearGrid.length = 0;
	drawOffset = 0;
	blockArray.length = 0;
	textArray.length = 0;
	shrineArray = [];
	gameWon = false;

});



socket.on('highlight',function(gameEnd){
	score = gameEnd.gameData.score;
	setTimeout(function(){
		if(gameEnd.won){
			$(".messageLog").html("Congrats: Tap to Cont..");
			gameWon = true;
			for(i=0;i<shrineArray.length;i++){
				shrineArray[i].rect1.set('fill',highlightColor);
				shrineArray[i].rect2.set('fill',shrineHiglightDarkColor);
				shrineArray[i].rect3.set('fill',highlightColor);
				shrineArray[i].rect4.set('fill',shrineHiglightDarkColor);
				//shrineArray[i].rect4.set('opacity',0.8);
				//shrineArray[i].circle.set('opacity',1);
				shrineArray[i].rect3.animate('angle',12960,{
					duration:120000,
					onChange:canvas.renderAll.bind(canvas)
				});
				shrineArray[i].rect4.animate('angle',-12960,{
					duration:120000,
					onChange:canvas.renderAll.bind(canvas)
				});
			}
		}else{
			gameWon = false;
			$(".messageLog").html("Failed: Tap to Cont..");	
		}
		console.log(JSON.stringify(gameEnd));

		for(i=0;i<blockArray.length;i++){
			if(linearGrid[i] == 'X' && gameEnd.highlight[i] == 0){
				console.log("Came Inside");
				blockArray[i].set('scaleX',0.7);
				blockArray[i].set('scaleY',0.7);
				blockArray[i].set('opacity',0.8);
			}else if (linearGrid[i] == 'X' && linearGrid[i]!= 'I' && gameEnd.highlight[i] == 1){
				if(gameEnd.won){
					blockArray[i].set('fill',highlightColor);
				}
			}
		}
		tapOpen = true;
		console.log("All good!");
		canvas.renderAll();
	},2000);
	
	
});


socket.on('demoHostGameSetup',function(gameData){

	//Upadate Global Status
	socket.emit('updateGlobalStatus');
	//Showing Host Screen
	transitScreen('loadingScreen','hostScreen');
	var gameData = JSON.parse(gameData);
	var gameIdArray = gameData.gameId.split('');
	$(".i0").val(gameIdArray[0]);
	$(".i1").val(gameIdArray[1]);
	$(".i2").val(gameIdArray[2]);
	$(".i3").val(gameIdArray[3]);
	LOG && console.log("Host Game Setup Setting -------------------------");
	LOG && console.log(gameData);

});


/*socket.on('demoHostGameSetup',function(gameData){

	demoMessage("Game Created");	
	LOG && console.log("Host Game Setup Setting -------------------------");
	LOG && console.log(gameData);

});*/

/*socket.on('demoPlayerJoined',function(gameData){

	//transitScreen('loadingScreen','joinScreen');
	demoMessage("Player Joined");
	var gameData = JSON.parse(gameData);
	LOG && console.log(gameData);
	//socket.emit('updateGlobalStatus'); 
	//$(".joinScreenTwo").hide(); 

});*/

socket.on('demoPlayerJoined',function(gameData){

	transitScreen('loadingScreen','joinScreen');
	var gameData = JSON.parse(gameData);
	LOG && console.log(gameData);
	socket.emit('updateGlobalStatus'); 
	$(".joinScreenTwo").hide(); 

});

socket.on('wrongGameIdEntered',function(){
	LOG && console.log("Wrong Id Entered");
	$(".loadingText").html("Wrong Code.");
	setTimeout(function(){
		$(".joinInput").val("");
		transitScreen('loadingScreen','joinScreen');
		$(".i0").focus();
	},1000);

});

socket.on('transferMelk',function(transferData){
	terminal.log(socket,"Transfer Melk Inner");
	transfer = Math.round(transferData.transfer*(n/16));
	health = health + transfer;
	updateHealth(health,healthConstant);
	logMessage("Received!!!");
});

socket.on('requestGameData',function(gameData){
	var gameData = JSON.parse(gameData);
	LOG && console.log(gameData);
});

socket.on('alignScreens',function(index){
	$(".alignNo").html(index);
	if(isHost){
		transitScreen('hostScreen','alignScreen');
	}else{
		transitScreen('joinScreen','alignScreen');
	}
	
});

socket.on('endGame',function(){

	//document.ontouchmove = function(e){ return true; }
	
	if(gameOn){
		transitScreen('demoArea','demoHome')
	}else{
		if(isHost){
			transitScreen('hostScreen','demoHome')	
		}else{
			transitScreen('joinScreen','demoHome')	
		}	
	}
	isHost = 0;
	gameOn = 0;
	updateGlobalIndex = 0;
	flickerStarted = 0;
	buildSubmited = false;
	$(".clans").empty();
	LOG && console.log("Game Ended");
});




socket.on('updateGlobalStatus',function(gameData){


	LOG && console.log(gameData);
	LOG && console.log(gameData.playersJoined);
	LOG && console.log(updateGlobalIndex);
	var typeClan = ['tallerClan','strongerClan','sharperClan','aptClan'];
	var clanName = ['glaxo','smith','kline','stark'];
	var thPlayer = ['st','nd','rd','th'];
	$(".clans").empty();
	for(i=0;i<gameData.playersJoined;i++){
		var clanIndex = clanName.indexOf(gameData.players[i].clan);
		if(thPlayer[gameData.players[i].index - 1]){
			th = thPlayer[gameData.players[i].index - 1];
		}else{
			th = 'th';
		}
		$(".clans").append('<div class="btnOther '+ typeClan[clanIndex]+' shadowSmall equalMargin">'+gameData.players[i].index+'<span class="lower">'+th+'</span> : '+ clanName[clanIndex] +' CLAN</div>');
		if($(".hostScreen").children('.navScreenInner').height() > window.screen.height){
			$(".hostScreen").children('.navScreenInner').css({'top':'0%','margin-top':0});
		}else{
			margin = $(".hostScreen").children('.navScreenInner').height()/2;
			$(".hostScreen").children('.navScreenInner').css({'top':'50%','margin-top':-margin});	
		}

		if($(".joinScreen").children('.navScreenInner').height() > window.screen.height){
			$(".joinScreen").children('.navScreenInner').css({'top':'0%','margin-top':0});
		}else{
			margin = $(".joinScreen").children('.navScreenInner').height()/2;
			$(".joinScreen").children('.navScreenInner').css({'top':'50%','margin-top':-margin});	
		}
	}
	
});


socket.on('showMoto',function(){

	LOG && console.log("Showing Moto");
	var moto = ['Taller','Stronger','Sharper','Go!'];
	var i=0;
	var interval = setInterval(function(){
		$(".loadingText").html(moto[i]);
		i++;
		if(i==4){
			clearInterval(interval);
			if(isHost){
				socket.emit('execute');	
			}
		}
	},800);
	
});


socket.on('demoDrawBoard',function(boardParams){

	//Demo Draw Game
	//document.ontouchmove = function(e){ e.preventDefault();}
	var clanName = ['glaxo','smith','kline','stark'];
	var height = window.screen.height;
	var width = window.screen.width;
	LOG && console.log(boardParams);
	console.log("Drawing with following dimensions h");
	terminal.log(socket,boardParams.boardHeight);
	terminal.log(socket,boardParams.boardHeight.toH());
	console.log(boardParams.boardHeight);
 	clan = clanName.indexOf(boardParams.clan);
	total = clans[clan].strong + clans[clan].tall + clans[clan].sharp;
	tallPer = (clans[clan].tall / total)*100;
	strongPer = (clans[clan].strong / total)*100;
	sharpPer = (clans[clan].sharp / total)*100;
	LOG && console.log(total);
	LOG && console.log(strongPer);
	LOG && console.log(sharpPer);
	LOG && console.log(tallPer);


	$(".taller").css({'width':tallPer+'%'});
	$(".stronger").css({'width':strongPer+'%'});
	$(".sharper").css({'width':sharpPer+'%'});


	//Setting the background
	
	//Setting the size
	backHeight = boardParams.backData.height.toH();
	backWidth = boardParams.backData.width.toW();
	backSize = backWidth+'px '+backHeight+'px';
	$(".demoAreaBack").css({"background-size":backSize});
	$(".gameEndBack").css({"background-size":backSize});
	//Setting the position
	paddingX = 0;
	for(i=0;i<boardParams.backData.index;i++){
		paddingX = paddingX + boardParams.backData.widths[i];
	}
	paddingX = paddingX.toW();
	if(pHeight == boardParams.backData.height){
		paddingY = 0;
	}else{
		paddingY =  (boardParams.backData.height - pHeight) / 2; 	
		paddingY = paddingY.toH();
	}
	backPos = '-'+paddingX+'px '+'-'+paddingY+'px';
	$(".demoAreaBack").css({"background-position":backPos});
	$(".gameEndBack").css({"background-position":backPos});

	terminal.log(socket,"Padding with width: " +boardParams.backData.widths[boardParams.backData.index] +': '+ paddingX);
	//Done setting the background


	
	//Drawing the Board
	LOG && terminal.log(socket,boardParams);
	tileH = boardParams.boardHeight.toH()/4;
	tileW = (pWidth/boardParams.cols).toW();
	drawOffset = $(document).height()/2 - (boardParams.boardHeight.toH()/2);
	terminal.log(socket,"Printing TileSizes: "+tileH+' '+tileW);
	LOG && terminal.log(socket,"Offset:"+drawOffset+'avail:'+$(document).height()+'actual:'+$(window).height());
	n = boardParams.cols*4;
	LOG && terminal.log(socket,n);

	//Drawing the Canvas
	
	console.log(drawOffset);
	
	//Setting Health Values

	health = Math.round((n*baseHealth)/baseTiles);
	healthConstant = health;
	playerHealth = health;
	terminal.log(socket,'Health: ' + health);
	//Health Canvas

	
	//Actual Canvas

	canvas = new fabric.Canvas("canvas",{
		height:boardParams.boardHeight.toH(),
		width:window.screen.width,
		top:drawOffset,
		left:0,
		selection:false,
		renderOnAddRemove: false,
		stateful: false
	});

	canvas.selection = false;
	canvas.stateful = false;
	canvas.renderOnAddRemove = false;
	$("#canvas").css({'top':drawOffset});
	drawOffset = 0;


	//Setting the values of hitPoints

	hitGrid = boardParams.linearGrid.slice(0);
	linearGrid = boardParams.linearGrid.slice(0);
	LOG && console.log(hitGrid);

	for(i=0;i<hitGrid.length;i++){
		if(hitGrid[i] == 'T'){
			hitGrid[i] = clans[clan].tallHit;
		}else if(hitGrid[i] == 'S'){
			hitGrid[i] = clans[clan].strongHit;
		}else if(hitGrid[i] == 'Z'){
			hitGrid[i] = clans[clan].sharpHit;
		}
	}
	LOG && console.log("hitGrid");
	LOG && console.log(hitGrid);
	LOG && console.log("LinearGrid");
	LOG && console.log(boardParams.linearGrid);

	//Drawing the actual Board

	for(i=0;i<4;i++){
		for(j=0;j<boardParams.cols;j++){
			index = i*boardParams.cols + j;
			index = index.toString();
			LOG && console.log(index);
			switch(boardParams.linearGrid[index]){
			case 'I':
				drawShrine(j*tileW,i*tileH,tileW,tileH);
				blockArray[index] = null;
				textArray[index] = null;
				break;
			case 'O':
				blockArray[index] = null;
				textArray[index] = null;
				break;
			case 'T':
				obj = drawTaller(j*tileW,i*tileH,tileW,tileH,index);
				blockArray[index] = obj[0];
				textArray[index] = obj[1];
				canvas.add(blockArray[index]);
				canvas.add(textArray[index]);
				break;
			case 'S':
				obj = drawStronger(j*tileW,i*tileH,tileW,tileH,index);
				blockArray[index] = obj[0];
				textArray[index] = obj[1];
				canvas.add(blockArray[index]);
				canvas.add(textArray[index]);
				break;
			case 'Z':
				obj = drawSharper(j*tileW,i*tileH,tileW,tileH,index);
				blockArray[index] = obj[0];
				textArray[index] = obj[1];
				canvas.add(blockArray[index]);
				canvas.add(textArray[index]);
				break;
			default:
				break;
			}
		}
	}
	
	canvas.renderAll();
	transitScreen('loadingScreen','demoArea');
	console.log(blockArray);
	console.log(textArray);

	//Showing Instructions

	setTimeout(function(){
		$(".messageLog").html("Swipe Left or Right,");
		setTimeout(function(){
			$(".messageLog").html("to supply Melk.");
			setTimeout(function(){
				$(".messageLog").html("Swipe Down When done!");
				setTimeout(function(){
					$(".messageLog").html("");
				},3000);
			},500);
		},500);
	},500);
	//Handling Touches

	var demoArea = document.getElementById("demoArea");
	var hammer = new Hammer.Manager(demoArea);
	var swipe = new Hammer.Swipe();

	hammer.add(swipe);

	hammer.on('swipeleft', function(){
	   terminal.log(socket,"SwipeLeft");
	   if(boardParams.backData.index == 0){
	   		logMessage("No one to your Left!!")
	   }else{
	   		if(health>0){

		   		transfer = 3*(n/16);
		   		health = health - transfer
		   		if(health < 0){
		   			transfer = transfer + health;
		   			health = 0;
		   			logMessage("Melk over!!");
		   			updateHealth(health,healthConstant);	
		   		}else{
		   			logMessage("Transfered!!");
		   			updateHealth(health,healthConstant);	
		   		}
		   		terminal.log(socket,"Transfer:" + transfer);
		   		transferData = new Object();
		   		transferData.to = boardParams.backData.index;
		   		transferData.from = boardParams.backData.index + 1;
		   		transferData.transfer = Math.round(transfer*(16/n));
		   		socket.emit('transferMelk',transferData);

		   	}else{
		   		logMessage("Out of Melk!!");
		   	}
	   		
	   }
	});

	hammer.on('swiperight', function(){
	   terminal.log(socket,"SwipeRight");
	   if(boardParams.backData.index == boardParams.backData.n - 1){
	   		logMessage("No one to your Right!!")
	   }else{
	   		if(health>0){

		   		transfer = 3*(n/16);
		   		health = health - transfer
		   		if(health < 0){
		   			transfer = transfer + health;
		   			health = 0;
		   			logMessage("Melk over!!");
		   			updateHealth(health,healthConstant);	
		   		}else{
		   			logMessage("Transfered!!");
		   			updateHealth(health,healthConstant);	
		   		}
		   		terminal.log(socket,"Transfer:" + transfer);
		   		transferData = new Object();
		   		transferData.to = boardParams.backData.index + 2;
		   		transferData.from = boardParams.backData.index + 1;
		   		transferData.transfer = Math.round(transfer*(16/n));
		   		socket.emit('transferMelk',transferData);

		   	}else{
		   		logMessage("Out of Melk!!");
		   	}
	   }
	});

	hammer.on('swipedown', function(){
	   terminal.log(socket,"SwipeDown");
	   buildSubmited = true;
	   for(i=0;i<blockArray.length;i++){
	   	if(blockArray[i]!=null && linearGrid[i]!='X'){
	   		blockArray[i].set('opacity','0.3');
	   	}
	   }
	   $(".healthBar").css({'opacity':0.3});
	   $(".messageLog").html('Waiting for Others!')
	   build = new Object();
	   build.grid = linearGrid;
	   build.index = boardParams.backData.index;
	   socket.emit('buildSubmited',build);
	});


	$(".demoArea").bind('click',function(options){
		
		if(tapOpen){

			if(gameWon){
				$(".winMessage").html("Congratulations!!");
				$(".winSubMessage").html("You successfully created a path that connected all the shrines!!");
			}else{
				$(".winMessage").html("Better Luck Next Time.");
				$(".winSubMessage").html("You were unable to  created a path that connected all the shrines!!");
			}
			//if(!isHost){
				$(".replay").hide();
			//}
			transitScreen('demoArea','gameEnd');
			startScoreCount();
			canvas.clear().renderAll();

		}else{
			console.log(options.clientX);
			console.log(options.clientY);
			clientX = options.clientX;
			clientY = options.clientY;
			offSetXLeft = 0;
			offSetXRight = window.screen.width;
			offSetYTop = $(document).height()/2 - (boardParams.boardHeight.toH()/2);
			offSetYBottom = offSetYTop + boardParams.boardHeight.toH();

			boardX = offSetXRight - offSetXLeft;
			boardY = offSetYBottom - offSetYTop;
			if(clientX>offSetXLeft&&clientX<offSetXRight&&clientY>offSetYTop&&clientY<offSetYBottom){

				relativeX = clientX;
				relativeY = clientY - offSetYTop;

				posX = Math.floor(relativeX/tileW);
				posY = Math.floor(relativeY/tileH);

				clickIndex = posX + posY * boardParams.cols;

				console.log("Clicked Inside");
				console.log("Clicked on: " + clickIndex);
				if(health > 0 && blockArray[clickIndex]!=null && !buildSubmited && linearGrid[clickIndex]!= 'X'){
					console.log("called animate");
					health = reduceHealth(health,healthConstant);
					animateBlock(clickIndex);	
				}
			 	/*healthCanvas.animate('top', "-=20", {
				  onChange: hCanvas.renderAll.bind(hCanvas),
				  duration: 100,
				  onComplete:function(){
					      healthCanvas.animate('top', "+=50", {
						  onChange: hCanvas.renderAll.bind(hCanvas),
						  duration: 180
						});  	
				    }
				});*/
				
				//healthIndex+=50;
			}
		}
		
	});	//Bind ends here 
	

	
	
});	//Draw Board Ends here



socket.on('drawBoard',function(boardParams){


	///Top bar

	//document.ontouchmove = function(e){ e.preventDefault();}

	total = clans[clan].strong + clans[clan].tall + clans[clan].sharp;
	tallPer = (clans[clan].tall / total)*100;
	strongPer = (clans[clan].strong / total)*100;
	sharpPer = (clans[clan].sharp / total)*100;
	LOG && console.log(total);
	LOG && console.log(strongPer);
	LOG && console.log(sharpPer);
	LOG && console.log(tallPer);


	$(".taller").css({'width':tallPer+'%'});
	$(".stronger").css({'width':strongPer+'%'});
	$(".sharper").css({'width':sharpPer+'%'});

	ratio = boardParams.size.ratio/deviceRatio;
	$('.intro').hide();
	$('.screen').css({'height':boardParams.boardHeight*ratio});
	margin = Math.round((boardParams.boardHeight*ratio)/2);
	$('.screen').css({'margin-top':-margin});
	paddingHeight = boardParams.boardHeight*ratio*3;
	$('.topScreen').css({'height':paddingHeight});	
	$('.bottomScreen').css({'height':paddingHeight});	
	$('.topScreen').css({'margin-top':-(margin + paddingHeight)});
	$('.bottomScreen').css({'margin-top':-margin});
	
	n = boardParams.cols*5;
	LOG && console.log(n);

	//Setting Health Params
	health = Math.round(n*baseHealth)/baseTiles;

	LOG && console.log(health);
	for(i=0;i<n;i++){
		index = i;
		index = index.toString();
		switch(boardParams.linearGrid[i]){
			case 'I':
				var _hShrine = '<div id= "'+ index +'"class="_hShrine element"><div class="_hShrineInner depth_4"></div><div class="_hShrineInner2 depth_3"></div><div class="_hShrineCircle depth_5"></div></div>';
				$(".screen").append(_hShrine);
				break;
			case 'O':
				var _hBlankTile = '<div id= "'+ index +'"class="_hBlankTile element"></div>';
				$(".screen").append(_hBlankTile);
				break;
			case 'T':
				var _hTaller = '<div id= "'+ index +'"class="_hTaller tile element"><div id="'+ index +'i" class="_hTallerInner  depth_4"></div></div>';
				$(".screen").append(_hTaller);
				break;
			case 'S':
				var _hStronger = '<div id= "'+ index +'"class="_hStronger tile element"><div id="'+ index +'i" class="_hStrongerInner  depth_4"></div></div>';
				$(".screen").append(_hStronger);
				break;
			case 'Z':
				var _hSharper = '<div id= "'+ index +'"class="_hSharper tile element"><div id="'+ index +'i" class="_hSharperInner  depth_4"></div></div>';
				$(".screen").append(_hSharper);
				break;
			default:
				var _hBlankTile = '<div id= "'+ index +'"class="_hBlankTile element"></div>';
				$(".screen").append(_hBlankTile);
				break;
		}
		
	}

	$(".element").css({'width':boardParams.tileSize,'height':boardParams.boardHeight/5});
	
	//Extra Grass
	
	var _hGrass = '<div class="_hGrass element"><div class="pattern"></div><div class="_hGrassInner"><div class="innerPattern"></div></div></div>';

	var _hGrassDark = '<div class="_hGrassDark element"><div class="pattern"></div><div class="_hGrassInnerDark"><div class="innerPattern"></div></div></div>';


	hitGrid = boardParams.linearGrid.slice(0);
	linearGrid = boardParams.linearGrid.slice(0);
	LOG && console.log(hitGrid);

	for(i=0;i<hitGrid.length;i++){
		if(hitGrid[i] == 'T'){
			hitGrid[i] = clans[clan].tallHit;
		}else if(hitGrid[i] == 'S'){
			hitGrid[i] = clans[clan].strongHit;
		}else if(hitGrid[i] == 'Z'){
			hitGrid[i] = clans[clan].sharpHit;
		}
	}
	LOG && console.log("hitGrid");
	LOG && console.log(hitGrid);
	LOG && console.log("LinearGrid");
	LOG && console.log(boardParams.linearGrid);

	for(i=0;i<5*3;i++){
		
		if(i%2){
			for(j=0;j<boardParams.cols;j++){
				if(j%2){
					$(".topScreen").append(_hGrass);
					$(".bottomScreen").append(_hGrassDark);	
				}else{
					$(".topScreen").append(_hGrassDark);
					$(".bottomScreen").append(_hGrass);	
				}
			}
		}
		else{
			for(j=0;j<boardParams.cols;j++){
			if(j%2){
				$(".topScreen").append(_hGrassDark);
				$(".bottomScreen").append(_hGrass);	
			}else{
				$(".topScreen").append(_hGrass);
				$(".bottomScreen").append(_hGrassDark);	
			}
		}	
		}
				
	}
	$("._hGrass").css({'width':boardParams.tileSize,'height':boardParams.boardHeight/5});
	$("._hGrassDark").css({'width':boardParams.tileSize,'height':boardParams.boardHeight/5});	

	var grassTileSize = (boardParams.boardHeight/5)*0.5;
	$("._hGrassInner").css({'width':grassTileSize,'height':grassTileSize,'margin-top':-grassTileSize/2,'margin-left':-grassTileSize/2});
	$("._hGrassInnerDark").css({'width':grassTileSize,'height':grassTileSize,'margin-top':-grassTileSize/2,'margin-left':-grassTileSize/2});
	
	$("._hShrineInner").css({'width':grassTileSize*1.25,'height':grassTileSize*1.25,'margin-top':-grassTileSize/1.6,'margin-left':-grassTileSize/1.6});
	$("._hShrineInner2").css({'width':grassTileSize,'height':grassTileSize,'margin-top':-grassTileSize/2,'margin-left':-grassTileSize/2});
	$("._hShrineCircle").css({'width':grassTileSize/2,'height':grassTileSize/2,'margin-top':-grassTileSize/4,'margin-left':-grassTileSize/4});
	$("._hTallerInner").css({'width':grassTileSize,'height':grassTileSize,'margin-top':-grassTileSize/2,'margin-left':-grassTileSize/2});
	$("._hStrongerInner").css({'width':grassTileSize,'height':grassTileSize,'margin-top':-grassTileSize/2,'margin-left':-grassTileSize/2});
	$("._hSharperInner").css({'width':grassTileSize,'height':grassTileSize,'margin-top':-grassTileSize/2,'margin-left':-grassTileSize/2});
	//$('.gameArea').show();

	//Add hardware acceleration


	//$("._hShrineInner2").velocity({rotateZ:'45deg'});
	//$("._hShrineInner2").velocity({rotateZ:'360deg'},{duration:3000,loop:true,easing:'linear'});

	//launchIntoFullscreen(document.getElementById("gameArea"));	

	//Show the Board

	$(".loadingScreen").hide();
	$(".gameArea").show();
	


	$("._hTaller").bind('touchend',function(){

		if(health > 0 && buildSubmit){
			var index = $(this).attr('id');
			index = parseInt(index);
			if(linearGrid[index]!="X" && linearGrid[index]!="O" && linearGrid[index]!="I"){
					health = reduceHealth(health,healthConstant);
					hitGrid[index] --;
					animateTile(index,$(this));
			}
		}

	});

	$("._hStronger").bind('touchend',function(){

		if(health > 0 && buildSubmit){
			var index = $(this).attr('id');
			index = parseInt(index);
			if(linearGrid[index]!="X" && linearGrid[index]!="O" && linearGrid[index]!="I"){
					health = reduceHealth(health,healthConstant);
					hitGrid[index] --;
					animateTile(index,$(this));
			}
		}

	});

	$("._hSharper").bind('touchend',function(){

		if(health > 0 && buildSubmit){
			var index = $(this).attr('id');
			index = parseInt(index);
			if(linearGrid[index]!="X" && linearGrid[index]!="O" && linearGrid[index]!="I"){
					health = reduceHealth(health,healthConstant);
					hitGrid[index] --;
					animateTile(index,$(this));
			}
		}

	});


	/*$(".tile").bind('touchend',function(){

		if(health > 0 && buildSubmit){

				var index = $(this).attr('id');
				index = parseInt(index);
				if(boardParams.linearGrid[index]!="X" && boardParams.linearGrid[index]!="O" && boardParams.linearGrid[index]!="I"){
					health = reduceHealth(health,healthConstant);
				}

				if($(this).hasClass('_hTaller')){
					if(boardParams.linearGrid[index]!='X'){
						hitGrid[index] --;
						switch(hitGrid[index]){
							case 1:
								$(this).css({'opacity':opacity[1]});
							break;
							case 2:
								$(this).css({'opacity':opacity[2]});
							break;
							case 0:
								$(this).css({'opacity':opacity[0]});
								boardParams.linearGrid[index] = 'X';
								hitGrid[index] = 0;
								$(this).css({'background':'#FE9132','opacity':0.7});
								//$(this).children().hide();
							break;
						}
					}
				}else if($(this).hasClass('_hStronger')){
					LOG && //console.log(hitGrid[index]);
					if(boardParams.linearGrid[index]!='X'){
						
						hitGrid[index] --;
						switch(hitGrid[index]){
							case 1:
								$(this).css({'opacity':opacity[1]});
							break;
							case 2:
								$(this).css({'opacity':opacity[2]});
							break;
							case 0:
								$(this).css({'opacity':opacity[0]});
								boardParams.linearGrid[index] = 'X';
								hitGrid[index] = 0;
								$(this).css({'background':'#FE9132','opacity':0.7});
								//$(this).children().hide();
							break;
						}
					}
				}else if($(this).hasClass('_hSharper')){

					if(boardParams.linearGrid[index]!='X'){
						
						hitGrid[index] --;
						LOG && console.log(hitGrid[index]);
						switch(hitGrid[index]){
							case 1:
								$(this).css({'opacity':opacity[1]});
							break;
							case 2:
								$(this).css({'opacity':opacity[2]});
							break;
							case 0:
								$(this).css({'opacity':opacity[0]});
								boardParams.linearGrid[index] = 'X';
								hitGrid[index] = 0;
								$(this).css({'background':'#FE9132','opacity':0.7});
								//$(this).children().hide();
							break;
						}
					}
				}		
		}

	});*/


});///io.on("conncetion ends here");


/*$(".hostDemo").click(function(){
	var size = getScreenSize();
	socket.emit('createGame',size);
});


$(".joinDemo").click(function(){
	var joinGame = new Object();
	joinGame.gameId = 'SHRP1';
	joinGame.size = getScreenSize();

	socket.emit('joinGame',joinGame);
});
*/


//User generated click functions


$(".start").click(function(){

	//Transit Screen

	transitScreen('demoHome','clanSelect');
	isHost = 1;
	//var size = getScreenSize();
	//socket.emit('createGame',size);
});

$(".join").click(function(){

	//Transit Screen

	transitScreen('demoHome','clanSelect');
	isHost = 0;
	//var size = getScreenSize();
	//socket.emit('createGame',size);
});

var currentClanScreen = 'glaxoScreen';

$(".clan").click(function(){

	if($(this).hasClass("glaxo")){
		transitScreen('clanSelect','glaxoScreen');
		currentClanScreen = 'glaxoScreen';
	}else if($(this).hasClass("kline")){
		transitScreen('clanSelect','klineScreen');
		currentClanScreen = 'klineScreen';
	}else if($(this).hasClass("smith")){
		transitScreen('clanSelect','smithScreen');
		currentClanScreen = 'smithScreen';
	}else if($(this).hasClass("stark")){
		transitScreen('clanSelect','starkScreen');
		currentClanScreen = 'starkScreen';
	}else if($(this).hasClass("backToHome")){
		transitScreen('clanSelect','demoHome');
	}

});

$(".backToClanSelect").click(function(){

	transitScreen(currentClanScreen,'clanSelect');

});


$(".glaxoSelected").click(function(){
	playerClan = 'glaxo';
	var data = new Object();
	var size = getScreenSize();
	data.size = size;
	data.clan = playerClan;
	localJoinData = data;
	LOG && console.log(data);
	if(isHost){
		$(".loadingText").html("Creating Game");
		transitScreen('glaxoScreen','loadingScreen');
		setTimeout(function(){
			socket.emit('createGame',data);
		},1000);
	}else{
		transitScreen('glaxoScreen','joinScreen');
		$(".i0").focus();
	}
	
});

$(".startDemo").click(function(){
	isHost = true;
	playerClan = 'glaxo';
	var data = new Object();
	var size = getScreenSize();
	data.size = size;
	data.clan = playerClan;
	localJoinData = data;
	LOG && console.log(data);
	if(isHost){
		$(".loadingText").html("Creating Game");
		//transitScreen('demoHome','loadingScreen');
		setTimeout(function(){
			socket.emit('createGame',data);
		},1000);
	}else{
		//transitScreen('glaxoScreen','joinScreen');
		$(".i0").focus();
	}
	
});

$(".execute").click(function(){

	LOG && console.log("Executing the StateMent");
	socket.emit("execute");

});


$(".smithSelected").click(function(){
	playerClan = 'smith';
	var data = new Object();
	var size = getScreenSize();
	data.size = size;
	data.clan = playerClan;
	localJoinData = data;
	LOG && console.log(data);
	if(isHost){
		$(".loadingText").html("Creating Game");
		transitScreen('smithScreen','loadingScreen');
		socket.emit('createGame',data);
	}else{
		transitScreen('smithScreen','joinScreen');	
		$(".i0").focus();
	}

});

$(".klineSelected").click(function(){
	playerClan = 'kline';
	var data = new Object();
	var size = getScreenSize();
	data.size = size;
	data.clan = playerClan;
	localJoinData = data;
	LOG && console.log(data);
	if(isHost){
		$(".loadingText").html("Creating Game");
		transitScreen('klineScreen','loadingScreen');
		socket.emit('createGame',data);
	}else{
		transitScreen('klineScreen','joinScreen');
		$(".i0").focus();
	}

});

$(".starkSelected").click(function(){
	playerClan  = 'stark';
	var data = new Object();
	var size = getScreenSize();
	data.size = size;
	data.clan = playerClan;
	localJoinData = data;
	LOG && console.log(data);
	if(isHost){
		
		$(".loadingText").html("Creating Game");
		transitScreen('starkScreen','loadingScreen');
		socket.emit('createGame',data);
	}else{
		transitScreen('starkScreen','joinScreen');
		$(".i0").focus();	
	}

});

$(".exitGame").click(function(){
	socket.emit('endGame');
});




$(".readyToJoin").click(function(){
	var joinGame = new Object();
	var gameIdInput = $(".joinInput0").val().toUpperCase() + $(".joinInput1").val().toUpperCase() + $(".joinInput2").val().toUpperCase() + $(".joinInput3").val().toUpperCase();
	LOG && console.log(gameIdInput);
	joinGame.gameId = gameIdInput;
	joinGame.size = getScreenSize();
	joinGame.clan = playerClan;
	$(".loadingText").html("Joining");
	transitScreen('joinScreen','loadingScreen');
	isHost = 0;
	setTimeout(function(){
		socket.emit('joinGame',joinGame);
	},1000);
	
});

$(".joinDemo").click(function(){
	var joinGame = new Object();
	//var gameIdInput = $(".joinInput0").val().toUpperCase() + $(".joinInput1").val().toUpperCase() + $(".joinInput2").val().toUpperCase() + $(".joinInput3").val().toUpperCase();
	var gameIdInput = "DEMO";	
	LOG && console.log(gameIdInput);
	joinGame.gameId = gameIdInput;
	joinGame.size = getScreenSize();
	joinGame.clan = "glaxo";
	$(".loadingText").html("Joining");
	//transitScreen('joinDemo','loadingScreen');
	isHost = 0;
	setTimeout(function(){
		socket.emit('joinGame',joinGame);
	},1000);
	
});


$(".exitJoinGame").click(function(){
	transitScreen('joinScreen','demoHome');
});


$(".inputBox").keyup(function () {
  if(this.value.length == 1) {
    $(this).next('.inputBox').focus().removeClass('inputHidden');
  }
});

$(".i3").keydown(function(){
	$(".readyToJoin").removeClass("inputHidden");
});


$(".startActual").click(function(){

	socket.emit('alignScreens');
});


$(".tapArea").click(function(){

	$(".loadingText").html("Ready!");
	transitScreen('alignScreen','loadingScreen');
	socket.emit('updateReady');

});


$(".doneBuild").click(function(){

	if($(this).hasClass('inputHidden')){
		//do nothing
	}else{
		$(".doneBuild").html('waiting').addClass(".inputHidden");
	}

});

////Done till here


/*$(".join").click(function(){
	$(".homescreen").hide();
	$(".joinGame").show();
});*/

/*$(".joinStartPlay").click(function(){

	var joinGame = new Object();
	var gameIdInput = $(".i0").val().toUpperCase() + $(".i1").val().toUpperCase() + $(".i2").val().toUpperCase() + $(".i3").val().toUpperCase();
	LOG && console.log(gameIdInput);
	joinGame.gameId = gameIdInput;
	joinGame.size = getScreenSize();
	socket.emit('joinGame',joinGame);

});

$(".startActual").click(function(){
	socket.emit('generateBoard');
});*/

$(".replay").click(function(){
	socket.emit('replay');
	socket.emit('execute');
});

$(".exitGameEnd").click(function(){
	window.location.replace('http://192.168.1.17:5000');
	//transitScreen('gameEnd','demoHome');
});



var loadingIndex = 0;

var loadingFlicker = setInterval(function(){
	if(loadingIndex%2){
		$('.loadingText').transition({opacity: 0.5});
		$('.alignNo').transition({opacity: 0.5});
		$('.messageLog').transition({opacity: 0.5});
	}else{
		$(".loadingText").transition({opacity: 1});
		$('.alignNo').transition({opacity: 1});
		$('.messageLog').transition({opacity: 1});
	}
	loadingIndex++;

},300);


transitScreen('demoHome','demoHome');
/*margin = $(".demoHome").children('.navScreenInner').height();
console.log(margin);
$(".demoHome").children('.navScreenInner').css({'top':'50%','margin-top': - margin});
$(".demoHome").children('.navScreenInner').transition({opacity:1},400);
*/

//Jquery Ends here
});



function getScreenSize(){
	var size = new Object();
	size.height = window.screen.height;
	size.width = window.screen.width;
	size.ratio = window.getDevicePixelRatio();
	size.userAgent = navigator.userAgent;
	size.pHeight = pHeight;
	size.pWidth = pWidth;
	LOG && console.log("Setting Screen Sizes:" + size);
	return size; 
}



function launchIntoFullscreen(element) {
  if(element.requestFullscreen) {
    element.requestFullscreen();
  } else if(element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if(element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
  } else if(element.msRequestFullscreen) {
    element.msRequestFullscreen();
  }
}


function randomIntFromInterval(min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}


function reduceHealth(health,healthConstant){

	health --;
	if(health<=0){
		$(".healthBar").transition({height:'0%'},200);
		return 0;
	}else{
		healthHeight = (health/healthConstant) * 100;
		perChange = healthHeight;
		perChange = perChange / 2;
		perChange = perChange +'%';
		LOG && console.log(perChange);
		$(".healthBar").transition({height:perChange},200);
		return health;	
	}
}

function updateHealth(health,healthConstant){
	if(health <=0){
		$(".healthBar").transition({height:'0%'},200);	
	}else{
		healthHeight = (health/healthConstant) * 100;
		perChange = healthHeight;
		perChange = perChange / 2;
		perChange = perChange +'%';
		LOG && console.log(perChange);
		$(".healthBar").transition({height:perChange},200);
	}
	
}

function transitScreen(from,to){

	$("."+from).transition({opacity:0},200,function(){
		$("."+from).hide();
		$("."+to).css({opacity:0});
		$("."+to).show();
		margin = $("."+to).children('.navScreenInner').height()/2;
		console.log(margin);
		$("."+to).transition({opacity:1},400);	
		if(margin*2 < window.screen.height){
			$("."+to).children('.navScreenInner').css({'top':'50%','margin-top':-margin});
			$("."+to).children('.navScreenInner').transition({opacity:1},400);
		}else{
			$("."+to).children('.navScreenInner').transition({opacity:1},400);
		}
		
	});
	
}

function demoMessage(message){
	$(".ppi").empty();

	$(".ppi").html(message);
}


var canvas;
var hitGrid = new Array();
var linearGrid = new Array();
var pHeight;
var pWidth;
var LOG = true;
var terminal = new Object();
var highlightColor = "#1DE9B6";
var shrineColor = '#FF7700';
var shrineInnerColor = '#FCB634';
var tallerColor = '#D2483D';
var tallerInnerColor = '#F9615B';
var strongerColor = '#8F1292';
var strongerInnerColor = '#B8D348';
var sharperColor = '#7C76B7';
var sharperInnerColor = '#6114CC';
var grassColor = '#ABB850';
var grassDarkColor = '#91A847';
var backColor = 'white';
var screenColor = '#546E7A';
var shrineHiglightDarkColor = "#009688";
var drawOffset = 0;
var grassOffset = 0;
var healthCanvas;
var shrineCanvas;
var hitText = ['','.','..','...'];
var blockArray = new Array();
var textArray = new Array();
var n;
var playerHealth;
var TERMINAL = false;
var shrineArray = [];
var gameWon = false;
var score = 0;
terminal.log = function(socket,message){
	if(TERMINAL){
		socket.emit("log",message);	
	}
	
}

Number.prototype.toH = function(){
	var actual = window.screen.height;
	var physical = pHeight;
	return (actual*this)/physical;
}

Number.prototype.toW = function(){
	var actual = window.screen.width;
	var physical = pWidth;
	return (actual*this)/physical;
}

function drawShrine(x,y,tileW,tileH){
	y = y + drawOffset;
	var shrineObject = new Object();
	var rect = new fabric.Rect({
	  	left: x + tileW/2,
	  	top: y + tileH/2,
	  	width:tileW + 1,
	  	height:tileH + 1,
	  	fill:shrineInnerColor,
	  	centeredRotation:true,
	  	centeredScaling:true,
	  	originX:'center',
	  	originY:'center',
	  	selectable:false,
	  	hasRotatingPoint:false,
	  	hasBorder:false,
	  	hasControls:false,
	  	opacity:0.5
	});
	canvas.add(rect);
	shrineObject.rect1 = rect;
	var rect = new fabric.Rect({
	  	left: x + tileW/2,
	  	top: y + tileH/2,
	  	width:tileH*0.65,
	  	height:tileH*0.65,
	  	fill:shrineColor,
	  	centeredRotation:true,
	  	centeredScaling:true,
	  	originX:'center',
	  	originY:'center',
	  	selectable:false,
	  	hasRotatingPoint:false,
	  	hasBorder:false,
	  	hasControls:false
	});
	canvas.add(rect);
	shrineObject.rect2 = rect;
	var rect = new fabric.Rect({
	  	left: x + tileW/2,
	  	top: y + tileH/2,
	  	width:tileH*0.45,
	  	height:tileH*0.45,
	  	fill:shrineInnerColor,
	  	centeredRotation:true,
	  	centeredScaling:true,
	  	originX:'center',
	  	originY:'center',
	  	selectable:false,
	  	hasRotatingPoint:false,
	  	hasBorder:false,
	  	hasControls:false
	});
	canvas.add(rect);
	shrineObject.rect3 = rect;
	var rect = new fabric.Rect({
	  	left: x + tileW/2,
	  	top: y + tileH/2,
	  	width:tileH*0.25,
	  	height:tileH*0.25,
	  	fill:shrineInnerColor,
	  	centeredRotation:true,
	  	centeredScaling:true,
	  	originX:'center',
	  	originY:'center',
	  	selectable:false,
	  	hasRotatingPoint:false,
	  	hasBorder:false,
	  	hasControls:false
	});
	canvas.add(rect);
	shrineObject.rect4 = rect;
	/*var circle = new fabric.Circle({
	  	left: x + tileW/2,
	  	top: y + tileH/2,
	  	radius:tileH*0.10,
	  	fill:shrineHiglightDarkColor,
	  	centeredRotation:true,
	  	centeredScaling:true,
	  	originX:'center',
	  	originY:'center',
	  	selectable:false,
	  	hasRotatingPoint:false,
	  	hasBorder:false,
	  	hasControls:false,
	  	opacity:0
	});
	canvas.add(circle);
	shrineObject.circle = circle;*/
	shrineArray.push(shrineObject);
}

function drawTaller(x,y,tileW,tileH,index){
	y = y + drawOffset;
	var obj = new Array();
	var rect = new fabric.Rect({
	  	left: x + tileW/2,
	  	top: y + tileH/2,
	  	width:tileH*0.65,
	  	height:tileH*0.65,
	  	fill:tallerInnerColor,
	  	centeredRotation:true,
	  	centeredScaling:true,
	  	originX:'center',
	  	originY:'center',
	  	selectable:false,
	  	hasRotatingPoint:false,
	  	hasBorder:false,
	  	hasControls:false
	});
	obj[0] = rect;
	var text = new fabric.Text(hitText[hitGrid[index]], {
		left: x + tileW/2,
	  	top: y + tileH/2.1,
  		fontSize: 20,
  		fill:"#ffffff",
  		stroke:"#ffffff",
  		strokeWidth:3,
  		fontFamily: 'Roboto Mono',
  		centeredRotation:true,
	  	centeredScaling:true,
	  	originX:'center',
	  	originY:'center',
	  	selectable:false,
	  	hasRotatingPoint:false,
	  	hasBorder:false,
	  	hasControls:false
	});
	obj[1] = text;
	return obj;
}

function drawStronger(x,y,tileW,tileH,index){
	y = y + drawOffset;
	var obj = new Array();
	var rect = new fabric.Rect({
	  	left: x + tileW/2,
	  	top: y + tileH/2,
	  	width:tileH*0.65,
	  	height:tileH*0.65,
	  	fill:strongerInnerColor,
	  	centeredRotation:true,
	  	centeredScaling:true,
	  	originX:'center',
	  	originY:'center',
	  	selectable:false,
	  	hasRotatingPoint:false,
	  	hasBorder:false,
	  	hasControls:false
	});
	obj[0] = rect;
	var text = new fabric.Text(hitText[hitGrid[index]], {
		left: x + tileW/2,
	  	top: y + tileH/2.1,
  		fontSize: 20,
  		fill:"#ffffff",
  		stroke:"#ffffff",
  		strokeWidth:3,
  		fontFamily: 'Roboto Mono',
  		centeredRotation:true,
	  	centeredScaling:true,
	  	originX:'center',
	  	originY:'center',
	  	selectable:false,
	  	hasRotatingPoint:false,
	  	hasBorder:false,
	  	hasControls:false
	});
	obj[1] = text;
	return obj;
}

function drawSharper(x,y,tileW,tileH,index){
	y = y + drawOffset;
	var obj = new Array();
	var rect = new fabric.Rect({
	  	left: x + tileW/2,
	  	top: y + tileH/2,
	  	width:tileH*0.65,
	  	height:tileH*0.65,
	  	fill:sharperInnerColor,
	  	centeredRotation:true,
	  	centeredScaling:true,
	  	originX:'center',
	  	originY:'center',
	  	selectable:false,
	  	hasRotatingPoint:false,
	  	hasBorder:false,
	  	hasControls:false
	});
	obj[0] = rect;
	var text = new fabric.Text(hitText[hitGrid[index]], {
		left: x + tileW/2,
	  	top: y + tileH/2.1,
  		fontSize: 20,
  		fill:"#ffffff",
  		stroke:"#ffffff",
  		strokeWidth:3,
  		fontFamily: 'Roboto Mono',
  		centeredRotation:true,
	  	centeredScaling:true,
	  	originX:'center',
	  	originY:'center',
	  	selectable:false,
	  	hasRotatingPoint:false,
	  	hasBorder:false,
	  	hasControls:false
	});
	obj[1] = text;
	return obj;
}

//Animate Blocks



function animateBlock(index){

	hitGrid[index] -- ;

	if(hitGrid[index] == 0){
		//transfrom to blank level 0
		textArray[index].setText(hitText[hitGrid[index]]);

		blockArray[index].animate('scaleX',0.02,{
			duration:200,
			onChange: canvas.renderAll.bind(canvas)
		});

		blockArray[index].animate('scaleY',0.02,{
			duration:200,
			onChange: canvas.renderAll.bind(canvas)
		});


		setTimeout(function(){

			//blockArray[index].set('width',tileW);
			//blockArray[index].set('height',tileH);
			tScaleY = (tileH+1)/(tileH*0.65);
			tScaleX = (tileW+1)/(tileH*0.65);
			console.log("Scale factors:" + tScaleX + ',' + tScaleY);

			blockArray[index].animate('scaleX',tScaleX,{
				duration:200,
				onChange: canvas.renderAll.bind(canvas)
			});

			blockArray[index].animate('scaleY',tScaleY,{
				duration:200,
				onChange: canvas.renderAll.bind(canvas)
			});

			blockArray[index].set('fill',shrineInnerColor);
			canvas.renderAll();

		},200);
		linearGrid[index] = 'X';

	}else if(hitGrid[index] == 1){
		//transform to level 1
		textArray[index].setText(hitText[hitGrid[index]]);
		
		blockArray[index].animate('scaleX',0.4,{
			duration:200,
			onChange: canvas.renderAll.bind(canvas)
		});

		blockArray[index].animate('scaleY',0.4,{
			duration:200,
			onChange: canvas.renderAll.bind(canvas)
		});

	}else if(hitGrid[index] == 2){
		//transfrom to level 2
		textArray[index].setText(hitText[hitGrid[index]]);

		blockArray[index].animate('scaleX',0.7,{
			duration:200,
			onChange: canvas.renderAll.bind(canvas)
		});

		blockArray[index].animate('scaleY',0.7,{
			duration:200,
			onChange: canvas.renderAll.bind(canvas)
		});
	}

}

function logMessage(message){
	$(".messageLog").html(message);
	setTimeout(function(){
		$(".messageLog").html('');
	},2000);
}


function doOnOrientationChange()
  {
    switch(window.orientation) 
    {  
      case -90:
      case 90:
      	$(".rotate").css({'opacity':0});
      	$(".rotate").show();
      	$(".rotateInner").css({'margin-top':-$(".rotateInner").height()/2});
      	$(".rotate").css({'opacity':1});
      	$(".rotateInner").css({'opacity':1});
        break; 
      default:
        $(".rotate").hide();
        break; 
    }
  }

  window.addEventListener('orientationchange', doOnOrientationChange);

doOnOrientationChange();



function startScoreCount(){

	setTimeout(function(){
		scoreTemp = score;
		console.log("Consoling Score");
		console.log(score);
		var time = 2000;
		var i = 0;
		var interval = setInterval(function(){
			$(".score").html(i);
			i++;
			if(i>score){
				clearInterval(interval);
			}
		},time/score);
		
	},200);
	
}