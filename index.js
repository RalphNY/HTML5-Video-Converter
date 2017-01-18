#!/usr/bin/env node

/**
 * Module dependencies.
 */

var program = require('commander');
var defaults = require('lodash/defaults');
var chalk = require('chalk');
var path = require('path');
var fs = require('fs');
var Ffmpeg = require('fluent-ffmpeg');

var inputIsDir = false;
var inputIsFile = false;

function parsePath(file) {
  var normalizedPath = path.normalize(file);
  var isRelativePath = (normalizedPath.charAt(0) !== '/');
  return (isRelativePath) ? path.resolve(__dirname, normalizedPath) : normalizedPath;
}

function parseBool(str) {
  return (str === 'true') ? true : false;
}

function parseBitrate(number) {
  console.log(number);
  return parseInt(number);
}

program
  .version('0.0.1')
  .usage('[options] <keywords>')
  .option('-i, --input [path]', 'Input file or directory', parsePath)
  .option('-o, --output [path]', 'Output directory', parsePath)
  .option('-w, --width [pixel width]', 'Output file width (defaults to input width)', '?')
  .option('-h, --height [integer]', 'Output file height (defaults to input height)', '?')
  .option('-b, --bitrate [integer]', 'Bitrate (in Kbps)', parseBitrate, 1000)
  .option('-a, --audio [boolean]', 'Should the video output with audio?', parseBool, true)
  .option('-ab, --audiobitrate [integer]', 'Audio bitrate', parseBitrate, 96)
  .parse(process.argv);

if (!fs.existsSync(program.input)) {
  console.error(chalk.red('Error: Path `%s` does not exist. Please check input and try again.'), program.input);
  return;
}

if (program.input === program.output) {
  console.error(chalk.red('Error: Input and output paths cannot be the same, please define a different output directory.'));
  return;
}

// make output directory if it doesn't exist
if (!fs.existsSync(program.output)) {
  console.log(program.output);
  fs.mkdirSync(program.output);
}

var fsInput = fs.lstatSync(program.input);
inputIsDir = fsInput.isDirectory();
inputIsFile = fsInput.isFile();

// Set some initial defaults for arguments
var args = defaults(program.args, {
  input: program.input,
  output: program.output,
  width: program.width,
  height: program.height,
  audioBitrate: program.audiobitrate,
  videoBitrate: program.bitrate
});

console.log(args);

var ffmpeg = new Ffmpeg();
function addInput(input, output) {

  ffmpeg
    .input(input)
    .output(output + '/' + path.basename(input, path.extname(input)) + '.mp4')
    .outputOptions([
      '-profile:v main',
      '-level 3.1',
      '-crf 32'
    ])
    .audioCodec('libfdk_aac')
    .videoCodec('libx264')
    .videoBitrate(args.videoBitrate);

  if (args.width !== '?' || args.height !== '?') {
    ffmpeg.size(args.width + 'x' + args.height);
  }

  ffmpeg
    .output(output + '/' + path.basename(input, path.extname(input)) + '.webm')
    .outputOptions([
      '-quality good',
      '-cpu-used 3',
      '-qmin 5',
      '-qmax 50',
      '-crf 10'
    ])
    .audioCodec('libvorbis')
    .videoCodec('libvpx')
    .videoBitrate(args.videoBitrate);

  if (args.width !== '?' || args.height !== '?') {
    ffmpeg.size(args.width + 'x' + args.height);
  }
}

if (inputIsFile) {
  addInput(args.input, args.output);
}

function printProgress(progress) {
  console.log(progress);
  // process.stdout.write(progress.percent+'% Done');
  // process.stdout.clearLine();
  // process.stdout.cursorTo(0);
  // process.stdout.write("\n");
}

ffmpeg
  .on('progress', printProgress)
  .run();
