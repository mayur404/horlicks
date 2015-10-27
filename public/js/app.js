$(function(){

//Dont forget to turn off the comments for the mixpanel logging

//mixpanel.track("Link Opened");

LOG && console.log("Link Opened");

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
var baseTiles = 25;
var healthConstant = health;
var buildSubmit = 1;	//set to 0 if the build is submited


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
clans.push(strongClan);
clans.push(tallClan);
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


//Functions executed from the server

socket.on('hostGameSetup',function(gameData){

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

socket.on('playerJoined',function(gameData){

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

	if(gameOn){
		transitScreen('gameArea','home')
	}else{
		if(isHost){
			transitScreen('hostScreen','home')	
		}else{
			transitScreen('joinScreen','home')	
		}	
	}
	isHost = 0;
	gameOn = 0;
	updateGlobalIndex = 0;
	flickerStarted = 0;
	buildSubmit = 1;
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
				socket.emit('generateBoard');	
			}
		}
	},800);
	
});


socket.on('drawBoard',function(boardParams){


	///Top bar


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


	$("._hShrineInner2").velocity({rotateZ:'45deg'},{ mobileHA: true });
	$("._hShrineInner2").velocity({rotateZ:'360deg'},{duration:3000,loop:true,easing:'linear',mobileHA:true});

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

	transitScreen('home','clanSelect');
	isHost = 1;
	//var size = getScreenSize();
	//socket.emit('createGame',size);
});

$(".join").click(function(){

	//Transit Screen

	transitScreen('home','clanSelect');
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
		transitScreen('clanSelect','home');
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


$(".exitJoinGame").click(function(){
	transitScreen('joinScreen','home');
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



var loadingIndex = 0;

var loadingFlicker = setInterval(function(){
	if(loadingIndex%2){
		$('.loadingText').transition({opacity: 0.5});
		$('.alignNo').transition({opacity: 0.5});
	}else{
		$(".loadingText").transition({opacity: 1});
		$('.alignNo').transition({opacity: 1});
	}
	loadingIndex++;

},300);

//Jquery Ends here
});



function getScreenSize(){
	var size = new Object();
	size.height = window.screen.height;
	size.width = window.screen.width;
	size.ratio = window.getDevicePixelRatio();
	size.userAgent = navigator.userAgent;
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

	health -- ;
	healthHeight = (health/healthConstant) * 100;
	healthHeight = (100 - healthHeight) + '%'
	LOG && console.log(healthHeight);
	//$(".healthBar").transition({y:healthHeight},100).transition({rotate:'4deg'},120).transition({rotate:'-4deg'},120).transition({rotate:'0deg'},120);
	//Animating in sequence
	$element = $('.healthBar')
	var mySequence = [
	    { e: $element, p: { translateY: healthHeight }, o: { duration: 120, mobileHA:true } },
	    { e: $element, p: { rotateZ: '6deg' }, o: { duration: 120, mobileHA:true } },
	    { e: $element, p: { rotateZ: '-6deg' }, o: { duration: 120, mobileHA:true } },
	    { e: $element, p: { rotateZ: '0deg' }, o: { duration: 120, mobileHA:true } }
	];

	$.Velocity.RunSequence(mySequence);

	if(health < 0){
		$(".doneBuild").addClass('inputHidden');
	}
	return health;

}


function transitScreen(from,to){

	$("."+from).transition({opacity:0},200,function(){
		$("."+from).hide();
		$("."+to).css({opacity:0});
		$("."+to).show();
		$("."+to).transition({opacity:1},400);
	});
	
}


function animateTile(index, element){
	$elem = $("#"+index);
	$child = $("#"+index+"i");
	LOG && console.log(index);
	LOG && console.log(hitGrid[index]);
	var scaleArray = [0,0.5,0.75];
	var myTime = 250;
	if(hitGrid[index] == 0){
		LOG && console.log("If section");
		linearGrid[index] = 'X';
		hitGrid[index] = 0;
		$child.velocity({scaleX:1.1,scaleY:1.1},{duration:myTime,mobileHA:true,complete:function(){
			$child.velocity({scaleX:scaleArray[hitGrid[index]],scaleY:scaleArray[hitGrid[index]]},{duration:myTime,mobileHA:true,complete:function(){
				
				$elem.velocity({
					backgroundColor: "#FE9132",
    				backgroundColorAlpha: 0.8,
				},{duration:myTime, mobileHA:true});

				$child.velocity({
					backgroundColor: "#FCB634",
    				backgroundColorAlpha: 0.8,
    				scaleX:1,
    				scaleY:1
				},{duration:myTime, mobileHA:true});

			}});
		}});

	}else{
		LOG && console.log("Else Section");
		$child.velocity({scaleX:1.1,scaleY:1.1},{duration:myTime, mobileHA:true ,complete:function(){
			$child.velocity({scaleX:scaleArray[hitGrid[index]],scaleY:scaleArray[hitGrid[index]]},{duration:myTime, mobileHA:true});
		}});
	}

}



//Array Declaration


var hitGrid = new Array();
var linearGrid = new Array();

var LOG = false;
/*function showLoading(from,text){
	
	var to = 'loadingScreen';
	$(".loadingText").html('Creating Game');
	$("."+from).transition({opacity:0},200,function(){
		$("."+from).hide();
		$("."+to).css({opacity:0});
		$("."+to).show();
		$("."+to).transition({opacity:1},400);
	});

}*/