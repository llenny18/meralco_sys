import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import SupervisorInvoices from '@/engineer/supervisor-invoices';

function SupervisorInvoicesPage() {
  return (
    <>
      <Head>
        <title>Invoices - WO Supervisor</title>
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
            <SupervisorInvoices />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

SupervisorInvoicesPage.getLayout = (page) => (
  <SidebarLayout userRole="supervisor">{page}</SidebarLayout>
);

export default SupervisorInvoicesPage;
