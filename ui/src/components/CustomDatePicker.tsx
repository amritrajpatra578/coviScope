import React, { useState } from "react";
import { FormControl, FormLabel, Input, Text } from "@chakra-ui/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";

interface CustomDatePickerProps {
  label: string;
  onDateChange: (date: string) => void;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  label,
  onDateChange,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    if (date) {
      const formattedDate = moment(date).format("YYYY-MM-DD");
      onDateChange(formattedDate);
    }
  };

  return (
    <FormControl>
      <FormLabel>
        {
          <Text mb={2} fontSize="large" fontWeight="bold">
            {label}
          </Text>
        }
      </FormLabel>
      <DatePicker
        selected={selectedDate}
        onChange={handleDateChange}
        dateFormat="dd/MM/yyyy"
        customInput={<Input placeholder="Select date" />}
      />
    </FormControl>
  );
};

export default CustomDatePicker;
