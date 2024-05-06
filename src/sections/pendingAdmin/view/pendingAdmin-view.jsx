/* eslint-disable react-hooks/exhaustive-deps */
  import { useState, useEffect } from 'react';

  import Card from '@mui/material/Card';
  import Stack from '@mui/material/Stack';
  import Table from '@mui/material/Table';
  import Button from '@mui/material/Button';
  import Container from '@mui/material/Container';
  import TableBody from '@mui/material/TableBody';
  import Typography from '@mui/material/Typography';
  import DatasetIcon from '@mui/icons-material/Dataset';
  import TableContainer from '@mui/material/TableContainer'; import TablePagination from '@mui/material/TablePagination';

  import Scrollbar from 'src/components/scrollbar';

  // import AllDataPage from 'src/sections/allData/view/allData-view';

  import EditData from './handle-edit-data'; import TableEmptyRows from '../table-empty-rows';
  import UserTableRow from '../pendingAdmin-table-row'; import UserTableHead from '../pendingAdmin-table-head';
// import UserTableToolbar from '../user-table-toolbar';
  import { emptyRows, applyFilter, getComparator } from '../utils';


  export default function PendingAdminView() {
    const [page, setPage] = useState(0);
    const [order, setOrder] = useState('asc');
    // const [selected, setSelected] = useState([]);
    const [orderBy, setOrderBy] = useState('name');
    // const [filterName, setFilterName] = useState('');
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [usersData, setUsersData] = useState([]);
    const [openEditData, setOpenEditData] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);

    const handleSort = (event, id) => {
      const isAsc = orderBy === id && order === 'asc';
      if (id !== '') {
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(id);
      }
    };
    

    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await fetch('http://localhost:8000/api/pendings_dives');
          if (!response.ok) {
            throw new Error('Failed to fetch data');
          }
          const responseData = await response.json();
          const { pendingDives } = responseData.data;
          setUsersData(pendingDives); // Set the fetched data to state
          
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };

      fetchData();

    }, []);


    const handleChangePage = (event, newPage) => {
      setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
      setPage(0);
      setRowsPerPage(parseInt(event.target.value, 10));
    };

    // eslint-disable-next-line no-unused-vars
  const formatDateTime = (dateTimeString) => {
    // Regular expressions to match the expected date formats
     const dateFormatRegex1 = /^\w{3} \w{3} \d{2} \d{4} \d{2}:\d{2}:\d{2} GMT[+-]\d{4} \([\w\s]+\)$/;
     const dateFormatRegex2 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
 
     if (!dateFormatRegex1.test(dateTimeString) && !dateFormatRegex2.test(dateTimeString)) {
       return dateTimeString; // Return the original string if the format doesn't match
     }
 
 
     const dateTime = new Date(dateTimeString);
     
     // Format the date
     const dateFormatter = new Intl.DateTimeFormat('en-GB', {
       year: 'numeric',
       month: '2-digit',
       day: '2-digit',
     });
     const formattedDate = dateFormatter.format(dateTime);
     
     // Format the time
     const timeFormatter = new Intl.DateTimeFormat('en-GB', {
       hour: '2-digit',
       minute: '2-digit',
     });
     const formattedTime = timeFormatter.format(dateTime);
     
     // Combine date and time
     return `${formattedDate}, ${formattedTime}`;
   };
    
    const dataFiltered = applyFilter({
      inputData: usersData,
      comparator: getComparator(order, orderBy),
      // filterName,
    });

    const handleEditClick = (pendingData) => {
      console.log("hello");
      setOpenEditData(true);
      setSelectedRow(pendingData);
      console.log(pendingData)
      // console.log("selected row", selectedRow);
      // console.log("file", pendingData.file);
    };

    const handleDeleteClick = async (pendingData) => {
      console.log("pending data recived function is:", pendingData)
      console.log(pendingData._id);
      try {
        // Make a request to your server to delete the row
        const response = await fetch(`http://localhost:8000/api/pendings_dives/${pendingData._id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Failed to delete row');
        }

        // Remove the deleted row from the usersData state variable
        setUsersData(prevData => prevData.filter(row => row._id !== pendingData._id));
        // Find the index of the object with the targetId
        const index = usersData.findIndex(obj => obj._id === pendingData._id);

        // Remove the object if found
        if (index !== -1) {
          usersData.splice(index, 1);
        }
        // You might want to reload the data or remove the row from the state directly
      } catch (error) {
        console.error('Error deleting row:', error);
      }
 
      
      console.log(usersData)

    };

    const handleCloseEditData = () => {
      setOpenEditData(false);
      // handleDeleteClick(selectedRow); // Update pendingData with the latest selectedRow
    };


    const handleAllDataButtonClick = () => {
      window.open('/all-data', '_blank'); // Replace '/all-data-page-url' with the actual URL of your All Data page
    };

    return (
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4">{`Pending Dives For Admin's Approval`}</Typography>


          <Button variant="contained" color="inherit" startIcon={<DatasetIcon icon="eva:plus-fill" />} onClick={handleAllDataButtonClick}>
            All Data
          </Button>
          
        </Stack>

        <Card>

          <Scrollbar>
            <TableContainer sx={{ overflow: 'unset' }}>
              <Table sx={{ minWidth: 800 }}>
                <UserTableHead
                  order={order}
                  orderBy={orderBy}
                  rowCount={usersData.length}
                  // numSelected={selected.length}
                  onRequestSort={handleSort}
                  // onSelectAllClick={handleSelectAllClick}
                  headLabel={[
                    {id: ''},
                    { id: 'loggingDate', label: 'logged Data' },
                    { id: 'dateDive', label: 'Date Dive' },
                    { id: 'timeDive', label: 'Time Dive' },
                    { id: 'site', label: 'Site' },
                    { id: 'objectGroup', label: 'Object Group' },
                    // { id: 'specie', label: 'Specie' },
                    // { id: 'arReef', label: 'is AR Reef?' },
                    // { id: 'imgLocation', label: 'Img Location' },
                    { id: 'reportType', label: 'Report Type' },
                    // { id: 'typeOfDive', label: 'Type of Dive' },
                    // { id: 'rank', label: 'Rank' },
                    // { id: 'userDescription', label: 'User Description' },
                    // { id: 'maxDepth', label: 'Max Depth' },
                    // { id: 'distance', label: 'Distance' },
                    // { id: 'temp', label: 'Temp' },
                  
                    { id: '' },
                    // { id: 'file', label: 'File' },
                  ]}
                />
                <TableBody>
                  {dataFiltered
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => (
                      
                      <UserTableRow
                        key={row._id}
                        loggingDate={row.loggingDate}
                        dateDive={row.date}
                        // loggingDate={formatDateTime(row.loggingDate)}
                        // dateDive={formatDateTime(row.date)}
                        timeDive={row.time}
                        site={row.diveSite}
                        objectGroup={row.objectGroup}
                        specie={row.specie}
                        reportType={row.reportType}
                        
                        // handleClick={(event) => handleClick(event, row.name)}
                        // onEditClick={handleEditClick} // passed as a prop
                        onEditClick={() => handleEditClick(row)}
                        onDeleteClick={() => handleDeleteClick(row)}
                      />
                    ))}

                  <TableEmptyRows
                    height={77}
                    emptyRows={emptyRows(page, rowsPerPage, usersData.length)}
                  />

                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>

          <TablePagination
            page={page}
            component="div"
            count={usersData.length}
            rowsPerPage={rowsPerPage}
            onPageChange={handleChangePage}
            rowsPerPageOptions={[5, 10, 25]}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
        <EditData open={openEditData} handleClose={handleCloseEditData} pendingData={selectedRow} onDeleteClick={handleDeleteClick} />

      </Container>
    );
  }
