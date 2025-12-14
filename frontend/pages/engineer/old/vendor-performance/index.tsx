import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import EngineerVendorPerformance from '@/engineer/old/engineer-vendor-performance';

function EngineerVendorPerformancePage() {
  return (
    <>
      <Head>
        <title>Vendor Performance - Engineer Portal</title>
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
            <EngineerVendorPerformance />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

EngineerVendorPerformancePage.getLayout = (page) => (
  <SidebarLayout userRole="engineer">{page}</SidebarLayout>
);

export default EngineerVendorPerformancePage;
