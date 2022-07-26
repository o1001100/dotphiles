#!/bin/zsh

# check architecture
if [[ $(uname -m) != *'aarch'* ]]; then print 'This script is for arm systems only, please run install.sh instead' && exit 1; else; fi

function testing_crap () {
  set -e
  trap 'last_command=$current_command; current_command=$BASH_COMMAND' DEBUG
  trap 'echo "\"${last_command}\" command executed with exit code $?."' EXIT
}

# uncomment to enable the shit above
#testing_crap

# checking user
if [[ $(whoami) = 'root' ]]; then print "Don't run as root!" && exit 1; else; fi

# setting variables
local missa=('')
local missc=('')
local missp=('')
local missn=('')
local rsh=(false)
local ins=()
local omzsh=(~'/.oh-my-zsh')

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
    rsh=(true)
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
    print '\nFinished, continuing installer\n'
    rsh=(true)
  else
    print 'Okay buddy'
    exit 0
  fi
}

function install_npm () {
  print "NPM doesn't appear to be installed, would you like me to install it for you? (Y/n)"
  read -sq place
  if [[ ($place = 'y') ]]
  then
    print 'Okay, installing NPM'
    sudo apt install npm -y
    print '\nFinished, continuing installer\n'
    rsh=(true)
  else
    print 'Okay buddy'
    exit 0
  fi
}

# checking for packages
if $([ ! -d "$omzsh" ]); then install_omzsh; else; fi
if $([ ! -d "${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k" ]); then install_p10k; else; fi
if [[ $(command -v cargo) = "" ]]; then install_rust; else; fi
if [[ $(command -v npm) = "" ]]; then install_npm; else; fi
if [[ ($rsh = true) ]]; then print 'You now need to log out of your current shell session and log back in before you can run this script again'; exit 0; fi
if $([ ! -d "${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/plugins/zsh-autosuggestions" ]); then missp=(zsh-autosuggestions $missp); fi
if $([ ! -d "${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting" ]); then missp=(zsh-syntax-highlighting $missp); fi
if [[ $(command -v navi) = "" ]]; then missc=(navi $missc); fi
if [[ $(command -v gitui) = "" ]]; then missc=(gitui $missc); fi
if [[ $(command -v curl) = "" ]]; then missa=(curl $missa); fi
if [[ $(command -v bat) = "" ]]; then missc=(bat $missc); fi
if [[ $(command -v exa) = "" ]]; then missa=(exa $missa); fi
if [[ $(command -v tmux) = "" ]]; then missa=(tmux $missa); fi
if [[ $(command -v mc) = "" ]]; then missa=(mc $missa); fi
if [[ $(command -v rsync) = "" ]]; then missa=(rsync $missa); fi
if [[ $(command -v fzf) = "" ]]; then missa=(fzf $missa); fi
if [[ $(command -v gtop) = "" ]]; then missn=(gtop $missn); fi

# placing dots
function place_dots () {
  print '\nPlacing all dotfiles'
  rsync -crv ./home/. ~/
  print 'Finished, terminating installer'
  exit 0
}

# installing packages
function install_packages () {
  print '\nInstalling all required packages'
  if [[ ($missa != '') ]]
  then
    if [[ $(sudo apt install -y $missa) ]]; then; else pkg install -y $missa; fi
    #sudo apt install -y '$missa'
  else; fi
  if [[ ($missc != '') ]]
  then
    cargo install $missc
  else; fi
  if [[ ($missn != '') ]]
  then
    sudo npm install $missn -g
  else; fi
  if [[ ($missp != '') ]]
  then
    for f in $missp
    do
      git clone https://github.com/zsh-users/$f ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/$f
    done
    print 'You will need to restart your current shell to make new plugins availiable'
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
  if [[ ($ins = 'y') ]]
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
  print 'The following packages and/or plugins are missing:' $missa $missc $missn $missp
  print "ZSH will complain if you are missing plugins don't blame me!"
  print 'Do you want me to install them for you? (Y/n)'
  read -sq ins
  if [[ ($ins = 'y') ]]
  then
    dots
  else
    dots
  fi
}

if [[ ($missa = '' && $missc = '' && $missp = '' && $missn = '') ]]
then
  dots
else
  packages
fi

print 'uh oh, I did a fucky wucky'
exit 1
