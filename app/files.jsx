let BrowserFS = require('../lib/browserfs/src/main.ts')

BrowserFS.install(window)
// Constructs an instance of the LocalStorage-backed file system.

var fsroot = new BrowserFS.FileSystem.MountableFileSystem()

fsroot.mount('/', new BrowserFS.FileSystem.LocalStorage())
fsroot.mount('/types', new BrowserFS.FileSystem.InMemory())
fsroot.mount('/public', new BrowserFS.FileSystem.InMemory())
fsroot.mount('/themes', new BrowserFS.FileSystem.InMemory())
fsroot.mount('/themes/frostmango', new BrowserFS.FileSystem.ZipFS(require('../lib/Frostmango-master.zip')))

fsroot.mount('/themes/decent', new BrowserFS.FileSystem.ZipFS(require('../lib/decent-v1.1.1.zip')))

BrowserFS.initialize(fsroot)

let fs = window.fs = window.require('fs');
let JSZip = require('jszip');

function syncToSafe(safeNfs, files, path){
  return Promise.all(files.map((f) => new Promise((rs, rj) => {
    // for every file given
    let cur_path = path + '/' + f;
    fs.stat(cur_path, (err, stat) => {
      if (err || !stat){
        console.log(cur_path + " not found: " + err)
        return rs()
      }
      // we are a directory, create it and recursively sync
      if(stat.isDirectory())
        safeNfs.createDirectory(cur_path, {}
          ).catch(ignore_exists
          ).then(() => fs.readdir(cur_path, (err, files) => {
            syncToSafe(safeNfs, files, cur_path
            ).then(rs).catch(rj)
          })).catch(rj)
      else
      // this is a file, sync it.
        safeNfs.createFile(cur_path, {}).catch(ignore_exists).then(() => {
          fs.readFile(cur_path, (err, content) => {
            safeNfs.updateFile(cur_path, content, {}
              ).then(rs
              ).catch(rj)
          })
        }).catch(rj)
    })
  })))
}

function syncFromSafe(safeNfs, folders, files, path) {
  return Promise.all([
    Promise.all(folders.map((folder) => {
      let full_path = path + folder;
      return safeNfs.getDirectory(full_path, {}).then((resp) => new Promise((rs, rj) => {
        fs.mkdir(full_path, (err) => {
          syncFromSafe(safeNfs,
              resp.subDirectories, resp.files, full_path + '/').then(rs).catch(rj)
        })
      })).catch(console.error.bind(console))
    })),
    Promise.all(files.map((file) => {
      let full_path = path + file;
      return safeNfs.getFile(full_path, {}).then((resp) => new Promise((rs, rj) => {
        fs.writeFile(full_path, resp.body, (err) => {
          err ? rj(err) : rs(full_path)
        })
      }))
    }))
  ])
}

function initFS(safeNfs, setupCb) {
  setupCb('checking infrastructure', 35);
  return Promise.all(
    ['/files',
     '/tmp',
     '/helpers',
     '/helpers/tpl',
     '/posts',
     '/public/assets',
     '/public/public'
      ].map((f, idx) => new Promise((rs, rj) =>
        fs.mkdir(f, (err) => rs()) // we don't care about problems
      ))
    ).then(() => syncFromSafe(safeNfs,
      ['files', 'posts', 'public'],
      ['config.yaml'],
      '').catch( () => true) // ignoring errors
    ).then(() => {
      setupCb('ensuring files ', 40)
      return Promise.all([
        Promise.all([
          {name: '/types/mime.types',
           content: require("./raw/mime.types")},
          {name:'/types/node.types',
           content: require("./raw/node.types")},
          {name:'/helpers/tpl/navigation.hbs',
           content: require("./raw/tpl/navigation.hbs")},
          {name:'/helpers/tpl/pagination.hbs',
           content: require("./raw/tpl/pagination.hbs")},
          {name: '/public/public/jquery.min.js',
           content: require("./raw/jquery.min.js")}
          ].map((f, idx) => new Promise((rs, rj) => {
            fs.writeFile(f.name, f.content, (err) => {
              err ? (console.log(f.name) && rj(err)) : rs(f.name)
            })
          }))).catch(console.error.bind(console)),
        new Promise((rs, rj) => {
          fs.exists('/config.yml', (exists) => {
            if (exists) return rs('/config.yml') // we have a prior setup.
            setupCb('Creating initial setup.', 45)
            Promise.all([
              new Promise((rs, rj) =>
                fs.writeFile('/config.yaml',
                             require("./raw/default_config.yaml"),
                            () => rs())),
              new Promise((rs, rj) =>
                fs.writeFile('/posts/example.md',
                             require("./raw/example.md"),
                            () => rs())),
              installTheme('decent')
            ]).then( () => syncToSafe(safeNfs,
                  ['config.yaml', 'posts', 'public'], '')
            ).then(() => setupCb('Setup done', 50)
            ).then(rs).catch(rj)
          })
        })
      ]).then(() => {
        setupCb('All files in place', 52)
      })
    }).then(() => {
      setupCb('infrastructure update done', 55)
    }).catch(console.error.bind(console));
}

function _walkForZip(zip, path){
  fs.readdirSync(path).forEach(function(child){
    var childFile = path + '/' + child
    var stat = fs.statSync(childFile)
    if ( stat.isDirectory ()) {
      let folder = zip.folder(child)
      _walkForZip(folder, childFile)
    } else {
      let content = fs.readFileSync(childFile)
      zip.file(child, content.data.buff.buffer)
    }
  })
}

function makeZip() {
  var zip = new JSZip()
  _walkForZip(zip, '/public')
  zip.generateAsync({type:"base64"}).then(function (base64) {
    window.open("data:application/zip;base64," + base64, "download")
  }).catch(function (err){ console.error(err) });
}


function _collect_files_and_folders(files, folders, path){
  fs.readdirSync(path).forEach(function(child){
    var childFile = path + '/' + child
    var stat = fs.statSync(childFile)
    if (stat.isDirectory ()) {
      folders.push(childFile)
      _collect_files_and_folders(files, folders, childFile)
    } else {
      files.push(childFile)
    }
  })
}

function ignore_exists(err){
  if (err.isSafeError && (err.status === -502 || err.status === -505)){
    // -502: Directory Already Exists
    // -505: File Already Exists
    return true
  }
  throw err;
}

function _create_folders(safe, folders, opts){
  let next = folders.shift()
  console.log('Creating Folder', next);
  return safe.createDirectory(next, opts
    ).catch(ignore_exists
    ).then(() =>
      (folders.length) ? _create_folders(safe, folders, opts) : true
  )
}

function _sync_files(safe, files, opts){
  let next = files.shift()
  content = fs.readFileSync(next).toString();
  console.log('Creating File', next);
  return safe.createFile(next, opts
    ).catch(ignore_exists
    ).then(
      () => safe.updateFile( next, content, opts)).then(
        () => (files.length) ? _sync_files(safe, files, opts) : true
    )
}

function publish(safe){
  return syncToSafe(safe, ['config.yaml', 'posts', 'public'], '/')
}

function installTheme (theme) {
    return new Promise((rs, rj) => {
      // FIXME: make this actually async
      let fs = require("statical-ghost/lib/utils/fs-plus2.js");
      let copyFile = [{
        src: '/themes/' + theme + '/assets',
        dst: '/public/assets/'
      }, {
        src: '/themes/' + theme + '/favicon.ico',
        dst: '/public/favicon.ico'
      }]
      copyFile.forEach(function (copy) {
        if (fs.existsSync(copy.src)) {
          fs.copy(copy.src, copy.dst)
        }
      })
      rs()
    })
}

export { makeZip, installTheme, initFS, publish }
