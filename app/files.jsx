let BrowserFS = require('browserfs/dist/browserfs.min.js')

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


function initFS(safe, setupCb) {
  setupCb('checking infrastructure', 35);
  // ensure the following paths exist
  ['/files',
   '/tmp',
   '/helpers',
   '/helpers/tpl',
   '/posts',
   '/public/assets',
   '/public/public'
  ].forEach(function (f, idx) {
    try {
      fs.mkdirSync(f)
    } catch (EEXIST) { }
  })

  setupCb('ensuring files ', 40)
  fs.writeFileSync('/types/mime.types', require("./raw/mime.types"))
  fs.writeFileSync('/types/node.types', "")

  fs.writeFileSync('/helpers/tpl/navigation.hbs', require("./raw/tpl/navigation.hbs"))
  fs.writeFileSync('/helpers/tpl/pagination.hbs', require("./raw/tpl/pagination.hbs"))
  fs.writeFileSync('/public/public/jquery.min.js', require("./raw/jquery.min.js"))

  if (!fs.existsSync('/config.yaml')) {
    setupCb('Creating initial setup: adding config', 42)
    fs.writeFileSync('/config.yaml', require("./raw/default_config.yaml"))
    setupCb('Creating initial setup: adding example post', 45)
    fs.writeFileSync('/posts/example.md', require("./raw/example.md"))
    setupCb('Creating initial setup: installing theme', 50)
    installTheme('decent');
  }

  setupCb('infrastructure update done', 55)
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
  var files=[], folders=[];
  _collect_files_and_folders(files, folders, '/public')
  console.log(files, folders)
  let opts = {isPathShared: false, metadata: null};
  return safe.createDirectory('/public', opts
    ).catch(ignore_exists
    ).then(
      () => _create_folders(safe, folders, opts)
    ).then(
        () => _sync_files(safe, files, opts)
    );
}

function installTheme (theme) {
    let fs = require("statical-ghost/lib/utils/fs-plus2.js")
    var copyFile = [{
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
}

export { makeZip, installTheme, initFS, publish }
