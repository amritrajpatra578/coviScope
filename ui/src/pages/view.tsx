import { getCoviScopeData } from "@/api";
import Chart from "@/components/Chart";
import CustomDatePicker from "@/components/CustomDatePicker";
import {
  CoviScopeReq,
  CoviScopeRes,
  matrixType,
  TimeseriesData,
} from "@/defination";
import {
  Box,
  Button,
  Checkbox,
  Container,
  Grid,
  GridItem,
  Heading,
  Select,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Fragment, FunctionComponent, useState } from "react";

const countryList = [
  { name: "United States", code: "US" },
  { name: "India", code: "IN" },
  { name: "China", code: "CN" },
  { name: "Netherlands", code: "NL" },
  { name: "Russia", code: "" },
  { name: "Rwanda", code: "RW" },
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

const ViewPage: FunctionComponent = () => {
  const [state, setState] = useState<CoviScopeReq>({
    startDate: "",
    endDate: "",
    aggregationFunc: "sum",
    matrix: "cumulative_confirmed",
    countries: [],
  });

  const [chartData, setChartData] = useState<uPlot.AlignedData | null>(null);

  const handleStartDateChange = (date: string) => {
    setState({ ...state, startDate: date });
  };

  const handleEndDateChange = (date: string) => {
    setState({ ...state, endDate: date });
  };

  const handleMetricChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setState({ ...state, matrix: event.target.value as matrixType });
  };

  const handleCountryChange = (country: string) => {
    setState((prevState) => {
      const isSelected = prevState.countries.includes(country);
      const newCountries = isSelected
        ? prevState.countries.filter((c) => c !== country) // remove if already selected
        : [...prevState.countries, country]; // add if not selected

      return { ...prevState, countries: newCountries };
    });
  };

  const transformData = (responseData: TimeseriesData[]): uPlot.AlignedData => {
    const dates = responseData.map(
      (item) => new Date(item.date).getTime() / 1000
    );
    const values = responseData.map((item) => item.value);

    return [dates, values]; //[x,y]
  };

  const handleOnClick = () => {
    getCoviScopeData(state)
      .then((res: CoviScopeRes) => {
        if (res.error) {
          console.error("API error:", res.error);
        } else {
          setChartData(transformData(res.data));
        }
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
      });
  };

  return (
    <Fragment>
      <Container maxW="container.xl" p={5}>
        <VStack spacing={6} p={5} align="stretch">
          <Heading as="h1" size="lg" textAlign="center" color="blue.600">
            CoviScope
          </Heading>
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
            <GridItem>
              <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
                <CustomDatePicker
                  label="Select Start Date:"
                  onDateChange={handleStartDateChange}
                />
              </Box>
            </GridItem>

            <GridItem>
              <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
                <CustomDatePicker
                  label="Select End Date:"
                  onDateChange={handleEndDateChange}
                />
              </Box>
            </GridItem>
          </Grid>
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
            <GridItem>
              <Box
                w="100%"
                p={5}
                shadow="md"
                borderWidth="1px"
                borderRadius="md"
              >
                <Text mb={2} fontSize="lg" fontWeight="bold">
                  Select Countries:
                </Text>
                <Text mb={2} fontSize="small" fontWeight="thin">
                  If no country is selected, data for all countries will be
                  displayed.
                </Text>
                <Box
                  maxH="200px"
                  overflowY="auto"
                  p={2}
                  borderWidth="1px"
                  borderRadius="md"
                >
                  <VStack align="flex-start" spacing={2}>
                    {countryList.map(({ name, code }) => (
                      <Checkbox
                        key={code}
                        isChecked={state.countries.includes(code)}
                        onChange={() => handleCountryChange(code)}
                        colorScheme="blue"
                      >
                        {name}
                      </Checkbox>
                    ))}
                  </VStack>
                </Box>
              </Box>
            </GridItem>

            <GridItem>
              <Box
                w="100%"
                p={5}
                shadow="md"
                borderWidth="1px"
                borderRadius="md"
              >
                <Text mb={2} fontSize="lg" fontWeight="bold">
                  Select Metric:
                </Text>
                <Select value={state.matrix} onChange={handleMetricChange}>
                  <option value="new_confirmed">New Cases</option>
                  <option value="new_deceased">Deaths</option>
                  <option value="cumulative_confirmed">Total Cases</option>
                </Select>
              </Box>
            </GridItem>
          </Grid>
          <Button
            colorScheme="blue"
            onClick={handleOnClick}
            mt={4}
            alignSelf="center"
          >
            Fetch Data
          </Button>
          {chartData && <Chart data={chartData} />}
        </VStack>
      </Container>
    </Fragment>
  );
};

export default ViewPage;
