import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import SupervisorVendorDisputes from '@/supervisor/supervisor-vendor-disputes';

function SupervisorVendorDisputesPage() {
  return (
    <>
      <Head>
        <title>Vendor Disputes - WO Supervisor</title>
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
            <SupervisorVendorDisputes />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

SupervisorVendorDisputesPage.getLayout = (page) => (
  <SidebarLayout userRole="supervisor">{page}</SidebarLayout>
);

export default SupervisorVendorDisputesPage;
