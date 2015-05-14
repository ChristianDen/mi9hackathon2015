/**
 * DelayCall
 *
 * Examples:
 *
 * var d = new DelayCall(1000, myFunction); // creates a call
 * d.cancel(); // Cancels a call
 *
 * Anonymous inline style:
 *
 * new DelayCall(function(){
 *     // do something
 * }, 500);
 *
 * @param {Function} 	callback
 * @param {Number}   	time
 * @param {Object=}   	context to pass to the callback
 */
module.exports = function(callback, time, context){

    if(!(this instanceof arguments.callee)){
        throw new Error('Constructor called as a function.');
    }

    if(!time){
        throw new Error('Missing required parameter time.');
    }

    if(!callback){
        throw new Error('Missing required parameter callback.');
    }

    var callback = callback,
        time = time,
        context = context || window,
        hasFired = false;

    var onTimer = function(){

        if(callback){
            callback.call(context);
            callback = null;
        }

        hasFired = true;
    };

    var id = setTimeout(onTimer, time);

    /**
     * Cancels the current delayed call
     * @return {void}
     */
    this.cancel = function(){

        if(!id || hasFired){
            return;
        }

        clearTimeout(id);
        id = null;
        callback = null;
    }
};