#!/bin/zsh

function testing_crap () {
  set -e
  trap 'last_command=$current_command; current_command=$BASH_COMMAND' DEBUG
  trap 'echo "\"${last_command}\" command executed with exit code $?."' EXIT
}

# uncomment to enable the (broken) error capture above
#testing_crap

# checking user
if [[ $(whoami) = 'root' ]]; then print "Don't run as root!" && exit 1; else; fi

# checking distro
if [[ (-f /etc/os-release) ]]
then
  . /etc/os-release
  local distro=$ID
  if [[ ($distro = 'debian' || 'arch') ]]
  then
    print "\nRunning on $NAME \n"
  else
    print 'Unknow/unsupported distro, exiting'
    exit 1
  fi
else
  print 'Unknown/unsupported distro, exiting'
  exit 1
fi

# setting variables
local missa=('')
local missc=('')
local missp=('')
local rsh=(false)
local dots=$(pwd)
local cargo=('cargo install')
local full=(false)
if [[ ($distro = debian) ]]; then local pkgman='sudo apt-get install -y'; elif [[ ($distro = arch) ]]; then local pkgman='paru -S --noconfirm --needed'; fi

function install_paru () {
  if [[ ($distro != arch) ]]; then return; fi
  print "Paru doesn't appear to be installed, would you like me to install it for you? (Y/n)"
  read -sq place
  if [[ ($place = 'y') ]]
  then
    print 'Okay, installing Paru'
    sudo pacman -S --needed --noconfirm base-devel git
    git clone https://aur.archlinux.org/paru.git /tmp/paru
    ( cd paru && makepkg -si )
    print '\nFinished, continuing installer\n'
  else
    print 'Okay buddy'
    exit 0
  fi
}

function install_pacstall () {
  if [[ ($distro != debian) ]]; then return; fi
  print "Pacstall doesn't appear to be installed, would you like me to install it for you? (Y/n)"
  read -sq place
  if [[ ($place = 'y') ]]
  then
    print 'Okay, installing Pacstall'
    sudo apt-get install -y curl wget
    sudo bash -c "$(curl -fsSL https://git.io/JsADh || wget -q https://git.io/JsADh -O -)"
    print '\nFinished, continuing installer\n'
  else
    print 'Okay buddy'
    exit 0
  fi
}

function install_omz () {
  if $([ -d "$HOME/.oh-my-zsh" ]); then return; fi
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
  if $([ -d "$HOME/.oh-my-zsh/custom/themes/powerlevel10k" ]); then return; fi
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

function install_cargo () {
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

# start by asking whether installation should be full or lite

print "Inatall extra (gui) components? (Y/n)"
read -sq place
if [[ ($place = 'y') ]]; then $full=true; fi

# check for installer dependencies

for f in $(<$dots/configs/dep.pkgs)
do
  if [[ $(command -v "$f") = "" ]]; then install_$f; fi
done

# check for plugins

for f in $(<$dots/configs/plg.pkgs)
do
  if $([ ! -d "${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/plugins/$f" ]); then missp=($f $missp); fi
done

# check for packages in distro package manager

if [[ ($distro = *'arch'*) ]]
then
  for f in $(<$dots/configs/aur.pkgs)
  do
    if [[ $(paru -Q) != *"$f"* ]]; then missa=($f $missa); fi
  done
elif [[ ($distro = *'debian'*) ]]
then
  for f in $(<$dots/configs/apt-lite.pkgs)
  do
    if [[ $(dpkg --get-selections | grep -v deinstall) != *"$f"* ]]; then missa=($f $missa); fi
  done
fi

# check for cargo packages

for f in $(<$dots/configs/cargo.pkgs)
do
  if [[ $(<$dots/configs/aur.pkgs) != *"$f"* && $(eval $cargo --list) != *"$f"* && ($distro = arch) ]]
  then
    missc=($f $missc)
  elif [[ $(eval $cargo --list) != *"$f"* ]]
  then
    missc=($f $missc)
  fi
done

# promt user to restart shell session if needed
if [[ ($rsh = true) ]]; then print 'You now need to log out of your current shell session and log back in before you can run this script again'; exit 0; fi

# placing dots

function place_dots () {
  print '\n Setting up directories and placing files'
  if [[ (full) ]]
  then
    for f in $(<$dots/configs/full.dir)
    do
      if $([ ! -d $HOME/.$f ]); then mkdir $HOME/.$f; fi
      rsync -crv $dots/dirs/$f/. $HOME/.$f
    done
  else
    if $([ ! -d $HOME/.config ]); then mkdir $HOME/.config; fi
    for f in $(<$dots/configs/lite.dir)
    do
      if $([ ! -d $HOME/.$f ]); then mkdir $HOME/.$f; fi
      rsync -crv $dots/dirs/$f/. $HOME/.$f
    done
  fi

  #print '\nSetting up directories'
  #if $([ ! -d '$HOME/.aliases' ]); then mkdir $HOME/.aliases; fi
  #if $([ ! -d '$HOME/.config' ]); then mkdir $HOME/.config; fi
  #if $([ ! -d '$HOME/.local' ]); then mkdir $HOME/.local; fi
  #if $([ ! -d '$HOME/.oh-my-zsh' ]); then mkdir $HOME/.oh-my-zsh; fi
  #if $([ ! -d '$HOME/.themes' ]); then mkdir $HOME/.themes; fi
  #print '\nPlacing dotfiles'
  #rsync -crv $dots/aliases/. $HOME/.aliases
  #rsync -crv $dots/config/. $HOME/.config
  #rsync -crv $dots/local/. $HOME/.local
  #rsync -crv $dots/oh-my-zsh/. $HOME/.oh-my-zsh
  #rsync -crv $dots/themes/. $HOME/.themes
  #rsync -crv $dots/bin/. /usr/local/bin
  print '\nSymlinking ZSH config'
  if $([ -d $HOME/.zshenv ]); then rm $HOME/.zshenv; fi
  if $([ ! -d $HOME/.zshenv ]); then ln -s $HOME/.config/zsh/.zshenv $HOME/.zshenv; fi
  print 'All done, quitting installer'
  exit 0
}

# installing packages
function install_packages () {
  print '\nInstalling all required packages'
  if [[ ($missa != '') ]]
  then
    if [[ ($missa = *"tailscale"*) && ($distro = *"debian"*) ]]; then curl -fsSL https://pkgs.tailscale.com/stable/debian/sid.noarmor.gpg | sudo tee /usr/share/keyrings/tailscale-archive-keyring.gpg >/dev/null && curl -fsSL https://pkgs.tailscale.com/stable/debian/sid.tailscale-keyring.list | sudo tee /etc/apt/sources.list.d/tailscale.list && sudo apt-get update; fi
    eval $pkgman $missa
    if [[ ($missa = *"tailscale"*) ]]; then sudo systemctl enable --now tailscaled; fi
    if [[ ($missa = *"tealdeer"*) ]]; then cp completion/zsh_tealdeer /usr/share/zsh/site-functions/_tldr; fi
  fi
  if [[ ($missc != '') ]]
  then
    eval $cargo $missc
  fi
  if [[ ($missp != '') ]]
  then
    for f in $missp
    do
      git clone https://github.com/zsh-users/$f ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/$f
    done
    print '\nYou will need to restart your current shell to make new plugins availiable\n'
  fi
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
  print 'The following packages and/or plugins are missing:' $missa $missc $missp
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

if [[ ($missa = '' && $missp = '' && $missc = '') ]]
then
  dots
else
  packages
fi

print 'uh oh, I did a fucky wucky'
exit 1
