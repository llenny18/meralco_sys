import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import SupervisorVendorPerformance from '@/supervisor/supervisor-vendor-performance';

function SupervisorVendorPerformancePage() {
  return (
    <>
      <Head>
        <title>Vendor Performance - WO Supervisor</title>
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
            <SupervisorVendorPerformance />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

SupervisorVendorPerformancePage.getLayout = (page) => (
  <SidebarLayout userRole="supervisor">{page}</SidebarLayout>
);

export default SupervisorVendorPerformancePage;
