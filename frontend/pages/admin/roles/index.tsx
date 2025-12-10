import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import UsersTable from '@/admin/roles';

function ApplicationsTransactions() {
  return (
    <>
      <Head>
        <title>Transactions - Applications</title>
      </Head>
      <Container maxWidth="lg">
        <Grid
          container
          direction="row"
          justifyContent="center"
          alignItems="stretch"
          spacing={3}
        >
          <Grid item xs={12}>
            <UsersTable />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

ApplicationsTransactions.getLayout = (page) => (
  <SidebarLayout>{page}</SidebarLayout>
);

export default ApplicationsTransactions;
