# CoviScope

Putting Covid-19 into scope

A React-based application that visualizes COVID-19 timeseries data, allowing users to track and analyze cases, new cases, and deaths across multiple countries. The frontend uses Next.js with TypeScript and Chakra UI for styling, while the backend is a Go-based REST API that provides filtered and aggregated data from a ClickHouse COVID-19 dataset(https://clickhouse.com/docs/en/getting-started/example-datasets/covid19).

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Setup and Installation](#setup-and-installation)
- [Usage](#usage)
- [Components Overview](#components-overview)
- [API Details](#api-details)
- [Technologies Used](#technologies-used)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Dynamic Line Charts**: Displays COVID-19 cases, new cases, or deaths for selected countries over a specified time range.
- **Country and Date Filtering**: Select one or more countries and a date range to filter data.
- **Metric Selection**: Choose between cumulative cases, new cases, or deaths.
- **Zoom and Tooltip**: Charts support zoom functionality and tooltips for data points, powered by the uPlot library.

## Project Structure

## Setup and Installation

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/your-username/covid-19-visualization.git
   cd covid-19-visualization
   ```

2. **Install Dependencies**:

   ```bash
   # Frontend dependencies
   npm install

   # Backend dependencies (in case of separate backend repo)
   cd backend
   go mod download
   ```

3. **Environment Configuration**:

   - Set up environment variables for API endpoints if necessary in `.env.local`.

4. **Run the Application**:

   - **Frontend**: In the main project directory:
     npm run dev

   - **Backend**: Start the Go server:
     go run main.go

5. **Access the Application**:
   - Visit `http://localhost:8000` in your browser to access the app.

## Usage

1. Select a **start date** and an **end date** using the date picker.
2. Choose one or more **countries** from the country list.
3. Select a **metric** (New Cases, Deaths, or Cases) from the dropdown.
4. Click the **Fetch Data** button to retrieve and display data.
5. View the data visualization in the interactive line chart.

## Components Overview

- **ViewPage**: The main page of the app, where users select dates, countries, and metrics to filter COVID-19 data.
- **Chart**: A line chart component built with uPlot that visualizes the filtered COVID-19 timeseries data.
- **CustomDatePicker**: A date picker component for selecting start and end dates.

## API Details

The application fetches data from a Go-based REST API that queries a ClickHouse COVID-19 dataset. The API allows filtering by:

- **Date Range**: Start and end dates to filter the timeseries data.
- **Country**: Country codes to narrow down data by selected countries.
- **Metric**: Types of data to retrieve (cases, new cases, deaths).

### API Request Structure

- **Endpoint**: `/api/coviscope`
- **Request Body**:
  ```json
  {
    "startDate": "YYYY-MM-DD",
    "endDate": "YYYY-MM-DD",
    "aggregationFunc": "sum",
    "matrix": "cumulative_confirmed",
    "countries": ["US", "IN", "CN"]
  }
  ```
