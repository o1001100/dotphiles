// List of valid Play Store languages (used for dropdown menu)
// Source: https://support.google.com/googleplay/android-developer/table/4419860?hl=en
const storeLanguages = [
    ["Afrikaans", "af"],
    ["Amharic", "am"],
    ["Bulgarian", "bg"],
    ["Catalan", "ca"],
    ["Chinese (Hong Kong)", "zh-HK"],
    ["Chinese (PRC)", "zh-CN"],
    ["Chinese (Taiwan)", "zh-TW"],
    ["Croatian", "hr"],
    ["Czech", "cs"],
    ["Danish", "da"],
    ["Dutch", "nl"],
    ["English (UK)", "en-GB"],
    ["English (US)", "en-US"],
    ["Estonian", "et"],
    ["Filipino", "fil"],
    ["Finnish", "fi"],
    ["French (Canada)", "fr-CA"],
    ["French (France)", "fr-FR"],
    ["German", "de"],
    ["Greek", "el"],
    ["Hebrew", "he"],
    ["Hindi", "hi"],
    ["Hungarian", "hu"],
    ["Icelandic", "is"],
    ["Indonesian", "id"],
    ["Italian", "it"],
    ["Japanese", "ja"],
    ["Korean", "ko"],
    ["Latvian", "lv"],
    ["Lithuanian", "lt"],
    ["Malay", "ms"],
    ["Norwegian", "no"],
    ["Polish", "pl"],
    ["Portuguese (Brazil)", "pt-BR"],
    ["Portuguese (Portugal)", "pt-PT"],
    ["Romanian", "ro"],
    ["Russian", "ru"],
    ["Serbian", "sr"],
    ["Slovak", "sk"],
    ["Slovenian", "sl"],
    ["Spanish (Latin America)", "es-419"],
    ["Spanish (Spain)", "es-ES"],
    ["Swahili", "sw"],
    ["Swedish", "sv"],
    ["Thai", "th"],
    ["Turkish", "tr"],
    ["Ukrainian", "uk"],
    ["Vietnamese", "vi"],
    ["Zulu", "zu"]
]

// List of valid Play Store countries
// Source: https://stackoverflow.com/a/38178785
const storeRegions = [
    [
        "Albania",
        "al"
    ],
    [
        "Algeria",
        "dz"
    ],
    [
        "Angola",
        "ao"
    ],
    [
        "Antigua and Barbuda",
        "ag"
    ],
    [
        "Argentina",
        "ar"
    ],
    [
        "Armenia",
        "am"
    ],
    [
        "Aruba",
        "aw"
    ],
    [
        "Australia",
        "au"
    ],
    [
        "Austria",
        "at"
    ],
    [
        "Azerbaijan",
        "az"
    ],
    [
        "Bahamas",
        "bs"
    ],
    [
        "Bahrain",
        "bh"
    ],
    [
        "Bangladesh",
        "bd"
    ],
    [
        "Belarus",
        "by"
    ],
    [
        "Belgium",
        "be"
    ],
    [
        "Belize",
        "bz"
    ],
    [
        "Benin",
        "bj"
    ],
    [
        "Bolivia",
        "bo"
    ],
    [
        "Bosnia and Herzegovina",
        "ba"
    ],
    [
        "Botswana",
        "bw"
    ],
    [
        "Brazil",
        "br"
    ],
    [
        "Bulgaria",
        "bg"
    ],
    [
        "Burkina",
        "bf"
    ],
    [
        "Cambodia",
        "kh"
    ],
    [
        "Cameroon",
        "cm"
    ],
    [
        "Canada",
        "ca"
    ],
    [
        "Cape Verde",
        "cv"
    ],
    [
        "Chile",
        "cl"
    ],
    [
        "Colombia",
        "co"
    ],
    [
        "Costa Rica",
        "cr"
    ],
    [
        "Cote d' Ivore",
        "ci"
    ],
    [
        "Croatia",
        "hr"
    ],
    [
        "Cyprus",
        "cy"
    ],
    [
        "Czech Republic",
        "cz"
    ],
    [
        "Denmark",
        "dk"
    ],
    [
        "Dominican Republic",
        "do"
    ],
    [
        "Ecuador",
        "ec"
    ],
    [
        "Egypt",
        "eg"
    ],
    [
        "El Salvador",
        "sv"
    ],
    [
        "Estonia",
        "ee"
    ],
    [
        "Fiji",
        "fj"
    ],
    [
        "Finland",
        "fi"
    ],
    [
        "France",
        "fr"
    ],
    [
        "Gabon",
        "ga"
    ],
    [
        "Germany",
        "de"
    ],
    [
        "Ghana",
        "gh"
    ],
    [
        "Greece",
        "gr"
    ],
    [
        "Guatemala",
        "gt"
    ],
    [
        "Guinea-Bissau",
        "gw"
    ],
    [
        "Haiti",
        "ht"
    ],
    [
        "Honduras",
        "hn"
    ],
    [
        "Hong Kong",
        "hk"
    ],
    [
        "Hungary",
        "hu"
    ],
    [
        "Iceland",
        "is"
    ],
    [
        "India",
        "in"
    ],
    [
        "Indonesia",
        "id"
    ],
    [
        "Ireland",
        "ie"
    ],
    [
        "Israel",
        "il"
    ],
    [
        "Italy",
        "it"
    ],
    [
        "Jamaica",
        "jm"
    ],
    [
        "Japan",
        "jp"
    ],
    [
        "Jordan",
        "jo"
    ],
    [
        "Kazakhstan",
        "kz"
    ],
    [
        "Kenya",
        "ke"
    ],
    [
        "Kuwait",
        "kw"
    ],
    [
        "Kyrgyzstan",
        "kg"
    ],
    [
        "Laos",
        "la"
    ],
    [
        "Latvia",
        "lv"
    ],
    [
        "Lebanon",
        "lb"
    ],
    [
        "Liechtenstein",
        "li"
    ],
    [
        "Lithuania",
        "lt"
    ],
    [
        "Luxembourg",
        "lu"
    ],
    [
        "Macedonia",
        "mk"
    ],
    [
        "Malaysia",
        "my"
    ],
    [
        "Mali",
        "ml"
    ],
    [
        "Malta",
        "mt"
    ],
    [
        "Mauritius",
        "mu"
    ],
    [
        "Mexico",
        "mx"
    ],
    [
        "Moldova",
        "md"
    ],
    [
        "Morocco",
        "ma"
    ],
    [
        "Mozambique",
        "mz"
    ],
    [
        "Namibia",
        "na"
    ],
    [
        "Nepal",
        "np"
    ],
    [
        "Netherlands",
        "nl"
    ],
    [
        "Netherlands Antilles",
        "an"
    ],
    [
        "New Zealand",
        "nz"
    ],
    [
        "Nicaragua",
        "ni"
    ],
    [
        "Niger",
        "ne"
    ],
    [
        "Nigeria",
        "ng"
    ],
    [
        "Norway",
        "no"
    ],
    [
        "Oman",
        "om"
    ],
    [
        "Pakistan",
        "pk"
    ],
    [
        "Panama",
        "pa"
    ],
    [
        "Papua New Guinea",
        "pg"
    ],
    [
        "Paraguay",
        "py"
    ],
    [
        "Peru",
        "pe"
    ],
    [
        "Philippines",
        "ph"
    ],
    [
        "Poland",
        "pl"
    ],
    [
        "Portugal",
        "pt"
    ],
    [
        "Qatar",
        "qa"
    ],
    [
        "Romania",
        "ro"
    ],
    [
        "Russia",
        "ru"
    ],
    [
        "Rwanda",
        "rw"
    ],
    [
        "Saudi Arabia",
        "sa"
    ],
    [
        "Senegal",
        "sn"
    ],
    [
        "Serbia",
        "rs"
    ],
    [
        "Singapore",
        "sg"
    ],
    [
        "Slovakia",
        "sk"
    ],
    [
        "Slovenia",
        "si"
    ],
    [
        "South Africa",
        "za"
    ],
    [
        "South Korea",
        "kr"
    ],
    [
        "Spain",
        "es"
    ],
    [
        "Sri Lanka",
        "lk"
    ],
    [
        "Sweden",
        "se"
    ],
    [
        "Switzerland",
        "ch"
    ],
    [
        "Taiwan",
        "tw"
    ],
    [
        "Tajikistan",
        "tj"
    ],
    [
        "Tanzania",
        "tz"
    ],
    [
        "Thailand",
        "th"
    ],
    [
        "Togo",
        "tg"
    ],
    [
        "Trinidad and Tobago",
        "tt"
    ],
    [
        "Tunisia",
        "tn"
    ],
    [
        "Turkey",
        "tr"
    ],
    [
        "Turkmenistan",
        "tm"
    ],
    [
        "Uganda",
        "ug"
    ],
    [
        "Ukraine",
        "ua"
    ],
    [
        "United Arab Emirates",
        "ae"
    ],
    [
        "United Kingdom",
        "gb"
    ],
    [
        "United States",
        "us"
    ],
    [
        "Uruguay",
        "uy"
    ],
    [
        "Uzbekistan",
        "uz"
    ],
    [
        "Venezuela",
        "ve"
    ],
    [
        "Vietnam",
        "vn"
    ],
    [
        "Yemen",
        "ye"
    ],
    [
        "Zambia",
        "zm"
    ],
    [
        "Zimbabwe",
        "zw"
    ]
]