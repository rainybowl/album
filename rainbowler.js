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
					
					templates.applyTemplates('lectures');
					templates.applyTemplates('lectors');	
					templates.applyTemplates( 'lectors 6', 'lector', '#okno' );	//явное указание шаблона-пути!
					templates.applyTemplates( 'lectors 6 all_lectures', 'smallList', '#okno ul' );	
					
					//templates.applyTemplates('lectors[id=183]');	
					
					 Tools.objectParser( JSON.parse( storage.getItem('lectors' )), 'id', 183 );
					
				}
	
			}
			
			
			/***
			*
			*	Инструменты
			*	
			*	@method pathFinder ({String}) - возвращает узел JSON по заданному пути
			*  @method objectParser ({Object}, {String}, {String}) - возвращает объект с заданным значением свойства
			*
			***/
			
			var Tools = {
				
				pathFinder: function(path){
					var path = path.split(' ');
					 
					 /* parsing test */
					 
					if(path[0].indexOf('[') != -1)  {
						path[0] = path[0].substring(0, path[0].indexOf('[')-1)
						console.log(path[0])
						}
					
					
					/* */			
					
					var obj = JSON.parse( storage.getItem(path[0]) );
					
					//добавить парсинг-выборку по свойству!
					
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
				
					var i, veryObj;
					for(i=0; i<obj.length; i++){
						var curObj = obj[i];
					
						if(curObj[prop] == val) {
						//	console.log(curObj)
							veryObj = obj;	
						}		
					}
				
					return veryObj;
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
								templates.applyTemplates( 'lectors 7', 'lector', '#okno' );	
								templates.applyTemplates( 'lectors 7 all_lectures', 'smallList', '#okno ul' );						
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
				
		
