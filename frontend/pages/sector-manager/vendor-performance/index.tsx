import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import SectorManagerVendorPerformance from '@/sector-manager/sector-manager-vendor-performance';

function SectorManagerVendorPerformancePage() {
  return (
    <>
      <Head>
        <title>Vendor Performance - Sector Manager</title>
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
            <SectorManagerVendorPerformance />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

SectorManagerVendorPerformancePage.getLayout = (page) => (
  <SidebarLayout userRole="sector-manager">{page}</SidebarLayout>
);

export default SectorManagerVendorPerformancePage;
