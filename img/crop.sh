#!/usr/bin/env bash

WIDTH=2012
HEIGHT=1600
X=114
Y=214

for img in *.png
do
  convert $img \
      -crop ${WIDTH}x${HEIGHT}+${X}+${Y} \
      -resize 50% \
      crop-$img
done
#-resize 89% \
