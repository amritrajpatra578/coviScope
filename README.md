# CoviScope

Putting Covid-19 into scope

A React-based application that visualizes COVID-19 timeseries data, allowing users to track and analyze cases, new cases, and deaths across multiple countries. The frontend uses Next.js with TypeScript and Chakra UI for styling, while the backend is a Go-based REST API that provides filtered and aggregated data from a ClickHouse COVID-19 dataset(https://clickhouse.com/docs/en/getting-started/example-datasets/covid19).

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Setup and Installation](#setup-and-installation)
- [Usage](#usage)
- [Technologies Used](#technologies-used)

## Features

- **Dynamic Line Charts**: Displays COVID-19 cases, new cases, or deaths for selected countries over a specified time range.
- **Country and Date Filtering**: Select one or more countries and a date range to filter data.
- **Metric Selection**: Choose between cumulative cases, new cases, or deaths.
- **Zoom and Tooltip**: Charts support zoom functionality and tooltips for data points, powered by the uPlot library.

## Setup and Installation

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/your-username/covid-19-visualization.git
   cd covid-19-visualization
   ```

2. **Setup Clickhouse as Project's Datasource**:

- **Download the binary**

  ```bash
  # To run clikhouse natively
  curl https://clickhouse.com/ | sh
  ```

- **Start the server**

  ```bash
  ./clickhouse server
  ```

- **Start the client**

  ```bash
  ./clickhouse client
  ```

- **Follow for next step**
  https://clickhouse.com/docs/en/getting-started/example-datasets/covid19

3. **Install Dependencies**:

   ```bash
   # Frontend dependencies
   yarn install

   # Backend dependencies
   go mod tidy
   ```

4. **Run the Application**:

   - **Frontend**: In the main project directory:
     yarn dev

   - **Backend**: Start the Go server:
     go run .

5. **Access the Application**:
   - Visit `http://localhost:8000` in your browser to access the app.

## Usage

1. Select a **start date** and an **end date** using the date picker.
2. Choose one or more **countries** from the country list.
3. Select a **metric** (New Cases, Deaths, or Cases) from the dropdown.
4. Click the **Fetch Data** button to retrieve and display data.
5. View the data visualization in the interactive line chart.

## Technologies Used

1. **Frontend**:
   Next.js, TypeScript, Chakra UI, uPlot.

2. **Backend**:
   Go, ClickHouse as database.
