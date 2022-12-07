#!/bin/zsh

function title () {
  export lcommit=`git log -1`
  printf '%.s─' $(seq 1 $(tput cols))
  echo "\n     _       _         _     _ _                "
  echo "    | |     | |       | |   (_) |                 "
  echo "  __| | ___ | |_ _ __ | |__  _| | ___  ___        "
  echo " / _  |/ _ \| __| '_ \| '_ \| | |/ _ \/ __|       "
  echo "| (_| | (_) | |_| |_) | | | | | |  __/\__ \       "
  echo " \__,_|\___/ \__| .__/|_| |_|_|_|\___||___/       "
  echo "                 | |                              "
  echo "                 |_|      Running on: $PRETTY_NAME"
  echo "\n\nLatest Commit:"
  echo $lcommit"\n"
  printf '%.s─' $(seq 1 $(tput cols))
  echo "\n"
}

function dotphile_update () {
  if [[ -z "$DOTS_TYPE" ]]
  then
    print "Couldn't find your installation, please check that it has been installed properly and try again"
    exit 1
  else
    print 'Collecting updates\n'
  fi
  #dots=$DOTS_LOCATION
  cd $dots && git pull --recurse-submodules
  print "Found install type, updating your installation"
  for f in $(<$dots/configs/serve.dir)
  do
    rsync -crvl $dots/dirs/$f/. $HOME/.$f
  done
  rsync -crvl $dots/dirs/.zpreztorc $HOME/.config/zsh/.zpreztorc
  envar="
# setting variables for installer
export DOTS_TYPE='serve'
export DOTS_LOCATION='$dots'"
  echo $envar >> $HOME/.zshenv
  print '\nFinished with dots, checking for new/updated packages\n'
  return
}

function help () {
  helptext="Usage: ./install.zsh [FLAG] [OPTION]
Install files and programs configured in the config directory.

With no FLAG(s), will try to detect distro and to install if distro is supported.

  -f, --force             skips checks and installs anyway
  -u, --update            updates installed submodules (also accessible from the 'dotphile-update' command
  -h, --help              shows this help

Examples:
  ./install.zsh -f
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

# installing Rust and Cargo
function install_cargo () {
  print "Rust doesn't appear to be installed, would you like me to install it for you? (Y/n)"
  read -sq place
  if [[ ($place = 'y') ]]
  then
    print 'Okay, installing Rust'
    eval $pkgman build-essential
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    print '\nFinished, continuing installer\n'
    rsh=true
  else
    print 'Okay buddy'
    exit 0
  fi
}

# placing dotfiles
function place_dots () {
  print '\n Setting up directories and placing files'
  for f in $(<$dots/configs/serve.dir)
  do
    if $([ ! -d $HOME/.$f ]); then mkdir -p $HOME/.$f; fi
    rsync -crvl $dots/dirs/$f/. $HOME/.$f
  done
  rsync -crvl $dots/dirs/.zpreztorc $HOME/.config/zsh/.zpreztorc
  print '\nSymlinking ZSH config'
  if $([ -f $HOME/.zshenv ]); then rm -v $HOME/.zshenv; fi
  if $([ ! -f $HOME/.zshenv ]); then ln -sv $HOME/.config/zsh/.zshenv $HOME/.zshenv; fi

  print '\nSetting environmental variables for future installs'
  type='serve'
  envar="
# setting variables for installer
export DOTS_TYPE='serve'
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
    if [[ ($missa = *"tailscale"*) ]]; then curl -fsSL https://pkgs.tailscale.com/stable/debian/sid.noarmor.gpg | sudo tee /usr/share/keyrings/tailscale-archive-keyring.gpg >/dev/null && curl -fsSL https://pkgs.tailscale.com/stable/debian/sid.tailscale-keyring.list | sudo tee /etc/apt/sources.list.d/tailscale.list && sudo apt-get update; fi
    if [[ ($missa = *"docker"*) ]]; then curl -sSL https://get.docker.com/ | sudo sh; fi
    eval $pkgman $missa
    if [[ ($missa = *"tailscale"*) ]]; then 
      echo 'net.ipv4.ip_forward = 1' | sudo tee -a /etc/sysctl.conf
      echo 'net.ipv6.conf.all.forwarding = 1' | sudo tee -a /etc/sysctl.conf
      sudo sysctl -p /etc/sysctl.conf
      sudo tailscale up --advertise-exit-node --ssh
      sudo systemctl enable --now tailscaled
    fi
    if [[ ($missa = *"docker"* ) ]]; then sudo usermod -aG docker $(whoami); fi
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
  fi
}

# updating packages
function pkg_update () {
  print '\nUpdating all installed packages'
  print '\nUpdating all packages installed with APT'
  sudo apt-get update && sudo apt-get full-upgrade
  print '\nUpdating all packages installed with Cargo'
  cargo install-update -a
  print 'Everything should now be up to date, exiting'
  exit 0
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
    if [[ ($distro != 'debian') ]]
    then
      print 'This installer is intended for use on a server and currently only supports Debian Linux'
      print "Distro detected: $PRETTY_NAME"
      print 'The script will now exit, please try again on a supported distro or install manually'
      exit 1
    elif [[ ($distro = *'debian'*) && ($PRETTY_NAME != *'bullseye'*) ]]
    then
      print 'This script is intended for use on a server and currently only supports Debian Bullseye (stable)'
      print "Version detected: $PRETTY_NAME"
      print 'The script will now exit, please try again on a supported version or install manually'
      exit 1
    fi
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
  pkgman='sudo apt-get install -y'
}

function package_setup () {
  # check for installer dependencies
  for f in $(<$dots/configs/dep.pkgs)
  do
    if [[ $(command -v "$f") = "" ]]; then install_$f; fi
  done

  # check for packages in distro package manager
  for f in $(<$dots/configs/apt.pkgs)
  do
    if [[ $(dpkg --get-selections | grep -v deinstall) != *"$f"* ]]; then missa=($f $missa); fi
  done

  # check for cargo packages
  for f in $(<$dots/configs/cargo.pkgs)
  do
    if [[ ($(eval $cargo --list) != *"$f"*) ]]
    then
      missc=($f $missc)
    fi
  done

  # promt user to restart shell session if needed
  if [[ ($rsh = true) ]]; then print 'You now need to log out of your current shell session and log back in before you can run this script again'; exit 0; fi
}

######################################################################

###                        User preferences                        ###

######################################################################

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
  title
  package_setup
  if [[ ($missa = '' && $missc = '') ]]
  then
    dots
  else
    packages
    print 'Finished, terminating installer'
    exit 0
  fi
}

function dewupdate () {
  initial_setup
  title
  dotphile_update
  package_setup
  if [[ ($missa = '' && $missc = '') ]]
  then
    print 'No new packages to install, would you like to update all installed packages? (Y/n)'
    read -sq place
    if [[ ($place = 'y') ]]; then pkg_update; else print 'Okay, exiting' && exit 0; fi
  else
    packages
    print '\nWould you like to update all installed packages? (Y/n)'
    read -sq place
    if [[ ($place = 'y') ]]; then pkg_update; exit 0; else print 'Okay, exiting'; exit 0; fi
  fi
}

# handles flags and arguements passed by the user
case "$1" in
  -f | --force) distro="$2" && force=true;;
  -d | --debian) distro='debian' && force=true;;
  -a | --arch) distro='arch' && force=true;;
  -t | --termux) distro='termux' && force=true;;
  -u | --update) dewupdate && exit 0;;
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
