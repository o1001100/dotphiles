#!/bin/zsh

# check architecture 
if [[ $(uname -m) != *'aarch'* ]]; then print 'This script is for arm systems only, please run install.sh instead' && exit 1; else; fi

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
local missa=('')
local missb=('')
local missc=('')
local install=()
local zsh=()
local omzsh=(~'/.oh-my-zsh')
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
    print 'This script and all the things it is made to install are made for Zsh and will likely break if used with other shells'
    print 'Would you like me to set zsh as the default shell?'
    read ask
    if [[ ($ask = 'y') || ($ask = 'Y') ]]
    then
      print '\nOkay, installing Zsh and setting it as the default shell'
      chsh -s $(which zsh)
      sudo chsh -s $(which zsh)
      print '\nFinished! You now need to log out of your current shell session and log back in before you can run this script again'
      exit 0
    else
      print 'Okay buddy'
      exit 0
    fi
  else
    print 'Your default shell is Zsh yet you ran this script in a different shell anyway????'
    print "Not even going to offer to help, come back when you've sorted your shit out"
    exit 2
  fi
}

function install_omzsh () {
  print "Oh My Zsh doesn't appear to be installed, would you like me to install it for you? (Y/n)"
  read -sq place
  if [[ ($place = 'y') ]]
  then
    print 'Okay, installing Oh My Zsh'
    sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
    print '\nFinished! You now need to log out of your current shell session and log back in before you can run this script again'
    exit 0
  else
    print 'Okay buddy'
    exit 0
  fi
}

function install_p10k () {
  print "Powerlevel10k doesn't appear to be installed, would you like me to install it for you? (Y/n)"
  read -sq place
  if [[ ($place = 'y') ]]
  then
    print 'Okay, installing Powerlevel10k'
    git clone --depth=1 https://github.com/romkatv/powerlevel10k.git ${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k
    print '\nFinished, continuing installer\n'
  else
    print 'Okay buddy'
    exit 0
  fi
}

function install_rust () {
  print "Rust doesn't appear to be installed, would you like me to install it for you? (Y/n)"
  read -sq place
  if [[ ($place = 'y') ]]
  then
    print 'Okay, installing Rust'
    curl https://sh.rustup.rs -sSf | sh
    print '\nFinished! You now need to log out of your current shell session and log back in before you can run this script again'
    exit 0
  else
    print 'Okay buddy'
    exit 0
  fi
}

function install_auto () {
  print "Zsh Autosuggestions doesn't appear to be installed, would you like me to install it for you? (Y/n)"
  read -sq place
  if [[ ($place = 'y') ]]
  then
    print 'Okay, installing Zsh Autosuggestions'
    git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/plugins/zsh-autosuggestions
    print '\nFinished, continuing installer\n'
  else
    print 'Okay buddy'
    exit 0
  fi
}

# checking for packages
if [[ $(command -v zsh) = "" ]]; then install_zsh; else; fi
if [[ ($SHELL != *'zsh'* ) ]]; then default=(true); else; fi
if [[ $(cat /proc/$$/cmdline) != *'zsh'* ]]; then not_zsh; else; fi
if $([ ! -d "$omzsh" ]); then install_omzsh; else; fi
if $([ ! -d "${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k" ]); then install_p10k; else; fi
if [[ $(command -v cargo) = "" ]]; then install_rust; else; fi
if $([ ! -d "${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/plugins/zsh-autosuggestions" ]); then install_auto; else; fi
if [[ $(command -v navi) = "" ]]; then missc=('navi\n'$missc); fi
if [[ $(command -v gitui) = "" ]]; then missc=('gitui\n'$missc); fi
if [[ $(command -v curl) = "" ]]; then missa=('curl\n'$missa); fi
if [[ $(command -v batcat) = "" ]]; then missa=('bat\n'$missa); fi
if [[ $(command -v exa) = "" ]]; then missa=('exa\n'$missa); fi
if [[ $(command -v tmux) = "" ]]; then missa=('tmux\n'$missa); fi
if [[ $(command -v mc) = "" ]]; then missa=('mc\n'$missa); fi

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
  if [[ ($missa != '') ]]
  then
    sudo apt install $missa -y
  else; fi
  if [[ ($missb != '') ]]
  then
    yes | brew install $missb
  else; fi
  if [[ ($missc != '') ]]
  then
    cargo install $missc
  else; fi
  if [[ ($place = 'y') ]]
  then
    print 'All missing packages have been installed, continuing'
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
  print 'The following packages are missing: ' $missa' '$missb' '$missc
  print 'Do you want me to install them for you? (Y/n)'
  read -sq install
  dots
}

if [[ ($missa = '' && $missb = '') ]]
then
  dots
else
  packages
fi

print 'uh oh, I did a fucky wucky'
exit 1
