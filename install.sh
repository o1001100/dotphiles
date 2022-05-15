#!/bin/zsh

# exit if a command fails
set -e

# keep track of the last executed command
trap 'last_command=$current_command; current_command=$BASH_COMMAND' DEBUG

# echo an error message before exiting
trap 'echo "\"${last_command}\" command executed with exit code $?."' EXIT

# checking user
if [[ $(whoami) = 'root' ]]; then print "Don't run as root!" && exit 1; else; fi

# setting variables
local new=(print '\n')
local miss=('')
local install=()
local zsh=()
local omzsh=(~'/.oh-my-zsh')
local p10k=(~'/.p10k.zsh')
local missing=('')
local default=()
local current=()

function install_zsh () {
  print "You don't seem to have zsh installed, do you want me to install it and set it as the default shell? (requires root)\n(Y/n)"
  read ask
  if [[ ($ask = 'y') || ($ask = 'Y') ]]
  then
    print '\nOkay, installing zsh and setting it as the default shell'
    sudo apt install zsh -y
    chsh -s $(which zsh)
    sudo chsh -s $(which zsh)
    print '\nFinished! You now need to log out of your current shell session and log back in before you can run this script again'
    exit 0
  else
    print 'Okay buddy'
    exit 0
  fi
}

function not_zsh () {
  if [[ ($current = true) ]]
  then
    print 'This script and all the things it is made to install are made for zsh and will likely break if used with other shells'
    print 'Would you like me to set zsh as the default shell?'
    read ask
    if [[ ($ask = 'y') || ($ask = 'Y') ]]
    then
      print '\nOkay, installing zsh and setting it as the default shell'
      chsh -s $(which zsh)
      sudo chsh -s $(which zsh)
      print '\nFinished! You now need to log out of your current shell session and log back in before you can run this script again'
      exit 0
    else
      print 'Okay buddy'
      exit 0
    fi
  else
    print 'Your default shell is zsh yet you ran this script in a different shell anyway????'
    print "Not even going to offer to help, come back when you've sorted your shit out"
    exit 2
  fi
}

# checking for packages
if [[ $(command -v zsh) = "" ]]; then install_zsh; else; fi
if [[ ($SHELL != *'zsh'* ) ]]; then default=(true); else; fi
if [[ $(cat /proc/$$/cmdline) != *'zsh'* ]]; then not_zsh; else; fi
if $([ ! -d "$omzsh" ]); then install_omzsh; else; fi
if $([ ! -f "$p10k" ]); then install_p10k; else; fi
if [[ $(command -v curl) = "" ]]; then miss=('curl '$miss); fi
if [[ $(command -v batcat) = "" ]]; then miss=('bat '$miss); fi

# placing dots
function place_dots () {
  print '\nPlacing all dotfiles'
  cp -ruv ./home/. ~/
  print 'Finished, terminating installer'
  exit 0
}

# installing packages
function install_packages () {
  print '\nInstalling all required packages'
  sudo apt install $miss -y
  if [[ ($place = 'y') ]]
  then
    place_dots
  else
    print 'Finished, terminating installer'
    exit 0
  fi
}

# promt to place dotfiles
function dots () {
  print 'Do you want me to place all the dotfiles for you? (Y/n)'
  read -sq place
  if [[ ($install = 'y') ]]
  then
    install_packages
  elif [[ $place = 'y' ]]
  then
    place_dots
  else
    print 'okay but why did you run the installer then lol'
    exit 0
  fi
}

# promt to install missing packages
function packages () {
  print 'The following packages are missing: ' $miss
  print 'Do you want me to install them for you? (Y/n)'
  read -sq install
  dots
}

if [[ ($miss = '') ]]
then
  dots
else
  packages
fi

print 'uh oh, I did a fucky wucky'
exit 1
