/* eslint-disable no-nested-ternary */
import axios from 'axios';
/* eslint-disable jsx-a11y/label-has-associated-control */
import { useRef, useState, useEffect } from 'react';

import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Rating from '@mui/material/Rating';
import Snackbar from '@mui/material/Snackbar';
import SendIcon from '@mui/icons-material/Send';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import ButtonGroup from '@mui/material/ButtonGroup';
import Autocomplete from '@mui/material/Autocomplete';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import './styleByMe.css';
import CameraCapture from './camera';
import dataLists from './dataLists.json';

const serverPath = `http://localhost:8000`;

export default function InsertDataView() {
  const [insertData, setInsertData] = useState({
    dateDive: '',
    timeDive: '',
    site: '',
    objectGroup: '',
    specie: '',
    file: '',
    imgLocation: '',
    uploadeImage: '',
    arReef: '',
    reportType: '',
    typeOfDive: '',
    rank: '',
    userDescription: '',
    maxDepth: '',
    distance: '',
    temp: '',
    errors: {
      dateDive: false,
      site: false,
      objectGroup: false,
      reportType: false,
      file: false,
      rank: false,
      maxDepth: false,
      distance: false,
      temp: false,
      uploadeImage: false,
    },
  });

  const [diveCode, setDiveCode] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedReef, setSelectedReef] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const fileInputRef = useRef(null);
  const [currentView, setCurrentView] = useState(imagePreview ? 'image' : 'placeholder');

  const handleViewChange = () => {
    setCurrentView(currentView === 'image' ? 'camera' : 'image');
  };
  // Log environment variables
  console.log('Cloudinary Cloud Name:', process.env.REACT_APP_CLOUDINARY_CLOUD_NAME);
  console.log('Cloudinary API Key:', process.env.REACT_APP_CLOUDINARY_KEY);
  console.log('Cloudinary API Secret:', process.env.REACT_APP_CLOUDINARY_API_SECRET);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${serverPath}/api/dives`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const responseData = await response.json();
        const { dives } = responseData.data;

        const numericDiveCodes = dives
          .map((dive) => dive.diveCode)
          .filter((code) => !Number.isNaN(parseInt(code, 10)));

        let newDiveCode;
        if (numericDiveCodes.length === 0) {
          newDiveCode = 0;
        } else {
          const lastDiveCode = Math.max(...numericDiveCodes);
          newDiveCode = lastDiveCode + 1;
        }

        setDiveCode(newDiveCode); // Set the state with the new dive code
      } catch (error) {
        console.error('Error fetching documents:', error.message);
      }
    };

    fetchData();
  }, []);

  // Update button states when selectedTime or selectedReef changes
  useEffect(() => {
    setInsertData((prevData) => ({
      ...prevData,
      timeDive: selectedTime,
      arReef: selectedReef,
    }));
  }, [selectedTime, selectedReef]);

  // Function to upload image to Cloudinary and get the URL
  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'ecoral_preset'); 

    try {

      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`,
        formData
      );
      return response.data.secure_url;
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      return null;
    }
  };

  const onSelectFile = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = await uploadToCloudinary(file);
      if (imageUrl) {
        setImagePreview(imageUrl);
        setInsertData((prevData) => ({
          ...prevData,
          file: imageUrl,
        }));
      } else {
        setImagePreview(null);
      }
    } else {
      setImagePreview(null);
    }
  };

  const sendImage = (image) => {
    setImagePreview(image);
    setInsertData((prevData) => ({
      ...prevData,
      file: image,
    }));
  };

  const handleRankChange = (event, newValue) => {
    // Update the rank value in the insertData state
    setInsertData((prevData) => ({
      ...prevData,
      rank: newValue,
    }));
  };

  const handleDateChange = (date) => {
    const isValidYear = isAppropriateDate(date);
    if (!isValidYear) {
      // Mark the date as invalid
      setInsertData((prevFormData) => ({
        ...prevFormData,
        errors: {
          ...prevFormData.errors,
          dateDive: true, // Corrected from birthDate to diveDate
        },
      }));
      setSelectedDate(date);
      return;
    }
    // Update the form data with the valid dive date
    setInsertData((prevFormData) => ({
      ...prevFormData,
      dateDive: date,
      errors: {
        ...prevFormData.errors,
        dateDive: false, // Corrected from birthDate to diveDate
      },
    }));
  };

  function isAppropriateDate(diveDate) {
    const today = new Date();

    // Extracting the year, month, and day from the diveDate
    const diveYear = diveDate.$y;
    const diveMonth = diveDate.$M;
    const diveDay = diveDate.$D;

    // Extracting the year, month, and day from today's date
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const currentDay = today.getDate();

    // Check if the dive date is not older than January 1, 2014, and not later than today
    return (
      diveYear >= 2014 && // Check if the year of the dive date is greater than or equal to 2014
      (diveYear < currentYear || // Check if the dive year is less than the current year
        (diveYear === currentYear && diveMonth < currentMonth) || // Or if it's the same year but the month is less than the current month
        (diveYear === currentYear && diveMonth === currentMonth && diveDay <= currentDay)) // Or if it's the same year and month but the day is less than or equal to the current day
    );
  }

  const timeButtons = ['Light', 'Night'];

  const isArButtonGroup = ['Yes', 'No', 'Maybe'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let isValid = true;

    // Regular expression to match only numeric values
    const numericRegex = /^[0-9]*$/;

    // Check if the input value matches the numeric regex
    if (!numericRegex.test(value)) {
      // If the input value doesn't match, set isValid to false
      isValid = false;
    }

    // Update the state with the input value and validity
    setInsertData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
      errors: {
        ...prevFormData.errors,
        [name]: !isValid,
      },
    }));
  };

  const handleAutocompleteChange = (name, value) => {
    setInsertData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleButtonClick = (value, group) => {
    if (group === 'time') {
      setSelectedTime(value === selectedTime ? null : value);
      // Update the timeDive value in the insertData state
      setInsertData((prevData) => ({
        ...prevData,
        timeDive: value,
      }));
    } else if (group === 'reef') {
      setSelectedReef(value === selectedReef ? null : value);
      // Update the arReef value in the insertData state
      setInsertData((prevData) => ({
        ...prevData,
        arReef: value,
      }));
    }
  };

  const handleTextareaChange = (value) => {
    // Update the state with the value of the textarea
    setInsertData((prevData) => ({
      ...prevData,
      userDescription: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent default form submission behavior

    const userJsonString = localStorage.getItem('user');
    const user = JSON.parse(userJsonString.replace(/^"(.*)"$/, '$1'));
    // Extracting age from birth date
    const birthDate = new Date(user.birthDate);
    const currentDate = new Date();
    let age = currentDate.getFullYear() - birthDate.getFullYear();
    if (currentDate.getMonth() > birthDate.getMonth()) age += 1;
    // Retrieving gender
    const { gender } = user;

    const entireDivingData = {
      diveCode,
      date: insertData.dateDive,
      time: insertData.timeDive,
      diveSite: insertData.site,
      objectGroup: insertData.objectGroup,
      specie: insertData.specie,
      file: insertData.file,
      imageLocation: insertData.imgLocation,
      uploadeImage: insertData.uploadeImage,
      AR: insertData.arReef,
      reportType: insertData.reportType,
      typeOfDive: insertData.typeOfDive,
      rankOfDive: insertData.rank,
      userDescription: insertData.userDescription,
      maxDepth: insertData.maxDepth,
      distance: insertData.distance,
      temp: insertData.temp,
      age,
      gender,
      media: 'Website',
      documentation: 'P',
    };

    // Check if the Date Of Dive field is empty
    if (!insertData.dateDive) {
      // Set error for Date Of Dive field
      setInsertData((prevFormData) => ({
        ...prevFormData,
        errors: {
          ...prevFormData.errors,
          dateDive: true,
        },
      }));
      // Return to prevent further processing
      return;
    }

    // Check if any errors are true
    const hasErrors = Object.values(insertData.errors).some((error) => error);

    // If any error is true, return without saving the data
    if (hasErrors) {
      console.log('There are errors in the form. Data not saved.');
      return;
    }

    try {
      // Send form data to the server
      const response = await fetch('http://localhost:8000/api/pendings_dives', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify(entireDivingData),
      });

      if (response.ok) {
        setOpenSnackbar(true);
        setTimeout(() => {
          window.location.reload();
        }, 2500);

        // Reset form data after successful submission
        setInsertData({
          dateDive: '',
          timeDive: '',
          site: '',
          objectGroup: '',
          specie: '',
          file: '',
          imgLocation: '',
          uploadeImage: '',
          arReef: '',
          reportType: '',
          typeOfDive: '',
          rank: '',
          userDescription: '',
          maxDepth: '',
          distance: '',
          temp: '',
          errors: {
            dateDive: false,
            site: false,
            objectGroup: false,
            reportType: false,
            file: false,
            rank: false,
            maxDepth: false,
            distance: false,
            temp: false,
            uploadeImage: false,
          },
        });
      } else {
        console.error('Failed to save data:', response.statusText);
      }
    } catch (error) {
      console.error('Error saving data:', error.message);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  return (
    <div className="container">
      <h2>Input the details from your recents dives</h2>

      <form onSubmit={handleSubmit}>
        <br />
        <div className="twoInLine">
          <Autocomplete
            options={dataLists.diveSite}
            // specifies how to render the options in the dropdown list - returns the option itself
            getOptionLabel={(option) => option}
            onChange={(e, value) => handleAutocompleteChange('site', value || '')}
            renderInput={(params) => (
              <TextField
                {...params}
                required
                label="Dive Site"
                name="site"
                autoComplete="site"
                className="fieldInput"
              />
            )}
          />

          <Autocomplete
            options={dataLists.objectGroupList}
            getOptionLabel={(option) => option}
            onChange={(e, value) => handleAutocompleteChange('objectGroup', value || '')}
            renderInput={(params) => (
              <TextField
                {...params}
                required
                label="Object Group"
                name="objectGroup"
                autoComplete="objectGroup"
                className="fieldInput"
              />
            )}
          />
        </div>
        <div className="twoInLine">
          <Autocomplete
            options={dataLists.specieName}
            getOptionLabel={(option) => option}
            onChange={(e, value) => handleAutocompleteChange('specie', value || '')}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Specie Name"
                name="specie"
                autoComplete="specie"
                className="fieldInput"
              />
            )}
          />

          <Autocomplete
            options={dataLists.imageLocation}
            getOptionLabel={(option) => option}
            onChange={(e, value) => handleAutocompleteChange('imgLocation', value || '')}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Image Location"
                name="imgLocation"
                autoComplete="imgLocation"
                className="fieldInput"
              />
            )}
          />
        </div>
        <br />
        <div>
          <label className="lblButtonsGroup">Photo Took In Artificial Reef:</label>

          <ButtonGroup size="large" color="inherit" aria-label="Large button group">
            {isArButtonGroup.map((button, index) => (
              <Button
                key={index}
                onClick={() => handleButtonClick(button, 'reef')}
                variant={selectedReef === button ? 'contained' : 'outlined'}
              >
                {button}
              </Button>
            ))}
          </ButtonGroup>
        </div>
        <br />
        <div className="twoInLine">
          <Autocomplete
            options={dataLists.ReportType}
            getOptionLabel={(option) => option}
            onChange={(e, value) => handleAutocompleteChange('reportType', value || '')}
            renderInput={(params) => (
              <TextField
                {...params}
                required
                label="Report Type"
                name="reportType"
                autoComplete="reportType"
                className="fieldInput"
              />
            )}
          />

          <Autocomplete
            options={dataLists.typeOfDive}
            getOptionLabel={(option) => option}
            onChange={(e, value) => handleAutocompleteChange('typeOfDive', value || '')}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Type Of Dive"
                name="typeOfDive"
                autoComplete="typeOfDive"
                className="fieldInput"
              />
            )}
          />
        </div>

        <div className="parentContainer">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer components={['DatePicker']} valueType="date">
              <div>
                <DatePicker
                  label="Date Of Dive"
                  id="dateDive"
                  name="dateDive"
                  onChange={handleDateChange}
                  format="DD/MM/YYYY"
                  required
                  inputStyle={{
                    color: insertData.errors.dateDive ? 'red' : selectedDate ? 'blue' : '#1675E8',
                  }}
                  slotProps={{
                    textField: {
                      error: insertData.errors.dateDive,
                      helperText: insertData.errors.dateDive && 'Invalid dive date',
                    },
                    InputProps: {
                      style: {
                        color: selectedDate ? 'blue' : '#1675E8',
                        fontWeight: selectedDate ? 'bold' : 'normal',
                      },
                    },
                  }}
                />
              </div>
            </DemoContainer>
          </LocalizationProvider>
        </div>
        <br />
        <div>
          <label className="lblButtonsGroup">Dive Took Place During:</label>

          <ButtonGroup size="large" color="inherit" aria-label="Large button group">
            {timeButtons.map((button, index) => (
              <Button
                key={index}
                onClick={() => handleButtonClick(button, 'time')}
                variant={selectedTime === button ? 'contained' : 'outlined'}
              >
                {button}
              </Button>
            ))}
          </ButtonGroup>
        </div>
        <br />
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <label className="lblButtonsGroup">Dive Rank:</label>
          <Stack spacing={1}>
            <Rating
              name="size-large"
              defaultValue={insertData.rank}
              size="large"
              onChange={handleRankChange}
            />
          </Stack>
        </div>
        <br />
        <div>
          <TextField
            label="Max Depth (meters)"
            type="text"
            id="maxDepth"
            name="maxDepth"
            onChange={handleInputChange}
            error={insertData.errors.maxDepth}
            helperText={insertData.errors.maxDepth && 'only numbers higher than 0'}
            className="numbersField"
          />

          <TextField
            label="Distance (meters)"
            type="text"
            id="distance"
            name="distance"
            onChange={handleInputChange}
            error={insertData.errors.distance}
            helperText={insertData.errors.distance && 'number higher than 0'}
            className="numbersField"
          />

          <TextField
            label="Temperature (celsius)"
            type="text"
            id="temp"
            name="temp"
            onChange={handleInputChange}
            error={insertData.errors.temp}
            helperText={insertData.errors.temp && 'temp is a number height than 0'}
            className="numbersField"
          />
        </div>
        <div>
          <label htmlFor="uploadeImage" className="lblButtonsGroup">
            Upload an image
          </label>
          <Button onClick={handleViewChange}>
            {currentView === 'image'
              ? 'Switch to Camera'
              : currentView === 'camera'
                ? 'Back to Files'
                : 'Add Image'}
          </Button>

          {currentView === 'camera' && <CameraCapture sendImage={sendImage} />}
          {currentView === 'image' && (
            <Stack sx={{ alignContent: 'center' }}>
              {currentView === 'image' && (
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={onSelectFile}
                  id="uploadeImage"
                  name="uploadeImage"
                  required
                />
              )}
              {currentView === 'image' && (
                <div className="image-placeholder">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" />
                  ) : (
                    <div className="placeholder-icon">
                      <IconButton size="large" onClick={() => fileInputRef.current.click()}>
                        <AddAPhotoIcon fontSize="inherit" />
                      </IconButton>
                    </div>
                  )}
                </div>
              )}
            </Stack>
          )}
        </div>
        <br />
        <div>
          <label className="lblButtonsGroup" htmlFor="userDescription">
            Tell us about your diving trip:
          </label>
          <textarea
            id="userDescription"
            name="userDescription"
            rows={3}
            className="custom-textarea"
            onChange={(e) => handleTextareaChange(e.target.value)}
          />
        </div>
        <br />
        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity="success"
            sx={{ width: '100%', minHeight: '64px', padding: '20px' }}
          >
            Your Diving Details Saved, Thank You
          </Alert>
        </Snackbar>
        <div className="insideContiner">
          <Button size="large" type="submit" variant="outlined" endIcon={<SendIcon />}>
            Submit
          </Button>
        </div>
        <br />
      </form>

      <h2>Thank you for your contribution!</h2>
    </div>
  );
}
