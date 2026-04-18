#!/bin/bash
urls=(
  "https://flashga.me/embed/back-to-grannys-house-2"
  "https://flashga.me/embed/awesome-tanks-3"
  "https://flashga.me/embed/az-tank-trouble"
  "https://flashga.me/embed/tank-trouble"
  "https://flashga.me/embed/az-tank-trouble-4"
  "https://flashga.me/embed/baby-looney-tunes-find-it"
  "https://flashga.me/embed/bad-parenting"
  "https://flashga.me/embed/bad-ice-cream-unblocked"
  "https://flashga.me/embed/bakugan-the-big-battle"
  "https://flashga.me/embed/bakugan-the-final-brawl"
  "https://flashga.me/embed/baldis-basics"
)
i=1
for url in "${urls[@]}"; do
  code=$(curl -s -o /dev/null -w '%{http_code}' "$url")
  printf '%2d. %s  ->  %s\n' $i "$url" "$code"
  i=$((i+1))
done
