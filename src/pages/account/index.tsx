import { Box, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { db } from "../../config/Firebase";
import { useEffect, useState } from "react";
import { getDocs, collection } from "firebase/firestore";

export interface AccountProps {
  id?: string;
  name: string;
  size: number;
  magic: string;
}

const Account = () => {
  const theme = useTheme();

  const [accounts, setAccounts] = useState<AccountProps[]>([]);
  const getAccountList = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "accounts"));
      // @ts-expect-error avoid this eror
      const accountData: AccountProps[] = querySnapshot.docs.map((doc) => {
        console.log(doc.id);
        return {
          id: doc.id,
          ...doc.data(),
        };
      });
      setAccounts(accountData);

      console.log(`get accounts: `, accountData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getAccountList();
  }, []);

  const colors = tokens(theme.palette.mode);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const columns: any = [
    { field: "id", headerName: "ID", align: "left" },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      cellClassName: "name-column--cell",
      align: "left",
    },
    {
      field: "magic",
      headerName: "Magic",
      type: "string",
      headerAlign: "left",
      align: "left",
    },
    {
      field: "size",
      headerName: "Size",
      type: "number",
      headerAlign: "left",
      align: "left",
    },
  ];

  return (
    <Box m="20px">
      <Header title="Accounts" subtitle="Managing the Accounts" />
      <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .name-column--cell": {
            color: colors.greenAccent[300],
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
        }}
      >
        <DataGrid checkboxSelection rows={accounts} columns={columns} />
      </Box>
    </Box>
  );
};

export default Account;
