HTML5 Video Converter
=====================

Requires [Node.js](https://nodejs.org) and [Ffmpeg](https://ffmpeg.org/) with the following codecs:

* libx264
* libfdk_aac
* libvorbis
* libvpx

These can be installed with [Homebrew](http://brew.sh/) using the following command: `brew install ffmpeg --with-fdk-aac --with-ffplay --with-freetype --with-libass --with-libquvi --with-libvorbis --with-libvpx --with-opus --with-x265`.

To install, clone repository and run `npm install`. Then give `convert` executable permissions (eg. `chmod +x convert`). Then run `./convert --help` to see options.
