let render_tasks = require('../lib/statical-ghost/lib/task/')
let View = require('../lib/statical-ghost/lib/view/')
let fs = require('fs')

function render (input, output) {
  render_tasks.getTasks().forEach(function (task, idx) {
    let view = View()
    if (task.rss) {
      fs.writeFile(task.path, task.rss, 'utf-8',
        function (err) {
          err && console.error(err)
        })
    } else {
      view.render(task.tpl, task.context, task.context.relativeUrl)
    }
  })
}

export default render
