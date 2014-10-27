module.exports=function(jade) { return function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (name) {
buf.push(jade.escape(null == (jade_interp = 'Hello ' + name + '!') ? "" : jade_interp));}.call(this,"name" in locals_for_with?locals_for_with.name:typeof name!=="undefined"?name:undefined));;return buf.join("");
}
};