var define = Object.defineProperty;
var has = Object.hasOwnProperty
var objProto = Object.prototype;
var proto = Object.getPrototypeOf
var trace = Error.captureStackTrace
module.exports = StandardError

function StandardError(msg, props, inner) {
  // Let all properties be enumerable for easier serialization.
  if (props instanceof Error) inner = props, props = undefined
  if (msg && msg instanceof Object && proto(msg) == objProto) props = msg
  else this.message = msg

  // Name has to be an own property (or on the prototype a single step up) for
  // the stack to be printed with the correct name.
  if (props) for (var key in props) this[key] = props[key]
  if (!has.call(this, "name"))
    this.name = has.call(proto(this), "name")? this.name : this.constructor.name

  if (trace && !("stack" in this)) trace(this, this.constructor)
  if (inner) {
    var stack = this.stack;

    define(this, "inner", { value: inner, enumerable: false });
    define(this, "stack", {
      get: function() {
        if (this.inner) {
          stack += "\nFrom previous event:\n" + this.inner.stack;
        }

        return stack;
      }
    });
  }
}

StandardError.prototype = Object.create(Error.prototype, {
  constructor: {value: StandardError, configurable: true, writable: true}
})

// Set name explicitly for when the code gets minified.
StandardError.prototype.name = "StandardError"
