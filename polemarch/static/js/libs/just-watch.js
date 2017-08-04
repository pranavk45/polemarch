
/*
 * https://github.com/Levhav/justReactive
 * Adding reactive to string templates engine.
 *
 * Apache License 2.0
 *
 * @author Trapenok Victor (Трапенок Виктор Викторович) Levhav@yandex.com
 * I will be glad to new orders for the development of something.
 *
 * Levhav@yandex.com
 * Skype:Levhav
 * 89244269357
 */
var justReactive = {

    /**
     * Вырезает html код
     */
    justStrip:function(html)
    {
       var tmp = document.createElement("DIV");
       tmp.innerHTML = html;
       return tmp.textContent || tmp.innerText || "";
    },

    addMethod:function(setter, prop, method)
    {
        Object.defineProperty(this[prop], method, {
                enumerable: false
              , configurable: true
              , writable: true
              , value: function(){
                  //console.log("watch method", method, arguments);
                  Array.prototype[method].apply(this, arguments);
                  setter.apply(this,["__justReactive_update"]);
                  return this;
              }
        });
    },

    _just_Id:0,

    /*
     * Методы массивов применяем для реактивности массива
     */
    methods:['pop',
        'push',
        'reduce',
        'reduceRight',
        'reverse',
        'shift',
        'slice',
        'some',
        'sort',
        'splice',
        'unshift',
        'unshift'
    ],
    megreFunc:function(obj, prop, newval, level)
    {
        if(!level)
        {
            level = 0;
        }
        
        var res = Object.getOwnPropertyDescriptor(obj, prop);
        if(!res)
        {
            obj[prop] = newval;
            obj.justWatch(prop);
        }
        
        if(res.hasOwnProperty('get') || res.hasOwnProperty('set'))
        {
            obj[prop] = newval;
            return;
        }
        
        if(typeof obj[prop] != "object" || obj[prop] == null)
        {
            obj[prop] = newval;
            obj.justWatch(prop);
            return;
        }

        var v1arr = {}
        for(var i in obj[prop])
        {
            v1arr[i] = false;
        }

        for(var i in newval)
        {
            v1arr[i] = true;

            if(typeof newval[i] == "object" && newval[i] != null)
            {
                if(level < 100)
                {
                    justReactive.megreFunc(obj[prop], i, newval[i], level+1);
                }
                obj[prop].justWatch(i);
            }
            else
            {
                obj[prop][i] = newval[i];
                obj[prop].justWatch(i);
            }
        }

        for(var i in v1arr)
        {
            if(!v1arr[i])
            {
                delete obj[prop][i];
            }
        }
    },
    applyFunc:function(val, newval)
    {
        //console.log("setter", newval);
        for(var i in newval.just_ids)
        {
            if(newval.just_ids[i].type == 'innerHTML')
            {
                // innerHTML - вставить без обработки на страницу.
                var el = document.getElementById("_justReactive"+newval.just_ids[i].id)
                if(el) el.innerHTML = newval.just_ids[i].callBack(val, newval.just_ids[i].customData)
            }
            else if(newval.just_ids[i].type == 'textContent')
            {
                // textContent - вставить с вырезанием html кода на страницу.
                var el = document.getElementById("_justReactive"+newval.just_ids[i].id)
                if(el) el.textContent = newval.just_ids[i].callBack(val, newval.just_ids[i].customData)
            }
            else if(newval.just_ids[i].type == 'class')
            {
                // class - вставить класс на страницу.
                var el = document.getElementsByClassName("just-watch-class-"+newval.just_ids[i].id)
                if(el && el.length)
                {
                    var valT = newval.just_ids[i].callBack(val, newval.just_ids[i].customData)
                    //console.log("class", valT)
                    for(var j = 0; j < el.length; j++)
                    {
                        if(!valT)
                        {
                            el[j].className = el[j].className
                                .replace(new RegExp("^"+newval.just_ids[i].className+"$","g"), "")
                                .replace(new RegExp(" +"+newval.just_ids[i].className+" +","g"), " ")
                                .replace(new RegExp(" +"+newval.just_ids[i].className+"$","g"), "")
                                .replace(new RegExp("^"+newval.just_ids[i].className+" +","g"), " ")
                        }
                        else
                        {
                            el[j].className = el[j].className
                                .replace(new RegExp("^"+newval.just_ids[i].className+"$","g"), "")
                                .replace(new RegExp(" +"+newval.just_ids[i].className+" +","g"), " ")
                                .replace(new RegExp(" "+newval.just_ids[i].className+"$","g"), "")
                                .replace(new RegExp("^"+newval.just_ids[i].className+" +","g"), " ")
                                + " " + newval.just_ids[i].className
                        }
                    }
                }
            }
            else if(newval.just_ids[i].type == 'notClass')
            {
                // class - вставить класс на страницу.
                var el = document.getElementsByClassName("just-watch-class-"+newval.just_ids[i].id)
                if(el && el.length)
                {
                    var valT = newval.just_ids[i].callBack(val, newval.just_ids[i].customData)
                    //console.log("class", valT)
                    for(var j = 0; j < el.length; j++)
                    {
                        if(valT)
                        {
                            el[j].className = el[j].className
                                .replace(new RegExp("^"+newval.just_ids[i].className+"$","g"), "")
                                .replace(new RegExp(" +"+newval.just_ids[i].className+" +","g"), " ")
                                .replace(new RegExp(" +"+newval.just_ids[i].className+"$","g"), "")
                                .replace(new RegExp("^"+newval.just_ids[i].className+" +","g"), "")
                        }
                        else
                        {
                            el[j].className = el[j].className
                                .replace(new RegExp("^"+newval.just_ids[i].className+"$","g"), "")
                                .replace(new RegExp(" +"+newval.just_ids[i].className+" +","g"), " ")
                                .replace(new RegExp(" "+newval.just_ids[i].className+"$","g"), "")
                                .replace(new RegExp("^"+newval.just_ids[i].className+" +","g"), " ")
                                + " " + newval.just_ids[i].className
                        }
                    }
                }
            }
            else if(newval.just_ids[i].type == 'className')
            {
                // className - вставить класс на страницу.
                var el = document.getElementsByClassName("just-watch-class-"+newval.just_ids[i].id)
                if(el && el.length)
                {
                    var valT = newval.just_ids[i].callBack(val, newval.just_ids[i].customData)
                    //console.log("className", valT)
                    for(var j = 0; j < el.length; j++)
                    {
                        var oldValuematch = el[j].className.match(/just-old-val-([^ "']*)/)

                        var newClassValue = el[j].className;
                        if(oldValuematch && oldValuematch[0])
                        {
                            newClassValue = newClassValue
                                // Удаляем мета класс с инфой о прошлом значении нашего класса
                                .replace(new RegExp("^"+oldValuematch[0]+"$","g"), "")
                                .replace(new RegExp(" +"+oldValuematch[0]+" +","g"), " ")
                                .replace(new RegExp(" "+oldValuematch[0]+"$","g"), "")
                                .replace(new RegExp("^"+oldValuematch[0]+" +","g"), " ")
                                // Удаляем класс прошлого значения нашего класса
                                .replace(new RegExp("^"+oldValuematch[1]+"$","g"), "")
                                .replace(new RegExp(" +"+oldValuematch[1]+" +","g"), " ")
                                .replace(new RegExp(" "+oldValuematch[1]+"$","g"), "")
                                .replace(new RegExp("^"+oldValuematch[1]+" +","g"), " ")
                        }
                        else
                        {
                            // Удаляем мета класс с инфой о прошлом значении нашего класса
                            newClassValue = newClassValue
                                .replace(new RegExp("^just-old-val-$","g"), "")
                                .replace(new RegExp(" +just-old-val- +","g"), " ")
                                .replace(new RegExp(" just-old-val-$","g"), "")
                                .replace(new RegExp("^just-old-val- +","g"), " ")
                        }

                        el[j].className = newClassValue + " " + valT + " just-old-val-" + valT
                    }
                }
            }
            else if(newval.just_ids[i].type == 'attr')
            {
                // class - вставить атрибут на страницу.
                var el = document.querySelectorAll("[data-just-watch-"+newval.just_ids[i].id+"]");
                if(el && el.length)
                {
                    var attrVal = newval.just_ids[i].callBack(val, newval.just_ids[i].customData)
                    for(var j = 0; j < el.length; j++)
                    {
                        if(attrVal)
                        {
                            el[j].setAttribute(newval.just_ids[i].attrName, attrVal);
                        }
                        else
                        {
                            el[j].removeAttribute(newval.just_ids[i].attrName);
                        }
                    }
                }
            }
        }
    },
    defaultcallBack:function(val){ return val;},
    setValue:function (opt)
    {
        /*
         * Методы массивов применяем для реактивности массива
         */
        justReactive._just_Id++;
        var id = justReactive._just_Id;

        if(!opt.callBack)
        {
            opt.callBack = justReactive.defaultcallBack
        }
        
        var oldValue = this[opt.prop]

        // Проверка того нетули уже наблюдения за этим объектом
        // Так как если уже стоит сеттер от just-watch то после присвоения
        // строки __justReactive_test в объект через сетор значение объекта не поменяется.
        this[opt.prop] = "__justReactive_test";

        if( this[opt.prop] === "__justReactive_test")
        {
            // Значение поменялось на __justReactive_test значит нашего
            //  сетора небыло и надо его поставить.
            this[opt.prop] = oldValue
            var newval = {
                val:oldValue,
                just_ids:[
                    {
                        id:id, 
                        callBack:opt.callBack,
                        type:opt.type, 
                        className:opt.className, 
                        attrName:opt.attrName,
                        customData:opt.customData
                    }
                ],
            }

            // Удаляем оригинальное значение
            if (delete this[opt.prop])
            {
                // сетор
                var setter = function (val)
                {
                    if(val === "__justReactive_test")
                    {
                        // Тест сетора - значение не меняем.
                        return val;
                    }

                    if(val && val.__add_justHtml_test === "__justReactive_test")
                    {
                        if(val.type == "watch")
                        {
                            return val;
                        }

                        // Добавление точки отслеживания, значение не меняем.
                        //console.log("setter add", newval);
                        newval.just_ids.push({
                            id:val.id,
                            attrName:val.attrName,
                            callBack:val.callBack,
                            className:val.className,
                            customData:val.customData,
                            type:val.type
                        })
                        return val;
                    }

                    //if(newval.timeoutId)
                    //{
                    //    clearTimeout(newval.timeoutId)
                    //}

                    if(val === "__justReactive_update")
                    {
                        // Обновление объекта внешними средсвами, значение не меняем
                        // Но вызовем все колбеки
                        // Используется на пример для обновления массивов через их методы.
                    }
                    else
                    {
                        //newval.val = val;
                        justReactive.megreFunc(newval, 'val', val);

                        if(Array.isArray(val))
                        {
                            for(var i in justReactive.methods)
                            {
                                justReactive.addMethod.apply(this, [setter, opt.prop, justReactive.methods[i]])
                            }
                        }
                    }

                    // Обновляем значения в DOM не сразу а с задержкой в 10мс
                    // для того чтоб если они ещё раз изменятся за менее чем
                    // 10мс не дёргать DOM в целях оптимизации
                    // newval.timeoutId = setTimeout(justReactive.applyFunc, 10, val, newval)

                    justReactive.applyFunc(val, newval)
                    return val;
                }

                // Вписываем свои гетер и сетор
                Object.defineProperty(this, opt.prop, {
                          get: function (){
                                    return newval.val;
                               }
                        , set: setter
                        , enumerable: true
                        , configurable: true
                });

                if(Array.isArray(newval.val))
                {
                    for(var i in justReactive.methods)
                    {
                        justReactive.addMethod.apply(this, [setter, opt.prop, justReactive.methods[i]])
                    }
                }
            }
        }
        else
        {
            // Значение не поменялось на __justReactive_test значит сетер есть
            // И мы просто впишем в него новую точку отслеживания
            this[opt.prop] = {
                __add_justHtml_test:"__justReactive_test",
                id:id,
                type:opt.type,
                callBack:opt.callBack,
                attrName:opt.attrName,
                className:opt.className,
                customData:opt.customData
            }
        }

        // Вернём в ответ код который надо вставить в шаблон
        if(opt.type == 'innerHTML')
        {
            return "<div id='_justReactive"+id+"' class='just-watch just-watch-html' style='display: inline;' >"+opt.callBack(this[opt.prop], opt.customData)+"</div>";
        }
        else if(opt.type == 'textContent')
        {
            return "<div id='_justReactive"+id+"' style='display: inline;' class='just-watch just-watch-text' >"+justReactive.justStrip(opt.callBack(this[opt.prop], opt.customData))+"</div>";
        }
        else if(opt.type == 'class')
        {
            var val = opt.callBack(this[opt.prop], opt.customData)
            if(val)
            {
                return " just-watch just-watch-class just-watch-class-"+id+" "+justReactive.justStrip(opt.className)+" ";
            }
            else
            {
                return " just-watch just-watch-class just-watch-class-"+id+" ";
            }
        }
        else if(opt.type == 'notClass')
        {
            var val = opt.callBack(this[opt.prop], opt.customData)
            if(!val)
            {
                return " just-watch just-watch-class just-watch-class-"+id+" "+justReactive.justStrip(opt.className)+" ";
            }
            else
            {
                return " just-watch just-watch-class just-watch-class-"+id+" ";
            }
        }
        else if(opt.type == 'className')
        {
            var val = justReactive.justStrip(opt.callBack(this[opt.prop], opt.customData))
            return " just-watch just-watch-class just-watch-class-"+id+" just-old-val-"+val+" "+val;
        }
        else if(opt.type == 'attr')
        {
            var val = opt.callBack(this[opt.prop], opt.customData)
            if(val)
            {
                return " data-just-watch-"+id+" "+opt.attrName+"=\""+ justReactive.justStrip(val).replace(/\"/g, "\\\"") +"\"";
            }
            else
            {
                return " data-just-watch-"+id+" ";
            }
        }

        return opt.callBack(this[opt.prop], opt.customData)
    }

}

// Проставляет html код значения
Object.defineProperty(Object.prototype, "justHtml", {
    enumerable: false
  , configurable: true
  , writable: false
  , value: function(prop, callBack, customData){ return justReactive.setValue.apply(this, [{type:'innerHTML', prop:prop, callBack:callBack, customData:customData}])
  }
});

// Проставляет text значения
Object.defineProperty(Object.prototype, "justText", {
    enumerable: false
  , configurable: true
  , writable: false
  , value: function(prop, callBack, customData){ return justReactive.setValue.apply(this, [{type:'textContent', prop:prop, callBack:callBack, customData:customData}])}
});

// Проставляет css class
Object.defineProperty(Object.prototype, "justClass", {
    enumerable: false
  , configurable: true
  , writable: false
  , value: function(prop, className, callBack, customData)
    {
        return justReactive.setValue.apply(this, [{
                type:'class',
                prop:prop,
                className:className,
                callBack:callBack,
                customData:customData
            }])
    }
});


// Проставляет css class
Object.defineProperty(Object.prototype, "justNotClass", {
    enumerable: false
  , configurable: true
  , writable: false
  , value: function(prop, className, callBack, customData)
    {
        return justReactive.setValue.apply(this, [{
                type:'notClass',
                prop:prop,
                className:className,
                callBack:callBack,
                customData:customData
            }])
    }
});

/**
 * Проставляет значение как css class
 * @example <%- pmHistory.model.items[item_id].justClassName('status', function(v){ return "history-status-"+v}) %>
 */
Object.defineProperty(Object.prototype, "justClassName", {
    enumerable: false
  , configurable: true
  , writable: false
  , value: function(prop, callBack, customData)
    {
        return justReactive.setValue.apply(this, [{
                type:'className',
                prop:prop,
                callBack:callBack,
                customData:customData
            }])
    }
});

// Проставляет атрибут
Object.defineProperty(Object.prototype, "justAttr", {
    enumerable: false
  , configurable: true
  , writable: false
  , value: function(prop, attrName, callBack, customData){ return justReactive.setValue.apply(this, [{type:'attr', prop:prop, callBack:callBack, attrName:attrName, customData:customData}])}
});

/**
 * Добавление точки отслеживания
 * @example this.model.items.justWatch(item_id);
 */
Object.defineProperty(Object.prototype, "justWatch", {
    enumerable: false
  , configurable: true
  , writable: false
  , value: function(prop)
    {
        return justReactive.setValue.apply(this, [{
                type:'watch',
                prop:prop,
                deep:false
            }])
    }
});

/**
 * Добавление точки отслеживания рекурсивно
 * @example this.model.items.justWatch(item_id);
 */
Object.defineProperty(Object.prototype, "justDeepWatch", {
    enumerable: false
  , configurable: true
  , writable: false
  , value: function(prop)
    {
        var deepWatch = function(obj, prop)
        {
            if(typeof obj[prop] != "object" || obj[prop] == null)
            {
                obj.justWatch(prop);
                return;
            }

            for(var i in obj[prop])
            {
                if(typeof obj[prop][i] == "object" && obj[prop][i] != null)
                {
                    deepWatch(obj[prop], i);
                    obj[prop].justWatch(i);
                }
                else
                {
                    obj[prop].justWatch(i);
                }
            }
        }

        deepWatch(this, prop)
        return true;
    }
});
 
/*
 * https://gist.github.com/eligrey/384583
 *
 *
 * object.watch polyfill
 *
 * 2012-04-03
 *
 * By Eli Grey, http://eligrey.com
 * Public Domain.
 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 */

// object.watch
if (!Object.prototype.watch) {
	Object.defineProperty(Object.prototype, "watch", {
		  enumerable: false
		, configurable: true
		, writable: false
		, value: function (prop, handler) {
			var
			  oldval = this[prop]
			, newval = oldval
			, getter = function () {
				return newval;
			}
			, setter = function (val) {
				oldval = newval;
				return newval = handler.call(this, prop, oldval, val);
			}
			;

			if (delete this[prop]) { // can't watch constants
				Object.defineProperty(this, prop, {
					  get: getter
					, set: setter
					, enumerable: true
					, configurable: true
				});
			}
		}
	});
}

// object.unwatch
if (!Object.prototype.unwatch) {
	Object.defineProperty(Object.prototype, "unwatch", {
		  enumerable: false
		, configurable: true
		, writable: false
		, value: function (prop) {
			var val = this[prop];
			delete this[prop]; // remove accessors
			this[prop] = val;
		}
	});
}




/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
function isObject(item) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
function mergeDeep(target, ...sources) {
  if (!sources.length) return target;

  if(target === undefined)
  {
      target = sources.shift();
  }

  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return mergeDeep(target, ...sources);
}