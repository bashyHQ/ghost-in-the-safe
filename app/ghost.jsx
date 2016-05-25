let render_tasks = require('statical-ghost/lib/task/')
let View = require('statical-ghost/lib/view/')
var baseModel = require('statical-ghost/lib/model/base_model')

let fs = require('fs')

function render (input, output) {
  baseModel.init()
  render_tasks.getTasks().forEach(function (task, idx) {
    let view = View()
    if (task.rss) {
      fs.writeFile(task.path, task.rss, 'utf-8',
        function (err) {
          // FIXME: this currently fails
          err && console.error(err)
        })
    } else {
      view.render(task.tpl, task.context, task.context.relativeUrl)
    }
  })
}

export default render
