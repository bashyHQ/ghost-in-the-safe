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

function initFS(safeApp) {
  try {
    fs.mkdirSync('/posts')
    // if we are creating the first time, add file
    fs.writeFileSync('/posts/example.md', require("./raw/example.md"))
  } catch (EEXIST) { };

  // ensure the following paths exist
  ['/files',
   '/tmp',
   '/helpers',
   '/helpers/tpl',
   '/public/assets',
   '/public/public'
  ].forEach(function (f, idx) {
    try {
      fs.mkdirSync(f)
    } catch (EEXIST) { }
  })
  if (!fs.existsSync('/config.yaml')) fs.writeFileSync('/config.yaml', require("./raw/default_config.yaml"))

  fs.writeFileSync('/types/mime.types', require("./raw/mime.types"))
  fs.writeFileSync('/types/node.types', "")

  fs.writeFileSync('/helpers/tpl/navigation.hbs', require("./raw/tpl/navigation.hbs"))
  fs.writeFileSync('/helpers/tpl/pagination.hbs', require("./raw/tpl/pagination.hbs"))
  fs.writeFileSync('/public/public/jquery.min.js', require("./raw/jquery.min.js"))
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

export { makeZip, installTheme, initFS }
