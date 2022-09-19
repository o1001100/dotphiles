#!/bin/zsh

######################################################################

###                      Installer functions                       ###

######################################################################

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

# installing Powerlevel10k
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

# installing Rust and Cargo
function install_cargo () {
  print "Rust doesn't appear to be installed, would you like me to install it for you? (Y/n)"
  read -sq place
  if [[ ($place = 'y') ]]
  then
    print 'Okay, installing Rust'
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    print '\nFinished, continuing installer\n'
    rsh=(true)
  else
    print 'Okay buddy'
    exit 0
  fi
}

# placing dotfiles
function place_dots () {
  print '\n Setting up directories and placing files'
  if [[ ($full = true) ]]
  then
    for f in $(<$dots/configs/full.dir)
    do
      if $([ ! -d $HOME/.$f ]); then mkdir $HOME/.$f; fi
      rsync -crvl $dots/dirs/$f/. $HOME/.$f
    done
  else
    if $([ ! -d $HOME/.config ]); then mkdir $HOME/.config; fi
    for f in $(<$dots/configs/lite.dir)
    do
      if $([ ! -d $HOME/.$f ]); then mkdir $HOME/.$f; fi
      rsync -crvl $dots/dirs/$f/. $HOME/.$f
    done
  fi

  print '\nSymlinking ZSH config'
  if $([ -f $HOME/.zshenv ]); then rm -v $HOME/.zshenv; fi
  if $([ ! -f $HOME/.zshenv ]); then ln -sv $HOME/.config/zsh/.zshenv $HOME/.zshenv; fi
  print '\nAll done, quitting installer'
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

######################################################################

###                           Setting up                           ###

######################################################################

# checking user
if [[ $(whoami) = 'root' ]]; then print "Don't run as root!" && exit 1; else; fi

# checking distro
if [[ (-f /etc/os-release) ]]
then
  . /etc/os-release
  local distro=$ID
  if [[ ($distro != 'debian' || 'arch') ]]
  then
    print 'This installer currently only supports Debian Linux and Arch Linux'
    print "Distro detected: $PRETTY_NAME"
    print 'The script will now exit, please try again on a supported distro or install manually'
    exit 1
  elif [[ ($distro = *'debian'*) && ($PRETTY_NAME != *'sid'*) ]]
  then
    print 'This script currently only supports Debian Sid (unstable)'
    print "Version detected: $PRETTY_NAME"
    print 'The script will now exit, please try again on a supported version or install manually'
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

# start by asking whether installation should be full or lite

print "Install extra (gui) components? (Y/n)"
read -sq place
if [[ ($place = 'y') ]]; then full=true; else full=false; fi

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

if [[ ($distro = *'arch'*) && ($full = true) ]]
then
  for f in $(<$dots/configs/aur.pkgs)
  do
    if [[ $(paru -Q) != *"$f"* ]]; then missa=($f $missa); fi
  done
elif [[ ($distro = *'arch'*) && ($full = false) ]]
then
  for f in $(<$dots/configs/aur-lite.pkgs)
  do
    if [[ $(paru -Q) != *"$f"* ]]; then missa=($f $missa); fi
  done
elif [[ ($distro = *'debian'*) && ($full = true) ]]
then
  for f in $(<$dots/configs/apt.pkgs)
  do
    if [[ $(dpkg --get-selections | grep -v deinstall) != *"$f"* ]]; then missa=($f $missa); fi
  done
elif [[ ($distro = *'debian'*) && ($full = false) ]]
then
  for f in $(<$dots/configs/apt-lite.pkgs)
  do
    if [[ $(dpkg --get-selections | grep -v deinstall) != *"$f"* ]]; then missa=($f $missa); fi
  done
fi

# check for cargo packages

if [[ ($full = true) ]]
then
  for f in $(<$dots/configs/cargo.pkgs)
  do
    if [[ ($(<$dots/configs/aur.pkgs) != *"$f"*) && ($(eval $cargo --list) != *"$f"*) && ($distro = *'arch'*) ]]
    then
      missc=($f $missc)
    elif [[ ($(eval $cargo --list) != *"$f"*) && ($distro != *'arch'*) ]]
    then
      missc=($f $missc)
    fi
  done
else
  for f in $(<$dots/configs/cargo-lite.pkgs)
  do
    if [[ ($(<$dots/configs/aur-lite.pkgs) != *"$f"*) && ($(eval $cargo --list) != *"$f"*) && ($distro = *'arch'*) ]]
    then
      missc=($f $missc)
    elif [[ ($(eval $cargo --list) != *"$f"*) && ($distro != *'arch'*) ]]
    then
      missc=($f $missc)
    fi
  done
fi

# promt user to restart shell session if needed
if [[ ($rsh = true) ]]; then print 'You now need to log out of your current shell session and log back in before you can run this script again'; exit 0; fi

######################################################################

###                        User preferences                        ###

######################################################################

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

######################################################################

###                   Begin proper installations                   ###

######################################################################

# decide how to start
if [[ ($missa = '' && $missp = '' && $missc = '') ]]
then
  dots
else
  packages
fi

######################################################################

###                         End of script                          ###

######################################################################

# this should never run
print 'uh oh, I did a fucky wucky'
exit 1
