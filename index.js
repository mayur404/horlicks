var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = 8080;
server.listen(port,function(){
	console.log('Server listening at 8080');
});



//Routing 

app.use(express.static(__dirname+'/public'));

//Global Game Variables

var gameRoom = [];
var players = [];
var sockets = [];
var playerIdBase = -1;
var gameIdList = new Array();
var gameIndex = -1;
var gameLinearGrid = new Array();
var lastCreatedId;



io.on('connection',function(socket){

	console.log('Player Connected');
	//When any new Player is connected to the game irrespective of the type of player;
	//creating a player object
	var tempPlayer = new Object();
	tempPlayer.id = playerIdBase+1;
	playerIdBase++;
	players.push(tempPlayer); 
	sockets.push(socket);


	//If the client creates a game
	socket.on('createGame',function(data){
		console.log("Game Created By Host");
		console.log(data.size);
		console.log('Game Created');
		var tempId = createGameId();
		//creating game object
		var game = new Object();
		game.gameId = tempId;
		game.players = new Array();
		for(i=0;i<sockets.length;i++){
			if(sockets[i] == socket){
				players[i].gameId = game.gameId;
				players[i].isHost = true;
				players[i].size = data.size;
				players[i].clan = data.clan;
				if(game.players){
					players[i].index = game.players.length + 1;	
				}
				game.players.push(players[i]);
				game.host = players[i];
				game.ready = 0;
			}
		}
		game.playersJoined = 1;
		gameRoom.push(game);
		var currGameIndex = gameRoom.length - 1;
		socket.emit('hostGameSetup',JSON.stringify(gameRoom[currGameIndex]));
		
	});

	//If the client wants to join an existing game
	socket.on('joinGame',function(joinGame){
		console.log('Joined Game');
		var success = 0;
		console.log(joinGame.size);
		for(i=0;i<gameRoom.length;i++){
			if(gameRoom[i].gameId == joinGame.gameId){	//Uncomment this later
				//Adding this player to the playersList
				for(j=0;j<sockets.length;j++){
					if(sockets[j] ==  socket){
						players[j].gameId = gameRoom[i].gameId;
						players[j].isHost = false;
						players[j].size = joinGame.size;
						players[j].clan = joinGame.clan;
						if(gameRoom[i].players){
							players[j].index = gameRoom[i].players.length + 1 ;
						}
						gameRoom[i].players.push(players[j]);
						gameRoom[i].playersJoined++;
						socket.emit('playerJoined',JSON.stringify(gameRoom[i]));
						success = 1;
						break;
					}
				}
			} 
		}
		if(!success){
			socket.emit('wrongGameIdEntered');	
		}
		

	});

	socket.on('requestGameData',function(){

		for(i=0;i<sockets.length;i++){
			if(sockets[i] == socket){
				for(j=0;j<gameRoom.length;j++){
					if(gameRoom[j].gameId == players[i].gameId){
						socket.emit('requestGameData',JSON.stringify(gameRoom[j]));
						break;				
					}
				}
			}
		}
		
	});


	socket.on('updateGlobalStatus',function(){

		var gameId;
		var gameData;
		var tempPlayers;
		
		gameId = getGameId(socket);
		gameData = getGameData(gameId);
		console.log(gameData);
		for(i=0;i<gameData.players.length;i++){
				sockets[gameData.players[i].id].emit('updateGlobalStatus',gameData);
		}


	});

	socket.on('alignScreens',function(){

		var gameId;
		var gameData;
		var tempPlayers;
		
		gameId = getGameId(socket);
		gameData = getGameData(gameId);
		console.log(gameData);
		for(i=0;i<gameData.players.length;i++){
				sockets[gameData.players[i].id].emit('alignScreens',gameData.players[i].index);
		}

	});

	socket.on('generateBoard',function(){
		var gameId;
		var gameData;
		var n;

		gameId = getGameId(socket);
		gameData = getGameData(gameId);

		var heights =  new Array();
		var ratios = new Array();
		n = gameData.playersJoined;
		//console.log(gameData);

		for(i=0;i<n;i++){
			heights.push(parseInt(gameData.players[i].size.height));
		}
		//console.log(heights);

		min = Math.min.apply(Math, heights);
		console.log(min);

		smallestI = heights.indexOf(min);
		//console.log(smallestI);

		minHeight = gameData.players[smallestI].size.height;
		minWidth = gameData.players[smallestI].size.width;

		boardHeight = minWidth;

		gameData.boardHeight = boardHeight;
		gameData.tileSize = boardHeight/5;

		//console.log(gameData);

		boardParams = new Object();
		boardParams.boardHeight = boardHeight;
		boardParams.ratio = gameData.players[smallestI].size.ratio;
		
		basePlayerIndex = smallestI;

		tileSize = boardHeight/5;

		for(i=0;i<gameData.players.length;i++){
			if(i==basePlayerIndex){
				gameData.players[i].tileSize = tileSize;
				gameData.players[i].cols = 5;
				//console.log(gameData.players[i].size.height);
				//console.log(gameData.players[i].size.width);
			}else{
				tileSize =boardHeight/5;
				width = gameData.players[i].size.width;
				//console.log('width: '+ width);
				tempCol = Math.floor(width/tileSize);
				//console.log('tempCol: '+tempCol);
				remainder = width - (tempCol*tileSize);
				//console.log('remainder: '+remainder);
				extra = remainder/tempCol;
				tileSize = tileSize + extra;
				//console.log('tileSize: '+tileSize);
				gameData.players[i].tileSize = tileSize;
				gameData.players[i].cols = tempCol;
			}
		}

		updateGameData(gameData,gameId);
		gameData = getGameData(gameId);

		for(z=0;z<gameData.players.length;z++){
			n = gameData.players[z].cols * 5;
			index = z;
			//console.log(generateGrid(n , index , gameData.players.length - 1,gameData.players[z].size.userAgent));
			gameData.players[z].gameLinearGrid = generateGrid(n , index , gameData.players.length - 1,gameData.players[z].size.userAgent);

			//Done till here 
			//Now the gameLinearGrid has all the linear values of the different players now just convert this linear values to proper matrix
			//Send the players Linear Values itself
		}
		
		updateGameData(gameData,gameId);
		gameData = getGameData(gameId);

		console.log("List of generated grids -----------------------------");
		for(i=0;i<gameData.players.length;i++){
			var boardData = new Object();
			boardParams.boardHeight = boardHeight;
			boardParams.size = gameData.players[i].size;
			boardParams.playerId = gameData.players[i].id;
			boardParams.tileSize = gameData.players[i].tileSize;
			boardParams.cols = gameData.players[i].cols; 
			boardParams.linearGrid = gameData.players[i].gameLinearGrid;
			console.log(boardParams);
			sockets[gameData.players[i].id].emit('drawBoard',boardParams);
		}

	});
	
	socket.on('clanSelected',function(playerClan){

		var gameId = getGameId(socket);
		var gameData = getGameData(gameId);

		for(i=0;i<sockets.length;i++){
			if(sockets[i] == socket){

			}
		}

	});

	socket.on('endGame',function(){

		//Do all the deletion of the game and all
		var gameId = getGameId(socket);
		var gameData = getGameData(gameId);
		for(i=0;i<gameRoom.length;i++){
			if(gameRoom[i].gameId == gameId){
				remove(gameRoom, i);
				break;
			}
		}
		console.log(gameRoom);
		socket.emit('endGame');
	});	

	socket.on('updateReady',function(){

		var gameId = getGameId(socket);
		for(i=0;i<gameRoom.length;i++){
			if(gameRoom[i].gameId == gameId){
				gameRoom[i].ready++;
				break;
			}
		}
		var gameData = getGameData(gameId);
		console.log(gameData.ready);
		if(gameData.ready == gameData.playersJoined){
			//Start Game;
			console.log("Start The Game");
			for(j=0;j<gameData.players.length;j++){
				sockets[gameData.players[j].id].emit('showMoto');
			}
		}

	});	


//io Functions end here
});


function getGameId(socket){

	var gameId;

	for(i=0;i<sockets.length;i++){
			if(sockets[i] == socket){
				gameId = players[i].gameId;
				break;
			}
	}

	return gameId;
}

function getGameData(gameId){

	var gameData;

	for(i=0;i<gameRoom.length;i++){
		if(gameRoom[i].gameId == gameId){
				tempPlayers = gameRoom[i].players;
				gameData = gameRoom[i];
				break;
		}
	}

	return gameData;

}


function updateGameData(gameData, gameId){

	for(i=0;i<gameRoom.length;i++){
		if(gameRoom[i].gameId == gameId){
			gameRoom[i] = gameData;
			break;
		}
	}
}



function generateGrid(n,index,l,userAgent){


	//console.log("Generating Grid for .........................................................................");
	//console.log(userAgent);
	var cols = n/5;
	var singleGrid = new Array();
	
	for(i=0;i<n;i++){
		singleGrid.push(i);
	}
	console.log("Printing Single Grid");
	console.log(singleGrid);
	
	var leftCols = new Array();

	for(i=0;i<5;i++){
		leftCols.push(i*cols);
		leftCols.push(i*cols + 1);
		if(cols>5){
			leftCols.push(i*cols + 2);
		}
		if(cols>7){
			leftCols.push(i*cols + 3);	
		}
		if(cols>10){
			leftCols.push(i*cols + 4);		
		}
		if(cols>12){
			leftCols.push(i*cols + 5);		
		}

	}
	console.log(leftCols);

	var rightCols = new Array();

	for(i=0;i<5;i++){
		if(cols>12){
			rightCols.push(i*cols + cols - 6);
		}
		if(cols>10){
			rightCols.push(i*cols + cols - 5);
		}
		if(cols>7){
			rightCols.push(i*cols + cols - 4);
		}
		if(cols>5){
			rightCols.push(i*cols + cols - 3);
		}
		rightCols.push(i*cols + cols - 2);
		rightCols.push(i*cols + cols - 1);
		
	}
	console.log(rightCols);

	var playerGrid = new Array();
	playerGrid.length = singleGrid.length;

	if(cols <= 5){			//Mobile Devices
		if(index==0){	//first Device

			//Add Shrine
			rand = getFromArray(leftCols);
			playerGrid[rand] = 'I';
			singleGrid  = remove(singleGrid,singleGrid.indexOf(rand));

			//Adding Obstacles
			for(i=0;i<3;i++){
				rand = getFromArray(singleGrid);
				playerGrid[rand] = 'O';
				singleGrid  = remove(singleGrid,singleGrid.indexOf(rand));
			}

			//Adding 
			while(singleGrid && singleGrid.length){
				
				rand = getFromArray(singleGrid);
				playerGrid[rand] = 'T';
				singleGrid  = remove(singleGrid,singleGrid.indexOf(rand));

				rand = getFromArray(singleGrid);
				playerGrid[rand] = 'S';
				singleGrid  = remove(singleGrid,singleGrid.indexOf(rand));

				rand = getFromArray(singleGrid);
				playerGrid[rand] = 'Z';
				singleGrid  = remove(singleGrid,singleGrid.indexOf(rand));
			}
			console.log(playerGrid);

						
		}else if(i==l){	//last Device
			//Add Shrine
			rand = getFromArray(rightCols);
			playerGrid[rand] = 'I';
			singleGrid  = remove(singleGrid,singleGrid.indexOf(rand));

			//Adding Obstacles
			for(i=0;i<3;i++){
				rand = getFromArray(singleGrid);
				playerGrid[rand] = 'O';
				singleGrid  = remove(singleGrid,singleGrid.indexOf(rand));
			}

			//Adding 
			while(singleGrid && singleGrid.length){
				
				rand = getFromArray(singleGrid);
				playerGrid[rand] = 'T';
				singleGrid  = remove(singleGrid,singleGrid.indexOf(rand));

				rand = getFromArray(singleGrid);
				playerGrid[rand] = 'S';
				singleGrid  = remove(singleGrid,singleGrid.indexOf(rand));

				rand = getFromArray(singleGrid);
				playerGrid[rand] = 'Z';
				singleGrid  = remove(singleGrid,singleGrid.indexOf(rand));
			}
			console.log(playerGrid);


		}else{		//middle Device

			//Add Shrine
			rand = getFromArray(singleGrid);
			playerGrid[rand] = 'I';
			singleGrid  = remove(singleGrid,singleGrid.indexOf(rand));

			//Adding Obstacles
			for(i=0;i<3;i++){
				rand = getFromArray(singleGrid);
				playerGrid[rand] = 'O';
				singleGrid  = remove(singleGrid,singleGrid.indexOf(rand));
			}

			//Adding 
			while(singleGrid && singleGrid.length){
				
				rand = getFromArray(singleGrid);
				playerGrid[rand] = 'T';
				singleGrid  = remove(singleGrid,singleGrid.indexOf(rand));

				rand = getFromArray(singleGrid);
				playerGrid[rand] = 'S';
				singleGrid  = remove(singleGrid,singleGrid.indexOf(rand));

				rand = getFromArray(singleGrid);
				playerGrid[rand] = 'Z';
				singleGrid  = remove(singleGrid,singleGrid.indexOf(rand));
			}
			console.log(playerGrid);

		}
	}else if(cols>5 && cols <=7){			//Iphone and Small Tabs
		console.log("Mid Device");
		console.log(leftCols);
		console.log(rightCols);
		console.log(singleGrid);
		if(index==0){	//first Device

			//Add Shrine
			console.log("First Device");
			rand = getFromArray(leftCols);
			playerGrid[rand] = 'I';
			singleGrid  = remove(singleGrid,singleGrid.indexOf(rand));
			console.log("Removed");
			//Adding Obstacles
			for(i=0;i<4;i++){
				rand = getFromArray(singleGrid);
				playerGrid[rand] = 'O';
				singleGrid  = remove(singleGrid,singleGrid.indexOf(rand));
			}

			//Adding 
			while(singleGrid &&  singleGrid.length){
				
				rand = getFromArray(singleGrid);
				playerGrid[rand] = 'T';
				singleGrid  = remove(singleGrid,singleGrid.indexOf(rand));

				rand = getFromArray(singleGrid);
				playerGrid[rand] = 'S';
				singleGrid  = remove(singleGrid,singleGrid.indexOf(rand));

				rand = getFromArray(singleGrid);
				playerGrid[rand] = 'Z';
				if(singleGrid)
					singleGrid  = remove(singleGrid,singleGrid.indexOf(rand));
			}
			console.log(playerGrid);

						
		}else if(i==l){	//last Device
			//Add Shrine
			console.log("Last Device");
			rand = getFromArray(rightCols);
			playerGrid[rand] = 'I';
			singleGrid  = remove(singleGrid,singleGrid.indexOf(rand));

			//Adding Obstacles
			for(i=0;i<4;i++){
				rand = getFromArray(singleGrid);
				playerGrid[rand] = 'O';
				singleGrid  = remove(singleGrid,singleGrid.indexOf(rand));
			}

			//Adding 
			while(singleGrid && singleGrid.length){
				
				rand = getFromArray(singleGrid);
				playerGrid[rand] = 'T';
				singleGrid  = remove(singleGrid,singleGrid.indexOf(rand));

				rand = getFromArray(singleGrid);
				playerGrid[rand] = 'S';
				singleGrid  = remove(singleGrid,singleGrid.indexOf(rand));

				rand = getFromArray(singleGrid);
				playerGrid[rand] = 'Z';
				singleGrid  = remove(singleGrid,singleGrid.indexOf(rand));
			}
			console.log(playerGrid);


		}else{		//middle Device

			//Add Shrine
			console.log("Middle Device and Printing Grid");
			console.log(singleGrid);
			rand = getFromArray(singleGrid);
			playerGrid[rand] = 'I';
			singleGrid  = remove(singleGrid,singleGrid.indexOf(rand));

			//Adding Obstacles
			for(i=0;i<3;i++){
				rand = getFromArray(singleGrid);
				playerGrid[rand] = 'O';
				singleGrid  = remove(singleGrid,singleGrid.indexOf(rand));
			}
			console.log(singleGrid);
			//Adding 
			while(singleGrid && singleGrid.length){
				
				rand = getFromArray(singleGrid);
				playerGrid[rand] = 'T';
				singleGrid  = remove(singleGrid,singleGrid.indexOf(rand));

				rand = getFromArray(singleGrid);
				playerGrid[rand] = 'S';
				singleGrid  = remove(singleGrid,singleGrid.indexOf(rand));

				rand = getFromArray(singleGrid);
				playerGrid[rand] = 'Z';
				singleGrid  = remove(singleGrid,singleGrid.indexOf(rand));
			}
			console.log(playerGrid);

		}
	}else if(cols>7 && cols<=10){   //Ipads and All of that size

			
			//Add Shrine
			rand = getFromArray(leftCols);
			playerGrid[rand] = 'I';
			singleGrid  = remove(singleGrid,singleGrid.indexOf(rand));

			rand = getFromArray(rightCols);
			playerGrid[rand] = 'I';
			singleGrid  = remove(singleGrid,singleGrid.indexOf(rand));

			//Adding Obstacles
			for(i=0;i<6;i++){
				rand = getFromArray(singleGrid);
				playerGrid[rand] = 'O';
				singleGrid  = remove(singleGrid,singleGrid.indexOf(rand));
			}

			//Adding 
			while(singleGrid && singleGrid.length){
				
				rand = getFromArray(singleGrid);
				playerGrid[rand] = 'T';
				singleGrid  = remove(singleGrid,singleGrid.indexOf(rand));

				rand = getFromArray(singleGrid);
				playerGrid[rand] = 'S';
				singleGrid  = remove(singleGrid,singleGrid.indexOf(rand));

				rand = getFromArray(singleGrid);
				playerGrid[rand] = 'Z';
				singleGrid  = remove(singleGrid,singleGrid.indexOf(rand));
			}
			console.log(playerGrid);

						
	}else if(cols>10 && cols<=12){	//Larger than Ipad

			//Add Shrine
			rand = getFromArray(leftCols);
			playerGrid[rand] = 'I';
			singleGrid  = remove(singleGrid,singleGrid.indexOf(rand));

			rand = getFromArray(rightCols);
			playerGrid[rand] = 'I';
			singleGrid  = remove(singleGrid,singleGrid.indexOf(rand));

			//Adding Obstacles
			for(i=0;i<7;i++){
				rand = getFromArray(singleGrid);
				playerGrid[rand] = 'O';
				singleGrid  = remove(singleGrid,singleGrid.indexOf(rand));
			}

			//Adding 
			while(singleGrid && singleGrid.length){
				
				rand = getFromArray(singleGrid);
				playerGrid[rand] = 'T';
				singleGrid  = remove(singleGrid,singleGrid.indexOf(rand));

				rand = getFromArray(singleGrid);
				playerGrid[rand] = 'S';
				singleGrid  = remove(singleGrid,singleGrid.indexOf(rand));

				rand = getFromArray(singleGrid);
				playerGrid[rand] = 'Z';
				singleGrid  = remove(singleGrid,singleGrid.indexOf(rand));
			}
			console.log(playerGrid);

	}else{
			//Add Shrine
			rand = getFromArray(leftCols);
			playerGrid[rand] = 'I';
			singleGrid  = remove(singleGrid,singleGrid.indexOf(rand));

			rand = getFromArray(rightCols);
			playerGrid[rand] = 'I';
			singleGrid  = remove(singleGrid,singleGrid.indexOf(rand));

			//Adding Obstacles
			for(i=0;i<8;i++){
				rand = getFromArray(singleGrid);
				playerGrid[rand] = 'O';
				singleGrid  = remove(singleGrid,singleGrid.indexOf(rand));
			}

			//Adding 
			while(singleGrid && singleGrid.length){
				
				rand = getFromArray(singleGrid);
				playerGrid[rand] = 'T';
				singleGrid  = remove(singleGrid,singleGrid.indexOf(rand));

				rand = getFromArray(singleGrid);
				playerGrid[rand] = 'S';
				singleGrid  = remove(singleGrid,singleGrid.indexOf(rand));

				rand = getFromArray(singleGrid);
				playerGrid[rand] = 'Z';
				singleGrid  = remove(singleGrid,singleGrid.indexOf(rand));
			}
			//console.log(playerGrid);		
	}
	console.log("Done generating Grid for a Playerrr.  -----------------------------------------------------------");
	return playerGrid;


}


function getFromArray(array){
	console.log("Printing the getFrom Array ");
	console.log(array);
	if(array){
		return  array[Math.floor(Math.random()*array.length)];	
	}
	

}


function remove(array,index){

	if (index > -1) {
    array.splice(index, 1);
    return array;
	}

}


function createGameId(){
	
	var tempId;
	var alpha = ['a','b','c','d','e','f','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
	var i = 0;

	tempId = getFromArray(alpha).toString().toUpperCase() + getFromArray(alpha).toString().toUpperCase() + getFromArray(alpha).toString().toUpperCase() + getFromArray(alpha).toString().toUpperCase();
	while(gameIdList.indexOf(tempId)>-1){
		tempId = getFromArray(alpha).toString().toUpperCase() + getFromArray(alpha).toString().toUpperCase() + getFromArray(alpha).toString().toUpperCase() + getFromArray(alpha).toString().toUpperCase();
	}
	gameIdList.push(tempId);
	lastCreatedId = tempId;
	
	console.log(tempId);
	console.log(gameIdList);
	return tempId;

}

