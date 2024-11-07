export type matrixType =
  | "cumulative_confirmed"
  | "new_confirmed"
  | "new_deceased";

export interface CoviScopeReq {
  startDate: string;
  endDate: string;
  matrix: matrixType;
  countries: string[];
}

export interface TimeseriesData {
  country: string;
  date: string;
  value: number;
}

export interface CoviScopeRes {
  data: TimeseriesData[];
  error: string;
}

export const countryList = [
  { name: "United States", code: "US" },
  { name: "India", code: "IN" },
  { name: "China", code: "CN" },
  { name: "Netherlands", code: "NL" },
  { name: "Russia", code: "RU" },
  { name: "Rwanda", code: "RW" },
  { name: "Brazil", code: "BR" },
  { name: "Mexico", code: "MX" },
  { name: "Colombia", code: "CO" },
  { name: "Indonesia", code: "ID" },
  { name: "Spain", code: "ES" },
  { name: "Philippines", code: "PE" },
  { name: "Ireland", code: "GB" },
  { name: "Saudi Arabia", code: "SA" },
  { name: "Solomon Islands", code: "SB" },
  { name: "Seychelles", code: "SC" },
  { name: "Sudan", code: "SD" },
  { name: "Slovenia", code: "SI" },
  { name: "Svalbard &", code: "SJ" },
  { name: "Slovakia", code: "SK" },
  { name: "Sierra Leone", code: "SL" },
  { name: "San Marino", code: "SM" },
  { name: "Senegal", code: "SN" },
  { name: "Somalia", code: "SO" },
  { name: "Suriname", code: "SR" },
  { name: "South Sudan", code: "SS" },
  { name: "São Tomé", code: "ST" },
  { name: "El Salvador", code: "SV" },
  { name: "Sint Maarten", code: "SX" },
  { name: "Syria", code: "SY" },
  { name: "Eswatini", code: "SZ" },
  { name: "Tristan da", code: "TA" },
  { name: "Turks &", code: "TC" },
  { name: "Chad", code: "TD" },
  { name: "French Southern", code: "TF" },
  { name: "Togo", code: "TG" },
  { name: "Thailand", code: "TH" },
  { name: "Tajikistan", code: "TJ" },
  { name: "Tokelau", code: "TK" },
  { name: "Timor—Leste", code: "TL" },
  { name: "Turkmenistan", code: "TM" },
  { name: "Tunisia", code: "TN" },
  { name: "Tonga", code: "TO" },
  { name: "Turkey", code: "TR" },
  { name: "Trinidad &", code: "TT" },
  { name: "Tuvalu", code: "TV" },
  { name: "Ukraine", code: "UA" },
  { name: "Uganda", code: "UG" },
  { name: "U.S", code: "UM" },
  { name: "United States", code: "US" },
  { name: "Uruguay", code: "UY" },
  { name: "Uzbekistan", code: "UZ" },
  { name: "Vatican City", code: "VA" },
  { name: "St.", code: "VC" },
  { name: "Venezuela", code: "VE" },
  { name: "British Virgin", code: "VG" },
  { name: "U.S", code: "VI" },
  { name: "Vietnam", code: "VN" },
  { name: "Vanuatu", code: "VU" },
  { name: "Samoa", code: "WS" },
  { name: "Kosovo", code: "XK" },
  { name: "Yemen", code: "YE" },
  { name: "Mayotte", code: "YT" },
  { name: "South Africa", code: "ZA" },
  { name: "Zambia", code: "ZM" },
];

export function getCountryName(gotCode: string): string | undefined {
  return countryList.find((item) => item.code == gotCode)?.name;
}
