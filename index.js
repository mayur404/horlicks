var express = require('express');
var cors = require('cors');
var pF = require('pathfinding');
var app = express();
var LOG = true;
var LOGO = true;
//Setting up WURFL
var wurfl_cloud_client = require("wurflcloud/NodeWurflCloudClient/WurflCloudClient");
var config = require("wurflcloud/NodeWurflCloudClient/Config");

var api_key = "290356:OLAdGwqJ715I8lQ9vj2UsbStDRYmoznB";
var configuration = new config.WurflCloudConfig(api_key);
//Done Setting and config

LOG && console.log("Configured Wurfl");
//Enable All Cors Requests
app.use(cors());


var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 5000;

server.listen(port,function(){
	LOG && console.log('Server listening at 5000');
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


	LOG && console.log('---------------------------------------------------------------------------');

	LOG && console.log('Player Connected');
	//When any new Player is connected to the game irrespective of the type of player;
	//creating a player object
	var tempPlayer = new Object();
	tempPlayer.id = playerIdBase+1;
	playerIdBase++;
	players.push(tempPlayer); 
	sockets.push(socket);


	//If the client creates a game
	socket.on('createGame',function(data){
		LOG && console.log("Game Created By Host");
		LOG && console.log(data.size);
		LOG && console.log('Game Created');
		var tempId = createGameId();
		//creating game object
		var game = new Object();
		game.gameId = tempId;    //DemoChanged
		//game.gameId = "DEMO";    //DemoChanged
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
				game.universal = [];
				game.colsOffset = [];
				game.submitCount = 0;
				game.pathMap = [];
				game.totalCols = 0;
				game.shrineData = [];
				game.paths = [];
				game.highlight = [];
				game.score = 0;
			}
		}
		game.playersJoined = 1;
		gameRoom.push(game);
		var currGameIndex = gameRoom.length - 1;
		//socket.emit('hostGameSetup',JSON.stringify(gameRoom[currGameIndex]));    //DemoChanged
		socket.emit('demoHostGameSetup',JSON.stringify(gameRoom[currGameIndex]));
		
	});

	//If the client wants to join an existing game
	socket.on('joinGame',function(joinGame){
		LOG && console.log('Joined Game');
		var success = 0;
		LOG && console.log(joinGame.size);
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
						//socket.emit('playerJoined',JSON.stringify(gameRoom[i]));    //DemoChanged
						socket.emit('demoPlayerJoined',JSON.stringify(gameRoom[i]));    
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

	socket.on('buildSubmited',function(build){

		//Intitalize universal grid 
		
		var gameId;
		var gameData;

		gameId = getGameId(socket);
		gameData = getGameData(gameId);

		var index = build.index;

		console.log("Build Submit Data");

		console.log(JSON.stringify(gameData));
		console.log(index);
		
		var iterator = 0;
		console.log(JSON.stringify(build.grid));
		for(var i=0; i<4; i++) {
		    for(var j=gameData.colsOffset[index]; j<gameData.colsOffset[index] + gameData.players[index].cols; j++) {
		        gameData.universal[i][j] = build.grid[iterator];
		        iterator++
		    }
		}
		gameData.submitCount ++;
		
		if(gameData.submitCount == gameData.playersJoined){
			//Execute pathfinding
			
			for(i=0;i<gameData.players.length;i++){
				sockets[gameData.players[i].id].emit('buildingBoard');
			}

			for(var i=0; i<4; i++){
			    for(var j=0; j<gameData.totalCols; j++) {
			        if(gameData.universal[i][j] == 'I' || gameData.universal[i][j] =='X'){
			        	gameData.pathMap[i][j] = 0;
			        	if(gameData.universal[i][j] == 'I'){
			        		var shrine = new Object();
			        		shrine.x = j;
			        		shrine.y = i;
			        		gameData.shrineData.push(shrine);
			        	}
			        }
			    }
			}	

			gameData.shrineData.sort(compare);
			
			
			
			for(i=0;i<gameData.shrineData.length-1;i++){
				var pathData = new Object();
				var start = new Object();
				start.x = gameData.shrineData[i].x;
				start.y = gameData.shrineData[i].y;
				var end = new Object();
				end.x = gameData.shrineData[i+1].x;
				end.y = gameData.shrineData[i+1].y;
				pathData.start = start;
				pathData.end = end;
				pathData.path = [];
				gameData.paths.push(pathData);
			}

			//Finding the Paths

			for(i=0;i<gameData.paths.length;i++){
				console.log("I am here for "+ i);
				var grid = new pF.Grid(gameData.pathMap);
				var finder = new pF.AStarFinder();
				gameData.paths[i].path = finder.findPath(gameData.paths[i].start.x, gameData.paths[i].start.y,gameData.paths[i].end.x, gameData.paths[i].end.y, grid);
				console.log("I am done for "+ i);
				console.log("Builded path for "+i+" : "+gameData.paths[i].path);
			}

			//Check if Won or Lost 
			var won = 1;
			var illuminate = new Array();
			for(i=0;i<gameData.paths.length;i++){
				if(gameData.paths[i].path.length == 0){
					won = 0;
				}else{
					for(j=0;j<gameData.paths[i].path.length;j++){
						illuminate.push(gameData.paths[i].path[j]);
						gameData.score ++;
					}
				}

			}

			if(won){
				console.log("The Path is build");
			}else{
				console.log("Failed to Build Path");
			}
			console.log("illuminate:");
			console.log(JSON.stringify(illuminate));
	
			console.log("gameData before Score");
			console.log(gameData.score);
			
			gameData.score = gameData.score * gameData.playersJoined * 10;

			console.log("Consoling Score After");
			console.log(gameData.score);

			console.log("Total Cols");
			console.log(gameData.totalCols);

			//Setting the Highlight Array
			for(i=0;i<illuminate.length;i++){
				gameData.highlight[illuminate[i][1]][illuminate[i][0]] = 1;
			}
			console.log("Higlight Array:");
			console.log(JSON.stringify(gameData.highlight));
			
			
			var playerHighlight = [];
			
			for(k=0;k<gameData.playersJoined;k++){
				iterator = 0;
				var linearHighlight = [];
				for(i=0; i<4; i++) {
				    for(j=gameData.colsOffset[k]; j<gameData.colsOffset[k] + gameData.players[k].cols; j++) {
				        //gameData.universal[i][j] = build.grid[iterator];
				        linearHighlight[iterator] = gameData.highlight[i][j];
				        iterator++
				    }
				}
				playerHighlight.push(linearHighlight);
			}

			

			console.log("/n/nIndividual Higlight:");
			console.log(JSON.stringify(playerHighlight));
			console.log("/n/nAll Set to Roll");

			updateGameData(gameData,gameId);

			console.log(JSON.stringify(gameData.universal));
			console.log(JSON.stringify(gameData.pathMap));
			console.log(JSON.stringify(gameData.shrineData));
			console.log(JSON.stringify(gameData.paths));
			for(i=0;i<gameData.players.length;i++){
				var gameEnd = new Object();
				gameEnd.won = won;
				gameEnd.highlight = playerHighlight[i];
				gameEnd.gameData = gameData;
				sockets[gameData.players[i].id].emit('highlight',gameEnd);
			}

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
		LOG && console.log(gameData);
		for(i=0;i<gameData.players.length;i++){
				sockets[gameData.players[i].id].emit('updateGlobalStatus',gameData);
		}


	});

	socket.on('replay',function(){

		var gameId;
		var gameData;
		var tempPlayers;
		
		gameId = getGameId(socket);
		gameData = getGameData(gameId);
		LOG && console.log(gameData);
		for(i=0;i<gameData.players.length;i++){
				sockets[gameData.players[i].id].emit('replayFromServer');
		}


	});

	socket.on('alignScreens',function(){

		var gameId;
		var gameData;
		var tempPlayers;
		
		gameId = getGameId(socket);
		gameData = getGameData(gameId);
		LOG && console.log(gameData);
		for(i=0;i<gameData.players.length;i++){
				sockets[gameData.players[i].id].emit('alignScreens',gameData.players[i].index);
		}

	});

	socket.on('transferMelk',function(transferData){

		console.log("Transfer Data ******************************************");

		var gameId;
		var gameData;
		var tempPlayers;
		console.log(JSON.stringify(transferData));
		gameId = getGameId(socket);
		gameData = getGameData(gameId);

		for(i=0;i<gameData.players.length;i++){
				if(gameData.players[i].index == transferData.to){
					sockets[gameData.players[i].id].emit('transferMelk',transferData);
				}
				
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
		//LOG && console.log(gameData);

		for(i=0;i<n;i++){
			heights.push(parseInt(gameData.players[i].size.height));
		}
		//LOG && console.log(heights);

		min = Math.min.apply(Math, heights);
		LOG && console.log(min);

		smallestI = heights.indexOf(min);
		//LOG && console.log(smallestI);

		minHeight = gameData.players[smallestI].size.height;
		minWidth = gameData.players[smallestI].size.width;

		boardHeight = minWidth;

		gameData.boardHeight = boardHeight;
		gameData.tileSize = boardHeight/5;

		//LOG && console.log(gameData);

		boardParams = new Object();
		boardParams.boardHeight = boardHeight;
		boardParams.ratio = gameData.players[smallestI].size.ratio;
		
		basePlayerIndex = smallestI;

		tileSize = boardHeight/5;

		for(i=0;i<gameData.players.length;i++){
			if(i==basePlayerIndex){
				gameData.players[i].tileSize = tileSize;
				gameData.players[i].cols = 5;
				//LOG && console.log(gameData.players[i].size.height);
				//LOG && console.log(gameData.players[i].size.width);
			}else{
				tileSize =boardHeight/5;
				width = gameData.players[i].size.width;
				//LOG && console.log('width: '+ width);
				tempCol = Math.floor(width/tileSize);
				//LOG && console.log('tempCol: '+tempCol);
				remainder = width - (tempCol*tileSize);
				//LOG && console.log('remainder: '+remainder);
				extra = remainder/tempCol;
				tileSize = tileSize + extra;
				//LOG && console.log('tileSize: '+tileSize);
				gameData.players[i].tileSize = tileSize;
				gameData.players[i].cols = tempCol;
			}
		}

		updateGameData(gameData,gameId);
		gameData = getGameData(gameId);

		for(z=0;z<gameData.players.length;z++){
			n = gameData.players[z].cols * 4;
			index = z;
			//LOG && console.log(generateGrid(n , index , gameData.players.length - 1,gameData.players[z].size.userAgent));
			gameData.players[z].gameLinearGrid = generateGrid(n , index , gameData.players.length - 1,gameData.players[z].size.userAgent);

			//Done till here 
			//Now the gameLinearGrid has all the linear values of the different players now just convert this linear values to proper matrix
			//Send the players Linear Values itself
		}
		
		updateGameData(gameData,gameId);
		gameData = getGameData(gameId);


		LOG && console.log("List of generated grids -----------------------------");
		for(i=0;i<gameData.players.length;i++){
			var boardData = new Object();
			boardParams.boardHeight = boardHeight;
			boardParams.size = gameData.players[i].size;
			boardParams.playerId = gameData.players[i].id;
			boardParams.tileSize = gameData.players[i].tileSize;
			boardParams.cols = gameData.players[i].cols; 
			boardParams.linearGrid = gameData.players[i].gameLinearGrid;
			LOG && console.log(boardParams);
			sockets[gameData.players[i].id].emit('drawBoard',boardParams);
		}

	});
	
	//DemoChanged

	socket.on('execute',function(){
		var gameId;
		var gameData;
		var n;

		gameId = getGameId(socket);
		gameData = getGameData(gameId);

		var heights =  new Array();
		var widths =  new Array();
		var ratios = new Array();
		n = gameData.playersJoined;
		//LOG && console.log(gameData);

		for(i=0;i<n;i++){
			heights.push(parseInt(gameData.players[i].size.pHeight));
			widths.push(parseInt(gameData.players[i].size.pWidth));
		}
		//LOG && console.log(heights);
		LOGO && console.log(JSON.stringify(heights));
		LOGO && console.log(JSON.stringify(widths));

		min = Math.min.apply(null,heights);
		max = Math.max.apply(null,heights);

		minW = Math.min.apply(null,widths);
		maxW = Math.max.apply(null,widths);
		
		total = 0;
		backRatio = 3583/1299;
		for(i=0;i<n;i++){
			total = total + widths[i];
		}

		panRatio = total/max;

		backHeight = max;
		backWidth = backHeight*backRatio;

		backData = new Object();
		backData.height = backHeight;
		backData.width = backWidth;
		backData.widths = widths;
		backData.n = n;

		//Consoling Background Data
		LOGO && console.log("-------------------------------------");
		LOGO && console.log("min max heights: " + min + '/' + max );
		LOGO && console.log("min max widths: " + minW + '/' + maxW );
		LOGO && console.log("no of screens: " + n)
		LOGO && console.log("back h w: " + backHeight+' '+backWidth);
		LOGO && console.log("-------------------------------------");
		//End Console

		LOG && console.log(min);

		smallestI = heights.indexOf(min);
		//LOG && console.log(smallestI);

		minHeight = gameData.players[smallestI].size.pHeight;
		minWidth = gameData.players[smallestI].size.pWidth;

		boardHeight = minWidth;

		gameData.boardHeight = boardHeight;
		gameData.tileSize = boardHeight/4;

		//LOG && console.log(gameData);

		boardParams = new Object();
		boardParams.boardHeight = boardHeight;
		boardParams.ratio = gameData.players[smallestI].size.ratio;
		
		basePlayerIndex = smallestI;

		tileSize = boardHeight/4;

		for(i=0;i<gameData.players.length;i++){
			if(i==basePlayerIndex){
				gameData.players[i].tileSize = tileSize;
				gameData.players[i].cols = 4;
				//LOG && console.log(gameData.players[i].size.height);
				//LOG && console.log(gameData.players[i].size.width);
			}else{
				tileSize =boardHeight/4;
				width = gameData.players[i].size.pWidth;
				//LOG && console.log('width: '+ width);
				tempCol = Math.floor(width/tileSize);
				//LOG && console.log('tempCol: '+tempCol);
				remainder = width - (tempCol*tileSize);
				//LOG && console.log('remainder: '+remainder);
				extra = remainder/tempCol;
				tileSize = tileSize + extra;
				//LOG && console.log('tileSize: '+tileSize);
				gameData.players[i].tileSize = tileSize;
				gameData.players[i].cols = tempCol;
			}
		}

		updateGameData(gameData,gameId);
		gameData = getGameData(gameId);

		for(z=0;z<gameData.players.length;z++){
			n = gameData.players[z].cols * 4;
			index = z;
			//LOG && console.log(generateGrid(n , index , gameData.players.length - 1,gameData.players[z].size.userAgent));
			gameData.players[z].gameLinearGrid = generateGrid(n , index , gameData.players.length - 1,gameData.players[z].size.userAgent);

			//Done till here 
			//Now the gameLinearGrid has all the linear values of the different players now just convert this linear values to proper matrix
			//Send the players Linear Values itself
		}
		
		updateGameData(gameData,gameId);
		gameData = getGameData(gameId);

		//Inititialize grid
		totalCols = 0;
		for(i=0;i<gameData.players.length;i++){
			gameData.colsOffset.push(totalCols);	
			totalCols = totalCols + gameData.players[i].cols;
		}
		gameData.totalCols = totalCols;

		for(var i=0; i<4; i++) {
		    gameData.universal[i] = [];
		    gameData.pathMap[i] = [];
		    gameData.highlight[i] = [];
		    for(var j=0; j<totalCols; j++) {
		        gameData.universal[i][j] = null;
		        gameData.pathMap[i][j] = 1;
		        gameData.highlight[i][j] = 0;
		    }
		}
		updateGameData(gameData,gameId);
		console.log(JSON.stringify(gameData.universal));

		//Done initialize

		LOG && console.log("List of generated grids -----------------------------");
		for(i=0;i<gameData.players.length;i++){
			var boardData = new Object();
			boardParams.boardHeight = boardHeight;
			boardParams.size = gameData.players[i].size;
			boardParams.playerId = gameData.players[i].id;
			boardParams.tileSize = gameData.players[i].tileSize;
			boardParams.cols = gameData.players[i].cols; 
			boardParams.pWidth = gameData.players[i].size.pWidth; 
			boardParams.pHeight = gameData.players[i].size.pHeight; 
			boardParams.linearGrid = gameData.players[i].gameLinearGrid;
			backData.index = gameData.players[i].index - 1;
			boardParams.backData = backData;
			boardParams.clan = gameData.players[i].clan;
			LOG && console.log(boardParams);
			sockets[gameData.players[i].id].emit('demoDrawBoard',boardParams);
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
		LOG && console.log(gameRoom);
		socket.emit('endGame');
	});	

	socket.on('log',function(message){
		LOGO && console.log("From Client ``````````````````````````");		
		LOGO && console.log(message);

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
		LOG && console.log(gameData.ready);
		if(gameData.ready == gameData.playersJoined){
			//Start Game;
			LOG && console.log("Start The Game");
			for(j=0;j<gameData.players.length;j++){
				sockets[gameData.players[j].id].emit('showMoto');
			}
		}

	});	

	socket.on("requestDeviceData",function(){
		
		//Started the rqeuest Device 
		var HttpRequest = socket.request;
		var HttpResponse = socket.response;
		LOG && console.log("Started The Request function");
		var brand,model,pwidth,pheight,density;
		var result_capabilities = {};
		var device = new Object();
		//console.log("Request ---------------------------------");
		//console.log(HttpRequest)
		//console.log("Response ---------------------------------");
		//console.log(HttpResponse)
		var WURFLCloudClientObject = new wurfl_cloud_client.WurflCloudClient(configuration, HttpRequest, HttpResponse);
		//Getting the Physical Width
		WURFLCloudClientObject.detectDevice(HttpRequest, null, function(err, result_capabilities){
			LOG && console.log("Done setting up the inner function")
		    WURFLCloudClientObject.getDeviceCapability('physical_screen_width', function(error, pwidth){
		        if(error!=null){
		        	LOG && console.log("Errr from Width");
		            LOG && console.log('Error' + error);
		            device.pwidth = null;
		            LOG && console.log("Null set from Width");
		        }else{
		        	LOG && console.log("Printing The Width");
		            LOG && console.log('Physical width: ' + pwidth);
		            device.pwidth = pwidth;

		            //Getting the height using the nested Function Call
		            LOG && console.log("Now going for HEight");
		            WURFLCloudClientObject.getDeviceCapability('physical_screen_height', function(error, pheight){
				        if(error!=null){
				            LOG && console.log('Error' + error);
				            device.pheight = null;
				        }else{
				        	LOG && console.log("Printing The Height");
				            LOG && console.log('Physical height: ' + pheight);
				            device.pheight = pheight;
				            LOG && console.log("Sending this data to the client:" + device);
				            LOG && console.log(device);
				            socket.emit('deviceData',device);
				        }
		    		});

		        }
		    });
		});  
	})


//io Functions end here
});


/*function requestDeviceData(socket){

		//Started the rqeuest Device Dhabha
		var HttpRequest = socket.request;
		var HttpResponse = socket.response;
		LOG && console.log("Started The Request function");
		var brand,model,pwidth,pheight,density;
		var result_capabilities = {};
		var device = new Object();
		var WURFLCloudClientObject = new wurfl_cloud_client.WurflCloudClient(configuration, HttpRequest, HttpResponse);
		//Getting the Physical Width
		WURFLCloudClientObject.detectDevice(HttpRequest, null, function(err, result_capabilities){
			LOG && console.log("Done setting up the inner function")
		    WURFLCloudClientObject.getDeviceCapability('physical_screen_width', function(error, pwidth){
		        if(error!=null){
		        	LOG && console.log("Errr from Width");
		            LOG && console.log('Error' + error);
		            device.pwidth = null;
		            LOG && console.log("Null set from Width");
		        }else{
		        	LOG && console.log("Printing The Width");
		            LOG && console.log('Physical width: ' + pwidth);
		            device.pwidth = pwidth;

		            //Getting the height using the nested Function Call
		            LOG && console.log("Now going for HEight");
		            WURFLCloudClientObject.getDeviceCapability('physical_screen_height', function(error, pheight){
				        if(error!=null){
				            LOG && console.log('Error' + error);
				            device.pheight = null;
				        }else{
				        	LOG && console.log("Printing The Height");
				            LOG && console.log('Physical height: ' + pheight);
				            device.pheight = pheight;
				            LOG && console.log("Sending this data to the client:" + device);
				            LOG && console.log(device);
				            socket.emit('deviceData',device);
				        }
		    		});

		        }
		    });
		});  
 
		
 		//Getting the Brand Name
		/*WURFLCloudClientObject.detectDevice(HttpRequest, null, function(err, result_capabilities){
		    WURFLCloudClientObject.getDeviceCapability('brand_name', function(error, brand){
		        if(error!=null){
		            LOG && console.log('Error' + error);
		            device.brand = null;
		        }else{
		        	LOG && console.log("Printing");
		            LOG && console.log('Brand name: ' + brand);
		            device.brand = brand;
		        }
		    });
		});  

		//Getting the Model
		WURFLCloudClientObject.detectDevice(HttpRequest, null, function(err, result_capabilities){
		    WURFLCloudClientObject.getDeviceCapability('model_name', function(error, model){
		        if(error!=null){
		            LOG && console.log('Error' + error);
		             device.model = null;
		        }else{
		        	LOG && console.log("Printing");
		            LOG && console.log('Model name: ' + model);
		            device.model = model;
		        }
		    });
		});  */

		//Getting the Density Class
		/*WURFLCloudClientObject.detectDevice(HttpRequest, null, function(err, result_capabilities){
		    WURFLCloudClientObject.getDeviceCapability('density_class', function(error, density){
		        if(error!=null){
		            LOG && console.log('Error' + error);
		            device.density = null;
		        }else{
		            LOG && console.log('Density class: ' + density);
		            device.density = density;
		        }
		    });
		});  

		

}*/

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


	//LOG && console.log("Generating Grid for .........................................................................");
	//LOG && console.log(userAgent);
	var cols = n/4;
	var singleGrid = new Array();
	
	for(i=0;i<n;i++){
		singleGrid.push(i);
	}
	//LOGO && console.log("Printing Single Grid");
	//LOGO && console.log(singleGrid);
	
	var leftCols = new Array();

	for(i=0;i<4;i++){
		leftCols.push(i*cols);
		leftCols.push(i*cols + 1);
		if(cols>4){
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
	//LOGO && console.log(leftCols);

	var rightCols = new Array();

	for(i=0;i<4;i++){
		if(cols>12){
			rightCols.push(i*cols + cols - 6);
		}
		if(cols>10){
			rightCols.push(i*cols + cols - 5);
		}
		if(cols>7){
			rightCols.push(i*cols + cols - 4);
		}
		if(cols>4){
			rightCols.push(i*cols + cols - 2);
		}
		rightCols.push(i*cols + cols - 2);
		rightCols.push(i*cols + cols - 1);
		
	}
	//LOGO && console.log(rightCols);

	var playerGrid = new Array();
	playerGrid.length = singleGrid.length;

	if(cols <= 4){			//Mobile Devices
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
			LOG && console.log(playerGrid);

						
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
			//LOG && console.log(playerGrid);


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
			//LOG && console.log(playerGrid);

		}
	}else if(cols>4 && cols <=7){			//Iphone and Small Tabs
		//LOG && console.log("Mid Device");
		//LOG && console.log(leftCols);
		//LOG && console.log(rightCols);
		//LOG && console.log(singleGrid);
		if(index==0){	//first Device

			//Add Shrine
			LOG && console.log("First Device");
			rand = getFromArray(leftCols);
			playerGrid[rand] = 'I';
			singleGrid  = remove(singleGrid,singleGrid.indexOf(rand));
			//LOG && console.log("Removed");
			//Adding Obstacles
			for(i=0;i<2;i++){
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
			//LOG && console.log(playerGrid);

						
		}else if(i==l){	//last Device
			//Add Shrine
			LOG && console.log("Last Device");
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
				if(singleGrid){
					singleGrid  = remove(singleGrid,singleGrid.indexOf(rand));	
				}
				
			}
			//LOG && console.log(playerGrid);


		}else{		//middle Device

			//Add Shrine
			//LOG && console.log("Middle Device and Printing Grid");
			//LOG && console.log(singleGrid);
			rand = getFromArray(singleGrid);
			playerGrid[rand] = 'I';
			singleGrid  = remove(singleGrid,singleGrid.indexOf(rand));

			//Adding Obstacles
			for(i=0;i<3;i++){
				rand = getFromArray(singleGrid);
				playerGrid[rand] = 'O';
				singleGrid  = remove(singleGrid,singleGrid.indexOf(rand));
			}
			//LOG && console.log(singleGrid);
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
				if(singleGrid){
					singleGrid  = remove(singleGrid,singleGrid.indexOf(rand));	
				}
				
			}
			//LOG && console.log(playerGrid);

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
			//LOG && console.log(playerGrid);

						
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
			//LOG && console.log(playerGrid);

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
			//LOG && console.log(playerGrid);		
	}
	//LOG && console.log("Done generating Grid for a Playerrr.  -----------------------------------------------------------");
	return playerGrid;


}


function getFromArray(array){
	LOG && console.log("Printing the getFrom Array ");
	LOG && console.log(array);
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
	
	LOG && console.log(tempId);
	LOG && console.log(gameIdList);
	return tempId;

}

function compare(a,b) {
  if (a.x < b.x)
     return -1;
  if (a.x > b.x)
    return 1;
  return 0;
}


