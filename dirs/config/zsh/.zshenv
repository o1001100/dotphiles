# set XDG_CONFIG_HOME if not already
if $([ -z "$XDG_CONFIG_HOME" ])
then
        export XDG_CONFIG_HOME="$HOME/.config"
fi

# set ZDOTDIR if location exists
if $([ -d "$XDG_CONFIG_HOME/zsh" ])
then
        export ZDOTDIR="$XDG_CONFIG_HOME/zsh"
fi

# Ensure that a non-login, non-interactive shell has a defined environment.
if [[ ( "$SHLVL" -eq 1 && ! -o LOGIN ) && -s "${ZDOTDIR:-$HOME}/.zprofile" ]]; then
  source "${ZDOTDIR:-$HOME}/.zprofile"
fi

# set histfile location
export HISTFILE="$ZDOTDIR/history"

# set default editors
if [[ -z "$EDITOR" ]]; then
  export EDITOR='nano'
fi
if [[ -z "$VISUAL" ]]; then
  export VISUAL='nano'
fi
if [[ -z "$PAGER" ]]; then
  export PAGER='bat'
fi

# source cargo
if $([ -f "$HOME/.cargo/env" ])
then
  source "$HOME/.cargo/env"
fi

# set rust tmp location
if [[ -d "$HOME/.cargo/tmp" ]]; then
  export CARGO_TARGET_DIR="$HOME/.cargo/tmp"
else
  mkdir "$HOME/.cargo/tmp"
  export CARGO_TARGET_DIR="$HOME/.cargo/tmp"
fi
