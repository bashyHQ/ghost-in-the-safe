title: How to use fascinating static blog generator statical-ghost? # these are yaml config, notice the space !
slug: how-to-use-fascinating-static-blog-generator-statical-ghost
date: 2015-12-30 11:00:00 # optional, use stat.birthtime if not exists
author: me # optional
tags: [hello, world] # optional, tag list
top: true # optional, be in the top of loop
page: false # optional, not in loop
---

statical-ghost: another static blog generator using ghost theme

# INSTALL

```sh
npm i -g statical-ghost
```

# FEATURES

* fast, generate thousands of posts only for seconds
* easy to use, see [usage](#usage)
* based on ghost theme, a lost of free theme are available. <http://marketplace.ghost.org/themes/free/>


# USAGE

## init blog folders

first, you need initialize folders in current directory.

```sh
sg init # or sg i
```

then, you got a structure like this:

```
<current directory>
  |-posts   # for your markdown posts, supports sub directory
  |-files   # files below this directory will be copied to /public
  |-public  # this directory include the generated blog site
  |-tmp     # temp directory, speed up generating
  |-themes  # ghost themes
```

this command not only create directories, but also generate demo post, config.yaml and even downloading a default ghost theme Casper. You can write your posts in `/posts`.

after this command, actually you have already got everything ready, just enter next step.

## generate

now you can start generating your blog, it's very fast because of using multi-process
```sh
sg generate # or sg g
```

## server

you can see your `/public` directory added many files, then run

```sh
sg server # or sg s
```

to start a local static server, it would also auto generate your posts if posts or theme are changed
now click <http://127.0.0.1:8080> to see your blog !!!

## see help

```sh
sg -h
```
then you can get messages below:

```
Usage: sg sg [command] [options]


  Commands:

    generate|g             generate blog
    init|i                 initialize blog structure in current directory
    clean|c                clean temp dir
    deploy|d               deploy to server, use config.deploy in config.yaml as command
    generateAndDeploy|gd   generate and deploy
    server|s               start a static server, which would auto generate when posts changed

  another static glog generator by ghost theme

  Options:

    -h, --help           output usage information
    -V, --version        output the version number
    -c, --config <path>  set config path. default is ./config.yaml
    -p, --port           the port of local server
```

## config file

config.yaml

# TODO
