if ('undefined' === typeof fs) {
    var fs = require('fs');
};
if ('undefined' === typeof path) {
    var path = require('path');
};
if ('undefined' === typeof spawnSync) {
    var spawnSync = require('child_process').spawnSync;
};
Object.defineProperty(typeof global === 'object' ? global : window, 'LISPRUNTIME', { 'value' : 'lisp',
                                                                                'enumerable' : true,
                                                                                'writable' : false,
                                                                                'configurable' : false
                                                                              });
Object.defineProperty(typeof global === 'object' ? global : window, 'PROVIDEDRUNTIME', { 'value' : 'provided.al2',
                                                                                    'enumerable' : true,
                                                                                    'writable' : false,
                                                                                    'configurable' : false
                                                                                  });
Object.defineProperty(typeof global === 'object' ? global : window, 'DEFAULTDOCKERIMAGE', { 'value' : 'quay.io/fisxoj/cl-lambda-builder',
                                                                                       'enumerable' : true,
                                                                                       'writable' : false,
                                                                                       'configurable' : false
                                                                                     });
Object.defineProperty(typeof global === 'object' ? global : window, 'DEFAULTDOCKERTAG', { 'value' : '6ed1efb',
                                                                                     'enumerable' : true,
                                                                                     'writable' : false,
                                                                                     'configurable' : false
                                                                                   });
Object.defineProperty(typeof global === 'object' ? global : window, 'NOOUTPUTCAPTURE', { 'value' : { 'stdio' : ['ignore', process.stdout, process.stderr] },
                                                                                    'enumerable' : true,
                                                                                    'writable' : false,
                                                                                    'configurable' : false
                                                                                  });
function findAsdName(path) {
    for (var filename = null, _js_arrvar192 = fs.readdirSync(path), _js_idx191 = 0; _js_idx191 < _js_arrvar192.length; _js_idx191 += 1) {
        filename = _js_arrvar192[_js_idx191];
        if (filename.indexOf('.asd') !== -1) {
            __PS_MV_REG = [];
            return filename.slice(0, filename.length - '.asd'.length);
        };
    };
};
function undefinedP(value) {
    return typeof value === 'undefined';
};
if ('undefined' === typeof EXTENDS905) {
    var EXTENDS905 = null;
};
function ServerlessLispPlugin(initServerless, initOptions) {
    var buildFn = this.build.bind(this);
    this.serverless = initServerless;
    this.options = initOptions;
    this.hooks = { 'before:package:createDeploymentArtifacts' : buildFn,
                'before:deploy:function:packageFunction' : buildFn,
                'before:offline:start' : buildFn,
                'before:offline:start:init' : buildFn
              };
    this.srcDir = this.serverless.config.servicePath;
    return;
};
ServerlessLispPlugin.prototype.getDockerArgs = function () {
    __PS_MV_REG = [];
    return ['run', '--rm', '-it', '-v', [this.srcDir, '/work', 'Z'].join(':'), '-e', ['LAMBDA_SYSTEM_NAME', findAsdName(this.srcDir)].join('='), [DEFAULTDOCKERIMAGE, DEFAULTDOCKERTAG].join(':')];
};
ServerlessLispPlugin.prototype.getDockerBinary = function () {
    return process.env['SLS_DOCKER_CLI'] || 'podman';
};
ServerlessLispPlugin.prototype.log = function () {
    var args = Array.prototype.slice.call(arguments, 0);
    var _js193 = this.serverless.cli;
    var _js194 = _js193.log;
    __PS_MV_REG = [];
    return _js194.apply(_js193, args);
};
ServerlessLispPlugin.prototype.build = function () {
    this.log('Building shared function binary...');
    if (this.serverless.service.provider.name !== 'aws') {
        return null;
    };
    this.serverless.service['package'].excludeDevDependencies = false;
    spawnSync(this.getDockerBinary(), this.getDockerArgs(), NOOUTPUTCAPTURE);
    this.serverless.service['package'] = this.serverless.service['package'] || {  };
    this.serverless.service['package'].artifact = path.join(this.srcDir, 'function.zip');
    __PS_MV_REG = [];
    return this.serverless.service.provider.runtime === LISPRUNTIME ? (this.serverless.service.provider.runtime = PROVIDEDRUNTIME) : null;
};
ServerlessLispPlugin.prototype.functions = function () {
    __PS_MV_REG = [];
    return !undefinedP(this.options['function']) ? [this.options['function']] : this.serverless.service.getAllFunctions();
};
module.exports = ServerlessLispPlugin;
