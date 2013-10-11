			/* Параметры приложения: режим отображения, категории входных данных и т.д.
			
				@property mode - режим отображения (зависит от наличия параметров в url)
				@property components - ключи данных и соответствующие им шаблоны для обработки 
				
				@method checkMode - метод для проверки на наличие параметров в url и переключение режима отображения 
				@method init - загрузка приложения
				@method addComponents - метод для задания параметров шаблонизации (свойства components)
			
			 */
			
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
					templates.applyTemplates( 'lectors 6 all_lectures' );	
				},
				
				reload: function(){
					this.clean();
					//+ reload with params
				}
			}
			
			
			/* Инструменты
				
				@method pathFinder - возвращает узел JSON по пути
			
			*/
			
			var Tools = {
				/*
				pathFinder: function(path){
					var path = path.split(' ')
					var obj = JSON.parse( storage.getItem(path[0]) );
					
					//добавить парсинг-выборку по свойству!
					
					//если не первая нода
					if(path.length > 1){
						var i = 1;
						while(i < path.length ){
								//obj = ( Number(path[i])) ? obj[i-1] : obj[path[i]];
								obj = obj[path[i]];
								i++;
							}	
					}
					return obj;
				} 
				*/
				
				pathFinder: function(path){
					var path = path.split(' ')
					var obj = JSON.parse( storage.getItem(path[0]) );
					
					//добавить парсинг-выборку по свойству!
					
					//если не первая нода
					if(path.length > 1){
						var i = 1;
						while(i < path.length ){
								//obj = ( Number(path[i])) ? obj[i-1] : obj[path[i]];
								obj = obj[path[i]];
								i++;
							}	
					}
					return obj;
				}
			}

			/* Шаблоны для обработки элементов */	
		
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
			
				smallList: function ( data ) {
						var list = $('<li id="' + data.details.id + '"><a href="' + data.details.slides_url + '" contenteditable="true">' + data.details.name + '</a></li>');
						return list;
				},
				
				photo: function(data){
					var photo = $('<img src="' + data + '"/>');
					return photo;
				},
				
				lector: function(data){
					
					var _lector = '<img src="' + data.details.photo_url + '"/>';
		 
					 _lector += '<span class="italic">' + 'ФИО: ' + '</span>';
					 _lector += '<span class="name">' + data.details.name + '<span>';
					 _lector += '<br/>';
					 
					 if(data.details.about)
					 _lector += '<p>' + data.details.about + '</p>';
					 
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
				
		
