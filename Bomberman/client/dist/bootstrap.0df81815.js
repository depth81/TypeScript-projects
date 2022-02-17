// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"src/engine/DeltaTracker.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var DeltaTracker =
/** @class */
function () {
  function DeltaTracker() {}

  DeltaTracker.prototype.getAndUpdateDelta = function () {
    if (this.lastTime == null) {
      this.lastTime = this.getTimestampMS();
      return 0;
    }

    var currentTime = this.getTimestampMS(); // delta => time since last frame in seconds

    var delta = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;
    return delta;
  };

  DeltaTracker.prototype.getTimestampMS = function () {
    return new Date().getTime();
  };

  return DeltaTracker;
}();

exports.default = DeltaTracker;
},{}],"src/engine/GameLoop.ts":[function(require,module,exports) {
"use strict";

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var DeltaTracker_1 = __importDefault(require("./DeltaTracker"));

var GameLoop =
/** @class */
function () {
  function GameLoop(updateFunction, renderFunction) {
    this.updateFunction = updateFunction;
    this.renderFunction = renderFunction;
    this.deltaTracker = new DeltaTracker_1.default();
  }

  GameLoop.prototype.run = function () {
    window.requestAnimationFrame(this.loop.bind(this));
  };

  GameLoop.prototype.loop = function () {
    var delta = this.deltaTracker.getAndUpdateDelta();
    this.updateFunction(delta);
    this.renderFunction();
    window.requestAnimationFrame(this.loop.bind(this));
  };

  return GameLoop;
}();

exports.default = GameLoop;
},{"./DeltaTracker":"src/engine/DeltaTracker.ts"}],"src/engine/KeyListener.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var KeyListener =
/** @class */
function () {
  function KeyListener() {
    this.keyStates = {};
  }

  KeyListener.prototype.setup = function (canvasEl) {
    var _this = this;

    canvasEl.addEventListener("keydown", function (e) {
      e.preventDefault();
      _this.keyStates[e.key] = true;
    });
    canvasEl.addEventListener("keyup", function (e) {
      e.preventDefault();
      _this.keyStates[e.key] = false;
    });
  };

  KeyListener.prototype.isKeyDown = function (key) {
    return this.keyStates[key] === true;
  };

  KeyListener.prototype.isAnyKeyDown = function (keys) {
    var _this = this;

    return keys.some(function (key) {
      return _this.isKeyDown(key);
    });
  };

  return KeyListener;
}();

exports.default = KeyListener;
},{}],"src/engine/collision/CollisionHandler.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var CollisionHandler =
/** @class */
function () {
  function CollisionHandler() {
    this.collidables = [];
  }

  CollisionHandler.prototype.addCollidable = function (collidable) {
    this.collidables.push(collidable);
  };

  CollisionHandler.prototype.testMovement = function (driverBox, xMovement, yMovement) {
    return this.findCollisions({
      xPos: driverBox.xPos + xMovement,
      yPos: driverBox.yPos + yMovement,
      width: driverBox.width,
      height: driverBox.height
    });
  };

  CollisionHandler.prototype.findCollisions = function (driverBox) {
    var collisions = [];

    for (var _i = 0, _a = this.collidables; _i < _a.length; _i++) {
      var collidable = _a[_i];
      var collision = this.findCollision(driverBox, collidable);

      if (collision != null) {
        collisions.push(collision);
      }
    }

    return collisions;
  };

  CollisionHandler.prototype.findCollision = function (driverBox, brick) {
    var brickBox = brick.getCollisionBox();
    var rightCollision = driverBox.xPos < brickBox.xPos && driverBox.xPos + driverBox.width > brickBox.xPos;
    var leftCollision = brickBox.xPos < driverBox.xPos && brickBox.xPos + brickBox.width > driverBox.xPos;
    var topCollision = driverBox.yPos < brickBox.yPos && driverBox.yPos + driverBox.height > brickBox.yPos;
    var bottomCollision = brickBox.yPos < driverBox.yPos && brickBox.yPos + brickBox.height > driverBox.yPos;

    if ((rightCollision || leftCollision) && (topCollision || bottomCollision)) {
      return {
        with: brick,
        top: topCollision,
        bottom: bottomCollision,
        left: leftCollision,
        right: rightCollision
      };
    }

    return null;
  };

  return CollisionHandler;
}();

exports.default = CollisionHandler;
},{}],"src/engine/EntityManager.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EntityManager = void 0;

var EntityManager =
/** @class */
function () {
  function EntityManager(imageCache) {
    this.entities = [];
    this.imageCache = imageCache;
  }

  EntityManager.prototype.addEntity = function (entity) {
    if (!entity.hasBeenSetup) {
      entity.runSetup(this.imageCache);
    }

    this.entities.push(entity);
  };

  EntityManager.prototype.getEntities = function () {
    return this.entities;
  };

  return EntityManager;
}();

exports.EntityManager = EntityManager;
},{}],"src/engine/ImageUtils.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var ImageUtils =
/** @class */
function () {
  function ImageUtils() {}

  ImageUtils.loadImageFromUrl = function (url) {
    return new Promise(function (resolve) {
      var img = new Image();

      img.onload = function () {
        resolve(img);
      };

      img.src = url;
    });
  };

  return ImageUtils;
}();

exports.default = ImageUtils;
},{}],"src/engine/ImageCache.ts":[function(require,module,exports) {
"use strict";

var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function (resolve) {
      resolve(value);
    });
  }

  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }

    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }

    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }

    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};

var __generator = this && this.__generator || function (thisArg, body) {
  var _ = {
    label: 0,
    sent: function sent() {
      if (t[0] & 1) throw t[1];
      return t[1];
    },
    trys: [],
    ops: []
  },
      f,
      y,
      t,
      g;
  return g = {
    next: verb(0),
    "throw": verb(1),
    "return": verb(2)
  }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
    return this;
  }), g;

  function verb(n) {
    return function (v) {
      return step([n, v]);
    };
  }

  function step(op) {
    if (f) throw new TypeError("Generator is already executing.");

    while (_) {
      try {
        if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
        if (y = 0, t) op = [op[0] & 2, t.value];

        switch (op[0]) {
          case 0:
          case 1:
            t = op;
            break;

          case 4:
            _.label++;
            return {
              value: op[1],
              done: false
            };

          case 5:
            _.label++;
            y = op[1];
            op = [0];
            continue;

          case 7:
            op = _.ops.pop();

            _.trys.pop();

            continue;

          default:
            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
              _ = 0;
              continue;
            }

            if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
              _.label = op[1];
              break;
            }

            if (op[0] === 6 && _.label < t[1]) {
              _.label = t[1];
              t = op;
              break;
            }

            if (t && _.label < t[2]) {
              _.label = t[2];

              _.ops.push(op);

              break;
            }

            if (t[2]) _.ops.pop();

            _.trys.pop();

            continue;
        }

        op = body.call(thisArg, _);
      } catch (e) {
        op = [6, e];
        y = 0;
      } finally {
        f = t = 0;
      }
    }

    if (op[0] & 5) throw op[1];
    return {
      value: op[0] ? op[1] : void 0,
      done: true
    };
  }
};

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ImageCache = void 0;

var ImageUtils_1 = __importDefault(require("./ImageUtils"));

var ImageCache =
/** @class */
function () {
  function ImageCache() {
    this.preloads = {};
  }

  ImageCache.prototype.preloadImage = function (name, url) {
    return __awaiter(this, void 0, void 0, function () {
      var img;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4
            /*yield*/
            , ImageUtils_1.default.loadImageFromUrl(url)];

          case 1:
            img = _a.sent();
            this.preloads[name] = img;
            return [2
            /*return*/
            ];
        }
      });
    });
  };

  ImageCache.prototype.preloadImages = function (urls) {
    return __awaiter(this, void 0, void 0, function () {
      var promises;

      var _this = this;

      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            promises = Object.entries(urls).map(function (_a) {
              var name = _a[0],
                  url = _a[1];
              return _this.preloadImage(name, url);
            });
            return [4
            /*yield*/
            , Promise.all(promises)];

          case 1:
            _a.sent();

            return [2
            /*return*/
            ];
        }
      });
    });
  };

  ImageCache.prototype.getPreloaded = function (name) {
    return this.preloads[name];
  };

  return ImageCache;
}();

exports.ImageCache = ImageCache;
},{"./ImageUtils":"src/engine/ImageUtils.ts"}],"src/engine/Game.ts":[function(require,module,exports) {
"use strict";

var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function (resolve) {
      resolve(value);
    });
  }

  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }

    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }

    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }

    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};

var __generator = this && this.__generator || function (thisArg, body) {
  var _ = {
    label: 0,
    sent: function sent() {
      if (t[0] & 1) throw t[1];
      return t[1];
    },
    trys: [],
    ops: []
  },
      f,
      y,
      t,
      g;
  return g = {
    next: verb(0),
    "throw": verb(1),
    "return": verb(2)
  }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
    return this;
  }), g;

  function verb(n) {
    return function (v) {
      return step([n, v]);
    };
  }

  function step(op) {
    if (f) throw new TypeError("Generator is already executing.");

    while (_) {
      try {
        if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
        if (y = 0, t) op = [op[0] & 2, t.value];

        switch (op[0]) {
          case 0:
          case 1:
            t = op;
            break;

          case 4:
            _.label++;
            return {
              value: op[1],
              done: false
            };

          case 5:
            _.label++;
            y = op[1];
            op = [0];
            continue;

          case 7:
            op = _.ops.pop();

            _.trys.pop();

            continue;

          default:
            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
              _ = 0;
              continue;
            }

            if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
              _.label = op[1];
              break;
            }

            if (op[0] === 6 && _.label < t[1]) {
              _.label = t[1];
              t = op;
              break;
            }

            if (t && _.label < t[2]) {
              _.label = t[2];

              _.ops.push(op);

              break;
            }

            if (t[2]) _.ops.pop();

            _.trys.pop();

            continue;
        }

        op = body.call(thisArg, _);
      } catch (e) {
        op = [6, e];
        y = 0;
      } finally {
        f = t = 0;
      }
    }

    if (op[0] & 5) throw op[1];
    return {
      value: op[0] ? op[1] : void 0,
      done: true
    };
  }
};

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var GameLoop_1 = __importDefault(require("./GameLoop"));

var KeyListener_1 = __importDefault(require("./KeyListener"));

var CollisionHandler_1 = __importDefault(require("./collision/CollisionHandler"));

var EntityManager_1 = require("./EntityManager");

var ImageCache_1 = require("./ImageCache");

var Game =
/** @class */
function () {
  function Game(canvasEl) {
    this.canvasEl = canvasEl;
    var imageCache = new ImageCache_1.ImageCache();
    this.gameData = {
      context: canvasEl.getContext("2d"),
      screenWidth: canvasEl.width,
      screenHeight: canvasEl.height,
      keyListener: new KeyListener_1.default(),
      collisionHandler: new CollisionHandler_1.default(),
      entityManager: new EntityManager_1.EntityManager(imageCache),
      imageCache: imageCache
    };
  }

  Game.prototype.run = function () {
    return __awaiter(this, void 0, void 0, function () {
      var gameLoop;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            this.gameData.keyListener.setup(this.canvasEl);
            return [4
            /*yield*/
            , this.preload(this.gameData.imageCache)];

          case 1:
            _a.sent();

            this.setup(this.gameData);
            gameLoop = new GameLoop_1.default(this.update.bind(this), this.render.bind(this));
            gameLoop.run();
            return [2
            /*return*/
            ];
        }
      });
    });
  };

  Game.prototype.addEntity = function (entity) {
    this.gameData.entityManager.addEntity(entity); // TODO: add this again
    // if (this.isCollidable(entity)) {
    //   this.gameData.collisionHandler.addCollidable(entity);
    // }
  }; // private async setupEntities() {
  //   let promises = this.gameData.entityManager.getEntities().map(e => e.setup(this.gameData))
  //   return Promise.all(promises)
  // }


  Game.prototype.update = function (delta) {
    var _this = this;

    this.gameData.entityManager.getEntities().forEach(function (e) {
      return e.update(_this.gameData, delta);
    });
  };

  Game.prototype.render = function () {
    var _this = this;

    this.gameData.entityManager.getEntities().forEach(function (e) {
      return e.render(_this.gameData);
    });
  };

  Game.prototype.isCollidable = function (entity) {
    return entity.getCollisionBox !== undefined;
  };

  return Game;
}();

exports.default = Game;
},{"./GameLoop":"src/engine/GameLoop.ts","./KeyListener":"src/engine/KeyListener.ts","./collision/CollisionHandler":"src/engine/collision/CollisionHandler.ts","./EntityManager":"src/engine/EntityManager.ts","./ImageCache":"src/engine/ImageCache.ts"}],"src/engine/Entity.ts":[function(require,module,exports) {
"use strict";

var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function (resolve) {
      resolve(value);
    });
  }

  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }

    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }

    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }

    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};

var __generator = this && this.__generator || function (thisArg, body) {
  var _ = {
    label: 0,
    sent: function sent() {
      if (t[0] & 1) throw t[1];
      return t[1];
    },
    trys: [],
    ops: []
  },
      f,
      y,
      t,
      g;
  return g = {
    next: verb(0),
    "throw": verb(1),
    "return": verb(2)
  }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
    return this;
  }), g;

  function verb(n) {
    return function (v) {
      return step([n, v]);
    };
  }

  function step(op) {
    if (f) throw new TypeError("Generator is already executing.");

    while (_) {
      try {
        if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
        if (y = 0, t) op = [op[0] & 2, t.value];

        switch (op[0]) {
          case 0:
          case 1:
            t = op;
            break;

          case 4:
            _.label++;
            return {
              value: op[1],
              done: false
            };

          case 5:
            _.label++;
            y = op[1];
            op = [0];
            continue;

          case 7:
            op = _.ops.pop();

            _.trys.pop();

            continue;

          default:
            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
              _ = 0;
              continue;
            }

            if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
              _.label = op[1];
              break;
            }

            if (op[0] === 6 && _.label < t[1]) {
              _.label = t[1];
              t = op;
              break;
            }

            if (t && _.label < t[2]) {
              _.label = t[2];

              _.ops.push(op);

              break;
            }

            if (t[2]) _.ops.pop();

            _.trys.pop();

            continue;
        }

        op = body.call(thisArg, _);
      } catch (e) {
        op = [6, e];
        y = 0;
      } finally {
        f = t = 0;
      }
    }

    if (op[0] & 5) throw op[1];
    return {
      value: op[0] ? op[1] : void 0,
      done: true
    };
  }
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var Entity =
/** @class */
function () {
  function Entity() {
    this.hasBeenSetup = false;
  }

  Entity.prototype.runSetup = function (imageCache) {
    return __awaiter(this, void 0, Promise, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            this.hasBeenSetup = true;
            return [4
            /*yield*/
            , this.setup(imageCache)];

          case 1:
            _a.sent();

            return [2
            /*return*/
            ];
        }
      });
    });
  };

  Entity.prototype.setup = function (imageCache) {};

  Entity.prototype.update = function (gameData, delta) {};

  return Entity;
}();

exports.default = Entity;
},{}],"src/GameMap.ts":[function(require,module,exports) {
"use strict";

var __extends = this && this.__extends || function () {
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) {
        if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
      }
    };

    return _extendStatics(d, b);
  };

  return function (d, b) {
    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var Entity_1 = __importDefault(require("./engine/Entity"));

var GameMap =
/** @class */
function (_super) {
  __extends(GameMap, _super);

  function GameMap() {
    return _super.call(this) || this;
  }

  GameMap.prototype.setup = function (imageCache) {
    this.tileImage = imageCache.getPreloaded("bg");
  };

  GameMap.prototype.render = function (_a) {
    var context = _a.context,
        screenHeight = _a.screenHeight,
        screenWidth = _a.screenWidth;
    var tileSize = 64;
    var tileCountX = Math.ceil(screenWidth / tileSize);
    var tileCountY = Math.ceil(screenHeight / tileSize);

    for (var y = 0; y < tileCountY; y++) {
      for (var x = 0; x < tileCountX; x++) {
        context.drawImage(this.tileImage, x * tileSize, y * tileSize, tileSize, tileSize);
      }
    }
  };

  return GameMap;
}(Entity_1.default);

exports.default = GameMap;
},{"./engine/Entity":"src/engine/Entity.ts"}],"src/engine/SpriteSheet.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var SpriteSheet =
/** @class */
function () {
  function SpriteSheet(image, spriteWidth, spriteHeight) {
    this.image = image;
    this.spriteWidth = spriteWidth;
    this.spriteHeight = spriteHeight;
  }

  SpriteSheet.prototype.render = function (_a, xCount, yCount, x, y, width, height, _b) {
    var context = _a.context;
    var _c = (_b === void 0 ? {} : _b).flippedX,
        flippedX = _c === void 0 ? false : _c;
    var renderedX = x;

    if (flippedX) {
      context.save();
      context.scale(-1, 1);
      renderedX = -(x + width);
    }

    context.drawImage(this.image, xCount * this.spriteWidth, yCount * this.spriteHeight, this.spriteWidth, this.spriteHeight, renderedX, y, width, height);

    if (flippedX) {
      context.restore();
    }
  };

  return SpriteSheet;
}();

exports.default = SpriteSheet;
},{}],"src/engine/Sprite.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var Sprite =
/** @class */
function () {
  function Sprite() {}

  Sprite.prototype.update = function (gameData, delta) {};

  return Sprite;
}();

exports.default = Sprite;
},{}],"src/engine/SpriteSheetSprite.ts":[function(require,module,exports) {
"use strict";

var __extends = this && this.__extends || function () {
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) {
        if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
      }
    };

    return _extendStatics(d, b);
  };

  return function (d, b) {
    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var Sprite_1 = __importDefault(require("./Sprite"));

var SpriteSheetSprite =
/** @class */
function (_super) {
  __extends(SpriteSheetSprite, _super);

  function SpriteSheetSprite(spriteSheet, xCount, yCount, _a) {
    var _b = (_a === void 0 ? {} : _a).flippedX,
        flippedX = _b === void 0 ? false : _b;

    var _this = _super.call(this) || this;

    _this.spriteSheet = spriteSheet;
    _this.xCount = xCount;
    _this.yCount = yCount;
    _this.flippedX = flippedX;
    return _this;
  }

  SpriteSheetSprite.prototype.render = function (gameData, x, y, width, height) {
    this.spriteSheet.render(gameData, this.xCount, this.yCount, x, y, width, height, {
      flippedX: this.flippedX
    });
  };

  return SpriteSheetSprite;
}(Sprite_1.default);

exports.default = SpriteSheetSprite;
},{"./Sprite":"src/engine/Sprite.ts"}],"src/engine/Animation.ts":[function(require,module,exports) {
"use strict";

var __extends = this && this.__extends || function () {
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) {
        if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
      }
    };

    return _extendStatics(d, b);
  };

  return function (d, b) {
    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var Sprite_1 = __importDefault(require("./Sprite"));

var Animation =
/** @class */
function (_super) {
  __extends(Animation, _super);

  function Animation(spriteSheet, frames, msPerFrame, _a) {
    var _b = (_a === void 0 ? {} : _a).flippedX,
        flippedX = _b === void 0 ? false : _b;

    var _this = _super.call(this) || this;

    _this.currentFrameIndex = 0;
    _this.msInCurrentFrame = 0;
    _this.spriteSheet = spriteSheet;
    _this.frames = frames;
    _this.msPerFrame = msPerFrame;
    _this.flippedX = flippedX;
    return _this;
  }

  Animation.prototype.update = function (gameData, delta) {
    this.msInCurrentFrame += delta * 1000;

    if (this.msInCurrentFrame >= this.msPerFrame) {
      this.msInCurrentFrame -= this.msPerFrame;
      this.currentFrameIndex++;

      if (this.currentFrameIndex >= this.frames.length) {
        this.currentFrameIndex = 0;
      }
    }
  };

  Animation.prototype.render = function (gameData, x, y, width, height) {
    var currentFrame = this.frames[this.currentFrameIndex];
    this.spriteSheet.render(gameData, currentFrame[0], currentFrame[1], x, y, width, height, {
      flippedX: this.flippedX
    });
  };

  return Animation;
}(Sprite_1.default);

exports.default = Animation;
},{"./Sprite":"src/engine/Sprite.ts"}],"src/engine/Range.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var Range =
/** @class */
function () {
  function Range() {}

  Range.rowRange = function (rowNumber, colCount) {
    return Array.from(new Array(colCount), function (x, i) {
      return [i, rowNumber];
    });
  };

  return Range;
}();

exports.default = Range;
},{}],"src/Bomb.ts":[function(require,module,exports) {
"use strict";

var __extends = this && this.__extends || function () {
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) {
        if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
      }
    };

    return _extendStatics(d, b);
  };

  return function (d, b) {
    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Bomb = void 0;

var Entity_1 = __importDefault(require("./engine/Entity"));

var SpriteSheet_1 = __importDefault(require("./engine/SpriteSheet"));

var SpriteSheetSprite_1 = __importDefault(require("./engine/SpriteSheetSprite"));

var Bomb =
/** @class */
function (_super) {
  __extends(Bomb, _super);

  function Bomb() {
    return _super !== null && _super.apply(this, arguments) || this;
  }

  Bomb.prototype.setup = function (imageCache) {
    var sheetImage = imageCache.getPreloaded("bomb");
    var sheet = new SpriteSheet_1.default(sheetImage, 48, 48);
    this.sprite = new SpriteSheetSprite_1.default(sheet, 0, 0);
  };

  Bomb.prototype.render = function (gameData) {
    this.sprite.render(gameData, 100, 100, 48, 48);
  };

  return Bomb;
}(Entity_1.default);

exports.Bomb = Bomb;
},{"./engine/Entity":"src/engine/Entity.ts","./engine/SpriteSheet":"src/engine/SpriteSheet.ts","./engine/SpriteSheetSprite":"src/engine/SpriteSheetSprite.ts"}],"src/Player.ts":[function(require,module,exports) {
"use strict";

var __extends = this && this.__extends || function () {
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) {
        if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
      }
    };

    return _extendStatics(d, b);
  };

  return function (d, b) {
    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var SpriteSheet_1 = __importDefault(require("./engine/SpriteSheet"));

var SpriteSheetSprite_1 = __importDefault(require("./engine/SpriteSheetSprite"));

var Animation_1 = __importDefault(require("./engine/Animation"));

var Range_1 = __importDefault(require("./engine/Range"));

var Entity_1 = __importDefault(require("./engine/Entity"));

var Bomb_1 = require("./Bomb");

var Player =
/** @class */
function (_super) {
  __extends(Player, _super);

  function Player() {
    var _this = _super !== null && _super.apply(this, arguments) || this;

    _this.sprites = {};
    _this.xPos = 0;
    _this.yPos = 0;
    _this.speed = 150;
    _this.velX = 0;
    _this.velY = 0;
    return _this;
  }

  Player.prototype.setup = function (imageCache) {
    var spriteSheetImage = imageCache.getPreloaded("player");
    var spriteSheet = new SpriteSheet_1.default(spriteSheetImage, 64, 128);
    this.sprites = {
      idle: new SpriteSheetSprite_1.default(spriteSheet, 0, 0),
      forward: new Animation_1.default(spriteSheet, Range_1.default.rowRange(0, 8), 100),
      backward: new Animation_1.default(spriteSheet, Range_1.default.rowRange(1, 8), 100),
      right: new Animation_1.default(spriteSheet, Range_1.default.rowRange(2, 8), 100),
      left: new Animation_1.default(spriteSheet, Range_1.default.rowRange(2, 8), 100, {
        flippedX: true
      })
    };
    this.width = 64;
    this.height = 128;
  };

  Player.prototype.update = function (gameData, delta) {
    var keyListener = gameData.keyListener;
    this.velX = 0;
    this.velY = 0;

    if (keyListener.isAnyKeyDown(["d", "ArrowRight"])) {
      this.velX = this.speed * delta;
    } else if (keyListener.isAnyKeyDown(["q", "a", "ArrowLeft"])) {
      this.velX = -(this.speed * delta);
    }

    if (keyListener.isAnyKeyDown(["s", "ArrowDown"])) {
      this.velY = this.speed * delta;
    } else if (keyListener.isAnyKeyDown(["z", "w", "ArrowUp"])) {
      this.velY = -(this.speed * delta);
    }

    if (keyListener.isKeyDown(" ")) {
      var bomb = new Bomb_1.Bomb();
      gameData.entityManager.addEntity(bomb);
    }

    this.calculateCollision(gameData);
    this.xPos += this.velX;
    this.yPos += this.velY;
    this.getMovingSprite().update(gameData, delta);
  };

  Player.prototype.render = function (gameData) {
    this.getMovingSprite().render(gameData, this.xPos, this.yPos, this.width, this.height);
  };

  Player.prototype.calculateCollision = function (_a) {
    var collisionHandler = _a.collisionHandler;
    var collisionBox = {
      xPos: this.xPos + 10,
      yPos: this.yPos + 110,
      width: this.width - 20,
      height: this.height - 115
    };
    var collisionsX = collisionHandler.testMovement(collisionBox, this.velX, 0);

    if (collisionsX.length > 0) {
      // TODO: move the distance you're still allowed
      this.velX = 0;
    }

    var collisionsY = collisionHandler.testMovement(collisionBox, 0, this.velY);

    if (collisionsY.length > 0) {
      // TODO: move the distance you're still allowed
      this.velY = 0;
    }
  };

  Player.prototype.getMovingSprite = function () {
    if (this.velX === 0 && this.velY === 0) return this.sprites["idle"];
    if (this.velX > 0) return this.sprites["right"];
    if (this.velX < 0) return this.sprites["left"];
    if (this.velY < 0) return this.sprites["backward"];
    return this.sprites["forward"];
  };

  return Player;
}(Entity_1.default);

exports.default = Player;
},{"./engine/SpriteSheet":"src/engine/SpriteSheet.ts","./engine/SpriteSheetSprite":"src/engine/SpriteSheetSprite.ts","./engine/Animation":"src/engine/Animation.ts","./engine/Range":"src/engine/Range.ts","./engine/Entity":"src/engine/Entity.ts","./Bomb":"src/Bomb.ts"}],"src/TestBrick.ts":[function(require,module,exports) {
"use strict";

var __extends = this && this.__extends || function () {
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) {
        if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
      }
    };

    return _extendStatics(d, b);
  };

  return function (d, b) {
    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var Entity_1 = __importDefault(require("./engine/Entity"));

var SpriteSheet_1 = __importDefault(require("./engine/SpriteSheet"));

var TestBrick =
/** @class */
function (_super) {
  __extends(TestBrick, _super);

  function TestBrick() {
    return _super !== null && _super.apply(this, arguments) || this;
  }

  TestBrick.prototype.setup = function (imageCache) {
    var img = imageCache.getPreloaded("blocks");
    this.sheet = new SpriteSheet_1.default(img, 64, 64);
  };

  TestBrick.prototype.render = function (gameData) {
    this.sheet.render(gameData, 1, 0, 128, 128, 64, 64);
  };

  TestBrick.prototype.getCollisionBox = function () {
    return {
      xPos: 128,
      yPos: 128,
      width: 64,
      height: 64
    };
  };

  return TestBrick;
}(Entity_1.default);

exports.default = TestBrick;
},{"./engine/Entity":"src/engine/Entity.ts","./engine/SpriteSheet":"src/engine/SpriteSheet.ts"}],"src/BombermanGame.ts":[function(require,module,exports) {
"use strict";

var __extends = this && this.__extends || function () {
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) {
        if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
      }
    };

    return _extendStatics(d, b);
  };

  return function (d, b) {
    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function (resolve) {
      resolve(value);
    });
  }

  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }

    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }

    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }

    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};

var __generator = this && this.__generator || function (thisArg, body) {
  var _ = {
    label: 0,
    sent: function sent() {
      if (t[0] & 1) throw t[1];
      return t[1];
    },
    trys: [],
    ops: []
  },
      f,
      y,
      t,
      g;
  return g = {
    next: verb(0),
    "throw": verb(1),
    "return": verb(2)
  }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
    return this;
  }), g;

  function verb(n) {
    return function (v) {
      return step([n, v]);
    };
  }

  function step(op) {
    if (f) throw new TypeError("Generator is already executing.");

    while (_) {
      try {
        if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
        if (y = 0, t) op = [op[0] & 2, t.value];

        switch (op[0]) {
          case 0:
          case 1:
            t = op;
            break;

          case 4:
            _.label++;
            return {
              value: op[1],
              done: false
            };

          case 5:
            _.label++;
            y = op[1];
            op = [0];
            continue;

          case 7:
            op = _.ops.pop();

            _.trys.pop();

            continue;

          default:
            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
              _ = 0;
              continue;
            }

            if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
              _.label = op[1];
              break;
            }

            if (op[0] === 6 && _.label < t[1]) {
              _.label = t[1];
              t = op;
              break;
            }

            if (t && _.label < t[2]) {
              _.label = t[2];

              _.ops.push(op);

              break;
            }

            if (t[2]) _.ops.pop();

            _.trys.pop();

            continue;
        }

        op = body.call(thisArg, _);
      } catch (e) {
        op = [6, e];
        y = 0;
      } finally {
        f = t = 0;
      }
    }

    if (op[0] & 5) throw op[1];
    return {
      value: op[0] ? op[1] : void 0,
      done: true
    };
  }
};

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var Game_1 = __importDefault(require("./engine/Game"));

var GameMap_1 = __importDefault(require("./GameMap"));

var Player_1 = __importDefault(require("./Player"));

var TestBrick_1 = __importDefault(require("./TestBrick"));

var BombermanGame =
/** @class */
function (_super) {
  __extends(BombermanGame, _super);

  function BombermanGame() {
    return _super !== null && _super.apply(this, arguments) || this;
  }

  BombermanGame.prototype.preload = function (imageCache) {
    return __awaiter(this, void 0, Promise, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4
            /*yield*/
            , imageCache.preloadImages({
              blocks: "http://localhost:4000/static/blocks.png",
              player: "http://localhost:4000/static/player_spritesheet.png",
              bg: "http://localhost:4000/static/bg.png",
              bomb: "http://localhost:4000/static/bomb.png"
            })];

          case 1:
            _a.sent();

            return [2
            /*return*/
            ];
        }
      });
    });
  };

  BombermanGame.prototype.setup = function (gameData) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        this.addEntity(new GameMap_1.default());
        this.addEntity(new TestBrick_1.default());
        this.addEntity(new Player_1.default());
        return [2
        /*return*/
        ];
      });
    });
  };

  return BombermanGame;
}(Game_1.default);

exports.default = BombermanGame;
},{"./engine/Game":"src/engine/Game.ts","./GameMap":"src/GameMap.ts","./Player":"src/Player.ts","./TestBrick":"src/TestBrick.ts"}],"src/bootstrap.ts":[function(require,module,exports) {
"use strict";

var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function (resolve) {
      resolve(value);
    });
  }

  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }

    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }

    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }

    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};

var __generator = this && this.__generator || function (thisArg, body) {
  var _ = {
    label: 0,
    sent: function sent() {
      if (t[0] & 1) throw t[1];
      return t[1];
    },
    trys: [],
    ops: []
  },
      f,
      y,
      t,
      g;
  return g = {
    next: verb(0),
    "throw": verb(1),
    "return": verb(2)
  }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
    return this;
  }), g;

  function verb(n) {
    return function (v) {
      return step([n, v]);
    };
  }

  function step(op) {
    if (f) throw new TypeError("Generator is already executing.");

    while (_) {
      try {
        if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
        if (y = 0, t) op = [op[0] & 2, t.value];

        switch (op[0]) {
          case 0:
          case 1:
            t = op;
            break;

          case 4:
            _.label++;
            return {
              value: op[1],
              done: false
            };

          case 5:
            _.label++;
            y = op[1];
            op = [0];
            continue;

          case 7:
            op = _.ops.pop();

            _.trys.pop();

            continue;

          default:
            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
              _ = 0;
              continue;
            }

            if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
              _.label = op[1];
              break;
            }

            if (op[0] === 6 && _.label < t[1]) {
              _.label = t[1];
              t = op;
              break;
            }

            if (t && _.label < t[2]) {
              _.label = t[2];

              _.ops.push(op);

              break;
            }

            if (t[2]) _.ops.pop();

            _.trys.pop();

            continue;
        }

        op = body.call(thisArg, _);
      } catch (e) {
        op = [6, e];
        y = 0;
      } finally {
        f = t = 0;
      }
    }

    if (op[0] & 5) throw op[1];
    return {
      value: op[0] ? op[1] : void 0,
      done: true
    };
  }
};

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var BombermanGame_1 = __importDefault(require("./BombermanGame"));

function bootstrap() {
  return __awaiter(this, void 0, void 0, function () {
    var canvasEl, game;
    return __generator(this, function (_a) {
      canvasEl = document.getElementById("game-canvas");

      if (canvasEl == null) {
        console.log("Couldn't find the canvas element");
        return [2
        /*return*/
        ];
      }

      canvasEl.focus();
      game = new BombermanGame_1.default(canvasEl);
      game.run();
      return [2
      /*return*/
      ];
    });
  });
}

bootstrap();
},{"./BombermanGame":"src/BombermanGame.ts"}],"node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "60905" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["node_modules/parcel-bundler/src/builtins/hmr-runtime.js","src/bootstrap.ts"], null)
//# sourceMappingURL=/bootstrap.0df81815.js.map