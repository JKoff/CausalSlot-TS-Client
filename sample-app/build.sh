#!/bin/bash

tsc
esbuild main.js --bundle --outfile=bundle.js

