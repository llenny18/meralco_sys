import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import AuditLogs from '@/admin/admin-penalties';

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
            <AuditLogs />
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
