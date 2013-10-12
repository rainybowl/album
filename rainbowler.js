			/*** 
			*
			*	Параметры приложения: режим отображения, типы принимаемых данных и т.д.
			*
			*	@property mode {Object} - режим отображения (зависит от наличия параметров в url)
			*	@property components {Object} - ключи данных и соответствующие им шаблоны для обработки 
			*	
			*	@method checkMode - метод для проверки на наличие параметров в url и переключение режима отображения 
			*	@method init ({Object})- загрузка приложения
			*	@method addComponents - метод для задания параметров шаблонизации (свойства components)
			*
			***/
			
			var App = {
	
				mode: {
					show: 'normal',
					id: ''
				},
				
				components: {},
				
				checkMode: function(){

					var url = location.href;
					var hasParams = /.*\?mode=.*/.exec(url.toString());

					if(hasParams){
						var _mode,
						    _modeEnd;
				
						 _mode = url.slice(url.search('mode='));
						 _modeEnd = (_mode.search('&') == -1) ? _mode.length : _mode.search('&');
						 _mode = _mode.slice(5, _modeEnd);
						
						this.mode.show = _mode;

						//	if there are more params
						if(/.*\?.*=.*&.*/.exec(url.toString())){
							this.mode.id = url.substring(url.lastIndexOf('id=')+3);
						}			
					}
				
					else{
						//restore default mode
						this.mode.show = 'normal';
						this.mode.id = '';				
					}

				},
				
				addComponents: function(set){
					this.components = set;
				},
				
			
				clean: function(elem){
					elem.html('');
				},

				init: function(){

					this.checkMode();		
					this.addComponents(settings);	
				}
	
			}
			
			
			/***
			*
			*	Инструменты
			*	
			*	@method pathFinder ({String}) - возвращает узел JSON по заданному пути
			*  @method objectParser ({Object}, {String}, {String}) - возвращает объект с заданным значением свойства
			*  @method pathParser {String} - парсинг пути (проверка на наличие в пути свойств)
			*
			***/
			
			var Tools = {
				
				pathFinder: function(path){
					var path = path.split(' ');
					
					var obj = this.pathParser(path[0]);

					//console.log(obj)			

					//если не первая нода
					if(path.length > 1){
						var i = 1;
						while(i < path.length ){
								obj = obj[path[i]];
								i++;
							}	
					}
					return obj;
				},
				
				
				objectParser: function(obj, prop, val){

					var veryObj;
					
					$.each(obj, function( k, v ){
						if(obj[k][prop] == val)	
						veryObj = obj[k]
					//	return obj[k]; //change it this way!			
					})					
				
					return veryObj;
				},
				
				pathParser: function(pathStr){
						
						if(pathStr.indexOf('[') != -1) {
							var _originalPath = pathStr;
							//returns nodename (e.g. lector)
							var pathStr = pathStr.substring(0, pathStr.indexOf('['))			
							
							// returns [param, value]
							var _path = /\[.*=.*\]/.exec(	_originalPath.toString() );
							_path = _path.toString().replace(/[ \[\] ]*/g, '').split('='); 
							
							obj =  this.objectParser(  JSON.parse( storage.getItem(pathStr) ), _path[0], _path[1])	
						}
						else{
								obj = JSON.parse( storage.getItem(pathStr) ) 
							}	
							
						return obj;				
					}
					
			}
				

			/***
			* 
			* Шаблоны для обработки элементов 
			*
			* @method addTemplate ({String}) - метод для динамического добавления новых шаблонов (в разработке)
			* @method applyer ({Object}) - вызов шаблона для обработки одного элемента
			* @method applyTemplates ({String}) - обработка одного или нескольких элементов по заданному пути. Вторым и третьим параметром можно вручную задать шаблон и узел DOM-дерева, в котором будет размешен созданный HTML-код.
			*
			***/	
		
			var templates = {
			
				createContainer: function(type, params){
					var container;
					
					switch(type){
						case 'ul': 
							container = $('<ul></ul>');
							break;
						case 'ol': 
							container = $('<ol></ol>');
							break;
						case 'div': 
							container = $('<div></div>');
							break;
					}
					
					if(params.length){
						for(var i = 0; i<params.length; i++){
							container.attr(params[i], params[i])							
						}
					}

					return container;
				},
				
				li: function(id, contents){
					return $('<li id="' + id +'">' +contents + '</li>');
					},
			
				smallList: function ( data ) {
						//var list = $('<li id="' + data.details.id +'">' + data.details.name + '</li>');
			
						var list = this.li( data.details.id, data.details.name );
						
						list.click(function(){
								App.clean($('#okno'))
								// this is not very nice:
								templates.applyTemplates( 'lectors[id=' + data.details.id +']', 'lector', '#okno' );	
								templates.applyTemplates( 'lectors[id=' + data.details.id +'] all_lectures', 'smallList', '#okno ul' );						
							})
							
						return list;
		
				},
				
				largeList: function ( data ) {
					
						var _list = '<li id="' + data.details.id +'">' + data.details.name + ':   ';
						

						if(data.details.slides_url)
						_list += '<a href="' + data.details.slides_url + '" class="full_border light_block nodecor">Слайды</a>  |  ';	
						
						if(data.details.video_url)
						_list += '<a href="' + data.details.video_url + '" class="full_border light_block nodecor">Видео</a>';	
						//_list += '<a href="">Лектор - </a>';						
						
						_list += '</li>';
						
						var list = $('<div>' + _list + '</div>');
						return list;
						
				},
				
				photo: function(data){
					var photo = $('<img src="' + data + '"/>');
					return photo;
				},
				
				lector: function(data){
					
					var _lector = '<img src="' + data.details.photo_url + '"/>';
		 
					 _lector += '<span class="name">' + data.details.name + '<span>';
					 _lector += '<br/>';
					 
					 if(data.details.about)
					 _lector += '<p class="about">' + data.details.about + '</p>';
					 
					 _lector += '<div class="h15" />';
					 _lector += '<h3 class="italic stressed">Лекции:</h3>';
					 _lector += '<ul class="lec"></ul>';
					 
					 var lector = $('<div>' + _lector + '</div>');
					 return lector;
				},
				
				addTemplate: function(){	
					//dynamically add template					
				},
			
				applyer: function(params) {						
					this[params.templateName](params.data).appendTo(params.data.where);
				},

				applyTemplates: function(nodeToProcess, template, path){
					
					if(!nodeToProcess || typeof nodeToProcess !== 'string') throw new Error('Не задан путь к узлу JSON!');

					//определить, какой шаблон использовать и куда постить
				
					var _nodes = nodeToProcess.split(' ');
					
					var i = _nodes.length-1;
					var lastNode = _nodes[i]
					
					while( Number(lastNode) ){
						lastNode = _nodes[i-1];
						i--;
					}
					
					if(lastNode.indexOf('[') != -1){
						lastNode = lastNode.substring(0, lastNode.indexOf('['))
						}
		
					nodeToProcess = Tools.pathFinder(nodeToProcess);

					if (nodeToProcess[0]){ //is an array
						$.each(nodeToProcess, function( k, obj ){
								templates.applyer({
									templateName: (template) ? template : App.components[lastNode].template,
									data: {
										details: nodeToProcess[k],
										where: (path) ? path : $(App.components[lastNode].path)
									} 
								});				
						})	
					}
					else{ // a single object to process					
							templates.applyer({
								templateName: (template) ? template : App.components[lastNode].template, 
								data: {
									details: nodeToProcess,
									where: (path) ? path : $(App.components[lastNode].path)
								} 
							});				
					}
					
				} 	
				
			}
				
		
