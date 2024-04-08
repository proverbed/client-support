import {
  Box, useTheme, Button, Stack,
} from '@mui/material';
import {
  GridRowsProp,
  GridRowModesModel,
  GridRowModes,
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridActionsCellItem,
  GridEventListener,
  GridRowId,
  GridRowModel,
  GridRowEditStopReasons,
} from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import {
  getDoc,
  getDocs,
  collection,
  doc,
  updateDoc,
  setDoc,
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import { randomId } from '@mui/x-data-grid-generator';
import { db } from '../../config/Firebase.ts';
import Header from '../../components/Header.tsx';
import { tokens } from '../../theme.ts';

export interface AccountProps {
  isNew: boolean;
  id?: string;
  name: string;
  size: number;
  magic: number;
  drawdownLimit: number;
  profitTarget: number;
  riskPerTrade: number;
}

interface EditToolbarProps {
  setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
  setRowModesModel: (
    newModel: (oldModel: GridRowModesModel) => GridRowModesModel
  ) => void;
}

function Account() {
  const theme = useTheme();
  const navigate = useNavigate();

  const [rows, setRows] = useState<GridRowsProp[]>([]);

  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});

  const handleRowEditStop: GridEventListener<'rowEditStop'> = (
    params,
    event,
  ) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      // eslint-disable-next-line no-param-reassign
      event.defaultMuiPrevented = true;
    }
  };

  const handleEditClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  // const handleDeleteClick = (id: GridRowId) => () => {
  //   // @ts-expect-error avoid this eror
  //   const myFilteredItem = rows.filter((row) => row.id !== id);

  //   setRows(myFilteredItem);
  // };

  const handleCancelClick = (id: GridRowId) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });

    // @ts-expect-error avoid this eror
    const editedRow = rows.find((row) => row.id === id);

    // @ts-expect-error avoid this eror
    if (editedRow!.isNew) {
      // @ts-expect-error avoid this eror
      const myFilteredItem = rows.filter((row) => row.id !== id);

      setRows(myFilteredItem);
    }
  };

  const processRowUpdate = async (newRow: GridRowModel) => {
    const updatedRow = { ...newRow, isNew: false };

    const updateData = {
      ...newRow,
      magic: Number(newRow.magic),
    };

    // @ts-expect-error avoid this eror
    delete updateData.id;
    // @ts-expect-error avoid this eror
    delete updateData.isNew;

    try {
      const accountPath = `accounts/${newRow.id}`;
      const docSnap = await getDoc(doc(db, accountPath));

      if (docSnap.exists()) {
        await updateDoc(doc(db, accountPath), updateData);
      } else {
        // add it
        await setDoc(doc(db, accountPath), updateData);
      }
    } catch (err) {
      console.error(err);
    }

    // @ts-expect-error avoid this eror
    const myRows = rows.map((row) => (row.id === newRow.id ? updatedRow : row));

    // @ts-expect-error avoid this eror
    setRows(myRows);

    return updatedRow;
  };

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const getAccountList = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'accounts'));
      // @ts-expect-error avoid this eror
      const accountData: AccountProps[] = querySnapshot.docs.map((document) => ({
        id: document.id,
        ...document.data(),
      }));
      // @ts-expect-error avoid this eror
      setRows(accountData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getAccountList();
  }, []);

  const colors = tokens(theme.palette.mode);

  function EditToolbar(props: EditToolbarProps) {
    const { setRows, setRowModesModel } = props;

    const handleClick = () => {
      const id = randomId();
      setRows((oldRows) => [...oldRows, { id, name: '', isNew: true }]);
      setRowModesModel((oldModel) => ({
        ...oldModel,
        [id]: { mode: GridRowModes.Edit, fieldToFocus: 'name' },
      }));
    };

    return (
      <GridToolbarContainer>
        <Button color="inherit" startIcon={<AddIcon />} onClick={handleClick}>
          Add record
        </Button>
      </GridToolbarContainer>
    );
  }

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', align: 'left' },
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      cellClassName: 'name-column--cell',
      align: 'left',
      editable: true,
    },
    {
      field: 'magic',
      headerName: 'Magic',
      type: 'string',
      headerAlign: 'left',
      align: 'left',
      editable: true,
    },
    {
      field: 'drawdownLimit',
      headerName: 'Drawdown Limit',
      type: 'number',
      headerAlign: 'left',
      align: 'left',
      editable: true,
    },
    {
      field: 'profitTarget',
      headerName: 'Profit Target',
      type: 'number',
      headerAlign: 'left',
      align: 'left',
      editable: true,
    },
    {
      field: 'riskPerTrade',
      headerName: 'Risk Per Trade',
      type: 'number',
      headerAlign: 'left',
      align: 'left',
      editable: true,
    },
    {
      field: 'size',
      headerName: 'Size',
      type: 'number',
      headerAlign: 'left',
      align: 'left',
      editable: true,
    },
    {
      field: 'action',
      headerName: '',
      sortable: false,
      renderCell: (params) => {
        const onClick = () => {
          const currentRow = params.row.id;
          navigate(`/dashboard/${currentRow}`);
        };

        return (
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              color="secondary"
              size="small"
              onClick={onClick}
            >
              Dashboard
            </Button>
          </Stack>
        );
      },
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      cellClassName: 'actions',
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              icon={<SaveIcon />}
              label="Save"
              onClick={handleSaveClick(id)}
            />,
            <GridActionsCellItem
              icon={<CancelIcon />}
              label="Cancel"
              className="textPrimary"
              onClick={handleCancelClick(id)}
              color="inherit"
            />,
          ];
        }

        return [
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            className="textPrimary"
            onClick={handleEditClick(id)}
            color="inherit"
          />,
          // <GridActionsCellItem
          //   icon={<DeleteIcon />}
          //   label="Delete"
          //   onClick={handleDeleteClick(id)}
          //   color="inherit"
          // />,
        ];
      },
    },
  ];

  return (
    <Box m="20px">
      <Header title="Accounts" subtitle="Managing the Accounts" />
      <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          '& .MuiDataGrid-root': {
            border: 'none',
          },
          '& .MuiDataGrid-cell': {
            borderBottom: 'none',
          },
          '& .name-column--cell': {
            color: colors.greenAccent[300],
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: colors.blueAccent[700],
            borderBottom: 'none',
          },
          '& .MuiDataGrid-virtualScroller': {
            backgroundColor: colors.primary[400],
          },
          '& .MuiDataGrid-footerContainer': {
            borderTop: 'none',
            backgroundColor: colors.blueAccent[700],
          },
          '& .MuiCheckbox-root': {
            color: `${colors.greenAccent[200]} !important`,
          },
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          editMode="row"
          rowModesModel={rowModesModel}
          onRowModesModelChange={handleRowModesModelChange}
          onRowEditStop={handleRowEditStop}
          processRowUpdate={processRowUpdate}
          slots={{
            toolbar: EditToolbar,
          }}
          slotProps={{
            toolbar: { setRows, setRowModesModel },
          }}
        />
      </Box>
    </Box>
  );
}

export default Account;
