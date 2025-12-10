import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import SupervisorPayments from '@/supervisor/supervisor-payments';

function SupervisorPaymentsPage() {
  return (
    <>
      <Head>
        <title>Payments - WO Supervisor</title>
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
            <SupervisorPayments />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

SupervisorPaymentsPage.getLayout = (page) => (
  <SidebarLayout userRole="supervisor">{page}</SidebarLayout>
);

export default SupervisorPaymentsPage;
