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

# set histfile location
export HISTFILE="$ZDOTDIR/history"

# cargo
. "$HOME/.cargo/env"
