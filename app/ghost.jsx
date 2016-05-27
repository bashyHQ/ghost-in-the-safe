export default function render (input, output) {
  let render_tasks = require('statical-ghost/lib/task/')
  let View = require('statical-ghost/lib/view/')
  var baseModel = require('statical-ghost/lib/model/base_model')

  let fs = require('fs')
  baseModel.init()
  return Promise.all(
    render_tasks.getTasks().map((task, idx) => new Promise((rs, rj) => {
      let view = View()
      if (task.rss) {
        fs.writeFile(task.path, task.rss, 'utf-8',
          function (err) {
            // FIXME: this currently fails
            err && console.error(err)
            rs()
          })
      } else {
        view.render(task.tpl, task.context, task.context.relativeUrl)
        rs()
      }
    })
  ))
}
