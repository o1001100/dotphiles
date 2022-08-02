#!/bin/zsh

fonts_dir="${HOME}/.local/share/fonts"
if [ ! -d "${fonts_dir}" ]; then
    echo "mkdir -p $fonts_dir"
    mkdir -p "${fonts_dir}"
else
    echo "Found fonts dir $fonts_dir"
fi

curl --fail --location --show-error https://github.com/ryanoasis/nerd-fonts/releases/download/2.2.0-RC/FiraCode.zip --output FiraCode.zip
unzip -o -q -d ${fonts_dir} FiraCode.zip
rm FiraCode.zip

echo "fc-cache -f"
fc-cache -f
