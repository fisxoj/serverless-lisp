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
Object.defineProperty(typeof global === 'object' ? global : window, 'PROVIDEDRUNTIME', { 'value' : 'provided',
                                                                                    'enumerable' : true,
                                                                                    'writable' : false,
                                                                                    'configurable' : false
                                                                                  });
Object.defineProperty(typeof global === 'object' ? global : window, 'DEFAULTDOCKERIMAGE', { 'value' : 'quay.io/fisxoj/cl-lambda-builder',
                                                                                       'enumerable' : true,
                                                                                       'writable' : false,
                                                                                       'configurable' : false
                                                                                     });
Object.defineProperty(typeof global === 'object' ? global : window, 'DEFAULTDOCKERTAG', { 'value' : 'ba54651',
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
    for (var filename = null, _js_arrvar130 = fs.readdirSync(path), _js_idx129 = 0; _js_idx129 < _js_arrvar130.length; _js_idx129 += 1) {
        filename = _js_arrvar130[_js_idx129];
        if (filename.indexOf('.asd') !== -1) {
            __PS_MV_REG = [];
            return filename.slice(0, filename.length - '.asd'.length);
        };
    };
};
function undefinedP(value) {
    return typeof value === 'undefined';
};
if ('undefined' === typeof EXTENDS766) {
    var EXTENDS766 = null;
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
    return ['run', '--rm', '-it', '-v', ['/home/fisxoj/quicklisp/local-projects', '/root/quicklisp/local-projects', 'Z'].join(':'), '-v', [this.srcDir, '/app', 'Z'].join(':'), '-e', ['LAMBDA_SYSTEM_NAME', findAsdName(this.srcDir)].join('='), 'cl-aws-builder'];
};
ServerlessLispPlugin.prototype.getDockerBinary = function () {
    return process.env['SLS_DOCKER_CLI'] || 'podman';
};
ServerlessLispPlugin.prototype.log = function () {
    var args = Array.prototype.slice.call(arguments, 0);
    var _js131 = this.serverless.cli;
    var _js132 = _js131.log;
    __PS_MV_REG = [];
    return _js132.apply(_js131, args);
};
ServerlessLispPlugin.prototype.build = function () {
    this.log('Building shared function binary...');
    this.serverless.service['package'].excludeDevDependencies = false;
    spawnSync(this.getDockerBinary(), this.getDockerArgs());
    this.functions().forEach((function (functionName) {
        this.log('Wiring up function: ', functionName);
        var fun = this.serverless.service.getFunction(functionName);
        var runtime133 = fun.runtime || this.serverless.service.provider.runtime;
        if (runtime133 === LISPRUNTIME) {
            fun['package'] = fun['package'] || {  };
            fun['package'].artifact = path.join(this.srcDir, 'function.zip');
            return fun.runtime = PROVIDEDRUNTIME;
        };
    }).bind(this));
    __PS_MV_REG = [];
    return this.serverless.service.provider.runtime === LISPRUNTIME ? (this.serverless.service.provider.runtime = PROVIDEDRUNTIME) : null;
};
ServerlessLispPlugin.prototype.functions = function () {
    __PS_MV_REG = [];
    return !undefinedP(this.options['function']) ? [this.options['function']] : this.serverless.service.getAllFunctions();
};
module.exports = ServerlessLispPlugin;
