var express = require('express');
var app = express();

var config = require('config');
var logger = bunyan.createLogger(config.bunyan);

var mysql = require('mysql');

var bwip = require('bwip');