#!/bin/zsh

function dotphile-update () {
  dots=$(pwd)
  if [[ -z "$DOTS_TYPE" ]]
  then
    print "Couldn't find your installation, please check that it has been installed properly and try again"
    exit 1
  else
    print 'Collecting updates'
  fi
  cd $dots && git pull --recurse-submodules
  if [[ ($DOTS_TYPE = 'full') ]]
  then
    print "Found install type, updating your installation"
    for f in $(<$dots/configs/full.dir)
    do
      rsync -crvl $dots/dirs/$f/. $HOME/.$f
    done
  elif [[ ($DOTS_TYPE = 'lite') ]]
  then
    print "Found install type, updating your installation"
    for f in $(<$dots/configs/lite.dir) ]]
    do
      rsync -crvl $dots/dirs/$f/. $HOME/.$f
    done
  elif [[ ($DOTS_TYPE = 'termux') ]]
  then
    print "Found install type, updating your installation"
    for f in $(<$dots/configs/tmx.dir) ]]
    do
      rsync -crvl $dots/dirs/$f/. $HOME/.$f
    done
  fi
  if [[ ($full = true) ]]; then type='full'; elif [[ ($distro = 'termux') ]]; then type='termux'; else type='lite'; fi
  envar="
# setting variables for installer
export DOTS_TYPE='$type'
export DOTS_LOCATION='$dots'"
  echo $envar >> $HOME/.zshenv
  print 'Finished with dots, checking for new/updated packages'
  dewwit
}

function help () {
  helptext="Usage: ./install.zsh [FLAG] [OPTION]
Install files and programs configured in the config directory.

With no FLAG(s), will try to detect distro and to install if distro is supported.

  -f, --flags <distro>    skips distro checks and installs assuming user provided distro
  -a, --arch              attempts to install assuming distro is Arch Linux
  -d, --debian            attempts to install assuming distro is Debian GNU/Linux
  -t, --termux            attempts to install assuming distro is Android (through Termux)
  -u, --update            updates installed submodules (also accessible from the 'dotphile-update' command
  -h, --help              shows this help

Examples:
  ./install.zsh -f debian
  ./install.zsh --arch
  ./install.zsh --update

Written and provided by 01001100: <https://github.com/winkwonkbitch>"
  print "$helptext"
}

function badopt () {
  print "install.zsh: invalid option -- '$1'
Try './install.zsh --help' for more information."
}

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

# installing Rust and Cargo
function install_cargo () {
  print "Rust doesn't appear to be installed, would you like me to install it for you? (Y/n)"
  read -sq place
  if [[ ($place = 'y') && ($distro != 'termux')  ]]
  then
    print 'Okay, installing Rust'
    if [[ ($distro = 'arch') ]]
    then
      eval $pkgman base-devel
    elif [[ ($distro = 'debian') ]]
    then
      eval $pkgman build-essential
    fi
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    print '\nFinished, continuing installer\n'
    rsh=true
  elif [[ ($place = 'y') && ($distro = 'termux') ]]
  then
    eval $pkgman build-essential rust
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
  elif [[ ($full = false) && ($distro = 'termux') ]]
  then
    if $([ ! -d $HOME/.config ]); then mkdir $HOME/.config; fi
    for f in $(<$dots/configs/tmx.dir)
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

  print '\nSetting environmental variables for future installs'
  if [[ ($full = true) ]]; then type='full'; elif [[ ($distro = 'termux') ]]; then type='termux'; else type='lite'; fi
  envar="
# setting variables for installer
export DOTS_TYPE='$type'
export DOTS_LOCATION='$dots'"
  echo $envar >> $HOME/.zshenv

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

function initial_setup () {
  # checking user
  if [[ ($(whoami) = 'root') && ($force != true) ]]; then print "Don't run as root!" && exit 1; else; fi

  # checking distro
  if [[ (-f /etc/os-release) || ($force = true) ]]
  then
    . /etc/os-release
    if [[ ($force != true) ]]; then distro=$ID; fi
    print "running on $distro"
    if [[ ($distro != 'arch') && ($distro != 'debian') ]]
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
      exit 1
    fi
  elif [[ $(command -v termux-reload-settings) ]]
    then
    distro='termux'
    PRETTY_NAME='Android x64 (through Termux)'
    print "running on $distro"
    full=false
  else
    print 'Unknown/unsupported distro, exiting'
    exit 1
  fi

  # setting variables
  missa=('')
  missc=('')
  rsh=(false)
  dots=$(pwd)
  cargo=('cargo install')
  full=(false)
  if [[ ($distro = 'debian') ]]; then pkgman='sudo apt-get install -y'; elif [[ ($distro = 'arch') ]]; then pkgman='paru -S --noconfirm --needed'; elif [[ ($distro = 'termux') ]]; then pkgman='pkg install -y'; fi
}

function package_setup () {
  # check for installer dependencies
  for f in $(<$dots/configs/dep.pkgs)
  do
    if [[ $(command -v "$f") = "" ]]; then install_$f; fi
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
  elif [[ ($distro = *'termux'*) ]]
  then
    for f in $(<$dots/configs/pkg.pkgs)
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
  elif [[ ($full = false) ]]
  then
    for f in $(<$dots/configs/cargo-lite.pkgs)
    do
      if [[ ($(<$dots/configs/aur-lite.pkgs) != *"$f"*) && ($(eval $cargo --list) != *"$f"*) && ($distro = *'arch'*) ]]
      then
        missc=($f $missc)
      elif [[ ($(<$dots/configs/pkg.pkgs) != *"$f"*) && ($(eval $cargo --list) != *"$f"*) && ($distro = *'termux'*) ]]
      then
        missc=($f $missc)
      elif [[ ($(eval $cargo --list) != *"$f"*) && ($distro != *'arch'*) && ($distro != *'termux'*) ]]
      then
        missc=($f $missc)
      fi
    done
  fi

  # promt user to restart shell session if needed
  if [[ ($rsh = true) ]]; then print 'You now need to log out of your current shell session and log back in before you can run this script again'; exit 0; fi
}

######################################################################

###                        User preferences                        ###

######################################################################

# choose between full and lite installation
function lite () {
  print "Install extra (gui) components? (Y/n)"
  read -sq place
  if [[ ($place = 'y') ]]; then full=true; else full=false; fi
}

# promt to place dotfiles
function dots () {
  if [[ -z "$DOTS_TYPE" ]]
  then
    print 'Do you want me to place all the dotfiles for you? (Y/n)'
    read -sq place
  else
    place='n'
  fi
  if [[ ($ins = 'y') ]]
  then
    install_packages
  elif [[ $place = 'y' ]]
  then
    place_dots
  else
    print 'Nothing to do, exiting'
    exit 0
  fi
}

# promt to install missing packages
function packages () {
  print 'The following packages and/or plugins are missing:' $missa $missc
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

###                             Begin                              ###

######################################################################

# the main attraction
function dewwit () {
  initial_setup
  if [[ ($distro != 'termux') ]]; then lite; fi
  package_setup
  if [[ ($missa = ''  && $missc = '') ]]
  then
    dots
  else
    packages
  fi
}

# handles flags and arguements passed by the user
case "$1" in
  -f | --force) distro="$2" && force=true;;
  -d | --debian) distro='debian' && force=true;;
  -a | --arch) distro='arch' && force=true;;
  -t | --termux) distro='termux' && force=true;;
  -u | --update) dotphile-update && exit 0;;
  -h | --help) help && exit 0;;
  -* | --*) print "install.zsh: invalid option -- '$1'
Try './install.zsh --help' for more information." && exit 0;;
esac

dewwit

######################################################################

###                         End of script                          ###

######################################################################

# this should never run
print 'uh oh, I did a fucky wucky'
exit 1
