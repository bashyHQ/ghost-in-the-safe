# Ghost in the Safe

is an experimental (blog) publishing platforms for the safenetwork (build by maidsafe). It is hosted on the network itself and runs only in the browser, thus allowing to be used as a fully distributed WebApp without any servers, yet the publishing tool on the network itself.


See it in action (click the thumbnail to see the video):

[![Ghost in the Safe Demo Video](http://s1.webmshare.com/t/nroAL.jpg)](http://webmshare.com/play/nroAL)

## Usage

Just connect to the [stable droplet test network provided by maidsafe](https://forum.safenetwork.io/t/stable-droplet-test-network/9444/11) and click the following link to start the app – **proceed with caution, this is only a conceptual prototype**:

# launch ['Ghost in the Safe' 0.7](http://app.ghost07.safenet)

## Goal

The goal of 'Ghost in the Safe' is to provide easy, intuitive and beautiful content publishing and blogging to the safe network for anyone to start their website with. As the safe network operates completely without servers all classic approaches to this – like Wordpress or Ghost – are out of the questions and many static-site-generator are just not non-coder-friendly-enough to find mass-audience acceptance.

However, Ghost themes themselves use a similar approach and all of their – magnificently beautiful – themes can actually be statically build, using a Templateing-language completely written in javascript: handlebars (initially even for the browser rather than the server). Those in combination with the choice of using the really simple markdown language to provide text editing made the ghost system the weapon of choice: **Markdown-Files compiled statically with a Javascript-written Templating language using Beautiful Designs** – with a [flourishing marketplace for themes])(http://marketplace.ghost.org/).

Thus, by version 1.0 'Ghost in the Safe' attempts to be 100% ghost-themes-compatible.


## Development decisions

This is the work of less than 10 days hacking together a concept study to proof that a browser-based publishing tool for and within the maidsafe safenetwork is technically possible and feasible. At it currently stands for its first release (version 0.7), this has been proven and the results are there for anyone to test. For that – let's call it what it is – hack, the following design decisions had been taken:

 - We are using a fork of the [statical-ghost](https://github.com/ligthyear/statical-ghost) to compile the markdown files with the ghosts templates into websites. We had to fork the project to make some fixes coming from assuming file-system-behaviour we can't provide
 - We are currently using [BrowserFS](https://github.com/ligthyear/BrowserFS) with an in-memory-storage-system to allow statical-ghost to run as it needs to
 - We rely heavily on the [safenet javascript library](https://github.com/eblanshey/safenet) to connect to the network and sync files between maidsafe and the browser
 - For the editor, we rely on the awesome [Pen](https://github.com/sofish/pen)-Editor
 - For the GUI we are using [React](http://facebook.github.io/react/) and [MUI-CSS](https://www.muicss.com/) to give it a nice look and feel
 - We are shipping with a few themes as internal-zip-files
 - all this is barely [held together with duct tape](http://thinkexist.com/quotation/duct_tape_is_like_the_force-it_has_a_light_side-a/217542.html) and hacks.


### Versioning

This Software is using [Monotonic Versioning](http://blog.appliedcompscilab.com/monotonic_versioning_manifesto/) (for the package.json in the Semantic Versioning Compatibility Mode with an additional `.0`). Each minor or major release is defined by being published on the [maidsafe (test) network](https://forum.safenetwork.io/t/stable-droplet-test-network/9444/11).

## Work to Come

## While pre 1.0

These are some known issues. However, as this was only meant to be a concept study they may or may not get fixed before version 1.0. If you happen to want to fix any one of them, we are accepting pull-requests:

 - [ ] When the Safe Launcher runs out of space, the app is screwed
 - [ ] We have troubles sending binary data to the safe launcher
 - [ ] The DNS-Name generator can't be reached by clicking (you have to tab there)
 - [ ] We can only publish one project per account at the moment
 - [x] we can't create new posts
 - [x] we can't upload files
 - [ ] There are files, but they aren't published
 - [ ] files nor posts can be deleted
 - [ ] posts can't be set to be draft
 - [ ] momentjs seems to cause hick ups on post Metadata
 - [ ] there appear to be unicode encoding issues in posts, which duplicate for every write-read-cycle
 - [ ] the editor doesn't switch between files properly, showing old files at times
 - [ ] the editor doesn't have any way to easily link to our files / should link on click in side-drawer
 - [ ] there is no preview of files
   - [ ] neither in the editor
   - [ ] nor when selecting them in the drawer
 - [ ] the side drawer should highlight the selected post we editing
 - [ ] configuration is missing many options:
  - [ ] managing authors
  - [ ] managing tags
  - [ ] image upload: logos / favicons / authors
 - [ ] RSS doesn't compile (though, do we need that on safenet?)


## Version 1.0

However, because of the nature of this project as a concept study, this prototype is in no shape to be maintainable in its current form. It is bloated and big, hacky on every corner and uses way to many huge dependencies. For a feature complete (and maintainable) version 1.0 the internal structure and code must be completely rewritten. This is what I have in mind about this right now:

 - [ ] Build an offline-first local-storage-based safenetwork syncing layer
 - [ ] Complete rewrite of the system
  - [ ] Drop BrowserFS, statical-ghost
  - [ ] our own implementation of a ghost-theme-renderer using the new syncing-layer and handlebars directly
 - [ ] highly improved UI
 - [ ] multi-project support
 - [ ] sub-directory support
 - [ ] proper logo, design and brand


## Contributing

Please fill away your issues and problems, and for any of the above mentioned Pull-Requests are highly welcomes. However bigger changes will only be accepted towards version 1.0, which will also be the focus for further work.


## License

© 2016, Benjamin Kampmann for [The Bashy Initiative](http://www.bashy.io)

This projects is licensed under AGPL 3.0. See the [LICENSE File](./LICENSE) in this directory for more the full text. In short this license states that the software is provided as is, that the authors and distributors do not give any guarantees but that you can use, distribute and change it as you please as long as you keep it under the same license. This license further more requires you to also give anyone access to the source code – including your changes – for whom you make this available as a compiled version or offer via a telecommunication service (you run it for anyone else, you have to provide the source!).
