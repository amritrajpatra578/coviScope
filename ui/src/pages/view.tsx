import { getCoviScopeData } from "@/api";
import Chart, { ChartProps } from "@/components/Chart";
import CustomDatePicker from "@/components/CustomDatePicker";
import {
  countryList,
  CoviScopeReq,
  CoviScopeRes,
  matrixType,
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

const ViewPage: FunctionComponent = () => {
  const [state, setState] = useState<CoviScopeReq>({
    startDate: "",
    endDate: "",
    matrix: "cumulative_confirmed",
    countries: [],
  });

  const [chartData, setChartData] = useState<ChartProps>({
    data: [],
    matrix: "new_confirmed",
  });

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

  const handleOnClick = () => {
    getCoviScopeData(state)
      .then((res: CoviScopeRes) => {
        if (res.error) {
          console.error("API error:", res.error);
        } else {
          setChartData({
            data: res.data,
            matrix: state.matrix,
          });
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
                  If no country is selected, data for top 10 countries will be
                  displayed based on matric value.
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
          {chartData && (
            <Chart data={chartData.data} matrix={chartData.matrix} />
          )}
        </VStack>
      </Container>
    </Fragment>
  );
};

export default ViewPage;
