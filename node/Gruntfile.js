var Promise = require('promise'),
    grunt = require('grunt'),
    spawn = Promise.denodeify(grunt.util.spawn),
    log = grunt.log,
    path = require('path'),
    tmpdir = require('os').tmpdir();

module.exports = function(grunt) {

    grunt.initConfig({
        gce: {
            project: 'mmobdevlab',
            zone: 'europe-west1-b',
            instance: 'mmdl',
            dir: '/apps/mmdl-backend',
            script: "<%= gce.dir %>/app.js"
        }
    });

    grunt.registerTask('gce:deploy', function(instance) {
        var cfg = grunt.config('gce');
        var doneFn = this.async();

        var filename = 'mmdl-backend-' + Date.now() + '.tar.gz',
            localpath = path.join(tmpdir, filename),
            remotepath = '/tmp/' + filename;

        getHostIP(cfg.project, cfg.zone, instance || cfg.instance).then(
            function(host) {
                targz('.', localpath, ['./gce', './node_modules', './Gruntfile.js']).
                then(scp.bind(null, localpath, remotepath, host)).
                then(execRemote.bind(null, 'sudo tar xzf ' + remotepath + ' -C ' + cfg.dir, host)).
                then(execRemote.bind(null, 'cd ' + cfg.dir + ' && sudo npm install', host)).
                then(execRemote.bind(null, 'sudo forever restart ' + cfg.script, host)).
                done(doneFn.bind(null, true), doneFn.bind(null, false));
            },
            function(err) {
                log.error(err);
                doneFn(false);
            })
    });

    grunt.registerTask('gce:start', function(instance) {
        var cfg = grunt.config('gce');
        execRemoteAndDone(cfg,
            'sudo forever start ' + cfg.script,
            instance,
            this.async());
    });

    grunt.registerTask('gce:stop', function(instance) {
        var cfg = grunt.config('gce');
        execRemoteAndDone(cfg,
            'sudo forever stop ' + cfg.script,
            instance,
            this.async());
    });

    grunt.registerTask('gce:ps', function(instance) {
        execRemoteAndDone(grunt.config('gce'),
            'sudo forever list',
            instance,
            this.async());
    });
};

function targz(dir, dst, exclude) {
    var args = ['czvf', dst];
    (exclude || []).forEach(function(p) {
        args.push('--exclude', p)
    });
    args.push('.');
    log.writeln('Creating archive at', dst);
    return spawn({
        cmd: 'tar',
        args: args,
        opts: {cwd: dir, stdio: 'inherit'}
    });
}

function scp(localpath, remotepath, host) {
    var dst = host + ':' + remotepath;
    log.writeln('scp', localpath, dst);
    return spawn({
        cmd: 'scp',
        args: [
            '-o', 'UserKnownHostsFile=/dev/null',
            '-o', 'CheckHostIP=no',
            '-o', 'StrictHostKeyChecking=no',
            localpath, dst
        ],
        opts: {stdio: 'inherit'}
    });
}

function execRemote(cmd, host) {
    log.writeln(host + ':', cmd);
    return spawn({
        cmd: 'ssh',
        args: [
            '-o', 'UserKnownHostsFile=/dev/null',
            '-o', 'CheckHostIP=no',
            '-o', 'StrictHostKeyChecking=no',
            host, cmd
        ],
        opts: {stdio: 'inherit'}
    });
}

function execRemoteAndDone(cfg, cmd, instance, doneFn) {
    getHostIP(cfg.project, cfg.zone, instance || cfg.instance).
    then(execRemote.bind(null, cmd)).
    done(doneFn.bind(null, true), function(err) {
        log.error(err);
        doneFn(false);
    });
}

function getHostIP(project, zone, instance) {
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(instance)) {
        // no need to lookup if instance is already an ip address
        return Promise.from(instance);
    }

    var args = ['--project', project, '--format', 'json', 'getinstance', instance, '--zone', zone];
    log.writeln('gcutil', args.join(' '));

    return new Promise(function resolver(resolve, reject) {
        spawn({
            cmd: 'gcutil',
            args: args
        }).then(
            function success(output) {
                var data = JSON.parse(String(output));
                if (data.status !== 'RUNNING') {
                    reject('Instance "' + instance + '" is not running: ' + data.status);
                    return;
                }
                resolve(data.networkInterfaces[0].accessConfigs[0].natIP);
            },
            function error(err) {
                reject(err.message || err);
            });
    });
}
